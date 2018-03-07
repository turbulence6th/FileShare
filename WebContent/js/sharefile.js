class ShareFile {
	constructor(file){
		this.file = file;
		this.websocket = new WebSocket(":protocol:/:ip::port/websocket"
				.replace(":protocol", window.location.protocol == "http:" ? "ws" : "wss")
				.replace(":ip", window.location.hostname)
				.replace(":port", window.location.port));
		
		this.websocket.addEventListener('open', () => this.init());
		ShareFile.count++;
		this.uploads = {};
		this.activeUploads = 0;
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
				if(this.websocket.readyState == 1) {
					this.websocket.send(JSON.stringify(request));
					this.ping(time);
				}
			});
		}
	}
	
	event(message) {
		var data = JSON.parse(message.data);
		if(data.action == 'share') {
			this.uuid = data.uuid;
			this.dom = $("<tr>" +
				"<td>" + this.file.name + "</td>" +
				"<td>" + this.size() + "</td>" +
				"<td>" + location.origin + "/file/" + this.uuid + "</td>" +
				"<td>" + 
					"<button class=\"btn btn-default\">" + 
						"<span class=\"glyphicon glyphicon-remove-circle gi-2x\"></span>" + 
					"</button>" + 
				"</td>" +
			"</tr>");
			this.dom.children('td').children('button').click(() => {
				this.unshare();
				if(ShareFile.count == 0) {
					$('#shares').addClass('hidden');
				}
			});
			
			$('#shares tbody').append(this.dom);
			if(ShareFile.count == 1) {
				$('#shares').removeClass('hidden');
			}
		}
		
		else if(data.action == 'download') {
			var that = this;
			var chunk = data.chunk;
			
			if(chunk == 0) {
				this.uploads[data.ip] = $("<tr>" +
					"<td style=\"width: 20%\">" + this.file.name + "</td>" +
					"<td style=\"width: 20%\">" + data.ip.substring(0, data.ip.lastIndexOf(':')) + "</td>" +
					"<td style=\"width: 50%\">" + 
						"<div class=\"progress\">" + 
							"<div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" style=\"width:0%\">" +
								"70%" +
							"</div>" +
						"</div>" +
					"</td>" +
					"<td style=\"width: 10%\">" + 
						"<button class=\"btn btn-default\" disabled>" + 
							"<span class=\"glyphicon glyphicon-remove-circle gi-2x\"></span>" + 
						"</button>" + 
					"</td>" +
				"</tr>");
				this.uploads[data.ip].children('td').children('button').click(() => {
					this.uploads[data.ip].remove();
					delete this.uploads[data.ip];
					ShareFile.uploads--;
					if(ShareFile.uploads == 0) {
						$('#uploads').addClass('hidden');
					}
				});
				$('#uploads').append(this.uploads[data.ip]);
				ShareFile.uploads++;
				ShareFile.activeUploads++;
				this.activeUploads++;
				
				if(ShareFile.uploads == 1) {
					$('#uploads').removeClass('hidden');
				}
			}
			
			else {
				var percent = Math.floor(chunk * ShareFile.chunkSize * 100 / this.file.size);
				var percent = percent > 100 ? 100 : percent;
				if(percent == 100) {
					this.uploads[data.ip].children('td').children('button').removeAttr('disabled');
				}
				var progress = this.uploads[data.ip].children('td').children('.progress').children('.progress-bar');
				progress.css('width', percent + '%');
				if(percent == 100) {
					progress.text('completed');
					ShareFile.activeUploads--;
					this.activeUploads--;
				}
				
				else {
					progress.text(percent + '%');
				}
			}
			
			var blob = this.file.slice(chunk * ShareFile.chunkSize, (chunk + 1) * ShareFile.chunkSize);
			var reader = new FileReader();
			reader.onload = function(event) {
				if(that.websocket.readyState == 1) {
					that.websocket.send(JSON.stringify({
						action: 'download',
						chunk: data.chunk,
						blob: btoa(event.target.result)
					}));
				}
			};
			reader.readAsBinaryString(blob);
		}
		
		else if(data.action == 'terminate') {
			this.uploads[data.ip].children('td').children('button').removeAttr('disabled');
			var progress = this.uploads[data.ip].children('td').children('.progress').children('.progress-bar');
			progress.text('failed');
			ShareFile.activeUploads--;
			this.activeUploads--;
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
		this.dom.remove();
		ShareFile.count--;
		for(var key in this.uploads) {
			var u = this.uploads[key];
			ShareFile.activeUploads -= this.activeUploads;
			u.children('td').children('button').removeAttr('disabled');
			var progress = u.children('td').children('.progress').children('.progress-bar');
			progress.text('failed');
		}
	}
}

ShareFile.chunkSize = 1024 * 5;
ShareFile.count = 0;
ShareFile.uploads = 0;
ShareFile.activeUploads = 0;
