/* Тест «Какой ты блогер» для Карины (Kerry Catt).
 * Логика и тексты: raboty/test-miniapp.md (механика v5) и raboty/test-types.md.
 * Типы блогеров приходят из types.js (генерируется tools/build_types.py).
 */
(function () {
  'use strict';

  var CONFIG = {
    // URL веб-приложения Google Apps Script (backend/Code.js). Пусто — ответы копятся в браузере.
    endpoint: 'https://script.google.com/macros/s/AKfycbyHbXYMZMWX1belQqULpMz84rfmhP2LXmcIMzroqhr4PKjvNOxIR4lump3OfY04ZC4x/exec',
    // ЗАГЛУШКА: ссылка-приглашение в закрытый канал предзаписи (АП). Пока пусто, кнопка показывает подсказку.
    channelUrl: '',
    teamUrl: 'https://t.me/kerryhelper',
    gameStart: '16 ноября'
  };

  var STORE = 'kc_blogger_test_v1';
  var LETTER = { E: 'expert', C: 'sovet', P: 'pravda', R: 'rasskaz', D: 'svoya', M: 'smelaya', G: 'gid' };
  var TYPES = {};
  (window.TYPES || []).forEach(function (t) { TYPES[t.id] = t; });
  var ORDER = ['expert', 'sovet', 'pravda', 'rasskaz', 'svoya', 'smelaya', 'gid'];

  /* ── Вопросы ─────────────────────────────────────────── */
  var QUESTIONS = [
    { id: 'state', text: 'Что сейчас мешает тебе больше всего?', afterBy: {
        NOL: 'Нормально. Я свою тему тоже не выбирала',
        MNOGO: 'У меня тоже всё в кучу. Разберёмся',
        STRAH: 'Толку-то бояться? Что это изменит?',
        BROSAYU: 'Обычно бросают, потому что каждый раз сидят и думают, что бы снять. Это выматывает. Тебе думать не надо, темы и готовые ролики ниже. А дальше это дисциплина. Как в тренажёрный зал',
        NENUZHNO: 'Мне тоже казалось, что во мне ничего нет',
        PLATO: 'Поняла. Скорее всего, дело не в тебе',
        SKUCHNO: 'Скучных тем нет. Есть скучно рассказанные',
        RASTU: 'Отлично. Тогда ищем, куда расти'
      }, opts: [
      ['Не знаю, про что снимать', 'NOL'],
      ['Тем много, не могу выбрать одну', 'MNOGO'],
      ['Стесняюсь камеры и боюсь, что осудят', 'STRAH'],
      ['Начинаю и бросаю', 'BROSAYU'],
      ['Кажется, что мои ролики никому не нужны', 'NENUZHNO'],
      ['Снимаю, но ролики никто не смотрит', 'PLATO'],
      ['Боюсь, что про моё дело будет скучно', 'SKUCHNO'],
      ['Ничего, блог идёт, хочу расти быстрее', 'RASTU']
    ] },
    { id: 'stories', caption: 'В сторис чаще всего выкладываешь', text: 'Что ты чаще всего выкладываешь в сторис?', opts: [
      ['Истории, которые со мной случились', 'R'], ['Своё мнение о том, что происходит', 'P'], ['Свой день, еду, дом, покупки', 'D'],
      ['Что я начала и как идёт', 'M'], ['Свою работу изнутри или место, где живу', 'G'], ['Полезное из своей профессии', 'E'],
      ['Советы и находки', 'C'], ['Почти ничего не выкладываю', 'NONE']
    ] },
    { id: 'people', caption: 'Тебе чаще всего говорят', text: 'Что из этого тебе говорят чаще всего?', quote: true, opts: [
      ['Ты так рассказываешь, я заслушалась', 'R'], ['Ты одна скажешь как есть', 'P'], ['С тобой так легко', 'D'],
      ['Ну ты даёшь, я бы так не смогла', 'M'], ['Расскажи, как у вас там всё устроено', 'G'], ['Ты в этом разбираешься лучше всех', 'E'],
      ['Ты всегда поможешь и подскажешь', 'C'], ['Ничего из этого', 'NONE']
    ] },
    { id: 'watch', caption: 'Досматриваешь до конца', text: 'Про что видео ты чаще всего досматриваешь до конца?', opts: [
      ['Про здоровье, психологию, деньги, когда объясняет специалист', 'E'], ['Про рецепты, уход, порядок в доме. Всё, что можно сразу повторить', 'C'],
      ['Про то, о чём все думают, но молчат', 'P'], ['Про истории, которые с кем-то случились', 'R'],
      ['Про обычную жизнь и смешное, где узнаёшь себя', 'D'], ['Про то, как человек похудел, переехал или начал с нуля', 'M'],
      ['Про путешествия и то, как живут в других странах и семьях', 'G'], ['Про всё подряд, как попадётся', 'NONE']
    ] },
    { id: 'comment', caption: 'Больше всего порадует комментарий', text: 'Какой комментарий под твоим роликом порадует тебя больше всего?', quote: true, after: 'Ага, уже кое-что вижу 👀', opts: [
      ['Не могла оторваться, чем всё кончилось?', 'R'], ['Наконец-то кто-то сказал это вслух', 'P'], ['Как будто про меня', 'D'],
      ['Ты меня вдохновила, я тоже начну', 'M'], ['Никогда не думала, что там всё так устроено', 'G'],
      ['Вы профи, как к вам попасть?', 'E'], ['Сохранила, очень пригодится', 'C']
    ] },
    { id: 'post', caption: 'Первый пост, который ты бы написала', text: 'Какой пост ты написала бы первым, если бы не стеснялась?', opts: [
      ['Историю, которую я всем рассказываю', 'R'], ['Всё, что я думаю про одну вещь', 'P'], ['Как на самом деле выглядит мой день', 'D'],
      ['Как я всё поменяла и что из этого вышло', 'M'], ['Что никто не знает про мою работу или жизнь', 'G'],
      ['Разбор ошибок, которые делают все в моей теме', 'E'], ['Советы, которые реально работают', 'C']
    ] },
    { id: 'known', caption: 'Про тебя точнее всего', text: 'Что про тебя точнее всего?', opts: [
      ['Со мной вечно что-то случается', 'R'], ['Мне лучше не наступать на больное, отвечу', 'P'], ['У меня всё по-простому, без понтов', 'D'],
      ['Я постоянно что-то начинаю', 'M'], ['Про мою жизнь всем любопытно', 'G'], ['Я профи в своём деле', 'E'],
      ['Ко мне можно прийти с любым вопросом', 'C']
    ] },
    { id: 'film', caption: 'Фильм про тебя', text: 'Если бы про тебя сняли фильм, какой бы он был?', opts: [
      ['Комедия про то, что со мной вечно случается', 'R'], ['Фильм, где героиня всем говорит правду', 'P'], ['Простое кино про обычную жизнь, как у всех', 'D'],
      ['Фильм про то, как я всё поменяла', 'M'], ['Документалка про мир, в котором я живу', 'G'], ['Фильм про то, как я стала лучшей в своём деле', 'E'],
      ['Фильм, где героиня всем помогает', 'C']
    ] },
    { id: 'easy', caption: 'Тебе легче всего', text: 'Представь, что ты уже снимаешь. Что тебе легче всего?', after: 'Последний вопрос', opts: [
      ['Рассказать историю, которая со мной случилась', 'R'], ['Прямо сказать, что я думаю', 'P'], ['Показать свой день', 'D'],
      ['Рассказать, что я поменяла и что дальше', 'M'], ['Показать то, чего другие не видели', 'G'],
      ['Объяснить что-то из своей профессии или увлечения', 'E'], ['Дать совет, который реально поможет', 'C']
    ] },
    { id: 'limits', text: 'Про что ты точно не будешь снимать?', hint: 'Можно несколько', multi: true, exclusive: 'all', opts: [
      ['Детей в кадре', 'kids'], ['Мужа и отношения', 'muzh'], ['Работу, чтобы коллеги не увидели', 'work'], ['Свой возраст', 'age'],
      ['Прошлое, то, что болит', 'past'], ['Могу про всё', 'all']
    ] }
  ];
  var TYPE_QS = QUESTIONS.filter(function (q) { return q.caption; });
  var MIRROR_ORDER = ['easy', 'people', 'comment', 'stories', 'known', 'post', 'film', 'watch'];

  var STATE_TEXT = {
    NOL: 'Тема у тебя есть. Ты просто не знала, где её искать. Теперь знаешь',
    MNOGO: 'Выбирать одну не надо. Я вот не выбирала, у меня всё в кучу. Главное понять, какой ты блогер. Это ты теперь знаешь',
    NENUZHNO: 'Надо это или нет, покажут просмотры, а не твои мысли. Сними пять роликов ниже и посмотри',
    PLATO: 'Чаще всего ролик не смотрят из-за первой фразы. Поэтому у каждого ролика ниже первая фраза уже готова',
    SKUCHNO: 'Скучно бывает не от темы, а от того, как рассказываешь. Твоё дело может звучать живо, ниже покажу как',
    RASTU: 'Раз всё идёт, дальше растут те, кто снимает каждый день и не повторяется. Ниже темы под твой тип, чтобы не выдохнуться',
    STRAH: 'Не бойся. Всегда будут осуждать. Ты в принципе можешь ничего не делать, они будут недовольны, что ты просто здесь стоишь',
    BROSAYU: 'Обычно бросают, потому что каждый раз сидят и думают, что бы снять. Это выматывает. Тебе думать не надо, темы и готовые ролики ниже. А дальше это дисциплина. Как в тренажёрный зал'
  };
  var STATE_STOP = { NOL: ['нет идей, о чём снимать'], MNOGO: ['тем много, не могу выбрать одну'], NENUZHNO: ['мой контент никому не нужен'], STRAH: ['кажется, что я кринж', 'боюсь, что осудят знакомые'], BROSAYU: ['руки не доходят'] };

  var LIMIT_WORDS = {
    kids: /ребён|ребен|(^|[^а-яё])дет(и|ей|ьми|ям|ях)([^а-яё]|$)|(^|[^а-яё])(сын|доч)/i,
    muzh: /муж|познакомил|свидани|свекров/i,
    work: /работ|рабоч|клиент|професси|уволи|мастер|коллег/i,
    age: /возраст|после 35|за 40|40 /i,
    past: /боюсь|рухнул/i
  };

  /* ── Анкета предзаписи (ТЗ Ильи) ─────────────────────── */
  var FORM = [
    { title: 'Контакты', fields: [
      { id: 'name', label: 'Имя', type: 'text', auto: 'given-name' },
      { id: 'age', label: 'Возраст', type: 'number' },
      { id: 'tgNick', label: 'Ник в Телеграме', type: 'text', hint: 'Например, @karina' },
      { id: 'instagram', label: 'Ссылка на Инстаграм', type: 'text', hint: 'Ссылка или ник' },
      { id: 'phone', label: 'Номер', type: 'tel', auto: 'tel' }
    ] },
    { title: 'Блог', fields: [
      { id: 'blog', label: 'Что сейчас с блогом', type: 'one', opts: ['нет блога', 'только начинаю', 'веду, но не растёт', 'веду, и он растёт'] },
      { id: 'followers', label: 'Сколько подписчиков', type: 'one', opts: ['нет', 'до 1 000', '1–5 тыс', '5–20 тыс', 'больше 20 тыс'] },
      { id: 'why', label: 'Зачем тебе блог', type: 'one', opts: ['для себя', 'чтобы приходили клиенты', 'хочу стать блогером и зарабатывать на этом'] },
      { id: 'about', label: 'О чём твой блог или хотела бы', type: 'area', hint: 'Пара слов' }
    ] },
    { title: 'Что мешает', fields: [
      { id: 'stops', label: 'Что останавливает снимать', hint: 'Можно несколько', type: 'many', opts: ['мой контент никому не нужен', 'кажется, что я кринж', 'нет идей, о чём снимать', 'тем много, не могу выбрать одну', 'боюсь, что осудят знакомые', 'переснимаю и удаляю', 'руки не доходят'] },
      { id: 'courses', label: 'Проходила курсы по блогингу', type: 'one', opts: ['да, помогло', 'да, не помогло', 'нет'] },
      { id: 'withUs', label: 'Была с нами раньше', type: 'one', opts: ['на Разминке', 'в Большой Игре', 'нет'] }
    ] },
    { title: 'Готовность', fields: [
      { id: 'when', label: 'Когда готова начать', type: 'one', opts: ['прямо сейчас', 'в ближайший месяц', 'позже, пока присматриваюсь'] },
      { id: 'invest', label: 'Готова вкладываться в обучение', type: 'one', opts: ['да', 'зависит от цены', 'нет, ищу бесплатное'] },
      { id: 'format', label: 'Какой формат ближе', type: 'one', opts: ['сама в своём темпе', 'в группе с куратором и чатом'] },
      { id: 'result', label: 'Какой результат хочешь через 40 дней', type: 'area', hint: 'Пара слов' },
      { id: 'consult', label: 'Хочешь консультацию по твоему контенту и Большой Игре 2.0?', type: 'one', opts: ['да, хочу', 'пока нет'] }
    ] }
  ];

  /* ── Телеграм и окружение ────────────────────────────── */
  var W = window.Telegram && window.Telegram.WebApp;
  var inTG = !!(W && W.initData);
  var user = inTG && W.initDataUnsafe && W.initDataUnsafe.user ? W.initDataUnsafe.user : null;
  var params = new URLSearchParams(location.search);
  var source = (inTG && W.initDataUnsafe.start_param) || params.get('src') || params.get('utm_source') || 'direct';

  if (inTG) {
    try {
      W.ready(); W.expand();
      if (W.setHeaderColor) W.setHeaderColor('#FFFFFF');
      if (W.setBackgroundColor) W.setBackgroundColor('#FFFFFF');
      if (W.disableVerticalSwipes) W.disableVerticalSwipes();
    } catch (e) { /* старый клиент */ }
  }

  function haptic(kind) {
    try { if (inTG && W.HapticFeedback) { kind === 'ok' ? W.HapticFeedback.notificationOccurred('success') : W.HapticFeedback.selectionChanged(); } } catch (e) {}
  }

  /* ── Состояние ───────────────────────────────────────── */
  var S = load() || fresh();
  function fresh() {
    return { v: 1, answers: {}, idx: 0, result: null, form: {}, step: 0, sent: {}, orderSeed: Math.random() };
  }
  function load() { try { var s = JSON.parse(localStorage.getItem(STORE)); return s && s.v === 1 ? s : null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }

  var app = document.getElementById('app');
  var screen = 'start';

  /* ── Утилиты ─────────────────────────────────────────── */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function firstName() { var n = (S.form.name || (user && user.first_name) || '').trim(); return n.split(' ')[0]; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function rng(seed) { var x = Math.floor(seed * 2147483646) + 1; return function () { x = x * 16807 % 2147483647; return (x - 1) / 2147483646; }; }
  function shuffled(q) {
    var r = rng(S.orderSeed + QUESTIONS.indexOf(q) * 0.013);
    var list = q.opts.map(function (o, i) { return { t: o[0], v: o[1], i: i }; });
    var fixed = list.filter(function (o) { return o.v === q.exclusive || o.v === 'NONE'; });
    var rest = list.filter(function (o) { return fixed.indexOf(o) < 0; });
    if (q.id !== 'state') for (var i = rest.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var tmp = rest[i]; rest[i] = rest[j]; rest[j] = tmp; }
    return rest.concat(fixed);
  }
  function toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(function () { el.hidden = true; }, 1800);
  }
  function openLink(url) {
    if (!url) return;
    if (inTG && /^https:\/\/t\.me\//.test(url) && W.openTelegramLink) W.openTelegramLink(url);
    else if (inTG && W.openLink) W.openLink(url);
    else window.open(url, '_blank', 'noopener');
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return true; }, fallback);
    return Promise.resolve(fallback());
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); return ok;
    }
  }

  /* ── Отправка в таблицу ──────────────────────────────── */
  function payload(kind) {
    var r = S.result || {};
    return {
      kind: kind,
      source: source,
      initData: inTG ? W.initData : '',
      tg: user ? { id: user.id, username: user.username || '', first_name: user.first_name || '' } : {},
      test: {
        type: r.main ? TYPES[r.main].name : '',
        second: r.second ? TYPES[r.second].name : '',
        scores: r.counts ? ORDER.map(function (id) { return TYPES[id].name + ' ' + (r.counts[id] || 0); }).join(', ') : '',
        state: S.answers.state || '',
        limits: (S.answers.limits || []),
        answers: QUESTIONS.map(function (q) {
          var a = S.answers[q.id]; if (a == null) return '';
          var list = [].concat(a).map(function (v) { var o = q.opts.filter(function (x) { return x[1] === v; })[0]; return o ? o[0] : v; });
          return (QUESTIONS.indexOf(q) + 1) + '. ' + list.join(' / ');
        }).join('\n')
      },
      anketa: kind === 'lead' ? S.form : undefined,
      ua: navigator.userAgent.slice(0, 160)
    };
  }
  function send(kind) {
    var body = JSON.stringify(payload(kind));
    if (!CONFIG.endpoint) { queue(body); return Promise.resolve(false); }
    return fetch(CONFIG.endpoint, { method: 'POST', body: body })
      .then(function (r) { return r.json(); })
      .then(function (j) { return !!(j && j.ok); })
      .catch(function () {
        return fetch(CONFIG.endpoint, { method: 'POST', mode: 'no-cors', body: body }).then(function () { return true; }, function () { queue(body); return false; });
      });
  }
  function queue(body) {
    try { var q = JSON.parse(localStorage.getItem(STORE + '_q') || '[]'); q.push(body); localStorage.setItem(STORE + '_q', JSON.stringify(q.slice(-10))); } catch (e) {}
  }
  function flush() {
    if (!CONFIG.endpoint) return;
    var q; try { q = JSON.parse(localStorage.getItem(STORE + '_q') || '[]'); } catch (e) { q = []; }
    if (!q.length) return;
    try { localStorage.removeItem(STORE + '_q'); } catch (e) {}
    q.forEach(function (body) { fetch(CONFIG.endpoint, { method: 'POST', mode: 'no-cors', body: body }).catch(function () { queue(body); }); });
  }

  /* ── Подсчёт типа ────────────────────────────────────── */
  function compute() {
    var counts = {}; ORDER.forEach(function (id) { counts[id] = 0; });
    TYPE_QS.forEach(function (q) { var v = S.answers[q.id]; if (v && LETTER[v]) counts[LETTER[v]]++; });
    var max = Math.max.apply(null, ORDER.map(function (id) { return counts[id]; }));
    var tied = ORDER.filter(function (id) { return counts[id] === max; });
    var main = tied[0];
    if (tied.length > 1) {
      var pick = ['easy', 'stories'].map(function (k) { return LETTER[S.answers[k]]; }).filter(function (id) { return tied.indexOf(id) >= 0; })[0];
      if (pick) main = pick;
    }
    var rest = ORDER.filter(function (id) { return id !== main; }).sort(function (a, b) { return counts[b] - counts[a]; });
    var second = counts[rest[0]] >= 2 ? rest[0] : null;
    var mirror = MIRROR_ORDER.map(function (k) { return QUESTIONS.filter(function (q) { return q.id === k; })[0]; })
      .filter(function (q) { return LETTER[S.answers[q.id]] === main; })
      .slice(0, 3)
      .map(function (q) { var o = q.opts.filter(function (x) { return x[1] === S.answers[q.id]; })[0]; return { caption: q.caption, text: o[0], quote: !!q.quote }; });
    return { main: main, second: second, counts: counts, total: TYPE_QS.length, mirror: mirror };
  }

  function allowed(text) {
    var lim = S.answers.limits || [];
    return !lim.some(function (k) { return LIMIT_WORDS[k] && LIMIT_WORDS[k].test(text); });
  }
  function pickTopics(r) {
    var list = TYPES[r.main].topics.filter(allowed);
    if (list.length < 12 && r.second) list = list.concat(TYPES[r.second].topics.filter(allowed)).slice(0, 12);
    return list;
  }
  function pickReels(r) {
    var ok = function (x) { return allowed(x.phrase + ' ' + x.next); };
    var list = TYPES[r.main].reels.filter(ok);
    if (list.length < 5) {
      var extra = ORDER.filter(function (id) { return id !== r.main; }).sort(function (a, b) { return (b === r.second) - (a === r.second); });
      extra.forEach(function (id) { TYPES[id].reels.filter(ok).forEach(function (x) { if (list.length < 5) list.push(x); }); });
    }
    return list.slice(0, 5);
  }

  /* ── Экраны ──────────────────────────────────────────── */
  function go(name) {
    screen = name;
    render();
    window.scrollTo(0, 0);
    syncBack();
  }
  function syncBack() {
    if (!inTG || !W.BackButton) return;
    var show = (screen === 'q' && S.idx > 0) || (screen === 'form') || screen === 'result';
    show ? W.BackButton.show() : W.BackButton.hide();
  }
  if (inTG && W.BackButton) W.BackButton.onClick(function () { back(); });
  function back() {
    if (screen === 'q') { if (S.idx > 0) { S.idx--; save(); go('q'); } else go('start'); }
    else if (screen === 'form') { if (S.step > 0) { S.step--; save(); go('form'); } else go('result'); }
    else if (screen === 'result') go('start');
  }

  function render() {
    var html = ({ start: vStart, q: vQuestion, calc: vCalc, result: vResult, form: vForm, done: vDone })[screen]();
    app.innerHTML = html;
    typograf(app);
    if (screen === 'result') afterResult();
    if (screen === 'start' || screen === 'done') fitLabel(app.querySelector('.display'));
    if (inTG && W.setBackgroundColor) { try { W.setBackgroundColor('#FFFFFF'); W.setHeaderColor('#FFFFFF'); } catch (e) {} }
  }

  function vStart() {
    var name = firstName();
    return '<section class="screen start"><div class="col">' +
      '<p class="start__hi">Привет' + (name ? ', ' + esc(name) : '') + '! Это Карина</p>' +
      '<div class="start__body">' +
        '<h1 class="display"><span class="start__pre">Хочешь быть блогером?</span><span class="ln">но не</span><span class="ln">знаешь,</span><span class="ln">про что</span><span class="ln">снимать?</span></h1>' +
        '<p class="start__sub">За 3 минуты скажу, какой ты блогер и на какие темы тебе снимать, чтобы набирать просмотры и подписчиков</p>' +
        '<ul class="start__get"><li>Твой тип блогера</li><li>15 тем под тебя</li><li>5 готовых роликов</li></ul>' +
      '</div>' +
      '<div class="start__foot"><button class="btn" data-act="begin">Погнали!</button>' +
      (S.result ? '<button class="textlink" data-act="show-result">Мой прошлый результат</button>' : '') +
      '</div></div></section>';
  }

  function vQuestion() {
    var q = QUESTIONS[S.idx];
    var n = S.idx + 1, total = QUESTIONS.length;
    var cur = S.answers[q.id];
    var prev = S.idx > 0 ? QUESTIONS[S.idx - 1] : null;
    var opts = shuffled(q).map(function (o, i) {
      var on = q.multi ? (cur || []).indexOf(o.v) >= 0 : cur === o.v;
      var label = q.quote && o.v !== 'NONE' ? '«' + o.t + '»' : o.t;
      return '<button class="opt' + (q.multi ? ' is-multi' : '') + (on ? ' is-on' : '') + '" style="animation-delay:' + (i * 35) + 'ms" data-act="pick" data-v="' + esc(o.v) + '">' + esc(label) + '</button>';
    }).join('');
    return '<section class="screen"><div class="col">' +
      '<div class="topbar">' + (inTG ? '<span></span>' : '<button class="back" data-act="back">Назад</button>') + '<span class="count">' + n + ' из ' + total + '</span></div>' +
      '<div class="progress"><i style="width:' + Math.round((n - 1) / total * 100) + '%"></i></div>' +
      (prev && S.idx === S.lastReactionIdx && reactionFor(prev) ? '<div class="reaction"><img src="assets/karina-avatar.webp" alt="">' + esc(reactionFor(prev)) + '</div>' : '') +
      '<h2 class="title q__text">' + esc(q.text) + '</h2>' +
      (q.hint ? '<p class="small soft q__hint">' + esc(q.hint) + '</p>' : '') +
      '<div class="opts">' + opts + '</div>' +
      (q.multi ? '<div class="q__foot"><button class="btn" data-act="next"' + ((cur || []).length ? '' : ' disabled') + '>Мой результат</button></div>' : '') +
      '</div></section>';
  }

  // Неразрывные пробелы: короткие слова и цифры не висят в конце строки
  var SHORT = /(^|[\s«„(\u00A0])((?:[а-яёА-ЯЁ]{1,2}|для|без|под|над|при|про|или|что|\d+))[ \t\n]+(?=\S)/g;
  function nbsp(t) {
    var prev;
    do { prev = t; t = t.replace(SHORT, '$1$2\u00A0'); } while (t !== prev);
    return t.replace(/\s(бы|ли|же)(?=[\s.,!?»]|$)/g, '\u00A0$1');
  }
  function typograf(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      var p = n.parentNode && n.parentNode.nodeName;
      if (p === 'SCRIPT' || p === 'STYLE' || p === 'TEXTAREA' || (n.parentNode.closest && n.parentNode.closest('.display'))) continue;
      var v = nbsp(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v;
    }
  }
  function reactionFor(q) { return q.afterBy ? q.afterBy[S.answers[q.id]] : q.after; }

  function vCalc() {
    return '<section class="screen calc"><div class="col">' +
      '<img class="calc__sticker" id="calcSticker" src="assets/stickers/sticker-06.webp" alt="">' +
      '<p class="title calc__line" id="calcLine">Считаю твои ответы…</p>' +
      '</div></section>';
  }

  /* Скрины кейсов: assets/cases/<имя>-1.jpg … Пока файлов нет, блок не выводится */
  var CASE_SHOTS = {
    saikho: [['saikho-2.jpg', 'Статистика Сайхо с 27 августа по 25 сентября: 474,2 тысячи просмотров, 395 новых подписчиков', 1], ['saikho-1.jpg', 'Профиль Сайхо: 543 подписчика, 474 тысячи просмотров за 30 дней, ролик на 71 тысячу']],
    masha: [['masha-1.jpg', 'Статистика Маши за август: 251 тысяча просмотров, в 15 раз больше, чем в июле'], ['masha-2.jpg', 'Профиль Маши: 2 166 подписчиков']]
  };
  function shots(id) {
    var list = CASE_SHOTS[id] || [];
    if (!list.length) return '';
    return '<div class="case__shots">' + list.map(function (f) { return '<button class="shot' + (f[2] ? ' shot--wide' : '') + '" data-act="zoom" data-src="assets/cases/' + f[0] + '" aria-label="Открыть скрин"><img src="assets/cases/' + f[0] + '" alt="' + esc(f[1]) + '" loading="lazy"></button>'; }).join('') + '</div><p class="shots__hint">Листай и нажми, чтобы увеличить</p>';
  }

  function vResult() {
    var r = S.result, t = TYPES[r.main], sec = r.second ? TYPES[r.second] : null;
    var name = firstName();
    var split = ORDER.slice().sort(function (a, b) { return r.counts[b] - r.counts[a]; }).map(function (id, i) {
      var c = r.counts[id];
      return '<div class="split__row' + (id === r.main ? ' is-main' : '') + '"><span>' + esc(TYPES[id].name) + '</span>' +
        '<span class="split__track"><span class="split__fill" style="width:' + Math.round(c / r.total * 100) + '%;animation-delay:' + (400 + i * 70) + 'ms"></span></span>' +
        '<span class="split__n">' + c + '</span></div>';
    }).join('');
    var mirror = r.mirror.map(function (m) {
      return '<div><p class="why__cap">' + esc(m.caption) + '</p><p class="why__txt">' + (m.quote ? '«' + esc(m.text) + '»' : esc(m.text)) + '</p></div>';
    }).join('');
    var topics = pickTopics(r).map(function (x) { return '<li>' + q2(esc(x)) + '</li>'; }).join('');
    var reels = pickReels(r).map(function (x, i) {
      return '<article class="reel">' + (i === 0 ? '<p class="reel__today">Сними сегодня</p>' : '') +
        '<p class="reel__phrase">«' + q2(esc(x.phrase)) + '»</p>' +
        '<p><b>Что сказать дальше.</b> ' + q2(esc(cap(x.next))) + '</p>' +
        '<p><b>Чем закончить.</b> «' + q2(esc(x.end)) + '»</p>' +
        (i === 0 ? '<p class="reel__tip">Сначала наговори этот ролик голосовым себе в «Избранное», как будто рассказываешь подруге. Послушай и начни с самого интересного места</p>' : '') +
        '</article>';
    }).join('');
    var state = STATE_TEXT[S.answers.state];

    return '' +
      '<section class="band hero"><div class="col">' +
        '<div class="topbar">' + (inTG ? '<span></span>' : '<button class="back" data-act="restart">Пройти заново</button>') + '<span></span></div>' +
        '<div class="hero__stage">' +
          '<p class="hero__you">' + (name ? esc(name) + ', твой' : 'Твой') + ' тип блогера</p>' +
          '<h1 class="display hero__name"><span class="label label--slap">' + esc(t.name) + '!</span></h1>' +
        '</div>' +
        '<p class="lead hero__tag">' + esc(t.tagline) + '</p>' +
        '<p class="soft hero__count">Я это вижу по ' + r.counts[r.main] + ' твоим ответам из ' + r.total + '.' + (sec ? ' И немножко ' + esc(sec.name) + '. ' + esc(sec.second) + '.' : '') + '</p>' +
        '<div class="split">' + split + '</div>' +
      '</div></section>' +

      '<section class="band"><div class="col">' +
        (mirror ? '<h2 class="title">Смотри, почему</h2><div class="rows">' + mirror + '</div>' : '') +
        '<h2 class="title gap-36">За что тебя будут смотреть</h2><p class="lead gap-14">' + esc(t.why) + '</p>' +
        (state ? '<p class="gap-20">' + esc(state) + '</p>' : '') +
        '<h2 class="title gap-36">Где твои темы</h2><p class="lead gap-14">' + esc(cap(t.where)) + '</p>' +
        '<p class="gap-14"><b>Как найти свою прямо сейчас.</b> ' + esc(cap(t.find)) + '</p>' +
      '</div></section>' +

      '<section class="band band--soft"><div class="col">' +
        '<h2 class="title">Примеры тем, которые идеально зайдут под твой тип блогера</h2>' +
        '<ul class="topics">' + topics + '</ul>' +
        '<button class="textlink gap-10" data-act="copy-topics">Скопировать все темы</button>' +
      '</div></section>' +

      '<section class="band"><div class="col">' +
        '<h2 class="title">5 готовых роликов. Бери и снимай!</h2>' +
        '<div class="gap-20">' + reels + '</div>' +
      '</div></section>' +

      '<section class="band band--ink"><div class="col">' +
        '<h2 class="title">Чего тебе не снимать</h2><p class="lead gap-14">' + esc(t.dont) + '</p>' +
        (t.karina ? '<div class="quote"><img src="assets/karina-avatar.webp" alt=""><div><p>' + esc(t.karina) + '</p><small>Карина</small></div></div>' : '') +
      '</div></section>' +

      '<section class="band band--soft" id="offer"><div class="col">' +
        '<p class="lead">Темы у тебя теперь есть. Но блог растёт, когда ты снимаешь каждый день и рядом есть тот, кто подскажет, что поправить. Поэтому зову тебя в Большую Игру</p>' +
        '<h2 class="display gap-36" style="font-size:clamp(34px,10vw,48px)">Большая Игра <span class="label">2.0!</span></h2>' +
        '<p class="lead gap-14">За 40 дней снимешь 30 роликов и найдёшь свои темы, которые набирают десятки тысяч просмотров и приводят подписчиков</p>' +
        '<p class="gap-14">Даже если сейчас не знаешь, о чём снимать, кажешься себе кринжем и боишься, что осудят знакомые</p>' +
        '<p class="small gap-14">Старт ' + esc(CONFIG.gameStart) + '</p>' +
        '<h3 class="title gap-36" style="font-size:22px">Как проходят 40 дней</h3>' +
        '<p class="gap-10">Обычно курс даёт уроки, а снимать оставляет тебе. Тут наоборот</p>' +
        '<ol class="path">' +
          '<li><span class="path__when">Неделя 1</span><p class="path__what">Находишь, про что ты блогер</p><p>Вместе с куратором находишь свои темы и форматы и начинаешь понимать, что и как нужно снимать</p></li>' +
          '<li><span class="path__when">Старт Игры</span><p class="path__what">Эфир со мной</p><p>Отвечаю на твои вопросы вживую</p></li>' +
          '<li class="path__daily"><span class="path__when">Дальше каждый день</span><p class="path__what">Снимаешь по заданию</p>' +
            '<div class="loop">' +
              '<div class="loop__step"><b>1</b><p>Получаешь задание, про что снять видео сегодня</p></div>' +
              '<div class="loop__step"><b>2</b><p>Снимаешь и выкладываешь</p></div>' +
              '<div class="loop__step"><b>3</b><p>Куратор даёт обратную связь. Говорит, что работает, а что поправить. Если первая фраза не цепляет, переписывает её за тебя</p></div>' +
              '<p class="loop__again">↻ И так каждый день. Пропустила, догонишь, задания не сгорают</p>' +
            '</div>' +
          '</li>' +
          '<li><span class="path__when">Конец Игры</span><p class="path__what">Ещё один эфир со мной</p><p>Отвечаю на вопросы, которые накопились за Игру</p></li>' +
          '<li class="path__end"><span class="path__when">День 40</span><p class="path__what">30 роликов в профиле</p><p>По статистике видишь, какие темы набирают просмотры и приводят подписчиков. И знаешь, что снимать дальше</p></li>' +
        '</ol>' +
        '<h3 class="title gap-36" style="font-size:22px">Что было в первом потоке</h3>' +
        '<div class="cases">' +
          '<article class="case">' +
            '<p class="case__name">Сайхо</p>' +
            '<p class="case__who">Работает в аптеке и учится в магистратуре</p>' +
            '<div class="case__stats"><div><b>71 тыс.</b><span>просмотров у одного ролика</span></div><div><b>543</b><span>подписчика, было 140</span></div></div>' +
            '<p class="case__story">В Игре снимала задания, а сверху ещё тренды. Её ролик «Почему я хочу уйти из аптеки» набрал 71 тысячу просмотров. За месяц Игры её ролики посмотрели 474 тысячи раз</p>' +
            shots('saikho') +
            '<p class="case__q">«За время курса я поняла, что блогинг\u00A0— это большой труд. Я думала, заснять, <span class="nw">чик-чик</span> и всё»</p>' +
          '</article>' +
          '<article class="case">' +
            '<p class="case__name">Маша</p>' +
            '<p class="case__who">Психолог на коньках из Петербурга</p>' +
            '<div class="case__stats"><div><b>200 тыс.</b><span>просмотров у одного рилса</span></div><div><b>2 166</b><span>подписчиков, было 747</span></div></div>' +
            '<p class="case__story">После разбора на эфире её рилс за день набрал 100 тысяч просмотров, сейчас почти 200 тысяч. В Большой Игре выложила 43 ролика. За август её просмотры выросли в 15 раз</p>' +
            shots('masha') +
            '<p class="case__q">«Ценные уроки, я успела всё, так как без воды и с чётко поставленной задачей»</p>' +
          '</article>' +
        '</div>' +
      '</div></section>' +

      '<section class="band band--ink" id="ap"><div class="col">' +
        '<h2 class="title">Начни с анкеты предзаписи</h2>' +
        '<p class="lead gap-14">Это не оплата. Ты просто говоришь мне, что хочешь на новый поток. А я сразу даю то, чего не будет у остальных</p>' +
        '<div class="gift gap-28">' +
          '<p class="gift__head">Что получишь за анкету</p>' +
          '<div class="gift__item"><span class="gift__tag">Сразу</span><p class="gift__title">Запись разбора рилсов</p><p>Эфир, где я разбираю рилсы участниц Большой Игры</p></div>' +
          '<div class="gift__item"><span class="gift__tag">Только для своих</span><p class="gift__title">Закрытый канал предзаписи</p><p>Эфиры, которых нет в открытом доступе. Про Большую Игру 2.0 узнаёшь раньше всех</p></div>' +
          '<div class="gift__item"><span class="gift__tag">Только по анкете</span><p class="gift__title">Самая низкая цена</p><p>Дальше цена на поток будет расти</p></div>' +
          '<div class="gift__item"><span class="gift__tag">Раньше всех</span><p class="gift__title">Место в команде</p><p>Мест столько, сколько успевают разобрать мои кураторы</p></div>' +
        '</div>' +
        '<button class="btn gap-28" data-act="form">Оставить заявку</button>' +
        '<p class="small gap-10" style="opacity:.8">2 минуты. Бесплатно. Потом сразу откроется канал</p>' +
        '<h3 class="title gap-36" style="font-size:22px">Частые вопросы</h3>' +
        '<div class="faq">' +
          '<p><b>Это оплата?</b> Нет. Анкета бесплатная и ни к чему не обязывает</p>' +
          '<p><b>Мне будут названивать?</b> Нет. Моя команда напишет один раз в Телеграм. Консультация, только если сама захочешь</p>' +
          '<p><b>Я ещё не решила.</b> Для этого и канал. Посмотри эфиры и разборы, а решишь потом</p>' +
          '<p><b>Я ни разу не снимала, мне страшно.</b> Первую неделю ты снимаешь 3 пробных ролика вместе с мини-группой и куратором. Одна не останешься</p>' +
          '<p><b>Работа, дети, нет времени.</b> Сайхо работает и учится. На всё она не успевала, а её ролики за месяц набрали 474 тысячи просмотров. Задания не сгорают, догонишь в своём темпе</p>' +
          '<p><b>Я живу не в России.</b> Оплата картой любой страны</p>' +
        '</div>' +
        '<button class="btn gap-28" data-act="form">Оставить заявку</button>' +
        (inTG ? '' : '<button class="textlink gap-20" data-act="restart" style="color:var(--white)">Пройти тест заново</button>') +
      '</div></section>' +
      '<div class="sticky-cta" id="stickyCta"><button class="btn" data-act="form">Оставить заявку</button></div>';
  }

  function fitLabel(h) {
    if (!h) return;
    var lab = h.querySelector('.label');
    var fit = function () {
      if (lab) {
        lab.style.fontSize = '';
        var ls = parseFloat(getComputedStyle(lab).fontSize);
        while (lab.offsetWidth > h.clientWidth && ls > 24) { ls -= 1; lab.style.fontSize = ls + 'px'; }
        return;
      }
      h.style.fontSize = '';
      var size = parseFloat(getComputedStyle(h).fontSize);
      while (h.scrollWidth > h.clientWidth && size > 28) { size -= 1; h.style.fontSize = size + 'px'; }
    };
    fit(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }
  function afterResult() {
    var h = app.querySelector('.hero__name');
    if (h) {
      var fit = function () {
        h.classList.remove('is-wrap'); h.style.fontSize = '';
        var size = parseFloat(getComputedStyle(h).fontSize);
        while (h.scrollWidth > h.clientWidth + 1 && size > 26) { size -= 2; h.style.fontSize = size + 'px'; }
        if (h.scrollWidth > h.clientWidth + 1) h.classList.add('is-wrap');
      };
      fit(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    }
    var bar = document.getElementById('stickyCta'), offer = document.getElementById('ap'), hero = app.querySelector('.hero');
    if (!bar || !offer || !('IntersectionObserver' in window)) return;
    var pastHero = false, offerVisible = false;
    var upd = function () { bar.classList.toggle('is-on', pastHero && !offerVisible); };
    new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(function (es) { offerVisible = es[0].isIntersecting; upd(); }, { threshold: 0.1 }).observe(offer);
  }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function q2(s) { return String(s).replace(/&quot;([^&]+?)&quot;/g, '„$1“'); }

  function vForm() {
    var st = FORM[S.step];
    var fields = st.fields.map(function (f) {
      var v = S.form[f.id];
      var head = '<label class="field__label" for="f_' + f.id + '">' + esc(f.label) + '</label>' + (f.hint ? '<span class="field__hint">' + esc(f.hint) + '</span>' : '');
      if (f.type === 'one' || f.type === 'many') {
        var chips = f.opts.map(function (o) {
          var on = f.type === 'many' ? (v || []).indexOf(o) >= 0 : v === o;
          return '<button type="button" class="chip' + (on ? ' is-on' : '') + '" data-act="chip" data-f="' + f.id + '" data-v="' + esc(o) + '">' + esc(o) + '</button>';
        }).join('');
        return '<div class="field" data-field="' + f.id + '">' + head + '<div class="chips">' + chips + '</div></div>';
      }
      var input = f.type === 'area'
        ? '<textarea class="input" id="f_' + f.id + '" data-f="' + f.id + '" rows="2">' + esc(v || '') + '</textarea>'
        : '<input class="input" id="f_' + f.id + '" data-f="' + f.id + '" type="' + (f.type === 'number' ? 'text' : f.type) + '"' +
          (f.type === 'number' ? ' inputmode="numeric" pattern="[0-9]*"' : '') + (f.auto ? ' autocomplete="' + f.auto + '"' : '') + ' value="' + esc(v || '') + '">';
      var extra = f.id === 'phone' && inTG && W.requestContact ? '<button type="button" class="tg-phone" data-act="tg-phone">Взять номер из Телеграма</button>' : '';
      return '<div class="field" data-field="' + f.id + '">' + head + input + extra + '</div>';
    }).join('');
    var last = S.step === FORM.length - 1;
    return '<section class="screen form-screen"><div class="col">' +
      '<div class="topbar">' + (inTG ? '<span></span>' : '<button class="back" data-act="back">Назад</button>') + '<span class="count">Шаг ' + (S.step + 1) + ' из ' + FORM.length + '</span></div>' +
      '<div class="progress"><i style="width:' + Math.round(S.step / FORM.length * 100) + '%"></i></div>' +
      '<p class="form__kicker">Анкета на Большую Игру 2.0</p>' +
      '<h2 class="title gap-6">' + esc(st.title) + '</h2>' +
      fields +
      '<div class="q__foot"><button class="btn" data-act="form-next">' + (last ? 'Отправить анкету' : 'Дальше') + '</button></div>' +
      '</div></section>';
  }

  function vDone() {
    return '<section class="screen done"><div class="col">' +
      '<h1 class="display"><span class="label label--slap">Готово!</span></h1>' +
      '<p class="lead gap-28">Ты в предзаписи на Большую Игру 2.0. Заходи в закрытый канал. Запись разбора рилсов уже там, а эфиры будут только для своих</p>' +
      '<div class="gap-36">' +
        '<button class="btn" data-act="channel">Перейти в закрытый канал</button>' +
        '<button class="textlink gap-10" data-act="show-result">Вернуться к моему результату</button>' +
      '</div></div></section>';
  }

  /* ── Действия ────────────────────────────────────────── */
  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var act = el.getAttribute('data-act');
    if (act === 'begin') { S = fresh(); if (user && user.first_name) S.form.name = user.first_name; save(); go('q'); }
    else if (act === 'show-result') { if (S.result) go('result'); }
    else if (act === 'back') back();
    else if (act === 'restart') { var keep = S.form; S = fresh(); S.form = keep; save(); go('start'); }
    else if (act === 'pick') pick(el.getAttribute('data-v'));
    else if (act === 'next') finishQuiz();
    else if (act === 'zoom') {
      var box = document.createElement('div');
      box.className = 'zoom';
      box.innerHTML = '<img src="' + el.getAttribute('data-src') + '" alt=""><span>Закрыть</span>';
      box.addEventListener('click', function () { box.remove(); });
      document.body.appendChild(box);
    }
    else if (act === 'copy-topics') {
      var r = S.result, t = TYPES[r.main];
      var text = 'Я ' + t.name + '. Мои темы для роликов:\n' + pickTopics(r).map(function (x, i) { return (i + 1) + '. ' + x; }).join('\n');
      copy(text).then(function (ok) { toast(ok === false ? 'Не получилось скопировать' : 'Скопировано ✓'); });
    }
    else if (act === 'form') { prefillForm(); S.step = 0; save(); go('form'); }
    else if (act === 'chip') chip(el);
    else if (act === 'tg-phone') tgPhone();
    else if (act === 'form-next') formNext();
    else if (act === 'channel') { if (CONFIG.channelUrl) openLink(CONFIG.channelUrl); else toast('Здесь будет ссылка на закрытый канал'); }
    else if (act === 'team') openLink(CONFIG.teamUrl);
  });
  app.addEventListener('input', function (e) {
    var f = e.target.getAttribute('data-f'); if (!f) return;
    S.form[f] = e.target.value; e.target.classList.remove('is-bad');
    var err = e.target.parentNode.querySelector('.err'); if (err) err.remove();
    save();
  });

  function pick(v) {
    var q = QUESTIONS[S.idx];
    haptic();
    if (q.multi) {
      var cur = (S.answers[q.id] || []).slice();
      if (v === q.exclusive) cur = cur.indexOf(v) >= 0 ? [] : [v];
      else { cur = cur.filter(function (x) { return x !== q.exclusive; }); var i = cur.indexOf(v); i >= 0 ? cur.splice(i, 1) : cur.push(v); }
      S.answers[q.id] = cur; save(); markOpts(function (val) { return cur.indexOf(val) >= 0; });
      var nb = app.querySelector('[data-act="next"]'); if (nb) nb.disabled = !cur.length;
      return;
    }
    if (pick.busy) return;
    pick.busy = true;
    S.answers[q.id] = v; save(); markOpts(function (val) { return val === v; });
    setTimeout(function () {
      pick.busy = false;
      if (q.after || q.afterBy) S.lastReactionIdx = S.idx + 1;
      S.idx++; save();
      if (S.idx >= QUESTIONS.length) finishQuiz(); else go('q');
    }, 260);
  }

  function markOpts(isOn) {
    Array.prototype.forEach.call(app.querySelectorAll('.opt'), function (b) {
      b.classList.toggle('is-on', isOn(b.getAttribute('data-v')));
    });
  }

  function finishQuiz() {
    S.result = compute(); S.sent = S.sent || {}; save();
    go('calc');
    var stickers = ['sticker-06', 'sticker-04', 'sticker-01', 'sticker-03', 'sticker-09', 'sticker-05', 'sticker-02'];
    var lines = ['Считаю твои ответы…', 'Смотрю, где твои темы…', 'Подбираю ролики…'];
    var i = 0, el = document.getElementById('calcSticker'), ln = document.getElementById('calcLine');
    var timer = setInterval(function () {
      i++; if (el) el.src = 'assets/stickers/' + stickers[i % stickers.length] + '.webp';
      if (ln && i % 4 === 0) ln.textContent = lines[Math.min(lines.length - 1, i / 4)];
    }, 180);
    if (!S.sent.test) { send('test').then(function (ok) { if (ok) { S.sent.test = true; save(); } }); S.sent.test = !!CONFIG.endpoint; save(); }
    setTimeout(function () { clearInterval(timer); haptic('ok'); go('result'); }, 2400);
  }

  function prefillForm() {
    if (!S.form.name && user && user.first_name) S.form.name = user.first_name;
    if (!S.form.tgNick && user && user.username) S.form.tgNick = '@' + user.username;
    if (!S.form.stops) { S.form.stops = (STATE_STOP[S.answers.state] || []).slice(); }
  }

  function chip(el) {
    var f = el.getAttribute('data-f'), v = el.getAttribute('data-v');
    var def = [].concat.apply([], FORM.map(function (s) { return s.fields; })).filter(function (x) { return x.id === f; })[0];
    haptic();
    if (def.type === 'many') {
      var cur = (S.form[f] || []).slice(); var i = cur.indexOf(v);
      i >= 0 ? cur.splice(i, 1) : cur.push(v); S.form[f] = cur;
    } else S.form[f] = v;
    save();
    var wrap = el.parentNode;
    wrap.classList.remove('is-bad');
    var err = wrap.parentNode.querySelector('.err'); if (err) err.remove();
    Array.prototype.forEach.call(wrap.children, function (c) {
      var val = c.getAttribute('data-v');
      c.classList.toggle('is-on', def.type === 'many' ? S.form[f].indexOf(val) >= 0 : S.form[f] === val);
    });
  }

  function tgPhone() {
    try {
      W.requestContact(function (ok, res) {
        var phone = ok && res && res.responseUnsafe && res.responseUnsafe.contact && res.responseUnsafe.contact.phone_number;
        if (phone) { S.form.phone = '+' + String(phone).replace(/^\+/, ''); save(); render(); toast('Номер взяли из Телеграма ✓'); }
        else if (ok) toast('Спасибо! Если номер не появился, впиши его руками');
      });
    } catch (e) { toast('Впиши номер руками'); }
  }

  function formNext() {
    var st = FORM[S.step], firstBad = null;
    st.fields.forEach(function (f) {
      var v = S.form[f.id], bad = false, msg = 'Заполни, пожалуйста';
      if (f.type === 'many') bad = !(v && v.length);
      else if (f.type === 'one') bad = !v;
      else {
        v = String(v || '').trim(); bad = v.length < 2;
        if (f.id === 'name') bad = v.length < 2;
        if (f.id === 'age') { var n = parseInt(v, 10); bad = !(n >= 14 && n <= 99); msg = 'Напиши возраст цифрами'; }
        if (f.id === 'phone') { bad = (v.replace(/\D/g, '').length < 7); msg = 'Похоже, в номере не хватает цифр'; }
        if (f.id === 'about' || f.id === 'result') bad = v.length < 2;
      }
      var box = app.querySelector('[data-field="' + f.id + '"]');
      if (bad && box) {
        var inp = box.querySelector('.input, .chips'); if (inp) inp.classList.add('is-bad');
        if (!box.querySelector('.err')) box.insertAdjacentHTML('beforeend', '<p class="err">' + msg + '</p>');
        if (!firstBad) firstBad = box;
      }
    });
    if (firstBad) { firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); haptic(); return; }
    if (S.step < FORM.length - 1) { S.step++; save(); go('form'); return; }
    var btn = app.querySelector('[data-act="form-next"]'); if (btn) { btn.disabled = true; btn.textContent = 'Отправляю…'; }
    send('lead').then(function () { S.sent.lead = true; save(); haptic('ok'); go('done'); });
  }

  /* ── Старт ───────────────────────────────────────────── */
  flush();
  if (S.sent && S.sent.lead) go('done');
  else if (S.result && params.get('fresh') !== '1') go('result');
  else go('start');
})();
