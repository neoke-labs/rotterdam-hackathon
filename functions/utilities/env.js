/* eslint-disable require-jsdoc */
"use strict";

class Env {
  constructor() {}

  async init() {
    const admin = require("firebase-admin");
    const env = await admin
      .firestore()
      .collection("configuration")
      .doc("env")
      .get();

    const data = env.data();
    Object.keys(data).forEach((k) => {
      this[k] = data[k];
    });
  }
}

module.exports = Env;
