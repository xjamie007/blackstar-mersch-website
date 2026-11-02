/* ---------------------------------------------------------------------------
   Black Star Mersch — de Bréif fir de Spillball-Sponsoring.

   Getrennt vum Formulaire, well de Formulaire just Felder sammelt an dës Datei
   decidéiert, wat an der Mail steet. Esou kann een hei nokucken a probéieren,
   ouni op "Schécken" ze dréngen.

   Hei gëtt näischt gespäichert a näischt geschéckt: d'Resultat ass eng
   mailto:-Adresse, an de Rescht mécht d'Mail-App vum Besucher.
--------------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var TO = 'info@blackstar-mersch.lu';

  function clean(value) {
    return (value == null ? '' : String(value)).trim();
  }

  /* Eng Zeil erschéngt nëmmen, wa se eppes dréit. En eidelt "Betrib:" an der
     Mail liest sech wéi eng Fro, déi den Absender ignoréiert huet, an net wéi
     eng, déi op hien net zoutrëfft. */
  function line(label, value) {
    var v = clean(value);
    return v ? [label + ': ' + v] : [];
  }

  function build(input) {
    input = input || {};

    var name = clean(input.name);
    var company = clean(input.company);
    var amount = clean(input.amount);
    var message = clean(input.message);

    var details = line('Numm', name)
      .concat(line('Betrib', company))
      .concat(line('E-Mail', input.email))
      .concat(line('Telefon', input.phone))
      .concat(line('Betrag', amount ? amount + ' €' : ''))
      .concat(line('Match', input.game));

    var body = [
      'Moien,',
      '',
      'ech géif gär de Spillball fir e Heemmatch vum Black Star Mersch sponseren.',
      '',
    ]
      .concat(details)
      .concat(message ? ['', message] : [])
      .concat(['', 'Mellt Iech w.e.g. fir déi weider Detailer.', '', 'Merci am Viraus,', name])
      .join('\n');

    /* De Betrib steet am Sujet, wann et een gëtt: an der Boîte gesäit een esou
       direkt, vu wiem et kënnt, an fënnt et méi spéit erëm. */
    var subject = 'Spillball-Sponsoring — ' + (company || name);

    /* encodeURIComponent an net encodeURI: en "&" an engem Firmennumm géif
       soss de Text ofschneiden an als neie Parameter weiderlafen, an d'Mail
       géif hallef eidel opgoen, ouni datt een et gesäit. */
    var url =
      'mailto:' +
      encodeURIComponent(TO) +
      '?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(body);

    return { to: TO, subject: subject, body: body, url: url };
  }

  global.bsmSponsorMail = build;
})(window);
