package com.turbulence6th.fileshare;

import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.websocket.HandshakeResponse;
import javax.websocket.server.HandshakeRequest;
import javax.websocket.server.ServerEndpointConfig;

public class ServletAwareConfig extends ServerEndpointConfig.Configurator {

    @Override
    public void modifyHandshake(ServerEndpointConfig config, HandshakeRequest request, HandshakeResponse response) {
    	Map<String, Object> userProperties = config.getUserProperties();
        HttpSession httpSession = (HttpSession) request.getHttpSession();
        userProperties.put("httpSession", httpSession);
        userProperties.put("servletContext", httpSession.getServletContext());
    }

}

