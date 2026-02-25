
const NDS_UI = (function() {
    /**
     * Toast 알림 컴포넌트
     * * @example
     * NDS_UI.Toast({ message: '데이터가 성공적으로 저장되었습니다.' });
     */
    function Toast(options) {
        options = options || {};
        const message = options.message || '알림이 발생했습니다.';
        
        // 컴포넌트 중복 생성 방지
        const existingToast = document.querySelector('[data-nds-role="toast"]');
        if (existingToast) {
            existingToast.remove();
        }

        const toastEl = document.createElement('div');
        toastEl.setAttribute('data-nds-role', 'toast');
        toastEl.className = 'nds-toast';
        toastEl.textContent = message;
        toastEl.setAttribute('role', 'alert');

        document.body.appendChild(toastEl);

        requestAnimationFrame(() => {
            toastEl.classList.add('-active');
        });

        toastEl.addEventListener('animationend', (e) => {
            if (e.target === toastEl) {
                toastEl.remove();
            }
        });
    }

    /**
     * Accordion 컴포넌트
     */
    function Accordion() {
        document.addEventListener('click', function (e) {
            const marker = e.target.closest('[data-nds-role="marker"]');
            if (!marker) return;

            const fold = marker.closest('[data-nds-role="fold"]');
            const hiddenItems = fold.querySelectorAll('[data-nds-role="hidden"]');
            const isOpen = fold.classList.contains('-active');
            let foldSize;
            let unfoldSize;

            marker.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');

            if (!isOpen) {
                foldSize = fold.offsetHeight;
                fold.classList.add('-slidedown');
                unfoldSize = fold.offsetHeight;
                const duration = 200;
                const delay = 10;

                anime({
                    targets: hiddenItems,
                    easing: 'linear',
                    duration: duration,
                    delay: anime.stagger(delay),
                    opacity: [0, 1],
                    complete: function () {
                        hiddenItems.forEach(function (item) {
                            item.removeAttribute('style');
                        });
                    }
                });
                anime({
                    targets: fold,
                    easing: 'linear',
                    duration: duration + delay * hiddenItems.length - delay,
                    height: [foldSize, unfoldSize],
                    complete: function () {
                        fold.classList.remove('-slidedown');
                        fold.classList.add('-active');
                        fold.removeAttribute('style');
                    }
                });

            } else {
                const duration = 150;
                const delay = 0;
                if (!foldSize) {
                    fold.classList.remove('-active');
                    foldSize = fold.offsetHeight;
                    fold.classList.add('-active');
                }

                unfoldSize = fold.offsetHeight;
                fold.classList.remove('-active');
                fold.classList.add('-slideup');

                anime({
                    targets: hiddenItems,
                    easing: 'linear',
                    height: { value: 0, duration: duration },
                    opacity: { value: 0, duration: duration / 2 },
                    delay: anime.stagger(delay, { direction: 'reverse' }),
                });
                anime({
                    targets: fold,
                    easing: 'linear',
                    duration: duration + delay * hiddenItems.length - delay,
                    height: [unfoldSize, foldSize],
                    complete: function () {
                        fold.classList.remove('-slideup');
                        fold.removeAttribute('style');
                        hiddenItems.forEach(function (item) {
                            item.removeAttribute('style');
                        });
                    }
                });
            }
        });

        const folds = document.querySelectorAll('[data-nds-role="fold"]');
        folds.forEach(function (item) {
            const title = item.querySelector('[data-nds-role="marker"]');
            const isOpen = item.classList.contains('-active');
            title.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    function init() {
        Accordion();
    }

    return {
        init: init,
        Toast: Toast,
    }
}());

NDS_UI.init()