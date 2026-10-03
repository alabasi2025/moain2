var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err2) => function __init() {
  if (err2) throw err2[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err2 = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// node_modules/.pnpm/@cloudflare+unenv-preset@2.16.2_unenv@2.0.0-rc.24_workerd@1.20261001.1/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "node_modules/.pnpm/@cloudflare+unenv-preset@2.16.2_unenv@2.0.0-rc.24_workerd@1.20261001.1/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    if (!("__unenv__" in performance)) {
      const proto = Performance.prototype;
      for (const key of Object.getOwnPropertyNames(proto)) {
        if (key !== "constructor" && !(key in performance)) {
          const desc = Object.getOwnPropertyDescriptor(proto, key);
          if (desc) {
            Object.defineProperty(performance, key, desc);
          }
        }
      }
    }
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// node_modules/.pnpm/@cloudflare+unenv-preset@2.16.2_unenv@2.0.0-rc.24_workerd@1.20261001.1/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "node_modules/.pnpm/@cloudflare+unenv-preset@2.16.2_unenv@2.0.0-rc.24_workerd@1.20261001.1/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// node_modules/.pnpm/wrangler@4.147.0_@cloudflare+workers-types@5.20261003.1/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "node_modules/.pnpm/wrangler@4.147.0_@cloudflare+workers-types@5.20261003.1/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "node_modules/.pnpm/unenv@2.0.0-rc.24/node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {
      }
      unref() {
      }
      // --- unimplemented methods ---
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      // --- attached interfaces ---
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});

// node_modules/.pnpm/@cloudflare+unenv-preset@2.16.2_unenv@2.0.0-rc.24_workerd@1.20261001.1/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, workerdProcess, unenvProcess, exit, features, platform, _channel, _debugEnd, _debugProcess, _disconnect, _events, _eventsCount, _exiting, _fatalException, _getActiveHandles, _getActiveRequests, _handleQueue, _kill, _linkedBinding, _maxListeners, _pendingMessage, _preload_modules, _rawDebug, _send, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, abort, addListener, allowedNodeEnvironmentFlags, arch, argv, argv0, assert2, availableMemory, binding, channel, chdir, config, connected, constrainedMemory, cpuUsage, cwd, debugPort, disconnect, dlopen, domain, emit, emitWarning, env, eventNames, execArgv, execPath, exitCode, finalization, getActiveResourcesInfo, getegid, geteuid, getgid, getgroups, getMaxListeners, getuid, hasUncaughtExceptionCaptureCallback, hrtime3, initgroups, kill, listenerCount, listeners, loadEnvFile, mainModule, memoryUsage, moduleLoadList, nextTick, off, on, once, openStdin, permission, pid, ppid, prependListener, prependOnceListener, rawListeners, reallyExit, ref, release, removeAllListeners, removeListener, report, resourceUsage, send, setegid, seteuid, setgid, setgroups, setMaxListeners, setSourceMapsEnabled, setuid, setUncaughtExceptionCaptureCallback, sourceMapsEnabled, stderr, stdin, stdout, throwDeprecation, title, traceDeprecation, umask, unref, uptime, version, versions, _process, process_default;
var init_process2 = __esm({
  "node_modules/.pnpm/@cloudflare+unenv-preset@2.16.2_unenv@2.0.0-rc.24_workerd@1.20261001.1/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    workerdProcess = getBuiltinModule("node:process");
    unenvProcess = new Process({
      env: globalProcess.env,
      hrtime,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess.nextTick
    });
    ({ exit, features, platform } = workerdProcess);
    ({
      _channel,
      _debugEnd,
      _debugProcess,
      _disconnect,
      _events,
      _eventsCount,
      _exiting,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _handleQueue,
      _kill,
      _linkedBinding,
      _maxListeners,
      _pendingMessage,
      _preload_modules,
      _rawDebug,
      _send,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      arch,
      argv,
      argv0,
      assert: assert2,
      availableMemory,
      binding,
      channel,
      chdir,
      config,
      connected,
      constrainedMemory,
      cpuUsage,
      cwd,
      debugPort,
      disconnect,
      dlopen,
      domain,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exitCode,
      finalization,
      getActiveResourcesInfo,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getMaxListeners,
      getuid,
      hasUncaughtExceptionCaptureCallback,
      hrtime: hrtime3,
      initgroups,
      kill,
      listenerCount,
      listeners,
      loadEnvFile,
      mainModule,
      memoryUsage,
      moduleLoadList,
      nextTick,
      off,
      on,
      once,
      openStdin,
      permission,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      reallyExit,
      ref,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      send,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setMaxListeners,
      setSourceMapsEnabled,
      setuid,
      setUncaughtExceptionCaptureCallback,
      sourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      throwDeprecation,
      title,
      traceDeprecation,
      umask,
      unref,
      uptime,
      version,
      versions
    } = unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// node_modules/.pnpm/wrangler@4.147.0_@cloudflare+workers-types@5.20261003.1/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "node_modules/.pnpm/wrangler@4.147.0_@cloudflare+workers-types@5.20261003.1/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/http-exception.js
var init_http_exception = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/http-exception.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT;
var init_constants = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/request/constants.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    GET_MATCH_RESULT = /* @__PURE__ */ Symbol();
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/crypto.js
var init_crypto = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/crypto.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/buffer.js
var bufferToFormData;
var init_buffer = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/buffer.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_crypto();
    bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
      return new Response(arrayBuffer, { headers: { "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase()) } }).formData();
    }, "bufferToFormData");
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/body.js
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) return convertFormDataToBodyData(await request.bodyCache.formData, options);
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) request.bodyCache.formData = formDataPromise;
  const formData = await formDataPromise;
  if (formData) return convertFormDataToBodyData(formData, options);
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    if (!(options.all || key.endsWith("[]"))) form[key] = value;
    else handleParsingAllValues(form, key, value);
  });
  if (options.dot) Object.entries(form).forEach(([key, value]) => {
    if (key.includes(".")) {
      handleParsingNestedValues(form, key, value, nestingState);
      delete form[key];
    }
  });
  return form;
}
var MAX_NESTED_OBJECTS, isRawRequest, parseBody, handleParsingAllValues, handleParsingNestedValues, throwNestingLimitExceeded;
var init_body = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/body.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_buffer();
    MAX_NESTED_OBJECTS = 1e4;
    isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
    parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
      const { all = false, dot = false } = options;
      const mediaType = (isRawRequest(request) ? request.headers : request.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();
      if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") return parseFormData(request, {
        all,
        dot
      });
      return {};
    }, "parseBody");
    __name(parseFormData, "parseFormData");
    __name(convertFormDataToBodyData, "convertFormDataToBodyData");
    handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
      if (form[key] !== void 0) {
        if (Array.isArray(form[key])) form[key].push(value);
        else form[key] = [form[key], value];
      } else if (!key.endsWith("[]")) form[key] = value;
      else form[key] = [value];
    }, "handleParsingAllValues");
    handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value, state) => {
      if (/(?:^|\.)__proto__\./.test(key)) return;
      let nestedForm = form;
      const keys = key.split(".", 34);
      if (keys.length > 33) throwNestingLimitExceeded();
      keys.forEach((key2, index) => {
        if (index === keys.length - 1) nestedForm[key2] = value;
        else {
          if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
            if (state.count++ >= MAX_NESTED_OBJECTS) throwNestingLimitExceeded();
            nestedForm[key2] = /* @__PURE__ */ Object.create(null);
          }
          nestedForm = nestedForm[key2];
        }
      });
    }, "handleParsingNestedValues");
    throwNestingLimitExceeded = /* @__PURE__ */ __name(() => {
      throw new Error("Nesting limit exceeded");
    }, "throwNestingLimitExceeded");
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/url.js
var splitPath, splitRoutingPath, extractGroupsFromPath, replaceGroupMarks, patternCache, getPattern, tryDecode, tryDecodeURI, getPath, getPathNoStrict, mergePath, checkOptionalParameter, tryDecodeURIComponent, _decodeURI, _getQueryParam, getQueryParam, getQueryParams, decodeURIComponent_;
var init_url = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/url.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    splitPath = /* @__PURE__ */ __name((path) => {
      const paths = path.split("/");
      if (paths[0] === "") paths.shift();
      return paths;
    }, "splitPath");
    splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
      const { groups, path } = extractGroupsFromPath(routePath);
      const paths = splitPath(path);
      return replaceGroupMarks(paths, groups);
    }, "splitRoutingPath");
    extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
      const groups = [];
      path = path.replace(/\{[^}]+\}/g, (match2, index) => {
        const mark = `@${index}`;
        groups.push([mark, match2]);
        return mark;
      });
      return {
        groups,
        path
      };
    }, "extractGroupsFromPath");
    replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
      for (let i = groups.length - 1; i >= 0; i--) {
        const [mark] = groups[i];
        for (let j = paths.length - 1; j >= 0; j--) if (paths[j].includes(mark)) {
          paths[j] = paths[j].replace(mark, groups[i][1]);
          break;
        }
      }
      return paths;
    }, "replaceGroupMarks");
    patternCache = {};
    getPattern = /* @__PURE__ */ __name((label, next) => {
      if (label === "*") return "*";
      const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      if (match2) {
        const cacheKey = `${label}#${next}`;
        if (!patternCache[cacheKey]) {
          if (match2[2]) patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [
            cacheKey,
            match2[1],
            new RegExp(`^${match2[2]}(?=/${next})`)
          ] : [
            label,
            match2[1],
            new RegExp(`^${match2[2]}$`)
          ];
          else patternCache[cacheKey] = [
            label,
            match2[1],
            true
          ];
        }
        return patternCache[cacheKey];
      }
      return null;
    }, "getPattern");
    tryDecode = /* @__PURE__ */ __name((str, decoder) => {
      try {
        return decoder(str);
      } catch {
        return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
          try {
            return decoder(match2);
          } catch {
            return match2;
          }
        });
      }
    }, "tryDecode");
    tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
    getPath = /* @__PURE__ */ __name((request) => {
      const url = request.url;
      const start = url.indexOf("/", url.indexOf(":") + 4);
      let i = start;
      for (; i < url.length; i++) {
        const charCode = url.charCodeAt(i);
        if (charCode === 37) {
          const queryIndex = url.indexOf("?", i);
          const hashIndex = url.indexOf("#", i);
          const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
          const path = url.slice(start, end);
          return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
        } else if (charCode === 63 || charCode === 35) break;
      }
      return url.slice(start, i);
    }, "getPath");
    getPathNoStrict = /* @__PURE__ */ __name((request) => {
      const result = getPath(request);
      return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
    }, "getPathNoStrict");
    mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
      if (rest.length) sub = mergePath(sub, ...rest);
      return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
    }, "mergePath");
    checkOptionalParameter = /* @__PURE__ */ __name((path) => {
      if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) return null;
      const segments = path.split("/");
      const results = [];
      let basePath = "";
      segments.forEach((segment) => {
        if (segment !== "" && !/\:/.test(segment)) basePath += "/" + segment;
        else if (/\:/.test(segment)) {
          if (segment.charCodeAt(segment.length - 1) === 63) {
            if (results.length === 0 && basePath === "") results.push("/");
            else results.push(basePath);
            const optionalSegment = segment.slice(0, -1);
            basePath += "/" + optionalSegment;
            results.push(basePath);
          } else basePath += "/" + segment;
        }
      });
      return results.filter((v, i, a) => a.indexOf(v) === i);
    }, "checkOptionalParameter");
    tryDecodeURIComponent = /* @__PURE__ */ __name((str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str, "tryDecodeURIComponent");
    _decodeURI = /* @__PURE__ */ __name((value) => {
      if (value.indexOf("+") !== -1) value = value.replace(/\+/g, " ");
      return tryDecodeURIComponent(value);
    }, "_decodeURI");
    _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
      const hashIndex = url.indexOf("#", 8);
      if (hashIndex !== -1) url = url.slice(0, hashIndex);
      let encoded;
      if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
        let keyIndex2 = url.indexOf("?", 8);
        if (keyIndex2 === -1) return;
        if (!url.startsWith(key, keyIndex2 + 1)) keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        while (keyIndex2 !== -1) {
          const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
          if (trailingKeyCode === 61) {
            const valueIndex = keyIndex2 + key.length + 2;
            const endIndex = url.indexOf("&", valueIndex);
            return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
          } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) return "";
          keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        }
        encoded = /[%+]/.test(url);
        if (!encoded) return;
      }
      const results = /* @__PURE__ */ Object.create(null);
      encoded ??= /[%+]/.test(url);
      let keyIndex = url.indexOf("?", 8);
      while (keyIndex !== -1) {
        const nextKeyIndex = url.indexOf("&", keyIndex + 1);
        let valueIndex = url.indexOf("=", keyIndex);
        if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) valueIndex = -1;
        let name = url.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex);
        if (encoded) name = _decodeURI(name);
        keyIndex = nextKeyIndex;
        if (name === "") continue;
        let value;
        if (valueIndex === -1) value = "";
        else {
          value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
          if (encoded) value = _decodeURI(value);
        }
        if (multiple) {
          if (!(results[name] && Array.isArray(results[name]))) results[name] = [];
          results[name].push(value);
        } else results[name] ??= value;
      }
      return key ? results[key] : results;
    }, "_getQueryParam");
    getQueryParam = _getQueryParam;
    getQueryParams = /* @__PURE__ */ __name((url, key) => {
      return _getQueryParam(url, key, true);
    }, "getQueryParams");
    decodeURIComponent_ = decodeURIComponent;
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/request.js
var HonoRequest;
var init_request = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/request.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_http_exception();
    init_constants();
    init_body();
    init_url();
    HonoRequest = class {
      static {
        __name(this, "HonoRequest");
      }
      /**
      * `.raw` can get the raw Request object.
      *
      * @see {@link https://hono.dev/docs/api/request#raw}
      *
      * @example
      * ```ts
      * // For Cloudflare Workers
      * app.post('/', async (c) => {
      *   const metadata = c.req.raw.cf?.hostMetadata?
      *   ...
      * })
      * ```
      */
      raw;
      #validatedData;
      #matchResult;
      routeIndex = 0;
      /**
      * `.path` can get the pathname of the request.
      *
      * @see {@link https://hono.dev/docs/api/request#path}
      *
      * @example
      * ```ts
      * app.get('/about/me', (c) => {
      *   const pathname = c.req.path // `/about/me`
      * })
      * ```
      */
      path;
      bodyCache = {};
      constructor(request, path = "/", matchResult = [[]]) {
        this.raw = request;
        this.path = path;
        this.#matchResult = matchResult;
      }
      param(key) {
        return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
      }
      #getDecodedParam(key) {
        const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
        const param = this.#getParamValue(paramKey);
        return param && tryDecodeURIComponent(param);
      }
      #getAllDecodedParams() {
        const decoded = {};
        const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
        for (const key of keys) {
          const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
          if (value !== void 0) decoded[key] = tryDecodeURIComponent(value);
        }
        return decoded;
      }
      #getParamValue(paramKey) {
        return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
      }
      query(key) {
        return getQueryParam(this.url, key);
      }
      queries(key) {
        return getQueryParams(this.url, key);
      }
      header(name) {
        if (name) return this.raw.headers.get(name) ?? void 0;
        const headerData = /* @__PURE__ */ Object.create(null);
        this.raw.headers.forEach((value, key) => {
          headerData[key] = value;
        });
        return headerData;
      }
      async parseBody(options) {
        return parseBody(this, options);
      }
      #cachedBody = /* @__PURE__ */ __name((key) => {
        const { bodyCache, raw: raw2 } = this;
        const cachedBody = bodyCache[key];
        if (cachedBody) return cachedBody;
        for (const anyCachedKey in bodyCache) return bodyCache[anyCachedKey].then((body) => {
          if (anyCachedKey === "json") body = JSON.stringify(body);
          const contentType = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
          return new Response(body, { headers: contentType ? { "Content-Type": contentType } : void 0 })[key]();
        });
        return bodyCache[key] = raw2[key]();
      }, "#cachedBody");
      /**
      * `.json()` can parse Request body of type `application/json`
      *
      * @see {@link https://hono.dev/docs/api/request#json}
      *
      * @example
      * ```ts
      * app.post('/entry', async (c) => {
      *   const body = await c.req.json()
      * })
      * ```
      */
      json() {
        return this.#cachedBody("text").then((text) => JSON.parse(text));
      }
      /**
      * `.text()` can parse Request body of type `text/plain`
      *
      * @see {@link https://hono.dev/docs/api/request#text}
      *
      * @example
      * ```ts
      * app.post('/entry', async (c) => {
      *   const body = await c.req.text()
      * })
      * ```
      */
      text() {
        return this.#cachedBody("text");
      }
      /**
      * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
      *
      * @see {@link https://hono.dev/docs/api/request#arraybuffer}
      *
      * @example
      * ```ts
      * app.post('/entry', async (c) => {
      *   const body = await c.req.arrayBuffer()
      * })
      * ```
      */
      arrayBuffer() {
        return this.#cachedBody("arrayBuffer");
      }
      /**
      * `.bytes()` parses the request body as a `Uint8Array`.
      *
      * @see {@link https://hono.dev/docs/api/request#bytes}
      *
      * @example
      * ```ts
      * app.post('/entry', async (c) => {
      *   const body = await c.req.bytes()
      * })
      * ```
      */
      bytes() {
        return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
      }
      /**
      * Parses the request body as a `Blob`.
      * @example
      * ```ts
      * app.post('/entry', async (c) => {
      *   const body = await c.req.blob();
      * });
      * ```
      * @see https://hono.dev/docs/api/request#blob
      */
      blob() {
        return this.#cachedBody("blob");
      }
      /**
      * Parses the request body as `FormData`.
      * @example
      * ```ts
      * app.post('/entry', async (c) => {
      *   const body = await c.req.formData();
      * });
      * ```
      * @see https://hono.dev/docs/api/request#formdata
      */
      formData() {
        return this.#cachedBody("formData");
      }
      /**
      * Adds validated data to the request.
      *
      * @param target - The target of the validation.
      * @param data - The validated data to add.
      */
      addValidatedData(target, data) {
        (this.#validatedData ??= {})[target] = data;
      }
      valid(target) {
        return this.#validatedData?.[target];
      }
      /**
      * `.url()` can get the request url strings.
      *
      * @see {@link https://hono.dev/docs/api/request#url}
      *
      * @example
      * ```ts
      * app.get('/about/me', (c) => {
      *   const url = c.req.url // `http://localhost:8787/about/me`
      *   ...
      * })
      * ```
      */
      get url() {
        return this.raw.url;
      }
      /**
      * `.method()` can get the method name of the request.
      *
      * @see {@link https://hono.dev/docs/api/request#method}
      *
      * @example
      * ```ts
      * app.get('/about/me', (c) => {
      *   const method = c.req.method // `GET`
      * })
      * ```
      */
      get method() {
        return this.raw.method;
      }
      get [GET_MATCH_RESULT]() {
        return this.#matchResult;
      }
      /**
      * `.matchedRoutes()` can return a matched route in the handler
      *
      * @deprecated
      *
      * Use matchedRoutes helper defined in "hono/route" instead.
      *
      * @see {@link https://hono.dev/docs/api/request#matchedroutes}
      *
      * @example
      * ```ts
      * app.use('*', async function logger(c, next) {
      *   await next()
      *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
      *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
      *     console.log(
      *       method,
      *       ' ',
      *       path,
      *       ' '.repeat(Math.max(10 - path.length, 0)),
      *       name,
      *       i === c.req.routeIndex ? '<- respond from here' : ''
      *     )
      *   })
      * })
      * ```
      */
      get matchedRoutes() {
        return this.#matchResult[0].map(([[, route]]) => route);
      }
      /**
      * `routePath()` can retrieve the path registered within the handler
      *
      * @deprecated
      *
      * Use routePath helper defined in "hono/route" instead.
      *
      * @see {@link https://hono.dev/docs/api/request#routepath}
      *
      * @example
      * ```ts
      * app.get('/posts/:id', (c) => {
      *   return c.json({ path: c.req.routePath })
      * })
      * ```
      */
      get routePath() {
        return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
      }
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase, raw, resolveCallback;
var init_html = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/html.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    HtmlEscapedCallbackPhase = {
      Stringify: 1,
      BeforeStream: 2,
      Stream: 3
    };
    raw = /* @__PURE__ */ __name((value, callbacks) => {
      const escapedString = new String(value);
      escapedString.isEscaped = true;
      escapedString.callbacks = callbacks;
      return escapedString;
    }, "raw");
    resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
      if (typeof str === "object" && !(str instanceof String)) {
        if (!(str instanceof Promise)) str = str.toString();
        if (str instanceof Promise) str = await str;
      }
      const callbacks = str.callbacks;
      if (!callbacks?.length) return Promise.resolve(str);
      if (buffer) buffer[0] += str;
      else buffer = [str];
      const resStr = Promise.all(callbacks.map((c) => c({
        phase,
        buffer,
        context: context2
      }))).then((res) => Promise.all(res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))).then(() => buffer[0]));
      if (preserveCallbacks) return raw(await resStr, callbacks);
      else return resStr;
    }, "resolveCallback");
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/context.js
var TEXT_PLAIN, setDefaultContentType, createResponseInstance, Context;
var init_context = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/context.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_request();
    init_html();
    TEXT_PLAIN = "text/plain; charset=UTF-8";
    setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
      return {
        "Content-Type": contentType,
        ...headers
      };
    }, "setDefaultContentType");
    createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
    Context = class {
      static {
        __name(this, "Context");
      }
      #rawRequest;
      #req;
      /**
      * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
      *
      * @see {@link https://hono.dev/docs/api/context#env}
      *
      * @example
      * ```ts
      * // Environment object for Cloudflare Workers
      * app.get('*', async c => {
      *   const counter = c.env.COUNTER
      * })
      * ```
      */
      env = {};
      #var;
      finalized = false;
      /**
      * `.error` can get the error object from the middleware if the Handler throws an error.
      *
      * @see {@link https://hono.dev/docs/api/context#error}
      *
      * @example
      * ```ts
      * app.use('*', async (c, next) => {
      *   await next()
      *   if (c.error) {
      *     // do something...
      *   }
      * })
      * ```
      */
      error;
      #status;
      #executionCtx;
      #res;
      #layout;
      #renderer;
      #notFoundHandler;
      #preparedHeaders;
      #matchResult;
      #path;
      /**
      * Creates an instance of the Context class.
      *
      * @param req - The Request object.
      * @param options - Optional configuration options for the context.
      */
      constructor(req, options) {
        this.#rawRequest = req;
        if (options) {
          this.#executionCtx = options.executionCtx;
          this.env = options.env;
          this.#notFoundHandler = options.notFoundHandler;
          this.#path = options.path;
          this.#matchResult = options.matchResult;
        }
      }
      /**
      * `.req` is the instance of {@link HonoRequest}.
      */
      get req() {
        this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
        return this.#req;
      }
      /**
      * @see {@link https://hono.dev/docs/api/context#event}
      * The FetchEvent associated with the current request.
      *
      * @throws Will throw an error if the context does not have a FetchEvent.
      */
      get event() {
        if (this.#executionCtx && "respondWith" in this.#executionCtx) return this.#executionCtx;
        else throw Error("This context has no FetchEvent");
      }
      /**
      * @see {@link https://hono.dev/docs/api/context#executionctx}
      * The ExecutionContext associated with the current request.
      *
      * @throws Will throw an error if the context does not have an ExecutionContext.
      */
      get executionCtx() {
        if (this.#executionCtx) return this.#executionCtx;
        else throw Error("This context has no ExecutionContext");
      }
      /**
      * @see {@link https://hono.dev/docs/api/context#res}
      * The Response object for the current request.
      */
      get res() {
        return this.#res ||= createResponseInstance(null, { headers: this.#preparedHeaders ??= new Headers() });
      }
      /**
      * Sets the Response object for the current request.
      *
      * @param _res - The Response object to set.
      */
      set res(_res) {
        if (this.#res && _res) {
          _res = createResponseInstance(_res.body, _res);
          for (const [k, v] of this.#res.headers.entries()) {
            if (k === "content-type") continue;
            if (k === "set-cookie") {
              const cookies = this.#res.headers.getSetCookie();
              _res.headers.delete("set-cookie");
              for (const cookie of cookies) _res.headers.append("set-cookie", cookie);
            } else _res.headers.set(k, v);
          }
        }
        this.#res = _res;
        this.finalized = true;
      }
      /**
      * `.render()` can create a response within a layout.
      *
      * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
      *
      * @example
      * ```ts
      * app.get('/', (c) => {
      *   return c.render('Hello!')
      * })
      * ```
      */
      render = /* @__PURE__ */ __name((...args) => {
        this.#renderer ??= (content) => this.html(content);
        return this.#renderer(...args);
      }, "render");
      /**
      * Sets the layout for the response.
      *
      * @param layout - The layout to set.
      * @returns The layout function.
      */
      setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
      /**
      * Gets the current layout for the response.
      *
      * @returns The current layout function.
      */
      getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
      /**
      * `.setRenderer()` can set the layout in the custom middleware.
      *
      * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
      *
      * @example
      * ```tsx
      * app.use('*', async (c, next) => {
      *   c.setRenderer((content) => {
      *     return c.html(
      *       <html>
      *         <body>
      *           <p>{content}</p>
      *         </body>
      *       </html>
      *     )
      *   })
      *   await next()
      * })
      * ```
      */
      setRenderer = /* @__PURE__ */ __name((renderer) => {
        this.#renderer = renderer;
      }, "setRenderer");
      /**
      * `.header()` can set headers.
      *
      * @see {@link https://hono.dev/docs/api/context#header}
      *
      * @example
      * ```ts
      * app.get('/welcome', (c) => {
      *   // Set headers
      *   c.header('X-Message', 'Hello!')
      *   c.header('Content-Type', 'text/plain')
      *
      *   // Append multiple headers using the append option (e.g. Vary)
      *   c.header('Vary', 'Accept-Encoding', { append: true })
      *   c.header('Vary', 'User-Agent', { append: true })
      *
      *   return c.body('Thank you for coming')
      * })
      * ```
      */
      header = /* @__PURE__ */ __name((name, value, options) => {
        if (this.finalized) this.#res = createResponseInstance(this.#res.body, this.#res);
        const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
        if (value === void 0) headers.delete(name);
        else if (options?.append) headers.append(name, value);
        else headers.set(name, value);
      }, "header");
      status = /* @__PURE__ */ __name((status) => {
        this.#status = status;
      }, "status");
      /**
      * `.set()` can set the value specified by the key.
      *
      * @see {@link https://hono.dev/docs/api/context#set-get}
      *
      * @example
      * ```ts
      * app.use('*', async (c, next) => {
      *   c.set('message', 'Hono is hot!!')
      *   await next()
      * })
      * ```
      */
      set = /* @__PURE__ */ __name((key, value) => {
        this.#var ??= /* @__PURE__ */ new Map();
        this.#var.set(key, value);
      }, "set");
      /**
      * `.get()` can use the value specified by the key.
      *
      * @see {@link https://hono.dev/docs/api/context#set-get}
      *
      * @example
      * ```ts
      * app.get('/', (c) => {
      *   const message = c.get('message')
      *   return c.text(`The message is "${message}"`)
      * })
      * ```
      */
      get = /* @__PURE__ */ __name((key) => {
        return this.#var ? this.#var.get(key) : void 0;
      }, "get");
      /**
      * `.var` can access the value of a variable.
      *
      * @see {@link https://hono.dev/docs/api/context#var}
      *
      * @example
      * ```ts
      * const result = c.var.client.oneMethod()
      * ```
      */
      get var() {
        if (!this.#var) return {};
        return Object.fromEntries(this.#var);
      }
      #newResponse(data, arg, headers) {
        let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
        if (typeof arg === "object" && arg.headers) {
          responseHeaders ??= new Headers();
          for (const [key, value] of new Headers(arg.headers)) if (key === "set-cookie") responseHeaders.append(key, value);
          else responseHeaders.set(key, value);
        }
        if (headers) {
          if (!responseHeaders) {
            let count3 = 0;
            for (const k in headers) if (++count3 > 1 || typeof headers[k] !== "string") {
              responseHeaders = new Headers();
              break;
            }
          }
          if (responseHeaders) for (const k in headers) {
            const v = headers[k];
            if (typeof v === "string") responseHeaders.set(k, v);
            else {
              responseHeaders.delete(k);
              for (const v2 of v) responseHeaders.append(k, v2);
            }
          }
        }
        const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
        return createResponseInstance(data, {
          status,
          headers: responseHeaders ?? headers
        });
      }
      newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
      /**
      * `.body()` can return the HTTP response.
      * You can set headers with `.header()` and set HTTP status code with `.status`.
      * This can also be set in `.text()`, `.json()` and so on.
      *
      * @see {@link https://hono.dev/docs/api/context#body}
      *
      * @example
      * ```ts
      * app.get('/welcome', (c) => {
      *   // Set headers
      *   c.header('X-Message', 'Hello!')
      *   c.header('Content-Type', 'text/plain')
      *   // Set HTTP status code
      *   c.status(201)
      *
      *   // Return the response body
      *   return c.body('Thank you for coming')
      * })
      * ```
      */
      body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
      /**
      * `.text()` can render text as `Content-Type:text/plain`.
      *
      * @see {@link https://hono.dev/docs/api/context#text}
      *
      * @example
      * ```ts
      * app.get('/say', (c) => {
      *   return c.text('Hello!')
      * })
      * ```
      */
      text = /* @__PURE__ */ __name((text, arg, headers) => {
        return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(text, arg, setDefaultContentType(TEXT_PLAIN, headers));
      }, "text");
      /**
      * `.json()` can render JSON as `Content-Type:application/json`.
      *
      * @see {@link https://hono.dev/docs/api/context#json}
      *
      * @example
      * ```ts
      * app.get('/api', (c) => {
      *   return c.json({ message: 'Hello!' })
      * })
      * ```
      */
      json = /* @__PURE__ */ __name((object, arg, headers) => {
        return this.#newResponse(JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
      }, "json");
      html = /* @__PURE__ */ __name((html, arg, headers) => {
        const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
        return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
      }, "html");
      /**
      * `.redirect()` can Redirect, default status code is 302.
      *
      * @see {@link https://hono.dev/docs/api/context#redirect}
      *
      * @example
      * ```ts
      * app.get('/redirect', (c) => {
      *   return c.redirect('/')
      * })
      * app.get('/redirect-permanently', (c) => {
      *   return c.redirect('/', 301)
      * })
      * ```
      */
      redirect = /* @__PURE__ */ __name((location, status) => {
        const locationString = String(location);
        this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
        return this.newResponse(null, status ?? 302);
      }, "redirect");
      /**
      * `.notFound()` can return the Not Found Response.
      *
      * @see {@link https://hono.dev/docs/api/context#notfound}
      *
      * @example
      * ```ts
      * app.get('/notfound', (c) => {
      *   return c.notFound()
      * })
      * ```
      */
      notFound = /* @__PURE__ */ __name(() => {
        this.#notFoundHandler ??= () => createResponseInstance();
        return this.#notFoundHandler(this);
      }, "notFound");
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/compose.js
var compose;
var init_compose = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/compose.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
      return (context2, next) => {
        let index = -1;
        return dispatch(0);
        async function dispatch(i) {
          if (i <= index) throw new Error("next() called multiple times");
          index = i;
          let res;
          let isError = false;
          let handler;
          if (middleware[i]) {
            handler = middleware[i][0][0];
            context2.req.routeIndex = i;
          } else handler = i === middleware.length && next || void 0;
          if (handler) try {
            res = await handler(context2, () => dispatch(i + 1));
          } catch (err2) {
            if (err2 instanceof Error && onError) {
              context2.error = err2;
              res = await onError(err2, context2);
              isError = true;
            } else throw err2;
          }
          else if (context2.finalized === false && onNotFound) res = await onNotFound(context2);
          if (res && (context2.finalized === false || isError)) context2.res = res;
          return context2;
        }
        __name(dispatch, "dispatch");
      };
    }, "compose");
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router.js
var METHODS, MESSAGE_MATCHER_IS_ALREADY_BUILT, UnsupportedPathError;
var init_router = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    METHODS = [
      "get",
      "post",
      "put",
      "delete",
      "options",
      "patch",
      "query"
    ];
    MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
    UnsupportedPathError = class extends Error {
      static {
        __name(this, "UnsupportedPathError");
      }
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER;
var init_constants2 = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/constants.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    COMPOSED_HANDLER = "__COMPOSED_HANDLER";
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/hono-base.js
var notFoundHandler, errorHandler, Hono;
var init_hono_base = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/hono-base.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_compose();
    init_url();
    init_context();
    init_router();
    init_constants2();
    notFoundHandler = /* @__PURE__ */ __name((c) => {
      return c.text("404 Not Found", 404);
    }, "notFoundHandler");
    errorHandler = /* @__PURE__ */ __name((err2, c) => {
      if ("getResponse" in err2) {
        const res = err2.getResponse();
        return c.newResponse(res.body, res);
      }
      console.error(err2);
      return c.text("Internal Server Error", 500);
    }, "errorHandler");
    Hono = class Hono2 {
      static {
        __name(this, "Hono");
      }
      get;
      post;
      put;
      delete;
      options;
      patch;
      query;
      all;
      on;
      use;
      router;
      getPath;
      _basePath = "/";
      #path = "/";
      routes = [];
      constructor(options = {}) {
        [...METHODS, "all"].forEach((method) => {
          this[method] = (args1, ...args) => {
            const methodName = method.toUpperCase();
            if (typeof args1 === "string") this.#path = args1;
            else this.#addRoute(methodName, this.#path, args1);
            args.forEach((handler) => {
              this.#addRoute(methodName, this.#path, handler);
            });
            return this;
          };
        });
        this.on = (method, path, ...handlers) => {
          for (const p of [path].flat()) {
            this.#path = p;
            for (const m of [method].flat()) {
              const methodName = m.toUpperCase();
              for (const handler of handlers) this.#addRoute(methodName, this.#path, handler);
            }
          }
          return this;
        };
        this.use = (arg1, ...handlers) => {
          if (typeof arg1 === "string") this.#path = arg1;
          else {
            this.#path = "*";
            handlers.unshift(arg1);
          }
          handlers.forEach((handler) => {
            this.#addRoute("ALL", this.#path, handler);
          });
          return this;
        };
        const { strict, ...optionsWithoutStrict } = options;
        Object.assign(this, optionsWithoutStrict);
        this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
      }
      #clone() {
        const clone = new Hono2({
          router: this.router,
          getPath: this.getPath
        });
        clone.errorHandler = this.errorHandler;
        clone.#notFoundHandler = this.#notFoundHandler;
        clone.routes = this.routes;
        return clone;
      }
      #notFoundHandler = notFoundHandler;
      errorHandler = errorHandler;
      /**
      * `.route()` allows grouping other Hono instance in routes.
      *
      * @see {@link https://hono.dev/docs/api/routing#grouping}
      *
      * @param {string} path - base Path
      * @param {Hono} app - other Hono instance
      * @returns {Hono} routed Hono instance
      *
      * @example
      * ```ts
      * const app = new Hono()
      * const app2 = new Hono()
      *
      * app2.get("/user", (c) => c.text("user"))
      * app.route("/api", app2) // GET /api/user
      * ```
      */
      route(path, app2) {
        const subApp = this.basePath(path);
        app2.routes.map((r) => {
          let handler;
          if (app2.errorHandler === errorHandler) handler = r.handler;
          else {
            handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
            handler[COMPOSED_HANDLER] = r.handler;
          }
          subApp.#addRoute(r.method, r.path, handler, r.basePath);
        });
        return this;
      }
      /**
      * `.basePath()` allows base paths to be specified.
      *
      * @see {@link https://hono.dev/docs/api/routing#base-path}
      *
      * @param {string} path - base Path
      * @returns {Hono} changed Hono instance
      *
      * @example
      * ```ts
      * const api = new Hono().basePath('/api')
      * ```
      */
      basePath(path) {
        const subApp = this.#clone();
        subApp._basePath = mergePath(this._basePath, path);
        return subApp;
      }
      /**
      * `.onError()` handles an error and returns a customized Response.
      *
      * @see {@link https://hono.dev/docs/api/hono#error-handling}
      *
      * @param {ErrorHandler} handler - request Handler for error
      * @returns {Hono} changed Hono instance
      *
      * @example
      * ```ts
      * app.onError((err, c) => {
      *   console.error(`${err}`)
      *   return c.text('Custom Error Message', 500)
      * })
      * ```
      */
      onError = /* @__PURE__ */ __name((handler) => {
        this.errorHandler = handler;
        return this;
      }, "onError");
      /**
      * `.notFound()` allows you to customize a Not Found Response.
      *
      * @see {@link https://hono.dev/docs/api/hono#not-found}
      *
      * @param {NotFoundHandler} handler - request handler for not-found
      * @returns {Hono} changed Hono instance
      *
      * @example
      * ```ts
      * app.notFound((c) => {
      *   return c.text('Custom 404 Message', 404)
      * })
      * ```
      */
      notFound = /* @__PURE__ */ __name((handler) => {
        this.#notFoundHandler = handler;
        return this;
      }, "notFound");
      /**
      * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
      *
      * @see {@link https://hono.dev/docs/api/hono#mount}
      *
      * @param {string} path - base Path
      * @param {Function} applicationHandler - other Request Handler
      * @param {MountOptions} [options] - options of `.mount()`
      * @returns {Hono} mounted Hono instance
      *
      * @example
      * ```ts
      * import { Router as IttyRouter } from 'itty-router'
      * import { Hono } from 'hono'
      * // Create itty-router application
      * const ittyRouter = IttyRouter()
      * // GET /itty-router/hello
      * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
      *
      * const app = new Hono()
      * app.mount('/itty-router', ittyRouter.handle)
      * ```
      *
      * @example
      * ```ts
      * const app = new Hono()
      * // Send the request to another application without modification.
      * app.mount('/app', anotherApp, {
      *   replaceRequest: (req) => req,
      * })
      * ```
      */
      mount(path, applicationHandler, options) {
        let replaceRequest;
        let optionHandler;
        if (options) {
          if (typeof options === "function") optionHandler = options;
          else {
            optionHandler = options.optionHandler;
            if (options.replaceRequest === false) replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
            else replaceRequest = options.replaceRequest;
          }
        }
        const getOptions = optionHandler ? (c) => {
          const options2 = optionHandler(c);
          return Array.isArray(options2) ? options2 : [options2];
        } : (c) => {
          let executionContext = void 0;
          try {
            executionContext = c.executionCtx;
          } catch {
          }
          return [c.env, executionContext];
        };
        replaceRequest ||= (() => {
          const mergedPath = mergePath(this._basePath, path);
          const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
          return (request) => {
            const url = new URL(request.url);
            url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
            return new Request(url, request);
          };
        })();
        const handler = /* @__PURE__ */ __name(async (c, next) => {
          const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
          if (res) return res;
          await next();
        }, "handler");
        this.#addRoute("ALL", mergePath(path, "*"), handler);
        return this;
      }
      #addRoute(method, path, handler, baseRoutePath) {
        path = mergePath(this._basePath, path);
        const r = {
          basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
          path,
          method,
          handler
        };
        this.router.add(method, path, [handler, r]);
        this.routes.push(r);
      }
      #handleError(err2, c) {
        if (err2 instanceof Error) return this.errorHandler(err2, c);
        throw err2;
      }
      #dispatch(request, executionCtx, env2, method) {
        if (method === "HEAD") return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
        const path = this.getPath(request, { env: env2 });
        const matchResult = this.router.match(method, path);
        const c = new Context(request, {
          path,
          matchResult,
          env: env2,
          executionCtx,
          notFoundHandler: this.#notFoundHandler
        });
        if (matchResult[0].length === 1) {
          let res;
          try {
            res = matchResult[0][0][0][0](c, async () => {
              c.res = await this.#notFoundHandler(c);
            });
          } catch (err2) {
            return this.#handleError(err2, c);
          }
          return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))).catch((err2) => this.#handleError(err2, c)) : res ?? this.#notFoundHandler(c);
        }
        const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
        return (async () => {
          try {
            const context2 = await composed(c);
            if (!context2.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
            return context2.res;
          } catch (err2) {
            return this.#handleError(err2, c);
          }
        })();
      }
      /**
      * `.fetch()` will be entry point of your app.
      *
      * @see {@link https://hono.dev/docs/api/hono#fetch}
      *
      * @param {Request} request - request Object of request
      * @param {Env} env - env Object
      * @param {ExecutionContext} executionCtx - context of execution
      * @returns {Response | Promise<Response>} response of request
      *
      */
      fetch = /* @__PURE__ */ __name((request, ...rest) => {
        return this.#dispatch(request, rest[1], rest[0], request.method);
      }, "fetch");
      /**
      * `.request()` is a useful method for testing.
      * You can pass a URL or pathname to send a GET request.
      * app will return a Response object.
      * ```ts
      * test('GET /hello is ok', async () => {
      *   const res = await app.request('/hello')
      *   expect(res.status).toBe(200)
      * })
      * ```
      * @see https://hono.dev/docs/api/hono#request
      */
      request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
        if (input instanceof Request) return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
        input = input.toString();
        return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
      }, "request");
      /**
      * `.fire()` automatically adds a global fetch event listener.
      * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
      * @deprecated
      * Use `fire` from `hono/service-worker` instead.
      * ```ts
      * import { Hono } from 'hono'
      * import { fire } from 'hono/service-worker'
      *
      * const app = new Hono()
      * // ...
      * fire(app)
      * ```
      * @see https://hono.dev/docs/api/hono#fire
      * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
      * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
      */
      fire = /* @__PURE__ */ __name(() => {
        addEventListener("fetch", (event) => {
          event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
        });
      }, "fire");
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/utils.js
var createNullObject;
var init_utils2 = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/utils.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    createNullObject = /* @__PURE__ */ __name(() => /* @__PURE__ */ Object.create(null), "createNullObject");
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/matcher.js
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers["ALL"];
    const staticMatch = matcher[2][path2];
    if (staticMatch) return staticMatch;
    const match3 = path2.match(matcher[0]);
    if (!match3) return [[], emptyParam];
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match");
  this.match = match2;
  return match2(method, path);
}
var emptyParam;
var init_matcher = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/matcher.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_router();
    emptyParam = [];
    __name(match, "match");
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/node.js
function compareKey(a, b) {
  if (a.length === 1) return b.length === 1 ? a < b ? -1 : 1 : -1;
  if (b.length === 1) return 1;
  if (a === ".*" || a === "(?:|/.*)") return b === "(?:|/.*)" ? -1 : 1;
  else if (b === ".*" || b === "(?:|/.*)") return -1;
  if (a === "[^/]+") return 1;
  else if (b === "[^/]+") return -1;
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var LABEL_REG_EXP_STR, TAIL_WILDCARD_REG_EXP_STR, PATH_ERROR, regExpMetaChars, Node;
var init_node = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/node.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils2();
    LABEL_REG_EXP_STR = "[^/]+";
    TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
    PATH_ERROR = /* @__PURE__ */ Symbol();
    regExpMetaChars = /* @__PURE__ */ new Set(".\\+*[^]$()");
    __name(compareKey, "compareKey");
    Node = class Node2 {
      static {
        __name(this, "Node");
      }
      #index;
      #varIndex;
      #children = createNullObject();
      insert(tokens, index, paramMap, context2, isStatic) {
        let node = this;
        for (let i = 0, len = tokens.length; i < len; i++) {
          const token = tokens[i];
          const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? [
            "",
            "",
            ".*"
          ] : [
            "",
            "",
            LABEL_REG_EXP_STR
          ] : null : token === "/*" ? [
            "",
            "",
            TAIL_WILDCARD_REG_EXP_STR
          ] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
          let nextNode;
          if (pattern) {
            const name = pattern[1];
            let regexpStr = pattern[2] || "[^/]+";
            if (name && pattern[2]) {
              if (regexpStr === ".*") throw PATH_ERROR;
              regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
              if (/\((?!\?:)/.test(regexpStr)) throw PATH_ERROR;
              if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) throw PATH_ERROR;
            }
            nextNode = node.#children[regexpStr];
            if (!nextNode) {
              if (regexpStr !== ".*" && regexpStr !== "(?:|/.*)") {
                for (const k in node.#children) if ((regexpStr.length > 1 || k.length > 1) && k !== ".*" && k !== "(?:|/.*)") throw PATH_ERROR;
              }
              nextNode = node.#children[regexpStr] = new Node2();
            }
            if (name !== "") {
              nextNode.#varIndex ??= context2.varIndex++;
              paramMap.push([name, nextNode.#varIndex]);
            }
          } else {
            nextNode = node.#children[token];
            if (!nextNode) {
              for (const k in node.#children) if (k.length > 1 && k !== ".*" && k !== "(?:|/.*)") throw PATH_ERROR;
              nextNode = node.#children[token] = new Node2();
            }
          }
          node = nextNode;
        }
        if (node.#index !== void 0) throw PATH_ERROR;
        node.#index = isStatic ? -1 : index;
      }
      buildRegExpStr() {
        const strList = Object.keys(this.#children).sort(compareKey).map((k) => {
          const c = this.#children[k];
          const childStr = c.buildRegExpStr();
          return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
        }).filter(Boolean);
        if (typeof this.#index === "number" && this.#index !== -1) strList.unshift(`#${this.#index}`);
        if (strList.length === 0) return "";
        if (strList.length === 1) return strList[0];
        return "(?:" + strList.join("|") + ")";
      }
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie;
var init_trie = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/trie.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils2();
    init_node();
    Trie = class {
      static {
        __name(this, "Trie");
      }
      #context = { varIndex: 0 };
      #root = new Node();
      #index = 0;
      paths = createNullObject();
      insert(path, isStatic) {
        if (isStatic) {
          this.#root.insert(path.split(""), 0, [], this.#context, true);
          return;
        }
        const paramAssoc = [];
        const groups = [];
        let markedPath = path;
        for (let i = 0; ; ) {
          let replaced = false;
          markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
            const mark = `@\\${i}`;
            groups[i] = [mark, m];
            i++;
            replaced = true;
            return mark;
          });
          if (!replaced) break;
        }
        const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
        for (let i = groups.length - 1; i >= 0; i--) {
          const [mark] = groups[i];
          for (let j = tokens.length - 1; j >= 0; j--) if (tokens[j].indexOf(mark) !== -1) {
            tokens[j] = tokens[j].replace(mark, groups[i][1]);
            break;
          }
        }
        this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
        this.paths[path] = [this.#index++, paramAssoc];
      }
      buildRegExp() {
        let regexp = this.#root.buildRegExpStr();
        if (regexp === "") return [
          /^$/,
          [],
          []
        ];
        let captureIndex = 0;
        const indexReplacementMap = [];
        const paramReplacementMap = [];
        regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
          if (handlerIndex !== void 0) {
            indexReplacementMap[++captureIndex] = Number(handlerIndex);
            return "$()";
          }
          if (paramIndex !== void 0) {
            paramReplacementMap[Number(paramIndex)] = ++captureIndex;
            return "";
          }
          return "";
        });
        return [
          new RegExp(`^${regexp}`),
          indexReplacementMap,
          paramReplacementMap
        ];
      }
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/router.js
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(`^${path.replace(/\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g, (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ".*" : `/:${LABEL_REG_EXP_STR}`)}$`);
}
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) if (buildWildcardRegExp(k).test(path)) return [...middleware[k]];
}
var wildcardRegExpCache, RegExpRouter;
var init_router2 = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/router.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_url();
    init_router();
    init_utils2();
    init_matcher();
    init_node();
    init_trie();
    wildcardRegExpCache = createNullObject();
    __name(buildWildcardRegExp, "buildWildcardRegExp");
    __name(findMiddleware, "findMiddleware");
    RegExpRouter = class {
      static {
        __name(this, "RegExpRouter");
      }
      name = "RegExpRouter";
      #middleware;
      #routes;
      #tries;
      constructor() {
        this.#middleware = { ["ALL"]: createNullObject() };
        this.#routes = { ["ALL"]: createNullObject() };
        this.#tries = { ["ALL"]: new Trie() };
      }
      #insertPath(method, path) {
        try {
          this.#tries[method].insert(path, !/\*|\/:/.test(path));
        } catch (e) {
          throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
        }
      }
      add(method, path, handler) {
        const middleware = this.#middleware;
        const routes = this.#routes;
        if (!middleware) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
        if (!middleware[method]) {
          this.#tries[method] = new Trie();
          for (const handlerMap of [middleware, routes]) {
            handlerMap[method] = createNullObject();
            for (const p in handlerMap["ALL"]) {
              handlerMap[method][p] = [...handlerMap["ALL"][p]];
              this.#insertPath(method, p);
            }
          }
        }
        if (path === "/*") path = "*";
        const methods = method === "ALL" ? Object.keys(middleware) : [method];
        if (/\*$/.test(path)) {
          const re = buildWildcardRegExp(path);
          for (const m of methods) if (!middleware[m][path]) {
            this.#insertPath(m, path);
            middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware["ALL"], path) || [];
          }
          for (const handlerMap of [middleware, routes]) for (const m of methods) for (const p in handlerMap[m]) re.test(p) && handlerMap[m][p].push([handler, path]);
          return;
        }
        const paths = checkOptionalParameter(path) || [path];
        for (const path2 of paths) for (const m of methods) {
          if (!routes[m][path2]) {
            this.#insertPath(m, path2);
            routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware["ALL"], path2) || [];
          }
          routes[m][path2].push([handler, path2]);
        }
      }
      match = match;
      buildAllMatchers() {
        const matchers = createNullObject();
        for (const method of Object.keys(this.#routes)) matchers[method] = this.#buildMatcher(method);
        this.#middleware = this.#routes = this.#tries = void 0;
        wildcardRegExpCache = createNullObject();
        return matchers;
      }
      #buildMatcher(method) {
        const middleware = this.#middleware[method];
        const routes = this.#routes[method];
        const trie = this.#tries[method];
        const staticMap = createNullObject();
        const handlerData = [];
        const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
        for (const r of [middleware, routes]) for (const path in r) {
          const handlers = r[path];
          const pathData = trie.paths[path];
          if (!pathData) {
            staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
            continue;
          }
          handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [h, trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
            map[key] = paramReplacementMap[pathData[1][i][1]];
            return map;
          }, createNullObject())]);
        }
        return [
          regexp,
          indexReplacementMap.map((i) => handlerData[i]),
          staticMap
        ];
      }
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/prepared-router.js
var init_prepared_router = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/prepared-router.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_router();
    init_matcher();
    init_router2();
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/index.js
var init_reg_exp_router = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/reg-exp-router/index.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_router2();
    init_prepared_router();
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter;
var init_router3 = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/smart-router/router.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_router();
    SmartRouter = class {
      static {
        __name(this, "SmartRouter");
      }
      name = "SmartRouter";
      #routers = [];
      #routes = [];
      constructor(init) {
        this.#routers = init.routers;
      }
      add(method, path, handler) {
        if (!this.#routes) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
        this.#routes.push([
          method,
          path,
          handler
        ]);
      }
      match(method, path) {
        if (!this.#routes) throw new Error("Fatal error");
        const routers = this.#routers;
        const routes = this.#routes;
        const len = routers.length;
        let i = 0;
        let res;
        for (; i < len; i++) {
          const router = routers[i];
          try {
            for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) router.add(...routes[i2]);
            res = router.match(method, path);
          } catch (e) {
            if (e instanceof UnsupportedPathError) continue;
            throw e;
          }
          this.match = router.match.bind(router);
          this.#routers = [router];
          this.#routes = void 0;
          break;
        }
        if (i === len) throw new Error("Fatal error");
        this.name = `SmartRouter + ${this.activeRouter.name}`;
        return res;
      }
      get activeRouter() {
        if (this.#routes || this.#routers.length !== 1) throw new Error("No active router has been determined yet.");
        return this.#routers[0];
      }
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/trie-router/node.js
var emptyParams, order, Node3;
var init_node2 = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/trie-router/node.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_url();
    init_router();
    init_utils2();
    emptyParams = createNullObject();
    order = 0;
    Node3 = class Node4 {
      static {
        __name(this, "Node");
      }
      #methods = [];
      #children = createNullObject();
      #patterns = [];
      #pattern;
      #params = emptyParams;
      insert(method, path, handler) {
        let curNode = this;
        const parts = splitRoutingPath(path);
        const possibleKeys = /* @__PURE__ */ new Set();
        let i = 0;
        for (const p of parts) {
          const nextP = parts[++i];
          const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
          const isParam = Array.isArray(pattern);
          const key = isParam ? pattern[0] : pattern || p;
          const child = curNode.#children[key] ||= new Node4();
          if (pattern && !child.#pattern) {
            child.#pattern = pattern;
            curNode.#patterns.push(child);
          }
          curNode = child;
          if (isParam) possibleKeys.add(pattern[1]);
        }
        curNode.#methods.push({ [method]: {
          handler,
          possibleKeys: [...possibleKeys],
          score: ++order
        } });
      }
      #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
        for (let i = 0, len = node.#methods.length; i < len; i++) {
          const m = node.#methods[i];
          const handlerSet = m[method] || m["ALL"];
          if (handlerSet) {
            handlerSet.params = createNullObject();
            handlerSets.push(handlerSet);
            for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
              const key = handlerSet.possibleKeys[i2];
              handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
            }
          }
        }
      }
      search(method, path) {
        const handlerSets = [];
        this.#params = emptyParams;
        let curNodes = [this];
        const parts = splitPath(path);
        const curNodesQueue = [];
        const len = parts.length;
        let partOffsets = null;
        for (let i = 0; i < len; i++) {
          const part = parts[i];
          const isLast = i === len - 1;
          const tempNodes = [];
          for (let j = 0, len2 = curNodes.length; j < len2; j++) {
            const node = curNodes[j];
            const nextNode = node.#children[part];
            if (nextNode) {
              nextNode.#params = node.#params;
              if (isLast) {
                if (nextNode.#children["*"]) this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
                this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
              } else tempNodes.push(nextNode);
            }
            for (const child of node.#patterns) {
              const pattern = child.#pattern;
              const params = node.#params === emptyParams ? {} : { ...node.#params };
              if (typeof pattern === "string") {
                if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
                  this.#pushHandlerSets(handlerSets, child, method, node.#params);
                  if (pattern === "*") {
                    child.#params = params;
                    tempNodes.push(child);
                  }
                }
                continue;
              }
              const [, name, matcher] = pattern;
              if (!part && matcher === true) continue;
              if (matcher !== true) {
                if (!partOffsets) {
                  partOffsets = [];
                  let offset = path[0] === "/" ? 1 : 0;
                  for (let p = 0; p < len; p++) {
                    partOffsets[p] = offset;
                    offset += parts[p].length + 1;
                  }
                }
                const restPathString = path.slice(partOffsets[i]);
                const m = matcher.exec(restPathString);
                if (m) {
                  params[name] = m[0];
                  this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
                  if (m[0].length === restPathString.length && child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, node.#params, params);
                  for (const _ in child.#children) {
                    child.#params = params;
                    const componentCount = m[0].match(/\//g)?.length ?? 0;
                    (curNodesQueue[componentCount] ||= []).push(child);
                    break;
                  }
                  continue;
                }
              }
              if (matcher === true || matcher.test(part)) {
                params[name] = part;
                if (isLast) {
                  this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
                  if (child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, params, node.#params);
                } else {
                  child.#params = params;
                  tempNodes.push(child);
                }
              }
            }
          }
          const shifted = curNodesQueue.shift();
          curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
        }
        if (handlerSets[1]) handlerSets.sort((a, b) => {
          return a.score - b.score;
        });
        return [handlerSets.map(({ handler, params }) => [handler, params])];
      }
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter;
var init_router4 = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/trie-router/router.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_url();
    init_node2();
    TrieRouter = class {
      static {
        __name(this, "TrieRouter");
      }
      name = "TrieRouter";
      #node = new Node3();
      add(method, path, handler) {
        for (const result of checkOptionalParameter(path) || [path]) this.#node.insert(method, result, handler);
      }
      match(method, path) {
        return this.#node.search(method, path);
      }
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/trie-router/index.js
var init_trie_router = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/router/trie-router/index.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_router4();
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/hono.js
var Hono3;
var init_hono = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/hono.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hono_base();
    init_router2();
    init_reg_exp_router();
    init_router3();
    init_router4();
    init_trie_router();
    Hono3 = class extends Hono {
      static {
        __name(this, "Hono");
      }
      /**
      * Creates an instance of the Hono class.
      *
      * @param options - Optional configuration options for the Hono instance.
      */
      constructor(options = {}) {
        super(options);
        this.router = options.router ?? new SmartRouter({ routers: [new RegExpRouter(), new TrieRouter()] });
      }
    };
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/index.js
var init_dist = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/index.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_context();
    init_hono();
  }
});

// packages/shared/src/domain/result.ts
var ok, err;
var init_result = __esm({
  "packages/shared/src/domain/result.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ok = /* @__PURE__ */ __name((value) => ({ ok: true, value }), "ok");
    err = /* @__PURE__ */ __name((error3) => ({ ok: false, error: error3 }), "err");
  }
});

