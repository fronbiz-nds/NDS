
function buildGuide() {
    /* GUIDE LIST */
    document.querySelectorAll('.gl script').forEach(function(script, i, scripts) {
        var item = document.createElement('div');
        var ex = document.createElement('div');
        var html = window['item'+ i] = script.textContent.replace('<!-- [코드시작] -->', '').replace('<!-- [코드끝] -->', '').trim();
        var size = !script.dataset.size ? 1 : script.dataset.size;

        // 아이템
        item.classList.value = script.classList.value;
        item.classList.add('gl__item');
        item.classList.add('-x'+ size);
        item.dataset.title = script.dataset.title;
        if (script.dataset.desc) { item.dataset.desc = script.dataset.desc; }
        if (script.dataset.notes) { item.dataset.notes = script.dataset.notes; }

        // 프리뷰
        ex.classList.add('gl__preview');
        ex.innerHTML = html;
        ex.addEventListener('click', function(e) {
            var target = e.target;
            navigator.clipboard.writeText(html).then(function() {

            });
        });
        item.append(ex);

        script.insertAdjacentElement('afterend', item);
        script.remove();
    });
}

document.querySelectorAll('.gl__item').forEach(function(item, i) {
    item.addEventListener('mouseenter', function(e) {
        var target = e.target;
        var items = document.querySelectorAll('.gl__item');
        var testButton = document.createElement('button');
        var detailButton = document.createElement('button');

        // testButton.type = 'button';
        // testButton.classList.add('gl__test');
        // testButton.innerHTML = '<span>테스트</span>';
        // testButton.addEventListener('click', function(e) {
        //     var cTarget = e.currentTarget;
        //     var item = cTarget.parentNode;

        //     item.classList.toggle('test-mode');
        // });

        // target.append(testButton);

        // 코드보기
        detailButton.type = 'button';
        detailButton.classList.add('gl__detail');
        detailButton.innerHTML = '<span>상세</span>';
        detailButton.addEventListener('click', function(e) {
            var target = e.target;
            var item = target.parentNode;
            var gd = document.createElement('div');
            var title = document.createElement('div');
            var dev = document.createElement('div');
            var code = document.createElement('pre');
            var info = document.createElement('div');
            var close = document.createElement('button');
            var desc = document.createElement('div');
            var subTitle = document.createElement('div');
            var notes = document.createElement('div');

            if (document.querySelector('.gd')) { document.querySelector('.gd').remove(); };

            gd.classList.add('gd');

            title.classList.add('gd__title');
            title.innerText = item.dataset.title;

            gd.append(title);

            code.classList.add('gd__code');
            code.textContent = window['item'+ i];

            dev.classList.add('gd__dev');
            dev.append(code);

            gd.append(dev);

            info.classList.add('gd__info');

            if (item.dataset.desc) {
                desc.classList.add('gd__desc');
                desc.innerHTML = item.dataset.desc;

                info.append(desc);
            }

            if (item.dataset.notes) {
                subTitle.classList.add('gd__sub-title');
                subTitle.innerText = '수정내역';

                info.append(subTitle);

                notes.classList.add('gd__notes');

                item.dataset.notes.replaceAll(/[\{\}/\s/\n]/g, '').split(',').forEach(function(item, i) {
                    var result = item.split(':');
                    var note = document.createElement('div');

                    note.classList.add('gd__note');
                    note.dataset.date = result[0];
                    note.innerHTML = result[1];

                    notes.append(note);
                });

                info.append(notes);
            }

            gd.append(info);

            close.type = 'button';
            close.classList.add('gd__close');
            close.innerHTML = '<span class="hide">닫기</span>';

            gd.append(close);

            document.querySelector('body').append(gd);

            if (item.dataset.desc) { desc = item.dataset.desc; }

            items.forEach(function(item) { item.classList.remove('-active') });
            item.classList.add('-active');

            document.querySelector('.gd').classList.add('-active');

            if (item.dataset.notes) {
                notes = item.dataset.notes;
            }

            if (desc) { document.querySelector('.gd__desc').innerText = desc; }
        });

        target.append(detailButton);
    });

    item.addEventListener('mouseleave', function(e) {
        var target = e.target;
        var testButton = target.querySelector('.gl__test');
        var detailButton = target.querySelector('.gl__detail');

        detailButton.remove();
    });
});

