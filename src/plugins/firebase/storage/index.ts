import type { STORAGE_SVC, USER_ROLE } from "@/types";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  type StorageReference,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

import { app } from "../app";
import { getStorage } from "firebase/storage";

// Get the default bucket from a custom firebase.app.App
const getIoStorage = () => getStorage(app);
const ioStorage = getIoStorage();

function refByRoleSvc(
  role: USER_ROLE,
  svc: STORAGE_SVC,
  userId: string
): StorageReference {
  return ref(ioStorage, `${role}/${svc}/${userId}`);
}

function completeRef(
  filename: string,
  parent: StorageReference
): StorageReference {
  return ref(parent, filename);
}

async function uploadFile(
  parent: StorageReference,
  fs: File[]
): Promise<string[]> {
  const refers: Array<StorageReference> = [];
  for (let i = 0; i < fs.length; i++) {
    refers.push(completeRef(uuidv4(), parent));
  }
  if (refers.length !== fs.length)
    throw Error("반드시 참조와 파일 목록은 길이가 같아야합니다.");
  const ps = fs.map((f, idx) => uploadBytes(refers[idx], f));
  const result = await Promise.all(ps);
  // https://firebasestorage.googleapis.com/v0/b/io-box.appspot.com/o/VENDOR%2Fproduct%2Fsp%2Fbb53792b-211c-4e64-a77f-3bfa04b19ea7?alt=media
  return await Promise.all(
    result.map((x) => {
      return getDownloadURL(x.ref);
    })
  );
}

export { refByRoleSvc, completeRef, uploadFile };
export { ioStorage, getIoStorage };
