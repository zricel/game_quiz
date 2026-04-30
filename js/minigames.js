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

  // ---- Puzzle pools (curated content) ----
  const idiomPool = [
    { idiom: "一鳴驚_", missing: "人" },
    { idiom: "守_待兔", missing: "株" },
    { idiom: "_假虎威", missing: "狐" },
    { idiom: "畫蛇添_", missing: "足" },
    { idiom: "井底之_", missing: "蛙" },
    { idiom: "亡羊補_", missing: "牢" },
    { idiom: "_口同聲", missing: "異" },
    { idiom: "半_而廢", missing: "途" },
    { idiom: "百發百_", missing: "中" },
    { idiom: "畫_點睛", missing: "龍" },
    { idiom: "不_其煩", missing: "厭" },
    { idiom: "草木皆_", missing: "兵" },
    { idiom: "得心應_", missing: "手" },
    { idiom: "獨樹一_", missing: "幟" },
    { idiom: "百折不_", missing: "撓" }
  ];

  const riddlePool = [
    { q: "什麼東西越洗越髒？", choices: ["碗筷", "水", "衣服", "頭髮"], a: "水" },
    { q: "什麼東西有頭沒尾，又有眼沒嘴？", choices: ["針", "魚", "蛇", "鞋"], a: "針" },
    { q: "什麼東西天天用卻越用越多？", choices: ["錢", "知識", "食物", "電力"], a: "知識" },
    { q: "什麼東西打破了大家都會說好？", choices: ["紀錄", "玻璃", "雞蛋", "杯子"], a: "紀錄" },
    { q: "什麼東西人人見過、卻無法摸到？", choices: ["影子", "彩虹", "夢", "風"], a: "影子" },
    { q: "一年四季都不凋謝的是什麼樹？", choices: ["松樹", "柳樹", "梅樹", "聖誕樹"], a: "聖誕樹" },
    { q: "兩隻螞蟻在樹上賽跑，誰會贏？", choices: ["大的", "小的", "快的", "平手"], a: "平手" },
    { q: "什麼事不能用左手做？", choices: ["寫字", "吃飯", "握住右手", "畫畫"], a: "握住右手" },
    { q: "什麼東西沒有腿卻能走遍全世界？", choices: ["錢", "風", "新聞", "夢"], a: "新聞" }
  ];

  const charPool = [
    { hint: "三人合一", a: ["众", "眾"] },
    { hint: "山下有山", a: ["出"] },
    { hint: "三日同光", a: ["晶"] },
    { hint: "三木成林又一棵", a: ["森"] },
    { hint: "三水合一", a: ["淼"] },
    { hint: "口中有口", a: ["回"] },
    { hint: "上下都是口", a: ["呂"] },
    { hint: "一張口，吃掉一斗米", a: ["料"] },
    { hint: "心上有人", a: ["您"] },
    { hint: "兩個人並肩", a: ["从", "從"] },
    { hint: "九十九", a: ["白"] }
  ];

  function rand(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[rand(arr.length)]; }

  // ➗ 數學算式：隨機產生四則運算題。
  const math = {
    id: "math",
    name: "心算題",
    icon: "➗",
    description: "解一道四則運算題目。",
    play(container) {
      return new Promise(resolve => {
        clear(container);
        const ops = ["+", "−", "×"];
        const op = pick(ops);
        let a, b, expr, ans;
        if (op === "+") { a = 10 + rand(40); b = 10 + rand(40); ans = a + b; expr = `${a} + ${b}`; }
        else if (op === "−") { a = 30 + rand(60); b = 5 + rand(a - 5); ans = a - b; expr = `${a} − ${b}`; }
        else { a = 2 + rand(11); b = 2 + rand(11); ans = a * b; expr = `${a} × ${b}`; }
        const face = el("div", { className: "mg-bigface puzzle" }, `${expr} = ?`);
        const status = el("div", { className: "mg-status" }, "輸入答案。");
        const row = el("div", { className: "mg-row" });
        const input = el("input", { type: "number", className: "mg-input wide" });
        const btn = el("button", { className: "primary-btn" }, "送出");
        const submit = () => {
          const v = parseInt(input.value, 10);
          if (Number.isNaN(v)) { status.textContent = "請輸入數字。"; return; }
          input.disabled = true; btn.disabled = true;
          const success = v === ans;
          status.textContent = success ? `正解！答案是 ${ans}。` : `錯了，正解是 ${ans}。`;
          status.classList.add(success ? "ok" : "bad");
          resolve({ success, value: v, message: status.textContent });
        };
        btn.addEventListener("click", submit);
        input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        row.append(input, btn);
        container.append(face, status, row);
        setTimeout(() => input.focus(), 50);
      });
    }
  };

  // 📚 成語填空：填入缺漏的字。
  const idiom = {
    id: "idiom",
    name: "成語填空",
    icon: "📚",
    description: "把成語裡缺漏的那個字填上。",
    play(container) {
      return new Promise(resolve => {
        clear(container);
        const item = pick(idiomPool);
        const face = el("div", { className: "mg-bigface puzzle" }, item.idiom);
        const status = el("div", { className: "mg-status" }, "把空格的字填上。");
        const row = el("div", { className: "mg-row" });
        const input = el("input", { type: "text", className: "mg-input", maxLength: 2, placeholder: "?" });
        const btn = el("button", { className: "primary-btn" }, "送出");
        const submit = () => {
          const v = (input.value || "").trim();
          if (!v) { status.textContent = "請填入一個字。"; return; }
          input.disabled = true; btn.disabled = true;
          const success = v === item.missing;
          const filled = item.idiom.replace("_", item.missing);
          status.textContent = success ? `正確！「${filled}」。` : `錯了，正解是「${filled}」。`;
          status.classList.add(success ? "ok" : "bad");
          resolve({ success, value: v, message: status.textContent });
        };
        btn.addEventListener("click", submit);
        input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        row.append(input, btn);
        container.append(face, status, row);
        setTimeout(() => input.focus(), 50);
      });
    }
  };

  // 🔢 數列規律：依規律推下一個數。
  const sequence = {
    id: "sequence",
    name: "數列規律",
    icon: "🔢",
    description: "找出規律，寫出下一個數。",
    play(container) {
      return new Promise(resolve => {
        clear(container);
        // Pick a generator.
        const kind = rand(4);
        let seq, next, label;
        if (kind === 0) {
          // Arithmetic: a, a+d, a+2d, ...
          const a = 1 + rand(9), d = 2 + rand(6);
          seq = [a, a + d, a + 2*d, a + 3*d];
          next = a + 4*d;
          label = "等差數列";
        } else if (kind === 1) {
          // Geometric: a, a*r, ...
          const a = 1 + rand(4), r = 2 + rand(2);
          seq = [a, a*r, a*r*r, a*r*r*r];
          next = a*r*r*r*r;
          label = "等比數列";
        } else if (kind === 2) {
          // Squares: 1,4,9,16
          seq = [1, 4, 9, 16];
          next = 25;
          label = "平方數";
        } else {
          // Fibonacci-like
          const a = 1 + rand(3), b = a + 1 + rand(3);
          seq = [a, b, a+b, a+2*b];
          next = 2*a + 3*b;
          label = "費氏型";
        }
        const face = el("div", { className: "mg-bigface puzzle" }, seq.join(", ") + ", ?");
        const status = el("div", { className: "mg-status" }, "下一個數字是？");
        const row = el("div", { className: "mg-row" });
        const input = el("input", { type: "number", className: "mg-input wide" });
        const btn = el("button", { className: "primary-btn" }, "送出");
        const submit = () => {
          const v = parseInt(input.value, 10);
          if (Number.isNaN(v)) { status.textContent = "請輸入數字。"; return; }
          input.disabled = true; btn.disabled = true;
          const success = v === next;
          status.textContent = success ? `對！正解 ${next}（${label}）。` : `不對，正解 ${next}（${label}）。`;
          status.classList.add(success ? "ok" : "bad");
          resolve({ success, value: v, message: status.textContent });
        };
        btn.addEventListener("click", submit);
        input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        row.append(input, btn);
        container.append(face, status, row);
        setTimeout(() => input.focus(), 50);
      });
    }
  };

  // ❓ 中文謎語：選擇題。
  const riddle = {
    id: "riddle",
    name: "中文謎語",
    icon: "❓",
    description: "從選項裡挑出謎底。",
    play(container) {
      return new Promise(resolve => {
        clear(container);
        const item = pick(riddlePool);
        const face = el("div", { className: "mg-question" }, item.q);
        const status = el("div", { className: "mg-status" }, "選一個答案。");
        const row = el("div", { className: "mg-row column" });
        item.choices.forEach(opt => {
          const b = el("button", { className: "ghost-btn wide" }, opt);
          b.addEventListener("click", () => {
            row.querySelectorAll("button").forEach(x => x.disabled = true);
            const success = opt === item.a;
            status.textContent = success ? `答對了：「${item.a}」。` : `不是。正解是「${item.a}」。`;
            status.classList.add(success ? "ok" : "bad");
            b.classList.add(success ? "outcome-success" : "outcome-failure");
            resolve({ success, value: opt, message: status.textContent });
          });
          row.appendChild(b);
        });
        container.append(face, status, row);
      });
    }
  };

  // 🈶 拆字謎：依提示猜出一個漢字。
  const chargame = {
    id: "chargame",
    name: "拆字謎",
    icon: "🈶",
    description: "依提示寫出一個漢字。",
    play(container) {
      return new Promise(resolve => {
        clear(container);
        const item = pick(charPool);
        const face = el("div", { className: "mg-question" }, `提示：${item.hint}`);
        const status = el("div", { className: "mg-status" }, "寫出謎底（一個字）。");
        const row = el("div", { className: "mg-row" });
        const input = el("input", { type: "text", className: "mg-input", maxLength: 2, placeholder: "?" });
        const btn = el("button", { className: "primary-btn" }, "送出");
        const submit = () => {
          const v = (input.value || "").trim();
          if (!v) { status.textContent = "請填入一個字。"; return; }
          input.disabled = true; btn.disabled = true;
          const accepted = item.a.map(s => s.toLowerCase());
          const success = accepted.includes(v.toLowerCase());
          status.textContent = success ? `對了！正解：${item.a[0]}。` : `不是。正解：${item.a.join("／")}。`;
          status.classList.add(success ? "ok" : "bad");
          resolve({ success, value: v, message: status.textContent });
        };
        btn.addEventListener("click", submit);
        input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
        row.append(input, btn);
        container.append(face, status, row);
        setTimeout(() => input.focus(), 50);
      });
    }
  };

  // ✏ 自訂謎題：作者在編輯器自填題目與答案。
  const custom = {
    id: "custom",
    name: "自訂謎題",
    icon: "✏",
    description: "由作者自訂題目與答案。",
    authorOnly: true, // not picked by random()
    play(container, config) {
      return new Promise(resolve => {
        clear(container);
        const cfg = config || {};
        const question = cfg.question || "（這個謎題還沒填題目）";
        const hint = cfg.hint || "";
        const accepted = (cfg.answers || (cfg.answer ? [cfg.answer] : []))
          .map(a => String(a || "").trim()).filter(Boolean);
        const maxAttempts = Math.max(1, parseInt(cfg.attempts, 10) || 2);

        const face = el("div", { className: "mg-question" }, question);
        const status = el("div", { className: "mg-status" }, hint ? `提示：${hint}` : "請輸入答案。");
        const row = el("div", { className: "mg-row" });
        const input = el("input", { type: "text", className: "mg-input wide", placeholder: "你的答案…" });
        const btn = el("button", { className: "primary-btn" }, "送出");

        if (accepted.length === 0) {
          // No answer set — treat as a free-form prompt that always succeeds.
          status.textContent = "（此謎題未設定答案，按送出繼續）";
          btn.addEventListener("click", () => {
            input.disabled = true; btn.disabled = true;
            resolve({ success: true, value: "", message: "已送出。" });
          });
          row.append(input, btn);
          container.append(face, status, row);
          return;
        }

        let tries = 0;
        const submit = () => {
          const v = (input.value || "").trim();
          if (!v) { status.textContent = "請輸入答案。"; return; }
          tries++;
          const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, "");
          const ok = accepted.some(a => norm(a) === norm(v));
          if (ok) {
            input.disabled = true; btn.disabled = true;
            status.textContent = `答對了！${accepted.length > 1 ? "（接受答案：" + accepted.join("、") + "）" : ""}`;
            status.classList.add("ok");
            resolve({ success: true, value: v, message: status.textContent });
            return;
          }
          if (tries >= maxAttempts) {
            input.disabled = true; btn.disabled = true;
            status.textContent = `沒答對。正解：${accepted.join(" / ")}`;
            status.classList.add("bad");
            resolve({ success: false, value: v, message: status.textContent });
            return;
          }
          status.textContent = `不對喔，再試一次（剩 ${maxAttempts - tries} 次）。`;
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

  const registry = { dice, coin, rps, guess, card, math, idiom, sequence, riddle, chargame, custom };

  function list() { return Object.values(registry); }
  function listAuthorable() { return list().filter(g => !g.authorOnly); }
  function get(id) { return registry[id] || null; }
  function random() {
    const all = listAuthorable();
    return all[Math.floor(Math.random() * all.length)];
  }
  function pickByName(name) {
    if (!name) return null;
    if (name === "random") return random();
    if (name === "random-puzzle") {
      const puzzles = ["math", "idiom", "sequence", "riddle", "chargame"].map(get);
      return puzzles[Math.floor(Math.random() * puzzles.length)];
    }
    return get(name);
  }

  return { registry, list, listAuthorable, get, random, pickByName };
})();
