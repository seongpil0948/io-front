import { CsPost } from "./../composable/cs/domain";
import { deletePost, getCsFaq, getCsNotice, getCsEvents } from "@/composable";
import { defineStore } from "pinia";
import { onBeforeMount, ref, computed } from "vue";
import { useAuthStore } from "./auth";
import { logger } from "@/plugin/logger";

export const useCsStore = defineStore("csStore", () => {
  const authStore = useAuthStore();
  const faqPosts = ref<CsPost[]>([]);
  const noticePosts = ref<CsPost[]>([]);
  const eventPosts = ref<CsPost[]>([]);
  const detailPost = ref<CsPost | null>(null);
  let initial = true;

  onBeforeMount(async () => await init());

  const posts = computed(() =>
    faqPosts.value.concat(noticePosts.value).concat(eventPosts.value)
  );
  const faqByCtgr = computed(() =>
    faqPosts.value.reduce((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = [curr];
      } else {
        acc[curr.category].push(curr);
      }
      return acc;
    }, {} as { [k: string]: CsPost[] })
  );

  const unsubscribeAuth = authStore.$onAction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ name, store, args, after, onError }) => {
      after(async () => {
        const u = store.user;
        if (name === "login") {
          if (!u) throw new Error("User is null");
          else {
            init();
          }
        } else if (name === "logout") {
          discard();
        } else if (!u && !initial) {
          discard();
        }
      });
      onError((error) => {
        logger.error(store.user?.userInfo.userId, error);
        discard();
      });
    },
    true
  );

  async function init() {
    const role = authStore.currUserRole;
    console.log(`===init useCsStore === role: ${role}`);
    if (!initial || role === "ANONYMOUSE") return;
    faqPosts.value = await getCsFaq(role);
    noticePosts.value = await getCsNotice(role);
    eventPosts.value = await getCsEvents();
    initial = false;
  }

  function discard() {
    console.log(`===discard useCsStore ===`);
    unsubscribeAuth();
    faqPosts.value = [];
    noticePosts.value = [];
    eventPosts.value = [];
    initial = true;
  }

  return {
    posts,
    faqPosts,
    noticePosts,
    eventPosts,
    deletePost,
    detailPost,
    faqByCtgr,
  };
});
