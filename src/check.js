module.exports = function() {
	var currentVersion = require('../package.json').version;
	return new Promise((resolve, reject) => {
		const spawn = require('child_process').spawn;
		const semver = require('semver');
		const versionProc = spawn('npm', ['view', 'perk-cli', 'version']);
		return versionProc.stdout.on('data', (data) => {
			const versionString = String(data);
			if (semver.gt(versionString, currentVersion)) {
				// version is outdated
				console.log('There is a newer version of perk-cli available please upgrade');
				return resolve(false);
			}
			return resolve(true);
		});
		version.stderr.on('data', (data) => {
			// console.log(`stderr: ${data}`);
		});
	});
};
