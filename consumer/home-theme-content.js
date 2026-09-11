// Local operations snapshot. Each theme owns its imagery, bilingual copy and exact questions.
// No fixtures, ticket prices or opening times are implied by these editorial themes.
(() => {
  const item = (id, image, icon, zh, en, questionZh, questionEn) => ({
    id, image: `assets/${image}`, icon,
    zh: { title: zh, prompt: questionZh }, en: { title: en, prompt: questionEn }
  });
  const themes = {
    all: {
      icon: '🧭', label: { zh: '综合', en: 'All' }, accent: '#28745e',
      background: 'assets/沉浸式背景层-750×1624px-1.png',
      originalHome: true
    },
    heritage: {
      icon: '🐉', label: { zh: '非遗', en: 'Heritage' }, accent: '#a43f28',
      background: 'assets/火龙铁花.png',
      zh: { lineOne: '跟着铜龙游铜梁', lineTwo: '把非遗，看进心里', summary: '看龙舞、赏手艺、寻文创，感受龙乡的热闹。', gallery: '从一场龙舞，走进铜梁非遗' },
      en: { lineOne: 'Meet Tongliang', lineTwo: 'Living traditions', summary: 'Dragon dances, local crafts and cultural keepsakes.', gallery: 'Discover dragon culture & crafts' },
      items: [
        item('dance', '火龙铁花.png', '🐉', '第一次看铜梁龙舞，先看哪些门道？', 'Your first dragon dance', '第一次看铜梁龙舞，有哪些特色动作和文化看点值得了解，怎样安排现场观看？', 'What should I look for at my first Tongliang dragon dance, and how can I plan a visit?'),
        item('fire', '打铁花实景.png', '🔥', '火龙夜游，怎样安排才从容？', 'A fire-dragon evening', '我想看铜梁火龙表演，怎样查询场次、选择观看位置，并安排晚餐和返程？', 'How can I check Tongliang fire dragon performances and plan a viewing spot, dinner and the journey back?'),
        item('craft', '非遗竹编.png', '🧺', '竹编的巧手艺，能带回家吗？', 'Discover bamboo crafts', '我想了解铜梁竹编手艺，有哪些欣赏和选购文创的思路，体验活动信息在哪里确认？', 'How can I learn about bamboo crafts in Tongliang, choose craft souvenirs and check for workshops?'),
        item('gift', '火龙冰箱贴.png', '🎁', '把一条小铜龙，装进伴手礼', 'Take a little dragon home', '我想挑选铜梁龙文化伴手礼，有哪些类型值得关注，怎样与非遗游玩顺路安排？', 'What kinds of dragon-themed souvenirs can I look for in Tongliang, and how can I combine shopping with a heritage visit?')
      ]
    },
    food: {
      icon: '🍜', label: { zh: '美食', en: 'Food' }, accent: '#a34c1b',
      background: 'assets/湖景火锅.jpeg',
      zh: { lineOne: '把周末交给味蕾', lineTwo: '这一口，很铜梁', summary: '江湖菜、湖畔火锅与地道小吃，一路逛一路尝。', gallery: '铜梁好味道，从这几口开始' },
      en: { lineOne: 'Taste Tongliang', lineTwo: 'A delicious escape', summary: 'Local dishes, lakeside hotpot and snacks along the way.', gallery: 'Find your next local flavor' },
      items: [
        item('rabbit', '三活春油烧兔-3.png', '🌶️', '油烧兔怎么点，才吃得安逸？', 'Try local rabbit dishes', '我想尝尝铜梁油烧兔，怎样选择口味、安排配菜，并了解用餐前需要确认的信息？', 'I want to try Tongliang rabbit dishes. How should I choose the spice level and side dishes, and what should I check before dining?'),
        item('hotpot', '湖景火锅.jpeg', '🍲', '湖边吃火锅，饭前饭后怎么耍？', 'Hotpot by the lake', '我想在玄天湖周边吃火锅，怎样选择口味，并把饭前散步、用餐和饭后休息衔接起来？', 'How can I plan hotpot near Xuantian Lake with a walk before dinner and a relaxed break afterwards?'),
        item('fish', '玄天湖湖鱼宴.png', '🐟', '想吃湖鱼，有哪些点菜思路？', 'A fish feast', '来铜梁想吃鱼，有哪些口味和点菜建议，带老人孩子用餐需要注意什么？', 'What flavors and ordering tips should I consider for a fish meal in Tongliang with children and older relatives?'),
        item('snack', '泡椒凤爪.png', '🛍️', '铜梁的辣味，挑点带回家', 'Bring local flavors home', '想买铜梁风味食品作为伴手礼，泡椒凤爪等食品怎样挑选，携带和保存要注意什么？', 'How can I choose Tongliang food gifts such as pickled chicken feet, and what should I consider for transport and storage?')
      ]
    },
    football: {
      icon: '⚽', label: { zh: '足球', en: 'Football' }, accent: '#176951',
      background: 'assets/football-tonglianglong-red-crest.jpg',
      zh: { lineOne: '为热爱，来铜梁', lineTwo: '看场球，耍个周末', summary: '赛前寻味、赛后慢游，把足球和旅行排在一起。', gallery: '为铜梁龙加油，赴一场周末之约' },
      en: { lineOne: 'Come for football', lineTwo: 'Stay for the weekend', summary: 'Make room for local food and sights around matchday.', gallery: 'Cheer for Tongliang Long. Make a weekend of it.' },
      items: [
        item('match', 'theme-football-field.svg', '⚽', '第一次来观赛，先确认哪些事？', 'Plan your matchday · illustration', '我想在铜梁观赛，怎样查询比赛日期、实际场馆、官方购票渠道以及入场要求？', 'How can I check match dates, the actual venue, official ticket channels and entry requirements for a football visit to Tongliang?'),
        item('meal', '湖景火锅.jpeg', '🍜', '开场之前，先吃一顿铜梁味', 'A local meal before the match', '我想把铜梁观赛和当地美食安排在一起，怎样规划赛前用餐和前往场馆的时间？', 'How can I combine a football visit to Tongliang with local food and leave enough time to get to the venue?'),
        item('relax', '玄天湖全景航拍.jpeg', '🌊', '看完球，再给山水留点时间', 'Beyond the match', '看完球后想在铜梁再玩一天，怎样安排玄天湖等景点、休息和用餐？', 'I want to spend another day in Tongliang after a match. How can I combine Xuantian Lake, other sights, meals and rest?'),
        item('stay', '龙城天街连锁酒店-1.jpeg', '🛏️', '晚场不赶路，住一晚怎么选？', 'Stay after the final whistle', '如果在铜梁观看晚场比赛，怎样选择住宿位置并安排次日游玩，没有比赛时有哪些替代安排？', 'How should I choose accommodation for an evening match in Tongliang and plan the next day, including alternatives when no match is scheduled?')
      ]
    },
    nature: {
      icon: '🌿', label: { zh: '自然', en: 'Nature' }, accent: '#26746a',
      background: 'assets/玄天湖全景航拍.jpeg',
      zh: { lineOne: '向山水，慢一点', lineTwo: '在铜梁，自然自在', summary: '湖边散步、山间轻行、田园放空，找回周末的松弛。', gallery: '把湖光山色，装进这趟旅程' },
      en: { lineOne: 'Slow down outside', lineTwo: 'Naturally Tongliang', summary: 'Lakeside walks, easy hikes and countryside pauses.', gallery: 'Your scenic weekend escape' },
      items: [
        item('lake', '玄天湖全景航拍.jpeg', '🌊', '玄天湖不赶路，怎样慢慢逛？', 'Unwind at Xuantian Lake', '我想在玄天湖轻松散步观景，怎样安排路线、休息和附近用餐？', 'How can I plan a relaxed walk at Xuantian Lake with scenic stops, rest breaks and a meal nearby?'),
        item('ride', 'trip-cycling-hd.png', '🚲', '骑一小段，也算拥抱了周末', 'A gentle lakeside ride', '我想在玄天湖轻松骑行，不追求环完一圈，怎样选择路段、了解租车并安排休息？', 'How can I plan a short, easy ride at Xuantian Lake, check bike rental and choose rest stops without completing a full circuit?'),
        item('hike', 'trip-stone-scenic-hd.png', '🥾', '轻徒步，怎样走得舒服？', 'Take an easy hike', '想在铜梁安排轻徒步，有哪些适合的选择，怎样按体力安排时间、补给和休息？', 'What should I consider for an easy hike in Tongliang, including fitness, time, supplies and rest stops?'),
        item('bridge', '龙形浮桥.jpeg', '📸', '湖山之间，找一个拍照角度', 'Frame a lakeside moment', '我想在玄天湖拍摄湖景和龙形浮桥，怎样安排散步观景与拍照，并应对天气变化？', 'How can I combine walking and photography around Xuantian Lake and its dragon-shaped bridge while allowing for weather changes?')
      ]
    }
  };
  window.TongliangHomeThemeContent = { version: '20260910-v2', defaultTheme: 'all', themes };
})();
