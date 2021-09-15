# ForgeRock Access Management (AM) [Scripted Decision](https://backstage.forgerock.com/docs/am/7.1/authentication-guide/scripting-api-node.html) Examples

* ## Sending Data to the Browser with [ScriptTextOutputCallback](https://backstage.forgerock.com/docs/am/7.1/authentication-guide/authn-supported-callbacks.html#backchannel-callbacks)

    Example script: [set-theme.js](src/set-theme.js)

    In this example, an object with a single key is sent to the browser to be saved in its `localStorage`.

    For this instance, a (custom) theme is be defined in the Hosted Pages screen in a ForgeRock Platform deployment.

    The theme ID is saved in the browser's `localStorage` with a script sent to the client side with a `ScriptTextOutputCallback` during authentication, so that the theme can be picked up by the Platform UI.

    <img src="README_files/set-theme-administration.png" alt="Hosted Pages Screen in the ForgeRock Platform Administration UI" width="718">

    <img src="README_files/set-theme-journey.png" alt="Authentication Journey Configuration Screen in the ForgeRock Platform Administration UI with a Scripted Decision Node Setting the Custom Theme" width="718">

    <img src="README_files/set-theme-sign-in-screen.png" alt="Sign In Screen with Custom Theme Applied" width="512">


