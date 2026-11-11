/* MoonHongSYMBOLON
 * 흐름: 배열법 고르기 → 덱에서 뽑기 → 자리에 놓고 뒤집기 → 자리의 렌즈로 읽기.
 * 자리마다 렌즈(lens)가 있어, 같은 카드라도 놓인 자리에 맞는 문장을 먼저 보여 준다.
 */
(function () {
  'use strict';

  /* ── 카드 ─────────────────────────── */
  const TYPES = {
    major: ['원형', '별자리 하나가 그대로 사람이 된 카드입니다. 섞이지 않은 순수한 페르소나입니다.'],
    moon: ['달의 카드', '게자리(달)와 다른 별자리의 조합입니다. 감정, 내면의 아이, 여성성의 문제를 다룹니다.'],
    sun: ['태양의 카드', '사자자리(태양)와 다른 별자리의 조합입니다. 자아, 자존심, 남성성의 문제를 다룹니다.'],
    etc: ['그 밖의 조합', '달과 태양이 들어가지 않은 두 별자리의 조합입니다.']
  };
  const typeOf = (n) => (n <= 12 ? 'major' : n <= 23 ? 'moon' : n <= 33 ? 'sun' : 'etc');

  const CARDS = CARD_ROWS.map((r) => ({
    n: r[0], ko: r[1], en: r[2], a: r[3], b: r[4], kw: r[5].split(','),
    mind: r[6], prob: r[7], sol: r[8], star: r[9], p: r[10], w: r[11], o: r[12],
    type: typeOf(r[0]), signs: r[3] === r[4] ? [r[3]] : [r[3], r[4]]
  }));

  /* ── 렌즈: 자리에서 먼저 읽을 문장 ───── */
  const LENS = {
    mind: ['속마음', (c) => c.mind],
    prob: ['문제점으로 나왔을 때', (c) => c.prob],
    sol: ['해결방법으로 나왔을 때', (c) => c.sol],
    p: ['문제의 자리에서', (c) => c.p],
    w: ['길의 자리에서', (c) => c.w],
    o: ['결과의 자리에서', (c) => c.o]
  };
  const STAR_NOTE = {
    s: '★ 이 카드는 해결방법 자리에서 “그림처럼 하라”가 아니라, 지금 그런 상태임을 알아차리라는 쪽으로 읽습니다.',
    p: '★ 이 카드는 문제점 자리에서 “그림처럼 하는 것이 문제”가 아니라, 그렇게 하지 못하는 것이 문제라고 읽습니다.'
  };

  /* ── 배열법 ───────────────────────── */
  const SPREADS = {
    one: {
      name: '한 장', sub: '지금의 페르소나', count: 1, grid: [[1]],
      intro: '지금 내 안에서 무대에 올라와 있는 인물 한 명을 만납니다.',
      how: '카드 한 장에 집중합니다. 그림과 이름을 보고, 요즘 내 삶에서 이 인물과 닮은 장면이 어디 있었는지 떠올려 보세요.',
      positions: { 1: ['지금의 페르소나', '지금 내 안에서 가장 크게 움직이는 인물입니다.', 'mind'] }
    },
    three: {
      name: '세 장', sub: '문제 · 길 · 결과', count: 3, grid: [[1, 2, 3]],
      intro: '가이드북의 기본 배열. 문제의 뿌리에서 길을 지나 결과까지 읽습니다.',
      how: '심볼론의 기본 배열입니다. 왼쪽부터 차례로 놓고, 첫 장에서 셋째 장으로 걸어가는 여정으로 읽습니다.',
      positions: {
        1: ['문제', '문제의 뿌리. 지금 상황을 만든, 내가 알아차리지 못한 것입니다.', 'p'],
        2: ['길', '문제를 지나가는 길. 이 과정을 겪으며 배우게 됩니다.', 'w'],
        3: ['결과', '길 끝에서 얻는 것. 이 문제를 들여다보는 목적이기도 합니다.', 'o']
      }
    },
    mind: {
      name: '속마음', sub: '나와 상대', count: 2, grid: [[1, 2]],
      intro: '두 사람의 마음 상태를 한 장씩 나란히 놓고 봅니다.',
      how: '강의의 ‘속마음’ 렌즈로 읽는 배열입니다. 두 카드에 같은 별자리가 들어 있으면 두 사람이 같은 주제를 붙들고 있다는 뜻입니다.',
      positions: {
        1: ['나의 속마음', '이 일을 두고 내가 품고 있는 마음입니다.', 'mind'],
        2: ['상대의 속마음', '상대가 품고 있는 마음입니다. 사람이 아니라 상황을 놓고 봐도 됩니다.', 'mind']
      }
    },
    solve: {
      name: '문제와 해결', sub: '문제점 · 해결방법', count: 2, grid: [[1, 2]],
      intro: '무엇이 문제이고, 어떻게 해야 하는지를 두 장으로 묻습니다.',
      how: '강의의 틀 그대로입니다. 첫 장은 “이 카드처럼 구는 것이 문제”, 둘째 장은 “이 카드처럼 해야 한다”로 읽습니다.',
      positions: {
        1: ['문제점', '지금 무엇이 문제인지. 이 카드의 모습이 지나친 것입니다.', 'prob'],
        2: ['해결방법', '어떻게 해야 하는지. 이 카드의 모습대로 움직입니다.', 'sol']
      }
    },
    relation: {
      name: '관계 읽기', sub: '다섯 장', count: 5, grid: [[1, 0, 2], [0, 3, 0], [4, 0, 5]],
      intro: '두 사람의 속마음, 관계의 문제점, 해결방법, 결과를 한 번에 봅니다.',
      how: '속마음·문제점·해결방법의 세 렌즈에 결과 자리를 더해 엮은 배열입니다. 위의 두 장을 먼저 읽고, 가운데 문제점을 지나 아래로 내려갑니다.',
      positions: {
        1: ['나의 속마음', '이 관계에서 내가 품고 있는 마음입니다.', 'mind'],
        2: ['상대의 속마음', '상대가 품고 있는 마음입니다.', 'mind'],
        3: ['관계의 문제점', '두 사람 사이에서 걸리는 것. 이 카드의 모습이 지나칩니다.', 'prob'],
        4: ['해결방법', '어떻게 해야 하는지. 이 카드의 모습대로 움직입니다.', 'sol'],
        5: ['결과', '그 길 끝에서 얻게 되는 것입니다.', 'o']
      }
    }
  };

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* 치우침 없는 난수 (0 이상 n 미만) */
  function rand(n) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / n) * n;
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % n;
  }
  function shuffled(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ── 그림 ─────────────────────────── */
  const glyph = (inner, cls) => `<svg class="zg ${cls || ''}" viewBox="0 0 20 20" aria-hidden="true">${inner}</svg>`;
  const signGlyph = (i) => glyph(ZODIAC[i], 'el-' + SIGNS[i].el);
  const planetGlyph = (i) => glyph(PLANET[SIGNS[i].planet], 'el-' + SIGNS[i].el);

  function faceHTML(c) {
    const major = c.a === c.b;
    const right = major ? PLANET[SIGNS[c.a].planet] : ZODIAC[c.b];
    const koSize = c.ko.length > 8 ? 10.5 : c.ko.length > 6 ? 12 : 14;
    const en = c.en.toUpperCase();
    const enSize = Math.max(3.4, Math.min(6.5, 98 / (en.length * 0.86)));
    const img = `<img src="cards/${String(c.n).padStart(2, '0')}.jpg" alt="${esc(c.ko)} 카드" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('no-img')">`;
    return `<span class="face">${img}<svg class="card-art" viewBox="0 0 120 200" role="img" aria-label="${esc(c.ko)} 카드">` +
      '<rect class="c-bg" width="120" height="200"/><rect class="c-frame" x="6" y="6" width="108" height="188" rx="5"/>' +
      `<g class="c-glyph el-${SIGNS[c.a].el}" transform="translate(13 13) scale(.9)">${ZODIAC[c.a]}</g>` +
      `<g class="c-glyph el-${SIGNS[c.b].el}" transform="translate(89 13) scale(.9)">${right}</g>` +
      `<text class="c-num" x="60" y="28">${c.n}</text>` +
      `<g class="c-icon" transform="translate(13 44) scale(.94)">${ART[c.n]}</g>` +
      `<text class="c-ko" x="60" y="166" style="font-size:${koSize}px">${esc(c.ko)}</text>` +
      `<text class="c-en" x="60" y="181" style="font-size:${enSize.toFixed(2)}px">${esc(en)}</text></svg></span>`;
  }

  const BACK_SVG = '<svg class="back-art" viewBox="0 0 100 166" preserveAspectRatio="none" aria-hidden="true">' +
    '<rect class="b-ground" width="100" height="166"/>' +
    '<rect class="b-frame" x="5" y="5" width="90" height="156" rx="4"/>' +
    '<circle class="b-ring" cx="50" cy="83" r="30"/>' +
    '<path class="b-star" d="M50 55L54 79L78 83L54 87L50 111L46 87L22 83L46 79Z"/>' +
    '<path class="b-split" d="M50 53L46 68L54 78L46 88L54 98L50 113"/>' +
    '<path class="b-dot" d="M22 30l1.5 4.5 4.5 1.5-4.500 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5zM80 128l1.2 3.6 3.600 1.2-3.600 1.2-1.2 3.6-1.2-3.600-3.600-1.2 3.600-1.2z"/>' +
    '</svg>';

  /* ── 해설 조각 ─────────────────────── */
  function signLineHTML(c) {
    const part = (i) => `<span class="sign el-${SIGNS[i].el}">${signGlyph(i)}${esc(SIGNS[i].ko)}<small>${planetGlyph(i)}${esc(SIGNS[i].planet)}</small></span>`;
    return `<p class="signline">${c.signs.map(part).join('<i>+</i>')}</p>`;
  }
  function tagsHTML(c) {
    const els = [...new Set(c.signs.map((i) => SIGNS[i].el))];
    return `<div class="tags"><span class="tag">${TYPES[c.type][0]}</span>` +
      els.map((e) => `<span class="tag el-${e}">${ELEMENTS[e]}의 속성</span>`).join('') + '</div>';
  }
  function lensHTML(c, lens) {
    if (!lens) return '';
    const star = (lens === 'sol' && c.star === 's') || (lens === 'prob' && c.star === 'p');
    return `<div class="lens"><p class="sub">${LENS[lens][0]}</p><p class="lens-text">${esc(LENS[lens][1](c))}</p>` +
      (star ? `<p class="star-note">${STAR_NOTE[c.star]}</p>` : '') + '</div>';
  }
  function bodyHTML(c, lens) {
    const row = (key, label) => `<dt${key === lens ? ' class="is-on"' : ''}>${label}</dt><dd${key === lens ? ' class="is-on"' : ''}>${esc(c[key])}</dd>`;
    return tagsHTML(c) + lensHTML(c, lens) +
      `<div><p class="sub">키워드</p><ul class="kw">${c.kw.map((k) => `<li>${esc(k)}</li>`).join('')}</ul></div>` +
      `<div><p class="sub">세 가지 렌즈</p><dl class="aspects">${row('mind', '속마음')}${row('prob', '문제점')}${row('sol', '해결방법')}</dl>` +
      (c.star ? `<p class="kw-note">${STAR_NOTE[c.star]}</p>` : '') + '</div>' +
      `<div><p class="sub">세 자리 풀이</p><dl class="aspects">${row('p', '문제')}${row('w', '길')}${row('o', '결과')}</dl></div>`;
  }
  function titleHTML(c, id) {
    return `<h3${id ? ` id="${id}"` : ''}><b class="num">${c.n}</b>${esc(c.ko)} <span>${esc(c.en)}</span></h3>`;
  }
  function readingHTML(posLine, c, lens) {
    return `<div class="reading-card">${faceHTML(c)}</div>` +
      `<div class="reading-body">${posLine}${titleHTML(c)}${signLineHTML(c)}${bodyHTML(c, lens)}</div>`;
  }
  function dialogHTML(c) {
    return `<div class="dialog-head"><div class="reading-card">${faceHTML(c)}</div><div>${titleHTML(c, 'dialogTitle')}` +
      `${signLineHTML(c)}<p class="house-line">${esc(TYPES[c.type][1])}</p></div></div>` +
      `<div class="dialog-sections">${bodyHTML(c)}</div>`;
  }

  /* ── 배열 도식 · 자리 안내 ──────────── */
  function miniHTML(s) {
    const cols = s.grid[0].length;
    const cells = s.grid.map((row, r) => row.map((p, c) =>
      (p ? `<i style="grid-area:${r + 1}/${c + 1}">${p}</i>` : '')).join('')).join('');
    return `<span class="mini" style="grid-template-columns:repeat(${cols},auto)" aria-hidden="true">${cells}</span>`;
  }
  function guideBodyHTML(s) {
    return `<p class="how">${esc(s.how)}</p><dl class="pos-list">` + Object.keys(s.positions).map((p) =>
      `<dt><b>${p}</b>${esc(s.positions[p][0])}</dt><dd>${esc(s.positions[p][1])}</dd>`).join('') + '</dl>';
  }

  /* ── 함께 읽기 ─────────────────────── */
  function togetherHTML(s, at) {
    const ps = Object.keys(s.positions);
    const cards = ps.map((p) => at[p]);
    const lines = [];

    if (s.count > 1) {
      const count = {};
      cards.forEach((c) => c.signs.forEach((i) => { count[i] = (count[i] || 0) + 1; }));
      const repeated = Object.keys(count).map(Number).filter((i) => count[i] > 1).sort((x, y) => count[y] - count[x]);
      repeated.forEach((i) => {
        lines.push(`<b class="el-${SIGNS[i].el}">${signGlyph(i)}${esc(SIGNS[i].ko)}(${esc(SIGNS[i].planet)})</b> — ${count[i]}장에 들어 있습니다. 이번 리딩에서 되풀이되는 주제는 ‘${esc(SIGNS[i].theme)}’입니다.`);
      });
      if (!repeated.length) lines.push('같은 별자리가 겹치지 않았습니다. 자리마다 서로 다른 인물이 나와 있으니 한 장씩 따로 읽어도 좋습니다.');

      const el = {};
      Object.keys(count).forEach((i) => { const e = SIGNS[i].el; el[e] = (el[e] || 0) + count[i]; });
      const missing = Object.keys(ELEMENTS).filter((e) => !el[e]);
      const top = Object.keys(el).sort((x, y) => el[y] - el[x])[0];
      const EL_NOTE = { fire: '의지와 행동', earth: '현실과 책임', air: '생각과 관계', water: '감정과 무의식' };
      if (el[top] >= 3) lines.push(`<b class="el-${top}">${ELEMENTS[top]}</b>의 별자리가 가장 많습니다. ‘${EL_NOTE[top]}’ 쪽에 무게가 실려 있습니다.`);
      if (missing.length === 1) lines.push(`<b class="el-${missing[0]}">${ELEMENTS[missing[0]]}</b>의 별자리가 한 장도 없습니다. ‘${EL_NOTE[missing[0]]}’ 쪽이 이 일에서 비어 있을 수 있습니다.`);
    }

    const majors = cards.filter((c) => c.type === 'major');
    if (majors.length) lines.push(`원형 카드가 나왔습니다: ${majors.map((c) => `<b>${esc(c.ko)}</b>`).join(', ')}. 다른 것과 섞이지 않은 인물이라 그 자리의 뜻이 또렷합니다.`);

    let path = '';
    if (s.count > 1) {
      path = '<p class="path">' + ps.map((p) => `<span><small>${esc(s.positions[p][0])}</small>${esc(at[p].ko)}</span>`).join('<i>→</i>') + '</p>';
    }

    return `<h3>${s.count > 1 ? '함께 읽기' : '카드 앞에서'}</h3>${path}` +
      (lines.length ? `<ul class="plain">${lines.map((l) => `<li>${l}</li>`).join('')}</ul>` : '') +
      '<p class="sub">카드를 보며 스스로에게 물어보세요</p><ul class="plain ask">' +
      '<li>지금 내 안에서 움직이고 있는 인물은 누구인가?</li>' +
      '<li>이 카드가 떠올리게 하는 지난 일은 무엇인가?</li>' +
      '<li>여기에서 내가 배울 수 있는 것은 무엇인가?</li></ul>';
  }

  /* ── 상태 ─────────────────────────── */
  const state = { spreadKey: 'three', deck: [], at: {}, picked: 0, flipped: new Set(), question: '' };
  const spread = () => SPREADS[state.spreadKey];

  function renderSpreadOptions() {
    $('spreadOptions').innerHTML = Object.entries(SPREADS).map(([key, s]) =>
      `<label class="spread-option"><input type="radio" name="spread" value="${key}"${key === state.spreadKey ? ' checked' : ''}>` +
      `<span class="spread-card">${miniHTML(s)}` +
      `<span><strong>${esc(s.name)}</strong><em>${esc(s.sub)} · ${s.count}장</em><p>${esc(s.intro)}</p></span>` +
      '</span></label>').join('');
  }
  function renderSpreadBook() {
    $('spreadList').innerHTML = Object.entries(SPREADS).map(([key, s]) =>
      `<article class="spread-entry" id="spread-${key}"><header>${miniHTML(s)}<div><h3>${esc(s.name)}</h3><p class="entry-sub">${esc(s.sub)} · ${s.count}장</p></div></header>` +
      `${guideBodyHTML(s)}</article>`).join('');
  }

  /* ── 테이블 ───────────────────────── */
  function startReading() {
    const s = spread();
    state.deck = shuffled(CARDS);
    state.at = {};
    state.picked = 0;
    state.flipped = new Set();

    $('table').hidden = false;
    $('tableActions').hidden = true;
    $('together').hidden = true;
    $('spreadTitle').textContent = `${s.name} · ${s.sub}`;
    const asked = $('asked');
    asked.hidden = !state.question;
    asked.textContent = state.question;

    $('posGuide').innerHTML = `<summary>이 배열의 자리 의미</summary>${guideBodyHTML(s)}`;

    const layout = $('layout');
    layout.dataset.spread = state.spreadKey;
    layout.style.gridTemplateColumns = `repeat(${s.grid[0].length}, var(--cw))`;
    const deck = $('deck');
    deck.classList.remove('is-done');
    deck.innerHTML = state.deck.map((_, i) =>
      `<button type="button" class="deck-card" style="--i:${i}" data-i="${i}" aria-label="${i + 1}번째 카드 뽑기">${BACK_SVG}</button>`).join('');
    layout.innerHTML = s.grid.map((row, r) => row.map((p, c) => (p ?
      `<div class="slot" data-pos="${p}" style="grid-area:${r + 1}/${c + 1}">` +
      `<div class="slot-label"><b>${p}</b>${esc(s.positions[p][0])}</div>` +
      `<div class="slot-hole">${p}</div><div class="slot-name"></div></div>` : '')).join('')).join('');
    $('readings').innerHTML = Object.keys(s.positions).map((p) =>
      `<article class="reading" data-pos="${p}" hidden></article>`).join('');
    updateStatus();
  }

  function updateStatus() {
    const s = spread();
    const left = s.count - state.picked;
    let msg;
    if (left > 0) {
      msg = state.picked === 0 ? `질문을 떠올리며 마음이 가는 카드를 ${s.count}장 골라 주세요.` : `${left}장 더 골라 주세요.`;
    } else if (state.flipped.size < s.count) {
      msg = '카드를 눌러 뒤집어 보세요.';
    } else {
      msg = s.count > 1 ? '1번 자리부터 차례로, 자리의 뜻에 맞춰 읽어 보세요.' : '이 인물이 내 안의 누구인지 떠올려 보세요.';
    }
    $('status').textContent = msg;
  }

  function pick(i) {
    const s = spread();
    if (state.picked >= s.count) return;
    const card = state.deck[i];
    const pos = ++state.picked;
    state.at[pos] = card;

    const slot = $('layout').querySelector(`.slot[data-pos="${pos}"]`);
    slot.querySelector('.slot-hole').outerHTML =
      `<button type="button" class="flip" data-pos="${pos}" aria-label="${pos}번 자리 카드 뒤집기">` +
      `<span class="flip-inner"><span class="side back">${BACK_SVG}</span>` +
      `<span class="side front">${faceHTML(card)}</span></span></button>`;

    if (state.picked === s.count) {
      $('deck').classList.add('is-done');
      $('tableActions').hidden = false;
      $('flipAll').hidden = false;
      const first = $('layout').querySelector('.flip[data-pos="1"]');
      if (first) first.focus({ preventScroll: true });
    }
    updateStatus();
  }

  function flip(pos, quiet) {
    pos = Number(pos);
    if (state.flipped.has(pos) || !state.at[pos]) return;
    state.flipped.add(pos);
    const c = state.at[pos];
    const s = spread();

    const slot = $('layout').querySelector(`.slot[data-pos="${pos}"]`);
    const btn = slot.querySelector('.flip');
    btn.classList.add('is-flipped');
    btn.setAttribute('aria-label', `${pos}번 자리: ${c.ko}`);
    slot.querySelector('.slot-name').textContent = c.ko;

    const article = $('readings').querySelector(`.reading[data-pos="${pos}"]`);
    const posLine = `<p class="pos"><b>${pos}</b>${esc(s.positions[pos][0])}</p><p class="pos-desc">${esc(s.positions[pos][1])}</p>`;
    article.innerHTML = readingHTML(posLine, c, s.positions[pos][2]);
    article.hidden = false;

    const done = state.flipped.size === s.count;
    if (done) {
      $('flipAll').hidden = true;
      $('together').innerHTML = togetherHTML(s, state.at);
      $('together').hidden = false;
    }
    updateStatus();
    if (!quiet && done) setTimeout(() => $('together').scrollIntoView({ block: 'start' }), 700);
  }

  /* ── 도감 ─────────────────────────── */
  const filter = { type: 'all', sign: 0 };

  function renderLibrary() {
    $('cardGrid').innerHTML = CARDS.map((c, i) =>
      `<button type="button" class="card-tile" data-i="${i}" aria-label="${esc(c.ko)} 풀이 보기">` +
      `${faceHTML(c)}<span class="tile-name"><b>${c.n}</b>${esc(c.ko)}</span></button>`).join('');
    const n = (t) => CARDS.filter((c) => c.type === t).length;
    $('filters').innerHTML = `<button type="button" class="chip is-on" data-type="all" aria-pressed="true">전체 <span>${CARDS.length}</span></button>` +
      Object.keys(TYPES).map((t) => `<button type="button" class="chip" data-type="${t}" aria-pressed="false">${TYPES[t][0]} <span>${n(t)}</span></button>`).join('');
    $('signFilters').innerHTML = SIGNS.slice(1).map((sg, i) =>
      `<button type="button" class="chip sign-chip el-${sg.el}" data-sign="${i + 1}" aria-pressed="false" aria-label="${esc(sg.ko)}">${signGlyph(i + 1)}<em>${esc(sg.ko.replace('자리', ''))}</em></button>`).join('');
  }
  function applyFilter() {
    $('filters').querySelectorAll('.chip').forEach((b) => {
      const on = b.dataset.type === filter.type;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    $('signFilters').querySelectorAll('.chip').forEach((b) => {
      const on = Number(b.dataset.sign) === filter.sign;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    $('cardGrid').querySelectorAll('.card-tile').forEach((t) => {
      const c = CARDS[Number(t.dataset.i)];
      t.hidden = (filter.type !== 'all' && c.type !== filter.type) || (filter.sign !== 0 && !c.signs.includes(filter.sign));
    });
  }
  function renderSigns() {
    $('signGrid').innerHTML = SIGNS.slice(1).map((sg, i) =>
      `<article class="sign-card el-${sg.el}"><header>${signGlyph(i + 1)}<div><h4>${esc(sg.ko)} <span>${esc(sg.en)}</span></h4>` +
      `<p>${esc(sg.when)} · ${ELEMENTS[sg.el]} · ${planetGlyph(i + 1)}${esc(sg.planet)}</p></div></header>` +
      `<p class="sign-theme">${esc(sg.theme)}</p>` +
      `<dl><dt>긍정</dt><dd>${esc(sg.pos)}</dd><dt>부정</dt><dd>${esc(sg.neg)}</dd></dl></article>`).join('');
  }

  /* ── 이벤트 ───────────────────────── */
  $('setup').addEventListener('submit', (e) => {
    e.preventDefault();
    const checked = document.querySelector('input[name="spread"]:checked');
    if (checked) state.spreadKey = checked.value;
    state.question = $('question').value.trim();
    startReading();
    $('table').scrollIntoView({ block: 'start' });
  });

  $('deck').addEventListener('click', (e) => {
    const btn = e.target.closest('.deck-card');
    if (!btn || btn.classList.contains('is-taken')) return;
    btn.classList.add('is-taken');
    btn.disabled = true;
    pick(Number(btn.dataset.i));
  });

  $('layout').addEventListener('click', (e) => {
    const btn = e.target.closest('.flip');
    if (btn) flip(btn.dataset.pos);
  });

  $('flipAll').addEventListener('click', () => {
    const rest = Object.keys(state.at).map(Number).filter((p) => !state.flipped.has(p)).sort((a, b) => a - b);
    rest.forEach((p, i) => setTimeout(() => flip(p, i < rest.length - 1), i * 260));
  });

  $('redraw').addEventListener('click', () => {
    startReading();
    $('table').scrollIntoView({ block: 'start' });
  });

  $('filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    filter.type = chip.dataset.type;
    applyFilter();
  });
  $('signFilters').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const sign = Number(chip.dataset.sign);
    filter.sign = filter.sign === sign ? 0 : sign;
    applyFilter();
  });

  const dialog = $('cardDialog');
  $('cardGrid').addEventListener('click', (e) => {
    const tile = e.target.closest('.card-tile');
    if (!tile) return;
    $('dialogBody').innerHTML = dialogHTML(CARDS[Number(tile.dataset.i)]);
    dialog.showModal();
    dialog.scrollTop = 0;
  });
  $('dialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  renderSpreadOptions();
  renderSpreadBook();
  renderLibrary();
  renderSigns();
})();
