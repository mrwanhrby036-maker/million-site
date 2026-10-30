/* ============================================================
   من سيربح المليون؟ — ملف الجافاسكريبت الوحيد للمشروع
   ------------------------------------------------------------
   ١) Firebase SDK v11.0.2 (app + auth + database) مدمج كامل
      ← بيظهر كـ window.firebaseApp / firebaseAuth / firebaseDatabase
   ٢) كود المنصة (اللعبة + التصويت + الحساب + تحدي الغرف)
   الملف مستقل تمامًا: مفيش import، مفيش CDN، مفيش ملفات JS تانية.
   ============================================================ */

/* ===================== ١) Firebase SDK ===================== */
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };

  // firebase-app.js
  var firebase_app_exports = {};
  __export(firebase_app_exports, {
    FirebaseError: () => FirebaseError,
    SDK_VERSION: () => SDK_VERSION,
    _DEFAULT_ENTRY_NAME: () => DEFAULT_ENTRY_NAME,
    _addComponent: () => _addComponent,
    _addOrOverwriteComponent: () => _addOrOverwriteComponent,
    _apps: () => _apps,
    _clearComponents: () => _clearComponents,
    _components: () => _components,
    _getProvider: () => _getProvider,
    _isFirebaseApp: () => _isFirebaseApp,
    _isFirebaseServerApp: () => _isFirebaseServerApp,
    _registerComponent: () => _registerComponent,
    _removeServiceInstance: () => _removeServiceInstance,
    _serverApps: () => _serverApps,
    deleteApp: () => deleteApp,
    getApp: () => getApp,
    getApps: () => getApps,
    initializeApp: () => initializeApp,
    initializeServerApp: () => initializeServerApp,
    onLog: () => onLog,
    registerVersion: () => registerVersion,
    setLogLevel: () => setLogLevel
  });
  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var stringToByteArray$1 = function(str) {
    const out = [];
    let p3 = 0;
    for (let i2 = 0; i2 < str.length; i2++) {
      let c3 = str.charCodeAt(i2);
      if (c3 < 128) {
        out[p3++] = c3;
      } else if (c3 < 2048) {
        out[p3++] = c3 >> 6 | 192;
        out[p3++] = c3 & 63 | 128;
      } else if ((c3 & 64512) === 55296 && i2 + 1 < str.length && (str.charCodeAt(i2 + 1) & 64512) === 56320) {
        c3 = 65536 + ((c3 & 1023) << 10) + (str.charCodeAt(++i2) & 1023);
        out[p3++] = c3 >> 18 | 240;
        out[p3++] = c3 >> 12 & 63 | 128;
        out[p3++] = c3 >> 6 & 63 | 128;
        out[p3++] = c3 & 63 | 128;
      } else {
        out[p3++] = c3 >> 12 | 224;
        out[p3++] = c3 >> 6 & 63 | 128;
        out[p3++] = c3 & 63 | 128;
      }
    }
    return out;
  };
  var byteArrayToString = function(bytes) {
    const out = [];
    let pos = 0, c3 = 0;
    while (pos < bytes.length) {
      const c1 = bytes[pos++];
      if (c1 < 128) {
        out[c3++] = String.fromCharCode(c1);
      } else if (c1 > 191 && c1 < 224) {
        const c22 = bytes[pos++];
        out[c3++] = String.fromCharCode((c1 & 31) << 6 | c22 & 63);
      } else if (c1 > 239 && c1 < 365) {
        const c22 = bytes[pos++];
        const c32 = bytes[pos++];
        const c4 = bytes[pos++];
        const u3 = ((c1 & 7) << 18 | (c22 & 63) << 12 | (c32 & 63) << 6 | c4 & 63) - 65536;
        out[c3++] = String.fromCharCode(55296 + (u3 >> 10));
        out[c3++] = String.fromCharCode(56320 + (u3 & 1023));
      } else {
        const c22 = bytes[pos++];
        const c32 = bytes[pos++];
        out[c3++] = String.fromCharCode((c1 & 15) << 12 | (c22 & 63) << 6 | c32 & 63);
      }
    }
    return out.join("");
  };
  var base64 = {
    /**
     * Maps bytes to characters.
     */
    byteToCharMap_: null,
    /**
     * Maps characters to bytes.
     */
    charToByteMap_: null,
    /**
     * Maps bytes to websafe characters.
     * @private
     */
    byteToCharMapWebSafe_: null,
    /**
     * Maps websafe characters to bytes.
     * @private
     */
    charToByteMapWebSafe_: null,
    /**
     * Our default alphabet, shared between
     * ENCODED_VALS and ENCODED_VALS_WEBSAFE
     */
    ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    /**
     * Our default alphabet. Value 64 (=) is special; it means "nothing."
     */
    get ENCODED_VALS() {
      return this.ENCODED_VALS_BASE + "+/=";
    },
    /**
     * Our websafe alphabet.
     */
    get ENCODED_VALS_WEBSAFE() {
      return this.ENCODED_VALS_BASE + "-_.";
    },
    /**
     * Whether this browser supports the atob and btoa functions. This extension
     * started at Mozilla but is now implemented by many browsers. We use the
     * ASSUME_* variables to avoid pulling in the full useragent detection library
     * but still allowing the standard per-browser compilations.
     *
     */
    HAS_NATIVE_SUPPORT: typeof atob === "function",
    /**
     * Base64-encode an array of bytes.
     *
     * @param input An array of bytes (numbers with
     *     value in [0, 255]) to encode.
     * @param webSafe Boolean indicating we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */
    encodeByteArray(input, webSafe) {
      if (!Array.isArray(input)) {
        throw Error("encodeByteArray takes an array as a parameter");
      }
      this.init_();
      const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
      const output = [];
      for (let i2 = 0; i2 < input.length; i2 += 3) {
        const byte1 = input[i2];
        const haveByte2 = i2 + 1 < input.length;
        const byte2 = haveByte2 ? input[i2 + 1] : 0;
        const haveByte3 = i2 + 2 < input.length;
        const byte3 = haveByte3 ? input[i2 + 2] : 0;
        const outByte1 = byte1 >> 2;
        const outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
        let outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
        let outByte4 = byte3 & 63;
        if (!haveByte3) {
          outByte4 = 64;
          if (!haveByte2) {
            outByte3 = 64;
          }
        }
        output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
      }
      return output.join("");
    },
    /**
     * Base64-encode a string.
     *
     * @param input A string to encode.
     * @param webSafe If true, we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */
    encodeString(input, webSafe) {
      if (this.HAS_NATIVE_SUPPORT && !webSafe) {
        return btoa(input);
      }
      return this.encodeByteArray(stringToByteArray$1(input), webSafe);
    },
    /**
     * Base64-decode a string.
     *
     * @param input to decode.
     * @param webSafe True if we should use the
     *     alternative alphabet.
     * @return string representing the decoded value.
     */
    decodeString(input, webSafe) {
      if (this.HAS_NATIVE_SUPPORT && !webSafe) {
        return atob(input);
      }
      return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
    },
    /**
     * Base64-decode a string.
     *
     * In base-64 decoding, groups of four characters are converted into three
     * bytes.  If the encoder did not apply padding, the input length may not
     * be a multiple of 4.
     *
     * In this case, the last group will have fewer than 4 characters, and
     * padding will be inferred.  If the group has one or two characters, it decodes
     * to one byte.  If the group has three characters, it decodes to two bytes.
     *
     * @param input Input to decode.
     * @param webSafe True if we should use the web-safe alphabet.
     * @return bytes representing the decoded value.
     */
    decodeStringToByteArray(input, webSafe) {
      this.init_();
      const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
      const output = [];
      for (let i2 = 0; i2 < input.length; ) {
        const byte1 = charToByteMap[input.charAt(i2++)];
        const haveByte2 = i2 < input.length;
        const byte2 = haveByte2 ? charToByteMap[input.charAt(i2)] : 0;
        ++i2;
        const haveByte3 = i2 < input.length;
        const byte3 = haveByte3 ? charToByteMap[input.charAt(i2)] : 64;
        ++i2;
        const haveByte4 = i2 < input.length;
        const byte4 = haveByte4 ? charToByteMap[input.charAt(i2)] : 64;
        ++i2;
        if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
          throw new DecodeBase64StringError();
        }
        const outByte1 = byte1 << 2 | byte2 >> 4;
        output.push(outByte1);
        if (byte3 !== 64) {
          const outByte2 = byte2 << 4 & 240 | byte3 >> 2;
          output.push(outByte2);
          if (byte4 !== 64) {
            const outByte3 = byte3 << 6 & 192 | byte4;
            output.push(outByte3);
          }
        }
      }
      return output;
    },
    /**
     * Lazy static initialization function. Called before
     * accessing any of the static map variables.
     * @private
     */
    init_() {
      if (!this.byteToCharMap_) {
        this.byteToCharMap_ = {};
        this.charToByteMap_ = {};
        this.byteToCharMapWebSafe_ = {};
        this.charToByteMapWebSafe_ = {};
        for (let i2 = 0; i2 < this.ENCODED_VALS.length; i2++) {
          this.byteToCharMap_[i2] = this.ENCODED_VALS.charAt(i2);
          this.charToByteMap_[this.byteToCharMap_[i2]] = i2;
          this.byteToCharMapWebSafe_[i2] = this.ENCODED_VALS_WEBSAFE.charAt(i2);
          this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i2]] = i2;
          if (i2 >= this.ENCODED_VALS_BASE.length) {
            this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i2)] = i2;
            this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i2)] = i2;
          }
        }
      }
    }
  };
  var DecodeBase64StringError = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "DecodeBase64StringError";
    }
  };
  var base64Encode = function(str) {
    const utf8Bytes = stringToByteArray$1(str);
    return base64.encodeByteArray(utf8Bytes, true);
  };
  var base64urlEncodeWithoutPadding = function(str) {
    return base64Encode(str).replace(/\./g, "");
  };
  var base64Decode = function(str) {
    try {
      return base64.decodeString(str, true);
    } catch (e) {
      console.error("base64Decode failed: ", e);
    }
    return null;
  };
  /**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  function getGlobal() {
    if (typeof self !== "undefined") {
      return self;
    }
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof global !== "undefined") {
      return global;
    }
    throw new Error("Unable to locate global object.");
  }
  /**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var getDefaultsFromGlobal = () => getGlobal().__FIREBASE_DEFAULTS__;
  var getDefaultsFromEnvVariable = () => {
    if (typeof process === "undefined" || typeof process.env === "undefined") {
      return;
    }
    const defaultsJsonString = process.env.__FIREBASE_DEFAULTS__;
    if (defaultsJsonString) {
      return JSON.parse(defaultsJsonString);
    }
  };
  var getDefaultsFromCookie = () => {
    if (typeof document === "undefined") {
      return;
    }
    let match;
    try {
      match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
    } catch (e) {
      return;
    }
    const decoded = match && base64Decode(match[1]);
    return decoded && JSON.parse(decoded);
  };
  var getDefaults = () => {
    try {
      return getDefaultsFromGlobal() || getDefaultsFromEnvVariable() || getDefaultsFromCookie();
    } catch (e) {
      console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
      return;
    }
  };
  var getDefaultAppConfig = () => {
    var _a;
    return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.config;
  };
  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var Deferred = class {
    constructor() {
      this.reject = () => {
      };
      this.resolve = () => {
      };
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
    /**
     * Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
     * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
     * and returns a node-style callback which will resolve or reject the Deferred's promise.
     */
    wrapCallback(callback) {
      return (error2, value) => {
        if (error2) {
          this.reject(error2);
        } else {
          this.resolve(value);
        }
        if (typeof callback === "function") {
          this.promise.catch(() => {
          });
          if (callback.length === 1) {
            callback(error2);
          } else {
            callback(error2, value);
          }
        }
      };
    }
  };
  function isBrowser() {
    return typeof window !== "undefined" || isWebWorker();
  }
  function isWebWorker() {
    return typeof WorkerGlobalScope !== "undefined" && typeof self !== "undefined" && self instanceof WorkerGlobalScope;
  }
  function isIndexedDBAvailable() {
    try {
      return typeof indexedDB === "object";
    } catch (e) {
      return false;
    }
  }
  function validateIndexedDBOpenable() {
    return new Promise((resolve, reject) => {
      try {
        let preExist = true;
        const DB_CHECK_NAME = "validate-browser-context-for-indexeddb-analytics-module";
        const request = self.indexedDB.open(DB_CHECK_NAME);
        request.onsuccess = () => {
          request.result.close();
          if (!preExist) {
            self.indexedDB.deleteDatabase(DB_CHECK_NAME);
          }
          resolve(true);
        };
        request.onupgradeneeded = () => {
          preExist = false;
        };
        request.onerror = () => {
          var _a;
          reject(((_a = request.error) === null || _a === void 0 ? void 0 : _a.message) || "");
        };
      } catch (error2) {
        reject(error2);
      }
    });
  }
  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var ERROR_NAME = "FirebaseError";
  var FirebaseError = class _FirebaseError extends Error {
    constructor(code, message, customData) {
      super(message);
      this.code = code;
      this.customData = customData;
      this.name = ERROR_NAME;
      Object.setPrototypeOf(this, _FirebaseError.prototype);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ErrorFactory.prototype.create);
      }
    }
  };
  var ErrorFactory = class {
    constructor(service, serviceName, errors) {
      this.service = service;
      this.serviceName = serviceName;
      this.errors = errors;
    }
    create(code, ...data) {
      const customData = data[0] || {};
      const fullCode = `${this.service}/${code}`;
      const template = this.errors[code];
      const message = template ? replaceTemplate(template, customData) : "Error";
      const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
      const error2 = new FirebaseError(fullCode, fullMessage, customData);
      return error2;
    }
  };
  function replaceTemplate(template, data) {
    return template.replace(PATTERN, (_3, key) => {
      const value = data[key];
      return value != null ? String(value) : `<${key}?>`;
    });
  }
  var PATTERN = /\{\$([^}]+)}/g;
  function deepEqual(a3, b3) {
    if (a3 === b3) {
      return true;
    }
    const aKeys = Object.keys(a3);
    const bKeys = Object.keys(b3);
    for (const k3 of aKeys) {
      if (!bKeys.includes(k3)) {
        return false;
      }
      const aProp = a3[k3];
      const bProp = b3[k3];
      if (isObject(aProp) && isObject(bProp)) {
        if (!deepEqual(aProp, bProp)) {
          return false;
        }
      } else if (aProp !== bProp) {
        return false;
      }
    }
    for (const k3 of bKeys) {
      if (!aKeys.includes(k3)) {
        return false;
      }
    }
    return true;
  }
  function isObject(thing) {
    return thing !== null && typeof thing === "object";
  }
  var Component = class {
    /**
     *
     * @param name The public service name, e.g. app, auth, firestore, database
     * @param instanceFactory Service factory responsible for creating the public interface
     * @param type whether the service provided by the component is public or private
     */
    constructor(name2, instanceFactory, type) {
      this.name = name2;
      this.instanceFactory = instanceFactory;
      this.type = type;
      this.multipleInstances = false;
      this.serviceProps = {};
      this.instantiationMode = "LAZY";
      this.onInstanceCreated = null;
    }
    setInstantiationMode(mode) {
      this.instantiationMode = mode;
      return this;
    }
    setMultipleInstances(multipleInstances) {
      this.multipleInstances = multipleInstances;
      return this;
    }
    setServiceProps(props) {
      this.serviceProps = props;
      return this;
    }
    setInstanceCreatedCallback(callback) {
      this.onInstanceCreated = callback;
      return this;
    }
  };
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var DEFAULT_ENTRY_NAME$1 = "[DEFAULT]";
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var Provider = class {
    constructor(name2, container) {
      this.name = name2;
      this.container = container;
      this.component = null;
      this.instances = /* @__PURE__ */ new Map();
      this.instancesDeferred = /* @__PURE__ */ new Map();
      this.instancesOptions = /* @__PURE__ */ new Map();
      this.onInitCallbacks = /* @__PURE__ */ new Map();
    }
    /**
     * @param identifier A provider can provide multiple instances of a service
     * if this.component.multipleInstances is true.
     */
    get(identifier) {
      const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
      if (!this.instancesDeferred.has(normalizedIdentifier)) {
        const deferred = new Deferred();
        this.instancesDeferred.set(normalizedIdentifier, deferred);
        if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
          try {
            const instance = this.getOrInitializeService({
              instanceIdentifier: normalizedIdentifier
            });
            if (instance) {
              deferred.resolve(instance);
            }
          } catch (e) {
          }
        }
      }
      return this.instancesDeferred.get(normalizedIdentifier).promise;
    }
    getImmediate(options) {
      var _a;
      const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
      const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
      if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
        try {
          return this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier
          });
        } catch (e) {
          if (optional) {
            return null;
          } else {
            throw e;
          }
        }
      } else {
        if (optional) {
          return null;
        } else {
          throw Error(`Service ${this.name} is not available`);
        }
      }
    }
    getComponent() {
      return this.component;
    }
    setComponent(component) {
      if (component.name !== this.name) {
        throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
      }
      if (this.component) {
        throw Error(`Component for ${this.name} has already been provided`);
      }
      this.component = component;
      if (!this.shouldAutoInitialize()) {
        return;
      }
      if (isComponentEager(component)) {
        try {
          this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
        } catch (e) {
        }
      }
      for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
        const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
        try {
          const instance = this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier
          });
          instanceDeferred.resolve(instance);
        } catch (e) {
        }
      }
    }
    clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
      this.instancesDeferred.delete(identifier);
      this.instancesOptions.delete(identifier);
      this.instances.delete(identifier);
    }
    // app.delete() will call this method on every provider to delete the services
    // TODO: should we mark the provider as deleted?
    async delete() {
      const services = Array.from(this.instances.values());
      await Promise.all([
        ...services.filter((service) => "INTERNAL" in service).map((service) => service.INTERNAL.delete()),
        ...services.filter((service) => "_delete" in service).map((service) => service._delete())
      ]);
    }
    isComponentSet() {
      return this.component != null;
    }
    isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
      return this.instances.has(identifier);
    }
    getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
      return this.instancesOptions.get(identifier) || {};
    }
    initialize(opts = {}) {
      const { options = {} } = opts;
      const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
      if (this.isInitialized(normalizedIdentifier)) {
        throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
      }
      if (!this.isComponentSet()) {
        throw Error(`Component ${this.name} has not been registered yet`);
      }
      const instance = this.getOrInitializeService({
        instanceIdentifier: normalizedIdentifier,
        options
      });
      for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
        const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
        if (normalizedIdentifier === normalizedDeferredIdentifier) {
          instanceDeferred.resolve(instance);
        }
      }
      return instance;
    }
    /**
     *
     * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
     * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
     *
     * @param identifier An optional instance identifier
     * @returns a function to unregister the callback
     */
    onInit(callback, identifier) {
      var _a;
      const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
      const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new Set();
      existingCallbacks.add(callback);
      this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
      const existingInstance = this.instances.get(normalizedIdentifier);
      if (existingInstance) {
        callback(existingInstance, normalizedIdentifier);
      }
      return () => {
        existingCallbacks.delete(callback);
      };
    }
    /**
     * Invoke onInit callbacks synchronously
     * @param instance the service instance`
     */
    invokeOnInitCallbacks(instance, identifier) {
      const callbacks = this.onInitCallbacks.get(identifier);
      if (!callbacks) {
        return;
      }
      for (const callback of callbacks) {
        try {
          callback(instance, identifier);
        } catch (_a) {
        }
      }
    }
    getOrInitializeService({ instanceIdentifier, options = {} }) {
      let instance = this.instances.get(instanceIdentifier);
      if (!instance && this.component) {
        instance = this.component.instanceFactory(this.container, {
          instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
          options
        });
        this.instances.set(instanceIdentifier, instance);
        this.instancesOptions.set(instanceIdentifier, options);
        this.invokeOnInitCallbacks(instance, instanceIdentifier);
        if (this.component.onInstanceCreated) {
          try {
            this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
          } catch (_a) {
          }
        }
      }
      return instance || null;
    }
    normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
      if (this.component) {
        return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
      } else {
        return identifier;
      }
    }
    shouldAutoInitialize() {
      return !!this.component && this.component.instantiationMode !== "EXPLICIT";
    }
  };
  function normalizeIdentifierForFactory(identifier) {
    return identifier === DEFAULT_ENTRY_NAME$1 ? void 0 : identifier;
  }
  function isComponentEager(component) {
    return component.instantiationMode === "EAGER";
  }
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var ComponentContainer = class {
    constructor(name2) {
      this.name = name2;
      this.providers = /* @__PURE__ */ new Map();
    }
    /**
     *
     * @param component Component being added
     * @param overwrite When a component with the same name has already been registered,
     * if overwrite is true: overwrite the existing component with the new component and create a new
     * provider with the new component. It can be useful in tests where you want to use different mocks
     * for different tests.
     * if overwrite is false: throw an exception
     */
    addComponent(component) {
      const provider = this.getProvider(component.name);
      if (provider.isComponentSet()) {
        throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
      }
      provider.setComponent(component);
    }
    addOrOverwriteComponent(component) {
      const provider = this.getProvider(component.name);
      if (provider.isComponentSet()) {
        this.providers.delete(component.name);
      }
      this.addComponent(component);
    }
    /**
     * getProvider provides a type safe interface where it can only be called with a field name
     * present in NameServiceMapping interface.
     *
     * Firebase SDKs providing services should extend NameServiceMapping interface to register
     * themselves.
     */
    getProvider(name2) {
      if (this.providers.has(name2)) {
        return this.providers.get(name2);
      }
      const provider = new Provider(name2, this);
      this.providers.set(name2, provider);
      return provider;
    }
    getProviders() {
      return Array.from(this.providers.values());
    }
  };
  /**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var instances = [];
  var LogLevel;
  (function(LogLevel2) {
    LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
    LogLevel2[LogLevel2["VERBOSE"] = 1] = "VERBOSE";
    LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
    LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
    LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
    LogLevel2[LogLevel2["SILENT"] = 5] = "SILENT";
  })(LogLevel || (LogLevel = {}));
  var levelStringToEnum = {
    "debug": LogLevel.DEBUG,
    "verbose": LogLevel.VERBOSE,
    "info": LogLevel.INFO,
    "warn": LogLevel.WARN,
    "error": LogLevel.ERROR,
    "silent": LogLevel.SILENT
  };
  var defaultLogLevel = LogLevel.INFO;
  var ConsoleMethod = {
    [LogLevel.DEBUG]: "log",
    [LogLevel.VERBOSE]: "log",
    [LogLevel.INFO]: "info",
    [LogLevel.WARN]: "warn",
    [LogLevel.ERROR]: "error"
  };
  var defaultLogHandler = (instance, logType, ...args) => {
    if (logType < instance.logLevel) {
      return;
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const method = ConsoleMethod[logType];
    if (method) {
      console[method](`[${now}]  ${instance.name}:`, ...args);
    } else {
      throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
    }
  };
  var Logger = class {
    /**
     * Gives you an instance of a Logger to capture messages according to
     * Firebase's logging scheme.
     *
     * @param name The name that the logs will be associated with
     */
    constructor(name2) {
      this.name = name2;
      this._logLevel = defaultLogLevel;
      this._logHandler = defaultLogHandler;
      this._userLogHandler = null;
      instances.push(this);
    }
    get logLevel() {
      return this._logLevel;
    }
    set logLevel(val) {
      if (!(val in LogLevel)) {
        throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
      }
      this._logLevel = val;
    }
    // Workaround for setter/getter having to be the same type.
    setLogLevel(val) {
      this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
    }
    get logHandler() {
      return this._logHandler;
    }
    set logHandler(val) {
      if (typeof val !== "function") {
        throw new TypeError("Value assigned to `logHandler` must be a function");
      }
      this._logHandler = val;
    }
    get userLogHandler() {
      return this._userLogHandler;
    }
    set userLogHandler(val) {
      this._userLogHandler = val;
    }
    /**
     * The functions below are all based on the `console` interface
     */
    debug(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
      this._logHandler(this, LogLevel.DEBUG, ...args);
    }
    log(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
      this._logHandler(this, LogLevel.VERBOSE, ...args);
    }
    info(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
      this._logHandler(this, LogLevel.INFO, ...args);
    }
    warn(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
      this._logHandler(this, LogLevel.WARN, ...args);
    }
    error(...args) {
      this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
      this._logHandler(this, LogLevel.ERROR, ...args);
    }
  };
  function setLogLevel$1(level) {
    instances.forEach((inst) => {
      inst.setLogLevel(level);
    });
  }
  function setUserLogHandler(logCallback, options) {
    for (const instance of instances) {
      let customLogLevel = null;
      if (options && options.level) {
        customLogLevel = levelStringToEnum[options.level];
      }
      if (logCallback === null) {
        instance.userLogHandler = null;
      } else {
        instance.userLogHandler = (instance2, level, ...args) => {
          const message = args.map((arg) => {
            if (arg == null) {
              return null;
            } else if (typeof arg === "string") {
              return arg;
            } else if (typeof arg === "number" || typeof arg === "boolean") {
              return arg.toString();
            } else if (arg instanceof Error) {
              return arg.message;
            } else {
              try {
                return JSON.stringify(arg);
              } catch (ignored) {
                return null;
              }
            }
          }).filter((arg) => arg).join(" ");
          if (level >= (customLogLevel !== null && customLogLevel !== void 0 ? customLogLevel : instance2.logLevel)) {
            logCallback({
              level: LogLevel[level].toLowerCase(),
              message,
              args,
              type: instance2.name
            });
          }
        };
      }
    }
  }
  var instanceOfAny = (object, constructors) => constructors.some((c3) => object instanceof c3);
  var idbProxyableTypes;
  var cursorAdvanceMethods;
  function getIdbProxyableTypes() {
    return idbProxyableTypes || (idbProxyableTypes = [
      IDBDatabase,
      IDBObjectStore,
      IDBIndex,
      IDBCursor,
      IDBTransaction
    ]);
  }
  function getCursorAdvanceMethods() {
    return cursorAdvanceMethods || (cursorAdvanceMethods = [
      IDBCursor.prototype.advance,
      IDBCursor.prototype.continue,
      IDBCursor.prototype.continuePrimaryKey
    ]);
  }
  var cursorRequestMap = /* @__PURE__ */ new WeakMap();
  var transactionDoneMap = /* @__PURE__ */ new WeakMap();
  var transactionStoreNamesMap = /* @__PURE__ */ new WeakMap();
  var transformCache = /* @__PURE__ */ new WeakMap();
  var reverseTransformCache = /* @__PURE__ */ new WeakMap();
  function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
      const unlisten = () => {
        request.removeEventListener("success", success);
        request.removeEventListener("error", error2);
      };
      const success = () => {
        resolve(wrap(request.result));
        unlisten();
      };
      const error2 = () => {
        reject(request.error);
        unlisten();
      };
      request.addEventListener("success", success);
      request.addEventListener("error", error2);
    });
    promise.then((value) => {
      if (value instanceof IDBCursor) {
        cursorRequestMap.set(value, request);
      }
    }).catch(() => {
    });
    reverseTransformCache.set(promise, request);
    return promise;
  }
  function cacheDonePromiseForTransaction(tx) {
    if (transactionDoneMap.has(tx))
      return;
    const done = new Promise((resolve, reject) => {
      const unlisten = () => {
        tx.removeEventListener("complete", complete);
        tx.removeEventListener("error", error2);
        tx.removeEventListener("abort", error2);
      };
      const complete = () => {
        resolve();
        unlisten();
      };
      const error2 = () => {
        reject(tx.error || new DOMException("AbortError", "AbortError"));
        unlisten();
      };
      tx.addEventListener("complete", complete);
      tx.addEventListener("error", error2);
      tx.addEventListener("abort", error2);
    });
    transactionDoneMap.set(tx, done);
  }
  var idbProxyTraps = {
    get(target, prop, receiver) {
      if (target instanceof IDBTransaction) {
        if (prop === "done")
          return transactionDoneMap.get(target);
        if (prop === "objectStoreNames") {
          return target.objectStoreNames || transactionStoreNamesMap.get(target);
        }
        if (prop === "store") {
          return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
        }
      }
      return wrap(target[prop]);
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
    has(target, prop) {
      if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
        return true;
      }
      return prop in target;
    }
  };
  function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
  }
  function wrapFunction(func) {
    if (func === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype)) {
      return function(storeNames, ...args) {
        const tx = func.call(unwrap(this), storeNames, ...args);
        transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
        return wrap(tx);
      };
    }
    if (getCursorAdvanceMethods().includes(func)) {
      return function(...args) {
        func.apply(unwrap(this), args);
        return wrap(cursorRequestMap.get(this));
      };
    }
    return function(...args) {
      return wrap(func.apply(unwrap(this), args));
    };
  }
  function transformCachableValue(value) {
    if (typeof value === "function")
      return wrapFunction(value);
    if (value instanceof IDBTransaction)
      cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
      return new Proxy(value, idbProxyTraps);
    return value;
  }
  function wrap(value) {
    if (value instanceof IDBRequest)
      return promisifyRequest(value);
    if (transformCache.has(value))
      return transformCache.get(value);
    const newValue = transformCachableValue(value);
    if (newValue !== value) {
      transformCache.set(value, newValue);
      reverseTransformCache.set(newValue, value);
    }
    return newValue;
  }
  var unwrap = (value) => reverseTransformCache.get(value);
  function openDB(name2, version2, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name2, version2);
    const openPromise = wrap(request);
    if (upgrade) {
      request.addEventListener("upgradeneeded", (event) => {
        upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
      });
    }
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion,
        event.newVersion,
        event
      ));
    }
    openPromise.then((db) => {
      if (terminated)
        db.addEventListener("close", () => terminated());
      if (blocking) {
        db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
      }
    }).catch(() => {
    });
    return openPromise;
  }
  var readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
  var writeMethods = ["put", "add", "delete", "clear"];
  var cachedMethods = /* @__PURE__ */ new Map();
  function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
      return;
    }
    if (cachedMethods.get(prop))
      return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, "");
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
      // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
      !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
    ) {
      return;
    }
    const method = async function(storeName, ...args) {
      const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
      let target2 = tx.store;
      if (useIndex)
        target2 = target2.index(args.shift());
      return (await Promise.all([
        target2[targetFuncName](...args),
        isWrite && tx.done
      ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
  }
  replaceTraps((oldTraps) => Object.assign(Object.assign({}, oldTraps), { get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver), has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop) }));
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var PlatformLoggerServiceImpl = class {
    constructor(container) {
      this.container = container;
    }
    // In initial implementation, this will be called by installations on
    // auth token refresh, and installations will send this string.
    getPlatformInfoString() {
      const providers = this.container.getProviders();
      return providers.map((provider) => {
        if (isVersionServiceProvider(provider)) {
          const service = provider.getImmediate();
          return `${service.library}/${service.version}`;
        } else {
          return null;
        }
      }).filter((logString) => logString).join(" ");
    }
  };
  function isVersionServiceProvider(provider) {
    const component = provider.getComponent();
    return (component === null || component === void 0 ? void 0 : component.type) === "VERSION";
  }
  var name$q = "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  var version$1 = "0.10.16";
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var logger = new Logger("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js");
  var name$p = "@firebase/app-compat";
  var name$o = "@firebase/analytics-compat";
  var name$n = "@firebase/analytics";
  var name$m = "@firebase/app-check-compat";
  var name$l = "@firebase/app-check";
  var name$k = "@firebase/auth";
  var name$j = "@firebase/auth-compat";
  var name$i = "@firebase/database";
  var name$h = "@firebase/data-connect";
  var name$g = "@firebase/database-compat";
  var name$f = "@firebase/functions";
  var name$e = "@firebase/functions-compat";
  var name$d = "@firebase/installations";
  var name$c = "@firebase/installations-compat";
  var name$b = "@firebase/messaging";
  var name$a = "@firebase/messaging-compat";
  var name$9 = "@firebase/performance";
  var name$8 = "@firebase/performance-compat";
  var name$7 = "@firebase/remote-config";
  var name$6 = "@firebase/remote-config-compat";
  var name$5 = "@firebase/storage";
  var name$4 = "@firebase/storage-compat";
  var name$3 = "@firebase/firestore";
  var name$2 = "@firebase/vertexai";
  var name$1 = "@firebase/firestore-compat";
  var name$r = "firebase";
  var version$2 = "11.0.2";
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var DEFAULT_ENTRY_NAME = "[DEFAULT]";
  var PLATFORM_LOG_STRING = {
    [name$q]: "fire-core",
    [name$p]: "fire-core-compat",
    [name$n]: "fire-analytics",
    [name$o]: "fire-analytics-compat",
    [name$l]: "fire-app-check",
    [name$m]: "fire-app-check-compat",
    [name$k]: "fire-auth",
    [name$j]: "fire-auth-compat",
    [name$i]: "fire-rtdb",
    [name$h]: "fire-data-connect",
    [name$g]: "fire-rtdb-compat",
    [name$f]: "fire-fn",
    [name$e]: "fire-fn-compat",
    [name$d]: "fire-iid",
    [name$c]: "fire-iid-compat",
    [name$b]: "fire-fcm",
    [name$a]: "fire-fcm-compat",
    [name$9]: "fire-perf",
    [name$8]: "fire-perf-compat",
    [name$7]: "fire-rc",
    [name$6]: "fire-rc-compat",
    [name$5]: "fire-gcs",
    [name$4]: "fire-gcs-compat",
    [name$3]: "fire-fst",
    [name$1]: "fire-fst-compat",
    [name$2]: "fire-vertex",
    "fire-js": "fire-js",
    // Platform identifier for JS SDK.
    [name$r]: "fire-js-all"
  };
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var _apps = /* @__PURE__ */ new Map();
  var _serverApps = /* @__PURE__ */ new Map();
  var _components = /* @__PURE__ */ new Map();
  function _addComponent(app, component) {
    try {
      app.container.addComponent(component);
    } catch (e) {
      logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
    }
  }
  function _addOrOverwriteComponent(app, component) {
    app.container.addOrOverwriteComponent(component);
  }
  function _registerComponent(component) {
    const componentName = component.name;
    if (_components.has(componentName)) {
      logger.debug(`There were multiple attempts to register component ${componentName}.`);
      return false;
    }
    _components.set(componentName, component);
    for (const app of _apps.values()) {
      _addComponent(app, component);
    }
    for (const serverApp of _serverApps.values()) {
      _addComponent(serverApp, component);
    }
    return true;
  }
  function _getProvider(app, name2) {
    const heartbeatController = app.container.getProvider("heartbeat").getImmediate({ optional: true });
    if (heartbeatController) {
      void heartbeatController.triggerHeartbeat();
    }
    return app.container.getProvider(name2);
  }
  function _removeServiceInstance(app, name2, instanceIdentifier = DEFAULT_ENTRY_NAME) {
    _getProvider(app, name2).clearInstance(instanceIdentifier);
  }
  function _isFirebaseApp(obj) {
    return obj.options !== void 0;
  }
  function _isFirebaseServerApp(obj) {
    return obj.settings !== void 0;
  }
  function _clearComponents() {
    _components.clear();
  }
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var ERRORS = {
    [
      "no-app"
      /* AppError.NO_APP */
    ]: "No Firebase App '{$appName}' has been created - call initializeApp() first",
    [
      "bad-app-name"
      /* AppError.BAD_APP_NAME */
    ]: "Illegal App name: '{$appName}'",
    [
      "duplicate-app"
      /* AppError.DUPLICATE_APP */
    ]: "Firebase App named '{$appName}' already exists with different options or config",
    [
      "app-deleted"
      /* AppError.APP_DELETED */
    ]: "Firebase App named '{$appName}' already deleted",
    [
      "server-app-deleted"
      /* AppError.SERVER_APP_DELETED */
    ]: "Firebase Server App has been deleted",
    [
      "no-options"
      /* AppError.NO_OPTIONS */
    ]: "Need to provide options, when not being deployed to hosting via source.",
    [
      "invalid-app-argument"
      /* AppError.INVALID_APP_ARGUMENT */
    ]: "firebase.{$appName}() takes either no argument or a Firebase App instance.",
    [
      "invalid-log-argument"
      /* AppError.INVALID_LOG_ARGUMENT */
    ]: "First argument to `onLog` must be null or a function.",
    [
      "idb-open"
      /* AppError.IDB_OPEN */
    ]: "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
    [
      "idb-get"
      /* AppError.IDB_GET */
    ]: "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
    [
      "idb-set"
      /* AppError.IDB_WRITE */
    ]: "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
    [
      "idb-delete"
      /* AppError.IDB_DELETE */
    ]: "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
    [
      "finalization-registry-not-supported"
      /* AppError.FINALIZATION_REGISTRY_NOT_SUPPORTED */
    ]: "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
    [
      "invalid-server-app-environment"
      /* AppError.INVALID_SERVER_APP_ENVIRONMENT */
    ]: "FirebaseServerApp is not for use in browser environments."
  };
  var ERROR_FACTORY = new ErrorFactory("app", "Firebase", ERRORS);
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var FirebaseAppImpl = class {
    constructor(options, config, container) {
      this._isDeleted = false;
      this._options = Object.assign({}, options);
      this._config = Object.assign({}, config);
      this._name = config.name;
      this._automaticDataCollectionEnabled = config.automaticDataCollectionEnabled;
      this._container = container;
      this.container.addComponent(new Component(
        "app",
        () => this,
        "PUBLIC"
        /* ComponentType.PUBLIC */
      ));
    }
    get automaticDataCollectionEnabled() {
      this.checkDestroyed();
      return this._automaticDataCollectionEnabled;
    }
    set automaticDataCollectionEnabled(val) {
      this.checkDestroyed();
      this._automaticDataCollectionEnabled = val;
    }
    get name() {
      this.checkDestroyed();
      return this._name;
    }
    get options() {
      this.checkDestroyed();
      return this._options;
    }
    get config() {
      this.checkDestroyed();
      return this._config;
    }
    get container() {
      return this._container;
    }
    get isDeleted() {
      return this._isDeleted;
    }
    set isDeleted(val) {
      this._isDeleted = val;
    }
    /**
     * This function will throw an Error if the App has already been deleted -
     * use before performing API actions on the App.
     */
    checkDestroyed() {
      if (this.isDeleted) {
        throw ERROR_FACTORY.create("app-deleted", { appName: this._name });
      }
    }
  };
  /**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var FirebaseServerAppImpl = class extends FirebaseAppImpl {
    constructor(options, serverConfig, name2, container) {
      const automaticDataCollectionEnabled = serverConfig.automaticDataCollectionEnabled !== void 0 ? serverConfig.automaticDataCollectionEnabled : false;
      const config = {
        name: name2,
        automaticDataCollectionEnabled
      };
      if (options.apiKey !== void 0) {
        super(options, config, container);
      } else {
        const appImpl = options;
        super(appImpl.options, config, container);
      }
      this._serverConfig = Object.assign({ automaticDataCollectionEnabled }, serverConfig);
      this._finalizationRegistry = null;
      if (typeof FinalizationRegistry !== "undefined") {
        this._finalizationRegistry = new FinalizationRegistry(() => {
          this.automaticCleanup();
        });
      }
      this._refCount = 0;
      this.incRefCount(this._serverConfig.releaseOnDeref);
      this._serverConfig.releaseOnDeref = void 0;
      serverConfig.releaseOnDeref = void 0;
      registerVersion(name$q, version$1, "serverapp");
    }
    toJSON() {
      return void 0;
    }
    get refCount() {
      return this._refCount;
    }
    // Increment the reference count of this server app. If an object is provided, register it
    // with the finalization registry.
    incRefCount(obj) {
      if (this.isDeleted) {
        return;
      }
      this._refCount++;
      if (obj !== void 0 && this._finalizationRegistry !== null) {
        this._finalizationRegistry.register(obj, this);
      }
    }
    // Decrement the reference count.
    decRefCount() {
      if (this.isDeleted) {
        return 0;
      }
      return --this._refCount;
    }
    // Invoked by the FinalizationRegistry callback to note that this app should go through its
    // reference counts and delete itself if no reference count remain. The coordinating logic that
    // handles this is in deleteApp(...).
    automaticCleanup() {
      void deleteApp(this);
    }
    get settings() {
      this.checkDestroyed();
      return this._serverConfig;
    }
    /**
     * This function will throw an Error if the App has already been deleted -
     * use before performing API actions on the App.
     */
    checkDestroyed() {
      if (this.isDeleted) {
        throw ERROR_FACTORY.create(
          "server-app-deleted"
          /* AppError.SERVER_APP_DELETED */
        );
      }
    }
  };
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var SDK_VERSION = version$2;
  function initializeApp(_options, rawConfig = {}) {
    let options = _options;
    if (typeof rawConfig !== "object") {
      const name3 = rawConfig;
      rawConfig = { name: name3 };
    }
    const config = Object.assign({ name: DEFAULT_ENTRY_NAME, automaticDataCollectionEnabled: false }, rawConfig);
    const name2 = config.name;
    if (typeof name2 !== "string" || !name2) {
      throw ERROR_FACTORY.create("bad-app-name", {
        appName: String(name2)
      });
    }
    options || (options = getDefaultAppConfig());
    if (!options) {
      throw ERROR_FACTORY.create(
        "no-options"
        /* AppError.NO_OPTIONS */
      );
    }
    const existingApp = _apps.get(name2);
    if (existingApp) {
      if (deepEqual(options, existingApp.options) && deepEqual(config, existingApp.config)) {
        return existingApp;
      } else {
        throw ERROR_FACTORY.create("duplicate-app", { appName: name2 });
      }
    }
    const container = new ComponentContainer(name2);
    for (const component of _components.values()) {
      container.addComponent(component);
    }
    const newApp = new FirebaseAppImpl(options, config, container);
    _apps.set(name2, newApp);
    return newApp;
  }
  function initializeServerApp(_options, _serverAppConfig) {
    if (isBrowser() && !isWebWorker()) {
      throw ERROR_FACTORY.create(
        "invalid-server-app-environment"
        /* AppError.INVALID_SERVER_APP_ENVIRONMENT */
      );
    }
    if (_serverAppConfig.automaticDataCollectionEnabled === void 0) {
      _serverAppConfig.automaticDataCollectionEnabled = false;
    }
    let appOptions;
    if (_isFirebaseApp(_options)) {
      appOptions = _options.options;
    } else {
      appOptions = _options;
    }
    const nameObj = Object.assign(Object.assign({}, _serverAppConfig), appOptions);
    if (nameObj.releaseOnDeref !== void 0) {
      delete nameObj.releaseOnDeref;
    }
    const hashCode = (s3) => {
      return [...s3].reduce((hash, c3) => Math.imul(31, hash) + c3.charCodeAt(0) | 0, 0);
    };
    if (_serverAppConfig.releaseOnDeref !== void 0) {
      if (typeof FinalizationRegistry === "undefined") {
        throw ERROR_FACTORY.create("finalization-registry-not-supported", {});
      }
    }
    const nameString = "" + hashCode(JSON.stringify(nameObj));
    const existingApp = _serverApps.get(nameString);
    if (existingApp) {
      existingApp.incRefCount(_serverAppConfig.releaseOnDeref);
      return existingApp;
    }
    const container = new ComponentContainer(nameString);
    for (const component of _components.values()) {
      container.addComponent(component);
    }
    const newApp = new FirebaseServerAppImpl(appOptions, _serverAppConfig, nameString, container);
    _serverApps.set(nameString, newApp);
    return newApp;
  }
  function getApp(name2 = DEFAULT_ENTRY_NAME) {
    const app = _apps.get(name2);
    if (!app && name2 === DEFAULT_ENTRY_NAME && getDefaultAppConfig()) {
      return initializeApp();
    }
    if (!app) {
      throw ERROR_FACTORY.create("no-app", { appName: name2 });
    }
    return app;
  }
  function getApps() {
    return Array.from(_apps.values());
  }
  async function deleteApp(app) {
    let cleanupProviders = false;
    const name2 = app.name;
    if (_apps.has(name2)) {
      cleanupProviders = true;
      _apps.delete(name2);
    } else if (_serverApps.has(name2)) {
      const firebaseServerApp = app;
      if (firebaseServerApp.decRefCount() <= 0) {
        _serverApps.delete(name2);
        cleanupProviders = true;
      }
    }
    if (cleanupProviders) {
      await Promise.all(app.container.getProviders().map((provider) => provider.delete()));
      app.isDeleted = true;
    }
  }
  function registerVersion(libraryKeyOrName, version2, variant) {
    var _a;
    let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
    if (variant) {
      library += `-${variant}`;
    }
    const libraryMismatch = library.match(/\s|\//);
    const versionMismatch = version2.match(/\s|\//);
    if (libraryMismatch || versionMismatch) {
      const warning = [
        `Unable to register library "${library}" with version "${version2}":`
      ];
      if (libraryMismatch) {
        warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
      }
      if (libraryMismatch && versionMismatch) {
        warning.push("and");
      }
      if (versionMismatch) {
        warning.push(`version name "${version2}" contains illegal characters (whitespace or "/")`);
      }
      logger.warn(warning.join(" "));
      return;
    }
    _registerComponent(new Component(
      `${library}-version`,
      () => ({ library, version: version2 }),
      "VERSION"
      /* ComponentType.VERSION */
    ));
  }
  function onLog(logCallback, options) {
    if (logCallback !== null && typeof logCallback !== "function") {
      throw ERROR_FACTORY.create(
        "invalid-log-argument"
        /* AppError.INVALID_LOG_ARGUMENT */
      );
    }
    setUserLogHandler(logCallback, options);
  }
  function setLogLevel(logLevel) {
    setLogLevel$1(logLevel);
  }
  /**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var DB_NAME = "firebase-heartbeat-database";
  var DB_VERSION = 1;
  var STORE_NAME = "firebase-heartbeat-store";
  var dbPromise = null;
  function getDbPromise() {
    if (!dbPromise) {
      dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade: (db, oldVersion) => {
          switch (oldVersion) {
            case 0:
              try {
                db.createObjectStore(STORE_NAME);
              } catch (e) {
                console.warn(e);
              }
          }
        }
      }).catch((e) => {
        throw ERROR_FACTORY.create("idb-open", {
          originalErrorMessage: e.message
        });
      });
    }
    return dbPromise;
  }
  async function readHeartbeatsFromIndexedDB(app) {
    try {
      const db = await getDbPromise();
      const tx = db.transaction(STORE_NAME);
      const result = await tx.objectStore(STORE_NAME).get(computeKey(app));
      await tx.done;
      return result;
    } catch (e) {
      if (e instanceof FirebaseError) {
        logger.warn(e.message);
      } else {
        const idbGetError = ERROR_FACTORY.create("idb-get", {
          originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
        });
        logger.warn(idbGetError.message);
      }
    }
  }
  async function writeHeartbeatsToIndexedDB(app, heartbeatObject) {
    try {
      const db = await getDbPromise();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const objectStore = tx.objectStore(STORE_NAME);
      await objectStore.put(heartbeatObject, computeKey(app));
      await tx.done;
    } catch (e) {
      if (e instanceof FirebaseError) {
        logger.warn(e.message);
      } else {
        const idbGetError = ERROR_FACTORY.create("idb-set", {
          originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
        });
        logger.warn(idbGetError.message);
      }
    }
  }
  function computeKey(app) {
    return `${app.name}!${app.options.appId}`;
  }
  /**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var MAX_HEADER_BYTES = 1024;
  var STORED_HEARTBEAT_RETENTION_MAX_MILLIS = 30 * 24 * 60 * 60 * 1e3;
  var HeartbeatServiceImpl = class {
    constructor(container) {
      this.container = container;
      this._heartbeatsCache = null;
      const app = this.container.getProvider("app").getImmediate();
      this._storage = new HeartbeatStorageImpl(app);
      this._heartbeatsCachePromise = this._storage.read().then((result) => {
        this._heartbeatsCache = result;
        return result;
      });
    }
    /**
     * Called to report a heartbeat. The function will generate
     * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
     * to IndexedDB.
     * Note that we only store one heartbeat per day. So if a heartbeat for today is
     * already logged, subsequent calls to this function in the same day will be ignored.
     */
    async triggerHeartbeat() {
      var _a, _b;
      try {
        const platformLogger = this.container.getProvider("platform-logger").getImmediate();
        const agent = platformLogger.getPlatformInfoString();
        const date = getUTCDateString();
        if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null) {
          this._heartbeatsCache = await this._heartbeatsCachePromise;
          if (((_b = this._heartbeatsCache) === null || _b === void 0 ? void 0 : _b.heartbeats) == null) {
            return;
          }
        }
        if (this._heartbeatsCache.lastSentHeartbeatDate === date || this._heartbeatsCache.heartbeats.some((singleDateHeartbeat) => singleDateHeartbeat.date === date)) {
          return;
        } else {
          this._heartbeatsCache.heartbeats.push({ date, agent });
        }
        this._heartbeatsCache.heartbeats = this._heartbeatsCache.heartbeats.filter((singleDateHeartbeat) => {
          const hbTimestamp = new Date(singleDateHeartbeat.date).valueOf();
          const now = Date.now();
          return now - hbTimestamp <= STORED_HEARTBEAT_RETENTION_MAX_MILLIS;
        });
        return this._storage.overwrite(this._heartbeatsCache);
      } catch (e) {
        logger.warn(e);
      }
    }
    /**
     * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
     * It also clears all heartbeats from memory as well as in IndexedDB.
     *
     * NOTE: Consuming product SDKs should not send the header if this method
     * returns an empty string.
     */
    async getHeartbeatsHeader() {
      var _a;
      try {
        if (this._heartbeatsCache === null) {
          await this._heartbeatsCachePromise;
        }
        if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null || this._heartbeatsCache.heartbeats.length === 0) {
          return "";
        }
        const date = getUTCDateString();
        const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
        const headerString = base64urlEncodeWithoutPadding(JSON.stringify({ version: 2, heartbeats: heartbeatsToSend }));
        this._heartbeatsCache.lastSentHeartbeatDate = date;
        if (unsentEntries.length > 0) {
          this._heartbeatsCache.heartbeats = unsentEntries;
          await this._storage.overwrite(this._heartbeatsCache);
        } else {
          this._heartbeatsCache.heartbeats = [];
          void this._storage.overwrite(this._heartbeatsCache);
        }
        return headerString;
      } catch (e) {
        logger.warn(e);
        return "";
      }
    }
  };
  function getUTCDateString() {
    const today = /* @__PURE__ */ new Date();
    return today.toISOString().substring(0, 10);
  }
  function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
    const heartbeatsToSend = [];
    let unsentEntries = heartbeatsCache.slice();
    for (const singleDateHeartbeat of heartbeatsCache) {
      const heartbeatEntry = heartbeatsToSend.find((hb) => hb.agent === singleDateHeartbeat.agent);
      if (!heartbeatEntry) {
        heartbeatsToSend.push({
          agent: singleDateHeartbeat.agent,
          dates: [singleDateHeartbeat.date]
        });
        if (countBytes(heartbeatsToSend) > maxSize) {
          heartbeatsToSend.pop();
          break;
        }
      } else {
        heartbeatEntry.dates.push(singleDateHeartbeat.date);
        if (countBytes(heartbeatsToSend) > maxSize) {
          heartbeatEntry.dates.pop();
          break;
        }
      }
      unsentEntries = unsentEntries.slice(1);
    }
    return {
      heartbeatsToSend,
      unsentEntries
    };
  }
  var HeartbeatStorageImpl = class {
    constructor(app) {
      this.app = app;
      this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
    }
    async runIndexedDBEnvironmentCheck() {
      if (!isIndexedDBAvailable()) {
        return false;
      } else {
        return validateIndexedDBOpenable().then(() => true).catch(() => false);
      }
    }
    /**
     * Read all heartbeats.
     */
    async read() {
      const canUseIndexedDB = await this._canUseIndexedDBPromise;
      if (!canUseIndexedDB) {
        return { heartbeats: [] };
      } else {
        const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
        if (idbHeartbeatObject === null || idbHeartbeatObject === void 0 ? void 0 : idbHeartbeatObject.heartbeats) {
          return idbHeartbeatObject;
        } else {
          return { heartbeats: [] };
        }
      }
    }
    // overwrite the storage with the provided heartbeats
    async overwrite(heartbeatsObject) {
      var _a;
      const canUseIndexedDB = await this._canUseIndexedDBPromise;
      if (!canUseIndexedDB) {
        return;
      } else {
        const existingHeartbeatsObject = await this.read();
        return writeHeartbeatsToIndexedDB(this.app, {
          lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
          heartbeats: heartbeatsObject.heartbeats
        });
      }
    }
    // add heartbeats
    async add(heartbeatsObject) {
      var _a;
      const canUseIndexedDB = await this._canUseIndexedDBPromise;
      if (!canUseIndexedDB) {
        return;
      } else {
        const existingHeartbeatsObject = await this.read();
        return writeHeartbeatsToIndexedDB(this.app, {
          lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
          heartbeats: [
            ...existingHeartbeatsObject.heartbeats,
            ...heartbeatsObject.heartbeats
          ]
        });
      }
    }
  };
  function countBytes(heartbeatsCache) {
    return base64urlEncodeWithoutPadding(
      // heartbeatsCache wrapper properties
      JSON.stringify({ version: 2, heartbeats: heartbeatsCache })
    ).length;
  }
  /**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  function registerCoreComponents(variant) {
    _registerComponent(new Component(
      "platform-logger",
      (container) => new PlatformLoggerServiceImpl(container),
      "PRIVATE"
      /* ComponentType.PRIVATE */
    ));
    _registerComponent(new Component(
      "heartbeat",
      (container) => new HeartbeatServiceImpl(container),
      "PRIVATE"
      /* ComponentType.PRIVATE */
    ));
    registerVersion(name$q, version$1, variant);
    registerVersion(name$q, version$1, "esm2017");
    registerVersion("fire-js", "");
  }
  registerCoreComponents("");
  var name = "firebase";
  var version = "11.0.2";
  /**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  registerVersion(name, version, "cdn");

  // firebase-auth.js
  var firebase_auth_exports = {};
  __export(firebase_auth_exports, {
    ActionCodeOperation: () => m,
    ActionCodeURL: () => ActionCodeURL,
    AuthCredential: () => AuthCredential,
    AuthErrorCodes: () => v,
    EmailAuthCredential: () => EmailAuthCredential,
    EmailAuthProvider: () => EmailAuthProvider,
    FacebookAuthProvider: () => FacebookAuthProvider,
    FactorId: () => l,
    GithubAuthProvider: () => GithubAuthProvider,
    GoogleAuthProvider: () => GoogleAuthProvider,
    OAuthCredential: () => OAuthCredential,
    OAuthProvider: () => OAuthProvider,
    OperationType: () => f,
    PhoneAuthCredential: () => PhoneAuthCredential,
    PhoneAuthProvider: () => PhoneAuthProvider,
    PhoneMultiFactorGenerator: () => PhoneMultiFactorGenerator,
    ProviderId: () => h,
    RecaptchaVerifier: () => RecaptchaVerifier,
    SAMLAuthProvider: () => SAMLAuthProvider,
    SignInMethod: () => p,
    TotpMultiFactorGenerator: () => TotpMultiFactorGenerator,
    TotpSecret: () => TotpSecret,
    TwitterAuthProvider: () => TwitterAuthProvider,
    applyActionCode: () => applyActionCode,
    beforeAuthStateChanged: () => beforeAuthStateChanged,
    browserLocalPersistence: () => C,
    browserPopupRedirectResolver: () => z,
    browserSessionPersistence: () => k,
    checkActionCode: () => checkActionCode,
    confirmPasswordReset: () => confirmPasswordReset,
    connectAuthEmulator: () => connectAuthEmulator,
    createUserWithEmailAndPassword: () => createUserWithEmailAndPassword,
    debugErrorMap: () => g,
    deleteUser: () => deleteUser,
    fetchSignInMethodsForEmail: () => fetchSignInMethodsForEmail,
    getAdditionalUserInfo: () => getAdditionalUserInfo,
    getAuth: () => getAuth,
    getIdToken: () => getIdToken,
    getIdTokenResult: () => getIdTokenResult,
    getMultiFactorResolver: () => getMultiFactorResolver,
    getRedirectResult: () => getRedirectResult,
    inMemoryPersistence: () => w,
    indexedDBLocalPersistence: () => O,
    initializeAuth: () => initializeAuth,
    initializeRecaptchaConfig: () => initializeRecaptchaConfig,
    isSignInWithEmailLink: () => isSignInWithEmailLink,
    linkWithCredential: () => linkWithCredential,
    linkWithPhoneNumber: () => linkWithPhoneNumber,
    linkWithPopup: () => linkWithPopup,
    linkWithRedirect: () => linkWithRedirect,
    multiFactor: () => multiFactor,
    onAuthStateChanged: () => onAuthStateChanged,
    onIdTokenChanged: () => onIdTokenChanged,
    parseActionCodeURL: () => parseActionCodeURL,
    prodErrorMap: () => _,
    reauthenticateWithCredential: () => reauthenticateWithCredential,
    reauthenticateWithPhoneNumber: () => reauthenticateWithPhoneNumber,
    reauthenticateWithPopup: () => reauthenticateWithPopup,
    reauthenticateWithRedirect: () => reauthenticateWithRedirect,
    reload: () => reload,
    revokeAccessToken: () => revokeAccessToken,
    sendEmailVerification: () => sendEmailVerification,
    sendPasswordResetEmail: () => sendPasswordResetEmail,
    sendSignInLinkToEmail: () => sendSignInLinkToEmail,
    setPersistence: () => setPersistence,
    signInAnonymously: () => signInAnonymously,
    signInWithCredential: () => signInWithCredential,
    signInWithCustomToken: () => signInWithCustomToken,
    signInWithEmailAndPassword: () => signInWithEmailAndPassword,
    signInWithEmailLink: () => signInWithEmailLink,
    signInWithPhoneNumber: () => signInWithPhoneNumber,
    signInWithPopup: () => signInWithPopup,
    signInWithRedirect: () => signInWithRedirect,
    signOut: () => signOut,
    unlink: () => unlink,
    updateCurrentUser: () => updateCurrentUser,
    updateEmail: () => updateEmail,
    updatePassword: () => updatePassword,
    updatePhoneNumber: () => updatePhoneNumber,
    updateProfile: () => updateProfile,
    useDeviceLanguage: () => useDeviceLanguage,
    validatePassword: () => validatePassword,
    verifyBeforeUpdateEmail: () => verifyBeforeUpdateEmail,
    verifyPasswordResetCode: () => verifyPasswordResetCode
  });
  var s = { byteToCharMap_: null, charToByteMap_: null, byteToCharMapWebSafe_: null, charToByteMapWebSafe_: null, ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  }, get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  }, HAS_NATIVE_SUPPORT: "function" == typeof atob, encodeByteArray(e, t) {
    if (!Array.isArray(e)) throw Error("encodeByteArray takes an array as a parameter");
    this.init_();
    const r = t ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, n = [];
    for (let t2 = 0; t2 < e.length; t2 += 3) {
      const i2 = e[t2], s3 = t2 + 1 < e.length, o3 = s3 ? e[t2 + 1] : 0, a3 = t2 + 2 < e.length, c3 = a3 ? e[t2 + 2] : 0, u3 = i2 >> 2, d3 = (3 & i2) << 4 | o3 >> 4;
      let l3 = (15 & o3) << 2 | c3 >> 6, h3 = 63 & c3;
      a3 || (h3 = 64, s3 || (l3 = 64)), n.push(r[u3], r[d3], r[l3], r[h3]);
    }
    return n.join("");
  }, encodeString(e, t) {
    return this.HAS_NATIVE_SUPPORT && !t ? btoa(e) : this.encodeByteArray((function(e2) {
      const t2 = [];
      let r = 0;
      for (let n = 0; n < e2.length; n++) {
        let i2 = e2.charCodeAt(n);
        i2 < 128 ? t2[r++] = i2 : i2 < 2048 ? (t2[r++] = i2 >> 6 | 192, t2[r++] = 63 & i2 | 128) : 55296 == (64512 & i2) && n + 1 < e2.length && 56320 == (64512 & e2.charCodeAt(n + 1)) ? (i2 = 65536 + ((1023 & i2) << 10) + (1023 & e2.charCodeAt(++n)), t2[r++] = i2 >> 18 | 240, t2[r++] = i2 >> 12 & 63 | 128, t2[r++] = i2 >> 6 & 63 | 128, t2[r++] = 63 & i2 | 128) : (t2[r++] = i2 >> 12 | 224, t2[r++] = i2 >> 6 & 63 | 128, t2[r++] = 63 & i2 | 128);
      }
      return t2;
    })(e), t);
  }, decodeString(e, t) {
    return this.HAS_NATIVE_SUPPORT && !t ? atob(e) : (function(e2) {
      const t2 = [];
      let r = 0, n = 0;
      for (; r < e2.length; ) {
        const i2 = e2[r++];
        if (i2 < 128) t2[n++] = String.fromCharCode(i2);
        else if (i2 > 191 && i2 < 224) {
          const s3 = e2[r++];
          t2[n++] = String.fromCharCode((31 & i2) << 6 | 63 & s3);
        } else if (i2 > 239 && i2 < 365) {
          const s3 = ((7 & i2) << 18 | (63 & e2[r++]) << 12 | (63 & e2[r++]) << 6 | 63 & e2[r++]) - 65536;
          t2[n++] = String.fromCharCode(55296 + (s3 >> 10)), t2[n++] = String.fromCharCode(56320 + (1023 & s3));
        } else {
          const s3 = e2[r++], o3 = e2[r++];
          t2[n++] = String.fromCharCode((15 & i2) << 12 | (63 & s3) << 6 | 63 & o3);
        }
      }
      return t2.join("");
    })(this.decodeStringToByteArray(e, t));
  }, decodeStringToByteArray(e, t) {
    this.init_();
    const r = t ? this.charToByteMapWebSafe_ : this.charToByteMap_, n = [];
    for (let t2 = 0; t2 < e.length; ) {
      const i2 = r[e.charAt(t2++)], s3 = t2 < e.length ? r[e.charAt(t2)] : 0;
      ++t2;
      const o3 = t2 < e.length ? r[e.charAt(t2)] : 64;
      ++t2;
      const a3 = t2 < e.length ? r[e.charAt(t2)] : 64;
      if (++t2, null == i2 || null == s3 || null == o3 || null == a3) throw new DecodeBase64StringError2();
      const c3 = i2 << 2 | s3 >> 4;
      if (n.push(c3), 64 !== o3) {
        const e2 = s3 << 4 & 240 | o3 >> 2;
        if (n.push(e2), 64 !== a3) {
          const e3 = o3 << 6 & 192 | a3;
          n.push(e3);
        }
      }
    }
    return n;
  }, init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
      for (let e = 0; e < this.ENCODED_VALS.length; e++) this.byteToCharMap_[e] = this.ENCODED_VALS.charAt(e), this.charToByteMap_[this.byteToCharMap_[e]] = e, this.byteToCharMapWebSafe_[e] = this.ENCODED_VALS_WEBSAFE.charAt(e), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]] = e, e >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)] = e, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)] = e);
    }
  } };
  var DecodeBase64StringError2 = class extends Error {
    constructor() {
      super(...arguments), this.name = "DecodeBase64StringError";
    }
  };
  var base64Decode2 = function(e) {
    try {
      return s.decodeString(e, true);
    } catch (e2) {
      console.error("base64Decode failed: ", e2);
    }
    return null;
  };
  var getDefaultsFromGlobal2 = () => (function getGlobal2() {
    if ("undefined" != typeof self) return self;
    if ("undefined" != typeof window) return window;
    if ("undefined" != typeof global) return global;
    throw new Error("Unable to locate global object.");
  })().__FIREBASE_DEFAULTS__;
  var getDefaults2 = () => {
    try {
      return getDefaultsFromGlobal2() || (() => {
        if ("undefined" == typeof process || void 0 === process.env) return;
        const e = process.env.__FIREBASE_DEFAULTS__;
        return e ? JSON.parse(e) : void 0;
      })() || (() => {
        if ("undefined" == typeof document) return;
        let e;
        try {
          e = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
        } catch (e2) {
          return;
        }
        const t = e && base64Decode2(e[1]);
        return t && JSON.parse(t);
      })();
    } catch (e) {
      return void console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
    }
  };
  var getExperimentalSetting = (e) => {
    var t;
    return null === (t = getDefaults2()) || void 0 === t ? void 0 : t[`_${e}`];
  };
  function getUA() {
    return "undefined" != typeof navigator && "string" == typeof navigator.userAgent ? navigator.userAgent : "";
  }
  var FirebaseError2 = class _FirebaseError extends Error {
    constructor(e, t, r) {
      super(t), this.code = e, this.customData = r, this.name = "FirebaseError", Object.setPrototypeOf(this, _FirebaseError.prototype), Error.captureStackTrace && Error.captureStackTrace(this, ErrorFactory2.prototype.create);
    }
  };
  var ErrorFactory2 = class {
    constructor(e, t, r) {
      this.service = e, this.serviceName = t, this.errors = r;
    }
    create(e, ...t) {
      const r = t[0] || {}, n = `${this.service}/${e}`, i2 = this.errors[e], s3 = i2 ? (function replaceTemplate2(e2, t2) {
        return e2.replace(o, ((e3, r2) => {
          const n2 = t2[r2];
          return null != n2 ? String(n2) : `<${r2}?>`;
        }));
      })(i2, r) : "Error", a3 = `${this.serviceName}: ${s3} (${n}).`;
      return new FirebaseError2(n, a3, r);
    }
  };
  var o = /\{\$([^}]+)}/g;
  function deepEqual2(e, t) {
    if (e === t) return true;
    const r = Object.keys(e), n = Object.keys(t);
    for (const i2 of r) {
      if (!n.includes(i2)) return false;
      const r2 = e[i2], s3 = t[i2];
      if (isObject2(r2) && isObject2(s3)) {
        if (!deepEqual2(r2, s3)) return false;
      } else if (r2 !== s3) return false;
    }
    for (const e2 of n) if (!r.includes(e2)) return false;
    return true;
  }
  function isObject2(e) {
    return null !== e && "object" == typeof e;
  }
  function querystring(e) {
    const t = [];
    for (const [r, n] of Object.entries(e)) Array.isArray(n) ? n.forEach(((e2) => {
      t.push(encodeURIComponent(r) + "=" + encodeURIComponent(e2));
    })) : t.push(encodeURIComponent(r) + "=" + encodeURIComponent(n));
    return t.length ? "&" + t.join("&") : "";
  }
  function querystringDecode(e) {
    const t = {};
    return e.replace(/^\?/, "").split("&").forEach(((e2) => {
      if (e2) {
        const [r, n] = e2.split("=");
        t[decodeURIComponent(r)] = decodeURIComponent(n);
      }
    })), t;
  }
  function extractQuerystring(e) {
    const t = e.indexOf("?");
    if (!t) return "";
    const r = e.indexOf("#", t);
    return e.substring(t, r > 0 ? r : void 0);
  }
  var ObserverProxy = class {
    constructor(e, t) {
      this.observers = [], this.unsubscribes = [], this.observerCount = 0, this.task = Promise.resolve(), this.finalized = false, this.onNoObservers = t, this.task.then((() => {
        e(this);
      })).catch(((e2) => {
        this.error(e2);
      }));
    }
    next(e) {
      this.forEachObserver(((t) => {
        t.next(e);
      }));
    }
    error(e) {
      this.forEachObserver(((t) => {
        t.error(e);
      })), this.close(e);
    }
    complete() {
      this.forEachObserver(((e) => {
        e.complete();
      })), this.close();
    }
    subscribe(e, t, r) {
      let n;
      if (void 0 === e && void 0 === t && void 0 === r) throw new Error("Missing Observer.");
      n = (function implementsAnyMethods(e2, t2) {
        if ("object" != typeof e2 || null === e2) return false;
        for (const r2 of t2) if (r2 in e2 && "function" == typeof e2[r2]) return true;
        return false;
      })(e, ["next", "error", "complete"]) ? e : { next: e, error: t, complete: r }, void 0 === n.next && (n.next = noop), void 0 === n.error && (n.error = noop), void 0 === n.complete && (n.complete = noop);
      const i2 = this.unsubscribeOne.bind(this, this.observers.length);
      return this.finalized && this.task.then((() => {
        try {
          this.finalError ? n.error(this.finalError) : n.complete();
        } catch (e2) {
        }
      })), this.observers.push(n), i2;
    }
    unsubscribeOne(e) {
      void 0 !== this.observers && void 0 !== this.observers[e] && (delete this.observers[e], this.observerCount -= 1, 0 === this.observerCount && void 0 !== this.onNoObservers && this.onNoObservers(this));
    }
    forEachObserver(e) {
      if (!this.finalized) for (let t = 0; t < this.observers.length; t++) this.sendOne(t, e);
    }
    sendOne(e, t) {
      this.task.then((() => {
        if (void 0 !== this.observers && void 0 !== this.observers[e]) try {
          t(this.observers[e]);
        } catch (e2) {
          "undefined" != typeof console && console.error && console.error(e2);
        }
      }));
    }
    close(e) {
      this.finalized || (this.finalized = true, void 0 !== e && (this.finalError = e), this.task.then((() => {
        this.observers = void 0, this.onNoObservers = void 0;
      })));
    }
  };
  function noop() {
  }
  function getModularInstance(e) {
    return e && e._delegate ? e._delegate : e;
  }
  var a;
  !(function(e) {
    e[e.DEBUG = 0] = "DEBUG", e[e.VERBOSE = 1] = "VERBOSE", e[e.INFO = 2] = "INFO", e[e.WARN = 3] = "WARN", e[e.ERROR = 4] = "ERROR", e[e.SILENT = 5] = "SILENT";
  })(a || (a = {}));
  var c = { debug: a.DEBUG, verbose: a.VERBOSE, info: a.INFO, warn: a.WARN, error: a.ERROR, silent: a.SILENT };
  var u = a.INFO;
  var d = { [a.DEBUG]: "log", [a.VERBOSE]: "log", [a.INFO]: "info", [a.WARN]: "warn", [a.ERROR]: "error" };
  var defaultLogHandler2 = (e, t, ...r) => {
    if (t < e.logLevel) return;
    const n = (/* @__PURE__ */ new Date()).toISOString(), i2 = d[t];
    if (!i2) throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`);
    console[i2](`[${n}]  ${e.name}:`, ...r);
  };
  function __rest(e, t) {
    var r = {};
    for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
    if (null != e && "function" == typeof Object.getOwnPropertySymbols) {
      var i2 = 0;
      for (n = Object.getOwnPropertySymbols(e); i2 < n.length; i2++) t.indexOf(n[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(e, n[i2]) && (r[n[i2]] = e[n[i2]]);
    }
    return r;
  }
  var Component2 = class {
    constructor(e, t, r) {
      this.name = e, this.instanceFactory = t, this.type = r, this.multipleInstances = false, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
    }
    setInstantiationMode(e) {
      return this.instantiationMode = e, this;
    }
    setMultipleInstances(e) {
      return this.multipleInstances = e, this;
    }
    setServiceProps(e) {
      return this.serviceProps = e, this;
    }
    setInstanceCreatedCallback(e) {
      return this.onInstanceCreated = e, this;
    }
  };
  var l = { PHONE: "phone", TOTP: "totp" };
  var h = { FACEBOOK: "facebook.com", GITHUB: "github.com", GOOGLE: "google.com", PASSWORD: "password", PHONE: "phone", TWITTER: "twitter.com" };
  var p = { EMAIL_LINK: "emailLink", EMAIL_PASSWORD: "password", FACEBOOK: "facebook.com", GITHUB: "github.com", GOOGLE: "google.com", PHONE: "phone", TWITTER: "twitter.com" };
  var f = { LINK: "link", REAUTHENTICATE: "reauthenticate", SIGN_IN: "signIn" };
  var m = { EMAIL_SIGNIN: "EMAIL_SIGNIN", PASSWORD_RESET: "PASSWORD_RESET", RECOVER_EMAIL: "RECOVER_EMAIL", REVERT_SECOND_FACTOR_ADDITION: "REVERT_SECOND_FACTOR_ADDITION", VERIFY_AND_CHANGE_EMAIL: "VERIFY_AND_CHANGE_EMAIL", VERIFY_EMAIL: "VERIFY_EMAIL" };
  function _prodErrorMap() {
    return { "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK." };
  }
  var g = function _debugErrorMap() {
    return { "admin-restricted-operation": "This operation is restricted to administrators only.", "argument-error": "", "app-not-authorized": "This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.", "app-not-installed": "The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.", "captcha-check-failed": "The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.", "code-expired": "The SMS code has expired. Please re-send the verification code to try again.", "cordova-not-ready": "Cordova framework is not ready.", "cors-unsupported": "This browser is not supported.", "credential-already-in-use": "This credential is already associated with a different user account.", "custom-token-mismatch": "The custom token corresponds to a different audience.", "requires-recent-login": "This operation is sensitive and requires recent authentication. Log in again before retrying this request.", "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.", "dynamic-link-not-activated": "Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.", "email-change-needs-verification": "Multi-factor users must always have a verified email.", "email-already-in-use": "The email address is already in use by another account.", "emulator-config-failed": 'Auth instance has already been used to make a network call. Auth can no longer be configured to use the emulator. Try calling "connectAuthEmulator()" sooner.', "expired-action-code": "The action code has expired.", "cancelled-popup-request": "This operation has been cancelled due to another conflicting popup being opened.", "internal-error": "An internal AuthError has occurred.", "invalid-app-credential": "The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.", "invalid-app-id": "The mobile app identifier is not registered for the current project.", "invalid-user-token": "This user's credential isn't valid for this project. This can happen if the user's token has been tampered with, or if the user isn't for the project associated with this API key.", "invalid-auth-event": "An internal AuthError has occurred.", "invalid-verification-code": "The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure to use the verification code provided by the user.", "invalid-continue-uri": "The continue URL provided in the request is invalid.", "invalid-cordova-configuration": "The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.", "invalid-custom-token": "The custom token format is incorrect. Please check the documentation.", "invalid-dynamic-link-domain": "The provided dynamic link domain is not configured or authorized for the current project.", "invalid-email": "The email address is badly formatted.", "invalid-emulator-scheme": "Emulator URL must start with a valid scheme (http:// or https://).", "invalid-api-key": "Your API key is invalid, please check you have copied it correctly.", "invalid-cert-hash": "The SHA-1 certificate hash provided is invalid.", "invalid-credential": "The supplied auth credential is incorrect, malformed or has expired.", "invalid-message-payload": "The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.", "invalid-multi-factor-session": "The request does not contain a valid proof of first factor successful sign-in.", "invalid-oauth-provider": "EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.", "invalid-oauth-client-id": "The OAuth client ID provided is either invalid or does not match the specified API key.", "unauthorized-domain": "This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.", "invalid-action-code": "The action code is invalid. This can happen if the code is malformed, expired, or has already been used.", "wrong-password": "The password is invalid or the user does not have a password.", "invalid-persistence-type": "The specified persistence type is invalid. It can only be local, session or none.", "invalid-phone-number": "The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].", "invalid-provider-id": "The specified provider ID is invalid.", "invalid-recipient-email": "The email corresponding to this action failed to send as the provided recipient email address is invalid.", "invalid-sender": "The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.", "invalid-verification-id": "The verification ID used to create the phone auth credential is invalid.", "invalid-tenant-id": "The Auth instance's tenant ID is invalid.", "login-blocked": "Login blocked by user-provided method: {$originalMessage}", "missing-android-pkg-name": "An Android Package Name must be provided if the Android App is required to be installed.", "auth-domain-config-required": "Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.", "missing-app-credential": "The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.", "missing-verification-code": "The phone auth credential was created with an empty SMS verification code.", "missing-continue-uri": "A continue URL must be provided in the request.", "missing-iframe-start": "An internal AuthError has occurred.", "missing-ios-bundle-id": "An iOS Bundle ID must be provided if an App Store ID is provided.", "missing-or-invalid-nonce": "The request does not contain a valid nonce. This can occur if the SHA-256 hash of the provided raw nonce does not match the hashed nonce in the ID token payload.", "missing-password": "A non-empty password must be provided", "missing-multi-factor-info": "No second factor identifier is provided.", "missing-multi-factor-session": "The request is missing proof of first factor successful sign-in.", "missing-phone-number": "To send verification codes, provide a phone number for the recipient.", "missing-verification-id": "The phone auth credential was created with an empty verification ID.", "app-deleted": "This instance of FirebaseApp has been deleted.", "multi-factor-info-not-found": "The user does not have a second factor matching the identifier provided.", "multi-factor-auth-required": "Proof of ownership of a second factor is required to complete sign-in.", "account-exists-with-different-credential": "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.", "network-request-failed": "A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred.", "no-auth-event": "An internal AuthError has occurred.", "no-such-provider": "User was not linked to an account with the given provider.", "null-user": "A null user object was provided as the argument for an operation which requires a non-null user object.", "operation-not-allowed": "The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.", "operation-not-supported-in-this-environment": 'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.', "popup-blocked": "Unable to establish a connection with the popup. It may have been blocked by the browser.", "popup-closed-by-user": "The popup has been closed by the user before finalizing the operation.", "provider-already-linked": "User can only be linked to one identity for the given provider.", "quota-exceeded": "The project's quota for this operation has been exceeded.", "redirect-cancelled-by-user": "The redirect operation has been cancelled by the user before finalizing.", "redirect-operation-pending": "A redirect sign-in operation is already pending.", "rejected-credential": "The request contains malformed or mismatching credentials.", "second-factor-already-in-use": "The second factor is already enrolled on this account.", "maximum-second-factor-count-exceeded": "The maximum allowed number of second factors on a user has been exceeded.", "tenant-id-mismatch": "The provided tenant ID does not match the Auth instance's tenant ID", timeout: "The operation has timed out.", "user-token-expired": "The user's credential is no longer valid. The user must sign in again.", "too-many-requests": "We have blocked all requests from this device due to unusual activity. Try again later.", "unauthorized-continue-uri": "The domain of the continue URL is not whitelisted.  Please whitelist the domain in the Firebase console.", "unsupported-first-factor": "Enrolling a second factor or signing in with a multi-factor account requires sign-in with a supported first factor.", "unsupported-persistence-type": "The current environment does not support the specified persistence type.", "unsupported-tenant-operation": "This operation is not supported in a multi-tenant context.", "unverified-email": "The operation requires a verified email.", "user-cancelled": "The user did not grant your application the permissions it requested.", "user-not-found": "There is no user record corresponding to this identifier. The user may have been deleted.", "user-disabled": "The user account has been disabled by an administrator.", "user-mismatch": "The supplied credentials do not correspond to the previously signed in user.", "user-signed-out": "", "weak-password": "The password must be 6 characters long or more.", "web-storage-unsupported": "This browser is not supported or 3rd party cookies and data may be disabled.", "already-initialized": "initializeAuth() has already been called with different options. To avoid this error, call initializeAuth() with the same options as when it was originally called, or call getAuth() to return the already initialized instance.", "missing-recaptcha-token": "The reCAPTCHA token is missing when sending request to the backend.", "invalid-recaptcha-token": "The reCAPTCHA token is invalid when sending request to the backend.", "invalid-recaptcha-action": "The reCAPTCHA action is invalid when sending request to the backend.", "recaptcha-not-enabled": "reCAPTCHA Enterprise integration is not enabled for this project.", "missing-client-type": "The reCAPTCHA client type is missing when sending request to the backend.", "missing-recaptcha-version": "The reCAPTCHA version is missing when sending request to the backend.", "invalid-req-type": "Invalid request parameters.", "invalid-recaptcha-version": "The reCAPTCHA version is invalid when sending request to the backend.", "unsupported-password-policy-schema-version": "The password policy received from the backend uses a schema version that is not supported by this version of the Firebase SDK.", "password-does-not-meet-requirements": "The password does not meet the requirements." };
  };
  var _ = _prodErrorMap;
  var I = new ErrorFactory2("auth", "Firebase", { "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK." });
  var v = { ADMIN_ONLY_OPERATION: "auth/admin-restricted-operation", ARGUMENT_ERROR: "auth/argument-error", APP_NOT_AUTHORIZED: "auth/app-not-authorized", APP_NOT_INSTALLED: "auth/app-not-installed", CAPTCHA_CHECK_FAILED: "auth/captcha-check-failed", CODE_EXPIRED: "auth/code-expired", CORDOVA_NOT_READY: "auth/cordova-not-ready", CORS_UNSUPPORTED: "auth/cors-unsupported", CREDENTIAL_ALREADY_IN_USE: "auth/credential-already-in-use", CREDENTIAL_MISMATCH: "auth/custom-token-mismatch", CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "auth/requires-recent-login", DEPENDENT_SDK_INIT_BEFORE_AUTH: "auth/dependent-sdk-initialized-before-auth", DYNAMIC_LINK_NOT_ACTIVATED: "auth/dynamic-link-not-activated", EMAIL_CHANGE_NEEDS_VERIFICATION: "auth/email-change-needs-verification", EMAIL_EXISTS: "auth/email-already-in-use", EMULATOR_CONFIG_FAILED: "auth/emulator-config-failed", EXPIRED_OOB_CODE: "auth/expired-action-code", EXPIRED_POPUP_REQUEST: "auth/cancelled-popup-request", INTERNAL_ERROR: "auth/internal-error", INVALID_API_KEY: "auth/invalid-api-key", INVALID_APP_CREDENTIAL: "auth/invalid-app-credential", INVALID_APP_ID: "auth/invalid-app-id", INVALID_AUTH: "auth/invalid-user-token", INVALID_AUTH_EVENT: "auth/invalid-auth-event", INVALID_CERT_HASH: "auth/invalid-cert-hash", INVALID_CODE: "auth/invalid-verification-code", INVALID_CONTINUE_URI: "auth/invalid-continue-uri", INVALID_CORDOVA_CONFIGURATION: "auth/invalid-cordova-configuration", INVALID_CUSTOM_TOKEN: "auth/invalid-custom-token", INVALID_DYNAMIC_LINK_DOMAIN: "auth/invalid-dynamic-link-domain", INVALID_EMAIL: "auth/invalid-email", INVALID_EMULATOR_SCHEME: "auth/invalid-emulator-scheme", INVALID_IDP_RESPONSE: "auth/invalid-credential", INVALID_LOGIN_CREDENTIALS: "auth/invalid-credential", INVALID_MESSAGE_PAYLOAD: "auth/invalid-message-payload", INVALID_MFA_SESSION: "auth/invalid-multi-factor-session", INVALID_OAUTH_CLIENT_ID: "auth/invalid-oauth-client-id", INVALID_OAUTH_PROVIDER: "auth/invalid-oauth-provider", INVALID_OOB_CODE: "auth/invalid-action-code", INVALID_ORIGIN: "auth/unauthorized-domain", INVALID_PASSWORD: "auth/wrong-password", INVALID_PERSISTENCE: "auth/invalid-persistence-type", INVALID_PHONE_NUMBER: "auth/invalid-phone-number", INVALID_PROVIDER_ID: "auth/invalid-provider-id", INVALID_RECIPIENT_EMAIL: "auth/invalid-recipient-email", INVALID_SENDER: "auth/invalid-sender", INVALID_SESSION_INFO: "auth/invalid-verification-id", INVALID_TENANT_ID: "auth/invalid-tenant-id", MFA_INFO_NOT_FOUND: "auth/multi-factor-info-not-found", MFA_REQUIRED: "auth/multi-factor-auth-required", MISSING_ANDROID_PACKAGE_NAME: "auth/missing-android-pkg-name", MISSING_APP_CREDENTIAL: "auth/missing-app-credential", MISSING_AUTH_DOMAIN: "auth/auth-domain-config-required", MISSING_CODE: "auth/missing-verification-code", MISSING_CONTINUE_URI: "auth/missing-continue-uri", MISSING_IFRAME_START: "auth/missing-iframe-start", MISSING_IOS_BUNDLE_ID: "auth/missing-ios-bundle-id", MISSING_OR_INVALID_NONCE: "auth/missing-or-invalid-nonce", MISSING_MFA_INFO: "auth/missing-multi-factor-info", MISSING_MFA_SESSION: "auth/missing-multi-factor-session", MISSING_PHONE_NUMBER: "auth/missing-phone-number", MISSING_SESSION_INFO: "auth/missing-verification-id", MODULE_DESTROYED: "auth/app-deleted", NEED_CONFIRMATION: "auth/account-exists-with-different-credential", NETWORK_REQUEST_FAILED: "auth/network-request-failed", NULL_USER: "auth/null-user", NO_AUTH_EVENT: "auth/no-auth-event", NO_SUCH_PROVIDER: "auth/no-such-provider", OPERATION_NOT_ALLOWED: "auth/operation-not-allowed", OPERATION_NOT_SUPPORTED: "auth/operation-not-supported-in-this-environment", POPUP_BLOCKED: "auth/popup-blocked", POPUP_CLOSED_BY_USER: "auth/popup-closed-by-user", PROVIDER_ALREADY_LINKED: "auth/provider-already-linked", QUOTA_EXCEEDED: "auth/quota-exceeded", REDIRECT_CANCELLED_BY_USER: "auth/redirect-cancelled-by-user", REDIRECT_OPERATION_PENDING: "auth/redirect-operation-pending", REJECTED_CREDENTIAL: "auth/rejected-credential", SECOND_FACTOR_ALREADY_ENROLLED: "auth/second-factor-already-in-use", SECOND_FACTOR_LIMIT_EXCEEDED: "auth/maximum-second-factor-count-exceeded", TENANT_ID_MISMATCH: "auth/tenant-id-mismatch", TIMEOUT: "auth/timeout", TOKEN_EXPIRED: "auth/user-token-expired", TOO_MANY_ATTEMPTS_TRY_LATER: "auth/too-many-requests", UNAUTHORIZED_DOMAIN: "auth/unauthorized-continue-uri", UNSUPPORTED_FIRST_FACTOR: "auth/unsupported-first-factor", UNSUPPORTED_PERSISTENCE: "auth/unsupported-persistence-type", UNSUPPORTED_TENANT_OPERATION: "auth/unsupported-tenant-operation", UNVERIFIED_EMAIL: "auth/unverified-email", USER_CANCELLED: "auth/user-cancelled", USER_DELETED: "auth/user-not-found", USER_DISABLED: "auth/user-disabled", USER_MISMATCH: "auth/user-mismatch", USER_SIGNED_OUT: "auth/user-signed-out", WEAK_PASSWORD: "auth/weak-password", WEB_STORAGE_UNSUPPORTED: "auth/web-storage-unsupported", ALREADY_INITIALIZED: "auth/already-initialized", RECAPTCHA_NOT_ENABLED: "auth/recaptcha-not-enabled", MISSING_RECAPTCHA_TOKEN: "auth/missing-recaptcha-token", INVALID_RECAPTCHA_TOKEN: "auth/invalid-recaptcha-token", INVALID_RECAPTCHA_ACTION: "auth/invalid-recaptcha-action", MISSING_CLIENT_TYPE: "auth/missing-client-type", MISSING_RECAPTCHA_VERSION: "auth/missing-recaptcha-version", INVALID_RECAPTCHA_VERSION: "auth/invalid-recaptcha-version", INVALID_REQ_TYPE: "auth/invalid-req-type" };
  var E = new class Logger2 {
    constructor(e) {
      this.name = e, this._logLevel = u, this._logHandler = defaultLogHandler2, this._userLogHandler = null;
    }
    get logLevel() {
      return this._logLevel;
    }
    set logLevel(e) {
      if (!(e in a)) throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
      this._logLevel = e;
    }
    setLogLevel(e) {
      this._logLevel = "string" == typeof e ? c[e] : e;
    }
    get logHandler() {
      return this._logHandler;
    }
    set logHandler(e) {
      if ("function" != typeof e) throw new TypeError("Value assigned to `logHandler` must be a function");
      this._logHandler = e;
    }
    get userLogHandler() {
      return this._userLogHandler;
    }
    set userLogHandler(e) {
      this._userLogHandler = e;
    }
    debug(...e) {
      this._userLogHandler && this._userLogHandler(this, a.DEBUG, ...e), this._logHandler(this, a.DEBUG, ...e);
    }
    log(...e) {
      this._userLogHandler && this._userLogHandler(this, a.VERBOSE, ...e), this._logHandler(this, a.VERBOSE, ...e);
    }
    info(...e) {
      this._userLogHandler && this._userLogHandler(this, a.INFO, ...e), this._logHandler(this, a.INFO, ...e);
    }
    warn(...e) {
      this._userLogHandler && this._userLogHandler(this, a.WARN, ...e), this._logHandler(this, a.WARN, ...e);
    }
    error(...e) {
      this._userLogHandler && this._userLogHandler(this, a.ERROR, ...e), this._logHandler(this, a.ERROR, ...e);
    }
  }("@firebase/auth");
  function _logError(e, ...t) {
    E.logLevel <= a.ERROR && E.error(`Auth (${SDK_VERSION}): ${e}`, ...t);
  }
  function _fail(e, ...t) {
    throw createErrorInternal(e, ...t);
  }
  function _createError(e, ...t) {
    return createErrorInternal(e, ...t);
  }
  function _errorWithCustomMessage(e, t, r) {
    const n = Object.assign(Object.assign({}, _()), { [t]: r });
    return new ErrorFactory2("auth", "Firebase", n).create(t, { appName: e.name });
  }
  function _serverAppCurrentUserOperationNotSupportedError(e) {
    return _errorWithCustomMessage(e, "operation-not-supported-in-this-environment", "Operations that alter the current user are not supported in conjunction with FirebaseServerApp");
  }
  function _assertInstanceOf(e, t, r) {
    if (!(t instanceof r)) throw r.name !== t.constructor.name && _fail(e, "argument-error"), _errorWithCustomMessage(e, "argument-error", `Type of ${t.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`);
  }
  function createErrorInternal(e, ...t) {
    if ("string" != typeof e) {
      const r = t[0], n = [...t.slice(1)];
      return n[0] && (n[0].appName = e.name), e._errorFactory.create(r, ...n);
    }
    return I.create(e, ...t);
  }
  function _assert(e, t, ...r) {
    if (!e) throw createErrorInternal(t, ...r);
  }
  function debugFail(e) {
    const t = "INTERNAL ASSERTION FAILED: " + e;
    throw _logError(t), new Error(t);
  }
  function debugAssert(e, t) {
    e || debugFail(t);
  }
  function _getCurrentUrl() {
    var e;
    return "undefined" != typeof self && (null === (e = self.location) || void 0 === e ? void 0 : e.href) || "";
  }
  function _isHttpOrHttps() {
    return "http:" === _getCurrentScheme() || "https:" === _getCurrentScheme();
  }
  function _getCurrentScheme() {
    var e;
    return "undefined" != typeof self && (null === (e = self.location) || void 0 === e ? void 0 : e.protocol) || null;
  }
  function _isOnline() {
    return !("undefined" != typeof navigator && navigator && "onLine" in navigator && "boolean" == typeof navigator.onLine && (_isHttpOrHttps() || (function isBrowserExtension() {
      const e = "object" == typeof chrome ? chrome.runtime : "object" == typeof browser ? browser.runtime : void 0;
      return "object" == typeof e && void 0 !== e.id;
    })() || "connection" in navigator)) || navigator.onLine;
  }
  var Delay = class {
    constructor(e, t) {
      this.shortDelay = e, this.longDelay = t, debugAssert(t > e, "Short delay should be less than long delay!"), this.isMobile = (function isMobileCordova2() {
        return "undefined" != typeof window && !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA());
      })() || (function isReactNative() {
        return "object" == typeof navigator && "ReactNative" === navigator.product;
      })();
    }
    get() {
      return _isOnline() ? this.isMobile ? this.longDelay : this.shortDelay : Math.min(5e3, this.shortDelay);
    }
  };
  function _emulatorUrl(e, t) {
    debugAssert(e.emulator, "Emulator should always be set here");
    const { url: r } = e.emulator;
    return t ? `${r}${t.startsWith("/") ? t.slice(1) : t}` : r;
  }
  var FetchProvider = class {
    static initialize(e, t, r) {
      this.fetchImpl = e, t && (this.headersImpl = t), r && (this.responseImpl = r);
    }
    static fetch() {
      return this.fetchImpl ? this.fetchImpl : "undefined" != typeof self && "fetch" in self ? self.fetch : "undefined" != typeof globalThis && globalThis.fetch ? globalThis.fetch : "undefined" != typeof fetch ? fetch : void debugFail("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
    }
    static headers() {
      return this.headersImpl ? this.headersImpl : "undefined" != typeof self && "Headers" in self ? self.Headers : "undefined" != typeof globalThis && globalThis.Headers ? globalThis.Headers : "undefined" != typeof Headers ? Headers : void debugFail("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
    }
    static response() {
      return this.responseImpl ? this.responseImpl : "undefined" != typeof self && "Response" in self ? self.Response : "undefined" != typeof globalThis && globalThis.Response ? globalThis.Response : "undefined" != typeof Response ? Response : void debugFail("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
    }
  };
  var T = { CREDENTIAL_MISMATCH: "custom-token-mismatch", MISSING_CUSTOM_TOKEN: "internal-error", INVALID_IDENTIFIER: "invalid-email", MISSING_CONTINUE_URI: "internal-error", INVALID_PASSWORD: "wrong-password", MISSING_PASSWORD: "missing-password", INVALID_LOGIN_CREDENTIALS: "invalid-credential", EMAIL_EXISTS: "email-already-in-use", PASSWORD_LOGIN_DISABLED: "operation-not-allowed", INVALID_IDP_RESPONSE: "invalid-credential", INVALID_PENDING_TOKEN: "invalid-credential", FEDERATED_USER_ID_ALREADY_LINKED: "credential-already-in-use", MISSING_REQ_TYPE: "internal-error", EMAIL_NOT_FOUND: "user-not-found", RESET_PASSWORD_EXCEED_LIMIT: "too-many-requests", EXPIRED_OOB_CODE: "expired-action-code", INVALID_OOB_CODE: "invalid-action-code", MISSING_OOB_CODE: "internal-error", CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "requires-recent-login", INVALID_ID_TOKEN: "invalid-user-token", TOKEN_EXPIRED: "user-token-expired", USER_NOT_FOUND: "user-token-expired", TOO_MANY_ATTEMPTS_TRY_LATER: "too-many-requests", PASSWORD_DOES_NOT_MEET_REQUIREMENTS: "password-does-not-meet-requirements", INVALID_CODE: "invalid-verification-code", INVALID_SESSION_INFO: "invalid-verification-id", INVALID_TEMPORARY_PROOF: "invalid-credential", MISSING_SESSION_INFO: "missing-verification-id", SESSION_EXPIRED: "code-expired", MISSING_ANDROID_PACKAGE_NAME: "missing-android-pkg-name", UNAUTHORIZED_DOMAIN: "unauthorized-continue-uri", INVALID_OAUTH_CLIENT_ID: "invalid-oauth-client-id", ADMIN_ONLY_OPERATION: "admin-restricted-operation", INVALID_MFA_PENDING_CREDENTIAL: "invalid-multi-factor-session", MFA_ENROLLMENT_NOT_FOUND: "multi-factor-info-not-found", MISSING_MFA_ENROLLMENT_ID: "missing-multi-factor-info", MISSING_MFA_PENDING_CREDENTIAL: "missing-multi-factor-session", SECOND_FACTOR_EXISTS: "second-factor-already-in-use", SECOND_FACTOR_LIMIT_EXCEEDED: "maximum-second-factor-count-exceeded", BLOCKING_FUNCTION_ERROR_RESPONSE: "internal-error", RECAPTCHA_NOT_ENABLED: "recaptcha-not-enabled", MISSING_RECAPTCHA_TOKEN: "missing-recaptcha-token", INVALID_RECAPTCHA_TOKEN: "invalid-recaptcha-token", INVALID_RECAPTCHA_ACTION: "invalid-recaptcha-action", MISSING_CLIENT_TYPE: "missing-client-type", MISSING_RECAPTCHA_VERSION: "missing-recaptcha-version", INVALID_RECAPTCHA_VERSION: "invalid-recaptcha-version", INVALID_REQ_TYPE: "invalid-req-type" };
  var A = new Delay(3e4, 6e4);
  function _addTidIfNecessary(e, t) {
    return e.tenantId && !t.tenantId ? Object.assign(Object.assign({}, t), { tenantId: e.tenantId }) : t;
  }
  async function _performApiRequest(e, t, r, n, i2 = {}) {
    return _performFetchWithErrorHandling(e, i2, (async () => {
      let i3 = {}, s3 = {};
      n && ("GET" === t ? s3 = n : i3 = { body: JSON.stringify(n) });
      const o3 = querystring(Object.assign({ key: e.config.apiKey }, s3)).slice(1), a3 = await e._getAdditionalHeaders();
      a3["Content-Type"] = "application/json", e.languageCode && (a3["X-Firebase-Locale"] = e.languageCode);
      const c3 = Object.assign({ method: t, headers: a3 }, i3);
      return (function isCloudflareWorker() {
        return "undefined" != typeof navigator && "Cloudflare-Workers" === navigator.userAgent;
      })() || (c3.referrerPolicy = "no-referrer"), FetchProvider.fetch()(_getFinalTarget(e, e.config.apiHost, r, o3), c3);
    }));
  }
  async function _performFetchWithErrorHandling(e, t, r) {
    e._canInitEmulator = false;
    const n = Object.assign(Object.assign({}, T), t);
    try {
      const t2 = new NetworkTimeout(e), i2 = await Promise.race([r(), t2.promise]);
      t2.clearNetworkTimeout();
      const s3 = await i2.json();
      if ("needConfirmation" in s3) throw _makeTaggedError(e, "account-exists-with-different-credential", s3);
      if (i2.ok && !("errorMessage" in s3)) return s3;
      {
        const t3 = i2.ok ? s3.errorMessage : s3.error.message, [r2, o3] = t3.split(" : ");
        if ("FEDERATED_USER_ID_ALREADY_LINKED" === r2) throw _makeTaggedError(e, "credential-already-in-use", s3);
        if ("EMAIL_EXISTS" === r2) throw _makeTaggedError(e, "email-already-in-use", s3);
        if ("USER_DISABLED" === r2) throw _makeTaggedError(e, "user-disabled", s3);
        const a3 = n[r2] || r2.toLowerCase().replace(/[_\s]+/g, "-");
        if (o3) throw _errorWithCustomMessage(e, a3, o3);
        _fail(e, a3);
      }
    } catch (t2) {
      if (t2 instanceof FirebaseError2) throw t2;
      _fail(e, "network-request-failed", { message: String(t2) });
    }
  }
  async function _performSignInRequest(e, t, r, n, i2 = {}) {
    const s3 = await _performApiRequest(e, t, r, n, i2);
    return "mfaPendingCredential" in s3 && _fail(e, "multi-factor-auth-required", { _serverResponse: s3 }), s3;
  }
  function _getFinalTarget(e, t, r, n) {
    const i2 = `${t}${r}?${n}`;
    return e.config.emulator ? _emulatorUrl(e.config, i2) : `${e.config.apiScheme}://${i2}`;
  }
  function _parseEnforcementState(e) {
    switch (e) {
      case "ENFORCE":
        return "ENFORCE";
      case "AUDIT":
        return "AUDIT";
      case "OFF":
        return "OFF";
      default:
        return "ENFORCEMENT_STATE_UNSPECIFIED";
    }
  }
  var NetworkTimeout = class {
    clearNetworkTimeout() {
      clearTimeout(this.timer);
    }
    constructor(e) {
      this.auth = e, this.timer = null, this.promise = new Promise(((e2, t) => {
        this.timer = setTimeout((() => t(_createError(this.auth, "network-request-failed"))), A.get());
      }));
    }
  };
  function _makeTaggedError(e, t, r) {
    const n = { appName: e.name };
    r.email && (n.email = r.email), r.phoneNumber && (n.phoneNumber = r.phoneNumber);
    const i2 = _createError(e, t, n);
    return i2.customData._tokenResponse = r, i2;
  }
  function isV2(e) {
    return void 0 !== e && void 0 !== e.getResponse;
  }
  function isEnterprise(e) {
    return void 0 !== e && void 0 !== e.enterprise;
  }
  var RecaptchaConfig = class {
    constructor(e) {
      if (this.siteKey = "", this.recaptchaEnforcementState = [], void 0 === e.recaptchaKey) throw new Error("recaptchaKey undefined");
      this.siteKey = e.recaptchaKey.split("/")[3], this.recaptchaEnforcementState = e.recaptchaEnforcementState;
    }
    getProviderEnforcementState(e) {
      if (!this.recaptchaEnforcementState || 0 === this.recaptchaEnforcementState.length) return null;
      for (const t of this.recaptchaEnforcementState) if (t.provider && t.provider === e) return _parseEnforcementState(t.enforcementState);
      return null;
    }
    isProviderEnabled(e) {
      return "ENFORCE" === this.getProviderEnforcementState(e) || "AUDIT" === this.getProviderEnforcementState(e);
    }
    isAnyProviderEnabled() {
      return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER") || this.isProviderEnabled("PHONE_PROVIDER");
    }
  };
  async function getRecaptchaConfig(e, t) {
    return _performApiRequest(e, "GET", "/v2/recaptchaConfig", _addTidIfNecessary(e, t));
  }
  async function getAccountInfo(e, t) {
    return _performApiRequest(e, "POST", "/v1/accounts:lookup", t);
  }
  function utcTimestampToDateString(e) {
    if (e) try {
      const t = new Date(Number(e));
      if (!isNaN(t.getTime())) return t.toUTCString();
    } catch (e2) {
    }
  }
  function getIdToken(e, t = false) {
    return getModularInstance(e).getIdToken(t);
  }
  async function getIdTokenResult(e, t = false) {
    const r = getModularInstance(e), n = await r.getIdToken(t), i2 = _parseToken(n);
    _assert(i2 && i2.exp && i2.auth_time && i2.iat, r.auth, "internal-error");
    const s3 = "object" == typeof i2.firebase ? i2.firebase : void 0, o3 = null == s3 ? void 0 : s3.sign_in_provider;
    return { claims: i2, token: n, authTime: utcTimestampToDateString(secondsStringToMilliseconds(i2.auth_time)), issuedAtTime: utcTimestampToDateString(secondsStringToMilliseconds(i2.iat)), expirationTime: utcTimestampToDateString(secondsStringToMilliseconds(i2.exp)), signInProvider: o3 || null, signInSecondFactor: (null == s3 ? void 0 : s3.sign_in_second_factor) || null };
  }
  function secondsStringToMilliseconds(e) {
    return 1e3 * Number(e);
  }
  function _parseToken(e) {
    const [t, r, n] = e.split(".");
    if (void 0 === t || void 0 === r || void 0 === n) return _logError("JWT malformed, contained fewer than 3 sections"), null;
    try {
      const e2 = base64Decode2(r);
      return e2 ? JSON.parse(e2) : (_logError("Failed to decode base64 JWT payload"), null);
    } catch (e2) {
      return _logError("Caught error parsing JWT payload as JSON", null == e2 ? void 0 : e2.toString()), null;
    }
  }
  function _tokenExpiresIn(e) {
    const t = _parseToken(e);
    return _assert(t, "internal-error"), _assert(void 0 !== t.exp, "internal-error"), _assert(void 0 !== t.iat, "internal-error"), Number(t.exp) - Number(t.iat);
  }
  async function _logoutIfInvalidated(e, t, r = false) {
    if (r) return t;
    try {
      return await t;
    } catch (t2) {
      throw t2 instanceof FirebaseError2 && (function isUserInvalidated({ code: e2 }) {
        return "auth/user-disabled" === e2 || "auth/user-token-expired" === e2;
      })(t2) && e.auth.currentUser === e && await e.auth.signOut(), t2;
    }
  }
  var ProactiveRefresh = class {
    constructor(e) {
      this.user = e, this.isRunning = false, this.timerId = null, this.errorBackoff = 3e4;
    }
    _start() {
      this.isRunning || (this.isRunning = true, this.schedule());
    }
    _stop() {
      this.isRunning && (this.isRunning = false, null !== this.timerId && clearTimeout(this.timerId));
    }
    getInterval(e) {
      var t;
      if (e) {
        const e2 = this.errorBackoff;
        return this.errorBackoff = Math.min(2 * this.errorBackoff, 96e4), e2;
      }
      {
        this.errorBackoff = 3e4;
        const e2 = (null !== (t = this.user.stsTokenManager.expirationTime) && void 0 !== t ? t : 0) - Date.now() - 3e5;
        return Math.max(0, e2);
      }
    }
    schedule(e = false) {
      if (!this.isRunning) return;
      const t = this.getInterval(e);
      this.timerId = setTimeout((async () => {
        await this.iteration();
      }), t);
    }
    async iteration() {
      try {
        await this.user.getIdToken(true);
      } catch (e) {
        return void ("auth/network-request-failed" === (null == e ? void 0 : e.code) && this.schedule(true));
      }
      this.schedule();
    }
  };
  var UserMetadata = class {
    constructor(e, t) {
      this.createdAt = e, this.lastLoginAt = t, this._initializeTime();
    }
    _initializeTime() {
      this.lastSignInTime = utcTimestampToDateString(this.lastLoginAt), this.creationTime = utcTimestampToDateString(this.createdAt);
    }
    _copy(e) {
      this.createdAt = e.createdAt, this.lastLoginAt = e.lastLoginAt, this._initializeTime();
    }
    toJSON() {
      return { createdAt: this.createdAt, lastLoginAt: this.lastLoginAt };
    }
  };
  async function _reloadWithoutSaving(e) {
    var t;
    const r = e.auth, n = await e.getIdToken(), i2 = await _logoutIfInvalidated(e, getAccountInfo(r, { idToken: n }));
    _assert(null == i2 ? void 0 : i2.users.length, r, "internal-error");
    const s3 = i2.users[0];
    e._notifyReloadListener(s3);
    const o3 = (null === (t = s3.providerUserInfo) || void 0 === t ? void 0 : t.length) ? extractProviderData(s3.providerUserInfo) : [], a3 = (function mergeProviderData(e2, t2) {
      return [...e2.filter(((e3) => !t2.some(((t3) => t3.providerId === e3.providerId)))), ...t2];
    })(e.providerData, o3), c3 = e.isAnonymous, u3 = !(e.email && s3.passwordHash || (null == a3 ? void 0 : a3.length)), d3 = !!c3 && u3, l3 = { uid: s3.localId, displayName: s3.displayName || null, photoURL: s3.photoUrl || null, email: s3.email || null, emailVerified: s3.emailVerified || false, phoneNumber: s3.phoneNumber || null, tenantId: s3.tenantId || null, providerData: a3, metadata: new UserMetadata(s3.createdAt, s3.lastLoginAt), isAnonymous: d3 };
    Object.assign(e, l3);
  }
  async function reload(e) {
    const t = getModularInstance(e);
    await _reloadWithoutSaving(t), await t.auth._persistUserIfCurrent(t), t.auth._notifyListenersIfCurrent(t);
  }
  function extractProviderData(e) {
    return e.map(((e2) => {
      var { providerId: t } = e2, r = __rest(e2, ["providerId"]);
      return { providerId: t, uid: r.rawId || "", displayName: r.displayName || null, email: r.email || null, phoneNumber: r.phoneNumber || null, photoURL: r.photoUrl || null };
    }));
  }
  var StsTokenManager = class _StsTokenManager {
    constructor() {
      this.refreshToken = null, this.accessToken = null, this.expirationTime = null;
    }
    get isExpired() {
      return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
    }
    updateFromServerResponse(e) {
      _assert(e.idToken, "internal-error"), _assert(void 0 !== e.idToken, "internal-error"), _assert(void 0 !== e.refreshToken, "internal-error");
      const t = "expiresIn" in e && void 0 !== e.expiresIn ? Number(e.expiresIn) : _tokenExpiresIn(e.idToken);
      this.updateTokensAndExpiration(e.idToken, e.refreshToken, t);
    }
    updateFromIdToken(e) {
      _assert(0 !== e.length, "internal-error");
      const t = _tokenExpiresIn(e);
      this.updateTokensAndExpiration(e, null, t);
    }
    async getToken(e, t = false) {
      return t || !this.accessToken || this.isExpired ? (_assert(this.refreshToken, e, "user-token-expired"), this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null) : this.accessToken;
    }
    clearRefreshToken() {
      this.refreshToken = null;
    }
    async refresh(e, t) {
      const { accessToken: r, refreshToken: n, expiresIn: i2 } = await (async function requestStsToken(e2, t2) {
        const r2 = await _performFetchWithErrorHandling(e2, {}, (async () => {
          const r3 = querystring({ grant_type: "refresh_token", refresh_token: t2 }).slice(1), { tokenApiHost: n2, apiKey: i3 } = e2.config, s3 = _getFinalTarget(e2, n2, "/v1/token", `key=${i3}`), o3 = await e2._getAdditionalHeaders();
          return o3["Content-Type"] = "application/x-www-form-urlencoded", FetchProvider.fetch()(s3, { method: "POST", headers: o3, body: r3 });
        }));
        return { accessToken: r2.access_token, expiresIn: r2.expires_in, refreshToken: r2.refresh_token };
      })(e, t);
      this.updateTokensAndExpiration(r, n, Number(i2));
    }
    updateTokensAndExpiration(e, t, r) {
      this.refreshToken = t || null, this.accessToken = e || null, this.expirationTime = Date.now() + 1e3 * r;
    }
    static fromJSON(e, t) {
      const { refreshToken: r, accessToken: n, expirationTime: i2 } = t, s3 = new _StsTokenManager();
      return r && (_assert("string" == typeof r, "internal-error", { appName: e }), s3.refreshToken = r), n && (_assert("string" == typeof n, "internal-error", { appName: e }), s3.accessToken = n), i2 && (_assert("number" == typeof i2, "internal-error", { appName: e }), s3.expirationTime = i2), s3;
    }
    toJSON() {
      return { refreshToken: this.refreshToken, accessToken: this.accessToken, expirationTime: this.expirationTime };
    }
    _assign(e) {
      this.accessToken = e.accessToken, this.refreshToken = e.refreshToken, this.expirationTime = e.expirationTime;
    }
    _clone() {
      return Object.assign(new _StsTokenManager(), this.toJSON());
    }
    _performRefresh() {
      return debugFail("not implemented");
    }
  };
  function assertStringOrUndefined(e, t) {
    _assert("string" == typeof e || void 0 === e, "internal-error", { appName: t });
  }
  var UserImpl = class _UserImpl {
    constructor(e) {
      var { uid: t, auth: r, stsTokenManager: n } = e, i2 = __rest(e, ["uid", "auth", "stsTokenManager"]);
      this.providerId = "firebase", this.proactiveRefresh = new ProactiveRefresh(this), this.reloadUserInfo = null, this.reloadListener = null, this.uid = t, this.auth = r, this.stsTokenManager = n, this.accessToken = n.accessToken, this.displayName = i2.displayName || null, this.email = i2.email || null, this.emailVerified = i2.emailVerified || false, this.phoneNumber = i2.phoneNumber || null, this.photoURL = i2.photoURL || null, this.isAnonymous = i2.isAnonymous || false, this.tenantId = i2.tenantId || null, this.providerData = i2.providerData ? [...i2.providerData] : [], this.metadata = new UserMetadata(i2.createdAt || void 0, i2.lastLoginAt || void 0);
    }
    async getIdToken(e) {
      const t = await _logoutIfInvalidated(this, this.stsTokenManager.getToken(this.auth, e));
      return _assert(t, this.auth, "internal-error"), this.accessToken !== t && (this.accessToken = t, await this.auth._persistUserIfCurrent(this), this.auth._notifyListenersIfCurrent(this)), t;
    }
    getIdTokenResult(e) {
      return getIdTokenResult(this, e);
    }
    reload() {
      return reload(this);
    }
    _assign(e) {
      this !== e && (_assert(this.uid === e.uid, this.auth, "internal-error"), this.displayName = e.displayName, this.photoURL = e.photoURL, this.email = e.email, this.emailVerified = e.emailVerified, this.phoneNumber = e.phoneNumber, this.isAnonymous = e.isAnonymous, this.tenantId = e.tenantId, this.providerData = e.providerData.map(((e2) => Object.assign({}, e2))), this.metadata._copy(e.metadata), this.stsTokenManager._assign(e.stsTokenManager));
    }
    _clone(e) {
      const t = new _UserImpl(Object.assign(Object.assign({}, this), { auth: e, stsTokenManager: this.stsTokenManager._clone() }));
      return t.metadata._copy(this.metadata), t;
    }
    _onReload(e) {
      _assert(!this.reloadListener, this.auth, "internal-error"), this.reloadListener = e, this.reloadUserInfo && (this._notifyReloadListener(this.reloadUserInfo), this.reloadUserInfo = null);
    }
    _notifyReloadListener(e) {
      this.reloadListener ? this.reloadListener(e) : this.reloadUserInfo = e;
    }
    _startProactiveRefresh() {
      this.proactiveRefresh._start();
    }
    _stopProactiveRefresh() {
      this.proactiveRefresh._stop();
    }
    async _updateTokensIfNecessary(e, t = false) {
      let r = false;
      e.idToken && e.idToken !== this.stsTokenManager.accessToken && (this.stsTokenManager.updateFromServerResponse(e), r = true), t && await _reloadWithoutSaving(this), await this.auth._persistUserIfCurrent(this), r && this.auth._notifyListenersIfCurrent(this);
    }
    async delete() {
      if (_isFirebaseServerApp(this.auth.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(this.auth));
      const t = await this.getIdToken();
      return await _logoutIfInvalidated(this, (async function deleteAccount(e, t2) {
        return _performApiRequest(e, "POST", "/v1/accounts:delete", t2);
      })(this.auth, { idToken: t })), this.stsTokenManager.clearRefreshToken(), this.auth.signOut();
    }
    toJSON() {
      return Object.assign(Object.assign({ uid: this.uid, email: this.email || void 0, emailVerified: this.emailVerified, displayName: this.displayName || void 0, isAnonymous: this.isAnonymous, photoURL: this.photoURL || void 0, phoneNumber: this.phoneNumber || void 0, tenantId: this.tenantId || void 0, providerData: this.providerData.map(((e) => Object.assign({}, e))), stsTokenManager: this.stsTokenManager.toJSON(), _redirectEventId: this._redirectEventId }, this.metadata.toJSON()), { apiKey: this.auth.config.apiKey, appName: this.auth.name });
    }
    get refreshToken() {
      return this.stsTokenManager.refreshToken || "";
    }
    static _fromJSON(e, t) {
      var r, n, i2, s3, o3, a3, c3, u3;
      const d3 = null !== (r = t.displayName) && void 0 !== r ? r : void 0, l3 = null !== (n = t.email) && void 0 !== n ? n : void 0, h3 = null !== (i2 = t.phoneNumber) && void 0 !== i2 ? i2 : void 0, p3 = null !== (s3 = t.photoURL) && void 0 !== s3 ? s3 : void 0, f3 = null !== (o3 = t.tenantId) && void 0 !== o3 ? o3 : void 0, m3 = null !== (a3 = t._redirectEventId) && void 0 !== a3 ? a3 : void 0, g3 = null !== (c3 = t.createdAt) && void 0 !== c3 ? c3 : void 0, _3 = null !== (u3 = t.lastLoginAt) && void 0 !== u3 ? u3 : void 0, { uid: I3, emailVerified: v3, isAnonymous: E3, providerData: T3, stsTokenManager: A3 } = t;
      _assert(I3 && A3, e, "internal-error");
      const y3 = StsTokenManager.fromJSON(this.name, A3);
      _assert("string" == typeof I3, e, "internal-error"), assertStringOrUndefined(d3, e.name), assertStringOrUndefined(l3, e.name), _assert("boolean" == typeof v3, e, "internal-error"), _assert("boolean" == typeof E3, e, "internal-error"), assertStringOrUndefined(h3, e.name), assertStringOrUndefined(p3, e.name), assertStringOrUndefined(f3, e.name), assertStringOrUndefined(m3, e.name), assertStringOrUndefined(g3, e.name), assertStringOrUndefined(_3, e.name);
      const w3 = new _UserImpl({ uid: I3, auth: e, email: l3, emailVerified: v3, displayName: d3, isAnonymous: E3, photoURL: p3, phoneNumber: h3, tenantId: f3, stsTokenManager: y3, createdAt: g3, lastLoginAt: _3 });
      return T3 && Array.isArray(T3) && (w3.providerData = T3.map(((e2) => Object.assign({}, e2)))), m3 && (w3._redirectEventId = m3), w3;
    }
    static async _fromIdTokenResponse(e, t, r = false) {
      const n = new StsTokenManager();
      n.updateFromServerResponse(t);
      const i2 = new _UserImpl({ uid: t.localId, auth: e, stsTokenManager: n, isAnonymous: r });
      return await _reloadWithoutSaving(i2), i2;
    }
    static async _fromGetAccountInfoResponse(e, t, r) {
      const n = t.users[0];
      _assert(void 0 !== n.localId, "internal-error");
      const i2 = void 0 !== n.providerUserInfo ? extractProviderData(n.providerUserInfo) : [], s3 = !(n.email && n.passwordHash || (null == i2 ? void 0 : i2.length)), o3 = new StsTokenManager();
      o3.updateFromIdToken(r);
      const a3 = new _UserImpl({ uid: n.localId, auth: e, stsTokenManager: o3, isAnonymous: s3 }), c3 = { uid: n.localId, displayName: n.displayName || null, photoURL: n.photoUrl || null, email: n.email || null, emailVerified: n.emailVerified || false, phoneNumber: n.phoneNumber || null, tenantId: n.tenantId || null, providerData: i2, metadata: new UserMetadata(n.createdAt, n.lastLoginAt), isAnonymous: !(n.email && n.passwordHash || (null == i2 ? void 0 : i2.length)) };
      return Object.assign(a3, c3), a3;
    }
  };
  var y = /* @__PURE__ */ new Map();
  function _getInstance(e) {
    debugAssert(e instanceof Function, "Expected a class definition");
    let t = y.get(e);
    return t ? (debugAssert(t instanceof e, "Instance stored in cache mismatched with class"), t) : (t = new e(), y.set(e, t), t);
  }
  var InMemoryPersistence = class {
    constructor() {
      this.type = "NONE", this.storage = {};
    }
    async _isAvailable() {
      return true;
    }
    async _set(e, t) {
      this.storage[e] = t;
    }
    async _get(e) {
      const t = this.storage[e];
      return void 0 === t ? null : t;
    }
    async _remove(e) {
      delete this.storage[e];
    }
    _addListener(e, t) {
    }
    _removeListener(e, t) {
    }
  };
  InMemoryPersistence.type = "NONE";
  var w = InMemoryPersistence;
  function _persistenceKeyName(e, t, r) {
    return `firebase:${e}:${t}:${r}`;
  }
  var PersistenceUserManager = class _PersistenceUserManager {
    constructor(e, t, r) {
      this.persistence = e, this.auth = t, this.userKey = r;
      const { config: n, name: i2 } = this.auth;
      this.fullUserKey = _persistenceKeyName(this.userKey, n.apiKey, i2), this.fullPersistenceKey = _persistenceKeyName("persistence", n.apiKey, i2), this.boundEventHandler = t._onStorageEvent.bind(t), this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
    }
    setCurrentUser(e) {
      return this.persistence._set(this.fullUserKey, e.toJSON());
    }
    async getCurrentUser() {
      const e = await this.persistence._get(this.fullUserKey);
      return e ? UserImpl._fromJSON(this.auth, e) : null;
    }
    removeCurrentUser() {
      return this.persistence._remove(this.fullUserKey);
    }
    savePersistenceForRedirect() {
      return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
    }
    async setPersistence(e) {
      if (this.persistence === e) return;
      const t = await this.getCurrentUser();
      return await this.removeCurrentUser(), this.persistence = e, t ? this.setCurrentUser(t) : void 0;
    }
    delete() {
      this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
    }
    static async create(e, t, r = "authUser") {
      if (!t.length) return new _PersistenceUserManager(_getInstance(w), e, r);
      const n = (await Promise.all(t.map((async (e2) => {
        if (await e2._isAvailable()) return e2;
      })))).filter(((e2) => e2));
      let i2 = n[0] || _getInstance(w);
      const s3 = _persistenceKeyName(r, e.config.apiKey, e.name);
      let o3 = null;
      for (const r2 of t) try {
        const t2 = await r2._get(s3);
        if (t2) {
          const n2 = UserImpl._fromJSON(e, t2);
          r2 !== i2 && (o3 = n2), i2 = r2;
          break;
        }
      } catch (e2) {
      }
      const a3 = n.filter(((e2) => e2._shouldAllowMigration));
      return i2._shouldAllowMigration && a3.length ? (i2 = a3[0], o3 && await i2._set(s3, o3.toJSON()), await Promise.all(t.map((async (e2) => {
        if (e2 !== i2) try {
          await e2._remove(s3);
        } catch (e3) {
        }
      }))), new _PersistenceUserManager(i2, e, r)) : new _PersistenceUserManager(i2, e, r);
    }
  };
  function _getBrowserName(e) {
    const t = e.toLowerCase();
    if (t.includes("opera/") || t.includes("opr/") || t.includes("opios/")) return "Opera";
    if (_isIEMobile(t)) return "IEMobile";
    if (t.includes("msie") || t.includes("trident/")) return "IE";
    if (t.includes("edge/")) return "Edge";
    if (_isFirefox(t)) return "Firefox";
    if (t.includes("silk/")) return "Silk";
    if (_isBlackBerry(t)) return "Blackberry";
    if (_isWebOS(t)) return "Webos";
    if (_isSafari(t)) return "Safari";
    if ((t.includes("chrome/") || _isChromeIOS(t)) && !t.includes("edge/")) return "Chrome";
    if (_isAndroid(t)) return "Android";
    {
      const t2 = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/, r = e.match(t2);
      if (2 === (null == r ? void 0 : r.length)) return r[1];
    }
    return "Other";
  }
  function _isFirefox(e = getUA()) {
    return /firefox\//i.test(e);
  }
  function _isSafari(e = getUA()) {
    const t = e.toLowerCase();
    return t.includes("safari/") && !t.includes("chrome/") && !t.includes("crios/") && !t.includes("android");
  }
  function _isChromeIOS(e = getUA()) {
    return /crios\//i.test(e);
  }
  function _isIEMobile(e = getUA()) {
    return /iemobile/i.test(e);
  }
  function _isAndroid(e = getUA()) {
    return /android/i.test(e);
  }
  function _isBlackBerry(e = getUA()) {
    return /blackberry/i.test(e);
  }
  function _isWebOS(e = getUA()) {
    return /webos/i.test(e);
  }
  function _isIOS(e = getUA()) {
    return /iphone|ipad|ipod/i.test(e) || /macintosh/i.test(e) && /mobile/i.test(e);
  }
  function _isIE10() {
    return (function isIE() {
      const e = getUA();
      return e.indexOf("MSIE ") >= 0 || e.indexOf("Trident/") >= 0;
    })() && 10 === document.documentMode;
  }
  function _isMobileBrowser(e = getUA()) {
    return _isIOS(e) || _isAndroid(e) || _isWebOS(e) || _isBlackBerry(e) || /windows phone/i.test(e) || _isIEMobile(e);
  }
  function _getClientVersion(e, t = []) {
    let r;
    switch (e) {
      case "Browser":
        r = _getBrowserName(getUA());
        break;
      case "Worker":
        r = `${_getBrowserName(getUA())}-${e}`;
        break;
      default:
        r = e;
    }
    const n = t.length ? t.join(",") : "FirebaseCore-web";
    return `${r}/JsCore/${SDK_VERSION}/${n}`;
  }
  var AuthMiddlewareQueue = class {
    constructor(e) {
      this.auth = e, this.queue = [];
    }
    pushCallback(e, t) {
      const wrappedCallback = (t2) => new Promise(((r2, n) => {
        try {
          r2(e(t2));
        } catch (e2) {
          n(e2);
        }
      }));
      wrappedCallback.onAbort = t, this.queue.push(wrappedCallback);
      const r = this.queue.length - 1;
      return () => {
        this.queue[r] = () => Promise.resolve();
      };
    }
    async runMiddleware(e) {
      if (this.auth.currentUser === e) return;
      const t = [];
      try {
        for (const r of this.queue) await r(e), r.onAbort && t.push(r.onAbort);
      } catch (e2) {
        t.reverse();
        for (const e3 of t) try {
          e3();
        } catch (e4) {
        }
        throw this.auth._errorFactory.create("login-blocked", { originalMessage: null == e2 ? void 0 : e2.message });
      }
    }
  };
  var PasswordPolicyImpl = class {
    constructor(e) {
      var t, r, n, i2;
      const s3 = e.customStrengthOptions;
      this.customStrengthOptions = {}, this.customStrengthOptions.minPasswordLength = null !== (t = s3.minPasswordLength) && void 0 !== t ? t : 6, s3.maxPasswordLength && (this.customStrengthOptions.maxPasswordLength = s3.maxPasswordLength), void 0 !== s3.containsLowercaseCharacter && (this.customStrengthOptions.containsLowercaseLetter = s3.containsLowercaseCharacter), void 0 !== s3.containsUppercaseCharacter && (this.customStrengthOptions.containsUppercaseLetter = s3.containsUppercaseCharacter), void 0 !== s3.containsNumericCharacter && (this.customStrengthOptions.containsNumericCharacter = s3.containsNumericCharacter), void 0 !== s3.containsNonAlphanumericCharacter && (this.customStrengthOptions.containsNonAlphanumericCharacter = s3.containsNonAlphanumericCharacter), this.enforcementState = e.enforcementState, "ENFORCEMENT_STATE_UNSPECIFIED" === this.enforcementState && (this.enforcementState = "OFF"), this.allowedNonAlphanumericCharacters = null !== (n = null === (r = e.allowedNonAlphanumericCharacters) || void 0 === r ? void 0 : r.join("")) && void 0 !== n ? n : "", this.forceUpgradeOnSignin = null !== (i2 = e.forceUpgradeOnSignin) && void 0 !== i2 && i2, this.schemaVersion = e.schemaVersion;
    }
    validatePassword(e) {
      var t, r, n, i2, s3, o3;
      const a3 = { isValid: true, passwordPolicy: this };
      return this.validatePasswordLengthOptions(e, a3), this.validatePasswordCharacterOptions(e, a3), a3.isValid && (a3.isValid = null === (t = a3.meetsMinPasswordLength) || void 0 === t || t), a3.isValid && (a3.isValid = null === (r = a3.meetsMaxPasswordLength) || void 0 === r || r), a3.isValid && (a3.isValid = null === (n = a3.containsLowercaseLetter) || void 0 === n || n), a3.isValid && (a3.isValid = null === (i2 = a3.containsUppercaseLetter) || void 0 === i2 || i2), a3.isValid && (a3.isValid = null === (s3 = a3.containsNumericCharacter) || void 0 === s3 || s3), a3.isValid && (a3.isValid = null === (o3 = a3.containsNonAlphanumericCharacter) || void 0 === o3 || o3), a3;
    }
    validatePasswordLengthOptions(e, t) {
      const r = this.customStrengthOptions.minPasswordLength, n = this.customStrengthOptions.maxPasswordLength;
      r && (t.meetsMinPasswordLength = e.length >= r), n && (t.meetsMaxPasswordLength = e.length <= n);
    }
    validatePasswordCharacterOptions(e, t) {
      let r;
      this.updatePasswordCharacterOptionsStatuses(t, false, false, false, false);
      for (let n = 0; n < e.length; n++) r = e.charAt(n), this.updatePasswordCharacterOptionsStatuses(t, r >= "a" && r <= "z", r >= "A" && r <= "Z", r >= "0" && r <= "9", this.allowedNonAlphanumericCharacters.includes(r));
    }
    updatePasswordCharacterOptionsStatuses(e, t, r, n, i2) {
      this.customStrengthOptions.containsLowercaseLetter && (e.containsLowercaseLetter || (e.containsLowercaseLetter = t)), this.customStrengthOptions.containsUppercaseLetter && (e.containsUppercaseLetter || (e.containsUppercaseLetter = r)), this.customStrengthOptions.containsNumericCharacter && (e.containsNumericCharacter || (e.containsNumericCharacter = n)), this.customStrengthOptions.containsNonAlphanumericCharacter && (e.containsNonAlphanumericCharacter || (e.containsNonAlphanumericCharacter = i2));
    }
  };
  var AuthImpl = class {
    constructor(e, t, r, n) {
      this.app = e, this.heartbeatServiceProvider = t, this.appCheckServiceProvider = r, this.config = n, this.currentUser = null, this.emulatorConfig = null, this.operations = Promise.resolve(), this.authStateSubscription = new Subscription(this), this.idTokenSubscription = new Subscription(this), this.beforeStateQueue = new AuthMiddlewareQueue(this), this.redirectUser = null, this.isProactiveRefreshEnabled = false, this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1, this._canInitEmulator = true, this._isInitialized = false, this._deleted = false, this._initializationPromise = null, this._popupRedirectResolver = null, this._errorFactory = I, this._agentRecaptchaConfig = null, this._tenantRecaptchaConfigs = {}, this._projectPasswordPolicy = null, this._tenantPasswordPolicies = {}, this.lastNotifiedUid = void 0, this.languageCode = null, this.tenantId = null, this.settings = { appVerificationDisabledForTesting: false }, this.frameworks = [], this.name = e.name, this.clientVersion = n.sdkClientVersion;
    }
    _initializeWithPersistence(e, t) {
      return t && (this._popupRedirectResolver = _getInstance(t)), this._initializationPromise = this.queue((async () => {
        var r, n;
        if (!this._deleted && (this.persistenceManager = await PersistenceUserManager.create(this, e), !this._deleted)) {
          if (null === (r = this._popupRedirectResolver) || void 0 === r ? void 0 : r._shouldInitProactively) try {
            await this._popupRedirectResolver._initialize(this);
          } catch (e2) {
          }
          await this.initializeCurrentUser(t), this.lastNotifiedUid = (null === (n = this.currentUser) || void 0 === n ? void 0 : n.uid) || null, this._deleted || (this._isInitialized = true);
        }
      })), this._initializationPromise;
    }
    async _onStorageEvent() {
      if (this._deleted) return;
      const e = await this.assertedPersistence.getCurrentUser();
      return this.currentUser || e ? this.currentUser && e && this.currentUser.uid === e.uid ? (this._currentUser._assign(e), void await this.currentUser.getIdToken()) : void await this._updateCurrentUser(e, true) : void 0;
    }
    async initializeCurrentUserFromIdToken(e) {
      try {
        const t = await getAccountInfo(this, { idToken: e }), r = await UserImpl._fromGetAccountInfoResponse(this, t, e);
        await this.directlySetCurrentUser(r);
      } catch (e2) {
        console.warn("FirebaseServerApp could not login user with provided authIdToken: ", e2), await this.directlySetCurrentUser(null);
      }
    }
    async initializeCurrentUser(t) {
      var r;
      if (_isFirebaseServerApp(this.app)) {
        const e = this.app.settings.authIdToken;
        return e ? new Promise(((t2) => {
          setTimeout((() => this.initializeCurrentUserFromIdToken(e).then(t2, t2)));
        })) : this.directlySetCurrentUser(null);
      }
      const n = await this.assertedPersistence.getCurrentUser();
      let i2 = n, s3 = false;
      if (t && this.config.authDomain) {
        await this.getOrInitRedirectPersistenceManager();
        const e = null === (r = this.redirectUser) || void 0 === r ? void 0 : r._redirectEventId, n2 = null == i2 ? void 0 : i2._redirectEventId, o3 = await this.tryRedirectSignIn(t);
        e && e !== n2 || !(null == o3 ? void 0 : o3.user) || (i2 = o3.user, s3 = true);
      }
      if (!i2) return this.directlySetCurrentUser(null);
      if (!i2._redirectEventId) {
        if (s3) try {
          await this.beforeStateQueue.runMiddleware(i2);
        } catch (e) {
          i2 = n, this._popupRedirectResolver._overrideRedirectResult(this, (() => Promise.reject(e)));
        }
        return i2 ? this.reloadAndSetCurrentUserOrClear(i2) : this.directlySetCurrentUser(null);
      }
      return _assert(this._popupRedirectResolver, this, "argument-error"), await this.getOrInitRedirectPersistenceManager(), this.redirectUser && this.redirectUser._redirectEventId === i2._redirectEventId ? this.directlySetCurrentUser(i2) : this.reloadAndSetCurrentUserOrClear(i2);
    }
    async tryRedirectSignIn(e) {
      let t = null;
      try {
        t = await this._popupRedirectResolver._completeRedirectFn(this, e, true);
      } catch (e2) {
        await this._setRedirectUser(null);
      }
      return t;
    }
    async reloadAndSetCurrentUserOrClear(e) {
      try {
        await _reloadWithoutSaving(e);
      } catch (e2) {
        if ("auth/network-request-failed" !== (null == e2 ? void 0 : e2.code)) return this.directlySetCurrentUser(null);
      }
      return this.directlySetCurrentUser(e);
    }
    useDeviceLanguage() {
      this.languageCode = (function _getUserLanguage() {
        if ("undefined" == typeof navigator) return null;
        const e = navigator;
        return e.languages && e.languages[0] || e.language || null;
      })();
    }
    async _delete() {
      this._deleted = true;
    }
    async updateCurrentUser(t) {
      if (_isFirebaseServerApp(this.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(this));
      const r = t ? getModularInstance(t) : null;
      return r && _assert(r.auth.config.apiKey === this.config.apiKey, this, "invalid-user-token"), this._updateCurrentUser(r && r._clone(this));
    }
    async _updateCurrentUser(e, t = false) {
      if (!this._deleted) return e && _assert(this.tenantId === e.tenantId, this, "tenant-id-mismatch"), t || await this.beforeStateQueue.runMiddleware(e), this.queue((async () => {
        await this.directlySetCurrentUser(e), this.notifyAuthListeners();
      }));
    }
    async signOut() {
      return _isFirebaseServerApp(this.app) ? Promise.reject(_serverAppCurrentUserOperationNotSupportedError(this)) : (await this.beforeStateQueue.runMiddleware(null), (this.redirectPersistenceManager || this._popupRedirectResolver) && await this._setRedirectUser(null), this._updateCurrentUser(null, true));
    }
    setPersistence(t) {
      return _isFirebaseServerApp(this.app) ? Promise.reject(_serverAppCurrentUserOperationNotSupportedError(this)) : this.queue((async () => {
        await this.assertedPersistence.setPersistence(_getInstance(t));
      }));
    }
    _getRecaptchaConfig() {
      return null == this.tenantId ? this._agentRecaptchaConfig : this._tenantRecaptchaConfigs[this.tenantId];
    }
    async validatePassword(e) {
      this._getPasswordPolicyInternal() || await this._updatePasswordPolicy();
      const t = this._getPasswordPolicyInternal();
      return t.schemaVersion !== this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION ? Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version", {})) : t.validatePassword(e);
    }
    _getPasswordPolicyInternal() {
      return null === this.tenantId ? this._projectPasswordPolicy : this._tenantPasswordPolicies[this.tenantId];
    }
    async _updatePasswordPolicy() {
      const e = await (async function _getPasswordPolicy(e2, t2 = {}) {
        return _performApiRequest(e2, "GET", "/v2/passwordPolicy", _addTidIfNecessary(e2, t2));
      })(this), t = new PasswordPolicyImpl(e);
      null === this.tenantId ? this._projectPasswordPolicy = t : this._tenantPasswordPolicies[this.tenantId] = t;
    }
    _getPersistence() {
      return this.assertedPersistence.persistence.type;
    }
    _updateErrorMap(e) {
      this._errorFactory = new ErrorFactory2("auth", "Firebase", e());
    }
    onAuthStateChanged(e, t, r) {
      return this.registerStateListener(this.authStateSubscription, e, t, r);
    }
    beforeAuthStateChanged(e, t) {
      return this.beforeStateQueue.pushCallback(e, t);
    }
    onIdTokenChanged(e, t, r) {
      return this.registerStateListener(this.idTokenSubscription, e, t, r);
    }
    authStateReady() {
      return new Promise(((e, t) => {
        if (this.currentUser) e();
        else {
          const r = this.onAuthStateChanged((() => {
            r(), e();
          }), t);
        }
      }));
    }
    async revokeAccessToken(e) {
      if (this.currentUser) {
        const t = { providerId: "apple.com", tokenType: "ACCESS_TOKEN", token: e, idToken: await this.currentUser.getIdToken() };
        null != this.tenantId && (t.tenantId = this.tenantId), await (async function revokeToken(e2, t2) {
          return _performApiRequest(e2, "POST", "/v2/accounts:revokeToken", _addTidIfNecessary(e2, t2));
        })(this, t);
      }
    }
    toJSON() {
      var e;
      return { apiKey: this.config.apiKey, authDomain: this.config.authDomain, appName: this.name, currentUser: null === (e = this._currentUser) || void 0 === e ? void 0 : e.toJSON() };
    }
    async _setRedirectUser(e, t) {
      const r = await this.getOrInitRedirectPersistenceManager(t);
      return null === e ? r.removeCurrentUser() : r.setCurrentUser(e);
    }
    async getOrInitRedirectPersistenceManager(e) {
      if (!this.redirectPersistenceManager) {
        const t = e && _getInstance(e) || this._popupRedirectResolver;
        _assert(t, this, "argument-error"), this.redirectPersistenceManager = await PersistenceUserManager.create(this, [_getInstance(t._redirectPersistence)], "redirectUser"), this.redirectUser = await this.redirectPersistenceManager.getCurrentUser();
      }
      return this.redirectPersistenceManager;
    }
    async _redirectUserForId(e) {
      var t, r;
      return this._isInitialized && await this.queue((async () => {
      })), (null === (t = this._currentUser) || void 0 === t ? void 0 : t._redirectEventId) === e ? this._currentUser : (null === (r = this.redirectUser) || void 0 === r ? void 0 : r._redirectEventId) === e ? this.redirectUser : null;
    }
    async _persistUserIfCurrent(e) {
      if (e === this.currentUser) return this.queue((async () => this.directlySetCurrentUser(e)));
    }
    _notifyListenersIfCurrent(e) {
      e === this.currentUser && this.notifyAuthListeners();
    }
    _key() {
      return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
    }
    _startProactiveRefresh() {
      this.isProactiveRefreshEnabled = true, this.currentUser && this._currentUser._startProactiveRefresh();
    }
    _stopProactiveRefresh() {
      this.isProactiveRefreshEnabled = false, this.currentUser && this._currentUser._stopProactiveRefresh();
    }
    get _currentUser() {
      return this.currentUser;
    }
    notifyAuthListeners() {
      var e, t;
      if (!this._isInitialized) return;
      this.idTokenSubscription.next(this.currentUser);
      const r = null !== (t = null === (e = this.currentUser) || void 0 === e ? void 0 : e.uid) && void 0 !== t ? t : null;
      this.lastNotifiedUid !== r && (this.lastNotifiedUid = r, this.authStateSubscription.next(this.currentUser));
    }
    registerStateListener(e, t, r, n) {
      if (this._deleted) return () => {
      };
      const i2 = "function" == typeof t ? t : t.next.bind(t);
      let s3 = false;
      const o3 = this._isInitialized ? Promise.resolve() : this._initializationPromise;
      if (_assert(o3, this, "internal-error"), o3.then((() => {
        s3 || i2(this.currentUser);
      })), "function" == typeof t) {
        const i3 = e.addObserver(t, r, n);
        return () => {
          s3 = true, i3();
        };
      }
      {
        const r2 = e.addObserver(t);
        return () => {
          s3 = true, r2();
        };
      }
    }
    async directlySetCurrentUser(e) {
      this.currentUser && this.currentUser !== e && this._currentUser._stopProactiveRefresh(), e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(), this.currentUser = e, e ? await this.assertedPersistence.setCurrentUser(e) : await this.assertedPersistence.removeCurrentUser();
    }
    queue(e) {
      return this.operations = this.operations.then(e, e), this.operations;
    }
    get assertedPersistence() {
      return _assert(this.persistenceManager, this, "internal-error"), this.persistenceManager;
    }
    _logFramework(e) {
      e && !this.frameworks.includes(e) && (this.frameworks.push(e), this.frameworks.sort(), this.clientVersion = _getClientVersion(this.config.clientPlatform, this._getFrameworks()));
    }
    _getFrameworks() {
      return this.frameworks;
    }
    async _getAdditionalHeaders() {
      var e;
      const t = { "X-Client-Version": this.clientVersion };
      this.app.options.appId && (t["X-Firebase-gmpid"] = this.app.options.appId);
      const r = await (null === (e = this.heartbeatServiceProvider.getImmediate({ optional: true })) || void 0 === e ? void 0 : e.getHeartbeatsHeader());
      r && (t["X-Firebase-Client"] = r);
      const n = await this._getAppCheckToken();
      return n && (t["X-Firebase-AppCheck"] = n), t;
    }
    async _getAppCheckToken() {
      var e;
      const t = await (null === (e = this.appCheckServiceProvider.getImmediate({ optional: true })) || void 0 === e ? void 0 : e.getToken());
      return (null == t ? void 0 : t.error) && (function _logWarn(e2, ...t2) {
        E.logLevel <= a.WARN && E.warn(`Auth (${SDK_VERSION}): ${e2}`, ...t2);
      })(`Error while retrieving App Check token: ${t.error}`), null == t ? void 0 : t.token;
    }
  };
  function _castAuth(e) {
    return getModularInstance(e);
  }
  var Subscription = class {
    constructor(e) {
      this.auth = e, this.observer = null, this.addObserver = (function createSubscribe(e2, t) {
        const r = new ObserverProxy(e2, t);
        return r.subscribe.bind(r);
      })(((e2) => this.observer = e2));
    }
    get next() {
      return _assert(this.observer, this.auth, "internal-error"), this.observer.next.bind(this.observer);
    }
  };
  var S = { async loadJS() {
    throw new Error("Unable to load external scripts");
  }, recaptchaV2Script: "", recaptchaEnterpriseScript: "", gapiScript: "" };
  function _loadJS(e) {
    return S.loadJS(e);
  }
  function _generateCallbackName(e) {
    return `__${e}${Math.floor(1e6 * Math.random())}`;
  }
  var MockReCaptcha = class {
    constructor(e) {
      this.auth = e, this.counter = 1e12, this._widgets = /* @__PURE__ */ new Map();
    }
    render(e, t) {
      const r = this.counter;
      return this._widgets.set(r, new MockWidget(e, this.auth.name, t || {})), this.counter++, r;
    }
    reset(e) {
      var t;
      const r = e || 1e12;
      null === (t = this._widgets.get(r)) || void 0 === t || t.delete(), this._widgets.delete(r);
    }
    getResponse(e) {
      var t;
      const r = e || 1e12;
      return (null === (t = this._widgets.get(r)) || void 0 === t ? void 0 : t.getResponse()) || "";
    }
    async execute(e) {
      var t;
      const r = e || 1e12;
      return null === (t = this._widgets.get(r)) || void 0 === t || t.execute(), "";
    }
  };
  var MockGreCAPTCHATopLevel = class {
    constructor() {
      this.enterprise = new MockGreCAPTCHA();
    }
    ready(e) {
      e();
    }
    execute(e, t) {
      return Promise.resolve("token");
    }
    render(e, t) {
      return "";
    }
  };
  var MockGreCAPTCHA = class {
    ready(e) {
      e();
    }
    execute(e, t) {
      return Promise.resolve("token");
    }
    render(e, t) {
      return "";
    }
  };
  var MockWidget = class {
    constructor(e, t, r) {
      this.params = r, this.timerId = null, this.deleted = false, this.responseToken = null, this.clickHandler = () => {
        this.execute();
      };
      const n = "string" == typeof e ? document.getElementById(e) : e;
      _assert(n, "argument-error", { appName: t }), this.container = n, this.isVisible = "invisible" !== this.params.size, this.isVisible ? this.execute() : this.container.addEventListener("click", this.clickHandler);
    }
    getResponse() {
      return this.checkIfDeleted(), this.responseToken;
    }
    delete() {
      this.checkIfDeleted(), this.deleted = true, this.timerId && (clearTimeout(this.timerId), this.timerId = null), this.container.removeEventListener("click", this.clickHandler);
    }
    execute() {
      this.checkIfDeleted(), this.timerId || (this.timerId = window.setTimeout((() => {
        this.responseToken = (function generateRandomAlphaNumericString(e2) {
          const t2 = [], r = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
          for (let n = 0; n < e2; n++) t2.push(r.charAt(Math.floor(Math.random() * r.length)));
          return t2.join("");
        })(50);
        const { callback: e, "expired-callback": t } = this.params;
        if (e) try {
          e(this.responseToken);
        } catch (e2) {
        }
        this.timerId = window.setTimeout((() => {
          if (this.timerId = null, this.responseToken = null, t) try {
            t();
          } catch (e2) {
          }
          this.isVisible && this.execute();
        }), 6e4);
      }), 500));
    }
    checkIfDeleted() {
      if (this.deleted) throw new Error("reCAPTCHA mock was already deleted!");
    }
  };
  var RecaptchaEnterpriseVerifier = class {
    constructor(e) {
      this.type = "recaptcha-enterprise", this.auth = _castAuth(e);
    }
    async verify(e = "verify", t = false) {
      function retrieveRecaptchaToken(t2, r, n) {
        const i2 = window.grecaptcha;
        isEnterprise(i2) ? i2.enterprise.ready((() => {
          i2.enterprise.execute(t2, { action: e }).then(((e2) => {
            r(e2);
          })).catch((() => {
            r("NO_RECAPTCHA");
          }));
        })) : n(Error("No reCAPTCHA enterprise script loaded."));
      }
      if (this.auth.settings.appVerificationDisabledForTesting) {
        return new MockGreCAPTCHATopLevel().execute("siteKey", { action: "verify" });
      }
      return new Promise(((e2, r) => {
        (async function retrieveSiteKey(e3) {
          if (!t) {
            if (null == e3.tenantId && null != e3._agentRecaptchaConfig) return e3._agentRecaptchaConfig.siteKey;
            if (null != e3.tenantId && void 0 !== e3._tenantRecaptchaConfigs[e3.tenantId]) return e3._tenantRecaptchaConfigs[e3.tenantId].siteKey;
          }
          return new Promise((async (t2, r2) => {
            getRecaptchaConfig(e3, { clientType: "CLIENT_TYPE_WEB", version: "RECAPTCHA_ENTERPRISE" }).then(((n) => {
              if (void 0 !== n.recaptchaKey) {
                const r3 = new RecaptchaConfig(n);
                return null == e3.tenantId ? e3._agentRecaptchaConfig = r3 : e3._tenantRecaptchaConfigs[e3.tenantId] = r3, t2(r3.siteKey);
              }
              r2(new Error("recaptcha Enterprise site key undefined"));
            })).catch(((e4) => {
              r2(e4);
            }));
          }));
        })(this.auth).then(((n) => {
          if (!t && isEnterprise(window.grecaptcha)) retrieveRecaptchaToken(n, e2, r);
          else {
            if ("undefined" == typeof window) return void r(new Error("RecaptchaVerifier is only supported in browser"));
            let t2 = (function _recaptchaEnterpriseScriptUrl() {
              return S.recaptchaEnterpriseScript;
            })();
            0 !== t2.length && (t2 += n), _loadJS(t2).then((() => {
              retrieveRecaptchaToken(n, e2, r);
            })).catch(((e3) => {
              r(e3);
            }));
          }
        })).catch(((e3) => {
          r(e3);
        }));
      }));
    }
  };
  async function injectRecaptchaFields(e, t, r, n = false, i2 = false) {
    const s3 = new RecaptchaEnterpriseVerifier(e);
    let o3;
    if (i2) o3 = "NO_RECAPTCHA";
    else try {
      o3 = await s3.verify(r);
    } catch (e2) {
      o3 = await s3.verify(r, true);
    }
    const a3 = Object.assign({}, t);
    if ("mfaSmsEnrollment" === r || "mfaSmsSignIn" === r) {
      if ("phoneEnrollmentInfo" in a3) {
        const e2 = a3.phoneEnrollmentInfo.phoneNumber, t2 = a3.phoneEnrollmentInfo.recaptchaToken;
        Object.assign(a3, { phoneEnrollmentInfo: { phoneNumber: e2, recaptchaToken: t2, captchaResponse: o3, clientType: "CLIENT_TYPE_WEB", recaptchaVersion: "RECAPTCHA_ENTERPRISE" } });
      } else if ("phoneSignInInfo" in a3) {
        const e2 = a3.phoneSignInInfo.recaptchaToken;
        Object.assign(a3, { phoneSignInInfo: { recaptchaToken: e2, captchaResponse: o3, clientType: "CLIENT_TYPE_WEB", recaptchaVersion: "RECAPTCHA_ENTERPRISE" } });
      }
      return a3;
    }
    return n ? Object.assign(a3, { captchaResp: o3 }) : Object.assign(a3, { captchaResponse: o3 }), Object.assign(a3, { clientType: "CLIENT_TYPE_WEB" }), Object.assign(a3, { recaptchaVersion: "RECAPTCHA_ENTERPRISE" }), a3;
  }
  async function handleRecaptchaFlow(e, t, r, n, i2) {
    var s3, o3;
    if ("EMAIL_PASSWORD_PROVIDER" === i2) {
      if (null === (s3 = e._getRecaptchaConfig()) || void 0 === s3 ? void 0 : s3.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")) {
        const i3 = await injectRecaptchaFields(e, t, r, "getOobCode" === r);
        return n(e, i3);
      }
      return n(e, t).catch((async (i3) => {
        if ("auth/missing-recaptcha-token" === i3.code) {
          console.log(`${r} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);
          const i4 = await injectRecaptchaFields(e, t, r, "getOobCode" === r);
          return n(e, i4);
        }
        return Promise.reject(i3);
      }));
    }
    if ("PHONE_PROVIDER" === i2) {
      if (null === (o3 = e._getRecaptchaConfig()) || void 0 === o3 ? void 0 : o3.isProviderEnabled("PHONE_PROVIDER")) {
        const i3 = await injectRecaptchaFields(e, t, r);
        return n(e, i3).catch((async (i4) => {
          var s4;
          if ("AUDIT" === (null === (s4 = e._getRecaptchaConfig()) || void 0 === s4 ? void 0 : s4.getProviderEnforcementState("PHONE_PROVIDER")) && ("auth/missing-recaptcha-token" === i4.code || "auth/invalid-app-credential" === i4.code)) {
            console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${r} flow.`);
            const i5 = await injectRecaptchaFields(e, t, r, false, true);
            return n(e, i5);
          }
          return Promise.reject(i4);
        }));
      }
      {
        const i3 = await injectRecaptchaFields(e, t, r, false, true);
        return n(e, i3);
      }
    }
    return Promise.reject(i2 + " provider is not supported.");
  }
  async function _initializeRecaptchaConfig(e) {
    const t = _castAuth(e), r = await getRecaptchaConfig(t, { clientType: "CLIENT_TYPE_WEB", version: "RECAPTCHA_ENTERPRISE" }), n = new RecaptchaConfig(r);
    if (null == t.tenantId ? t._agentRecaptchaConfig = n : t._tenantRecaptchaConfigs[t.tenantId] = n, n.isAnyProviderEnabled()) {
      new RecaptchaEnterpriseVerifier(t).verify();
    }
  }
  function initializeAuth(e, t) {
    const r = _getProvider(e, "auth");
    if (r.isInitialized()) {
      const e2 = r.getImmediate();
      if (deepEqual2(r.getOptions(), null != t ? t : {})) return e2;
      _fail(e2, "already-initialized");
    }
    return r.initialize({ options: t });
  }
  function connectAuthEmulator(e, t, r) {
    const n = _castAuth(e);
    _assert(n._canInitEmulator, n, "emulator-config-failed"), _assert(/^https?:\/\//.test(t), n, "invalid-emulator-scheme");
    const i2 = !!(null == r ? void 0 : r.disableWarnings), s3 = extractProtocol(t), { host: o3, port: a3 } = (function extractHostAndPort(e2) {
      const t2 = extractProtocol(e2), r2 = /(\/\/)?([^?#/]+)/.exec(e2.substr(t2.length));
      if (!r2) return { host: "", port: null };
      const n2 = r2[2].split("@").pop() || "", i3 = /^(\[[^\]]+\])(:|$)/.exec(n2);
      if (i3) {
        const e3 = i3[1];
        return { host: e3, port: parsePort(n2.substr(e3.length + 1)) };
      }
      {
        const [e3, t3] = n2.split(":");
        return { host: e3, port: parsePort(t3) };
      }
    })(t), c3 = null === a3 ? "" : `:${a3}`;
    n.config.emulator = { url: `${s3}//${o3}${c3}/` }, n.settings.appVerificationDisabledForTesting = true, n.emulatorConfig = Object.freeze({ host: o3, port: a3, protocol: s3.replace(":", ""), options: Object.freeze({ disableWarnings: i2 }) }), i2 || (function emitEmulatorWarning() {
      function attachBanner() {
        const e2 = document.createElement("p"), t2 = e2.style;
        e2.innerText = "Running in emulator mode. Do not use with production credentials.", t2.position = "fixed", t2.width = "100%", t2.backgroundColor = "#ffffff", t2.border = ".1em solid #000000", t2.color = "#b50000", t2.bottom = "0px", t2.left = "0px", t2.margin = "0px", t2.zIndex = "10000", t2.textAlign = "center", e2.classList.add("firebase-emulator-warning"), document.body.appendChild(e2);
      }
      "undefined" != typeof console && "function" == typeof console.info && console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials.");
      "undefined" != typeof window && "undefined" != typeof document && ("loading" === document.readyState ? window.addEventListener("DOMContentLoaded", attachBanner) : attachBanner());
    })();
  }
  function extractProtocol(e) {
    const t = e.indexOf(":");
    return t < 0 ? "" : e.substr(0, t + 1);
  }
  function parsePort(e) {
    if (!e) return null;
    const t = Number(e);
    return isNaN(t) ? null : t;
  }
  var AuthCredential = class {
    constructor(e, t) {
      this.providerId = e, this.signInMethod = t;
    }
    toJSON() {
      return debugFail("not implemented");
    }
    _getIdTokenResponse(e) {
      return debugFail("not implemented");
    }
    _linkToIdToken(e, t) {
      return debugFail("not implemented");
    }
    _getReauthenticationResolver(e) {
      return debugFail("not implemented");
    }
  };
  async function resetPassword(e, t) {
    return _performApiRequest(e, "POST", "/v1/accounts:resetPassword", _addTidIfNecessary(e, t));
  }
  async function linkEmailPassword(e, t) {
    return _performApiRequest(e, "POST", "/v1/accounts:signUp", t);
  }
  async function signInWithPassword(e, t) {
    return _performSignInRequest(e, "POST", "/v1/accounts:signInWithPassword", _addTidIfNecessary(e, t));
  }
  async function sendOobCode(e, t) {
    return _performApiRequest(e, "POST", "/v1/accounts:sendOobCode", _addTidIfNecessary(e, t));
  }
  async function sendPasswordResetEmail$1(e, t) {
    return sendOobCode(e, t);
  }
  async function sendSignInLinkToEmail$1(e, t) {
    return sendOobCode(e, t);
  }
  var EmailAuthCredential = class _EmailAuthCredential extends AuthCredential {
    constructor(e, t, r, n = null) {
      super("password", r), this._email = e, this._password = t, this._tenantId = n;
    }
    static _fromEmailAndPassword(e, t) {
      return new _EmailAuthCredential(e, t, "password");
    }
    static _fromEmailAndCode(e, t, r = null) {
      return new _EmailAuthCredential(e, t, "emailLink", r);
    }
    toJSON() {
      return { email: this._email, password: this._password, signInMethod: this.signInMethod, tenantId: this._tenantId };
    }
    static fromJSON(e) {
      const t = "string" == typeof e ? JSON.parse(e) : e;
      if ((null == t ? void 0 : t.email) && (null == t ? void 0 : t.password)) {
        if ("password" === t.signInMethod) return this._fromEmailAndPassword(t.email, t.password);
        if ("emailLink" === t.signInMethod) return this._fromEmailAndCode(t.email, t.password, t.tenantId);
      }
      return null;
    }
    async _getIdTokenResponse(e) {
      switch (this.signInMethod) {
        case "password":
          return handleRecaptchaFlow(e, { returnSecureToken: true, email: this._email, password: this._password, clientType: "CLIENT_TYPE_WEB" }, "signInWithPassword", signInWithPassword, "EMAIL_PASSWORD_PROVIDER");
        case "emailLink":
          return (async function signInWithEmailLink$1(e2, t) {
            return _performSignInRequest(e2, "POST", "/v1/accounts:signInWithEmailLink", _addTidIfNecessary(e2, t));
          })(e, { email: this._email, oobCode: this._password });
        default:
          _fail(e, "internal-error");
      }
    }
    async _linkToIdToken(e, t) {
      switch (this.signInMethod) {
        case "password":
          return handleRecaptchaFlow(e, { idToken: t, returnSecureToken: true, email: this._email, password: this._password, clientType: "CLIENT_TYPE_WEB" }, "signUpPassword", linkEmailPassword, "EMAIL_PASSWORD_PROVIDER");
        case "emailLink":
          return (async function signInWithEmailLinkForLinking(e2, t2) {
            return _performSignInRequest(e2, "POST", "/v1/accounts:signInWithEmailLink", _addTidIfNecessary(e2, t2));
          })(e, { idToken: t, email: this._email, oobCode: this._password });
        default:
          _fail(e, "internal-error");
      }
    }
    _getReauthenticationResolver(e) {
      return this._getIdTokenResponse(e);
    }
  };
  async function signInWithIdp(e, t) {
    return _performSignInRequest(e, "POST", "/v1/accounts:signInWithIdp", _addTidIfNecessary(e, t));
  }
  var OAuthCredential = class _OAuthCredential extends AuthCredential {
    constructor() {
      super(...arguments), this.pendingToken = null;
    }
    static _fromParams(e) {
      const t = new _OAuthCredential(e.providerId, e.signInMethod);
      return e.idToken || e.accessToken ? (e.idToken && (t.idToken = e.idToken), e.accessToken && (t.accessToken = e.accessToken), e.nonce && !e.pendingToken && (t.nonce = e.nonce), e.pendingToken && (t.pendingToken = e.pendingToken)) : e.oauthToken && e.oauthTokenSecret ? (t.accessToken = e.oauthToken, t.secret = e.oauthTokenSecret) : _fail("argument-error"), t;
    }
    toJSON() {
      return { idToken: this.idToken, accessToken: this.accessToken, secret: this.secret, nonce: this.nonce, pendingToken: this.pendingToken, providerId: this.providerId, signInMethod: this.signInMethod };
    }
    static fromJSON(e) {
      const t = "string" == typeof e ? JSON.parse(e) : e, { providerId: r, signInMethod: n } = t, i2 = __rest(t, ["providerId", "signInMethod"]);
      if (!r || !n) return null;
      const s3 = new _OAuthCredential(r, n);
      return s3.idToken = i2.idToken || void 0, s3.accessToken = i2.accessToken || void 0, s3.secret = i2.secret, s3.nonce = i2.nonce, s3.pendingToken = i2.pendingToken || null, s3;
    }
    _getIdTokenResponse(e) {
      return signInWithIdp(e, this.buildRequest());
    }
    _linkToIdToken(e, t) {
      const r = this.buildRequest();
      return r.idToken = t, signInWithIdp(e, r);
    }
    _getReauthenticationResolver(e) {
      const t = this.buildRequest();
      return t.autoCreate = false, signInWithIdp(e, t);
    }
    buildRequest() {
      const e = { requestUri: "http://localhost", returnSecureToken: true };
      if (this.pendingToken) e.pendingToken = this.pendingToken;
      else {
        const t = {};
        this.idToken && (t.id_token = this.idToken), this.accessToken && (t.access_token = this.accessToken), this.secret && (t.oauth_token_secret = this.secret), t.providerId = this.providerId, this.nonce && !this.pendingToken && (t.nonce = this.nonce), e.postBody = querystring(t);
      }
      return e;
    }
  };
  async function sendPhoneVerificationCode(e, t) {
    return _performApiRequest(e, "POST", "/v1/accounts:sendVerificationCode", _addTidIfNecessary(e, t));
  }
  var P = { USER_NOT_FOUND: "user-not-found" };
  var PhoneAuthCredential = class _PhoneAuthCredential extends AuthCredential {
    constructor(e) {
      super("phone", "phone"), this.params = e;
    }
    static _fromVerification(e, t) {
      return new _PhoneAuthCredential({ verificationId: e, verificationCode: t });
    }
    static _fromTokenResponse(e, t) {
      return new _PhoneAuthCredential({ phoneNumber: e, temporaryProof: t });
    }
    _getIdTokenResponse(e) {
      return (async function signInWithPhoneNumber$1(e2, t) {
        return _performSignInRequest(e2, "POST", "/v1/accounts:signInWithPhoneNumber", _addTidIfNecessary(e2, t));
      })(e, this._makeVerificationRequest());
    }
    _linkToIdToken(e, t) {
      return (async function linkWithPhoneNumber$1(e2, t2) {
        const r = await _performSignInRequest(e2, "POST", "/v1/accounts:signInWithPhoneNumber", _addTidIfNecessary(e2, t2));
        if (r.temporaryProof) throw _makeTaggedError(e2, "account-exists-with-different-credential", r);
        return r;
      })(e, Object.assign({ idToken: t }, this._makeVerificationRequest()));
    }
    _getReauthenticationResolver(e) {
      return (async function verifyPhoneNumberForExisting(e2, t) {
        return _performSignInRequest(e2, "POST", "/v1/accounts:signInWithPhoneNumber", _addTidIfNecessary(e2, Object.assign(Object.assign({}, t), { operation: "REAUTH" })), P);
      })(e, this._makeVerificationRequest());
    }
    _makeVerificationRequest() {
      const { temporaryProof: e, phoneNumber: t, verificationId: r, verificationCode: n } = this.params;
      return e && t ? { temporaryProof: e, phoneNumber: t } : { sessionInfo: r, code: n };
    }
    toJSON() {
      const e = { providerId: this.providerId };
      return this.params.phoneNumber && (e.phoneNumber = this.params.phoneNumber), this.params.temporaryProof && (e.temporaryProof = this.params.temporaryProof), this.params.verificationCode && (e.verificationCode = this.params.verificationCode), this.params.verificationId && (e.verificationId = this.params.verificationId), e;
    }
    static fromJSON(e) {
      "string" == typeof e && (e = JSON.parse(e));
      const { verificationId: t, verificationCode: r, phoneNumber: n, temporaryProof: i2 } = e;
      return r || t || n || i2 ? new _PhoneAuthCredential({ verificationId: t, verificationCode: r, phoneNumber: n, temporaryProof: i2 }) : null;
    }
  };
  var ActionCodeURL = class _ActionCodeURL {
    constructor(e) {
      var t, r, n, i2, s3, o3;
      const a3 = querystringDecode(extractQuerystring(e)), c3 = null !== (t = a3.apiKey) && void 0 !== t ? t : null, u3 = null !== (r = a3.oobCode) && void 0 !== r ? r : null, d3 = (function parseMode(e2) {
        switch (e2) {
          case "recoverEmail":
            return "RECOVER_EMAIL";
          case "resetPassword":
            return "PASSWORD_RESET";
          case "signIn":
            return "EMAIL_SIGNIN";
          case "verifyEmail":
            return "VERIFY_EMAIL";
          case "verifyAndChangeEmail":
            return "VERIFY_AND_CHANGE_EMAIL";
          case "revertSecondFactorAddition":
            return "REVERT_SECOND_FACTOR_ADDITION";
          default:
            return null;
        }
      })(null !== (n = a3.mode) && void 0 !== n ? n : null);
      _assert(c3 && u3 && d3, "argument-error"), this.apiKey = c3, this.operation = d3, this.code = u3, this.continueUrl = null !== (i2 = a3.continueUrl) && void 0 !== i2 ? i2 : null, this.languageCode = null !== (s3 = a3.languageCode) && void 0 !== s3 ? s3 : null, this.tenantId = null !== (o3 = a3.tenantId) && void 0 !== o3 ? o3 : null;
    }
    static parseLink(e) {
      const t = (function parseDeepLink(e2) {
        const t2 = querystringDecode(extractQuerystring(e2)).link, r = t2 ? querystringDecode(extractQuerystring(t2)).deep_link_id : null, n = querystringDecode(extractQuerystring(e2)).deep_link_id;
        return (n ? querystringDecode(extractQuerystring(n)).link : null) || n || r || t2 || e2;
      })(e);
      try {
        return new _ActionCodeURL(t);
      } catch (e2) {
        return null;
      }
    }
  };
  function parseActionCodeURL(e) {
    return ActionCodeURL.parseLink(e);
  }
  var EmailAuthProvider = class _EmailAuthProvider {
    constructor() {
      this.providerId = _EmailAuthProvider.PROVIDER_ID;
    }
    static credential(e, t) {
      return EmailAuthCredential._fromEmailAndPassword(e, t);
    }
    static credentialWithLink(e, t) {
      const r = ActionCodeURL.parseLink(t);
      return _assert(r, "argument-error"), EmailAuthCredential._fromEmailAndCode(e, r.code, r.tenantId);
    }
  };
  EmailAuthProvider.PROVIDER_ID = "password", EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD = "password", EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD = "emailLink";
  var FederatedAuthProvider = class {
    constructor(e) {
      this.providerId = e, this.defaultLanguageCode = null, this.customParameters = {};
    }
    setDefaultLanguage(e) {
      this.defaultLanguageCode = e;
    }
    setCustomParameters(e) {
      return this.customParameters = e, this;
    }
    getCustomParameters() {
      return this.customParameters;
    }
  };
  var BaseOAuthProvider = class extends FederatedAuthProvider {
    constructor() {
      super(...arguments), this.scopes = [];
    }
    addScope(e) {
      return this.scopes.includes(e) || this.scopes.push(e), this;
    }
    getScopes() {
      return [...this.scopes];
    }
  };
  var OAuthProvider = class _OAuthProvider extends BaseOAuthProvider {
    static credentialFromJSON(e) {
      const t = "string" == typeof e ? JSON.parse(e) : e;
      return _assert("providerId" in t && "signInMethod" in t, "argument-error"), OAuthCredential._fromParams(t);
    }
    credential(e) {
      return this._credential(Object.assign(Object.assign({}, e), { nonce: e.rawNonce }));
    }
    _credential(e) {
      return _assert(e.idToken || e.accessToken, "argument-error"), OAuthCredential._fromParams(Object.assign(Object.assign({}, e), { providerId: this.providerId, signInMethod: this.providerId }));
    }
    static credentialFromResult(e) {
      return _OAuthProvider.oauthCredentialFromTaggedObject(e);
    }
    static credentialFromError(e) {
      return _OAuthProvider.oauthCredentialFromTaggedObject(e.customData || {});
    }
    static oauthCredentialFromTaggedObject({ _tokenResponse: e }) {
      if (!e) return null;
      const { oauthIdToken: t, oauthAccessToken: r, oauthTokenSecret: n, pendingToken: i2, nonce: s3, providerId: o3 } = e;
      if (!(r || n || t || i2)) return null;
      if (!o3) return null;
      try {
        return new _OAuthProvider(o3)._credential({ idToken: t, accessToken: r, nonce: s3, pendingToken: i2 });
      } catch (e2) {
        return null;
      }
    }
  };
  var FacebookAuthProvider = class _FacebookAuthProvider extends BaseOAuthProvider {
    constructor() {
      super("facebook.com");
    }
    static credential(e) {
      return OAuthCredential._fromParams({ providerId: _FacebookAuthProvider.PROVIDER_ID, signInMethod: _FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD, accessToken: e });
    }
    static credentialFromResult(e) {
      return _FacebookAuthProvider.credentialFromTaggedObject(e);
    }
    static credentialFromError(e) {
      return _FacebookAuthProvider.credentialFromTaggedObject(e.customData || {});
    }
    static credentialFromTaggedObject({ _tokenResponse: e }) {
      if (!e || !("oauthAccessToken" in e)) return null;
      if (!e.oauthAccessToken) return null;
      try {
        return _FacebookAuthProvider.credential(e.oauthAccessToken);
      } catch (e2) {
        return null;
      }
    }
  };
  FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD = "facebook.com", FacebookAuthProvider.PROVIDER_ID = "facebook.com";
  var GoogleAuthProvider = class _GoogleAuthProvider extends BaseOAuthProvider {
    constructor() {
      super("google.com"), this.addScope("profile");
    }
    static credential(e, t) {
      return OAuthCredential._fromParams({ providerId: _GoogleAuthProvider.PROVIDER_ID, signInMethod: _GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD, idToken: e, accessToken: t });
    }
    static credentialFromResult(e) {
      return _GoogleAuthProvider.credentialFromTaggedObject(e);
    }
    static credentialFromError(e) {
      return _GoogleAuthProvider.credentialFromTaggedObject(e.customData || {});
    }
    static credentialFromTaggedObject({ _tokenResponse: e }) {
      if (!e) return null;
      const { oauthIdToken: t, oauthAccessToken: r } = e;
      if (!t && !r) return null;
      try {
        return _GoogleAuthProvider.credential(t, r);
      } catch (e2) {
        return null;
      }
    }
  };
  GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD = "google.com", GoogleAuthProvider.PROVIDER_ID = "google.com";
  var GithubAuthProvider = class _GithubAuthProvider extends BaseOAuthProvider {
    constructor() {
      super("github.com");
    }
    static credential(e) {
      return OAuthCredential._fromParams({ providerId: _GithubAuthProvider.PROVIDER_ID, signInMethod: _GithubAuthProvider.GITHUB_SIGN_IN_METHOD, accessToken: e });
    }
    static credentialFromResult(e) {
      return _GithubAuthProvider.credentialFromTaggedObject(e);
    }
    static credentialFromError(e) {
      return _GithubAuthProvider.credentialFromTaggedObject(e.customData || {});
    }
    static credentialFromTaggedObject({ _tokenResponse: e }) {
      if (!e || !("oauthAccessToken" in e)) return null;
      if (!e.oauthAccessToken) return null;
      try {
        return _GithubAuthProvider.credential(e.oauthAccessToken);
      } catch (e2) {
        return null;
      }
    }
  };
  GithubAuthProvider.GITHUB_SIGN_IN_METHOD = "github.com", GithubAuthProvider.PROVIDER_ID = "github.com";
  var SAMLAuthCredential = class _SAMLAuthCredential extends AuthCredential {
    constructor(e, t) {
      super(e, e), this.pendingToken = t;
    }
    _getIdTokenResponse(e) {
      return signInWithIdp(e, this.buildRequest());
    }
    _linkToIdToken(e, t) {
      const r = this.buildRequest();
      return r.idToken = t, signInWithIdp(e, r);
    }
    _getReauthenticationResolver(e) {
      const t = this.buildRequest();
      return t.autoCreate = false, signInWithIdp(e, t);
    }
    toJSON() {
      return { signInMethod: this.signInMethod, providerId: this.providerId, pendingToken: this.pendingToken };
    }
    static fromJSON(e) {
      const t = "string" == typeof e ? JSON.parse(e) : e, { providerId: r, signInMethod: n, pendingToken: i2 } = t;
      return r && n && i2 && r === n ? new _SAMLAuthCredential(r, i2) : null;
    }
    static _create(e, t) {
      return new _SAMLAuthCredential(e, t);
    }
    buildRequest() {
      return { requestUri: "http://localhost", returnSecureToken: true, pendingToken: this.pendingToken };
    }
  };
  var SAMLAuthProvider = class _SAMLAuthProvider extends FederatedAuthProvider {
    constructor(e) {
      _assert(e.startsWith("saml."), "argument-error"), super(e);
    }
    static credentialFromResult(e) {
      return _SAMLAuthProvider.samlCredentialFromTaggedObject(e);
    }
    static credentialFromError(e) {
      return _SAMLAuthProvider.samlCredentialFromTaggedObject(e.customData || {});
    }
    static credentialFromJSON(e) {
      const t = SAMLAuthCredential.fromJSON(e);
      return _assert(t, "argument-error"), t;
    }
    static samlCredentialFromTaggedObject({ _tokenResponse: e }) {
      if (!e) return null;
      const { pendingToken: t, providerId: r } = e;
      if (!t || !r) return null;
      try {
        return SAMLAuthCredential._create(r, t);
      } catch (e2) {
        return null;
      }
    }
  };
  var TwitterAuthProvider = class _TwitterAuthProvider extends BaseOAuthProvider {
    constructor() {
      super("twitter.com");
    }
    static credential(e, t) {
      return OAuthCredential._fromParams({ providerId: _TwitterAuthProvider.PROVIDER_ID, signInMethod: _TwitterAuthProvider.TWITTER_SIGN_IN_METHOD, oauthToken: e, oauthTokenSecret: t });
    }
    static credentialFromResult(e) {
      return _TwitterAuthProvider.credentialFromTaggedObject(e);
    }
    static credentialFromError(e) {
      return _TwitterAuthProvider.credentialFromTaggedObject(e.customData || {});
    }
    static credentialFromTaggedObject({ _tokenResponse: e }) {
      if (!e) return null;
      const { oauthAccessToken: t, oauthTokenSecret: r } = e;
      if (!t || !r) return null;
      try {
        return _TwitterAuthProvider.credential(t, r);
      } catch (e2) {
        return null;
      }
    }
  };
  async function signUp(e, t) {
    return _performSignInRequest(e, "POST", "/v1/accounts:signUp", _addTidIfNecessary(e, t));
  }
  TwitterAuthProvider.TWITTER_SIGN_IN_METHOD = "twitter.com", TwitterAuthProvider.PROVIDER_ID = "twitter.com";
  var UserCredentialImpl = class _UserCredentialImpl {
    constructor(e) {
      this.user = e.user, this.providerId = e.providerId, this._tokenResponse = e._tokenResponse, this.operationType = e.operationType;
    }
    static async _fromIdTokenResponse(e, t, r, n = false) {
      const i2 = await UserImpl._fromIdTokenResponse(e, r, n), s3 = providerIdForResponse(r);
      return new _UserCredentialImpl({ user: i2, providerId: s3, _tokenResponse: r, operationType: t });
    }
    static async _forOperation(e, t, r) {
      await e._updateTokensIfNecessary(r, true);
      const n = providerIdForResponse(r);
      return new _UserCredentialImpl({ user: e, providerId: n, _tokenResponse: r, operationType: t });
    }
  };
  function providerIdForResponse(e) {
    return e.providerId ? e.providerId : "phoneNumber" in e ? "phone" : null;
  }
  async function signInAnonymously(t) {
    var r;
    if (_isFirebaseServerApp(t.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(t));
    const n = _castAuth(t);
    if (await n._initializationPromise, null === (r = n.currentUser) || void 0 === r ? void 0 : r.isAnonymous) return new UserCredentialImpl({ user: n.currentUser, providerId: null, operationType: "signIn" });
    const i2 = await signUp(n, { returnSecureToken: true }), s3 = await UserCredentialImpl._fromIdTokenResponse(n, "signIn", i2, true);
    return await n._updateCurrentUser(s3.user), s3;
  }
  var MultiFactorError = class _MultiFactorError extends FirebaseError2 {
    constructor(e, t, r, n) {
      var i2;
      super(t.code, t.message), this.operationType = r, this.user = n, Object.setPrototypeOf(this, _MultiFactorError.prototype), this.customData = { appName: e.name, tenantId: null !== (i2 = e.tenantId) && void 0 !== i2 ? i2 : void 0, _serverResponse: t.customData._serverResponse, operationType: r };
    }
    static _fromErrorAndOperation(e, t, r, n) {
      return new _MultiFactorError(e, t, r, n);
    }
  };
  function _processCredentialSavingMfaContextIfNecessary(e, t, r, n) {
    return ("reauthenticate" === t ? r._getReauthenticationResolver(e) : r._getIdTokenResponse(e)).catch(((r2) => {
      if ("auth/multi-factor-auth-required" === r2.code) throw MultiFactorError._fromErrorAndOperation(e, r2, t, n);
      throw r2;
    }));
  }
  function providerDataAsNames(e) {
    return new Set(e.map((({ providerId: e2 }) => e2)).filter(((e2) => !!e2)));
  }
  async function unlink(e, t) {
    const r = getModularInstance(e);
    await _assertLinkedStatus(true, r, t);
    const { providerUserInfo: n } = await (async function deleteLinkedAccounts(e2, t2) {
      return _performApiRequest(e2, "POST", "/v1/accounts:update", t2);
    })(r.auth, { idToken: await r.getIdToken(), deleteProvider: [t] }), i2 = providerDataAsNames(n || []);
    return r.providerData = r.providerData.filter(((e2) => i2.has(e2.providerId))), i2.has("phone") || (r.phoneNumber = null), await r.auth._persistUserIfCurrent(r), r;
  }
  async function _link$1(e, t, r = false) {
    const n = await _logoutIfInvalidated(e, t._linkToIdToken(e.auth, await e.getIdToken()), r);
    return UserCredentialImpl._forOperation(e, "link", n);
  }
  async function _assertLinkedStatus(e, t, r) {
    await _reloadWithoutSaving(t);
    const n = false === e ? "provider-already-linked" : "no-such-provider";
    _assert(providerDataAsNames(t.providerData).has(r) === e, t.auth, n);
  }
  async function _reauthenticate(t, r, n = false) {
    const { auth: i2 } = t;
    if (_isFirebaseServerApp(i2.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(i2));
    const s3 = "reauthenticate";
    try {
      const e = await _logoutIfInvalidated(t, _processCredentialSavingMfaContextIfNecessary(i2, s3, r, t), n);
      _assert(e.idToken, i2, "internal-error");
      const o3 = _parseToken(e.idToken);
      _assert(o3, i2, "internal-error");
      const { sub: a3 } = o3;
      return _assert(t.uid === a3, i2, "user-mismatch"), UserCredentialImpl._forOperation(t, s3, e);
    } catch (e) {
      throw "auth/user-not-found" === (null == e ? void 0 : e.code) && _fail(i2, "user-mismatch"), e;
    }
  }
  async function _signInWithCredential(t, r, n = false) {
    if (_isFirebaseServerApp(t.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(t));
    const i2 = "signIn", s3 = await _processCredentialSavingMfaContextIfNecessary(t, i2, r), o3 = await UserCredentialImpl._fromIdTokenResponse(t, i2, s3);
    return n || await t._updateCurrentUser(o3.user), o3;
  }
  async function signInWithCredential(e, t) {
    return _signInWithCredential(_castAuth(e), t);
  }
  async function linkWithCredential(e, t) {
    const r = getModularInstance(e);
    return await _assertLinkedStatus(false, r, t.providerId), _link$1(r, t);
  }
  async function reauthenticateWithCredential(e, t) {
    return _reauthenticate(getModularInstance(e), t);
  }
  async function signInWithCustomToken(t, r) {
    if (_isFirebaseServerApp(t.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(t));
    const n = _castAuth(t), i2 = await (async function signInWithCustomToken$1(e, t2) {
      return _performSignInRequest(e, "POST", "/v1/accounts:signInWithCustomToken", _addTidIfNecessary(e, t2));
    })(n, { token: r, returnSecureToken: true }), s3 = await UserCredentialImpl._fromIdTokenResponse(n, "signIn", i2);
    return await n._updateCurrentUser(s3.user), s3;
  }
  var MultiFactorInfoImpl = class {
    constructor(e, t) {
      this.factorId = e, this.uid = t.mfaEnrollmentId, this.enrollmentTime = new Date(t.enrolledAt).toUTCString(), this.displayName = t.displayName;
    }
    static _fromServerResponse(e, t) {
      return "phoneInfo" in t ? PhoneMultiFactorInfoImpl._fromServerResponse(e, t) : "totpInfo" in t ? TotpMultiFactorInfoImpl._fromServerResponse(e, t) : _fail(e, "internal-error");
    }
  };
  var PhoneMultiFactorInfoImpl = class _PhoneMultiFactorInfoImpl extends MultiFactorInfoImpl {
    constructor(e) {
      super("phone", e), this.phoneNumber = e.phoneInfo;
    }
    static _fromServerResponse(e, t) {
      return new _PhoneMultiFactorInfoImpl(t);
    }
  };
  var TotpMultiFactorInfoImpl = class _TotpMultiFactorInfoImpl extends MultiFactorInfoImpl {
    constructor(e) {
      super("totp", e);
    }
    static _fromServerResponse(e, t) {
      return new _TotpMultiFactorInfoImpl(t);
    }
  };
  function _setActionCodeSettingsOnRequest(e, t, r) {
    var n;
    _assert((null === (n = r.url) || void 0 === n ? void 0 : n.length) > 0, e, "invalid-continue-uri"), _assert(void 0 === r.dynamicLinkDomain || r.dynamicLinkDomain.length > 0, e, "invalid-dynamic-link-domain"), t.continueUrl = r.url, t.dynamicLinkDomain = r.dynamicLinkDomain, t.canHandleCodeInApp = r.handleCodeInApp, r.iOS && (_assert(r.iOS.bundleId.length > 0, e, "missing-ios-bundle-id"), t.iOSBundleId = r.iOS.bundleId), r.android && (_assert(r.android.packageName.length > 0, e, "missing-android-pkg-name"), t.androidInstallApp = r.android.installApp, t.androidMinimumVersionCode = r.android.minimumVersion, t.androidPackageName = r.android.packageName);
  }
  async function recachePasswordPolicy(e) {
    const t = _castAuth(e);
    t._getPasswordPolicyInternal() && await t._updatePasswordPolicy();
  }
  async function sendPasswordResetEmail(e, t, r) {
    const n = _castAuth(e), i2 = { requestType: "PASSWORD_RESET", email: t, clientType: "CLIENT_TYPE_WEB" };
    r && _setActionCodeSettingsOnRequest(n, i2, r), await handleRecaptchaFlow(n, i2, "getOobCode", sendPasswordResetEmail$1, "EMAIL_PASSWORD_PROVIDER");
  }
  async function confirmPasswordReset(e, t, r) {
    await resetPassword(getModularInstance(e), { oobCode: t, newPassword: r }).catch((async (t2) => {
      throw "auth/password-does-not-meet-requirements" === t2.code && recachePasswordPolicy(e), t2;
    }));
  }
  async function applyActionCode(e, t) {
    await (async function applyActionCode$1(e2, t2) {
      return _performApiRequest(e2, "POST", "/v1/accounts:update", _addTidIfNecessary(e2, t2));
    })(getModularInstance(e), { oobCode: t });
  }
  async function checkActionCode(e, t) {
    const r = getModularInstance(e), n = await resetPassword(r, { oobCode: t }), i2 = n.requestType;
    switch (_assert(i2, r, "internal-error"), i2) {
      case "EMAIL_SIGNIN":
        break;
      case "VERIFY_AND_CHANGE_EMAIL":
        _assert(n.newEmail, r, "internal-error");
        break;
      case "REVERT_SECOND_FACTOR_ADDITION":
        _assert(n.mfaInfo, r, "internal-error");
      default:
        _assert(n.email, r, "internal-error");
    }
    let s3 = null;
    return n.mfaInfo && (s3 = MultiFactorInfoImpl._fromServerResponse(_castAuth(r), n.mfaInfo)), { data: { email: ("VERIFY_AND_CHANGE_EMAIL" === n.requestType ? n.newEmail : n.email) || null, previousEmail: ("VERIFY_AND_CHANGE_EMAIL" === n.requestType ? n.email : n.newEmail) || null, multiFactorInfo: s3 }, operation: i2 };
  }
  async function verifyPasswordResetCode(e, t) {
    const { data: r } = await checkActionCode(getModularInstance(e), t);
    return r.email;
  }
  async function createUserWithEmailAndPassword(t, r, n) {
    if (_isFirebaseServerApp(t.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(t));
    const i2 = _castAuth(t), s3 = handleRecaptchaFlow(i2, { returnSecureToken: true, email: r, password: n, clientType: "CLIENT_TYPE_WEB" }, "signUpPassword", signUp, "EMAIL_PASSWORD_PROVIDER"), o3 = await s3.catch(((e) => {
      throw "auth/password-does-not-meet-requirements" === e.code && recachePasswordPolicy(t), e;
    })), a3 = await UserCredentialImpl._fromIdTokenResponse(i2, "signIn", o3);
    return await i2._updateCurrentUser(a3.user), a3;
  }
  function signInWithEmailAndPassword(t, r, n) {
    return _isFirebaseServerApp(t.app) ? Promise.reject(_serverAppCurrentUserOperationNotSupportedError(t)) : signInWithCredential(getModularInstance(t), EmailAuthProvider.credential(r, n)).catch((async (e) => {
      throw "auth/password-does-not-meet-requirements" === e.code && recachePasswordPolicy(t), e;
    }));
  }
  async function sendSignInLinkToEmail(e, t, r) {
    const n = _castAuth(e), i2 = { requestType: "EMAIL_SIGNIN", email: t, clientType: "CLIENT_TYPE_WEB" };
    !(function setActionCodeSettings(e2, t2) {
      _assert(t2.handleCodeInApp, n, "argument-error"), t2 && _setActionCodeSettingsOnRequest(n, e2, t2);
    })(i2, r), await handleRecaptchaFlow(n, i2, "getOobCode", sendSignInLinkToEmail$1, "EMAIL_PASSWORD_PROVIDER");
  }
  function isSignInWithEmailLink(e, t) {
    const r = ActionCodeURL.parseLink(t);
    return "EMAIL_SIGNIN" === (null == r ? void 0 : r.operation);
  }
  async function signInWithEmailLink(t, r, n) {
    if (_isFirebaseServerApp(t.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(t));
    const i2 = getModularInstance(t), s3 = EmailAuthProvider.credentialWithLink(r, n || _getCurrentUrl());
    return _assert(s3._tenantId === (i2.tenantId || null), i2, "tenant-id-mismatch"), signInWithCredential(i2, s3);
  }
  async function fetchSignInMethodsForEmail(e, t) {
    const r = { identifier: t, continueUri: _isHttpOrHttps() ? _getCurrentUrl() : "http://localhost" }, { signinMethods: n } = await (async function createAuthUri(e2, t2) {
      return _performApiRequest(e2, "POST", "/v1/accounts:createAuthUri", _addTidIfNecessary(e2, t2));
    })(getModularInstance(e), r);
    return n || [];
  }
  async function sendEmailVerification(e, t) {
    const r = getModularInstance(e), n = { requestType: "VERIFY_EMAIL", idToken: await e.getIdToken() };
    t && _setActionCodeSettingsOnRequest(r.auth, n, t);
    const { email: i2 } = await (async function sendEmailVerification$1(e2, t2) {
      return sendOobCode(e2, t2);
    })(r.auth, n);
    i2 !== e.email && await e.reload();
  }
  async function verifyBeforeUpdateEmail(e, t, r) {
    const n = getModularInstance(e), i2 = { requestType: "VERIFY_AND_CHANGE_EMAIL", idToken: await e.getIdToken(), newEmail: t };
    r && _setActionCodeSettingsOnRequest(n.auth, i2, r);
    const { email: s3 } = await (async function verifyAndChangeEmail(e2, t2) {
      return sendOobCode(e2, t2);
    })(n.auth, i2);
    s3 !== e.email && await e.reload();
  }
  async function updateProfile(e, { displayName: t, photoURL: r }) {
    if (void 0 === t && void 0 === r) return;
    const n = getModularInstance(e), i2 = { idToken: await n.getIdToken(), displayName: t, photoUrl: r, returnSecureToken: true }, s3 = await _logoutIfInvalidated(n, (async function updateProfile$1(e2, t2) {
      return _performApiRequest(e2, "POST", "/v1/accounts:update", t2);
    })(n.auth, i2));
    n.displayName = s3.displayName || null, n.photoURL = s3.photoUrl || null;
    const o3 = n.providerData.find((({ providerId: e2 }) => "password" === e2));
    o3 && (o3.displayName = n.displayName, o3.photoURL = n.photoURL), await n._updateTokensIfNecessary(s3);
  }
  function updateEmail(t, r) {
    const n = getModularInstance(t);
    return _isFirebaseServerApp(n.auth.app) ? Promise.reject(_serverAppCurrentUserOperationNotSupportedError(n.auth)) : updateEmailOrPassword(n, r, null);
  }
  function updatePassword(e, t) {
    return updateEmailOrPassword(getModularInstance(e), null, t);
  }
  async function updateEmailOrPassword(e, t, r) {
    const { auth: n } = e, i2 = { idToken: await e.getIdToken(), returnSecureToken: true };
    t && (i2.email = t), r && (i2.password = r);
    const s3 = await _logoutIfInvalidated(e, (async function updateEmailPassword(e2, t2) {
      return _performApiRequest(e2, "POST", "/v1/accounts:update", t2);
    })(n, i2));
    await e._updateTokensIfNecessary(s3, true);
  }
  var GenericAdditionalUserInfo = class {
    constructor(e, t, r = {}) {
      this.isNewUser = e, this.providerId = t, this.profile = r;
    }
  };
  var FederatedAdditionalUserInfoWithUsername = class extends GenericAdditionalUserInfo {
    constructor(e, t, r, n) {
      super(e, t, r), this.username = n;
    }
  };
  var FacebookAdditionalUserInfo = class extends GenericAdditionalUserInfo {
    constructor(e, t) {
      super(e, "facebook.com", t);
    }
  };
  var GithubAdditionalUserInfo = class extends FederatedAdditionalUserInfoWithUsername {
    constructor(e, t) {
      super(e, "github.com", t, "string" == typeof (null == t ? void 0 : t.login) ? null == t ? void 0 : t.login : null);
    }
  };
  var GoogleAdditionalUserInfo = class extends GenericAdditionalUserInfo {
    constructor(e, t) {
      super(e, "google.com", t);
    }
  };
  var TwitterAdditionalUserInfo = class extends FederatedAdditionalUserInfoWithUsername {
    constructor(e, t, r) {
      super(e, "twitter.com", t, r);
    }
  };
  function getAdditionalUserInfo(e) {
    const { user: t, _tokenResponse: r } = e;
    return t.isAnonymous && !r ? { providerId: null, isNewUser: false, profile: null } : (function _fromIdTokenResponse(e2) {
      var t2, r2;
      if (!e2) return null;
      const { providerId: n } = e2, i2 = e2.rawUserInfo ? JSON.parse(e2.rawUserInfo) : {}, s3 = e2.isNewUser || "identitytoolkit#SignupNewUserResponse" === e2.kind;
      if (!n && (null == e2 ? void 0 : e2.idToken)) {
        const n2 = null === (r2 = null === (t2 = _parseToken(e2.idToken)) || void 0 === t2 ? void 0 : t2.firebase) || void 0 === r2 ? void 0 : r2.sign_in_provider;
        if (n2) return new GenericAdditionalUserInfo(s3, "anonymous" !== n2 && "custom" !== n2 ? n2 : null);
      }
      if (!n) return null;
      switch (n) {
        case "facebook.com":
          return new FacebookAdditionalUserInfo(s3, i2);
        case "github.com":
          return new GithubAdditionalUserInfo(s3, i2);
        case "google.com":
          return new GoogleAdditionalUserInfo(s3, i2);
        case "twitter.com":
          return new TwitterAdditionalUserInfo(s3, i2, e2.screenName || null);
        case "custom":
        case "anonymous":
          return new GenericAdditionalUserInfo(s3, null);
        default:
          return new GenericAdditionalUserInfo(s3, n, i2);
      }
    })(r);
  }
  function setPersistence(e, t) {
    return getModularInstance(e).setPersistence(t);
  }
  function initializeRecaptchaConfig(e) {
    return _initializeRecaptchaConfig(e);
  }
  async function validatePassword(e, t) {
    return _castAuth(e).validatePassword(t);
  }
  function onIdTokenChanged(e, t, r, n) {
    return getModularInstance(e).onIdTokenChanged(t, r, n);
  }
  function beforeAuthStateChanged(e, t, r) {
    return getModularInstance(e).beforeAuthStateChanged(t, r);
  }
  function onAuthStateChanged(e, t, r, n) {
    return getModularInstance(e).onAuthStateChanged(t, r, n);
  }
  function useDeviceLanguage(e) {
    getModularInstance(e).useDeviceLanguage();
  }
  function updateCurrentUser(e, t) {
    return getModularInstance(e).updateCurrentUser(t);
  }
  function signOut(e) {
    return getModularInstance(e).signOut();
  }
  function revokeAccessToken(e, t) {
    return _castAuth(e).revokeAccessToken(t);
  }
  async function deleteUser(e) {
    return getModularInstance(e).delete();
  }
  var MultiFactorSessionImpl = class _MultiFactorSessionImpl {
    constructor(e, t, r) {
      this.type = e, this.credential = t, this.user = r;
    }
    static _fromIdtoken(e, t) {
      return new _MultiFactorSessionImpl("enroll", e, t);
    }
    static _fromMfaPendingCredential(e) {
      return new _MultiFactorSessionImpl("signin", e);
    }
    toJSON() {
      return { multiFactorSession: { ["enroll" === this.type ? "idToken" : "pendingCredential"]: this.credential } };
    }
    static fromJSON(e) {
      var t, r;
      if (null == e ? void 0 : e.multiFactorSession) {
        if (null === (t = e.multiFactorSession) || void 0 === t ? void 0 : t.pendingCredential) return _MultiFactorSessionImpl._fromMfaPendingCredential(e.multiFactorSession.pendingCredential);
        if (null === (r = e.multiFactorSession) || void 0 === r ? void 0 : r.idToken) return _MultiFactorSessionImpl._fromIdtoken(e.multiFactorSession.idToken);
      }
      return null;
    }
  };
  var MultiFactorResolverImpl = class _MultiFactorResolverImpl {
    constructor(e, t, r) {
      this.session = e, this.hints = t, this.signInResolver = r;
    }
    static _fromError(e, t) {
      const r = _castAuth(e), n = t.customData._serverResponse, i2 = (n.mfaInfo || []).map(((e2) => MultiFactorInfoImpl._fromServerResponse(r, e2)));
      _assert(n.mfaPendingCredential, r, "internal-error");
      const s3 = MultiFactorSessionImpl._fromMfaPendingCredential(n.mfaPendingCredential);
      return new _MultiFactorResolverImpl(s3, i2, (async (e2) => {
        const i3 = await e2._process(r, s3);
        delete n.mfaInfo, delete n.mfaPendingCredential;
        const o3 = Object.assign(Object.assign({}, n), { idToken: i3.idToken, refreshToken: i3.refreshToken });
        switch (t.operationType) {
          case "signIn":
            const e3 = await UserCredentialImpl._fromIdTokenResponse(r, t.operationType, o3);
            return await r._updateCurrentUser(e3.user), e3;
          case "reauthenticate":
            return _assert(t.user, r, "internal-error"), UserCredentialImpl._forOperation(t.user, t.operationType, o3);
          default:
            _fail(r, "internal-error");
        }
      }));
    }
    async resolveSignIn(e) {
      const t = e;
      return this.signInResolver(t);
    }
  };
  function getMultiFactorResolver(e, t) {
    var r;
    const n = getModularInstance(e), i2 = t;
    return _assert(t.customData.operationType, n, "argument-error"), _assert(null === (r = i2.customData._serverResponse) || void 0 === r ? void 0 : r.mfaPendingCredential, n, "argument-error"), MultiFactorResolverImpl._fromError(n, i2);
  }
  function startEnrollPhoneMfa(e, t) {
    return _performApiRequest(e, "POST", "/v2/accounts/mfaEnrollment:start", _addTidIfNecessary(e, t));
  }
  var MultiFactorUserImpl = class _MultiFactorUserImpl {
    constructor(e) {
      this.user = e, this.enrolledFactors = [], e._onReload(((t) => {
        t.mfaInfo && (this.enrolledFactors = t.mfaInfo.map(((t2) => MultiFactorInfoImpl._fromServerResponse(e.auth, t2))));
      }));
    }
    static _fromUser(e) {
      return new _MultiFactorUserImpl(e);
    }
    async getSession() {
      return MultiFactorSessionImpl._fromIdtoken(await this.user.getIdToken(), this.user);
    }
    async enroll(e, t) {
      const r = e, n = await this.getSession(), i2 = await _logoutIfInvalidated(this.user, r._process(this.user.auth, n, t));
      return await this.user._updateTokensIfNecessary(i2), this.user.reload();
    }
    async unenroll(e) {
      const t = "string" == typeof e ? e : e.uid, r = await this.user.getIdToken();
      try {
        const e2 = await _logoutIfInvalidated(this.user, (function withdrawMfa(e3, t2) {
          return _performApiRequest(e3, "POST", "/v2/accounts/mfaEnrollment:withdraw", _addTidIfNecessary(e3, t2));
        })(this.user.auth, { idToken: r, mfaEnrollmentId: t }));
        this.enrolledFactors = this.enrolledFactors.filter((({ uid: e3 }) => e3 !== t)), await this.user._updateTokensIfNecessary(e2), await this.user.reload();
      } catch (e2) {
        throw e2;
      }
    }
  };
  var R = /* @__PURE__ */ new WeakMap();
  function multiFactor(e) {
    const t = getModularInstance(e);
    return R.has(t) || R.set(t, MultiFactorUserImpl._fromUser(t)), R.get(t);
  }
  var BrowserPersistenceClass = class {
    constructor(e, t) {
      this.storageRetriever = e, this.type = t;
    }
    _isAvailable() {
      try {
        return this.storage ? (this.storage.setItem("__sak", "1"), this.storage.removeItem("__sak"), Promise.resolve(true)) : Promise.resolve(false);
      } catch (e) {
        return Promise.resolve(false);
      }
    }
    _set(e, t) {
      return this.storage.setItem(e, JSON.stringify(t)), Promise.resolve();
    }
    _get(e) {
      const t = this.storage.getItem(e);
      return Promise.resolve(t ? JSON.parse(t) : null);
    }
    _remove(e) {
      return this.storage.removeItem(e), Promise.resolve();
    }
    get storage() {
      return this.storageRetriever();
    }
  };
  var BrowserLocalPersistence = class extends BrowserPersistenceClass {
    constructor() {
      super((() => window.localStorage), "LOCAL"), this.boundEventHandler = (e, t) => this.onStorageEvent(e, t), this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.fallbackToPolling = _isMobileBrowser(), this._shouldAllowMigration = true;
    }
    forAllChangedKeys(e) {
      for (const t of Object.keys(this.listeners)) {
        const r = this.storage.getItem(t), n = this.localCache[t];
        r !== n && e(t, n, r);
      }
    }
    onStorageEvent(e, t = false) {
      if (!e.key) return void this.forAllChangedKeys(((e2, t2, r2) => {
        this.notifyListeners(e2, r2);
      }));
      const r = e.key;
      t ? this.detachListener() : this.stopPolling();
      const triggerListeners = () => {
        const e2 = this.storage.getItem(r);
        (t || this.localCache[r] !== e2) && this.notifyListeners(r, e2);
      }, n = this.storage.getItem(r);
      _isIE10() && n !== e.newValue && e.newValue !== e.oldValue ? setTimeout(triggerListeners, 10) : triggerListeners();
    }
    notifyListeners(e, t) {
      this.localCache[e] = t;
      const r = this.listeners[e];
      if (r) for (const e2 of Array.from(r)) e2(t ? JSON.parse(t) : t);
    }
    startPolling() {
      this.stopPolling(), this.pollTimer = setInterval((() => {
        this.forAllChangedKeys(((e, t, r) => {
          this.onStorageEvent(new StorageEvent("storage", { key: e, oldValue: t, newValue: r }), true);
        }));
      }), 1e3);
    }
    stopPolling() {
      this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null);
    }
    attachListener() {
      window.addEventListener("storage", this.boundEventHandler);
    }
    detachListener() {
      window.removeEventListener("storage", this.boundEventHandler);
    }
    _addListener(e, t) {
      0 === Object.keys(this.listeners).length && (this.fallbackToPolling ? this.startPolling() : this.attachListener()), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this.localCache[e] = this.storage.getItem(e)), this.listeners[e].add(t);
    }
    _removeListener(e, t) {
      this.listeners[e] && (this.listeners[e].delete(t), 0 === this.listeners[e].size && delete this.listeners[e]), 0 === Object.keys(this.listeners).length && (this.detachListener(), this.stopPolling());
    }
    async _set(e, t) {
      await super._set(e, t), this.localCache[e] = JSON.stringify(t);
    }
    async _get(e) {
      const t = await super._get(e);
      return this.localCache[e] = JSON.stringify(t), t;
    }
    async _remove(e) {
      await super._remove(e), delete this.localCache[e];
    }
  };
  BrowserLocalPersistence.type = "LOCAL";
  var C = BrowserLocalPersistence;
  var BrowserSessionPersistence = class extends BrowserPersistenceClass {
    constructor() {
      super((() => window.sessionStorage), "SESSION");
    }
    _addListener(e, t) {
    }
    _removeListener(e, t) {
    }
  };
  BrowserSessionPersistence.type = "SESSION";
  var k = BrowserSessionPersistence;
  var Receiver = class _Receiver {
    constructor(e) {
      this.eventTarget = e, this.handlersMap = {}, this.boundEventHandler = this.handleEvent.bind(this);
    }
    static _getInstance(e) {
      const t = this.receivers.find(((t2) => t2.isListeningto(e)));
      if (t) return t;
      const r = new _Receiver(e);
      return this.receivers.push(r), r;
    }
    isListeningto(e) {
      return this.eventTarget === e;
    }
    async handleEvent(e) {
      const t = e, { eventId: r, eventType: n, data: i2 } = t.data, s3 = this.handlersMap[n];
      if (!(null == s3 ? void 0 : s3.size)) return;
      t.ports[0].postMessage({ status: "ack", eventId: r, eventType: n });
      const o3 = Array.from(s3).map((async (e2) => e2(t.origin, i2))), a3 = await (function _allSettled(e2) {
        return Promise.all(e2.map((async (e3) => {
          try {
            return { fulfilled: true, value: await e3 };
          } catch (e4) {
            return { fulfilled: false, reason: e4 };
          }
        })));
      })(o3);
      t.ports[0].postMessage({ status: "done", eventId: r, eventType: n, response: a3 });
    }
    _subscribe(e, t) {
      0 === Object.keys(this.handlersMap).length && this.eventTarget.addEventListener("message", this.boundEventHandler), this.handlersMap[e] || (this.handlersMap[e] = /* @__PURE__ */ new Set()), this.handlersMap[e].add(t);
    }
    _unsubscribe(e, t) {
      this.handlersMap[e] && t && this.handlersMap[e].delete(t), t && 0 !== this.handlersMap[e].size || delete this.handlersMap[e], 0 === Object.keys(this.handlersMap).length && this.eventTarget.removeEventListener("message", this.boundEventHandler);
    }
  };
  function _generateEventId(e = "", t = 10) {
    let r = "";
    for (let e2 = 0; e2 < t; e2++) r += Math.floor(10 * Math.random());
    return e + r;
  }
  Receiver.receivers = [];
  var Sender = class {
    constructor(e) {
      this.target = e, this.handlers = /* @__PURE__ */ new Set();
    }
    removeMessageHandler(e) {
      e.messageChannel && (e.messageChannel.port1.removeEventListener("message", e.onMessage), e.messageChannel.port1.close()), this.handlers.delete(e);
    }
    async _send(e, t, r = 50) {
      const n = "undefined" != typeof MessageChannel ? new MessageChannel() : null;
      if (!n) throw new Error("connection_unavailable");
      let i2, s3;
      return new Promise(((o3, a3) => {
        const c3 = _generateEventId("", 20);
        n.port1.start();
        const u3 = setTimeout((() => {
          a3(new Error("unsupported_event"));
        }), r);
        s3 = { messageChannel: n, onMessage(e2) {
          const t2 = e2;
          if (t2.data.eventId === c3) switch (t2.data.status) {
            case "ack":
              clearTimeout(u3), i2 = setTimeout((() => {
                a3(new Error("timeout"));
              }), 3e3);
              break;
            case "done":
              clearTimeout(i2), o3(t2.data.response);
              break;
            default:
              clearTimeout(u3), clearTimeout(i2), a3(new Error("invalid_response"));
          }
        } }, this.handlers.add(s3), n.port1.addEventListener("message", s3.onMessage), this.target.postMessage({ eventType: e, eventId: c3, data: t }, [n.port2]);
      })).finally((() => {
        s3 && this.removeMessageHandler(s3);
      }));
    }
  };
  function _window() {
    return window;
  }
  function _isWorker() {
    return void 0 !== _window().WorkerGlobalScope && "function" == typeof _window().importScripts;
  }
  var b = "firebaseLocalStorageDb";
  var DBPromise = class {
    constructor(e) {
      this.request = e;
    }
    toPromise() {
      return new Promise(((e, t) => {
        this.request.addEventListener("success", (() => {
          e(this.request.result);
        })), this.request.addEventListener("error", (() => {
          t(this.request.error);
        }));
      }));
    }
  };
  function getObjectStore(e, t) {
    return e.transaction(["firebaseLocalStorage"], t ? "readwrite" : "readonly").objectStore("firebaseLocalStorage");
  }
  function _openDatabase() {
    const e = indexedDB.open(b, 1);
    return new Promise(((t, r) => {
      e.addEventListener("error", (() => {
        r(e.error);
      })), e.addEventListener("upgradeneeded", (() => {
        const t2 = e.result;
        try {
          t2.createObjectStore("firebaseLocalStorage", { keyPath: "fbase_key" });
        } catch (e2) {
          r(e2);
        }
      })), e.addEventListener("success", (async () => {
        const r2 = e.result;
        r2.objectStoreNames.contains("firebaseLocalStorage") ? t(r2) : (r2.close(), await (function _deleteDatabase() {
          const e2 = indexedDB.deleteDatabase(b);
          return new DBPromise(e2).toPromise();
        })(), t(await _openDatabase()));
      }));
    }));
  }
  async function _putObject(e, t, r) {
    const n = getObjectStore(e, true).put({ fbase_key: t, value: r });
    return new DBPromise(n).toPromise();
  }
  function _deleteObject(e, t) {
    const r = getObjectStore(e, true).delete(t);
    return new DBPromise(r).toPromise();
  }
  var IndexedDBLocalPersistence = class {
    constructor() {
      this.type = "LOCAL", this._shouldAllowMigration = true, this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.pendingWrites = 0, this.receiver = null, this.sender = null, this.serviceWorkerReceiverAvailable = false, this.activeServiceWorker = null, this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then((() => {
      }), (() => {
      }));
    }
    async _openDb() {
      return this.db || (this.db = await _openDatabase()), this.db;
    }
    async _withRetries(e) {
      let t = 0;
      for (; ; ) try {
        const t2 = await this._openDb();
        return await e(t2);
      } catch (e2) {
        if (t++ > 3) throw e2;
        this.db && (this.db.close(), this.db = void 0);
      }
    }
    async initializeServiceWorkerMessaging() {
      return _isWorker() ? this.initializeReceiver() : this.initializeSender();
    }
    async initializeReceiver() {
      this.receiver = Receiver._getInstance((function _getWorkerGlobalScope() {
        return _isWorker() ? self : null;
      })()), this.receiver._subscribe("keyChanged", (async (e, t) => ({ keyProcessed: (await this._poll()).includes(t.key) }))), this.receiver._subscribe("ping", (async (e, t) => ["keyChanged"]));
    }
    async initializeSender() {
      var e, t;
      if (this.activeServiceWorker = await (async function _getActiveServiceWorker() {
        if (!(null === navigator || void 0 === navigator ? void 0 : navigator.serviceWorker)) return null;
        try {
          return (await navigator.serviceWorker.ready).active;
        } catch (e2) {
          return null;
        }
      })(), !this.activeServiceWorker) return;
      this.sender = new Sender(this.activeServiceWorker);
      const r = await this.sender._send("ping", {}, 800);
      r && (null === (e = r[0]) || void 0 === e ? void 0 : e.fulfilled) && (null === (t = r[0]) || void 0 === t ? void 0 : t.value.includes("keyChanged")) && (this.serviceWorkerReceiverAvailable = true);
    }
    async notifyServiceWorker(e) {
      if (this.sender && this.activeServiceWorker && (function _getServiceWorkerController() {
        var e2;
        return (null === (e2 = null === navigator || void 0 === navigator ? void 0 : navigator.serviceWorker) || void 0 === e2 ? void 0 : e2.controller) || null;
      })() === this.activeServiceWorker) try {
        await this.sender._send("keyChanged", { key: e }, this.serviceWorkerReceiverAvailable ? 800 : 50);
      } catch (e2) {
      }
    }
    async _isAvailable() {
      try {
        if (!indexedDB) return false;
        const e = await _openDatabase();
        return await _putObject(e, "__sak", "1"), await _deleteObject(e, "__sak"), true;
      } catch (e) {
      }
      return false;
    }
    async _withPendingWrite(e) {
      this.pendingWrites++;
      try {
        await e();
      } finally {
        this.pendingWrites--;
      }
    }
    async _set(e, t) {
      return this._withPendingWrite((async () => (await this._withRetries(((r) => _putObject(r, e, t))), this.localCache[e] = t, this.notifyServiceWorker(e))));
    }
    async _get(e) {
      const t = await this._withRetries(((t2) => (async function getObject(e2, t3) {
        const r = getObjectStore(e2, false).get(t3), n = await new DBPromise(r).toPromise();
        return void 0 === n ? null : n.value;
      })(t2, e)));
      return this.localCache[e] = t, t;
    }
    async _remove(e) {
      return this._withPendingWrite((async () => (await this._withRetries(((t) => _deleteObject(t, e))), delete this.localCache[e], this.notifyServiceWorker(e))));
    }
    async _poll() {
      const e = await this._withRetries(((e2) => {
        const t2 = getObjectStore(e2, false).getAll();
        return new DBPromise(t2).toPromise();
      }));
      if (!e) return [];
      if (0 !== this.pendingWrites) return [];
      const t = [], r = /* @__PURE__ */ new Set();
      if (0 !== e.length) for (const { fbase_key: n, value: i2 } of e) r.add(n), JSON.stringify(this.localCache[n]) !== JSON.stringify(i2) && (this.notifyListeners(n, i2), t.push(n));
      for (const e2 of Object.keys(this.localCache)) this.localCache[e2] && !r.has(e2) && (this.notifyListeners(e2, null), t.push(e2));
      return t;
    }
    notifyListeners(e, t) {
      this.localCache[e] = t;
      const r = this.listeners[e];
      if (r) for (const e2 of Array.from(r)) e2(t);
    }
    startPolling() {
      this.stopPolling(), this.pollTimer = setInterval((async () => this._poll()), 800);
    }
    stopPolling() {
      this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null);
    }
    _addListener(e, t) {
      0 === Object.keys(this.listeners).length && this.startPolling(), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this._get(e)), this.listeners[e].add(t);
    }
    _removeListener(e, t) {
      this.listeners[e] && (this.listeners[e].delete(t), 0 === this.listeners[e].size && delete this.listeners[e]), 0 === Object.keys(this.listeners).length && this.stopPolling();
    }
  };
  IndexedDBLocalPersistence.type = "LOCAL";
  var O = IndexedDBLocalPersistence;
  function startSignInPhoneMfa(e, t) {
    return _performApiRequest(e, "POST", "/v2/accounts/mfaSignIn:start", _addTidIfNecessary(e, t));
  }
  var N = _generateCallbackName("rcb");
  var D = new Delay(3e4, 6e4);
  var ReCaptchaLoaderImpl = class {
    constructor() {
      var e;
      this.hostLanguage = "", this.counter = 0, this.librarySeparatelyLoaded = !!(null === (e = _window().grecaptcha) || void 0 === e ? void 0 : e.render);
    }
    load(e, t = "") {
      return _assert((function isHostLanguageValid(e2) {
        return e2.length <= 6 && /^\s*[a-zA-Z0-9\-]*\s*$/.test(e2);
      })(t), e, "argument-error"), this.shouldResolveImmediately(t) && isV2(_window().grecaptcha) ? Promise.resolve(_window().grecaptcha) : new Promise(((r, n) => {
        const i2 = _window().setTimeout((() => {
          n(_createError(e, "network-request-failed"));
        }), D.get());
        _window()[N] = () => {
          _window().clearTimeout(i2), delete _window()[N];
          const s3 = _window().grecaptcha;
          if (!s3 || !isV2(s3)) return void n(_createError(e, "internal-error"));
          const o3 = s3.render;
          s3.render = (e2, t2) => {
            const r2 = o3(e2, t2);
            return this.counter++, r2;
          }, this.hostLanguage = t, r(s3);
        };
        _loadJS(`${(function _recaptchaV2ScriptUrl() {
          return S.recaptchaV2Script;
        })()}?${querystring({ onload: N, render: "explicit", hl: t })}`).catch((() => {
          clearTimeout(i2), n(_createError(e, "internal-error"));
        }));
      }));
    }
    clearedOneInstance() {
      this.counter--;
    }
    shouldResolveImmediately(e) {
      var t;
      return !!(null === (t = _window().grecaptcha) || void 0 === t ? void 0 : t.render) && (e === this.hostLanguage || this.counter > 0 || this.librarySeparatelyLoaded);
    }
  };
  var MockReCaptchaLoaderImpl = class {
    async load(e) {
      return new MockReCaptcha(e);
    }
    clearedOneInstance() {
    }
  };
  var L = { theme: "light", type: "image" };
  var RecaptchaVerifier = class {
    constructor(e, t, r = Object.assign({}, L)) {
      this.parameters = r, this.type = "recaptcha", this.destroyed = false, this.widgetId = null, this.tokenChangeListeners = /* @__PURE__ */ new Set(), this.renderPromise = null, this.recaptcha = null, this.auth = _castAuth(e), this.isInvisible = "invisible" === this.parameters.size, _assert("undefined" != typeof document, this.auth, "operation-not-supported-in-this-environment");
      const n = "string" == typeof t ? document.getElementById(t) : t;
      _assert(n, this.auth, "argument-error"), this.container = n, this.parameters.callback = this.makeTokenCallback(this.parameters.callback), this._recaptchaLoader = this.auth.settings.appVerificationDisabledForTesting ? new MockReCaptchaLoaderImpl() : new ReCaptchaLoaderImpl(), this.validateStartingState();
    }
    async verify() {
      this.assertNotDestroyed();
      const e = await this.render(), t = this.getAssertedRecaptcha(), r = t.getResponse(e);
      return r || new Promise(((r2) => {
        const tokenChange = (e2) => {
          e2 && (this.tokenChangeListeners.delete(tokenChange), r2(e2));
        };
        this.tokenChangeListeners.add(tokenChange), this.isInvisible && t.execute(e);
      }));
    }
    render() {
      try {
        this.assertNotDestroyed();
      } catch (e) {
        return Promise.reject(e);
      }
      return this.renderPromise || (this.renderPromise = this.makeRenderPromise().catch(((e) => {
        throw this.renderPromise = null, e;
      }))), this.renderPromise;
    }
    _reset() {
      this.assertNotDestroyed(), null !== this.widgetId && this.getAssertedRecaptcha().reset(this.widgetId);
    }
    clear() {
      this.assertNotDestroyed(), this.destroyed = true, this._recaptchaLoader.clearedOneInstance(), this.isInvisible || this.container.childNodes.forEach(((e) => {
        this.container.removeChild(e);
      }));
    }
    validateStartingState() {
      _assert(!this.parameters.sitekey, this.auth, "argument-error"), _assert(this.isInvisible || !this.container.hasChildNodes(), this.auth, "argument-error"), _assert("undefined" != typeof document, this.auth, "operation-not-supported-in-this-environment");
    }
    makeTokenCallback(e) {
      return (t) => {
        if (this.tokenChangeListeners.forEach(((e2) => e2(t))), "function" == typeof e) e(t);
        else if ("string" == typeof e) {
          const r = _window()[e];
          "function" == typeof r && r(t);
        }
      };
    }
    assertNotDestroyed() {
      _assert(!this.destroyed, this.auth, "internal-error");
    }
    async makeRenderPromise() {
      if (await this.init(), !this.widgetId) {
        let e = this.container;
        if (!this.isInvisible) {
          const t = document.createElement("div");
          e.appendChild(t), e = t;
        }
        this.widgetId = this.getAssertedRecaptcha().render(e, this.parameters);
      }
      return this.widgetId;
    }
    async init() {
      _assert(_isHttpOrHttps() && !_isWorker(), this.auth, "internal-error"), await (function domReady() {
        let e2 = null;
        return new Promise(((t) => {
          "complete" !== document.readyState ? (e2 = () => t(), window.addEventListener("load", e2)) : t();
        })).catch(((t) => {
          throw e2 && window.removeEventListener("load", e2), t;
        }));
      })(), this.recaptcha = await this._recaptchaLoader.load(this.auth, this.auth.languageCode || void 0);
      const e = await (async function getRecaptchaParams(e2) {
        return (await _performApiRequest(e2, "GET", "/v1/recaptchaParams")).recaptchaSiteKey || "";
      })(this.auth);
      _assert(e, this.auth, "internal-error"), this.parameters.sitekey = e;
    }
    getAssertedRecaptcha() {
      return _assert(this.recaptcha, this.auth, "internal-error"), this.recaptcha;
    }
  };
  var ConfirmationResultImpl = class {
    constructor(e, t) {
      this.verificationId = e, this.onConfirmation = t;
    }
    confirm(e) {
      const t = PhoneAuthCredential._fromVerification(this.verificationId, e);
      return this.onConfirmation(t);
    }
  };
  async function signInWithPhoneNumber(t, r, n) {
    if (_isFirebaseServerApp(t.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(t));
    const i2 = _castAuth(t), s3 = await _verifyPhoneNumber(i2, r, getModularInstance(n));
    return new ConfirmationResultImpl(s3, ((e) => signInWithCredential(i2, e)));
  }
  async function linkWithPhoneNumber(e, t, r) {
    const n = getModularInstance(e);
    await _assertLinkedStatus(false, n, "phone");
    const i2 = await _verifyPhoneNumber(n.auth, t, getModularInstance(r));
    return new ConfirmationResultImpl(i2, ((e2) => linkWithCredential(n, e2)));
  }
  async function reauthenticateWithPhoneNumber(t, r, n) {
    const i2 = getModularInstance(t);
    if (_isFirebaseServerApp(i2.auth.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(i2.auth));
    const s3 = await _verifyPhoneNumber(i2.auth, r, getModularInstance(n));
    return new ConfirmationResultImpl(s3, ((e) => reauthenticateWithCredential(i2, e)));
  }
  async function _verifyPhoneNumber(e, t, r) {
    var n;
    if (!e._getRecaptchaConfig()) try {
      await _initializeRecaptchaConfig(e);
    } catch (e2) {
      console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.");
    }
    try {
      let i2;
      if (i2 = "string" == typeof t ? { phoneNumber: t } : t, "session" in i2) {
        const t2 = i2.session;
        if ("phoneNumber" in i2) {
          _assert("enroll" === t2.type, e, "internal-error");
          const n2 = { idToken: t2.credential, phoneEnrollmentInfo: { phoneNumber: i2.phoneNumber, clientType: "CLIENT_TYPE_WEB" } }, s3 = handleRecaptchaFlow(e, n2, "mfaSmsEnrollment", (async (e2, t3) => {
            if ("NO_RECAPTCHA" === t3.phoneEnrollmentInfo.captchaResponse) {
              _assert("recaptcha" === (null == r ? void 0 : r.type), e2, "argument-error");
              return startEnrollPhoneMfa(e2, await injectRecaptchaV2Token(e2, t3, r));
            }
            return startEnrollPhoneMfa(e2, t3);
          }), "PHONE_PROVIDER");
          return (await s3.catch(((e2) => Promise.reject(e2)))).phoneSessionInfo.sessionInfo;
        }
        {
          _assert("signin" === t2.type, e, "internal-error");
          const s3 = (null === (n = i2.multiFactorHint) || void 0 === n ? void 0 : n.uid) || i2.multiFactorUid;
          _assert(s3, e, "missing-multi-factor-info");
          const o3 = { mfaPendingCredential: t2.credential, mfaEnrollmentId: s3, phoneSignInInfo: { clientType: "CLIENT_TYPE_WEB" } }, a3 = handleRecaptchaFlow(e, o3, "mfaSmsSignIn", (async (e2, t3) => {
            if ("NO_RECAPTCHA" === t3.phoneSignInInfo.captchaResponse) {
              _assert("recaptcha" === (null == r ? void 0 : r.type), e2, "argument-error");
              return startSignInPhoneMfa(e2, await injectRecaptchaV2Token(e2, t3, r));
            }
            return startSignInPhoneMfa(e2, t3);
          }), "PHONE_PROVIDER");
          return (await a3.catch(((e2) => Promise.reject(e2)))).phoneResponseInfo.sessionInfo;
        }
      }
      {
        const t2 = { phoneNumber: i2.phoneNumber, clientType: "CLIENT_TYPE_WEB" }, n2 = handleRecaptchaFlow(e, t2, "sendVerificationCode", (async (e2, t3) => {
          if ("NO_RECAPTCHA" === t3.captchaResponse) {
            _assert("recaptcha" === (null == r ? void 0 : r.type), e2, "argument-error");
            return sendPhoneVerificationCode(e2, await injectRecaptchaV2Token(e2, t3, r));
          }
          return sendPhoneVerificationCode(e2, t3);
        }), "PHONE_PROVIDER");
        return (await n2.catch(((e2) => Promise.reject(e2)))).sessionInfo;
      }
    } finally {
      null == r || r._reset();
    }
  }
  async function updatePhoneNumber(t, r) {
    const n = getModularInstance(t);
    if (_isFirebaseServerApp(n.auth.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(n.auth));
    await _link$1(n, r);
  }
  async function injectRecaptchaV2Token(e, t, r) {
    _assert("recaptcha" === r.type, e, "argument-error");
    const n = await r.verify();
    _assert("string" == typeof n, e, "argument-error");
    const i2 = Object.assign({}, t);
    if ("phoneEnrollmentInfo" in i2) {
      const e2 = i2.phoneEnrollmentInfo.phoneNumber, t2 = i2.phoneEnrollmentInfo.captchaResponse, r2 = i2.phoneEnrollmentInfo.clientType, s3 = i2.phoneEnrollmentInfo.recaptchaVersion;
      return Object.assign(i2, { phoneEnrollmentInfo: { phoneNumber: e2, recaptchaToken: n, captchaResponse: t2, clientType: r2, recaptchaVersion: s3 } }), i2;
    }
    if ("phoneSignInInfo" in i2) {
      const e2 = i2.phoneSignInInfo.captchaResponse, t2 = i2.phoneSignInInfo.clientType, r2 = i2.phoneSignInInfo.recaptchaVersion;
      return Object.assign(i2, { phoneSignInInfo: { recaptchaToken: n, captchaResponse: e2, clientType: t2, recaptchaVersion: r2 } }), i2;
    }
    return Object.assign(i2, { recaptchaToken: n }), i2;
  }
  var PhoneAuthProvider = class _PhoneAuthProvider {
    constructor(e) {
      this.providerId = _PhoneAuthProvider.PROVIDER_ID, this.auth = _castAuth(e);
    }
    verifyPhoneNumber(e, t) {
      return _verifyPhoneNumber(this.auth, e, getModularInstance(t));
    }
    static credential(e, t) {
      return PhoneAuthCredential._fromVerification(e, t);
    }
    static credentialFromResult(e) {
      const t = e;
      return _PhoneAuthProvider.credentialFromTaggedObject(t);
    }
    static credentialFromError(e) {
      return _PhoneAuthProvider.credentialFromTaggedObject(e.customData || {});
    }
    static credentialFromTaggedObject({ _tokenResponse: e }) {
      if (!e) return null;
      const { phoneNumber: t, temporaryProof: r } = e;
      return t && r ? PhoneAuthCredential._fromTokenResponse(t, r) : null;
    }
  };
  function _withDefaultResolver(e, t) {
    return t ? _getInstance(t) : (_assert(e._popupRedirectResolver, e, "argument-error"), e._popupRedirectResolver);
  }
  PhoneAuthProvider.PROVIDER_ID = "phone", PhoneAuthProvider.PHONE_SIGN_IN_METHOD = "phone";
  var IdpCredential = class extends AuthCredential {
    constructor(e) {
      super("custom", "custom"), this.params = e;
    }
    _getIdTokenResponse(e) {
      return signInWithIdp(e, this._buildIdpRequest());
    }
    _linkToIdToken(e, t) {
      return signInWithIdp(e, this._buildIdpRequest(t));
    }
    _getReauthenticationResolver(e) {
      return signInWithIdp(e, this._buildIdpRequest());
    }
    _buildIdpRequest(e) {
      const t = { requestUri: this.params.requestUri, sessionId: this.params.sessionId, postBody: this.params.postBody, tenantId: this.params.tenantId, pendingToken: this.params.pendingToken, returnSecureToken: true, returnIdpCredential: true };
      return e && (t.idToken = e), t;
    }
  };
  function _signIn(e) {
    return _signInWithCredential(e.auth, new IdpCredential(e), e.bypassAuthState);
  }
  function _reauth(e) {
    const { auth: t, user: r } = e;
    return _assert(r, t, "internal-error"), _reauthenticate(r, new IdpCredential(e), e.bypassAuthState);
  }
  async function _link(e) {
    const { auth: t, user: r } = e;
    return _assert(r, t, "internal-error"), _link$1(r, new IdpCredential(e), e.bypassAuthState);
  }
  var AbstractPopupRedirectOperation = class {
    constructor(e, t, r, n, i2 = false) {
      this.auth = e, this.resolver = r, this.user = n, this.bypassAuthState = i2, this.pendingPromise = null, this.eventManager = null, this.filter = Array.isArray(t) ? t : [t];
    }
    execute() {
      return new Promise((async (e, t) => {
        this.pendingPromise = { resolve: e, reject: t };
        try {
          this.eventManager = await this.resolver._initialize(this.auth), await this.onExecution(), this.eventManager.registerConsumer(this);
        } catch (e2) {
          this.reject(e2);
        }
      }));
    }
    async onAuthEvent(e) {
      const { urlResponse: t, sessionId: r, postBody: n, tenantId: i2, error: s3, type: o3 } = e;
      if (s3) return void this.reject(s3);
      const a3 = { auth: this.auth, requestUri: t, sessionId: r, tenantId: i2 || void 0, postBody: n || void 0, user: this.user, bypassAuthState: this.bypassAuthState };
      try {
        this.resolve(await this.getIdpTask(o3)(a3));
      } catch (e2) {
        this.reject(e2);
      }
    }
    onError(e) {
      this.reject(e);
    }
    getIdpTask(e) {
      switch (e) {
        case "signInViaPopup":
        case "signInViaRedirect":
          return _signIn;
        case "linkViaPopup":
        case "linkViaRedirect":
          return _link;
        case "reauthViaPopup":
        case "reauthViaRedirect":
          return _reauth;
        default:
          _fail(this.auth, "internal-error");
      }
    }
    resolve(e) {
      debugAssert(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.resolve(e), this.unregisterAndCleanUp();
    }
    reject(e) {
      debugAssert(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.reject(e), this.unregisterAndCleanUp();
    }
    unregisterAndCleanUp() {
      this.eventManager && this.eventManager.unregisterConsumer(this), this.pendingPromise = null, this.cleanUp();
    }
  };
  var M = new Delay(2e3, 1e4);
  async function signInWithPopup(t, r, n) {
    if (_isFirebaseServerApp(t.app)) return Promise.reject(_createError(t, "operation-not-supported-in-this-environment"));
    const i2 = _castAuth(t);
    _assertInstanceOf(t, r, FederatedAuthProvider);
    const s3 = _withDefaultResolver(i2, n);
    return new PopupOperation(i2, "signInViaPopup", r, s3).executeNotNull();
  }
  async function reauthenticateWithPopup(t, r, n) {
    const i2 = getModularInstance(t);
    if (_isFirebaseServerApp(i2.auth.app)) return Promise.reject(_createError(i2.auth, "operation-not-supported-in-this-environment"));
    _assertInstanceOf(i2.auth, r, FederatedAuthProvider);
    const s3 = _withDefaultResolver(i2.auth, n);
    return new PopupOperation(i2.auth, "reauthViaPopup", r, s3, i2).executeNotNull();
  }
  async function linkWithPopup(e, t, r) {
    const n = getModularInstance(e);
    _assertInstanceOf(n.auth, t, FederatedAuthProvider);
    const i2 = _withDefaultResolver(n.auth, r);
    return new PopupOperation(n.auth, "linkViaPopup", t, i2, n).executeNotNull();
  }
  var PopupOperation = class _PopupOperation extends AbstractPopupRedirectOperation {
    constructor(e, t, r, n, i2) {
      super(e, t, n, i2), this.provider = r, this.authWindow = null, this.pollId = null, _PopupOperation.currentPopupAction && _PopupOperation.currentPopupAction.cancel(), _PopupOperation.currentPopupAction = this;
    }
    async executeNotNull() {
      const e = await this.execute();
      return _assert(e, this.auth, "internal-error"), e;
    }
    async onExecution() {
      debugAssert(1 === this.filter.length, "Popup operations only handle one event");
      const e = _generateEventId();
      this.authWindow = await this.resolver._openPopup(this.auth, this.provider, this.filter[0], e), this.authWindow.associatedEvent = e, this.resolver._originValidation(this.auth).catch(((e2) => {
        this.reject(e2);
      })), this.resolver._isIframeWebStorageSupported(this.auth, ((e2) => {
        e2 || this.reject(_createError(this.auth, "web-storage-unsupported"));
      })), this.pollUserCancellation();
    }
    get eventId() {
      var e;
      return (null === (e = this.authWindow) || void 0 === e ? void 0 : e.associatedEvent) || null;
    }
    cancel() {
      this.reject(_createError(this.auth, "cancelled-popup-request"));
    }
    cleanUp() {
      this.authWindow && this.authWindow.close(), this.pollId && window.clearTimeout(this.pollId), this.authWindow = null, this.pollId = null, _PopupOperation.currentPopupAction = null;
    }
    pollUserCancellation() {
      const poll = () => {
        var e, t;
        (null === (t = null === (e = this.authWindow) || void 0 === e ? void 0 : e.window) || void 0 === t ? void 0 : t.closed) ? this.pollId = window.setTimeout((() => {
          this.pollId = null, this.reject(_createError(this.auth, "popup-closed-by-user"));
        }), 8e3) : this.pollId = window.setTimeout(poll, M.get());
      };
      poll();
    }
  };
  PopupOperation.currentPopupAction = null;
  var U = /* @__PURE__ */ new Map();
  var RedirectAction = class extends AbstractPopupRedirectOperation {
    constructor(e, t, r = false) {
      super(e, ["signInViaRedirect", "linkViaRedirect", "reauthViaRedirect", "unknown"], t, void 0, r), this.eventId = null;
    }
    async execute() {
      let e = U.get(this.auth._key());
      if (!e) {
        try {
          const t = await (async function _getAndClearPendingRedirectStatus(e2, t2) {
            const r = pendingRedirectKey(t2), n = resolverPersistence(e2);
            if (!await n._isAvailable()) return false;
            const i2 = "true" === await n._get(r);
            return await n._remove(r), i2;
          })(this.resolver, this.auth) ? await super.execute() : null;
          e = () => Promise.resolve(t);
        } catch (t) {
          e = () => Promise.reject(t);
        }
        U.set(this.auth._key(), e);
      }
      return this.bypassAuthState || U.set(this.auth._key(), (() => Promise.resolve(null))), e();
    }
    async onAuthEvent(e) {
      if ("signInViaRedirect" === e.type) return super.onAuthEvent(e);
      if ("unknown" !== e.type) {
        if (e.eventId) {
          const t = await this.auth._redirectUserForId(e.eventId);
          if (t) return this.user = t, super.onAuthEvent(e);
          this.resolve(null);
        }
      } else this.resolve(null);
    }
    async onExecution() {
    }
    cleanUp() {
    }
  };
  async function _setPendingRedirectStatus(e, t) {
    return resolverPersistence(e)._set(pendingRedirectKey(t), "true");
  }
  function _overrideRedirectResult(e, t) {
    U.set(e._key(), t);
  }
  function resolverPersistence(e) {
    return _getInstance(e._redirectPersistence);
  }
  function pendingRedirectKey(e) {
    return _persistenceKeyName("pendingRedirect", e.config.apiKey, e.name);
  }
  function signInWithRedirect(t, r, n) {
    return (async function _signInWithRedirect(t2, r2, n2) {
      if (_isFirebaseServerApp(t2.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(t2));
      const i2 = _castAuth(t2);
      _assertInstanceOf(t2, r2, FederatedAuthProvider), await i2._initializationPromise;
      const s3 = _withDefaultResolver(i2, n2);
      return await _setPendingRedirectStatus(s3, i2), s3._openRedirect(i2, r2, "signInViaRedirect");
    })(t, r, n);
  }
  function reauthenticateWithRedirect(t, r, n) {
    return (async function _reauthenticateWithRedirect(t2, r2, n2) {
      const i2 = getModularInstance(t2);
      if (_assertInstanceOf(i2.auth, r2, FederatedAuthProvider), _isFirebaseServerApp(i2.auth.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(i2.auth));
      await i2.auth._initializationPromise;
      const s3 = _withDefaultResolver(i2.auth, n2);
      await _setPendingRedirectStatus(s3, i2.auth);
      const o3 = await prepareUserForRedirect(i2);
      return s3._openRedirect(i2.auth, r2, "reauthViaRedirect", o3);
    })(t, r, n);
  }
  function linkWithRedirect(e, t, r) {
    return (async function _linkWithRedirect(e2, t2, r2) {
      const n = getModularInstance(e2);
      _assertInstanceOf(n.auth, t2, FederatedAuthProvider), await n.auth._initializationPromise;
      const i2 = _withDefaultResolver(n.auth, r2);
      await _assertLinkedStatus(false, n, t2.providerId), await _setPendingRedirectStatus(i2, n.auth);
      const s3 = await prepareUserForRedirect(n);
      return i2._openRedirect(n.auth, t2, "linkViaRedirect", s3);
    })(e, t, r);
  }
  async function getRedirectResult(e, t) {
    return await _castAuth(e)._initializationPromise, _getRedirectResult(e, t, false);
  }
  async function _getRedirectResult(t, r, n = false) {
    if (_isFirebaseServerApp(t.app)) return Promise.reject(_serverAppCurrentUserOperationNotSupportedError(t));
    const i2 = _castAuth(t), s3 = _withDefaultResolver(i2, r), o3 = new RedirectAction(i2, s3, n), a3 = await o3.execute();
    return a3 && !n && (delete a3.user._redirectEventId, await i2._persistUserIfCurrent(a3.user), await i2._setRedirectUser(null, r)), a3;
  }
  async function prepareUserForRedirect(e) {
    const t = _generateEventId(`${e.uid}:::`);
    return e._redirectEventId = t, await e.auth._setRedirectUser(e), await e.auth._persistUserIfCurrent(e), t;
  }
  var AuthEventManager = class {
    constructor(e) {
      this.auth = e, this.cachedEventUids = /* @__PURE__ */ new Set(), this.consumers = /* @__PURE__ */ new Set(), this.queuedRedirectEvent = null, this.hasHandledPotentialRedirect = false, this.lastProcessedEventTime = Date.now();
    }
    registerConsumer(e) {
      this.consumers.add(e), this.queuedRedirectEvent && this.isEventForConsumer(this.queuedRedirectEvent, e) && (this.sendToConsumer(this.queuedRedirectEvent, e), this.saveEventToCache(this.queuedRedirectEvent), this.queuedRedirectEvent = null);
    }
    unregisterConsumer(e) {
      this.consumers.delete(e);
    }
    onEvent(e) {
      if (this.hasEventBeenHandled(e)) return false;
      let t = false;
      return this.consumers.forEach(((r) => {
        this.isEventForConsumer(e, r) && (t = true, this.sendToConsumer(e, r), this.saveEventToCache(e));
      })), this.hasHandledPotentialRedirect || !(function isRedirectEvent(e2) {
        switch (e2.type) {
          case "signInViaRedirect":
          case "linkViaRedirect":
          case "reauthViaRedirect":
            return true;
          case "unknown":
            return isNullRedirectEvent(e2);
          default:
            return false;
        }
      })(e) || (this.hasHandledPotentialRedirect = true, t || (this.queuedRedirectEvent = e, t = true)), t;
    }
    sendToConsumer(e, t) {
      var r;
      if (e.error && !isNullRedirectEvent(e)) {
        const n = (null === (r = e.error.code) || void 0 === r ? void 0 : r.split("auth/")[1]) || "internal-error";
        t.onError(_createError(this.auth, n));
      } else t.onAuthEvent(e);
    }
    isEventForConsumer(e, t) {
      const r = null === t.eventId || !!e.eventId && e.eventId === t.eventId;
      return t.filter.includes(e.type) && r;
    }
    hasEventBeenHandled(e) {
      return Date.now() - this.lastProcessedEventTime >= 6e5 && this.cachedEventUids.clear(), this.cachedEventUids.has(eventUid(e));
    }
    saveEventToCache(e) {
      this.cachedEventUids.add(eventUid(e)), this.lastProcessedEventTime = Date.now();
    }
  };
  function eventUid(e) {
    return [e.type, e.eventId, e.sessionId, e.tenantId].filter(((e2) => e2)).join("-");
  }
  function isNullRedirectEvent({ type: e, error: t }) {
    return "unknown" === e && "auth/no-auth-event" === (null == t ? void 0 : t.code);
  }
  var F = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  var V = /^https?/;
  async function _validateOrigin(e) {
    if (e.config.emulator) return;
    const { authorizedDomains: t } = await (async function _getProjectConfig(e2, t2 = {}) {
      return _performApiRequest(e2, "GET", "/v1/projects", t2);
    })(e);
    for (const e2 of t) try {
      if (matchDomain(e2)) return;
    } catch (e3) {
    }
    _fail(e, "unauthorized-domain");
  }
  function matchDomain(e) {
    const t = _getCurrentUrl(), { protocol: r, hostname: n } = new URL(t);
    if (e.startsWith("chrome-extension://")) {
      const i3 = new URL(e);
      return "" === i3.hostname && "" === n ? "chrome-extension:" === r && e.replace("chrome-extension://", "") === t.replace("chrome-extension://", "") : "chrome-extension:" === r && i3.hostname === n;
    }
    if (!V.test(r)) return false;
    if (F.test(e)) return n === e;
    const i2 = e.replace(/\./g, "\\.");
    return new RegExp("^(.+\\." + i2 + "|" + i2 + ")$", "i").test(n);
  }
  var W = new Delay(3e4, 6e4);
  function resetUnloadedGapiModules() {
    const e = _window().___jsl;
    if (null == e ? void 0 : e.H) {
      for (const t of Object.keys(e.H)) if (e.H[t].r = e.H[t].r || [], e.H[t].L = e.H[t].L || [], e.H[t].r = [...e.H[t].L], e.CP) for (let t2 = 0; t2 < e.CP.length; t2++) e.CP[t2] = null;
    }
  }
  function loadGapi(e) {
    return new Promise(((t, r) => {
      var n, i2, s3;
      function loadGapiIframe() {
        resetUnloadedGapiModules(), gapi.load("gapi.iframes", { callback: () => {
          t(gapi.iframes.getContext());
        }, ontimeout: () => {
          resetUnloadedGapiModules(), r(_createError(e, "network-request-failed"));
        }, timeout: W.get() });
      }
      if (null === (i2 = null === (n = _window().gapi) || void 0 === n ? void 0 : n.iframes) || void 0 === i2 ? void 0 : i2.Iframe) t(gapi.iframes.getContext());
      else {
        if (!(null === (s3 = _window().gapi) || void 0 === s3 ? void 0 : s3.load)) {
          const t2 = _generateCallbackName("iframefcb");
          return _window()[t2] = () => {
            gapi.load ? loadGapiIframe() : r(_createError(e, "network-request-failed"));
          }, _loadJS(`${(function _gapiScriptUrl() {
            return S.gapiScript;
          })()}?onload=${t2}`).catch(((e2) => r(e2)));
        }
        loadGapiIframe();
      }
    })).catch(((e2) => {
      throw x = null, e2;
    }));
  }
  var x = null;
  var H = new Delay(5e3, 15e3);
  var j = { style: { position: "absolute", top: "-100px", width: "1px", height: "1px" }, "aria-hidden": "true", tabindex: "-1" };
  var q = /* @__PURE__ */ new Map([["identitytoolkit.googleapis.com", "p"], ["staging-identitytoolkit.sandbox.googleapis.com", "s"], ["test-identitytoolkit.sandbox.googleapis.com", "t"]]);
  function getIframeUrl(e) {
    const t = e.config;
    _assert(t.authDomain, e, "auth-domain-config-required");
    const r = t.emulator ? _emulatorUrl(t, "emulator/auth/iframe") : `https://${e.config.authDomain}/__/auth/iframe`, n = { apiKey: t.apiKey, appName: e.name, v: SDK_VERSION }, s3 = q.get(e.config.apiHost);
    s3 && (n.eid = s3);
    const o3 = e._getFrameworks();
    return o3.length && (n.fw = o3.join(",")), `${r}?${querystring(n).slice(1)}`;
  }
  async function _openIframe(e) {
    const t = await (function _loadGapi(e2) {
      return x = x || loadGapi(e2), x;
    })(e), r = _window().gapi;
    return _assert(r, e, "internal-error"), t.open({ where: document.body, url: getIframeUrl(e), messageHandlersFilter: r.iframes.CROSS_ORIGIN_IFRAMES_FILTER, attributes: j, dontclear: true }, ((t2) => new Promise((async (r2, n) => {
      await t2.restyle({ setHideOnLeave: false });
      const i2 = _createError(e, "network-request-failed"), s3 = _window().setTimeout((() => {
        n(i2);
      }), H.get());
      function clearTimerAndResolve() {
        _window().clearTimeout(s3), r2(t2);
      }
      t2.ping(clearTimerAndResolve).then(clearTimerAndResolve, (() => {
        n(i2);
      }));
    }))));
  }
  var G = { location: "yes", resizable: "yes", statusbar: "yes", toolbar: "no" };
  var AuthPopup = class {
    constructor(e) {
      this.window = e, this.associatedEvent = null;
    }
    close() {
      if (this.window) try {
        this.window.close();
      } catch (e) {
      }
    }
  };
  function _open(e, t, r, n = 500, i2 = 600) {
    const s3 = Math.max((window.screen.availHeight - i2) / 2, 0).toString(), o3 = Math.max((window.screen.availWidth - n) / 2, 0).toString();
    let a3 = "";
    const c3 = Object.assign(Object.assign({}, G), { width: n.toString(), height: i2.toString(), top: s3, left: o3 }), u3 = getUA().toLowerCase();
    r && (a3 = _isChromeIOS(u3) ? "_blank" : r), _isFirefox(u3) && (t = t || "http://localhost", c3.scrollbars = "yes");
    const d3 = Object.entries(c3).reduce(((e2, [t2, r2]) => `${e2}${t2}=${r2},`), "");
    if ((function _isIOSStandalone(e2 = getUA()) {
      var t2;
      return _isIOS(e2) && !!(null === (t2 = window.navigator) || void 0 === t2 ? void 0 : t2.standalone);
    })(u3) && "_self" !== a3) return (function openAsNewWindowIOS(e2, t2) {
      const r2 = document.createElement("a");
      r2.href = e2, r2.target = t2;
      const n2 = document.createEvent("MouseEvent");
      n2.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 1, null), r2.dispatchEvent(n2);
    })(t || "", a3), new AuthPopup(null);
    const l3 = window.open(t || "", a3, d3);
    _assert(l3, e, "popup-blocked");
    try {
      l3.focus();
    } catch (e2) {
    }
    return new AuthPopup(l3);
  }
  var B = encodeURIComponent("fac");
  async function _getRedirectUrl(e, t, r, n, s3, o3) {
    _assert(e.config.authDomain, e, "auth-domain-config-required"), _assert(e.config.apiKey, e, "invalid-api-key");
    const a3 = { apiKey: e.config.apiKey, appName: e.name, authType: r, redirectUrl: n, v: SDK_VERSION, eventId: s3 };
    if (t instanceof FederatedAuthProvider) {
      t.setDefaultLanguage(e.languageCode), a3.providerId = t.providerId || "", (function isEmpty2(e2) {
        for (const t2 in e2) if (Object.prototype.hasOwnProperty.call(e2, t2)) return false;
        return true;
      })(t.getCustomParameters()) || (a3.customParameters = JSON.stringify(t.getCustomParameters()));
      for (const [e2, t2] of Object.entries(o3 || {})) a3[e2] = t2;
    }
    if (t instanceof BaseOAuthProvider) {
      const e2 = t.getScopes().filter(((e3) => "" !== e3));
      e2.length > 0 && (a3.scopes = e2.join(","));
    }
    e.tenantId && (a3.tid = e.tenantId);
    const c3 = a3;
    for (const e2 of Object.keys(c3)) void 0 === c3[e2] && delete c3[e2];
    const u3 = await e._getAppCheckToken(), d3 = u3 ? `#${B}=${encodeURIComponent(u3)}` : "";
    return `${(function getHandlerBase({ config: e2 }) {
      if (!e2.emulator) return `https://${e2.authDomain}/__/auth/handler`;
      return _emulatorUrl(e2, "emulator/auth/handler");
    })(e)}?${querystring(c3).slice(1)}${d3}`;
  }
  var z = class BrowserPopupRedirectResolver {
    constructor() {
      this.eventManagers = {}, this.iframes = {}, this.originValidationPromises = {}, this._redirectPersistence = k, this._completeRedirectFn = _getRedirectResult, this._overrideRedirectResult = _overrideRedirectResult;
    }
    async _openPopup(e, t, r, n) {
      var i2;
      debugAssert(null === (i2 = this.eventManagers[e._key()]) || void 0 === i2 ? void 0 : i2.manager, "_initialize() not called before _openPopup()");
      return _open(e, await _getRedirectUrl(e, t, r, _getCurrentUrl(), n), _generateEventId());
    }
    async _openRedirect(e, t, r, n) {
      await this._originValidation(e);
      return (function _setWindowLocation(e2) {
        _window().location.href = e2;
      })(await _getRedirectUrl(e, t, r, _getCurrentUrl(), n)), new Promise((() => {
      }));
    }
    _initialize(e) {
      const t = e._key();
      if (this.eventManagers[t]) {
        const { manager: e2, promise: r2 } = this.eventManagers[t];
        return e2 ? Promise.resolve(e2) : (debugAssert(r2, "If manager is not set, promise should be"), r2);
      }
      const r = this.initAndGetManager(e);
      return this.eventManagers[t] = { promise: r }, r.catch((() => {
        delete this.eventManagers[t];
      })), r;
    }
    async initAndGetManager(e) {
      const t = await _openIframe(e), r = new AuthEventManager(e);
      return t.register("authEvent", ((t2) => {
        _assert(null == t2 ? void 0 : t2.authEvent, e, "invalid-auth-event");
        return { status: r.onEvent(t2.authEvent) ? "ACK" : "ERROR" };
      }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER), this.eventManagers[e._key()] = { manager: r }, this.iframes[e._key()] = t, r;
    }
    _isIframeWebStorageSupported(e, t) {
      this.iframes[e._key()].send("webStorageSupport", { type: "webStorageSupport" }, ((r) => {
        var n;
        const i2 = null === (n = null == r ? void 0 : r[0]) || void 0 === n ? void 0 : n.webStorageSupport;
        void 0 !== i2 && t(!!i2), _fail(e, "internal-error");
      }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
    }
    _originValidation(e) {
      const t = e._key();
      return this.originValidationPromises[t] || (this.originValidationPromises[t] = _validateOrigin(e)), this.originValidationPromises[t];
    }
    get _shouldInitProactively() {
      return _isMobileBrowser() || _isSafari() || _isIOS();
    }
  };
  var MultiFactorAssertionImpl = class {
    constructor(e) {
      this.factorId = e;
    }
    _process(e, t, r) {
      switch (t.type) {
        case "enroll":
          return this._finalizeEnroll(e, t.credential, r);
        case "signin":
          return this._finalizeSignIn(e, t.credential);
        default:
          return debugFail("unexpected MultiFactorSessionType");
      }
    }
  };
  var PhoneMultiFactorAssertionImpl = class _PhoneMultiFactorAssertionImpl extends MultiFactorAssertionImpl {
    constructor(e) {
      super("phone"), this.credential = e;
    }
    static _fromCredential(e) {
      return new _PhoneMultiFactorAssertionImpl(e);
    }
    _finalizeEnroll(e, t, r) {
      return (function finalizeEnrollPhoneMfa(e2, t2) {
        return _performApiRequest(e2, "POST", "/v2/accounts/mfaEnrollment:finalize", _addTidIfNecessary(e2, t2));
      })(e, { idToken: t, displayName: r, phoneVerificationInfo: this.credential._makeVerificationRequest() });
    }
    _finalizeSignIn(e, t) {
      return (function finalizeSignInPhoneMfa(e2, t2) {
        return _performApiRequest(e2, "POST", "/v2/accounts/mfaSignIn:finalize", _addTidIfNecessary(e2, t2));
      })(e, { mfaPendingCredential: t, phoneVerificationInfo: this.credential._makeVerificationRequest() });
    }
  };
  var PhoneMultiFactorGenerator = class {
    constructor() {
    }
    static assertion(e) {
      return PhoneMultiFactorAssertionImpl._fromCredential(e);
    }
  };
  PhoneMultiFactorGenerator.FACTOR_ID = "phone";
  var TotpMultiFactorGenerator = class {
    static assertionForEnrollment(e, t) {
      return TotpMultiFactorAssertionImpl._fromSecret(e, t);
    }
    static assertionForSignIn(e, t) {
      return TotpMultiFactorAssertionImpl._fromEnrollmentId(e, t);
    }
    static async generateSecret(e) {
      var t;
      const r = e;
      _assert(void 0 !== (null === (t = r.user) || void 0 === t ? void 0 : t.auth), "internal-error");
      const n = await (function startEnrollTotpMfa(e2, t2) {
        return _performApiRequest(e2, "POST", "/v2/accounts/mfaEnrollment:start", _addTidIfNecessary(e2, t2));
      })(r.user.auth, { idToken: r.credential, totpEnrollmentInfo: {} });
      return TotpSecret._fromStartTotpMfaEnrollmentResponse(n, r.user.auth);
    }
  };
  TotpMultiFactorGenerator.FACTOR_ID = "totp";
  var TotpMultiFactorAssertionImpl = class _TotpMultiFactorAssertionImpl extends MultiFactorAssertionImpl {
    constructor(e, t, r) {
      super("totp"), this.otp = e, this.enrollmentId = t, this.secret = r;
    }
    static _fromSecret(e, t) {
      return new _TotpMultiFactorAssertionImpl(t, void 0, e);
    }
    static _fromEnrollmentId(e, t) {
      return new _TotpMultiFactorAssertionImpl(t, e);
    }
    async _finalizeEnroll(e, t, r) {
      return _assert(void 0 !== this.secret, e, "argument-error"), (function finalizeEnrollTotpMfa(e2, t2) {
        return _performApiRequest(e2, "POST", "/v2/accounts/mfaEnrollment:finalize", _addTidIfNecessary(e2, t2));
      })(e, { idToken: t, displayName: r, totpVerificationInfo: this.secret._makeTotpVerificationInfo(this.otp) });
    }
    async _finalizeSignIn(e, t) {
      _assert(void 0 !== this.enrollmentId && void 0 !== this.otp, e, "argument-error");
      const r = { verificationCode: this.otp };
      return (function finalizeSignInTotpMfa(e2, t2) {
        return _performApiRequest(e2, "POST", "/v2/accounts/mfaSignIn:finalize", _addTidIfNecessary(e2, t2));
      })(e, { mfaPendingCredential: t, mfaEnrollmentId: this.enrollmentId, totpVerificationInfo: r });
    }
  };
  var TotpSecret = class _TotpSecret {
    constructor(e, t, r, n, i2, s3, o3) {
      this.sessionInfo = s3, this.auth = o3, this.secretKey = e, this.hashingAlgorithm = t, this.codeLength = r, this.codeIntervalSeconds = n, this.enrollmentCompletionDeadline = i2;
    }
    static _fromStartTotpMfaEnrollmentResponse(e, t) {
      return new _TotpSecret(e.totpSessionInfo.sharedSecretKey, e.totpSessionInfo.hashingAlgorithm, e.totpSessionInfo.verificationCodeLength, e.totpSessionInfo.periodSec, new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(), e.totpSessionInfo.sessionInfo, t);
    }
    _makeTotpVerificationInfo(e) {
      return { sessionInfo: this.sessionInfo, verificationCode: e };
    }
    generateQrCodeUrl(e, t) {
      var r;
      let n = false;
      return (_isEmptyString(e) || _isEmptyString(t)) && (n = true), n && (_isEmptyString(e) && (e = (null === (r = this.auth.currentUser) || void 0 === r ? void 0 : r.email) || "unknownuser"), _isEmptyString(t) && (t = this.auth.name)), `otpauth://totp/${t}:${e}?secret=${this.secretKey}&issuer=${t}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`;
    }
  };
  function _isEmptyString(e) {
    return void 0 === e || 0 === (null == e ? void 0 : e.length);
  }
  var K = "@firebase/auth";
  var AuthInterop = class {
    constructor(e) {
      this.auth = e, this.internalListeners = /* @__PURE__ */ new Map();
    }
    getUid() {
      var e;
      return this.assertAuthConfigured(), (null === (e = this.auth.currentUser) || void 0 === e ? void 0 : e.uid) || null;
    }
    async getToken(e) {
      if (this.assertAuthConfigured(), await this.auth._initializationPromise, !this.auth.currentUser) return null;
      return { accessToken: await this.auth.currentUser.getIdToken(e) };
    }
    addAuthTokenListener(e) {
      if (this.assertAuthConfigured(), this.internalListeners.has(e)) return;
      const t = this.auth.onIdTokenChanged(((t2) => {
        e((null == t2 ? void 0 : t2.stsTokenManager.accessToken) || null);
      }));
      this.internalListeners.set(e, t), this.updateProactiveRefresh();
    }
    removeAuthTokenListener(e) {
      this.assertAuthConfigured();
      const t = this.internalListeners.get(e);
      t && (this.internalListeners.delete(e), t(), this.updateProactiveRefresh());
    }
    assertAuthConfigured() {
      _assert(this.auth._initializationPromise, "dependent-sdk-initialized-before-auth");
    }
    updateProactiveRefresh() {
      this.internalListeners.size > 0 ? this.auth._startProactiveRefresh() : this.auth._stopProactiveRefresh();
    }
  };
  var $ = getExperimentalSetting("authIdTokenMaxAge") || 300;
  var J = null;
  function getAuth(e = getApp()) {
    const t = _getProvider(e, "auth");
    if (t.isInitialized()) return t.getImmediate();
    const r = initializeAuth(e, { popupRedirectResolver: z, persistence: [O, C, k] }), i2 = getExperimentalSetting("authTokenSyncURL");
    if (i2 && "boolean" == typeof isSecureContext && isSecureContext) {
      const e2 = new URL(i2, location.origin);
      if (location.origin === e2.origin) {
        const t2 = (s3 = e2.toString(), async (e3) => {
          const t3 = e3 && await e3.getIdTokenResult(), r2 = t3 && ((/* @__PURE__ */ new Date()).getTime() - Date.parse(t3.issuedAtTime)) / 1e3;
          if (r2 && r2 > $) return;
          const n = null == t3 ? void 0 : t3.token;
          J !== n && (J = n, await fetch(s3, { method: n ? "POST" : "DELETE", headers: n ? { Authorization: `Bearer ${n}` } : {} }));
        });
        beforeAuthStateChanged(r, t2, (() => t2(r.currentUser))), onIdTokenChanged(r, ((e3) => t2(e3)));
      }
    }
    var s3;
    const o3 = (a3 = "auth", null === (u3 = null === (c3 = getDefaults2()) || void 0 === c3 ? void 0 : c3.emulatorHosts) || void 0 === u3 ? void 0 : u3[a3]);
    var a3, c3, u3;
    return o3 && connectAuthEmulator(r, `http://${o3}`), r;
  }
  !(function _setExternalJSProvider(e) {
    S = e;
  })({ loadJS: (e) => new Promise(((t, r) => {
    const n = document.createElement("script");
    n.setAttribute("src", e), n.onload = t, n.onerror = (e2) => {
      const t2 = _createError("internal-error");
      t2.customData = e2, r(t2);
    }, n.type = "text/javascript", n.charset = "UTF-8", (function getScriptParentElement() {
      var e2, t2;
      return null !== (t2 = null === (e2 = document.getElementsByTagName("head")) || void 0 === e2 ? void 0 : e2[0]) && void 0 !== t2 ? t2 : document;
    })().appendChild(n);
  })), gapiScript: "https://apis.google.com/js/api.js", recaptchaV2Script: "https://www.google.com/recaptcha/api.js", recaptchaEnterpriseScript: "https://www.google.com/recaptcha/enterprise.js?render=" }), (function registerAuth(e) {
    _registerComponent(new Component2("auth", ((t, { options: r }) => {
      const n = t.getProvider("app").getImmediate(), i2 = t.getProvider("heartbeat"), s3 = t.getProvider("app-check-internal"), { apiKey: o3, authDomain: a3 } = n.options;
      _assert(o3 && !o3.includes(":"), "invalid-api-key", { appName: n.name });
      const c3 = { apiKey: o3, authDomain: a3, clientPlatform: e, apiHost: "identitytoolkit.googleapis.com", tokenApiHost: "securetoken.googleapis.com", apiScheme: "https", sdkClientVersion: _getClientVersion(e) }, u3 = new AuthImpl(n, i2, s3, c3);
      return (function _initializeAuthInstance(e2, t2) {
        const r2 = (null == t2 ? void 0 : t2.persistence) || [], n2 = (Array.isArray(r2) ? r2 : [r2]).map(_getInstance);
        (null == t2 ? void 0 : t2.errorMap) && e2._updateErrorMap(t2.errorMap), e2._initializeWithPersistence(n2, null == t2 ? void 0 : t2.popupRedirectResolver);
      })(u3, r), u3;
    }), "PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback(((e2, t, r) => {
      e2.getProvider("auth-internal").initialize();
    }))), _registerComponent(new Component2("auth-internal", ((e2) => ((e3) => new AuthInterop(e3))(_castAuth(e2.getProvider("auth").getImmediate()))), "PRIVATE").setInstantiationMode("EXPLICIT")), registerVersion(K, "1.8.1", (function getVersionForPlatform(e2) {
      switch (e2) {
        case "Node":
          return "node";
        case "ReactNative":
          return "rn";
        case "Worker":
          return "webworker";
        case "Cordova":
          return "cordova";
        case "WebExtension":
          return "web-extension";
        default:
          return;
      }
    })(e)), registerVersion(K, "1.8.1", "esm2017");
  })("Browser");

  // firebase-database.js
  var firebase_database_exports = {};
  __export(firebase_database_exports, {
    DataSnapshot: () => DataSnapshot,
    Database: () => Database,
    OnDisconnect: () => OnDisconnect,
    QueryConstraint: () => QueryConstraint,
    TransactionResult: () => TransactionResult,
    _QueryImpl: () => QueryImpl,
    _QueryParams: () => QueryParams,
    _ReferenceImpl: () => ReferenceImpl,
    _TEST_ACCESS_forceRestClient: () => forceRestClient,
    _TEST_ACCESS_hijackHash: () => hijackHash,
    _initStandalone: () => _initStandalone,
    _repoManagerDatabaseFromApp: () => repoManagerDatabaseFromApp,
    _setSDKVersion: () => setSDKVersion,
    _validatePathString: () => validatePathString,
    _validateWritablePath: () => validateWritablePath,
    child: () => child,
    connectDatabaseEmulator: () => connectDatabaseEmulator,
    enableLogging: () => enableLogging,
    endAt: () => endAt,
    endBefore: () => endBefore,
    equalTo: () => equalTo,
    forceLongPolling: () => forceLongPolling,
    forceWebSockets: () => forceWebSockets,
    get: () => get,
    getDatabase: () => getDatabase,
    goOffline: () => goOffline,
    goOnline: () => goOnline,
    increment: () => increment,
    limitToFirst: () => limitToFirst,
    limitToLast: () => limitToLast,
    off: () => off,
    onChildAdded: () => onChildAdded,
    onChildChanged: () => onChildChanged,
    onChildMoved: () => onChildMoved,
    onChildRemoved: () => onChildRemoved,
    onDisconnect: () => onDisconnect,
    onValue: () => onValue,
    orderByChild: () => orderByChild,
    orderByKey: () => orderByKey,
    orderByPriority: () => orderByPriority,
    orderByValue: () => orderByValue,
    push: () => push,
    query: () => query,
    ref: () => ref,
    refFromURL: () => refFromURL,
    remove: () => remove,
    runTransaction: () => runTransaction,
    serverTimestamp: () => serverTimestamp,
    set: () => set,
    setPriority: () => setPriority,
    setWithPriority: () => setWithPriority,
    startAfter: () => startAfter,
    startAt: () => startAt,
    update: () => update
  });
  var i = false;
  var o2 = "${JSCORE_VERSION}";
  var assert = function(e, t) {
    if (!e) throw assertionError(t);
  };
  var assertionError = function(e) {
    return new Error("Firebase Database (" + o2 + ") INTERNAL ASSERT FAILED: " + e);
  };
  var stringToByteArray$12 = function(e) {
    const t = [];
    let n = 0;
    for (let r = 0; r < e.length; r++) {
      let i2 = e.charCodeAt(r);
      i2 < 128 ? t[n++] = i2 : i2 < 2048 ? (t[n++] = i2 >> 6 | 192, t[n++] = 63 & i2 | 128) : 55296 == (64512 & i2) && r + 1 < e.length && 56320 == (64512 & e.charCodeAt(r + 1)) ? (i2 = 65536 + ((1023 & i2) << 10) + (1023 & e.charCodeAt(++r)), t[n++] = i2 >> 18 | 240, t[n++] = i2 >> 12 & 63 | 128, t[n++] = i2 >> 6 & 63 | 128, t[n++] = 63 & i2 | 128) : (t[n++] = i2 >> 12 | 224, t[n++] = i2 >> 6 & 63 | 128, t[n++] = 63 & i2 | 128);
    }
    return t;
  };
  var s2 = { byteToCharMap_: null, charToByteMap_: null, byteToCharMapWebSafe_: null, charToByteMapWebSafe_: null, ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  }, get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  }, HAS_NATIVE_SUPPORT: "function" == typeof atob, encodeByteArray(e, t) {
    if (!Array.isArray(e)) throw Error("encodeByteArray takes an array as a parameter");
    this.init_();
    const n = t ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, r = [];
    for (let t2 = 0; t2 < e.length; t2 += 3) {
      const i2 = e[t2], o3 = t2 + 1 < e.length, s3 = o3 ? e[t2 + 1] : 0, a3 = t2 + 2 < e.length, l3 = a3 ? e[t2 + 2] : 0, h3 = i2 >> 2, c3 = (3 & i2) << 4 | s3 >> 4;
      let d3 = (15 & s3) << 2 | l3 >> 6, u3 = 63 & l3;
      a3 || (u3 = 64, o3 || (d3 = 64)), r.push(n[h3], n[c3], n[d3], n[u3]);
    }
    return r.join("");
  }, encodeString(e, t) {
    return this.HAS_NATIVE_SUPPORT && !t ? btoa(e) : this.encodeByteArray(stringToByteArray$12(e), t);
  }, decodeString(e, t) {
    return this.HAS_NATIVE_SUPPORT && !t ? atob(e) : (function(e2) {
      const t2 = [];
      let n = 0, r = 0;
      for (; n < e2.length; ) {
        const i2 = e2[n++];
        if (i2 < 128) t2[r++] = String.fromCharCode(i2);
        else if (i2 > 191 && i2 < 224) {
          const o3 = e2[n++];
          t2[r++] = String.fromCharCode((31 & i2) << 6 | 63 & o3);
        } else if (i2 > 239 && i2 < 365) {
          const o3 = ((7 & i2) << 18 | (63 & e2[n++]) << 12 | (63 & e2[n++]) << 6 | 63 & e2[n++]) - 65536;
          t2[r++] = String.fromCharCode(55296 + (o3 >> 10)), t2[r++] = String.fromCharCode(56320 + (1023 & o3));
        } else {
          const o3 = e2[n++], s3 = e2[n++];
          t2[r++] = String.fromCharCode((15 & i2) << 12 | (63 & o3) << 6 | 63 & s3);
        }
      }
      return t2.join("");
    })(this.decodeStringToByteArray(e, t));
  }, decodeStringToByteArray(e, t) {
    this.init_();
    const n = t ? this.charToByteMapWebSafe_ : this.charToByteMap_, r = [];
    for (let t2 = 0; t2 < e.length; ) {
      const i2 = n[e.charAt(t2++)], o3 = t2 < e.length ? n[e.charAt(t2)] : 0;
      ++t2;
      const s3 = t2 < e.length ? n[e.charAt(t2)] : 64;
      ++t2;
      const a3 = t2 < e.length ? n[e.charAt(t2)] : 64;
      if (++t2, null == i2 || null == o3 || null == s3 || null == a3) throw new DecodeBase64StringError3();
      const l3 = i2 << 2 | o3 >> 4;
      if (r.push(l3), 64 !== s3) {
        const e2 = o3 << 4 & 240 | s3 >> 2;
        if (r.push(e2), 64 !== a3) {
          const e3 = s3 << 6 & 192 | a3;
          r.push(e3);
        }
      }
    }
    return r;
  }, init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
      for (let e = 0; e < this.ENCODED_VALS.length; e++) this.byteToCharMap_[e] = this.ENCODED_VALS.charAt(e), this.charToByteMap_[this.byteToCharMap_[e]] = e, this.byteToCharMapWebSafe_[e] = this.ENCODED_VALS_WEBSAFE.charAt(e), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]] = e, e >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)] = e, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)] = e);
    }
  } };
  var DecodeBase64StringError3 = class extends Error {
    constructor() {
      super(...arguments), this.name = "DecodeBase64StringError";
    }
  };
  var base64Encode2 = function(e) {
    const t = stringToByteArray$12(e);
    return s2.encodeByteArray(t, true);
  };
  var base64urlEncodeWithoutPadding2 = function(e) {
    return base64Encode2(e).replace(/\./g, "");
  };
  var base64Decode3 = function(e) {
    try {
      return s2.decodeString(e, true);
    } catch (e2) {
      console.error("base64Decode failed: ", e2);
    }
    return null;
  };
  function deepCopy(e) {
    return deepExtend(void 0, e);
  }
  function deepExtend(e, t) {
    if (!(t instanceof Object)) return t;
    switch (t.constructor) {
      case Date:
        return new Date(t.getTime());
      case Object:
        void 0 === e && (e = {});
        break;
      case Array:
        e = [];
        break;
      default:
        return t;
    }
    for (const n in t) t.hasOwnProperty(n) && "__proto__" !== n && (e[n] = deepExtend(e[n], t[n]));
    return e;
  }
  var getDefaultsFromGlobal3 = () => (function getGlobal2() {
    if ("undefined" != typeof self) return self;
    if ("undefined" != typeof window) return window;
    if ("undefined" != typeof global) return global;
    throw new Error("Unable to locate global object.");
  })().__FIREBASE_DEFAULTS__;
  var getDefaults3 = () => {
    try {
      return getDefaultsFromGlobal3() || (() => {
        if ("undefined" == typeof process || void 0 === process.env) return;
        const e = process.env.__FIREBASE_DEFAULTS__;
        return e ? JSON.parse(e) : void 0;
      })() || (() => {
        if ("undefined" == typeof document) return;
        let e;
        try {
          e = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
        } catch (e2) {
          return;
        }
        const t = e && base64Decode3(e[1]);
        return t && JSON.parse(t);
      })();
    } catch (e) {
      return void console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
    }
  };
  var getDefaultEmulatorHostnameAndPort = (e) => {
    const t = ((e2) => {
      var t2, n2;
      return null === (n2 = null === (t2 = getDefaults3()) || void 0 === t2 ? void 0 : t2.emulatorHosts) || void 0 === n2 ? void 0 : n2[e2];
    })(e);
    if (!t) return;
    const n = t.lastIndexOf(":");
    if (n <= 0 || n + 1 === t.length) throw new Error(`Invalid host ${t} with no separate hostname and port!`);
    const r = parseInt(t.substring(n + 1), 10);
    return "[" === t[0] ? [t.substring(1, n - 1), r] : [t.substring(0, n), r];
  };
  var Deferred2 = class {
    constructor() {
      this.reject = () => {
      }, this.resolve = () => {
      }, this.promise = new Promise(((e, t) => {
        this.resolve = e, this.reject = t;
      }));
    }
    wrapCallback(e) {
      return (t, n) => {
        t ? this.reject(t) : this.resolve(n), "function" == typeof e && (this.promise.catch((() => {
        })), 1 === e.length ? e(t) : e(t, n));
      };
    }
  };
  function isMobileCordova() {
    return "undefined" != typeof window && !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test((function getUA2() {
      return "undefined" != typeof navigator && "string" == typeof navigator.userAgent ? navigator.userAgent : "";
    })());
  }
  function isNodeSdk() {
    return true === i;
  }
  function jsonEval(e) {
    return JSON.parse(e);
  }
  function stringify(e) {
    return JSON.stringify(e);
  }
  var decode = function(e) {
    let t = {}, n = {}, r = {}, i2 = "";
    try {
      const o3 = e.split(".");
      t = jsonEval(base64Decode3(o3[0]) || ""), n = jsonEval(base64Decode3(o3[1]) || ""), i2 = o3[2], r = n.d || {}, delete n.d;
    } catch (e2) {
    }
    return { header: t, claims: n, data: r, signature: i2 };
  };
  function contains(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  }
  function safeGet(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t) ? e[t] : void 0;
  }
  function isEmpty(e) {
    for (const t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return false;
    return true;
  }
  function map(e, t, n) {
    const r = {};
    for (const i2 in e) Object.prototype.hasOwnProperty.call(e, i2) && (r[i2] = t.call(n, e[i2], i2, e));
    return r;
  }
  var Sha1 = class {
    constructor() {
      this.chain_ = [], this.buf_ = [], this.W_ = [], this.pad_ = [], this.inbuf_ = 0, this.total_ = 0, this.blockSize = 64, this.pad_[0] = 128;
      for (let e = 1; e < this.blockSize; ++e) this.pad_[e] = 0;
      this.reset();
    }
    reset() {
      this.chain_[0] = 1732584193, this.chain_[1] = 4023233417, this.chain_[2] = 2562383102, this.chain_[3] = 271733878, this.chain_[4] = 3285377520, this.inbuf_ = 0, this.total_ = 0;
    }
    compress_(e, t) {
      t || (t = 0);
      const n = this.W_;
      if ("string" == typeof e) for (let r2 = 0; r2 < 16; r2++) n[r2] = e.charCodeAt(t) << 24 | e.charCodeAt(t + 1) << 16 | e.charCodeAt(t + 2) << 8 | e.charCodeAt(t + 3), t += 4;
      else for (let r2 = 0; r2 < 16; r2++) n[r2] = e[t] << 24 | e[t + 1] << 16 | e[t + 2] << 8 | e[t + 3], t += 4;
      for (let e2 = 16; e2 < 80; e2++) {
        const t2 = n[e2 - 3] ^ n[e2 - 8] ^ n[e2 - 14] ^ n[e2 - 16];
        n[e2] = 4294967295 & (t2 << 1 | t2 >>> 31);
      }
      let r, i2, o3 = this.chain_[0], s3 = this.chain_[1], a3 = this.chain_[2], l3 = this.chain_[3], h3 = this.chain_[4];
      for (let e2 = 0; e2 < 80; e2++) {
        e2 < 40 ? e2 < 20 ? (r = l3 ^ s3 & (a3 ^ l3), i2 = 1518500249) : (r = s3 ^ a3 ^ l3, i2 = 1859775393) : e2 < 60 ? (r = s3 & a3 | l3 & (s3 | a3), i2 = 2400959708) : (r = s3 ^ a3 ^ l3, i2 = 3395469782);
        const t2 = (o3 << 5 | o3 >>> 27) + r + h3 + i2 + n[e2] & 4294967295;
        h3 = l3, l3 = a3, a3 = 4294967295 & (s3 << 30 | s3 >>> 2), s3 = o3, o3 = t2;
      }
      this.chain_[0] = this.chain_[0] + o3 & 4294967295, this.chain_[1] = this.chain_[1] + s3 & 4294967295, this.chain_[2] = this.chain_[2] + a3 & 4294967295, this.chain_[3] = this.chain_[3] + l3 & 4294967295, this.chain_[4] = this.chain_[4] + h3 & 4294967295;
    }
    update(e, t) {
      if (null == e) return;
      void 0 === t && (t = e.length);
      const n = t - this.blockSize;
      let r = 0;
      const i2 = this.buf_;
      let o3 = this.inbuf_;
      for (; r < t; ) {
        if (0 === o3) for (; r <= n; ) this.compress_(e, r), r += this.blockSize;
        if ("string" == typeof e) {
          for (; r < t; ) if (i2[o3] = e.charCodeAt(r), ++o3, ++r, o3 === this.blockSize) {
            this.compress_(i2), o3 = 0;
            break;
          }
        } else for (; r < t; ) if (i2[o3] = e[r], ++o3, ++r, o3 === this.blockSize) {
          this.compress_(i2), o3 = 0;
          break;
        }
      }
      this.inbuf_ = o3, this.total_ += t;
    }
    digest() {
      const e = [];
      let t = 8 * this.total_;
      this.inbuf_ < 56 ? this.update(this.pad_, 56 - this.inbuf_) : this.update(this.pad_, this.blockSize - (this.inbuf_ - 56));
      for (let e2 = this.blockSize - 1; e2 >= 56; e2--) this.buf_[e2] = 255 & t, t /= 256;
      this.compress_(this.buf_);
      let n = 0;
      for (let t2 = 0; t2 < 5; t2++) for (let r = 24; r >= 0; r -= 8) e[n] = this.chain_[t2] >> r & 255, ++n;
      return e;
    }
  };
  function errorPrefix(e, t) {
    return `${e} failed: ${t} argument `;
  }
  var stringLength = function(e) {
    let t = 0;
    for (let n = 0; n < e.length; n++) {
      const r = e.charCodeAt(n);
      r < 128 ? t++ : r < 2048 ? t += 2 : r >= 55296 && r <= 56319 ? (t += 4, n++) : t += 3;
    }
    return t;
  };
  function getModularInstance2(e) {
    return e && e._delegate ? e._delegate : e;
  }
  var Component3 = class {
    constructor(e, t, n) {
      this.name = e, this.instanceFactory = t, this.type = n, this.multipleInstances = false, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
    }
    setInstantiationMode(e) {
      return this.instantiationMode = e, this;
    }
    setMultipleInstances(e) {
      return this.multipleInstances = e, this;
    }
    setServiceProps(e) {
      return this.serviceProps = e, this;
    }
    setInstanceCreatedCallback(e) {
      return this.onInstanceCreated = e, this;
    }
  };
  var Provider2 = class {
    constructor(e, t) {
      this.name = e, this.container = t, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
    }
    get(e) {
      const t = this.normalizeInstanceIdentifier(e);
      if (!this.instancesDeferred.has(t)) {
        const e2 = new Deferred2();
        if (this.instancesDeferred.set(t, e2), this.isInitialized(t) || this.shouldAutoInitialize()) try {
          const n = this.getOrInitializeService({ instanceIdentifier: t });
          n && e2.resolve(n);
        } catch (e3) {
        }
      }
      return this.instancesDeferred.get(t).promise;
    }
    getImmediate(e) {
      var t;
      const n = this.normalizeInstanceIdentifier(null == e ? void 0 : e.identifier), r = null !== (t = null == e ? void 0 : e.optional) && void 0 !== t && t;
      if (!this.isInitialized(n) && !this.shouldAutoInitialize()) {
        if (r) return null;
        throw Error(`Service ${this.name} is not available`);
      }
      try {
        return this.getOrInitializeService({ instanceIdentifier: n });
      } catch (e2) {
        if (r) return null;
        throw e2;
      }
    }
    getComponent() {
      return this.component;
    }
    setComponent(e) {
      if (e.name !== this.name) throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
      if (this.component) throw Error(`Component for ${this.name} has already been provided`);
      if (this.component = e, this.shouldAutoInitialize()) {
        if ((function isComponentEager2(e2) {
          return "EAGER" === e2.instantiationMode;
        })(e)) try {
          this.getOrInitializeService({ instanceIdentifier: "[DEFAULT]" });
        } catch (e2) {
        }
        for (const [e2, t] of this.instancesDeferred.entries()) {
          const n = this.normalizeInstanceIdentifier(e2);
          try {
            const e3 = this.getOrInitializeService({ instanceIdentifier: n });
            t.resolve(e3);
          } catch (e3) {
          }
        }
      }
    }
    clearInstance(e = "[DEFAULT]") {
      this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
    }
    async delete() {
      const e = Array.from(this.instances.values());
      await Promise.all([...e.filter(((e2) => "INTERNAL" in e2)).map(((e2) => e2.INTERNAL.delete())), ...e.filter(((e2) => "_delete" in e2)).map(((e2) => e2._delete()))]);
    }
    isComponentSet() {
      return null != this.component;
    }
    isInitialized(e = "[DEFAULT]") {
      return this.instances.has(e);
    }
    getOptions(e = "[DEFAULT]") {
      return this.instancesOptions.get(e) || {};
    }
    initialize(e = {}) {
      const { options: t = {} } = e, n = this.normalizeInstanceIdentifier(e.instanceIdentifier);
      if (this.isInitialized(n)) throw Error(`${this.name}(${n}) has already been initialized`);
      if (!this.isComponentSet()) throw Error(`Component ${this.name} has not been registered yet`);
      const r = this.getOrInitializeService({ instanceIdentifier: n, options: t });
      for (const [e2, t2] of this.instancesDeferred.entries()) {
        n === this.normalizeInstanceIdentifier(e2) && t2.resolve(r);
      }
      return r;
    }
    onInit(e, t) {
      var n;
      const r = this.normalizeInstanceIdentifier(t), i2 = null !== (n = this.onInitCallbacks.get(r)) && void 0 !== n ? n : /* @__PURE__ */ new Set();
      i2.add(e), this.onInitCallbacks.set(r, i2);
      const o3 = this.instances.get(r);
      return o3 && e(o3, r), () => {
        i2.delete(e);
      };
    }
    invokeOnInitCallbacks(e, t) {
      const n = this.onInitCallbacks.get(t);
      if (n) for (const r of n) try {
        r(e, t);
      } catch (e2) {
      }
    }
    getOrInitializeService({ instanceIdentifier: e, options: t = {} }) {
      let n = this.instances.get(e);
      if (!n && this.component && (n = this.component.instanceFactory(this.container, { instanceIdentifier: (r = e, "[DEFAULT]" === r ? void 0 : r), options: t }), this.instances.set(e, n), this.instancesOptions.set(e, t), this.invokeOnInitCallbacks(n, e), this.component.onInstanceCreated)) try {
        this.component.onInstanceCreated(this.container, e, n);
      } catch (e2) {
      }
      var r;
      return n || null;
    }
    normalizeInstanceIdentifier(e = "[DEFAULT]") {
      return this.component ? this.component.multipleInstances ? e : "[DEFAULT]" : e;
    }
    shouldAutoInitialize() {
      return !!this.component && "EXPLICIT" !== this.component.instantiationMode;
    }
  };
  var ComponentContainer2 = class {
    constructor(e) {
      this.name = e, this.providers = /* @__PURE__ */ new Map();
    }
    addComponent(e) {
      const t = this.getProvider(e.name);
      if (t.isComponentSet()) throw new Error(`Component ${e.name} has already been registered with ${this.name}`);
      t.setComponent(e);
    }
    addOrOverwriteComponent(e) {
      this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name), this.addComponent(e);
    }
    getProvider(e) {
      if (this.providers.has(e)) return this.providers.get(e);
      const t = new Provider2(e, this);
      return this.providers.set(e, t), t;
    }
    getProviders() {
      return Array.from(this.providers.values());
    }
  };
  var a2;
  !(function(e) {
    e[e.DEBUG = 0] = "DEBUG", e[e.VERBOSE = 1] = "VERBOSE", e[e.INFO = 2] = "INFO", e[e.WARN = 3] = "WARN", e[e.ERROR = 4] = "ERROR", e[e.SILENT = 5] = "SILENT";
  })(a2 || (a2 = {}));
  var l2 = { debug: a2.DEBUG, verbose: a2.VERBOSE, info: a2.INFO, warn: a2.WARN, error: a2.ERROR, silent: a2.SILENT };
  var h2 = a2.INFO;
  var c2 = { [a2.DEBUG]: "log", [a2.VERBOSE]: "log", [a2.INFO]: "info", [a2.WARN]: "warn", [a2.ERROR]: "error" };
  var defaultLogHandler3 = (e, t, ...n) => {
    if (t < e.logLevel) return;
    const r = (/* @__PURE__ */ new Date()).toISOString(), i2 = c2[t];
    if (!i2) throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`);
    console[i2](`[${r}]  ${e.name}:`, ...n);
  };
  var d2 = "@firebase/database";
  var u2 = "";
  function setSDKVersion(e) {
    u2 = e;
  }
  var DOMStorageWrapper = class {
    constructor(e) {
      this.domStorage_ = e, this.prefix_ = "firebase:";
    }
    set(e, t) {
      null == t ? this.domStorage_.removeItem(this.prefixedName_(e)) : this.domStorage_.setItem(this.prefixedName_(e), stringify(t));
    }
    get(e) {
      const t = this.domStorage_.getItem(this.prefixedName_(e));
      return null == t ? null : jsonEval(t);
    }
    remove(e) {
      this.domStorage_.removeItem(this.prefixedName_(e));
    }
    prefixedName_(e) {
      return this.prefix_ + e;
    }
    toString() {
      return this.domStorage_.toString();
    }
  };
  var MemoryStorage = class {
    constructor() {
      this.cache_ = {}, this.isInMemoryStorage = true;
    }
    set(e, t) {
      null == t ? delete this.cache_[e] : this.cache_[e] = t;
    }
    get(e) {
      return contains(this.cache_, e) ? this.cache_[e] : null;
    }
    remove(e) {
      delete this.cache_[e];
    }
  };
  var createStoragefor = function(e) {
    try {
      if ("undefined" != typeof window && void 0 !== window[e]) {
        const t = window[e];
        return t.setItem("firebase:sentinel", "cache"), t.removeItem("firebase:sentinel"), new DOMStorageWrapper(t);
      }
    } catch (e2) {
    }
    return new MemoryStorage();
  };
  var p2 = createStoragefor("localStorage");
  var _2 = createStoragefor("sessionStorage");
  var m2 = new class Logger3 {
    constructor(e) {
      this.name = e, this._logLevel = h2, this._logHandler = defaultLogHandler3, this._userLogHandler = null;
    }
    get logLevel() {
      return this._logLevel;
    }
    set logLevel(e) {
      if (!(e in a2)) throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
      this._logLevel = e;
    }
    setLogLevel(e) {
      this._logLevel = "string" == typeof e ? l2[e] : e;
    }
    get logHandler() {
      return this._logHandler;
    }
    set logHandler(e) {
      if ("function" != typeof e) throw new TypeError("Value assigned to `logHandler` must be a function");
      this._logHandler = e;
    }
    get userLogHandler() {
      return this._userLogHandler;
    }
    set userLogHandler(e) {
      this._userLogHandler = e;
    }
    debug(...e) {
      this._userLogHandler && this._userLogHandler(this, a2.DEBUG, ...e), this._logHandler(this, a2.DEBUG, ...e);
    }
    log(...e) {
      this._userLogHandler && this._userLogHandler(this, a2.VERBOSE, ...e), this._logHandler(this, a2.VERBOSE, ...e);
    }
    info(...e) {
      this._userLogHandler && this._userLogHandler(this, a2.INFO, ...e), this._logHandler(this, a2.INFO, ...e);
    }
    warn(...e) {
      this._userLogHandler && this._userLogHandler(this, a2.WARN, ...e), this._logHandler(this, a2.WARN, ...e);
    }
    error(...e) {
      this._userLogHandler && this._userLogHandler(this, a2.ERROR, ...e), this._logHandler(this, a2.ERROR, ...e);
    }
  }("@firebase/database");
  var f2 = /* @__PURE__ */ (function() {
    let e = 1;
    return function() {
      return e++;
    };
  })();
  var sha1 = function(e) {
    const t = (function(e2) {
      const t2 = [];
      let n2 = 0;
      for (let r2 = 0; r2 < e2.length; r2++) {
        let i2 = e2.charCodeAt(r2);
        if (i2 >= 55296 && i2 <= 56319) {
          const t3 = i2 - 55296;
          r2++, assert(r2 < e2.length, "Surrogate pair missing trail surrogate."), i2 = 65536 + (t3 << 10) + (e2.charCodeAt(r2) - 56320);
        }
        i2 < 128 ? t2[n2++] = i2 : i2 < 2048 ? (t2[n2++] = i2 >> 6 | 192, t2[n2++] = 63 & i2 | 128) : i2 < 65536 ? (t2[n2++] = i2 >> 12 | 224, t2[n2++] = i2 >> 6 & 63 | 128, t2[n2++] = 63 & i2 | 128) : (t2[n2++] = i2 >> 18 | 240, t2[n2++] = i2 >> 12 & 63 | 128, t2[n2++] = i2 >> 6 & 63 | 128, t2[n2++] = 63 & i2 | 128);
      }
      return t2;
    })(e), n = new Sha1();
    n.update(t);
    const r = n.digest();
    return s2.encodeByteArray(r);
  };
  var buildLogMessage_ = function(...e) {
    let t = "";
    for (let n = 0; n < e.length; n++) {
      const r = e[n];
      Array.isArray(r) || r && "object" == typeof r && "number" == typeof r.length ? t += buildLogMessage_.apply(null, r) : t += "object" == typeof r ? stringify(r) : r, t += " ";
    }
    return t;
  };
  var y2 = null;
  var g2 = true;
  var enableLogging$1 = function(e, t) {
    assert(!t || true === e || false === e, "Can't turn on custom loggers persistently."), true === e ? (m2.logLevel = a2.VERBOSE, y2 = m2.log.bind(m2), t && _2.set("logging_enabled", true)) : "function" == typeof e ? y2 = e : (y2 = null, _2.remove("logging_enabled"));
  };
  var log = function(...e) {
    if (true === g2 && (g2 = false, null === y2 && true === _2.get("logging_enabled") && enableLogging$1(true)), y2) {
      const t = buildLogMessage_.apply(null, e);
      y2(t);
    }
  };
  var logWrapper = function(e) {
    return function(...t) {
      log(e, ...t);
    };
  };
  var error = function(...e) {
    const t = "FIREBASE INTERNAL ERROR: " + buildLogMessage_(...e);
    m2.error(t);
  };
  var fatal = function(...e) {
    const t = `FIREBASE FATAL ERROR: ${buildLogMessage_(...e)}`;
    throw m2.error(t), new Error(t);
  };
  var warn = function(...e) {
    const t = "FIREBASE WARNING: " + buildLogMessage_(...e);
    m2.warn(t);
  };
  var isInvalidJSONNumber = function(e) {
    return "number" == typeof e && (e != e || e === Number.POSITIVE_INFINITY || e === Number.NEGATIVE_INFINITY);
  };
  var v2 = "[MIN_NAME]";
  var C2 = "[MAX_NAME]";
  var nameCompare = function(e, t) {
    if (e === t) return 0;
    if (e === v2 || t === C2) return -1;
    if (t === v2 || e === C2) return 1;
    {
      const n = tryParseInt(e), r = tryParseInt(t);
      return null !== n ? null !== r ? n - r == 0 ? e.length - t.length : n - r : -1 : null !== r ? 1 : e < t ? -1 : 1;
    }
  };
  var stringCompare = function(e, t) {
    return e === t ? 0 : e < t ? -1 : 1;
  };
  var requireKey = function(e, t) {
    if (t && e in t) return t[e];
    throw new Error("Missing required key (" + e + ") in object: " + stringify(t));
  };
  var ObjectToUniqueKey = function(e) {
    if ("object" != typeof e || null === e) return stringify(e);
    const t = [];
    for (const n2 in e) t.push(n2);
    t.sort();
    let n = "{";
    for (let r = 0; r < t.length; r++) 0 !== r && (n += ","), n += stringify(t[r]), n += ":", n += ObjectToUniqueKey(e[t[r]]);
    return n += "}", n;
  };
  var splitStringBySize = function(e, t) {
    const n = e.length;
    if (n <= t) return [e];
    const r = [];
    for (let i2 = 0; i2 < n; i2 += t) i2 + t > n ? r.push(e.substring(i2, n)) : r.push(e.substring(i2, i2 + t));
    return r;
  };
  function each(e, t) {
    for (const n in e) e.hasOwnProperty(n) && t(n, e[n]);
  }
  var doubleToIEEE754String = function(e) {
    assert(!isInvalidJSONNumber(e), "Invalid JSON number");
    const t = 1023;
    let n, r, i2, o3, s3;
    0 === e ? (r = 0, i2 = 0, n = 1 / e == -1 / 0 ? 1 : 0) : (n = e < 0, (e = Math.abs(e)) >= Math.pow(2, -1022) ? (o3 = Math.min(Math.floor(Math.log(e) / Math.LN2), t), r = o3 + t, i2 = Math.round(e * Math.pow(2, 52 - o3) - Math.pow(2, 52))) : (r = 0, i2 = Math.round(e / Math.pow(2, -1074))));
    const a3 = [];
    for (s3 = 52; s3; s3 -= 1) a3.push(i2 % 2 ? 1 : 0), i2 = Math.floor(i2 / 2);
    for (s3 = 11; s3; s3 -= 1) a3.push(r % 2 ? 1 : 0), r = Math.floor(r / 2);
    a3.push(n ? 1 : 0), a3.reverse();
    const l3 = a3.join("");
    let h3 = "";
    for (s3 = 0; s3 < 64; s3 += 8) {
      let e2 = parseInt(l3.substr(s3, 8), 2).toString(16);
      1 === e2.length && (e2 = "0" + e2), h3 += e2;
    }
    return h3.toLowerCase();
  };
  var w2 = new RegExp("^-?(0*)\\d{1,10}$");
  var tryParseInt = function(e) {
    if (w2.test(e)) {
      const t = Number(e);
      if (t >= -2147483648 && t <= 2147483647) return t;
    }
    return null;
  };
  var exceptionGuard = function(e) {
    try {
      e();
    } catch (e2) {
      setTimeout((() => {
        const t = e2.stack || "";
        throw warn("Exception was thrown by user callback.", t), e2;
      }), Math.floor(0));
    }
  };
  var setTimeoutNonBlocking = function(e, t) {
    const n = setTimeout(e, t);
    return "number" == typeof n && "undefined" != typeof Deno && Deno.unrefTimer ? Deno.unrefTimer(n) : "object" == typeof n && n.unref && n.unref(), n;
  };
  var AppCheckTokenProvider = class {
    constructor(e, t) {
      this.appName_ = e, this.appCheckProvider = t, this.appCheck = null == t ? void 0 : t.getImmediate({ optional: true }), this.appCheck || null == t || t.get().then(((e2) => this.appCheck = e2));
    }
    getToken(e) {
      return this.appCheck ? this.appCheck.getToken(e) : new Promise(((t, n) => {
        setTimeout((() => {
          this.appCheck ? this.getToken(e).then(t, n) : t(null);
        }), 0);
      }));
    }
    addTokenChangeListener(e) {
      var t;
      null === (t = this.appCheckProvider) || void 0 === t || t.get().then(((t2) => t2.addTokenListener(e)));
    }
    notifyForInvalidToken() {
      warn(`Provided AppCheck credentials for the app named "${this.appName_}" are invalid. This usually indicates your app was not initialized correctly.`);
    }
  };
  var FirebaseAuthTokenProvider = class {
    constructor(e, t, n) {
      this.appName_ = e, this.firebaseOptions_ = t, this.authProvider_ = n, this.auth_ = null, this.auth_ = n.getImmediate({ optional: true }), this.auth_ || n.onInit(((e2) => this.auth_ = e2));
    }
    getToken(e) {
      return this.auth_ ? this.auth_.getToken(e).catch(((e2) => e2 && "auth/token-not-initialized" === e2.code ? (log("Got auth/token-not-initialized error.  Treating as null token."), null) : Promise.reject(e2))) : new Promise(((t, n) => {
        setTimeout((() => {
          this.auth_ ? this.getToken(e).then(t, n) : t(null);
        }), 0);
      }));
    }
    addTokenChangeListener(e) {
      this.auth_ ? this.auth_.addAuthTokenListener(e) : this.authProvider_.get().then(((t) => t.addAuthTokenListener(e)));
    }
    removeTokenChangeListener(e) {
      this.authProvider_.get().then(((t) => t.removeAuthTokenListener(e)));
    }
    notifyForInvalidToken() {
      let e = 'Provided authentication credentials for the app named "' + this.appName_ + '" are invalid. This usually indicates your app was not initialized correctly. ';
      "credential" in this.firebaseOptions_ ? e += 'Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.' : "serviceAccount" in this.firebaseOptions_ ? e += 'Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.' : e += 'Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.', warn(e);
    }
  };
  var EmulatorTokenProvider = class {
    constructor(e) {
      this.accessToken = e;
    }
    getToken(e) {
      return Promise.resolve({ accessToken: this.accessToken });
    }
    addTokenChangeListener(e) {
      e(this.accessToken);
    }
    removeTokenChangeListener(e) {
    }
    notifyForInvalidToken() {
    }
  };
  EmulatorTokenProvider.OWNER = "owner";
  var T2 = /(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/;
  var RepoInfo = class {
    constructor(e, t, n, r, i2 = false, o3 = "", s3 = false, a3 = false) {
      this.secure = t, this.namespace = n, this.webSocketOnly = r, this.nodeAdmin = i2, this.persistenceKey = o3, this.includeNamespaceInQueryParams = s3, this.isUsingEmulator = a3, this._host = e.toLowerCase(), this._domain = this._host.substr(this._host.indexOf(".") + 1), this.internalHost = p2.get("host:" + e) || this._host;
    }
    isCacheableHost() {
      return "s-" === this.internalHost.substr(0, 2);
    }
    isCustomHost() {
      return "firebaseio.com" !== this._domain && "firebaseio-demo.com" !== this._domain;
    }
    get host() {
      return this._host;
    }
    set host(e) {
      e !== this.internalHost && (this.internalHost = e, this.isCacheableHost() && p2.set("host:" + this._host, this.internalHost));
    }
    toString() {
      let e = this.toURLString();
      return this.persistenceKey && (e += "<" + this.persistenceKey + ">"), e;
    }
    toURLString() {
      const e = this.secure ? "https://" : "http://", t = this.includeNamespaceInQueryParams ? `?ns=${this.namespace}` : "";
      return `${e}${this.host}/${t}`;
    }
  };
  function repoInfoConnectionURL(e, t, n) {
    let r;
    if (assert("string" == typeof t, "typeof type must == string"), assert("object" == typeof n, "typeof params must == object"), "websocket" === t) r = (e.secure ? "wss://" : "ws://") + e.internalHost + "/.ws?";
    else {
      if ("long_polling" !== t) throw new Error("Unknown connection type: " + t);
      r = (e.secure ? "https://" : "http://") + e.internalHost + "/.lp?";
    }
    (function repoInfoNeedsQueryParam(e2) {
      return e2.host !== e2.internalHost || e2.isCustomHost() || e2.includeNamespaceInQueryParams;
    })(e) && (n.ns = e.namespace);
    const i2 = [];
    return each(n, ((e2, t2) => {
      i2.push(e2 + "=" + t2);
    })), r + i2.join("&");
  }
  var StatsCollection = class {
    constructor() {
      this.counters_ = {};
    }
    incrementCounter(e, t = 1) {
      contains(this.counters_, e) || (this.counters_[e] = 0), this.counters_[e] += t;
    }
    get() {
      return deepCopy(this.counters_);
    }
  };
  var E2 = {};
  var S2 = {};
  function statsManagerGetCollection(e) {
    const t = e.toString();
    return E2[t] || (E2[t] = new StatsCollection()), E2[t];
  }
  var PacketReceiver = class {
    constructor(e) {
      this.onMessage_ = e, this.pendingResponses = [], this.currentResponseNum = 0, this.closeAfterResponse = -1, this.onClose = null;
    }
    closeAfter(e, t) {
      this.closeAfterResponse = e, this.onClose = t, this.closeAfterResponse < this.currentResponseNum && (this.onClose(), this.onClose = null);
    }
    handleResponse(e, t) {
      for (this.pendingResponses[e] = t; this.pendingResponses[this.currentResponseNum]; ) {
        const e2 = this.pendingResponses[this.currentResponseNum];
        delete this.pendingResponses[this.currentResponseNum];
        for (let t2 = 0; t2 < e2.length; ++t2) e2[t2] && exceptionGuard((() => {
          this.onMessage_(e2[t2]);
        }));
        if (this.currentResponseNum === this.closeAfterResponse) {
          this.onClose && (this.onClose(), this.onClose = null);
          break;
        }
        this.currentResponseNum++;
      }
    }
  };
  var BrowserPollConnection = class _BrowserPollConnection {
    constructor(e, t, n, r, i2, o3, s3) {
      this.connId = e, this.repoInfo = t, this.applicationId = n, this.appCheckToken = r, this.authToken = i2, this.transportSessionId = o3, this.lastSessionId = s3, this.bytesSent = 0, this.bytesReceived = 0, this.everConnected_ = false, this.log_ = logWrapper(e), this.stats_ = statsManagerGetCollection(t), this.urlFn = (e2) => (this.appCheckToken && (e2.ac = this.appCheckToken), repoInfoConnectionURL(t, "long_polling", e2));
    }
    open(e, t) {
      this.curSegmentNum = 0, this.onDisconnect_ = t, this.myPacketOrderer = new PacketReceiver(e), this.isClosed_ = false, this.connectTimeoutTimer_ = setTimeout((() => {
        this.log_("Timed out trying to connect."), this.onClosed_(), this.connectTimeoutTimer_ = null;
      }), Math.floor(3e4)), (function(e2) {
        if ("complete" === document.readyState) e2();
        else {
          let t2 = false;
          const wrappedFn = function() {
            document.body ? t2 || (t2 = true, e2()) : setTimeout(wrappedFn, Math.floor(10));
          };
          document.addEventListener ? (document.addEventListener("DOMContentLoaded", wrappedFn, false), window.addEventListener("load", wrappedFn, false)) : document.attachEvent && (document.attachEvent("onreadystatechange", (() => {
            "complete" === document.readyState && wrappedFn();
          })), window.attachEvent("onload", wrappedFn));
        }
      })((() => {
        if (this.isClosed_) return;
        this.scriptTagHolder = new FirebaseIFrameScriptHolder(((...e3) => {
          const [t3, n, r, i2, o3] = e3;
          if (this.incrementIncomingBytes_(e3), this.scriptTagHolder) if (this.connectTimeoutTimer_ && (clearTimeout(this.connectTimeoutTimer_), this.connectTimeoutTimer_ = null), this.everConnected_ = true, "start" === t3) this.id = n, this.password = r;
          else {
            if ("close" !== t3) throw new Error("Unrecognized command received: " + t3);
            n ? (this.scriptTagHolder.sendNewPolls = false, this.myPacketOrderer.closeAfter(n, (() => {
              this.onClosed_();
            }))) : this.onClosed_();
          }
        }), ((...e3) => {
          const [t3, n] = e3;
          this.incrementIncomingBytes_(e3), this.myPacketOrderer.handleResponse(t3, n);
        }), (() => {
          this.onClosed_();
        }), this.urlFn);
        const e2 = { start: "t" };
        e2.ser = Math.floor(1e8 * Math.random()), this.scriptTagHolder.uniqueCallbackIdentifier && (e2.cb = this.scriptTagHolder.uniqueCallbackIdentifier), e2.v = "5", this.transportSessionId && (e2.s = this.transportSessionId), this.lastSessionId && (e2.ls = this.lastSessionId), this.applicationId && (e2.p = this.applicationId), this.appCheckToken && (e2.ac = this.appCheckToken), "undefined" != typeof location && location.hostname && T2.test(location.hostname) && (e2.r = "f");
        const t2 = this.urlFn(e2);
        this.log_("Connecting via long-poll to " + t2), this.scriptTagHolder.addTag(t2, (() => {
        }));
      }));
    }
    start() {
      this.scriptTagHolder.startLongPoll(this.id, this.password), this.addDisconnectPingFrame(this.id, this.password);
    }
    static forceAllow() {
      _BrowserPollConnection.forceAllow_ = true;
    }
    static forceDisallow() {
      _BrowserPollConnection.forceDisallow_ = true;
    }
    static isAvailable() {
      return !!_BrowserPollConnection.forceAllow_ || !(_BrowserPollConnection.forceDisallow_ || "undefined" == typeof document || null == document.createElement || "object" == typeof window && window.chrome && window.chrome.extension && !/^chrome/.test(window.location.href) || "object" == typeof Windows && "object" == typeof Windows.UI);
    }
    markConnectionHealthy() {
    }
    shutdown_() {
      this.isClosed_ = true, this.scriptTagHolder && (this.scriptTagHolder.close(), this.scriptTagHolder = null), this.myDisconnFrame && (document.body.removeChild(this.myDisconnFrame), this.myDisconnFrame = null), this.connectTimeoutTimer_ && (clearTimeout(this.connectTimeoutTimer_), this.connectTimeoutTimer_ = null);
    }
    onClosed_() {
      this.isClosed_ || (this.log_("Longpoll is closing itself"), this.shutdown_(), this.onDisconnect_ && (this.onDisconnect_(this.everConnected_), this.onDisconnect_ = null));
    }
    close() {
      this.isClosed_ || (this.log_("Longpoll is being closed."), this.shutdown_());
    }
    send(e) {
      const t = stringify(e);
      this.bytesSent += t.length, this.stats_.incrementCounter("bytes_sent", t.length);
      const n = base64Encode2(t), r = splitStringBySize(n, 1840);
      for (let e2 = 0; e2 < r.length; e2++) this.scriptTagHolder.enqueueSegment(this.curSegmentNum, r.length, r[e2]), this.curSegmentNum++;
    }
    addDisconnectPingFrame(e, t) {
      this.myDisconnFrame = document.createElement("iframe");
      const n = { dframe: "t" };
      n.id = e, n.pw = t, this.myDisconnFrame.src = this.urlFn(n), this.myDisconnFrame.style.display = "none", document.body.appendChild(this.myDisconnFrame);
    }
    incrementIncomingBytes_(e) {
      const t = stringify(e).length;
      this.bytesReceived += t, this.stats_.incrementCounter("bytes_received", t);
    }
  };
  var FirebaseIFrameScriptHolder = class _FirebaseIFrameScriptHolder {
    constructor(e, t, n, r) {
      this.onDisconnect = n, this.urlFn = r, this.outstandingRequests = /* @__PURE__ */ new Set(), this.pendingSegs = [], this.currentSerial = Math.floor(1e8 * Math.random()), this.sendNewPolls = true;
      {
        this.uniqueCallbackIdentifier = f2(), window["pLPCommand" + this.uniqueCallbackIdentifier] = e, window["pRTLPCB" + this.uniqueCallbackIdentifier] = t, this.myIFrame = _FirebaseIFrameScriptHolder.createIFrame_();
        let n2 = "";
        if (this.myIFrame.src && "javascript:" === this.myIFrame.src.substr(0, "javascript:".length)) {
          n2 = '<script>document.domain="' + document.domain + '";<\/script>';
        }
        const r2 = "<html><body>" + n2 + "</body></html>";
        try {
          this.myIFrame.doc.open(), this.myIFrame.doc.write(r2), this.myIFrame.doc.close();
        } catch (e2) {
          log("frame writing exception"), e2.stack && log(e2.stack), log(e2);
        }
      }
    }
    static createIFrame_() {
      const e = document.createElement("iframe");
      if (e.style.display = "none", !document.body) throw "Document body has not initialized. Wait to initialize Firebase until after the document is ready.";
      document.body.appendChild(e);
      try {
        e.contentWindow.document || log("No IE domain setting required");
      } catch (t) {
        const n = document.domain;
        e.src = "javascript:void((function(){document.open();document.domain='" + n + "';document.close();})())";
      }
      return e.contentDocument ? e.doc = e.contentDocument : e.contentWindow ? e.doc = e.contentWindow.document : e.document && (e.doc = e.document), e;
    }
    close() {
      this.alive = false, this.myIFrame && (this.myIFrame.doc.body.textContent = "", setTimeout((() => {
        null !== this.myIFrame && (document.body.removeChild(this.myIFrame), this.myIFrame = null);
      }), Math.floor(0)));
      const e = this.onDisconnect;
      e && (this.onDisconnect = null, e());
    }
    startLongPoll(e, t) {
      for (this.myID = e, this.myPW = t, this.alive = true; this.newRequest_(); ) ;
    }
    newRequest_() {
      if (this.alive && this.sendNewPolls && this.outstandingRequests.size < (this.pendingSegs.length > 0 ? 2 : 1)) {
        this.currentSerial++;
        const e = {};
        e.id = this.myID, e.pw = this.myPW, e.ser = this.currentSerial;
        let t = this.urlFn(e), n = "", r = 0;
        for (; this.pendingSegs.length > 0; ) {
          if (!(this.pendingSegs[0].d.length + 30 + n.length <= 1870)) break;
          {
            const e2 = this.pendingSegs.shift();
            n = n + "&seg" + r + "=" + e2.seg + "&ts" + r + "=" + e2.ts + "&d" + r + "=" + e2.d, r++;
          }
        }
        return t += n, this.addLongPollTag_(t, this.currentSerial), true;
      }
      return false;
    }
    enqueueSegment(e, t, n) {
      this.pendingSegs.push({ seg: e, ts: t, d: n }), this.alive && this.newRequest_();
    }
    addLongPollTag_(e, t) {
      this.outstandingRequests.add(t);
      const doNewRequest = () => {
        this.outstandingRequests.delete(t), this.newRequest_();
      }, n = setTimeout(doNewRequest, Math.floor(25e3));
      this.addTag(e, (() => {
        clearTimeout(n), doNewRequest();
      }));
    }
    addTag(e, t) {
      setTimeout((() => {
        try {
          if (!this.sendNewPolls) return;
          const n = this.myIFrame.doc.createElement("script");
          n.type = "text/javascript", n.async = true, n.src = e, n.onload = n.onreadystatechange = function() {
            const e2 = n.readyState;
            e2 && "loaded" !== e2 && "complete" !== e2 || (n.onload = n.onreadystatechange = null, n.parentNode && n.parentNode.removeChild(n), t());
          }, n.onerror = () => {
            log("Long-poll script failed to load: " + e), this.sendNewPolls = false, this.close();
          }, this.myIFrame.doc.body.appendChild(n);
        } catch (e2) {
        }
      }), Math.floor(1));
    }
  };
  var P2 = null;
  "undefined" != typeof MozWebSocket ? P2 = MozWebSocket : "undefined" != typeof WebSocket && (P2 = WebSocket);
  var WebSocketConnection = class _WebSocketConnection {
    constructor(e, t, n, r, i2, o3, s3) {
      this.connId = e, this.applicationId = n, this.appCheckToken = r, this.authToken = i2, this.keepaliveTimer = null, this.frames = null, this.totalFrames = 0, this.bytesSent = 0, this.bytesReceived = 0, this.log_ = logWrapper(this.connId), this.stats_ = statsManagerGetCollection(t), this.connURL = _WebSocketConnection.connectionURL_(t, o3, s3, r, n), this.nodeAdmin = t.nodeAdmin;
    }
    static connectionURL_(e, t, n, r, i2) {
      const o3 = { v: "5" };
      return "undefined" != typeof location && location.hostname && T2.test(location.hostname) && (o3.r = "f"), t && (o3.s = t), n && (o3.ls = n), r && (o3.ac = r), i2 && (o3.p = i2), repoInfoConnectionURL(e, "websocket", o3);
    }
    open(e, t) {
      this.onDisconnect = t, this.onMessage = e, this.log_("Websocket connecting to " + this.connURL), this.everConnected_ = false, p2.set("previous_websocket_failure", true);
      try {
        let e2;
        isNodeSdk(), this.mySock = new P2(this.connURL, [], e2);
      } catch (e2) {
        this.log_("Error instantiating WebSocket.");
        const t2 = e2.message || e2.data;
        return t2 && this.log_(t2), void this.onClosed_();
      }
      this.mySock.onopen = () => {
        this.log_("Websocket connected."), this.everConnected_ = true;
      }, this.mySock.onclose = () => {
        this.log_("Websocket connection was disconnected."), this.mySock = null, this.onClosed_();
      }, this.mySock.onmessage = (e2) => {
        this.handleIncomingFrame(e2);
      }, this.mySock.onerror = (e2) => {
        this.log_("WebSocket error.  Closing connection.");
        const t2 = e2.message || e2.data;
        t2 && this.log_(t2), this.onClosed_();
      };
    }
    start() {
    }
    static forceDisallow() {
      _WebSocketConnection.forceDisallow_ = true;
    }
    static isAvailable() {
      let e = false;
      if ("undefined" != typeof navigator && navigator.userAgent) {
        const t = /Android ([0-9]{0,}\.[0-9]{0,})/, n = navigator.userAgent.match(t);
        n && n.length > 1 && parseFloat(n[1]) < 4.4 && (e = true);
      }
      return !e && null !== P2 && !_WebSocketConnection.forceDisallow_;
    }
    static previouslyFailed() {
      return p2.isInMemoryStorage || true === p2.get("previous_websocket_failure");
    }
    markConnectionHealthy() {
      p2.remove("previous_websocket_failure");
    }
    appendFrame_(e) {
      if (this.frames.push(e), this.frames.length === this.totalFrames) {
        const e2 = this.frames.join("");
        this.frames = null;
        const t = jsonEval(e2);
        this.onMessage(t);
      }
    }
    handleNewFrameCount_(e) {
      this.totalFrames = e, this.frames = [];
    }
    extractFrameCount_(e) {
      if (assert(null === this.frames, "We already have a frame buffer"), e.length <= 6) {
        const t = Number(e);
        if (!isNaN(t)) return this.handleNewFrameCount_(t), null;
      }
      return this.handleNewFrameCount_(1), e;
    }
    handleIncomingFrame(e) {
      if (null === this.mySock) return;
      const t = e.data;
      if (this.bytesReceived += t.length, this.stats_.incrementCounter("bytes_received", t.length), this.resetKeepAlive(), null !== this.frames) this.appendFrame_(t);
      else {
        const e2 = this.extractFrameCount_(t);
        null !== e2 && this.appendFrame_(e2);
      }
    }
    send(e) {
      this.resetKeepAlive();
      const t = stringify(e);
      this.bytesSent += t.length, this.stats_.incrementCounter("bytes_sent", t.length);
      const n = splitStringBySize(t, 16384);
      n.length > 1 && this.sendString_(String(n.length));
      for (let e2 = 0; e2 < n.length; e2++) this.sendString_(n[e2]);
    }
    shutdown_() {
      this.isClosed_ = true, this.keepaliveTimer && (clearInterval(this.keepaliveTimer), this.keepaliveTimer = null), this.mySock && (this.mySock.close(), this.mySock = null);
    }
    onClosed_() {
      this.isClosed_ || (this.log_("WebSocket is closing itself"), this.shutdown_(), this.onDisconnect && (this.onDisconnect(this.everConnected_), this.onDisconnect = null));
    }
    close() {
      this.isClosed_ || (this.log_("WebSocket is being closed"), this.shutdown_());
    }
    resetKeepAlive() {
      clearInterval(this.keepaliveTimer), this.keepaliveTimer = setInterval((() => {
        this.mySock && this.sendString_("0"), this.resetKeepAlive();
      }), Math.floor(45e3));
    }
    sendString_(e) {
      try {
        this.mySock.send(e);
      } catch (e2) {
        this.log_("Exception thrown from WebSocket.send():", e2.message || e2.data, "Closing connection."), setTimeout(this.onClosed_.bind(this), 0);
      }
    }
  };
  WebSocketConnection.responsesRequiredToBeHealthy = 2, WebSocketConnection.healthyTimeout = 3e4;
  var TransportManager = class _TransportManager {
    static get ALL_TRANSPORTS() {
      return [BrowserPollConnection, WebSocketConnection];
    }
    static get IS_TRANSPORT_INITIALIZED() {
      return this.globalTransportInitialized_;
    }
    constructor(e) {
      this.initTransports_(e);
    }
    initTransports_(e) {
      const t = WebSocketConnection && WebSocketConnection.isAvailable();
      let n = t && !WebSocketConnection.previouslyFailed();
      if (e.webSocketOnly && (t || warn("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."), n = true), n) this.transports_ = [WebSocketConnection];
      else {
        const e2 = this.transports_ = [];
        for (const t2 of _TransportManager.ALL_TRANSPORTS) t2 && t2.isAvailable() && e2.push(t2);
        _TransportManager.globalTransportInitialized_ = true;
      }
    }
    initialTransport() {
      if (this.transports_.length > 0) return this.transports_[0];
      throw new Error("No transports available");
    }
    upgradeTransport() {
      return this.transports_.length > 1 ? this.transports_[1] : null;
    }
  };
  TransportManager.globalTransportInitialized_ = false;
  var Connection = class {
    constructor(e, t, n, r, i2, o3, s3, a3, l3, h3) {
      this.id = e, this.repoInfo_ = t, this.applicationId_ = n, this.appCheckToken_ = r, this.authToken_ = i2, this.onMessage_ = o3, this.onReady_ = s3, this.onDisconnect_ = a3, this.onKill_ = l3, this.lastSessionId = h3, this.connectionCount = 0, this.pendingDataMessages = [], this.state_ = 0, this.log_ = logWrapper("c:" + this.id + ":"), this.transportManager_ = new TransportManager(t), this.log_("Connection created"), this.start_();
    }
    start_() {
      const e = this.transportManager_.initialTransport();
      this.conn_ = new e(this.nextTransportId_(), this.repoInfo_, this.applicationId_, this.appCheckToken_, this.authToken_, null, this.lastSessionId), this.primaryResponsesRequired_ = e.responsesRequiredToBeHealthy || 0;
      const t = this.connReceiver_(this.conn_), n = this.disconnReceiver_(this.conn_);
      this.tx_ = this.conn_, this.rx_ = this.conn_, this.secondaryConn_ = null, this.isHealthy_ = false, setTimeout((() => {
        this.conn_ && this.conn_.open(t, n);
      }), Math.floor(0));
      const r = e.healthyTimeout || 0;
      r > 0 && (this.healthyTimeout_ = setTimeoutNonBlocking((() => {
        this.healthyTimeout_ = null, this.isHealthy_ || (this.conn_ && this.conn_.bytesReceived > 102400 ? (this.log_("Connection exceeded healthy timeout but has received " + this.conn_.bytesReceived + " bytes.  Marking connection healthy."), this.isHealthy_ = true, this.conn_.markConnectionHealthy()) : this.conn_ && this.conn_.bytesSent > 10240 ? this.log_("Connection exceeded healthy timeout but has sent " + this.conn_.bytesSent + " bytes.  Leaving connection alive.") : (this.log_("Closing unhealthy connection after timeout."), this.close()));
      }), Math.floor(r)));
    }
    nextTransportId_() {
      return "c:" + this.id + ":" + this.connectionCount++;
    }
    disconnReceiver_(e) {
      return (t) => {
        e === this.conn_ ? this.onConnectionLost_(t) : e === this.secondaryConn_ ? (this.log_("Secondary connection lost."), this.onSecondaryConnectionLost_()) : this.log_("closing an old connection");
      };
    }
    connReceiver_(e) {
      return (t) => {
        2 !== this.state_ && (e === this.rx_ ? this.onPrimaryMessageReceived_(t) : e === this.secondaryConn_ ? this.onSecondaryMessageReceived_(t) : this.log_("message on old connection"));
      };
    }
    sendRequest(e) {
      const t = { t: "d", d: e };
      this.sendData_(t);
    }
    tryCleanupConnection() {
      this.tx_ === this.secondaryConn_ && this.rx_ === this.secondaryConn_ && (this.log_("cleaning up and promoting a connection: " + this.secondaryConn_.connId), this.conn_ = this.secondaryConn_, this.secondaryConn_ = null);
    }
    onSecondaryControl_(e) {
      if ("t" in e) {
        const t = e.t;
        "a" === t ? this.upgradeIfSecondaryHealthy_() : "r" === t ? (this.log_("Got a reset on secondary, closing it"), this.secondaryConn_.close(), this.tx_ !== this.secondaryConn_ && this.rx_ !== this.secondaryConn_ || this.close()) : "o" === t && (this.log_("got pong on secondary."), this.secondaryResponsesRequired_--, this.upgradeIfSecondaryHealthy_());
      }
    }
    onSecondaryMessageReceived_(e) {
      const t = requireKey("t", e), n = requireKey("d", e);
      if ("c" === t) this.onSecondaryControl_(n);
      else {
        if ("d" !== t) throw new Error("Unknown protocol layer: " + t);
        this.pendingDataMessages.push(n);
      }
    }
    upgradeIfSecondaryHealthy_() {
      this.secondaryResponsesRequired_ <= 0 ? (this.log_("Secondary connection is healthy."), this.isHealthy_ = true, this.secondaryConn_.markConnectionHealthy(), this.proceedWithUpgrade_()) : (this.log_("sending ping on secondary."), this.secondaryConn_.send({ t: "c", d: { t: "p", d: {} } }));
    }
    proceedWithUpgrade_() {
      this.secondaryConn_.start(), this.log_("sending client ack on secondary"), this.secondaryConn_.send({ t: "c", d: { t: "a", d: {} } }), this.log_("Ending transmission on primary"), this.conn_.send({ t: "c", d: { t: "n", d: {} } }), this.tx_ = this.secondaryConn_, this.tryCleanupConnection();
    }
    onPrimaryMessageReceived_(e) {
      const t = requireKey("t", e), n = requireKey("d", e);
      "c" === t ? this.onControl_(n) : "d" === t && this.onDataMessage_(n);
    }
    onDataMessage_(e) {
      this.onPrimaryResponse_(), this.onMessage_(e);
    }
    onPrimaryResponse_() {
      this.isHealthy_ || (this.primaryResponsesRequired_--, this.primaryResponsesRequired_ <= 0 && (this.log_("Primary connection is healthy."), this.isHealthy_ = true, this.conn_.markConnectionHealthy()));
    }
    onControl_(e) {
      const t = requireKey("t", e);
      if ("d" in e) {
        const n = e.d;
        if ("h" === t) {
          const e2 = Object.assign({}, n);
          this.repoInfo_.isUsingEmulator && (e2.h = this.repoInfo_.host), this.onHandshake_(e2);
        } else if ("n" === t) {
          this.log_("recvd end transmission on primary"), this.rx_ = this.secondaryConn_;
          for (let e2 = 0; e2 < this.pendingDataMessages.length; ++e2) this.onDataMessage_(this.pendingDataMessages[e2]);
          this.pendingDataMessages = [], this.tryCleanupConnection();
        } else "s" === t ? this.onConnectionShutdown_(n) : "r" === t ? this.onReset_(n) : "e" === t ? error("Server Error: " + n) : "o" === t ? (this.log_("got pong on primary."), this.onPrimaryResponse_(), this.sendPingOnPrimaryIfNecessary_()) : error("Unknown control packet command: " + t);
      }
    }
    onHandshake_(e) {
      const t = e.ts, n = e.v, r = e.h;
      this.sessionId = e.s, this.repoInfo_.host = r, 0 === this.state_ && (this.conn_.start(), this.onConnectionEstablished_(this.conn_, t), "5" !== n && warn("Protocol version mismatch detected"), this.tryStartUpgrade_());
    }
    tryStartUpgrade_() {
      const e = this.transportManager_.upgradeTransport();
      e && this.startUpgrade_(e);
    }
    startUpgrade_(e) {
      this.secondaryConn_ = new e(this.nextTransportId_(), this.repoInfo_, this.applicationId_, this.appCheckToken_, this.authToken_, this.sessionId), this.secondaryResponsesRequired_ = e.responsesRequiredToBeHealthy || 0;
      const t = this.connReceiver_(this.secondaryConn_), n = this.disconnReceiver_(this.secondaryConn_);
      this.secondaryConn_.open(t, n), setTimeoutNonBlocking((() => {
        this.secondaryConn_ && (this.log_("Timed out trying to upgrade."), this.secondaryConn_.close());
      }), Math.floor(6e4));
    }
    onReset_(e) {
      this.log_("Reset packet received.  New host: " + e), this.repoInfo_.host = e, 1 === this.state_ ? this.close() : (this.closeConnections_(), this.start_());
    }
    onConnectionEstablished_(e, t) {
      this.log_("Realtime connection established."), this.conn_ = e, this.state_ = 1, this.onReady_ && (this.onReady_(t, this.sessionId), this.onReady_ = null), 0 === this.primaryResponsesRequired_ ? (this.log_("Primary connection is healthy."), this.isHealthy_ = true) : setTimeoutNonBlocking((() => {
        this.sendPingOnPrimaryIfNecessary_();
      }), Math.floor(5e3));
    }
    sendPingOnPrimaryIfNecessary_() {
      this.isHealthy_ || 1 !== this.state_ || (this.log_("sending ping on primary."), this.sendData_({ t: "c", d: { t: "p", d: {} } }));
    }
    onSecondaryConnectionLost_() {
      const e = this.secondaryConn_;
      this.secondaryConn_ = null, this.tx_ !== e && this.rx_ !== e || this.close();
    }
    onConnectionLost_(e) {
      this.conn_ = null, e || 0 !== this.state_ ? 1 === this.state_ && this.log_("Realtime connection lost.") : (this.log_("Realtime connection failed."), this.repoInfo_.isCacheableHost() && (p2.remove("host:" + this.repoInfo_.host), this.repoInfo_.internalHost = this.repoInfo_.host)), this.close();
    }
    onConnectionShutdown_(e) {
      this.log_("Connection shutdown command received. Shutting down..."), this.onKill_ && (this.onKill_(e), this.onKill_ = null), this.onDisconnect_ = null, this.close();
    }
    sendData_(e) {
      if (1 !== this.state_) throw "Connection is not connected";
      this.tx_.send(e);
    }
    close() {
      2 !== this.state_ && (this.log_("Closing realtime connection."), this.state_ = 2, this.closeConnections_(), this.onDisconnect_ && (this.onDisconnect_(), this.onDisconnect_ = null));
    }
    closeConnections_() {
      this.log_("Shutting down all connections"), this.conn_ && (this.conn_.close(), this.conn_ = null), this.secondaryConn_ && (this.secondaryConn_.close(), this.secondaryConn_ = null), this.healthyTimeout_ && (clearTimeout(this.healthyTimeout_), this.healthyTimeout_ = null);
    }
  };
  var ServerActions = class {
    put(e, t, n, r) {
    }
    merge(e, t, n, r) {
    }
    refreshAuthToken(e) {
    }
    refreshAppCheckToken(e) {
    }
    onDisconnectPut(e, t, n) {
    }
    onDisconnectMerge(e, t, n) {
    }
    onDisconnectCancel(e, t) {
    }
    reportStats(e) {
    }
  };
  var EventEmitter = class {
    constructor(e) {
      this.allowedEvents_ = e, this.listeners_ = {}, assert(Array.isArray(e) && e.length > 0, "Requires a non-empty array");
    }
    trigger(e, ...t) {
      if (Array.isArray(this.listeners_[e])) {
        const n = [...this.listeners_[e]];
        for (let e2 = 0; e2 < n.length; e2++) n[e2].callback.apply(n[e2].context, t);
      }
    }
    on(e, t, n) {
      this.validateEventType_(e), this.listeners_[e] = this.listeners_[e] || [], this.listeners_[e].push({ callback: t, context: n });
      const r = this.getInitialEvent(e);
      r && t.apply(n, r);
    }
    off(e, t, n) {
      this.validateEventType_(e);
      const r = this.listeners_[e] || [];
      for (let e2 = 0; e2 < r.length; e2++) if (r[e2].callback === t && (!n || n === r[e2].context)) return void r.splice(e2, 1);
    }
    validateEventType_(e) {
      assert(this.allowedEvents_.find(((t) => t === e)), "Unknown event: " + e);
    }
  };
  var OnlineMonitor = class _OnlineMonitor extends EventEmitter {
    static getInstance() {
      return new _OnlineMonitor();
    }
    constructor() {
      super(["online"]), this.online_ = true, "undefined" == typeof window || void 0 === window.addEventListener || isMobileCordova() || (window.addEventListener("online", (() => {
        this.online_ || (this.online_ = true, this.trigger("online", true));
      }), false), window.addEventListener("offline", (() => {
        this.online_ && (this.online_ = false, this.trigger("online", false));
      }), false));
    }
    getInitialEvent(e) {
      return assert("online" === e, "Unknown event type: " + e), [this.online_];
    }
    currentlyOnline() {
      return this.online_;
    }
  };
  var Path = class {
    constructor(e, t) {
      if (void 0 === t) {
        this.pieces_ = e.split("/");
        let t2 = 0;
        for (let e2 = 0; e2 < this.pieces_.length; e2++) this.pieces_[e2].length > 0 && (this.pieces_[t2] = this.pieces_[e2], t2++);
        this.pieces_.length = t2, this.pieceNum_ = 0;
      } else this.pieces_ = e, this.pieceNum_ = t;
    }
    toString() {
      let e = "";
      for (let t = this.pieceNum_; t < this.pieces_.length; t++) "" !== this.pieces_[t] && (e += "/" + this.pieces_[t]);
      return e || "/";
    }
  };
  function newEmptyPath() {
    return new Path("");
  }
  function pathGetFront(e) {
    return e.pieceNum_ >= e.pieces_.length ? null : e.pieces_[e.pieceNum_];
  }
  function pathGetLength(e) {
    return e.pieces_.length - e.pieceNum_;
  }
  function pathPopFront(e) {
    let t = e.pieceNum_;
    return t < e.pieces_.length && t++, new Path(e.pieces_, t);
  }
  function pathGetBack(e) {
    return e.pieceNum_ < e.pieces_.length ? e.pieces_[e.pieces_.length - 1] : null;
  }
  function pathSlice(e, t = 0) {
    return e.pieces_.slice(e.pieceNum_ + t);
  }
  function pathParent(e) {
    if (e.pieceNum_ >= e.pieces_.length) return null;
    const t = [];
    for (let n = e.pieceNum_; n < e.pieces_.length - 1; n++) t.push(e.pieces_[n]);
    return new Path(t, 0);
  }
  function pathChild(e, t) {
    const n = [];
    for (let t2 = e.pieceNum_; t2 < e.pieces_.length; t2++) n.push(e.pieces_[t2]);
    if (t instanceof Path) for (let e2 = t.pieceNum_; e2 < t.pieces_.length; e2++) n.push(t.pieces_[e2]);
    else {
      const e2 = t.split("/");
      for (let t2 = 0; t2 < e2.length; t2++) e2[t2].length > 0 && n.push(e2[t2]);
    }
    return new Path(n, 0);
  }
  function pathIsEmpty(e) {
    return e.pieceNum_ >= e.pieces_.length;
  }
  function newRelativePath(e, t) {
    const n = pathGetFront(e), r = pathGetFront(t);
    if (null === n) return t;
    if (n === r) return newRelativePath(pathPopFront(e), pathPopFront(t));
    throw new Error("INTERNAL ERROR: innerPath (" + t + ") is not within outerPath (" + e + ")");
  }
  function pathCompare(e, t) {
    const n = pathSlice(e, 0), r = pathSlice(t, 0);
    for (let e2 = 0; e2 < n.length && e2 < r.length; e2++) {
      const t2 = nameCompare(n[e2], r[e2]);
      if (0 !== t2) return t2;
    }
    return n.length === r.length ? 0 : n.length < r.length ? -1 : 1;
  }
  function pathEquals(e, t) {
    if (pathGetLength(e) !== pathGetLength(t)) return false;
    for (let n = e.pieceNum_, r = t.pieceNum_; n <= e.pieces_.length; n++, r++) if (e.pieces_[n] !== t.pieces_[r]) return false;
    return true;
  }
  function pathContains(e, t) {
    let n = e.pieceNum_, r = t.pieceNum_;
    if (pathGetLength(e) > pathGetLength(t)) return false;
    for (; n < e.pieces_.length; ) {
      if (e.pieces_[n] !== t.pieces_[r]) return false;
      ++n, ++r;
    }
    return true;
  }
  var ValidationPath = class {
    constructor(e, t) {
      this.errorPrefix_ = t, this.parts_ = pathSlice(e, 0), this.byteLength_ = Math.max(1, this.parts_.length);
      for (let e2 = 0; e2 < this.parts_.length; e2++) this.byteLength_ += stringLength(this.parts_[e2]);
      validationPathCheckValid(this);
    }
  };
  function validationPathCheckValid(e) {
    if (e.byteLength_ > 768) throw new Error(e.errorPrefix_ + "has a key path longer than 768 bytes (" + e.byteLength_ + ").");
    if (e.parts_.length > 32) throw new Error(e.errorPrefix_ + "path specified exceeds the maximum depth that can be written (32) or object contains a cycle " + validationPathToErrorString(e));
  }
  function validationPathToErrorString(e) {
    return 0 === e.parts_.length ? "" : "in property '" + e.parts_.join(".") + "'";
  }
  var VisibilityMonitor = class _VisibilityMonitor extends EventEmitter {
    static getInstance() {
      return new _VisibilityMonitor();
    }
    constructor() {
      let e, t;
      super(["visible"]), "undefined" != typeof document && void 0 !== document.addEventListener && (void 0 !== document.hidden ? (t = "visibilitychange", e = "hidden") : void 0 !== document.mozHidden ? (t = "mozvisibilitychange", e = "mozHidden") : void 0 !== document.msHidden ? (t = "msvisibilitychange", e = "msHidden") : void 0 !== document.webkitHidden && (t = "webkitvisibilitychange", e = "webkitHidden")), this.visible_ = true, t && document.addEventListener(t, (() => {
        const t2 = !document[e];
        t2 !== this.visible_ && (this.visible_ = t2, this.trigger("visible", t2));
      }), false);
    }
    getInitialEvent(e) {
      return assert("visible" === e, "Unknown event type: " + e), [this.visible_];
    }
  };
  var PersistentConnection = class _PersistentConnection extends ServerActions {
    constructor(e, t, n, r, i2, o3, s3, a3) {
      if (super(), this.repoInfo_ = e, this.applicationId_ = t, this.onDataUpdate_ = n, this.onConnectStatus_ = r, this.onServerInfoUpdate_ = i2, this.authTokenProvider_ = o3, this.appCheckTokenProvider_ = s3, this.authOverride_ = a3, this.id = _PersistentConnection.nextPersistentConnectionId_++, this.log_ = logWrapper("p:" + this.id + ":"), this.interruptReasons_ = {}, this.listens = /* @__PURE__ */ new Map(), this.outstandingPuts_ = [], this.outstandingGets_ = [], this.outstandingPutCount_ = 0, this.outstandingGetCount_ = 0, this.onDisconnectRequestQueue_ = [], this.connected_ = false, this.reconnectDelay_ = 1e3, this.maxReconnectDelay_ = 3e5, this.securityDebugCallback_ = null, this.lastSessionId = null, this.establishConnectionTimer_ = null, this.visible_ = false, this.requestCBHash_ = {}, this.requestNumber_ = 0, this.realtime_ = null, this.authToken_ = null, this.appCheckToken_ = null, this.forceTokenRefresh_ = false, this.invalidAuthTokenCount_ = 0, this.invalidAppCheckTokenCount_ = 0, this.firstConnection_ = true, this.lastConnectionAttemptTime_ = null, this.lastConnectionEstablishedTime_ = null, a3 && !isNodeSdk()) throw new Error("Auth override specified in options, but not supported on non Node.js platforms");
      VisibilityMonitor.getInstance().on("visible", this.onVisible_, this), -1 === e.host.indexOf("fblocal") && OnlineMonitor.getInstance().on("online", this.onOnline_, this);
    }
    sendRequest(e, t, n) {
      const r = ++this.requestNumber_, i2 = { r, a: e, b: t };
      this.log_(stringify(i2)), assert(this.connected_, "sendRequest call when we're not connected not allowed."), this.realtime_.sendRequest(i2), n && (this.requestCBHash_[r] = n);
    }
    get(e) {
      this.initConnection_();
      const t = new Deferred2(), n = { action: "g", request: { p: e._path.toString(), q: e._queryObject }, onComplete: (e2) => {
        const n2 = e2.d;
        "ok" === e2.s ? t.resolve(n2) : t.reject(n2);
      } };
      this.outstandingGets_.push(n), this.outstandingGetCount_++;
      const r = this.outstandingGets_.length - 1;
      return this.connected_ && this.sendGet_(r), t.promise;
    }
    listen(e, t, n, r) {
      this.initConnection_();
      const i2 = e._queryIdentifier, o3 = e._path.toString();
      this.log_("Listen called for " + o3 + " " + i2), this.listens.has(o3) || this.listens.set(o3, /* @__PURE__ */ new Map()), assert(e._queryParams.isDefault() || !e._queryParams.loadsAllData(), "listen() called for non-default but complete query"), assert(!this.listens.get(o3).has(i2), "listen() called twice for same path/queryId.");
      const s3 = { onComplete: r, hashFn: t, query: e, tag: n };
      this.listens.get(o3).set(i2, s3), this.connected_ && this.sendListen_(s3);
    }
    sendGet_(e) {
      const t = this.outstandingGets_[e];
      this.sendRequest("g", t.request, ((n) => {
        delete this.outstandingGets_[e], this.outstandingGetCount_--, 0 === this.outstandingGetCount_ && (this.outstandingGets_ = []), t.onComplete && t.onComplete(n);
      }));
    }
    sendListen_(e) {
      const t = e.query, n = t._path.toString(), r = t._queryIdentifier;
      this.log_("Listen on " + n + " for " + r);
      const i2 = { p: n };
      e.tag && (i2.q = t._queryObject, i2.t = e.tag), i2.h = e.hashFn(), this.sendRequest("q", i2, ((i3) => {
        const o3 = i3.d, s3 = i3.s;
        _PersistentConnection.warnOnListenWarnings_(o3, t);
        (this.listens.get(n) && this.listens.get(n).get(r)) === e && (this.log_("listen response", i3), "ok" !== s3 && this.removeListen_(n, r), e.onComplete && e.onComplete(s3, o3));
      }));
    }
    static warnOnListenWarnings_(e, t) {
      if (e && "object" == typeof e && contains(e, "w")) {
        const n = safeGet(e, "w");
        if (Array.isArray(n) && ~n.indexOf("no_index")) {
          const e2 = '".indexOn": "' + t._queryParams.getIndex().toString() + '"', n2 = t._path.toString();
          warn(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${e2} at ${n2} to your security rules for better performance.`);
        }
      }
    }
    refreshAuthToken(e) {
      this.authToken_ = e, this.log_("Auth token refreshed"), this.authToken_ ? this.tryAuth() : this.connected_ && this.sendRequest("unauth", {}, (() => {
      })), this.reduceReconnectDelayIfAdminCredential_(e);
    }
    reduceReconnectDelayIfAdminCredential_(e) {
      (e && 40 === e.length || (function(e2) {
        const t = decode(e2).claims;
        return "object" == typeof t && true === t.admin;
      })(e)) && (this.log_("Admin auth credential detected.  Reducing max reconnect time."), this.maxReconnectDelay_ = 3e4);
    }
    refreshAppCheckToken(e) {
      this.appCheckToken_ = e, this.log_("App check token refreshed"), this.appCheckToken_ ? this.tryAppCheck() : this.connected_ && this.sendRequest("unappeck", {}, (() => {
      }));
    }
    tryAuth() {
      if (this.connected_ && this.authToken_) {
        const e = this.authToken_, t = (function(e2) {
          const t2 = decode(e2).claims;
          return !!t2 && "object" == typeof t2 && t2.hasOwnProperty("iat");
        })(e) ? "auth" : "gauth", n = { cred: e };
        null === this.authOverride_ ? n.noauth = true : "object" == typeof this.authOverride_ && (n.authvar = this.authOverride_), this.sendRequest(t, n, ((t2) => {
          const n2 = t2.s, r = t2.d || "error";
          this.authToken_ === e && ("ok" === n2 ? this.invalidAuthTokenCount_ = 0 : this.onAuthRevoked_(n2, r));
        }));
      }
    }
    tryAppCheck() {
      this.connected_ && this.appCheckToken_ && this.sendRequest("appcheck", { token: this.appCheckToken_ }, ((e) => {
        const t = e.s, n = e.d || "error";
        "ok" === t ? this.invalidAppCheckTokenCount_ = 0 : this.onAppCheckRevoked_(t, n);
      }));
    }
    unlisten(e, t) {
      const n = e._path.toString(), r = e._queryIdentifier;
      this.log_("Unlisten called for " + n + " " + r), assert(e._queryParams.isDefault() || !e._queryParams.loadsAllData(), "unlisten() called for non-default but complete query");
      this.removeListen_(n, r) && this.connected_ && this.sendUnlisten_(n, r, e._queryObject, t);
    }
    sendUnlisten_(e, t, n, r) {
      this.log_("Unlisten on " + e + " for " + t);
      const i2 = { p: e };
      r && (i2.q = n, i2.t = r), this.sendRequest("n", i2);
    }
    onDisconnectPut(e, t, n) {
      this.initConnection_(), this.connected_ ? this.sendOnDisconnect_("o", e, t, n) : this.onDisconnectRequestQueue_.push({ pathString: e, action: "o", data: t, onComplete: n });
    }
    onDisconnectMerge(e, t, n) {
      this.initConnection_(), this.connected_ ? this.sendOnDisconnect_("om", e, t, n) : this.onDisconnectRequestQueue_.push({ pathString: e, action: "om", data: t, onComplete: n });
    }
    onDisconnectCancel(e, t) {
      this.initConnection_(), this.connected_ ? this.sendOnDisconnect_("oc", e, null, t) : this.onDisconnectRequestQueue_.push({ pathString: e, action: "oc", data: null, onComplete: t });
    }
    sendOnDisconnect_(e, t, n, r) {
      const i2 = { p: t, d: n };
      this.log_("onDisconnect " + e, i2), this.sendRequest(e, i2, ((e2) => {
        r && setTimeout((() => {
          r(e2.s, e2.d);
        }), Math.floor(0));
      }));
    }
    put(e, t, n, r) {
      this.putInternal("p", e, t, n, r);
    }
    merge(e, t, n, r) {
      this.putInternal("m", e, t, n, r);
    }
    putInternal(e, t, n, r, i2) {
      this.initConnection_();
      const o3 = { p: t, d: n };
      void 0 !== i2 && (o3.h = i2), this.outstandingPuts_.push({ action: e, request: o3, onComplete: r }), this.outstandingPutCount_++;
      const s3 = this.outstandingPuts_.length - 1;
      this.connected_ ? this.sendPut_(s3) : this.log_("Buffering put: " + t);
    }
    sendPut_(e) {
      const t = this.outstandingPuts_[e].action, n = this.outstandingPuts_[e].request, r = this.outstandingPuts_[e].onComplete;
      this.outstandingPuts_[e].queued = this.connected_, this.sendRequest(t, n, ((n2) => {
        this.log_(t + " response", n2), delete this.outstandingPuts_[e], this.outstandingPutCount_--, 0 === this.outstandingPutCount_ && (this.outstandingPuts_ = []), r && r(n2.s, n2.d);
      }));
    }
    reportStats(e) {
      if (this.connected_) {
        const t = { c: e };
        this.log_("reportStats", t), this.sendRequest("s", t, ((e2) => {
          if ("ok" !== e2.s) {
            const t2 = e2.d;
            this.log_("reportStats", "Error sending stats: " + t2);
          }
        }));
      }
    }
    onDataMessage_(e) {
      if ("r" in e) {
        this.log_("from server: " + stringify(e));
        const t = e.r, n = this.requestCBHash_[t];
        n && (delete this.requestCBHash_[t], n(e.b));
      } else {
        if ("error" in e) throw "A server-side error has occurred: " + e.error;
        "a" in e && this.onDataPush_(e.a, e.b);
      }
    }
    onDataPush_(e, t) {
      this.log_("handleServerMessage", e, t), "d" === e ? this.onDataUpdate_(t.p, t.d, false, t.t) : "m" === e ? this.onDataUpdate_(t.p, t.d, true, t.t) : "c" === e ? this.onListenRevoked_(t.p, t.q) : "ac" === e ? this.onAuthRevoked_(t.s, t.d) : "apc" === e ? this.onAppCheckRevoked_(t.s, t.d) : "sd" === e ? this.onSecurityDebugPacket_(t) : error("Unrecognized action received from server: " + stringify(e) + "\nAre you using the latest client?");
    }
    onReady_(e, t) {
      this.log_("connection ready"), this.connected_ = true, this.lastConnectionEstablishedTime_ = (/* @__PURE__ */ new Date()).getTime(), this.handleTimestamp_(e), this.lastSessionId = t, this.firstConnection_ && this.sendConnectStats_(), this.restoreState_(), this.firstConnection_ = false, this.onConnectStatus_(true);
    }
    scheduleConnect_(e) {
      assert(!this.realtime_, "Scheduling a connect when we're already connected/ing?"), this.establishConnectionTimer_ && clearTimeout(this.establishConnectionTimer_), this.establishConnectionTimer_ = setTimeout((() => {
        this.establishConnectionTimer_ = null, this.establishConnection_();
      }), Math.floor(e));
    }
    initConnection_() {
      !this.realtime_ && this.firstConnection_ && this.scheduleConnect_(0);
    }
    onVisible_(e) {
      e && !this.visible_ && this.reconnectDelay_ === this.maxReconnectDelay_ && (this.log_("Window became visible.  Reducing delay."), this.reconnectDelay_ = 1e3, this.realtime_ || this.scheduleConnect_(0)), this.visible_ = e;
    }
    onOnline_(e) {
      e ? (this.log_("Browser went online."), this.reconnectDelay_ = 1e3, this.realtime_ || this.scheduleConnect_(0)) : (this.log_("Browser went offline.  Killing connection."), this.realtime_ && this.realtime_.close());
    }
    onRealtimeDisconnect_() {
      if (this.log_("data client disconnected"), this.connected_ = false, this.realtime_ = null, this.cancelSentTransactions_(), this.requestCBHash_ = {}, this.shouldReconnect_()) {
        if (this.visible_) {
          if (this.lastConnectionEstablishedTime_) {
            (/* @__PURE__ */ new Date()).getTime() - this.lastConnectionEstablishedTime_ > 3e4 && (this.reconnectDelay_ = 1e3), this.lastConnectionEstablishedTime_ = null;
          }
        } else this.log_("Window isn't visible.  Delaying reconnect."), this.reconnectDelay_ = this.maxReconnectDelay_, this.lastConnectionAttemptTime_ = (/* @__PURE__ */ new Date()).getTime();
        const e = (/* @__PURE__ */ new Date()).getTime() - this.lastConnectionAttemptTime_;
        let t = Math.max(0, this.reconnectDelay_ - e);
        t = Math.random() * t, this.log_("Trying to reconnect in " + t + "ms"), this.scheduleConnect_(t), this.reconnectDelay_ = Math.min(this.maxReconnectDelay_, 1.3 * this.reconnectDelay_);
      }
      this.onConnectStatus_(false);
    }
    async establishConnection_() {
      if (this.shouldReconnect_()) {
        this.log_("Making a connection attempt"), this.lastConnectionAttemptTime_ = (/* @__PURE__ */ new Date()).getTime(), this.lastConnectionEstablishedTime_ = null;
        const e = this.onDataMessage_.bind(this), t = this.onReady_.bind(this), n = this.onRealtimeDisconnect_.bind(this), r = this.id + ":" + _PersistentConnection.nextConnectionId_++, i2 = this.lastSessionId;
        let o3 = false, s3 = null;
        const closeFn = function() {
          s3 ? s3.close() : (o3 = true, n());
        }, sendRequestFn = function(e2) {
          assert(s3, "sendRequest call when we're not connected not allowed."), s3.sendRequest(e2);
        };
        this.realtime_ = { close: closeFn, sendRequest: sendRequestFn };
        const a3 = this.forceTokenRefresh_;
        this.forceTokenRefresh_ = false;
        try {
          const [l3, h3] = await Promise.all([this.authTokenProvider_.getToken(a3), this.appCheckTokenProvider_.getToken(a3)]);
          o3 ? log("getToken() completed but was canceled") : (log("getToken() completed. Creating connection."), this.authToken_ = l3 && l3.accessToken, this.appCheckToken_ = h3 && h3.token, s3 = new Connection(r, this.repoInfo_, this.applicationId_, this.appCheckToken_, this.authToken_, e, t, n, ((e2) => {
            warn(e2 + " (" + this.repoInfo_.toString() + ")"), this.interrupt("server_kill");
          }), i2));
        } catch (e2) {
          this.log_("Failed to get token: " + e2), o3 || (this.repoInfo_.nodeAdmin && warn(e2), closeFn());
        }
      }
    }
    interrupt(e) {
      log("Interrupting connection for reason: " + e), this.interruptReasons_[e] = true, this.realtime_ ? this.realtime_.close() : (this.establishConnectionTimer_ && (clearTimeout(this.establishConnectionTimer_), this.establishConnectionTimer_ = null), this.connected_ && this.onRealtimeDisconnect_());
    }
    resume(e) {
      log("Resuming connection for reason: " + e), delete this.interruptReasons_[e], isEmpty(this.interruptReasons_) && (this.reconnectDelay_ = 1e3, this.realtime_ || this.scheduleConnect_(0));
    }
    handleTimestamp_(e) {
      const t = e - (/* @__PURE__ */ new Date()).getTime();
      this.onServerInfoUpdate_({ serverTimeOffset: t });
    }
    cancelSentTransactions_() {
      for (let e = 0; e < this.outstandingPuts_.length; e++) {
        const t = this.outstandingPuts_[e];
        t && "h" in t.request && t.queued && (t.onComplete && t.onComplete("disconnect"), delete this.outstandingPuts_[e], this.outstandingPutCount_--);
      }
      0 === this.outstandingPutCount_ && (this.outstandingPuts_ = []);
    }
    onListenRevoked_(e, t) {
      let n;
      n = t ? t.map(((e2) => ObjectToUniqueKey(e2))).join("$") : "default";
      const r = this.removeListen_(e, n);
      r && r.onComplete && r.onComplete("permission_denied");
    }
    removeListen_(e, t) {
      const n = new Path(e).toString();
      let r;
      if (this.listens.has(n)) {
        const e2 = this.listens.get(n);
        r = e2.get(t), e2.delete(t), 0 === e2.size && this.listens.delete(n);
      } else r = void 0;
      return r;
    }
    onAuthRevoked_(e, t) {
      log("Auth token revoked: " + e + "/" + t), this.authToken_ = null, this.forceTokenRefresh_ = true, this.realtime_.close(), "invalid_token" !== e && "permission_denied" !== e || (this.invalidAuthTokenCount_++, this.invalidAuthTokenCount_ >= 3 && (this.reconnectDelay_ = 3e4, this.authTokenProvider_.notifyForInvalidToken()));
    }
    onAppCheckRevoked_(e, t) {
      log("App check token revoked: " + e + "/" + t), this.appCheckToken_ = null, this.forceTokenRefresh_ = true, "invalid_token" !== e && "permission_denied" !== e || (this.invalidAppCheckTokenCount_++, this.invalidAppCheckTokenCount_ >= 3 && this.appCheckTokenProvider_.notifyForInvalidToken());
    }
    onSecurityDebugPacket_(e) {
      this.securityDebugCallback_ ? this.securityDebugCallback_(e) : "msg" in e && console.log("FIREBASE: " + e.msg.replace("\n", "\nFIREBASE: "));
    }
    restoreState_() {
      this.tryAuth(), this.tryAppCheck();
      for (const e of this.listens.values()) for (const t of e.values()) this.sendListen_(t);
      for (let e = 0; e < this.outstandingPuts_.length; e++) this.outstandingPuts_[e] && this.sendPut_(e);
      for (; this.onDisconnectRequestQueue_.length; ) {
        const e = this.onDisconnectRequestQueue_.shift();
        this.sendOnDisconnect_(e.action, e.pathString, e.data, e.onComplete);
      }
      for (let e = 0; e < this.outstandingGets_.length; e++) this.outstandingGets_[e] && this.sendGet_(e);
    }
    sendConnectStats_() {
      const e = {};
      e["sdk.js." + u2.replace(/\./g, "-")] = 1, isMobileCordova() ? e["framework.cordova"] = 1 : (function isReactNative() {
        return "object" == typeof navigator && "ReactNative" === navigator.product;
      })() && (e["framework.reactnative"] = 1), this.reportStats(e);
    }
    shouldReconnect_() {
      const e = OnlineMonitor.getInstance().currentlyOnline();
      return isEmpty(this.interruptReasons_) && e;
    }
  };
  PersistentConnection.nextPersistentConnectionId_ = 0, PersistentConnection.nextConnectionId_ = 0;
  var NamedNode = class _NamedNode {
    constructor(e, t) {
      this.name = e, this.node = t;
    }
    static Wrap(e, t) {
      return new _NamedNode(e, t);
    }
  };
  var Index = class {
    getCompare() {
      return this.compare.bind(this);
    }
    indexedValueChanged(e, t) {
      const n = new NamedNode(v2, e), r = new NamedNode(v2, t);
      return 0 !== this.compare(n, r);
    }
    minPost() {
      return NamedNode.MIN;
    }
  };
  var I2;
  var KeyIndex = class extends Index {
    static get __EMPTY_NODE() {
      return I2;
    }
    static set __EMPTY_NODE(e) {
      I2 = e;
    }
    compare(e, t) {
      return nameCompare(e.name, t.name);
    }
    isDefinedOn(e) {
      throw assertionError("KeyIndex.isDefinedOn not expected to be called.");
    }
    indexedValueChanged(e, t) {
      return false;
    }
    minPost() {
      return NamedNode.MIN;
    }
    maxPost() {
      return new NamedNode(C2, I2);
    }
    makePost(e, t) {
      return assert("string" == typeof e, "KeyIndex indexValue must always be a string."), new NamedNode(e, I2);
    }
    toString() {
      return ".key";
    }
  };
  var b2 = new KeyIndex();
  var SortedMapIterator = class {
    constructor(e, t, n, r, i2 = null) {
      this.isReverse_ = r, this.resultGenerator_ = i2, this.nodeStack_ = [];
      let o3 = 1;
      for (; !e.isEmpty(); ) if (e = e, o3 = t ? n(e.key, t) : 1, r && (o3 *= -1), o3 < 0) e = this.isReverse_ ? e.left : e.right;
      else {
        if (0 === o3) {
          this.nodeStack_.push(e);
          break;
        }
        this.nodeStack_.push(e), e = this.isReverse_ ? e.right : e.left;
      }
    }
    getNext() {
      if (0 === this.nodeStack_.length) return null;
      let e, t = this.nodeStack_.pop();
      if (e = this.resultGenerator_ ? this.resultGenerator_(t.key, t.value) : { key: t.key, value: t.value }, this.isReverse_) for (t = t.left; !t.isEmpty(); ) this.nodeStack_.push(t), t = t.right;
      else for (t = t.right; !t.isEmpty(); ) this.nodeStack_.push(t), t = t.left;
      return e;
    }
    hasNext() {
      return this.nodeStack_.length > 0;
    }
    peek() {
      if (0 === this.nodeStack_.length) return null;
      const e = this.nodeStack_[this.nodeStack_.length - 1];
      return this.resultGenerator_ ? this.resultGenerator_(e.key, e.value) : { key: e.key, value: e.value };
    }
  };
  var LLRBNode = class _LLRBNode {
    constructor(e, t, n, r, i2) {
      this.key = e, this.value = t, this.color = null != n ? n : _LLRBNode.RED, this.left = null != r ? r : SortedMap.EMPTY_NODE, this.right = null != i2 ? i2 : SortedMap.EMPTY_NODE;
    }
    copy(e, t, n, r, i2) {
      return new _LLRBNode(null != e ? e : this.key, null != t ? t : this.value, null != n ? n : this.color, null != r ? r : this.left, null != i2 ? i2 : this.right);
    }
    count() {
      return this.left.count() + 1 + this.right.count();
    }
    isEmpty() {
      return false;
    }
    inorderTraversal(e) {
      return this.left.inorderTraversal(e) || !!e(this.key, this.value) || this.right.inorderTraversal(e);
    }
    reverseTraversal(e) {
      return this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e);
    }
    min_() {
      return this.left.isEmpty() ? this : this.left.min_();
    }
    minKey() {
      return this.min_().key;
    }
    maxKey() {
      return this.right.isEmpty() ? this.key : this.right.maxKey();
    }
    insert(e, t, n) {
      let r = this;
      const i2 = n(e, r.key);
      return r = i2 < 0 ? r.copy(null, null, null, r.left.insert(e, t, n), null) : 0 === i2 ? r.copy(null, t, null, null, null) : r.copy(null, null, null, null, r.right.insert(e, t, n)), r.fixUp_();
    }
    removeMin_() {
      if (this.left.isEmpty()) return SortedMap.EMPTY_NODE;
      let e = this;
      return e.left.isRed_() || e.left.left.isRed_() || (e = e.moveRedLeft_()), e = e.copy(null, null, null, e.left.removeMin_(), null), e.fixUp_();
    }
    remove(e, t) {
      let n, r;
      if (n = this, t(e, n.key) < 0) n.left.isEmpty() || n.left.isRed_() || n.left.left.isRed_() || (n = n.moveRedLeft_()), n = n.copy(null, null, null, n.left.remove(e, t), null);
      else {
        if (n.left.isRed_() && (n = n.rotateRight_()), n.right.isEmpty() || n.right.isRed_() || n.right.left.isRed_() || (n = n.moveRedRight_()), 0 === t(e, n.key)) {
          if (n.right.isEmpty()) return SortedMap.EMPTY_NODE;
          r = n.right.min_(), n = n.copy(r.key, r.value, null, null, n.right.removeMin_());
        }
        n = n.copy(null, null, null, null, n.right.remove(e, t));
      }
      return n.fixUp_();
    }
    isRed_() {
      return this.color;
    }
    fixUp_() {
      let e = this;
      return e.right.isRed_() && !e.left.isRed_() && (e = e.rotateLeft_()), e.left.isRed_() && e.left.left.isRed_() && (e = e.rotateRight_()), e.left.isRed_() && e.right.isRed_() && (e = e.colorFlip_()), e;
    }
    moveRedLeft_() {
      let e = this.colorFlip_();
      return e.right.left.isRed_() && (e = e.copy(null, null, null, null, e.right.rotateRight_()), e = e.rotateLeft_(), e = e.colorFlip_()), e;
    }
    moveRedRight_() {
      let e = this.colorFlip_();
      return e.left.left.isRed_() && (e = e.rotateRight_(), e = e.colorFlip_()), e;
    }
    rotateLeft_() {
      const e = this.copy(null, null, _LLRBNode.RED, null, this.right.left);
      return this.right.copy(null, null, this.color, e, null);
    }
    rotateRight_() {
      const e = this.copy(null, null, _LLRBNode.RED, this.left.right, null);
      return this.left.copy(null, null, this.color, null, e);
    }
    colorFlip_() {
      const e = this.left.copy(null, null, !this.left.color, null, null), t = this.right.copy(null, null, !this.right.color, null, null);
      return this.copy(null, null, !this.color, e, t);
    }
    checkMaxDepth_() {
      const e = this.check_();
      return Math.pow(2, e) <= this.count() + 1;
    }
    check_() {
      if (this.isRed_() && this.left.isRed_()) throw new Error("Red node has red child(" + this.key + "," + this.value + ")");
      if (this.right.isRed_()) throw new Error("Right child of (" + this.key + "," + this.value + ") is red");
      const e = this.left.check_();
      if (e !== this.right.check_()) throw new Error("Black depths differ");
      return e + (this.isRed_() ? 0 : 1);
    }
  };
  LLRBNode.RED = true, LLRBNode.BLACK = false;
  var SortedMap = class _SortedMap {
    constructor(e, t = _SortedMap.EMPTY_NODE) {
      this.comparator_ = e, this.root_ = t;
    }
    insert(e, t) {
      return new _SortedMap(this.comparator_, this.root_.insert(e, t, this.comparator_).copy(null, null, LLRBNode.BLACK, null, null));
    }
    remove(e) {
      return new _SortedMap(this.comparator_, this.root_.remove(e, this.comparator_).copy(null, null, LLRBNode.BLACK, null, null));
    }
    get(e) {
      let t, n = this.root_;
      for (; !n.isEmpty(); ) {
        if (t = this.comparator_(e, n.key), 0 === t) return n.value;
        t < 0 ? n = n.left : t > 0 && (n = n.right);
      }
      return null;
    }
    getPredecessorKey(e) {
      let t, n = this.root_, r = null;
      for (; !n.isEmpty(); ) {
        if (t = this.comparator_(e, n.key), 0 === t) {
          if (n.left.isEmpty()) return r ? r.key : null;
          for (n = n.left; !n.right.isEmpty(); ) n = n.right;
          return n.key;
        }
        t < 0 ? n = n.left : t > 0 && (r = n, n = n.right);
      }
      throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?");
    }
    isEmpty() {
      return this.root_.isEmpty();
    }
    count() {
      return this.root_.count();
    }
    minKey() {
      return this.root_.minKey();
    }
    maxKey() {
      return this.root_.maxKey();
    }
    inorderTraversal(e) {
      return this.root_.inorderTraversal(e);
    }
    reverseTraversal(e) {
      return this.root_.reverseTraversal(e);
    }
    getIterator(e) {
      return new SortedMapIterator(this.root_, null, this.comparator_, false, e);
    }
    getIteratorFrom(e, t) {
      return new SortedMapIterator(this.root_, e, this.comparator_, false, t);
    }
    getReverseIteratorFrom(e, t) {
      return new SortedMapIterator(this.root_, e, this.comparator_, true, t);
    }
    getReverseIterator(e) {
      return new SortedMapIterator(this.root_, null, this.comparator_, true, e);
    }
  };
  function NAME_ONLY_COMPARATOR(e, t) {
    return nameCompare(e.name, t.name);
  }
  function NAME_COMPARATOR(e, t) {
    return nameCompare(e, t);
  }
  var N2;
  SortedMap.EMPTY_NODE = new class LLRBEmptyNode {
    copy(e, t, n, r, i2) {
      return this;
    }
    insert(e, t, n) {
      return new LLRBNode(e, t, null);
    }
    remove(e, t) {
      return this;
    }
    count() {
      return 0;
    }
    isEmpty() {
      return true;
    }
    inorderTraversal(e) {
      return false;
    }
    reverseTraversal(e) {
      return false;
    }
    minKey() {
      return null;
    }
    maxKey() {
      return null;
    }
    check_() {
      return 0;
    }
    isRed_() {
      return false;
    }
  }();
  var priorityHashText = function(e) {
    return "number" == typeof e ? "number:" + doubleToIEEE754String(e) : "string:" + e;
  };
  var validatePriorityNode = function(e) {
    if (e.isLeafNode()) {
      const t = e.val();
      assert("string" == typeof t || "number" == typeof t || "object" == typeof t && contains(t, ".sv"), "Priority must be a string or number.");
    } else assert(e === N2 || e.isEmpty(), "priority of unexpected type.");
    assert(e === N2 || e.getPriority().isEmpty(), "Priority nodes can't have a priority of their own.");
  };
  var R2;
  var k2;
  var A2;
  var LeafNode = class _LeafNode {
    static set __childrenNodeConstructor(e) {
      R2 = e;
    }
    static get __childrenNodeConstructor() {
      return R2;
    }
    constructor(e, t = _LeafNode.__childrenNodeConstructor.EMPTY_NODE) {
      this.value_ = e, this.priorityNode_ = t, this.lazyHash_ = null, assert(void 0 !== this.value_ && null !== this.value_, "LeafNode shouldn't be created with null/undefined value."), validatePriorityNode(this.priorityNode_);
    }
    isLeafNode() {
      return true;
    }
    getPriority() {
      return this.priorityNode_;
    }
    updatePriority(e) {
      return new _LeafNode(this.value_, e);
    }
    getImmediateChild(e) {
      return ".priority" === e ? this.priorityNode_ : _LeafNode.__childrenNodeConstructor.EMPTY_NODE;
    }
    getChild(e) {
      return pathIsEmpty(e) ? this : ".priority" === pathGetFront(e) ? this.priorityNode_ : _LeafNode.__childrenNodeConstructor.EMPTY_NODE;
    }
    hasChild() {
      return false;
    }
    getPredecessorChildName(e, t) {
      return null;
    }
    updateImmediateChild(e, t) {
      return ".priority" === e ? this.updatePriority(t) : t.isEmpty() && ".priority" !== e ? this : _LeafNode.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e, t).updatePriority(this.priorityNode_);
    }
    updateChild(e, t) {
      const n = pathGetFront(e);
      return null === n ? t : t.isEmpty() && ".priority" !== n ? this : (assert(".priority" !== n || 1 === pathGetLength(e), ".priority must be the last token in a path"), this.updateImmediateChild(n, _LeafNode.__childrenNodeConstructor.EMPTY_NODE.updateChild(pathPopFront(e), t)));
    }
    isEmpty() {
      return false;
    }
    numChildren() {
      return 0;
    }
    forEachChild(e, t) {
      return false;
    }
    val(e) {
      return e && !this.getPriority().isEmpty() ? { ".value": this.getValue(), ".priority": this.getPriority().val() } : this.getValue();
    }
    hash() {
      if (null === this.lazyHash_) {
        let e = "";
        this.priorityNode_.isEmpty() || (e += "priority:" + priorityHashText(this.priorityNode_.val()) + ":");
        const t = typeof this.value_;
        e += t + ":", e += "number" === t ? doubleToIEEE754String(this.value_) : this.value_, this.lazyHash_ = sha1(e);
      }
      return this.lazyHash_;
    }
    getValue() {
      return this.value_;
    }
    compareTo(e) {
      return e === _LeafNode.__childrenNodeConstructor.EMPTY_NODE ? 1 : e instanceof _LeafNode.__childrenNodeConstructor ? -1 : (assert(e.isLeafNode(), "Unknown node type"), this.compareToLeafNode_(e));
    }
    compareToLeafNode_(e) {
      const t = typeof e.value_, n = typeof this.value_, r = _LeafNode.VALUE_TYPE_ORDER.indexOf(t), i2 = _LeafNode.VALUE_TYPE_ORDER.indexOf(n);
      return assert(r >= 0, "Unknown leaf type: " + t), assert(i2 >= 0, "Unknown leaf type: " + n), r === i2 ? "object" === n ? 0 : this.value_ < e.value_ ? -1 : this.value_ === e.value_ ? 0 : 1 : i2 - r;
    }
    withIndex() {
      return this;
    }
    isIndexed() {
      return true;
    }
    equals(e) {
      if (e === this) return true;
      if (e.isLeafNode()) {
        const t = e;
        return this.value_ === t.value_ && this.priorityNode_.equals(t.priorityNode_);
      }
      return false;
    }
  };
  LeafNode.VALUE_TYPE_ORDER = ["object", "boolean", "number", "string"];
  var x2 = new class PriorityIndex extends Index {
    compare(e, t) {
      const n = e.node.getPriority(), r = t.node.getPriority(), i2 = n.compareTo(r);
      return 0 === i2 ? nameCompare(e.name, t.name) : i2;
    }
    isDefinedOn(e) {
      return !e.getPriority().isEmpty();
    }
    indexedValueChanged(e, t) {
      return !e.getPriority().equals(t.getPriority());
    }
    minPost() {
      return NamedNode.MIN;
    }
    maxPost() {
      return new NamedNode(C2, new LeafNode("[PRIORITY-POST]", A2));
    }
    makePost(e, t) {
      const n = k2(e);
      return new NamedNode(t, new LeafNode("[PRIORITY-POST]", n));
    }
    toString() {
      return ".priority";
    }
  }();
  var F2 = Math.log(2);
  var Base12Num = class {
    constructor(e) {
      var t;
      this.count = (t = e + 1, parseInt(Math.log(t) / F2, 10)), this.current_ = this.count - 1;
      const n = (r = this.count, parseInt(Array(r + 1).join("1"), 2));
      var r;
      this.bits_ = e + 1 & n;
    }
    nextBitIsOne() {
      const e = !(this.bits_ & 1 << this.current_);
      return this.current_--, e;
    }
  };
  var buildChildSet = function(e, t, n, r) {
    e.sort(t);
    const buildBalancedTree = function(t2, r2) {
      const i3 = r2 - t2;
      let o3, s3;
      if (0 === i3) return null;
      if (1 === i3) return o3 = e[t2], s3 = n ? n(o3) : o3, new LLRBNode(s3, o3.node, LLRBNode.BLACK, null, null);
      {
        const a3 = parseInt(i3 / 2, 10) + t2, l3 = buildBalancedTree(t2, a3), h3 = buildBalancedTree(a3 + 1, r2);
        return o3 = e[a3], s3 = n ? n(o3) : o3, new LLRBNode(s3, o3.node, LLRBNode.BLACK, l3, h3);
      }
    }, i2 = (function(t2) {
      let r2 = null, i3 = null, o3 = e.length;
      const buildPennant = function(t3, r3) {
        const i4 = o3 - t3, s3 = o3;
        o3 -= t3;
        const a3 = buildBalancedTree(i4 + 1, s3), l3 = e[i4], h3 = n ? n(l3) : l3;
        attachPennant(new LLRBNode(h3, l3.node, r3, null, a3));
      }, attachPennant = function(e2) {
        r2 ? (r2.left = e2, r2 = e2) : (i3 = e2, r2 = e2);
      };
      for (let e2 = 0; e2 < t2.count; ++e2) {
        const n2 = t2.nextBitIsOne(), r3 = Math.pow(2, t2.count - (e2 + 1));
        n2 ? buildPennant(r3, LLRBNode.BLACK) : (buildPennant(r3, LLRBNode.BLACK), buildPennant(r3, LLRBNode.RED));
      }
      return i3;
    })(new Base12Num(e.length));
    return new SortedMap(r || t, i2);
  };
  var O2;
  var D2 = {};
  var IndexMap = class _IndexMap {
    static get Default() {
      return assert(D2 && x2, "ChildrenNode.ts has not been loaded"), O2 = O2 || new _IndexMap({ ".priority": D2 }, { ".priority": x2 }), O2;
    }
    constructor(e, t) {
      this.indexes_ = e, this.indexSet_ = t;
    }
    get(e) {
      const t = safeGet(this.indexes_, e);
      if (!t) throw new Error("No index defined for " + e);
      return t instanceof SortedMap ? t : null;
    }
    hasIndex(e) {
      return contains(this.indexSet_, e.toString());
    }
    addIndex(e, t) {
      assert(e !== b2, "KeyIndex always exists and isn't meant to be added to the IndexMap.");
      const n = [];
      let r = false;
      const i2 = t.getIterator(NamedNode.Wrap);
      let o3, s3 = i2.getNext();
      for (; s3; ) r = r || e.isDefinedOn(s3.node), n.push(s3), s3 = i2.getNext();
      o3 = r ? buildChildSet(n, e.getCompare()) : D2;
      const a3 = e.toString(), l3 = Object.assign({}, this.indexSet_);
      l3[a3] = e;
      const h3 = Object.assign({}, this.indexes_);
      return h3[a3] = o3, new _IndexMap(h3, l3);
    }
    addToIndexes(e, t) {
      const n = map(this.indexes_, ((n2, r) => {
        const i2 = safeGet(this.indexSet_, r);
        if (assert(i2, "Missing index implementation for " + r), n2 === D2) {
          if (i2.isDefinedOn(e.node)) {
            const n3 = [], r2 = t.getIterator(NamedNode.Wrap);
            let o3 = r2.getNext();
            for (; o3; ) o3.name !== e.name && n3.push(o3), o3 = r2.getNext();
            return n3.push(e), buildChildSet(n3, i2.getCompare());
          }
          return D2;
        }
        {
          const r2 = t.get(e.name);
          let i3 = n2;
          return r2 && (i3 = i3.remove(new NamedNode(e.name, r2))), i3.insert(e, e.node);
        }
      }));
      return new _IndexMap(n, this.indexSet_);
    }
    removeFromIndexes(e, t) {
      const n = map(this.indexes_, ((n2) => {
        if (n2 === D2) return n2;
        {
          const r = t.get(e.name);
          return r ? n2.remove(new NamedNode(e.name, r)) : n2;
        }
      }));
      return new _IndexMap(n, this.indexSet_);
    }
  };
  var L2;
  var ChildrenNode = class _ChildrenNode {
    static get EMPTY_NODE() {
      return L2 || (L2 = new _ChildrenNode(new SortedMap(NAME_COMPARATOR), null, IndexMap.Default));
    }
    constructor(e, t, n) {
      this.children_ = e, this.priorityNode_ = t, this.indexMap_ = n, this.lazyHash_ = null, this.priorityNode_ && validatePriorityNode(this.priorityNode_), this.children_.isEmpty() && assert(!this.priorityNode_ || this.priorityNode_.isEmpty(), "An empty node cannot have a priority");
    }
    isLeafNode() {
      return false;
    }
    getPriority() {
      return this.priorityNode_ || L2;
    }
    updatePriority(e) {
      return this.children_.isEmpty() ? this : new _ChildrenNode(this.children_, e, this.indexMap_);
    }
    getImmediateChild(e) {
      if (".priority" === e) return this.getPriority();
      {
        const t = this.children_.get(e);
        return null === t ? L2 : t;
      }
    }
    getChild(e) {
      const t = pathGetFront(e);
      return null === t ? this : this.getImmediateChild(t).getChild(pathPopFront(e));
    }
    hasChild(e) {
      return null !== this.children_.get(e);
    }
    updateImmediateChild(e, t) {
      if (assert(t, "We should always be passing snapshot nodes"), ".priority" === e) return this.updatePriority(t);
      {
        const n = new NamedNode(e, t);
        let r, i2;
        t.isEmpty() ? (r = this.children_.remove(e), i2 = this.indexMap_.removeFromIndexes(n, this.children_)) : (r = this.children_.insert(e, t), i2 = this.indexMap_.addToIndexes(n, this.children_));
        const o3 = r.isEmpty() ? L2 : this.priorityNode_;
        return new _ChildrenNode(r, o3, i2);
      }
    }
    updateChild(e, t) {
      const n = pathGetFront(e);
      if (null === n) return t;
      {
        assert(".priority" !== pathGetFront(e) || 1 === pathGetLength(e), ".priority must be the last token in a path");
        const r = this.getImmediateChild(n).updateChild(pathPopFront(e), t);
        return this.updateImmediateChild(n, r);
      }
    }
    isEmpty() {
      return this.children_.isEmpty();
    }
    numChildren() {
      return this.children_.count();
    }
    val(e) {
      if (this.isEmpty()) return null;
      const t = {};
      let n = 0, r = 0, i2 = true;
      if (this.forEachChild(x2, ((o3, s3) => {
        t[o3] = s3.val(e), n++, i2 && _ChildrenNode.INTEGER_REGEXP_.test(o3) ? r = Math.max(r, Number(o3)) : i2 = false;
      })), !e && i2 && r < 2 * n) {
        const e2 = [];
        for (const n2 in t) e2[n2] = t[n2];
        return e2;
      }
      return e && !this.getPriority().isEmpty() && (t[".priority"] = this.getPriority().val()), t;
    }
    hash() {
      if (null === this.lazyHash_) {
        let e = "";
        this.getPriority().isEmpty() || (e += "priority:" + priorityHashText(this.getPriority().val()) + ":"), this.forEachChild(x2, ((t, n) => {
          const r = n.hash();
          "" !== r && (e += ":" + t + ":" + r);
        })), this.lazyHash_ = "" === e ? "" : sha1(e);
      }
      return this.lazyHash_;
    }
    getPredecessorChildName(e, t, n) {
      const r = this.resolveIndex_(n);
      if (r) {
        const n2 = r.getPredecessorKey(new NamedNode(e, t));
        return n2 ? n2.name : null;
      }
      return this.children_.getPredecessorKey(e);
    }
    getFirstChildName(e) {
      const t = this.resolveIndex_(e);
      if (t) {
        const e2 = t.minKey();
        return e2 && e2.name;
      }
      return this.children_.minKey();
    }
    getFirstChild(e) {
      const t = this.getFirstChildName(e);
      return t ? new NamedNode(t, this.children_.get(t)) : null;
    }
    getLastChildName(e) {
      const t = this.resolveIndex_(e);
      if (t) {
        const e2 = t.maxKey();
        return e2 && e2.name;
      }
      return this.children_.maxKey();
    }
    getLastChild(e) {
      const t = this.getLastChildName(e);
      return t ? new NamedNode(t, this.children_.get(t)) : null;
    }
    forEachChild(e, t) {
      const n = this.resolveIndex_(e);
      return n ? n.inorderTraversal(((e2) => t(e2.name, e2.node))) : this.children_.inorderTraversal(t);
    }
    getIterator(e) {
      return this.getIteratorFrom(e.minPost(), e);
    }
    getIteratorFrom(e, t) {
      const n = this.resolveIndex_(t);
      if (n) return n.getIteratorFrom(e, ((e2) => e2));
      {
        const n2 = this.children_.getIteratorFrom(e.name, NamedNode.Wrap);
        let r = n2.peek();
        for (; null != r && t.compare(r, e) < 0; ) n2.getNext(), r = n2.peek();
        return n2;
      }
    }
    getReverseIterator(e) {
      return this.getReverseIteratorFrom(e.maxPost(), e);
    }
    getReverseIteratorFrom(e, t) {
      const n = this.resolveIndex_(t);
      if (n) return n.getReverseIteratorFrom(e, ((e2) => e2));
      {
        const n2 = this.children_.getReverseIteratorFrom(e.name, NamedNode.Wrap);
        let r = n2.peek();
        for (; null != r && t.compare(r, e) > 0; ) n2.getNext(), r = n2.peek();
        return n2;
      }
    }
    compareTo(e) {
      return this.isEmpty() ? e.isEmpty() ? 0 : -1 : e.isLeafNode() || e.isEmpty() ? 1 : e === M2 ? -1 : 0;
    }
    withIndex(e) {
      if (e === b2 || this.indexMap_.hasIndex(e)) return this;
      {
        const t = this.indexMap_.addIndex(e, this.children_);
        return new _ChildrenNode(this.children_, this.priorityNode_, t);
      }
    }
    isIndexed(e) {
      return e === b2 || this.indexMap_.hasIndex(e);
    }
    equals(e) {
      if (e === this) return true;
      if (e.isLeafNode()) return false;
      {
        const t = e;
        if (this.getPriority().equals(t.getPriority())) {
          if (this.children_.count() === t.children_.count()) {
            const e2 = this.getIterator(x2), n = t.getIterator(x2);
            let r = e2.getNext(), i2 = n.getNext();
            for (; r && i2; ) {
              if (r.name !== i2.name || !r.node.equals(i2.node)) return false;
              r = e2.getNext(), i2 = n.getNext();
            }
            return null === r && null === i2;
          }
          return false;
        }
        return false;
      }
    }
    resolveIndex_(e) {
      return e === b2 ? null : this.indexMap_.get(e.toString());
    }
  };
  ChildrenNode.INTEGER_REGEXP_ = /^(0|[1-9]\d*)$/;
  var M2 = new class MaxNode extends ChildrenNode {
    constructor() {
      super(new SortedMap(NAME_COMPARATOR), ChildrenNode.EMPTY_NODE, IndexMap.Default);
    }
    compareTo(e) {
      return e === this ? 0 : 1;
    }
    equals(e) {
      return e === this;
    }
    getPriority() {
      return this;
    }
    getImmediateChild(e) {
      return ChildrenNode.EMPTY_NODE;
    }
    isEmpty() {
      return false;
    }
  }();
  Object.defineProperties(NamedNode, { MIN: { value: new NamedNode(v2, ChildrenNode.EMPTY_NODE) }, MAX: { value: new NamedNode(C2, M2) } }), KeyIndex.__EMPTY_NODE = ChildrenNode.EMPTY_NODE, LeafNode.__childrenNodeConstructor = ChildrenNode, (function setMaxNode$1(e) {
    N2 = e;
  })(M2), (function setMaxNode(e) {
    A2 = e;
  })(M2);
  function nodeFromJSON(e, t = null) {
    if (null === e) return ChildrenNode.EMPTY_NODE;
    if ("object" == typeof e && ".priority" in e && (t = e[".priority"]), assert(null === t || "string" == typeof t || "number" == typeof t || "object" == typeof t && ".sv" in t, "Invalid priority type found: " + typeof t), "object" == typeof e && ".value" in e && null !== e[".value"] && (e = e[".value"]), "object" != typeof e || ".sv" in e) {
      return new LeafNode(e, nodeFromJSON(t));
    }
    if (e instanceof Array) {
      let n = ChildrenNode.EMPTY_NODE;
      return each(e, ((t2, r) => {
        if (contains(e, t2) && "." !== t2.substring(0, 1)) {
          const e2 = nodeFromJSON(r);
          !e2.isLeafNode() && e2.isEmpty() || (n = n.updateImmediateChild(t2, e2));
        }
      })), n.updatePriority(nodeFromJSON(t));
    }
    {
      const n = [];
      let r = false;
      if (each(e, ((e2, t2) => {
        if ("." !== e2.substring(0, 1)) {
          const i3 = nodeFromJSON(t2);
          i3.isEmpty() || (r = r || !i3.getPriority().isEmpty(), n.push(new NamedNode(e2, i3)));
        }
      })), 0 === n.length) return ChildrenNode.EMPTY_NODE;
      const i2 = buildChildSet(n, NAME_ONLY_COMPARATOR, ((e2) => e2.name), NAME_COMPARATOR);
      if (r) {
        const e2 = buildChildSet(n, x2.getCompare());
        return new ChildrenNode(i2, nodeFromJSON(t), new IndexMap({ ".priority": e2 }, { ".priority": x2 }));
      }
      return new ChildrenNode(i2, nodeFromJSON(t), IndexMap.Default);
    }
  }
  !(function setNodeFromJSON(e) {
    k2 = e;
  })(nodeFromJSON);
  var PathIndex = class extends Index {
    constructor(e) {
      super(), this.indexPath_ = e, assert(!pathIsEmpty(e) && ".priority" !== pathGetFront(e), "Can't create PathIndex with empty path or .priority key");
    }
    extractChild(e) {
      return e.getChild(this.indexPath_);
    }
    isDefinedOn(e) {
      return !e.getChild(this.indexPath_).isEmpty();
    }
    compare(e, t) {
      const n = this.extractChild(e.node), r = this.extractChild(t.node), i2 = n.compareTo(r);
      return 0 === i2 ? nameCompare(e.name, t.name) : i2;
    }
    makePost(e, t) {
      const n = nodeFromJSON(e), r = ChildrenNode.EMPTY_NODE.updateChild(this.indexPath_, n);
      return new NamedNode(t, r);
    }
    maxPost() {
      const e = ChildrenNode.EMPTY_NODE.updateChild(this.indexPath_, M2);
      return new NamedNode(C2, e);
    }
    toString() {
      return pathSlice(this.indexPath_, 0).join("/");
    }
  };
  var W2 = new class ValueIndex extends Index {
    compare(e, t) {
      const n = e.node.compareTo(t.node);
      return 0 === n ? nameCompare(e.name, t.name) : n;
    }
    isDefinedOn(e) {
      return true;
    }
    indexedValueChanged(e, t) {
      return !e.equals(t);
    }
    minPost() {
      return NamedNode.MIN;
    }
    maxPost() {
      return NamedNode.MAX;
    }
    makePost(e, t) {
      const n = nodeFromJSON(e);
      return new NamedNode(t, n);
    }
    toString() {
      return ".value";
    }
  }();
  function changeValue(e) {
    return { type: "value", snapshotNode: e };
  }
  function changeChildAdded(e, t) {
    return { type: "child_added", snapshotNode: t, childName: e };
  }
  function changeChildRemoved(e, t) {
    return { type: "child_removed", snapshotNode: t, childName: e };
  }
  function changeChildChanged(e, t, n) {
    return { type: "child_changed", snapshotNode: t, childName: e, oldSnap: n };
  }
  var IndexedFilter = class {
    constructor(e) {
      this.index_ = e;
    }
    updateChild(e, t, n, r, i2, o3) {
      assert(e.isIndexed(this.index_), "A node must be indexed if only a child is updated");
      const s3 = e.getImmediateChild(t);
      return s3.getChild(r).equals(n.getChild(r)) && s3.isEmpty() === n.isEmpty() ? e : (null != o3 && (n.isEmpty() ? e.hasChild(t) ? o3.trackChildChange(changeChildRemoved(t, s3)) : assert(e.isLeafNode(), "A child remove without an old child only makes sense on a leaf node") : s3.isEmpty() ? o3.trackChildChange(changeChildAdded(t, n)) : o3.trackChildChange(changeChildChanged(t, n, s3))), e.isLeafNode() && n.isEmpty() ? e : e.updateImmediateChild(t, n).withIndex(this.index_));
    }
    updateFullNode(e, t, n) {
      return null != n && (e.isLeafNode() || e.forEachChild(x2, ((e2, r) => {
        t.hasChild(e2) || n.trackChildChange(changeChildRemoved(e2, r));
      })), t.isLeafNode() || t.forEachChild(x2, ((t2, r) => {
        if (e.hasChild(t2)) {
          const i2 = e.getImmediateChild(t2);
          i2.equals(r) || n.trackChildChange(changeChildChanged(t2, r, i2));
        } else n.trackChildChange(changeChildAdded(t2, r));
      }))), t.withIndex(this.index_);
    }
    updatePriority(e, t) {
      return e.isEmpty() ? ChildrenNode.EMPTY_NODE : e.updatePriority(t);
    }
    filtersNodes() {
      return false;
    }
    getIndexedFilter() {
      return this;
    }
    getIndex() {
      return this.index_;
    }
  };
  var RangedFilter = class _RangedFilter {
    constructor(e) {
      this.indexedFilter_ = new IndexedFilter(e.getIndex()), this.index_ = e.getIndex(), this.startPost_ = _RangedFilter.getStartPost_(e), this.endPost_ = _RangedFilter.getEndPost_(e), this.startIsInclusive_ = !e.startAfterSet_, this.endIsInclusive_ = !e.endBeforeSet_;
    }
    getStartPost() {
      return this.startPost_;
    }
    getEndPost() {
      return this.endPost_;
    }
    matches(e) {
      const t = this.startIsInclusive_ ? this.index_.compare(this.getStartPost(), e) <= 0 : this.index_.compare(this.getStartPost(), e) < 0, n = this.endIsInclusive_ ? this.index_.compare(e, this.getEndPost()) <= 0 : this.index_.compare(e, this.getEndPost()) < 0;
      return t && n;
    }
    updateChild(e, t, n, r, i2, o3) {
      return this.matches(new NamedNode(t, n)) || (n = ChildrenNode.EMPTY_NODE), this.indexedFilter_.updateChild(e, t, n, r, i2, o3);
    }
    updateFullNode(e, t, n) {
      t.isLeafNode() && (t = ChildrenNode.EMPTY_NODE);
      let r = t.withIndex(this.index_);
      r = r.updatePriority(ChildrenNode.EMPTY_NODE);
      const i2 = this;
      return t.forEachChild(x2, ((e2, t2) => {
        i2.matches(new NamedNode(e2, t2)) || (r = r.updateImmediateChild(e2, ChildrenNode.EMPTY_NODE));
      })), this.indexedFilter_.updateFullNode(e, r, n);
    }
    updatePriority(e, t) {
      return e;
    }
    filtersNodes() {
      return true;
    }
    getIndexedFilter() {
      return this.indexedFilter_;
    }
    getIndex() {
      return this.index_;
    }
    static getStartPost_(e) {
      if (e.hasStart()) {
        const t = e.getIndexStartName();
        return e.getIndex().makePost(e.getIndexStartValue(), t);
      }
      return e.getIndex().minPost();
    }
    static getEndPost_(e) {
      if (e.hasEnd()) {
        const t = e.getIndexEndName();
        return e.getIndex().makePost(e.getIndexEndValue(), t);
      }
      return e.getIndex().maxPost();
    }
  };
  var LimitedFilter = class {
    constructor(e) {
      this.withinDirectionalStart = (e2) => this.reverse_ ? this.withinEndPost(e2) : this.withinStartPost(e2), this.withinDirectionalEnd = (e2) => this.reverse_ ? this.withinStartPost(e2) : this.withinEndPost(e2), this.withinStartPost = (e2) => {
        const t = this.index_.compare(this.rangedFilter_.getStartPost(), e2);
        return this.startIsInclusive_ ? t <= 0 : t < 0;
      }, this.withinEndPost = (e2) => {
        const t = this.index_.compare(e2, this.rangedFilter_.getEndPost());
        return this.endIsInclusive_ ? t <= 0 : t < 0;
      }, this.rangedFilter_ = new RangedFilter(e), this.index_ = e.getIndex(), this.limit_ = e.getLimit(), this.reverse_ = !e.isViewFromLeft(), this.startIsInclusive_ = !e.startAfterSet_, this.endIsInclusive_ = !e.endBeforeSet_;
    }
    updateChild(e, t, n, r, i2, o3) {
      return this.rangedFilter_.matches(new NamedNode(t, n)) || (n = ChildrenNode.EMPTY_NODE), e.getImmediateChild(t).equals(n) ? e : e.numChildren() < this.limit_ ? this.rangedFilter_.getIndexedFilter().updateChild(e, t, n, r, i2, o3) : this.fullLimitUpdateChild_(e, t, n, i2, o3);
    }
    updateFullNode(e, t, n) {
      let r;
      if (t.isLeafNode() || t.isEmpty()) r = ChildrenNode.EMPTY_NODE.withIndex(this.index_);
      else if (2 * this.limit_ < t.numChildren() && t.isIndexed(this.index_)) {
        let e2;
        r = ChildrenNode.EMPTY_NODE.withIndex(this.index_), e2 = this.reverse_ ? t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(), this.index_) : t.getIteratorFrom(this.rangedFilter_.getStartPost(), this.index_);
        let n2 = 0;
        for (; e2.hasNext() && n2 < this.limit_; ) {
          const t2 = e2.getNext();
          if (this.withinDirectionalStart(t2)) {
            if (!this.withinDirectionalEnd(t2)) break;
            r = r.updateImmediateChild(t2.name, t2.node), n2++;
          }
        }
      } else {
        let e2;
        r = t.withIndex(this.index_), r = r.updatePriority(ChildrenNode.EMPTY_NODE), e2 = this.reverse_ ? r.getReverseIterator(this.index_) : r.getIterator(this.index_);
        let n2 = 0;
        for (; e2.hasNext(); ) {
          const t2 = e2.getNext();
          n2 < this.limit_ && this.withinDirectionalStart(t2) && this.withinDirectionalEnd(t2) ? n2++ : r = r.updateImmediateChild(t2.name, ChildrenNode.EMPTY_NODE);
        }
      }
      return this.rangedFilter_.getIndexedFilter().updateFullNode(e, r, n);
    }
    updatePriority(e, t) {
      return e;
    }
    filtersNodes() {
      return true;
    }
    getIndexedFilter() {
      return this.rangedFilter_.getIndexedFilter();
    }
    getIndex() {
      return this.index_;
    }
    fullLimitUpdateChild_(e, t, n, r, i2) {
      let o3;
      if (this.reverse_) {
        const e2 = this.index_.getCompare();
        o3 = (t2, n2) => e2(n2, t2);
      } else o3 = this.index_.getCompare();
      const s3 = e;
      assert(s3.numChildren() === this.limit_, "");
      const a3 = new NamedNode(t, n), l3 = this.reverse_ ? s3.getFirstChild(this.index_) : s3.getLastChild(this.index_), h3 = this.rangedFilter_.matches(a3);
      if (s3.hasChild(t)) {
        const e2 = s3.getImmediateChild(t);
        let c3 = r.getChildAfterChild(this.index_, l3, this.reverse_);
        for (; null != c3 && (c3.name === t || s3.hasChild(c3.name)); ) c3 = r.getChildAfterChild(this.index_, c3, this.reverse_);
        const d3 = null == c3 ? 1 : o3(c3, a3);
        if (h3 && !n.isEmpty() && d3 >= 0) return null != i2 && i2.trackChildChange(changeChildChanged(t, n, e2)), s3.updateImmediateChild(t, n);
        {
          null != i2 && i2.trackChildChange(changeChildRemoved(t, e2));
          const n2 = s3.updateImmediateChild(t, ChildrenNode.EMPTY_NODE);
          return null != c3 && this.rangedFilter_.matches(c3) ? (null != i2 && i2.trackChildChange(changeChildAdded(c3.name, c3.node)), n2.updateImmediateChild(c3.name, c3.node)) : n2;
        }
      }
      return n.isEmpty() ? e : h3 && o3(l3, a3) >= 0 ? (null != i2 && (i2.trackChildChange(changeChildRemoved(l3.name, l3.node)), i2.trackChildChange(changeChildAdded(t, n))), s3.updateImmediateChild(t, n).updateImmediateChild(l3.name, ChildrenNode.EMPTY_NODE)) : e;
    }
  };
  var QueryParams = class _QueryParams {
    constructor() {
      this.limitSet_ = false, this.startSet_ = false, this.startNameSet_ = false, this.startAfterSet_ = false, this.endSet_ = false, this.endNameSet_ = false, this.endBeforeSet_ = false, this.limit_ = 0, this.viewFrom_ = "", this.indexStartValue_ = null, this.indexStartName_ = "", this.indexEndValue_ = null, this.indexEndName_ = "", this.index_ = x2;
    }
    hasStart() {
      return this.startSet_;
    }
    isViewFromLeft() {
      return "" === this.viewFrom_ ? this.startSet_ : "l" === this.viewFrom_;
    }
    getIndexStartValue() {
      return assert(this.startSet_, "Only valid if start has been set"), this.indexStartValue_;
    }
    getIndexStartName() {
      return assert(this.startSet_, "Only valid if start has been set"), this.startNameSet_ ? this.indexStartName_ : v2;
    }
    hasEnd() {
      return this.endSet_;
    }
    getIndexEndValue() {
      return assert(this.endSet_, "Only valid if end has been set"), this.indexEndValue_;
    }
    getIndexEndName() {
      return assert(this.endSet_, "Only valid if end has been set"), this.endNameSet_ ? this.indexEndName_ : C2;
    }
    hasLimit() {
      return this.limitSet_;
    }
    hasAnchoredLimit() {
      return this.limitSet_ && "" !== this.viewFrom_;
    }
    getLimit() {
      return assert(this.limitSet_, "Only valid if limit has been set"), this.limit_;
    }
    getIndex() {
      return this.index_;
    }
    loadsAllData() {
      return !(this.startSet_ || this.endSet_ || this.limitSet_);
    }
    isDefault() {
      return this.loadsAllData() && this.index_ === x2;
    }
    copy() {
      const e = new _QueryParams();
      return e.limitSet_ = this.limitSet_, e.limit_ = this.limit_, e.startSet_ = this.startSet_, e.startAfterSet_ = this.startAfterSet_, e.indexStartValue_ = this.indexStartValue_, e.startNameSet_ = this.startNameSet_, e.indexStartName_ = this.indexStartName_, e.endSet_ = this.endSet_, e.endBeforeSet_ = this.endBeforeSet_, e.indexEndValue_ = this.indexEndValue_, e.endNameSet_ = this.endNameSet_, e.indexEndName_ = this.indexEndName_, e.index_ = this.index_, e.viewFrom_ = this.viewFrom_, e;
    }
  };
  function queryParamsStartAt(e, t, n) {
    const r = e.copy();
    return r.startSet_ = true, void 0 === t && (t = null), r.indexStartValue_ = t, null != n ? (r.startNameSet_ = true, r.indexStartName_ = n) : (r.startNameSet_ = false, r.indexStartName_ = ""), r;
  }
  function queryParamsEndAt(e, t, n) {
    const r = e.copy();
    return r.endSet_ = true, void 0 === t && (t = null), r.indexEndValue_ = t, void 0 !== n ? (r.endNameSet_ = true, r.indexEndName_ = n) : (r.endNameSet_ = false, r.indexEndName_ = ""), r;
  }
  function queryParamsOrderBy(e, t) {
    const n = e.copy();
    return n.index_ = t, n;
  }
  function queryParamsToRestQueryStringParameters(e) {
    const t = {};
    if (e.isDefault()) return t;
    let n;
    if (e.index_ === x2 ? n = "$priority" : e.index_ === W2 ? n = "$value" : e.index_ === b2 ? n = "$key" : (assert(e.index_ instanceof PathIndex, "Unrecognized index type!"), n = e.index_.toString()), t.orderBy = stringify(n), e.startSet_) {
      const n2 = e.startAfterSet_ ? "startAfter" : "startAt";
      t[n2] = stringify(e.indexStartValue_), e.startNameSet_ && (t[n2] += "," + stringify(e.indexStartName_));
    }
    if (e.endSet_) {
      const n2 = e.endBeforeSet_ ? "endBefore" : "endAt";
      t[n2] = stringify(e.indexEndValue_), e.endNameSet_ && (t[n2] += "," + stringify(e.indexEndName_));
    }
    return e.limitSet_ && (e.isViewFromLeft() ? t.limitToFirst = e.limit_ : t.limitToLast = e.limit_), t;
  }
  function queryParamsGetQueryObject(e) {
    const t = {};
    if (e.startSet_ && (t.sp = e.indexStartValue_, e.startNameSet_ && (t.sn = e.indexStartName_), t.sin = !e.startAfterSet_), e.endSet_ && (t.ep = e.indexEndValue_, e.endNameSet_ && (t.en = e.indexEndName_), t.ein = !e.endBeforeSet_), e.limitSet_) {
      t.l = e.limit_;
      let n = e.viewFrom_;
      "" === n && (n = e.isViewFromLeft() ? "l" : "r"), t.vf = n;
    }
    return e.index_ !== x2 && (t.i = e.index_.toString()), t;
  }
  var ReadonlyRestClient = class _ReadonlyRestClient extends ServerActions {
    reportStats(e) {
      throw new Error("Method not implemented.");
    }
    static getListenId_(e, t) {
      return void 0 !== t ? "tag$" + t : (assert(e._queryParams.isDefault(), "should have a tag if it's not a default query."), e._path.toString());
    }
    constructor(e, t, n, r) {
      super(), this.repoInfo_ = e, this.onDataUpdate_ = t, this.authTokenProvider_ = n, this.appCheckTokenProvider_ = r, this.log_ = logWrapper("p:rest:"), this.listens_ = {};
    }
    listen(e, t, n, r) {
      const i2 = e._path.toString();
      this.log_("Listen called for " + i2 + " " + e._queryIdentifier);
      const o3 = _ReadonlyRestClient.getListenId_(e, n), s3 = {};
      this.listens_[o3] = s3;
      const a3 = queryParamsToRestQueryStringParameters(e._queryParams);
      this.restRequest_(i2 + ".json", a3, ((e2, t2) => {
        let a4 = t2;
        if (404 === e2 && (a4 = null, e2 = null), null === e2 && this.onDataUpdate_(i2, a4, false, n), safeGet(this.listens_, o3) === s3) {
          let t3;
          t3 = e2 ? 401 === e2 ? "permission_denied" : "rest_error:" + e2 : "ok", r(t3, null);
        }
      }));
    }
    unlisten(e, t) {
      const n = _ReadonlyRestClient.getListenId_(e, t);
      delete this.listens_[n];
    }
    get(e) {
      const t = queryParamsToRestQueryStringParameters(e._queryParams), n = e._path.toString(), r = new Deferred2();
      return this.restRequest_(n + ".json", t, ((e2, t2) => {
        let i2 = t2;
        404 === e2 && (i2 = null, e2 = null), null === e2 ? (this.onDataUpdate_(n, i2, false, null), r.resolve(i2)) : r.reject(new Error(i2));
      })), r.promise;
    }
    refreshAuthToken(e) {
    }
    restRequest_(e, t = {}, n) {
      return t.format = "export", Promise.all([this.authTokenProvider_.getToken(false), this.appCheckTokenProvider_.getToken(false)]).then((([r, i2]) => {
        r && r.accessToken && (t.auth = r.accessToken), i2 && i2.token && (t.ac = i2.token);
        const o3 = (this.repoInfo_.secure ? "https://" : "http://") + this.repoInfo_.host + e + "?ns=" + this.repoInfo_.namespace + (function querystring2(e2) {
          const t2 = [];
          for (const [n2, r2] of Object.entries(e2)) Array.isArray(r2) ? r2.forEach(((e3) => {
            t2.push(encodeURIComponent(n2) + "=" + encodeURIComponent(e3));
          })) : t2.push(encodeURIComponent(n2) + "=" + encodeURIComponent(r2));
          return t2.length ? "&" + t2.join("&") : "";
        })(t);
        this.log_("Sending REST request for " + o3);
        const s3 = new XMLHttpRequest();
        s3.onreadystatechange = () => {
          if (n && 4 === s3.readyState) {
            this.log_("REST Response for " + o3 + " received. status:", s3.status, "response:", s3.responseText);
            let e2 = null;
            if (s3.status >= 200 && s3.status < 300) {
              try {
                e2 = jsonEval(s3.responseText);
              } catch (e3) {
                warn("Failed to parse JSON response for " + o3 + ": " + s3.responseText);
              }
              n(null, e2);
            } else 401 !== s3.status && 404 !== s3.status && warn("Got unsuccessful REST response for " + o3 + " Status: " + s3.status), n(s3.status);
            n = null;
          }
        }, s3.open("GET", o3, true), s3.send();
      }));
    }
  };
  var SnapshotHolder = class {
    constructor() {
      this.rootNode_ = ChildrenNode.EMPTY_NODE;
    }
    getNode(e) {
      return this.rootNode_.getChild(e);
    }
    updateSnapshot(e, t) {
      this.rootNode_ = this.rootNode_.updateChild(e, t);
    }
  };
  function newSparseSnapshotTree() {
    return { value: null, children: /* @__PURE__ */ new Map() };
  }
  function sparseSnapshotTreeRemember(e, t, n) {
    if (pathIsEmpty(t)) e.value = n, e.children.clear();
    else if (null !== e.value) e.value = e.value.updateChild(t, n);
    else {
      const r = pathGetFront(t);
      e.children.has(r) || e.children.set(r, newSparseSnapshotTree());
      sparseSnapshotTreeRemember(e.children.get(r), t = pathPopFront(t), n);
    }
  }
  function sparseSnapshotTreeForget(e, t) {
    if (pathIsEmpty(t)) return e.value = null, e.children.clear(), true;
    if (null !== e.value) {
      if (e.value.isLeafNode()) return false;
      {
        const n = e.value;
        return e.value = null, n.forEachChild(x2, ((t2, n2) => {
          sparseSnapshotTreeRemember(e, new Path(t2), n2);
        })), sparseSnapshotTreeForget(e, t);
      }
    }
    if (e.children.size > 0) {
      const n = pathGetFront(t);
      if (t = pathPopFront(t), e.children.has(n)) {
        sparseSnapshotTreeForget(e.children.get(n), t) && e.children.delete(n);
      }
      return 0 === e.children.size;
    }
    return true;
  }
  function sparseSnapshotTreeForEachTree(e, t, n) {
    null !== e.value ? n(t, e.value) : (function sparseSnapshotTreeForEachChild(e2, t2) {
      e2.children.forEach(((e3, n2) => {
        t2(n2, e3);
      }));
    })(e, ((e2, r) => {
      sparseSnapshotTreeForEachTree(r, new Path(t.toString() + "/" + e2), n);
    }));
  }
  var StatsListener = class {
    constructor(e) {
      this.collection_ = e, this.last_ = null;
    }
    get() {
      const e = this.collection_.get(), t = Object.assign({}, e);
      return this.last_ && each(this.last_, ((e2, n) => {
        t[e2] = t[e2] - n;
      })), this.last_ = e, t;
    }
  };
  var StatsReporter = class {
    constructor(e, t) {
      this.server_ = t, this.statsToReport_ = {}, this.statsListener_ = new StatsListener(e);
      const n = 1e4 + 2e4 * Math.random();
      setTimeoutNonBlocking(this.reportStats_.bind(this), Math.floor(n));
    }
    reportStats_() {
      const e = this.statsListener_.get(), t = {};
      let n = false;
      each(e, ((e2, r) => {
        r > 0 && contains(this.statsToReport_, e2) && (t[e2] = r, n = true);
      })), n && this.server_.reportStats(t), setTimeoutNonBlocking(this.reportStats_.bind(this), Math.floor(2 * Math.random() * 3e5));
    }
  };
  var q2;
  function newOperationSourceServerTaggedQuery(e) {
    return { fromUser: false, fromServer: true, queryId: e, tagged: true };
  }
  !(function(e) {
    e[e.OVERWRITE = 0] = "OVERWRITE", e[e.MERGE = 1] = "MERGE", e[e.ACK_USER_WRITE = 2] = "ACK_USER_WRITE", e[e.LISTEN_COMPLETE = 3] = "LISTEN_COMPLETE";
  })(q2 || (q2 = {}));
  var AckUserWrite = class _AckUserWrite {
    constructor(e, t, n) {
      this.path = e, this.affectedTree = t, this.revert = n, this.type = q2.ACK_USER_WRITE, this.source = { fromUser: true, fromServer: false, queryId: null, tagged: false };
    }
    operationForChild(e) {
      if (pathIsEmpty(this.path)) {
        if (null != this.affectedTree.value) return assert(this.affectedTree.children.isEmpty(), "affectedTree should not have overlapping affected paths."), this;
        {
          const t = this.affectedTree.subtree(new Path(e));
          return new _AckUserWrite(newEmptyPath(), t, this.revert);
        }
      }
      return assert(pathGetFront(this.path) === e, "operationForChild called for unrelated child."), new _AckUserWrite(pathPopFront(this.path), this.affectedTree, this.revert);
    }
  };
  var ListenComplete = class _ListenComplete {
    constructor(e, t) {
      this.source = e, this.path = t, this.type = q2.LISTEN_COMPLETE;
    }
    operationForChild(e) {
      return pathIsEmpty(this.path) ? new _ListenComplete(this.source, newEmptyPath()) : new _ListenComplete(this.source, pathPopFront(this.path));
    }
  };
  var Overwrite = class _Overwrite {
    constructor(e, t, n) {
      this.source = e, this.path = t, this.snap = n, this.type = q2.OVERWRITE;
    }
    operationForChild(e) {
      return pathIsEmpty(this.path) ? new _Overwrite(this.source, newEmptyPath(), this.snap.getImmediateChild(e)) : new _Overwrite(this.source, pathPopFront(this.path), this.snap);
    }
  };
  var Merge = class _Merge {
    constructor(e, t, n) {
      this.source = e, this.path = t, this.children = n, this.type = q2.MERGE;
    }
    operationForChild(e) {
      if (pathIsEmpty(this.path)) {
        const t = this.children.subtree(new Path(e));
        return t.isEmpty() ? null : t.value ? new Overwrite(this.source, newEmptyPath(), t.value) : new _Merge(this.source, newEmptyPath(), t);
      }
      return assert(pathGetFront(this.path) === e, "Can't get a merge for a child not on the path of the operation"), new _Merge(this.source, pathPopFront(this.path), this.children);
    }
    toString() {
      return "Operation(" + this.path + ": " + this.source.toString() + " merge: " + this.children.toString() + ")";
    }
  };
  var CacheNode = class {
    constructor(e, t, n) {
      this.node_ = e, this.fullyInitialized_ = t, this.filtered_ = n;
    }
    isFullyInitialized() {
      return this.fullyInitialized_;
    }
    isFiltered() {
      return this.filtered_;
    }
    isCompleteForPath(e) {
      if (pathIsEmpty(e)) return this.isFullyInitialized() && !this.filtered_;
      const t = pathGetFront(e);
      return this.isCompleteForChild(t);
    }
    isCompleteForChild(e) {
      return this.isFullyInitialized() && !this.filtered_ || this.node_.hasChild(e);
    }
    getNode() {
      return this.node_;
    }
  };
  var EventGenerator = class {
    constructor(e) {
      this.query_ = e, this.index_ = this.query_._queryParams.getIndex();
    }
  };
  function eventGeneratorGenerateEventsForType(e, t, n, r, i2, o3) {
    const s3 = r.filter(((e2) => e2.type === n));
    s3.sort(((t2, n2) => (function eventGeneratorCompareChanges(e2, t3, n3) {
      if (null == t3.childName || null == n3.childName) throw assertionError("Should only compare child_ events.");
      const r2 = new NamedNode(t3.childName, t3.snapshotNode), i3 = new NamedNode(n3.childName, n3.snapshotNode);
      return e2.index_.compare(r2, i3);
    })(e, t2, n2))), s3.forEach(((n2) => {
      const r2 = (function eventGeneratorMaterializeSingleChange(e2, t2, n3) {
        return "value" === t2.type || "child_removed" === t2.type || (t2.prevName = n3.getPredecessorChildName(t2.childName, t2.snapshotNode, e2.index_)), t2;
      })(e, n2, o3);
      i2.forEach(((i3) => {
        i3.respondsTo(n2.type) && t.push(i3.createEvent(r2, e.query_));
      }));
    }));
  }
  function newViewCache(e, t) {
    return { eventCache: e, serverCache: t };
  }
  function viewCacheUpdateEventSnap(e, t, n, r) {
    return newViewCache(new CacheNode(t, n, r), e.serverCache);
  }
  function viewCacheUpdateServerSnap(e, t, n, r) {
    return newViewCache(e.eventCache, new CacheNode(t, n, r));
  }
  function viewCacheGetCompleteEventSnap(e) {
    return e.eventCache.isFullyInitialized() ? e.eventCache.getNode() : null;
  }
  function viewCacheGetCompleteServerSnap(e) {
    return e.serverCache.isFullyInitialized() ? e.serverCache.getNode() : null;
  }
  var G2;
  var ImmutableTree = class _ImmutableTree {
    static fromObject(e) {
      let t = new _ImmutableTree(null);
      return each(e, ((e2, n) => {
        t = t.set(new Path(e2), n);
      })), t;
    }
    constructor(e, t = (() => (G2 || (G2 = new SortedMap(stringCompare)), G2))()) {
      this.value = e, this.children = t;
    }
    isEmpty() {
      return null === this.value && this.children.isEmpty();
    }
    findRootMostMatchingPathAndValue(e, t) {
      if (null != this.value && t(this.value)) return { path: newEmptyPath(), value: this.value };
      if (pathIsEmpty(e)) return null;
      {
        const n = pathGetFront(e), r = this.children.get(n);
        if (null !== r) {
          const i2 = r.findRootMostMatchingPathAndValue(pathPopFront(e), t);
          if (null != i2) {
            return { path: pathChild(new Path(n), i2.path), value: i2.value };
          }
          return null;
        }
        return null;
      }
    }
    findRootMostValueAndPath(e) {
      return this.findRootMostMatchingPathAndValue(e, (() => true));
    }
    subtree(e) {
      if (pathIsEmpty(e)) return this;
      {
        const t = pathGetFront(e), n = this.children.get(t);
        return null !== n ? n.subtree(pathPopFront(e)) : new _ImmutableTree(null);
      }
    }
    set(e, t) {
      if (pathIsEmpty(e)) return new _ImmutableTree(t, this.children);
      {
        const n = pathGetFront(e), r = (this.children.get(n) || new _ImmutableTree(null)).set(pathPopFront(e), t), i2 = this.children.insert(n, r);
        return new _ImmutableTree(this.value, i2);
      }
    }
    remove(e) {
      if (pathIsEmpty(e)) return this.children.isEmpty() ? new _ImmutableTree(null) : new _ImmutableTree(null, this.children);
      {
        const t = pathGetFront(e), n = this.children.get(t);
        if (n) {
          const r = n.remove(pathPopFront(e));
          let i2;
          return i2 = r.isEmpty() ? this.children.remove(t) : this.children.insert(t, r), null === this.value && i2.isEmpty() ? new _ImmutableTree(null) : new _ImmutableTree(this.value, i2);
        }
        return this;
      }
    }
    get(e) {
      if (pathIsEmpty(e)) return this.value;
      {
        const t = pathGetFront(e), n = this.children.get(t);
        return n ? n.get(pathPopFront(e)) : null;
      }
    }
    setTree(e, t) {
      if (pathIsEmpty(e)) return t;
      {
        const n = pathGetFront(e), r = (this.children.get(n) || new _ImmutableTree(null)).setTree(pathPopFront(e), t);
        let i2;
        return i2 = r.isEmpty() ? this.children.remove(n) : this.children.insert(n, r), new _ImmutableTree(this.value, i2);
      }
    }
    fold(e) {
      return this.fold_(newEmptyPath(), e);
    }
    fold_(e, t) {
      const n = {};
      return this.children.inorderTraversal(((r, i2) => {
        n[r] = i2.fold_(pathChild(e, r), t);
      })), t(e, this.value, n);
    }
    findOnPath(e, t) {
      return this.findOnPath_(e, newEmptyPath(), t);
    }
    findOnPath_(e, t, n) {
      const r = !!this.value && n(t, this.value);
      if (r) return r;
      if (pathIsEmpty(e)) return null;
      {
        const r2 = pathGetFront(e), i2 = this.children.get(r2);
        return i2 ? i2.findOnPath_(pathPopFront(e), pathChild(t, r2), n) : null;
      }
    }
    foreachOnPath(e, t) {
      return this.foreachOnPath_(e, newEmptyPath(), t);
    }
    foreachOnPath_(e, t, n) {
      if (pathIsEmpty(e)) return this;
      {
        this.value && n(t, this.value);
        const r = pathGetFront(e), i2 = this.children.get(r);
        return i2 ? i2.foreachOnPath_(pathPopFront(e), pathChild(t, r), n) : new _ImmutableTree(null);
      }
    }
    foreach(e) {
      this.foreach_(newEmptyPath(), e);
    }
    foreach_(e, t) {
      this.children.inorderTraversal(((n, r) => {
        r.foreach_(pathChild(e, n), t);
      })), this.value && t(e, this.value);
    }
    foreachChild(e) {
      this.children.inorderTraversal(((t, n) => {
        n.value && e(t, n.value);
      }));
    }
  };
  var CompoundWrite = class _CompoundWrite {
    constructor(e) {
      this.writeTree_ = e;
    }
    static empty() {
      return new _CompoundWrite(new ImmutableTree(null));
    }
  };
  function compoundWriteAddWrite(e, t, n) {
    if (pathIsEmpty(t)) return new CompoundWrite(new ImmutableTree(n));
    {
      const r = e.writeTree_.findRootMostValueAndPath(t);
      if (null != r) {
        const i2 = r.path;
        let o3 = r.value;
        const s3 = newRelativePath(i2, t);
        return o3 = o3.updateChild(s3, n), new CompoundWrite(e.writeTree_.set(i2, o3));
      }
      {
        const r2 = new ImmutableTree(n), i2 = e.writeTree_.setTree(t, r2);
        return new CompoundWrite(i2);
      }
    }
  }
  function compoundWriteAddWrites(e, t, n) {
    let r = e;
    return each(n, ((e2, n2) => {
      r = compoundWriteAddWrite(r, pathChild(t, e2), n2);
    })), r;
  }
  function compoundWriteRemoveWrite(e, t) {
    if (pathIsEmpty(t)) return CompoundWrite.empty();
    {
      const n = e.writeTree_.setTree(t, new ImmutableTree(null));
      return new CompoundWrite(n);
    }
  }
  function compoundWriteHasCompleteWrite(e, t) {
    return null != compoundWriteGetCompleteNode(e, t);
  }
  function compoundWriteGetCompleteNode(e, t) {
    const n = e.writeTree_.findRootMostValueAndPath(t);
    return null != n ? e.writeTree_.get(n.path).getChild(newRelativePath(n.path, t)) : null;
  }
  function compoundWriteGetCompleteChildren(e) {
    const t = [], n = e.writeTree_.value;
    return null != n ? n.isLeafNode() || n.forEachChild(x2, ((e2, n2) => {
      t.push(new NamedNode(e2, n2));
    })) : e.writeTree_.children.inorderTraversal(((e2, n2) => {
      null != n2.value && t.push(new NamedNode(e2, n2.value));
    })), t;
  }
  function compoundWriteChildCompoundWrite(e, t) {
    if (pathIsEmpty(t)) return e;
    {
      const n = compoundWriteGetCompleteNode(e, t);
      return new CompoundWrite(null != n ? new ImmutableTree(n) : e.writeTree_.subtree(t));
    }
  }
  function compoundWriteIsEmpty(e) {
    return e.writeTree_.isEmpty();
  }
  function compoundWriteApply(e, t) {
    return applySubtreeWrite(newEmptyPath(), e.writeTree_, t);
  }
  function applySubtreeWrite(e, t, n) {
    if (null != t.value) return n.updateChild(e, t.value);
    {
      let r = null;
      return t.children.inorderTraversal(((t2, i2) => {
        ".priority" === t2 ? (assert(null !== i2.value, "Priority writes must always be leaf nodes"), r = i2.value) : n = applySubtreeWrite(pathChild(e, t2), i2, n);
      })), n.getChild(e).isEmpty() || null === r || (n = n.updateChild(pathChild(e, ".priority"), r)), n;
    }
  }
  function writeTreeChildWrites(e, t) {
    return newWriteTreeRef(t, e);
  }
  function writeTreeRemoveWrite(e, t) {
    const n = e.allWrites.findIndex(((e2) => e2.writeId === t));
    assert(n >= 0, "removeWrite called with nonexistent writeId.");
    const r = e.allWrites[n];
    e.allWrites.splice(n, 1);
    let i2 = r.visible, o3 = false, s3 = e.allWrites.length - 1;
    for (; i2 && s3 >= 0; ) {
      const t2 = e.allWrites[s3];
      t2.visible && (s3 >= n && writeTreeRecordContainsPath_(t2, r.path) ? i2 = false : pathContains(r.path, t2.path) && (o3 = true)), s3--;
    }
    if (i2) {
      if (o3) return (function writeTreeResetTree_(e2) {
        e2.visibleWrites = writeTreeLayerTree_(e2.allWrites, writeTreeDefaultFilter_, newEmptyPath()), e2.allWrites.length > 0 ? e2.lastWriteId = e2.allWrites[e2.allWrites.length - 1].writeId : e2.lastWriteId = -1;
      })(e), true;
      if (r.snap) e.visibleWrites = compoundWriteRemoveWrite(e.visibleWrites, r.path);
      else {
        each(r.children, ((t2) => {
          e.visibleWrites = compoundWriteRemoveWrite(e.visibleWrites, pathChild(r.path, t2));
        }));
      }
      return true;
    }
    return false;
  }
  function writeTreeRecordContainsPath_(e, t) {
    if (e.snap) return pathContains(e.path, t);
    for (const n in e.children) if (e.children.hasOwnProperty(n) && pathContains(pathChild(e.path, n), t)) return true;
    return false;
  }
  function writeTreeDefaultFilter_(e) {
    return e.visible;
  }
  function writeTreeLayerTree_(e, t, n) {
    let r = CompoundWrite.empty();
    for (let i2 = 0; i2 < e.length; ++i2) {
      const o3 = e[i2];
      if (t(o3)) {
        const e2 = o3.path;
        let t2;
        if (o3.snap) pathContains(n, e2) ? (t2 = newRelativePath(n, e2), r = compoundWriteAddWrite(r, t2, o3.snap)) : pathContains(e2, n) && (t2 = newRelativePath(e2, n), r = compoundWriteAddWrite(r, newEmptyPath(), o3.snap.getChild(t2)));
        else {
          if (!o3.children) throw assertionError("WriteRecord should have .snap or .children");
          if (pathContains(n, e2)) t2 = newRelativePath(n, e2), r = compoundWriteAddWrites(r, t2, o3.children);
          else if (pathContains(e2, n)) if (t2 = newRelativePath(e2, n), pathIsEmpty(t2)) r = compoundWriteAddWrites(r, newEmptyPath(), o3.children);
          else {
            const e3 = safeGet(o3.children, pathGetFront(t2));
            if (e3) {
              const n2 = e3.getChild(pathPopFront(t2));
              r = compoundWriteAddWrite(r, newEmptyPath(), n2);
            }
          }
        }
      }
    }
    return r;
  }
  function writeTreeCalcCompleteEventCache(e, t, n, r, i2) {
    if (r || i2) {
      const o3 = compoundWriteChildCompoundWrite(e.visibleWrites, t);
      if (!i2 && compoundWriteIsEmpty(o3)) return n;
      if (i2 || null != n || compoundWriteHasCompleteWrite(o3, newEmptyPath())) {
        const filter = function(e2) {
          return (e2.visible || i2) && (!r || !~r.indexOf(e2.writeId)) && (pathContains(e2.path, t) || pathContains(t, e2.path));
        };
        return compoundWriteApply(writeTreeLayerTree_(e.allWrites, filter, t), n || ChildrenNode.EMPTY_NODE);
      }
      return null;
    }
    {
      const r2 = compoundWriteGetCompleteNode(e.visibleWrites, t);
      if (null != r2) return r2;
      {
        const r3 = compoundWriteChildCompoundWrite(e.visibleWrites, t);
        if (compoundWriteIsEmpty(r3)) return n;
        if (null != n || compoundWriteHasCompleteWrite(r3, newEmptyPath())) {
          return compoundWriteApply(r3, n || ChildrenNode.EMPTY_NODE);
        }
        return null;
      }
    }
  }
  function writeTreeRefCalcCompleteEventCache(e, t, n, r) {
    return writeTreeCalcCompleteEventCache(e.writeTree, e.treePath, t, n, r);
  }
  function writeTreeRefCalcCompleteEventChildren(e, t) {
    return (function writeTreeCalcCompleteEventChildren(e2, t2, n) {
      let r = ChildrenNode.EMPTY_NODE;
      const i2 = compoundWriteGetCompleteNode(e2.visibleWrites, t2);
      if (i2) return i2.isLeafNode() || i2.forEachChild(x2, ((e3, t3) => {
        r = r.updateImmediateChild(e3, t3);
      })), r;
      if (n) {
        const i3 = compoundWriteChildCompoundWrite(e2.visibleWrites, t2);
        return n.forEachChild(x2, ((e3, t3) => {
          const n2 = compoundWriteApply(compoundWriteChildCompoundWrite(i3, new Path(e3)), t3);
          r = r.updateImmediateChild(e3, n2);
        })), compoundWriteGetCompleteChildren(i3).forEach(((e3) => {
          r = r.updateImmediateChild(e3.name, e3.node);
        })), r;
      }
      return compoundWriteGetCompleteChildren(compoundWriteChildCompoundWrite(e2.visibleWrites, t2)).forEach(((e3) => {
        r = r.updateImmediateChild(e3.name, e3.node);
      })), r;
    })(e.writeTree, e.treePath, t);
  }
  function writeTreeRefCalcEventCacheAfterServerOverwrite(e, t, n, r) {
    return (function writeTreeCalcEventCacheAfterServerOverwrite(e2, t2, n2, r2, i2) {
      assert(r2 || i2, "Either existingEventSnap or existingServerSnap must exist");
      const o3 = pathChild(t2, n2);
      if (compoundWriteHasCompleteWrite(e2.visibleWrites, o3)) return null;
      {
        const t3 = compoundWriteChildCompoundWrite(e2.visibleWrites, o3);
        return compoundWriteIsEmpty(t3) ? i2.getChild(n2) : compoundWriteApply(t3, i2.getChild(n2));
      }
    })(e.writeTree, e.treePath, t, n, r);
  }
  function writeTreeRefShadowingWrite(e, t) {
    return (function writeTreeShadowingWrite(e2, t2) {
      return compoundWriteGetCompleteNode(e2.visibleWrites, t2);
    })(e.writeTree, pathChild(e.treePath, t));
  }
  function writeTreeRefCalcIndexedSlice(e, t, n, r, i2, o3) {
    return (function writeTreeCalcIndexedSlice(e2, t2, n2, r2, i3, o4, s3) {
      let a3;
      const l3 = compoundWriteChildCompoundWrite(e2.visibleWrites, t2), h3 = compoundWriteGetCompleteNode(l3, newEmptyPath());
      if (null != h3) a3 = h3;
      else {
        if (null == n2) return [];
        a3 = compoundWriteApply(l3, n2);
      }
      if (a3 = a3.withIndex(s3), a3.isEmpty() || a3.isLeafNode()) return [];
      {
        const e3 = [], t3 = s3.getCompare(), n3 = o4 ? a3.getReverseIteratorFrom(r2, s3) : a3.getIteratorFrom(r2, s3);
        let l4 = n3.getNext();
        for (; l4 && e3.length < i3; ) 0 !== t3(l4, r2) && e3.push(l4), l4 = n3.getNext();
        return e3;
      }
    })(e.writeTree, e.treePath, t, n, r, i2, o3);
  }
  function writeTreeRefCalcCompleteChild(e, t, n) {
    return (function writeTreeCalcCompleteChild(e2, t2, n2, r) {
      const i2 = pathChild(t2, n2), o3 = compoundWriteGetCompleteNode(e2.visibleWrites, i2);
      if (null != o3) return o3;
      if (r.isCompleteForChild(n2)) return compoundWriteApply(compoundWriteChildCompoundWrite(e2.visibleWrites, i2), r.getNode().getImmediateChild(n2));
      return null;
    })(e.writeTree, e.treePath, t, n);
  }
  function writeTreeRefChild(e, t) {
    return newWriteTreeRef(pathChild(e.treePath, t), e.writeTree);
  }
  function newWriteTreeRef(e, t) {
    return { treePath: e, writeTree: t };
  }
  var ChildChangeAccumulator = class {
    constructor() {
      this.changeMap = /* @__PURE__ */ new Map();
    }
    trackChildChange(e) {
      const t = e.type, n = e.childName;
      assert("child_added" === t || "child_changed" === t || "child_removed" === t, "Only child changes supported for tracking"), assert(".priority" !== n, "Only non-priority child changes can be tracked.");
      const r = this.changeMap.get(n);
      if (r) {
        const i2 = r.type;
        if ("child_added" === t && "child_removed" === i2) this.changeMap.set(n, changeChildChanged(n, e.snapshotNode, r.snapshotNode));
        else if ("child_removed" === t && "child_added" === i2) this.changeMap.delete(n);
        else if ("child_removed" === t && "child_changed" === i2) this.changeMap.set(n, changeChildRemoved(n, r.oldSnap));
        else if ("child_changed" === t && "child_added" === i2) this.changeMap.set(n, changeChildAdded(n, e.snapshotNode));
        else {
          if ("child_changed" !== t || "child_changed" !== i2) throw assertionError("Illegal combination of changes: " + e + " occurred after " + r);
          this.changeMap.set(n, changeChildChanged(n, e.snapshotNode, r.oldSnap));
        }
      } else this.changeMap.set(n, e);
    }
    getChanges() {
      return Array.from(this.changeMap.values());
    }
  };
  var Q = new class NoCompleteChildSource_ {
    getCompleteChild(e) {
      return null;
    }
    getChildAfterChild(e, t, n) {
      return null;
    }
  }();
  var WriteTreeCompleteChildSource = class {
    constructor(e, t, n = null) {
      this.writes_ = e, this.viewCache_ = t, this.optCompleteServerCache_ = n;
    }
    getCompleteChild(e) {
      const t = this.viewCache_.eventCache;
      if (t.isCompleteForChild(e)) return t.getNode().getImmediateChild(e);
      {
        const t2 = null != this.optCompleteServerCache_ ? new CacheNode(this.optCompleteServerCache_, true, false) : this.viewCache_.serverCache;
        return writeTreeRefCalcCompleteChild(this.writes_, e, t2);
      }
    }
    getChildAfterChild(e, t, n) {
      const r = null != this.optCompleteServerCache_ ? this.optCompleteServerCache_ : viewCacheGetCompleteServerSnap(this.viewCache_), i2 = writeTreeRefCalcIndexedSlice(this.writes_, r, t, 1, n, e);
      return 0 === i2.length ? null : i2[0];
    }
  };
  function viewProcessorApplyOperation(e, t, n, r, i2) {
    const o3 = new ChildChangeAccumulator();
    let s3, a3;
    if (n.type === q2.OVERWRITE) {
      const l4 = n;
      l4.source.fromUser ? s3 = viewProcessorApplyUserOverwrite(e, t, l4.path, l4.snap, r, i2, o3) : (assert(l4.source.fromServer, "Unknown source."), a3 = l4.source.tagged || t.serverCache.isFiltered() && !pathIsEmpty(l4.path), s3 = viewProcessorApplyServerOverwrite(e, t, l4.path, l4.snap, r, i2, a3, o3));
    } else if (n.type === q2.MERGE) {
      const l4 = n;
      l4.source.fromUser ? s3 = (function viewProcessorApplyUserMerge(e2, t2, n2, r2, i3, o4, s4) {
        let a4 = t2;
        return r2.foreach(((r3, l5) => {
          const h3 = pathChild(n2, r3);
          viewProcessorCacheHasChild(t2, pathGetFront(h3)) && (a4 = viewProcessorApplyUserOverwrite(e2, a4, h3, l5, i3, o4, s4));
        })), r2.foreach(((r3, l5) => {
          const h3 = pathChild(n2, r3);
          viewProcessorCacheHasChild(t2, pathGetFront(h3)) || (a4 = viewProcessorApplyUserOverwrite(e2, a4, h3, l5, i3, o4, s4));
        })), a4;
      })(e, t, l4.path, l4.children, r, i2, o3) : (assert(l4.source.fromServer, "Unknown source."), a3 = l4.source.tagged || t.serverCache.isFiltered(), s3 = viewProcessorApplyServerMerge(e, t, l4.path, l4.children, r, i2, a3, o3));
    } else if (n.type === q2.ACK_USER_WRITE) {
      const a4 = n;
      s3 = a4.revert ? (function viewProcessorRevertUserWrite(e2, t2, n2, r2, i3, o4) {
        let s4;
        if (null != writeTreeRefShadowingWrite(r2, n2)) return t2;
        {
          const a5 = new WriteTreeCompleteChildSource(r2, t2, i3), l4 = t2.eventCache.getNode();
          let h3;
          if (pathIsEmpty(n2) || ".priority" === pathGetFront(n2)) {
            let n3;
            if (t2.serverCache.isFullyInitialized()) n3 = writeTreeRefCalcCompleteEventCache(r2, viewCacheGetCompleteServerSnap(t2));
            else {
              const e3 = t2.serverCache.getNode();
              assert(e3 instanceof ChildrenNode, "serverChildren would be complete if leaf node"), n3 = writeTreeRefCalcCompleteEventChildren(r2, e3);
            }
            n3 = n3, h3 = e2.filter.updateFullNode(l4, n3, o4);
          } else {
            const i4 = pathGetFront(n2);
            let c3 = writeTreeRefCalcCompleteChild(r2, i4, t2.serverCache);
            null == c3 && t2.serverCache.isCompleteForChild(i4) && (c3 = l4.getImmediateChild(i4)), h3 = null != c3 ? e2.filter.updateChild(l4, i4, c3, pathPopFront(n2), a5, o4) : t2.eventCache.getNode().hasChild(i4) ? e2.filter.updateChild(l4, i4, ChildrenNode.EMPTY_NODE, pathPopFront(n2), a5, o4) : l4, h3.isEmpty() && t2.serverCache.isFullyInitialized() && (s4 = writeTreeRefCalcCompleteEventCache(r2, viewCacheGetCompleteServerSnap(t2)), s4.isLeafNode() && (h3 = e2.filter.updateFullNode(h3, s4, o4)));
          }
          return s4 = t2.serverCache.isFullyInitialized() || null != writeTreeRefShadowingWrite(r2, newEmptyPath()), viewCacheUpdateEventSnap(t2, h3, s4, e2.filter.filtersNodes());
        }
      })(e, t, a4.path, r, i2, o3) : (function viewProcessorAckUserWrite(e2, t2, n2, r2, i3, o4, s4) {
        if (null != writeTreeRefShadowingWrite(i3, n2)) return t2;
        const a5 = t2.serverCache.isFiltered(), l4 = t2.serverCache;
        if (null != r2.value) {
          if (pathIsEmpty(n2) && l4.isFullyInitialized() || l4.isCompleteForPath(n2)) return viewProcessorApplyServerOverwrite(e2, t2, n2, l4.getNode().getChild(n2), i3, o4, a5, s4);
          if (pathIsEmpty(n2)) {
            let r3 = new ImmutableTree(null);
            return l4.getNode().forEachChild(b2, ((e3, t3) => {
              r3 = r3.set(new Path(e3), t3);
            })), viewProcessorApplyServerMerge(e2, t2, n2, r3, i3, o4, a5, s4);
          }
          return t2;
        }
        {
          let h3 = new ImmutableTree(null);
          return r2.foreach(((e3, t3) => {
            const r3 = pathChild(n2, e3);
            l4.isCompleteForPath(r3) && (h3 = h3.set(e3, l4.getNode().getChild(r3)));
          })), viewProcessorApplyServerMerge(e2, t2, n2, h3, i3, o4, a5, s4);
        }
      })(e, t, a4.path, a4.affectedTree, r, i2, o3);
    } else {
      if (n.type !== q2.LISTEN_COMPLETE) throw assertionError("Unknown operation type: " + n.type);
      s3 = (function viewProcessorListenComplete(e2, t2, n2, r2, i3) {
        const o4 = t2.serverCache, s4 = viewCacheUpdateServerSnap(t2, o4.getNode(), o4.isFullyInitialized() || pathIsEmpty(n2), o4.isFiltered());
        return viewProcessorGenerateEventCacheAfterServerEvent(e2, s4, n2, r2, Q, i3);
      })(e, t, n.path, r, o3);
    }
    const l3 = o3.getChanges();
    return (function viewProcessorMaybeAddValueEvent(e2, t2, n2) {
      const r2 = t2.eventCache;
      if (r2.isFullyInitialized()) {
        const i3 = r2.getNode().isLeafNode() || r2.getNode().isEmpty(), o4 = viewCacheGetCompleteEventSnap(e2);
        (n2.length > 0 || !e2.eventCache.isFullyInitialized() || i3 && !r2.getNode().equals(o4) || !r2.getNode().getPriority().equals(o4.getPriority())) && n2.push(changeValue(viewCacheGetCompleteEventSnap(t2)));
      }
    })(t, s3, l3), { viewCache: s3, changes: l3 };
  }
  function viewProcessorGenerateEventCacheAfterServerEvent(e, t, n, r, i2, o3) {
    const s3 = t.eventCache;
    if (null != writeTreeRefShadowingWrite(r, n)) return t;
    {
      let a3, l3;
      if (pathIsEmpty(n)) if (assert(t.serverCache.isFullyInitialized(), "If change path is empty, we must have complete server data"), t.serverCache.isFiltered()) {
        const n2 = viewCacheGetCompleteServerSnap(t), i3 = writeTreeRefCalcCompleteEventChildren(r, n2 instanceof ChildrenNode ? n2 : ChildrenNode.EMPTY_NODE);
        a3 = e.filter.updateFullNode(t.eventCache.getNode(), i3, o3);
      } else {
        const n2 = writeTreeRefCalcCompleteEventCache(r, viewCacheGetCompleteServerSnap(t));
        a3 = e.filter.updateFullNode(t.eventCache.getNode(), n2, o3);
      }
      else {
        const h3 = pathGetFront(n);
        if (".priority" === h3) {
          assert(1 === pathGetLength(n), "Can't have a priority with additional path components");
          const i3 = s3.getNode();
          l3 = t.serverCache.getNode();
          const o4 = writeTreeRefCalcEventCacheAfterServerOverwrite(r, n, i3, l3);
          a3 = null != o4 ? e.filter.updatePriority(i3, o4) : s3.getNode();
        } else {
          const c3 = pathPopFront(n);
          let d3;
          if (s3.isCompleteForChild(h3)) {
            l3 = t.serverCache.getNode();
            const e2 = writeTreeRefCalcEventCacheAfterServerOverwrite(r, n, s3.getNode(), l3);
            d3 = null != e2 ? s3.getNode().getImmediateChild(h3).updateChild(c3, e2) : s3.getNode().getImmediateChild(h3);
          } else d3 = writeTreeRefCalcCompleteChild(r, h3, t.serverCache);
          a3 = null != d3 ? e.filter.updateChild(s3.getNode(), h3, d3, c3, i2, o3) : s3.getNode();
        }
      }
      return viewCacheUpdateEventSnap(t, a3, s3.isFullyInitialized() || pathIsEmpty(n), e.filter.filtersNodes());
    }
  }
  function viewProcessorApplyServerOverwrite(e, t, n, r, i2, o3, s3, a3) {
    const l3 = t.serverCache;
    let h3;
    const c3 = s3 ? e.filter : e.filter.getIndexedFilter();
    if (pathIsEmpty(n)) h3 = c3.updateFullNode(l3.getNode(), r, null);
    else if (c3.filtersNodes() && !l3.isFiltered()) {
      const e2 = l3.getNode().updateChild(n, r);
      h3 = c3.updateFullNode(l3.getNode(), e2, null);
    } else {
      const e2 = pathGetFront(n);
      if (!l3.isCompleteForPath(n) && pathGetLength(n) > 1) return t;
      const i3 = pathPopFront(n), o4 = l3.getNode().getImmediateChild(e2).updateChild(i3, r);
      h3 = ".priority" === e2 ? c3.updatePriority(l3.getNode(), o4) : c3.updateChild(l3.getNode(), e2, o4, i3, Q, null);
    }
    const d3 = viewCacheUpdateServerSnap(t, h3, l3.isFullyInitialized() || pathIsEmpty(n), c3.filtersNodes());
    return viewProcessorGenerateEventCacheAfterServerEvent(e, d3, n, i2, new WriteTreeCompleteChildSource(i2, d3, o3), a3);
  }
  function viewProcessorApplyUserOverwrite(e, t, n, r, i2, o3, s3) {
    const a3 = t.eventCache;
    let l3, h3;
    const c3 = new WriteTreeCompleteChildSource(i2, t, o3);
    if (pathIsEmpty(n)) h3 = e.filter.updateFullNode(t.eventCache.getNode(), r, s3), l3 = viewCacheUpdateEventSnap(t, h3, true, e.filter.filtersNodes());
    else {
      const i3 = pathGetFront(n);
      if (".priority" === i3) h3 = e.filter.updatePriority(t.eventCache.getNode(), r), l3 = viewCacheUpdateEventSnap(t, h3, a3.isFullyInitialized(), a3.isFiltered());
      else {
        const o4 = pathPopFront(n), h4 = a3.getNode().getImmediateChild(i3);
        let d3;
        if (pathIsEmpty(o4)) d3 = r;
        else {
          const e2 = c3.getCompleteChild(i3);
          d3 = null != e2 ? ".priority" === pathGetBack(o4) && e2.getChild(pathParent(o4)).isEmpty() ? e2 : e2.updateChild(o4, r) : ChildrenNode.EMPTY_NODE;
        }
        if (h4.equals(d3)) l3 = t;
        else {
          l3 = viewCacheUpdateEventSnap(t, e.filter.updateChild(a3.getNode(), i3, d3, o4, c3, s3), a3.isFullyInitialized(), e.filter.filtersNodes());
        }
      }
    }
    return l3;
  }
  function viewProcessorCacheHasChild(e, t) {
    return e.eventCache.isCompleteForChild(t);
  }
  function viewProcessorApplyMerge(e, t, n) {
    return n.foreach(((e2, n2) => {
      t = t.updateChild(e2, n2);
    })), t;
  }
  function viewProcessorApplyServerMerge(e, t, n, r, i2, o3, s3, a3) {
    if (t.serverCache.getNode().isEmpty() && !t.serverCache.isFullyInitialized()) return t;
    let l3, h3 = t;
    l3 = pathIsEmpty(n) ? r : new ImmutableTree(null).setTree(n, r);
    const c3 = t.serverCache.getNode();
    return l3.children.inorderTraversal(((n2, r2) => {
      if (c3.hasChild(n2)) {
        const l4 = viewProcessorApplyMerge(0, t.serverCache.getNode().getImmediateChild(n2), r2);
        h3 = viewProcessorApplyServerOverwrite(e, h3, new Path(n2), l4, i2, o3, s3, a3);
      }
    })), l3.children.inorderTraversal(((n2, r2) => {
      const l4 = !t.serverCache.isCompleteForChild(n2) && null === r2.value;
      if (!c3.hasChild(n2) && !l4) {
        const l5 = viewProcessorApplyMerge(0, t.serverCache.getNode().getImmediateChild(n2), r2);
        h3 = viewProcessorApplyServerOverwrite(e, h3, new Path(n2), l5, i2, o3, s3, a3);
      }
    })), h3;
  }
  var View = class {
    constructor(e, t) {
      this.query_ = e, this.eventRegistrations_ = [];
      const n = this.query_._queryParams, r = new IndexedFilter(n.getIndex()), i2 = (function queryParamsGetNodeFilter(e2) {
        return e2.loadsAllData() ? new IndexedFilter(e2.getIndex()) : e2.hasLimit() ? new LimitedFilter(e2) : new RangedFilter(e2);
      })(n);
      this.processor_ = /* @__PURE__ */ (function newViewProcessor(e2) {
        return { filter: e2 };
      })(i2);
      const o3 = t.serverCache, s3 = t.eventCache, a3 = r.updateFullNode(ChildrenNode.EMPTY_NODE, o3.getNode(), null), l3 = i2.updateFullNode(ChildrenNode.EMPTY_NODE, s3.getNode(), null), h3 = new CacheNode(a3, o3.isFullyInitialized(), r.filtersNodes()), c3 = new CacheNode(l3, s3.isFullyInitialized(), i2.filtersNodes());
      this.viewCache_ = newViewCache(c3, h3), this.eventGenerator_ = new EventGenerator(this.query_);
    }
    get query() {
      return this.query_;
    }
  };
  function viewGetCompleteServerCache(e, t) {
    const n = viewCacheGetCompleteServerSnap(e.viewCache_);
    return n && (e.query._queryParams.loadsAllData() || !pathIsEmpty(t) && !n.getImmediateChild(pathGetFront(t)).isEmpty()) ? n.getChild(t) : null;
  }
  function viewIsEmpty(e) {
    return 0 === e.eventRegistrations_.length;
  }
  function viewRemoveEventRegistration(e, t, n) {
    const r = [];
    if (n) {
      assert(null == t, "A cancel should cancel all event registrations.");
      const i2 = e.query._path;
      e.eventRegistrations_.forEach(((e2) => {
        const t2 = e2.createCancelEvent(n, i2);
        t2 && r.push(t2);
      }));
    }
    if (t) {
      let n2 = [];
      for (let r2 = 0; r2 < e.eventRegistrations_.length; ++r2) {
        const i2 = e.eventRegistrations_[r2];
        if (i2.matches(t)) {
          if (t.hasAnyCallback()) {
            n2 = n2.concat(e.eventRegistrations_.slice(r2 + 1));
            break;
          }
        } else n2.push(i2);
      }
      e.eventRegistrations_ = n2;
    } else e.eventRegistrations_ = [];
    return r;
  }
  function viewApplyOperation(e, t, n, r) {
    t.type === q2.MERGE && null !== t.source.queryId && (assert(viewCacheGetCompleteServerSnap(e.viewCache_), "We should always have a full cache before handling merges"), assert(viewCacheGetCompleteEventSnap(e.viewCache_), "Missing event cache, even though we have a server cache"));
    const i2 = e.viewCache_, o3 = viewProcessorApplyOperation(e.processor_, i2, t, n, r);
    return (function viewProcessorAssertIndexed(e2, t2) {
      assert(t2.eventCache.getNode().isIndexed(e2.filter.getIndex()), "Event snap not indexed"), assert(t2.serverCache.getNode().isIndexed(e2.filter.getIndex()), "Server snap not indexed");
    })(e.processor_, o3.viewCache), assert(o3.viewCache.serverCache.isFullyInitialized() || !i2.serverCache.isFullyInitialized(), "Once a server snap is complete, it should never go back"), e.viewCache_ = o3.viewCache, viewGenerateEventsForChanges_(e, o3.changes, o3.viewCache.eventCache.getNode(), null);
  }
  function viewGenerateEventsForChanges_(e, t, n, r) {
    const i2 = r ? [r] : e.eventRegistrations_;
    return (function eventGeneratorGenerateEventsForChanges(e2, t2, n2, r2) {
      const i3 = [], o3 = [];
      return t2.forEach(((t3) => {
        "child_changed" === t3.type && e2.index_.indexedValueChanged(t3.oldSnap, t3.snapshotNode) && o3.push(/* @__PURE__ */ (function changeChildMoved(e3, t4) {
          return { type: "child_moved", snapshotNode: t4, childName: e3 };
        })(t3.childName, t3.snapshotNode));
      })), eventGeneratorGenerateEventsForType(e2, i3, "child_removed", t2, r2, n2), eventGeneratorGenerateEventsForType(e2, i3, "child_added", t2, r2, n2), eventGeneratorGenerateEventsForType(e2, i3, "child_moved", o3, r2, n2), eventGeneratorGenerateEventsForType(e2, i3, "child_changed", t2, r2, n2), eventGeneratorGenerateEventsForType(e2, i3, "value", t2, r2, n2), i3;
    })(e.eventGenerator_, t, n, i2);
  }
  var B2;
  var U2;
  var SyncPoint = class {
    constructor() {
      this.views = /* @__PURE__ */ new Map();
    }
  };
  function syncPointApplyOperation(e, t, n, r) {
    const i2 = t.source.queryId;
    if (null !== i2) {
      const o3 = e.views.get(i2);
      return assert(null != o3, "SyncTree gave us an op for an invalid query."), viewApplyOperation(o3, t, n, r);
    }
    {
      let i3 = [];
      for (const o3 of e.views.values()) i3 = i3.concat(viewApplyOperation(o3, t, n, r));
      return i3;
    }
  }
  function syncPointGetView(e, t, n, r, i2) {
    const o3 = t._queryIdentifier, s3 = e.views.get(o3);
    if (!s3) {
      let e2 = writeTreeRefCalcCompleteEventCache(n, i2 ? r : null), o4 = false;
      e2 ? o4 = true : r instanceof ChildrenNode ? (e2 = writeTreeRefCalcCompleteEventChildren(n, r), o4 = false) : (e2 = ChildrenNode.EMPTY_NODE, o4 = false);
      const s4 = newViewCache(new CacheNode(e2, o4, false), new CacheNode(r, i2, false));
      return new View(t, s4);
    }
    return s3;
  }
  function syncPointAddEventRegistration(e, t, n, r, i2, o3) {
    const s3 = syncPointGetView(e, t, r, i2, o3);
    return e.views.has(t._queryIdentifier) || e.views.set(t._queryIdentifier, s3), (function viewAddEventRegistration(e2, t2) {
      e2.eventRegistrations_.push(t2);
    })(s3, n), (function viewGetInitialEvents(e2, t2) {
      const n2 = e2.viewCache_.eventCache, r2 = [];
      n2.getNode().isLeafNode() || n2.getNode().forEachChild(x2, ((e3, t3) => {
        r2.push(changeChildAdded(e3, t3));
      }));
      return n2.isFullyInitialized() && r2.push(changeValue(n2.getNode())), viewGenerateEventsForChanges_(e2, r2, n2.getNode(), t2);
    })(s3, n);
  }
  function syncPointRemoveEventRegistration(e, t, n, r) {
    const i2 = t._queryIdentifier, o3 = [];
    let s3 = [];
    const a3 = syncPointHasCompleteView(e);
    if ("default" === i2) for (const [t2, i3] of e.views.entries()) s3 = s3.concat(viewRemoveEventRegistration(i3, n, r)), viewIsEmpty(i3) && (e.views.delete(t2), i3.query._queryParams.loadsAllData() || o3.push(i3.query));
    else {
      const t2 = e.views.get(i2);
      t2 && (s3 = s3.concat(viewRemoveEventRegistration(t2, n, r)), viewIsEmpty(t2) && (e.views.delete(i2), t2.query._queryParams.loadsAllData() || o3.push(t2.query)));
    }
    return a3 && !syncPointHasCompleteView(e) && o3.push(new ((function syncPointGetReferenceConstructor() {
      return assert(B2, "Reference.ts has not been loaded"), B2;
    })())(t._repo, t._path)), { removed: o3, events: s3 };
  }
  function syncPointGetQueryViews(e) {
    const t = [];
    for (const n of e.views.values()) n.query._queryParams.loadsAllData() || t.push(n);
    return t;
  }
  function syncPointGetCompleteServerCache(e, t) {
    let n = null;
    for (const r of e.views.values()) n = n || viewGetCompleteServerCache(r, t);
    return n;
  }
  function syncPointViewForQuery(e, t) {
    if (t._queryParams.loadsAllData()) return syncPointGetCompleteView(e);
    {
      const n = t._queryIdentifier;
      return e.views.get(n);
    }
  }
  function syncPointViewExistsForQuery(e, t) {
    return null != syncPointViewForQuery(e, t);
  }
  function syncPointHasCompleteView(e) {
    return null != syncPointGetCompleteView(e);
  }
  function syncPointGetCompleteView(e) {
    for (const t of e.views.values()) if (t.query._queryParams.loadsAllData()) return t;
    return null;
  }
  var V2 = 1;
  var SyncTree = class {
    constructor(e) {
      this.listenProvider_ = e, this.syncPointTree_ = new ImmutableTree(null), this.pendingWriteTree_ = (function newWriteTree() {
        return { visibleWrites: CompoundWrite.empty(), allWrites: [], lastWriteId: -1 };
      })(), this.tagToQueryMap = /* @__PURE__ */ new Map(), this.queryToTagMap = /* @__PURE__ */ new Map();
    }
  };
  function syncTreeApplyUserOverwrite(e, t, n, r, i2) {
    return (function writeTreeAddOverwrite(e2, t2, n2, r2, i3) {
      assert(r2 > e2.lastWriteId, "Stacking an older write on top of newer ones"), void 0 === i3 && (i3 = true), e2.allWrites.push({ path: t2, snap: n2, writeId: r2, visible: i3 }), i3 && (e2.visibleWrites = compoundWriteAddWrite(e2.visibleWrites, t2, n2)), e2.lastWriteId = r2;
    })(e.pendingWriteTree_, t, n, r, i2), i2 ? syncTreeApplyOperationToSyncPoints_(e, new Overwrite({ fromUser: true, fromServer: false, queryId: null, tagged: false }, t, n)) : [];
  }
  function syncTreeApplyUserMerge(e, t, n, r) {
    !(function writeTreeAddMerge(e2, t2, n2, r2) {
      assert(r2 > e2.lastWriteId, "Stacking an older merge on top of newer ones"), e2.allWrites.push({ path: t2, children: n2, writeId: r2, visible: true }), e2.visibleWrites = compoundWriteAddWrites(e2.visibleWrites, t2, n2), e2.lastWriteId = r2;
    })(e.pendingWriteTree_, t, n, r);
    const i2 = ImmutableTree.fromObject(n);
    return syncTreeApplyOperationToSyncPoints_(e, new Merge({ fromUser: true, fromServer: false, queryId: null, tagged: false }, t, i2));
  }
  function syncTreeAckUserWrite(e, t, n = false) {
    const r = (function writeTreeGetWrite(e2, t2) {
      for (let n2 = 0; n2 < e2.allWrites.length; n2++) {
        const r2 = e2.allWrites[n2];
        if (r2.writeId === t2) return r2;
      }
      return null;
    })(e.pendingWriteTree_, t);
    if (writeTreeRemoveWrite(e.pendingWriteTree_, t)) {
      let t2 = new ImmutableTree(null);
      return null != r.snap ? t2 = t2.set(newEmptyPath(), true) : each(r.children, ((e2) => {
        t2 = t2.set(new Path(e2), true);
      })), syncTreeApplyOperationToSyncPoints_(e, new AckUserWrite(r.path, t2, n));
    }
    return [];
  }
  function syncTreeApplyServerOverwrite(e, t, n) {
    return syncTreeApplyOperationToSyncPoints_(e, new Overwrite({ fromUser: false, fromServer: true, queryId: null, tagged: false }, t, n));
  }
  function syncTreeRemoveEventRegistration(e, t, n, r, i2 = false) {
    const o3 = t._path, s3 = e.syncPointTree_.get(o3);
    let a3 = [];
    if (s3 && ("default" === t._queryIdentifier || syncPointViewExistsForQuery(s3, t))) {
      const l3 = syncPointRemoveEventRegistration(s3, t, n, r);
      (function syncPointIsEmpty(e2) {
        return 0 === e2.views.size;
      })(s3) && (e.syncPointTree_ = e.syncPointTree_.remove(o3));
      const h3 = l3.removed;
      if (a3 = l3.events, !i2) {
        const n2 = -1 !== h3.findIndex(((e2) => e2._queryParams.loadsAllData())), i3 = e.syncPointTree_.findOnPath(o3, ((e2, t2) => syncPointHasCompleteView(t2)));
        if (n2 && !i3) {
          const t2 = e.syncPointTree_.subtree(o3);
          if (!t2.isEmpty()) {
            const n3 = (function syncTreeCollectDistinctViewsForSubTree_(e2) {
              return e2.fold(((e3, t3, n4) => {
                if (t3 && syncPointHasCompleteView(t3)) {
                  return [syncPointGetCompleteView(t3)];
                }
                {
                  let e4 = [];
                  return t3 && (e4 = syncPointGetQueryViews(t3)), each(n4, ((t4, n5) => {
                    e4 = e4.concat(n5);
                  })), e4;
                }
              }));
            })(t2);
            for (let t3 = 0; t3 < n3.length; ++t3) {
              const r2 = n3[t3], i4 = r2.query, o4 = syncTreeCreateListenerForView_(e, r2);
              e.listenProvider_.startListening(syncTreeQueryForListening_(i4), syncTreeTagForQuery(e, i4), o4.hashFn, o4.onComplete);
            }
          }
        }
        if (!i3 && h3.length > 0 && !r) if (n2) {
          const n3 = null;
          e.listenProvider_.stopListening(syncTreeQueryForListening_(t), n3);
        } else h3.forEach(((t2) => {
          const n3 = e.queryToTagMap.get(syncTreeMakeQueryKey_(t2));
          e.listenProvider_.stopListening(syncTreeQueryForListening_(t2), n3);
        }));
      }
      !(function syncTreeRemoveTags_(e2, t2) {
        for (let n2 = 0; n2 < t2.length; ++n2) {
          const r2 = t2[n2];
          if (!r2._queryParams.loadsAllData()) {
            const t3 = syncTreeMakeQueryKey_(r2), n3 = e2.queryToTagMap.get(t3);
            e2.queryToTagMap.delete(t3), e2.tagToQueryMap.delete(n3);
          }
        }
      })(e, h3);
    }
    return a3;
  }
  function syncTreeApplyTaggedQueryOverwrite(e, t, n, r) {
    const i2 = syncTreeQueryKeyForTag_(e, r);
    if (null != i2) {
      const r2 = syncTreeParseQueryKey_(i2), o3 = r2.path, s3 = r2.queryId, a3 = newRelativePath(o3, t);
      return syncTreeApplyTaggedOperation_(e, o3, new Overwrite(newOperationSourceServerTaggedQuery(s3), a3, n));
    }
    return [];
  }
  function syncTreeAddEventRegistration(e, t, n, r = false) {
    const i2 = t._path;
    let o3 = null, s3 = false;
    e.syncPointTree_.foreachOnPath(i2, ((e2, t2) => {
      const n2 = newRelativePath(e2, i2);
      o3 = o3 || syncPointGetCompleteServerCache(t2, n2), s3 = s3 || syncPointHasCompleteView(t2);
    }));
    let a3, l3 = e.syncPointTree_.get(i2);
    if (l3 ? (s3 = s3 || syncPointHasCompleteView(l3), o3 = o3 || syncPointGetCompleteServerCache(l3, newEmptyPath())) : (l3 = new SyncPoint(), e.syncPointTree_ = e.syncPointTree_.set(i2, l3)), null != o3) a3 = true;
    else {
      a3 = false, o3 = ChildrenNode.EMPTY_NODE;
      e.syncPointTree_.subtree(i2).foreachChild(((e2, t2) => {
        const n2 = syncPointGetCompleteServerCache(t2, newEmptyPath());
        n2 && (o3 = o3.updateImmediateChild(e2, n2));
      }));
    }
    const h3 = syncPointViewExistsForQuery(l3, t);
    if (!h3 && !t._queryParams.loadsAllData()) {
      const n2 = syncTreeMakeQueryKey_(t);
      assert(!e.queryToTagMap.has(n2), "View does not exist, but we have a tag");
      const r2 = (function syncTreeGetNextQueryTag_() {
        return V2++;
      })();
      e.queryToTagMap.set(n2, r2), e.tagToQueryMap.set(r2, n2);
    }
    let c3 = syncPointAddEventRegistration(l3, t, n, writeTreeChildWrites(e.pendingWriteTree_, i2), o3, a3);
    if (!h3 && !s3 && !r) {
      const n2 = syncPointViewForQuery(l3, t);
      c3 = c3.concat((function syncTreeSetupListener_(e2, t2, n3) {
        const r2 = t2._path, i3 = syncTreeTagForQuery(e2, t2), o4 = syncTreeCreateListenerForView_(e2, n3), s4 = e2.listenProvider_.startListening(syncTreeQueryForListening_(t2), i3, o4.hashFn, o4.onComplete), a4 = e2.syncPointTree_.subtree(r2);
        if (i3) assert(!syncPointHasCompleteView(a4.value), "If we're adding a query, it shouldn't be shadowed");
        else {
          const t3 = a4.fold(((e3, t4, n4) => {
            if (!pathIsEmpty(e3) && t4 && syncPointHasCompleteView(t4)) return [syncPointGetCompleteView(t4).query];
            {
              let e4 = [];
              return t4 && (e4 = e4.concat(syncPointGetQueryViews(t4).map(((e5) => e5.query)))), each(n4, ((t5, n5) => {
                e4 = e4.concat(n5);
              })), e4;
            }
          }));
          for (let n4 = 0; n4 < t3.length; ++n4) {
            const r3 = t3[n4];
            e2.listenProvider_.stopListening(syncTreeQueryForListening_(r3), syncTreeTagForQuery(e2, r3));
          }
        }
        return s4;
      })(e, t, n2));
    }
    return c3;
  }
  function syncTreeCalcCompleteEventCache(e, t, n) {
    const r = e.pendingWriteTree_, i2 = e.syncPointTree_.findOnPath(t, ((e2, n2) => {
      const r2 = syncPointGetCompleteServerCache(n2, newRelativePath(e2, t));
      if (r2) return r2;
    }));
    return writeTreeCalcCompleteEventCache(r, t, i2, n, true);
  }
  function syncTreeGetServerValue(e, t) {
    const n = t._path;
    let r = null;
    e.syncPointTree_.foreachOnPath(n, ((e2, t2) => {
      const i3 = newRelativePath(e2, n);
      r = r || syncPointGetCompleteServerCache(t2, i3);
    }));
    let i2 = e.syncPointTree_.get(n);
    i2 ? r = r || syncPointGetCompleteServerCache(i2, newEmptyPath()) : (i2 = new SyncPoint(), e.syncPointTree_ = e.syncPointTree_.set(n, i2));
    const o3 = null != r, s3 = o3 ? new CacheNode(r, true, false) : null;
    return (function viewGetCompleteNode(e2) {
      return viewCacheGetCompleteEventSnap(e2.viewCache_);
    })(syncPointGetView(i2, t, writeTreeChildWrites(e.pendingWriteTree_, t._path), o3 ? s3.getNode() : ChildrenNode.EMPTY_NODE, o3));
  }
  function syncTreeApplyOperationToSyncPoints_(e, t) {
    return syncTreeApplyOperationHelper_(t, e.syncPointTree_, null, writeTreeChildWrites(e.pendingWriteTree_, newEmptyPath()));
  }
  function syncTreeApplyOperationHelper_(e, t, n, r) {
    if (pathIsEmpty(e.path)) return syncTreeApplyOperationDescendantsHelper_(e, t, n, r);
    {
      const i2 = t.get(newEmptyPath());
      null == n && null != i2 && (n = syncPointGetCompleteServerCache(i2, newEmptyPath()));
      let o3 = [];
      const s3 = pathGetFront(e.path), a3 = e.operationForChild(s3), l3 = t.children.get(s3);
      if (l3 && a3) {
        const e2 = n ? n.getImmediateChild(s3) : null, t2 = writeTreeRefChild(r, s3);
        o3 = o3.concat(syncTreeApplyOperationHelper_(a3, l3, e2, t2));
      }
      return i2 && (o3 = o3.concat(syncPointApplyOperation(i2, e, r, n))), o3;
    }
  }
  function syncTreeApplyOperationDescendantsHelper_(e, t, n, r) {
    const i2 = t.get(newEmptyPath());
    null == n && null != i2 && (n = syncPointGetCompleteServerCache(i2, newEmptyPath()));
    let o3 = [];
    return t.children.inorderTraversal(((t2, i3) => {
      const s3 = n ? n.getImmediateChild(t2) : null, a3 = writeTreeRefChild(r, t2), l3 = e.operationForChild(t2);
      l3 && (o3 = o3.concat(syncTreeApplyOperationDescendantsHelper_(l3, i3, s3, a3)));
    })), i2 && (o3 = o3.concat(syncPointApplyOperation(i2, e, r, n))), o3;
  }
  function syncTreeCreateListenerForView_(e, t) {
    const n = t.query, r = syncTreeTagForQuery(e, n);
    return { hashFn: () => {
      const e2 = (function viewGetServerCache(e3) {
        return e3.viewCache_.serverCache.getNode();
      })(t) || ChildrenNode.EMPTY_NODE;
      return e2.hash();
    }, onComplete: (t2) => {
      if ("ok" === t2) return r ? (function syncTreeApplyTaggedListenComplete(e2, t3, n2) {
        const r2 = syncTreeQueryKeyForTag_(e2, n2);
        if (r2) {
          const n3 = syncTreeParseQueryKey_(r2), i2 = n3.path, o3 = n3.queryId, s3 = newRelativePath(i2, t3);
          return syncTreeApplyTaggedOperation_(e2, i2, new ListenComplete(newOperationSourceServerTaggedQuery(o3), s3));
        }
        return [];
      })(e, n._path, r) : (function syncTreeApplyListenComplete(e2, t3) {
        return syncTreeApplyOperationToSyncPoints_(e2, new ListenComplete({ fromUser: false, fromServer: true, queryId: null, tagged: false }, t3));
      })(e, n._path);
      {
        const r2 = (function errorForServerCode(e2, t3) {
          let n2 = "Unknown Error";
          "too_big" === e2 ? n2 = "The data requested exceeds the maximum size that can be accessed with a single request." : "permission_denied" === e2 ? n2 = "Client doesn't have permission to access the desired data." : "unavailable" === e2 && (n2 = "The service is unavailable");
          const r3 = new Error(e2 + " at " + t3._path.toString() + ": " + n2);
          return r3.code = e2.toUpperCase(), r3;
        })(t2, n);
        return syncTreeRemoveEventRegistration(e, n, null, r2);
      }
    } };
  }
  function syncTreeTagForQuery(e, t) {
    const n = syncTreeMakeQueryKey_(t);
    return e.queryToTagMap.get(n);
  }
  function syncTreeMakeQueryKey_(e) {
    return e._path.toString() + "$" + e._queryIdentifier;
  }
  function syncTreeQueryKeyForTag_(e, t) {
    return e.tagToQueryMap.get(t);
  }
  function syncTreeParseQueryKey_(e) {
    const t = e.indexOf("$");
    return assert(-1 !== t && t < e.length - 1, "Bad queryKey."), { queryId: e.substr(t + 1), path: new Path(e.substr(0, t)) };
  }
  function syncTreeApplyTaggedOperation_(e, t, n) {
    const r = e.syncPointTree_.get(t);
    assert(r, "Missing sync point for query tag that we're tracking");
    return syncPointApplyOperation(r, n, writeTreeChildWrites(e.pendingWriteTree_, t), null);
  }
  function syncTreeQueryForListening_(e) {
    return e._queryParams.loadsAllData() && !e._queryParams.isDefault() ? new ((function syncTreeGetReferenceConstructor() {
      return assert(U2, "Reference.ts has not been loaded"), U2;
    })())(e._repo, e._path) : e;
  }
  var ExistingValueProvider = class _ExistingValueProvider {
    constructor(e) {
      this.node_ = e;
    }
    getImmediateChild(e) {
      const t = this.node_.getImmediateChild(e);
      return new _ExistingValueProvider(t);
    }
    node() {
      return this.node_;
    }
  };
  var DeferredValueProvider = class _DeferredValueProvider {
    constructor(e, t) {
      this.syncTree_ = e, this.path_ = t;
    }
    getImmediateChild(e) {
      const t = pathChild(this.path_, e);
      return new _DeferredValueProvider(this.syncTree_, t);
    }
    node() {
      return syncTreeCalcCompleteEventCache(this.syncTree_, this.path_);
    }
  };
  var resolveDeferredLeafValue = function(e, t, n) {
    return e && "object" == typeof e ? (assert(".sv" in e, "Unexpected leaf node or priority contents"), "string" == typeof e[".sv"] ? resolveScalarDeferredValue(e[".sv"], t, n) : "object" == typeof e[".sv"] ? resolveComplexDeferredValue(e[".sv"], t) : void assert(false, "Unexpected server value: " + JSON.stringify(e, null, 2))) : e;
  };
  var resolveScalarDeferredValue = function(e, t, n) {
    if ("timestamp" === e) return n.timestamp;
    assert(false, "Unexpected server value: " + e);
  };
  var resolveComplexDeferredValue = function(e, t, n) {
    e.hasOwnProperty("increment") || assert(false, "Unexpected server value: " + JSON.stringify(e, null, 2));
    const r = e.increment;
    "number" != typeof r && assert(false, "Unexpected increment value: " + r);
    const i2 = t.node();
    if (assert(null != i2, "Expected ChildrenNode.EMPTY_NODE for nulls"), !i2.isLeafNode()) return r;
    const o3 = i2.getValue();
    return "number" != typeof o3 ? r : o3 + r;
  };
  var resolveDeferredValueTree = function(e, t, n, r) {
    return resolveDeferredValue(t, new DeferredValueProvider(n, e), r);
  };
  var resolveDeferredValueSnapshot = function(e, t, n) {
    return resolveDeferredValue(e, new ExistingValueProvider(t), n);
  };
  function resolveDeferredValue(e, t, n) {
    const r = e.getPriority().val(), i2 = resolveDeferredLeafValue(r, t.getImmediateChild(".priority"), n);
    let o3;
    if (e.isLeafNode()) {
      const r2 = e, o4 = resolveDeferredLeafValue(r2.getValue(), t, n);
      return o4 !== r2.getValue() || i2 !== r2.getPriority().val() ? new LeafNode(o4, nodeFromJSON(i2)) : e;
    }
    {
      const r2 = e;
      return o3 = r2, i2 !== r2.getPriority().val() && (o3 = o3.updatePriority(new LeafNode(i2))), r2.forEachChild(x2, ((e2, r3) => {
        const i3 = resolveDeferredValue(r3, t.getImmediateChild(e2), n);
        i3 !== r3 && (o3 = o3.updateImmediateChild(e2, i3));
      })), o3;
    }
  }
  var Tree = class {
    constructor(e = "", t = null, n = { children: {}, childCount: 0 }) {
      this.name = e, this.parent = t, this.node = n;
    }
  };
  function treeSubTree(e, t) {
    let n = t instanceof Path ? t : new Path(t), r = e, i2 = pathGetFront(n);
    for (; null !== i2; ) {
      const e2 = safeGet(r.node.children, i2) || { children: {}, childCount: 0 };
      r = new Tree(i2, r, e2), n = pathPopFront(n), i2 = pathGetFront(n);
    }
    return r;
  }
  function treeGetValue(e) {
    return e.node.value;
  }
  function treeSetValue(e, t) {
    e.node.value = t, treeUpdateParents(e);
  }
  function treeHasChildren(e) {
    return e.node.childCount > 0;
  }
  function treeForEachChild(e, t) {
    each(e.node.children, ((n, r) => {
      t(new Tree(n, e, r));
    }));
  }
  function treeForEachDescendant(e, t, n, r) {
    n && !r && t(e), treeForEachChild(e, ((e2) => {
      treeForEachDescendant(e2, t, true, r);
    })), n && r && t(e);
  }
  function treeGetPath(e) {
    return new Path(null === e.parent ? e.name : treeGetPath(e.parent) + "/" + e.name);
  }
  function treeUpdateParents(e) {
    null !== e.parent && (function treeUpdateChild(e2, t, n) {
      const r = (function treeIsEmpty(e3) {
        return void 0 === treeGetValue(e3) && !treeHasChildren(e3);
      })(n), i2 = contains(e2.node.children, t);
      r && i2 ? (delete e2.node.children[t], e2.node.childCount--, treeUpdateParents(e2)) : r || i2 || (e2.node.children[t] = n.node, e2.node.childCount++, treeUpdateParents(e2));
    })(e.parent, e.name, e);
  }
  var H2 = /[\[\].#$\/\u0000-\u001F\u007F]/;
  var j2 = /[\[\].#$\u0000-\u001F\u007F]/;
  var isValidKey = function(e) {
    return "string" == typeof e && 0 !== e.length && !H2.test(e);
  };
  var isValidPathString = function(e) {
    return "string" == typeof e && 0 !== e.length && !j2.test(e);
  };
  var isValidPriority = function(e) {
    return null === e || "string" == typeof e || "number" == typeof e && !isInvalidJSONNumber(e) || e && "object" == typeof e && contains(e, ".sv");
  };
  var validateFirebaseDataArg = function(e, t, n, r) {
    r && void 0 === t || validateFirebaseData(errorPrefix(e, "value"), t, n);
  };
  var validateFirebaseData = function(e, t, n) {
    const r = n instanceof Path ? new ValidationPath(n, e) : n;
    if (void 0 === t) throw new Error(e + "contains undefined " + validationPathToErrorString(r));
    if ("function" == typeof t) throw new Error(e + "contains a function " + validationPathToErrorString(r) + " with contents = " + t.toString());
    if (isInvalidJSONNumber(t)) throw new Error(e + "contains " + t.toString() + " " + validationPathToErrorString(r));
    if ("string" == typeof t && t.length > 10485760 / 3 && stringLength(t) > 10485760) throw new Error(e + "contains a string greater than 10485760 utf8 bytes " + validationPathToErrorString(r) + " ('" + t.substring(0, 50) + "...')");
    if (t && "object" == typeof t) {
      let n2 = false, i2 = false;
      if (each(t, ((t2, o3) => {
        if (".value" === t2) n2 = true;
        else if (".priority" !== t2 && ".sv" !== t2 && (i2 = true, !isValidKey(t2))) throw new Error(e + " contains an invalid key (" + t2 + ") " + validationPathToErrorString(r) + `.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);
        !(function validationPathPush(e2, t3) {
          e2.parts_.length > 0 && (e2.byteLength_ += 1), e2.parts_.push(t3), e2.byteLength_ += stringLength(t3), validationPathCheckValid(e2);
        })(r, t2), validateFirebaseData(e, o3, r), (function validationPathPop(e2) {
          const t3 = e2.parts_.pop();
          e2.byteLength_ -= stringLength(t3), e2.parts_.length > 0 && (e2.byteLength_ -= 1);
        })(r);
      })), n2 && i2) throw new Error(e + ' contains ".value" child ' + validationPathToErrorString(r) + " in addition to actual children.");
    }
  };
  var validateFirebaseMergeDataArg = function(e, t, n, r) {
    if (r && void 0 === t) return;
    const i2 = errorPrefix(e, "values");
    if (!t || "object" != typeof t || Array.isArray(t)) throw new Error(i2 + " must be an object containing the children to replace.");
    const o3 = [];
    each(t, ((e2, t2) => {
      const r2 = new Path(e2);
      if (validateFirebaseData(i2, t2, pathChild(n, r2)), ".priority" === pathGetBack(r2) && !isValidPriority(t2)) throw new Error(i2 + "contains an invalid value for '" + r2.toString() + "', which must be a valid Firebase priority (a string, finite number, server value, or null).");
      o3.push(r2);
    })), (function(e2, t2) {
      let n2, r2;
      for (n2 = 0; n2 < t2.length; n2++) {
        r2 = t2[n2];
        const i4 = pathSlice(r2);
        for (let t3 = 0; t3 < i4.length; t3++) if (".priority" === i4[t3] && t3 === i4.length - 1) ;
        else if (!isValidKey(i4[t3])) throw new Error(e2 + "contains an invalid key (" + i4[t3] + ") in path " + r2.toString() + `. Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);
      }
      t2.sort(pathCompare);
      let i3 = null;
      for (n2 = 0; n2 < t2.length; n2++) {
        if (r2 = t2[n2], null !== i3 && pathContains(i3, r2)) throw new Error(e2 + "contains a path " + i3.toString() + " that is ancestor of another path " + r2.toString());
        i3 = r2;
      }
    })(i2, o3);
  };
  var validatePriority = function(e, t, n) {
    if (!n || void 0 !== t) {
      if (isInvalidJSONNumber(t)) throw new Error(errorPrefix(e, "priority") + "is " + t.toString() + ", but must be a valid Firebase priority (a string, finite number, server value, or null).");
      if (!isValidPriority(t)) throw new Error(errorPrefix(e, "priority") + "must be a valid Firebase priority (a string, finite number, server value, or null).");
    }
  };
  var validateKey = function(e, t, n, r) {
    if (!(r && void 0 === n || isValidKey(n))) throw new Error(errorPrefix(e, t) + 'was an invalid key = "' + n + `".  Firebase keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]").`);
  };
  var validatePathString = function(e, t, n, r) {
    if (!(r && void 0 === n || isValidPathString(n))) throw new Error(errorPrefix(e, t) + 'was an invalid path = "' + n + `". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`);
  };
  var validateWritablePath = function(e, t) {
    if (".info" === pathGetFront(t)) throw new Error(e + " failed = Can't modify data under /.info/");
  };
  var validateUrl = function(e, t) {
    const n = t.path.toString();
    if ("string" != typeof t.repoInfo.host || 0 === t.repoInfo.host.length || !isValidKey(t.repoInfo.namespace) && "localhost" !== t.repoInfo.host.split(":")[0] || 0 !== n.length && !(function(e2) {
      return e2 && (e2 = e2.replace(/^\/*\.info(\/|$)/, "/")), isValidPathString(e2);
    })(n)) throw new Error(errorPrefix(e, "url") + `must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`);
  };
  var EventQueue = class {
    constructor() {
      this.eventLists_ = [], this.recursionDepth_ = 0;
    }
  };
  function eventQueueQueueEvents(e, t) {
    let n = null;
    for (let r = 0; r < t.length; r++) {
      const i2 = t[r], o3 = i2.getPath();
      null === n || pathEquals(o3, n.path) || (e.eventLists_.push(n), n = null), null === n && (n = { events: [], path: o3 }), n.events.push(i2);
    }
    n && e.eventLists_.push(n);
  }
  function eventQueueRaiseEventsAtPath(e, t, n) {
    eventQueueQueueEvents(e, n), eventQueueRaiseQueuedEventsMatchingPredicate(e, ((e2) => pathEquals(e2, t)));
  }
  function eventQueueRaiseEventsForChangedPath(e, t, n) {
    eventQueueQueueEvents(e, n), eventQueueRaiseQueuedEventsMatchingPredicate(e, ((e2) => pathContains(e2, t) || pathContains(t, e2)));
  }
  function eventQueueRaiseQueuedEventsMatchingPredicate(e, t) {
    e.recursionDepth_++;
    let n = true;
    for (let r = 0; r < e.eventLists_.length; r++) {
      const i2 = e.eventLists_[r];
      if (i2) {
        t(i2.path) ? (eventListRaise(e.eventLists_[r]), e.eventLists_[r] = null) : n = false;
      }
    }
    n && (e.eventLists_ = []), e.recursionDepth_--;
  }
  function eventListRaise(e) {
    for (let t = 0; t < e.events.length; t++) {
      const n = e.events[t];
      if (null !== n) {
        e.events[t] = null;
        const r = n.getEventRunner();
        y2 && log("event: " + n.toString()), exceptionGuard(r);
      }
    }
  }
  var Repo = class {
    constructor(e, t, n, r) {
      this.repoInfo_ = e, this.forceRestClient_ = t, this.authTokenProvider_ = n, this.appCheckProvider_ = r, this.dataUpdateCount = 0, this.statsListener_ = null, this.eventQueue_ = new EventQueue(), this.nextWriteId_ = 1, this.interceptServerDataCallback_ = null, this.onDisconnect_ = newSparseSnapshotTree(), this.transactionQueueTree_ = new Tree(), this.persistentConnection_ = null, this.key = this.repoInfo_.toURLString();
    }
    toString() {
      return (this.repoInfo_.secure ? "https://" : "http://") + this.repoInfo_.host;
    }
  };
  function repoStart(e, t, n) {
    if (e.stats_ = statsManagerGetCollection(e.repoInfo_), e.forceRestClient_ || ("object" == typeof window && window.navigator && window.navigator.userAgent || "").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i) >= 0) e.server_ = new ReadonlyRestClient(e.repoInfo_, ((t2, n2, r, i2) => {
      repoOnDataUpdate(e, t2, n2, r, i2);
    }), e.authTokenProvider_, e.appCheckProvider_), setTimeout((() => repoOnConnectStatus(e, true)), 0);
    else {
      if (null != n) {
        if ("object" != typeof n) throw new Error("Only objects are supported for option databaseAuthVariableOverride");
        try {
          stringify(n);
        } catch (e2) {
          throw new Error("Invalid authOverride provided: " + e2);
        }
      }
      e.persistentConnection_ = new PersistentConnection(e.repoInfo_, t, ((t2, n2, r, i2) => {
        repoOnDataUpdate(e, t2, n2, r, i2);
      }), ((t2) => {
        repoOnConnectStatus(e, t2);
      }), ((t2) => {
        !(function repoOnServerInfoUpdate(e2, t3) {
          each(t3, ((t4, n2) => {
            repoUpdateInfo(e2, t4, n2);
          }));
        })(e, t2);
      }), e.authTokenProvider_, e.appCheckProvider_, n), e.server_ = e.persistentConnection_;
    }
    e.authTokenProvider_.addTokenChangeListener(((t2) => {
      e.server_.refreshAuthToken(t2);
    })), e.appCheckProvider_.addTokenChangeListener(((t2) => {
      e.server_.refreshAppCheckToken(t2.token);
    })), e.statsReporter_ = (function statsManagerGetOrCreateReporter(e2, t2) {
      const n2 = e2.toString();
      return S2[n2] || (S2[n2] = t2()), S2[n2];
    })(e.repoInfo_, (() => new StatsReporter(e.stats_, e.server_))), e.infoData_ = new SnapshotHolder(), e.infoSyncTree_ = new SyncTree({ startListening: (t2, n2, r, i2) => {
      let o3 = [];
      const s3 = e.infoData_.getNode(t2._path);
      return s3.isEmpty() || (o3 = syncTreeApplyServerOverwrite(e.infoSyncTree_, t2._path, s3), setTimeout((() => {
        i2("ok");
      }), 0)), o3;
    }, stopListening: () => {
    } }), repoUpdateInfo(e, "connected", false), e.serverSyncTree_ = new SyncTree({ startListening: (t2, n2, r, i2) => (e.server_.listen(t2, r, n2, ((n3, r2) => {
      const o3 = i2(n3, r2);
      eventQueueRaiseEventsForChangedPath(e.eventQueue_, t2._path, o3);
    })), []), stopListening: (t2, n2) => {
      e.server_.unlisten(t2, n2);
    } });
  }
  function repoServerTime(e) {
    const t = e.infoData_.getNode(new Path(".info/serverTimeOffset")).val() || 0;
    return (/* @__PURE__ */ new Date()).getTime() + t;
  }
  function repoGenerateServerValues(e) {
    return (t = (t = { timestamp: repoServerTime(e) }) || {}).timestamp = t.timestamp || (/* @__PURE__ */ new Date()).getTime(), t;
    var t;
  }
  function repoOnDataUpdate(e, t, n, r, i2) {
    e.dataUpdateCount++;
    const o3 = new Path(t);
    n = e.interceptServerDataCallback_ ? e.interceptServerDataCallback_(t, n) : n;
    let s3 = [];
    if (i2) if (r) {
      const t2 = map(n, ((e2) => nodeFromJSON(e2)));
      s3 = (function syncTreeApplyTaggedQueryMerge(e2, t3, n2, r2) {
        const i3 = syncTreeQueryKeyForTag_(e2, r2);
        if (i3) {
          const r3 = syncTreeParseQueryKey_(i3), o4 = r3.path, s4 = r3.queryId, a4 = newRelativePath(o4, t3), l3 = ImmutableTree.fromObject(n2);
          return syncTreeApplyTaggedOperation_(e2, o4, new Merge(newOperationSourceServerTaggedQuery(s4), a4, l3));
        }
        return [];
      })(e.serverSyncTree_, o3, t2, i2);
    } else {
      const t2 = nodeFromJSON(n);
      s3 = syncTreeApplyTaggedQueryOverwrite(e.serverSyncTree_, o3, t2, i2);
    }
    else if (r) {
      const t2 = map(n, ((e2) => nodeFromJSON(e2)));
      s3 = (function syncTreeApplyServerMerge(e2, t3, n2) {
        const r2 = ImmutableTree.fromObject(n2);
        return syncTreeApplyOperationToSyncPoints_(e2, new Merge({ fromUser: false, fromServer: true, queryId: null, tagged: false }, t3, r2));
      })(e.serverSyncTree_, o3, t2);
    } else {
      const t2 = nodeFromJSON(n);
      s3 = syncTreeApplyServerOverwrite(e.serverSyncTree_, o3, t2);
    }
    let a3 = o3;
    s3.length > 0 && (a3 = repoRerunTransactions(e, o3)), eventQueueRaiseEventsForChangedPath(e.eventQueue_, a3, s3);
  }
  function repoOnConnectStatus(e, t) {
    repoUpdateInfo(e, "connected", t), false === t && (function repoRunOnDisconnectEvents(e2) {
      repoLog(e2, "onDisconnectEvents");
      const t2 = repoGenerateServerValues(e2), n = newSparseSnapshotTree();
      sparseSnapshotTreeForEachTree(e2.onDisconnect_, newEmptyPath(), ((r2, i2) => {
        const o3 = resolveDeferredValueTree(r2, i2, e2.serverSyncTree_, t2);
        sparseSnapshotTreeRemember(n, r2, o3);
      }));
      let r = [];
      sparseSnapshotTreeForEachTree(n, newEmptyPath(), ((t3, n2) => {
        r = r.concat(syncTreeApplyServerOverwrite(e2.serverSyncTree_, t3, n2));
        const i2 = repoAbortTransactions(e2, t3);
        repoRerunTransactions(e2, i2);
      })), e2.onDisconnect_ = newSparseSnapshotTree(), eventQueueRaiseEventsForChangedPath(e2.eventQueue_, newEmptyPath(), r);
    })(e);
  }
  function repoUpdateInfo(e, t, n) {
    const r = new Path("/.info/" + t), i2 = nodeFromJSON(n);
    e.infoData_.updateSnapshot(r, i2);
    const o3 = syncTreeApplyServerOverwrite(e.infoSyncTree_, r, i2);
    eventQueueRaiseEventsForChangedPath(e.eventQueue_, r, o3);
  }
  function repoGetNextWriteId(e) {
    return e.nextWriteId_++;
  }
  function repoSetWithPriority(e, t, n, r, i2) {
    repoLog(e, "set", { path: t.toString(), value: n, priority: r });
    const o3 = repoGenerateServerValues(e), s3 = nodeFromJSON(n, r), a3 = syncTreeCalcCompleteEventCache(e.serverSyncTree_, t), l3 = resolveDeferredValueSnapshot(s3, a3, o3), h3 = repoGetNextWriteId(e), c3 = syncTreeApplyUserOverwrite(e.serverSyncTree_, t, l3, h3, true);
    eventQueueQueueEvents(e.eventQueue_, c3), e.server_.put(t.toString(), s3.val(true), ((n2, r2) => {
      const o4 = "ok" === n2;
      o4 || warn("set at " + t + " failed: " + n2);
      const s4 = syncTreeAckUserWrite(e.serverSyncTree_, h3, !o4);
      eventQueueRaiseEventsForChangedPath(e.eventQueue_, t, s4), repoCallOnCompleteCallback(e, i2, n2, r2);
    }));
    const d3 = repoAbortTransactions(e, t);
    repoRerunTransactions(e, d3), eventQueueRaiseEventsForChangedPath(e.eventQueue_, d3, []);
  }
  function repoOnDisconnectCancel(e, t, n) {
    e.server_.onDisconnectCancel(t.toString(), ((r, i2) => {
      "ok" === r && sparseSnapshotTreeForget(e.onDisconnect_, t), repoCallOnCompleteCallback(e, n, r, i2);
    }));
  }
  function repoOnDisconnectSet(e, t, n, r) {
    const i2 = nodeFromJSON(n);
    e.server_.onDisconnectPut(t.toString(), i2.val(true), ((n2, o3) => {
      "ok" === n2 && sparseSnapshotTreeRemember(e.onDisconnect_, t, i2), repoCallOnCompleteCallback(e, r, n2, o3);
    }));
  }
  function repoRemoveEventCallbackForQuery(e, t, n) {
    let r;
    r = ".info" === pathGetFront(t._path) ? syncTreeRemoveEventRegistration(e.infoSyncTree_, t, n) : syncTreeRemoveEventRegistration(e.serverSyncTree_, t, n), eventQueueRaiseEventsAtPath(e.eventQueue_, t._path, r);
  }
  function repoInterrupt(e) {
    e.persistentConnection_ && e.persistentConnection_.interrupt("repo_interrupt");
  }
  function repoLog(e, ...t) {
    let n = "";
    e.persistentConnection_ && (n = e.persistentConnection_.id + ":"), log(n, ...t);
  }
  function repoCallOnCompleteCallback(e, t, n, r) {
    t && exceptionGuard((() => {
      if ("ok" === n) t(null);
      else {
        const e2 = (n || "error").toUpperCase();
        let i2 = e2;
        r && (i2 += ": " + r);
        const o3 = new Error(i2);
        o3.code = e2, t(o3);
      }
    }));
  }
  function repoGetLatestState(e, t, n) {
    return syncTreeCalcCompleteEventCache(e.serverSyncTree_, t, n) || ChildrenNode.EMPTY_NODE;
  }
  function repoSendReadyTransactions(e, t = e.transactionQueueTree_) {
    if (t || repoPruneCompletedTransactionsBelowNode(e, t), treeGetValue(t)) {
      const n = repoBuildTransactionQueue(e, t);
      assert(n.length > 0, "Sending zero length transaction queue");
      n.every(((e2) => 0 === e2.status)) && (function repoSendTransactionQueue(e2, t2, n2) {
        const r = n2.map(((e3) => e3.currentWriteId)), i2 = repoGetLatestState(e2, t2, r);
        let o3 = i2;
        const s3 = i2.hash();
        for (let e3 = 0; e3 < n2.length; e3++) {
          const r2 = n2[e3];
          assert(0 === r2.status, "tryToSendTransactionQueue_: items in queue should all be run."), r2.status = 1, r2.retryCount++;
          const i3 = newRelativePath(t2, r2.path);
          o3 = o3.updateChild(i3, r2.currentOutputSnapshotRaw);
        }
        const a3 = o3.val(true), l3 = t2;
        e2.server_.put(l3.toString(), a3, ((r2) => {
          repoLog(e2, "transaction put response", { path: l3.toString(), status: r2 });
          let i3 = [];
          if ("ok" === r2) {
            const r3 = [];
            for (let t3 = 0; t3 < n2.length; t3++) n2[t3].status = 2, i3 = i3.concat(syncTreeAckUserWrite(e2.serverSyncTree_, n2[t3].currentWriteId)), n2[t3].onComplete && r3.push((() => n2[t3].onComplete(null, true, n2[t3].currentOutputSnapshotResolved))), n2[t3].unwatcher();
            repoPruneCompletedTransactionsBelowNode(e2, treeSubTree(e2.transactionQueueTree_, t2)), repoSendReadyTransactions(e2, e2.transactionQueueTree_), eventQueueRaiseEventsForChangedPath(e2.eventQueue_, t2, i3);
            for (let e3 = 0; e3 < r3.length; e3++) exceptionGuard(r3[e3]);
          } else {
            if ("datastale" === r2) for (let e3 = 0; e3 < n2.length; e3++) 3 === n2[e3].status ? n2[e3].status = 4 : n2[e3].status = 0;
            else {
              warn("transaction at " + l3.toString() + " failed: " + r2);
              for (let e3 = 0; e3 < n2.length; e3++) n2[e3].status = 4, n2[e3].abortReason = r2;
            }
            repoRerunTransactions(e2, t2);
          }
        }), s3);
      })(e, treeGetPath(t), n);
    } else treeHasChildren(t) && treeForEachChild(t, ((t2) => {
      repoSendReadyTransactions(e, t2);
    }));
  }
  function repoRerunTransactions(e, t) {
    const n = repoGetAncestorTransactionNode(e, t), r = treeGetPath(n);
    return (function repoRerunTransactionQueue(e2, t2, n2) {
      if (0 === t2.length) return;
      const r2 = [];
      let i2 = [];
      const o3 = t2.filter(((e3) => 0 === e3.status)).map(((e3) => e3.currentWriteId));
      for (let a3 = 0; a3 < t2.length; a3++) {
        const l3 = t2[a3], h3 = newRelativePath(n2, l3.path);
        let c3, d3 = false;
        if (assert(null !== h3, "rerunTransactionsUnderNode_: relativePath should not be null."), 4 === l3.status) d3 = true, c3 = l3.abortReason, i2 = i2.concat(syncTreeAckUserWrite(e2.serverSyncTree_, l3.currentWriteId, true));
        else if (0 === l3.status) if (l3.retryCount >= 25) d3 = true, c3 = "maxretry", i2 = i2.concat(syncTreeAckUserWrite(e2.serverSyncTree_, l3.currentWriteId, true));
        else {
          const n3 = repoGetLatestState(e2, l3.path, o3);
          l3.currentInputSnapshot = n3;
          const r3 = t2[a3].update(n3.val());
          if (void 0 !== r3) {
            validateFirebaseData("transaction failed: Data returned ", r3, l3.path);
            let t3 = nodeFromJSON(r3);
            "object" == typeof r3 && null != r3 && contains(r3, ".priority") || (t3 = t3.updatePriority(n3.getPriority()));
            const s4 = l3.currentWriteId, a4 = repoGenerateServerValues(e2), h4 = resolveDeferredValueSnapshot(t3, n3, a4);
            l3.currentOutputSnapshotRaw = t3, l3.currentOutputSnapshotResolved = h4, l3.currentWriteId = repoGetNextWriteId(e2), o3.splice(o3.indexOf(s4), 1), i2 = i2.concat(syncTreeApplyUserOverwrite(e2.serverSyncTree_, l3.path, h4, l3.currentWriteId, l3.applyLocally)), i2 = i2.concat(syncTreeAckUserWrite(e2.serverSyncTree_, s4, true));
          } else d3 = true, c3 = "nodata", i2 = i2.concat(syncTreeAckUserWrite(e2.serverSyncTree_, l3.currentWriteId, true));
        }
        eventQueueRaiseEventsForChangedPath(e2.eventQueue_, n2, i2), i2 = [], d3 && (t2[a3].status = 2, s3 = t2[a3].unwatcher, setTimeout(s3, Math.floor(0)), t2[a3].onComplete && ("nodata" === c3 ? r2.push((() => t2[a3].onComplete(null, false, t2[a3].currentInputSnapshot))) : r2.push((() => t2[a3].onComplete(new Error(c3), false, null)))));
      }
      var s3;
      repoPruneCompletedTransactionsBelowNode(e2, e2.transactionQueueTree_);
      for (let e3 = 0; e3 < r2.length; e3++) exceptionGuard(r2[e3]);
      repoSendReadyTransactions(e2, e2.transactionQueueTree_);
    })(e, repoBuildTransactionQueue(e, n), r), r;
  }
  function repoGetAncestorTransactionNode(e, t) {
    let n, r = e.transactionQueueTree_;
    for (n = pathGetFront(t); null !== n && void 0 === treeGetValue(r); ) r = treeSubTree(r, n), n = pathGetFront(t = pathPopFront(t));
    return r;
  }
  function repoBuildTransactionQueue(e, t) {
    const n = [];
    return repoAggregateTransactionQueuesForNode(e, t, n), n.sort(((e2, t2) => e2.order - t2.order)), n;
  }
  function repoAggregateTransactionQueuesForNode(e, t, n) {
    const r = treeGetValue(t);
    if (r) for (let e2 = 0; e2 < r.length; e2++) n.push(r[e2]);
    treeForEachChild(t, ((t2) => {
      repoAggregateTransactionQueuesForNode(e, t2, n);
    }));
  }
  function repoPruneCompletedTransactionsBelowNode(e, t) {
    const n = treeGetValue(t);
    if (n) {
      let e2 = 0;
      for (let t2 = 0; t2 < n.length; t2++) 2 !== n[t2].status && (n[e2] = n[t2], e2++);
      n.length = e2, treeSetValue(t, n.length > 0 ? n : void 0);
    }
    treeForEachChild(t, ((t2) => {
      repoPruneCompletedTransactionsBelowNode(e, t2);
    }));
  }
  function repoAbortTransactions(e, t) {
    const n = treeGetPath(repoGetAncestorTransactionNode(e, t)), r = treeSubTree(e.transactionQueueTree_, t);
    return (function treeForEachAncestor(e2, t2, n2) {
      let r2 = n2 ? e2 : e2.parent;
      for (; null !== r2; ) {
        if (t2(r2)) return true;
        r2 = r2.parent;
      }
      return false;
    })(r, ((t2) => {
      repoAbortTransactionsOnNode(e, t2);
    })), repoAbortTransactionsOnNode(e, r), treeForEachDescendant(r, ((t2) => {
      repoAbortTransactionsOnNode(e, t2);
    })), n;
  }
  function repoAbortTransactionsOnNode(e, t) {
    const n = treeGetValue(t);
    if (n) {
      const r = [];
      let i2 = [], o3 = -1;
      for (let t2 = 0; t2 < n.length; t2++) 3 === n[t2].status || (1 === n[t2].status ? (assert(o3 === t2 - 1, "All SENT items should be at beginning of queue."), o3 = t2, n[t2].status = 3, n[t2].abortReason = "set") : (assert(0 === n[t2].status, "Unexpected transaction status in abort"), n[t2].unwatcher(), i2 = i2.concat(syncTreeAckUserWrite(e.serverSyncTree_, n[t2].currentWriteId, true)), n[t2].onComplete && r.push(n[t2].onComplete.bind(null, new Error("set"), false, null))));
      -1 === o3 ? treeSetValue(t, void 0) : n.length = o3 + 1, eventQueueRaiseEventsForChangedPath(e.eventQueue_, treeGetPath(t), i2);
      for (let e2 = 0; e2 < r.length; e2++) exceptionGuard(r[e2]);
    }
  }
  var parseRepoInfo = function(e, t) {
    const n = parseDatabaseURL(e), r = n.namespace;
    "firebase.com" === n.domain && fatal(n.host + " is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"), r && "undefined" !== r || "localhost" === n.domain || fatal("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"), n.secure || "undefined" != typeof window && window.location && window.location.protocol && -1 !== window.location.protocol.indexOf("https:") && warn("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");
    const i2 = "ws" === n.scheme || "wss" === n.scheme;
    return { repoInfo: new RepoInfo(n.host, n.secure, r, i2, t, "", r !== n.subdomain), path: new Path(n.pathString) };
  };
  var parseDatabaseURL = function(e) {
    let t = "", n = "", r = "", i2 = "", o3 = "", s3 = true, a3 = "https", l3 = 443;
    if ("string" == typeof e) {
      let h3 = e.indexOf("//");
      h3 >= 0 && (a3 = e.substring(0, h3 - 1), e = e.substring(h3 + 2));
      let c3 = e.indexOf("/");
      -1 === c3 && (c3 = e.length);
      let d3 = e.indexOf("?");
      -1 === d3 && (d3 = e.length), t = e.substring(0, Math.min(c3, d3)), c3 < d3 && (i2 = (function decodePath(e2) {
        let t2 = "";
        const n2 = e2.split("/");
        for (let e3 = 0; e3 < n2.length; e3++) if (n2[e3].length > 0) {
          let r2 = n2[e3];
          try {
            r2 = decodeURIComponent(r2.replace(/\+/g, " "));
          } catch (e4) {
          }
          t2 += "/" + r2;
        }
        return t2;
      })(e.substring(c3, d3)));
      const u3 = (function decodeQuery(e2) {
        const t2 = {};
        "?" === e2.charAt(0) && (e2 = e2.substring(1));
        for (const n2 of e2.split("&")) {
          if (0 === n2.length) continue;
          const r2 = n2.split("=");
          2 === r2.length ? t2[decodeURIComponent(r2[0])] = decodeURIComponent(r2[1]) : warn(`Invalid query segment '${n2}' in query '${e2}'`);
        }
        return t2;
      })(e.substring(Math.min(e.length, d3)));
      h3 = t.indexOf(":"), h3 >= 0 ? (s3 = "https" === a3 || "wss" === a3, l3 = parseInt(t.substring(h3 + 1), 10)) : h3 = t.length;
      const p3 = t.slice(0, h3);
      if ("localhost" === p3.toLowerCase()) n = "localhost";
      else if (p3.split(".").length <= 2) n = p3;
      else {
        const e2 = t.indexOf(".");
        r = t.substring(0, e2).toLowerCase(), n = t.substring(e2 + 1), o3 = r;
      }
      "ns" in u3 && (o3 = u3.ns);
    }
    return { host: t, port: l3, domain: n, subdomain: r, secure: s3, scheme: a3, pathString: i2, namespace: o3 };
  };
  var z2 = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
  var K2 = /* @__PURE__ */ (function() {
    let e = 0;
    const t = [];
    return function(n) {
      const r = n === e;
      let i2;
      e = n;
      const o3 = new Array(8);
      for (i2 = 7; i2 >= 0; i2--) o3[i2] = z2.charAt(n % 64), n = Math.floor(n / 64);
      assert(0 === n, "Cannot push at time == 0");
      let s3 = o3.join("");
      if (r) {
        for (i2 = 11; i2 >= 0 && 63 === t[i2]; i2--) t[i2] = 0;
        t[i2]++;
      } else for (i2 = 0; i2 < 12; i2++) t[i2] = Math.floor(64 * Math.random());
      for (i2 = 0; i2 < 12; i2++) s3 += z2.charAt(t[i2]);
      return assert(20 === s3.length, "nextPushId: Length should be 20."), s3;
    };
  })();
  var DataEvent = class {
    constructor(e, t, n, r) {
      this.eventType = e, this.eventRegistration = t, this.snapshot = n, this.prevName = r;
    }
    getPath() {
      const e = this.snapshot.ref;
      return "value" === this.eventType ? e._path : e.parent._path;
    }
    getEventType() {
      return this.eventType;
    }
    getEventRunner() {
      return this.eventRegistration.getEventRunner(this);
    }
    toString() {
      return this.getPath().toString() + ":" + this.eventType + ":" + stringify(this.snapshot.exportVal());
    }
  };
  var CancelEvent = class {
    constructor(e, t, n) {
      this.eventRegistration = e, this.error = t, this.path = n;
    }
    getPath() {
      return this.path;
    }
    getEventType() {
      return "cancel";
    }
    getEventRunner() {
      return this.eventRegistration.getEventRunner(this);
    }
    toString() {
      return this.path.toString() + ":cancel";
    }
  };
  var CallbackContext = class {
    constructor(e, t) {
      this.snapshotCallback = e, this.cancelCallback = t;
    }
    onValue(e, t) {
      this.snapshotCallback.call(null, e, t);
    }
    onCancel(e) {
      return assert(this.hasCancelCallback, "Raising a cancel event on a listener with no cancel callback"), this.cancelCallback.call(null, e);
    }
    get hasCancelCallback() {
      return !!this.cancelCallback;
    }
    matches(e) {
      return this.snapshotCallback === e.snapshotCallback || void 0 !== this.snapshotCallback.userCallback && this.snapshotCallback.userCallback === e.snapshotCallback.userCallback && this.snapshotCallback.context === e.snapshotCallback.context;
    }
  };
  var OnDisconnect = class {
    constructor(e, t) {
      this._repo = e, this._path = t;
    }
    cancel() {
      const e = new Deferred2();
      return repoOnDisconnectCancel(this._repo, this._path, e.wrapCallback((() => {
      }))), e.promise;
    }
    remove() {
      validateWritablePath("OnDisconnect.remove", this._path);
      const e = new Deferred2();
      return repoOnDisconnectSet(this._repo, this._path, null, e.wrapCallback((() => {
      }))), e.promise;
    }
    set(e) {
      validateWritablePath("OnDisconnect.set", this._path), validateFirebaseDataArg("OnDisconnect.set", e, this._path, false);
      const t = new Deferred2();
      return repoOnDisconnectSet(this._repo, this._path, e, t.wrapCallback((() => {
      }))), t.promise;
    }
    setWithPriority(e, t) {
      validateWritablePath("OnDisconnect.setWithPriority", this._path), validateFirebaseDataArg("OnDisconnect.setWithPriority", e, this._path, false), validatePriority("OnDisconnect.setWithPriority", t, false);
      const n = new Deferred2();
      return (function repoOnDisconnectSetWithPriority(e2, t2, n2, r, i2) {
        const o3 = nodeFromJSON(n2, r);
        e2.server_.onDisconnectPut(t2.toString(), o3.val(true), ((n3, r2) => {
          "ok" === n3 && sparseSnapshotTreeRemember(e2.onDisconnect_, t2, o3), repoCallOnCompleteCallback(0, i2, n3, r2);
        }));
      })(this._repo, this._path, e, t, n.wrapCallback((() => {
      }))), n.promise;
    }
    update(e) {
      validateWritablePath("OnDisconnect.update", this._path), validateFirebaseMergeDataArg("OnDisconnect.update", e, this._path, false);
      const t = new Deferred2();
      return (function repoOnDisconnectUpdate(e2, t2, n, r) {
        if (isEmpty(n)) return log("onDisconnect().update() called with empty data.  Don't do anything."), void repoCallOnCompleteCallback(0, r, "ok", void 0);
        e2.server_.onDisconnectMerge(t2.toString(), n, ((i2, o3) => {
          "ok" === i2 && each(n, ((n2, r2) => {
            const i3 = nodeFromJSON(r2);
            sparseSnapshotTreeRemember(e2.onDisconnect_, pathChild(t2, n2), i3);
          })), repoCallOnCompleteCallback(0, r, i2, o3);
        }));
      })(this._repo, this._path, e, t.wrapCallback((() => {
      }))), t.promise;
    }
  };
  var QueryImpl = class _QueryImpl {
    constructor(e, t, n, r) {
      this._repo = e, this._path = t, this._queryParams = n, this._orderByCalled = r;
    }
    get key() {
      return pathIsEmpty(this._path) ? null : pathGetBack(this._path);
    }
    get ref() {
      return new ReferenceImpl(this._repo, this._path);
    }
    get _queryIdentifier() {
      const e = queryParamsGetQueryObject(this._queryParams), t = ObjectToUniqueKey(e);
      return "{}" === t ? "default" : t;
    }
    get _queryObject() {
      return queryParamsGetQueryObject(this._queryParams);
    }
    isEqual(e) {
      if (!((e = getModularInstance2(e)) instanceof _QueryImpl)) return false;
      const t = this._repo === e._repo, n = pathEquals(this._path, e._path), r = this._queryIdentifier === e._queryIdentifier;
      return t && n && r;
    }
    toJSON() {
      return this.toString();
    }
    toString() {
      return this._repo.toString() + (function pathToUrlEncodedString(e) {
        let t = "";
        for (let n = e.pieceNum_; n < e.pieces_.length; n++) "" !== e.pieces_[n] && (t += "/" + encodeURIComponent(String(e.pieces_[n])));
        return t || "/";
      })(this._path);
    }
  };
  function validateNoPreviousOrderByCall(e, t) {
    if (true === e._orderByCalled) throw new Error(t + ": You can't combine multiple orderBy calls.");
  }
  function validateQueryEndpoints(e) {
    let t = null, n = null;
    if (e.hasStart() && (t = e.getIndexStartValue()), e.hasEnd() && (n = e.getIndexEndValue()), e.getIndex() === b2) {
      const r = "Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().", i2 = "Query: When ordering by key, the argument passed to startAt(), startAfter(), endAt(), endBefore(), or equalTo() must be a string.";
      if (e.hasStart()) {
        if (e.getIndexStartName() !== v2) throw new Error(r);
        if ("string" != typeof t) throw new Error(i2);
      }
      if (e.hasEnd()) {
        if (e.getIndexEndName() !== C2) throw new Error(r);
        if ("string" != typeof n) throw new Error(i2);
      }
    } else if (e.getIndex() === x2) {
      if (null != t && !isValidPriority(t) || null != n && !isValidPriority(n)) throw new Error("Query: When ordering by priority, the first argument passed to startAt(), startAfter() endAt(), endBefore(), or equalTo() must be a valid priority value (null, a number, or a string).");
    } else if (assert(e.getIndex() instanceof PathIndex || e.getIndex() === W2, "unknown index type."), null != t && "object" == typeof t || null != n && "object" == typeof n) throw new Error("Query: First argument passed to startAt(), startAfter(), endAt(), endBefore(), or equalTo() cannot be an object.");
  }
  function validateLimit(e) {
    if (e.hasStart() && e.hasEnd() && e.hasLimit() && !e.hasAnchoredLimit()) throw new Error("Query: Can't combine startAt(), startAfter(), endAt(), endBefore(), and limit(). Use limitToFirst() or limitToLast() instead.");
  }
  var ReferenceImpl = class _ReferenceImpl extends QueryImpl {
    constructor(e, t) {
      super(e, t, new QueryParams(), false);
    }
    get parent() {
      const e = pathParent(this._path);
      return null === e ? null : new _ReferenceImpl(this._repo, e);
    }
    get root() {
      let e = this;
      for (; null !== e.parent; ) e = e.parent;
      return e;
    }
  };
  var DataSnapshot = class _DataSnapshot {
    constructor(e, t, n) {
      this._node = e, this.ref = t, this._index = n;
    }
    get priority() {
      return this._node.getPriority().val();
    }
    get key() {
      return this.ref.key;
    }
    get size() {
      return this._node.numChildren();
    }
    child(e) {
      const t = new Path(e), n = child(this.ref, e);
      return new _DataSnapshot(this._node.getChild(t), n, x2);
    }
    exists() {
      return !this._node.isEmpty();
    }
    exportVal() {
      return this._node.val(true);
    }
    forEach(e) {
      if (this._node.isLeafNode()) return false;
      return !!this._node.forEachChild(this._index, ((t, n) => e(new _DataSnapshot(n, child(this.ref, t), x2))));
    }
    hasChild(e) {
      const t = new Path(e);
      return !this._node.getChild(t).isEmpty();
    }
    hasChildren() {
      return !this._node.isLeafNode() && !this._node.isEmpty();
    }
    toJSON() {
      return this.exportVal();
    }
    val() {
      return this._node.val();
    }
  };
  function ref(e, t) {
    return (e = getModularInstance2(e))._checkNotDeleted("ref"), void 0 !== t ? child(e._root, t) : e._root;
  }
  function refFromURL(e, t) {
    (e = getModularInstance2(e))._checkNotDeleted("refFromURL");
    const n = parseRepoInfo(t, e._repo.repoInfo_.nodeAdmin);
    validateUrl("refFromURL", n);
    const r = n.repoInfo;
    return e._repo.repoInfo_.isCustomHost() || r.host === e._repo.repoInfo_.host || fatal("refFromURL: Host name does not match the current database: (found " + r.host + " but expected " + e._repo.repoInfo_.host + ")"), ref(e, n.path.toString());
  }
  function child(e, t) {
    var n, r, i2, o3;
    return null === pathGetFront((e = getModularInstance2(e))._path) ? (n = "child", r = "path", o3 = false, (i2 = t) && (i2 = i2.replace(/^\/*\.info(\/|$)/, "/")), validatePathString(n, r, i2, o3)) : validatePathString("child", "path", t, false), new ReferenceImpl(e._repo, pathChild(e._path, t));
  }
  function onDisconnect(e) {
    return e = getModularInstance2(e), new OnDisconnect(e._repo, e._path);
  }
  function push(e, t) {
    e = getModularInstance2(e), validateWritablePath("push", e._path), validateFirebaseDataArg("push", t, e._path, true);
    const n = repoServerTime(e._repo), r = K2(n), i2 = child(e, r), o3 = child(e, r);
    let s3;
    return s3 = null != t ? set(o3, t).then((() => o3)) : Promise.resolve(o3), i2.then = s3.then.bind(s3), i2.catch = s3.then.bind(s3, void 0), i2;
  }
  function remove(e) {
    return validateWritablePath("remove", e._path), set(e, null);
  }
  function set(e, t) {
    e = getModularInstance2(e), validateWritablePath("set", e._path), validateFirebaseDataArg("set", t, e._path, false);
    const n = new Deferred2();
    return repoSetWithPriority(e._repo, e._path, t, null, n.wrapCallback((() => {
    }))), n.promise;
  }
  function setPriority(e, t) {
    e = getModularInstance2(e), validateWritablePath("setPriority", e._path), validatePriority("setPriority", t, false);
    const n = new Deferred2();
    return repoSetWithPriority(e._repo, pathChild(e._path, ".priority"), t, null, n.wrapCallback((() => {
    }))), n.promise;
  }
  function setWithPriority(e, t, n) {
    if (validateWritablePath("setWithPriority", e._path), validateFirebaseDataArg("setWithPriority", t, e._path, false), validatePriority("setWithPriority", n, false), ".length" === e.key || ".keys" === e.key) throw "setWithPriority failed: " + e.key + " is a read-only object.";
    const r = new Deferred2();
    return repoSetWithPriority(e._repo, e._path, t, n, r.wrapCallback((() => {
    }))), r.promise;
  }
  function update(e, t) {
    validateFirebaseMergeDataArg("update", t, e._path, false);
    const n = new Deferred2();
    return (function repoUpdate(e2, t2, n2, r) {
      repoLog(e2, "update", { path: t2.toString(), value: n2 });
      let i2 = true;
      const o3 = repoGenerateServerValues(e2), s3 = {};
      if (each(n2, ((n3, r2) => {
        i2 = false, s3[n3] = resolveDeferredValueTree(pathChild(t2, n3), nodeFromJSON(r2), e2.serverSyncTree_, o3);
      })), i2) log("update() called with empty data.  Don't do anything."), repoCallOnCompleteCallback(0, r, "ok", void 0);
      else {
        const i3 = repoGetNextWriteId(e2), o4 = syncTreeApplyUserMerge(e2.serverSyncTree_, t2, s3, i3);
        eventQueueQueueEvents(e2.eventQueue_, o4), e2.server_.merge(t2.toString(), n2, ((n3, o5) => {
          const s4 = "ok" === n3;
          s4 || warn("update at " + t2 + " failed: " + n3);
          const a3 = syncTreeAckUserWrite(e2.serverSyncTree_, i3, !s4), l3 = a3.length > 0 ? repoRerunTransactions(e2, t2) : t2;
          eventQueueRaiseEventsForChangedPath(e2.eventQueue_, l3, a3), repoCallOnCompleteCallback(0, r, n3, o5);
        })), each(n2, ((n3) => {
          const r2 = repoAbortTransactions(e2, pathChild(t2, n3));
          repoRerunTransactions(e2, r2);
        })), eventQueueRaiseEventsForChangedPath(e2.eventQueue_, t2, []);
      }
    })(e._repo, e._path, t, n.wrapCallback((() => {
    }))), n.promise;
  }
  function get(e) {
    e = getModularInstance2(e);
    const t = new CallbackContext((() => {
    })), n = new ValueEventRegistration(t);
    return (function repoGetValue(e2, t2, n2) {
      const r = syncTreeGetServerValue(e2.serverSyncTree_, t2);
      return null != r ? Promise.resolve(r) : e2.server_.get(t2).then(((r2) => {
        const i2 = nodeFromJSON(r2).withIndex(t2._queryParams.getIndex());
        let o3;
        if (syncTreeAddEventRegistration(e2.serverSyncTree_, t2, n2, true), t2._queryParams.loadsAllData()) o3 = syncTreeApplyServerOverwrite(e2.serverSyncTree_, t2._path, i2);
        else {
          const n3 = syncTreeTagForQuery(e2.serverSyncTree_, t2);
          o3 = syncTreeApplyTaggedQueryOverwrite(e2.serverSyncTree_, t2._path, i2, n3);
        }
        return eventQueueRaiseEventsForChangedPath(e2.eventQueue_, t2._path, o3), syncTreeRemoveEventRegistration(e2.serverSyncTree_, t2, n2, null, true), i2;
      }), ((n3) => (repoLog(e2, "get for query " + stringify(t2) + " failed: " + n3), Promise.reject(new Error(n3)))));
    })(e._repo, e, n).then(((t2) => new DataSnapshot(t2, new ReferenceImpl(e._repo, e._path), e._queryParams.getIndex())));
  }
  var ValueEventRegistration = class _ValueEventRegistration {
    constructor(e) {
      this.callbackContext = e;
    }
    respondsTo(e) {
      return "value" === e;
    }
    createEvent(e, t) {
      const n = t._queryParams.getIndex();
      return new DataEvent("value", this, new DataSnapshot(e.snapshotNode, new ReferenceImpl(t._repo, t._path), n));
    }
    getEventRunner(e) {
      return "cancel" === e.getEventType() ? () => this.callbackContext.onCancel(e.error) : () => this.callbackContext.onValue(e.snapshot, null);
    }
    createCancelEvent(e, t) {
      return this.callbackContext.hasCancelCallback ? new CancelEvent(this, e, t) : null;
    }
    matches(e) {
      return e instanceof _ValueEventRegistration && (!e.callbackContext || !this.callbackContext || e.callbackContext.matches(this.callbackContext));
    }
    hasAnyCallback() {
      return null !== this.callbackContext;
    }
  };
  var ChildEventRegistration = class _ChildEventRegistration {
    constructor(e, t) {
      this.eventType = e, this.callbackContext = t;
    }
    respondsTo(e) {
      let t = "children_added" === e ? "child_added" : e;
      return t = "children_removed" === t ? "child_removed" : t, this.eventType === t;
    }
    createCancelEvent(e, t) {
      return this.callbackContext.hasCancelCallback ? new CancelEvent(this, e, t) : null;
    }
    createEvent(e, t) {
      assert(null != e.childName, "Child events should have a childName.");
      const n = child(new ReferenceImpl(t._repo, t._path), e.childName), r = t._queryParams.getIndex();
      return new DataEvent(e.type, this, new DataSnapshot(e.snapshotNode, n, r), e.prevName);
    }
    getEventRunner(e) {
      return "cancel" === e.getEventType() ? () => this.callbackContext.onCancel(e.error) : () => this.callbackContext.onValue(e.snapshot, e.prevName);
    }
    matches(e) {
      return e instanceof _ChildEventRegistration && (this.eventType === e.eventType && (!this.callbackContext || !e.callbackContext || this.callbackContext.matches(e.callbackContext)));
    }
    hasAnyCallback() {
      return !!this.callbackContext;
    }
  };
  function addEventListener(e, t, n, r, i2) {
    let o3;
    if ("object" == typeof r && (o3 = void 0, i2 = r), "function" == typeof r && (o3 = r), i2 && i2.onlyOnce) {
      const t2 = n, onceCallback = (n2, r2) => {
        repoRemoveEventCallbackForQuery(e._repo, e, a3), t2(n2, r2);
      };
      onceCallback.userCallback = n.userCallback, onceCallback.context = n.context, n = onceCallback;
    }
    const s3 = new CallbackContext(n, o3 || void 0), a3 = "value" === t ? new ValueEventRegistration(s3) : new ChildEventRegistration(t, s3);
    return (function repoAddEventCallbackForQuery(e2, t2, n2) {
      let r2;
      r2 = ".info" === pathGetFront(t2._path) ? syncTreeAddEventRegistration(e2.infoSyncTree_, t2, n2) : syncTreeAddEventRegistration(e2.serverSyncTree_, t2, n2), eventQueueRaiseEventsAtPath(e2.eventQueue_, t2._path, r2);
    })(e._repo, e, a3), () => repoRemoveEventCallbackForQuery(e._repo, e, a3);
  }
  function onValue(e, t, n, r) {
    return addEventListener(e, "value", t, n, r);
  }
  function onChildAdded(e, t, n, r) {
    return addEventListener(e, "child_added", t, n, r);
  }
  function onChildChanged(e, t, n, r) {
    return addEventListener(e, "child_changed", t, n, r);
  }
  function onChildMoved(e, t, n, r) {
    return addEventListener(e, "child_moved", t, n, r);
  }
  function onChildRemoved(e, t, n, r) {
    return addEventListener(e, "child_removed", t, n, r);
  }
  function off(e, t, n) {
    let r = null;
    const i2 = n ? new CallbackContext(n) : null;
    "value" === t ? r = new ValueEventRegistration(i2) : t && (r = new ChildEventRegistration(t, i2)), repoRemoveEventCallbackForQuery(e._repo, e, r);
  }
  var QueryConstraint = class {
  };
  var QueryEndAtConstraint = class extends QueryConstraint {
    constructor(e, t) {
      super(), this._value = e, this._key = t, this.type = "endAt";
    }
    _apply(e) {
      validateFirebaseDataArg("endAt", this._value, e._path, true);
      const t = queryParamsEndAt(e._queryParams, this._value, this._key);
      if (validateLimit(t), validateQueryEndpoints(t), e._queryParams.hasEnd()) throw new Error("endAt: Starting point was already set (by another call to endAt, endBefore or equalTo).");
      return new QueryImpl(e._repo, e._path, t, e._orderByCalled);
    }
  };
  function endAt(e, t) {
    return validateKey("endAt", "key", t, true), new QueryEndAtConstraint(e, t);
  }
  var QueryEndBeforeConstraint = class extends QueryConstraint {
    constructor(e, t) {
      super(), this._value = e, this._key = t, this.type = "endBefore";
    }
    _apply(e) {
      validateFirebaseDataArg("endBefore", this._value, e._path, false);
      const t = (function queryParamsEndBefore(e2, t2, n) {
        let r;
        return r = e2.index_ === b2 || n ? queryParamsEndAt(e2, t2, n) : queryParamsEndAt(e2, t2, v2), r.endBeforeSet_ = true, r;
      })(e._queryParams, this._value, this._key);
      if (validateLimit(t), validateQueryEndpoints(t), e._queryParams.hasEnd()) throw new Error("endBefore: Starting point was already set (by another call to endAt, endBefore or equalTo).");
      return new QueryImpl(e._repo, e._path, t, e._orderByCalled);
    }
  };
  function endBefore(e, t) {
    return validateKey("endBefore", "key", t, true), new QueryEndBeforeConstraint(e, t);
  }
  var QueryStartAtConstraint = class extends QueryConstraint {
    constructor(e, t) {
      super(), this._value = e, this._key = t, this.type = "startAt";
    }
    _apply(e) {
      validateFirebaseDataArg("startAt", this._value, e._path, true);
      const t = queryParamsStartAt(e._queryParams, this._value, this._key);
      if (validateLimit(t), validateQueryEndpoints(t), e._queryParams.hasStart()) throw new Error("startAt: Starting point was already set (by another call to startAt, startBefore or equalTo).");
      return new QueryImpl(e._repo, e._path, t, e._orderByCalled);
    }
  };
  function startAt(e = null, t) {
    return validateKey("startAt", "key", t, true), new QueryStartAtConstraint(e, t);
  }
  var QueryStartAfterConstraint = class extends QueryConstraint {
    constructor(e, t) {
      super(), this._value = e, this._key = t, this.type = "startAfter";
    }
    _apply(e) {
      validateFirebaseDataArg("startAfter", this._value, e._path, false);
      const t = (function queryParamsStartAfter(e2, t2, n) {
        let r;
        return r = e2.index_ === b2 || n ? queryParamsStartAt(e2, t2, n) : queryParamsStartAt(e2, t2, C2), r.startAfterSet_ = true, r;
      })(e._queryParams, this._value, this._key);
      if (validateLimit(t), validateQueryEndpoints(t), e._queryParams.hasStart()) throw new Error("startAfter: Starting point was already set (by another call to startAt, startAfter, or equalTo).");
      return new QueryImpl(e._repo, e._path, t, e._orderByCalled);
    }
  };
  function startAfter(e, t) {
    return validateKey("startAfter", "key", t, true), new QueryStartAfterConstraint(e, t);
  }
  var QueryLimitToFirstConstraint = class extends QueryConstraint {
    constructor(e) {
      super(), this._limit = e, this.type = "limitToFirst";
    }
    _apply(e) {
      if (e._queryParams.hasLimit()) throw new Error("limitToFirst: Limit was already set (by another call to limitToFirst or limitToLast).");
      return new QueryImpl(e._repo, e._path, (function queryParamsLimitToFirst(e2, t) {
        const n = e2.copy();
        return n.limitSet_ = true, n.limit_ = t, n.viewFrom_ = "l", n;
      })(e._queryParams, this._limit), e._orderByCalled);
    }
  };
  function limitToFirst(e) {
    if ("number" != typeof e || Math.floor(e) !== e || e <= 0) throw new Error("limitToFirst: First argument must be a positive integer.");
    return new QueryLimitToFirstConstraint(e);
  }
  var QueryLimitToLastConstraint = class extends QueryConstraint {
    constructor(e) {
      super(), this._limit = e, this.type = "limitToLast";
    }
    _apply(e) {
      if (e._queryParams.hasLimit()) throw new Error("limitToLast: Limit was already set (by another call to limitToFirst or limitToLast).");
      return new QueryImpl(e._repo, e._path, (function queryParamsLimitToLast(e2, t) {
        const n = e2.copy();
        return n.limitSet_ = true, n.limit_ = t, n.viewFrom_ = "r", n;
      })(e._queryParams, this._limit), e._orderByCalled);
    }
  };
  function limitToLast(e) {
    if ("number" != typeof e || Math.floor(e) !== e || e <= 0) throw new Error("limitToLast: First argument must be a positive integer.");
    return new QueryLimitToLastConstraint(e);
  }
  var QueryOrderByChildConstraint = class extends QueryConstraint {
    constructor(e) {
      super(), this._path = e, this.type = "orderByChild";
    }
    _apply(e) {
      validateNoPreviousOrderByCall(e, "orderByChild");
      const t = new Path(this._path);
      if (pathIsEmpty(t)) throw new Error("orderByChild: cannot pass in empty path. Use orderByValue() instead.");
      const n = new PathIndex(t), r = queryParamsOrderBy(e._queryParams, n);
      return validateQueryEndpoints(r), new QueryImpl(e._repo, e._path, r, true);
    }
  };
  function orderByChild(e) {
    if ("$key" === e) throw new Error('orderByChild: "$key" is invalid.  Use orderByKey() instead.');
    if ("$priority" === e) throw new Error('orderByChild: "$priority" is invalid.  Use orderByPriority() instead.');
    if ("$value" === e) throw new Error('orderByChild: "$value" is invalid.  Use orderByValue() instead.');
    return validatePathString("orderByChild", "path", e, false), new QueryOrderByChildConstraint(e);
  }
  var QueryOrderByKeyConstraint = class extends QueryConstraint {
    constructor() {
      super(...arguments), this.type = "orderByKey";
    }
    _apply(e) {
      validateNoPreviousOrderByCall(e, "orderByKey");
      const t = queryParamsOrderBy(e._queryParams, b2);
      return validateQueryEndpoints(t), new QueryImpl(e._repo, e._path, t, true);
    }
  };
  function orderByKey() {
    return new QueryOrderByKeyConstraint();
  }
  var QueryOrderByPriorityConstraint = class extends QueryConstraint {
    constructor() {
      super(...arguments), this.type = "orderByPriority";
    }
    _apply(e) {
      validateNoPreviousOrderByCall(e, "orderByPriority");
      const t = queryParamsOrderBy(e._queryParams, x2);
      return validateQueryEndpoints(t), new QueryImpl(e._repo, e._path, t, true);
    }
  };
  function orderByPriority() {
    return new QueryOrderByPriorityConstraint();
  }
  var QueryOrderByValueConstraint = class extends QueryConstraint {
    constructor() {
      super(...arguments), this.type = "orderByValue";
    }
    _apply(e) {
      validateNoPreviousOrderByCall(e, "orderByValue");
      const t = queryParamsOrderBy(e._queryParams, W2);
      return validateQueryEndpoints(t), new QueryImpl(e._repo, e._path, t, true);
    }
  };
  function orderByValue() {
    return new QueryOrderByValueConstraint();
  }
  var QueryEqualToValueConstraint = class extends QueryConstraint {
    constructor(e, t) {
      super(), this._value = e, this._key = t, this.type = "equalTo";
    }
    _apply(e) {
      if (validateFirebaseDataArg("equalTo", this._value, e._path, false), e._queryParams.hasStart()) throw new Error("equalTo: Starting point was already set (by another call to startAt/startAfter or equalTo).");
      if (e._queryParams.hasEnd()) throw new Error("equalTo: Ending point was already set (by another call to endAt/endBefore or equalTo).");
      return new QueryEndAtConstraint(this._value, this._key)._apply(new QueryStartAtConstraint(this._value, this._key)._apply(e));
    }
  };
  function equalTo(e, t) {
    return validateKey("equalTo", "key", t, true), new QueryEqualToValueConstraint(e, t);
  }
  function query(e, ...t) {
    let n = getModularInstance2(e);
    for (const e2 of t) n = e2._apply(n);
    return n;
  }
  !(function syncPointSetReferenceConstructor(e) {
    assert(!B2, "__referenceConstructor has already been defined"), B2 = e;
  })(ReferenceImpl), (function syncTreeSetReferenceConstructor(e) {
    assert(!U2, "__referenceConstructor has already been defined"), U2 = e;
  })(ReferenceImpl);
  var Y = {};
  var $2 = false;
  function repoManagerDatabaseFromApp(e, t, n, r, i2) {
    let o3 = r || e.options.databaseURL;
    void 0 === o3 && (e.options.projectId || fatal("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."), log("Using default host for project ", e.options.projectId), o3 = `${e.options.projectId}-default-rtdb.firebaseio.com`);
    let s3, a3, l3 = parseRepoInfo(o3, i2), h3 = l3.repoInfo;
    "undefined" != typeof process && process.env && (a3 = process.env.FIREBASE_DATABASE_EMULATOR_HOST), a3 ? (s3 = true, o3 = `http://${a3}?ns=${h3.namespace}`, l3 = parseRepoInfo(o3, i2), h3 = l3.repoInfo) : s3 = !l3.repoInfo.secure;
    const c3 = i2 && s3 ? new EmulatorTokenProvider(EmulatorTokenProvider.OWNER) : new FirebaseAuthTokenProvider(e.name, e.options, t);
    validateUrl("Invalid Firebase Database URL", l3), pathIsEmpty(l3.path) || fatal("Database URL must point to the root of a Firebase Database (not including a child path).");
    const d3 = (function repoManagerCreateRepo(e2, t2, n2, r2) {
      let i3 = Y[t2.name];
      i3 || (i3 = {}, Y[t2.name] = i3);
      let o4 = i3[e2.toURLString()];
      o4 && fatal("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call.");
      return o4 = new Repo(e2, $2, n2, r2), i3[e2.toURLString()] = o4, o4;
    })(h3, e, c3, new AppCheckTokenProvider(e.name, n));
    return new Database(d3, e);
  }
  var Database = class {
    constructor(e, t) {
      this._repoInternal = e, this.app = t, this.type = "database", this._instanceStarted = false;
    }
    get _repo() {
      return this._instanceStarted || (repoStart(this._repoInternal, this.app.options.appId, this.app.options.databaseAuthVariableOverride), this._instanceStarted = true), this._repoInternal;
    }
    get _root() {
      return this._rootInternal || (this._rootInternal = new ReferenceImpl(this._repo, newEmptyPath())), this._rootInternal;
    }
    _delete() {
      return null !== this._rootInternal && (!(function repoManagerDeleteRepo(e, t) {
        const n = Y[t];
        n && n[e.key] === e || fatal(`Database ${t}(${e.repoInfo_}) has already been deleted.`), repoInterrupt(e), delete n[e.key];
      })(this._repo, this.app.name), this._repoInternal = null, this._rootInternal = null), Promise.resolve();
    }
    _checkNotDeleted(e) {
      null === this._rootInternal && fatal("Cannot call " + e + " on a deleted database.");
    }
  };
  function checkTransportInit() {
    TransportManager.IS_TRANSPORT_INITIALIZED && warn("Transport has already been initialized. Please call this function before calling ref or setting up a listener");
  }
  function forceWebSockets() {
    checkTransportInit(), BrowserPollConnection.forceDisallow();
  }
  function forceLongPolling() {
    checkTransportInit(), WebSocketConnection.forceDisallow(), BrowserPollConnection.forceAllow();
  }
  function getDatabase(t = getApp(), n) {
    const r = _getProvider(t, "database").getImmediate({ identifier: n });
    if (!r._instanceStarted) {
      const e = getDefaultEmulatorHostnameAndPort("database");
      e && connectDatabaseEmulator(r, ...e);
    }
    return r;
  }
  function connectDatabaseEmulator(e, t, n, r = {}) {
    (e = getModularInstance2(e))._checkNotDeleted("useEmulator"), e._instanceStarted && fatal("Cannot call useEmulator() after instance has already been initialized.");
    const i2 = e._repoInternal;
    let o3;
    if (i2.repoInfo_.nodeAdmin) r.mockUserToken && fatal('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'), o3 = new EmulatorTokenProvider(EmulatorTokenProvider.OWNER);
    else if (r.mockUserToken) {
      const t2 = "string" == typeof r.mockUserToken ? r.mockUserToken : (function createMockUserToken(e2, t3) {
        if (e2.uid) throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
        const n2 = t3 || "demo-project", r2 = e2.iat || 0, i3 = e2.sub || e2.user_id;
        if (!i3) throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
        const o4 = Object.assign({ iss: `https://securetoken.google.com/${n2}`, aud: n2, iat: r2, exp: r2 + 3600, auth_time: r2, sub: i3, user_id: i3, firebase: { sign_in_provider: "custom", identities: {} } }, e2);
        return [base64urlEncodeWithoutPadding2(JSON.stringify({ alg: "none", type: "JWT" })), base64urlEncodeWithoutPadding2(JSON.stringify(o4)), ""].join(".");
      })(r.mockUserToken, e.app.options.projectId);
      o3 = new EmulatorTokenProvider(t2);
    }
    !(function repoManagerApplyEmulatorSettings(e2, t2, n2, r2) {
      e2.repoInfo_ = new RepoInfo(`${t2}:${n2}`, false, e2.repoInfo_.namespace, e2.repoInfo_.webSocketOnly, e2.repoInfo_.nodeAdmin, e2.repoInfo_.persistenceKey, e2.repoInfo_.includeNamespaceInQueryParams, true), r2 && (e2.authTokenProvider_ = r2);
    })(i2, t, n, o3);
  }
  function goOffline(e) {
    (e = getModularInstance2(e))._checkNotDeleted("goOffline"), repoInterrupt(e._repo);
  }
  function goOnline(e) {
    (e = getModularInstance2(e))._checkNotDeleted("goOnline"), (function repoResume(e2) {
      e2.persistentConnection_ && e2.persistentConnection_.resume("repo_interrupt");
    })(e._repo);
  }
  function enableLogging(e, t) {
    enableLogging$1(e, t);
  }
  var J2 = { ".sv": "timestamp" };
  function serverTimestamp() {
    return J2;
  }
  function increment(e) {
    return { ".sv": { increment: e } };
  }
  var TransactionResult = class {
    constructor(e, t) {
      this.committed = e, this.snapshot = t;
    }
    toJSON() {
      return { committed: this.committed, snapshot: this.snapshot.toJSON() };
    }
  };
  function runTransaction(e, t, n) {
    var r;
    if (e = getModularInstance2(e), validateWritablePath("Reference.transaction", e._path), ".length" === e.key || ".keys" === e.key) throw "Reference.transaction failed: " + e.key + " is a read-only object.";
    const i2 = null === (r = null == n ? void 0 : n.applyLocally) || void 0 === r || r, o3 = new Deferred2(), s3 = onValue(e, (() => {
    }));
    return (function repoStartTransaction(e2, t2, n2, r2, i3, o4) {
      repoLog(e2, "transaction on " + t2);
      const s4 = { path: t2, update: n2, onComplete: r2, status: null, order: f2(), applyLocally: o4, retryCount: 0, unwatcher: i3, abortReason: null, currentWriteId: null, currentInputSnapshot: null, currentOutputSnapshotRaw: null, currentOutputSnapshotResolved: null }, a3 = repoGetLatestState(e2, t2, void 0);
      s4.currentInputSnapshot = a3;
      const l3 = s4.update(a3.val());
      if (void 0 === l3) s4.unwatcher(), s4.currentOutputSnapshotRaw = null, s4.currentOutputSnapshotResolved = null, s4.onComplete && s4.onComplete(null, false, s4.currentInputSnapshot);
      else {
        validateFirebaseData("transaction failed: Data returned ", l3, s4.path), s4.status = 0;
        const n3 = treeSubTree(e2.transactionQueueTree_, t2), r3 = treeGetValue(n3) || [];
        let i4;
        r3.push(s4), treeSetValue(n3, r3), "object" == typeof l3 && null !== l3 && contains(l3, ".priority") ? (i4 = safeGet(l3, ".priority"), assert(isValidPriority(i4), "Invalid priority returned by transaction. Priority must be a valid string, finite number, server value, or null.")) : i4 = (syncTreeCalcCompleteEventCache(e2.serverSyncTree_, t2) || ChildrenNode.EMPTY_NODE).getPriority().val();
        const o5 = repoGenerateServerValues(e2), h3 = nodeFromJSON(l3, i4), c3 = resolveDeferredValueSnapshot(h3, a3, o5);
        s4.currentOutputSnapshotRaw = h3, s4.currentOutputSnapshotResolved = c3, s4.currentWriteId = repoGetNextWriteId(e2);
        const d3 = syncTreeApplyUserOverwrite(e2.serverSyncTree_, t2, c3, s4.currentWriteId, s4.applyLocally);
        eventQueueRaiseEventsForChangedPath(e2.eventQueue_, t2, d3), repoSendReadyTransactions(e2, e2.transactionQueueTree_);
      }
    })(e._repo, e._path, t, ((t2, n2, r2) => {
      let i3 = null;
      t2 ? o3.reject(t2) : (i3 = new DataSnapshot(r2, new ReferenceImpl(e._repo, e._path), x2), o3.resolve(new TransactionResult(n2, i3)));
    }), s3, i2), o3.promise;
  }
  PersistentConnection.prototype.simpleListen = function(e, t) {
    this.sendRequest("q", { p: e }, t);
  }, PersistentConnection.prototype.echo = function(e, t) {
    this.sendRequest("echo", { d: e }, t);
  };
  var hijackHash = function(e) {
    const t = PersistentConnection.prototype.put;
    return PersistentConnection.prototype.put = function(n, r, i2, o3) {
      void 0 !== o3 && (o3 = e()), t.call(this, n, r, i2, o3);
    }, function() {
      PersistentConnection.prototype.put = t;
    };
  };
  var forceRestClient = function(e) {
    !(function repoManagerForceRestClient(e2) {
      $2 = e2;
    })(e);
  };
  function _initStandalone({ app: e, url: t, version: n, customAuthImpl: r, customAppCheckImpl: i2, nodeAdmin: o3 = false }) {
    setSDKVersion(n);
    const s3 = new ComponentContainer2("database-standalone"), a3 = new Provider2("auth-internal", s3);
    let l3;
    return i2 && (l3 = new Provider2("app-check-internal", s3), l3.setComponent(new Component3("app-check-internal", (() => i2), "PRIVATE"))), a3.setComponent(new Component3("auth-internal", (() => r), "PRIVATE")), repoManagerDatabaseFromApp(e, a3, l3, t, o3);
  }
  !(function registerDatabase(e) {
    setSDKVersion(SDK_VERSION), _registerComponent(new Component3("database", ((e2, { instanceIdentifier: t }) => repoManagerDatabaseFromApp(e2.getProvider("app").getImmediate(), e2.getProvider("auth-internal"), e2.getProvider("app-check-internal"), t)), "PUBLIC").setMultipleInstances(true)), registerVersion(d2, "1.0.10", e), registerVersion(d2, "1.0.10", "esm2017");
  })();

  // entry.js
  window.firebaseApp = firebase_app_exports;
  window.firebaseAuth = firebase_auth_exports;
  window.firebaseDatabase = firebase_database_exports;
})();

/* ===================== ٢) كود المنصة ===================== */
/* ============================================================
   ماذا لو؟ — مولد أسئلة جدلية + تصويت
   كل الكود في ملف واحد. مفيش مكتبات خارجية. مفيش إيموجي.
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     1) أدوات عامة
     ========================================================== */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const nf = new Intl.NumberFormat('en-US');
  const num = (n) => nf.format(Math.round(Number(n) || 0));
  const pct = (n) => num(n) + '%';
  const todayKey = () => new Date().toLocaleDateString('en-CA');

  function pctOf(counts) {
    const t = sum(counts) || 1;
    const out = counts.map((c) => Math.round((c / t) * 100));
    const diff = 100 - sum(out);
    if (out.length) out[out.indexOf(Math.max.apply(null, out))] += diff;
    return out.map((n) => clamp(n, 0, 100));
  }

  /* ==========================================================
     2) الأيقونات (SVG بدل الإيموجي)
     ========================================================== */
  const PATHS = {
    home: '<path d="M3.5 10.6 12 3.8l8.5 6.8V20a1 1 0 0 1-1 1h-4.6v-6.3H9.1V21H5a1 1 0 0 1-1-1z"/>',
    dice: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.4"/><circle cx="8.4" cy="8.4" r="1.15" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.6" cy="15.6" r="1.15" fill="currentColor" stroke="none"/>',
    users: '<circle cx="9.2" cy="8.4" r="3.3"/><path d="M3.4 20.2c0-3.3 2.6-5.4 5.8-5.4s5.8 2.1 5.8 5.4"/><path d="M16.2 5.6a3.3 3.3 0 0 1 0 5.9"/><path d="M17.4 14.9c2 .7 3.2 2.5 3.2 5.3"/>',
    gamepad: '<rect x="2.6" y="7.4" width="18.8" height="9.6" rx="4.8"/><path d="M7 10.4v3.6M5.2 12.2h3.6"/><circle cx="16.1" cy="11.4" r="1.1" fill="currentColor" stroke="none"/><circle cx="18.3" cy="13.6" r="1.1" fill="currentColor" stroke="none"/>',
    pencil: '<path d="M4 20h4.2L20.2 8 16 3.8 4 15.8z"/><path d="M14.4 5.4 18.6 9.6"/>',
    chart: '<path d="M4 20.2h16"/><path d="M7.2 16.6V11M12 16.6V6.6M16.8 16.6v-3.8"/>',
    trophy: '<path d="M7.2 4h9.6v4.2a4.8 4.8 0 0 1-9.6 0z"/><path d="M7.2 6H4.6a3.4 3.4 0 0 0 3.3 3.6M16.8 6h2.6a3.4 3.4 0 0 1-3.3 3.6"/><path d="M12 13.2v3.6M8.6 20.2h6.8"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.2 4.2v4.2H16"/>',
    check: '<path d="M4.6 12.6l4.9 4.9L19.4 7.2"/>',
    plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
    minus: '<path d="M5.2 12h13.6"/>',
    share: '<circle cx="17.8" cy="5.6" r="2.5"/><circle cx="6.2" cy="12" r="2.5"/><circle cx="17.8" cy="18.4" r="2.5"/><path d="M8.4 10.8 15.6 6.9M8.4 13.2l7.2 3.9"/>',
    whatsapp: '<path d="M12 3.4A8.6 8.6 0 0 0 4.6 16.4L3.4 20.6l4.3-1.2A8.6 8.6 0 1 0 12 3.4z"/><path d="M9.2 8.5h1.4l.8 2-1 1c.5 1.1 1.3 1.9 2.4 2.4l1-1 2 .8v1.4c0 .6-.5 1.1-1.1 1.1-2.9 0-5.3-2.4-5.3-5.3 0-.6.5-1.4 1.1-1.4z"/>',
    sound: '<path d="M4.2 9.4h3.2L11.6 5.8v12.4L7.4 14.6H4.2z"/><path d="M14.8 9.2a4 4 0 0 1 0 5.6"/><path d="M17.3 6.6a7.6 7.6 0 0 1 0 10.8"/>',
    mute: '<path d="M4.2 9.4h3.2L11.6 5.8v12.4L7.4 14.6H4.2z"/><path d="M15 9.6l4 4.8M19 9.6l-4 4.8"/>',
    back: '<path d="M15 4.6 7.6 12 15 19.4"/>',
    next: '<path d="M9 4.6 16.4 12 9 19.4"/>',
    clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3.1 2"/>',
    sparkle: '<path d="M11.6 3.6 13.3 8l4.4 1.7-4.4 1.7-1.7 4.4-1.7-4.4L5.5 9.7 9.9 8z"/><path d="M18.2 15.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    sprout: '<path d="M12 20.2v-6.4"/><path d="M12 13.8c-3.9 0-6-2-6-4.9 3.9 0 6 2 6 4.9z"/><path d="M12 13.8c3.9 0 6-2 6-4.9-3.9 0-6 2-6 4.9z"/>',
    question: '<circle cx="12" cy="12" r="8.4"/><path d="M9.4 9.5a2.8 2.8 0 1 1 3.8 2.6c-.8.4-1.2 1-1.2 1.9v.4"/><circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none"/>',
    trash: '<path d="M4.6 7.2h14.8"/><path d="M9.2 7.2V4.6h5.6v2.6"/><path d="M6.6 7.2 7.6 20.2h8.8l1-13"/>',
    image: '<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2.8"/><circle cx="8.6" cy="9.4" r="1.6"/><path d="M4.4 17.2l4.6-4.2 3.4 3 2.8-2.4 4.4 4"/>',
    download: '<path d="M12 4.4v10.4"/><path d="M8 11l4 4 4-4"/><path d="M4.6 19.6h14.8"/>',
    play: '<path d="M8.4 5.4 19 12 8.4 18.6z"/>',
    expand: '<path d="M9.2 3.8H3.8v5.4M14.8 3.8h5.4v5.4M9.2 20.2H3.8v-5.4M14.8 20.2h5.4v-5.4"/>',
    bolt: '<path d="M13.6 3.4 6.4 13.6h4.3L10 20.6l7.2-10.2H13z"/>',
    target: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    /* أيقونات الأقسام */
    wallet: '<rect x="3.2" y="6" width="17.6" height="12.8" rx="3"/><path d="M3.2 10h17.6"/><circle cx="16.6" cy="14.6" r="1.2" fill="currentColor" stroke="none"/>',
    plane: '<path d="M20.8 4.2 3.4 10.9l6.4 2.6 2.6 6.4z"/><path d="M9.8 13.5 20.8 4.2"/>',
    food: '<path d="M8 3.4v7.4M10.6 3.4v7.4M9.3 10.8v9.8"/><path d="M17.2 3.4c1.7 1.5 2.4 3.2 2.4 5.4 0 1.7-.8 2.7-2.4 3.1v8.7"/>',
    heart: '<path d="M12 20.2s-7.4-4.5-7.4-9.3a4.2 4.2 0 0 1 7.4-2.8 4.2 4.2 0 0 1 7.4 2.8c0 4.8-7.4 9.3-7.4 9.3z"/>',
    phone: '<rect x="6.6" y="2.6" width="10.8" height="18.8" rx="2.8"/><path d="M10.6 18.4h2.8"/>',
    mask: '<circle cx="12" cy="12" r="8.4"/><path d="M8.6 14.4c.9 1.4 2.1 2.1 3.4 2.1s2.5-.7 3.4-2.1"/><circle cx="9.1" cy="9.9" r="1" fill="currentColor" stroke="none"/><circle cx="14.9" cy="9.9" r="1" fill="currentColor" stroke="none"/>',
    book: '<path d="M4 4.6h6.4A2.6 2.6 0 0 1 13 7.2v13a2 2 0 0 0-2-2H4z"/><path d="M20 4.6h-6.4A2.6 2.6 0 0 0 11 7.2v13a2 2 0 0 1 2-2h7z"/>',
    bus: '<rect x="3.4" y="4" width="17.2" height="12.8" rx="2.6"/><path d="M3.4 11h17.2"/><circle cx="7.6" cy="19.2" r="1.6"/><circle cx="16.4" cy="19.2" r="1.6"/>',
    brain: '<path d="M12 5.6a3 3 0 0 0-5.5 1.7A3 3 0 0 0 5.1 12a3 3 0 0 0 1.6 4.6A3 3 0 0 0 12 18.6z"/><path d="M12 5.6a3 3 0 0 1 5.5 1.7A3 3 0 0 1 18.9 12a3 3 0 0 1-1.6 4.6A3 3 0 0 1 12 18.6z"/><path d="M12 5.6v13"/>'
  };

  function ICON(name, cls) {
    const p = PATHS[name] || PATHS.sparkle;
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }

  /* ==========================================================
     3) الشعار (SVG)
     ========================================================== */
  let uidn = 0;
  const uid = () => 'g' + (++uidn) + Math.random().toString(36).slice(2, 6);

  function LOGO_MARK(size, flat) {
    const s = size || 40, id = uid(), rot = flat ? 0 : -4;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 64 64" fill="none" aria-hidden="true" ' +
      'style="transform:rotate(' + rot + 'deg);display:block">' +
      '<defs><linearGradient id="' + id + '" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">' +
      '<stop stop-color="#7b5cff"/><stop offset=".52" stop-color="#ff2d92"/><stop offset="1" stop-color="#ffb03a"/></linearGradient></defs>' +
      '<rect x="1" y="1" width="62" height="62" rx="18" fill="url(#' + id + ')"/>' +
      '<path d="M21.6 23.4c0-6.2 4.6-10.8 10.4-10.8s10.4 4.4 10.4 9.9c0 4.4-2.4 6.8-5.6 8.7-2.6 1.6-4.6 2.9-4.6 5.7v1.4" ' +
      'stroke="#150a1e" stroke-width="7.2" stroke-linecap="round" fill="none"/>' +
      '<circle cx="32.2" cy="48.6" r="4.1" fill="#150a1e"/>' +
      '<path d="M49.4 9.6l1.7 4.2 4.2 1.7-4.2 1.7-1.7 4.2-1.7-4.2-4.2-1.7 4.2-1.7z" fill="#fff" opacity=".92"/>' +
      '</svg>';
  }

  function LOGO_LOCKUP(size) {
    const s = size || 40;
    return '<span class="brand__mark">' + LOGO_MARK(s) + '</span>' +
      '<span class="brand__text">المليون؟<small>أسئلة وجايزة بالمليون</small></span>';
  }

  /* ==========================================================
     4) الأسئلة (قاعدة البيانات)
     ========================================================== */
  const CATS = [
    { id: 'money', name: 'فلوس وشغل', icon: 'wallet', color: '#ffb03a' },
    { id: 'powers', name: 'قدرات خارقة', icon: 'bolt', color: '#7b5cff' },
    { id: 'travel', name: 'سفر ومغامرة', icon: 'plane', color: '#22d3ee' },
    { id: 'food', name: 'أكل', icon: 'food', color: '#ff5c7a' },
    { id: 'love', name: 'حب وجواز', icon: 'heart', color: '#ff8fab' },
    { id: 'tech', name: 'تكنولوجيا', icon: 'phone', color: '#2ec4b6' },
    { id: 'weird', name: 'غريب ومضحك', icon: 'mask', color: '#a3e635' },
    { id: 'study', name: 'دراسة وشغل', icon: 'book', color: '#8ac926' },
    { id: 'trip', name: 'رحلات', icon: 'bus', color: '#4cc9f0' },
    { id: 'deep', name: 'أسئلة عميقة', icon: 'brain', color: '#a78bfa' }
  ];

  const BASE = [
    /* فلوس وشغل */
    { id: 'm1', c: 'money', q: 'ماذا لو خيّروك بين مليون جنيه دلوقتي على طول، ولا ٥ مليون بعد ٥ سنين؟', o: ['مليون دلوقتي حالًا', '٥ مليون بعد ٥ سنين'], s: [62, 38] },
    { id: 'm2', c: 'money', q: 'ماذا لو خيّروك بين راتب ٣٠ ألف وشغل تقيل ومحتاجه كل يوم، ولا ١٢ ألف وشغل بتحبّه؟', o: ['٣٠ ألف وشغل تقيل', '١٢ ألف وشغل بتحبّه'], s: [48, 52] },
    { id: 'm3', c: 'money', q: 'ماذا لو خيّروك بين تبقى مليونير في السر ومحدش يعرف، ولا مشهور وعندك ١٠٠ ألف بس؟', o: ['مليونير محدش يعرف', 'مشهور و١٠٠ ألف'], s: [71, 29] },
    { id: 'm4', c: 'money', q: 'ماذا لو كل شهر يختفي معاك ١٠٠٠ جنيه، على إيه هتصرفهم؟', o: ['أكل وشرب', 'سفر', 'تكنولوجيا', 'هدوم'], s: [38, 30, 18, 14] },
    { id: 'm5', c: 'money', q: 'ماذا لو خيّروك بين تشتغل من البيت للأبد، ولا تروح المكتب للأبد؟', o: ['من البيت للأبد', 'المكتب للأبد'], s: [67, 33] },
    { id: 'm6', c: 'money', q: 'ماذا لو الكاش اتلغي خالص وبقى كل حاجة بالكارت والبصمة؟', o: ['أيوه طبعًا، أسهل', 'لا طبعًا، الكاش أمان'], s: [41, 59] },
    /* قدرات خارقة */
    { id: 'p1', c: 'powers', q: 'ماذا لو خيّروك بين تقرا أفكار الناس، ولا تبقى غير مرئي وقت اللي تحب؟', o: ['أقرا الأفكار', 'أبقى غير مرئي'], s: [55, 45] },
    { id: 'p2', c: 'powers', q: 'ماذا لو خيّروك بين تطير، ولا تختفي من غير ما حد يحس؟', o: ['أطير', 'أختفي'], s: [64, 36] },
    { id: 'p3', c: 'powers', q: 'ماذا لو خيّروك بين ترجع في الزمن ١٠ سنين بكل اللي تعرفه، ولا تشوف المستقبل ٥ سنين؟', o: ['أرجع للورا', 'أشوف المستقبل'], s: [58, 42] },
    { id: 'p4', c: 'powers', q: 'ماذا لو خيّروك بين متخافش من أي حاجة خالص، ولا تبقى أقوى واحد في الشارع؟', o: ['شجاعة من غير خوف', 'قوة ورهبة'], s: [46, 54] },
    { id: 'p5', c: 'powers', q: 'ماذا لو خيّروك بين تطير بسرعة ٣٠٠ كم/س، ولا تتنقل بين أي مكانين في ثانية؟', o: ['طيران سريع', 'تنقّل لحظي'], s: [39, 61] },
    { id: 'p6', c: 'powers', q: 'ماذا لو خيّروك تختار قدرة واحدة بس، هتختار إيه؟', o: ['الطيران', 'قراءة الأفكار', 'السفر في الزمن', 'الشفاء'], s: [34, 27, 24, 15] },
    /* سفر */
    { id: 't1', c: 'travel', q: 'ماذا لو خيّروك بين أسبوع سفر في شقة فخمة، ولا شهر كامل بترابيزة وشنطة على ضهرك؟', o: ['أسبوع فخم', 'شهر على أد الحال'], s: [42, 58] },
    { id: 't2', c: 'travel', q: 'ماذا لو خيّروك بين تسافر أبعد مكان في العالم لوحدك، ولا رحلة قريبة مع ١٠ من صحابك؟', o: ['أبعد مكان لوحدي', 'رحلة مع الشلة'], s: [29, 71] },
    { id: 't3', c: 'travel', q: 'ماذا لو الدنيا كلها بقت مفتوحة ليك ببلاش، بس ممنوع تركب طيارة؟', o: ['ماشي، أتنقل بأي حاجة', 'لأ، من غير طيارة مش بروح'], s: [68, 32] },
    { id: 't4', c: 'travel', q: 'ماذا لو خيّروك بين تعيش سنة في اليابان، ولا سنة في إيطاليا؟', o: ['اليابان', 'إيطاليا'], s: [52, 48] },
    /* أكل */
    { id: 'f1', c: 'food', q: 'ماذا لو خيّروك بين مفيش كشري تاني في الدنيا أبدًا، ولا مفيش شاي تاني أبدًا؟', o: ['كشري ولا شاي', 'شاي ولا كشري'], s: [57, 43] },
    { id: 'f2', c: 'food', q: 'ماذا لو خيّروك بين تأكل حلويات كل يوم للأبد، ولا مفيش حلويات خالص تاني؟', o: ['حلويات كل يوم', 'بلاش حلويات خالص'], s: [76, 24] },
    { id: 'f3', c: 'food', q: 'ماذا لو خيّروك بين تاكل أكلك المفضل كل يوم لسنة، ولا تبعد عنه سنة؟', o: ['كل يوم سنة كاملة', 'أستغنى عنه سنة'], s: [44, 56] },
    { id: 'f4', c: 'food', q: 'ماذا لو مسموح لك بتلات أصناف بس على مدار حياتك؟', o: ['كشري وطعمية', 'مكرونة وباستا', 'مشويات', 'فطير وحلويات'], s: [31, 26, 24, 19] },
    { id: 'f5', c: 'food', q: 'ماذا لو خيّروك بين فطار بلدي كل يوم، ولا فطار فندق فخم كل يوم؟', o: ['فطار بلدي', 'فطار فندق'], s: [66, 34] },
    /* حب */
    { id: 'l1', c: 'love', q: 'ماذا لو خيّروك بين حبيب بيحبك بجد ومفيش فلوس، ولا حد غني ومش بيحبك؟', o: ['حب ونقعد على أدنا', 'فلوس وإحساس بلاش'], s: [79, 21] },
    { id: 'l2', c: 'love', q: 'ماذا لو خيّروك بين جواز من غير حب، ولا حب من غير جواز؟', o: ['جواز من غير حب', 'حب من غير جواز'], s: [36, 64] },
    { id: 'l3', c: 'love', q: 'ماذا لو خيّروك بين تعرف كل أسرار شريكك، ولا يبقى عندك سر واحد مش هينكشف أبدًا؟', o: ['أعرف كل أسراره', 'أحتفظ بسرّي'], s: [47, 53] },
    { id: 'l4', c: 'love', q: 'ماذا لو الجو بقى مثالي، بس لازم تسكن مع أهل الطرف التاني في نفس العمارة؟', o: ['ماشي، الجو هيكمل', 'لأ شكرًا، عايز خصوصية'], s: [31, 69] },
    /* تكنولوجيا */
    { id: 'x1', c: 'tech', q: 'ماذا لو خيّروك بين تعيش من غير سوشيال ميديا سنة، ولا من غير تليفون أسبوع؟', o: ['من غير سوشيال سنة', 'من غير تليفون أسبوع'], s: [61, 39] },
    { id: 'x2', c: 'tech', q: 'ماذا لو خيّروك بين بطارية أسبوع، ولا إنترنت ١ جيجا في أي مكان؟', o: ['بطارية أسبوع', 'نت صاروخي'], s: [43, 57] },
    { id: 'x3', c: 'tech', q: 'ماذا لو الذكاء الاصطناعي بقى يشتغل مكانك، وأنت بتاخد نص الراتب وتقعد في البيت؟', o: ['موافق فورًا', 'لأ، عايز أشتغل بنفسي'], s: [72, 28] },
    { id: 'x4', c: 'tech', q: 'ماذا لو لازم تستغنى عن تليفونك يوم كامل، هتستغنى عن إيه الأول؟', o: ['السوشيال', 'الواتساب', 'الألعاب', 'الكاميرا'], s: [29, 41, 17, 13] },
    /* غريب ومضحك */
    { id: 'w1', c: 'weird', q: 'ماذا لو خيّروك بين عينك تبقى كاميرا بتسجل كل حاجة، ولا ودنك تسمع من ١٠٠ متر؟', o: ['كاميرا في عيني', 'سمع من ١٠٠ متر'], s: [38, 62] },
    { id: 'w2', c: 'weird', q: 'ماذا لو كل مرة تكدب يطلع على وشك لون أزرق لمدة ساعة؟', o: ['هبقى صادق جدًا', 'هبقى أزرق على طول'], s: [74, 26] },
    { id: 'w3', c: 'weird', q: 'ماذا لو خيّروك بين تمشي على إيديك شهر، ولا تتكلم شهر؟', o: ['أمشي على إيديا', 'أسكت شهر'], s: [21, 79] },
    { id: 'w4', c: 'weird', q: 'ماذا لو كل الأغاني بقت بصوتك للأبد، ولا مفيش أغاني تاني في الدنيا؟', o: ['أغاني بصوتي', 'مفيش موسيقى'], s: [33, 67] },
    { id: 'w5', c: 'weird', q: 'ماذا لو خيّروك بين تنام ساعتين بس من غير تعب، ولا ١٠ ساعات وتعيش نص يومك نايم؟', o: ['ساعتين ونشيط', '١٠ ساعات ومرتاح'], s: [55, 45] },
    { id: 'w6', c: 'weird', q: 'ماذا لو كل حاجة بتاكلها بتتحول للون الأخضر قبل ما تدوقها؟', o: ['مش مشكلة', 'لأ، شهيتي هتقفل'], s: [24, 76] },
    { id: 'w7', c: 'weird', q: 'ماذا لو لازم تختار صوت واحد بس يفضل شغال حواليك للأبد؟', o: ['صوت المطر', 'صوت البحر', 'سكوت تام', 'صوت صحابك'], s: [34, 29, 22, 15] },
    /* دراسة وشغل */
    { id: 's1', c: 'study', q: 'ماذا لو خيّروك بين ترجع ثانوي بس بذكاء اليوم ده، ولا تدخل الكلية اللي نفسك فيها من غير امتحان؟', o: ['أرجع ثانوي', 'كلية من غير امتحان'], s: [35, 65] },
    { id: 's2', c: 'study', q: 'ماذا لو كل حاجة ذاكرتها بتفضل في دماغك للأبد، بس بتيجي في المنام وتصحى تعبان؟', o: ['ذاكرة خارقة', 'لأ، نومي أهم'], s: [57, 43] },
    { id: 's3', c: 'study', q: 'ماذا لو خيّروك بين شغل حلمك براتب متوسط، ولا شغل مش بتحبه براتب عالي؟', o: ['حلمي مهما كان', 'الراتب العالي'], s: [49, 51] },
    { id: 's4', c: 'study', q: 'ماذا لو خيّروك بين تشتغل شغلين وتجيب دبل، ولا شغل واحد براحة بالك؟', o: ['شغلين ومضاعفة', 'شغل واحد وهدوء'], s: [31, 69] },
    /* رحلات */
    { id: 'r1', c: 'trip', q: 'ماذا لو خيّروك بين رحلة يوم مع الشلة كل أسبوع، ولا رحلة أسبوع كامل كل سنة؟', o: ['كل أسبوع يوم', 'أسبوع كامل في السنة'], s: [58, 42] },
    { id: 'r2', c: 'trip', q: 'ماذا لو هتسافر مع ٢٠ واحد ببصلة، ولا مع ٣ بس كل واحد فيهم هيمسك وينجّم؟', o: ['٢٠ واحد وعشوائية', '٣ بس وانتظام'], s: [44, 56] },
    { id: 'r3', c: 'trip', q: 'ماذا لو في الرحلة مسموح لك باختيار الأغاني للأبد، ولا الأكل للأبد؟', o: ['أنا الدي جي', 'أنا الشيف'], s: [52, 48] },
    { id: 'r4', c: 'trip', q: 'ماذا لو خيّروك بين مكان ببحر جميل ومفيش نت، ولا مكان عادي ونت صاروخي؟', o: ['بحر ومفيش نت', 'عادي ونت سريع'], s: [63, 37] },
    { id: 'r5', c: 'trip', q: 'ماذا لو هتورّد شنطة رحلة واحدة بس، هتفضّل إيه؟', o: ['أكل وسناكس', 'هدوم زيادة', 'أدوات ترفيه', 'أدوية وإسعافات'], s: [30, 27, 25, 18] },
    /* أسئلة عميقة */
    { id: 'd1', c: 'deep', q: 'ماذا لو خيّروك بين تعرف السبب الحقيقي لكل حاجة حصلت في حياتك، ولا تعيش في سلام من غير ما تعرف؟', o: ['أعرف كل حاجة', 'عيش في سلام'], s: [44, 56] },
    { id: 'd2', c: 'deep', q: 'ماذا لو أغلى صحابك في وقت محتاجك، بس هتضحي بحلمك عشانه؟', o: ['أضحي بالحلم', 'أفضل على حلمي'], s: [67, 33] },
    { id: 'd3', c: 'deep', q: 'ماذا لو خيّروك بين تعيش ١٠٠ سنة بصحة كاملة لوحدك، ولا ٦٠ سنة وسط كل اللي بتحبهم؟', o: ['١٠٠ سنة لوحدي', '٦٠ سنة معاهم'], s: [14, 86] },
    { id: 'd4', c: 'deep', q: 'ماذا لو تعرف موعد آخر يوم في حياتك، تقدر تكمل عادي؟', o: ['أيوه، هختار أعيشه صح', 'لأ، معرفته هتقتلني'], s: [58, 42] },
    { id: 'd5', c: 'deep', q: 'ماذا لو خيّروك بين تكون سعيد ومحدش فاكرك بعد ١٠ سنين، ولا مشهور ومش سعيد؟', o: ['سعيد ومنسي', 'مشهور وموجوع'], s: [82, 18] },
    { id: 'd6', c: 'deep', q: 'ماذا لو خيّروك تمسح حاجة واحدة من حياتك للأبد؟', o: ['الخوف', 'الندم', 'الغضب', 'الملل'], s: [31, 27, 22, 20] }
  ];

  /* ==========================================================
     5) التخزين والتصويت
     ========================================================== */
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('ml_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ml_' + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem('ml_' + k); } catch (e) {} }
  };

  /* التخزين المحلي بقى للتفضيلات الشخصية بس (الصوت، الستريك، الجولة المفتوحة).
     الأصوات والأسئلة والإحصائيات كلها في Firebase Realtime Database — مفيش بيانات وهمية. */
  const store = {
    settings: LS.get('settings', { sound: true }),
    streak: LS.get('streak', { n: 0, last: '' }),
    save(k) { LS.set(k, this[k]); }
  };

  const allQuestions = () => BASE.concat(customQuestions());
  const byId = (id) => allQuestions().find((q) => q.id === id) || null;
  const catOf = (id) => CATS.find((c) => c.id === id) || null;

  /* أسئلة الزوار — جاية من Firebase (مفيش أسئلة محلية) */
  function customQuestions() {
    return Object.keys(DATA.questions || {}).map((key) => {
      const v = DATA.questions[key] || {};
      const opts = ['o0', 'o1', 'o2', 'o3'].map((k) => v[k]).filter((x) => typeof x === 'string' && x.trim());
      return { id: key, q: v.q, o: opts, c: v.c || 'weird', custom: true, by: v.name || '', at: v.at || 0 };
    }).sort((a, b) => (b.at || 0) - (a.at || 0));
  }

  /* الأصوات الحقيقية من قاعدة البيانات */
  function countsOf(q) {
    const row = (DATA.votes && DATA.votes[q.id]) || {};
    const out = q.o.map(() => 0);
    Object.keys(row).forEach((uid) => {
      const i = Number(row[uid]);
      if (i >= 0 && i < out.length) out[i] += 1;
    });
    return out;
  }

  const myVote = (qid) => {
    if (!AUTH.user) return undefined;
    const row = (DATA.votes && DATA.votes[qid]) || {};
    const v = row[AUTH.user.id];
    return v === undefined || v === null ? undefined : Number(v);
  };
  const realVotes = (q) => sum(countsOf(q));
  const totalVotes = () => Object.keys(DATA.votes || {}).reduce((n, k) => n + Object.keys(DATA.votes[k] || {}).length, 0);
  const myVotesCount = () => Object.keys(DATA.votes || {}).filter((k) => myVote(k) !== undefined).length;

  /* تسجيل الصوت في قاعدة البيانات: صوت واحد لكل حساب لكل سؤال */
  async function castVote(q, idx) {
    if (!AUTH.user) {
      AUTH.afterAuth = '#/q/' + encodeURIComponent(q.id);
      toast('سجّل دخول عشان صوتك يتحسب للجميع');
      location.hash = '#/auth?tab=login';
      return false;
    }
    if (myVote(q.id) !== undefined) return false;
    try {
      await FB.mod.db.set(FB.ref(FB.paths.myVote(q.id, AUTH.user.id)), idx);
    } catch (e) {
      toast(fbWriteError(e));
      return false;
    }
    const t = todayKey(), st = store.streak;
    if (st.last !== t) {
      const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA');
      st.n = st.last === y ? (st.n || 0) + 1 : 1;
      st.last = t; store.save('streak');
    }
    SFX.pick();
    return true;
  }

  /* نشر سؤال جديد في قاعدة البيانات */
  async function addCustom(q) {
    if (!AUTH.user) throw new Error('سجّل دخول الأول عشان سؤالك يتنشر للكل.');
    const opts = q.o.slice(0, 4).map((x) => String(x).trim().slice(0, 60));
    const payload = {
      q: String(q.q || '').trim().slice(0, 160),
      c: q.c || 'weird',
      uid: AUTH.user.id,
      name: (AUTH.user.name || 'لاعب').slice(0, 40),
      at: Date.now()
    };
    /* الاختيارات بتتخزن مفاتيح o0..o3 عشان قواعد Firebase تتحقق منها */
    opts.forEach((o, i) => { payload['o' + i] = o; });
    const r = FB.mod.db.push(FB.ref('questions'), payload);
    await r;
    return { id: r.key, q: payload.q, o: opts, c: payload.c, custom: true, by: payload.name, at: payload.at };
  }

  /* ==========================================================
     5.5) مشاركة حقيقية لتطبيقات الموبايل
     - Web Share API (ملف + نص) → يفتح شيت المشاركة الأصلي في الموبايل
     - fallback: deep links لكل تطبيق + نسخ
     ========================================================== */
  const APP_URL = () => pageUrl();

  function shareTextFor(kind, extra) {
    const g = MZ.g || {};
    if (kind === 'win') {
      return 'كسبت المليون في «من سيربح المليون؟» — ' + num(MZ_TOTAL) + ' سؤال و٤٠ مستوى.\nجرّب تكسب الشيك: ' + APP_URL();
    }
    if (kind === 'out') {
      return 'انسحبت بـ ' + mzMoney(g.amount || 0) + ' في «من سيربح المليون؟» — تقدر توصل أعلى؟\n' + APP_URL();
    }
    if (kind === 'lose') {
      return 'وصلت مستوى ' + num(g.correct || 0) + ' من ' + num(MZ_TOTAL) + ' في «من سيربح المليون؟» — جرّب تغلبني:\n' + APP_URL();
    }
    return extra || ('العب «من سيربح المليون؟» — ' + num(MZ_TOTAL) + ' سؤال لحد مليون جنيه:\n' + APP_URL());
  }

  function mzShareKind() {
    const g = MZ.g || {};
    if (g.stage === 'win') return 'win';
    if (g.stage === 'out') return 'out';
    if (g.stage === 'lose') return 'lose';
    return 'invite';
  }

  /* هل المتصفح بيدعم مشاركة الملفات؟ */
  function canShareFiles(file) {
    try {
      return !!(navigator.canShare && navigator.canShare({ files: [file] }));
    } catch (e) { return false; }
  }

  function chequeFile() {
    const cv = document.getElementById('mzCheque');
    if (!cv) return null;
    try {
      const data = cv.toDataURL('image/png').split(',')[1];
      const bin = atob(data);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return new File([arr], 'cheque-million.png', { type: 'image/png' });
    } catch (e) { return null; }
  }

  /* المشاركة الأصلية: بتفتح شيت التطبيقات (واتساب/تليجرام/فيسبوك/ماسنجر/…) */
  async function nativeShare(opts) {
    opts = opts || {};
    const text = shareTextFor(mzShareKind(), opts.text);
    const file = opts.withImage ? chequeFile() : null;
    if (navigator.share) {
      try {
        if (file && canShareFiles(file)) {
          await navigator.share({ title: 'من سيربح المليون؟', text: text, url: APP_URL(), files: [file] });
          return 'shared-file';
        }
        await navigator.share({ title: 'من سيربح المليون؟', text: text, url: APP_URL() });
        return 'shared';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'abort';
      }
    }
    const ok = await copyText(text);
    return ok ? 'copied' : 'fail';
  }

  /* مسار مباشر لكل تطبيق (بيشتغل على الموبايل حتى من غير Web Share) */
  function appLinks(text) {
    const t = encodeURIComponent(text);
    return {
      whatsapp: 'https://wa.me/?text=' + t,
      telegram: 'https://t.me/share/url?url=' + encodeURIComponent(APP_URL()) + '&text=' + t,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(APP_URL()) + '&quote=' + t,
      messenger: 'fb-messenger://share?link=' + encodeURIComponent(APP_URL()),
      sms: 'sms:?&body=' + t,
      mail: 'mailto:?subject=' + encodeURIComponent('من سيربح المليون؟') + '&body=' + t
    };
  }

  function mzShareButtons() {
    const L = appLinks(shareTextFor(mzShareKind()));
    const b = (act, icon, label, href) => href
      ? '<a class="shareapp shareapp--' + act + '" href="' + href + '" ' + (act === 'messenger' ? '' : 'target="_blank" rel="noopener"') + '>' + ICON(icon) + '<span>' + label + '</span></a>'
      : '<button class="shareapp shareapp--' + act + '" type="button" data-act="share-' + act + '">' + ICON(icon) + '<span>' + label + '</span></button>';
    return b('native', 'share', 'مشاركة…', null) +
      b('whatsapp', 'whatsapp', 'واتساب', L.whatsapp) +
      b('telegram', 'send', 'تليجرام', L.telegram) +
      b('facebook', 'facebook', 'فيسبوك', L.facebook) +
      b('messenger', 'chat', 'ماسنجر', L.messenger) +
      b('sms', 'phone', 'رسالة SMS', L.sms) +
      b('mail', 'mail', 'إيميل', L.mail) +
      b('copy', 'link', 'نسخ الرابط', null);
  }

  async function mzShareAction(which) {
    if (which === 'native') {
      const r = await nativeShare({ withImage: true });
      if (r === 'shared-file') toast('اتفتح شيت المشاركة — اختار التطبيق وابعت الشيك');
      else if (r === 'shared') toast('اتفتح شيت المشاركة — اختار التطبيق');
      else if (r === 'copied') toast('المتصفح مش بيدعم المشاركة — اتنسخ النص، ابعته على واتساب');
      return;
    }
    if (which === 'copy') {
      const ok = await copyText(shareTextFor(mzShareKind()));
      toast(ok ? 'اتنسخ النص والرابط — ابعته على أي تطبيق' : 'مش قادر أنسخ — اختار رابط من الصفحة');
    }
  }

  /* ==========================================================
     6) صوت + توست + كونفيتي
     ========================================================== */
  const SFX = {
    ctx: null,
    get on() { return !!store.settings.sound; },
    ensure() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx && AC) this.ctx = new AC();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    blip(f, d, type, g) {
      if (!this.on) return;
      const ctx = this.ensure(); if (!ctx) return;
      try {
        const o = ctx.createOscillator(), gn = ctx.createGain();
        o.type = type || 'sine'; o.frequency.value = f;
        const t = ctx.currentTime;
        gn.gain.setValueAtTime(0.0001, t);
        gn.gain.exponentialRampToValueAtTime(g || 0.05, t + 0.012);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + (d || 0.09));
        o.connect(gn); gn.connect(ctx.destination);
        o.start(t); o.stop(t + (d || 0.09) + 0.03);
      } catch (e) {}
    },
    tick() { this.blip(420, 0.05, 'triangle', 0.03); },
    pick() { this.blip(620, 0.08); setTimeout(() => this.blip(900, 0.12), 70); },
    reveal() { [520, 700, 880].forEach((f, i) => setTimeout(() => this.blip(f, 0.12, 'sine', 0.045), i * 70)); },
    win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.18, 'sine', 0.05), i * 95)); },
    toggle() { store.settings.sound = !store.settings.sound; store.save('settings'); if (store.settings.sound) this.pick(); return store.settings.sound; }
  };

  let toastT = null;
  function toast(msg, ms) {
    const box = $('#toast'); if (!box) return;
    box.firstElementChild.textContent = msg;
    box.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => box.classList.remove('is-on'), ms || 2300);
  }

  function confetti(x, y, n) {
    const layer = $('#confetti'); if (!layer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#7b5cff', '#ff2d92', '#22d3ee', '#ffb03a', '#a3e635', '#ff8fab'];
    const cx = x == null ? window.innerWidth / 2 : x;
    const cy = y == null ? window.innerHeight * 0.35 : y;
    for (let i = 0; i < (n || 16); i++) {
      const p = document.createElement('i');
      const ang = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 150;
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      p.style.background = pick(colors);
      p.style.width = (6 + Math.random() * 7) + 'px';
      p.style.height = (6 + Math.random() * 7) + 'px';
      p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(ang) * dist + 45 + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      layer.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }

  /* ==========================================================
     7) مشاركة
     ========================================================== */
  const pageUrl = () => location.href.split('#')[0];
  const qUrl = (id) => pageUrl() + '#/q/' + encodeURIComponent(id);

  async function copyText(txt) {
    /* الطريقة الحديثة أولًا (وتشتغل بس على https أو localhost) */
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(txt); return true; } catch (e) {}
    }
    /* احتياطي قديم — بيشتغل على أي متصفح، وخصوصًا على الموبايل */
    try {
      const ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, txt.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return !!ok;
    } catch (e) { return false; }
  }

  async function shareQuestion(q) {
    const text = q.q + '\n\nصوّت وقولي رأيك: ' + qUrl(q.id);
    if (navigator.share) {
      try { await navigator.share({ title: 'ماذا لو؟', text: text, url: qUrl(q.id) }); return 'shared'; }
      catch (e) { if (e && e.name === 'AbortError') return 'abort'; }
    }
    return (await copyText(text)) ? 'copied' : 'fail';
  }

  /* ==========================================================
     7.4) Firebase — الاتصال الحقيقي
     ----------------------------------------------------------
     • Firebase Authentication : حسابات حقيقية (إيميل/باسورد + جوجل)
     • Realtime Database       : التصويتات، الأسئلة، الإحصائيات، المتصدرين
     الإعدادات في الثابت FB_CONFIG تحت — مفيش وضع تجريبي ولا حسابات محلية.
     ========================================================== */
  /* مفتاح المشروع — نفس كائن firebaseConfig بالحرف (مدمج هنا، مفيش ملف إعداد خارجي) */
  const FB_CONFIG = {
    apiKey: 'AIzaSyBeor8MTz1uaQumT3C4FFE6M7FZisPvom0',
    authDomain: 'edulearn-platform-55b45.firebaseapp.com',
    databaseURL: 'https://edulearn-platform-55b45-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'edulearn-platform-55b45',
    storageBucket: 'edulearn-platform-55b45.firebasestorage.app',
    messagingSenderId: '866736202453',
    appId: '1:866736202453:web:879aebd5cbdb4af740385c'
  };

  /* Firebase SDK — مدمج في نفس الملف (مفيش ملفات خارجية ولا CDN) */
  const FB_SDK = {
    app: window.firebaseApp,
    auth: window.firebaseAuth,
    db: window.firebaseDatabase
  };

  const FB = {
    ready: false,
    error: '',
    app: null,
    auth: null,
    db: null,
    mod: {},

    configured() {
      return !!(FB_CONFIG && FB_CONFIG.apiKey && FB_CONFIG.projectId && FB_CONFIG.databaseURL);
    },

    async init() {
      if (!this.configured()) { this.error = 'config'; return false; }
      try {
        const appMod = FB_SDK.app, authMod = FB_SDK.auth, dbMod = FB_SDK.db;
        if (!appMod || !authMod || !dbMod) { this.error = 'sdk'; return false; }
        this.app = appMod.initializeApp(FB_CONFIG);
        this.auth = authMod.getAuth(this.app);
        this.db = dbMod.getDatabase(this.app);
        this.mod = { app: appMod, auth: authMod, db: dbMod };
        try { await authMod.setPersistence(this.auth, authMod.browserLocalPersistence); } catch (e) {}
        this.ready = true;
        return true;
      } catch (e) {
        this.error = (e && e.message) || 'init';
        this.ready = false;
        return false;
      }
    },

    paths: {
      profile: (uid) => 'profiles/' + uid,
      stats: (uid) => 'stats/' + uid,
      myVote: (qid, uid) => 'votes/' + qid + '/' + uid,
      question: (key) => 'questions/' + key,
      board: (uid) => 'leaderboard/' + uid
    },

    ref(path) { return this.mod.db.ref(this.db, path); },

    watch(path, onValue) {
      if (!this.ready) return null;
      const r = this.ref(path);
      try {
        this.mod.db.onValue(r, (snap) => { try { onValue(snap.val()); } catch (e) {} }, () => {});
      } catch (e) { return null; }
      return r;
    },

    off(r) { if (r && this.ready) { try { this.mod.db.off(r); } catch (e) {} } }
  };

  function fbWriteError(e) {
    const c = String((e && (e.code || e.message)) || '');
    if (c.indexOf('permission') > -1) return 'مش مسموح بحفظ ده دلوقتي — جرّب تاني بعد شوية.';
    if (c.indexOf('network') > -1 || c.indexOf('offline') > -1) return 'مشكلة في النت — جرّب تاني.';
    if (c.indexOf('auth') > -1) return 'لازم تسجّل دخول الأول.';
    return 'حصلت مشكلة في الحفظ — جرّب تاني.';
  }

  /* ==========================================================
     7.5) المصادقة — Firebase Authentication (تسجيل حقيقي)
     ========================================================== */
  const AUTH_CONFIG = {
    /* نطاقات مسموح لها بالرجوع بعد تسجيل جوجل */
    redirectHosts: ['localhost', '127.0.0.1']
  };

  const AUTH = {
    user: null,
    mode: 'off',
    busy: false,
    loaded: false,
    afterAuth: null,
    fb: null,
    listeners: [],

    on(fn) { this.listeners.push(fn); },
    emit() { this.listeners.forEach((fn) => { try { fn(this.user); } catch (e) {} }); },

    /* ---------- التهيئة ---------- */
    async init() {
      const ok = await FB.init();
      AUTH.mode = ok ? 'firebase' : 'off';
      AUTH.fb = ok ? { app: FB.app, auth: FB.auth, authMod: FB.mod.auth, dbMod: FB.mod.db } : null;
      if (!ok) {
        AUTH.loaded = true;
        AUTH.emit();
        syncChrome();
        return;
      }
      FB.mod.auth.onAuthStateChanged(FB.auth, (u) => {
        AUTH.user = u ? AUTH.normalize({
          id: u.uid,
          name: u.displayName || (u.email || '').split('@')[0],
          email: u.email || '',
          provider: (u.providerData[0] && u.providerData[0].providerId) || 'password',
          photo: u.photoURL || ''
        }) : null;
        AUTH.loaded = true;
        AUTH.emit();
        syncChrome();
        if (AUTH.user) { DATA.start(); AUTH.saveProfile(); }
        else { DATA.stop(); roomLeave(true); }
        const r = parse();
        if (r.name === 'auth' || r.name === 'million' || r.name === 'home' || r.name === 'party') render(false);
      });
    },

    ready() { return AUTH.mode === 'firebase' && !!AUTH.fb; },

    normalize(u) {
      return {
        id: u.id || '',
        name: u.name || (u.email || '').split('@')[0],
        email: u.email || '',
        provider: u.provider || 'password',
        photo: u.photo || ''
      };
    },

    /* ---------- بروفايل في قاعدة البيانات ---------- */
    saveProfile() {
      if (!AUTH.ready() || !AUTH.user) return;
      const payload = {
        name: (AUTH.user.name || 'لاعب').slice(0, 40),
        email: AUTH.user.email || '',
        uid: AUTH.user.id,
        at: Date.now()
      };
      try { FB.mod.db.set(FB.ref(FB.paths.profile(AUTH.user.id)), payload).catch(() => {}); } catch (e) {}
    },

    /* ---------- إنشاء حساب ---------- */
    async signup(name, email, pw) {
      if (!AUTH.ready()) throw new Error('الخدمة مش متاحة دلوقتي — حدّث الصفحة وجرّب تاني.');
      name = String(name || '').trim();
      email = String(email || '').trim().toLowerCase();
      const check = AUTH.validate(name, email, pw);
      if (check) throw new Error(check);
      const { auth, authMod } = AUTH.fb;
      try {
        const cred = await authMod.createUserWithEmailAndPassword(auth, email, pw);
        if (name && cred.user) { try { await authMod.updateProfile(cred.user, { displayName: name }); } catch (e) {} }
        return cred.user;
      } catch (e) {
        throw new Error(AUTH.fbError(e));
      }
    },

    /* ---------- تسجيل الدخول ---------- */
    async login(email, pw) {
      if (!AUTH.ready()) throw new Error('الخدمة مش متاحة دلوقتي — حدّث الصفحة وجرّب تاني.');
      email = String(email || '').trim().toLowerCase();
      if (!AUTH.validEmail(email)) throw new Error('اكتب إيميل صحيح.');
      if (!pw) throw new Error('اكتب كلمة المرور.');
      const { auth, authMod } = AUTH.fb;
      try {
        return await authMod.signInWithEmailAndPassword(auth, email, pw);
      } catch (e) {
        throw new Error(AUTH.fbError(e));
      }
    },

    /* ---------- تسجيل بجوجل (نافذة جوجل الحقيقية) ---------- */
    async google() {
      if (!AUTH.ready()) throw new Error('الخدمة مش متاحة دلوقتي — حدّث الصفحة وجرّب تاني.');
      const { auth, authMod } = AUTH.fb;
      const provider = new authMod.GoogleAuthProvider();
      try {
        const res = await authMod.signInWithPopup(auth, provider);
        return res.user;
      } catch (e) {
        if (e && e.code === 'auth/popup-blocked') {
          await authMod.signInWithRedirect(auth, provider);
          return null;
        }
        throw new Error(AUTH.fbError(e));
      }
    },

    /* ---------- خروج ---------- */
    async logout() {
      if (ROOM.code) await roomLeave(true);
      if (AUTH.ready()) { try { await AUTH.fb.authMod.signOut(AUTH.fb.auth); } catch (e) {} }
      AUTH.user = null;
      DATA.stop();
      AUTH.emit();
      syncChrome();
    },

    /* ---------- تحديث الاسم ---------- */
    update(patch) {
      if (!AUTH.user) return;
      AUTH.user = Object.assign({}, AUTH.user, patch);
      if (AUTH.ready() && patch.name) {
        try {
          const p = AUTH.fb.authMod.updateProfile(AUTH.fb.auth.currentUser, { displayName: patch.name });
          if (p && p.catch) p.catch(() => {});
        } catch (e) {}
      }
      AUTH.saveProfile();
      syncChrome();
    },

    /* ---------- إحصائيات اللعب في قاعدة البيانات ---------- */
    recordWin() { bumpStats({ wins: 1, plays: 0, best: 1000000 }); },
    recordPlay() { bumpStats({ wins: 0, plays: 1, best: 0 }); },
    recordBest(v) { bumpStats({ wins: 0, plays: 0, best: Number(v) || 0 }); },

    /* ---------- مساعدات ---------- */
    validEmail(e) { return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(e || '').trim()); },

    validate(name, email, pw) {
      if (!name || name.length < 2) return 'اكتب اسمك (حرفين على الأقل).';
      if (!AUTH.validEmail(email)) return 'اكتب إيميل صحيح زي name@example.com.';
      if (!pw || pw.length < 6) return 'كلمة المرور لازم ٦ حروف أو أرقام على الأقل.';
      return '';
    },

    fbError(e) {
      const c = (e && e.code) || '';
      const map = {
        'auth/email-already-in-use': 'الإيميل ده متسجل قبل كده — جرّب تسجيل الدخول.',
        'auth/invalid-email': 'الإيميل مش صحيح.',
        'auth/weak-password': 'كلمة المرور ضعيفة — ٦ حروف على الأقل.',
        'auth/user-not-found': 'مفيش حساب بالإيميل ده.',
        'auth/wrong-password': 'كلمة المرور غلط.',
        'auth/invalid-credential': 'الإيميل أو كلمة المرور غلط.',
        'auth/invalid-login-credentials': 'الإيميل أو كلمة المرور غلط.',
        'auth/too-many-requests': 'محاولات كثيرة — استنى شوية وجرّب تاني.',
        'auth/network-request-failed': 'مشكلة في النت — جرّب تاني.',
        'auth/popup-closed-by-user': 'قفلت نافذة جوجل قبل ما تكمّل.',
        'auth/popup-blocked': 'المتصفح منع النافذة — اسمح بالنوافذ المنبثقة وجرّب.',
        'auth/operation-not-allowed': 'الطريقة دي مش متاحة دلوقتي — جرّب الإيميل أو حدّث الصفحة.',
        'auth/unauthorized-domain': 'مش قادرين نكمّل من العنوان ده — افتح الموقع من رابطه الرسمي.',
        'auth/api-key-not-valid': 'الخدمة مش متاحة دلوقتي — جرّب تاني بعد شوية.',
        'auth/account-exists-with-different-credential': 'الإيميل ده متسجل بطريقة تانية — سجّل دخول بنفس الطريقة القديمة.'
      };
      return map[c] || (e && e.message) || 'حصلت مشكلة — جرّب تاني.';
    }
  };

  /* ==========================================================
     7.6) طبقة البيانات الحقيقية (Realtime Database)
     ========================================================== */
  const DATA = {
    refs: [],
    votes: {},
    questions: {},
    stats: { plays: 0, wins: 0, best: 0 },
    board: {},
    started: false,

    start() {
      DATA.stop();
      if (!FB.ready || !AUTH.user) return;
      DATA.started = true;
      const uid = AUTH.user.id;
      DATA.refs.push(FB.watch('votes', (v) => { DATA.votes = v || {}; dataChanged(); }));
      DATA.refs.push(FB.watch('questions', (v) => { DATA.questions = v || {}; dataChanged(); }));
      DATA.refs.push(FB.watch(FB.paths.stats(uid), (v) => { DATA.stats = v || { plays: 0, wins: 0, best: 0 }; dataChanged(); }));
      DATA.refs.push(FB.watch('leaderboard', (v) => { DATA.board = v || {}; dataChanged(); }));
    },

    stop() {
      DATA.refs.forEach((r) => FB.off(r));
      DATA.refs = [];
      DATA.votes = {};
      DATA.questions = {};
      DATA.stats = { plays: 0, wins: 0, best: 0 };
      DATA.board = {};
      DATA.started = false;
    }
  };

  const myStats = () => ({
    plays: Number((DATA.stats && DATA.stats.plays) || 0),
    wins: Number((DATA.stats && DATA.stats.wins) || 0),
    best: Number((DATA.stats && DATA.stats.best) || 0)
  });

  /* زيادة الإحصائيات بشكل آمن (transaction) + تحديث لوحة المتصدرين */
  function bumpStats(delta) {
    if (!FB.ready || !AUTH.user) return;
    const uid = AUTH.user.id;
    const sref = FB.ref(FB.paths.stats(uid));
    const bref = FB.ref(FB.paths.board(uid));
    try {
      const t = FB.mod.db.runTransaction(sref, (cur) => {
        const s = cur || { plays: 0, wins: 0, best: 0 };
        return {
          plays: Number(s.plays || 0) + Number(delta.plays || 0),
          wins: Number(s.wins || 0) + Number(delta.wins || 0),
          best: Math.max(Number(s.best || 0), Number(delta.best || 0))
        };
      });
      if (t && t.then) {
        t.then((res) => {
          const s = (res && res.snapshot && res.snapshot.val && res.snapshot.val()) || {};
          return FB.mod.db.set(bref, {
            name: (AUTH.user.name || 'لاعب').slice(0, 40),
            best: Number(s.best || 0),
            wins: Number(s.wins || 0),
            plays: Number(s.plays || 0),
            at: Date.now()
          });
        }).catch(() => {});
      }
    } catch (e) {}
  }

  /* إعادة رسم خفيفة لما البيانات تتغير */
  let dataRenderT = null;
  function dataChanged() {
    clearTimeout(dataRenderT);
    dataRenderT = setTimeout(() => {
      const r = parse();
      if (r.name === 'create' || r.name === 'auth' || r.name === 'games') return;
      render(false);
    }, 260);
  }

  /* ---------- شريط المستخدم في الهيدر ---------- */
  function renderUserBox() {
    const box = $('#userBox');
    if (!box) return;
    const u = AUTH.user;
    if (!u) {
      box.innerHTML = '<a class="userbtn userbtn--in" href="#/auth" data-nav="auth">' + ICON('idcard') + '<span>دخول</span></a>';
      return;
    }
    const initial = (u.name || u.email || '؟').trim().charAt(0);
    const avatar = u.photo
      ? '<img src="' + esc(u.photo) + '" alt="" referrerpolicy="no-referrer">'
      : '<b>' + esc(initial) + '</b>';
    box.innerHTML = '<div class="userchip" id="userChip">' +
        '<button class="userchip__btn" type="button" data-act="user-menu" aria-expanded="false" aria-haspopup="menu">' +
          '<span class="userchip__av">' + avatar + '</span>' +
          '<span class="userchip__n">' + esc(u.name) + '</span>' +
          ICON('chevron') +
        '</button>' +
        '<div class="usermenu" id="userMenu" role="menu">' +
          '<div class="usermenu__head"><b>' + esc(u.name) + '</b><span>' + esc(u.email) + '</span></div>' +
          '<a href="#/auth" role="menuitem">' + ICON('idcard') + ' حسابي وإحصائياتي</a>' +
          '<a href="#/million" role="menuitem">' + ICON('crown') + ' كمّل اللعب</a>' +
          '<button type="button" role="menuitem" data-act="logout">' + ICON('logout') + ' تسجيل الخروج</button>' +
        '</div>' +
      '</div>';
  }

  /* ---------- شاشات الحساب ---------- */
  function authCardHTML(tab) {
    const isLogin = tab !== 'signup';
    const u = AUTH.user;
    if (u) {
      return '<section class="wrap page authpage">' +
        '<div class="authcard authcard--profile">' +
          '<div class="authcard__av">' + (u.photo ? '<img src="' + esc(u.photo) + '" alt="">' : '<b>' + esc((u.name || '؟').charAt(0)) + '</b>') + '</div>' +
          '<h1 class="authcard__t">أهلاً ' + esc(u.name) + '</h1>' +
          '<p class="authcard__s">' + esc(u.email) + ' · ' + (u.provider === 'google' ? 'حساب جوجل' : 'حساب بالإيميل') + '</p>' +
          '<div class="authstats">' +
            '<div class="stat"><b>' + num(myStats().wins) + '</b><span>مرات الفوز</span></div>' +
            '<div class="stat"><b>' + num(myStats().plays) + '</b><span>جولات لعبتها</span></div>' +
            '<div class="stat"><b>' + num(myStats().best) + '</b><span>أعلى مكسب</span></div>' +
          '</div>' +
          '<div class="authstats">' +
            '<div class="stat"><b>' + num(myVotesCount()) + '</b><span>أصواتك في «ماذا لو»</span></div>' +
            '<div class="stat"><b>' + num(Object.keys(DATA.questions || {}).length) + '</b><span>أسئلة الزوار</span></div>' +
            '<div class="stat"><b>' + num(totalVotes()) + '</b><span>إجمالي أصوات الموقع</span></div>' +
          '</div>' +
          '<div class="authcard__acts">' +
            '<a class="btn btn--primary btn--lg" href="#/million">' + ICON('play') + ' العب دلوقتي</a>' +
            '<button class="btn btn--ghost" data-act="logout" type="button">' + ICON('logout') + ' تسجيل الخروج</button>' +
          '</div>' +
          '<p class="hint">الحساب بيحفظ اسمك وإحصائياتك — وجولتك المفتوحة بتفضل مستنية.</p>' +
        '</div>' +
      '</section>';
    }

    return '<section class="wrap page authpage">' +
      '<div class="authcard">' +
        '<div class="authcard__logo">' + LOGO_MARK(46) + '</div>' +
        '<h1 class="authcard__t">' + (isLogin ? 'تسجيل الدخول' : 'اعمل حساب جديد') + '</h1>' +
        '<p class="authcard__s">' + (isLogin ? 'ادخل بحسابك وكمّل من حيث ما وقفت.' : 'حساب واحد بيحفظ إحصائياتك وشيكاتك على كل أجهزتك.') + '</p>' +

        '<button class="gbtn" type="button" data-act="google">' +
          '<span class="gbtn__g">' + GBUTTON_SVG + '</span>' +
          (isLogin ? 'الدخول بحساب جوجل' : 'التسجيل بحساب جوجل') +
        '</button>' +
        '<div class="ordiv"><span>أو بالإيميل</span></div>' +

        '<div class="authmsg" id="authMsg" role="alert" hidden></div>' +

        '<div class="authform" autocomplete="on" role="group" aria-label="بيانات الحساب">' +
          (isLogin ? '' :
            '<label class="afield" for="auName"><span>' + ICON('idcard') + ' الاسم</span>' +
              '<input id="auName" name="name" type="text" autocomplete="name" placeholder="اسمك اللي هيظهر على الشيك" maxlength="40"></label>') +
          '<label class="afield" for="auEmail"><span>' + ICON('mail') + ' الإيميل</span>' +
            '<input id="auEmail" name="email" type="email" inputmode="email" autocomplete="' + (isLogin ? 'username' : 'email') + '" placeholder="name@example.com" dir="ltr" maxlength="80"></label>' +
          '<label class="afield" for="auPass"><span>' + ICON('lock') + ' كلمة المرور</span>' +
            '<span class="afield__pw">' +
              '<input id="auPass" name="password" type="password" autocomplete="' + (isLogin ? 'current-password' : 'new-password') + '" placeholder="٦ حروف أو أرقام على الأقل" dir="ltr" maxlength="64">' +
              '<button type="button" class="afield__eye" data-act="pw-eye" aria-label="إظهار كلمة المرور">' + ICON('eye') + '</button>' +
            '</span></label>' +
          '<button class="btn btn--primary btn--lg btn--block" type="button" data-act="' + (isLogin ? 'login' : 'signup') + '">' +
            (isLogin ? ICON('login') + ' دخول' : ICON('plus') + ' اعمل الحساب') + '</button>' +
        '</div>' +

        '<p class="authswap">' + (isLogin
          ? 'معندكش حساب؟ <a href="#/auth?tab=signup">اعمل حساب جديد</a>'
          : 'عندك حساب بالفعل؟ <a href="#/auth?tab=login">سجّل دخول</a>') + '</p>' +
        '<p class="authmode">' + (AUTH.mode === 'firebase'
          ? ICON('bolt') + ' دخول آمن — بياناتك محفوظة على حسابك'
          : ICON('minus') + ' الخدمة مش متاحة دلوقتي — حدّث الصفحة') + '</p>' +
      '</div>' +
    '</section>';
  }

  const GBUTTON_SVG =
    '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">' +
      '<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>' +
      '<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>' +
      '<path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>' +
      '<path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41 35 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"/>' +
    '</svg>';

  function authMsg(text, kind) {
    const box = $('#authMsg');
    if (!box) return;
    if (!text) { box.hidden = true; box.textContent = ''; return; }
    box.hidden = false;
    box.className = 'authmsg ' + (kind === 'ok' ? 'is-ok' : 'is-err');
    box.innerHTML = ICON(kind === 'ok' ? 'check' : 'minus') + '<span>' + esc(text) + '</span>';
  }

  function authBusy(on) {
    AUTH.busy = !!on;
    $$('.authcard .btn, .authcard .gbtn').forEach((b) => { b.disabled = !!on; });
    const card = $('.authcard');
    if (card) card.classList.toggle('is-busy', !!on);
  }

  function authValues() {
    const g = (id) => (document.getElementById(id) || {}).value || '';
    return { name: g('auName'), email: g('auEmail'), pw: g('auPass') };
  }

  async function doSignup() {
    const v = authValues();
    const bad = AUTH.validate(v.name, v.email, v.pw);
    if (bad) { authMsg(bad); return; }
    authBusy(true); authMsg('');
    try {
      await AUTH.signup(v.name, v.email, v.pw);
      SFX.win();
      toast('أهلاً ' + AUTH.user.name + ' — حسابك جاهز');
      location.hash = AUTH.afterAuth || '#/million'; AUTH.afterAuth = null;
      render(false);
    } catch (e) {
      authMsg(e.message || 'حصلت مشكلة في التسجيل.');
      SFX.blip(180, 0.2, 'sawtooth', 0.04);
    } finally { authBusy(false); }
  }

  async function doLogin() {
    const v = authValues();
    authBusy(true); authMsg('');
    try {
      await AUTH.login(v.email, v.pw);
      SFX.pick();
      toast('أهلاً بيك تاني يا ' + AUTH.user.name);
      location.hash = AUTH.afterAuth || '#/million'; AUTH.afterAuth = null;
      render(false);
    } catch (e) {
      authMsg(e.message || 'مش قادر أسجّل دخول.');
      SFX.blip(180, 0.2, 'sawtooth', 0.04);
    } finally { authBusy(false); }
  }

  async function doGoogle() {
    authBusy(true); authMsg('');
    try {
      const u = await AUTH.google();
      if (u === null) return; /* إعادة توجيه جارية */
      SFX.win();
      toast('أهلاً ' + AUTH.user.name);
      location.hash = AUTH.afterAuth || '#/million'; AUTH.afterAuth = null;
      render(false);
    } catch (e) {
      authMsg((e && e.message) || 'تسجيل جوجل مش متاح دلوقتي.');
      SFX.blip(180, 0.2, 'sawtooth', 0.04);
    } finally { authBusy(false); }
  }

  /* ==========================================================
     8) الشاشات
     ========================================================== */
  const STATE = { play: { cat: 'all', q: null, recent: [] }, game: { running: false, left: 0, score: 0, t: null, deck: [], i: 0 } };

  function adSlot() {
    return '<div class="ad"><span class="ad__tag">إعلان</span><div class="ad__ph">مساحة إعلان محجوزة</div></div>';
  }

  function catChip(catId) {
    const c = catOf(catId); if (!c) return '';
    return '<span class="chip" style="color:' + c.color + ';border-color:' + c.color + '55;background:' + c.color + '14">' +
      ICON(c.icon) + ' ' + esc(c.name) + '</span>';
  }

  function resultsHTML(q, my) {
    const counts = countsOf(q);
    const p = pctOf(counts);
    const total = sum(counts);
    const best = p.indexOf(Math.max.apply(null, p));
    const verdict = my == null ? '' : (my === best
      ? '<div class="verdict verdict--win"><span class="vd">' + ICON('check') + '</span><span>أنت مع الأغلبية — <b>' + pct(p[my]) + '</b> اختاروا نفس اختيارك</span></div>'
      : '<div class="verdict verdict--odd"><span class="vd">' + ICON('sparkle') + '</span><span>أنت في الأقلية — بس <b>' + pct(p[my]) + '</b> اختاروا اللي أنت اخترته</span></div>');
    return '<div class="res">' +
      q.o.map((o, i) => '<div class="res__row' + (i === my ? ' is-mine' : '') + '">' +
        '<div class="res__head"><span>' + ICON('check', 'res__mark') + esc(o) + '</span><b class="res__pct">' + pct(p[i]) + '</b></div>' +
        '<div class="res__bar"><i style="width:' + p[i] + '%"></i></div></div>').join('') +
      '<div class="res__meta">' +
        '<span class="chip">' + ICON('sprout') + ' أصوات حقيقية من قاعدة البيانات</span>' +
        '<span>إجمالي الأصوات: <b>' + num(total) + '</b></span>' +
      '</div>' + verdict + '</div>';
  }

  function cardActions(q, opts) {
    opts = opts || {};
    return '<div class="card__actions">' +
      (opts.next ? '<button class="btn btn--primary" data-act="next">' + ICON('refresh') + ' سؤال تاني</button>' : '') +
      '<button class="btn btn--ghost" data-act="share" data-qid="' + esc(q.id) + '">' + ICON('share') + ' شارك</button>' +
      '<a class="btn btn--wa" data-wa="' + esc(q.id) + '" href="#">' + ICON('whatsapp') + ' واتساب</a>' +
      '</div>';
  }

  function qCard(q, opts) {
    opts = opts || {};
    const my = myVote(q.id);
    const voted = my !== undefined;
    return '<article class="qcard" data-card="' + esc(q.id) + '">' +
      '<div class="qcard__top">' + catChip(q.c) +
        (q.daily ? '<span class="chip chip--live">' + ICON('clock') + ' سؤال اليوم</span>' : '') +
        (q.custom ? '<span class="chip">' + ICON('pencil') + ' من الزوار</span>' : '') +
        '<span class="qcard__count">' + (opts.counter ? esc(opts.counter) : num(sum(countsOf(q))) + ' صوت') + '</span>' +
      '</div>' +
      '<h2 class="qtext">' + esc(q.q) + '</h2>' +
      (voted ? resultsHTML(q, my) : (AUTH.user ?
        '<div class="opts' + (q.o.length === 2 ? ' opts--two' : '') + '">' +
        q.o.map((o, i) => '<button class="opt" data-act="vote" data-qid="' + esc(q.id) + '" data-i="' + i + '">' +
          '<span class="opt__key">' + (q.o.length === 2 ? (i ? 'ب' : 'أ') : (i + 1)) + '</span>' +
          '<span class="opt__label">' + esc(o) + '</span></button>').join('') +
        '</div>' : voteGateHTML())) +
      cardActions(q, { next: opts.next || voted }) +
      '</article>';
  }

  function voteGateHTML() {
    return '<div class="votegate">' +
      '<span class="votegate__ico">' + ICON('idcard') + '</span>' +
      '<b>سجّل حسابك عشان تصوّت</b>' +
      '<span>صوتك بيتحفظ على حسابك، وتقدر تشوف رأي الباقيين وتغيّره في أي وقت.</span>' +
      '<a class="btn btn--primary" href="#/auth?tab=signup" data-nav="auth">' + ICON('plus') + ' اعمل حساب</a>' +
      '<a class="btn btn--ghost" href="#/auth?tab=login" data-nav="auth">' + ICON('login') + ' عندي حساب — دخول</a>' +
      '</div>';
  }

  function miniCard(q) {
    const p = pctOf(countsOf(q));
    return '<a class="mini" href="#/q/' + encodeURIComponent(q.id) + '">' +
      '<div class="mini__q">' + esc(q.q) + '</div>' +
      '<div class="mini__split">' + p.map((x) => '<i style="width:' + x + '%"></i>').join('') + '</div>' +
      '<div class="mini__foot">' + catChip(q.c) + '<span>' + num(sum(countsOf(q))) + ' صوت</span>' +
      '<span class="mini__cta">صوّت ' + ICON('back') + '</span></div></a>';
  }

  function rankRow(q, i, votes) {
    const p = pctOf(countsOf(q));
    return '<a class="rank" href="#/q/' + encodeURIComponent(q.id) + '">' +
      '<span class="rank__n' + (i < 3 ? ' rank__n--' + (i + 1) : '') + '">' + (i + 1) + '</span>' +
      '<span class="rank__body"><span class="rank__q">' + esc(q.q) + '</span>' +
      '<span class="mini__split" style="margin-top:8px">' + p.map((x) => '<i style="width:' + x + '%"></i>').join('') + '</span></span>' +
      '<span class="rank__v">' + (votes ? num(votes) + ' صوت' : 'لسه جديد') + '</span></a>';
  }

  /* ---------- الرئيسية ---------- */
  function viewHome() {
    const total = allQuestions().length;
    const myVotes = myVotesCount();
    const nq = MBANK.length;
    const daily = (function () {
      const d = todayKey(); let h = 0;
      for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0;
      return BASE[h % BASE.length];
    })();

    /* كارت الظهور الأول */
    const g = MZ.g;
    let play = '';
    if (g && g.deck && g.q && g.stage === 'q') {
      play = '<div class="mzresume"><div><b>عندك جولة مفتوحة يا ' + esc(MZ.name || 'بطل') + '</b>' +
        '<span>واقف عند سؤال ' + num(g.i + 1) + ' من ' + num(MZ_TOTAL) + ' — مكسبك المضمون ' + mzMoney(g.correct ? MZ_LADDER[g.correct - 1] : 0) + '</span></div>' +
        '<a class="btn btn--primary" href="#/million">' + ICON('play') + ' كمّل</a></div>';
    }

    return play + '<section class="hero wrap mzhero">' +
        '<div class="mzhero__badge"><span class="chip chip--live">' + ICON('crown') + ' اللعبة الرسمية</span></div>' +
        '<h1 class="mzhero__title">من سيربح <span class="grad">المليون؟</span></h1>' +
        '<p class="mzhero__sub">٤٠ سؤال من السهل للصعب، ٤ وسائل مساعدة، ومفيش مؤقت. اوصل للمليون وخد شيك باسمك.</p>' +
        '<div class="hero__cta">' +
          '<button class="btn btn--primary btn--lg" type="button" data-act="mz-quick">' + ICON('play') + ' ابدأ اللعب</button>' +
          '<a class="btn btn--ghost btn--lg" href="#/million/rules">' + ICON('book') + ' القواعد</a>' +
        '</div>' +
        (AUTH.user
            ? '<p class="mzhero__note">' + ICON('check') + ' أهلاً ' + esc(AUTH.user.name) + ' — جولاتك وفوزك محفوظين على حسابك.</p>'
            : '<p class="mzhero__note">' + ICON('idcard') + ' سجّل دخولك بالإيميل أو جوجل عشان جولاتك وفوزك يتحفظوا في حسابك.' +
              ' <a href="#/auth" data-nav="auth">دخول / حساب جديد</a></p>') +
        '<div class="mzhero__stats">' +
          '<div class="stat"><b>' + num(nq) + '</b><span>سؤال في البنك</span></div>' +
          '<div class="stat"><b>' + num(MZ_TOTAL) + '</b><span>مستوى للجائزة</span></div>' +
          '<div class="stat"><b>' + num(myStats().wins) + '</b><span>مرات فوزك</span></div>' +
        '</div>' +
        '<div class="mzhero__art"><img referrerpolicy="no-referrer" src="https://i.ibb.co/Fb4HLGSN/million-light.png" alt="لاعب على مسرح المسابقة وشيك مليون جنيه" width="1279" height="709" loading="eager"></div>' +
      '</section>' +
      '<div class="wrap">' + adSlot() + '</div>' +
      '<section class="wrap">' +
        '<div class="sec-head"><div><span class="eyebrow">إزاي بتشتغل</span><h2>٤ خطوات للمليون</h2></div><a class="btn btn--ghost btn--sm" href="#/million/rules">التفاصيل</a></div>' +
        '<div class="mzrules">' +
          '<div class="mzrule">' + ICON('target') + '<b>أسئلة متدرجة</b><span>١٠ أسئلة من كل مستوى: سهل، متوسط، صعب، صعب جدًا.</span></div>' +
          '<div class="mzrule">' + ICON('fifty') + '<b>وسائل مساعدة</b><span>٥٠:٥٠، اسأل الجمهور، اتصال بصديق، وبدّل السؤال.</span></div>' +
          '<div class="mzrule">' + ICON('wallet') + '<b>انسحاب وشبكات أمان</b><span>تنسحب بمبلغ مستواك، أو تاخد أعلى مستوى أمان.</span></div>' +
          '<div class="mzrule">' + ICON('ticket') + '<b>شيك المليون</b><span>فوز = شيك باسمك وتاريخك، جاهز للتحميل.</span></div>' +
        '</div>' +
      '</section>' +
      '<section class="wrap">' +
        '<div class="sec-head"><div><span class="eyebrow">كل يوم سؤال</span><h2>سؤال اليوم من «ماذا لو»</h2></div><a class="btn btn--ghost btn--sm" href="#/play">اللعب</a></div>' +
        qCard(Object.assign({}, daily, { daily: true })) +
      '</section>' +
      '<div class="wrap">' + adSlot() + '</div>' +
      '<section class="wrap">' +
        '<div class="sec-head"><div><span class="eyebrow">على الجانب</span><h2>أقسام تانية</h2></div><p>زي الألعاب بالظبط</p></div>' +
        '<div class="promos">' +
          '<a class="promo" href="#/play"><img referrerpolicy="no-referrer" src="https://i.ibb.co/MkB4pQ2k/talk-light.png" alt="اتنين من الشلة بيتكلموا" class="promo__img">' +
            '<b>ماذا لو خيّروك؟</b><span>أسئلة جدلية للشلة والرحلات — مفيش إجابة صح، فيه جو حلو بس.</span>' +
            '<span class="promo__go">' + ICON('dice') + ' العب</span></a>' +
          '<a class="promo" href="#/party"><img referrerpolicy="no-referrer" src="https://i.ibb.co/RGGyqxsP/trip-light.png" alt="الشلة في رحلة" class="promo__img">' +
            '<b>تحدي الشلة</b><span>غرف تحدي بأسئلة المليون — ١ ضد ١ لحد ٤ ضد ٤، والفريق الأعلى مكسب يكسب.</span>' +
            '<span class="promo__go">' + ICON('users') + ' ابدأ</span></a>' +
          '<a class="promo" href="#/games"><img referrerpolicy="no-referrer" src="https://i.ibb.co/nMk1KM0k/whatif-light.png" alt="طفل ماسك علامة استفهام" class="promo__img promo__img--tall">' +
            '<b>الألعاب</b><span>«مين يبدأ؟» وتحدي ٢٠ ثانية — ألعاب سريعة للشلة.</span>' +
            '<span class="promo__go">' + ICON('gamepad') + ' العب</span></a>' +
        '</div>' +
      '</section>';
  }

  /* ---------- اللعب ---------- */
  function nextQuestion(cat) {
    const list = allQuestions().filter((q) => !cat || cat === 'all' || q.c === cat);
    if (!list.length) return null;
    let fresh = list.filter((q) => STATE.play.recent.indexOf(q.id) < 0);
    if (!fresh.length) { STATE.play.recent = []; fresh = list; }
    const unvoted = fresh.filter((q) => myVote(q.id) === undefined);
    const q = pick(unvoted.length ? unvoted : fresh);
    STATE.play.recent.push(q.id);
    STATE.play.recent = STATE.play.recent.slice(-8);
    return q;
  }

  function viewPlay(params) {
    const cat = (params && params.cat) || STATE.play.cat || 'all';
    STATE.play.cat = cat;
    if (!STATE.play.q || (cat !== 'all' && STATE.play.q.c !== cat)) STATE.play.q = nextQuestion(cat);
    const q = STATE.play.q;
    if (!q) return '<section class="wrap page"><h1>مفيش أسئلة هنا</h1></section>';

    const total = allQuestions().length;
    const myVotes = myVotesCount();
    return '<section class="wrap play">' +
      '<div class="play__bar"><a class="btn btn--ghost btn--sm" href="#/">' + ICON('back') + ' الرئيسية</a>' +
        '<div class="progress"><i style="width:' + Math.round((myVotes / Math.max(total, 1)) * 100) + '%"></i></div>' +
        '<span class="play__score">' + num(myVotes) + ' / ' + num(total) + '</span></div>' +
      '<div class="filters">' +
        '<button class="fchip' + (cat === 'all' ? ' is-on' : '') + '" data-act="filter" data-cat="all">الكل</button>' +
        CATS.map((c) => '<button class="fchip' + (cat === c.id ? ' is-on' : '') + '" data-act="filter" data-cat="' + c.id + '">' +
          ICON(c.icon) + ' ' + esc(c.name) + '</button>').join('') +
      '</div>' +
      '<div id="playHost">' + qCard(q, { counter: 'سؤال جديد' }) + '</div>' +
      adSlot() +
      '<p class="hint" style="text-align:center;margin-top:16px">كل ما تصوّت أكتر، الأسئلة تبقى أدق — والتحدي يبقى أحلى.</p>' +
    '</section>';
  }

  /* ---------- سؤال واحد ---------- */
  function viewSingle(id) {
    const q = byId(id);
    if (!q) return viewNotFound();
    const rel = shuffle(BASE.filter((x) => x.id !== q.id && x.c === q.c)).slice(0, 3);
    return '<section class="wrap play">' +
      '<h1 class="sr">' + esc(q.q) + '</h1>' +
      '<div class="play__bar"><a class="btn btn--ghost btn--sm" href="#/play">' + ICON('back') + ' كل الأسئلة</a>' +
        '<span class="chip">' + ICON('share') + ' ابعته للشلة وشوف رأيهم</span></div>' +
      qCard(q, {}) +
      (rel.length ? '<div class="sec-head"><div><h2>أسئلة قريبة</h2></div></div>' +
        '<div class="grid-cards">' + rel.map(miniCard).join('') + '</div>' : '') +
    '</section>';
  }

  /* ==========================================================
     9.5) تحدي الغرف — «من سيربح المليون» بين الشلة (1v1 لحد 4v4)
     ----------------------------------------------------------
     • للمسجّلين بس، والغرفة بتتفتح للمسجّلين بس.
     • كل فريق (أ/ب) بياخد ٤٠ سؤال لوحده بترتيبه من السهل للصعب.
     • كل فريق بيلعب سلّم المليون على أسئلته، ومكسبه المضمون بيتحدث مع كل إجابة صح.
     • ٤٠ سؤال لكل فريق، والفريقين بيبدأوا مع بعض. اللي يخلص الأول بيستنى التاني.
     • قواعد صارمة: ٣ محاولات لكل سؤال، الوقت بيقفل السؤال، والفريق اللي يغلط
       ٣ مرات بيخرج بمكسبه المضمون. الفايز = أعلى مكسب.
     ========================================================== */
  const ROOM = {
    code: '',
    data: null,
    ref: null,
    started: 0,
    timer: null,
    deadline: 0,
    total: 20000,
    busy: false
  };

  const ROOM_SETUP = {
    sizes: [1, 2, 3, 4],      /* عدد أفراد كل فريق */
    secs: [20, 30, 45]        /* وقت السؤال */
  };
  const ROOM_QUESTIONS = 40;   /* ٤٠ سؤال ثابت لكل فريق */
  
  function roomPath(...bits) { return ['rooms', ROOM.code].concat(bits).join('/'); }

  function randCode() {
    const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 5; i++) s += L[rnd(L.length)];
    return s;
  }

  function roomPlayers() {
    const p = (ROOM.data && ROOM.data.players) || {};
    return Object.keys(p).map((uid) => Object.assign({ uid: uid }, p[uid]));
  }
  function teamMembers(t) {
    return roomPlayers().filter((p) => (p.team || 'a') === t);
  }
  function roomMeta() { return (ROOM.data && ROOM.data.meta) || {}; }
  function myProgress() {
    const pr = (ROOM.data && ROOM.data.progress) || {};
    return pr[AUTH.user ? AUTH.user.id : ''] || null;
  }
  function teamProgress(t) {
    const list = teamMembers(t).map((p) => {
      const pr = (ROOM.data.progress || {})[p.uid];
      return { uid: p.uid, name: p.name || 'لاعب', done: !!(pr && pr.done), amount: Number((pr && pr.amount) || 0) };
    });
    const amount = list.reduce((m, x) => Math.max(m, x.amount), 0);
    const allDone = list.length > 0 && list.every((x) => x.done);
    return { list: list, amount: amount, done: allDone };
  }
  function roomBothDone() {
    const a = teamProgress('a'), b = teamProgress('b');
    return (a.list.length > 0 && b.list.length > 0 && a.done && b.done);
  }
  function roomWinner() {
    const a = teamProgress('a'), b = teamProgress('b');
    if (!a.list.length || !b.list.length) return null;
    if (a.amount === b.amount) return 'tie';
    return a.amount > b.amount ? 'a' : 'b';
  }

  /* ---------- المزامنة اللحظية ---------- */
  function roomAttach(code) {
    roomDetach();
    ROOM.code = code;
    roomStartPresence(code);
    ROOM.data = null;
    ROOM.ref = FB.watch('rooms/' + code, (v) => {
      ROOM.data = v;
      if (!v) {
        if (parse().name === 'party' && parse().arg.toUpperCase() === code) {
          toast('الغرفة مش موجودة');
          location.hash = '#/party';
        }
        return;
      }
      roomChanged();
    });
  }

  function roomDetach() {
    roomStopPresence();
    if (ROOM.ref) FB.off(ROOM.ref);
    ROOM.ref = null;
    roomStopTimer();
  }

  // Separate session per tab: closing one tab must not disconnect another.
  let roomPresenceStop = null;
  function roomStopPresence() {
    if (roomPresenceStop) roomPresenceStop();
    roomPresenceStop = null;
  }
  function roomStartPresence(code) {
    if (!AUTH.user) return;
    const db = FB.mod.db;
    const session = db.push(FB.ref('rooms/' + code + '/presence/' + AUTH.user.id));
    let stopped = false, timer = null;
    const beat = () => db.set(session, db.serverTimestamp()).catch((e) => console.warn('Room heartbeat:', e.code));
    const disconnect = db.onDisconnect(session);
    const unsubscribe = db.onValue(FB.ref('.info/connected'), async (snap) => {
      if (snap.val() !== true || stopped) return;
      clearInterval(timer);
      try {
        // Register server-side removal BEFORE publishing online presence.
        await disconnect.remove();
        if (stopped) { await disconnect.cancel(); return; }
        await beat();
        if (!stopped) timer = setInterval(beat, 60000);
      } catch (e) { console.warn('Room presence:', e.code); }
    });
    roomPresenceStop = () => {
      stopped = true;
      clearInterval(timer);
      unsubscribe();
      // Leave disconnect removal armed if this write fails/offline.
      db.remove(session).then(() => disconnect.cancel()).catch(() => {});
    };
  }

  /* السؤال بيتعرض بنفس ترتيب اختياراته لكل اللاعبين (بيتبني من التقدّم نفسه) */
  function roomQuestionView() {
    const q = roomMyQ();
    if (!q) return null;
    const pr = myProgress() || {};
    const key = ROOM.code + ':' + myTeam() + ':' + pr.q;
    let view = ROOM.qview;
    if (!view || view.key !== key) {
      view = mzPrep(q.id);          /* تجهيز الاختيارات بنفس منطق اللعبة الفردية */
      view.key = key;
      view.locked = false;
      view.phase = 'ask';
      view.hide = [];
      ROOM.qview = view;
    }
    return view;
  }

  /* مفيش خروج بدري: اللي يخلص أسئلته بيستنى الفريق التاني لحد ما يخلص (مفيش استسلام) */
  async function roomWatchOpponent() {
    const meta = roomMeta();
    if ((meta.state || '') !== 'play' || !ROOM.code || !AUTH.user) return;
    const a = teamProgress('a'), b = teamProgress('b');
    if (a.list.length && b.list.length && a.done && b.done && meta.state !== 'done') {
      try {
        await FB.mod.db.update(FB.ref('rooms/' + ROOM.code + '/meta'), { state: 'done', at: Date.now() });
      } catch (e) {}
    }
  }

  let roomRenderT = null;
  function roomChanged() {
    roomCheckTimer();
    roomWatchOpponent();
    clearTimeout(roomRenderT);
    roomRenderT = setTimeout(() => {
      if (parse().name === 'party' && parse().arg.toUpperCase() === ROOM.code) render(false);
    }, 200);
  }

  /* ---------- إنشاء / دخول / خروج ---------- */
  async function roomCreate(size, questions, secs) {
    if (!AUTH.user) return roomNeedAuth();
    if (ROOM.busy) return;
    ROOM.busy = true;
    try {
      let code = '', available = false;
      for (let tries = 0; tries < 6; tries++) {
        code = randCode();
        const snap = await FB.mod.db.get(FB.ref('rooms/' + code));
        if (!snap.exists()) { available = true; break; }
      }
      if (!available) { toast('مش قادرين نلاقي كود متاح — جرّب تاني'); return; }
      await FB.mod.db.set(FB.ref('rooms/' + code + '/meta'), {
        host: AUTH.user.id, state: 'wait', size: size, questions: ROOM_QUESTIONS, secs: secs, at: Date.now()
      });
      // الإنشاء ماسك القفل بالفعل، فنسجل صاحب الغرفة من غير ما نطلبه تاني.
      if (await roomJoinUnlocked(code)) {
        location.hash = '#/party/' + code;
        toast('الغرفة اتفتحت — ابعت الكود لشلتك');
      }
    } catch (e) {
      toast(fbWriteError(e));
    } finally {
      ROOM.busy = false;
    }
  }

  async function roomJoinUnlocked(code) {
    const snap = await FB.mod.db.get(FB.ref('rooms/' + code));
    if (!snap.exists()) { toast('مفيش غرفة بالكود ده'); return false; }
    const data = snap.val();
    const players = data.players || {};
    if (!players[AUTH.user.id]) {
      const meta = data.meta || {};
      if ((meta.state || 'wait') !== 'wait') { toast('التحدي بدأ خلاص في الغرفة دي'); return false; }
      const members = Object.keys(players).map((uid) => players[uid]);
      const teamA = members.filter((p) => (p.team || 'a') === 'a').length;
      const teamB = members.length - teamA;
      const size = Number(meta.size || 4);
      if (teamA >= size && teamB >= size) { toast('الغرفة كاملة'); return false; }
      const team = teamA < size && (teamA <= teamB || teamB >= size) ? 'a' : 'b';
      await FB.mod.db.set(FB.ref('rooms/' + code + '/players/' + AUTH.user.id), {
        name: (AUTH.user.name || 'لاعب').slice(0, 20), team: team, ready: false, at: Date.now()
      });
    }
    return true;
  }

  async function roomJoin(code, fromRoomRoute) {
    if (!AUTH.user) return roomNeedAuth();
    code = String(code || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{4,8}$/.test(code)) {
      toast('الكود مش صحيح');
      if (fromRoomRoute) location.hash = '#/party';
      return;
    }
    if (ROOM.busy) return;
    ROOM.busy = true;
    try {
      const joined = await roomJoinUnlocked(code);
      // لو المستخدم غيّر الصفحة أثناء التحميل، ما نرجعوش للغرفة غصب عنه.
      if (fromRoomRoute && (parse().name !== 'party' || parse().arg.toUpperCase() !== code)) return;
      if (!joined) { if (fromRoomRoute) location.hash = '#/party'; return; }
      if (fromRoomRoute) roomAttach(code);
      else location.hash = '#/party/' + code;
    } catch (e) {
      toast(fbWriteError(e));
      if (fromRoomRoute && parse().name === 'party' && parse().arg.toUpperCase() === code) location.hash = '#/party';
    } finally {
      ROOM.busy = false;
      // مسار غرفة تانية ممكن يكون اتفتح أثناء انتظار الطلب الأول.
      const current = parse();
      if (fromRoomRoute && current.name === 'party' && current.arg && current.arg.toUpperCase() !== code) render(false);
    }
  }

  async function roomLeave(silent) {
    if (ROOM.code && AUTH.user) {
      try { await FB.mod.db.remove(FB.ref(roomPath('players', AUTH.user.id))); } catch (e) {}
      try { await FB.mod.db.remove(FB.ref(roomPath('progress', AUTH.user.id))); } catch (e) {}
    }
    roomDetach();
    ROOM.code = ''; ROOM.data = null; ROOM.started = 0;
    if (!silent) { if (parse().arg) location.hash = '#/party'; else render(false); }
  }

  async function roomSwitchTeam(team) {
    if (!ROOM.code || !AUTH.user) return;
    const meta = roomMeta();
    if (meta.state && meta.state !== 'wait') { toast('مش وقته — التحدي بدأ'); return; }
    if ((meta.host && meta.host !== AUTH.user.id) && meta.state !== 'wait') return;
    if (teamMembers(team).length >= Number(meta.size || 4)) { toast('الفريق ده كامل'); return; }
    try {
      await FB.mod.db.update(FB.ref(roomPath('players', AUTH.user.id)), { team: team });
    } catch (e) { toast(fbWriteError(e)); }
  }

  function roomNeedAuth() {
    AUTH.afterAuth = '#/party';
    toast('الدخول للمسجّلين بس — سجّل حسابك الأول');
    location.hash = '#/auth?tab=login';
  }

  /* ---------- بدء التحدي ---------- */
  async function roomStart() {
    if (!ROOM.code || !AUTH.user) return;
    const meta = roomMeta();
    if (meta.host !== AUTH.user.id) { toast('منشئ الغرفة بس اللي يبدأ'); return; }
    const a = teamMembers('a').length, b = teamMembers('b').length;
    if (!a || !b) { toast('محتاج لاعب واحد على الأقل في كل فريق'); return; }
    if (a > Number(meta.size) || b > Number(meta.size)) { toast('فريق فيه لاعبين أكتر من الحجم المحدد'); return; }
    const ps = roomPlayers();
    const updates = {};
    const nq = ROOM_QUESTIONS;
    ps.forEach((p) => {
      updates['progress/' + p.uid] = { q: 0, ok: 0, amount: 0, done: false, t: 0 };
    });
    updates['meta/state'] = 'play';
    updates['meta/at'] = Date.now();
    try {
      await FB.mod.db.update(FB.ref('rooms/' + ROOM.code), updates);
      toast('يلا بينا — كل فريق على أسئلته، ' + nq + ' سؤال و' + Number(meta.secs || 30) + ' ثانية للسؤال');
    } catch (e) { toast(fbWriteError(e)); }
  }

  /* ---------- أسئلة كل فريق ---------- */
  function roomDeck(team) {
    const n = ROOM_QUESTIONS;
    /* ١٠ من كل مستوى بنفس ترتيب اللعبة الفردية — والفريق «ب» بيمشي على ترتيب مستوى معاكس عشان الأسئلة تختلف */
    const bands = team === 'a' ? [1, 2, 3, 4] : [2, 1, 4, 3];
    const deck = [];
    bands.forEach((lv) => {
      shuffle(MBANK.filter((q) => q.l === lv)).slice(0, Math.ceil(n / 4)).forEach((q) => deck.push(q.id));
    });
    if (deck.length < n) {
      shuffle(MBANK.filter((q) => deck.indexOf(q.id) === -1)).slice(0, n - deck.length).forEach((q) => deck.push(q.id));
    }
    return deck.slice(0, n).map((id) => ({ id: id }));
  }

  function roomProgressOf(uid) {
    const pr = (ROOM.data && ROOM.data.progress) || {};
    return pr[uid] || { q: 0, ok: 0, amount: 0, done: false, t: 0 };
  }

  function roomMyQ() {
    const deck = roomDeck(myTeam());
    const pr = myProgress() || { q: 0, ok: 0, amount: 0, done: false };
    const ref = deck[pr.q];
    return ref ? MZ_BY_ID[ref.id] : null;
  }

  function myTeam() {
    const me = roomPlayers().find((p) => p.uid === (AUTH.user && AUTH.user.id));
    return me ? (me.team || 'a') : 'a';
  }


  async function roomAnswer(idx) {
    const view = roomQuestionView();
    const q = roomMyQ();
    if (!view || !q) return;
    if (view.locked) return;
    const pr = roomProgressOf(AUTH.user.id);
    if (pr.done) return;
    view.locked = true;
    view.pick = idx;
    SFX.tick();
    if (idx === view.ai) {
      view.phase = 'right';
      SFX.pick();
      render(false);
      await roomAdvance(true);
      toast('صح — مكسبك المضمون بقى ' + mzMoney(mzSafe(roomProgressOf(AUTH.user.id).ok)));
    } else {
      view.phase = 'wrong';
      SFX.blip(160, 0.3, 'sawtooth', 0.05);
      render(false);
      await roomAdvance(false, true);
      toast('غلط — خرجت بمكسبك المضمون');
    }
  }

  /* تقدّم اللاعب: صح → مكسب مضمون + سؤال جديد | غلط ٣ مرات / وقت خلص → خروج */
  async function roomAdvance(ok, out) {
    if (!ROOM.code || !AUTH.user) return;
    const pr = roomProgressOf(AUTH.user.id);
    const n = ROOM_QUESTIONS;
      const nextQ = Number(pr.q || 0) + 1;
    const nextOk = Number(pr.ok || 0) + (ok ? 1 : 0);
    const done = !!out || nextQ >= n;
    const amount = mzSafe(nextOk);
    try {
      await FB.mod.db.update(FB.ref(roomPath('progress', AUTH.user.id)), {
        q: done ? Number(pr.q || 0) : nextQ,
        ok: nextOk,
        amount: amount,
        done: done,
        t: Date.now()
      });
    } catch (e) { toast(fbWriteError(e)); }
    ROOM.qview = null;
    ROOM.deadline = 0;
    roomStopTimer();
    /* لو الفريقين خلصوا، الغرفة تتقفل والنتيجة تظهر للكل */
    if (done && roomBothDone()) {
      try {
        await FB.mod.db.update(FB.ref('rooms/' + ROOM.code + '/meta'), { state: 'done', at: Date.now() });
      } catch (e) {}
    }
  }

  async function roomDropTeam() {
    if (!ROOM.code || !AUTH.user) return;
    const pr = roomProgressOf(AUTH.user.id);
    try {
      await FB.mod.db.update(FB.ref(roomPath('progress', AUTH.user.id)), {
        ok: Number(pr.ok || 0), amount: mzSafe(Number(pr.ok || 0)), done: true, t: Date.now()
      });
    } catch (e) {}
  }

  /* ---------- المؤقت ---------- */
  function roomStopTimer() {
    if (ROOM.timer) { clearInterval(ROOM.timer); ROOM.timer = null; }
  }

  function roomCheckTimer() {
    const meta = roomMeta();
    if ((meta.state || '') !== 'play') { roomStopTimer(); return; }
    const pr = myProgress();
    if (!pr || pr.done || !roomMyQ()) { roomStopTimer(); return; }
    const total = Number(meta.secs || 30) * 1000;
    if (ROOM.deadline && ROOM.total === total) return;   /* المؤقت شغال على نفس السؤال */
    if (ROOM.deadline && ROOM.deadline > Date.now()) return;
    ROOM.total = total;
    ROOM.deadline = Date.now() + total;
    roomStopTimer();
    ROOM.timer = setInterval(() => {
      const left = ROOM.deadline - Date.now();
      const bar = document.getElementById('roomTimer');
      const num = document.getElementById('roomTimerN');
      if (num) num.textContent = Math.max(0, Math.ceil(left / 1000));
      if (bar) bar.style.width = clamp((left / ROOM.total) * 100, 0, 100) + '%';
      if (left <= 0) {
        roomStopTimer();
        ROOM.deadline = 0;
        toast('الوقت خلص في السؤال ده');
        roomAdvance(false, true);
      }
    }, 250);
  }

  function roomResetDeadline() {
    ROOM.deadline = 0;
    ROOM.qview = null;
  }

  /* ---------- صفحة تحدي الشلة (عمل/دخول الغرف) ---------- */
  function viewParty() {
    if (!AUTH.user) {
      return '<section class="wrap page">' +
        '<span class="chip chip--live">' + ICON('users') + ' تحدي الشلة</span>' +
        '<h1 class="page__title">غرف تحدي «من سيربح المليون؟»</h1>' +
        '<p class="lead">اعمل غرفة، ابعت الكود لشلتك، واتنافسوا على سلّم المليون — من ١ ضد ١ لحد ٤ ضد ٤. الغرف للمسجّلين بس.</p>' +
        '<div class="card__actions">' +
          '<a class="btn btn--primary btn--lg" href="#/auth?tab=signup">' + ICON('plus') + ' اعمل حساب عشان تلعب</a>' +
          '<a class="btn btn--ghost" href="#/auth?tab=login">' + ICON('login') + ' دخول</a>' +
        '</div>' +
      '</section>';
    }
    return '<section class="wrap page">' +
      '<span class="chip chip--live">' + ICON('users') + ' تحدي الشلة</span>' +
      '<h1 class="page__title">اعمل غرفة… وابعت الكود للشلة</h1>' +
      '<p class="lead">كل فريق بياخد أسئلته لوحده وسلّم المليون — الفريق اللي يوصل أعلى مكسب يكسب. المسجّلين بس اللي يقدروا يدخلوا.</p>' +
      '<div class="roomnew">' +
        '<button class="btn btn--primary btn--lg" data-act="room-create">' + ICON('plus') + ' افتح غرفة جديدة</button>' +
        '<div class="roomjoin">' +
          '<input class="inp" id="roomCode" placeholder="كود الغرفة" maxlength="8" dir="ltr" autocomplete="off">' +
          '<button class="btn btn--ghost" data-act="room-join">' + ICON('login') + ' دخول بكود</button>' +
        '</div>' +
      '</div>' +
      '<div class="roomrules" style="margin-top:22px">' +
        '<h2>قواعد التحدي (صارمة)</h2>' +
        '<ul class="ul">' +
          '<li>مسجّلين بس — مفيش غرف للزوار، وكل لاعب لازم يكون داخل بحسابه.</li>' +
          '<li>حجم الفريق من ١ لحد ٤ — يعني ١ضد١، ٢ضد٢، ٣ضد٣، أو ٤ضد٤ (الغرفة ٨ لاعبين كحد أقصى).</li>' +
          '<li>كل فريق بيتنزّل له ٤٠ سؤال مختلف، والفريقين بيبدأوا مع بعض في نفس اللحظة.</li>' +
          '<li>إجابة واحدة نهائية لكل سؤال (مفيش تصحيح)، والوقت اللي يخلص بيقفل السؤال.</li>' +
          '<li>مفيش انسحاب ولا خروج بدري — اللي يخلص أسئلته بيستنى الفريق التاني لحد ما يخلص.</li>' +
          '<li>الفايز = أعلى مكسب، ولو اتساووا → تعادل.</li>' +
        '</ul>' +
      '</div>' +
    '</section>';
  }

  /* ---------- واجهة الغرفة ---------- */
  function viewRoom(code) {
    if (!AUTH.user) {
      return '<section class="wrap page">' +
        '<span class="chip chip--live">' + ICON('users') + ' تحدي الشلة</span>' +
        '<h1 class="page__title">الغرف للمسجّلين بس</h1>' +
        '<p class="lead">عشان تعمل غرفة أو تدخل غرفة حد، لازم حسابك يبقى مسجّل — عشان نتايجك ومكسبك يتحفظوا.</p>' +
        '<div class="card__actions"><a class="btn btn--primary btn--lg" href="#/auth?tab=signup">' + ICON('plus') + ' اعمل حساب</a>' +
        '<a class="btn btn--ghost" href="#/auth?tab=login">' + ICON('login') + ' دخول</a></div>' +
      '</section>';
    }
    if (!code) return viewParty();
    if (ROOM.code !== code) {
      if (ROOM.ref) { roomDetach(); ROOM.code = ''; ROOM.data = null; }
      if (!ROOM.busy) roomJoin(code, true);
      return '<section class="wrap page"><div class="empty"><span class="spin"></span> بنفتح الغرفة…</div></section>';
    }
    if (!ROOM.data) return '<section class="wrap page"><div class="empty"><span class="spin"></span> بنفتح الغرفة…</div></section>';
    const meta = roomMeta();
    if ((meta.state || 'wait') === 'wait') return roomLobbyHTML();
    return roomPlayHTML();
  }

  function roomLobbyHTML() {
    const meta = roomMeta();
    const size = Number(meta.size || 4);
    const a = teamMembers('a'), b = teamMembers('b');
    const isHost = meta.host === AUTH.user.id;
    const mine = myTeam();
    const teamCard = (team, list, label) =>
      '<div class="roomteam' + (mine === team ? ' is-mine' : '') + '">' +
        '<div class="roomteam__head"><b>الفريق ' + label + '</b><span>' + num(list.length) + ' / ' + num(size) + '</span></div>' +
        '<div class="roomteam__list">' +
          (list.length ? list.map((p) => '<span class="roomplayer">' + esc(p.name || 'لاعب') + '</span>').join('')
            : '<span class="hint">لسه فاضي</span>') +
        '</div>' +
        (meta.state === 'wait' && list.length < size
          ? '<button class="btn btn--ghost btn--sm" data-act="room-team" data-team="' + team + '">' + (mine === team ? 'أنا هنا' : 'انضم للفريق ' + label) + '</button>'
          : '') +
      '</div>';

    return '<section class="wrap page">' +
      '<span class="chip chip--live">' + ICON('users') + ' تحدي الشلة</span>' +
      '<h1 class="page__title">غرفة الانتظار</h1>' +
      '<p class="lead">' + (isHost ? 'إنت منشئ الغرفة — ظبّط الحجم وابدأ لما الفريقين يجهزوا.' : 'استنى منشئ الغرفة يبدأ التحدي.') + '</p>' +
      '<div class="roominvite">' +
        '<span class="roominvite__label">كود الغرفة</span>' +
        '<div class="roomcode" dir="ltr">' + esc(ROOM.code) + '</div>' +
        '<p class="hint">ابعت الكود لشلتك عشان يدخلوا معاك</p>' +
        '<button class="btn btn--primary btn--sm" data-act="room-copy">' + ICON('link') + ' نسخ الكود</button>' +
      '</div>' +
      '<div class="card__actions" style="justify-content:center">' +
        '<button class="btn btn--ghost btn--sm" data-act="room-leave">' + ICON('logout') + ' خروج من الغرفة</button>' +
      '</div>' +
      (isHost
        ? '<div class="roomsetup">' +
            '<div class="field"><span>عدد أفراد كل فريق</span><div class="chips">' +
              ROOM_SETUP.sizes.map((s) => '<button class="fchip' + (size === s ? ' is-on' : '') + '" data-act="room-size" data-v="' + s + '">' + s + ' ضد ' + s + '</button>').join('') +
            '</div></div>' +
            '<div class="field"><span>وقت السؤال</span><div class="chips">' +
              ROOM_SETUP.secs.map((s) => '<button class="fchip' + (Number(meta.secs || 30) === s ? ' is-on' : '') + '" data-act="room-secs" data-v="' + s + '">' + s + ' ثانية</button>').join('') +
            '</div></div>' +
          '</div>'
        : '') +
      '<div class="roomgrid">' + teamCard('a', a, 'أ') + teamCard('b', b, 'ب') + '</div>' +
      '<div class="roomrules">' +
        '<h2>القواعد</h2>' +
        '<ul class="ul">' +
          '<li>كل فريق بيتنزّل له ' + num(ROOM_QUESTIONS) + ' سؤال مختلف، والفريقين بيبدأوا مع بعض.</li>' +
          '<li>إجابة واحدة نهائية لكل سؤال (مفيش تصحيح)، والوقت ' + num(Number(meta.secs || 30)) + ' ثانية للسؤال.</li>' +
          '<li>الوقت بيقفل السؤال — والسؤال اللي ميتجاوبش بيتحسب غلط.</li>' +
          '<li>مفيش خروج بدري: اللي يخلص الـ٤٠ سؤال بتوعه بيستنى الفريق التاني لحد ما يخلص.</li>' +
          '<li>الفايز: أعلى مكسب مضمون. ولو النتيجتين متساويتين → تعادل.</li>' +
        '</ul>' +
      '</div>' +
      (isHost
        ? '<button class="btn btn--primary btn--lg btn--block" data-act="room-start" style="margin-top:18px">' + ICON('play') + ' ابدأ التحدي</button>'
        : '<p class="hint" style="text-align:center;margin-top:18px">استنى المنشئ يبدأ…</p>') +
    '</section>';
  }

  function roomPlayHTML() {
    const meta = roomMeta();
    const pr = myProgress() || { q: 0, ok: 0, amount: 0, done: false };
    const nq = ROOM_QUESTIONS;

    /* خلصت أو خرجت */
    if (pr.done) {
      const both = roomBothDone();
      const win = roomWinner();
      const label = (t) => (t === 'a' ? 'الفريق أ' : 'الفريق ب');
      const otherT = myTeam() === 'a' ? 'b' : 'a';
      const otherPr = teamProgress(otherT);
      const otherLeft = Math.max(0, ROOM_QUESTIONS - Math.max.apply(null, [0].concat(
        teamMembers(otherT).map((p) => Number(roomProgressOf(p.uid).q || 0))
      )));
      return '<section class="wrap page roomplay">' +
        '<span class="chip chip--live">' + ICON('trophy') + ' مكسبك اتقفل</span>' +
        '<h1 class="page__title">' + num(Number(pr.amount || 0)) + ' جنيه</h1>' +
        '<p class="lead">' + (both
          ? (win === 'tie' ? 'تعادل! الفريقين وصلوا نفس المكسب.' : 'الفريق الفايز: ' + label(win))
          : 'خلصت الـ' + num(ROOM_QUESTIONS) + ' سؤال بتوعك — استنى الفريق التاني يخلص (فاضلله حوالي ' + num(otherLeft) + ' سؤال). مفيش خروج بدري.') + '</p>' +
        '<div class="roomgrid">' +
          '<div class="roomteam' + (myTeam() === 'a' ? ' is-mine' : '') + '"><div class="roomteam__head"><b>الفريق أ</b></div>' +
            teamProgress('a').list.map((x) => '<div class="roomrow"><span>' + esc(x.name) + '</span><b>' + (x.done ? num(x.amount) + ' جنيه' : 'بيكمّل…') + '</b></div>').join('') +
            '<div class="roomrow roomrow--total"><span>أعلى مكسب</span><b>' + num(teamProgress('a').amount) + '</b></div></div>' +
          '<div class="roomteam' + (myTeam() === 'b' ? ' is-mine' : '') + '"><div class="roomteam__head"><b>الفريق ب</b></div>' +
            teamProgress('b').list.map((x) => '<div class="roomrow"><span>' + esc(x.name) + '</span><b>' + (x.done ? num(x.amount) + ' جنيه' : 'بيكمّل…') + '</b></div>').join('') +
            '<div class="roomrow roomrow--total"><span>أعلى مكسب</span><b>' + num(teamProgress('b').amount) + '</b></div></div>' +
        '</div>' +
        '<div class="card__actions" style="justify-content:center">' +
          '<button class="btn btn--ghost" data-act="room-leave">' + ICON('back') + ' خروج من الغرفة</button>' +
        '</div>' +
      '</section>';
    }

    const view = roomQuestionView();
    if (!view) {
      return '<section class="wrap page"><div class="empty">' + ICON('check', 'ico--xl') + 'خلصت أسئلتك — مكسبك ' + num(Number(pr.amount || 0)) + ' جنيه</div></section>';
    }

    const keys = ['أ', 'ب', 'ج', 'د'];
    const safe = mzSafe(Number(pr.ok || 0));
    return '<section class="wrap page roomplay">' +
      '<div class="roomhead">' +
        '<span class="chip chip--live">' + ICON('users') + ' الفريق ' + (myTeam() === 'a' ? 'أ' : 'ب') + ' — سؤال ' + num(Number(pr.q || 0) + 1) + ' / ' + num(nq) + '</span>' +
        '<span class="chip">' + ICON('wallet') + ' مكسبك المضمون: <b>' + mzMoney(safe) + '</b></span>' +
      '</div>' +
      '<div class="quiz__bar" style="margin:14px 0 0"><i id="roomTimer" style="width:100%"></i></div>' +
      '<p class="hint" style="text-align:end;margin:6px 2px 0">فاضل <b id="roomTimerN">' + Math.ceil(Number(meta.secs || 30)) + '</b> ثانية</p>' +
      '<article class="qcard" style="margin-top:14px">' +
        '<h2 class="qtext">' + esc(view.t) + '</h2>' +
        '<div class="opts' + (view.opts.length === 2 ? ' opts--two' : '') + '">' +
          view.opts.map((o, i) => {
            const hidden = (view.hide || []).indexOf(i) > -1;
            const cls = 'opt' + (view.pick === i && view.phase === 'ask' ? ' is-on' : '') +
              (view.phase === 'wrong' && view.pick === i ? ' is-wrong' : '') +
              (view.phase === 'right' && i === view.ai ? ' is-right' : '');
            return '<button class="' + cls + '"' + (hidden || view.locked ? ' disabled' : '') +
              ' data-act="room-answer" data-i="' + i + '">' +
              '<span class="opt__key">' + keys[i] + '</span>' +
              '<span class="opt__label">' + (hidden ? '—' : esc(o.v)) + '</span></button>';
          }).join('') +
        '</div>' +
      '</article>' +
      '<div class="roomgrid" style="margin-top:16px">' +
        '<div class="roomteam' + (myTeam() === 'a' ? ' is-mine' : '') + '"><div class="roomteam__head"><b>الفريق أ</b><span>' + (teamProgress('a').done ? num(teamProgress('a').amount) : 'بيلعب') + '</span></div></div>' +
        '<div class="roomgrid"></div>' +
        '<div class="roomteam' + (myTeam() === 'b' ? ' is-mine' : '') + '"><div class="roomteam__head"><b>الفريق ب</b><span>' + (teamProgress('b').done ? num(teamProgress('b').amount) : 'بيلعب') + '</span></div></div>' +
      '</div>' +
      '<p class="hint" style="text-align:center;margin-top:14px">مفيش انسحاب في التحدي — كمّل الـ' + num(ROOM_QUESTIONS) + ' سؤال.</p>' +
    '</section>';
  }

  /* ---------- الأكثر تصويتًا ---------- */
  function viewTrending() {
    const list = allQuestions().map((q) => ({ q, n: realVotes(q) })).sort((a, b) => b.n - a.n);
    const voted = list.filter((x) => x.n > 0).length;
    const board = Object.keys(DATA.board || {}).map((uid) => Object.assign({ uid: uid }, DATA.board[uid]))
      .filter((p) => Number(p.best || 0) > 0)
      .sort((a, b) => Number(b.best || 0) - Number(a.best || 0))
      .slice(0, 10);
    return '<section class="wrap page">' +
      '<span class="eyebrow">لوحة الصدارة</span>' +
      '<h1 class="page__title">الأكثر تصويتًا</h1>' +
      '<p class="lead">الأسئلة اللي الناس اتفاعلت معاها أكتر — الأصوات دي حقيقية وبتتجمع من كل اللاعبين في قاعدة البيانات.</p>' +
      (voted
        ? '<div class="ranks">' + list.slice(0, 12).map((x, i) => rankRow(x.q, i, x.n)).join('') + '</div>'
        : '<div class="empty">' + ICON('chart', 'ico--xl') + 'لسه مفيش أصوات مسجّلة — صوّت في أول سؤال وابدأ اللوحة.</div>') +
      '<div class="sec-head"><div><h2>متصدرو المليون</h2></div><span class="chip">' + num(board.length) + ' لاعب</span></div>' +
      (board.length
        ? '<div class="ranks">' + board.map((p, i) =>
            '<div class="rank"><span class="rank__n' + (i < 3 ? ' rank__n--' + (i + 1) : '') + '">' + (i + 1) + '</span>' +
            '<span class="rank__body"><span class="rank__q">' + esc(p.name || 'لاعب') + '</span>' +
            '<span class="hint">' + num(p.wins || 0) + ' فوز · ' + num(p.plays || 0) + ' جولة</span></span>' +
            '<span class="rank__v">' + num(p.best || 0) + ' جنيه</span></div>').join('') + '</div>'
        : '<div class="empty">' + ICON('trophy', 'ico--xl') + 'لسه محدش سجّل نتيجة — العب مستوى ووصل للفلوس.</div>') +
      '<div class="sec-head"><div><h2>أسئلة الزوار</h2></div><span class="chip">' + num(customQuestions().length) + ' سؤال</span></div>' +
      (customQuestions().length
        ? '<div class="grid-cards">' + customQuestions().map(miniCard).join('') + '</div>'
        : '<div class="empty">' + ICON('pencil', 'ico--xl') + 'لسه مفيش أسئلة من الزوار — كن أول واحد.<br><a class="btn btn--primary btn--sm" style="margin-top:14px" href="#/create">أضف سؤالك</a></div>') +
      '</section>';
  }

  /* ---------- أضف سؤالك ---------- */
  function viewCreate() {
    return '<section class="wrap page" style="max-width:720px">' +
      '<span class="eyebrow">منكم وإليكم</span>' +
      '<h1 class="page__title">أضف سؤالك</h1>' +
      '<p class="lead">اكتب سؤال «ماذا لو خيّروك بين…» على مزاج شلتك. السؤال بيتنشر في قاعدة البيانات ويظهر لكل اللاعبين.</p>' +
      (AUTH.user ? '' : '<p class="hint">محتاج تسجّل دخول عشان تنشر سؤال. <a href="#/auth?tab=login">دخول</a></p>') +
      '<form class="card" id="createForm" novalidate autocomplete="off">' +
        '<label class="field"><span>السؤال</span>' +
          '<textarea class="inp" name="q" rows="3" maxlength="160" placeholder="ماذا لو خيّروك بين…؟"></textarea></label>' +
        '<label class="field"><span>الاختيار الأول</span><input class="inp" name="o0" maxlength="60" autocomplete="off" placeholder="مثال: مليون دلوقتي"></label>' +
        '<label class="field"><span>الاختيار التاني</span><input class="inp" name="o1" maxlength="60" autocomplete="off" placeholder="مثال: ٥ مليون بعد ٥ سنين"></label>' +
        '<label class="field"><span>القسم</span><select class="inp" name="c">' +
          CATS.map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('') + '</select></label>' +
        '<button class="btn btn--primary btn--block" type="submit">' + ICON('sparkle') + ' انشر السؤال</button>' +
      '</form>' +
      '<div id="createOut" style="margin-top:20px"></div>' +
    '</section>';
  }

  /* ---------- الألعاب ---------- */
  function viewGames() {
    const g = STATE.game;
    return '<section class="wrap page">' +
      '<span class="eyebrow">المرحلة الجاية</span>' +
      '<h1 class="page__title">ألعاب ماذا لو</h1>' +
      '<p class="lead">ألعاب سريعة للرحلة والقعدة.</p>' +
      '<div class="promos promos--2">' +
        '<a class="promo" href="#/games/who"><span class="promo__art">' + ICON('dice', 'ico--xl') + '</span>' +
          '<b>مين يبدأ؟</b><span>عجلة تختار واحد من الشلة عشوائيًا — للألعاب وللأحكام الصعبة.</span>' +
          '<span class="promo__go">' + ICON('play') + ' العب</span></a>' +
        '<a class="promo" href="#/games/quiz"><span class="promo__art">' + ICON('bolt', 'ico--xl') + '</span>' +
          '<b>تحدي ٢٠ ثانية</b><span>أكبر عدد من الأسئلة في ٢٠ ثانية — صاحب أعلى رقم يكسب.</span>' +
          '<span class="promo__go">' + ICON('play') + ' العب</span></a>' +
      '</div>' +
    '</section>';
  }

  function viewWho() {
    const names = (LS.get('names', 'أحمد,محمد,سارة,يوسف,منة,عمر,نور,كريم')).split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
    return '<section class="wrap page" style="max-width:720px">' +
      '<div class="play__bar"><a class="btn btn--ghost btn--sm" href="#/games">' + ICON('back') + ' الألعاب</a>' +
        '<span class="chip chip--live">' + ICON('dice') + ' مين يبدأ؟</span></div>' +
      '<h1 class="page__title">مين يبدأ؟</h1>' +
      '<p class="lead">اكتب أسماء الشلة (كل اسم في سطر)، ودوس الزرار — والعجلة تختار.</p>' +
      '<div class="wheel"><div class="wheel__stage"><div class="wheel__name" id="whoName">جاهز؟</div></div>' +
        '<button class="btn btn--primary btn--lg" data-act="who-spin" id="whoBtn">' + ICON('refresh') + ' اختار عشوائي</button></div>' +
      '<label class="field" style="margin-top:18px"><span>الأسماء</span>' +
        '<textarea class="inp" id="whoNames" rows="6">' + esc(names.join('\n')) + '</textarea></label>' +
    '</section>';
  }

  function viewQuiz() {
    const g = STATE.game;
    if (g.running) {
      const q = g.deck[g.i];
      return '<section class="wrap page" style="max-width:720px">' +
        '<div class="quiz__top"><div class="quiz__timer"><b id="qzLeft">' + num(g.left) + '</b><small>ثانية</small></div>' +
        '<div class="quiz__score">' + ICON('target') + ' <b id="qzScore">' + num(g.score) + '</b></div></div>' +
        '<div class="quiz__bar"><i id="qzBar" style="width:' + (g.left / 20) * 100 + '%"></i></div>' +
        '<article class="qcard"><h2 class="qtext">' + esc(q.q) + '</h2>' +
        '<div class="opts' + (q.o.length === 2 ? ' opts--two' : '') + '">' +
        q.o.map((o, i) => '<button class="opt" data-act="qz-answer" data-i="' + i + '">' +
          '<span class="opt__key">' + (i + 1) + '</span><span class="opt__label">' + esc(o) + '</span></button>').join('') +
        '</div></article></section>';
    }
    return '<section class="wrap page" style="max-width:720px">' +
      '<div class="play__bar"><a class="btn btn--ghost btn--sm" href="#/games">' + ICON('back') + ' الألعاب</a>' +
        '<span class="chip chip--live">' + ICON('bolt') + ' تحدي ٢٠ ثانية</span></div>' +
      '<h1 class="page__title">قد إيه سؤال في ٢٠ ثانية؟</h1>' +
      '<p class="lead">٢٠ ثانية، اختيارات سريعة، وكل صوت بنقطة. أعلى رقم عندك بيتسجل.</p>' +
      '<div class="hero__stats" style="justify-content:flex-start">' +
        '<div class="stat"><b>' + num(Math.floor(myStats().best / 1000)) + '</b><span>أعلى رقم ليك</span></div>' +
        '<div class="stat"><b>20</b><span>ثانية</span></div></div>' +
      '<button class="btn btn--primary btn--lg" data-act="qz-start" style="margin-top:18px">' + ICON('play') + ' ابدأ</button>' +
    '</section>';
  }

  function viewGameFrame() {
    return '<section class="wrap page" style="max-width:1100px">' +
      '<div class="play__bar"><a class="btn btn--ghost btn--sm" href="#/games">' + ICON('back') + ' الألعاب</a>' +
        '<span class="chip">' + ICON('gamepad') + ' لعبة Godot</span>' +
        '<a class="btn btn--ghost btn--sm" id="frameFull" href="game.html" target="_blank" rel="noopener">' + ICON('expand') + ' ملء الشاشة</a></div>' +
      '<div class="frame" id="gameFrame">' +
        '<div class="frame__load" id="frameLoad"><span class="spin"></span> بنحمّل اللعبة…</div>' +
      '</div>' +
      '<p class="hint">لو الإطار فاضي: حط ملفات اللعبة في مجلد ملف <code>game.html</code> جنب <code>index.html</code>.</p>' +
    '</section>';
  }

  /* بيتأكد إن ملف اللعبة موجود قبل ما يحمّل الإطار، ولو مش موجود يعرض مكان محجوز */
  function mountGameFrame() {
    const box = $('#gameFrame');
    if (!box) return;
    const done = (ok) => {
      if (ok) {
        box.innerHTML = '<iframe src="game.html" title="لعبة Godot" allow="autoplay; fullscreen; gamepad"></iframe>' +
          '<div class="frame__load" id="frameLoad"><span class="spin"></span> بنحمّل اللعبة…</div>';
        const ifr = box.querySelector('iframe');
        ifr.addEventListener('load', () => box.classList.add('is-ready'));
      } else {
        box.classList.remove('is-ready');
        box.innerHTML = '<div class="frame__empty">' +
          '<span class="frame__ico">' + ICON('gamepad', 'ico--xl') + '</span>' +
          '<b>مكان اللعبة محجوز</b>' +
          '<span>حط ملف <code>game.html</code> (تصدير Godot) جنب <code>index.html</code>، واللعبة هتظهر هنا على طول.</span>' +
          '</div>';
        const full = $('#frameFull');
        if (full) full.style.display = 'none';
      }
    };
    fetch('game.html', { method: 'HEAD' }).then((r) => done(r.ok)).catch(() => done(false));
  }

  /* ---------- الصور والرسومات ---------- */
  function viewArt() {
    const items = [
      { f: 'million', t: 'مسرح المسابقة وشيك المليون', d: '1279×709', cdn: 'https://i.ibb.co/nsSs2xXG/million.png', cdnL: 'https://i.ibb.co/Fb4HLGSN/million-light.png' },
      { f: 'talk', t: 'اتنين من الشلة بيتكلموا', d: '900×490', cdn: 'https://i.ibb.co/QvfHx64Z/talk.png', cdnL: 'https://i.ibb.co/MkB4pQ2k/talk-light.png' },
      { f: 'trip', t: 'الشلة في رحلة', d: '900×490', cdn: 'https://i.ibb.co/nNZRM4n5/trip.png', cdnL: 'https://i.ibb.co/RGGyqxsP/trip-light.png' },
      { f: 'whatif', t: 'طفل ماسك علامة استفهام', d: '486×692', cdn: 'https://i.ibb.co/tMytNffL/whatif.png', cdnL: 'https://i.ibb.co/nMk1KM0k/whatif-light.png' }
    ];
    const urlsRow = '<div class="arturls"><b>ملفات الصور في المشروع</b>' +
      items.map((it) => '<a href="' + it.cdn + '" download>' + esc(it.f) + '.png — ' + it.d + '</a>' +
        (it.cdnL !== it.cdn ? '<a href="' + it.cdnL + '" download>' + esc(it.f) + '-light.png</a>' : '')).join('') +
      '</div>';
    return '<section class="wrap page">' +
      '<span class="eyebrow">أصول جاهزة</span>' +
      '<h1 class="page__title">صور ورسومات</h1>' +
      '<p class="lead">رسومات بخط اليد بخلفية <b>شفافة تمامًا</b> (PNG). كل رسمة ليه نسختين: حبر غامق للخلفيات الفاتحة، وحبر فاتح للخلفيات الغامقة. اضغط «تحميل» وهاتلاقيها على جهازك جاهزة للقص.</p>' +
      '<div class="arts">' + items.map((it) => '<figure class="art">' +
        '<div class="art__box art__box--dark"><img referrerpolicy="no-referrer" src="' + (it.cdnL || it.cdn) + '" data-cdn="' + (it.cdnL || it.cdn) + '" alt="' + esc(it.t) + ' (حبر فاتح)" loading="lazy"></div>' +
        '<div class="art__box art__box--light"><img referrerpolicy="no-referrer" src="' + it.cdn + '" data-cdn="' + it.cdn + '" alt="' + esc(it.t) + ' (حبر غامق)" loading="lazy"></div>' +
        '<figcaption><b>' + esc(it.t) + '</b><span>' + it.d + ' • PNG بخلفية شفافة</span>' +
        '<span class="art__dl">' +
          '<a class="btn btn--ghost btn--sm" href="' + it.cdn + '" download>' + ICON('download') + ' حبر غامق</a>' +
          '<a class="btn btn--ghost btn--sm" href="' + (it.cdnL || it.cdn) + '" download>' + ICON('download') + ' حبر فاتح</a>' +
        '</span></figcaption></figure>').join('') + '</div>' +
    '</section>' + urlsRow;
  }

  /* ---------- صفحات نصية ---------- */
  function viewAbout() {
    return '<section class="wrap page">' +
      '<h1 class="page__title">عن الموقع</h1>' +
      '<p class="lead">«من سيربح المليون؟» لعبة أسئلة عربية: ٤٠ سؤال من السهل للصعب، وسائل مساعدة، وشيك مليون جنيه باسمك لو كسبت. وجانبها قسم «ماذا لو خيّروك» — أسئلة جدلية للشلة والرحلات.</p>' +
      '<h2>من سيربح المليون</h2>' +
      '<ul class="ul"><li>كل جولة بتسحب ٤٠ سؤال عشوائي من بنك أسئلة كبير: ١٠ من كل مستوى صعوبة، وكل لاعب بيقابل أسئلة مختلفة.</li>' +
      '<li>وسائل المساعدة: ٥٠:٥٠، اسأل الجمهور، اتصال بصديق، وبدّل السؤال — كل واحدة مرة في الجولة.</li>' +
      '<li>شبكات أمان عند المستويات ٥ و١٥ و٢٥ و٣٥. تنسحب في أي وقت وتاخد مبلغ مستواك.</li>' +
      '<li>لو وصلت للمليون، بيتولّد شيك باسمك وتاريخك وتنزّله صورة PNG.</li></ul>' +
      '<h2>إزاي تستخدمه</h2>' +
      '<ul class="ul"><li>افتح «اللعب» واختار قسم، صوّت، وشوف نسبة اختيار الجمهور.</li>' +
      '<li>في الرحلة: «وضع الشلة» — كل واحد يقول اختياره، واللي ماسك التليفون يزوّد العداد.</li>' +
      '<li>عندك سؤال أحلى؟ اكتبه من «أضف سؤالك» وشاركه مع الشلة.</li></ul>' +
      '<h2>الأصوات بتتحسب إزاي</h2>' +
      '<p>كل صوت بيتخزن على حسابك — صوت واحد لكل حساب لكل سؤال، والنِسب اللي بتشوفها مجمّعة من كل اللاعبين على الموقع.</p>' +
      '<h2>البيانات</h2>' +
      '<p>الحسابات بتتعمل بالإيميل وكلمة مرور أو بحساب جوجل. جولاتك وفوزك وأصواتك وأسئلتك محفوظة على حسابك، وتقدر تسجّل خروج في أي وقت.</p>' +
    '</section>';
  }

  function viewPrivacy() {
    return '<section class="wrap page">' +
      '<h1 class="page__title">سياسة الخصوصية</h1>' +
      '<p class="lead">باختصار: الحساب بيتعمل بالإيميل أو جوجل، وأصواتك وأسئلتك وجولاتك بتتخزن على حسابك.</p>' +
      '<h2>الحساب</h2>' +
      '<p>التسجيل بيحصل بالإيميل وكلمة مرور أو بحساب جوجل. كلمة المرور مش بنشوفها ومش بتتخزن عندنا — بتتحقق منها خدمة الدخول الآمن.</p>' +
      '<h2>البيانات في قاعدة البيانات</h2>' +
      '<p>بيتخزن على حسابك: اسمك وإيميلك (بروفايل)، عدد جولاتك وفوزك وأعلى مكسب، وأصواتك على أسئلة «ماذا لو»، والأسئلة اللي بتنشرها. التصويتات بتظهر بشكل مجمّع لكل الزوار، واسمك بيظهر في لوحة المتصدرين لو سجّلت نتيجة.</p>' +
      '<h2>البيانات على جهازك</h2>' +
      '<p>بنسيب في المتصفح حاجات تفضيلية بس: إعداد الصوت والستريك والجولة المفتوحة — مش بيانات حساب.</p>' +
      '<h2>الإعلانات</h2>' +
      '<p>الموقع بيعرض مساحات إعلانية. لو اشتغلنا مع شبكة إعلانات، قد تستخدم كوكيز لتخصيص الإعلانات وفق سياساتها.</p>' +
      '<h2>حذف بياناتك</h2>' +
      '<p><button class="btn btn--ghost btn--sm" data-act="wipe">' + ICON('trash') + ' امسح بياناتي</button></p>' +
    '</section>';
  }

  function viewNotFound() {
    return '<section class="wrap page" style="text-align:center">' +
      '<div class="empty">' + ICON('question', 'ico--xl') + 'الصفحة دي مش موجودة.</div>' +
      '<a class="btn btn--primary" href="#/play">' + ICON('dice') + ' يلا نلعب</a></section>';
  }

  /* ==========================================================
     9) الراوتر
     ========================================================== */
  const app = () => $('#app');

  function parse() {
    const h = (location.hash || '#/').replace(/^#\/?/, '');
    const parts = h.split('?');
    const seg = parts[0].split('/').filter(Boolean);
    const params = {};
    if (parts[1]) new URLSearchParams(parts[1]).forEach((v, k) => { params[k] = v; });
    return { name: seg[0] || 'home', arg: seg[1] || '', params };
  }

  let timer = null;
  function render(scrollToTop) {
    const r = parse();
    let html = '';
    if (timer) { clearInterval(timer); timer = null; }
    switch (r.name) {
      case 'home': html = viewHome(); break;
      case 'play': html = viewPlay(r.params); break;
      case 'q': html = viewSingle(decodeURIComponent(r.arg)); break;
      case 'party':
        if (r.arg) html = viewRoom(r.arg.toUpperCase());
        else html = viewParty();
        break;
      case 'trending': html = viewTrending(); break;
      case 'create': html = viewCreate(); break;
      case 'games':
        if (r.arg === 'who') html = viewWho();
        else if (r.arg === 'quiz') html = viewQuiz();
        else if (r.arg === 'play') html = viewGameFrame();
        else html = viewGames();
        break;
      case 'million': html = viewMillion(r); break;
      case 'auth': html = authCardHTML(r.params.tab); break;
      case 'art': html = viewArt(); break;
      case 'about': html = viewAbout(); break;
      case 'privacy': html = viewPrivacy(); break;
      default: html = viewNotFound();
    }
    app().innerHTML = html;
    if (scrollToTop !== false) window.scrollTo(0, 0);
    markNav(r.name);
    const titles = { auth: 'الحساب', home: 'من سيربح المليون', million: 'من سيربح المليون', play: 'اللعب', q: 'سؤال', party: 'تحدي الشلة', trending: 'الأكثر تصويتًا', create: 'أضف سؤالك', games: 'الألعاب', art: 'الصور', about: 'عن الموقع', privacy: 'الخصوصية' };
    document.title = (titles[r.name] || 'صفحة') + ' — من سيربح المليون؟';
    if (r.name === 'games' && r.arg === 'quiz' && STATE.game.running) startGameTimer();
    if (r.name === 'games' && r.arg === 'play') mountGameFrame();
    /* غرف تحدي الشلة: ربط/فك المزامنة اللحظية على حسب المسار */
    if (!(r.name === 'party' && r.arg) && ROOM.ref) {
      roomDetach();
      ROOM.code = ''; ROOM.data = null;
    }
    if (r.name === 'million' && MZ.g && MZ.g.stage === 'win') setTimeout(mzDrawCheque, 0);
    const lad = document.getElementById('mzLadder');
    if (lad && lad.open && window.innerWidth >= 900) { const cur = lad.querySelector('.mzl.is-now'); if (cur) lad.scrollTop = Math.max(0, cur.offsetTop - lad.clientHeight / 2); }
    if (lad && window.innerWidth < 900) lad.removeAttribute('open');
  }

  function markNav(name) {
    const key = name === 'q' ? 'play' : (name === 'million' && (location.hash || '').indexOf('/rules') > -1 ? 'million-rules' : name);
    $$('[data-nav]').forEach((a) => {
      if (a.dataset.nav === key) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ==========================================================
     10) الأحداث
     ========================================================== */
  document.addEventListener('click', (e) => {
    const wa = e.target.closest('[data-wa]');
    if (wa) {
      e.preventDefault();
      const q = byId(wa.dataset.wa);
      if (q) window.open('https://wa.me/?text=' + encodeURIComponent(q.q + '\n' + qUrl(q.id)), '_blank', 'noopener');
      return;
    }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;

    if (act === 'vote') {
      const q = byId(el.dataset.qid);
      const i = Number(el.dataset.i);
      if (!q || isNaN(i)) return;
      if (myVote(q.id) !== undefined) { toast('صوّتت قبل كده في السؤال ده'); return; }
      const r = el.getBoundingClientRect();
      castVote(q, i).then((ok) => {
        if (!ok) return;
        confetti(r.left + r.width / 2, r.top + r.height / 2, 14);
        SFX.reveal();
        render(false);
        toast('تم التصويت! شوف الشلة اختارت إيه');
      });
      return;
    }

    if (act === 'next') {
      const q = nextQuestion(STATE.play.cat);
      if (!q) return;
      STATE.play.q = q;
      const host = $('#playHost');
      if (host) {
        host.style.opacity = '0';
        setTimeout(() => { host.innerHTML = qCard(q, { counter: 'سؤال جديد' }); host.style.opacity = '1'; SFX.tick(); }, 160);
      }
      return;
    }

    if (act === 'share') {
      const q = byId(el.dataset.qid);
      if (!q) return;
      shareQuestion(q).then((r) => {
        if (r === 'copied') toast('اتنسخ الرابط — ابعته للشلة');
        else if (r === 'shared') toast('تمام');
      });
      return;
    }

    if (act === 'filter') {
      STATE.play.cat = el.dataset.cat;
      STATE.play.q = null;
      render(false);
      return;
    }

    /* ---------- غرف تحدي الشلة ---------- */
    if (act === 'room-create') {
      if (!AUTH.user) { roomNeedAuth(); return; }
      roomCreate(4, 20, 30);
      return;
    }
    if (act === 'room-join') {
      const inp = $('#roomCode');
      roomJoin(inp ? inp.value : '');
      return;
    }
    if (act === 'room-team') { roomSwitchTeam(el.dataset.team === 'b' ? 'b' : 'a'); return; }
    if (act === 'room-size' || act === 'room-secs') {
      if (!ROOM.code) return;
      const meta = roomMeta();
      if (meta.host !== AUTH.user.id) { toast('منشئ الغرفة بس'); return; }
      const v = Number(el.dataset.v);
      const patch = {};
      if (act === 'room-size') { patch.size = v; patch.state = 'wait'; }
      if (act === 'room-secs') patch.secs = v;
      FB.mod.db.update(FB.ref('rooms/' + ROOM.code + '/meta'), patch).catch((e) => toast(fbWriteError(e)));
      return;
    }
    if (act === 'room-start') { roomStart(); return; }
    if (act === 'room-copy') {
      copyText(ROOM.code).then((ok) => {
        toast(ok ? 'اتنسخ كود الغرفة — ابعته للشلة' : 'النسخ مش متاح — حدّد الكود وانسخه يدويًا');
      });
      return;
    }
    if (act === 'room-leave') { roomLeave(); return; }
    if (act === 'room-answer') {
      const v = roomQuestionView();
      const i = Number(el.dataset.i);
      if (!v || v.locked || (v.hide || []).indexOf(i) > -1) return;
      roomAnswer(i);
      return;
    }

    /* مين يبدأ */
    if (act === 'who-spin') {
      const ta = $('#whoNames');
      const names = (ta ? ta.value : '').split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
      if (names.length < 2) { toast('اكتب اسمين على الأقل'); return; }
      LS.set('names', names.join(','));
      const box = $('#whoName');
      let n = 0;
      el.disabled = true;
      const tick = setInterval(() => {
        box.textContent = pick(names);
        SFX.tick(); n++;
        if (n > 12) {
          clearInterval(tick);
          const w = pick(names);
          box.textContent = w;
          box.classList.add('is-win');
          el.disabled = false;
          SFX.win(); confetti(null, window.innerHeight * 0.35, 26);
          setTimeout(() => box.classList.remove('is-win'), 1400);
        }
      }, 90);
      return;
    }

    /* تحدي ٢٠ ثانية */
    if (act === 'qz-start') {
      const g = STATE.game;
      g.running = true; g.left = 20; g.score = 0; g.i = 0;
      g.deck = shuffle(allQuestions()).slice(0, 40);
      render(false); startGameTimer();
      return;
    }
    if (act === 'qz-answer') {
      const g = STATE.game;
      g.score += 1; g.i = (g.i + 1) % g.deck.length;
      SFX.pick(); render(false);
      return;
    }

    if (act === 'signup') { doSignup(); return; }
    if (act === 'login') { doLogin(); return; }
    if (act === 'google') { doGoogle(); return; }
    if (act === 'logout') {
      AUTH.logout();
      toast('تم تسجيل الخروج');
      location.hash = '#/';
      render(false);
      return;
    }
    if (act === 'pw-eye') {
      const inp = document.getElementById('auPass');
      if (!inp) return;
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      el.innerHTML = ICON(show ? 'eyeoff' : 'eye');
      el.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
      return;
    }
    if (act === 'user-menu') {
      const m = document.getElementById('userMenu');
      if (!m) return;
      const open = m.classList.toggle('is-open');
      el.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    if (act === 'mz-quick' || act === 'mz-start') {
      if (typeof AUTH !== 'undefined' && !AUTH.user) {
        AUTH.afterAuth = '#/million'; MZ.pending = true;
        toast('سجّل دخول الأول عشان تبدأ اللعب');
        location.hash = '#/auth?tab=login';
        return;
      }
      const g = MZ.g;
      if (act === 'mz-quick' && g && g.deck && g.q && g.stage === 'q') { location.hash = '#/million'; return; }
      mzStart(MZ.name || '');
      return;
    }
    if (act === 'mz-pick') {
      const g = MZ.g;
      if (!g || !g.q || g.q.phase !== 'ask') return;
      const i = Number(el.dataset.i);
      if (g.q.hide.indexOf(i) > -1) return;
      g.q.pick = i;
      mzSaveGame(); SFX.tick(); render(false);
      return;
    }
    if (act === 'mz-ok') { mzAnswer(); return; }
    if (act === 'mz-f') { mzFifty(); return; }
    if (act === 'mz-a') { mzAudience(); return; }
    if (act === 'mz-p') { mzPhone(); return; }
    if (act === 'mz-s') { mzSwap(); return; }
    if (act === 'mz-take') {
      const g = MZ.g;
      if (!g || g.stage !== 'q') return;
      mzStop('take');
      toast('اتسحبت بـ ' + mzMoney(MZ.g.amount));
      return;
    }
    if (act === 'mz-again') {
      const g = MZ.g;
      mzStart((g && MZ.name) || MZ.name || '');
      return;
    }
    if (act === 'mz-dl') { mzDownload(); return; }
    if (act === 'mz-share') { nativeShare({ withImage: true }).then((r) => {
        if (r === 'copied') toast('اتنسخ النص — ابعته على واتساب أو أي تطبيق');
        else if (r === 'shared' || r === 'shared-file') toast('اختار التطبيق وابعت الفوز');
      }); return; }
    if (act === 'share-native') { mzShareAction('native'); return; }
    if (act === 'share-copy') { mzShareAction('copy'); return; }

    if (act === 'wipe') {
      ['votes', 'counts', 'custom', 'streak', 'names', 'mz_game', 'mz_name', 'mz_wins', 'mz_plays', 'mz_best', 'bestGame'].forEach((k) => LS.del(k));
      store.streak = { n: 0, last: '' }; store.save('streak');
      MZ.g = null; MZ.wins = 0; MZ.plays = 0; MZ.best = 0;
      toast('تم مسح بيانات الجهاز — بيانات حسابك زي ما هي'); render(false);
      return;
    }
  });

  /* فورم إضافة سؤال */
  document.addEventListener('submit', async (e) => {
    const f = e.target;
    if (!f.matches('#createForm')) return;
    e.preventDefault();
    if (!AUTH.user) {
      AUTH.afterAuth = '#/create';
      toast('سجّل دخول الأول عشان تنشر سؤالك');
      location.hash = '#/auth?tab=login';
      return;
    }
    const fd = new FormData(f);
    const q = String(fd.get('q') || '').trim();
    const o = [String(fd.get('o0') || '').trim(), String(fd.get('o1') || '').trim()].filter(Boolean);
    if (q.length < 8) { toast('اكتب سؤال أطول شوية'); return; }
    if (o.length < 2) { toast('محتاج اختيارين'); return; }
    const btn = f.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      const item = await addCustom({ q: q, o: o, c: String(fd.get('c') || 'weird'), custom: true });
      const out = $('#createOut');
      if (out) {
        out.innerHTML = qCard(item, {});
        out.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      f.reset();
      confetti(window.innerWidth / 2, window.innerHeight * 0.4, 20);
      toast('سؤالك اتنشر في قاعدة البيانات — شاركه مع الشلة');
    } catch (err) {
      toast((err && err.message) || fbWriteError(err));
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  /* مؤقت التحدي */
  function startGameTimer() {
    const g = STATE.game;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      g.left -= 1;
      const l = $('#qzLeft'), b = $('#qzBar');
      if (l) l.textContent = num(g.left);
      if (b) b.style.width = clamp((g.left / 20) * 100, 0, 100) + '%';
      if (g.left <= 5 && g.left > 0) SFX.tick();
      if (g.left <= 0) {
        clearInterval(timer); timer = null;
        g.running = false;
        const prevBest = myStats().best;
        if (g.score > 0) AUTH.recordBest(g.score * 1000);
        const best = Math.max(prevBest, g.score * 1000);
        app().innerHTML = '<section class="wrap page" style="max-width:700px;text-align:center">' +
          '<span class="eyebrow">خلص الوقت</span>' +
          '<h1 class="page__title">' + (g.score >= 15 ? 'وحش!' : g.score >= 8 ? 'تمام جدًا' : 'محاولة كويسة') + '</h1>' +
          '<div class="final"><b>' + num(g.score) + '</b><span>نقطة في ٢٠ ثانية</span></div>' +
          '<p class="lead">أعلى مكسب مسجّل في حسابك: ' + num(best) + ' جنيه' + (g.score * 1000 >= best && g.score > 0 ? ' — رقم قياسي جديد' : '') + '</p>' +
          '<div class="card__actions" style="justify-content:center">' +
            '<button class="btn btn--primary" data-act="qz-start">' + ICON('refresh') + ' العب تاني</button>' +
            '<a class="btn btn--ghost" href="#/games">' + ICON('back') + ' الألعاب</a>' +
          '</div></section>';
        SFX.win(); confetti(null, window.innerHeight * 0.3, 30);
      }
    }, 1000);
  }

  /* ==========================================================
     10.4) بنك أسئلة المليون — 1004 سؤال
     [النص, [4 اختيارات], رقم الصح, القسم, المستوى 1-4]
     ========================================================== */
  const MSTARS = [
["كم عدد أيام السنة الميلادية العادية؟", ["366 يومًا","350 يومًا","365 يومًا","360 يومًا"], 2, "عام", 1],
["كم عدد أيام الأسبوع؟", ["5 أيام","6 أيام","8 أيام","7 أيام"], 3, "عام", 1],
["كم عدد أشهر السنة؟", ["10 أشهر","11 شهرًا","12 شهرًا","13 شهرًا"], 2, "عام", 1],
["كم عدد ساعات اليوم؟", ["12 ساعة","20 ساعة","36 ساعة","24 ساعة"], 3, "عام", 1],
["كم دقيقة في الساعة الواحدة؟", ["60 دقيقة","45 دقيقة","90 دقيقة","100 دقيقة"], 0, "عام", 1],
["كم ثانية في الدقيقة الواحدة؟", ["30 ثانية","60 ثانية","100 ثانية","90 ثانية"], 1, "عام", 1],
["كم عدد ألوان قوس قزح؟", ["5 ألوان","6 ألوان","8 ألوان","7 ألوان"], 3, "عام", 1],
["كم عدد حروف اللغة العربية؟", ["26 حرفًا","28 حرفًا","30 حرفًا","25 حرفًا"], 1, "عام", 1],
["كم عدد حروف اللغة الإنجليزية؟", ["24 حرفًا","25 حرفًا","26 حرفًا","27 حرفًا"], 2, "عام", 1],
["ما اسم أقرب نجم إلى الأرض؟", ["الشمس","القمر","نجم الشمال","الشعرى"], 0, "عام", 1],
["ما اسم مجرة الأرض؟", ["مجرة أندروميدا","مجرة درب التبانة","مجرة سومبريرو","مجرة اللولب"], 1, "عام", 2],
["كم عدد الدقائق في اليوم كاملًا؟", ["1200 دقيقة","960 دقيقة","1440 دقيقة","2400 دقيقة"], 2, "عام", 2],
["في أي سنة تأتي السنة الكبيسة عادةً؟", ["كل سنة ثالثة","كل سنة خامسة","كل سنة سادسة","كل أربع سنوات"], 3, "عام", 2],
["أي شهر ميلادي عدد أيامه 28 يومًا في السنة العادية؟", ["مارس","فبراير","يناير","أبريل"], 1, "عام", 2],
["ما عدد الأشهر الميلادية التي عدد أيامها 30 يومًا؟", ["4 أشهر","3 أشهر","5 أشهر","6 أشهر"], 0, "عام", 2],
["ما اسم أول شهر في السنة القبطية المصرية؟", ["بابه","هاتور","توت","كيهك"], 2, "عام", 2],
["كم عدد النقاط الظاهرة على كل أوجه زهر النرد الستة؟", ["18","20","24","21"], 3, "عام", 2],
["ما وحدة قياس الزمن الأصغر من الثانية؟", ["الدقيقة","الميلي ثانية","الساعة","الديسي ثانية"], 1, "عام", 2],
["ما الشيء الذي يحدث كل 4 سنوات ويضيف يومًا للسنة؟", ["الخسوف","الاعتدال","السنة الكبيسة","الانقلاب"], 2, "عام", 2],
["ما اسم أعلى درجة على مقياس ريختر للزلازل من حيث الشدة؟", ["لا يوجد سقف محدد","10 درجات","12 درجة","9 درجات"], 0, "عام", 2],
["ما أطول يوم في السنة في نصف الكرة الشمالي؟", ["21 مارس","21 يونيو","21 سبتمبر","21 ديسمبر"], 1, "عام", 3],
["ما اسم التقويم الذي يعتمد على دورة القمر؟", ["التقويم الشمسي","التقويم القمري","التقويم اليولياني","التقويم الميلادي"], 1, "عام", 3],
["كم عدد الكيلومترات في الميل الواحد تقريبًا؟", ["1.6 كيلومتر","2.5 كيلومتر","1 كيلومتر","3.2 كيلومتر"], 0, "عام", 3],
["ما اسم أبرد مكان مسجل على وجه الأرض؟", ["القارة القطبية الجنوبية","سيبيريا","جرينلاند","ألاسكا"], 0, "عام", 3],
["ما اسم أول شهر في التقويم الهجري؟", ["صفر","محرم","ربيع الأول","شعبان"], 1, "عام", 3],
["كم عدد الكواكب في المجموعة الشمسية؟", ["7","10","8","9"], 2, "عام", 3],
["ما اسم الظاهرة التي تجعل السماء زرقاء نهارًا؟", ["الانعكاس الكلي","تشتت رايلي","الانكسار الجوي","الانحراف الضوئي"], 1, "عام", 4],
["ما اسم الجهاز الذي يقيس الرطوبة الجوية؟", ["البارومتر","الترمومتر","الهيجرومتر","الأنيمومتر"], 2, "عام", 4],
["كم عدد الكروموسومات في الخلية الجنسية البشرية؟", ["46","23","22","44"], 1, "عام", 4],
["ما اسم العلم الذي يدرس توزيع السكان؟", ["الديموغرافيا","الجيولوجيا","الإحصاء الرياضي","الأنثروبولوجيا"], 0, "عام", 4],
["كم عدد الأصفار في المليون؟", ["5","6","7","9"], 1, "عام", 4],
["ما اسم وحدة قياس شدة الصوت؟", ["الهرتز","الديسيبل","الواط","النيوتن"], 1, "عام", 4],
["ما اسم أطول عظمة في جسم الإنسان؟", ["عظمة الفخذ","عظمة الساق","الترقوة","الحوض"], 0, "عام", 4],
["ما هي عاصمة مصر؟", ["الإسكندرية","القاهرة","الجيزة","بورسعيد"], 1, "جغرافيا", 1],
["ما هي عاصمة السعودية؟", ["جدة","مكة المكرمة","الرياض","الدمام"], 2, "جغرافيا", 1],
["ما أكبر محيط في العالم؟", ["المحيط الهندي","المحيط الأطلسي","المحيط المتجمد","المحيط الهادي"], 3, "جغرافيا", 1],
["ما هي عاصمة اليابان؟", ["أوساكا","طوكيو","كيوتو","ناجويا"], 1, "جغرافيا", 1],
["ما هي عاصمة فرنسا؟", ["ليون","مرسيليا","باريس","نيس"], 2, "جغرافيا", 1],
["في أي قارة توجد مصر؟", ["آسيا","أوروبا","إفريقيا","أستراليا"], 2, "جغرافيا", 1],
["ما أكبر قارة في العالم مساحة؟", ["إفريقيا","آسيا","أوروبا","أمريكا الشمالية"], 1, "جغرافيا", 1],
["في أي بلد يوجد برج إيفل؟", ["إيطاليا","بلجيكا","فرنسا","إسبانيا"], 2, "جغرافيا", 1],
["ما هي عاصمة تونس؟", ["صفاقس","سوسة","تونس العاصمة","بنزرت"], 2, "جغرافيا", 1],
["ما البحر الواقع شرق مصر؟", ["البحر المتوسط","البحر الأحمر","البحر الأسود","بحر قزوين"], 1, "جغرافيا", 1],
["ما هي عاصمة المغرب؟", ["الدار البيضاء","الرباط","فاس","مراكش"], 1, "جغرافيا", 2],
["ما هي عاصمة الأردن؟", ["إربد","الزرقاء","عمّان","العقبة"], 2, "جغرافيا", 2],
["ما هي عاصمة لبنان؟", ["طرابلس","صيدا","زحلة","بيروت"], 3, "جغرافيا", 2],
["ما هي عاصمة العراق؟", ["البصرة","بغداد","الموصل","أربيل"], 1, "جغرافيا", 2],
["ما هي عاصمة كندا؟", ["تورونتو","مونتريال","أوتاوا","فانكوفر"], 2, "جغرافيا", 2],
["ما هي عاصمة أستراليا؟", ["سيدني","ملبورن","كانبيرا","بيرث"], 2, "جغرافيا", 2],
["ما أطول نهر في إفريقيا؟", ["نهر الكونغو","نهر النيجر","نهر النيل","نهر الزمبيزي"], 2, "جغرافيا", 2],
["في أي بلد يوجد تمثال الحرية؟", ["فرنسا","الولايات المتحدة","كندا","المكسيك"], 1, "جغرافيا", 2],
["ما هي عاصمة إسبانيا؟", ["برشلونة","فالنسيا","مدريد","إشبيلية"], 2, "جغرافيا", 2],
["ما هي عاصمة البرازيل؟", ["ريو دي جانيرو","ساو باولو","برازيليا","سالفادور"], 2, "جغرافيا", 3],
["ما هي عاصمة تركيا؟", ["إسطنبول","إزمير","بورصة","أنقرة"], 3, "جغرافيا", 3],
["ما هي عاصمة اليمن؟", ["عدن","صنعاء","تعز","الحديدة"], 1, "جغرافيا", 3],
["ما أصغر دولة في العالم مساحةً؟", ["موناكو","الفاتيكان","سان مارينو","مالطا"], 1, "جغرافيا", 3],
["ما أكبر دولة عربية مساحةً؟", ["السعودية","الجزائر","السودان","ليبيا"], 1, "جغرافيا", 3],
["ما اسم المضيق الذي يفصل مصر عن السعودية؟", ["مضيق هرمز","مضيق تيران","مضيق جبل طارق","مضيق باب المندب"], 1, "جغرافيا", 3],
["ما اسم أعلى قمة جبلية في إفريقيا؟", ["جبل كينيا","جبل كليمنجارو","جبل راس داشن","جبل تبستي"], 1, "جغرافيا", 3],
["بحر يقع بين السعودية ومصر؟", ["البحر الأحمر","الخليج العربي","البحر المتوسط","بحر العرب"], 0, "جغرافيا", 3],
["ما هي عاصمة نيوزيلندا؟", ["أوكلاند","ويلينغتون","كرايستشيرش","دنيدن"], 1, "جغرافيا", 3],
["أي دولة عربية ليس لها سواحل؟", ["السودان","تشاد","الجزائر","الصومال"], 1, "جغرافيا", 3],
["ما اسم أعمق نقطة في المحيطات؟", ["خندق ماريانا","خندق تونغا","خندق بورتو ريكو","خندق جاوة"], 0, "جغرافيا", 4],
["ما اسم أعلى شلال في العالم؟", ["شلالات نياجرا","شلالات فيكتوريا","شلالات آنجل","شلالات إجوازو"], 2, "جغرافيا", 4],
["ما أكبر جزيرة في العالم؟", ["مدغشقر","جرينلاند","بورنيو","غينيا الجديدة"], 1, "جغرافيا", 4],
["ما اسم البحر الذي تنخفض أرضه عن سطح البحر بأكثر من 400 متر؟", ["البحر الميت","البحر الأحمر","بحر قزوين","البحر الأسود"], 0, "جغرافيا", 4],
["ما هي عاصمة كازاخستان؟", ["ألماتي","نور سلطان (أستانا)","شيمكنت","أكتوبي"], 1, "جغرافيا", 4],
["ما اسم أطول سلسلة جبال في العالم على اليابسة؟", ["جبال الأنديز","جبال الهيمالايا","جبال روكي","جبال الألب"], 0, "جغرافيا", 4],
["أي دولة بها أكبر عدد من الجزر؟", ["إندونيسيا","الفلبين","السويد","فنلندا"], 2, "جغرافيا", 4],
["ما اسم النهر الذي يمر بأكبر عدد من الدول؟", ["النيل","الأمازون","الدانوب","الراين"], 2, "جغرافيا", 4],
["ما اسم الصحراء التي تقع في تشيلي؟", ["أتاكاما","ناميب","غوبي","ثار"], 0, "جغرافيا", 4],
["ما اسم أكبر بحيرة عذبة في العالم مساحةً؟", ["بحيرة فيكتوريا","بحيرة سوبيريور","بحيرة بايكال","بحيرة ميشيغان"], 1, "جغرافيا", 4],
["من هي الحضارة التي بنت الأهرامات في الجيزة؟", ["الحضارة الرومانية","الحضارة المصرية القديمة","الحضارة الفينيقية","الحضارة السومرية"], 1, "تاريخ", 1],
["من أول رئيس لجمهورية مصر العربية؟", ["جمال عبد الناصر","أنور السادات","محمد نجيب","حسني مبارك"], 2, "تاريخ", 1],
["في أي عام هبط الإنسان على سطح القمر لأول مرة؟", ["1959","1965","1972","1969"], 3, "تاريخ", 1],
["من هو الفرعون الذي بنى الهرم الأكبر في الجيزة؟", ["خوفو","خفرع","منقرع","سنفرو"], 0, "تاريخ", 1],
["في أي عام قامت الثورة الفرنسية؟", ["1776","1789","1804","1815"], 1, "تاريخ", 2],
["من كان قائد المسلمين في معركة حطين؟", ["عمرو بن العاص","صلاح الدين الأيوبي","خالد بن الوليد","قطز"], 1, "تاريخ", 2],
["في أي عام انتهت الحرب العالمية الثانية؟", ["1939","1941","1945","1950"], 2, "تاريخ", 2],
["في أي عام بدأت الحرب العالمية الأولى؟", ["1905","1914","1918","1929"], 1, "تاريخ", 2],
["من فتح مصر في عهد الخليفة عمر بن الخطاب؟", ["خالد بن الوليد","عمرو بن العاص","سعد بن أبي وقاص","أبو عبيدة بن الجراح"], 1, "تاريخ", 2],
["من بنى سد مأرب؟", ["السبأيون في اليمن","الفراعنة","الرومان","الفينيقيون"], 0, "تاريخ", 3],
["في أي عام هاجر الرسول محمد ﷺ من مكة إلى المدينة؟", ["622 م","610 م","632 م","600 م"], 0, "تاريخ", 2],
["أي حضارة اخترعت الكتابة المسمارية؟", ["المصرية","السومرية","اليونانية","الرومانية"], 1, "تاريخ", 2],
["في أي عام اكتشف كريستوفر كولومبوس أمريكا؟", ["1492 م","1498 م","1400 م","1510 م"], 0, "تاريخ", 2],
["من أحفاد صلاح الدين الذي واجه الصليبيين في معركة عين جالوت؟", ["المماليك بقيادة قطز","الأيوبيون بقيادة الكامل","العثمانيون","المغول"], 0, "تاريخ", 3],
["في أي عام تأمم الرئيس جمال عبد الناصر قناة السويس؟", ["1952","1954","1956","1967"], 2, "تاريخ", 3],
["من هو أول خليفة أموي؟", ["عبد الملك بن مروان","معاوية بن أبي سفيان","الوليد بن عبد الملك","عمر بن عبد العزيز"], 1, "تاريخ", 3],
["من هي الملكة المصرية الشهيرة المتزوجة من يوليوس قيصر ومارك أنطونيو؟", ["نفرتيتي","حتشبسوت","كليوباترا","تي"], 2, "تاريخ", 2],
["ما اسم المدينة التي كانت عاصمة الدولة العباسية؟", ["دمشق","القاهرة","بغداد","الكوفة"], 2, "تاريخ", 2],
["في أي عام وقعت معركة واترلو؟", ["1799","1805","1815","1821"], 2, "تاريخ", 3],
["من هو أول من دار حول الأرض بحرًا؟", ["كريستوفر كولومبوس","فاسكو دا جاما","ماجلان","جيمس كوك"], 2, "تاريخ", 3],
["في أي عام وقعت نكبة فلسطين؟", ["1936","1948","1956","1967"], 1, "تاريخ", 3],
["من أسس الدولة السعودية الأولى؟", ["الملك عبد العزيز","الإمام محمد بن سعود","الإمام تركي بن عبد الله","الملك فيصل"], 1, "تاريخ", 3],
["ما اسم الحضارة التي شيدت مدينة البتراء؟", ["الأنباط","الرومان","الفراعنة","الآشوريون"], 0, "تاريخ", 3],
["من هو الخليفة العباسي الذي بنى بيت الحكمة؟", ["المأمون","المنصور","هارون الرشيد","المعتصم"], 0, "تاريخ", 3],
["ما اسم أول جامعة في العالم ما زالت تعمل حتى اليوم؟", ["جامعة الأزهر","جامعة القرويين","جامعة بولونيا","جامعة أكسفورد"], 1, "تاريخ", 3],
["من قائد المسلمين في معركة القادسية؟", ["سعد بن أبي وقاص","خالد بن الوليد","المثنى بن حارثة","عمرو بن العاص"], 0, "تاريخ", 3],
["في أي عام سقطت الأندلس نهائيًا بسقوط غرناطة؟", ["1453","1492","1517","1258"], 1, "تاريخ", 3],
["في أي عام سقطت القسطنطينية في يد العثمانيين؟", ["1453","1492","1517","1402"], 0, "تاريخ", 4],
["ما اسم الحملة التي قادها نابليون على مصر؟", ["الحملة الفرنسية","الحملة البريطانية","الحملة الإيطالية","الحملة العثمانية"], 0, "تاريخ", 4],
["في أي عام احتلت بريطانيا مصر رسميًا؟", ["1882","1914","1922","1956"], 0, "تاريخ", 4],
["من هو الملك المصري الذي وحد القطرين لأول مرة؟", ["مينا (نارمر)","خوفو","رمسيس الثاني","أحمس"], 0, "تاريخ", 4],
["من هو الخليفة الذي أمر بجمع القرآن في مصحف واحد أول مرة؟", ["أبو بكر الصديق","عثمان بن عفان","علي بن أبي طالب","عمر بن الخطاب"], 0, "تاريخ", 4],
["في أي عام سقطت بغداد في يد هولاكو؟", ["1200","1236","1258","1300"], 2, "تاريخ", 4],
["ما اسم أول بعثة فرعونية ذهبت إلى بلاد بونت؟", ["بعثة حتشبسوت","بعثة رمسيس","بعثة تحتمس","بعثة سنوسرت"], 0, "تاريخ", 4],
["من هو مؤسس الدولة الأيوبية؟", ["صلاح الدين الأيوبي","نور الدين محمود","سيف الدين قطز","الظاهر بيبرس"], 0, "تاريخ", 4],
["ما هي أقدم حضارة معروفة في بلاد الرافدين؟", ["الأكادية","السومرية","البابلية","الآشورية"], 1, "تاريخ", 4],
["من هو شاعر النيل؟", ["أحمد شوقي","حافظ إبراهيم","المتنبي","البحتري"], 1, "أدب", 1],
["من هو أمير الشعراء؟", ["حافظ إبراهيم","أحمد شوقي","نزار قباني","إيليا أبو ماضي"], 1, "أدب", 2],
["من هو أول أديب عربي يفوز بجائزة نوبل في الأدب؟", ["طه حسين","نجيب محفوظ","توفيق الحكيم","أدونيس"], 1, "أدب", 2],
["من يُلقّب بعميد الأدب العربي؟", ["عباس العقاد","طه حسين","المازني","أحمد أمين"], 1, "أدب", 2],
["من صاحب رواية «أولاد حارتنا»؟", ["يوسف السباعي","نجيب محفوظ","إحسان عبد القدوس","توفيق الحكيم"], 1, "أدب", 3],
["من صاحب قصيدة «على قدر أهل العزم تأتي العزائم»؟", ["أبو تمام","البحتري","المتنبي","جرير"], 2, "أدب", 3],
["من قال «الخيل والليل والبيداء تعرفني»؟", ["عنترة بن شداد","امرؤ القيس","المتنبي","أبو فراس الحمداني"], 2, "أدب", 3],
["من هو شاعر فلسطين صاحب «سجل أنا عربي»؟", ["سميح القاسم","توفيق زياد","محمود درويش","إبراهيم طوقان"], 2, "أدب", 3],
["من صاحب كتاب «كليلة ودمنة» بالعربية (المترجم)؟", ["الجاحظ","ابن المقفع","الأصمعي","سيبويه"], 1, "أدب", 3],
["من صاحب «مقدمة» في علم العمران البشري؟", ["ابن بطوطة","ابن خلدون","ابن رشد","ابن سينا"], 1, "أدب", 2],
["من صاحب «رسالة الغفران»؟", ["الجاحظ","أبو العلاء المعري","ابن قتيبة","التوحيدي"], 1, "أدب", 4],
["من صاحب كتاب «البخلاء»؟", ["ابن المقفع","الجاحظ","التوحيدي","الأصمعي"], 1, "أدب", 3],
["من صاحب «حي بن يقظان»؟", ["ابن طفيل","ابن رشد","الفارابي","ابن سينا"], 0, "أدب", 4],
["من الشاعر الملقب بـ«شاعر الحكمة»؟", ["المتنبي","أبو العتاهية","زهير بن أبي سلمى","لبيد"], 0, "أدب", 4],
["من صاحب «الأيام» وهي سيرة ذاتية؟", ["العقاد","طه حسين","توفيق الحكيم","المازني"], 1, "أدب", 2],
["من صاحب مسرحية «أهل الكهف»؟", ["توفيق الحكيم","صلاح عبد الصبور","نجيب محفوظ","يوسف إدريس"], 0, "أدب", 3],
["من صاحب رواية «الحرافيش»؟", ["نجيب محفوظ","يوسف القعيد","إحسان عبد القدوس","خيري شلبي"], 0, "أدب", 3],
["من هي الشاعرة العربية الملقبة بـ«الخنساء» لرثائها؟", ["الخنساء نفسها","ولادة بنت المستكفي","رابعة العدوية","ليلى الأخيلية"], 0, "أدب", 2],
["من صاحب «تهافت الفلاسفة»؟", ["ابن رشد","الغزالي","ابن سينا","الفارابي"], 1, "أدب", 4],
["من هو الشاعر الجاهلي صاحب معلقة «قفا نبك»؟", ["طرفة بن العبد","امرؤ القيس","زهير بن أبي سلمى","عنترة"], 1, "أدب", 3],
["من هو صاحب المعلقة التي مطلعها «هل غادر الشعراء من متردم»؟", ["عنترة بن شداد","امرؤ القيس","لبيد بن ربيعة","عمرو بن كلثوم"], 0, "أدب", 4],
["من الشاعر الذي لُقّب بـ«شاعر الرسول»؟", ["كعب بن زهير","حسان بن ثابت","عبد الله بن رواحة","كعب بن مالك"], 1, "أدب", 2],
["من صاحب قصيدة «ألا ليت الشباب يعود يومًا»؟", ["أبو العتاهية","أبو نواس","المتنبي","أبو فراس"], 0, "أدب", 4],
["من صاحب «نهج البلاغة» من حيث الجمع؟", ["الشريف الرضي","الجاحظ","ابن أبي الحديد","سيد قطب"], 0, "أدب", 4],
["من مؤلف «عبقرية عمر»؟", ["العقاد","طه حسين","أحمد أمين","المازني"], 0, "أدب", 3],
["من صاحب ديوان «أغاني الحياة»؟", ["إيليا أبو ماضي","أبو القاسم الشابي","جبران خليل جبران","ميخائيل نعيمة"], 1, "أدب", 4],
["من الشاعر السوري صاحب «قارئة الفنجان»؟", ["نزار قباني","بدر شاكر السياب","أدونيس","ممدوح عدوان"], 0, "أدب", 2],
["من مؤلف «رجال في الشمس»؟", ["غسان كنفاني","إميل حبيبي","محمود درويش","جبرا إبراهيم جبرا"], 0, "أدب", 4],
["ما اسم الشاعر الذي قال: «وما نيل المطالب بالتمني»؟", ["أحمد شوقي","حافظ إبراهيم","المتنبي","إيليا أبو ماضي"], 0, "أدب", 4],
["من قال: «إذا الشعب يومًا أراد الحياة»؟", ["أبو القاسم الشابي","أحمد شوقي","معروف الرصافي","حافظ إبراهيم"], 0, "أدب", 3],
["من صاحب «حديث عيسى بن هشام»؟", ["محمد المويلحي","المنفلوطي","طه حسين","جبران"], 0, "أدب", 4],
["من الشاعر الملقب بـ«شاعر مصر القومي» وصاحب «قم يا مصري»؟", ["فؤاد حداد","صلاح جاهين","بيرم التونسي","أمل دنقل"], 1, "أدب", 4],
["من مؤلف رواية «ذاكرة الجسد»؟", ["أحلام مستغانمي","غادة السمان","حنان الشيخ","رضوى عاشور"], 0, "أدب", 3],
["من صاحب قصيدة «لا تصالح»؟", ["أمل دنقل","صلاح عبد الصبور","فاروق جويدة","نجيب سرور"], 0, "أدب", 4],
["ما اسم فن الشعر الذي يقوم على وحدة القافية والوزن في بيتين؟", ["الموشح","المثنوي","الرباعية","الزجل"], 1, "أدب", 4],
["من صاحب «أنا لا أكذب ولكني أتجمل»؟", ["إبراهيم عبد القادر المازني","العقاد","طه حسين","توفيق الحكيم"], 0, "أدب", 4],
["من مؤلف «ذاكرة الجسد» و«فوضى الحواس»؟", ["أحلام مستغانمي","غادة السمان","سحر خليفة","رضوى عاشور"], 0, "أدب", 3],
["من الشاعر الملقب بـ«شاعر الهجاء» في العصر العباسي؟", ["جرير","الفرزدق","الأخطل","بشار بن برد"], 0, "أدب", 4],
["ما اسم البحر الذي منه تفعيلة «مستفعلن»؟", ["الرجز","الكامل","الوافر","الطويل"], 0, "أدب", 4],
["من صاحب ديوان «اللزوميات»؟", ["المتنبي","أبو العلاء المعري","أبو تمام","البحتري"], 1, "أدب", 4],
["من قائل «أنا الذي نظر الأعمى إلى أدبي»؟", ["أبو نواس","المتنبي","البحتري","أبو تمام"], 1, "أدب", 2],
["من مؤلف رواية «الطريق» و«اللص والكلاب»؟", ["نجيب محفوظ","يوسف إدريس","عبد الرحمن الشرقاوي","فتحي غانم"], 0, "أدب", 3],
["ما اسم أول رواية عربية نُشرت في مصر عام 1914؟", ["زينب","عودة الروح","الأيام","حديث عيسى بن هشام"], 0, "أدب", 4],
["من صاحب مسرحية «مصرع كليوباترا» الشعرية؟", ["أحمد شوقي","عزيز أباظة","توفيق الحكيم","صلاح عبد الصبور"], 0, "أدب", 4],
["من الشاعر الذي كتب نشيد «بلادي بلادي»؟", ["محمد يونس القاضي","أحمد شوقي","حافظ إبراهيم","صلاح جاهين"], 0, "أدب", 3],
["كم عدد سور القرآن الكريم؟", ["100 سورة","112 سورة","114 سورة","120 سورة"], 2, "دين", 1],
["كم عدد أجزاء القرآن الكريم؟", ["20 جزءًا","30 جزءًا","40 جزءًا","60 جزءًا"], 1, "دين", 1],
["كم عدد أركان الإسلام؟", ["3","4","5","6"], 2, "دين", 1],
["كم عدد أركان الإيمان؟", ["4","5","6","7"], 2, "دين", 1],
["كم عدد ركعات صلاة المغرب؟", ["2","3","4","5"], 1, "دين", 1],
["في أي سورة توجد آية الكرسي؟", ["سورة آل عمران","سورة البقرة","سورة النساء","سورة المائدة"], 1, "دين", 2],
["ما اسم أطول سورة في القرآن الكريم؟", ["سورة النساء","سورة البقرة","سورة آل عمران","سورة الأعراف"], 1, "دين", 1],
["ما اسم أقصر سورة في القرآن الكريم؟", ["سورة الإخلاص","سورة الناس","سورة الكوثر","سورة العصر"], 2, "دين", 2],
["كم عدد الصلوات المفروضة في اليوم؟", ["3","4","5","6"], 2, "دين", 1],
["في أي شهر هجري فرض الصيام؟", ["شعبان","رجب","رمضان","شوال"], 2, "دين", 1],
["أي سورة تُسمّى قلب القرآن؟", ["سورة البقرة","سورة يس","سورة الكهف","سورة الرحمن"], 1, "دين", 2],
["في أي ليلة أُنزل القرآن؟", ["ليلة النصف من شعبان","ليلة القدر","ليلة الإسراء والمعراج","ليلة الجمعة"], 1, "دين", 2],
["من هو أول الخلفاء الراشدين؟", ["عمر بن الخطاب","أبو بكر الصديق","عثمان بن عفان","علي بن أبي طالب"], 1, "دين", 1],
["في أي غزوة انتصر المسلمون على قريش في السنة الثانية للهجرة؟", ["غزوة أحد","غزوة بدر","غزوة الخندق","غزوة حنين"], 1, "دين", 2],
["كم عدد الأشهر الحرم؟", ["2","3","4","5"], 2, "دين", 3],
["في أي سورة ذُكرت قصة أصحاب الكهف؟", ["سورة مريم","سورة الكهف","سورة طه","سورة الأنبياء"], 1, "دين", 2],
["ما اسم السورة التي لا تبدأ بالبسملة؟", ["سورة التوبة","سورة الأنفال","سورة الفتح","سورة الحجر"], 0, "دين", 3],
["كم عدد سور القرآن التي تبدأ بـ«حم»؟", ["3","5","7","9"], 2, "دين", 4],
["ما اسم السورة التي تُسمّى «العروس»؟", ["سورة الرحمن","سورة يوسف","سورة مريم","سورة النور"], 0, "دين", 3],
["ما اسم أول سورة نزلت في القرآن؟", ["سورة الفاتحة","سورة العلق","سورة المدثر","سورة البقرة"], 1, "دين", 2],
["كم سنة استمرت الدعوة الإسلامية في مكة؟", ["10 سنوات","13 سنة","15 سنة","20 سنة"], 1, "دين", 3],
["من هو الصحابي المُلقّب بـ«سيف الله المسلول»؟", ["خالد بن الوليد","عمر بن الخطاب","القعقاع بن عمرو","المثنى بن حارثة"], 0, "دين", 3],
["ما اسم أطول آية في القرآن الكريم؟", ["آية الكرسي","آية الدين","آية المواريث","آية النور"], 1, "دين", 4],
["كم عدد السجدات في القرآن الكريم (سجدات التلاوة)؟", ["11","13","15","17"], 2, "دين", 4],
["ما اسم السورة التي ذُكر فيها اسم «محمد» لأول مرة؟", ["سورة البقرة","سورة آل عمران","سورة محمد","سورة الفتح"], 1, "دين", 4],
["من هو الصحابي الذي جمع القرآن في مصحف واحد في عهد عثمان؟", ["زيد بن ثابت","أبي بن كعب","عبد الله بن مسعود","معاذ بن جبل"], 0, "دين", 4],
["ما اسم الغزوة التي تسمى «غزوة الأحزاب»؟", ["غزوة بدر","غزوة الخندق","غزوة حنين","غزوة تبوك"], 1, "دين", 3],
["كم عدد السور المكية تقريبًا؟", ["60","76","86","100"], 2, "دين", 4],
["ما اسم السورة التي بدأت بـ«تبارك»؟", ["سورة الملك","سورة الفرقان","سورة المؤمنون","سورة القلم"], 0, "دين", 3],
["ما هي أول قبلة للمسلمين في الصلاة؟", ["الكعبة","المسجد الأقصى","المسجد النبوي","مسجد قباء"], 1, "دين", 3],
["كم عدد آيات سورة البقرة؟", ["276 آية","286 آية","296 آية","300 آية"], 1, "دين", 4],
["ما اسم السورة التي تُعدل ثلث القرآن؟", ["سورة الفاتحة","سورة الإخلاص","سورة الكافرون","سورة يس"], 1, "دين", 3],
["كم عدد القراءات المتواترة للقرآن الكريم؟", ["7 قراءات","10 قراءات","14 قراءة","20 قراءة"], 1, "دين", 4],
["ما اسم أول مسجد بني في الإسلام؟", ["المسجد النبوي","مسجد قباء","المسجد الحرام","المسجد الأقصى"], 1, "دين", 3],
["من هو الصحابي الذي لُقّب بـ«أبو هريرة» لكثرة ملازمته للهررة؟", ["عبد الرحمن بن صخر","أنس بن مالك","أبو ذر الغفاري","سلمان الفارسي"], 0, "دين", 3],
["ما اسم السورة التي ذُكر فيها «بسم الله الرحمن الرحيم» مرتين؟", ["سورة النمل","سورة الفاتحة","سورة هود","سورة يونس"], 0, "دين", 4],
["في أي سنة هجرية فُرض الحج؟", ["السنة الخامسة","السنة السادسة","السنة التاسعة","السنة الحادية عشرة"], 2, "دين", 4],
["من هو الصحابي الذي روى أكثر أحاديث عن النبي ﷺ؟", ["أبو هريرة","عبد الله بن عمر","أنس بن مالك","عائشة"], 0, "دين", 3],
["ما اسم الكتاب الذي ألّفه الإمام البخاري؟", ["صحيح البخاري","صحيح مسلم","الموطأ","سنن أبي داود"], 0, "دين", 2],
["ما الغاز الذي يحتاجه الإنسان للتنفس؟", ["النيتروجين","الأكسجين","ثاني أكسيد الكربون","الهيدروجين"], 1, "علوم", 1],
["ما الرمز الكيميائي للماء؟", ["CO2","H2O","O2","NaCl"], 1, "علوم", 1],
["ما الكوكب الأحمر في المجموعة الشمسية؟", ["الزهرة","المريخ","عطارد","نبتون"], 1, "علوم", 1],
["ما العضو المسؤول عن ضخ الدم في الجسم؟", ["الكبد","الرئة","القلب","الكلية"], 2, "علوم", 1],
["ما أكبر حيوان على وجه الأرض؟", ["الفيل الإفريقي","الحوت الأزرق","الزرافة","القرش الأبيض"], 1, "علوم", 1],
["ما أكبر كوكب في المجموعة الشمسية؟", ["زحل","المشتري","أورانوس","نبتون"], 1, "علوم", 2],
["ما الفيتامين الذي يُصنّع في الجسم بمساعدة أشعة الشمس؟", ["فيتامين C","فيتامين A","فيتامين D","فيتامين B12"], 2, "علوم", 2],
["ما أكبر عضو في جسم الإنسان؟", ["الكبد","الجلد","الرئة","المخ"], 1, "علوم", 2],
["ما وحدة قياس القوة؟", ["الجول","الواط","النيوتن","الباسكال"], 2, "علوم", 2],
["ما اسم العلم الذي يدرس النجوم والكواكب؟", ["الجيولوجيا","الفلك","الأحياء","الكيمياء"], 1, "علوم", 2],
["كم عدد عظام جسم الإنسان البالغ؟", ["180 عظمة","206 عظمة","250 عظمة","300 عظمة"], 1, "علوم", 3],
["ما العنصر الأكثر وفرة في الغلاف الجوي للأرض؟", ["الأكسجين","النيتروجين","الأرجون","ثاني أكسيد الكربون"], 1, "علوم", 3],
["ما الغاز الذي ينتج عن عملية البناء الضوئي؟", ["ثاني أكسيد الكربون","الأكسجين","النيتروجين","الهيدروجين"], 1, "علوم", 2],
["كم عدد الكروموسومات في الخلية البشرية الطبيعية؟", ["23","44","46","48"], 2, "علوم", 3],
["ما العالم الذي وضع قوانين الحركة الثلاثة؟", ["أينشتاين","نيوتن","غاليليو","أرخميدس"], 1, "علوم", 2],
["ما اسم العملية التي يتحول فيها السائل إلى غاز؟", ["التجمد","التبخر","التكاثف","التسامي"], 1, "علوم", 2],
["ما وحدة قياس شدة التيار الكهربائي؟", ["الفولت","الأمبير","الأوم","الواط"], 1, "علوم", 3],
["ما اسم أكبر غدة في جسم الإنسان؟", ["البنكرياس","الكبد","الغدة الدرقية","الغدة النخامية"], 1, "علوم", 3],
["كم عدد الأسنان اللبنية عند الطفل؟", ["16","20","24","32"], 1, "علوم", 3],
["ما سرعة الضوء في الفراغ تقريبًا؟", ["30 ألف كم/ث","300 ألف كم/ث","3 ملايين كم/ث","1000 كم/ث"], 1, "علوم", 3],
["ما اسم أصغر وحدة بنائية للكائن الحي؟", ["النسيج","الخلية","العضو","الجهاز"], 1, "علوم", 2],
["ما اسم أقسى مادة طبيعية معروفة؟", ["الحديد","الألماس","الجرانيت","الكوارتز"], 1, "علوم", 3],
["ما اسم العملية التي تنقسم بها الخلية إلى خليتين متطابقتين؟", ["الانقسام المنصف","الانقسام المتساوي","التبرعم","الإخصاب"], 1, "علوم", 4],
["ما اسم الجزيء الذي يحمل الصفات الوراثية؟", ["البروتين","الـ DNA","الدهون","الكربوهيدرات"], 1, "علوم", 3],
["كم عدد الغرف في قلب الإنسان؟", ["2","3","4","5"], 2, "علوم", 2],
["ما اسم الجهاز الذي يقيس الضغط الجوي؟", ["الترمومتر","البارومتر","الهيجرومتر","الأنيمومتر"], 1, "علوم", 3],
["ما اسم وحدة قياس الطاقة في الغذاء؟", ["الكالوري","النيوتن","الأمبير","اللتر"], 0, "علوم", 2],
["ما اسم العنصر الكيميائي الذي رمزه Fe؟", ["الفضة","الحديد","الزنك","النحاس"], 1, "علوم", 3],
["ما اسم الظاهرة التي تنكسر فيها أشعة الضوء عند انتقالها بين وسطين؟", ["الانعكاس","الانكسار","التشتت","الامتصاص"], 1, "علوم", 3],
["ما اسم العالم الذي اكتشف البنسلين؟", ["لويس باستور","ألكسندر فلمنج","روبرت كوخ","إدوارد جينر"], 1, "علوم", 4],
["ما اسم الطاقة التي تنتج عن حركة الأجسام؟", ["طاقة الوضع","الطاقة الحركية","الطاقة الكيميائية","الطاقة النووية"], 1, "علوم", 3],
["كم عدد الأزواج الكروموسومية في الإنسان؟", ["21","22","23","24"], 2, "علوم", 4],
["ما اسم العنصر الأكثر تفاعلًا في الجدول الدوري؟", ["الأكسجين","الفلور","الصوديوم","الكلور"], 1, "علوم", 4],
["ما اسم القانون الذي ينص على أن لكل فعل رد فعل مساوٍ له في المقدار ومضاد في الاتجاه؟", ["قانون الجذب","قانون نيوتن الثالث","قانون بقاء الطاقة","قانون أرخميدس"], 1, "علوم", 3],
["ما اسم الجهاز المسؤول عن تنقية الدم من السموم؟", ["الكلية","الكبد","الطحال","الرئة"], 1, "علوم", 3],
["ما اسم العالم الذي صاغ نظرية النسبية؟", ["نيوتن","أينشتاين","بلانك","بور"], 1, "علوم", 2],
["ما اسم أكبر شريان في جسم الإنسان؟", ["الوريد الأجوف","الشريان الأورطي","الشريان الرئوي","الشريان السباتي"], 1, "علوم", 4],
["ما اسم العملية التي تمتص بها الجذور الماء من التربة؟", ["النتح","الأسموزية","البناء الضوئي","التنفس"], 1, "علوم", 4],
["ما اسم أصغر كواكب المجموعة الشمسية؟", ["عطارد","المريخ","الزهرة","بلوتو"], 0, "علوم", 4],
["كم لاعبًا في فريق كرة القدم داخل الملعب؟", ["10","11","12","9"], 1, "رياضة", 1],
["كم عدد أشواط مباراة كرة القدم؟", ["شوط واحد","شوطان","ثلاثة أشواط","أربعة أشواط"], 1, "رياضة", 1],
["كم دقيقة مدة المباراة في كرة القدم؟", ["60 دقيقة","80 دقيقة","90 دقيقة","120 دقيقة"], 2, "رياضة", 1],
["كل كم سنة تقام كأس العالم لكرة القدم؟", ["كل سنتين","كل ثلاث سنوات","كل أربع سنوات","كل خمس سنوات"], 2, "رياضة", 1],
["كم لاعبًا في فريق كرة السلة داخل الملعب؟", ["4","5","6","7"], 1, "رياضة", 2],
["في أي رياضة يستخدم المضرب والكرة الصفراء على ملعب عشبي؟", ["التنس","الاسكواش","كرة الطاولة","الريشة الطائرة"], 0, "رياضة", 1],
["ما اسم النادي المصري الملقب بـ«القلعة الحمراء»؟", ["الزمالك","الأهلي","الإسماعيلي","المصري"], 1, "رياضة", 1],
["في أي رياضة يوجد «الكوبري» و«الخنق»؟", ["الملاكمة","المصارعة","الجودو","الكاراتيه"], 1, "رياضة", 3],
["كم لاعبًا في فريق الكرة الطائرة داخل الملعب؟", ["5","6","7","11"], 1, "رياضة", 2],
["في أي دولة نشأت رياضة الجودو؟", ["الصين","اليابان","كوريا","تايلاند"], 1, "رياضة", 2],
["من المنتخب الذي فاز بكأس العالم 2022؟", ["فرنسا","البرازيل","الأرجنتين","ألمانيا"], 2, "رياضة", 2],
["أي منتخب فاز بكأس العالم أكثر من غيره؟", ["ألمانيا","إيطاليا","البرازيل","الأرجنتين"], 2, "رياضة", 2],
["من هو اللاعب البرازيلي الملقب بـ«الظاهرة»؟", ["مارادونا","رونالدو","بيليه","روماريو"], 1, "رياضة", 2],
["في أي رياضة تُستخدم كلمة «سلام دانك»؟", ["كرة السلة","كرة القدم","التنس","السباحة"], 0, "رياضة", 3],
["ما اسم البطولة الأهم للأندية الأوروبية في كرة القدم؟", ["الدوري الأوروبي","دوري أبطال أوروبا","كأس السوبر","كأس العالم للأندية"], 1, "رياضة", 2],
["كم عدد لاعبي فريق كرة اليد داخل الملعب؟", ["5","6","7","11"], 2, "رياضة", 3],
["كم مترًا طول حوض السباحة الأولمبي؟", ["25 مترًا","50 مترًا","75 مترًا","100 متر"], 1, "رياضة", 3],
["من هي الدولة الأولى عربيًا التي استضافت كأس العالم؟", ["المغرب","قطر","مصر","السعودية"], 1, "رياضة", 2],
["ما اسم الملعب الذي لُعب فيه نهائي كأس العالم 2022؟", ["لوسيل","البيت","الجنوب","974"], 0, "رياضة", 3],
["في أي رياضة تُستخدم كلمة «باتر»؟", ["الجولف","التنس","الكريكيت","البيسبول"], 3, "رياضة", 4],
["من الهداف التاريخي لكأس العالم؟", ["رونالدو","ميروسلاف كلوزه","بيليه","جيرد مولر"], 1, "رياضة", 4],
["من فاز بأول نسخة من كأس العالم عام 1930؟", ["البرازيل","الأوروغواي","الأرجنتين","إيطاليا"], 1, "رياضة", 4],
["كم عدد لاعبي فريق الكريكيت داخل الملعب؟", ["9","11","13","15"], 1, "رياضة", 3],
["ما اسم البطولة التي يشارك فيها أفضل لاعبي التنس على الملاعب الترابية في فرنسا؟", ["ويمبلدون","رولان غاروس","أستراليا المفتوحة","أمريكا المفتوحة"], 1, "رياضة", 3],
["من هو اللاعب الحاصل على أكبر عدد من الكرات الذهبية؟", ["كريستيانو رونالدو","ليونيل ميسي","ميشيل بلاتيني","ماركو فان باستن"], 1, "رياضة", 3],
["كم عدد حلقات شعار الألعاب الأولمبية؟", ["4","5","6","7"], 1, "رياضة", 2],
["أين أقيمت أول دورة أولمبية حديثة عام 1896؟", ["باريس","أثينا","لندن","روما"], 1, "رياضة", 4],
["في أي رياضة يوجد «الضربة الساحقة»؟", ["الكرة الطائرة","التنس","كرة السلة","الهوكي"], 0, "رياضة", 3],
["ما هو أكثر نادٍ تتويجًا بدوري أبطال إفريقيا في مصر؟", ["الزمالك","الأهلي","الإسماعيلي","المصري"], 1, "رياضة", 2],
["من رسم لوحة «الموناليزا»؟", ["مايكل أنجلو","ليوناردو دافنشي","بابلو بيكاسو","فينسنت فان جوخ"], 1, "فنون", 2],
["كم عدد أوتار الجيتار الكلاسيكي؟", ["4","5","6","7"], 2, "فنون", 2],
["من يلقّب بـ«كوكب الشرق»؟", ["فيروز","أم كلثوم","أسمهان","نجاة الصغيرة"], 1, "فنون", 2],
["من يلقّب بـ«العندليب الأسمر»؟", ["محمد عبد الوهاب","عبد الحليم حافظ","فريد الأطرش","محمد منير"], 1, "فنون", 2],
["ما اسم الآلة الموسيقية ذات 88 مفتاحًا؟", ["الأورغ","البيانو","الأكورديون","الهارب"], 1, "فنون", 2],
["في أي بلد نشأت البيتزا؟", ["فرنسا","إيطاليا","إسبانيا","اليونان"], 1, "فنون", 1],
["ما اسم الرقصة الشعبية المصرية الشهيرة بالعصا؟", ["التنورة","التحطيب","السامبا","الفلامنكو"], 1, "فنون", 3],
["من يلقّب بـ«موسيقار الأجيال»؟", ["محمد عبد الوهاب","بليغ حمدي","رياض السنباطي","زكريا أحمد"], 0, "فنون", 3],
["ما اسم المطربة اللبنانية الملقبة بـ«جارة القمر»؟", ["صباح","فيروز","نجاح سلام","ماجدة الرومي"], 1, "فنون", 3],
["كم عدد حروف السلم الموسيقي الغربي؟", ["5","6","7","8"], 2, "فنون", 2],
["من رسم سقف كنيسة سيستين في الفاتيكان؟", ["رافائيل","مايكل أنجلو","دافنشي","دوناتيلو"], 1, "فنون", 3],
["من رسم لوحة «ليلة النجوم»؟", ["كلود مونيه","فينسنت فان جوخ","بول سيزان","بول غوغان"], 1, "فنون", 3],
["ما اسم الحركة الفنية التي أسسها بيكاسو؟", ["السريالية","التكعيبية","التعبيرية","الانطباعية"], 1, "فنون", 3],
["من مؤلف رواية «عمارة يعقوبيان»؟", ["نجيب محفوظ","علاء الأسواني","أحمد مراد","يوسف إدريس"], 1, "فنون", 3],
["من مخرج فيلم «الأرض» المصري؟", ["يوسف شاهين","صلاح أبو سيف","محمد خان","داود عبد السيد"], 1, "فنون", 4],
["ما اسم الآلة التي تُعزف بالنفخ ولها صمامات نحاسية؟", ["الترومبيت","الكلارينيت","الناي","الساكسفون"], 0, "فنون", 3],
["ما اسم الفن الياباني القائم على طي الورق؟", ["أوريغامي","إيكيبانا","كاليجرافي","مانغا"], 0, "فنون", 3],
["من صاحب أغنية «ألف ليلة وليلة»؟", ["أم كلثوم","فيروز","نجاة الصغيرة","وردة الجزائرية"], 0, "فنون", 2],
["من رسم لوحة «الصرخة»؟", ["إدفارد مونك","بيكاسو","دالي","ماتيس"], 0, "فنون", 4],
["من رسم «العشاء الأخير»؟", ["مايكل أنجلو","ليوناردو دافنشي","رافائيل","تيتيان"], 1, "فنون", 3],
["ما اسم الحركة الفنية التي رسم فيها دالي ساعاته الذائبة؟", ["التكعيبية","السريالية","الانطباعية","الوحشية"], 1, "فنون", 3],
["ما اسم الفرقة المصرية التي غنّت «شبابيك»؟", ["المصريين","بلاك تيما","واما","كايروكي"], 0, "فنون", 4],
["من هو ملحّن «أنت عمري» لأم كلثوم؟", ["بليغ حمدي","محمد عبد الوهاب","رياض السنباطي","زكريا أحمد"], 1, "فنون", 3],
["ما اسم أول فيلم ناطق بالعربية؟", ["أولاد الذوات","ليلى","بابا عريس","شباب امرأة"], 0, "فنون", 4],
["في أي بلد نشأ فن الفلامنكو؟", ["البرتغال","إسبانيا","المكسيك","الأرجنتين"], 1, "فنون", 3],
["من مؤلف «موسيقى النهر الخالد»؟", ["محمد عبد الوهاب","رياض السنباطي","بليغ حمدي","فريد الأطرش"], 2, "فنون", 4],
["ما اسم أكبر متحف في العالم؟", ["متحف اللوفر","المتحف البريطاني","المتروبوليتان","الإرميتاج"], 0, "فنون", 3],
["في أي بلد يوجد سور الصين العظيم؟", ["اليابان","الصين","الهند","كوريا"], 1, "حول العالم", 1],
["ما عملة الولايات المتحدة؟", ["الجنيه","الدولار","اليورو","الفرنك"], 1, "حول العالم", 1],
["ما العملة المستخدمة في معظم دول الاتحاد الأوروبي؟", ["الجنيه الإسترليني","اليورو","الدولار","الكرونة"], 1, "حول العالم", 1],
["ما عاصمة إيطاليا؟", ["ميلانو","روما","نابولي","تورينو"], 1, "حول العالم", 1],
["ما عاصمة ألمانيا؟", ["ميونخ","برلين","هامبورغ","كولونيا"], 1, "حول العالم", 1],
["في أي بلد يوجد الكولوسيوم؟", ["اليونان","إيطاليا","إسبانيا","تركيا"], 1, "حول العالم", 2],
["ما اسم أكبر هرم في مصر؟", ["هرم خفرع","الهرم الأكبر خوفو","هرم منقرع","هرم سقارة"], 1, "حول العالم", 2],
["في أي قارة توجد البرازيل؟", ["أمريكا الشمالية","أمريكا الجنوبية","إفريقيا","آسيا"], 1, "حول العالم", 1],
["ما اسم البلد الذي يشتهر بأبراج ساغرادا فاميليا؟", ["إيطاليا","إسبانيا","البرتغال","فرنسا"], 1, "حول العالم", 2],
["كم عدد الدول العربية تقريبًا؟", ["15","22","30","10"], 1, "حول العالم", 2],
["ما عاصمة اليونان؟", ["سالونيك","أثينا","باتراس","هيراكليون"], 1, "حول العالم", 2],
["ما عاصمة البرتغال؟", ["بورتو","لشبونة","فارو","براغا"], 1, "حول العالم", 3],
["ما عاصمة الأرجنتين؟", ["قرطبة","بوينس آيرس","روساريو","مندوزا"], 1, "حول العالم", 2],
["ما أكبر دولة في العالم مساحة؟", ["كندا","روسيا","الصين","الولايات المتحدة"], 1, "حول العالم", 2],
["ما أصغر دولة عربية مساحة؟", ["قطر","البحرين","الكويت","لبنان"], 1, "حول العالم", 3],
["ما أكبر دولة عربية مساحة؟", ["السعودية","الجزائر","السودان","ليبيا"], 1, "حول العالم", 3],
["ما اسم أعلى برج في العالم؟", ["برج خليفة","برج شنغهاي","برج إيفل","برج المملكة"], 0, "حول العالم", 2],
["ما العلم الذي يتكون من لونين فقط؟", ["العلم المصري","العلم السعودي","العلم الإماراتي","العلم الفرنسي"], 1, "حول العالم", 3],
["في أي مدينة يوجد مطار هيثرو؟", ["نيويورك","لندن","باريس","دبي"], 1, "حول العالم", 2],
["ما أكثر دولة سكانًا في العالم حاليًا؟", ["الصين","الهند","الولايات المتحدة","إندونيسيا"], 1, "حول العالم", 3],
["ما أكثر دولة منتجة للنفط في العالم من حيث الاحتياطي؟", ["السعودية","فنزويلا","روسيا","العراق"], 1, "حول العالم", 4],
["ما اسم أكبر جزيرة في البحر المتوسط؟", ["صقلية","سردينيا","قبرص","كريت"], 0, "حول العالم", 4],
["ما اسم أول دولة في العالم منحت النساء حق التصويت؟", ["بريطانيا","نيوزيلندا","أمريكا","السويد"], 1, "حول العالم", 4],
["ما اسم البلد الذي تقع فيه مدينة البتراء؟", ["الأردن","سوريا","لبنان","العراق"], 0, "حول العالم", 2],
["ما أكثر مدينة سكانًا في إفريقيا؟", ["القاهرة","لاغوس","كينشاسا","جوهانسبرغ"], 1, "حول العالم", 4],
["ما اسم المضيق الذي يفصل بين آسيا وأفريقيا؟", ["مضيق هرمز","مضيق باب المندب","مضيق جبل طارق","مضيق البوسفور"], 1, "حول العالم", 4],
["ما البلد الذي ينتمي إليه جبل طارق من حيث السيادة؟", ["إسبانيا","بريطانيا","المغرب","البرتغال"], 1, "حول العالم", 4],
["ما اسم أطول سور دفاعي في أوروبا في العصر الروماني؟", ["سور هادريان","سور برلين","سور الصين","سور ماجينو"], 0, "حول العالم", 4],
["ما العملة الرسمية لليابان؟", ["اليوان","الين","الوون","البات"], 1, "حول العالم", 3],
["ما عاصمة كازاخستان؟", ["ألماتي","أستانا (نور سلطان)","شيمكنت","أكتوبي"], 1, "حول العالم", 4],
["في أي دولة تقع مدينة اسطنبول؟", ["اليونان","تركيا","بلغاريا","سوريا"], 1, "حول العالم", 2],
["ما اسم الدولة التي لها أكبر عدد من الجيران؟", ["روسيا","الصين","البرازيل","ألمانيا"], 1, "حول العالم", 4],
["ما اسم المدينة المقدسة عند المسلمين والمسيحيين واليهود؟", ["مكة","القدس","المدينة","بيت لحم"], 1, "حول العالم", 2],
["ما اسم أكبر بحيرة في إفريقيا؟", ["بحيرة تشاد","بحيرة فيكتوريا","بحيرة تنجانيقا","بحيرة مالاوي"], 1, "حول العالم", 4],
["ما اسم البلد الذي يمتلك أكبر عدد من السدود المائية؟", ["الصين","الولايات المتحدة","البرازيل","مصر"], 0, "حول العالم", 4],
["ما اللون الذي يعني «قف» في إشارات المرور؟", ["الأخضر","الأصفر","الأحمر","الأزرق"], 2, "حياة يومية", 1],
["ما اللي بيتعمل من القمح؟", ["الزيت","الخبز","السكر","الشاي"], 1, "حياة يومية", 1],
["ما المشروب الأكثر شعبية في مصر بعد الشاي؟", ["القهوة","العصير","اللبن","الينسون"], 0, "حياة يومية", 1],
["ما المكون الأساسي للطعمية المصرية؟", ["العدس","الفول المدشوش","الحمص","القمح"], 1, "حياة يومية", 1],
["ما رقم الإسعاف في مصر؟", ["122","123","180","121"], 1, "حياة يومية", 2],
["ما رقم الشرطة في مصر؟", ["123","122","180","121"], 1, "حياة يومية", 2],
["أكلة الكشري فيها أساسًا؟", ["أرز وسمك","أرز وعدس ومكرونة","لحمة وبطاطس","دجاج وأرز"], 1, "حياة يومية", 1],
["ما الفاكهة الصيفية الشهيرة الحمراء من الداخل؟", ["البرتقال","البطيخ","التفاح","العنب"], 1, "حياة يومية", 1],
["ما الشيء الذي يستخدم لتنظيف الأسنان؟", ["المشط","الفرشاة والمعجون","الصابون","المنشفة"], 1, "حياة يومية", 1],
["ماذا تعني كلمة «أوضة» بالمصرية؟", ["مطبخ","غرفة","صالة","حمام"], 1, "حياة يومية", 1],
["ما ترتيب إشارات المرور من الأعلى للأسفل؟", ["أحمر، أصفر، أخضر","أخضر، أصفر، أحمر","أصفر، أحمر، أخضر","أحمر، أخضر، أصفر"], 0, "حياة يومية", 2],
["ما الفيتامين الموجود بكثرة في البرتقال؟", ["فيتامين A","فيتامين C","فيتامين D","فيتامين K"], 1, "حياة يومية", 2],
["كم مرة يُنصح بغسل الأسنان يوميًا؟", ["مرة","مرتين","أربع مرات","أسبوعيًا"], 1, "حياة يومية", 2],
["ما أفضل تصرف عند حدوث حريق بسيط في المنزل؟", ["فتح الغاز","فصل الكهرباء والاتصال بالمطافئ","الانتظار","فتح النوافذ فقط"], 1, "حياة يومية", 3],
["ما اللي بيستخدم لتحلية الشاي؟", ["الملح","السكر","الفلفل","الكمون"], 1, "حياة يومية", 2],
["ما اسم الوثيقة التي تثبت هوية الشخص في مصر؟", ["جواز السفر","بطاقة الرقم القومي","رخصة القيادة","شهادة الميلاد"], 1, "حياة يومية", 2],
["ما اسم الجهاز المستخدم لقياس درجة حرارة الجسم؟", ["البارومتر","الترمومتر","الجلوكومتر","الميلانومتر"], 1, "حياة يومية", 2],
["ما المادة التي تُستخدم لإشعال عود الثقاب؟", ["الفوسفور الأحمر","الحديد","الرصاص","الزنك"], 0, "حياة يومية", 3],
["ما اسم أول وجبة يتناولها الناس في رمضان؟", ["السحور","الفطور","الغداء","العشاء"], 1, "حياة يومية", 2],
["ما اسم الغاز المضاف للمياه الغازية لإعطائها الفقاعات؟", ["الأكسجين","ثاني أكسيد الكربون","النيتروجين","الهيدروجين"], 1, "حياة يومية", 3],
["ما المادة الكيميائية المستخدمة في مكافحة الحشرات بالمنازل؟", ["المبيدات الحشرية","الكلور","السكر","الملح"], 0, "حياة يومية", 2],
["كم لترًا يتسع جالون أمريكي واحد تقريبًا؟", ["3.8 لتر","5 لترات","2 لتر","10 لترات"], 0, "حياة يومية", 4],
["ما اسم الضريبة التي تُضاف على السلع في مصر وتبلغ 14%؟", ["ضريبة الدخل","ضريبة القيمة المضافة","الجمارك","ضريبة العقارات"], 1, "حياة يومية", 4],
["ما اسم اليوم العالمي للمرأة؟", ["8 مارس","1 مايو","21 مارس","1 يونيو"], 0, "حياة يومية", 3],
["ما اسم العيد الذي يحتفل به المصريون في 6 أكتوبر؟", ["عيد العمال","عيد القوات المسلحة","عيد الفطر","عيد الربيع"], 1, "حياة يومية", 2],
["ما اسم الجهاز الذي يقلّد صوت الطبيب عند فحص الصدر؟", ["السماعة الطبية","المنظار","الميزان","المجهر"], 0, "حياة يومية", 3],
["ما اسم أطول نهر في أوروبا؟", ["نهر الفولغا","نهر الدانوب","نهر الراين","نهر السين"], 0, "جغرافيا", 3],
["ما هي عاصمة النرويج؟", ["أوسلو","ستوكهولم","كوبنهاغن","هلسنكي"], 0, "جغرافيا", 3],
["ما هي عاصمة السويد؟", ["ستوكهولم","أوسلو","كوبنهاغن","هلسنكي"], 0, "جغرافيا", 3],
["ما هي عاصمة الدنمارك؟", ["كوبنهاغن","ستوكهولم","أوسلو","أمستردام"], 0, "جغرافيا", 3],
["ما هي عاصمة هولندا؟", ["أمستردام","بروكسل","كوبنهاغن","برلين"], 0, "جغرافيا", 3],
["ما هي عاصمة بلجيكا؟", ["بروكسل","أمستردام","لوكسمبورغ","باريس"], 0, "جغرافيا", 3],
["ما هي عاصمة سويسرا؟", ["برن","زيوريخ","جنيف","بازل"], 0, "جغرافيا", 4],
["ما هي عاصمة النمسا؟", ["فيينا","زيوريخ","براغ","بودابست"], 0, "جغرافيا", 3],
["ما هي عاصمة بولندا؟", ["وارسو","براغ","فيينا","بودابست"], 0, "جغرافيا", 3],
["ما هي عاصمة المجر؟", ["بودابست","وارسو","براغ","بوخارست"], 0, "جغرافيا", 4],
["في أي مدينة يونانية يوجد الأكروبول الشهير؟", ["أثينا","سالونيك","باتراس","هيراكليون"], 0, "جغرافيا", 2],
["ما هي عاصمة الصين؟", ["بكين","شنغهاي","هونغ كونغ","غوانغجو"], 0, "جغرافيا", 2],
["ما هي عاصمة كوريا الجنوبية؟", ["سول","بوسان","طوكيو","بكين"], 0, "جغرافيا", 2],
["ما هي عاصمة الهند؟", ["نيودلهي","مومباي","كلكتا","بنغالور"], 0, "جغرافيا", 2],
["ما هي عاصمة باكستان؟", ["إسلام آباد","كراتشي","لاهور","بيشاور"], 0, "جغرافيا", 3],
["ما هي أكبر مدينة في إندونيسيا؟", ["جاكرتا","بالي","سورابايا","باندونغ"], 0, "جغرافيا", 3],
["ما هي عاصمة ماليزيا؟", ["كوالالمبور","سنغافورة","بانكوك","جاكرتا"], 0, "جغرافيا", 3],
["ما هي عاصمة تايلاند؟", ["بانكوك","كوالالمبور","هانوي","مانيلا"], 0, "جغرافيا", 3],
["ما هي عاصمة فيتنام؟", ["هانوي","هو تشي منه","بانكوك","بنوم بنه"], 0, "جغرافيا", 4],
["ما هي عاصمة الفلبين؟", ["مانيلا","جاكرتا","بانكوك","كوالالمبور"], 0, "جغرافيا", 3],
["ما هي عاصمة المكسيك؟", ["مكسيكو سيتي","غوادالاخارا","مونتيري","كانكون"], 0, "جغرافيا", 2],
["ما هي عاصمة كوبا؟", ["هافانا","سانتياغو","كاماغوي","ميامي"], 0, "جغرافيا", 3],
["ما هي عاصمة تشيلي؟", ["سانتياغو","ليما","بوينس آيرس","بوغوتا"], 0, "جغرافيا", 3],
["ما هي عاصمة بيرو؟", ["ليما","سانتياغو","بوغوتا","كيتو"], 0, "جغرافيا", 3],
["ما هي عاصمة كولومبيا؟", ["بوغوتا","ليما","كاراكاس","كيتو"], 0, "جغرافيا", 4],
["ما هي عاصمة فنزويلا؟", ["كاراكاس","بوغوتا","ليما","كيتو"], 0, "جغرافيا", 4],
["ما هي عاصمة مصر القديمة التي بناها عمرو بن العاص؟", ["الفسطاط","الإسكندرية","منف","طيبة"], 0, "تاريخ", 4],
["ما هي عاصمة مصر في عهد الفاطميين التي أسسها جوهر الصقلي؟", ["القاهرة","الفسطاط","الإسكندرية","القطائع"], 0, "تاريخ", 4],
["ما هي عاصمة الإمبراطورية البيزنطية؟", ["القسطنطينية","روما","أثينا","الإسكندرية"], 0, "تاريخ", 3],
["ما هي عاصمة الأمويين؟", ["دمشق","بغداد","الكوفة","مكة"], 0, "تاريخ", 2],
["ما هي عاصمة العباسيين؟", ["بغداد","دمشق","القاهرة","سامراء"], 0, "تاريخ", 2],
["ما هي عاصمة الدولة الفاطمية في المغرب قبل القاهرة؟", ["المهدية","القيروان","فاس","مراكش"], 0, "تاريخ", 4],
["ما هي عاصمة الأندلس في عهد الأمويين؟", ["قرطبة","غرناطة","إشبيلية","طليطلة"], 0, "تاريخ", 4],
["أي مدينة تُلقّب بـ«عروس النيل»؟", ["القاهرة","أسوان","الإسكندرية","المنيا"], 0, "جغرافيا", 2],
["أي مدينة تُلقّب بـ«عروس البحر المتوسط»؟", ["الإسكندرية","بورسعيد","دمياط","الغردقة"], 0, "جغرافيا", 2],
["أي مدينة مصرية تشتهر بمتحفها الفرعوني الجديد؟", ["الجيزة","أسوان","الأقصر","الإسماعيلية"], 0, "جغرافيا", 2],
["أي مدينة مصرية تُعرف بـ«مدينة الألف مئذنة»؟", ["القاهرة","الإسكندرية","أسيوط","طنطا"], 0, "جغرافيا", 4],
["في أي محافظة مصرية يوجد معبد أبو سمبل؟", ["أسوان","الأقصر","قنا","سوهاج"], 0, "جغرافيا", 3],
["في أي محافظة مصرية توجد وادي الملوك؟", ["الأقصر","أسوان","قنا","المنيا"], 0, "جغرافيا", 3],
["في أي مدينة مصرية يوجد جامع الأزهر؟", ["القاهرة","الإسكندرية","طنطا","المنصورة"], 0, "جغرافيا", 2],
["في أي مدينة مصرية يوجد قصر المنتزه؟", ["الإسكندرية","بورسعيد","السويس","دمياط"], 0, "جغرافيا", 3],
["ما اسم النهر الذي يمر في دمشق؟", ["بردى","الليطاني","الأردن","العاصي"], 0, "جغرافيا", 4],
["ما اسم النهر الذي يمر في بغداد؟", ["دجلة","الفرات","شط العرب","الكارون"], 0, "جغرافيا", 3],
["ما اسم النهر الذي يمر في القاهرة؟", ["النيل","الفرات","دجلة","الأردن"], 0, "جغرافيا", 1],
["ما اسم البحر الذي يطل عليه لبنان؟", ["البحر المتوسط","البحر الأحمر","البحر الأسود","بحر قزوين"], 0, "جغرافيا", 2],
["ما اسم الدولة التي تطل على البحر الأحمر وخليج عدن؟", ["اليمن","عمان","السعودية","مصر"], 0, "جغرافيا", 3],
["ما اسم أصغر دول الخليج مساحة؟", ["البحرين","قطر","الكويت","عمان"], 0, "جغرافيا", 3],
["ما اسم أكبر دولة في الخليج مساحة؟", ["السعودية","عمان","اليمن","الإمارات"], 0, "جغرافيا", 2],
["ما اسم العاصمة التي توجد بها الكعبة؟", ["مكة المكرمة","المدينة المنورة","الرياض","الطائف"], 0, "جغرافيا", 1],
["ما اسم المدينة التي هاجر إليها النبي ﷺ؟", ["المدينة المنورة","الطائف","خيبر","مكة"], 0, "دين", 1],
["ما اسم المسجد الذي أسسه النبي ﷺ عند وصوله للمدينة؟", ["مسجد قباء","المسجد النبوي","المسجد الأقصى","مسجد القبلتين"], 0, "دين", 3],
["ما اسم المدينة التي فيها المسجد الأقصى؟", ["القدس","دمشق","عمان","غزة"], 0, "جغرافيا", 2],
["ما اسم الدولة التي تقع فيها مدينة إستانبول الأوروبية والآسيوية؟", ["تركيا","اليونان","بلغاريا","جورجيا"], 0, "جغرافيا", 2],
["ما اسم المضيق الذي يقسم إستانبول؟", ["البوسفور","الدردنيل","جبل طارق","هرمز"], 0, "جغرافيا", 4],
["ما اسم الدولة التي تشتهر بمدينة البتراء الوردية؟", ["الأردن","لبنان","سوريا","مصر"], 0, "جغرافيا", 2],
["ما اسم البحر الذي يفصل إفريقيا عن أوروبا؟", ["البحر المتوسط","البحر الأحمر","البحر الأسود","البحر العربي"], 0, "جغرافيا", 1],
["ما اسم القارة التي يوجد بها أكبر عدد من الدول العربية؟", ["إفريقيا","آسيا","أوروبا","أمريكا الجنوبية"], 0, "جغرافيا", 3],
["ما اسم أكبر بحيرة صناعية في مصر؟", ["بحيرة ناصر","بحيرة قارون","المنزلة","البردويل"], 0, "جغرافيا", 3],
["ما اسم أعمق بحيرة في العالم؟", ["بايكال","فيكتوريا","سوبيريور","تنجانيقا"], 0, "جغرافيا", 4],
["أي جزيرة يمنية تشتهر بمزارع اللبان؟", ["سقطرى","مصيرة","فرسان","دلمون"], 0, "جغرافيا", 4],
["ما عدد الدول التي يتكون منها الاتحاد الأوروبي بعد خروج بريطانيا؟", ["27","28","30","25"], 0, "حول العالم", 4],
["ما هي العملة الرسمية في السعودية؟", ["الريال","الدينار","الدرهم","الجنيه"], 0, "حول العالم", 1],
["ما هي العملة الرسمية في الكويت؟", ["الدينار","الريال","الدرهم","الجنيه"], 0, "حول العالم", 2],
["ما هي العملة الرسمية في مصر؟", ["الجنيه المصري","الدينار","الريال","الدرهم"], 0, "حول العالم", 1],
["ما هي العملة الرسمية في الإمارات؟", ["الدرهم","الريال","الدينار","الجنيه"], 0, "حول العالم", 2],
["ما هي العملة الرسمية في تركيا؟", ["الليرة التركية","اليورو","الدولار","الدرهم"], 0, "حول العالم", 3],
["ما هي العملة الرسمية في روسيا؟", ["الروبل","اليورو","اليوان","الليرة"], 0, "حول العالم", 3],
["ما هي العملة الرسمية في الصين؟", ["اليوان","الين","الوون","الروبل"], 0, "حول العالم", 3],
["ما هي العملة الرسمية في بريطانيا؟", ["الجنيه الإسترليني","اليورو","الدولار","الفرنك"], 0, "حول العالم", 2],
["ما هي أطول سورة مدنية في القرآن الكريم؟", ["سورة البقرة","سورة آل عمران","سورة النساء","سورة المائدة"], 0, "دين", 4],
["ما عدد السور التي تبدأ بـ«الم»؟", ["6","4","5","7"], 0, "دين", 4],
["ما اسم السورة التي ذُكر فيها الذباب في مثل؟", ["سورة الحج","سورة البقرة","سورة النحل","سورة العنكبوت"], 0, "دين", 4],
["في أي سورة ورد وصف الجنة بـ«تجري من تحتها الأنهار» أول مرة؟", ["سورة البقرة","سورة الكهف","سورة الرحمن","سورة الواقعة"], 0, "دين", 4],
["ما اسم السورة التي تُسمّى «الفاضحة»؟", ["سورة التوبة","سورة النور","سورة الأحزاب","سورة المنافقون"], 0, "دين", 4],
["ما اسم السورة التي نزلت في صلح الحديبية؟", ["سورة الفتح","سورة النصر","سورة الأنفال","سورة التوبة"], 0, "دين", 3],
["كم عدد ركعات صلاة الفجر؟", ["2","3","4","5"], 0, "دين", 1],
["كم عدد ركعات صلاة العشاء؟", ["4","3","2","5"], 0, "دين", 1],
["كم عدد ركعات صلاة الظهر؟", ["4","2","3","5"], 0, "دين", 1],
["كم عدد التكبيرات في صلاة الجنازة؟", ["4","3","5","2"], 0, "دين", 3],
["في أي شهر هجري تُؤدى مناسك الحج؟", ["ذو الحجة","ذو القعدة","رمضان","محرم"], 0, "دين", 2],
["ما اسم اليوم الذي يقف فيه الحجاج على عرفة؟", ["9 ذو الحجة","10 ذو الحجة","1 محرم","27 رمضان"], 0, "دين", 3],
["ما اسم عيد المسلمين الذي يأتي بعد رمضان؟", ["عيد الفطر","عيد الأضحى","المولد النبوي","يوم عرفة"], 0, "دين", 1],
["كم عدد أشواط الطواف حول الكعبة؟", ["7","5","3","9"], 0, "دين", 2],
["كم عدد أشواط السعي بين الصفا والمروة؟", ["7","5","3","9"], 0, "دين", 2],
["في أي سنة هجرية كان فتح مكة؟", ["السنة الثامنة","السنة السادسة","السنة العاشرة","السنة الخامسة"], 0, "دين", 4],
["كم كان عمر النبي ﷺ عند البعثة؟", ["40","35","45","50"], 0, "دين", 3],
["من هي أول زوجة للنبي ﷺ؟", ["خديجة بنت خويلد","عائشة بنت أبي بكر","حفصة بنت عمر","أم سلمة"], 0, "دين", 1],
["من هو الصحابي الذي ذكر اسمه صريحًا في القرآن؟", ["زيد بن حارثة","أبو بكر","عمر","علي"], 0, "دين", 4],
["من أول من أسلم من الرجال؟", ["أبو بكر الصديق","علي بن أبي طالب","عمر بن الخطاب","عثمان بن عفان"], 0, "دين", 3],
["من أول من أسلم من الصبيان؟", ["علي بن أبي طالب","أبو بكر","زيد بن حارثة","عمر"], 0, "دين", 4],
["من أول من أسلم من النساء؟", ["خديجة","عائشة","فاطمة","سمية"], 0, "دين", 3],
["ما اسم أول شهيد في الإسلام؟", ["سمية بنت خياط","بلال بن رباح","ياسر بن عامر","حمزة"], 0, "دين", 4],
["ما اسم الصحابي الذي كان يؤذن في عهد النبي ﷺ؟", ["بلال بن رباح","زيد بن ثابت","أبو ذر","عمار بن ياسر"], 0, "دين", 2],
["ما اسم غزوة سميت أيضًا «غزوة العسرة»؟", ["تبوك","بدر","أحد","الخندق"], 0, "دين", 4],
["في أي غزوة شُجّ النبي ﷺ في رأسه وكُسرت رباعيته؟", ["أحد","بدر","حنين","خيبر"], 0, "دين", 3],
["كم عدد المسلمين في غزوة بدر تقريبًا؟", ["313","1000","700","1500"], 0, "دين", 3],
["كم عدد المشركين في غزوة بدر تقريبًا؟", ["1000","313","500","3000"], 0, "دين", 4],
["ما اسم الخليفة الذي وضع التأريخ الهجري؟", ["عمر بن الخطاب","أبو بكر","عثمان","علي"], 0, "دين", 4],
["من هو الصحابي الملقب بـ«ذو النورين»؟", ["عثمان بن عفان","علي بن أبي طالب","أبو بكر","عمر"], 0, "دين", 3],
["كم سنة حكم أبو بكر الصديق؟", ["سنتان","5 سنوات","10 سنوات","سنة واحدة"], 0, "دين", 3],
["من هو الخليفة الذي قُتل في بيته وهو يقرأ القرآن؟", ["عثمان بن عفان","عمر بن الخطاب","علي بن أبي طالب","أبو بكر"], 0, "دين", 3],
["ما اسم أول غزوة في الإسلام؟", ["غزوة بدر","غزوة أحد","غزوة الخندق","غزوة خيبر"], 0, "دين", 2],
["ما اسم السورة التي تُسمّى بـ«بني إسرائيل»؟", ["سورة الإسراء","سورة الكهف","سورة النمل","سورة يونس"], 0, "دين", 4],
["ما اسم الملك الذي يوحى إلى الأنبياء؟", ["جبريل","ميكائيل","إسرافيل","عزرائيل"], 0, "دين", 1],
["ما اسم الملك الموكَّل بالمطر؟", ["ميكائيل","جبريل","إسرافيل","مالك"], 0, "دين", 3],
["ما اسم الملك الموكَّل بالنفخ في الصور؟", ["إسرافيل","جبريل","ميكائيل","رضوان"], 0, "دين", 3],
["ما اسم كتاب المسيحيين المقدس؟", ["الإنجيل","التوراة","الزبور","القرآن"], 0, "دين", 2],
["ما اسم الكتاب الذي أُنزل على موسى؟", ["التوراة","الإنجيل","الزبور","القرآن"], 0, "دين", 2],
["ما اسم الكتاب الذي أُنزل على داود؟", ["الزبور","التوراة","الإنجيل","القرآن"], 0, "دين", 3],
["من هو أبو الأنبياء؟", ["إبراهيم عليه السلام","نوح","آدم","موسى"], 0, "دين", 3],
["من هو أول الأنبياء؟", ["آدم عليه السلام","نوح","إبراهيم","إدريس"], 0, "دين", 2],
["من النبي الذي بنى السفينة؟", ["نوح عليه السلام","موسى","هود","صالح"], 0, "دين", 1],
["من النبي الذي ألقاه الله في النار فكانت بردًا وسلامًا؟", ["إبراهيم عليه السلام","موسى","يوسف","يونس"], 0, "دين", 2],
["من النبي الذي ابتلعه الحوت؟", ["يونس عليه السلام","موسى","يوسف","أيوب"], 0, "دين", 2],
["من النبي الذي ابتُلي بالمرض سنوات طويلة؟", ["أيوب عليه السلام","يونس","يعقوب","زكريا"], 0, "دين", 3],
["من النبي الذي أُعطي ملكًا وسخرت له الريح؟", ["سليمان عليه السلام","داود","موسى","يوسف"], 0, "دين", 3],
["من النبي الذي كان يفهم لغة الطير؟", ["سليمان عليه السلام","داود","يوسف","عيسى"], 0, "دين", 2],
["من النبي الذي أُنجي من الجب وأصبح عزيزًا في مصر؟", ["يوسف عليه السلام","يونس","موسى","هارون"], 0, "دين", 2],
["من النبي الذي شُفي من مرضه بعد صبر طويل وأُعيد إليه أهله؟", ["أيوب عليه السلام","يوسف","يونس","زكريا"], 0, "دين", 3],
["كم عدد السور التي ذُكرت فيها قصة موسى؟", ["أكثر من 20 سورة","سورة واحدة","خمس سور","عشر سور"], 0, "دين", 4],
["ما وحدة قياس درجة الحرارة في النظام الدولي؟", ["الكلفن","السيلزيوس","الفهرنهايت","الرينيوم"], 0, "علوم", 3],
["كم عدد أضلاع الشكل السداسي؟", ["6","5","7","8"], 0, "علوم", 1],
["كم عدد أضلاع المثلث؟", ["3","4","5","6"], 0, "علوم", 1],
["ما مجموع زوايا المثلث؟", ["180 درجة","90 درجة","360 درجة","270 درجة"], 0, "علوم", 2],
["ما مجموع زوايا المربع؟", ["360 درجة","180 درجة","270 درجة","540 درجة"], 0, "علوم", 2],
["كم عدد أضلاع الشكل الثماني؟", ["8","6","10","12"], 0, "علوم", 1],
["ما اسم الرقم الذي لا يقبل القسمة إلا على نفسه وواحد؟", ["العدد الأولي","العدد الزوجي","العدد الكسري","العدد السالب"], 0, "علوم", 2],
["كم عدد الأصابع في يد الإنسان؟", ["5","4","6","10"], 0, "علوم", 1],
["كم عدد أسنان الشخص البالغ؟", ["32","28","24","36"], 0, "علوم", 3],
["ما أكثر عنصر كيميائي وفرة في القشرة الأرضية؟", ["الأكسجين","الحديد","السيليكون","الألومنيوم"], 0, "علوم", 4],
["ما أكثر معدن وفرة في القشرة الأرضية من حيث الوزن؟", ["الألومنيوم","الحديد","النحاس","الذهب"], 0, "علوم", 4],
["ما اسم الحالة الثالثة للمادة إلى جانب الصلب والسائل؟", ["الغاز","البلازما","البلوري","الغرواني"], 0, "علوم", 4],
["ما اسم أسرع حيوان بري؟", ["الفهد","الأسد","الحصان","الغزال"], 0, "علوم", 2],
["ما اسم أكبر طائر في العالم؟", ["النعامة","النسر","البطريق","الإيمو"], 0, "علوم", 2],
["ما اسم الطائر الذي لا يطير ويعيش في القطب؟", ["البطريق","النعامة","الطاووس","البجع"], 0, "علوم", 2],
["ما اسم الحشرة التي تنتج العسل؟", ["النحلة","الفراشة","الدبور","الجرادة"], 0, "علوم", 1],
["كم عدد قلوب الأخطبوط؟", ["3","1","2","4"], 0, "علوم", 4],
["ما اسم أكبر حيوان بري؟", ["الفيل الإفريقي","الزرافة","وحيد القرن","فرس النهر"], 0, "علوم", 2],
["ما اسم أطول حيوان في العالم؟", ["الزرافة","الفيل","الجمل","الحصان"], 0, "علوم", 1],
["ما اسم الحيوان الذي يُعرف بسنام على ظهره؟", ["الجمل","الحصان","الثور","الحمار"], 0, "علوم", 1],
["ما اسم أسرع طائر في العالم عند الانقضاض؟", ["الشاهين","النسر","السنونو","الغراب"], 0, "علوم", 4],
["ما اسم أكبر سمكة في العالم؟", ["القرش الحوتي","القرش الأبيض","الحوت الأزرق","سمكة الشمس"], 0, "علوم", 4],
["ما اسم الحيوان الثديي الذي يطير؟", ["الخفاش","السنجاب الطائر","البومة","الطاووس"], 0, "علوم", 2],
["كم عدد أرجل العنكبوت؟", ["8","6","10","4"], 0, "علوم", 2],
["كم عدد أرجل الحشرات؟", ["6","8","4","10"], 0, "علوم", 2],
["ما اسم العملية التي يصنع بها النبات غذاءه؟", ["البناء الضوئي","التنفس","النتح","الهضم"], 0, "علوم", 2],
["ما الغاز الذي يمتصه النبات من الهواء؟", ["ثاني أكسيد الكربون","الأكسجين","النيتروجين","الهيدروجين"], 0, "علوم", 2],
["ما اسم الجزء الذي يمتص الماء من النبات؟", ["الجذر","الساق","الورقة","الزهرة"], 0, "علوم", 1],
["ما اسم أكبر صحراء في العالم من حيث المساحة (غير القطبية)؟", ["الصحراء الكبرى","الربع الخالي","غوبي","كالاهاري"], 0, "علوم", 4],
["ما اسم الجهاز الذي يضخ الدم في الجسم؟", ["القلب","المعدة","الكبد","الرئة"], 0, "علوم", 1],
["ما اسم العضو الذي يفرز الأنسولين؟", ["البنكرياس","الكبد","الكلية","المعدة"], 0, "علوم", 4],
["ما اسم المرض الذي ينتج عن نقص الأنسولين؟", ["السكري","الأنيميا","الكساح","الزكام"], 0, "علوم", 3],
["ما اسم الفيتامين الذي يمنع مرض الأسقربوط؟", ["فيتامين سي","فيتامين د","فيتامين أ","فيتامين ب"], 0, "علوم", 4],
["ما اسم الفيتامين الذي يمنع العشى الليلي؟", ["فيتامين أ","فيتامين سي","فيتامين د","فيتامين ك"], 0, "علوم", 4],
["ما اسم العنصر الذي يعطي الدم لونه الأحمر؟", ["الحديد","النحاس","الزنك","الكالسيوم"], 0, "علوم", 3],
["كم لترًا من الدم في جسم الإنسان البالغ تقريبًا؟", ["5 لترات","2 لتر","10 لترات","8 لترات"], 0, "علوم", 3],
["ما اسم المادة التي تجعل العظام صلبة؟", ["الكالسيوم","الحديد","الصوديوم","البوتاسيوم"], 0, "علوم", 3],
["ما اسم الجهاز المسؤول عن التخلص من فضلات الجسم عبر البول؟", ["الكلية","الكبد","الرئة","الجلد"], 0, "علوم", 3],
["ما اسم العالم الذي وضع قانون الطفو؟", ["أرخميدس","نيوتن","غاليليو","أينشتاين"], 0, "علوم", 4],
["ما اسم العالم الذي اكتشف الجاذبية بعد سقوط تفاحة؟", ["نيوتن","أينشتاين","غاليليو","كبلر"], 0, "علوم", 2],
["ما اسم أول إنسان صعد للفضاء؟", ["يوري غاغارين","نيل أرمسترونج","جون جلين","ألان شيبرد"], 0, "علوم", 4],
["ما اسم أول رائدة فضاء في العالم؟", ["فالنتينا تيريشكوفا","سالي رايد","ماي جيمسون","كريستا مكوليف"], 0, "علوم", 4],
["ما اسم المركبة التي هبطت على القمر عام 1969؟", ["أبولو 11","أبولو 13","فوستوك 1","مير"], 0, "علوم", 3],
["ما اسم التلسكوب الفضائي الذي أُطلق عام 1990؟", ["هابل","جيمس ويب","كبلر","سبيتزر"], 0, "علوم", 4],
["ما اسم الكوكب الذي له حلقات شهيرة؟", ["زحل","المشتري","أورانوس","نبتون"], 0, "علوم", 2],
["ما اسم الكوكب الأبعد عن الشمس؟", ["نبتون","أورانوس","زحل","المشتري"], 0, "علوم", 3],
["ما اسم الكوكب الذي يمتلك أكبر قمر في المجموعة الشمسية؟", ["المشتري","زحل","نبتون","أورانوس"], 0, "علوم", 4],
["ما اسم أكبر قمر لكوكب المشتري؟", ["غانيميد","تيتان","القمر","أوروبا"], 0, "علوم", 4],
["ما اسم الكوكب الذي يُعرف بتوأم الأرض؟", ["الزهرة","المريخ","عطارد","نبتون"], 0, "علوم", 4],
["كم يستغرق ضوء الشمس للوصول إلى الأرض تقريبًا؟", ["8 دقائق","1 دقيقة","30 دقيقة","ساعة"], 0, "علوم", 4],
["ما اسم العلم الذي يدرس الزلازل؟", ["علم الزلازل","الجيولوجيا","الأرصاد","الجغرافيا"], 0, "علوم", 4],
["ما اسم الجهاز الذي يقيس الزلازل؟", ["السيزموغراف","البارومتر","الترمومتر","الهيجرومتر"], 0, "علوم", 4],
["ما اسم حاسة يرتبط بها الأنف؟", ["الشم","التذوق","السمع","البصر"], 0, "علوم", 1],
["ما اسم العضو الذي يتحكم في جميع أجهزة الجسم؟", ["المخ","القلب","الكبد","المعدة"], 0, "علوم", 1],
["من هو صاحب قصيدة «ولا تسل عن ديار الحي أين مضت»؟", ["أبو تمام","المتنبي","البحتري","الشريف الرضي"], 0, "أدب", 4],
["من صاحب «معلقة» مطلعها «عفت الديار محلها فمقامها»؟", ["زهير بن أبي سلمى","امرؤ القيس","طرفة","لبيد"], 0, "أدب", 4],
["من هو الشاعر الذي يُقال إنه أشعر أهل الجاهلية في الوصف؟", ["امرؤ القيس","عنترة","النابغة","زهير"], 0, "أدب", 4],
["من هو الشاعر الذي حكّم في سوق عكاظ وأُعليت له قبة؟", ["النابغة الذبياني","امرؤ القيس","طرفة","الأعشى"], 0, "أدب", 4],
["من صاحب قصيدة «إذا غامرت في شرف مروم»؟", ["المتنبي","أبو تمام","البحتري","ابن زيدون"], 0, "أدب", 3],
["من صاحب رسالة «الرسالة الحميرية»؟", ["الجاحظ","ابن المقفع","التوحيدي","أبو حيان"], 0, "أدب", 4],
["من مؤلف كتاب «الحيوان»؟", ["الجاحظ","ابن قتيبة","الأصمعي","الدامغي"], 0, "أدب", 4],
["من مؤلف كتاب «البيان والتبيين»؟", ["الجاحظ","ابن جني","سيبويه","الخليل"], 0, "أدب", 4],
["من واضع علم العروض؟", ["الخليل بن أحمد الفراهيدي","سيبويه","ابن جني","أبو الأسود الدؤلي"], 0, "أدب", 4],
["من واضع علم النحو الأول؟", ["أبو الأسود الدؤلي","سيبويه","الخليل","الكسائي"], 0, "أدب", 4],
["ما اسم عدد التفعيلات في بحر الطويل؟", ["أربع تفعيلات","ثلاث تفعيلات","خمس تفعيلات","ست تفعيلات"], 0, "أدب", 4],
["كم عدد بحور الشعر العربي في علم العروض؟", ["16","12","20","10"], 0, "أدب", 3],
["ما اسم الشاعر الملقب بـ«شاعر الرسول»؟", ["حسان بن ثابت","كعب بن زهير","عبد الله بن رواحة","كعب بن مالك"], 0, "أدب", 2],
["من صاحب قصيدة «بانت سعاد»؟", ["كعب بن زهير","حسان بن ثابت","جرير","الفرزدق"], 0, "أدب", 3],
["من الشاعر الملقب بـ«أبي نواس» وشهرته في وصف الخمر والحكمة؟", ["أبو نواس","أبو العتاهية","بشار بن برد","المتنبي"], 0, "أدب", 2],
["من الشاعر العباسي الملقب بـ«المتنبي» واسمه أحمد بن الحسين؟", ["المتنبي","البحتري","أبو تمام","ابن الرومي"], 0, "أدب", 3],
["من الشاعر الأندلسي صاحب قصيدة «لما تذكرت بالمجتبى»؟", ["ابن زيدون","لسان الدين بن الخطيب","ابن عبد ربه","المعتمد بن عباد"], 0, "أدب", 4],
["من مؤلف كتاب «طوق الحمامة»؟", ["ابن حزم الأندلسي","ابن رشد","ابن خلدون","ابن حيان"], 0, "أدب", 4],
["من صاحب «ألف ليلة وليلة» أول من ترجمها للفرنسية؟", ["أنطوان غالان","لويس شيخو","رفاعة الطهطاوي","جبران"], 0, "أدب", 4],
["من مؤلف رواية «زينب» أول رواية مصرية؟", ["محمد حسين هيكل","طه حسين","نجيب محفوظ","المازني"], 0, "أدب", 4],
["من مؤلف رواية «عودة الروح»؟", ["توفيق الحكيم","نجيب محفوظ","محمد حسين هيكل","يوسف السباعي"], 0, "أدب", 4],
["من مؤلف رواية «الحرافيش» و«أولاد حارتنا»؟", ["نجيب محفوظ","يوسف إدريس","توفيق الحكيم","عبد الرحمن الشرقاوي"], 0, "أدب", 2],
["من مؤلف «مجنون ليلى» أوبريت «مجنون ليلى»؟", ["أحمد شوقي","عزيز أباظة","بيرم التونسي","صلاح جاهين"], 0, "أدب", 4],
["من صاحب مسرحية «السلطان الحائر»؟", ["توفيق الحكيم","صلاح عبد الصبور","سعد الله ونوس","نجيب سرور"], 0, "أدب", 4],
["من صاحب قصيدة «أغنية للبائع المتجول»؟", ["فؤاد حداد","صلاح جاهين","أحمد فؤاد نجم","أمل دنقل"], 0, "أدب", 4],
["من مؤلف «العصفور الأزرق» في الطفولة؟", ["طه حسين","توفيق الحكيم","عبد التواب يوسف","كامل كيلاني"], 0, "أدب", 4],
["من مؤلف «قصص الأنبياء» المشهورة للشباب؟", ["كامل كيلاني","أحمد شوقي","حافظ إبراهيم","عبد الله بن المقفع"], 0, "أدب", 4],
["ما اسم الكتاب الذي يجمع قصائد شوقي؟", ["الشوقيات","ديوان حافظ","الأيام","حديث عيسى بن هشام"], 0, "أدب", 3],
["ما اسم الكتاب الذي يجمع قصائد حافظ إبراهيم؟", ["ديوان حافظ","الشوقيات","مقامات الحريري","الأيام"], 0, "أدب", 3],
["من مؤلف «قصة حياة» أو «أنا» لسيرة العقاد؟", ["عباس محمود العقاد","طه حسين","المازني","أحمد أمين"], 0, "أدب", 4],
["من مؤلف «فجر الإسلام» و«ضحى الإسلام»؟", ["أحمد أمين","العقاد","طه حسين","المازني"], 0, "أدب", 4],
["من مؤلف «في الشعر الجاهلي» مما أثار معركة أدبية؟", ["طه حسين","العقاد","المازني","شكري"], 0, "أدب", 4],
["من هي الأديبة اللبنانية صاحبة «أوراق الورد»؟", ["مي زيادة","غادة السمان","أحلام مستغانمي","عائشة تيمور"], 0, "أدب", 4],
["من مؤلف رواية «ذاكرة الجسد» الجزائرية؟", ["أحلام مستغانمي","غادة السمان","حنان الشيخ","سحر خليفة"], 0, "أدب", 3],
["من مؤلف «موسم الهجرة إلى الشمال»؟", ["الطيب صالح","غسان كنفاني","إميل حبيبي","جبرا"], 0, "أدب", 4],
["من صاحب قصيدة «على هذه الأرض ما يستحق الحياة»؟", ["محمود درويش","سميح القاسم","نزار قباني","أدونيس"], 0, "أدب", 3],
["من الشاعر السوري صاحب «قصائد حب» وقصيدة «أحبيني»؟", ["نزار قباني","أدونيس","ممدوح عدوان","بدر شاكر السياب"], 0, "أدب", 2],
["من رائد الشعر الحر العراقي صاحب «أنشودة المطر»؟", ["بدر شاكر السياب","نازك الملائكة","الجواهري","السياب وأدونيس"], 0, "أدب", 2],
["من رائدة الشعر الحر مع السياب؟", ["نازك الملائكة","غادة السمان","فدوى طوقان","عائشة التيمورية"], 0, "أدب", 4],
["من الشاعرة الفلسطينية صاحبة «أخي لن تغيب عني»؟", ["فدوى طوقان","محمود درويش","سميح القاسم","ليلى عثمان"], 0, "أدب", 4],
["من مؤلف «النبي» بالإنجليزية؟", ["جبران خليل جبران","ميخائيل نعيمة","إيليا أبو ماضي","أمين الريحاني"], 0, "أدب", 3],
["من صاحب كتاب «الغربان» والشاعر المعاصر؟", ["أحمد عبد المعطي حجازي","أدونيس","أمل دنقل","فاروق شوشة"], 0, "أدب", 4],
["من مؤلف «الأرض» الرواية المصرية؟", ["عبد الرحمن الشرقاوي","نجيب محفوظ","يوسف إدريس","خيري شلبي"], 0, "أدب", 4],
["من مؤلف رواية «اللص والكلاب»؟", ["نجيب محفوظ","يوسف إدريس","فتحي غانم","توفيق الحكيم"], 0, "أدب", 2],
["من مؤلف «أنا حرة» و«لا أنام»؟", ["إحسان عبد القدوس","يوسف السباعي","نجيب محفوظ","فتحي غانم"], 0, "أدب", 3],
["من مؤلف رواية «الطريق»؟", ["نجيب محفوظ","توفيق الحكيم","عبد الحكيم قاسم","يوسف القعيد"], 0, "أدب", 3],
["من مؤلف «عمارة يعقوبيان»؟", ["علاء الأسواني","أحمد مراد","نجيب محفوظ","بهاء طاهر"], 0, "أدب", 3],
["من مؤلف رواية «يوتوبيا»؟", ["أحمد خالد توفيق","أحمد مراد","علاء الأسواني","محمد صادق"], 0, "أدب", 4],
["من مؤلف سلسلة «ما وراء الطبيعة»؟", ["أحمد خالد توفيق","نبيل فاروق","أحمد مراد","جورج حنين"], 0, "أدب", 3],
["من مؤلف سلسلة «رجل المستحيل»؟", ["نبيل فاروق","أحمد خالد توفيق","محمد صادق","محمود سالم"], 0, "أدب", 3],
["من صاحب «أرني الله» و«ملائكة وشياطين»؟", ["يوسف زيدان","بهاء طاهر","علاء الأسواني","محمد حسنين هيكل"], 0, "أدب", 4],
["من مؤلف رواية «عزازيل»؟", ["يوسف زيدان","بهاء طاهر","إبراهيم عيسى","أحمد خالد توفيق"], 0, "أدب", 3],
["من مؤلف رواية «واحة الغروب»؟", ["بهاء طاهر","يوسف زيدان","خيري شلبي","إبراهيم عبد المجيد"], 0, "أدب", 4],
["من مؤلف رواية «ذات»؟", ["صنع الله إبراهيم","بهاء طاهر","علاء الأسواني","إبراهيم عبد المجيد"], 0, "أدب", 4],
["من مؤلف «الحب في المنفى»؟", ["بهاء طاهر","صنع الله إبراهيم","إبراهيم عبد المجيد","يوسف زيدان"], 0, "أدب", 4],
["من مؤلف رواية «شيكاغو»؟", ["علاء الأسواني","أحمد مراد","بهاء طاهر","صنع الله إبراهيم"], 0, "أدب", 4],
["من مؤلف «الأسود يليق بك»؟", ["أحلام مستغانمي","غادة السمان","حنان الشيخ","رضوى عاشور"], 0, "أدب", 4],
["من مؤلف «ذاكرة الجسد» و«نسيان»؟", ["أحلام مستغانمي","حنان الشيخ","سحر خليفة","مي زيادة"], 0, "أدب", 3],
["من مؤلف رواية «فرانكشتاين في بغداد»؟", ["أحمد سعداوي","سنع الله إبراهيم","أحمد مراد","علي بدر"], 0, "أدب", 4],
["من الشاعر الهندي صاحب «غيتانجالي»؟", ["طاغور","إقبال","جبران","حافظ"], 0, "أدب", 4],
["من صاحب مسرحية «روميو وجولييت»؟", ["وليام شكسبير","تشارلز ديكنز","فيكتور هوجو","تولستوي"], 0, "أدب", 2],
["من مؤلف رواية «أوليفر تويست»؟", ["تشارلز ديكنز","فيكتور هوجو","تولستوي","شكسبير"], 0, "أدب", 4],
["من مؤلف «البؤساء»؟", ["فيكتور هوجو","ديكنز","تولستوي","دوستويفسكي"], 0, "أدب", 3],
["من مؤلف «الجريمة والعقاب»؟", ["دوستويفسكي","تولستوي","تشيخوف","غوغول"], 0, "أدب", 4],
["من مؤلف «الحرب والسلام»؟", ["تولستوي","دوستويفسكي","تورجينيف","تشيخوف"], 0, "أدب", 3],
["من مؤلف «الأمير الصغير»؟", ["أنطوان دو سانت إكزوبيري","فيكتور هوجو","جول فيرن","إكزوبيري وديكنز"], 0, "أدب", 4],
["من مؤلف «حول العالم في ثمانين يومًا»؟", ["جول فيرن","ألكسندر دوما","فيكتور هوجو","هرمان ميلفيل"], 0, "أدب", 4],
["في أي سنة أُعلنت الجمهورية العربية المتحدة؟", ["1958","1952","1961","1971"], 0, "تاريخ", 4],
["في أي سنة انفصلت سوريا عن الجمهورية العربية المتحدة؟", ["1961","1958","1967","1970"], 0, "تاريخ", 4],
["في أي سنة توفي جمال عبد الناصر؟", ["1970","1967","1974","1965"], 0, "تاريخ", 3],
["في أي سنة حصلت مصر على استقلالها الاسمي من بريطانيا؟", ["1922","1919","1936","1952"], 0, "تاريخ", 4],
["في أي سنة وقعت معاهدة 1936 بين مصر وبريطانيا؟", ["1936","1922","1919","1954"], 0, "تاريخ", 4],
["في أي سنة قامت ثورة 23 يوليو؟", ["1952","1948","1956","1967"], 0, "تاريخ", 1],
["في أي سنة وقعت حرب أكتوبر؟", ["1973","1967","1956","1948"], 0, "تاريخ", 1],
["في أي سنة وقعت نكسة 1967؟", ["1967","1973","1956","1948"], 0, "تاريخ", 1],
["في أي سنة عادت طابا لمصر؟", ["1989","1979","1982","1990"], 0, "تاريخ", 4],
["في أي سنة وقعت مصر وإسرائيل اتفاقية كامب ديفيد؟", ["1978","1979","1973","1982"], 0, "تاريخ", 3],
["ما اسم المدينة التي وُقع فيها اتفاق السلام المصري الإسرائيلي عام 1979؟", ["واشنطن","كامب ديفيد","جنيف","مدريد"], 0, "تاريخ", 3],
["ما اسم السد الذي بنته مصر في الستينيات على النيل؟", ["السد العالي","سد أسوان القديم","سد قناطر الخيرية","سد إسنا"], 0, "تاريخ", 2],
["في أي سنة افتُتح السد العالي؟", ["1971","1960","1956","1980"], 0, "تاريخ", 4],
["في أي سنة اندلعت الحرب العالمية الثانية؟", ["1939","1945","1941","1914"], 0, "تاريخ", 2],
["في أي سنة انتهت الحرب العالمية الأولى؟", ["1918","1914","1920","1939"], 0, "تاريخ", 2],
["كم سنة استمرت حرب المئة عام تقريبًا؟", ["أكثر من 100","100 بالضبط","50","30"], 0, "تاريخ", 4],
["من ملك بريطانيا الذي تنازل عن العرش عام 1936؟", ["إدوارد الثامن","جورج السادس","هنري الثامن","تشارلز الثالث"], 0, "تاريخ", 4],
["في أي سنة سقط جدار برلين؟", ["1989","1991","1985","1993"], 0, "تاريخ", 3],
["في أي سنة انهار الاتحاد السوفيتي؟", ["1991","1989","1993","1985"], 0, "تاريخ", 3],
["في أي سنة حدثت أحداث 11 سبتمبر في أمريكا؟", ["2001","2003","1999","2005"], 0, "تاريخ", 2],
["في أي سنة بدأت الأزمة السورية؟", ["2011","2009","2013","2015"], 0, "تاريخ", 3],
["في أي سنة كانت الثورة في تونس ومصر المعروفة بالربيع العربي؟", ["2011","2009","2013","2005"], 0, "تاريخ", 2],
["في أي سنة توحدت الإمارات العربية المتحدة؟", ["1971","1968","1975","1961"], 0, "تاريخ", 4],
["في أي سنة تأسست المملكة العربية السعودية الحديثة؟", ["1932","1925","1945","1918"], 0, "تاريخ", 3],
["في أي سنة استقلت الجزائر؟", ["1962","1954","1958","1965"], 0, "تاريخ", 3],
["في أي سنة استقلت المغرب؟", ["1956","1962","1952","1960"], 0, "تاريخ", 4],
["في أي سنة استقلت ليبيا؟", ["1951","1945","1960","1969"], 0, "تاريخ", 4],
["من أول ملك لليبيا بعد الاستقلال؟", ["الملك إدريس السنوسي","معمر القذافي","الملك فؤاد","الملك فيصل"], 0, "تاريخ", 4],
["في أي سنة قامت ثورة الفاتح في ليبيا؟", ["1969","1951","1975","1961"], 0, "تاريخ", 3],
["في أي سنة استقل السودان؟", ["1956","1952","1960","1965"], 0, "تاريخ", 3],
["في أي سنة وقعت مذبحة دير ياسين؟", ["1948","1946","1956","1967"], 0, "تاريخ", 4],
["في أي سنة وقعت انتفاضة الأقصى الثانية؟", ["2000","1996","2005","2010"], 0, "تاريخ", 4],
["في أي سنة وقعت حرب الخليج الثانية لتحرير الكويت؟", ["1991","1990","1988","1993"], 0, "تاريخ", 3],
["في أي سنة غزت العراق الكويت؟", ["1990","1991","1988","1993"], 0, "تاريخ", 3],
["في أي سنة وقعت معركة العلمين في مصر؟", ["1942","1939","1945","1948"], 0, "تاريخ", 4],
["من قاد الحملة الفرنسية على مصر؟", ["نابليون بونابرت","لويس الرابع عشر","شارل ديغول","فرانسوا الأول"], 0, "تاريخ", 2],
["في أي سنة رحلت الحملة الفرنسية عن مصر؟", ["1801","1798","1805","1517"], 0, "تاريخ", 4],
["من محمد علي الكبير الذي حكم مصر وأسس أسرة حاكمة؟", ["محمد علي باشا","إبراهيم باشا","سعيد باشا","الخديوي إسماعيل"], 0, "تاريخ", 2],
["من الخديوي الذي افتتح قناة السويس؟", ["الخديوي إسماعيل","سعيد باشا","عباس الأول","توفيق"], 0, "تاريخ", 3],
["في أي سنة افتُتحت قناة السويس؟", ["1869","1859","1875","1882"], 0, "تاريخ", 3],
["من مهندس قناة السويس الفرنسي؟", ["فرديناند ديليسبس","غوستاف إيفل","نابليون الثالث","شارل ديغول"], 0, "تاريخ", 4],
["في أي سنة استولت بريطانيا على مصر؟", ["1882","1885","1900","1914"], 0, "تاريخ", 3],
["ما اسم الحركة التي قادها أحمد عرابي؟", ["الحركة العرابية","الثورة العرابية الثانية","حركة 1919","الثورة العربية"], 0, "تاريخ", 3],
["ما اسم أول رئيس وزراء لمصر بعد الاحتلال؟", ["نوبار باشا","سعد زغلول","مصطفى النحاس","فتحي باشا"], 0, "تاريخ", 4],
["من قائد ثورة 1919 في مصر؟", ["سعد زغلول","مصطفى كامل","محمد فريد","أحمد عرابي"], 0, "تاريخ", 2],
["من زعيم الحزب الوطني ومؤسس الجامعة المصرية القديمة؟", ["مصطفى كامل","سعد زغلول","محمد عبده","قاسم أمين"], 0, "تاريخ", 4],
["من بنى جامع الأزهر في القاهرة؟", ["جوهر الصقلي","صلاح الدين","الظاهر بيبرس","محمد علي"], 0, "تاريخ", 4],
["من باني القاهرة الفاطمية؟", ["جوهر الصقلي","صلاح الدين","عمرو بن العاص","محمد علي"], 0, "تاريخ", 4],
["من الذي أزال الدولة الفاطمية؟", ["صلاح الدين الأيوبي","نور الدين محمود","قطز","بيبرس"], 0, "تاريخ", 4],
["في أي سنة سيطر العثمانيون على مصر؟", ["1517","1453","1492","1600"], 0, "تاريخ", 4],
["من قائد المماليك في معركة مرج دابق؟", ["قنصوه الغوري","قطز","بيبرس","برقوق"], 0, "تاريخ", 4],
["في أي سنة وقعت معركة مرج دابق بين العثمانيين والمماليك؟", ["1516","1517","1520","1510"], 0, "تاريخ", 4],
["من السلطان العثماني الذي فتح مصر؟", ["سليم الأول","سليمان القانوني","محمد الفاتح","مراد الثاني"], 0, "تاريخ", 4],
["من السلطان العثماني الذي فتح القسطنطينية؟", ["محمد الفاتح","سليمان القانوني","سليم الأول","بايزيد"], 0, "تاريخ", 3],
["في أي سنة انتصر المسلمون في معركة الزلاقة؟", ["1086","1090","1100","1075"], 0, "تاريخ", 4],
["من قائد المرابطين في معركة الزلاقة؟", ["يوسف بن تاشفين","طارق بن زياد","صلاح الدين","عقبة بن نافع"], 0, "تاريخ", 4],
["من قائد فتح الأندلس؟", ["طارق بن زياد","عقبة بن نافع","موسى بن نصير","يوسف بن تاشفين"], 0, "تاريخ", 3],
["ما اسم الدولة التي ألغت الخلافة العثمانية؟", ["تركيا","مصر","العراق","سوريا"], 0, "تاريخ", 3],
["من مؤسس تركيا الحديثة؟", ["مصطفى كمال أتاتورك","عبد الحميد الثاني","محمد السادس","رضا شاه"], 0, "تاريخ", 3],
["في أي سنة أُلغيت الخلافة العثمانية؟", ["1924","1918","1930","1922"], 0, "تاريخ", 4],
["في أي سنة قُتلت ملكة فرنسا ماري أنطوانيت؟", ["1793","1789","1800","1785"], 0, "تاريخ", 4],
["من القائد القرطاجي الذي عبر جبال الألب؟", ["هانيبال","يوليوس قيصر","الإسكندر","نابليون"], 0, "تاريخ", 4],
["من القائد المقدوني الذي فتح فارس ومصر؟", ["الإسكندر الأكبر","يوليوس قيصر","نابليون","هانيبال"], 0, "تاريخ", 2],
["من أول إمبراطور روماني؟", ["أغسطس","يوليوس قيصر","نيرون","تراجان"], 0, "تاريخ", 4],
["في أي سنة سقطت الإمبراطورية الرومانية الغربية؟", ["476 م","1453 م","330 م","622 م"], 0, "تاريخ", 4],
["من آخر ملكة في مصر البطلمية؟", ["كليوباترا السابعة","نفرتيتي","حتشبسوت","أحمس"], 0, "تاريخ", 2],
["من فرعون مصر الذي خطّق معاهدة قادش؟", ["رمسيس الثاني","تحتمس الثالث","خوفو","أخناتون"], 0, "تاريخ", 4],
["من الملكة المصرية التي حكمت كرجل ومثلت بلحية؟", ["حتشبسوت","نفرتيتي","كليوباترا","نيتوكريس"], 0, "تاريخ", 3],
["من الملك الفرعوني الذي دعا للتوحيد ودعا لعبادة آتون؟", ["أخناتون","توت عنخ آمون","رمسيس","خوفو"], 0, "تاريخ", 4],
["من الفرعون الشهير الذي وُجد مقبرته كاملة عام 1922؟", ["توت عنخ آمون","خوفو","رمسيس","سيتي الأول"], 0, "تاريخ", 3],
["ما اسم الحجر الذي ساعد في فك رموز الهيروغليفية؟", ["حجر رشيد","حجر باليرمو","حجر المغرة","حجر الجرانيت"], 0, "تاريخ", 3],
["من العالم الفرنسي الذي فك رموز حجر رشيد؟", ["شامبليون","نابليون","ديليسبس","ماسبيرو"], 0, "تاريخ", 3],
["كم لاعبًا يبدأ به فريق كرة القدم في الشوط الأول؟", ["11","10","9","12"], 0, "رياضة", 1],
["كم عدد التبديلات المسموحة في مباراة رسمية حاليًا؟", ["5","3","6","4"], 0, "رياضة", 3],
["ما اسم اللاعب الذي يخدع الحكم بالسقوط؟", ["المتساقط","المدافع","الحارس","الجناح"], 0, "رياضة", 4],
["ما اسم البطاقة التي تطرد اللاعب؟", ["الحمراء","الصفراء","الزرقاء","الخضراء"], 0, "رياضة", 1],
["ما اسم البطاقة التي تُنذر اللاعب؟", ["الصفراء","الحمراء","الزرقاء","الخضراء"], 0, "رياضة", 1],
["ما اسم البطولة المحلية للدوري المصري لكرة القدم؟", ["الدوري المصري الممتاز","الدوري العربي","دوري أبطال أفريقيا","كأس الاتحاد"], 0, "رياضة", 2],
["كم مرة فاز الأهلي المصري بدوري أبطال إفريقيا (تقريبًا حتى 2024)؟", ["أكثر من 10 مرات","3 مرات","5 مرات","مرة واحدة"], 0, "رياضة", 3],
["من هو النادي المصري الملقب بـ«القلعة البيضاء»؟", ["الزمالك","الأهلي","الإسماعيلي","المصري"], 0, "رياضة", 2],
["من هو النادي المصري الملقب بـ«الدراويش»؟", ["الإسماعيلي","المصري","الزمالك","الاتحاد"], 0, "رياضة", 3],
["من النادي المصري الملقب بـ«النسور الخضر»؟", ["المصري البورسعيدي","الإسماعيلي","الاتحاد السكندري","سموحة"], 0, "رياضة", 4],
["ما اسم الملعب الذي يلعب فيه الأهلي والزمالك مبارياتهما الكبرى بالقاهرة؟", ["استاد القاهرة الدولي","ملعب السلام","ستاد برج العرب","ملعب الدفاع الجوي"], 0, "رياضة", 2],
["في أي مدينة يوجد ملعب برج العرب؟", ["الإسكندرية","القاهرة","بورسعيد","السويس"], 0, "رياضة", 3],
["من لاعبي مصر الملقب بـ«الجنرال»؟", ["حسام غالي","محمد صلاح","حسام حسن","أحمد حسن"], 0, "رياضة", 4],
["من الهداف التاريخي لمنتخب مصر؟", ["حسام حسن","محمد صلاح","أحمد حسن","حازم إمام"], 0, "رياضة", 3],
["من اللاعب المصري الذي فاز بالكرة الذهبية الأفريقية أكثر من مرة؟", ["محمد صلاح","حسام حسن","أحمد حسن","محمود تريزيجيه"], 0, "رياضة", 3],
["ما اسم النادي الإنجليزي الذي لعب له محمد صلاح؟", ["ليفربول","مانشستر يونايتد","تشيلسي","آرسنال"], 0, "رياضة", 1],
["ما اسم النادي الإسباني الذي لعب له محمد صلاح لفترة قصيرة؟", ["لا يوجد","ريال مدريد","برشلونة","إشبيلية"], 0, "رياضة", 4],
["كم مرة فاز المنتخب البرازيلي بكأس العالم؟", ["5","4","3","6"], 0, "رياضة", 2],
["كم مرة فاز المنتخب الألماني بكأس العالم؟", ["4","3","5","2"], 0, "رياضة", 3],
["كم مرة فاز المنتخب الإيطالي بكأس العالم؟", ["4","3","2","5"], 0, "رياضة", 3],
["كم مرة فاز المنتخب الأرجنتيني بكأس العالم؟", ["3","2","4","1"], 0, "رياضة", 3],
["كم مرة فازت فرنسا بكأس العالم؟", ["2","1","3","4"], 0, "رياضة", 3],
["من فاز بكأس العالم 2018؟", ["فرنسا","كرواتيا","ألمانيا","البرازيل"], 0, "رياضة", 2],
["من فاز بكأس العالم 2014؟", ["ألمانيا","الأرجنتين","البرازيل","هولندا"], 0, "رياضة", 3],
["من فاز بكأس العالم 2010؟", ["إسبانيا","هولندا","ألمانيا","إيطاليا"], 0, "رياضة", 3],
["من فاز بكأس العالم 2006؟", ["إيطاليا","فرنسا","ألمانيا","البرتغال"], 0, "رياضة", 3],
["من فاز بكأس العالم 2002؟", ["البرازيل","ألمانيا","إيطاليا","تركيا"], 0, "رياضة", 3],
["في أي دولة أقيمت كأس العالم 2010؟", ["جنوب أفريقيا","البرازيل","ألمانيا","روسيا"], 0, "رياضة", 2],
["في أي دولة أقيمت كأس العالم 2014؟", ["البرازيل","جنوب أفريقيا","روسيا","قطر"], 0, "رياضة", 2],
["في أي دولة أقيمت كأس العالم 2018؟", ["روسيا","قطر","البرازيل","فرنسا"], 0, "رياضة", 2],
["في أي دولة أقيمت كأس العالم 2022؟", ["قطر","روسيا","الإمارات","السعودية"], 0, "رياضة", 1],
["من هداف كأس العالم 2022؟", ["كيليان مبابي","ليونيل ميسي","جوليان ألفاريز","أوليفييه جيرو"], 0, "رياضة", 2],
["من أفضل لاعب في كأس العالم 2022؟", ["ليونيل ميسي","كيليان مبابي","لوكا مودريتش","نيمار"], 0, "رياضة", 2],
["ما اسم اللاعب البرتغالي صاحب أكثر أهداف دولية؟", ["كريستيانو رونالدو","يوسيبيو","لويس فيغو","ريفالدو"], 0, "رياضة", 3],
["ما اسم اللاعب الأرجنتيني الملقب بـ«البرغوث»؟", ["ليونيل ميسي","دييغو مارادونا","سيرجيو أغويرو","أنخل دي ماريا"], 0, "رياضة", 1],
["ما اسم اللاعب البرازيلي الملقب بـ«بيليه» الحقيقي؟", ["إدسون أرانتيس دو ناسيمنتو","رونالدو","روماريو","نيمار"], 0, "رياضة", 4],
["ما اسم اللاعب الأرجنتيني صاحب «هدف القرن» عام 1986؟", ["دييغو مارادونا","ليونيل ميسي","ماريو كيمبس","غابرييل باتيستوتا"], 0, "رياضة", 2],
["من هو حارس المرمى الملقب بـ«الأسطورة» في مصر؟", ["عصام الحضري","أحمد شوبير","نادر السيد","محمد الشناوي"], 0, "رياضة", 3],
["كم عدد لاعبي فريق كرة القدم الأمريكية داخل الملعب من كل فريق؟", ["11","12","10","9"], 0, "رياضة", 3],
["ما عدد نقاط الهدف في كرة السلة من خارج القوس؟", ["3","2","4","1"], 0, "رياضة", 2],
["ما عدد نقاط الرمية الحرة في كرة السلة؟", ["1","2","3","4"], 0, "رياضة", 2],
["كم مدة المباراة في كرة السلة NBA؟", ["48 دقيقة","40 دقيقة","60 دقيقة","36 دقيقة"], 0, "رياضة", 4],
["في أي دولة نشأت كرة السلة؟", ["الولايات المتحدة","إنجلترا","كندا","أستراليا"], 0, "رياضة", 3],
["من أشهر لاعب في تاريخ كرة السلة؟", ["مايكل جوردان","بيليه","محمد علي","فيدرر"], 0, "رياضة", 2],
["من أشهر لاعب تنس في التاريخ بعدد ألقاب جراند سلام (رجال)؟", ["نوفاك ديوكوفيتش","روجر فيدرر","رافائيل نادال","بيت سامبراس"], 0, "رياضة", 3],
["من اللاعبة التي فازت بأكبر عدد من ألقاب جراند سلام في التنس؟", ["مارجريت كورت","سيرينا ويليامز","شتيفي غراف","مارتينا نافراتيلوفا"], 0, "رياضة", 4],
["من أشهر ملاكم في التاريخ الملقب بـ«الأعظم»؟", ["محمد علي كلاي","مايك تايسون","جو فريزر","راكي مارسيانو"], 0, "رياضة", 2],
["كم عدد أشواط مباراة الملاكمة الاحترافية الشهيرة في الوزن الثقيل؟", ["12","10","15","9"], 0, "رياضة", 4],
["في أي رياضة يوجد «الكيمونو» و«الحزام»؟", ["الجودو","الكاراتيه","التايكوندو","الملاكمة"], 0, "رياضة", 3],
["في أي رياضة يوجد «الإنقاذ» و«الغطس» و«الفراشة»؟", ["السباحة","الغطس","الجمباز","التجديف"], 0, "رياضة", 2],
["كم عدد اللاعبين في فريق الرغبي؟", ["15","11","7","13"], 0, "رياضة", 4],
["في أي بلد نشأت كرة القدم الحديثة؟", ["إنجلترا","البرازيل","إيطاليا","الأرجنتين"], 0, "رياضة", 2],
["ما اسم الاتحاد الدولي لكرة القدم؟", ["فيفا","يويفا","اللجنة الأولمبية","كاف"], 0, "رياضة", 1],
["ما اسم الاتحاد الأفريقي لكرة القدم؟", ["كاف","فيفا","يويفا","أفكا"], 0, "رياضة", 3],
["ما اسم البطولة الأفريقية للمنتخبات؟", ["كأس الأمم الأفريقية","دوري أبطال أفريقيا","كأس الكونفدرالية","كأس السوبر"], 0, "رياضة", 1],
["كم مرة فازت مصر بكأس الأمم الأفريقية؟", ["7","5","3","4"], 0, "رياضة", 2],
["في أي سنة فازت مصر بكأس الأمم الأفريقية ثلاث مرات متتالية؟", ["2006 و2008 و2010","1998 و2000 و2002","2010 و2012 و2013","1986 و1988 و1990"], 0, "رياضة", 3],
["من مدرب مصر الذي فاز بثلاث نسخ متتالية من كأس الأمم؟", ["حسن شحاتة","محمود الجوهري","حسام البدري","كابتن رجب"], 0, "رياضة", 4],
["من حكم مباراة نهائي كأس العالم 2022؟", ["سيمون مارتشينياك","أنطوني تايلور","فيكتور كاساي","دانييل أورساتو"], 0, "رياضة", 4],
["ما اسم أول محرك بحث على الإنترنت؟", ["آركي","جوجل","ياهو","بينغ"], 0, "علوم", 4],
["من مؤسس شركة أبل؟", ["ستيف جوبز","بيل غيتس","مارك زوكربيرغ","إيلون ماسك"], 0, "علوم", 2],
["من مؤسس شركة مايكروسوفت؟", ["بيل غيتس","ستيف جوبز","جيف بيزوس","لاري بيج"], 0, "علوم", 2],
["من مؤسس شركة فيسبوك؟", ["مارك زوكربيرغ","جاك دورسي","إيلون ماسك","بيل غيتس"], 0, "علوم", 2],
["من مؤسس شركة أمازون؟", ["جيف بيزوس","إيلون ماسك","مارك زوكربيرغ","ستيف جوبز"], 0, "علوم", 3],
["من مؤسس شركة تسلا وسبيس إكس؟", ["إلون ماسك","جيف بيزوس","بيل غيتس","مارك زوكربيرغ"], 0, "علوم", 2],
["ما اسم أول هاتف ذكي أطلقته أبل؟", ["آيفون","آيباد","آيبود","ماك بوك"], 0, "علوم", 2],
["في أي سنة أُطلق أول آيفون؟", ["2007","2005","2010","2003"], 0, "علوم", 4],
["ما اختصار HTTP؟", ["بروتوكول نقل النص التشعبي","بروتوكول نقل الملفات","نظام تحديد المواقع","بروتوكول البريد"], 0, "علوم", 3],
["ما اسم لغة البرمجة التي تعتمد على المتصفح وتُنفَّذ داخل الصفحة؟", ["جافاسكريبت","بايثون","سي شارب","جافا"], 0, "علوم", 2],
["ما اسم الشركة المالكة ليوتيوب؟", ["جوجل","مايكروسوفت","ميتا","أمازون"], 0, "علوم", 2],
["ما اسم الشركة المالكة لإنستغرام وواتساب؟", ["ميتا","جوجل","أبل","أمازون"], 0, "علوم", 2],
["كم عدد البايتات في الكيلوبايت الواحد؟", ["1024","1000","512","2048"], 0, "علوم", 3],
["ما اسم وحدات قياس سرعة الإنترنت؟", ["بت في الثانية","هرتز","فولت","أمبير"], 0, "علوم", 3],
["ما اسم نظام تشغيل الهواتف من جوجل؟", ["أندرويد","آي أو إس","ويندوز","لينكس"], 0, "علوم", 1],
["ما اسم نظام تشغيل هواتف آيفون؟", ["آي أو إس","أندرويد","ويندوز","أوبونتو"], 0, "علوم", 2],
["ما اسم أول حاسوب شخصي شهير صنعته أبل؟", ["أبل 2","أبل 1","ماكنتوش","ليزا"], 0, "علوم", 4],
["ما اسم العالم الذي وضع أسس الحوسبة وخوارزميات الآلة؟", ["آلان تورينج","نيوتن","أينشتاين","بيل غيتس"], 0, "علوم", 3],
["ما اسم الاختبار الشهير لذكاء الآلة؟", ["اختبار تورينج","اختبار تلقائي","اختبار منطقي","اختبار الاستنتاج"], 0, "علوم", 4],
["ما اسم الذكاء الاصطناعي الذي فاز على كاسباروف في الشطرنج عام 1997؟", ["ديب بلو","ألفاغو","ألفازيرو","واطسون"], 0, "علوم", 4],
["ما اسم البرنامج الذي فاز على لي سي دول في لعبة غو؟", ["ألفاغو","ديب بلو","واطسون","آلفا زيرو"], 0, "علوم", 4],
["كم عدد المربعات في رقعة الشطرنج؟", ["64","49","81","100"], 0, "علوم", 1],
["كم عدد قطع الشطرنج لكل لاعب في البداية؟", ["16","15","18","20"], 0, "علوم", 2],
["ما اسم أقدم لعبة لوحية معروفة في مصر القديمة؟", ["سينيت","الشطرنج","الداما","الطاولة"], 0, "علوم", 4],
["كم عدد سور القرآن الكريم من الجزء الأول حتى الأخير في مصحف؟", ["114","110","120","112"], 0, "دين", 1],
["ما اسم أول آية نزلت من القرآن الكريم؟", ["اقرأ باسم ربك الذي خلق","الحمد لله","بسم الله","سبح اسم ربك"], 0, "دين", 2],
["في أي سورة أول آية نزلت؟", ["العلق","المدثر","الفاتحة","البقرة"], 0, "دين", 2],
["ما اسم السورة التي ذُكرت فيها أطول كلمة في القرآن؟", ["سورة الحجر","سورة البقرة","سورة النساء","سورة الأنعام"], 0, "دين", 4],
["ما اسم أول سورة في المصحف؟", ["الفاتحة","البقرة","العلق","الناس"], 0, "دين", 1],
["ما اسم آخر سورة في المصحف؟", ["الناس","الفلق","الإخلاص","النصر"], 0, "دين", 2],
["ما اسم سورة تُعرف بـ«المعوذتين»؟", ["الفلق والناس","الفاتحة والإخلاص","الكوثر والنصر","النور والفرقان"], 0, "دين", 3],
["كم عدد السور التي سميت بأسماء أنبياء؟", ["6","4","8","10"], 0, "دين", 4],
["ما اسم النبي الذي سُميت باسمه سورة وهي أطول سورة ذكرت قصة؟", ["يوسف","يونس","هود","نوح"], 0, "دين", 2],
["ما اسم السورة التي تبدأ بـ«سورة أنزلناها»؟", ["النور","البقرة","المائدة","الطلاق"], 0, "دين", 4],
["ما اسم أول سورة نزلت في المدينة (على قول الجمهور)؟", ["البقرة","الفاتحة","العلق","المدثر"], 0, "دين", 4],
["ما اسم السورة التي تُسمى بـ«الطلاق» والتي تبين أحكام الطلاق بشكل رئيسي؟", ["سورة الطلاق","سورة البقرة","سورة النساء","سورة المجادلة"], 0, "دين", 3],
["ما اسم السورة التي تحدثت عن الإيلاء والظهار؟", ["سورة المجادلة","سورة الطلاق","سورة النساء","النور"], 0, "دين", 4],
["كم عدد السور التي تبدأ بـ«الحمد لله»؟", ["5","3","7","2"], 0, "دين", 4],
["ما اسم السورة التي اشتملت على آية «اليوم أكملت لكم دينكم»؟", ["سورة المائدة","سورة البقرة","سورة النور","سورة الأحزاب"], 0, "دين", 4],
["أي غزوة ذُكر اسمها صريحًا في سورة آل عمران؟", ["غزوة بدر","غزوة أحد","غزوة الخندق","غزوة حنين"], 0, "دين", 4],
["ما اسم الشهر الذي وقعت فيه غزوة بدر؟", ["رمضان","شعبان","شوال","رجب"], 0, "دين", 3],
["من أول من جهر بالقرآن بمكة؟", ["عبد الله بن مسعود","أبو بكر","بلال","عمر"], 0, "دين", 4],
["من الصحابي الذي فدى النبي بنفسه في الهجرة ونام في فراشه؟", ["علي بن أبي طالب","أبو بكر","عمر","زيد بن حارثة"], 0, "دين", 3],
["من رافق النبي ﷺ في هجرة المدينة؟", ["أبو بكر الصديق","عمر","علي","عثمان"], 0, "دين", 1],
["ما اسم الغار الذي مكث فيه النبي ﷺ وأبو بكر ثلاث ليال في الهجرة؟", ["غار ثور","غار حراء","غار الكهف","غار بدر"], 0, "دين", 3],
["ما اسم الغار الذي نزل فيه أول الوحي؟", ["غار حراء","غار ثور","غار الكهف","غار جبل النور"], 0, "دين", 2],
["في أي شهر نزل أول الوحي؟", ["رمضان","شعبان","رجب","محرم"], 0, "دين", 3],
["كم كان عمر النبي ﷺ عند وفاته؟", ["63","60","65","70"], 0, "دين", 3],
["في أي سنة هجرية توفي النبي ﷺ؟", ["11","10","12","13"], 0, "دين", 3],
["ما اسم أول من جمع القرآن في مصحف مكتوب في عهد أبي بكر؟", ["زيد بن ثابت","عمر","عثمان","علي"], 0, "دين", 4],
["من الصحابي الملقب بـ«ترجمان القرآن»؟", ["عبد الله بن عباس","عبد الله بن عمر","ابن مسعود","أبو هريرة"], 0, "دين", 3],
["من فقهاء الصحابة الملقب بـ«حبر الأمة»؟", ["عبد الله بن عباس","أبو هريرة","زيد بن ثابت","معاذ بن جبل"], 0, "دين", 4],
["من الصحابي الملقب بـ«أمين الأمة»؟", ["أبو عبيدة بن الجراح","أبو بكر","عمر","علي"], 0, "دين", 3],
["من الصحابي الملقب بـ«حوارى رسول الله»؟", ["الزبير بن العوام","أبو بكر","عبد الرحمن بن عوف","طلحة"], 0, "دين", 4],
["من الصحابي الذي كان قاضيًا لأهل المدينة وأكثر الصحابة فتوى؟", ["زيد بن ثابت","عبد الله بن عباس","أبو هريرة","عائشة"], 0, "دين", 4],
["من رسم لوحة «فتاة بقرط اللؤلؤ»؟", ["يوهانس فيرمير","فان جوخ","رامبرانت","مونيه"], 0, "فنون", 4],
["من رسم لوحة «الجدار» أو «غرنيكا»؟", ["بابلو بيكاسو","سلفادور دالي","خوان ميرو","ماتيس"], 0, "فنون", 3],
["من رسم «حديقة المتعة الأرضية»؟", ["هيرونيموس بوش","فان جوخ","دافنشي","مايكل أنجلو"], 0, "فنون", 4],
["من رسم لوحة «ميلاد فينوس»؟", ["ساندرو بوتيتشيلي","ليوناردو دافنشي","مايكل أنجلو","رافائيل"], 0, "فنون", 4],
["من رسم لوحة «سانت جورج والتنين» أو «آدم وحواء» في كنيسة سيستين؟", ["مايكل أنجلو","رافائيل","تيتيان","بوتيتشيلي"], 0, "فنون", 4],
["من رسم «مدرسة أثينا»؟", ["رافائيل","مايكل أنجلو","دافنشي","تيتيان"], 0, "فنون", 4],
["من النحات صاحب تمثال «داوود» في فلورنسا؟", ["مايكل أنجلو","دوناتيلو","رودان","بيرنيني"], 0, "فنون", 3],
["من صاحب تمثال «المفكر»؟", ["أوغست رودان","مايكل أنجلو","بيرنيني","برانكوزي"], 0, "فنون", 3],
["من صاحب تمثال «أبو الهول»؟", ["المصريون القدماء","الإغريق","الرومان","الفرس"], 0, "فنون", 2],
["ما اسم أشهر تمثال ضخم في البرازيل؟", ["تمثال المسيح الفادي","تمثال الحرية","برج إيفل","الكولوسيوم"], 0, "فنون", 3],
["ما اسم المتحف الذي يحتوي «الموناليزا»؟", ["اللوفر","المتحف البريطاني","متحف أورسيه","متحف برلين"], 0, "فنون", 3],
["في أي مدينة يوجد متحف اللوفر؟", ["باريس","لندن","نيويورك","روما"], 0, "فنون", 1],
["في أي مدينة يوجد متحف «متحف الفن الحديث» موما؟", ["نيويورك","باريس","لندن","برلين"], 0, "فنون", 4],
["في أي مدينة يوجد «متحف البرغامون»؟", ["برلين","لندن","باريس","فيينا"], 0, "فنون", 4],
["في أي مدينة يقع المتحف المصري الكبير؟", ["الجيزة","القاهرة","الإسكندرية","الأقصر"], 0, "فنون", 2],
["في أي مدينة يوجد المتحف المصري القديم بالتحرير؟", ["القاهرة","الجيزة","أسوان","الأقصر"], 0, "فنون", 2],
["في أي مدينة يوجد متحف النوبة؟", ["أسوان","الأقصر","القاهرة","الجيزة"], 0, "فنون", 4],
["من مخرج سلسلة «حرب النجوم»؟", ["جورج لوكاس","ستيفن سبيلبرغ","مارتن سكورسيزي","كريستوفر نولان"], 0, "فنون", 3],
["من مخرج فيلم «تايتانيك»؟", ["جيمس كاميرون","ستيفن سبيلبرغ","كريستوفر نولان","ريدلي سكوت"], 0, "فنون", 2],
["من مخرج فيلم «إنسيبشن» و«إنترستيلار»؟", ["كريستوفر نولان","جيمس كاميرون","ريدلي سكوت","كوينتن تارانتينو"], 0, "فنون", 3],
["من مخرج فيلم «العراب»؟", ["فرانسيس فورد كوبولا","مارتن سكورسيزي","سبيلبرغ","ريدلي سكوت"], 0, "فنون", 4],
["من مخرج فيلم «الفك المفترس» و«إي تي»؟", ["ستيفن سبيلبرغ","كريستوفر نولان","جيمس كاميرون","تارانتينو"], 0, "فنون", 3],
["ما اسم أول فيلم رسوم متحركة طويل لديزني؟", ["سنو وايت والأقزام السبعة","سندريلا","بينوكيو","فانتازيا"], 0, "فنون", 4],
["ما اسم الشركة التي أنتجت «توي ستوري»؟", ["بيكسار","ديزني","دريم ووركس","إليومينيشن"], 0, "فنون", 3],
["من صنع شخصية «ميكي ماوس»؟", ["والت ديزني","تشاك جونز","ستان لي","جورج لوكاس"], 0, "فنون", 2],
["من مبتكر شخصيات «سبايدرمان» و«أيرون مان»؟", ["ستان لي","جاك كيربي","بوب كين","بيل فينجر"], 0, "فنون", 2],
["من مؤلف قصة «ألف ليلة وليلة» الأصلية؟", ["مجهول/تراث شعبي","الجاحظ","ابن المقفع","الحريري"], 0, "فنون", 3],
["ما اسم أول فيلم مصري ناطق؟", ["أولاد الذوات","ليلى","بابا عريس","عنتر ولبلب"], 0, "فنون", 4],
["من رائد المسرح المصري الحديث صاحب «أهل الكهف»؟", ["توفيق الحكيم","يعقوب صنوع","جورج أبيض","يوسف وهبي"], 0, "فنون", 3],
["من مؤسس المسرح المصري الحديث ورائد المسرح الغنائي؟", ["يعقوب صنوع","جورج أبيض","يوسف وهبي","توفيق الحكيم"], 0, "فنون", 4],
["من الملقب بـ«عميد المسرح العربي»؟", ["يوسف وهبي","جورج أبيض","توفيق الحكيم","نجيب الريحاني"], 0, "فنون", 3],
["من صاحب مسرحية «الدخول لسعادة» أو «الشخص»؟", ["نجيب الريحاني","يوسف وهبي","توفيق الحكيم","جورج أبيض"], 0, "فنون", 4],
["من أول من أدخل السينما لمصر؟", ["عزيز بندك","محمد كريم","توجو مزراحي","حسين فوزي"], 0, "فنون", 4],
["من مخرج أول فيلم مصري طويل «ليلى» عام 1927؟", ["وداد عرفي وستيفان روستي","عزيز بندك","محمد كريم","توجو مزراحي"], 0, "فنون", 4],
["من المطرب الملقب بـ«كروان الإذاعة»؟", ["محمد عبد المطلب","محمد فوزي","عبد الحليم حافظ","كارم محمود"], 0, "فنون", 4],
["من المطرب الملقب بـ«فنان الشعب»؟", ["سيد درويش","محمد عبد الوهاب","عبد الحليم","فريد الأطرش"], 0, "فنون", 3],
["من مجدد الموسيقى العربية وصاحب «الأطلال»؟", ["رياض السنباطي","بليغ حمدي","محمد عبد الوهاب","زكريا أحمد"], 0, "فنون", 3],
["من ملحن أغنية «ألف ليلة وليلة» لأم كلثوم؟", ["بليغ حمدي","رياض السنباطي","محمد عبد الوهاب","زكريا أحمد"], 0, "فنون", 3],
["من ملحن «الأطلال» لأم كلثوم؟", ["رياض السنباطي","بليغ حمدي","محمد عبد الوهاب","زكريا أحمد"], 0, "فنون", 4],
["من كاتب كلمات «الأطلال»؟", ["إبراهيم ناجي","أحمد رامي","بيرم التونسي","صلاح جاهين"], 0, "فنون", 4],
["من شاعر أغاني أم كلثوم الأشهر وصاحب «أنت عمري»؟", ["أحمد شفيق كامل","أحمد رامي","بيرم التونسي","صلاح جاهين"], 0, "فنون", 4],
["من ملحن «أنت عمري»؟", ["محمد عبد الوهاب","بليغ حمدي","رياض السنباطي","زكريا أحمد"], 0, "فنون", 3],
["من مؤلف أغنية «شمس» و«الصهبجية»؟", ["صلاح جاهين","بيرم التونسي","فؤاد حداد","أحمد فؤاد نجم"], 0, "فنون", 4],
["من شاعر العامية المصرية صاحب «على اسم مصر»؟", ["صلاح جاهين","فؤاد حداد","بيرم التونسي","أحمد فؤاد نجم"], 0, "فنون", 3],
["من الملحن المصري صاحب «تخاريف» و«ألف ليلة وليلة» الموسيقية؟", ["عمر خيرت","محمد عبد الوهاب","بليغ حمدي","هاني شنودة"], 0, "فنون", 3],
["ما اسم أول فيلم سعودي طويل عرض عالميًا؟", ["وجدة","بركة يقابل بركة","عاصفة الرمال","المرشحة"], 0, "فنون", 4],
["ما الفواكه الأكثر احتواءً على فيتامين C؟", ["الجوافة","التفاح","الموز","العنب"], 0, "حياة يومية", 3],
["ما المشروب الذي يصنع من أوراق الكاميليا؟", ["الشاي","القهوة","الكاكاو","المتة"], 0, "حياة يومية", 3],
["ما الشجرة التي تعطي حبوب القهوة؟", ["شجرة البن","شجرة الكاكاو","شجرة الشاي","شجرة الزيتون"], 0, "حياة يومية", 2],
["ما البلد الأكثر إنتاجًا للبن في العالم؟", ["البرازيل","كولومبيا","إثيوبيا","فيتنام"], 0, "حياة يومية", 3],
["ما البلد الذي نشأت فيه القهوة؟", ["إثيوبيا","البرازيل","اليمن","تركيا"], 0, "حياة يومية", 3],
["ما نوع الطعام الذي يُحفظ بالتبريد عند درجة حرارة أقل من 18-؟", ["اللحوم المجمدة","الأرز","الخبز","البسكويت"], 0, "حياة يومية", 3],
["ما المادة التي تُستخدم لرفع العجين (الخبز)؟", ["الخميرة","الملح","السكر","الزيت"], 0, "حياة يومية", 2],
["ما الغاز الذي ينتج عن تخمر العجين؟", ["ثاني أكسيد الكربون","الأكسجين","النيتروجين","الميثان"], 0, "حياة يومية", 4],
["ما المادة التي تعطي الطعم الحلو في الحلوى؟", ["السكر","الملح","الفانيليا","النشا"], 0, "حياة يومية", 1],
["ما اسم التوابل الأكثر غلاءً في العالم؟", ["الزعفران","الفلفل الأسود","القرفة","الكمون"], 0, "حياة يومية", 3],
["ما نوع الطعام المصري «الرنجة»؟", ["سمك مملح ومدخن","لحم مجفف","جبنة","خبز"], 0, "حياة يومية", 2],
["ما نوع السمك المستخدم في الفسيخ؟", ["البوري","البلطي","الدنيس","القرموط"], 0, "حياة يومية", 4],
["ما اسم الخبز المصري الرقيق الذي يُخبز في الفرن البلدي؟", ["العيش البلدي","العيش الفينو","التورتيلا","الباغيت"], 0, "حياة يومية", 2],
["ما المكون الرئيسي في الملوخية؟", ["أوراق الملوخية","السبانخ","البامية","الجرجير"], 0, "حياة يومية", 1],
["ما المكون الرئيسي في البامية؟", ["البامية الخضراء","الملوخية","السبانخ","الفاصوليا"], 0, "حياة يومية", 1],
["ما اسم الطبق المصري الشهير من الرقاق واللحم؟", ["الرقاق","الفتة","الممبار","الحواوشي"], 0, "حياة يومية", 3],
["ما اسم الطبق المصري الشهير من الأرز واللحم والصلصة؟", ["الفتة","الكشري","الرقاق","المحشي"], 0, "حياة يومية", 2],
["ما اسم الحلوى المصرية التي تُصنع من السمسم؟", ["الطحينة والحلاوة الطحينية","البسبوسة","الكحك","البقلاوة"], 0, "حياة يومية", 2],
["ما اسم حلوى رمضان المصرية الشهيرة؟", ["الكنافة والقطايف","البسبوسة","أم علي","الكحك"], 0, "حياة يومية", 2],
["ما اسم الحلوى المصرية التي تُصنع من الرقاق واللبن والمكسرات؟", ["أم علي","الكحك","البسبوسة","الكنافة"], 0, "حياة يومية", 2],
["ما المناسبة المصرية التي يُصنع فيها الكحك؟", ["عيد الفطر","عيد الأضحى","المولد النبوي","شم النسيم"], 0, "حياة يومية", 2],
["ما المناسبة المصرية التي تشتهر فيها «الفسيخ»؟", ["شم النسيم","عيد الفطر","عيد الأضحى","المولد"], 0, "حياة يومية", 2],
["في أي يوم من السنة يُحتفل بشم النسيم في مصر؟", ["الاثنين بعد عيد القيامة القبطي","1 مايو","21 مارس","10 أبريل"], 0, "حياة يومية", 4],
["ما اسم عيد المصريين الذي يحتفلون فيه بالخضرة والبيض الملوّن؟", ["شم النسيم","المولد","عيد الفطر","وقفة عرفات"], 0, "حياة يومية", 2],
["ما اسم المهرجان المصري الذي يُحتفل فيه بالمولد النبوي بالحلاوة؟", ["المولد النبوي","شم النسيم","عيد الفطر","عيد الميلاد"], 0, "حياة يومية", 2],
["ما اسم أشهر حلوى في المولد النبوي؟", ["عروسة المولد","الكحك","البسبوسة","القطايف"], 0, "حياة يومية", 2],
["كم مرة في السنة يُحتفل بعيد الفطر؟", ["مرة","مرتين","ثلاث مرات","أربع مرات"], 0, "حياة يومية", 1],
["كم يومًا عيد الفطر في مصر رسميًا؟", ["3 أيام","يوم واحد","5 أيام","7 أيام"], 0, "حياة يومية", 2],
["كم يومًا عيد الأضحى في مصر رسميًا؟", ["4 أيام","3 أيام","يومان","5 أيام"], 0, "حياة يومية", 3],
["ما اسم البنك المركزي في مصر؟", ["البنك المركزي المصري","البنك الأهلي","بنك مصر","بنك القاهرة"], 0, "حياة يومية", 3],
["ما اسم أكبر بنك حكومي في مصر؟", ["البنك الأهلي المصري","بنك مصر","بنك القاهرة","البنك التجاري"], 0, "حياة يومية", 3],
["ما اسم الجهة المسؤولة عن مياه الشرب في مصر؟", ["الشركة القابضة لمياه الشرب","وزارة الكهرباء","البريد المصري","شركة الغاز"], 0, "حياة يومية", 4],
["ما اسم الجهة التي تصدر الرقم القومي في مصر؟", ["مصلحة الأحوال المدنية","البريد","الشهر العقاري","المحكمة"], 0, "حياة يومية", 4],
["ما اسم الوثيقة التي تُستخرج عند الميلاد؟", ["شهادة الميلاد","بطاقة الرقم القومي","جواز السفر","الفيش"], 0, "حياة يومية", 1],
["ما اسم الوثيقة الرسمية للسفر خارج البلاد؟", ["جواز السفر","بطاقة الرقم القومي","رخصة القيادة","شهادة الميلاد"], 0, "حياة يومية", 1],
["كم سنة صلاحية جواز السفر المصري للبالغين؟", ["7 سنوات","5 سنوات","10 سنوات","3 سنوات"], 0, "حياة يومية", 3],
["ما اسم مصلحة الضرائب المصرية المسؤولة عن إقرار الدخل؟", ["مصلحة الضرائب المصرية","مصلحة الجمارك","الشهر العقاري","مصلحة الأحوال"], 0, "حياة يومية", 4],
["ما اسم الجهة المسؤولة عن جمع الجمارك في مصر؟", ["مصلحة الجمارك","مصلحة الضرائب","البنك المركزي","البريد"], 0, "حياة يومية", 3],
["ما اسم أول خط مترو أنفاق في مصر؟", ["الخط الأول","الخط الثاني","الخط الثالث","الخط الرابع"], 0, "حياة يومية", 4],
["في أي سنة افتُتح أول خط مترو في القاهرة؟", ["1987","1990","1995","2000"], 0, "حياة يومية", 4],
["ما اسم الشركة التي تدير مترو القاهرة؟", ["الشركة المصرية لإدارة وتشغيل المترو","هيئة النقل العام","الشركة الوطنية","هيئة السكة الحديد"], 0, "حياة يومية", 4],
["ما رقم المطافي في مصر؟", ["180","123","122","121"], 0, "حياة يومية", 2],
["ما رقم الخط الساخن لشكاوى الحكومة في مصر؟", ["16528","19468","16000","19999"], 0, "حياة يومية", 4],
["كم عدد أيام شهر رمضان في التقويم الهجري؟", ["29 أو 30","30 دائمًا","28","31"], 0, "دين", 2],
["كم عدد أيام السنة الهجرية تقريبًا؟", ["354","365","360","380"], 0, "عام", 3],
["كم عدد أشهر السنة الهجرية؟", ["12","10","11","13"], 0, "عام", 1],
["ما اسم الشهر الأول في السنة الميلادية؟", ["يناير","فبراير","مارس","ديسمبر"], 0, "عام", 1],
["ما اسم أطول شهر في عدد الأيام؟", ["لا يوجد شهر أطول من 31","فبراير","يناير","أغسطس"], 0, "عام", 2],
["كم عدد أسابيع السنة تقريبًا؟", ["52","48","50","56"], 0, "عام", 2],
["كم عدد أيام شهر فبراير في السنة الكبيسة؟", ["29","28","30","31"], 0, "عام", 1],
["كم عدد الأيام في الربع الأول من السنة (يناير وفبراير ومارس)؟", ["90 أو 91","89","88","92"], 0, "عام", 3],
["ما اسم الليلة التي تسبق أول أيام السنة الميلادية؟", ["ليلة رأس السنة","ليلة النصف","ليلة القدر","ليلة الشتاء"], 0, "عام", 1],
["ما اسم أكبر عدد من الخانات في لعبة اللوتو المصرية؟", ["90","75","80","100"], 0, "عام", 4],
["كم عدد الحروف في كلمة «مليون» بالإنجليزية؟", ["7","6","8","5"], 0, "عام", 3],
["كم عدد الأصفار في المليار؟", ["9","6","12","8"], 0, "عام", 2],
["كم عدد الأصفار في الترليون؟", ["12","9","15","10"], 0, "عام", 4],
["كم يساوي الروماني X؟", ["10","5","50","1"], 0, "عام", 2],
["ما الرقم الروماني الذي يمثل 50؟", ["L","V","X","C"], 0, "عام", 3],
["ما الرقم الروماني الذي يمثل 100؟", ["C","L","D","M"], 0, "عام", 3],
["ما الرقم الروماني الذي يمثل 1000؟", ["M","C","D","L"], 0, "عام", 3],
["كم ضلعًا في المضلع الخماسي؟", ["5","4","6","8"], 0, "عام", 1],
["كم قطرًا في المربع؟", ["2","1","4","3"], 0, "عام", 3],
["كم وجهًا في مكعب؟", ["6","4","8","12"], 0, "عام", 1],
["كم حرفًا في كلمة «Egypt»؟", ["5","4","6","7"], 0, "عام", 2],
["كم دولة تقع في قارة أوروبا تقريبًا؟", ["44","60","30","20"], 0, "حول العالم", 4],
["كم عدد الدول الأعضاء في الأمم المتحدة؟", ["193","180","200","150"], 0, "حول العالم", 4],
["في أي مدينة يوجد مقر الأمم المتحدة الرئيسي؟", ["نيويورك","جنيف","باريس","فيينا"], 0, "حول العالم", 3],
["في أي مدينة يوجد مقر منظمة الصحة العالمية؟", ["جنيف","نيويورك","باريس","روما"], 0, "حول العالم", 4],
["في أي مدينة يوجد مقر اليونسكو؟", ["باريس","جنيف","نيويورك","روما"], 0, "حول العالم", 4],
["في أي مدينة يوجد مقر الاتحاد الأفريقي؟", ["أديس أبابا","القاهرة","نيروبي","جوهانسبرغ"], 0, "حول العالم", 3],
["في أي مدينة يوجد مقر جامعة الدول العربية؟", ["القاهرة","تونس","عمّان","الرياض"], 0, "حول العالم", 2],
["ما اسم اليوم العالمي للأمم المتحدة؟", ["24 أكتوبر","1 يناير","8 مارس","10 ديسمبر"], 0, "حول العالم", 4],
["ما اسم أجمل جائزة دولية للسلام؟", ["نوبل للسلام","أوسكار","بوكر","نوبل للأدب"], 0, "حول العالم", 2],
["في أي بلد تُمنح جائزة نوبل؟", ["النرويج (السلام) والسويد","الدنمارك","سويسرا","فنلندا"], 0, "حول العالم", 4],
["ما اسم البلد الذي تُقام فيه جوائز الأوسكار؟", ["الولايات المتحدة","بريطانيا","فرنسا","كندا"], 0, "حول العالم", 1],
["في أي مدينة تُقام جوائز الأوسكار؟", ["لوس أنجلوس","نيويورك","شيكاغو","لاس فيغاس"], 0, "حول العالم", 3],
["ما اسم أطول سور في العالم؟", ["سور الصين العظيم","سور هادريان","سور برلين","سور أنطونين"], 0, "حول العالم", 2],
["في أي دولة يوجد «تاج محل»؟", ["الهند","باكستان","إيران","تركيا"], 0, "حول العالم", 3],
["في أي دولة يوجد «برج بيزا المائل»؟", ["إيطاليا","اليونان","إسبانيا","فرنسا"], 0, "حول العالم", 2],
["في أي دولة يوجد «برج إيفل»؟", ["فرنسا","إيطاليا","بلجيكا","سويسرا"], 0, "حول العالم", 1],
["في أي دولة يوجد «الكولوسيوم»؟", ["إيطاليا","اليونان","تركيا","إسبانيا"], 0, "حول العالم", 2],
["في أي دولة يوجد «ستونهنج»؟", ["بريطانيا","أيرلندا","فرنسا","الدنمارك"], 0, "حول العالم", 4],
["في أي دولة يوجد «ماتشو بيتشو»؟", ["بيرو","المكسيك","البرازيل","تشيلي"], 0, "حول العالم", 3],
["في أي دولة توجد «أهرامات تشيتشن إيتزا»؟", ["المكسيك","بيرو","غواتيمالا","هندوراس"], 0, "حول العالم", 4],
["في أي دولة يوجد «معبد البارثينون»؟", ["اليونان","إيطاليا","تركيا","مصر"], 0, "حول العالم", 3],
["في أي دولة يوجد «تمثال رودس» قديمًا؟", ["اليونان","تركيا","إيطاليا","قبرص"], 0, "حول العالم", 4],
["في أي بلد توجد «قلعة نويشفانشتاين»؟", ["ألمانيا","النمسا","سويسرا","التشيك"], 0, "حول العالم", 4],
["في أي بلد توجد «بحيرة كومو»؟", ["إيطاليا","سويسرا","النمسا","فرنسا"], 0, "حول العالم", 4],
["في أي بلد توجد «مدينة البندقية»؟", ["إيطاليا","كرواتيا","اليونان","مالطا"], 0, "حول العالم", 2],
["ما اسم أكبر برج في العالم حاليًا؟", ["برج خليفة","برج شنغهاي","برج مكة","برج تايبيه"], 0, "حول العالم", 2],
["في أي مدينة يوجد برج خليفة؟", ["دبي","أبو ظبي","الدوحة","الرياض"], 0, "حول العالم", 1],
["في أي مدينة يوجد «برج المملكة»؟", ["الرياض","جدة","دبي","الكويت"], 0, "حول العالم", 3],
["في أي مدينة يوجد «أبراج الكويت»؟", ["الكويت","المنامة","الدوحة","مسقط"], 0, "حول العالم", 2],
["في أي مدينة يوجد «المسجد النبوي»؟", ["المدينة المنورة","مكة","الرياض","الطائف"], 0, "حول العالم", 1],
["في أي مدينة يوجد «المسجد الحرام»؟", ["مكة المكرمة","المدينة","القدس","الطائف"], 0, "حول العالم", 1],
["في أي مدينة يوجد «جامع الأزهر»؟", ["القاهرة","الإسكندرية","دمشق","بغداد"], 0, "حول العالم", 2],
["في أي مدينة يوجد «جامع قرطبة»؟", ["قرطبة","غرناطة","إشبيلية","طليطلة"], 0, "حول العالم", 4],
["في أي مدينة يوجد «قصر الحمراء»؟", ["غرناطة","قرطبة","إشبيلية","مدريد"], 0, "حول العالم", 3],
["في أي مدينة يوجد «تاج محل»؟", ["أغرا","دلهي","مومباي","جايبور"], 0, "حول العالم", 4],
["في أي مدينة يوجد «دار أوبرا سيدني»؟", ["سيدني","ملبورن","كانبيرا","بيرث"], 0, "حول العالم", 2],
["في أي مدينة يوجد «تمثال الحرية»؟", ["نيويورك","واشنطن","بوسطن","شيكاغو"], 0, "حول العالم", 1],
["في أي مدينة يوجد «البنتاغون»؟", ["واشنطن","نيويورك","لوس أنجلوس","هيوستن"], 0, "حول العالم", 3],
["في أي مدينة يوجد «البيت الأبيض»؟", ["واشنطن","نيويورك","فيلادلفيا","شيكاغو"], 0, "حول العالم", 2],
["في أي مدينة يوجد «قصر باكنغهام»؟", ["لندن","باريس","برلين","روما"], 0, "حول العالم", 2],
["في أي مدينة يوجد «برج لندن»؟", ["لندن","أدنبرة","دبلن","كارديف"], 0, "حول العالم", 2],
["في أي مدينة يوجد «الكولوسيوم»؟", ["روما","أثينا","ميلانو","نابولي"], 0, "حول العالم", 1],
["في أي مدينة يوجد «برج بيزا»؟", ["بيزا","روما","فلورنسا","البندقية"], 0, "حول العالم", 2],
["في أي مدينة يوجد «تمثال المسيح الفادي»؟", ["ريو دي جانيرو","ساو باولو","بوينس آيرس","ليما"], 0, "حول العالم", 3],
["في أي مدينة يوجد «قناة بنما»؟", ["بنما","كولومبيا","كوستاريكا","نيكاراغوا"], 0, "حول العالم", 3],
["في أي بلد توجد «بطرسبرغ» بشوارعها المائية؟", ["روسيا","أوكرانيا","بولندا","ليتوانيا"], 0, "حول العالم", 3],
["ما اسم أطول شريان مائي صنعه الإنسان؟", ["قناة السويس","قناة بنما","قناة كيل","قناة كورنث"], 0, "حول العالم", 4],
["أي قارة لا يوجد بها سكان أصليون دائمون؟", ["أنتاركتيكا","أستراليا","أمريكا الجنوبية","إفريقيا"], 0, "حول العالم", 3],
["ما اسم أكبر قارة في عدد السكان؟", ["آسيا","إفريقيا","أوروبا","أمريكا الشمالية"], 0, "حول العالم", 2],
["ما اسم أكثر قارة في عدد الدول؟", ["إفريقيا","آسيا","أوروبا","أمريكا الجنوبية"], 0, "حول العالم", 3],
["ما اسم أطول حدود برية في العالم بين دولتين؟", ["بين كندا وأمريكا","بين روسيا والصين","بين الهند والصين","بين مصر وليبيا"], 0, "حول العالم", 4],
["ما اسم أصغر قارة من حيث عدد السكان؟", ["أنتاركتيكا","أستراليا","أوروبا","أمريكا الجنوبية"], 0, "حول العالم", 3],
["ما اسم أكبر جزيرة في البحر الأحمر؟", ["جزر فرسان","سقطرى","جوبال","الزبرجد"], 0, "حول العالم", 4],
["ما اسم الدولة التي تمتلك أكبر عدد من الجزر؟", ["السويد","إندونيسيا","الفلبين","فنلندا"], 0, "حول العالم", 4],
["ما اسم أعلى درجة على مقياس موهس للصلابة؟", ["الألماس","الكوارتز","الحديد","الجرانيت"], 0, "علوم", 4],
["ما اسم أطول عظمة في الجسم؟", ["عظمة الفخذ","عظمة الساق","عظمة العضد","الترقوة"], 0, "علوم", 3],
["ما اسم العظمة التي تحمي المخ؟", ["الجمجمة","الفقرة","القص","الترقوة"], 0, "علوم", 1],
["كم عدد فقرات العمود الفقري عند الإنسان البالغ؟", ["33","30","24","40"], 0, "علوم", 4],
["ما اسم أصغر عظمة في جسم الإنسان؟", ["الركاب","الفخذ","الترقوة","أصابع اليد"], 0, "علوم", 4],
["ما اسم السائل الذي يحمي المخ والحبل الشوكي؟", ["السائل النخاعي","الدم","البلازما","الليمف"], 0, "علوم", 4],
["ما اسم الجهاز الذي يضخ الدم من القلب إلى الجسم؟", ["الشرايين","الأوردة","الشعيرات","اللمف"], 0, "علوم", 3],
["ما اسم الشعيرات التي تنقل الدم من القلب للرئتين؟", ["الشريان الرئوي","الوريد الرئوي","الشريان الأورطي","الوريد الأجوف"], 0, "علوم", 4],
["ما عدد حجرات القلب؟", ["4","2","3","5"], 0, "علوم", 2],
["ما اسم الخلايا التي تنقل الأكسجين في الدم؟", ["كريات الدم الحمراء","كريات الدم البيضاء","الصفائح","البلازما"], 0, "علوم", 3],
["ما اسم الخلايا المسؤولة عن المناعة؟", ["كريات الدم البيضاء","كريات الدم الحمراء","الصفائح","البلازما"], 0, "علوم", 3],
["ما اسم الفصيلة التي تُعدّ «المعطي العام» في نقل الدم؟", ["O سالب","AB موجب","A موجب","B سالب"], 0, "علوم", 4],
["ما اسم الفصيلة التي تُعدّ «المستقبل العام» في نقل الدم؟", ["AB موجب","O سالب","A","B"], 0, "علوم", 4],
["ما الأنسولين وما وظيفته؟", ["هرمون ينظم السكر في الدم","إنزيم يهضم الدهون","فيتامين","معدن"], 0, "علوم", 3],
["ما الغدة التي تتحكم في النمو وهرمون النمو؟", ["الغدة النخامية","الدرقية","الكظرية","البنكرياس"], 0, "علوم", 4],
["ما الغدة التي تفرز هرموني الأدرينالين؟", ["الكظرية","النخامية","الدرقية","التيموس"], 0, "علوم", 4],
["ما اسم الغدة التي تنظم الأيض؟", ["الدرقية","النخامية","الكظرية","البنكرياس"], 0, "علوم", 4],
["ما العنصر الذي يعانون نقصه عند مرض الغدة الدرقية (تضخم الغدة)؟", ["اليود","الحديد","الكالسيوم","الزنك"], 0, "علوم", 4],
["ما المرض الذي ينتج عن نقص الحديد؟", ["الأنيميا","السكري","الكساح","الإسقربوط"], 0, "علوم", 3],
["ما المرض الذي ينتج عن نقص فيتامين د؟", ["الكساح","الأنيميا","الإسقربوط","العشى الليلي"], 0, "علوم", 3],
["ما اسم أهم مصدر لفيتامين د؟", ["الشمس","الليمون","اللحم","الخبز"], 0, "علوم", 2],
["ما اسم غاز الضحك؟", ["أكسيد النيتروز","الأكسجين","النيتروجين","الهيليوم"], 0, "علوم", 4],
["ما اسم الغاز المستخدم في البالونات التي تطير؟", ["الهيليوم","الأكسجين","النيتروجين","الهيدروجين"], 0, "علوم", 3],
["ما اسم العنصر ذي الرمز Au؟", ["الذهب","الفضة","الألومنيوم","النحاس"], 0, "علوم", 3],
["ما اسم العنصر ذي الرمز Ag؟", ["الفضة","الذهب","الرصاص","القصدير"], 0, "علوم", 3],
["ما اسم العنصر ذي الرمز O؟", ["الأكسجين","الذهب","الحديد","النيتروجين"], 0, "علوم", 2],
["ما اسم العنصر ذي الرمز Na؟", ["الصوديوم","النيتروجين","النيكل","النيون"], 0, "علوم", 3],
["ما اسم العنصر ذي الرمز K؟", ["البوتاسيوم","الكالسيوم","الكبريت","الكريبتون"], 0, "علوم", 4],
["ما اسم العنصر ذي الرمز C؟", ["الكربون","الكالسيوم","الكلور","النحاس"], 0, "علوم", 3],
["ما اسم العنصر ذي الرمز H؟", ["الهيدروجين","الهيليوم","الهافنيوم","الحديد"], 0, "علوم", 2],
["ما أثقل عنصر طبيعي معروف على الأرض؟", ["اليورانيوم","الرصاص","الذهب","البلاتين"], 0, "علوم", 4],
["ما اسم أشهر معدن سام استخدم قديمًا في مواسير المياه؟", ["الرصاص","الحديد","النحاس","الزنك"], 0, "علوم", 4],
["ما اسم أشهر سبيكة من النحاس والزنك؟", ["النحاس الأصفر (الصفر)","البرونز","الفولاذ","الفضة الإسترلينية"], 0, "علوم", 4],
["ما اسم أشهر سبيكة من النحاس والقصدير؟", ["البرونز","الصفر","الفولاذ","الحديد المطاوع"], 0, "علوم", 4],
["ما نسبة الأكسجين في الهواء تقريبًا؟", ["21%","50%","78%","10%"], 0, "علوم", 3],
["ما نسبة النيتروجين في الهواء تقريبًا؟", ["78%","21%","50%","10%"], 0, "علوم", 3],
["ما الغاز الذي يستخدم في إطفاء الحرائق؟", ["ثاني أكسيد الكربون","الأكسجين","الهيدروجين","الميثان"], 0, "علوم", 3],
["ما الغاز الذي يستخدم في الطبخ في المنازل؟", ["البروبان/البوتان","الأكسجين","النيتروجين","ثاني أكسيد الكربون"], 0, "علوم", 2],
["ما اسم العملية التي تتحول فيها المادة الصلبة مباشرة للغاز؟", ["التسامي","التبخر","الانصهار","التكاثف"], 0, "علوم", 4],
["ما اسم التغير الحاصل في المادة عند تسخينها من الحالة الصلبة للسائلة؟", ["الانصهار","التجمد","التبخر","التكاثف"], 0, "علوم", 2],
["ما نقطة تجمد الماء في المقياس السيلزيوس؟", ["0","32","100","-1"], 0, "علوم", 2],
["ما نقطة غليان الماء في المقياس السيلزيوس؟", ["100","0","212","50"], 0, "علوم", 2],
["ما وحدة قياس الكتلة في النظام الدولي؟", ["الكيلوجرام","المتر","الثانية","اللتر"], 0, "علوم", 3],
["ما وحدة قياس الطول في النظام الدولي؟", ["المتر","الكيلو","الجرام","اللتر"], 0, "علوم", 1],
["كم سنتيمترًا في المتر؟", ["100","10","1000","50"], 0, "علوم", 1],
["كم مترًا في الكيلومتر؟", ["1000","100","10","10000"], 0, "علوم", 2],
["كم جرامًا في الكيلوجرام؟", ["1000","100","10","500"], 0, "علوم", 1],
["كم مليلتر في اللتر؟", ["1000","100","10","500"], 0, "علوم", 2],
["في أي سنة انضمت مصر لمنظمة التجارة العالمية؟", ["1995","1990","2000","1998"], 0, "حول العالم", 4],
["في أي سنة تأسست منظمة الأمم المتحدة؟", ["1945","1919","1950","1939"], 0, "حول العالم", 4],
["في أي سنة تأسست جامعة الدول العربية؟", ["1945","1948","1950","1936"], 0, "حول العالم", 4],
["كم عدد أعضاء مجلس الأمن الدائمين؟", ["5","10","15","3"], 0, "حول العالم", 3],
["ما اسم الدول الخمس دائمة العضوية في مجلس الأمن؟", ["أمريكا وروسيا والصين وبريطانيا وفرنسا","أمريكا وروسيا والصين وألمانيا واليابان","أمريكا وروسيا والهند وفرنسا وبريطانيا","أمريكا والصين وألمانيا واليابان والبرازيل"], 0, "حول العالم", 4],
["كم عدد أعضاء مجلس الأمن الكلي؟", ["15","10","20","5"], 0, "حول العالم", 4],
["ما اسم المنظمة الدولية التي تُعنى بالصحة؟", ["منظمة الصحة العالمية","اليونيسيف","اليونسكو","الفاو"], 0, "حول العالم", 2],
["ما اسم المنظمة الدولية التي تُعنى بالطفولة؟", ["اليونيسيف","اليونسكو","الصحة العالمية","الفاو"], 0, "حول العالم", 3],
["ما اسم المنظمة الدولية التي تُعنى بالتعليم والثقافة؟", ["اليونسكو","اليونيسيف","الفاو","الصحة العالمية"], 0, "حول العالم", 3],
["ما اختصار منظمة الفاو التابعة للأمم المتحدة؟", ["منظمة الأغذية والزراعة","منظمة العمل","منظمة الصحة","منظمة الثقافة"], 0, "حول العالم", 4],
["ما اسم أقدم جامعة في العالم ما زالت تعمل؟", ["القرويين","الأزهر","أكسفورد","بولونيا"], 0, "تاريخ", 4],
["في أي مدينة توجد جامعة القرويين؟", ["فاس","مراكش","القاهرة","قرطبة"], 0, "تاريخ", 4],
["في أي سنة تأسست جامعة القاهرة (الجامعة المصرية)؟", ["1908","1925","1882","1952"], 0, "تاريخ", 4],
["ما اسم أول جامعة أُنشئت في مصر الحديثة؟", ["الجامعة المصرية (القاهرة)","الأزهر","عين شمس","الإسكندرية"], 0, "تاريخ", 4],
["في أي سنة تأسست جامعة الدول العربية في القاهرة؟", ["1945","1948","1950","1942"], 0, "تاريخ", 4],
["ما اسم أول مجمع للغة العربية في العصر الحديث؟", ["مجمع اللغة العربية بالقاهرة","مجمع دمشق","مجمع بغداد","مجمع عمّان"], 0, "تاريخ", 4],
["في أي سنة أُنشئ مجمع اللغة العربية بالقاهرة؟", ["1932","1900","1950","1920"], 0, "تاريخ", 4]
  ];

  /* ==========================================================
     10.5) من سيربح المليون — المحرك
     ========================================================== */

  /* سلّم الجوائز: 40 مستوى → مليون جنيه */
  const MZ_LADDER = [100, 200, 300, 500, 1000, 2000, 3000, 5000, 8000, 12000,
    20000, 30000, 40000, 50000, 75000, 100000, 125000, 150000, 175000, 200000,
    250000, 300000, 350000, 400000, 450000, 500000, 550000, 600000, 650000, 700000,
    750000, 800000, 850000, 880000, 910000, 940000, 960000, 980000, 990000, 1000000];
  const MZ_TOTAL = MZ_LADDER.length;          /* 40 */
  const MZ_SAFE = [5, 15, 25, 35];            /* مستويات شبكة الأمان */
  const MZ_KEYS = ['أ', 'ب', 'ج', 'د'];

  const MZ_CATS = { 'عام': '#7b5cff', 'جغرافيا': '#22d3ee', 'تاريخ': '#ffb03a', 'أدب': '#ff8fab', 'دين': '#2ec4b6', 'علوم': '#a3e635', 'رياضة': '#ff5c7a', 'فنون': '#c084fc', 'عالم': '#4cc9f0', 'يومي': '#f59e0b', 'حياة يومية': '#f59e0b', 'حول العالم': '#4cc9f0' };

  /* أيقونات خاصة بالمليون */
  Object.assign(PATHS, {
    fifty: '<circle cx="12" cy="12" r="8.4"/><path d="M12 3.6a8.4 8.4 0 0 1 0 16.8z" fill="currentColor" stroke="none"/>',
    crowd: '<circle cx="12" cy="7.4" r="2.6"/><circle cx="5.4" cy="9.4" r="2"/><circle cx="18.6" cy="9.4" r="2"/><path d="M7.6 19.4c0-2.7 2-4.4 4.4-4.4s4.4 1.7 4.4 4.4"/><path d="M2.4 17.6c.1-2.1 1.3-3.4 3-3.6M21.6 17.6c-.1-2.1-1.3-3.4-3-3.6"/>',
    swap: '<path d="M4.6 8.6h12.2l-2.6-2.6"/><path d="M19.4 15.4H7.2l2.6 2.6"/>',
    money: '<rect x="2.8" y="6.4" width="18.4" height="11.2" rx="2.4"/><circle cx="12" cy="12" r="2.8"/><path d="M6.4 9.2v5.6M17.6 9.2v5.6"/>',
    idcard: '<rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.6"/><circle cx="8.6" cy="11" r="2"/><path d="M5 16.2c.4-1.6 1.8-2.4 3.6-2.4s3.2.8 3.6 2.4"/><path d="M15.4 10h3.6M15.4 13.4h3.6"/>',
    ticket: '<path d="M3.4 8.2a2 2 0 0 1 2-2h13.2a2 2 0 0 1 2 2v1.4a2.4 2.4 0 0 0 0 4.8v1.4a2 2 0 0 1-2 2H5.4a2 2 0 0 1-2-2v-1.4a2.4 2.4 0 0 0 0-4.8z"/><path d="M12 8.6v6.8"/>',
    crown: '<path d="M3.6 17.6h16.8l1.2-9.2-4.6 3.2L12 5.2 6.6 11.6 2 8.4z"/><path d="M3.6 20.4h16.8"/>',
    send: '<path d="M20.8 3.6 3.4 10.4l6.6 2.8 2.8 6.6z"/><path d="M10 13.2 20.8 3.6"/>',
    facebook: '<path d="M14.4 8.4h2.8V5.2h-2.8c-2.3 0-4 1.7-4 4v2H8v3.2h2.4v6.4h3.2v-6.4h2.6l.6-3.2h-3.2V9.6c0-.7.4-1.2 1.2-1.2z"/>',
    chat: '<path d="M20.4 12.2c0 3.8-3.8 6.8-8.4 6.8-1 0-2-.14-2.9-.4L4 20.6l1.3-3.6c-1.2-1.2-1.9-2.9-1.9-4.8 0-3.8 3.8-6.8 8.6-6.8s8.4 3 8.4 6.8z"/>',
    mail: '<rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2.6"/><path d="M3.6 7 12 13.4 20.4 7"/>',
    lock: '<rect x="4.6" y="10.4" width="14.8" height="9.6" rx="2.6"/><path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/><circle cx="12" cy="15.2" r="1.3" fill="currentColor" stroke="none"/>',
    eye: '<path d="M2.6 12S6 6.6 12 6.6 21.4 12 21.4 12 18 17.4 12 17.4 2.6 12 2.6 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M4 4l16 16"/><path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6 0 9.4 7 9.4 7a17 17 0 0 1-3 3.8"/><path d="M6.3 7.4A16.7 16.7 0 0 0 2.6 12S6 19 12 19a9.6 9.6 0 0 0 3.2-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    login: '<path d="M14.4 4.6H6.4a2 2 0 0 0-2 2v10.8a2 2 0 0 0 2 2h8"/><path d="M16.4 8.6 20.4 12l-4 3.4"/><path d="M20 12H9.4"/>',
    logout: '<path d="M9.6 4.6H5.4a2 2 0 0 0-2 2v10.8a2 2 0 0 0 2 2h4.2"/><path d="M15.4 8.6 19.4 12l-4 3.4"/><path d="M19 12H8.6"/>',
    chevron: '<path d="M6.6 9.4 12 14.6l5.4-5.2"/>',
    link: '<path d="M9.6 14.4 14.4 9.6"/><path d="M12.8 6.4l1.2-1.2a4 4 0 0 1 5.6 5.6l-1.2 1.2"/><path d="M11.2 17.6l-1.2 1.2a4 4 0 0 1-5.6-5.6l1.2-1.2"/>'
  });

  /* ---------- البنك ---------- */
  const MBANK = MSTARS.map((r, i) => ({ id: i, t: r[0], o: r[1], a: r[2], c: r[3], l: r[4] }));
  const MZ_BY_ID = {};
  MBANK.forEach((q) => { MZ_BY_ID[q.id] = q; });

  /* ---------- الحالة ---------- */
  const MZ = {
    name: (typeof AUTH !== 'undefined' && AUTH.user && AUTH.user.name) || LS.get('mz_name', ''),
    g: LS.get('mz_game', null),
    pending: false
  };
  const mzSaveGame = () => LS.set('mz_game', MZ.g);
  const mzSafe = (n) => { let v = 0; MZ_SAFE.forEach((l) => { if (n >= l) v = MZ_LADDER[l - 1]; }); return v; };
  const mzMoney = (v) => num(v) + ' جنيه';

  /* سحب 40 سؤال: 10 من كل مستوى صعوبة، بترتيب من السهل للصعب */
  function mzDraw() {
    const bands = [1, 2, 3, 4];
    const deck = [];
    bands.forEach((lv) => {
      const pool = shuffle(MBANK.filter((q) => q.l === lv));
      pool.slice(0, 10).forEach((q) => deck.push(q.id));
    });
    /* لو مستوى ناقص، نكمّل من الأقرب */
    if (deck.length < MZ_TOTAL) {
      const rest = shuffle(MBANK.filter((q) => deck.indexOf(q.id) === -1));
      while (deck.length < MZ_TOTAL && rest.length) deck.push(rest.pop().id);
    }
    return deck.slice(0, MZ_TOTAL);
  }

  /* تجهيز سؤال: خلط الاختيارات + تحديد الصح */
  function mzPrep(id) {
    const q = MZ_BY_ID[id];
    if (!q) return null;
    const opts = shuffle(q.o.map((v, i) => ({ v: v, i: i })));
    return { id: id, t: q.t, c: q.c, l: q.l, opts: opts, ai: opts.findIndex((x) => x.i === q.a), hide: [], pick: null, shot: null, aud: null, ph: null, locked: false, phase: 'ask' };
  }

  function mzStart(name) {
    const nm = String(name || (AUTH.user ? AUTH.user.name : '') || '').trim().slice(0, 40);
    MZ.name = nm; LS.set('mz_name', nm);
    if (typeof AUTH !== 'undefined' && AUTH.recordPlay) AUTH.recordPlay();
    const deck = mzDraw();
    MZ.g = { deck: deck, i: 0, correct: 0, used: { f: false, a: false, p: false, s: false }, q: mzPrep(deck[0]), stage: 'q', amount: 0, started: Date.now() };
    mzSaveGame();
    if ((location.hash || '').indexOf('#/million') !== 0) { location.hash = '#/million'; return; }
    render(false);
    toast('بالتوفيق يا ' + (nm || 'بطل') + ' — أول سؤال بـ ١٠٠ جنيه');
  }

  function mzNext() {
    const g = MZ.g; if (!g) return;
    if (g.correct >= MZ_TOTAL) { mzWin(); return; }
    g.i = g.correct;
    g.q = mzPrep(g.deck[g.i]);
    g.stage = 'q';
    mzSaveGame();
    render(false);
  }

  function mzWin() {
    const g = MZ.g;
    g.stage = 'win'; g.amount = 1000000;
    if (typeof AUTH !== 'undefined' && AUTH.recordWin) AUTH.recordWin();
    mzSaveGame();
    render(false);
    setTimeout(() => { SFX.win(); confetti(null, window.innerHeight * 0.28, 46); }, 120);
  }

  function mzStop(kind) {
    const g = MZ.g; if (!g) return;
    if (kind === 'take') {
      g.amount = g.correct > 0 ? MZ_LADDER[g.correct - 1] : 0;
      g.stage = 'out';
      SFX.reveal();
    } else {
      let safe = 0;
      MZ_SAFE.forEach((l) => { if (g.correct >= l) safe = MZ_LADDER[l - 1]; });
      g.amount = safe;
      g.stage = 'lose';
    }
    if (g.amount > 0 && typeof AUTH !== 'undefined' && AUTH.recordBest) AUTH.recordBest(g.amount);
    mzSaveGame();
    render(false);
  }

  function mzAnswer() {
    const g = MZ.g; if (!g || !g.q || g.q.phase !== 'ask' || g.q.pick == null) return;
    const q = g.q;
    q.locked = true;
    if (q.pick === q.ai) {
      q.phase = 'right';
      g.correct += 1;
      SFX.pick();
      const btn = document.querySelector('.mzopt[data-i="' + q.pick + '"]');
      if (btn) { const r = btn.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, 16); }
      mzSaveGame();
      render(false);
      setTimeout(() => { if (MZ.g && MZ.g.q === q) mzNext(); }, 1150);
    } else {
      q.phase = 'wrong';
      SFX.blip(160, 0.35, 'sawtooth', 0.05);
      mzSaveGame();
      render(false);
      setTimeout(() => { if (MZ.g && MZ.g.q === q) mzStop('lose'); }, 1700);
    }
  }

  /* وسائل المساعدة */
  function mzFifty() {
    const g = MZ.g, q = g && g.q;
    if (!q || q.phase !== 'ask' || g.used.f) return;
    const wrong = q.opts.map((_, i) => i).filter((i) => i !== q.ai);
    q.hide = shuffle(wrong).slice(0, 2);
    if (q.pick != null && q.hide.indexOf(q.pick) > -1) q.pick = null;
    g.used.f = true; mzSaveGame(); SFX.tick(); render(false);
  }

  function mzAudience() {
    const g = MZ.g, q = g && g.q;
    if (!q || q.phase !== 'ask' || g.used.a) return;
    const lv = q.l;
    const acc = [0.82, 0.66, 0.48, 0.34][lv - 1];
    let vals = q.opts.map(() => Math.random() * 22);
    vals[q.ai] += acc * 100;
    const t = vals.reduce((x, y) => x + y, 0);
    vals = vals.map((v) => Math.round((v / t) * 100));
    const diff = 100 - vals.reduce((x, y) => x + y, 0);
    vals[q.ai] += diff;
    g.used.a = true;
    q.aud = vals;
    mzSaveGame(); SFX.reveal(); render(false);
  }

  function mzPhone() {
    const g = MZ.g, q = g && g.q;
    if (!q || q.phase !== 'ask' || g.used.p) return;
    const lv = q.l;
    const acc = [0.95, 0.85, 0.7, 0.55][lv - 1];
    const guess = Math.random() < acc ? q.ai : pick(q.opts.map((_, i) => i).filter((i) => i !== q.ai));
    const letters = MZ_KEYS.slice(0, q.opts.length);
    const sure = [100, 90, 80, 70, 60][rnd(5)];
    const line = guess === q.ai
      ? 'أنا شبه متأكد إن الإجابة ' + letters[guess] + ' — نسبة تأكدي ' + sure + '٪'
      : 'صراحة مش متأكد… بس حاسس إنها ' + letters[guess] + '، يمكن ' + (100 - sure) + '٪ بس';
    g.used.p = true;
    q.ph = { by: pick(['محمد', 'سارة', 'أحمد', 'منى', 'يوسف', 'نور', 'كريم', 'هبة']), line: line };
    mzSaveGame(); SFX.pick(); render(false);
  }

  function mzSwap() {
    const g = MZ.g, q = g && g.q;
    if (!q || q.phase !== 'ask' || g.used.s) return;
    const rest = MBANK.filter((x) => x.l === q.l && g.deck.indexOf(x.id) === -1 && (!q || x.id !== q.id));
    if (!rest.length) { toast('مفيش سؤال بديل متاح'); return; }
    const nq = pick(rest);
    g.deck[g.i] = nq.id;
    g.q = mzPrep(nq.id);
    g.used.s = true;
    mzSaveGame(); SFX.tick(); render(false);
    toast('اتغيّر السؤال — نفس المستوى');
  }

  /* ---------- الشيك ---------- */
  function mzArDate(d) {
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt)) return '';
    const p = (n) => (n < 10 ? '0' + n : '' + n);
    return p(dt.getDate()) + ' / ' + p(dt.getMonth() + 1) + ' / ' + dt.getFullYear();
  }

  function mzDrawCheque() {
    const cv = document.getElementById('mzCheque');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const nameEl = document.getElementById('mzName');
    const dateEl = document.getElementById('mzDate');
    const who = ((nameEl && nameEl.value) || MZ.name || (AUTH.user && AUTH.user.name) || 'بطل المليون').trim().slice(0, 40);
    const when = dateEl && dateEl.value ? mzArDate(dateEl.value) : mzArDate(new Date());

    ctx.clearRect(0, 0, W, H);

    /* الورق */
    const paper = ctx.createLinearGradient(0, 0, W, H);
    paper.addColorStop(0, '#fbf6e8'); paper.addColorStop(.55, '#f4ebd5'); paper.addColorStop(1, '#efe3c8');
    ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H);

    /* نقشة أمان (خطوط مقوّسة) */
    ctx.save();
    ctx.globalAlpha = .10; ctx.strokeStyle = '#0b6b53'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 26; i++) {
      ctx.beginPath(); ctx.arc(W * .5, H * .52, 60 + i * 26, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    /* إطار */
    ctx.strokeStyle = '#0b6b53'; ctx.lineWidth = 10; ctx.strokeRect(18, 18, W - 36, H - 36);
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 2.5; ctx.strokeRect(38, 38, W - 76, H - 76);
    ctx.strokeStyle = 'rgba(11,107,83,.45)'; ctx.lineWidth = 1; ctx.strokeRect(48, 48, W - 96, H - 96);

    /* علامة مائية */
    ctx.save();
    ctx.globalAlpha = .07;
    ctx.fillStyle = '#0b6b53';
    ctx.beginPath(); ctx.arc(W * .5, H * .54, 150, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0b6b53';
    ctx.font = '900 56px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillText('بنك المليون المصري', W / 2, 128);
    ctx.font = '700 22px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillStyle = '#8a6d1f';
    ctx.fillText('شيك جائزة — مسابقة «من سيربح المليون»', W / 2, 168);

    /* السيريال والتاريخ */
    ctx.font = '700 22px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.textAlign = 'left'; ctx.fillStyle = '#6b5a2a';
    ctx.fillText('رقم الشيك: ' + (1000000 + Math.floor(Math.random() * 8999999)), 72, 232);
    ctx.textAlign = 'right';
    ctx.fillText('التاريخ: ' + when, W - 72, 232);

    /* ادفعوا لأمر */
    ctx.textAlign = 'right';
    ctx.fillStyle = '#6b5a2a';
    ctx.font = '700 26px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillText('ادفعوا لأمر:', W - 92, 320);

    ctx.fillStyle = '#14210f';
    let nfs = 60;
    ctx.font = '900 ' + nfs + 'px "Segoe UI", Tahoma, Arial, sans-serif';
    while (nfs > 26 && ctx.measureText(who).width > W * 0.62) {
      nfs -= 4;
      ctx.font = '900 ' + nfs + 'px "Segoe UI", Tahoma, Arial, sans-serif';
    }
    ctx.textAlign = 'center';
    ctx.fillText(who, W / 2, 316);

    ctx.strokeStyle = 'rgba(11,107,83,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * .12, 348); ctx.lineTo(W * .88, 348); ctx.stroke();

    /* المبلغ */
    ctx.textAlign = 'right';
    ctx.font = '700 26px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillStyle = '#6b5a2a';
    ctx.fillText('مبلغ وقدره:', W - 92, 418);
    ctx.font = '900 44px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillStyle = '#14210f';
    ctx.fillText('مليون جنيه مصري فقط لا غير', W - 250, 418);

    /* خانة الرقم */
    ctx.fillStyle = 'rgba(11,107,83,.08)';
    ctx.fillRect(78, 380, 300, 84);
    ctx.strokeStyle = '#0b6b53'; ctx.lineWidth = 2.5;
    ctx.strokeRect(78, 380, 300, 84);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0b6b53';
    ctx.font = '900 44px "Courier New", monospace';
    ctx.direction = 'ltr';
    ctx.fillText('EGP 1,000,000', 228, 438);
    ctx.direction = 'rtl';

    /* توقيع */
    ctx.strokeStyle = '#14210f'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(W - 400, 560);
    ctx.bezierCurveTo(W - 370, 505, W - 330, 610, W - 290, 548);
    ctx.bezierCurveTo(W - 260, 505, W - 240, 590, W - 200, 552);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(11,107,83,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W - 430, 580); ctx.lineTo(W - 180, 580); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = '#6b5a2a';
    ctx.font = '700 20px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillText('توقيع الأمين', W - 305, 614);

    /* ختم */
    ctx.save();
    ctx.translate(210, 560); ctx.rotate(-0.14);
    ctx.strokeStyle = 'rgba(180,30,70,.75)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, 68, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(180,30,70,.85)';
    ctx.font = '900 19px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('معتمد', 0, -6);
    ctx.fillText('١٠٠٠٠٠٠', 0, 22);
    ctx.restore();

    /* شعار صغير */
    ctx.beginPath();
    const gx = W - 190, gy = 118;
    const grd = ctx.createLinearGradient(gx - 30, gy - 30, gx + 30, gy + 30);
    grd.addColorStop(0, '#7b5cff'); grd.addColorStop(.55, '#ff2d92'); grd.addColorStop(1, '#ffb03a');
    ctx.fillStyle = grd;
    if (ctx.roundRect) { ctx.roundRect(gx - 34, gy - 34, 68, 68, 18); ctx.fill(); }
    else ctx.fillRect(gx - 34, gy - 34, 68, 68);
    ctx.fillStyle = '#150a1e';
    ctx.font = '900 40px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('؟', gx, gy + 2);
    ctx.textBaseline = 'alphabetic';
  }

  /* ---------- الواجهات ---------- */
  function mzLadderHTML(g) {
    let out = '<details class="mzladder" id="mzLadder" open><summary class="mzladder__t">' +
      '<span>سلّم الجوائز</span><b>سؤال ' + num(g ? g.i + 1 : 1) + ' / ' + num(MZ_TOTAL) + ' — ' + mzMoney(g ? MZ_LADDER[g.i] : MZ_LADDER[0]) + '</b></summary><ol>';
    for (let i = MZ_TOTAL - 1; i >= 0; i--) {
      const lv = i + 1;
      const val = MZ_LADDER[i];
      const isNow = g && g.stage === 'q' && g.i === i;
      const done = g && i < g.correct;
      const safe = MZ_SAFE.indexOf(lv) > -1;
      out += '<li class="mzl' + (isNow ? ' is-now' : '') + (done ? ' is-done' : '') + (safe ? ' is-safe' : '') + '">' +
        '<span class="mzl__n">' + num(lv) + '</span>' +
        '<span class="mzl__v">' + num(val) + '</span>' +
        (safe ? '<span class="mzl__s">أمان</span>' : '') + '</li>';
    }
    out += '</ol></details>';
    return out;
  }

  function mzQuestionHTML(g, q) {
    const lv = g.i + 1;
    const val = MZ_LADDER[g.i];
    const cat = MZ_CATS[q.c] || '#7b5cff';
    const letters = MZ_KEYS.slice(0, q.opts.length);
    const opts = q.opts.map((o, i) => {
      let cls = 'mzopt';
      if (q.hide.indexOf(i) > -1) cls += ' is-off';
      if (q.pick === i) cls += ' is-pick';
      if (q.phase === 'right' && i === q.ai) cls += ' is-right';
      if (q.phase === 'wrong') {
        if (i === q.ai) cls += ' is-right';
        else if (i === q.pick) cls += ' is-wrong';
      }
      const aud = q.aud ? '<span class="mzopt__aud" style="--p:' + q.aud[i] + '%"><i></i><b>' + q.aud[i] + '٪</b></span>' : '';
      return '<button class="' + cls + '" data-act="mz-pick" data-i="' + i + '"' + (q.phase !== 'ask' || q.hide.indexOf(i) > -1 ? ' disabled' : '') + ' aria-pressed="' + (q.pick === i) + '">' +
        '<span class="mzopt__k">' + letters[i] + '</span>' +
        '<span class="mzopt__t">' + esc(o.v) + '</span>' +
        '<span class="mzopt__mark">' + (q.phase === 'right' && i === q.ai ? ICON('check') : q.phase === 'wrong' && i === q.pick ? ICON('minus') : '') + '</span>' +
        aud + '</button>';
    }).join('');

    const lifeline = (key, icon, label) => '<button class="mzlife' + (g.used[key] ? ' is-used' : '') + '" data-act="mz-' + key + '" type="button"' + (g.used[key] || q.phase !== 'ask' ? ' disabled' : '') + '>' + ICON(icon) + '<span>' + label + '</span></button>';

    const phone = q.ph ? '<div class="mzmsg"><span class="mzmsg__by">' + ICON('phone') + ' صديقك ' + esc(q.ph.by) + ':</span><p>' + esc(q.ph.line) + '</p></div>' : '';
    const audNote = q.aud ? '<div class="mzmsg mzmsg--aud"><span class="mzmsg__by">' + ICON('crowd') + ' رأي الجمهور:</span><p>الأعمدة فوق كل اختيار — النسبة مش مضمونة تكون صح.</p></div>' : '';

    return '<div class="mzhead">' +
        '<span class="mzchip" style="--c:' + cat + '">' + esc(q.c) + '</span>' +
        '<span class="mzchip mzchip--lv">سؤال ' + num(lv) + ' من ' + num(MZ_TOTAL) + '</span>' +
        '<span class="mzchip mzchip--money">' + ICON('money') + ' ' + mzMoney(val) + '</span>' +
      '</div>' +
      '<div class="mzprog"><i style="width:' + Math.round(((lv - 1) / MZ_TOTAL) * 100) + '%"></i></div>' +
      '<div class="mzq">' + esc(q.t) + '</div>' +
      '<div class="mzopts' + (q.opts.length === 2 ? ' mzopts--two' : '') + '">' + opts + '</div>' +
      audNote + phone +
      '<div class="mzlifelines">' +
        lifeline('f', 'fifty', '٥٠:٥٠') +
        lifeline('a', 'crowd', 'اسأل الجمهور') +
        lifeline('p', 'phone', 'اتصال بصديق') +
        lifeline('s', 'swap', 'بدّل السؤال') +
      '</div>' +
      '<div class="mzactions">' +
        (q.phase === 'ask'
          ? '<button class="btn btn--primary btn--lg" data-act="mz-ok"' + (q.pick == null ? ' disabled' : '') + '>' + ICON('check') + ' إجابة نهائية</button>' +
            '<button class="btn btn--ghost" data-act="mz-take">' + ICON('wallet') + ' ' + (g.correct ? 'انسحب بـ ' + mzMoney(MZ_LADDER[g.correct - 1]) : 'انسحاب') + '</button>'
          : '<span class="mzphase">' + (q.phase === 'right' ? 'إجابة صحيحة، مبروك!' : 'الإجابة غلط…') + '</span>') +
      '</div>';
  }

  function mzChequeHTML() {
    const g = MZ.g || {};
    const today = new Date().toISOString().slice(0, 10);
    return '<section class="wrap mzwin">' +
      '<div class="mzwin__top"><span class="chip chip--live">' + ICON('crown') + ' فوز بالمليون</span></div>' +
      '<h1 class="mzwin__title">مبروك! أنت كسبت <span class="grad">مليون جنيه</span></h1>' +
      '<div class="mzwinstats">' +
        '<span class="chip">' + ICON('check') + ' ٤٠ إجابة صح</span>' +
        '<span class="chip">' + ICON('money') + ' ١,٠٠٠,٠٠٠ جنيه</span>' +
        '<span class="chip">' + ICON('crown') + ' ' + (myStats().wins > 1 ? 'فوز رقم ' + num(myStats().wins) : 'أول فوز ليك') + '</span>' +
      '</div>' +
      '<p class="lead">الشيك جاهز باسمك. اكتب الاسم والتاريخ اللي تحبهم، ونزّل الصورة وشاركها مع الشلة.</p>' +
      '<div class="mzcheque"><canvas id="mzCheque" width="1400" height="700" role="img" aria-label="شيك مليون جنيه باسم اللاعب"></canvas></div>' +
      '<div class="mzform" role="group" aria-label="بيانات الشيك">' +
        '<label class="field" for="mzName"><span>' + ICON('idcard') + ' الاسم على الشيك</span>' +
          '<input id="mzName" name="player" type="text" inputmode="text" autocomplete="off" autocapitalize="words" spellcheck="false" maxlength="40" placeholder="اكتب اسمك هنا" value="' + esc(MZ.name || '') + '"></label>' +
        '<label class="field" for="mzDate"><span>' + ICON('clock') + ' التاريخ</span>' +
          '<input id="mzDate" name="d" type="date" autocomplete="off" value="' + today + '"></label>' +
      '</div>' +
      '<p class="hint">بيانات الشيك بتتكتب على الصورة بس — مش بتتبعت لأي سيرفر ومحتاجة تسجيل.</p>' +
      '<div class="mzactions mzactions--center">' +
        '<button class="btn btn--primary btn--lg" data-act="mz-dl" type="button">' + ICON('download') + ' نزّل الشيك PNG</button>' +
        '<button class="btn btn--ghost" data-act="mz-share" type="button">' + ICON('share') + ' شارك الفوز</button>' +
      '</div>' +
      '<div class="mzshare-apps">' +
        '<span class="mzshare-apps__t">ابعت الفوز على التطبيقات:</span>' +
        '<div class="mzshare-apps__row">' + mzShareButtons() + '</div>' +
      '</div>' +
      '<div class="mzactions mzactions--center">' +
        '<button class="btn btn--ghost" data-act="mz-again" type="button">' + ICON('refresh') + ' العب تاني</button>' +
      '</div>' +
      '<p class="hint">الشيك ده صورة تذكارية للجائزة — مش شيك بنكي حقيقي. ' + num(g.correct || MZ_TOTAL) + ' إجابة صح من ' + num(MZ_TOTAL) + '.</p>' +
      adSlot() +
    '</section>';
  }

  function mzEndHTML(kind) {
    const g = MZ.g || {};
    const won = kind === 'out';
    const amt = g.amount || 0;
    const title = won ? 'انسحبت بـ ' + mzMoney(amt) : 'خسرت هذه الجولة';
    const sub = won
      ? 'قرار ذكي — فلوس مضمونة وخرجت قبل ما تقع. المبلغ اللي خدته هو قيمة آخر مستوى عدّيته (' + num(g.correct) + ' إجابة صح).'
      : (amt > 0
        ? 'إجابتك غلط، بس شبكة الأمان نجّتك — بتاخد ' + mzMoney(amt) + ' قيمة أعلى مستوى أمان وصلته.'
        : 'إجابتك غلط ومكسبتش حاجة هذه المرة. جرّب تاني، البنك كبير والأسئلة بتتغير كل جولة.');
    return '<section class="wrap mzend">' +
      '<div class="mzend__badge ' + (won ? 'is-win' : 'is-lose') + '">' + ICON(won ? 'wallet' : 'minus') + '</div>' +
      '<h1 class="mzend__title">' + title + '</h1>' +
      '<p class="lead">' + sub + '</p>' +
      '<div class="mzend__stats">' +
        '<div class="stat"><b>' + num(g.correct || 0) + '</b><span>إجابة صحيحة</span></div>' +
        '<div class="stat"><b>' + mzMoney(amt) + '</b><span>' + (won ? 'المبلغ المسحوب' : 'المبلغ المكتسب') + '</span></div>' +
        '<div class="stat"><b>' + num(myStats().best) + '</b><span>أفضل نتيجة ليك</span></div>' +
      '</div>' +
      '<div class="mzactions mzactions--center">' +
        '<button class="btn btn--primary btn--lg" data-act="mz-again" type="button">' + ICON('refresh') + ' جولة جديدة</button>' +
        '<button class="btn btn--ghost" data-act="mz-share" type="button">' + ICON('share') + ' تحدى صحابك</button>' +
        '<a class="btn btn--ghost" href="#/million/rules">' + ICON('book') + ' القواعد</a>' +
      '</div>' +
      '<div class="mzshare-apps">' +
        '<span class="mzshare-apps__t">ابعت التحدي على:</span>' +
        '<div class="mzshare-apps__row">' + mzShareButtons() + '</div>' +
      '</div>' + adSlot() +
    '</section>';
  }

  function mzLobbyHTML() {
    const n = MBANK.length;
    const byLv = [1, 2, 3, 4].map((l) => MBANK.filter((q) => q.l === l).length);
    return '<section class="wrap mzhero">' +
      '<div class="mzhero__badge"><span class="chip chip--live">' + ICON('crown') + ' اللعبة الرسمية</span></div>' +
      '<h1 class="mzhero__title">من سيربح <span class="grad">المليون؟</span></h1>' +
      '<p class="mzhero__sub">٤٠ سؤال من السهل للصعب، مليون جنيه في الآخر، و٤ وسائل مساعدة. مفيش مؤقت — خد وقتك وفكّر.</p>' +
      '<div class="hero__cta">' +
        '<button class="btn btn--primary btn--lg" data-act="mz-start" type="button">' + ICON('play') + ' ابدأ اللعب</button>' +
        '<a class="btn btn--ghost btn--lg" href="#/million/rules">' + ICON('book') + ' القواعد</a>' +
      '</div>' +
      (AUTH.user
          ? '<p class="mzhero__note">' + ICON('check') + ' سجّلت دخولك باسم ' + esc(AUTH.user.name) + ' — اسمك هيظهر على الشيك تلقائيًا.</p>'
          : '<p class="mzhero__note">' + ICON('idcard') + ' التسجيل بالإيميل أو جوجل بيحفظ جولاتك وإحصائياتك. <a href="#/auth" data-nav="auth">سجّل دخول</a></p>') +
      '<div class="mzhero__stats">' +
        '<div class="stat"><b>' + num(n) + '</b><span>سؤال في البنك</span></div>' +
        '<div class="stat"><b>' + num(MZ_TOTAL) + '</b><span>مستوى للجائزة</span></div>' +
        '<div class="stat"><b>' + num(myStats().wins) + '</b><span>مرات فوزك</span></div>' +
      '</div>' +
      '<div class="mzrules">' +
        '<div class="mzrule">' + ICON('trophy') + '<b>٤٠ مستوى</b><span>من ١٠٠ جنيه لحد مليون جنيه.</span></div>' +
        '<div class="mzrule">' + ICON('fifty') + '<b>٤ وسائل مساعدة</b><span>٥٠:٥٠، الجمهور، صديق، وبدّل السؤال — كل واحدة مرة.</span></div>' +
        '<div class="mzrule">' + ICON('wallet') + '<b>شبكة أمان</b><span>مستويات ٥ و١٥ و٢٥ و٣٥ مضمونة لو غلطت.</span></div>' +
        '<div class="mzrule">' + ICON('crown') + '<b>شيك باسمك</b><span>لو كسبت، شيك مليون جنيه جاهز للتحميل.</span></div>' +
      '</div>' +
      '<div class="mzbands">' +
        '<div class="mzband"><i style="--c:#a3e635"></i><b>سهل</b><span>' + num(byLv[0]) + ' سؤال</span></div>' +
        '<div class="mzband"><i style="--c:#22d3ee"></i><b>متوسط</b><span>' + num(byLv[1]) + ' سؤال</span></div>' +
        '<div class="mzband"><i style="--c:#ffb03a"></i><b>صعب</b><span>' + num(byLv[2]) + ' سؤال</span></div>' +
        '<div class="mzband"><i style="--c:#ff2d92"></i><b>صعب جدًا</b><span>' + num(byLv[3]) + ' سؤال</span></div>' +
      '</div>' +
      '<div class="mzhero__art mzhero__art--small"><img referrerpolicy="no-referrer" src="https://i.ibb.co/Fb4HLGSN/million-light.png" alt="مسرح المسابقة وشيك المليون" width="1279" height="709" loading="lazy"></div>' +
      '<p class="hint">كل جولة بتسحب ١٠ أسئلة من كل مستوى بشكل عشوائي — يعني كل لاعب بيقابل أسئلة مختلفة.</p>' +
      adSlot() +
    '</section>';
  }

  function mzRulesHTML() {
    const rows = MZ_LADDER.map((v, i) => '<li><span>' + num(i + 1) + '</span><b>' + num(v) + '</b>' + (MZ_SAFE.indexOf(i + 1) > -1 ? '<i>أمان</i>' : '') + '</li>').join('');
    return '<section class="wrap page">' +
      '<span class="eyebrow">إزاي تلعب</span>' +
      '<h1 class="page__title">قواعد «من سيربح المليون»</h1>' +
      '<div class="rulesbox">' +
        '<h2>الجولة</h2><p>٤٠ سؤال متتالية من السهل للصعب. كل سؤال صح بتطلع لمستوى أعلى، ولحد ما توصل للمليون.</p>' +
        '<h2>مفيش مؤقت</h2><p>خد وقتك في التفكير — الضغط كله في الاختيار نفسه.</p>' +
        '<h2>الانسحاب</h2><p>تقدر تنسحب في أي لحظة وتاخد مبلغ آخر مستوى صح عدّيته.</p>' +
        '<h2>الخسارة</h2><p>لو غلطت، بتاخد مبلغ أعلى مستوى أمان وصلته (٥، ١٥، ٢٥، ٣٥). لو ما وصلتش لأي مستوى أمان، بتاخد صفر.</p>' +
        '<h2>وسائل المساعدة</h2><p>٥٠:٥٠ يشيل إجابتين غلط. اسأل الجمهور يوريك نسبة التصويت (بتقل دقتها في الأسئلة الصعبة). اتصال بصديق يديك رأيه (مش مضمون). بدّل السؤال يجيب سؤال تاني بنفس المستوى.</p>' +
        '<h2>الشيك</h2><p>لو وصلت للمليون، بيتولّد شيك باسمك وتاريخ تختاره، وتنزّله صورة PNG.</p>' +
      '</div>' +
      '<h2 class="page__title" style="font-size:24px">سلّم الجوائز</h2>' +
      '<ol class="ladderlist">' + rows + '</ol>' +
      '<div class="mzactions mzactions--center"><a class="btn btn--primary btn--lg" href="#/million">' + ICON('play') + ' يلا نبدأ</a></div>' +
    '</section>';
  }

  function viewMillion(r) {
    if (r && r.arg === 'rules') return mzRulesHTML();
    const g = MZ.g;
    if (MZ.pending && AUTH.user && !g) {
      /* المستخدم كان داس «ابدأ» قبل الدخول — نبدأ له على طول */
      MZ.pending = false;
      setTimeout(() => { if (AUTH.user && !MZ.g) mzStart(MZ.name || ''); }, 30);
    }
    if (!g || !g.deck || !g.q) return mzLobbyHTML();
    if (g.stage === 'win') { setTimeout(mzDrawCheque, 0); return mzChequeHTML(); }
    if (g.stage === 'out' || g.stage === 'lose') return mzEndHTML(g.stage);

    /* لو الجولة قديمة جدًا، نظّفها */
    if (g.started && Date.now() - g.started > 1000 * 60 * 60 * 12) {
      MZ.g = null; LS.del('mz_game'); return mzLobbyHTML();
    }
    return '<section class="wrap mz">' +
      '<div class="mzgrid">' +
        '<div class="mzmain">' +
          '<div class="mzplayer"><span class="mzplayer__n">' + esc(MZ.name || 'لاعب') + '</span>' +
            '<span class="mzplayer__m">مكسبك المضمون: <b>' + mzMoney(mzSafe(g.correct)) + '</b> · لو غلطت بتاخده</span></div>' +
          mzQuestionHTML(g, g.q) +
        '</div>' +
        mzLadderHTML(g) +
      '</div>' +
      adSlot() +
    '</section>';
  }

  function mzDownload() {
    const cv = document.getElementById('mzCheque');
    if (!cv) return;
    const name = ((document.getElementById('mzName') || {}).value || MZ.name || 'شيك').trim();
    try {
      const url = cv.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cheque-million-' + name.replace(/[\\/:*?"<>|]/g, '-') + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      toast('اتنزّل الشيك — بص على التنزيلات');
      SFX.win();
    } catch (e) { toast('مش قادر أنزّل الصورة هنا — جرّب من المتصفح'); }
  }

  /* ==========================================================
     11) الإقلاع
     ========================================================== */
  /* الصور الخارجية من i.ibb.co — الروابط الجديدة بدل الملفات المحلية المكسورة */
  function brokenImageGuard() {
    document.addEventListener('error', (ev) => {
      const img = ev.target;
      if (img && img.tagName === 'IMG') {
        if (img.dataset.broken) return;
        img.dataset.broken = '1';
        img.classList.add('is-broken');
        // لو الصورة الأساسية i.ibb.co فشلت، جرّب مرة تانية بدون referrer أو اخفيها بلطف
        const src = img.getAttribute('src') || '';
        if (src.includes('i.ibb.co') && !img.dataset.retried) {
          img.dataset.retried = '1';
          // بعض متصفحات تمنع ibb بسبب referrer — جرّب بدون باراميتر
          setTimeout(() => { img.src = src; }, 400);
          return;
        }
        // إخفاء مكسور بشكل جميل: نحط placeholder بسيط
        if (!img.closest('.art__box')) {
          img.style.opacity = '0.35';
          img.style.filter = 'grayscale(0.8) blur(1px)';
        }
      }
    }, true);
  }

  function syncChrome() {
    const b = $('#btnSound');
    if (b) {
      const on = !!store.settings.sound;
      b.innerHTML = ICON(on ? 'sound' : 'mute');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    const sh = $('#btnShare');
    if (sh) sh.innerHTML = ICON('share');
    const brand = $('#brand');
    if (brand) brand.innerHTML = LOGO_LOCKUP(window.innerWidth < 520 ? 34 : 38);
    const fl = $('#footerLogo');
    if (fl) fl.innerHTML = LOGO_MARK(30) + '<span>من سيربح المليون؟</span>';
    $$('.tabbar [data-ico]').forEach((i) => { i.innerHTML = ICON(i.dataset.ico); });
    if (typeof renderUserBox === 'function') renderUserBox();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const t = e.target;
    if (!t || !t.id) return;
    if (t.id === 'auName' || t.id === 'auEmail' || t.id === 'auPass') {
      e.preventDefault();
      const r = parse();
      if (r.name !== 'auth') return;
      if (r.params.tab === 'signup') doSignup(); else doLogin();
    }
  });

  /* قفل القائمة عند الضغط برّه */
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('userMenu');
    if (!menu || !menu.classList.contains('is-open')) return;
    if (e.target.closest('#userChip')) return;
    menu.classList.remove('is-open');
  });

  document.addEventListener('input', (e) => {
    if (e.target && (e.target.id === 'mzName' || e.target.id === 'mzDate')) mzDrawCheque();
  });

  document.addEventListener('DOMContentLoaded', () => {
    syncChrome();
    AUTH.init().then(() => {
      renderUserBox();
      render(false);
      /* التشخيص الحقيقي في الـ console بس — الزائر بيشوف رسالة عامة */
      if (!FB.ready) {
        try { console.warn('[service] unavailable:', FB.error, FB_CONFIG && FB_CONFIG.projectId); } catch (e) {}
        toast('الخدمة مش متاحة دلوقتي — حدّث الصفحة أو جرّب بعد شوية', 4200);
      }
    }).catch(() => {});
    AUTH.on(() => renderUserBox());
    $('#btnSound').addEventListener('click', () => {
      const on = SFX.toggle();
      syncChrome();
      toast(on ? 'الصوت شغال' : 'الصوت مقفول', 1200);
    });
    $('#btnShare').addEventListener('click', () => {
      nativeShare({ text: 'العب «من سيربح المليون؟» — ' + num(MZ_TOTAL) + ' سؤال من السهل للصعب لحد مليون جنيه.\n' + APP_URL() })
        .then((r) => { if (r === 'copied') toast('اتنسخ الرابط — ابعته على واتساب أو أي تطبيق'); });
    });
    brokenImageGuard();
    window.addEventListener('hashchange', () => render(true));
    render(false);
  });
})();
