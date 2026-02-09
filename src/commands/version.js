const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function bumpVersion(type) {
	const packageJsonPath = path.resolve(process.cwd(), 'package.json');
	
	if (!fs.existsSync(packageJsonPath)) {
		throw new Error('package.json not found in current directory');
	}
	
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

	const versionParts = packageJson.version.split('.').map(Number);
	
	if (versionParts.some(isNaN)) {
		throw new Error('Invalid version format in package.json');
	}
	
	if (type === 'patch') {
		versionParts[2]++;
	} else if (type === 'minor') {
		versionParts[1]++;
		versionParts[2] = 0;
	} else if (type === 'major') {
		versionParts[0]++;
		versionParts[1] = 0;
		versionParts[2] = 0;
	} else {
		throw new Error('Invalid version type. Use patch, minor, or major');
	}

	packageJson.version = versionParts.join('.');
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
	return packageJson.version;
}

function setVersion(version) {
	const packageJsonPath = path.resolve(process.cwd(), 'package.json');

	if (!fs.existsSync(packageJsonPath)) {
		throw new Error('package.json not found in current directory');
	}

	if (!/^\d+\.\d+\.\d+$/.test(version)) {
		throw new Error('Invalid version format. Use x.y.z');
	}

	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	packageJson.version = version;
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
	return packageJson.version;
}

function updateFiles(newVersion) {
	// Load configuration to get main file
	const configPath = path.join(process.cwd(), 'wp-release.config.js');
	let mainFile = null;
	
	if (fs.existsSync(configPath)) {
		const config = require(configPath);
		mainFile = config.mainFile;
	}
	
	const filesToUpdate = [
		'README.md',
		'CHANGELOG.md',
		'composer.json',
		'readme.txt'
	];
	
	// Add main plugin file if it exists
	if (mainFile) {
		filesToUpdate.push(mainFile);
	}

	filesToUpdate.forEach(file => {
		const filePath = path.resolve(process.cwd(), file);
		if (fs.existsSync(filePath)) {
			if (file === 'composer.json') {
				const composerJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
				composerJson.version = newVersion;
				fs.writeFileSync(filePath, JSON.stringify(composerJson, null, 2));
				console.log(chalk.blue(`📝 Updated version in ${file}`));
				return;
			}

			let content = fs.readFileSync(filePath, 'utf8');
			
			// For PHP files, update WordPress plugin header format
			if (file.endsWith('.php')) {
				content = content.replace(/(\* Version:\s*)\d+\.\d+\.\d+/, `$1${newVersion}`);
			} else if (file === 'readme.txt') {
				content = content
					.replace(/(Stable tag:\s*)\d+\.\d+\.\d+/i, `$1${newVersion}`)
					.replace(/(Version:\s*)\d+\.\d+\.\d+/i, `$1${newVersion}`);
			} else {
				// For other files, use generic format
				content = content.replace(/Version: \d+\.\d+\.\d+/, `Version: ${newVersion}`);
			}
			
			fs.writeFileSync(filePath, content);
			console.log(chalk.blue(`📝 Updated version in ${file}`));
		}
	});
}

function versionCommand(options) {
	try {
		const newVersion = options.set
			? setVersion(options.set)
			: bumpVersion(options.type || 'patch');
		updateFiles(newVersion);
		console.log(chalk.green(`✅ Version updated to ${newVersion}`));
	} catch (error) {
		console.error(chalk.red('❌ Error updating version:'), error.message);
		process.exit(1);
	}
}

module.exports = { versionCommand, bumpVersion, setVersion, updateFiles };