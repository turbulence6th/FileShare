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
			<div class="progress">
				<div class="progress-bar progress-bar-striped active" role="progressbar" style="width:50%">
			    	70%
			  	</div>
			</div>
			
			<div class="row">
				<div class="col-md-12">
					<table class="table table-striped hidden" id="shares">
						<thead>
					    	<tr>
					        	<th>File</th>
					        	<th>Size</th>
					        	<th>Link</th>
					    	</tr>
					    </thead>
					    <tbody>
					    </tbody>
					</table>
				</div>
			</div>
			
			<input type="file" id="file" />
		</div>
		<script>
			$('#file').change(function() {
				var file = document.getElementById('file').files[0];
				if(file) {
					new ShareFile(file);
				}
			});
		</script>
	</body>
</html>