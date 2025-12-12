import { defineComponent, withAsyncContext, unref, mergeProps, withCtx, createVNode, createBlock, createCommentVNode, openBlock, toDisplayString, Fragment, renderList, defineAsyncComponent, resolveDynamicComponent, useSlots, computed, renderSlot, createTextVNode, watch, ref, h, getCurrentInstance, toRaw, reactive, resolveComponent, shallowRef, Text, Comment, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrRenderVNode, ssrRenderSlot, ssrRenderClass } from 'vue/server-renderer';
import { f as useAsyncData, m as createError, n as useSeoMeta, o as _sfc_main$5$1, c as _sfc_main$j, l as tryUseNuxtApp, I as ImageComponent, b as useAppConfig, t as tv, d as _sfc_main$p, h as _sfc_main$v, g as getSlotChildrenText, i as _sfc_main$q, j as _sfc_main$t, k as _sfc_main$s, e as useNuxtApp } from './server.mjs';
import { Primitive } from 'reka-ui';
import { v as withoutTrailingSlash, I as pascalCase, J as kebabCase, f as destr } from '../nitro/nitro.mjs';
import { find, html } from 'property-information';
import { f as flatUnwrap, n as nodeTextContent } from './node-BnIF1EG3.mjs';
import { pausableFilter, useMouseInElement } from '@vueuse/core';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
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

const _sfc_main$b = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "UColorModeImage",
  __ssrInlineRender: true,
  props: {
    dark: { type: String, required: true },
    light: { type: String, required: true }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(ImageComponent)), mergeProps({
        src: __props.light,
        class: "dark:hidden"
      }, _ctx.$attrs), null), _parent);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(ImageComponent)), mergeProps({
        src: __props.dark,
        class: "hidden dark:block"
      }, _ctx.$attrs), null), _parent);
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/color-mode/ColorModeImage.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const theme$6 = {
  "slots": {
    "root": "relative isolate",
    "container": "flex flex-col lg:grid py-24 sm:py-32 lg:py-40 gap-16 sm:gap-y-24",
    "wrapper": "",
    "header": "",
    "headline": "mb-4",
    "title": "text-5xl sm:text-7xl text-pretty tracking-tight font-bold text-highlighted",
    "description": "text-lg sm:text-xl/8 text-muted",
    "body": "mt-10",
    "footer": "mt-10",
    "links": "flex flex-wrap gap-x-6 gap-y-3"
  },
  "variants": {
    "orientation": {
      "horizontal": {
        "container": "lg:grid-cols-2 lg:items-center",
        "description": "text-pretty"
      },
      "vertical": {
        "container": "",
        "headline": "justify-center",
        "wrapper": "text-center",
        "description": "text-balance",
        "links": "justify-center"
      }
    },
    "reverse": {
      "true": {
        "wrapper": "order-last"
      }
    },
    "headline": {
      "true": {
        "headline": "font-semibold text-primary flex items-center gap-1.5"
      }
    },
    "title": {
      "true": {
        "description": "mt-6"
      }
    }
  }
};
const _sfc_main$a = {
  __name: "UPageHero",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    headline: { type: String, required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    links: { type: Array, required: false },
    orientation: { type: null, required: false, default: "vertical" },
    reverse: { type: Boolean, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme$6), ...appConfig.ui?.pageHero || {} })({
      orientation: props.orientation,
      reverse: props.reverse,
      title: !!props.title || !!slots.title
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-orientation": __props.orientation,
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "top", {}, null, _push2, _parent2, _scopeId);
            _push2(ssrRenderComponent(_sfc_main$j, {
              class: ui.value.container({ class: props.ui?.container })
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (!!slots.header || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.body || !!slots.footer || (__props.links?.length || !!slots.links)) {
                    _push3(`<div class="${ssrRenderClass(ui.value.wrapper({ class: props.ui?.wrapper }))}"${_scopeId2}>`);
                    if (!!slots.header || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description)) {
                      _push3(`<div class="${ssrRenderClass(ui.value.header({ class: props.ui?.header }))}"${_scopeId2}>`);
                      ssrRenderSlot(_ctx.$slots, "header", {}, () => {
                        if (__props.headline || !!slots.headline) {
                          _push3(`<div class="${ssrRenderClass(ui.value.headline({ class: props.ui?.headline, headline: !slots.headline }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "headline", {}, () => {
                            _push3(`${ssrInterpolate(__props.headline)}`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        if (__props.title || !!slots.title) {
                          _push3(`<h1 class="${ssrRenderClass(ui.value.title({ class: props.ui?.title }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "title", {}, () => {
                            _push3(`${ssrInterpolate(__props.title)}`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</h1>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        if (__props.description || !!slots.description) {
                          _push3(`<div class="${ssrRenderClass(ui.value.description({ class: props.ui?.description }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "description", {}, () => {
                            _push3(`${ssrInterpolate(__props.description)}`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      }, _push3, _parent3, _scopeId2);
                      _push3(`</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (!!slots.body) {
                      _push3(`<div class="${ssrRenderClass(ui.value.body({ class: props.ui?.body }))}"${_scopeId2}>`);
                      ssrRenderSlot(_ctx.$slots, "body", {}, null, _push3, _parent3, _scopeId2);
                      _push3(`</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (!!slots.footer || (__props.links?.length || !!slots.links)) {
                      _push3(`<div class="${ssrRenderClass(ui.value.footer({ class: props.ui?.footer }))}"${_scopeId2}>`);
                      ssrRenderSlot(_ctx.$slots, "footer", {}, () => {
                        if (__props.links?.length || !!slots.links) {
                          _push3(`<div class="${ssrRenderClass(ui.value.links({ class: props.ui?.links }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "links", {}, () => {
                            _push3(`<!--[-->`);
                            ssrRenderList(__props.links, (link, index2) => {
                              _push3(ssrRenderComponent(_sfc_main$p, mergeProps({
                                key: index2,
                                size: "xl"
                              }, { ref_for: true }, link), null, _parent3, _scopeId2));
                            });
                            _push3(`<!--]-->`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      }, _push3, _parent3, _scopeId2);
                      _push3(`</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (!!slots.default) {
                    ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
                  } else if (__props.orientation === "horizontal") {
                    _push3(`<div class="hidden lg:block"${_scopeId2}></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    !!slots.header || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.body || !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: ui.value.wrapper({ class: props.ui?.wrapper })
                    }, [
                      !!slots.header || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: ui.value.header({ class: props.ui?.header })
                      }, [
                        renderSlot(_ctx.$slots, "header", {}, () => [
                          __props.headline || !!slots.headline ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: ui.value.headline({ class: props.ui?.headline, headline: !slots.headline })
                          }, [
                            renderSlot(_ctx.$slots, "headline", {}, () => [
                              createTextVNode(toDisplayString(__props.headline), 1)
                            ])
                          ], 2)) : createCommentVNode("", true),
                          __props.title || !!slots.title ? (openBlock(), createBlock("h1", {
                            key: 1,
                            class: ui.value.title({ class: props.ui?.title })
                          }, [
                            renderSlot(_ctx.$slots, "title", {}, () => [
                              createTextVNode(toDisplayString(__props.title), 1)
                            ])
                          ], 2)) : createCommentVNode("", true),
                          __props.description || !!slots.description ? (openBlock(), createBlock("div", {
                            key: 2,
                            class: ui.value.description({ class: props.ui?.description })
                          }, [
                            renderSlot(_ctx.$slots, "description", {}, () => [
                              createTextVNode(toDisplayString(__props.description), 1)
                            ])
                          ], 2)) : createCommentVNode("", true)
                        ])
                      ], 2)) : createCommentVNode("", true),
                      !!slots.body ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: ui.value.body({ class: props.ui?.body })
                      }, [
                        renderSlot(_ctx.$slots, "body")
                      ], 2)) : createCommentVNode("", true),
                      !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                        key: 2,
                        class: ui.value.footer({ class: props.ui?.footer })
                      }, [
                        renderSlot(_ctx.$slots, "footer", {}, () => [
                          __props.links?.length || !!slots.links ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: ui.value.links({ class: props.ui?.links })
                          }, [
                            renderSlot(_ctx.$slots, "links", {}, () => [
                              (openBlock(true), createBlock(Fragment, null, renderList(__props.links, (link, index2) => {
                                return openBlock(), createBlock(_sfc_main$p, mergeProps({
                                  key: index2,
                                  size: "xl"
                                }, { ref_for: true }, link), null, 16);
                              }), 128))
                            ])
                          ], 2)) : createCommentVNode("", true)
                        ])
                      ], 2)) : createCommentVNode("", true)
                    ], 2)) : createCommentVNode("", true),
                    !!slots.default ? renderSlot(_ctx.$slots, "default", { key: 1 }) : __props.orientation === "horizontal" ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "hidden lg:block"
                    })) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
            ssrRenderSlot(_ctx.$slots, "bottom", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "top"),
              createVNode(_sfc_main$j, {
                class: ui.value.container({ class: props.ui?.container })
              }, {
                default: withCtx(() => [
                  !!slots.header || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.body || !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: ui.value.wrapper({ class: props.ui?.wrapper })
                  }, [
                    !!slots.header || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: ui.value.header({ class: props.ui?.header })
                    }, [
                      renderSlot(_ctx.$slots, "header", {}, () => [
                        __props.headline || !!slots.headline ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: ui.value.headline({ class: props.ui?.headline, headline: !slots.headline })
                        }, [
                          renderSlot(_ctx.$slots, "headline", {}, () => [
                            createTextVNode(toDisplayString(__props.headline), 1)
                          ])
                        ], 2)) : createCommentVNode("", true),
                        __props.title || !!slots.title ? (openBlock(), createBlock("h1", {
                          key: 1,
                          class: ui.value.title({ class: props.ui?.title })
                        }, [
                          renderSlot(_ctx.$slots, "title", {}, () => [
                            createTextVNode(toDisplayString(__props.title), 1)
                          ])
                        ], 2)) : createCommentVNode("", true),
                        __props.description || !!slots.description ? (openBlock(), createBlock("div", {
                          key: 2,
                          class: ui.value.description({ class: props.ui?.description })
                        }, [
                          renderSlot(_ctx.$slots, "description", {}, () => [
                            createTextVNode(toDisplayString(__props.description), 1)
                          ])
                        ], 2)) : createCommentVNode("", true)
                      ])
                    ], 2)) : createCommentVNode("", true),
                    !!slots.body ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: ui.value.body({ class: props.ui?.body })
                    }, [
                      renderSlot(_ctx.$slots, "body")
                    ], 2)) : createCommentVNode("", true),
                    !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: ui.value.footer({ class: props.ui?.footer })
                    }, [
                      renderSlot(_ctx.$slots, "footer", {}, () => [
                        __props.links?.length || !!slots.links ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: ui.value.links({ class: props.ui?.links })
                        }, [
                          renderSlot(_ctx.$slots, "links", {}, () => [
                            (openBlock(true), createBlock(Fragment, null, renderList(__props.links, (link, index2) => {
                              return openBlock(), createBlock(_sfc_main$p, mergeProps({
                                key: index2,
                                size: "xl"
                              }, { ref_for: true }, link), null, 16);
                            }), 128))
                          ])
                        ], 2)) : createCommentVNode("", true)
                      ])
                    ], 2)) : createCommentVNode("", true)
                  ], 2)) : createCommentVNode("", true),
                  !!slots.default ? renderSlot(_ctx.$slots, "default", { key: 1 }) : __props.orientation === "horizontal" ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "hidden lg:block"
                  })) : createCommentVNode("", true)
                ]),
                _: 3
              }, 8, ["class"]),
              renderSlot(_ctx.$slots, "bottom")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/PageHero.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
