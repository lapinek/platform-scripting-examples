# ForgeRock Platform Scripting Examples

## <a id="contents" name="contents"></a>Contents

* [ForgeRock Access Management (AM)](#am)
    * [Scripted Decision](#am-scripted-decision)
        * [Send Data (for example, a theme ID) to the Browser, and save it in `localStorage` with `ScriptTextOutputCallback`](#am-scripted-decision-send-data-to-the-browser)
        * [Set a Theme with a Method of the `Action Interface`](#am-scripted-decision-set-theme-withStage-Action-method)
        * [Get User Location from Their Postal or Physical Address and Save the Location Information in `sharedState`](#am-scripted-decision-location-from-postal-or-physical-address)
        * [Get User Location from Their IP Address and Save the Location Information in `sharedState`](#am-scripted-decision-location-from-ip-address)
        * [Set a Session Property Based on a Value Saved in `sharedState`](#am-scripted-decision-set-session-property-from-sharedstate)

---

## <a id="am" name="am"></a>ForgeRock Access Management (AM)

## <a id="am-scripted-decision" name="am-scripted-decision"></a>[Scripted Decision](https://backstage.forgerock.com/docs/am/7.1/authentication-guide/scripting-api-node.html)

* ### <a id="am-scripted-decision-send-data-to-the-browser" name="am-scripted-decision-send-data-to-the-browser"></a>Send Data (for example, a theme ID) to the Browser, and save it in `localStorage` with [ScriptTextOutputCallback](https://backstage.forgerock.com/docs/am/7.1/authentication-guide/authn-supported-callbacks.html#backchannel-callbacks)

    [Back to Contents](#contents)

    [Example Script](am/scripted-decision/src/set-localStorage-with-ScriptTextOutputCallback.js)

    An object with a single key is sent to the browser as a part of a script to be run on the client side. The script will save each object entry as an item in browser `localStorage`.

    In this instance, a (custom) theme name is saved in `localStorage`, so that the theme can be picked up by the Platform UI. Please see comments in the example script for further details.

    > Saving theme _name_ in `localStorage` with a client-side script will not take immediate effect; the Platform UI will pick up the theme information and translate it into the theme ID for the next request, after the callback form is submitted. If you want the theme to applied to the callback screen, you could save a theme _ID_ in `localStorage`. You can get available themes with REST call; for example:
    >
    > ```javascript
    > /**
    >  * Run in the browser console.
    >  */
    >
    > /**
    >  * Add Authorization header if your a not signed in as a Platform administrator.
    >  */
    > // var myHeaders = new Headers();
    > // myHeaders.append("Authorization", "Bearer eyJ0eX...gexLig");
    >
    > var requestOptions = {
    >     method: 'GET',
    >     headers: myHeaders,
    >     redirect: 'follow'
    > };
    >
    > fetch("https://openam-dx-kl02.forgeblocks.com/openidm/config/ui/themerealm", requestOptions)
    >     .then(response => response.json())
    >     .then(result => result.realm['alpha'].map(function (theme) {console.log(theme.name, theme._id)> ;}))
    >     .catch(error => console.log('error', error));
    > ```
    >
    > Which will result in something like the following:
    >
    > ```
    > Contrast ba2d64e1-f1dc-489f-b6d1-91a06c284778
    > Highlander e0ec9eca-6b30-4b5e-b6e4-b25211a7e3f3
    > Pink Sensations c3e70128-ea6a-49c1-9d37-97b4f2745e99
    > Robroy bd5af604-f11b-4b16-b5e9-e40b8f267453
    > Starter Theme b54477be-10ac-4c45-bb4a-ce6ec6d16610
    > Zardoz 7349ff5d-cf42-43ab-9fc6-c3551b26ca8c
    > ```
    >
    > Then, in your scripted decision, you can send a theme ID to the client side, instead of its name:
    >
    > ```javascript
    > // var themeNameOrId = 'Pink Sensations';
    > var themeNameOrId = 'c3e70128-ea6a-49c1-9d37-97b4f2745e99';
    > ```
    >
    > Note, however, that if you place your scripted decision in a Page Node instance, which has Stage setting, saving theme ID in localStorage will not take immediate effect, and will only apply to the next request, after the callback form is submitted.


* ### <a id="am-scripted-decision-set-theme-withStage-Action-method" name="am-scripted-decision-set-theme-withStage-Action-method"></a>Set a Theme with a Method of the [Action Interface](https://backstage.forgerock.com/docs/am/7.1/auth-nodes/core-action.html)

    [Back to Contents](#contents)

    [Example Script](am/scripted-decision/src/set-theme-withStage-Action-method.js)

    In a scripted decision callback screen, you can apply a theme using its name with immedeate effect by utilizing designated (but undocumented) [withStage](https://stash.forgerock.org/projects/OPENAM/repos/openam/browse/openam-auth-trees/auth-node-api/src/main/java/org/forgerock/openam/auth/node/api/Action.java#256) method of the Action Interface:

    ```javascript
    action = javaImports.Action.send(
        javaImports.ScriptTextOutputCallback(script)
    ).withStage('themeId=' + themeNameOrId).build();
    ```

    > You can find, update, or create a theme in the Platform Administrator under Hosted Pages. The theme name can serve as the theme ID in your scripted decision.
    >
    > <img src="README_files/set-theme-administration.png" alt="Hosted Pages Screen in the ForgeRock Platform Administration UI" width="718">
    >
    > <img src="README_files/set-theme-journey.png" alt="Authentication Journey Configuration Screen in the ForgeRock Platform Administration UI with a Scripted Decision Node Setting the Custom Theme" width="718">
    >
    > <img src="README_files/set-theme-sign-in-screen.png" alt="Sign In Screen with Custom Theme Applied" width="512">
    >

* ### <a id="am-scripted-decision-location-from-postal-or-physical-address" name="am-scripted-decision-location-from-postal-or-physical-address"></a>Get User Location from Their Postal or Physical Address and Save the Location Information in `sharedState`

    [Back to Contents](#contents)

    [Example Script](am/scripted-decision/src/get-location-from-postal-address.js)

* ### <a id="am-scripted-decision-location-from-ip-address" name="am-scripted-decision-location-from-ip-address"></a>Get User Location from Their IP Address and Save the Location Information in `sharedState`

    [Back to Contents](#contents)

    [Example Script](am/scripted-decision/src/get-location-from-ip-address.js)

    You can get the client IP address from the [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For) request header in deployments with AM behind a balance loader or a reverse proxy.

    Otherwise, in an "on premise" installation, you'll need to obtain the client IP address with a script running in the browser. Accessing the request object in the scripted decision context is currently not an option.


* ### <a id="am-scripted-decision-set-session-property-from-sharedstate" name="am-scripted-decision-set-session-property-from-sharedstate"></a>Set a Session Property Based on a Value Saved in `sharedState`

    [Back to Contents](#contents)

    [Example Script](am/scripted-decision/src/set-session-property.js)

