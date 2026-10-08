/* Fonte única dos dados variáveis. Campos vazios são placeholders. */
window.PAVEL_CONFIG = {
  // Verde provisório em assets/styles.css: substituir pelo tom oficial quando fornecido.
  whatsappNumber: '5521995716270', // Formato internacional, apenas dígitos: código do país + DDD + número.
  messages: {
    geral: 'Olá, Karolina! Gostaria de informações sobre a Pavel Consultoria.',
    consultoria: 'Olá, Karolina! Gostaria de informações sobre os serviços de Consultoria em Planejamento e Gestão de Cronogramas.',
    forense: 'Olá, Karolina! Gostaria de conversar sobre uma necessidade de Análise Forense de Atrasos em Cronogramas.',
    msp: 'Olá, Karolina! Gostaria de informações sobre o Treinamento de MS Project.',
    p6: 'Olá, Karolina! Gostaria de informações sobre o Treinamento de Primavera P6.',
    turmas: 'Olá, Karolina! Gostaria de consultar a programação das próximas turmas.',
    apostilaMsp: 'Olá, Karolina! Gostaria de adquirir a apostila de MS Project.',
    apostilaP6: 'Olá, Karolina! Gostaria de adquirir a apostila de Primavera P6.'
  },
  simulatorUrl: '',
  forms: { msp: '', p6: '' },
  samples: { msp: '', p6: '' },
  // Cada registro é uma turma independente; dates contém todas as suas aulas.
  // Calendários e próximas turmas usam esta mesma fonte. Preserve registros históricos.
  // Para cadastrar: id único, course, variant, dates (AAAA-MM-DD em ordem),
  // startTime (HH:mm em São Paulo), time, duration e modality. Não inventar datas.
  classes: [
    { id: 'msp-noturna-2026-10', course: 'msp', variant: 'Turma noturna',
      dates: ['2026-10-06', '2026-10-08', '2026-10-13', '2026-10-15'],
      startTime: '19:30', time: '19h30 às 21h30', duration: '8 horas', modality: 'Online ao vivo' },
    { id: 'msp-sabado-2026-10', course: 'msp', variant: 'Turma de sábado',
      dates: ['2026-10-17'], startTime: '09:00', time: '9h às 17h', duration: '8 horas', modality: 'Online ao vivo' },
    { id: 'p6-noturna-2026-10', course: 'p6', variant: 'Turma noturna',
      dates: ['2026-10-20', '2026-10-22', '2026-10-27', '2026-10-29'],
      startTime: '19:30', time: '19h30 às 21h30', duration: '8 horas', modality: 'Online ao vivo' },
    { id: 'p6-sabado-2026-10', course: 'p6', variant: 'Turma de sábado',
      dates: ['2026-10-31'], startTime: '09:00', time: '9h às 17h', duration: '8 horas', modality: 'Online ao vivo' }
  ],
  courses: {
    msp: { acronym: 'MSP', name: 'MS Project — do Básico ao Avançado' },
    p6: { acronym: 'P6', name: 'Primavera P6 Básico' }
  }
};
