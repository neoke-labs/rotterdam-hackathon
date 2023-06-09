import { Row } from "antd";

import RequestCredential from "components/controls/RequestCredential";
import RequestReservationProof from "components/controls/RequestReservationProof";

import { getSearchParameters } from "util/parameters";

function SelfServicePanel() {
  const parameters = getSearchParameters();

  const renderControl = () => {
    switch (parameters.type) {
      case "aruba-verified-traveller-credential":
        return (
          <RequestCredential
            selfService={true}
            arubaVerifiedTravellerCredentialId={
              parameters?.arubaVerifiedTravellerCredentialId
            }
            cloudFunction={"arubaVerifiedTravellerCredentialRequest"}
          />
        );

      case "reservation-credential":
        return (
          <RequestCredential
            selfService={true}
            reservationId={parameters?.reservationId}
            cloudFunction={"reservationCredentialRequest"}
          />
        );

      case "reservation-proof":
        return (
          <RequestReservationProof
            selfService={true}
            reservationId={parameters?.reservationId}
          />
        );

      case "proof-of-stay":
        return (
          <RequestCredential
            selfService={true}
            reservationId={parameters?.reservationId}
            cloudFunction={"reservationProofOfStayCredentialRequest"}
          />
        );
    }

    return <h2>Invalid request</h2>;
  };

  return (
    <Row justify="space-around" align="middle">
      <div className="panel self-service-panel ant-col-lg-11 ant-col-md-16 ant-col-sm-22 ant-col-xs-24">
        {renderControl()}
      </div>
    </Row>
  );
}

export default SelfServicePanel;
