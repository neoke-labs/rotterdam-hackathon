import { useParams } from "react-router-dom";
import { useState, useContext } from "react";
import NotFound from "../NotFound";
import { Row } from "antd";
import { useTranslation } from "react-i18next";
import NeoKeContext from "context";
import HotelDataPanel from "components/panels/HotelDataPanel";

function Hotel() {
  const { hotels } = useContext(NeoKeContext);

  const { t } = useTranslation();
  const { hotelId } = useParams();

  const hotel = hotels.find((r) => r.id == hotelId);

  const [notFound, setNotFound] = useState(false);
  const [notFoundTimeout, setNotFoundTimeout] = useState(undefined);

  if (!notFound) {
    if (hotel == undefined) {
      if (notFoundTimeout == null) {
        setNotFoundTimeout(
          setTimeout(() => {
            setNotFound(true);
          }, 1250),
        );
      }
      return <> </>;
    } else {
      if (notFoundTimeout != null) {
        clearTimeout(notFoundTimeout);
        setNotFoundTimeout(null);
      }

      if (Object.keys(hotel).length) {
        return (
          <div className="container hotel-container ant-col-24">
            <Row justify="space-evenly" align="top">
              <HotelDataPanel
                className={
                  "ant-col-lg-11 ant-col-md-16 ant-col-sm-22 ant-col-xs-24"
                }
                hotel={hotel}
              />
            </Row>
          </div>
        );
      }
    }
  }

  return <NotFound path={"/"} message={t("link.go_home")} />;
}

export default Hotel;
