import { Tag } from "antd";
import { t } from "i18next";

const displayFields = (object, values) => {
  return Object.keys(values).map((key) => {
    return displayField(key, object, values[key]);
  });
};

const displayField = (key, object, label) => {
  const value = object[key];
  if (value) {
    return (
      <div key={key}>
        <div>
          <div className="reservation-field-label">{t(label)}</div>
          <div className="reservation-field-value">{value}</div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

const displayStateValue = (label, state) => {
  return (
    <div>
      <div className="reservation-field-label">{t(label)}</div>
      <div className="reservation-field-value">
        <Tag color={state ? "green" : "red"}>
          {t(
            state
              ? "panel.reservation.state.yes"
              : "panel.reservation.state.no",
          )}
        </Tag>
      </div>
    </div>
  );
};

const combineFields = (object, separator, keys, label) => {
  const value = keys.map((key) => object[key]).join(separator);
  return (
    <div key={label}>
      <div>
        <div className="reservation-field-label">{t(label)}</div>
        <div className="reservation-field-value">{value}</div>
      </div>
    </div>
  );
};

export { displayField, displayStateValue, displayFields, combineFields };
