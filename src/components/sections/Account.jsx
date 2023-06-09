import { useContext } from "react";
import NeoKeContext from "context";
import { Row } from "antd";
import AccountDataPanel from "components/panels/AccountDataPanel";
import HotelAccountDataPanel from "components/panels/HotelAccountDataPanel";

function Account() {
  const { account, browserAccount } = useContext(NeoKeContext);
  const renderPanels = () => {
    if (browserAccount.isHotel == "true") {
      return (
        <HotelAccountDataPanel
          className={"ant-col-lg-11 ant-col-md-16 ant-col-sm-22 ant-col-xs-24"}
          docRef={account.docRef}
          email={account.email}
          name={account.name}
          receiveNotifications={account.notifications}
        />
      );
    } else {
      return (
        <AccountDataPanel
          className={"ant-col-lg-11 ant-col-md-16 ant-col-sm-22 ant-col-xs-24"}
          docRef={account.docRef}
          email={account.email}
          firstName={account.firstName}
          lastName={account.lastName}
          receiveNotifications={account.notifications}
        />
      );
    }
  };

  if (account?.email) {
    return (
      <div className="container account-container ant-col-24">
        <Row justify="space-evenly" align="middle">
          {renderPanels()}
        </Row>
      </div>
    );
  } else {
    return null;
  }
}

export default Account;
