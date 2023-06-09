import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import NotFound from "../NotFound";
import { Row } from "antd";
import { useTranslation } from "react-i18next";
import ProofDataPanel from "components/panels/ProofDataPanel";
import NeoKeContext from "context";
import { processReservation } from "util/reservation";
import CheckInState from "components/controls/CheckInState";

function Proof() {
  const { setReservationId, account, reservations, hotels, proof } =
    useContext(NeoKeContext);

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

  if (!notFound) {
    if (reservation == undefined) {
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

      if (
        Object.keys(reservation).length &&
        account?.docRef == reservation.hotel_owner_id
      ) {
        return (
          <div className="container ant-col-24">
            {proof != undefined && Object.keys(proof).length ? (
              <>
                <h1>{t("section.proof.title")}</h1>
                <h4>{t("section.proof.subtitle")}</h4>
              </>
            ) : (
              <></>
            )}
            <Row justify="space-evenly" align="top">
              <ProofDataPanel
                className={
                  "ant-col-lg-11 ant-col-md-16 ant-col-sm-22 ant-col-xs-24"
                }
                proof={proof}
                reservation={reservation}
              />
            </Row>
            {proof != undefined && Object.keys(proof).length ? (
              <Row
                justify="space-evently"
                align="center"
                className="check-in-state"
              >
                <CheckInState reservation={reservation} />
              </Row>
            ) : null}
          </div>
        );
      }
    }
  }

  return <NotFound path={"/"} message={t("link.go_home")} />;
}

export default Proof;
