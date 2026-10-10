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
  simulatorUrl: 'https://pavelpmpsimulator.com.br/',
  forms: { msp: '', p6: '' },
  samples: { msp: '', p6: '' },
  // Fonte pública, somente leitura. Não usar o endereço de edição da planilha.
  agendaCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSdq2OSQfJlUYm4p1IhGubApJDU2qmh_RoSA0EVt6gHmpR7w9ntbQAvZOvYT4pdO8mkZ6zaJgQiekZe/pub?gid=613259854&single=true&output=csv',
  // CSV da aba Controle inteira, com a data/hora em B1. Publicar separadamente
  // em Arquivo > Compartilhar > Publicar na Web e colar aqui o URL gerado.
  // Nao reutilizar o URL de Turmas. Vazio mantem a indicacao oculta.
  agendaControlCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSdq2OSQfJlUYm4p1IhGubApJDU2qmh_RoSA0EVt6gHmpR7w9ntbQAvZOvYT4pdO8mkZ6zaJgQiekZe/pub?gid=608855431&single=true&output=csv',
  courses: {
    msp: { acronym: 'MSP', name: 'MS Project — do Básico ao Avançado' },
    p6: { acronym: 'P6', name: 'Primavera P6 Básico' }
  }
};
