import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import nodeCrypto, { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync, mkdirSync } from 'node:fs';
import { resolve as resolve$1, dirname as dirname$1, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getIcons } from '@iconify/utils';
import { consola } from 'consola';
import Database from 'better-sqlite3';
import { ipxFSStorage, ipxHttpStorage, createIPX, createIPXH3Handler } from 'ipx';

const subtle = nodeCrypto.webcrypto?.subtle || {};
const randomUUID = () => {
  return nodeCrypto.randomUUID();
};
const getRandomValues = (array) => {
  return nodeCrypto.webcrypto.getRandomValues(array);
};
const _crypto = {
  randomUUID,
  getRandomValues,
  subtle
};

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function encodeParam(text) {
  return encodePath(text).replace(SLASH_RE, "%2F");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$1(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

function parse(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = {};
  const opt = {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$2(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

// src/utils.ts
var alphabetByEncoding = {};
var alphabetByValue = Array.from({ length: 64 });
for (let i = 0, start = "A".charCodeAt(0), limit = "Z".charCodeAt(0); i + start <= limit; i++) {
  const char = String.fromCharCode(i + start);
  alphabetByEncoding[char] = i;
  alphabetByValue[i] = char;
}
for (let i = 0, start = "a".charCodeAt(0), limit = "z".charCodeAt(0); i + start <= limit; i++) {
  const char = String.fromCharCode(i + start);
  const index = i + 26;
  alphabetByEncoding[char] = index;
  alphabetByValue[index] = char;
}
for (let i = 0; i < 10; i++) {
  alphabetByEncoding[i.toString(10)] = i + 52;
  const char = i.toString(10);
  const index = i + 52;
  alphabetByEncoding[char] = index;
  alphabetByValue[index] = char;
}
alphabetByEncoding["-"] = 62;
alphabetByValue[62] = "-";
alphabetByEncoding["_"] = 63;
alphabetByValue[63] = "_";
var bitsPerLetter = 6;
var bitsPerByte = 8;
var maxLetterValue = 63;
var stringToBuffer = (value) => {
  return new TextEncoder().encode(value);
};
var bufferToString = (value) => {
  return new TextDecoder().decode(value);
};
var base64urlDecode = (_input) => {
  const input = _input + "=".repeat((4 - _input.length % 4) % 4);
  let totalByteLength = input.length / 4 * 3;
  if (input.endsWith("==")) {
    totalByteLength -= 2;
  } else if (input.endsWith("=")) {
    totalByteLength--;
  }
  const out = new ArrayBuffer(totalByteLength);
  const dataView = new DataView(out);
  for (let i = 0; i < input.length; i += 4) {
    let bits = 0;
    let bitLength = 0;
    for (let j = i, limit = i + 3; j <= limit; j++) {
      if (input[j] === "=") {
        bits >>= bitsPerLetter;
      } else {
        if (!(input[j] in alphabetByEncoding)) {
          throw new TypeError(`Invalid character ${input[j]} in base64 string.`);
        }
        bits |= alphabetByEncoding[input[j]] << (limit - j) * bitsPerLetter;
        bitLength += bitsPerLetter;
      }
    }
    const chunkOffset = i / 4 * 3;
    bits >>= bitLength % bitsPerByte;
    const byteLength = Math.floor(bitLength / bitsPerByte);
    for (let k = 0; k < byteLength; k++) {
      const offset = (byteLength - k - 1) * bitsPerByte;
      dataView.setUint8(chunkOffset + k, (bits & 255 << offset) >> offset);
    }
  }
  return new Uint8Array(out);
};
var base64urlEncode = (_input) => {
  const input = typeof _input === "string" ? stringToBuffer(_input) : _input;
  let str = "";
  for (let i = 0; i < input.length; i += 3) {
    let bits = 0;
    let bitLength = 0;
    for (let j = i, limit = Math.min(i + 3, input.length); j < limit; j++) {
      bits |= input[j] << (limit - j - 1) * bitsPerByte;
      bitLength += bitsPerByte;
    }
    const bitClusterCount = Math.ceil(bitLength / bitsPerLetter);
    bits <<= bitClusterCount * bitsPerLetter - bitLength;
    for (let k = 1; k <= bitClusterCount; k++) {
      const offset = (bitClusterCount - k) * bitsPerLetter;
      str += alphabetByValue[(bits & maxLetterValue << offset) >> offset];
    }
  }
  return str;
};

// src/index.ts
var defaults = {
  encryption: { saltBits: 256, algorithm: "aes-256-cbc", iterations: 1, minPasswordlength: 32 },
  integrity: { saltBits: 256, algorithm: "sha256", iterations: 1, minPasswordlength: 32 },
  ttl: 0,
  timestampSkewSec: 60,
  localtimeOffsetMsec: 0
};
var clone = (options) => ({
  ...options,
  encryption: { ...options.encryption },
  integrity: { ...options.integrity }
});
var algorithms = {
  "aes-128-ctr": { keyBits: 128, ivBits: 128, name: "AES-CTR" },
  "aes-256-cbc": { keyBits: 256, ivBits: 128, name: "AES-CBC" },
  sha256: { keyBits: 256, name: "SHA-256" }
};
var macPrefix = "Fe26.2";
var randomBytes = (_crypto, size) => {
  const bytes = new Uint8Array(size);
  _crypto.getRandomValues(bytes);
  return bytes;
};
var randomBits = (_crypto, bits) => {
  if (bits < 1)
    throw new Error("Invalid random bits count");
  const bytes = Math.ceil(bits / 8);
  return randomBytes(_crypto, bytes);
};
var pbkdf2 = async (_crypto, password, salt, iterations, keyLength, hash) => {
  const passwordBuffer = stringToBuffer(password);
  const importedKey = await _crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const saltBuffer = stringToBuffer(salt);
  const params = { name: "PBKDF2", hash, salt: saltBuffer, iterations };
  const derivation = await _crypto.subtle.deriveBits(params, importedKey, keyLength * 8);
  return derivation;
};
var generateKey = async (_crypto, password, options) => {
  var _a;
  if (!(password == null ? void 0 : password.length))
    throw new Error("Empty password");
  if (options == null || typeof options !== "object")
    throw new Error("Bad options");
  if (!(options.algorithm in algorithms))
    throw new Error(`Unknown algorithm: ${options.algorithm}`);
  const algorithm = algorithms[options.algorithm];
  const result = {};
  const hmac = (_a = options.hmac) != null ? _a : false;
  const id = hmac ? { name: "HMAC", hash: algorithm.name } : { name: algorithm.name };
  const usage = hmac ? ["sign", "verify"] : ["encrypt", "decrypt"];
  if (typeof password === "string") {
    if (password.length < options.minPasswordlength)
      throw new Error(
        `Password string too short (min ${options.minPasswordlength} characters required)`
      );
    let { salt = "" } = options;
    if (!salt) {
      const { saltBits = 0 } = options;
      if (!saltBits)
        throw new Error("Missing salt and saltBits options");
      const randomSalt = randomBits(_crypto, saltBits);
      salt = [...new Uint8Array(randomSalt)].map((x) => x.toString(16).padStart(2, "0")).join("");
    }
    const derivedKey = await pbkdf2(
      _crypto,
      password,
      salt,
      options.iterations,
      algorithm.keyBits / 8,
      "SHA-1"
    );
    const importedEncryptionKey = await _crypto.subtle.importKey(
      "raw",
      derivedKey,
      id,
      false,
      usage
    );
    result.key = importedEncryptionKey;
    result.salt = salt;
  } else {
    if (password.length < algorithm.keyBits / 8)
      throw new Error("Key buffer (password) too small");
    result.key = await _crypto.subtle.importKey("raw", password, id, false, usage);
    result.salt = "";
  }
  if (options.iv)
    result.iv = options.iv;
  else if ("ivBits" in algorithm)
    result.iv = randomBits(_crypto, algorithm.ivBits);
  return result;
};
var getEncryptParams = (algorithm, key, data) => {
  return [
    algorithm === "aes-128-ctr" ? { name: "AES-CTR", counter: key.iv, length: 128 } : { name: "AES-CBC", iv: key.iv },
    key.key,
    typeof data === "string" ? stringToBuffer(data) : data
  ];
};
var encrypt = async (_crypto, password, options, data) => {
  const key = await generateKey(_crypto, password, options);
  const encrypted = await _crypto.subtle.encrypt(...getEncryptParams(options.algorithm, key, data));
  return { encrypted: new Uint8Array(encrypted), key };
};
var decrypt = async (_crypto, password, options, data) => {
  const key = await generateKey(_crypto, password, options);
  const decrypted = await _crypto.subtle.decrypt(...getEncryptParams(options.algorithm, key, data));
  return bufferToString(new Uint8Array(decrypted));
};
var hmacWithPassword = async (_crypto, password, options, data) => {
  const key = await generateKey(_crypto, password, { ...options, hmac: true });
  const textBuffer = stringToBuffer(data);
  const signed = await _crypto.subtle.sign({ name: "HMAC" }, key.key, textBuffer);
  const digest = base64urlEncode(new Uint8Array(signed));
  return { digest, salt: key.salt };
};
var normalizePassword = (password) => {
  if (typeof password === "string" || password instanceof Uint8Array)
    return { encryption: password, integrity: password };
  if ("secret" in password)
    return { id: password.id, encryption: password.secret, integrity: password.secret };
  return { id: password.id, encryption: password.encryption, integrity: password.integrity };
};
var seal = async (_crypto, object, password, options) => {
  if (!password)
    throw new Error("Empty password");
  const opts = clone(options);
  const now = Date.now() + (opts.localtimeOffsetMsec || 0);
  const objectString = JSON.stringify(object);
  const pass = normalizePassword(password);
  const { id = "", encryption, integrity } = pass;
  if (id && !/^\w+$/.test(id))
    throw new Error("Invalid password id");
  const { encrypted, key } = await encrypt(_crypto, encryption, opts.encryption, objectString);
  const encryptedB64 = base64urlEncode(new Uint8Array(encrypted));
  const iv = base64urlEncode(key.iv);
  const expiration = opts.ttl ? now + opts.ttl : "";
  const macBaseString = `${macPrefix}*${id}*${key.salt}*${iv}*${encryptedB64}*${expiration}`;
  const mac = await hmacWithPassword(_crypto, integrity, opts.integrity, macBaseString);
  const sealed = `${macBaseString}*${mac.salt}*${mac.digest}`;
  return sealed;
};
var fixedTimeComparison = (a, b) => {
  let mismatch = a.length === b.length ? 0 : 1;
  if (mismatch)
    b = a;
  for (let i = 0; i < a.length; i += 1)
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
};
var unseal = async (_crypto, sealed, password, options) => {
  if (!password)
    throw new Error("Empty password");
  const opts = clone(options);
  const now = Date.now() + (opts.localtimeOffsetMsec || 0);
  const parts = sealed.split("*");
  if (parts.length !== 8)
    throw new Error("Incorrect number of sealed components");
  const prefix = parts[0];
  let passwordId = parts[1];
  const encryptionSalt = parts[2];
  const encryptionIv = parts[3];
  const encryptedB64 = parts[4];
  const expiration = parts[5];
  const hmacSalt = parts[6];
  const hmac = parts[7];
  const macBaseString = `${prefix}*${passwordId}*${encryptionSalt}*${encryptionIv}*${encryptedB64}*${expiration}`;
  if (macPrefix !== prefix)
    throw new Error("Wrong mac prefix");
  if (expiration) {
    if (!/^\d+$/.test(expiration))
      throw new Error("Invalid expiration");
    const exp = Number.parseInt(expiration, 10);
    if (exp <= now - opts.timestampSkewSec * 1e3)
      throw new Error("Expired seal");
  }
  let pass = "";
  passwordId = passwordId || "default";
  if (typeof password === "string" || password instanceof Uint8Array)
    pass = password;
  else if (passwordId in password) {
    pass = password[passwordId];
  } else {
    throw new Error(`Cannot find password: ${passwordId}`);
  }
  pass = normalizePassword(pass);
  const macOptions = opts.integrity;
  macOptions.salt = hmacSalt;
  const mac = await hmacWithPassword(_crypto, pass.integrity, macOptions, macBaseString);
  if (!fixedTimeComparison(mac.digest, hmac))
    throw new Error("Bad hmac value");
  const encrypted = base64urlDecode(encryptedB64);
  const decryptOptions = opts.encryption;
  decryptOptions.salt = encryptionSalt;
  decryptOptions.iv = base64urlDecode(encryptionIv);
  const decrypted = await decrypt(_crypto, pass.encryption, decryptOptions, encrypted);
  if (decrypted)
    return JSON.parse(decrypted);
  return null;
};

function o(n){throw new Error(`${n} is not implemented yet!`)}let i$1 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}};let l$1 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i$1,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _(){return Object.assign(c$1.prototype,i$1.prototype),Object.assign(c$1.prototype,l$1.prototype),c$1}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_();class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i$1{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function useBase(base, handler) {
  base = withoutTrailingSlash(base);
  if (!base || base === "/") {
    return handler;
  }
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _path = event._path || event.node.req.url || "/";
    event._path = withoutBase(event.path || "/", base);
    event.node.req.url = event._path;
    try {
      return await handler(event);
    } finally {
      event._path = event.node.req.url = _path;
    }
  });
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode$1(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$2(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function deleteCookie(event, name, serializeOptions) {
  setCookie(event, name, "", {
    ...serializeOptions,
    maxAge: 0
  });
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
const appendHeader = appendResponseHeader;
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

const getSessionPromise = Symbol("getSession");
const DEFAULT_NAME = "h3";
const DEFAULT_COOKIE = {
  path: "/",
  secure: true,
  httpOnly: true
};
async function useSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  await getSession(event, config);
  const sessionManager = {
    get id() {
      return event.context.sessions?.[sessionName]?.id;
    },
    get data() {
      return event.context.sessions?.[sessionName]?.data || {};
    },
    update: async (update) => {
      if (!isEvent(event)) {
        throw new Error("[h3] Cannot update read-only session.");
      }
      await updateSession(event, config, update);
      return sessionManager;
    },
    clear: () => {
      if (!isEvent(event)) {
        throw new Error("[h3] Cannot clear read-only session.");
      }
      clearSession(event, config);
      return Promise.resolve(sessionManager);
    }
  };
  return sessionManager;
}
async function getSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  if (!event.context.sessions) {
    event.context.sessions = /* @__PURE__ */ Object.create(null);
  }
  const existingSession = event.context.sessions[sessionName];
  if (existingSession) {
    return existingSession[getSessionPromise] || existingSession;
  }
  const session = {
    id: "",
    createdAt: 0,
    data: /* @__PURE__ */ Object.create(null)
  };
  event.context.sessions[sessionName] = session;
  let sealedSession;
  if (config.sessionHeader !== false) {
    const headerName = typeof config.sessionHeader === "string" ? config.sessionHeader.toLowerCase() : `x-${sessionName.toLowerCase()}-session`;
    const headerValue = _getReqHeader(event, headerName);
    if (typeof headerValue === "string") {
      sealedSession = headerValue;
    }
  }
  if (!sealedSession) {
    const cookieHeader = _getReqHeader(event, "cookie");
    if (cookieHeader) {
      sealedSession = parse(cookieHeader + "")[sessionName];
    }
  }
  if (sealedSession) {
    const promise = unsealSession(event, config, sealedSession).catch(() => {
    }).then((unsealed) => {
      Object.assign(session, unsealed);
      delete event.context.sessions[sessionName][getSessionPromise];
      return session;
    });
    event.context.sessions[sessionName][getSessionPromise] = promise;
    await promise;
  }
  if (!session.id) {
    if (!isEvent(event)) {
      throw new Error(
        "Cannot initialize a new session. Make sure using `useSession(event)` in main handler."
      );
    }
    session.id = config.generateId?.() ?? (config.crypto || _crypto).randomUUID();
    session.createdAt = Date.now();
    await updateSession(event, config);
  }
  return session;
}
function _getReqHeader(event, name) {
  if (event.node) {
    return event.node?.req.headers[name];
  }
  if (event.request) {
    return event.request.headers?.get(name);
  }
  if (event.headers) {
    return event.headers.get(name);
  }
}
async function updateSession(event, config, update) {
  const sessionName = config.name || DEFAULT_NAME;
  const session = event.context.sessions?.[sessionName] || await getSession(event, config);
  if (typeof update === "function") {
    update = update(session.data);
  }
  if (update) {
    Object.assign(session.data, update);
  }
  if (config.cookie !== false) {
    const sealed = await sealSession(event, config);
    setCookie(event, sessionName, sealed, {
      ...DEFAULT_COOKIE,
      expires: config.maxAge ? new Date(session.createdAt + config.maxAge * 1e3) : void 0,
      ...config.cookie
    });
  }
  return session;
}
async function sealSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  const session = event.context.sessions?.[sessionName] || await getSession(event, config);
  const sealed = await seal(config.crypto || _crypto, session, config.password, {
    ...defaults,
    ttl: config.maxAge ? config.maxAge * 1e3 : 0,
    ...config.seal
  });
  return sealed;
}
async function unsealSession(_event, config, sealed) {
  const unsealed = await unseal(
    config.crypto || _crypto,
    sealed,
    config.password,
    {
      ...defaults,
      ttl: config.maxAge ? config.maxAge * 1e3 : 0,
      ...config.seal
    }
  );
  if (config.maxAge) {
    const age = Date.now() - (unsealed.createdAt || Number.NEGATIVE_INFINITY);
    if (age > config.maxAge * 1e3) {
      throw new Error("Session expired!");
    }
  }
  return unsealed;
}
function clearSession(event, config) {
  const sessionName = config.name || DEFAULT_NAME;
  if (event.context.sessions?.[sessionName]) {
    delete event.context.sessions[sessionName];
  }
  setCookie(event, sessionName, "", {
    ...DEFAULT_COOKIE,
    ...config.cookie
  });
  return Promise.resolve();
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch$1 = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController = globalThis.AbortController || i;
const ofetch = createFetch({ fetch: fetch$1, Headers: Headers$1, AbortController });
const $fetch$1 = ofetch;

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey$1(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$2(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function normalizeBaseKey$1(base) {
  base = normalizeKey$2(base);
  return base ? base + ":" : "";
}

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c().serialize(o)}const c=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

function isEqual(object1, object2) {
  if (object1 === object2) {
    return true;
  }
  if (serialize$1(object1) === serialize$1(object2)) {
    return true;
  }
  return false;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r="sha256",s="base64url";function digest(t){if(e)return e(r,t,s);const o=createHash(r).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const defineAppConfig = (config) => config;

const appConfig0 = defineAppConfig({
  ui: {
    colors: {
      primary: "green",
      neutral: "neutral"
    }
  }
});

const inlineAppConfig = {
  "nuxt": {},
  "ui": {
    "colors": {
      "primary": "green",
      "secondary": "blue",
      "success": "green",
      "info": "blue",
      "warning": "yellow",
      "error": "red",
      "neutral": "slate"
    },
    "icons": {
      "arrowDown": "i-lucide-arrow-down",
      "arrowLeft": "i-lucide-arrow-left",
      "arrowRight": "i-lucide-arrow-right",
      "arrowUp": "i-lucide-arrow-up",
      "caution": "i-lucide-circle-alert",
      "check": "i-lucide-check",
      "chevronDoubleLeft": "i-lucide-chevrons-left",
      "chevronDoubleRight": "i-lucide-chevrons-right",
      "chevronDown": "i-lucide-chevron-down",
      "chevronLeft": "i-lucide-chevron-left",
      "chevronRight": "i-lucide-chevron-right",
      "chevronUp": "i-lucide-chevron-up",
      "close": "i-lucide-x",
      "copy": "i-lucide-copy",
      "copyCheck": "i-lucide-copy-check",
      "dark": "i-lucide-moon",
      "ellipsis": "i-lucide-ellipsis",
      "error": "i-lucide-circle-x",
      "external": "i-lucide-arrow-up-right",
      "eye": "i-lucide-eye",
      "eyeOff": "i-lucide-eye-off",
      "file": "i-lucide-file",
      "folder": "i-lucide-folder",
      "folderOpen": "i-lucide-folder-open",
      "hash": "i-lucide-hash",
      "info": "i-lucide-info",
      "light": "i-lucide-sun",
      "loading": "i-lucide-loader-circle",
      "menu": "i-lucide-menu",
      "minus": "i-lucide-minus",
      "panelClose": "i-lucide-panel-left-close",
      "panelOpen": "i-lucide-panel-left-open",
      "plus": "i-lucide-plus",
      "reload": "i-lucide-rotate-ccw",
      "search": "i-lucide-search",
      "stop": "i-lucide-square",
      "success": "i-lucide-circle-check",
      "system": "i-lucide-monitor",
      "tip": "i-lucide-lightbulb",
      "upload": "i-lucide-upload",
      "warning": "i-lucide-triangle-alert"
    }
  },
  "icon": {
    "provider": "server",
    "class": "",
    "aliases": {},
    "iconifyApiEndpoint": "https://api.iconify.design",
    "localApiEndpoint": "/api/_nuxt_icon",
    "fallbackToApi": true,
    "cssSelectorPrefix": "i-",
    "cssWherePseudo": true,
    "cssLayer": "components",
    "mode": "css",
    "attrs": {
      "aria-hidden": true
    },
    "collections": [
      "academicons",
      "akar-icons",
      "ant-design",
      "arcticons",
      "basil",
      "bi",
      "bitcoin-icons",
      "bpmn",
      "brandico",
      "bx",
      "bxl",
      "bxs",
      "bytesize",
      "carbon",
      "catppuccin",
      "cbi",
      "charm",
      "ci",
      "cib",
      "cif",
      "cil",
      "circle-flags",
      "circum",
      "clarity",
      "codicon",
      "covid",
      "cryptocurrency",
      "cryptocurrency-color",
      "dashicons",
      "devicon",
      "devicon-plain",
      "ei",
      "el",
      "emojione",
      "emojione-monotone",
      "emojione-v1",
      "entypo",
      "entypo-social",
      "eos-icons",
      "ep",
      "et",
      "eva",
      "f7",
      "fa",
      "fa-brands",
      "fa-regular",
      "fa-solid",
      "fa6-brands",
      "fa6-regular",
      "fa6-solid",
      "fad",
      "fe",
      "feather",
      "file-icons",
      "flag",
      "flagpack",
      "flat-color-icons",
      "flat-ui",
      "flowbite",
      "fluent",
      "fluent-emoji",
      "fluent-emoji-flat",
      "fluent-emoji-high-contrast",
      "fluent-mdl2",
      "fontelico",
      "fontisto",
      "formkit",
      "foundation",
      "fxemoji",
      "gala",
      "game-icons",
      "geo",
      "gg",
      "gis",
      "gravity-ui",
      "gridicons",
      "grommet-icons",
      "guidance",
      "healthicons",
      "heroicons",
      "heroicons-outline",
      "heroicons-solid",
      "hugeicons",
      "humbleicons",
      "ic",
      "icomoon-free",
      "icon-park",
      "icon-park-outline",
      "icon-park-solid",
      "icon-park-twotone",
      "iconamoon",
      "iconoir",
      "icons8",
      "il",
      "ion",
      "iwwa",
      "jam",
      "la",
      "lets-icons",
      "line-md",
      "logos",
      "ls",
      "lucide",
      "lucide-lab",
      "mage",
      "majesticons",
      "maki",
      "map",
      "marketeq",
      "material-symbols",
      "material-symbols-light",
      "mdi",
      "mdi-light",
      "medical-icon",
      "memory",
      "meteocons",
      "mi",
      "mingcute",
      "mono-icons",
      "mynaui",
      "nimbus",
      "nonicons",
      "noto",
      "noto-v1",
      "octicon",
      "oi",
      "ooui",
      "openmoji",
      "oui",
      "pajamas",
      "pepicons",
      "pepicons-pencil",
      "pepicons-pop",
      "pepicons-print",
      "ph",
      "pixelarticons",
      "prime",
      "ps",
      "quill",
      "radix-icons",
      "raphael",
      "ri",
      "rivet-icons",
      "si-glyph",
      "simple-icons",
      "simple-line-icons",
      "skill-icons",
      "solar",
      "streamline",
      "streamline-emojis",
      "subway",
      "svg-spinners",
      "system-uicons",
      "tabler",
      "tdesign",
      "teenyicons",
      "token",
      "token-branded",
      "topcoat",
      "twemoji",
      "typcn",
      "uil",
      "uim",
      "uis",
      "uit",
      "uiw",
      "unjs",
      "vaadin",
      "vs",
      "vscode-icons",
      "websymbol",
      "weui",
      "whh",
      "wi",
      "wpf",
      "zmdi",
      "zondicons"
    ],
    "fetchTimeout": 1500
  }
};

const appConfig = defuFn(appConfig0, inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function pascalCase(str, opts) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => upperFirst(p)).join("") : "";
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner ?? "-") : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "a65e10b3-fa0c-4560-b8d9-db0bbea40a23",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/__nuxt_content/**": {
        "robots": false
      },
      "/__nuxt_content/content/sql_dump.txt": {
        "prerender": true
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_fonts/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {
    "mdc": {
      "components": {
        "prose": true,
        "map": {
          "accordion": "ProseAccordion",
          "accordion-item": "ProseAccordionItem",
          "badge": "ProseBadge",
          "callout": "ProseCallout",
          "card": "ProseCard",
          "card-group": "ProseCardGroup",
          "caution": "ProseCaution",
          "code-collapse": "ProseCodeCollapse",
          "code-group": "ProseCodeGroup",
          "code-icon": "ProseCodeIcon",
          "code-preview": "ProseCodePreview",
          "code-tree": "ProseCodeTree",
          "collapsible": "ProseCollapsible",
          "field": "ProseField",
          "field-group": "ProseFieldGroup",
          "icon": "ProseIcon",
          "kbd": "ProseKbd",
          "note": "ProseNote",
          "steps": "ProseSteps",
          "tabs": "ProseTabs",
          "tabs-item": "ProseTabsItem",
          "tip": "ProseTip",
          "warning": "ProseWarning"
        }
      },
      "headings": {
        "anchorLinks": {
          "h1": false,
          "h2": true,
          "h3": true,
          "h4": true,
          "h5": false,
          "h6": false
        }
      }
    },
    "studio": {
      "route": "/_studio",
      "dev": false,
      "development": {
        "server": ""
      },
      "repository": {
        "provider": "github",
        "owner": "fabianabarca",
        "repo": "araiza",
        "branch": "main",
        "rootDir": "",
        "private": true
      },
      "i18n": {
        "defaultLocale": "en"
      }
    },
    "content": {
      "wsUrl": ""
    }
  },
  "icon": {
    "serverKnownCssClasses": []
  },
  "studio": {
    "auth": {
      "sessionSecret": "e0463aa630d7d4bdf1f8120b5ab262cb",
      "github": {
        "clientId": "Ov23liffMjloY7pxFYxw",
        "clientSecret": "0ff59d9554f55cf9eb7f43d05145e3b6a6eb95f5"
      },
      "gitlab": {
        "applicationId": "",
        "applicationSecret": "",
        "instanceUrl": "https://gitlab.com"
      },
      "google": {
        "clientId": "",
        "clientSecret": ""
      }
    },
    "repository": {
      "provider": "github",
      "owner": "fabianabarca",
      "repo": "araiza",
      "branch": "main",
      "rootDir": "",
      "private": true
    }
  },
  "content": {
    "databaseVersion": "v3.5.0",
    "version": "3.8.0",
    "database": {
      "type": "sqlite",
      "filename": "./contents.sqlite"
    },
    "localDatabase": {
      "type": "sqlite",
      "filename": "/Users/fabian/Documents/dev/araiza/.data/content/contents.sqlite"
    },
    "integrityCheck": true
  },
  "ipx": {
    "baseURL": "/_ipx",
    "alias": {},
    "fs": {
      "dir": "../public"
    },
    "http": {
      "domains": []
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
const _sharedAppConfig = _deepFreeze(klona(appConfig));
function useAppConfig(event) {
  {
    return _sharedAppConfig;
  }
}
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (event.handled || isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
  errorObject.message ||= "Server Error";
  errorObject.data ||= error.data;
  errorObject.statusMessage ||= error.statusMessage;
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await import('../_/error-500.mjs');
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    if (header === "set-cookie") {
      appendResponseHeader(event, header, value);
      continue;
    }
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = "\"use strict\";(()=>{const t=window,e=document.documentElement,c=[\"dark\",\"light\"],n=getStorageValue(\"localStorage\",\"nuxt-color-mode\")||\"system\";let i=n===\"system\"?u():n;const r=e.getAttribute(\"data-color-mode-forced\");r&&(i=r),l(i),t[\"__NUXT_COLOR_MODE__\"]={preference:n,value:i,getColorScheme:u,addColorScheme:l,removeColorScheme:d};function l(o){const s=\"\"+o+\"\",a=\"\";e.classList?e.classList.add(s):e.className+=\" \"+s,a&&e.setAttribute(\"data-\"+a,o)}function d(o){const s=\"\"+o+\"\",a=\"\";e.classList?e.classList.remove(s):e.className=e.className.replace(new RegExp(s,\"g\"),\"\"),a&&e.removeAttribute(\"data-\"+a)}function f(o){return t.matchMedia(\"(prefers-color-scheme\"+o+\")\")}function u(){if(t.matchMedia&&f(\"\").media!==\"not all\"){for(const o of c)if(f(\":\"+o).matches)return o}return\"light\"}})();function getStorageValue(t,e){switch(t){case\"localStorage\":return window.localStorage.getItem(e);case\"sessionStorage\":return window.sessionStorage.getItem(e);case\"cookie\":return getCookie(e);default:return null}}function getCookie(t){const c=(\"; \"+window.document.cookie).split(\"; \"+t+\"=\");if(c.length===2)return c.pop()?.split(\";\").shift()}";

const _e7ili8NXkVlCY44Nm2nczb8S3mYnJTbrTd_skNtC9A = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

const plugins = [
  _e7ili8NXkVlCY44Nm2nczb8S3mYnJTbrTd_skNtC9A
];

const assets = {
  "/_payload.json": {
    "type": "application/json;charset=utf-8",
    "etag": "\"3854-kFd0Mimt3PlWoiPB7KRMouc/VXA\"",
    "mtime": "2025-12-12T15:43:07.059Z",
    "size": 14420,
    "path": "../public/_payload.json"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"10be-n8egyE9tcb7sKGr/pYCaQ4uWqxI\"",
    "mtime": "2025-12-12T15:43:07.550Z",
    "size": 4286,
    "path": "../public/favicon.ico"
  },
  "/index.html": {
    "type": "text/html;charset=utf-8",
    "etag": "\"24184-bYnoEsCcRbK4YUMXqXSd91g8JAU\"",
    "mtime": "2025-12-12T15:43:07.052Z",
    "size": 147844,
    "path": "../public/index.html"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-8KeALpAu2nWJknvJhMk31fqE06iajfSeiM57lsZAo5g.woff": {
    "type": "font/woff",
    "etag": "\"7e1c-vu25sJl+rJcafkFUI6hEMSxUm5M\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 32284,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-8KeALpAu2nWJknvJhMk31fqE06iajfSeiM57lsZAo5g.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-CAyrLGU3kauAbzcFnj2Cv_iAPV8wT2NEvNmrA_77Up0.woff": {
    "type": "font/woff",
    "etag": "\"7e14-MYF7t7EKTgujjt28CNpyCo0BoaE\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 32276,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-CAyrLGU3kauAbzcFnj2Cv_iAPV8wT2NEvNmrA_77Up0.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-Cbq5YGF_nsoQo6qYm9EhA3p-oINRUqlXhACZ2Wh4BBE.woff": {
    "type": "font/woff",
    "etag": "\"7f00-YtZhWVFcCeKqkmgcK+5PGF+sFSc\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 32512,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-Cbq5YGF_nsoQo6qYm9EhA3p-oINRUqlXhACZ2Wh4BBE.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-G1pKsfAhfeIECsLbuPUckyz92yuHFKi9rmiwlRl8Tb0.woff": {
    "type": "font/woff",
    "etag": "\"7e1c-gRoxz3CqcY4usq/vb5gcJX14NeE\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 32284,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-G1pKsfAhfeIECsLbuPUckyz92yuHFKi9rmiwlRl8Tb0.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-OnaIl8fChu9Cb4bpYiOA4dK_W7eeMCjXQOWR8tUhXJ0.woff": {
    "type": "font/woff",
    "etag": "\"7698-h4lCCjuBSv696ip7FasGUvxCRUA\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 30360,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-OnaIl8fChu9Cb4bpYiOA4dK_W7eeMCjXQOWR8tUhXJ0.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-kzEiBeXQ06q7fC06p1Y4RaOpLlRWCnHcCcSaqFMJ6fc.woff": {
    "type": "font/woff",
    "etag": "\"766c-pLN/uZMWKADTjjy74IyR9XCvD2Y\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 30316,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-kzEiBeXQ06q7fC06p1Y4RaOpLlRWCnHcCcSaqFMJ6fc.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-rmd8_oLeTXCNUhiFyy1UYsogNo6QYBr9dQHrhl_hLbs.woff": {
    "type": "font/woff",
    "etag": "\"7698-fRXO0Z8d51xEyh5Mi6SKX7Mnrbs\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 30360,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-rmd8_oLeTXCNUhiFyy1UYsogNo6QYBr9dQHrhl_hLbs.woff"
  },
  "/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-wjJHhPsTzX4mZm37l7bbvLDtOEIT1R38DKPlwV_Z34A.woff": {
    "type": "font/woff",
    "etag": "\"76e4-/c70YAFbfi6BmRZTjWuZ7cQZSSg\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 30436,
    "path": "../public/_fonts/1ZTlEDqU4DtwDJiND8f6qaugUpa0RIDvQl-v7iM6l54-wjJHhPsTzX4mZm37l7bbvLDtOEIT1R38DKPlwV_Z34A.woff"
  },
  "/_fonts/57NSSoFy1VLVs2gqly8Ls9awBnZMFyXGrefpmqvdqmc-zJfbBtpgM4cDmcXBsqZNW79_kFnlpPd62b48glgdydA.woff2": {
    "type": "font/woff2",
    "etag": "\"4b5c-TAo9mx7r3xQs52+HbHcHJ52z8Qo\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 19292,
    "path": "../public/_fonts/57NSSoFy1VLVs2gqly8Ls9awBnZMFyXGrefpmqvdqmc-zJfbBtpgM4cDmcXBsqZNW79_kFnlpPd62b48glgdydA.woff2"
  },
  "/_fonts/8VR2wSMN-3U4NbWAVYXlkRV6hA0jFBXP-0RtL3X7fko-x2gYI4qfmkRdxyQQUPaBZdZdgl1TeVrquF_TxHeM4lM.woff2": {
    "type": "font/woff2",
    "etag": "\"212c-FshXJibFzNhd2HEIMP8C3JR5PYg\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 8492,
    "path": "../public/_fonts/8VR2wSMN-3U4NbWAVYXlkRV6hA0jFBXP-0RtL3X7fko-x2gYI4qfmkRdxyQQUPaBZdZdgl1TeVrquF_TxHeM4lM.woff2"
  },
  "/_fonts/GsKUclqeNLJ96g5AU593ug6yanivOiwjW_7zESNPChw-jHA4tBeM1bjF7LATGUpfBuSTyomIFrWBTzjF7txVYfg.woff2": {
    "type": "font/woff2",
    "etag": "\"680c-mJtsV33lkTAKSmfq5k3lKHSllcU\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 26636,
    "path": "../public/_fonts/GsKUclqeNLJ96g5AU593ug6yanivOiwjW_7zESNPChw-jHA4tBeM1bjF7LATGUpfBuSTyomIFrWBTzjF7txVYfg.woff2"
  },
  "/_fonts/Ld1FnTo3yTIwDyGfTQ5-Fws9AWsCbKfMvgxduXr7JcY-W25bL8NF1fjpLRSOgJb7RoZPHqGQNwMTM7S9tHVoxx8.woff2": {
    "type": "font/woff2",
    "etag": "\"6ec4-8OoFFPZKF1grqmfGVjh5JDE6DOU\"",
    "mtime": "2025-12-12T15:43:07.431Z",
    "size": 28356,
    "path": "../public/_fonts/Ld1FnTo3yTIwDyGfTQ5-Fws9AWsCbKfMvgxduXr7JcY-W25bL8NF1fjpLRSOgJb7RoZPHqGQNwMTM7S9tHVoxx8.woff2"
  },
  "/_fonts/NdzqRASp2bovDUhQT1IRE_EMqKJ2KYQdTCfFcBvL8yw-KhwZiS86o3fErOe5GGMExHUemmI_dBfaEFxjISZrBd0.woff2": {
    "type": "font/woff2",
    "etag": "\"1d98-cDZfMibtk4T04FTTAmlfhWDpkN0\"",
    "mtime": "2025-12-12T15:43:07.432Z",
    "size": 7576,
    "path": "../public/_fonts/NdzqRASp2bovDUhQT1IRE_EMqKJ2KYQdTCfFcBvL8yw-KhwZiS86o3fErOe5GGMExHUemmI_dBfaEFxjISZrBd0.woff2"
  },
  "/_fonts/iTkrULNFJJkTvihIg1Vqi5IODRH_9btXCioVF5l98I8-AndUyau2HR2felA_ra8V2mutQgschhasE5FD1dXGJX8.woff2": {
    "type": "font/woff2",
    "etag": "\"47c4-5xyngHnzzhetUee74tMx9OTgqNQ\"",
    "mtime": "2025-12-12T15:43:07.432Z",
    "size": 18372,
    "path": "../public/_fonts/iTkrULNFJJkTvihIg1Vqi5IODRH_9btXCioVF5l98I8-AndUyau2HR2felA_ra8V2mutQgschhasE5FD1dXGJX8.woff2"
  },
  "/images/building.jpg": {
    "type": "image/jpeg",
    "etag": "\"11b898-0R5EpVBD6bmyyD++XyZVM8+ZOwc\"",
    "mtime": "2025-12-12T15:43:07.541Z",
    "size": 1161368,
    "path": "../public/images/building.jpg"
  },
  "/images/emilia.jpg": {
    "type": "image/jpeg",
    "etag": "\"22b6-n+S//04t4a/ofSwRwUuZjxlonMg\"",
    "mtime": "2025-12-12T15:43:07.542Z",
    "size": 8886,
    "path": "../public/images/emilia.jpg"
  },
  "/images/macbook-mobile.svg": {
    "type": "image/svg+xml",
    "etag": "\"10616b-A/6BGPW0gAxuVvaiwfUBcSIqKgw\"",
    "mtime": "2025-12-12T15:43:07.543Z",
    "size": 1073515,
    "path": "../public/images/macbook-mobile.svg"
  },
  "/images/macbook.svg": {
    "type": "image/svg+xml",
    "etag": "\"5d3657-i1aKNn1Nl/Fotu8d7PXcE/C+lkk\"",
    "mtime": "2025-12-12T15:43:07.545Z",
    "size": 6108759,
    "path": "../public/images/macbook.svg"
  },
  "/images/pablo.png": {
    "type": "image/png",
    "etag": "\"9f72-PYCPi1sFjxSw16zudJQync9UHmg\"",
    "mtime": "2025-12-12T15:43:07.542Z",
    "size": 40818,
    "path": "../public/images/pablo.png"
  },
  "/images/sofia.jpeg": {
    "type": "image/jpeg",
    "etag": "\"1a066-zX0ynGiCuzovss6if3uDl8cjyWk\"",
    "mtime": "2025-12-12T15:43:07.543Z",
    "size": 106598,
    "path": "../public/images/sofia.jpeg"
  },
  "/templates/dashboard.png": {
    "type": "image/png",
    "etag": "\"70eb4-qTGLDyFf9+LeyCIuIQs/EA89eVY\"",
    "mtime": "2025-12-12T15:43:07.541Z",
    "size": 462516,
    "path": "../public/templates/dashboard.png"
  },
  "/templates/docs.png": {
    "type": "image/png",
    "etag": "\"95cbd-44AVUPphrwGuD6WzS8Q1hhsgcl0\"",
    "mtime": "2025-12-12T15:43:07.546Z",
    "size": 613565,
    "path": "../public/templates/docs.png"
  },
  "/templates/landing.png": {
    "type": "image/png",
    "etag": "\"5ca22-nj6m+c6TUhnfqM94mpSIZr9tRTI\"",
    "mtime": "2025-12-12T15:43:07.547Z",
    "size": 379426,
    "path": "../public/templates/landing.png"
  },
  "/templates/saas.png": {
    "type": "image/png",
    "etag": "\"600aa-Nx4z2vaet4/LO9YFi/sO0uQNdI4\"",
    "mtime": "2025-12-12T15:43:07.547Z",
    "size": 393386,
    "path": "../public/templates/saas.png"
  },
  "/logos/applause.svg": {
    "type": "image/svg+xml",
    "etag": "\"1996-485gbVEUnt28lTNH5KuhwUOBW8I\"",
    "mtime": "2025-12-12T15:43:07.542Z",
    "size": 6550,
    "path": "../public/logos/applause.svg"
  },
  "/logos/blizzard.svg": {
    "type": "image/svg+xml",
    "etag": "\"64e6-OCIxkKuh9skrXkvcM/GhJEBhsgA\"",
    "mtime": "2025-12-12T15:43:07.542Z",
    "size": 25830,
    "path": "../public/logos/blizzard.svg"
  },
  "/logos/bodet.svg": {
    "type": "image/svg+xml",
    "etag": "\"bd7-+a7ZuS6aKBytdde1qxgcVipxbCU\"",
    "mtime": "2025-12-12T15:43:07.541Z",
    "size": 3031,
    "path": "../public/logos/bodet.svg"
  },
  "/logos/bosch.svg": {
    "type": "image/svg+xml",
    "etag": "\"fc0-aj/kZE7/M+K2+hgSJpGDcP26D8w\"",
    "mtime": "2025-12-12T15:43:07.543Z",
    "size": 4032,
    "path": "../public/logos/bosch.svg"
  },
  "/logos/churnkey.svg": {
    "type": "image/svg+xml",
    "etag": "\"143f-ndcwzXwdppA3gA2dAZisSbijfEY\"",
    "mtime": "2025-12-12T15:43:07.543Z",
    "size": 5183,
    "path": "../public/logos/churnkey.svg"
  },
  "/logos/exxonmobil.svg": {
    "type": "image/svg+xml",
    "etag": "\"946-wWgjXFjonQEr+FTpfTSggOdD+zg\"",
    "mtime": "2025-12-12T15:43:07.543Z",
    "size": 2374,
    "path": "../public/logos/exxonmobil.svg"
  },
  "/logos/funda.svg": {
    "type": "image/svg+xml",
    "etag": "\"10cb-A0qFKPkWyah0nlx0Kg7ByHoN3rI\"",
    "mtime": "2025-12-12T15:43:07.544Z",
    "size": 4299,
    "path": "../public/logos/funda.svg"
  },
  "/logos/insep.svg": {
    "type": "image/svg+xml",
    "etag": "\"edf-yYIFhu4gt8OJk8S7Mje+7Yqxs3s\"",
    "mtime": "2025-12-12T15:43:07.544Z",
    "size": 3807,
    "path": "../public/logos/insep.svg"
  },
  "/logos/instadapp.svg": {
    "type": "image/svg+xml",
    "etag": "\"c66-Tj6HjS18LDadOAppFmdfJPODle8\"",
    "mtime": "2025-12-12T15:43:07.544Z",
    "size": 3174,
    "path": "../public/logos/instadapp.svg"
  },
  "/logos/liegeairport.svg": {
    "type": "image/svg+xml",
    "etag": "\"eb5-PxKrwXqh4UmGepT+ylAQefgaoBg\"",
    "mtime": "2025-12-12T15:43:07.544Z",
    "size": 3765,
    "path": "../public/logos/liegeairport.svg"
  },
  "/logos/mainpost.svg": {
    "type": "image/svg+xml",
    "etag": "\"87a7-F6XwOu3A+M0Y6QLBaBLwBSXYrxY\"",
    "mtime": "2025-12-12T15:43:07.545Z",
    "size": 34727,
    "path": "../public/logos/mainpost.svg"
  },
  "/logos/springfieldclinic.svg": {
    "type": "image/svg+xml",
    "etag": "\"25cf-/VUsDoPHg+LALUVvylpM3HZWNuU\"",
    "mtime": "2025-12-12T15:43:07.547Z",
    "size": 9679,
    "path": "../public/logos/springfieldclinic.svg"
  },
  "/logos/tower.svg": {
    "type": "image/svg+xml",
    "etag": "\"f75-8S4coB/E26Tf3fnteIBPJqP/2Ks\"",
    "mtime": "2025-12-12T15:43:07.545Z",
    "size": 3957,
    "path": "../public/logos/tower.svg"
  },
  "/logos/win.svg": {
    "type": "image/svg+xml",
    "etag": "\"7e2-L8a+cvC/Zm2XlJLNkRVWJ4mRrX8\"",
    "mtime": "2025-12-12T15:43:07.545Z",
    "size": 2018,
    "path": "../public/logos/win.svg"
  },
  "/logos/wuniversity.svg": {
    "type": "image/svg+xml",
    "etag": "\"1657-9c4PPYLGNhqgsGpDYDpSwIrHrHQ\"",
    "mtime": "2025-12-12T15:43:07.545Z",
    "size": 5719,
    "path": "../public/logos/wuniversity.svg"
  },
  "/_nuxt/0Sl31KKD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2880-zu9edncUYYUMgDoii+j4SzaVIG8\"",
    "mtime": "2025-12-12T15:43:07.475Z",
    "size": 10368,
    "path": "../public/_nuxt/0Sl31KKD.js"
  },
  "/_nuxt/1xJNnwe2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"400f3-ipES1iahTB680EZZ7l+j9kDBGR4\"",
    "mtime": "2025-12-12T15:43:07.476Z",
    "size": 262387,
    "path": "../public/_nuxt/1xJNnwe2.js"
  },
  "/_nuxt/25uufFqr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"33e-DnyeRtrlt7er21/SCviuPXmDKh8\"",
    "mtime": "2025-12-12T15:43:07.475Z",
    "size": 830,
    "path": "../public/_nuxt/25uufFqr.js"
  },
  "/_nuxt/2zZglln9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4570-Z2T+qLPtljnigzGzugCTPMS/bzs\"",
    "mtime": "2025-12-12T15:43:07.475Z",
    "size": 17776,
    "path": "../public/_nuxt/2zZglln9.js"
  },
  "/_nuxt/3YuaWWWo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"213c-Nuqj0KUZaGGUpw3oXOcXlGbe12k\"",
    "mtime": "2025-12-12T15:43:07.475Z",
    "size": 8508,
    "path": "../public/_nuxt/3YuaWWWo.js"
  },
  "/_nuxt/3e1v2bzS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"244f-x//k8Ln2Mu2aG+nMmuAM/ZSHTfI\"",
    "mtime": "2025-12-12T15:43:07.475Z",
    "size": 9295,
    "path": "../public/_nuxt/3e1v2bzS.js"
  },
  "/_nuxt/3woP_u2B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1502-qzgXqixwjSi3hJ8xRB1K6YMyQaY\"",
    "mtime": "2025-12-12T15:43:07.475Z",
    "size": 5378,
    "path": "../public/_nuxt/3woP_u2B.js"
  },
  "/_nuxt/472DWLrP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"798-yfTIpZ0PaqEra09u95z5FzWYCWE\"",
    "mtime": "2025-12-12T15:43:07.476Z",
    "size": 1944,
    "path": "../public/_nuxt/472DWLrP.js"
  },
  "/_nuxt/4Hc6HGXF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"205-3nmAerQjieql0qUhGyPzndGn6io\"",
    "mtime": "2025-12-12T15:43:07.476Z",
    "size": 517,
    "path": "../public/_nuxt/4Hc6HGXF.js"
  },
  "/_nuxt/53qztwYa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"198d-BCis6TD8Yl0O5Qq24kL8AfqzoUI\"",
    "mtime": "2025-12-12T15:43:07.476Z",
    "size": 6541,
    "path": "../public/_nuxt/53qztwYa.js"
  },
  "/_nuxt/733plaHR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"67-cJTAglVF4J/JpAGZgQSTLVPpNjQ\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 103,
    "path": "../public/_nuxt/733plaHR.js"
  },
  "/_nuxt/7XlcXVQa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ad9-uPEA4yR1a1SO/dWH6I+047mCJg0\"",
    "mtime": "2025-12-12T15:43:07.476Z",
    "size": 15065,
    "path": "../public/_nuxt/7XlcXVQa.js"
  },
  "/_nuxt/86jdCehL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31c9-4/E04DwPRWNABX2f9CWzdiZ3RRo\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 12745,
    "path": "../public/_nuxt/86jdCehL.js"
  },
  "/_nuxt/8_-3s_Bj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d2c-B7aQ/7kYNQljNFVUqnIoDa7DZy8\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 7468,
    "path": "../public/_nuxt/8_-3s_Bj.js"
  },
  "/_nuxt/9TZRIaeo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b4a-RO0ye5GfG4vPfnmgyAs+JsPxwLk\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 2890,
    "path": "../public/_nuxt/9TZRIaeo.js"
  },
  "/_nuxt/9zORIc2h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3f6b-/N+8sgb4x3SJN0pjNNUXBgIgonY\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 16235,
    "path": "../public/_nuxt/9zORIc2h.js"
  },
  "/_nuxt/B-PjNM4a.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c5c-I1kzuHY3OE95vgTxvEsbw5wzrG8\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 7260,
    "path": "../public/_nuxt/B-PjNM4a.js"
  },
  "/_nuxt/B0eHsfVQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5ec4-sCVT6ZJfhsPdvmXynhoupSYE9Uk\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 24260,
    "path": "../public/_nuxt/B0eHsfVQ.js"
  },
  "/_nuxt/B0m2ddpp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48ca-vlOlJTQln4FlkoNCT6son9MOgUc\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 18634,
    "path": "../public/_nuxt/B0m2ddpp.js"
  },
  "/_nuxt/B15AROTr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2881-yF4YWiGS2GWsrtTFW0Qphy2wLRU\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 10369,
    "path": "../public/_nuxt/B15AROTr.js"
  },
  "/_nuxt/B2XEaXnQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 39,
    "path": "../public/_nuxt/B2XEaXnQ.js"
  },
  "/_nuxt/B2kmZfaf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"72a2-VVViWUdbjDcoL+IuhqNVwWqovtg\"",
    "mtime": "2025-12-12T15:43:07.477Z",
    "size": 29346,
    "path": "../public/_nuxt/B2kmZfaf.js"
  },
  "/_nuxt/B3rngx5Q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 39,
    "path": "../public/_nuxt/B3rngx5Q.js"
  },
  "/_nuxt/B4QzuZ2L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b2ec-cN4cDN+xmRsTAUgd473btctZsgg\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 45804,
    "path": "../public/_nuxt/B4QzuZ2L.js"
  },
  "/_nuxt/B6oZZGs2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"103d-y2mdaAhyQCzkhi3mGgmf6kHOMVU\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 4157,
    "path": "../public/_nuxt/B6oZZGs2.js"
  },
  "/_nuxt/B7NeWG51.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"196e6-X8PaO7bG8EacQHKj58Rj8+/45Y4\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 104166,
    "path": "../public/_nuxt/B7NeWG51.js"
  },
  "/_nuxt/B7k1aqNz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 39,
    "path": "../public/_nuxt/B7k1aqNz.js"
  },
  "/_nuxt/B7mTdjB0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"26d5-Zx7qpUhhqjqkejhteLDsh7vIk0c\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 9941,
    "path": "../public/_nuxt/B7mTdjB0.js"
  },
  "/_nuxt/B94Qwzeu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 39,
    "path": "../public/_nuxt/B94Qwzeu.js"
  },
  "/_nuxt/BBIIpcDP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a5d-Nh156Uqh9sl7TAkO78gvfiE2zlQ\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 6749,
    "path": "../public/_nuxt/BBIIpcDP.js"
  },
  "/_nuxt/BC7WJXp9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18b2-0UE34de74WpcNBDsFskyw+6DrJg\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 6322,
    "path": "../public/_nuxt/BC7WJXp9.js"
  },
  "/_nuxt/BDsvq1n7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 39,
    "path": "../public/_nuxt/BDsvq1n7.js"
  },
  "/_nuxt/BGhpM0X1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1719-fwtsRt/35Fi9XkrZt3QtXP/xtOM\"",
    "mtime": "2025-12-12T15:43:07.478Z",
    "size": 5913,
    "path": "../public/_nuxt/BGhpM0X1.js"
  },
  "/_nuxt/BHKX-nYO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1916-TEVm+BkRTPTcRFxdoG8k3x+CCOY\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 6422,
    "path": "../public/_nuxt/BHKX-nYO.js"
  },
  "/_nuxt/BHrmToEH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"54ef-pw/I1EX2/KxzFllBPS1M+AAbyx8\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 21743,
    "path": "../public/_nuxt/BHrmToEH.js"
  },
  "/_nuxt/BIWkp_7k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bbce-AKurOmZ6ua20f/IKvbjQJ9sbdeM\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 48078,
    "path": "../public/_nuxt/BIWkp_7k.js"
  },
  "/_nuxt/BJ-PaZUf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 39,
    "path": "../public/_nuxt/BJ-PaZUf.js"
  },
  "/_nuxt/BKT-WJif.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6340-oXh1X6pW+0IJZLZSiowwUUw3uvU\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 25408,
    "path": "../public/_nuxt/BKT-WJif.js"
  },
  "/_nuxt/BL6qoJ7x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"38e1-4IEHsZgfddU1Dr/+xTa3kIW2+YE\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 14561,
    "path": "../public/_nuxt/BL6qoJ7x.js"
  },
  "/_nuxt/BMEuibr7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"235e-Sl1/RpoGo74TxXZtJvSwT1onYkY\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 9054,
    "path": "../public/_nuxt/BMEuibr7.js"
  },
  "/_nuxt/BMdlg_Tf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a203-GuCXwddZHtXIMKvI5S4zahw3piA\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 41475,
    "path": "../public/_nuxt/BMdlg_Tf.js"
  },
  "/_nuxt/BMkYYGiN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e80-pNNT3gByDR6vX0ewRtNP5gsJlPg\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 7808,
    "path": "../public/_nuxt/BMkYYGiN.js"
  },
  "/_nuxt/BMovMmj5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"243a-WUNBgCUO2HFnqnU/bkJ7csvyM/8\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 9274,
    "path": "../public/_nuxt/BMovMmj5.js"
  },
  "/_nuxt/BMwXnwe8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13ac-6wqA6UvwScGEiX3Rsq10BzqqHv4\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 5036,
    "path": "../public/_nuxt/BMwXnwe8.js"
  },
  "/_nuxt/BNAasuqe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5d99-vulxeL7m0Ep8CclWQpeS//X+U1g\"",
    "mtime": "2025-12-12T15:43:07.479Z",
    "size": 23961,
    "path": "../public/_nuxt/BNAasuqe.js"
  },
  "/_nuxt/BPQ3VLAy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c358-mGmjlgi1tYtbl/r9q5mAvA8JVWU\"",
    "mtime": "2025-12-12T15:43:07.480Z",
    "size": 181080,
    "path": "../public/_nuxt/BPQ3VLAy.js"
  },
  "/_nuxt/BPi1LSSs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ed2-eLRrQnfEnv5yjvXafQxOl5hjYbA\"",
    "mtime": "2025-12-12T15:43:07.480Z",
    "size": 16082,
    "path": "../public/_nuxt/BPi1LSSs.js"
  },
  "/_nuxt/BQ6Z4_Vj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5dc1-NccRj+zit15aFiIYDaGzTN2vHD4\"",
    "mtime": "2025-12-12T15:43:07.480Z",
    "size": 24001,
    "path": "../public/_nuxt/BQ6Z4_Vj.js"
  },
  "/_nuxt/BQ9ptESM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2df-Z9b8+QKAdVEMrHSXaN9Th8n57SE\"",
    "mtime": "2025-12-12T15:43:07.480Z",
    "size": 735,
    "path": "../public/_nuxt/BQ9ptESM.js"
  },
  "/_nuxt/BQHj_tF8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20e52-P5XMG9r3+YBTIwBqXTMJwU/tMco\"",
    "mtime": "2025-12-12T15:43:07.481Z",
    "size": 134738,
    "path": "../public/_nuxt/BQHj_tF8.js"
  },
  "/_nuxt/BQRtE_qn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f1-vZnaQ0+I+tQsRMRe9Y/1uoXS4Jg\"",
    "mtime": "2025-12-12T15:43:07.480Z",
    "size": 497,
    "path": "../public/_nuxt/BQRtE_qn.js"
  },
  "/_nuxt/BRHMapyZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14c9-SpHFr1KmLroqKOgVQGrz2Qv09aw\"",
    "mtime": "2025-12-12T15:43:07.480Z",
    "size": 5321,
    "path": "../public/_nuxt/BRHMapyZ.js"
  },
  "/_nuxt/BRMquDBY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"be64a-kOxVZz+qcGNt9Si/lVdqpj518K4\"",
    "mtime": "2025-12-12T15:43:07.482Z",
    "size": 779850,
    "path": "../public/_nuxt/BRMquDBY.js"
  },
  "/_nuxt/BRYrk-iV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15465-reU5Dfcq2U+lqP+lEueRVQ++/Ak\"",
    "mtime": "2025-12-12T15:43:07.481Z",
    "size": 87141,
    "path": "../public/_nuxt/BRYrk-iV.js"
  },
  "/_nuxt/BRkevYD-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36c-Cxz4xMziEB+1JPHcA75jvLAnt6g\"",
    "mtime": "2025-12-12T15:43:07.480Z",
    "size": 876,
    "path": "../public/_nuxt/BRkevYD-.js"
  },
  "/_nuxt/BS5mEIPT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9dc-yQIZYf9ymrvgDi4GR2brt14R4fk\"",
    "mtime": "2025-12-12T15:43:07.481Z",
    "size": 2524,
    "path": "../public/_nuxt/BS5mEIPT.js"
  },
  "/_nuxt/BTB304A0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"331-fWPA4S6Q7t18O4+2duj7z8I2D6g\"",
    "mtime": "2025-12-12T15:43:07.481Z",
    "size": 817,
    "path": "../public/_nuxt/BTB304A0.js"
  },
  "/_nuxt/BTK36I5C.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1eb9-Dl0EUC9xRVZx9hRE2mvTHzEkuwQ\"",
    "mtime": "2025-12-12T15:43:07.481Z",
    "size": 7865,
    "path": "../public/_nuxt/BTK36I5C.js"
  },
  "/_nuxt/BTSicUR-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e54-69jl74cUVYA+tr+BuFoqTtQd+js\"",
    "mtime": "2025-12-12T15:43:07.481Z",
    "size": 3668,
    "path": "../public/_nuxt/BTSicUR-.js"
  },
  "/_nuxt/BUB-_BlF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c79-DG9Vd/WdPqODHfgHt4dxSVZL3Wg\"",
    "mtime": "2025-12-12T15:43:07.482Z",
    "size": 11385,
    "path": "../public/_nuxt/BUB-_BlF.js"
  },
  "/_nuxt/BUZOOp26.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4e44-+6EEIIaWD/pRrHDzzQXRa0MoZ9k\"",
    "mtime": "2025-12-12T15:43:07.482Z",
    "size": 20036,
    "path": "../public/_nuxt/BUZOOp26.js"
  },
  "/_nuxt/BV6ZFUIw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1afe-wd3VPBjSgczU/b60E/+67DlCI24\"",
    "mtime": "2025-12-12T15:43:07.482Z",
    "size": 6910,
    "path": "../public/_nuxt/BV6ZFUIw.js"
  },
  "/_nuxt/BVu0TwaT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3254-HzVAeAagMHiNrDn6vIf/Fx109W8\"",
    "mtime": "2025-12-12T15:43:07.482Z",
    "size": 12884,
    "path": "../public/_nuxt/BVu0TwaT.js"
  },
  "/_nuxt/BWo__f3v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.482Z",
    "size": 39,
    "path": "../public/_nuxt/BWo__f3v.js"
  },
  "/_nuxt/BX6bBSww.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6a4f-Z5UsxDpgW3hCBmEpMZmSzQUU8sY\"",
    "mtime": "2025-12-12T15:43:07.483Z",
    "size": 27215,
    "path": "../public/_nuxt/BX6bBSww.js"
  },
  "/_nuxt/BXOsFz_5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"52ee-Mqte2c+GE/m8hiJtflvLdMoe+bA\"",
    "mtime": "2025-12-12T15:43:07.482Z",
    "size": 21230,
    "path": "../public/_nuxt/BXOsFz_5.js"
  },
  "/_nuxt/BXkSAIEj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5254-Axn1fQr9TF+GkmVdLvo6H+JJ8B8\"",
    "mtime": "2025-12-12T15:43:07.483Z",
    "size": 21076,
    "path": "../public/_nuxt/BXkSAIEj.js"
  },
  "/_nuxt/BXrjvC_e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c21-oWuRcsHECvQzmkeWkF5kpjYZcCU\"",
    "mtime": "2025-12-12T15:43:07.482Z",
    "size": 3105,
    "path": "../public/_nuxt/BXrjvC_e.js"
  },
  "/_nuxt/BYiqpiH1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"267b-hygq6tairLtzNl+Kj8tDVwkfg1E\"",
    "mtime": "2025-12-12T15:43:07.483Z",
    "size": 9851,
    "path": "../public/_nuxt/BYiqpiH1.js"
  },
  "/_nuxt/B_aAtKwh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f1-Bw7Mcr4Tc7pSve5pM2RRNwMFO+E\"",
    "mtime": "2025-12-12T15:43:07.483Z",
    "size": 497,
    "path": "../public/_nuxt/B_aAtKwh.js"
  },
  "/_nuxt/B_g76Rrg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18c-ASWbl3RBH3t510IGRBvLU6v/aMQ\"",
    "mtime": "2025-12-12T15:43:07.483Z",
    "size": 396,
    "path": "../public/_nuxt/B_g76Rrg.js"
  },
  "/_nuxt/B_rMirtH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5206-4/leJXlNg/2zrOjJyDYr1z8hF58\"",
    "mtime": "2025-12-12T15:43:07.484Z",
    "size": 20998,
    "path": "../public/_nuxt/B_rMirtH.js"
  },
  "/_nuxt/B_tE-cwx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.483Z",
    "size": 39,
    "path": "../public/_nuxt/B_tE-cwx.js"
  },
  "/_nuxt/BakN2MvJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29fc0-WedSIk71YK6RzB7UFg+9MM8wh9o\"",
    "mtime": "2025-12-12T15:43:07.485Z",
    "size": 171968,
    "path": "../public/_nuxt/BakN2MvJ.js"
  },
  "/_nuxt/BbdjbNvB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"eb3-Uy4aiUSFeN/yZLstF6ZLoBBLm6Q\"",
    "mtime": "2025-12-12T15:43:07.484Z",
    "size": 3763,
    "path": "../public/_nuxt/BbdjbNvB.js"
  },
  "/_nuxt/BcSOvMDS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5831-ebx2LDBbyl1CabAwCnJ76Dcn0/E\"",
    "mtime": "2025-12-12T15:43:07.484Z",
    "size": 22577,
    "path": "../public/_nuxt/BcSOvMDS.js"
  },
  "/_nuxt/Bd-qSqKc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.484Z",
    "size": 39,
    "path": "../public/_nuxt/Bd-qSqKc.js"
  },
  "/_nuxt/BdQN-eWz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7156c-sRA1PNS82+YSYtdbdylcQbVIfnU\"",
    "mtime": "2025-12-12T15:43:07.485Z",
    "size": 464236,
    "path": "../public/_nuxt/BdQN-eWz.js"
  },
  "/_nuxt/BeH_lNCL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e2c-kiXK1PmPiZHnGJwxKZ07H/u/EEU\"",
    "mtime": "2025-12-12T15:43:07.484Z",
    "size": 3628,
    "path": "../public/_nuxt/BeH_lNCL.js"
  },
  "/_nuxt/BelEqBTN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15f-2fQFlHOBPWlNUNbarfiGPzXCdiE\"",
    "mtime": "2025-12-12T15:43:07.484Z",
    "size": 351,
    "path": "../public/_nuxt/BelEqBTN.js"
  },
  "/_nuxt/Beq1YlA8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a05-ZXoS3u07VK+OSw8StqGGAWWtitU\"",
    "mtime": "2025-12-12T15:43:07.484Z",
    "size": 2565,
    "path": "../public/_nuxt/Beq1YlA8.js"
  },
  "/_nuxt/Bezqvdcr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"471-F64VcNF+1pDuDVN+gM3lHzE35zg\"",
    "mtime": "2025-12-12T15:43:07.485Z",
    "size": 1137,
    "path": "../public/_nuxt/Bezqvdcr.js"
  },
  "/_nuxt/Bf0mGI_f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"164-ZRJcJ5ZaC/zkFocjin/PkLpr/2c\"",
    "mtime": "2025-12-12T15:43:07.485Z",
    "size": 356,
    "path": "../public/_nuxt/Bf0mGI_f.js"
  },
  "/_nuxt/BfHTSMKl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48c5-2KtadDLdcujxXy8y4Bt2hElnnOs\"",
    "mtime": "2025-12-12T15:43:07.485Z",
    "size": 18629,
    "path": "../public/_nuxt/BfHTSMKl.js"
  },
  "/_nuxt/BfVEnfwa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"770-rOFJKZ/9wbM91cTyU0s026ja32M\"",
    "mtime": "2025-12-12T15:43:07.485Z",
    "size": 1904,
    "path": "../public/_nuxt/BfVEnfwa.js"
  },
  "/_nuxt/BfjtVDDH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"37c3-xDmtEk31qK1Bh5UReLYFJAKxJ5I\"",
    "mtime": "2025-12-12T15:43:07.485Z",
    "size": 14275,
    "path": "../public/_nuxt/BfjtVDDH.js"
  },
  "/_nuxt/BgDCqdQA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d1f1-Hu9sPs6I5PgTPGWd3WR7nOwmRy8\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 53745,
    "path": "../public/_nuxt/BgDCqdQA.js"
  },
  "/_nuxt/BgTu1LHq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b2d-ZHV16//gKVVYzfl8/RJcs+FxecY\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 6957,
    "path": "../public/_nuxt/BgTu1LHq.js"
  },
  "/_nuxt/Bh4nXucN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8ba-iEq/31lFf7NFGWTqEGvQg1rI3jI\"",
    "mtime": "2025-12-12T15:43:07.485Z",
    "size": 2234,
    "path": "../public/_nuxt/Bh4nXucN.js"
  },
  "/_nuxt/BhJCBb_s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b6b-Qyu0AWW4GZaMMjtMex7Q2tcZ2dM\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 23403,
    "path": "../public/_nuxt/BhJCBb_s.js"
  },
  "/_nuxt/Bho0cBcH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 39,
    "path": "../public/_nuxt/Bho0cBcH.js"
  },
  "/_nuxt/BjAqecqh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cb7-BKoXvvw8itSCl3G/Q/8NLPX9DTQ\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 3255,
    "path": "../public/_nuxt/BjAqecqh.js"
  },
  "/_nuxt/BjSij5jK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48b7-CJZAUj4SYa7cWrWmLW1ca67ky3Y\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 18615,
    "path": "../public/_nuxt/BjSij5jK.js"
  },
  "/_nuxt/BjuciIjl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"158-y7vG1LJGIkD5hXHEVDl6TxLbvGc\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 344,
    "path": "../public/_nuxt/BjuciIjl.js"
  },
  "/_nuxt/Bjziz1JB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"908-9RqlnfHCWKIlde5B0kBHB/B+TtM\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 2312,
    "path": "../public/_nuxt/Bjziz1JB.js"
  },
  "/_nuxt/BkauQU_u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f44-tb8SzOnJShehwgJLbBFyt1c83Hw\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 3908,
    "path": "../public/_nuxt/BkauQU_u.js"
  },
  "/_nuxt/Bkuqu6BP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"356d-zBk2O671hcu14yjA5BaP8bRgML4\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 13677,
    "path": "../public/_nuxt/Bkuqu6BP.js"
  },
  "/_nuxt/BmG1tMr6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c33-tNXZB8f2yvz/LpzvxBvjd+GUtuE\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 3123,
    "path": "../public/_nuxt/BmG1tMr6.js"
  },
  "/_nuxt/BmOUBSyb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3da-WuYAgQ9L0xBpCxY60ZXyUJ+5AIs\"",
    "mtime": "2025-12-12T15:43:07.486Z",
    "size": 986,
    "path": "../public/_nuxt/BmOUBSyb.js"
  },
  "/_nuxt/BmfdQ1bx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3873c-xnhjzSbMterLpJduaSA1kcIsPfE\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 231228,
    "path": "../public/_nuxt/BmfdQ1bx.js"
  },
  "/_nuxt/BmvpedE_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22d-EX+K+kikPUC1NmxTWNGoSslrTGc\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 557,
    "path": "../public/_nuxt/BmvpedE_.js"
  },
  "/_nuxt/BpucmfEo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"125a-i8UgZMDBuou5kmDmlqzJ3zs5v1I\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 4698,
    "path": "../public/_nuxt/BpucmfEo.js"
  },
  "/_nuxt/BqLCQ-9M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"190-Q5JHWlDUmhXTur7NIysugGhzVDQ\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 400,
    "path": "../public/_nuxt/BqLCQ-9M.js"
  },
  "/_nuxt/BsHhGFQr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48ca-vlOlJTQln4FlkoNCT6son9MOgUc\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 18634,
    "path": "../public/_nuxt/BsHhGFQr.js"
  },
  "/_nuxt/BsukS3Co.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e16-44RsS8PbdQG4FKY5Q0SaPrjr6LE\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 3606,
    "path": "../public/_nuxt/BsukS3Co.js"
  },
  "/_nuxt/Bsx6RkUC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"123b-X8XdXVI6pvo+CvEVkh/agYg5jDo\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 4667,
    "path": "../public/_nuxt/Bsx6RkUC.js"
  },
  "/_nuxt/Bt5sWonO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"165-w4lwifIVUph1ETFZMzTmmnQHzxE\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 357,
    "path": "../public/_nuxt/Bt5sWonO.js"
  },
  "/_nuxt/BthQWCQV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"239d-LHMBsyUFh86qGFvM+u7t3WkZtbw\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 9117,
    "path": "../public/_nuxt/BthQWCQV.js"
  },
  "/_nuxt/Buea-lGh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"290a-GCHC0QDId6leZ9Xhk+7ArK7tKlc\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 10506,
    "path": "../public/_nuxt/Buea-lGh.js"
  },
  "/_nuxt/BvU2mrjJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6f54-+spDjLlZVG/PFzxKCwWEcyjqTiw\"",
    "mtime": "2025-12-12T15:43:07.487Z",
    "size": 28500,
    "path": "../public/_nuxt/BvU2mrjJ.js"
  },
  "/_nuxt/Bw305WKR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5125-tbBJwAwza6HClVoP6OvDw/UyczE\"",
    "mtime": "2025-12-12T15:43:07.488Z",
    "size": 20773,
    "path": "../public/_nuxt/Bw305WKR.js"
  },
  "/_nuxt/BwhC-gul.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d26-PHOJKLTdOj5dsdV6WdcT3zgfq3I\"",
    "mtime": "2025-12-12T15:43:07.488Z",
    "size": 3366,
    "path": "../public/_nuxt/BwhC-gul.js"
  },
  "/_nuxt/BwzhyHgN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1909-YT/CdVjpRwdOenN7fFQHzbQ8AEA\"",
    "mtime": "2025-12-12T15:43:07.488Z",
    "size": 6409,
    "path": "../public/_nuxt/BwzhyHgN.js"
  },
  "/_nuxt/ByjhMWvG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b9f6-15KxjNb2tpNWQNbEBvAK0HDxXxY\"",
    "mtime": "2025-12-12T15:43:07.488Z",
    "size": 47606,
    "path": "../public/_nuxt/ByjhMWvG.js"
  },
  "/_nuxt/BzJJZx-M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"524a-+n2NQF4pUrirtbVLSya0Zll9gp8\"",
    "mtime": "2025-12-12T15:43:07.488Z",
    "size": 21066,
    "path": "../public/_nuxt/BzJJZx-M.js"
  },
  "/_nuxt/C-Jbm3Hp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2310-lFhL4W/OHHbKAVRYS3Bclqg/Yow\"",
    "mtime": "2025-12-12T15:43:07.488Z",
    "size": 8976,
    "path": "../public/_nuxt/C-Jbm3Hp.js"
  },
  "/_nuxt/C05G7wsG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"295e-88jG8k7V5+184fGJ8iEM7CW4GdI\"",
    "mtime": "2025-12-12T15:43:07.488Z",
    "size": 10590,
    "path": "../public/_nuxt/C05G7wsG.js"
  },
  "/_nuxt/C0xm6IFG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6a3c-3pEX1g8X21//fiD+OZ2PVoGZ2j0\"",
    "mtime": "2025-12-12T15:43:07.488Z",
    "size": 27196,
    "path": "../public/_nuxt/C0xm6IFG.js"
  },
  "/_nuxt/C1iPtDC-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b7-iVN4a61Y/h/MnadQntMzGxD+8NM\"",
    "mtime": "2025-12-12T15:43:07.488Z",
    "size": 695,
    "path": "../public/_nuxt/C1iPtDC-.js"
  },
  "/_nuxt/C1kzXVmM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d9fb-y9Y9loshQCF0xUq37MIakoq0YRM\"",
    "mtime": "2025-12-12T15:43:07.489Z",
    "size": 55803,
    "path": "../public/_nuxt/C1kzXVmM.js"
  },
  "/_nuxt/C2XR0WSg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"211-buWDXvlO7CCtW0eHsmh4EO0P8s8\"",
    "mtime": "2025-12-12T15:43:07.488Z",
    "size": 529,
    "path": "../public/_nuxt/C2XR0WSg.js"
  },
  "/_nuxt/C39BiMTA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"70f1-XkEMDsROL+KqTkmkI7vaY0QDB/s\"",
    "mtime": "2025-12-12T15:43:07.489Z",
    "size": 28913,
    "path": "../public/_nuxt/C39BiMTA.js"
  },
  "/_nuxt/C3CoxISH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6b0f-0f196UMf4Jg5EF3V0Y9F+do3/0c\"",
    "mtime": "2025-12-12T15:43:07.489Z",
    "size": 27407,
    "path": "../public/_nuxt/C3CoxISH.js"
  },
  "/_nuxt/C6IZntRg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"898e5-n99JipCYe6OGE4VVIZfWFxk4OoU\"",
    "mtime": "2025-12-12T15:43:07.490Z",
    "size": 563429,
    "path": "../public/_nuxt/C6IZntRg.js"
  },
  "/_nuxt/C6Q4yPHT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11a7-+yeBMVwLDwkr9RSTe4HpmrDydgU\"",
    "mtime": "2025-12-12T15:43:07.489Z",
    "size": 4519,
    "path": "../public/_nuxt/C6Q4yPHT.js"
  },
  "/_nuxt/C6RKEfVn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b6d-MBAmIIxg3i+nk+OD2fk+ErGW4oc\"",
    "mtime": "2025-12-12T15:43:07.489Z",
    "size": 2925,
    "path": "../public/_nuxt/C6RKEfVn.js"
  },
  "/_nuxt/C6jVxvUn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a20e-EcYyMFpCsm/hgEX+nOYeFr2nyZ0\"",
    "mtime": "2025-12-12T15:43:07.489Z",
    "size": 41486,
    "path": "../public/_nuxt/C6jVxvUn.js"
  },
  "/_nuxt/C8C9IGe9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"213ae-mGeZw+gH4s2yg9wYKoIFlvHgwxs\"",
    "mtime": "2025-12-12T15:43:07.490Z",
    "size": 136110,
    "path": "../public/_nuxt/C8C9IGe9.js"
  },
  "/_nuxt/C8CShkT6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cb2-n0j4G5dVNAfSyXlqLEOHVX552ic\"",
    "mtime": "2025-12-12T15:43:07.489Z",
    "size": 3250,
    "path": "../public/_nuxt/C8CShkT6.js"
  },
  "/_nuxt/C8M2exoo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d1f4-DRqIliTj8jrkpY6QITy6jlt6T6w\"",
    "mtime": "2025-12-12T15:43:07.491Z",
    "size": 53748,
    "path": "../public/_nuxt/C8M2exoo.js"
  },
  "/_nuxt/C9dUb6Cb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b898-D//F1VTec6VOvR0PtDhv4wo4F3o\"",
    "mtime": "2025-12-12T15:43:07.490Z",
    "size": 47256,
    "path": "../public/_nuxt/C9dUb6Cb.js"
  },
  "/_nuxt/CA7IoVui.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"df8c-QCcaks9KB2IZZgedJNvDeM1eAWU\"",
    "mtime": "2025-12-12T15:43:07.490Z",
    "size": 57228,
    "path": "../public/_nuxt/CA7IoVui.js"
  },
  "/_nuxt/CByJ2f1G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17c9-h2L2N+2h06Q4LPo9qdE6lsz5+cc\"",
    "mtime": "2025-12-12T15:43:07.490Z",
    "size": 6089,
    "path": "../public/_nuxt/CByJ2f1G.js"
  },
  "/_nuxt/CCCEh_av.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a0d-WnbgHOyDP9cBE8lDdY/v/YE2gJw\"",
    "mtime": "2025-12-12T15:43:07.490Z",
    "size": 2573,
    "path": "../public/_nuxt/CCCEh_av.js"
  },
  "/_nuxt/CCj5rSy1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17d5d-ger+3qBlpl5yHOSBlaE2Vi5/gdk\"",
    "mtime": "2025-12-12T15:43:07.491Z",
    "size": 97629,
    "path": "../public/_nuxt/CCj5rSy1.js"
  },
  "/_nuxt/CCxlPNNC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"da49-89rWGq/3c8vdx0VELxSktPXq8qo\"",
    "mtime": "2025-12-12T15:43:07.492Z",
    "size": 55881,
    "path": "../public/_nuxt/CCxlPNNC.js"
  },
  "/_nuxt/CE7OidaQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19eb-fY1GEWUsMn0se9GPRqUVEVDaU9w\"",
    "mtime": "2025-12-12T15:43:07.491Z",
    "size": 6635,
    "path": "../public/_nuxt/CE7OidaQ.js"
  },
  "/_nuxt/CFHQjOhq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5869-XrrvvE3T9W/Ui3W7fRUvxWPqAO4\"",
    "mtime": "2025-12-12T15:43:07.491Z",
    "size": 22633,
    "path": "../public/_nuxt/CFHQjOhq.js"
  },
  "/_nuxt/CFiHRDIx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"167-TxADTq8eGReMrIS83e8+o9PZpWI\"",
    "mtime": "2025-12-12T15:43:07.491Z",
    "size": 359,
    "path": "../public/_nuxt/CFiHRDIx.js"
  },
  "/_nuxt/CFkEKB6L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"341-AeVM78lGE/mulU+/uf8X7/usDW8\"",
    "mtime": "2025-12-12T15:43:07.491Z",
    "size": 833,
    "path": "../public/_nuxt/CFkEKB6L.js"
  },
  "/_nuxt/CFtInczE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d68-4AsCGgnQsAFYUckoMmDYr4cagmY\"",
    "mtime": "2025-12-12T15:43:07.492Z",
    "size": 3432,
    "path": "../public/_nuxt/CFtInczE.js"
  },
  "/_nuxt/CG6Dc4jp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"97f00-rYm+CybCMCqxOZ2Np2GsfIrREbo\"",
    "mtime": "2025-12-12T15:43:07.493Z",
    "size": 622336,
    "path": "../public/_nuxt/CG6Dc4jp.js"
  },
  "/_nuxt/CGCykLCN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4f89-7oSNePRIuxR2H88PlyR6smLPtuA\"",
    "mtime": "2025-12-12T15:43:07.492Z",
    "size": 20361,
    "path": "../public/_nuxt/CGCykLCN.js"
  },
  "/_nuxt/CGXukZHN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14ff-m2kJFfctW1sm2UuxC89yXs2wzpM\"",
    "mtime": "2025-12-12T15:43:07.491Z",
    "size": 5375,
    "path": "../public/_nuxt/CGXukZHN.js"
  },
  "/_nuxt/CGjxJ4Zd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12b7-9orWPhB6qn+WMdsZwBCmyPeUwkY\"",
    "mtime": "2025-12-12T15:43:07.492Z",
    "size": 4791,
    "path": "../public/_nuxt/CGjxJ4Zd.js"
  },
  "/_nuxt/CH1njM8p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"586c-1ZAp+0fULnO1jBcrgqPtsC5TWrg\"",
    "mtime": "2025-12-12T15:43:07.492Z",
    "size": 22636,
    "path": "../public/_nuxt/CH1njM8p.js"
  },
  "/_nuxt/CHA1aero.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.492Z",
    "size": 39,
    "path": "../public/_nuxt/CHA1aero.js"
  },
  "/_nuxt/CHGiaTD_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14d8-P1iqyzcoOecM8V1WkmohwmAQhlo\"",
    "mtime": "2025-12-12T15:43:07.493Z",
    "size": 5336,
    "path": "../public/_nuxt/CHGiaTD_.js"
  },
  "/_nuxt/CHX6lpGW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9f09-6MPu9CARKk8BifI56N7yfHQK0ko\"",
    "mtime": "2025-12-12T15:43:07.493Z",
    "size": 40713,
    "path": "../public/_nuxt/CHX6lpGW.js"
  },
  "/_nuxt/CHymfPHL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ca9-JauxDqdkEC3G/Pupxb0FPL8whP8\"",
    "mtime": "2025-12-12T15:43:07.493Z",
    "size": 11433,
    "path": "../public/_nuxt/CHymfPHL.js"
  },
  "/_nuxt/CIjQ9FOy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"63ba-16GX0koU1jiJbcGpdnlj55kPdQk\"",
    "mtime": "2025-12-12T15:43:07.492Z",
    "size": 25530,
    "path": "../public/_nuxt/CIjQ9FOy.js"
  },
  "/_nuxt/CLHHXU5e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"869-ysPuSQQwBWU1NNJxs9bDp8zp3Fw\"",
    "mtime": "2025-12-12T15:43:07.492Z",
    "size": 2153,
    "path": "../public/_nuxt/CLHHXU5e.js"
  },
  "/_nuxt/CLMKnQwA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11b5c-MQEwD/rg75zupdM1mK1VoVRUO9U\"",
    "mtime": "2025-12-12T15:43:07.493Z",
    "size": 72540,
    "path": "../public/_nuxt/CLMKnQwA.js"
  },
  "/_nuxt/CLoN-gBj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18b6-cXKKLpncNdAhO8DSU6T+8C+Q3qg\"",
    "mtime": "2025-12-12T15:43:07.493Z",
    "size": 6326,
    "path": "../public/_nuxt/CLoN-gBj.js"
  },
  "/_nuxt/CLr6Fo9F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b5f-X6IbqsURM2Db3pkP9VVj9fzbrec\"",
    "mtime": "2025-12-12T15:43:07.493Z",
    "size": 15199,
    "path": "../public/_nuxt/CLr6Fo9F.js"
  },
  "/_nuxt/CMVPODJ3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.493Z",
    "size": 39,
    "path": "../public/_nuxt/CMVPODJ3.js"
  },
  "/_nuxt/CMkPZNj1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cd4-iGXb58wp6XCkuBHk5s7oJy+y4Kk\"",
    "mtime": "2025-12-12T15:43:07.493Z",
    "size": 3284,
    "path": "../public/_nuxt/CMkPZNj1.js"
  },
  "/_nuxt/COLdYNrY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.493Z",
    "size": 39,
    "path": "../public/_nuxt/COLdYNrY.js"
  },
  "/_nuxt/COt5Ahok.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2adb0-ggLfNVkEhlpfCBmcvdtrZa7kwzY\"",
    "mtime": "2025-12-12T15:43:07.494Z",
    "size": 175536,
    "path": "../public/_nuxt/COt5Ahok.js"
  },
  "/_nuxt/COxH0dx9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8442-z9W5nZN48F525GH7NXL7Oi5YqXI\"",
    "mtime": "2025-12-12T15:43:07.494Z",
    "size": 33858,
    "path": "../public/_nuxt/COxH0dx9.js"
  },
  "/_nuxt/CPBUlv3A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2acd-RMWV2ZppBQ8FCKIC3TY7TojStsQ\"",
    "mtime": "2025-12-12T15:43:07.494Z",
    "size": 10957,
    "path": "../public/_nuxt/CPBUlv3A.js"
  },
  "/_nuxt/CPMNWgBZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"190d-6UGsw28lhYy8jVKnmX9RyqkFiwU\"",
    "mtime": "2025-12-12T15:43:07.494Z",
    "size": 6413,
    "path": "../public/_nuxt/CPMNWgBZ.js"
  },
  "/_nuxt/CQWU8NGy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"194-/xBIkAh4hAUZ2Gn+Zv4eS+Uxk4U\"",
    "mtime": "2025-12-12T15:43:07.494Z",
    "size": 404,
    "path": "../public/_nuxt/CQWU8NGy.js"
  },
  "/_nuxt/CRh8rtra.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 39,
    "path": "../public/_nuxt/CRh8rtra.js"
  },
  "/_nuxt/CRu9rlrP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b67c-IWiCo0lvd5640z66oFayhG8fQvs\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 177788,
    "path": "../public/_nuxt/CRu9rlrP.js"
  },
  "/_nuxt/CS3Unz2-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"82d6-aUEs94AcfLqjSVpnmdfYdfX5koA\"",
    "mtime": "2025-12-12T15:43:07.494Z",
    "size": 33494,
    "path": "../public/_nuxt/CS3Unz2-.js"
  },
  "/_nuxt/CSZk7E48.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3e6-qkjw176ijTD8B5jQ53dkJPYl7KA\"",
    "mtime": "2025-12-12T15:43:07.494Z",
    "size": 998,
    "path": "../public/_nuxt/CSZk7E48.js"
  },
  "/_nuxt/CTRr51gU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b39-AV5b5gMlIyFBg8ZLVvBtodDGnYI\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 6969,
    "path": "../public/_nuxt/CTRr51gU.js"
  },
  "/_nuxt/CUdkBHad.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e1e-riE6n1G1Mt3XN4SiMztDXtw+iO8\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 3614,
    "path": "../public/_nuxt/CUdkBHad.js"
  },
  "/_nuxt/CVO1_9PV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3530-TayDmxRMvy5Bv+gyldrxxN/vEUA\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 13616,
    "path": "../public/_nuxt/CVO1_9PV.js"
  },
  "/_nuxt/CVdnzihN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5869-0wTL7NugVjSeNU6NYBqZWcPB9LQ\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 22633,
    "path": "../public/_nuxt/CVdnzihN.js"
  },
  "/_nuxt/CVxzReF4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b6b3-8PJDzN6Nv4LmGH4eUWH9NRo6jhw\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 46771,
    "path": "../public/_nuxt/CVxzReF4.js"
  },
  "/_nuxt/CW27I574.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"170b-7LqxgF4Ah51WALwZNLahzgEGMqQ\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 5899,
    "path": "../public/_nuxt/CW27I574.js"
  },
  "/_nuxt/CX79zknF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6c6-l6sBcRwgvp4J1RtYruwdprL3H7A\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 1734,
    "path": "../public/_nuxt/CX79zknF.js"
  },
  "/_nuxt/CX8m0ssC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"199-DEbHFdzUJXY/NA9vT6vV36gJJTc\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 409,
    "path": "../public/_nuxt/CX8m0ssC.js"
  },
  "/_nuxt/CXEMG6uY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"162-fwzVMDl7FwAh1ytMW6rY+2y1xGk\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 354,
    "path": "../public/_nuxt/CXEMG6uY.js"
  },
  "/_nuxt/CXmmlECm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4fac-5ZFxhItnm/TYpOIp8Pkh0pWPh8Q\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 20396,
    "path": "../public/_nuxt/CXmmlECm.js"
  },
  "/_nuxt/CXsZGtIn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2798-yB3k6NyLMmXFXO9R+PX5OB0aGXU\"",
    "mtime": "2025-12-12T15:43:07.495Z",
    "size": 10136,
    "path": "../public/_nuxt/CXsZGtIn.js"
  },
  "/_nuxt/CXzPqssH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"925b-+1S6XEvvfDB7NboVFweawmAo+JE\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 37467,
    "path": "../public/_nuxt/CXzPqssH.js"
  },
  "/_nuxt/CYRsmRER.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"70d0-YXZejBL4ZJebxlSuM3oNxvroCtA\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 28880,
    "path": "../public/_nuxt/CYRsmRER.js"
  },
  "/_nuxt/CZV3QUDu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 39,
    "path": "../public/_nuxt/CZV3QUDu.js"
  },
  "/_nuxt/CZw4gY6G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bb-g2bs8B/fdIByPHm6QJO9sZhn/EQ\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 187,
    "path": "../public/_nuxt/CZw4gY6G.js"
  },
  "/_nuxt/C_O6uSca.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 39,
    "path": "../public/_nuxt/C_O6uSca.js"
  },
  "/_nuxt/C_T74JrJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16d-KZHF376oIT4+AlE2ykentCGWpAQ\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 365,
    "path": "../public/_nuxt/C_T74JrJ.js"
  },
  "/_nuxt/CaQGYQev.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5f1-4hFl6dFhOeUWaFbBGnXKariXOoQ\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 1521,
    "path": "../public/_nuxt/CaQGYQev.js"
  },
  "/_nuxt/CaVDHoft.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ee3-iiaTUiE8qBBjReAgnuPHOlnGoq8\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 12003,
    "path": "../public/_nuxt/CaVDHoft.js"
  },
  "/_nuxt/CafLl8hB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"200a1-8g5Uc2YEdAm5ftQ5cz4WjEmrCM0\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 131233,
    "path": "../public/_nuxt/CafLl8hB.js"
  },
  "/_nuxt/CafNBF8u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1893-d496H0Z60lAg57LiRH/wyqJ+BmM\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 6291,
    "path": "../public/_nuxt/CafNBF8u.js"
  },
  "/_nuxt/CavfcWkd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1113c-EPf3CvzuCjflLFmHzGhlZXJIiuY\"",
    "mtime": "2025-12-12T15:43:07.497Z",
    "size": 69948,
    "path": "../public/_nuxt/CavfcWkd.js"
  },
  "/_nuxt/CbfX1IO0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36d4-rw7+tMOmFbgQDhwnT0kx7VdqnBs\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 14036,
    "path": "../public/_nuxt/CbfX1IO0.js"
  },
  "/_nuxt/CbnpJVTb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b-79J3xQ48wrIgPl4y4UkjSIb3sq0\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 363,
    "path": "../public/_nuxt/CbnpJVTb.js"
  },
  "/_nuxt/Cc23rVYH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"98cf-q3trmWZ63FwSLQMSKUXjbpIf350\"",
    "mtime": "2025-12-12T15:43:07.497Z",
    "size": 39119,
    "path": "../public/_nuxt/Cc23rVYH.js"
  },
  "/_nuxt/CcNtP0Ig.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"28e1-hdWOyt+up5V3vr3jwit+fLr9o18\"",
    "mtime": "2025-12-12T15:43:07.497Z",
    "size": 10465,
    "path": "../public/_nuxt/CcNtP0Ig.js"
  },
  "/_nuxt/Ccm3NI5i.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22fd-BqbIlK9qg3zHiq62SUN1mdqtL8k\"",
    "mtime": "2025-12-12T15:43:07.497Z",
    "size": 8957,
    "path": "../public/_nuxt/Ccm3NI5i.js"
  },
  "/_nuxt/CcnfE_m5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.496Z",
    "size": 39,
    "path": "../public/_nuxt/CcnfE_m5.js"
  },
  "/_nuxt/CcwgBRJH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5bd-zWMBuJ/1ur5Z5pZgrtq1aNOsuas\"",
    "mtime": "2025-12-12T15:43:07.497Z",
    "size": 1469,
    "path": "../public/_nuxt/CcwgBRJH.js"
  },
  "/_nuxt/Cd-JFsJB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"68ff-HV79pxhCM+jSjl3kKfjay63JTjY\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 26879,
    "path": "../public/_nuxt/Cd-JFsJB.js"
  },
  "/_nuxt/CdRarn75.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"184a-+esM8Hs3VjYzKu7qHkHlOZtU14M\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 6218,
    "path": "../public/_nuxt/CdRarn75.js"
  },
  "/_nuxt/CdTKWnKT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30a4-9mSVd6VFZo9kuOUL6KCgQ0R9JcQ\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 12452,
    "path": "../public/_nuxt/CdTKWnKT.js"
  },
  "/_nuxt/CeMbzTGM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ef-2yAyPSt0/wxjMyy6zQNhzvWGzIY\"",
    "mtime": "2025-12-12T15:43:07.497Z",
    "size": 495,
    "path": "../public/_nuxt/CeMbzTGM.js"
  },
  "/_nuxt/Cf6P3AYX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c58-GaBU0ah98ZMoFXBQGjWPsgRbPfw\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 11352,
    "path": "../public/_nuxt/Cf6P3AYX.js"
  },
  "/_nuxt/CfQXZHmo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"42e6-JdP/XjojKBbDVeNQlQVl/w8pfP0\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 17126,
    "path": "../public/_nuxt/CfQXZHmo.js"
  },
  "/_nuxt/CfRbdlUu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 39,
    "path": "../public/_nuxt/CfRbdlUu.js"
  },
  "/_nuxt/CfhweUTc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 39,
    "path": "../public/_nuxt/CfhweUTc.js"
  },
  "/_nuxt/CfsGcFr1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5c2-CBKUIn23WnqNYxUB92Cm1GGcKrc\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 1474,
    "path": "../public/_nuxt/CfsGcFr1.js"
  },
  "/_nuxt/Cguc2af-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cc6-csJRsdR/PI/JXjdUrdiGWlPj9Z0\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 3270,
    "path": "../public/_nuxt/Cguc2af-.js"
  },
  "/_nuxt/Cgv2h9Ps.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6c9-ItVNgcU7zfueubtJuwCd3UEaj10\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 1737,
    "path": "../public/_nuxt/Cgv2h9Ps.js"
  },
  "/_nuxt/CigPEpQ5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"725-Hk/7gwHaP0KGi9vNLYqXaa0STbQ\"",
    "mtime": "2025-12-12T15:43:07.498Z",
    "size": 1829,
    "path": "../public/_nuxt/CigPEpQ5.js"
  },
  "/_nuxt/CiyEbZSK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1149-UvzsYs5E+uW71xhLIQRL2t6Dhv0\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 4425,
    "path": "../public/_nuxt/CiyEbZSK.js"
  },
  "/_nuxt/CjNB47Dc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 39,
    "path": "../public/_nuxt/CjNB47Dc.js"
  },
  "/_nuxt/CjTi99wc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 39,
    "path": "../public/_nuxt/CjTi99wc.js"
  },
  "/_nuxt/CjgsGqOK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1975-+YjYFfpR7cFJForO1asAQZuNwz0\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 6517,
    "path": "../public/_nuxt/CjgsGqOK.js"
  },
  "/_nuxt/CkXjmgJE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"42e7-+hm358z2R6HWIP4VA2TRRR+lsAA\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 17127,
    "path": "../public/_nuxt/CkXjmgJE.js"
  },
  "/_nuxt/ClAdzrsR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"437-qiXNtnJbjsRSFEeMN5voXTL96yQ\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 1079,
    "path": "../public/_nuxt/ClAdzrsR.js"
  },
  "/_nuxt/ClJvvMl3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4ae7-XRjfeLUqpc7ov8UyhwTqJdMX2Lk\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 19175,
    "path": "../public/_nuxt/ClJvvMl3.js"
  },
  "/_nuxt/Cm2xxHRt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 39,
    "path": "../public/_nuxt/Cm2xxHRt.js"
  },
  "/_nuxt/Cmqt1ph9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16d8-MURtBI+r5DQKTk/+OVtznwTNeVA\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 5848,
    "path": "../public/_nuxt/Cmqt1ph9.js"
  },
  "/_nuxt/CnK8MTSM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"54fa-Sty9Hv6j5Lofev8QpmEQ3bnggeU\"",
    "mtime": "2025-12-12T15:43:07.500Z",
    "size": 21754,
    "path": "../public/_nuxt/CnK8MTSM.js"
  },
  "/_nuxt/Cn_DI3Nb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 39,
    "path": "../public/_nuxt/Cn_DI3Nb.js"
  },
  "/_nuxt/CngT_V7_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"32ea-693kPov6F40WVhXsGTBd/pjENrY\"",
    "mtime": "2025-12-12T15:43:07.500Z",
    "size": 13034,
    "path": "../public/_nuxt/CngT_V7_.js"
  },
  "/_nuxt/CnnebwVN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"df90-SUGs+9AZ7AN6m9cGUzEEm6BH0Zc\"",
    "mtime": "2025-12-12T15:43:07.500Z",
    "size": 57232,
    "path": "../public/_nuxt/CnnebwVN.js"
  },
  "/_nuxt/CnoiG1Bf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.500Z",
    "size": 39,
    "path": "../public/_nuxt/CnoiG1Bf.js"
  },
  "/_nuxt/Cp-IABpG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b08-0dMeGWm4gC22OpAzs7TTvP5ig+w\"",
    "mtime": "2025-12-12T15:43:07.499Z",
    "size": 2824,
    "path": "../public/_nuxt/Cp-IABpG.js"
  },
  "/_nuxt/CpyjTnFF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f30-um+39mVrBSLNcihQPjJoOmZpL0Q\"",
    "mtime": "2025-12-12T15:43:07.500Z",
    "size": 7984,
    "path": "../public/_nuxt/CpyjTnFF.js"
  },
  "/_nuxt/Cq-ot1WW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1475-Gypqze1CuLi6UNXOekxqb2VY09U\"",
    "mtime": "2025-12-12T15:43:07.500Z",
    "size": 5237,
    "path": "../public/_nuxt/Cq-ot1WW.js"
  },
  "/_nuxt/CqJWyH9q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.500Z",
    "size": 39,
    "path": "../public/_nuxt/CqJWyH9q.js"
  },
  "/_nuxt/Cr7nscAD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a88-YIWsSk4hjdiI0iYXyCtql2BB7ao\"",
    "mtime": "2025-12-12T15:43:07.500Z",
    "size": 6792,
    "path": "../public/_nuxt/Cr7nscAD.js"
  },
  "/_nuxt/Cr8dt_E3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"43af-3h23bIt2XEjJiQiiMmMvWLwX2ps\"",
    "mtime": "2025-12-12T15:43:07.500Z",
    "size": 17327,
    "path": "../public/_nuxt/Cr8dt_E3.js"
  },
  "/_nuxt/CrwOfTJH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b348-AdfCTbua9Ann0QOzUdXsg9Zro18\"",
    "mtime": "2025-12-12T15:43:07.500Z",
    "size": 45896,
    "path": "../public/_nuxt/CrwOfTJH.js"
  },
  "/_nuxt/Cs0CPLi_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8958-r4VetG0pS/A/M3c2MDWfnsd4heU\"",
    "mtime": "2025-12-12T15:43:07.501Z",
    "size": 35160,
    "path": "../public/_nuxt/Cs0CPLi_.js"
  },
  "/_nuxt/CsfHtrSp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c34bf-ZT6lMGM/V0IWblF6lBYvjJNccT8\"",
    "mtime": "2025-12-12T15:43:07.503Z",
    "size": 1848511,
    "path": "../public/_nuxt/CsfHtrSp.js"
  },
  "/_nuxt/Csfq5Kiy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48cb-tPSCpNF7svRHRSnrhMp7s2aYFJE\"",
    "mtime": "2025-12-12T15:43:07.501Z",
    "size": 18635,
    "path": "../public/_nuxt/Csfq5Kiy.js"
  },
  "/_nuxt/CtjT-RdY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"53d7-t0qVAHDAEpNfGYnx6gufZJ35Xo4\"",
    "mtime": "2025-12-12T15:43:07.501Z",
    "size": 21463,
    "path": "../public/_nuxt/CtjT-RdY.js"
  },
  "/_nuxt/CtuwFG6L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1372-3r4GNfRg9RBsKK0COmjRr71665U\"",
    "mtime": "2025-12-12T15:43:07.501Z",
    "size": 4978,
    "path": "../public/_nuxt/CtuwFG6L.js"
  },
  "/_nuxt/Cuk6v7N8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3863-ch+lyFS9QkuOdtlQcqnXQ5iOqcc\"",
    "mtime": "2025-12-12T15:43:07.501Z",
    "size": 14435,
    "path": "../public/_nuxt/Cuk6v7N8.js"
  },
  "/_nuxt/Cv9koXgw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3a65-Q1j891KpAph3EWu90fhfuUDvR08\"",
    "mtime": "2025-12-12T15:43:07.501Z",
    "size": 14949,
    "path": "../public/_nuxt/Cv9koXgw.js"
  },
  "/_nuxt/CvOTpjhU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.501Z",
    "size": 39,
    "path": "../public/_nuxt/CvOTpjhU.js"
  },
  "/_nuxt/CvZ2-N7x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1037-6/JpavD4v+PWaAC+XmOZwueDyS0\"",
    "mtime": "2025-12-12T15:43:07.501Z",
    "size": 4151,
    "path": "../public/_nuxt/CvZ2-N7x.js"
  },
  "/_nuxt/Cvjx9yec.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e7c7-lfQh0o6fAvAHhV3zEFy6qurT9ng\"",
    "mtime": "2025-12-12T15:43:07.502Z",
    "size": 59335,
    "path": "../public/_nuxt/Cvjx9yec.js"
  },
  "/_nuxt/CvkT2Mti.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b16d-UVcb1dfzJIXeiO0EwiQEy+wZd4U\"",
    "mtime": "2025-12-12T15:43:07.502Z",
    "size": 110957,
    "path": "../public/_nuxt/CvkT2Mti.js"
  },
  "/_nuxt/Cw3GTCNi.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10ea6-J+ALGVQCpbLGlq9CsJ33CgflwjU\"",
    "mtime": "2025-12-12T15:43:07.502Z",
    "size": 69286,
    "path": "../public/_nuxt/Cw3GTCNi.js"
  },
  "/_nuxt/Cw71V7Hy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f3ed-UgjY/2HcBIphKovheQBGofvjXQ4\"",
    "mtime": "2025-12-12T15:43:07.503Z",
    "size": 62445,
    "path": "../public/_nuxt/Cw71V7Hy.js"
  },
  "/_nuxt/CwBspFZC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18d6-6/jioco+mtFDqjy2IkhcKDxuQhQ\"",
    "mtime": "2025-12-12T15:43:07.502Z",
    "size": 6358,
    "path": "../public/_nuxt/CwBspFZC.js"
  },
  "/_nuxt/CwgXBrFc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.503Z",
    "size": 39,
    "path": "../public/_nuxt/CwgXBrFc.js"
  },
  "/_nuxt/CxYwr2JP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25af-Tau19daFo8uNfcCp0+LO25L3Rbk\"",
    "mtime": "2025-12-12T15:43:07.503Z",
    "size": 9647,
    "path": "../public/_nuxt/CxYwr2JP.js"
  },
  "/_nuxt/CxuowXBd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"925-Z72u2daEfAm5ihCMbiDefIEOP9Y\"",
    "mtime": "2025-12-12T15:43:07.503Z",
    "size": 2341,
    "path": "../public/_nuxt/CxuowXBd.js"
  },
  "/_nuxt/Cxxk5oJb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.503Z",
    "size": 39,
    "path": "../public/_nuxt/Cxxk5oJb.js"
  },
  "/_nuxt/Cxy6zFZ5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9be-7gWo0CuXrw6LoErCWT/Ipv9agUM\"",
    "mtime": "2025-12-12T15:43:07.503Z",
    "size": 2494,
    "path": "../public/_nuxt/Cxy6zFZ5.js"
  },
  "/_nuxt/CyTDQVSU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f11-fFBJeriAO07uqj+Zros08G2iFQ0\"",
    "mtime": "2025-12-12T15:43:07.503Z",
    "size": 12049,
    "path": "../public/_nuxt/CyTDQVSU.js"
  },
  "/_nuxt/CyZlOzE7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1610-ybVdQ6IGRMgOWmwgXQXdBCJ5QPY\"",
    "mtime": "2025-12-12T15:43:07.504Z",
    "size": 5648,
    "path": "../public/_nuxt/CyZlOzE7.js"
  },
  "/_nuxt/CyktbL80.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48c5-38IV7Gj1pi36TR7qiSHzlCs9XIo\"",
    "mtime": "2025-12-12T15:43:07.503Z",
    "size": 18629,
    "path": "../public/_nuxt/CyktbL80.js"
  },
  "/_nuxt/D-2ljcwZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"355b-ltA2RbrvMtKWMV4KgoBMozLYWVE\"",
    "mtime": "2025-12-12T15:43:07.504Z",
    "size": 13659,
    "path": "../public/_nuxt/D-2ljcwZ.js"
  },
  "/_nuxt/D0r3Knsf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35bf-NpZrPk9jdEu6IxpilmRefOR1sKI\"",
    "mtime": "2025-12-12T15:43:07.504Z",
    "size": 13759,
    "path": "../public/_nuxt/D0r3Knsf.js"
  },
  "/_nuxt/D4h5O-jR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ecc-X4WIf5/MKovdXkpn2ucY2Fvz+nI\"",
    "mtime": "2025-12-12T15:43:07.504Z",
    "size": 7884,
    "path": "../public/_nuxt/D4h5O-jR.js"
  },
  "/_nuxt/D4slRh_W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11a12-CU7T3rHNmnwc+gFqHP6E9Lcl47o\"",
    "mtime": "2025-12-12T15:43:07.505Z",
    "size": 72210,
    "path": "../public/_nuxt/D4slRh_W.js"
  },
  "/_nuxt/D5FP-iNZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1bfd-5DFO65au69Ptzm1QLlxthKjSi2s\"",
    "mtime": "2025-12-12T15:43:07.504Z",
    "size": 7165,
    "path": "../public/_nuxt/D5FP-iNZ.js"
  },
  "/_nuxt/D5KoaKCx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48b7-CJZAUj4SYa7cWrWmLW1ca67ky3Y\"",
    "mtime": "2025-12-12T15:43:07.505Z",
    "size": 18615,
    "path": "../public/_nuxt/D5KoaKCx.js"
  },
  "/_nuxt/D5dm1SHP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bbf-Oao8ni5dK8teelwF5umIqWrEldw\"",
    "mtime": "2025-12-12T15:43:07.505Z",
    "size": 3007,
    "path": "../public/_nuxt/D5dm1SHP.js"
  },
  "/_nuxt/D67arOk2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19541-BGLmcSAzCR66FBytMMv5yybP15Y\"",
    "mtime": "2025-12-12T15:43:07.506Z",
    "size": 103745,
    "path": "../public/_nuxt/D67arOk2.js"
  },
  "/_nuxt/D68lwU-3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d24-cAoduuF9lZJdF5NGSYa8lb/ws5k\"",
    "mtime": "2025-12-12T15:43:07.505Z",
    "size": 3364,
    "path": "../public/_nuxt/D68lwU-3.js"
  },
  "/_nuxt/D71vnY7n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"28e4-0/K/+kgKI6L+/Mtjwy35mmbR8A4\"",
    "mtime": "2025-12-12T15:43:07.506Z",
    "size": 10468,
    "path": "../public/_nuxt/D71vnY7n.js"
  },
  "/_nuxt/D73x7vXV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b06-SmKyl9G+EsGcCNLaBMK7olpMCy8\"",
    "mtime": "2025-12-12T15:43:07.505Z",
    "size": 2822,
    "path": "../public/_nuxt/D73x7vXV.js"
  },
  "/_nuxt/D77Xfpt6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"737f-tgYeNsRBvmaxu1v2Ij/DHt8FK0o\"",
    "mtime": "2025-12-12T15:43:07.506Z",
    "size": 29567,
    "path": "../public/_nuxt/D77Xfpt6.js"
  },
  "/_nuxt/D7oLnXFd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"374c-u5ndhk1KsUHitkpMJ6KIbAiO+N0\"",
    "mtime": "2025-12-12T15:43:07.505Z",
    "size": 14156,
    "path": "../public/_nuxt/D7oLnXFd.js"
  },
  "/_nuxt/D87Tk5Gz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b897-0AQRUGQeQ66H6D6VCr1fiFPiQRg\"",
    "mtime": "2025-12-12T15:43:07.506Z",
    "size": 47255,
    "path": "../public/_nuxt/D87Tk5Gz.js"
  },
  "/_nuxt/D8GyATDs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d18-tB57oc6NCy4s2+W+BaJ4OtHDXNk\"",
    "mtime": "2025-12-12T15:43:07.506Z",
    "size": 3352,
    "path": "../public/_nuxt/D8GyATDs.js"
  },
  "/_nuxt/D95W9NRJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4c7c-3dGps9bYs1WlJTKB9wNXDt1d67s\"",
    "mtime": "2025-12-12T15:43:07.506Z",
    "size": 19580,
    "path": "../public/_nuxt/D95W9NRJ.js"
  },
  "/_nuxt/DAi9KRSo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2bb0-kCaePAc0SkqzEXT/m+0Gi8SfIkE\"",
    "mtime": "2025-12-12T15:43:07.506Z",
    "size": 11184,
    "path": "../public/_nuxt/DAi9KRSo.js"
  },
  "/_nuxt/DBeMASl0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"39bb-ThjfO6jMK5F/1dY2/Yd7ZSQn1wg\"",
    "mtime": "2025-12-12T15:43:07.506Z",
    "size": 14779,
    "path": "../public/_nuxt/DBeMASl0.js"
  },
  "/_nuxt/DBkGfx5F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6657-FOeFvywuFIHUPfFP4k/dVprNeNA\"",
    "mtime": "2025-12-12T15:43:07.506Z",
    "size": 26199,
    "path": "../public/_nuxt/DBkGfx5F.js"
  },
  "/_nuxt/DCEWnaOz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"179-R8vE6H0AZLrbB/qcHvjHtcXk0bY\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 377,
    "path": "../public/_nuxt/DCEWnaOz.js"
  },
  "/_nuxt/DDd-RUyB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"196-lzXPwUPak9hIqBvbo9kTbnvnr68\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 406,
    "path": "../public/_nuxt/DDd-RUyB.js"
  },
  "/_nuxt/DDqafzeT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5c64-GmCLqkFhIxjwiL80CrFeQ5cu6uw\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 23652,
    "path": "../public/_nuxt/DDqafzeT.js"
  },
  "/_nuxt/DE980vXX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16c9-9SXoeCRBByacsYk7SDFT3UWNmJw\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 5833,
    "path": "../public/_nuxt/DE980vXX.js"
  },
  "/_nuxt/DFWUc33u.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b89a-kdAMrtWajzAsk0BG2fMBP82rYLk\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 47258,
    "path": "../public/_nuxt/DFWUc33u.js"
  },
  "/_nuxt/DFuPfyw4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5c71-YG01oF06mmxMfIp2IQ8uA6+hfsw\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 23665,
    "path": "../public/_nuxt/DFuPfyw4.js"
  },
  "/_nuxt/DG42BJ27.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 39,
    "path": "../public/_nuxt/DG42BJ27.js"
  },
  "/_nuxt/DGPZsOi7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1181-8/1NfLvCUbTSy1YL9VDOlM2TgMo\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 4481,
    "path": "../public/_nuxt/DGPZsOi7.js"
  },
  "/_nuxt/DGUSc42t.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5f02-fLZ+C/hGEzd1Svv+EqT9w295k7A\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 24322,
    "path": "../public/_nuxt/DGUSc42t.js"
  },
  "/_nuxt/DH5Ifo-i.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3861-ZsBIvSUlsHzh+aocazJKD4XzMVc\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 14433,
    "path": "../public/_nuxt/DH5Ifo-i.js"
  },
  "/_nuxt/DHHxsPna.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4e44-bbSfGDPa/nczoNzkEXYQH+6w474\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 20036,
    "path": "../public/_nuxt/DHHxsPna.js"
  },
  "/_nuxt/DHJKELXO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c8d-G52k5HF2RR+jOGOolyZJDXOaYjU\"",
    "mtime": "2025-12-12T15:43:07.507Z",
    "size": 11405,
    "path": "../public/_nuxt/DHJKELXO.js"
  },
  "/_nuxt/DI7mmMRd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c354-CeGLfFUt19BSBCMcHCj/c/JOJfo\"",
    "mtime": "2025-12-12T15:43:07.509Z",
    "size": 181076,
    "path": "../public/_nuxt/DI7mmMRd.js"
  },
  "/_nuxt/DKP7kpC6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1727-tGfQql53l24hdMOjdjHujZf+lE8\"",
    "mtime": "2025-12-12T15:43:07.508Z",
    "size": 5927,
    "path": "../public/_nuxt/DKP7kpC6.js"
  },
  "/_nuxt/DL-rCd9P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bf7b-9twIXIKQRt5EG5HERQgH+rUyklA\"",
    "mtime": "2025-12-12T15:43:07.508Z",
    "size": 49019,
    "path": "../public/_nuxt/DL-rCd9P.js"
  },
  "/_nuxt/DLH6qYhC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b15-XKWsJ22pogUH/FFbUKhSsMt8mLM\"",
    "mtime": "2025-12-12T15:43:07.508Z",
    "size": 2837,
    "path": "../public/_nuxt/DLH6qYhC.js"
  },
  "/_nuxt/DM-lpkdv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.508Z",
    "size": 39,
    "path": "../public/_nuxt/DM-lpkdv.js"
  },
  "/_nuxt/DM4IJpGH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d90-OyPwjuPz5fXhKxfcntIlhsnkIcc\"",
    "mtime": "2025-12-12T15:43:07.508Z",
    "size": 3472,
    "path": "../public/_nuxt/DM4IJpGH.js"
  },
  "/_nuxt/DNXA5gFb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"922-2D5co4EjF5oFEoySp5pqbaWjSZk\"",
    "mtime": "2025-12-12T15:43:07.508Z",
    "size": 2338,
    "path": "../public/_nuxt/DNXA5gFb.js"
  },
  "/_nuxt/DNaadfVC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5c2-t3KQoWOkztg6Bqdeziq8HQwxGTE\"",
    "mtime": "2025-12-12T15:43:07.508Z",
    "size": 1474,
    "path": "../public/_nuxt/DNaadfVC.js"
  },
  "/_nuxt/DNg2iChE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1592-8Eh2hSZnWxibHOIH7Il31zHFVQw\"",
    "mtime": "2025-12-12T15:43:07.508Z",
    "size": 5522,
    "path": "../public/_nuxt/DNg2iChE.js"
  },
  "/_nuxt/DOstCBdD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8a24-eIKV+hjOIuSX03t9E05704IabVc\"",
    "mtime": "2025-12-12T15:43:07.509Z",
    "size": 35364,
    "path": "../public/_nuxt/DOstCBdD.js"
  },
  "/_nuxt/DPSQOshb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"98d8f-p5ZxO5Mrpmqk9ZSYoNRW2PnOCqs\"",
    "mtime": "2025-12-12T15:43:07.511Z",
    "size": 626063,
    "path": "../public/_nuxt/DPSQOshb.js"
  },
  "/_nuxt/DPSaIzso.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5217-K5WuG4V/yfg8QyYRtO1tXp/SDNY\"",
    "mtime": "2025-12-12T15:43:07.509Z",
    "size": 21015,
    "path": "../public/_nuxt/DPSaIzso.js"
  },
  "/_nuxt/DPbhhnRr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"37bf-98jHccXn2yENjM706B5g9RNOgjs\"",
    "mtime": "2025-12-12T15:43:07.510Z",
    "size": 14271,
    "path": "../public/_nuxt/DPbhhnRr.js"
  },
  "/_nuxt/DPfMkruS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bf7f-Qa1TjFLyLxQt61atfNmRBMSFw44\"",
    "mtime": "2025-12-12T15:43:07.510Z",
    "size": 49023,
    "path": "../public/_nuxt/DPfMkruS.js"
  },
  "/_nuxt/DQyhUUbL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b89f-mbNr7NheThZgbVpyFJ27x8WEEK0\"",
    "mtime": "2025-12-12T15:43:07.510Z",
    "size": 47263,
    "path": "../public/_nuxt/DQyhUUbL.js"
  },
  "/_nuxt/DRCurXJT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2906-dtB1NZF8aFJJWbNIoZSg//3JCww\"",
    "mtime": "2025-12-12T15:43:07.510Z",
    "size": 10502,
    "path": "../public/_nuxt/DRCurXJT.js"
  },
  "/_nuxt/DRMo6eis.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2741-eThYNz07aB+G3h1L6U8Z1C3WP78\"",
    "mtime": "2025-12-12T15:43:07.510Z",
    "size": 10049,
    "path": "../public/_nuxt/DRMo6eis.js"
  },
  "/_nuxt/DR_y4S5t.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1b6-vyMrVZTDeJMZRcADprkCJ1oKH1o\"",
    "mtime": "2025-12-12T15:43:07.510Z",
    "size": 438,
    "path": "../public/_nuxt/DR_y4S5t.js"
  },
  "/_nuxt/DRw_LuNl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5870-v5eZ6Es2kI7CQZrGY35Jb3XlCxM\"",
    "mtime": "2025-12-12T15:43:07.510Z",
    "size": 22640,
    "path": "../public/_nuxt/DRw_LuNl.js"
  },
  "/_nuxt/DSEzrSfP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2923-qv9xLSeVGTQPC6PWqt3Nkzz5Cyc\"",
    "mtime": "2025-12-12T15:43:07.510Z",
    "size": 10531,
    "path": "../public/_nuxt/DSEzrSfP.js"
  },
  "/_nuxt/DSYJ6xcj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4eb3-VeFzt35IvPX0uGOiCQk4/KDNql0\"",
    "mtime": "2025-12-12T15:43:07.511Z",
    "size": 20147,
    "path": "../public/_nuxt/DSYJ6xcj.js"
  },
  "/_nuxt/DTD4FTtd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"606a-AK/kxn1lYmDU6yP1zrl+6Dabn/4\"",
    "mtime": "2025-12-12T15:43:07.511Z",
    "size": 24682,
    "path": "../public/_nuxt/DTD4FTtd.js"
  },
  "/_nuxt/DU1UobuO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3194-nVg7XJ1slVnNP7zeSHudjIkh5XA\"",
    "mtime": "2025-12-12T15:43:07.511Z",
    "size": 12692,
    "path": "../public/_nuxt/DU1UobuO.js"
  },
  "/_nuxt/DU1rYphG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16d-DhVsgt2x9GbgMM7j/XoitU/yOOE\"",
    "mtime": "2025-12-12T15:43:07.511Z",
    "size": 365,
    "path": "../public/_nuxt/DU1rYphG.js"
  },
  "/_nuxt/DUszq2jm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ceb-ePBMCAX7SG0Irjogl+g1U5DwooA\"",
    "mtime": "2025-12-12T15:43:07.511Z",
    "size": 11499,
    "path": "../public/_nuxt/DUszq2jm.js"
  },
  "/_nuxt/DVMEJ2y_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"83fb-0g5XhPG2uspENrUTMRB2oVJl2Ws\"",
    "mtime": "2025-12-12T15:43:07.512Z",
    "size": 33787,
    "path": "../public/_nuxt/DVMEJ2y_.js"
  },
  "/_nuxt/DVzyuUAN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19b7-GRTvDwxsQgy/ubKHD7SFO9SV/7c\"",
    "mtime": "2025-12-12T15:43:07.511Z",
    "size": 6583,
    "path": "../public/_nuxt/DVzyuUAN.js"
  },
  "/_nuxt/DWCeX49i.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cd0-VPGV3+Un41mQmOiVIuesHR2K0is\"",
    "mtime": "2025-12-12T15:43:07.511Z",
    "size": 3280,
    "path": "../public/_nuxt/DWCeX49i.js"
  },
  "/_nuxt/DWIPcypl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e29-uB0b66FBbJlQHK5ubYQRbAqUmz4\"",
    "mtime": "2025-12-12T15:43:07.511Z",
    "size": 3625,
    "path": "../public/_nuxt/DWIPcypl.js"
  },
  "/_nuxt/DWedfzmr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"42e3-jnQVGWyfAUj5Bj6u8/SJs5K6KHQ\"",
    "mtime": "2025-12-12T15:43:07.512Z",
    "size": 17123,
    "path": "../public/_nuxt/DWedfzmr.js"
  },
  "/_nuxt/DXFR_sao.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4c85-G+6wO9R7MUtWDHepOK57nP2fqNA\"",
    "mtime": "2025-12-12T15:43:07.512Z",
    "size": 19589,
    "path": "../public/_nuxt/DXFR_sao.js"
  },
  "/_nuxt/DXKU4rRd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"473-ilqzrUHhDeQ5okpZJOzIGnDDzxg\"",
    "mtime": "2025-12-12T15:43:07.512Z",
    "size": 1139,
    "path": "../public/_nuxt/DXKU4rRd.js"
  },
  "/_nuxt/DXMQKYGW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"35fa-LNDCGhigSFO+vOoU6I76T4gOQNs\"",
    "mtime": "2025-12-12T15:43:07.512Z",
    "size": 13818,
    "path": "../public/_nuxt/DXMQKYGW.js"
  },
  "/_nuxt/DXbdFlpD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1abe-6NRBR7/r0g2IDmknK3kpzih1ojk\"",
    "mtime": "2025-12-12T15:43:07.512Z",
    "size": 6846,
    "path": "../public/_nuxt/DXbdFlpD.js"
  },
  "/_nuxt/DZeo8zXl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11f1-c5e+xDh4TYe6rG7hD5nw8W7X/T8\"",
    "mtime": "2025-12-12T15:43:07.512Z",
    "size": 4593,
    "path": "../public/_nuxt/DZeo8zXl.js"
  },
  "/_nuxt/D_Df2H8P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18be-6uRgWZxwjOwVJ/w4+C5+QNhgto0\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 6334,
    "path": "../public/_nuxt/D_Df2H8P.js"
  },
  "/_nuxt/D_jbwVNn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3c7-YNuORQmpjPBV6/UBqJ3Ha7Jmw1Y\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 967,
    "path": "../public/_nuxt/D_jbwVNn.js"
  },
  "/_nuxt/Db9qbGEn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19e6-/geEpI09es7jTrmSBhHIbdKaMbI\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 6630,
    "path": "../public/_nuxt/Db9qbGEn.js"
  },
  "/_nuxt/DcU5gpPp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4c5-4AJno8aJw+nYiZYWuehL3Iq/c6w\"",
    "mtime": "2025-12-12T15:43:07.512Z",
    "size": 1221,
    "path": "../public/_nuxt/DcU5gpPp.js"
  },
  "/_nuxt/Dcka4Ww4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3f4-4q7dbtNRUqjeJGIiaBuy/tbKO9U\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 1012,
    "path": "../public/_nuxt/Dcka4Ww4.js"
  },
  "/_nuxt/DcyTShSX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e17-KtjzBrOnjP/A1ari+ZQbGjfGAm8\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 7703,
    "path": "../public/_nuxt/DcyTShSX.js"
  },
  "/_nuxt/Ddv68eIx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6863-kMtZ6hRkLXSKT61B4950edu4MjQ\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 26723,
    "path": "../public/_nuxt/Ddv68eIx.js"
  },
  "/_nuxt/DeEzf9y0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"36dd-fk/Ee5H7GKbN4bbuKH49ZrL9870\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 14045,
    "path": "../public/_nuxt/DeEzf9y0.js"
  },
  "/_nuxt/DeUSuvf4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 39,
    "path": "../public/_nuxt/DeUSuvf4.js"
  },
  "/_nuxt/DeZaQlzW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2aae7-oVf3oQDc5DfMq94EIrANQh/k00c\"",
    "mtime": "2025-12-12T15:43:07.514Z",
    "size": 174823,
    "path": "../public/_nuxt/DeZaQlzW.js"
  },
  "/_nuxt/DetjcHHk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"795e-0NtlB7QNinGCxLAGjGKLss5YWfA\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 31070,
    "path": "../public/_nuxt/DetjcHHk.js"
  },
  "/_nuxt/DeyZd0fa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a54-CriDarrgA03Rg5mfk7AhRMgMKg0\"",
    "mtime": "2025-12-12T15:43:07.514Z",
    "size": 2644,
    "path": "../public/_nuxt/DeyZd0fa.js"
  },
  "/_nuxt/DfPP_Qiz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.514Z",
    "size": 39,
    "path": "../public/_nuxt/DfPP_Qiz.js"
  },
  "/_nuxt/DfRw4Gl7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"168e1-dwlOyZ36ZMCSYmOf0mzfHTbWzpA\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 92385,
    "path": "../public/_nuxt/DfRw4Gl7.js"
  },
  "/_nuxt/Df_8nZwP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.513Z",
    "size": 39,
    "path": "../public/_nuxt/Df_8nZwP.js"
  },
  "/_nuxt/Df_TKlUs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19bc1-ziE0X9dWE17yYjZJsTjpN0OunRQ\"",
    "mtime": "2025-12-12T15:43:07.514Z",
    "size": 105409,
    "path": "../public/_nuxt/Df_TKlUs.js"
  },
  "/_nuxt/DfiqMetz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"676-V9iCKexNcE/uLT/tMGLRDcsWnxM\"",
    "mtime": "2025-12-12T15:43:07.514Z",
    "size": 1654,
    "path": "../public/_nuxt/DfiqMetz.js"
  },
  "/_nuxt/DfjKaOLW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.514Z",
    "size": 39,
    "path": "../public/_nuxt/DfjKaOLW.js"
  },
  "/_nuxt/Dg_QtzRx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"468c-WOx2fLkxBfPw8hopfhcBdc2W8QI\"",
    "mtime": "2025-12-12T15:43:07.515Z",
    "size": 18060,
    "path": "../public/_nuxt/Dg_QtzRx.js"
  },
  "/_nuxt/Dhss6FT-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"792c-9OR6QK2SXdIxnKvCGnSehIkllgA\"",
    "mtime": "2025-12-12T15:43:07.514Z",
    "size": 31020,
    "path": "../public/_nuxt/Dhss6FT-.js"
  },
  "/_nuxt/Di4Dzsjz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1924-rZ4g9xLY2HUWobSb86PLEz3Ogiw\"",
    "mtime": "2025-12-12T15:43:07.514Z",
    "size": 6436,
    "path": "../public/_nuxt/Di4Dzsjz.js"
  },
  "/_nuxt/Di8DATk4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14f1-SeeRW0o2fy2LvTfuboZktNbiCzw\"",
    "mtime": "2025-12-12T15:43:07.514Z",
    "size": 5361,
    "path": "../public/_nuxt/Di8DATk4.js"
  },
  "/_nuxt/DiTcYanS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1414-vrc3MnAOosfqZ37gN+Svelm70Zc\"",
    "mtime": "2025-12-12T15:43:07.515Z",
    "size": 5140,
    "path": "../public/_nuxt/DiTcYanS.js"
  },
  "/_nuxt/DiV2Dt9D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"224d-7CNSjlVyxoUr0l+IJzkVutyWoqI\"",
    "mtime": "2025-12-12T15:43:07.515Z",
    "size": 8781,
    "path": "../public/_nuxt/DiV2Dt9D.js"
  },
  "/_nuxt/DkLZzYmQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4a1b-XFC6tD77m+X49GjadAr/yKxblkw\"",
    "mtime": "2025-12-12T15:43:07.516Z",
    "size": 18971,
    "path": "../public/_nuxt/DkLZzYmQ.js"
  },
  "/_nuxt/Dl3P8yHk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25cb-/35vM8g/6/92FQ4a825Ia2JVFpY\"",
    "mtime": "2025-12-12T15:43:07.515Z",
    "size": 9675,
    "path": "../public/_nuxt/Dl3P8yHk.js"
  },
  "/_nuxt/Dl3URbcJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"13955-ZK/Bs273GCANLim73w0DQVk3r0U\"",
    "mtime": "2025-12-12T15:43:07.515Z",
    "size": 80213,
    "path": "../public/_nuxt/Dl3URbcJ.js"
  },
  "/_nuxt/DllFUEzu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c306-HKRL+zrcW/nqVztmAgj7xjcOuJo\"",
    "mtime": "2025-12-12T15:43:07.515Z",
    "size": 49926,
    "path": "../public/_nuxt/DllFUEzu.js"
  },
  "/_nuxt/DmCxkQtj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.515Z",
    "size": 39,
    "path": "../public/_nuxt/DmCxkQtj.js"
  },
  "/_nuxt/DnJxzdy9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3de8-dWtfgIn0XcsX9ZMrYvWiejv/NHI\"",
    "mtime": "2025-12-12T15:43:07.515Z",
    "size": 15848,
    "path": "../public/_nuxt/DnJxzdy9.js"
  },
  "/_nuxt/DnULxvSX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8a5e-lpZgdjKbVFHBYkOMCMZXYihb+Y0\"",
    "mtime": "2025-12-12T15:43:07.515Z",
    "size": 35422,
    "path": "../public/_nuxt/DnULxvSX.js"
  },
  "/_nuxt/Dnr31lay.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"58a-QIZvz5lVL0r22QoenUHQSg8UaV8\"",
    "mtime": "2025-12-12T15:43:07.516Z",
    "size": 1418,
    "path": "../public/_nuxt/Dnr31lay.js"
  },
  "/_nuxt/DoaSTf2w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1369-TxWKeIbN6tEfhv+BmvGPpIe8iXg\"",
    "mtime": "2025-12-12T15:43:07.516Z",
    "size": 4969,
    "path": "../public/_nuxt/DoaSTf2w.js"
  },
  "/_nuxt/Dp13yF0e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.516Z",
    "size": 39,
    "path": "../public/_nuxt/Dp13yF0e.js"
  },
  "/_nuxt/Dqsr-I88.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e1d-/vvZLeg3EmYeRrNa3BZrxcb1qJ4\"",
    "mtime": "2025-12-12T15:43:07.515Z",
    "size": 3613,
    "path": "../public/_nuxt/Dqsr-I88.js"
  },
  "/_nuxt/DqwNpetd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24d7-BiRtKEQjWndnYLM1xGeXTGnUgo4\"",
    "mtime": "2025-12-12T15:43:07.516Z",
    "size": 9431,
    "path": "../public/_nuxt/DqwNpetd.js"
  },
  "/_nuxt/DrNVRdl3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"365-8nISoIicayMnf8+zMRoxNyoHAVI\"",
    "mtime": "2025-12-12T15:43:07.516Z",
    "size": 869,
    "path": "../public/_nuxt/DrNVRdl3.js"
  },
  "/_nuxt/DsQqUlDY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f4-DbSFaZkcDxz1FKFy+C3jFHKicTs\"",
    "mtime": "2025-12-12T15:43:07.517Z",
    "size": 500,
    "path": "../public/_nuxt/DsQqUlDY.js"
  },
  "/_nuxt/DtTAZpXW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"de97-fVNLdvQ2EYdEMw5d1NEOtI8Fk5k\"",
    "mtime": "2025-12-12T15:43:07.518Z",
    "size": 56983,
    "path": "../public/_nuxt/DtTAZpXW.js"
  },
  "/_nuxt/DtpU69xz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16ff-9odyiuIpO1422+haBFVhYoEAdnw\"",
    "mtime": "2025-12-12T15:43:07.516Z",
    "size": 5887,
    "path": "../public/_nuxt/DtpU69xz.js"
  },
  "/_nuxt/DuAV58dt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d6-aqWuJy7rC3jxMJ6kz1/4KanGryg\"",
    "mtime": "2025-12-12T15:43:07.517Z",
    "size": 726,
    "path": "../public/_nuxt/DuAV58dt.js"
  },
  "/_nuxt/DuSsdkw-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e541-9a1gQ+jAfWM0bDSK0DW6whoXR9U\"",
    "mtime": "2025-12-12T15:43:07.518Z",
    "size": 58689,
    "path": "../public/_nuxt/DuSsdkw-.js"
  },
  "/_nuxt/DukUJnku.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.518Z",
    "size": 39,
    "path": "../public/_nuxt/DukUJnku.js"
  },
  "/_nuxt/Dx7_VLD1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1032-LsGgovyBPGgn3VSelw9T20PMOYE\"",
    "mtime": "2025-12-12T15:43:07.517Z",
    "size": 4146,
    "path": "../public/_nuxt/Dx7_VLD1.js"
  },
  "/_nuxt/DxdE42Og.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.517Z",
    "size": 39,
    "path": "../public/_nuxt/DxdE42Og.js"
  },
  "/_nuxt/DyI5ysQO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"205e-hiVEnZCyhqMmiTiWb0Hrg4OGv3Q\"",
    "mtime": "2025-12-12T15:43:07.518Z",
    "size": 8286,
    "path": "../public/_nuxt/DyI5ysQO.js"
  },
  "/_nuxt/DyM1MGQ3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"360e-Tw2eLNeUDxFLyk68HIR+bBlPNhM\"",
    "mtime": "2025-12-12T15:43:07.518Z",
    "size": 13838,
    "path": "../public/_nuxt/DyM1MGQ3.js"
  },
  "/_nuxt/DzGGBMP2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"14e6b-4nNGFZzvuv2ZueX6fHf2hqmJnts\"",
    "mtime": "2025-12-12T15:43:07.519Z",
    "size": 85611,
    "path": "../public/_nuxt/DzGGBMP2.js"
  },
  "/_nuxt/E3gJ1_iC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3903-b1i07XzPpd3BHF9/vi4M4mGWen8\"",
    "mtime": "2025-12-12T15:43:07.518Z",
    "size": 14595,
    "path": "../public/_nuxt/E3gJ1_iC.js"
  },
  "/_nuxt/EIMCWz4v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6538-FeHUWrdybNKDgh/KT8s4Si7siUs\"",
    "mtime": "2025-12-12T15:43:07.519Z",
    "size": 25912,
    "path": "../public/_nuxt/EIMCWz4v.js"
  },
  "/_nuxt/Enw-JDM3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"119f8-ppWqGYDPn68sxUobgl3Hz+rkWnA\"",
    "mtime": "2025-12-12T15:43:07.518Z",
    "size": 72184,
    "path": "../public/_nuxt/Enw-JDM3.js"
  },
  "/_nuxt/FPYXkgiX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1027-lRS0+uuHp/i78UQBnBFr7LV7w9U\"",
    "mtime": "2025-12-12T15:43:07.518Z",
    "size": 4135,
    "path": "../public/_nuxt/FPYXkgiX.js"
  },
  "/_nuxt/GGCMgrXw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"48cb-tPSCpNF7svRHRSnrhMp7s2aYFJE\"",
    "mtime": "2025-12-12T15:43:07.518Z",
    "size": 18635,
    "path": "../public/_nuxt/GGCMgrXw.js"
  },
  "/_nuxt/GMdfVW0G.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2e6b7-7f6Ui+n1qidcwfobSsJkd5qN4b4\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 190135,
    "path": "../public/_nuxt/GMdfVW0G.js"
  },
  "/_nuxt/GsRaNv29.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"586d-L030M/2jspEnPij9s4nOgEzypsw\"",
    "mtime": "2025-12-12T15:43:07.519Z",
    "size": 22637,
    "path": "../public/_nuxt/GsRaNv29.js"
  },
  "/_nuxt/HHACgipk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"119ad-Wuzg0ra/HUVzR7AcCxIMoCJN3nU\"",
    "mtime": "2025-12-12T15:43:07.519Z",
    "size": 72109,
    "path": "../public/_nuxt/HHACgipk.js"
  },
  "/_nuxt/HkZjdYNO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ea6-OHzzdLUOuY/YfCJbQscsMtq2e6k\"",
    "mtime": "2025-12-12T15:43:07.519Z",
    "size": 11942,
    "path": "../public/_nuxt/HkZjdYNO.js"
  },
  "/_nuxt/IHdZHPlW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2cde2-hgLvfjMK5GYa6f6uUQAWBPUiKQQ\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 183778,
    "path": "../public/_nuxt/IHdZHPlW.js"
  },
  "/_nuxt/IMtIVcnU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"683-fv/3oHZ+iIF7s4FELEl7t5Ok38k\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 1667,
    "path": "../public/_nuxt/IMtIVcnU.js"
  },
  "/_nuxt/IyBk_3VQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a61-iK134RESduUxL7O/pRoG3TiSBWU\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 6753,
    "path": "../public/_nuxt/IyBk_3VQ.js"
  },
  "/_nuxt/JIZTSUoJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20bf-4mKz/C88ftrI2oUvtoXcjSdEk40\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 8383,
    "path": "../public/_nuxt/JIZTSUoJ.js"
  },
  "/_nuxt/KSLuQd98.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3b39-Sz7nBqv+dca/jSM+XbtFZIZZFfA\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 15161,
    "path": "../public/_nuxt/KSLuQd98.js"
  },
  "/_nuxt/Ks-JXuRU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"578b-UHHrPAHf4ZiW9rNJ23fxegcEtOg\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 22411,
    "path": "../public/_nuxt/Ks-JXuRU.js"
  },
  "/_nuxt/L91meNbn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21f-sIdFY98BMWqLwBLpLUR3GzJTQhQ\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 543,
    "path": "../public/_nuxt/L91meNbn.js"
  },
  "/_nuxt/L9t79GZl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1950-bOSHs4QuofVjf2ggJ3A58EemLcc\"",
    "mtime": "2025-12-12T15:43:07.521Z",
    "size": 6480,
    "path": "../public/_nuxt/L9t79GZl.js"
  },
  "/_nuxt/LWN7Ml79.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b04-Wos1s/VSoWRdUK0tncyturj+EPA\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 2820,
    "path": "../public/_nuxt/LWN7Ml79.js"
  },
  "/_nuxt/MijbCScG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e0d-DWNLieuLgyt5gkxp1I1n/CcHZbA\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 3597,
    "path": "../public/_nuxt/MijbCScG.js"
  },
  "/_nuxt/NDKZ5YZU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5dea-BMAG39h63+YjTx2Sr81SH2Tlgl8\"",
    "mtime": "2025-12-12T15:43:07.520Z",
    "size": 24042,
    "path": "../public/_nuxt/NDKZ5YZU.js"
  },
  "/_nuxt/NNQW-3h3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17e-sNB792SqUj/8R8IXRWK1NWUdh4s\"",
    "mtime": "2025-12-12T15:43:07.521Z",
    "size": 382,
    "path": "../public/_nuxt/NNQW-3h3.js"
  },
  "/_nuxt/NOQYQep1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.521Z",
    "size": 39,
    "path": "../public/_nuxt/NOQYQep1.js"
  },
  "/_nuxt/NleAzG8P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"54f9-tW99xdwnrps5LNbO2MQpVsQGwFw\"",
    "mtime": "2025-12-12T15:43:07.521Z",
    "size": 21753,
    "path": "../public/_nuxt/NleAzG8P.js"
  },
  "/_nuxt/O71tmJej.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3f48-Q/Mot56MWzGqMmhUBZAU/ckrlJM\"",
    "mtime": "2025-12-12T15:43:07.521Z",
    "size": 16200,
    "path": "../public/_nuxt/O71tmJej.js"
  },
  "/_nuxt/OC06uI2y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.521Z",
    "size": 39,
    "path": "../public/_nuxt/OC06uI2y.js"
  },
  "/_nuxt/PaEai26e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d9-G5OdeUJLbs/B3v9nic0WbaBi75s\"",
    "mtime": "2025-12-12T15:43:07.521Z",
    "size": 729,
    "path": "../public/_nuxt/PaEai26e.js"
  },
  "/_nuxt/PoHY5YXO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"62d2-RQN1eJvOzFVrdHrv5KOv5WHUyDo\"",
    "mtime": "2025-12-12T15:43:07.521Z",
    "size": 25298,
    "path": "../public/_nuxt/PoHY5YXO.js"
  },
  "/_nuxt/Pre.DmpPSE9a.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"112-0F1qp4TMJ/Z1WczZql3VIqywhuE\"",
    "mtime": "2025-12-12T15:43:07.521Z",
    "size": 274,
    "path": "../public/_nuxt/Pre.DmpPSE9a.css"
  },
  "/_nuxt/PtXuZUTk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.522Z",
    "size": 39,
    "path": "../public/_nuxt/PtXuZUTk.js"
  },
  "/_nuxt/SB3VIkq9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.522Z",
    "size": 39,
    "path": "../public/_nuxt/SB3VIkq9.js"
  },
  "/_nuxt/StarsBg.BtCjkGHf.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"23d-lwaZh7r9Q0+5Jxmj6magC9Io5SQ\"",
    "mtime": "2025-12-12T15:43:07.522Z",
    "size": 573,
    "path": "../public/_nuxt/StarsBg.BtCjkGHf.css"
  },
  "/_nuxt/Swqp7P87.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2445-R2X1DCQ+zZ3ybPZSJKKcoDIp9B8\"",
    "mtime": "2025-12-12T15:43:07.522Z",
    "size": 9285,
    "path": "../public/_nuxt/Swqp7P87.js"
  },
  "/_nuxt/U2SQhx94.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2adac-jik5VkbDZqDmfGdZQ20bwL7qOC8\"",
    "mtime": "2025-12-12T15:43:07.522Z",
    "size": 175532,
    "path": "../public/_nuxt/U2SQhx94.js"
  },
  "/_nuxt/Ur5nKGRx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22bd-FNV/4BInv6+fe8eJyeWE3MCz9JA\"",
    "mtime": "2025-12-12T15:43:07.522Z",
    "size": 8893,
    "path": "../public/_nuxt/Ur5nKGRx.js"
  },
  "/_nuxt/UxB-tG1-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e70-+1dI50ZU0c/9eCXRHCsHKR5j6LE\"",
    "mtime": "2025-12-12T15:43:07.522Z",
    "size": 3696,
    "path": "../public/_nuxt/UxB-tG1-.js"
  },
  "/_nuxt/VgQuMCP5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2034-snsyueoqH91PiumFFU3m6o5PktY\"",
    "mtime": "2025-12-12T15:43:07.522Z",
    "size": 8244,
    "path": "../public/_nuxt/VgQuMCP5.js"
  },
  "/_nuxt/W6wzhrsJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b20-G84qUJExdxDH5SxeMxobv1PnjqE\"",
    "mtime": "2025-12-12T15:43:07.522Z",
    "size": 2848,
    "path": "../public/_nuxt/W6wzhrsJ.js"
  },
  "/_nuxt/XRrwoikR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1551-FZTJGbVft3bqvSGlk6jPuAmpxXo\"",
    "mtime": "2025-12-12T15:43:07.522Z",
    "size": 5457,
    "path": "../public/_nuxt/XRrwoikR.js"
  },
  "/_nuxt/XTVL4-GN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"201b5-Td9h4oGTx0XGTHRCQWQC0XPCtdA\"",
    "mtime": "2025-12-12T15:43:07.523Z",
    "size": 131509,
    "path": "../public/_nuxt/XTVL4-GN.js"
  },
  "/_nuxt/Y7xjPF_K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"55c-+y2VvBDGkL4u9GSJTBhaM68EfA4\"",
    "mtime": "2025-12-12T15:43:07.523Z",
    "size": 1372,
    "path": "../public/_nuxt/Y7xjPF_K.js"
  },
  "/_nuxt/Yzrsuije.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a207-6VR5nHiV/sPzx6yPxdz5gyf5xro\"",
    "mtime": "2025-12-12T15:43:07.523Z",
    "size": 41479,
    "path": "../public/_nuxt/Yzrsuije.js"
  },
  "/_nuxt/_BJ-lfg-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"339a-14xt90/W3Mz94bc5kbYYJhz+NLg\"",
    "mtime": "2025-12-12T15:43:07.523Z",
    "size": 13210,
    "path": "../public/_nuxt/_BJ-lfg-.js"
  },
  "/_nuxt/ar6Z8EBM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"937-Ml6H8J9UMTV7vco8KbRsICkOr70\"",
    "mtime": "2025-12-12T15:43:07.523Z",
    "size": 2359,
    "path": "../public/_nuxt/ar6Z8EBM.js"
  },
  "/_nuxt/b6avLNDz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18e0-dDqEx4L8uDbYSnk2orirO6ZFwRU\"",
    "mtime": "2025-12-12T15:43:07.523Z",
    "size": 6368,
    "path": "../public/_nuxt/b6avLNDz.js"
  },
  "/_nuxt/bN70gL4F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1876-TIy/lDxhgGcsWEw99X2SyGsc2kY\"",
    "mtime": "2025-12-12T15:43:07.523Z",
    "size": 6262,
    "path": "../public/_nuxt/bN70gL4F.js"
  },
  "/_nuxt/bNaE6FFb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4f-q42BFfiRogfcH1Y60YZFuPDwE5Q\"",
    "mtime": "2025-12-12T15:43:07.523Z",
    "size": 79,
    "path": "../public/_nuxt/bNaE6FFb.js"
  },
  "/_nuxt/dg2QTUdp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1524b-l6tm0aUvrnLz7lHsncDc6etXYWU\"",
    "mtime": "2025-12-12T15:43:07.524Z",
    "size": 86603,
    "path": "../public/_nuxt/dg2QTUdp.js"
  },
  "/_nuxt/di6GdC49.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.523Z",
    "size": 39,
    "path": "../public/_nuxt/di6GdC49.js"
  },
  "/_nuxt/eOWES_5F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2389-cfZiAh5p4ibF2IndL5MDZpOaJT4\"",
    "mtime": "2025-12-12T15:43:07.523Z",
    "size": 9097,
    "path": "../public/_nuxt/eOWES_5F.js"
  },
  "/_nuxt/entry.Q1-LjyoF.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"31191-6iwfHswXPFd/g821jGBrRWAHIXs\"",
    "mtime": "2025-12-12T15:43:07.525Z",
    "size": 201105,
    "path": "../public/_nuxt/entry.Q1-LjyoF.css"
  },
  "/_nuxt/error-404.BIq4D8bn.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"97e-e5nTvqMplbnYqIQUmLg/82T8rY8\"",
    "mtime": "2025-12-12T15:43:07.524Z",
    "size": 2430,
    "path": "../public/_nuxt/error-404.BIq4D8bn.css"
  },
  "/_nuxt/error-500.Bi5vnl_R.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"773-0Y7ofdoKh97WWMBglBwcrPBlX74\"",
    "mtime": "2025-12-12T15:43:07.524Z",
    "size": 1907,
    "path": "../public/_nuxt/error-500.Bi5vnl_R.css"
  },
  "/_nuxt/g9-lgVsj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2b680-ofFVdn8l5tpAocltff4iPbGQl3A\"",
    "mtime": "2025-12-12T15:43:07.525Z",
    "size": 177792,
    "path": "../public/_nuxt/g9-lgVsj.js"
  },
  "/_nuxt/hJgmCMqR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"586c-LK9/vH1TOEejdSL+zMpF8l6CEHU\"",
    "mtime": "2025-12-12T15:43:07.524Z",
    "size": 22636,
    "path": "../public/_nuxt/hJgmCMqR.js"
  },
  "/_nuxt/hegEt444.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8b51-G3BXQ+3KNXzWihQj05Fol+jGA9g\"",
    "mtime": "2025-12-12T15:43:07.525Z",
    "size": 35665,
    "path": "../public/_nuxt/hegEt444.js"
  },
  "/_nuxt/iAI4XpJW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1740-HBaKOvuL79uCSAyAyxTvarxBVJQ\"",
    "mtime": "2025-12-12T15:43:07.525Z",
    "size": 5952,
    "path": "../public/_nuxt/iAI4XpJW.js"
  },
  "/_nuxt/iZkgTnJm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"22a-rYcmqCbbv7JYlgQAXRFc1oXksYc\"",
    "mtime": "2025-12-12T15:43:07.525Z",
    "size": 554,
    "path": "../public/_nuxt/iZkgTnJm.js"
  },
  "/_nuxt/ide74d6n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3fa9-il/nef91sFnizgpzhuv/ZO5KOs4\"",
    "mtime": "2025-12-12T15:43:07.525Z",
    "size": 16297,
    "path": "../public/_nuxt/ide74d6n.js"
  },
  "/_nuxt/iik6CYzq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"464-CW1sy4/o2AnViHLnN2lYCt16CJk\"",
    "mtime": "2025-12-12T15:43:07.525Z",
    "size": 1124,
    "path": "../public/_nuxt/iik6CYzq.js"
  },
  "/_nuxt/jBIP5AR6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.526Z",
    "size": 39,
    "path": "../public/_nuxt/jBIP5AR6.js"
  },
  "/_nuxt/jC9TJ8OI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1dc-7ULCd/q7bKR0WaECTviWfhJu4aw\"",
    "mtime": "2025-12-12T15:43:07.525Z",
    "size": 476,
    "path": "../public/_nuxt/jC9TJ8OI.js"
  },
  "/_nuxt/kkTDvnL6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1031-0nufz/1qQ+RfxGF2h1hDrCS7Pqc\"",
    "mtime": "2025-12-12T15:43:07.526Z",
    "size": 4145,
    "path": "../public/_nuxt/kkTDvnL6.js"
  },
  "/_nuxt/kwW2ifaA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"62cc-xL/Q5vvgLa6vnjMdQ4jTjNxF1hM\"",
    "mtime": "2025-12-12T15:43:07.526Z",
    "size": 25292,
    "path": "../public/_nuxt/kwW2ifaA.js"
  },
  "/_nuxt/l2Twz-pm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.526Z",
    "size": 39,
    "path": "../public/_nuxt/l2Twz-pm.js"
  },
  "/_nuxt/mG5-8o_R.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12394-vUg8kTHzi+FqegxHXAyH3M1D5+g\"",
    "mtime": "2025-12-12T15:43:07.527Z",
    "size": 74644,
    "path": "../public/_nuxt/mG5-8o_R.js"
  },
  "/_nuxt/mMzvUnD7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27-m/RQvP2OVudpNCghjjRsGDm4utA\"",
    "mtime": "2025-12-12T15:43:07.526Z",
    "size": 39,
    "path": "../public/_nuxt/mMzvUnD7.js"
  },
  "/_nuxt/mSCmeSYF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"158-ec9InipRM8WpbdZzfddYda4QhQc\"",
    "mtime": "2025-12-12T15:43:07.526Z",
    "size": 344,
    "path": "../public/_nuxt/mSCmeSYF.js"
  },
  "/_nuxt/n6PIjT4D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"219f-1CXZJjBufwCIzcgyqCcjjQ0eXZs\"",
    "mtime": "2025-12-12T15:43:07.527Z",
    "size": 8607,
    "path": "../public/_nuxt/n6PIjT4D.js"
  },
  "/_nuxt/nBsNuk_f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30c55-mG2SvwzDhQOTXSvIq+yL2Kc0MW0\"",
    "mtime": "2025-12-12T15:43:07.527Z",
    "size": 199765,
    "path": "../public/_nuxt/nBsNuk_f.js"
  },
  "/_nuxt/qzPJJAAI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"129c-J4rZaLnUyDyqUH6m+/OTa6Rwbfo\"",
    "mtime": "2025-12-12T15:43:07.527Z",
    "size": 4764,
    "path": "../public/_nuxt/qzPJJAAI.js"
  },
  "/_nuxt/sIbWZUhG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f59-30oQFwTrqPOsLIn410ZRKGpXCV0\"",
    "mtime": "2025-12-12T15:43:07.527Z",
    "size": 12121,
    "path": "../public/_nuxt/sIbWZUhG.js"
  },
  "/_nuxt/sqlite3-DBpDb1lf.wasm": {
    "type": "application/wasm",
    "etag": "\"d117f-DZ/FD4oW3SqSLEuDOEQ4+vXRNGQ\"",
    "mtime": "2025-12-12T15:43:07.529Z",
    "size": 856447,
    "path": "../public/_nuxt/sqlite3-DBpDb1lf.wasm"
  },
  "/_nuxt/sqlite3-opfs-async-proxy-C_otN2ZJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"24eb-/FBLK7guMdffqRNvJNbJgk4Zwss\"",
    "mtime": "2025-12-12T15:43:07.527Z",
    "size": 9451,
    "path": "../public/_nuxt/sqlite3-opfs-async-proxy-C_otN2ZJ.js"
  },
  "/_nuxt/sqlite3-worker1-bundler-friendly-Bv6ABw9v.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30103-GOxHNTh2sTNh/exLYlR0tZpazpY\"",
    "mtime": "2025-12-12T15:43:07.528Z",
    "size": 196867,
    "path": "../public/_nuxt/sqlite3-worker1-bundler-friendly-Bv6ABw9v.js"
  },
  "/_nuxt/sqlite3.DBpDb1lf.wasm": {
    "type": "application/wasm",
    "etag": "\"d117f-DZ/FD4oW3SqSLEuDOEQ4+vXRNGQ\"",
    "mtime": "2025-12-12T15:43:07.528Z",
    "size": 856447,
    "path": "../public/_nuxt/sqlite3.DBpDb1lf.wasm"
  },
  "/_nuxt/tDHnQoFI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f7-s3vEjOCy/Ogm5DmmXicGZd1xfcU\"",
    "mtime": "2025-12-12T15:43:07.528Z",
    "size": 503,
    "path": "../public/_nuxt/tDHnQoFI.js"
  },
  "/_nuxt/vs9xsbRV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ab0f-cp6tCA8c9YXjktz2i1zYD4SA1Gs\"",
    "mtime": "2025-12-12T15:43:07.528Z",
    "size": 43791,
    "path": "../public/_nuxt/vs9xsbRV.js"
  },
  "/_nuxt/w3ymjzqR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a86f-2VyxenUZw+2iwJH3d3MpxIM+TG0\"",
    "mtime": "2025-12-12T15:43:07.529Z",
    "size": 43119,
    "path": "../public/_nuxt/w3ymjzqR.js"
  },
  "/_nuxt/wDzz0qaB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2aaeb-rwGKGhqDut2TIRHOOItrnHHA7vQ\"",
    "mtime": "2025-12-12T15:43:07.530Z",
    "size": 174827,
    "path": "../public/_nuxt/wDzz0qaB.js"
  },
  "/_nuxt/wI7S0bgz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4630-vd/e83/GKPLeVSqV3KHD6ZPF/9E\"",
    "mtime": "2025-12-12T15:43:07.528Z",
    "size": 17968,
    "path": "../public/_nuxt/wI7S0bgz.js"
  },
  "/_nuxt/xcoGWDS5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e7c3-6Asi5tpk6Tdf/WBoLIRwDULd2hU\"",
    "mtime": "2025-12-12T15:43:07.528Z",
    "size": 59331,
    "path": "../public/_nuxt/xcoGWDS5.js"
  },
  "/_nuxt/y5MdiEbo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ca3-PCoPlge5kSPJVlzPBFeU7wKbvno\"",
    "mtime": "2025-12-12T15:43:07.529Z",
    "size": 3235,
    "path": "../public/_nuxt/y5MdiEbo.js"
  },
  "/__nuxt_content/content/sql_dump.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"14c0-5zni/2IcwjGPWevrQq0DfU3Nzio\"",
    "mtime": "2025-12-12T15:43:06.687Z",
    "size": 5312,
    "path": "../public/__nuxt_content/content/sql_dump.txt"
  },
  "/images/dark/connect.svg": {
    "type": "image/svg+xml",
    "etag": "\"91a6-4YXJwBo8rWcpuQb7T/zbHErGFqg\"",
    "mtime": "2025-12-12T15:43:07.546Z",
    "size": 37286,
    "path": "../public/images/dark/connect.svg"
  },
  "/images/dark/line-1.svg": {
    "type": "image/svg+xml",
    "etag": "\"612f-S1F8It57E4epzC8YeO6qu84yWls\"",
    "mtime": "2025-12-12T15:43:07.546Z",
    "size": 24879,
    "path": "../public/images/dark/line-1.svg"
  },
  "/images/dark/line-2.svg": {
    "type": "image/svg+xml",
    "etag": "\"30fb-G/Jd0jcjSQGuSx167upZ/Pg2ge8\"",
    "mtime": "2025-12-12T15:43:07.540Z",
    "size": 12539,
    "path": "../public/images/dark/line-2.svg"
  },
  "/images/dark/line-3.svg": {
    "type": "image/svg+xml",
    "etag": "\"a81-eMTlh8urjB2ON/FtxMVWT5F0az4\"",
    "mtime": "2025-12-12T15:43:07.546Z",
    "size": 2689,
    "path": "../public/images/dark/line-3.svg"
  },
  "/images/dark/line-4.svg": {
    "type": "image/svg+xml",
    "etag": "\"3273-Y35plvTXG7biQHat6Usl/JoeXuo\"",
    "mtime": "2025-12-12T15:43:07.547Z",
    "size": 12915,
    "path": "../public/images/dark/line-4.svg"
  },
  "/images/dark/line-5.svg": {
    "type": "image/svg+xml",
    "etag": "\"b07-UqpcRCoTXRQaKz0pTMXFJBrv2qs\"",
    "mtime": "2025-12-12T15:43:07.546Z",
    "size": 2823,
    "path": "../public/images/dark/line-5.svg"
  },
  "/images/dark/line-6.svg": {
    "type": "image/svg+xml",
    "etag": "\"1e81-LoVJbZT9bLeEUxXe5gZThpJTrhU\"",
    "mtime": "2025-12-12T15:43:07.547Z",
    "size": 7809,
    "path": "../public/images/dark/line-6.svg"
  },
  "/images/dark/line-7.svg": {
    "type": "image/svg+xml",
    "etag": "\"465e-ckAfGF6b1V3niB7WrPb7BesCLK4\"",
    "mtime": "2025-12-12T15:43:07.547Z",
    "size": 18014,
    "path": "../public/images/dark/line-7.svg"
  },
  "/images/dark/optimize.svg": {
    "type": "image/svg+xml",
    "etag": "\"2cb2-SS3uuioc/ttkuHEYUaW4/v+SR0o\"",
    "mtime": "2025-12-12T15:43:07.547Z",
    "size": 11442,
    "path": "../public/images/dark/optimize.svg"
  },
  "/images/dark/track.svg": {
    "type": "image/svg+xml",
    "etag": "\"c7a-O+0v5KSBUZ6Bvn9i0Nx/9xvb6tI\"",
    "mtime": "2025-12-12T15:43:07.548Z",
    "size": 3194,
    "path": "../public/images/dark/track.svg"
  },
  "/images/light/connect.svg": {
    "type": "image/svg+xml",
    "etag": "\"9192-SCpfydqw5FI9y88YmmZ5KmtwcOQ\"",
    "mtime": "2025-12-12T15:43:07.541Z",
    "size": 37266,
    "path": "../public/images/light/connect.svg"
  },
  "/images/light/diagnostico.jpg": {
    "type": "image/jpeg",
    "etag": "\"1906d3-426wpMIQtJEHSuhL2UszXXnblVQ\"",
    "mtime": "2025-12-12T15:43:07.549Z",
    "size": 1640147,
    "path": "../public/images/light/diagnostico.jpg"
  },
  "/images/light/ejecucion.jpg": {
    "type": "image/jpeg",
    "etag": "\"15544d-9902Dash5UrmZ7rGZkTR7hDT+7Y\"",
    "mtime": "2025-12-12T15:43:07.549Z",
    "size": 1397837,
    "path": "../public/images/light/ejecucion.jpg"
  },
  "/images/light/evaluacion.jpg": {
    "type": "image/jpeg",
    "etag": "\"20f26f-4lCF6j5EdAoHfop8XmFBbHVRwZk\"",
    "mtime": "2025-12-12T15:43:07.549Z",
    "size": 2159215,
    "path": "../public/images/light/evaluacion.jpg"
  },
  "/images/light/line-1.svg": {
    "type": "image/svg+xml",
    "etag": "\"60a0-qydD8IhXf99sIv0QiVITsdGC2cc\"",
    "mtime": "2025-12-12T15:43:07.548Z",
    "size": 24736,
    "path": "../public/images/light/line-1.svg"
  },
  "/images/light/line-2.svg": {
    "type": "image/svg+xml",
    "etag": "\"30f9-sQCQRbKz1+2MN6/GDkU/cPj3p2I\"",
    "mtime": "2025-12-12T15:43:07.548Z",
    "size": 12537,
    "path": "../public/images/light/line-2.svg"
  },
  "/images/light/line-3.svg": {
    "type": "image/svg+xml",
    "etag": "\"a7d-bW47vLtAvJ0tEcjwIpAq1T55a8A\"",
    "mtime": "2025-12-12T15:43:07.548Z",
    "size": 2685,
    "path": "../public/images/light/line-3.svg"
  },
  "/images/light/line-4.svg": {
    "type": "image/svg+xml",
    "etag": "\"3271-UL0iKvgNQEk/DPKuNFjbyA0QQJc\"",
    "mtime": "2025-12-12T15:43:07.549Z",
    "size": 12913,
    "path": "../public/images/light/line-4.svg"
  },
  "/images/light/line-5.svg": {
    "type": "image/svg+xml",
    "etag": "\"b03-4y69S8HxZecOskJdPhKEYLTIuLg\"",
    "mtime": "2025-12-12T15:43:07.549Z",
    "size": 2819,
    "path": "../public/images/light/line-5.svg"
  },
  "/images/light/line-6.svg": {
    "type": "image/svg+xml",
    "etag": "\"1e7f-4cvu+qey4jD37WY9UEr0y9W0rUc\"",
    "mtime": "2025-12-12T15:43:07.549Z",
    "size": 7807,
    "path": "../public/images/light/line-6.svg"
  },
  "/images/light/line-7.svg": {
    "type": "image/svg+xml",
    "etag": "\"465c-dbMa5clddyl7Chyg4Sq+VWoLiNA\"",
    "mtime": "2025-12-12T15:43:07.549Z",
    "size": 18012,
    "path": "../public/images/light/line-7.svg"
  },
  "/images/light/optimize.svg": {
    "type": "image/svg+xml",
    "etag": "\"2cb2-Pihj8F0lmmoZ25p6iinr3gUsxCY\"",
    "mtime": "2025-12-12T15:43:07.550Z",
    "size": 11442,
    "path": "../public/images/light/optimize.svg"
  },
  "/images/light/track.svg": {
    "type": "image/svg+xml",
    "etag": "\"c64-ouQN+m7Id5SCaSeIfJL6ZYdcCLQ\"",
    "mtime": "2025-12-12T15:43:07.550Z",
    "size": 3172,
    "path": "../public/images/light/track.svg"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-Dm1Zrn1zYEWg5HgZnjuatYWaH4I\"",
    "mtime": "2025-12-12T15:43:07.429Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_ipx/s_40x40/images/emilia.jpg": {
    "type": "image/jpeg",
    "etag": "\"3b3-Yi55vpXaVXjjeVtswkBUrhu2c2E\"",
    "mtime": "2025-12-12T15:43:07.109Z",
    "size": 947,
    "path": "../public/_ipx/s_40x40/images/emilia.jpg"
  },
  "/_ipx/s_40x40/images/pablo.png": {
    "type": "image/png",
    "etag": "\"afe-qrltkDDTySSHTSn1npATXQ4KVWU\"",
    "mtime": "2025-12-12T15:43:07.111Z",
    "size": 2814,
    "path": "../public/_ipx/s_40x40/images/pablo.png"
  },
  "/_ipx/s_40x40/images/sofia.jpeg": {
    "type": "image/jpeg",
    "etag": "\"43f-yUD+QEk8peWqxFQ7MIFiSmdRWXo\"",
    "mtime": "2025-12-12T15:43:07.111Z",
    "size": 1087,
    "path": "../public/_ipx/s_40x40/images/sofia.jpeg"
  },
  "/_ipx/s_80x80/images/emilia.jpg": {
    "type": "image/jpeg",
    "etag": "\"71d-czTFGDm3hWcDVia5eNm8/zyJAZo\"",
    "mtime": "2025-12-12T15:43:07.111Z",
    "size": 1821,
    "path": "../public/_ipx/s_80x80/images/emilia.jpg"
  },
  "/_ipx/s_80x80/images/pablo.png": {
    "type": "image/png",
    "etag": "\"20a9-wBI+QzF95/fw+nZJd9Gk/Hscnxo\"",
    "mtime": "2025-12-12T15:43:07.111Z",
    "size": 8361,
    "path": "../public/_ipx/s_80x80/images/pablo.png"
  },
  "/_ipx/s_80x80/images/sofia.jpeg": {
    "type": "image/jpeg",
    "etag": "\"8c5-kBHtcYuAXiJHR0oDZOviiXY7F/0\"",
    "mtime": "2025-12-12T15:43:07.102Z",
    "size": 2245,
    "path": "../public/_ipx/s_80x80/images/sofia.jpeg"
  },
  "/_nuxt/builds/meta/a65e10b3-fa0c-4560-b8d9-db0bbea40a23.json": {
    "type": "application/json",
    "etag": "\"c7-FOMUlOCbFIngHgRvoSIYcScy2Mc\"",
    "mtime": "2025-12-12T15:43:07.428Z",
    "size": 199,
    "path": "../public/_nuxt/builds/meta/a65e10b3-fa0c-4560-b8d9-db0bbea40a23.json"
  },
  "/_ipx/_/images/dark/line-1.svg": {
    "type": "image/svg+xml",
    "etag": "\"6096-Fz47/DGLHyCOrtH0JAKxIwtRz74\"",
    "mtime": "2025-12-12T15:43:07.215Z",
    "size": 24726,
    "path": "../public/_ipx/_/images/dark/line-1.svg"
  },
  "/_ipx/_/images/dark/line-2.svg": {
    "type": "image/svg+xml",
    "etag": "\"30f7-uWppoB9GlWAvT9OkpjtUqUvwNOM\"",
    "mtime": "2025-12-12T15:43:07.216Z",
    "size": 12535,
    "path": "../public/_ipx/_/images/dark/line-2.svg"
  },
  "/_ipx/_/images/dark/line-3.svg": {
    "type": "image/svg+xml",
    "etag": "\"a77-NGBACl67sAEwlhOFftCqVTnsKvE\"",
    "mtime": "2025-12-12T15:43:07.216Z",
    "size": 2679,
    "path": "../public/_ipx/_/images/dark/line-3.svg"
  },
  "/_ipx/_/images/dark/line-5.svg": {
    "type": "image/svg+xml",
    "etag": "\"afd-7CZvT/N9nNhrHv0dTiAOV/9qzZk\"",
    "mtime": "2025-12-12T15:43:07.216Z",
    "size": 2813,
    "path": "../public/_ipx/_/images/dark/line-5.svg"
  },
  "/_ipx/_/images/dark/line-6.svg": {
    "type": "image/svg+xml",
    "etag": "\"1e71-SyHKl9YKsPVhGsbqbV1ARlfVFhE\"",
    "mtime": "2025-12-12T15:43:07.216Z",
    "size": 7793,
    "path": "../public/_ipx/_/images/dark/line-6.svg"
  },
  "/_ipx/_/images/dark/line-7.svg": {
    "type": "image/svg+xml",
    "etag": "\"4659-8K8RO5AprEZc6Ddq9x6vsXqPS4o\"",
    "mtime": "2025-12-12T15:43:07.216Z",
    "size": 18009,
    "path": "../public/_ipx/_/images/dark/line-7.svg"
  },
  "/_ipx/_/images/light/diagnostico.jpg": {
    "type": "image/jpeg",
    "etag": "\"1b585e-GzBD5MXs7gOmBqVXdTO9tYdLMJQ\"",
    "mtime": "2025-12-12T15:43:07.382Z",
    "size": 1792094,
    "path": "../public/_ipx/_/images/light/diagnostico.jpg"
  },
  "/_ipx/_/images/light/ejecucion.jpg": {
    "type": "image/jpeg",
    "etag": "\"17335f-VPMD5O5lO6cjBsnMlwWYc3QWxOY\"",
    "mtime": "2025-12-12T15:43:07.324Z",
    "size": 1520479,
    "path": "../public/_ipx/_/images/light/ejecucion.jpg"
  },
  "/_ipx/_/images/light/evaluacion.jpg": {
    "type": "image/jpeg",
    "etag": "\"23f892-cOpE2nHakCTKtnEzZbySXZVxyTA\"",
    "mtime": "2025-12-12T15:43:07.408Z",
    "size": 2357394,
    "path": "../public/_ipx/_/images/light/evaluacion.jpg"
  },
  "/_ipx/_/images/light/line-1.svg": {
    "type": "image/svg+xml",
    "etag": "\"6091-gRcj84JnjEHenRt9xKUFXeCSVBM\"",
    "mtime": "2025-12-12T15:43:07.215Z",
    "size": 24721,
    "path": "../public/_ipx/_/images/light/line-1.svg"
  },
  "/_ipx/_/images/light/line-2.svg": {
    "type": "image/svg+xml",
    "etag": "\"30f5-t7jgA3m6DDJzuSP9hgABIGgQT9g\"",
    "mtime": "2025-12-12T15:43:07.216Z",
    "size": 12533,
    "path": "../public/_ipx/_/images/light/line-2.svg"
  },
  "/_ipx/_/images/light/line-3.svg": {
    "type": "image/svg+xml",
    "etag": "\"a73-F003E/e1W1nZ7IT06PWKXyHZq1g\"",
    "mtime": "2025-12-12T15:43:07.216Z",
    "size": 2675,
    "path": "../public/_ipx/_/images/light/line-3.svg"
  },
  "/_ipx/_/images/light/line-5.svg": {
    "type": "image/svg+xml",
    "etag": "\"af9-UVON/7Ho5YRvM49AyRcrA35mY/k\"",
    "mtime": "2025-12-12T15:43:07.216Z",
    "size": 2809,
    "path": "../public/_ipx/_/images/light/line-5.svg"
  },
  "/_ipx/_/images/light/line-6.svg": {
    "type": "image/svg+xml",
    "etag": "\"1e6f-xi44+ghqJUjhaFLgbXL6Rt8FQvA\"",
    "mtime": "2025-12-12T15:43:07.216Z",
    "size": 7791,
    "path": "../public/_ipx/_/images/light/line-6.svg"
  },
  "/_ipx/_/images/light/line-7.svg": {
    "type": "image/svg+xml",
    "etag": "\"4657-KGddZKdmS/1FeYmw5LQPkzLl/mU\"",
    "mtime": "2025-12-12T15:43:07.216Z",
    "size": 18007,
    "path": "../public/_ipx/_/images/light/line-7.svg"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};
const basename = function(p, extension) {
  const segments = normalizeWindowsPath(p).split("/");
  let lastSegment = "";
  for (let i = segments.length - 1; i >= 0; i--) {
    const val = segments[i];
    if (val) {
      lastSegment = val;
      break;
    }
  }
  return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_fonts/":{"maxAge":31536000},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _DIj8yb = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _SxA8c9 = defineEventHandler(() => {});

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

function baseURL() {
  return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const checksums = {
  "content": "v3.5.0--kFeySSoeZr00abHid6XPQXBtllBrYN1DAH-Gy0Qqppw"
};
const checksumsStructure = {
  "content": "OYKYSvMGXpa1hytGSAUAhnBxybE8Svcp5kdHxaJQgg0"
};

const tables = {
  "content": "_content_content",
  "info": "_content_info"
};

const contentManifest = {
  "content": {
    "type": "page",
    "fields": {
      "id": "string",
      "title": "string",
      "administration": "json",
      "agency": "json",
      "body": "json",
      "consultancy": "json",
      "cta": "json",
      "description": "string",
      "extension": "string",
      "hero": "json",
      "meta": "json",
      "navigation": "json",
      "path": "string",
      "pricing": "json",
      "section": "json",
      "seo": "json",
      "stem": "string",
      "steps": "json",
      "team": "json",
      "testimonials": "json"
    }
  },
  "info": {
    "type": "data",
    "fields": {}
  }
};

async function fetchDatabase(event, collection) {
  return await $fetch(`/__nuxt_content/${collection}/sql_dump.txt`, {
    context: event ? { cloudflare: event.context.cloudflare } : {},
    responseType: "text",
    headers: {
      "content-type": "text/plain",
      ...event?.node?.req?.headers?.cookie ? { cookie: event.node.req.headers.cookie } : {}
    },
    query: { v: checksums[String(collection)], t: void 0 }
  });
}

const collections = {
  'lucide': () => import('../_/icons.mjs').then(m => m.default),
  'simple-icons': () => import('../_/icons2.mjs').then(m => m.default),
};

const DEFAULT_ENDPOINT = "https://api.iconify.design";
const _CDCfWe = defineCachedEventHandler(async (event) => {
  const url = getRequestURL(event);
  if (!url)
    return createError$1({ status: 400, message: "Invalid icon request" });
  const options = useAppConfig().icon;
  const collectionName = event.context.params?.collection?.replace(/\.json$/, "");
  const collection = collectionName ? await collections[collectionName]?.() : null;
  const apiEndPoint = options.iconifyApiEndpoint || DEFAULT_ENDPOINT;
  const icons = url.searchParams.get("icons")?.split(",");
  if (collection) {
    if (icons?.length) {
      const data = getIcons(
        collection,
        icons
      );
      consola.debug(`[Icon] serving ${(icons || []).map((i) => "`" + collectionName + ":" + i + "`").join(",")} from bundled collection`);
      return data;
    }
  }
  if (options.fallbackToApi === true || options.fallbackToApi === "server-only") {
    const apiUrl = new URL("./" + basename(url.pathname) + url.search, apiEndPoint);
    consola.debug(`[Icon] fetching ${(icons || []).map((i) => "`" + collectionName + ":" + i + "`").join(",")} from iconify api`);
    if (apiUrl.host !== new URL(apiEndPoint).host) {
      return createError$1({ status: 400, message: "Invalid icon request" });
    }
    try {
      const data = await $fetch(apiUrl.href);
      return data;
    } catch (e) {
      consola.error(e);
      if (e.status === 404)
        return createError$1({ status: 404 });
      else
        return createError$1({ status: 500, message: "Failed to fetch fallback icon" });
    }
  }
  return createError$1({ status: 404 });
}, {
  group: "nuxt",
  name: "icon",
  getKey(event) {
    const collection = event.context.params?.collection?.replace(/\.json$/, "") || "unknown";
    const icons = String(getQuery(event).icons || "");
    return `${collection}_${icons.split(",")[0]}_${icons.length}_${hash$1(icons)}`;
  },
  swr: true,
  maxAge: 60 * 60 * 24 * 7
  // 1 week
});

const _JVHauc = eventHandler(async (event) => {
  const { code, lang, theme: themeString, options: optionsStr } = getQuery(event);
  const theme = JSON.parse(themeString);
  const options = optionsStr ? JSON.parse(optionsStr) : {};
  const highlighter = await import('../build/mdc-highlighter.mjs').then((m) => m.default);
  return await highlighter(code, lang, theme, options);
});

async function requestAccessToken$1(url, options) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    ...options.headers
  };
  const body = headers["Content-Type"] === "application/x-www-form-urlencoded" ? new URLSearchParams(
    options.body || options.params || {}
  ).toString() : options.body;
  return $fetch(url, {
    method: "POST",
    headers,
    body
  }).catch((error) => {
    if (error instanceof FetchError && error.status === 401) {
      return error.data;
    }
    throw error;
  });
}
async function generateOAuthState(event) {
  const newState = getRandomBytes(32);
  const requestURL = getRequestURL(event);
  const isSecure = requestURL.protocol === "https:";
  setCookie(event, "studio-oauth-state", newState, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 60 * 15
    // 15 minutes
  });
  return newState;
}
function validateOAuthState(event, receivedState) {
  const storedState = getCookie(event, "studio-oauth-state");
  if (!storedState) {
    throw createError$1({
      statusCode: 400,
      message: "OAuth state cookie not found. Please try logging in again.",
      data: {
        hint: "State cookie may have expired or been cleared"
      }
    });
  }
  if (receivedState !== storedState) {
    throw createError$1({
      statusCode: 400,
      message: "Invalid state - OAuth state mismatch",
      data: {
        hint: "This may be caused by browser refresh, navigation, or expired session"
      }
    });
  }
  deleteCookie(event, "studio-oauth-state");
}
function getRandomBytes(size = 32) {
  return encodeBase64Url(getRandomValues(new Uint8Array(size)));
}
function encodeBase64Url(input) {
  return btoa(String.fromCharCode.apply(null, Array.from(input))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

const _0viF8R = eventHandler(async (event) => {
  const studioConfig = useRuntimeConfig(event).studio;
  const config = defu(studioConfig?.auth?.github, {
    clientId: process.env.STUDIO_GITHUB_CLIENT_ID,
    clientSecret: process.env.STUDIO_GITHUB_CLIENT_SECRET,
    redirectURL: process.env.STUDIO_GITHUB_REDIRECT_URL,
    authorizationURL: "https://github.com/login/oauth/authorize",
    tokenURL: "https://github.com/login/oauth/access_token",
    apiURL: "https://api.github.com",
    authorizationParams: {},
    emailRequired: true
  });
  const query = getQuery(event);
  if (query.error) {
    throw createError$1({
      statusCode: 401,
      message: `GitHub login failed: ${query.error || "Unknown error"}`,
      data: query
    });
  }
  if (!config.clientId || !config.clientSecret) {
    throw createError$1({
      statusCode: 500,
      message: "Missing GitHub client ID or secret",
      data: config
    });
  }
  const requestURL = getRequestURL(event);
  config.redirectURL = config.redirectURL || `${requestURL.protocol}//${requestURL.host}${requestURL.pathname}`;
  if (!query.code) {
    const state = await generateOAuthState(event);
    config.scope = config.scope || [];
    if (config.emailRequired && !config.scope.includes("user:email")) {
      config.scope.push("user:email");
    }
    if (config.emailRequired && !config.scope.includes("repo") && !config.scope.includes("public_repo")) {
      config.scope.push(studioConfig.repository.private ? "repo" : "public_repo");
    }
    return sendRedirect(
      event,
      withQuery(config.authorizationURL, {
        client_id: config.clientId,
        redirect_uri: config.redirectURL,
        scope: config.scope.join(" "),
        state,
        ...config.authorizationParams
      })
    );
  }
  validateOAuthState(event, query.state);
  const token = await requestAccessToken$1(config.tokenURL, {
    body: {
      grant_type: "authorization_code",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectURL,
      code: query.code
    }
  });
  if (token.error || !token.access_token) {
    throw createError$1({
      statusCode: 500,
      message: "Failed to get access token",
      data: token
    });
  }
  const accessToken = token.access_token;
  const user = await $fetch(`${config.apiURL}/user`, {
    headers: {
      "User-Agent": `Github-OAuth-${config.clientId}`,
      "Authorization": `token ${accessToken}`
    }
  });
  if (!user.email && config.emailRequired) {
    const emails = await $fetch(`${config.apiURL}/user/emails`, {
      headers: {
        "User-Agent": `Github-OAuth-${config.clientId}`,
        "Authorization": `token ${accessToken}`
      }
    });
    const primaryEmail = emails.find((email) => email.primary);
    if (!primaryEmail) {
      throw createError$1({
        statusCode: 500,
        message: "Could not get GitHub user email",
        data: token
      });
    }
    user.email = primaryEmail.email;
  }
  const moderators = process.env.STUDIO_GITHUB_MODERATORS?.split(",") || [];
  if (moderators.length > 0 && !moderators.includes(String(user.email))) {
    throw createError$1({
      statusCode: 403,
      message: "You are not authorized to access the studio"
    });
  }
  const session = await useSession(event, {
    name: "studio-session",
    password: useRuntimeConfig(event).studio?.auth?.sessionSecret
  });
  await session.update(defu({
    user: {
      contentUser: true,
      providerId: user.id.toString(),
      accessToken: token.access_token,
      name: user.name || user.login,
      avatar: user.avatar_url,
      email: user.email,
      provider: "github"
    }
  }, session.data));
  const redirect = decodeURIComponent(getCookie(event, "studio-redirect") || "");
  deleteCookie(event, "studio-redirect");
  setCookie(event, "studio-session-check", "true", { httpOnly: false });
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return sendRedirect(event, redirect);
  }
  return sendRedirect(event, "/");
});

const _cyF74q = eventHandler(async (event) => {
  const studioConfig = useRuntimeConfig(event).studio;
  const config = defu(studioConfig?.auth?.google, {
    clientId: process.env.STUDIO_GOOGLE_CLIENT_ID,
    clientSecret: process.env.STUDIO_GOOGLE_CLIENT_SECRET,
    redirectURL: process.env.STUDIO_GOOGLE_REDIRECT_URL,
    authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenURL: "https://oauth2.googleapis.com/token",
    userURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    authorizationParams: {},
    emailRequired: true
  });
  const query = getQuery(event);
  if (query.error) {
    throw createError$1({
      statusCode: 401,
      message: `Google login failed: ${query.error || "Unknown error"}`,
      data: query
    });
  }
  if (!config.clientId || !config.clientSecret) {
    throw createError$1({
      statusCode: 500,
      message: "Missing Google client ID or secret",
      data: config
    });
  }
  const provider = studioConfig?.repository?.provider || "github";
  if (provider === "github" && !process.env.STUDIO_GITHUB_TOKEN) {
    throw createError$1({
      statusCode: 500,
      message: "`STUDIO_GITHUB_TOKEN` is not set. Google authenticated users cannot push changes to the repository without a valid GitHub token."
    });
  }
  if (provider === "gitlab" && !process.env.STUDIO_GITLAB_TOKEN) {
    throw createError$1({
      statusCode: 500,
      message: "`STUDIO_GITLAB_TOKEN` is not set. Google authenticated users cannot push changes to the repository without a valid GitLab token."
    });
  }
  const repositoryToken = provider === "github" ? process.env.STUDIO_GITHUB_TOKEN : process.env.STUDIO_GITLAB_TOKEN;
  const requestURL = getRequestURL(event);
  config.redirectURL = config.redirectURL || `${requestURL.protocol}//${requestURL.host}${requestURL.pathname}`;
  if (!query.code) {
    const state = await generateOAuthState(event);
    config.scope = config.scope || ["email", "profile"];
    return sendRedirect(
      event,
      withQuery(config.authorizationURL, {
        response_type: "code",
        client_id: config.clientId,
        redirect_uri: config.redirectURL,
        scope: config.scope.join(" "),
        state,
        ...config.authorizationParams
      })
    );
  }
  validateOAuthState(event, query.state);
  const token = await requestAccessToken$1(config.tokenURL, {
    body: {
      grant_type: "authorization_code",
      code: query.code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectURL
    }
  });
  if (token.error || !token.access_token) {
    throw createError$1({
      statusCode: 500,
      message: "Failed to get access token",
      data: token
    });
  }
  const accessToken = token.access_token;
  const user = await $fetch(
    config.userURL,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  if (!user.email && config.emailRequired) {
    throw createError$1({
      statusCode: 500,
      message: "Could not get Google user email",
      data: user
    });
  }
  const moderators = process.env.STUDIO_GOOGLE_MODERATORS?.split(",") || [];
  if (!moderators.includes(user.email)) {
    throw createError$1({
      statusCode: 403,
      message: "You are not authorized to access the studio"
    });
  }
  const session = await useSession(event, {
    name: "studio-session",
    password: useRuntimeConfig(event).studio?.auth?.sessionSecret
  });
  await session.update(defu({
    user: {
      contentUser: true,
      providerId: String(user.sub).toString(),
      accessToken: repositoryToken,
      name: user.name || `${user.given_name || ""} ${user.family_name || ""}`.trim(),
      avatar: user.picture,
      email: user.email,
      provider: "google"
    }
  }, session.data));
  const redirect = decodeURIComponent(getCookie(event, "studio-redirect") || "");
  deleteCookie(event, "studio-redirect");
  setCookie(event, "studio-session-check", "true", { httpOnly: false });
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return sendRedirect(event, redirect);
  }
  return sendRedirect(event, "/");
});

const _kGHfUp = eventHandler(async (event) => {
  const studioConfig = useRuntimeConfig(event).studio;
  const instanceUrl = studioConfig?.auth?.gitlab?.instanceUrl || "https://gitlab.com";
  const config = defu(studioConfig?.auth?.gitlab, {
    applicationId: process.env.STUDIO_GITLAB_APPLICATION_ID,
    applicationSecret: process.env.STUDIO_GITLAB_APPLICATION_SECRET,
    redirectURL: process.env.STUDIO_GITLAB_REDIRECT_URL,
    instanceUrl,
    authorizationURL: `${instanceUrl}/oauth/authorize`,
    tokenURL: `${instanceUrl}/oauth/token`,
    apiURL: `${instanceUrl}/api/v4`,
    authorizationParams: {},
    emailRequired: true
  });
  const query = getQuery(event);
  if (query.error) {
    throw createError$1({
      statusCode: 401,
      message: `GitLab login failed: ${query.error || "Unknown error"}`,
      data: query
    });
  }
  if (!config.applicationId || !config.applicationSecret) {
    throw createError$1({
      statusCode: 500,
      message: "Missing GitLab application ID or secret",
      data: config
    });
  }
  const requestURL = getRequestURL(event);
  config.redirectURL = config.redirectURL || `${requestURL.protocol}//${requestURL.host}${requestURL.pathname}`;
  if (!query.code) {
    const state = await generateOAuthState(event);
    config.scope = config.scope || [];
    if (!config.scope.includes("api")) {
      config.scope.push("api");
    }
    return sendRedirect(
      event,
      withQuery(config.authorizationURL, {
        client_id: config.applicationId,
        redirect_uri: config.redirectURL,
        response_type: "code",
        scope: config.scope.join(" "),
        state,
        ...config.authorizationParams
      })
    );
  }
  validateOAuthState(event, query.state);
  const token = await requestAccessToken(config.tokenURL, {
    body: {
      grant_type: "authorization_code",
      client_id: config.applicationId,
      client_secret: config.applicationSecret,
      redirect_uri: config.redirectURL,
      code: query.code
    }
  });
  if (token.error || !token.access_token) {
    throw createError$1({
      statusCode: 500,
      message: "Failed to get access token",
      data: token
    });
  }
  const accessToken = token.access_token;
  const user = await $fetch(`${config.apiURL}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!user.email && config.emailRequired) {
    throw createError$1({
      statusCode: 500,
      message: "Could not get GitLab user email",
      data: token
    });
  }
  const moderators = process.env.STUDIO_GITLAB_MODERATORS?.split(",") || [];
  if (moderators.length > 0 && !moderators.includes(String(user.email))) {
    throw createError$1({
      statusCode: 403,
      message: "You are not authorized to access the studio"
    });
  }
  const session = await useSession(event, {
    name: "studio-session",
    password: useRuntimeConfig(event).studio?.auth?.sessionSecret
  });
  await session.update(defu({
    user: {
      contentUser: true,
      providerId: user.id.toString(),
      accessToken: token.access_token,
      name: user.name || user.username,
      avatar: user.avatar_url,
      email: user.email,
      provider: "gitlab"
    }
  }, session.data));
  const redirect = decodeURIComponent(getCookie(event, "studio-redirect") || "/");
  deleteCookie(event, "studio-redirect");
  setCookie(event, "studio-session-check", "true", { httpOnly: false });
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return sendRedirect(event, redirect);
  }
  return sendRedirect(event, "/");
});
async function requestAccessToken(url, options) {
  try {
    return await $fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: options.body,
      params: options.params
    });
  } catch (error) {
    if (error instanceof FetchError) {
      return error.data || { error: error.message };
    }
    return { error: "Unknown error" };
  }
}

const _XdfxGk = eventHandler(async (event) => {
  const session = await useSession(event, {
    name: "studio-session",
    password: useRuntimeConfig(event).studio?.auth?.sessionSecret
  });
  if (!session.data || Object.keys(session.data).length === 0) {
    deleteCookie(event, "studio-session-check");
  }
  return {
    ...session.data,
    id: session.id
  };
});

const _OeB82F = eventHandler(async (event) => {
  const session = await useSession(event, {
    name: "studio-session",
    password: useRuntimeConfig(event).studio?.auth?.sessionSecret
  });
  await session.clear();
  deleteCookie(event, "studio-session-check");
  return { loggedOut: true };
});

const _Kew6bR = eventHandler((event) => {
  const { redirect } = getQuery(event);
  if (redirect) {
    setCookie(event, "studio-redirect", String(redirect), {
      httpOnly: true
    });
  }
  const config = useRuntimeConfig(event);
  if (!process.env.STUDIO_GOOGLE_CLIENT_ID) {
    const provider = config.public.studio?.repository?.provider || "github";
    return sendRedirect(event, `/__nuxt_studio/auth/${provider}`);
  }
  if (!process.env.STUDIO_GITHUB_CLIENT_ID && !process.env.STUDIO_GITLAB_APPLICATION_ID) {
    return sendRedirect(event, "/__nuxt_studio/auth/google");
  }
  const hasGithub = !!process.env.STUDIO_GITHUB_CLIENT_ID;
  const hasGitlab = !!process.env.STUDIO_GITLAB_APPLICATION_ID;
  const hasGoogle = !!process.env.STUDIO_GOOGLE_CLIENT_ID;
  const githubButton = hasGithub ? `<a href="#" class="provider-btn github" data-provider="github">
                <svg viewBox="0 0 16 16" version="1.1" aria-hidden="true">
                    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
                Continue with GitHub
            </a>` : "";
  const gitlabButton = hasGitlab ? `<a href="#" class="provider-btn gitlab" data-provider="gitlab">
                <svg viewBox="0 0 380 380" aria-hidden="true">
                    <g fill="#ffffff">
                        <path d="M282.83,170.73l-.27-.69-26.14-68.22a6.81,6.81,0,0,0-2.69-3.24,7,7,0,0,0-8,.43,7,7,0,0,0-2.32,3.52l-17.65,54H154.29l-17.65-54A6.86,6.86,0,0,0,134.32,99a7,7,0,0,0-8-.43,6.87,6.87,0,0,0-2.69,3.24L97.44,170l-.26.69a48.54,48.54,0,0,0,16.1,56.1l.09.07.24.17,39.82,29.82,19.7,14.91,12,9.06a8.07,8.07,0,0,0,9.76,0l12-9.06,19.7-14.91,40.06-30,.1-.08A48.56,48.56,0,0,0,282.83,170.73Z"/>
                    </g>
                </svg>
                Continue with GitLab
            </a>` : "";
  const googleButton = hasGoogle ? `<a href="#" class="provider-btn google" data-provider="google">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
            </a>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Content Studio</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>
      (function () {
        var storageListenerKey = 'studio-auth-popup'

        function navigateToProvider(provider) {
          window.location.assign('/__nuxt_studio/auth/' + provider)
        }

        function notifyOpenerAndClose() {
          try {
            if (window.opener && !window.opener.closed) {
              window.opener.localStorage.setItem('temp-' + storageListenerKey, String(Date.now()))
            }
          } catch (_) {}
          setTimeout(function () { window.close() }, 100)
        }

        // If this page was opened as a popup with ?done=1, signal the opener and close
        var params = new URLSearchParams(window.location.search)
        if (params.get('done') === '1') {
          notifyOpenerAndClose()
        }

        window.addEventListener('DOMContentLoaded', function () {
          var buttons = document.querySelectorAll('.provider-btn')
          buttons.forEach(function(btn) {
            btn.addEventListener('click', function (e) {
              e.preventDefault()
              var provider = btn.getAttribute('data-provider')
              navigateToProvider(provider)
            })
          })
        })
      })()
    <\/script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --background: #0d1117;
            --surface: #161b22;
            --surface-hover: #21262d;
            --border: #30363d;
            --text-primary: #f0f6fc;
            --text-secondary: #8b949e;
            --github: #24292f;
            --github-hover: #32383f;
            --gitlab: #fc6d26;
            --gitlab-hover: #e85b15;
            --google: #ffffff;
            --google-hover: #f8f9fa;
            --google-text: #1f1f1f;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            background: var(--background);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1.5;
        }

        .login-container {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 48px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 16px 32px rgba(1, 4, 9, 0.85);
        }

        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logo img {
            width: 48px;
            height: 48px;
        }

        .header {
            text-align: center;
            margin-bottom: 24px;
        }

        .header h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--text-primary);
        }

        .header p {
            color: var(--text-secondary);
            font-size: 16px;
        }

        .providers {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .provider-btn {
            width: 100%;
            border: 1px solid var(--border);
            padding: 14px 20px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            transition: all 0.2s ease;
            text-decoration: none;
        }

        .provider-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .provider-btn svg {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }

        .provider-btn.gitlab svg {
            height: 30px;
            width: 30px;
        }

        .provider-btn.github {
            background: var(--github);
            color: var(--text-primary);
        }

        .provider-btn.github:hover {
            background: var(--github-hover);
            border-color: var(--github-hover);
        }

        .provider-btn.github svg {
            fill: currentColor;
        }

        .provider-btn.gitlab {
            background: var(--gitlab);
            color: #ffffff;
            border-color: var(--gitlab);
        }

        .provider-btn.gitlab:hover {
            background: var(--gitlab-hover);
            border-color: var(--gitlab-hover);
        }

        .provider-btn.google {
            background: var(--google);
            color: var(--google-text);
            border-color: #dadce0;
        }

        .provider-btn.google:hover {
            background: var(--google-hover);
            border-color: #d2d3d4;
        }

        .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid var(--border);
        }

        .footer p {
            color: var(--text-secondary);
            font-size: 14px;
        }

        .footer a {
            color: #0969da;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        @media (max-width: 480px) {
            .login-container {
                padding: 32px 24px;
                margin: 16px;
            }

            .provider-btn {
                font-size: 14px;
                padding: 12px 16px;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
          <img src="https://nuxt.com/assets/design-kit/icon-white.svg" alt="Nuxt Logo" />
        </div>

        <div class="header">
            <h1>Nuxt Studio</h1>
            <p>Sign in to start editing your website.</p>
        </div>

        <div class="providers">
            ${githubButton}
            ${gitlabButton}
            ${googleButton}
        </div>

    </div>
</body>
</html>`;
});

const components = {
  "ProseADVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/A.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/A.d.vue.ts",
    "pascalName": "ProseADVue",
    "kebabName": "prose-a-d-vue",
    "chunkName": "components/prose-a-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "href",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "target",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\"",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\"",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\""
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseASlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseASlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "href",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "target",
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\"",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\""
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "Eiu_fiFQ2DAfIezNpFp9FqigbcqmuDqPODn70DUCyjU"
    }
  },
  "ProseA": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/A.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/A.vue",
    "pascalName": "ProseA",
    "kebabName": "prose-a",
    "chunkName": "components/prose-a",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseAccordionDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Accordion.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Accordion.d.vue.ts",
    "pascalName": "ProseAccordionDVue",
    "kebabName": "prose-accordion-d-vue",
    "chunkName": "components/prose-accordion-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "type",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "\"single\" | \"multiple\"",
          "schema": {
            "kind": "enum",
            "type": "\"single\" | \"multiple\"",
            "schema": {
              "0": "\"single\"",
              "1": "\"multiple\""
            }
          }
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; trigger?: ClassNameValue; } & { root?: ClassNameValue; item?: ClassNameValue; header?: ClassNameValue; trigger?: ClassNameValue; content?: ClassNameValue; body?: ClassNameValue; leadingIcon?: ClassNameValue; trailingIcon?: ClassNameValue; label?: ClassNameValue; }",
          "schema": {
            "kind": "object",
            "type": "{ root?: ClassNameValue; trigger?: ClassNameValue; } & { root?: ClassNameValue; item?: ClassNameValue; header?: ClassNameValue; trigger?: ClassNameValue; content?: ClassNameValue; body?: ClassNameValue; leadingIcon?: ClassNameValue; trailingIcon?: ClassNameValue; label?: ClassNameValue; }",
            "schema": {
              "root": {
                "name": "root",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": {
                  "kind": "enum",
                  "type": "ClassNameValue",
                  "schema": {
                    "0": "string",
                    "1": "false",
                    "2": "0",
                    "3": "0n",
                    "4": {
                      "kind": "array",
                      "type": "ClassNameArray",
                      "schema": [
                        "ClassNameValue"
                      ]
                    }
                  }
                }
              },
              "trigger": {
                "name": "trigger",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "item": {
                "name": "item",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "header": {
                "name": "header",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "content": {
                "name": "content",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "body": {
                "name": "body",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "leadingIcon": {
                "name": "leadingIcon",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "trailingIcon": {
                "name": "trailingIcon",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "label": {
                "name": "label",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              }
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseAccordionSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseAccordionSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "type",
          "type": "\"single\" | \"multiple\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"single\" | \"multiple\"",
            "schema": {
              "0": "\"single\"",
              "1": "\"multiple\""
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; trigger?: ClassNameValue; } & { root?: ClassNameValue; item?: ClassNameValue; header?: ClassNameValue; trigger?: ClassNameValue; content?: ClassNameValue; body?: ClassNameValue; leadingIcon?: ClassNameValue; trailingIcon?: ClassNameValue; label?: ClassNameValue; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ root?: ClassNameValue; trigger?: ClassNameValue; } & { root?: ClassNameValue; item?: ClassNameValue; header?: ClassNameValue; trigger?: ClassNameValue; content?: ClassNameValue; body?: ClassNameValue; leadingIcon?: ClassNameValue; trailingIcon?: ClassNameValue; label?: ClassNameValue; }",
            "schema": {
              "root": {
                "name": "root",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": {
                  "kind": "enum",
                  "type": "ClassNameValue",
                  "schema": {
                    "0": "string",
                    "1": "false",
                    "2": "0",
                    "3": "0n",
                    "4": {
                      "kind": "array",
                      "type": "ClassNameArray",
                      "schema": [
                        "ClassNameValue"
                      ]
                    }
                  }
                }
              },
              "trigger": {
                "name": "trigger",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "item": {
                "name": "item",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "header": {
                "name": "header",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "content": {
                "name": "content",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "body": {
                "name": "body",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "leadingIcon": {
                "name": "leadingIcon",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "trailingIcon": {
                "name": "trailingIcon",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "label": {
                "name": "label",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              }
            }
          }
        }
      ],
      "hash": "7CuM9QXEAQyI3j-wmVcbyYBctZpmIbo4Nr2Jv0op060"
    }
  },
  "ProseAccordion": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Accordion.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Accordion.vue",
    "pascalName": "ProseAccordion",
    "kebabName": "prose-accordion",
    "chunkName": "components/prose-accordion",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseAccordionItemDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/AccordionItem.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/AccordionItem.d.vue.ts",
    "pascalName": "ProseAccordionItemDVue",
    "kebabName": "prose-accordion-item-d-vue",
    "chunkName": "components/prose-accordion-item-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "label",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "description",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseAccordionItemSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseAccordionItemSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "label",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "description",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "9mshd9xQJzI9AETIDQfzK4gm6CG4wkOe7nb3KcCKqLs"
    }
  },
  "ProseAccordionItem": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/AccordionItem.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/AccordionItem.vue",
    "pascalName": "ProseAccordionItem",
    "kebabName": "prose-accordion-item",
    "chunkName": "components/prose-accordion-item",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseBadgeDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Badge.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Badge.d.vue.ts",
    "pascalName": "ProseBadgeDVue",
    "kebabName": "prose-badge-d-vue",
    "chunkName": "components/prose-badge-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseBadgeSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseBadgeSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "2joJ6AplkrZLwaEOf5v_vhUtMMHOXpXyvmGEyFD4mYU"
    }
  },
  "ProseBadge": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Badge.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Badge.vue",
    "pascalName": "ProseBadge",
    "kebabName": "prose-badge",
    "chunkName": "components/prose-badge",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseBlockquoteDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Blockquote.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Blockquote.d.vue.ts",
    "pascalName": "ProseBlockquoteDVue",
    "kebabName": "prose-blockquote-d-vue",
    "chunkName": "components/prose-blockquote-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseBlockquoteSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseBlockquoteSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "1f9yxaNry3whzit8VyaB3xKcIPCIvNteby-uVWlLJpI"
    }
  },
  "ProseBlockquote": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Blockquote.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Blockquote.vue",
    "pascalName": "ProseBlockquote",
    "kebabName": "prose-blockquote",
    "chunkName": "components/prose-blockquote",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCalloutDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Callout.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Callout.d.vue.ts",
    "pascalName": "ProseCalloutDVue",
    "kebabName": "prose-callout-d-vue",
    "chunkName": "components/prose-callout-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "to",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
          "schema": {
            "kind": "enum",
            "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
            "schema": {
              "0": "string",
              "1": {
                "kind": "object",
                "type": "RouteLocationAsRelativeGeneric",
                "schema": {
                  "name": {
                    "name": "name",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteRecordNameGeneric",
                    "schema": {
                      "kind": "enum",
                      "type": "RouteRecordNameGeneric",
                      "schema": {
                        "0": "string",
                        "1": "symbol"
                      }
                    }
                  },
                  "params": {
                    "name": "params",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteParamsRawGeneric",
                    "schema": "RouteParamsRawGeneric"
                  },
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "A relative path to the current location. This property should be removed",
                    "tags": [],
                    "required": false,
                    "type": "undefined",
                    "schema": "undefined"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": {
                      "kind": "enum",
                      "type": "boolean",
                      "schema": {
                        "0": "false",
                        "1": "true"
                      }
                    }
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\nNote this will also add a new entry to the history unless `replace: true`\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\nvalues and some primitives like Symbols are forbidden. More info at\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": {
                      "kind": "object",
                      "type": "HistoryState",
                      "schema": {}
                    }
                  }
                }
              },
              "2": {
                "kind": "object",
                "type": "RouteLocationAsPathGeneric",
                "schema": {
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "Percentage encoded pathname section of the URL.",
                    "tags": [],
                    "required": true,
                    "type": "string",
                    "schema": "string"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\nNote this will also add a new entry to the history unless `replace: true`\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\nvalues and some primitives like Symbols are forbidden. More info at\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": "HistoryState"
                  }
                }
              }
            }
          }
        },
        {
          "name": "target",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\"",
              "4": {
                "kind": "object",
                "type": "string & {}",
                "schema": {}
              }
            }
          }
        },
        {
          "name": "icon",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "color",
          "global": false,
          "description": "",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'neutral'"
            }
          ],
          "required": false,
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; icon?: ClassNameValue; externalIcon?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; icon?: ClassNameValue; externalIcon?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCalloutSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCalloutSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "to",
          "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
            "schema": {
              "0": "string",
              "1": {
                "kind": "object",
                "type": "RouteLocationAsRelativeGeneric",
                "schema": {
                  "name": {
                    "name": "name",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteRecordNameGeneric",
                    "schema": {
                      "kind": "enum",
                      "type": "RouteRecordNameGeneric",
                      "schema": {
                        "0": "string",
                        "1": "symbol"
                      }
                    }
                  },
                  "params": {
                    "name": "params",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteParamsRawGeneric",
                    "schema": "RouteParamsRawGeneric"
                  },
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "A relative path to the current location. This property should be removed",
                    "tags": [],
                    "required": false,
                    "type": "undefined",
                    "schema": "undefined"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": {
                      "kind": "enum",
                      "type": "boolean",
                      "schema": {
                        "0": "false",
                        "1": "true"
                      }
                    }
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\nNote this will also add a new entry to the history unless `replace: true`\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\nvalues and some primitives like Symbols are forbidden. More info at\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": {
                      "kind": "object",
                      "type": "HistoryState",
                      "schema": {}
                    }
                  }
                }
              },
              "2": {
                "kind": "object",
                "type": "RouteLocationAsPathGeneric",
                "schema": {
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "Percentage encoded pathname section of the URL.",
                    "tags": [],
                    "required": true,
                    "type": "string",
                    "schema": "string"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\nNote this will also add a new entry to the history unless `replace: true`\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\nvalues and some primitives like Symbols are forbidden. More info at\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": "HistoryState"
                  }
                }
              }
            }
          }
        },
        {
          "name": "target",
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\"",
              "4": {
                "kind": "object",
                "type": "string & {}",
                "schema": {}
              }
            }
          }
        },
        {
          "name": "icon",
          "type": "string | object",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "color",
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; icon?: ClassNameValue; externalIcon?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; icon?: ClassNameValue; externalIcon?: ClassNameValue; }"
        }
      ],
      "hash": "51Bpo1M7qUWJlrBP5ubOmV3LQnAip-BiHnucV_4x7yY"
    }
  },
  "ProseCallout": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Callout.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Callout.vue",
    "pascalName": "ProseCallout",
    "kebabName": "prose-callout",
    "chunkName": "components/prose-callout",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCardDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Card.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Card.d.vue.ts",
    "pascalName": "ProseCardDVue",
    "kebabName": "prose-card-d-vue",
    "chunkName": "components/prose-card-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "to",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
          "schema": {
            "kind": "enum",
            "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
            "schema": {
              "0": "string",
              "1": {
                "kind": "object",
                "type": "RouteLocationAsRelativeGeneric",
                "schema": {
                  "name": {
                    "name": "name",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteRecordNameGeneric",
                    "schema": {
                      "kind": "enum",
                      "type": "RouteRecordNameGeneric",
                      "schema": {
                        "0": "string",
                        "1": "symbol"
                      }
                    }
                  },
                  "params": {
                    "name": "params",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteParamsRawGeneric",
                    "schema": "RouteParamsRawGeneric"
                  },
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "A relative path to the current location. This property should be removed",
                    "tags": [],
                    "required": false,
                    "type": "undefined",
                    "schema": "undefined"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": {
                      "kind": "enum",
                      "type": "boolean",
                      "schema": {
                        "0": "false",
                        "1": "true"
                      }
                    }
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\nNote this will also add a new entry to the history unless `replace: true`\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\nvalues and some primitives like Symbols are forbidden. More info at\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": {
                      "kind": "object",
                      "type": "HistoryState",
                      "schema": {}
                    }
                  }
                }
              },
              "2": {
                "kind": "object",
                "type": "RouteLocationAsPathGeneric",
                "schema": {
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "Percentage encoded pathname section of the URL.",
                    "tags": [],
                    "required": true,
                    "type": "string",
                    "schema": "string"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\nNote this will also add a new entry to the history unless `replace: true`\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\nvalues and some primitives like Symbols are forbidden. More info at\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": "HistoryState"
                  }
                }
              }
            }
          }
        },
        {
          "name": "target",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\"",
              "4": {
                "kind": "object",
                "type": "string & {}",
                "schema": {}
              }
            }
          }
        },
        {
          "name": "icon",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "title",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "description",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "color",
          "global": false,
          "description": "",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'primary'"
            }
          ],
          "required": false,
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; icon?: ClassNameValue; title?: ClassNameValue; description?: ClassNameValue; externalIcon?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; icon?: ClassNameValue; title?: ClassNameValue; description?: ClassNameValue; externalIcon?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        },
        {
          "name": "title",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCardSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCardSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              },
              "title": {
                "name": "title",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "to",
          "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric",
            "schema": {
              "0": "string",
              "1": {
                "kind": "object",
                "type": "RouteLocationAsRelativeGeneric",
                "schema": {
                  "name": {
                    "name": "name",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteRecordNameGeneric",
                    "schema": {
                      "kind": "enum",
                      "type": "RouteRecordNameGeneric",
                      "schema": {
                        "0": "string",
                        "1": "symbol"
                      }
                    }
                  },
                  "params": {
                    "name": "params",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "RouteParamsRawGeneric",
                    "schema": "RouteParamsRawGeneric"
                  },
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "A relative path to the current location. This property should be removed",
                    "tags": [],
                    "required": false,
                    "type": "undefined",
                    "schema": "undefined"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": {
                      "kind": "enum",
                      "type": "boolean",
                      "schema": {
                        "0": "false",
                        "1": "true"
                      }
                    }
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\nNote this will also add a new entry to the history unless `replace: true`\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\nvalues and some primitives like Symbols are forbidden. More info at\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": {
                      "kind": "object",
                      "type": "HistoryState",
                      "schema": {}
                    }
                  }
                }
              },
              "2": {
                "kind": "object",
                "type": "RouteLocationAsPathGeneric",
                "schema": {
                  "path": {
                    "name": "path",
                    "global": false,
                    "description": "Percentage encoded pathname section of the URL.",
                    "tags": [],
                    "required": true,
                    "type": "string",
                    "schema": "string"
                  },
                  "query": {
                    "name": "query",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "LocationQueryRaw",
                    "schema": "LocationQueryRaw"
                  },
                  "hash": {
                    "name": "hash",
                    "global": false,
                    "description": "",
                    "tags": [],
                    "required": false,
                    "type": "string",
                    "schema": "string"
                  },
                  "replace": {
                    "name": "replace",
                    "global": false,
                    "description": "Replace the entry in the history instead of pushing a new entry",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "force": {
                    "name": "force",
                    "global": false,
                    "description": "Triggers the navigation even if the location is the same as the current one.\nNote this will also add a new entry to the history unless `replace: true`\nis passed.",
                    "tags": [],
                    "required": false,
                    "type": "boolean",
                    "schema": "boolean"
                  },
                  "state": {
                    "name": "state",
                    "global": false,
                    "description": "State to save using the History API. This cannot contain any reactive\nvalues and some primitives like Symbols are forbidden. More info at\nhttps://developer.mozilla.org/en-US/docs/Web/API/History/state",
                    "tags": [],
                    "required": false,
                    "type": "HistoryState",
                    "schema": "HistoryState"
                  }
                }
              }
            }
          }
        },
        {
          "name": "target",
          "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"_blank\" | \"_parent\" | \"_self\" | \"_top\" | (string & {})",
            "schema": {
              "0": "\"_blank\"",
              "1": "\"_parent\"",
              "2": "\"_self\"",
              "3": "\"_top\"",
              "4": {
                "kind": "object",
                "type": "string & {}",
                "schema": {}
              }
            }
          }
        },
        {
          "name": "icon",
          "type": "string | object",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "title",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "description",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "color",
          "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\" | \"neutral\"",
            "schema": {
              "0": "\"primary\"",
              "1": "\"secondary\"",
              "2": "\"success\"",
              "3": "\"info\"",
              "4": "\"warning\"",
              "5": "\"error\"",
              "6": "\"neutral\""
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; icon?: ClassNameValue; title?: ClassNameValue; description?: ClassNameValue; externalIcon?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; icon?: ClassNameValue; title?: ClassNameValue; description?: ClassNameValue; externalIcon?: ClassNameValue; }"
        }
      ],
      "hash": "elfkVqrknjKoZzaLiO1wXPl_ZyrByrzFySzhoXovvCk"
    }
  },
  "ProseCard": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Card.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Card.vue",
    "pascalName": "ProseCard",
    "kebabName": "prose-card",
    "chunkName": "components/prose-card",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCardGroupDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CardGroup.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CardGroup.d.vue.ts",
    "pascalName": "ProseCardGroupDVue",
    "kebabName": "prose-card-group-d-vue",
    "chunkName": "components/prose-card-group-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCardGroupSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCardGroupSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "df3drvcEflYQfC_oPSpYBrt1-6slTecQKM79Ca2B0J8"
    }
  },
  "ProseCardGroup": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CardGroup.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CardGroup.vue",
    "pascalName": "ProseCardGroup",
    "kebabName": "prose-card-group",
    "chunkName": "components/prose-card-group",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCodeDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Code.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Code.d.vue.ts",
    "pascalName": "ProseCodeDVue",
    "kebabName": "prose-code-d-vue",
    "chunkName": "components/prose-code-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "lang",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "color",
          "global": false,
          "description": "",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'neutral'"
            }
          ],
          "required": false,
          "type": "\"neutral\" | \"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\"",
          "schema": {
            "kind": "enum",
            "type": "\"neutral\" | \"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\"",
            "schema": {
              "0": "\"neutral\"",
              "1": "\"primary\"",
              "2": "\"secondary\"",
              "3": "\"success\"",
              "4": "\"info\"",
              "5": "\"warning\"",
              "6": "\"error\""
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCodeSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCodeSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "lang",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "color",
          "type": "\"neutral\" | \"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"neutral\" | \"primary\" | \"secondary\" | \"success\" | \"info\" | \"warning\" | \"error\"",
            "schema": {
              "0": "\"neutral\"",
              "1": "\"primary\"",
              "2": "\"secondary\"",
              "3": "\"success\"",
              "4": "\"info\"",
              "5": "\"warning\"",
              "6": "\"error\""
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "VR_IFIhEL9sjhZ0PFV0sSGLgF6dkdrDTit3qzy1daNI"
    }
  },
  "ProseCode": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Code.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Code.vue",
    "pascalName": "ProseCode",
    "kebabName": "prose-code",
    "chunkName": "components/prose-code",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCodeCollapseDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeCollapse.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeCollapse.d.vue.ts",
    "pascalName": "ProseCodeCollapseDVue",
    "kebabName": "prose-code-collapse-d-vue",
    "chunkName": "components/prose-code-collapse-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "icon",
          "global": false,
          "description": "The icon displayed to toggle the code.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "appConfig.ui.icons.chevronDown"
            }
          ],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "name",
          "global": false,
          "description": "The name displayed in the trigger label.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.codeCollapse.name')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "openText",
          "global": false,
          "description": "The text displayed when the code is collapsed.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.codeCollapse.openText')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "closeText",
          "global": false,
          "description": "The text displayed when the code is expanded.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.codeCollapse.closeText')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; footer?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; footer?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; }"
        },
        {
          "name": "open",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [
        {
          "name": "update:open",
          "description": "",
          "tags": [],
          "type": "[value: boolean]",
          "signature": "(event: \"update:open\", value: boolean): void",
          "schema": [
            {
              "kind": "enum",
              "type": "boolean",
              "schema": [
                "false",
                "true"
              ]
            }
          ]
        }
      ],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCodeCollapseSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCodeCollapseSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "icon",
          "type": "string | object",
          "description": "The icon displayed to toggle the code.",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "name",
          "type": "string",
          "description": "The name displayed in the trigger label.",
          "schema": "string"
        },
        {
          "name": "openText",
          "type": "string",
          "description": "The text displayed when the code is collapsed.",
          "schema": "string"
        },
        {
          "name": "closeText",
          "type": "string",
          "description": "The text displayed when the code is expanded.",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; footer?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; footer?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; }"
        },
        {
          "name": "open",
          "type": "boolean",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "onUpdate:open",
          "type": "(value: boolean) => any",
          "description": "",
          "schema": {
            "kind": "event",
            "type": "(value: boolean): any",
            "schema": {}
          }
        }
      ],
      "hash": "8akucCJIqprF7KPoZaPmL5VFFVqIOPidJPyDaOPcsG8"
    }
  },
  "ProseCodeCollapse": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeCollapse.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeCollapse.vue",
    "pascalName": "ProseCodeCollapse",
    "kebabName": "prose-code-collapse",
    "chunkName": "components/prose-code-collapse",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCodeGroupDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeGroup.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeGroup.d.vue.ts",
    "pascalName": "ProseCodeGroupDVue",
    "kebabName": "prose-code-group-d-vue",
    "chunkName": "components/prose-code-group-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "defaultValue",
          "global": false,
          "description": "The default tab to select.",
          "tags": [
            {
              "name": "example",
              "text": "'1'"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "sync",
          "global": false,
          "description": "Sync the selected tab with a local storage key.",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; }"
        },
        {
          "name": "modelValue",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [
        {
          "name": "update:modelValue",
          "description": "",
          "tags": [],
          "type": "[value: string]",
          "signature": "(event: \"update:modelValue\", value: string): void",
          "schema": [
            "string"
          ]
        }
      ],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCodeGroupSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCodeGroupSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "defaultValue",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "sync",
          "type": "string",
          "description": "Sync the selected tab with a local storage key.",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; }"
        },
        {
          "name": "modelValue",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "onUpdate:modelValue",
          "type": "(value: string) => any",
          "description": "",
          "schema": {
            "kind": "event",
            "type": "(value: string): any",
            "schema": {}
          }
        }
      ],
      "hash": "Mf47MANFumHvOcH6MmWdhwEibRYi7e3CohyLr3fnHFA"
    }
  },
  "ProseCodeGroup": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeGroup.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeGroup.vue",
    "pascalName": "ProseCodeGroup",
    "kebabName": "prose-code-group",
    "chunkName": "components/prose-code-group",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCodeIconDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeIcon.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeIcon.d.vue.ts",
    "pascalName": "ProseCodeIconDVue",
    "kebabName": "prose-code-icon-d-vue",
    "chunkName": "components/prose-code-icon-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "icon",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "filename",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "icon",
          "type": "string | object",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "filename",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "T6zszGKaUHhMee4spR8Heir5ys63s05fMzKVvLgRfes"
    }
  },
  "ProseCodeIcon": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeIcon.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeIcon.vue",
    "pascalName": "ProseCodeIcon",
    "kebabName": "prose-code-icon",
    "chunkName": "components/prose-code-icon",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCodePreviewDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodePreview.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodePreview.d.vue.ts",
    "pascalName": "ProseCodePreviewDVue",
    "kebabName": "prose-code-preview-d-vue",
    "chunkName": "components/prose-code-preview-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; preview?: ClassNameValue; code?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; preview?: ClassNameValue; code?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        },
        {
          "name": "code",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCodePreviewSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCodePreviewSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              },
              "code": {
                "name": "code",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; preview?: ClassNameValue; code?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; preview?: ClassNameValue; code?: ClassNameValue; }"
        }
      ],
      "hash": "jeCa1mhFupqM269Jrgby2Sd1r_CTdQq3GLbO8FYSF8w"
    }
  },
  "ProseCodePreview": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodePreview.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodePreview.vue",
    "pascalName": "ProseCodePreview",
    "kebabName": "prose-code-preview",
    "chunkName": "components/prose-code-preview",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCodeTreeDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeTree.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeTree.d.vue.ts",
    "pascalName": "ProseCodeTreeDVue",
    "kebabName": "prose-code-tree-d-vue",
    "chunkName": "components/prose-code-tree-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "defaultValue",
          "global": false,
          "description": "The default path to select.",
          "tags": [
            {
              "name": "example",
              "text": "'package.json'"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; list?: ClassNameValue; item?: ClassNameValue; listWithChildren?: ClassNameValue; itemWithChildren?: ClassNameValue; link?: ClassNameValue; linkLeadingIcon?: ClassNameValue; linkLabel?: ClassNameValue; linkTrailing?: ClassNameValue; linkTrailingIcon?: ClassNameValue; content?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; list?: ClassNameValue; item?: ClassNameValue; listWithChildren?: ClassNameValue; itemWithChildren?: ClassNameValue; link?: ClassNameValue; linkLeadingIcon?: ClassNameValue; linkLabel?: ClassNameValue; linkTrailing?: ClassNameValue; linkTrailingIcon?: ClassNameValue; content?: ClassNameValue; }"
        },
        {
          "name": "expandAll",
          "global": false,
          "description": "Expand all directories by default.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "false"
            }
          ],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCodeTreeSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCodeTreeSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "defaultValue",
          "type": "string",
          "description": "The default path to select.",
          "schema": "string"
        },
        {
          "name": "expandAll",
          "type": "boolean",
          "description": "Expand all directories by default.",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; list?: ClassNameValue; item?: ClassNameValue; listWithChildren?: ClassNameValue; itemWithChildren?: ClassNameValue; link?: ClassNameValue; linkLeadingIcon?: ClassNameValue; linkLabel?: ClassNameValue; linkTrailing?: ClassNameValue; linkTrailingIcon?: ClassNameValue; content?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; list?: ClassNameValue; item?: ClassNameValue; listWithChildren?: ClassNameValue; itemWithChildren?: ClassNameValue; link?: ClassNameValue; linkLeadingIcon?: ClassNameValue; linkLabel?: ClassNameValue; linkTrailing?: ClassNameValue; linkTrailingIcon?: ClassNameValue; content?: ClassNameValue; }"
        }
      ],
      "hash": "hqZzcLRgucVyP6oZjXzm3TNKb9TNzFjnBqDBBsmzeeU"
    }
  },
  "ProseCodeTree": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeTree.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/CodeTree.vue",
    "pascalName": "ProseCodeTree",
    "kebabName": "prose-code-tree",
    "chunkName": "components/prose-code-tree",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCollapsibleDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Collapsible.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Collapsible.d.vue.ts",
    "pascalName": "ProseCollapsibleDVue",
    "kebabName": "prose-collapsible-d-vue",
    "chunkName": "components/prose-collapsible-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "icon",
          "global": false,
          "description": "The icon displayed to toggle the collapsible.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "appConfig.ui.icons.chevronDown"
            }
          ],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "name",
          "global": false,
          "description": "The name displayed in the trigger label.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.collapsible.name')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "openText",
          "global": false,
          "description": "The text displayed when the collapsible is open.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.collapsible.openText')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "closeText",
          "global": false,
          "description": "The text displayed when the collapsible is closed.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "t('prose.collapsible.closeText')"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; content?: ClassNameValue; } & { root?: ClassNameValue; content?: ClassNameValue; }",
          "schema": {
            "kind": "object",
            "type": "{ root?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; content?: ClassNameValue; } & { root?: ClassNameValue; content?: ClassNameValue; }",
            "schema": {
              "root": {
                "name": "root",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": {
                  "kind": "enum",
                  "type": "ClassNameValue",
                  "schema": {
                    "0": "string",
                    "1": "false",
                    "2": "0",
                    "3": "0n",
                    "4": {
                      "kind": "array",
                      "type": "ClassNameArray",
                      "schema": [
                        "ClassNameValue"
                      ]
                    }
                  }
                }
              },
              "trigger": {
                "name": "trigger",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "triggerIcon": {
                "name": "triggerIcon",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "triggerLabel": {
                "name": "triggerLabel",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "content": {
                "name": "content",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              }
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseCollapsibleSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseCollapsibleSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "icon",
          "type": "string | object",
          "description": "The icon displayed to toggle the collapsible.",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "name",
          "type": "string",
          "description": "The name displayed in the trigger label.",
          "schema": "string"
        },
        {
          "name": "openText",
          "type": "string",
          "description": "The text displayed when the collapsible is open.",
          "schema": "string"
        },
        {
          "name": "closeText",
          "type": "string",
          "description": "The text displayed when the collapsible is closed.",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; content?: ClassNameValue; } & { root?: ClassNameValue; content?: ClassNameValue; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ root?: ClassNameValue; trigger?: ClassNameValue; triggerIcon?: ClassNameValue; triggerLabel?: ClassNameValue; content?: ClassNameValue; } & { root?: ClassNameValue; content?: ClassNameValue; }",
            "schema": {
              "root": {
                "name": "root",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": {
                  "kind": "enum",
                  "type": "ClassNameValue",
                  "schema": {
                    "0": "string",
                    "1": "false",
                    "2": "0",
                    "3": "0n",
                    "4": {
                      "kind": "array",
                      "type": "ClassNameArray",
                      "schema": [
                        "ClassNameValue"
                      ]
                    }
                  }
                }
              },
              "trigger": {
                "name": "trigger",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "triggerIcon": {
                "name": "triggerIcon",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "triggerLabel": {
                "name": "triggerLabel",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "content": {
                "name": "content",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              }
            }
          }
        }
      ],
      "hash": "w_rRfzqJ24dOvFi6P7Xx0I4IMjGQnUCU4TGKVkwwdgA"
    }
  },
  "ProseCollapsible": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Collapsible.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Collapsible.vue",
    "pascalName": "ProseCollapsible",
    "kebabName": "prose-collapsible",
    "chunkName": "components/prose-collapsible",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseEmDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Em.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Em.d.vue.ts",
    "pascalName": "ProseEmDVue",
    "kebabName": "prose-em-d-vue",
    "chunkName": "components/prose-em-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseEmSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseEmSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "BJ2hsVg_3M0fyHi_dpz5uPYWMeaIL0ZtGHg1m0ajcPc"
    }
  },
  "ProseEm": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Em.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Em.vue",
    "pascalName": "ProseEm",
    "kebabName": "prose-em",
    "chunkName": "components/prose-em",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseFieldDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Field.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Field.d.vue.ts",
    "pascalName": "ProseFieldDVue",
    "kebabName": "prose-field-d-vue",
    "chunkName": "components/prose-field-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "as",
          "global": false,
          "description": "The element or component this component should render as.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'div'"
            }
          ],
          "required": false,
          "type": "any",
          "schema": "any"
        },
        {
          "name": "name",
          "global": false,
          "description": "The name of the field.",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "type",
          "global": false,
          "description": "Expected type of the field's value",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "description",
          "global": false,
          "description": "Description of the field",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; container?: ClassNameValue; name?: ClassNameValue; wrapper?: ClassNameValue; required?: ClassNameValue; type?: ClassNameValue; description?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; container?: ClassNameValue; name?: ClassNameValue; wrapper?: ClassNameValue; required?: ClassNameValue; type?: ClassNameValue; description?: ClassNameValue; }"
        },
        {
          "name": "required",
          "global": false,
          "description": "Indicate whether the field is required",
          "tags": [],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseFieldSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseFieldSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "as",
          "type": "any",
          "description": "The element or component this component should render as.",
          "schema": "any"
        },
        {
          "name": "name",
          "type": "string",
          "description": "The name of the field.",
          "schema": "string"
        },
        {
          "name": "type",
          "type": "string",
          "description": "Expected type of the field's value",
          "schema": "string"
        },
        {
          "name": "description",
          "type": "string",
          "description": "Description of the field",
          "schema": "string"
        },
        {
          "name": "required",
          "type": "boolean",
          "description": "Indicate whether the field is required",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; container?: ClassNameValue; name?: ClassNameValue; wrapper?: ClassNameValue; required?: ClassNameValue; type?: ClassNameValue; description?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; container?: ClassNameValue; name?: ClassNameValue; wrapper?: ClassNameValue; required?: ClassNameValue; type?: ClassNameValue; description?: ClassNameValue; }"
        }
      ],
      "hash": "2oJCkWmLTxdU8pwqraq1SNZrrX7TOyjhxIb5e1Qq1yk"
    }
  },
  "ProseField": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Field.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Field.vue",
    "pascalName": "ProseField",
    "kebabName": "prose-field",
    "chunkName": "components/prose-field",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseFieldGroupDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/FieldGroup.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/FieldGroup.d.vue.ts",
    "pascalName": "ProseFieldGroupDVue",
    "kebabName": "prose-field-group-d-vue",
    "chunkName": "components/prose-field-group-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "as",
          "global": false,
          "description": "The element or component this component should render as.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'div'"
            }
          ],
          "required": false,
          "type": "any",
          "schema": "any"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseFieldGroupSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseFieldGroupSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "as",
          "type": "any",
          "description": "The element or component this component should render as.",
          "schema": "any"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "g0ta3_nHZQVEg0X6P1cEGOCzRCi8Mxaw1Phw4ND47_M"
    }
  },
  "ProseFieldGroup": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/FieldGroup.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/FieldGroup.vue",
    "pascalName": "ProseFieldGroup",
    "kebabName": "prose-field-group",
    "chunkName": "components/prose-field-group",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseH1DVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H1.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H1.d.vue.ts",
    "pascalName": "ProseH1DVue",
    "kebabName": "prose-h1-d-vue",
    "chunkName": "components/prose-h1-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; link?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseH1Slots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseH1Slots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; link?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "hash": "cDFkpdyqQqzV864kDZ5UQ7dt-7GOgRrLP1d4glGfGRM"
    }
  },
  "ProseH1": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H1.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H1.vue",
    "pascalName": "ProseH1",
    "kebabName": "prose-h1",
    "chunkName": "components/prose-h1",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseH2DVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H2.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H2.d.vue.ts",
    "pascalName": "ProseH2DVue",
    "kebabName": "prose-h2-d-vue",
    "chunkName": "components/prose-h2-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseH2Slots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseH2Slots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "hash": "MsSHhHyBgDFIPgUXqHsPyVIPMzH6R09CfobCiSeD5FM"
    }
  },
  "ProseH2": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H2.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H2.vue",
    "pascalName": "ProseH2",
    "kebabName": "prose-h2",
    "chunkName": "components/prose-h2",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseH3DVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H3.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H3.d.vue.ts",
    "pascalName": "ProseH3DVue",
    "kebabName": "prose-h3-d-vue",
    "chunkName": "components/prose-h3-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseH3Slots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseH3Slots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; leading?: ClassNameValue; leadingIcon?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "hash": "bW8Q6mK64nhxxYkIHzLy4s8OZu9ORiM92O_1UFFcR5Q"
    }
  },
  "ProseH3": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H3.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H3.vue",
    "pascalName": "ProseH3",
    "kebabName": "prose-h3",
    "chunkName": "components/prose-h3",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseH4DVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H4.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H4.d.vue.ts",
    "pascalName": "ProseH4DVue",
    "kebabName": "prose-h4-d-vue",
    "chunkName": "components/prose-h4-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; link?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseH4Slots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseH4Slots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; link?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; link?: ClassNameValue; }"
        }
      ],
      "hash": "tG6NsVK7AaIJRD-mfRNAofGKpbD6gAyGh0oj_i9--sM"
    }
  },
  "ProseH4": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H4.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/H4.vue",
    "pascalName": "ProseH4",
    "kebabName": "prose-h4",
    "chunkName": "components/prose-h4",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseHrDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Hr.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Hr.d.vue.ts",
    "pascalName": "ProseHrDVue",
    "kebabName": "prose-hr-d-vue",
    "chunkName": "components/prose-hr-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "sAN0d63Paq7SuXLpgTz64dYWaXakTGmRHqrwhRdRgjA"
    }
  },
  "ProseHr": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Hr.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Hr.vue",
    "pascalName": "ProseHr",
    "kebabName": "prose-hr",
    "chunkName": "components/prose-hr",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseIconDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Icon.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Icon.d.vue.ts",
    "pascalName": "ProseIconDVue",
    "kebabName": "prose-icon-d-vue",
    "chunkName": "components/prose-icon-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "name",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "name",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "BwQxxvPsJ7OgASWM0_F_9Avnf9LKc0fuK-AztsrTKik"
    }
  },
  "ProseIcon": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Icon.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Icon.vue",
    "pascalName": "ProseIcon",
    "kebabName": "prose-icon",
    "chunkName": "components/prose-icon",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseImgDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Img.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Img.d.vue.ts",
    "pascalName": "ProseImgDVue",
    "kebabName": "prose-img-d-vue",
    "chunkName": "components/prose-img-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "src",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "alt",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "width",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | number",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          }
        },
        {
          "name": "height",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | number",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          }
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ base?: ClassNameValue; overlay?: ClassNameValue; content?: ClassNameValue; zoomedImage?: ClassNameValue; }",
          "schema": "{ base?: ClassNameValue; overlay?: ClassNameValue; content?: ClassNameValue; zoomedImage?: ClassNameValue; }"
        },
        {
          "name": "zoom",
          "global": false,
          "description": "Zoom image on click",
          "tags": [
            {
              "name": "defaultValue",
              "text": "true"
            }
          ],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "zoom",
          "type": "boolean",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "src",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "alt",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "width",
          "type": "string | number",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          }
        },
        {
          "name": "height",
          "type": "string | number",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ base?: ClassNameValue; overlay?: ClassNameValue; content?: ClassNameValue; zoomedImage?: ClassNameValue; }",
          "description": "",
          "schema": "{ base?: ClassNameValue; overlay?: ClassNameValue; content?: ClassNameValue; zoomedImage?: ClassNameValue; }"
        }
      ],
      "hash": "x4TxeH-xo6C8P3NnRFSGkgiaBH2Zz2EMejwwffWzmr0"
    }
  },
  "ProseImg": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Img.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Img.vue",
    "pascalName": "ProseImg",
    "kebabName": "prose-img",
    "chunkName": "components/prose-img",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseKbdDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Kbd.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Kbd.d.vue.ts",
    "pascalName": "ProseKbdDVue",
    "kebabName": "prose-kbd-d-vue",
    "chunkName": "components/prose-kbd-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "value",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "value",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "D7iFIuZsq6UEoCP9piDcth2cz4l-Stx9085CITw2-oQ"
    }
  },
  "ProseKbd": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Kbd.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Kbd.vue",
    "pascalName": "ProseKbd",
    "kebabName": "prose-kbd",
    "chunkName": "components/prose-kbd",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseLiDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Li.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Li.d.vue.ts",
    "pascalName": "ProseLiDVue",
    "kebabName": "prose-li-d-vue",
    "chunkName": "components/prose-li-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseLiSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseLiSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "7HBfkj5lGE7O79hI-qV8cEjARIm7_5k7Hucj7-KqI-0"
    }
  },
  "ProseLi": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Li.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Li.vue",
    "pascalName": "ProseLi",
    "kebabName": "prose-li",
    "chunkName": "components/prose-li",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseOlDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Ol.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Ol.d.vue.ts",
    "pascalName": "ProseOlDVue",
    "kebabName": "prose-ol-d-vue",
    "chunkName": "components/prose-ol-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseOlSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseOlSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "TKXtYKynS5a0ao5ozP1vIqY-DAweoCNxjIOwuYYubjg"
    }
  },
  "ProseOl": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Ol.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Ol.vue",
    "pascalName": "ProseOl",
    "kebabName": "prose-ol",
    "chunkName": "components/prose-ol",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProsePDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/P.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/P.d.vue.ts",
    "pascalName": "ProsePDVue",
    "kebabName": "prose-p-d-vue",
    "chunkName": "components/prose-p-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProsePSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProsePSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "1f6Rckdq-U-lDCrTn0Ar1YR8rIlRtRyfMN7dnHWJ9WQ"
    }
  },
  "ProseP": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/P.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/P.vue",
    "pascalName": "ProseP",
    "kebabName": "prose-p",
    "chunkName": "components/prose-p",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProsePreDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Pre.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Pre.d.vue.ts",
    "pascalName": "ProsePreDVue",
    "kebabName": "prose-pre-d-vue",
    "chunkName": "components/prose-pre-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "icon",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | object",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "code",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "language",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "filename",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "highlights",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "number[]",
          "schema": {
            "kind": "array",
            "type": "number[]",
            "schema": {
              "0": "number"
            }
          }
        },
        {
          "name": "meta",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; header?: ClassNameValue; filename?: ClassNameValue; icon?: ClassNameValue; copy?: ClassNameValue; base?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; header?: ClassNameValue; filename?: ClassNameValue; icon?: ClassNameValue; copy?: ClassNameValue; base?: ClassNameValue; }"
        },
        {
          "name": "hideHeader",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "boolean",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProsePreSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProsePreSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "icon",
          "type": "string | object",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | object",
            "schema": {
              "0": "string",
              "1": "object"
            }
          }
        },
        {
          "name": "code",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "language",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "filename",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "highlights",
          "type": "number[]",
          "description": "",
          "schema": {
            "kind": "array",
            "type": "number[]",
            "schema": {
              "0": "number"
            }
          }
        },
        {
          "name": "hideHeader",
          "type": "boolean",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "boolean",
            "schema": {
              "0": "false",
              "1": "true"
            }
          }
        },
        {
          "name": "meta",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; header?: ClassNameValue; filename?: ClassNameValue; icon?: ClassNameValue; copy?: ClassNameValue; base?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; header?: ClassNameValue; filename?: ClassNameValue; icon?: ClassNameValue; copy?: ClassNameValue; base?: ClassNameValue; }"
        }
      ],
      "hash": "MRW_mZm9Mk-AzY3OXO4w4x5eGy28VqN_W9R6Lk4xZ5I"
    }
  },
  "ProsePre": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Pre.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Pre.vue",
    "pascalName": "ProsePre",
    "kebabName": "prose-pre",
    "chunkName": "components/prose-pre",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseScriptDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Script.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Script.d.vue.ts",
    "pascalName": "ProseScriptDVue",
    "kebabName": "prose-script-d-vue",
    "chunkName": "components/prose-script-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "src",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "src",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "P5a1W22-fzQL0JnsptjsM6xO3R0fJPAQ7vn8EKc7kQc"
    }
  },
  "ProseScript": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Script.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Script.vue",
    "pascalName": "ProseScript",
    "kebabName": "prose-script",
    "chunkName": "components/prose-script",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseStepsDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Steps.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Steps.d.vue.ts",
    "pascalName": "ProseStepsDVue",
    "kebabName": "prose-steps-d-vue",
    "chunkName": "components/prose-steps-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "level",
          "global": false,
          "description": "The heading level to apply to the steps.",
          "tags": [
            {
              "name": "defaultValue",
              "text": "'3'"
            }
          ],
          "required": false,
          "type": "\"3\" | \"2\" | \"4\"",
          "schema": {
            "kind": "enum",
            "type": "\"3\" | \"2\" | \"4\"",
            "schema": {
              "0": "\"3\"",
              "1": "\"2\"",
              "2": "\"4\""
            }
          }
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseStepsSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseStepsSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "level",
          "type": "\"3\" | \"2\" | \"4\"",
          "description": "The heading level to apply to the steps.",
          "schema": {
            "kind": "enum",
            "type": "\"3\" | \"2\" | \"4\"",
            "schema": {
              "0": "\"3\"",
              "1": "\"2\"",
              "2": "\"4\""
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "6v4iinarPIfctfKza12EUImb8PyQbA72xor8SA4VkPw"
    }
  },
  "ProseSteps": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Steps.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Steps.vue",
    "pascalName": "ProseSteps",
    "kebabName": "prose-steps",
    "chunkName": "components/prose-steps",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseStrongDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Strong.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Strong.d.vue.ts",
    "pascalName": "ProseStrongDVue",
    "kebabName": "prose-strong-d-vue",
    "chunkName": "components/prose-strong-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseStrongSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseStrongSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "bPg92ceXmXrYI7iT-Q-ve1Zzk7CtKDQzhtoFyjzmvjk"
    }
  },
  "ProseStrong": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Strong.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Strong.vue",
    "pascalName": "ProseStrong",
    "kebabName": "prose-strong",
    "chunkName": "components/prose-strong",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseTableDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Table.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Table.d.vue.ts",
    "pascalName": "ProseTableDVue",
    "kebabName": "prose-table-d-vue",
    "chunkName": "components/prose-table-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; base?: ClassNameValue; }",
          "schema": "{ root?: ClassNameValue; base?: ClassNameValue; }"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTableSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTableSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; base?: ClassNameValue; }",
          "description": "",
          "schema": "{ root?: ClassNameValue; base?: ClassNameValue; }"
        }
      ],
      "hash": "08ywO_8POq_x2PBQwNhJPH_H71vlmt50tHMRSFuz7zY"
    }
  },
  "ProseTable": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Table.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Table.vue",
    "pascalName": "ProseTable",
    "kebabName": "prose-table",
    "chunkName": "components/prose-table",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseTabsDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tabs.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tabs.d.vue.ts",
    "pascalName": "ProseTabsDVue",
    "kebabName": "prose-tabs-d-vue",
    "chunkName": "components/prose-tabs-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "defaultValue",
          "global": false,
          "description": "The default tab to select.",
          "tags": [
            {
              "name": "example",
              "text": "'1'"
            }
          ],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "sync",
          "global": false,
          "description": "Sync the selected tab with a local storage key.",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "hash",
          "global": false,
          "description": "The hash to scroll to when the tab is selected.",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "ui",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "{ root?: ClassNameValue; } & { root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; leadingIcon?: ClassNameValue; leadingAvatar?: ClassNameValue; leadingAvatarSize?: ClassNameValue; label?: ClassNameValue; trailingBadge?: ClassNameValue; trailingBadgeSize?: ClassNameValue; content?: ClassNameValue; }",
          "schema": {
            "kind": "object",
            "type": "{ root?: ClassNameValue; } & { root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; leadingIcon?: ClassNameValue; leadingAvatar?: ClassNameValue; leadingAvatarSize?: ClassNameValue; label?: ClassNameValue; trailingBadge?: ClassNameValue; trailingBadgeSize?: ClassNameValue; content?: ClassNameValue; }",
            "schema": {
              "root": {
                "name": "root",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": {
                  "kind": "enum",
                  "type": "ClassNameValue",
                  "schema": {
                    "0": "string",
                    "1": "false",
                    "2": "0",
                    "3": "0n",
                    "4": {
                      "kind": "array",
                      "type": "ClassNameArray",
                      "schema": [
                        "ClassNameValue"
                      ]
                    }
                  }
                }
              },
              "list": {
                "name": "list",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "indicator": {
                "name": "indicator",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "trigger": {
                "name": "trigger",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "leadingIcon": {
                "name": "leadingIcon",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "leadingAvatar": {
                "name": "leadingAvatar",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "leadingAvatarSize": {
                "name": "leadingAvatarSize",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "label": {
                "name": "label",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "trailingBadge": {
                "name": "trailingBadge",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "trailingBadgeSize": {
                "name": "trailingBadgeSize",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "content": {
                "name": "content",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              }
            }
          }
        },
        {
          "name": "modelValue",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [
        {
          "name": "update:modelValue",
          "description": "",
          "tags": [],
          "type": "[value: string]",
          "signature": "(event: \"update:modelValue\", value: string): void",
          "schema": [
            "string"
          ]
        }
      ],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTabsSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTabsSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "defaultValue",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "sync",
          "type": "string",
          "description": "Sync the selected tab with a local storage key.",
          "schema": "string"
        },
        {
          "name": "hash",
          "type": "string",
          "description": "The hash to scroll to when the tab is selected.",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        },
        {
          "name": "ui",
          "type": "{ root?: ClassNameValue; } & { root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; leadingIcon?: ClassNameValue; leadingAvatar?: ClassNameValue; leadingAvatarSize?: ClassNameValue; label?: ClassNameValue; trailingBadge?: ClassNameValue; trailingBadgeSize?: ClassNameValue; content?: ClassNameValue; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ root?: ClassNameValue; } & { root?: ClassNameValue; list?: ClassNameValue; indicator?: ClassNameValue; trigger?: ClassNameValue; leadingIcon?: ClassNameValue; leadingAvatar?: ClassNameValue; leadingAvatarSize?: ClassNameValue; label?: ClassNameValue; trailingBadge?: ClassNameValue; trailingBadgeSize?: ClassNameValue; content?: ClassNameValue; }",
            "schema": {
              "root": {
                "name": "root",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": {
                  "kind": "enum",
                  "type": "ClassNameValue",
                  "schema": {
                    "0": "string",
                    "1": "false",
                    "2": "0",
                    "3": "0n",
                    "4": {
                      "kind": "array",
                      "type": "ClassNameArray",
                      "schema": [
                        "ClassNameValue"
                      ]
                    }
                  }
                }
              },
              "list": {
                "name": "list",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "indicator": {
                "name": "indicator",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "trigger": {
                "name": "trigger",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "leadingIcon": {
                "name": "leadingIcon",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "leadingAvatar": {
                "name": "leadingAvatar",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "leadingAvatarSize": {
                "name": "leadingAvatarSize",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "label": {
                "name": "label",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "trailingBadge": {
                "name": "trailingBadge",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "trailingBadgeSize": {
                "name": "trailingBadgeSize",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              },
              "content": {
                "name": "content",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "ClassNameValue",
                "schema": "ClassNameValue"
              }
            }
          }
        },
        {
          "name": "modelValue",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "onUpdate:modelValue",
          "type": "(value: string) => any",
          "description": "",
          "schema": {
            "kind": "event",
            "type": "(value: string): any",
            "schema": {}
          }
        }
      ],
      "hash": "Wu4ofhHF5UUOJGs_MvEm7yASlRCCFVzbIYWbY-HgW90"
    }
  },
  "ProseTabs": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tabs.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tabs.vue",
    "pascalName": "ProseTabs",
    "kebabName": "prose-tabs",
    "chunkName": "components/prose-tabs",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseTabsItemDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/TabsItem.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/TabsItem.d.vue.ts",
    "pascalName": "ProseTabsItemDVue",
    "kebabName": "prose-tabs-item-d-vue",
    "chunkName": "components/prose-tabs-item-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "label",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "description",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTabsItemSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTabsItemSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "label",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "description",
          "type": "string",
          "description": "",
          "schema": "string"
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "kHQBCxObaryWAeoHkoMrZw1WPQwwPltu9DZBsn-s1D8"
    }
  },
  "ProseTabsItem": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/TabsItem.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/TabsItem.vue",
    "pascalName": "ProseTabsItem",
    "kebabName": "prose-tabs-item",
    "chunkName": "components/prose-tabs-item",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseTbodyDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tbody.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tbody.d.vue.ts",
    "pascalName": "ProseTbodyDVue",
    "kebabName": "prose-tbody-d-vue",
    "chunkName": "components/prose-tbody-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTbodySlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTbodySlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "8D6pQZlqXXdrG8Rt6L6rqooBPYKMQY5fdg9zrGPU6sY"
    }
  },
  "ProseTbody": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tbody.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tbody.vue",
    "pascalName": "ProseTbody",
    "kebabName": "prose-tbody",
    "chunkName": "components/prose-tbody",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseTdDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Td.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Td.d.vue.ts",
    "pascalName": "ProseTdDVue",
    "kebabName": "prose-td-d-vue",
    "chunkName": "components/prose-td-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTdSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTdSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "Y8YMbBohiV_nyYxh8J7N_7LiZxXu0_vQx3NvU8vC5Ro"
    }
  },
  "ProseTd": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Td.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Td.vue",
    "pascalName": "ProseTd",
    "kebabName": "prose-td",
    "chunkName": "components/prose-td",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseThDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Th.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Th.d.vue.ts",
    "pascalName": "ProseThDVue",
    "kebabName": "prose-th-d-vue",
    "chunkName": "components/prose-th-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseThSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseThSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "IBz4FUIUAcaDkdXisS8dWeEM9wT7Dg-ytFg4o75l4Do"
    }
  },
  "ProseTh": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Th.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Th.vue",
    "pascalName": "ProseTh",
    "kebabName": "prose-th",
    "chunkName": "components/prose-th",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseTheadDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Thead.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Thead.d.vue.ts",
    "pascalName": "ProseTheadDVue",
    "kebabName": "prose-thead-d-vue",
    "chunkName": "components/prose-thead-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTheadSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTheadSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "v8rWeRicqgjEnKpBchTslwkdIMsIuxQmK5kkg_NTqp4"
    }
  },
  "ProseThead": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Thead.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Thead.vue",
    "pascalName": "ProseThead",
    "kebabName": "prose-thead",
    "chunkName": "components/prose-thead",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseTrDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tr.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tr.d.vue.ts",
    "pascalName": "ProseTrDVue",
    "kebabName": "prose-tr-d-vue",
    "chunkName": "components/prose-tr-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseTrSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseTrSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "4jvernFXCCoEAjO6jahzU6aNJmARzLmALWstEgi1a6Y"
    }
  },
  "ProseTr": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tr.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Tr.vue",
    "pascalName": "ProseTr",
    "kebabName": "prose-tr",
    "chunkName": "components/prose-tr",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseUlDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Ul.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Ul.d.vue.ts",
    "pascalName": "ProseUlDVue",
    "kebabName": "prose-ul-d-vue",
    "chunkName": "components/prose-ul-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & ProseUlSlots",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & ProseUlSlots",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "(props?: {}) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props?: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "class",
          "type": "any",
          "description": "",
          "schema": "any"
        }
      ],
      "hash": "GUI72QUymDUw2fH5U917wbL-KMBwLK_MOd2sinrq0Qo"
    }
  },
  "ProseUl": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Ul.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/Ul.vue",
    "pascalName": "ProseUl",
    "kebabName": "prose-ul",
    "chunkName": "components/prose-ul",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseCautionDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Caution.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Caution.d.vue.ts",
    "pascalName": "ProseCautionDVue",
    "kebabName": "prose-caution-d-vue",
    "chunkName": "components/prose-caution-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{ mdcUnwrap: string; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ mdcUnwrap: string; }",
            "schema": {
              "mdcUnwrap": {
                "name": "mdcUnwrap",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "string",
                "schema": "string"
              }
            }
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "(props: { mdcUnwrap: string; }) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props: { mdcUnwrap: string; }): any",
                  "schema": {}
                }
              }
            }
          }
        }
      ],
      "hash": "l9_4za4CroH3LkkS8qYb-ZIOesbEfWuIV8vW5khOCH8"
    }
  },
  "ProseCaution": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Caution.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Caution.vue",
    "pascalName": "ProseCaution",
    "kebabName": "prose-caution",
    "chunkName": "components/prose-caution",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseNoteDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Note.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Note.d.vue.ts",
    "pascalName": "ProseNoteDVue",
    "kebabName": "prose-note-d-vue",
    "chunkName": "components/prose-note-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{ mdcUnwrap: string; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ mdcUnwrap: string; }",
            "schema": {
              "mdcUnwrap": {
                "name": "mdcUnwrap",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "string",
                "schema": "string"
              }
            }
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "(props: { mdcUnwrap: string; }) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props: { mdcUnwrap: string; }): any",
                  "schema": {}
                }
              }
            }
          }
        }
      ],
      "hash": "l9_4za4CroH3LkkS8qYb-ZIOesbEfWuIV8vW5khOCH8"
    }
  },
  "ProseNote": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Note.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Note.vue",
    "pascalName": "ProseNote",
    "kebabName": "prose-note",
    "chunkName": "components/prose-note",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseTipDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Tip.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Tip.d.vue.ts",
    "pascalName": "ProseTipDVue",
    "kebabName": "prose-tip-d-vue",
    "chunkName": "components/prose-tip-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{ mdcUnwrap: string; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ mdcUnwrap: string; }",
            "schema": {
              "mdcUnwrap": {
                "name": "mdcUnwrap",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "string",
                "schema": "string"
              }
            }
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "(props: { mdcUnwrap: string; }) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props: { mdcUnwrap: string; }): any",
                  "schema": {}
                }
              }
            }
          }
        }
      ],
      "hash": "l9_4za4CroH3LkkS8qYb-ZIOesbEfWuIV8vW5khOCH8"
    }
  },
  "ProseTip": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Tip.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Tip.vue",
    "pascalName": "ProseTip",
    "kebabName": "prose-tip",
    "chunkName": "components/prose-tip",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseWarningDVue": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Warning.d.vue.ts",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Warning.d.vue.ts",
    "pascalName": "ProseWarningDVue",
    "kebabName": "prose-warning-d-vue",
    "chunkName": "components/prose-warning-d-vue",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [],
      "slots": [
        {
          "name": "default",
          "type": "{ mdcUnwrap: string; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{ mdcUnwrap: string; }",
            "schema": {
              "mdcUnwrap": {
                "name": "mdcUnwrap",
                "global": false,
                "description": "",
                "tags": [],
                "required": true,
                "type": "string",
                "schema": "string"
              }
            }
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: { mdcUnwrap: string; }) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "(props: { mdcUnwrap: string; }) => any",
                "schema": {
                  "kind": "event",
                  "type": "(props: { mdcUnwrap: string; }): any",
                  "schema": {}
                }
              }
            }
          }
        }
      ],
      "hash": "l9_4za4CroH3LkkS8qYb-ZIOesbEfWuIV8vW5khOCH8"
    }
  },
  "ProseWarning": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Warning.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxt+ui@4.1.0_@babel+parser@7.28.5_change-case@5.4.4_db0@0.3.4_better-sqlite3@12.4.1___741817fbfa401c0faf6afb1db3ee912c/node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Warning.vue",
    "pascalName": "ProseWarning",
    "kebabName": "prose-warning",
    "chunkName": "components/prose-warning",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 0,
      "props": [],
      "slots": [],
      "events": [],
      "exposed": []
    }
  },
  "ProseH5": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxtjs+mdc@0.18.2_magicast@0.5.1/node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseH5.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxtjs+mdc@0.18.2_magicast@0.5.1/node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseH5.vue",
    "pascalName": "ProseH5",
    "kebabName": "prose-h5",
    "chunkName": "components/prose-h5",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: {}) => any; } & { default?: (props: {}) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: {}) => any; } & { default?: (props: {}) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "((props: {}) => any) & ((props: {}) => any)",
                "schema": {
                  "kind": "event",
                  "type": "(props: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "iRxs4pEciGvJzd4WkA20UhuuDVHZJVftjuzBoRTMfbM"
    }
  },
  "ProseH6": {
    "mode": "all",
    "global": true,
    "prefetch": false,
    "preload": false,
    "filePath": "node_modules/.pnpm/@nuxtjs+mdc@0.18.2_magicast@0.5.1/node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseH6.vue",
    "declarationPath": "/Users/fabian/Documents/dev/araiza/node_modules/.pnpm/@nuxtjs+mdc@0.18.2_magicast@0.5.1/node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseH6.vue",
    "pascalName": "ProseH6",
    "kebabName": "prose-h6",
    "chunkName": "components/prose-h6",
    "priority": 0,
    "_scanned": true,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "id",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string",
          "schema": "string"
        }
      ],
      "slots": [
        {
          "name": "default",
          "type": "{}",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "{}",
            "schema": {}
          }
        }
      ],
      "events": [],
      "exposed": [
        {
          "name": "$slots",
          "type": "Readonly<InternalSlots> & { default?: (props: {}) => any; } & { default?: (props: {}) => any; }",
          "description": "",
          "schema": {
            "kind": "object",
            "type": "Readonly<InternalSlots> & { default?: (props: {}) => any; } & { default?: (props: {}) => any; }",
            "schema": {
              "default": {
                "name": "default",
                "global": false,
                "description": "",
                "tags": [],
                "required": false,
                "type": "((props: {}) => any) & ((props: {}) => any)",
                "schema": {
                  "kind": "event",
                  "type": "(props: {}): any",
                  "schema": {}
                }
              }
            }
          }
        },
        {
          "name": "id",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "UYPoc9YVQVrJixA-svRNNoliHYWg7_x9VXE_HKoMlG8"
    }
  },
  "Icon": {
    "chunkName": "components/icon",
    "global": true,
    "kebabName": "icon",
    "pascalName": "Icon",
    "prefetch": false,
    "preload": false,
    "mode": "all",
    "priority": 0,
    "meta": {
      "type": 1,
      "props": [
        {
          "name": "name",
          "global": false,
          "description": "",
          "tags": [],
          "required": true,
          "type": "string",
          "schema": "string"
        },
        {
          "name": "customize",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "boolean | IconifyIconCustomizeCallback",
          "schema": {
            "kind": "enum",
            "type": "boolean | IconifyIconCustomizeCallback",
            "schema": {
              "0": "false",
              "1": "true",
              "2": {
                "kind": "event",
                "type": "(content: string, name?: string, prefix?: string, provider?: string): string",
                "schema": []
              }
            }
          },
          "default": "null"
        },
        {
          "name": "size",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "string | number",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          },
          "default": "null"
        },
        {
          "name": "mode",
          "global": false,
          "description": "",
          "tags": [],
          "required": false,
          "type": "\"svg\" | \"css\"",
          "schema": {
            "kind": "enum",
            "type": "\"svg\" | \"css\"",
            "schema": {
              "0": "\"svg\"",
              "1": "\"css\""
            }
          },
          "default": "null"
        }
      ],
      "slots": [],
      "events": [],
      "exposed": [
        {
          "name": "customize",
          "type": "boolean | IconifyIconCustomizeCallback",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "boolean | IconifyIconCustomizeCallback",
            "schema": {
              "0": "false",
              "1": "true",
              "2": {
                "kind": "event",
                "type": "(content: string, name?: string, prefix?: string, provider?: string): string",
                "schema": []
              }
            }
          }
        },
        {
          "name": "size",
          "type": "string | number",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "string | number",
            "schema": {
              "0": "string",
              "1": "number"
            }
          }
        },
        {
          "name": "mode",
          "type": "\"svg\" | \"css\"",
          "description": "",
          "schema": {
            "kind": "enum",
            "type": "\"svg\" | \"css\"",
            "schema": {
              "0": "\"svg\"",
              "1": "\"css\""
            }
          }
        },
        {
          "name": "name",
          "type": "string",
          "description": "",
          "schema": "string"
        }
      ],
      "hash": "aFktfg79RoxhUJUbTqae26vK6eRtWxXTPNQOUXaL02A"
    },
    "name": "Icon",
    "filePath": "node_modules/.pnpm/@nuxt+icon@2.1.0_magicast@0.5.1_vite@7.2.1_jiti@2.6.1_lightningcss@1.30.2_terser@5.44.0_a37344c2e3c94e5c3a721a447d02e0e7/node_modules/@nuxt/icon/dist/runtime/components/index.js"
  }
};

const highlight = {"theme":{"light":"material-theme-lighter","default":"material-theme","dark":"material-theme-palenight"}};

const _ZN3YfQ = eventHandler(async (event) => {
  {
    const session = await useSession(event, {
      name: "studio-session",
      password: useRuntimeConfig(event).studio?.auth?.sessionSecret
    });
    if (!session?.data?.user) {
      throw createError$1({
        statusCode: 404,
        message: "Not found"
      });
    }
  }
  const mappedComponents = Object.values(components).map(({ pascalName, filePath, meta }) => {
    return {
      name: pascalName,
      path: filePath,
      meta: {
        props: meta.props,
        slots: meta.slots,
        events: meta.events
      }
    };
  });
  return {
    highlightTheme: highlight?.theme || { default: "github-light", dark: "github-dark", light: "github-light" },
    components: mappedComponents
  };
});

const n=()=>"\nconst DB_NAME = 'studio-media'\nconst STORE_NAME = 'drafts'\n\nconst DraftStatus = {\n  Deleted: 'deleted',\n  Created: 'created',\n  Updated: 'updated',\n  Pristine: 'pristine'\n}\n\nconst IMAGE_EXTENSIONS = [\n  'png',\n  'jpg',\n  'jpeg',\n  'svg',\n  'webp',\n  'ico',\n  'gif',\n]\n\nfunction extractImagePath(url) {\n  const pathname = url.pathname;\n  if (pathname.startsWith('/_ipx/_/')) {\n    return pathname.replace('/_ipx/_', '')\n  }\n\n  if (pathname.startsWith('/_vercel/image')) {\n    return url.searchParams.get('url') || null\n  }\n\n  if (IMAGE_EXTENSIONS.includes(pathname.split('.').pop())) {\n    return pathname\n  }\n\n  return null\n}\n\nself.addEventListener('install', event => {\n  self.skipWaiting()\n})\n\nself.addEventListener('activate', event => {\n  event.waitUntil(self.clients.claim())\n})\n\nself.addEventListener('fetch', event => {\n  const url = new URL(event.request.url);\n  const isSameDomain = url.origin === self.location.origin;\n\n  if (!isSameDomain) {\n    return\n  }\n\n  const imageUrl = extractImagePath(url);\n  if (imageUrl) {\n    return event.respondWith(fetchFromIndexedDB(event, imageUrl));\n  }\n})\n\nfunction fetchFromIndexedDB(event, url) {\n  const dbKey = url.replace(/^\\//g, '').replace(/\\//g, ':')\n  return getData(dbKey).then(data => {\n    if (!data) {\n      return fetch(event.request);\n    }\n\n    const dbItem = JSON.parse(data)\n\n    console.log('Data found in IndexedDB:', dbItem);\n\n    // Deleted file\n    if (dbItem.status === DraftStatus.Deleted) {\n      return fetch('https://placehold.co/1200x800?text=Deleted');\n    }\n\n    // Renamed file\n    if (dbItem.original?.path) {\n      return fetch(dbItem.original.path);\n    }\n\n    // Created file\n    const parsed = parseDataUrl(dbItem.modified.raw);\n    const bytes = base64ToUint8Array(parsed.base64);\n\n    return new Response(bytes, {\n      headers: { 'Content-Type': parsed.mime }\n    });\n  })\n}\n\nfunction parseDataUrl(dataUrl) {\n  // Example: data:image/png;base64,iVBORw0KG...\n  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);\n  if (!match) return null;\n  return {\n    mime: match[1],\n    base64: match[2]\n  };\n}\n\nfunction base64ToUint8Array(base64) {\n  const binary = atob(base64);\n  const len = binary.length;\n  const bytes = new Uint8Array(len);\n  for (let i = 0; i < len; i++) {\n    bytes[i] = binary.charCodeAt(i);\n  }\n  return bytes;\n}\n\n// IndexedDB\nfunction openDB() {\n  return new Promise((resolve, reject) => {\n    const request = indexedDB.open(DB_NAME, 1);\n    request.onupgradeneeded = event => {\n      const db = event.target.result;\n      db.createObjectStore(STORE_NAME, { keyPath: 'id' });\n    };\n    request.onsuccess = event => resolve(event.target.result);\n    request.onerror = event => reject(event.target.error);\n  });\n}\n\n// Read data from the object store\nfunction getData(key) {\n  return openDB().then(db => {\n    return new Promise((resolve, reject) => {\n      const tx = db.transaction('drafts', 'readonly');\n      const store = tx.objectStore('drafts');\n      const request = store.get(key);\n      request.onsuccess = () => resolve(request.result);\n      request.onerror = () => reject(request.error);\n    });\n  });\n}\n";

const _nccINw = eventHandler(async (event) => {
  setHeader(event, "Content-Type", "application/javascript");
  return n();
});

const _KEni72 = defineEventHandler((event) => {
  appendHeader(event, "Access-Control-Allow-Origin", "*");
  const componentName = (event.context.params?.["component?"] || "").replace(/\.json$/, "");
  if (componentName) {
    const meta = components[pascalCase(componentName)];
    if (!meta) {
      throw createError$1({
        statusMessage: "Components not found!",
        statusCode: 404,
        data: {
          description: "Please make sure you are looking for correct component"
        }
      });
    }
    return meta;
  }
  return components;
});

const _RvI4E9 = eventHandler(async (event) => {
  const collection = getRouterParam(event, "collection");
  setHeader(event, "Content-Type", "text/plain");
  const data = await useStorage().getItem(`build:content:database.compressed.mjs`) || "";
  if (data) {
    const lineStart = `export const ${collection} = "`;
    const content = String(data).split("\n").find((line) => line.startsWith(lineStart));
    if (content) {
      return content.substring(lineStart.length, content.length - 1);
    }
  }
  return await import('../build/database.compressed.mjs').then((m) => m[collection]);
});

async function decompressSQLDump(base64Str, compressionType = "gzip") {
  let binaryData;
  if (typeof Buffer !== "undefined") {
    const buffer = Buffer.from(base64Str, "base64");
    binaryData = Uint8Array.from(buffer);
  } else if (typeof atob !== "undefined") {
    binaryData = Uint8Array.from(atob(base64Str), (c) => c.charCodeAt(0));
  } else {
    throw new TypeError("No base64 decoding method available");
  }
  const response = new Response(new Blob([binaryData]));
  const decompressedStream = response.body?.pipeThrough(new DecompressionStream(compressionType));
  const text = await new Response(decompressedStream).text();
  return JSON.parse(text);
}

function refineContentFields(sql, doc) {
  const fields = findCollectionFields(sql);
  const item = { ...doc };
  for (const key in item) {
    if (fields[key] === "json" && item[key] && item[key] !== "undefined") {
      item[key] = JSON.parse(item[key]);
    }
    if (fields[key] === "boolean" && item[key] !== "undefined") {
      item[key] = Boolean(item[key]);
    }
  }
  for (const key in item) {
    if (item[key] === "NULL") {
      item[key] = void 0;
    }
  }
  return item;
}
function findCollectionFields(sql) {
  const table = sql.match(/FROM\s+(\w+)/);
  if (!table) {
    return {};
  }
  const info = contentManifest[getCollectionName(table[1])];
  return info?.fields || {};
}
function getCollectionName(table) {
  return table.replace(/^_content_/, "");
}

class BoundableStatement {
	_statement;
	constructor(rawStmt) {
		this._statement = rawStmt;
	}
	bind(...params) {
		return new BoundStatement(this, params);
	}
}
class BoundStatement {
	#statement;
	#params;
	constructor(statement, params) {
		this.#statement = statement;
		this.#params = params;
	}
	bind(...params) {
		return new BoundStatement(this.#statement, params);
	}
	all() {
		return this.#statement.all(...this.#params);
	}
	run() {
		return this.#statement.run(...this.#params);
	}
	get() {
		return this.#statement.get(...this.#params);
	}
}

function sqliteConnector(opts) {
	let _db;
	const getDB = () => {
		if (_db) {
			return _db;
		}
		if (opts.name === ":memory:") {
			_db = new Database(":memory:");
			return _db;
		}
		const filePath = resolve$1(opts.cwd || ".", opts.path || `.data/${opts.name || "db"}.sqlite3`);
		mkdirSync(dirname$1(filePath), { recursive: true });
		_db = new Database(filePath);
		return _db;
	};
	return {
		name: "sqlite",
		dialect: "sqlite",
		getInstance: () => getDB(),
		exec: (sql) => getDB().exec(sql),
		prepare: (sql) => new StatementWrapper(() => getDB().prepare(sql)),
		dispose: () => {
			_db?.close?.();
			_db = undefined;
		}
	};
}
class StatementWrapper extends BoundableStatement {
	async all(...params) {
		return this._statement().all(...params);
	}
	async run(...params) {
		const res = this._statement().run(...params);
		return {
			success: res.changes > 0,
			...res
		};
	}
	async get(...params) {
		return this._statement().get(...params);
	}
}

let db;
function loadDatabaseAdapter(config) {
  const { database, localDatabase } = config;
  if (!db) {
    if (["nitro-prerender", "nitro-dev"].includes("node-server")) {
      db = sqliteConnector(refineDatabaseConfig(localDatabase));
    } else {
      db = sqliteConnector(refineDatabaseConfig(database));
    }
  }
  return {
    all: async (sql, params = []) => {
      return db.prepare(sql).all(...params).then((result) => (result || []).map((item) => refineContentFields(sql, item)));
    },
    first: async (sql, params = []) => {
      return db.prepare(sql).get(...params).then((item) => item ? refineContentFields(sql, item) : item);
    },
    exec: async (sql, params = []) => {
      return db.prepare(sql).run(...params);
    }
  };
}
const checkDatabaseIntegrity = {};
const integrityCheckPromise = {};
async function checkAndImportDatabaseIntegrity(event, collection, config) {
  if (checkDatabaseIntegrity[String(collection)] !== false) {
    checkDatabaseIntegrity[String(collection)] = false;
    integrityCheckPromise[String(collection)] = integrityCheckPromise[String(collection)] || _checkAndImportDatabaseIntegrity(event, collection, checksums[String(collection)], checksumsStructure[String(collection)], config).then((isValid) => {
      checkDatabaseIntegrity[String(collection)] = !isValid;
    }).catch((error) => {
      console.error("Database integrity check failed", error);
      checkDatabaseIntegrity[String(collection)] = true;
      integrityCheckPromise[String(collection)] = null;
    });
  }
  if (integrityCheckPromise[String(collection)]) {
    await integrityCheckPromise[String(collection)];
  }
}
async function _checkAndImportDatabaseIntegrity(event, collection, integrityVersion, structureIntegrityVersion, config) {
  const db2 = loadDatabaseAdapter(config);
  const before = await db2.first(`SELECT * FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => null);
  if (before?.version && !String(before.version)?.startsWith(`${config.databaseVersion}--`)) {
    await db2.exec(`DROP TABLE IF EXISTS ${tables.info}`);
    before.version = "";
  }
  const unchangedStructure = before?.structureVersion === structureIntegrityVersion;
  if (before?.version) {
    if (before.version === integrityVersion) {
      if (before.ready) {
        return true;
      }
      await waitUntilDatabaseIsReady(db2, collection);
      return true;
    }
    await db2.exec(`DELETE FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]);
    if (!unchangedStructure) {
      await db2.exec(`DROP TABLE IF EXISTS ${tables[collection]}`);
    }
  }
  const dump = await loadDatabaseDump(event, collection).then(decompressSQLDump);
  const dumpLinesHash = dump.map((row) => row.split(" -- ").pop());
  let hashesInDb = /* @__PURE__ */ new Set();
  if (unchangedStructure) {
    const hashListFromTheDump = new Set(dumpLinesHash);
    const hashesInDbRecords = await db2.all(`SELECT __hash__ FROM ${tables[collection]}`).catch(() => []);
    hashesInDb = new Set(hashesInDbRecords.map((r) => r.__hash__));
    const hashesToDelete = hashesInDb.difference(hashListFromTheDump);
    if (hashesToDelete.size) {
      await db2.exec(`DELETE FROM ${tables[collection]} WHERE __hash__ IN (${Array(hashesToDelete.size).fill("?").join(",")})`, Array.from(hashesToDelete));
    }
  }
  await dump.reduce(async (prev, sql, index) => {
    await prev;
    const hash = dumpLinesHash[index];
    const statement = sql.substring(0, sql.length - hash.length - 4);
    if (unchangedStructure) {
      if (hash === "structure") {
        return Promise.resolve();
      }
      if (hashesInDb.has(hash)) {
        return Promise.resolve();
      }
    }
    await db2.exec(statement).catch((err) => {
      const message = err.message || "Unknown error";
      console.error(`Failed to execute SQL ${sql}: ${message}`);
    });
  }, Promise.resolve());
  const after = await db2.first(`SELECT version FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ version: "" }));
  return after?.version === integrityVersion;
}
const REQUEST_TIMEOUT = 90;
async function waitUntilDatabaseIsReady(db2, collection) {
  let iterationCount = 0;
  let interval;
  await new Promise((resolve, reject) => {
    interval = setInterval(async () => {
      const row = await db2.first(`SELECT ready FROM ${tables.info} WHERE id = ?`, [`checksum_${collection}`]).catch(() => ({ ready: true }));
      if (row?.ready) {
        clearInterval(interval);
        resolve(0);
      }
      if (iterationCount++ > REQUEST_TIMEOUT) {
        clearInterval(interval);
        reject(new Error("Waiting for another database initialization timed out"));
      }
    }, 1e3);
  }).catch((e) => {
    throw e;
  }).finally(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
}
async function loadDatabaseDump(event, collection) {
  return await fetchDatabase(event, String(collection)).catch((e) => {
    console.error("Failed to fetch compressed dump", e);
    return "";
  });
}
function refineDatabaseConfig(config) {
  if (config.type === "d1") {
    return { ...config, bindingName: config.bindingName || config.binding };
  }
  if (config.type === "sqlite") {
    const _config = { ...config };
    if (config.filename === ":memory:") {
      return { name: "memory" };
    }
    if ("filename" in config) {
      const filename = isAbsolute(config?.filename || "") || config?.filename === ":memory:" ? config?.filename : new URL(config.filename, globalThis._importMeta_.url).pathname;
      _config.path = process.platform === "win32" && filename.startsWith("/") ? filename.slice(1) : filename;
    }
    return _config;
  }
  if (config.type === "pglite") {
    return {
      dataDir: config.dataDir,
      // Pass through any other PGlite-specific options
      ...config
    };
  }
  return config;
}

const SQL_COMMANDS = /SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|\$/i;
const SQL_COUNT_REGEX = /COUNT\((DISTINCT )?([a-z_]\w+|\*)\)/i;
const SQL_SELECT_REGEX = /^SELECT (.*) FROM (\w+)( WHERE .*)? ORDER BY (["\w,\s]+) (ASC|DESC)( LIMIT \d+)?( OFFSET \d+)?$/;
function assertSafeQuery(sql, collection) {
  if (!sql) {
    throw new Error("Invalid query");
  }
  const cleanedupQuery = cleanupQuery(sql);
  if (cleanedupQuery !== sql) {
    throw new Error("Invalid query");
  }
  const match = sql.match(SQL_SELECT_REGEX);
  if (!match) {
    throw new Error("Invalid query");
  }
  const [_, select, from, where, orderBy, order, limit, offset] = match;
  const columns = select?.trim().split(", ") || [];
  if (columns.length === 1) {
    if (columns[0] !== "*" && !columns[0]?.match(SQL_COUNT_REGEX) && !columns[0]?.match(/^"[a-z_]\w+"$/i)) {
      throw new Error("Invalid query");
    }
  } else if (!columns.every((column) => column.match(/^"[a-z_]\w+"$/i))) {
    throw new Error("Invalid query");
  }
  if (from !== `_content_${collection}`) {
    throw new Error("Invalid query");
  }
  if (where) {
    if (!where.startsWith(" WHERE (") || !where.endsWith(")")) {
      throw new Error("Invalid query");
    }
    const noString = cleanupQuery(where, { removeString: true });
    if (noString.match(SQL_COMMANDS)) {
      throw new Error("Invalid query");
    }
  }
  const _order = (orderBy + " " + order).split(", ");
  if (!_order.every((column) => column.match(/^("[a-zA-Z_]+"|[a-zA-Z_]+) (ASC|DESC)$/))) {
    throw new Error("Invalid query");
  }
  if (limit !== void 0 && !limit.match(/^ LIMIT \d+$/)) {
    throw new Error("Invalid query");
  }
  if (offset !== void 0 && !offset.match(/^ OFFSET \d+$/)) {
    throw new Error("Invalid query");
  }
  return true;
}
function cleanupQuery(query, options = { removeString: false }) {
  let inString = false;
  let stringFence = "";
  let result = "";
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const prevChar = query[i - 1];
    const nextChar = query[i + 1];
    if (char === "'" || char === '"') {
      if (!options?.removeString) {
        result += char;
        continue;
      }
      if (inString) {
        if (char !== stringFence || nextChar === stringFence || prevChar === stringFence) {
          continue;
        }
        inString = false;
        stringFence = "";
        continue;
      } else {
        inString = true;
        stringFence = char;
        continue;
      }
    }
    if (!inString) {
      if (char === "-" && nextChar === "-") {
        return result;
      }
      if (char === "/" && nextChar === "*") {
        i += 2;
        while (i < query.length && !(query[i] === "*" && query[i + 1] === "/")) {
          i += 1;
        }
        i += 2;
        continue;
      }
      result += char;
    }
  }
  return result;
}

const _XsHh4_ = eventHandler(async (event) => {
  const { sql } = await readBody(event);
  const collection = getRouterParam(event, "collection");
  assertSafeQuery(sql, collection);
  const conf = useRuntimeConfig().content;
  if (conf.integrityCheck) {
    await checkAndImportDatabaseIntegrity(event, collection, conf);
  }
  return loadDatabaseAdapter(conf).all(sql);
});

const _qr0zWl = lazyEventHandler(() => {
  const opts = useRuntimeConfig().ipx || {};
  const fsDir = opts?.fs?.dir ? (Array.isArray(opts.fs.dir) ? opts.fs.dir : [opts.fs.dir]).map((dir) => isAbsolute(dir) ? dir : fileURLToPath(new URL(dir, globalThis._importMeta_.url))) : void 0;
  const fsStorage = opts.fs?.dir ? ipxFSStorage({ ...opts.fs, dir: fsDir }) : void 0;
  const httpStorage = opts.http?.domains ? ipxHttpStorage({ ...opts.http }) : void 0;
  if (!fsStorage && !httpStorage) {
    throw new Error("IPX storage is not configured!");
  }
  const ipxOptions = {
    ...opts,
    storage: fsStorage || httpStorage,
    httpStorage
  };
  const ipx = createIPX(ipxOptions);
  const ipxHandler = createIPXH3Handler(ipx);
  return useBase(opts.baseURL, ipxHandler);
});

const _lazy_sIsgK3 = () => import('../routes/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _DIj8yb, lazy: false, middleware: true, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_sIsgK3, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/api/_nuxt_icon/:collection', handler: _CDCfWe, lazy: false, middleware: false, method: undefined },
  { route: '/api/_mdc/highlight', handler: _JVHauc, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_studio/auth/github', handler: _0viF8R, lazy: false, middleware: false, method: "get" },
  { route: '/__nuxt_studio/auth/google', handler: _cyF74q, lazy: false, middleware: false, method: "get" },
  { route: '/__nuxt_studio/auth/gitlab', handler: _kGHfUp, lazy: false, middleware: false, method: "get" },
  { route: '/__nuxt_studio/auth/session', handler: _XdfxGk, lazy: false, middleware: false, method: "get" },
  { route: '/__nuxt_studio/auth/session', handler: _OeB82F, lazy: false, middleware: false, method: "delete" },
  { route: '/_studio', handler: _Kew6bR, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_studio/meta', handler: _ZN3YfQ, lazy: false, middleware: false, method: undefined },
  { route: '/sw.js', handler: _nccINw, lazy: false, middleware: false, method: undefined },
  { route: '/api/component-meta', handler: _KEni72, lazy: false, middleware: false, method: "get" },
  { route: '/api/component-meta.json', handler: _KEni72, lazy: false, middleware: false, method: "get" },
  { route: '/api/component-meta/:component?', handler: _KEni72, lazy: false, middleware: false, method: "get" },
  { route: '/__nuxt_content/:collection/sql_dump.txt', handler: _RvI4E9, lazy: false, middleware: false, method: undefined },
  { route: '/__nuxt_content/:collection/query', handler: _XsHh4_, lazy: false, middleware: false, method: undefined },
  { route: '/_ipx/**', handler: _qr0zWl, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_sIsgK3, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { $fetch$1 as $, parseURL as A, baseURL as B, createHooks as C, executeAsync as D, toRouteMatcher as E, createRouter$1 as F, encodeParam as G, encodePath as H, pascalCase as I, kebabCase as J, nodeServer as K, getResponseStatus as a, buildAssetsURL as b, getQuery as c, defineRenderHandler as d, createError$1 as e, destr as f, getResponseStatusText as g, getRouteRules as h, useNitroApp as i, parseQuery as j, klona as k, defuFn as l, defu as m, hasProtocol as n, joinURL as o, publicAssetsURL as p, isEqual as q, getContext as r, serialize$1 as s, withTrailingSlash as t, useRuntimeConfig as u, withoutTrailingSlash as v, withQuery as w, isScriptProtocol as x, sanitizeStatusCode as y, withLeadingSlash as z };
//# sourceMappingURL=nitro.mjs.map
