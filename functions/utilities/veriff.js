const crypto = require("crypto");
const sharp = require("sharp");
const Config = require("./config");
const Microsoft = require("./microsoft");
const uuid4 = require("uuid4");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const config = new Config();
const {
  VERIFF_X_AUTH_CLIENT,
  VERIFF_URL,
  VERIFF_X_CALLBACK,
  VERIFF_X_AUTH_PRIVATE_KEY,
} = config;

class Veriff {
  generateSignature(value) {
    return crypto
      .createHmac("sha256", VERIFF_X_AUTH_PRIVATE_KEY)
      .update(Buffer.from(value, "utf8"))
      .digest("hex")
      .toLowerCase();
  }

  addHeaders(headers, toBeSigned) {
    headers = {
      ...headers,
      "x-auth-client": VERIFF_X_AUTH_CLIENT,
    };

    if (toBeSigned) {
      headers = {
        ...headers,
        "x-hmac-signature": this.generateSignature(toBeSigned),
      };
    }

    return headers;
  }

  static async shrinkSize(buffer, options) {
    let image = sharp(buffer);
    let metadata = await image.metadata();
    const cropY = Math.floor(metadata.height * options.cropHeight);
    const cropX = Math.floor(metadata.width * options.cropWidth);
    let width = metadata.width - cropX * 2;
    let height = metadata.height - cropY * 2;
    let adaptedImage = image.extract({
      left: cropX,
      top: cropY,
      width,
      height,
    });
    let adaptedImageBuffer = await adaptedImage.toBuffer();

    let adaptedImageB64 = undefined;
    let validSize = true;
    const maxSize = options.maxSizeKB * 1024;
    do {
      adaptedImageB64 = adaptedImageBuffer.toString("base64");
      validSize = adaptedImageB64.length <= maxSize;
      if (!validSize) {
        width -= 5;
        height -= 5;
        adaptedImage = adaptedImage.resize(width, height);
        adaptedImageBuffer = await adaptedImage.toBuffer();
      }
    } while (!validSize);

    return adaptedImageB64;
  }

  async getMedia(id, options) {
    const result = await fetch(`${VERIFF_URL}/media/${id}`, {
      method: "GET",
      headers: this.addHeaders(
        {
          "Content-Type": "application/json",
        },
        id,
      ),
    });
    const image = await result.buffer();

    const b64 = await Veriff.shrinkSize(image, options);

    return b64;
  }

  static getImageOptions(type) {
    switch (type.toLowerCase()) {
      case "face":
        return {
          cropHeight: 0.05,
          cropWidth: 0.1,
          maxSizeKB: 100,
        };

      case "document":
        return {
          cropHeight: 0.05,
          cropWidth: 0,
          maxSizeKB: 200,
        };

      default:
        return {
          cropHeight: 0,
          cropWidth: 0,
          maxSizeKB: 1024,
        };
    }
  }

  async getImages(session) {
    try {
      const media = await this.getSessionMedia(session);
      const { images } = media;
      const getImage = async (documentName, documentType) => {
        let id = images.filter((image) => image.name == documentName)[0].id;
        const image = await this.getMedia(
          id,
          Veriff.getImageOptions(documentType),
        );
        return image;
      };
      const face = await getImage("face", "face");
      const document = await getImage("document-front", "document");
      return {
        face,
        document,
      };
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async createSession() {
    const body = JSON.stringify({
      verification: {
        timestamp: new Date().toISOString(),
        callback: VERIFF_X_CALLBACK,
      },
    });

    const result = await fetch(`${VERIFF_URL}/sessions`, {
      method: "POST",
      headers: this.addHeaders({
        "Content-Length": Buffer.byteLength(body),
      }),
    });

    return result.json();
  }

  async getSessionMedia(id) {
    const result = await fetch(`${VERIFF_URL}/sessions/${id}/media`, {
      method: "GET",
      headers: this.addHeaders({}, id),
    });
    const json = await result.json();
    return json;
  }

  async getSessionDecision(id) {
    const result = await fetch(`${VERIFF_URL}/sessions/${id}/decision`, {
      method: "GET",
      headers: this.addHeaders(
        {
          "Content-Type": "application/json",
        },
        id,
      ),
    });
    const json = await result.json();
    return json;
  }

  async obtainPassportCredential(sessionId) {
    const session = await this.getSessionDecision(sessionId);
    if (session.status !== "fail") {
      const { verification } = session;
      const { person, document } = verification;
      let selfie, passport_image;
      const images = await this.getImages(sessionId);
      if (images) {
        ({ face: selfie, document: passport_image } = images);
      }
      const microsoft = await Microsoft.instance();
      const request = await microsoft.requestPassportCredential(
        uuid4(),
        person.firstName ?? "",
        person.lastName ?? "",
        person.dateOfBirth ?? "",
        document.number ?? "",
        document.validUntil ?? "",
        document.country ?? "",
        selfie ?? "",
        passport_image ?? "",
      );
      return request;
    } else {
      return session;
    }
  }
}

module.exports = Veriff;
