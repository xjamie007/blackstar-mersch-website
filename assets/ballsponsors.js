/* Spillbäll, déi schonn gestëft sinn (Senior A Hären, Heemmatcher): Datum -> Sponsor.
   Eng Lëscht fir dräi Plazen: de Ball op sponsoring.html, d'Matchkaart op der
   Startsäit an déi op teams/senior-a-men.html. Nei Sponsoren hei derbäisetzen,
   d'Logo (just d'Emblem, ouni Schrëft) kënnt an assets/ballsponsors/. */
window.BSM_BALL_SPONSORS = {
  '2026-11-13': { name: 'Chez Ben', logo: 'chez-ben.png', url: 'http://chezben.lu/accueil.html' },
};

/* D'Zeil "Ball gestëft vun …" fir eng Matchkaart. D'Kaart selwer ass e Link op
   d'FLBB, an e Link an engem Link gëtt et net — dofir e span mat role="link",
   deen de Klick hei ënnen ofhëlt, éier d'Kaart en kritt. */
window.bsmBallSponsorHtml = function (date, assetsBase, label) {
  var sp = window.BSM_BALL_SPONSORS[date];
  if (!sp) return '';
  return '<span class="gameday-ballsponsor" role="link" tabindex="0" data-href="' + sp.url + '" title="' + sp.name + '">' +
    '<img src="' + assetsBase + 'ballsponsors/' + sp.logo + '" alt="">' +
    '<span>' + label + ' <b>' + sp.name + '</b></span></span>';
};

(function () {
  function open(ev) {
    var el = ev.target.closest && ev.target.closest('.gameday-ballsponsor');
    if (!el) return;
    if (ev.type === 'keydown' && ev.key !== 'Enter' && ev.key !== ' ') return;
    ev.preventDefault();
    ev.stopPropagation();
    window.open(el.getAttribute('data-href'), '_blank', 'noopener');
  }
  document.addEventListener('click', open);
  document.addEventListener('keydown', open);
})();
