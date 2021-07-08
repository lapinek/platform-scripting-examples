/**
 * @file Set a session property
 * based on a value saved in the sharedState object
 * in a Scripted Decision Node script
 * in ForgeRock Access Management (AM).
 * @see {@link https://backstage.forgerock.com/docs/am/7.1/authentication-guide/scripting-api-node.html#scripting-api-node-sessionProperties}.
 */

/**
 * Use function scope to avoid inconsistent behavior
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
     * Assign a static method of the Action interface to a variable.
     */
    var goTo = org.forgerock.openam.auth.node.api.Action.goTo;

    /**
     * Get the location information
     * that was saved in the sharedState object by a preceding node.
     * @type {string} JSON representing the LoginLocation object.
     */
    var loginLocation = sharedState.get('loginLocation');

    /**
     * If the location information is available,
     * add it to the session properties,
     * and select a path associated with this node in the authentication journey
     * by using methods of the Action interface:
     * {@link https://backstage.forgerock.com/docs/am/7.1/auth-nodes/core-action.html}.
     */
    if (loginLocation) {
        /**
         * If you need to set more than one session property in the same scripted decision,
         * you can chain the putSessionProperty method:
         * @example
         * var loginLocationFromIP = sharedState.get('loginLocationFromIP');
         * var loginLocationFromAddress = sharedState.get('loginLocationFromAddress');
         * action = goTo('true').putSessionProperty('LoginLocationFromIP', loginLocationFromIP).putSessionProperty('LoginLocationFromAddress', loginLocationFromAddress).build();
         */
        action = goTo('true').putSessionProperty('LoginLocation', loginLocation).build();
    } else {
        action = goTo('false').build();
    }
}());
