#!/usr/bin/env node --use_strict
let path = require('path');
let steps = require('./steps');
let check = require('./check');

const PERK_URL = 'http://api.perkframework.com/location';
const TMP_PATH = path.join(__dirname, 'tmp');
const DOWNLOAD_PATH = path.join(TMP_PATH, 'download');
const EXTRACT_PATH = path.join(TMP_PATH, 'extract');
const ZIP_PATH = path.join(DOWNLOAD_PATH, 'tmp.zip');

// If there are no arguments then show the help
if(process.argv.length < 3) {
	console.log(steps.help());
	process.exit(0);
}

let targetPath = process.argv[2];
if(!path.isAbsolute(targetPath)) {
	targetPath = path.join(process.cwd(), targetPath);
}

check().then((current) => {
  return steps.all({
    tmpPath: TMP_PATH,
    downloadPath: DOWNLOAD_PATH,
    perkUrl: PERK_URL,
    zipPath: ZIP_PATH,
    extractPath: EXTRACT_PATH,
    targetPath: targetPath
  }, current);
})
.then(console.log)
.catch(err => {
	if(err.hasOwnProperty('code')) {
		if(err.code === 'EACCES') {
			return console.log(
				`Permission was denied on ${err.path} directory for downloading perk files`
			);
		} else if(err.hasOwnProperty('message')) {
			let message = err.message;
			if(err.code !== 0) {
				message += ' Please inform help@perkframework.com with code = '+code;
			}
			return console.log(message);
		}
	}
	console.log(err);
});
