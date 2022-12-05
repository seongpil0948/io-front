// eslint-disable-next-line @typescript-eslint/no-var-requires
const functions = require("firebase-functions");
import { v1 } from "@google-cloud/firestore";
import { Client } from "@elastic/elasticsearch";

const client = new v1.FirestoreAdminClient();
const backupBucket = "gs://io-archives/backups/io-box/";

exports.scheduledElasticHealthCheck = functions
  .region("asia-northeast3")
  .pubsub.schedule("every 60 minutes")
  .onRun(() => {
    const client = getElastic();
    return client.ping().catch((e) => {
      functions.logger.error("error in scheduledElasticHealthCheck :  ", e);
    });
  });

exports.elasticVendorProdSearch = functions
  .region("asia-northeast3")
  .https.onCall((d: { input: string }) => {
    const env = functions.config();
    const client = getElastic();
    if (!(typeof d.input === "string") || d.input.length === 0) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with " +
          "one arguments 'input' containing the query text to add."
      );
    }
    functions.logger.debug("elasticVendorProdSearch search word: ", d.input);
    const result = client.search({
      index: env.elasticsearch.vendor_prod_index,
      query: {
        multi_match: {
          query: d.input,
          fields: [
            "vendorProdName",
            "fabric",
            "info",
            "description",
            "createdAt",
            "updatedAt",
            "part",
            "ctgr",
          ],
        },
      },
    });
    return result;
  });

const getElastic = () => {
  const env = functions.config();
  const auth = {
    username: env.elasticsearch.username,
    password: env.elasticsearch.password,
  };
  const client = new Client({
    node: env.elasticsearch.url,
    auth: auth,
  });
  return client;
};
exports.scheduledFirestoreExport = functions.pubsub
  .schedule("0 1 */7 * *") // at 00:00 (midnight) every days.
  // .schedule("0 0 1 * *") // at 00:00 (midnight) every days.
  .onRun((context: any) => {
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
          // eslint-disable-next-line comma-dangle
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
