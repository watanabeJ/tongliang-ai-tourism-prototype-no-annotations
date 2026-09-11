(function () {
  const routes = {
    login: 'login.html',
    register: 'register.html',
    onboarding: 'onboarding.html',
    success: 'onboarding-success.html',
    workbench: 'workbench.html',
    knowledge: 'knowledge.html',
    knowledgeImport: 'knowledge-import.html',
    knowledgeImportRelations: 'knowledge-import-relations.html',
    personal: 'personal-center.html',
    storeInfo: 'store-info.html',
    storeProductAdd: 'store-product-add.html',
    profile: 'merchant-profile.html',
    changePassword: 'change-password.html'
  };

  const pageParams = new URLSearchParams(window.location.search);
  const currentReviewQuery = pageParams.get('review');
  const isWorkbenchPage = window.location.pathname.endsWith('/workbench.html');

  if (isWorkbenchPage) {
    if (pageParams.get('testData') === 'reset') {
      window.localStorage.removeItem('tlAssistantTasks');
      window.localStorage.removeItem('tlAssistantStarted');
      window.localStorage.removeItem('tlAssistantLastUpdated');
      pageParams.delete('testData');
      const cleanQuery = pageParams.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}${window.location.hash}`);
    }

    const restoreKey = 'tlAssistantRestorePending-20260828-1';
    if (window.localStorage.getItem(restoreKey) !== 'true') {
      const taskState = JSON.parse(window.localStorage.getItem('tlAssistantTasks') || '{}');
      delete taskState.hours;
      delete taskState.address;
      window.localStorage.setItem('tlAssistantTasks', JSON.stringify(taskState));
      window.localStorage.setItem(restoreKey, 'true');
    }
  }

  const go = (name) => {
    const [routeName, query] = String(name).split('?');
    let target = routes[routeName] || routeName;
    if (query) target += `?${query}`;
    if (routeName === 'profile' && currentReviewQuery && !query) target += `?review=${encodeURIComponent(currentReviewQuery)}`;
    window.location.href = target;
  };

  const toast = (message) => {
    const element = document.querySelector('[data-toast-root]');
    if (!element) return;
    window.clearTimeout(element._timer);
    element.textContent = message;
    element.classList.add('show');
    element._timer = window.setTimeout(() => element.classList.remove('show'), 2200);
  };

  const accountStorageKey = 'tlMerchantAccounts';
  const readMerchantAccounts = () => {
    try {
      const accounts = JSON.parse(window.localStorage.getItem(accountStorageKey) || '[]');
      return Array.isArray(accounts) ? accounts : [];
    } catch (error) {
      return [];
    }
  };

  document.querySelectorAll('input[name="phone"], input[name="contactPhone"]').forEach((input) => {
    input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 11); });
  });

  document.querySelector('[data-personal-help]')?.addEventListener('click', () => toast('使用指南即将上线'));
  document.querySelector('[data-personal-feedback]')?.addEventListener('click', () => toast('感谢反馈，我们会认真查看'));

  const knowledgeRows = document.querySelectorAll('[data-knowledge-row]');
  if (knowledgeRows.length) {
    const submittedKnowledge = JSON.parse(window.localStorage.getItem('tlAssistantTasks') || '{}');
    knowledgeRows.forEach((row) => {
      const status = row.querySelector('[data-knowledge-status]');
      const completed = Boolean(submittedKnowledge[row.dataset.knowledgeRow]);
      if (!status) return;
      status.textContent = completed ? '已完成' : '待补充';
      status.classList.toggle('is-complete', completed);
    });
  }

  const knowledgeTabs = document.querySelectorAll('[data-knowledge-tab]');
  if (knowledgeTabs.length) {
    const knowledgeSections = document.querySelectorAll('[data-knowledge-section]');
    knowledgeTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.knowledgeTab;
        knowledgeTabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        knowledgeSections.forEach((section) => {
          section.hidden = section.dataset.knowledgeSection !== key;
        });
      });
    });
  }

  const qaRows = document.querySelectorAll('[data-edit-qa]');
  if (qaRows.length) {
    const savedAnswers = JSON.parse(window.localStorage.getItem('tlKnowledgeQaAnswers') || '{}');
    const previousPetAnswer = '是的，我们非常欢迎体型较小的宠物。请确保它们在公共区域佩戴牵引。';
    if (savedAnswers.pets === previousPetAnswer) {
      delete savedAnswers.pets;
      window.localStorage.setItem('tlKnowledgeQaAnswers', JSON.stringify(savedAnswers));
    }
    const closeQaEditor = (row, restore = false) => {
      const editor = row?.querySelector('.knowledge-qa-editor');
      const display = row?.querySelector('.knowledge-qa-answer');
      if (restore && display && row.dataset.qaOriginal) display.textContent = row.dataset.qaOriginal;
      if (display) { display.contentEditable = 'false'; display.classList.remove('is-editing'); }
      if (editor) editor.hidden = true;
    };
    let pendingAiReview = null;
    qaRows.forEach((button) => {
      const row = button.closest('[data-knowledge-row]');
      const key = button.dataset.editQa;
      const display = row?.querySelector('.knowledge-qa-answer');
      if (display && savedAnswers[key]) display.textContent = savedAnswers[key];
      const beginEdit = () => {
        const editor = row?.querySelector('.knowledge-qa-editor');
        if (!display || !editor) return;
        row.dataset.qaOriginal = display.textContent.trim();
        display.contentEditable = 'true';
        display.classList.add('is-editing');
        editor.hidden = false;
        display.focus();
      };
      button.addEventListener('click', (event) => { event.stopPropagation(); beginEdit(); });
      row?.addEventListener('click', (event) => { if (event.target.closest('button')) return; const editor = row.querySelector('.knowledge-qa-editor'); if (editor?.hidden) beginEdit(); });
    });
    document.querySelectorAll('[data-save-qa]').forEach((button) => button.addEventListener('click', (event) => {
      event.stopPropagation();
      const row = button.closest('[data-knowledge-row]');
      const key = button.dataset.saveQa;
      const display = row?.querySelector('.knowledge-qa-answer');
      const value = display?.textContent.trim();
      if (!display || !value) { toast('请先填写答案'); return; }
      if (key === 'pets') {
        pendingAiReview = { row, key, display, value };
        openModal('knowledge-ai-review-modal');
        return;
      }
      display.textContent = value; savedAnswers[key] = value;
      window.localStorage.setItem('tlKnowledgeQaAnswers', JSON.stringify(savedAnswers));
      closeQaEditor(row); toast('答案已保存');
    }));
    document.querySelector('[data-knowledge-ai-accept]')?.addEventListener('click', () => {
      if (!pendingAiReview) return;
      const suggested = document.querySelector('.knowledge-ai-review-copy')?.textContent.trim();
      if (suggested) {
        pendingAiReview.display.textContent = suggested;
        savedAnswers[pendingAiReview.key] = suggested;
        window.localStorage.setItem('tlKnowledgeQaAnswers', JSON.stringify(savedAnswers));
      }
      closeQaEditor(pendingAiReview.row);
      closeModal(document.getElementById('knowledge-ai-review-modal'));
      pendingAiReview = null;
      toast('答案已保存');
    });
    document.querySelector('[data-knowledge-ai-edit]')?.addEventListener('click', () => {
      const review = pendingAiReview;
      closeModal(document.getElementById('knowledge-ai-review-modal'));
      pendingAiReview = null;
      if (review?.display) {
        review.display.contentEditable = 'true';
        review.display.classList.add('is-editing');
        review.display.focus();
      }
    });
    document.querySelectorAll('[data-cancel-qa]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); closeQaEditor(button.closest('[data-knowledge-row]'), true); }));
  }

  const factRows = document.querySelectorAll('[data-edit-fact]');
  if (factRows.length) {
    const savedFacts = JSON.parse(window.localStorage.getItem('tlKnowledgeFacts') || '{}');
    const closeFactEditor = (row, restore = false) => {
      const editor = row?.querySelector('.knowledge-fact-editor');
      const display = row?.querySelector('.knowledge-fact-value');
      if (restore && display && row.dataset.factOriginal) display.textContent = row.dataset.factOriginal;
      if (display) { display.contentEditable = 'false'; display.classList.remove('is-editing'); }
      if (editor) editor.hidden = true;
    };
    factRows.forEach((button) => {
      const row = button.closest('[data-knowledge-row]');
      const key = button.dataset.editFact;
      const display = row?.querySelector('.knowledge-fact-value');
      if (display && savedFacts[key]) display.textContent = savedFacts[key];
      const beginEdit = () => {
        const editor = row?.querySelector('.knowledge-fact-editor');
        if (!display || !editor) return;
        row.dataset.factOriginal = display.textContent.trim();
        display.contentEditable = 'true';
        display.classList.add('is-editing');
        editor.hidden = false;
        display.focus();
      };
      button.addEventListener('click', (event) => { event.stopPropagation(); beginEdit(); });
      row?.addEventListener('click', (event) => { if (event.target.closest('button')) return; const editor = row.querySelector('.knowledge-fact-editor'); if (editor?.hidden) beginEdit(); });
    });
    document.querySelectorAll('[data-save-fact]').forEach((button) => button.addEventListener('click', (event) => {
      event.stopPropagation();
      const row = button.closest('[data-knowledge-row]');
      const key = button.dataset.saveFact;
      const display = row?.querySelector('.knowledge-fact-value');
      const value = display?.textContent.trim();
      if (!display || !value) { toast('请先填写内容'); return; }
      display.textContent = value; savedFacts[key] = value;
      window.localStorage.setItem('tlKnowledgeFacts', JSON.stringify(savedFacts));
      closeFactEditor(row); toast('内容已保存');
    }));
    document.querySelectorAll('[data-cancel-fact]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); closeFactEditor(button.closest('[data-knowledge-row]'), true); }));
  }

  const managedCards = document.querySelectorAll('[data-managed-key]');
  if (managedCards.length) {
    const managedStore = JSON.parse(window.localStorage.getItem('tlKnowledgeManaged') || '{}');
    const importedManaged = JSON.parse(window.localStorage.getItem('tlKnowledgeManagedImports') || '[]');
    const managedList = document.querySelector('.knowledge-managed-list');
    importedManaged.forEach((item) => {
      if (!managedList || managedList.querySelector(`[data-managed-key="${item.id}"]`)) return;
      const card = document.createElement('article');
      card.className = 'knowledge-managed-card';
      card.dataset.managedKey = item.id;
      card.innerHTML = '<div class="knowledge-managed-head"><strong data-managed-title></strong><span>来源：添加知识内容</span></div><p data-managed-content></p><button class="knowledge-managed-edit" type="button" data-managed-edit aria-label="修改导入知识"><i data-lucide="pencil"></i></button><div class="knowledge-managed-actions" hidden><button class="button primary" type="button" data-managed-save>保存</button><button class="button ghost" type="button" data-managed-cancel>取消</button></div>';
      card.querySelector('[data-managed-title]').textContent = item.title;
      card.querySelector('[data-managed-content]').textContent = item.content;
      managedList.append(card);
    });
    window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true' } });
    const allManagedCards = document.querySelectorAll('[data-managed-key]');
    allManagedCards.forEach((card) => {
      const key = card.dataset.managedKey;
      const title = card.querySelector('[data-managed-title]');
      const content = card.querySelector('[data-managed-content]');
      if (managedStore[key] && title && content) { title.textContent = managedStore[key].title; content.textContent = managedStore[key].content; }
      card.querySelector('[data-managed-edit]')?.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!title || !content) return;
        card.dataset.managedOriginalTitle = title.textContent;
        card.dataset.managedOriginalContent = content.textContent;
        title.contentEditable = 'true';
        content.contentEditable = 'true';
        card.querySelector('[data-managed-edit]').hidden = true;
        card.querySelector('.knowledge-managed-actions').hidden = false;
        title.focus();
      });
      card.querySelector('[data-managed-save]')?.addEventListener('click', () => {
        const nextTitle = title?.textContent.trim();
        const nextContent = content?.textContent.trim();
        if (!nextTitle || !nextContent) { toast('请先填写完整内容'); return; }
        managedStore[key] = { title: nextTitle, content: nextContent };
        window.localStorage.setItem('tlKnowledgeManaged', JSON.stringify(managedStore));
        title.contentEditable = 'false'; content.contentEditable = 'false';
        card.querySelector('[data-managed-edit]').hidden = false;
        card.querySelector('.knowledge-managed-actions').hidden = true;
        toast('内容已保存');
      });
      card.querySelector('[data-managed-cancel]')?.addEventListener('click', () => {
        if (title) title.textContent = card.dataset.managedOriginalTitle || title.textContent;
        if (content) content.textContent = card.dataset.managedOriginalContent || content.textContent;
        title.contentEditable = 'false'; content.contentEditable = 'false';
        card.querySelector('[data-managed-edit]').hidden = false;
        card.querySelector('.knowledge-managed-actions').hidden = true;
      });
    });
  }

  const storeFields = document.querySelectorAll('[data-edit-store-field]');
  if (storeFields.length) {
    const savedStoreInfo = JSON.parse(window.localStorage.getItem('tlStoreInfo') || '{}');
    Object.entries(savedStoreInfo).forEach(([key, value]) => {
      const row = document.querySelector(`[data-store-field="${key}"]`);
      const display = row?.querySelector('[data-store-value], .store-info-value');
      const input = row?.querySelector('.store-info-editor input:not([type="file"]), .store-info-editor textarea');
      if (row && display && input && typeof value === 'string') {
        display.textContent = value || '未填写';
        input.value = value;
      }
    });
    const closeEditor = (row) => {
      const editor = row?.querySelector('.store-info-editor');
      if (editor) editor.hidden = true;
    };
    storeFields.forEach((button) => {
      button.addEventListener('click', () => {
        const row = button.closest('[data-store-field]');
        const editor = row?.querySelector(`[data-store-editor="${button.dataset.editStoreField}"]`);
        if (editor) editor.hidden = false;
      });
    });
    document.querySelectorAll('[data-cancel-store-field]').forEach((button) => {
      button.addEventListener('click', () => closeEditor(button.closest('[data-store-field]')));
    });
    document.querySelectorAll('[data-save-store-field]').forEach((button) => {
      button.addEventListener('click', () => {
        const row = button.closest('[data-store-field]');
        const input = row?.querySelector('.store-info-editor input:not([type="file"]), .store-info-editor textarea');
        const display = row?.querySelector('.store-info-value');
        const value = input?.value.trim();
        const field = row?.dataset.storeField;
        const requiredFields = ['name', 'address', 'intro'];
        if (!row || !input || !display) return;
        if (!value && requiredFields.includes(field)) { toast('请先填写内容'); return; }
        if (field === 'meituanAddress' && value) {
          try {
            const url = new URL(value);
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol');
          } catch (error) {
            toast('请输入正确的 http/https 链接');
            return;
          }
        }
        display.textContent = value || '未填写';
        savedStoreInfo[row.dataset.storeField] = value;
        window.localStorage.setItem('tlStoreInfo', JSON.stringify(savedStoreInfo));
        closeEditor(row);
        toast('已保存');
      });
    });
    const coverRow = document.querySelector('[data-store-field="cover"]');
    const cover = coverRow?.querySelector('[data-store-cover]');
    const coverInput = coverRow?.querySelector('[data-store-cover-input]');
    coverInput?.addEventListener('change', () => {
      const file = coverInput.files?.[0];
      if (!file || !cover) return;
      cover.src = URL.createObjectURL(file);
      cover.hidden = false;
      toast('门头照已更新');
    });
    coverRow?.querySelector('[data-delete-store-cover]')?.addEventListener('click', () => {
      if (cover) cover.hidden = true;
      if (coverInput) coverInput.value = '';
      toast('门头照已删除，请重新上传');
    });
  }

  const profileContact = document.querySelector('[data-profile-contact]');
  if (profileContact) {
    const contactStorageKey = 'tlMerchantContact';
    const contactEditor = profileContact.querySelector('[data-profile-contact-editor]');
    const contactDisplay = profileContact.querySelector('[data-profile-contact-display]');
    const contactNameInput = profileContact.querySelector('[aria-label="联系人姓名"]');
    const contactPhoneInput = profileContact.querySelector('[aria-label="联系人电话"]');
    let savedContact = { name: '王女士', phone: '13800001234' };
    try {
      savedContact = { ...savedContact, ...JSON.parse(window.localStorage.getItem(contactStorageKey) || '{}') };
    } catch (error) {
      window.localStorage.removeItem(contactStorageKey);
    }
    const maskContactPhone = (phone) => {
      const compact = String(phone || '').replace(/\s+/g, '');
      return compact.length >= 7 ? `${compact.slice(0, 3)}****${compact.slice(-4)}` : compact;
    };
    const renderContact = () => {
      if (contactDisplay) contactDisplay.textContent = `${savedContact.name} · ${maskContactPhone(savedContact.phone)}`;
      if (contactNameInput) contactNameInput.value = savedContact.name;
      if (contactPhoneInput) contactPhoneInput.value = savedContact.phone;
    };
    renderContact();
    profileContact.querySelector('[data-edit-profile-contact]')?.addEventListener('click', () => {
      if (contactEditor) contactEditor.hidden = false;
    });
    profileContact.querySelector('[data-cancel-profile-contact]')?.addEventListener('click', () => {
      renderContact();
      if (contactEditor) contactEditor.hidden = true;
    });
    profileContact.querySelector('[data-save-profile-contact]')?.addEventListener('click', () => {
      const name = contactNameInput?.value.trim();
      const phone = contactPhoneInput?.value.trim();
      if (!name || !phone) { toast('请填写联系人和电话'); return; }
      savedContact = { name, phone };
      window.localStorage.setItem(contactStorageKey, JSON.stringify(savedContact));
      renderContact();
      if (contactEditor) contactEditor.hidden = true;
      toast('联系人信息已保存');
    });
  }

  const storeTabButtons = document.querySelectorAll('[data-store-tab]');
  if (storeTabButtons.length) {
    const storeTabPanels = document.querySelectorAll('[data-store-tab-panel]');
    const activateStoreTab = (tabKey) => {
      storeTabButtons.forEach((item) => {
        const active = item.dataset.storeTab === tabKey;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      storeTabPanels.forEach((panel) => { panel.hidden = panel.dataset.storeTabPanel !== tabKey; });
    };
    storeTabButtons.forEach((button) => {
      button.addEventListener('click', () => activateStoreTab(button.dataset.storeTab));
    });
    if (pageParams.get('tab') === 'products') activateStoreTab('products');
  }

  const productStorageKey = 'tlStoreProducts';
  const readStoreProducts = () => {
    try {
      const products = JSON.parse(window.localStorage.getItem(productStorageKey) || '[]');
      return Array.isArray(products) ? products : [];
    } catch (error) {
      return [];
    }
  };

  const createProductRow = (label, value, options = {}) => {
    const row = document.createElement('div');
    row.className = `store-info-row${options.image ? ' store-product-image-row' : ''}`;
    const heading = document.createElement('div');
    heading.className = 'store-info-label';
    const title = document.createElement('strong');
    title.textContent = label;
    heading.appendChild(title);
    if (options.deleteId) {
      const deleteButton = document.createElement('button');
      deleteButton.className = 'store-product-delete';
      deleteButton.type = 'button';
      deleteButton.dataset.deleteStoreProduct = options.deleteId;
      deleteButton.setAttribute('aria-label', `删除${value}`);
      deleteButton.title = '删除';
      deleteButton.innerHTML = '<i data-lucide="trash-2"></i>';
      heading.appendChild(deleteButton);
    }
    row.appendChild(heading);
    if (options.image) {
      const image = document.createElement('img');
      image.src = options.image;
      image.alt = `${value}图片`;
      row.appendChild(image);
    } else if (options.link) {
      const link = document.createElement('a');
      link.className = 'store-product-link';
      link.href = value;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = value;
      row.appendChild(link);
    } else {
      const copy = document.createElement('p');
      copy.textContent = value;
      if (label === '商品价格') copy.className = 'store-product-price';
      row.appendChild(copy);
    }
    return row;
  };

  const productList = document.querySelector('[data-store-product-list]');
  if (productList) {
    if (window.localStorage.getItem('tlStoreDefaultProductDeleted') === 'true') {
      productList.querySelector('[data-store-product-card="default"]')?.remove();
    }
    readStoreProducts().forEach((product) => {
      const card = document.createElement('article');
      card.className = 'store-product-card panel';
      card.dataset.storeProductCard = product.id;
      card.appendChild(createProductRow('商品名称', product.name, { deleteId: product.id }));
      card.appendChild(createProductRow('商品图片', product.name, { image: product.image }));
      card.appendChild(createProductRow('商品简介', product.intro));
      card.appendChild(createProductRow('商品价格', `¥${String(product.price).replace(/^¥/, '')}`));
      card.appendChild(createProductRow('商品链接', product.link, { link: true }));
      productList.appendChild(card);
    });
    window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true' } });

    let pendingDeleteProductId = '';
    productList.addEventListener('click', (event) => {
      const deleteButton = event.target.closest('[data-delete-store-product]');
      if (!deleteButton) return;
      pendingDeleteProductId = deleteButton.dataset.deleteStoreProduct;
      openModal('store-product-delete-modal');
    });
    document.querySelector('[data-confirm-delete-store-product]')?.addEventListener('click', () => {
      if (!pendingDeleteProductId) return;
      if (pendingDeleteProductId === 'default') {
        window.localStorage.setItem('tlStoreDefaultProductDeleted', 'true');
      } else {
        const products = readStoreProducts().filter((product) => product.id !== pendingDeleteProductId);
        window.localStorage.setItem(productStorageKey, JSON.stringify(products));
      }
      productList.querySelector(`[data-store-product-card="${pendingDeleteProductId}"]`)?.remove();
      closeModal(document.getElementById('store-product-delete-modal'));
      pendingDeleteProductId = '';
      toast('商品已删除');
    });
  }

  const storeProductAddForm = document.querySelector('[data-store-product-add-form]');
  if (storeProductAddForm) {
    const productImageInput = storeProductAddForm.querySelector('[name="productImage"]');
    const productPreview = storeProductAddForm.querySelector('[data-store-product-preview]');
    let productImageData = '';
    productImageInput?.addEventListener('change', () => {
      const file = productImageInput.files?.[0];
      if (!file || !productPreview) return;
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        productImageData = String(reader.result || '');
        productPreview.src = productImageData;
        productPreview.hidden = false;
      });
      reader.readAsDataURL(file);
    });
    storeProductAddForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = storeProductAddForm.querySelector('[name="productName"]')?.value.trim();
      const intro = storeProductAddForm.querySelector('[name="productIntro"]')?.value.trim();
      const price = storeProductAddForm.querySelector('[name="productPrice"]')?.value.trim();
      const link = storeProductAddForm.querySelector('[name="productLink"]')?.value.trim();
      if (!name || !intro || !price || !link || !productImageData) { toast('请完整填写商品或套餐信息'); return; }
      const products = readStoreProducts();
      products.push({ id: `product-${Date.now()}`, name, image: productImageData, intro, price: price.replace(/^¥/, ''), link });
      try {
        window.localStorage.setItem(productStorageKey, JSON.stringify(products));
      } catch (error) {
        toast('图片过大，请选择更小的图片');
        return;
      }
      go('storeInfo');
    });
  }

  const markAssistantUpdated = () => {
    window.localStorage.setItem('tlAssistantLastUpdated', new Date().toISOString());
  };

  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const focusTarget = modal.querySelector('button');
    focusTarget?.focus();
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  document.addEventListener('click', (event) => {
    const toastButton = event.target.closest('[data-toast]');
    if (toastButton) {
      toast(toastButton.dataset.toast);
      if (toastButton.matches('button')) event.preventDefault();
      return;
    }

    const routeButton = event.target.closest('[data-route]');
    if (routeButton) {
      go(routeButton.dataset.route);
      return;
    }

    const backButton = event.target.closest('[data-back]');
    if (backButton) {
      if (backButton.dataset.back) go(backButton.dataset.back);
      else window.history.back();
      return;
    }

    const modalButton = event.target.closest('[data-open-modal]');
    if (modalButton) {
      openModal(modalButton.dataset.openModal);
      return;
    }

    const closeButton = event.target.closest('[data-close-modal]');
    if (closeButton) {
      closeModal(closeButton.closest('.modal-backdrop'));
      return;
    }

    const backdrop = event.target.closest('.modal-backdrop');
    if (backdrop && event.target === backdrop) closeModal(backdrop);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(closeModal);
    }
  });

  document.querySelectorAll('[data-toggle-password]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      button.setAttribute('aria-label', visible ? '显示密码' : '隐藏密码');
      button.innerHTML = `<i data-lucide="${visible ? 'eye' : 'eye-off'}" aria-hidden="true"></i>`;
      window.lucide?.createIcons();
    });
  });

  const loginForm = document.querySelector('[data-login-form]');
  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const phone = loginForm.querySelector('[name="phone"]').value.replace(/\s/g, '');
    // 原型演示直接进入工作台，不阻断于手机号、账号或密码校验。
    window.localStorage.setItem('tlMerchantCurrentPhone', phone || 'demo-merchant');
    go('workbench');
  });

  const registerForm = document.querySelector('[data-register-form]');
  registerForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const phone = registerForm.querySelector('[name="phone"]')?.value.trim() || '';
    // 原型演示直接进入商户资料提交页，不阻断于手机号、账号或密码校验。
    window.localStorage.setItem('tlMerchantCurrentPhone', phone || 'demo-merchant');
    window.localStorage.removeItem('tlMerchantProfileSubmitted');
    window.localStorage.removeItem('tlMerchantReviewState');
    toast('注册成功');
    window.setTimeout(() => go('onboarding'), 420);
  });

  const onboardingForm = document.querySelector('[data-onboarding-form]');
  if (onboardingForm) {
    const onboardingMaxFileSize = 2 * 1024 * 1024;
    const registeredPhone = window.localStorage.getItem('tlMerchantCurrentPhone');
    const contactPhone = onboardingForm.querySelector('[name="contactPhone"]');
    if (/^\d{11}$/.test(registeredPhone || '') && contactPhone) contactPhone.value = registeredPhone;
    const updateSubmitState = () => {
      const files = [...onboardingForm.querySelectorAll('input[type="file"]')];
      const contacts = [...onboardingForm.querySelectorAll('input[required]:not([type="file"])')];
      const complete = files.every((input) => input.files.length > 0) && contacts.every((input) => input.value.trim());
      const submit = onboardingForm.querySelector('[type="submit"]');
      if (submit) submit.disabled = !complete;
    };

    onboardingForm.querySelectorAll('input[type="file"]').forEach((input) => {
      input.addEventListener('change', () => {
        const tile = input.closest('.upload-tile');
        const state = tile?.querySelector('.upload-state');
        const preview = tile?.querySelector('.upload-preview');
        if (!input.files.length || !tile || !state || !preview) return;
        if (!preview.dataset.emptyMarkup) preview.dataset.emptyMarkup = preview.innerHTML;
        if (input.files[0].size > onboardingMaxFileSize) {
          if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
          delete preview.dataset.objectUrl;
          input.value = '';
          tile.classList.remove('selected');
          state.textContent = '上传';
          preview.innerHTML = preview.dataset.emptyMarkup;
          updateSubmitState();
          toast('文件大小不能超过2M');
          return;
        }
        tile.classList.add('selected');
        state.textContent = '重新上传';
        const image = document.createElement('img');
        image.alt = '';
        if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
        image.src = URL.createObjectURL(input.files[0]);
        preview.dataset.objectUrl = image.src;
        preview.replaceChildren(image);
        updateSubmitState();
      });
    });

    onboardingForm.querySelectorAll('input').forEach((input) => input.addEventListener('input', updateSubmitState));
    updateSubmitState();

    onboardingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const submit = onboardingForm.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = '正在提交...';
      window.setTimeout(() => {
        window.localStorage.setItem('tlMerchantProfileSubmitted', 'true');
        window.localStorage.setItem('tlMerchantReviewState', 'reviewing');
        go('profile');
      }, 650);
    });
  }

  document.querySelectorAll('[data-correction-form] .upload-tile input[type="file"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (!input.files.length) return;
      const tile = input.closest('.upload-tile');
      const state = tile?.querySelector('.upload-state');
      const preview = tile?.querySelector('.upload-preview');
      if (!tile || !state || !preview) return;
      tile.classList.add('selected');
      state.textContent = '重新上传';
      const image = document.createElement('img');
      image.alt = '';
      image.src = URL.createObjectURL(input.files[0]);
      preview.replaceChildren(image);
    });
  });

  document.querySelector('[data-enter-workbench]')?.addEventListener('click', () => go('workbench'));

  const reviewState = currentReviewQuery || window.localStorage.getItem('tlMerchantReviewState') || 'reviewing';
  const reviewCopy = {
    reviewing: { label: '审核中', help: '审核期间可正常使用', className: 'info' },
    approved: { label: '已通过', help: '查看已提交资料', className: 'success' },
    changes: { label: '需修改', help: '请按审核意见补充，不影响其他功能', className: 'warning' }
  };
  const currentReview = reviewCopy[reviewState] || reviewCopy.reviewing;

  document.querySelectorAll('[data-review-label]').forEach((element) => {
    element.textContent = currentReview.label;
    element.classList.remove('info', 'success', 'warning');
    element.classList.add(currentReview.className);
  });
  document.querySelectorAll('[data-review-help]').forEach((element) => {
    element.textContent = currentReview.help;
  });
  document.querySelectorAll('[data-review-current-title]').forEach((element) => {
    element.textContent = reviewState === 'changes' ? '部分资料需修改' : reviewState === 'approved' ? '资料审核已通过' : '平台审核中';
  });
  document.querySelectorAll('[data-review-current-help]').forEach((element) => {
    element.textContent = reviewState === 'changes' ? '审核意见已在下方展示' : reviewState === 'approved' ? '商户资料已完成审核' : '统一运营后台正在核对资料';
  });
  document.querySelectorAll('[data-review-changes-only]').forEach((element) => {
    element.hidden = reviewState !== 'changes';
  });

  document.querySelectorAll('[data-document-preview]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = document.getElementById('document-modal');
      const title = modal?.querySelector('[data-document-title]');
      if (title) title.textContent = button.dataset.documentPreview;
      openModal('document-modal');
    });
  });

  const correctionForm = document.querySelector('[data-correction-form]');
  correctionForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const file = correctionForm.querySelector('input[type="file"]');
    if (!file.files.length) {
      toast('请先上传清晰的经营许可证照片');
      return;
    }
    window.localStorage.setItem('tlMerchantReviewState', 'reviewing');
    openModal('correction-success-modal');
  });

  const passwordForm = document.querySelector('[data-password-form]');
  passwordForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const current = passwordForm.querySelector('[name="currentPassword"]').value;
    const next = passwordForm.querySelector('[name="newPassword"]').value;
    const confirmation = passwordForm.querySelector('[name="confirmPassword"]').value;
    if (!current) {
      toast('请输入当前密码');
      return;
    }
    const currentPhone = window.localStorage.getItem('tlMerchantCurrentPhone');
    const accounts = readMerchantAccounts();
    const account = accounts.find((item) => item.phone === currentPhone);
    if (!account || account.password !== current) {
      toast('当前密码不正确');
      return;
    }
    if (next.length < 6 || next.length > 20) {
      toast('新密码需要 6 至 20 位');
      return;
    }
    if (next !== confirmation) {
      toast('两次输入的新密码不一致');
      return;
    }
    account.password = next;
    account.passwordUpdatedAt = new Date().toISOString();
    window.localStorage.setItem(accountStorageKey, JSON.stringify(accounts));
    openModal('password-success-modal');
  });

  const assistantTaskData = {
    hours: { kind: '确认店铺信息', title: '国庆营业时间安排', prompt: '平台资料显示：每天 10:00—21:00\\n\\n国庆期间还是这样安排吗？', help: '尽量写清楚每天的时间，以及节假日是否有变化', type: 'info', placeholder: '请告诉我国庆期间的营业时间安排' },
    address: { kind: '确认店铺信息', title: '停车入口提示', prompt: '平台资料显示：从亚龙路侧进入地下/临街停车入口，入口距离门店约 80-150 米\\n\\n现在还是这样吗？', help: '请填写游客能顺利找到停车入口的详细提示', type: 'info', placeholder: '请告诉我现在的停车入口提示' },
    family: { kind: '回答游客问题', title: '带小孩来方便吗？', prompt: '游客经常会问：\\n“带小孩来方便吗？”\\n\\n你可以告诉我有没有儿童座椅、婴儿车放置空间或其他注意事项。', help: '说清楚“有没有、什么时候、有什么限制”就可以', type: 'question', placeholder: '例如：有儿童座椅，数量不多，建议提前电话预留' },
    parking: { kind: '回答游客问题', title: '停车是否方便？', prompt: '游客经常会问：\\n“停车是否方便？”\\n\\n告诉我到店停车的方式和需要注意的地方。', help: '说清楚停车位置、费用和游客需要注意的地方', type: 'question', placeholder: '例如：门店旁边有停车场，消费后可减免停车费' },
    booking: { kind: '回答游客问题', title: '需要提前预约吗？', prompt: '游客经常会问：\\n“需要提前预约吗？”\\n\\n告诉我是否需要预约，以及预约方式。', help: '说清楚是否需要预约、提前多久和联系方式', type: 'question', placeholder: '例如：平日不用预约，节假日建议提前一天电话预订' }
  };

  const workbenchTabs = document.querySelectorAll('[data-workbench-tab]');
  if (workbenchTabs.length) {
    const workbenchPanels = document.querySelectorAll('[data-workbench-panel]');
    const selectWorkbenchTab = (tabKey) => {
      workbenchTabs.forEach((tab) => {
        const active = tab.dataset.workbenchTab === tabKey;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      workbenchPanels.forEach((panel) => {
        const active = panel.dataset.workbenchPanel === tabKey;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    };
    workbenchTabs.forEach((tab) => tab.addEventListener('click', () => selectWorkbenchTab(tab.dataset.workbenchTab)));
    selectWorkbenchTab('insight');
  }

  const workbenchDrawer = document.querySelector('[data-assistant-drawer]');
  if (workbenchDrawer) {
    workbenchDrawer.hidden = false;
    workbenchDrawer.classList.add('open');
    window.localStorage.setItem('tlAssistantLastUpdated', new Date().toISOString());
    const submitted = JSON.parse(window.localStorage.getItem('tlAssistantTasks') || '{}');
    workbenchDrawer.querySelectorAll('[data-task-state]').forEach((state) => {
      if (submitted[state.dataset.taskState]) { state.textContent = '✓ 已提交'; state.classList.add('submitted'); }
    });

    const renderAssistantTab = (tabKey) => {
      const allRows = [...workbenchDrawer.querySelectorAll('[data-task-row]')];
      const completedCount = allRows.filter((row) => submitted[row.dataset.taskRow]).length;
      const pendingCount = allRows.length - completedCount;
      workbenchDrawer.querySelector('[data-assistant-count="pending"]')?.replaceChildren(`（${pendingCount}）`);
      workbenchDrawer.querySelector('[data-assistant-count="completed"]')?.replaceChildren(`（${completedCount}）`);
      workbenchDrawer.querySelectorAll('[data-assistant-tab]').forEach((tabButton) => {
        const active = tabButton.dataset.assistantTab === tabKey;
        tabButton.classList.toggle('active', active);
        tabButton.setAttribute('aria-selected', String(active));
      });
      workbenchDrawer.querySelectorAll('.assistant-drawer-section').forEach((section) => {
        const rows = [...section.querySelectorAll('[data-task-row]')];
        let visibleCount = 0;
        const caption = section.querySelector('[data-pending-caption]');
        if (caption) caption.textContent = caption.dataset[`${tabKey}Caption`];
        rows.forEach((row) => {
          const done = Boolean(submitted[row.dataset.taskRow]);
          const visible = tabKey === 'completed' ? done : !done;
          row.hidden = !visible;
          if (visible) visibleCount += 1;
          const state = row.querySelector('[data-task-state]');
          if (state) {
            state.textContent = done ? '✓ 已完成' : row.dataset.pendingLabel;
            state.classList.toggle('submitted', done);
          }
        });
        const empty = section.querySelector('[data-assistant-empty]');
        const list = section.querySelector('.assistant-drawer-list');
        if (list) list.hidden = visibleCount === 0;
        if (empty) {
          empty.hidden = visibleCount > 0;
          empty.textContent = tabKey === 'completed' ? '补充完成后会显示在这里' : '待补充内容已处理完';
        }
      });
    };

    workbenchDrawer.querySelectorAll('[data-assistant-tab]').forEach((tabButton) => {
      tabButton.addEventListener('click', () => renderAssistantTab(tabButton.dataset.assistantTab));
    });
    renderAssistantTab('pending');

  }

  const itemPage = document.querySelector('[data-assistant-item]');
  if (itemPage) {
    const taskKey = new URLSearchParams(window.location.search).get('task') || 'hours';
    const task = assistantTaskData[taskKey] || assistantTaskData.hours;
    itemPage.querySelector('[data-item-kind]').textContent = task.kind;
    itemPage.querySelector('[data-item-title]').textContent = task.title;
    itemPage.querySelector('[data-item-prompt]').textContent = task.prompt.replace(/\\n/g, '\n');
    itemPage.querySelector('[data-item-input]').placeholder = task.placeholder;
    itemPage.querySelector('[data-item-help]').textContent = task.help;
    const form = itemPage.querySelector('[data-item-form]');
    const choices = itemPage.querySelector('[data-item-choice-actions]');
    const submitActions = itemPage.querySelector('[data-item-submit-actions]');
    const input = itemPage.querySelector('[data-item-input]');
    if (task.type === 'question') {
      form.hidden = false;
      choices.hidden = true;
      submitActions.hidden = false;
      submitActions.classList.add('is-question');
      itemPage.querySelector('[data-item-submit]').textContent = '提交回答';
      itemPage.querySelector('[data-item-na]').hidden = false;
    }
    itemPage.querySelector('[data-item-accurate]')?.addEventListener('click', () => {
      const state = JSON.parse(window.localStorage.getItem('tlAssistantTasks') || '{}');
      state[taskKey] = true;
      window.localStorage.setItem('tlAssistantTasks', JSON.stringify(state));
      markAssistantUpdated();
      toast('已提交，平台审核后会更新给游客');
      window.setTimeout(() => go('workbench'), 420);
    });
    itemPage.querySelector('[data-item-edit]')?.addEventListener('click', () => {
      form.hidden = false;
      choices.hidden = true;
      submitActions.hidden = false;
      itemPage.querySelector('[data-item-submit]').textContent = '提交修改';
      itemPage.querySelector('[data-item-na]').hidden = true;
      input.focus();
    });
    itemPage.querySelector('[data-item-submit]')?.addEventListener('click', () => {
      if (!input.value.trim()) { toast(task.type === 'question' ? '请先填写一句话，或选择“不适用”' : '请填写现在的情况'); return; }
      const state = JSON.parse(window.localStorage.getItem('tlAssistantTasks') || '{}');
      state[taskKey] = true;
      window.localStorage.setItem('tlAssistantTasks', JSON.stringify(state));
      markAssistantUpdated();
      toast('已提交，平台审核后会更新给游客');
      window.setTimeout(() => go('workbench'), 420);
    });
    itemPage.querySelector('[data-item-na]')?.addEventListener('click', () => openModal('item-na-modal'));
    itemPage.querySelector('[data-item-confirm-na]')?.addEventListener('click', () => {
      const state = JSON.parse(window.localStorage.getItem('tlAssistantTasks') || '{}');
      state[taskKey] = true;
      window.localStorage.setItem('tlAssistantTasks', JSON.stringify(state));
      markAssistantUpdated();
      closeModal(document.getElementById('item-na-modal'));
      toast('已标记为不适用');
      window.setTimeout(() => go('workbench'), 420);
    });
  }

  const knowledgeImportModal = document.querySelector('[data-knowledge-import-modal]');
  const knowledgeParseProgress = knowledgeImportModal?.querySelector('[data-knowledge-parse-progress]');
  const knowledgeParseStatus = knowledgeImportModal?.querySelector('[data-knowledge-parse-status]');
  const knowledgeParseTitle = knowledgeImportModal?.querySelector('[data-knowledge-parse-title]');
  const knowledgeParseNote = knowledgeImportModal?.querySelector('[data-knowledge-parse-note]');
  const knowledgeParseResult = knowledgeImportModal?.querySelector('[data-knowledge-parse-result]');

  document.querySelector('[data-start-knowledge-processing]')?.addEventListener('click', () => {
    const authorization = document.querySelector('.knowledge-import-check input[type="checkbox"]');
    if (authorization && !authorization.checked) {
      toast('请先确认材料使用授权');
      return;
    }
    if (!knowledgeImportModal) return;
    if (knowledgeParseProgress) knowledgeParseProgress.style.width = '42%';
    if (knowledgeParseStatus) knowledgeParseStatus.textContent = '42% · 解析中';
    if (knowledgeParseTitle) knowledgeParseTitle.textContent = '正在解析资料';
    if (knowledgeParseNote) knowledgeParseNote.textContent = '正在提取品牌故事、菜品信息与场景事实。';
    if (knowledgeParseResult) knowledgeParseResult.hidden = true;
    knowledgeImportModal.hidden = false;
    window.setTimeout(() => {
      if (knowledgeParseProgress) knowledgeParseProgress.style.width = '100%';
      if (knowledgeParseStatus) knowledgeParseStatus.textContent = '100% · 已完成';
      if (knowledgeParseTitle) knowledgeParseTitle.textContent = '已生成待确认内容';
      if (knowledgeParseNote) knowledgeParseNote.textContent = '已识别 6 条候选知识，其中 2 条需要补充确认。';
      if (knowledgeParseResult) knowledgeParseResult.hidden = false;
    }, 900);
  });

  document.querySelector('[data-close-knowledge-import]')?.addEventListener('click', () => {
    if (knowledgeImportModal) knowledgeImportModal.hidden = true;
  });

  document.querySelectorAll('[data-relation-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const block = button.closest('.knowledge-relation-block');
      if (!block) return;
      const field = button.dataset.relationEdit;
      if (button.dataset.editing === 'true') {
        const editor = block.querySelector(`[data-relation-editor="${field}"]`);
        if (!editor) return;
        const target = document.createElement(field === 'title' ? 'strong' : 'p');
        target.dataset[field === 'title' ? 'relationTitle' : 'relationContent'] = '';
        target.textContent = editor.value.trim() || editor.dataset.previousValue || '';
        editor.replaceWith(target);
        button.textContent = field === 'title' ? '编辑标题' : '编辑内容';
        button.dataset.editing = 'false';
        return;
      }
      const target = block.querySelector(field === 'title' ? '[data-relation-title]' : '[data-relation-content]');
      if (!target) return;
      const editor = document.createElement(field === 'title' ? 'input' : 'textarea');
      editor.dataset.relationEditor = field;
      editor.value = target.textContent.trim();
      editor.dataset.previousValue = editor.value;
      target.replaceWith(editor);
      editor.focus();
      button.textContent = '完成';
      button.dataset.editing = 'true';
    });
  });

  document.querySelector('[data-confirm-knowledge-relations]')?.addEventListener('click', () => {
    const imported = [...document.querySelectorAll('.knowledge-relation-block')].map((block, index) => ({
      id: `imported-${Date.now()}-${index}`,
      title: block.querySelector('[data-relation-title]')?.textContent.trim() || '',
      content: block.querySelector('[data-relation-content]')?.textContent.trim() || '',
      source: '添加知识内容',
      status: '审核中',
      createdAt: new Date().toISOString()
    })).filter((item) => item.title && item.content);
    window.localStorage.setItem('tlKnowledgeManagedImports', JSON.stringify(imported));
    window.localStorage.setItem('tlKnowledgeImportAuditPending', 'true');
    window.localStorage.setItem('tlKnowledgeImportLastSubmitted', new Date().toISOString());
    toast('已提交 AI 审核');
    window.setTimeout(() => go('workbench?saved=knowledge'), 420);
  });

  document.querySelector('[data-logout]')?.addEventListener('click', () => {
    window.localStorage.removeItem('tlMerchantCurrentPhone');
    go('login');
  });

  window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true' } });
})();
