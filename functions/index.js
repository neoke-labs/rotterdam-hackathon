const admin = require("firebase-admin");
admin.initializeApp();

[
  require("./functions/dispatcher"),
  require("./functions/reserve"),
  require("./functions/mail"),
  require("./functions/ping"),
].forEach(async (module) => {
  Object.keys(module.cfs).forEach((cfn) => {
    exports[cfn] = module.cfs[cfn];
  });
});
