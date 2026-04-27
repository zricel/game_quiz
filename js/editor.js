// Branching story editor. Loads a book object, lets the user edit scene metadata
// and choices, and emits save events back to the app controller.
window.Editor = (function () {
  let book = null;
  let activeSceneId = null;
  let onChangeCb = null;

  const els = {};

  function init(callbacks) {
    onChangeCb = callbacks.onChange || (() => {});
    els.title = document.getElementById("book-title");
    els.author = document.getElementById("book-author");
    els.sceneListUl = document.getElementById("scene-list-ul");
    els.sceneId = document.getElementById("scene-id");
    els.sceneTitle = document.getElementById("scene-title");
    els.sceneText = document.getElementById("scene-text");
    els.sceneStart = document.getElementById("scene-start");
    els.choicesList = document.getElementById("choices-list");

    els.title.addEventListener("input", () => { book.title = els.title.value; markDirty(); });
    els.author.addEventListener("input", () => { book.author = els.author.value; markDirty(); });

    document.getElementById("add-scene-btn").addEventListener("click", addScene);
    document.getElementById("add-choice-btn").addEventListener("click", addChoice);

    els.sceneId.addEventListener("change", onSceneIdChange);
    els.sceneTitle.addEventListener("input", onSceneFieldInput);
    els.sceneText.addEventListener("input", onSceneFieldInput);
    els.sceneStart.addEventListener("change", onStartToggle);
  }

  function markDirty() {
    if (onChangeCb) onChangeCb(book);
  }

  function load(b) {
    book = b;
    if (!book.scenes || Object.keys(book.scenes).length === 0) {
      const sid = "start";
      book.scenes = { [sid]: { id: sid, title: "起始場景", text: "在這裡寫下故事的開頭…", choices: [] } };
      book.startScene = sid;
    }
    activeSceneId = book.startScene && book.scenes[book.startScene] ? book.startScene : Object.keys(book.scenes)[0];
    render();
  }

  function getBook() { return book; }

  function render() {
    els.title.value = book.title || "";
    els.author.value = book.author || "";
    renderSceneList();
    renderActiveScene();
  }

  function renderSceneList() {
    els.sceneListUl.innerHTML = "";
    Object.values(book.scenes).forEach(scene => {
      const li = document.createElement("li");
      li.textContent = scene.title || scene.id;
      li.dataset.sceneId = scene.id;
      if (scene.id === activeSceneId) li.classList.add("active");
      if (scene.id === book.startScene) li.classList.add("start");
      li.addEventListener("click", e => {
        if (e.target.classList.contains("del")) return;
        activeSceneId = scene.id;
        renderSceneList();
        renderActiveScene();
      });

      if (Object.keys(book.scenes).length > 1) {
        const del = document.createElement("button");
        del.className = "del";
        del.textContent = "✕";
        del.title = "刪除場景";
        del.addEventListener("click", ev => {
          ev.stopPropagation();
          if (!confirm(`確定刪除場景「${scene.title || scene.id}」？`)) return;
          deleteScene(scene.id);
        });
        li.appendChild(del);
      }
      els.sceneListUl.appendChild(li);
    });
  }

  function renderActiveScene() {
    const scene = book.scenes[activeSceneId];
    if (!scene) return;
    els.sceneId.value = scene.id;
    els.sceneTitle.value = scene.title || "";
    els.sceneText.value = scene.text || "";
    els.sceneStart.checked = book.startScene === scene.id;
    renderChoices(scene);
  }

  function renderChoices(scene) {
    els.choicesList.innerHTML = "";
    (scene.choices || []).forEach((choice, idx) => {
      const row = document.createElement("div");
      row.className = "choice-row";

      const text = document.createElement("input");
      text.type = "text";
      text.placeholder = "選項文字";
      text.value = choice.text || "";
      text.addEventListener("input", () => { choice.text = text.value; markDirty(); });

      const target = document.createElement("select");
      target.innerHTML = `<option value="">— 選擇下一場景（留空 = 結局） —</option>` +
        Object.values(book.scenes)
          .map(s => `<option value="${s.id}" ${s.id === choice.next ? "selected" : ""}>${s.title || s.id}</option>`)
          .join("");
      target.addEventListener("change", () => { choice.next = target.value || null; markDirty(); });

      const del = document.createElement("button");
      del.className = "ghost-btn small";
      del.textContent = "刪除";
      del.addEventListener("click", () => {
        scene.choices.splice(idx, 1);
        renderChoices(scene);
        markDirty();
      });

      row.append(text, target, del);
      els.choicesList.appendChild(row);
    });
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
    const scene = book.scenes[activeSceneId];
    delete book.scenes[activeSceneId];
    scene.id = newId;
    book.scenes[newId] = scene;
    // Re-point any choices targeting the old id.
    Object.values(book.scenes).forEach(s => {
      (s.choices || []).forEach(c => {
        if (c.next === activeSceneId) c.next = newId;
      });
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
      // Need at least one start scene; revert.
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
    markDirty();
  }

  function deleteScene(id) {
    delete book.scenes[id];
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

  return { init, load, getBook };
})();
