#!/usr/bin/env node --use_strict
'use strict';

var request = require('request');
var path = require('path');
var fs = require('fs-extra');
var AdmZip = require('adm-zip');
var async = require('async');

if (process.argv.length < 3) {
	console.warn('You must specify a location where the new Perk app should be created.');
	process.exit(0);
}

var targetPath = path.join(process.cwd(), process.argv[2]);

var isDir = true;
try {
	var test = fs.lstatSync(targetPath);
	isDir = isDir && test.isDirectory();
} catch (e) {
	isDir = false;
}

if (!isDir) {
	console.warn('File "' + targetPath + '" does not exist or is not a directory.');
	process.exit(0);
}

var tmpPath = path.join(__dirname, 'tmp');
var extractPath = path.join(tmpPath, 'extract');
var downloadPath = path.join(tmpPath, 'download');
var zipPath = path.join(downloadPath, 'tmp.zip');

fs.mkdirsSync(downloadPath);
fs.mkdirsSync(extractPath);

request({
	method: 'GET',
	uri: 'http://api.perkframework.com/location'
}, getLocation);

function getLocation(err, response, body) {
	if (err) {
		console.warn('Could not retreive zip file location.');
		console.warn(err);
		return;
	}
	var data = JSON.parse(body);
	download(data.location);
}

function download(url) {
	console.log('Downloading files from', url);
	console.log(__dirname);

	var stream = request(url).pipe(fs.createWriteStream(zipPath));
	stream.on('error', downloadError);
	stream.on('close', unzip);
};

function downloadError(err) {
	console.warn('Could not download zip file.');
	console.warn(err);
}

function unzip() {
	console.log('unzipping...');
	var zip = new AdmZip(zipPath);
	zip.extractAllTo(extractPath, false);
	var unzippedDir = fs.readdirSync(extractPath);

	if (unzippedDir.length !== 1) {
		console.warn('Invalid unzipped file format.');
		process.exit(0);
	}

	var subfiles = fs.readdirSync(path.join(extractPath, unzippedDir[0]));

	async.each(subfiles, function (file, cb) {
		fs.move(path.join(extractPath, unzippedDir[0], file), path.join(targetPath, file), cb);
	}, cleanup);
}

function cleanup(err) {
	if (err) {
		console.warn('Inable to move unzipped files.');
		console.warn(err);
		process.exit(0);
	}
	fs.removeSync(tmpPath);
	console.log('Your new project has successfully been created in ' + targetPath + '\n');
	console.log('You should run:\n');
	console.log('\tcd ' + targetPath + ' && npm install\n');
	console.log('While dependencies for your new perk app are installing you can check out more info on how to use all the great features of perk at:\n');
	console.log('\thttp://perkframework.com/docs/getting-started\n\n\n');
}

// function move(err) {
// 	if(err) {
// 		console.warn('Could not move unzipped files.');
// 		console.warn(err);
// 		process.exit(0);
// 	}
// }