// Local prototype snapshot of the operations backend's carousel configuration.
// Each language has its own list, images, captions, prompts, order and topic bindings.
// prompt is the exact user question sent on click, not model behavior instructions.
// image is relative to the project root; caption is optional when the uploaded
// artwork already contains localized text. Do not use Chinese artwork as an
// English fallback. Replace this snapshot with published backend data on integration.
window.TongliangFeatureContent = {
  version: '20260909-v2',
  locales: {
    zh: [
      { id: 'lake', image: 'assets/feature-1.png', alt: '玄天湖', action: 'guide:xuantian-lake', prompt: '我想去玄天湖休闲游玩，怎样安排湖边散步、观景、休息和用餐？' },
      { id: 'weekend', image: 'assets/feature-2.png', alt: '周末到铜梁', action: 'guide:weekend', prompt: '我想去铜梁过周末，怎样安排兼顾山水、古城和本地美食的行程？' },
      { id: 'cycling', image: 'assets/feature-3.png', alt: '玄天湖骑行', action: 'guide:xuantian-lake-ride', prompt: '我想去玄天湖骑行，怎样安排骑行、了解租车方式，以及骑行后的休息和用餐？' },
      { id: 'terraces', image: 'assets/feature-4.png', alt: '铜梁特色推荐 4', action: 'journey:event', prompt: '我想欣赏铜梁的田园风光，有哪些适合观景、拍照和慢游的地方，怎样安排行程？' },
      { id: 'ancient-town', image: 'assets/feature-5.png', alt: '铜梁特色推荐 5', action: 'journey:food', prompt: '我想去安居古城，怎样安排老街慢逛、文化景点和当地小吃体验？' },
      { id: 'temple', image: 'assets/feature-6.png', alt: '铜梁特色推荐 6', action: 'journey:boat', prompt: '我想了解铜梁的古寺文化，有哪些适合参观的地方，怎样安排游览和休息？' },
      { id: 'mountains', image: 'assets/feature-7.png', alt: '铜梁特色推荐 7', action: 'journey:local-03', prompt: '我想在铜梁看山景和轻徒步，有哪些路线选择，怎样安排体力、时间和补给？' },
      { id: 'food', image: 'assets/feature-8.png', alt: '铜梁特色推荐 8', action: 'journey:local-18', prompt: '我想品尝铜梁本地美食，有哪些特色菜值得尝试，怎样与附近游玩安排衔接？' },
      { id: 'local-flavors', image: 'assets/feature-9.png', alt: '铜梁特色推荐 9', action: 'journey:local-10', prompt: '铜梁有哪些有代表性的本地风味和小吃，适合在哪里体验或购买伴手礼？' }
    ],
    en: [
      { id: 'lake', image: 'assets/玄天湖全景航拍.jpeg', alt: 'Xuantian Lake', caption: 'Xuantian Lake', action: 'guide:xuantian-lake', prompt: 'Can you suggest a relaxed visit to Xuantian Lake, including scenic walks, places to rest and meal options?' },
      { id: 'cycling', image: 'assets/trip-cycling-hd.png', alt: 'Cycle by the lake', caption: 'Cycle by the lake', action: 'guide:xuantian-lake-ride', prompt: 'I would like to cycle around Xuantian Lake. How should I plan the ride, check bicycle rental options and arrange a rest and meal afterwards?' },
      { id: 'fire-dragon', image: 'assets/火龙铁花.png', alt: 'Fire dragon nights', caption: 'Fire dragon nights', action: 'journey:event', prompt: 'I would like to watch a Tongliang fire dragon performance at night. How can I check the schedule and tickets, choose a viewing spot and plan my evening?' },
      { id: 'weekend', image: 'assets/trip-day-tour-hd.png', alt: 'Your weekend escape', caption: 'Your weekend escape', action: 'guide:weekend', prompt: 'Can you plan a weekend in Tongliang combining lakes and mountains, an ancient town and local food?' },
      { id: 'hiking', image: 'assets/trip-stone-scenic-hd.png', alt: 'Take the scenic trail', caption: 'Take the scenic trail', action: 'journey:local-12', prompt: 'I would like a scenic hike in Tongliang. Which trails should I consider, and how should I plan the walking time, rest stops and supplies?' },
      { id: 'hotpot', image: 'assets/湖景火锅.jpeg', alt: 'Hotpot with a view', caption: 'Hotpot with a view', action: 'journey:local-14', prompt: 'I would like to enjoy hotpot with a view of Xuantian Lake. What dining options, spice levels and nearby activities should I consider?' }
    ]
  }
};
