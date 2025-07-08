const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function updateVersion(packageJsonPath, newVersion) {
    const packageJson = require(packageJsonPath);
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green(`✅ Version updated to ${newVersion}`));
}

function bumpPatchVersion(packageJsonPath) {
    const packageJson = require(packageJsonPath);
    const versionParts = packageJson.version.split('.');
    versionParts[2] = parseInt(versionParts[2]) + 1;
    packageJson.version = versionParts.join('.');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    return packageJson.version;
}

function bumpMinorVersion(packageJsonPath) {
    const packageJson = require(packageJsonPath);
    const versionParts = packageJson.version.split('.');
    versionParts[1] = parseInt(versionParts[1]) + 1;
    versionParts[2] = 0;
    packageJson.version = versionParts.join('.');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    return packageJson.version;
}

function bumpMajorVersion(packageJsonPath) {
    const packageJson = require(packageJsonPath);
    const versionParts = packageJson.version.split('.');
    versionParts[0] = parseInt(versionParts[0]) + 1;
    versionParts[1] = 0;
    versionParts[2] = 0;
    packageJson.version = versionParts.join('.');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    return packageJson.version;
}

function bumpVersion(type, packageJsonPath) {
    switch (type) {
        case 'major':
            return bumpMajorVersion(packageJsonPath);
        case 'minor':
            return bumpMinorVersion(packageJsonPath);
        case 'patch':
        default:
            return bumpPatchVersion(packageJsonPath);
    }
}

module.exports = {
    updateVersion,
    bumpPatchVersion,
    bumpMinorVersion,
    bumpMajorVersion,
    bumpVersion
};