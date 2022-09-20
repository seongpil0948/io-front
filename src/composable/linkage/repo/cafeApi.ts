export async function getCafeOrders(
  startDate: string,
  endDate: string,
  tokenId: string,
  userId: string
) {
  const formData = new FormData();
  formData.set("mallId", "tjagksro");
  formData.set("userId", userId);
  formData.set("startDate", startDate);
  formData.set("endDate", endDate);
  formData.set("tokenId", tokenId);
  // const getCafeOrdersRes = await http.post(`/linkage/getCafeOrders`, formData);
  // console.log("getCafeOrdersRes: ", getCafeOrdersRes);
}
