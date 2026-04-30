// Branching story editor. Loads a book object, lets the user edit scene metadata
// and choices, and emits change events back to the app controller.
window.Editor = (function () {
  let book = null;
  let activeSceneId = null;
  let dirty = false;
  let onChangeCb = null;
  let onSaveRequestCb = null;

  const els = {};

  function init(callbacks) {
    onChangeCb = callbacks.onChange || (() => {});
    onSaveRequestCb = callbacks.onSaveRequest || (() => {});

    els.title = document.getElementById("book-title");
    els.author = document.getElementById("book-author");
    els.cover = document.getElementById("book-cover");
    els.dirtyFlag = document.getElementById("dirty-flag");
    els.sceneListUl = document.getElementById("scene-list-ul");
    els.unreachableHint = document.getElementById("unreachable-hint");
    els.sceneId = document.getElementById("scene-id");
    els.sceneTitle = document.getElementById("scene-title");
    els.sceneText = document.getElementById("scene-text");
    els.sceneStart = document.getElementById("scene-start");
    els.sceneMiniGame = document.getElementById("scene-minigame");
    els.choicesList = document.getElementById("choices-list");

    // Populate mini-game options from registry.
    if (els.sceneMiniGame && window.MiniGames) {
      MiniGames.list().forEach(g => {
        const opt = document.createElement("option");
        opt.value = g.id;
        opt.textContent = `${g.icon || ""} ${g.name}`.trim();
        els.sceneMiniGame.appendChild(opt);
      });
    }

    els.title.addEventListener("input", () => { book.title = els.title.value; markDirty(); });
    els.author.addEventListener("input", () => { book.author = els.author.value; markDirty(); });
    els.cover.addEventListener("change", () => { book.cover = els.cover.value; markDirty(); });

    document.getElementById("add-scene-btn").addEventListener("click", addScene);
    document.getElementById("add-choice-btn").addEventListener("click", addChoice);

    els.sceneId.addEventListener("change", onSceneIdChange);
    els.sceneTitle.addEventListener("input", onSceneFieldInput);
    els.sceneText.addEventListener("input", onSceneFieldInput);
    els.sceneStart.addEventListener("change", onStartToggle);
    if (els.sceneMiniGame) els.sceneMiniGame.addEventListener("change", onMiniGameChange);

    // Ctrl/Cmd+S → request save (only when editor is visible).
    document.addEventListener("keydown", (e) => {
      const editorVisible = !document.getElementById("view-editor").classList.contains("hidden");
      if (!editorVisible) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSaveRequestCb();
      }
    });
  }

  function markDirty() {
    dirty = true;
    if (els.dirtyFlag) els.dirtyFlag.classList.remove("hidden");
    if (onChangeCb) onChangeCb(book);
  }

  function markClean() {
    dirty = false;
    if (els.dirtyFlag) els.dirtyFlag.classList.add("hidden");
  }

  function isDirty() { return dirty; }

  function load(b) {
    book = b;
    if (!book.scenes || Object.keys(book.scenes).length === 0) {
      const sid = "start";
      book.scenes = { [sid]: { id: sid, title: "起始場景", text: "在這裡寫下故事的開頭…", choices: [] } };
      book.startScene = sid;
    }
    activeSceneId = book.startScene && book.scenes[book.startScene] ? book.startScene : Object.keys(book.scenes)[0];
    markClean();
    render();
  }

  function getBook() { return book; }

  function render() {
    els.title.value = book.title || "";
    els.author.value = book.author || "";
    els.cover.value = book.cover || "";
    renderSceneList();
    renderActiveScene();
  }

  function findReachable() {
    const reachable = new Set();
    if (!book.startScene || !book.scenes[book.startScene]) return reachable;
    const queue = [book.startScene];
    while (queue.length) {
      const id = queue.shift();
      if (reachable.has(id)) continue;
      reachable.add(id);
      const s = book.scenes[id];
      if (!s) continue;
      (s.choices || []).forEach(c => {
        if (c.next && book.scenes[c.next] && !reachable.has(c.next)) queue.push(c.next);
      });
    }
    return reachable;
  }

  function renderSceneList() {
    els.sceneListUl.innerHTML = "";
    const reachable = findReachable();
    const ids = Object.keys(book.scenes);
    let unreachableCount = 0;
    ids.forEach((id, idx) => {
      const scene = book.scenes[id];
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.className = "scene-name";
      name.textContent = scene.title || scene.id;
      li.dataset.sceneId = scene.id;
      if (scene.id === activeSceneId) li.classList.add("active");
      if (scene.id === book.startScene) li.classList.add("start");
      const isUnreachable = !reachable.has(scene.id);
      if (isUnreachable) {
        li.classList.add("unreachable");
        unreachableCount++;
      }
      li.addEventListener("click", e => {
        if (e.target.closest("button")) return;
        activeSceneId = scene.id;
        renderSceneList();
        renderActiveScene();
      });
      li.appendChild(name);

      const tools = document.createElement("span");
      tools.className = "scene-tools";

      const up = document.createElement("button");
      up.className = "icon";
      up.title = "上移";
      up.textContent = "▲";
      up.disabled = idx === 0;
      up.addEventListener("click", ev => { ev.stopPropagation(); moveScene(scene.id, -1); });

      const down = document.createElement("button");
      down.className = "icon";
      down.title = "下移";
      down.textContent = "▼";
      down.disabled = idx === ids.length - 1;
      down.addEventListener("click", ev => { ev.stopPropagation(); moveScene(scene.id, +1); });

      tools.append(up, down);

      if (ids.length > 1) {
        const del = document.createElement("button");
        del.className = "icon del";
        del.textContent = "✕";
        del.title = "刪除場景";
        del.addEventListener("click", ev => {
          ev.stopPropagation();
          if (!confirm(`確定刪除場景「${scene.title || scene.id}」？`)) return;
          deleteScene(scene.id);
        });
        tools.appendChild(del);
      }
      li.appendChild(tools);
      els.sceneListUl.appendChild(li);
    });

    if (unreachableCount > 0) {
      els.unreachableHint.classList.remove("hidden");
      els.unreachableHint.textContent = `⚠ 有 ${unreachableCount} 個場景目前無法被起始場景走到，請檢查選項連結。`;
    } else {
      els.unreachableHint.classList.add("hidden");
    }
  }

  function renderActiveScene() {
    const scene = book.scenes[activeSceneId];
    if (!scene) return;
    els.sceneId.value = scene.id;
    els.sceneTitle.value = scene.title || "";
    els.sceneText.value = scene.text || "";
    els.sceneStart.checked = book.startScene === scene.id;
    if (els.sceneMiniGame) els.sceneMiniGame.value = scene.miniGame || "";
    renderChoices(scene);
  }

  function renderChoices(scene) {
    els.choicesList.innerHTML = "";
    const hasMiniGame = !!scene.miniGame;
    (scene.choices || []).forEach((choice, idx) => {
      const row = document.createElement("div");
      row.className = "choice-row";

      const text = document.createElement("input");
      text.type = "text";
      text.placeholder = "選項文字";
      text.value = choice.text || "";
      text.addEventListener("input", () => { choice.text = text.value; markDirty(); });

      const target = document.createElement("select");
      target.innerHTML = `<option value="">— 結局（無下一場景） —</option>` +
        Object.values(book.scenes)
          .map(s => `<option value="${s.id}" ${s.id === choice.next ? "selected" : ""}>${escapeHtml(s.title || s.id)}</option>`)
          .join("");
      target.addEventListener("change", () => { choice.next = target.value || null; markDirty(); renderSceneList(); });

      let outcome = null;
      if (hasMiniGame) {
        outcome = document.createElement("select");
        outcome.className = "outcome-select";
        outcome.title = "依小遊戲結果過濾此選項";
        outcome.innerHTML = `
          <option value="">不限</option>
          <option value="success">僅成功時</option>
          <option value="failure">僅失敗時</option>`;
        outcome.value = choice.outcome || "";
        outcome.addEventListener("change", () => {
          choice.outcome = outcome.value || null;
          markDirty();
        });
      }

      const del = document.createElement("button");
      del.className = "ghost-btn small";
      del.textContent = "刪除";
      del.addEventListener("click", () => {
        scene.choices.splice(idx, 1);
        renderChoices(scene);
        renderSceneList();
        markDirty();
      });

      if (outcome) row.append(text, target, outcome, del);
      else row.append(text, target, del);
      if (outcome) row.classList.add("with-outcome");
      els.choicesList.appendChild(row);
    });
  }

  function onMiniGameChange() {
    const scene = book.scenes[activeSceneId];
    if (!scene) return;
    scene.miniGame = els.sceneMiniGame.value || null;
    renderChoices(scene);
    markDirty();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function onSceneFieldInput() {
    const scene = book.scenes[activeSceneId];
    if (!scene) return;
    scene.title = els.sceneTitle.value;
    scene.text = els.sceneText.value;
    renderSceneList();
    markDirty();
  }

  function onSceneIdChange() {
    const newId = els.sceneId.value.trim();
    if (!newId || newId === activeSceneId) {
      els.sceneId.value = activeSceneId;
      return;
    }
    if (book.scenes[newId]) {
      alert("已有同名場景 ID。");
      els.sceneId.value = activeSceneId;
      return;
    }
    // Rebuild scenes object preserving order while renaming the active one.
    const next = {};
    for (const id of Object.keys(book.scenes)) {
      if (id === activeSceneId) {
        const s = book.scenes[id];
        s.id = newId;
        next[newId] = s;
      } else {
        next[id] = book.scenes[id];
      }
    }
    book.scenes = next;
    Object.values(book.scenes).forEach(s => {
      (s.choices || []).forEach(c => { if (c.next === activeSceneId) c.next = newId; });
    });
    if (book.startScene === activeSceneId) book.startScene = newId;
    activeSceneId = newId;
    render();
    markDirty();
  }

  function onStartToggle() {
    if (els.sceneStart.checked) {
      book.startScene = activeSceneId;
    } else if (book.startScene === activeSceneId) {
      els.sceneStart.checked = true;
      return;
    }
    renderSceneList();
    markDirty();
  }

  function addScene() {
    let i = 1;
    let id;
    do { id = "scene-" + i++; } while (book.scenes[id]);
    book.scenes[id] = { id, title: "新場景", text: "", choices: [] };
    activeSceneId = id;
    render();
    markDirty();
  }

  function addChoice() {
    const scene = book.scenes[activeSceneId];
    if (!scene) return;
    scene.choices = scene.choices || [];
    scene.choices.push({ text: "新選項", next: null });
    renderChoices(scene);
    renderSceneList();
    markDirty();
  }

  function deleteScene(id) {
    const next = {};
    for (const k of Object.keys(book.scenes)) if (k !== id) next[k] = book.scenes[k];
    book.scenes = next;
    Object.values(book.scenes).forEach(s => {
      s.choices = (s.choices || []).filter(c => c.next !== id);
    });
    if (book.startScene === id) {
      book.startScene = Object.keys(book.scenes)[0] || null;
    }
    if (activeSceneId === id) {
      activeSceneId = book.startScene || Object.keys(book.scenes)[0];
    }
    render();
    markDirty();
  }

  function moveScene(id, delta) {
    const ids = Object.keys(book.scenes);
    const idx = ids.indexOf(id);
    const target = idx + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[idx], ids[target]] = [ids[target], ids[idx]];
    const next = {};
    ids.forEach(k => { next[k] = book.scenes[k]; });
    book.scenes = next;
    renderSceneList();
    markDirty();
  }

  return { init, load, getBook, isDirty, markClean };
})();
