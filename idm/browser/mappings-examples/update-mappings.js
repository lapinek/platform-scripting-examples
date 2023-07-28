/**
 * @file Get existing mappings from ForgeRock Identity Management (IDM),
 * update the mappings object received in the response,
 * and PUT the updated mappings back into IDM configuration via REST.
 * @todo Sign in the IDM admin UI and run this script in the browser console.
 */

(async function () {
    var mappings = (await $.ajax('/openidm/sync/mappings?_queryFilter=true')).result;

    console.log('Existing Mappings', JSON.stringify(mappings, null, 4));

    // update your mappings here

    var updatedMappings = await $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        url: '/openidm/config/sync',
        data: JSON.stringify({
            mappings: mappings
        })
    });

    console.log(JSON.stringify(updatedMappings, null, 4));
}());
