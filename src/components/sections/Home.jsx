import Logo from "../../images/logo-savaneta-small.png";
import { Row } from "antd";
import { t } from "i18next";

const Home = () => {
  return (
    <div className="home-container ant-col-24">
      <Row justify="space-evenly" align="middle">
        <div className="ant-col-md-1"></div>
        <div className="ant-col-md-10 ant-col-xs-24">
          <div className="home-info">
            <img src={Logo} />
            <h1>{t("section.home.title")}</h1>
            <h2>{t("section.home.subtitle")}</h2>
          </div>
        </div>
        <div className="ant-col-md-11 ant-col-xs-24"></div>
      </Row>
    </div>
  );
};

export default Home;
