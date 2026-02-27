
const NDS_UI = (function() {
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

        if (tabContainers.length === 0) return;

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

            //아코디언 (펼침/닫힘)
            const isAccordion = container.classList.contains('-accordion');
            if (isAccordion) {
                const accordionBtn = container.querySelector('[data-nds-role="tab-accordion-trigger"]');
                
                if (accordionBtn) {
                    accordionBtn.addEventListener('click', () => {
                        const isExpanded = container.classList.toggle('-expanded');
                        
                        const icon = accordionBtn.querySelector('.nds-ico');
                        const hiddenText = accordionBtn.querySelector('.hide');

                        if (isExpanded) {
                            // 열림 상태 처리
                            accordionBtn.setAttribute('aria-expanded', 'true');
                            if (icon) {
                                icon.classList.remove('nds-ico-arr-down1');
                                icon.classList.add('nds-ico-arr-up1');
                            }
                            if (hiddenText) hiddenText.textContent = '접기';
                        } else {
                            // 닫힘 상태 처리
                            accordionBtn.setAttribute('aria-expanded', 'false');
                            if (icon) {
                                icon.classList.remove('nds-ico-arr-up1');
                                icon.classList.add('nds-ico-arr-down1');
                            }
                            if (hiddenText) hiddenText.textContent = '펼치기';
                        }
                    });
                }
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
     * 
     * 주의사항: 사용자 작업을 중단시켜야 되는 메시지는 alert modal 컴포넌트 사용 필요
     */

    // NOTE: AS-IS 토스트 컴포넌트는 HTML에 요소를 미리 마크업 하고 display, setTimeout을 통해 제어함. 
    // 이 방식은 접근성에 어긋나기 때문에 동적 DOM 생성 및 이벤트 기반 제거 방식으로 변경함.
    let lastFocusedElement;

    function Toast(options) {
        options = options || {};
        const message = options.message || '알림이 발생했습니다.';
        lastFocusedElement = document.activeElement;
        
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
        toastEl.setAttribute('aria-live', 'polite'); // polite: 사용자가 진행중인 작업을 완료했을때 사용. assertive: 스크린 리더가 수행중인 작업을 중단하고 알림. 서버 오류 등.
        toastEl.setAttribute('aria-atomic', 'true');

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
    
    /**
     * Input, Textarea 컴포넌트
     */
    function TextField() {
        if (TextField.isInitialized) return;
        TextField.isInitialized = true;

        // 텍스트에어리어 자동 확장
        const autoExpand = (target) => {
            const wrap = target.closest('.-extend');
            if (wrap) {
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
            }
        };

        // 글자 수 카운팅
        const updateCount = (target) => {
            const field = target.closest('[data-nds-role="field"]');
            const countEl = field?.querySelector('[data-nds-role="count"]');
            if (countEl) countEl.innerText = target.value.length;
        };

        // 입력값 상태(textless) 갱신
        const updateState = (target) => {
            const wrap = target.closest('[data-nds-role="input-wrap"]');
            const field = target.closest('[data-nds-role="field"]');
            const label = field?.querySelector('label');
            
            const isTextless = target.value.length === 0;
            if (isTextless) {
                wrap?.classList.add('-textless');
                label?.classList.add('-textless');
                field?.classList.add('-textless');
            } else {
                wrap?.classList.remove('-textless');
                label?.classList.remove('-textless');
                field?.classList.remove('-textless');
            }

            updateCount(target);
            autoExpand(target);
        };

        // NOTE: 올원뱅킹에만 있는 로직. 확인 후 추가 여부 판단 필요
        // 하단 고정 버튼(.fixer) 및 스크롤 버퍼 제어 로직
        const handleFixer = (target, isFocusIn) => {
            const root = target.closest('.container')?.parentNode;
            if (!root) return;

            const rootID = root.id || '';
            const contents = root.querySelector('.contents');
            if (!contents) return;

            const fixer = Array.from(contents.children).find(child => child.classList.contains('fixer'));
            if (!fixer) return;

            const isPage = root.classList.contains('page');
            const isPopup = root.classList.contains('popup');
            const isLayer = root.classList.contains('layer');
            const isAlert = root.classList.contains('alert');

            let targetBuffer = null;
            if (isPage && window.buffer) targetBuffer = window.buffer;
            else if ((isPopup || isLayer || isAlert) && window[rootID]?.buffer) targetBuffer = window[rootID].buffer;

            const applyFixerState = () => {
                if (isFocusIn) {
                    fixer.classList.add('position-static');
                    if (targetBuffer) targetBuffer.set(0);
                } else {
                    fixer.classList.remove('position-static');
                    if (targetBuffer) targetBuffer.revert();
                }
            };

            const applyAbsoluteState = () => {
                if (isFocusIn) fixer.classList.add('position-absolute');
                else fixer.classList.remove('position-absolute');
            };

            if (isPage) {
                setTimeout(() => {
                    if (root.scrollHeight >= root.offsetHeight) applyFixerState();
                    else applyAbsoluteState();
                }, 200);
            } else if (isPopup) {
                setTimeout(() => {
                    if (contents.scrollHeight > contents.offsetHeight) applyFixerState();
                    else applyAbsoluteState();
                }, 200);
            } else if (isLayer || isAlert) {
                applyFixerState();
            }
        };

        // NOTE: 금상몰에만 있는 로직. 확인 후 추가 여부 판단 필요
        // OS별 스크롤 애니메이션 제어 로직
        const handleScroll = (target, label) => {
            const uaClass = typeof opa !== 'undefined' ? opa.exeStatus : null;
            if (uaClass === 5) return; 

            if (target.closest('[data-scroll="false"]')) return;

            const root = target.closest('.container')?.parentNode;
            if (!root) return;

            const rootID = root.id || '';
            const contents = root.querySelector('.contents');
            
            let targetOffset = label ? label.getBoundingClientRect().top : target.getBoundingClientRect().top;
            
            if (target.closest('[data-scroll]') && target.closest('[data-scroll]').dataset.scroll == 'item') {
                const group = target.closest('[data-scroll="group"]');
                if(group) targetOffset = group.getBoundingClientRect().top;
            } else if (target.closest('[role ="tabpanel"]') && !target.matches('input')) {
                const tabPanels = target.closest('.middle-tabs-panels');
                if (tabPanels && tabPanels.previousElementSibling) {
                    targetOffset = tabPanels.previousElementSibling.getBoundingClientRect().top - 30;
                }
            }

            let scrollTarget, targetScrollTop;

            if (root.classList.contains('page')) {
                scrollTarget = document.documentElement;
                const upperHeight = (typeof information !== 'undefined') ? information.upperHeight : 60;
                targetScrollTop = scrollTarget.scrollTop + targetOffset - upperHeight;
            } else {
                scrollTarget = contents;
                if (!scrollTarget) return;
                const upperHeight = (window[rootID] && window[rootID].information) ? window[rootID].information.upperHeight : 60;
                targetScrollTop = scrollTarget.scrollTop + targetOffset - upperHeight;
            }

            if (typeof anime !== 'undefined') {
                setTimeout(() => {
                    anime({
                        targets: scrollTarget,
                        duration: 100,
                        easing: 'linear',
                        scrollTop: targetScrollTop
                    });
                }, 1);
            }
        };

        document.querySelectorAll('[data-nds-role="control"]').forEach(control => {
            const wrap = control.closest('[data-nds-role="input-wrap"]');
            const label = control.closest('[data-nds-role="field"]')?.querySelector('label');

            if (control.readOnly) {
                wrap?.classList.add('-readonly');
                label?.classList.add('-readonly');
            }
            if (control.disabled) {
                wrap?.classList.add('-disabled');
                label?.classList.add('-disabled');
            }
            updateState(control);
        });

        document.addEventListener('input', function(e) {
            const target = e.target;
            if (!target.matches('[data-nds-role="control"]')) return;
            updateState(target);
        });

        document.addEventListener('focusin', function(e) {
            const target = e.target;
            if (!target.matches('[data-nds-role="control"]')) return;

            const wrap = target.closest('[data-nds-role="input-wrap"]');
            const field = target.closest('[data-nds-role="field"]');
            const label = field?.querySelector('label');
            const isReadonly = target.readOnly;
            const isDisabled = target.disabled;

            if (label) label.classList.add('-focused');
            if (!isReadonly && !isDisabled) {
                wrap?.classList.add('-focused');
                field?.classList.add('-focused');
            }

            // 초기화(Clear) 버튼
            if (wrap?.dataset.clear !== "false" && !isReadonly && !isDisabled && !wrap.querySelector('[data-nds-role="clear"]')) {
                const clearBtn = document.createElement('button');
                clearBtn.type = 'button';
                clearBtn.title = '초기화';
                clearBtn.className = 'nds-button -ico nds-clear'; 
                clearBtn.setAttribute('data-nds-role', 'clear');
                clearBtn.innerHTML = '<i class="nds-ico -x24 nds-ico-fill-cancel1" aria-hidden="true"></i><span class="hide">초기화</span>';

                wrap.appendChild(clearBtn);
            }

            // NOTE: 각 채널별에 있던 고유 로직. 확인 후 추가 여부 판단 필요
            if (!isReadonly && !isDisabled) {
                handleFixer(target, true);
                handleScroll(target, label);
            }
        });

        document.addEventListener('focusout', function(e) {
            const target = e.target;
            if (!target.matches('[data-nds-role="control"]')) return;

            const wrap = target.closest('[data-nds-role="input-wrap"]');
            const field = target.closest('[data-nds-role="field"]');
            const label = field?.querySelector('label');

            if (label) label.classList.remove('-focused');
            wrap?.classList.remove('-focused');
            field?.classList.remove('-focused');

            // NOTE: 각 채널별에 있던 고유 로직. 확인 후 추가 여부 판단 필요
            if (!target.readOnly && !target.disabled) {
                handleFixer(target, false); // Fixer 원복
            }
        });

        document.addEventListener('mousedown', function(e) {
            const clearBtn = e.target.closest('[data-nds-role="clear"]');
            if (!clearBtn) return;

            e.preventDefault(); 
            const wrap = clearBtn.closest('[data-nds-role="input-wrap"]');
            const control = wrap.querySelector('[data-nds-role="control"]');

            if (control) {
                control.value = '';
                
                const field = wrap.closest('[data-nds-role="field"]');
                field?.classList.remove('-error');
                control.removeAttribute('aria-invalid');

                updateState(control);
                control.focus();
            }
        });
    }

    /**
     * Tooltip 컴포넌트
     * - 트리거 버튼 클릭 시 도움말 패널을 노출하며, 화면 상하 여백에 맞춰 노출 방향을 자동 조정함
     *
     * * * [필수 HTML 구조 - data-nds-role 속성]
     * 툴팁 컨테이너 : data-nds-role="tooltip"
     * 툴팁 트리거   : data-nds-role="tooltip-trigger" (aria-controls="패널ID" 필수)
     * 툴팁 패널     : data-nds-role="tooltip-panel" (id="패널ID" 필수)
     * 
     * * * [참고 사항]
     * - 닫기 버튼은 JS에서 data-nds-role="tooltip-close" 속성으로 동적 생성됨
     */
    function Tooltip() {
    if (Tooltip.isInitialized) return;
    Tooltip.isInitialized = true;

    // 툴팁 닫기
    const closeTooltip = (parent, panel, trigger, isTriggerClick = false) => {
        if (!parent.classList.contains('-active')) return;

        if (typeof anime !== 'undefined') anime.remove(panel);

        const closeBtn = panel.querySelector('[data-nds-role="tooltip-close"]');

        anime({
            targets: panel,
            easing: 'easeOutCirc',
            duration: 100,
            opacity: [1, 0],
            translateY: [0, '30%'],
            complete: function() {
                parent.classList.remove('-active', '-reversed');
                panel.removeAttribute('style');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
                if (panel) panel.setAttribute('aria-hidden', 'true');
                if (closeBtn) closeBtn.remove();
            }
        });

        if (isTriggerClick) {
            const container = parent.closest('.container');
            const root = container ? container.parentNode : document.body;

            const rootID = root.id || '';
            
            if (root.classList.contains('page') && window.buffer?.isEdited) window.buffer.revert();
            if (root.classList.contains('popup') && window[rootID]?.buffer?.isEdited) window[rootID].buffer.revert();
            if (root.classList.contains('layer') && window.layer?.buffer?.isEdited) window.layer.buffer.revert();
            if (root.classList.contains('alert') && window.alert?.buffer?.isEdited) window.alert.buffer.revert();
        }
    };

    document.addEventListener('click', function(e) {
        const trigger = e.target.closest('[data-nds-role="tooltip-trigger"]');
        const tooltipContainer = e.target.closest('[data-nds-role="tooltip"]');
        const activeTooltips = document.querySelectorAll('[data-nds-role="tooltip"].-active');

        // NOTE: 사용자 경험 측면에서 개선이 필요해 추가함
        // 외부 영역 클릭 감지. @result - close tooltip
        if (!tooltipContainer && !trigger) {
            if (activeTooltips.length === 0) return;

            activeTooltips.forEach(function(tt) {
                const ttTrigger = tt.querySelector('[data-nds-role="tooltip-trigger"]');
                const ttPanel = tt.querySelector('[data-nds-role="tooltip-panel"]');
                closeTooltip(tt, ttPanel, ttTrigger, false);
            });
            return;
        }

        if (!trigger) return;

        const parent = tooltipContainer || trigger.closest('[data-nds-role="tooltip"]');
        const panel = parent?.querySelector('[data-nds-role="tooltip-panel"]');
        
        if (!parent || !panel) return;

        const isOpen = parent.classList.contains('-active');

        if (isOpen) {
            closeTooltip(parent, panel, trigger, true);
            return;
        }

        // NOTE: 타이틀 유무를 왜 감지하는지 확인 필요. 스타일 적으로는 차이가 없음. 개발에서 추가요청이 온 건이 아닌가 싶음.
        if (panel.querySelector('.title')) {
            panel.classList.add('withTitle');
        }

        activeTooltips.forEach(function(tt) {
            if (tt !== parent) {
                const ttTrigger = tt.querySelector('[data-nds-role="tooltip-trigger"]');
                const ttPanel = tt.querySelector('[data-nds-role="tooltip-panel"]');
                closeTooltip(tt, ttPanel, ttTrigger, false);
            }
        });

        const container = trigger.closest('.container');
        const root = container ? container.parentNode : document.body;
        const rootID = root.id || '';

        const isPage = root.classList.contains('page');
        const isPopup = root.classList.contains('popup');
        const isLayer = root.classList.contains('layer');
        const isAlert = root.classList.contains('alert');

        const gutter = isAlert ? 48 : 24;
        const clientH = document.documentElement.clientHeight;
        const rootHeight = parseInt(window.getComputedStyle(root).height || 0);

        if (e.clientY > parseInt(clientH - (clientH / 2.8))) {
            if (!isLayer || (isLayer && rootHeight >= window.innerHeight - 60)) {
                parent.classList.add('-reversed');
            }
        }

        if (typeof anime !== 'undefined') anime.remove(panel);

        // 툴팁 열기
        anime({
            targets: panel,
            easing: 'easeOutCirc',
            duration: 400,
            opacity: [0, 1],
            translateY: ['30%', 0],
            begin: function() {
                parent.classList.add('-active');
                trigger.setAttribute('aria-expanded', 'true');
                panel.setAttribute('aria-hidden', 'false');

                panel.style.left = `calc(calc(${e.pageX}px - ${e.offsetX}px - ${gutter / 10}rem) * -1)`;
                panel.style.width = `calc(100vw - ${(gutter / 10) * 2}rem)`;

                // 툴팁 닫힘 버튼
                if (!panel.querySelector('[data-nds-role="tooltip-close"]')) {
                    const closeBtn = document.createElement('button');
                    closeBtn.type = 'button';
                    closeBtn.title = '도움말 닫기';
                    closeBtn.className = 'nds-button -ico close';
                    closeBtn.setAttribute('data-nds-role', 'tooltip-close');
                    closeBtn.innerHTML = '<i class="nds-ico -x24 nds-ico-close1"></i><span class="hide">닫기</span>';
                    
                    closeBtn.addEventListener('click', function(event) {
                        event.stopPropagation();
                        closeTooltip(parent, panel, trigger, true);
                    }, { once: true });

                    panel.appendChild(closeBtn);
                }

                const fixerEl = root.querySelector('.fixer');
                const bufferEl = root.querySelector('.buffer');
                const stickerEl = root.querySelector('.sticker');
                
                const fixerHeight = fixerEl ? parseInt(window.getComputedStyle(fixerEl).height) : 
                                    (root.querySelector('.content') ? parseInt(window.getComputedStyle(root.querySelector('.content')).paddingBottom) : 0);
                const bufferOffsetTop = bufferEl ? bufferEl.offsetTop : 0;
                const bufferMarginTop = bufferEl ? parseInt(window.getComputedStyle(bufferEl).height) : 0;
                const stickerMarginTop = stickerEl ? parseInt(window.getComputedStyle(stickerEl).marginTop) : 0;

                const comparePageHeight = document.documentElement.scrollHeight - (e.pageY - e.offsetY) - fixerHeight;
                const halfCompareHeight = Math.floor((document.documentElement.scrollHeight - rootHeight) / 2);
                const alertCompareHeight = document.documentElement.scrollHeight - (e.pageY - e.offsetY) - halfCompareHeight - fixerHeight;
                const compareBufferHeight = isPage ? Math.abs(document.documentElement.scrollHeight - bufferOffsetTop - bufferMarginTop - stickerMarginTop) : 0;

                const panelTop = Math.floor(parseFloat(window.getComputedStyle(panel).top) || 0);
                const targetHeight = Math.floor(parseFloat(window.getComputedStyle(trigger).height) || 0);
                const tooltipHeight = Math.floor(parseFloat(window.getComputedStyle(panel).height) || 0);
                const tooltipTotalHeight = tooltipHeight + panelTop + targetHeight + compareBufferHeight;
                
                const heightProfit = Math.abs(comparePageHeight - tooltipTotalHeight);
                const alertHeightProfit = Math.abs(alertCompareHeight - tooltipTotalHeight);

                if (tooltipTotalHeight >= comparePageHeight) {
                    if (isPage && window.buffer) window.buffer.add(heightProfit);
                    if (isPopup && window[rootID]?.buffer) window[rootID].buffer.add(heightProfit);
                    if (isLayer && window.layer?.buffer) window.layer.buffer.add(heightProfit);
                }
                if (isAlert && tooltipHeight >= alertCompareHeight && window.alert?.buffer) {
                    window.alert.buffer.add(alertHeightProfit);
                }
            }
        });

    }, true);
}

    function init() {
        Accordion();
        Tabs();
        TextField();
        Tooltip();
    }

    return {
        init: init,
        Toast: Toast,
        Tabs: Tabs,
        TextField: TextField,
        Tooltip: Tooltip,
    }
}());

NDS_UI.init()