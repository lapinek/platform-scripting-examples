/**
 * @file Provides a JavaScript example of finding overlap in two sets of data in Access Management (AM) scripts
 * by utilizing JavaScript array methods.
 * @version 0.1.0
 * @author konstantin.lapine@forgerock.com
 * @license MIT
 */

try {
    var username = sharedState.get('_id');

    /**
     * A user's membership array—as the first data set example.
     * Remember toArray() the set returned with the idRepository methods.
     */
    var attributeName = 'fr-attr-imulti1';
    var isMemberOf  = idRepository.getAttribute(username, attributeName).toArray();

    /**
     * A policy Subjects—as the second data set example.
     */
    var subjectValues = [
        'id=Security Admin,ou=group,o=alpha,ou=services,ou=am-config',
        'id=HCA Eligibility Worker 3,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Enrollment Worker 3,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Issuer,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Batch Admin,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Billing Worker 4,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Enrollment Manager,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Inquiry Role,ou=group,o=alpha,ou=services,ou=am-config',
        'id=CSR Worker 2,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Auditor,ou=group,o=alpha,ou=services,ou=am-config',
        'id=CSR Worker 3 Manager,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Report Admin,ou=group,o=alpha,ou=services,ou=am-config',
        'id=HCA Sponsor Manager,ou=group,o=alpha,ou=services,ou=am-config',
        'id=DSHS Eligibility Worker 3,ou=group,o=alpha,ou=services,ou=am-config',
        'id=HBE Manager 5,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Plan Manager 3,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Eligibility Worker 3,ou=group,o=alpha,ou=services,ou=am-config',
        'id=Security,ou=group,o=alpha,ou=services,ou=am-config'
    ];

    /**
     * Create a new array out of matching values.
     */
    var match = isMemberOf.filter(function (group) {
        /**
         * Convert possible instance of the java.lang.String class to a JavaScript string
         * to allow for Strict Equality Comparison (with the === operator).
         */
        var groupId = String(group.split(',')[0].split('=')[1]);
        // logger.error('groupId: ' + groupId);

        return subjectValues.filter(function (subject) {
            /**
             * Manually constructed array in this example guarantees JavaScript strings;
             * no conversion is necessary.
             * To accommodate other sources of the subjects data, convert the value to a JavaScript string anyway.
             */
            var subjectId = String(subject.split(',')[0].split('=')[1]);
            // logger.error('subjectId: ' + subjectId);

            return subjectId === groupId;
        }).length;
    });

    logger.error('match: ' + match);

    if (match.length) {
        logger.error('Found matching values.')
    } else {
        logger.error('Did NOT find a match.')
    }

    /**
     * (Optional) keep only unique matches from the original array.
     */
    var uniqueMatch = match.filter(function (e, i) {
        return match.indexOf(e) === i;
    });

    logger.error('uniqueMatch: ' + uniqueMatch);
} catch (e) {
    logger.error('e: ' + e);
}
