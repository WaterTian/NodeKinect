import dat from 'dat-gui';
import io_c from 'socket.io-client';

const base64js = require('base64-js');
const pako = require('pako');



var That;
var gui;


var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var imageData = ctx.createImageData(canvas.width, canvas.height);


var canvasFinal = document.getElementById('final');
var ctxFinal = canvasFinal.getContext('2d');

window.params = {
	depthMin: 500,
	depthMax: 1000,

	area: {
		x: 0,
		y: 0,
		w: 212,
		h: 224,
	},
};


export default class Scene {


	constructor() {
		That = this;

		this.initGUI();

		this.socket = io_c('http://127.0.0.1:8888/');
		this.socket.on('depthFrame', this.depthFrame);
		// this.socket.on('finalDepthStr', function(_str){
		// 	// console.log(_str);
		// });
	}


	initGUI() {
		gui = new dat.GUI();
		// this.gui.close();

		document.querySelector(".ac").style.zIndex = 1000;

		gui.add(params, 'depthMin', 500, 5000).step(1).listen().onChange(function() {
			That.setDepth();
		});
		gui.add(params, 'depthMax', 500, 5000).step(1).listen().onChange(function() {
			That.setDepth();
		});


		var area = gui.addFolder('depthArea');
		area.add(params.area, 'x', 0, 512);
		area.add(params.area, 'y', 0, 424);
		area.add(params.area, 'w', 0, 512);
		area.add(params.area, 'h', 0, 424);

	}

	setDepth() {

		this.socket.emit('setDepthMin', params.depthMin);
		this.socket.emit('setDepthMax', params.depthMax);
	}

	depthFrame(depthBuffer) {

		let depth8Arr = pako.inflate(atob(depthBuffer));
		// console.log(depth8Arr);
		let depthNum = 0;
		for (let i = 0; i < depth8Arr.length * 0.5; i++) {
			let depth = (depth8Arr[depthNum + 1] << 8) + depth8Arr[depthNum];

			depth = depth / (params.depthMax - params.depthMin) * 255;

			// if(depth !=0) console.log(depth);

			if (depth > 0) depth = 255 - depth;

			imageData.data[i * 4] = depth;
			imageData.data[i * 4 + 1] = depth;
			imageData.data[i * 4 + 2] = depth;
			imageData.data[i * 4 + 3] = 0xff;

			depthNum += 2;
		}

		ctx.putImageData(imageData, 0, 0);

		That.drawFinal();
		That.drawLine();

	}


	drawLine() {
		ctx.beginPath();
		ctx.lineWidth = "2";
		ctx.strokeStyle = "green";
		ctx.rect(params.area.x, params.area.y, params.area.w, params.area.h);
		ctx.stroke();
	}

	drawFinal() {
		let _w = params.area.w;
		let _h = params.area.h;
		canvasFinal.width = _w;
		canvasFinal.height = _h;
		ctxFinal.clearRect(0, 0, _w, _h);
		let _imgData = ctx.getImageData(params.area.x, params.area.y, _w, _h);

		let pointStr = "";

		// for (let y = 0; y < params.area.h; y += 1 / size) {
		// 	for (let x = 0; x < params.area.w; x += 1 / size) {

		// 		let _d = _imgData.data[(y * _w + x) * 4];

		// 	}
		// }

		let _size = 2;
		let _num = 0
		for (var i = 0; i < _imgData.data.length; i += 4*_size) {

			let _d = _imgData.data[i];

			if (_d > 50) {
				let _x = _num*_size % _w;
				let _y = Math.floor(_num*_size / _w);

				// console.log(_x+"_"+_y);

				 _imgData.data[i+1] = 0;

				if (pointStr != "") pointStr += ",";
				pointStr += Math.round(_x/_w*100)/100 + "~" + Math.round(_y/_h*100)/100;
			}

			_num++;
		}


		ctxFinal.putImageData(_imgData, 0, 0);


		That.socket.emit('setDepthStr', pointStr);
	}


}