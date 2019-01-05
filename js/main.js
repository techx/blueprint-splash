var resizeTimer;
var screens = ['home','about','schedule','faq','register'];
var previousScrollTime = 0;
var timeThreshold = 1500; // Only register events that are 1 second within each other
var current;
var previousScreen;
var validTransition = true;

initVars();
activateListeners();

function activateListeners(){
	let width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || width < 900) {
		window.removeEventListener('wheel',wheelHandler);
		window.removeEventListener('keydown',buttonHandler);
	} else {
		// Event listeners for wheel scroll and key press
		window.addEventListener('wheel', wheelHandler, false);
		window.addEventListener('keydown', buttonHandler, false);
		faqScrollHandler();

	}

}

// Get browser that user is on
function getBrowser(){
	if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) {
		return 'opera';
	} else if(navigator.userAgent.indexOf("Chrome") != -1 ) {
		return 'chrome';
	} else if(navigator.userAgent.indexOf("Safari") != -1) {
		return 'safari';
	} else if(navigator.userAgent.indexOf("Firefox") != -1 ) {
	 	return 'firefox';
	} else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) {
		return 'ie';
	} else {
		return 'unknown';
	}
}

// Get different scroll tolerance based on browser
function getScrollEps(){
	let browser = getBrowser();
	switch(browser){
		case 'opera':
			return 0;
			break;
		case 'chrome':
			return 5;
			break;
		case 'safari':
			return 0;
			break;
		case 'firefox':
		 	return 0;
			break;
		case 'ie':
			return 0;
			break;
		default:
			return 0;
			break;
	}
}

// Initialize variables for curret and previousScreen
function initVars() {
	for (let i=0; i < screens.length; i++){
		let yPos = window.scrollY;
		if(yPos >= getDivTopPos(screens[i])){
			previousScreen = screens[i];
		}
		current = screens.indexOf(previousScreen);
	}
	smoothScroll(previousScreen);
}

// Handle partial scrolling and section transitions
function scrollHandler(direction){
	let windowTop = window.scrollY;
	if (direction == 'up'){
		let sectionTop = getDivTopPos(previousScreen);
		// If the window is at the top of section, we can transition
		if (windowTop <= sectionTop){
			// Only transition if we are not at first section
			if (current > 0){
				scrollCheck(getPreviousScreen());
				timeThreshold = 1500;
			} else {
				timeThreshold = 0;
			}
		} else {
			// If window is not at top, move towards top without exceeding it
			let dy = Math.round(Math.min(window.innerHeight/2,windowTop-sectionTop))+1;
			$(document).ready(function(){
				$('html, body').animate({
					scrollTop: windowTop-dy
				},500);
			});
			timeThreshold = 750;
		}
	} else if (direction == 'down'){
		let sectionBottom = getDivBottomPos(previousScreen);
		let windowBottom = window.scrollY+window.innerHeight;

		// If the window is at the tp of section, we can transition
		if (windowBottom >= sectionBottom){
			// Only transition if we are not at last section
			if (current < screens.length-1){
				scrollCheck(getNextScreen());
				timeThreshold = 1500;
			} else {
				timeThreshold = 0;
			}
		} else {
			let dy = Math.round(Math.min(window.innerHeight/2,sectionBottom-windowBottom))+1;
			// If we are not at the bottom, move towards bottom without exceeding it

			$(document).ready(function(){
				$('html, body').animate({
					scrollTop: windowTop+dy
				},500);
			});
			timeThreshold = 750;
		}


	}
}




// Reposition to current section when window changes
function resizeHandler(){
	activateListeners();
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(function(){
		let targetY = getDivTopPos(previousScreen);
		window.scrollTo(0,targetY);
	},100);


}

// Get the Y position of the top of a div
function getDivTopPos(id){
	return $('#'+id).offset().top;
}

// Get the Y position of the bottom of a div
function getDivBottomPos(id){
	let divs;
	// Check bottom most divs in each section
	switch(id){
		case 'home':
			divs = ['content'];
			break;
		case 'about':
			divs = ['about-container','learnathon-container','hackathon-container'];
			break;
		case 'schedule':
			divs = ['learnathon-schedule','hackathon-schedule'];
			break;
		case 'faq':
			divs = ['faq-contact'];
			break;
		case 'register':
			divs = ['register-container'];
			break;
		default:
			divs = [];
	}
	let bottom = 0;
	for(let i=0; i<divs.length; i++){
		let currentDiv = '#'+divs[i];
		let divBottom = $(currentDiv).offset().top + $(currentDiv).outerHeight();
		if (divBottom > bottom){
			bottom = divBottom;
		}
	}
	return bottom;
}

