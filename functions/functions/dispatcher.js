const functions = require("firebase-functions");

const admin = require("firebase-admin");
const callback = require("./callback");
const hotel = require("./hotel");
const account = require("./account");
const arubaVerifiedTravellerCredential = require("./aruba-verified-traveller");
const passport = require("./passport");
const reserve = require("./reserve");
const Config = require("../utilities/config");

const { r } = require("../utilities/response_wrapper");
const Microsoft = require("../utilities/microsoft");
const Veriff = require("../utilities/veriff");
const config = new Config();
const { SITE_URL } = config;

// CORS Express middleware to enable CORS Requests.
const corsMiddleware = require("cors")({
  origin: SITE_URL,
  methods: "GET,HEAD,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  optionsSuccessStatus: 200,
});

const dispatcher = functions
  .region("us-central1")
  .runWith({ minInstances: 1, maxInstances: 1, memory: "512MB" })
  .https.onRequest(async (request, response) => {
    corsMiddleware(request, response, async () => {
      if (request.body && request.body.requestStatus) {
        functions.logger.debug("callback execution");
        callback.triggers.callback(request, response);
      } else {
        const { dispatch } = request.body.data;
        functions.logger.debug(`${dispatch} execution`);
        delete request.body.data.dispatch;

        switch (dispatch) {
          case "createVeriffSession":
            {
              const veriff = new Veriff();
              const result = await veriff.createSession();
              r(response, "Veriff session created", result);
            }
            break;

          case "obtainVeriffPassportCredential":
            {
              const veriff = new Veriff();
              const result = await veriff.obtainPassportCredential(
                request.body.data.session,
              );
              r(response, "Request completed", result);
            }
            break;

          case "obtainVeriffSessionDecision":
            {
              const veriff = new Veriff();
              const result = await veriff.getSessionDecision(
                request.body.data.session,
              );
              r(response, "Veriff session decision obtained", result);
            }
            break;

          case "createHotel":
            hotel.triggers.createHotel(request, response);
            break;

          case "createAccount":
            account.triggers.createAccount(request, response);
            break;

          case "createArubaVerifiedTravellerCredentialCache":
            arubaVerifiedTravellerCredential.triggers.createArubaVerifiedTravellerCredentialCache(
              request,
              response,
            );
            break;

          case "arubaVerifiedTravellerCredentialRequest":
            arubaVerifiedTravellerCredential.triggers.arubaVerifiedTravellerCredentialRequest(
              request,
              response,
            );
            break;

          case "requestArubaVerifiedTravellerCredentialProof":
            arubaVerifiedTravellerCredential.triggers.requestArubaVerifiedTravellerCredentialProof(
              request,
              response,
            );
            break;

          case "requestPassportProof":
            passport.triggers.requestPassportProof(request, response);
            break;

          case "reserveRoom":
            reserve.triggers.reserveRoom(request, response);
            break;

          case "reservationCredentialRequest":
            reserve.triggers.reservationCredentialRequest(request, response);
            break;

          case "proofRequest":
            reserve.triggers.proofRequest(request, response);
            break;

          case "reservationProofOfStayCredentialRequest":
            reserve.triggers.reservationProofOfStayCredentialRequest(
              request,
              response,
            );
            break;

          case "warmUpDispatcher":
            {
              const microsoft = await Microsoft.instance();
              microsoft.requestArubaVerifiedTravellerCredentialProof(false);
              await admin
                .firestore()
                .collection("configuration")
                .limit(1)
                .get();
              r(response, "Dispatcher warmed up", {});
            }
            break;
        }
      }
    });
  });

exports.cfs = {
  dispatcher,
};
