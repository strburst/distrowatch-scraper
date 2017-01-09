#!/usr/bin/env node

// Argument parsing with yargs
const argv = require('yargs')
  .strict()
  .usage('Usage: $0 [options] [-f filename]')
// -f|--file filename
  .alias('f', 'file')
  .default('f', './distrowatch.sqlite')
  .describe('f', 'file name to write database to')
  .string('f')
// -h|--help
  .alias('h', 'help')
  .help('h')
// -j|--jobs
  .alias('j', 'jobs')
  .default('j', 3)
  .describe('j', 'number of distros to process concurrently')
  .number('j')
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
  function recreate(tablename, createFn) {
    return db.schema.dropTableIfExists(tablename).createTable(tablename, createFn);
  }

  const dropDistros = db.schema.dropTableIfExists('distros');

  const createOsTypes = recreate('os_types', (table) => {
    table.increments('os_type_id').primary();
    table.string('os_type').notNullable();
  });

  const createCategories = recreate('categories', (table) => {
    table.increments('category_id').primary();
    table.string('category').notNullable();
  });

  const createBasedOn = recreate('based_on', (table) => {
    table.increments('based_on_id').primary();
    table.string('based_on').notNullable();
  });

  const createDistros = db.schema.createTable('distros', (table) => {
    table.increments('distro_id').primary();
    table.string('longname').notNullable();
    table.string('shortname').notNullable();
    table.string('urlname').notNullable();

    table.integer('os_type_id').references('os_type_id').on('os_types');
    table.integer('category_id').references('category_id').on('categories');
    table.integer('based_on_id').references('based_on_id').on('based_on');
  });

  const createRanks = recreate('hit_rankings', (table) => {
    table.increments('distro_id').primary().references('distro_id').on('distros');
    table.integer('12mo_hits').notNullable();
    table.enu('12mo_state', ['up', 'down', 'steady']).notNullable();
    table.integer('6mo_hits').notNullable();
    table.enu('6mo_state', ['up', 'down', 'steady']).notNullable();
    table.integer('1mo_hits').notNullable();
    table.enu('1mo_state', ['up', 'down', 'steady']).notNullable();
  });

  return dropDistros
    .then(() => Promise.all([createOsTypes, createCategories, createBasedOn]))
    .then(() => createDistros)
    .then(() => createRanks);
}

/**
 * Fill in metadata tables that have foreign key constraints on the main distros table.
 */
function scrapeForeignKeyMetadata() {
  /**
   * Scrape the text and value of a drop-down, excluding the first element.
   */
  function readOptions($, attrName, propName) {
    const items = [];
    $(`select[name=${attrName}] > option`).slice(1).each((i, el) => {
      const it = $(el);
      const obj = {};
      obj[propName] = it.val();
      items.push(obj);
    });
    return items;
  }

  return get(urls.search).then(($) => {
    const osTypeList = readOptions($, 'ostype', 'os_type');
    const osType = db('os_types').insert(osTypeList);

    const categoryList = readOptions($, 'category', 'category');
    const category = db('categories').insert(categoryList);

    const basedOnList = readOptions($, 'basedon', 'based_on');
    const basedOn = db('based_on').insert(basedOnList);

    return Promise.all([osType, category, basedOn]);
  });
}

/**
 * Fetch a list of all distros.
 */
function lsDistros() {
  return get(urls.popularity).then(($) => {
    const distros = [];

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
