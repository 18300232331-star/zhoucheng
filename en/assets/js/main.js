/**
 * Safety Boots Export Pro - main.js v1.0.3
 */

(function() {
    'use strict';

    // ========== åå°é¡¶é¨ï¼ç«å³ç»å®ï¼ä¸ä¾èµ DOMContentLoadedï¼ ==========
    function initBackToTop() {
        var btn = document.getElementById('backToTop');
        if (!btn) {
            // å¦ææé®è¿æ²¡æ¸²æï¼ç­ DOM å è½½å®åæ¾
            document.addEventListener('DOMContentLoaded', function() {
                var b = document.getElementById('backToTop');
                if (b) bindBackToTop(b);
            });
            return;
        }
        bindBackToTop(btn);
    }

    function bindBackToTop(btn) {
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    initBackToTop();

    // ========== FAQ æé£ç´ + æ±å ¡èå ==========
    document.addEventListener('DOMContentLoaded', function() {
        // æ±å ¡èåï¼å¼å®¹ iOS Safariï¼
        var menuBtn = document.getElementById('mobileMenuBtn');
        var navMenu = document.getElementById('navMenu');
        if (menuBtn && navMenu) {
            var isTouchDevice = false;
            function toggleMenu() {
                menuBtn.classList.toggle('active');
                navMenu.classList.toggle('open');
            }
            // è§¦æ¸è®¾å¤ï¼ç¨ touchendï¼å¹¶é»æ­¢åç»­ click
            menuBtn.addEventListener('touchstart', function() {
                isTouchDevice = true;
            }, { passive: true });
            menuBtn.addEventListener('touchend', function(e) {
                e.preventDefault(); // é»æ­¢åç»­ click è§¦å
                toggleMenu();
            });
            // éè§¦æ¸è®¾å¤ï¼ç¨ click
            menuBtn.addEventListener('click', function(e) {
                if (isTouchDevice) {
                    isTouchDevice = false;
                    return; // è§¦æ¸è®¾å¤å·²ç± touchend å¤ç
                }
                toggleMenu();
            });
            navMenu.querySelectorAll('a').forEach(function(link) {
                link.addEventListener('click', function() {
                    menuBtn.classList.remove('active');
                    navMenu.classList.remove('open');
                });
            });
        }

        // FAQ æé£ç´
        document.querySelectorAll('.faq-question').forEach(function(question) {
            question.addEventListener('click', function() {
                var item = this.parentElement;
                var wasActive = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(function(i) {
                    i.classList.remove('active');
                });
                if (!wasActive) {
                    item.classList.add('active');
                }
            });
        });

        // ææºç«¯åç±»ä¸æè·³è½¬ï¼å¼å®¹ iOS Safariï¼
        // iOS Safari ææ¶ change äºä»¶ä¸è§¦åï¼éè¦ç¨ touchstart + blur åéä¿é
        function handleCatSelectChange(selectEl) {
            if (!selectEl) return;
            var redirecting = false;

            function doRedirect() {
                if (redirecting) return;
                var val = selectEl.value;
                if (val && val !== '') {
                    redirecting = true;
                    window.location.href = val;
                }
            }

            // æ åæ¹å¼
            selectEl.addEventListener('change', doRedirect);

            // iOS Safari å¼å®¹ï¼æäº iOS çæ¬ change ä¸è§¦å
            selectEl.addEventListener('blur', function() {
                setTimeout(doRedirect, 100);
            });

            // è§¦æ¸è®¾å¤é¢å¤ä¿é
            selectEl.addEventListener('touchend', function() {
                setTimeout(doRedirect, 300);
            });
        }

        // å»¶è¿ç»å®ï¼ç¡®ä¿ DOM å®å¨æ¸²æï¼iOS Safari éè¦ï¼
        function initCatSelects() {
            handleCatSelectChange(document.getElementById('mobileProductCatSelect'));
            handleCatSelectChange(document.getElementById('mobileNewsCatSelect'));
        }

        if (document.readyState === 'complete') {
            initCatSelects();
        } else {
            window.addEventListener('load', initCatSelects);
        }

        // ========== å¹³æ»æ»å¨ ==========
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                var href = this.getAttribute('href');
                if (href.length > 1) {
                    var target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    });

})();
