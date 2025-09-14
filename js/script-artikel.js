// Ambil slug dari URL
const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

// Fungsi utama load article
async function loadArticle() {
  let articles = [];
  try {
    // coba fetch list.json dulu
    const res = await fetch('/news/list.json', { cache: 'no-store' });
    if (!res.ok) throw new Error();
    articles = await res.json();
  } catch (e) {
    console.warn('list.json gagal, coba fallback.json');
    try {
      const fb = await fetch('/news/fallback.json', { cache: 'no-store' });
      if (!fb.ok) throw new Error();
      articles = await fb.json();
    } catch (err) {
      console.error('fallback.json tidak ada');
      articles = [];
    }
  }

  // cari artikel berdasarkan slug
  const article = articles.find(a => a.slug === slug);

  // redirect ke 404 jika tidak ada
  if (!article) {
    window.location.href = '/404.html';
    return;
  }

  // tampilkan metadata artikel
  document.getElementById('title').textContent = article.title;
  document.getElementById('date').textContent = article.date || '-';
  document.getElementById('category').textContent = article.category || '-';
  document.getElementById('thumb').src = article.thumb || '/images/placeholder.png';

  // fetch text.txt
  const url = article.txt || `/news/${article.slug}/text.txt`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    const text = await res.text();
    document.getElementById('bodyText').textContent = text;
  } catch (err) {
    document.getElementById('bodyText').innerHTML =
      `<div class="alert alert-info">Isi berita tidak ditemukan pada ${url}.</div><p>${escapeHtml(article.excerpt || '')}</p>`;
  }

  // tampilkan berita terkait
  renderRelated(articles, article.slug);
}

// fungsi escapeHtml untuk mencegah XSS
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

// render berita terkait / terbaru
function renderRelated(allArticles, currentSlug) {
  const container = document.getElementById('relatedNews');
  if (!container) return;

  // filter artikel selain yang sedang dibuka
  const related = allArticles.filter(a => a.slug !== currentSlug);
  if (related.length === 0) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-warning">Tidak ada berita lain.</div></div>`;
    return;
  }

  // tampilkan maksimal 3 berita terkait
  related.slice(0, 3).forEach(a => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <div class="card news-card h-100 shadow-sm">
        <img src="${a.thumb||'/images/placeholder.png'}" class="card-img-top thumb" alt="${a.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${a.title}</h5>
          <p class="card-text text-muted flex-grow-1">${a.excerpt||''}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">${a.date||'-'} • ${a.category||'-'}</small>
            <a href="artikel.html?slug=${a.slug}" class="btn btn-sm btn-primary">Baca</a>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

// jalankan
loadArticle();
