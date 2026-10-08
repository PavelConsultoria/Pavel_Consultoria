Astronomy Engine, de Don Cross, licença MIT (astronomy-LICENSE.txt).

Arquivo original, sem modificações:
https://github.com/cosinekitty/astronomy/blob/865d3da7d8112bbc7911238052c6af4aaf877181/source/js/astronomy.browser.min.js

Documentação: https://github.com/cosinekitty/astronomy/tree/master/source/js

Usamos SearchMoonQuarter e NextMoonQuarter para calcular os instantes UTC das
quatro fases principais. assets/calendar.js converte esses instantes para
America/Sao_Paulo. A cópia local evita dependência de API ou CDN na Home.

Validação independente (outubro e novembro de 2026): US Naval Observatory,
https://aa.usno.navy.mil/api/moon/phases/date?date=2026-10-01&nump=10
Os valores UTC de referência ficam apenas em scripts/calendar-check.cjs;
o calendário publicado calcula todos os meses, sem tabela fixa.
