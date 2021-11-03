/**
 * @file Set multiple session properties
 * in a Scripted Decision Node script
 * in ForgeRock Access Management (AM).
 * @see {@link https://backstage.forgerock.com/docs/am/7.1/authentication-guide/scripting-api-node.html#scripting-api-node-sessionProperties}.
 */

(function () {
    'use strict';

    var javaImports = JavaImporter(
        org.forgerock.openam.auth.node.api.Action
    );

    var sessionProperties = [
        {
            key: 'customKey1',
            value: 'customValue1'
        },
        {
            key: 'customKey2',
            value: 'customValue2'
        }
    ];

    try {
        /**
         * Get an instance of the ActionBuilder object
         * by calling a static method of the Action Interface.
         */
        var actionBuilder = javaImports.Action.goTo('true');

        sessionProperties.forEach(function (sessionProperty) {
            /**
             * Use the corresponding ActionBuilder instance method
             * to add a custom property to the user session.
             */
            actionBuilder.putSessionProperty(sessionProperty.key, sessionProperty.value);
        });

        /**
         * Assign the node action binding with the expected Action instance.
         */
        action = actionBuilder.build();
    } catch (e) {
        logger.error('e: ' + e);
        outcome = 'false';
    }
}());
