import {
  VendorProdSimilar,
  VendorProdSame,
  VendorGarment,
  onFirestoreCompletion,
  onFirestoreErr,
  ShopGarment,
  newOrdFromItem,
  newOrdItem,
  IoOrder,
  useSearch,
  useShopGarmentTable,
  ORDER_GARMENT_DB,
  useVirtualVendor,
  ShopUserGarment,
  SHOP_GARMENT_DB,
  usePopSelTable,
} from "@/composable";
import { getIoCollection, IoUser } from "@io-boxies/js-lib";
import {
  createGarments,
  existSameProduct,
  getSimilarProducts,
} from "@/composable/product/vendor-garment/db/firebase";
import { ref, onBeforeUnmount, computed } from "vue";
import { handleReadSnap } from "@/util";
import {
  onSnapshot,
  query,
  orderBy,
  where,
  runTransaction,
  doc,
} from "firebase/firestore";
import { uuidv4 } from "@firebase/util";
import { shopProdC } from "../product/shop-garment/db/firebase";
import { makeMsgOpt } from "@io-boxies/vue-lib";
import { useMessage } from "naive-ui";
import { ioFireStore } from "@/plugin/firebase";

export function useShopVirtualProd(user: IoUser) {
  const uid = user.userInfo.userId;
  const name = "VirtualVendorProd snapshot";
  const msg = useMessage();
  const { virVendorProdC } = getVirCollections(uid);

  const { virtualVendors, virtualVendorById } = useVirtualVendor(uid);

  const getVirSimilarProds = async (
    d: VendorProdSimilar
  ): Promise<VendorGarment[]> => getSimilarProducts(virVendorProdC, d);

  const existVirSameProd = async (d: VendorProdSame): Promise<boolean> =>
    existSameProduct(virVendorProdC, d);

  const virVendorProds = ref<VendorGarment[]>([]);
  const unsubscribeVirtual = onSnapshot(
    query(virVendorProdC, orderBy("createdAt", "desc")),
    (snap) =>
      handleReadSnap<VendorGarment>(
        snap,
        virVendorProds.value,
        (x) => x.vendorProdId
      ),
    async (err) => {
      await onFirestoreErr(name, err);
      throw err;
    },
    () => onFirestoreCompletion(name)
  );
  const virShopProds = ref<ShopGarment[]>([]);
  const unsubscribeShopProd = onSnapshot(
    query(
      shopProdC,
      where("shopId", "==", uid),
      where("visible", "==", "ME"),
      orderBy("createdAt", "desc")
    ),
    (snap) =>
      handleReadSnap<ShopGarment>(
        snap,
        virShopProds.value,
        (x) => x.vendorProdId
      ),
    async (err) => {
      await onFirestoreErr(name, err);
      throw err;
    },
    () => onFirestoreCompletion(name)
  );
  onBeforeUnmount(() => {
    unsubscribeVirtual();
    unsubscribeShopProd();
  });

  const regitProdModal = ref(false);
  function changeRegitProdModal() {
    regitProdModal.value = !regitProdModal.value;
  }
  function onRegistered() {
    regitProdModal.value = false;
  }
  const userVirProds = computed(() => {
    console.info("virtual shop prods: ", virShopProds.value);
    return virShopProds.value.map((x) => {
      const u = virtualVendorById.value[x.vendorId] ?? user;
      return Object.assign(
        { userName: u.userInfo.userName },
        x,
        u
      ) as ShopUserGarment;
    });
  });

  //   const vendorVirProds = computed(() => {
  //     const uProds: any[] = [];
  //     virShopProds.value.forEach((x) => {
  //       const vendor = virtualVendors.value.find((v) => v.id === x.vendorId);
  //       if (vendor) {
  //         uProds.push(Object.assign({}, x, vendor));
  //       }
  //     });
  //     return uProds;
  //   });

  const { tableCols, checkedKeys, tableRef } = useShopGarmentTable(
    false,
    userVirProds
  );
  const { selectedRow, popVal, optionCol } = usePopSelTable<ShopUserGarment>({
    onDelete: (p) => deleteVirGarments(uid, [p.shopProdId]),
  });
  const virShopCols = computed(() => {
    const t = tableCols.value.filter(
      (x: any) =>
        ![
          "select",
          "titleImgs",
          "userName",
          "vendorPrice",
          "stockCnt",
          "updatedAt",
          "option",
        ].includes(x.key)
    );
    if (t.length < 1) return [];
    return [
      t[0],
      {
        title: "도매처명",
        key: "userInfo.displayName",
      },
      ...t.slice(1),
      optionCol,
    ];
  });

  const { search, searchedData, searchInputVal } = useSearch({
    data: userVirProds,
    filterFunc: (x, searchVal) => {
      const v: typeof searchVal = searchVal;
      return v === null
        ? true
        : x.size.includes(v) || x.color.includes(v) || x.prodName.includes(v);
    },
  });

  async function onCheckedOrder() {
    const orders: IoOrder[] = [];
    for (let i = 0; i < checkedKeys.value.length; i++) {
      const prod = virShopProds.value.find(
        (x) => x.shopProdId === checkedKeys.value[i]
      )!;
      if (!prod) continue;

      const vendorProd = virVendorProds.value.find(
        (y) => y.vendorProdId === prod.vendorProdId
      )!;
      const item = newOrdItem({
        vendorProd,
        shopProd: prod,
        orderIds: [uuidv4()],
        orderCnt: 1,
        shipFeeAmount: 0,
        shipFeeDiscountAmount: 0,
        pickFeeAmount: 0,
        pickFeeDiscountAmount: 0,
        tax: 0,
        paidAmount: 0,
        paid: "NO",
        paymentConfirm: false,
      });
      const order = newOrdFromItem([item]);
      orders.push(order);
    }
    await ORDER_GARMENT_DB.batchCreate(user.userInfo.userId, orders);
    msg.success(
      `${orders.length} 개 상품 주문데이터 생성이 완료 되었습니다.`,
      makeMsgOpt()
    );
  }

  return {
    virVendorProdC,
    getVirSimilarProds,
    existVirSameProd,
    createVirVendorGarments,
    virVendorProds,
    virShopProds,
    regitProdModal,
    changeRegitProdModal,
    onRegistered,
    searchInputVal,
    search,
    onCheckedOrder,
    popVal,
    selectedRow,
    virShopCols,
    searchedData,
    userVirProds,
    tableRef,
    virtualVendors,
    virtualVendorById,
  };
}

