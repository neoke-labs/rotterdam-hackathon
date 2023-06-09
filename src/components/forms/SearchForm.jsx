import { useRef, useContext } from "react";
import NeoKeContext from "context";
import moment from "moment";
import { Form, Button, Select, DatePicker } from "antd";
const { Option } = Select;
const { RangePicker } = DatePicker;
import { t } from "i18next";

function SearchForm() {
  const { hotels } = useContext(NeoKeContext);
  const formRef = useRef();

  let cities = new Set();
  hotels.forEach((hotel) => cities.add(hotel.city));

  const onFinish = (values) => {
    let check_in_date = values.dates[0].format("YYYY_MM_DD");
    let check_out_date = values.dates[1].format("YYYY_MM_DD");
    window.location = `/search-result/${values.city}/${check_in_date}/${check_out_date}`;
  };

  const disabledDate = (current) => {
    return current < moment().startOf("day");
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
      >
        <Form.Item
          name="city"
          label={t("form.generic.field.destination")}
          rules={[
            {
              required: true,
              message: t("form.generic.field.validation.destination"),
            },
          ]}
        >
          <Select
            placeholder={t("form.generic.field.placeholder.destination")}
            allowClear
          >
            {Array.from(cities).map((city) => (
              <Option key={city} value={city}>
                {city}
              </Option>
            ))}
            ;
          </Select>
        </Form.Item>
        <Form.Item
          name="dates"
          label={t("form.generic.field.dates")}
          rules={[
            {
              required: true,
              message: t("form.generic.field.validation.dates"),
            },
          ]}
        >
          <RangePicker disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item {...{}}>
          <Button type="primary" shape="round" htmlType="submit" block>
            {t("form.search.button")}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return renderForm();
}

export default SearchForm;
