const admin = require("firebase-admin");
const mail = require("../functions/mail");
const Config = require("./config");

const hotelAccount = async (hotel) => {
  if (hotel.notifications) {
    await mail.triggers.hotelAccount(hotel.email);
  }
};

const createArubaVerifiedTravellerCredential = async (
  aruba_verified_traveller_credential,
  aruba_verified_traveller_credential_id,
  is_agency,
) => {
  const { email, first_name, last_name } = aruba_verified_traveller_credential;
  const config = new Config();
  let url = `${config.SITE_URL}/self-service?type=aruba-verified-traveller-credential&arubaVerifiedTravellerCredentialId=${aruba_verified_traveller_credential_id}`;

  await mail.triggers.createArubaVerifiedTravellerCredential(
    email,
    first_name,
    last_name,
    url,
    is_agency,
  );
};

const userReservation = async (reservation, reservationId, notifyUser) => {
  const hotel = await admin
    .firestore()
    .collection("hotel")
    .doc(reservation.hotel_id)
    .get();

  const hotel_data = hotel.data();

  const hotel_owner = await admin
    .firestore()
    .collection("account")
    .doc(reservation.hotel_owner_id)
    .get();

  await userReservationNotifyHotel(
    reservation,
    reservationId,
    hotel_data,
    hotel_owner.data(),
  );

  if (notifyUser) {
    await userReservationNotifyUser(reservation, reservationId, hotel_data);
  }
};

const userReservationNotifyHotel = async (
  reservation,
  reservationId,
  hotel_data,
  hotel_owner_data,
) => {
  if (hotel_owner_data.notifications) {
    await mail.triggers.userReservationNotifyHotel(
      hotel_owner_data.email,
      hotel_data.name,
      reservationId,
      reservation.first_name,
      reservation.last_name,
      reservation.check_in_date,
      reservation.check_out_date,
    );
  }
};

const userReservationNotifyUser = async (reservation, reservationId, hotel) => {
  let url = undefined;
  if (reservation.speedy_check_in) {
    const config = new Config();
    url = `${config.SITE_URL}/self-service?type=reservation-credential&reservationId=${reservationId}`;
  }

  await mail.triggers.userReservationNotifyUser(
    reservation.email,
    reservationId,
    hotel.name,
    reservation.first_name,
    reservation.last_name,
    reservation.check_in_date,
    reservation.check_out_date,
    url,
  );
};

const proofRequest = async (reservationId, reservationData) => {
  const hotel = await admin
    .firestore()
    .collection("hotel")
    .doc(reservationData.hotel_id)
    .get();

  const config = new Config();
  let url = `${config.SITE_URL}/self-service?type=reservation-proof&reservationId=${reservationId}`;

  await mail.triggers.proofRequestTriggerMail(
    reservationData.email,
    hotel.data().name,
    reservationData.first_name,
    reservationData.last_name,
    url,
  );
};

const userProof = async (reservationDoc) => {
  const data = reservationDoc.data();
  const hotel = await admin
    .firestore()
    .collection("hotel")
    .doc(data.hotel_id)
    .get();

  const hotel_owner = await admin
    .firestore()
    .collection("account")
    .doc(data.hotel_owner_id)
    .get();

  const account = await admin
    .firestore()
    .collection("account")
    .doc(data.account)
    .get();

  let url = undefined;
  if (account.data().notifications || hotel_owner.data().notifications) {
    const config = new Config();
    url = `${config.SITE_URL}/proof/${reservationDoc.id}`;
  }

  if (account.data().notifications) {
    await mail.triggers.userProofNotifyUser(
      data.email,
      reservationDoc.id,
      hotel.data().name,
      url,
    );
  }

  if (hotel_owner.data().notifications) {
    await mail.triggers.userProofNotifyHotel(
      hotel_owner.data().email,
      reservationDoc.id,
      data.first_name,
      data.last_name,
      url,
    );
  }
};

const proofOfStayAvailable = async (reservationId, reservationData) => {
  const hotel = await admin
    .firestore()
    .collection("hotel")
    .doc(reservationData.hotel_id)
    .get();

  const config = new Config();
  let url = `${config.SITE_URL}/self-service?type=proof-of-stay&reservationId=${reservationId}`;

  await mail.triggers.proofOfStayAvailableTriggerMail(
    reservationData.email,
    hotel.data().name,
    reservationData.first_name,
    reservationData.last_name,
    url,
  );
};

exports.adapters = {
  createArubaVerifiedTravellerCredential,
  hotelAccount,
  userReservation,
  proofRequest,
  userProof,
  proofOfStayAvailable,
};
