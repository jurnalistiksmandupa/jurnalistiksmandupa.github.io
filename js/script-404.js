// tampilkan beberapa berita terbaru di halaman 404
async function loadRelated() {
  let articles = [];
  try {
    const res = await fetch('/news/list.json', { cache: 'no-store' });
    if (!res.ok) throw new Error();
    articles = await res.json();
  } catch (e) {
    try {
      const fb = await fetch('/news/fallback.json', { cache: 'no-store' });
      if (!fb.ok) throw new Error();
      articles = await fb.json();
    } catch (err) {
      console.error('fallback.json tidak ada');
      articles = [];
    }
  }

  // sortir dari terbaru
  articles.sort((a,b)=>(b.date||'').localeCompare(a.date||''));

  const container = document.getElementById('relatedNews');
  if (articles.length === 0) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-warning">Tidak ada berita.</div></div>`;
    return;
  }

  const perShow = 3; // tampilkan 3 berita terbaru
  articles.slice(0, perShow).forEach(a => {
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

loadRelated();
