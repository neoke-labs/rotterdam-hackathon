const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Microsoft = require("../utilities/microsoft");
const mail_adapters = require("../utilities/mail_adapter");
const { r } = require("../utilities/response_wrapper");
const { getDocByField } = require("../utilities/firebase");

const uuid4 = require("uuid4");

const createArubaVerifiedTravellerCredentialCache = async (
  request,
  response,
) => {
  let aruba_verified_traveller_credential = request.body.data;
  aruba_verified_traveller_credential.threadId = uuid4();
  const agency = aruba_verified_traveller_credential.agency;
  delete aruba_verified_traveller_credential.agency;

  const id = await createCache(aruba_verified_traveller_credential);

  functions.logger.debug(
    `Aruba verified traveller credential cache doc created 'aruba_verified_traveller_credential/${id}'`,
  );

  await mail_adapters.adapters.createArubaVerifiedTravellerCredential(
    aruba_verified_traveller_credential,
    id,
    agency,
  );

  r(response, "Aruba verified traveller credential cache created", { id });
};

const createCache = async (aruba_verified_traveller_credential) => {
  const document = await admin
    .firestore()
    .collection("aruba_verified_traveller_credential")
    .add(aruba_verified_traveller_credential);
  return document.id;
};

const arubaVerifiedTravellerCredentialRequest = async (request, response) => {
  const { id, ref } = request.body.data;

  const aruba_verified_traveller_credential = ref
    ? await getDocByField("aruba_verified_traveller_credential", "ref", ref)
    : await admin
        .firestore()
        .collection("aruba_verified_traveller_credential")
        .doc(id)
        .get();

  if (aruba_verified_traveller_credential.exists) {
    const { data, promise } = await arubaVerifiedTravellerCredentialIssuance(
      aruba_verified_traveller_credential.id,
    );

    await promise;
    functions.logger.debug(`Request stored`);

    r(response, "Request sent", { data });
  } else {
    r(
      response,
      "Aruba verified traveller credential cache not found",
      ref ? { ref } : { id },
      400,
    );
  }
};

const arubaVerifiedTravellerCredentialIssuance = async (
  arubaVerifiedTravellerCredentialID,
) => {
  const aruba_verified_traveller_credential = await admin
    .firestore()
    .collection("aruba_verified_traveller_credential")
    .doc(arubaVerifiedTravellerCredentialID)
    .get();

  const data = aruba_verified_traveller_credential.data();

  const microsoft = await Microsoft.instance();
  const result = await microsoft.requestArubaVerifiedTravellerCredential(
    data.threadId,
    data.email,
    data.first_name,
    data.last_name,
    data.date_of_birth,
    data.passport_number,
    data.passport_country,
    data.passport_expiry_date,
    data.selfie,
    arubaVerifiedTravellerCredentialID,
  );

  return result;
};

const requestArubaVerifiedTravellerCredentialProof = async (_, response) => {
  const microsoft = await Microsoft.instance();
  const { data, promise } =
    await microsoft.requestArubaVerifiedTravellerCredentialProof();

  await promise;
  functions.logger.debug(`Request stored`);

  r(response, "Aruba verified traveller credential proof requested", {
    data,
  });
};

exports.triggers = {
  createArubaVerifiedTravellerCredentialCache,
  createCache,
  arubaVerifiedTravellerCredentialRequest,
  requestArubaVerifiedTravellerCredentialProof,
};
