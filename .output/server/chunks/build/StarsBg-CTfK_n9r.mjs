import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { _ as _export_sfc, x as useState } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import '@iconify/utils';
import 'consola';
import 'better-sqlite3';
import 'ipx';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import 'reka-ui';
import '@vueuse/core';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import 'vaul-vue';
import 'reka-ui/namespaced';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "StarsBg",
  __ssrInlineRender: true,
  props: {
    starCount: { default: 300 },
    color: { default: "var(--ui-primary)" },
    speed: { default: "normal" },
    size: { default: () => ({
      min: 1,
      max: 2
    }) }
  },
  setup(__props) {
    const props = __props;
    const generateStars = (count) => {
      return Array.from({ length: count }, () => ({
        x: Math.floor(Math.random() * 2e3),
        y: Math.floor(Math.random() * 2e3),
        size: typeof props.size === "number" ? props.size : Math.random() * (props.size.max - props.size.min) + props.size.min
      }));
    };
    const speedMap = {
      slow: { duration: 200, opacity: 0.5, ratio: 0.3 },
      normal: { duration: 150, opacity: 0.75, ratio: 0.3 },
      fast: { duration: 100, opacity: 1, ratio: 0.4 }
    };
    const stars = useState("stars", () => {
      return {
        slow: generateStars(Math.floor(props.starCount * speedMap.slow.ratio)),
        normal: generateStars(Math.floor(props.starCount * speedMap.normal.ratio)),
        fast: generateStars(Math.floor(props.starCount * speedMap.fast.ratio))
      };
    });
    const starLayers = computed(() => [
      { stars: stars.value.fast, ...speedMap.fast },
      { stars: stars.value.normal, ...speedMap.normal },
      { stars: stars.value.slow, ...speedMap.slow }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "absolute pointer-events-none z-[-1] inset-y-0 inset-x-5 sm:inset-x-7 lg:inset-x-9 overflow-hidden" }, _attrs))} data-v-ab9f5921><svg class="absolute inset-0 pointer-events-none" viewBox="0 0 1017 181" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-ab9f5921><g opacity="0.5" data-v-ab9f5921><mask id="path-1-inside-1_846_160841" fill="white" data-v-ab9f5921><path d="M0 0H1017V181H0V0Z" data-v-ab9f5921></path></mask><path d="M0 0H1017V181H0V0Z" fill="url(#paint0_radial_846_160841)" fill-opacity="0.22" data-v-ab9f5921></path></g><defs data-v-ab9f5921><radialGradient id="paint0_radial_846_160841" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(508.999 19.5) rotate(90.177) scale(161.501 509.002)" data-v-ab9f5921><stop stop-color="var(--ui-primary)" data-v-ab9f5921></stop><stop offset="1" stop-color="var(--ui-primary)" stop-opacity="0" data-v-ab9f5921></stop></radialGradient><linearGradient id="paint1_linear_846_160841" x1="10.9784" y1="91" x2="1017" y2="90.502" gradientUnits="userSpaceOnUse" data-v-ab9f5921><stop stop-color="var(--ui-primary)" stop-opacity="0" data-v-ab9f5921></stop><stop offset="0.395" stop-color="var(--ui-primary)" data-v-ab9f5921></stop><stop offset="1" stop-color="var(--ui-primary)" stop-opacity="0" data-v-ab9f5921></stop></linearGradient></defs></svg><div class="stars size-full absolute inset-x-0 top-0" data-v-ab9f5921><!--[-->`);
      ssrRenderList(unref(starLayers), (layer, index) => {
        _push(`<div class="star-layer" style="${ssrRenderStyle({
          "--star-duration": `${layer.duration}s`,
          "--star-opacity": layer.opacity,
          "--star-color": __props.color
        })}" data-v-ab9f5921><!--[-->`);
        ssrRenderList(layer.stars, (star, starIndex) => {
          _push(`<div class="star absolute rounded-full" style="${ssrRenderStyle({
            left: `${star.x}px`,
            top: `${star.y}px`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: "var(--star-color)",
            opacity: "var(--star-opacity)"
          })}" data-v-ab9f5921></div>`);
        });
        _push(`<!--]--></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/StarsBg.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const StarsBg = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-ab9f5921"]]), { __name: "StarsBg" });

export { StarsBg as default };
//# sourceMappingURL=StarsBg-CTfK_n9r.mjs.map
