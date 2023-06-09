const functions = require("firebase-functions");
const admin = require("firebase-admin");

const account = require("./account");
const reserve = require("./reserve");

const callback = async (request, response) => {
  if (request.method !== "POST") {
    response.status(403).json({ result: "Forbidden call" }).end();
  } else {
    const message = request.body;
    functions.logger.debug("Got message from microsoft");

    if (message.requestStatus) {
      await this.processMessage(message);
      response.status(202).json({ result: "Accepted" }).end();
    } else {
      response.status(403).json({ result: "Invalid message" }).end();
    }
  }
};

this.retrieveRequest = async (requestId, warn = true) => {
  const request = await admin
    .firestore()
    .collection("microsoft_request")
    .doc(requestId)
    .get();

  if (!request.exists) {
    if (warn) {
      functions.logger.warn(
        `Unknown request '${requestId}'. Potential data corruption`,
      );
    }
    return undefined;
  }

  return request;
};

this.processMessage = async (message) => {
  const REQUEST_RETRIEVED = "request_retrieved";
  const PRESENTATION_VERIFIED = "presentation_verified";
  const ISSUANCE_SUCCESSFUL = "issuance_successful";

  let request = undefined;
  let claims = undefined;
  let cache_id = undefined;

  switch (message.requestStatus) {
    case REQUEST_RETRIEVED:
      functions.logger.debug("Microsoft request retrieved");
      request = await this.retrieveRequest(message.requestId);
      if (request) {
        await request.ref.update({
          status: "request_retrieved",
        });
        functions.logger.debug(
          `Microsoft request doc updated 'microsoft_request/${message.requestId}'`,
        );
      }
      break;

    case ISSUANCE_SUCCESSFUL:
      functions.logger.debug("Microsoft issuance successful retrieved");
      request = await this.retrieveRequest(message.requestId);
      if (request) {
        switch (request.data().type) {
          case "aruba_verified_traveller_credential_issuance":
            functions.logger.debug(
              "Aruba verified traveller credential issued",
            );
            cache_id = request.data().cache_id;
            await request.ref.delete();
            functions.logger.debug(
              `Microsoft request doc deleted 'microsoft_request/${message.requestId}'`,
            );

            await admin
              .firestore()
              .collection("aruba_verified_traveller_credential")
              .doc(cache_id)
              .delete();
            functions.logger.debug(
              `Aruba verified traveller credential cache doc deleted 'aruba_verified_traveller_credential/${cache_id}'`,
            );
            break;

          case "passport_credential_issuance":
            functions.logger.debug("Passport credential issued");
            await request.ref.delete();
            functions.logger.debug(
              `Microsoft request doc deleted 'microsoft_request/${message.requestId}'`,
            );
            break;

          case "reservation_credential_issuance":
            functions.logger.debug("Reservation credential issued");
            await reserve.triggers.reservationCredentialNewState(
              "received",
              message.state,
            );
            await request.ref.delete();
            functions.logger.debug(
              `Microsoft request doc deleted 'microsoft_request/${message.requestId}'`,
            );
            break;

          case "proof_of_stay_credential_issuance":
            functions.logger.debug(
              "Reservation proof of stay credential issued",
            );
            await reserve.triggers.proofOfStayCredentialNewState(
              "received",
              message.state,
            );
            await request.ref.delete();
            functions.logger.debug(
              `Microsoft request doc deleted 'microsoft_request/${message.requestId}'`,
            );
            break;

          default:
            await request.ref.update({
              status: "request_retrieved",
            });
            functions.logger.debug(
              `Microsoft request doc updated 'microsoft_request/${message.requestId}'`,
            );
        }
      }
      break;

    case PRESENTATION_VERIFIED:
      functions.logger.debug("Microsoft presentation verified");
      request = await this.retrieveRequest(message.requestId);
      if (request) {
        switch (request.data().type) {
          case "aruba_verified_traveller_credential_proof":
            await account.triggers.registerAccount({
              email: message.verifiedCredentialsData[0].claims.email,
              first_name: message.verifiedCredentialsData[0].claims.firstName,
              last_name: message.verifiedCredentialsData[0].claims.lastName,
              notifications: true,
            });
            await request.ref.update({
              ...message.verifiedCredentialsData[0].claims,
              status: "presentation_verified",
            });
            functions.logger.debug(
              `Microsoft request doc updated 'microsoft_request/${message.requestId}'`,
            );
            break;

          case "passport_proof":
            await request.ref.update({
              ...message.verifiedCredentialsData[0].claims,
              status: "presentation_verified",
            });
            functions.logger.debug(
              `Microsoft request doc updated 'microsoft_request/${message.requestId}'`,
            );
            break;

          case "reservation_proof":
            claims = {
              ...message.verifiedCredentialsData[0].claims,
              ...message.verifiedCredentialsData[1].claims,
            };
            await reserve.triggers.proofProvided(claims);
            await request.ref.update({
              ...claims,
              status: "presentation_verified",
            });
            functions.logger.debug(
              `Microsoft request doc updated 'microsoft_request/${message.requestId}'`,
            );
            break;

          default:
        }
        await request.ref.delete();
        functions.logger.debug(
          `Microsoft request doc deleted 'microsoft_request/${message.requestId}'`,
        );
      }
      break;
    default:
      functions.logger.debug(`Unexpected microsoft message '${message.code}'`);
  }
};

exports.triggers = {
  callback,
};
