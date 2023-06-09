import ReservationsPanel from "components/panels/ReservationsPanel";
import { t } from "i18next";

const Reservations = () => {
  return (
    <div className="container container-table ant-col-xl-20 ant-col-xs-24">
      <h1>{t("section.reservations.title")}</h1>
      <ReservationsPanel />
    </div>
  );
};

export default Reservations;
