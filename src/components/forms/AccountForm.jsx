import { Form, Input, Button, Checkbox } from "antd";
import { useState, useRef, useEffect } from "react";
import { t } from "i18next";
import { firestore } from "../../util/firebase";
const { dbError } = firestore;
import notifications from "util/notifications";

function AccountForm({
  docRef,
  email,
  first_name,
  last_name,
  receive_notifications,
}) {
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState(false);
  const formRef = useRef();

  useEffect(() => {
    formRef.current?.resetFields();
  }, [receive_notifications]);

  const onFinish = (values) => {
    setLoading(true);

    let update = {
      notifications: values.notifications,
    };

    firestore.doc.update(
      "account",
      docRef,
      update,
      () => {
        notifications.account.updated(email);
        setLoading(false);
        setChanges(false);
      },
      (error) => {
        dbError(error);
        setLoading(false);
        setChanges(true);
      },
    );
  };

  const checkChanges = () => {
    const new_receive_notifications =
      formRef.current.getFieldValue("notifications");

    if ((new_receive_notifications != receive_notifications) != changes) {
      setChanges(!changes);
    }
  };

  return (
    <Form
      {...{ layout: "vertical" }}
      ref={formRef}
      name="user"
      onFinish={onFinish}
      initialValues={{
        email,
        first_name,
        last_name,
        notifications: receive_notifications,
      }}
    >
      <Form.Item name="email" label={t("form.generic.field.email")}>
        <Input disabled />
      </Form.Item>
      <Form.Item name="first_name" label={t("form.generic.field.first_name")}>
        <Input disabled />
      </Form.Item>
      <Form.Item name="last_name" label={t("form.generic.field.last_name")}>
        <Input disabled />
      </Form.Item>
      <Form.Item name="notifications" valuePropName="checked">
        <Checkbox onChange={checkChanges}>
          {t("form.generic.field.receive_email_notifications")}
        </Checkbox>
      </Form.Item>
      <Form.Item {...{}}>
        <Button
          type="primary"
          htmlType="submit"
          shape="round"
          loading={loading}
          block
          disabled={!changes}
        >
          {t("form.account.button")}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default AccountForm;
