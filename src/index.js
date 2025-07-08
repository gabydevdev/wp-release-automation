{
	"entry": "src/index.js",
	"commands": {
		"version": "./commands/version.js",
		"build": "./commands/build.js",
		"zip": "./commands/zip.js",
		"release": "./commands/release.js"
	},
	"init": function() {
		const { program } = require('commander');
		const versionCommand = require('./commands/version');
		const buildCommand = require('./commands/build');
		const zipCommand = require('./commands/zip');
		const releaseCommand = require('./commands/release');

		program
			.version('1.0.0')
			.description('WordPress Release Automation Tool');

		program
			.command('version')
			.description('Bump the version number')
			.action(versionCommand);

		program
			.command('build')
			.description('Build the plugin or theme')
			.action(buildCommand);

		program
			.command('zip')
			.description('Create a zip archive of the plugin or theme')
			.action(zipCommand);

		program
			.command('release')
			.description('Release the plugin or theme')
			.action(releaseCommand);

		program.parse(process.argv);
	}
}