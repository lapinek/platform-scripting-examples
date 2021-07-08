/**
 * @file Determine the authenticating user location
 * based on their postal or physical address
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
     * Derive the location information from an address by using the Google Geocoding API:
     * {@link https://developers.google.com/maps/documentation/geocoding/overview}.
     * @param {object} options An object containing the arguments for geocoding.
     * @param {string} options.address The postal or physical address to geocode.
     * @param {string} options.googleApiKey The API key associated with a Google account:
     * {@link https://developers.google.com/maps/documentation/geocoding/get-api-key}.
     * @returns {LoginLocation|undefined} A JavaScript object containing the location information.
     */
    function getLoginLocationFromPostalAddress (options) {
        var request;
        var response;
        var loginLocation;

        options = options || {};

        if (!options.address) {
            /**
             * Log a missing required parameter.
             */
            logger.error('No address to geocode is provided.');

            return;
        }

        /**
         * Use the fully qualified name to create an instance of the Request class:
         * {@link https://backstage.forgerock.com/docs/am/7.1/apidocs/org/forgerock/http/protocol/Request.html}
         */
        request = new org.forgerock.http.protocol.Request();

        /**
         * Use methods of the Request class to specify the geocoding request parameters.
         */
        request.setUri(
            'https://maps.googleapis.com/maps/api/geocode/json' +
            '?address=' + encodeURIComponent(options.address) +
            '&key=' + options.googleApiKey
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
            var result = JSON.parse(response.getEntity().getString()).results[0];

            /**
             * If a qualifying result is found, associate its location information with the returned value.
             */
            if (result) {
                /**
                 * Additional logic could be applied to verify the geocoding result.
                 * @example
                 * if (result.types.indexOf('street_address') !== -1) {
                 *     loginLocation = result.geometry.location;
                 * }
                 * @see {@link https://developers.google.com/maps/documentation/geocoding/overview#GeocodingResponses}.
                 */

                if (result.geometry && result.geometry.location) {
                    loginLocation = loginLocation || {};

                    loginLocation.longitude = result.geometry.location.lng;
                    loginLocation.latitude = result.geometry.location.lat;
                }

                if (result.address_components) {
                    result.address_components.forEach(function (addressComponent) {
                        if (addressComponent.types.indexOf('country') !== -1) {
                            loginLocation = loginLocation || {};

                            loginLocation.country = addressComponent.short_name;
                        }
                    });
                }
            }
        }

        return loginLocation;
    }

    /**
     * @returns {string|undefined} The user address.
     */
    function getUserAddress () {
        var address;

        /**
         * The user identifier that can be used by AM to find a user record.
         *
         * In ForgeRock Identity Cloud,
         * an automatically generated UUID is used as the search attribute value,
         * which can be saved in the sharedState object under the "_id" key
         * by including the Identify Existing User node in an authentication journey:
         * {@link https://backstage.forgerock.com/docs/am/7.1/authentication-guide/auth-node-configuration-hints.html#auth-node-identify-existing-user}.
         *
         * Use the "_id" value saved in the sharedState object as the user identifier.
         */
        var username = sharedState.get('_id');

        /**
         * The names of the attributes containing the user address information.
         * This example uses the AM attributes corresponding to the properties of a managed user object
         * exposed in the ForgeRock Platform Admin UIs,
         * as in a ForgeRock Identity Cloud tenant.
         *
         * For user address managed in the AM native console,
         * use the postalAddress attribute.
         * @example
         * [
         *     'postalAddress'
         * ]
         */
        var attributeNames = [
            'street',
            'l',
            'st',
            'postalCode',
            'co'
        ];

        /**
         * A placeholder for the address components
         * obtained from the user record.
         */
        var addressComponents = [];

        /**
         * Get the identity attribute values
         * by using methods of the idRepository object:
         * {@link https://backstage.forgerock.com/docs/am/7.1/authentication-guide/scripting-api-node.html#scripting-api-node-id-repo}.
         */
        attributeNames.forEach(function (attributeName) {
            var attributeValue = idRepository.getAttribute(username, attributeName).toArray()[0];
            if (attributeValue) {
                addressComponents.push(attributeValue);
            }
        });

        /**
         * Present address as a single space-delimited string.
         */
        if (addressComponents.length) {
            address = addressComponents.join(' ');
        }

        return address;
    }

    /**
     * The address to use in the geocoding request:
     * {@link https://developers.google.com/maps/documentation/geocoding/start}.
     */
    var address = getUserAddress();

    /**
     * The API key associated with a Google account:
     * {@link https://developers.google.com/maps/documentation/geocoding/get-api-key}.
     *
     * As a sensitive value, it might come from a secret:
     * {@link https://backstage.forgerock.com/docs/am/7.1/authentication-guide/scripting-api-node.html#scripting-api-authn-secrets},
     * and be stored in the transientState object in a preceding node:
     * {@link https://backstage.forgerock.com/docs/am/7.1/auth-nodes/core-action.html#store-values-in-transient-state}.
     */
    var googleApiKey = transientState.get('googleApiKey');

    /**
     * @type {LoginLocation} A JavaScript object containing the location information.
     */
    var loginLocation = getLoginLocationFromPostalAddress({
        googleApiKey: googleApiKey,
        address: address
    });

    /**
     * Exchange the location information with the other nodes down the authentication journey
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
