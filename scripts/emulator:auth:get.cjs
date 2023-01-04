process.env["GCLOUD_PROJECT"] = "io-box-develop";
// The Firebase Admin SDKs automatically connect to the Authentication emulator when the FIREBASE_AUTH_EMULATOR_HOST environment variable is set.
process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099";
process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
process.env["GOOGLE_APPLICATION_CREDENTIALS"] =
  process.env["GOOGLE_APPLICATION_DEV_CREDENTIALS"];
const admin = require("firebase-admin");

admin.initializeApp();
const ioAuth = admin.auth();
ioAuth
  .getUsers([
    // { uid: "uid1" },
    // { email: "user2@example.com" },
    // { phoneNumber: "+15555550003" },
    // { providerId: "google.com", providerUid: "google_uid4" },
  ])
  .then((getUsersResult) => {
    console.log("Successfully fetched user data:");
    getUsersResult.users.forEach((userRecord) => {
      console.log(userRecord);
    });

    console.log("Unable to find users corresponding to these identifiers:");
    getUsersResult.notFound.forEach((userIdentifier) => {
      console.log(userIdentifier);
    });
  })
  .catch((error) => {
    console.log("Error fetching user data:", error);
  });
