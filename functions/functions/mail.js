const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const Config = require("../utilities/config");
const admin = require("firebase-admin");
const QR = require("qrcode");
const fs = require("fs");

const mailDispatcher = functions
  .region("us-central1")
  .firestore.document("mail/{mailID}")
  .onCreate(async (snap) => {
    const config = new Config();

    const data = snap.data();
    const sender = data.sender.toUpperCase();

    const mail_user = config[`MAIL_USER_${sender}`];
    const mail_pass = config[`MAIL_PASS_${sender}`];
    const mail_format = config[`MAIL_FORMAT_${sender}`];

    const transporter = nodemailer.createTransport({
      name: config.MAIL_NAME,
      host: config.MAIL_HOST,
      port: config.MAIL_PORT,
      secure: true,
      auth: {
        user: mail_user,
        pass: mail_pass,
      },
    });

    const mail = {
      from: `"${mail_format}" ${mail_user}`,
      to: data.to,
      ...data.message,
    };

    let attachments = [];
    if (data.attachments) {
      data.attachments.forEach((attachment) => {
        const { filename, cid, content } = attachment;
        const path = `/tmp/attachment-${filename}`;
        fs.writeFileSync(path, Buffer.from(content, "base64"));
        attachments.push({
          filename: `attachment-${filename}`,
          cid,
          path,
        });
      });
    }
    functions.logger.debug("Attachments", attachments);
    if (attachments.length) {
      mail.attachments = attachments;
    }

    const result = await transporter.sendMail(mail);
    functions.logger.debug("Mail dispatched", result);
  });

const createArubaVerifiedTravellerCredential = async (
  email,
  first_name,
  last_name,
  url,
  is_agency,
) => {
  const header = `Dear ${first_name} ${last_name},<br /><br />`;

  const instructions = ` Only thing you need to do is download your ED card on your phone by clicking on this <b><a href="${url}">link</a></b>.`;

  const footer = `Rest assured that all your personal data is owned and controlled by you, so that when your information is needed (for bookings or check-ins) your consent will be required.
  <br /> <br />
  Thanks, and enjoy your travels!
  <br /><br />
  The NeoKe Team.`;

  const agency_mail = `${header}
    In preparation for your stay, please set up your account. ${instructions}
    Congratulations, your travel just got easier! You can say goodbye to long queues and endless forms at hotel check-in.
    <br /><br />
    ${footer}`;

  const user_mail = `${header}
    Thanks for creating your ED card and becoming an Aruba verified traveller with NeoKe: Your travel just got easier!
    <br /><br />
    With it, we expect you can say goodbye to long queues and endless forms while exploring Aruba.
    ${instructions}
    ${footer}`;

  const html = is_agency ? agency_mail : user_mail;

  await admin
    .firestore()
    .collection("mail")
    .add({
      to: email,
      sender: "neoke",
      message: {
        subject: "Preparation for your stay",
        html,
      },
    });

  functions.logger.debug(`Mail stored`);
};

const hotelAccount = async (email) => {
  await admin
    .firestore()
    .collection("mail")
    .add({
      to: email,
      sender: "ota",
      message: {
        subject: "Welcome to the Rotterdam Hackathon demo app",
        text: "You have signed up as a hotel, using this email address.",
      },
    });
  functions.logger.debug(`Mail stored`);
};

const userReservationNotifyUser = async (
  email,
  reservation_number,
  hotel,
  first_name,
  last_name,
  check_in_date,
  check_out_date,
  url,
) => {
  const body = {
    to: email,
    sender: "ota",
    message: {
      subject: `Thanks! Your reservation at ${hotel} is confirmed`,
      html: `Thanks ${first_name} ${last_name}! Your reservation at ${hotel} is confirmed.
      <br /><br />
      These are the details:
      <ul>
      <li>Reservation number: ${reservation_number}</li>
      <li>Hotel: ${hotel}</li>
      <li>Check-in: ${check_in_date}</li>
      <li>Check-out: ${check_out_date}</li>
      </ul>
      ${
        url
          ? `To have a speedy check-in, please click <a href="${url}">on this link</a>.
      <br /><br />`
          : ``
      }
      Best,
      <br />
      Savaneta tours.`,
    },
  };

  await admin.firestore().collection("mail").add(body);
  functions.logger.debug(`Mail stored`);
};

