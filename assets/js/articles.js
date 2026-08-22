var btnChrono  = document.getElementById('btn-chrono');
var btnTags    = document.getElementById('btn-tags');
var btnSeries  = document.getElementById('btn-series');
var viewChrono = document.getElementById('view-chrono');
var viewTags   = document.getElementById('view-tags');
var viewSeries = document.getElementById('view-series');

function getNavbarHeight() {
    var navbar = document.querySelector('.navbar');
    return navbar ? navbar.offsetHeight : 0;
}

function scrollToAnchor(id) {
    var target = document.getElementById(id);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - getNavbarHeight() - 16;
    window.scrollTo({ top: top, behavior: 'smooth' });
}

function activateView(view) {
    var mapping = {
        chrono: { btn: btnChrono, panel: viewChrono },
        tags:   { btn: btnTags,   panel: viewTags },
        series: { btn: btnSeries, panel: viewSeries }
    };
    Object.keys(mapping).forEach(function (key) {
        var m = mapping[key];
        if (!m.btn || !m.panel) return;
        var active = key === view;
        m.panel.style.display = active ? '' : 'none';
        m.btn.classList.toggle('active', active);
        m.btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
}

if (btnChrono) btnChrono.addEventListener('click', function () { activateView('chrono'); });
if (btnTags)   btnTags.addEventListener('click',   function () { activateView('tags'); });
if (btnSeries) btnSeries.addEventListener('click', function () { activateView('series'); });

function switchToTagsView(event, anchor) {
    event.preventDefault();
    activateView('tags');
    setTimeout(function () { scrollToAnchor(anchor); }, 50);
}

if (viewTags) {
    viewTags.addEventListener('click', function (e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) return;
        e.preventDefault();
        scrollToAnchor(link.getAttribute('href').slice(1));
    });
}

(function () {
    var hash = window.location.hash;
    if (!hash) return;
    var id = hash.slice(1);
    if (!document.getElementById(id)) return;
    // Auto-switch to the correct view based on anchor prefix
    if (id.indexOf('series-') === 0) {
        activateView('series');
    } else {
        activateView('tags');
    }
    setTimeout(function () { scrollToAnchor(id); }, 50);
})();
