'use strict';

module.exports = function () {
	var currentVersion = require('../package.json').version;
	return new Promise(function (resolve, reject) {
		var spawn = require('child_process').spawn;
		var semver = require('semver');
		var versionProc = spawn('npm', ['view', 'perk-cli', 'version']);
		return versionProc.stdout.on('data', function (data) {
			var versionString = String(data);
			if (semver.gt(versionString, currentVersion)) {
				// version is outdated
				console.log('There is a newer version of perk-cli available please upgrade');
				return resolve(false);
			}
			return resolve(true);
		});
		version.stderr.on('data', function (data) {
			// console.log(`stderr: ${data}`);
		});
	});
};