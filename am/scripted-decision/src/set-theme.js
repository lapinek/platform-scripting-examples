/**
 * @file Save data, including a theme ID, in the browser's localStorage with ScriptTextOutputCallback.
 */

var javaImports = JavaImporter(
    org.forgerock.openam.auth.node.api.Action,
    com.sun.identity.authentication.callbacks.ScriptTextOutputCallback
);

var localStorageItems = {
    'theme-id': 'Pink Vibrations'
};

var script;
var scriptParts = [];
scriptParts.push('let localStorageItems = ' + JSON.stringify(localStorageItems) + ';');
scriptParts.push('Object.keys(localStorageItems).forEach((key) => {localStorage.setItem(key, localStorageItems[key]);});');
scriptParts.push('document.querySelector(\'button[type="submit"]\').click();');

script = scriptParts.join('\n');

if (callbacks.isEmpty()) {
    action = javaImports.Action.send(
        javaImports.ScriptTextOutputCallback(script)
    ).build();
} else {
    action = javaImports.Action.goTo('true').build();
}
