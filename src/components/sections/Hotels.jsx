import { useParams } from "react-router-dom";
import { useState } from "react";
import { useContext } from "react";
import { Button, Row } from "antd";
import NeoKeContext from "context";
import HotelDataPanel from "components/panels/HotelDataPanel";
import { t } from "i18next";

function Hotels({ isOwner, reserve }) {
  const { account, hotels } = useContext(NeoKeContext);

  const [empty, setEmpty] = useState(false);
  const [emptyTimeout, setEmptyTimeout] = useState(undefined);

  const { city, checkInDate, checkOutDate } = useParams();

  let filtered_hotels = hotels;
  if (isOwner) {
    filtered_hotels = filtered_hotels.filter(
      (hotel) => hotel.account == account.docRef,
    );
  }

  if (city) {
    filtered_hotels = filtered_hotels.filter(
      (hotel) => hotel.city.toUpperCase() == city.toUpperCase(),
    );
  }

  let hasDays = undefined;
  if (checkInDate && checkOutDate) {
    try {
      const date_check_in = new Date(checkInDate.replaceAll("_", "/"));
      const date_check_out = new Date(checkOutDate.replaceAll("_", "/"));
      hasDays = Math.ceil(
        (date_check_out - date_check_in) / (1000 * 3600 * 24),
      );
    } catch {
      // Nothing to do
    }
  }

  if (!isOwner) {
    if (!filtered_hotels.length) {
      if (emptyTimeout == null) {
        setEmptyTimeout(
          setTimeout(() => {
            setEmpty(true);
          }, 5000),
        );
      }
    } else {
      if (emptyTimeout != null) {
        clearTimeout(emptyTimeout);
        setEmptyTimeout(null);
        setEmpty(false);
      }
    }
  }

  return (
    <div className="container hotels-container ant-col-24">
      <Row justify="space-evenly" align="top">
        <div className="panel ant-col-lg-11 ant-col-md-16 ant-col-sm-22 ant-col-xs-24">
          <div className="title">
            {t(
              isOwner
                ? "section.hotels.title.owner"
                : "section.hotels.title.general",
            )}
          </div>
          {empty && <div className="subtitle">{t("section.hotels.empty")}</div>}
          {filtered_hotels.map((hotel) => (
            <div key={hotel.id}>
              <HotelDataPanel
                hotel={hotel}
                brief={true}
                days={hasDays}
                reserve={reserve}
                isOwner={isOwner}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
              />
            </div>
          ))}
          {isOwner && (
            <Button
              className="create-hotel-button"
              type="primary"
              block
              shape="round"
              onClick={() => (window.location = "/create-hotel")}
            >
              {t("section.hotels.button.create_hotel")}
            </Button>
          )}
        </div>
      </Row>
    </div>
  );
}

export default Hotels;
