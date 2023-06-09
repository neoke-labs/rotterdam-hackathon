import HotelAccountForm from "components/forms/HotelAccountForm";
import { t } from "i18next";

function HotelAccountDataPanel({
  className,
  docRef,
  email,
  callback,
  receiveNotifications,
}) {
  return (
    <div className={`panel ${className}`}>
      <h3>{t("section.account.title")}</h3>
      <h2 display="none"></h2>
      <HotelAccountForm
        docRef={docRef}
        email={email}
        callback={callback}
        receive_notifications={receiveNotifications}
      />
    </div>
  );
}

export default HotelAccountDataPanel;
