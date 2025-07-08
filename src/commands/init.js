const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function initCommand() {
  console.log(chalk.blue('🚀 Initializing WordPress Release Automation'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'pluginName',
      message: 'Plugin/Theme name:',
      default: path.basename(process.cwd())
    },
    {
      type: 'input',
      name: 'mainFile',
      message: 'Main plugin file:',
      default: 'plugin.php'
    },
    {
      type: 'input',
      name: 'buildDir',
      message: 'Build directory:',
      default: 'build'
    },
    {
      type: 'input',
      name: 'zipName',
      message: 'ZIP file name template:',
      default: '{{name}}-{{version}}.zip'
    },
    {
      type: 'checkbox',
      name: 'excludePatterns',
      message: 'Files/folders to exclude:',
      choices: [
        { name: 'node_modules/', checked: true },
        { name: '.git/', checked: true },
        { name: 'src/', checked: true },
        { name: '*.log', checked: true },
        { name: '.env*', checked: true },
        { name: 'tests/', checked: false },
        { name: '*.md', checked: false }
      ]
    }
  ]);

  const config = {
    pluginName: answers.pluginName,
    mainFile: answers.mainFile,
    buildDir: answers.buildDir,
    zipName: answers.zipName,
    excludePatterns: answers.excludePatterns,
    hooks: {
      preRelease: [],
      postRelease: [],
      preBuild: [],
      postBuild: []
    }
  };

  const configPath = path.join(process.cwd(), 'wp-release.config.js');
  const configContent = `module.exports = ${JSON.stringify(config, null, 2)};`;
  
  await fs.writeFile(configPath, configContent);
  console.log(chalk.green('✅ Configuration saved to wp-release.config.js'));
}

module.exports = { initCommand };
