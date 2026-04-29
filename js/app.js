// Main controller: wires auth, library, editor, and player together.
(function () {
  const views = {
    login: document.getElementById("view-login"),
    library: document.getElementById("view-library"),
    editor: document.getElementById("view-editor"),
    player: document.getElementById("view-player")
  };
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("nav-toggle");
  const importFileInput = document.getElementById("import-file");
  const modalNewBook = document.getElementById("modal-newbook");
  const toastEl = document.getElementById("toast");

  let editingBookId = null;
  let librarySearch = "";
  let cameToPlayerFromEditor = false;

  function applyClientIdState() {
    const ok = Auth.isClientIdConfigured();
    const googleBlock = document.getElementById("login-google-block");
    const divider = document.getElementById("login-divider");
    const warn = document.getElementById("setup-warning");
    if (!ok) {
      if (googleBlock) googleBlock.classList.add("hidden");
      if (divider) divider.classList.add("hidden");
      if (warn) warn.classList.remove("hidden");
    } else {
      if (googleBlock) googleBlock.classList.remove("hidden");
      if (divider) divider.classList.remove("hidden");
      if (warn) warn.classList.add("hidden");
    }
  }

  function showView(name) {
    Object.entries(views).forEach(([k, el]) => {
      el.classList.toggle("hidden", k !== name);
    });
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === name);
    });
    nav.classList.remove("open");
  }

  function ensureUserOrLogin() {
    const user = Auth.getUser();
    if (!user) {
      nav.classList.add("hidden");
      navToggle.classList.add("hidden");
      showView("login");
      return null;
    }
    nav.classList.remove("hidden");
    navToggle.classList.remove("hidden");
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

  function formatDate(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function renderLibrary() {
    const user = ensureUserOrLogin();
    if (!user) return;
    const all = Storage.loadBooks(user.id);
    const q = librarySearch.trim().toLowerCase();
    const books = q
      ? all.filter(b =>
          (b.title || "").toLowerCase().includes(q) ||
          (b.author || "").toLowerCase().includes(q))
      : all;
    const list = document.getElementById("library-list");
    list.innerHTML = "";
    if (all.length === 0) {
      list.innerHTML = `<p class="empty">你還沒有任何故事，可以從上方按鈕「建立新書」，或從下方版型開始。</p>`;
    } else if (books.length === 0) {
      list.innerHTML = `<p class="empty">沒有符合「${escapeHtml(q)}」的書。</p>`;
    } else {
      books.forEach(book => list.appendChild(renderBookCard(book, false)));
    }

    const tplList = document.getElementById("template-list");
    tplList.innerHTML = "";
    STORY_TEMPLATES.forEach(tpl => tplList.appendChild(renderBookCard(tpl, true)));
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
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
    const sceneCount = Object.keys(book.scenes || {}).length;
    const parts = [];
    if (book.author) parts.push(book.author);
    parts.push(sceneCount + " 個場景");
    if (!isTemplate && book.updatedAt) parts.push("更新於 " + formatDate(book.updatedAt));
    meta.textContent = parts.join(" · ");
    const actions = document.createElement("div");
    actions.className = "actions";

    if (isTemplate) {
      const previewBtn = document.createElement("button");
      previewBtn.className = "ghost-btn";
      previewBtn.textContent = "試玩";
      previewBtn.addEventListener("click", () => playBook(book));
      const useBtn = document.createElement("button");
      useBtn.className = "primary-btn";
      useBtn.textContent = "套用版型";
      useBtn.addEventListener("click", () => useTemplate(book));
      actions.append(previewBtn, useBtn);
    } else {
      const playBtn = document.createElement("button");
      playBtn.className = "ghost-btn";
      playBtn.textContent = "試玩";
      playBtn.addEventListener("click", () => playBook(book));

      const editBtn = document.createElement("button");
      editBtn.className = "primary-btn";
      editBtn.textContent = "編輯";
      editBtn.addEventListener("click", () => openEditor(book.id));

      const moreBtn = document.createElement("button");
      moreBtn.className = "ghost-btn";
      moreBtn.textContent = "⋯";
      moreBtn.title = "更多";
      moreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showCardMenu(moreBtn, book);
      });
      actions.append(playBtn, editBtn, moreBtn);
    }
    card.append(cover, h, meta, actions);
    return card;
  }

  function showCardMenu(anchor, book) {
    closeCardMenu();
    const menu = document.createElement("div");
    menu.className = "popup-menu";
    menu.id = "card-menu";
    const items = [
      { label: "📋 複製", run: () => duplicateBook(book) },
      { label: "⤓ 匯出 JSON", run: () => exportBook(book) },
      { label: "🗑 刪除", run: () => deleteBookFromLibrary(book), danger: true }
    ];
    items.forEach(it => {
      const b = document.createElement("button");
      b.textContent = it.label;
      if (it.danger) b.classList.add("danger");
      b.addEventListener("click", () => { closeCardMenu(); it.run(); });
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
    const rect = anchor.getBoundingClientRect();
    menu.style.top = (window.scrollY + rect.bottom + 4) + "px";
    menu.style.left = (window.scrollX + rect.right - menu.offsetWidth) + "px";
    setTimeout(() => document.addEventListener("click", closeCardMenu, { once: true }), 0);
  }
  function closeCardMenu() {
    const m = document.getElementById("card-menu");
    if (m) m.remove();
  }

  function duplicateBook(book) {
    const user = ensureUserOrLogin();
    if (!user) return;
    Storage.duplicateBook(user.id, book.id);
    renderLibrary();
    toast("已複製為新書");
  }

  function deleteBookFromLibrary(book) {
    const user = ensureUserOrLogin();
    if (!user) return;
    if (!confirm(`確定刪除「${book.title || "未命名"}」？此動作無法復原。`)) return;
    Storage.deleteBook(user.id, book.id);
    renderLibrary();
    toast("已刪除");
  }

  function exportBook(book) {
    const json = Storage.exportBook(book);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (book.title || "book").replace(/[\\/:*?"<>|]/g, "_") + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function triggerImport() {
    importFileInput.value = "";
    importFileInput.click();
  }

  function handleImportFile(file) {
    const user = ensureUserOrLogin();
    if (!user || !file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const book = Storage.importFromJson(user.id, String(reader.result || ""));
        renderLibrary();
        showView("library");
        toast(`已匯入「${book.title}」`);
      } catch (e) {
        alert(e.message);
      }
    };
    reader.readAsText(file);
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
        start: { id: "start", title: "起始場景", text: "在這裡寫下故事的開頭…", choices: [] }
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
    if (Editor.isDirty() && editingBookId && editingBookId !== bookId) {
      if (!confirm("目前的編輯尚未儲存，確定要離開？")) return;
    }
    editingBookId = bookId;
    Editor.load(book);
    showView("editor");
  }

  function playBook(book) {
    cameToPlayerFromEditor = !document.getElementById("view-editor").classList.contains("hidden");
    Player.load(book);
    showView("player");
  }

  function openNewBookModal() {
    modalNewBook.classList.remove("hidden");
  }
  function closeNewBookModal() {
    modalNewBook.classList.add("hidden");
  }

  function saveCurrentBook() {
    const user = ensureUserOrLogin();
    if (!user) return false;
    const book = Editor.getBook();
    if (!book) return false;
    Storage.upsertBook(user.id, book);
    Editor.markClean();
    flashSaved();
    return true;
  }

  function attach() {
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        if (view === "library") {
          renderLibrary();
          showView("library");
        } else if (view === "new") {
          openNewBookModal();
        }
      });
    });

    navToggle.addEventListener("click", () => nav.classList.toggle("open"));

    document.getElementById("signout-btn").addEventListener("click", () => {
      if (Editor.isDirty() && !confirm("目前的編輯尚未儲存，確定要登出？")) return;
      Auth.signOut();
    });
    document.getElementById("demo-login").addEventListener("click", () => Auth.loginAsDemo());

    document.getElementById("library-search").addEventListener("input", (e) => {
      librarySearch = e.target.value;
      renderLibrary();
    });

    document.getElementById("new-book-btn").addEventListener("click", openNewBookModal);

    // New-book modal actions.
    document.getElementById("newbook-blank").addEventListener("click", () => { closeNewBookModal(); newBlankBook(); });
    document.getElementById("newbook-template").addEventListener("click", () => {
      closeNewBookModal();
      renderLibrary();
      showView("library");
      const target = document.getElementById("template-list");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.getElementById("newbook-import").addEventListener("click", () => { closeNewBookModal(); triggerImport(); });
    document.getElementById("newbook-cancel").addEventListener("click", closeNewBookModal);
    modalNewBook.addEventListener("click", (e) => { if (e.target === modalNewBook) closeNewBookModal(); });

    // Top nav import.
    document.getElementById("import-btn").addEventListener("click", triggerImport);
    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleImportFile(file);
    });

    // Editor toolbar.
    document.getElementById("save-btn").addEventListener("click", saveCurrentBook);
    document.getElementById("export-btn").addEventListener("click", () => {
      const book = Editor.getBook();
      if (book) exportBook(book);
    });
    document.getElementById("play-btn").addEventListener("click", () => {
      const book = Editor.getBook();
      if (book) playBook(book);
    });
    document.getElementById("delete-book-btn").addEventListener("click", () => {
      const user = ensureUserOrLogin();
      if (!user || !editingBookId) return;
      if (!confirm("確定刪除這本書？此動作無法復原。")) return;
      Storage.deleteBook(user.id, editingBookId);
      editingBookId = null;
      Editor.markClean();
      renderLibrary();
      showView("library");
      toast("已刪除");
    });

    document.getElementById("exit-player-btn").addEventListener("click", () => {
      if (cameToPlayerFromEditor) {
        showView("editor");
      } else {
        renderLibrary();
        showView("library");
      }
    });

    // Warn on tab close if dirty.
    window.addEventListener("beforeunload", (e) => {
      if (Editor.isDirty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    });

    // Esc closes modal.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modalNewBook.classList.contains("hidden")) closeNewBookModal();
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

  let toastTimer = null;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 1800);
  }

  Editor.init({
    onChange: () => {},
    onSaveRequest: saveCurrentBook
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
  applyClientIdState();
})();
