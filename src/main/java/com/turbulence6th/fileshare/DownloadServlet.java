package com.turbulence6th.fileshare;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

import javax.servlet.AsyncContext;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.websocket.Session;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@WebServlet(value = "/file/*", asyncSupported = true)
public class DownloadServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	@SuppressWarnings("unchecked")
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String uuid = request.getPathInfo().replace("/", "");
		ServletContext context = getServletContext();
		Map<String, WebSocket> files = (Map<String, WebSocket>) context.getAttribute("files");
		WebSocket webSocket = files.get(uuid);
		if (webSocket != null && webSocket.hasFile()) {
			Session session = webSocket.getSession();
			response.setHeader("Content-disposition","attachment; filename=" + webSocket.getFilename());
			response.setHeader("Content-Length", String.valueOf(webSocket.getContentLength()));
			AsyncContext asyncContext = request.startAsync();
			asyncContext.setTimeout(0);
			asyncContext.start(() -> {
				try {
					ServletOutputStream out = asyncContext.getResponse().getOutputStream();
					
					ChunkInfo chunkInfo = new ChunkInfo();

					JsonObject requestFile = new JsonObject();
					requestFile.addProperty("action", "download");
					requestFile.addProperty("ip", request.getRemoteAddr());
					requestFile.addProperty("chunk", chunkInfo.chunk);

					session.getBasicRemote().sendText(requestFile.toString());

					WebSocketMessageHandler handler = new WebSocketMessageHandler() {
						
						@Override
						public void onMessage(String message) {
							JsonObject jsonMessage = new JsonParser().parse(message).getAsJsonObject();
							if (jsonMessage.get("action").getAsString().equals("download")) {
								int chunk = jsonMessage.get("chunk").getAsInt();
								String blob = jsonMessage.get("blob").getAsString();
								
								if(blob.isEmpty()) {
									webSocket.removeHandler(this);
									asyncContext.complete();
								}
								
								else if (chunk == chunkInfo.chunk) {
									byte[] buffer = Base64.getDecoder().decode(blob);
									try {
										out.write(buffer);
										chunkInfo.chunk++;
										requestFile.addProperty("chunk", chunkInfo.chunk);
										session.getBasicRemote().sendText(requestFile.toString());
									} catch (IOException e) {
										e.printStackTrace();
									}
								}
							}
						}
					}; 
					
					webSocket.addHandler(handler);

				}

				catch (IOException e) {
					e.printStackTrace();
				}
			});
		}

		else {
			response.getWriter().println("File not found");
		}

	}

	private static class ChunkInfo {
		private int chunk;
	}

}
