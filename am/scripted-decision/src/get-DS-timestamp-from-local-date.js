/**
 * @file Get ForgeRock Directory Services (DS)-formatted UTC timestamp from a local date.
 * in a Scripted Decision Node script
 * in ForgeRock Access Management (AM).
 * @see {@link https://backstage.forgerock.com/docs/am/7.1/authentication-guide/scripting-api-node.html#scripting-api-node-sessionProperties}.
 * @see {@link https://backstage.forgerock.com/docs/ds/7.1}.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date}.
 * @see {@link https://backstage.forgerock.com/knowledge/kb/article/a73910100}.
 */

/**
 * Get DS-formatted UTC timestamp from a local date.
 * @param {number} localDate - The local timestamp that represents milliseconds since 1 January 1970 UTC
 * in the local time zone and offset.
 * @returns {string} The UTC date in DS format.
 *
 * @example
 * var localDate = 1637348778854;
 * // Note that, an AM instance might already be using UTC dates.
 * // Running the next line in your browser will return a local date;
 * // for example, Fri Nov 19 2021 11:06:18 GMT-0800 (Pacific Standard Time).
 * logger.error(new Date(localDate)); // Fri Nov 19 2021 19:06:18 GMT-0000 (GMT)
 * logger.error(getDSTimeStamp(localDate)); // 20211119190618.854Z
 */
function getDSTimeStamp(localDate) {
    return (new Date(localDate)).toISOString().replace(/[T:-]/gi, '');
}
