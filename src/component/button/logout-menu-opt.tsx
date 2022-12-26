import { defineComponent, Component, h } from "vue";
import { useAuthStore } from "@/store";
import { SignOut20Regular } from "@vicons/fluent";
import { NButton, NIcon, NText, MenuOption } from "naive-ui";

export const logoutMenuOpt = () =>
  ({
    key: "logout",
    label: () => h(LogoutBtn, { collapsed: true }),
  } as MenuOption);

export const LogoutBtn = defineComponent({
  name: "LogoutBtn",
  props: {
    collapsed: {
      type: Boolean,
      required: false,
    },
  },
  setup() {
    const authStore = useAuthStore();
    return {
      logout: authStore.logout,
    };
  },

  render() {
    const { logout, collapsed } = this;
    const content: Component[] = [];
    if (!collapsed) {
      content.push(<NText>로그아웃 </NText>);
    } else {
      content.push(<NIcon component={SignOut20Regular} size={24}></NIcon>);
    }
    return (
      <NButton onClick={() => logout()}>{{ default: () => content }}</NButton>
    );
  },
});
