/*
 * alaqai shared frontend client.
 * Include this on every page: <script src="/assets/js/api.js"></script>
 *
 * Configure the deployed backend URL by defining window.ALAQAI_API_BASE
 * BEFORE this script loads (e.g. in a small inline <script> tag), otherwise
 * it falls back to same-origin "/api" (works if you reverse-proxy the API
 * under your site's domain) or the placeholder below.
 */
(function (global) {
  "use strict";

  const DEFAULT_API_BASE = "https://api.alaqai.online";
  const API_BASE = (global.ALAQAI_API_BASE || DEFAULT_API_BASE).replace(/\/$/, "");
  const GOOGLE_CLIENT_ID = global.ALAQAI_GOOGLE_CLIENT_ID || "";

  let cachedUser = undefined; // undefined = not fetched yet, null = signed out
  const authListeners = [];

  async function api(path, opts) {
    opts = opts || {};
    const res = await fetch(API_BASE + path, {
      method: opts.method || "GET",
      credentials: "include",
      headers: Object.assign(
        opts.body !== undefined ? { "Content-Type": "application/json" } : {},
        opts.headers || {}
      ),
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* empty body */ }
    if (!res.ok) {
      const err = new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function onAuthChange(fn) {
    authListeners.push(fn);
    if (cachedUser !== undefined) fn(cachedUser);
  }
  function emitAuth(user) {
    cachedUser = user;
    authListeners.forEach((fn) => { try { fn(user); } catch (e) { console.error(e); } });
  }

  async function fetchMe() {
    try {
      const { user } = await api("/api/auth/me");
      emitAuth(user || null);
      return user || null;
    } catch (e) {
      emitAuth(null);
      return null;
    }
  }

  function getCachedUser() { return cachedUser || null; }

  async function loginWithGoogleCredential(credential) {
    const { user } = await api("/api/auth/google", { method: "POST", body: { credential } });
    emitAuth(user);
    return user;
  }

  async function logout() {
    try { await api("/api/auth/logout", { method: "POST" }); } catch (e) { /* ignore */ }
    emitAuth(null);
  }

  // Renders a Google Identity Services sign-in button into `el` (a DOM node
  // or element id). Safe to call multiple times for multiple buttons on one
  // page (nav bar + hero, etc). No-ops quietly if GSI script hasn't loaded.
  let gsiInitialized = false;
  function renderGoogleButton(el, opts) {
    const node = typeof el === "string" ? document.getElementById(el) : el;
    if (!node) return;
    if (!GOOGLE_CLIENT_ID) {
      node.innerHTML = '<span style="font-size:11px;color:#999;">Google Client ID орнатылмаған</span>';
      return;
    }
    function draw() {
      if (!global.google || !global.google.accounts || !global.google.accounts.id) {
        return setTimeout(draw, 150);
      }
      if (!gsiInitialized) {
        global.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            try {
              const user = await loginWithGoogleCredential(resp.credential);
              if (opts && typeof opts.onSignIn === "function") opts.onSignIn(user);
            } catch (e) {
              console.error("Google sign-in failed", e);
              if (opts && typeof opts.onError === "function") opts.onError(e);
            }
          },
          auto_select: false,
        });
        gsiInitialized = true;
      }
      global.google.accounts.id.renderButton(
        node,
        Object.assign({ theme: "outline", size: "medium", shape: "pill", text: "continue_with" }, opts && opts.buttonConfig)
      );
    }
    draw();
  }

  // Simple helper: run `fn` if signed in; otherwise nudge the user toward the
  // nearest Google button / login page. Used by AI-gated actions.
  function requireLogin(promptSelector) {
    if (getCachedUser()) return true;
    const el = promptSelector && document.querySelector(promptSelector);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("alaqai-pulse"); }
    return false;
  }

  global.Alaqai = {
    API_BASE,
    api,
    onAuthChange,
    fetchMe,
    getCachedUser,
    loginWithGoogleCredential,
    logout,
    renderGoogleButton,
    requireLogin,
  };

  // Kick off an initial /api/auth/me check as soon as the client loads.
  fetchMe();
})(window);
