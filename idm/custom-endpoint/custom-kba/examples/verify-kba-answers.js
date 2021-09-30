/**
 * @file Provide an example for validating answers against a custom KBA field,
 * and if correct, saving them in the standard KBA property (kbaInfo)
 * over REST in ForgeRock Identity Management (IDM).
 * Use in the browser console during an active IDM administrator session.
 */

var customEndpointName = 'customKba';
var userId = 'd7eed43d-ab2c-40be-874d-92571aa17107';
var data = JSON.stringify({
    field: 'frIndexedMultivalued3',
    input: [
        {
            questionId: '1',
            answer: 'sir lancelot of camelot'
        },
        {
            questionId: '3',
            answer: 'blue'
        }
    ]
});

await $.ajax({
    method: 'POST',
    url: `/openidm/endpoint/${customEndpointName}/${userId}`,
    data: data,
    headers: {
        'x-requested-with': 'XMLHttpRequest',
        'Content-Type': 'application/json'
    }
});
