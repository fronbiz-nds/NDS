//userAgent 임시값 
var opa = {
    exeStatus : 0,
}

var UI = (function() {
    function throttle(func, limit) {
        var lastFunc;
        var lastRan;

        return function() {
            var context = this;
            var args = arguments;

            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        }
    }

    function clickable() {
        document.addEventListener('click', function(e) {
            var target = e.target;

            if (target.nodeName === 'BUTTON' || target.nodeName === 'A' || target.closest('button') || target.closest('a')) {

                target.classList.add('clicked');

                setTimeout(function() {
                    target.classList.remove('clicked');
                }, 500);
            }
        });
    }

    function tabs() {
        var inner = document.querySelector('nav.tabs .inner');
        var activeItem = document.querySelector('nav.tabs .-active');

        var tabsWidth = 0;
        var scrollWidth = 0;
        
        document.querySelectorAll('.tabs .item').forEach(function(x) {
            scrollWidth += x.offsetWidth;
        });
        
        document.querySelectorAll('.tabs').forEach(function(tabs) {
            tabsWidth = tabs.offsetWidth;
            if (scrollWidth > tabsWidth ) {
                tabs.classList.add('-swipe');
                if (inner !== null && activeItem) {
                    inner.scrollLeft = activeItem.offsetLeft;
                }
                document.querySelectorAll('.tabs.-swipe .inner').forEach(function(insrc){
                    var scWidth = 0;
                    var tabWidth = 0;
                    document.querySelectorAll('.tabs.-swipe .item').forEach(function(x) {
                        scWidth += x.offsetWidth;
                    });
                    
                    document.querySelectorAll('.tabs.-swipe').forEach(function(tabs) {
                        tabWidth = tabs.offsetWidth;
                    });
                    insrc.addEventListener('scroll' ,function() {
                        if (insrc.scrollLeft > 0) {
                            insrc.parentNode.classList.add('-tabscroll');
                            insrc.parentNode.classList.remove('-end');
                        } else {
                            insrc.parentNode.classList.remove('-tabscroll');
                        } if (insrc.scrollLeft >= (scWidth - (tabWidth) - 48)) {
                            insrc.parentNode.classList.add('-end');
                        }
                    });
                });     
            }
        });        

        document.addEventListener('click', function(e) {
            if (e.target.getAttribute('role') === 'tab' && e.target.closest('.tabs')) {

                var target = e.target;
                var tablist = target.parentNode.parentNode;
                var inner = tablist.parentNode;
                var items = tablist.children;
                var idx = [].indexOf.call(items ,target.parentNode);
                var activeItem = tablist.querySelector('.-active');
                var id = target.getAttribute('aria-controls');
                var activePanel = document.querySelector('#'+ id);

                var selected = tablist.querySelector('[role="tab"] .hide');

                activeItem.classList.remove('-active');
                if (selected) selected.remove();
                activeItem.querySelector('button').ariaSelected = false;

                activePanel.parentNode.querySelectorAll('.tabs-panel').forEach(function(tabs) {
                    tabs.tabIndex = -1;
                })

                items[idx].classList.add('-active');
                items[idx].querySelector('button').insertAdjacentHTML('beforeend', '<span class="hide">선택됨</span>')
                items[idx].querySelector('button').ariaSelected = true;

                anime({
                    targets: inner,
                    easing: 'easeOutCirc',
                    duration: 400,
                    scrollLeft: items[idx].offsetLeft
                });

                activePanel.parentNode.querySelector('.tabs-panel.-active').classList.remove('-active');
                activePanel.classList.add('-active');
                activePanel.tabIndex = 0;
                window.scrollTo({top:0});
            }
        });
    }

    function subs() {
        var list = document.querySelector('.subs .list');
        var activeItem = document.querySelector('.subs .-active');

        if (list !== null && activeItem) {
            list.scrollLeft = activeItem.offsetLeft - 24;
        }

        document.addEventListener('click', function(e) {
            if (e.target.getAttribute('role') === 'tab' && e.target.closest('.subs')) {
                var target = e.target;
                var tablist = target.parentNode.parentNode;
                var items = tablist.children;
                var idx = [].indexOf.call(items ,target.parentNode);
                var activeItem = tablist.querySelector('.-active');
                var id = target.getAttribute('aria-controls');
                var activePanel = document.querySelector('#'+ id);

                var selected = tablist.querySelector('[role="tab"] .hide');

                activeItem.classList.remove('-active');
                if (selected) selected.remove();
                activeItem.querySelector('button').ariaSelected = false;

                activePanel.parentNode.querySelectorAll('.subs-panel').forEach(function(tabs) {
                    tabs.tabIndex = -1;
                })

                items[idx].classList.add('-active');
                items[idx].querySelector('button').insertAdjacentHTML('beforeend', '<span class="hide">선택됨</span>')
                items[idx].querySelector('button').ariaSelected = true;
                anime({
                    targets: tablist,
                    easing: 'easeOutCirc',
                    duration: 300,
                    scrollLeft: items[idx].offsetLeft - 24
                });

                activePanel.parentNode.querySelector('.subs-panel.-active').classList.remove('-active');
                activePanel.classList.add('-active');
                activePanel.tabIndex = 0;
                if (target.closest('.subs').classList.contains('-anchor')){
                    return;
                } else {
                    window.scrollTo({top:0});
                }
            }
        });
    }

    function segments() {
        var tabsWidth = 0;
        var scrollWidth = 0;
        var tabLength = document.querySelectorAll('.-tabstyle .item').length - 1
        document.querySelectorAll('.-tabstyle .item').forEach(function(x) {
            scrollWidth += x.clientWidth;
        });

        document.querySelectorAll('.-tabstyle').forEach(function(tabs) {
            tabsWidth = tabs.clientWidth;

            if (scrollWidth > tabsWidth + 4) {
                tabs.classList.add('-swipe');
            }
        });
        setTimeout(function() {
                document.querySelectorAll('.-tabstyle .inner').forEach(function(insrc){
                var scWidth = 0;
                var tabWidth = 0;
                document.querySelectorAll('.-tabstyle .item').forEach(function(x) {
                    scWidth += x.clientWidth;
                });
                
                document.querySelectorAll('.-tabstyle').forEach(function(tabs) {
                    tabWidth = tabs.clientWidth;
                });
                insrc.addEventListener('scroll' ,function() {
                    if (insrc.scrollLeft > 0) {
                        insrc.parentNode.classList.add('-tabscroll');
                        insrc.parentNode.classList.remove('-end');
                    } else {
                        insrc.parentNode.classList.remove('-tabscroll');
                    } if (insrc.scrollLeft == (scWidth - (tabWidth + tabLength))) {
                        insrc.parentNode.classList.add('-end');
                    }
                })
            });
        }, 300);
        
        

        document.addEventListener('click', function(e) {
            if (e.target.getAttribute('role') === 'tab' && e.target.closest('.segments')) {
                var target = e.target;
                var tablist = target.parentNode.parentNode;
                var items = tablist.children;
                var idx = [].indexOf.call(items ,target.parentNode);
                var activeItem = tablist.querySelector('.-active');
                var id = target.getAttribute('aria-controls');
                var activePanel = document.querySelector('#'+ id);
                var selected = tablist.querySelector('[role="tab"] .hide');

                activeItem.classList.remove('-active');
                if (selected) selected.remove();
                activeItem.querySelector('button').ariaSelected = false;

                activePanel.parentNode.querySelectorAll('.segments-panel').forEach(function(tabs) {
                    tabs.tabIndex = -1;
                })

                items[idx].classList.add('-active');
                items[idx].querySelector('button').insertAdjacentHTML('beforeend', '<span class="hide">선택됨</span>')
                items[idx].querySelector('button').ariaSelected = true;
                anime({
                    targets: tablist.parentNode,
                    easing: 'easeOutCirc',
                    duration: 300,
                    scrollLeft: items[idx].offsetLeft
                });

                [].forEach.call(activePanel.parentNode.children, function(item) {if (item.classList.contains('-active')){item.classList.remove('-active')}});
                activePanel.classList.add('-active');
                activePanel.tabIndex = 0;
            }
        });
        
    }

    function tooltip() {
        var close = document.createElement('button');

        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('trigger') === false) return;

            e.stopPropagation();

            var target = e.target;
            var parent = target.parentNode;
            var panel = parent.querySelector('.panel');
            var tooltips = document.querySelectorAll('.tooltip');
            var isOpen = parent.classList.contains('-active');


            var root = target.closest('.container').parentNode;
            var rootID = root.id;

            var isPage = root.classList.contains('page');
            var isPopup = root.classList.contains('popup');
            var isLayer = root.classList.contains('layer');
            var isAlert = root.classList.contains('alert');

            var fixerHeight = root.querySelector('.fixer') !== null ? parseInt(window.getComputedStyle(root.querySelector('.fixer')).height) : parseInt(window.getComputedStyle(root.querySelector('.content')).paddingBottom);
            var bufferOffsetTop = root.querySelector('.buffer') !== null ? root.querySelector('.buffer').offsetTop : 0;
            var bufferMarginTop = root.querySelector('.buffer') !== null ? parseInt(window.getComputedStyle(root.querySelector('.buffer')).height) : 0;
            var stickerMarginTop = root.querySelector('.sticker') !== null ? parseInt(window.getComputedStyle(root.querySelector('.sticker')).marginTop) : 0;

            var comparePageHeight = document.documentElement.scrollHeight - (e.pageY - e.offsetY) - fixerHeight;
            var halfCompareHeight = Math.floor((document.documentElement.scrollHeight - parseInt(window.getComputedStyle(root).height)) / 2);
            var alertCompareHeight = document.documentElement.scrollHeight - (e.pageY - e.offsetY) - halfCompareHeight - fixerHeight;

            var compareBufferHeight = isPage ? Math.abs(document.documentElement.scrollHeight - bufferOffsetTop - bufferMarginTop - stickerMarginTop) : 0;

            if (!isOpen) {
                var gutter = isAlert ? 48 : 24;

                anime({
                    targets: panel,
                    easing: 'easeOutCirc',
                    duration: 200,
                    opacity: [.4, 1],
                    translateY: ['-1.2rem', 0],
                    begin: function() {
                        if (isLayer) {
                            if (parseInt(window.getComputedStyle(root).height) >= window.innerHeight - 60) {
                                if (e.clientY > parseInt(document.documentElement.clientHeight - (document.documentElement.clientHeight / 2.8))) parent.classList.add('-reversed');
                            }
                        } else {
                            if (e.clientY > parseInt(document.documentElement.clientHeight - (document.documentElement.clientHeight / 2.8))) parent.classList.add('-reversed');
                        }

                        tooltips.forEach(function(tooltip) {tooltip.classList.remove('-active')})
                        parent.classList.add('-active');
                        panel.style.left = (e.pageX - e.offsetX - gutter) * -1 + 'px';
                        panel.style.width = 'calc(100vw - '+ (gutter / 10) * 2 + 'rem)';

                        close.type = 'button';
                        close.classList.add('close');
                        close.innerHTML = '<span class="hide">닫기</span>';
                        panel.append(close);

                        var panelTop = Math.floor(parseFloat(window.getComputedStyle(panel).top));
                        var targetHeight = Math.floor(parseFloat(window.getComputedStyle(target).height));
                        var tooltipHeight = Math.floor(parseFloat(window.getComputedStyle(panel).height));
                        var tooltipTotalHeight = tooltipHeight + panelTop + targetHeight + compareBufferHeight;
                        var heightProfit = Math.abs(comparePageHeight - tooltipTotalHeight);
                        var alertHeightProfit = Math.abs(alertCompareHeight - tooltipTotalHeight);

                        function pageBuffer() {
                            if (tooltipTotalHeight >= comparePageHeight) {
                                buffer.add(heightProfit);
                            }
                        }

                        function popupLayerBuffer() {
                            if (isPopup && tooltipTotalHeight >= comparePageHeight) {
                                window[root.id].buffer.add(heightProfit)
                            }

                            if (isLayer && tooltipTotalHeight >= comparePageHeight) {
                                layer.buffer.add(heightProfit);
                            }
                        }

                        function alertBuffer() {
                            if (tooltipHeight >= alertCompareHeight) {
                                alert.buffer.add(alertHeightProfit);
                            }
                        }

                        if (isPage) {
                            pageBuffer();
                        } else {
                            if (isLayer || isPopup) {
                                popupLayerBuffer();
                            }

                            if (isAlert) {
                                alertBuffer();
                            }
                        }

                        close.addEventListener('click', function(event) {
                            event.stopPropagation();
                            event.target.closest('.tooltip').querySelector('.trigger').click();
                        }, true);
                    }
                });
            } else {
                anime({
                    targets: panel,
                    easing: 'easeOutCirc',
                    duration: 0,
                    opacity: [1, 0],
                    complete: function() {
                        parent.classList.remove('-active');
                        parent.classList.remove('-reversed');
                        panel.removeAttribute('style');
                        close.remove();
                    }
                });

                function pageBufferRevert() {
                    if (buffer.isEdited == true) {
                        buffer.revert();
                    };
                };

                function popupLayerBufferRevert() {
                    if (isPopup && window[root.id].buffer.isEdited == true) {
                        window[root.id].buffer.revert();
                    };

                    if (isLayer && layer.buffer.isEdited == true) {
                        layer.buffer.revert();
                    };
                };

                function alertBufferRevert() {
                    if (isAlert && alert.buffer.isEdited == true) {
                        alert.buffer.revert();
                    };
                };

                if (isPage) {
                    pageBufferRevert();
                } else {
                    if (isLayer || isPopup) {
                        popupLayerBufferRevert();
                    };

                    if (isAlert) {
                        alertBufferRevert();
                    };
                };
            };
        }, true);
    }

    /* 검증,운영버전이랑 내용 다르니 반드시 교체하고 이행할것 */
    function inIframe() {
        if(!window.location.host) {
            if (window) {
                if (window.document.querySelector('body')) {
                    if (window.document.querySelector('body').classList.contains('dark-mode') === true) {
                        document.querySelector('body').classList.add('dark-mode');
                    }
                }
            }
        } else {
            if (window.parent) {
                if (window.parent.document.querySelector('body')) {
                    if (window.parent.document.querySelector('body').classList.contains('dark-mode') === true) {
                        document.querySelector('body').classList.add('dark-mode');
                    }
                }
            }
        }
    }
    /* // */

    function fold() {
        document.addEventListener('click', function(e) {
            if (!e.target.closest('[data-role="fold"] [data-role="marker"]')) return;

            var target = e.target;
            var fold = target.closest('[data-role="fold"]');
            var more = target.closest('.more');
            var isOpen = fold.classList.contains('-active');
            var isBox = fold.classList.contains('-box' && 'dls');
            var foldSize;
            var unfoldSize;
            var contentsScrollTop = e.target.closest('.contents').scrollTop;
            var documentScrollTop = document.documentElement.scrollTop;
            
            
            if (!isOpen) {
                foldSize = fold.offsetHeight;

                fold.classList.add('-slidedown');

                unfoldSize = fold.offsetHeight;

                var hiddenItems = fold.querySelectorAll('[data-role="hidden"]');
                var duration = 200;
                var delay = 10;
                if (isBox) {
                    more.innerHTML = '접기';
                } 

                anime({
                    targets: hiddenItems,
                    easing: 'linear',
                    duration: duration,
                    delay: anime.stagger(delay),
                    opacity: [0, 1],
                    complete: function() {
                        hiddenItems.forEach(function(item) {
                            item.removeAttribute('style');
                        });
                    }
                });

                anime({
                    targets: fold,
                    easing: 'linear',
                    duration: duration + (delay * hiddenItems.length) - delay,
                    height: [foldSize, unfoldSize],
                    complete: function() {
                        fold.classList.remove('-slidedown')
                        fold.classList.add('-active')
                        fold.removeAttribute('style');

                        isClose = false;
                    }
                });

                if (fold.classList.contains('notice')) {
                    anime({
                        targets: document.querySelector('.popup') ? e.target.closest('.contents') : document.documentElement,
                        easing: 'linear',
                        duration: duration,
                        scrollTop: document.querySelector('.popup') ? contentsScrollTop + 400 : documentScrollTop + 400,
                    });
                };

            } else {
                var hiddenItems = fold.querySelectorAll('[data-role="hidden"]');
                var duration = 150;
                var delay = 0;

                if (!foldSize) {
                    fold.classList.remove('-active');
                    foldSize = fold.offsetHeight;
                    fold.classList.add('-active');
                }

                unfoldSize = fold.offsetHeight;

                fold.classList.remove('-active')
                fold.classList.add('-slideup');

                if (isBox) {
                    more.innerHTML = '펼치기';
                } 

                anime({
                    targets: hiddenItems,
                    easing: 'linear',
                    height: {
                        value: 0,
                        duration: duration
                    },
                    opacity: {
                        value: 0,
                        duration: duration / 2
                    },
                    delay: anime.stagger(delay, {direction: 'reverse'}),
                });

                anime({
                    targets: fold,
                    easing: 'linear',
                    duration: duration + (delay * hiddenItems.length) - delay,
                    height: [unfoldSize, foldSize],
                    complete: function() {
                        fold.classList.remove('-slideup')
                        fold.removeAttribute('style');

                        hiddenItems.forEach(function(item) {
                            item.removeAttribute('style');
                        });

                        isClose = true;
                    }
                });

                if (fold.classList.contains('notice')) {
                    anime({
                        targets: document.querySelector('.popup') ? e.target.closest('.contents') : document.documentElement,
                        easing: 'linear',
                        duration: duration,
                        scrollTop: document.querySelector('.popup') ? [contentsScrollTop, contentsScrollTop] : [documentScrollTop, documentScrollTop]
                    });
                };
            }
        });
    }

    function a11y() {
        document.querySelectorAll('[role="tablist"] .item.-active button').forEach(function(tab) {
            if (!tab.querySelector('.hide')) {
                tab.insertAdjacentHTML('beforeend', '<span class="hide">선택됨</span>');
            }

            tab.ariaSelected = true;
        });

        document.querySelectorAll('[aria-controls]').forEach(function(tab) {
            var id = tab.getAttribute('aria-controls');
            var activePanel = document.querySelector('#'+ id);

            if (activePanel) {
                if (activePanel.classList.contains('-active')) { activePanel.tabIndex = 0; }
                if (!activePanel.classList.contains('-active')) { activePanel.tabIndex = -1; }
            }
        });

        document.querySelectorAll('hr').forEach(function(hr) {
            if (hr) {
                hr.ariaHidden = true;
                hr.tabIndex = '-1';
            }
        });

        document.querySelectorAll('.visual-box img').forEach(function(image) {
            if (image) {
                if (image.alt === '') {
                    image.ariaHidden = true;
                    image.tabIndex = '-1';
                }
            }
        });

        document.querySelectorAll('.filter-bar button').forEach(function(filterBar) {
            if (filterBar) {
                filterBar.insertAdjacentHTML('afterbegin', '<span class="hide">조건 검색하기,</span>');
            }
        });
    }

    function initTextfield() {
        document.querySelectorAll('.text input, .textarea textarea').forEach(function(textfield) {
            var id = textfield.id || textfield.dataset.id;
            var label = document.querySelector('label[for="'+ id +'"]');

            if (textfield.readOnly === true) {
                if (label) {label.classList.add('-readonly');}
                textfield.parentNode.classList.add('-readonly');
            }
            if (textfield.disabled === true) {
                if (label) {label.classList.add('-disabled');}
                textfield.parentNode.classList.add('-disabled');
            }

            if (textfield.value.length === 0) {
                if (label) {label.classList.add('-textless');}
                textfield.parentNode.classList.add('-textless');
            }

            if (textfield.classList.contains('right') || textfield.classList.contains('left-right')) {
                textfield.parentNode.classList.add('-unit');
            }
        });
        document.querySelectorAll('.icon-button.-calendar').forEach(function(calendar_warp) {
            if (calendar_warp.disabled === true) {
                calendar_warp.parentNode.classList.add('-disabled');
            }
        });
    }

    function textfield() {
        document.addEventListener('input', function(e) {
            if ((e.target.parentNode.classList.contains('text') || e.target.parentNode.classList.contains('textarea')) === false) return;

            var target = e.target;
            var id = target.id || target.dataset.id;
            var links = document.querySelectorAll('#'+ id +', [data-id="'+ id +'"]');
            var label = document.querySelector('label[for="'+ id +'"]');
            var isTextless = [].slice.call(links).every(function(item) {return item.value.length !== 0});

            if (label) {
                if (isTextless === true)  {label.classList.remove('-textless');}
                if (isTextless === false) {label.classList.add('-textless');}
            }

            if (target.value.length !== 0) {
                target.parentNode.classList.remove('-textless');

                if (target.parentNode.querySelector('.clear')) {
                    target.parentNode.querySelector('.clear').style.zIndex = 1;
                }
            }

            if (target.value.length === 0) {
                target.parentNode.classList.add('-textless');
            }
        });

        document.addEventListener('focusin', function(e) {
            if ((e.target.parentNode.classList.contains('text') || e.target.parentNode.classList.contains('textarea') ) === false) return;

            var target = e.target;
            var id = target.id || target.dataset.id;
            var label = document.querySelector('[for="'+ id +'"]');
            var isClear = target.parentNode.dataset.clear ? false: true;
            var isReadonly = target.readOnly;
            var numCall = e.target.classList.contains('num-call');
            var root = target.closest('.container').parentNode;
            var rootID = root.id;
            var contents = root.querySelector('.contents');
            var fixer = [].filter.call(contents.children, function(x) { return x.classList.contains('fixer');})[0];
            var isPage = root.classList.contains('page');
            var isPopup = root.classList.contains('popup');
            var isLayer = root.classList.contains('layer');
            var isAlert = root.classList.contains('alert');

            if (label) {label.classList.add('-focused');}

            target.parentNode.classList.add('-focused');
            target.parentNode.parentNode.classList.add('-focused');
            

            if (isClear && !target.parentNode.querySelector('.clear') && !isReadonly && !numCall) {
                var clear = document.createElement('button');
                clear.classList.add('clear');
                clear.type = 'button';
                clear.innerHTML = '<div class="hide">입력 내용 삭제</div>';
                clear.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var target = e.target;

                    target.parentNode.classList.add('-textless');
                    target.parentNode.querySelectorAll('input, textarea')[0].value = null;
                    target.parentNode.querySelectorAll('input, textarea')[0].focus();

                    if (label) {label.classList.add('-textless')}
                    if (target.parentNode.querySelector('.text-count .count')) {
                        target.parentNode.querySelector('.text-count .count').innerText = 0;
                    }
                });

                target.parentNode.append(clear);
            }

            if (target.parentNode.querySelector('.clear')) {
                target.parentNode.querySelector('.clear').style.zIndex = 1;
            }

            if (!isReadonly) {
                if (fixer) {
                    if (isPage) {
                        setTimeout(function() {
                            // if (root.scrollHeight > root.offsetHeight) {
                                fixer.classList.add('position-static');
                                buffer.set(0);
                            /* } 
                            else {
                                // fixer.classList.add('position-absolute');
                            } */
                        }, 200);
                    }

                    if (isPopup) {
                        setTimeout(function() {
                            if (contents.scrollHeight > contents.offsetHeight) {
                                fixer.classList.add('position-static');
                                window[rootID].buffer.set(0);
                            } else {
                                // fixer.classList.add('position-absolute');
                            }
                        }, 200);
                    }

                    if (isLayer) {
                        fixer.classList.add('position-static');
                        window[rootID].buffer.set(0);
                    }

                    if (isAlert) {
                        fixer.classList.add('position-static');
                        window[rootID].buffer.set(0);
                    }
                }
            }
        });

        document.addEventListener('focusout', function(e) {
            if ((e.target.parentNode.classList.contains('text') || e.target.parentNode.classList.contains('textarea')) === false) return;

            var target = e.target;
            var id = target.id || target.dataset.id;
            var label = document.querySelector('[for="'+ id +'"]');
            var isReadonly = target.readOnly;
            var root = target.closest('.container').parentNode;
            var rootID = root.id;
            var contents = root.querySelector('.contents');
            var fixer = [].filter.call(contents.children, function(x) { return x.classList.contains('fixer'); })[0];
            var isPage = root.classList.contains('page');
            var isPopup = root.classList.contains('popup');
            var isLayer = root.classList.contains('layer');
            var isAlert = root.classList.contains('alert');

            if (label) {label.classList.remove('-focused');}

            target.parentNode.classList.remove('-focused');
            target.parentNode.parentNode.classList.remove('-focused');
            

            if (target.parentNode.querySelector('.clear')) {
                setTimeout(function() {
                    target.parentNode.querySelector('.clear').style.zIndex = -1;
                }, 100)
            }

            if (!isReadonly) {
                if (fixer) {
                    if (isPage) {
                        setTimeout(function() {
                            // if (root.scrollHeight > root.offsetHeight) {
                                fixer.classList.remove('position-static');
                                buffer.revert();
                            /* } else {
                                // fixer.classList.remove('position-absolute');
                            } */
                        }, 200)
                    }

                    if (isPopup) {
                        setTimeout(function() {
                            if (contents.scrollHeight > contents.offsetHeight) {
                                fixer.classList.remove('position-static');
                                window[rootID].buffer.revert();
                            } else {
                                // fixer.classList.remove('position-absolute');
                            }
                        }, 200)
                    }

                    if (isLayer) {
                        fixer.classList.remove('position-static');
                        window[rootID].buffer.revert();
                    }

                    if (isAlert) {
                        fixer.classList.remove('position-static');
                        window[rootID].buffer.revert();
                    }
                }
            }
        });

        document.addEventListener('click', function(e) {
            if ((e.target.parentNode.classList.contains('text') || e.target.parentNode.classList.contains('textarea')) === false) return;
            if (e.target.readOnly || e.target.disabled) return;
            if (e.target.parentNode.dataset.scroll === 'false') return;

            var target = e.target;
            var targetID = target.id || target.dataset.id;
            var root = target.closest('.container').parentNode;
            var rootID = root.id;
            var contents = root.querySelector('.contents');
            var content = root.querySelector('.content');
            var label = document.querySelector('[for="'+ targetID +'"]');
            var targetOffset = label ? label.getBoundingClientRect().top : target.getBoundingClientRect().top;
            var targetScrollTop;
            var scrollTarget;
            // console.log(opa.exeStatus)
            var uaClass = opa.exeStatus;
            // console.log(opa.exeStatus, uaClass)
            if (uaClass !== 5) {
                setTimeout( function() {
                    if (root.classList.contains('page'))  {
                        scrollTarget = document.documentElement;
                        targetScrollTop = scrollTarget.scrollTop + targetOffset - information.upperHeight;
                    } else {
                        scrollTarget = contents;
                        targetScrollTop = scrollTarget.scrollTop + targetOffset - window[rootID].information.upperHeight;
                    } 
                    anime({
                        targets: scrollTarget,
                        duration: 100,
                        easing: 'linear',
                        scrollTop: targetScrollTop
                    });
                    // console.log('focus-delay Aos')
                }, 1);
            }else{
                // console.log('focus-delay Ios')
            }
        });
    }

    function header() {
        var roots = document.querySelectorAll('.page, .popup');

        if (roots) {
            roots.forEach(function(root) {
                var container = root.children[0];
                var header = container.querySelector('.header');

                if (header) {
                    var isTitle = header.querySelector('.title') ? true : false;
                    var isTitleShow = isTitle && header.querySelector('.title').querySelector('.hide') ? true : false;
                    var hasFunc = header.querySelectorAll('.func').length > 0 ? true : false;

                    if (isTitleShow && !hasFunc) {
                        root.classList.add('-transparent');
                    }
                } else {
                    root.classList.add('-no-header');
                }
            });
        }
    }

    /* --- */

    function init() {
        window['stack'] = new Stack();

        if (document.querySelector('.page')) {
            window['buffer'] = new Buffer('.page');
            window['information'] = new Information('.page');
        }

        inIframe();
        clickable();
        header();
        tabs();
        subs();
        segments();
        tooltip();
        fold();
        initTextfield();
        textfield();
        a11y();
    }

    function Information(selector) {
        if (document.querySelector(selector) == (null || undefined)) return;

        var target = document.querySelector(selector);
        var header = target.querySelector('.header');
        var tabs = target.querySelector('.tabs');
        var subs = target.querySelector('.subs');
        var pgt = target.querySelector('.progress-top');
        var cpt = target.querySelector('.compare-wrap');
        var fix = target.querySelector('[data-role="fix"]');
        var content = target.querySelector('.content');
        var headerHeight = header ? header.getBoundingClientRect().height : 0;
        var pgtHeight = pgt ? pgt.getBoundingClientRect().height : 0;
        var cptHeight = cpt ? cpt.getBoundingClientRect().height + 20 : 0 ;
        var tabsHeight = tabs ? tabs.getBoundingClientRect().height : 0;
        var subsHeight = subs ? subs.getBoundingClientRect().height : 0;
        var fixHeight = fix ? fix.getBoundingClientRect().height : 0;
        var contentPaddingTop = content ? parseInt(window.getComputedStyle(content).paddingTop): 0;
        var upperHeight;
        var obj = {};

        if (target.classList.contains('page')) {
            upperHeight = headerHeight + tabsHeight + subsHeight + contentPaddingTop + fixHeight + pgtHeight + cptHeight;
        }

        if (target.classList.contains('popup')) {
            upperHeight = headerHeight + tabsHeight + contentPaddingTop + fixHeight + cptHeight;
        }

        if (target.classList.contains('layer')) {
            upperHeight = headerHeight + tabsHeight + contentPaddingTop + 54;
        }

        if (target.classList.contains('alert')) {
            upperHeight = headerHeight + contentPaddingTop + ((window.innerHeight - target.getBoundingClientRect().height) / 2);
        }

        Object.defineProperties(obj, {
            header: {
                get: function() {
                    return header;
                }
            },
            tabs: {
                get: function() {
                    return tabs;
                }
            },
            subs: {
                get: function() {
                    return subs;
                }
            },
            content: {
                get: function() {
                    return content;
                }
            },
            headerHeight: {
                get: function() {
                    return headerHeight;
                }
            },
            tabsHeight: {
                get: function() {
                    return tabsHeight;
                }
            },
            subsHeight: {
                get: function() {
                    return subsHeight;
                }
            },
            contentPaddingTop: {
                get: function() {
                    return contentPaddingTop;
                }
            },
            upperHeight: {
                get: function() {
                    return upperHeight;
                }
            }
        });

        return obj;
    }

    function Buffer(selector) {
        if (document.querySelector(selector) == (null || undefined)) return;

        var target = document.querySelector(selector);
        var contents = target.querySelector('.contents');
        var fixer = [].filter.call(contents.children, function(x) { return x.classList.contains('fixer'); })[0];
        var isFixer = (fixer) ? true: false;
        var bufferSize = (typeof size == 'number') ? size : 0;
        var history = 0;
        var isEdited = false;
        var obj = {};
        var bufferEl = document.createElement('div');

        function init() {
            if (target.classList.contains('main')) return;
            if (isFixer) {bufferSize += fixer.offsetHeight;}
            bufferEl.classList.add('buffer');
            bufferEl.setAttribute('style', 'height:'+ bufferSize + 'px');
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
            /* tooltip buffer add issue */
            setAddSize(bufferSize);
        }

        function revert() {
            bufferSize = history;
            setSize(bufferSize);
        }

        function setSize(size) {
            target.querySelector('.buffer').setAttribute('style', 'height: '+ size +'px');
        }

        function setAddSize(size) {
            target.querySelector('.buffer').setAttribute('style', 'height: '+ (size + 100) +'px !important');
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

    function Scroll() {
        var body = document.body;
        var history = 0;

        return {
            save: function() {
                history = (window.hasScrollSave) ? getComputedStyle(body).marginTop.replace(/[^0-9]/g, '') : window.scrollY;

                if (!window.hasScrollSave) {
                    body.classList.add('lock');
                    body.style.marginTop = (history * -1) +'px';
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

    function Dim() {
        var dim = document.createElement('div');

        dim.classList.add('dim');

        return {
            open: function(id, isPLA) {
                var zIndex = stack.push();

                dim.dataset.id = id.slice(1);

                if (isPLA) {
                    document.querySelector(id).insertAdjacentElement('beforebegin', dim);
                } else {
                    document.body.append(dim);
                }

                // 20231206 이원익 추가
                if (document.querySelector(id).classList.contains('dimWhiteLayer')) {
                    dim.classList.add('dimWhite');
                }
                // 20231206 이원익

                dim.style.zIndex = zIndex;

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
            },

            show: function() {
                dim.classList.add('-active');
            },

            hide: function() {
                dim.classList.remove('-active');
            }
        }
    }

    function stackPLAA11y(id) {
        var page = document.querySelector('.page') || document.querySelector('.main');
        var PLA = document.querySelector(id);

        if (PLA) {
            PLA.tabIndex = 0;
            PLA.focus();
            PLA.removeAttribute('aria-hidden');
        }

        if (stack.print.length === 0) {
            stack.set(page);
        }

		if (page) {
			page.tabIndex = -1;
        	page.ariaHidden = true;
		}

        stack.print.forEach(function(pla) {
			if (pla) {
	            pla.tabIndex = -1;
	            pla.ariaHidden = true;
            }
        });
    }

    function queuePLAA11y() {
        var PLA = stack.print;

        if (PLA.length > 2) {
            PLA[PLA.length - 1].removeAttribute('tabindex');
            PLA[PLA.length - 1].removeAttribute('aria-hidden');
            PLA[PLA.length - 2].tabIndex = 0;
            PLA[PLA.length - 2].removeAttribute('aria-hidden');
        }

        if (PLA.length <= 2) {
            PLA.forEach(function(pla) {
                if (pla) { pla.removeAttribute('aria-hidden'); }
            });

            PLA.forEach(function(pla) {
                if (pla) { pla.removeAttribute('tabindex'); }
            });
        }
    }

    function Popup(id) {
        var popup = document.querySelector(id);
        var isReinit = false;
        var information;
        var scroll = new Scroll();
        var popupBuffer;
        var isActive = false;
        var obj = {};

        function open(callback) {
            stackPLAA11y(id);

            var zIndex = stack.push(popup);

            scroll.save();
            popup.classList.add('-active');
            popup.style.zIndex = zIndex;

            information = new Information(id);
            popupBuffer = new Buffer(id);

            if (!isReinit) {
                initTextfield();
                a11y();

                isReinit = true;
            }

            if (callback instanceof Function) { callback(); }

            isActive = true;

            //segments 감지
            var tabsWidth = 0;
            var scrollWidth = 0;
            document.querySelectorAll('.-tabstyle .item').forEach(function(x) {
                scrollWidth += x.clientWidth;
            });

            document.querySelectorAll('.-tabstyle').forEach(function(tabs) {
                tabsWidth = tabs.clientWidth;

                if (scrollWidth > tabsWidth + 42) {
                    tabs.classList.add('-swipe');
                }
            });
        }

        function close(callback, isRemove) {
            queuePLAA11y(id);
            stack.pop(popup);
            scroll.load();

            popup.classList.remove('-active');
            popup.removeAttribute('style');
            popupBuffer.remove();

            if (isRemove) { popup.remove(); }
            if (callback instanceof Function) { callback(); }

            isActive = false;
        }

        Object.defineProperties(obj, {
            open: { value: open },
            close: { value: close },
            isOpen: {
                get: function() {
                    return isActive;
                }
            },
            information: {
                get: function() {
                    return information;
                }
            },
            buffer: {
                get: function() {
                    return popupBuffer;
                }
            }
        });

        return obj;
    }

    function Layer(id) {
        var layer = document.querySelector(id);
        var isReinit = false;
        var information;
        var scroll = new Scroll();
        var dim = new Dim();
        var layerBuffer;
        var isActive = false;
        var obj = {};

        // 공통 셀렉트 리스트 active

        var selact = $(layer).find(".options li");
        var selheight = $(selact).height();
        var selindex = $(layer).find(".options li").children('.-active').parent('li').index();
        $(layer).find(".contents").animate({scrollTop:(selindex-1) * selheight + 56 }, 0);
        
        // 공통 시간 선택

        var selld1 = $('.datepicker-widget .year').find('.on').index();
        var selld2 = $('.datepicker-widget .month').find('.on').index();
        var selld3 = $('.datepicker-widget .day').find('.on').index();
        var selld4 = $('.datepicker-widget .time').find('.on').index();
        var selld5 = $('.datepicker-widget .minute').find('.on').index();
        $('.datepicker-widget .year').animate({scrollTop:(selld1)*56},0);
        $('.datepicker-widget .month').animate({scrollTop:(selld2)*56},0);
        $('.datepicker-widget .day').animate({scrollTop:(selld3)*56},0);
        $('.datepicker-widget .time').animate({scrollTop:(selld4)*56},0);
        $('.datepicker-widget .minute').animate({scrollTop:(selld5)*56},0);

        // 공통 이체주기 선택
        $('.datepicker-widget ul').find('li').click(function(){
            $(this).addClass('on');
            $(this).siblings().removeClass('on');
            var selldIdx = $(this).index();
            if ($(this).parent().hasClass('cycle')) {
                var onSelecter = $('.cycle-list ul').eq(selldIdx).find('.on').index();
                $('.cycle-list ul').eq(selldIdx).show().siblings().hide();
                $('.cycle-list ul').eq(selldIdx).siblings().children('li').removeClass('on');
                $('.cycle-list ul').eq(selldIdx).animate({scrollTop:(onSelecter)*56},0);
            }
        });
        
        $('.datepicker-widget .cycle').find('.on').click();
        


        function open(callback) {
            scroll.save();            
            new Promise(function(resolve, reject) {
                setTimeout(resolve);
            }).then(setTimeout(function(){
                dim.open(id, true);
            })).then(setTimeout(function(){
                stackPLAA11y(id);
                layer.classList.add('-active');
                layer.style.zIndex = stack.push(layer);

                information = new Information(id);
                layerBuffer = new Buffer(id);

                if (!isReinit) {
                    initTextfield();
                    a11y();

                    isReinit = true;
                }

                if (callback instanceof Function) { callback(); }

                isActive = true;
            }));
        };

        function close(callback, isRemove) {
            scroll.load();

            new Promise(function(resolve, reject) {
                setTimeout(resolve);
            }).then(setTimeout(function(){
                layer.classList.remove('-active');
                layer.removeAttribute('style');

                if (isRemove) {
                    setTimeout(function() {
                        layer.remove();
                    }, 400);
                }
                if (callback instanceof Function) { callback(); }

                queuePLAA11y(id);
                stack.pop(layer);
            })).then(setTimeout(function(){
                layerBuffer.remove();
            }, 400)).then(setTimeout(function(){
                dim.close();

                isActive = false;
            }));
        };

        Object.defineProperties(obj, {
            open: { value: open },
            close: { value: close },
            isOpen: {
                get: function() {
                    return isActive;
                }
            },
            information: {
                get: function() {
                    return information;
                }
            },
            buffer: {
                get: function() {
                    return layerBuffer;
                }
            }
        });

        return obj;
    }

    function Alert(id) {
        var alert = document.querySelector(id);
        var isReinit = false;
        var information;
        var scroll = new Scroll();
        var dim = new Dim();
        var alertBuffer;
        var isActive = false;
        var obj = {};

        function open(callback) {
            scroll.save();

            new Promise(function(resolve, reject) {
                setTimeout(resolve);
            }).then(setTimeout(function(){
                dim.open(id, true);
            })).then(setTimeout(function(){
                stackPLAA11y(id);
                alert.classList.add('-active')
                alert.style.zIndex = stack.push(alert);

                information = new Information(id);
                alertBuffer = new Buffer(id);

                if (!isReinit) {
                    initTextfield();
                    a11y();

                    isReinit = true;
                }

                if (callback instanceof Function) { callback(); }

                isActive = true;
            }));
        }

        function close(callback, isRemove) {
            scroll.load();

            new Promise(function(resolve, reject) {
                setTimeout(resolve);
            }).then(setTimeout(function(){
                alert.classList.remove('-active');
                alert.removeAttribute('style');

                if (isRemove) {
                    setTimeout(function() {
                        alert.remove();
                    }, 400);
                }
                if (callback instanceof Function) { callback(); }

                queuePLAA11y(id);
                stack.pop(alert);
            })).then(setTimeout(function(){
                alertBuffer.remove();
            }, 400)).then(setTimeout(function(){
                dim.close();

                isActive = false;
            }));
        };

        Object.defineProperties(obj, {
            open: { value: open },
            close: { value: close },
            isOpen: {
                get: function() {
                    return isActive;
                }
            },
            information: {
                get: function() {
                    return information;
                }
            },
            buffer: {
                get: function() {
                    return alertBuffer;
                }
            }
        });

        return obj;
    }

    return {
        init: init,
        throttle: throttle,
        Buffer: Buffer,
        Stack: Stack,
        Scroll: Scroll,
        Dim: Dim,
        Popup: Popup,
        Layer: Layer,
        Alert: Alert,
        tabs: tabs
    };
}());

UI.init();

var Popup = PLA(UI.Popup);
var Layer = PLA(UI.Layer);
var Alert = PLA(UI.Alert);

function PLA(type) {
    return {
        open: function(id, callback) {
            window[id] = new type('#'+ id);

            window[id].open(callback);
        },

        close: function(id, callback, isRemove) {
            window[id].close(callback, isRemove);
        },
    }
}

/* ======================================================================================================================= */


/* 토스트 팝업 */
$(document).ready(function(){
    $('.toast').hasClass('-active');
    setTimeout(function(){
        $('.toast').removeClass('-active');
    },3000);
});

/* 레이아웃 대응 */
$('.progress-top').closest('.content').addClass('progress-layout');
$('.sticker').siblings('.content').addClass('sticker-layout');

/* 인기검색어 UI fade처리 */
function overX() {
    var inner = document.querySelectorAll('.over-x')
    inner.forEach(function(insrc){
        insrc.parentNode.classList.add('scrolling-wrap')
        insrc.addEventListener('scroll' ,function() {
            if (insrc.scrollLeft > 0) {
                insrc.parentNode.classList.add('-scrolling')
            } else {
                insrc.parentNode.classList.remove('-scrolling')
            }
        })
    })
};

 /* 년월일 선택 */
 var selld1 = $('.roll-widget').find('.year-pick').find('.on').index();
 var selld2 = $('.roll-widget').find('.month-pick').find('.on').index();
 var selld3 = $('.roll-widget').find('.day-pick').find('.on').index();
 $('.roll-widget').find('.year-pick').animate({scrollTop:(selld1-1)*56}, 0);
 $('.roll-widget').find('.month-pick').animate({scrollTop:(selld2-1)*56}, 0);
 $('.roll-widget').find('.day-pick').animate({scrollTop:(selld3-1)*56}, 0);
 var scrollEndEvntTimerId;
 function visibleEvnt(){
     var el = this;
     var items = $(el).find('li').not(':first-child, :last-child');
     var idx = Math.round($(el).scrollTop() / 56);
    // 삭제(250313)
    // items.eq(idx).addClass('on').siblings().removeClass('on');
    // 선택된 항목 aria-selected (250313추가)
    items.eq(idx).addClass('on').attr('aria-selected', 'true').siblings().removeClass('on').attr('aria-selected', 'false');

     //scroll end event capture
     clearTimeout(scrollEndEvntTimerId);
     scrollEndEvntTimerId = setTimeout(function(){
         $('.roll-widget > ul').off('scroll',visibleEvnt);
         $(el).stop().animate({scrollTop:idx *56},{
             duration:100,
             step:function(now, fx){
                 if (fx.pos == 1){
                     $(this).scrollTop((idx *56) - 3);
                     setTimeout(function(){
                         $('.roll-widget > ul').on('scroll',visibleEvnt);
                     },0)
                 }
             }
         });
     },300);
 };

 setTimeout(function(){
     $('.roll-widget > ul').on('scroll',visibleEvnt)
 },0);

/* 이원익 스크립트 시작 */
/* 계좌 직접입력 */
var chooseBtn = document.querySelectorAll('.jsChooseBtn');
chooseBtn.forEach(function (chooseBtn) {
    chooseBtn.addEventListener('click',function name(params) {
        var chooseBtnWrap =  chooseBtn.closest('.choose-account-Wrap');
        chooseBtnWrap.classList.toggle('-inputed');
        if (chooseBtnWrap.classList.contains('-inputed')) {
            chooseBtn.classList.remove('-sm','-inline');
            chooseBtn.classList.add('-xs','-fit');
            chooseBtn.innerText = '입력 취소';
        } else {
            chooseBtn.classList.remove('-xs','-fit');
            chooseBtn.classList.add('-sm','-inline');                                            
            chooseBtn.innerText = '직접 입력';
        }
    })
});
/* //계좌 직접입력 */

// 키패드 레이어 임시 빈값
var numKey = {
    textActive : null,
    mixActive : null,
    arrActive : null,
    numInput : null,
    keyOpen : function () {},
    keyClose : function() {}
}

/* 설문 상단 fixed */
var fixHeading = document.querySelectorAll('.heading-fix-type');
fixHeading.forEach(function(fixHeading) {
    var fixHeadingBuffer = fixHeading.querySelector('.-fix-heading').getBoundingClientRect().height;
    fixHeading.style.height = fixHeadingBuffer + 'px';
});

/* 설문 보험 인터렉션 CASE */
function jsSrveyInsureNext(e) {
    var $this = e;
    var $thisField = $this.closest('.field');
    var $jsSrveyWrap = $this.closest('.jsSrveyInsure');
    var $nextField = $this.closest('.field').nextElementSibling;
    if (!$thisField.classList.contains('jsSrveyCheck')) {
        if ($nextField !== null) {
            $thisField.classList.remove('jsSrveyCurrent');
            $thisField.classList.add('jsSrveyCheck')
            $nextField.classList.add('jsSrveyCurrent');
        }else{
            if ($jsSrveyWrap.classList.contains('-noneView')) {
                $thisField.classList.add('jsSrveyCheck')
            }else{
                $jsSrveyWrap.classList.add('-checkAll')
                $thisField.classList.remove('jsSrveyCurrent');
                $thisField.classList.add('jsSrveyCheck')
            }
        }
    }
}


/* 설문  */
function jsSrveyNext(e) {
    var $this = e;
    var $thisField = $this.closest('.field');
    var $jsSrveyWrap = $this.closest('.jsSrveyWrap');
    var $nextField = $this.closest('.field').nextElementSibling;
    var scrollTarget ;
    var scrollTargetTop = 0;
    if ($this.closest('.popup') == null) {
        // scrollTarget = window;
        scrollTarget = document.documentElement;
        scrollTargetTop = window.scrollY;
    }else{
        scrollTarget = $this.closest('.popup.-active .contents');
        scrollTargetTop = scrollTarget.scrollTop;
    }

    if (!$thisField.classList.contains('jsSrveyCheck')) {
        if ($nextField !== null) {
            setTimeout(function() {
                $thisField.classList.remove('jsSrveyCurrent');
                $thisField.classList.add('jsSrveyCheck')
                $nextField.classList.add('jsSrveyCurrent');
            }, 10);
            setTimeout(function() {
                var targetWrapMB = window.outerHeight - $nextField.getBoundingClientRect().height - 61;
                if (targetWrapMB > 0) {
                    $jsSrveyWrap.style.marginBottom = targetWrapMB + 'px';    
                }
                var $nextFieldTop = $nextField.getBoundingClientRect().top;
                var goScroll = $nextFieldTop + scrollTargetTop - 80;
                anime({
                    targets: scrollTarget,
                    easing: 'easeOutCirc',
                    duration: 400,
                    scrollTop: goScroll
                });
                // console.log(scrollTarget,goScroll)
                // scrollTarget.scrollTo({top:goScroll, behavior:'smooth'})
            }, 20);

        }else{
            $jsSrveyWrap.style.marginBottom = 0;
            $thisField.classList.remove('jsSrveyCurrent');
            $thisField.classList.add('jsSrveyCheck')
            if (!$this.closest('.field').classList.contains('-jsDoneMove')) {
                anime({
                    targets: scrollTarget,
                    easing: 'easeOutCirc',
                    duration: 400,
                    scrollTop: 0
                });
                // scrollTarget.scrollTo({top:0, behavior:'smooth'})    
            }
        }
    }
}

/* //설문  */

// isa 투자자 권리 보호 중요사항 확인
function jsSrveyNextOther(e) {
    var $this = e;
    var $thisFold = $this.closest('.accordion');
    var $nextFold = $thisFold.nextElementSibling;
    var $thisFoldChild = $this.closest('.custom-checkbox-wrap');
    var $thisjsSrveyWrap = $this.closest('.jsSrveyWrap');
    var $parWrap = $this.closest('.otherServeyWrap')
    // nextMb()
    if($thisFoldChild !== null) {
        // var $nextFoldPos = $nextFold.getBoundingClientRect().top;
        var $thisFoldChildPos = $this.closest('.custom-checkbox-wrap').getBoundingClientRect().top;
        console.log($thisFoldChildPos, window.scrollY)
        $winHeight = window.outerHeight; 
        anime({
            targets: document.documentElement,
            easing: 'easeOutCirc',
            duration: 300,
            scrollTop: $thisFoldChildPos + window.scrollY - 110
        });
        // window.scrollTo({top:$nextFoldPos + window.scrollY - $winHeight + 78 , behavior:'smooth'})
    }else if ($thisjsSrveyWrap !== null) {
        var $thistSub = $this.closest('.field');
        $nextFold = $thistSub.nextElementSibling;
        if ($nextFold !== null) {
            $thistSub.classList.remove('jsSrveyCurrent');
            $nextFold.classList.add('jsSrveyCurrent');
            nextMb()
            setTimeout(function() {
                var $thistNextSubPos = $nextFold.getBoundingClientRect().top;
                anime({
                    targets: document.documentElement,
                    easing: 'easeOutCirc',
                    duration: 300,
                    scrollTop: $thistNextSubPos + window.scrollY - 77
                });
                // window.scrollTo({top:$thistNextSubPos + window.scrollY - 77 , behavior:'smooth'})
            }, 1);
        }else{
            $thisFold.classList.remove('-active');
            $parWrap.style.marginBottom = 0;
            setTimeout(function() {
                anime({
                    targets: document.documentElement,
                    easing: 'easeOutCirc',
                    duration: 300,
                    scrollTop: 0
                });
            }, 1);
        }
    }else{
        if ($nextFold !== null) {
            $thisFold.classList.remove('-active');
            $nextFold.classList.add('-active');
            var $nextFoldPos = $nextFold.getBoundingClientRect().top;
            nextMb()
            anime({
                targets: document.documentElement,
                easing: 'easeOutCirc',
                duration: 300,
                scrollTop: $nextFoldPos + window.scrollY - 77
            });
            // window.scrollTo({top:$nextFoldPos + window.scrollY - 77 , behavior:'smooth'})
        }else{
            $thisFold.classList.remove('-active');
            $parWrap.style.marginBottom = 0;
            setTimeout(function() {
                anime({
                    targets: document.documentElement,
                    easing: 'easeOutCirc',
                    duration: 300,
                    scrollTop: 0
                });
            }, 1);
        }
    }
    function nextMb() {
        if ($nextFold !== null) {
            var targetWrapMB = window.outerHeight - $nextFold.getBoundingClientRect().height - 237;
            if (targetWrapMB > 0) {
                $parWrap.style.marginBottom = targetWrapMB + 'px';
            }else{
                $parWrap.style.marginBottom = 0;
            }
        }
    }
}

/* 금융상품 주요확인 사항 */
function jsImportConfWrapFnc() {
    var jsImportConfWrap = document.querySelectorAll('.jsImportConfWrap');
    jsImportConfWrap.forEach(function(jsImportConfWrap) {
        var checkEmt = jsImportConfWrap.querySelectorAll('.important-confirm-box .title input[type=checkbox');
        checkEmt.forEach(function(checkEmt) {
            checkEmt.addEventListener('change',function (e) {
                var scrollTarget = null;
                var targetScrollTop = 0;
                var progressTop = 0;
                if (checkEmt.closest('.popup') == null) {
                    // scrollTarget = window;
                    scrollTarget = document.documentElement;
                    targetScrollTop = window.scrollY;
                    progressTop = checkEmt.closest('.page').querySelector('.progress-top').getBoundingClientRect().height;
                }else{
                    scrollTarget = checkEmt.closest('.popup.-active .contents');
                    targetScrollTop = scrollTarget.scrollTop;
                }
                var checkEmtWrap = checkEmt.closest('.important-confirm-box');
                var chekkParent = checkEmt.closest('.agree')
                // var scrollTarget = checkEmt.closest('.popup.-active .contents');
                var panelInner = checkEmtWrap.querySelector('.panel .inner');
                if (checkEmt.checked) {
                    setTimeout(function() {
                        chekkParent.classList.add('-jsChecked');
                    }, 1);
                    var panelInnerHeight = panelInner.getBoundingClientRect().height;
                    panelInner.closest('.panel').style.height = panelInnerHeight+'px';
                    panelInner.closest('.panel').setAttribute('aria-hidden','true')
                }else{
                    chekkParent.classList.remove('-jsChecked');
                    panelInner.closest('.panel').setAttribute('aria-hidden','false')
                }
                if (!checkEmtWrap.classList.contains('-jsView')) {
                    checkEmtWrap.classList.add('-jsView');
                    var checkEmtWrapNext = checkEmtWrap.nextElementSibling;
                    var listWrap = checkEmt.closest('.jsImportConfWrap');
                    if (checkEmtWrapNext !== null) {
                        var targetWrapMB = window.outerHeight - checkEmtWrapNext.getBoundingClientRect().height - 61;
                        (targetWrapMB >=0) ? targetWrapMB = targetWrapMB : targetWrapMB = 0;
                        // listWrap.style.marginBottom = targetWrapMB + 'px';   //DFCT-2024-0000004240 결함으로 잡혀서 삭제
                        setTimeout(function() {
                            var checkEmtWrapNextTop = checkEmtWrapNext.getBoundingClientRect().top;
                            // var targetScrollTop = scrollTarget.scrollTop;
                            var goScroll = checkEmtWrapNextTop + targetScrollTop - progressTop - 58;
                            anime({
                                targets: scrollTarget,
                                easing: 'easeOutCirc',
                                duration: 300,
                                scrollTop: goScroll
                            });
                            // scrollTarget.scrollTo({top:goScroll, behavior:'smooth'})
                        }, 300);
                    }else{
                        // listWrap.style.marginBottom = 0;   //DFCT-2024-0000004240 결함으로 잡혀서 삭제
                        anime({
                            targets: scrollTarget,
                            easing: 'easeOutCirc',
                            duration: 300,
                            scrollTop: 0
                        });
                        // scrollTarget.scrollTo({top:0, behavior:'smooth'})
                    }
                }
            })
        });
    });
}
jsImportConfWrapFnc()

/* //금융상품 주요확인 사항 */


/* 투자자 확인 사항 */
function jsInvestorCheck(e) {
    var $this = e;
    var $triggerTarget = $this.closest('.accordion').querySelector('button.title');
    var $thisParent = $this.closest('.accordion');
    var $thisParentNext = $thisParent.nextElementSibling;
    var scrollTarget = null ;
    var scrollTargetTop = 0;
    if ($this.checked) {
        // console.log(11)
        $triggerTarget.click()
        if ($thisParentNext !== null) {
            setTimeout(function() {
                if ($this.closest('.popup') == null) {
                    scrollTarget = document.documentElement;
                    scrollTargetTop = window.scrollY;
                }else{
                    scrollTarget = $this.closest('.popup.-active .contents');
                    scrollTargetTop = scrollTarget.scrollTop;
                }
                var $thisNextPos = $thisParentNext.getBoundingClientRect().top;
                var $jsInvScroll = $thisNextPos + scrollTargetTop - 50;
                anime({
                    targets: scrollTarget,
                    easing: 'easeOutCirc',
                    duration: 300,
                    scrollTop: $jsInvScroll
                });
            }, 301);
        }
    }else{
        // console.log(22)
    }

    /* var $this = e;
    var $thisParent = $this.closest('.accordion');
    var $thisParentNext = $thisParent.nextElementSibling;
    var scrollTarget = null ;
    var scrollTargetTop = 0;

    if ($thisParentNext !== null) {
        $thisParent.classList.remove('-active');
        $thisParentNext.classList.add('-active');
        setTimeout(function() {
            if ($this.closest('.popup') == null) {
                scrollTarget = document.documentElement;
                scrollTargetTop = window.scrollY;
            }else{
                scrollTarget = $this.closest('.popup.-active .contents');
                scrollTargetTop = scrollTarget.scrollTop;
            }
            
            var $thisNextPos = $thisParentNext.getBoundingClientRect().top;
            var $jsInvScroll = $thisNextPos + scrollTargetTop - 50;
            anime({
                targets: scrollTarget,
                easing: 'easeOutCirc',
                duration: 300,
                scrollTop: $jsInvScroll
            });
        }, 10);
        
    } else {
        $thisParent.classList.remove('-active');
    } */
} 
/* //투자자 확인 사항 */

/* 검색결과 상단으로 스크롤 */
function JsResultTop(id) {
    var $tagetId = document.getElementById(id);
    if ($tagetId.closest('.popup') == null) {
        scrollTarget = document.documentElement;
        scrollTargetTop = window.scrollY;
    }else{
        scrollTarget = $tagetId.closest('.popup.-active .contents');
        scrollTargetTop = scrollTarget.scrollTop;
    }
    var $tagetIdPos = $tagetId.getBoundingClientRect().top;
    var $goScrollTarget = $tagetIdPos + scrollTargetTop - 110;
    anime({
        targets: scrollTarget,
        easing: 'easeOutCirc',
        duration: 300,
        scrollTop: $goScrollTarget
    });

}




/* 상품상세 스크립트 */
function procuctDatailAct() {
    var $productWrap = document.querySelectorAll('.product-detail-wrap');
    // console.log($productWrap.length)
    if ($productWrap.length > 0) {    //상품상세가 없을때 호출시 에러로 조건추가
        $productWrap.forEach(function ($productWrap) {
            var $productWrapPopup = $productWrap.closest('.popup');
            var $ScTarget = null;
            var ScTargetScroll = null;
            var $detailAni = document.querySelectorAll('.jsDetailAni > li');    //상품상세 애니메이션 있는 영역

            if ($productWrapPopup !== null) {
                $ScTarget = $productWrapPopup.querySelector('.popup .contents');
            }else{
                $ScTarget = window;
            }

            $ScTarget.addEventListener('scroll',function () {
                var fixTab = $productWrap.querySelector('.procuct-info');
                if (fixTab !== null) {
                    var fixTabTop = fixTab.getBoundingClientRect().top;  
                    var fixTabNext = $productWrap.querySelector('.product-other').getBoundingClientRect().top - 98;
                    if (fixTabTop < 50) {
                        fixTab.classList.add('-fixed');
                        //보험 상품상세만 하단 버튼 나오는 시기 분리
                        if (fixTab.classList.contains('-other-fixed')) {
                            if(document.querySelector('.fixer.-jsProcuctBtn') !== null ){
                                document.querySelector('.fixer.-jsProcuctBtn').classList.add('-active')
                            }
                        }
                    }else{
                        fixTab.classList.remove('-fixed')
                        //보험 상품상세만 하단 버튼 나오는 시기 분리
                        if (fixTab.classList.contains('-other-fixed')) {
                            if(document.querySelector('.fixer.-jsProcuctBtn') !== null ){
                                document.querySelector('.fixer.-jsProcuctBtn').classList.remove('-active')
                            }
                        }
                    }
                    if (fixTabNext < 0 ) {
                        fixTab.classList.remove('-fixed')
                    }  
                }
    
                //fixer 영역 버튼 action
                var $topJoinBtn = document.querySelector('.top-join-btn');

                if ($topJoinBtn !== null) {
                    var $topJoinBtnPos = $topJoinBtn.getBoundingClientRect().top - 35 ;
                    if ($topJoinBtnPos < 0) {
                        document.querySelector('.fixer.-jsProcuctBtn').classList.add('-active')
                    }else{
                        document.querySelector('.fixer.-jsProcuctBtn').classList.remove('-active')
                    }
                }
    
                //상품상세 애니메이션 활성화
                $detailAni.forEach(function(deatailAni) {
                    var $deatailAniPos = deatailAni.getBoundingClientRect().top - 260;
                    if ($deatailAniPos < 0) {
                        deatailAni.classList.add('-active')
                    }
                    // console.log($deatailAniPos)
                });
            });           

            // 픽스탭 위치 이동
            var $tabBtn = $productWrap.querySelectorAll('.segments.-tabstyle .item button'); //픽스탭 버튼
            $tabBtn.forEach(function(item) {
                item.addEventListener('click',function () {
                    var prodSum = $productWrap.querySelector('.procuct-info').getBoundingClientRect().top;
                    if ($productWrapPopup !== null) {
                        ScTargetScroll = $ScTarget.scrollTop;
                    }else{
                        ScTargetScroll = $ScTarget.scrollY;
                    }
                    setTimeout(function() {
                        $ScTarget.scrollTo({top : prodSum + ScTargetScroll -50, behavior:'smooth'})
                    }, 1);
                })
            });
        });
    }
}
/* //상품상세 스크립트 */

// 다크모드 전환 이미지
function darkChangImg() {
    var jsDarkChangeImgs = document.querySelectorAll('.jsDarkChangeImgs');
    if (document.querySelector('body').classList.contains('dark-mode')) {
        jsDarkChangeImgs.forEach(function(item) {
            var $src =  item.getAttribute('src');
            var $dkSrc = $src.replace('.png','') + '_dk.png';
            item.setAttribute('src',$dkSrc)
        });    
    }
}
darkChangImg()

// 추천상품 클릭시 상단으로 스크롤
function prodToTop(e) {
    var popTarget = e.closest('.popup')
    if (popTarget !== null) {
        popTarget.querySelector('.popup .contents').scrollTo({top : 0, behavior:'smooth'})
    } else {
        window.scrollTo({top : 0, behavior:'smooth'})
    }
}

// page 일경우 상단으로 이동
function goTopPage() {
    anime({
        targets: document.documentElement,
        easing: 'easeOutCirc',
        duration: 300,
        scrollTop: 0
    });
}

/* //이원익 스크립트 끝 */


// 곽소영 스크립트

// 체크박스 리드온리
var checkbox_Readonlys = document.querySelectorAll('.checkbox.-readonly input');
var checkbox_Readonlys2 = document.querySelectorAll('.box-radio.-readonly input');

var CheckRead = function(vari){
    vari.forEach(function(checkboxReadonly){
        if(checkboxReadonly.type === "checkbox"){
            checkboxReadonly.addEventListener('click', function(e){
                e.preventDefault();
            })
        }
    })
}
CheckRead(checkbox_Readonlys);
CheckRead(checkbox_Readonlys2);


// (nds)test title1
// document.querySelectorAll('[data-role="fold"] .title[data-role="marker"]').forEach(button => {
//     button.addEventListener('click', function () {

//         var panel = this.nextElementSibling;
//         var isHidden = panel.getAttribute('data-role') === 'hidden';
//         panel.setAttribute('data-role', isHidden ? 'visible' : 'hidden');

//         this.title = isHidden ? "펼쳐짐" : "접힘";
//         this.setAttribute('aria-expanded', isHidden);
//         panel.hidden = !isHidden; 
//     });
// });

// (nds)test2 title
document.querySelectorAll('.title[data-role="marker"]').forEach(button => {
    button.addEventListener('click', function () {
        var panel = this.nextElementSibling;
        var fold = this.closest('[data-role="fold"]');
        var isHidden = panel.getAttribute('data-role') === 'hidden';
        // console.log('button:', this);
        // console.log(panel);
        // console.log(fold);
        // console.log(isHidden);

        if (!panel) { 
            return; 
        }

        if (isHidden) {
            slideDown(panel, () => {
                fold.classList.add('-active');
                panel.classList.add('visible');
                console.log('down:', panel.className);
            });
            panel.setAttribute('data-role', 'visible');
            this.setAttribute('title', "펼쳐짐");
            // this.title = "펼쳐짐";
            // this.setAttribute('aria-expanded', true);
        } else {
            slideUp(panel, () => {
                fold.classList.remove('-active');
                panel.classList.remove('visible');
                console.log('up:', panel.className);
            });
            panel.setAttribute('data-role', 'hidden');
            this.setAttribute('title', "접힘");
            // this.title = "접힘";
            // this.setAttribute('aria-expanded', false);
        }
    });
});

function slideUp(element, callback) {
    if (!element) return;
    element.style.maxHeight = element.scrollHeight + 'px';
    // console.log(element.scrollHeight);
    requestAnimationFrame(() => {
        element.style.transition = 'max-height 0.5s ease-in-out, padding 0.5s ease-in-out';
        element.style.maxHeight = '0';
        element.style.padding = '4px 20px 20px 20px';
    });
    element.addEventListener('transitionend', () => {
        element.classList.remove('visible');
        if (typeof callback === 'function') {
            callback();
        }
    }, { once: true });
}

function slideDown(element, callback) { 

    if (!element) return; 

    // console.log(element.scrollHeight); 
    element.style.display = 'block'; 
    element.style.position = 'absolute'; 
    element.style.visibility = 'hidden'; 
    requestAnimationFrame(() => { 
        let height = element.scrollHeight; 
        let style = window.getComputedStyle(element); 
        let paddingTop = parseInt(style.getPropertyValue('padding-top')); 
        let paddingBottom = parseInt(style.getPropertyValue('padding-bottom')); 
        let totalHeight = height + paddingTop + paddingBottom; 

        console.log(height); 
        console.log(totalHeight + 'px'); 
        height = totalHeight + 'px'; 
        
        element.style.display = ''; 
        element.style.position = ''; 
        element.style.visibility = ''; 
        element.style.maxHeight = '0'; 
        // element.style.padding = '0 20px';
        requestAnimationFrame(() => { 
            element.style.transition = 'max-height 0.5s ease-out, padding 0.5s ease-out, opacity 0.5s ease-out'; 
            element.style.maxHeight = height; 
            // element.style.padding = '4px 20px 20px 20px'; 
            element.style.opacity = '1'; 
        }); 
    }); 
    element.addEventListener('transitionend', function () { 
        element.style.maxHeight = null; 
        if (typeof callback === 'function') { 
            callback(); 
        } 
    }, { once: true }); 
}


// rrn input test
document.querySelectorAll('input[data-id="rrn"]').forEach(input => { 
    input.addEventListener('focus', function () { 
        this.closest('.rrn').classList.add('-focused'); 
    }); 
    
    input.addEventListener('blur', function () { 
        this.closest('.rrn').classList.remove('-focused'); 
    });
});


// input delete button test
document.querySelectorAll('.clear').forEach(function(button) {
    button.addEventListener('click', function() {
        let inputField = this.parentNode.querySelector('input');
        let wonDiv = this.parentNode.querySelector('.won');
        inputField.value = '';
        wonDiv.textContent = '';
    });
});

// terms agree test
document.addEventListener('DOMContentLoaded', () => {
    const detailElements = document.querySelectorAll('.agree.-detail');

    detailElements.forEach((detailElement) => {
        const titleCheckbox = detailElement.querySelector('.title input[type="checkbox"]');
        const subCheckboxes = detailElement.querySelectorAll('.panel .-sub input[type="checkbox"]');

        if (titleCheckbox) {
            // 전체 동의 클릭 시 하위 체크박스 모두 변경
            titleCheckbox.addEventListener('change', function () {
                console.log('Title checkbox:', this.checked);
                subCheckboxes.forEach((checkbox) => {
                    checkbox.checked = this.checked;
                });
            });

            // 하위 체크박스 상태 변경 시 상태 갱신
            subCheckboxes.forEach((checkbox) => {
                checkbox.addEventListener('change', function () {
                    const allChecked = Array.from(subCheckboxes).every(cb => cb.checked);
                    const noneChecked = Array.from(subCheckboxes).every(cb => !cb.checked);

                    if (allChecked) {
                        titleCheckbox.checked = true;
                        titleCheckbox.indeterminate = false;
                    } else if (noneChecked) {
                        titleCheckbox.checked = false;
                        titleCheckbox.indeterminate = false;
                    } else {
                        titleCheckbox.indeterminate = true; // 일부만 선택된 경우
                    }
                });
            });
        }
    });
});

// popover 닫기
document.querySelectorAll('.popover .popover-close').forEach(button => {
    button.addEventListener('click', function () {
        button.closest('.popover').classList.add('hidden')
    });
});

 // 큰글 스위치
document.querySelectorAll('.func.-bigsize').forEach(button => {
    button.addEventListener('click', function () {
        this.classList.toggle('-active');
    });
});

// chip-accordion
function morebtn(el) {
  $(el).closest('.popular-anchors').toggleClass('-active');
}

// card accordion top-more-btn
// document.addEventListener("DOMContentLoaded", function () {
//     document.querySelectorAll(".top-more-btn").forEach(function (btn) {
//         btn.addEventListener("click", function () {
//             const dls = btn.closest(".account").querySelector(".dls");

//             dls.style.transition = "all 0.3s ease";

//             dls.classList.toggle("-active");
//             btn.classList.toggle("-active");
//         });
//     });
// });
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".top-more-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const dls = btn.closest(".account").querySelector(".dls");
            const isActive = btn.classList.contains("-active");

            if (!isActive) {
                // 열기
                btn.classList.add("-active");
                dls.classList.add("-active");

                const fullHeight = dls.scrollHeight + "px";
                dls.style.height = "0px";
                dls.style.opacity = "0";

                requestAnimationFrame(() => {
                    dls.style.transition = "height 0.3s ease, opacity 0.3s ease";
                    dls.style.height = fullHeight;
                    dls.style.opacity = "1";
                });

                dls.addEventListener("transitionend", function handler(e) {
                    if (e.propertyName === "height") {
                        dls.style.height = "auto";
                        dls.removeEventListener("transitionend", handler);
                    }
                });
            } else {
                // 닫기
                btn.classList.remove("-active");

                const fullHeight = dls.scrollHeight + "px";
                dls.style.height = fullHeight;
                dls.style.opacity = "1";

                requestAnimationFrame(() => {
                    dls.style.transition = "height 0.3s ease, opacity 0.2s ease";
                    dls.style.height = "0px";
                    dls.style.opacity = "0"; // 텍스트 먼저 사라짐
                });

                dls.addEventListener("transitionend", function handler(e) {
                    if (e.propertyName === "height") {
                        dls.classList.remove("-active");
                        dls.style.height = "";
                        dls.style.opacity = "";
                        dls.removeEventListener("transitionend", handler);
                    }
                });
            }
        });
    });
});

