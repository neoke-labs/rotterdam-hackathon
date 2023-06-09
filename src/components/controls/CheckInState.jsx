import { useContext } from "react";
import NeoKeContext from "context";
import { t } from "i18next";
import { Button } from "antd";
import { firestore } from "util/firebase";

function CheckInState({ reservation }) {
  const { env } = useContext(NeoKeContext);
  const date_check_in = new Date(reservation.check_in_date);
  const date_check_out = new Date(reservation.check_out_date);
  var date_full_today = new Date();
  date_full_today.setDate(date_full_today.getDate() + parseInt(env.DELTA_DAYS));
  const date_today = new Date(date_full_today.toDateString());

  const onCheckInClick = () => {
    firestore.doc.update(
      "reservation",
      reservation.id,
      { checked_in: true },
      () => {},
    );
  };

  if (reservation.checked_in) {
    return <h3>{t("check_in_states.arrived")}</h3>;
  } else {
    if (date_check_out < date_today) {
      return <h3>{t("check_in_states.no_show")}</h3>;
    }

    if (date_check_in > date_today) {
      let days = Math.ceil((date_check_in - date_today) / (1000 * 3600 * 24));
      return (
        <h3>
          {t("check_in_states.check_in_available_when", {
            when:
              days == 1
                ? t("check_in_states.tomorrow")
                : t("check_in_states.in_n_days", { n: days }),
          })}
        </h3>
      );
    }

    let check_in_hour = new Date(date_full_today);
    let tokens = env.CHECK_IN_HOUR.split(":");
    check_in_hour.setHours(parseInt(tokens[0]));
    check_in_hour.setMinutes(parseInt(tokens[1]));
    if (date_full_today >= check_in_hour) {
      return (
        <div>
          <Button onClick={onCheckInClick} shape="round" type="primary">
            {t("check_in_states.button")}
          </Button>
        </div>
      );
    }

    return (
      <h3>
        {t("check_in_states.check_in_available_when", {
          when: t("check_in_states.today"),
        })}
      </h3>
    );
  }
}

export default CheckInState;
