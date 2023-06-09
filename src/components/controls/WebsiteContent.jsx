import { useContext } from "react";
import NeoKeContext from "context";

import { Routes, Route } from "react-router-dom";

import { Layout } from "antd";
const { Content } = Layout;

import { t } from "i18next";

import WebsiteSelector from "components/sections/WebsiteSelector";
import Account from "components/sections/Account";
import Admin from "components/sections/Admin";
import Home from "components/sections/Home";
import NotFound from "components/NotFound";
import Proof from "components/sections/Proof";
import Hotel from "components/sections/Hotel";
import CreateHotel from "components/sections/CreateHotel";
import Reservation from "components/sections/Reservation";
import Reservations from "components/sections/Reservations";
import Reserve from "components/sections/Reserve";
import ArubaVerifiedTravellerCredential from "components/sections/ArubaVerifiedTravellerCredential";
import SelfService from "components/sections/SelfService";
import Hotels from "components/sections/Hotels";
import Search from "components/sections/Search";

const WebsiteContent = () => {
  const { preloading, websiteMode, browserAccount } = useContext(NeoKeContext);

  const routes = () => {
    const signed = browserAccount.account != undefined;
    const admin = browserAccount.isAdmin == "true";

    if (preloading) {
      return (
        <Routes>
          <Route path="*" element={<></>} />
        </Routes>
      );
    }

    if (!websiteMode) {
      return (
        <Routes>
          <Route exact path="/" element={<WebsiteSelector />} />
          <Route path="/self-service" element={<SelfService />} />
          <Route
            path="/agency"
            element={<ArubaVerifiedTravellerCredential />}
          />
          <Route path="*" element={<></>} />
        </Routes>
      );
    }

    if (websiteMode == "aruba") {
      return (
        <Routes>
          <Route
            exact
            path="/"
            element={<ArubaVerifiedTravellerCredential />}
          />
          <Route path="/self-service" element={<SelfService />} />
          <Route
            path="/agency"
            element={<ArubaVerifiedTravellerCredential />}
          />
        </Routes>
      );
    }

    if (websiteMode == "user") {
      return (
        <Routes>
          {signed ? (
            <>
              <Route path="/account" element={<Account />} />
              <Route path="/search" element={<Search />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route
                path="/search-result/:city/:checkInDate/:checkOutDate"
                element={<Hotels reserve={true} />}
              />
              <Route
                path="/reserve/:hotelId/:checkInDate/:checkOutDate"
                element={<Reserve />}
              />
              <Route path="/hotel/:hotelId" element={<Hotel />} />
              <Route
                path="/reservation/:reservationId"
                element={<Reservation />}
              />
            </>
          ) : (
            <> </>
          )}
          <Route exact path="/" element={<Home />} />
          <Route path="/self-service" element={<SelfService />} />
          <Route
            path="/agency"
            element={<ArubaVerifiedTravellerCredential />}
          />
          <Route
            path="*"
            element={<NotFound path={"/"} message={t("link.go_home")} />}
          />
        </Routes>
      );
    }

    if (websiteMode == "hotel") {
      if (admin) {
        return (
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/self-service" element={<SelfService />} />
            <Route
              path="/agency"
              element={<ArubaVerifiedTravellerCredential />}
            />
            <Route
              path="*"
              element={
                <NotFound path={"/admin"} message={t("link.go_admin")} />
              }
            />
          </Routes>
        );
      }

      return (
        <Routes>
          {signed ? (
            <>
              <Route path="/account" element={<Account />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/proof/:reservationId" element={<Proof />} />
              <Route path="/create-hotel" element={<CreateHotel />} />
              <Route path="/hotels" element={<Hotels isOwner={true} />} />
            </>
          ) : null}
          <Route exact path="/" element={<Home />} />
          <Route path="/hotel/:hotelId" element={<Hotel />} />
          <Route path="/self-service" element={<SelfService />} />
          <Route
            path="/agency"
            element={<ArubaVerifiedTravellerCredential />}
          />
          <Route
            path="*"
            element={<NotFound path={"/"} message={t("link.go_home")} />}
          />
        </Routes>
      );
    }
  };

  return <Content>{routes()}</Content>;
};

export default WebsiteContent;
