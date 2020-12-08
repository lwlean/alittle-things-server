const http = require('http');
const path = require('path');
const fs = require('fs');
const config = require('./config');

"use strit";

const DOMAIN_UPTHINGS = '/upthings/';

const server = http.createServer();
server.on('request', (req, res) => {
	let code = 200;
	let msg = 'upload success';
	let rstMap = {
		code: code,
		message: msg,
	}
	try {
		const upUrl = req.url;
		// upload url error
		if (upUrl.indexOf('/favicon.ico') > -1) {
			return;
		}
		console.log('upUrl:', upUrl);
		if (upUrl.indexOf(DOMAIN_UPTHINGS) < 0) {
			rstMap.code = 500;
			rstMap.message = 'url error';
			res.end(Map2String(rstMap));
		} else {
			const valUrl = upUrl.replace(DOMAIN_UPTHINGS, '');
			const paramList = valUrl.split('&');
			if (paramList.length != 2) {
				rstMap.code = 500;	
				rstMap.message = 'url param num is wrong';
				res.end(Map2String(rstMap));
				return;
			}	
			const things = {}
			paramList.forEach(param => {
				let keyAndValue = param.split('=');
				let key = keyAndValue[0], value = keyAndValue[1];
				things[key] = value;
			});
			if (Object.getOwnPropertyNames(things).indexOf('filename') < 0 || Object.getOwnPropertyNames(things).indexOf('content') < 0) {
				rstMap.code = 500;
				rstMap.message = "urlparam is wrong, did`t contain filename or content, please use upthings --help or upthings -h";
				res.end(Map2String(rstMap));
				return;
			}
			const filePath = config.savePath + '/' + things.filename;				
			const content = things.content;
			if (!fs.existsSync(filePath)) {
				fs.writeFileSync(filePath, Buffer.from(content, 'base64').toString());
			} else {
				fs.appendFileSync(filePath, Buffer.from(content, 'base64').toString());
			}
			res.end(Map2String(rstMap));
		}
		
	} catch(e) {
		console.error(e);
	  const errRstMap = {code: 500, message: 'server error ' + e}
		res.end(Map2String(errRstMap));
	}
});

server.listen(4000, () => {
	console.log('alittle things server start');
});

function Map2String(map) {
	if (map === null || Object.getOwnPropertyNames(map).length < 1) {
		map = {
			code: 500,
			message: 'Map2String format error',
		}	
	}
	return JSON.stringify(map);
}
