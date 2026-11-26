(() => {
  'use strict';
  const api = globalThis.NatusDemo ??= {};

  const { formatLastInteraction } = api;

  const paths = {
    chat: '<path d="M4 5.5h16v10H9l-5 3v-13Z"/><path d="M8 9h8M8 12h5"/>',
    archive: '<rect x="4" y="5" width="16" height="4" rx="1"/><path d="M6 9v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9M10 13h4"/>',
    settings: '<path d="M5 7h14M5 12h14M5 17h14"/><circle fill="currentColor" cx="9" cy="7" r="1.7"/><circle fill="currentColor" cx="15" cy="12" r="1.7"/><circle fill="currentColor" cx="10" cy="17" r="1.7"/>',
    moon: '<path d="M20 14.6A8 8 0 0 1 9.4 4a8 8 0 1 0 10.6 10.6Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/>',
    back: '<path d="m11 5-7 7 7 7M4 12h16"/>',
    info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5m0-8v.1"/>',
    more: '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
    smile: '<circle cx="12" cy="12" r="8"/><path d="M8 14c1 3 7 3 8 0M9.5 10v.1m5 0v.1"/>',
    clip: '<path d="m9 13 5.6-5.6a2 2 0 0 1 2.8 2.8l-6.7 6.7a3.5 3.5 0 0 1-5-5l7-7a5 5 0 0 1 7.1 7.1l-6.7 6.7"/>',
    file: '<path d="M7 4h7l4 4v12H7zM14 4v5h4m-8 4h5m-5 3h5"/>',
    send: '<path d="m4 5 16 7-16 7 3-7-3-7Zm3 7h13"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    star: '<path d="m12 4 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.6-5 2.6.9-5.6-4-4 5.6-.8Z"/>',
  };

  function icon(name, size = 20) {
    return `<svg aria-hidden="true" focusable="false" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  }

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  const normalize = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');

  const dayLabel = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' });
  const timeLabel = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const statuses = { pending: 'Pendente', human: 'Em atendimento humano', bot: 'Com o Natus', closed: 'Encerrada' };

  function time(date) {
    return date ? timeLabel.format(new Date(date)) : '';
  }

  function avatar(chat) {
    const initials = chat.initials || chat.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
    return `<span class="avatar" data-tone="${escapeHtml(chat.tone)}" aria-hidden="true">
      ${escapeHtml(initials)}
      ${chat.photoUrl ? `<img src="${escapeHtml(chat.photoUrl)}" alt="" data-contact-photo>` : ''}
    </span>`;
  }

  function queueItem(chat, selected) {
    const display = formatLastInteraction(chat.updatedAt);
    return `<button class="queue-row" type="button" data-id="${escapeHtml(chat.id)}" aria-pressed="${selected}">
      ${avatar(chat)}
      <span class="queue-copy"><span class="queue-name"><strong>${escapeHtml(chat.name)}</strong>${chat.favorite ? icon('star', 13) : ''}</span>
      <span class="preview">${escapeHtml(chat.latest || 'Sem mensagens')}</span></span>
      <span class="queue-meta">${display ? `<time datetime="${escapeHtml(chat.updatedAt)}">${display}</time>` : ''}
      ${chat.unread ? `<span class="unread" aria-label="${chat.unread === 1 ? '1 mensagem não lida' : `${chat.unread} mensagens não lidas`}">${chat.unread}</span>` : ''}</span>
    </button>`;
  }

  function renderMessages(conversation, messages) {
    let previousDay;
    if (!messages.length) return '<p class="chat-day">Nenhuma mensagem para mostrar.</p>';
    return messages.map(message => {
      const day = dayLabel.format(new Date(message.at));
      const divider = day === previousDay ? '' : `<p class="chat-day">${day}</p>`;
      previousDay = day;
      const author = message.actor === 'client' ? conversation.name : message.actor === 'bot' ? 'Natus' : 'Equipe Natu Vale';
      return `${divider}<div class="message${message.actor === 'client' ? '' : ' out'}">
        <span class="message-author">${escapeHtml(author)}</span>
        ${message.text ? `<p class="message-text">${escapeHtml(message.text)}</p>` : ''}
        ${message.attachment ? `<span class="message-file">${icon('file', 18)}${escapeHtml(message.attachment.name)}</span>` : ''}
        <time datetime="${escapeHtml(message.at)}">${time(message.at)}</time>
      </div>`;
    }).join('');
  }

  Object.assign(api, { avatar, escapeHtml, icon, normalize, queueItem, renderMessages, statuses });
})();