// Increment current and return the new current screen
function getNextScreen(){
	current = Math.min(current+1,screens.length-1);
	return screens[current];
}

// Decrement current and return the new current screen
function getPreviousScreen(){
	current = Math.max(current-1,0);
	return screens[current];
}

// Fired once a navigation animation to a target completes
function handleAnimationComplete(target) {
	$(".section").removeClass("active");
	$("#" + target).addClass("active");
}

// Given a target screen, smooth scrolls to that div
function smoothScroll(target) {
	$(document).ready(() => {
		$('html, body').animate({
			scrollTop: $('#'+target).offset().top
		}, 1000).promise().done(() => {
			handleAnimationComplete(target);
		});
	});
}

// Given the current screen, performs a transition
// if screen is not same as previous screen
function scrollCheck(target){
	if (previousScreen != target){
		smoothScroll(target);
		let width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		if (width >= 900) {
			if (previousScreen != "home"){
				$("#"+previousScreen+"-button").removeClass("active");
			}

			if(target != "home"){
				$("#"+target+"-button").addClass("active");
			}
		}


		previousScreen = target;

	}
}

// Handle navbutton clicks
function navHandler(target){
	current = screens.indexOf(target);
	scrollCheck(target);
}

// Given that mouse wheel is used, transitions
// according to the direction of the scroll
function wheelHandler(event){
	if (validTransition){
		if (event.timeStamp-previousScrollTime >= timeThreshold){
			// let eps = getScrollEps();
			let eps = 0;
			let currentScreen;

			if(Math.abs(event.deltaY) > Math.abs(event.deltaX)+eps){
				if(event.deltaY > 0){
					previousScrollTime = event.timeStamp;

					scrollHandler('down');
				} else if (event.deltaY < 0){
					previousScrollTime = event.timeStamp;
					scrollHandler('up');
				}
			}
		}
	}

}

// Given that a button is pressed, transitions accordingly
function buttonHandler(event){
	if (validTransition){
		if (event.timeStamp-previousScrollTime >= timeThreshold){
			let key = event.which;
			let currentScreen;
			// Goes to next screen if space, down arrow, page down, or enter pressed
			if(key == 40 || key == 34 || key == 13 || key == 32){
				previousScrollTime = event.timeStamp;
				scrollHandler('down');
			// Goes to previous screen if up arrow, backspace, or page up pressed
			} else if(key == 38 || key == 33 || key == 8){
				previousScrollTime = event.timeStamp;
				scrollHandler('up');
			}
		}
	}
}

// Lock page scrolling while hovering over FAQ box
function faqScrollHandler(){
	let element = document.getElementById('faq-questions');
	element.addEventListener('mouseover',function(){
		if (element.scrollHeight > element.offsetHeight){
			validTransition = false;
		} else {
			validTransition = true;
		}
	});
	element.addEventListener('mouseout',function(){
		validTransition = true;
	});
}

// Animate drop down for FAQ
function faqCollapse(){
	let coll = document.getElementsByClassName("question");

	for (let i=0; i<coll.length; i++) {
		coll[i].addEventListener("click", function(event) {
			let carrot = '&gt;';
			let text = this.innerHTML;
			if (text.indexOf(carrot) >= 0){
				let indexCarrot = text.indexOf(carrot);
				let newText = text.substring(0,indexCarrot) + 'v' + text.substring(indexCarrot+4,text.length);
				this.innerHTML = newText;
			} else {
				let indexCarrot = text.indexOf('v');
				let newText = text.substring(0,indexCarrot) + '>' + text.substring(indexCarrot+1,text.length);
				this.innerHTML = newText;
			}

			var content = this.nextElementSibling;
			if (content.style.maxHeight){
				content.style.maxHeight = null;
			} else {
				content.style.maxHeight = content.scrollHeight + "px";
			}
			// Lock scroll for the duration of animation
			previousScrollTime = event.timeStamp;
			timeThreshold = 500;
			setTimeout(function(){
				let element = document.getElementById('faq-questions');
				if (element.scrollHeight > element.offsetHeight){
					validTransition = false;
				} else {
					validTransition = true;
				}
			},250);




		});
	}
}



window.addEventListener('resize', resizeHandler, false);
faqCollapse();
