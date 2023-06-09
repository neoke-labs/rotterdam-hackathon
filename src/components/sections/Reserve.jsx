import { useContext } from "react";
import NeoKeContext from "context";

import ReservePanel from "components/panels/ReservePanel";
import { Row } from "antd";

const Reserve = () => {
  const { account } = useContext(NeoKeContext);
  if (account?.email) {
    return (
      <div className="container reserve-container ant-col-24">
        <Row justify="space-evenly" align="top">
          <ReservePanel />
        </Row>
      </div>
    );
  } else {
    return null;
  }
};

export default Reserve;
