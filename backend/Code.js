/**
 * Бэкенд теста «Какой ты блогер» (Карина, Kerry Catt).
 * Принимает POST из мини-аппа и с лендинга Большой Игры и пишет строки в эту таблицу:
 *   лист «Тест»   — каждое прохождение теста;
 *   лист «Анкета» — анкеты предзаписи из мини-аппа (лиды);
 *   лист «Заявки Большая Игра» — заявки «Пройти отбор» с лендинга Большой Игры.
 *
 * Необязательные настройки (Файл → Настройки проекта → Свойства скрипта):
 *   BOT_TOKEN        — токен бота: проверка подписи Телеграма и уведомления;
 *   MANAGER_CHAT_ID  — чат менеджера, куда слать горячих.
 *
 * Первый запуск: выбрать функцию setup и нажать «Выполнить», разрешить доступ.
 */

const SHEET_TEST = 'Тест';
const SHEET_LEADS = 'Анкета';

const HEAD_TEST = [
  'Дата', 'Источник', 'Тип блогера', 'Второй тип', 'Очки', 'Состояние', 'Не будет снимать',
  'Ответы', 'TG id', 'TG ник', 'TG имя', 'Проверено TG'
];

const HEAD_LEADS = [
  'Дата', 'Сегмент', 'Выпускница', 'Источник',
  'Имя', 'Возраст', 'Ник в Телеграме', 'Инстаграм', 'Телефон',
  'Что с блогом', 'Подписчики', 'Зачем блог', 'О чём блог',
  'Что останавливает', 'Курсы', 'Была с нами',
  'Когда готова', 'Вкладываться', 'Формат', 'Результат через 40 дней',
  'Тип блогера', 'Второй тип', 'Состояние',
  'TG id', 'TG ник', 'Проверено TG',
  'Консультация',
  'Согласие ПД', 'Согласие на рассылки', 'Время согласия', 'Редакция документов', 'UTM'
];

// Заявки с лендинга Большой Игры лежат на отдельном листе. «Статус» и «Комментарий» заполняет менеджер.
const SHEET_BI = 'Заявки Большая Игра';
const HEAD_BI = [
  'Дата', 'Тариф', 'Имя', 'Телефон', 'Ник в Телеграме', 'UTM',
  'Согласие ПД', 'Согласие на рассылки', 'Время согласия', 'Редакция документов', 'Страница',
  'Статус', 'Комментарий',
  'Оферта принята', 'Кнопка оплаты'
];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  sheet_(ss, SHEET_TEST, HEAD_TEST);
  sheet_(ss, SHEET_LEADS, HEAD_LEADS);
  sheet_(ss, SHEET_BI, HEAD_BI);
  const first = ss.getSheets()[0];
  if (first.getName() !== SHEET_TEST && first.getName() !== SHEET_LEADS && first.getLastRow() === 0) {
    ss.deleteSheet(first);
  }
  return 'ok';
}

