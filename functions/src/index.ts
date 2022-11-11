// https://www.npmjs.com/package/@google-cloud/storage#samples
// https://www.npmjs.com/package/@google-cloud/firestore#samples
// https://cloud.google.com/functions/docs/writing/write-event-driven-functions
import functions = require("firebase-functions");
// import { Storage } from "@google-cloud/storage";
// import { v1, Firestore } from "@google-cloud/firestore";
import { v1 } from "@google-cloud/firestore";

const client = new v1.FirestoreAdminClient();
const backupBucket = "gs://io-archives/backups/io-box/";

exports.scheduledFirestoreExport = functions.pubsub
  .schedule("0 1 */7 * *") // at 00:00 (midnight) every days.
  // .schedule("0 0 1 * *") // at 00:00 (midnight) every days.
  .onRun((context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    if (!projectId) {
      functions.logger.error("projectId is undefined", {
        env: process.env,
      });
      return;
    }

    const databaseName = client.databasePath(projectId, "(default)");
    functions.logger.info("hello scheduledFirestoreExport logs!", {
      context,
    });
    const date = new Date();
    return client
      .exportDocuments({
        name: databaseName,
        outputUriPrefix: backupBucket + date.toISOString().split("T")[0],
        // Leave collectionIds empty to export all collections
        // or set to a list of collection IDs to export,
        // collectionIds: ['users', 'posts']
        collectionIds: [],
      })
      .then((responses) => {
        const response = responses[0];
        functions.logger.debug(`operation name: ${response}`);
      })
      .catch((err) => {
        functions.logger.error(
          "scheduledFirestoreExport fail",
          err instanceof Error ? err.message : JSON.stringify(err)
        );
        throw new Error("export operation failed");
      });
  });

// exports.deleteUser = functions.firestore
//   .document("user/{userID}")
//   .onDelete((snap, context) => {
//     // Get an object representing the document prior to deletion
//     // e.g. {'name': 'Marie', 'age': 66}
//     const user = snap.data();
//     functions.logger.info("user deleted", {
//       context,
//       user,
//     });
//     if (snap.id !== user.userInfo.userId) {
//       return functions.logger.error(`user document id(${snap.id}) error`);
//     }
//     const userId = user.userInfo.userId;
//     // delete user images
//     const gcs = new Storage();
//     const firestore = new Firestore();
//     const bucket = gcs.bucket(`io-box.appspot.com/userId/${userId}`);
//     bucket.delete().then((userBucketResult) => {
//       functions.logger.debug("delete user bucket", { userBucketResult });
//       const collectionReference = firestore.collection("cities");
//       collectionReference
//         .orderBy("name")
//         .limitToLast(2)
//         .get()
//         .then((cityDocuments) => {
//           const cityDocumentData = cityDocuments.docs.map((d) => d.data());
//           cityDocumentData.forEach((doc) => {
//             console.log(doc.name);
//           });
//         });
//     });
//   });
