import ArubaVerifiedTravellerCredentialPanel from "components/panels/ArubaVerifiedTravellerCredentialPanel";
import React, { useState, useEffect } from "react";

import ArubaCover from "../../images/aruba-cover.png";
import ArubaCoverSmall from "../../images/aruba-cover-small.png";

const ArubaVerifiedTravellerCredential = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [coverImage, setCoverImage] = useState(ArubaCover);

  const handleWindowResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    if (windowWidth <= 800) {
      setCoverImage(ArubaCoverSmall);
    } else {
      setCoverImage(ArubaCover);
    }
  }, [windowWidth]);

  return (
    <div className="container aruba-verified-traveller-credential-container ant-col-24">
      <div className="header">
        <img src={coverImage} />
      </div>
      <ArubaVerifiedTravellerCredentialPanel />
    </div>
  );
};

export default ArubaVerifiedTravellerCredential;
