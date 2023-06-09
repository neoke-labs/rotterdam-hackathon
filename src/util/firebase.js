import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/functions";
import { config } from "../config";

import { connectFunctionsEmulator } from "firebase/functions";
import notifications from "./notifications";

firebase.initializeApp(config);

const db = firebase.firestore();
const functions = firebase.app().functions("us-central1");

if (location.hostname === "localhost") {
  db.useEmulator("localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
}

const firestore = {
  dbError: (error) => notifications.connection.error(error),
  helpers: {
    getPrivateReservation: (id, callback) =>
      db
        .collection("reservation")
        .doc(id)
        .get()
        .then(callback)
        .catch(firestore.dbError),

    getByField: (collection, field, op, value, callback, callbackError) =>
      db
        .collection(collection)
        .where(field, op, value)
        .limit(1)
        .get()
        .then(callback)
        .catch(callbackError ?? firestore.dbError),

    getReservationsByHotelID: (id, callback, callbackError) =>
      db
        .collection("reservation")
        .where("hotel_id", "==", id)
        .get()
        .then(callback)
        .catch(callbackError ?? firestore.dbError),

    subscribeReservationsByHotelOwnerID: (id, callback, callbackError) =>
      db
        .collection("reservation")
        .where("hotel_owner_id", "==", id)
        .onSnapshot(callback, callbackError ?? firestore.dbError),

    getReservationsByEmail: (email, callback, callbackError) =>
      db
        .collection("reservation")
        .where("email", "==", email)
        .get()
        .then(callback)
        .catch(callbackError ?? firestore.dbError),

    subscribeReservationsByEmail: (email, callback, callbackError) =>
      db
        .collection("reservation")
        .where("email", "==", email)
        .onSnapshot(callback, callbackError ?? firestore.dbError),

    getReservationsByAccount: (account, callback, callbackError) =>
      db
        .collection("reservation")
        .where("account", "==", account)
        .get()
        .then(callback)
        .catch(callbackError ?? firestore.dbError),

    subscribeReservationsByAccount: (account, callback, callbackError) =>
      db
        .collection("reservation")
        .where("account", "==", account)
        .onSnapshot(callback, callbackError ?? firestore.dbError),

    getAccountByEmail: (email, callback, callbackError) =>
      firestore.helpers.getByField(
        "account",
        "email",
        "==",
        email,
        callback,
        callbackError ?? firestore.dbError,
      ),

    getHotels: (callback, callbackError) =>
      db
        .collection("account")
        .orderBy("hotel")
        .get()
        .then(callback, callbackError ?? firestore.dbError),

    subscribeHotels: (callback, callbackError) =>
      db
        .collection("hotel")
        .onSnapshot(callback, callbackError ?? firestore.dbError),
  },

  collection: {
    get: (collection, callback, callbackError) =>
      db
        .collection(collection)
        .get()
        .then(callback)
        .catch(callbackError ?? firestore.dbError),
  },

  doc: {
    get: (collection, document, callback, callbackError) =>
      db
        .collection(collection)
        .doc(document)
        .get()
        .then(callback)
        .catch(callbackError ?? firestore.dbError),

    update: (collection, document, update, callback, callbackError) =>
      db
        .collection(collection)
        .doc(document)
        .update(update)
        .then(callback)
        .catch(callbackError ?? firestore.dbError),

    delete: (collection, document, callback, callbackError) =>
      db
        .collection(collection)
        .doc(document)
        .delete()
        .then(callback, callbackError ?? firestore.dbError),

    deleteAll: (collection, documents, callback, callbackError) => {
      let batch = db.batch();
      documents.forEach((d) => batch.delete(db.collection(collection).doc(d)));
      batch.commit().then(callback, callbackError ?? firestore.dbError);
    },

    onSnapshot: (collection, document, callback, callbackError) =>
      db
        .collection(collection)
        .doc(document)
        .onSnapshot(callback, callbackError ?? firestore.dbError),
  },
};

export default firebase;
export { firestore, functions };
