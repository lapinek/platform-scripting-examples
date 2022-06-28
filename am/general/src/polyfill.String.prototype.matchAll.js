/**
 * @file Polyfill for String.prototype.matchAll()
 * @description Currently, String.prototype.matchAll() is not available in AM scripts, and one has to use RegExp.prototype.exec() in a while loop.
 * @example {@link am/general/src/parse-xml-to-js.js}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll#regexp.exec_and_matchall}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Polyfill}
 * @author Konstantin Lapine <konstantin.lapine@forgerock.com>
 */

if (!String.prototype.matchAll) {
    /**
     * @param {object} - MUST be a global RegEx instance.
     * @returns {string[][]} - An array of matches.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators}
     */
    String.prototype.matchAll = function (regExp) {
        /**
         * Convert a string to a global RegEx.
         */
        if (typeof regExp === 'string') {
            regExp = new RegExp(regExp, 'g');
        }

        /**
         * Break reference to the original RegEx object, so that it is left intact.
         */
        regExp = new RegExp(regExp);

        /**
         * Ensure that the RegExp is a global one to avoid infinite while loop on RegExp.prototype.exec().
         */
        if (!regExp.global) {
            throw new TypeError('matchAll must be called with a global RegExp');
        }

        var match;
        const allMatches = [];

        /**
         * Collect all matches.
         */
        while ((match = regExp.exec(this)) !== null) {
            allMatches.push(match);
        }

        return allMatches;
    };
}
