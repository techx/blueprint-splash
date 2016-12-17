$(document).ready(function() {
    $('#go-down').click(function() {
        $('html,body').animate({
            scrollTop: $("#about-section").offset().top},
            'slow');
    });
    $('#clear-bpdb-btn').click(function() {
        $('#clear-bpdb-btn').addClass('animated pulse');
        window.setTimeout(function() {
            $('#clear-bpdb-btn').removeClass('animated pulse');
        }, 1000);
    });
    $('#undo-bpdb-btn').click(function() {
        $('#undo-bpdb-btn').addClass('spin');
        window.setTimeout(function() {
            $('#undo-bpdb-btn').removeClass('spin');
        }, 1000);
    })
});
