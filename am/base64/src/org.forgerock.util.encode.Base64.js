/**
 * @file Provides a JavaScript example of Base64 encoding and decoding in Access Management (AM) scripts
 * by using the org.forgerock.util.encode.Base64 class:
 * {@link https://backstage.forgerock.com/docs/am/7.1/apidocs/org/forgerock/util/encode/Base64.html}.
 * @version 0.1.0
 */

(function () {
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
         */
        var encodedString = frJava.Base64.encode(new frJava.String(stringToEncode).getBytes());

        /**
         * A string representation of a Java object, created with the toString() method, is already an instance of the java.lang.String class.
         * For example, in a scripting decision context, the sharedState object is a java.util.LinkedHashMap instance,
         * and its toString() method returns a java.lang.String instance;
         * hence, you can call its getBytes() method to create a java.lang.Byte array.
         */
        var encodedSharedState = frJava.Base64.encode(sharedState.toString().getBytes());

        /**
         * The decode method accepts a JavaString string or a java.lang.String instance, and returns a java.lang.Byte array.
         *
         * Use the java.lang.String constructor to return an instance of the java.lang.String class.
         */
        var decodedString = new frJava.String(frJava.Base64.decode(encodedString));
        var decodedSharedState = new frJava.String(frJava.Base64.decode(encodedSharedState));

        /**
         * Display logs.
         */

        logger.error('Strings to encode:');
        logger.error(stringToEncode);
        // [{\"key\": \"value\"}]
        logger.error(sharedState.toString());
        // {realm=/alpha, authLevel=0}

        logger.error('Encoded strings: ');
        logger.error(encodedString);
        // W3sia2V5IjogInZhbHVlIn1d
        logger.error(encodedSharedState);
        // e3JlYWxtPS9hbHBoYSwgYXV0aExldmVsPTB9

        logger.error('Decoded strings: ');
        logger.error(decodedString);
        // [{\"key\": \"value\"}]
        logger.error(decodedSharedState);
        // {realm=/alpha, authLevel=0}
    } catch (e) {
        logger.error('Exception: ' + e);
    }
}());
