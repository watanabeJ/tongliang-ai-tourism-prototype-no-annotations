const periodData = {
  today: {
    label: '今日', usersTotal: '1,286', usersNew: '286', merchantsTotal: '156', merchantsNew: '12', negativeTotal: '18', hotTotal: '609',
    usersChange: '较上期 +12.4%', merchantsChange: '较上期 +20.0%', negativeChange: '较上期 +4 条',
    userPoints: '0,104 75,83 150,65 225,41 300,20', merchantPoints: '0,106 75,89 150,67 225,49 300,26', axis: ['08:00', '10:00', '12:00', '14:00', '16:00'],
    negative: [['停车不便', 39, '#c15b4e'], ['接驳等待', 28, '#e8986e'], ['餐饮价格', 17, '#f3bf7a'], ['其他', 16, '#dfe8e1']],
    hot: [['停车与接驳', 40, '#3c89a1'], ['火龙演出时间', 32, '#75ae9b'], ['亲子游路线', 28, '#e6b76d']],
    userSummary: '今日新增用户整体呈上升趋势，14:00 后增长更明显。', merchantSummary: '今日新增商户稳步增加，当前入驻速度较上期提升。', negativeSummary: '停车不便占比最高，建议优先核查重点景区停车容量与引导信息。', hotSummary: '用户提问中，停车与接驳关注度最高，其次为火龙演出时间和亲子游路线。',
    reportShort: '用户与商户保持增长，热点问题值得重点关注。', report: '今日用户新增 286 人，用户规模保持平稳增长；新增商户 12 家，入驻速度较上期提升。用户提问中热点问题共 609 次，停车与接驳关注度最高，建议优先跟进相关服务。'
  },
  week: {
    label: '本周', usersTotal: '5,874', usersNew: '1,138', merchantsTotal: '247', merchantsNew: '24', negativeTotal: '86', hotTotal: '2,846',
    usersChange: '较上周 +8.1%', merchantsChange: '较上周 +14.3%', negativeChange: '较上周 +11 条',
    userPoints: '0,99 50,82 100,91 150,59 200,70 250,41 300,17', merchantPoints: '0,108 50,85 100,94 150,67 200,78 250,48 300,25', axis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    negative: [['停车不便', 42, '#c15b4e'], ['接驳等待', 25, '#e8986e'], ['餐饮价格', 18, '#f3bf7a'], ['其他', 15, '#dfe8e1']],
    hot: [['停车与接驳', 38, '#3c89a1'], ['火龙演出时间', 34, '#75ae9b'], ['亲子游路线', 28, '#e6b76d']],
    userSummary: '本周用户新增量整体上升，周末增长最明显。', merchantSummary: '本周新增商户 24 家，周末入驻数量有所增加。', negativeSummary: '本周负面反馈主要集中在停车不便和接驳等待，两类合计占 67%。', hotSummary: '用户提问中，停车与接驳仍为首要热点，火龙演出时间关注度接近。',
    reportShort: '本周用户和商户持续增长，热点问题需要持续关注。', report: '本周用户新增 1,138 人，较上周保持增长；新增商户 24 家，餐饮和景区类商户入驻更活跃。用户提问中热点问题累计 2,846 次，停车与接驳关注度最高，建议本周优先协调相关服务资源。'
  },
  month: {
    label: '本月', usersTotal: '11,436', usersNew: '4,982', merchantsTotal: '298', merchantsNew: '86', negativeTotal: '324', hotTotal: '11,208',
    usersChange: '较上月 +10.6%', merchantsChange: '较上月 +9.0%', negativeChange: '较上月 -18 条',
    userPoints: '0,97 100,75 200,48 300,17', merchantPoints: '0,103 100,80 200,53 300,24', axis: ['第1周', '第2周', '第3周', '第4周'],
    negative: [['停车不便', 35, '#c15b4e'], ['接驳等待', 30, '#e8986e'], ['餐饮价格', 20, '#f3bf7a'], ['其他', 15, '#dfe8e1']],
    hot: [['停车与接驳', 36, '#3c89a1'], ['火龙演出时间', 36, '#75ae9b'], ['亲子游路线', 28, '#e6b76d']],
    userSummary: '本月用户新增量连续四周增长，整体趋势稳定。', merchantSummary: '本月新增商户 86 家，商户规模持续扩充。', negativeSummary: '本月负面反馈较上月减少 18 条，停车与接驳仍需持续改善。', hotSummary: '用户提问中，停车与接驳、火龙演出时间并列主要热点。',
    reportShort: '本月用户及商户规模持续扩大，热点问题保持活跃。', report: '本月用户新增 4,982 人，本月用户总量达到 11,436 人；新增商户 86 家，商户生态持续扩充。用户提问中热点问题共 11,208 次，停车与接驳和火龙演出时间关注度最高。'
  },
  all: {
    label: '全部', usersTotal: '12,860', usersNew: '12,860', merchantsTotal: '328', merchantsNew: '328', negativeTotal: '1,486', hotTotal: '48,920',
    usersChange: '平台累计用户', merchantsChange: '平台累计商户', negativeChange: '平台累计反馈',
    userPoints: '0,108 60,97 120,82 180,65 240,41 300,18', merchantPoints: '0,110 60,101 120,86 180,70 240,49 300,25', axis: ['3月', '4月', '5月', '6月', '7月', '8月'],
    negative: [['停车不便', 37, '#c15b4e'], ['接驳等待', 29, '#e8986e'], ['餐饮价格', 19, '#f3bf7a'], ['其他', 15, '#dfe8e1']],
    hot: [['停车与接驳', 37, '#3c89a1'], ['火龙演出时间', 35, '#75ae9b'], ['亲子游路线', 28, '#e6b76d']],
    userSummary: '平台累计用户 12,860 人，近六个月保持持续增长。', merchantSummary: '平台累计入驻商户 328 家，商户规模稳步扩大。', negativeSummary: '平台累计负面反馈主要集中在停车不便和接驳等待，两类合计占 66%。', hotSummary: '平台全部用户提问中，停车与接驳的关注度最高。',
    reportShort: '平台用户与商户规模持续增长，热点问题是长期重点。', report: '平台累计用户 12,860 人、商户 328 家，整体规模保持增长。用户提问中热点问题累计 48,920 次，停车与接驳关注度最高，建议持续优化重点景区交通服务与信息引导。'
  }
};
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
function showToast(message){const toast=$('[data-toast]');if(!toast)return;toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2000)}
function setText(selector,value){const element=$(selector);if(element)element.textContent=value}
function renderLine(kind,points){const line=$(`[data-line="${kind}"]`);const dot=$(`[data-dot="${kind}"]`);if(!line||!dot)return;line.setAttribute('points',points);const [x,y]=points.trim().split(' ').at(-1).split(',');dot.setAttribute('cx',x);dot.setAttribute('cy',y)}
function renderPie(kind,items){const pie=$(`[data-pie="${kind}"]`);const legend=$(`[data-pie-legend="${kind}"]`);if(!pie||!legend)return;let cursor=0;pie.style.background=`conic-gradient(${items.map(item=>{const start=cursor;cursor+=item[1];return `${item[2]} ${start}% ${cursor}%`}).join(',')})`;legend.innerHTML=items.map(item=>`<li><i style="background:${item[2]}"></i><span>${item[0]}</span><b>${item[1]}%</b></li>`).join('')}
function applyPeriod(period){const item=periodData[period];if(!item)return;$$('[data-period]').forEach(button=>{const active=button.dataset.period===period;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});['usersTotal','usersNew','merchantsTotal','merchantsNew','negativeTotal','hotTotal'].forEach(key=>$$(`[data-value="${key}"]`).forEach(element=>{element.textContent=item[key]}));setText('[data-change="users"]',item.usersChange);setText('[data-change="merchants"]',item.merchantsChange);setText('[data-change="negative"]',item.negativeChange);setText('[data-user-summary]',item.userSummary);setText('[data-merchant-summary]',item.merchantSummary);setText('[data-negative-summary]',item.negativeSummary);setText('[data-hot-summary]',item.hotSummary);setText('[data-report-short]',item.reportShort);setText('[data-report-copy]',item.report);setText('[data-report-title]',period==='all'?'平台运行报告':`${item.label}运行报告`);$$('[data-pie-period]').forEach(element=>{element.textContent=item.label});const trendLabel=period==='today'?'今日每 2 小时新增':period==='week'?'本周每日新增':period==='month'?'本月每周新增':'平台月度新增';setText('[data-trend-label]',trendLabel);renderLine('users',item.userPoints);renderLine('merchants',item.merchantPoints);$$('[data-axis="users"], [data-axis="merchants"]').forEach(axis=>{axis.innerHTML=item.axis.map(value=>`<span>${value}</span>`).join('')});renderPie('negative',item.negative);renderPie('hot',item.hot)}
const page=document.body.dataset.page;
const loginForm=$('[data-login-form]');loginForm?.addEventListener('submit',event=>{event.preventDefault();const account=loginForm.elements.namedItem('account').value.trim();const password=loginForm.elements.namedItem('password').value.trim();if(account!=='gov-demo'||password!=='123456')return showToast('账号或密码不正确');sessionStorage.setItem('government-auth','1');location.href='index.html'});
$$('[data-period]').forEach(button=>button.addEventListener('click',()=>applyPeriod(button.dataset.period)));$('[data-logout]')?.addEventListener('click',()=>{sessionStorage.removeItem('government-auth');location.href='login.html'});$('[data-regenerate]')?.addEventListener('click',()=>showToast('AI 总结已重新生成'));if(page!=='login')applyPeriod('today');
