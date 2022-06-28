/**
 * @file Parse a simple one-level XML content into a JavaScript object.
 * @author Konstantin Lapine <konstantin.lapine@forgerock.com>
 */

/**
 * Use function scope for consistent type coercion in AM scripts.
 */
(function () {
    'use strict';

    try {
        const xmlString = '<InvalidPassword><InvalidCount>2</InvalidCount><LastInvalidAt>1643827544467</LastInvalidAt><LockedoutAt>0</LockedoutAt><ActualLockoutDuration>0</ActualLockoutDuration><NoOfTimesLocked>0</NoOfTimesLocked></InvalidPassword>';

        const xmlObject = xmlString.split(/<\/\w+><?|></g).reduce(function (xmlObject, e) {
            const keyValueArray = e.split('>');
            const key = keyValueArray[0];
            const value = keyValueArray[1];
            if (value) {
                xmlObject[key] = value;
            }
            return xmlObject;
        }, {});

        logger.error('xmlObject: ' + JSON.stringify(xmlObject));

        outcome = 'true';
    } catch (e) {
        logger.error('e: ' + e);
        outcome = 'false';
    }
}());
