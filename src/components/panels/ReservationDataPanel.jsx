import { Button, Modal, Tag, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
const { Text } = Typography;
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { firestore } from "../../util/firebase";
const { dbError } = firestore;

import { displayFields, combineFields } from "../../util/fields";
import notifications from "util/notifications";
import { QRCodeSVG } from "qrcode.react";
import RequestCredential from "components/controls/RequestCredential";
import RequestReservationProof from "components/controls/RequestReservationProof";

const ReservationDataPanel = ({
  className,
  reservation,
  hotel,
  reservationState,
}) => {
  const { t } = useTranslation();
  const [taskInProgress, setTaskInProgress] = useState(false);
  const obtainCredentialModalRef = useRef();
  const requestProofModalRef = useRef();
  const obtainProofOfStayModalRef = useRef();

  useEffect(() => {
    if (
      obtainCredentialModalRef.current &&
      reservationState == t("state.waiting_documentation")
    ) {
      obtainCredentialModalRef.current.destroy();
      obtainCredentialModalRef.current = null;
    }
    if (requestProofModalRef.current && reservationState == t("state.ready")) {
      requestProofModalRef.current.destroy();
      requestProofModalRef.current = null;
    }
    if (
      obtainProofOfStayModalRef.current &&
      reservationState == t("state.proof_of_stay_received")
    ) {
      obtainProofOfStayModalRef.current.destroy();
      obtainProofOfStayModalRef.current = null;
    }
  }, [reservation, reservationState, t]);

  const displayHotel = () => {
    return (
      <div>
        <div>
          <div className="reservation-field-label">
            {hotel ? "Hotel" : "Hotel ID"}
          </div>
          <div className="reservation-field-value">{hotel}</div>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    return (
      <div className="reservation-buttons">
        {reservation.speedy_check_in && renderObtainCredentialButton()}
        {reservation.speedy_check_in && renderSendDocumentationButton()}
        {reservation.speedy_check_in && renderCheckInButton()}
        {reservation.speedy_check_in && renderObtainProofOfStayButton()}
        {renderDeleteButton()}
      </div>
    );
  };

  const renderObtainCredentialButton = () => {
    const displayStates = [
      t("state.created"),
      t("state.issuing_credential"),
      t("state.waiting_credential_acceptance"),
    ];

    if (displayStates.includes(reservationState)) {
      return (
        <Button
          type="primary"
          size="small"
          shape="round"
          disabled={taskInProgress}
          onClick={onObtainCredential}
          block
        >
          {t("button.obtain_credential")}
        </Button>
      );
    }
  };

  const onObtainCredential = () => {
    if (!obtainCredentialModalRef.current) {
      obtainCredentialModalRef.current = Modal.info({
        icon: <></>,
        width: 380,
        okType: "default",
        wrapClassName: "reservation-modal",
        content: (
          <RequestCredential
            reservationId={reservation.id}
            cloudFunction={"reservationCredentialRequest"}
          />
        ),
        onOk() {
          if (obtainCredentialModalRef.current) {
            obtainCredentialModalRef.current = null;
          }
        },
        okText: t("button.dismiss"),
      });
    }
  };

  const renderSendDocumentationButton = () => {
    const displayStates = [
      t("state.waiting_documentation"),
      t("state.waiting_proof_acceptance"),
    ];

    if (displayStates.includes(reservationState)) {
      return (
        <Button
          type="primary"
          size="small"
          shape="round"
          disabled={taskInProgress}
          onClick={onSendDocumentation}
          block
        >
          {t("button.request_proof")}
        </Button>
      );
    }
  };

  const onSendDocumentation = () => {
    if (!requestProofModalRef.current) {
      requestProofModalRef.current = Modal.info({
        icon: <></>,
        width: 380,
        okType: "default",
        wrapClassName: "reservation-modal",
        content: <RequestReservationProof reservationId={reservation.id} />,
        onOk() {
          if (requestProofModalRef.current) {
            requestProofModalRef.current = null;
          }
        },
        okText: t("button.dismiss"),
      });
    }
  };

  const renderCheckInButton = () => {
    const displayStates = [t("state.ready")];

    if (!reservation.checked_in && displayStates.includes(reservationState)) {
      return (
        <Button
          size="small"
          type="primary"
          shape="round"
          disabled={taskInProgress}
          onClick={onCheckIn}
          block
        >
          {t(
            reservation.checked_in
              ? "check_in_states.checked_in"
              : "button.check_in",
          )}
        </Button>
      );
    }
  };

  const onCheckIn = () => {
    const link = window.location.href.replace("/reservation/", "/proof/");
    Modal.info({
      title: t("modal.check_in.title", { reservation: reservation.id }),
      icon: <></>,
      width: 410,
      okType: "default",
      okText: t("button.dismiss"),
      style: { textAlign: "center" },
      content: (
        <center>
          <div style={{ paddingTop: "15px" }}>
            <Text strong={true}>{t("modal.check_in.body.qr_link")}</Text>
          </div>
          <div>
            <QRCodeSVG size="250" value={`${link}/`} />
          </div>
          <div style={{ paddingTop: "15px" }}>
            <Text strong={true}>{t("modal.check_in.body.manual_link")}</Text>
          </div>
          <div>
            <Text style={{ fontSize: "15px" }}>{link}</Text>
          </div>
          <div style={{ paddingTop: "15px", marginBottom: "6px" }}>
            <Text strong={true}>{t("modal.check_in.body.passcode")}</Text>
          </div>
          <div>
            <Tag
              style={{
                fontSize: "18px",
                padding: "6px",
                marginLeft: "6px",
                marginRight: "6px",
              }}
            >
              {reservation.words[0]}
            </Tag>
            <Tag
              style={{
                fontSize: "18px",
                padding: "6px",
                marginLeft: "6px",
                marginRight: "6px",
              }}
            >
              {reservation.words[1]}
            </Tag>
            <Tag
              style={{
                fontSize: "18px",
                padding: "6px",
                marginLeft: "6px",
                marginRight: "6px",
              }}
            >
              {reservation.words[2]}
            </Tag>
          </div>
        </center>
      ),
      onOk() {},
    });
  };

  const renderDeleteButton = () => {
    return (
      <Button
        size="small"
        shape="round"
        disabled={taskInProgress}
        onClick={onDelete}
        block
      >
        {t("button.delete")}
      </Button>
    );
  };

  const onDelete = () => {
    Modal.confirm({
      title: t("modal.delete_reservation.title"),
      icon: <ExclamationCircleOutlined />,
      content: t("modal.delete_reservation.body"),
      onOk() {
        setTaskInProgress(true);
        firestore.doc.delete(
          "reservation",
          reservation.id,
          () => {
            notifications.reservation.delete(reservation.id, 1, () => {
              window.location = "/reservations";
            });
          },
          (error) => {
            dbError(error);
            setTaskInProgress(false);
          },
        );
      },
      onCancel() {},
    });
  };

  const renderObtainProofOfStayButton = () => {
    const displayStates = [t("state.proof_of_stay_available")];

    if (reservation.checked_in && displayStates.includes(reservationState)) {
      return (
        <Button
          size="small"
          type="primary"
          shape="round"
          disabled={taskInProgress}
          onClick={onObtainProofOfStayCredential}
          block
        >
          {t("button.obtain_proof_of_stay")}
        </Button>
      );
    }
  };

  const onObtainProofOfStayCredential = () => {
    if (!obtainProofOfStayModalRef.current) {
      obtainProofOfStayModalRef.current = Modal.info({
        icon: <></>,
        width: 380,
        okType: "default",
        wrapClassName: "reservation-modal",
        content: (
          <RequestCredential
            reservationId={reservation.id}
            cloudFunction={"reservationProofOfStayCredentialRequest"}
          />
        ),
        onOk() {
          if (obtainProofOfStayModalRef.current) {
            obtainProofOfStayModalRef.current = null;
          }
        },
        okText: t("button.dismiss"),
      });
    }
  };

  return (
    <div className={`panel ${className}`} style={{ paddingTop: "20px" }}>
      <h3>{t("section.reservation.title")}</h3>
      <h2 display="none"></h2>
      {displayFields(reservation, {
        id: "reservation_field.reservation_number",
        email: "reservation_field.email",
      })}
      {combineFields(
        reservation,
        ", ",
        ["last_name", "first_name"],
        "proof_field.full_name",
      )}
      {combineFields(
        reservation,
        " - ",
        ["check_in_date", "check_out_date"],
        "proof_field.dates",
      )}
      {displayHotel()}
      {renderActions()}
    </div>
  );
};

export default ReservationDataPanel;
