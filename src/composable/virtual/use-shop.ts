import {
  VendorProdSimilar,
  VendorProdSame,
  VendorGarment,
  ShopGarment,
  newOrdFromItem,
  newOrdItem,
  IoOrder,
  useSearch,
  useShopGarmentTable,
  ORDER_GARMENT_DB,
  ShopUserGarment,
  SHOP_GARMENT_DB,
  usePopSelTable,
  catchError,
  getUserName,
  IoUser,
} from "@/composable";
import {
  createGarments,
  existSameProduct,
  getSimilarProducts,
} from "@/composable/product/vendor-garment/db/firebase";
import { ref, computed } from "vue";
import {
  runTransaction,
  doc,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { uuidv4 } from "@firebase/util";
import { makeMsgOpt } from "@io-boxies/vue-lib";
import { useMessage } from "naive-ui";
import { ioFireStore, getIoCollection } from "@/plugin/firebase";
import { useShopProdStore } from "@/store/shopProd";
import { storeToRefs } from "pinia";

export function useShopVirtualProd(user: IoUser) {
  const uid = user.userInfo.userId;
  const msg = useMessage();
  const { virVendorProdC } = getVirCollections(uid);
  const shopProdStore = useShopProdStore();
  const {
    virtualVendors,
    virtualVendorById,
    virVendorProds,
    userVirProds,
    virShopProds,
    data,
  } = storeToRefs(shopProdStore);

  const getVirSimilarProds = async (
    d: VendorProdSimilar
  ): Promise<VendorGarment[]> => getSimilarProducts(virVendorProdC, d);

  const existVirSameProd = async (d: VendorProdSame): Promise<boolean> =>
    existSameProduct(virVendorProdC, d);

  const regitProdModal = ref(false);
  function changeRegitProdModal() {
    regitProdModal.value = !regitProdModal.value;
  }
  function onRegistered() {
    regitProdModal.value = false;
  }

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
  const virProdEditTarget = ref<VendorGarment | null>(null);

  const { selectedRow, popVal, optionCol } = usePopSelTable<ShopUserGarment>({
    onDelete: (p) => {
      console.log("in onDelete: ", p);
      return new Promise((resolve, reject) => {
        const query_ = query(
          getIoCollection(ioFireStore, {
            c: "ORDER_PROD",
            uid: uid,
          }),
          where("vendorIds", "array-contains", p.vendorId)
        );
        getCountFromServer(query_)
          .then((snapshot) => {
            const cnt = snapshot.data().count;
            if (cnt > 0) throw new Error("거래중인 상품 입니다.");
            deleteVirGarments(uid, [p.shopProdId])
              .then(() => {
                msg.info("삭제성공", makeMsgOpt());
                resolve("");
              })
              .catch((err) => reject(err));
          })
          .catch((err) => reject(err));
      }).catch((err) =>
        catchError({ msg, err, uid: p.userInfo.userId, opt: makeMsgOpt() })
      );
    },
    onEdit: (p) =>
      (virProdEditTarget.value =
        virVendorProds.value.find((x) => x.vendorProdId === p.vendorProdId) ??
        null),
  });
  const virProdCols = computed(() => {
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
        sorter: (row1: ShopUserGarment, row2: ShopUserGarment) =>
          getUserName(row1).localeCompare(getUserName(row2)),
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
    virProdCols,
    searchedData,
    userVirProds,
    tableRef,
    virtualVendors,
    virtualVendorById,
    virProdEditTarget,
    data,
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
