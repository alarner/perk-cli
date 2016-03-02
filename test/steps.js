let steps = require('../src/steps');
let expect = require('chai').expect;
let fs = require('fs-extra');
let path = require('path');

const PERK_URL = 'http://api.perkframework.com/location';
const ZIP_URL = 'https://github.com/alarner/react-express-template/archive/master.zip';
const DOWNLOAD = './test/fixtures/tmp/download';
const DOWNLOAD_PERMANENT = path.join(__dirname, './fixtures/perk-master.zip');
const EXTRACT = './test/fixtures/tmp/extract';
const BAD = path.join(__dirname, './fixtures/tmp/download_bad');
const CREATE_DIR = path.join(__dirname, './fixtures/new-dir');

describe('steps', function() {
	describe('ensureDir', function() {
		it('should throw an error if the permissions are wrong', function() {
			return steps.ensureDir(BAD).catch(err => {
				expect(err.message).to.equal(`Problem creating project \`${BAD}\`. Are the permissions correct?`);
				expect(err.code).to.equal(0);
			});
		});
		it('should create the directory if it doesn\'t already exist', function() {
			return steps.ensureDir(CREATE_DIR).then(dir => {
				expect(dir).to.equal(CREATE_DIR);
				let stats = fs.statSync(dir);
				expect(stats.isDirectory()).to.be.true;
				fs.removeSync(CREATE_DIR);
			});
		});
	});
	describe('getLocation', function() {
		it('should throw an error if the server responds with a bad response', function() {
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
			fs.unlinkSync(DOWNLOAD);
			return steps.download(ZIP_URL, DOWNLOAD)
			.then(location => {
				let stats = fs.statSync(location);
				expect(stats.isFile()).to.be.true;
				fs.unlinkSync(DOWNLOAD);
			});
		});
	});
	describe('unzip', function() {
		it('should not accept bad zip file paths', function() {
			return steps.unzip('bad/path', EXTRACT).catch(err => {
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
			return steps.unzip(DOWNLOAD_PERMANENT, EXTRACT).then(toPath => {
				let stats = fs.statSync(EXTRACT);
				expect(stats.isDirectory()).to.be.true;
				fs.removeSync(EXTRACT);
			});
		});
	});
});