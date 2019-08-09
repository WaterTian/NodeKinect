import dat from 'dat-gui';
import io from 'socket.io-client';

const base64js = require('base64-js');
const pako = require('pako');


var That;
var gui;

var depthTexture;
var old_depthData;

var ctx;
var imageData;

export default class Scene {


	constructor() {
		That = this;

		var canvas = document.getElementById('canvas');
		ctx = canvas.getContext('2d');

		imageData = ctx.createImageData(canvas.width, canvas.height);

		this.initSocket();

	}


	initSocket() {


		var socket = io('http://127.0.0.1:8000/');
		this.socket = socket;

		socket.on('depthFrame', depthFrame);

		function depthFrame(depthBuffer) {

			let depth8Arr =  pako.inflate(atob(depthBuffer));

			// console.log(depth8Arr);
			let depthNum = 0;
			for (let i = 0; i < depth8Arr.length; i++) {
				let depth = depth8Arr[i];

				// let depth = (depth8Arr[i + 1] << 16) + depth8Arr[i];

				// depth = depth/1000 *255;


				// if(depth !=0) console.log(depth);
				
	            imageData.data[i*4] = depth;
	            imageData.data[i*4+1] = depth;
	            imageData.data[i*4+2] = depth;
	            imageData.data[i*4+3] = 0xff;
			}

			ctx.putImageData(imageData, 0, 0);

		}

	}



}