// packages/shared/src/domain/money.ts
function divRound(a, b) {
  if (b === 0n) throw new RangeError("division by zero");
  const neg = a < 0n !== b < 0n;
  const aa = a < 0n ? -a : a;
  const bb = b < 0n ? -b : b;
  const q = (aa * 2n + bb) / (bb * 2n);
  return neg ? -q : q;
}
function parseQty(input, decimals) {
  const normalized = toWesternDigits(input).replace("\u066B", ".").replace(",", ".").trim();
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  const neg = normalized.startsWith("-");
  const [intPart = "0", fracPart = ""] = normalized.replace("-", "").split(".");
  const frac = (fracPart + "0000").slice(0, 4);
  let v = BigInt(intPart) * QTY_SCALE_N + BigInt(frac);
  const step = 10n ** BigInt(4 - Math.max(0, Math.min(4, decimals)));
  v = divRound(v, step) * step;
  return qtyE4(Number(neg ? -v : v));
}
function toWesternDigits(s) {
  return s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
}
var QTY_SCALE, QTY_SCALE_N, minor, qtyE4, qtyToDb, qtyFromDb;
var init_money = __esm({
  "packages/shared/src/domain/money.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    QTY_SCALE = 1e4;
    QTY_SCALE_N = 10000n;
    minor = /* @__PURE__ */ __name((n) => {
      if (!Number.isSafeInteger(n)) throw new RangeError(`minor must be a safe integer: ${n}`);
      return n;
    }, "minor");
    qtyE4 = /* @__PURE__ */ __name((n) => {
      if (!Number.isSafeInteger(n)) throw new RangeError(`qtyE4 must be a safe integer: ${n}`);
      return n;
    }, "qtyE4");
    __name(divRound, "divRound");
    __name(parseQty, "parseQty");
    qtyToDb = /* @__PURE__ */ __name((q) => Number((q / QTY_SCALE).toFixed(4)), "qtyToDb");
    qtyFromDb = /* @__PURE__ */ __name((r) => qtyE4(Math.round(r * QTY_SCALE)), "qtyFromDb");
    __name(toWesternDigits, "toWesternDigits");
  }
});

// packages/shared/src/domain/valuation.ts
function rateOf(qty, value, fallback) {
  if (qty <= 0) return fallback;
  return minor(Number(divRound(BigInt(value) * S, BigInt(qty))));
}
function applyInbound(state, q, unitCost) {
  if (q <= 0) throw new RangeError("inbound qty must be positive");
  const qtyAfter = qtyE4(state.qty + q);
  const inValue = divRound(BigInt(q) * BigInt(unitCost), S);
  let valueAfter;
  if (state.qty <= 0) {
    valueAfter = minor(Number(divRound(BigInt(qtyAfter) * BigInt(unitCost), S)));
  } else {
    valueAfter = minor(state.value + Number(inValue));
  }
  const rateAfter = state.qty <= 0 ? unitCost : rateOf(qtyAfter, valueAfter, unitCost);
  return { signedQty: q, unitCost, qtyAfter, rateAfter, valueAfter, valueDiff: minor(valueAfter - state.value) };
}
function applyOutbound(state, q) {
  if (q <= 0) throw new RangeError("outbound qty must be positive");
  const qtyAfter = qtyE4(state.qty - q);
  const currentRate = rateOf(state.qty, state.value, state.rate);
  let outValue;
  if (state.qty > 0 && q >= state.qty) {
    const excess = BigInt(q - state.qty);
    outValue = BigInt(state.value) + divRound(excess * BigInt(currentRate), S);
  } else if (state.qty > 0) {
    outValue = divRound(BigInt(q) * BigInt(state.value), BigInt(state.qty));
  } else {
    outValue = divRound(BigInt(q) * BigInt(currentRate), S);
  }
  const valueAfter = minor(state.value - Number(outValue));
  const rateAfter = qtyAfter > 0 ? rateOf(qtyAfter, valueAfter, currentRate) : currentRate;
  return {
    signedQty: qtyE4(-q),
    unitCost: currentRate,
    qtyAfter,
    rateAfter,
    valueAfter,
    valueDiff: minor(valueAfter - state.value)
  };
}
function applyOutboundAtCost(state, q, unitCost) {
  if (q <= 0) throw new RangeError("outbound qty must be positive");
  const qtyAfter = qtyE4(state.qty - q);
  const outValue = qtyAfter === 0 ? BigInt(state.value) : divRound(BigInt(q) * BigInt(unitCost), S);
  const valueAfter = minor(state.value - Number(outValue));
  const rateAfter = qtyAfter > 0 ? rateOf(qtyAfter, valueAfter, state.rate) : state.rate;
  return { signedQty: qtyE4(-q), unitCost, qtyAfter, rateAfter, valueAfter, valueDiff: minor(valueAfter - state.value) };
}
var EMPTY_STOCK, S;
var init_valuation = __esm({
  "packages/shared/src/domain/valuation.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_money();
    EMPTY_STOCK = { qty: qtyE4(0), value: minor(0), rate: minor(0) };
    S = BigInt(QTY_SCALE);
    __name(rateOf, "rateOf");
    __name(applyInbound, "applyInbound");
    __name(applyOutbound, "applyOutbound");
    __name(applyOutboundAtCost, "applyOutboundAtCost");
  }
});

// packages/shared/src/domain/state-machines.ts
function machine(name, table3) {
  return {
    table: table3,
    can(from, event) {
      return table3[from][event] !== void 0;
    },
    transition(from, event) {
      const next = table3[from][event];
      return next !== void 0 ? ok(next) : err({ code: "INVALID_TRANSITION", machine: name, from, event });
    }
  };
}
var OrderMachine, ProductionMachine, VoucherMachine, CountMachine, ExceptionMachine;
var init_state_machines = __esm({
  "packages/shared/src/domain/state-machines.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_result();
    __name(machine, "machine");
    OrderMachine = machine("order", {
      draft: { submit: "submitted", cancel: "cancelled" },
      submitted: { submit: "submitted", lock: "locked", cancel: "cancelled" },
      locked: { approve_exception: "locked", start: "in_production", cancel: "cancelled" },
      in_production: { mark_ready: "ready", deliver_partial: "partially_delivered", deliver_full: "delivered", cancel: "cancelled" },
      ready: { deliver_partial: "partially_delivered", deliver_full: "delivered" },
      partially_delivered: { deliver_partial: "partially_delivered", deliver_full: "delivered" },
      delivered: {},
      cancelled: { reopen: "submitted" }
    });
    ProductionMachine = machine("production_order", {
      open: { add_order: "open", lock: "locked", cancel: "cancelled" },
      locked: { apply_exception: "locked", start: "in_progress", cancel: "cancelled" },
      in_progress: { complete: "completed" },
      completed: { deliver: "delivered", reopen: "in_progress" },
      delivered: {},
      cancelled: {}
    });
    VoucherMachine = machine("voucher", {
      draft: { edit: "draft", post: "posted" },
      posted: { cancel: "cancelled" },
      cancelled: {}
    });
    CountMachine = machine("count_session", {
      open: { count: "open", finish: "review", cancel: "cancelled" },
      review: { reopen: "open", commit: "committed", cancel: "cancelled" },
      committed: {},
      cancelled: {}
    });
    ExceptionMachine = machine("order_exception", {
      pending: { approve: "approved", reject: "rejected", expire: "expired" },
      approved: {},
      rejected: {},
      expired: {}
    });
  }
});

// packages/shared/src/domain/time.ts
function localParts(d, tz) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short"
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday ?? "Sun");
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, weekday: wd };
}
function addDays(date, days) {
  const [y, m, dd] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, dd + days));
  return t.toISOString().slice(0, 10);
}
function tzOffsetMinutes(d, tz) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return Math.round((asUtc - d.getTime()) / 6e4);
}
function zonedInstant(date, time3, tz) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time3.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const off2 = tzOffsetMinutes(guess, tz);
  const first = new Date(guess.getTime() - off2 * 6e4);
  const off22 = tzOffsetMinutes(first, tz);
  return off22 === off2 ? first : new Date(guess.getTime() - off22 * 6e4);
}
function windowCycle(w, now, tz) {
  const { date, time: time3 } = localParts(now, tz);
  if (w.kind === "urgent" || !w.cutoff_time) {
    return { orderDate: date, deliveryDate: addDays(date, w.delivery_offset_days), closesAt: null, closesInMinutes: null };
  }
  const orderDate = time3 < w.cutoff_time ? date : addDays(date, 1);
  const closes = zonedInstant(orderDate, w.cutoff_time, tz);
  return {
    orderDate,
    deliveryDate: addDays(orderDate, w.delivery_offset_days),
    closesAt: closes.toISOString(),
    closesInMinutes: Math.max(0, Math.round((closes.getTime() - now.getTime()) / 6e4))
  };
}
function isCycleClosed(w, deliveryDate, now, tz) {
  if (w.kind === "urgent" || !w.cutoff_time) return false;
  const orderDate = addDays(deliveryDate, -w.delivery_offset_days);
  return now.getTime() >= zonedInstant(orderDate, w.cutoff_time, tz).getTime();
}
var localDate, startOfLocalDayIso;
var init_time = __esm({
  "packages/shared/src/domain/time.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(localParts, "localParts");
    localDate = /* @__PURE__ */ __name((d, tz) => localParts(d, tz).date, "localDate");
    __name(addDays, "addDays");
    __name(tzOffsetMinutes, "tzOffsetMinutes");
    __name(zonedInstant, "zonedInstant");
    startOfLocalDayIso = /* @__PURE__ */ __name((date, tz) => zonedInstant(date, "00:00", tz).toISOString(), "startOfLocalDayIso");
    __name(windowCycle, "windowCycle");
    __name(isCycleClosed, "isCycleClosed");
  }
});

