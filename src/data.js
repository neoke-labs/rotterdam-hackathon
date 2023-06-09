import { useState, useEffect, useRef } from "react";
import { firestore } from "util/firebase";
import { useTranslation } from "react-i18next";
import { dictionary } from "util/dictionary";
const { dbError } = firestore;
const { getAccountByEmail } = firestore.helpers;

const ADMIN_ACCOUNT = "admin@neoke.tech";
const ADMIN_PASSWORD = "admin";

const ASCII_CODES = {
  0: "0".charCodeAt(0),
  9: "9".charCodeAt(0),
  a: "a".charCodeAt(0),
  z: "z".charCodeAt(0),
  A: "A".charCodeAt(0),
  Z: "Z".charCodeAt(0),
};

const ascii_to_words = (string, words_per_group, groups, dictionary) => {
  let result = [];
  let j = 0;
  let acc = 0;
  for (let i = 0; i < string.length; i++) {
    let raw_value = string.charCodeAt(i);
    if (raw_value >= ASCII_CODES["0"] && raw_value <= ASCII_CODES["9"]) {
      raw_value -= ASCII_CODES["0"];
    } else if (raw_value >= ASCII_CODES["a"] && raw_value <= ASCII_CODES["z"]) {
      raw_value -= ASCII_CODES["a"] - 10;
    } else {
      raw_value -= ASCII_CODES["A"] - 36;
    }
    acc += raw_value * Math.pow(62, j++);
    if (j == words_per_group) {
      result.push(dictionary[acc % dictionary.length]);
      if (result.length == groups) {
        return result;
      }
      j = 0;
      acc = 0;
    }
  }
  return result;
};

