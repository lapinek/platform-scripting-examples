/**
 * @file Provide content for a script to be run at a ForgeRock Identity Management (IDM) custom endpoint
 * responsible for validating user's answers to security questions.
 * Hash plain-text answers with a custom (BCRYPT version 2a, cost 10) algorithm,
 * and save the hash in a custom Array (Multivalued) Knowledge-Based Authentication (KBA) field.
 * Update the standard KBA property field (kbaInfo) with correct answers.
 *
 * This can be used in a deployment on a customer's premises
 * or during transition from an existing KBA implementation
 * to a controlled environment, such as ForgeRock Identity Cloud (Identity Cloud).
 *
 * The user's answer for a security question will be checked against the hash saved in the custom KBA field.
 * If the answer is valid, it is also saved in the kbaInfo field, hashed with the default algorithms.
 * If there are other questions defined in the kbaInfo field, they will be preserved.
 * When the kbaInfo field is populated, it could be used with the standard authentication means,
 * such as the out of the box KBA nodes.
 *
 * The examples below could be run in the browser console during an active IDM administrator session,
 * using the following URL template:
 * {idm_base_url}/endpoint/{kba-custom-endpoint-name}/{user-id}
 *
 * PATCH to save a single plain-text answer as the custom hash in the custom KBA field,
 * and save the answer hashed with the default algorithms in the kbaInfo field.
 * @example
 * var customEndpointName = '{custom-endpoint-name}';
 * var userId = '{user-id}';
 * var data = JSON.stringify([
 *     {
 *         operation: 'replace',
 *         field: '{custom-kba-field-name}',
 *         value: [
 *             {
 *                 questionId: '{question-id}',
 *                 answer: '{answer}'
 *             }
 *         ]
 *     }
 * ]);

 * await $.ajax({
 *     method: 'PATCH',
 *     url: '/openidm/endpoint/' + customEndpointName + '/' + userId,
 *     data: data,
 *     headers: {
 *         'x-requested-with': 'XMLHttpRequest',
 *         'Content-Type': 'application/json'
 *     }
 * });
 *
 * POST to validate a single answer against the custom hash saved in the custom KBA field;
 * if the answer is valid, save it hashed with the default algorithms in the kbaInfo field.
 * @example
 * var customEndpointName = '{custom-endpoint-name}';
 * var userId = '{user-id}';
 * var data = JSON.stringify({
 *     field: '{custom-kba-field-name}',
 *     input: [
 *         {
 *             questionId: '{question-id}',
 *             answer: '{answer}'
 *         }
 *     ]
 * });
 *
 * await $.ajax({
 *     method: 'POST',
 *     url: '/openidm/endpoint/' + customEndpointName + '/' + userId,
 *     data: data,
 *     headers: {
 *         'x-requested-with': 'XMLHttpRequest',
 *         'Content-Type': 'application/json'
 *     }
 * });
 *
 * @see {@link ../examples} for saving and verifying multiple answers examples.
 */

/**
 * The result object to be returned in the response.
 * @typedef {object} result
 * @property {string} _id - The user identifier.
 * @property {string} message - A message describing the outcome.
 */

/**
 * @returns {result}
 */