const userReservationNotifyHotel = async (
  email,
  hotel_name,
  reservation_number,
  first_name,
  last_name,
  check_in_date,
  check_out_date,
) => {
  const body = {
    to: email,
    sender: "ota",
    message: {
      subject: `New reservation, number: ${reservation_number}`,
      html: `${first_name} ${last_name} has made a reservation, with the following details:
        <ul>
        <li>Hotel: ${hotel_name}</li>
        <li>Reservation number: ${reservation_number}</li>
        <li>Check-in: ${check_in_date}</li>
        <li>Check-out: ${check_out_date}</li>
        </ul>
        <br /><br />
        Best,
        <br />
        Savaneta tours.`,
    },
  };

  await admin.firestore().collection("mail").add(body);
  functions.logger.debug(`Mail stored`);
};

const proofRequestTriggerMail = async (
  email,
  hotel,
  first_name,
  last_name,
  url,
) => {
  const body = {
    to: email,
    sender: "ota",
    message: {
      subject: `You can now create your room-key, for your upcoming stay at ${hotel}`,
      html: `Dear ${first_name} ${last_name},
        <br /><br />
        You will soon stay at ${hotel} and, for you to have a speedy check-in experience, ${hotel} would like you to share the following information:
        <ul>
        <li>First name.</li>
        <li>Last name.</li>
        <li>Date of birth.</li>
        <li>Nationality.</li>
        <li>Passport validity.</li>
        </ul>
        <br />
        Once you share it, the key to your room will be created.
        For reference, this is the same information you would have to otherwise share at the frontdesk on arrival.
        <br /><br />
        To have a speedy check-in, please click <a href="${url}">on this link</a>.
        <br /><br />
        Best,
        <br />
        Savaneta tours.`,
    },
  };

  await admin.firestore().collection("mail").add(body);
  functions.logger.debug(`Mail stored`);
};

const userProofNotifyUser = async (email, reservation_number, hotel, url) => {
  const filename = `${reservation_number}-proof.png`;
  const path = `/tmp/${filename}`;
  await QR.toFile(path, url);

  const body = {
    to: email,
    sender: "ota",
    message: {
      subject: `Here is the key to your room, at ${hotel}!`,
      html: `Please, present this QR code at the frontdesk, on arrival.
        <br />
        <center><img style="width:250px;" src="cid:proof" ></center>
        <br />
        Enjoy your stay!
        <br />
        Savaneta tours.`,
    },
    attachments: [
      {
        content: fs.readFileSync(path, { encoding: "base64" }),
        filename,
        cid: "proof",
      },
    ],
  };

  await admin.firestore().collection("mail").add(body);
  functions.logger.debug(`Mail stored`);
};

const userProofNotifyHotel = async (
  email,
  reservation_number,
  first_name,
  last_name,
  url,
) => {
  const body = {
    to: email,
    sender: "ota",
    message: {
      subject: `Reservation ${reservation_number} key room created`,
      html: `${first_name} ${last_name} has created the key for her room and shared her information with you.
          <br /><br />
          <a href="${url}">Click here</a> to review it.
          <br /><br />
          Best,
          <br />
          Savaneta tours.`,
    },
  };

  await admin.firestore().collection("mail").add(body);
  functions.logger.debug(`Mail stored`);
};

const proofOfStayAvailableTriggerMail = async (
  email,
  hotel,
  first_name,
  last_name,
  url,
) => {
  const body = {
    to: email,
    sender: "ota",
    message: {
      subject: `You can now download a proof of your stay at ${hotel}`,
      html: `Dear ${first_name} ${last_name},
      <br /><br />
      You have successfully checked-in at ${hotel}.
      <br /><br />
      Because of that, you can now obtain a proof of your stay by clickin <a href="${url}">on this link</a>.
      <br /><br />
      Best,
      <br />
      Savaneta tours.`,
    },
  };

  await admin.firestore().collection("mail").add(body);
  functions.logger.debug(`Mail stored`);
};

exports.cfs = {
  mailDispatcher,
};

exports.triggers = {
  createArubaVerifiedTravellerCredential,
  hotelAccount,
  userReservationNotifyUser,
  userReservationNotifyHotel,
  proofRequestTriggerMail,
  userProofNotifyUser,
  userProofNotifyHotel,
  proofOfStayAvailableTriggerMail,
};
