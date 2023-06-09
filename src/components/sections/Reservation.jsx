import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import NotFound from "../NotFound";
import { Row } from "antd";
import { useTranslation } from "react-i18next";
import ReservationDataPanel from "components/panels/ReservationDataPanel";
import NeoKeContext from "context";
import { processReservation } from "util/reservation";

function Reservation() {
  const { setReservationId, reservations, hotels } = useContext(NeoKeContext);

  const { t } = useTranslation();
  const { reservationId } = useParams();

  const [reservation, setReservation] = useState(undefined);
  const [notFound, setNotFound] = useState(false);
  const [notFoundTimeout, setNotFoundTimeout] = useState(undefined);

  useEffect(() => {
    processReservation(
      reservationId,
      reservations.find((r) => r.id == reservationId),
      hotels,
      setReservation,
      setReservationId,
    );
  }, [t, reservationId, reservations, hotels, setReservationId]);

  if (reservation == undefined) {
    if (notFoundTimeout == null) {
      setNotFoundTimeout(
        setTimeout(() => {
          setNotFound(true);
        }, 5000),
      );
    }
    return notFound ? (
      <NotFound path={"/"} message={t("link.go_home")} />
    ) : (
      <></>
    );
  } else {
    if (notFoundTimeout != null) {
      clearTimeout(notFoundTimeout);
      setNotFoundTimeout(null);
      setNotFound(false);
    }

    if (Object.keys(reservation).length) {
      return (
        <div className="container reservation-container ant-col-24">
          <Row justify="space-evenly" align="top">
            <ReservationDataPanel
              className={
                "ant-col-lg-11 ant-col-md-16 ant-col-sm-22 ant-col-xs-24"
              }
              reservation={reservation}
              hotel={reservation.hotel}
              reservationState={reservation.state}
            />
          </Row>
        </div>
      );
    }
  }
}

export default Reservation;
