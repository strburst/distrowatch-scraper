#!/usr/bin/env node

// Argument parsing with yargs
const argv = require('yargs')
  .strict()
  .usage('Usage: $0 [options] [-f filename]')
// -f|--file filename
  .alias('f', 'file')
  .demandOption('f')
  .default('f', './distrowatch.sqlite')
  .describe('f', 'file name to write database to')
  .string('f')
// -h|--help
  .alias('h', 'help')
  .help('h')
// -v|--version
  .alias('v', 'version')
  .version()
  .argv;

const db = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: argv.file,
  },
  useNullAsDefault: true,  // Default values are not supported in sqlite
});
