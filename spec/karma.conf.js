// Karma configuration
module.exports = function (config) {

	var libSources = require(__dirname+'/../build/build.js').getFiles();

	var files = [
		"spec/before.js",
		"spec/sinon.js",
		"spec/expect.js",
		"node_modules/leaflet/dist/leaflet-src.js"
	].concat(libSources, [
		"spec/after.js",
		"node_modules/happen/happen.js",
		"node_modules/prosthetic-hand/dist/prosthetic-hand.js",
		"spec/suites/SpecHelper.js",
		"spec/suites/**/*.js",
		"dist/*.css",
		"node_modules/leaflet/dist/leaflet.css",
		{pattern: "dist/images/*.png", included: false, served: true},
		{pattern: "node_modules/leaflet/dist/images/*.png", included: false, served: true}
	]);

	config.set({
		// base path, that will be used to resolve files and exclude
		basePath: '../',

		proxies: {
			'/dist/images/': '/base/dist/images/',
			'/images/': '/base/node_modules/leaflet/dist/images/'
		},
		plugins: [
			'karma-mocha',
			'karma-chrome-launcher'],

		// frameworks to use
		frameworks: ['mocha'],

		// list of files / patterns to load in the browser
		files: files,
		exclude: [],

		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
		reporters: ['dots'],

		// web server port
		port: 9876,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_WARN,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: [
			'ChromeHeadless'
		],

		customLaunchers: {
			'ChromeHeadless': {
				base: 'Chrome',
				flags: [
					'--headless',
					'--disable-gpu',
					'--no-sandbox'
				]
			}
		},

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 5000,

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true
	});
};
