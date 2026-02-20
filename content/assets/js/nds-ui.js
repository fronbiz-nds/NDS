
var NDS_UI = (function() {
    function Sample() {
        document.querySelector('.nds-button').addEventListener('click', function() {
            console.log('샘플입니다.')
        });
    }
    function init() {
        Sample();
    }

    return {
        init: init,
    }
}());

NDS_UI.init()