/**
 * @file Demonstrate resending HTTP requests
 * in the case of intermittent timeout
 * with the option to specify custom timeout
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
        org.forgerock.http.protocol.Request,
        java.util.concurrent.TimeUnit
    );

    /**
     * Send a (synchronous) HTTP request with a custom timeout,
     * which is currently set to 10 seconds. In the case of timeout,
     * attempt to re-send the request specified number of times.
     * @param {object} request - An instance of org.forgerock.http.protocol.Request:
     * @see {@link https://backstage.forgerock.com/docs/am/7.3/_attachments/apidocs/org/forgerock/http/protocol/Request.html}
     * @param {number} attempts - The number of attempts to send the request.
	 * @param {number} timeout - The amount of custom timeout in SECONDS.
     * @returns {object|undefined} - An instance of org.forgerock.http.protocol.Response:
     * @see {@link https://backstage.forgerock.com/docs/am/7.3/_attachments/apidocs/org/forgerock/http/protocol/Response.html}
     */
    function getResponse(request, attempts, timeout) {
        if (attempts > 0) {
            try {
                if (timeout) {
                    return httpClient.send(request).get(timeout, importedJava.TimeUnit.SECONDS);
                }
                return httpClient.send(request).get();
            } catch (e) {
                logger.error('getResponse e: ' + e.message);

                return getResponse(request, attempts - 1, timeout);
            }
        }
    }

    try {
        const request = new importedJava.Request();
        request.setUri('https://www.google.com:123/');
        request.setMethod('GET');
        const response = getResponse(request, 3, 5);

        logger.error('response: ' + response);

        outcome = 'true';
    } catch (e) {
        logger.error('e: ' + e.message);

        outcome = 'true';
    }
}());
