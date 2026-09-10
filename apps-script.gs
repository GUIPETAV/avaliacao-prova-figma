/**
 * Sistema de Avaliação — Prova de Prototipação no Figma
 * Competições Senac / Senac Serra ES
 *
 * Este script transforma uma planilha do Google em banco de dados do site
 * https://guipetav.github.io/avaliacao-prova-figma/
 *
 * Como instalar: leia o arquivo COMO-CONECTAR.md do repositório.
 */

var ABA_DADOS = '_dados';
var CELULA = 'A1';

var PESOS = {
  A1: 2.5, A2: 2.5, A3: 2.5, A4: 2.5, A5: 2.5, A6: 2.5, A7: 2.5, A8: 2.5, A9: 2.5, A10: 2.5,
  B1: 2.5, B2: 2.5, B3: 2.5, B4: 2.5,
  C1: 2, C2: 2, C3: 1,
  D1: 2.5, D2: 2.5, D3: 2.5, D4: 2.5
};
var ORDEM = Object.keys(PESOS);

/* ---------------- entrada HTTP ---------------- */

function doGet(e) {
  try {
    return json({ ok: true, estado: lerEstado() });
  } catch (err) {
    return json({ ok: false, erro: String(err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var entrada = JSON.parse(e.postData.contents || '{}');
    var estado = mesclar(lerEstado(), entrada);
    gravarEstado(estado);
    espelhar(estado);
    return json({ ok: true, estado: estado });
  } catch (err) {
    return json({ ok: false, erro: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------------- persistência ---------------- */

function planilha() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function abaDados() {
  var ss = planilha();
  var aba = ss.getSheetByName(ABA_DADOS);
  if (!aba) {
    aba = ss.insertSheet(ABA_DADOS);
    aba.hideSheet();
  }
  return aba;
}

function vazio() {
  return {
    titulo: 'Prova de prototipação — Figma',
    avaliadores: [],
    alunos: [],
    notas: {},
    removidos: { alunos: [], avaliadores: [] }
  };
}

function lerEstado() {
  var txt = abaDados().getRange(CELULA).getValue();
  if (!txt) return vazio();
  try {
    var e = JSON.parse(txt);
    if (!e.removidos) e.removidos = { alunos: [], avaliadores: [] };
    if (!e.notas) e.notas = {};
    if (!e.alunos) e.alunos = [];
    if (!e.avaliadores) e.avaliadores = [];
    return e;
  } catch (err) {
    return vazio();
  }
}

function gravarEstado(estado) {
  abaDados().getRange(CELULA).setValue(JSON.stringify(estado));
}

/* ---------------- mesclagem ----------------
 * Cada avaliador só edita a própria ficha, então a fusão por chave
 * (aluno + avaliador) nunca sobrescreve o trabalho de outra pessoa.
 * IDs removidos entram na lista de tombstones e não voltam a ser aceitos.
 */

function mesclar(atual, novo) {
  var r = atual.removidos || { alunos: [], avaliadores: [] };
  r.alunos = unir(r.alunos, (novo.removidos && novo.removidos.alunos) || []);
  r.avaliadores = unir(r.avaliadores, (novo.removidos && novo.removidos.avaliadores) || []);

  var out = {
    titulo: novo.titulo || atual.titulo,
    avaliadores: upsert(atual.avaliadores, novo.avaliadores || [], r.avaliadores),
    alunos: upsert(atual.alunos, novo.alunos || [], r.alunos),
    notas: {},
    removidos: r
  };

  var ids = {};
  out.alunos.forEach(function (a) { ids[a.id] = true; });
  var vivos = {};
  out.avaliadores.forEach(function (a) { vivos[a.id] = true; });

  var chaves = unir(Object.keys(atual.notas || {}), Object.keys(novo.notas || {}));
  chaves.forEach(function (alunoId) {
    if (!ids[alunoId]) return;
    var a = (atual.notas || {})[alunoId] || {};
    var n = (novo.notas || {})[alunoId] || {};
    var fichas = {};
    unir(Object.keys(a), Object.keys(n)).forEach(function (avId) {
      if (!vivos[avId]) return;
      fichas[avId] = n[avId] || a[avId];
    });
    if (Object.keys(fichas).length) out.notas[alunoId] = fichas;
  });

  return out;
}

function unir(a, b) {
  var visto = {}, out = [];
  (a || []).concat(b || []).forEach(function (x) {
    if (!visto[x]) { visto[x] = true; out.push(x); }
  });
  return out;
}

function upsert(atuais, novos, removidos) {
  var fora = {};
  (removidos || []).forEach(function (id) { fora[id] = true; });
  var mapa = {}, ordem = [];
  (atuais || []).forEach(function (x) { if (!fora[x.id]) { mapa[x.id] = x; ordem.push(x.id); } });
  (novos || []).forEach(function (x) {
    if (fora[x.id]) return;
    if (!mapa[x.id]) ordem.push(x.id);
    mapa[x.id] = x;
  });
  return ordem.map(function (id) { return mapa[id]; });
}

/* ---------------- abas legíveis ---------------- */

function espelhar(estado) {
  var nomes = {};
  estado.avaliadores.forEach(function (a) { nomes[a.id] = a.nome; });

  // Competidores
  var linhas = [['Competidor', 'Turma', 'Serviço', 'Tema', 'Arquivo', 'Protótipo', 'Atraso', 'Template', 'Fichas']];
  estado.alunos.forEach(function (al) {
    var fichas = Object.keys(estado.notas[al.id] || {}).length;
    linhas.push([al.nome || '', al.turma || '', al.servico || '', al.tema || '',
      al.arquivo || '', al.proto || '', al.atraso ? 'sim' : '', al.template ? 'sim' : '', fichas]);
  });
  escrever('Competidores', linhas);

  // Notas por critério
  var cab = ['Competidor', 'Avaliador'].concat(ORDEM).concat(['Pontos', 'Observação']);
  var notas = [cab];
  estado.alunos.forEach(function (al) {
    var fichas = estado.notas[al.id] || {};
    Object.keys(fichas).forEach(function (avId) {
      var f = fichas[avId];
      var linha = [al.nome || '', nomes[avId] || avId];
      var soma = 0;
      ORDEM.forEach(function (c) {
        var v = f[c];
        linha.push(v === 0 || v === 1 || v === 2 ? v : '');
        if (v === 0 || v === 1 || v === 2) soma += v * PESOS[c];
      });
      linha.push(arred(soma));
      linha.push(f.__obs || '');
      notas.push(linha);
    });
  });
  escrever('Notas', notas);

  // Ranking
  var rank = estado.alunos.map(function (al) {
    return { al: al, r: calcular(estado, al) };
  }).filter(function (x) { return x.r.final !== null; })
    .sort(function (x, y) { return y.r.final - x.r.final; });

  var res = [['#', 'Competidor', 'Serviço', 'Nota final', 'Faixa', 'A', 'B', 'C', 'D', 'Fichas']];
  rank.forEach(function (x, i) {
    res.push([i + 1, x.al.nome || '', x.al.servico || '', x.r.final, faixa(x.r.final),
      arred(x.r.blocos.A), arred(x.r.blocos.B), arred(x.r.blocos.C), arred(x.r.blocos.D), x.r.fichas]);
  });
  escrever('Ranking', res);
}

function escrever(nome, linhas) {
  var ss = planilha();
  var aba = ss.getSheetByName(nome) || ss.insertSheet(nome);
  aba.clear();
  if (!linhas.length) return;
  var largura = Math.max.apply(null, linhas.map(function (l) { return l.length; }));
  var normal = linhas.map(function (l) {
    var c = l.slice();
    while (c.length < largura) c.push('');
    return c;
  });
  aba.getRange(1, 1, normal.length, largura).setValues(normal);
  aba.getRange(1, 1, 1, largura).setFontWeight('bold').setBackground('#012762').setFontColor('#ffffff');
  aba.setFrozenRows(1);
}

function calcular(estado, aluno) {
  var fichas = estado.notas[aluno.id] || {};
  var ids = Object.keys(fichas);
  if (!ids.length) return { final: null, fichas: 0, blocos: null };

  var totais = [], blocos = { A: 0, B: 0, C: 0, D: 0 };
  ids.forEach(function (avId) {
    var f = fichas[avId], soma = 0;
    ORDEM.forEach(function (c) {
      var v = f[c];
      if (v === 0 || v === 1 || v === 2) {
        soma += v * PESOS[c];
        blocos[c.charAt(0)] += v * PESOS[c];
      }
    });
    totais.push(soma);
  });
  Object.keys(blocos).forEach(function (b) { blocos[b] = blocos[b] / ids.length; });

  var final = totais.reduce(function (s, t) { return s + t; }, 0) / ids.length;
  if (aluno.template) { final -= blocos.B; blocos.B = 0; }
  if (aluno.atraso) final -= 10;
  if (aluno.template) final = Math.min(final, 50);
  return { final: arred(Math.max(0, final)), fichas: ids.length, blocos: blocos };
}

function faixa(n) {
  if (n >= 85) return 'Excelente';
  if (n >= 70) return 'Bom';
  if (n >= 50) return 'Regular';
  return 'Iniciando';
}

function arred(n) { return Math.round(n * 10) / 10; }
