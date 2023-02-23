import { NIcon } from "naive-ui";
import { type Component, h, VNode } from "vue";
import { RouterLink } from "vue-router";

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}
function renderRoute(label: string | VNode, key: string, disable = false) {
  return disable
    ? label
    : h(
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
