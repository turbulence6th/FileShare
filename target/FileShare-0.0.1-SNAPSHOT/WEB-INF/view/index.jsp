<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<title>File Share</title>
		
		<link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css">
		<link rel="stylesheet" type="text/css" href="/css/style.css">
		
		<script type="text/javascript" src="/js/jquery-3.2.0.min.js"></script>
		<script type="text/javascript" src="/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="/js/websocket.js"></script>
		
	</head>
	<body>
		<div class="container">
			<div class="progress">
				<div class="progress-bar progress-bar-striped active" role="progressbar" style="width:50%">
			    	70%
			  	</div>
			</div>
			<input type="file" id="file" />
		</div>
		
		<script>
			$('#file').change(function() {
				var file = document.getElementById('file').files[0];
				websocket.send(JSON.stringify({
					action: "share",
					filename: file.name,
					contentLength: file.size
				}));
			});
		</script>
	</body>
</html>