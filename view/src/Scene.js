import dat from 'dat-gui';
import io_c from 'socket.io-client';

const base64js = require('base64-js');
const pako = require('pako');



var That;
var gui;


var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var imageData = ctx.createImageData(canvas.width, canvas.height);


var canvasTemp = document.createElement('canvas');
var ctxTemp = canvasTemp.getContext('2d');

var canvasFinal = document.getElementById('final');
var ctxFinal = canvasFinal.getContext('2d');

window.params = {
	depthMin: 500,
	depthMax: 1000,
	size: 1,
	finalSize: 0.5,

	area: {
		x: 0,
		y: 0,
		w: 1,
		h: 1,
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
		gui.add(params, 'size', 1, 10).step(1).listen().onChange(function() {
			That.setDepth();
		});		

		gui.add(params, 'finalSize', .1, 1);

		var area = gui.addFolder('depthArea');
		area.add(params.area, 'x', 0, 1).step(0.01);
		area.add(params.area, 'y', 0, 1).step(0.01);
		area.add(params.area, 'w', 0, 1).step(0.01);
		area.add(params.area, 'h', 0, 1).step(0.01);

	}

	setDepth() {
		this.socket.emit('setDepthMin', params.depthMin);
		this.socket.emit('setDepthMax', params.depthMax);
		this.socket.emit('setSize', params.size);
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

		canvas.width = 512/params.size;
		canvas.height = 424/params.size;

		ctx.putImageData(imageData, 0, 0);

		That.drawFinal();
		That.drawLine();

	}


	drawLine() {
		let _x = params.area.x*512/params.size;
		let _y = params.area.y*424/params.size;
		let _w = params.area.w*512/params.size;
		let _h = params.area.h*424/params.size;

		ctx.beginPath();
		ctx.lineWidth = "2";
		ctx.strokeStyle = "green";
		ctx.rect(_x, _y, _w, _h);
		ctx.stroke();
	}

	drawFinal() {
		let _x = params.area.x*512/params.size;
		let _y = params.area.y*424/params.size;
		let _w = params.area.w*512/params.size;
		let _h = params.area.h*424/params.size;
		let _imgData = ctx.getImageData(_x, _y, _w, _h);

		canvasTemp.width = _w;
		canvasTemp.height = _h;
		ctxTemp.clearRect(0, 0, _w, _h);
		ctxTemp.putImageData(_imgData, 0, 0);



		let _size = params.finalSize;


		canvasFinal.width = _w * _size;
		canvasFinal.height = _h * _size;
		ctxFinal.clearRect(0, 0, _w, _h);

		ctxFinal.scale(_size, _size);
		ctxFinal.drawImage(canvasTemp, 0, 0, _w, _h);

		let _finalData = ctxFinal.getImageData(0, 0, _w * _size, _h * _size);

		ctxFinal.clearRect(0, 0, _w, _h);

		let pointStr = "";

		let _num = 0
		for (var i = 0; i < _finalData.data.length; i += 4) {
			let _d = _finalData.data[i];

			_finalData.data[i] = 0;
			_finalData.data[i + 1] = 0;
			_finalData.data[i + 2] = 0;

			if (_d > 10) {
				let _x = _num % Math.floor(_w * _size);
				let _y = Math.floor(_num / (_w * _size));

				// console.log(_x + "_" + _y);

				_finalData.data[i + 1] = 255;

				if (pointStr != "") pointStr += ",";
				pointStr += Math.round(_x / (_w * _size) * 100) / 100 + "~" + Math.round(_y / (_h * _size) * 100) / 100;
			}



			_num++;
		}

		ctxFinal.putImageData(_finalData, 0, 0);

		// console.log(pointStr);

		That.socket.emit('setDepthStr', pointStr);
	}


}