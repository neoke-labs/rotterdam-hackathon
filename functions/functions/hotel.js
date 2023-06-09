const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { r } = require("../utilities/response_wrapper");

const createHotel = async (request, response) => {
  let hotel = request.body.data;

  const document = await admin.firestore().collection("hotel").add(hotel);
  functions.logger.debug(`Hotel doc created 'hotel/${document.id}'`);

  r(response, "Hotel stored", { id: document.id });
};

exports.triggers = {
  createHotel,
};
