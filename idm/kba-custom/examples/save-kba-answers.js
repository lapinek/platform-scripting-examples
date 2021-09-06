/**
 * @file Provide an example for populating a custom KBA field,
 * and updating the standard KBA property (kbaInfo)
 * over REST in ForgeRock Identity Management (IDM).
 * Use in the browser console during an active IDM administrator session.
 */

var customEndpointName = 'kba-custom';
var userId = 'd7eed43d-ab2c-40be-874d-92571aa17107';
var data = JSON.stringify([
    {
        operation: 'replace',
        field: 'frIndexedMultivalued3',
        value: [
            {
                questionId: '1',
                answer: 'sir lancelot of camelot'
            },
            {
                questionId: '2',
                answer: 'to seek the holy grail'
            },
            {
                questionId: '3',
                answer: 'blue'
            }
        ]
    }
]);

await $.ajax({
    method: 'PATCH',
    url: `/openidm/endpoint/${customEndpointName}/${userId}`,
    data: data,
    headers: {
        'x-requested-with': 'XMLHttpRequest',
        'Content-Type': 'application/json'
    }
});
