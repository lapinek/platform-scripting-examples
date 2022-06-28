/**
 * @file Request AM scripting engine configuration(s) over REST using IDM Admin browser console.
 * @author Konstantin Lapine <konstantin.lapine@forgerock.com>
 */

(async function () {
    /**
     * Get scripting engine configuration(s) from the global config.
     * @returns {array}
     */
    async function getScriptingEngineConfigurations() {
        /**
         * Provide your tenant origin.
         */
        var tenantOrigin = 'https://openam-dx-kl.forgeblocks.com';

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
            var scriptingEngineConfigurationResponse = await fetch(`${tenantOrigin}/am/json/global-config/services/scripting/contexts/${scriptType}/engineConfiguration`);

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
         * Check if a class is present in the allowed Java.
         */
        console.log(scriptingEngineConfiguration.whiteList.find((className) => {
            return className.indexOf('Saml2SsoResponseUtils') !== -1;
        }));
    });

}());
