#!/usr/bin/env node --use_strict

let request = require('request');
let path = require('path');
let fs = require('fs-extra');
let AdmZip = require('adm-zip');
let async = require('async');
let steps = require('./steps');

const PERK_URL = 'http://api.perkframework.com/location';

// If there are no arguments then show the help
if(process.argv.length < 3) {
	console.log(steps.help());
	process.exit(0);
}

steps.getLocation(PERK_URL)
.then(steps.download);

// let targetPath = path.join(process.cwd(), process.argv[2]);

// let isDir = true;
// try {
// 	let test = fs.lstatSync(targetPath);
// 	isDir = isDir && test.isDirectory();
// }
// catch(e) {
// 	isDir = false;
// }

// if(!isDir) {
// 	console.warn('File "'+targetPath+'" does not exist or is not a directory.');
// 	process.exit(0);
// }

// let tmpPath = path.join(__dirname, 'tmp');
// let extractPath = path.join(tmpPath, 'extract');
// let downloadPath = path.join(tmpPath, 'download');
// let zipPath = path.join(downloadPath, 'tmp.zip');

// fs.mkdirsSync(downloadPath);
// fs.mkdirsSync(extractPath);

// request(
// 	{
// 		method: 'GET',
// 		uri: 'http://api.perkframework.com/location'
// 	},
// 	getLocation
// );

// function getLocation(err, response, body) {
// 	if(err) {
// 		console.warn('Could not retreive zip file location.');
// 		console.warn(err);
// 		return;
// 	}
// 	let data = JSON.parse(body);
// 	download(data.location);
// }

// function download(url) {
// 	console.log('Downloading files from', url);
// 	console.log(__dirname);
	
// 	let stream = request(url).pipe(fs.createWriteStream(zipPath));
// 	stream.on('error', downloadError);
// 	stream.on('close', unzip);
// };

// function downloadError(err) {
// 	console.warn('Could not download zip file.');
// 	console.warn(err);
// }

// function unzip() {
// 	console.log('unzipping...');
// 	let zip = new AdmZip(zipPath);
// 	zip.extractAllTo(extractPath, false);
// 	let unzippedDir = fs.readdirSync(extractPath);

// 	if(unzippedDir.length !== 1) {
// 		console.warn('Invalid unzipped file format.');
// 		process.exit(0);
// 	}

// 	let subfiles = fs.readdirSync(path.join(extractPath, unzippedDir[0]));

// 	async.each(
// 		subfiles,
// 		(file, cb) => {
// 			fs.move(
// 				path.join(extractPath, unzippedDir[0], file),
// 				path.join(targetPath, file),
// 				cb
// 			);
// 		},
// 		cleanup
// 	);
	
// }

// function cleanup(err) {
// 	if(err) {
// 		console.warn('Inable to move unzipped files.');
// 		console.warn(err);
// 		process.exit(0);
// 	}
// 	fs.removeSync(tmpPath);
// 	console.log('Your new project has successfully been created in '+targetPath+'\n');
// 	console.log('You should run:\n');
// 	console.log('\tcd '+targetPath+' && npm install\n');
// 	console.log('While dependencies for your new perk app are installing you can check out more info on how to use all the great features of perk at:\n');
// 	console.log('\thttp://perkframework.com/docs/getting-started\n\n\n');
// }