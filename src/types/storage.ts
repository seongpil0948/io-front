export type STORAGE_SVC = "VENDOR_PRODUCT" | "USER";
export const STORAGE_SVC: { [key in STORAGE_SVC]: STORAGE_SVC } = Object.freeze(
  {
    VENDOR_PRODUCT: "VENDOR_PRODUCT",
    USER: "USER",
  }
);
