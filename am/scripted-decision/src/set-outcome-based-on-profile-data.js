(function () {
    'use strict';

    var deviceKey = 'frIndexedMultivalued2';
    var timestampKey = 'timestamp';
    var deviceIdKey = 'id';
    var profileMfaOptionsAttributeName = 'fr-attr-imulti1';
    var profileResetPasswordAttributeName = 'fr-attr-istr3';
    var mfaOptions = [
        'SMS',
        'VOICE',
        'TOTP'
    ];
    var accessFlowKey = 'access_flow';

    // users of the following group doesn't require MFA to complete login
    // String mfaGroup1 = "cn=Jackson.com-MFA,ou=groups,ou=identities";
    // String mfaGroup2 = "cn=Internal-MFA,ou=groups,ou=identities";
    var noMfaGroups = [
        'cn=NoMFA,ou=groups,ou=identities'
    ];

    var userId = sharedState.get('_id');

    var resetPassword = idRepository.getAttribute(userId, profileResetPasswordAttributeName).toArray()[0];
    resetPassword = !!resetPassword && String(resetPassword) !== 'false';

    // Read from user's profile
    var userGroups = idRepository.getAttribute(userId, 'isMemberOf').toArray();
    var userMfaOptions = idRepository.getAttribute(userId, profileMfaOptionsAttributeName).toArray().map(function (mfaOption) {
        return String(mfaOption);
    });

    /*
    isUserTrustedDevicePresent is function used to check if the current Device which the user is
    signing in with is part of the trusted device registered in the users profile.
    Params {object} currentDevice,{object} userDevices, {Logger} logger
    return {Boolean} flag
    */
    function isUserTrustedDevicePresent() {
        var userTrustedDevicePresent;
        var currentDeviceObject;
        var currentDate;
        var userDeviceDate;

        var currentDevice = sharedState.get(deviceKey);
        var userDevices = idRepository.getAttribute(userId, 'fr-attr-imulti2').toArray();

        try {
            currentDeviceObject = JSON.parse(currentDevice);
        } catch (e) {
            logger.message('Error: the current device data cannot be parsed.');
        }

        if (currentDeviceObject) {
            userDevices.forEach(function (userDevice) {
                var userDeviceObject;

                try {
                    userDeviceObject = JSON.parse(userDevice);
                } catch (e) {
                    logger.message('Error: the stored device data cannot be parsed.');
                }

                if (userDeviceObject && String(userDeviceObject[deviceIdKey]) === String(currentDeviceObject[deviceIdKey])) {
                    currentDate = new Date(Date.now());
                    userDeviceDate = new Date(userDeviceObject[timestampKey].split(' ').join('T') + '.000' + 'Z');

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

    // Start logic to check next step
    if (!resetPassword) {
        // password reset flag is not set
        if (intersectArrays(getRdnValues(userGroups), getRdnValues(noMfaGroups)).length) {
            // user is part of no-MFA group
            outcome = 'no-mfa-required';
        } else {
            // User not part of no MFA group
            if (intersectArrays(userMfaOptions, mfaOptions).length) {
                if (!isUserTrustedDevicePresent()) {
                    // user has mfa factors registered but does not have device registered
                    // logger.info("[[[[ JNL_MFA_Applicable: MFA Device Preset ]]]]");
                    outcome = 'mfa-selection';
                } else {
                    // user provides valid device-id
                    outcome = 'no-mfa-required';
                }
            } else {
                outcome = 'mfa-registration';
            }
        }
    } else {
        // password reset flag is set
        outcome = 'force-password-reset';
    }

    sharedState.put(accessFlowKey, outcome);
}());
