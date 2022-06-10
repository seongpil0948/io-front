<script setup>
import { useMessage } from "naive-ui";
import { computed, toRefs } from "vue";

// type MappingType = "cell" | "column";
// interface MapProp {
//   value: any;
//   mapper: Mapper;
//   mapType: MappingType;
//   mapKey: MapKey;
//   rowIdField?: string;
//   targetVal?: string;
//   show: boolean;
// }

const props = defineProps([
  "value",
  "mapper",
  "mapType",
  "mapKey",
  "rowIdField",
  "targetVal",
  "show",
]);
// type-based
const emits = defineEmits(["reqShow", "on-clickoutside"]);

const { mapper, mapType, mapKey, rowIdField, targetVal, value, show } =
  toRefs(props);
const isMapCell = mapType?.value === "cell";
if (isMapCell && (!rowIdField || !targetVal)) {
  throw Error("Mapping Cell required rowIdField");
}

const msg = useMessage();
const synonyms = computed(() =>
  isMapCell
    ? mapper?.value.getKeyVal(
        mapKey?.value,
        rowIdField?.value,
        targetVal?.value
      )
    : mapper?.value.getSyno(mapKey?.value)
);

function onUpdate(val) {
  if (isMapCell) {
    mapper?.value.setColVal(
      mapKey?.value,
      rowIdField?.value,
      targetVal?.value,
      val
    );
  } else {
    mapper?.value.setSyno(mapKey?.value, val);
  }
}

async function onSave() {
  await mapper?.value.update();
  msg.success("변경사항 저장이 완료 되었어요!");
  return emits("reqShow", "");
}

function onUpdateShow(val) {
  if (val) {
    let openKeyVal = mapKey?.value;
    if (rowIdField?.value) {
      openKeyVal += rowIdField?.value;
    }
    if (targetVal?.value) {
      openKeyVal += targetVal?.value;
    }
    return emits("reqShow", openKeyVal);
  }
}
</script>

<template>
  <n-popover
    :show="show"
    trigger="hover"
    style="max-width: 40vw"
    :duration="50000"
    :on-update:show="onUpdateShow"
    @clickoutside="emits('on-clickoutside')"
  >
    <n-card content-style="padding-bottom: 0px;">
      <n-dynamic-tags :value="synonyms" @update:value="onUpdate" />
      <template #action>
        <n-space justify="end">
          <n-button @click="onSave"> 적용 </n-button>
        </n-space>
      </template>
    </n-card>
    <template #trigger>
      <n-button :type="synonyms.length < 1 ? 'primary' : 'default'" ghost>
        {{ value }}
      </n-button>
    </template>
  </n-popover>
</template>
