import { httpsCallable } from "firebase/functions";
import { functions } from "../../util/firebase";
import { useEffect, useState, useRef } from "react";
import notifications from "util/notifications";
import { BrowserView, MobileView, isMobile } from "react-device-detect";
import { firestore } from "util/firebase";
import { getLink } from "util/links";
import NeokeLogo from "../../images/logo.png";

import { t } from "i18next";
import { QRCodeSVG } from "qrcode.react";
import { Button, Spin, Typography } from "antd";
const { Text } = Typography;

function AuthControl({
  endpoint = undefined,
  handleSignIn = undefined,
  handleProof = () => {},
  dispatch = "requestArubaVerifiedTravellerCredentialProof",
  title = undefined,
}) {
  const [authCode, setAuthCode] = useState("");
  const [requestId, setRequestId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayAuthError, setDisplayAuthError] = useState(false);
  const [displayAuthErrorTimer, setDisplayAuthErrorTimer] = useState(undefined);
  const [launched, setLaunched] = useState(false);

  const authUnsubscribe = useRef();

  useEffect(() => {
    const dispatcher = httpsCallable(functions, "dispatcher");

    const notifyAuthError = () => {
      if (!displayAuthErrorTimer && displayAuthError) {
        const timer = setTimeout(() => {
          if (displayAuthError) {
            notifications.auth.internal_problem();
          }
          setDisplayAuthErrorTimer(undefined);
        }, 1000);
        setDisplayAuthErrorTimer(timer);
      }
    };

    if (authCode == "" && requestId == "" && !loading) {
      setLoading(true);
      dispatcher({ dispatch })
        .then((response) => {
          const { data } = response.data;
          if (data.error) {
            notifyAuthError();
          } else {
            setDisplayAuthError(false);
            setAuthCode(data.url);
            setRequestId(data.requestId);
          }
          setLoading(false);
        })
        .catch(() => {
          notifyAuthError();
          setLoading(false);
        });
    }
  }, [
    loading,
    dispatch,
    requestId,
    authCode,
    displayAuthError,
    displayAuthErrorTimer,
  ]);

  useEffect(() => {
    if (requestId !== "" && !authUnsubscribe.current) {
      authUnsubscribe.current = firestore.doc.onSnapshot(
        "microsoft_request",
        requestId,
        (doc) => {
          if (doc.exists) {
            const data = doc.data();
            switch (data.status) {
              case "request_retrieved":
                setStatus(t("section.auth.waiting_confirmation"));
                setAuthCode("");
                break;

              case "presentation_verified":
                authUnsubscribe.current();
                authUnsubscribe.current = null;
                if (handleSignIn) {
                  handleSignIn(data.email, false, false, endpoint);
                } else if (handleProof) {
                  handleProof(data);
                }
                break;
            }
          }
        },
      );
    }
  }, [requestId, handleSignIn, handleProof, endpoint]);

  const renderAuthCode = () => {
    if (requestId) {
      if (authCode) {
        if (isMobile && !launched) {
          setLaunched(true);
          window.open(getLink(authCode));
        }

        return (
          <center>
            <MobileView>
              <h4>
                <Text>{t("panel.auth.mobile.title")}</Text>
              </h4>
              <Button
                style={{ marginBottom: "16px" }}
                type="primary"
                shape="round"
              >
                <a href={getLink(authCode)}>{t("panel.auth.mobile.link")}</a>
              </Button>
              <div className="powered-by">
                <p>Powered by</p>
                <img src={NeokeLogo} />
              </div>
            </MobileView>
            <BrowserView>
              {title && (
                <h2>
                  <Text>{title}</Text>
                </h2>
              )}
              <QRCodeSVG width="60%" height="60%" value={getLink(authCode)} />
              <h4>
                <Text>{t("panel.auth.browser.title")}</Text>
              </h4>
              <div className="powered-by">
                <p>Powered by</p>
                <img src={NeokeLogo} />
              </div>
            </BrowserView>
          </center>
        );
      } else {
        return (
          <center>
            <h4>{status}</h4>
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

  return renderAuthCode();
}

export default AuthControl;
