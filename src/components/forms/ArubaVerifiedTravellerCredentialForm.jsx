import { useContext, useEffect } from "react";
import NeoKeContext from "context";
import moment from "moment";

import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Result, Modal } from "antd";
import { httpsCallable } from "firebase/functions";
import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { firestore, functions } from "../../util/firebase";
import AuthControl from "components/controls/AuthControl";
const { dbError } = firestore;

function ArubaVerifiedTravellerCredentialForm({ setComplete, header }) {
  const { handleWebsiteMode, handleSignOut } = useContext(NeoKeContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState(undefined);
  const [mail, setMail] = useState(undefined);
  const formRef = useRef();
  const modalRef = useRef(null);

  const dispatcher = httpsCallable(functions, "dispatcher");

  const isAgency = window.location.pathname == "/agency";

  useEffect(() => {
    if (data !== undefined) {
      modalRef.current.destroy();
      setAuthenticated(true);
    }
  }, [data]);

  useEffect(() => {
    if (!authenticated) {
      const modal = Modal.info({
        icon: <></>,
        destroyOnClose: true,
        width: 380,
        okType: "default",
        wrapClassName: "auth-modal",
        content: (
          <AuthControl
            title={t("panel.auth.title.aruba")}
            dispatch="requestPassportProof"
            handleProof={(data) => setData(data)}
          />
        ),
        okText: t("button.dismiss"),
        onOk() {
          handleWebsiteMode(undefined);
          handleSignOut("/");
        },
      });
      modalRef.current = modal;
    }
  }, [authenticated, t, handleSignOut, handleWebsiteMode]);

  useEffect(() => {
    if (data !== undefined) {
      modalRef.current.destroy();
      setAuthenticated(true);
      formRef.current.setFieldsValue({
        first_name: data.firstName,
        last_name: data.lastName,
        date_of_birth: moment(data.dateOfBirth),
        passport_number: data.passportNumber,
        passport_country: data.passportCountry,
        passport_expiry_date: moment(data.passportExpiryDate),
      });
    }
  }, [data]);

  const onFinish = async (values) => {
    setLoading(true);

    let result = { ...values };
    result.date_of_birth = result.date_of_birth.format("YYYY/MM/DD");
    result.passport_expiry_date =
      result.passport_expiry_date.format("YYYY/MM/DD");

    result.selfie = data.selfie;
    result.agency = isAgency;

    result.dispatch = "createArubaVerifiedTravellerCredentialCache";
    dispatcher(result)
      .then(() => {
        setLoading(false);
        setMail(result.email);
        setRequested(true);
        setComplete(true);
      })
      .catch((error) => {
        dbError(error);
        setLoading(false);
      });
  };

  const renderFormItems = () => {
    return (
      <>
        <Form.Item
          name="first_name"
          label={t("form.generic.field.first_name")}
          rules={[
            {
              required: true,
              message: t(
                "form.arubaVerifiedTravellerCredential.field.validation.first_name",
              ),
            },
          ]}
        >
          <Input
            disabled={true}
            placeholder={t(
              "form.arubaVerifiedTravellerCredential.field.placeholder.first_name",
            )}
          />
        </Form.Item>
        <Form.Item
          name="last_name"
          label={t("form.generic.field.last_name")}
          rules={[
            {
              required: true,
              message: t(
                "form.arubaVerifiedTravellerCredential.field.validation.last_name",
              ),
            },
          ]}
        >
          <Input
            disabled={true}
            placeholder={t(
              "form.arubaVerifiedTravellerCredential.field.placeholder.last_name",
            )}
          />
        </Form.Item>
        <Form.Item
          name="date_of_birth"
          label={t("form.generic.field.date_of_birth")}
          rules={[
            {
              required: true,
              message: t("form.generic.field.validation.date_of_birth"),
            },
          ]}
        >
          <DatePicker disabled={true} />
        </Form.Item>
        <Form.Item
          name="passport_number"
          label={t("form.generic.field.passport_number")}
          rules={[
            {
              required: true,
              message: t(
                "form.arubaVerifiedTravellerCredential.field.validation.passport_number",
              ),
            },
          ]}
        >
          <Input
            disabled={true}
            placeholder={t(
              "form.arubaVerifiedTravellerCredential.field.placeholder.passport_number",
            )}
          />
        </Form.Item>
        <Form.Item
          name="passport_country"
          label={t("form.generic.field.passport_country")}
          rules={[
            {
              required: true,
              message: t(
                "form.arubaVerifiedTravellerCredential.field.validation.passport_country",
              ),
            },
          ]}
        >
          <Input
            disabled={true}
            placeholder={t(
              "form.arubaVerifiedTravellerCredential.field.placeholder.passport_country",
            )}
          />
        </Form.Item>
        <Form.Item
          name="passport_expiry_date"
          label={t("form.generic.field.passport_expiry_date")}
          rules={[
            {
              required: true,
              message: t("form.generic.field.validation.passport_expiry_date"),
            },
          ]}
        >
          <DatePicker disabled={true} />
        </Form.Item>
        <Form.Item
          name="email"
          label={t("form.generic.field.email")}
          rules={[
            {
              type: "email",
              message: t("form.generic.field.validation.valid_email"),
            },
            {
              required: true,
              message: t(
                "form.arubaVerifiedTravellerCredential.field.validation.email",
              ),
            },
          ]}
        >
          <Input
            placeholder={t(
              "form.arubaVerifiedTravellerCredential.field.placeholder.email",
            )}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: "0px" }} {...{}}>
          <Button
            type="primary"
            shape="round"
            htmlType="submit"
            className="last"
            loading={loading}
            block
          >
            {t(
              `form.arubaVerifiedTravellerCredential.button.${
                isAgency ? "agency" : "user"
              }`,
            )}
          </Button>
        </Form.Item>
      </>
    );
  };

  const renderForm = () => {
    return (
      <Form
        {...{
          layout: "vertical",
        }}
        ref={formRef}
        name="reserve"
        onFinish={onFinish}
        initialValues={
          data
            ? {
                first_name: data.firstName,
                last_name: data.lastName,
                date_of_birth: moment(data.dateOfBirth),
                passport_number: data.passportNumber,
                passport_country: data.passportCountry,
                passport_expiry_date: moment(data.passportExpiryDate),
              }
            : {}
        }
      >
        {renderFormItems()}
      </Form>
    );
  };

  const renderInfo = () => {
    return (
      <div className="aruba-verified-traveller-credential-result">
        <Result
          status="success"
          icon={<CheckCircleOutlined />}
          title={t("form.arubaVerifiedTravellerCredential.result.title")}
          subTitle={
            <Trans i18nKey="form.arubaVerifiedTravellerCredential.result.description">
              &nbsp;<p></p>&nbsp;<b>{{ mail }}</b>&nbsp;
            </Trans>
          }
          extra={
            isAgency
              ? [
                  <Button
                    type="primary"
                    key="go"
                    onClick={() => {
                      window.location = "/";
                    }}
                  >
                    Go home
                  </Button>,
                  <Button key="create" onClick={() => window.location.reload()}>
                    Create a new credential
                  </Button>,
                ]
              : [
                  <Button
                    type="primary"
                    key="go"
                    onClick={() => handleWebsiteMode("user")}
                  >
                    Continue with your reservation
                  </Button>,
                ]
          }
        />
      </div>
    );
  };

  const renderContent = () => {
    if (!requested) {
      return renderForm();
    }

    return renderInfo();
  };

  return (
    <>
      <h2 display={header ? "block" : "none"}>{header}</h2>
      {renderContent()}
    </>
  );
}

export default ArubaVerifiedTravellerCredentialForm;
