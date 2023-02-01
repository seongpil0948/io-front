<!-- eslint-disable vue/require-prop-types -->
<script setup>
import { useMessage, NDynamicTags } from "naive-ui";
import { computed, toRefs } from "vue";
import { makeMsgOpt } from "@/util";
import { Add16Regular } from "@vicons/fluent";

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
  "value", // table cell
  "mapper",
  "mapType",
  "mapKey",
  "rowIdField",
  "targetVal",
  "show",
  "siblings", // prodIds
]);
// type-based
const emits = defineEmits(["reqShow", "on-clickoutside"]);

const {
  siblings,
  mapper,
  mapType,
  mapKey,
  rowIdField,
  targetVal,
  value,
  show,
} = toRefs(props);
const isMapCell = mapType?.value === "cell";
if (isMapCell && (!rowIdField.value || !targetVal.value)) {
  throw Error(
    `Mapping Cell required rowIdField(${rowIdField.value}) & targetValue(${targetVal.value})`
  );
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
const targetIds = computed(() =>
  Array.isArray(siblings.value) && siblings.value.length > 0
    ? siblings.value
    : [rowIdField.value]
);
function onUpdate(val) {
  if (isMapCell) {
    const deleted = synonyms.value.filter((x) => !val.includes(x));
    // console.log("synonyms: ", synonyms.value, "updated val:", val);
    // console.log("deleted:", deleted, deleted.length === 1);
    if (deleted.length === 1) {
      targetIds.value.forEach((id) => {
        mapper?.value.deleteColVal(mapKey?.value, id, deleted[0]);
      });
      // mapper?.value.deleteColVal(mapKey?.value, rowIdField?.value, deleted[0]);
    } else {
      targetIds.value.forEach((id) => {
        mapper?.value.setColVal(mapKey?.value, id, targetVal?.value, val);
      });
    }
  } else {
    mapper?.value.setSyno(mapKey?.value, val);
  }
}

async function onSave() {
  await mapper.value.update(false);
  console.log("update mapper in MapperSaver", mapper.value);
  msg.success("변경사항 저장이 완료 되었어요!", makeMsgOpt());
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
    :duration="30000"
    :on-update:show="onUpdateShow"
    data-test="mapper-popover"
    @clickoutside="emits('on-clickoutside')"
  >
    <n-card :segmented="{ footer: true }" size="small">
      <n-dynamic-tags
        :value="synonyms"
        :input-props="{
          placeholder: '매핑 정보 입력',
          'data-test': 'mapper-input',
        }"
        :max="20"
        @update:value="onUpdate"
      >
        <template #trigger="{ activate, disabled }">
          <n-button
            size="small"
            type="primary"
            data-test="mapper-trigger-input-btn"
            dashed
            :disabled="disabled"
            @click="activate()"
          >
            <template #icon>
              <n-icon>
                <Add16Regular />
              </n-icon>
            </template>
            New
          </n-button>
        </template>
      </n-dynamic-tags>
      <template #footer>
        <n-space justify="center" align="center">
          <n-button size="small" data-test="mapper-saver-btn" @click="onSave">
            적용
          </n-button>
        </n-space>
      </template>
    </n-card>
    <template #trigger>
      <n-button
        :type="synonyms.length < 1 ? 'primary' : 'default'"
        data-test="mapper-trigger-btn"
      >
        {{ value }}
      </n-button>
    </template>
  </n-popover>
</template>
<style scoped>
.n-card > .n-card__action {
  padding: 0;
}
</style>
