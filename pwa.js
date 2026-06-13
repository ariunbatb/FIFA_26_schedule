/* PWA bootstrap: registers the service worker and shows an
 * "Add to home screen" button. Shared by every page. */
(function () {
  "use strict";

  // ---- 1. Register the service worker ----------------------------------
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {/* offline-first is best-effort */});
    });
  }

  // ---- 2. Install button -----------------------------------------------
  var STORE_KEY = "fifa26_install_dismissed";
  if (localStorage.getItem(STORE_KEY) === "1") return;

  // Already installed? Don't prompt.
  var standalone = window.matchMedia("(display-mode: standalone)").matches ||
                   window.navigator.standalone === true;
  if (standalone) return;

  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
              !window.MSStream;
  var deferredPrompt = null;

  function injectStyles() {
    if (document.getElementById("pwa-install-style")) return;
    var s = document.createElement("style");
    s.id = "pwa-install-style";
    s.textContent =
      "#pwaInstall{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);" +
      "z-index:9999;display:flex;align-items:center;gap:10px;max-width:92vw;" +
      "padding:11px 16px;border-radius:99px;border:0;cursor:pointer;" +
      "font:700 .86rem 'Segoe UI',system-ui,sans-serif;color:#fff;" +
      "background:#0b6b41;box-shadow:0 6px 22px -6px rgba(0,0,0,.5);" +
      "animation:pwaIn .35s ease both;}" +
      "#pwaInstall:hover{background:#084f31;}" +
      "#pwaInstall .pwa-x{margin-left:2px;opacity:.85;font-weight:700;" +
      "font-size:1.05rem;line-height:1;padding:0 2px;}" +
      "#pwaInstall .pwa-x:hover{opacity:1;}" +
      "@keyframes pwaIn{from{opacity:0;transform:translate(-50%,14px);}" +
      "to{opacity:1;transform:translate(-50%,0);}}" +
      "@media(max-width:560px){.tabbar~#pwaInstall,#pwaInstall{bottom:74px;}}" +
      ".pwa-ios-sheet{position:fixed;inset:0;z-index:10000;display:flex;" +
      "align-items:flex-end;justify-content:center;background:rgba(8,16,12,.55);}" +
      ".pwa-ios-card{background:#fff;color:#15241c;border-radius:16px 16px 0 0;" +
      "width:100%;max-width:460px;padding:20px 22px 28px;" +
      "font:400 .92rem 'Segoe UI',system-ui,sans-serif;animation:pwaIn .3s ease both;}" +
      "html.dark .pwa-ios-card{background:#16201a;color:#e7ede8;}" +
      ".pwa-ios-card h3{font-size:1.05rem;margin:0 0 10px;}" +
      ".pwa-ios-card ol{margin:0;padding-left:20px;line-height:1.7;}" +
      ".pwa-ios-card b{color:#0b6b41;}" +
      ".pwa-ios-card button{margin-top:16px;width:100%;padding:11px;border:0;" +
      "border-radius:10px;background:#0b6b41;color:#fff;font-weight:700;cursor:pointer;}";
    document.head.appendChild(s);
  }

  function dismiss() {
    localStorage.setItem(STORE_KEY, "1");
    var b = document.getElementById("pwaInstall");
    if (b) b.remove();
  }

  function showButton(onClick) {
    if (document.getElementById("pwaInstall")) return;
    injectStyles();
    var btn = document.createElement("button");
    btn.id = "pwaInstall";
    btn.type = "button";
    btn.innerHTML = "<span>📲 Апп болгож суулгах</span>" +
                    "<span class='pwa-x' title='Хаах'>✕</span>";
    btn.addEventListener("click", function (e) {
      if (e.target.classList.contains("pwa-x")) { dismiss(); return; }
      onClick();
    });
    document.body.appendChild(btn);
  }

  function showIOSSheet() {
    injectStyles();
    var sheet = document.createElement("div");
    sheet.className = "pwa-ios-sheet";
    sheet.innerHTML =
      "<div class='pwa-ios-card'>" +
      "<h3>📲 Нүүр дэлгэцэд нэмэх</h3>" +
      "<ol><li>Доорх <b>Хуваалцах</b> ⎙ товчийг дарна</li>" +
      "<li><b>“Нүүр дэлгэцэд нэмэх”</b> сонголтыг дарна</li>" +
      "<li><b>“Нэмэх”</b> дарж баталгаажуулна</li></ol>" +
      "<button type='button'>Ойлголоо</button></div>";
    sheet.addEventListener("click", function (e) {
      if (e.target === sheet || e.target.tagName === "BUTTON") sheet.remove();
    });
    document.body.appendChild(sheet);
  }

  // Android / desktop Chromium: capture the native prompt.
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showButton(function () {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        dismiss();
      });
    });
  });

  window.addEventListener("appinstalled", dismiss);

  // iOS Safari: no beforeinstallprompt — show manual instructions.
  if (isIOS) {
    window.addEventListener("load", function () {
      setTimeout(function () { showButton(showIOSSheet); }, 1500);
    });
  }
})();
