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

const db = require('./db')(argv.file);
const get = require('./get');
const urls = require('./urls');

/**
 * Drop and recreate tables with the proper schemas.
 */
function reinitializeTables() {
  const distros = db.schema.dropTableIfExists('distros').createTable('distros', (table) => {
    table.increments('id').primary();
    table.string('longname').notNullable();
    table.string('shortname').notNullable();
    table.string('urlname').notNullable();
  });

  return Promise.all([distros]);
}

function lsDistros() {
  const distros = [];

  return get(urls.popularity).then(($) => {
    $('select[name=distribution] > option').slice(1).each((i, el) => {
      const it = $(el);
      distros.push({
        urlname: it.val(),
        shortname: it.text(),
      });
    });

    return distros;
  });
}
