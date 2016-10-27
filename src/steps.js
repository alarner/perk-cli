let path = require('path');
let fs = require('fs-extra');
let request = require('request');
let AdmZip = require('adm-zip');
let mergedirs = require('merge-dirs').default;
let crypto = require('crypto');
let async = require('async');
let help =
`


usage: perk <install path>

Perk is a well documented set of tools for building node web
applications.

Using the perk command will download and install of the necessary perk
files in the specified <install path>. The <install path> should
specify the directory where you want to set up your perk project.

You can read more about perk at http://perkframework.com



`;

module.exports = {
	all: function(locations) {
		return this.ensureDir(locations.tmpPath)
		.then(p => this.clearPath(locations.extractPath))
		.then(p => this.ensureDir(locations.downloadPath))
		.then(p => this.ensureDir(locations.targetPath))
		.then(p => this.getLocation(locations.perkUrl))
		.then(location => this.download(location, locations.zipPath))
		.then(downloadDir => this.unzip(downloadDir, locations.extractPath))
		.then(unzipDir => this.recordHash(unzipDir))
		.then(unzipDir => mergedirs(unzipDir, locations.targetPath, 'skip'))
		.then(() => this.finish(locations.targetPath));
	},
	help: function() {
		return help;
	},
	getLocation: function(url) {
		return new Promise((resolve, reject) => {
			request(
				{
					method: 'GET',
					uri: url
				},
				(err, response, body) => {
					if(err) {
						reject({
							message: 'Could not determine where files are located. Are you connected to the internet?',
							code: 0
						});
					}
					else {
						try {
							let data = JSON.parse(body);
							if(!data.location) {
								reject({
									message: `Got a bad response from \`${url}\`.`,
									code: 1
								});
							}
							else {
								resolve(data.location);
							}
						}
						catch(err) {
							reject({
								message: `Got a bad response from \`${url}\`.`,
								code: 2
							});
						}
					}
				}
			);
		});
	},
	clearPath: function(path){
		return new Promise((resolve, reject) => {
			fs.remove(path, function(err, data) {
				if (err) {
					reject(err);
				}
				else {
					resolve();
				}
			});
		});
	},
	download: function(url, to) {
		return new Promise((resolve, reject) => {
			request(url)
			.on('error', err => {
				reject({
					message: `Got a bad response from \`${url}\`.`,
					code: 3
				});
			})
			.pipe(fs.createWriteStream(to))
			.on('close', () => resolve(to))
			.on('error', err => {
				reject({
					message: `Could not save the downloaded file to \`${to}\`. Are your file permissions correct?`,
					code: 0
				});
			});
		});
	},
	unzip: function(fromPath, toPath) {
		return new Promise((resolve, reject) => {
			let zip = null;
			try {
				zip = new AdmZip(fromPath);
			}
			catch(e) {
				return reject({
					message: 'Error unzipping downloaded files.',
					code: 4
				});
			}
			try {
				zip.extractAllTo(toPath, true);
				fs.readdir(toPath, (err, files) => {
					if(files.length > 1) {
						resolve(toPath);
					}
					else if(files.length === 1) {
						resolve(path.join(toPath, files[0]));
					}
				});
			}
			catch(e) {
				return reject({
					message: 'Error saving unzipped files.',
					code: 5
				});
			}
		});
	},
	recordHash: function(unzipDir) {
		console.log('recordHash', unzipDir);
		return this.ensureDir(path.join(unzipDir, '.perk', 'hashes'))
		.then((hashDir) => {
			return new Promise((resolve, reject) => {
				const filePaths = [];
				fs.walk(unzipDir)
				.on('data', function (file) {
					if(!file.isDirectory()) {
						filePaths.push(file.path);
					}
				})
				.on('end', function () {
					resolve(filePaths);
				})
			});
		})
		.then((filePaths) => {
			return new Promise((resolve, reject) => {
				async.map(
					filePaths,
					(filePath, cb) => {
						fs.readFile(filePath, (err, data) => {
							if(err) {
								return cb(err);
							}
							return cb(
								null,
								crypto
									.createHash('md5')
									.update(data.toString().trim())
									.digest('hex')
							);
						});
					},
					(err, results) => {
						if(err) {
							return reject(err);
						}
						return resulve(results)
						resolve(unzipDir);
					}
				);
			})
			.then(() => Promise.resolve(unzipDir));
		});
	},
	ensureDir: function(dirPath) {
		return new Promise((resolve, reject) => {
			fs.ensureDir(dirPath, err => {
				if(err) {
					return reject({
						message: `Problem creating project \`${dirPath}\`. Are the permissions correct?`,
						code: 0
					});
				}
				resolve(dirPath);
			});
		});
	},
	finish: function(dirPath) {
		return `


Your new project has successfully been created in ${dirPath}

You should run:

	cd ${dirPath} && npm install

While dependencies for your new perk app are installing you can check
out more info on how to use all the great features of perk at:

http://perkframework.com/v1/guides/getting-started-os-x.html



`;
	}
};
