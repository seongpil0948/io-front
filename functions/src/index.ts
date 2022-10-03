import functions = require("firebase-functions");
import firestore = require("@google-cloud/firestore");

const client = new firestore.v1.FirestoreAdminClient();
const bucket = "gs://io-archives/backups/io-box/";

exports.scheduledFirestoreExport = functions.pubsub
  .schedule("0 3 1 * 1")
  .onRun((context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId!, "(default)");
    functions.logger.info("Hello scheduledFirestoreExport logs!", {
      structuredData: true,
      context,
    });
    const date = new Date();
    return client
      .exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket + date.toISOString().split("T")[0],
        // Leave collectionIds empty to export all collections
        // or set to a list of collection IDs to export,
        // collectionIds: ['users', 'posts']
        collectionIds: [],
      })
      .then((responses) => {
        const response = responses[0];
        console.log(`Operation Name: ${response["name"]}`);
        functions.logger.debug(`Operation Name: ${response}`);
      })
      .catch((err) => {
        console.error(err);
        functions.logger.error(
          "scheduledFirestoreExport Fail",
          err instanceof Error ? err.message : JSON.stringify(err)
        );
        throw new Error("Export operation failed");
      });
  });

//TODO: 매 시간 order state 가 SHIPPING_COMPLETE 인 주문건들의 마지막 updatedAt이 7일이 경과한 경우 ORDER_DONE 으로 상태변경
