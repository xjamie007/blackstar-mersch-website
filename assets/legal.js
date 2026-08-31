/* ---------------------------------------------------------------------------
   Black Star Mersch - Cookie-/Consent-Banner an DSGVO-Hëllefsfunktiounen.

   Kontext: dës Websäit setzt KENG Tracking- oder Analyse-Cookien. Am Browser
   gespäichert gëtt just:
     - bsm_lang            (gewielte Sprooch, technesch néideg / funktional)
     - bsm_consent         (dëse Consent selwer, technesch néideg)
     - bsm_committee_auth  (Comité-Login, nëmme lokal, technesch néideg)
     - bsm_news_custom     (Comité-News-Entworf, nëmme lokal, technesch néideg)
   Deemno brauch nëmmen een eenzegen Zweck eng Zoustëmmung: den externen
   Inhalt "Google Maps" op de Halen-Säiten. Deen ass standardméisseg AUS an
   gëtt eréischt no enger aktiver Zoustëmmung gelueden (Art. 6(1)(a) DSGVO).

   Refuséieren ass genee esou einfach wéi akzeptéieren (CNPD-Ufuerderung):
   déi zwee Knäppercher stinn niewentenee mat der selwechter Gréisst.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var STORE_KEY = 'bsm_consent';
  var VERSION = 1;

  /* Basis-URL fir Linken (d'Säite leien op verschiddenen Niveauen:
     /index.html, /gyms/eimab.html, /news/post.html ...). Mir leede se aus
     dem eegene <script src> of, dat funktionéiert op all Niveau. */
  var self = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();
  var BASE = (self && self.src ? self.src : '').replace(/assets\/legal\.js.*$/, '');

  /* ---------- Späicheren ---------- */
  function read() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var val = JSON.parse(raw);
      if (!val || val.v !== VERSION) return null;
      return val;
    } catch (e) { return null; }
  }
  function write(state) {
    var val = { v: VERSION, ts: new Date().toISOString(), maps: !!state.maps };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(val)); } catch (e) {}
    return val;
  }

  /* ---------- Iwwersetzungen ---------- */
  var T = {
    lu: {
      title: "Mir respektéieren Är Privatsphär",
      body: "Dës Säit benotzt just technesch néidege Späicher am Browser (z. B. fir Är Sprooch ze mierken). Mir setzen keng Tracking- oder Analyse-Cookien an iwwerdroen keng Donnéeën un Drëttfirmen. Externt Kaartematerial vu Google Maps gëtt eréischt gelueden, wann Dir dat ausdrécklech erlaabt.",
      necessary: "Nëmmen néideg",
      all: "Alles akzeptéieren",
      settings: "Astellungen",
      save: "Auswiel späicheren",
      catNeedTitle: "Technesch néideg",
      catNeedAlways: "Ëmmer aktiv",
      catNeedText: "Späichert Är Sprooch, Är Cookie-Auswiel an - fir de Comité - de lokale Login. Dës Donnéeë bleiwen an Ärem Browser a ginn ni op ee Server geschéckt.",
      catMapsTitle: "Extern Kaarten (Google Maps)",
      catMapsText: "Lued d'Kaart direkt op de Halen-Säiten. Dobäi ginn Är IP-Adress a Cookien un Google iwwerdroen (och an d'USA).",
      privacy: "Dateschutz",
      imprint: "Impressum",
      settingsLink: "Cookie-Astellungen",
      close: "Zoumaachen"
    },
    fr: {
      title: "Nous respectons votre vie privée",
      body: "Ce site n'utilise que le stockage techniquement nécessaire dans votre navigateur (par ex. pour retenir votre langue). Nous ne plaçons aucun cookie de suivi ou de mesure d'audience et ne transmettons aucune donnée à des tiers. Les cartes externes de Google Maps ne sont chargées qu'avec votre accord explicite.",
      necessary: "Nécessaires uniquement",
      all: "Tout accepter",
      settings: "Paramètres",
      save: "Enregistrer mon choix",
      catNeedTitle: "Techniquement nécessaires",
      catNeedAlways: "Toujours actifs",
      catNeedText: "Conservent votre langue, votre choix en matière de cookies et - pour le comité - la connexion locale. Ces données restent dans votre navigateur et ne sont jamais envoyées à un serveur.",
      catMapsTitle: "Cartes externes (Google Maps)",
      catMapsText: "Charge la carte directement sur les pages des salles. Votre adresse IP et des cookies sont alors transmis à Google (y compris aux États-Unis).",
      privacy: "Confidentialité",
      imprint: "Mentions légales",
      settingsLink: "Paramètres cookies",
      close: "Fermer"
    },
    de: {
      title: "Wir respektieren Ihre Privatsphäre",
      body: "Diese Seite nutzt ausschliesslich technisch notwendigen Speicher im Browser (z. B. um Ihre Sprache zu merken). Wir setzen keine Tracking- oder Analyse-Cookies und übermitteln keine Daten an Dritte. Externes Kartenmaterial von Google Maps wird erst nach Ihrer ausdrücklichen Einwilligung geladen.",
      necessary: "Nur notwendige",
      all: "Alle akzeptieren",
      settings: "Einstellungen",
      save: "Auswahl speichern",
      catNeedTitle: "Technisch notwendig",
      catNeedAlways: "Immer aktiv",
      catNeedText: "Speichert Ihre Sprache, Ihre Cookie-Auswahl und - für das Komitee - den lokalen Login. Diese Daten bleiben in Ihrem Browser und werden nie an einen Server gesendet.",
      catMapsTitle: "Externe Karten (Google Maps)",
      catMapsText: "Lädt die Karte direkt auf den Hallen-Seiten. Dabei werden Ihre IP-Adresse und Cookies an Google übertragen (auch in die USA).",
      privacy: "Datenschutz",
      imprint: "Impressum",
      settingsLink: "Cookie-Einstellungen",
      close: "Schliessen"
    },
    en: {
      title: "We respect your privacy",
      body: "This site only uses technically necessary browser storage (for example to remember your language). We set no tracking or analytics cookies and pass no data to third parties. External map material from Google Maps is loaded only with your explicit consent.",
      necessary: "Necessary only",
      all: "Accept all",
      settings: "Settings",
      save: "Save my choice",
      catNeedTitle: "Technically necessary",
      catNeedAlways: "Always active",
      catNeedText: "Stores your language, your cookie choice and - for the committee - the local login. This data stays in your browser and is never sent to a server.",
      catMapsTitle: "External maps (Google Maps)",
      catMapsText: "Loads the map directly on the gym pages. Your IP address and cookies are transmitted to Google (including to the USA) in the process.",
      privacy: "Privacy",
      imprint: "Legal notice",
      settingsLink: "Cookie settings",
      close: "Close"
    }
  };

  function currentLang() {
    var l = null;
    try { l = localStorage.getItem('bsm_lang'); } catch (e) {}
    return (l && T[l]) ? l : 'lu';
  }
  function t() { return T[currentLang()]; }

  /* ---------- Kaarten ---------- */
  /* Ersetzt de Placeholder duerch den echten iframe. Gëtt souwuel beim
     direkte Klick opgeruff wéi och automatesch, wann d'Zoustëmmung do ass. */
  function loadMap(box) {
    if (!box || !box.parentNode) return;
    var frame = document.createElement('iframe');
    frame.src = box.getAttribute('data-map-src');
    frame.width = '100%';
    frame.height = '360';
    frame.style.border = '0';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    var h = box.querySelector('h4');
    frame.title = h ? h.textContent : 'Google Maps';
    box.replaceWith(frame);
  }
  function applyMaps() {
    var state = read();
    var boxes = document.querySelectorAll('.map-consent');
    for (var i = 0; i < boxes.length; i++) {
      if (state && state.maps) loadMap(boxes[i]);
    }
  }
  function bindMaps() {
    var boxes = document.querySelectorAll('.map-consent');
    for (var i = 0; i < boxes.length; i++) {
      (function (box) {
        var btn = box.querySelector('button');
        if (!btn || btn.dataset.bsmBound) return;
        btn.dataset.bsmBound = '1';
        btn.addEventListener('click', function () {
          /* E Klick op "Kaart lueden" gëllt just fir dës eng Kaart. Mir
             späicheren doriwwer eraus näischt - eng dauerhaft Erlaabnes gëtt
             et nëmmen iwwer de Schalter am Banner. */
          loadMap(box);
        });
      })(boxes[i]);
    }
  }

  /* ---------- Banner ---------- */
  var banner = null;

  function buildBanner() {
    var d = t();
    var el = document.createElement('div');
    el.className = 'cc-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-label', d.title);
    el.innerHTML =
      '<div class="cc-inner">' +
        '<div class="cc-text">' +
          '<h4 class="cc-title"></h4>' +
          '<p class="cc-body"></p>' +
          '<p class="cc-links">' +
            '<a class="cc-privacy" href="' + BASE + 'datenschutz.html"></a>' +
            '<span aria-hidden="true"> · </span>' +
            '<a class="cc-imprint" href="' + BASE + 'impressum.html"></a>' +
          '</p>' +
        '</div>' +
        '<div class="cc-details" hidden>' +
          '<div class="cc-cat">' +
            '<div class="cc-cat-head">' +
              '<span class="cc-cat-title cc-need-title"></span>' +
              '<span class="cc-always cc-need-always"></span>' +
            '</div>' +
            '<p class="cc-cat-text cc-need-text"></p>' +
          '</div>' +
          '<div class="cc-cat">' +
            '<div class="cc-cat-head">' +
              '<label class="cc-switch">' +
                '<input type="checkbox" class="cc-maps-toggle">' +
                '<span class="cc-slider" aria-hidden="true"></span>' +
                '<span class="cc-cat-title cc-maps-title"></span>' +
              '</label>' +
            '</div>' +
            '<p class="cc-cat-text cc-maps-text"></p>' +
          '</div>' +
          '<button type="button" class="btn btn-outline cc-btn cc-save"></button>' +
        '</div>' +
        '<div class="cc-actions">' +
          '<button type="button" class="btn btn-outline cc-btn cc-settings"></button>' +
          '<button type="button" class="btn btn-outline cc-btn cc-necessary"></button>' +
          '<button type="button" class="btn btn-gold cc-btn cc-all"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelector('.cc-settings').addEventListener('click', function () {
      var det = el.querySelector('.cc-details');
      det.hidden = !det.hidden;
      el.querySelector('.cc-maps-toggle').checked = !!(read() || {}).maps;
    });
    el.querySelector('.cc-necessary').addEventListener('click', function () {
      write({ maps: false });
      hide();
    });
    el.querySelector('.cc-all').addEventListener('click', function () {
      write({ maps: true });
      applyMaps();
      hide();
    });
    el.querySelector('.cc-save').addEventListener('click', function () {
      write({ maps: el.querySelector('.cc-maps-toggle').checked });
      applyMaps();
      hide();
    });
    return el;
  }

  function renderBannerState() {
    if (!banner) return;
    var d = t();
    var set = function (sel, txt) {
      var n = banner.querySelector(sel);
      if (n) n.textContent = txt;
    };
    set('.cc-title', d.title);
    set('.cc-body', d.body);
    set('.cc-privacy', d.privacy);
    set('.cc-imprint', d.imprint);
    set('.cc-settings', d.settings);
    set('.cc-necessary', d.necessary);
    set('.cc-all', d.all);
    set('.cc-save', d.save);
    set('.cc-need-title', d.catNeedTitle);
    set('.cc-need-always', d.catNeedAlways);
    set('.cc-need-text', d.catNeedText);
    set('.cc-maps-title', d.catMapsTitle);
    set('.cc-maps-text', d.catMapsText);
    banner.setAttribute('aria-label', d.title);
    banner.querySelector('.cc-maps-toggle').checked = !!(read() || {}).maps;
  }

  function show(openDetails) {
    if (!banner) banner = buildBanner();
    renderBannerState();
    banner.querySelector('.cc-details').hidden = !openDetails;
    banner.classList.add('is-open');
  }
  function hide() {
    if (banner) banner.classList.remove('is-open');
  }

  /* ---------- Foussnout-Link "Cookie-Astellungen" ---------- */
  function bindFooterLinks() {
    var links = document.querySelectorAll('[data-cc-open]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (ev) {
        ev.preventDefault();
        show(true);
      });
    }
  }
  function renderFooterLang() {
    var d = t();
    var nodes = document.querySelectorAll('[data-cc-open]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = d.settingsLink;
  }

  /* ---------- Sprooch-Wiessel matkréien ---------- */
  function bindLangSwitch() {
    var btns = document.querySelectorAll('#langswitch .dropmenu button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        /* setLang() vun der Säit leeft am selwechte Klick a schreift
           bsm_lang - mir liesen dono nei, dofir e Micro-Delay. */
        setTimeout(function () { renderBannerState(); renderFooterLang(); }, 0);
      });
    }
  }

  /* ---------- Start ---------- */
  function init() {
    bindMaps();
    applyMaps();
    bindFooterLinks();
    renderFooterLang();
    bindLangSwitch();
    if (!read()) show(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Ëffentlech API - z. B. fir de Link "Cookie-Astellungen" oder Tester. */
  window.bsmConsent = {
    get: read,
    open: function () { show(true); },
    reset: function () {
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      show(false);
    }
  };
})();
