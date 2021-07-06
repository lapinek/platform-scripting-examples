/**
 * @file Provides a JavaScript example of Base64 encoding and decoding in Access Management (AM) scripts
 * by using the org.forgerock.util.encode.Base64 class:
 * {@link https://backstage.forgerock.com/docs/am/7.1/apidocs/org/forgerock/util/encode/Base64.html}.
 * @version 0.1.0
 */

try {
    /**
     * Import Java classes.
     */
    var frJava = JavaImporter(
        org.forgerock.util.encode.Base64,
        java.lang.String
    );

    /**
     * Example JavaScript string.
     */
    var stringToEncode = '[{"key": "value"}]';

    /**
     * The encode method accepts a java.lang.Byte array.
     * Construct a java.lang.String instance, and call its getBytes() method to create a java.lang.Byte array.
     *
     * The encode method returns a java.lang.String instance.
     *
     * Convert it to a JavaScript string
     * in order to have access to the JavaScript string properties,
     * and to allow for the Strict Equality Comparison (with the === operator).
     * Note: converting to a JavaScript string will remove access to the methods provided by the java.lang.String class.
     *
     * If you use the returned value directly,
     * or assign it to a variable inside a function,
     * or save it in an object,
     * you will need to convert the value to a JavaScript string explicitly, for example,
     * by using the JavaString String object in non-constructor mode,
     * or by concatenating the returned value with another JavaScript string
     * @example:
     * logger.error(String(frJava.Base64.encode(new frJava.String(stringToEncode).getBytes())) === encodedString);
     *
     * In the top-level scope of an AM Rhino script,
     * assigning the returned value to a variable will convert it to a JavaScript string.
     */
    var encodedString = frJava.Base64.encode(new frJava.String(stringToEncode).getBytes());

    /**
     * A string representation of a Java object, created with the toString() method, is already an instance of the java.lang.String class.
     * For example, in a scripting decision context, the sharedState object is a java.util.LinkedHashMap instance,
     * and its toString() method returns a java.lang.String instance.
     * Call its getBytes() method to create a java.lang.Byte array.
     */
    var encodedSharedState = frJava.Base64.encode(sharedState.toString().getBytes());

    /**
     * The decode method accepts a JavaString string or a java.lang.String instance, and returns a java.lang.Byte array.
     *
     * Use the java.lang.String constructor to return an instance of the java.lang.String class.
     *
     * Convert it to a JavaScript string
     * in order to have access to the JavaScript string properties,
     * and to allow for the Strict Equality Comparison (with the === operator).
     * Note: converting to a JavaScript string will remove access to the methods provided by the java.lang.String class.
     *
     * If you use the returned value directly,
     * or assign it to a variable inside a function,
     * or save it in an object,
     * you will need to convert the value to a JavaScript string explicitly, for example,
     * by using the JavaString String object in non-constructor mode,
     * or by concatenating the returned value with another JavaScript string
     * @example:
     * logger.error(String(new frJava.String(frJava.Base64.decode(encodedString))) === decodedString);
     *
     * In the top-level scope of an AM Rhino script,
     * assigning the returned value to a variable will convert it to a JavaScript string.
     */
    var decodedString = new frJava.String(frJava.Base64.decode(encodedString));
    var decodedSharedState = new frJava.String(frJava.Base64.decode(encodedSharedState));

    /**
     * Display logs.
     */
    logger.error('Strings to encode:');
    logger.error(stringToEncode);
    logger.error(sharedState.toString());
    logger.error('Encoded strings: ');
    logger.error(encodedString);
    logger.error(encodedSharedState);
    logger.error('Decoded strings: ');
    logger.error(decodedString);
    logger.error(decodedSharedState);
} catch (e) {
    logger.error('Exception: ' + e);
}
