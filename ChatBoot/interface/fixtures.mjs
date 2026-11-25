// Pessoas, organizações e mensagens inventadas para a demonstração.
export function createFixtures(reference = new Date()) {
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(reference);

  function time(hours, daysAgo = 0) {
    const date = new Date(`${day}T${hours}:00-03:00`);
    date.setUTCDate(date.getUTCDate() - daysAgo);
    return date.toISOString();
  }

  function message(id, actor, text, hours, daysAgo = 0) {
    return { id, actor, text, at: time(hours, daysAgo) };
  }

  return [
    {
      id: 'marina', name: 'Marina Duarte', initials: 'MD', category: 'Uniformes',
      status: 'human', owner: 'Equipe NVC', favorite: true, archived: false,
      unread: 0, tone: 'green', kind: 'direct',
      messages: [
        message('marina-1', 'client', 'Bom dia! Gostaria de cotar uniformes para a equipe da minha escola.', '09:28'),
        message('marina-2', 'bot', 'Olá, Marina! Você está falando com a Natu Vale. Qual quantidade e modelo vocês precisam?', '09:29'),
        message('marina-3', 'client', 'São 120 polos. Separei uma referência para a cor e a posição da marca.', '09:32'),
        {
          ...message('marina-4', 'client', '', '09:33'),
          attachment: { name: 'Referência do uniforme.pdf', type: 'application/pdf', size: 246080, fictional: true },
        },
        message('marina-5', 'agent', 'Obrigada pela referência! Vou confirmar os detalhes com a produção. Você já tem a grade de tamanhos?', '09:41'),
      ],
    },
    {
      id: 'gabriel', name: 'Gabriel Monteiro', initials: 'GM', category: 'Rastreamento',
      status: 'pending', favorite: false, archived: false, unread: 1, tone: 'blue', kind: 'direct',
      messages: [
        message('gabriel-1', 'client', 'Olá! Queria acompanhar a entrega do meu pedido.', '09:30'),
      ],
    },
    {
      id: 'aurora', name: 'Equipe Horizonte', initials: 'EH', category: 'Projetos',
      status: 'human', owner: 'Equipe NVC', favorite: true, archived: false, unread: 2,
      tone: 'sand', kind: 'group',
      messages: [
        message('aurora-1', 'client', 'Já reunimos as medidas dos participantes.', '09:13'),
        message('aurora-2', 'client', 'Podemos confirmar as cores até o fim do dia?', '09:16'),
      ],
    },
    {
      id: 'beatriz', name: 'Beatriz Silveira', initials: 'BS', category: 'Personalizados',
      status: 'bot', favorite: false, archived: false, unread: 0, tone: 'rose', kind: 'direct',
      messages: [
        message('beatriz-1', 'client', 'Vocês fazem camisetas para eventos?', '08:46'),
        message('beatriz-2', 'bot', 'Fazemos sob consulta. Pode me contar a quantidade, o modelo e a data do evento?', '08:48'),
      ],
    },
    {
      id: 'rafael', name: 'Rafael Prado', initials: 'RP', category: 'Uniformes',
      status: 'pending', favorite: false, archived: false, unread: 1, tone: 'green', kind: 'direct',
      messages: [
        message('rafael-1', 'client', 'Separei a grade dos tamanhos. Posso enviar por aqui?', '17:22', 1),
      ],
    },
    {
      id: 'leticia', name: 'Letícia Campos', initials: 'LC', category: 'Departamento Pessoal',
      status: 'closed', favorite: false, archived: false, unread: 0, tone: 'sand', kind: 'direct',
      messages: [
        message('leticia-1', 'client', 'Obrigada, já encontrei o atendimento que precisava.', '15:16', 1),
      ],
    },
    {
      id: 'colegio', name: 'Comissão Colégio do Ipê', initials: 'CI', category: 'Uniformes',
      status: 'human', owner: 'Equipe NVC', favorite: false, archived: false, unread: 0,
      tone: 'blue', kind: 'group',
      messages: [
        message('colegio-1', 'agent', 'Aguardamos o retorno da comissão sobre os modelos.', '10:02', 1),
      ],
    },
    {
      id: 'andre', name: 'André Pontes', initials: 'AP', category: 'Personalizados',
      status: 'closed', favorite: false, archived: true, unread: 0, tone: 'rose', kind: 'direct',
      messages: [
        message('andre-1', 'client', 'Recebi tudo certinho. Obrigado pelo atendimento!', '14:21', 4),
      ],
    },
  ].map(chat => {
    const latest = chat.messages.at(-1);
    return { ...chat, latest: latest.text || latest.attachment.name, updatedAt: latest.at };
  });
}
