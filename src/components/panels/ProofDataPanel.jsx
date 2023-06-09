import { Collapse } from "antd";
const { Panel } = Collapse;
import { t } from "i18next";
import NoProof from "../../images/no-proof-ota.svg";

import { displayFields, combineFields } from "../../util/fields";

const ProofDataPanel = ({ className, proof, reservation }) => {
  if (!Object.keys(proof).length) {
    return (
      <>
        <div>
          <div style={{ paddingTop: "10px" }}>
            <h4>{t("panel.no_proof.body")}</h4>
          </div>
          <div>
            <img src={NoProof} alt="No proof cover" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`panel ${className}`} style={{ paddingBottom: "20px" }}>
        <center>
          <img
            src={proof["Selfie_link"].base64}
            style={{
              width: "194px",
              height: "194px",
              objectFit: "cover",
              borderRadius: "240px",
              marginBottom: "20px",
            }}
          />
        </center>
        {displayFields(proof, {
          "Reservation Number": "proof_field.reservation_number",
        })}
        {displayFields(reservation, {
          email: "reservation_field.email",
        })}
        {combineFields(
          proof,
          ", ",
          ["Last Name", "First Name"],
          "proof_field.full_name",
        )}
        {combineFields(
          reservation,
          " - ",
          ["check_in_date", "check_out_date"],
          "proof_field.dates",
        )}
        <Collapse expandIconPosition="right" ghost>
          <Panel header="Read more" key="1">
            {displayFields(proof, {
              "Passport Number": "proof_field.passport_number",
              "Issuing Country": "proof_field.issuing_country",
              "Date of Birth": "proof_field.date_of_birth",
              "Expiry Date": "proof_field.expiry_date",
            })}
            <div style={{ marginBottom: "-25px" }}></div>
          </Panel>
        </Collapse>
      </div>
    </>
  );
};

export default ProofDataPanel;
