/* ============================================================
   JESKE - Hören und Reimen

   Aufbau in vier Teilen:
     1. Navigation und Vorlesen     - der Motor der Sprachausgabe
     2. Die Wörterkiste             - HIER stehen Bilder und Wörter
     3. Das Modul-Register          - HIER stehen die Aufgabenformate
     4. Der Motor der Lernmodule    - bleibt unveraendert

   Neue Wörter kommen in Teil 2 dazu, ein neues Aufgabenformat in
   Teil 3. Teil 1 und 4 muessen dafuer nicht angefasst werden.
   ============================================================ */


/* ============================================
   1. Navigation und Vorlesen
   ============================================ */

function showScreen(screenId) {
    /* Laufenden Timer stoppen - sonst laeuft die Uhr eines verlassenen
       Screens weiter und beendet spaeter eine Runde, die niemand
       mehr spielt. */
    if (practiceTimerInterval) { clearInterval(practiceTimerInterval); practiceTimerInterval = null; }
    /* Auch die Stimme anhalten: sonst spricht die App noch das Wort
       der alten Aufgabe, waehrend das Kind schon woanders ist. */
    if (kannVorlesen()) window.speechSynthesis.cancel();

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

function kannVorlesen() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function deutscheStimme() {
    const stimmen = window.speechSynthesis.getVoices();
    return stimmen.find(s => s.lang && s.lang.toLowerCase().startsWith('de')) || null;
}

/* Alles in dieser App dreht sich ums Hoeren. Deshalb spricht die
   Stimme bewusst langsam - beim Reimen zaehlt jedes Klangstueck. */
const SPRECHTEMPO = 0.8;

function lesVor(text) {
    if (!kannVorlesen() || !text) return;
    window.speechSynthesis.cancel();
    sprichAn(String(text));
}

/* Mehrere Woerter nacheinander, mit Atempause dazwischen. Ein Punkt
   hinter jedem Wort zwingt die Stimme zur Pause - sonst klingen drei
   Woerter wie ein einziges langes. */
function sprichFolge(worte) {
    if (!kannVorlesen() || !worte || !worte.length) return;
    window.speechSynthesis.cancel();
    worte.forEach(wort => sprichAn(wort + '.'));
}

function sprichAn(text) {
    const spruch = new SpeechSynthesisUtterance(text);
    const stimme = deutscheStimme();
    if (stimme) spruch.voice = stimme;
    spruch.lang = 'de-DE';
    spruch.rate = SPRECHTEMPO;
    window.speechSynthesis.speak(spruch);
}

/* Liest den Text eines Kastens vor - ohne die Knoepfe darin. */
function lesVorAusElement(element) {
    if (!element) return;
    const kopie = element.cloneNode(true);
    kopie.querySelectorAll('button').forEach(b => b.remove());
    lesVor(kopie.innerText);
}


/* ============================================================
   2. DIE WÖRTERKISTE

   Jedes Wort traegt alles, was die vier Aufgabenformate brauchen:

     wort        so heisst das Bild, so wird es vorgelesen
     emoji       das Bild - es muss ohne Text erkennbar sein
     reim        der Reimklang ab dem betonten Vokal ("Haus" -> aus).
                 Zwei Woerter mit demselben reim reimen sich.
     anlaut      der Klang, den man am Wortanfang HOERT.
                 "Vase" bekommt f, weil man f hoert;
                 "Strand" bekommt scht, "Pfanne" pf.
     anlautUeben false bei Doppellauten wie Br-, Tr-, Gl-:
                 sie duerfen Ablenker sein, aber nie die gesuchte
                 Aufgabe - fuer den Anfang ist das zu schwer.
     silben      wie oft man beim Sprechen klatscht

   Neues Wort? Zeile anhaengen. Ein Reimklang, den es nur einmal
   gibt, ist kein Fehler - das Wort dient dann als Ablenker.
   ============================================================ */

const woerter = [
    { wort: 'Haus',          emoji: '🏠', reim: 'aus',   anlaut: 'h',    anlautUeben: true,  silben: 1 },
    { wort: 'Maus',          emoji: '🐭', reim: 'aus',   anlaut: 'm',    anlautUeben: true,  silben: 1 },
    { wort: 'Nase',          emoji: '👃', reim: 'ase',   anlaut: 'n',    anlautUeben: true,  silben: 2 },
    { wort: 'Hase',          emoji: '🐰', reim: 'ase',   anlaut: 'h',    anlautUeben: true,  silben: 2 },
    { wort: 'Vase',          emoji: '🏺', reim: 'ase',   anlaut: 'f',    anlautUeben: false, silben: 2 },
    { wort: 'Zahn',          emoji: '🦷', reim: 'ahn',   anlaut: 'z',    anlautUeben: true,  silben: 1 },
    { wort: 'Hahn',          emoji: '🐓', reim: 'ahn',   anlaut: 'h',    anlautUeben: true,  silben: 1 },
    { wort: 'Hund',          emoji: '🐕', reim: 'und',   anlaut: 'h',    anlautUeben: true,  silben: 1 },
    { wort: 'Mund',          emoji: '👄', reim: 'und',   anlaut: 'm',    anlautUeben: true,  silben: 1 },
    { wort: 'Nuss',          emoji: '🥜', reim: 'uss',   anlaut: 'n',    anlautUeben: true,  silben: 1 },
    { wort: 'Kuss',          emoji: '💋', reim: 'uss',   anlaut: 'k',    anlautUeben: true,  silben: 1 },
    { wort: 'Eis',           emoji: '🍦', reim: 'eis',   anlaut: 'ei',   anlautUeben: true,  silben: 1 },
    { wort: 'Reis',          emoji: '🍚', reim: 'eis',   anlaut: 'r',    anlautUeben: true,  silben: 1 },
    { wort: 'Kuh',           emoji: '🐄', reim: 'uh',    anlaut: 'k',    anlautUeben: true,  silben: 1 },
    { wort: 'Schuh',         emoji: '👟', reim: 'uh',    anlaut: 'sch',  anlautUeben: true,  silben: 1 },
    { wort: 'Rose',          emoji: '🌹', reim: 'ose',   anlaut: 'r',    anlautUeben: true,  silben: 2 },
    { wort: 'Hose',          emoji: '👖', reim: 'ose',   anlaut: 'h',    anlautUeben: true,  silben: 2 },
    { wort: 'Dose',          emoji: '🥫', reim: 'ose',   anlaut: 'd',    anlautUeben: true,  silben: 2 },
    { wort: 'Baum',          emoji: '🌳', reim: 'aum',   anlaut: 'b',    anlautUeben: true,  silben: 1 },
    { wort: 'Traum',         emoji: '💭', reim: 'aum',   anlaut: 't',    anlautUeben: false, silben: 1 },
    { wort: 'Schaum',        emoji: '🫧', reim: 'aum',   anlaut: 'sch',  anlautUeben: true,  silben: 1 },
    { wort: 'Krone',         emoji: '👑', reim: 'one',   anlaut: 'k',    anlautUeben: false, silben: 2 },
    { wort: 'Bohne',         emoji: '🫘', reim: 'one',   anlaut: 'b',    anlautUeben: true,  silben: 2 },
    { wort: 'Zitrone',       emoji: '🍋', reim: 'one',   anlaut: 'z',    anlautUeben: true,  silben: 3 },
    /* Eule reimt auf -eule, Schule auf -ule: das ist NICHT derselbe
       Klang. Schule steht deshalb bei den Ablenkern. */
    { wort: 'Eule',          emoji: '🦉', reim: 'eule',  anlaut: 'eu',   anlautUeben: true,  silben: 2 },
    { wort: 'Beule',         emoji: '🤕', reim: 'eule',  anlaut: 'b',    anlautUeben: true,  silben: 2 },
    { wort: 'Traube',        emoji: '🍇', reim: 'aube',  anlaut: 't',    anlautUeben: false, silben: 2 },
    { wort: 'Taube',         emoji: '🕊️', reim: 'aube',  anlaut: 't',    anlautUeben: true,  silben: 2 },
    { wort: 'Brücke',        emoji: '🌉', reim: 'uecke', anlaut: 'b',    anlautUeben: false, silben: 2 },
    { wort: 'Mücke',         emoji: '🦟', reim: 'uecke', anlaut: 'm',    anlautUeben: true,  silben: 2 },
    { wort: 'Tanne',         emoji: '🌲', reim: 'anne',  anlaut: 't',    anlautUeben: true,  silben: 2 },
    { wort: 'Kanne',         emoji: '🫖', reim: 'anne',  anlaut: 'k',    anlautUeben: true,  silben: 2 },
    { wort: 'Pfanne',        emoji: '🍳', reim: 'anne',  anlaut: 'pf',   anlautUeben: true,  silben: 2 },
    { wort: 'Affe',          emoji: '🐵', reim: 'affe',  anlaut: 'a',    anlautUeben: true,  silben: 2 },
    { wort: 'Giraffe',       emoji: '🦒', reim: 'affe',  anlaut: 'g',    anlautUeben: true,  silben: 3 },
    { wort: 'Sonne',         emoji: '☀️', reim: 'onne',  anlaut: 's',    anlautUeben: true,  silben: 2 },
    { wort: 'Tonne',         emoji: '🗑️', reim: 'onne',  anlaut: 't',    anlautUeben: true,  silben: 2 },
    { wort: 'Brille',        emoji: '👓', reim: 'ille',  anlaut: 'b',    anlautUeben: false, silben: 2 },
    { wort: 'Grille',        emoji: '🦗', reim: 'ille',  anlaut: 'g',    anlautUeben: false, silben: 2 },
    { wort: 'Hand',          emoji: '✋', reim: 'and',   anlaut: 'h',    anlautUeben: true,  silben: 1 },
    { wort: 'Strand',        emoji: '🏖️', reim: 'and',   anlaut: 'scht', anlautUeben: false, silben: 1 },
    { wort: 'Bild',          emoji: '🖼️', reim: 'ild',   anlaut: 'b',    anlautUeben: true,  silben: 1 },
    { wort: 'Schild',        emoji: '🛡️', reim: 'ild',   anlaut: 'sch',  anlautUeben: true,  silben: 1 },
    { wort: 'Socke',         emoji: '🧦', reim: 'ocke',  anlaut: 's',    anlautUeben: true,  silben: 2 },
    { wort: 'Glocke',        emoji: '🔔', reim: 'ocke',  anlaut: 'g',    anlautUeben: false, silben: 2 },
    { wort: 'Leiter',        emoji: '🪜', reim: 'eiter', anlaut: 'l',    anlautUeben: true,  silben: 2 },
    { wort: 'Reiter',        emoji: '🏇', reim: 'eiter', anlaut: 'r',    anlautUeben: true,  silben: 2 },
    { wort: 'Ohr',           emoji: '👂', reim: 'ohr',   anlaut: 'o',    anlautUeben: true,  silben: 1 },
    { wort: 'Tor',           emoji: '🥅', reim: 'ohr',   anlaut: 't',    anlautUeben: true,  silben: 1 },

    /* Ab hier Woerter, deren Reimklang nur einmal vorkommt. Sie sind
       die Ablenker - und im Silben- und Anlautmodul volle Aufgaben. */
    { wort: 'Buch',          emoji: '📖', reim: 'uch',   anlaut: 'b',    anlautUeben: true,  silben: 1 },
    { wort: 'Katze',         emoji: '🐈', reim: 'atze',  anlaut: 'k',    anlautUeben: true,  silben: 2 },
    { wort: 'Ball',          emoji: '⚽', reim: 'all',   anlaut: 'b',    anlautUeben: true,  silben: 1 },
    { wort: 'Stern',         emoji: '⭐', reim: 'ern',   anlaut: 'scht', anlautUeben: false, silben: 1 },
    { wort: 'Fisch',         emoji: '🐟', reim: 'isch',  anlaut: 'f',    anlautUeben: true,  silben: 1 },
    { wort: 'Fuchs',         emoji: '🦊', reim: 'uchs',  anlaut: 'f',    anlautUeben: true,  silben: 1 },
    { wort: 'Blume',         emoji: '🌼', reim: 'ume',   anlaut: 'b',    anlautUeben: false, silben: 2 },
    { wort: 'Mond',          emoji: '🌙', reim: 'ond',   anlaut: 'm',    anlautUeben: true,  silben: 1 },
    { wort: 'Biene',         emoji: '🐝', reim: 'iene',  anlaut: 'b',    anlautUeben: true,  silben: 2 },
    { wort: 'Birne',         emoji: '🍐', reim: 'irne',  anlaut: 'b',    anlautUeben: true,  silben: 2 },
    { wort: 'Apfel',         emoji: '🍎', reim: 'apfel', anlaut: 'a',    anlautUeben: true,  silben: 2 },
    { wort: 'Ente',          emoji: '🦆', reim: 'ente',  anlaut: 'e',    anlautUeben: true,  silben: 2 },
    { wort: 'Berg',          emoji: '⛰️', reim: 'erg',   anlaut: 'b',    anlautUeben: true,  silben: 1 },
    { wort: 'Vogel',         emoji: '🐦', reim: 'ogel',  anlaut: 'f',    anlautUeben: false, silben: 2 },
    { wort: 'Herz',          emoji: '❤️', reim: 'erz',   anlaut: 'h',    anlautUeben: true,  silben: 1 },
    { wort: 'Pferd',         emoji: '🐴', reim: 'erd',   anlaut: 'pf',   anlautUeben: true,  silben: 1 },
    { wort: 'Stuhl',         emoji: '🪑', reim: 'uhl',   anlaut: 'scht', anlautUeben: false, silben: 1 },
    { wort: 'Löwe',          emoji: '🦁', reim: 'oewe',  anlaut: 'l',    anlautUeben: true,  silben: 2 },
    { wort: 'Gabel',         emoji: '🍴', reim: 'abel',  anlaut: 'g',    anlautUeben: true,  silben: 2 },
    { wort: 'Besen',         emoji: '🧹', reim: 'esen',  anlaut: 'b',    anlautUeben: true,  silben: 2 },
    { wort: 'Geige',         emoji: '🎻', reim: 'eige',  anlaut: 'g',    anlautUeben: true,  silben: 2 },
    { wort: 'Käse',          emoji: '🧀', reim: 'aese',  anlaut: 'k',    anlautUeben: true,  silben: 2 },
    { wort: 'Wolke',         emoji: '☁️', reim: 'olke',  anlaut: 'w',    anlautUeben: true,  silben: 2 },
    { wort: 'Wurm',          emoji: '🪱', reim: 'urm',   anlaut: 'w',    anlautUeben: true,  silben: 1 },
    { wort: 'Zelt',          emoji: '⛺', reim: 'elt',   anlaut: 'z',    anlautUeben: true,  silben: 1 },
    { wort: 'Welt',          emoji: '🌍', reim: 'elt',   anlaut: 'w',    anlautUeben: true,  silben: 1 },
    { wort: 'Schule',        emoji: '🏫', reim: 'ule',   anlaut: 'sch',  anlautUeben: true,  silben: 2 },
    { wort: 'Zug',           emoji: '🚂', reim: 'ug',    anlaut: 'z',    anlautUeben: true,  silben: 1 },
    { wort: 'Ring',          emoji: '💍', reim: 'ing',   anlaut: 'r',    anlautUeben: true,  silben: 1 },
    { wort: 'Uhr',           emoji: '⏰', reim: 'uhr',   anlaut: 'u',    anlautUeben: true,  silben: 1 },
    { wort: 'Krokodil',      emoji: '🐊', reim: 'il',    anlaut: 'k',    anlautUeben: false, silben: 3 },
    { wort: 'Elefant',       emoji: '🐘', reim: 'ant',   anlaut: 'e',    anlautUeben: true,  silben: 3 }
];

/* ---------- Helfer ---------- */

function zufall(liste) { return liste[Math.floor(Math.random() * liste.length)]; }

function mische(liste) { return liste.slice().sort(() => Math.random() - 0.5); }

/* Woerter nach einem Merkmal buendeln. nurUeben=true nimmt nur die,
   die als gesuchte Aufgabe taugen. */
function gruppiere(feld, nurUeben) {
    const gruppen = {};
    woerter.forEach(w => {
        if (nurUeben && !w.anlautUeben) return;
        if (!gruppen[w[feld]]) gruppen[w[feld]] = [];
        gruppen[w[feld]].push(w);
    });
    /* Nur Gruppen mit Partner: bei einem einzigen Wort gaebe es keine
       richtige Antwort. */
    return Object.values(gruppen).filter(g => g.length >= 2);
}

const reimPaare = gruppiere('reim', false);
const anlautPaare = gruppiere('anlaut', true);

/* Zu jedem Anlaut der Buchstabe, den die App zeigt, und was die
   Stimme dazu sagt. Bei Lauten, die man ziehen kann (Mmm, Sss),
   kommt der gedehnte Laut hinterher - so hoert das Kind den Laut
   und nicht nur den Buchstabennamen "Em". */
const anlautLaute = {
    a:    { zeichen: 'A',   gedehnt: 'Aaa' },
    b:    { zeichen: 'B' },
    d:    { zeichen: 'D' },
    e:    { zeichen: 'E',   gedehnt: 'Eee' },
    ei:   { zeichen: 'Ei' },
    eu:   { zeichen: 'Eu' },
    f:    { zeichen: 'F',   gedehnt: 'Fff' },
    g:    { zeichen: 'G' },
    h:    { zeichen: 'H' },
    k:    { zeichen: 'K' },
    l:    { zeichen: 'L',   gedehnt: 'Lll' },
    m:    { zeichen: 'M',   gedehnt: 'Mmm' },
    n:    { zeichen: 'N',   gedehnt: 'Nnn' },
    o:    { zeichen: 'O',   gedehnt: 'Ooo' },
    pf:   { zeichen: 'Pf' },
    r:    { zeichen: 'R' },
    s:    { zeichen: 'S',   gedehnt: 'Sss' },
    sch:  { zeichen: 'Sch', gedehnt: 'Schschsch' },
    scht: { zeichen: 'St' },
    t:    { zeichen: 'T' },
    u:    { zeichen: 'U',   gedehnt: 'Uuu' },
    w:    { zeichen: 'W' },
    z:    { zeichen: 'Z' }
};

/* Laute, die zu aehnlich klingen, um im selben Bild-Trio zu stehen:
   "Stern" faengt fuers Ohr auch mit sch an, "Pfanne" klingt am
   Anfang wie "Fisch". Solche Paare waeren keine faire Frage. */
const aehnlicheAnlaute = { sch: ['scht'], scht: ['sch'], pf: ['f'], f: ['pf'] };

function anlautStoert(a, b) {
    return a === b || (aehnlicheAnlaute[a] || []).indexOf(b) >= 0;
}

/* Zwei verschiedene Woerter aus einer Gruppe. */
function zweiAus(gruppe) { return mische(gruppe).slice(0, 2); }

/* Ablenker: Woerter, die laut erlaubt() nicht mit der Loesung
   verwechselt werden koennen. */
function ablenker(anzahl, erlaubt) {
    return mische(woerter.filter(erlaubt)).slice(0, anzahl);
}

/* Aus den Wortobjekten werden die Antwortkarten. */
function karten(liste) { return liste.map(w => ({ emoji: w.emoji, wort: w.wort })); }


/* ============================================================
   3. DAS MODUL-REGISTER - hier stehen die Aufgabenformate

   Ein Eintrag = eine Aufgabe = eine Kachel = ein kompletter
   Screen mit Ueben, Erklaeraufgabe und Arbeitsblatt.
   Neues Format:
     a) Eintrag in learningModules
     b) Eintrag in guidedExplanations (gleich viele Schritte
        wie steps[])
     c) Zweig in createTask()
     d) ID und Emoji in initLearningModules() ergaenzen
   ============================================================ */

const learningModules = {

    /* ---------- Aufgabe 1: das Herzstueck ---------- */
    reime: {
        kachel: 'Wort hören, Reimbild finden',
        title: 'Reime hören',
        category: 'Reimen',
        color: 'modul1',
        description: 'Die App sagt ein Wort. Tippe das Bild an, das sich darauf reimt.',
        blattAnleitung: 'Lies dem Kind das Wort links vor. Es kreist das Bild ein, das sich darauf reimt.',

        steps: [
            'Die App sagt: Maus. Sprich das Wort leise nach.',
            'Sprich auch die Bilder nach: Haus, Fisch, Kuh.',
            'Maus und Haus klingen am Ende gleich: -aus. Das ist ein Reim!'
        ],
        explanation: {
            hoerwort: 'Maus',
            bilder: [
                { name: 'haus',  emoji: '🏠', wort: 'Haus' },
                { name: 'fisch', emoji: '🐟', wort: 'Fisch' },
                { name: 'kuh',   emoji: '🐄', wort: 'Kuh' }
            ],
            highlight: [[], ['haus', 'fisch', 'kuh'], ['haus']],
            working: [
                'Maus – hörst du das Ende?',
                'Haus … Fisch … Kuh',
                'Maus und Haus reimen sich.'
            ],
            caption: 'Reimwörter klingen am Ende gleich.'
        },

        coachSchritte: task => [
            { frage: 'Höre das Wort noch einmal. Tippe oben auf die große Karte.', antwort: 'Sprich das Wort leise nach.' },
            { frage: 'Wie heißen die Bilder? Tippe das kleine 🔊 an jedem Bild an.', antwort: 'Sprich jedes Wort laut nach.' },
            { frage: 'Achte nur auf das ENDE der Wörter.', antwort: 'Zwei Wörter, die am Ende gleich klingen, reimen sich.' }
        ]
    },

    /* ---------- Aufgabe 2: gleiches Hoeren, andere Richtung ---------- */
    reimAusreisser: {
        kachel: 'Welches Bild passt nicht?',
        title: 'Reim-Ausreißer',
        category: 'Reimen',
        color: 'modul2',
        description: 'Die App sagt drei Wörter. Zwei reimen sich. Tippe das an, das nicht dazu passt.',
        blattAnleitung: 'Lies dem Kind die drei Bildwörter vor. Es streicht das Bild durch, das sich nicht reimt.',

        steps: [
            'Sprich alle drei Bilder nach: Rose, Hose, Hund.',
            'Rose und Hose klingen am Ende gleich: -ose.',
            'Hund klingt anders. Hund passt nicht dazu.'
        ],
        explanation: {
            hoerwort: null,
            bilder: [
                { name: 'rose', emoji: '🌹', wort: 'Rose' },
                { name: 'hose', emoji: '👖', wort: 'Hose' },
                { name: 'hund', emoji: '🐕', wort: 'Hund' }
            ],
            highlight: [['rose', 'hose', 'hund'], ['rose', 'hose'], ['hund']],
            working: [
                'Rose … Hose … Hund',
                '-ose und -ose: das klingt gleich.',
                '-und klingt ganz anders.'
            ],
            caption: 'Zwei reimen sich. Eins bleibt übrig.'
        },

        coachSchritte: task => [
            { frage: 'Höre dir alle drei Wörter an. Tippe oben auf die große Karte.', antwort: 'Du kannst so oft hören, wie du willst.' },
            { frage: 'Suche zuerst das Reimpaar: Welche zwei klingen am Ende gleich?', antwort: 'Sprich sie hintereinander nach.' },
            { frage: 'Das dritte Bild bleibt übrig. Das ist der Ausreißer.', antwort: 'Tippe es an.' }
        ]
    },

    /* ---------- Aufgabe 3: derselbe Ablauf, anderes Ohr ---------- */
    anlaute: {
        kachel: 'Welches Bild fängt so an?',
        title: 'Anlaute hören',
        category: 'Lauschen',
        color: 'modul3',
        description: 'Die App zeigt einen Buchstaben und liest ihn vor. Tippe das Bild an, das damit anfängt.',
        blattAnleitung: 'Links steht ein Buchstabe. Das Kind kreist das Bild ein, das mit diesem Laut beginnt.',

        steps: [
            'Das ist das M. Es klingt wie Mmm…',
            'Sprich die Bilder nach: Maus, Rose, Fisch.',
            'Maus fängt mit M an: Mmmaus!'
        ],
        explanation: {
            buchstabe: 'M',
            bilder: [
                { name: 'maus',  emoji: '🐭', wort: 'Maus' },
                { name: 'rose',  emoji: '🌹', wort: 'Rose' },
                { name: 'fisch', emoji: '🐟', wort: 'Fisch' }
            ],
            highlight: [[], ['maus', 'rose', 'fisch'], ['maus']],
            working: [
                'Tippe das M an – dann hörst du es.',
                'Mmmaus … Rrrose … Fffisch',
                'Nur die Maus fängt mit M an.'
            ],
            caption: 'Der Anlaut ist der erste Laut im Wort.'
        },

        coachSchritte: task => [
            { frage: 'Tippe den Buchstaben an. Wie klingt er?', antwort: 'Sprich den Laut lang mit.' },
            { frage: 'Sprich jedes Bild langsam nach. Fang ganz vorne an.', antwort: 'Tippe dazu das kleine 🔊 an.' },
            { frage: 'Achte nur auf den ANFANG der Wörter.', antwort: 'Ein Wort fängt mit dem Buchstaben an – das ist deins.' }
        ]
    },

    /* ---------- Aufgabe 4: hoeren und mitmachen ---------- */
    silben: {
        kachel: 'Wie oft klatschst du?',
        title: 'Silben klatschen',
        category: 'Lauschen',
        color: 'modul4',
        description: 'Die App zeigt und sagt ein Wort. Klatsche mit und tippe die Zahl an.',
        blattAnleitung: 'Das Kind klatscht das Bildwort und kreist die passende Zahl ein.',

        steps: [
            'Sprich das Wort langsam: Zi-tro-ne.',
            'Klatsche bei jedem Teil einmal.',
            'Du klatschst dreimal. Zitrone hat 3 Silben.'
        ],
        explanation: {
            hoerwort: 'Zitrone',
            bilder: [
                { name: 'zitrone', emoji: '🍋', wort: 'Zitrone' }
            ],
            highlight: [['zitrone'], ['zitrone'], ['zitrone']],
            working: [
                'Zi – tro – ne',
                'Klatsch! Klatsch! Klatsch!',
                '3 Silben.'
            ],
            caption: 'Jede Silbe ist ein Klatscher.'
        },

        coachSchritte: task => [
            { frage: 'Höre das Wort und sprich es laut nach.', antwort: 'Ganz langsam, Stück für Stück.' },
            { frage: 'Klatsche jetzt mit, während du sprichst.', antwort: 'Bei jedem Stück einmal klatschen.' },
            { frage: 'Wie oft hast du geklatscht?', antwort: 'So viele Silben hat das Wort.' }
        ]
    }
};

/* Mitmach-Schritte der Erklaeraufgabe.
   Zu jedem Schritt aus steps[] gehoert hier GENAU EIN Eintrag mit der
   Frage, die VOR dem Aufdecken steht.

   type 'pick':   das Kind tippt eins der Bilder an; target ist sein Name.
   type 'choice': das Kind waehlt aus options; answer ist die richtige.
   hint:          Tipp nach dem ersten Fehlversuch. Nach dem zweiten
                  loest sich der Schritt selbst auf. */
const guidedExplanations = {
    reime: [
        { type: 'choice', options: ['Am Anfang', 'Am Ende'], answer: 'Am Ende', ask: 'Wo klingen Reimwörter gleich?', hint: 'Sprich Maus und Haus langsam. Der Anfang ist verschieden.' },
        { type: 'pick', target: 'haus', ask: 'Tippe das Bild an, das am Ende wie Maus klingt.', hint: 'Sprich nach: Haus, Fisch, Kuh. Welches endet auf -aus?' },
        { type: 'choice', options: ['-aus', '-isch', '-uh'], answer: '-aus', ask: 'Welches Ende haben Maus und Haus gemeinsam?', hint: 'M-aus … H-aus …' }
    ],
    reimAusreisser: [
        { type: 'choice', options: ['Am Anfang', 'Am Ende'], answer: 'Am Ende', ask: 'Worauf musst du beim Reimen hören?', hint: 'Rose und Hose fangen verschieden an.' },
        { type: 'pick', target: 'hose', ask: 'Tippe das Bild an, das sich auf Rose reimt.', hint: 'Rose … Hose … Hund. Welches endet auf -ose?' },
        { type: 'pick', target: 'hund', ask: 'Und welches Bild passt nicht dazu?', hint: 'Zwei enden auf -ose. Eins nicht.' }
    ],
    anlaute: [
        { type: 'choice', options: ['Am Anfang', 'Am Ende'], answer: 'Am Anfang', ask: 'Wo hörst du beim Anlaut hin?', hint: 'Der Anlaut ist der erste Laut.' },
        { type: 'pick', target: 'maus', ask: 'Tippe das Bild an, das mit M anfängt.', hint: 'Mmmaus … Rrrose … Fffisch …' },
        { type: 'choice', options: ['M', 'R', 'F'], answer: 'M', ask: 'Mit welchem Buchstaben fängt Maus an?', hint: 'Sprich das Wort ganz langsam: Mmm-aus.' }
    ],
    silben: [
        { type: 'choice', options: ['Zi-tro-ne', 'Zitro-ne'], answer: 'Zi-tro-ne', ask: 'Wie teilst du das Wort beim Sprechen?', hint: 'Sprich es wie ein Roboter.' },
        { type: 'choice', options: ['1', '2', '3'], answer: '3', ask: 'Wie oft klatschst du bei Zi-tro-ne?', hint: 'Klatsche einmal mit.' },
        { type: 'choice', options: ['1 Silbe', '2 Silben', '3 Silben'], answer: '3 Silben', ask: 'Wie viele Silben hat Zitrone?', hint: 'So oft, wie du geklatscht hast.' }
    ]
};

/* ---------- Der Aufgabengenerator ----------

   Jede Aufgabe sieht gleich aus, egal welches Format:

     frage       steht ueber der Aufgabe
     hoeren      Woerter, die die App vorliest (Reihenfolge zaehlt)
     bild        grosses Bild zur Aufgabe (nur beim Silbenmodul)
     options     die Antwortkarten [{ emoji, wort }]
     answerIndex welche Karte richtig ist
     loesung     der Satz, der bei einem Fehler erklaert
     blatt       was auf dem Arbeitsblatt links steht                  */

function createTask(moduleId) {
    if (moduleId === 'reime') return reimAufgabe();
    if (moduleId === 'reimAusreisser') return ausreisserAufgabe();
    if (moduleId === 'anlaute') return anlautAufgabe();
    return silbenAufgabe();
}

function reimAufgabe() {
    const [gesucht, partner] = zweiAus(zufall(reimPaare));
    /* Ablenker duerfen sich NICHT auch reimen - sonst gaebe es zwei
       richtige Antworten. */
    const rest = ablenker(2, w => w.reim !== gesucht.reim);
    const options = mische([partner].concat(rest));

    return {
        frage: 'Welches Bild reimt sich?',
        hoeren: [gesucht.wort],
        bild: null,
        options: karten(options),
        answerIndex: options.indexOf(partner),
        loesung: `${gesucht.wort} reimt sich auf ${partner.wort}.`,
        blatt: gesucht.wort
    };
}

function ausreisserAufgabe() {
    const [a, b] = zweiAus(zufall(reimPaare));
    const aussen = zufall(woerter.filter(w => w.reim !== a.reim));
    const options = mische([a, b, aussen]);

    return {
        frage: 'Zwei Bilder reimen sich. Welches passt nicht dazu?',
        /* Alle drei vorlesen - sonst muesste das Kind raten, wie die
           Bilder heissen. */
        hoeren: options.map(w => w.wort),
        bild: null,
        options: karten(options),
        answerIndex: options.indexOf(aussen),
        loesung: `${a.wort} und ${b.wort} reimen sich. ${aussen.wort} nicht.`,
        blatt: ''
    };
}

function anlautAufgabe() {
    /* Gefragt ist hier kein Wort, sondern ein Buchstabe: er steht
       gross da UND wird vorgelesen. So verbindet das Kind Zeichen
       und Laut miteinander. */
    const gruppe = zufall(anlautPaare);
    const loesungswort = zufall(gruppe);
    const laut = anlautLaute[loesungswort.anlaut];
    const rest = ablenker(2, w => !anlautStoert(loesungswort.anlaut, w.anlaut));
    const options = mische([loesungswort].concat(rest));

    return {
        frage: `Welches Bild fängt mit ${laut.zeichen} an?`,
        zeichen: laut.zeichen,
        hoeren: laut.gedehnt ? [laut.zeichen, laut.gedehnt] : [laut.zeichen],
        bild: null,
        options: karten(options),
        answerIndex: options.indexOf(loesungswort),
        loesung: `${loesungswort.wort} fängt mit ${laut.zeichen} an.`,
        blatt: laut.zeichen,
        blattGross: true
    };
}

function silbenAufgabe() {
    /* Nur Woerter bis drei Silben - so bleiben die drei Antwortkarten
       immer 1, 2 und 3. */
    const wort = zufall(woerter.filter(w => w.silben <= 3));
    const options = [1, 2, 3].map(n => ({
        emoji: String(n),
        wort: n === 1 ? 'eine Silbe' : `${n} Silben`
    }));

    return {
        frage: 'Wie viele Silben hat das Wort?',
        hoeren: [wort.wort],
        bild: wort.emoji,
        options: options,
        answerIndex: wort.silben - 1,
        loesung: `${wort.wort} hat ${wort.silben === 1 ? 'eine Silbe' : wort.silben + ' Silben'}.`,
        /* Auf dem Blatt steht hier das Bild statt eines Wortes - sonst
           koennte das Kind die Silben ablesen statt zu klatschen. */
        blatt: wort.emoji,
        blattGross: true
    };
}

/* Reihenfolge der Kacheln und ihre Symbole. */
function initLearningModules() {
    const grid = document.getElementById('moduleGrid');
    if (!grid) return;
    const ids = ['reime', 'reimAusreisser', 'anlaute', 'silben'];
    const emojis = ['🎵', '🔍', '🅰️', '👏'];

    grid.innerHTML = ids.map((id, i) => {
        const m = learningModules[id];
        return `<button class="operation-btn ${m.color}" onclick="openLearningModule('${id}')">
                    <span class="emoji">${emojis[i] || '✦'}</span>
                    <span class="text">${m.title}</span>
                    <span class="card-hint">${m.kachel || ''}</span>
                </button>`;
    }).join('');
}


/* ============================================================
   4. Der Motor der Lernmodule

   Ab hier muss beim Fuellen einer neuen App nichts geaendert
   werden - alles kommt aus dem Register in Teil 3.
   ============================================================ */

const RUNDE_SEKUNDEN = 180;

let activeModule = null;
let currentTask = null;
let practiceScore = 0;
let practiceTimed = true;
let practiceTimer = RUNDE_SEKUNDEN;
let practiceTimerInterval = null;

let coachActive = false;
let coachStep = 0;

let explanationStep = 0;
let explanationPhase = 'ask';   // 'ask' = Frage offen, 'done' = aufgedeckt
let explanationTries = 0;
let explanationFeedback = '';

function openLearningModule(moduleId) {
    activeModule = learningModules[moduleId];
    activeModule.id = moduleId;

    document.getElementById('learningModuleCategory').innerText = activeModule.category;
    document.getElementById('learningModuleTitle').innerText = activeModule.title;
    document.getElementById('learningModuleDescription').innerText = activeModule.description;

    // Ueben: zurueck auf die Startwahl
    coachActive = false;
    document.getElementById('coachPanel').classList.remove('visible');
    document.getElementById('coachToggle').classList.remove('active');
    document.getElementById('practiceStartChoice').hidden = false;
    document.getElementById('practiceExerciseContent').hidden = true;
    practiceScore = 0;
    document.getElementById('practiceScore').innerText = '0 Punkte';

    // immer mit dem ersten Reiter beginnen
    document.querySelectorAll('.learning-action').forEach(b => b.classList.remove('active'));
    document.querySelector('.learning-action').classList.add('active');
    showLearningPanel('practicePanel');

    explanationStep = 0;
    explanationPhase = 'ask';
    explanationTries = 0;
    explanationFeedback = '';
    renderExplanation();
    renderWorksheetPreview();

    showScreen('learningModuleScreen');
}

function showLearningPanel(panelId, button) {
    document.querySelectorAll('.learning-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
    if (button) {
        document.querySelectorAll('.learning-action').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
    }
}

/* ---------- Reiter 1: Ueben ---------- */

function startPractice(timed) {
    practiceTimed = timed;
    practiceTimer = RUNDE_SEKUNDEN;
    practiceScore = 0;
    document.getElementById('practiceStartChoice').hidden = true;
    document.getElementById('practiceExerciseContent').hidden = false;
    document.getElementById('practiceScore').innerText = '0 Punkte';
    document.getElementById('practiceTimer').hidden = !timed;
    nextPracticeTask();
    if (timed) {
        updatePracticeTimer();
        practiceTimerInterval = setInterval(() => {
            practiceTimer--;
            updatePracticeTimer();
            if (practiceTimer <= 0) {
                clearInterval(practiceTimerInterval);
                practiceTimerInterval = null;
                endPractice();
            }
        }, 1000);
    }
}

function endPractice() {
    if (kannVorlesen()) window.speechSynthesis.cancel();
    /* Ein Stern je zwei Punkte - Kinder sollen sehen, was sie
       geschafft haben, nicht was ihnen fehlt. */
    const sterne = Math.min(5, Math.floor(practiceScore / 2));
    const feedback = document.getElementById('practiceFeedback');
    feedback.innerHTML = `Zeit vorbei! Du hast ${practiceScore} Punkte.
        <span class="sterne">${'★'.repeat(sterne)}${'☆'.repeat(5 - sterne)}</span>`;
    feedback.className = 'strategy-feedback';
    document.getElementById('practiceOptions').innerHTML = '';
    document.getElementById('practiceTask').innerHTML = '';
    document.getElementById('practiceNext').hidden = true;
    document.getElementById('practiceStartChoice').hidden = false;
}

function updatePracticeTimer() {
    const min = Math.floor(practiceTimer / 60);
    const sek = String(practiceTimer % 60).padStart(2, '0');
    document.getElementById('practiceTimer').innerText = `${min}:${sek}`;
}

/* Die Hoerkarte ist der Kern der App: das gesuchte Wort steht
   NICHT da, es wird nur gesprochen. Antippen wiederholt es. */
function taskHtml(task) {
    /* Drei Gesichter derselben Karte:
       - ein Buchstabe steht gross da und wird vorgelesen (Anlaute)
       - mehrere Woerter werden nacheinander gesprochen (Ausreisser)
       - sonst ein einzelnes Wort, das NUR zu hoeren ist            */
    if (task.zeichen) {
        return `
            <button class="hoer-karte buchstabe" onclick="sprichAufgabe()">
                <span class="buchstabe-zeichen">${task.zeichen}</span>
                <span class="hoer-text">🔊 Buchstabe hören</span>
                <span class="hoer-hint">Tippen zum Wiederholen</span>
            </button>`;
    }
    const mehrere = task.hoeren.length > 1;
    return `
        ${task.bild ? `<div class="aufgaben-bild">${task.bild}</div>` : ''}
        <button class="hoer-karte" onclick="sprichAufgabe()">
            <span class="hoer-icon">🔊</span>
            <span class="hoer-text">${mehrere ? 'Alle Wörter hören' : 'Hör zu!'}</span>
            <span class="hoer-hint">Tippen zum Wiederholen</span>
        </button>`;
}

/* Nur sprechen, wenn die Uebung auch wirklich zu sehen ist - sonst
   redet die App noch in einen Bildschirm hinein, den das Kind
   laengst verlassen hat. */
function sprichAufgabe() {
    const screen = document.getElementById('learningModuleScreen');
    if (!currentTask || !screen.classList.contains('active')) return;
    sprichFolge(currentTask.hoeren);
}

function nextPracticeTask() {
    if (!activeModule) return;
    currentTask = createTask(activeModule.id);

    document.getElementById('practiceTask').innerHTML = taskHtml(currentTask);

    /* Jede Karte hat ihr eigenes kleines 🔊: nur so weiss das Kind
       sicher, wie das Bild heisst. Ohne Wortnamen ist ein Bild sonst
       ratbar - "Baum" oder "Wald"? */
    document.getElementById('practiceOptions').innerHTML = currentTask.options.map((o, i) => `
        <button class="bild-option" onclick="checkPracticeAnswer(${i}, this)" aria-label="${o.wort}">
            <span class="bild-emoji">${o.emoji}</span>
            <span class="bild-hoeren" role="button" title="Wort hören"
                  onclick="event.stopPropagation(); lesVor('${o.wort}')">🔊</span>
        </button>`).join('');

    document.getElementById('practiceFeedback').innerText = '';
    document.getElementById('practicePrompt').innerText = currentTask.frage;
    document.getElementById('practiceNext').hidden = true;

    /* Kurz warten: sonst spricht die Stimme, bevor das Kind die neue
       Aufgabe ueberhaupt sieht. */
    setTimeout(sprichAufgabe, 350);

    if (coachActive) initCoach();
}

function checkPracticeAnswer(index, button) {
    document.querySelectorAll('#practiceOptions .bild-option').forEach(b => b.disabled = true);
    const feedback = document.getElementById('practiceFeedback');

    if (index === currentTask.answerIndex) {
        practiceScore++;
        document.getElementById('practiceScore').innerText = `${practiceScore} Punkte`;
        feedback.innerText = 'Richtig! ' + currentTask.loesung;
        feedback.className = 'strategy-feedback correct';
        button.classList.add('answer-correct');
        lesVor('Richtig!');
        /* Etwas mehr Zeit als in einer Rechen-App: das Lob wird noch
           gesprochen, wenn die naechste Aufgabe schon kaeme. */
        setTimeout(nextPracticeTask, 1600);
    } else {
        feedback.innerText = 'Noch nicht. ' + currentTask.loesung;
        feedback.className = 'strategy-feedback wrong';
        button.classList.add('answer-wrong');
        const richtig = document.querySelectorAll('#practiceOptions .bild-option')[currentTask.answerIndex];
        if (richtig) richtig.classList.add('answer-correct');
        lesVor(currentTask.loesung);
        document.getElementById('practiceNext').hidden = false;
    }
}

/* ---------- Lerncoach ---------- */

function coachSteps() {
    if (!activeModule) return [];
    if (activeModule.coachSchritte) return activeModule.coachSchritte(currentTask);
    return (activeModule.coach || []).map(frage => ({ frage }));
}

function toggleCoach() {
    coachActive = !coachActive;
    document.getElementById('coachPanel').classList.toggle('visible', coachActive);
    document.getElementById('coachToggle').classList.toggle('active', coachActive);
    if (coachActive) initCoach();
}

function initCoach() {
    coachStep = 0;
    renderCoachStep();
}

function renderCoachStep() {
    const steps = coachSteps();
    const step = steps[coachStep];
    if (!step) return;
    document.getElementById('coachMessage').innerHTML =
        `<strong>Schritt ${coachStep + 1}</strong><br>${step.frage}${step.antwort ? `<br><em>${step.antwort}</em>` : ''}`;
}

function coachNext() {
    if (coachStep < coachSteps().length - 1) { coachStep++; renderCoachStep(); }
}

function coachBack() {
    if (coachStep > 0) { coachStep--; renderCoachStep(); }
}

/* ---------- Reiter 2: Erklaeraufgabe ---------- */

function guidedSteps() {
    return (activeModule && guidedExplanations[activeModule.id]) || [];
}

function renderExplanation() {
    if (!activeModule) return;
    renderExplanationVisual();
    renderExplanationChecklist();
    renderExplanationInteraction();

    const gesamt = activeModule.steps.length;
    const nummer = Math.min(explanationStep + 1, gesamt);
    document.getElementById('explanationProgress').innerText = `Schritt ${nummer} von ${gesamt}`;
    document.getElementById('explanationProgressBar').style.width = `${(nummer / gesamt) * 100}%`;
    document.getElementById('explanationBack').disabled = explanationStep === 0;
    document.getElementById('explanationNext').disabled = explanationPhase === 'ask';
    document.getElementById('explanationNext').innerText =
        explanationStep >= gesamt - 1 ? 'Fertig' : 'Weiter →';
}

function renderExplanationVisual() {
    const ex = activeModule.explanation;
    const leuchtet = (ex.highlight && ex.highlight[explanationStep]) || [];
    const zeigen = explanationPhase === 'done';
    /* Der Merksatz kommt erst zum Schluss: er beantwortet sonst die
       Frage des ersten Schrittes ("Wo klingen Reimwörter gleich?"). */
    const letzterSchritt = explanationStep === activeModule.steps.length - 1;

    const bilderHtml = ex.bilder.map(b => `
        <span class="ex-bild${leuchtet.includes(b.name) && zeigen ? ' leuchtet' : ''}" data-ex-slot="${b.name}">
            <span class="ex-emoji">${b.emoji}</span>
            <span class="ex-wort">${b.wort}</span>
        </span>`).join('');

    document.getElementById('explanationVisual').innerHTML = `
        ${ex.buchstabe ? `<button class="hoer-karte klein buchstabe" onclick="lesVor('${ex.buchstabe}')">
            <span class="buchstabe-zeichen">${ex.buchstabe}</span><span class="hoer-hint">🔊 Tippen zum Hören</span>
         </button>` : ''}
        ${ex.hoerwort ? `<button class="hoer-karte klein" onclick="lesVor('${ex.hoerwort}')">
            <span class="hoer-icon">🔊</span><span class="hoer-text">${ex.hoerwort}</span>
         </button>` : ''}
        <div class="ex-bilder" onclick="pickExplanationSlot(event)">${bilderHtml}</div>
        ${zeigen && ex.working && ex.working[explanationStep] ? `<p class="ex-working">${ex.working[explanationStep]}</p>` : ''}
        ${letzterSchritt && ex.caption ? `<p class="ex-caption">${ex.caption}</p>` : ''}`;
}

function renderExplanationChecklist() {
    /* Erledigte Schritte bleiben lesbar stehen, kommende sind noch
       verdeckt - sonst verrieten sie die Antwort der offenen Frage. */
    document.getElementById('explanationSteps').innerHTML = activeModule.steps.map((satz, i) => {
        if (i < explanationStep || (i === explanationStep && explanationPhase === 'done')) {
            return `<div class="learning-step done">${satz}</div>`;
        }
        return `<div class="learning-step offen">…</div>`;
    }).join('');
}

function renderExplanationInteraction() {
    const box = document.getElementById('explanationInteraction');
    const step = guidedSteps()[explanationStep];

    if (!step || explanationPhase === 'done') {
        box.innerHTML = explanationFeedback ? `<p class="ex-feedback">${explanationFeedback}</p>` : '';
        return;
    }

    const tipp = explanationTries > 0 && step.hint ? `<p class="ex-hint">${step.hint}</p>` : '';
    if (step.type === 'choice') {
        box.innerHTML = `<p class="ex-ask">${step.ask}</p>${tipp}
            <div class="ex-options">${step.options.map((o, i) =>
                `<button class="option-btn" onclick="answerExplanationChoice(${i}, this)">${o}</button>`).join('')}</div>`;
    } else {
        box.innerHTML = `<p class="ex-ask">${step.ask}</p>${tipp}
            <p class="ex-note">Tippe oben das passende Bild an.</p>`;
    }
}

function pickExplanationSlot(event) {
    const step = guidedSteps()[explanationStep];
    if (!step || step.type !== 'pick' || explanationPhase === 'done') return;
    const slot = event.target.closest('[data-ex-slot]');
    if (!slot) return;
    if (slot.dataset.exSlot === step.target) solveExplanationStep(true);
    else missExplanationStep(slot);
}

function answerExplanationChoice(index, button) {
    const step = guidedSteps()[explanationStep];
    if (!step || explanationPhase === 'done') return;
    if (step.options[index] === step.answer) solveExplanationStep(true);
    else missExplanationStep(button);
}

function solveExplanationStep(selbstGefunden) {
    explanationPhase = 'done';
    explanationFeedback = selbstGefunden ? 'Genau! 🎉' : `Schau: ${activeModule.steps[explanationStep]}`;
    renderExplanation();
}

/* Erster Fehlversuch: Tipp. Zweiter: aufloesen. Kinder sollen nicht
   vor einer verschlossenen Tuer sitzen bleiben. */
function missExplanationStep(element) {
    explanationTries++;
    if (element) {
        element.classList.add('daneben');
        setTimeout(() => element.classList.remove('daneben'), 500);
    }
    if (explanationTries >= 2) solveExplanationStep(false);
    else renderExplanationInteraction();
}

function nextExplanationStep() {
    if (explanationPhase === 'ask') return;
    /* Am letzten Schritt fuehrt "Fertig" zum Ueben - sonst stuende das
       Kind vor einem Knopf, der nichts tut. */
    if (explanationStep >= activeModule.steps.length - 1) {
        showLearningPanel('practicePanel', document.querySelector('.learning-action'));
        return;
    }
    explanationStep++;
    explanationPhase = guidedSteps()[explanationStep] ? 'ask' : 'done';
    explanationTries = 0;
    explanationFeedback = '';
    renderExplanation();
}

function previousExplanationStep() {
    if (explanationStep === 0) return;
    explanationStep--;
    explanationPhase = 'done';   // schon Gesehenes bleibt sichtbar
    explanationTries = 0;
    explanationFeedback = '';
    renderExplanation();
}

/* ---------- Reiter 3: Arbeitsblatt ---------- */

/* Auf Papier gibt es keinen Ton. Deshalb steht das gesuchte Wort
   dort als Text - ein Erwachsener liest es vor. */
function worksheetTasks() {
    return Array.from({ length: 8 }, (_, i) => {
        const t = createTask(activeModule.id);
        return { nr: i + 1, task: t };
    });
}

function worksheetHtml(zeilen) {
    return zeilen.map(({ nr, task }) => `
        <div class="ws-zeile">
            <span class="ws-nr">${nr}.</span>
            <span class="ws-wort${task.blattGross ? ' gross' : ''}">${task.blatt}</span>
            <span class="ws-bilder">${task.options.map(o => `<span class="ws-kasten">${o.emoji}</span>`).join('')}</span>
        </div>`).join('');
}

function renderWorksheetPreview() {
    if (!activeModule) return;
    const zeilen = worksheetTasks();
    document.getElementById('worksheetIntro').innerText = activeModule.blattAnleitung;
    document.getElementById('worksheetPreview').innerHTML =
        `<div class="worksheet-sheet"><h4>${activeModule.title}</h4>
            <p class="ws-anleitung">${activeModule.blattAnleitung}</p>
            ${worksheetHtml(zeilen)}</div>
         <div class="worksheet-sheet solutions"><h4>Lösungen</h4>
            ${zeilen.map(({ nr, task }) => `<div class="ws-loesung">${nr}. ${task.options[task.answerIndex].wort}</div>`).join('')}</div>`;
}

function printWorksheet() {
    renderWorksheetPreview();
    const inhalt = document.getElementById('worksheetPreview').innerHTML;
    const fenster = window.open('', '_blank');
    if (!fenster) return;
    fenster.document.write(`<html><head><title>Arbeitsblatt ${activeModule.title}</title>
        <meta charset="UTF-8">
        <style>body{font-family:Arial,sans-serif;padding:24px;color:#222}
        h4{font-size:22px;margin-bottom:6px}
        .ws-anleitung{color:#555;margin-bottom:18px}
        .ws-zeile{display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid #ddd}
        .ws-nr{width:26px;font-weight:bold}
        .ws-wort{width:130px;font-size:20px}
        .ws-wort.gross{font-size:34px;font-weight:bold}
        .ws-bilder{display:flex;gap:14px}
        .ws-kasten{display:inline-flex;align-items:center;justify-content:center;
                   width:64px;height:64px;font-size:34px;border:2px solid #999;border-radius:12px}
        .ws-loesung{font-size:18px;padding:8px 0;border-bottom:1px solid #ddd}
        .solutions{page-break-before:always}
        @media print{.solutions{page-break-before:always}}</style></head>
        <body>${inhalt}
        <script>window.onload=function(){window.print();}<\/script></body></html>`);
    fenster.document.close();
}


/* ============================================
   Start
   ============================================ */
initLearningModules();
/* Die Stimmenliste kommt im Browser verzoegert - ohne diesen Anstoss
   spricht die erste Aufgabe manchmal auf Englisch. */
if (kannVorlesen()) window.speechSynthesis.onvoiceschanged = () => deutscheStimme();
