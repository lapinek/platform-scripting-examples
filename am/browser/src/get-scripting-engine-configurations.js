/**
 * @file Request AM scripting engine configuration(s) over REST using ForgeRock Platform Admin browser console.
 * @author Konstantin Lapine <konstantin.lapine@forgerock.com>
 */

/**
 * @todo Sign in the Platform admin UI.
 * @todo Copy and paste the content of this file into your browser console.
 * @todo Specify search criteria.
 * @example
 * const classNamePart = 'TimeZone';
 */
var classNamePart = '<string-to-find-in-allowed-classes>';

(async function () {
    /**
     * Get scripting engine configuration(s) from the global config.
     * @returns {array}
     */
    async function getScriptingEngineConfigurations() {
        /**
         * Comment out types you are not interested in (at the moment).
         */
        var scriptTypes = [
            'authentication_server_side',
            'authentication_tree_decision_node',
            'oauth2_access_token_modification',
            'oauth2_evaluate_scope',
            'oauth2_may_act',
            'oauth2_validate_scope',
            'oidc_claims',
            'policy_condition',
            'saml2_idp_attribute_mapper',
            'social_idp_profile_transformation'
        ];

        var scriptingEngineConfigurations = [];

        for (var scriptType of scriptTypes) {
            var scriptingEngineConfigurationResponse = await fetch(`${location.origin}/am/json/global-config/services/scripting/contexts/${scriptType}/engineConfiguration`);

            var scriptingEngineConfiguration = await scriptingEngineConfigurationResponse.json();
            scriptingEngineConfiguration.name = scriptingEngineConfigurationResponse.url.split('/').at(-2);

            scriptingEngineConfigurations.push(scriptingEngineConfiguration);
        }

        return scriptingEngineConfigurations;
    }

    /**
     * Get the scripting engine configurations.
     */
    var scriptingEngineConfigurations = await getScriptingEngineConfigurations();

    /**
     * Analyze the scripting engine configurations content.
     */
    scriptingEngineConfigurations.forEach(async (scriptingEngineConfiguration) => {
        /**
         * Output the script type.
         */
        console.log(`${scriptingEngineConfiguration.name}:`);

        // Examples:

        /**
         * Output the entire allowed Java list.
         */
        console.log('Full List of Allowed Classes:', scriptingEngineConfiguration.whiteList);

        /**
         * Check if a class name is present in the allowed Java.
         * If an empty array is returned, it means the class was not found.
         */
        console.log(`Found "${classNamePart}" occurrences in Allowed Classes:`, scriptingEngineConfiguration.whiteList.filter((className) => {
            return className.indexOf(classNamePart) !== -1;
        }));
    });
}());
