/**
 * @file Provides a JavaScript example of a custom claim resolver for the OIDC Claims script
 * in ForgeRock Access Management (AM) serving the role of an OpenID Provider (OP).
 * @version 0.1.0
 */

/**
 * An example of a custom claim resolver function to be added to the OIDC Claims script:
 * {@link https://stash.forgerock.org/projects/CLOUD/repos/forgeops/browse/config/7.0/cdk/am/config/services/realm/root/scriptingservice/1.0/globalconfig/default/globalscripts/OIDCClaimsScript.javascript#175}.
 *
 * When the session binding,
 * {@link https://backstage.forgerock.com/docs/am/7.1/apidocs/com/iplanet/sso/SSOToken.html},
 * is defined in the script context,
 * return a value associated with the session to the Relying Party (RP),
 * and reset a CTS-Based session idle timeout by using REST:
 * {@link https://backstage.forgerock.com/docs/am/7.1/sessions-guide/managing-sessions-REST.html#rest-api-session-refresh}.
 *
 * Add the provided function as a custom claim resolver:
 * @example
 * utils.setClaimResolvers({
 *     session: getSessionClaim,
 *     [ . . . ]
 * });
 *
 * Remember to add your custom claim to the Supported Claims
 * in the AM console > REALMS > Realm Name > Services > OAuth2 Provider > OpenID Connect,
 * and request the claim in the claims parameter,
 * or map it to a requested scope:
 * @example
 * utils.setScopeClaimsMap({
 *     'fr:idm:*': [
 *         'sessionClaim',
 *         [ . . . ]
 *     ],
 *     [ . . . ]
 * });
 *
 * @returns {object} The selected properties associated with the user session.
 */
function getSessionClaim() {
    var frJava;
    var request;
    var response;
    var sessionClaim = {};

    if (session) {
        try {
            /**
             * Return time left in the session to the RP.
             */
            sessionClaim.timeLeft = String(session.getTimeLeft());

            /**
             * Get the SSO token.
             *
             * The SSO token should only be sent to a TRUSTED RP
             * (that is, an application created by the same business entity as the OP itself).
             * @see README.md for details.
             */
            sessionClaim.tokenId = String(session.getTokenID());

            /**
             * Alternatively, the user session at AM COULD be checked and renewed
             * by any (including an untrusted) RP
             * IF/WHEN the session binding were defined every time the ID token is issued
             * (for example, during the refresh token grant).
             */
            frJava = JavaImporter(
                org.forgerock.http.protocol.Request
            );
            request = new frJava.Request();
            request.setMethod('POST');
            /**
             * For testing in ForgeOps, inside a k8s cluster,
             * {@link https://backstage.forgerock.com/docs/forgeops/7.1/index.html},
             * (you can) use http://am:80/am to avoid trust problems with a self-signed certificate.
             */
            request.setUri('http://am:80/am/json/realms/root/sessions/?_action=refresh');
            request.getHeaders().add('Accept-API-Version', 'resource=4.0, protocol=1.0');
            request.getHeaders().add('iPlanetDirectoryPro', String(session.getTokenID()));

            response = httpClient.send(request).get();
            if (response.getStatus().getCode() === 200) {
                sessionClaim.timeLeft = JSON.parse(response.getEntity().getString()).maxtime;
            }

            // logger.error('sessionClaim: ' + JSON.stringify(sessionClaim));

            return sessionClaim;
        } catch (e) {
            logger.error('Exception: ' + e);
        }
    }
}
