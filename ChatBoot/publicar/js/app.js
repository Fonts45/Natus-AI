(async () => {
  'use strict';

  const { createDemoGateway } = globalThis.NatusDemo;
  const { avatar, escapeHtml, icon, normalize, queueItem, renderMessages, statuses } = globalThis.NatusDemo;
  const { formatLastInteraction } = globalThis.NatusDemo;

  const gateway = createDemoGateway();
  const byId = id => document.getElementById(id);
  const app = byId('app');
  const queue = byId('queue');
  const timeline = byId('timeline');
  const composer = byId('composer');
  const input = byId('message');
  const dialog = byId('dialog');
  const dialogBody = byId('dialog-body');
  const attachmentInput = byId('attachment');
  const threadMenu = byId('thread-menu');
  const composerTools = byId('composer-tools');
  const theme = byId('theme');
  const mobile = matchMedia('(max-width: 690px)');
  const state = { selected: 'marina', section: 'inbox', filter: 'all', chats: [], thread: null, attachment: null };
  let toastTimer;
  let threadRequest = 0;
  let sending = false;

  for (const element of document.querySelectorAll('[data-icon]')) {
    element.insertAdjacentHTML('afterbegin', icon(element.dataset.icon));
  }

  function showToast(text) {
    const toast = byId('toast');
    clearTimeout(toastTimer);
    toast.textContent = text;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3400);
  }

  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    theme.innerHTML = icon(dark ? 'sun' : 'moon');
    theme.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
    try { localStorage.setItem('natus-interface-theme', dark ? 'dark' : 'light'); } catch {}
  }

  function isDark() {
    return document.documentElement.dataset.theme === 'dark';
  }

  let savedTheme;
  try { savedTheme = localStorage.getItem('natus-interface-theme'); } catch {}
  setTheme(savedTheme ? savedTheme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);

  function renderQueue() {
    const search = normalize(byId('search').value.trim());
    const archived = state.section === 'archived';
    const filtered = state.chats.filter(chat => {
      if (chat.archived !== archived) return false;
      if (search && !normalize([chat.name, chat.category, chat.latest].join(' ')).includes(search)) return false;
      if (state.filter === 'unread') return chat.unread > 0;
      if (state.filter === 'favorite') return chat.favorite;
      return true;
    });
    const previousScroll = queue.scrollTop;
    queue.innerHTML = filtered.length
      ? filtered.map(chat => queueItem(chat, chat.id === state.selected)).join('')
      : '<p class="empty-list">Nenhuma conversa encontrada.</p>';
    queue.scrollTop = previousScroll;
  }

  async function reloadQueue() {
    state.chats = await gateway.list();
    renderQueue();
  }

  function renderTimeline(scrollToBottom = false) {
    const thread = state.thread;
    if (!thread) return;
    const search = normalize(byId('find-message').value.trim());
    const messages = search
      ? thread.messages.filter(message => normalize([message.text, message.attachment?.name].join(' ')).includes(search))
      : thread.messages;
    const oldScroll = timeline.scrollTop;
    timeline.innerHTML = `<div class="timeline-inner">${renderMessages(thread, messages)}</div>`;
    timeline.scrollTop = scrollToBottom ? timeline.scrollHeight : oldScroll;
    byId('search-result').textContent = search ? `${messages.length} ${messages.length === 1 ? 'resultado' : 'resultados'}` : '';
  }

  function renderConversation(scrollToBottom = false) {
    const thread = state.thread;
    for (const id of ['conversation-head', 'conversation-foot', 'timeline']) byId(id).hidden = !thread;
    byId('workspace-empty').hidden = Boolean(thread);
    if (!thread) return;
    byId('contact').innerHTML = `${avatar(thread)}<div><h2 id="contact-title" tabindex="-1">${escapeHtml(thread.name)}</h2>
      <p class="contact-subtitle">${escapeHtml(thread.category)} · ${statuses[thread.status]}</p></div>`;
    byId('thread-actions').innerHTML = `
      <button type="button" data-action="favorite">${thread.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</button>
      <button type="button" data-action="unread">Marcar como não lida</button>
      <button type="button" data-action="archive">${thread.archived ? 'Desarquivar' : 'Arquivar conversa'}</button>
      <button type="button" data-action="human">${thread.status === 'human' ? 'Devolver ao Natus' : 'Assumir conversa'}</button>
      <button type="button" data-action="close">${thread.status === 'closed' ? 'Reabrir atendimento' : 'Encerrar atendimento'}</button>`;
    renderTimeline(scrollToBottom);
  }

  function setThreadSearch(open) {
    byId('thread-search').hidden = !open;
    byId('thread-search-toggle').setAttribute('aria-expanded', String(open));
    if (open) byId('find-message').focus();
    else byId('find-message').value = '';
  }

  function clearAttachment() {
    state.attachment = null;
    attachmentInput.value = '';
    byId('pending-attachment').replaceChildren();
    byId('pending-attachment').hidden = true;
  }

  async function openConversation(id, { navigate = true, read = true } = {}) {
    const request = ++threadRequest;
    state.selected = id;
    setThreadSearch(false);
    composer.reset();
    clearAttachment();
    threadMenu.open = false;
    composerTools.open = false;
    state.thread = id ? await gateway.conversation(id) : null;
    if (request !== threadRequest) return;
    if (read && state.thread?.unread) state.thread = await gateway.markRead(id);
    if (request !== threadRequest) return;
    renderConversation(true);
    if (navigate && state.thread) {
      app.dataset.view = 'chat';
      if (mobile.matches) byId('contact-title').focus();
    }
    await reloadQueue();
  }

  function showList({ focus = true } = {}) {
    app.dataset.view = 'list';
    if (!focus || !mobile.matches) return;
    const row = [...queue.querySelectorAll('[data-id]')].find(button => button.dataset.id === state.selected);
    (row || byId('search')).focus();
  }

  async function changeSection(section) {
    state.section = section;
    state.filter = 'all';
    byId('search').value = '';
    byId('inbox-title').textContent = section === 'archived' ? 'Arquivadas' : 'Atendimento';
    for (const button of document.querySelectorAll('[data-nav]')) {
      if (button.dataset.nav === section) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    for (const button of byId('filters').querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === 'all'));
    }
    if (state.thread && state.thread.archived !== (section === 'archived')) await openConversation(null);
    showList();
    renderQueue();
  }

  function showDialog(title, content) {
    byId('dialog-title').textContent = title;
    dialogBody.innerHTML = content;
    dialog.showModal();
  }

  theme.onclick = () => setTheme(!isDark());
  byId('profile').onclick = () => {
    const localPanel = ['/interface/', '/interface/index.html'].includes(location.pathname)
      ? '<a class="button" href="/">Abrir painel atual do ChatBoot</a>' : '';
    showDialog('Equipe Natu Vale', `<div class="dialog-stack"><p>Este ambiente usa conversas fictícias para testar a interface.</p>${localPanel}</div>`);
  };
  byId('close-dialog').onclick = () => dialog.close();
  dialog.onclick = event => { if (event.target === dialog) dialog.close(); };
  byId('back').onclick = () => showList();
  byId('search').oninput = renderQueue;
  byId('find-message').oninput = () => renderTimeline(true);

  for (const button of document.querySelectorAll('[data-nav]')) {
    button.onclick = () => {
      if (button.dataset.nav !== 'settings') return changeSection(button.dataset.nav);
      showDialog('Preferências', `<div class="dialog-stack"><p>Escolha o tema deste navegador.</p><button type="button" class="button" id="dialog-theme">Ativar modo ${isDark() ? 'claro' : 'escuro'}</button></div>`);
      byId('dialog-theme').onclick = event => {
        setTheme(!isDark());
        event.currentTarget.textContent = `Ativar modo ${isDark() ? 'claro' : 'escuro'}`;
      };
    };
  }

  byId('filters').onclick = event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    state.filter = button.dataset.filter;
    for (const item of byId('filters').querySelectorAll('button')) item.setAttribute('aria-pressed', String(item === button));
    renderQueue();
  };
  queue.onclick = event => {
    const row = event.target.closest('[data-id]');
    if (!row) return;
    if (state.selected === row.dataset.id && state.thread) {
      app.dataset.view = 'chat';
      if (state.thread.unread) openConversation(row.dataset.id);
      else if (mobile.matches) byId('contact-title').focus();
      return;
    }
    openConversation(row.dataset.id);
  };

  byId('new-chat').onclick = () => {
    showDialog('Nova conversa', '<form id="new-conversation-form"><label>Nome fictício<input name="name" autocomplete="off" maxlength="80" required></label><button type="submit" class="button">Criar conversa</button></form>');
    const form = byId('new-conversation-form');
    form.elements.name.focus();
    form.onsubmit = async event => {
      event.preventDefault();
      if (!form.elements.name.value.trim()) {
        form.elements.name.focus();
        return;
      }
      const chat = await gateway.create({ name: form.elements.name.value.trim() });
      dialog.close();
      await changeSection('inbox');
      await openConversation(chat.id);
    };
  };

  byId('thread-search-toggle').onclick = () => {
    setThreadSearch(byId('thread-search').hidden);
    renderTimeline(true);
  };

  byId('info').onclick = () => {
    const thread = state.thread;
    if (!thread) return;
    showDialog('Detalhes da conversa', `<div class="dialog-stack">
      <div class="contact">${avatar(thread)}<div><strong>${escapeHtml(thread.name)}</strong><p>${escapeHtml(thread.category)}</p></div></div>
      <p>Situação: ${statuses[thread.status]}</p>
      <p>Responsável: ${escapeHtml(thread.owner || 'Sem responsável')}</p>
      <p>${thread.kind === 'group' ? 'Grupo fictício' : 'Contato fictício'}</p>
      ${thread.kind === 'direct' ? `<label>Foto de teste<input id="demo-contact-photo" type="file" accept="image/jpeg,image/png,image/webp"></label>
      ${thread.photoUrl ? '<button type="button" class="button" id="remove-contact-photo">Remover foto</button>' : ''}` : ''}
    </div>`);
    const photoInput = byId('demo-contact-photo');
    if (!photoInput) return;
    const setPhoto = async photoUrl => {
      const updated = await gateway.update(thread.id, { photoUrl });
      if (state.selected === thread.id) {
        state.thread = updated;
        renderConversation();
      }
      await reloadQueue();
      if (thread.photoUrl) URL.revokeObjectURL(thread.photoUrl);
      dialog.close();
    };
    photoInput.onchange = async () => {
      const file = photoInput.files[0];
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        showToast('Escolha uma foto JPG, PNG ou WebP de até 5 MB.');
        photoInput.value = '';
        return;
      }
      await setPhoto(URL.createObjectURL(file));
    };
    const remove = byId('remove-contact-photo');
    if (remove) remove.onclick = () => setPhoto(null);
  };

  threadMenu.onclick = async event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    const chat = state.thread;
    if (!action || !chat) return;
    threadMenu.open = false;
    threadMenu.querySelector('summary').focus();
    const changes = {
      favorite: { favorite: !chat.favorite },
      unread: { unread: Math.max(1, chat.unread) },
      archive: { archived: !chat.archived },
      human: { status: chat.status === 'human' ? 'bot' : 'human', owner: chat.status === 'human' ? '' : 'Equipe Natu Vale' },
      close: { status: chat.status === 'closed' ? 'pending' : 'closed', owner: '' },
    };
    const updated = await gateway.update(chat.id, changes[action]);
    if (state.selected === chat.id) {
      state.thread = updated;
      if (action === 'archive' || action === 'unread') {
        showList({ focus: false });
        await openConversation(null);
        byId('search').focus();
      } else {
        renderConversation();
      }
    }
    await reloadQueue();
    const feedback = {
      favorite: updated.favorite ? 'Adicionada aos favoritos.' : 'Removida dos favoritos.',
      unread: 'Conversa marcada como não lida.',
      archive: updated.archived ? 'Conversa arquivada.' : 'Conversa desarquivada.',
      human: updated.status === 'human' ? 'Conversa assumida pela equipe.' : 'Conversa devolvida ao Natus.',
      close: updated.status === 'closed' ? 'Atendimento encerrado.' : 'Atendimento reaberto.',
    };
    showToast(feedback[action]);
  };

  function addToMessage(text) {
    const available = input.maxLength - input.value.length + input.selectionEnd - input.selectionStart;
    input.setRangeText(text.slice(0, available), input.selectionStart, input.selectionEnd, 'end');
    input.focus();
  }

  byId('replies').onclick = event => {
    const text = event.target.closest('[data-reply]')?.dataset.reply;
    if (text) addToMessage(text);
  };
  composerTools.onclick = event => {
    const emoji = event.target.closest('[data-emoji]')?.dataset.emoji;
    if (!emoji) return;
    composerTools.open = false;
    addToMessage(emoji);
  };
  document.addEventListener('click', event => {
    for (const menu of [threadMenu, composerTools]) {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || dialog.open) return;
    for (const menu of [threadMenu, composerTools]) {
      if (!menu.open) continue;
      menu.open = false;
      menu.querySelector('summary').focus();
      return;
    }
    if (!byId('thread-search').hidden) {
      setThreadSearch(false);
      renderTimeline(true);
      byId('thread-search-toggle').focus();
    }
  });

  document.addEventListener('error', event => {
    if (event.target.matches?.('img[data-contact-photo]')) event.target.hidden = true;
  }, true);

  byId('attach').onclick = () => {
    composerTools.open = false;
    composerTools.querySelector('summary').focus();
    attachmentInput.click();
  };
  attachmentInput.onchange = () => {
    const file = attachmentInput.files[0];
    if (!file) return;
    state.attachment = { name: file.name, size: file.size, type: file.type };
    const target = byId('pending-attachment');
    target.innerHTML = `${icon('file', 18)}<span>${escapeHtml(file.name)} · Simulação</span><button class="button" type="button">Remover</button>`;
    target.querySelector('button').onclick = clearAttachment;
    target.hidden = false;
  };
  input.onkeydown = event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      composer.requestSubmit();
    }
  };
  composer.onsubmit = async event => {
    event.preventDefault();
    if (sending || !state.thread) return;
    const text = input.value.trim();
    if (!text && !state.attachment) {
      input.focus();
      return;
    }
    sending = true;
    const send = composer.querySelector('.send');
    send.disabled = true;
    const id = state.selected;
    try {
      await gateway.send(id, { text, attachment: state.attachment });
      if (state.selected === id) {
        input.value = '';
        clearAttachment();
        state.thread = await gateway.conversation(id);
        setThreadSearch(false);
        renderConversation(true);
        input.focus();
      }
      await reloadQueue();
    } catch (error) {
      showToast(error.message || 'Não foi possível simular o envio.');
    } finally {
      sending = false;
      send.disabled = false;
    }
  };

  await openConversation(state.selected, { navigate: false, read: false });
  setInterval(() => {
    for (const timestamp of queue.querySelectorAll('time')) {
      timestamp.textContent = formatLastInteraction(timestamp.dateTime);
    }
  }, 60000);
})().catch(error => {
  console.error(error);
  document.getElementById('queue').textContent = 'Não foi possível carregar a demonstração.';
});
