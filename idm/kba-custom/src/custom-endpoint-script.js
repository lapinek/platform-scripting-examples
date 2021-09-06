/**
 * @file Provide content for a script to be run at IDM custom endpoint,
 * which is responsible for storing and validating a security question as BCRYPT version 2a, cost 10 hash in a custom KBA field,
 * and for updating the kbaInfo field with the same question using the default hashing algorithm.
 *
 * The following examples could be run in the browser console during an active IDM administrator session,
 * using the following URL template:
 * {{idm_base_url}}/endpoint/{kba-custom-endpoint-name}/{fr_user_id}.
 *
 * @example
 * Use POST to validate an answer against the custom KBA field,
 * and if it matches the hash, save the answer hashed with the default algorithm in the kbaInfo field.
 *
 * await $.ajax({
 *     "method": "POST",
 *     "url": "/openidm/endpoint/kba-custom/d7eed43d-ab2c-40be-874d-92571aa17107",
 *     "data": JSON.stringify({
 *         "field": "frIndexedMultivalued3",
 *         "input": [
 *             {
 *                 "answer": "blue",
 *                 "questionId": "1"
 *             }
 *         ]
 *     }),
 *     "headers": {
 *         "x-requested-with": "XMLHttpRequest",
 *         "Content-Type": "application/json"
 *     }
 * });
 *
 * @example
 * PATCH to save user's answer as the BCRYPT hash in the custom KBA field,
 * and also, save the answer hashed with the default algorithm in the kbaInfo field.
 * await $.ajax({
 *     "method": "PATCH",
 *     "url": "/openidm/endpoint/kba-custom/d7eed43d-ab2c-40be-874d-92571aa17107",
 *     "data": JSON.stringify([
 *         {
 *             "operation": "replace",
 *             "field": "frIndexedMultivalued3",
 *             "value": [
 *                 {
 *                     "answer": "reddish",
 *                     "questionId": "1"
 *                 }
 *             ]
 *         }
 *     ]),
 *     "headers": {
 *         "x-requested-with": "XMLHttpRequest",
 *         "Content-Type": "application/json"
 *     }
 * });
 */