// packages/shared/src/domain/rbac.ts
function can(grants, perm, locationId) {
  return grants.some((g) => ROLE_PERMS[g.role].has(perm) && (g.location_id === null || locationId === void 0 || g.location_id === locationId));
}
function scopeFor(grants, perm) {
  const relevant = grants.filter((g) => ROLE_PERMS[g.role].has(perm));
  if (relevant.some((g) => g.location_id === null)) return null;
  return relevant.map((g) => g.location_id).filter((x) => x !== null);
}
function stripCosts(data, allowed) {
  if (allowed) return data;
  const walk = /* @__PURE__ */ __name((v) => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      return Object.fromEntries(Object.entries(v).filter(([k]) => !COST_KEY.test(k) || k === "stock_status").map(([k, x]) => [k, walk(x)]));
    }
    return v;
  }, "walk");
  return walk(data);
}
function navFor(roles) {
  const priority = ["owner", "admin", "plant_manager", "plant_staff", "storekeeper", "branch_user", "viewer"];
  const sorted = [...new Set(roles)].sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
  const out = [];
  for (const r of sorted) for (const t of NAV[r]) if (!out.includes(t)) out.push(t);
  const tail = out.includes("settings") ? "settings" : "more";
  const head = out.filter((t) => t !== "settings" && t !== "more").slice(0, 4);
  return [...head, tail];
}
var PERMISSIONS, ALL, ROLE_PERMS, COST_KEY, NAV;
var init_rbac = __esm({
  "packages/shared/src/domain/rbac.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    PERMISSIONS = [
      "settings:write",
      "users:write",
      "locations:write",
      "catalog:read",
      "catalog:write",
      "windows:write",
      "orders:submit",
      "orders:read",
      "orders:cancel",
      "exceptions:request",
      "exceptions:decide",
      "production:read",
      "production:manage",
      "production:section_complete",
      "production:print",
      "deliveries:create",
      "deliveries:receive",
      "inventory:read",
      "inventory:write",
      "vouchers:post",
      "counts:write",
      "stock:read",
      "costs:view",
      "audit:read",
      "reports:read"
    ];
    ALL = new Set(PERMISSIONS);
    ROLE_PERMS = {
      owner: ALL,
      admin: ALL,
      plant_manager: /* @__PURE__ */ new Set(["catalog:read", "catalog:write", "windows:write", "orders:read", "orders:cancel", "exceptions:decide", "production:read", "production:manage", "production:section_complete", "production:print", "deliveries:create", "stock:read", "reports:read"]),
      plant_staff: /* @__PURE__ */ new Set(["catalog:read", "orders:read", "production:read", "production:section_complete", "production:print", "deliveries:create"]),
      branch_user: /* @__PURE__ */ new Set(["catalog:read", "orders:submit", "orders:read", "orders:cancel", "exceptions:request", "deliveries:receive"]),
      storekeeper: /* @__PURE__ */ new Set(["catalog:read", "inventory:read", "inventory:write", "vouchers:post", "counts:write", "stock:read", "costs:view", "reports:read"]),
      viewer: /* @__PURE__ */ new Set(["catalog:read", "orders:read", "production:read", "production:print", "stock:read", "reports:read", "inventory:read"])
    };
    __name(can, "can");
    __name(scopeFor, "scopeFor");
    COST_KEY = /(cost|valuation|value|rate)_?/i;
    __name(stripCosts, "stripCosts");
    NAV = {
      branch_user: ["home", "order", "receive", "history", "more"],
      plant_manager: ["home", "production", "deliver", "reports", "more"],
      plant_staff: ["home", "production", "deliver", "more"],
      storekeeper: ["home", "movement", "materials", "vouchers", "more"],
      admin: ["home", "production", "stock", "reports", "settings"],
      owner: ["home", "production", "stock", "reports", "settings"],
      viewer: ["home", "reports", "more"]
    };
    __name(navFor, "navFor");
  }
});

// packages/shared/src/domain/plural.ts
var init_plural = __esm({
  "packages/shared/src/domain/plural.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
  }
});

// node_modules/.pnpm/ulid@3.0.2/node_modules/ulid/dist/browser/index.js
function randomChar(prng) {
  const randomPosition = Math.floor(prng() * ENCODING_LEN) % ENCODING_LEN;
  return ENCODING.charAt(randomPosition);
}
function detectPRNG(root) {
  const rootLookup = detectRoot();
  const globalCrypto = rootLookup && (rootLookup.crypto || rootLookup.msCrypto) || null;
  if (typeof globalCrypto?.getRandomValues === "function") {
    return () => {
      const buffer = new Uint8Array(1);
      globalCrypto.getRandomValues(buffer);
      return buffer[0] / 256;
    };
  } else if (typeof globalCrypto?.randomBytes === "function") {
    return () => globalCrypto.randomBytes(1).readUInt8() / 256;
  } else ;
  throw new ULIDError(ULIDErrorCode.PRNGDetectFailure, "Failed to find a reliable PRNG");
}
function detectRoot() {
  if (inWebWorker())
    return self;
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  return null;
}
function encodeRandom(len, prng) {
  let str = "";
  for (; len > 0; len--) {
    str = randomChar(prng) + str;
  }
  return str;
}
function encodeTime(now, len = TIME_LEN) {
  if (isNaN(now)) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeValueMalformed, `Time must be a number: ${now}`);
  } else if (now > TIME_MAX) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeSizeExceeded, `Cannot encode a time larger than ${TIME_MAX}: ${now}`);
  } else if (now < 0) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeNegative, `Time must be positive: ${now}`);
  } else if (Number.isInteger(now) === false) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeValueMalformed, `Time must be an integer: ${now}`);
  }
  let mod, str = "";
  for (let currentLen = len; currentLen > 0; currentLen--) {
    mod = now % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return str;
}
function inWebWorker() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}
function ulid(seedTime, prng) {
  const currentPRNG = prng || detectPRNG();
  const seed2 = !seedTime || isNaN(seedTime) ? Date.now() : seedTime;
  return encodeTime(seed2, TIME_LEN) + encodeRandom(RANDOM_LEN, currentPRNG);
}
var ENCODING, ENCODING_LEN, RANDOM_LEN, TIME_LEN, TIME_MAX, ULIDErrorCode, ULIDError;
var init_browser = __esm({
  "node_modules/.pnpm/ulid@3.0.2/node_modules/ulid/dist/browser/index.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    ENCODING_LEN = 32;
    RANDOM_LEN = 16;
    TIME_LEN = 10;
    TIME_MAX = 281474976710655;
    (function(ULIDErrorCode2) {
      ULIDErrorCode2["Base32IncorrectEncoding"] = "B32_ENC_INVALID";
      ULIDErrorCode2["DecodeTimeInvalidCharacter"] = "DEC_TIME_CHAR";
      ULIDErrorCode2["DecodeTimeValueMalformed"] = "DEC_TIME_MALFORMED";
      ULIDErrorCode2["EncodeTimeNegative"] = "ENC_TIME_NEG";
      ULIDErrorCode2["EncodeTimeSizeExceeded"] = "ENC_TIME_SIZE_EXCEED";
      ULIDErrorCode2["EncodeTimeValueMalformed"] = "ENC_TIME_MALFORMED";
      ULIDErrorCode2["PRNGDetectFailure"] = "PRNG_DETECT";
      ULIDErrorCode2["ULIDInvalid"] = "ULID_INVALID";
      ULIDErrorCode2["Unexpected"] = "UNEXPECTED";
      ULIDErrorCode2["UUIDInvalid"] = "UUID_INVALID";
    })(ULIDErrorCode || (ULIDErrorCode = {}));
    ULIDError = class extends Error {
      static {
        __name(this, "ULIDError");
      }
      constructor(errorCode, message) {
        super(`${message} (${errorCode})`);
        this.name = "ULIDError";
        this.code = errorCode;
      }
    };
    __name(randomChar, "randomChar");
    __name(detectPRNG, "detectPRNG");
    __name(detectRoot, "detectRoot");
    __name(encodeRandom, "encodeRandom");
    __name(encodeTime, "encodeTime");
    __name(inWebWorker, "inWebWorker");
    __name(ulid, "ulid");
  }
});