/**
 * GET ?tg=<id>&u=<ник без @> отвечает боту в ChatPlace, прошла ли она тест и заполнила ли анкету:
 * { ok: true, test: "1" | "0", lead: "1" | "0" }. Наружу отдаём только эти два флага.
 * Человек найден, если совпал TG id или ник. ChatPlace отдаёт свой id, а не Telegram id, поэтому ник обязателен.
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  const id = String(p.tg || '').replace(/\D/g, '');
  const nick = nick_(p.u);
  if (!id && !nick) return json_({ ok: true, service: 'kerry-yapping-test' });
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const test = (id && hasTg_(ss, SHEET_TEST, HEAD_TEST, id)) || (nick && hasNick_(ss, SHEET_TEST, HEAD_TEST, ['TG ник'], nick));
  const lead = (id && hasTg_(ss, SHEET_LEADS, HEAD_LEADS, id)) || (nick && hasNick_(ss, SHEET_LEADS, HEAD_LEADS, ['TG ник', 'Ник в Телеграме'], nick));
  return json_({ ok: true, test: test ? '1' : '0', lead: lead ? '1' : '0' });
}

// Ник без @, пробелов, ссылки t.me и регистра. Пустая строка значит «ника нет».
function nick_(v) {
  return String(v || '').toLowerCase().replace(/\s+/g, '').replace(/^(https?:\/\/)?(www\.)?t\.me\//, '').replace(/^@+/, '');
}

function hasNick_(ss, name, head, cols, nick) {
  const sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2 || !nick) return false;
  return cols.some(function (c) {
    const col = head.indexOf(c) + 1;
    if (!col) return false;
    const vals = sh.getRange(2, col, sh.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < vals.length; i++) { const n = nick_(vals[i][0]); if (n && n === nick) return true; }
    return false;
  });
}

// Сравниваем по строковому значению: id в ячейке может лежать числом, текстом или с пробелами.
function hasTg_(ss, name, head, id) {
  const sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return false;
  const col = head.indexOf('TG id') + 1;
  const vals = sh.getRange(2, col, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) {
    const v = vals[i][0];
    const s = typeof v === 'number' ? v.toFixed(0) : String(v).replace(/\D/g, '');
    if (s === id) return true;
  }
  return false;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tg = d.tg || {};
    const verified = verifyTg_(d.initData);
    const t = d.test || {};
    const now = new Date();

    if (d.kind === 'test') {
      const sh = sheet_(ss, SHEET_TEST, HEAD_TEST);
      sh.appendRow(clean_([
        now, d.source, t.type, t.second, t.scores, t.state, (t.limits || []).join(', '),
        t.answers, tg.id, tg.username ? '@' + tg.username : '', tg.first_name, verified
      ]));
      return json_({ ok: true });
    }

    if (d.kind === 'lead') {
      const a = d.anketa || {};
      const grad = a.withUs === 'в Большой Игре' ? 'да' : '';
      const seg = segment_(a);
      const sh = sheet_(ss, SHEET_LEADS, HEAD_LEADS);
      sh.appendRow(clean_([
        now, seg, grad, d.source,
        a.name, a.age, a.tgNick, a.instagram, a.phone,
        a.blog, a.followers, a.why, a.about,
        (a.stops || []).join(', '), a.courses, a.withUs,
        a.when, a.invest, a.format, a.result,
        t.type, t.second, t.state,
        tg.id, tg.username ? '@' + tg.username : '', verified,
        a.consult,
        a.consent_pd ? 'да' : '', a.consent_ads ? 'да' : 'нет', a.consent_ts, a.consent_rev, ''
      ]));
      const row = sh.getLastRow();
      if (seg === 'горячая') sh.getRange(row, 1, 1, HEAD_LEADS.length).setBackground('#FBD9D3');
      if (grad) sh.getRange(row, 3).setBackground('#F6EEE2');
      if (a.consult === 'да, хочу') sh.getRange(row, HEAD_LEADS.indexOf('Консультация') + 1).setFontWeight('bold').setBackground('#FBE8EC');
      notify_(seg, grad, a, t);
      return json_({ ok: true, segment: seg });
    }

    // Заявка «Пройти отбор» с лендинга Большой Игры.
    if (d.kind === 'bi') {
      if (d.hp) return json_({ ok: true });
      const b = d.lead || {};
      if (!String(b.name || '').trim() || !String(b.phone || '').trim() || !b.consent_pd) {
        return json_({ ok: false, error: 'missing fields' });
      }
      const sh = sheet_(ss, SHEET_BI, HEAD_BI);
      sh.appendRow(clean_([
        now, b.tariff, b.name, b.phone, b.tgNick, b.utm,
        'да', b.consent_ads ? 'да' : 'нет', b.consent_ts, b.consent_rev, d.page,
        '', '', '', ''
      ]));
      notifyBi_(b);
      return json_({ ok: true, row: sh.getLastRow() });
    }

    // После заявки человек принял оферту и нажал кнопку оплаты. Дописываем это в его строку.
    // Строку сверяем по телефону, чтобы чужой запрос не поменял чужую заявку.
    if (d.kind === 'bi_pay') {
      const sh = ss.getSheetByName(SHEET_BI);
      const row = parseInt(d.row, 10);
      const digits = function (v) { return String(v || '').replace(/\D/g, ''); };
      if (!sh || !(row > 1) || row > sh.getLastRow()) return json_({ ok: false, error: 'no row' });
      const phone = sh.getRange(row, HEAD_BI.indexOf('Телефон') + 1).getValue();
      if (!digits(d.phone) || digits(phone) !== digits(d.phone)) return json_({ ok: false, error: 'no match' });
      const method = d.method === 'intl' ? 'зарубежная' : 'рубли';
      sh.getRange(row, HEAD_BI.indexOf('Оферта принята') + 1, 1, 2)
        .setValues([clean_([String(d.offer_ts || '') + ' · ред. ' + String(d.offer_rev || ''), method])]);
      return json_({ ok: true });
    }

    return json_({ ok: false, error: 'unknown kind' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Сегменты по логике Пырикова (горячая, средняя, холодная).
 * Горячая: начать сейчас или в ближайший месяц, вкладываться «да» и хочет консультацию.
 * Холодная: «позже» или «ищу бесплатное». Остальные средние.
 * Была на Разминке: на ступень выше (кто выложил ролик на Разминке, покупал Игру вдвое чаще).
 */
