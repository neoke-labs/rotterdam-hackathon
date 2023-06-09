# NeoKe Rotterdam hackathon website

This repository contains the code of the hackathon website.

## About the project

It's a web app developed in react that must be deployed in `firebase` due to the use of `firestore` and `cloud functions`.

Both the web and the cloud functions have been developed in `javascript`.

The project is a web application that offers 4 sub-sites or website modes. Specifically:

- **Website selector**: This landing page allows access to the other three sub-sites.
- **Issuance of Aruba verifier traveller credentials**: Allows users to request an Aruba verifier traveller credential.
- **Reservations page**: Starts by asking the user to authenticate using her Aruba verifier traveller credential. Then, the user can make a hotel reservation and obtain a reservation proof/card - which would allow her to send all the required documentation prior to her check-in.
- **Reservations management**: Allows hotel owners to publish their hotels and receive (and review) the required check-in documentation provided by the guests.

Note that the page uses a single code base and that these four websites are virtual websites whose execution depends on a variable stored in the browser's local storage (`websiteMode`).

## Requirements

The website has been developed using `React 17.0.2`. This version of react has incompatibility issues with `node.js` versions other than `16.x` so **we strongly recommend using nodejs 16.x**. Note that it's easy to solve that, with tools such as [nvm](https://github.com/nvm-sh/nvm).

As a way of warning: If the code does not conform to a certain format (see `.eslintrc`) it cannot be built. If you make any modifications to the code you should run `npm run format` before building the app to avoid problems. `npm run format` uses `eslint` and `prettier`.

