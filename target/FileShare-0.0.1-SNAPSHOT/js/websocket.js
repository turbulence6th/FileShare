var websocket = new WebSocket(":protocol:/:ip::port/websocket"
		.replace(":protocol", window.location.protocol=="http:"?"ws":"wss")
		.replace(":ip", window.location.hostname)
		.replace(":port", window.location.port));

function ping(time) {
	new Promise((resolve) => setTimeout(resolve, time)).then(() => {
		var request = {
				action: 'ping'
		};
		
		websocket.send(JSON.stringify(request));
		ping(time);
	});
}

ping(25 * 1000);

websocket.addEventListener("message", message => {
	var data = JSON.parse(message.data);
	console.log(message.data);
	if(data.action == 'share') {
		console.log(data.uuid);
	}
	
	if(data.action == 'download') {
		var chunk = data.chunk;
		var file = document.getElementById('file').files[0];
		var blob = file.slice(chunk * 1024 * 4, (chunk + 1) * 1024 * 4);
		var reader = new FileReader();
		reader.onload = function(event) {
			websocket.send(JSON.stringify({
				action: 'download',
				chunk: data.chunk,
				blob: btoa(event.target.result)
			}));
		};
		reader.readAsBinaryString(blob);
	}
});

