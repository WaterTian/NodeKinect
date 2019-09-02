/**
 * @memberof SINT.Unit
 * @function getUrlStr
 * @param {string} [name]
 * @return {string} The string url parameter
 */
export function getUrlStr(name) {
	let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	let r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}

/**
 * @memberof SINT.Unit
 * @function degToRad
 * @param {number} [degrees]
 * @return {number} The number of Rad
 */
export function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

/**
 * @memberof SINT.Unit
 * @function getImageXYData
 * @param {HTMLImageElement} [img] - the source object of the texture.
 * @param {number} [w] - width
 * @param {number} [h] - height
 * @return {number[]} - An array representing the [R, G, B] of the color.
 */
export function getImageXYData(img, w, h) {

	let templateCanvas = document.createElement('canvas');
	document.body.appendChild(templateCanvas);
	templateCanvas.width = w;
	templateCanvas.height = h;

	let imgContext = templateCanvas.getContext("2d");
	imgContext.drawImage(img, 0, 0, w, h);

	let imgData = imgContext.getImageData(0, 0, w, h);
	document.body.removeChild(templateCanvas);


	let xyrgbData = [];
	let _hw = w * 0.5;
	let _hh = h * 0.5;
	for (let i = 0; i < h; i += 2) {
		for (let j = 0; j < w; j += 2) {
			let _num = i * w + j;
			let _rgb = [imgData.data[_num * 4], imgData.data[_num * 4 + 1], imgData.data[_num * 4 + 2], imgData.data[_num * 4 + 3]];
			if (imgData.data[_num * 4 + 3] > 0) xyrgbData.push([j - _hw, -i + _hh, _rgb]);
		}
	}
	return xyrgbData;
}

/**
 * @memberof SINT.Unit
 * @function getImageRGBAData
 * @param {HTMLImageElement} [img] - the source object of the texture.
 * @param {number} [w] - width
 * @param {number} [h] - height
 * @return {number[]} - An array representing the [R, G, B ,A] of the color.
 */
export function getImageRGBAData(img, w, h) {

	let templateCanvas = document.createElement('canvas');
	document.body.appendChild(templateCanvas);
	templateCanvas.width = w;
	templateCanvas.height = h;

	let imgContext = templateCanvas.getContext("2d");
	imgContext.drawImage(img, 0, 0, w, h);

	let imgData = imgContext.getImageData(0, 0, w, h);
	document.body.removeChild(templateCanvas);

	return imgData;
}

/**
 * @memberof SINT.Unit
 * @function getTxtImage
 * @param {string} [txt] - the string of text.
 * @param {number} [size] - the font size of text.
 * @return {HTMLImageElement} - img Element.
 */
export function getTxtImage(txt, size = 50) {
	let c = document.createElement('canvas');
	document.body.appendChild(c);
	c.width = 512;
	c.height = 128;

	let ctx = c.getContext("2d");

	ctx.font = size + "sx Verdana";
	ctx.fillStyle = '#ffffff';
	ctx.textAlign = "center";
	ctx.fillText(txt, 256, 64);

	let imgData = c.toDataURL("image/png");
	document.body.removeChild(c);

	let img = document.createElement('img');
	img.src = imgData;
	return img;
}

/**
 * @memberof SINT.Unit
 * @function canvasToImage
 * @param {HTMLCanvasElement} [canvas] - the source object of the texture.
 * @return {HTMLImageElement} - img Element.
 */
export function canvasToImage(canvas) {
	let gl = canvas.getContext("experimental-webgl", {
		preserveDrawingBuffer: true
	});

	let imgData = canvas.toDataURL("image/png");

	let img = document.createElement('img');
	img.src = imgData;
	return img;
}


export function readFile(file) {
	console.log(file.type);

	return new Promise(function(resolve, reject) {
		const reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = function(e) {
			if (/image\/\w+/.test(file.type)) console.log('type: /image');
			else resolve(this.result);
		}

		reader.onerror = function() {
			reject(new Error('Could not load file' + file));
		};
	});
}



export function readJson(file) {
	console.log(file.type);

	return new Promise(function(resolve, reject) {
		const reader = new FileReader();
		reader.readAsText(file);

		reader.onload = function(e) {
			resolve(JSON.parse(this.result));
		}

		reader.onerror = function() {
			reject(new Error('Could not load file' + file));
		};
	});
}