(function () {
    /**
     * Import Java for handling the request and for custom hashing.
     */
    const javaImports = JavaImporter(
        java.security.SecureRandom,
        org.bouncycastle.crypto.generators.OpenBSDBCrypt,
        java.lang.String,
        org.forgerock.json.resource.CreateRequest,
        org.forgerock.json.resource.PatchRequest,
        org.forgerock.json.resource.NotSupportedException
    );

    const userId = request.resourcePath;
    const managedUserUri = 'managed/alpha_user/' + userId;
    const kbaConfigurationUri = 'config/selfservice.kba';
    const defaultKbaCustomField = 'frIndexedMultivalued3';
    const successMessage = 'Success';

    /**
     * BCrypt defaults.
     */
    const bcryptVersion = '2a';
    const bcryptCost = 10;

    /**
     * Obtain the KBA configuration.
     */
    const kbaConfiguration = openidm.read(kbaConfigurationUri, null, [
        'kbaPropertyName',
        'questions'
    ]);

    /**
     * Get the standard KBA property name from the configuration.
     */
    const kbaPropertyName = kbaConfiguration.kbaPropertyName;

    /**
     * @type {result}
     */
    const result = {
        _id: userId
    };

    if (request instanceof javaImports.PatchRequest) {
        /**
         * PATCH to save question definitions with a plain-text answers as the custom hash in the custom KBA field,
         * and save the answer hashed with the default algorithms in the kbaInfo field.
         */
        result.message = saveQuestions();
    } else if (request instanceof javaImports.CreateRequest) {
        /**
         * POST to validate user's answers against the custom KBA field, and if they match the hash,
         * save the answers hashed with the default algorithms in the kbaInfo field.
         */
        result.message = validateAnswers();
    } else {
        /**
         * Throw if the request method is not supported.
         */
        throw new javaImports.NotSupportedException(request.method);
    }

    return result;

    /**
     * Handle a PATCH request.
     * @returns {string} A message describing the outcome of the request.
     */
    function saveQuestions() {
        function getKbaCustomValue(questions) {
            function getKbaCustomQuestion(question) {
                function hashAnswer(answer) {
                    const secureRandom = new javaImports.SecureRandom();
                    const salt = secureRandom.generateSeed(16);
                    const answerJava = new javaImports.String(answer);

                    return javaImports.OpenBSDBCrypt.generate(bcryptVersion, answerJava.toCharArray(), salt, bcryptCost);
                }

                const kbaCustomQuestion = JSON.stringify({
                    questionId: question.questionId,
                    answer: String(hashAnswer(question.answer))
                });

                return kbaCustomQuestion;
            }

            return questions.map(function (question) {
                return getKbaCustomQuestion(question);
            });
        }

        /**
         * The global custom endpoint PATCH request object.
         * @typedef {object} request
         * @property {object[]} patchOperations - The PATCH operation definitions.
         * @property {string} patchOperations[].operation - The PATCH operation name.
         * @property {string} [patchOperations[].field=frIndexedMultivalued3] - The custom KBA field name.
         * @property {object[]} patchOperations[].value - An array of answers with the corresponding question IDs.
         * @property {string} patchOperations[].value.answer - Plain-text answer to a security question.
         * @property {string} patchOperations[].value.questionId - The security question ID.
         * @see {@link https://backstage.forgerock.com/docs/idm/7.1/scripting-guide/script-variables-custom-endpoints.html}.
         * @see {@link https://backstage.forgerock.com/docs/ig/7.1/_attachments/apidocs/org/forgerock/json/resource/PatchRequest.html}.
         */

        if (request.patchOperations.length !== 1) {
            return 'Error: Exactly one patch operation is expected in the request; found: ' + request.patchOperations.length + '.';
        }

        if (!(kbaConfiguration && kbaConfiguration.questions && Object.keys(kbaConfiguration.questions).length)) {
            return 'Error: No security questions found in KBA configuration.';
        }

        const patchOperation = request.patchOperations[0];
        const operation = patchOperation.operation || 'replace';
        if (operation !== 'replace') {
            return 'Error: Only replace patch operation is currently supported.';
        }

        const requestQuestions = formatQuestions(patchOperation.value);
        if (!(Array.isArray(requestQuestions) && requestQuestions.length)) {
            return 'Error: No questions provided in the request.';
        }

        let invalidQuestions;
        let invalidQuestionsIDs;

        invalidQuestions = requestQuestions.filter(function (requestQuestion) {
            if (!(requestQuestion.questionId && kbaConfiguration.questions[requestQuestion.questionId])) {
                return true;
            }
        });
        if (invalidQuestions.length) {
            invalidQuestionsIDs = invalidQuestions.map((invalidQuestion) => {
                return invalidQuestion.questionId;
            }).join(', ');

            return 'Error: Question ID(s) not found in the configuration: ' + invalidQuestionsIDs;
        }

        invalidQuestions = requestQuestions.filter(function (requestQuestion) {
            if (!(requestQuestion.answer && requestQuestion.answer.length > 3)) {
                return true;
            }
        });
        if (invalidQuestions.length) {
            const invalidAnswers = invalidQuestions.map((question) => {
                return question.answer;
            }).join(', ');

            return 'Error: Answers not meeting minimum length requirements: ' + invalidAnswers;
        }

        const kbaCustomField = patchOperation.field || defaultKbaCustomField;
        openidm.patch(managedUserUri, null, [
            {
                operation: operation,
                field: kbaCustomField,
                value: getKbaCustomValue(requestQuestions)
            },
            {
                operation: operation,
                field: kbaPropertyName,
                value: getKbaInfoValue(requestQuestions)
            }
        ]);

        return successMessage;
    }

    /**
     * @returns {string} A message describing the outcome of the request.
     */
    function validateAnswers() {
        /**
         * The global custom endpoint POST request object.
         * @typedef {object} request
         * @property {object} content - The POST data.
         * @property {string} [content.field=frIndexedMultivalued3] - The custom KBA field name.
         * @property {object[]} content.input - An array of answers with the corresponding question IDs.
         * @property {string} content.input[].answer - Plain-text answer to a security question.
         * @property {string} content.input[].questionId - The security question ID.
         * @see {@link https://backstage.forgerock.com/docs/idm/7.1/scripting-guide/script-variables-custom-endpoints.html}.
         * @see {@link https://backstage.forgerock.com/docs/ig/7.1/_attachments/apidocs/org/forgerock/json/resource/CreateRequest.html}.
         */

        const requestContent = JSON.parse(request.content);
        if (!(Array.isArray(requestContent.input) && requestContent.input.length)) {
            return 'Error: No input provided.';
        }

        const requestQuestions = formatQuestions(requestContent.input);
        if (!(Array.isArray(requestQuestions) && requestQuestions.length)) {
            return 'Error: No questions provided in the request.';
        }

        const kbaCustomField = requestContent.field || defaultKbaCustomField;
        const userObject = openidm.read(managedUserUri, null, [kbaPropertyName, kbaCustomField]);
        if (!userObject) {
            return 'Error: User not found.';
        }

        if (!userObject[kbaCustomField]) {
            return 'Error: The custom KBA field not found in the profile.';
        }

        const profileQuestions = userObject[kbaCustomField].map((questionJson) => {
            return JSON.parse(questionJson);
        });

        let invalidQuestions;
        let invalidQuestionsIDs;

        invalidQuestions = requestQuestions.filter(function (question) {
            const profileQuestionsIds = profileQuestions.map((question) => {
                return question.questionId;
            });

            return !(question.questionId && profileQuestionsIds.indexOf(question.questionId) !== -1);
        });
        if (invalidQuestions.length) {
            invalidQuestionsIDs = invalidQuestions.map((question) => {
                return question.questionId;
            }).join(', ');

            return 'Error: Question ID(s) not found in the profile: ' + invalidQuestionsIDs;
        }

        invalidQuestions = requestQuestions.filter(function (requestQuestion) {
            return !(requestQuestion.answer);
        });
        if (invalidQuestions.length) {
            invalidQuestionsIDs = invalidQuestions.map((question) => {
                return question.questionId;
            }).join(', ');

            return 'Error: Question ID(s) with no answer provided: ' + invalidQuestionsIDs;
        }

        const hasIncorrectAnswer = requestQuestions.some(function (requestQuestion) {
            const requestAnswerJava = new javaImports.String(requestQuestion.answer);
            const correctAnswer = profileQuestions.find(function (profileQuestion) {
                return profileQuestion.questionId === requestQuestion.questionId;
            }).answer;

            return !javaImports.OpenBSDBCrypt.checkPassword(correctAnswer, requestAnswerJava.toCharArray());
        });
        if (hasIncorrectAnswer) {
            return 'Failure';
        }

        let kbaInfoValue = getKbaInfoValue(requestQuestions);
        kbaInfoValue = kbaInfoValue.concat(userObject[kbaPropertyName].filter((kbaInfoQuestion) => {
            return !kbaInfoValue.map((kbaInfoValueQuestion) => {
                return kbaInfoValueQuestion.questionId;
            }).includes(kbaInfoQuestion.questionId);
        }));
        openidm.patch(managedUserUri, null, [
            {
                operation: 'replace',
                field: kbaPropertyName,
                value: kbaInfoValue
            }
        ]);

        return successMessage;
    }

    function formatQuestions(questions) {
        function formatQuestionId(questionId) {
            return String(questionId || '').replace(/^0+/, '');
        }

        function formatAnswer(answer) {
            return String(answer || '').toLowerCase();
        }

        return questions.map((question) => {
            return {
                questionId: formatQuestionId(question.questionId),
                answer: formatAnswer(question.answer)
            };
        });
    }

    function getKbaInfoValue(questions) {
        /**
         * Use the default hashing algorithms to create an individual answer hash
         * for storing in the kbaInfo field.
         * @param {object} question - The question definition.
         * @param {string} question.questionId - The question ID.
         * @param {string} question.answer - The answer.
         * @returns {object} The individual value to store in the kbaInfo (Array) field.
         */
        function getKbaInfoQuestion(question) {
            return {
                questionId: question.questionId,
                answer: openidm.hash(question.answer, null)
            };
        }

        return questions.map(function (question) {
            return getKbaInfoQuestion(question);
        });
    }
}());
