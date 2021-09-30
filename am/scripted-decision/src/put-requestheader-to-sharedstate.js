(function () {
    'use strict';

    var javaImports = JavaImporter(
        org.forgerock.openam.auth.node.api.Action,
        java.text.SimpleDateFormat,
        java.util.Date
    );

    var userDeviceId;
    var simpleDateFormat;
    var deviceObject;

    var outcome = 'true';
    var deviceIdHeaderName = 'device-id';
    var timeKey = 'timestamp';
    var deviceKey = 'frIndexedMultivalued2';
    var deviceIdKey = 'id';
    var dateFormat = 'yyyy-MM-dd HH:mm:ss';

    if (sharedState) {
        userDeviceId = requestHeaders.get(deviceIdHeaderName);
        if (userDeviceId) {
            userDeviceId = (userDeviceId.toArray()[0] || '').trim();
        }

        if (userDeviceId) {
            simpleDateFormat = new javaImports.SimpleDateFormat(dateFormat);
            deviceObject = {};
            deviceObject[timeKey] = String(simpleDateFormat.format(new javaImports.Date()));
            deviceObject[deviceIdKey] = String(userDeviceId);

            sharedState.put(deviceKey, JSON.stringify(deviceObject));
        }
    }

    action = javaImports.Action.goTo(outcome).build();
}());
