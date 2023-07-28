/**
 * @file Demonstrate resending HTTP requests
 * in the case of intermittent timeout
 * in a Scripted Decision Node script
 * in ForgeRock Access Management (AM).
 * @see {@link https://backstage.forgerock.com/docs/am/7.3/authentication-guide/scripting-api-node.html}
 * @version 0.1.0
 */

/**
 * Use functions to avoid inconsistent coercion
 * that may occur in the top-level scope in AM Rhino scripts.
 */
(function () {
    /**
     * Import Java classes.
     */
    const importedJava = JavaImporter(
        org.forgerock.http.protocol.Request
    );

    /**
     * Send a (synchronous) HTTP request with the default timeout,
     * which is currently set to 10 seconds. In the case of timeout,
     * attempt to re-send the request specified number of times.
     * @param {object} request - An instance of org.forgerock.http.protocol.Request:
     * @see {@link https://backstage.forgerock.com/docs/am/7.3/_attachments/apidocs/org/forgerock/http/protocol/Request.html}
     * @param {number} attempts - The number of attempts to send the request.
     * @returns {object|undefined} - An instance of org.forgerock.http.protocol.Response:
     * @see {@link https://backstage.forgerock.com/docs/am/7.3/_attachments/apidocs/org/forgerock/http/protocol/Response.html}
     */
    function getResponse(request, attempts) {
        if (attempts > 0) {
            try {
                return httpClient.send(request).get();
            } catch (e) {
                logger.error('getResponse e: ' + e.message);

                return getResponse(request, attempts - 1);
            }
        }
    }

    try {
        const request = new importedJava.Request();
        request.setUri('https://www.google.com:123/');
        request.setMethod('GET');
        const response = getResponse(request, 2);

        logger.error('response: ' + response);

        outcome = 'true';
    } catch (e) {
        logger.error('e: ' + e.message);

        outcome = 'true';
    }
}());
