import { Row } from "antd";
import React from "react";
import AdminGeneralPanel from "components/panels/AdminGeneralPanel";
import AdminCheckinPanel from "components/panels/AdminCheckinPanel";
import { t } from "i18next";

function Admin() {
  return (
    <div className="container ant-col-24">
      <h1>{t("section.admin.title")}</h1>
      <Row justify="space-evenly" align="middle">
        <AdminGeneralPanel
          className={"ant-col-lg-7 ant-col-md-11 ant-col-sm-22 ant-col-xs-24"}
        />
        <AdminCheckinPanel
          className={"ant-col-lg-7 ant-col-md-11 ant-col-sm-22 ant-col-xs-24"}
        />
      </Row>
    </div>
  );
}

export default Admin;
