(() => {
  'use strict';
  const api = globalThis.NatusDemo ??= {};

  const { createFixtures } = api;

  const statuses = new Set(['pending', 'human', 'bot', 'closed']);
  const actors = new Set(['client', 'agent', 'bot']);

  // This adapter can be replaced by another implementation of the same
  // asynchronous contract without coupling the interface to local demo state.
  function createDemoGateway() {
    const chats = new Map(createFixtures().map(chat => [chat.id, chat]));
    let sequence = 0;

    function requireChat(id) {
      const chat = chats.get(id);
      if (!chat) throw new Error('Conversa indisponível.');
      return chat;
    }

    async function list() {
      return [...chats.values()]
        .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))
        .map(({ messages, ...summary }) => summary);
    }

    async function conversation(id) {
      const chat = chats.get(id);
      return chat ? structuredClone(chat) : null;
    }

    async function send(id, { text = '', attachment, kind = 'agent' } = {}) {
      const chat = requireChat(id);
      const body = typeof text === 'string' ? text.trim().slice(0, 4096) : '';
      const file = typeof attachment?.name === 'string' && attachment.name.trim()
        ? structuredClone(attachment) : undefined;
      if (!body && !file) throw new Error('Escreva uma mensagem ou adicione um arquivo.');
      const actor = actors.has(kind) ? kind : 'agent';
      const at = new Date().toISOString();
      const message = { id: `demo-message-${++sequence}`, actor, text: body, at };
      if (file) message.attachment = file;
      chat.messages.push(message);
      chat.latest = body || file.name;
      chat.updatedAt = at;
      if (actor === 'client') chat.unread += 1;
      return structuredClone(message);
    }

    async function update(id, changes) {
      const chat = requireChat(id);
      for (const field of ['favorite', 'archived']) {
        if (typeof changes[field] === 'boolean') chat[field] = changes[field];
      }
      if (statuses.has(changes.status)) chat.status = changes.status;
      if (typeof changes.owner === 'string' || changes.owner === null) chat.owner = changes.owner;
      if (changes.photoUrl === null || (typeof changes.photoUrl === 'string' && changes.photoUrl.startsWith('blob:'))) {
        chat.photoUrl = changes.photoUrl;
      }
      if (typeof changes.unread === 'boolean') chat.unread = changes.unread ? Math.max(1, chat.unread) : 0;
      if (Number.isSafeInteger(changes.unread) && changes.unread >= 0) chat.unread = changes.unread;
      return structuredClone(chat);
    }

    async function create({ name }) {
      const displayName = typeof name === 'string' ? name.trim().slice(0, 100) : '';
      if (!displayName) throw new Error('Digite um nome para a conversa.');
      const chat = {
        id: `demo-chat-${++sequence}`,
        name: displayName,
        category: 'Atendimento',
        status: 'pending',
        favorite: false,
        archived: false,
        unread: 0,
        latest: '',
        updatedAt: new Date().toISOString(),
        tone: 'green',
        kind: 'direct',
        messages: [],
      };
      chats.set(chat.id, chat);
      return structuredClone(chat);
    }

    async function markRead(id) {
      return update(id, { unread: 0 });
    }

    return { list, conversation, send, update, create, markRead };
  }

  Object.assign(api, { createDemoGateway });
})();
