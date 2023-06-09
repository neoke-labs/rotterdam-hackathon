/* eslint-disable require-jsdoc */
"use strict";

const admin = require("firebase-admin");

const msal = require("@azure/msal-node");
const uuid4 = require("uuid4");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

let singleton = undefined;

const ISSUANCE = "Issuance";
const PRESENTATION = "Presentation";

class Microsoft {
  constructor(general_config, microsoft_config) {
    this.config = general_config;
    this.msal_config = microsoft_config.msal_config;
    this.msal_cca = microsoft_config.msal_cca;
    this.msal_client_credential_request =
      microsoft_config.msal_client_credential_request;
    this.config.TENANT_REGION_SCOPE = microsoft_config.tenant_region_scope;
    this.config.MS_IDENTITY_HOST_NAME = microsoft_config.ms_identity_host_name;
  }

  static async instance() {
    if (!singleton) {
      const Config = require("./config");
      const general_config = new Config();
      const microsoft_config = await this.readMicrosoftConfig(general_config);
      singleton = new Microsoft(general_config, microsoft_config);
    }
    return singleton;
  }

  static async readMicrosoftConfig(config) {
    const response = await fetch(
      `https://login.microsoftonline.com/${config.AZ_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    );
    const response_data = await response.json();

    const msal_config = {
      auth: {
        clientId: config.AZ_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${config.AZ_TENANT_ID}`,
        clientSecret: config.AZ_CLIENT_SECRET,
      },
    };

    const msal_cca = new msal.ConfidentialClientApplication(msal_config);

    const msal_client_credential_request = {
      scopes: ["3db474b9-6a0c-4840-96ac-1fceb342124f/.default"],
      skipCache: false,
    };

    const tenant_region_scope = response_data.tenant_region_scope;

    const ms_identity_host_name = "https://verifiedid.did.msidentity.com/v1.0/";

