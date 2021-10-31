/**
 * Return devices associated with a user account.
 *
 * Run in browser console.
 * Sign in as `amadmin` for the `/profile` path.
 * Sign in as any admin for the `/2fa/` paths.
 */

var userId = 'd7eed43d-ab2c-40be-874d-92571aa17107';
var realm = '/realms/root/realms/alpha';
var paths = [
    '/profile',
    '/2fa/oath',
    '/2fa/webauthn',
    '/2fa/push'
];

paths.forEach((path) => {
    fetch(`/am/json${realm}/users/${userId}/devices${path}?_queryId=*`
    ).then((response) => {
        return response.json();
    }).then((result) => {
        console.log(path, result);
    });
});
