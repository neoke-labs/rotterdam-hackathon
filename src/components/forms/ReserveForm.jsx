import { useParams } from "react-router-dom";

import { useState, useRef, useContext } from "react";
import NeoKeContext from "context";
import { httpsCallable } from "firebase/functions";
import { functions, firestore } from "../../util/firebase";
const { dbError } = firestore;
import { Form, Input, Button, Switch } from "antd";
import { t } from "i18next";
import HotelDataPanel from "components/panels/HotelDataPanel";

function ReserveForm() {
  const { hotels, account } = useContext(NeoKeContext);
  const [loading, setLoading] = useState(false);
  const formRef = useRef();

  const { hotelId, checkInDate, checkOutDate } = useParams();
  const hotel = hotels.find((hotel) => hotel.id == hotelId);
  const dispatcher = httpsCallable(functions, "dispatcher");

  const onFinish = (values) => {
    setLoading(true);

    let result = { ...values };
    result.check_in_date = checkInDate.replaceAll("_", "/");
    result.check_out_date = checkOutDate.replaceAll("_", "/");
    result.account = account.docRef;
    result.hotel_id = hotelId;
    result.hotel_owner_id = hotel.account;
    if (hotel.speedy_check_in) {
      if (undefined == result.speedy_check_in) {
        result.speedy_check_in = true;
      }
    }

    result.dispatch = "reserveRoom";
    dispatcher(result)
      .then((result) => {
        setLoading(false);
        window.location = `/reservation/${result.data.id}`;
      })
      .catch((error) => {
        dbError(error);
        setLoading(false);
      });
  };

  let hasDays = undefined;
  if (checkInDate && checkOutDate) {
    try {
      const date_check_in = new Date(checkInDate.replaceAll("_", "/"));
      const date_check_out = new Date(checkOutDate.replaceAll("_", "/"));
      hasDays = Math.ceil(
        (date_check_out - date_check_in) / (1000 * 3600 * 24),
      );
    } catch {
      // Nothing to do
    }
  }

  const renderForm = () => {
    return (
      <>
        {hotel && (
          <HotelDataPanel
            hotel={hotel}
            brief={true}
            hideButton={true}
            days={hasDays}
          />
        )}
        <Form
          {...{
            layout: "vertical",
          }}
          ref={formRef}
          name="reserve"
          onFinish={onFinish}
          initialValues={{
            first_name: account.firstName,
            last_name: account.lastName,
            email: account.email,
          }}
        >
          <Form.Item
            name="first_name"
            label={t("form.generic.field.first_name")}
            rules={[
              {
                required: true,
                message: t("form.generic.field.validation.first_name"),
              },
            ]}
          >
            <Input
              disabled={account.firstName && account.firstName != ""}
              placeholder={t("form.generic.field.placeholder.first_name")}
            />
          </Form.Item>
          <Form.Item
            name="last_name"
            label={t("form.generic.field.last_name")}
            rules={[
              {
                required: true,
                message: t("form.generic.field.validation.last_name"),
              },
            ]}
          >
            <Input
              disabled={account.lastName && account.lastName != ""}
              placeholder={t("form.generic.field.placeholder.last_name")}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label={t("form.generic.field.email")}
            rules={[
              {
                required: true,
                type: "email",
                message: t("form.generic.field.validation.email"),
              },
            ]}
          >
            <Input
              disabled={account.email != undefined}
              placeholder={t("form.generic.field.placeholder.email")}
            />
          </Form.Item>
          {hotel && hotel.speedy_check_in && (
            <div>
              <span className="speedy-check-in-switch">
                <Form.Item valuePropName="checked" name="speedy_check_in">
                  <Switch defaultChecked />
                </Form.Item>
              </span>
              <span className="speedy-check-in-info">
                <div className="speedy-check-in-label">
                  {t("form.reserve.speedy_check_in_label")}
                </div>
                <div className="speedy-check-in-description">
                  {t("form.reserve.speedy_check_in_description")}
                </div>
              </span>
            </div>
          )}
          <Form.Item {...{}}>
            <Button
              type="primary"
              shape="round"
              htmlType="submit"
              loading={loading}
              block
            >
              {t("form.reserve.button")}
            </Button>
          </Form.Item>
        </Form>
      </>
    );
  };

  return renderForm();
}

export default ReserveForm;
