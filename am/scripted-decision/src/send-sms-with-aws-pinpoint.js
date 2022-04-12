(function () {
    var fr = JavaImporter(
        javax.crypto.Mac,
        javax.crypto.spec.SecretKeySpec,
        java.lang.String,
        java.security.MessageDigest
    );
    /**
     * Forgerock Configurations
     * We're getting the username or ID based on deployment type. ID for cloud, username for self-managed
     * We're also checking if the user has a phone or not. If not phone exist on the profile or during registration then we fail the outcome or do something else
     * same thing goes for the phoneNumber, we're trying to get it from the shared state or user profile
     */
    var username = sharedState.get('username') || sharedState.get('objectAttributes').get('userName'); // replace id with this variable if you're running on premise
    var id = sharedState.get('_id');
    var hasPhone = idRepository.getAttribute(id, 'telephoneNumber').iterator().hasNext() || sharedState.get('objectAttributes').get('telephoneNumber');

    if (!hasPhone) {
        outcome = 'noPhone';
        logger.error('AWS PinPoint SMS OTP Sender: No user or phone number found. Use \'Identify Existing User node before this script to populate the user\'s _id in shared state.\'');
        logger.error('AWS PinPoint SMS OTP Sender: outcome = noPhone');
        return;
    } else {
        // Get the phone number from the user profile, or shared state in case of registration
        var phoneNumber = idRepository.getAttribute(id, 'telephoneNumber').iterator().hasNext() ? idRepository.getAttribute(id, 'telephoneNumber').iterator().next() : sharedState.get('objectAttributes').get('telephoneNumber');
        /**
       * Main AWS configs for signing deriving a signing key
       */
        var config = {
            serviceName: 'mobiletargeting',
            accessKey: 'access-key',
            secretKey: 'secret/key/value',
            region: 'us-east-1',
            host:'pinpoint.us-east-1.amazonaws.com',
            projectId: 'project-id',
            endpoint: 'https://pinpoint.us-east-1.amazonaws.com/v1/apps/project-id/messages',
            httpMethod: 'POST',
            contentType: 'application/json',
            path: '/v1/apps/project-id/messages',
            amzDate: function () {
                return getAmzDate(new Date().toISOString());
            },
            get authDate() {
                return this.amzDate().split('T')[0];
            },
        };
        // AWS Req parameters and a not hashed payload with url encoding. This payload will be hashed and sent as part of our request
        var payload = {
            'MessageConfiguration': {
                'SMSMessage': {
                    'Body': 'yo does this work',
                    'SenderId': 'Fr PinPoint',
                    'MessageType': 'TRANSACTIONAL',
                    'OriginationNumber': '+00000000'
                }
            },
            'Addresses': {
                '11111111': {
                    'ChannelType': 'SMS'
                }
            }
        };

        // we instantiate a MessageDigest instance with SHA256 to hash our payload for signature. This method returns a byte array, so we're using a function to convert it to hex string
        var digest = fr.MessageDigest.getInstance('SHA-256');
        var hashedPayload = toHexString(digest.digest(new fr.String(JSON.stringify(payload)).getBytes('UTF-8')));
        // AWS uses a canonical request format for their requests, and payload. We're constructing that request here before we hashed it and attached our payload to it
        var canonReq = config.httpMethod + '\n' +
                    config.path + '\n' +
                    '\n' +
                    'host:' + config.host + '\n' +
                    'x-amz-content-sha256:' +
                    hashedPayload +
                    '\n' +
                    'x-amz-date:' + config.amzDate() + '\n' +
                    '\n' +
                    'host;x-amz-content-sha256;x-amz-date' + '\n' +
                    hashedPayload;
        var canonReqHash = toHexString(digest.digest(new fr.String(canonReq).getBytes('UTF-8')));
        // We're constructing our request that we want to sign with our derived key
        var stringToSign = 'AWS4-HMAC-SHA256' + '\n' +
                          config.amzDate() + '\n' +
                          config.authDate + '/' + config.region + '/' + config.serviceName + '/aws4_request' + '\n' +
                          canonReqHash;
        // We're deriving a signing key using our secret key, and additional AWS attributes
        var signingKey = getSignatureKey(config.secretKey, config.authDate, config.region, config.serviceName);
        // Using our signing key, we generate our final auth key
        var authKey = hmacSHA256(stringToSign, signingKey);
        var authString = 'AWS4-HMAC-SHA256 ' +
                        'Credential=' +
                        config.accessKey + '/' +
                        config.authDate + '/' +
                        config.region + '/' +
                        config.serviceName + '/aws4_request,' +
                        'SignedHeaders=host;x-amz-content-sha256;x-amz-date,' +
                        'Signature=' + toHexString(authKey);
        var headers = {
            Authorization: authString,
            Accept:'*/*',
            'content-type': config.contentType,
            'x-amz-date': config.amzDate(),
            'x-amz-content-sha256': hashedPayload,
        };
        // starting our request
        var request = new org.forgerock.http.protocol.Request();
        request.setMethod(config.httpMethod);
        request.setUri(config.endpoint);
        Object.keys(headers).forEach(function (key) {
            request.getHeaders().add(key, headers[key]);
        });
        request.getEntity().setString(JSON.stringify(payload));
        var response = httpClient.send(request).get();

        // debug call
        var requestDebug = new org.forgerock.http.protocol.Request();
        requestDebug.setMethod(config.httpMethod);
        requestDebug.setUri('https://webhook.site/web-hook-id');
        Object.keys(headers).forEach(function (key) {
            requestDebug.getHeaders().add(key, headers[key]);
        });
        requestDebug.getEntity().setString(JSON.stringify(payload));
        var responseDebug = httpClient.send(requestDebug).get();

        var result = response.getEntity().getString();

        logger.message('chico response: ' + result);
        sharedState.put('Response Code', response.getStatus().getCode());
        sharedState.put('Response Message', result);
        if (response.getStatus().getCode() === 200) {
            outcome = 'sent';
        // logger.message('AWS PinPoint SMS OTP Sender: ' + result);
        // logger.message('AWS PinPoint SMS OTP Sender: outcome = sent')
        } else {
            outcome = 'failed';
        // logger.error('AWS PinPoint SMS OTP Sender: Result = '+ result);
        }
    }

    /**
     * Functions
     */
    /**
     *
     * @param {String} data
     * @param {ArrayBuffer} key
     * @returns
     */
    function hmacSHA256(data, key) {
        var alg = fr.String('HmacSHA256');
        var mac = fr.Mac.getInstance(alg);
        mac.init(new fr.SecretKeySpec(key, alg));
        return mac.doFinal(fr.String(data).getBytes('UTF-8'));
    }
    /**
     * This functions derives the signing key for signing the headers and the request
     * @param {String} key
     * @param {String} dateStamp
     * @param {String} regionName
     * @param {String} serviceName
     * @returns Amazon signing key
     */
    function getSignatureKey(key, dateStamp, regionName, serviceName) {
        var kSecret = fr.String('AWS4' + key).getBytes('UTF-8');
        var kDate = hmacSHA256(dateStamp, kSecret);
        var kRegion = hmacSHA256(regionName, kDate);
        var kService = hmacSHA256(serviceName, kRegion);
        var kSigning = hmacSHA256('aws4_request', kService);
        return kSigning;
    }
    /**
     * Converts ISO 8601 date format to an AWS accepted format. It removes the punctuations and milliseconds
     * @param {String} dateStr
     * @returns Amazon formatted date string
     */
    function getAmzDate(dateStr) {
        var chars = [':', '-'];
        for (var i = 0; i < chars.length; i++) {
            while (dateStr.indexOf(chars[i]) !== -1) {
                dateStr = dateStr.replace(chars[i], '');
            }
        }
        dateStr = dateStr.split('.')[0] + 'Z';
        return dateStr;
    }

    /**
     * This function converts the byte array to Hex string
     * @param {ArrayBuffer} byteArray
     * @returns Hex representation of a byte array
     */
    function toHexString(byteArray) {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xff).toString(16)).slice(-2);
        }).join('');
    }
})();
