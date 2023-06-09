import { notification } from "antd";
import { t } from "i18next";

const DEFAULT_DURATION = 2;

const display = (type, message, description, duration, callback) => {
  notification[type]({
    message,
    description,
    duration: duration ?? DEFAULT_DURATION,
  });

  if (callback) {
    setTimeout(callback, duration * 1000);
  }
};

const account = {
  created: (duration, callback) =>
    display(
      "success",
      t("notification.account_created.title"),
      t("notification.account_created.body"),
      duration,
      callback,
    ),

  sign_in: (account, duration, callback) =>
    display(
      "success",
      t("notification.account_sign_in.title"),
      t("notification.account_sign_in.body", { account }),
      duration,
      callback,
    ),

  updated: (account, duration, callback) =>
    display(
      "success",
      t("notification.account_updated.title"),
      t("notification.account_updated.body", { account }),
      duration,
      callback,
    ),

  not_found: (account, duration, callback) =>
    display(
      "error",
      t("notification.account_not_found.title"),
      t("notification.account_not_found.body", { account }),
      duration,
      callback,
    ),

  invalid: (duration, callback) =>
    display(
      "error",
      t("notification.invalid_account.title"),
      t("notification.invalid_account.body"),
      duration,
      callback,
    ),

  invalid_email: (duration, callback) =>
    display(
      "error",
      t("notification.invalid_email_registration.title"),
      t("notification.invalid_email_registration.body"),
      duration,
      callback,
    ),
};

const auth = {
  internal_problem: (duration, callback) =>
    display(
      "error",
      t("notification.auth_internal_problem.title"),
      t("notification.auth_internal_problem.body"),
      duration,
      callback,
    ),
};

const connection = {
  error: (error, duration, callback) =>
    display(
      "error",
      t("notification.connection_error.title"),
      t("notification.connection_error.body", { error: JSON.stringify(error) }),
      duration,
      callback,
    ),
};

const reservation = {
  credential_sent: (duration, callback) =>
    display(
      "success",
      t("notification.credential_sent.title"),
      t("notification.credential_sent.body"),
      duration,
      callback,
    ),

  proof_request_sent: (duration, callback) =>
    display(
      "success",
      t("notification.proof_request_sent.title"),
      t("notification.proof_request_sent.body"),
      duration,
      callback,
    ),

  delete: (reservation, duration, callback) =>
    display(
      "info",
      t("notification.reservation_deleted.title"),
      t("notification.reservation_deleted.body", { reservation }),
      duration,
      callback,
    ),

  credential_request_internal_problem: (duration, callback) =>
    display(
      "error",
      t("notification.credential_request_internal_problem.title"),
      t("notification.credential_request_internal_problem.body"),
      duration,
      callback,
    ),

  proof_request_internal_problem: (duration, callback) =>
    display(
      "error",
      t("notification.credential_proof_request_internal_problem.title"),
      t("notification.credential_proof_request_internal_problem.body"),
      duration,
      callback,
    ),
};

export default {
  account,
  auth,
  connection,
  reservation,
};
