const { program } = require('commander');
const { initCommand } = require('./commands/init');
const { releaseCommand } = require('./commands/release');
const { buildCommand } = require('./commands/build');
const { versionCommand } = require('./commands/version');
const { zipCommand } = require('./commands/zip');

module.exports = {
  program,
  initCommand,
  releaseCommand,
  buildCommand,
  versionCommand,
  zipCommand
};