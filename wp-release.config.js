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