const { exec } = require('child_process');
const chalk = require('chalk');

async function commitChanges(message) {
    return new Promise((resolve, reject) => {
        exec(`git add . && git commit -m "${message}"`, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error committing changes: ${stderr}`));
                return;
            }
            console.log(chalk.green('✅ Changes committed successfully'));
            resolve(stdout);
        });
    });
}

async function pushChanges(branch = 'main') {
    return new Promise((resolve, reject) => {
        exec(`git push origin ${branch}`, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error pushing changes: ${stderr}`));
                return;
            }
            console.log(chalk.green('✅ Changes pushed successfully'));
            resolve(stdout);
        });
    });
}

async function createTag(tagName) {
    return new Promise((resolve, reject) => {
        exec(`git tag ${tagName}`, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error creating tag: ${stderr}`));
                return;
            }
            console.log(chalk.green(`✅ Tag ${tagName} created successfully`));
            resolve(stdout);
        });
    });
}

async function pushTags() {
    return new Promise((resolve, reject) => {
        exec('git push origin --tags', (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error pushing tags: ${stderr}`));
                return;
            }
            console.log(chalk.green('✅ Tags pushed successfully'));
            resolve(stdout);
        });
    });
}

async function getCurrentBranch() {
    return new Promise((resolve, reject) => {
        exec('git rev-parse --abbrev-ref HEAD', (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error getting current branch: ${stderr}`));
                return;
            }
            resolve(stdout.trim());
        });
    });
}

async function checkoutBranch(branch) {
    return new Promise((resolve, reject) => {
        exec(`git checkout ${branch}`, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error checking out branch: ${stderr}`));
                return;
            }
            console.log(chalk.green(`✅ Checked out branch ${branch}`));
            resolve(stdout);
        });
    });
}

module.exports = {
    commitChanges,
    pushChanges,
    createTag,
    pushTags,
    getCurrentBranch,
    checkoutBranch
};