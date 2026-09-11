(function () {
  const errors = {
    zh: {
      timeout: '回复超时，请稍后重试。', cancelled: '已停止生成，可以重试。',
      interrupted: '上次生成已中断，请重试。', rate_limited: '请求较多，请稍后重试。',
      not_configured: '智能体尚未配置，请检查本地服务。',
      upstream_auth: '模型服务认证失败，请检查服务端密钥。',
      route_place_unresolved: '部分所选地点没有唯一、同名的地图位置，暂不能生成可靠路线。请核对卡片地点或减少选择后重试，未使用演示点位代替。',
      route_not_configured: '道路规划服务尚未配置，暂不能生成地图路线。',
      route_unavailable: '未取得完整道路路线，本次没有绘制替代连线。请稍后重试。',
      route_answer_mismatch: '本次回复未通过路线一致性校验，未展示不一致的结果。请重试。',
      invalid_route_request: '请选取2至10个不同地点，暂按自驾规划。',
      route_duplicate_stop: '所选内容指向同一个地点，请去重后重新规划。',
      default: '暂时无法获得智能体回复，请重试。不会使用模拟回复替代。'
    },
    en: {
      timeout: 'The response timed out. Please retry.', cancelled: 'Generation stopped. You can retry.',
      interrupted: 'The previous response was interrupted. Please retry.', rate_limited: 'Too many requests. Please try again shortly.',
      not_configured: 'The agent is not configured. Please check the local service.',
      upstream_auth: 'Model authentication failed. Please check the server credentials.',
      route_place_unresolved: 'Some selected places could not be uniquely matched by name on the map. Check the places or reduce your selection and retry. No demo locations were substituted.',
      route_not_configured: 'The road routing service is not configured.',
      route_unavailable: 'A complete road route was not available. No substitute lines were drawn. Please retry.',
      route_answer_mismatch: 'The response failed the route consistency check and was not shown. Please retry.',
      invalid_route_request: 'Select 2–10 different places. Driving routes are currently supported.',
      route_duplicate_stop: 'Two selections refer to the same place. Remove the duplicate and retry.',
      default: 'The agent is unavailable. Please retry. No simulated answer will be substituted.'
    }
  };
  window.TongliangAgent = {
    errorText(code, language = 'zh') {
      const copy = errors[language] || errors.zh;
      return copy[code] || copy.default;
    },
    async request(payload, { signal } = {}) {
      const controller = new AbortController();
      const abort = () => controller.abort();
      let timedOut = false;
      const timer = setTimeout(() => { timedOut = true; controller.abort(); }, payload.routeRequest ? 180000 : 90000);
      signal?.addEventListener('abort', abort, { once: true });
      if (signal?.aborted) controller.abort();
      try {
        const response = await fetch('/api/consumer-agent/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin', signal: controller.signal,
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw Object.assign(new Error('Agent request failed'), { code: data.error });
        if (!data || typeof data.answer !== 'string' || !data.answer.trim() || typeof data.followUp !== 'string') throw new Error('Invalid agent response');
        return data;
      } catch (error) {
        if (controller.signal.aborted) throw Object.assign(new Error('Request aborted'), { code: timedOut ? 'timeout' : 'cancelled' });
        throw error;
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
      }
    }
  };
})();
