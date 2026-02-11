// 로딩
window.addEventListener('DOMContentLoaded', (e) => {
    $('.loading-box').hide()
});

// 미리보기 아이프레임 닫기
function iframeClose(){
    $('.iframe-box').removeClass('-on');
    $('.iframe-view').attr('src','');
}

document.addEventListener('DOMContentLoaded', () => {
    // 다크모드 사용자별 초기 설정
    // if( window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ) {
    //     document.querySelector('body').classList.add("dark-mode")
    // } else {
    //     document.querySelector('body').classList.remove("dark-mode")
    // }
    if( window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ) {
        document.querySelector('body').classList.add("dark-mode")
    } else {
        document.querySelector('body').classList.remove("dark-mode")
    }

    // 비고 자세히 보기
    let noteHandler = () => {
        $(document).on('click', 'table td.note', function (e) {
            iframeClose();

            var cloneNote = $(e.currentTarget.cloneNode(true));

            if($('.notes').length > 0) {
                $('.notes').remove();
            };

            var markup  = '<div class="notes">';
                markup += '    <div class="box">';
                markup += '        <button type="button" class="close"></button>';
                markup += '        <div class="title">수정내역</div>';
                markup += '        <div class="list"></div>';
                markup += '    </div>';
                markup += '</div>';

            $('body').append(markup);
            cloneNote.each((x,y) => $('.notes .list').append(y))

            anime({
                targets: '.notes',
                easing: 'easeOutQuint',
                duration: 300,
                translateX: ['100%', 0],
            });
        });

        $(document).on('click', '.notes .close', function (e) {
            $(e.currentTarget).closest('.notes').remove();
        });
    }
    noteHandler();
});

$(function(){
    var count = 0;

    $('.iframe-close').on('click', function(){
        iframeClose()
    })

    // 미리보기 아이프레임 호출
    $(document).on('click','.iframe-select', function(){
        let linkHref = $(this).siblings('.linked').attr('href');
        $('.iframe-view').attr('src', ''+linkHref+'');
        $('.notes').remove();
        $('.iframe-box').addClass('-on');
        $('.iframe-select:checked').focus();
        // setTimeout(() => {
        //     $('.iframe-view').contents().find('body').addClass('dark-mode');
        // }, 100);
    });    
        // $('body').addClass('dark-mode');
        
    // 단축키 설정 (중복 사용 키)
    $(document).keypress(function(event){
        // 다크모드 강제 옵션
        // if(event.keyCode == 2 ) { /* Ctrl + B */
        //     $('body').toggleClass('dark-mode')
        // };
        if(event.keyCode == 2 ) { /* Ctrl + B */
            $('body').toggleClass('dark-mode')
        };
	});

    // 단축키 설정 (개별 사용 키)
	$(document).keyup(function(event){
        if(event.keyCode === 27){ /* ESC */
			if( $('.notes').length ){
                $('.notes').remove();
            } else if( $('.iframe-box').hasClass('-on') ){
                iframeClose()
            };
            $('#tableSearch').val('');
		}
	});

    // Tab UI
    $('.wh__category [type="radio"]').on('change', function(){
        let thisValue = $(this).val()
        if( thisValue != 'all' ) {
            $('tbody').hide()
            $('tbody.'+thisValue).show()
        } else {
            $('tbody').show()
        }
    });

    // ID 복사하기
    $(document).on('mouseenter', '.func', function(){
        var copybtn  = ' <button type="button" class="clip"></button>';
        $(this).append(copybtn);

        // 페이지 아이디 복사
        $('.clip').click(function(e){
            navigator.clipboard.writeText(e.target.parentNode.innerText);
            var toastbtn = ' <div class="toast">';
                toastbtn += '     <div class="message">';
                toastbtn += '         <p>화면ID 복사 완료</p>';
                toastbtn += '     </div>';
                toastbtn += ' </div>';
            $('body').prepend(toastbtn);
            $('.toast').addClass('-active');
        })
    });

    $('#tableSearch').on('focus', function(){
        var tableTr = $('.wrap tbody tr');
        var tableTd = $('.wrap tbody tr td');

        $(this).parent().parent('.mix').addClass('focus-in')
        $(this).blur(function(){
            $(this).parent().parent('.mix').removeClass('focus-in')
        })
    
        function tReset() {
            $(tableTr).removeClass('on');
            $(tableTd).removeClass('highlight');
        }
    
        $(this).keyup(function(e){
            var keyword = $(this).val();
            $(tableTr).addClass('hide');
            var temp = $('.wrap table > tbody > tr > td:contains("' + keyword + '")');
            tReset();
            $(temp).parent().addClass('on');
            $(temp).addClass('highlight');
    
            if ($(this).val() == 0 || e.which === 27) {
                $(this).val('');
                $(tableTr).removeClass('hide');
                tReset();
            };
        });
    });


})