/* eslint-disable require-jsdoc */
"use strict";

class Config {
  constructor() {
    const env = process.env.IS_FIREBASE_CLI != undefined ? "local" : "remote";

    require("dotenv-expand").expand(
      require("dotenv").config({ path: `.env.${env}` }),
    );

    // Mail configuration
    this.readVars([
      "MAIL_HOST",
      "MAIL_PORT",
      "MAIL_NAME",
      "MAIL_USER_NEOKE",
      "MAIL_PASS_NEOKE",
      "MAIL_FORMAT_NEOKE",
      "MAIL_USER_OTA",
      "MAIL_PASS_OTA",
      "MAIL_FORMAT_OTA",
    ]);

    // Webhook configuration
    this.readVars(["WEBHOOK_URL"]);

    // Website
    this.readVars(["SITE_URL"]);

    // Microsoft azure
    this.readVars(["AZ_TENANT_ID", "AZ_CLIENT_ID", "AZ_CLIENT_SECRET"]);

    // Microsoft credentials
    this.readVars([
      "CREDENTIAL_MANIFEST_PASSPORT",
      "CREDENTIAL_MANIFEST_ARUBA_VERIFIED_TRAVELLER",
      "CREDENTIAL_MANIFEST_RESERVATION",
      "CREDENTIAL_MANIFEST_PROOF_OF_STAY",
    ]);

    // Microsoft dids
    this.readVars(["ISSUER_AUTHORITY", "VERIFIER_AUTHORITY"]);

    // Issuance types
    this.readVars([
      "ISSUANCE_TYPE_PASSPORT",
      "ISSUANCE_TYPE_ARUBA_VERIFIED_TRAVELLER",
      "ISSUANCE_TYPE_RESERVATION",
      "ISSUANCE_TYPE_PROOF_OF_STAY",
    ]);

    // Verification purposes
    this.readVars([
      "VERIFICATION_PURPOSE_PASSPORT",
      "VERIFICATION_PURPOSE_ARUBA_VERIFIED_TRAVELLER",
      "VERIFICATION_PURPOSE_RESERVATION",
    ]);

    // Microsoft app
    this.readVars(["ISSUANCE_CLIENT_NAME", "VERIFICATION_CLIENT_NAME"]);

    // Veriff
    this.readVars([
      "VERIFF_URL",
      "VERIFF_X_AUTH_CLIENT",
      "VERIFF_X_AUTH_PRIVATE_KEY",
      "VERIFF_X_CALLBACK",
    ]);
  }

  readVars(vars) {
    vars.forEach((v) => (this[v] = process.env[v]));
  }
}

module.exports = Config;
