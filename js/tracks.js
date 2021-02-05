
var modal = document.getElementById("myModal");

var app_dev = document.getElementById("app-dev");
var start_hack = document.getElementById("start-hack");
var web_dev_beg = document.getElementById("web-dev-beg");
var web_dev_adv = document.getElementById("web-dev-adv");

var app_dev_mobile = document.getElementById("app-dev-mobile");
var start_hack_mobile = document.getElementById("start-hack-mobile");
var web_dev_beg_mobile = document.getElementById("web-dev-beg-mobile");
var web_dev_adv_mobile = document.getElementById("web-dev-adv-mobile");

clickable = [app_dev, start_hack, web_dev_beg, web_dev_adv]
clickable_mobile = [app_dev_mobile, start_hack_mobile, web_dev_beg_mobile, web_dev_adv_mobile]

clickable.forEach(button => {
    button.onclick = function() {
        show_modal(button.id)
    }
});

clickable_mobile.forEach(button => {
    button.onclick = function() {
        show_modal(button.id.slice(0,-7))
    }
});

let modals = document.getElementsByClassName("modal")
for (let i = 0; i < modals.length; i++) {
    let close_button = modals[i].getElementsByClassName("close")[0];
    close_button.addEventListener("click", () => hide_modal(modals[i].id))
    modals[i].addEventListener('click', (e) => {
        if (e.target.className == 'modal') {
            hide_modal(modals[i].id)
        }
    })
}

function show_modal(track_id) {
    let modal = document.getElementById(`${track_id}-modal`)
    let description = document.getElementById(`${track_id}-description-text`)
    let label = document.getElementById(`${track_id}-description`)
    document.getElementById(`${track_id}-resources`).style.color = '#016a8d'
    document.getElementById(`${track_id}-questions`).style.color = '#016a8d'
    modal.style.display = "block"
    description.style.display = "block"
    label.style.color = '#1A3059'
}

function hide_modal(id) {
    let modal = document.getElementById(id)
    let hidden = document.getElementsByClassName('modal-hidden')
    for (let i = 0; i < hidden.length; i++) {
        hidden[i].style.display = 'none'
    }
	modal.style.display = "none"
}



//navbars
let navbars = document.getElementsByClassName('modal-navbar')
let navbar_labels = document.getElementsByClassName('navbar-txt-pp')
for (let i = 0; i < navbars.length; i++) {
	navbars[i].addEventListener("click", (event) => {
        if (event.target.className == 'navbar-txt-pp') {
            for (let i = 0; i < navbar_labels.length; i++) {
                navbar_labels[i].style.color = '#016a8d'
            }
            event.target.style.color = '#1A3059'
            show_info(event.target.id)
        }
    })
}

function show_info(id) {
    let hidden = document.getElementsByClassName('modal-hidden')
    for (let i = 0; i < hidden.length; i++) {
        hidden[i].style.display = 'none'
    }

    let content = document.getElementById(`${id}-text`)
    content.style.display = "block"
    
}