/* Curated public-source snapshots, not live availability. Shared by detail UI and server. */
(function (root) {
  const checkedAt = '2026-09-08';
  const source = (title, url, publishedAt = null) => ({ title, url, publishedAt, checkedAt });
  const cards = [
    {
      id: 'web:qihao', type: 'eat', name: '七号私厨', aliases: [],
      info: { address: '重庆市铜梁区淮远古韵北街7号', description: '铜梁网收录的淮远古韵餐饮店，经营江湖菜及汤锅。可作为城区游览中的正餐候选，口味、当日菜单及接待情况请到店前确认。', specialties: ['江湖菜', '汤锅', '城区正餐'] },
      sources: [source('铜梁网·七号私厨', 'https://cqtl.cn/life/detail/12449?id=7003')]
    },
    {
      id: 'web:chen-tihua-longcheng', type: 'eat', name: '陈蹄花（龙城云洲店）', aliases: ['陈蹄花龙城云洲店'],
      info: { address: '重庆市铜梁区巴川街道龙门街229号附45号', description: '铜梁网收录的陈蹄花龙城云洲门店。请按本卡门店名称和地址核对位置，不与中兴东路的同名餐饮记录混用；菜品及价格以门店当日菜单为准。', specialties: ['蹄花餐饮', '龙城云洲门店', '正餐候选'] },
      sources: [source('铜梁网·陈蹄花（龙城云洲店）', 'https://cqtl.cn/life/detail/12876?id=7003')]
    },
    {
      id: 'web:yashe-sanhuoyuan', type: 'eat', name: '雅舍三活源特色菜馆', aliases: ['雅舍三活源'],
      info: { address: '重庆市铜梁区龙门街348号', description: '铜梁网介绍的特色菜馆，以鸡、鸭、鱼类川菜和江湖菜为主。适合在城区安排一顿地方风味正餐；“三活源”与“三活春油烧兔”是不同记录，请勿混淆。', specialties: ['川菜', '鸡鸭鱼特色菜', '江湖菜'] },
      sources: [source('铜梁网·雅舍三活源特色菜馆', 'https://cqtl.cn/life/detail/1953?id=7003')]
    },
    {
      id: 'web:holiday-inn-express', type: 'stay', name: '重庆铜梁智选假日酒店', aliases: ['铜梁智选假日酒店'],
      info: { address: '重庆市铜梁区迎春东街306号嘉利世纪广场C栋', description: 'IHG官网介绍的城区酒店，临近龙城天街商圈。酒店提供自助洗衣、健身及早餐空间，可作为城区购物与周边游之间的住宿候选；房态、房价和早餐权益以实际预订条款为准。', specialties: ['城区住宿', '自助洗衣', '健身空间'] },
      sources: [source('IHG·重庆铜梁智选假日酒店', 'https://www.ihg.com/holidayinnexpress/hotels/cn/zh/chongqing/ckgtl/hoteldetail')]
    },
    {
      id: 'web:vienna-wanda', type: 'stay', name: '维也纳国际酒店（重庆铜梁万达广场店）', aliases: ['铜梁维也纳国际酒店'],
      info: { address: '重庆市铜梁区金龙大道545号', description: '锦江酒店预订平台收录的铜梁万达广场店，位于铜梁新城片区。适合把城区住宿与商圈活动结合安排，具体房型、停车条件及入住政策需在预订时确认。', specialties: ['新城住宿', '商圈周边', '连锁酒店'] },
      sources: [source('锦江酒店·维也纳国际酒店重庆铜梁万达广场店', 'https://hotel.bestwehotel.com/HotelDetail?hotelId=WYN1481208')]
    },
    {
      id: 'web:hehe-homestay', type: 'stay', name: '荷和原乡民宿', aliases: [],
      info: { address: '重庆市铜梁区土桥镇庆林村22组6号', description: '铜梁网介绍的临湖民宿，位于土桥镇爱莲桥附近，设有以莲荷为主题的客房。本卡地址依据2024年卫生许可公示；适合与荷和原乡田园游结合，荷花景观有季节性，房态需另行确认。', specialties: ['临湖民宿', '莲荷主题', '田园休憩'] },
      sources: [source('铜梁网·荷和原乡民宿', 'https://cqtl.cn/life/detail/12356?id=7003'), source('铜梁区卫健委·公共场所卫生许可公示', 'https://www.cqstl.gov.cn/bm/qwsjkw_71116/zwgk_70831/fdzdgknr_70834/xzxk/bljg/202408/t20240823_13551207.html', '2024-08-23')]
    },
    {
      id: 'place:安居古城', type: 'tour', name: '安居古城', aliases: ['安居古镇'],
      info: { address: '重庆市铜梁区安居镇（琼江、涪江交汇处）', description: '依山傍水的历史古城，保留明清建筑、会馆与书院等文化景观。可围绕古街、会馆及江岸安排慢游，体验地方民俗；民俗表演并非随到随看，开放区域和活动安排请查询景区当日公告。', specialties: ['古街慢游', '会馆文化', '两江风光'] },
      sources: [source('新华网·铜梁发布：乘坐璧铜线周末到铜梁', 'https://cq.news.cn/20241227/5cd415673adb415b830983e8a9e80c39/c.html', '2024-12-27')]
    },
    {
      id: 'place:奇彩梦园', type: 'tour', name: '奇彩梦园', aliases: ['黄桷门奇彩梦园', '重庆铜梁黄桷门奇彩梦园'],
      info: { address: '重庆市铜梁区南城街道黄门村', description: '以季节花海和乡村休闲为特色的旅游园区。政府推介资料介绍了花卉观赏、采摘体验及乡村美食等内容，可作为亲子或周末游候选；花期、可参与项目、票价和演出场次均需当日确认。', specialties: ['季节花海', '乡村休闲', '亲子游览'] },
      sources: [source('重庆市政府·铜梁区春季赏花休闲游（内容回顾2023年线路）', 'https://www.cq.gov.cn/zjcq/cycq/jplyxl/xcy/202608/t20260826_15982899.html', '2026-08-26')]
    },
    {
      id: 'web:xinlu-farm', type: 'tour', name: '新陆有机农场', aliases: ['铜梁新陆有机农场'],
      info: { address: '重庆市铜梁区土桥镇庆林村', description: '政府乡村游线路中介绍的观光农场，结合果蔬种植、采摘与农业体验，设有瓜果观赏等内容。适合关注田园体验的家庭；“有机”为项目名称的一部分，不据此保证当前所有商品认证，采摘品种及接待安排需向农场确认。', specialties: ['果蔬采摘', '农业体验', '田园观光'] },
      sources: [source('重庆市政府·铜梁区春季赏花休闲游（内容回顾2023年线路）', 'https://www.cq.gov.cn/zjcq/cycq/jplyxl/xcy/202608/t20260826_15982899.html', '2026-08-26')]
    },
    {
      id: 'web:longcheng-shopping', type: 'shop', name: '龙城天街商圈', aliases: ['龙城天街'],
      info: { address: '重庆市铜梁区新城区龙城天街商圈（区域位置）', description: '铜梁城区的综合商圈，汇集购物中心、餐饮及休闲业态。可安排为湖山游前后的城区购物和正餐停留点；本卡指整个商圈，不是单一门店，具体目的地需在地图中选择。', specialties: ['城区购物', '餐饮休闲', '商圈漫逛'] },
      sources: [source('中央广电总台国际在线·铜梁龙城天街商圈开街', 'https://cq.cri.cn/chinanews/20190101/55891e81-a73a-fdb5-b201-1cc49008f52a.html', '2019-01-01'), source('华龙网·龙城天街商圈假日经济', 'https://www.cqnews.net/1/detail/1249409867946135552/web/content_1249409867946135552.html', '2024-06-10')]
    },
    {
      id: 'web:wanda-shopping', type: 'shop', name: '铜梁万达广场', aliases: [],
      info: { address: '重庆市铜梁区龙城天街商圈内（门牌待核对）', description: '位于龙城天街商圈的购物中心。当地报道介绍了服饰、影院、超市和餐饮等业态，可作为城区室内购物休闲候选；报道中的促销属于当时活动，不代表当前仍有效。', specialties: ['综合购物', '影院休闲', '餐饮配套'] },
      sources: [source('华龙网·龙城天街商圈假日经济', 'https://www.cqnews.net/1/detail/1249409867946135552/web/content_1249409867946135552.html', '2024-06-10')]
    },
    {
      id: 'web:wuyue-shopping', type: 'shop', name: '铜梁吾悦广场', aliases: ['重庆铜梁吾悦广场', '吾悦广场'],
      info: { address: '重庆市铜梁区民安路88号', description: '铜梁网收录的综合购物中心，涵盖服饰、美妆、家居、数码及餐饮休闲等类别。可作为家庭出游中安排购物与室内休息的候选，不预设当前品牌清单、优惠或营业时间。', specialties: ['综合购物', '家庭休闲', '餐饮配套'] },
      sources: [source('铜梁网·吾悦广场（民安路店）', 'https://cqtl.cn/life/detail/12883?id=7003'), source('华龙网·龙城天街商圈假日经济', 'https://www.cqnews.net/1/detail/1249409867946135552/web/content_1249409867946135552.html', '2024-06-10')]
    }
  ].map(card => ({
    ...card, merchant: card.name, checkedAt, images: [`../assets/researched-${card.type}.svg`],
    imageNote: '分类示意封面，非场所实拍', packages: [],
    visitNote: '公开资料整理于2026-09-08，不代表当前营业、库存或价格已核验。出发前请核对位置及接待安排。'
  }));
  if (typeof module === 'object' && module.exports) module.exports = cards;
  else root.TongliangResearchedCards = cards;
})(typeof window === 'object' ? window : globalThis);
