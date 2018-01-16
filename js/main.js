$(function() {
    var scroll = $(window).scrollTop();
    var prev_scroll = 0;

    var ANIMATION_START = 0;
    var ANIMATION_END = 140;

    function linmap(a1, b1, a2, b2, v) {
        var f = (v - a1) / (b1 - a1) * (b2 - a2) + a2;
        if (f > b2 && b2 > a2) return b2;
        if (f < a2 && b2 > a2) return a2;
        if (f < b2 && b2 < a2) return b2;
        if (f > a2 && b2 < a2) return a2;

        return f;
    }

    function linmap_attr(a1, b1, a2, b2, v, attr, units, elem) {
        elem.css(attr, linmap(a1, b1, a2, b2, v) + units);
    }

    var rem = function rem() {
        var html = document.getElementsByTagName('html')[0];

        return function () {
            return parseInt(window.getComputedStyle(html)['fontSize']);
        }
    }();

    function toRem(length) {
        return (parseInt(length) / rem());
    }


    var bp_title = $('.bp-title');
    var date = $('.date');
    var nestle = $('.nestle');
    var heading = $('.heading');
    var menu = $('.menu-shadow');
    var explode_container = $('#explode-container')
    var logo_initial = toRem($('.bp-title').css('font-size').replace(/[^-\d\.]/g, ''));

    logo.init($('#explode-container')[0]);

    $(window).scroll(function() {
        scroll = $(window).scrollTop();
    });

    $(window).resize(function() {        
        if(window.innerWidth<=768) {
            logo_initial = 4;
        }
        else {
            logo_initial = 6;
        }
        linmap_attr(ANIMATION_START, ANIMATION_END, logo_initial, 1.8, scroll, 'font-size', 'rem', bp_title);
    })

    // main loop for animations
    function render() {
        window.requestAnimationFrame(render);

        if (scroll == prev_scroll) 
            return;

        prev_scroll = scroll;

        if (scroll < 0) {
            $('#explode-container > canvas').css('top', -1 * scroll+'px');
        }

        linmap_attr(ANIMATION_START, ANIMATION_END, 1,   0, scroll, 'opacity', '', date);
        linmap_attr(ANIMATION_START, ANIMATION_END, 0, 200, scroll, 'width', 'px', nestle);
        linmap_attr(ANIMATION_START, ANIMATION_END, logo_initial, 1.8, scroll, 'font-size', 'rem', bp_title);
        linmap_attr(ANIMATION_START, ANIMATION_END, 40, 13, scroll, 'top', 'px', heading);
        linmap_attr(ANIMATION_START, ANIMATION_END, 0, 0.5, scroll, 'opacity', '', menu);
    
        var d = linmap(0, 150, 0, 100, scroll);
        logo.explode_to(d);
        linmap_attr(0, 150, 1, 0.05, scroll, 'opacity', '', explode_container);
    }
    render();
});
