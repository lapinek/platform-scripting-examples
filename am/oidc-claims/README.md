# ForgeRock Access Management (AM) [OIDC Claims Script](https://backstage.forgerock.com/docs/am/7.1/oidc1-guide/scripted-oidc-claims.html) Examples

* ## Saving AM User Session Information in a Claim, and Resetting the Session Idle Timeout by Using the SSO Token

    Example script: [get-and-reset-user-session.js](src/get-and-reset-user-session.js).

    ### The Premise

    A third-party Relying Party (RP) might not be able to include the OpenID Provider (OP) cookies in requests made via the back channel. For example, including cookies in XHR requests from a different domain might be affected by the third-party cookies restrictions implemented in the browser, and for requests made from the server side a third-party application won't have access to the cookies set by the authorization server.

    Therefore, maintaining a user session at the OP via the back channel, silently, may need to be implemented without reliance on the OP's session cookies.

    In AM, the session information could be accessible in the context of the OIDC Claims script, which runs when ID token claims are being processed. Thus, the session information could be included in a custom ID token claim.

    The session context in the script is provided via the `session` binding, which represents an instance of the [SSOToken](https://backstage.forgerock.com/docs/am/7.1/apidocs/com/iplanet/sso/SSOToken.html) class.

    The `session` binding is currently available in the OIDC Claims script only when the session cookie is included in the OIDC authentication request; for example, during an interactive authorization code grant initiated in the front channel.

    ### Trusted Relying Party (RP)

    In these conditions, a _trusted_ RP application running in a different domain could maintain a (CTS-Based) user session at AM by providing the SSO token in a REST call to the [/json/sessions/](https://backstage.forgerock.com/docs/am/7.1/sessions-guide/managing-sessions-REST.html) endpoint.

    > To make this call silently from a browser, via an XHR request, you will need to add the session token header name (typically, iPlanetDirectoryPro) to the accepted headers in your CORS service configuration, in the AM console > CONFIGURE > Global Services > CORS Service > Secondary Configurations > _CORS configuration name_ > Accepted Headers.

    The SSO token could be obtained from the `session` object with its `getTokenID()` method.

    > For this to work, you will need the `com.iplanet.sso.providers.dpro.SSOTokenIDImpl` Java class to be allowed in the scripting engine configuration for the OIDC Claims Script type.

    Then, the session token could be included as a custom claim in the ID token sent to the RP.

    > With an RP that is a Single Page Application (SPA), storing the almighty SSO token in a browser should be well considered.

    ### Untrusted RP

    An untrusted third-party application, belonging to a business entity different from the one maintaining the authorization server, should not have access to the user's SSO token.

    _If/when_ the `session` binding were defined every time the ID token is issued, and the user session is not terminated, presence of a claim based on the session information could serve for the RP as an indication of an active user session, and its absence could be used by the RP to effect the single sign out functionality.

    In addition, the user session could be renewed from the script by sending a request to the `/json/sessions/` endpoint; thus, relieving a trusted RP from the responsibility to maintain the SSO token, and providing a safe option to renew the user session for an untrusted RP.

    > To make an HTTP request from the OIDC Claims script, you will need the following Java classes to be allowed in the scripting engine configuration for this script type:
    >
    > * `org.forgerock.http.protocol.*`
    > * `org.forgerock.http.Client`
    > * `org.forgerock.util.promise.PromiseImpl`

    ### Example of an ID Token With Session Information:

    ```json
    {
        "at_hash": "7y7kdvI4P97EOrng0kn7jw",
        "sub": "85f8cdd0-59f5-4d4c-b6f9-5fe0857c0f8c",
        "auditTrackingId": "e6716ee2-32ee-4b32-ade6-19c7f3760c87-80295",
        "subname": "85f8cdd0-59f5-4d4c-b6f9-5fe0857c0f8c",
        "iss": "https://default.iam.example.com/am/oauth2",
        "tokenName": "id_token",
        "session": {
            "timeLeft": 7199,
            "tokenId": "VxYoSm207yxijytEXTW2HUkNCmM.*AAJTSQACMDIAAlNLABxsQTFuU3NtMW00L3QxWTFiZmUrU2l4aitDSEU9AAR0eXBlAANDVFMAAlMxAAIwMQ..*"
        },
        "given_name": "user",
        "nonce": "Y2u8L7AjPOknYx7ESDJwNaAi2-3xloI79UWiS4vp6BQ",
        "sid": "E90taYovhKEMRrTu0+mTc64/1KbrHnG0z1QLtlSqV9o=",
        "aud": "node-openid-client",
        "c_hash": "8kF3xWVmnEzh51oqDD2Vvw",
        "acr": "0",
        "org.forgerock.openidconnect.ops": "GQgVZAO0mKmrPBru9WYymF2nJwI",
        "s_hash": "EdwNOuHRohV2HCUbUYONbg",
        "azp": "node-openid-client",
        "auth_time": 1625071581,
        "name": "user 0",
        "realm": "/",
        "exp": 1625075181,
        "tokenType": "JWTToken",
        "iat": 1625071581,
        "family_name": "0"
    }
    ```
