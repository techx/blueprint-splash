$(document).ready(function() {
    $('#go-down').click(function() {
        $('html,body').animate({
            scrollTop: $("#about-section").offset().top},
            'slow');
    });
});
