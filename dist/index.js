#!/usr/bin/env node --use_strict
'use strict';

var path = require('path');
var mergedirs = require('merge-dirs').default;
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

steps.ensureDir(TMP_PATH).then(function (p) {
	return steps.ensureDir(DOWNLOAD_PATH);
}).then(function (p) {
	return steps.ensureDir(targetPath);
}).then(function (p) {
	return steps.getLocation(PERK_URL);
}).then(function (location) {
	return steps.download(location, ZIP_PATH);
}).then(function (downloadDir) {
	return steps.unzip(downloadDir, EXTRACT_PATH);
}).then(function (unzipDir) {
	return mergedirs(unzipDir, targetPath, 'skip');
}).then(function () {
	return steps.finish(targetPath);
}).then(console.log).catch(function (err) {
	if (err.hasOwnProperty(message) && err.hasOwnProperty(err.code)) {
		var _message = err.message;
		if (err.code !== 0) {
			_message += ' Please inform help@perkframework.com with code = ' + code;
		}
		console.log(_message);
	} else {
		console.log(err);
	}
});