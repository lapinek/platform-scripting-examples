/**
 * @file Save data—for example, a theme name or ID—in browser localStorage with ScriptTextOutputCallback.
 */

/**
 * Use function scope to avoid inconsistent behavior
 * that may occur in the top-level scope in AM Rhino.
 */
(function () {
    var javaImports = JavaImporter(
        org.forgerock.openam.auth.node.api.Action,
        com.sun.identity.authentication.callbacks.ScriptTextOutputCallback
    );

    /**
     * Save theme name in localStorage to be picked up and translated to the theme ID in the next request.
     */
    var themeNameOrId = 'Pink Sensations';

    /**
     * Alternatively, use theme ID for the changes to take effect immediately.
     *
     * Get themes information via REST,
     * @example
     * // Run in the browser console:
     *
     * var requestOptions = {
     *   method: 'GET'
     * };
     *
     * fetch("https://openam-dx-kl02.forgeblocks.com/openidm/config/ui/themerealm", requestOptions)
     *   .then(response => response.json())
     *   .then(result => result.realm['alpha'].map(function (theme) {
     *       console.log(theme.name, theme._id, theme.isDefault);
     *   }))
     *   .catch(error => console.log('error', error));
     *
     * The results might look similar to the following:
     * @example
     * Contrast ba2d64e1-f1dc-489f-b6d1-91a06c284778 false
     * Highlander e0ec9eca-6b30-4b5e-b6e4-b25211a7e3f3 false
     * Pink Sensations c3e70128-ea6a-49c1-9d37-97b4f2745e99 true
     * Robroy bd5af604-f11b-4b16-b5e9-e40b8f267453 false
     * Starter Theme b54477be-10ac-4c45-bb4a-ce6ec6d16610 false
     * Zardoz 7349ff5d-cf42-43ab-9fc6-c3551b26ca8c false
     *
     * Note, however, that if you use your scripted decision in a Page Node instance,
     * which has the Stage setting, saving theme ID in localStorage will not take immediate effect,
     * and will only apply to the next request, after the callback form is submitted.
     */
    // var themeNameOrId = 'c3e70128-ea6a-49c1-9d37-97b4f2745e99';

    var localStorageItems = {
        'theme-id': themeNameOrId
    };

    var script;
    var scriptParts = [];
    scriptParts.push('let localStorageItems = ' + JSON.stringify(localStorageItems) + ';');
    scriptParts.push('Object.keys(localStorageItems).forEach((key) => {localStorage.setItem(key, localStorageItems[key]);});');
    /**
     * Submit the form automatically if you don't want to stay on the callback screen.
     */
    scriptParts.push('document.querySelector(\'button[type="submit"]\').click();');

    script = scriptParts.join('\n');

    if (callbacks.isEmpty()) {
        action = javaImports.Action.send(
            javaImports.ScriptTextOutputCallback(script)
        ).build();
    } else {
        action = javaImports.Action.goTo('true').build();
    }
}());
