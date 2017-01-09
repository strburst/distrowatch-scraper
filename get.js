const cheerio = require('cheerio');
const memoize = require('lodash.memoize');
const rp = require('request-promise');

/**
 * Return a function that requests a url with the given user agent, returning a promise. In the
 * callback, the body will be transformed into a DOM with cheerio. Returns the same promise if the
 * same page is requested more than once.
 */
module.exports = memoize(useragent => memoize(url => rp({
  url,
  headers: {
    'User-Agent': useragent,
  },
  transform: cheerio.load,
})));
