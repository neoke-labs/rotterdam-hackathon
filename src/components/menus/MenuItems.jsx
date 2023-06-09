import { useContext } from "react";
import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

import NeokeLogo from "../../images/logo.png";
import NeokeLogoSmall from "../../images/logo-small.png";

import OTALogo from "../../images/logo-savaneta.png";
import OTALogoSmall from "../../images/logo-savaneta-small.png";

import { t } from "i18next";

import NeoKeContext from "context";

const MenuItems = () => {
  const { browserAccount, websiteMode } = useContext(NeoKeContext);
  const { pathname } = useLocation();

  if (browserAccount.account != undefined && browserAccount.isAdmin == "true") {
    return null;
  }

  const getSearchItem = () => {
    return {
      label: <NavLink to="/search">{t("menu.search")}</NavLink>,
      key: "/search",
    };
  };

  const getReservationsItem = () => {
    return {
      label: <NavLink to="/reservations">{t("menu.reservations")}</NavLink>,
      key: "/reservations",
    };
  };

  const getHotelsItem = () => {
    return {
      label: (
        <NavLink to="/hotels">
          {t(`menu.hotels.${websiteMode == "hotel" ? "hotel" : "user"}`)}
        </NavLink>
      ),
      key: "/hotels",
    };
  };

  return (
    <>
      <a href="/">
        <img
          src={
            websiteMode == "user" || websiteMode == "hotel"
              ? OTALogo
              : NeokeLogo
          }
          alt="Logo"
          className={`app-logo app-logo-normal ${
            browserAccount.account ? "app-logo-menu" : "app-logo-without-menu"
          }`}
        />
      </a>
      <a href="/">
        <img
          src={
            websiteMode == "user" || websiteMode == "hotel"
              ? OTALogoSmall
              : NeokeLogoSmall
          }
          alt="Logo"
          className={`app-logo app-logo-small ${
            browserAccount.account ? "app-logo-menu" : "app-logo-without-menu"
          }`}
        />
      </a>
      {browserAccount.account ? (
        <Menu
          theme="light"
          mode="horizontal"
          items={
            websiteMode == "user"
              ? [getSearchItem(), getReservationsItem()]
              : [getReservationsItem(), getHotelsItem()]
          }
          defaultSelectedKeys={pathname != "/" ? [pathname] : []}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default MenuItems;
