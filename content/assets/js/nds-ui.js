
var NDS_UI = (function() {
    function Sample() {
        const button = document.querySelector('.nds-button');

        if(!button) return;

        document.querySelector('.nds-button').addEventListener('click', function() {
            console.log('샘플입니다.')
        });
    }

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

    function init() {
        Sample();
    }

    return {
        init: init,
        Toast: Toast,
    }
}());

NDS_UI.init()