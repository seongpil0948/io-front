import { ApiToken, LINKAGE_DB } from "@/composable/linkage";
import { useAuthStore } from "@/store";
import { commonTime } from "@/util";
import {
  DataTableColumns,
  NButton,
  NDropdown,
  DropdownOption,
  NText,
  useMessage,
} from "naive-ui";
import { h, computed } from "vue";
import { useLogger } from "vue-logger-plugin";

export function useApiTokenCols() {
  const log = useLogger();
  const msg = useMessage();
  const auth = useAuthStore();
  const uid = computed(() => auth.currUser.userInfo.userId);

  async function handleSelect(
    row: ApiToken,
    key: string | number,
    option: DropdownOption
  ) {
    if (option.key === "delete") {
      LINKAGE_DB.deleteToken(uid.value, row.dbId)
        .then(() => msg.info("삭제 완료"))
        .catch((err) => {
          const message = `삭제 실패 ${
            err instanceof Error ? err.message : JSON.stringify(err)
          }`;
          msg.error(message);
          log.error(uid.value, message);
        });
    } else {
      msg.info(String(key));
    }
  }

  const rowOpts = [
    {
      label: "비활성화",
      key: "toDisable",
      disabled: true,
    },
    {
      label: "인증갱신",
      key: "refresh",
    },
    {
      label: "삭제",
      key: "delete",
    },
  ];

  const { timeToDate } = commonTime();
  const apiTokenCol = computed(
    () =>
      [
        {
          title: "활성화 여부",
          key: "no",
          render(row) {
            // const valid = row.no < 10;
            const valid = true;

            return h(
              NButton,
              {
                type: valid ? "primary" : "error",
                onClick: () => {
                  msg.info(`Play ${JSON.stringify(row)}`);
                },
              },
              { default: () => (valid ? "가능" : "불가") }
            );
          },
        },
        {
          title: "서비스",
          key: "service",
        },
        {
          title: "쇼핑몰ID",
          key: "mallId",
        },
        {
          title: "메뉴",
          key: "actions",
          render(row) {
            const btn = h(NButton, {}, { default: () => "..." });
            return h(
              NDropdown,
              {
                trigger: "click",
                options: rowOpts,
                onSelect: (key: string | number, option: DropdownOption) =>
                  handleSelect(row, key, option),
              },
              {
                default: () => btn,
              }
            );
          },
        },
        {
          title: "만료일",
          key: "expireAt",
          render: (row) =>
            h(
              NText,
              {
                primary: true,
              },
              {
                default: () => timeToDate(row.expireAt, "YYYY-MM-DD HH시 mm분"),
              }
            ),
        },
      ] as DataTableColumns<ApiToken>
  );
  return { apiTokenCol };
}
