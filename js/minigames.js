// Mini-game templates — each game has a play(container) method that renders
// its UI inside the given element and resolves with a result object:
//   { success: boolean, value: any, message: string }
// Player will pick games either explicitly (scene.miniGame === id) or
// randomly (scene.miniGame === "random", or auto-inject toggle).
window.MiniGames = (function () {
  function el(tag, props, ...children) {
    const e = document.createElement(tag);
    Object.assign(e, props || {});
    children.forEach(c => {
      if (c == null) return;
      if (typeof c === "string") e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    });
    return e;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  // 🎲 擲骰子：擲一顆 d6，≥4 為成功。
  const dice = {
    id: "dice",
    name: "擲骰子",
    icon: "🎲",
    description: "擲一顆六面骰，4 點以上算成功。",
    play(container) {
      return new Promise(resolve => {
        clear(container);
        const face = el("div", { className: "mg-bigface" }, "🎲");
        const status = el("div", { className: "mg-status" }, "點下方按鈕擲骰。");
        const btn = el("button", { className: "primary-btn" }, "擲骰");
        btn.addEventListener("click", () => {
          btn.disabled = true;
          let n = 20;
          const tick = () => {
            face.textContent = ["⚀","⚁","⚂","⚃","⚄","⚅"][Math.floor(Math.random()*6)];
            if (--n > 0) setTimeout(tick, 50 + (20 - n) * 6);
            else {
              const v = 1 + Math.floor(Math.random() * 6);
              face.textContent = ["⚀","⚁","⚂","⚃","⚄","⚅"][v - 1];
              const success = v >= 4;
              status.textContent = `擲出 ${v} 點 — ${success ? "成功！" : "失敗。"}`;
              status.classList.add(success ? "ok" : "bad");
              resolve({ success, value: v, message: status.textContent });
            }
          };
          tick();
        });
        container.append(face, status, btn);
      });
    }
  };

  // 🪙 拋硬幣：選邊，猜中為成功。
  const coin = {
    id: "coin",
    name: "拋硬幣",
    icon: "🪙",
    description: "選正面或反面，命中算成功。",
    play(container) {
      return new Promise(resolve => {
        clear(container);
        const face = el("div", { className: "mg-bigface" }, "🪙");
        const status = el("div", { className: "mg-status" }, "你猜哪一面？");
        const row = el("div", { className: "mg-row" });
        const choose = (guess, label) => {
          const b = el("button", { className: "ghost-btn" }, label);
          b.addEventListener("click", () => {
            row.querySelectorAll("button").forEach(x => x.disabled = true);
            let n = 14;
            const tick = () => {
              face.textContent = (n % 2 === 0) ? "🪙" : "💿";
              if (--n > 0) setTimeout(tick, 60 + (14 - n) * 8);
              else {
                const result = Math.random() < 0.5 ? "head" : "tail";
                face.textContent = result === "head" ? "🪙" : "💿";
                const resultLabel = result === "head" ? "正面" : "反面";
                const success = guess === result;
                status.textContent = `結果是${resultLabel} — ${success ? "猜中！" : "沒猜中。"}`;
                status.classList.add(success ? "ok" : "bad");
                resolve({ success, value: result, message: status.textContent });
              }
            };
            tick();
          });
          return b;
        };
        row.append(choose("head", "正面 🪙"), choose("tail", "反面 💿"));
        container.append(face, status, row);
      });
    }
  };

  // ✊✋✌ 剪刀石頭布：贏或平手算成功。
  const rps = {
    id: "rps",
    name: "剪刀石頭布",
    icon: "✊",
    description: "贏或平手算成功。",
    play(container) {
      return new Promise(resolve => {
        clear(container);
        const face = el("div", { className: "mg-bigface" }, "✊✋✌");
        const status = el("div", { className: "mg-status" }, "出招！");
        const row = el("div", { className: "mg-row" });
        const opts = [
          { id: "rock", label: "石頭", icon: "✊" },
          { id: "paper", label: "布", icon: "✋" },
          { id: "scissors", label: "剪刀", icon: "✌" }
        ];
        const beats = { rock: "scissors", paper: "rock", scissors: "paper" };
        opts.forEach(o => {
          const b = el("button", { className: "ghost-btn" }, `${o.icon} ${o.label}`);
          b.addEventListener("click", () => {
            row.querySelectorAll("button").forEach(x => x.disabled = true);
            const aiPick = opts[Math.floor(Math.random() * 3)];
            face.textContent = `${o.icon}  vs  ${aiPick.icon}`;
            let outcome;
            if (o.id === aiPick.id) outcome = "draw";
            else if (beats[o.id] === aiPick.id) outcome = "win";
            else outcome = "lose";
            const success = outcome !== "lose";
            const label = outcome === "win" ? "你贏了！" : outcome === "draw" ? "平手。" : "你輸了。";
            status.textContent = `對手出${aiPick.label} — ${label}`;
            status.classList.add(success ? "ok" : "bad");
            resolve({ success, value: outcome, message: status.textContent });
          });
          row.appendChild(b);
        });
        container.append(face, status, row);
      });
    }
  };

  // 🔢 猜數字：1-20，4 次機會。
  const guess = {
    id: "guess",
    name: "猜數字",
    icon: "🔢",
    description: "1 到 20 之間，最多猜 4 次。",
    play(container) {
      return new Promise(resolve => {
        clear(container);
        const target = 1 + Math.floor(Math.random() * 20);
        const max = 4;
        let tries = 0;
        const face = el("div", { className: "mg-bigface" }, "❓");
        const status = el("div", { className: "mg-status" }, `想一個 1 到 20 的數字（剩 ${max} 次）。`);
        const row = el("div", { className: "mg-row" });
        const input = el("input", { type: "number", min: 1, max: 20, className: "mg-input", placeholder: "1–20" });
        const btn = el("button", { className: "primary-btn" }, "猜");
        const submit = () => {
          const n = parseInt(input.value, 10);
          if (!(n >= 1 && n <= 20)) { status.textContent = "請輸入 1–20。"; return; }
          tries++;
          if (n === target) {
            face.textContent = String(target);
            status.textContent = `猜中了！正解是 ${target}。`;
            status.classList.add("ok");
            input.disabled = true; btn.disabled = true;
            resolve({ success: true, value: target, message: status.textContent });
            return;
          }
          if (tries >= max) {
            face.textContent = String(target);
            status.textContent = `已用完 ${max} 次。正解是 ${target}。`;
            status.classList.add("bad");
            input.disabled = true; btn.disabled = true;
            resolve({ success: false, value: target, message: status.textContent });
            return;
          }
          status.textContent = `${n} ${n < target ? "太小" : "太大"}（剩 ${max - tries} 次）。`;
          input.value = "";
          input.focus();
        };
        btn.addEventListener("click", submit);
        input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        row.append(input, btn);
        container.append(face, status, row);
        setTimeout(() => input.focus(), 50);
      });
    }
  };

  // 🃏 抽牌：抽一張 1–13，J/Q/K/A 算成功（即 ≥11 或 ===1）。
  const card = {
    id: "card",
    name: "抽撲克牌",
    icon: "🃏",
    description: "抽一張牌，A / J / Q / K 算成功。",
    play(container) {
      return new Promise(resolve => {
        clear(container);
        const face = el("div", { className: "mg-bigface" }, "🂠");
        const status = el("div", { className: "mg-status" }, "點下方抽一張牌。");
        const btn = el("button", { className: "primary-btn" }, "抽牌");
        const labels = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
        const suits = ["♠","♥","♦","♣"];
        btn.addEventListener("click", () => {
          btn.disabled = true;
          let n = 14;
          const tick = () => {
            const r = Math.floor(Math.random() * 13);
            const s = suits[Math.floor(Math.random() * 4)];
            face.textContent = labels[r] + s;
            face.className = "mg-bigface " + (s === "♥" || s === "♦" ? "red" : "black");
            if (--n > 0) setTimeout(tick, 50 + (14 - n) * 10);
            else {
              const r2 = Math.floor(Math.random() * 13);
              const s2 = suits[Math.floor(Math.random() * 4)];
              face.textContent = labels[r2] + s2;
              face.className = "mg-bigface " + (s2 === "♥" || s2 === "♦" ? "red" : "black");
              const value = r2 + 1; // 1..13
              const success = value === 1 || value >= 11;
              status.textContent = `抽到 ${labels[r2]}${s2} — ${success ? "成功！" : "再接再厲。"}`;
              status.classList.add(success ? "ok" : "bad");
              resolve({ success, value, message: status.textContent });
            }
          };
          tick();
        });
        container.append(face, status, btn);
      });
    }
  };

  const registry = { dice, coin, rps, guess, card };

  function list() { return Object.values(registry); }
  function get(id) { return registry[id] || null; }
  function random() {
    const all = list();
    return all[Math.floor(Math.random() * all.length)];
  }
  function pickByName(name) {
    if (!name) return null;
    if (name === "random") return random();
    return get(name);
  }

  return { registry, list, get, random, pickByName };
})();
