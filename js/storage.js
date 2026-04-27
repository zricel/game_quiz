// Per-user persistence using localStorage. Each user's books live under a key
// derived from their Google sub (or a stable demo id), so multiple accounts on
// the same browser stay isolated.
window.Storage = (function () {
  const SCHEMA_VERSION = 1;

  function key(userId) {
    return "sgb:books:" + userId;
  }

  function loadBooks(userId) {
    try {
      const raw = localStorage.getItem(key(userId));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Failed to parse books", e);
      return [];
    }
  }

  function saveBooks(userId, books) {
    localStorage.setItem(key(userId), JSON.stringify(books));
  }

  function upsertBook(userId, book) {
    const books = loadBooks(userId);
    const idx = books.findIndex(b => b.id === book.id);
    book.updatedAt = Date.now();
    if (idx >= 0) {
      books[idx] = book;
    } else {
      book.createdAt = Date.now();
      books.unshift(book);
    }
    saveBooks(userId, books);
    return book;
  }

  function getBook(userId, bookId) {
    return loadBooks(userId).find(b => b.id === bookId) || null;
  }

  function deleteBook(userId, bookId) {
    const books = loadBooks(userId).filter(b => b.id !== bookId);
    saveBooks(userId, books);
  }

  function newBookId() {
    return "book-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
  }

  function cloneBook(book, suffix) {
    const copy = JSON.parse(JSON.stringify(book));
    copy.id = newBookId();
    if (suffix) copy.title = (book.title || "未命名故事") + suffix;
    delete copy.createdAt;
    delete copy.updatedAt;
    return copy;
  }

  function cloneTemplate(tpl) {
    return cloneBook(tpl, "（副本）");
  }

  function duplicateBook(userId, bookId) {
    const src = getBook(userId, bookId);
    if (!src) return null;
    const copy = cloneBook(src, "（副本）");
    return upsertBook(userId, copy);
  }

  function exportBook(book) {
    const payload = {
      schema: SCHEMA_VERSION,
      kind: "story-game-book",
      book: {
        title: book.title,
        author: book.author,
        cover: book.cover || "",
        startScene: book.startScene,
        scenes: book.scenes
      }
    };
    return JSON.stringify(payload, null, 2);
  }

  function validateImported(payload) {
    if (!payload || typeof payload !== "object") return "格式錯誤";
    const b = payload.book || payload; // tolerate raw book object
    if (!b.scenes || typeof b.scenes !== "object") return "缺少 scenes";
    if (!b.startScene || !b.scenes[b.startScene]) return "缺少有效的 startScene";
    for (const id of Object.keys(b.scenes)) {
      const s = b.scenes[id];
      if (!s || typeof s !== "object") return `場景 ${id} 格式錯誤`;
      s.id = id;
      s.choices = Array.isArray(s.choices) ? s.choices : [];
    }
    return null;
  }

  function importFromJson(userId, jsonText) {
    let payload;
    try { payload = JSON.parse(jsonText); }
    catch (e) { throw new Error("不是有效的 JSON：" + e.message); }
    const err = validateImported(payload);
    if (err) throw new Error("匯入失敗：" + err);
    const raw = payload.book || payload;
    const book = {
      id: newBookId(),
      title: raw.title || "匯入的故事",
      author: raw.author || "",
      cover: raw.cover || "",
      startScene: raw.startScene,
      scenes: raw.scenes
    };
    return upsertBook(userId, book);
  }

  return {
    loadBooks,
    saveBooks,
    upsertBook,
    getBook,
    deleteBook,
    newBookId,
    cloneTemplate,
    duplicateBook,
    exportBook,
    importFromJson
  };
})();
