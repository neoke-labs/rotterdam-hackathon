import SelfServicePanel from "components/panels/SelfServicePanel";

import PortalLogo from "../../images/logo.png";

const SelfService = () => {
  return (
    <div className="container self-service-container ant-col-24">
      <img src={PortalLogo} alt="Logo" className={"neoke-logo"} />
      <SelfServicePanel />
    </div>
  );
};

export default SelfService;
