/**
 * @file Provide a request template for a custom endpoint creation.
 * Use in in the browser console during an active IDM administrator session.
 */

var customEndpointName = 'customKba';
var customEndpointScriptContent = `

{your-custom-endpoint-script}

`;

await $.ajax({
    method: 'PUT',
    url: '/openidm/config/endpoint/' + customEndpointName,
    data: JSON.stringify({
        type: 'text/javascript',
        source: customEndpointScriptContent
    }),
    headers: {
        /**
         * Upload the script only if it doesn't exist and is not going to be overwritten.
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match}.
         */
        'If-None-Match': '*',
        /**
         * Update and delete the script only if it exists.
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match}.
         */
        // 'If-Match': '*',
        'Content-type': 'application/json'
    }
});
