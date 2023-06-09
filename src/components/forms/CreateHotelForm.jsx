import { useRef, useState, useContext } from "react";
import NeoKeContext from "context";
import { UploadOutlined } from "@ant-design/icons";
import { file2Base64 } from "@pankod/refine-core";
import { Button, Form, Input, Upload, Switch, InputNumber } from "antd";
import { httpsCallable } from "firebase/functions";
import { useTranslation } from "react-i18next";
import Resizer from "react-image-file-resizer";
import { firestore, functions } from "../../util/firebase";
const { dbError } = firestore;

function CreateHotelForm({ header }) {
  const { account, hotels } = useContext(NeoKeContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const formRef = useRef();

  const dispatcher = httpsCallable(functions, "dispatcher");

  const resizeImage = (image, extension) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        image,
        160,
        120,
        extension,
        100,
        0,
        (uri) => {
          resolve(uri);
        },
        "base64",
      );
    });

  let names = new Set();
  hotels.forEach((hotel) => names.add(hotel.name));

  const onFinish = async (values) => {
    setLoading(true);

    let result = { ...values };

    result.account = account.docRef;

    let image = result.image[0];
    const mime_type = image.type;
    const extension = mime_type.split("/")[1].toUpperCase();
    image = await file2Base64(image);
    result.image = await resizeImage(result.image[0].originFileObj, extension);

    if (undefined == result.speedy_check_in) {
      result.speedy_check_in = true;
    }

    setLoading(false);
    result.dispatch = "createHotel";
    dispatcher(result)
      .then((result) => {
        setLoading(false);
        window.location = `/hotel/${result.data.id}`;
      })
      .catch((error) => {
        dbError(error);
        setLoading(false);
      });
  };

  const validateValidName = () => ({
    validator(_, value) {
      if (!value || !names.has(value.trim())) {
        return Promise.resolve();
      }

      return Promise.reject(
        new Error(t("form.generic.field.validation.name_in_use")),
      );
    },
  });

  const renderForm = () => {
    const normFile = (e) => {
      if (Array.isArray(e)) {
        return e;
      }

      return e?.fileList;
    };

    return (
      <Form
        {...{
          layout: "vertical",
        }}
        ref={formRef}
        name="createHotel"
        onFinish={onFinish}
        initialValues={{ price: 100 }}
      >
        <Form.Item
          name="name"
          label={t("form.generic.field.hotel_name")}
          rules={[
            {
              required: true,
              message: t("form.generic.field.validation.hotel_name"),
            },
            validateValidName,
          ]}
        >
          <Input placeholder={t("form.generic.field.placeholder.hotel_name")} />
        </Form.Item>
        <Form.Item
          name="city"
          label={t("form.generic.field.city")}
          rules={[
            {
              required: true,
              message: t("form.generic.field.validation.city"),
            },
          ]}
        >
          <Input placeholder={t("form.generic.field.placeholder.city")} />
        </Form.Item>
        <Form.Item
          name="address"
          label={t("form.generic.field.address")}
          rules={[
            {
              required: true,
              message: t("form.generic.field.validation.address"),
            },
          ]}
        >
          <Input placeholder={t("form.generic.field.placeholder.address")} />
        </Form.Item>
        <Form.Item
          name="slogan"
          label={t("form.generic.field.slogan")}
          rules={[
            {
              required: true,
              message: t("form.generic.field.validation.slogan"),
            },
          ]}
        >
          <Input placeholder={t("form.generic.field.placeholder.slogan")} />
        </Form.Item>
        <Form.Item
          name="description"
          label={t("form.generic.field.description")}
          rules={[
            {
              required: true,
              message: t("form.generic.field.validation.description"),
            },
          ]}
        >
          <Input
            placeholder={t("form.generic.field.placeholder.description")}
          />
        </Form.Item>
        <Form.Item name="price" label={t("form.generic.field.price")}>
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          name="image"
          label={t("form.generic.field.image")}
          valuePropName="fileList"
          getValueFromEvent={normFile}
          style={{ width: "100%" }}
          rules={[
            {
              required: true,
              message: t("form.generic.field.validation.image"),
            },
          ]}
        >
          <Upload
            name="image"
            beforeUpload={() => false}
            accept="image/png, image/jpeg, image/jpg"
            listType="picture"
          >
            <Button icon={<UploadOutlined />} block>
              {t("form.generic.button.click_to_upload")}
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item
          valuePropName="checked"
          name="speedy_check_in"
          label={t("form.generic.field.speedy_check_in")}
        >
          <Switch defaultChecked />
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
            {t("form.generic.button.create_hotel")}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <>
      <h2 display={header ? "block" : "none"}>{header}</h2>
      {renderForm()}
    </>
  );
}

export default CreateHotelForm;
