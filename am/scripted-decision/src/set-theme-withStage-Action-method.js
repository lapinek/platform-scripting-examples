/**
 * @file Set theme in Platform UI by sending the theme name to the browser with the withStage method of the Action interface.
 */

/**
 * Use function scope to avoid inconsistent behavior
 * that may occur in the top-level scope in AM Rhino.
 */
(function () {
    /**
     * Import the Action class
     * and callbacks to send to the client side.
     */
    var javaImports = JavaImporter(
        org.forgerock.openam.auth.node.api.Action,
        com.sun.identity.authentication.callbacks.ScriptTextOutputCallback
    );

    /**
     * Provide a theme name.
     * You don't have to provide a theme ID if you want the theme to be applied on the callback screen;
     * using withStage method, the theme change will take effect immediately.
     *
     * Note, however, that if you use your scripted decision in a Page Node instance,
     * which has the Stage setting, setting theme by using withStage will not work.
     */
    var themeNameOrId = 'Pink Sensations';
    /**
     * Submit the form automatically if you don't want to stay on the callback screen.
     */
    var script = 'document.querySelector(\'button[type="submit"]\').click();';

    if (callbacks.isEmpty()) {
        /**
         * Send the callback(s) to the browser
         * and provide theme information as an argument to withStage method.
         */
        action = javaImports.Action.send(
            javaImports.ScriptTextOutputCallback(script)
        ).withStage('themeId=' + themeNameOrId).build();
    } else {
        /**
         * Proceed to 'true' path after the callback form has been submitted.
         */
        action = javaImports.Action.goTo('true').build();
    }
}());