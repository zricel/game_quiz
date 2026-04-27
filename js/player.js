// Story player. Walks the user through scenes following their choices.
window.Player = (function () {
  let book = null;
  let currentId = null;

  const els = {};

  function init() {
    els.title = document.getElementById("player-title");
    els.sceneTitle = document.getElementById("player-scene-title");
    els.sceneText = document.getElementById("player-scene-text");
    els.choices = document.getElementById("player-choices");
    els.end = document.getElementById("player-end");
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
    renderScene();
  }

  function renderScene() {
    const scene = book.scenes[currentId];
    if (!scene) {
      els.sceneTitle.textContent = "（場景遺失）";
      els.sceneText.textContent = "";
      els.choices.innerHTML = "";
      els.end.classList.remove("hidden");
      return;
    }
    els.sceneTitle.textContent = scene.title || "";
    els.sceneText.textContent = scene.text || "";
    els.choices.innerHTML = "";

    const valid = (scene.choices || []).filter(c => c && c.text);
    if (valid.length === 0) {
      els.end.classList.remove("hidden");
      return;
    }
    els.end.classList.add("hidden");
    valid.forEach(choice => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
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

  return { init, load };
})();
