(function () {
    'use strict';

    var userId = sharedState.get('_id');

    var oathDevicesAttributeName = 'fr-attr-imulti4';
    var oathDeviceProfilesAttributeName = 'oathDeviceProfiles';
    var oath2faEnabledAttributeName = 'oath2faEnabled';

    /**
     * Get Oath devices from a custom attribute populated with existing data in following format:
     * @example
     * ['{ "uuid": "cb9b26d8-1b18-4ec9-904c-df5e8dccc733", "recoveryCodes": [ ], "sharedSecret": "B73374ED6D951B4D92A1", "deviceName": "OATH Device", "lastLogin": 1633369890, "counter": 0, "checksumDigit": false, "truncationOffset": 0, "clockDriftSeconds": 0 }']
     */
    var oathDevices = idRepository.getAttribute(userId, oathDevicesAttributeName).toArray().map(function (oathDevice) {
        return oathDevice;
    });

    idRepository.setAttribute(userId, oathDeviceProfilesAttributeName, oathDevices);
    idRepository.setAttribute(userId, oath2faEnabledAttributeName, ['2']);

    outcome = 'true';
}());
