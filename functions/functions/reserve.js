const functions = require("firebase-functions");
const admin = require("firebase-admin");
const uuid4 = require("uuid4");

const Microsoft = require("../utilities/microsoft");
const { getDocByField } = require("../utilities/firebase");
const mail_adapters = require("../utilities/mail_adapter");

const { r } = require("../utilities/response_wrapper");

const checkedInTrigger = functions
  .region("us-central1")
  .firestore.document("reservation/{reservationId}")
  .onUpdate(async (change, context) => {
    const reservation_data = change.after.data();
    if (reservation_data.checked_in && !change.before.data().checked_in) {
      const reservationId = context.params.reservationId;
      const account = await admin
        .firestore()
        .collection("account")
        .doc(reservation_data.account)
        .get();

      if (account.data().notifications) {
        await mail_adapters.adapters.proofOfStayAvailable(
          reservationId,
          reservation_data,
        );
      }
    }
  });

const reserveRoom = async (request, response) => {
  const reservation = request.body.data;
  reservation.credential_status = "none";
  reservation.credential_thread = "none";
  reservation.proof_status = "none";
  reservation.proof_thread = "none";
  reservation.proof_of_stay_status = "none";
  reservation.proof_of_stay_thread = "none";
  reservation.checked_in = false;

  const document = await admin
    .firestore()
    .collection("reservation")
    .add(reservation);
  functions.logger.debug(
    `Reservation doc created 'reservation/${document.id}'`,
  );

  r(response, "Reservation stored", { id: document.id });

  const account = await admin
    .firestore()
    .collection("account")
    .doc(reservation.account)
    .get();

  await mail_adapters.adapters.userReservation(
    reservation,
    document.id,
    account.data().notifications,
  );
};

const reservationCredentialRequest = async (request, response) => {
  const { id } = request.body.data;
  const reservation = await admin
    .firestore()
    .collection("reservation")
    .doc(id)
    .get();

  if (reservation.exists) {
    const { data, promise } = await reservationCredentialIssuance(id);

    await promise;
    functions.logger.debug(`Request stored`);

    r(response, "Request sent", { data });
  } else {
    r(response, "Reservation not found", { id }, 400);
  }
};

const reservationCredentialIssuance = async (reservationID) => {
  const reservation = await admin
    .firestore()
    .collection("reservation")
    .doc(reservationID)
    .get();

  let threadId = reservation.data().credential_thread;
  if (threadId == "none") {
    threadId = uuid4();
    await reservation.ref.update({
      credential_status: "request",
      credential_thread: threadId,
    });
  }

  functions.logger.debug(
    `Reservation doc updated 'reservation/${reservation.id}'`,
  );

  const data = reservation.data();
  const microsoft = await Microsoft.instance();
  const result = await microsoft.requestReservationCredential(
    threadId,
    reservation.id,
    data.last_name,
    data.first_name,
    data.check_in_date,
    data.hotel_id,
  );
  return result;
};

const proofRequest = async (request, response) => {
  const { id } = request.body.data;
  const reservation = await admin
    .firestore()
    .collection("reservation")
    .doc(id)
    .get();

  if (reservation.exists) {
    const { data, promise } = await reservationProofRequest(id);

    await promise;
    functions.logger.debug(`Request stored`);

    r(response, "Request sent", { data });
  } else {
    r(response, "Reservation not found", { id }, 400);
  }
};

const reservationProofRequest = async (reservationID) => {
  const reservation = await admin
    .firestore()
    .collection("reservation")
    .doc(reservationID)
    .get();

  let threadId = reservation.data().proof_thread;
  if (threadId == "none") {
    threadId = uuid4();
    await reservation.ref.update({
      proof_status: "request",
      proof_thread: threadId,
    });
  }

  functions.logger.debug(
    `Reservation doc updated 'reservation/${reservation.id}'`,
  );

  const microsoft = await Microsoft.instance();
  const result = await microsoft.requestReservationProofRequest(threadId);
  return result;
};

