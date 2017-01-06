const knex = require('knex');
const memoize = require('lodash.memoize');

/**
 * Create an sqlite database connection to the given file. If the same file is requested, return the
 * same connection from before.
 */
module.exports = memoize(file => knex({
  client: 'sqlite3',
  connection: {
    filename: file,
  },
  useNullAsDefault: true,  // Default values are not supported in sqlite
}));