function defaultEstimatedProgress(duration, elapsed) {
  const completionPercentage = elapsed / duration * 100;
  return 2 / Math.PI * 100 * Math.atan(completionPercentage / 50);
}
function createLoadingIndicator(opts = {}) {
  const { duration = 2e3, throttle = 200, hideDelay = 500, resetDelay = 400 } = opts;
  opts.estimatedProgress || defaultEstimatedProgress;
  const nuxtApp = useNuxtApp();
  const progress = shallowRef(0);
  const isLoading = shallowRef(false);
  const error = shallowRef(false);
  const start = (opts2 = {}) => {
    error.value = false;
    set(0, opts2);
  };
  function set(at = 0, opts2 = {}) {
    if (nuxtApp.isHydrating) {
      return;
    }
    if (at >= 100) {
      return finish({ force: opts2.force });
    }
    progress.value = at < 0 ? 0 : at;
    opts2.force ? 0 : throttle;
    {
      isLoading.value = true;
    }
  }
  function finish(opts2 = {}) {
    progress.value = 100;
    if (opts2.error) {
      error.value = true;
    }
    if (opts2.force) {
      progress.value = 0;
      isLoading.value = false;
    }
  }
  function clear() {
  }
  let _cleanup = () => {
  };
  return {
    _cleanup,
    progress: computed(() => progress.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    start,
    set,
    finish,
    clear
  };
}
function useLoadingIndicator(opts = {}) {
  const nuxtApp = useNuxtApp();
  const indicator = nuxtApp._loadingIndicator ||= createLoadingIndicator(opts);
  return indicator;
}
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "HeroBackground",
  __ssrInlineRender: true,
  setup(__props) {
    const { isLoading } = useLoadingIndicator();
    const appear = ref(false);
    const appeared = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["absolute w-full -top-px transition-all text-primary shrink-0", [
          unref(isLoading) ? "animate-pulse" : unref(appear) ? "" : "opacity-0",
          unref(appeared) ? "duration-[400ms]" : "duration-1000"
        ]]
      }, _attrs))}><svg viewBox="0 0 1440 181" fill="none" xmlns="http://www.w3.org/2000/svg" class="pointer-events-none"><mask id="path-1-inside-1_414_5526" fill="white"><path d="M0 0H1440V181H0V0Z"></path></mask><path d="M0 0H1440V181H0V0Z" fill="url(#paint0_linear_414_5526)" fill-opacity="0.22"></path><path d="M0 2H1440V-2H0V2Z" fill="url(#paint1_linear_414_5526)" mask="url(#path-1-inside-1_414_5526)"></path><defs><linearGradient id="paint0_linear_414_5526" x1="720" y1="0" x2="720" y2="181" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor"></stop><stop offset="1" stop-color="currentColor" stop-opacity="0"></stop></linearGradient><linearGradient id="paint1_linear_414_5526" x1="0" y1="90.5" x2="1440" y2="90.5" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" stop-opacity="0"></stop><stop offset="0.395" stop-color="currentColor"></stop><stop offset="1" stop-color="currentColor" stop-opacity="0"></stop></linearGradient></defs></svg></div>`);
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HeroBackground.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$9, { __name: "HeroBackground" });
const htmlTags = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "math",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
];
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    const value = get(obj, key);
    if (value !== void 0) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
function get(obj, key) {
  return key.split(".").reduce((acc, k) => acc && acc[k], obj);
}
const DEFAULT_SLOT = "default";
const rxOn = /^@|^v-on:/;
const rxBind = /^:|^v-bind:/;
const rxModel = /^v-model/;
const nativeInputs = ["select", "textarea", "input"];
const specialParentTags = ["math", "svg"];
const proseComponentMap = Object.fromEntries(["p", "a", "blockquote", "code", "pre", "code", "em", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "img", "ul", "ol", "li", "strong", "table", "thead", "tbody", "td", "th", "tr", "script"].map((t) => [t, `prose-${t}`]));
const dangerousTags = ["script", "base"];
const _sfc_main$8 = defineComponent({
  name: "MDCRenderer",
  props: {
    /**
     * Content to render
     */
    body: {
      type: Object,
      required: true
    },
    /**
     * Document meta data
     */
    data: {
      type: Object,
      default: () => ({})
    },
    /**
     * Class(es) to bind to the component
     */
    class: {
      type: [String, Object],
      default: void 0
    },
    /**
     * Root tag to use for rendering
     */
    tag: {
      type: [String, Boolean],
      default: void 0
    },
    /**
     * Whether or not to render Prose components instead of HTML tags
     */
    prose: {
      type: Boolean,
      default: void 0
    },
    /**
     * The map of custom components to use for rendering.
     */
    components: {
      type: Object,
      default: () => ({})
    },
    /**
     * Tags to unwrap separated by spaces
     * Example: 'ul li'
     */
    unwrap: {
      type: [Boolean, String],
      default: false
    }
  },
  async setup(props) {
    const app = getCurrentInstance()?.appContext?.app;
    const $nuxt = app?.$nuxt;
    const route = $nuxt?.$route || $nuxt?._route;
    const { mdc } = $nuxt?.$config?.public || {};
    const tags = computed(() => ({
      ...mdc?.components?.prose && props.prose !== false ? proseComponentMap : {},
      ...mdc?.components?.map || {},
      ...toRaw(props.data?.mdc?.components || {}),
      ...props.components
    }));
    const contentKey = computed(() => {
      const components = (props.body?.children || []).map((n) => n.tag || n.type).filter((t) => !htmlTags.includes(t));
      return Array.from(new Set(components)).sort().join(".");
    });
    const runtimeData = reactive({
      ...props.data
    });
    watch(() => props.data, (newData) => {
      Object.assign(runtimeData, newData);
    });
    await resolveContentComponents(props.body, { tags: tags.value });
    function updateRuntimeData(code, value) {
      const lastIndex = code.split(".").length - 1;
      return code.split(".").reduce((o, k, i) => {
        if (i == lastIndex && o) {
          o[k] = value;
          return o[k];
        }
        return typeof o === "object" ? o[k] : void 0;
      }, runtimeData);
    }
    return { tags, contentKey, route, runtimeData, updateRuntimeData };
  },
  render(ctx) {
    const { tags, tag, body, data, contentKey, route, unwrap, runtimeData, updateRuntimeData } = ctx;
    if (!body) {
      return null;
    }
    const meta = { ...data, tags, $route: route, runtimeData, updateRuntimeData };
    const component = tag !== false ? resolveComponentInstance(tag || meta.component?.name || meta.component || "div") : void 0;
    return component ? h(component, { ...meta.component?.props, class: ctx.class, ...this.$attrs, key: contentKey }, { default: defaultSlotRenderer }) : defaultSlotRenderer?.();
    function defaultSlotRenderer() {
      const defaultSlot = _renderSlots(body, h, { documentMeta: meta, parentScope: meta, resolveComponent: resolveComponentInstance });
      if (!defaultSlot?.default) {
        return null;
      }
      if (unwrap) {
        return flatUnwrap(
          defaultSlot.default(),
          typeof unwrap === "string" ? unwrap.split(" ") : ["*"]
        );
      }
      return defaultSlot.default();
    }
  }
});
function _renderNode(node, h2, options, keyInParent) {
  const { documentMeta, parentScope, resolveComponent: resolveComponent2 } = options;
  if (node.type === "text") {
    return h2(Text, node.value);
  }
  if (node.type === "comment") {
    return h2(Comment, null, node.value);
  }
  const originalTag = node.tag;
  const renderTag = findMappedTag(node, documentMeta.tags);
  if (node.tag === "binding") {
    return renderBinding(node, h2, documentMeta, parentScope);
  }
  const _resolveComponent = isUnresolvableTag(renderTag) ? (component2) => component2 : resolveComponent2;
  if (dangerousTags.includes(renderTag)) {
    return h2(
      "pre",
      { class: "mdc-renderer-dangerous-tag" },
      "<" + renderTag + ">" + nodeTextContent(node) + "</" + renderTag + ">"
    );
  }
  const component = _resolveComponent(renderTag);
  if (typeof component === "object") {
    component.tag = originalTag;
  }
  const props = propsToData(node, documentMeta);
  if (keyInParent) {
    props.key = keyInParent;
  }
  return h2(
    component,
    props,
    _renderSlots(
      node,
      h2,
      {
        documentMeta,
        parentScope: { ...parentScope, ...props },
        resolveComponent: _resolveComponent
      }
    )
  );
}
function _renderSlots(node, h2, options) {
  const { documentMeta, parentScope, resolveComponent: resolveComponent2 } = options;
  const children = node.children || [];
  const slotNodes = children.reduce((data, node2) => {
    if (!isTemplate(node2)) {
      data[DEFAULT_SLOT].children.push(node2);
      return data;
    }
    const slotName = getSlotName(node2);
    data[slotName] = data[slotName] || { props: {}, children: [] };
    if (node2.type === "element") {
      data[slotName].props = node2.props;
      data[slotName].children.push(...node2.children || []);
    }
    return data;
  }, {
    [DEFAULT_SLOT]: { props: {}, children: [] }
  });
  const slots = Object.entries(slotNodes).reduce((slots2, [name, { props, children: children2 }]) => {
    if (!children2.length) {
      return slots2;
    }
    slots2[name] = (data = {}) => {
      const scopedProps = pick(data, Object.keys(props || {}));
      let vNodes = children2.map((child, index2) => {
        return _renderNode(
          child,
          h2,
          {
            documentMeta,
            parentScope: { ...parentScope, ...scopedProps },
            resolveComponent: resolveComponent2
          },
          String(child.props?.key || index2)
        );
      });
      if (props?.unwrap) {
        vNodes = flatUnwrap(vNodes, props.unwrap);
      }
      return mergeTextNodes(vNodes);
    };
    return slots2;
  }, {});
  return slots;
}
function renderBinding(node, h2, documentMeta, parentScope = {}) {
  const data = {
    ...documentMeta.runtimeData,
    ...parentScope,
    $document: documentMeta,
    $doc: documentMeta
  };
  const splitter = /\.|\[(\d+)\]/;
  const keys = node.props?.value.trim().split(splitter).filter(Boolean);
  const value = keys.reduce((data2, key) => {
    if (data2 && key in data2) {
      if (typeof data2[key] === "function") {
        return data2[key]();
      } else {
        return data2[key];
      }
    }
    return void 0;
  }, data);
  const defaultValue = node.props?.defaultValue;
  return h2(Text, value ?? defaultValue ?? "");
}
function propsToData(node, documentMeta) {
  const { tag = "", props = {} } = node;
  return Object.keys(props).reduce(function(data, key) {
    if (key === "__ignoreMap") {
      return data;
    }
    const value = props[key];
    if (rxModel.test(key)) {
      return propsToDataRxModel(key, value, data, documentMeta, { native: nativeInputs.includes(tag) });
    }
    if (key === "v-bind") {
      return propsToDataVBind(key, value, data, documentMeta);
    }
    if (rxOn.test(key)) {
      return propsToDataRxOn(key, value, data, documentMeta);
    }
    if (rxBind.test(key)) {
      return propsToDataRxBind(key, value, data, documentMeta);
    }
    const { attribute } = find(html, key);
    if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      data[attribute] = value.join(" ");
      return data;
    }
    data[attribute] = value;
    return data;
  }, {});
}
function propsToDataRxModel(key, value, data, documentMeta, { native }) {
  const propName = key.match(/^v-model:([^=]+)/)?.[1] || "modelValue";
  const field = native ? "value" : propName;
  const event = native ? "onInput" : `onUpdate:${propName}`;
  data[field] = evalInContext(value, documentMeta.runtimeData);
  data[event] = (e) => {
    documentMeta.updateRuntimeData(value, native ? e.target?.value : e);
  };
  return data;
}
function propsToDataVBind(_key, value, data, documentMeta) {
  const val = evalInContext(value, documentMeta);
  data = Object.assign(data, val);
  return data;
}
function propsToDataRxOn(key, value, data, documentMeta) {
  key = key.replace(rxOn, "");
  data.on = data.on || {};
  data.on[key] = () => evalInContext(value, documentMeta);
  return data;
}
function propsToDataRxBind(key, value, data, documentMeta) {
  key = key.replace(rxBind, "");
  data[key] = evalInContext(value, documentMeta);
  return data;
}
const resolveComponentInstance = (component) => {
  if (typeof component === "string") {
    if (htmlTags.includes(component)) {
      return component;
    }
    const _component = resolveComponent(pascalCase(component), false);
    if (!component || _component?.name === "AsyncComponentWrapper") {
      return _component;
    }
    if (typeof _component === "string") {
      return _component;
    }
    if ("setup" in _component) {
      return defineAsyncComponent(() => new Promise((resolve) => resolve(_component)));
    }
    return _component;
  }
  return component;
};
function evalInContext(code, context) {
  const result = code.split(".").reduce((o, k) => typeof o === "object" ? o[k] : void 0, context);
  return typeof result === "undefined" ? destr(code) : result;
}
function getSlotName(node) {
  let name = "";
  for (const propName of Object.keys(node.props || {})) {
    if (!propName.startsWith("#") && !propName.startsWith("v-slot:")) {
      continue;
    }
    name = propName.split(/[:#]/, 2)[1];
    break;
  }
  return name || DEFAULT_SLOT;
}
function isTemplate(node) {
  return node.tag === "template";
}
function isUnresolvableTag(tag) {
  return specialParentTags.includes(tag);
}
function mergeTextNodes(nodes) {
  const mergedNodes = [];
  for (const node of nodes) {
    const previousNode = mergedNodes[mergedNodes.length - 1];
    if (node.type === Text && previousNode?.type === Text) {
      previousNode.children = previousNode.children + node.children;
    } else {
      mergedNodes.push(node);
    }
  }
  return mergedNodes;
}
async function resolveContentComponents(body, meta) {
  if (!body) {
    return;
  }
  const components = Array.from(new Set(loadComponents(body, meta)));
  await Promise.all(components.map(async (c) => {
    if (c?.render || c?.ssrRender || c?.__ssrInlineRender) {
      return;
    }
    const resolvedComponent = resolveComponentInstance(c);
    if (resolvedComponent?.__asyncLoader && !resolvedComponent.__asyncResolved) {
      await resolvedComponent.__asyncLoader();
    }
  }));
  function loadComponents(node, documentMeta) {
    const tag = node.tag;
    if (node.type === "text" || tag === "binding" || node.type === "comment") {
      return [];
    }
    const renderTag = findMappedTag(node, documentMeta.tags);
    if (isUnresolvableTag(renderTag)) {
      return [];
    }
    const components2 = [];
    if (node.type !== "root" && !htmlTags.includes(renderTag)) {
      components2.push(renderTag);
    }
    for (const child of node.children || []) {
      components2.push(...loadComponents(child, documentMeta));
    }
    return components2;
  }
}
function findMappedTag(node, tags) {
  const tag = node.tag;
  if (!tag || typeof node.props?.__ignoreMap !== "undefined") {
    return tag;
  }
  return tags[tag] || tags[pascalCase(tag)] || tags[kebabCase(node.tag)] || tag;
}
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxtjs+mdc@0.18.2_magicast@0.5.1/node_modules/@nuxtjs/mdc/dist/runtime/components/MDCRenderer.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$8, { __name: "MDCRenderer" });
const _sfc_main$7 = {
  __name: "MDC",
  __ssrInlineRender: true,
  props: {
    tag: {
      type: [String, Boolean],
      default: "div"
    },
    /**
     * Raw markdown string or parsed markdown object from `parseMarkdown`
     */
    value: {
      type: [String, Object],
      required: true
    },
    /**
     * Render only the excerpt
     */
    excerpt: {
      type: Boolean,
      default: false
    },
    /**
     * Options for `parseMarkdown`
     */
    parserOptions: {
      type: Object,
      default: () => ({})
    },
    /**
     * Class to be applied to the root element
     */
    class: {
      type: [String, Array, Object],
      default: ""
    },
    /**
     * Tags to unwrap separated by spaces
     * Example: 'ul li'
     */
    unwrap: {
      type: [Boolean, String],
      default: false
    },
    /**
     * Async Data Unique Key
     * @default `hash(props.value)`
     */
    cacheKey: {
      type: String,
      default: void 0
    },
    /**
     * Partial parsing (if partial is `true`, title and toc generation will not be generated)
     */
    partial: {
      type: Boolean,
      default: true
    }
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const key = computed(() => props.cacheKey ?? hashString(props.value));
    const { data, refresh, error } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(key.value, async () => {
      if (typeof props.value !== "string") {
        return props.value;
      }
      const { parseMarkdown } = await import('./index-CBIZVBnh.mjs');
      return await parseMarkdown(props.value, {
        ...props.parserOptions,
        toc: props.partial ? false : props.parserOptions?.toc,
        contentHeading: props.partial ? false : props.parserOptions?.contentHeading
      });
    }, "$5ex2Z7sIc0")), __temp = await __temp, __restore(), __temp);
    const body = computed(() => props.excerpt ? data.value?.excerpt : data.value?.body);
    watch(() => props.value, () => {
      refresh();
    });
    function hashString(str) {
      if (typeof str !== "string") {
        str = JSON.stringify(str || "");
      }
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 6) - hash + char;
        hash = hash & hash;
      }
      return `mdc-${hash === 0 ? "0000" : hash.toString(36)}-key`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MDCRenderer = __nuxt_component_0;
      ssrRenderSlot(_ctx.$slots, "default", {
        data: unref(data)?.data,
        body: unref(data)?.body,
        toc: unref(data)?.toc,
        excerpt: unref(data)?.excerpt,
        error: unref(error)
      }, () => {
        if (body.value) {
          _push(ssrRenderComponent(_component_MDCRenderer, {
            tag: props.tag,
            class: props.class,
            body: body.value,
            data: unref(data)?.data,
            unwrap: props.unwrap
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
      }, _push, _parent);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxtjs+mdc@0.18.2_magicast@0.5.1/node_modules/@nuxtjs/mdc/dist/runtime/components/MDC.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const theme$5 = {
  "slots": {
    "root": "relative",
    "wrapper": "",
    "leading": "inline-flex items-center justify-center",
    "leadingIcon": "size-5 shrink-0 text-primary",
    "title": "text-base text-pretty font-semibold text-highlighted",
    "description": "text-[15px] text-pretty text-muted"
  },
  "variants": {
    "orientation": {
      "horizontal": {
        "root": "flex items-start gap-2.5",
        "leading": "p-0.5"
      },
      "vertical": {
        "leading": "mb-2.5"
      }
    },
    "title": {
      "true": {
        "description": "mt-1"
      }
    }
  }
};
const _sfc_main$6 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "UPageFeature",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    icon: { type: [String, Object], required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    orientation: { type: null, required: false, default: "horizontal" },
    to: { type: null, required: false },
    target: { type: [String, Object, null], required: false },
    onClick: { type: Function, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme$5), ...appConfig.ui?.pageFeature || {} })({
      orientation: props.orientation,
      title: !!props.title || !!slots.title
    }));
    const ariaLabel = computed(() => {
      const slotText = slots.title && getSlotChildrenText(slots.title());
      return (slotText || props.title || "Feature link").trim();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-orientation": __props.orientation,
        class: ui.value.root({ class: [props.ui?.root, props.class] }),
        onClick: __props.onClick
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (__props.icon || !!slots.leading) {
              _push2(`<div class="${ssrRenderClass(ui.value.leading({ class: props.ui?.leading }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => {
                if (__props.icon) {
                  _push2(ssrRenderComponent(_sfc_main$v, {
                    name: __props.icon,
                    class: ui.value.leadingIcon({ class: props.ui?.leadingIcon })
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="${ssrRenderClass(ui.value.wrapper({ class: props.ui?.wrapper }))}"${_scopeId}>`);
            if (__props.to) {
              _push2(ssrRenderComponent(_sfc_main$q, mergeProps({ "aria-label": ariaLabel.value }, { to: __props.to, target: __props.target, ..._ctx.$attrs }, {
                class: "focus:outline-none peer",
                tabindex: "-1",
                raw: ""
              }), {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<span class="absolute inset-0" aria-hidden="true"${_scopeId2}></span>`);
                  } else {
                    return [
                      createVNode("span", {
                        class: "absolute inset-0",
                        "aria-hidden": "true"
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            ssrRenderSlot(_ctx.$slots, "default", {}, () => {
              if (__props.title || !!slots.title) {
                _push2(`<div class="${ssrRenderClass(ui.value.title({ class: props.ui?.title }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "title", {}, () => {
                  _push2(`${ssrInterpolate(__props.title)}`);
                }, _push2, _parent2, _scopeId);
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              if (__props.description || !!slots.description) {
                _push2(`<div class="${ssrRenderClass(ui.value.description({ class: props.ui?.description }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "description", {}, () => {
                  _push2(`${ssrInterpolate(__props.description)}`);
                }, _push2, _parent2, _scopeId);
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
            _push2(`</div>`);
          } else {
            return [
              __props.icon || !!slots.leading ? (openBlock(), createBlock("div", {
                key: 0,
                class: ui.value.leading({ class: props.ui?.leading })
              }, [
                renderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => [
                  __props.icon ? (openBlock(), createBlock(_sfc_main$v, {
                    key: 0,
                    name: __props.icon,
                    class: ui.value.leadingIcon({ class: props.ui?.leadingIcon })
                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                ])
              ], 2)) : createCommentVNode("", true),
              createVNode("div", {
                class: ui.value.wrapper({ class: props.ui?.wrapper })
              }, [
                __props.to ? (openBlock(), createBlock(_sfc_main$q, mergeProps({
                  key: 0,
                  "aria-label": ariaLabel.value
                }, { to: __props.to, target: __props.target, ..._ctx.$attrs }, {
                  class: "focus:outline-none peer",
                  tabindex: "-1",
                  raw: ""
                }), {
                  default: withCtx(() => [
                    createVNode("span", {
                      class: "absolute inset-0",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }, 16, ["aria-label"])) : createCommentVNode("", true),
                renderSlot(_ctx.$slots, "default", {}, () => [
                  __props.title || !!slots.title ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: ui.value.title({ class: props.ui?.title })
                  }, [
                    renderSlot(_ctx.$slots, "title", {}, () => [
                      createTextVNode(toDisplayString(__props.title), 1)
                    ])
                  ], 2)) : createCommentVNode("", true),
                  __props.description || !!slots.description ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: ui.value.description({ class: props.ui?.description })
                  }, [
                    renderSlot(_ctx.$slots, "description", {}, () => [
                      createTextVNode(toDisplayString(__props.description), 1)
                    ])
                  ], 2)) : createCommentVNode("", true)
                ])
              ], 2)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/PageFeature.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const theme$4 = {
  "slots": {
    "root": "relative isolate",
    "container": "flex flex-col lg:grid py-16 sm:py-24 lg:py-32 gap-8 sm:gap-16",
    "wrapper": "",
    "header": "",
    "leading": "flex items-center mb-6",
    "leadingIcon": "size-10 shrink-0 text-primary",
    "headline": "mb-3",
    "title": "text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted",
    "description": "text-base sm:text-lg text-muted",
    "body": "mt-8",
    "features": "grid",
    "footer": "mt-8",
    "links": "flex flex-wrap gap-x-6 gap-y-3"
  },
  "variants": {
    "orientation": {
      "horizontal": {
        "container": "lg:grid-cols-2 lg:items-center",
        "description": "text-pretty",
        "features": "gap-4"
      },
      "vertical": {
        "container": "",
        "headline": "justify-center",
        "leading": "justify-center",
        "title": "text-center",
        "description": "text-center text-balance",
        "links": "justify-center",
        "features": "sm:grid-cols-2 lg:grid-cols-3 gap-8"
      }
    },
    "reverse": {
      "true": {
        "wrapper": "lg:order-last"
      }
    },
    "headline": {
      "true": {
        "headline": "font-semibold text-primary flex items-center gap-1.5"
      }
    },
    "title": {
      "true": {
        "description": "mt-6"
      }
    },
    "description": {
      "true": ""
    },
    "body": {
      "true": ""
    }
  },
  "compoundVariants": [
    {
      "orientation": "vertical",
      "title": true,
      "class": {
        "body": "mt-16"
      }
    },
    {
      "orientation": "vertical",
      "description": true,
      "class": {
        "body": "mt-16"
      }
    },
    {
      "orientation": "vertical",
      "body": true,
      "class": {
        "footer": "mt-16"
      }
    }
  ]
};
const _sfc_main$5 = {
  __name: "UPageSection",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false, default: "section" },
    headline: { type: String, required: false },
    icon: { type: [String, Object], required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    links: { type: Array, required: false },
    features: { type: Array, required: false },
    orientation: { type: null, required: false, default: "vertical" },
    reverse: { type: Boolean, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme$4), ...appConfig.ui?.pageSection || {} })({
      orientation: props.orientation,
      reverse: props.reverse,
      title: !!props.title || !!slots.title,
      description: !!props.description || !!slots.description,
      body: !!slots.body || (!!props.features?.length || !!slots.features)
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-orientation": __props.orientation,
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "top", {}, null, _push2, _parent2, _scopeId);
            _push2(ssrRenderComponent(_sfc_main$j, {
              class: ui.value.container({ class: props.ui?.container })
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (!!slots.header || (__props.icon || !!slots.leading) || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.body || (__props.features?.length || !!slots.features) || !!slots.footer || (__props.links?.length || !!slots.links)) {
                    _push3(`<div class="${ssrRenderClass(ui.value.wrapper({ class: props.ui?.wrapper }))}"${_scopeId2}>`);
                    if (!!slots.header || (__props.icon || !!slots.leading) || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description)) {
                      _push3(`<div class="${ssrRenderClass(ui.value.header({ class: props.ui?.header }))}"${_scopeId2}>`);
                      ssrRenderSlot(_ctx.$slots, "header", {}, () => {
                        if (__props.icon || !!slots.leading) {
                          _push3(`<div class="${ssrRenderClass(ui.value.leading({ class: props.ui?.leading }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => {
                            if (__props.icon) {
                              _push3(ssrRenderComponent(_sfc_main$v, {
                                name: __props.icon,
                                class: ui.value.leadingIcon({ class: props.ui?.leadingIcon })
                              }, null, _parent3, _scopeId2));
                            } else {
                              _push3(`<!---->`);
                            }
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        if (__props.headline || !!slots.headline) {
                          _push3(`<div class="${ssrRenderClass(ui.value.headline({ class: props.ui?.headline, headline: !slots.headline }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "headline", {}, () => {
                            _push3(`${ssrInterpolate(__props.headline)}`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        if (__props.title || !!slots.title) {
                          _push3(`<h2 class="${ssrRenderClass(ui.value.title({ class: props.ui?.title }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "title", {}, () => {
                            _push3(`${ssrInterpolate(__props.title)}`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</h2>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        if (__props.description || !!slots.description) {
                          _push3(`<div class="${ssrRenderClass(ui.value.description({ class: props.ui?.description }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "description", {}, () => {
                            _push3(`${ssrInterpolate(__props.description)}`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      }, _push3, _parent3, _scopeId2);
                      _push3(`</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (!!slots.body || (__props.features?.length || !!slots.features)) {
                      _push3(`<div class="${ssrRenderClass(ui.value.body({ class: props.ui?.body }))}"${_scopeId2}>`);
                      ssrRenderSlot(_ctx.$slots, "body", {}, () => {
                        if (__props.features?.length || !!slots.features) {
                          _push3(`<ul class="${ssrRenderClass(ui.value.features({ class: props.ui?.features }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "features", {}, () => {
                            _push3(`<!--[-->`);
                            ssrRenderList(__props.features, (feature, index2) => {
                              _push3(ssrRenderComponent(_sfc_main$6, mergeProps({
                                key: index2,
                                as: "li"
                              }, { ref_for: true }, feature), null, _parent3, _scopeId2));
                            });
                            _push3(`<!--]-->`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</ul>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      }, _push3, _parent3, _scopeId2);
                      _push3(`</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (!!slots.footer || (__props.links?.length || !!slots.links)) {
                      _push3(`<div class="${ssrRenderClass(ui.value.footer({ class: props.ui?.footer }))}"${_scopeId2}>`);
                      ssrRenderSlot(_ctx.$slots, "footer", {}, () => {
                        if (__props.links?.length || !!slots.links) {
                          _push3(`<div class="${ssrRenderClass(ui.value.links({ class: props.ui?.links }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "links", {}, () => {
                            _push3(`<!--[-->`);
                            ssrRenderList(__props.links, (link, index2) => {
                              _push3(ssrRenderComponent(_sfc_main$p, mergeProps({
                                key: index2,
                                size: "lg"
                              }, { ref_for: true }, link), null, _parent3, _scopeId2));
                            });
                            _push3(`<!--]-->`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      }, _push3, _parent3, _scopeId2);
                      _push3(`</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (!!slots.default) {
                    ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
                  } else if (__props.orientation === "horizontal") {
                    _push3(`<div class="hidden lg:block"${_scopeId2}></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    !!slots.header || (__props.icon || !!slots.leading) || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.body || (__props.features?.length || !!slots.features) || !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: ui.value.wrapper({ class: props.ui?.wrapper })
                    }, [
                      !!slots.header || (__props.icon || !!slots.leading) || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: ui.value.header({ class: props.ui?.header })
                      }, [
                        renderSlot(_ctx.$slots, "header", {}, () => [
                          __props.icon || !!slots.leading ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: ui.value.leading({ class: props.ui?.leading })
                          }, [
                            renderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => [
                              __props.icon ? (openBlock(), createBlock(_sfc_main$v, {
                                key: 0,
                                name: __props.icon,
                                class: ui.value.leadingIcon({ class: props.ui?.leadingIcon })
                              }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                            ])
                          ], 2)) : createCommentVNode("", true),
                          __props.headline || !!slots.headline ? (openBlock(), createBlock("div", {
                            key: 1,
                            class: ui.value.headline({ class: props.ui?.headline, headline: !slots.headline })
                          }, [
                            renderSlot(_ctx.$slots, "headline", {}, () => [
                              createTextVNode(toDisplayString(__props.headline), 1)
                            ])
                          ], 2)) : createCommentVNode("", true),
                          __props.title || !!slots.title ? (openBlock(), createBlock("h2", {
                            key: 2,
                            class: ui.value.title({ class: props.ui?.title })
                          }, [
                            renderSlot(_ctx.$slots, "title", {}, () => [
                              createTextVNode(toDisplayString(__props.title), 1)
                            ])
                          ], 2)) : createCommentVNode("", true),
                          __props.description || !!slots.description ? (openBlock(), createBlock("div", {
                            key: 3,
                            class: ui.value.description({ class: props.ui?.description })
                          }, [
                            renderSlot(_ctx.$slots, "description", {}, () => [
                              createTextVNode(toDisplayString(__props.description), 1)
                            ])
                          ], 2)) : createCommentVNode("", true)
                        ])
                      ], 2)) : createCommentVNode("", true),
                      !!slots.body || (__props.features?.length || !!slots.features) ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: ui.value.body({ class: props.ui?.body })
                      }, [
                        renderSlot(_ctx.$slots, "body", {}, () => [
                          __props.features?.length || !!slots.features ? (openBlock(), createBlock("ul", {
                            key: 0,
                            class: ui.value.features({ class: props.ui?.features })
                          }, [
                            renderSlot(_ctx.$slots, "features", {}, () => [
                              (openBlock(true), createBlock(Fragment, null, renderList(__props.features, (feature, index2) => {
                                return openBlock(), createBlock(_sfc_main$6, mergeProps({
                                  key: index2,
                                  as: "li"
                                }, { ref_for: true }, feature), null, 16);
                              }), 128))
                            ])
                          ], 2)) : createCommentVNode("", true)
                        ])
                      ], 2)) : createCommentVNode("", true),
                      !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                        key: 2,
                        class: ui.value.footer({ class: props.ui?.footer })
                      }, [
                        renderSlot(_ctx.$slots, "footer", {}, () => [
                          __props.links?.length || !!slots.links ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: ui.value.links({ class: props.ui?.links })
                          }, [
                            renderSlot(_ctx.$slots, "links", {}, () => [
                              (openBlock(true), createBlock(Fragment, null, renderList(__props.links, (link, index2) => {
                                return openBlock(), createBlock(_sfc_main$p, mergeProps({
                                  key: index2,
                                  size: "lg"
                                }, { ref_for: true }, link), null, 16);
                              }), 128))
                            ])
                          ], 2)) : createCommentVNode("", true)
                        ])
                      ], 2)) : createCommentVNode("", true)
                    ], 2)) : createCommentVNode("", true),
                    !!slots.default ? renderSlot(_ctx.$slots, "default", { key: 1 }) : __props.orientation === "horizontal" ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "hidden lg:block"
                    })) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
            ssrRenderSlot(_ctx.$slots, "bottom", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "top"),
              createVNode(_sfc_main$j, {
                class: ui.value.container({ class: props.ui?.container })
              }, {
                default: withCtx(() => [
                  !!slots.header || (__props.icon || !!slots.leading) || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.body || (__props.features?.length || !!slots.features) || !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: ui.value.wrapper({ class: props.ui?.wrapper })
                  }, [
                    !!slots.header || (__props.icon || !!slots.leading) || (__props.headline || !!slots.headline) || (__props.title || !!slots.title) || (__props.description || !!slots.description) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: ui.value.header({ class: props.ui?.header })
                    }, [
                      renderSlot(_ctx.$slots, "header", {}, () => [
                        __props.icon || !!slots.leading ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: ui.value.leading({ class: props.ui?.leading })
                        }, [
                          renderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => [
                            __props.icon ? (openBlock(), createBlock(_sfc_main$v, {
                              key: 0,
                              name: __props.icon,
                              class: ui.value.leadingIcon({ class: props.ui?.leadingIcon })
                            }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                          ])
                        ], 2)) : createCommentVNode("", true),
                        __props.headline || !!slots.headline ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: ui.value.headline({ class: props.ui?.headline, headline: !slots.headline })
                        }, [
                          renderSlot(_ctx.$slots, "headline", {}, () => [
                            createTextVNode(toDisplayString(__props.headline), 1)
                          ])
                        ], 2)) : createCommentVNode("", true),
                        __props.title || !!slots.title ? (openBlock(), createBlock("h2", {
                          key: 2,
                          class: ui.value.title({ class: props.ui?.title })
                        }, [
                          renderSlot(_ctx.$slots, "title", {}, () => [
                            createTextVNode(toDisplayString(__props.title), 1)
                          ])
                        ], 2)) : createCommentVNode("", true),
                        __props.description || !!slots.description ? (openBlock(), createBlock("div", {
                          key: 3,
                          class: ui.value.description({ class: props.ui?.description })
                        }, [
                          renderSlot(_ctx.$slots, "description", {}, () => [
                            createTextVNode(toDisplayString(__props.description), 1)
                          ])
                        ], 2)) : createCommentVNode("", true)
                      ])
                    ], 2)) : createCommentVNode("", true),
                    !!slots.body || (__props.features?.length || !!slots.features) ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: ui.value.body({ class: props.ui?.body })
                    }, [
                      renderSlot(_ctx.$slots, "body", {}, () => [
                        __props.features?.length || !!slots.features ? (openBlock(), createBlock("ul", {
                          key: 0,
                          class: ui.value.features({ class: props.ui?.features })
                        }, [
                          renderSlot(_ctx.$slots, "features", {}, () => [
                            (openBlock(true), createBlock(Fragment, null, renderList(__props.features, (feature, index2) => {
                              return openBlock(), createBlock(_sfc_main$6, mergeProps({
                                key: index2,
                                as: "li"
                              }, { ref_for: true }, feature), null, 16);
                            }), 128))
                          ])
                        ], 2)) : createCommentVNode("", true)
                      ])
                    ], 2)) : createCommentVNode("", true),
                    !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: ui.value.footer({ class: props.ui?.footer })
                    }, [
                      renderSlot(_ctx.$slots, "footer", {}, () => [
                        __props.links?.length || !!slots.links ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: ui.value.links({ class: props.ui?.links })
                        }, [
                          renderSlot(_ctx.$slots, "links", {}, () => [
                            (openBlock(true), createBlock(Fragment, null, renderList(__props.links, (link, index2) => {
                              return openBlock(), createBlock(_sfc_main$p, mergeProps({
                                key: index2,
                                size: "lg"
                              }, { ref_for: true }, link), null, 16);
                            }), 128))
                          ])
                        ], 2)) : createCommentVNode("", true)
                      ])
                    ], 2)) : createCommentVNode("", true)
                  ], 2)) : createCommentVNode("", true),
                  !!slots.default ? renderSlot(_ctx.$slots, "default", { key: 1 }) : __props.orientation === "horizontal" ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "hidden lg:block"
                  })) : createCommentVNode("", true)
                ]),
                _: 3
              }, 8, ["class"]),
              renderSlot(_ctx.$slots, "bottom")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/PageSection.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const theme$3 = {
  "slots": {
    "root": "relative flex rounded-lg",
    "spotlight": "absolute inset-0 rounded-[inherit] pointer-events-none bg-default/90",
    "container": "relative flex flex-col flex-1 lg:grid gap-x-8 gap-y-4 p-4 sm:p-6",
    "wrapper": "flex flex-col flex-1 items-start",
    "header": "mb-4",
    "body": "flex-1",
    "footer": "pt-4 mt-auto",
    "leading": "inline-flex items-center mb-2.5",
    "leadingIcon": "size-5 shrink-0 text-primary",
    "title": "text-base text-pretty font-semibold text-highlighted",
    "description": "text-[15px] text-pretty"
  },
  "variants": {
    "orientation": {
      "horizontal": {
        "container": "lg:grid-cols-2 lg:items-center"
      },
      "vertical": {
        "container": ""
      }
    },
    "reverse": {
      "true": {
        "wrapper": "lg:order-last"
      }
    },
    "variant": {
      "solid": {
        "root": "bg-inverted text-inverted",
        "title": "text-inverted",
        "description": "text-dimmed"
      },
      "outline": {
        "root": "bg-default ring ring-default",
        "description": "text-muted"
      },
      "soft": {
        "root": "bg-elevated/50",
        "description": "text-toned"
      },
      "subtle": {
        "root": "bg-elevated/50 ring ring-default",
        "description": "text-toned"
      },
      "ghost": {
        "description": "text-muted"
      },
      "naked": {
        "container": "p-0 sm:p-0",
        "description": "text-muted"
      }
    },
    "to": {
      "true": {
        "root": [
          "transition"
        ]
      }
    },
    "title": {
      "true": {
        "description": "mt-1"
      }
    },
    "highlight": {
      "true": {
        "root": "ring-2"
      }
    },
    "highlightColor": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "spotlight": {
      "true": {
        "root": "[--spotlight-size:400px] before:absolute before:-inset-px before:pointer-events-none before:rounded-[inherit] before:bg-[radial-gradient(var(--spotlight-size)_var(--spotlight-size)_at_calc(var(--spotlight-x,0px))_calc(var(--spotlight-y,0px)),var(--spotlight-color),transparent_70%)]"
      }
    },
    "spotlightColor": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    }
  },
  "compoundVariants": [
    {
      "variant": "solid",
      "to": true,
      "class": {
        "root": "hover:bg-inverted/90"
      }
    },
    {
      "variant": "outline",
      "to": true,
      "class": {
        "root": "hover:bg-elevated/50"
      }
    },
    {
      "variant": "soft",
      "to": true,
      "class": {
        "root": "hover:bg-elevated"
      }
    },
    {
      "variant": "subtle",
      "to": true,
      "class": {
        "root": "hover:bg-elevated"
      }
    },
    {
      "variant": "subtle",
      "to": true,
      "highlight": false,
      "class": {
        "root": "hover:ring-accented"
      }
    },
    {
      "variant": "ghost",
      "to": true,
      "class": {
        "root": "hover:bg-elevated/50"
      }
    },
    {
      "highlightColor": "primary",
      "highlight": true,
      "class": {
        "root": "ring-primary"
      }
    },
    {
      "highlightColor": "secondary",
      "highlight": true,
      "class": {
        "root": "ring-secondary"
      }
    },
    {
      "highlightColor": "success",
      "highlight": true,
      "class": {
        "root": "ring-success"
      }
    },
    {
      "highlightColor": "info",
      "highlight": true,
      "class": {
        "root": "ring-info"
      }
    },
    {
      "highlightColor": "warning",
      "highlight": true,
      "class": {
        "root": "ring-warning"
      }
    },
    {
      "highlightColor": "error",
      "highlight": true,
      "class": {
        "root": "ring-error"
      }
    },
    {
      "highlightColor": "neutral",
      "highlight": true,
      "class": {
        "root": "ring-inverted"
      }
    },
    {
      "spotlightColor": "primary",
      "spotlight": true,
      "class": {
        "root": "[--spotlight-color:var(--ui-primary)]"
      }
    },
    {
      "spotlightColor": "secondary",
      "spotlight": true,
      "class": {
        "root": "[--spotlight-color:var(--ui-secondary)]"
      }
    },
    {
      "spotlightColor": "success",
      "spotlight": true,
      "class": {
        "root": "[--spotlight-color:var(--ui-success)]"
      }
    },
    {
      "spotlightColor": "info",
      "spotlight": true,
      "class": {
        "root": "[--spotlight-color:var(--ui-info)]"
      }
    },
    {
      "spotlightColor": "warning",
      "spotlight": true,
      "class": {
        "root": "[--spotlight-color:var(--ui-warning)]"
      }
    },
    {
      "spotlightColor": "error",
      "spotlight": true,
      "class": {
        "root": "[--spotlight-color:var(--ui-error)]"
      }
    },
    {
      "spotlightColor": "neutral",
      "spotlight": true,
      "class": {
        "root": "[--spotlight-color:var(--ui-bg-inverted)]"
      }
    },
    {
      "to": true,
      "class": {
        "root": "has-focus-visible:ring-2 has-focus-visible:ring-primary"
      }
    }
  ],
  "defaultVariants": {
    "variant": "outline",
    "highlightColor": "primary",
    "spotlightColor": "primary"
  }
};
const _sfc_main$4 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "UPageCard",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    icon: { type: [String, Object], required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    orientation: { type: null, required: false, default: "vertical" },
    reverse: { type: Boolean, required: false },
    highlight: { type: Boolean, required: false },
    highlightColor: { type: null, required: false },
    spotlight: { type: Boolean, required: false },
    spotlightColor: { type: null, required: false },
    variant: { type: null, required: false },
    to: { type: null, required: false },
    target: { type: [String, Object, null], required: false },
    onClick: { type: Function, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const cardRef = ref();
    const motionControl = pausableFilter();
    const appConfig = useAppConfig();
    const { elementX, elementY } = useMouseInElement(cardRef, {
      eventFilter: motionControl.eventFilter
    });
    const spotlight = computed(() => props.spotlight && (elementX.value !== 0 || elementY.value !== 0));
    watch(() => props.spotlight, (value) => {
      if (value) {
        motionControl.resume();
      } else {
        motionControl.pause();
      }
    }, { immediate: true });
    const ui = computed(() => tv({ extend: tv(theme$3), ...appConfig.ui?.pageCard || {} })({
      orientation: props.orientation,
      reverse: props.reverse,
      variant: props.variant,
      to: !!props.to || !!props.onClick,
      title: !!props.title || !!slots.title,
      highlight: props.highlight,
      highlightColor: props.highlightColor,
      spotlight: spotlight.value,
      spotlightColor: props.spotlightColor
    }));
    const ariaLabel = computed(() => {
      const slotText = slots.title && getSlotChildrenText(slots.title());
      return (slotText || props.title || "Card link").trim();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        ref_key: "cardRef",
        ref: cardRef,
        as: __props.as,
        "data-orientation": __props.orientation,
        class: ui.value.root({ class: [props.ui?.root, props.class] }),
        style: spotlight.value && { "--spotlight-x": `${unref(elementX)}px`, "--spotlight-y": `${unref(elementY)}px` },
        onClick: __props.onClick
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (props.spotlight) {
              _push2(`<div class="${ssrRenderClass(ui.value.spotlight({ class: props.ui?.spotlight }))}"${_scopeId}></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="${ssrRenderClass(ui.value.container({ class: props.ui?.container }))}"${_scopeId}>`);
            if (!!slots.header || (__props.icon || !!slots.leading) || !!slots.body || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.footer) {
              _push2(`<div class="${ssrRenderClass(ui.value.wrapper({ class: props.ui?.wrapper }))}"${_scopeId}>`);
              if (!!slots.header) {
                _push2(`<div class="${ssrRenderClass(ui.value.header({ class: props.ui?.header }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "header", {}, null, _push2, _parent2, _scopeId);
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              if (__props.icon || !!slots.leading) {
                _push2(`<div class="${ssrRenderClass(ui.value.leading({ class: props.ui?.leading }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => {
                  if (__props.icon) {
                    _push2(ssrRenderComponent(_sfc_main$v, {
                      name: __props.icon,
                      class: ui.value.leadingIcon({ class: props.ui?.leadingIcon })
                    }, null, _parent2, _scopeId));
                  } else {
                    _push2(`<!---->`);
                  }
                }, _push2, _parent2, _scopeId);
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              if (!!slots.body || (__props.title || !!slots.title) || (__props.description || !!slots.description)) {
                _push2(`<div class="${ssrRenderClass(ui.value.body({ class: props.ui?.body }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "body", {}, () => {
                  if (__props.title || !!slots.title) {
                    _push2(`<div class="${ssrRenderClass(ui.value.title({ class: props.ui?.title }))}"${_scopeId}>`);
                    ssrRenderSlot(_ctx.$slots, "title", {}, () => {
                      _push2(`${ssrInterpolate(__props.title)}`);
                    }, _push2, _parent2, _scopeId);
                    _push2(`</div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (__props.description || !!slots.description) {
                    _push2(`<div class="${ssrRenderClass(ui.value.description({ class: props.ui?.description }))}"${_scopeId}>`);
                    ssrRenderSlot(_ctx.$slots, "description", {}, () => {
                      _push2(`${ssrInterpolate(__props.description)}`);
                    }, _push2, _parent2, _scopeId);
                    _push2(`</div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                }, _push2, _parent2, _scopeId);
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              if (!!slots.footer) {
                _push2(`<div class="${ssrRenderClass(ui.value.footer({ class: props.ui?.footer }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push2, _parent2, _scopeId);
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            _push2(`</div>`);
            if (__props.to) {
              _push2(ssrRenderComponent(_sfc_main$q, mergeProps({ "aria-label": ariaLabel.value }, { to: __props.to, target: __props.target, ..._ctx.$attrs }, {
                class: "focus:outline-none peer",
                raw: ""
              }), {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<span class="absolute inset-0" aria-hidden="true"${_scopeId2}></span>`);
                  } else {
                    return [
                      createVNode("span", {
                        class: "absolute inset-0",
                        "aria-hidden": "true"
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              props.spotlight ? (openBlock(), createBlock("div", {
                key: 0,
                class: ui.value.spotlight({ class: props.ui?.spotlight })
              }, null, 2)) : createCommentVNode("", true),
              createVNode("div", {
                class: ui.value.container({ class: props.ui?.container })
              }, [
                !!slots.header || (__props.icon || !!slots.leading) || !!slots.body || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.footer ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: ui.value.wrapper({ class: props.ui?.wrapper })
                }, [
                  !!slots.header ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: ui.value.header({ class: props.ui?.header })
                  }, [
                    renderSlot(_ctx.$slots, "header")
                  ], 2)) : createCommentVNode("", true),
                  __props.icon || !!slots.leading ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: ui.value.leading({ class: props.ui?.leading })
                  }, [
                    renderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => [
                      __props.icon ? (openBlock(), createBlock(_sfc_main$v, {
                        key: 0,
                        name: __props.icon,
                        class: ui.value.leadingIcon({ class: props.ui?.leadingIcon })
                      }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                    ])
                  ], 2)) : createCommentVNode("", true),
                  !!slots.body || (__props.title || !!slots.title) || (__props.description || !!slots.description) ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: ui.value.body({ class: props.ui?.body })
                  }, [
                    renderSlot(_ctx.$slots, "body", {}, () => [
                      __props.title || !!slots.title ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: ui.value.title({ class: props.ui?.title })
                      }, [
                        renderSlot(_ctx.$slots, "title", {}, () => [
                          createTextVNode(toDisplayString(__props.title), 1)
                        ])
                      ], 2)) : createCommentVNode("", true),
                      __props.description || !!slots.description ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: ui.value.description({ class: props.ui?.description })
                      }, [
                        renderSlot(_ctx.$slots, "description", {}, () => [
                          createTextVNode(toDisplayString(__props.description), 1)
                        ])
                      ], 2)) : createCommentVNode("", true)
                    ])
                  ], 2)) : createCommentVNode("", true),
                  !!slots.footer ? (openBlock(), createBlock("div", {
                    key: 3,
                    class: ui.value.footer({ class: props.ui?.footer })
                  }, [
                    renderSlot(_ctx.$slots, "footer")
                  ], 2)) : createCommentVNode("", true)
                ], 2)) : createCommentVNode("", true),
                renderSlot(_ctx.$slots, "default")
              ], 2),
              __props.to ? (openBlock(), createBlock(_sfc_main$q, mergeProps({
                key: 1,
                "aria-label": ariaLabel.value
              }, { to: __props.to, target: __props.target, ..._ctx.$attrs }, {
                class: "focus:outline-none peer",
                raw: ""
              }), {
                default: withCtx(() => [
                  createVNode("span", {
                    class: "absolute inset-0",
                    "aria-hidden": "true"
                  })
                ]),
                _: 1
              }, 16, ["aria-label"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/PageCard.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const theme$2 = {
  "base": "relative column-1 md:columns-2 lg:columns-3 gap-8 space-y-8 *:break-inside-avoid-column *:will-change-transform"
};
const _sfc_main$3 = {
  __name: "UPageColumns",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    class: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme$2), ...appConfig.ui?.pageColumns || {} }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        class: ui.value({ class: props.class })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/PageColumns.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const theme$1 = {
  "slots": {
    "root": "relative group/user",
    "wrapper": "",
    "name": "font-medium",
    "description": "text-muted",
    "avatar": "shrink-0"
  },
  "variants": {
    "orientation": {
      "horizontal": {
        "root": "flex items-center"
      },
      "vertical": {
        "root": "flex flex-col"
      }
    },
    "to": {
      "true": {
        "name": [
          "text-default peer-hover:text-highlighted",
          "transition-colors"
        ],
        "description": [
          "peer-hover:text-toned",
          "transition-colors"
        ],
        "avatar": "transform transition-transform duration-200 group-hover/user:scale-115"
      },
      "false": {
        "name": "text-highlighted",
        "description": ""
      }
    },
    "size": {
      "3xs": {
        "root": "gap-1",
        "wrapper": "flex items-center gap-1",
        "name": "text-xs",
        "description": "text-xs"
      },
      "2xs": {
        "root": "gap-1.5",
        "wrapper": "flex items-center gap-1.5",
        "name": "text-xs",
        "description": "text-xs"
      },
      "xs": {
        "root": "gap-1.5",
        "wrapper": "flex items-center gap-1.5",
        "name": "text-xs",
        "description": "text-xs"
      },
      "sm": {
        "root": "gap-2",
        "name": "text-xs",
        "description": "text-xs"
      },
      "md": {
        "root": "gap-2",
        "name": "text-sm",
        "description": "text-xs"
      },
      "lg": {
        "root": "gap-2.5",
        "name": "text-sm",
        "description": "text-sm"
      },
      "xl": {
        "root": "gap-2.5",
        "name": "text-base",
        "description": "text-sm"
      },
      "2xl": {
        "root": "gap-3",
        "name": "text-base",
        "description": "text-base"
      },
      "3xl": {
        "root": "gap-3",
        "name": "text-lg",
        "description": "text-base"
      }
    }
  },
  "defaultVariants": {
    "size": "md"
  }
};
const _sfc_main$2 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "UUser",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    name: { type: String, required: false },
    description: { type: String, required: false },
    avatar: { type: Object, required: false },
    chip: { type: [Boolean, Object], required: false },
    size: { type: null, required: false },
    orientation: { type: null, required: false, default: "horizontal" },
    to: { type: null, required: false },
    target: { type: [String, Object, null], required: false },
    onClick: { type: Function, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme$1), ...appConfig.ui?.user || {} })({
      size: props.size,
      orientation: props.orientation,
      to: !!props.to || !!props.onClick
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-orientation": __props.orientation,
        class: ui.value.root({ class: [props.ui?.root, props.class] }),
        onClick: __props.onClick
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "avatar", { ui: ui.value }, () => {
              if (__props.chip && __props.avatar) {
                _push2(ssrRenderComponent(_sfc_main$t, mergeProps({ inset: "" }, typeof __props.chip === "object" ? __props.chip : {}, { size: __props.size }), {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_sfc_main$s, mergeProps({ alt: __props.name }, __props.avatar, {
                        size: __props.size,
                        class: ui.value.avatar({ class: props.ui?.avatar })
                      }), null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_sfc_main$s, mergeProps({ alt: __props.name }, __props.avatar, {
                          size: __props.size,
                          class: ui.value.avatar({ class: props.ui?.avatar })
                        }), null, 16, ["alt", "size", "class"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else if (__props.avatar) {
                _push2(ssrRenderComponent(_sfc_main$s, mergeProps({ alt: __props.name }, __props.avatar, {
                  size: __props.size,
                  class: ui.value.avatar({ class: props.ui?.avatar })
                }), null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
            _push2(`<div class="${ssrRenderClass(ui.value.wrapper({ class: props.ui?.wrapper }))}"${_scopeId}>`);
            if (__props.to) {
              _push2(ssrRenderComponent(_sfc_main$q, mergeProps({ "aria-label": __props.name }, { to: __props.to, target: __props.target, ..._ctx.$attrs }, {
                class: "focus:outline-none peer",
                tabindex: "-1",
                raw: ""
              }), {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<span class="absolute inset-0" aria-hidden="true"${_scopeId2}></span>`);
                  } else {
                    return [
                      createVNode("span", {
                        class: "absolute inset-0",
                        "aria-hidden": "true"
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            ssrRenderSlot(_ctx.$slots, "default", {}, () => {
              if (__props.name || !!slots.name) {
                _push2(`<p class="${ssrRenderClass(ui.value.name({ class: props.ui?.name }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "name", {}, () => {
                  _push2(`${ssrInterpolate(__props.name)}`);
                }, _push2, _parent2, _scopeId);
                _push2(`</p>`);
              } else {
                _push2(`<!---->`);
              }
              if (__props.description || !!slots.description) {
                _push2(`<p class="${ssrRenderClass(ui.value.description({ class: props.ui?.description }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "description", {}, () => {
                  _push2(`${ssrInterpolate(__props.description)}`);
                }, _push2, _parent2, _scopeId);
                _push2(`</p>`);
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
            _push2(`</div>`);
          } else {
            return [
              renderSlot(_ctx.$slots, "avatar", { ui: ui.value }, () => [
                __props.chip && __props.avatar ? (openBlock(), createBlock(_sfc_main$t, mergeProps({
                  key: 0,
                  inset: ""
                }, typeof __props.chip === "object" ? __props.chip : {}, { size: __props.size }), {
                  default: withCtx(() => [
                    createVNode(_sfc_main$s, mergeProps({ alt: __props.name }, __props.avatar, {
                      size: __props.size,
                      class: ui.value.avatar({ class: props.ui?.avatar })
                    }), null, 16, ["alt", "size", "class"])
                  ]),
                  _: 1
                }, 16, ["size"])) : __props.avatar ? (openBlock(), createBlock(_sfc_main$s, mergeProps({
                  key: 1,
                  alt: __props.name
                }, __props.avatar, {
                  size: __props.size,
                  class: ui.value.avatar({ class: props.ui?.avatar })
                }), null, 16, ["alt", "size", "class"])) : createCommentVNode("", true)
              ]),
              createVNode("div", {
                class: ui.value.wrapper({ class: props.ui?.wrapper })
              }, [
                __props.to ? (openBlock(), createBlock(_sfc_main$q, mergeProps({
                  key: 0,
                  "aria-label": __props.name
                }, { to: __props.to, target: __props.target, ..._ctx.$attrs }, {
                  class: "focus:outline-none peer",
                  tabindex: "-1",
                  raw: ""
                }), {
                  default: withCtx(() => [
                    createVNode("span", {
                      class: "absolute inset-0",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }, 16, ["aria-label"])) : createCommentVNode("", true),
                renderSlot(_ctx.$slots, "default", {}, () => [
                  __props.name || !!slots.name ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: ui.value.name({ class: props.ui?.name })
                  }, [
                    renderSlot(_ctx.$slots, "name", {}, () => [
                      createTextVNode(toDisplayString(__props.name), 1)
                    ])
                  ], 2)) : createCommentVNode("", true),
                  __props.description || !!slots.description ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: ui.value.description({ class: props.ui?.description })
                  }, [
                    renderSlot(_ctx.$slots, "description", {}, () => [
                      createTextVNode(toDisplayString(__props.description), 1)
                    ])
                  ], 2)) : createCommentVNode("", true)
                ])
              ], 2)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/User.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const theme = {
  "slots": {
    "root": "relative isolate rounded-xl overflow-hidden",
    "container": "flex flex-col lg:grid px-6 py-12 sm:px-12 sm:py-24 lg:px-16 lg:py-24 gap-8 sm:gap-16",
    "wrapper": "",
    "header": "",
    "title": "text-3xl sm:text-4xl text-pretty tracking-tight font-bold text-highlighted",
    "description": "text-base sm:text-lg text-muted",
    "body": "mt-8",
    "footer": "mt-8",
    "links": "flex flex-wrap gap-x-6 gap-y-3"
  },
  "variants": {
    "orientation": {
      "horizontal": {
        "container": "lg:grid-cols-2 lg:items-center",
        "description": "text-pretty"
      },
      "vertical": {
        "container": "",
        "title": "text-center",
        "description": "text-center text-balance",
        "links": "justify-center"
      }
    },
    "reverse": {
      "true": {
        "wrapper": "lg:order-last"
      }
    },
    "variant": {
      "solid": {
        "root": "bg-inverted text-inverted",
        "title": "text-inverted",
        "description": "text-dimmed"
      },
      "outline": {
        "root": "bg-default ring ring-default",
        "description": "text-muted"
      },
      "soft": {
        "root": "bg-elevated/50",
        "description": "text-toned"
      },
      "subtle": {
        "root": "bg-elevated/50 ring ring-default",
        "description": "text-toned"
      },
      "naked": {
        "description": "text-muted"
      }
    },
    "title": {
      "true": {
        "description": "mt-6"
      }
    }
  },
  "defaultVariants": {
    "variant": "outline"
  }
};
const _sfc_main$1 = {
  __name: "UPageCTA",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    class: { type: null, required: false },
    title: { type: String, required: false },
    description: { type: String, required: false },
    orientation: { type: null, required: false, default: "vertical" },
    reverse: { type: Boolean, required: false, default: false },
    variant: { type: null, required: false },
    links: { type: Array, required: false },
    ui: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.pageCTA || {} })({
      variant: props.variant,
      orientation: props.orientation,
      reverse: props.reverse,
      title: !!props.title || !!slots.title
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-orientation": __props.orientation,
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "top", {}, null, _push2, _parent2, _scopeId);
            _push2(ssrRenderComponent(_sfc_main$j, {
              class: ui.value.container({ class: props.ui?.container })
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (!!slots.header || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.body || !!slots.footer || (__props.links?.length || !!slots.links)) {
                    _push3(`<div class="${ssrRenderClass(ui.value.wrapper({ class: props.ui?.wrapper }))}"${_scopeId2}>`);
                    if (!!slots.header || (__props.title || !!slots.title) || (__props.description || !!slots.description)) {
                      _push3(`<div class="${ssrRenderClass(ui.value.header({ class: props.ui?.header }))}"${_scopeId2}>`);
                      ssrRenderSlot(_ctx.$slots, "header", {}, () => {
                        if (__props.title || !!slots.title) {
                          _push3(`<h2 class="${ssrRenderClass(ui.value.title({ class: props.ui?.title }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "title", {}, () => {
                            _push3(`${ssrInterpolate(__props.title)}`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</h2>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        if (__props.description || !!slots.description) {
                          _push3(`<div class="${ssrRenderClass(ui.value.description({ class: props.ui?.description }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "description", {}, () => {
                            _push3(`${ssrInterpolate(__props.description)}`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      }, _push3, _parent3, _scopeId2);
                      _push3(`</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (!!slots.body) {
                      _push3(`<div class="${ssrRenderClass(ui.value.body({ class: props.ui?.body }))}"${_scopeId2}>`);
                      ssrRenderSlot(_ctx.$slots, "body", {}, null, _push3, _parent3, _scopeId2);
                      _push3(`</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (!!slots.footer || (__props.links?.length || !!slots.links)) {
                      _push3(`<div class="${ssrRenderClass(ui.value.footer({ class: props.ui?.footer }))}"${_scopeId2}>`);
                      ssrRenderSlot(_ctx.$slots, "footer", {}, () => {
                        if (__props.links?.length || !!slots.links) {
                          _push3(`<div class="${ssrRenderClass(ui.value.links({ class: props.ui?.links }))}"${_scopeId2}>`);
                          ssrRenderSlot(_ctx.$slots, "links", {}, () => {
                            _push3(`<!--[-->`);
                            ssrRenderList(__props.links, (link, index2) => {
                              _push3(ssrRenderComponent(_sfc_main$p, mergeProps({
                                key: index2,
                                size: "lg"
                              }, { ref_for: true }, link), null, _parent3, _scopeId2));
                            });
                            _push3(`<!--]-->`);
                          }, _push3, _parent3, _scopeId2);
                          _push3(`</div>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      }, _push3, _parent3, _scopeId2);
                      _push3(`</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (!!slots.default) {
                    ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
                  } else if (__props.orientation === "horizontal") {
                    _push3(`<div class="hidden lg:block"${_scopeId2}></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    !!slots.header || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.body || !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: ui.value.wrapper({ class: props.ui?.wrapper })
                    }, [
                      !!slots.header || (__props.title || !!slots.title) || (__props.description || !!slots.description) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: ui.value.header({ class: props.ui?.header })
                      }, [
                        renderSlot(_ctx.$slots, "header", {}, () => [
                          __props.title || !!slots.title ? (openBlock(), createBlock("h2", {
                            key: 0,
                            class: ui.value.title({ class: props.ui?.title })
                          }, [
                            renderSlot(_ctx.$slots, "title", {}, () => [
                              createTextVNode(toDisplayString(__props.title), 1)
                            ])
                          ], 2)) : createCommentVNode("", true),
                          __props.description || !!slots.description ? (openBlock(), createBlock("div", {
                            key: 1,
                            class: ui.value.description({ class: props.ui?.description })
                          }, [
                            renderSlot(_ctx.$slots, "description", {}, () => [
                              createTextVNode(toDisplayString(__props.description), 1)
                            ])
                          ], 2)) : createCommentVNode("", true)
                        ])
                      ], 2)) : createCommentVNode("", true),
                      !!slots.body ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: ui.value.body({ class: props.ui?.body })
                      }, [
                        renderSlot(_ctx.$slots, "body")
                      ], 2)) : createCommentVNode("", true),
                      !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                        key: 2,
                        class: ui.value.footer({ class: props.ui?.footer })
                      }, [
                        renderSlot(_ctx.$slots, "footer", {}, () => [
                          __props.links?.length || !!slots.links ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: ui.value.links({ class: props.ui?.links })
                          }, [
                            renderSlot(_ctx.$slots, "links", {}, () => [
                              (openBlock(true), createBlock(Fragment, null, renderList(__props.links, (link, index2) => {
                                return openBlock(), createBlock(_sfc_main$p, mergeProps({
                                  key: index2,
                                  size: "lg"
                                }, { ref_for: true }, link), null, 16);
                              }), 128))
                            ])
                          ], 2)) : createCommentVNode("", true)
                        ])
                      ], 2)) : createCommentVNode("", true)
                    ], 2)) : createCommentVNode("", true),
                    !!slots.default ? renderSlot(_ctx.$slots, "default", { key: 1 }) : __props.orientation === "horizontal" ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "hidden lg:block"
                    })) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
            ssrRenderSlot(_ctx.$slots, "bottom", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "top"),
              createVNode(_sfc_main$j, {
                class: ui.value.container({ class: props.ui?.container })
              }, {
                default: withCtx(() => [
                  !!slots.header || (__props.title || !!slots.title) || (__props.description || !!slots.description) || !!slots.body || !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: ui.value.wrapper({ class: props.ui?.wrapper })
                  }, [
                    !!slots.header || (__props.title || !!slots.title) || (__props.description || !!slots.description) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: ui.value.header({ class: props.ui?.header })
                    }, [
                      renderSlot(_ctx.$slots, "header", {}, () => [
                        __props.title || !!slots.title ? (openBlock(), createBlock("h2", {
                          key: 0,
                          class: ui.value.title({ class: props.ui?.title })
                        }, [
                          renderSlot(_ctx.$slots, "title", {}, () => [
                            createTextVNode(toDisplayString(__props.title), 1)
                          ])
                        ], 2)) : createCommentVNode("", true),
                        __props.description || !!slots.description ? (openBlock(), createBlock("div", {
                          key: 1,
                          class: ui.value.description({ class: props.ui?.description })
                        }, [
                          renderSlot(_ctx.$slots, "description", {}, () => [
                            createTextVNode(toDisplayString(__props.description), 1)
                          ])
                        ], 2)) : createCommentVNode("", true)
                      ])
                    ], 2)) : createCommentVNode("", true),
                    !!slots.body ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: ui.value.body({ class: props.ui?.body })
                    }, [
                      renderSlot(_ctx.$slots, "body")
                    ], 2)) : createCommentVNode("", true),
                    !!slots.footer || (__props.links?.length || !!slots.links) ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: ui.value.footer({ class: props.ui?.footer })
                    }, [
                      renderSlot(_ctx.$slots, "footer", {}, () => [
                        __props.links?.length || !!slots.links ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: ui.value.links({ class: props.ui?.links })
                        }, [
                          renderSlot(_ctx.$slots, "links", {}, () => [
                            (openBlock(true), createBlock(Fragment, null, renderList(__props.links, (link, index2) => {
                              return openBlock(), createBlock(_sfc_main$p, mergeProps({
                                key: index2,
                                size: "lg"
                              }, { ref_for: true }, link), null, 16);
                            }), 128))
                          ])
                        ], 2)) : createCommentVNode("", true)
                      ])
                    ], 2)) : createCommentVNode("", true)
                  ], 2)) : createCommentVNode("", true),
                  !!slots.default ? renderSlot(_ctx.$slots, "default", { key: 1 }) : __props.orientation === "horizontal" ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "hidden lg:block"
                  })) : createCommentVNode("", true)
                ]),
                _: 3
              }, 8, ["class"]),
              renderSlot(_ctx.$slots, "bottom")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/PageCTA.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const checksums = {
  "content": "v3.5.0--kFeySSoeZr00abHid6XPQXBtllBrYN1DAH-Gy0Qqppw"
};
const tables = {
  "content": "_content_content",
  "info": "_content_info"
};
const buildGroup = (group, type) => {
  const conditions = group._conditions;
  return conditions.length > 0 ? `(${conditions.join(` ${type} `)})` : "";
};
const collectionQueryGroup = (collection) => {
  const conditions = [];
  const query = {
    // @ts-expect-error -- internal
    _conditions: conditions,
    where(field, operator, value) {
      let condition;
      switch (operator.toUpperCase()) {
        case "IN":
        case "NOT IN":
          if (Array.isArray(value)) {
            const values = value.map((val) => singleQuote(val)).join(", ");
            condition = `"${String(field)}" ${operator.toUpperCase()} (${values})`;
          } else {
            throw new TypeError(`Value for ${operator} must be an array`);
          }
          break;
        case "BETWEEN":
        case "NOT BETWEEN":
          if (Array.isArray(value) && value.length === 2) {
            condition = `"${String(field)}" ${operator.toUpperCase()} ${singleQuote(value[0])} AND ${singleQuote(value[1])}`;
          } else {
            throw new Error(`Value for ${operator} must be an array with two elements`);
          }
          break;
        case "IS NULL":
        case "IS NOT NULL":
          condition = `"${String(field)}" ${operator.toUpperCase()}`;
          break;
        case "LIKE":
        case "NOT LIKE":
          condition = `"${String(field)}" ${operator.toUpperCase()} ${singleQuote(value)}`;
          break;
        default:
          condition = `"${String(field)}" ${operator} ${singleQuote(typeof value === "boolean" ? Number(value) : value)}`;
      }
      conditions.push(`${condition}`);
      return query;
    },
    andWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      conditions.push(buildGroup(group, "AND"));
      return query;
    },
    orWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      conditions.push(buildGroup(group, "OR"));
      return query;
    }
  };
  return query;
};
const collectionQueryBuilder = (collection, fetch) => {
  const params = {
    conditions: [],
    selectedFields: [],
    offset: 0,
    limit: 0,
    orderBy: [],
    // Count query
    count: {
      field: "",
      distinct: false
    }
  };
  const query = {
    // @ts-expect-error -- internal
    __params: params,
    andWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      params.conditions.push(buildGroup(group, "AND"));
      return query;
    },
    orWhere(groupFactory) {
      const group = groupFactory(collectionQueryGroup());
      params.conditions.push(buildGroup(group, "OR"));
      return query;
    },
    path(path) {
      return query.where("path", "=", withoutTrailingSlash(path));
    },
    skip(skip) {
      params.offset = skip;
      return query;
    },
    where(field, operator, value) {
      query.andWhere((group) => group.where(String(field), operator, value));
      return query;
    },
    limit(limit) {
      params.limit = limit;
      return query;
    },
    select(...fields) {
      if (fields.length) {
        params.selectedFields.push(...fields);
      }
      return query;
    },
    order(field, direction) {
      params.orderBy.push(`"${String(field)}" ${direction}`);
      return query;
    },
    async all() {
      return fetch(collection, buildQuery()).then((res) => res || []);
    },
    async first() {
      return fetch(collection, buildQuery({ limit: 1 })).then((res) => res[0] || null);
    },
    async count(field = "*", distinct = false) {
      return fetch(collection, buildQuery({
        count: { field: String(field), distinct }
      })).then((m) => m[0].count);
    }
  };
  function buildQuery(opts = {}) {
    let query2 = "SELECT ";
    if (opts?.count) {
      query2 += `COUNT(${opts.count.distinct ? "DISTINCT " : ""}${opts.count.field}) as count`;
    } else {
      const fields = Array.from(new Set(params.selectedFields));
      query2 += fields.length > 0 ? fields.map((f) => `"${String(f)}"`).join(", ") : "*";
    }
    query2 += ` FROM ${tables[String(collection)]}`;
    if (params.conditions.length > 0) {
      query2 += ` WHERE ${params.conditions.join(" AND ")}`;
    }
    if (params.orderBy.length > 0) {
      query2 += ` ORDER BY ${params.orderBy.join(", ")}`;
    } else {
      query2 += ` ORDER BY stem ASC`;
    }
    const limit = opts?.limit || params.limit;
    if (limit > 0) {
      if (params.offset > 0) {
        query2 += ` LIMIT ${limit} OFFSET ${params.offset}`;
      } else {
        query2 += ` LIMIT ${limit}`;
      }
    }
    return query2;
  }
  return query;
};
function singleQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}
async function fetchQuery(event, collection, sql) {
  return await $fetch(`/__nuxt_content/${collection}/query`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    headers: {
      "content-type": "application/json",
      ...event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}
    },
    query: { v: checksums[String(collection)], t: void 0 },
    method: "POST",
    body: {
      sql
    }
  });
}
const queryCollection = (collection) => {
  const event = tryUseNuxtApp()?.ssrContext?.event;
  return collectionQueryBuilder(collection, (collection2, sql) => executeContentQuery(event, collection2, sql));
};
async function executeContentQuery(event, collection, sql) {
  {
    return fetchQuery(event, String(collection), sql);
  }
}
const __nuxt_component_11_lazy = defineAsyncComponent(() => import('./StarsBg-CTfK_n9r.mjs').then((c) => c.default || c));
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: page } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("index", () => queryCollection("content").first())), __temp = await __temp, __restore(), __temp);
    if (!page.value) {
      throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
    }
    useSeoMeta({
      title: page.value.seo?.title || page.value.title,
      ogTitle: page.value.seo?.title || page.value.title,
      description: page.value.seo?.description || page.value.description,
      ogDescription: page.value.seo?.description || page.value.description
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UColorModeImage = _sfc_main$b;
      const _component_UPageHero = _sfc_main$a;
      const _component_HeroBackground = __nuxt_component_2;
      const _component_MDC = _sfc_main$7;
      const _component_UPageSection = _sfc_main$5;
      const _component_USeparator = _sfc_main$5$1;
      const _component_UPageCard = _sfc_main$4;
      const _component_UContainer = _sfc_main$j;
      const _component_UPageColumns = _sfc_main$3;
      const _component_UUser = _sfc_main$2;
      const _component_UPageCTA = _sfc_main$1;
      const _component_LazyStarsBg = __nuxt_component_11_lazy;
      if (unref(page)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))}><div class="hidden lg:block">`);
        _push(ssrRenderComponent(_component_UColorModeImage, {
          light: "/images/light/line-1.svg",
          dark: "/images/dark/line-1.svg",
          class: "absolute pointer-events-none pb-10 left-0 top-0 object-cover h-[650px]"
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_UPageHero, {
          description: unref(page).description,
          links: unref(page).hero.links,
          ui: {
            container: "md:pt-18 lg:pt-20",
            title: "max-w-3xl mx-auto"
          }
        }, {
          top: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_HeroBackground, null, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_HeroBackground)
              ];
            }
          }),
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_MDC, {
                value: unref(page).title,
                unwrap: "p"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_MDC, {
                  value: unref(page).title,
                  unwrap: "p"
                }, null, 8, ["value"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UPageSection, {
          description: unref(page).section.description,
          features: unref(page).section.features,
          orientation: "horizontal",
          ui: {
            container: "lg:px-0 2xl:px-20 mx-0 max-w-none md:mr-10",
            features: "gap-0"
          },
          reverse: ""
        }, {
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_MDC, {
                value: unref(page).section.title,
                class: "sm:*:leading-11"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_MDC, {
                  value: unref(page).section.title,
                  class: "sm:*:leading-11"
                }, null, 8, ["value"])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<img${ssrRenderAttr("src", unref(page).section.images.desktop)}${ssrRenderAttr("alt", unref(page).section.title)} class="hidden lg:block 2xl:hidden left-0 w-full max-w-2xl"${_scopeId}><img${ssrRenderAttr("src", unref(page).section.images.mobile)}${ssrRenderAttr("alt", unref(page).section.title)} class="block lg:hidden 2xl:block 2xl:w-full 2xl:max-w-2xl"${_scopeId}>`);
            } else {
              return [
                createVNode("img", {
                  src: unref(page).section.images.desktop,
                  alt: unref(page).section.title,
                  class: "hidden lg:block 2xl:hidden left-0 w-full max-w-2xl"
                }, null, 8, ["src", "alt"]),
                createVNode("img", {
                  src: unref(page).section.images.mobile,
                  alt: unref(page).section.title,
                  class: "block lg:hidden 2xl:block 2xl:w-full 2xl:max-w-2xl"
                }, null, 8, ["src", "alt"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_USeparator, { ui: { border: "border-primary/30" } }, null, _parent));
        _push(ssrRenderComponent(_component_UPageSection, {
          id: "steps",
          description: unref(page).steps.description,
          class: "relative overflow-hidden"
        }, {
          headline: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UColorModeImage, {
                light: "/images/light/line-3.svg",
                dark: "/images/dark/line-3.svg",
                class: "absolute -top-10 sm:top-0 right-1/2 h-24"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UColorModeImage, {
                  light: "/images/light/line-3.svg",
                  dark: "/images/dark/line-3.svg",
                  class: "absolute -top-10 sm:top-0 right-1/2 h-24"
                })
              ];
            }
          }),
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_MDC, {
                value: unref(page).steps.title
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_MDC, {
                  value: unref(page).steps.title
                }, null, 8, ["value"])
              ];
            }
          }),
          features: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<!--[-->`);
              ssrRenderList(unref(page).steps.items, (step, index2) => {
                _push2(ssrRenderComponent(_component_UPageCard, {
                  key: index2,
                  class: "group",
                  ui: { container: "p-4 sm:p-4", title: "flex items-center gap-1" }
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      if (step.image) {
                        _push3(ssrRenderComponent(_component_UColorModeImage, {
                          light: step.image?.light,
                          dark: step.image?.dark,
                          alt: step.title,
                          class: "size-full"
                        }, null, _parent3, _scopeId2));
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<div class="flex flex-col gap-2"${_scopeId2}><span class="text-lg font-semibold"${_scopeId2}>${ssrInterpolate(step.title)}</span><span class="text-sm text-muted"${_scopeId2}>${ssrInterpolate(step.description)}</span></div>`);
                    } else {
                      return [
                        step.image ? (openBlock(), createBlock(_component_UColorModeImage, {
                          key: 0,
                          light: step.image?.light,
                          dark: step.image?.dark,
                          alt: step.title,
                          class: "size-full"
                        }, null, 8, ["light", "dark", "alt"])) : createCommentVNode("", true),
                        createVNode("div", { class: "flex flex-col gap-2" }, [
                          createVNode("span", { class: "text-lg font-semibold" }, toDisplayString(step.title), 1),
                          createVNode("span", { class: "text-sm text-muted" }, toDisplayString(step.description), 1)
                        ])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              });
              _push2(`<!--]-->`);
            } else {
              return [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(page).steps.items, (step, index2) => {
                  return openBlock(), createBlock(_component_UPageCard, {
                    key: index2,
                    class: "group",
                    ui: { container: "p-4 sm:p-4", title: "flex items-center gap-1" }
                  }, {
                    default: withCtx(() => [
                      step.image ? (openBlock(), createBlock(_component_UColorModeImage, {
                        key: 0,
                        light: step.image?.light,
                        dark: step.image?.dark,
                        alt: step.title,
                        class: "size-full"
                      }, null, 8, ["light", "dark", "alt"])) : createCommentVNode("", true),
                      createVNode("div", { class: "flex flex-col gap-2" }, [
                        createVNode("span", { class: "text-lg font-semibold" }, toDisplayString(step.title), 1),
                        createVNode("span", { class: "text-sm text-muted" }, toDisplayString(step.description), 1)
                      ])
                    ]),
                    _: 2
                  }, 1024);
                }), 128))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_USeparator, { ui: { border: "border-primary/30" } }, null, _parent));
        _push(ssrRenderComponent(_component_UPageSection, {
          id: "administracion",
          description: unref(page).administration.description,
          features: unref(page).administration.features,
          ui: {
            title: "text-left @container relative flex",
            description: "text-left"
          },
          class: "relative overflow-hidden"
        }, {
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_MDC, {
                value: unref(page).administration.title,
                class: "*:leading-9"
              }, null, _parent2, _scopeId));
              _push2(`<div class="hidden @min-[1020px]:block"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UColorModeImage, {
                light: "/images/light/line-2.svg",
                dark: "/images/dark/line-2.svg",
                class: "absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode(_component_MDC, {
                  value: unref(page).administration.title,
                  class: "*:leading-9"
                }, null, 8, ["value"]),
                createVNode("div", { class: "hidden @min-[1020px]:block" }, [
                  createVNode(_component_UColorModeImage, {
                    light: "/images/light/line-2.svg",
                    dark: "/images/dark/line-2.svg",
                    class: "absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]"
                  })
                ])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="absolute rounded-full -left-10 top-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]"${_scopeId}></div><div class="absolute rounded-full -right-10 -bottom-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]"${_scopeId}></div>`);
            } else {
              return [
                createVNode("div", { class: "absolute rounded-full -left-10 top-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" }),
                createVNode("div", { class: "absolute rounded-full -right-10 -bottom-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UPageSection, {
          id: "gestoria",
          description: unref(page).agency.description,
          features: unref(page).agency.features,
          ui: {
            title: "text-left @container relative flex",
            description: "text-left"
          },
          class: "relative overflow-hidden"
        }, {
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_MDC, {
                value: unref(page).agency.title,
                class: "*:leading-9"
              }, null, _parent2, _scopeId));
              _push2(`<div class="hidden @min-[1020px]:block"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UColorModeImage, {
                light: "/images/light/line-2.svg",
                dark: "/images/dark/line-2.svg",
                class: "absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode(_component_MDC, {
                  value: unref(page).agency.title,
                  class: "*:leading-9"
                }, null, 8, ["value"]),
                createVNode("div", { class: "hidden @min-[1020px]:block" }, [
                  createVNode(_component_UColorModeImage, {
                    light: "/images/light/line-2.svg",
                    dark: "/images/dark/line-2.svg",
                    class: "absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]"
                  })
                ])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="absolute rounded-full -left-10 top-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]"${_scopeId}></div><div class="absolute rounded-full -right-10 -bottom-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]"${_scopeId}></div>`);
            } else {
              return [
                createVNode("div", { class: "absolute rounded-full -left-10 top-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" }),
                createVNode("div", { class: "absolute rounded-full -right-10 -bottom-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UPageSection, {
          id: "asesoria",
          description: unref(page).consultancy.description,
          features: unref(page).consultancy.features,
          ui: {
            title: "text-left @container relative flex",
            description: "text-left"
          },
          class: "relative overflow-hidden"
        }, {
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_MDC, {
                value: unref(page).consultancy.title,
                class: "*:leading-9"
              }, null, _parent2, _scopeId));
              _push2(`<div class="hidden @min-[1020px]:block"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UColorModeImage, {
                light: "/images/light/line-2.svg",
                dark: "/images/dark/line-2.svg",
                class: "absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode(_component_MDC, {
                  value: unref(page).consultancy.title,
                  class: "*:leading-9"
                }, null, 8, ["value"]),
                createVNode("div", { class: "hidden @min-[1020px]:block" }, [
                  createVNode(_component_UColorModeImage, {
                    light: "/images/light/line-2.svg",
                    dark: "/images/dark/line-2.svg",
                    class: "absolute top-0 right-0 size-full transform scale-95 translate-x-[70%]"
                  })
                ])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="absolute rounded-full -left-10 top-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]"${_scopeId}></div><div class="absolute rounded-full -right-10 -bottom-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]"${_scopeId}></div>`);
            } else {
              return [
                createVNode("div", { class: "absolute rounded-full -left-10 top-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" }),
                createVNode("div", { class: "absolute rounded-full -right-10 -bottom-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UPageSection, {
          id: "clientes",
          title: unref(page).testimonials.title,
          description: unref(page).testimonials.description,
          items: unref(page).testimonials.items
        }, {
          headline: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UColorModeImage, {
                light: "/images/light/line-5.svg",
                dark: "/images/dark/line-5.svg",
                class: "absolute -top-10 sm:top-0 right-1/2 h-24"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UColorModeImage, {
                  light: "/images/light/line-5.svg",
                  dark: "/images/dark/line-5.svg",
                  class: "absolute -top-10 sm:top-0 right-1/2 h-24"
                })
              ];
            }
          }),
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_MDC, {
                value: unref(page).testimonials.title
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_MDC, {
                  value: unref(page).testimonials.title
                }, null, 8, ["value"])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UContainer, null, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UPageColumns, { class: "xl:columns-3" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<!--[-->`);
                          ssrRenderList(unref(page).testimonials.items, (client, index2) => {
                            _push4(ssrRenderComponent(_component_UPageCard, {
                              key: index2,
                              variant: "subtle",
                              description: client.quote,
                              ui: { description: "" }
                            }, {
                              footer: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(ssrRenderComponent(_component_UUser, mergeProps({ ref_for: true }, client.user, { size: "xl" }), null, _parent5, _scopeId4));
                                } else {
                                  return [
                                    createVNode(_component_UUser, mergeProps({ ref_for: true }, client.user, { size: "xl" }), null, 16)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          });
                          _push4(`<!--]-->`);
                        } else {
                          return [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(page).testimonials.items, (client, index2) => {
                              return openBlock(), createBlock(_component_UPageCard, {
                                key: index2,
                                variant: "subtle",
                                description: client.quote,
                                ui: { description: "" }
                              }, {
                                footer: withCtx(() => [
                                  createVNode(_component_UUser, mergeProps({ ref_for: true }, client.user, { size: "xl" }), null, 16)
                                ]),
                                _: 2
                              }, 1032, ["description"]);
                            }), 128))
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UPageColumns, { class: "xl:columns-3" }, {
                        default: withCtx(() => [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(page).testimonials.items, (client, index2) => {
                            return openBlock(), createBlock(_component_UPageCard, {
                              key: index2,
                              variant: "subtle",
                              description: client.quote,
                              ui: { description: "" }
                            }, {
                              footer: withCtx(() => [
                                createVNode(_component_UUser, mergeProps({ ref_for: true }, client.user, { size: "xl" }), null, 16)
                              ]),
                              _: 2
                            }, 1032, ["description"]);
                          }), 128))
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UContainer, null, {
                  default: withCtx(() => [
                    createVNode(_component_UPageColumns, { class: "xl:columns-3" }, {
                      default: withCtx(() => [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(page).testimonials.items, (client, index2) => {
                          return openBlock(), createBlock(_component_UPageCard, {
                            key: index2,
                            variant: "subtle",
                            description: client.quote,
                            ui: { description: "" }
                          }, {
                            footer: withCtx(() => [
                              createVNode(_component_UUser, mergeProps({ ref_for: true }, client.user, { size: "xl" }), null, 16)
                            ]),
                            _: 2
                          }, 1032, ["description"]);
                        }), 128))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UPageSection, {
          id: "equipo",
          title: unref(page).team.title,
          description: unref(page).team.description,
          items: unref(page).team.items
        }, {
          headline: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UColorModeImage, {
                light: "/images/light/line-5.svg",
                dark: "/images/dark/line-5.svg",
                class: "absolute -top-10 sm:top-0 right-1/2 h-24"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UColorModeImage, {
                  light: "/images/light/line-5.svg",
                  dark: "/images/dark/line-5.svg",
                  class: "absolute -top-10 sm:top-0 right-1/2 h-24"
                })
              ];
            }
          }),
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_MDC, {
                value: unref(page).team.title
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_MDC, {
                  value: unref(page).team.title
                }, null, 8, ["value"])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UContainer, null, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UPageColumns, { class: "xl:columns-3" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<!--[-->`);
                          ssrRenderList(unref(page).team.items, (member, index2) => {
                            _push4(ssrRenderComponent(_component_UPageCard, {
                              key: index2,
                              variant: "subtle",
                              description: member.quote,
                              ui: { description: "" }
                            }, {
                              footer: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(ssrRenderComponent(_component_UUser, mergeProps({ ref_for: true }, member.user, { size: "xl" }), null, _parent5, _scopeId4));
                                } else {
                                  return [
                                    createVNode(_component_UUser, mergeProps({ ref_for: true }, member.user, { size: "xl" }), null, 16)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          });
                          _push4(`<!--]-->`);
                        } else {
                          return [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(page).team.items, (member, index2) => {
                              return openBlock(), createBlock(_component_UPageCard, {
                                key: index2,
                                variant: "subtle",
                                description: member.quote,
                                ui: { description: "" }
                              }, {
                                footer: withCtx(() => [
                                  createVNode(_component_UUser, mergeProps({ ref_for: true }, member.user, { size: "xl" }), null, 16)
                                ]),
                                _: 2
                              }, 1032, ["description"]);
                            }), 128))
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UPageColumns, { class: "xl:columns-3" }, {
                        default: withCtx(() => [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(page).team.items, (member, index2) => {
                            return openBlock(), createBlock(_component_UPageCard, {
                              key: index2,
                              variant: "subtle",
                              description: member.quote,
                              ui: { description: "" }
                            }, {
                              footer: withCtx(() => [
                                createVNode(_component_UUser, mergeProps({ ref_for: true }, member.user, { size: "xl" }), null, 16)
                              ]),
                              _: 2
                            }, 1032, ["description"]);
                          }), 128))
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UContainer, null, {
                  default: withCtx(() => [
                    createVNode(_component_UPageColumns, { class: "xl:columns-3" }, {
                      default: withCtx(() => [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(page).team.items, (member, index2) => {
                          return openBlock(), createBlock(_component_UPageCard, {
                            key: index2,
                            variant: "subtle",
                            description: member.quote,
                            ui: { description: "" }
                          }, {
                            footer: withCtx(() => [
                              createVNode(_component_UUser, mergeProps({ ref_for: true }, member.user, { size: "xl" }), null, 16)
                            ]),
                            _: 2
                          }, 1032, ["description"]);
                        }), 128))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
        _push(ssrRenderComponent(_component_UPageCTA, mergeProps({ id: "contacto" }, unref(page).cta, {
          variant: "naked",
          class: "overflow-hidden @container"
        }), {
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_MDC, {
                value: unref(page).cta.title
              }, null, _parent2, _scopeId));
              _push2(`<div class="@max-[1280px]:hidden"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UColorModeImage, {
                light: "/images/light/line-6.svg",
                dark: "/images/dark/line-6.svg",
                class: "absolute left-10 -top-10 sm:top-0 h-full"
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UColorModeImage, {
                light: "/images/light/line-7.svg",
                dark: "/images/dark/line-7.svg",
                class: "absolute right-0 bottom-0 h-full"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode(_component_MDC, {
                  value: unref(page).cta.title
                }, null, 8, ["value"]),
                createVNode("div", { class: "@max-[1280px]:hidden" }, [
                  createVNode(_component_UColorModeImage, {
                    light: "/images/light/line-6.svg",
                    dark: "/images/dark/line-6.svg",
                    class: "absolute left-10 -top-10 sm:top-0 h-full"
                  }),
                  createVNode(_component_UColorModeImage, {
                    light: "/images/light/line-7.svg",
                    dark: "/images/dark/line-7.svg",
                    class: "absolute right-0 bottom-0 h-full"
                  })
                ])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_LazyStarsBg, null, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_LazyStarsBg)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main
}, Symbol.toStringTag, { value: "Module" }));

export { htmlTags as h, index as i };
//# sourceMappingURL=index-DCCfyP3w.mjs.map
