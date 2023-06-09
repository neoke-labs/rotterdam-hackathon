import CreateHotelForm from "components/forms/CreateHotelForm";
import { t } from "i18next";

function CreateHotelPanel() {
  return (
    <div className="panel">
      <h3>{t("section.create_hotel.title")}</h3>
      <CreateHotelForm header="" />
    </div>
  );
}

export default CreateHotelPanel;
