var Kinect2 = require('kinect2'),
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
	zlib = require('zlib');

var kinect = new Kinect2();



if(kinect.open()) {
	server.listen(8000);
	console.log('Server listening on port 8000');
	console.log('Point your browser to http://127.0.0.1:8000');

	app.get('/', function(req, res) {
		res.sendFile(__dirname + '/html/index.html');
	});
	app.use(express.static(__dirname + '/html'));


    var emitDepth = false;
	var emitColor = false;
	io.sockets.on('connection', function (socket){
	    socket.on('startColor', function(data){
	        emitColor = true;
	        console.log("startColor is true");
	    });
	    socket.on('startDepth', function(data){
	        emitDepth = true;
	        console.log("startDepth");
	    });
	    socket.on('stopDepth', function(data){
	        emitDepth = false;
	        console.log("stopDepth");
	    });
	});


	kinect.on('multiSourceFrame', function(frame){
		var depthBuffer = frame.rawDepth.buffer;
		var colorBuffer = frame.depthColor.buffer;
		var bodyFrame = frame.body;
		


		if(emitDepth)
		{
			var j = 0;
			var depthArr = new Uint16Array(depthBuffer.length*0.5);
			for(var i = 0; i < depthBuffer.length; i+=2) {
				var depth = (depthBuffer[i+1] << 8) + depthBuffer[i]; //get uint16 data from buffer
				if(depth <= 2000 || depth >= 4000) depth = 0;
				depthArr[j] = depth;
				j++;
			}

			var buf = new Buffer( depthArr.buffer);
			zlib.deflate(buf, function(err, result){
				if(!err) {
					io.sockets.emit('depthFrame', result);
				}else{
					console.log(err);
				}
			});

		}

		if(emitColor)
		{
			var buf = new Buffer( colorBuffer);
			zlib.deflate(buf, function(err, result){
				if(!err) {
					var buffer = result.toString('base64');
					io.sockets.emit('colorFrame', buffer);
				}
			});

			emitColor = false;
		}



		io.sockets.emit('bodyFrame', bodyFrame);

	});

	kinect.openMultiSourceReader({
		frameTypes: Kinect2.FrameType.rawDepth | Kinect2.FrameType.body | Kinect2.FrameType.depthColor
	});

}











