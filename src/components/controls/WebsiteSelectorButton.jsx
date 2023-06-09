import { useContext } from "react";
import NeoKeContext from "context";

import { Button, Tooltip, Modal } from "antd";

const { confirm } = Modal;

import { SelectOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

import { t } from "i18next";

const WebsiteSelectorButton = () => {
  const { browserAccount, handleWebsiteMode, handleSignOut } =
    useContext(NeoKeContext);
  return (
    <Tooltip title={t("notification.close_website.tooltip")} placement="left">
      <Button
        className={"website-selector-button"}
        shape="circle"
        type="primary"
        icon={<SelectOutlined />}
        onClick={() => {
          if (browserAccount.account != undefined) {
            confirm({
              title: t("notification.close_website.title"),
              icon: <ExclamationCircleOutlined />,
              content: t("notification.close_website.body"),
              onOk() {
                handleWebsiteMode(undefined);
                handleSignOut("/");
              },
              onCancel() {},
            });
          } else {
            handleWebsiteMode(undefined);
            handleSignOut("/");
          }
        }}
      ></Button>
    </Tooltip>
  );
};

export default WebsiteSelectorButton;
