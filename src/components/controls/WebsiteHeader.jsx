import { useContext } from "react";
import NeoKeContext from "context";

import { Layout, Button } from "antd";
const { Header } = Layout;

import MenuItems from "components/menus/MenuItems";
import AccountMenu from "components/menus/AccountMenu";

import ArubaIcon from "../../images/aruba-icon.png";
import ArubaLogo from "../../images/aruba-logo.png";

const WebsiteHeader = () => {
  const { websiteMode } = useContext(NeoKeContext);

  if (websiteMode == "user" || websiteMode == "hotel") {
    return (
      <Header>
        <div className="left">
          <MenuItems />
        </div>
        <div className="center empty"></div>
        <div className="right">
          <AccountMenu endpoint={"/account"} adminEndpoint={"/admin"} />
        </div>
      </Header>
    );
  }

  if (websiteMode == "aruba") {
    return (
      <Header>
        <div className="left">
          <div className="logos">
            <img src={ArubaIcon} />
            <img src={ArubaLogo} />
          </div>
        </div>
        <div className="center empty"></div>
        <div className="right">
          <Button>Log in</Button>
        </div>
      </Header>
    );
  }

  return <></>;
};

export default WebsiteHeader;
