class ShareFile {
	constructor(file){
		this.file = file;
		this.websocket = new WebSocket(":protocol:/:ip::port/websocket"
				.replace(":protocol", window.location.protocol == "http:" ? "ws" : "wss")
				.replace(":ip", window.location.hostname)
				.replace(":port", window.location.port));
		
		this.websocket.addEventListener('open', () => this.init());
	}
	
	init() {
		this.websocket.send(JSON.stringify({
			action: 'share',
			filename: this.file.name,
			contentLength: this.file.size
		}));

		this.ping(25 * 1000);
		this.websocket.addEventListener('message', message => this.event(message));
	}
	
	ping(time) {
		if(this.websocket.readyState == 1) {
			return new Promise((resolve) => setTimeout(resolve, time)).then(() => {
				var request = {
						action: 'ping'
				};
				
				this.websocket.send(JSON.stringify(request));
				this.ping(time);
			});
		}
	}
	
	event(message) {
		var data = JSON.parse(message.data);
		if(data.action == 'share') {
			this.uuid = data.uuid;
			var tr = $("<tr>" +
						"<td>" + this.file.name + "</td>" +
						"<td>" + this.size() + "</td>" +
						"<td>" + location.origin + "/file/" + this.uuid + "</td>" +
					"</tr>");
			$('#shares tbody').append(tr);
			$('#shares').removeClass('hidden');
		}
		
		if(data.action == 'download') {
			var that = this;
			var chunk = data.chunk;
			var blob = this.file.slice(chunk * 1024 * 5, (chunk + 1) * 1024 * 5);
			var reader = new FileReader();
			reader.onload = function(event) {
				that.websocket.send(JSON.stringify({
					action: 'download',
					chunk: data.chunk,
					blob: btoa(event.target.result)
				}));
			};
			reader.readAsBinaryString(blob);
		}
	}
	
	size() {
		var size = this.file.size;
		if(size < 1024) {
			return size.toFixed(1) + " B";
		}
		
		size /= 1024;
		if(size < 1024) {
			return size.toFixed(1) + " KB";
		}
		
		size /= 1024;
		if(size < 1024) {
			return size.toFixed(1) + " MB";
		}
		
		size /= 1024;
		if(size < 1024) {
			return size.toFixed(1) + " GB";
		}
	}
	
	unshare() {
		this.websocket.close();
	}
}