package com.turbulence6th.fileshare;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;

@WebServlet(value = "/upload", asyncSupported = true)
public class UploadServlet extends HttpServlet {

	private static final long serialVersionUID = 1351036881819318646L;

	@SuppressWarnings("unchecked")
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String uuid = request.getParameter("uuid");
		ServletContext context = getServletContext();
		Map<String, WebSocket> files = (Map<String, WebSocket>) context.getAttribute("files");
		WebSocket webSocket = files.get(uuid);
		if(webSocket != null && webSocket.hasFile()) {
			JsonObject message = new JsonObject();
			message.addProperty("action", "download");
			message.addProperty("chunk", Integer.parseInt(request.getParameter("chunk")));
			message.addProperty("blob", request.getParameter("blob"));
			webSocket.getHandlers().forEach(handler -> {
				handler.onMessage(message.toString());
			});
		}
	}
	
}
