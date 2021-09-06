/**
 * @file Provide a request template for validating an answer against the custom KBA field,
 * and if the answer is valid, updating the kbaInfo field.
 * Use in an IDM administration screen in the browser console.
 */

var customEndpointName = '{your-custom-endpoint-name}';
var userId = '{your-user-id}';
var customFieldName = '{your-custom-field-name';
var questionId = '{your-question-id}';
var answer = '{your-user-answer}';

await $.ajax({
    "method": "POST",
    "url": `/openidm/endpoint/${customEndpointName}/${userId}`,
    "data": JSON.stringify({
        field: customFieldName,
        input: [
            {
                questionId: questionId,
                answer: answer
            }
        ]
    }),
    "headers": {
        "x-requested-with": "XMLHttpRequest",
        "Content-Type": "application/json"
    }
});
