module.exports = {
  "pluginName": "wp-release-automation",
  "mainFile": "plugin.php",
  "buildDir": "build",
  "zipName": "{{name}}-{{version}}.zip",
  "excludePatterns": [
    "node_modules/",
    ".git/",
    "src/",
    "*.log",
    ".env*",
    "tests/",
    "*.md",
    "*.zip",
    ".vscode/",
    "wp-release.config.js",
    ".npmignore",
    "package-lock.json"
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