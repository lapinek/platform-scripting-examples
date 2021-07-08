/**
 * @file Determine the authenticating user location
 * based on their IP address
 * and save the location information in the sharedState object
 * in a Scripted Decision Node script
 * in ForgeRock Access Management (AM).
 * @see {@link https://backstage.forgerock.com/docs/am/7.1/authentication-guide/scripting-api-node.html}.
 * @version 0.1.0
 */

/**
 * Use the function scope to avoid inconsistent behavior
 * that may occur in the top-level scope in AM Rhino.
 */
(function () {
    /**
     * An example definition for the object containing the location information.
     * @typedef {object} LoginLocation
     * @property {number} longitude
     * @property {number} latitude
     * @property {string} country The country code.
     * @example
     * {
     *     "longitude": -0.1585557,
     *     "latitude": 51.523767,
     *     "country": "GB"
     * }
     */

    /**
     * Derive the location information from an IP address by using the IP Geolocation API:
     * {@link https://ip-api.com/}.
     * For using this API over HTTPS, you will need to sign up for a key.
     * You can also use a number of other providers offering IP lookup and fraud detection services.
     * @example {@link https://www.ipqualityscore.com/}.
     *
     * @param {object} options An object containing the arguments for geolocation.
     * @param {string} options.ip The IP to geolocate.
     * @returns {LoginLocation|undefined} A JavaScript object containing the location information.
     */
    function getLoginLocationFromIPAddress (options) {
        var request;
        var response;
        var loginLocation;

        options = options || {};

        if (!options.ip) {
            /**
             * Log a missing required parameter.
             */
            logger.error('No IP address to geolocate is provided.');

            return;
        }

        /**
         * Use the fully qualified name to create an instance of the Request class:
         * {@link https://backstage.forgerock.com/docs/am/7.1/apidocs/org/forgerock/http/protocol/Request.html}
         */
        request = new org.forgerock.http.protocol.Request();

        /**
         * Use the methods of the Request class to specify the geolocation request parameters.
         */
        request.setUri(
            'http://ip-api.com/json/' +
            encodeURIComponent(options.ip)
        );
        request.setMethod('GET');

        /**
         * Get a response from the API
         * by using the httpClient object,
         * which is universally available in all server-side scripts in AM:
         * {@link https://backstage.forgerock.com/docs/am/7.1/scripting-guide/scripting-api-global-http-client.html#scripting-api-global-http-client}.
         */
        response = httpClient.send(request).get();

        /**
         * Use methods of the Response class to process the response received from the API:
         * {@link https://backstage.forgerock.com/docs/am/7.1/apidocs/org/forgerock/http/protocol/Response.html}.
         */
        if (response.getStatus().getCode() === 200) {
            var result = JSON.parse(response.getEntity().getString());

            /**
             * If a qualifying result is found, associate its location information with the returned value.
             */
            if (result) {
                if (result.status === 'success') {
                    loginLocation = {
                        longitude: result.lon,
                        latitude: result.lat,
                        country: result.countryCode
                    };
                }
            }
        }

        return loginLocation;
    }

    /**
     * Get the client IP address from the X-Forwarded-For request header
     * in deployments with AM behind a balance loader or a reverse proxy.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For}.
     *
     * Otherwise, in an "on premise" installation,
     * you need to obtain the client IP address with a script running in the browser
     * (or you'd need to have access to the request object, which is currently not an option in AM scripted decision context).
     * @returns {string|undefined}
     */
    function getClientIPAddress () {
        var ip;

        var xForwardedFor = requestHeaders.get('x-forwarded-for');

        if (xForwardedFor) {
            ip = String(xForwardedFor.toArray()[0].split(',')[0]);
        }

        return ip;
    }

    /**
     * @type {LoginLocation} A JavaScript object containing the location information.
     */
    var loginLocation = getLoginLocationFromIPAddress({
        ip: getClientIPAddress()
    });

    /**
     * Exchange location information with the other nodes down the authentication journey
     * by saving it in the sharedState object as JSON,
     * and set the outcome to a path associated with this node in the authentication journey.
     */
    if (loginLocation) {
        sharedState.put('loginLocation', JSON.stringify(loginLocation));

        outcome = 'Successful';
    } else {
        outcome = 'Unsuccessful';
    }
}());
