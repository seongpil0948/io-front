process.env["GCLOUD_PROJECT"] = "io-box-develop";
// The Firebase Admin SDKs automatically connect to the Authentication emulator when the FIREBASE_AUTH_EMULATOR_HOST environment variable is set.
process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "127.0.0.1:9099";
process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
process.env["GOOGLE_APPLICATION_CREDENTIALS"] =
  process.env["GOOGLE_APPLICATION_DEV_CREDENTIALS"];
const admin = require("firebase-admin");

const fs = require("fs");

const rawData = fs.readFileSync("stuff/latest-data/auth_export/accounts.json");
admin.initializeApp();
const ioAuth = admin.auth();
const users = JSON.parse(rawData).users;

async function createUsers(userList) {
  let cnt = 0;
  for (let i = 0; i < userList.length; i++) {
    const u = userList[i];
    try {
      // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
      await ioAuth.createUser(
        Object.assign(u, {
          lastSignedInAt: Number(u.lastSignedInAt),
          createdAt: Number(u.createdAt),
          password: "0525cc",
          uid: u.localId,
        })
      );
      cnt += 1;
    } catch (err) {
      if (
        err.code === "auth/uid-already-exists" ||
        err.code === "auth/email-already-exists"
      ) {
        console.info(`${u.displayName} is already exist`);
      } else {
        throw err;
      }
    }
  }
  console.log("created user cnt: ", cnt);
}
createUsers(users).then(() => {
  console.log("done createUsers");
});
