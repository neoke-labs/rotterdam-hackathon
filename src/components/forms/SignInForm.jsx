import { Form, Input, Button } from "antd";
import { useState } from "react";
import { t } from "i18next";
import { hash } from "../../util/crypto";
import { firestore } from "../../util/firebase";
const { dbError } = firestore;
const { getAccountByEmail } = firestore.helpers;
import notifications from "util/notifications";

function SignInForm({ callback, isAdmin }) {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);

    if (isAdmin(values.email, values.password)) {
      callback("admin", values.email);
    } else {
      const password = hash(values.password);
      getAccountByEmail(
        values.email,
        (snapshot) => {
          setLoading(false);
          if (snapshot.empty || snapshot.docs[0].data().password != password) {
            notifications.account.invalid();
          } else {
            callback(
              snapshot.docs[0].data().hotel ? "hotel" : "user",
              values.email,
            );
          }
        },
        (error) => {
          setLoading(false);
          dbError(error);
        },
      );
    }
  };

  return (
    <Form
      {...{
        layout: "vertical",
      }}
      name="sign-in"
      onFinish={onFinish}
    >
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
      <Form.Item {...{}}>
        <Button
          type="primary"
          htmlType="submit"
          shape="round"
          block
          loading={loading}
        >
          {t("form.sign_in.button")}{" "}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default SignInForm;
