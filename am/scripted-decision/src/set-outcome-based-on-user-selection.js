(function () {
    'use strict';

    var javaImports = JavaImporter(
        javax.security.auth.callback.ChoiceCallback,
        javax.security.auth.callback.NameCallback,
        org.forgerock.openam.auth.node.api.Action
    );

    var callbackList;
    var selectedIndex;
    var profileMfaOptionsAttributeName = 'fr-attr-imulti1';
    var mfaOptions = [
        'SMS',
        'VOICE',
        'TOTP'
    ];
    var accessFlowKey = 'access_flow';
    var choiceName = 'MFA Registration';

    var userId = sharedState.get('_id');
    var accessFlow = String(sharedState.get(accessFlowKey));

    if (accessFlow !== 'mfa-registration') {
        choiceName = 'MFA Selection';

        mfaOptions = idRepository.getAttribute(userId, profileMfaOptionsAttributeName).toArray().map(function (mfaOption) {
            return String(mfaOption);
        });
    }

    if (callbacks.isEmpty()) {
        /**
         * Present choices for MFA selection.
         */
        callbackList = [
            new javaImports.ChoiceCallback(choiceName, mfaOptions, 0, false),
            new javaImports.NameCallback('Enter MFA selection', 'Enter Here')
        ];

        action = javaImports.Action.send.apply(null, callbackList).build();
    } else {
        selectedIndex = mfaOptions.indexOf(String(callbacks.get(1).getName()));

        if (selectedIndex === -1) {
            selectedIndex = callbacks.get(0).getSelectedIndexes()[0];
        }

        action = javaImports.Action.goTo(mfaOptions[selectedIndex]).build();
    }
}());
