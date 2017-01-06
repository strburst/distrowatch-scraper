/**
 * Object with the appropriate urls to distrowatch.com.
 */
module.exports = Object.freeze({
  distro: name => `http://distrowatch.com/table.php?distribution=${name}`,
  popularity: 'http://distrowatch.com/dwres.php?resource=popularity',
});
