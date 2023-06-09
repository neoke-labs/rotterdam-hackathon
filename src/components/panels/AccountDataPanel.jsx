import AccountForm from "components/forms/AccountForm";
import { t } from "i18next";

function AccountDataPanel({
  className,
  docRef,
  email,
  firstName,
  lastName,
  receiveNotifications,
  callback,
}) {
  return (
    <div className={`panel ${className}`}>
      <h3>{t("section.account.title")}</h3>
      <h2 display="none"></h2>
      <AccountForm
        docRef={docRef}
        email={email}
        first_name={firstName}
        last_name={lastName}
        receive_notifications={receiveNotifications}
        callback={callback}
      />
    </div>
  );
}

export default AccountDataPanel;