const reservationProofOfStayCredentialRequest = async (request, response) => {
  const { id } = request.body.data;
  const reservation = await admin
    .firestore()
    .collection("reservation")
    .doc(id)
    .get();

  if (reservation.exists) {
    const { data, promise } = await reservationProofOfStayCredentialIssuance(
      id,
    );

    await promise;
    functions.logger.debug(`Request stored`);

    r(response, "Request sent", { data });
  } else {
    r(response, "Reservation not found", { id }, 400);
  }
};

const reservationProofOfStayCredentialIssuance = async (reservationID) => {
  const reservation = await admin
    .firestore()
    .collection("reservation")
    .doc(reservationID)
    .get();

  let threadId = reservation.data().proof_of_stay_thread;
  if (threadId == "none") {
    threadId = uuid4();
    await reservation.ref.update({
      proof_of_stay_status: "request",
      proof_of_stay_thread: threadId,
    });
  }

  functions.logger.debug(
    `Reservation doc updated 'reservation/${reservation.id}'`,
  );

  const data = reservation.data();
  const microsoft = await Microsoft.instance();
  const result = await microsoft.requestReservationProofOfStayCredential(
    threadId,
    reservation.id,
    data.last_name,
    data.first_name,
    data.check_in_date,
    data.check_out_date,
    data.hotel_id,
  );
  return result;
};

const reservationCredentialNewState = async (credential_status, threadId) => {
  const reservation = await getDocByField(
    "reservation",
    "credential_thread",
    threadId,
  );
  if (reservation) {
    if (reservation.data().credential_status != "received") {
      await reservation.ref.update({
        credential_status,
      });
      functions.logger.debug(
        `Reservation doc updated 'reservation/${reservation.id}'`,
      );

      if ("received" == credential_status) {
        const account = await admin
          .firestore()
          .collection("account")
          .doc(reservation.data().account)
          .get();

        if (account.data().notifications) {
          await mail_adapters.adapters.proofRequest(
            reservation.id,
            reservation.data(),
          );
        }
      }
    }
  }
};

const proofOfStayCredentialNewState = async (
  proof_of_stay_status,
  threadId,
) => {
  const reservation = await getDocByField(
    "reservation",
    "proof_of_stay_thread",
    threadId,
  );
  if (reservation) {
    if (reservation.data().proof_of_stay_status != "received") {
      await reservation.ref.update({
        proof_of_stay_status,
      });
      functions.logger.debug(
        `Reservation doc updated 'reservation/${reservation.id}'`,
      );
    }
  }
};

const proofProvided = async (claims) => {
  const id = claims.reservationId;

  const reservation = await admin
    .firestore()
    .collection("reservation")
    .doc(id)
    .get();

  if (reservation.exists && !reservation.data().proof_status != "provided") {
    let selfie = "";
    try {
      selfie = JSON.parse(claims.selfie);
    } catch {
      selfie = {
        base64: `data:image/png;base64,${claims.selfie}`,
      };
    }

    const values = {
      "Reservation Number": claims.reservationId,
      "Check-in Date": claims.checkInDate,
      "Hotel ID": claims.hotelId,
      "First Name": claims.firstName,
      "Last Name": claims.lastName,
      "Passport Number": claims.passportNumber,
      "Issuing Country": claims.passportCountry,
      "Expiry Date": claims.passportExpiryDate,
      "Date of Birth": claims.dateOfBirth,
      Selfie_link: selfie,
    };

    await admin.firestore().collection("proof").doc(id).set(values);
    functions.logger.debug(`Reservation proof created 'proof/${id}'`);

    await reservation.ref.update({
      proof_status: "provided",
    });
    functions.logger.debug(`Reservation doc updated 'reservation/${id}'`);

    await mail_adapters.adapters.userProof(reservation);
  }
};

exports.cfs = {
  checkedInTrigger,
};

exports.triggers = {
  reservationCredentialIssuance,
  reservationCredentialNewState,
  proofOfStayCredentialNewState,
  proofProvided,
  reserveRoom,
  reservationCredentialRequest,
  proofRequest,
  reservationProofOfStayCredentialRequest,
};