// packages/shared/src/domain/ids.ts
var ulid2;
var init_ids = __esm({
  "packages/shared/src/domain/ids.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_browser();
    ulid2 = /* @__PURE__ */ __name(() => ulid(), "ulid");
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
var util, objectUtil, ZodParsedType, getParsedType;
var init_util = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    (function(util2) {
      util2.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      __name(assertIs, "assertIs");
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      __name(assertNever, "assertNever");
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      __name(joinValues, "joinValues");
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (util = {}));
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (objectUtil = {}));
    ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    getParsedType = /* @__PURE__ */ __name((data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return ZodParsedType.undefined;
        case "string":
          return ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
          return ZodParsedType.boolean;
        case "function":
          return ZodParsedType.function;
        case "bigint":
          return ZodParsedType.bigint;
        case "symbol":
          return ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return ZodParsedType.array;
          }
          if (data === null) {
            return ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return ZodParsedType.date;
          }
          return ZodParsedType.object;
        default:
          return ZodParsedType.unknown;
      }
    }, "getParsedType");
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode, quotelessJson, ZodError;
var init_ZodError = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_util();
    ZodIssueCode = util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    quotelessJson = /* @__PURE__ */ __name((obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    }, "quotelessJson");
    ZodError = class _ZodError extends Error {
      static {
        __name(this, "ZodError");
      }
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = /* @__PURE__ */ __name((error3) => {
          for (const issue of error3.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        }, "processError");
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    ZodError.create = (issues) => {
      const error3 = new ZodError(issues);
      return error3;
    };
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap, en_default;
var init_en = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_ZodError();
    init_util();
    errorMap = /* @__PURE__ */ __name((issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          if (issue.received === ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
          break;
        case ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
          break;
        case ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util.assertNever(issue);
      }
      return { message };
    }, "errorMap");
    en_default = errorMap;
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var overrideErrorMap;
var init_errors = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_en();
    overrideErrorMap = en_default;
    __name(setErrorMap, "setErrorMap");
    __name(getErrorMap, "getErrorMap");
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var makeIssue, EMPTY_PATH, ParseStatus, INVALID, DIRTY, OK, isAborted, isDirty, isValid, isAsync;
var init_parseUtil = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_errors();
    init_en();
    makeIssue = /* @__PURE__ */ __name((params) => {
      const { data, path, errorMaps, issueData } = params;
      const fullPath = [...path, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    }, "makeIssue");
    EMPTY_PATH = [];
    __name(addIssueToContext, "addIssueToContext");
    ParseStatus = class _ParseStatus {
      static {
        __name(this, "ParseStatus");
      }
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return INVALID;
          if (value.status === "aborted")
            return INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    INVALID = Object.freeze({
      status: "aborted"
    });
    DIRTY = /* @__PURE__ */ __name((value) => ({ status: "dirty", value }), "DIRTY");
    OK = /* @__PURE__ */ __name((value) => ({ status: "valid", value }), "OK");
    isAborted = /* @__PURE__ */ __name((x) => x.status === "aborted", "isAborted");
    isDirty = /* @__PURE__ */ __name((x) => x.status === "dirty", "isDirty");
    isValid = /* @__PURE__ */ __name((x) => x.status === "valid", "isValid");
    isAsync = /* @__PURE__ */ __name((x) => typeof Promise !== "undefined" && x instanceof Promise, "isAsync");
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/typeAliases.js
var init_typeAliases = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/typeAliases.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
var init_errorUtil = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (errorUtil = {}));
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = /* @__PURE__ */ __name((iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  }, "customMap");
  return { errorMap: customMap, description };
}
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var ParseInputLazyPath, handleResult, ZodType, cuidRegex, cuid2Regex, ulidRegex, uuidRegex, nanoidRegex, jwtRegex, durationRegex, emailRegex, _emojiRegex, emojiRegex, ipv4Regex, ipv4CidrRegex, ipv6Regex, ipv6CidrRegex, base64Regex, base64urlRegex, dateRegexSource, dateRegex, ZodString, ZodNumber, ZodBigInt, ZodBoolean, ZodDate, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodArray, ZodObject, ZodUnion, getDiscriminator, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodFunction, ZodLazy, ZodLiteral, ZodEnum, ZodNativeEnum, ZodPromise, ZodEffects, ZodOptional, ZodNullable, ZodDefault, ZodCatch, ZodNaN, BRAND, ZodBranded, ZodPipeline, ZodReadonly, late, ZodFirstPartyTypeKind, instanceOfType, stringType, numberType, nanType, bigIntType, booleanType, dateType, symbolType, undefinedType, nullType, anyType, unknownType, neverType, voidType, arrayType, objectType, strictObjectType, unionType, discriminatedUnionType, intersectionType, tupleType, recordType, mapType, setType, functionType, lazyType, literalType, enumType, nativeEnumType, promiseType, effectsType, optionalType, nullableType, preprocessType, pipelineType, ostring, onumber, oboolean, coerce, NEVER;
var init_types = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_ZodError();
    init_errors();
    init_errorUtil();
    init_parseUtil();
    init_util();
    ParseInputLazyPath = class {
      static {
        __name(this, "ParseInputLazyPath");
      }
      constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    handleResult = /* @__PURE__ */ __name((ctx, result) => {
      if (isValid(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error3 = new ZodError(ctx.common.issues);
            this._error = error3;
            return this._error;
          }
        };
      }
    }, "handleResult");
    __name(processCreateParams, "processCreateParams");
    ZodType = class {
      static {
        __name(this, "ZodType");
      }
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return getParsedType(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return ctx || {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        };
      }
      _processInputParams(input) {
        return {
          status: new ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          }
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        const ctx = {
          common: {
            issues: [],
            async: params?.async ?? false,
            contextualErrorMap: params?.errorMap
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return isValid(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err2) {
            if (err2?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params?.errorMap,
            async: true
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = /* @__PURE__ */ __name((val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        }, "getIssueProperties");
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = /* @__PURE__ */ __name(() => ctx.addIssue({
            code: ZodIssueCode.custom,
            ...getIssueProperties(val)
          }), "setError");
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: /* @__PURE__ */ __name((data) => this["~validate"](data), "validate")
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    cuidRegex = /^c[^\s-]{8,}$/i;
    cuid2Regex = /^[0-9a-z]+$/;
    ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    nanoidRegex = /^[a-z0-9_-]{21}$/i;
    jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    dateRegex = new RegExp(`^${dateRegexSource}$`);
    __name(timeRegexSource, "timeRegexSource");
    __name(timeRegex, "timeRegex");
    __name(datetimeRegex, "datetimeRegex");
    __name(isValidIP, "isValidIP");
    __name(isValidJWT, "isValidJWT");
    __name(isValidCidr, "isValidCidr");
    ZodString = class _ZodString extends ZodType {
      static {
        __name(this, "ZodString");
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "emoji",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "uuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "nanoid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid2",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ulid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "regex",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "duration",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ip",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input.data, check.alg)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "jwt",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cidr",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodIssueCode.invalid_string,
          ...errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options?.position,
          ...errorUtil.errToObj(options?.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil.errToObj(message)
        });
      }
      /**
       * Equivalent to `.min(1)`
       */
      nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodString.create = (params) => {
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    __name(floatSafeRemainder, "floatSafeRemainder");
    ZodNumber = class _ZodNumber extends ZodType {
      static {
        __name(this, "ZodNumber");
      }
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodBigInt = class _ZodBigInt extends ZodType {
      static {
        __name(this, "ZodBigInt");
      }
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return INVALID;
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodBigInt.create = (params) => {
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodBoolean = class extends ZodType {
      static {
        __name(this, "ZodBoolean");
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodDate = class _ZodDate extends ZodType {
      static {
        __name(this, "ZodDate");
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_date
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    ZodSymbol = class extends ZodType {
      static {
        __name(this, "ZodSymbol");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    ZodUndefined = class extends ZodType {
      static {
        __name(this, "ZodUndefined");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    ZodNull = class extends ZodType {
      static {
        __name(this, "ZodNull");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    ZodAny = class extends ZodType {
      static {
        __name(this, "ZodAny");
      }
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    ZodUnknown = class extends ZodType {
      static {
        __name(this, "ZodUnknown");
      }
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    ZodNever = class extends ZodType {
      static {
        __name(this, "ZodNever");
      }
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: ctx.parsedType
        });
        return INVALID;
      }
    };
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    ZodVoid = class extends ZodType {
      static {
        __name(this, "ZodVoid");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    ZodArray = class _ZodArray extends ZodType {
      static {
        __name(this, "ZodArray");
      }
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            addIssueToContext(ctx, {
              code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    __name(deepPartialify, "deepPartialify");
    ZodObject = class _ZodObject extends ZodType {
      static {
        __name(this, "ZodObject");
      }
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: /* @__PURE__ */ __name((issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }, "errorMap")
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: /* @__PURE__ */ __name(() => ({
            ...this._def.shape(),
            ...augmentation
          }), "shape")
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: /* @__PURE__ */ __name(() => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }), "shape"),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: /* @__PURE__ */ __name(() => shape, "shape")
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: /* @__PURE__ */ __name(() => shape, "shape")
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: /* @__PURE__ */ __name(() => newShape, "shape")
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: /* @__PURE__ */ __name(() => newShape, "shape")
        });
      }
      keyof() {
        return createZodEnum(util.objectKeys(this.shape));
      }
    };
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: /* @__PURE__ */ __name(() => shape, "shape"),
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: /* @__PURE__ */ __name(() => shape, "shape"),
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodUnion = class extends ZodType {
      static {
        __name(this, "ZodUnion");
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
        __name(handleResults, "handleResults");
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError(issues2));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    getDiscriminator = /* @__PURE__ */ __name((type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    }, "getDiscriminator");
    ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      static {
        __name(this, "ZodDiscriminatedUnion");
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    __name(mergeValues, "mergeValues");
    ZodIntersection = class extends ZodType {
      static {
        __name(this, "ZodIntersection");
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = /* @__PURE__ */ __name((parsedLeft, parsedRight) => {
          if (isAborted(parsedLeft) || isAborted(parsedRight)) {
            return INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_intersection_types
            });
            return INVALID;
          }
          if (isDirty(parsedLeft) || isDirty(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        }, "handleParsed");
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    ZodTuple = class _ZodTuple extends ZodType {
      static {
        __name(this, "ZodTuple");
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return ParseStatus.mergeArray(status, results);
          });
        } else {
          return ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    ZodRecord = class _ZodRecord extends ZodType {
      static {
        __name(this, "ZodRecord");
      }
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    ZodMap = class extends ZodType {
      static {
        __name(this, "ZodMap");
      }
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    ZodSet = class _ZodSet extends ZodType {
      static {
        __name(this, "ZodSet");
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.set,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        __name(finalizeSet, "finalizeSet");
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    ZodFunction = class _ZodFunction extends ZodType {
      static {
        __name(this, "ZodFunction");
      }
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: ctx.parsedType
          });
          return INVALID;
        }
        function makeArgsIssue(args, error3) {
          return makeIssue({
            data: args,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_arguments,
              argumentsError: error3
            }
          });
        }
        __name(makeArgsIssue, "makeArgsIssue");
        function makeReturnsIssue(returns, error3) {
          return makeIssue({
            data: returns,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_return_type,
              returnTypeError: error3
            }
          });
        }
        __name(makeReturnsIssue, "makeReturnsIssue");
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return OK(async function(...args) {
            const error3 = new ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error3.addIssue(makeArgsIssue(args, e));
              throw error3;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error3.addIssue(makeReturnsIssue(result, e));
              throw error3;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return OK(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    ZodLazy = class extends ZodType {
      static {
        __name(this, "ZodLazy");
      }
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    ZodLiteral = class extends ZodType {
      static {
        __name(this, "ZodLiteral");
      }
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    __name(createZodEnum, "createZodEnum");
    ZodEnum = class _ZodEnum extends ZodType {
      static {
        __name(this, "ZodEnum");
      }
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
          ...this._def,
          ...newDef
        });
      }
    };
    ZodEnum.create = createZodEnum;
    ZodNativeEnum = class extends ZodType {
      static {
        __name(this, "ZodNativeEnum");
      }
      _parse(input) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(util.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    ZodPromise = class extends ZodType {
      static {
        __name(this, "ZodPromise");
      }
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    ZodEffects = class extends ZodType {
      static {
        __name(this, "ZodEffects");
      }
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: /* @__PURE__ */ __name((arg) => {
            addIssueToContext(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          }, "addIssue"),
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return INVALID;
              if (result.status === "dirty")
                return DIRTY(result.value);
              if (status.value === "dirty")
                return DIRTY(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return INVALID;
            if (result.status === "dirty")
              return DIRTY(result.value);
            if (status.value === "dirty")
              return DIRTY(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = /* @__PURE__ */ __name((acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          }, "executeRefinement");
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!isValid(base))
              return INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!isValid(base))
                return INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
        }
        util.assertNever(effect);
      }
    };
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    ZodOptional = class extends ZodType {
      static {
        __name(this, "ZodOptional");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
          return OK(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    ZodNullable = class extends ZodType {
      static {
        __name(this, "ZodNullable");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
          return OK(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    ZodDefault = class extends ZodType {
      static {
        __name(this, "ZodDefault");
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    ZodCatch = class extends ZodType {
      static {
        __name(this, "ZodCatch");
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if (isAsync(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    ZodNaN = class extends ZodType {
      static {
        __name(this, "ZodNaN");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.nan,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    BRAND = /* @__PURE__ */ Symbol("zod_brand");
    ZodBranded = class extends ZodType {
      static {
        __name(this, "ZodBranded");
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    ZodPipeline = class _ZodPipeline extends ZodType {
      static {
        __name(this, "ZodPipeline");
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = /* @__PURE__ */ __name(async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return DIRTY(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          }, "handleAsync");
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    ZodReadonly = class extends ZodType {
      static {
        __name(this, "ZodReadonly");
      }
      _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = /* @__PURE__ */ __name((data) => {
          if (isValid(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        }, "freeze");
        return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    __name(cleanParams, "cleanParams");
    __name(custom, "custom");
    late = {
      object: ZodObject.lazycreate
    };
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
    instanceOfType = /* @__PURE__ */ __name((cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params), "instanceOfType");
    stringType = ZodString.create;
    numberType = ZodNumber.create;
    nanType = ZodNaN.create;
    bigIntType = ZodBigInt.create;
    booleanType = ZodBoolean.create;
    dateType = ZodDate.create;
    symbolType = ZodSymbol.create;
    undefinedType = ZodUndefined.create;
    nullType = ZodNull.create;
    anyType = ZodAny.create;
    unknownType = ZodUnknown.create;
    neverType = ZodNever.create;
    voidType = ZodVoid.create;
    arrayType = ZodArray.create;
    objectType = ZodObject.create;
    strictObjectType = ZodObject.strictCreate;
    unionType = ZodUnion.create;
    discriminatedUnionType = ZodDiscriminatedUnion.create;
    intersectionType = ZodIntersection.create;
    tupleType = ZodTuple.create;
    recordType = ZodRecord.create;
    mapType = ZodMap.create;
    setType = ZodSet.create;
    functionType = ZodFunction.create;
    lazyType = ZodLazy.create;
    literalType = ZodLiteral.create;
    enumType = ZodEnum.create;
    nativeEnumType = ZodNativeEnum.create;
    promiseType = ZodPromise.create;
    effectsType = ZodEffects.create;
    optionalType = ZodOptional.create;
    nullableType = ZodNullable.create;
    preprocessType = ZodEffects.createWithPreprocess;
    pipelineType = ZodPipeline.create;
    ostring = /* @__PURE__ */ __name(() => stringType().optional(), "ostring");
    onumber = /* @__PURE__ */ __name(() => numberType().optional(), "onumber");
    oboolean = /* @__PURE__ */ __name(() => booleanType().optional(), "oboolean");
    coerce = {
      string: /* @__PURE__ */ __name(((arg) => ZodString.create({ ...arg, coerce: true })), "string"),
      number: /* @__PURE__ */ __name(((arg) => ZodNumber.create({ ...arg, coerce: true })), "number"),
      boolean: /* @__PURE__ */ __name(((arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      })), "boolean"),
      bigint: /* @__PURE__ */ __name(((arg) => ZodBigInt.create({ ...arg, coerce: true })), "bigint"),
      date: /* @__PURE__ */ __name(((arg) => ZodDate.create({ ...arg, coerce: true })), "date")
    };
    NEVER = INVALID;
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});
var init_external = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_errors();
    init_parseUtil();
    init_typeAliases();
    init_util();
    init_types();
    init_ZodError();
  }
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.js
var init_zod = __esm({
  "node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_external();
    init_external();
  }
});

// packages/shared/src/schemas.ts
var qtyNumber, idStr, dateStr, timeStr, LoginInput, PinInput, SetPinInput, SubmitOrderInput, CancelInput, AssignInput, DeliveryInput, VOUCHER_KINDS, QuickVoucherInput, LocationInput, CategoryInput, ProductInput, RawMaterialInput, SupplierInput, UserInput, WindowInput, BrandingInput, SettingsInput;
var init_schemas = __esm({
  "packages/shared/src/schemas.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_zod();
    qtyNumber = external_exports.number().finite().positive().max(1e6);
    idStr = external_exports.string().min(1).max(64);
    dateStr = external_exports.string().regex(/^\d{4}-\d{2}-\d{2}$/);
    timeStr = external_exports.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
    LoginInput = external_exports.object({
      tenant: external_exports.string().min(1).max(64),
      identifier: external_exports.string().min(1).max(120),
      password: external_exports.string().min(1).max(200),
      deviceFingerprint: external_exports.string().min(8).max(200),
      deviceLabel: external_exports.string().max(120).optional()
    });
    PinInput = external_exports.object({ deviceId: idStr, pin: external_exports.string().regex(/^\d{4,6}$/) });
    SetPinInput = external_exports.object({ pin: external_exports.string().regex(/^\d{4,6}$/) });
    SubmitOrderInput = external_exports.object({
      client_uuid: idStr,
      window_id: idStr,
      branch_id: idStr.optional(),
      /** the cycle the device intended (offline submits must not silently roll to the next day) */
      delivery_date: dateStr.optional(),
      note: external_exports.string().max(500).optional().nullable(),
      lines: external_exports.array(external_exports.object({ product_id: idStr, qty: qtyNumber, note: external_exports.string().max(200).optional().nullable() })).min(1).max(500)
    });
    CancelInput = external_exports.object({ reason: external_exports.string().min(2).max(300) });
    AssignInput = external_exports.object({
      assigned_to: idStr.nullable().optional(),
      assigned_to_name: external_exports.string().max(80).nullable().optional(),
      expected_ready_at: external_exports.string().max(40).nullable().optional(),
      note: external_exports.string().max(500).nullable().optional()
    });
    DeliveryInput = external_exports.object({
      client_uuid: idStr,
      order_id: idStr,
      received_by_name: external_exports.string().min(2).max(120),
      lines: external_exports.array(external_exports.object({ order_line_id: idStr, qty_delivered: external_exports.number().finite().min(0).max(1e6), note: external_exports.string().max(200).optional().nullable() })).min(1),
      signature_png_base64: external_exports.string().max(7e4).optional().nullable(),
      note: external_exports.string().max(500).optional().nullable()
    });
    VOUCHER_KINDS = ["opening", "receipt", "issue", "adjustment", "transfer", "waste", "return_in", "return_out"];
    QuickVoucherInput = external_exports.object({
      client_uuid: idStr,
      kind: external_exports.enum(VOUCHER_KINDS),
      location_id: idStr.optional(),
      to_location_id: idStr.optional().nullable(),
      voucher_date: dateStr.optional(),
      supplier_id: idStr.optional().nullable(),
      external_ref: external_exports.string().max(80).optional().nullable(),
      issued_to_name: external_exports.string().max(120).optional().nullable(),
      purpose: external_exports.enum(["production", "cleaning", "other"]).optional().nullable(),
      note: external_exports.string().max(500).optional().nullable(),
      lines: external_exports.array(external_exports.object({
        raw_material_id: idStr,
        qty: external_exports.number().finite().refine((v) => v !== 0).refine((v) => Math.abs(v) <= 1e6),
        unit_cost: external_exports.number().finite().min(0).max(1e12).optional().nullable(),
        note: external_exports.string().max(200).optional().nullable()
      })).min(1).max(100)
    });
    LocationInput = external_exports.object({
      code: external_exports.string().min(1).max(20),
      name_ar: external_exports.string().min(2).max(80),
      kind: external_exports.enum(["plant", "branch", "warehouse"]),
      default_plant_id: idStr.nullable().optional(),
      phone: external_exports.string().max(40).nullable().optional(),
      address: external_exports.string().max(200).nullable().optional(),
      is_active: external_exports.boolean().optional()
    });
    CategoryInput = external_exports.object({
      name_ar: external_exports.string().min(2).max(60),
      parent_id: idStr.nullable().optional(),
      color: external_exports.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
      sort_order: external_exports.number().int().optional(),
      is_active: external_exports.boolean().optional()
    });
    ProductInput = external_exports.object({
      category_id: idStr,
      code: external_exports.string().min(1).max(20),
      name_ar: external_exports.string().min(2).max(80),
      uom_id: idStr,
      sort_order: external_exports.number().int().optional(),
      is_active: external_exports.boolean().optional()
    });
    RawMaterialInput = external_exports.object({
      category_id: idStr.nullable().optional(),
      code: external_exports.string().min(1).max(20),
      name_ar: external_exports.string().min(2).max(80),
      uom_id: idStr,
      safety_stock: external_exports.number().finite().min(0),
      default_unit_cost: external_exports.number().finite().min(0).nullable().optional(),
      is_active: external_exports.boolean().optional()
    });
    SupplierInput = external_exports.object({ name: external_exports.string().min(2).max(120), phone: external_exports.string().max(40).nullable().optional(), address: external_exports.string().max(200).nullable().optional() });
    UserInput = external_exports.object({
      full_name: external_exports.string().min(2).max(80),
      email: external_exports.string().email().max(120).nullable().optional(),
      phone: external_exports.string().max(30).nullable().optional(),
      password: external_exports.string().min(6).max(200).optional(),
      is_active: external_exports.boolean().optional(),
      roles: external_exports.array(external_exports.object({ role: external_exports.enum(["owner", "admin", "plant_manager", "plant_staff", "branch_user", "storekeeper", "viewer"]), location_id: idStr.nullable() })).min(1)
    });
    WindowInput = external_exports.object({
      plant_id: idStr,
      name_ar: external_exports.string().min(2).max(60),
      kind: external_exports.enum(["regular", "urgent"]),
      cutoff_time: timeStr.nullable(),
      delivery_offset_days: external_exports.number().int().min(0).max(7),
      is_active: external_exports.boolean().optional()
    });
    BrandingInput = external_exports.object({
      company_name: external_exports.string().min(2).max(80),
      primary_color: external_exports.string().regex(/^#[0-9a-fA-F]{6}$/),
      accent_color: external_exports.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      phone: external_exports.string().max(40).nullable().optional(),
      address: external_exports.string().max(200).nullable().optional(),
      footer_text: external_exports.string().max(200).nullable().optional(),
      logo_url: external_exports.string().max(4e5).nullable().optional()
    });
    SettingsInput = external_exports.object({
      timezone: external_exports.string().min(3).max(60),
      currency_code: external_exports.string().min(3).max(3),
      currency_decimals: external_exports.number().int().min(0).max(4),
      numerals: external_exports.enum(["western", "eastern"]),
      allow_negative_stock: external_exports.boolean()
    });
  }
});

// packages/shared/src/index.ts
var init_src = __esm({
  "packages/shared/src/index.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_result();
    init_money();
    init_valuation();
    init_state_machines();
    init_time();
    init_rbac();
    init_plural();
    init_ids();
    init_schemas();
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/cookie.js
var validCookieNameRegEx, relaxedCookieNameRegEx, validCookieValueRegEx, trimCookieWhitespace, parse, _serialize, serialize;
var init_cookie = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/cookie.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_url();
    validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
    relaxedCookieNameRegEx = /^[!#-:<>-[\]-~]+$/;
    validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
    trimCookieWhitespace = /* @__PURE__ */ __name((value) => {
      let start = 0;
      let end = value.length;
      while (start < end) {
        const charCode = value.charCodeAt(start);
        if (charCode !== 32 && charCode !== 9) break;
        start++;
      }
      while (end > start) {
        const charCode = value.charCodeAt(end - 1);
        if (charCode !== 32 && charCode !== 9) break;
        end--;
      }
      return start === 0 && end === value.length ? value : value.slice(start, end);
    }, "trimCookieWhitespace");
    parse = /* @__PURE__ */ __name((cookie, name) => {
      if (name && cookie.indexOf(name) === -1) return {};
      const pairs = cookie.split(";");
      const parsedCookie = /* @__PURE__ */ Object.create(null);
      for (const pairStr of pairs) {
        const valueStartPos = pairStr.indexOf("=");
        if (valueStartPos === -1) continue;
        const cookieName = trimCookieWhitespace(pairStr.substring(0, valueStartPos));
        if (name && name !== cookieName || !relaxedCookieNameRegEx.test(cookieName) || cookieName in parsedCookie) continue;
        let cookieValue = trimCookieWhitespace(pairStr.substring(valueStartPos + 1));
        if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) cookieValue = cookieValue.slice(1, -1);
        if (validCookieValueRegEx.test(cookieValue)) {
          parsedCookie[cookieName] = tryDecodeURIComponent(cookieValue);
          if (name) break;
        }
      }
      return parsedCookie;
    }, "parse");
    _serialize = /* @__PURE__ */ __name((name, value, opt = {}) => {
      if (!validCookieNameRegEx.test(name)) throw new Error("Invalid cookie name");
      let cookie = `${name}=${value}`;
      if (name.startsWith("__Secure-") && !opt.secure) throw new Error("__Secure- Cookie must have Secure attributes");
      if (name.startsWith("__Host-")) {
        if (!opt.secure) throw new Error("__Host- Cookie must have Secure attributes");
        if (opt.path !== "/") throw new Error('__Host- Cookie must have Path attributes with "/"');
        if (opt.domain) throw new Error("__Host- Cookie must not have Domain attributes");
      }
      for (const key of [
        "domain",
        "path",
        "sameSite",
        "priority"
      ]) if (opt[key] && /[;\r\n]/.test(opt[key])) throw new Error(`${key} must not contain ";", "\\r", or "\\n"`);
      if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
        if (opt.maxAge > 3456e4) throw new Error("Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration.");
        cookie += `; Max-Age=${opt.maxAge | 0}`;
      }
      if (opt.domain && opt.prefix !== "host") cookie += `; Domain=${opt.domain}`;
      if (opt.path) cookie += `; Path=${opt.path}`;
      if (opt.expires) {
        if (opt.expires.getTime() - Date.now() > 3456e7) throw new Error("Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future.");
        cookie += `; Expires=${opt.expires.toUTCString()}`;
      }
      if (opt.httpOnly) cookie += "; HttpOnly";
      if (opt.secure) cookie += "; Secure";
      if (opt.sameSite) cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
      if (opt.priority) cookie += `; Priority=${opt.priority.charAt(0).toUpperCase() + opt.priority.slice(1)}`;
      if (opt.partitioned) {
        if (!opt.secure) throw new Error("Partitioned Cookie must have Secure attributes");
        cookie += "; Partitioned";
      }
      return cookie;
    }, "_serialize");
    serialize = /* @__PURE__ */ __name((name, value, opt) => {
      value = encodeURIComponent(value);
      return _serialize(name, value, opt);
    }, "serialize");
  }
});

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/helper/cookie/index.js
var getCookie, generateCookie, setCookie, deleteCookie;
var init_cookie2 = __esm({
  "node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/helper/cookie/index.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_cookie();
    getCookie = /* @__PURE__ */ __name((c, key, prefix) => {
      const cookie = c.req.raw.headers.get("Cookie");
      if (typeof key === "string") {
        if (!cookie) return;
        let finalKey = key;
        if (prefix === "secure") finalKey = "__Secure-" + key;
        else if (prefix === "host") finalKey = "__Host-" + key;
        return parse(cookie, finalKey)[finalKey];
      }
      if (!cookie) return {};
      return parse(cookie);
    }, "getCookie");
    generateCookie = /* @__PURE__ */ __name((name, value, opt) => {
      let cookie;
      if (opt?.prefix === "secure") cookie = serialize("__Secure-" + name, value, {
        path: "/",
        ...opt,
        secure: true
      });
      else if (opt?.prefix === "host") cookie = serialize("__Host-" + name, value, {
        ...opt,
        path: "/",
        secure: true,
        domain: void 0
      });
      else cookie = serialize(name, value, {
        path: "/",
        ...opt
      });
      return cookie;
    }, "generateCookie");
    setCookie = /* @__PURE__ */ __name((c, name, value, opt) => {
      const cookie = generateCookie(name, value, opt);
      c.header("Set-Cookie", cookie, { append: true });
    }, "setCookie");
    deleteCookie = /* @__PURE__ */ __name((c, name, opt) => {
      const deletedCookie = getCookie(c, name, opt?.prefix);
      setCookie(c, name, "", {
        ...opt,
        maxAge: 0
      });
      return deletedCookie;
    }, "deleteCookie");
  }
});

// packages/server/src/lib/db.ts
var db_exports = {};
__export(db_exports, {
  Db: () => Db
});
var Db;
var init_db = __esm({
  "packages/server/src/lib/db.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    Db = class {
      constructor(d1, t) {
        this.d1 = d1;
        this.t = t;
      }
      d1;
      t;
      static {
        __name(this, "Db");
      }
      prep(sql, ...params) {
        return this.d1.prepare(sql).bind(...params);
      }
      async all(sql, ...params) {
        return (await this.prep(sql, ...params).all()).results;
      }
      async first(sql, ...params) {
        return await this.prep(sql, ...params).first() ?? null;
      }
      async run(sql, ...params) {
        return this.prep(sql, ...params).run();
      }
      async batch(stmts) {
        if (stmts.length === 0) return [];
        return this.d1.batch(stmts);
      }
      /** Next human-readable number from `sequences` (A9). Gaps allowed, never reused. */
      async nextNumber(key, year) {
        const r = await this.first(
          `INSERT INTO sequences (tenant_id, key, year, next_value) VALUES (?, ?, ?, 2)
       ON CONFLICT (tenant_id, key, year) DO UPDATE SET next_value = next_value + 1
       RETURNING next_value - 1 AS v`,
          this.t,
          key,
          year
        );
        return `${key}-${year}-${String(r?.v ?? 1).padStart(5, "0")}`;
      }
      audit(actorId, entityType, entityId, action, before, after, newId) {
        return this.prep(
          `INSERT INTO audit_log (id, tenant_id, actor_id, entity_type, entity_id, action, before, after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          newId,
          this.t,
          actorId,
          entityType,
          entityId,
          action,
          before === null ? null : JSON.stringify(before),
          after === null ? null : JSON.stringify(after)
        );
      }
      async getIdempotent(key) {
        const r = await this.first(`SELECT response FROM idempotency_keys WHERE tenant_id = ? AND key = ?`, this.t, key);
        return r ? JSON.parse(r.response) : null;
      }
      saveIdempotent(key, op, response) {
        return this.prep(`INSERT OR IGNORE INTO idempotency_keys (tenant_id, key, op, response) VALUES (?, ?, ?, ?)`, this.t, key, op, JSON.stringify(response));
      }
    };
  }
});

// packages/server/src/lib/http.ts
function okJson(c, data, status = 200) {
  return c.json({ ok: true, data, meta: { requestId: c.get("requestId"), serverTime: (/* @__PURE__ */ new Date()).toISOString() } }, status);
}
async function parseBody2(c, schema) {
  let raw2;
  try {
    raw2 = await c.req.json();
  } catch {
    throw new Fail(400, "VALIDATION", "\u0635\u064A\u063A\u0629 \u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629");
  }
  const r = schema.safeParse(raw2);
  if (!r.success) {
    throw new Fail(400, "VALIDATION", "\u0628\u0639\u0636 \u0627\u0644\u062D\u0642\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", { issues: r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
  }
  return r.data;
}
var Fail, notFound, forbidden, invalidTransition;
var init_http = __esm({
  "packages/server/src/lib/http.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    Fail = class extends Error {
      constructor(status, code, messageAr, details) {
        super(code);
        this.status = status;
        this.code = code;
        this.messageAr = messageAr;
        this.details = details;
      }
      status;
      code;
      messageAr;
      details;
      static {
        __name(this, "Fail");
      }
    };
    notFound = /* @__PURE__ */ __name((what = "\u0627\u0644\u0639\u0646\u0635\u0631") => new Fail(404, "NOT_FOUND", `${what} \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F`), "notFound");
    forbidden = /* @__PURE__ */ __name(() => new Fail(403, "FORBIDDEN", "\u0644\u064A\u0633\u062A \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621"), "forbidden");
    invalidTransition = /* @__PURE__ */ __name((from, event) => new Fail(409, "INVALID_TRANSITION", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0641\u064A \u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", { from, event }), "invalidTransition");
    __name(okJson, "okJson");
    __name(parseBody2, "parseBody");
  }
});

// packages/server/src/lib/auth.ts
function assertCan(c, perm, locationId) {
  if (!can(c.get("auth").grants, perm, locationId)) throw forbidden();
}
var SESSION_COOKIE, SESSION_DAYS, requireAuth, requirePerm, authOf;
var init_auth = __esm({
  "packages/server/src/lib/auth.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_src();
    init_cookie2();
    init_db();
    init_http();
    SESSION_COOKIE = "sid";
    SESSION_DAYS = 30;
    requireAuth = /* @__PURE__ */ __name(async (c, next) => {
      const sid = getCookie(c, SESSION_COOKIE);
      if (!sid) throw new Fail(401, "UNAUTHENTICATED", "\u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644");
      const s = await c.env.DB.prepare(
        `SELECT s.id, s.user_id, s.device_id, s.expires_at, u.tenant_id, u.full_name, u.is_active, d.revoked_at
     FROM sessions s JOIN users u ON u.id = s.user_id LEFT JOIN trusted_devices d ON d.id = s.device_id
     WHERE s.id = ?`
      ).bind(sid).first();
      if (!s || s.expires_at < (/* @__PURE__ */ new Date()).toISOString() || s.is_active !== 1 || s.revoked_at) {
        throw new Fail(401, "UNAUTHENTICATED", "\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u062C\u0644\u0633\u0629 \u2014 \u064A\u0631\u062C\u0649 \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u062C\u062F\u062F\u0627\u064B");
      }
      const db = new Db(c.env.DB, s.tenant_id);
      const [grants, settings] = await Promise.all([
        db.all(`SELECT role, location_id FROM user_roles WHERE user_id = ?`, s.user_id),
        db.first(`SELECT * FROM tenant_settings WHERE tenant_id = ?`, s.tenant_id)
      ]);
      if (!settings) throw new Fail(500, "INTERNAL", "\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0623\u062C\u0631 \u0645\u0641\u0642\u0648\u062F\u0629");
      const auth2 = { tenantId: s.tenant_id, userId: s.user_id, userName: s.full_name, sessionId: s.id, deviceId: s.device_id, grants, settings, db };
      c.set("auth", auth2);
      await next();
    }, "requireAuth");
    requirePerm = /* @__PURE__ */ __name((perm) => async (c, next) => {
      if (!can(c.get("auth").grants, perm)) throw forbidden();
      await next();
    }, "requirePerm");
    __name(assertCan, "assertCan");
    authOf = /* @__PURE__ */ __name((c) => c.get("auth"), "authOf");
  }
});

// packages/server/src/modules/notify.ts
async function notify(a, roles, locationId, kind, title2, body, payload) {
  const users = await a.db.all(
    `SELECT DISTINCT u.id FROM users u JOIN user_roles r ON r.user_id = u.id
     WHERE u.tenant_id = ? AND u.is_active = 1 AND r.role IN (SELECT value FROM json_each(?)) AND (r.location_id IS NULL OR r.location_id = ?)`,
    a.tenantId,
    JSON.stringify(roles),
    locationId
  );
  if (!users.length) return;
  await a.db.batch(users.map((u) => a.db.prep(
    `INSERT INTO notifications (id, tenant_id, user_id, kind, title_ar, body_ar, payload) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ulid2(),
    a.tenantId,
    u.id,
    kind,
    title2,
    body,
    JSON.stringify(payload)
  )));
}
var notifications;
var init_notify = __esm({
  "packages/server/src/modules/notify.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_src();
    init_dist();
    init_auth();
    init_http();
    __name(notify, "notify");
    notifications = new Hono3();
    notifications.get("/notifications", async (c) => {
      const a = authOf(c);
      const rows = await a.db.all(`SELECT id, kind, title_ar, body_ar, payload, read_at, created_at FROM notifications WHERE tenant_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50`, a.tenantId, a.userId);
      const unread = await a.db.first(`SELECT COUNT(*) n FROM notifications WHERE tenant_id = ? AND user_id = ? AND read_at IS NULL`, a.tenantId, a.userId);
      return okJson(c, { items: rows, unread: unread?.n ?? 0 });
    });
    notifications.post("/notifications/read-all", async (c) => {
      const a = authOf(c);
      await a.db.run(`UPDATE notifications SET read_at = ? WHERE tenant_id = ? AND user_id = ? AND read_at IS NULL`, (/* @__PURE__ */ new Date()).toISOString(), a.tenantId, a.userId);
      return okJson(c, { ok: true });
    });
  }
});

// packages/server/src/modules/ordering.ts
async function visibleBranchIds(a) {
  const scope = branchScope(a);
  if (scope === null) return null;
  if (scope.length === 0) return [];
  const rows = await a.db.all(
    `SELECT id FROM locations WHERE tenant_id = ? AND kind = 'branch' AND (id IN (SELECT value FROM json_each(?)) OR default_plant_id IN (SELECT value FROM json_each(?)))`,
    a.tenantId,
    JSON.stringify(scope),
    JSON.stringify(scope)
  );
  return rows.map((r) => r.id);
}
function windowStatus(w, now, tz) {
  const cyc = windowCycle(w, now, tz);
  return { ...w, cycle: cyc };
}
async function loadOrder(a, id) {
  const o = await a.db.first(`SELECT * FROM orders WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!o) throw notFound("\u0627\u0644\u0637\u0644\u0628\u064A\u0629");
  const vis = await visibleBranchIds(a);
  if (vis !== null && !vis.includes(o.branch_id)) throw notFound("\u0627\u0644\u0637\u0644\u0628\u064A\u0629");
  return o;
}
async function orderDetail(a, id) {
  const o = await loadOrder(a, id);
  const [lines, revisions, po, branch, deliveries, exceptions] = await Promise.all([
    a.db.all(`SELECT ol.id, ol.product_id, ol.qty, ol.note, p.name_ar AS product_name, p.code AS product_code, u.name_ar AS uom_name, c.name_ar AS category_name, c.id AS category_id, c.sort_order AS category_sort,
                     COALESCE((SELECT SUM(dl.qty_delivered) FROM delivery_lines dl WHERE dl.order_line_id = ol.id), 0) AS qty_delivered
              FROM order_lines ol JOIN products p ON p.id = ol.product_id JOIN uoms u ON u.id = p.uom_id JOIN categories c ON c.id = p.category_id
              WHERE ol.order_id = ? ORDER BY c.sort_order, p.sort_order, p.name_ar`, o.id),
    a.db.all(`SELECT r.revision, r.reason, r.changed_at, u.full_name AS changed_by_name FROM order_revisions r LEFT JOIN users u ON u.id = r.changed_by WHERE r.order_id = ? ORDER BY r.revision DESC`, o.id),
    o.production_order_id ? a.db.first(`SELECT po.id, po.number, po.status, po.expected_ready_at, po.assigned_to_name, u.full_name AS assigned_to_user FROM production_orders po LEFT JOIN users u ON u.id = po.assigned_to WHERE po.id = ? AND po.tenant_id = ?`, o.production_order_id, a.tenantId) : null,
    a.db.first(`SELECT id, code, name_ar FROM locations WHERE id = ? AND tenant_id = ?`, o.branch_id, a.tenantId),
    a.db.all(`SELECT d.id, d.number, d.received_by_name, d.delivered_at, u.full_name AS delivered_by_name, (d.signature_blob IS NOT NULL) AS signed FROM deliveries d JOIN users u ON u.id = d.delivered_by WHERE d.order_id = ? AND d.tenant_id = ? ORDER BY d.delivered_at`, o.id, a.tenantId),
    a.db.all(`SELECT id, reason, status, requested_at, decided_at, decision_note, edit_until, consumed_at FROM order_exceptions WHERE order_id = ? ORDER BY requested_at DESC`, o.id)
  ]);
  const win = await a.db.first(`SELECT * FROM order_windows WHERE id = ? AND tenant_id = ?`, o.window_id, a.tenantId);
  return { ...o, lines, revisions, production_order: po, branch, deliveries, exceptions, window: win };
}
async function ensureProductionOrder(a, plantId, windowId, deliveryDate) {
  const ex = await a.db.first(`SELECT id, status FROM production_orders WHERE plant_id = ? AND window_id = ? AND delivery_date = ? AND tenant_id = ?`, plantId, windowId, deliveryDate, a.tenantId);
  if (ex) return ex;
  const id = ulid2();
  const number = await a.db.nextNumber("PO", Number(deliveryDate.slice(0, 4)));
  await a.db.run(
    `INSERT OR IGNORE INTO production_orders (id, tenant_id, plant_id, window_id, delivery_date, number, status) VALUES (?, ?, ?, ?, ?, ?, 'open')`,
    id,
    a.tenantId,
    plantId,
    windowId,
    deliveryDate,
    number
  );
  const po = await a.db.first(`SELECT id, status FROM production_orders WHERE plant_id = ? AND window_id = ? AND delivery_date = ? AND tenant_id = ?`, plantId, windowId, deliveryDate, a.tenantId);
  if (!po) throw new Fail(500, "INTERNAL", "\u062A\u0639\u0630\u0651\u0631 \u0625\u0646\u0634\u0627\u0621 \u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C");
  return po;
}
async function expireExceptions(a) {
  await a.db.run(`UPDATE order_exceptions SET status = 'expired' WHERE status = 'pending' AND expires_at < ? AND order_id IN (SELECT id FROM orders WHERE tenant_id = ?)`, (/* @__PURE__ */ new Date()).toISOString(), a.tenantId);
}
async function decide(c, decision) {
  const a = authOf(c);
  const body = await c.req.json().catch(() => ({}));
  await expireExceptions(a);
  const e = await a.db.first(
    `SELECT e.id, e.order_id, e.status, o.plant_id, o.branch_id FROM order_exceptions e JOIN orders o ON o.id = e.order_id WHERE e.id = ? AND o.tenant_id = ?`,
    c.req.param("id") ?? "",
    a.tenantId
  );
  if (!e) throw notFound("\u0637\u0644\u0628 \u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0621");
  assertCan(c, "exceptions:decide", e.plant_id);
  if (e.status !== "pending") throw new Fail(409, "INVALID_TRANSITION", e.status === "expired" ? "\u0627\u0646\u062A\u0647\u062A \u0645\u0647\u0644\u0629 \u0637\u0644\u0628 \u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0621" : "\u062A\u0645 \u0627\u0644\u0628\u062A \u0641\u064A \u0627\u0644\u0637\u0644\u0628 \u0645\u0633\u0628\u0642\u0627\u064B");
  const now = /* @__PURE__ */ new Date();
  const editUntil = new Date(now.getTime() + 15 * 6e4).toISOString();
  await a.db.batch([
    a.db.prep(
      `UPDATE order_exceptions SET status = ?, decided_by = ?, decided_at = ?, decision_note = ?, edit_until = ? WHERE id = ?`,
      decision === "approve" ? "approved" : "rejected",
      a.userId,
      now.toISOString(),
      body.note ?? null,
      decision === "approve" ? editUntil : null,
      e.id
    ),
    a.db.audit(a.userId, "order_exception", e.id, decision, { status: "pending" }, { status: decision }, ulid2())
  ]);
  await notify(
    a,
    ["branch_user"],
    e.branch_id,
    "exception_decided",
    decision === "approve" ? "\u0648\u0627\u0641\u0642 \u0627\u0644\u0645\u0639\u0645\u0644 \u0639\u0644\u0649 \u062A\u0639\u062F\u064A\u0644 \u0637\u0644\u0628\u064A\u062A\u0643 \u2014 \u0644\u062F\u064A\u0643 15 \u062F\u0642\u064A\u0642\u0629" : "\u0631\u0641\u0636 \u0627\u0644\u0645\u0639\u0645\u0644 \u0637\u0644\u0628 \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0637\u0644\u0628\u064A\u0629",
    body.note ?? null,
    { order_id: e.order_id }
  );
  return okJson(c, { id: e.id, status: decision === "approve" ? "approved" : "rejected", edit_until: decision === "approve" ? editUntil : null });
}
async function snapshotProduction(a, poId, reason) {
  const { buildDemand: buildDemand2 } = await Promise.resolve().then(() => (init_production(), production_exports));
  const matrix = await buildDemand2(a, poId);
  const v = await a.db.first(`SELECT MAX(version) v FROM production_snapshots WHERE production_order_id = ?`, poId);
  const version2 = (v?.v ?? 0) + 1;
  await a.db.run(
    `INSERT INTO production_snapshots (id, production_order_id, version, demand_matrix, reason, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
    ulid2(),
    poId,
    version2,
    JSON.stringify(matrix),
    reason,
    a.userId === "SYSTEM" ? null : a.userId
  );
  return version2;
}
var ordering, branchScope;
var init_ordering = __esm({
  "packages/server/src/modules/ordering.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_src();
    init_dist();
    init_auth();
    init_http();
    init_notify();
    ordering = new Hono3();
    branchScope = /* @__PURE__ */ __name((a) => scopeFor(a.grants, "orders:read"), "branchScope");
    __name(visibleBranchIds, "visibleBranchIds");
    __name(windowStatus, "windowStatus");
    ordering.get("/windows", async (c) => {
      const a = authOf(c);
      const branchId = c.req.query("branch_id");
      let plantId = null;
      if (branchId) {
        const b = await a.db.first(`SELECT default_plant_id FROM locations WHERE id = ? AND tenant_id = ?`, branchId, a.tenantId);
        plantId = b?.default_plant_id ?? null;
      }
      const rows = await a.db.all(
        `SELECT id, plant_id, name_ar, kind, opens_at, cutoff_time, delivery_offset_days, sort_order, is_active FROM order_windows
     WHERE tenant_id = ? AND (? IS NULL OR plant_id = ?) ORDER BY sort_order`,
        a.tenantId,
        plantId,
        plantId
      );
      const now = /* @__PURE__ */ new Date();
      return okJson(c, rows.map((w) => windowStatus(w, now, a.settings.timezone)));
    });
    __name(loadOrder, "loadOrder");
    __name(orderDetail, "orderDetail");
    ordering.get("/orders", requirePerm("orders:read"), async (c) => {
      const a = authOf(c);
      const vis = await visibleBranchIds(a);
      const from = c.req.query("date_from") ?? "0000-00-00";
      const to = c.req.query("date_to") ?? "9999-99-99";
      const status = c.req.query("status") ?? null;
      const rows = await a.db.all(
        `SELECT o.id, o.branch_id, l.name_ar AS branch_name, o.delivery_date, o.status, o.revision, o.submitted_at, o.window_id, w.name_ar AS window_name, w.kind AS window_kind,
            COUNT(ol.id) AS line_count, COALESCE(SUM(ol.qty), 0) AS total_qty,
            COALESCE((SELECT SUM(dl.qty_delivered) FROM delivery_lines dl JOIN order_lines x ON x.id = dl.order_line_id WHERE x.order_id = o.id), 0) AS total_delivered
     FROM orders o JOIN locations l ON l.id = o.branch_id JOIN order_windows w ON w.id = o.window_id LEFT JOIN order_lines ol ON ol.order_id = o.id
     WHERE o.tenant_id = ? AND o.delivery_date BETWEEN ? AND ? AND (? IS NULL OR o.status = ?)
       AND (? IS NULL OR o.branch_id IN (SELECT value FROM json_each(?)))
     GROUP BY o.id ORDER BY o.delivery_date DESC, l.sort_order LIMIT 200`,
        a.tenantId,
        from,
        to,
        status,
        status,
        vis === null ? null : 1,
        JSON.stringify(vis ?? [])
      );
      return okJson(c, rows);
    });
    ordering.get("/orders/current", requirePerm("orders:read"), async (c) => {
      const a = authOf(c);
      const branchId = c.req.query("branch_id") ?? "";
      const windowId = c.req.query("window_id") ?? "";
      const vis = await visibleBranchIds(a);
      if (vis !== null && !vis.includes(branchId)) throw forbidden();
      const w = await a.db.first(`SELECT * FROM order_windows WHERE id = ? AND tenant_id = ?`, windowId, a.tenantId);
      if (!w) throw notFound("\u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u0637\u0644\u0628");
      const cyc = windowCycle(w, /* @__PURE__ */ new Date(), a.settings.timezone);
      const o = await a.db.first(`SELECT id FROM orders WHERE tenant_id = ? AND branch_id = ? AND window_id = ? AND delivery_date = ?`, a.tenantId, branchId, windowId, cyc.deliveryDate);
      return okJson(c, { cycle: cyc, window: w, order: o ? await orderDetail(a, o.id) : null });
    });
    ordering.get("/orders/:id", requirePerm("orders:read"), async (c) => okJson(c, await orderDetail(authOf(c), c.req.param("id"))));
    ordering.get("/orders-copy-source", requirePerm("orders:submit"), async (c) => {
      const a = authOf(c);
      const branchId = c.req.query("branch_id") ?? "";
      assertCan(c, "orders:submit", branchId);
      const before = c.req.query("before") ?? "9999-99-99";
      const o = await a.db.first(
        `SELECT id, delivery_date FROM orders WHERE tenant_id = ? AND branch_id = ? AND window_id = ? AND delivery_date < ? AND status <> 'cancelled' ORDER BY delivery_date DESC LIMIT 1`,
        a.tenantId,
        branchId,
        c.req.query("window_id") ?? "",
        before
      );
      if (!o) return okJson(c, null);
      const lines = await a.db.all(`SELECT product_id, qty, note FROM order_lines WHERE order_id = ?`, o.id);
      return okJson(c, { delivery_date: o.delivery_date, lines });
    });
    __name(ensureProductionOrder, "ensureProductionOrder");
    ordering.post("/orders/submit", requirePerm("orders:submit"), async (c) => {
      const a = authOf(c);
      const input = await parseBody2(c, SubmitOrderInput);
      const idem = await a.db.getIdempotent(`order.submit:${input.client_uuid}`);
      if (idem) return okJson(c, idem);
      const w = await a.db.first(`SELECT * FROM order_windows WHERE id = ? AND tenant_id = ? AND is_active = 1`, input.window_id, a.tenantId);
      if (!w) throw notFound("\u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u0637\u0644\u0628");
      const myBranches = scopeFor(a.grants, "orders:submit");
      const branchId = input.branch_id ?? myBranches?.[0];
      if (!branchId) throw new Fail(422, "BUSINESS_RULE", "\u0644\u0645 \u064A\u064F\u062D\u062F\u064E\u0651\u062F \u0627\u0644\u0641\u0631\u0639", { rule: "A3" });
      assertCan(c, "orders:submit", branchId);
      const branch = await a.db.first(`SELECT id, default_plant_id, name_ar FROM locations WHERE id = ? AND tenant_id = ? AND kind = 'branch'`, branchId, a.tenantId);
      if (!branch) throw notFound("\u0627\u0644\u0641\u0631\u0639");
      if (branch.default_plant_id !== w.plant_id) throw new Fail(422, "BUSINESS_RULE", "\u0647\u0630\u0647 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u0644\u0627 \u062A\u062E\u062F\u0645 \u0641\u0631\u0639\u0643", { rule: "A4" });
      const now = /* @__PURE__ */ new Date();
      const tz = a.settings.timezone;
      const cyc = windowCycle(w, now, tz);
      const deliveryDate = input.delivery_date ?? cyc.deliveryDate;
      const existing = await a.db.first(`SELECT * FROM orders WHERE tenant_id = ? AND branch_id = ? AND window_id = ? AND delivery_date = ?`, a.tenantId, branchId, w.id, deliveryDate);
      let exceptionId = null;
      if (isCycleClosed(w, deliveryDate, now, tz) || existing && existing.status === "locked") {
        const ex = existing && await a.db.first(
          `SELECT id FROM order_exceptions WHERE order_id = ? AND status = 'approved' AND consumed_at IS NULL AND (edit_until IS NULL OR edit_until > ?) ORDER BY decided_at DESC LIMIT 1`,
          existing.id,
          now.toISOString()
        );
        if (!ex || !existing || existing.status !== "locked") {
          const cutoff = w.cutoff_time ?? "";
          throw new Fail(423, "WINDOW_CLOSED", `\u0623\u064F\u063A\u0644\u0642\u062A \u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0633\u0627\u0639\u0629 ${cutoff}. \u064A\u0645\u0643\u0646\u0643 \u0637\u0644\u0628 \u0627\u0633\u062A\u062B\u0646\u0627\u0621 \u0645\u0646 \u0627\u0644\u0645\u0639\u0645\u0644.`, { cutoff, can_request_exception: Boolean(existing), order_id: existing?.id ?? null });
        }
        exceptionId = ex.id;
      }
      if (deliveryDate !== cyc.deliveryDate && !exceptionId && cyc.closesAt !== null) {
        throw new Fail(423, "WINDOW_CLOSED", "\u0647\u0630\u0647 \u0627\u0644\u062F\u0648\u0631\u0629 \u0644\u0645 \u062A\u0639\u062F \u0645\u0641\u062A\u0648\u062D\u0629 \u0644\u0644\u0637\u0644\u0628", { can_request_exception: Boolean(existing), order_id: existing?.id ?? null });
      }
      const productIds = [...new Set(input.lines.map((l) => l.product_id))];
      const products = await a.db.all(
        `SELECT p.id, u.decimals AS uom_decimals,
            EXISTS (SELECT 1 FROM product_availability pa WHERE pa.product_id = p.id) AS restricted,
            EXISTS (SELECT 1 FROM product_availability pa WHERE pa.product_id = p.id AND pa.location_id = ?) AS allowed
     FROM products p JOIN uoms u ON u.id = p.uom_id WHERE p.tenant_id = ? AND p.is_active = 1 AND p.id IN (SELECT value FROM json_each(?))`,
        branchId,
        a.tenantId,
        JSON.stringify(productIds)
      );
      const pmap = new Map(products.map((p) => [p.id, p]));
      const lines = input.lines.map((l, i) => {
        const p = pmap.get(l.product_id);
        if (!p || p.restricted && !p.allowed) throw new Fail(422, "BUSINESS_RULE", "\u0635\u0646\u0641 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0644\u0641\u0631\u0639\u0643", { rule: "B6", line_index: i });
        const q = parseQty(String(l.qty), Math.min(p.uom_decimals, a.settings.qty_decimals));
        if (!q || q <= 0) throw new Fail(422, "BUSINESS_RULE", "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0635\u0641\u0631", { rule: "C2", line_index: i });
        return { product_id: l.product_id, qty: qtyToDb(q), note: l.note?.trim() || null, sort: i };
      });
      if (new Set(lines.map((l) => l.product_id)).size !== lines.length) throw new Fail(409, "DUPLICATE", "\u0635\u0646\u0641 \u0645\u0643\u0631\u0631 \u0641\u064A \u0627\u0644\u0637\u0644\u0628\u064A\u0629", { rule: "C3" });
      const status = existing?.status ?? "draft";
      const event = exceptionId ? "approve_exception" : existing?.status === "cancelled" ? "reopen" : "submit";
      const t = OrderMachine.transition(status, event);
      if (!t.ok) throw invalidTransition(status, event);
      const po = await ensureProductionOrder(a, w.plant_id, w.id, deliveryDate);
      if (!["open", "locked"].includes(po.status)) throw new Fail(409, "CONFLICT", "\u0628\u062F\u0623 \u0627\u0644\u0645\u0639\u0645\u0644 \u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0647 \u0627\u0644\u0637\u0644\u0628\u064A\u0629", { po_status: po.status });
      const orderId = existing?.id ?? ulid2();
      const revision = existing ? existing.revision + 1 : 1;
      const nowIso = now.toISOString();
      const stmts = [];
      if (!existing) {
        stmts.push(a.db.prep(`INSERT INTO orders (id, tenant_id, branch_id, plant_id, window_id, delivery_date, status, note, submitted_by, submitted_at, production_order_id, client_uuid, revision)
      VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?, ?, ?, 1)`, orderId, a.tenantId, branchId, w.plant_id, w.id, deliveryDate, input.note ?? null, a.userId, nowIso, po.id, input.client_uuid));
      } else {
        stmts.push(a.db.prep(
          `UPDATE orders SET status = ?, note = ?, submitted_by = ?, submitted_at = ?, revision = ?, cancel_reason = NULL, production_order_id = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`,
          t.value,
          input.note ?? null,
          a.userId,
          nowIso,
          revision,
          po.id,
          nowIso,
          orderId,
          a.tenantId
        ));
        stmts.push(a.db.prep(`DELETE FROM order_lines WHERE order_id = ?`, orderId));
      }
      for (const l of lines) stmts.push(a.db.prep(`INSERT INTO order_lines (id, order_id, product_id, qty, note, sort_order) VALUES (?, ?, ?, ?, ?, ?)`, ulid2(), orderId, l.product_id, l.qty, l.note, l.sort));
      stmts.push(a.db.prep(
        `INSERT INTO order_revisions (id, order_id, revision, lines_snapshot, note_snapshot, reason, changed_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ulid2(),
        orderId,
        revision,
        JSON.stringify(lines),
        input.note ?? null,
        exceptionId ? `exception:${exceptionId}` : existing ? "revise" : "submit",
        a.userId
      ));
      if (exceptionId) stmts.push(a.db.prep(`UPDATE order_exceptions SET consumed_at = ? WHERE id = ?`, nowIso, exceptionId));
      stmts.push(a.db.audit(
        a.userId,
        "order",
        orderId,
        existing ? exceptionId ? "revise_exception" : "revise" : "submit",
        existing ? { status: existing.status, revision: existing.revision } : null,
        { status: t.value, revision, lines: lines.length },
        ulid2()
      ));
      const result = { order: { id: orderId, status: t.value, revision, delivery_date: deliveryDate, production_order_id: po.id }, window: { closes_at: cyc.closesAt, closes_in_minutes: cyc.closesInMinutes } };
      stmts.push(a.db.saveIdempotent(`order.submit:${input.client_uuid}`, "order.submit", result));
      await a.db.batch(stmts);
      if (exceptionId) await snapshotProduction(a, po.id, `exception:${exceptionId}`);
      const totalQty = lines.reduce((s, l) => s + qtyFromDb(l.qty), 0) / 1e4;
      await notify(
        a,
        ["plant_manager", "plant_staff"],
        w.plant_id,
        "order_submitted",
        existing ? `\u0639\u062F\u0651\u0644 ${branch.name_ar} \u0637\u0644\u0628\u064A\u062A\u0647` : `\u0623\u0631\u0633\u0644 ${branch.name_ar} \u0637\u0644\u0628\u064A\u062A\u0647`,
        `${lines.length} \u0635\u0646\u0641\u0627\u064B \xB7 ${totalQty.toLocaleString("en")} \u0648\u062D\u062F\u0629`,
        { order_id: orderId }
      );
      return okJson(c, result);
    });
    ordering.post("/orders/:id/cancel", async (c) => {
      const a = authOf(c);
      const { reason } = await parseBody2(c, CancelInput);
      const o = await loadOrder(a, c.req.param("id"));
      const isPlant = can(a.grants, "production:manage");
      const isBranch = can(a.grants, "orders:cancel", o.branch_id) && !isPlant;
      if (!isPlant && !isBranch) throw forbidden();
      if (isBranch && !["draft", "submitted"].includes(o.status)) throw new Fail(423, "WINDOW_CLOSED", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0637\u0644\u0628\u064A\u0629 \u0628\u0639\u062F \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u2014 \u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u0639\u0645\u0644");
      const t = OrderMachine.transition(o.status, "cancel");
      if (!t.ok) throw invalidTransition(o.status, "cancel");
      await a.db.batch([
        a.db.prep(`UPDATE orders SET status = 'cancelled', cancel_reason = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, reason, (/* @__PURE__ */ new Date()).toISOString(), o.id, a.tenantId),
        a.db.audit(a.userId, "order", o.id, "cancel", { status: o.status }, { status: "cancelled", reason }, ulid2())
      ]);
      return okJson(c, { id: o.id, status: "cancelled" });
    });
    ordering.post("/orders/:id/exceptions", requirePerm("exceptions:request"), async (c) => {
      const a = authOf(c);
      const { reason } = await parseBody2(c, CancelInput);
      const o = await loadOrder(a, c.req.param("id"));
      assertCan(c, "exceptions:request", o.branch_id);
      if (o.status !== "locked") throw new Fail(409, "CONFLICT", "\u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0621 \u0645\u062A\u0627\u062D \u0641\u0642\u0637 \u0644\u0637\u0644\u0628\u064A\u0629 \u0645\u0642\u0641\u0644\u0629 \u0644\u0645 \u064A\u0628\u062F\u0623 \u0625\u0646\u062A\u0627\u062C\u0647\u0627");
      const pending = await a.db.first(`SELECT 1 FROM order_exceptions WHERE order_id = ? AND status = 'pending'`, o.id);
      if (pending) throw new Fail(409, "CONFLICT", "\u064A\u0648\u062C\u062F \u0637\u0644\u0628 \u0627\u0633\u062A\u062B\u0646\u0627\u0621 \u0642\u064A\u062F \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631");
      const id = ulid2();
      const exp = new Date(Date.now() + a.settings.exception_ttl_minutes * 6e4).toISOString();
      await a.db.batch([
        a.db.prep(`INSERT INTO order_exceptions (id, order_id, requested_by, reason, expires_at) VALUES (?, ?, ?, ?, ?)`, id, o.id, a.userId, reason, exp),
        a.db.audit(a.userId, "order_exception", id, "request", null, { order_id: o.id, reason }, ulid2())
      ]);
      const b = await a.db.first(`SELECT name_ar FROM locations WHERE id = ?`, o.branch_id);
      await notify(a, ["plant_manager"], o.plant_id, "exception_requested", `${b?.name_ar ?? ""} \u064A\u0637\u0644\u0628 \u062A\u0639\u062F\u064A\u0644 \u0637\u0644\u0628\u064A\u062A\u0647`, `\xAB${reason}\xBB`, { order_id: o.id, exception_id: id });
      return okJson(c, { id, status: "pending", expires_at: exp }, 201);
    });
    ordering.get("/exceptions", requirePerm("exceptions:decide"), async (c) => {
      const a = authOf(c);
      await expireExceptions(a);
      const rows = await a.db.all(
        `SELECT e.id, e.order_id, e.reason, e.status, e.requested_at, e.expires_at, e.decided_at, e.decision_note, l.name_ar AS branch_name, o.delivery_date, u.full_name AS requested_by_name
     FROM order_exceptions e JOIN orders o ON o.id = e.order_id JOIN locations l ON l.id = o.branch_id JOIN users u ON u.id = e.requested_by
     WHERE o.tenant_id = ? ORDER BY CASE e.status WHEN 'pending' THEN 0 ELSE 1 END, e.requested_at DESC LIMIT 100`,
        a.tenantId
      );
      return okJson(c, rows);
    });
    __name(expireExceptions, "expireExceptions");
    __name(decide, "decide");
    ordering.post("/exceptions/:id/approve", requirePerm("exceptions:decide"), (c) => decide(c, "approve"));
    ordering.post("/exceptions/:id/reject", requirePerm("exceptions:decide"), (c) => decide(c, "reject"));
    __name(snapshotProduction, "snapshotProduction");
  }
});

// packages/server/src/modules/production.ts
var production_exports = {};
__export(production_exports, {
  buildDemand: () => buildDemand,
  cronLock: () => cronLock,
  lockProduction: () => lockProduction,
  production: () => production,
  settleDelivered: () => settleDelivered
});
async function buildDemand(a, poId) {
  const rows = await a.db.all(
    `SELECT c.id AS category_id, c.name_ar AS category_name, c.sort_order AS category_sort, c.color AS category_color, p.id AS product_id, p.code AS product_code, p.name_ar AS product_name, p.sort_order AS product_sort,
            u.name_ar AS uom_name, o.branch_id, l.code AS branch_code, l.name_ar AS branch_name, l.sort_order AS branch_sort, ol.qty, ol.note AS line_note, o.note AS order_note, o.id AS order_id, o.status AS order_status
     FROM orders o JOIN order_lines ol ON ol.order_id = o.id JOIN products p ON p.id = ol.product_id JOIN categories c ON c.id = p.category_id
     JOIN uoms u ON u.id = p.uom_id JOIN locations l ON l.id = o.branch_id
     WHERE o.production_order_id = ? AND o.tenant_id = ? AND o.status NOT IN ('draft','cancelled')
     ORDER BY c.sort_order, p.sort_order, p.name_ar`,
    poId,
    a.tenantId
  );
  const branches = /* @__PURE__ */ new Map();
  const cats = /* @__PURE__ */ new Map();
  const orderNotes = /* @__PURE__ */ new Map();
  for (const r of rows) {
    branches.set(r.branch_id, { id: r.branch_id, code: r.branch_code, name: r.branch_name, sort: r.branch_sort });
    let cat = cats.get(r.category_id);
    if (!cat) cats.set(r.category_id, cat = { id: r.category_id, name: r.category_name, color: r.category_color, products: /* @__PURE__ */ new Map() });
    let p = cat.products.get(r.product_id);
    if (!p) cat.products.set(r.product_id, p = { id: r.product_id, code: r.product_code, name: r.product_name, uom: r.uom_name, total: 0, by_branch: {}, notes: [] });
    p.total = Math.round((p.total + r.qty) * 1e4) / 1e4;
    p.by_branch[r.branch_id] = { qty: r.qty, note: r.line_note };
    if (r.line_note) p.notes.push({ branch_id: r.branch_id, branch: r.branch_name, note: r.line_note });
    if (r.order_note) orderNotes.set(r.branch_id, { branch_id: r.branch_id, branch_name: r.branch_name, note: r.order_note });
  }
  const branchList = [...branches.values()].sort((x, y) => x.sort - y.sort || x.code.localeCompare(y.code));
  const categories = [...cats.values()].map((c) => {
    const products = [...c.products.values()];
    const by_branch = {};
    for (const p of products) for (const [b, v] of Object.entries(p.by_branch)) by_branch[b] = Math.round(((by_branch[b] ?? 0) + v.qty) * 1e4) / 1e4;
    return { id: c.id, name: c.name, color: c.color, products, total: products.reduce((s, p) => s + p.total, 0), by_branch };
  });
  const units = categories.reduce((s, c) => s + c.total, 0);
  const orders = new Set(rows.map((r) => r.order_id)).size;
  return { branches: branchList, categories, order_notes: [...orderNotes.values()], totals: { products: categories.reduce((s, c) => s + c.products.length, 0), units: Math.round(units * 1e4) / 1e4, orders, notes: orderNotes.size + rows.filter((r) => r.line_note).length } };
}
async function loadPo(a, id) {
  const po = await a.db.first(`SELECT * FROM production_orders WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!po) throw notFound("\u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C");
  return po;
}
async function poVersion(a, id) {
  const r = await a.db.first(
    `SELECT COALESCE(MAX(o.updated_at), '') || ':' || COUNT(o.id) || ':' || po.updated_at || ':' || po.status AS v FROM production_orders po LEFT JOIN orders o ON o.production_order_id = po.id WHERE po.id = ? AND po.tenant_id = ?`,
    id,
    a.tenantId
  );
  return r?.v ?? "";
}
async function lockProduction(a, po, manual) {
  const t = ProductionMachine.transition(po.status, "lock");
  if (!t.ok) throw invalidTransition(po.status, "lock");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await a.db.batch([
    a.db.prep(`UPDATE production_orders SET status = 'locked', locked_at = ?, locked_by = ?, updated_at = ? WHERE id = ? AND tenant_id = ? AND status = 'open'`, now, manual ? a.userId : null, now, po.id, a.tenantId),
    a.db.prep(`UPDATE orders SET status = 'locked', updated_at = ? WHERE production_order_id = ? AND tenant_id = ? AND status = 'submitted'`, now, po.id, a.tenantId),
    a.db.audit(manual ? a.userId : null, "production_order", po.id, "lock", { status: po.status }, { status: "locked", manual }, ulid2())
  ]);
  const v = await snapshotProduction(a, po.id, manual ? "manual_lock" : "cutoff");
  const d = await buildDemand(a, po.id);
  await notify(a, ["plant_manager"], po.plant_id, "window_closed", `\u0623\u064F\u063A\u0644\u0642 ${po.number}`, `${d.branches.length} \u0641\u0631\u0648\u0639 \xB7 ${d.totals.units.toLocaleString("en")} \u0648\u062D\u062F\u0629`, { production_order_id: po.id });
  return v;
}
async function cascadeOrders(a, poId, from, event, to) {
  for (const f of from) if (!OrderMachine.can(f, event)) throw invalidTransition(f, event);
  await a.db.run(`UPDATE orders SET status = ?, updated_at = ? WHERE production_order_id = ? AND tenant_id = ? AND status IN (SELECT value FROM json_each(?))`, to, (/* @__PURE__ */ new Date()).toISOString(), poId, a.tenantId, JSON.stringify(from));
}
async function settleDelivered(a, poId) {
  const r = await a.db.first(
    `SELECT SUM(CASE WHEN o.status NOT IN ('delivered','cancelled') THEN 1 ELSE 0 END) AS open, COUNT(o.id) AS total, po.status
     FROM production_orders po LEFT JOIN orders o ON o.production_order_id = po.id WHERE po.id = ? AND po.tenant_id = ?`,
    poId,
    a.tenantId
  );
  if (r && r.status === "completed" && r.total > 0 && r.open === 0) {
    await a.db.batch([
      a.db.prep(`UPDATE production_orders SET status = 'delivered', updated_at = ? WHERE id = ? AND tenant_id = ?`, (/* @__PURE__ */ new Date()).toISOString(), poId, a.tenantId),
      a.db.audit(null, "production_order", poId, "deliver", { status: "completed" }, { status: "delivered" }, ulid2())
    ]);
  }
}
async function cronLock(env2) {
  const { Db: Db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const tenants = await env2.DB.prepare(`SELECT t.id, s.timezone FROM tenants t JOIN tenant_settings s ON s.tenant_id = t.id WHERE t.status = 'active'`).all();
  for (const t of tenants.results) {
    const db = new Db2(env2.DB, t.id);
    const open = await db.all(
      `SELECT po.*, w.kind, w.cutoff_time, w.delivery_offset_days FROM production_orders po JOIN order_windows w ON w.id = po.window_id WHERE po.tenant_id = ? AND po.status = 'open' AND w.kind = 'regular'`,
      t.id
    );
    for (const po of open) {
      if (!isCycleClosed(po, po.delivery_date, /* @__PURE__ */ new Date(), t.timezone)) continue;
      const settings = await db.first(`SELECT * FROM tenant_settings WHERE tenant_id = ?`, t.id);
      const a = { tenantId: t.id, userId: "SYSTEM", userName: "\u0627\u0644\u0646\u0638\u0627\u0645", sessionId: "", deviceId: null, grants: [], settings, db };
      await lockProduction(a, po, false);
    }
  }
}
var production;
var init_production = __esm({
  "packages/server/src/modules/production.ts"() {
    "use strict";
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_src();
    init_dist();
    init_auth();
    init_http();
    init_notify();
    init_ordering();
    production = new Hono3();
    __name(buildDemand, "buildDemand");
    __name(loadPo, "loadPo");
    __name(poVersion, "poVersion");
    production.get("/production-orders", requirePerm("production:read"), async (c) => {
      const a = authOf(c);
      const rows = await a.db.all(
        `SELECT po.id, po.number, po.status, po.delivery_date, po.expected_ready_at, po.assigned_to_name, w.name_ar AS window_name, w.kind AS window_kind, l.name_ar AS plant_name,
            (SELECT COUNT(*) FROM orders o WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS order_count,
            (SELECT COALESCE(SUM(ol.qty),0) FROM orders o JOIN order_lines ol ON ol.order_id = o.id WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS total_units
     FROM production_orders po JOIN order_windows w ON w.id = po.window_id JOIN locations l ON l.id = po.plant_id
     WHERE po.tenant_id = ? ORDER BY po.delivery_date DESC, w.sort_order LIMIT 60`,
        a.tenantId
      );
      return okJson(c, rows);
    });
    production.get("/production-orders/:id", requirePerm("production:read"), async (c) => {
      const a = authOf(c);
      const po = await loadPo(a, c.req.param("id"));
      const [demand, snapshot, win, plant, sections, orders, branchesExpected, users] = await Promise.all([
        buildDemand(a, po.id),
        a.db.first(`SELECT version, created_at, reason FROM production_snapshots WHERE production_order_id = ? ORDER BY version DESC LIMIT 1`, po.id),
        a.db.first(`SELECT * FROM order_windows WHERE id = ?`, po.window_id),
        a.db.first(`SELECT id, name_ar, phone, address FROM locations WHERE id = ?`, po.plant_id),
        a.db.all(`SELECT s.*, c.name_ar AS category_name, u.full_name AS assigned_to_user FROM production_sections s LEFT JOIN categories c ON c.id = s.category_id LEFT JOIN users u ON u.id = s.assigned_to WHERE s.production_order_id = ? ORDER BY s.sort_order`, po.id),
        a.db.all(`SELECT o.id, o.branch_id, o.status, o.revision, o.submitted_at, l.name_ar AS branch_name, COUNT(ol.id) AS line_count, COALESCE(SUM(ol.qty),0) AS total_qty,
                     COALESCE((SELECT SUM(dl.qty_delivered) FROM delivery_lines dl JOIN order_lines x ON x.id = dl.order_line_id WHERE x.order_id = o.id),0) AS total_delivered
              FROM orders o JOIN locations l ON l.id = o.branch_id LEFT JOIN order_lines ol ON ol.order_id = o.id WHERE o.production_order_id = ? AND o.tenant_id = ? GROUP BY o.id ORDER BY l.sort_order`, po.id, a.tenantId),
        a.db.all(`SELECT id, name_ar FROM locations WHERE tenant_id = ? AND kind = 'branch' AND is_active = 1 AND default_plant_id = ? ORDER BY sort_order`, a.tenantId, po.plant_id),
        a.db.all(`SELECT DISTINCT u.id, u.full_name FROM users u JOIN user_roles r ON r.user_id = u.id WHERE u.tenant_id = ? AND u.is_active = 1 AND r.role IN ('plant_manager','plant_staff') ORDER BY u.full_name`, a.tenantId)
      ]);
      const cycleClosed = win ? isCycleClosed(win, po.delivery_date, /* @__PURE__ */ new Date(), a.settings.timezone) : false;
      const assignedUser = po.assigned_to ? await a.db.first(`SELECT full_name FROM users WHERE id = ?`, po.assigned_to) : null;
      return okJson(c, {
        header: { ...po, assigned_to_user: assignedUser?.full_name ?? null, window: win, plant, cycle_closed: cycleClosed, closes_at: win && po.status === "open" ? windowCycle(win, /* @__PURE__ */ new Date(), a.settings.timezone).closesAt : null },
        ...demand,
        snapshot_version: snapshot?.version ?? null,
        snapshot_at: snapshot?.created_at ?? null,
        sections,
        orders,
        missing_branches: branchesExpected.filter((b) => !orders.some((o) => o.branch_id === b.id && o.status !== "cancelled")),
        staff: users,
        version: await poVersion(a, po.id)
      });
    });
    production.get("/production-orders/:id/version", requirePerm("production:read"), async (c) => {
      const a = authOf(c);
      const v = await poVersion(a, c.req.param("id"));
      const etag = `"${v.replace(/[^\w:.-]/g, "")}"`;
      if (c.req.header("if-none-match") === etag) return c.body(null, 304);
      c.header("ETag", etag);
      return okJson(c, { version: v });
    });
    production.get("/production-orders/:id/print", requirePerm("production:print"), async (c) => {
      const a = authOf(c);
      const po = await loadPo(a, c.req.param("id"));
      const snap = await a.db.first(`SELECT version, demand_matrix, created_at FROM production_snapshots WHERE production_order_id = ? ORDER BY version DESC LIMIT 1`, po.id);
      const matrix = snap ? JSON.parse(snap.demand_matrix) : await buildDemand(a, po.id);
      const [win, plant, branding, assigned, sections] = await Promise.all([
        a.db.first(`SELECT name_ar, kind, cutoff_time FROM order_windows WHERE id = ?`, po.window_id),
        a.db.first(`SELECT name_ar, phone, address FROM locations WHERE id = ?`, po.plant_id),
        a.db.first(`SELECT company_name, logo_url, primary_color, phone, address, footer_text FROM tenant_branding WHERE tenant_id = ?`, a.tenantId),
        po.assigned_to ? a.db.first(`SELECT full_name FROM users WHERE id = ?`, po.assigned_to) : null,
        a.db.all(`SELECT s.category_id, s.name_ar, s.expected_ready_at, u.full_name AS assigned FROM production_sections s LEFT JOIN users u ON u.id = s.assigned_to WHERE s.production_order_id = ?`, po.id)
      ]);
      return okJson(c, { po: { ...po, assigned_name: po.assigned_to_name ?? assigned?.full_name ?? null }, matrix, snapshot_version: snap?.version ?? null, snapshot_at: snap?.created_at ?? null, window: win, plant, branding, sections, printed_by: a.userName, printed_at: (/* @__PURE__ */ new Date()).toISOString(), timezone: a.settings.timezone });
    });
    production.patch("/production-orders/:id", requirePerm("production:manage"), async (c) => {
      const a = authOf(c);
      const i = await parseBody2(c, AssignInput);
      const po = await loadPo(a, c.req.param("id"));
      assertCan(c, "production:manage", po.plant_id);
      if (["delivered", "cancelled"].includes(po.status)) throw invalidTransition(po.status, "assign");
      if (i.expected_ready_at && Date.parse(i.expected_ready_at) < Date.now() - 6e4) throw new Fail(422, "BUSINESS_RULE", "\u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u062A\u0648\u0642\u0639 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0641\u064A \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644", { rule: "D12" });
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await a.db.batch([
        a.db.prep(
          `UPDATE production_orders SET assigned_to = COALESCE(?, assigned_to), assigned_to_name = COALESCE(?, assigned_to_name), expected_ready_at = COALESCE(?, expected_ready_at), note = COALESCE(?, note), updated_at = ? WHERE id = ? AND tenant_id = ?`,
          i.assigned_to ?? null,
          i.assigned_to_name ?? null,
          i.expected_ready_at ?? null,
          i.note ?? null,
          now,
          po.id,
          a.tenantId
        ),
        a.db.audit(a.userId, "production_order", po.id, "assign", { assigned_to: po.assigned_to, assigned_to_name: po.assigned_to_name, expected_ready_at: po.expected_ready_at }, i, ulid2())
      ]);
      return okJson(c, { id: po.id });
    });
    __name(lockProduction, "lockProduction");
    production.post("/production-orders/:id/lock", requirePerm("production:manage"), async (c) => {
      const a = authOf(c);
      const po = await loadPo(a, c.req.param("id"));
      assertCan(c, "production:manage", po.plant_id);
      const v = await lockProduction(a, po, true);
      return okJson(c, { id: po.id, status: "locked", snapshot_version: v });
    });
    __name(cascadeOrders, "cascadeOrders");
    production.post("/production-orders/:id/start", requirePerm("production:manage"), async (c) => {
      const a = authOf(c);
      const po = await loadPo(a, c.req.param("id"));
      assertCan(c, "production:manage", po.plant_id);
      const t = ProductionMachine.transition(po.status, "start");
      if (!t.ok) throw new Fail(409, "INVALID_TRANSITION", po.status === "open" ? "\u0627\u0642\u0641\u0644 \u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0623\u0648\u0644\u0627\u064B" : "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0628\u062F\u0621 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u062D\u0627\u0644\u0629", { rule: "D6" });
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await a.db.batch([
        a.db.prep(`UPDATE production_orders SET status = 'in_progress', started_at = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, now, now, po.id, a.tenantId),
        a.db.audit(a.userId, "production_order", po.id, "start", { status: po.status }, { status: "in_progress" }, ulid2())
      ]);
      await cascadeOrders(a, po.id, ["locked"], "start", "in_production");
      const exp = po.expected_ready_at ? ` \xB7 \u0645\u062A\u0648\u0642\u0639 ${new Intl.DateTimeFormat("ar", { timeZone: a.settings.timezone, hour: "numeric", minute: "2-digit" }).format(new Date(po.expected_ready_at))}` : "";
      const branches = await a.db.all(`SELECT branch_id FROM orders WHERE production_order_id = ? AND status = 'in_production'`, po.id);
      for (const b of branches) await notify(a, ["branch_user"], b.branch_id, "production_started", `\u0628\u062F\u0623 \u0625\u0646\u062A\u0627\u062C \u0637\u0644\u0628\u064A\u062A\u0643${exp}`, null, { production_order_id: po.id });
      return okJson(c, { id: po.id, status: "in_progress" });
    });
    production.post("/production-orders/:id/complete", requirePerm("production:manage"), async (c) => {
      const a = authOf(c);
      const po = await loadPo(a, c.req.param("id"));
      assertCan(c, "production:manage", po.plant_id);
      const t = ProductionMachine.transition(po.status, "complete");
      if (!t.ok) throw invalidTransition(po.status, "complete");
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await a.db.batch([
        a.db.prep(`UPDATE production_orders SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, now, now, po.id, a.tenantId),
        a.db.audit(a.userId, "production_order", po.id, "complete", { status: po.status }, { status: "completed" }, ulid2())
      ]);
      const branches = await a.db.all(`SELECT branch_id FROM orders WHERE production_order_id = ? AND status = 'in_production'`, po.id);
      await cascadeOrders(a, po.id, ["in_production"], "mark_ready", "ready");
      for (const b of branches) await notify(a, ["branch_user"], b.branch_id, "order_ready", "\u0637\u0644\u0628\u064A\u062A\u0643 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0633\u0644\u064A\u0645", null, { production_order_id: po.id });
      await settleDelivered(a, po.id);
      return okJson(c, { id: po.id, status: "completed" });
    });
    production.post("/production-orders/:id/cancel", requirePerm("production:manage"), async (c) => {
      const a = authOf(c);
      const { reason } = await parseBody2(c, CancelInput);
      const po = await loadPo(a, c.req.param("id"));
      const t = ProductionMachine.transition(po.status, "cancel");
      if (!t.ok) throw invalidTransition(po.status, "cancel");
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await a.db.batch([
        a.db.prep(`UPDATE production_orders SET status = 'cancelled', note = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, reason, now, po.id, a.tenantId),
        a.db.prep(`UPDATE orders SET status = 'cancelled', cancel_reason = ?, updated_at = ? WHERE production_order_id = ? AND tenant_id = ? AND status IN ('submitted','locked')`, reason, now, po.id, a.tenantId),
        a.db.audit(a.userId, "production_order", po.id, "cancel", { status: po.status }, { status: "cancelled", reason }, ulid2())
      ]);
      return okJson(c, { id: po.id, status: "cancelled" });
    });
    __name(settleDelivered, "settleDelivered");
    __name(cronLock, "cronLock");
  }
});

// packages/server/src/index.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_dist();

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/middleware/secure-headers/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/middleware/secure-headers/secure-headers.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/utils/encode.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/.pnpm/hono@4.13.12/node_modules/hono/dist/middleware/secure-headers/secure-headers.js
var HEADERS_MAP = {
  crossOriginEmbedderPolicy: ["Cross-Origin-Embedder-Policy", "require-corp"],
  crossOriginResourcePolicy: ["Cross-Origin-Resource-Policy", "same-origin"],
  crossOriginOpenerPolicy: ["Cross-Origin-Opener-Policy", "same-origin"],
  originAgentCluster: ["Origin-Agent-Cluster", "?1"],
  referrerPolicy: ["Referrer-Policy", "no-referrer"],
  strictTransportSecurity: ["Strict-Transport-Security", "max-age=15552000; includeSubDomains"],
  xContentTypeOptions: ["X-Content-Type-Options", "nosniff"],
  xDnsPrefetchControl: ["X-DNS-Prefetch-Control", "off"],
  xDownloadOptions: ["X-Download-Options", "noopen"],
  xFrameOptions: ["X-Frame-Options", "SAMEORIGIN"],
  xPermittedCrossDomainPolicies: ["X-Permitted-Cross-Domain-Policies", "none"],
  xXssProtection: ["X-XSS-Protection", "0"]
};
var DEFAULT_OPTIONS = {
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: true,
  crossOriginOpenerPolicy: true,
  originAgentCluster: true,
  referrerPolicy: true,
  strictTransportSecurity: true,
  xContentTypeOptions: true,
  xDnsPrefetchControl: true,
  xDownloadOptions: true,
  xFrameOptions: true,
  xPermittedCrossDomainPolicies: true,
  xXssProtection: true,
  removePoweredBy: true,
  permissionsPolicy: {}
};
var secureHeaders = /* @__PURE__ */ __name((customOptions) => {
  const options = {
    ...DEFAULT_OPTIONS,
    ...customOptions
  };
  const headersToSet = getFilteredHeaders(options);
  const callbacks = [];
  if (options.contentSecurityPolicy) {
    const [callback, value] = getCSPDirectives(options.contentSecurityPolicy, "Content-Security-Policy");
    if (callback) callbacks.push(callback);
    headersToSet.push(["Content-Security-Policy", value]);
  }
  if (options.contentSecurityPolicyReportOnly) {
    const [callback, value] = getCSPDirectives(options.contentSecurityPolicyReportOnly, "Content-Security-Policy-Report-Only");
    if (callback) callbacks.push(callback);
    headersToSet.push(["Content-Security-Policy-Report-Only", value]);
  }
  if (options.permissionsPolicy && Object.keys(options.permissionsPolicy).length > 0) headersToSet.push(["Permissions-Policy", getPermissionsPolicyDirectives(options.permissionsPolicy)]);
  if (options.reportingEndpoints) headersToSet.push(["Reporting-Endpoints", getReportingEndpoints(options.reportingEndpoints)]);
  if (options.reportTo) headersToSet.push(["Report-To", getReportToOptions(options.reportTo)]);
  return /* @__PURE__ */ __name(async function secureHeaders2(ctx, next) {
    const headersToSetForReq = callbacks.length === 0 ? headersToSet : callbacks.reduce((acc, cb) => cb(ctx, acc), headersToSet);
    await next();
    setHeaders(ctx, headersToSetForReq);
    if (options?.removePoweredBy) ctx.res.headers.delete("X-Powered-By");
  }, "secureHeaders");
}, "secureHeaders");
function getFilteredHeaders(options) {
  return Object.entries(HEADERS_MAP).filter(([key]) => options[key]).map(([key, defaultValue]) => {
    const overrideValue = options[key];
    return typeof overrideValue === "string" ? [defaultValue[0], overrideValue] : defaultValue;
  });
}
__name(getFilteredHeaders, "getFilteredHeaders");
function getCSPDirectives(contentSecurityPolicy, headerName) {
  const callbacks = [];
  const resultValues = [];
  for (const [directive, value] of Object.entries(contentSecurityPolicy)) {
    const valueArray = Array.isArray(value) ? value : [value];
    valueArray.forEach((value2, i) => {
      if (typeof value2 === "function") {
        const index = i * 2 + 2 + resultValues.length;
        callbacks.push((ctx, values) => {
          values[index] = value2(ctx, directive);
        });
      }
    });
    resultValues.push(directive.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (match2, offset) => offset ? "-" + match2.toLowerCase() : match2.toLowerCase()), ...valueArray.flatMap((value2) => [" ", value2]), "; ");
  }
  resultValues.pop();
  return callbacks.length === 0 ? [void 0, resultValues.join("")] : [(ctx, headersToSet) => headersToSet.map((values) => {
    if (values[0] === headerName) {
      const clone = values[1].slice();
      callbacks.forEach((cb) => {
        cb(ctx, clone);
      });
      return [values[0], clone.join("")];
    } else return values;
  }), resultValues];
}
__name(getCSPDirectives, "getCSPDirectives");
function getPermissionsPolicyDirectives(policy) {
  return Object.entries(policy).map(([directive, value]) => {
    const kebabDirective = camelToKebab(directive);
    if (typeof value === "boolean") return `${kebabDirective}=${value ? "*" : "()"}`;
    if (Array.isArray(value)) {
      if (value.length === 0) return `${kebabDirective}=()`;
      if (value.length === 1 && value[0] === "*") return `${kebabDirective}=*`;
      if (value.length === 1 && value[0] === "none") return `${kebabDirective}=()`;
      return `${kebabDirective}=(${value.map((item) => ["self", "src"].includes(item) ? item : `"${item}"`).join(" ")})`;
    }
    return "";
  }).filter(Boolean).join(", ");
}
__name(getPermissionsPolicyDirectives, "getPermissionsPolicyDirectives");
function camelToKebab(str) {
  return str.replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
}
__name(camelToKebab, "camelToKebab");
function getReportingEndpoints(reportingEndpoints = []) {
  return reportingEndpoints.map((endpoint) => `${endpoint.name}="${endpoint.url}"`).join(", ");
}
__name(getReportingEndpoints, "getReportingEndpoints");
function getReportToOptions(reportTo = []) {
  return reportTo.map((option) => JSON.stringify(option)).join(", ");
}
__name(getReportToOptions, "getReportToOptions");
function setHeaders(ctx, headersToSet) {
  headersToSet.forEach(([header, value]) => {
    ctx.res.headers.set(header, value);
  });
}
__name(setHeaders, "setHeaders");

// packages/server/src/index.ts
init_auth();
init_http();

// packages/server/src/modules/admin.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_src();
init_dist();
init_auth();

// packages/server/src/lib/crypto.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var ITER = 1e5;
var enc = new TextEncoder();
var toHex = /* @__PURE__ */ __name((b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""), "toHex");
var fromHex = /* @__PURE__ */ __name((h) => new Uint8Array((h.match(/.{2}/g) ?? []).map((x) => parseInt(x, 16))), "fromHex");
function randomHex(bytes = 32) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}
__name(randomHex, "randomHex");
async function pbkdf2(secret, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return toHex(bits);
}
__name(pbkdf2, "pbkdf2");
async function hashSecret(secret, pepper3) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITER}$${toHex(salt)}$${await pbkdf2(secret + pepper3, salt, ITER)}`;
}
__name(hashSecret, "hashSecret");
async function verifySecret(secret, stored, pepper3) {
  if (!stored) return false;
  const [alg, iter, saltHex, hash] = stored.split("$");
  if (alg !== "pbkdf2" || !iter || !saltHex || !hash) return false;
  const got = await pbkdf2(secret + pepper3, fromHex(saltHex), Number(iter));
  if (got.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}
__name(verifySecret, "verifySecret");

// packages/server/src/modules/admin.ts
init_http();
var admin = new Hono3();
var pepper = /* @__PURE__ */ __name((env2) => env2.PEPPER ?? "moain-dev-pepper", "pepper");
admin.get("/locations", async (c) => {
  const a = authOf(c);
  const kind = c.req.query("kind") ?? null;
  return okJson(c, await a.db.all(
    `SELECT l.*, p.name_ar AS plant_name, (SELECT COUNT(*) FROM user_roles r WHERE r.location_id = l.id) AS user_count
     FROM locations l LEFT JOIN locations p ON p.id = l.default_plant_id WHERE l.tenant_id = ? AND (? IS NULL OR l.kind = ?) ORDER BY l.kind, l.sort_order, l.code`,
    a.tenantId,
    kind,
    kind
  ));
});
admin.post("/locations", requirePerm("locations:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, LocationInput);
  if (i.kind === "branch" && !i.default_plant_id) throw new Fail(422, "BUSINESS_RULE", "\u062D\u062F\u062F \u0627\u0644\u0645\u0639\u0645\u0644 \u0627\u0644\u0630\u064A \u064A\u062E\u062F\u0645 \u0647\u0630\u0627 \u0627\u0644\u0641\u0631\u0639");
  const id = ulid2();
  const max = await a.db.first(`SELECT MAX(sort_order) m FROM locations WHERE tenant_id = ? AND kind = ?`, a.tenantId, i.kind);
  try {
    await a.db.batch([
      a.db.prep(
        `INSERT INTO locations (id, tenant_id, code, name_ar, kind, default_plant_id, phone, address, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        a.tenantId,
        i.code,
        i.name_ar,
        i.kind,
        i.default_plant_id ?? null,
        i.phone ?? null,
        i.address ?? null,
        (max?.m ?? 0) + 10
      ),
      a.db.audit(a.userId, "location", id, "create", null, i, ulid2())
    ]);
  } catch (e) {
    if (String(e).includes("UNIQUE")) throw new Fail(409, "DUPLICATE", "\u0627\u0644\u0643\u0648\u062F \u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u0645\u0648\u0642\u0639 \u0622\u062E\u0631");
    throw e;
  }
  return okJson(c, { id }, 201);
});
admin.put("/locations/:id", requirePerm("locations:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, LocationInput);
  const id = c.req.param("id");
  const before = await a.db.first(`SELECT * FROM locations WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound("\u0627\u0644\u0645\u0648\u0642\u0639");
  await a.db.batch([
    a.db.prep(
      `UPDATE locations SET code = ?, name_ar = ?, default_plant_id = ?, phone = ?, address = ?, is_active = COALESCE(?, is_active) WHERE id = ? AND tenant_id = ?`,
      i.code,
      i.name_ar,
      i.default_plant_id ?? null,
      i.phone ?? null,
      i.address ?? null,
      i.is_active === void 0 ? null : Number(i.is_active),
      id,
      a.tenantId
    ),
    a.db.audit(a.userId, "location", id, "update", before, i, ulid2())
  ]);
  return okJson(c, { id });
});
admin.get("/users", requirePerm("users:write"), async (c) => {
  const a = authOf(c);
  const users = await a.db.all(`SELECT id, full_name, email, phone, is_active, last_login_at, (pin_hash IS NOT NULL) AS has_pin FROM users WHERE tenant_id = ? ORDER BY full_name`, a.tenantId);
  const roles = await a.db.all(
    `SELECT r.user_id, r.role, r.location_id, l.name_ar AS location_name FROM user_roles r JOIN users u ON u.id = r.user_id LEFT JOIN locations l ON l.id = r.location_id WHERE u.tenant_id = ?`,
    a.tenantId
  );
  return okJson(c, users.map((u) => ({ ...u, roles: roles.filter((r) => r.user_id === u.id) })));
});
async function assertNotLastOwner(a, userId, keepsOwner) {
  if (keepsOwner) return;
  const r = await a.db.first(
    `SELECT COUNT(DISTINCT u.id) n, SUM(CASE WHEN u.id = ? THEN 1 ELSE 0 END) me FROM users u JOIN user_roles r ON r.user_id = u.id WHERE u.tenant_id = ? AND r.role = 'owner' AND u.is_active = 1`,
    userId,
    a.tenantId
  );
  if (r && r.me > 0 && r.n <= 1) throw new Fail(409, "CONFLICT", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0625\u0632\u0627\u0644\u0629 \u0622\u062E\u0631 \u0645\u0627\u0644\u0643 \u0644\u0644\u0646\u0638\u0627\u0645", { rule: "A11" });
}
__name(assertNotLastOwner, "assertNotLastOwner");
admin.post("/users", requirePerm("users:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, UserInput);
  if (!i.email && !i.phone) throw new Fail(422, "BUSINESS_RULE", "\u0623\u062F\u062E\u0644 \u0627\u0644\u0628\u0631\u064A\u062F \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0644 \u0644\u0644\u062F\u062E\u0648\u0644");
  if (!i.password) throw new Fail(422, "BUSINESS_RULE", "\u0623\u062F\u062E\u0644 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0623\u0648\u0644\u064A\u0629");
  const id = ulid2();
  const hash = await hashSecret(i.password, pepper(c.env));
  try {
    await a.db.batch([
      a.db.prep(`INSERT INTO users (id, tenant_id, email, phone, full_name, password_hash) VALUES (?, ?, ?, ?, ?, ?)`, id, a.tenantId, i.email ?? null, i.phone ?? null, i.full_name, hash),
      ...i.roles.map((r) => a.db.prep(`INSERT INTO user_roles (user_id, role, location_id) VALUES (?, ?, ?)`, id, r.role, r.location_id)),
      a.db.audit(a.userId, "user", id, "create", null, { full_name: i.full_name, roles: i.roles }, ulid2())
    ]);
  } catch (e) {
    if (String(e).includes("UNIQUE")) throw new Fail(409, "DUPLICATE", "\u0627\u0644\u0628\u0631\u064A\u062F \u0623\u0648 \u0627\u0644\u062C\u0648\u0627\u0644 \u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0622\u062E\u0631");
    throw e;
  }
  return okJson(c, { id }, 201);
});
admin.put("/users/:id", requirePerm("users:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, UserInput);
  const id = c.req.param("id");
  const before = await a.db.first(`SELECT id, full_name, email, phone, is_active FROM users WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645");
  await assertNotLastOwner(a, id, i.roles.some((r) => r.role === "owner") && i.is_active !== false);
  const stmts = [
    a.db.prep(
      `UPDATE users SET full_name = ?, email = ?, phone = ?, is_active = COALESCE(?, is_active), updated_at = ? WHERE id = ? AND tenant_id = ?`,
      i.full_name,
      i.email ?? null,
      i.phone ?? null,
      i.is_active === void 0 ? null : Number(i.is_active),
      (/* @__PURE__ */ new Date()).toISOString(),
      id,
      a.tenantId
    ),
    a.db.prep(`DELETE FROM user_roles WHERE user_id = ?`, id),
    ...i.roles.map((r) => a.db.prep(`INSERT INTO user_roles (user_id, role, location_id) VALUES (?, ?, ?)`, id, r.role, r.location_id))
  ];
  if (i.password) stmts.push(a.db.prep(`UPDATE users SET password_hash = ? WHERE id = ? AND tenant_id = ?`, await hashSecret(i.password, pepper(c.env)), id, a.tenantId));
  if (i.is_active === false) stmts.push(a.db.prep(`DELETE FROM sessions WHERE user_id = ?`, id));
  stmts.push(a.db.audit(a.userId, "user", id, "update", before, { full_name: i.full_name, roles: i.roles, is_active: i.is_active }, ulid2()));
  await a.db.batch(stmts);
  return okJson(c, { id });
});
admin.get("/devices", async (c) => {
  const a = authOf(c);
  const all = c.req.query("all") === "1";
  return okJson(c, await a.db.all(
    `SELECT d.id, d.label, d.user_agent, d.last_seen_at, d.revoked_at, d.created_at, u.full_name FROM trusted_devices d JOIN users u ON u.id = d.user_id
     WHERE u.tenant_id = ? AND (? = 1 OR d.user_id = ?) ORDER BY d.last_seen_at DESC`,
    a.tenantId,
    all ? 1 : 0,
    a.userId
  ));
});
admin.post("/devices/:id/revoke", async (c) => {
  const a = authOf(c);
  const d = await a.db.first(`SELECT d.id, d.user_id FROM trusted_devices d JOIN users u ON u.id = d.user_id WHERE d.id = ? AND u.tenant_id = ?`, c.req.param("id"), a.tenantId);
  if (!d) throw notFound("\u0627\u0644\u062C\u0647\u0627\u0632");
  if (d.user_id !== a.userId && !a.grants.some((g) => g.role === "owner" || g.role === "admin")) throw new Fail(403, "FORBIDDEN", "\u0644\u064A\u0633\u062A \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629");
  await a.db.batch([
    a.db.prep(`UPDATE trusted_devices SET revoked_at = ? WHERE id = ?`, (/* @__PURE__ */ new Date()).toISOString(), d.id),
    a.db.prep(`DELETE FROM sessions WHERE device_id = ?`, d.id),
    a.db.audit(a.userId, "trusted_device", d.id, "revoke", null, null, ulid2())
  ]);
  return okJson(c, { id: d.id });
});
admin.get("/order-windows", async (c) => {
  const a = authOf(c);
  return okJson(c, await a.db.all(`SELECT w.*, l.name_ar AS plant_name FROM order_windows w JOIN locations l ON l.id = w.plant_id WHERE w.tenant_id = ? ORDER BY l.sort_order, w.sort_order`, a.tenantId));
});
admin.post("/order-windows", requirePerm("windows:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, WindowInput);
  if (i.kind === "regular" && !i.cutoff_time) throw new Fail(422, "BUSINESS_RULE", "\u062D\u062F\u062F \u0648\u0642\u062A \u0627\u0644\u0625\u063A\u0644\u0627\u0642 \u0644\u0644\u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u0639\u0627\u062F\u064A\u0629");
  const id = ulid2();
  await a.db.batch([
    a.db.prep(
      `INSERT INTO order_windows (id, tenant_id, plant_id, name_ar, kind, cutoff_time, delivery_offset_days, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order),0)+10 FROM order_windows WHERE tenant_id = ?))`,
      id,
      a.tenantId,
      i.plant_id,
      i.name_ar,
      i.kind,
      i.kind === "urgent" ? null : i.cutoff_time,
      i.delivery_offset_days,
      a.tenantId
    ),
    a.db.audit(a.userId, "order_window", id, "create", null, i, ulid2())
  ]);
  return okJson(c, { id }, 201);
});
admin.put("/order-windows/:id", requirePerm("windows:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, WindowInput);
  const id = c.req.param("id");
  const before = await a.db.first(`SELECT * FROM order_windows WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound("\u0627\u0644\u0646\u0627\u0641\u0630\u0629");
  await a.db.batch([
    a.db.prep(
      `UPDATE order_windows SET name_ar = ?, kind = ?, cutoff_time = ?, delivery_offset_days = ?, is_active = COALESCE(?, is_active) WHERE id = ? AND tenant_id = ?`,
      i.name_ar,
      i.kind,
      i.kind === "urgent" ? null : i.cutoff_time,
      i.delivery_offset_days,
      i.is_active === void 0 ? null : Number(i.is_active),
      id,
      a.tenantId
    ),
    a.db.audit(a.userId, "order_window", id, "update", before, i, ulid2())
  ]);
  return okJson(c, { id });
});
admin.put("/tenant/settings", requirePerm("settings:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, SettingsInput);
  await a.db.batch([
    a.db.prep(
      `UPDATE tenant_settings SET timezone = ?, currency_code = ?, currency_decimals = ?, numerals = ?, allow_negative_stock = ?, updated_at = ? WHERE tenant_id = ?`,
      i.timezone,
      i.currency_code,
      i.currency_decimals,
      i.numerals,
      Number(i.allow_negative_stock),
      (/* @__PURE__ */ new Date()).toISOString(),
      a.tenantId
    ),
    a.db.audit(a.userId, "tenant_settings", a.tenantId, "update", a.settings, i, ulid2())
  ]);
  return okJson(c, { ok: true });
});
admin.put("/tenant/branding", requirePerm("settings:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, BrandingInput);
  if (i.logo_url && !/^data:image\/(png|webp|jpeg);base64,/.test(i.logo_url) && !i.logo_url.startsWith("/")) throw new Fail(400, "VALIDATION", "\u0635\u064A\u063A\u0629 \u0627\u0644\u0634\u0639\u0627\u0631 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645\u0629");
  const before = await a.db.first(`SELECT company_name, primary_color, phone, address, footer_text FROM tenant_branding WHERE tenant_id = ?`, a.tenantId);
  await a.db.batch([
    a.db.prep(
      `UPDATE tenant_branding SET company_name = ?, primary_color = ?, accent_color = COALESCE(?, accent_color), phone = ?, address = ?, footer_text = ?, logo_url = COALESCE(?, logo_url), updated_at = ? WHERE tenant_id = ?`,
      i.company_name,
      i.primary_color,
      i.accent_color ?? null,
      i.phone ?? null,
      i.address ?? null,
      i.footer_text ?? null,
      i.logo_url ?? null,
      (/* @__PURE__ */ new Date()).toISOString(),
      a.tenantId
    ),
    a.db.prep(`UPDATE tenants SET name = ? WHERE id = ?`, i.company_name, a.tenantId),
    a.db.audit(a.userId, "tenant_branding", a.tenantId, "update", before, { ...i, logo_url: i.logo_url ? "[image]" : null }, ulid2())
  ]);
  return okJson(c, { ok: true });
});
admin.get("/uoms", async (c) => {
  const a = authOf(c);
  return okJson(c, await a.db.all(`SELECT id, code, name_ar, decimals FROM uoms WHERE tenant_id = ? ORDER BY code`, a.tenantId));
});
admin.get("/audit", requirePerm("audit:read"), async (c) => {
  const a = authOf(c);
  const et = c.req.query("entity_type") ?? null;
  const eid = c.req.query("entity_id") ?? null;
  return okJson(c, await a.db.all(
    `SELECT al.id, al.entity_type, al.entity_id, al.action, al.before, al.after, al.at, u.full_name AS actor_name FROM audit_log al LEFT JOIN users u ON u.id = al.actor_id
     WHERE al.tenant_id = ? AND (? IS NULL OR al.entity_type = ?) AND (? IS NULL OR al.entity_id = ?) ORDER BY al.at DESC LIMIT 200`,
    a.tenantId,
    et,
    et,
    eid,
    eid
  ));
});

// packages/server/src/modules/auth.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_src();
init_dist();
init_cookie2();
init_auth();
init_db();
init_http();
var PIN_MAX = 5;
var PIN_LOCK_MIN = 15;
var PIN_REVOKE_TOTAL = 15;
var auth = new Hono3();
var pepper2 = /* @__PURE__ */ __name((env2) => env2.PEPPER ?? "moain-dev-pepper", "pepper");
async function createSession(d1, userId, deviceId) {
  const sid = randomHex(32);
  const exp = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  await d1.batch([
    d1.prepare(`INSERT INTO sessions (id, user_id, device_id, expires_at) VALUES (?, ?, ?, ?)`).bind(sid, userId, deviceId, exp),
    d1.prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).bind((/* @__PURE__ */ new Date()).toISOString(), userId)
  ]);
  return sid;
}
__name(createSession, "createSession");
function setSid(c, sid) {
  const secure = new URL(c.req.url).protocol === "https:";
  setCookie(c, SESSION_COOKIE, sid, { httpOnly: true, secure, sameSite: "Lax", path: "/", maxAge: SESSION_DAYS * 86400 });
}
__name(setSid, "setSid");
async function bumpAttempt(d1, key) {
  const now = /* @__PURE__ */ new Date();
  const lock = new Date(now.getTime() + PIN_LOCK_MIN * 6e4).toISOString();
  const r = await d1.prepare(
    `INSERT INTO auth_attempts (key, fail_count, total_fails, window_start) VALUES (?, 1, 1, ?)
     ON CONFLICT (key) DO UPDATE SET fail_count = fail_count + 1, total_fails = total_fails + 1,
       locked_until = CASE WHEN fail_count + 1 >= ${PIN_MAX} THEN ? ELSE locked_until END
     RETURNING fail_count, total_fails`
  ).bind(key, now.toISOString(), lock).first();
  return r ?? { fail_count: 1, total_fails: 1 };
}
__name(bumpAttempt, "bumpAttempt");
async function assertNotLocked(d1, key) {
  const r = await d1.prepare(`SELECT locked_until FROM auth_attempts WHERE key = ?`).bind(key).first();
  if (r?.locked_until && r.locked_until > (/* @__PURE__ */ new Date()).toISOString()) {
    const mins = Math.ceil((Date.parse(r.locked_until) - Date.now()) / 6e4);
    throw new Fail(429, "RATE_LIMITED", `\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0643\u062B\u064A\u0631\u0629 \u2014 \u062D\u0627\u0648\u0644 \u0628\u0639\u062F ${mins} \u062F\u0642\u064A\u0642\u0629`, { retryInMinutes: mins });
  }
}
__name(assertNotLocked, "assertNotLocked");
var clearAttempts = /* @__PURE__ */ __name((d1, key) => d1.prepare(`DELETE FROM auth_attempts WHERE key = ?`).bind(key).run(), "clearAttempts");
auth.get("/tenant/:slug", async (c) => {
  const t = await c.env.DB.prepare(
    `SELECT t.slug, b.company_name, b.logo_url, b.primary_color, b.accent_color FROM tenants t JOIN tenant_branding b ON b.tenant_id = t.id WHERE t.slug = ? AND t.status = 'active'`
  ).bind(c.req.param("slug")).first();
  if (!t) throw new Fail(404, "NOT_FOUND", "\u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
  return okJson(c, t);
});
auth.post("/login", async (c) => {
  const input = await parseBody2(c, LoginInput);
  const d1 = c.env.DB;
  const key = `login:${input.tenant}:${input.identifier.toLowerCase()}`;
  await assertNotLocked(d1, key);
  const u = await d1.prepare(
    `SELECT u.id, u.tenant_id, u.password_hash, u.is_active, u.pin_hash FROM users u JOIN tenants t ON t.id = u.tenant_id
     WHERE t.slug = ? AND (lower(u.email) = lower(?) OR u.phone = ?)`
  ).bind(input.tenant, input.identifier, input.identifier).first();
  if (!u || u.is_active !== 1 || !await verifySecret(input.password, u.password_hash, pepper2(c.env))) {
    await bumpAttempt(d1, key);
    throw new Fail(401, "UNAUTHENTICATED", "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629");
  }
  await clearAttempts(d1, key);
  let device = await d1.prepare(`SELECT id FROM trusted_devices WHERE user_id = ? AND device_fingerprint = ? AND revoked_at IS NULL`).bind(u.id, input.deviceFingerprint).first();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (!device) {
    device = { id: ulid2() };
    await d1.prepare(`INSERT INTO trusted_devices (id, user_id, device_fingerprint, label, user_agent, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(device.id, u.id, input.deviceFingerprint, input.deviceLabel ?? null, c.req.header("user-agent")?.slice(0, 200) ?? null, now).run();
  }
  const sid = await createSession(d1, u.id, device.id);
  await new Db(d1, u.tenant_id).audit(u.id, "user", u.id, "login", null, { device_id: device.id }, ulid2()).run();
  setSid(c, sid);
  return okJson(c, { deviceId: device.id, hasPin: u.pin_hash !== null });
});
auth.post("/pin", async (c) => {
  const input = await parseBody2(c, PinInput);
  const d1 = c.env.DB;
  const key = `pin:${input.deviceId}`;
  await assertNotLocked(d1, key);
  const d = await d1.prepare(
    `SELECT d.id, d.user_id, d.revoked_at, u.pin_hash, u.is_active FROM trusted_devices d JOIN users u ON u.id = d.user_id WHERE d.id = ?`
  ).bind(input.deviceId).first();
  if (!d || d.revoked_at || d.is_active !== 1 || !d.pin_hash) throw new Fail(401, "UNAUTHENTICATED", "\u0647\u0630\u0627 \u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u0648\u062B\u0648\u0642 \u2014 \u0627\u062F\u062E\u0644 \u0628\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", { requirePassword: true });
  if (!await verifySecret(input.pin + d.user_id, d.pin_hash, pepper2(c.env))) {
    const a = await bumpAttempt(d1, key);
    if (a.total_fails >= PIN_REVOKE_TOTAL) {
      await d1.prepare(`UPDATE trusted_devices SET revoked_at = ? WHERE id = ?`).bind((/* @__PURE__ */ new Date()).toISOString(), d.id).run();
      throw new Fail(401, "UNAUTHENTICATED", "\u0623\u064F\u0644\u063A\u064A \u0627\u0644\u062C\u0647\u0627\u0632 \u0644\u0643\u062B\u0631\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u2014 \u0627\u062F\u062E\u0644 \u0628\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", { requirePassword: true });
    }
    throw new Fail(401, "UNAUTHENTICATED", "\u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D", { remaining: Math.max(0, PIN_MAX - a.fail_count) });
  }
  await clearAttempts(d1, key);
  await d1.prepare(`UPDATE trusted_devices SET last_seen_at = ? WHERE id = ?`).bind((/* @__PURE__ */ new Date()).toISOString(), d.id).run();
  setSid(c, await createSession(d1, d.user_id, d.id));
  return okJson(c, { ok: true });
});
auth.get("/device/:id", async (c) => {
  const d = await c.env.DB.prepare(
    `SELECT u.full_name, t.slug, (u.pin_hash IS NOT NULL) AS has_pin FROM trusted_devices d JOIN users u ON u.id = d.user_id JOIN tenants t ON t.id = u.tenant_id
     WHERE d.id = ? AND d.revoked_at IS NULL AND u.is_active = 1`
  ).bind(c.req.param("id")).first();
  if (!d) throw new Fail(404, "NOT_FOUND", "\u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u0648\u062B\u0648\u0642");
  return okJson(c, { fullName: d.full_name, tenant: d.slug, hasPin: d.has_pin === 1 });
});
auth.post("/logout", async (c) => {
  const sid = getCookie(c, SESSION_COOKIE);
  if (sid) await c.env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(sid).run();
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return okJson(c, { ok: true });
});
auth.use("/me", requireAuth);
auth.get("/me", async (c) => {
  const a = authOf(c);
  const [user, branding, tenant, locations] = await Promise.all([
    a.db.first(
      `SELECT id, full_name, email, phone, (pin_hash IS NOT NULL) AS has_pin FROM users WHERE id = ? AND tenant_id = ?`,
      a.userId,
      a.tenantId
    ),
    a.db.first(`SELECT company_name, company_name_en, logo_url, primary_color, accent_color, footer_text, phone, address FROM tenant_branding WHERE tenant_id = ?`, a.tenantId),
    a.db.first(`SELECT slug, name FROM tenants WHERE id = ?`, a.tenantId),
    a.db.all(
      `SELECT id, code, name_ar, kind, default_plant_id FROM locations WHERE tenant_id = ? AND is_active = 1 ORDER BY kind, sort_order, code`,
      a.tenantId
    )
  ]);
  const myLocationIds = a.grants.map((g) => g.location_id).filter((x) => x !== null);
  return okJson(c, {
    user: user && { ...user, has_pin: user.has_pin === 1 },
    tenant,
    branding,
    settings: a.settings,
    grants: a.grants,
    roles: [...new Set(a.grants.map((g) => g.role))],
    nav: navFor(a.grants.map((g) => g.role)),
    canViewCosts: can(a.grants, "costs:view"),
    locations,
    myLocationIds,
    deviceId: a.deviceId
  });
});
auth.use("/pin/set", requireAuth);
auth.put("/pin/set", async (c) => {
  const { pin } = await parseBody2(c, SetPinInput);
  const a = authOf(c);
  const h = await hashSecret(pin + a.userId, pepper2(c.env));
  await a.db.batch([
    a.db.prep(`UPDATE users SET pin_hash = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, h, (/* @__PURE__ */ new Date()).toISOString(), a.userId, a.tenantId),
    a.db.audit(a.userId, "user", a.userId, "set_pin", null, null, ulid2())
  ]);
  return okJson(c, { ok: true });
});

// packages/server/src/modules/catalog.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_src();
init_dist();
init_auth();
init_http();
var catalog = new Hono3();
catalog.get("/catalog", async (c) => {
  const a = authOf(c);
  const [categories, products, uoms, availability] = await Promise.all([
    a.db.all(`SELECT id, parent_id, name_ar, color, sort_order, is_active FROM categories WHERE tenant_id = ? ORDER BY sort_order, name_ar`, a.tenantId),
    a.db.all(`SELECT p.id, p.category_id, p.code, p.name_ar, p.uom_id, p.sort_order, p.is_active, u.name_ar AS uom_name, u.decimals AS uom_decimals
              FROM products p JOIN uoms u ON u.id = p.uom_id WHERE p.tenant_id = ? ORDER BY p.sort_order, p.name_ar`, a.tenantId),
    a.db.all(`SELECT id, code, name_ar, decimals FROM uoms WHERE tenant_id = ? ORDER BY code`, a.tenantId),
    a.db.all(`SELECT pa.product_id, pa.location_id FROM product_availability pa JOIN products p ON p.id = pa.product_id WHERE p.tenant_id = ?`, a.tenantId)
  ]);
  const body = { categories, products, uoms, availability };
  const json = JSON.stringify(body);
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(json));
  const etag = `"${[...new Uint8Array(digest)].slice(0, 10).map((b) => b.toString(16).padStart(2, "0")).join("")}"`;
  if (c.req.header("if-none-match") === etag) return c.body(null, 304);
  c.header("ETag", etag);
  return okJson(c, body);
});
catalog.post("/categories", requirePerm("catalog:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, CategoryInput);
  const id = ulid2();
  const max = await a.db.first(`SELECT MAX(sort_order) m FROM categories WHERE tenant_id = ?`, a.tenantId);
  await a.db.batch([
    a.db.prep(
      `INSERT INTO categories (id, tenant_id, parent_id, name_ar, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      a.tenantId,
      i.parent_id ?? null,
      i.name_ar,
      i.color ?? null,
      i.sort_order ?? (max?.m ?? 0) + 10
    ),
    a.db.audit(a.userId, "category", id, "create", null, i, ulid2())
  ]);
  return okJson(c, { id }, 201);
});
catalog.put("/categories/:id", requirePerm("catalog:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, CategoryInput);
  const id = c.req.param("id");
  if (i.parent_id) {
    let cur = i.parent_id;
    for (let depth = 0; cur && depth < 50; depth++) {
      if (cur === id) throw new Fail(422, "BUSINESS_RULE", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062C\u0639\u0644 \u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u062A\u0627\u0628\u0639\u0627\u064B \u0644\u0646\u0641\u0633\u0647", { rule: "B4" });
      const p = await a.db.first(`SELECT parent_id FROM categories WHERE id = ? AND tenant_id = ?`, cur, a.tenantId);
      cur = p?.parent_id ?? null;
    }
  }
  const before = await a.db.first(`SELECT * FROM categories WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound("\u0627\u0644\u062A\u0635\u0646\u064A\u0641");
  await a.db.batch([
    a.db.prep(
      `UPDATE categories SET name_ar = ?, parent_id = ?, color = ?, sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active) WHERE id = ? AND tenant_id = ?`,
      i.name_ar,
      i.parent_id ?? null,
      i.color ?? null,
      i.sort_order ?? null,
      i.is_active === void 0 ? null : Number(i.is_active),
      id,
      a.tenantId
    ),
    a.db.audit(a.userId, "category", id, "update", before, i, ulid2())
  ]);
  return okJson(c, { id });
});
catalog.delete("/categories/:id", requirePerm("catalog:write"), async (c) => {
  const a = authOf(c);
  const id = c.req.param("id");
  const used = await a.db.first(
    `SELECT (SELECT COUNT(*) FROM products WHERE category_id = ? AND tenant_id = ?) + (SELECT COUNT(*) FROM categories WHERE parent_id = ? AND tenant_id = ?) AS n`,
    id,
    a.tenantId,
    id,
    a.tenantId
  );
  if ((used?.n ?? 0) > 0) throw new Fail(409, "CONFLICT", "\u0627\u0644\u062A\u0635\u0646\u064A\u0641 \u064A\u062D\u062A\u0648\u064A \u0623\u0635\u0646\u0627\u0641\u0627\u064B \u0623\u0648 \u062A\u0635\u0646\u064A\u0641\u0627\u062A \u0641\u0631\u0639\u064A\u0629 \u2014 \u0639\u0637\u0651\u0644\u0647 \u0628\u062F\u0644\u0627\u064B \u0645\u0646 \u062D\u0630\u0641\u0647", { rule: "B3" });
  const r = await a.db.run(`DELETE FROM categories WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!r.meta.changes) throw notFound("\u0627\u0644\u062A\u0635\u0646\u064A\u0641");
  return okJson(c, { id });
});
catalog.post("/products", requirePerm("catalog:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, ProductInput);
  const id = ulid2();
  const ok2 = await a.db.first(`SELECT 1 FROM categories WHERE id = ? AND tenant_id = ?`, i.category_id, a.tenantId);
  if (!ok2) throw notFound("\u0627\u0644\u062A\u0635\u0646\u064A\u0641");
  try {
    await a.db.batch([
      a.db.prep(
        `INSERT INTO products (id, tenant_id, category_id, code, name_ar, uom_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id,
        a.tenantId,
        i.category_id,
        i.code,
        i.name_ar,
        i.uom_id,
        i.sort_order ?? 0
      ),
      a.db.audit(a.userId, "product", id, "create", null, i, ulid2())
    ]);
  } catch (e) {
    if (String(e).includes("UNIQUE")) throw new Fail(409, "DUPLICATE", "\u0627\u0644\u0643\u0648\u062F \u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u0635\u0646\u0641 \u0622\u062E\u0631", { rule: "B1" });
    throw e;
  }
  return okJson(c, { id }, 201);
});
catalog.put("/products/:id", requirePerm("catalog:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, ProductInput);
  const id = c.req.param("id");
  const before = await a.db.first(`SELECT * FROM products WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound("\u0627\u0644\u0635\u0646\u0641");
  try {
    await a.db.batch([
      a.db.prep(
        `UPDATE products SET category_id = ?, code = ?, name_ar = ?, uom_id = ?, sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active), updated_at = ? WHERE id = ? AND tenant_id = ?`,
        i.category_id,
        i.code,
        i.name_ar,
        i.uom_id,
        i.sort_order ?? null,
        i.is_active === void 0 ? null : Number(i.is_active),
        (/* @__PURE__ */ new Date()).toISOString(),
        id,
        a.tenantId
      ),
      a.db.audit(a.userId, "product", id, "update", before, i, ulid2())
    ]);
  } catch (e) {
    if (String(e).includes("UNIQUE")) throw new Fail(409, "DUPLICATE", "\u0627\u0644\u0643\u0648\u062F \u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u0635\u0646\u0641 \u0622\u062E\u0631", { rule: "B1" });
    throw e;
  }
  return okJson(c, { id });
});
catalog.put("/products/:id/availability", requirePerm("catalog:write"), async (c) => {
  const a = authOf(c);
  const id = c.req.param("id");
  const body = await c.req.json();
  const ids = Array.isArray(body.location_ids) ? body.location_ids.filter((x) => typeof x === "string") : [];
  const p = await a.db.first(`SELECT 1 FROM products WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!p) throw notFound("\u0627\u0644\u0635\u0646\u0641");
  await a.db.batch([
    a.db.prep(`DELETE FROM product_availability WHERE product_id = ?`, id),
    ...ids.map((l) => a.db.prep(`INSERT INTO product_availability (product_id, location_id) SELECT ?, id FROM locations WHERE id = ? AND tenant_id = ?`, id, l, a.tenantId))
  ]);
  return okJson(c, { id, location_ids: ids });
});

// packages/server/src/modules/fulfillment.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_src();
init_dist();
init_auth();
init_http();
init_notify();
init_production();
var fulfillment = new Hono3();
fulfillment.get("/deliveries/pending", requirePerm("deliveries:create"), async (c) => {
  const a = authOf(c);
  const rows = await a.db.all(
    `SELECT o.id, o.branch_id, l.name_ar AS branch_name, o.delivery_date, o.status, po.number AS po_number, w.name_ar AS window_name,
            COUNT(ol.id) AS line_count, COALESCE(SUM(ol.qty),0) AS total_qty,
            COALESCE((SELECT SUM(dl.qty_delivered) FROM delivery_lines dl JOIN order_lines x ON x.id = dl.order_line_id WHERE x.order_id = o.id),0) AS total_delivered
     FROM orders o JOIN locations l ON l.id = o.branch_id JOIN order_windows w ON w.id = o.window_id LEFT JOIN production_orders po ON po.id = o.production_order_id
     LEFT JOIN order_lines ol ON ol.order_id = o.id
     WHERE o.tenant_id = ? AND o.status IN ('in_production','ready','partially_delivered')
     GROUP BY o.id ORDER BY o.delivery_date, CASE o.status WHEN 'ready' THEN 0 WHEN 'partially_delivered' THEN 1 ELSE 2 END, l.sort_order`,
    a.tenantId
  );
  return okJson(c, rows);
});
fulfillment.get("/deliveries", requirePerm("orders:read"), async (c) => {
  const a = authOf(c);
  const rows = await a.db.all(
    `SELECT d.id, d.number, d.order_id, d.received_by_name, d.delivered_at, u.full_name AS delivered_by_name, l.name_ar AS branch_name, o.delivery_date,
            (SELECT COALESCE(SUM(qty_delivered),0) FROM delivery_lines WHERE delivery_id = d.id) AS qty, (d.signature_blob IS NOT NULL) AS signed
     FROM deliveries d JOIN orders o ON o.id = d.order_id JOIN locations l ON l.id = o.branch_id JOIN users u ON u.id = d.delivered_by
     WHERE d.tenant_id = ? ORDER BY d.delivered_at DESC LIMIT 100`,
    a.tenantId
  );
  return okJson(c, rows);
});
fulfillment.get("/deliveries/:id", requirePerm("orders:read"), async (c) => {
  const a = authOf(c);
  const d = await a.db.first(
    `SELECT d.*, u.full_name AS delivered_by_name, l.name_ar AS branch_name, o.delivery_date, po.number AS po_number FROM deliveries d JOIN orders o ON o.id = d.order_id
     JOIN locations l ON l.id = o.branch_id JOIN users u ON u.id = d.delivered_by LEFT JOIN production_orders po ON po.id = o.production_order_id WHERE d.id = ? AND d.tenant_id = ?`,
    c.req.param("id"),
    a.tenantId
  );
  if (!d) throw notFound("\u0627\u0644\u062A\u0633\u0644\u064A\u0645");
  const lines = await a.db.all(
    `SELECT dl.qty_delivered, dl.note, ol.qty AS qty_ordered, p.name_ar AS product_name, u.name_ar AS uom_name FROM delivery_lines dl JOIN order_lines ol ON ol.id = dl.order_line_id
     JOIN products p ON p.id = ol.product_id JOIN uoms u ON u.id = p.uom_id WHERE dl.delivery_id = ? ORDER BY ol.sort_order`,
    d.id
  );
  const branding = await a.db.first(`SELECT company_name, logo_url, primary_color, phone, address, footer_text FROM tenant_branding WHERE tenant_id = ?`, a.tenantId);
  let signature = null;
  if (d.signature_blob) {
    const bytes = new Uint8Array(d.signature_blob);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    signature = `data:${d.signature_mime ?? "image/png"};base64,${btoa(bin)}`;
  }
  const { signature_blob: _blob, ...rest } = d;
  return okJson(c, { ...rest, signature, lines, branding });
});
fulfillment.post("/deliveries", requirePerm("deliveries:create"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, DeliveryInput);
  const existing = await a.db.first(`SELECT id, number FROM deliveries WHERE tenant_id = ? AND client_uuid = ?`, a.tenantId, i.client_uuid);
  if (existing) return okJson(c, { delivery: existing, idempotent: true });
  const o = await a.db.first(
    `SELECT id, status, branch_id, plant_id, production_order_id FROM orders WHERE id = ? AND tenant_id = ?`,
    i.order_id,
    a.tenantId
  );
  if (!o) throw notFound("\u0627\u0644\u0637\u0644\u0628\u064A\u0629");
  assertCan(c, "deliveries:create", o.plant_id);
  if (!["in_production", "ready", "partially_delivered"].includes(o.status)) throw new Fail(409, "INVALID_TRANSITION", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0633\u0644\u064A\u0645 \u0637\u0644\u0628\u064A\u0629 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u062D\u0627\u0644\u0629", { rule: "E1", status: o.status });
  const lines = await a.db.all(
    `SELECT ol.id, ol.qty, COALESCE((SELECT SUM(qty_delivered) FROM delivery_lines WHERE order_line_id = ol.id),0) AS delivered, p.name_ar
     FROM order_lines ol JOIN products p ON p.id = ol.product_id WHERE ol.order_id = ?`,
    o.id
  );
  const lmap = new Map(lines.map((l) => [l.id, l]));
  const warnings = [];
  const parsed = i.lines.map((l) => {
    const ol = lmap.get(l.order_line_id);
    if (!ol) throw new Fail(422, "BUSINESS_RULE", "\u0633\u0637\u0631 \u0644\u0627 \u064A\u0646\u062A\u0645\u064A \u0644\u0647\u0630\u0647 \u0627\u0644\u0637\u0644\u0628\u064A\u0629", { rule: "E1" });
    const q = parseQty(String(l.qty_delivered), 4) ?? 0;
    const remaining = Math.round((ol.qty - ol.delivered) * 1e4);
    if (q > remaining) warnings.push(`${ol.name_ar}: \u0633\u064F\u0644\u0650\u0651\u0645 \u0623\u0643\u062B\u0631 \u0645\u0646 \u0627\u0644\u0645\u062A\u0628\u0642\u064A`);
    return { ...l, qty: qtyToDb(q) };
  }).filter((l) => l.qty > 0 || i.lines.length === 1);
  if (!parsed.length) throw new Fail(422, "BUSINESS_RULE", "\u0623\u062F\u062E\u0644 \u0643\u0645\u064A\u0629 \u0645\u064F\u0633\u0644\u064E\u0651\u0645\u0629 \u0648\u0627\u062D\u062F\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644");
  let sig = null;
  if (i.signature_png_base64) {
    const b64 = i.signature_png_base64.replace(/^data:image\/png;base64,/, "");
    const bin = atob(b64);
    if (bin.length > 5e4) throw new Fail(413, "VALIDATION", "\u0627\u0644\u062A\u0648\u0642\u064A\u0639 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0645\u0633\u0645\u0648\u062D", { rule: "E7" });
    sig = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    if (sig[0] !== 137 || sig[1] !== 80) throw new Fail(400, "VALIDATION", "\u0635\u064A\u063A\u0629 \u0627\u0644\u062A\u0648\u0642\u064A\u0639 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629", { rule: "E7" });
  }
  const after = new Map(lines.map((l) => [l.id, l.delivered]));
  for (const p of parsed) after.set(p.order_line_id, (after.get(p.order_line_id) ?? 0) + p.qty);
  const full = lines.every((l) => (after.get(l.id) ?? 0) + 1e-9 >= l.qty);
  const event = full ? "deliver_full" : "deliver_partial";
  const t = OrderMachine.transition(o.status, event);
  if (!t.ok) throw invalidTransition(o.status, event);
  const id = ulid2();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const number = await a.db.nextNumber("DLV", (/* @__PURE__ */ new Date()).getUTCFullYear());
  const note = [i.note, ...warnings].filter(Boolean).join(" \xB7 ") || null;
  await a.db.batch([
    a.db.prep(
      `INSERT INTO deliveries (id, tenant_id, order_id, number, delivered_by, received_by_name, delivered_at, signature_blob, signature_mime, note, client_uuid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      a.tenantId,
      o.id,
      number,
      a.userId,
      i.received_by_name,
      now,
      sig ? sig.buffer.slice(sig.byteOffset, sig.byteOffset + sig.byteLength) : null,
      sig ? "image/png" : null,
      note,
      i.client_uuid
    ),
    ...parsed.map((p) => a.db.prep(`INSERT INTO delivery_lines (id, delivery_id, order_line_id, qty_delivered, note) VALUES (?, ?, ?, ?, ?)`, ulid2(), id, p.order_line_id, p.qty, p.note ?? null)),
    a.db.prep(`UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, t.value, now, o.id, a.tenantId),
    a.db.audit(a.userId, "delivery", id, "create", { order_status: o.status }, { order_status: t.value, lines: parsed.length, signed: Boolean(sig) }, ulid2())
  ]);
  const ordered = lines.reduce((s, l) => s + l.qty, 0);
  const delivered = [...after.values()].reduce((s, v) => s + v, 0);
  const b = await a.db.first(`SELECT name_ar FROM locations WHERE id = ?`, o.branch_id);
  const msg = `${Math.round(delivered).toLocaleString("en")} \u0645\u0646 ${Math.round(ordered).toLocaleString("en")}${full ? "" : " (\u062C\u0632\u0626\u064A)"}`;
  await notify(a, ["branch_user"], o.branch_id, "delivered", "\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0637\u0644\u0628\u064A\u062A\u0643", msg, { order_id: o.id, delivery_id: id });
  await notify(a, ["plant_manager"], o.plant_id, "delivered", `\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0637\u0644\u0628\u064A\u0629 ${b?.name_ar ?? ""}`, msg, { order_id: o.id, delivery_id: id });
  if (o.production_order_id) await settleDelivered(a, o.production_order_id);
  return okJson(c, { delivery: { id, number }, order_status: t.value, warnings }, 201);
});

// packages/server/src/modules/inventory.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_src();
init_dist();
init_auth();
init_http();
init_notify();
var inventory = new Hono3();
var PREFIX = { opening: "OPN", receipt: "RCV", issue: "ISS", adjustment: "ADJ", transfer: "TRF", waste: "WST", return_in: "RTN", return_out: "RTN" };
var REASON = { opening: "opening", receipt: "receipt", issue: "issue", adjustment: "adjustment", transfer: "transfer", waste: "waste", return_in: "return", return_out: "return" };
var INBOUND = /* @__PURE__ */ new Set(["opening", "receipt", "return_in"]);
var costsOk = /* @__PURE__ */ __name((a) => can(a.grants, "costs:view"), "costsOk");
var toUnitMinor = /* @__PURE__ */ __name((amount, decimals) => minor(Math.round(amount * 10 ** decimals)), "toUnitMinor");
async function defaultWarehouse(a) {
  const w = await a.db.first(`SELECT id FROM locations WHERE tenant_id = ? AND kind = 'warehouse' AND is_active = 1 ORDER BY sort_order LIMIT 1`, a.tenantId);
  if (!w) throw new Fail(422, "BUSINESS_RULE", "\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u062E\u0632\u0646 \u0645\u0639\u0631\u0651\u0641 \u2014 \u0623\u0636\u0641 \u0645\u062E\u0632\u0646\u0627\u064B \u0645\u0646 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A");
  return w.id;
}
__name(defaultWarehouse, "defaultWarehouse");
async function stockState(a, materialId, locationId) {
  const r = await a.db.first(
    `SELECT b.qty, b.valuation_rate_minor, b.stock_value_minor, m.occurred_at AS last_at FROM stock_balances b LEFT JOIN stock_movements m ON m.id = b.last_movement_id
     WHERE b.raw_material_id = ? AND b.location_id = ?`,
    materialId,
    locationId
  );
  if (!r) return { qty: 0, value: minor(0), rate: minor(0), lastAt: null };
  return { qty: qtyFromDb(r.qty), value: minor(r.stock_value_minor), rate: minor(r.valuation_rate_minor), lastAt: r.last_at };
}
__name(stockState, "stockState");
function movementStmt(a, p, voucherId, occurredAt, note, createdAt) {
  return a.db.prep(
    `INSERT INTO stock_movements (id, tenant_id, raw_material_id, location_id, qty, reason, unit_cost_minor, qty_after, valuation_rate_minor_after, stock_value_minor_after, stock_value_diff_minor,
       ref_type, ref_id, voucher_line_id, reverses_movement_id, actor_id, note, occurred_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'voucher', ?, ?, ?, ?, ?, ?, ?)`,
    ulid2(),
    a.tenantId,
    p.materialId,
    p.locationId,
    qtyToDb(p.res.signedQty),
    p.reason,
    p.res.unitCost,
    qtyToDb(p.res.qtyAfter),
    p.res.rateAfter,
    p.res.valueAfter,
    p.res.valueDiff,
    voucherId,
    p.lineId,
    p.reverses ?? null,
    a.userId,
    note,
    occurredAt,
    createdAt
  );
}
__name(movementStmt, "movementStmt");
inventory.post("/vouchers/quick", requirePerm("vouchers:post"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, QuickVoucherInput);
  const done = await a.db.first(`SELECT id, number FROM vouchers WHERE tenant_id = ? AND client_uuid = ?`, a.tenantId, i.client_uuid);
  if (done) return okJson(c, { voucher: { ...done, status: "posted" }, idempotent: true, movements: [], alerts: [] });
  for (let attempt = 0; ; attempt++) {
    try {
      return okJson(c, await postVoucher(a, i), 201);
    } catch (e) {
      if (attempt === 0 && String(e).includes("LEDGER_CHAIN_BROKEN")) continue;
      if (String(e).includes("LEDGER_BACKDATED")) throw new Fail(422, "BUSINESS_RULE", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u062D\u064A\u0644 \u0628\u062A\u0627\u0631\u064A\u062E \u0623\u0642\u062F\u0645 \u0645\u0646 \u0622\u062E\u0631 \u062D\u0631\u0643\u0629 \u0644\u0644\u0645\u0627\u062F\u0629 \u2014 \u0627\u0633\u062A\u062E\u062F\u0645 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u064A\u0648\u0645", { rule: "F19" });
      throw e;
    }
  }
});
async function postVoucher(a, i) {
  const tz = a.settings.timezone;
  const today = localDate(/* @__PURE__ */ new Date(), tz);
  const vDate = i.voucher_date ?? today;
  if (vDate > today) throw new Fail(422, "BUSINESS_RULE", "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0633\u0646\u062F \u0644\u0627 \u064A\u0643\u0648\u0646 \u0641\u064A \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644", { rule: "F18" });
  const locationId = i.location_id ?? await defaultWarehouse(a);
  const loc = await a.db.first(`SELECT 1 FROM locations WHERE id = ? AND tenant_id = ?`, locationId, a.tenantId);
  if (!loc) throw notFound("\u0627\u0644\u0645\u062E\u0632\u0646");
  if (i.kind === "transfer") {
    if (!i.to_location_id || i.to_location_id === locationId) throw new Fail(422, "BUSINESS_RULE", "\u062D\u062F\u062F \u0645\u062E\u0632\u0646 \u0627\u0644\u0648\u062C\u0647\u0629 \u0644\u0644\u062A\u062D\u0648\u064A\u0644");
    if (!await a.db.first(`SELECT 1 FROM locations WHERE id = ? AND tenant_id = ?`, i.to_location_id, a.tenantId)) throw notFound("\u0645\u062E\u0632\u0646 \u0627\u0644\u0648\u062C\u0647\u0629");
  }
  if (i.kind === "issue" && !i.issued_to_name?.trim()) throw new Fail(422, "BUSINESS_RULE", "\u0627\u0633\u0645 \u0627\u0644\u0633\u0627\u062D\u0628 \u0645\u0637\u0644\u0648\u0628 \u0644\u0633\u0646\u062F \u0627\u0644\u0635\u0631\u0641");
  if (i.supplier_id && !await a.db.first(`SELECT 1 FROM suppliers WHERE id = ? AND tenant_id = ?`, i.supplier_id, a.tenantId)) throw notFound("\u0627\u0644\u0645\u0648\u0631\u062F");
  const matIds = [...new Set(i.lines.map((l) => l.raw_material_id))];
  if (matIds.length !== i.lines.length) throw new Fail(409, "DUPLICATE", "\u0645\u0627\u062F\u0629 \u0645\u0643\u0631\u0631\u0629 \u0641\u064A \u0627\u0644\u0633\u0646\u062F");
  const mats = await a.db.all(
    `SELECT m.id, m.name_ar, m.safety_stock, m.default_unit_cost_minor, u.decimals, u.name_ar AS uom_name FROM raw_materials m JOIN uoms u ON u.id = m.uom_id
     WHERE m.tenant_id = ? AND m.is_active = 1 AND m.id IN (SELECT value FROM json_each(?))`,
    a.tenantId,
    JSON.stringify(matIds)
  );
  const mmap = new Map(mats.map((m) => [m.id, m]));
  const allowNeg = a.settings.allow_negative_stock === 1;
  const cd = a.settings.currency_decimals;
  const occurredAt = vDate === today ? (/* @__PURE__ */ new Date()).toISOString() : startOfLocalDayIso(vDate, tz);
  const voucherId = ulid2();
  const lineRows = [];
  const plans = [];
  const warnings = [];
  for (const [idx, l] of i.lines.entries()) {
    const m = mmap.get(l.raw_material_id);
    if (!m) throw new Fail(422, "BUSINESS_RULE", "\u0645\u0627\u062F\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629 \u0623\u0648 \u0645\u0639\u0637\u0651\u0644\u0629", { line_index: idx });
    const q = parseQty(String(Math.abs(l.qty)), Math.min(m.decimals, 4));
    if (!q || q <= 0) throw new Fail(422, "BUSINESS_RULE", "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0623\u0643\u0628\u0631 \u0645\u0646 \u0635\u0641\u0631", { rule: "F4", line_index: idx });
    const st = await stockState(a, m.id, locationId);
    if (st.lastAt && occurredAt < st.lastAt) throw new Fail(422, "BUSINESS_RULE", `\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u062D\u064A\u0644 \u0628\u062A\u0627\u0631\u064A\u062E \u0623\u0642\u062F\u0645 \u0645\u0646 \u0622\u062E\u0631 \u062D\u0631\u0643\u0629 \u0644\u0644\u0645\u0627\u062F\u0629 \xAB${m.name_ar}\xBB \u2014 \u0627\u0633\u062A\u062E\u062F\u0645 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u064A\u0648\u0645`, { rule: "F19", line_index: idx });
    const lineId = ulid2();
    const inbound = INBOUND.has(i.kind) || i.kind === "adjustment" && l.qty > 0;
    let res;
    if (inbound) {
      const cost = l.unit_cost != null ? toUnitMinor(l.unit_cost, cd) : i.kind === "adjustment" ? st.rate : m.default_unit_cost_minor !== null ? minor(m.default_unit_cost_minor) : st.qty > 0 || st.rate > 0 ? st.rate : null;
      if (cost === null) throw new Fail(422, "BUSINESS_RULE", `\u0623\u062F\u062E\u0644 \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0648\u062D\u062F\u0629 \u0644\u0644\u0645\u0627\u062F\u0629 \xAB${m.name_ar}\xBB`, { rule: "F10", line_index: idx });
      res = applyInbound(st, q, cost);
    } else {
      if (!allowNeg && st.qty - q < 0) {
        const avail = st.qty / 1e4;
        throw new Fail(
          422,
          "BUSINESS_RULE",
          `\u0631\u0635\u064A\u062F \u063A\u064A\u0631 \u0643\u0627\u0641\u064D \u0644\u0644\u0645\u0627\u062F\u0629 \xAB${m.name_ar}\xBB: \u0627\u0644\u0645\u062A\u0627\u062D ${avail.toLocaleString("en")} ${m.uom_name}\u060C \u0627\u0644\u0645\u0637\u0644\u0648\u0628 ${(q / 1e4).toLocaleString("en")} ${m.uom_name}`,
          { rule: "F9", line_index: idx, available: avail, requested: q / 1e4 }
        );
      }
      res = applyOutbound(st, q);
    }
    lineRows.push({ id: lineId, materialId: m.id, qty: i.kind === "adjustment" ? l.qty : qtyToDb(q), unitCost: res.unitCost, note: l.note ?? null, sort: idx });
    plans.push({ materialId: m.id, locationId, reason: REASON[i.kind], res, lineId, name: m.name_ar, safety: m.safety_stock, prevQty: st.qty });
    if (i.kind === "transfer") {
      const dst = await stockState(a, m.id, i.to_location_id);
      plans.push({ materialId: m.id, locationId: i.to_location_id, reason: "transfer", res: applyInbound(dst, q, res.unitCost), lineId, name: m.name_ar, safety: m.safety_stock, prevQty: dst.qty });
    }
  }
  const number = await a.db.nextNumber(PREFIX[i.kind], Number(vDate.slice(0, 4)));
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const stmts = [
    a.db.prep(
      `INSERT INTO vouchers (id, tenant_id, kind, number, location_id, to_location_id, supplier_id, external_ref, issued_to_name, purpose, voucher_date, status, note, created_by, posted_by, posted_at, client_uuid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, NULL, NULL, ?)`,
      voucherId,
      a.tenantId,
      i.kind,
      number,
      locationId,
      i.to_location_id ?? null,
      i.supplier_id ?? null,
      i.external_ref ?? null,
      i.issued_to_name ?? null,
      i.purpose ?? null,
      vDate,
      i.note ?? null,
      a.userId,
      i.client_uuid
    ),
    ...lineRows.map((l) => a.db.prep(`INSERT INTO voucher_lines (id, voucher_id, raw_material_id, qty, unit_cost_minor, note, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`, l.id, voucherId, l.materialId, l.qty, l.unitCost, l.note, l.sort)),
    a.db.prep(`UPDATE vouchers SET status = 'posted', posted_by = ?, posted_at = ?, updated_at = ? WHERE id = ?`, a.userId, now, now, voucherId),
    ...plans.map((p, k) => movementStmt(a, p, voucherId, occurredAt, null, new Date(Date.now() + k).toISOString())),
    a.db.audit(a.userId, "voucher", voucherId, "post", null, { kind: i.kind, number, lines: lineRows.length }, ulid2())
  ];
  await a.db.batch(stmts);
  const alerts = plans.filter((p) => p.res.signedQty < 0 && p.res.qtyAfter / 1e4 < p.safety && p.prevQty / 1e4 >= p.safety).map((p) => ({ kind: "low_stock", raw_material_id: p.materialId, name: p.name, qty_after: p.res.qtyAfter / 1e4, safety_stock: p.safety }));
  for (const al of alerts) await notify(a, ["storekeeper", "admin", "owner"], null, "low_stock", `${al.name}: ${al.qty_after.toLocaleString("en")} (\u0627\u0644\u062D\u062F ${al.safety_stock.toLocaleString("en")})`, "\u062A\u062D\u062A \u062D\u062F \u0627\u0644\u0623\u0645\u0627\u0646", { raw_material_id: al.raw_material_id });
  const movements = plans.map((p) => ({ raw_material_id: p.materialId, name: p.name, location_id: p.locationId, qty: p.res.signedQty / 1e4, qty_after: p.res.qtyAfter / 1e4, valuation_rate_minor_after: p.res.rateAfter, stock_value_minor_after: p.res.valueAfter }));
  return stripCosts({ voucher: { id: voucherId, number, status: "posted", kind: i.kind }, movements, warnings, alerts }, costsOk(a));
}
__name(postVoucher, "postVoucher");
inventory.post("/vouchers/:id/cancel", requirePerm("vouchers:post"), async (c) => {
  const a = authOf(c);
  const { reason } = await parseBody2(c, CancelInput);
  const v = await a.db.first(`SELECT id, status, number FROM vouchers WHERE id = ? AND tenant_id = ?`, c.req.param("id"), a.tenantId);
  if (!v) throw notFound("\u0627\u0644\u0633\u0646\u062F");
  if (v.status !== "posted") throw new Fail(409, "INVALID_TRANSITION", "\u064A\u0645\u0643\u0646 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0633\u0646\u062F \u0627\u0644\u0645\u064F\u0631\u062D\u064E\u0651\u0644 \u0641\u0642\u0637");
  for (let attempt = 0; ; attempt++) {
    try {
      const movs = await a.db.all(
        `SELECT id, raw_material_id, location_id, qty, unit_cost_minor, voucher_line_id FROM stock_movements WHERE tenant_id = ? AND ref_type = 'voucher' AND ref_id = ? AND reason <> 'reversal' ORDER BY created_at DESC`,
        a.tenantId,
        v.id
      );
      const plans = [];
      const states = /* @__PURE__ */ new Map();
      for (const m of movs) {
        const key = `${m.raw_material_id}:${m.location_id}`;
        const st = states.get(key) ?? await stockState(a, m.raw_material_id, m.location_id);
        const q = Math.abs(qtyFromDb(m.qty));
        let res;
        if (m.qty > 0) {
          if (a.settings.allow_negative_stock !== 1 && st.qty - q < 0) {
            const mat = await a.db.first(`SELECT name_ar FROM raw_materials WHERE id = ?`, m.raw_material_id);
            throw new Fail(422, "BUSINESS_RULE", `\u0644\u0627 \u064A\u0645\u0643\u0646 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0633\u0646\u062F: \u0631\u0635\u064A\u062F \xAB${mat?.name_ar ?? ""}\xBB \u0627\u0644\u062D\u0627\u0644\u064A \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0648\u0627\u0631\u062F\u0629 (\u0635\u064F\u0631\u0641 \u062C\u0632\u0621 \u0645\u0646\u0647\u0627)`, { rule: "F9" });
          }
          res = applyOutboundAtCost(st, q, minor(m.unit_cost_minor));
        } else {
          res = applyInbound(st, q, minor(m.unit_cost_minor));
        }
        states.set(key, { qty: res.qtyAfter, value: res.valueAfter, rate: res.rateAfter });
        plans.push({ materialId: m.raw_material_id, locationId: m.location_id, reason: "reversal", res, lineId: m.voucher_line_id, reverses: m.id, name: "", safety: 0, prevQty: st.qty });
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await a.db.batch([
        ...plans.map((p, k) => movementStmt(a, p, v.id, now, reason, new Date(Date.now() + k).toISOString())),
        a.db.prep(`UPDATE vouchers SET status = 'cancelled', cancelled_by = ?, cancelled_at = ?, cancel_reason = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, a.userId, now, reason, now, v.id, a.tenantId),
        a.db.audit(a.userId, "voucher", v.id, "cancel", { status: "posted" }, { status: "cancelled", reason }, ulid2())
      ]);
      return okJson(c, { id: v.id, status: "cancelled", reversals: plans.length });
    } catch (e) {
      if (attempt === 0 && String(e).includes("LEDGER_CHAIN_BROKEN")) continue;
      throw e;
    }
  }
});
inventory.get("/vouchers", requirePerm("inventory:read"), async (c) => {
  const a = authOf(c);
  const kind = c.req.query("kind") ?? null;
  const rows = await a.db.all(
    `SELECT v.id, v.kind, v.number, v.voucher_date, v.status, v.external_ref, v.issued_to_name, s.name AS supplier_name, u.full_name AS created_by_name, v.created_at,
            COUNT(vl.id) AS line_count, COALESCE(SUM(ABS(vl.qty) * COALESCE(vl.unit_cost_minor,0)),0) AS total_minor,
            (SELECT group_concat(name_ar, '\u060C ') FROM (SELECT m.name_ar FROM voucher_lines x JOIN raw_materials m ON m.id = x.raw_material_id WHERE x.voucher_id = v.id LIMIT 3)) AS materials
     FROM vouchers v LEFT JOIN voucher_lines vl ON vl.voucher_id = v.id LEFT JOIN suppliers s ON s.id = v.supplier_id JOIN users u ON u.id = v.created_by
     WHERE v.tenant_id = ? AND (? IS NULL OR v.kind = ?) GROUP BY v.id ORDER BY v.created_at DESC LIMIT 200`,
    a.tenantId,
    kind,
    kind
  );
  return okJson(c, stripCosts(rows, costsOk(a)));
});
inventory.get("/vouchers/:id", requirePerm("inventory:read"), async (c) => {
  const a = authOf(c);
  const v = await a.db.first(
    `SELECT v.*, s.name AS supplier_name, l.name_ar AS location_name, tl.name_ar AS to_location_name, u.full_name AS created_by_name, pu.full_name AS posted_by_name, cu.full_name AS cancelled_by_name
     FROM vouchers v LEFT JOIN suppliers s ON s.id = v.supplier_id JOIN locations l ON l.id = v.location_id LEFT JOIN locations tl ON tl.id = v.to_location_id JOIN users u ON u.id = v.created_by
     LEFT JOIN users pu ON pu.id = v.posted_by LEFT JOIN users cu ON cu.id = v.cancelled_by WHERE v.id = ? AND v.tenant_id = ?`,
    c.req.param("id"),
    a.tenantId
  );
  if (!v) throw notFound("\u0627\u0644\u0633\u0646\u062F");
  const [lines, movements, branding] = await Promise.all([
    a.db.all(`SELECT vl.*, m.code, m.name_ar, u.name_ar AS uom_name FROM voucher_lines vl JOIN raw_materials m ON m.id = vl.raw_material_id JOIN uoms u ON u.id = m.uom_id WHERE vl.voucher_id = ? ORDER BY vl.sort_order`, v.id),
    a.db.all(`SELECT sm.id, sm.reason, sm.qty, sm.qty_after, sm.unit_cost_minor, sm.valuation_rate_minor_after, sm.stock_value_minor_after, sm.occurred_at, m.name_ar, l.name_ar AS location_name
              FROM stock_movements sm JOIN raw_materials m ON m.id = sm.raw_material_id JOIN locations l ON l.id = sm.location_id WHERE sm.tenant_id = ? AND sm.ref_type = 'voucher' AND sm.ref_id = ? ORDER BY sm.created_at`, a.tenantId, v.id),
    a.db.first(`SELECT company_name, logo_url, primary_color, phone, address, footer_text, tax_number FROM tenant_branding WHERE tenant_id = ?`, a.tenantId)
  ]);
  return okJson(c, stripCosts({ ...v, lines, movements, branding }, costsOk(a)));
});
inventory.get("/raw-materials", requirePerm("inventory:read"), async (c) => {
  const a = authOf(c);
  const loc = c.req.query("location_id") ?? await defaultWarehouse(a);
  const rows = await a.db.all(
    `SELECT m.id, m.code, m.name_ar, m.category_id, rc.name_ar AS category_name, m.uom_id, u.name_ar AS uom_name, u.decimals AS uom_decimals, m.safety_stock, m.default_unit_cost_minor, m.is_active,
            COALESCE(b.qty, 0) AS qty_on_hand, COALESCE(b.valuation_rate_minor, m.default_unit_cost_minor, 0) AS unit_cost_minor, COALESCE(b.stock_value_minor, 0) AS stock_value_minor,
            CASE WHEN COALESCE(b.qty,0) <= 0 THEN 'out' WHEN COALESCE(b.qty,0) < m.safety_stock THEN 'low' ELSE 'ok' END AS stock_status,
            (SELECT MAX(created_at) FROM stock_movements WHERE raw_material_id = m.id) AS last_movement_at
     FROM raw_materials m JOIN uoms u ON u.id = m.uom_id LEFT JOIN raw_material_categories rc ON rc.id = m.category_id
     LEFT JOIN stock_balances b ON b.raw_material_id = m.id AND b.location_id = ?
     WHERE m.tenant_id = ? ORDER BY rc.sort_order, m.name_ar`,
    loc,
    a.tenantId
  );
  return okJson(c, stripCosts(rows, costsOk(a)));
});
inventory.get("/raw-materials/:id", requirePerm("inventory:read"), async (c) => {
  const a = authOf(c);
  const loc = c.req.query("location_id") ?? await defaultWarehouse(a);
  const m = await a.db.first(
    `SELECT m.*, rc.name_ar AS category_name, u.name_ar AS uom_name, u.decimals AS uom_decimals, COALESCE(b.qty,0) AS qty_on_hand, COALESCE(b.valuation_rate_minor, m.default_unit_cost_minor, 0) AS unit_cost_minor,
            COALESCE(b.stock_value_minor,0) AS stock_value_minor, CASE WHEN COALESCE(b.qty,0) <= 0 THEN 'out' WHEN COALESCE(b.qty,0) < m.safety_stock THEN 'low' ELSE 'ok' END AS stock_status
     FROM raw_materials m JOIN uoms u ON u.id = m.uom_id LEFT JOIN raw_material_categories rc ON rc.id = m.category_id LEFT JOIN stock_balances b ON b.raw_material_id = m.id AND b.location_id = ?
     WHERE m.id = ? AND m.tenant_id = ?`,
    loc,
    c.req.param("id"),
    a.tenantId
  );
  if (!m) throw notFound("\u0627\u0644\u0645\u0627\u062F\u0629");
  const ledger = await a.db.all(
    `SELECT sm.id, sm.reason, sm.qty, sm.qty_after, sm.unit_cost_minor, sm.valuation_rate_minor_after, sm.stock_value_minor_after, sm.occurred_at, sm.created_at, sm.note,
            v.id AS voucher_id, v.number AS voucher_number, v.kind AS voucher_kind, v.issued_to_name, v.external_ref, s.name AS supplier_name, u.full_name AS actor_name
     FROM stock_movements sm LEFT JOIN vouchers v ON v.id = sm.ref_id AND sm.ref_type = 'voucher' LEFT JOIN suppliers s ON s.id = v.supplier_id JOIN users u ON u.id = sm.actor_id
     WHERE sm.tenant_id = ? AND sm.raw_material_id = ? AND sm.location_id = ? ORDER BY sm.occurred_at DESC, sm.created_at DESC LIMIT 200`,
    a.tenantId,
    m.id,
    loc
  );
  return okJson(c, stripCosts({ ...m, ledger }, costsOk(a)));
});
inventory.post("/raw-materials", requirePerm("inventory:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, RawMaterialInput);
  const id = ulid2();
  try {
    await a.db.batch([
      a.db.prep(
        `INSERT INTO raw_materials (id, tenant_id, category_id, code, name_ar, uom_id, safety_stock, default_unit_cost_minor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        a.tenantId,
        i.category_id ?? null,
        i.code,
        i.name_ar,
        i.uom_id,
        i.safety_stock,
        i.default_unit_cost == null ? null : toUnitMinor(i.default_unit_cost, a.settings.currency_decimals)
      ),
      a.db.audit(a.userId, "raw_material", id, "create", null, i, ulid2())
    ]);
  } catch (e) {
    if (String(e).includes("UNIQUE")) throw new Fail(409, "DUPLICATE", "\u0643\u0648\u062F \u0627\u0644\u0645\u0627\u062F\u0629 \u0645\u0633\u062A\u062E\u062F\u0645");
    throw e;
  }
  return okJson(c, { id }, 201);
});
inventory.put("/raw-materials/:id", requirePerm("inventory:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, RawMaterialInput);
  const id = c.req.param("id");
  const before = await a.db.first(`SELECT * FROM raw_materials WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound("\u0627\u0644\u0645\u0627\u062F\u0629");
  if (before.uom_id !== i.uom_id && await a.db.first(`SELECT 1 FROM stock_movements WHERE raw_material_id = ? LIMIT 1`, id)) throw new Fail(409, "CONFLICT", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u063A\u064A\u064A\u0631 \u0648\u062D\u062F\u0629 \u0645\u0627\u062F\u0629 \u0644\u0647\u0627 \u062D\u0631\u0643\u0627\u062A", { rule: "F22" });
  await a.db.batch([
    a.db.prep(
      `UPDATE raw_materials SET category_id = ?, code = ?, name_ar = ?, uom_id = ?, safety_stock = ?, default_unit_cost_minor = ?, is_active = COALESCE(?, is_active), updated_at = ? WHERE id = ? AND tenant_id = ?`,
      i.category_id ?? null,
      i.code,
      i.name_ar,
      i.uom_id,
      i.safety_stock,
      i.default_unit_cost == null ? null : toUnitMinor(i.default_unit_cost, a.settings.currency_decimals),
      i.is_active === void 0 ? null : Number(i.is_active),
      (/* @__PURE__ */ new Date()).toISOString(),
      id,
      a.tenantId
    ),
    a.db.audit(a.userId, "raw_material", id, "update", before, i, ulid2())
  ]);
  return okJson(c, { id });
});
inventory.get("/raw-material-categories", requirePerm("inventory:read"), async (c) => {
  const a = authOf(c);
  return okJson(c, await a.db.all(`SELECT id, name_ar, sort_order FROM raw_material_categories WHERE tenant_id = ? AND is_active = 1 ORDER BY sort_order`, a.tenantId));
});
inventory.get("/suppliers", requirePerm("inventory:read"), async (c) => {
  const a = authOf(c);
  return okJson(c, await a.db.all(`SELECT id, name, phone, address FROM suppliers WHERE tenant_id = ? AND is_active = 1 ORDER BY name`, a.tenantId));
});
inventory.post("/suppliers", requirePerm("inventory:write"), async (c) => {
  const a = authOf(c);
  const i = await parseBody2(c, SupplierInput);
  const id = ulid2();
  await a.db.run(`INSERT INTO suppliers (id, tenant_id, name, phone, address) VALUES (?, ?, ?, ?, ?)`, id, a.tenantId, i.name, i.phone ?? null, i.address ?? null);
  return okJson(c, { id }, 201);
});
inventory.get("/inventory/suggestions", requirePerm("inventory:read"), async (c) => {
  const a = authOf(c);
  const [recent, lastCosts, requesters] = await Promise.all([
    a.db.all(`SELECT raw_material_id, MAX(created_at) t FROM stock_movements WHERE tenant_id = ? GROUP BY raw_material_id ORDER BY t DESC LIMIT 6`, a.tenantId),
    a.db.all(`SELECT vl.raw_material_id, vl.unit_cost_minor, v.supplier_id FROM voucher_lines vl JOIN vouchers v ON v.id = vl.voucher_id
              WHERE v.tenant_id = ? AND v.kind = 'receipt' AND v.status = 'posted' AND vl.rowid IN (SELECT MAX(x.rowid) FROM voucher_lines x JOIN vouchers y ON y.id = x.voucher_id WHERE y.tenant_id = ? AND y.kind = 'receipt' GROUP BY x.raw_material_id)`, a.tenantId, a.tenantId),
    a.db.all(`SELECT issued_to_name, MAX(created_at) t FROM vouchers WHERE tenant_id = ? AND issued_to_name IS NOT NULL GROUP BY issued_to_name ORDER BY t DESC LIMIT 6`, a.tenantId)
  ]);
  return okJson(c, stripCosts({ recent: recent.map((r) => r.raw_material_id), last_costs: lastCosts, requesters: requesters.map((r) => r.issued_to_name) }, costsOk(a)));
});
inventory.get("/stock/overview", requirePerm("stock:read"), async (c) => {
  const a = authOf(c);
  const tz = a.settings.timezone;
  const loc = c.req.query("location_id") ?? await defaultWarehouse(a);
  const today = localDate(/* @__PURE__ */ new Date(), tz);
  const fromD = c.req.query("from") ?? `${today.slice(0, 8)}01`;
  const toD = c.req.query("to") ?? today;
  const from = startOfLocalDayIso(fromD, tz);
  const [y, mo, d] = toD.split("-").map(Number);
  const to = startOfLocalDayIso(new Date(Date.UTC(y, mo - 1, d + 1)).toISOString().slice(0, 10), tz);
  const rows = await a.db.all(
    `WITH
     opening AS (SELECT sm.raw_material_id, sm.qty_after AS opening_qty, sm.stock_value_minor_after AS opening_value FROM stock_movements sm
       WHERE sm.tenant_id = ?1 AND sm.location_id = ?2 AND sm.occurred_at < ?3
         AND (sm.occurred_at || sm.created_at) = (SELECT MAX(occurred_at || created_at) FROM stock_movements WHERE raw_material_id = sm.raw_material_id AND location_id = sm.location_id AND occurred_at < ?3)),
     period AS (SELECT raw_material_id, SUM(CASE WHEN qty > 0 THEN qty ELSE 0 END) AS qty_in, SUM(CASE WHEN qty < 0 THEN -qty ELSE 0 END) AS qty_out
       FROM stock_movements WHERE tenant_id = ?1 AND location_id = ?2 AND occurred_at >= ?3 AND occurred_at < ?4 GROUP BY raw_material_id),
     closing AS (SELECT sm.raw_material_id, sm.qty_after AS closing_qty, sm.valuation_rate_minor_after AS closing_rate, sm.stock_value_minor_after AS closing_value FROM stock_movements sm
       WHERE sm.tenant_id = ?1 AND sm.location_id = ?2 AND sm.occurred_at < ?4
         AND (sm.occurred_at || sm.created_at) = (SELECT MAX(occurred_at || created_at) FROM stock_movements WHERE raw_material_id = sm.raw_material_id AND location_id = sm.location_id AND occurred_at < ?4))
     SELECT rm.id, rm.code, rmc.name_ar AS category, rmc.id AS category_id, rm.name_ar, u.name_ar AS uom, rm.safety_stock,
            COALESCE(o.opening_qty, 0) AS opening_qty, COALESCE(p.qty_in, 0) AS total_in, COALESCE(p.qty_out, 0) AS total_out,
            COALESCE(cl.closing_qty, 0) AS closing_qty, COALESCE(cl.closing_rate, rm.default_unit_cost_minor, 0) AS unit_cost_minor, COALESCE(cl.closing_value, 0) AS closing_value_minor,
            CASE WHEN COALESCE(cl.closing_qty,0) <= 0 THEN 'out' WHEN COALESCE(cl.closing_qty,0) < rm.safety_stock THEN 'low' ELSE 'ok' END AS stock_status
     FROM raw_materials rm LEFT JOIN raw_material_categories rmc ON rmc.id = rm.category_id JOIN uoms u ON u.id = rm.uom_id
     LEFT JOIN opening o ON o.raw_material_id = rm.id LEFT JOIN period p ON p.raw_material_id = rm.id LEFT JOIN closing cl ON cl.raw_material_id = rm.id
     WHERE rm.tenant_id = ?1 AND rm.is_active = 1 ORDER BY rmc.sort_order, rm.name_ar`,
    a.tenantId,
    loc,
    from,
    to
  );
  const location = await a.db.first(`SELECT id, name_ar FROM locations WHERE id = ?`, loc);
  return okJson(c, stripCosts({ from: fromD, to: toD, location, rows }, costsOk(a)));
});
inventory.get("/movements", requirePerm("inventory:read"), async (c) => {
  const a = authOf(c);
  const loc = c.req.query("location_id") ?? await defaultWarehouse(a);
  const today = localDate(/* @__PURE__ */ new Date(), a.settings.timezone);
  const from = c.req.query("from") ?? today;
  const to = c.req.query("to") ?? today;
  const dir3 = c.req.query("dir") ?? null;
  const rows = await a.db.all(
    `SELECT sm.id, sm.occurred_at, sm.reason, sm.qty, sm.qty_after, sm.unit_cost_minor, ABS(sm.stock_value_diff_minor) AS value_minor, sm.reverses_movement_id,
            m.id AS raw_material_id, m.code, m.name_ar, un.name_ar AS uom_name, rc.name_ar AS category_name,
            v.id AS voucher_id, v.number AS voucher_number, v.kind AS voucher_kind, v.status AS voucher_status, v.issued_to_name, v.external_ref, s.name AS supplier_name, u.full_name AS actor_name
     FROM stock_movements sm JOIN raw_materials m ON m.id = sm.raw_material_id JOIN uoms un ON un.id = m.uom_id LEFT JOIN raw_material_categories rc ON rc.id = m.category_id
     LEFT JOIN vouchers v ON v.id = sm.ref_id AND sm.ref_type = 'voucher' LEFT JOIN suppliers s ON s.id = v.supplier_id JOIN users u ON u.id = sm.actor_id
     WHERE sm.tenant_id = ? AND sm.location_id = ? AND sm.occurred_at >= ? AND sm.occurred_at < ?
       AND (? IS NULL OR (? = 'in' AND sm.qty > 0) OR (? = 'out' AND sm.qty < 0))
     ORDER BY sm.occurred_at DESC, sm.created_at DESC LIMIT 1000`,
    a.tenantId,
    loc,
    startOfLocalDayIso(from, a.settings.timezone),
    startOfLocalDayIso(addDays(to, 1), a.settings.timezone),
    dir3,
    dir3,
    dir3
  );
  return okJson(c, stripCosts({ from, to, rows }, costsOk(a)));
});

// packages/server/src/index.ts
init_notify();
init_ordering();
init_production();

// packages/server/src/modules/reports.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_src();
init_dist();
init_auth();
init_http();
var reports = new Hono3();
reports.get("/dashboard", async (c) => {
  const a = authOf(c);
  const today = localDate(/* @__PURE__ */ new Date(), a.settings.timezone);
  const tomorrow = addDays(today, 1);
  const [todayPo, tomorrowPo, lowStock, deliveries, pendingEx, recent] = await Promise.all([
    a.db.first(`SELECT po.id, po.number, po.status, po.delivery_date, (SELECT COUNT(*) FROM orders o WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS orders,
                (SELECT COALESCE(SUM(ol.qty),0) FROM orders o JOIN order_lines ol ON ol.order_id = o.id WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS units
                FROM production_orders po JOIN order_windows w ON w.id = po.window_id WHERE po.tenant_id = ? AND po.delivery_date = ? AND w.kind = 'regular' LIMIT 1`, a.tenantId, today),
    a.db.first(`SELECT po.id, po.number, po.status, po.delivery_date, (SELECT COUNT(*) FROM orders o WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS orders,
                (SELECT COALESCE(SUM(ol.qty),0) FROM orders o JOIN order_lines ol ON ol.order_id = o.id WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS units
                FROM production_orders po JOIN order_windows w ON w.id = po.window_id WHERE po.tenant_id = ? AND po.delivery_date = ? AND w.kind = 'regular' LIMIT 1`, a.tenantId, tomorrow),
    a.db.all(`SELECT m.id, m.name_ar, COALESCE(b.qty,0) AS qty, m.safety_stock, u.name_ar AS uom_name FROM raw_materials m JOIN uoms u ON u.id = m.uom_id LEFT JOIN stock_balances b ON b.raw_material_id = m.id
              WHERE m.tenant_id = ? AND m.is_active = 1 AND COALESCE(b.qty,0) < m.safety_stock ORDER BY COALESCE(b.qty,0) / MAX(m.safety_stock, 0.0001) LIMIT 8`, a.tenantId),
    a.db.first(`SELECT COALESCE(SUM(ol.qty),0) AS ordered, COALESCE(SUM((SELECT SUM(qty_delivered) FROM delivery_lines WHERE order_line_id = ol.id)),0) AS delivered, COUNT(DISTINCT o.id) AS n
              FROM orders o JOIN order_lines ol ON ol.order_id = o.id WHERE o.tenant_id = ? AND o.delivery_date BETWEEN ? AND ? AND o.status IN ('delivered','partially_delivered')`, a.tenantId, addDays(today, -6), today),
    a.db.first(`SELECT COUNT(*) n FROM order_exceptions e JOIN orders o ON o.id = e.order_id WHERE o.tenant_id = ? AND e.status = 'pending' AND e.expires_at > ?`, a.tenantId, (/* @__PURE__ */ new Date()).toISOString()),
    a.db.all(`SELECT al.entity_type, al.action, al.at, u.full_name AS actor_name, al.entity_id FROM audit_log al LEFT JOIN users u ON u.id = al.actor_id WHERE al.tenant_id = ? AND al.action NOT IN ('login','set_pin') ORDER BY al.at DESC LIMIT 8`, a.tenantId)
  ]);
  return okJson(c, { today, today_po: todayPo, tomorrow_po: tomorrowPo, low_stock: lowStock, fulfillment_7d: deliveries, pending_exceptions: pendingEx?.n ?? 0, recent });
});
reports.get("/reports/demand", requirePerm("reports:read"), async (c) => {
  const a = authOf(c);
  const today = localDate(/* @__PURE__ */ new Date(), a.settings.timezone);
  const from = c.req.query("from") ?? addDays(today, -6);
  const to = c.req.query("to") ?? addDays(today, 1);
  const groupBy = c.req.query("group_by") === "branch" ? "branch" : "product";
  const rows = groupBy === "branch" ? await a.db.all(`SELECT l.id AS key_id, l.name_ar AS label, COUNT(DISTINCT o.id) AS orders, COALESCE(SUM(ol.qty),0) AS qty_ordered,
                        COALESCE(SUM((SELECT SUM(qty_delivered) FROM delivery_lines WHERE order_line_id = ol.id)),0) AS qty_delivered
                      FROM orders o JOIN order_lines ol ON ol.order_id = o.id JOIN locations l ON l.id = o.branch_id
                      WHERE o.tenant_id = ? AND o.delivery_date BETWEEN ? AND ? AND o.status <> 'cancelled' GROUP BY l.id ORDER BY qty_ordered DESC`, a.tenantId, from, to) : await a.db.all(`SELECT p.id AS key_id, p.name_ar AS label, c.name_ar AS category, u.name_ar AS uom, COUNT(DISTINCT o.id) AS orders, COALESCE(SUM(ol.qty),0) AS qty_ordered,
                        COALESCE(SUM((SELECT SUM(qty_delivered) FROM delivery_lines WHERE order_line_id = ol.id)),0) AS qty_delivered
                      FROM orders o JOIN order_lines ol ON ol.order_id = o.id JOIN products p ON p.id = ol.product_id JOIN categories c ON c.id = p.category_id JOIN uoms u ON u.id = p.uom_id
                      WHERE o.tenant_id = ? AND o.delivery_date BETWEEN ? AND ? AND o.status <> 'cancelled' GROUP BY p.id ORDER BY c.sort_order, qty_ordered DESC`, a.tenantId, from, to);
  const daily = await a.db.all(`SELECT o.delivery_date AS day, COALESCE(SUM(ol.qty),0) AS qty FROM orders o JOIN order_lines ol ON ol.order_id = o.id
                                WHERE o.tenant_id = ? AND o.delivery_date BETWEEN ? AND ? AND o.status <> 'cancelled' GROUP BY o.delivery_date ORDER BY day`, a.tenantId, from, to);
  return okJson(c, { from, to, group_by: groupBy, rows, daily });
});

// packages/server/src/modules/manifest.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_dist();
var manifest = new Hono3();
manifest.get("/:slug/manifest.webmanifest", async (c) => {
  const slug = c.req.param("slug");
  const b = await c.env.DB.prepare(`SELECT b.company_name, b.primary_color FROM tenants t JOIN tenant_branding b ON b.tenant_id = t.id WHERE t.slug = ?`).bind(slug).first();
  const name = b?.company_name ?? "\u0645\u064F\u0639\u064A\u0646";
  const body = {
    name,
    short_name: name.length <= 12 ? name : "\u0645\u064F\u0639\u064A\u0646",
    description: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0637\u0644\u0628\u064A\u0627\u062A \u0648\u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0648\u0627\u0644\u0645\u062E\u0632\u0648\u0646",
    lang: "ar",
    dir: "rtl",
    start_url: `/?tenant=${encodeURIComponent(slug)}`,
    scope: "/",
    id: `/?tenant=${encodeURIComponent(slug)}`,
    display: "standalone",
    display_override: ["standalone"],
    orientation: "any",
    background_color: "#FAF7F2",
    theme_color: "#FAF7F2",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    shortcuts: [
      { name: "\u0637\u0644\u0628\u064A\u0629 \u0627\u0644\u064A\u0648\u0645", url: "/order", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "\u062D\u0631\u0643\u0629 \u0645\u062E\u0632\u0646\u064A\u0629", url: "/movement", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] }
    ]
  };
  c.header("Content-Type", "application/manifest+json; charset=utf-8");
  c.header("Cache-Control", "public, max-age=300");
  return c.body(JSON.stringify(body));
});

// packages/server/src/modules/seed.ts
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_src();
init_dist();
init_db();
init_http();
async function createTenant(env2, slug, name, demo) {
  if (await env2.DB.prepare(`SELECT 1 FROM tenants WHERE slug = ?`).bind(slug).first()) return { created: false };
  const t = ulid2();
  const db = new Db(env2.DB, t);
  const pepper3 = env2.PEPPER ?? "moain-dev-pepper";
  const s = [
    db.prep(`INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)`, t, name, slug),
    db.prep(`INSERT INTO tenant_settings (tenant_id) VALUES (?)`, t),
    db.prep(`INSERT INTO tenant_branding (tenant_id, company_name, phone, address, footer_text) VALUES (?, ?, ?, ?, ?)`, t, name, "01-456789", "\u0635\u0646\u0639\u0627\u0621 \u2014 \u0634\u0627\u0631\u0639 \u0627\u0644\u0633\u062A\u064A\u0646", "\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0639\u0627\u0645\u0644\u0643\u0645 \u0645\u0639\u0646\u0627")
  ];
  const U = {};
  for (const [code, n, dec] of [["kg", "\u0643\u062C\u0645", 2], ["g", "\u062C\u0645", 0], ["l", "\u0644\u062A\u0631", 2], ["pc", "\u062D\u0628\u0629", 0], ["ctn", "\u0643\u0631\u062A\u0648\u0646", 0], ["tray", "\u0635\u064A\u0646\u064A\u0629", 0], ["loaf", "\u0631\u063A\u064A\u0641", 0], ["slice", "\u0642\u0637\u0639\u0629", 0]]) {
    U[code] = ulid2();
    s.push(db.prep(`INSERT INTO uoms (id, tenant_id, code, name_ar, decimals) VALUES (?, ?, ?, ?, ?)`, U[code], t, code, n, dec));
  }
  const C = [];
  for (const [i, [n, color]] of [["\u0627\u0644\u0645\u0639\u062C\u0646\u0627\u062A", "#B08D5B"], ["\u0627\u0644\u0645\u062E\u0628\u0648\u0632\u0627\u062A", "#8A6A4F"], ["\u0627\u0644\u0643\u064A\u0643", "#A0715E"], ["\u0627\u0644\u0628\u0648\u062A\u064A\u0641\u0648\u0631\u0627\u062A", "#7D7A62"], ["\u0627\u0644\u062A\u0631\u062A", "#6F7F68"]].entries()) {
    const id = ulid2();
    C.push(id);
    s.push(db.prep(`INSERT INTO categories (id, tenant_id, name_ar, color, sort_order) VALUES (?, ?, ?, ?, ?)`, id, t, n, color, (i + 1) * 10));
  }
  const RC = [];
  for (const [i, n] of ["\u062F\u0642\u064A\u0642 \u0648\u0646\u0634\u0648\u064A\u0627\u062A", "\u0633\u0643\u0631\u064A\u0627\u062A", "\u062F\u0647\u0648\u0646 \u0648\u0632\u064A\u0648\u062A", "\u0623\u0644\u0628\u0627\u0646 \u0648\u0628\u064A\u0636", "\u062E\u0645\u0627\u0626\u0631 \u0648\u0645\u062D\u0633\u0646\u0627\u062A", "\u0646\u0643\u0647\u0627\u062A \u0648\u0625\u0636\u0627\u0641\u0627\u062A", "\u062A\u063A\u0644\u064A\u0641"].entries()) {
    const id = ulid2();
    RC.push(id);
    s.push(db.prep(`INSERT INTO raw_material_categories (id, tenant_id, name_ar, sort_order) VALUES (?, ?, ?, ?)`, id, t, n, (i + 1) * 10));
  }
  const plant = ulid2(), wh = ulid2(), b1 = ulid2(), b2 = ulid2();
  s.push(
    db.prep(`INSERT INTO locations (id, tenant_id, code, name_ar, kind, sort_order, phone, address) VALUES (?, ?, 'PL-01', '\u0627\u0644\u0645\u0639\u0645\u0644 \u0627\u0644\u0645\u0631\u0643\u0632\u064A', 'plant', 10, '01-456789', '\u0635\u0646\u0639\u0627\u0621 \u2014 \u0634\u0627\u0631\u0639 \u0627\u0644\u0633\u062A\u064A\u0646')`, plant, t),
    db.prep(`INSERT INTO locations (id, tenant_id, code, name_ar, kind, sort_order) VALUES (?, ?, 'WH-01', '\u0627\u0644\u0645\u062E\u0632\u0646 \u0627\u0644\u0645\u0631\u0643\u0632\u064A', 'warehouse', 10)`, wh, t),
    db.prep(`INSERT INTO locations (id, tenant_id, code, name_ar, kind, default_plant_id, sort_order) VALUES (?, ?, 'BR-01', '\u0641\u0631\u0639 \u0627\u0644\u0633\u062A\u064A\u0646', 'branch', ?, 10)`, b1, t, plant),
    db.prep(`INSERT INTO locations (id, tenant_id, code, name_ar, kind, default_plant_id, sort_order) VALUES (?, ?, 'BR-02', '\u0641\u0631\u0639 \u062D\u062F\u0629', 'branch', ?, 20)`, b2, t, plant),
    db.prep(`INSERT INTO order_windows (id, tenant_id, plant_id, name_ar, kind, cutoff_time, delivery_offset_days, sort_order) VALUES (?, ?, ?, '\u0627\u0644\u0637\u0644\u0628\u064A\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629', 'regular', '22:00', 1, 10)`, ulid2(), t, plant),
    db.prep(`INSERT INTO order_windows (id, tenant_id, plant_id, name_ar, kind, cutoff_time, delivery_offset_days, sort_order) VALUES (?, ?, ?, '\u0637\u0644\u0628 \u0639\u0627\u062C\u0644', 'urgent', NULL, 0, 20)`, ulid2(), t, plant)
  );
  const users = [
    ["owner@alnoor.ye", "\u0639\u0628\u062F\u0627\u0644\u0644\u0647 \u0627\u0644\u0646\u0648\u0631", "770000001", [["owner", null]]],
    ["plant@alnoor.ye", "\u0645. \u062E\u0627\u0644\u062F \u0627\u0644\u0639\u0645\u0631\u064A", "770000002", [["plant_manager", plant]]],
    ["staff@alnoor.ye", "\u0633\u0627\u0645\u064A \u0627\u0644\u062D\u062F\u0627\u062F", "770000003", [["plant_staff", plant]]],
    ["sitteen@alnoor.ye", "\u0623\u062D\u0645\u062F \u0635\u0627\u0644\u062D", "770000004", [["branch_user", b1]]],
    ["hadda@alnoor.ye", "\u0645\u062D\u0645\u062F \u0642\u0627\u0633\u0645", "770000005", [["branch_user", b2]]],
    ["store@alnoor.ye", "\u0641\u0647\u062F \u0627\u0644\u0645\u062E\u0644\u0627\u0641\u064A", "770000006", [["storekeeper", null]]]
  ];
  const hash = await hashSecret("123456", pepper3);
  const ids = [];
  for (const [email, full, phone, roles] of users) {
    const id = ulid2();
    ids.push(id);
    s.push(db.prep(`INSERT INTO users (id, tenant_id, email, phone, full_name, password_hash) VALUES (?, ?, ?, ?, ?, ?)`, id, t, email, phone, full, hash));
    for (const [r, loc] of roles) s.push(db.prep(`INSERT INTO user_roles (user_id, role, location_id) VALUES (?, ?, ?)`, id, r, loc));
  }
  await db.batch(s);
  if (!demo) return { created: true };
  const p = [];
  const products = [
    [0, "\u0643\u0631\u0648\u0627\u0633\u0648\u0646 \u0632\u0628\u062F\u0629", "pc"],
    [0, "\u0641\u0637\u064A\u0631\u0629 \u062C\u0628\u0646", "pc"],
    [0, "\u0641\u0637\u064A\u0631\u0629 \u0633\u0628\u0627\u0646\u062E", "pc"],
    [0, "\u0628\u0641 \u0628\u0627\u0633\u062A\u0631\u064A \u0644\u062D\u0645", "pc"],
    [0, "\u0633\u0645\u0628\u0648\u0633\u0629 \u062E\u0636\u0627\u0631", "pc"],
    [0, "\u0643\u0631\u0648\u0627\u0633\u0648\u0646 \u0634\u0648\u0643\u0648\u0644\u0627\u062A\u0629", "pc"],
    [1, "\u062E\u0628\u0632 \u062A\u0648\u0633\u062A \u0623\u0628\u064A\u0636", "loaf"],
    [1, "\u062E\u0628\u0632 \u0628\u0631", "loaf"],
    [1, "\u0635\u0645\u0648\u0646", "pc"],
    [1, "\u062E\u0628\u0632 \u0628\u0631\u062C\u0631", "pc"],
    [1, "\u0643\u0639\u0643 \u0628\u0627\u0644\u0633\u0645\u0633\u0645", "pc"],
    [2, "\u0643\u064A\u0643 \u0634\u0648\u0643\u0648\u0644\u0627\u062A\u0629", "slice"],
    [2, "\u0643\u064A\u0643 \u0641\u0627\u0646\u064A\u0644\u0627", "slice"],
    [2, "\u0631\u064A\u062F \u0641\u0644\u0641\u062A", "slice"],
    [2, "\u0643\u064A\u0643 \u062C\u0632\u0631", "slice"],
    [3, "\u0628\u0648\u062A\u064A\u0641\u0648\u0631 \u0645\u0634\u0643\u0651\u0644", "kg"],
    [3, "\u0628\u0648\u062A\u064A\u0641\u0648\u0631 \u0628\u0627\u0644\u062A\u0645\u0631", "kg"],
    [3, "\u0645\u0639\u0645\u0648\u0644", "kg"],
    [4, "\u062A\u0631\u062A \u0641\u0648\u0627\u0643\u0647", "pc"],
    [4, "\u062A\u0631\u062A \u0644\u064A\u0645\u0648\u0646", "pc"],
    [4, "\u062A\u0631\u062A \u0634\u0648\u0643\u0648\u0644\u0627\u062A\u0629", "pc"]
  ];
  products.forEach(([ci, n, u], i) => p.push(db.prep(
    `INSERT INTO products (id, tenant_id, category_id, code, name_ar, uom_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ulid2(),
    t,
    C[ci],
    `PR-${String(i + 1).padStart(3, "0")}`,
    n,
    U[u],
    i
  )));
  const mats = [
    [0, "\u062F\u0642\u064A\u0642 \u0641\u0627\u062E\u0631", "kg", 50, 600],
    [0, "\u062F\u0642\u064A\u0642 \u0623\u0633\u0645\u0631", "kg", 20, 550],
    [0, "\u0646\u0634\u0627 \u0630\u0631\u0629", "kg", 5, 900],
    [1, "\u0633\u0643\u0631 \u0646\u0627\u0639\u0645", "kg", 20, 700],
    [1, "\u0633\u0643\u0631 \u0628\u0648\u062F\u0631\u0629", "kg", 10, 950],
    [2, "\u0632\u0628\u062F\u0629", "kg", 15, 4200],
    [2, "\u0632\u064A\u062A \u0646\u0628\u0627\u062A\u064A", "l", 10, 1500],
    [2, "\u0633\u0645\u0646 \u0646\u0628\u0627\u062A\u064A", "kg", 10, 2200],
    [3, "\u0628\u064A\u0636", "ctn", 4, 3600],
    [3, "\u062D\u0644\u064A\u0628 \u0633\u0627\u0626\u0644", "l", 15, 650],
    [3, "\u062C\u0628\u0646 \u0645\u0648\u0632\u0627\u0631\u064A\u0644\u0627", "kg", 8, 5200],
    [4, "\u062E\u0645\u064A\u0631\u0629 \u0641\u0648\u0631\u064A\u0629", "kg", 2, 4800],
    [4, "\u0628\u064A\u0643\u0646\u062C \u0628\u0627\u0648\u062F\u0631", "kg", 1, 3e3],
    [5, "\u0643\u0627\u0643\u0627\u0648", "kg", 3, 6500],
    [5, "\u0641\u0627\u0646\u064A\u0644\u0627", "kg", 1, 9e3],
    [6, "\u0639\u0644\u0628 \u0643\u064A\u0643", "pc", 100, 120],
    [6, "\u0623\u0643\u064A\u0627\u0633 \u062E\u0628\u0632", "pc", 300, 25]
  ];
  mats.forEach(([ci, n, u, safety, cost], i) => p.push(db.prep(
    `INSERT INTO raw_materials (id, tenant_id, category_id, code, name_ar, uom_id, safety_stock, default_unit_cost_minor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ulid2(),
    t,
    RC[ci],
    `RM-${String(i + 1).padStart(3, "0")}`,
    n,
    U[u],
    safety,
    cost
  )));
  p.push(db.prep(`INSERT INTO suppliers (id, tenant_id, name, phone) VALUES (?, ?, '\u0634\u0631\u0643\u0629 \u0627\u0644\u0623\u0645\u0644 \u0644\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629', '777123456')`, ulid2(), t));
  p.push(db.prep(`INSERT INTO suppliers (id, tenant_id, name, phone) VALUES (?, ?, '\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0633\u0639\u064A\u062F \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629', '777654321')`, ulid2(), t));
  await db.batch(p);
  return { created: true };
}
__name(createTenant, "createTenant");
var seed = new Hono3();
seed.post("/seed", async (c) => {
  if (c.env.DEMO !== "1") return c.json({ ok: false }, 404);
  const q = c.req.query("slug");
  const slug = q && /^[a-z0-9-]{2,32}$/.test(q) ? q : c.env.DEFAULT_TENANT ?? "alnoor";
  const name = slug === (c.env.DEFAULT_TENANT ?? "alnoor") ? "\u0645\u062E\u0627\u0628\u0632 \u0627\u0644\u0646\u0648\u0631" : `\u0645\u0646\u0634\u0623\u0629 ${slug}`;
  const r = await createTenant(c.env, slug, name, true);
  return okJson(c, { slug, ...r });
});

// packages/server/src/index.ts
var app = new Hono3();
app.use("*", async (c, next) => {
  c.set("requestId", crypto.randomUUID());
  await next();
  try {
    c.res.headers.set("X-Request-Id", c.get("requestId"));
  } catch {
    c.res = new Response(c.res.body, c.res);
    c.res.headers.set("X-Request-Id", c.get("requestId"));
  }
});
app.use("/api/*", secureHeaders({ crossOriginResourcePolicy: "same-origin" }));
app.use("/api/*", async (c, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    const origin = c.req.header("origin");
    const host = c.req.header("x-forwarded-host") ?? c.req.header("host");
    if (origin && host && new URL(origin).host !== host) throw new Fail(403, "FORBIDDEN", "\u0645\u0635\u062F\u0631 \u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062B\u0648\u0642");
    const len = Number(c.req.header("content-length") ?? 0);
    if (len > 512 * 1024) throw new Fail(413, "VALIDATION", "\u062D\u062C\u0645 \u0627\u0644\u0637\u0644\u0628 \u0643\u0628\u064A\u0631");
  }
  c.header("Cache-Control", "no-store");
  await next();
});
app.onError((e, c) => {
  const meta = { requestId: c.get("requestId") ?? "", serverTime: (/* @__PURE__ */ new Date()).toISOString() };
  if (e instanceof Fail) return c.json({ ok: false, error: { code: e.code, message_ar: e.messageAr, details: e.details }, meta }, e.status);
  const msg = String(e);
  if (msg.includes("append-only") || msg.includes("immutable") || msg.includes("REGRESSION")) {
    return c.json({ ok: false, error: { code: "CONFLICT", message_ar: "\u0647\u0630\u0627 \u0627\u0644\u0633\u062C\u0644 \u0645\u062C\u0645\u0651\u062F \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0639\u062F\u064A\u0644\u0647", details: { db: msg.slice(0, 120) } }, meta }, 409);
  }
  console.error("[api]", meta.requestId, msg);
  return c.json({ ok: false, error: { code: "INTERNAL", message_ar: "\u062D\u062F\u062B \u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639 \u2014 \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u0627\u064B", details: {} }, meta }, 500);
});
var lastLockCheck = 0;
app.use("/api/*", async (c, next) => {
  const now = Date.now();
  if (now - lastLockCheck > 6e4) {
    lastLockCheck = now;
    const job = cronLock(c.env).catch((e) => console.error("[lazy-lock]", String(e)));
    try {
      c.executionCtx.waitUntil(job);
    } catch {
      await job;
    }
  }
  await next();
});
var api = new Hono3();
api.get("/health", (c) => c.json({ ok: true }));
api.route("/auth", auth);
api.route("/dev", seed);
api.use("*", async (c, next) => c.req.path.startsWith("/api/v1/auth/") || c.req.path.startsWith("/api/v1/dev/") || c.req.path === "/api/v1/health" ? next() : requireAuth(c, next));
for (const r of [catalog, ordering, production, fulfillment, inventory, admin, reports, notifications]) api.route("/", r);
api.notFound((c) => c.json({ ok: false, error: { code: "NOT_FOUND", message_ar: "\u0627\u0644\u0645\u0633\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" }, meta: { requestId: c.get("requestId"), serverTime: (/* @__PURE__ */ new Date()).toISOString() } }, 404));
app.route("/api/v1", api);
app.route("/m", manifest);
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));
var index_default = {
  fetch: app.fetch,
  async scheduled(_e, env2, ctx) {
    ctx.waitUntil(cronLock(env2));
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
