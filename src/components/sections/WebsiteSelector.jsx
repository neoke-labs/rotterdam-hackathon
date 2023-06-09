import { useContext } from "react";
import NeoKeContext from "context";

import { t } from "i18next";
import { Button, Row } from "antd";

import PortalLogo from "../../images/logo.png";

const WebsiteSelector = () => {
  const { handleWebsiteMode } = useContext(NeoKeContext);
  return (
    <div className="container website-selector-container ant-col-24">
      <img src={PortalLogo} alt="Logo" className={"neoke-logo"} />
      <h1>{t("section.website_selector.title")}</h1>
      <Row justify="space-around" align="middle">
        <div className="panel ant-col-lg-11 ant-col-md-16 ant-col-sm-22 ant-col-xs-24">
          <h1>{t("section.website_selector.body_title")}</h1>
          <h2>{t("section.website_selector.divider.for_users")}</h2>
          <Button
            type="primary"
            htmlType="submit"
            shape="round"
            onClick={() => handleWebsiteMode("aruba")}
            block
          >
            {t("section.website_selector.button.form")}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            shape="round"
            onClick={() => handleWebsiteMode("user")}
            block
          >
            {t("section.website_selector.button.user")}
          </Button>
          <h2>{t("section.website_selector.divider.for_hotels")}</h2>
          <Button
            type="primary"
            htmlType="submit"
            shape="round"
            className={"last"}
            onClick={() => handleWebsiteMode("hotel")}
            block
          >
            {t("section.website_selector.button.hotel")}
          </Button>
        </div>
      </Row>
    </div>
  );
};

export default WebsiteSelector;