    return {
      msal_config,
      msal_cca,
      msal_client_credential_request,
      tenant_region_scope,
      ms_identity_host_name,
    };
  }

  async getAccessToken() {
    let access_token = undefined;
    const { msal_cca, msal_client_credential_request } = this;
    try {
      const result = await msal_cca.acquireTokenByClientCredential(
        msal_client_credential_request,
      );
      if (result) {
        access_token = result.accessToken;
      }
    } catch {
      access_token = undefined;
    }

    return access_token;
  }

  generateArubaVerifiedTravellerCredentialRequestConfig(
    aruba_verified_traveller_credential_thread_id,
    email,
    first_name,
    last_name,
    date_of_birth,
    passport_number,
    passport_country,
    passport_expiry_date,
    selfie,
  ) {
    const { config } = this;
    const {
      ISSUER_AUTHORITY,
      ISSUANCE_CLIENT_NAME,
      ISSUANCE_TYPE_ARUBA_VERIFIED_TRAVELLER,
      CREDENTIAL_MANIFEST_ARUBA_VERIFIED_TRAVELLER,
      WEBHOOK_URL,
    } = config;

    return {
      authority: ISSUER_AUTHORITY,
      includeQRCode: false,
      registration: {
        clientName: ISSUANCE_CLIENT_NAME,
      },
      callback: {
        url: WEBHOOK_URL,
        state: aruba_verified_traveller_credential_thread_id,
        headers: {
          "api-key": uuid4(),
        },
      },
      type: ISSUANCE_TYPE_ARUBA_VERIFIED_TRAVELLER,
      manifest: CREDENTIAL_MANIFEST_ARUBA_VERIFIED_TRAVELLER,
      claims: {
        email,
        first_name,
        last_name,
        date_of_birth,
        passport_number,
        passport_country,
        passport_expiry_date,
        selfie,
      },
    };
  }

  generateArubaVerifiedTravellerCredentialProofRequestConfig() {
    const { config } = this;
    const {
      VERIFIER_AUTHORITY,
      VERIFICATION_CLIENT_NAME,
      VERIFICATION_PURPOSE_ARUBA_VERIFIED_TRAVELLER,
      ISSUER_AUTHORITY,
      ISSUANCE_TYPE_ARUBA_VERIFIED_TRAVELLER,
      WEBHOOK_URL,
    } = config;

    return {
      authority: VERIFIER_AUTHORITY,
      includeQRCode: false,
      includeReceipt: true,
      registration: {
        clientName: VERIFICATION_CLIENT_NAME,
        purpose: VERIFICATION_PURPOSE_ARUBA_VERIFIED_TRAVELLER,
      },
      callback: {
        url: WEBHOOK_URL,
        state: uuid4(),
        headers: {
          "api-key": uuid4(),
        },
      },
      requestedCredentials: [
        {
          type: ISSUANCE_TYPE_ARUBA_VERIFIED_TRAVELLER,
          purpose: VERIFICATION_PURPOSE_ARUBA_VERIFIED_TRAVELLER,
          acceptedIssuers: [ISSUER_AUTHORITY],
          configuration: {
            validation: {
              allowRevoked: false,
              validateLinkedDomain: false,
            },
          },
        },
      ],
    };
  }

  generatePassportProofRequestConfig() {
    const { config } = this;
    const {
      VERIFIER_AUTHORITY,
      VERIFICATION_CLIENT_NAME,
      VERIFICATION_PURPOSE_PASSPORT,
      ISSUER_AUTHORITY,
      ISSUANCE_TYPE_PASSPORT,
      WEBHOOK_URL,
    } = config;

    return {
      authority: VERIFIER_AUTHORITY,
      includeQRCode: false,
      includeReceipt: true,
      registration: {
        clientName: VERIFICATION_CLIENT_NAME,
        purpose: VERIFICATION_PURPOSE_PASSPORT,
      },
      callback: {
        url: WEBHOOK_URL,
        state: uuid4(),
        headers: {
          "api-key": uuid4(),
        },
      },
      requestedCredentials: [
        {
          type: ISSUANCE_TYPE_PASSPORT,
          purpose: VERIFICATION_PURPOSE_PASSPORT,
          acceptedIssuers: [ISSUER_AUTHORITY],
          configuration: {
            validation: {
              allowRevoked: false,
              validateLinkedDomain: false,
            },
          },
        },
      ],
    };
  }

  generateReservationCredentialRequestConfig(
    credential_thread_id,
    reservation_id,
    last_name,
    first_name,
    check_in_date,
    hotel_id,
  ) {
    const { config } = this;
    const {
      ISSUER_AUTHORITY,
      ISSUANCE_CLIENT_NAME,
      ISSUANCE_TYPE_RESERVATION,
      CREDENTIAL_MANIFEST_RESERVATION,
      WEBHOOK_URL,
    } = config;

    return {
      authority: ISSUER_AUTHORITY,
      includeQRCode: false,
      registration: {
        clientName: ISSUANCE_CLIENT_NAME,
      },
      callback: {
        url: WEBHOOK_URL,
        state: credential_thread_id,
        headers: {
          "api-key": uuid4(),
        },
      },
      type: ISSUANCE_TYPE_RESERVATION,
      manifest: CREDENTIAL_MANIFEST_RESERVATION,
      claims: {
        reservation_id,
        first_name,
        last_name,
        check_in_date,
        hotel_id,
      },
    };
  }

  generateReservationProofOfStayCredentialRequestConfig(
    proof_of_stay_thread_id,
    reservation_id,
    last_name,
    first_name,
    check_in_date,
    check_out_date,
    hotel_id,
  ) {
    const { config } = this;
    const {
      ISSUER_AUTHORITY,
      ISSUANCE_CLIENT_NAME,
      ISSUANCE_TYPE_PROOF_OF_STAY,
      CREDENTIAL_MANIFEST_PROOF_OF_STAY,
      WEBHOOK_URL,
    } = config;

    return {
      authority: ISSUER_AUTHORITY,
      includeQRCode: false,
      registration: {
        clientName: ISSUANCE_CLIENT_NAME,
      },
      callback: {
        url: WEBHOOK_URL,
        state: proof_of_stay_thread_id,
        headers: {
          "api-key": uuid4(),
        },
      },
      type: ISSUANCE_TYPE_PROOF_OF_STAY,
      manifest: CREDENTIAL_MANIFEST_PROOF_OF_STAY,
      claims: {
        reservation_id,
        first_name,
        last_name,
        check_in_date,
        check_out_date,
        hotel_id,
      },
    };
  }

  generateReservationProofRequestConfig(proof_thread_id) {
    const { config } = this;
    const {
      VERIFIER_AUTHORITY,
      VERIFICATION_CLIENT_NAME,
      VERIFICATION_PURPOSE_ARUBA_VERIFIED_TRAVELLER,
      VERIFICATION_PURPOSE_RESERVATION,
      ISSUER_AUTHORITY,
      ISSUANCE_TYPE_ARUBA_VERIFIED_TRAVELLER,
      ISSUANCE_TYPE_RESERVATION,
      WEBHOOK_URL,
    } = config;

    return {
      authority: VERIFIER_AUTHORITY,
      includeQRCode: false,
      includeReceipt: true,
      registration: {
        clientName: VERIFICATION_CLIENT_NAME,
        purpose: VERIFICATION_PURPOSE_RESERVATION,
      },
      callback: {
        url: WEBHOOK_URL,
        state: proof_thread_id,
        headers: {
          "api-key": uuid4(),
        },
      },
      requestedCredentials: [
        {
          type: ISSUANCE_TYPE_ARUBA_VERIFIED_TRAVELLER,
          purpose: VERIFICATION_PURPOSE_ARUBA_VERIFIED_TRAVELLER,
          acceptedIssuers: [ISSUER_AUTHORITY],
          configuration: {
            validation: {
              allowRevoked: false,
              validateLinkedDomain: false,
            },
          },
        },
        {
          type: ISSUANCE_TYPE_RESERVATION,
          purpose: VERIFICATION_PURPOSE_RESERVATION,
          acceptedIssuers: [ISSUER_AUTHORITY],
          configuration: {
            validation: {
              allowRevoked: false,
              validateLinkedDomain: false,
            },
          },
        },
      ],
    };
  }

  generatePassportCredentialRequestConfig(
    credential_thread_id,
    first_name,
    last_name,
    date_of_birth,
    passport_number,
    passport_expiry_date,
    passport_country,
    selfie,
    passport_image,
  ) {
    const { config } = this;
    const {
      ISSUER_AUTHORITY,
      ISSUANCE_CLIENT_NAME,
      ISSUANCE_TYPE_PASSPORT,
      CREDENTIAL_MANIFEST_PASSPORT,
      WEBHOOK_URL,
    } = config;

    const passportChunks = passport_image
      ? passport_image.match(new RegExp(".{1," + 1024 * 100 + "}", "g"))
      : [];

    return {
      authority: ISSUER_AUTHORITY,
      includeQRCode: false,
      registration: {
        clientName: ISSUANCE_CLIENT_NAME,
      },
      callback: {
        url: WEBHOOK_URL,
        state: credential_thread_id,
        headers: {
          "api-key": uuid4(),
        },
      },
      type: ISSUANCE_TYPE_PASSPORT,
      manifest: CREDENTIAL_MANIFEST_PASSPORT,
      claims: {
        first_name,
        last_name,
        date_of_birth,
        passport_number,
        passport_expiry_date,
        passport_country,
        selfie,
        passport01: passportChunks.length >= 1 ? passportChunks[0] : "",
        passport02: passportChunks.length >= 2 ? passportChunks[1] : "",
        passport03: passportChunks.length >= 3 ? passportChunks[2] : "",
      },
    };
  }

  async sendMicrosoftRequest(request_config, type) {
    const { config } = this;
    const { MS_IDENTITY_HOST_NAME } = config;

    const payload = JSON.stringify(request_config);
    const access_token = await this.getAccessToken();

    const client_api_request_endpoint = `${MS_IDENTITY_HOST_NAME}verifiableCredentials/create${type}Request`;
    const response = await fetch(client_api_request_endpoint, {
      method: "POST",
      body: payload,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length.toString(),
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (response.status < 500) {
      let data = await response.json();
      data.id = request_config.callback.state;
      return data;
    } else {
      return { error: response.status };
    }
  }

  async requestArubaVerifiedTravellerCredential(
    aruba_verified_traveller_credential_thread_id,
    email,
    first_name,
    last_name,
    date_of_birth,
    passport_number,
    passport_country,
    passport_expiry_date,
    selfie,
    cache_id,
  ) {
    const request_config =
      this.generateArubaVerifiedTravellerCredentialRequestConfig(
        aruba_verified_traveller_credential_thread_id,
        email,
        first_name,
        last_name,
        date_of_birth,
        passport_number,
        passport_country,
        passport_expiry_date,
        selfie,
      );

    let data = await this.sendMicrosoftRequest(request_config, ISSUANCE);
    let promise = admin
      .firestore()
      .collection("microsoft_request")
      .doc(data.requestId)
      .set({
        ...data,
        type: "aruba_verified_traveller_credential_issuance",
        cache_id,
      });
    return { data, promise };
  }

  async requestArubaVerifiedTravellerCredentialProof(store = true) {
    const request_config =
      this.generateArubaVerifiedTravellerCredentialProofRequestConfig();
    let data = await this.sendMicrosoftRequest(request_config, PRESENTATION);
    if (store) {
      let promise = admin
        .firestore()
        .collection("microsoft_request")
        .doc(data.requestId)
        .set({ ...data, type: "aruba_verified_traveller_credential_proof" });
      return { data, promise };
    }
  }

  async requestPassportProof(store = true) {
    const request_config = this.generatePassportProofRequestConfig();
    let data = await this.sendMicrosoftRequest(request_config, PRESENTATION);
    if (store) {
      let promise = admin
        .firestore()
        .collection("microsoft_request")
        .doc(data.requestId)
        .set({ ...data, type: "passport_proof" });
      return { data, promise };
    }
  }

  async requestReservationCredential(
    credential_thread_id,
    reservation_id,
    last_name,
    first_name,
    check_in_date,
    hotel_id,
  ) {
    const request_config = this.generateReservationCredentialRequestConfig(
      credential_thread_id,
      reservation_id,
      last_name,
      first_name,
      check_in_date,
      hotel_id,
    );

    let data = await this.sendMicrosoftRequest(request_config, ISSUANCE);
    let promise = admin
      .firestore()
      .collection("microsoft_request")
      .doc(data.requestId)
      .set({ ...data, type: "reservation_credential_issuance" });
    return { data, promise };
  }

  async requestReservationProofRequest(proof_thread_id) {
    const request_config =
      this.generateReservationProofRequestConfig(proof_thread_id);

    let data = await this.sendMicrosoftRequest(request_config, PRESENTATION);
    let promise = admin
      .firestore()
      .collection("microsoft_request")
      .doc(data.requestId)
      .set({ ...data, type: "reservation_proof" });
    return { data, promise };
  }

  async requestReservationProofOfStayCredential(
    proof_of_stay_thread_id,
    reservation_id,
    last_name,
    first_name,
    check_in_date,
    check_out_date,
    hotel_id,
  ) {
    const request_config =
      this.generateReservationProofOfStayCredentialRequestConfig(
        proof_of_stay_thread_id,
        reservation_id,
        last_name,
        first_name,
        check_in_date,
        check_out_date,
        hotel_id,
      );

    let data = await this.sendMicrosoftRequest(request_config, ISSUANCE);
    let promise = admin
      .firestore()
      .collection("microsoft_request")
      .doc(data.requestId)
      .set({ ...data, type: "proof_of_stay_credential_issuance" });
    return { data, promise };
  }

  async requestPassportCredential(
    credential_thread_id,
    first_name,
    last_name,
    date_of_birth,
    passport_number,
    passport_expiry_date,
    passport_country,
    selfie,
    passport_image,
  ) {
    const request_config = this.generatePassportCredentialRequestConfig(
      credential_thread_id,
      first_name,
      last_name,
      date_of_birth,
      passport_number,
      passport_expiry_date,
      passport_country,
      selfie,
      passport_image,
    );

    let data = await this.sendMicrosoftRequest(request_config, ISSUANCE);
    let promise = admin
      .firestore()
      .collection("microsoft_request")
      .doc(data.requestId)
      .set({ ...data, type: "reservation_credential_issuance" });
    return { data, promise };
  }
}

module.exports = Microsoft;
