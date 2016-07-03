let steps = require('../src/steps');
let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
let expect = chai.expect;
let fs = require('fs-extra');
let path = require('path');

const ZIP_URL = 'https://github.com/alarner/react-express-template/archive/master.zip';
const DOWNLOAD_PERMANENT = path.join(__dirname, './fixtures/perk-master.zip');
const BAD = path.join(__dirname, './fixtures/tmp/download_bad');
const TARGET_DIR = path.join(__dirname, './fixtures/new-dir');

const PERK_URL = 'http://api.perkframework.com/location';
const TMP_PATH = path.join(__dirname, 'fixtures/tmp');
const DOWNLOAD_PATH = path.join(TMP_PATH, 'download');
const EXTRACT_PATH = path.join(TMP_PATH, 'extract');

const ALL_TARGET_DIR = path.join(__dirname, './fixtures/all/new-dir');
const ALL_TMP_PATH = path.join(__dirname, 'fixtures/all/tmp');
const ALL_DOWNLOAD_PATH = path.join(ALL_TMP_PATH, 'download');
const ALL_EXTRACT_PATH = path.join(ALL_TMP_PATH, 'extract');
const ALL_ZIP_PATH = path.join(ALL_DOWNLOAD_PATH, 'tmp.zip');

describe('steps', function() {
	describe('all', function() {
		it('should run all the steps successfully', function(done) {
			this.timeout(5000);
			fs.removeSync(ALL_TMP_PATH);
			fs.removeSync(ALL_TARGET_DIR);
			const promise = steps.all({
				tmpPath: ALL_TMP_PATH,
				downloadPath: ALL_DOWNLOAD_PATH,
				perkUrl: PERK_URL,
				zipPath: ALL_ZIP_PATH,
				extractPath: ALL_EXTRACT_PATH,
				targetPath: ALL_TARGET_DIR
			})
			.catch(err => console.log(err));

			expect(promise).to.be.fulfilled.notify(done);
		});

		it('should not have old remenants of files from previous runs', function(done) {
			const oldFile = path.join(ALL_EXTRACT_PATH, 'old_file.txt');
			this.timeout(5000);
			fs.removeSync(ALL_TMP_PATH);
			fs.removeSync(ALL_TARGET_DIR);
			fs.ensureFileSync(oldFile);
			const promise = steps.all({
				tmpPath: ALL_TMP_PATH,
				downloadPath: ALL_DOWNLOAD_PATH,
				perkUrl: PERK_URL,
				zipPath: ALL_ZIP_PATH,
				extractPath: ALL_EXTRACT_PATH,
				targetPath: ALL_TARGET_DIR
			})
			.catch(err => console.log(err));

			expect(promise).to.be.fulfilled.notify(() => {
				fs.stat(oldFile, (err, data) => {
					expect(err, 'old_file.txt should not exist').to.be.ok;
					done();
				});
			});
		});
	});
	describe('ensureDir', function() {
		it('should throw an error if the permissions are wrong', function() {
			return steps.ensureDir(BAD).catch(err => {
				expect(err.message).to.equal(`Problem creating project \`${BAD}\`. Are the permissions correct?`);
				expect(err.code).to.equal(0);
			});
		});
		it('should create the directory if it doesn\'t already exist', function() {
			return steps.ensureDir(TARGET_DIR).then(dir => {
				expect(dir).to.equal(TARGET_DIR);
				let stats = fs.statSync(dir);
				expect(stats.isDirectory()).to.be.true;
				fs.removeSync(TARGET_DIR);
			});
		});
	});
	describe('getLocation', function() {
		it('should throw an error if the server responds with a bad response', function() {
			this.timeout(5000);
			return steps.getLocation('https://google.com').catch(err => {
				expect(err.message).to.equal('Got a bad response from `https://google.com`.');
				expect(err.code).to.equal(2);
			});
		});
		it('should throw an error if the server doesn\'t respond', function() {
			return steps.getLocation('https://q9nw84x59348yxp3498.com').catch(err => {
				expect(err.message).to.equal('Could not determine where files are located. Are you connected to the internet?');
				expect(err.code).to.equal(0);
			});
		});
		it('should grab the location from the server', function() {
			return steps.getLocation(PERK_URL).then(location => {
				expect(location).to.equal('https://github.com/alarner/react-express-template/archive/master.zip');
			});
		});
	});
	describe('download', function() {
		it('should throw an error if the server responds with a bad response', function() {
			return steps.download('https://q9nw84x59348yxp3498.com', './test/fixtures/tmp/download').catch(err => {
				expect(err.message).to.equal('Got a bad response from `https://q9nw84x59348yxp3498.com`.');
				expect(err.code).to.equal(3);
			});
		});
		it('should throw an error if the server doesn\'t respond', function() {
			return steps.download('https://google.com', BAD).catch(err => {
				expect(err.message).to.equal(`Could not save the downloaded file to \`${BAD}\`. Are your file permissions correct?`);
				expect(err.code).to.equal(0);
			});
		});
		it('should download the zip file from the server', function() {
			this.timeout(5000);
			fs.unlinkSync(DOWNLOAD_PATH);
			return steps.download(ZIP_URL, DOWNLOAD_PATH)
			.then(location => {
				let stats = fs.statSync(location);
				expect(stats.isFile()).to.be.true;
				fs.unlinkSync(DOWNLOAD_PATH);
			});
		});
	});
	describe('unzip', function() {
		it('should not accept bad zip file paths', function() {
			return steps.unzip('bad/path', EXTRACT_PATH).catch(err => {
				expect(err.message).to.equal('Error unzipping downloaded files.');
				expect(err.code).to.equal(4);
			});
		});
		it('should not accept bad extraction paths', function() {
			this.timeout(3000);
			return steps.unzip(DOWNLOAD_PERMANENT, BAD).catch(err => {
				expect(err.message).to.equal('Error saving unzipped files.');
				expect(err.code).to.equal(5);
			});
		});
		it('should unzip correctly', function() {
			this.timeout(3000);
			return steps.unzip(DOWNLOAD_PERMANENT, EXTRACT_PATH).then(toPath => {
				let stats = fs.statSync(EXTRACT_PATH);
				expect(stats.isDirectory()).to.be.true;
				fs.removeSync(EXTRACT_PATH);
			});
		});
	});
});