(function () {
    'use strict';

    var javaImports = JavaImporter(
        org.forgerock.openam.auth.node.api.Action,
        java.text.SimpleDateFormat,
        java.util.Date
    );

    var userDeviceId;
    var userName;
    var simpleDateFormat;
    var deviceJson;

    var outcome = 'true';
    var deviceIdHeaderName = 'device-id';
    var timeKey = 'timestamp';
    var deviceKey = 'device-id';
    var deviceIdKey = 'id';
    var dataFormat = 'yyyy-MM-dd HH:mm:ss';

    if (sharedState) {
        userName = sharedState.get('username');
        userDeviceId = requestHeaders.get(deviceIdHeaderName);
        if (userDeviceId) {
            userDeviceId = (userDeviceId.toArray()[0] || '').trim();
        }

        logger.error('Jcom_Collect_Device_Id: Outcome for user: ' + userName + ': Collected Device Id Json: ' + userDeviceId);

        if (userDeviceId) {
            simpleDateFormat = new javaImports.SimpleDateFormat(dataFormat);
            deviceJson = {};
            deviceJson[timeKey] = String(simpleDateFormat.format(new javaImports.Date()));
            deviceJson[deviceIdKey] = String(userDeviceId);

            logger.error('Jcom_Collect_Device_Id: Outcome for user: ' + userName + ': Collected Device Id Json: ' + JSON.stringify(deviceJson));

            sharedState.put(deviceKey, JSON.stringify(deviceJson));
        }
    }

    logger.error('Jcom_Collect_Device_Id: Outcome for user: ' + userName + ': ' + outcome);

    action = javaImports.Action.goTo(outcome).build();
}());
