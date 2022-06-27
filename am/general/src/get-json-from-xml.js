var xmlString = '<InvalidPassword><InvalidCount>2</InvalidCount><LastInvalidAt>1643827544467</LastInvalidAt><LockedoutAt>0</LockedoutAt><ActualLockoutDuration>0</ActualLockoutDuration><NoOfTimesLocked>0</NoOfTimesLocked></InvalidPassword>';
logger.error('xmlString: ' + xmlString);

var xmlObject = xmlString.split(/<\/\w+><?|></g).reduce(function (xmlObject, e) {
    var keyValueArray = e.split('>');
    var key = keyValueArray[0];
    var value = keyValueArray[1];
    if (value) {
        xmlObject[key] = value;
    }
    return xmlObject;
}, {});

logger.error('xmlObject: ' + JSON.stringify(xmlObject));
