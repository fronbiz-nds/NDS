
var NDS_UI = (function() {
    function Sample() {
        const button = document.querySelector('.nds-button');

        if(!button) return;

        document.querySelector('.nds-button').addEventListener('click', function() {
            console.log('샘플입니다.')
        });
    }

    /**
     * Tab 컴포넌트
     * - 타입(-line, -bar, -chip, -text) 및 레이아웃(-fixed, -flexible, -accordion, -swipe)에 대응
     * 
     * * [필수 HTML 구조 - data-nds-role 속성]
     * 탭 리스트: data-nds-role="tab-list"
     * 탭 버튼  : data-nds-role="tab-btn" (aria-controls="패널ID" 필수)
     * 탭 패널  : data-nds-role="tab-panel" (id="패널ID" 필수)
     */

    // NOTE: AS-IS 스크립트가 tabs(), subs(), segments()로 분리되어있어 관리 및 유지보수에 용이하지 않아 하나의 함수로 통합함
    // 단 올원뱅크의 아래 함수만 충족하지 않음. 특정 케이스에만 적용되는 스크립트인듯한데 해당 케이스를 찾을 수 없음...따라서 통합 함수에서 제외함
    // common-ui.js:166
    // if(tab.parentNode.nextElementSibling) {
    // 	tab.parentNode.nextElementSibling.classList.add('mt-15')
    // }
    function Tabs() {
        const tabContainers = document.querySelectorAll('[data-nds-role="tab"]');

        tabContainers.forEach(container => {
            const tabList = container.querySelector('[data-nds-role="tab-list"]');
            const tabs = Array.from(tabList.querySelectorAll('[data-nds-role="tab-btn"]'));
            if (tabs.length === 0) return;

            // 가로 스크롤 및 인디케이터 필요 여부 판단
            const isFlexible = container.classList.contains('-flexible');
            const needsIndicator = container.classList.contains('-line') || container.classList.contains('-bar');

            const moveIndicator = (activeTab) => {
                if (!needsIndicator) return;
                const offsetLeft = activeTab.offsetLeft;
                const offsetWidth = activeTab.offsetWidth;
                tabList.style.setProperty('--indicator-left', `${offsetLeft}px`);
                tabList.style.setProperty('--indicator-width', `${offsetWidth}px`);
            };

            const checkSwipe = () => {
                if (!isFlexible) return;
                
                if (tabList.scrollWidth > tabList.clientWidth + 2) {
                    container.classList.add('-swipe');
                    handleScrollShadow();
                } else {
                    container.classList.remove('-swipe');
                    container.classList.remove('-scrolled-start', '-scrolled-end');
                }
            };

            // 스크롤 위치에 따른 그림자 표시 제어
            const handleScrollShadow = () => {
                if (!container.classList.contains('-swipe')) return;
                
                const maxScrollLeft = tabList.scrollWidth - tabList.clientWidth;

                if (tabList.scrollLeft >= maxScrollLeft - 5) {
                    container.classList.add('-scrolled-end');
                } else {
                    container.classList.remove('-scrolled-end');
                }
            };

            const activateTab = (selectedTab) => {
                if (selectedTab.classList.contains('-active')) return;

                moveIndicator(selectedTab);

                // 스와이프 모드일 때 선택된 탭이 중앙에 오도록 스크롤 이동
                if (container.classList.contains('-swipe')) {
                    const tabCenter = selectedTab.offsetLeft + (selectedTab.offsetWidth / 2);
                    const listCenter = tabList.clientWidth / 2;
                    tabList.scrollTo({
                        left: tabCenter - listCenter,
                        behavior: 'smooth'
                    });
                }

                // 접근성
                tabs.forEach(t => {
                    t.classList.remove('-active');
                    t.setAttribute('aria-selected', 'false');
                    t.setAttribute('tabindex', '-1');
                });
                selectedTab.classList.add('-active');
                selectedTab.setAttribute('aria-selected', 'true');
                selectedTab.setAttribute('tabindex', '0');

                // 패널 제어
                const targetPanelId = selectedTab.getAttribute('aria-controls');
                const targetPanel = document.getElementById(targetPanelId);
                
                if (targetPanel) {
                    const allPanels = targetPanel.parentElement.querySelectorAll('[data-nds-role="tab-panel"]');
                    allPanels.forEach(panel => {
                        if (panel === targetPanel) {
                            panel.classList.add('-active');
                            panel.removeAttribute('hidden');
                            panel.setAttribute('tabindex', '0');
                        } else {
                            panel.classList.remove('-active');
                            panel.setAttribute('hidden', '');
                            panel.setAttribute('tabindex', '-1');
                        }
                    });
                }
            };

            const initialActiveTab = tabList.querySelector('.-active') || tabs[0];
            if (initialActiveTab) {
                tabs.forEach(t => t.setAttribute('tabindex', '-1'));
                initialActiveTab.setAttribute('tabindex', '0');
                
                requestAnimationFrame(() => {
                    checkSwipe();
                    moveIndicator(initialActiveTab);
                });
            }

            if (isFlexible) {
                tabList.addEventListener('scroll', handleScrollShadow);
            }

            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => activateTab(e.currentTarget));
            });

            // 키보드 네비게이션
            tabList.addEventListener('keydown', (e) => {
                const activeElement = document.activeElement;
                if (!tabs.includes(activeElement)) return;

                let currentIndex = tabs.indexOf(activeElement);
                let newIndex = currentIndex;

                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    newIndex = (currentIndex + 1) % tabs.length;
                    e.preventDefault();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    e.preventDefault();
                } else if (e.key === 'Home') {
                    newIndex = 0;
                    e.preventDefault();
                } else if (e.key === 'End') {
                    newIndex = tabs.length - 1;
                    e.preventDefault();
                }

                if (newIndex !== currentIndex) {
                    e.stopImmediatePropagation();
                    tabs[newIndex].focus();
                    activateTab(tabs[newIndex]); 
                }
            });

            // 반응형 대응
            window.addEventListener('resize', () => {
                checkSwipe();
                const activeTab = tabList.querySelector('.-active');
                if (activeTab) moveIndicator(activeTab);
            });
        });
    }

    /**
     * Toast 컴포넌트
     * - 화면에 일시적인 알림 메시지를 띄우고, 3초 뒤 자동으로 DOM에서 제거됨
     * 
     * * @example
     * NDS_UI.Toast({ message: '데이터가 성공적으로 저장되었습니다.' });
     */

    // NOTE: AS-IS 토스트 컴포넌트는 HTML에 요소를 미리 마크업 하고 display, setTimeout을 통해 제어함. 
    // 이 방식은 접근성에 어긋나기 때문에 동적 DOM 생성 및 이벤트 기반 제거 방식으로 변경함.
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
        Tabs();
    }

    return {
        init: init,
        Toast: Toast,
        Tabs: Tabs,
    }
}());

NDS_UI.init()