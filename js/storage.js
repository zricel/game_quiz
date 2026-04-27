// Per-user persistence using localStorage. Each user's books live under a key
// derived from their Google sub (or a stable demo id), so multiple accounts on
// the same browser stay isolated.
window.Storage = (function () {
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

  function cloneTemplate(tpl) {
    const copy = JSON.parse(JSON.stringify(tpl));
    copy.id = newBookId();
    copy.title = tpl.title + "（副本）";
    return copy;
  }

  return {
    loadBooks,
    saveBooks,
    upsertBook,
    getBook,
    deleteBook,
    newBookId,
    cloneTemplate
  };
})();
