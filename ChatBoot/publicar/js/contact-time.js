(() => {
  'use strict';
  const api = globalThis.NatusDemo ??= {};

  const timeZone = 'America/Sao_Paulo';
  const clock = new Intl.DateTimeFormat('pt-BR', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const calendar = new Intl.DateTimeFormat('pt-BR', { timeZone, day: '2-digit', month: '2-digit', year: 'numeric' });

  function localDay(value) {
    const parts = Object.fromEntries(calendar.formatToParts(value).map(({ type, value: text }) => [type, text]));
    return { label: `${parts.day}/${parts.month}`, year: parts.year,
      day: Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) };
  }

  function formatLastInteraction(value, reference = Date.now()) {
    if (value == null || value === '') return '';
    const timestamp = new Date(value);
    if (Number.isNaN(timestamp.getTime())) return '';
    const interaction = localDay(timestamp);
    const today = localDay(reference);
    if (interaction.day === today.day) return clock.format(timestamp);
    if (today.day - interaction.day === 86400000) return 'Ontem';
    return interaction.year === today.year ? interaction.label : `${interaction.label}/${interaction.year}`;
  }

  Object.assign(api, { formatLastInteraction });
})();