function segment_(a) {
  const soon = a.when === 'прямо сейчас' || a.when === 'в ближайший месяц';
  const LEVELS = ['холодная', 'средняя', 'горячая'];
  let lvl;
  if (a.when === 'позже, пока присматриваюсь' || a.invest === 'нет, ищу бесплатное') lvl = 0;
  else if (soon && a.invest === 'да' && a.consult === 'да, хочу') lvl = 2;
  else lvl = 1;
  if (a.withUs === 'на Разминке' && lvl < 2) lvl += 1;
  return LEVELS[lvl];
}

function notify_(seg, grad, a, t) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('BOT_TOKEN');
  const chat = props.getProperty('MANAGER_CHAT_ID');
  const wantsCall = a.consult === 'да, хочу';
  if (!token || !chat || (seg !== 'горячая' && !grad && !wantsCall)) return;
  const lines = [
    grad ? '🎓 Выпускница Большой Игры' : (seg === 'горячая' ? '🔥 Горячая анкета' : '📞 Хочет консультацию'),
    `${a.name || ''}, ${a.age || ''}`,
    `Телеграм: ${a.tgNick || '—'}`,
    `Телефон: ${a.phone || '—'}`,
    `Инстаграм: ${a.instagram || '—'}`,
    `Тип блогера: ${t.type || '—'}`,
    `Формат: ${a.format || '—'}`,
    `Хочет через 40 дней: ${a.result || '—'}`
  ];
  try {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chat, text: lines.join('\n') }),
      muteHttpExceptions: true
    });
  } catch (e) { /* уведомление не критично */ }
}

function notifyBi_(b) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('BOT_TOKEN');
  const chat = props.getProperty('MANAGER_CHAT_ID');
  if (!token || !chat) return;
  const lines = [
    '🔥 Заявка с лендинга Большой Игры',
    `Тариф: ${b.tariff || '—'}`,
    `Имя: ${b.name || ''}`,
    `Телефон: ${b.phone || '—'}`,
    `Телеграм: ${b.tgNick || '—'}`
  ];
  try {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chat, text: lines.join('\n') }),
      muteHttpExceptions: true
    });
  } catch (e) { /* уведомление не критично */ }
}

/** Проверка подписи initData Телеграма. Без BOT_TOKEN возвращает «нет токена». */
function verifyTg_(initData) {
  if (!initData) return 'не из Телеграма';
  const token = PropertiesService.getScriptProperties().getProperty('BOT_TOKEN');
  if (!token) return 'нет токена';
  const pairs = initData.split('&').map(p => p.split('='));
  let hash = '';
  const rest = [];
  pairs.forEach(([k, v]) => {
    const val = decodeURIComponent(v || '');
    if (k === 'hash') hash = val; else rest.push(`${k}=${val}`);
  });
  rest.sort();
  const secret = Utilities.computeHmacSha256Signature(token, 'WebAppData');
  const sig = Utilities.computeHmacSha256Signature(Utilities.newBlob(rest.join('\n')).getBytes(), secret);
  const hex = sig.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
  return hex === hash ? 'да' : 'подпись не сошлась';
}

function sheet_(ss, name, head) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() > 0 && sh.getLastColumn() < head.length) {
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#1F1F1F').setFontColor('#F6EEE2');
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(head);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#1F1F1F').setFontColor('#F6EEE2');
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Защита от формул в ячейках и обрезка длинного текста. */
function clean_(row) {
  return row.map(v => {
    if (v === undefined || v === null) return '';
    if (v instanceof Date || typeof v === 'number') return v;
    let s = String(v).slice(0, 2000);
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return s;
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
