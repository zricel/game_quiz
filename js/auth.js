// Google Identity Services-based sign-in. The sign-in button is rendered via
// the `g_id_signin` div in index.html; once Google calls back with a credential
// (a JWT), we decode the payload locally to get user info. For production you
// would verify the JWT signature on a server. We also support a demo mode that
// skips Google entirely for local testing.
window.Auth = (function () {
  let currentUser = null;
  const listeners = [];

  function decodeJwt(token) {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT");
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "===".slice((payload.length + 3) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  }

  function setUser(user) {
    currentUser = user;
    if (user) {
      sessionStorage.setItem("sgb:user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("sgb:user");
    }
    listeners.forEach(fn => {
      try { fn(user); } catch (e) { console.error(e); }
    });
  }

  function onChange(fn) {
    listeners.push(fn);
    if (currentUser) fn(currentUser);
  }

  function getUser() {
    return currentUser;
  }

  function restore() {
    try {
      const raw = sessionStorage.getItem("sgb:user");
      if (raw) {
        setUser(JSON.parse(raw));
        return currentUser;
      }
    } catch (e) {
      console.warn(e);
    }
    return null;
  }

  function signOut() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try { window.google.accounts.id.disableAutoSelect(); } catch (e) {}
    }
    setUser(null);
  }

  function loginAsDemo() {
    setUser({
      id: "demo-user",
      name: "體驗使用者",
      email: "demo@local",
      picture: "",
      demo: true
    });
  }

  // Called by Google Identity Services via the data-callback attribute.
  window.handleCredentialResponse = function (response) {
    try {
      const payload = decodeJwt(response.credential);
      setUser({
        id: payload.sub,
        name: payload.name || payload.email || "使用者",
        email: payload.email || "",
        picture: payload.picture || "",
        demo: false
      });
    } catch (e) {
      alert("登入失敗：" + e.message);
    }
  };

  return { onChange, getUser, restore, signOut, loginAsDemo };
})();
