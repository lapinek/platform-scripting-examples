(function () {
    'use strict';

    /*
    isUserTrustedDevicePresent is function used to check if the current Device which the user is
    signing in with is part of the trusted device registered in the users profile.
    Params {object} currentDevice,{object} userDevices, {Logger} logger
    return {Boolean} flag
    */
    function isUserTrustedDevicePresent(currentDevice, userDevices) {
        var userTrustedDevicePresent;
        var currentDeviceObject;
        var currentDate;
        var userDeviceObject;
        var userDeviceDate;

        try {
            currentDeviceObject = JSON.parse(currentDevice);
        } catch (e) {
            logger.message('Error: the current device data cannot be parsed.');
        }

        if (currentDeviceObject && userDevices.length) {
            userDevices.forEach(function (userDevice) {
                try {
                    userDeviceObject = JSON.parse(userDevice);
                } catch (e) {
                    logger.message('Error: the stored device data cannot be parsed.');
                }

                if (userDeviceObject && String(userDeviceObject.id) === String(currentDeviceObject.id)) {
                    currentDate = new Date(Date.now());
                    userDeviceDate = new Date(userDeviceObject.timestamp.split(' ').join('T') + '.000' + 'Z');

                    if ((currentDate - userDeviceDate) / (1000 * 60 * 60 * 24) < 180) {
                        userTrustedDevicePresent = true;
                    }
                }
            });
        }

        // logger.info("JNL_MFA_Applicable: Device Match for user :"  + sharedState.get("username") + " : " + userTrustedDevicePresent);
        return userTrustedDevicePresent;
    }

    function getRdnValues(dNs) {
        return dNs.map(function (dN) {
            return String(dN.split(',')[0].split('=')[1]);
        });
    }

    function intersectArrays(array1, array2) {
        /**
         * Create a new array out of matching values.
         */
        return array1.filter(function (item1) {
            return array2.filter(function (item2) {
                return item1 === item2;
            }).length;
        });
    }

    var javaImports = JavaImporter(
        org.forgerock.openam.auth.node.api.Action
    );

    var outcome;

    // users of the following group doesn't require MFA to complete login
    // String mfaGroup1 = "cn=Jackson.com-MFA,ou=groups,ou=identities";
    // String mfaGroup2 = "cn=Internal-MFA,ou=groups,ou=identities";
    var noMfaGroups = [
        'cn=NoMFA,ou=groups,ou=identities'
    ];
    var accessFlowKey = 'access_flow';

    // MFA options
    var mfaOptions = [
        'SMS',
        'VOICE',
        'TOTP'
    ];

    // Read mfa configuration,group information and device list from users profile
    var userId = sharedState.get('_id');
    var mfaList = idRepository.getAttribute(userId, 'fr-attr-imulti1').toArray();
    var userDevices = idRepository.getAttribute(userId, 'fr-attr-imulti2').toArray();
    var memberships = idRepository.getAttribute(userId, 'isMemberOf').toArray();

    // Read currentDevice,username and passwordRest flag from sharedState
    var currentDevice = sharedState.get('frIndexedMultivalued2');
    var passwordRest = sharedState.get('frIndexedString3');

    // Start logic to check next step
    if (!(passwordRest && String(passwordRest).toLowerCase() !== 'false')) {
        // password reset flag is not set
        if (intersectArrays(getRdnValues(memberships), getRdnValues(noMfaGroups)).length) {
            // user is part of no-MFA group
            outcome = 'no-mfa-required';
        } else {
            // User not part of no MFA group
            if (intersectArrays(mfaList.map(function (mfaOption) {return String(mfaOption);}), mfaOptions).length) {
                if (!isUserTrustedDevicePresent(currentDevice, userDevices)) {
                    // user has mfa factors registered but does not have device registered
                    // logger.info("[[[[ JNL_MFA_Applicable: MFA Device Preset ]]]]");
                    outcome = 'mfa-selection';
                } else {
                    // user provides valid device-id
                    outcome = 'no-mfa-required';
                }
            }
            else {// user has an unknown device or no device at all
                outcome = 'mfa-registration';
            }
        }
    } else {
        // password reset flag is set
        outcome = 'force-password-reset';
    }

    sharedState.put(accessFlowKey, outcome);

    action = javaImports.Action.goTo(outcome).build();
}());