document.querySelector('.-alltest').addEventListener('click', function(e) {
    document.querySelector('body').classList.toggle('test-mode');
    this.classList.toggle('on');
    var target = e.target;
    var kk = target.querySelector('span');

    if (kk.innerText === '테스트모드') {
        kk.innerText = '카피모드';
    } else {
        kk.innerText = '테스트모드';
    }
});

document.addEventListener('click', function(e) {
    if (!e.target.classList.contains('gd__close')) return;

    document.querySelector('.gl__item.-active').classList.remove('-active');
    document.querySelector('.gd').remove();
});

/* NAVIGATION */
document.querySelectorAll('.gn__group > button').forEach(function(button) {
    button.addEventListener('click', function(e) {
        var target = e.target;

        target.parentNode.classList.toggle('-active');
    });
});

var openTimer;
var closeTimer;

/* document.querySelector('.gn').addEventListener('mouseenter', function(e) {
    clearTimeout(closeTimer);
    navTimer = setTimeout(function() {
        document.querySelector('.gn').classList.add('-active');
    }, 400);
}); */

/* document.querySelector('.gn').addEventListener('mouseleave', function(e) {
    clearTimeout(openTimer);
    closeTimer = setTimeout(function() {
        document.querySelector('.gn').classList.remove('-active');
    }, 1000);
}); */

window.addEventListener('resize', resize);

function resize() {
    if (window.innerWidth <= 1200) {
        document.querySelector('.gn').classList.remove('-active');
    }
}

// resize();

/* DARK MODE */


document.querySelector('.gh__util.-dark').addEventListener('click', function(e) {
    console.log('dark')
    var target = e.target;
    var body = document.querySelector('body');
    var keyword = target.querySelector('span');

    body.classList.toggle('dark-mode');
    target.classList.toggle('-active');

    if (keyword.innerText === '다크모드') {
        keyword.innerText = '라이트모드';
    } else {
        keyword.innerText = '다크모드';
    }
});
/* 
$(document).ready(function(){
    if(document.querySelector('body').classList.contains('dark-mode')){
        document.querySelector('.gh__util.-dark').classList.add('-active')
    }
 })
 */
/* NAVIGATION */
var headings = document.querySelectorAll('.gc__heading');

window.addEventListener('scroll', function() {
    var currentID;

    headings.forEach(function(heading) {
        if (pageYOffset === 0) {
            if (document.querySelector('.gn a.-active') !== null) {
                document.querySelector('.gn a.-active').classList.remove('-active');
            }
            
            document.querySelector('.gn a').classList.add('-active');
        }
        if (pageYOffset >= heading.offsetTop - 74) { currentID = heading.id; }
    });

    if (document.querySelector('.gn a.-active')) {
        document.querySelector('.gn a.-active').classList.remove('-active');
    }

    if (document.querySelector('[href="#'+ currentID +'"]') !== null) {
        document.querySelector('[href="#'+ currentID +'"]').classList.add('-active');
    }
});

document.querySelectorAll('.gn a').forEach(function(link) {
    link.addEventListener('click', function(e) {
        var target = e.target;
        var href = target.getAttribute('href');

        window.scrollTo(0, document.querySelector(href).offsetTop - 74);

        e.preventDefault();
    });
});

document.querySelectorAll('.gc button').forEach(function(button) {
    button.addEventListener('click', function(e) {
        var cTarget = e.currentTarget;
        var code;
        var type;

        if (cTarget.dataset.bankcode) {
            type = 'bank';
            code = cTarget.dataset.bankcode;
        } else {
            type = 'country';
            code = cTarget.dataset.countrycode;
        }

        navigator.clipboard.writeText('data-'+ type +'code="'+ code +'"').then(function() {

        });
    });
});