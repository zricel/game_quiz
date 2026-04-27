// Main controller: wires auth, library, editor, and player together.
(function () {
  const views = {
    login: document.getElementById("view-login"),
    library: document.getElementById("view-library"),
    editor: document.getElementById("view-editor"),
    player: document.getElementById("view-player")
  };
  const nav = document.getElementById("nav");
  let editingBookId = null;

  function showView(name) {
    Object.entries(views).forEach(([k, el]) => {
      el.classList.toggle("hidden", k !== name);
    });
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === name);
    });
  }

  function ensureUserOrLogin() {
    const user = Auth.getUser();
    if (!user) {
      nav.classList.add("hidden");
      showView("login");
      return null;
    }
    nav.classList.remove("hidden");
    document.getElementById("user-name").textContent = user.name;
    const avatar = document.getElementById("user-avatar");
    if (user.picture) {
      avatar.src = user.picture;
      avatar.style.display = "";
    } else {
      avatar.removeAttribute("src");
      avatar.style.display = "none";
    }
    return user;
  }

  function renderLibrary() {
    const user = ensureUserOrLogin();
    if (!user) return;
    const books = Storage.loadBooks(user.id);
    const list = document.getElementById("library-list");
    list.innerHTML = "";
    if (books.length === 0) {
      list.innerHTML = `<p style="color: var(--muted);">你還沒有任何故事，可以從下方版型開始建立。</p>`;
    }
    books.forEach(book => list.appendChild(renderBookCard(book, false)));

    const tplList = document.getElementById("template-list");
    tplList.innerHTML = "";
    STORY_TEMPLATES.forEach(tpl => tplList.appendChild(renderBookCard(tpl, true)));
  }

  function renderBookCard(book, isTemplate) {
    const card = document.createElement("div");
    card.className = "card";
    const cover = document.createElement("div");
    cover.className = "cover " + (book.cover || "");
    cover.textContent = isTemplate ? "📚" : "✒️";
    const h = document.createElement("h3");
    h.textContent = book.title || "（未命名）";
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = (book.author ? book.author + " · " : "") +
      Object.keys(book.scenes || {}).length + " 個場景";
    const actions = document.createElement("div");
    actions.className = "actions";

    if (isTemplate) {
      const useBtn = document.createElement("button");
      useBtn.className = "primary-btn";
      useBtn.textContent = "套用版型";
      useBtn.addEventListener("click", () => useTemplate(book));
      const previewBtn = document.createElement("button");
      previewBtn.className = "ghost-btn";
      previewBtn.textContent = "試玩";
      previewBtn.addEventListener("click", () => playBook(book));
      actions.append(previewBtn, useBtn);
    } else {
      const editBtn = document.createElement("button");
      editBtn.className = "primary-btn";
      editBtn.textContent = "編輯";
      editBtn.addEventListener("click", () => openEditor(book.id));
      const playBtn = document.createElement("button");
      playBtn.className = "ghost-btn";
      playBtn.textContent = "試玩";
      playBtn.addEventListener("click", () => playBook(book));
      actions.append(playBtn, editBtn);
    }

    card.append(cover, h, meta, actions);
    return card;
  }

  function useTemplate(tpl) {
    const user = ensureUserOrLogin();
    if (!user) return;
    const copy = Storage.cloneTemplate(tpl);
    Storage.upsertBook(user.id, copy);
    openEditor(copy.id);
  }

  function newBlankBook() {
    const user = ensureUserOrLogin();
    if (!user) return;
    const id = Storage.newBookId();
    const book = {
      id,
      title: "未命名故事",
      author: user.name,
      cover: "",
      startScene: "start",
      scenes: {
        start: {
          id: "start",
          title: "起始場景",
          text: "在這裡寫下故事的開頭…",
          choices: []
        }
      }
    };
    Storage.upsertBook(user.id, book);
    openEditor(id);
  }

  function openEditor(bookId) {
    const user = ensureUserOrLogin();
    if (!user) return;
    const book = Storage.getBook(user.id, bookId);
    if (!book) {
      alert("找不到這本書。");
      return;
    }
    editingBookId = bookId;
    Editor.load(book);
    showView("editor");
  }

  function playBook(book) {
    Player.load(book);
    showView("player");
  }

  function attach() {
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        if (view === "library") {
          renderLibrary();
          showView("library");
        } else if (view === "editor") {
          newBlankBook();
        }
      });
    });

    document.getElementById("signout-btn").addEventListener("click", () => {
      Auth.signOut();
    });

    document.getElementById("demo-login").addEventListener("click", () => {
      Auth.loginAsDemo();
    });

    document.getElementById("new-from-template-btn").addEventListener("click", () => {
      // Scroll to template list.
      document.getElementById("template-list").scrollIntoView({ behavior: "smooth" });
    });

    // Editor toolbar buttons.
    document.getElementById("save-btn").addEventListener("click", () => {
      const user = ensureUserOrLogin();
      if (!user) return;
      const book = Editor.getBook();
      Storage.upsertBook(user.id, book);
      flashSaved();
    });
    document.getElementById("play-btn").addEventListener("click", () => {
      const book = Editor.getBook();
      playBook(book);
    });
    document.getElementById("delete-book-btn").addEventListener("click", () => {
      const user = ensureUserOrLogin();
      if (!user || !editingBookId) return;
      if (!confirm("確定刪除這本書？此動作無法復原。")) return;
      Storage.deleteBook(user.id, editingBookId);
      editingBookId = null;
      renderLibrary();
      showView("library");
    });

    document.getElementById("exit-player-btn").addEventListener("click", () => {
      if (editingBookId) {
        showView("editor");
      } else {
        renderLibrary();
        showView("library");
      }
    });
  }

  function flashSaved() {
    const btn = document.getElementById("save-btn");
    const original = btn.textContent;
    btn.textContent = "✓ 已儲存";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 1200);
  }

  Editor.init({
    onChange: (book) => {
      // Auto-save on change is too noisy; rely on save button instead. We just
      // keep the in-memory book up to date here.
    }
  });
  Player.init();
  attach();

  Auth.onChange((user) => {
    if (user) {
      renderLibrary();
      showView("library");
    } else {
      editingBookId = null;
      ensureUserOrLogin();
    }
  });

  Auth.restore();
  ensureUserOrLogin();
})();
