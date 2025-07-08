const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function bumpVersion(type) {
	const packageJsonPath = path.resolve(process.cwd(), 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

	const versionParts = packageJson.version.split('.').map(Number);
	if (type === 'patch') {
		versionParts[2]++;
	} else if (type === 'minor') {
		versionParts[1]++;
		versionParts[2] = 0;
	} else if (type === 'major') {
		versionParts[0]++;
		versionParts[1] = 0;
		versionParts[2] = 0;
	}

	packageJson.version = versionParts.join('.');
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
	return packageJson.version;
}

function updateFiles(newVersion) {
	const filesToUpdate = [
		'README.md',
		'CHANGELOG.md'
	];

	filesToUpdate.forEach(file => {
		const filePath = path.resolve(process.cwd(), file);
		if (fs.existsSync(filePath)) {
			let content = fs.readFileSync(filePath, 'utf8');
			content = content.replace(/Version: \d+\.\d+\.\d+/, `Version: ${newVersion}`);
			fs.writeFileSync(filePath, content);
		}
	});
}

function versionCommand(options) {
	try {
		const type = options.type || 'patch';
		const newVersion = bumpVersion(type);
		updateFiles(newVersion);
		console.log(chalk.green(`✅ Version bumped to ${newVersion}`));
	} catch (error) {
		console.error(chalk.red('❌ Error updating version:'), error.message);
		process.exit(1);
	}
}

module.exports = { versionCommand, bumpVersion, updateFiles };