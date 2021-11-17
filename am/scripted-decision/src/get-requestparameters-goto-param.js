/**
 * @file Get an individual goto parameter value
 * during an OAuth 2.0 authorization code grant.
 * in a Scripted Decision Node script
 * in ForgeRock Access Management (AM).
 * @see {@link https://backstage.forgerock.com/docs/am/7.1/authentication-guide/scripting-api-node.html}.
 * @version 0.1.0
 */

function getGotoParamValue(gotoParamName) {
    var gotoParam;
    var gotoParamValue;
    var gotoParams = requestParameters.get('goto').toArray()[0];
    if (gotoParams) {
        gotoParam = String(gotoParams).split('&').filter(function (gotoParam) {
            var key = gotoParam.split('=')[0];
            return key === gotoParamName;
        })[0];

        if (gotoParam) {
            gotoParamValue = gotoParam.split('=')[1];
        }

        return gotoParamValue;
    }
}

(function () {
    'use strict';

    try {
        var gotoValue = getGotoParamValue('darinder');

        logger.error('gotoValue: ' + gotoValue);

        outcome = 'true';
    } catch (e) {
        logger.error('e: ' + e);
        outcome = 'false';
    }
}());
