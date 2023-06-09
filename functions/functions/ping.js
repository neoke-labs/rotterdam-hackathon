const functions = require("firebase-functions");
const fetch = require("node-fetch");

const callCloudFunction = async (url, data = {}) => {
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });
};

const scheduledPing = functions
  .region("us-central1")
  .pubsub.schedule("every 3 minutes")
  .onRun(async () => {
    const Config = require("../utilities/config");
    const config = new Config();
    const { WEBHOOK_URL } = config;
    await callCloudFunction(WEBHOOK_URL, { dispatch: "warmUpDispatcher" });
    return null;
  });

exports.cfs = {
  scheduledPing,
};
