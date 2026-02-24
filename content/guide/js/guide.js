function buildGuide() {
    document.querySelectorAll('.gl script').forEach(function(script, i) {

        var item = document.createElement('div');
        var preview = document.createElement('div');
        var etc = document.createElement('div');

        var html = script.textContent.trim();

        /* 기본 세팅 */
        item.classList.value = script.classList.value;
        item.classList.add('gl__item');
        item.dataset.title = script.dataset.title;

        if (script.dataset.desc) item.dataset.desc = script.dataset.desc;
        if (script.dataset.notes) item.dataset.notes = script.dataset.notes;

        /* preview */
        preview.classList.add('gl__preview');
        preview.innerHTML = html;

        /* etc 영역 */
        etc.classList.add('gl__etc');

        /* 설명 */
        var desc = document.createElement('span');
        desc.classList.add('gl__desc');
        desc.innerHTML = script.dataset.title ? script.dataset.title : '';

        /* 소스보기 버튼 */
        var detailBtn = document.createElement('button');
        detailBtn.type = 'button';
        detailBtn.classList.add('gl__detail');
        detailBtn.innerHTML = '<span class="hide">소스보기</span>';
        detailBtn.addEventListener('click', function () {

            if (document.querySelector('.gd')) {
                document.querySelector('.gd').remove();
            }

            var gd = document.createElement('div');
            gd.classList.add('gd');

            var close = document.createElement('button');
            close.type = 'button';
            close.classList.add('gd__close');
            close.innerHTML = '<span class="hide">닫기</span>';

            var title = document.createElement('div');
            title.classList.add('gd__title');
            title.innerText = item.dataset.title;

            var dev = document.createElement('div');
            dev.classList.add('gd__dev');

            var code = document.createElement('pre');
            code.classList.add('gd__code');

            var source = item.querySelector('.gl__preview').innerHTML.trim();
            code.textContent = source;

            dev.append(code);
            gd.append(close, title, dev);
            document.body.append(gd);

            item.classList.add('-active');
            gd.classList.add('-active');
        });

        /* 카피하기 버튼 */
        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.classList.add('gl__copy');
        copyBtn.innerHTML = '<span class="hide">카피하기</span>';

        copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(html);
        });

        /* 조립 */
        etc.append(desc, detailBtn, copyBtn);
        item.append(preview, etc);

        script.insertAdjacentElement('afterend', item);
        script.remove();
    });
}

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

window.addEventListener('resize', resize);

function resize() {
    if (window.innerWidth <= 1200) {
        const gn = document.querySelector('.gn');
        if(!gn) return;
        gn.classList.remove('-active');
    }
}

// resize();

/* DARK MODE */
const darkBtn = document.querySelector('.gh__util.-dark');
if (darkBtn) {
    darkBtn.addEventListener('click', function(e) {
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
}
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
    if(!headings) return;

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