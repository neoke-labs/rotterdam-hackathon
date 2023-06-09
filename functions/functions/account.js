const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { getDocByField } = require("../utilities/firebase");
const mail_adapters = require("../utilities/mail_adapter");

const createAccount = async (request, response) => {
  const id = await registerAccount(request.body.data);
  if (id) {
    response.json({ result: { message: "Account stored", id } }).end();
  } else {
    response.status(400).send("E-mail is already registered").end();
  }
};

const registerAccount = async (data) => {
  const account = await getDocByField("account", "email", data.email);
  if (account) {
    return undefined;
  } else {
    const document = await admin.firestore().collection("account").add(data);
    const id = document.id;
    functions.logger.debug(`Account doc created 'account/${id}'`);

    if (data.hotel) {
      await mail_adapters.adapters.hotelAccount(data);
    } else {
      // TODO notify user
    }

    return id;
  }
};

exports.triggers = {
  createAccount,
  registerAccount,
};
