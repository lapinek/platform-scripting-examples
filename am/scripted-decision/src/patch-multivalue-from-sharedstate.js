(function () {
    'use strict';

    var currentDeviceObject;
    var deviceIdKey = 'id';

    var currentDeviceKey = 'frIndexedMultivalued2';
    var profileDevicesAttributeName = 'fr-attr-imulti2';
    var userId = sharedState.get('_id');

    try {
        currentDeviceObject = JSON.parse(sharedState.get(currentDeviceKey));
    } catch (e) {
        logger.message('Error: the current device data cannot be parsed.');
    }

    var profileDevices = idRepository.getAttribute(userId, profileDevicesAttributeName).toArray();

    if (currentDeviceObject) {
        profileDevices = profileDevices.filter(function (profileDevice) {
            var profileDeviceObject;

            try {
                profileDeviceObject = JSON.parse(profileDevice);
            } catch (e) {
                logger.message('Error: the profile device data cannot be parsed.');
            }

            if (profileDeviceObject && String(profileDeviceObject[deviceIdKey]) !== String(currentDeviceObject[deviceIdKey])) {
                return true;
            }
        });

        sharedState.get('objectAttributes').put(currentDeviceKey, profileDevices.concat(JSON.stringify(currentDeviceObject)));
    }

    outcome = 'true';
}());
