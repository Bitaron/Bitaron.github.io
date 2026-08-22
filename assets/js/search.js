(function () {
    var cfg = window.SiteSearch || {};
    var input = document.getElementById('home-search-input');
    var results = document.getElementById('home-search-results');
    if (!input || !results) return;

    var posts = null;
    var loading = false;

    function render(found) {
        if (found.length === 0) {
            results.innerHTML = '<p class="text-muted">' + (cfg.noResults || 'No articles found.') + '</p>';
            return;
        }
        var html = '<div class="row">';
        found.forEach(function (p) {
            html += '<div class="col-md-6 mb-3">' +
                '<div class="card p-3 h-100" style="cursor:pointer;">' +
                '<h5 class="card-title"><a href="' + p.url + '" class="stretched-link">' + p.title + '</a></h5>' +
                '<p class="card-text text-muted">' + p.excerpt + '</p>' +
                '<p class="text-muted small mb-0">' + p.date + '</p>' +
                '</div></div>';
        });
        html += '</div>';
        results.innerHTML = html;
    }

    function search(query) {
        query = query.toLowerCase().trim();
        if (query.length < 2) { results.innerHTML = ''; return; }
        if (!posts) return;
        var found = posts.filter(function (p) {
            return p.title.toLowerCase().includes(query) ||
                p.excerpt.toLowerCase().includes(query) ||
                p.tags.some(function (t) { return t.toLowerCase().includes(query); });
        });
        render(found);
    }

    function ensureLoaded() {
        if (posts || loading) return;
        loading = true;
        fetch(cfg.searchUrl || '/search.json')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                posts = data;
                loading = false;
                // If the user already typed while loading, run the search now
                if (input.value.length >= 2) search(input.value);
            })
            .catch(function () {
                loading = false;
                input.disabled = true;
                input.placeholder = cfg.unavailable || 'Search unavailable.';
            });
    }

    input.addEventListener('focus', ensureLoaded);
    input.addEventListener('input', function () { search(this.value); });

    // Support ?q= URL parameter (for SearchAction schema)
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
        input.value = q;
        ensureLoaded();
    }
})();
