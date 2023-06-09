const functions = require("firebase-functions");
const Microsoft = require("../utilities/microsoft");
const { r } = require("../utilities/response_wrapper");

const requestPassportProof = async (request, response) => {
  const microsoft = await Microsoft.instance();
  const { data, promise } = await microsoft.requestPassportProof();

  await promise;
  functions.logger.debug(`Request stored`);

  r(response, "Passport proof requested", {
    data,
  });
};

exports.triggers = {
  requestPassportProof,
};
