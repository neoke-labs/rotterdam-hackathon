import { httpsCallable } from "firebase/functions";
import { functions } from "../../util/firebase";
import { useEffect, useState, useRef } from "react";
import notifications from "util/notifications";
import { BrowserView, MobileView, isMobile } from "react-device-detect";
import { firestore } from "util/firebase";
import { getLink } from "util/links";

import { t } from "i18next";
import { QRCodeSVG } from "qrcode.react";
import { Button, Spin, Typography } from "antd";
const { Text } = Typography;

function RequestReservationProof({ reservationId, selfService }) {
  const [proofCode, setProofCode] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [displayReservationProofError, setDisplayReservationProofError] =
    useState(false);
  const [
    displayReservationProofErrorTimer,
    setDisplayReservationProofErrorTimer,
  ] = useState(undefined);

  const proofUnsubscribe = useRef();

  useEffect(() => {
    const dispatcher = httpsCallable(functions, "dispatcher");

    const notifyReservationProofError = () => {
      if (!displayReservationProofErrorTimer && displayReservationProofError) {
        const timer = setTimeout(() => {
          if (displayReservationProofError) {
            notifications.reservation.proof_request_internal_problem();
          }
          setDisplayReservationProofErrorTimer(undefined);
        }, 1000);
        setDisplayReservationProofErrorTimer(timer);
      }
    };

    if (!reservationId) {
      setResultMessage("self_service.nonexistent_reservation");
    } else {
      if (
        resultMessage == "" &&
        proofCode == "" &&
        requestId == "" &&
        !loading
      ) {
        setLoading(true);
        firestore.doc.get("reservation", reservationId, (doc) => {
          if (doc.exists) {
            if (doc.data().proof_status != "provided") {
              dispatcher({ id: reservationId, dispatch: "proofRequest" })
                .then((response) => {
                  const { data } = response.data;
                  if (data.error) {
                    notifyReservationProofError();
                  } else {
                    setDisplayReservationProofError(false);
                    setProofCode(data.url);
                    setRequestId(data.requestId);
                  }
                  setLoading(false);
                })
                .catch(() => {
                  notifyReservationProofError();
                  setLoading(false);
                });
            } else {
              setResultMessage("self_service.proof_already_provided");
              setLoading(false);
            }
          } else {
            setResultMessage("self_service.nonexistent_reservation");
            setLoading(false);
          }
        });
      }
    }
  }, [
    loading,
    requestId,
    proofCode,
    reservationId,
    resultMessage,
    displayReservationProofError,
    displayReservationProofErrorTimer,
  ]);

  useEffect(() => {
    if (requestId !== "" && !proofUnsubscribe.current) {
      proofUnsubscribe.current = firestore.doc.onSnapshot(
        "microsoft_request",
        requestId,
        (doc) => {
          if (doc.exists) {
            const data = doc.data();
            switch (data.status) {
              case "request_retrieved":
                setProofCode("");
                break;

              case "presentation_verified":
                proofUnsubscribe.current();
                proofUnsubscribe.current = null;
                setResultMessage("self_service.proof_already_provided");
                break;
            }
          } else {
            setResultMessage("self_service.proof_already_provided");
          }
        },
      );
    }
  }, [requestId, reservationId]);

  const renderProofCode = () => {
    if (resultMessage) {
      return (
        <center>
          <h4>{t(resultMessage)}</h4>
        </center>
      );
    }

    if (requestId) {
      if (proofCode) {
        if (isMobile && !launched) {
          setLaunched(true);
          window.open(getLink(proofCode));
        }

        if (!selfService || !isMobile) {
          return (
            <center>
              <MobileView>
                <h4>
                  <Text>
                    {t("modal.reservation_proof_request.mobile.title")}
                  </Text>
                </h4>
                <Button
                  style={{ marginTop: "20px" }}
                  type="primary"
                  shape="round"
                >
                  <a href={getLink(proofCode)}>
                    {t("modal.reservation_proof_request.mobile.link")}
                  </a>
                </Button>
              </MobileView>
              <BrowserView>
                <QRCodeSVG
                  width="100%"
                  height="100%"
                  value={getLink(proofCode)}
                />
                <h4>
                  <Text>
                    {t("modal.reservation_proof_request.browser.title")}
                  </Text>
                </h4>
              </BrowserView>
            </center>
          );
        }
      } else {
        return (
          <center>
            <h4>{t("modal.reservation_proof_request.waiting_confirmation")}</h4>
          </center>
        );
      }
    }
    return (
      <center>
        <Spin size="large" />
      </center>
    );
  };

  return renderProofCode();
}

export default RequestReservationProof;