/**
 * @memberof SINT.Unit
 * @function loadJson
 * @param {string} [url] - the json url.
 * @return {Promise} - Promise
 */
export function loadJson(url) {
	return new Promise(function(resolve, reject) {
		const request = new XMLHttpRequest();
		request.open("GET", url);
		request.send(null);
		request.onload = function(e) {
			if (request.status == 200) {
				resolve(JSON.parse(this.responseText));
			} else {
				reject(new Error('Could not loadJson'));
			}
		}
	});
}

/**
 * @memberof SINT.Unit
 * @function postJson
 * @param {string} [url] - the json url.
 * @param {object} [sendData] - the object of data.
 * @return {Promise} - Promise
 */

export function postJson(url, sendData) {
	return new Promise(function(resolve, reject) {
		$.ajax({
			type: "POST",
			url: url,
			data: sendData,
			success: function(data) {
				resolve(JSON.parse(data));
			},
			error: function(jqXHR, textStatus, errorThrown) {
				reject(textStatus);
			}
		});
	});
}



var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
//base64 编码 
export function base64encode(str) {
	var out, i, len;
	var c1, c2, c3;
	len = str.length;
	i = 0;
	out = "";
	while (i < len) {
		c1 = str.charCodeAt(i++) & 0xff;
		if (i == len) {
			out += base64EncodeChars.charAt(c1 >> 2);
			out += base64EncodeChars.charAt((c1 & 0x3) << 4);
			out += "==";
			break;
		}
		c2 = str.charCodeAt(i++);
		if (i == len) {
			out += base64EncodeChars.charAt(c1 >> 2);
			out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
			out += base64EncodeChars.charAt((c2 & 0xF) << 2);
			out += "=";
			break;
		}
		c3 = str.charCodeAt(i++);
		out += base64EncodeChars.charAt(c1 >> 2);
		out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
		out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
		out += base64EncodeChars.charAt(c3 & 0x3F);
	}
	return out;
};

//base64 解码
export function base64decode(str) {
	var c1, c2, c3, c4;
	var i, len, out;
	len = str.length;
	i = 0;
	out = "";
	while (i < len) {
		/* c1 */
		do {
			c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
		}
		while (i < len && c1 == -1);
		if (c1 == -1)
			break;
		/* c2 */
		do {
			c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
		}
		while (i < len && c2 == -1);
		if (c2 == -1)
			break;
		out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
		/* c3 */
		do {
			c3 = str.charCodeAt(i++) & 0xff;
			if (c3 == 61)
				return out;
			c3 = base64DecodeChars[c3];
		}
		while (i < len && c3 == -1);
		if (c3 == -1)
			break;
		out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
		/* c4 */
		do {
			c4 = str.charCodeAt(i++) & 0xff;
			if (c4 == 61)
				return out;
			c4 = base64DecodeChars[c4];
		}
		while (i < len && c4 == -1);
		if (c4 == -1)
			break;
		out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
	}
	return out;
};

export function utf16to8(str) {
	var out, i, len, c;
	out = "";
	len = str.length;
	for (i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if ((c >= 0x0001) && (c <= 0x007F)) {
			out += str.charAt(i);
		} else
		if (c > 0x07FF) {
			out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
			out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
			out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
		} else {
			out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
			out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
		}
	}
	return out;
}


export function utf8to16(str) {
	var out, i, len, c;
	var char2, char3;
	out = "";
	len = str.length;
	i = 0;
	while (i < len) {
		c = str.charCodeAt(i++);
		switch (c >> 4) {
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
				// 0xxxxxxx  
				out += str.charAt(i - 1);
				break;
			case 12:
			case 13:
				// 110x xxxx 10xx xxxx  
				char2 = str.charCodeAt(i++);
				out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
				break;
			case 14:
				// 1110 xxxx10xx xxxx10xx xxxx  
				char2 = str.charCodeAt(i++);
				char3 = str.charCodeAt(i++);
				out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
				break;
		}
	}
	return out;
}



export function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
	return "setOK";
}



export function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}



