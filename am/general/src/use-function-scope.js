/**
 * @file Provides a JavaScript example of using function and top-level scopes in Access Management (AM) scripts.
 * @version 0.1.0
 */

// EXAMPLE 1

/**
 * Do NOT assign variables in top-level scope.
 *
 * Because, in the top-level scope in AM Rhino,
 * assigning a variable a Java object might convert it to a JavaScript value
 * rendering Java methods unavailable.
 * @example
 * var s = new java.lang.String('');
 *
 * try {
 *     logger.error(s.getBytes);
 *     // ERROR: undefined
 * } catch (e) {
 *     logger.error(e);
 * }
 */

/**
 * Use function scope to avoid inconsistent behavior
 * that may occur in the top-level scope in AM Rhino.
 */
(function () {
    var s = new java.lang.String('');

    try {
        logger.error(s.getBytes);
        // ERROR: function getBytes() {/*\nvoid getBytes(int,int,byte[],int)\nbyte[] getBytes()\nbyte[] getBytes(java.nio.charset.Charset)\nbyte[] getBytes(java.lang.String)\n*/}\n
    } catch (e) {
        logger.error(e);
    }
}());

// EXAMPLE 2

/**
 * Do NOT assign variables in top-level scope.
 *
 * Because, in the top-level scope in AM Rhino 1.7R4 and above,
 * assigning a variable a string concatenated with other strings by using the "+" operator
 * results in an instance of the org.mozilla.javascript.ConsString class:
 * {@link https://mozilla.github.io/rhino/javadoc/org/mozilla/javascript/ConsString.html}.
 *
 * Accessing an org.mozilla.javascript.ConsString instance
 * will require adding this class to the allowed Java in AM scripting engine configuration.
 *
 * Otherwise, some workarounds are described in:
 * {@link https://bugster.forgerock.org/jira/browse/OPENAM-17090}.
 *
 * @example
 * var s = '';
 * s = s + '';
 *
 * // For the following to work, you'll need to allow java.lang.Class in AM scripting engine configuration.
 * try {
 *     logger.error(s.class);
 *     // ERROR: class org.mozilla.javascript.ConsString
 * } catch (e) {
 *     logger.error(e);
 * }
 */

/**
 * Use function scope to avoid inconsistent behavior
 * that may occur in the top-level scope in AM Rhino.
 */
(function () {
    var s = '';
    s = s + '';

    try {
        logger.error(s.class);
        // ERROR: undefined
    } catch (e) {
        logger.error(e);
    }
}());
