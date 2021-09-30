/**
 * @file Provide an example for configuring Knowledge-Based Authentication (KBA)
 * over REST in ForgeRock Identity Management (IDM).
 * Use in in the browser console during an active IDM administrator session.
 *
 * Check existing configuration with a GET:
 * @example
 * await $.ajax({
 *     method: 'GET',
 *     url: '/openidm/config/selfservice.kba'
 * });
 */

 await $.ajax({
    method: 'PUT',
    url: '/openidm/config/selfservice.kba',
    data: JSON.stringify({
      _id: 'selfservice.kba',
      kbaPropertyName: 'kbaInfo',
      minimumAnswersToDefine: 2,
      minimumAnswersToVerify: 1,
      questions: {
        1: {
          en: 'What is your name?'
        },
        2: {
          en: 'What is your quest?'
        },
        3: {
          en: 'What is your favourite colour?'
        }
      }
    }),
    headers: {
        'Content-type': 'application/json'
    }
});
