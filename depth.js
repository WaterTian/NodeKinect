var Kinect2 = require('kinect2'),
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
	zlib = require('zlib');

var kinect = new Kinect2();



if(kinect.open()) {
	server.listen(8888);
	console.log('Server listening on port 8888');

	app.get('/', function(req, res) {
		res.sendFile(__dirname + '/html/index.html');
	});
	app.use(express.static(__dirname + '/html'));



    var depthMin = 500;
	var depthMax = 1000;
	var size = 1;
	io.sockets.on('connection', function (socket){

	    socket.on('setDepthMin', function(data){
	        depthMin = data;
	    });
	    socket.on('setDepthMax', function(data){
	        depthMax = data;
	    });

	    socket.on('setSize', function(data){
	    	size = data;
	    });


	    socket.on('setDepthStr', function(data){
	        io.sockets.emit('finalDepthStr', data);
	    });

	});


	kinect.on('multiSourceFrame', function(frame){
		var depthBuffer = frame.rawDepth.buffer;
		var bodyFrame = frame.body;


		var j = 0;
		var depthArr = new Uint16Array(depthBuffer.length*0.5);

		for (var i = 0; i < depthBuffer.length; i += 2*size) {
			var depth = (depthBuffer[i + 1] << 8) + depthBuffer[i]; //get  data from uint16 buffer
			if (depth <= depthMin || depth >= depthMax) depth = 0;
			else depth -=depthMin;

			depthArr[j] = depth;
			j++;
		}

		// console.log(depthArr.length);

		zlib.deflate(depthArr.buffer, function(err, result) {
			if (!err) {
				var _b = result.toString('base64');
				io.sockets.emit('depthFrame', _b);
				// io.sockets.emit('depthFrame', result);
			} else {
				console.log(err);
			}
		});


		io.sockets.emit('bodyFrame', bodyFrame);
	});

	kinect.openMultiSourceReader({
		frameTypes: Kinect2.FrameType.rawDepth | Kinect2.FrameType.body 
	});

}




