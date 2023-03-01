import { NButton, NPopover } from "naive-ui";
import { defineComponent, PropType, defineAsyncComponent, h } from "vue";
import { VendorGarment } from "@/composable";

const VendorProdCard = defineAsyncComponent(
  () => import("@/component/card/vendor/VendorProdCard.vue")
);

export const PopVendorProdCard = defineComponent({
  props: {
    vendorProd: {
      type: Object as PropType<VendorGarment>,
      required: true,
    },
  },
  render() {
    const { vendorProd } = this;
    return (
      <NPopover>
        {{
          trigger: () => (
            <NButton>
              {{
                default: () => vendorProd.vendorProdName,
              }}
            </NButton>
          ),
          default: () => h(VendorProdCard, { prod: vendorProd }),
        }}
      </NPopover>
    );
  },
});
