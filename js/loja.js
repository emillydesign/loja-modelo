// Loja Modelo: tudo é configurado em loja.json e produtos.json (não precisa mexer aqui).
(async function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = v => (+v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const store = { get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } } };
  const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2200); };

  const [L, P] = await Promise.all([fetch('loja.json').then(r => r.json()), fetch('produtos.json').then(r => r.json())]);
  let cart = store.get('carrinho') || [];
  let filtro = 'Todos';
  const pedido = { entrega: 'Entrega', pagamento: L.pagamentos?.[0] || 'Pix' };

  // identidade
  const c = L.cores || {}, R = document.documentElement.style;
  if (c.fundo) R.setProperty('--bg', c.fundo); if (c.texto) R.setProperty('--tx', c.texto); if (c.destaque) R.setProperty('--ac', c.destaque);
  if (c.botaoTexto) R.setProperty('--actx', c.botaoTexto); if (c.suave) R.setProperty('--soft', c.suave);
  if (L.fonteTitulos || L.fonteTexto) {
    const fams = [...new Set([L.fonteTitulos, L.fonteTexto].filter(Boolean))].map(f => 'family=' + f.replace(/ /g, '+') + ':wght@400;600;700;800').join('&');
    $('#fonts').href = `https://fonts.googleapis.com/css2?${fams}&display=swap`;
    if (L.fonteTitulos) R.setProperty('--ft', `'${L.fonteTitulos}',sans-serif`); if (L.fonteTexto) R.setProperty('--fb', `'${L.fonteTexto}',sans-serif`);
  }
  document.title = `${L.nome} · ${L.slogan || 'Loja online'}`;
  $('#logo').textContent = L.nome;
  if (L.aviso) { $('#aviso').textContent = L.aviso; $('#aviso').hidden = false; }
  const wa = (msg) => `https://wa.me/${L.whatsapp}?text=${encodeURIComponent(msg)}`;
  $('#waFloat').href = wa(`Olá, ${L.nome}! Vim pelo site.`);

  const b = L.banner || {};
  $('#hero').innerHTML = `<div class="hero-in"><div class="hero-tx"><h1>${esc(b.titulo || L.nome)}</h1><p>${esc(b.texto || L.slogan || '')}</p><a class="btn" href="#produtos">${esc(b.botao || 'Ver produtos')} →</a></div>${b.imagem ? `<img src="${esc(b.imagem)}" alt="">` : ''}</div>`;
  $('#sobre').innerHTML = L.sobre ? `<h2>Sobre nós</h2><p>${esc(L.sobre)}</p>` : '';
  $('#foot').innerHTML = `<b>${esc(L.nome)}</b> · ${L.instagram ? `<a href="https://instagram.com/${esc(L.instagram)}" target="_blank" rel="noopener">@${esc(L.instagram)}</a> · ` : ''}<a href="${wa('Olá!')}" target="_blank" rel="noopener">WhatsApp</a><br><small>${esc(L.frete?.observacao || '')}</small>`;

  // vitrine
  const cats = ['Todos', ...new Set(P.map(p => p.categoria).filter(Boolean))];
  function vitrine() {
    $('#filters').innerHTML = cats.length > 2 ? cats.map(x => `<button class="${x === filtro ? 'on' : ''}" data-f="${esc(x)}">${esc(x)}</button>`).join('') : '';
    const list = P.filter(p => filtro === 'Todos' || p.categoria === filtro).sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
    $('#grid').innerHTML = list.map(p => `<div class="card ${p.disponivel === false ? 'off' : ''}">
      <a class="ph" href="#p/${esc(p.id)}"><img src="${esc(p.imagem)}" alt="${esc(p.nome)}" loading="lazy">${p.disponivel === false ? '<span class="badge">Esgotado</span>' : p.precoAntigo ? '<span class="badge">Oferta</span>' : p.destaque ? '<span class="badge">Destaque</span>' : ''}</a>
      <div class="in"><h3>${esc(p.nome)}</h3><div><span class="price">${brl(p.preco)}</span>${p.precoAntigo ? `<span class="old">${brl(p.precoAntigo)}</span>` : ''}</div>
      <a class="btn" href="#p/${esc(p.id)}">${p.disponivel === false ? 'Ver detalhes' : 'Comprar'}</a></div></div>`).join('');
    document.querySelectorAll('[data-f]').forEach(x => x.onclick = () => { filtro = x.dataset.f; vitrine(); });
  }

  // produto
  function abrirProduto(id) {
    const p = P.find(x => x.id === id); if (!p) return;
    let varSel = p.variacoes?.[0] || '', qtd = 1;
    const draw = () => {
      $('#modal').innerHTML = `<div class="mbox"><img src="${esc(p.imagem)}" alt="${esc(p.nome)}"><div class="in"><button class="x" id="mx">✕</button>
        <small style="opacity:.6">${esc(p.categoria || '')}</small><h2>${esc(p.nome)}</h2>
        <div><span class="price" style="font-size:24px">${brl(p.preco)}</span>${p.precoAntigo ? `<span class="old">${brl(p.precoAntigo)}</span>` : ''}</div>
        <p style="opacity:.8">${esc(p.descricao || '')}</p>
        ${p.variacoes?.length ? `<div><label style="font-size:13px;font-weight:600">Opção</label><div class="opts" style="margin-top:6px">${p.variacoes.map(v => `<button class="${v === varSel ? 'on' : ''}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>` : ''}
        ${p.disponivel === false ? `<a class="btn out full" target="_blank" rel="noopener" href="${wa(`Olá! Quero ser avisada(o) quando "${p.nome}" voltar.`)}">Avise-me quando chegar</a>` : `
        <div class="qty"><button id="mmenos">−</button><b>${qtd}</b><button id="mmais">+</button></div>
        <button class="btn full" id="madd">Adicionar ao carrinho</button>
        ${p.linkPagamento ? `<a class="btn out full" href="${esc(p.linkPagamento)}" target="_blank" rel="noopener">Comprar agora (pagamento online)</a>` : ''}`}
      </div></div>`;
      $('#modal').hidden = false;
      $('#mx').onclick = fechar;
      document.querySelectorAll('[data-v]').forEach(x => x.onclick = () => { varSel = x.dataset.v; draw(); });
      $("#mmenos") && ($("#mmenos").onclick = () => { qtd = Math.max(1, qtd - 1); draw(); });
      $("#mmais") && ($("#mmais").onclick = () => { qtd++; draw(); });
      $('#madd') && ($('#madd').onclick = () => { add(p, varSel, qtd); fechar(); abrirCarrinho(); });
    };
    draw();
  }
  function fechar() { $('#modal').hidden = true; if (location.hash.startsWith('#p/')) history.replaceState(null, '', location.pathname + location.search); }
  $('#modal').onclick = e => { if (e.target.id === 'modal') fechar(); };

  // carrinho
  const save = () => { store.set('carrinho', cart); $('#count').textContent = cart.reduce((a, i) => a + i.q, 0); };
  function add(p, v, q) { const k = p.id + '|' + v; const it = cart.find(i => i.k === k); if (it) it.q += q; else cart.push({ k, id: p.id, v, q }); save(); toast('Adicionado ao carrinho ✓'); }
  const subtotal = () => cart.reduce((a, i) => a + (P.find(p => p.id === i.id)?.preco || 0) * i.q, 0);
  const frete = () => { const f = L.frete || {}; if (pedido.entrega === 'Retirada') return 0; if (f.gratisAcima && subtotal() >= f.gratisAcima) return 0; return +f.valor || 0; };
  function abrirCarrinho() { $('#drawer').classList.add('open'); $('#overlay').hidden = false; desenharCarrinho(); }
  function fecharCarrinho() { $('#drawer').classList.remove('open'); $('#overlay').hidden = true; }
  $('#openCart').onclick = abrirCarrinho; $('#closeCart').onclick = fecharCarrinho; $('#overlay').onclick = fecharCarrinho;
  function desenharCarrinho() {
    if (!cart.length) { $('#cartBody').innerHTML = '<div class="empty">Seu carrinho está vazio.<br><br><a class="btn" href="#produtos" id="cv">Ver produtos</a></div>'; $('#cv').onclick = fecharCarrinho; return; }
    const f = L.frete || {};
    $('#cartBody').innerHTML = cart.map((i, n) => { const p = P.find(x => x.id === i.id) || {}; return `<div class="ci"><img src="${esc(p.imagem)}" alt=""><div class="t"><b>${esc(p.nome)}</b>${i.v ? esc(i.v) + ' · ' : ''}${brl(p.preco)}</div><div class="qty"><button data-m="${n}">−</button>${i.q}<button data-p="${n}">+</button></div></div>`; }).join('') + `
      <div class="sum"><div class="row"><span>Subtotal</span><span>${brl(subtotal())}</span></div><div class="row"><span>Frete</span><span>${frete() ? brl(frete()) : 'Grátis'}</span></div>
      ${f.gratisAcima && pedido.entrega !== 'Retirada' && subtotal() < f.gratisAcima ? `<small style="opacity:.7">Faltam ${brl(f.gratisAcima - subtotal())} para frete grátis</small>` : ''}
      <div class="row tot"><span>Total</span><span>${brl(subtotal() + frete())}</span></div></div>
      <div class="form">
        <label>Entrega</label><div class="opts">${['Entrega', ...(f.retirada ? ['Retirada'] : [])].map(x => `<button class="${pedido.entrega === x ? 'on' : ''}" data-e="${x}">${x === 'Retirada' ? 'Retirar no local' : 'Entregar'}</button>`).join('')}</div>
        <label>Pagamento</label><div class="opts">${(L.pagamentos || ['Pix']).map(x => `<button class="${pedido.pagamento === x ? 'on' : ''}" data-pg="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <label for="fn">Seu nome</label><input id="fn" value="${esc(pedido.nome || '')}" autocomplete="name">
        ${pedido.entrega === 'Entrega' ? `<label for="fe">Endereço com CEP</label><textarea id="fe" rows="2" autocomplete="street-address">${esc(pedido.end || '')}</textarea>` : ''}
        <label for="fo">Observação (opcional)</label><input id="fo" value="${esc(pedido.obs || '')}">
        <button class="btn full" id="fin">Finalizar pedido pelo WhatsApp</button>
        <small style="opacity:.6;text-align:center">Você confirma o pedido e o pagamento direto com a loja.</small>
      </div>`;
    const keep = () => { pedido.nome = $('#fn')?.value; pedido.end = $('#fe')?.value ?? pedido.end; pedido.obs = $('#fo')?.value; };
    document.querySelectorAll('[data-m]').forEach(x => x.onclick = () => { keep(); const i = cart[+x.dataset.m]; i.q--; if (i.q <= 0) cart.splice(+x.dataset.m, 1); save(); desenharCarrinho(); });
    document.querySelectorAll('[data-p]').forEach(x => x.onclick = () => { keep(); cart[+x.dataset.p].q++; save(); desenharCarrinho(); });
    document.querySelectorAll('[data-e]').forEach(x => x.onclick = () => { keep(); pedido.entrega = x.dataset.e; desenharCarrinho(); });
    document.querySelectorAll('[data-pg]').forEach(x => x.onclick = () => { keep(); pedido.pagamento = x.dataset.pg; desenharCarrinho(); });
    $('#fin').onclick = () => {
      keep();
      if (!pedido.nome?.trim()) return toast('Digite seu nome');
      if (pedido.entrega === 'Entrega' && !pedido.end?.trim()) return toast('Digite o endereço');
      const linhas = cart.map(i => { const p = P.find(x => x.id === i.id) || {}; return `• ${i.q}x ${p.nome}${i.v ? ' (' + i.v + ')' : ''} — ${brl(p.preco * i.q)}`; });
      const msg = `Olá, ${L.nome}! Quero fazer um pedido:\n\n${linhas.join('\n')}\n\nSubtotal: ${brl(subtotal())}\nFrete: ${frete() ? brl(frete()) : 'grátis'}\n*Total: ${brl(subtotal() + frete())}*\n\nNome: ${pedido.nome}\n${pedido.entrega === 'Entrega' ? 'Entrega em: ' + pedido.end : 'Vou retirar no local'}\nPagamento: ${pedido.pagamento}${pedido.obs ? '\nObs.: ' + pedido.obs : ''}`;
      window.open(wa(msg), '_blank', 'noopener');
    };
  }

  function rota() { const m = location.hash.match(/^#p\/(.+)/); if (m) abrirProduto(decodeURIComponent(m[1])); }
  window.addEventListener('hashchange', rota);
  vitrine(); save(); rota();
})();
