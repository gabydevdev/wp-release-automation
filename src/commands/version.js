{
	"version": "1.0.0",
	"bumpVersion": function (type) {
		const fs = require('fs');
		const path = require('path');
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
	},
	"updateFiles": function (newVersion) {
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
	},
	"execute": function (type) {
		const newVersion = this.bumpVersion(type);
		this.updateFiles(newVersion);
		console.log(`Version bumped to ${newVersion}`);
	}
}