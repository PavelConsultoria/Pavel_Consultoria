/* Fonte única dos dados variáveis. Campos vazios são placeholders. */
window.PAVEL_CONFIG = {
  // Verde provisório em assets/styles.css: substituir pelo tom oficial quando fornecido.
  whatsappNumber: '5521995716270', // Formato internacional, apenas dígitos: código do país + DDD + número.
  messages: {
    geral: 'Olá, Karolina! Gostaria de informações sobre a Pavel Consultoria.',
    consultoria: 'Olá, Karolina! Gostaria de informações sobre os serviços de Consultoria em Planejamento e Gestão de Cronogramas.',
    forense: 'Olá, Karolina! Gostaria de conversar sobre uma necessidade de Análise Forense de Atrasos.',
    msp: 'Olá, Karolina! Gostaria de informações sobre o Treinamento de MS Project.',
    p6: 'Olá, Karolina! Gostaria de informações sobre o Treinamento de Primavera P6.',
    turmas: 'Olá, Karolina! Gostaria de consultar a programação das próximas turmas.',
    apostilaMsp: 'Olá, Karolina! Gostaria de adquirir a apostila de MS Project.',
    apostilaP6: 'Olá, Karolina! Gostaria de adquirir a apostila de Primavera P6.'
  },
  simulatorUrl: '',
  forms: { msp: '', p6: '' },
  samples: { msp: '', p6: '' },
  // Calendário e lista compartilham estes registros. Sem datas fictícias nesta versão.
  // Registro: { date: 'AAAA-MM-DD', course: 'msp' ou 'p6', time: 'horário confirmado',
  // modality: 'modalidade confirmada', status: 'status confirmado' }
  classes: [],
  courses: {
    msp: { acronym: 'MSP', name: 'MS Project — do Básico ao Avançado' },
    p6: { acronym: 'P6', name: 'Primavera P6 Básico' }
  }
};
