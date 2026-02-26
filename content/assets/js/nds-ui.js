
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
     * * * [필수 HTML 구조 - data-nds-role 속성]
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
    
    /**
     * Tooltip 컴포넌트
     * - 트리거 버튼 클릭 시 도움말 패널을 노출하며, 화면 여백(레이아웃)에 맞춰 노출 방향을 자동 조정함
     * 
     * * * [필수 HTML 구조 - data-nds-role 속성]
     * 툴팁 컨테이너 : data-nds-role="tooltip"
     * 툴팁 트리거   : data-nds-role="tooltip-trigger" (aria-controls="패널ID" 필수)
     * 툴팁 패널     : data-nds-role="tooltip-panel" (id="패널ID" 필수)
     * * * (참고: 닫기 버튼은 JS에서 data-nds-role="tooltip-close" 속성으로 동적 생성됨)
     */
    function Tooltip() {
        document.addEventListener('click', function(e) {
            const trigger = e.target.closest('[data-nds-role="tooltip-trigger"]');
            const tooltipContainer = e.target.closest('[data-nds-role="tooltip"]');
            const tooltips = document.querySelectorAll('[data-nds-role="tooltip"]');

            // NOTE: 사용자 경험 측면에서 개선이 필요해 추가함
            // 외부 영역 클릭 감지. @result: close tooltip
            if (!tooltipContainer) {
                tooltips.forEach(function(tt) {
                    if (tt.classList.contains('-active')) {
                        const ttTrigger = tt.querySelector('[data-nds-role="tooltip-trigger"]');
                        const ttPanel = tt.querySelector('[data-nds-role="tooltip-panel"]');
                        const closeBtn = ttPanel.querySelector('[data-nds-role="tooltip-close"]');
                        
                        anime({
                            targets: ttPanel,
                            easing: 'easeOutCirc',
                            duration: 100,
                            opacity: [1, 0],
                            translateY: [0, '30%'],
                            complete: function() {
                                tt.classList.remove('-active', '-reversed');
                                ttPanel.removeAttribute('style');
                                if(ttTrigger) ttTrigger.setAttribute('aria-expanded', 'false');
                                if(ttPanel) ttPanel.setAttribute('aria-hidden', 'true');
                                if (closeBtn) closeBtn.remove();
                            }
                        });
                    }
                });
                return;
            }

            if (!trigger) return;

            const parent = tooltipContainer;
            const panel = parent.querySelector('[data-nds-role="tooltip-panel"]');
            const isOpen = parent.classList.contains('-active');

            // NOTE: 타이틀 유무를 왜 감지하는지 확인 필요. 스타일 적으로는 차이가 없음. 개발에서 추가요청이 온 건이 아닌가 싶음.
            if (panel.querySelector('.title')) {
                panel.classList.add('withTitle');
            }

            const container = trigger.closest('.container');
            const root = container ? container.parentNode : document.body;
            const rootID = root.id || '';

            const isPage = root.classList.contains('page');
            const isPopup = root.classList.contains('popup');
            const isLayer = root.classList.contains('layer');
            const isAlert = root.classList.contains('alert');

            const fixerEl = root.querySelector('.fixer');
            const bufferEl = root.querySelector('.buffer');
            const stickerEl = root.querySelector('.sticker');
            
            const fixerHeight = fixerEl ? parseInt(window.getComputedStyle(fixerEl).height) : 
                                (root.querySelector('.content') ? parseInt(window.getComputedStyle(root.querySelector('.content')).paddingBottom) : 0);
            const bufferOffsetTop = bufferEl ? bufferEl.offsetTop : 0;
            const bufferMarginTop = bufferEl ? parseInt(window.getComputedStyle(bufferEl).height) : 0;
            const stickerMarginTop = stickerEl ? parseInt(window.getComputedStyle(stickerEl).marginTop) : 0;

            const rootHeight = parseInt(window.getComputedStyle(root).height || 0);
            const comparePageHeight = document.documentElement.scrollHeight - (e.pageY - e.offsetY) - fixerHeight;
            const halfCompareHeight = Math.floor((document.documentElement.scrollHeight - rootHeight) / 2);
            const alertCompareHeight = document.documentElement.scrollHeight - (e.pageY - e.offsetY) - halfCompareHeight - fixerHeight;
            const compareBufferHeight = isPage ? Math.abs(document.documentElement.scrollHeight - bufferOffsetTop - bufferMarginTop - stickerMarginTop) : 0;


            // 툴팁 닫기
            if (isOpen) {
                anime({
                    targets: panel,
                    easing: 'easeOutCirc',
                    duration: 100,
                    opacity: [1, 0],
                    translateY: [0, '30%'],
                    complete: function() {
                        parent.classList.remove('-active', '-reversed');
                        panel.removeAttribute('style');
                        
                        trigger.setAttribute('aria-expanded', 'false');
                        panel.setAttribute('aria-hidden', 'true');

                        const closeBtn = panel.querySelector('[data-nds-role="tooltip-close"]');
                        if (closeBtn) closeBtn.remove();
                    }
                });

                if (isPage && typeof buffer !== 'undefined' && buffer.isEdited) buffer.revert();
                if (isPopup && window[rootID] && window[rootID].buffer && window[rootID].buffer.isEdited) window[rootID].buffer.revert();
                if (isLayer && typeof layer !== 'undefined' && layer.buffer && layer.buffer.isEdited) layer.buffer.revert();
                if (isAlert && typeof alert !== 'undefined' && alert.buffer && alert.buffer.isEdited) alert.buffer.revert();
                
            } else { 
                // 툴팁 열기
                const gutter = typeof isAlert !== 'undefined' && isAlert ? 48 : 24;

                anime({
                    targets: panel,
                    easing: 'easeOutCirc',
                    duration: 400,
                    opacity: [0, 1],
                    translateY: ['30%', 0],
                    begin: function() {
                        const clientH = document.documentElement.clientHeight;
                        if (e.clientY > parseInt(clientH - (clientH / 2.8))) {
                            if (!isLayer || (isLayer && rootHeight >= window.innerHeight - 60)) {
                                parent.classList.add('-reversed');
                            }
                        }

                        tooltips.forEach(function(tt) {
                            if (tt !== parent && tt.classList.contains('-active')) {
                                tt.classList.remove('-active');
                                const ttTrigger = tt.querySelector('[data-nds-role="tooltip-trigger"]');
                                const ttPanel = tt.querySelector('[data-nds-role="tooltip-panel"]');
                                const ttClose = ttPanel.querySelector('[data-nds-role="tooltip-close"]');
                                
                                if(ttTrigger) ttTrigger.setAttribute('aria-expanded', 'false');
                                if(ttPanel) {
                                    ttPanel.setAttribute('aria-hidden', 'true');
                                    ttPanel.removeAttribute('style');
                                }
                                if(ttClose) ttClose.remove();
                            }
                        });

                        parent.classList.add('-active');
                        trigger.setAttribute('aria-expanded', 'true');
                        panel.setAttribute('aria-hidden', 'false');

                        panel.style.left = `calc(calc(${e.pageX}px - ${e.offsetX}px - ${gutter / 10}rem) * -1)`;
                        panel.style.width = `calc(100vw - ${(gutter / 10) * 2}rem)`;

                        const closeBtn = document.createElement('button');
                        closeBtn.type = 'button';
                        closeBtn.title = '도움말 닫기';
                        closeBtn.className = 'nds-button -ico close';
                        closeBtn.setAttribute('data-nds-role', 'tooltip-close');
                        closeBtn.innerHTML = '<i class="nds-ico -x24 nds-ico-close1"></i><span class="hide">닫기</span>';
                        panel.appendChild(closeBtn);

                        closeBtn.addEventListener('click', function(event) {
                            event.stopPropagation();
                            trigger.click();
                        }, { once: true });

                        const panelTop = Math.floor(parseFloat(window.getComputedStyle(panel).top) || 0);
                        const targetHeight = Math.floor(parseFloat(window.getComputedStyle(trigger).height) || 0);
                        const tooltipHeight = Math.floor(parseFloat(window.getComputedStyle(panel).height) || 0);
                        const tooltipTotalHeight = tooltipHeight + panelTop + targetHeight + compareBufferHeight;
                        
                        const heightProfit = Math.abs(comparePageHeight - tooltipTotalHeight);
                        const alertHeightProfit = Math.abs(alertCompareHeight - tooltipTotalHeight);

                        if (tooltipTotalHeight >= comparePageHeight) {
                            if (isPage && typeof buffer !== 'undefined') buffer.add(heightProfit);
                            if (isPopup && window[rootID] && window[rootID].buffer) window[rootID].buffer.add(heightProfit);
                            if (isLayer && typeof layer !== 'undefined' && layer.buffer) layer.buffer.add(heightProfit);
                        }
                        if (isAlert && tooltipHeight >= alertCompareHeight && typeof alert !== 'undefined' && alert.buffer) {
                            alert.buffer.add(alertHeightProfit);
                        }
                    }
                });
            }
        }, true);
    }

    function init() {
        Sample();
        Tabs();
        Tooltip();
    }

    return {
        init: init,
        Toast: Toast,
        Tabs: Tabs,
        Tooltip: Tooltip,
    }
}());

NDS_UI.init()