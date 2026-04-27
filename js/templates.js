// Default story templates. Each template is a complete book that the user can clone
// into their own library and then customize in the editor.
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
  }
];
