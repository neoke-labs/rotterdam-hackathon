import { t } from "i18next";
import { Row, Col, Button } from "antd";
import { isMobile } from "react-device-detect";

const HotelDataPanel = ({
  className,
  hotel,
  brief,
  days,
  checkInDate,
  checkOutDate,
  reserve,
  hideButton,
}) => {
  let location = undefined;
  if (!hideButton) {
    if (reserve) {
      location = `/reserve/${hotel.id}/${checkInDate}/${checkOutDate}`;
    } else if (brief) {
      location = `/hotel/${hotel.id}`;
    }
  }

  const getContent = () => {
    return (
      <>
        <div className="hotel-data">
          <div className="hotel-data-image">
            <img src={hotel.image} />
          </div>
          <div className="hotel-data-description">
            <div className="hotel-name">{hotel.name}</div>
            <div className="hotel-address">
              {hotel.address}, {hotel.city}
            </div>
            <div className="hotel-speedy-check-in">
              {hotel.speedy_check_in && (
                <div className="content">
                  {t("panel.hotel.speedy_check_in")}
                </div>
              )}
            </div>
            <div className="hotel-price">
              {days ? `€ ${hotel.price * days}` : `€ ${hotel.price}`}
              {days ? <span>/ € {hotel.price} per night</span> : <></>}
            </div>
          </div>
          <div className="hotel-data-buttons">
            {!isMobile && location && (
              <Button
                className="see-hotel-details-button"
                type="primary"
                shape="round"
                onClick={() => (window.location = location)}
              >
                {t(
                  `section.hotel.button.${reserve ? "reserve" : "see_details"}`,
                )}
              </Button>
            )}
          </div>
        </div>
        {!brief && (
          <Row className="hotel-extended-info">
            <Col>
              <div className="hotel-slogan">{hotel.slogan}</div>
              <div className="hotel-description">{hotel.description}</div>
            </Col>
          </Row>
        )}
      </>
    );
  };

  return (
    <div
      className={`${brief ? "hotel" : `hotel panel ${className}`}`}
      style={{ paddingBottom: "24px" }}
    >
      {location && isMobile ? (
        <a href={location}>{getContent()}</a>
      ) : (
        <>{getContent()}</>
      )}
    </div>
  );
};

export default HotelDataPanel;
