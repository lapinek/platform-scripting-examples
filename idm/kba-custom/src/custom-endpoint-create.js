/**
 * @file Provide a request template for a custom endpoint creation.
 * Use in an IDM administration screen in the browser console.
 */

var customEndpointName = '{your-custom-endpoint-name}';
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
    headers : {
        'If-Match': '*',
        'Content-type': 'application/json'
    }
});
