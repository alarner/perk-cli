'use strict';

var path = require('path');
var fs = require('fs-extra');
var request = require('request');
var AdmZip = require('adm-zip');
var mergedirs = require('merge-dirs').default;
var _help = '\n\n\nusage: perk <install path>\n\nPerk is a well documented set of tools for building node web\napplications.\n\nUsing the perk command will download and install of the necessary perk\nfiles in the specified <install path>. The <install path> should\nspecify the directory where you want to set up your perk project.\n\nYou can read more about perk at http://perkframework.com\n\n\n\n';

module.exports = {
	all: function all(locations, current) {
		var _this = this;

		return this.ensureDir(locations.tmpPath).then(function (p) {
			return _this.clearPath(locations.extractPath);
		}).then(function (p) {
			return _this.ensureDir(locations.downloadPath);
		}).then(function (p) {
			return _this.ensureDir(locations.targetPath);
		}).then(function (p) {
			return _this.getLocation(locations.perkUrl);
		}).then(function (location) {
			return _this.download(location, locations.zipPath);
		}).then(function (downloadDir) {
			return _this.unzip(downloadDir, locations.extractPath);
		}).then(function (unzipDir) {
			return mergedirs(unzipDir, locations.targetPath, 'skip');
		}).then(function () {
			return _this.finish(locations.targetPath, current);
		});
	},
	help: function help() {
		return _help;
	},
	getLocation: function getLocation(url) {
		return new Promise(function (resolve, reject) {
			request({
				method: 'GET',
				uri: url
			}, function (err, response, body) {
				if (err) {
					reject({
						message: 'Could not determine where files are located. Are you connected to the internet?',
						code: 0
					});
				} else {
					try {
						var data = JSON.parse(body);
						if (!data.location) {
							reject({
								message: 'Got a bad response from `' + url + '`.',
								code: 1
							});
						} else {
							resolve(data.location);
						}
					} catch (err) {
						reject({
							message: 'Got a bad response from `' + url + '`.',
							code: 2
						});
					}
				}
			});
		});
	},
	clearPath: function clearPath(path) {
		return new Promise(function (resolve, reject) {
			fs.remove(path, function (err, data) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	},
	download: function download(url, to) {
		return new Promise(function (resolve, reject) {
			request(url).on('error', function (err) {
				reject({
					message: 'Got a bad response from `' + url + '`.',
					code: 3
				});
			}).pipe(fs.createWriteStream(to)).on('close', function () {
				return resolve(to);
			}).on('error', function (err) {
				reject({
					message: 'Could not save the downloaded file to `' + to + '`. Are your file permissions correct?',
					code: 0
				});
			});
		});
	},
	unzip: function unzip(fromPath, toPath) {
		return new Promise(function (resolve, reject) {
			var zip = null;
			try {
				zip = new AdmZip(fromPath);
			} catch (e) {
				return reject({
					message: 'Error unzipping downloaded files.',
					code: 4
				});
			}
			try {
				zip.extractAllTo(toPath, true);
				fs.readdir(toPath, function (err, files) {
					if (files.length > 1) {
						resolve(toPath);
					} else if (files.length === 1) {
						resolve(path.join(toPath, files[0]));
					}
				});
			} catch (e) {
				return reject({
					message: 'Error saving unzipped files.',
					code: 5
				});
			}
		});
	},
	ensureDir: function ensureDir(dirPath) {
		return new Promise(function (resolve, reject) {
			fs.ensureDir(dirPath, function (err) {
				if (err) {
					return reject({
						message: 'Problem creating project `' + dirPath + '`. Are the permissions correct?',
						code: 0
					});
				}
				resolve(dirPath);
			});
		});
	},
	finish: function finish(dirPath, current) {
		return '\n\n\nYour new project has successfully been created in ' + dirPath + '\n\nYou should run:\n\n\tcd ' + dirPath + ' && npm install\n\nWhile dependencies for your new perk app are installing you can check\nout more info on how to use all the great features of perk at:\n\nhttp://perkframework.com/v1/guides/getting-started-os-x.html\n\n\n\n' + (current ? '' : 'Be Aware your perky-cli version is outdated, there may be differences with the docs');
	}
};