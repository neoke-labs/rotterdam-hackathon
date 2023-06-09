import { Helmet } from "react-helmet";
import { Layout } from "antd";
import { BrowserRouter } from "react-router-dom";

import React from "react";
import NeoKeContext from "context";
import useData from "data";

import "components/theme/General";
import WebsiteHeader from "components/controls/WebsiteHeader";
import WebsiteContent from "components/controls/WebsiteContent";
import WebsiteSelectorButton from "components/controls/WebsiteSelectorButton";
import { getSearchParameters } from "util/parameters";

const OTATheme = React.lazy(() => import("components/theme/OTA"));
const NeokeTheme = React.lazy(() => import("components/theme/Neoke"));

function App() {
  const {
    ADMIN_ACCOUNT,
    ADMIN_PASSWORD,
    preloading,
    env,
    browserAccount,
    account,
    hotels,
    reservations,
    setReservationId,
    reservation,
    proof,
    websiteMode,
    handleWebsiteMode,
    handleSignIn,
    handleSignOut,
    getReservationState,
    extractReservationsData,
  } = useData();

  const isSelfService = window.location.pathname === "/self-service";
  const isAgency = window.location.pathname === "/agency";

  const parameters = getSearchParameters();

  if (parameters.wm) {
    if (
      parameters.wm != websiteMode &&
      ["aruba", "hotel", "user"].includes(parameters.wm)
    ) {
      handleWebsiteMode(parameters.wm);
      handleSignOut("/");
    }
  }

  return (
    <NeoKeContext.Provider
      value={{
        ADMIN_ACCOUNT,
        ADMIN_PASSWORD,
        preloading,
        env,
        browserAccount,
        account,
        hotels,
        reservations,
        setReservationId,
        reservation,
        proof,
        websiteMode,
        handleWebsiteMode,
        handleSignIn,
        handleSignOut,
        getReservationState,
        extractReservationsData,
      }}
    >
      <React.Suspense fallback={<></>}>
        <Helmet>
          <body
            className={
              websiteMode === "user" || websiteMode === "hotel"
                ? "has-background"
                : ""
            }
          />
        </Helmet>
        {(isSelfService ||
          isAgency ||
          !websiteMode ||
          websiteMode == "" ||
          websiteMode == "aruba") && <NeokeTheme />}
        {!isSelfService &&
          !isAgency &&
          (websiteMode == "hotel" || websiteMode == "user") && <OTATheme />}
        <Layout className={`layout-${websiteMode ?? "selector"}`}>
          <BrowserRouter>
            {!isSelfService && !isAgency && !preloading && <WebsiteHeader />}
            <WebsiteContent />
            {(isAgency || (!isSelfService && websiteMode)) && (
              <WebsiteSelectorButton />
            )}
          </BrowserRouter>
        </Layout>
      </React.Suspense>
    </NeoKeContext.Provider>
  );
}

export default App;
