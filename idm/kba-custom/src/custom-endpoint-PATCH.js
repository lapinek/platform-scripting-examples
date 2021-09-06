/**
 * @file Provide a request template for populating custom KBA field,
 * and updating the kbaInfo field.
 * Use in an IDM administration screen in the browser console.
 */

var customEndpointName = '{your-custom-endpoint-name}';
var userId = '{your-user-id}';
var customFieldName = '{your-custom-field-name';
var questionId = '{your-question-id}';
var answer = '{your-user-answer}';

await $.ajax({
    "method": "PATCH",
    "url": `/openidm/endpoint/${customEndpointName}/${userId}`,
    "data": JSON.stringify([
        {
            operation: "replace",
            field: customFieldName,
            value: [
                {
                    questionId: questionId,
                    answer: answer
                }
            ]
        }
    ]),
    "headers": {
        "x-requested-with": "XMLHttpRequest",
        "Content-Type": "application/json"
    }
});
