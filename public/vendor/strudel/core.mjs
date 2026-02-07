export * from "./web.mjs";
const _logKey = "strudel.log";
let _lastMsg, _lastTime, _throttle = 1000;
export function logger(msg, type, data = {}) {
  const now = performance.now();
  if (_lastMsg === msg && now - _lastTime < _throttle) return;
  _lastMsg = msg; _lastTime = now;
  console.log("%c" + msg, "background-color:black;color:white;border-radius:15px");
  if (typeof document !== "undefined" && typeof CustomEvent !== "undefined")
    document.dispatchEvent(new CustomEvent(_logKey, { detail: { message: msg, type, data } }));
}
export function errorLogger(err, context = "cyclist") {
  logger("[" + context + "] error: " + err.message, "error");
}
