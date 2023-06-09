import { useContext, useRef } from "react";
import NeoKeContext from "context";

import { Button, Form, Input } from "antd";

import { firestore } from "util/firebase";
import { t } from "i18next";

function AdminCheckinPanel({ className }) {
  const { env } = useContext(NeoKeContext);
  const formRef = useRef();

  const onFinish = (values) => {
    firestore.doc.update(
      "configuration",
      "env",
      { DELTA_DAYS: values.delta_days, CHECK_IN_HOUR: values.check_in_hour },
      () => {},
    );
  };

  const renderForm = () => {
    if (env?.DELTA_DAYS == undefined) {
      return <></>;
    }

    const { DELTA_DAYS, CHECK_IN_HOUR } = env;
    return (
      <>
        <Form
          {...{
            layout: "vertical",
          }}
          ref={formRef}
          name="check-in"
          onFinish={onFinish}
          initialValues={{
            delta_days: DELTA_DAYS,
            check_in_hour: CHECK_IN_HOUR,
          }}
        >
          <Form.Item
            name="delta_days"
            label={t("form.generic.field.delta_days")}
            rules={[
              {
                required: true,
                message: t("form.generic.field.validation.delta_days"),
              },
              () => ({
                validator(_, value) {
                  if (!value || Number.isInteger(Number(value))) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error(
                      t("form.generic.field.validation.required_integer_value"),
                    ),
                  );
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="check_in_hour"
            label={t("form.generic.field.check_in_hour")}
            rules={[
              {
                required: true,
                message: t("form.generic.field.validation.check_in_hour"),
              },
              () => ({
                validator(_, value) {
                  if (
                    !value ||
                    value.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error(
                      t("form.generic.field.validation.required_hour_value"),
                    ),
                  );
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item {...{}}>
            <Button type="primary" htmlType="submit" shape="round" block>
              {t("form.check_in.button")}
            </Button>
          </Form.Item>
        </Form>
      </>
    );
  };

  return (
    <span className={`panel ${className}`} style={{ paddingBottom: "16px" }}>
      <h2>{t("admin.checkin.title")}</h2>
      {renderForm()}
    </span>
  );
}

export default AdminCheckinPanel;
