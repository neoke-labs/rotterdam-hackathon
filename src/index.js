import React, { StrictMode } from "react";
import ReactDOM from "react-dom";

import "./util/firebase";
import "./util/i18n";
import App from "./App";

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root"),
);
