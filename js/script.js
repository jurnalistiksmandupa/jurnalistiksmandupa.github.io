const PER_PAGE = 6;
let articles = [];
let filtered = [];
let currentPage = 1;

async function init() {
  try {
    const res = await fetch('./news/list.json', { cache: 'no-store' });
    if (!res.ok) throw new Error();
    articles = await res.json();
  } catch (e) {
    console.warn('list.json gagal, coba fallback.json');
    try {
      const fb = await fetch('./news/fallback.json', { cache: 'no-store' });
      if (!fb.ok) throw new Error();
      articles = await fb.json();
    } catch (err) {
      console.error('fallback.json tidak ada');
      articles = [];
    }
  }

  articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  filtered = articles.slice();

  renderKategoriOptions();
  render();

  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  document.getElementById('kategoriFilter').addEventListener('change', applyFilters);
  document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('kategoriFilter').value = '';
    document.getElementById('searchInput').value = '';
    filtered = articles.slice();
    render();
  });
}

function renderKategoriOptions() {
  const set = new Set(articles.map(a => a.category).filter(Boolean));
  const sel = document.getElementById('kategoriFilter');
  sel.innerHTML = `<option value="">Semua kategori</option>`;
  set.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    sel.appendChild(opt);
  });
}

function doSearch() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const cat = document.getElementById('kategoriFilter').value;
  filtered = articles.filter(a => {
    const mq = q ? ((a.title || '').toLowerCase().includes(q) || (a.excerpt || '').toLowerCase().includes(q)) : true;
    const mc = cat ? (a.category === cat) : true;
    return mq && mc;
  });
  currentPage = 1;
  render();
}

function applyFilters() {
  const cat = document.getElementById('kategoriFilter').value;
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  filtered = articles.filter(a => {
    const mc = cat ? (a.category === cat) : true;
    const mq = q ? ((a.title || '').toLowerCase().includes(q) || (a.excerpt || '').toLowerCase().includes(q)) : true;
    return mc && mq;
  });
  currentPage = 1;
  render();
}

function render() {
  const list = document.getElementById('newsList');
  list.innerHTML = '';
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  if (pageItems.length === 0) {
    list.innerHTML = `<div class="col-12"><div class="alert alert-warning">Tidak ada berita.</div></div>`;
    renderPagination();
    return;
  }

  for (const a of pageItems) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    const card = document.createElement('div');
    card.className = 'card news-card h-100 shadow-sm';

    const img = document.createElement('img');
    img.src = a.thumb || '/placeholder.png';
    img.className = 'card-img-top thumb';
    img.alt = a.title;

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    const h5 = document.createElement('h5');
    h5.className = 'card-title';
    h5.textContent = a.title;

    const p = document.createElement('p');
    p.className = 'card-text text-muted flex-grow-1';
    p.textContent = a.excerpt || '';

    const meta = document.createElement('div');
    meta.className = 'd-flex justify-content-between align-items-center mt-3';

    const small = document.createElement('small');
    small.className = 'text-muted';
    small.textContent = (a.date || '') + ' • ' + (a.category || '');

    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-primary';
    btn.textContent = 'Baca';
    // Ganti open modal dengan navigasi ke artikel.html
    btn.addEventListener('click', () => {
      window.location.href = `artikel.html?slug=${a.slug}`;
    });

    meta.appendChild(small);
    meta.appendChild(btn);
    body.appendChild(h5);
    body.appendChild(p);
    body.appendChild(meta);
    card.appendChild(img);
    card.appendChild(body);
    col.appendChild(card);
    list.appendChild(col);
  }

  renderPagination();
}

function renderPagination() {
  const total = Math.ceil(filtered.length / PER_PAGE) || 1;
  const ul = document.getElementById('pagination');
  ul.innerHTML = '';
  for (let i = 1; i <= total; i++) {
    const li = document.createElement('li');
    li.className = 'page-item' + (i === currentPage ? ' active' : '');
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = i;
    a.addEventListener('click', e => { e.preventDefault(); currentPage = i; render(); });
    li.appendChild(a);
    ul.appendChild(li);
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#039;' }[m]));
}

init();
