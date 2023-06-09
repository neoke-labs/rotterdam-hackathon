import { t } from "i18next";
import React from "react";
import { Link } from "react-router-dom";

const NotFound = ({ path, message }) => (
  <div>
    <center>
      <h1 style={{ paddingTop: "50px" }}>{t("section.not_found.title")}</h1>
      <h3>
        <Link to={path}>{message}</Link>
      </h3>
    </center>
  </div>
);

export default NotFound;
