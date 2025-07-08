{
	"version": "1.0.0",
	"build": {
		"outputDir": "dist",
		"includeFiles": [
			"**/*.php",
			"**/*.js",
			"**/*.css",
			"README.md"
		]
	},
	"zip": {
		"archiveName": "plugin-release.zip",
		"compressionLevel": 9
	},
	"git": {
		"branch": "main",
		"commitMessage": "Release version ${version}"
	},
	"npm": {
		"scripts": {
			"prepublish": "npm run build",
			"postpublish": "npm run zip"
		}
	},
	"repository": {
		"type": "git",
		"url": "git+https://github.com/yourusername/your-repo.git"
	}
}