function useData() {
  const { t } = useTranslation();

  const [browserAccount, setBrowserAccount] = useState({
    account: window.localStorage.getItem("account") ?? undefined,
    isHotel: window.localStorage.getItem("isHotel") ?? undefined,
    isAdmin: window.localStorage.getItem("isAdmin") ?? undefined,
  });

  const [account, setAccount] = useState({});
  const [hotels, setHotels] = useState([]);
  const [preloading, setPreloading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [reservationId, setReservationId] = useState(undefined);
  const [proof, setProof] = useState({});
  const [env, setEnv] = useState({});
  const [websiteMode, setWebsiteMode] = useState(
    window.localStorage.getItem("websiteMode") ?? undefined,
  );

  const accountUnsubscribe = useRef();
  const hotelsUnsubscribe = useRef();
  const reservationsUnsubscribe = useRef();

  //
  // Handles
  //
  const handleWebsiteMode = (mode) => {
    if (mode != websiteMode) {
      if (!mode) {
        window.localStorage.removeItem("websiteMode");
      } else {
        window.localStorage.setItem("websiteMode", mode);
      }
      setWebsiteMode(mode);
    }
  };

  const handlePassportVerified = (passport) => {
    window.localStorage.setItem("passport", passport);
  };

  const handleSignIn = (account, isHotel, isAdmin, endpoint) => {
    [
      ["account", account],
      ["isHotel", isHotel],
      ["isAdmin", isAdmin],
    ].forEach((p) => window.localStorage.setItem(p[0], p[1]));
    setPreloading(true);
    setBrowserAccount({
      account,
      isHotel,
      isAdmin,
    });
    window.location = endpoint;
  };

  const handleSignOut = (endpoint) => {
    ["account", "isHotel", "isAdmin"].forEach((w) =>
      window.localStorage.removeItem(w),
    );
    setPreloading(true);
    setAccount({});
    setBrowserAccount({});
    window.location = endpoint;
  };

  //
  // Utilities
  //
  const updateAccountFromData = (browserAccount, setAccount, doc) => {
    const data = doc.data();
    if (data) {
      let fields;
      if (browserAccount.isHotel == "true") {
        fields = { name: data.name ?? "" };
      } else {
        fields = {
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
        };
      }

      setAccount({
        ...fields,
        email: data.email,
        notifications: data.notifications,
        docRef: doc.id,
        isHotel: browserAccount.isHotel == "true",
      });
    }
  };

  const getReservationState = (t, reservation) => {
    let result = undefined;
    switch (reservation.credential_status) {
      case "none":
        result = t("state.created");
        break;

      case "request":
        result = t("state.issuing_credential");
        break;

      case "sent":
        result = t("state.waiting_credential_acceptance");
        break;

      case "rejected":
        result = t("state.created");
        break;

      case "received":
        switch (reservation.proof_status) {
          case "none":
            result = t("state.waiting_documentation");
            break;

          case "request":
            result = t("state.waiting_proof_acceptance");
            break;

          case "rejected":
            result = t("state.waiting_documentation");
            break;

          case "provided":
            if (reservation.checked_in) {
              switch (reservation.proof_of_stay_status) {
                case "received":
                  result = t("state.proof_of_stay_received");
                  break;

                default:
                  result = t("state.proof_of_stay_available");
              }
            } else {
              result = t("state.ready");
            }
            break;
        }
        break;
    }

    return result;
  };

  const extractReservationsData = (t, getReservationState, docs) => {
    const reservations = [];
    const words = 3;
    const group_size = 2;
    docs.forEach((doc) => {
      const id = doc.id;
      const data = doc.data();
      reservations.push({
        ...data,
        key: id,
        words: ascii_to_words(id, group_size, words, dictionary),
        id,
        full_name: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
        hotel_id: data.hotel_id,
        hotel_owner_id: data.hotel_owner_id,
        dates: {
          check_in_date: data.check_in_date,
          check_out_date: data.check_out_date,
        },
        state: getReservationState(t, data),
      });
    });
    return reservations;
  };

  //
  // Effects
  //
  const getAccount = () => {
    if (browserAccount.account == undefined) {
      if (accountUnsubscribe.current) {
        accountUnsubscribe.current();
        accountUnsubscribe.current = null;
      }

      if (reservationsUnsubscribe.current) {
        reservationsUnsubscribe.current();
        reservationsUnsubscribe.current = null;
      }
    }

    if (browserAccount.account && browserAccount.isAdmin != "true") {
      getAccountByEmail(browserAccount.account, (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          updateAccountFromData(browserAccount, setAccount, doc);
        }
      });
    }
  };

  const subscribeAccount = () => {
    if (account?.email && account?.email != ADMIN_ACCOUNT) {
      if (!accountUnsubscribe.current) {
        accountUnsubscribe.current = firestore.doc.onSnapshot(
          "account",
          account.docRef,
          (doc) => updateAccountFromData(browserAccount, setAccount, doc, true),
          dbError,
        );
      }
    }
  };

  const subscribeHotels = () => {
    if (!hotelsUnsubscribe.current) {
      hotelsUnsubscribe.current = firestore.helpers.subscribeHotels(
        (hotels) => {
          const new_hotels = [];
          hotels.docs.forEach((doc) => {
            new_hotels.push({
              ...doc.data(),
              id: doc.id,
            });
          });
          setHotels(new_hotels);
        },
      );
    }
  };

  const subscribeReservations = () => {
    if (!reservationsUnsubscribe.current && account.docRef != undefined) {
      const helper = account.isHotel
        ? firestore.helpers.subscribeReservationsByHotelOwnerID
        : firestore.helpers.subscribeReservationsByAccount;

      reservationsUnsubscribe.current = helper(account.docRef, (docs) =>
        setReservations(extractReservationsData(t, getReservationState, docs)),
      );
    }
  };

  const getProof = () => {
    if (!reservationId) {
      setProof({});
    } else {
      firestore.doc.get("proof", reservationId, (doc) =>
        setProof(doc.exists ? doc.data() : {}),
      );
    }
  };

  const getEnv = () => {
    firestore.doc.onSnapshot("configuration", "env", (doc) =>
      setEnv(doc.data()),
    );
  };

  useEffect(getAccount, [browserAccount]);
  useEffect(subscribeAccount, [account, browserAccount]);
  useEffect(subscribeHotels, []);
  useEffect(subscribeReservations, [t, account]);
  useEffect(getProof, [reservationId]);
  useEffect(getEnv, []);

  return {
    ADMIN_ACCOUNT,
    ADMIN_PASSWORD,
    preloading,
    env,
    browserAccount,
    account,
    hotels,
    reservations,
    reservationId,
    setReservationId,
    proof,
    websiteMode,
    handleWebsiteMode,
    handlePassportVerified,
    handleSignIn,
    handleSignOut,
    getReservationState,
    extractReservationsData,
  };
}

export default useData;
