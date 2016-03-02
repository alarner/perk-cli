let fs = require('fs');
let request = require('request');
let AdmZip = require('adm-zip');
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
			}
			catch(e) {
				return reject({
					message: 'Error saving unzipped files.',
					code: 5
				});
			}
		});
	}
};