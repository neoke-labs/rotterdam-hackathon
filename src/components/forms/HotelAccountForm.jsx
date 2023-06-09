import { Form, Input, Button, Checkbox } from "antd";
import { useState, useRef, useEffect } from "react";
import { t } from "i18next";
import { firestore } from "../../util/firebase";
const { dbError } = firestore;
import notifications from "util/notifications";

function HotelAccountForm({ docRef, email, receive_notifications }) {
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState(false);
  const formRef = useRef();

  useEffect(() => {
    formRef.current?.resetFields();
  }, []);

  const onFinish = () => {
    setLoading(true);

    firestore.doc.update(
      "account",
      docRef,
      { notifications: !receive_notifications },
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
      name="hotel"
      onFinish={onFinish}
      initialValues={{
        email,
        hotel_id: docRef,
        notifications: receive_notifications,
      }}
    >
      <Form.Item name="hotel_id" label={t("form.generic.field.hotel_id")}>
        <Input disabled />
      </Form.Item>
      <Form.Item name="email" label={t("form.generic.field.email")}>
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
          shape="round"
          htmlType="submit"
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

export default HotelAccountForm;
