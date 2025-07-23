module.exports = {
	"pluginName": "Your Plugin Name",
	"mainFile": "your-plugin.php",
	"buildDir": "build",
	"zipName": "{{name}}-{{version}}.zip",
	"excludePatterns": [
		"node_modules/",
		".git/",
		"src/",
		"*.log",
		".env*",
		"tests/",
		"*.md"
	],
	"config": {
		"includeGitOps": true,
		"tagPrefix": "v",
		"branch": "main"
	},
	"hooks": {
		"preRelease": [],
		"postRelease": [],
		"preBuild": [],
		"postBuild": []
	}
};