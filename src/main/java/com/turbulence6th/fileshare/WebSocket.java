package com.turbulence6th.fileshare;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

import javax.servlet.ServletContext;
import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@ServerEndpoint(value = "/websocket", configurator = ServletAwareConfig.class)
public class WebSocket {

	private ServletContext context;
	
	private String uuid;
	
	private String filename;
	
	private int contentLength;
	
	private List<WebSocketMessageHandler> handlers;
	
	private Session session;

	@OnOpen
	public void handleOpen(Session session, EndpointConfig config) throws IOException {
		this.context = (ServletContext) config.getUserProperties().get("servletContext");
		this.handlers = new CopyOnWriteArrayList<>();
		this.session = session;
	}

	@SuppressWarnings("unchecked")
	@OnMessage(maxMessageSize = 1024 * 8)
	public void handleMessage(Session session, String message) throws IOException {
		System.out.println(message);
		Map<String, WebSocket> files = (Map<String, WebSocket>) this.context.getAttribute("files");
		JsonObject request = new JsonParser().parse(message).getAsJsonObject();
		if(request.get("action").getAsString().equals("share")) {
			this.uuid = UUID.randomUUID().toString();
			this.filename = request.get("filename").getAsString();
			this.contentLength = request.get("contentLength").getAsInt();
			files.put(uuid, this);
			JsonObject response = new JsonObject();
			response.addProperty("action", "share");
			response.addProperty("uuid", this.uuid);
			session.getBasicRemote().sendText(response.toString());
		}
		
		this.handlers.forEach(handler -> handler.onMessage(message));
		
	}

	@SuppressWarnings("unchecked")
	@OnClose
	public void handleClose(Session session) {
		if(this.uuid != null) {
			Map<String, Session> files = (Map<String, Session>) this.context.getAttribute("files");
			files.remove(uuid);
		}	
	}

	@OnError
	public void handleError(Throwable t) {
		t.printStackTrace();
	}
	
	public void addHandler(WebSocketMessageHandler handler) {
		this.handlers.add(handler);
	}
	
	public void removeHandler(WebSocketMessageHandler handler) {
		this.handlers.remove(handler);
	}
	
	public boolean hasFile() {
		return this.uuid != null;
	}
	
	public Session getSession() {
		return this.session;
	}
	
	public String getFilename() {
		return this.filename;
	}
	
	public int getContentLength() {
		return this.contentLength;
	}

}
