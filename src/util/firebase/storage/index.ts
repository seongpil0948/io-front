import { ioStorage } from "@/plugin/firebase";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type StorageReference,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
export type STORAGE_SVC = "VENDOR_PRODUCT" | "USER";
export const STORAGE_SVC: { [key in STORAGE_SVC]: STORAGE_SVC } = Object.freeze(
  {
    VENDOR_PRODUCT: "VENDOR_PRODUCT",
    USER: "USER",
  }
);

export function getUrlRef(url: string) {
  // https://firebase.google.com/docs/storage/web/download-files?hl=ko#create_a_reference
  const refer = ref(ioStorage, url);
  console.log("refer:", refer);
  return refer;
}
function getUserPath(userId: string) {
  return `users/${userId}`;
}

export function getParentRef(p: {
  svc: STORAGE_SVC;
  userId: string;
  parentId?: string;
}) {
  if (p.svc === "USER") {
    return ref(ioStorage, getUserPath(p.userId));
  } else if (p.svc === "VENDOR_PRODUCT") {
    if (!p.parentId) throw new Error("parentId is required in getParentRef");
    // parentId: vendorProdId
    return ref(
      ioStorage,
      `${getUserPath(p.userId)}/VENDOR_PRODUCT/${p.parentId}`
    );
  } else {
    throw new Error("not matched in getParentRef");
  }
}

// function refByRoleSvc(
//   role: USER_ROLE,
//   svc: STORAGE_SVC,
//   userId: string
// ): StorageReference {
//   return ref(ioStorage, `${role}/${svc}/${userId}`);
// }

// export function refByUid(userId: string) {
//   return ref(ioStorage, `userId/${userId}`);
// }

function completeRef(
  filename: string,
  parent: StorageReference
): StorageReference {
  return ref(parent, filename);
}

export async function uploadFile(
  parent: StorageReference,
  fs: FileList
): Promise<string[]> {
  const refers: Array<StorageReference> = [];
  for (let i = 0; i < fs.length; i++) {
    refers.push(completeRef(uuidv4(), parent));
  }
  if (refers.length !== fs.length)
    throw Error("반드시 참조와 파일 목록은 길이가 같아야합니다.");
  const urls: string[] = [];
  for (let j = 0; j < fs.length; j++) {
    const result = await uploadBytes(refers[j], fs[j]);
    urls.push(await getDownloadURL(result.ref));
  }
  console.log(urls);
  return urls;
}

export function deleteCdnObj(refers: StorageReference[]) {
  return Promise.all(refers.map((refer) => deleteObject(refer)));
}
