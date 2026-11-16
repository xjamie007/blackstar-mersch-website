/* Spillbäll, déi schonn gestëft sinn (Senior A Hären, Heemmatcher): Datum -> Sponsor.
   Eng Lëscht fir véier Plazen: de Ball an d'Rei „Spillbäll gestëft vun" op
   sponsoring.html, d'Matchkaart op der Startsäit an déi op teams/senior-a-men.html.
   Nei Sponsoren hei derbäisetzen. `opponent` steet derbäi, well eng gespillte
   Partie aus den FLBB-Donnéeë verschwënnt, d'Rei se awer weider weist.
   `logo` (just d'Emblem, ouni Schrëft, an assets/ballsponsors/) an `url` sinn
   fräiwëlleg: ouni Logo gëtt et d'Initialen, ouni url keen Link. */
window.BSM_BALL_SPONSORS = {
  '2026-11-13': { name: 'Chez Ben', opponent: 'North Fox', logo: 'chez-ben.png', url: 'http://chezben.lu/accueil.html' },
  '2027-01-09': { name: 'Patrick Wies', opponent: 'Nitia Bettembourg' },
};

/* Logo vum Sponsor, oder seng Initialen an enger Kugel, wann et keent gëtt. */
window.bsmSponsorMark = function (sp, assetsBase) {
  if (sp.logo) return '<img src="' + assetsBase + 'ballsponsors/' + sp.logo + '" alt="">';
  var initials = sp.name.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
  return '<i class="ball-initials" aria-hidden="true">' + initials + '</i>';
};

/* D'Zeil "Ball gestëft vun …" fir eng Matchkaart. D'Kaart selwer ass e Link op
   d'FLBB, an e Link an engem Link gëtt et net — dofir e span mat role="link",
   deen de Klick hei ënnen ofhëlt, éier d'Kaart en kritt. Ouni url just Text. */
window.bsmBallSponsorHtml = function (date, assetsBase, label) {
  var sp = window.BSM_BALL_SPONSORS[date];
  if (!sp) return '';
  var link = sp.url ? ' role="link" tabindex="0" data-href="' + sp.url + '" title="' + sp.name + '"' : '';
  var mark = sp.logo ? '<img src="' + assetsBase + 'ballsponsors/' + sp.logo + '" alt="">' : '';
  return '<span class="gameday-ballsponsor"' + link + '>' + mark +
    '<span>' + label + ' <b>' + sp.name + '</b></span></span>';
};

(function () {
  function open(ev) {
    var el = ev.target.closest && ev.target.closest('.gameday-ballsponsor[data-href]');
    if (!el) return;
    if (ev.type === 'keydown' && ev.key !== 'Enter' && ev.key !== ' ') return;
    ev.preventDefault();
    ev.stopPropagation();
    window.open(el.getAttribute('data-href'), '_blank', 'noopener');
  }
  document.addEventListener('click', open);
  document.addEventListener('keydown', open);
})();
