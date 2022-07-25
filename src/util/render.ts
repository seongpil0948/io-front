import { NIcon } from "naive-ui";
import { type Component, h } from "vue";
import { RouterLink } from "vue-router";

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}
function renderRoute(label: string, key: string) {
  return h(
    RouterLink,
    {
      to: {
        name: key,
      },
    },
    { default: () => label }
  );
}

export { renderIcon, renderRoute };
