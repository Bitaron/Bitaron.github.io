(function () {
    var content = document.querySelector('article .content');
    if (!content) return;

    // Get the aria-label for the scrollable table wrapper (from data attribute or fallback)
    var scrollableTableLabel = (document.body.dataset.scrollableTableLabel) || 'Scrollable table';

    // Copy-to-clipboard button on code blocks
    // Use div.highlight to avoid matching both <div class="highlight"> and <pre class="highlight">
    function addCopyButtons(root) {
        root.querySelectorAll('div.highlight').forEach(function (block) {
            if (block.querySelector('.code-copy-btn')) return;
            var btn = document.createElement('button');
            btn.className = 'code-copy-btn';
            btn.type = 'button';
            btn.setAttribute('aria-label', 'Copy code');
            btn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Copy';
            btn.addEventListener('click', function () {
                var code = block.querySelector('code') || block.querySelector('pre');
                if (!code) return;
                navigator.clipboard.writeText(code.innerText).then(function () {
                    btn.classList.add('copied');
                    btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
                    setTimeout(function () {
                        btn.classList.remove('copied');
                        btn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Copy';
                    }, 2000);
                }).catch(function () {
                    btn.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i> Failed';
                });
            });
            block.appendChild(btn);
        });
    }

    // Wrap tables for responsive scroll + accessibility
    function wrapTables(root) {
        root.querySelectorAll('table').forEach(function (table) {
            var wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            var scroll = document.createElement('div');
            scroll.className = 'table-scroll';
            scroll.setAttribute('role', 'region');
            scroll.setAttribute('aria-label', scrollableTableLabel);
            scroll.setAttribute('tabindex', '0');
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(scroll);
            scroll.appendChild(table);
        });
    }

    // Click-to-zoom for inline content images (exclude banners/covers)
    function setupImageZoom(root) {
        root.querySelectorAll('img').forEach(function (img) {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', function () {
                window.openImageModal(img.src, img.alt);
            });
        });
    }

    // Obsidian-style callouts: > [!WARNING], > [!NOTE], > [!TIP], > [!IMPORTANT], > [!CAUTION]
    function parseObsidianCallouts(root) {
        var calloutTypes = {
            'NOTE':      { icon: 'ℹ️',  label: 'Note' },
            'TIP':       { icon: '💡', label: 'Tip' },
            'WARNING':   { icon: '⚠️', label: 'Warning' },
            'IMPORTANT': { icon: '❗', label: 'Important' },
            'CAUTION':   { icon: '🔴', label: 'Caution' }
        };
        root.querySelectorAll('blockquote').forEach(function(bq) {
            var firstP = bq.querySelector('p');
            if (!firstP) return;
            var match = firstP.textContent.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i);
            if (!match) return;
            var type = match[1].toUpperCase();
            var info = calloutTypes[type];
            firstP.innerHTML = firstP.innerHTML.replace(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i, '');
            bq.classList.add('callout', 'callout-' + type.toLowerCase());
            var header = document.createElement('div');
            header.className = 'callout-header';
            header.textContent = info.icon + ' ' + info.label;
            bq.insertBefore(header, bq.firstChild);
        });
    }

    // Autolink bare URLs (https://...) in text nodes
    function autolinkUrls(root) {
        (function walk(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                var urlRegex = /(https?:\/\/[^\s<>'")\]]+)/g;
                if (!urlRegex.test(node.textContent)) return;
                var span = document.createElement('span');
                span.innerHTML = node.textContent.replace(/(https?:\/\/[^\s<>'")\]]+)/g, function(url) {
                    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
                });
                node.parentNode.replaceChild(span, node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                var tag = node.tagName;
                if (tag === 'A' || tag === 'CODE' || tag === 'PRE' || tag === 'SCRIPT') return;
                Array.from(node.childNodes).forEach(walk);
            }
        })(root);
    }

    // Icon + target="_blank" on all external links, plus sr-only text
    function decorateExternalLinks(root) {
        root.querySelectorAll('a[href^="http"]').forEach(function(a) {
            try { if (new URL(a.href).hostname === window.location.hostname) return; } catch(e) { return; }
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
            if (!a.querySelector('.fa-square-up-right')) {
                var icon = document.createElement('i');
                icon.className = 'fa-solid fa-square-up-right';
                icon.setAttribute('aria-hidden', 'true');
                icon.style.cssText = 'margin-left:0.25em;font-size:0.75em;vertical-align:middle;';
                a.appendChild(icon);
                var srText = document.createElement('span');
                srText.className = 'sr-only';
                srText.textContent = ' (opens in a new window)';
                a.appendChild(srText);
            }
        });
    }

    // Intercept the PDF button: re-render Mermaid in light theme before printing
    function setupPrintButton() {
        var printBtn = document.querySelector('.print-btn');
        if (!printBtn) return;
        printBtn.onclick = async function() {
            if (window.mermaidReRender) {
                await window.mermaidReRender('default');
                window.print();
                await window.mermaidReRender(window.mermaidGetTheme ? window.mermaidGetTheme() : 'default');
            } else {
                window.print();
            }
        };
    }

    // TOC — generated before collapse buttons so textContent stays clean
    function generateTOC(root) {
        var headings = root.querySelectorAll('h2, h3');
        if (headings.length < 3) return;
        var tocList = document.getElementById('toc-list');
        // Only H2s count for pill numbering
        var h2s = [];
        headings.forEach(function (h, i) {
            if (!h.id) h.id = 'heading-' + i;
            if (h.tagName === 'H2') h2s.push(h);
            var li = document.createElement('li');
            if (h.tagName === 'H3') li.classList.add('toc-h3');
            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            li.appendChild(a);
            tocList.appendChild(li);
        });
        document.getElementById('toc-wrapper').style.display = 'block';
        setupFloatingTOC(h2s, tocList);
    }

    // Floating TOC pill + drawer (alternative navigation for long articles)
    function setupFloatingTOC(h2s, sourceList) {
        if (h2s.length < 3) return;
        var inlineTOC = document.getElementById('toc-wrapper');
        var tocLabel = (inlineTOC && inlineTOC.getAttribute('aria-label')) || 'Table of contents';

        // Build the pill
        var pill = document.createElement('button');
        pill.id = 'toc-pill';
        pill.className = 'toc-pill';
        pill.type = 'button';
        pill.setAttribute('aria-haspopup', 'dialog');
        pill.setAttribute('aria-controls', 'toc-drawer');
        pill.setAttribute('aria-expanded', 'false');
        pill.setAttribute('aria-label', 'Open ' + tocLabel.toLowerCase());
        pill.innerHTML =
            '<i class="fas fa-list" aria-hidden="true"></i>' +
            '<span class="toc-pill-count">1/' + h2s.length + '</span>' +
            '<span class="toc-pill-title"></span>';
        document.body.appendChild(pill);

        // Build the drawer (clone of source list)
        var drawer = document.createElement('div');
        drawer.id = 'toc-drawer';
        drawer.className = 'toc-drawer';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-labelledby', 'toc-drawer-title');
        drawer.hidden = true;
        drawer.innerHTML =
            '<div class="toc-drawer-backdrop"></div>' +
            '<div class="toc-drawer-panel">' +
                '<div class="toc-drawer-header">' +
                    '<h2 id="toc-drawer-title">' + tocLabel + '</h2>' +
                    '<button class="toc-drawer-close" type="button" aria-label="Close">' +
                        '<i class="fas fa-xmark" aria-hidden="true"></i>' +
                    '</button>' +
                '</div>' +
                '<ol class="toc-drawer-list">' + sourceList.innerHTML + '</ol>' +
            '</div>';
        document.body.appendChild(drawer);

        var openerBeforeOpen = null;
        function openDrawer() {
            openerBeforeOpen = document.activeElement;
            drawer.hidden = false;
            pill.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            drawer.querySelector('.toc-drawer-close').focus();
        }
        function closeDrawer() {
            drawer.hidden = true;
            pill.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            if (openerBeforeOpen) openerBeforeOpen.focus();
        }
        pill.addEventListener('click', openDrawer);
        drawer.querySelector('.toc-drawer-backdrop').addEventListener('click', closeDrawer);
        drawer.querySelector('.toc-drawer-close').addEventListener('click', closeDrawer);
        drawer.querySelector('.toc-drawer-list').addEventListener('click', function (e) {
            if (e.target.closest('a')) closeDrawer();
        });
        document.addEventListener('keydown', function (e) {
            if (!drawer.hidden && e.key === 'Escape') closeDrawer();
        });

        // Track which H2 is the current section via IntersectionObserver
        var pillCount = pill.querySelector('.toc-pill-count');
        var pillTitle = pill.querySelector('.toc-pill-title');
        function updatePill(idx) {
            pillCount.textContent = (idx + 1) + '/' + h2s.length;
            pillTitle.textContent = h2s[idx].textContent.trim();
        }
        updatePill(0);
        var visible = new Set();
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) visible.add(entry.target);
                else visible.delete(entry.target);
            });
            var firstVisible = h2s.findIndex(function (h) { return visible.has(h); });
            if (firstVisible >= 0) updatePill(firstVisible);
        }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
        h2s.forEach(function (h) { io.observe(h); });

        // Hide the pill while the inline TOC is visible
        var inlineObserver = new IntersectionObserver(function (entries) {
            var inlineVisible = entries[0].isIntersecting;
            pill.classList.toggle('visible', !inlineVisible);
        }, { threshold: 0 });
        inlineObserver.observe(inlineTOC);
    }

    // Collapsible H2 sections — Bootstrap collapse (native accessibility)
    function setupH2Collapse(root) {
        root.querySelectorAll('h2').forEach(function (h2, idx) {
            var siblings = [];
            var next = h2.nextElementSibling;
            while (next && next.tagName !== 'H2') {
                siblings.push(next);
                next = next.nextElementSibling;
            }
            if (siblings.length === 0) return;

            var wrapperId = 'section-collapse-' + idx;

            var wrapper = document.createElement('div');
            wrapper.className = 'collapse show';
            wrapper.id = wrapperId;
            h2.parentNode.insertBefore(wrapper, siblings[0]);
            siblings.forEach(function (el) { wrapper.appendChild(el); });

            // Wrap the H2's text content in a span for styling (underline effect)
            var span = document.createElement('span');
            span.className = 'h2-text';
            while (h2.firstChild) span.appendChild(h2.firstChild);
            h2.appendChild(span);

            var btn = document.createElement('button');
            btn.className = 'collapse-section-btn';
            btn.setAttribute('type', 'button');
            btn.setAttribute('data-bs-toggle', 'collapse');
            btn.setAttribute('data-bs-target', '#' + wrapperId);
            btn.setAttribute('aria-controls', wrapperId);
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Collapse section');
            btn.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
            h2.appendChild(btn);

            // Sync chevron icon + aria-* via Bootstrap events (shared.js)
            window.setupCollapseSync(wrapper, btn);

            // Clicking the H2 (outside the button) also toggles the section
            h2.addEventListener('click', function (e) {
                if (e.target === btn || btn.contains(e.target)) return;
                bootstrap.Collapse.getOrCreateInstance(wrapper).toggle();
            });
            h2.style.cursor = 'pointer';
        });
    }

    // "Copy link" button in the share bar (outside .content)
    function setupShareCopyLink() {
        var btn = document.querySelector('.post-share-copy');
        if (!btn) return;
        var label = btn.querySelector('.post-share-copy-label');
        var copyText = (label && label.textContent) || 'Copy link';
        var copiedText = btn.getAttribute('data-copied-label') || 'Copied!';
        btn.addEventListener('click', function () {
            var url = btn.getAttribute('data-url') || window.location.href;
            navigator.clipboard.writeText(url).then(function () {
                btn.classList.add('copied');
                if (label) label.textContent = copiedText;
                setTimeout(function () {
                    btn.classList.remove('copied');
                    if (label) label.textContent = copyText;
                }, 2000);
            });
        });
    }

    // Non-critical tasks deferred after first paint
    var defer = window.requestIdleCallback || function(cb) { setTimeout(cb, 1); };

    wrapTables(content);
    addCopyButtons(content);
    setupImageZoom(content);
    parseObsidianCallouts(content);
    setupShareCopyLink();
    setupPrintButton();
    generateTOC(content);     // BEFORE setupH2Collapse (textContent dependency)
    setupH2Collapse(content);

    // autolinkUrls and decorateExternalLinks are visually non-critical
    // (no layout impact). Deferred to free the main thread.
    defer(function() {
        autolinkUrls(content);
        decorateExternalLinks(content);
    });
})();
