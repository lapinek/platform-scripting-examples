# Example of a Custom Knowledge Based Authentication (KBA) Implementation in ForgeRock Identity Cloud (Identity Cloud)

## Functionality

* Existing answers that have been hashed with a (currently) unsupported in IDC algorithm, BCRYPT version 2a and cost 10, are saved in a custom KBA field.
* The `kbaInfo` field is updated accordingly, so that the default algorithms and KBA authentication nodes can be eventually used.
* This functionality is based on [Creating Custom Endpoints to Launch Scripts](https://backstage.forgerock.com/docs/idcloud-idm/latest/scripting-guide/custom-endpoints.html).

## Content

* Script to use at the Custom Endpoint:

    [src/custom-endpoint-script.js](src/custom-endpoint-script.js)

* Script to create the Custom Endpoint:

    [src/custom-endpoint-create.js](src/custom-endpoint-create.js)
* Script to populate the custom KBA field and the `kbaInfo` field using the Custom Endpoint:

    [src/custom-endpoint-PATCH.js](src/custom-endpoint-PATCH.js)

* Script to verify user's answer against the custom KBA field, and to update the `kbaInfo` field with a correct answer using the Custom Endpoint:

    [src/custom-endpoint-POST.js](src/custom-endpoint-POST.js)
