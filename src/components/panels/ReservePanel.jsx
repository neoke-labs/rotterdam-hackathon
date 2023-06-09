import ReserveForm from "components/forms/ReserveForm";
import { t } from "i18next";

function ReservePanel() {
  return (
    <div className="panel ant-col-lg-11 ant-col-md-16 ant-col-sm-22 ant-col-xs-24">
      <h3>{t("section.reserve.title")}</h3>
      <ReserveForm />
    </div>
  );
}

export default ReservePanel;
