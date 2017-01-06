const cheerio = require('cheerio');
const memoize = require('lodash.memoize');
const rp = require('request-promise');

/**
 * Request a url with request-promise, with the body transformed into a DOM with cheerio. Returns
 * the same promise if the same page is requested more than once.
 */
module.exports = memoize(url => rp({
  url,
  transform: cheerio.load,
}));