Due to the use of cloud functions you would need a [blaze](https://firebase.google.com/pricing) firebase plan. Note that this does not entail extra costs as long as you don't exceed the free tier (limits are indicated in the previous link).

An `azure` account is also required in order to use `microsoft entra`. You will need to:

- Register an application.
- Create a secret.
- Create three verifiable certificates. The configuration of these credentials can be found in the folder `releng/credentials/`.

To run the application locally it's necessary to use the [firebase emulators](https://firebase.google.com/docs/emulator-suite). You'll also need to enable SSL access to your cloud functions (specifically, to the callback cloud function, since it will be called by microsoft), for which we recommend the use of [ngrok](https://ngrok.com/). In `/releng/set-ngrok` you can find a small linux script that allows you to set the url of ngrok in the local configuration. However, this script is extremely simple and only replaces the value of a variable, so its use is optional.

You'll also need two email accounts (although you can reuse the same one if you wish) for sending emails from the cloud functions. Mailing is done with `nodemailer` and is carried out by the `mailDispatcher` cloud function (`functions/functions/mail.js`). You can review [nodemailer documentation](https://nodemailer.com/about/) in case you've problems sending mails using your email provider.

## Code preparation

We assume that:

- Azure and microsoft entra are configured.
- Node.js 16.x.0 is installed.
- `eslint` and `prettier` are globally installed.
- `firebase-tools` are globally installed.
- You have created a project in firebase named `my-firebase-project` and activated the blaze plan.
- You are authenticated in firebase (command line).

### Firebase

Now it's necessary to modify different files of the project to link it to your firebase project. Specifically:

- `.firebaserc`. Replace `rotterdam-hackathon` with `my-firebase-project`.
- `firebase.json`. Relace `rotterdam-hackathon` with `my-firebase-project`.
- `src/config.js`. Copy `releng/config.js` and set the configuration values provided by firebase.
- `releng/set-ngrok`. Replace `rotterdam-hackathon` with `my-firebase-project`.

Note that the current configuration is the same as the one being used on the hackathon site.

Note that we assume that firebase us-central1 zone is used. If you are planning to use a different firebase zone, look for occurrences of `us-central1` in the code and replace it.

### Firestore

The application uses firestore as a general database as well as a dynamic configuration store.

Therefore, it's necessary to create an initial document in firestore where the initial values of the dynamic configuration will be stored.

To do this:

1. Create a collection called `configuration` in the cloud firestore project linked to your firebase project.
2. Create a document called `env` in this collection.
3. Add two string fields to this document, `CHECK_IN_HOUR` with the value `14:00` (or similar) and `DELTA_DAYS` with the value `0`.

If you plan to run the application locally, you'll also need to perform these actions each time you run the firebase emulators. However, you can avoid the need to enter the local values manually each time by performing a firestore backup.

To do this:

1. Install node-firestore-import-export. `npm install -g node-firestore-import-export`.
2. Launch the emulators. `firebase emulators:start`.
3. Create the `env` document and set the values.
4. Create the backup in the directory of your choice (we recommend the folder `releng/emulators.backup` as it's included in `.gitignore`). `firebase emulators:export ./releng/emulators.backup`.

The next time you'll launch firebase emulators you can import the backup by using `firebase emulators:start --import=./releng/emulators.backup`.

### Cloud functions

The cloud functions use for their local and remote execution the `functions/.env.local` and `functions/.env.remote` files, respectively.

You'll have to modify them to suit your needs, before running the emulators or deploying the application on firebase.

Note that these files are included in .gitignore, so they'll be excluded from your repository.

**functions/.env.local**

```
# Mail configuration
MAIL_HOST=<your mail host>
MAIL_NAME=<your mail name>
MAIL_USER_NEOKE=<user mail name>@${MAIL_HOST}
MAIL_PASS_NEOKE=<user mail password>
MAIL_FORMAT_NEOKE=<user mail format>
MAIL_USER_OTA=<ota mail name>@${MAIL_HOST}
MAIL_PASS_OTA=<ota mail password>
MAIL_FORMAT_OTA=<ota mail format>
MAIL_PORT=<mail port>

# Webhook configuration
WEBHOOK_BASE=<ngrok url>/<project-name>/us-central1
WEBHOOK_URL=${WEBHOOK_BASE}/callback

# Website
SITE_URL=http://localhost:3000

# Microsoft azure configuration
AZ_TENANT_ID=<az tenant id>
AZ_CLIENT_ID=<ac client id>
AZ_CLIENT_SECRET=<ac client secret>

# Microsoft credentials manifest
CREDENTIAL_MANIFEST_BASE=https://verifiedid.did.msidentity.com/v1.0/tenants/${AZ_TENANT_ID}/verifiableCredentials/contracts
CREDENTIAL_MANIFEST_PASSPORT=${CREDENTIAL_MANIFEST_BASE}/<passport-manifest-id>/manifest
CREDENTIAL_MANIFEST_ARUBA_VERIFIED_TRAVELLER=${CREDENTIAL_MANIFEST_BASE}/<aruba-verified-traveller-manifest-id>/manifest
CREDENTIAL_MANIFEST_RESERVATION=${CREDENTIAL_MANIFEST_BASE}/<reservation-manifest-id>/manifest
CREDENTIAL_MANIFEST_PROOF_OF_STAY=${CREDENTIAL_MANIFEST_BASE}/<proof-of-stay-manifest-id>/manifest

# Microsoft dids
ISSUER_AUTHORITY=<your issuer did>
VERIFIER_AUTHORITY=<your verifier did>

# Issuance types
ISSUANCE_TYPE_PASSPORT=Passport
ISSUANCE_TYPE_ARUBA_VERIFIED_TRAVELLER=ArubaVerifiedTraveller
ISSUANCE_TYPE_RESERVATION=VerifiedReservation
ISSUANCE_TYPE_PROOF_OF_STAY=ProofOfStay

# Verification purposes
VERIFICATION_PURPUSE_PASSPORT=To verify that you have a valid passport
VERIFICATION_PURPOSE_ARUBA_VERIFIED_TRAVELLER=To verify that you are an Aruba verified traveller
VERIFICATION_PURPOSE_RESERVATION=To verify that you have a reservation

# Microsoft app
ISSUANCE_CLIENT_NAME=NeoKe credential issuer
VERIFICATION_CLIENT_NAME=NeoKe credential verifier

# Veriff
VERIFF_URL=https://stationapi.veriff.com/v1
VERIFF_X_CALLBACK=https://veriff.com
VERIFF_X_AUTH_CLIENT=<veriff-client-id>
VERIFF_X_AUTH_PRIVATE_KEY=<veriff-private-key>
```

**functions/.env.remote**

```
# Mail configuration
MAIL_HOST=<your mail host>
MAIL_NAME=<your mail name>
MAIL_USER_NEOKE=<user mail name>@${MAIL_HOST}
MAIL_PASS_NEOKE=<user mail password>
MAIL_FORMAT_NEOKE=<user mail format>
MAIL_USER_OTA=<ota mail name>@${MAIL_HOST}
MAIL_PASS_OTA=<ota mail password>
MAIL_FORMAT_OTA=<ota mail format>
MAIL_PORT=<mail port>

# Webhook configuration
WEBHOOK_BASE=https://us-central1-<project name>.cloudfunctions.net
WEBHOOK_URL=${WEBHOOK_BASE}/callback

# Website
SITE_URL=https://<project name>.web.app

# Microsoft azure configuration
AZ_TENANT_ID=<az tenant id>
AZ_CLIENT_ID=<ac client id>
AZ_CLIENT_SECRET=<ac client secret>

# Microsoft credentials manifest
CREDENTIAL_MANIFEST_BASE=https://verifiedid.did.msidentity.com/v1.0/tenants/${AZ_TENANT_ID}/verifiableCredentials/contracts
CREDENTIAL_MANIFEST_PASSPORT=${CREDENTIAL_MANIFEST_BASE}/<passport-manifest-id>/manifest
CREDENTIAL_MANIFEST_ARUBA_VERIFIED_TRAVELLER=${CREDENTIAL_MANIFEST_BASE}/<aruba-verified-traveller-manifest-id>/manifest
CREDENTIAL_MANIFEST_RESERVATION=${CREDENTIAL_MANIFEST_BASE}/<reservation-manifest-id>/manifest
CREDENTIAL_MANIFEST_PROOF_OF_STAY=${CREDENTIAL_MANIFEST_BASE}/<proof-of-stay-manifest-id>/manifest

# Microsoft dids
ISSUER_AUTHORITY=<your issuer did>
VERIFIER_AUTHORITY=<your verifier did>

# Issuance types
ISSUANCE_TYPE_PASSPORT=Passport
ISSUANCE_TYPE_ARUBA_VERIFIED_TRAVELLER=ArubaVerifiedTraveller
ISSUANCE_TYPE_RESERVATION=VerifiedReservation
ISSUANCE_TYPE_PROOF_OF_STAY=ProofOfStay

# Verification purposes
VERIFICATION_PURPUSE_PASSPORT=To verify that you have a valid passport
VERIFICATION_PURPOSE_ARUBA_VERIFIED_TRAVELLER=To verify that you are an Aruba verified traveller
VERIFICATION_PURPOSE_RESERVATION=To verify that you have a reservation

# Microsoft app
ISSUANCE_CLIENT_NAME=NeoKe credential issuer
VERIFICATION_CLIENT_NAME=NeoKe credential verifier

# Veriff
VERIFF_URL=https://stationapi.veriff.com/v1
VERIFF_X_CALLBACK=https://veriff.com
VERIFF_X_AUTH_CLIENT=<veriff-client-id>
VERIFF_X_AUTH_PRIVATE_KEY=<veriff-private-key>
```

## Execution

### Launch locally

1. Launch ngrok. `ngrok http 5001`.
2. Set ngrok url in `functions/.env.local` (remember that you can execute `./releng/set-ngrok` if you are running linux).
3. Launch firebase. `firebase emulators:start` (or `firebase emulators:start --import=.<backup folder>` if you are using a backup).
4. Launch the application in development mode. `npm run start`.

### Deploy remotely

1. Install node packages. `npm i`.
2. Install functions packages. `pushd functions; npm i; popd`.
3. Prepare the built. `npm run build`.
4. Deploy the website. `firebase deploy`.

Remember that if you make modifications to the code you'll need to format it before doing step 3. This applies to both the website (`npm run format`) and the cloud functions (`pushd functions; npm run format; popd`). Note that on IDEs such as [code](https://code.visualstudio.com/) you can set up automatic formatting, every time you save your changes.

## Dependencies and third-party libraries

The application depends on azure and firebase.

At the same time, the code depends on several public libraries specified in the `package.json` configuration file.

Note that the web code will be executed on the user's browser and the cloud functions will be executed on the firebase's servers. For this reason, there are two different `package.json` files, the one used by the website (`./package.json`) and the one used by the cloud functions (`/functions/package.json`).