(function () {
    var frJava = JavaImporter(
        java.security.SecureRandom,
        org.bouncycastle.crypto.generators.OpenBSDBCrypt,
        org.forgerock.json.JsonValue,
        org.forgerock.json.resource.CreateRequest,
        org.forgerock.json.resource.NotSupportedException,
        org.forgerock.json.resource.PatchRequest,
        java.lang.String
    );

    var kbaJson;

    var userId = request.resourcePath;

    var managedUserURI = 'managed/alpha_user/' + userId;
    var allSecurityQURI = 'config/selfservice.kba';
    var customKbaFieldName;
    var defaultCustomKbaFieldName = 'frIndexedMultivalued3';

    var  result = {
        _id: userId,
        message: 'Success'
    };

    /**
     * POST to validate an answer against the custom KBA field,
     * and if it matches the hash, save the answer hashed with the default algorithm in the kbaInfo field.
     */
    if (request instanceof frJava.CreateRequest) {
        var profileAnswer;
        var profileQuestionId;
        var inputAnswer;
        var inputAnswerJava;
        var inputQuestionId;

        var requestContent = JSON.parse(request.content);

        if (!Array.isArray(requestContent.input)) {
            result.message = 'Error: No input provided.';
            return result;
        }

        customKbaFieldName = requestContent.field ||  defaultCustomKbaFieldName;

        var userMap = openidm.read(managedUserURI, null, ['kbaInfo', customKbaFieldName]);
        if (!userMap) {
            result.message = 'Error: User not found.';
            return result;
        }

        requestContent.input.forEach(function (item) {
            if (item) {
                inputAnswer = String(item.answer).toLowerCase();
                inputAnswerJava = new frJava.String(inputAnswer);
                inputQuestionId = String(item.questionId);

                var questions = userMap[customKbaFieldName];
                if (Array.isArray(questions)) {
                    questions.forEach(function (questionJson) {
                        var question = JSON.parse(questionJson);
                        profileAnswer = String(question.answer);
                        profileQuestionId = String(question.questionId);
                    });
                }

                if (!inputQuestionId || inputQuestionId !== profileQuestionId) {
                    result.message = 'Error: Question id is not matching with profile.';
                    return;
                }

                if (!inputAnswer) {
                    result.message = 'Error: Answer is null or empty.';
                    return;
                }

                if (frJava.OpenBSDBCrypt.checkPassword(profileAnswer, inputAnswerJava.toCharArray())) {
                    kbaJson = getKbaJson(inputQuestionId, inputAnswer, 'replace', 'kbaInfo');
                    openidm.patch(managedUserURI, null, kbaJson);
                } else {
                    result.message = 'Failure';
                    return;
                }
            }
        });

        return result;
    } else if (request instanceof frJava.PatchRequest) {
        var answer;
        var questionId;

        var operations =  request.patchOperations;

        if (!Array.isArray(operations)) {
            result.message = 'Error: invalid input.';
            return result;
        }

        var allSecurityQMap = openidm.read(allSecurityQURI, null, ['questions']);
        if (!allSecurityQMap || !allSecurityQMap.questions || !Object.keys(allSecurityQMap.questions).length) {
            result.message = 'Error: no security questions found.';
            return result;
        }

        operations.forEach(function (operation) {
            customKbaFieldName = operation.field ||  defaultCustomKbaFieldName;

            if (Array.isArray(operation.value)) {
                operation.value.forEach(function (item) {
                    answer = String(item.answer || '').toLowerCase();
                    questionId = String(item.questionId || '').replace(/^0+/, '');
                });
            }
        });

        if (!answer || answer.length < 4) {
            result.message = 'Error: Answer is not meeting minimum length requirement.';
            return result;
        }

        if (!questionId || !allSecurityQMap.questions[questionId]) {
            result.message = 'Error: Question ID is not valid.';
            return result;
        }

        var rng = new frJava.SecureRandom();
        var salt = rng.generateSeed(16);
        var  answerJava = new frJava.String(answer);
        var openBSDBcrypt = frJava.OpenBSDBCrypt.generate('2a',  answerJava.toCharArray(), salt, 10);

        var kbaCustomJson = getKbaCustomJson(questionId, openBSDBcrypt, 'replace', customKbaFieldName);
        openidm.patch(managedUserURI, null, kbaCustomJson);

        kbaJson = getKbaJson(questionId, answer, 'replace', 'kbaInfo');
        openidm.patch(managedUserURI, null, kbaJson);

        return result;
    } else {
        throw new frJava.NotSupportedException(request.method);
    }

    function getKbaCustomJson(questionId, answer, operation,  field) {
        var value = JSON.stringify({
            answer: String(answer),
            questionId: String(questionId)
        });

        var valueList = frJava.JsonValue.array(value);

        var securityQMap = frJava.JsonValue.json(frJava.JsonValue.object());
        securityQMap.put('value', valueList);
        securityQMap.put('operation', operation);
        securityQMap.put('field', field);

        return frJava.JsonValue.json(frJava.JsonValue.array(securityQMap));
    }

    function getKbaJson(questionId, answer, operation,  field) {
        var kbaInfoItem = frJava.JsonValue.json(frJava.JsonValue.object());
        kbaInfoItem.put('questionId', questionId);
        kbaInfoItem.put('answer', openidm.hash(answer, null));

        var kbaInfo = frJava.JsonValue.array(kbaInfoItem);


        var securityQMap = frJava.JsonValue.json(frJava.JsonValue.object());
        securityQMap.put('value', kbaInfo);
        securityQMap.put('operation', operation);
        securityQMap.put('field', field);

        return frJava.JsonValue.json(frJava.JsonValue.array(securityQMap));
    }
}());
