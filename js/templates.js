// Default story templates. Each template is a complete book that the user can
// clone into their own library and then customize in the editor.
//
// Two of the templates below — "🎲 遊戲模板：賭場之夜" and "🧩 解謎模板：古塔之頂" —
// are tutorial / scaffolding examples that demonstrate every mini-game and
// puzzle type. They're intended to be cloned and rewritten (with or without AI
// help). Patterns to copy:
//
//   • scene.miniGame = "<id>" or "random" / "random-puzzle" — runs a built-in
//     game / puzzle when entering the scene.
//   • scene.puzzle = { question, answers: [...], hint, attempts } — a fully
//     custom Q&A that overrides miniGame.
//   • choice.outcome = "success" | "failure" | undefined — filters the choice
//     against the most recent mini-game / puzzle result, so authors can branch
//     on right vs wrong answers.
window.STORY_TEMPLATES = [
  {
    id: "tpl-fantasy",
    title: "奇幻冒險：森林的入口",
    author: "範例作者",
    cover: "t1",
    description: "一個迷霧森林的探險開頭，含三條主要分支。",
    startScene: "start",
    scenes: {
      start: {
        id: "start",
        title: "森林的入口",
        text: "你站在迷霧森林的邊緣，遠方傳來低沉的鼓聲。一條小徑向左延伸，另一條較陡的小徑向右上坡，而正前方有一座覆滿青苔的石門。",
        choices: [
          { text: "走向左邊的小徑", next: "left-path" },
          { text: "爬上右邊的山坡", next: "right-path" },
          { text: "推開石門", next: "stone-door" }
        ]
      },
      "left-path": {
        id: "left-path",
        title: "溪邊的旅人",
        text: "小徑通往一條清澈的溪流，岸邊一名披著斗篷的旅人正在烤魚。她抬頭望向你，神情警覺。",
        choices: [
          { text: "向她搭話", next: "talk-traveler" },
          { text: "悄悄繞過", next: "sneak-past" }
        ]
      },
      "right-path": {
        id: "right-path",
        title: "山頂的視野",
        text: "山頂風很大，你看見遠方的城堡和一條盤旋的黑龍。",
        choices: [
          { text: "下山趕往城堡", next: "to-castle" },
          { text: "原路返回入口", next: "start" }
        ]
      },
      "stone-door": {
        id: "stone-door",
        title: "古老的廳堂",
        text: "石門推開後是一座空廳，中央有一把劍插在石頭上。",
        choices: [
          { text: "嘗試拔劍", next: "ending-king" },
          { text: "離開廳堂", next: "start" }
        ]
      },
      "talk-traveler": {
        id: "talk-traveler",
        title: "新的同伴",
        text: "她叫艾莉，是一位獵人。她決定與你同行。\n\n你們一起踏上了下一段旅程。",
        choices: []
      },
      "sneak-past": {
        id: "sneak-past",
        title: "失足",
        text: "你踩到一根枯枝，旅人轉身警戒——但只是揮手要你離開。\n\n你錯失了一個朋友。",
        choices: []
      },
      "to-castle": {
        id: "to-castle",
        title: "城堡前夕",
        text: "你抵達城堡，黑龍盤旋在尖塔上。冒險才剛開始。",
        choices: []
      },
      "ending-king": {
        id: "ending-king",
        title: "命定之王",
        text: "劍應你手而出，森林深處傳來歡呼。你成為了傳說中的王。",
        choices: []
      }
    }
  },
  {
    id: "tpl-mystery",
    title: "懸疑推理：消失的客人",
    author: "範例作者",
    cover: "t2",
    description: "一場暴風雪山莊裡的失蹤事件。",
    startScene: "start",
    scenes: {
      start: {
        id: "start",
        title: "山莊的夜",
        text: "暴風雪困住了所有人。早晨，B 號房的客人不見了，房門從內反鎖。莊主請你協助調查。",
        choices: [
          { text: "先檢查 B 號房", next: "room-b" },
          { text: "詢問其他客人", next: "interview" }
        ]
      },
      "room-b": {
        id: "room-b",
        title: "反鎖的房間",
        text: "窗台的雪上沒有腳印，但壁爐中有一張燒了一半的車票。",
        choices: [
          { text: "拿起車票檢查", next: "ticket" },
          { text: "回到大廳", next: "start" }
        ]
      },
      "interview": {
        id: "interview",
        title: "餐廳的證詞",
        text: "三位客人各自有不同說法：服務生說昨晚聽見爭吵，廚師則說沒人離開過廚房。",
        choices: [
          { text: "追問服務生", next: "waiter" },
          { text: "回到大廳", next: "start" }
        ]
      },
      "ticket": {
        id: "ticket",
        title: "燒了一半的車票",
        text: "車票上的目的地是「臨港」，日期就在三天前。\n\n你開始拼湊真相。",
        choices: []
      },
      "waiter": {
        id: "waiter",
        title: "服務生的祕密",
        text: "服務生承認，他其實是失蹤客人的弟弟。\n\n案情急轉直下。",
        choices: []
      }
    }
  },
  {
    id: "tpl-life",
    title: "校園日常：今天要去哪？",
    author: "範例作者",
    cover: "t3",
    description: "輕鬆的小品，適合用來練習編輯器。",
    startScene: "start",
    scenes: {
      start: {
        id: "start",
        title: "下課鐘響",
        text: "鐘聲響起，今天放學後你想做什麼？",
        choices: [
          { text: "去圖書館看書", next: "library" },
          { text: "和朋友去逛街", next: "shopping" },
          { text: "回家打電動", next: "game" }
        ]
      },
      library: {
        id: "library",
        title: "靜謐的午後",
        text: "你在書架間找到一本沒看過的小說。\n\n這是個有收穫的下午。",
        choices: []
      },
      shopping: {
        id: "shopping",
        title: "意外的相遇",
        text: "在文具店，你遇到了多年不見的小學同學。\n\n話題一聊就停不下來。",
        choices: []
      },
      game: {
        id: "game",
        title: "完美結局",
        text: "你終於通關了那個卡了一週的關卡。\n\n今天值得了。",
        choices: []
      }
    }
  },
  {
    id: "tpl-scifi",
    title: "科幻：失聯的太空站",
    author: "範例作者",
    cover: "",
    description: "在無人回應的太空站上重啟系統，多分支多結局。",
    startScene: "start",
    scenes: {
      start: {
        id: "start",
        title: "進入氣閘",
        text: "你的小艇對接到太空站。氣閘開啟，內部一片漆黑，緊急燈號緩慢閃爍。\n你身上有：手電筒、通訊器、應急配給。",
        choices: [
          { text: "前往主控室", next: "control" },
          { text: "前往醫務室", next: "medbay" },
          { text: "前往引擎艙", next: "engine" }
        ]
      },
      control: {
        id: "control",
        title: "主控室",
        text: "螢幕上殘留最後一筆紀錄：「請求救援，AI 已封鎖核心」。儀表台缺少一張識別卡。",
        choices: [
          { text: "去醫務室找識別卡", next: "medbay" },
          { text: "嘗試破解儀表台", next: "hack" },
          { text: "回氣閘", next: "start" }
        ]
      },
      medbay: {
        id: "medbay",
        title: "醫務室",
        text: "病床上有一具穿戴整齊的太空衣，胸前夾著一張識別卡。隔壁的冷凍艙閃著綠燈。",
        choices: [
          { text: "拿起識別卡", next: "got-card" },
          { text: "開啟冷凍艙", next: "cryo" },
          { text: "離開醫務室", next: "start" }
        ]
      },
      engine: {
        id: "engine",
        title: "引擎艙",
        text: "反應爐運作正常，但一條主線被人為切斷。地上散落著工具。",
        choices: [
          { text: "重接主線", next: "reroute" },
          { text: "回氣閘", next: "start" }
        ]
      },
      "got-card": {
        id: "got-card",
        title: "識別卡到手",
        text: "你拿到了識別卡。",
        choices: [
          { text: "回主控室", next: "control-with-card" }
        ]
      },
      "control-with-card": {
        id: "control-with-card",
        title: "解鎖主控",
        text: "識別卡被接受。AI 重啟，但要求你選擇優先項：保住資料、或關閉 AI。",
        choices: [
          { text: "保住所有研究資料", next: "ending-data" },
          { text: "立刻關閉 AI", next: "ending-shutdown" }
        ]
      },
      hack: {
        id: "hack",
        title: "強行破解",
        text: "破解過程觸發警報，AI 啟動防衛機制。",
        choices: [
          { text: "繼續破解", next: "ending-locked" },
          { text: "撤退", next: "start" }
        ]
      },
      cryo: {
        id: "cryo",
        title: "冷凍艙",
        text: "艙內是太空站站長，他甦醒後告訴你密碼，並懇求你關閉 AI。",
        choices: [
          { text: "答應他", next: "ending-shutdown" },
          { text: "拒絕並離開", next: "start" }
        ]
      },
      reroute: {
        id: "reroute",
        title: "重接主線",
        text: "電力恢復，太空站全面亮起。\n你成功救了這座太空站。",
        choices: []
      },
      "ending-data": {
        id: "ending-data",
        title: "結局：科學至上",
        text: "你帶回了所有研究資料。AI 仍在線上監控。\n人們會記得你，但有人付出了代價。",
        choices: []
      },
      "ending-shutdown": {
        id: "ending-shutdown",
        title: "結局：拔掉插頭",
        text: "AI 永遠關閉了。你和站長一起搭上小艇返航。",
        choices: []
      },
      "ending-locked": {
        id: "ending-locked",
        title: "結局：困鎖",
        text: "AI 啟動了氣閘封鎖。你的訊號被切斷。\n沒有人知道你最後去了哪。",
        choices: []
      }
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 🎲 遊戲模板：賭場之夜
  // 用每一張賭桌示範一種小遊戲；每場遊戲都示範 success / failure 分支。
  // ───────────────────────────────────────────────────────────────
  {
    id: "tpl-casino",
    title: "🎲 遊戲模板：賭場之夜",
    author: "範例作者",
    cover: "t1",
    description: "示範擲骰、硬幣、剪刀石頭布、猜數字、抽牌五種小遊戲與成敗分支。",
    startScene: "lobby",
    scenes: {
      lobby: {
        id: "lobby",
        title: "賭場大廳",
        text: "霓虹閃爍，經理遞給你 100 籌碼。\n挑一張賭桌試試手氣，連贏兩場就能進 VIP 房。",
        choices: [
          { text: "🎲 骰子桌", next: "dice-table" },
          { text: "🪙 硬幣攤", next: "coin-table" },
          { text: "✊ 剪刀石頭布擂台", next: "rps-table" },
          { text: "🔢 猜數字", next: "guess-table" },
          { text: "🃏 抽牌桌", next: "card-table" },
          { text: "離開賭場", next: "ending-leave" }
        ]
      },
      "dice-table": {
        id: "dice-table",
        title: "骰子桌",
        text: "莊家把骰子推給你：「擲到 4 點以上就贏。」",
        miniGame: "dice",
        choices: [
          { text: "贏了！換到下一桌", next: "second-round", outcome: "success" },
          { text: "輸了，籌碼少一半", next: "lose-half", outcome: "failure" }
        ]
      },
      "coin-table": {
        id: "coin-table",
        title: "硬幣攤",
        text: "攤主拋起一枚銀幣：「猜對哪一面就贏。」",
        miniGame: "coin",
        choices: [
          { text: "贏了！換到下一桌", next: "second-round", outcome: "success" },
          { text: "輸了，籌碼少一半", next: "lose-half", outcome: "failure" }
        ]
      },
      "rps-table": {
        id: "rps-table",
        title: "剪刀石頭布擂台",
        text: "對手是個戴墨鏡的小子：「贏或平手都算過關。」",
        miniGame: "rps",
        choices: [
          { text: "贏了！換到下一桌", next: "second-round", outcome: "success" },
          { text: "輸了，籌碼少一半", next: "lose-half", outcome: "failure" }
        ]
      },
      "guess-table": {
        id: "guess-table",
        title: "猜數字桌",
        text: "莊家在心裡想了一個 1–20 的數字，你有四次機會。",
        miniGame: "guess",
        choices: [
          { text: "猜中！換到下一桌", next: "second-round", outcome: "success" },
          { text: "沒猜中，籌碼少一半", next: "lose-half", outcome: "failure" }
        ]
      },
      "card-table": {
        id: "card-table",
        title: "抽牌桌",
        text: "你抽一張，A 或 J、Q、K 算贏。",
        miniGame: "card",
        choices: [
          { text: "好牌！換到下一桌", next: "second-round", outcome: "success" },
          { text: "小牌，籌碼少一半", next: "lose-half", outcome: "failure" }
        ]
      },
      "second-round": {
        id: "second-round",
        title: "再來一場？",
        text: "你贏了一輪。經理眨眨眼：「再贏一場，就能進 VIP 房。」\n這次輪到莊家挑遊戲。",
        miniGame: "random",
        choices: [
          { text: "進 VIP 房", next: "ending-vip", outcome: "success" },
          { text: "兩贏一輸，平手收手", next: "ending-tie", outcome: "failure" }
        ]
      },
      "lose-half": {
        id: "lose-half",
        title: "輸掉一半",
        text: "你只剩 50 籌碼。要不要孤注一擲？",
        choices: [
          { text: "下注全部，賭剪刀石頭布翻盤", next: "all-in" },
          { text: "認輸離場", next: "ending-leave" }
        ]
      },
      "all-in": {
        id: "all-in",
        title: "孤注一擲",
        text: "贏就翻倍，輸就清光。",
        miniGame: "rps",
        choices: [
          { text: "翻盤！再回大廳", next: "lobby", outcome: "success" },
          { text: "全光了，黯然離場", next: "ending-broke", outcome: "failure" }
        ]
      },
      "ending-vip": {
        id: "ending-vip",
        title: "結局：VIP 房",
        text: "金色大門打開，你踏進賭場最深處的 VIP 房。\n那是另一個故事的開頭。",
        choices: []
      },
      "ending-tie": {
        id: "ending-tie",
        title: "結局：見好就收",
        text: "你帶著贏來的籌碼離開，吃了一頓豐盛的宵夜。",
        choices: []
      },
      "ending-leave": {
        id: "ending-leave",
        title: "結局：今晚不賭",
        text: "你決定離開賭場，把錢省下買書。",
        choices: []
      },
      "ending-broke": {
        id: "ending-broke",
        title: "結局：身無分文",
        text: "你輸光了所有籌碼，悻悻然走出賭場。",
        choices: []
      }
    }
  },

  // ───────────────────────────────────────────────────────────────
  // 🧩 解謎模板：古塔之頂
  // 五道門分別示範一種推理謎題，最後用自訂謎題（scene.puzzle）守住寶藏。
  // ───────────────────────────────────────────────────────────────
  {
    id: "tpl-puzzle-tower",
    title: "🧩 解謎模板：古塔之頂",
    author: "範例作者",
    cover: "t2",
    description: "示範心算、成語、數列、謎語、拆字、自訂謎題六種推理機制。",
    startScene: "tower",
    scenes: {
      tower: {
        id: "tower",
        title: "古塔大廳",
        text: "古塔有五道門，每一道都鎖著一個謎題。\n破解任一道，都能上到塔頂。傳說最後還守著一道銅鎖。",
        choices: [
          { text: "➗ 走進心算之門", next: "math-gate" },
          { text: "📚 走進成語之門", next: "idiom-gate" },
          { text: "🔢 走進數列之門", next: "sequence-gate" },
          { text: "❓ 走進謎語之門", next: "riddle-gate" },
          { text: "🈶 走進拆字之門", next: "char-gate" }
        ]
      },
      "math-gate": {
        id: "math-gate",
        title: "心算之門",
        text: "石板浮現一道算式，答對才能通過。",
        miniGame: "math",
        choices: [
          { text: "石門開啟，登上塔頂", next: "treasure", outcome: "success" },
          { text: "石板震碎，被推回大廳", next: "fall", outcome: "failure" }
        ]
      },
      "idiom-gate": {
        id: "idiom-gate",
        title: "成語之門",
        text: "門上刻著一句成語，缺了一個字。",
        miniGame: "idiom",
        choices: [
          { text: "字嵌入凹槽，門開了", next: "treasure", outcome: "success" },
          { text: "字格亮紅燈，被推回大廳", next: "fall", outcome: "failure" }
        ]
      },
      "sequence-gate": {
        id: "sequence-gate",
        title: "數列之門",
        text: "一排石燈閃爍著一連串數字，下一盞要亮哪一個？",
        miniGame: "sequence",
        choices: [
          { text: "石燈全亮，門開了", next: "treasure", outcome: "success" },
          { text: "石燈熄滅，被推回大廳", next: "fall", outcome: "failure" }
        ]
      },
      "riddle-gate": {
        id: "riddle-gate",
        title: "謎語之門",
        text: "石面浮出一句謎語與四個答案。",
        miniGame: "riddle",
        choices: [
          { text: "謎語化為石塵，門開了", next: "treasure", outcome: "success" },
          { text: "謎語化為迷霧，被推回大廳", next: "fall", outcome: "failure" }
        ]
      },
      "char-gate": {
        id: "char-gate",
        title: "拆字之門",
        text: "門上一行小字提示著一個漢字，把它寫進石框。",
        miniGame: "chargame",
        choices: [
          { text: "字成石符，門開了", next: "treasure", outcome: "success" },
          { text: "字格塌陷，被推回大廳", next: "fall", outcome: "failure" }
        ]
      },
      treasure: {
        id: "treasure",
        title: "塔頂寶藏室",
        text: "你登上塔頂。一座銅鎖橫在金庫前，鎖上刻著最後一道謎題。",
        puzzle: {
          question: "「我有頭沒臉，一拋便響。」這是什麼？",
          answers: ["硬幣", "銅板", "錢"],
          hint: "拋一下會發出聲音的東西",
          attempts: 2
        },
        choices: [
          { text: "銅鎖喀的一聲打開了", next: "ending-treasure", outcome: "success" },
          { text: "鎖內彈出毒針，警鈴大作", next: "ending-trap", outcome: "failure" }
        ]
      },
      fall: {
        id: "fall",
        title: "失敗",
        text: "石階震動，你被推回塔下大廳。\n再試另一道門吧。",
        choices: [
          { text: "回大廳重新挑門", next: "tower" }
        ]
      },
      "ending-treasure": {
        id: "ending-treasure",
        title: "結局：金光萬丈",
        text: "金庫裡裝滿了古錢與經卷。你成為塔頂歷代以來第七位真正的解謎者。",
        choices: []
      },
      "ending-trap": {
        id: "ending-trap",
        title: "結局：機關啟動",
        text: "毒針劃過你的臉頰，幸好只是麻醉劑。\n醒來時你已經被警衛抬回大廳。",
        choices: [
          { text: "再挑戰一次", next: "tower" }
        ]
      }
    }
  }
];
