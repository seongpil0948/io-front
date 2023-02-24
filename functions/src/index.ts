/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";
import { v1 } from "@google-cloud/firestore";
import { Client } from "@elastic/elasticsearch";
import {
  getFirestore,
  CollectionReference,
  DocumentData,
} from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { WebClient } from "@slack/web-api";

const store = new v1.FirestoreAdminClient();
const backupBucket = "gs://io-archives/backups/io-box/";
const slackToken = "xoxb-4848836930724-4848596172262-kXRLFB7E9LkIWNCBhSiLBGO9";

exports.onCreateUser = functions
  .region("asia-northeast3")
  .firestore.document("user/{docId}")
  .onCreate(async (snap, context) => {
    const web = new WebClient(slackToken);
    const val = snap.data();
    await web.chat.postMessage({
      text: `유저(${context.params.docId}) 신규가입! 승인해라 닝겐 \n 아자`,
      channel: "#new-users",
    });
    console.log("onCreateUser success ", val);
  });
exports.onCreateRequestEncash = functions
  .region("asia-northeast3")
  .firestore.document("requestEncash/{docId}")
  .onCreate(async (snap, context) => {
    const web = new WebClient(slackToken);
    const val = snap.data();
    let text = `출금요청(${context.params.docId}) 도착!`;
    if (val.amount) {
      text += `\n 출금요청액: ${val.amount}`;
    }
    await web.chat.postMessage({
      text,
      channel: "#new-request-encash",
    });
    console.log("onCreateRequestEncash success ", val);
  });

exports.scheduledElasticHealthCheck = functions
  .region("asia-northeast3")
  .pubsub.schedule("every 60 minutes")
  .onRun(() => {
    const client = getElastic();
    return client.ping().catch((e) => {
      functions.logger.error("error in scheduledElasticHealthCheck :  ", e);
    });
  });

exports.elasticInoutBoxSearch = functions
  .region("asia-northeast3")
  .https.onCall((d: { searchParam: any }) => {
    const client = getElastic();
    const p = JSON.stringify(d.searchParam);
    functions.logger.debug("elasticInoutBoxSearch param: " + p);
    return (
      client
        .search(d.searchParam)
        // return client
        //   .search({
        //     // index: env.elasticsearch.vendor_prod_index,
        //     index: d.index,
        //     query: {
        //       query_string: {
        //         query: d.input,
        //       },
        //       // multi_match: {
        //       //   query: d.input,
        //       //   fields: [
        //       //     "vendorprodname",
        //       //   ],
        //       // },
        //     },
        //     sort: [
        //       {
        //         "createdat.date": {
        //           order: "desc",
        //         },
        //       },
        //     ],
        //     from: 0,
        //     size: 200,
        //   })
        .catch((e) => {
          functions.logger.error("error in elasticInoutBoxSearch" + e);
          throw e;
        })
    );
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
exports.scheduledFirestoreExport = functions
  .region("asia-northeast3")
  // .https.onCall(() => {
  .pubsub.schedule("0 5 * * *") // at 00:00 (midnight) every days.
  .onRun((context) => {
    functions.logger.info("hello scheduledFirestoreExport logs!", {
      context,
    });
    const date = new Date();
    const bucket = backupBucket + date.toISOString().split("T")[0];
    functions.logger.info("target today bucket: ", bucket);
    store
      .exportDocuments({
        name: store.databasePath("io-box", "(default)"),
        outputUriPrefix: bucket,
      })
      .then((responses) => {
        functions.logger.info(
          `exportDocuments operation: ${JSON.stringify(responses)} is done`
        );
        // store
        //   .importDocuments({
        //     name: store.databasePath("io-box-develop", "(default)"),
        //     inputUriPrefix: bucket,
        //   })
        //   .then((responses) => functions.logger.info(`importDocuments operation: ${JSON.stringify(responses)} is done`))
        //   .catch((err) => functions.logger.error(`importDocuments fail ${JSON.stringify(err)}`));
      })
      .catch((err) =>
        functions.logger.error(
          `scheduledFirestoreExport fail ${JSON.stringify(err)}`
        )
      );
  });

export async function clearDevFirestoreData(
  subCollections?: CollectionReference<DocumentData>[]
) {
  const devStore = getFirestore(devApp);
  const collections = subCollections ?? (await devStore.listCollections());
  for (const coll of collections) {
    const batch = devStore.batch();
    const documents = await coll.listDocuments();

    for (const doc of documents) {
      await clearDevFirestoreData(await doc.listCollections());
      batch.delete(doc);
    }
    await batch.commit();
  }
  return;
}
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

// const firebaseProdConfig = {
//   apiKey: "AIzaSyCZZWgDchBhOt_FegFemyofULLHzTLVjA4",
//   authDomain: "io-box.firebaseapp.com",
//   databaseURL: "https://io-box-default-rtdb.firebaseio.com",
//   projectId: "io-box",
//   storageBucket: "io-box.appspot.com",
//   messagingSenderId: "812477328372",
//   appId: "1:812477328372:web:48d71b6a8390480d6827a1",
//   measurementId: "G-JYYCY3TTPS",
// };
// const prodApp = initializeApp(firebaseProdConfig, "io-box-production-app");
const firebaseDevConfig = {
  apiKey: "AIzaSyDDBPpQ9Z8ciqpdIfcqLoP2zaYwPCsZN4A",
  authDomain: "io-box-develop.firebaseapp.com",
  projectId: "io-box-develop",
  storageBucket: "io-box-develop.appspot.com",
  messagingSenderId: "906159770710",
  appId: "1:906159770710:web:f09dcf880010f703c8fff7",
};
const devApp = initializeApp(firebaseDevConfig, "io-box-develop-app");
