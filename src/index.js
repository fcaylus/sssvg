#!/usr/bin/env node

const program = require('commander').program;
const packageJson = require('../package.json');

program.name(packageJson.name);
program.version(packageJson.version);

program.parse(process.argv);
