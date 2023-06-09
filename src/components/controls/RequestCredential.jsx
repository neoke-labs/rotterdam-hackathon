import { httpsCallable } from "firebase/functions";
import { functions } from "../../util/firebase";
import { useEffect, useState, useRef } from "react";
import notifications from "util/notifications";
import { BrowserView, MobileView, isMobile } from "react-device-detect";
import { firestore } from "util/firebase";

import { t } from "i18next";
import { QRCodeSVG } from "qrcode.react";
import { Button, Spin, Typography } from "antd";
import { getLink } from "../../util/links";

const { Text } = Typography;

function RequestCredential({
  reservationId,
  arubaVerifiedTravellerCredentialId,
  cloudFunction,
  selfService,
}) {
  const [credentialCode, setCredentialCode] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayCredentialError, setDisplayCredentialError] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [displayCredentialErrorTimer, setDisplayCredentialErrorTimer] =
    useState(undefined);

  const credentialUnsubscribe = useRef();

  useEffect(() => {
    const dispatcher = httpsCallable(functions, "dispatcher");

    const aruba = cloudFunction == "arubaVerifiedTravellerCredentialRequest";

    const notifyCredentialError = () => {
      if (!displayCredentialErrorTimer && displayCredentialError) {
        const timer = setTimeout(() => {
          if (displayCredentialError) {
            notifications.reservation.credential_request_internal_problem();
          }
          setDisplayCredentialErrorTimer(undefined);
        }, 1000);
        setDisplayCredentialErrorTimer(timer);
      }
    };

    if (aruba && !arubaVerifiedTravellerCredentialId) {
      setResultMessage(
        "self_service.nonexistent_aruba_verified_traveller_credential",
      );
    } else if (!aruba && !reservationId) {
      setResultMessage("self_service.nonexistent_reservation");
    } else {
      if (
        resultMessage == "" &&
        credentialCode == "" &&
        requestId == "" &&
        !loading
      ) {
        setLoading(true);
        firestore.doc.get(
          aruba ? "aruba_verified_traveller_credential" : "reservation",
          aruba ? arubaVerifiedTravellerCredentialId : reservationId,
          (doc) => {
            if (doc.exists) {
              if (
                aruba ||
                (cloudFunction == "reservationCredentialRequest" &&
                  doc.data().credential_status != "received") ||
                (cloudFunction != "reservationCredentialRequest" &&
                  doc.data().proof_of_stay_status != "received")
              ) {
                dispatcher({
                  id: aruba
                    ? arubaVerifiedTravellerCredentialId
                    : reservationId,
                  dispatch: cloudFunction,
                })
                  .then((response) => {
                    const { data } = response.data;
                    if (data.error) {
                      notifyCredentialError();
                    } else {
                      setDisplayCredentialError(false);
                      setCredentialCode(data.url);
                      setRequestId(data.requestId);
                    }
                    setLoading(false);
                  })
                  .catch(() => {
                    notifyCredentialError();
                    setLoading(false);
                  });
              } else {
                setResultMessage("self_service.credential_already_issued");
                setLoading(false);
              }
            } else {
              setResultMessage(
                aruba
                  ? "self_service.nonexistent_aruba_verified_traveller_credential"
                  : "self_service.nonexistent_reservation",
              );
              setLoading(false);
            }
          },
        );
      }
    }
  }, [
    loading,
    requestId,
    credentialCode,
    reservationId,
    arubaVerifiedTravellerCredentialId,
    cloudFunction,
    resultMessage,
    displayCredentialError,
    displayCredentialErrorTimer,
  ]);

  useEffect(() => {
    if (requestId !== "" && !credentialUnsubscribe.current) {
      credentialUnsubscribe.current = firestore.doc.onSnapshot(
        "microsoft_request",
        requestId,
        (doc) => {
          if (doc.exists) {
            const data = doc.data();
            switch (data.status) {
              case "request_retrieved":
                setCredentialCode("");
                break;

              case "issuance_successful":
                credentialUnsubscribe.current();
                credentialUnsubscribe.current = null;
                setResultMessage("self_service.credential_already_issued");
                break;
            }
          } else {
            setResultMessage("self_service.credential_already_issued");
          }
        },
      );
    }
  }, [requestId, reservationId]);

  const renderCredentialCode = () => {
    if (resultMessage) {
      return (
        <center>
          <h4>{t(resultMessage)}</h4>
        </center>
      );
    }

    if (requestId) {
      if (credentialCode) {
        if (isMobile && !launched) {
          setLaunched(true);
          window.open(getLink(credentialCode));
        }

        if (!selfService || !isMobile) {
          return (
            <center>
              <MobileView>
                <h4>
                  <Text>{t("modal.request_credential.mobile.title")}</Text>
                </h4>
                <Button
                  style={{ marginTop: "20px" }}
                  type="primary"
                  shape="round"
                >
                  <a href={getLink(credentialCode)}>
                    {t("modal.request_credential.mobile.link")}
                  </a>
                </Button>
              </MobileView>
              <BrowserView>
                <QRCodeSVG
                  width="100%"
                  height="100%"
                  value={getLink(credentialCode)}
                />
                <h4>
                  <Text>{t("modal.request_credential.browser.title")}</Text>
                </h4>
              </BrowserView>
            </center>
          );
        }
      } else {
        return (
          <center>
            <h4>{t("modal.request_credential.waiting_acceptance")}</h4>
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

  return renderCredentialCode();
}

export default RequestCredential;
