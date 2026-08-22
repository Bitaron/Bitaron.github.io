document.addEventListener('DOMContentLoaded', function () {

    // ── Collapsible sections — Bootstrap collapse (native accessibility) ────
    document.querySelectorAll('.toggle-section-btn').forEach(function (button) {
        var section = button.closest('.container');
        var content = section.querySelector('.section-content');
        var title   = section.querySelector('h2');

        // Sync icon + aria-* with Bootstrap events (shared.js)
        window.setupCollapseSync(content, button);

        // Click on h2 text (outside the button) also toggles
        title.addEventListener('click', function (e) {
            if (e.target === button || button.contains(e.target)) return;
            bootstrap.Collapse.getOrCreateInstance(content).toggle();
        });
        title.style.cursor = 'pointer';
    });

    // ── Table sorting ─────────────────────────────────────────────────────────
    function sortTable(n, header) {
        var table = document.querySelector('.table');
        var dir   = header.getAttribute('data-dir') === 'desc' ? 'asc' : 'desc';
        var switching = true;

        document.querySelectorAll("th[tabindex]").forEach(function (h) {
            h.setAttribute('data-dir', '');
            h.setAttribute('aria-sort', 'none');
            h.querySelector('.sort-arrow').classList.replace('fa-chevron-down', 'fa-chevron-up');
        });

        header.setAttribute('data-dir', dir);
        header.setAttribute('aria-sort', dir === 'asc' ? 'ascending' : 'descending');
        header.querySelector('.sort-arrow').classList.replace(
            dir === 'asc' ? 'fa-chevron-down' : 'fa-chevron-up',
            dir === 'asc' ? 'fa-chevron-up'   : 'fa-chevron-down'
        );

        while (switching) {
            switching = false;
            var rows = table.rows;
            for (var i = 1; i < rows.length - 1; i++) {
                var x = rows[i].getElementsByTagName('TD')[n].innerHTML.toLowerCase();
                var y = rows[i + 1].getElementsByTagName('TD')[n].innerHTML.toLowerCase();
                if ((dir === 'asc' && x > y) || (dir === 'desc' && x < y)) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                    break;
                }
            }
        }

        // Announce sort change to screen readers
        var announcement = document.getElementById('sort-announcement');
        if (announcement) {
            var colName = header.textContent.trim();
            announcement.textContent = 'Table sorted by ' + colName + ', ' + (dir === 'asc' ? 'ascending' : 'descending') + ' order';
        }
    }

    document.querySelectorAll("th[tabindex]").forEach(function (th, index) {
        th.addEventListener('click', function () { sortTable(index, th); });
        th.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sortTable(index, th); }
        });
    });

    // ── Interest hover image + modal ──────────────────────────────────────────
    var hoverImage = document.createElement('img');
    hoverImage.classList.add('hover-image');
    document.body.appendChild(hoverImage);

    function isMobile() { return window.innerWidth <= 768; }

    document.querySelectorAll('.interest').forEach(function (interest) {
        interest.addEventListener('mouseover', function () {
            if (isMobile()) return;
            hoverImage.src = interest.getAttribute('data-image');
            hoverImage.style.display = 'block';
        });

        var ticking = false;
        interest.addEventListener('mousemove', function (e) {
            if (isMobile() || ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                hoverImage.style.top  = (e.clientY + 20) + 'px';
                hoverImage.style.left = (e.clientX + 20) + 'px';
                ticking = false;
            });
        }, { passive: true });

        interest.addEventListener('mouseout', function () {
            if (!isMobile()) hoverImage.style.display = 'none';
        });

        // Keyboard: show preview on focus (same as hover)
        interest.addEventListener('focus', function () {
            if (isMobile()) return;
            hoverImage.src = interest.getAttribute('data-image');
            var rect = interest.getBoundingClientRect();
            hoverImage.style.top  = (rect.bottom + window.scrollY + 10) + 'px';
            hoverImage.style.left = (rect.left + window.scrollX) + 'px';
            hoverImage.style.display = 'block';
        });
        interest.addEventListener('blur', function () {
            if (!isMobile()) hoverImage.style.display = 'none';
        });

        function openModal(e) {
            e.preventDefault();
            window.openImageModal(interest.getAttribute('data-image'), interest.textContent.trim());
        }
        interest.addEventListener('click', openModal);
        interest.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') openModal(e);
        });
    });

    window.addEventListener('resize', function () {
        if (isMobile()) hoverImage.style.display = 'none';
    }, { passive: true });
});
