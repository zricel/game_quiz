// Story player. Walks the user through scenes, optionally running a mini-game
// at the start of a scene before showing its choices.
window.Player = (function () {
  let book = null;
  let currentId = null;
  let lastResult = null;        // result of the most recent mini-game, if any
  let isFirstScene = true;      // skip auto-inject on the very first scene

  // Auto-injection of random mini-games. "off" | "sometimes" | "often"
  let injectMode = (function () {
    try { return localStorage.getItem("sgb:injectMode") || "off"; }
    catch (e) { return "off"; }
  })();

  const INJECT_RATE = { off: 0, sometimes: 0.33, often: 0.66 };

  const els = {};

  function init() {
    els.title = document.getElementById("player-title");
    els.sceneTitle = document.getElementById("player-scene-title");
    els.sceneText = document.getElementById("player-scene-text");
    els.choices = document.getElementById("player-choices");
    els.end = document.getElementById("player-end");
    els.minigame = document.getElementById("player-minigame");
    els.injectSelect = document.getElementById("inject-mode");
    if (els.injectSelect) {
      els.injectSelect.value = injectMode;
      els.injectSelect.addEventListener("change", () => {
        injectMode = els.injectSelect.value;
        try { localStorage.setItem("sgb:injectMode", injectMode); } catch (e) {}
      });
    }
    document.getElementById("restart-btn").addEventListener("click", restart);
  }

  function load(b) {
    book = b;
    els.title.textContent = book.title || "未命名故事";
    restart();
  }

  function restart() {
    currentId = book.startScene;
    if (!currentId || !book.scenes[currentId]) {
      currentId = Object.keys(book.scenes)[0];
    }
    isFirstScene = true;
    lastResult = null;
    renderScene();
  }

  function pickMiniGameForScene(scene) {
    if (scene.miniGame && scene.miniGame !== "none") {
      return MiniGames.pickByName(scene.miniGame);
    }
    if (!isFirstScene && injectMode !== "off") {
      const rate = INJECT_RATE[injectMode] || 0;
      if (Math.random() < rate) return MiniGames.random();
    }
    return null;
  }

  function renderScene() {
    const scene = book.scenes[currentId];
    if (!scene) {
      els.sceneTitle.textContent = "（場景遺失）";
      els.sceneText.textContent = "";
      els.choices.innerHTML = "";
      hideMiniGame();
      els.end.classList.remove("hidden");
      return;
    }
    els.sceneTitle.textContent = scene.title || "";
    els.sceneText.textContent = scene.text || "";
    els.choices.innerHTML = "";
    els.end.classList.add("hidden");
    hideMiniGame();

    const game = pickMiniGameForScene(scene);
    if (game) {
      runMiniGame(game).then(result => {
        lastResult = result;
        showResultBanner(game, result);
        showChoices(scene);
      });
    } else {
      showChoices(scene);
    }
    isFirstScene = false;
  }

  function runMiniGame(game) {
    if (!els.minigame) return Promise.resolve(null);
    els.minigame.classList.remove("hidden");
    els.minigame.innerHTML = "";
    const head = document.createElement("div");
    head.className = "mg-head";
    head.innerHTML = `<span class="mg-icon">${game.icon || "🎮"}</span> <strong>${escapeHtml(game.name)}</strong> <span class="mg-desc">— ${escapeHtml(game.description || "")}</span>`;
    const body = document.createElement("div");
    body.className = "mg-body";
    els.minigame.append(head, body);
    return game.play(body);
  }

  function showResultBanner(game, result) {
    if (!result) return;
    const banner = document.createElement("div");
    banner.className = "mg-result " + (result.success ? "ok" : "bad");
    banner.textContent = `${game.icon || "🎮"} ${game.name}：${result.message}`;
    els.minigame.appendChild(banner);
  }

  function hideMiniGame() {
    if (!els.minigame) return;
    els.minigame.classList.add("hidden");
    els.minigame.innerHTML = "";
  }

  function showChoices(scene) {
    const all = (scene.choices || []).filter(c => c && c.text);
    // Filter by outcome gate if the scene has a mini-game and any choice
    // declares an "outcome" requirement. Choices without a requirement always show.
    const filtered = all.filter(c => {
      if (!c.outcome || c.outcome === "any") return true;
      if (!lastResult) return true;
      return c.outcome === (lastResult.success ? "success" : "failure");
    });
    const list = filtered.length > 0 ? filtered : all;
    if (list.length === 0) {
      els.end.classList.remove("hidden");
      return;
    }
    list.forEach(choice => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      if (choice.outcome === "success") btn.classList.add("outcome-success");
      if (choice.outcome === "failure") btn.classList.add("outcome-failure");
      btn.textContent = choice.text;
      btn.addEventListener("click", () => {
        if (choice.next && book.scenes[choice.next]) {
          currentId = choice.next;
          renderScene();
        } else {
          els.choices.innerHTML = "";
          els.end.classList.remove("hidden");
        }
      });
      els.choices.appendChild(btn);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  return { init, load };
})();
