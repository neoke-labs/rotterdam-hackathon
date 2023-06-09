import { Form, Input, Button, Checkbox } from "antd";
import { useState } from "react";
import { t } from "i18next";
import { hash } from "../../util/crypto";
import { firestore, functions } from "../../util/firebase";
const { dbError } = firestore;
import { httpsCallable } from "firebase/functions";
import notifications from "util/notifications";

const formLayout = {
  layout: "vertical",
};

const formTailLayout = {};

function SignUpForm({ callback }) {
  const [loading, setLoading] = useState(false);
  const dispatcher = httpsCallable(functions, "dispatcher");

  const onFinish = (values) => {
    setLoading(true);

    delete values["confirm"];
    values.password = hash(values.password);
    values.hotel = true;

    if (!values.notifications) {
      values.notifications = false;
    }

    values.dispatch = "createAccount";
    dispatcher(values)
      .then(() => {
        setLoading(false);
        callback("hotel", values.email);
      })
      .catch((error) => {
        setLoading(false);
        if ("functions/invalid-argument" == error.code) {
          notifications.account.invalid_email();
        } else {
          dbError(error);
        }
      });
  };

  return (
    <Form {...formLayout} name="sign-up" onFinish={onFinish}>
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
            message: t("form.generic.field.validation.email"),
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="password"
        label={t("form.generic.field.password")}
        rules={[
          {
            required: true,
            message: t("form.generic.field.validation.password"),
          },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="confirm"
        label={t("form.sign_up.field.confirm_password")}
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: t("form.sign_up.field.validation.confirm_password"),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }

              return Promise.reject(
                new Error(
                  t("form.sign_up.field.validation.different_passwords"),
                ),
              );
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item name="notifications" valuePropName="checked">
        <Checkbox>
          {t("form.generic.field.receive_email_notifications")}
        </Checkbox>
      </Form.Item>
      <Form.Item {...formTailLayout}>
        <Button
          type="primary"
          htmlType="submit"
          shape="round"
          block
          loading={loading}
        >
          {t("form.sign_up.button")}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default SignUpForm;
