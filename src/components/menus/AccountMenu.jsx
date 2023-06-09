import { useState, useContext } from "react";
import { Button, Modal } from "antd";

import { useLocation } from "react-router-dom";
import NeoKeContext from "context";
import { t } from "i18next";
import SignInForm from "../forms/SignInForm";
import SignUpForm from "../forms/SignUpForm";
import AuthControl from "components/controls/AuthControl";

function AccountMenu({ endpoint, adminEndpoint }) {
  const {
    ADMIN_ACCOUNT,
    ADMIN_PASSWORD,
    browserAccount,
    websiteMode,
    handleSignIn,
    handleSignOut,
  } = useContext(NeoKeContext);
  const { pathname } = useLocation();
  const [signUpModalVisible, setSignUpModalVisible] = useState(false);
  const [signInModalVisible, setSignInModalVisible] = useState(false);

  const signed = browserAccount.account != undefined;

  const renderSignUpModal = () => {
    return (
      <Modal
        destroyOnClose={true}
        title={t("modal.sign_up.title")}
        open={signUpModalVisible}
        onCancel={() => setSignUpModalVisible(false)}
        footer={null}
      >
        <SignUpForm
          callback={(type, email) => {
            handleSignIn(email, type == "hotel", false, endpoint);
          }}
        />
      </Modal>
    );
  };

  const renderSignInModal = () => {
    return (
      <Modal
        destroyOnClose={true}
        title={t("modal.sign_in.title")}
        open={signInModalVisible}
        onCancel={() => setSignInModalVisible(false)}
        footer={null}
      >
        <SignInForm
          callback={(type, email) => {
            handleSignIn(
              email,
              type == "hotel",
              type == "admin",
              type == "admin" ? adminEndpoint : endpoint,
            );
          }}
          isAdmin={(email, password) => {
            return email == ADMIN_ACCOUNT && password == ADMIN_PASSWORD;
          }}
        />
      </Modal>
    );
  };

  const renderButtons = () => {
    if (websiteMode == undefined || websiteMode == "aruba") {
      return null;
    }

    const signedButtonIsLogOut = () => {
      return (
        pathname == endpoint || (signed && browserAccount.isAdmin == "true")
      );
    };

    if (signed) {
      return (
        <>
          <Button
            type={signedButtonIsLogOut() ? "danger" : "primary"}
            shape="round"
            onClick={() => {
              if (signedButtonIsLogOut()) {
                handleSignOut("/");
              } else {
                window.location = endpoint;
              }
            }}
          >
            {t(
              signedButtonIsLogOut()
                ? "menu.account.log_out"
                : "menu.account.account",
            )}
          </Button>
        </>
      );
    } else {
      if (websiteMode == "user") {
        if (window.location.pathname != "/auth") {
          return (
            <Button
              shape="round"
              type="primary"
              onClick={() => {
                Modal.info({
                  icon: <></>,
                  destroyOnClose: true,
                  width: 380,
                  okType: "default",
                  wrapClassName: "auth-modal",
                  content: (
                    <AuthControl
                      handleSignIn={handleSignIn}
                      endpoint={"/search"}
                    />
                  ),
                  okText: t("button.dismiss"),
                });
              }}
            >
              {t("menu.account.authenticate")}
            </Button>
          );
        } else {
          return null;
        }
      } else {
        return (
          <>
            <Button shape="round" onClick={() => setSignInModalVisible(true)}>
              {t("menu.account.sign_in")}
            </Button>
            <Button
              shape="round"
              type="primary"
              onClick={() => setSignUpModalVisible(true)}
            >
              {t("menu.account.sign_up")}
            </Button>
          </>
        );
      }
    }
  };

  return (
    <>
      {renderSignInModal()}
      {renderSignUpModal()}
      {renderButtons()}
    </>
  );
}

export default AccountMenu;
