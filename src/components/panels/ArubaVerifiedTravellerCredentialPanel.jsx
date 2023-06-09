import { useState } from "react";

import ArubaVerifiedTravellerCredentialForm from "components/forms/ArubaVerifiedTravellerCredentialForm";

import { t } from "i18next";
import { Row, Col, Button } from "antd";

function ArubaVerifiedTravellerCredentialPanel() {
  const [complete, setComplete] = useState(false);
  const [displayForm, setDisplayForm] = useState(false);

  if (displayForm) {
    return (
      <Row justify="space-around" align="middle">
        <div className="panel ant-col-lg-10 ant-col-md-16 ant-col-sm-22 ant-col-xs-24">
          {complete ? (
            <></>
          ) : (
            <>
              <h1>
                {t(
                  `section.arubaVerifiedTravellerCredential.title.${
                    window.location.pathname == "/agency" ? "agency" : "user"
                  }`,
                )}
              </h1>
              <h2>{t("section.arubaVerifiedTravellerCredential.subtitle")}</h2>
            </>
          )}
          <ArubaVerifiedTravellerCredentialForm
            setComplete={setComplete}
            header=""
          />
        </div>
      </Row>
    );
  }

  return (
    <Row justify="space-around" align="middle">
      <div className="aruba-info ant-col-lg-10 ant-col-md-16 ant-col-sm-22 ant-col-xs-24">
        <h1>Bonbini! Welcome to Aruba</h1>
        <p>
          Hello friends! The people of Aruba are very happy to be welcoming
          travelers to our One Happy Island once again.
        </p>
        <p>
          In an effort to facilitate your travels to Aruba, the Aruban
          Immigration Authority offers your first welcome or, “bonbini”, in the
          form of Aruba's online Embarkation and Disembarkation (ED) program.
        </p>
        <Row justify="space-around" align="middle" className="buttons">
          <Col xs={22} sm={11}>
            <Button type="primary" block>
              Continue as resident
            </Button>
          </Col>
          <Col xs={22} sm={11}>
            <Button type="primary" block onClick={() => setDisplayForm(true)}>
              Continue as non-resident
            </Button>
          </Col>
        </Row>
        <p>
          In accordance with the State Decree of Admittance AB 2009 no. 59, the
          online ED card is mandatory for all travelers to Aruba. All
          non-resident travelers, including visa required countries, are
          required to obtain an online travel qualification using this system
          prior to being granted permission for boarding.
        </p>
        <p>
          If you have been qualified to travel to Aruba, it establishes that you
          are eligible to board an inbound plane to Aruba, but does not exempt
          you from COVID-19 screening and testing nor establish that you are
          admissible to Aruba. Upon arrival to Aruba, the respective authorities
          have the prerogative to screen and test you for COVID-19 as well as
          interview you in order to determine if you are freely admissible to
          Aruba under the Immigration laws and applicable health rules and
          regulations. All information provided by you, or in the case you act
          as a legal guardian, must be true and correct.
        </p>
        <p>
          You may be subject to penalties if you knowingly and willfully make a
          materially false, fictitious, or fraudulent statement or
          representation in an online travel qualification application submitted
          by you or as legal guardian.
        </p>
        <p>There are two possible responses to your online application:</p>
        <ul>
          <li>
            Qualified: You are qualified to travel to Aruba. The system displays
            confirmation of the application approval, which you will receive by
            email.
          </li>
          <li>Denied: You are not qualified to travel to Aruba.</li>
        </ul>
        <p>
          Note that reapplying with false information in order to qualify for a
          travel is subject to penalties and may be in violation of our criminal
          code.
        </p>
      </div>
    </Row>
  );
}

export default ArubaVerifiedTravellerCredentialPanel;
