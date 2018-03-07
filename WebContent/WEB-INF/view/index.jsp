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
		<script type="text/javascript" src="/js/sharefile.js"></script>
		
	</head>
	<body>
		<div class="container">
			
			<div class="wrapper row col-md-12">
				<div class="drop">
					<div class="cont">
				    	<i class="fa fa-cloud-upload"></i>
					    <div class="tit">
					    	Drag & Drop
					    </div>
					    <div class="desc">
					        Don't close your browser until files are completely sent
					    </div>
					    <div class="browse">
					        Share your files
					    </div>
				   	</div>
				    <input id="file" type="file" />
				</div>
			</div>
			
			<div class="row">
				<div class="col-md-12">
					<table class="table table-striped hidden" id="shares">
						<thead>
					    	<tr>
					        	<th>Shared File</th>
					        	<th>Size</th>
					        	<th>Link</th>
					        	<th>Remove</th>
					    	</tr>
					    </thead>
					    <tbody>
					    </tbody>
					</table>
				</div>
			</div>
			
			<div class="row">
				<div class="col-md-12">
					<table class="table table-striped hidden" id="uploads">
						<thead>
					    	<tr>
					        	<th>Uploaded File</th>
					        	<th>Receiver</th>
					        	<th>Sent</th>
					        	<th>Remove</th>
					    	</tr>
					    </thead>
					    <tbody>
					    </tbody>
					</table>
				</div>
			</div>
			
		</div>
		<script>
			$('#file').change(() => {
				var file = document.getElementById('file').files[0];
				if(file) {
					new ShareFile(file);
					$("#file").val('');
				}
			});
			
			window.onbeforeunload = () => {
				if(ShareFile.activeUploads > 0) {
					return true;
				}
			};
		</script>
	</body>
</html>