// terms-accorditon
document.addEventListener("DOMContentLoaded", function() {
  const accordions = document.querySelectorAll(".agree.-accor");

  accordions.forEach(acc => {
    const moreBtn = acc.querySelector(".more");
    const panel = acc.querySelector(".panel");

    moreBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      const isActive = acc.classList.toggle("-active");
    //   console.log("클릭됨:", isActive, acc.className);

      panel.setAttribute("data-role", isActive ? "visible" : "hidden");
      panel.classList.toggle("-close", !isActive);
    });
  });
});

//radio-active border-color
document.addEventListener("DOMContentLoaded", function() {
  const radios = document.querySelectorAll('input[type="radio"]');

  radios.forEach(radio => {
    radio.addEventListener("change", function() {
      document.querySelectorAll(".selection.card .prod-radio").forEach(el => {
        el.classList.remove("-active");
      });

      if (this.checked) {
        const prodRadio = this.closest(".prod-radio");
        if (prodRadio) {
          prodRadio.classList.add("-active");
        }
      }
    });
  });
});

//checkbox-active border-color
document.addEventListener("DOMContentLoaded", function() {
  const checkboxes = document.querySelectorAll(".compare-checkbox input[type='checkbox']");

  checkboxes.forEach(function(checkbox) {
    const accountCard = checkbox.closest(".account.card.-list");

    if (checkbox.checked) {
      accountCard.classList.add("-active");
    }

    // 체크박스 상태 변경
    checkbox.addEventListener("change", function() {
      if (this.checked) {
        accountCard.classList.add("-active");
      } else {
        accountCard.classList.remove("-active");
      }
    });
  });
});