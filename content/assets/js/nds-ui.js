
const NDS_UI = (function() {
    /**
     * Buffer - 모달/레이어 하단에 동적으로 여백(buffer) 생성하는 함수 
     */
    function Buffer(selector) {
        if (document.querySelector(selector) == (null || undefined)) return;

        var target = document.querySelector(selector);
        var contents = target.querySelector('.nds-contents');
        var fixer = [].filter.call(contents.children, function(x) { return x.classList.contains('nds-fixer'); })[0];
        var isFixer = (fixer) ? true: false;
        var bufferSize = (typeof size == 'number') ? size : 0;
        var history = 0;
        var isEdited = false;
        var obj = {};
        var bufferEl = document.createElement('div');

        function init() {
            if (target.classList.contains('main')) return;
            if (isFixer) {bufferSize += fixer.offsetHeight;}

            bufferEl.classList.add('nds-buffer');
            bufferEl.setAttribute('style', 'height: '+ bufferSize +'px !important');
            contents.insertAdjacentElement('beforeend', bufferEl);
        }

        function set(size) {
            history = bufferSize;
            bufferSize = size;
            isEdited = true;

            setSize(bufferSize);
        }

        function add(size) {
            history = bufferSize;
            bufferSize += size
            isEdited = true;

            setSize(bufferSize);
        }

        function revert() {
            bufferSize = history;

            setSize(bufferSize);
        }

        function setSize(size) {
            target.querySelector('.nds-buffer').setAttribute('style', 'height: '+ size +'px !important');
        }

        function remove() {
            bufferEl.remove();
        };

        init();

        Object.defineProperties(obj, {
            isEdited: {
                get: function() {
                    return isEdited;
                }
            },
            get: {
                get: function() {
                    return bufferSize;
                }
            },
            set: { value: set },
            add: { value: add },
            revert: { value: revert },
            remove: { value: remove }
        });

        return obj;
    }

    /**
     * stackModalA11y - 모달 오픈 시 접근성 처리
     */
    function stackModalA11y(id) {
        var page = document.querySelector('.nds-page');
        var Modal = document.querySelector(id);
        if (Modal) {
            Modal.tabIndex = 0;
            Modal.removeAttribute('aria-hidden');

            // visibility:hidden 상태에서는 focus()가 동작하지 않으므로
            // 브라우저 렌더링이 완료된 이후 focus()를 실행하기 위해 requestAnimationFrame을 두 번 중첩하여 처리
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    Modal.focus();
                });
            });
        }

        if (stack.print.length === 0) {
            stack.set(page);
        }

        if (page) {
            page.tabIndex = -1;
            page.setAttribute('aria-hidden', 'true');
        }

        stack.print.forEach(function(modal) {
            if (modal && modal !== Modal) {
                modal.tabIndex = -1;
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    /**
     * queueModalA11y - 모달 클로즈 시 접근성 복원 처리
     */
    function queueModalA11y() {
        var Modal = stack.print;
        if (Modal.length > 2) {
            Modal[Modal.length - 1].removeAttribute('tabindex');
            Modal[Modal.length - 1].removeAttribute('aria-hidden');
            Modal[Modal.length - 2].tabIndex = 0;
            Modal[Modal.length - 2].removeAttribute('aria-hidden');
        }
        if (Modal.length <= 2) {
            Modal.forEach(function(modal) {
                if (modal) { 
                    modal.removeAttribute('aria-hidden');
                    modal.tabIndex = 0;
                }
            });
        }
        var page = document.querySelector('.nds-page');
        if (page) {
            page.removeAttribute('aria-hidden');
            page.removeAttribute('tabindex');
        }
    }

    /**
     * Stack - 모달 스택 및 z-index 관리 객체
     */
    function Stack() {
        var count = 1000;
        var stack = [];
        var obj = {};

        function set(dom) {
            if (dom) {
                stack.push(dom);
            }
        }
        function push(dom) {
            count++;
            if (dom) {
                stack.push(dom);
            }
            return count;
        }
        function pop(dom) {
            count--;
            if (dom) {
                stack.pop();
            }
        }
        Object.defineProperties(obj, {
            print: {
                get: function() {
                    return stack;
                }
            },
            set: { value: set },
            push: { value: push },
            pop: { value: pop }
        });
        return obj;
    }
    var stack = new Stack();

    /**
     * Scroll - 모달 오픈 시 바디 스크롤 잠금 및 위치 복원 처리
     */
    function Scroll() {
        var body = document.body;
        var history = 0;

        return {
            save: function() {
                history = (window.hasScrollSave)
                    ? getComputedStyle(body).marginTop.replace(/[^0-9]/g, '')
                    : window.scrollY;

                if (!window.hasScrollSave) {
                    body.classList.add('lock');
                    body.style.marginTop = (history * -1) + 'px';
                }

                window.hasScrollSave = true;
            },
            load: function() {
                if (stack.print.length <= 2) {
                    window.hasScrollSave = false;

                    body.classList.remove('lock');
                    body.removeAttribute('style');
                    window.scrollTo(0, history);
                }
            }
        }
    }

    /**
     * Dim - 모달 배경 딤(dim) 레이어 생성 및 제거
     */
    function Dim() {
        var dim = document.createElement('div');
        dim.classList.add('nds-dim');

        return {
            open: function(id) {
                var target = document.querySelector(id);
                target.insertAdjacentElement('beforebegin', dim);
                dim.style.zIndex = stack.push();
                setTimeout(function() {
                    dim.classList.add('-active');
                });
            },
            close: function() {
                stack.pop();
                dim.classList.remove('-active');
                setTimeout(function() {
                    dim.remove();
                }, 600);
            }
        };
    }

    /**
     * ModalHandler - 모달 생성자 래핑 핸들러
     */
    function ModalHandler(type) {
        return {
            open: function(id, callback) {
                window[id] = new type('#' + id);
                window[id].open(callback);
            },
            close: function(id, callback, isRemove) {
                window[id].close(callback, isRemove);
            },
            isOpen: function(id) {
                return window[id] ? window[id].isOpen : false;
            }
        };
    }

    /**
     * Modal 컴포넌트
     */
    function Modal(id) {
        var el = document.querySelector(id);
        var dim = new Dim();
        var scroll = new Scroll();
        // var information;
        var ModalBuffer;
        var triggerEl = null;
        var isActive = false;
        var lastFocusable = null;
        var type = 'popup'; 
        if (el.classList.contains('nds-alert')) { type = 'alert'; }
        else if (el.classList.contains('nds-layer')) { type = 'layer'; }
        else if (el.classList.contains('nds-popup')) { type = 'popup'; }

        function trapFocus(e) {
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                el.focus();
            }
        }
        function bindFocusTrap() {
            var focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
            var focusableElements = el.querySelectorAll(focusableSelectors);
            lastFocusable = focusableElements[focusableElements.length - 1];
            if (lastFocusable) {
                lastFocusable.addEventListener('keydown', trapFocus);
            }
        }
        function unbindFocusTrap() {
            if (lastFocusable) {
                lastFocusable.removeEventListener('keydown', trapFocus);
                lastFocusable = null;
            }
        }

        function open(callback) {
            triggerEl = document.activeElement;
            scroll.save();

            if (type !== 'popup') dim.open(id);

            setTimeout(function() {
                el.classList.add('-active');
                el.setAttribute('aria-modal', 'true');
                el.style.zIndex = stack.push(el);
                // information = new Information(id);
                ModalBuffer = new Buffer(id);
                stackModalA11y(id);
                bindFocusTrap();

                switch(type) {
                    case 'alert':
                        el.setAttribute('role', 'alertdialog');
                        break;
                    case 'layer':
                        el.setAttribute('role', 'dialog');
                        break;
                    case 'popup':
                        el.setAttribute('role', 'dialog');
                        break;
                }

                isActive = true;
                if (callback instanceof Function) { callback(); }
            });
        }

        function close(callback, isRemove) {
            unbindFocusTrap();
            scroll.load();

            el.classList.remove('-active');
            el.removeAttribute('style');
            el.setAttribute('aria-modal', 'false');
            ModalBuffer.remove();

            stack.pop(el);
            queueModalA11y();

            if (type !== 'popup') dim.close();
            if (isRemove) { el.remove(); }
            if (triggerEl) { triggerEl.focus(); };
            isActive = false;
            if (callback instanceof Function) { callback(); }
        }

        return {
            open: open,
            close: close,
            // get information() { return information },
            get isOpen() { return isActive; },
        };
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
     * Controls(Stepper) 컴포넌트
     * - 수량 증감 및 직접 입력을 통한 숫자 제어
     * 
     * * * [필수 HTML 구조 - data-nds-role 속성]
     * 컨테이너 : data-nds-role="stepper"
     * 감소 버튼 : data-nds-role="step-minus"
     * 증가 버튼 : data-nds-role="step-plus"
     * 수량 입력 : data-nds-role="step-val" (input 요소 권장)
     * 
     * * * * [속성 제어]
     * min / max : 최소/최대값 제한 가능
     * step      : 증감 단위 설정 가능
     */
    function Controls() {
        const steppers = document.querySelectorAll('[data-nds-role="stepper"]');

        steppers.forEach(stepper => {
            if (stepper.dataset.ndsInit) return;
            stepper.dataset.ndsInit = 'true';

            const minusBtn = stepper.querySelector('[data-nds-role="step-minus"]');
            const plusBtn = stepper.querySelector('[data-nds-role="step-plus"]');
            const input = stepper.querySelector('[data-nds-role="step-val"]');
            
            if (!minusBtn || !plusBtn || !input) return;

            const min = parseInt(input.getAttribute('min')) || 0;
            const max = parseInt(input.getAttribute('max')) || 999;
            const step = parseInt(input.getAttribute('step')) || 1;

            // 접근성
            input.setAttribute('role', 'spinbutton');
            input.setAttribute('aria-valuemin', min);
            input.setAttribute('aria-valuemax', max);
            minusBtn.setAttribute('tabindex', '-1');
            plusBtn.setAttribute('tabindex', '-1');

            const updateState = () => {
                let val = parseInt(input.value);
                
                if (isNaN(val)) val = min;

                if (val < min) val = min;
                if (val > max) val = max;

                minusBtn.disabled = (val <= min);
                plusBtn.disabled = (val >= max);
                
                input.value = val;
                input.setAttribute('aria-valuenow', val);
            };

            updateState();

            minusBtn.addEventListener('click', () => {
                let val = parseInt(input.value) || min;
                if (val > min) {
                    input.value = Math.max(val - step, min);
                    updateState();
                }
            });

            plusBtn.addEventListener('click', () => {
                let val = parseInt(input.value) || min;
                if (val < max) {
                    input.value = Math.min(val + step, max);
                    updateState();
                }
            });

            // 키보드 네비게이션
            input.addEventListener('keydown', (e) => {
                let val = parseInt(input.value) || min;

                switch (e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        if (val < max) input.value = Math.min(val + step, max);
                        updateState();
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        if (val > min) input.value = Math.max(val - step, min);
                        updateState();
                        break;
                    case 'Home':
                    case 'End':
                        e.preventDefault();
                        input.value = (e.key === 'Home') ? min : max;
                        updateState();
                        break;
                }
            });

            input.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });

            input.addEventListener('change', updateState);
            input.addEventListener('blur', updateState);
        });
    }

    /**
     * Popover 컴포넌트
     */
    function Popover() {
        const popovers = document.querySelectorAll('[data-nds-role="popover"]');
        
        popovers.forEach(popover => {
            if (popover.dataset.ndsInit) return;
            popover.dataset.ndsInit = 'true';
            popover.classList.add('nds-popover');

            // 위치 클래스 적용
            const placement = popover.getAttribute('data-nds-placement');
            const positionMap = {
                'bottom-center': '-bc',
                'bottom-left': '-bl',
                'bottom-right': '-br',
                'top-center': '-tc',
                'top-left': '-tl',
                'top-right': '-tr'
            };

            if (placement && positionMap[placement]) {
                popover.classList.add(positionMap[placement]);
            }

            // 내용이 없고 data-nds-content가 있는 경우 텍스트 추가
            if (popover.children.length === 0 && !popover.textContent.trim() && popover.dataset.ndsContent) {
                popover.textContent = popover.dataset.ndsContent;
            }

            // 닫기 버튼 생성
            if (!popover.querySelector('[data-nds-role="popover-close"]')) {
                const closeBtn = document.createElement('button');
                closeBtn.type = 'button';
                closeBtn.className = 'nds-button -ico popover-close';
                closeBtn.setAttribute('data-nds-role', 'popover-close');
                closeBtn.innerHTML = '<span class="hide">닫기</span>';
                
                closeBtn.addEventListener('click', () => {
                    popover.remove();
                    if (popover.timer) clearTimeout(popover.timer);
                });
                popover.appendChild(closeBtn);
            }

            // 자동 닫힘 (Duration) 설정
            const duration = popover.getAttribute('data-nds-duration');
            if (duration) {
                if (popover.timer) clearTimeout(popover.timer);
                popover.timer = setTimeout(() => {
                    popover.remove();
                }, parseInt(duration, 10));
            }
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
     * TextField 컴포넌트 (Input, Textarea)
     * - 폼 입력 필드의 상태(포커스, 글자 수 카운팅, 유효성)를 관리하고, 포커스 시 입력 초기화(Clear) 버튼을 동적으로 생성함
     *
     * * * [필수 HTML 구조 - data-nds-role 속성]
     * 필드 컨테이너 : data-nds-role="field" (레이블과 입력창을 모두 포함하는 최상위 영역)
     * 입력 래퍼     : data-nds-role="input-wrap" (실제 입력 요소와 초기화 버튼을 감싸는 영역)
     * 입력 컨트롤   : data-nds-role="control" (실제 input 또는 textarea 태그)
     * 글자 수 표시  : data-nds-role="count" (선택적 사용, 현재 입력 글자 수)
     * 최대 글자 수  : data-nds-role="total" (선택적 사용, 제한 글자 수)
     * 
     * * * * [참고 사항]
     * - 초기화(Clear) 버튼은 JS에서 data-nds-role="clear" 속성으로 동적 생성됨
     * (단, input-wrap에 data-clear="false" 속성이 있거나 readonly/disabled 상태일 경우 생성되지 않음)
     */
    function TextField() {
        // 입력값 상태 갱신
        const updateState = (target) => {
            if (target.tagName !== 'TEXTAREA') return;

            const field = target.closest('[data-nds-role="field"]');
            const infoEl = field?.querySelector('[data-nds-role="info"]');
            const countEl = field?.querySelector('[data-nds-role="count"]');
            const totalEl = field?.querySelector('[data-nds-role="total"]');
            const total = target.getAttribute('maxlength');

            if (totalEl && total) {
                totalEl.innerText = total;
            }

            if (countEl && total) {
                const currentLength = target.value.length;
                countEl.innerText = currentLength;

                if (currentLength > parseInt(total, 10)) {
                    countEl.classList.add('-limit');
                    target.setAttribute('aria-invalid', 'true');

                    if (infoEl) {
                        infoEl.classList.add('-error');
                        infoEl.innerHTML = '<span class="hide">오류: </span>최대 글자 수를 초과했습니다.';
                    }
                } else {
                    countEl.classList.remove('-limit');
                    target.removeAttribute('aria-invalid');

                    if (infoEl) {
                        infoEl.classList.remove('-error');
                        infoEl.innerHTML = ''; 
                    }
                }
            }
        };

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

        const initElements = () => {
            document.querySelectorAll('[data-nds-role="control"]').forEach(control => {
                if (control.dataset.ndsInit) return;
                control.dataset.ndsInit = 'true';
                updateState(control);
            });
        };

        const registerGlobalEvents = () => {
            if (TextField.isInitialized) return;
            TextField.isInitialized = true;

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
                clearBtn.className = 'nds-button -ico clear'; 
                clearBtn.setAttribute('data-nds-role', 'clear');
                clearBtn.innerHTML = '<i class="nds-ico -x24 nds-ico-fill-cancel1" aria-hidden="true"></i><span class="hide">초기화</span>';

                wrap.appendChild(clearBtn);
            }

            if (!isReadonly && !isDisabled) {
                handleFixer(target, true);
            }
        });

        document.addEventListener('focusout', function(e) {
            const target = e.target;
            const isControl = target.matches('[data-nds-role="control"]');
            const isClearBtn = target.matches('[data-nds-role="clear"]');

            if (!isControl && !isClearBtn) return;

            const wrap = target.closest('[data-nds-role="input-wrap"]');
            
            if (e.relatedTarget && wrap?.contains(e.relatedTarget)) return;

            const field = target.closest('[data-nds-role="field"]');
            const label = field?.querySelector('label');

            if (label) label.classList.remove('-focused');
            wrap?.classList.remove('-focused');
            field?.classList.remove('-focused');

            if (!target.readOnly && !target.disabled) {
                handleFixer(target, false);
            }
        });

        document.addEventListener('click', function(e) {
            const clearBtn = e.target.closest('[data-nds-role="clear"]');
            if (!clearBtn) return;

            const wrap = clearBtn.closest('[data-nds-role="input-wrap"]');
            const control = wrap.querySelector('[data-nds-role="control"]');

            if (control) {
                control.value = '';
                
                control.removeAttribute('aria-invalid');

                updateState(control);
                control.focus();
            }
        });

        document.addEventListener('mousedown', function(e) {
            const clearBtn = e.target.closest('[data-nds-role="clear"]');
            if (clearBtn) e.preventDefault();
        });
        };

        const init = () => {
            const fields = document.querySelectorAll('[data-nds-role="field"]');
            if (fields.length === 0) return;
            initElements();
            registerGlobalEvents();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    /**
     * Toast 컴포넌트
     * - 화면에 일시적인 알림 메시지를 띄우고, 3초 뒤 자동으로 DOM에서 제거됨
     * 
     * * @example
     * NDS_UI.Toast({ message: '데이터가 성공적으로 저장되었습니다.' });
     * 
     * * * * [주의사항]
     * - 사용자 작업을 중단시켜야 되는 메시지는 alert modal 컴포넌트 사용 필요
     */

    // NOTE: AS-IS 토스트 컴포넌트는 HTML에 요소를 미리 마크업 하고 display, setTimeout을 통해 제어함. 
    // 이 방식은 접근성에 어긋나기 때문에 동적 DOM 생성 및 이벤트 기반 제거 방식으로 변경함.
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
        // polite: 사용자가 수행중인 작업을 멈추면 읽어줌
        // assertive: 사용자가 수행중인 작업을 중단하고 읽어줌
        toastEl.setAttribute('aria-live', 'polite'); 
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
     * Tooltip 컴포넌트
     * - 트리거 버튼 클릭 시 도움말 패널을 노출하며, 화면 상하 여백에 맞춰 노출 방향을 자동 조정함
     *
     * * * [필수 HTML 구조 - data-nds-role 속성]
     * 툴팁 컨테이너 : data-nds-role="tooltip"
     * 툴팁 트리거   : data-nds-role="tooltip-trigger" (aria-controls="패널ID" 필수)
     * 툴팁 패널     : data-nds-role="tooltip-panel" (id="패널ID" 필수)
     * 
     * * * * [참고 사항]
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
        Controls();
        Popover();
        Tabs();
        TextField();
        Tooltip();
    }

    return {
        init: init,
        Controls: Controls,
        Popover: Popover,
        Tabs: Tabs,
        TextField: TextField,
        Toast: Toast,
        Tooltip: Tooltip,
        Stack: Stack,
        Scroll: Scroll,
        Dim: Dim,
        Modal: Modal,
        ModalHandler : ModalHandler,
    }
}());

NDS_UI.init()

var Modal = NDS_UI.ModalHandler(NDS_UI.Modal);