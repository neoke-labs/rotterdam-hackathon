import { useContext } from "react";
import NeoKeContext from "context";
import { Form, Input, Button } from "antd";
import { t } from "i18next";
import { dictionary } from "util/dictionary";

function SearchByPasscodeForm({ callback }) {
  const { reservations } = useContext(NeoKeContext);

  const onFinish = (values) => {
    const array = JSON.stringify([
      values.first_word.toLowerCase().trim(),
      values.second_word.toLowerCase().trim(),
      values.third_word.toLowerCase().trim(),
    ]);
    callback(
      reservations.find((entry) => JSON.stringify(entry.words) == array)?.id,
    );
  };

  const validateDictionaryWord = () => ({
    validator(_, value) {
      if (!value || dictionary.indexOf(value.trim().toLowerCase()) != -1) {
        return Promise.resolve();
      }

      return Promise.reject(
        new Error(t("form.generic.field.validation.invalid_dictionary_word")),
      );
    },
  });

  return (
    <Form
      {...{
        layout: "vertical",
      }}
      name="sign-in"
      onFinish={onFinish}
    >
      <Form.Item
        name="first_word"
        label={t("form.generic.field.first_word")}
        rules={[
          {
            required: true,
            message: t("form.generic.field.validation.required_word"),
          },
          validateDictionaryWord,
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="second_word"
        label={t("form.generic.field.second_word")}
        rules={[
          {
            required: true,
            message: t("form.generic.field.validation.required_word"),
          },
          validateDictionaryWord,
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="third_word"
        label={t("form.generic.field.third_word")}
        rules={[
          {
            required: true,
            message: t("form.generic.field.validation.required_word"),
          },
          validateDictionaryWord,
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item {...{}}>
        <Button type="primary" htmlType="submit" shape="round" block>
          {t("form.search_by_passcode.button")}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default SearchByPasscodeForm;
