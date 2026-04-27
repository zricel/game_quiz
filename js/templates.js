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
  }
];
