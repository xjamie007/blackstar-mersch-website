/* ---------------------------------------------------------------------------
   Black Star Mersch — "Fill the Basketball": d'Partien am Ball, an de Bréif
   un de Comité.

   Hei gëtt näischt gespäichert an näischt bezuelt. D'Suen kommen iwwer eng
   Iwwerweisung op de Kont vum Veräin; dës Datei hëlleft just, déi richteg
   Partie auszewielen an dem Comité Bescheed ze soen.

   D'Partien kommen aus teams/senior-a-men.html. Dee Block gëtt all Dag vum
   Skript scripts/update-next-games.py aus dem FLBB-Kalenner erneiert, also
   verschwënnt eng gespillte Partie hei vu selwer — eng zweet Lëscht hei
   géif dogéint laanscht d'Realitéit lafen.
--------------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var TO = 'secretaire@blackstar-mersch.lu';
  var IBAN = 'LU86 1111 0175 5191 0000';
  var SOURCE = 'teams/senior-a-men.html';

  function clean(value) {
    return (value == null ? '' : String(value)).trim();
  }

  function line(label, value) {
    var v = clean(value);
    return v ? [label + ': ' + v] : [];
  }

  /* ---------- De Bréif ---------- */
  function build(input) {
    input = input || {};

    var name = clean(input.name);
    var company = clean(input.company);
    var game = clean(input.game);
    var message = clean(input.message);

    var details = line('Numm', name)
      .concat(line('Betrib', company))
      .concat(line('E-Mail', input.email))
      .concat(line('Telefon', input.phone))
      .concat(line('Partie', game));

    /* Wien eng Partie ausgesicht huet, kritt se am éischte Saz genannt; wien
       einfach de Veräin ënnerstëtzt, kritt do keng eidel Plaz. */
    var opening = game
      ? 'ech géif gär de Spillball fir d’Partie "' + game + '" sponseren.'
      : 'ech géif gär de Black Star Mersch ënnerstëtzen.';

    var body = ['Moien,', '', opening, '']
      .concat(details)
      .concat(message ? ['', message] : [])
      .concat([
        '',
        'Ech iwwerweisen op ' + IBAN + '.',
        '',
        'Mellt Iech w.e.g., wann nach eppes feelt.',
        '',
        'Merci am Viraus,',
        name,
      ])
      .join('\n');

    var subject = 'Spillball-Sponsoring — ' + (company || name) + (game ? ' — ' + game : '');

    /* encodeURIComponent an net encodeURI: en "&" an engem Firmennumm géif
       soss de Text ofschneiden an als neie Parameter weiderlafen. */
    var url =
      'mailto:' + encodeURIComponent(TO) +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    return { to: TO, iban: IBAN, subject: subject, body: body, url: url };
  }

  /* ---------- D'Partien ---------- */

  /** Aus dem generéierte Block: nëmmen d'Heemmatcher, déi nach kommen. */
  function parseGames(html, todayISO) {
    var block = html.match(/GAMES_DATA_START([\s\S]*?)GAMES_DATA_END/);
    if (!block) return [];

    var out = [];
    var re = /\{date:"([^"]+)"[^}]*?homeAway:"(\w+)"[^}]*?opponent:"([^"]+)"/g;
    var m;
    while ((m = re.exec(block[1])) !== null) {
      if (m[2] !== 'home') continue;
      if (m[1] < todayISO) continue;
      out.push({ date: m[1], opponent: m[3] });
    }
    out.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return out;
  }

  /** "2026-11-13" -> "13.11" — esou wéi um Plakat. */
  function shortDate(iso) {
    var p = iso.split('-');
    return Number(p[2]) + '.' + Number(p[1]);
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  async function loadGames() {
    var res = await fetch(SOURCE, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return parseGames(await res.text(), today());
  }

  global.bsmSponsorMail = build;
  global.bsmSponsor = {
    build: build,
    parseGames: parseGames,
    shortDate: shortDate,
    loadGames: loadGames,
    IBAN: IBAN,
    TO: TO,
  };
})(window);
