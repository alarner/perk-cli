#!/usr/bin/env node --use_strict
'use strict';

var path = require('path');
var steps = require('./steps');

var PERK_URL = 'http://api.perkframework.com/location';
var TMP_PATH = path.join(__dirname, 'tmp');
var DOWNLOAD_PATH = path.join(TMP_PATH, 'download');
var EXTRACT_PATH = path.join(TMP_PATH, 'extract');
var ZIP_PATH = path.join(DOWNLOAD_PATH, 'tmp.zip');

// If there are no arguments then show the help
if (process.argv.length < 3) {
	console.log(steps.help());
	process.exit(0);
}

var targetPath = process.argv[2];
if (!path.isAbsolute(targetPath)) {
	targetPath = path.join(process.cwd(), targetPath);
}

steps.all({
	tmpPath: TMP_PATH,
	downloadPath: DOWNLOAD_PATH,
	perkUrl: PERK_URL,
	zipPath: ZIP_PATH,
	extractPath: EXTRACT_PATH,
	targetPath: targetPath
}).then(console.log).catch(function (err) {
	if (err.hasOwnProperty('code')) {
		if (err.code === 'EACCES') {
			return console.log('Permission was denied on ' + err.path + ' directory for downloading perk files');
		} else if (err.hasOwnProperty('message')) {
			var message = err.message;
			if (err.code !== 0) {
				message += ' Please inform help@perkframework.com with code = ' + code;
			}
			return console.log(message);
		}
	}
	console.log(err);
});