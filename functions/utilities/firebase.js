const admin = require("firebase-admin");

const getDocByField = async (collection, field, value) => {
  const docs = await admin
    .firestore()
    .collection(collection)
    .where(field, "==", value)
    .limit(1)
    .get();

  return docs.empty ? null : docs.docs[0];
};

const getDocWithField = async (collections, field, value) => {
  for (let i = 0; i < collections.length; i++) {
    let doc = await getDocByField(collections[i], field, value);
    if (doc) {
      return {
        doc,
        type: collections[i],
      };
    }
  }
};

exports.getDocByField = getDocByField;
exports.getDocWithField = getDocWithField;