export const createVirVendorGarments = async (
  userId: string,
  args: VendorGarment[]
) => {
  const { virVendorProdC } = getVirCollections(userId);

  await createGarments(virVendorProdC, userId, args);

  const prods: ShopGarment[] = [];
  for (let i = 0; i < args.length; i++) {
    const virProd = args[i];

    const shopProd = new ShopGarment({
      vendorId: virProd.vendorId,
      vendorProdId: virProd.vendorProdId,
      shopProdId: ShopGarment.uid({ vendorProdId: virProd.vendorProdId }),
      shopId: userId,
      prodPrice: virProd.vendorPrice,
      prodName: virProd.vendorProdName,
      info: virProd.info,
      description: virProd.description,
      size: virProd.size,
      color: virProd.color,
      TBD: {},
      prodType: "GARMENT",
      visible: "ME",
    });
    await shopProd.update();
    prods.push(shopProd);
  }
  return prods;
};

export async function deleteVirGarments(uid: string, shopProdIds: string[]) {
  // eslint-disable-next-line prefer-rest-params
  console.info("deleteVirGarments: ", shopProdIds);
  const { virVendorProdC } = getVirCollections(uid);
  return runTransaction(ioFireStore, async (t) => {
    const shopProds = await SHOP_GARMENT_DB.listByIds([...shopProdIds]);
    if (shopProds.length !== shopProdIds.length) {
      console.error(shopProds, shopProdIds);
      throw new Error("shopProdIds not exist" + shopProdIds);
    }
    for (let i = 0; i < shopProds.length; i++) {
      const shopProd = shopProds[i];
      t.delete(doc(virVendorProdC, shopProd.vendorProdId));
    }
    return SHOP_GARMENT_DB.deleteShopGarments(uid, [...shopProdIds]);
  });
}

const getVirCollections = (uid: string) => ({
  virVendorProdC: getIoCollection(ioFireStore, {
    uid,
    c: "VIRTUAL_VENDOR_PROD",
  }).withConverter(VendorGarment.fireConverter()),
});
