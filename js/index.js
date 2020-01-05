
// Mobile features
var isMobile = false;

if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}

if (isMobile) {
  document.getElementById("menu-play").classList.add("hidden");
}

// Menu button
const menuButton = document.getElementById("menu-button");
menuButton.onclick = function(){ 
  playSound("back")
}


function updatePage() {
  if(window.location.hash.substring(1) === "home"){stopGame() }
  const pages = ["home", "play", "about", "register", "schedule", "faq", "win", "lose"];
  const newPageId = window.location.hash.substring(1);

  if (!pages.includes(newPageId)) {
    return;
  }
  var currentPage;
  for (let i = 0; i < pages.length; i++) {
    const page = document.getElementById(pages[i]);

    if (page === null) {
      continue;
    }
    if (!page.classList.contains("hidden")){
      currentPage = page
    }
  }
  
  if (newPageId === "play") {
    setTimeout(startBrickGame(), 250);
  }

  currentPage.style.opacity = 0;
  let timeout = newPageId === "play" ? 0 : 150
  setTimeout(function(){
    currentPage.classList.add("hidden");
    var newPage = document.getElementById(newPageId)
    newPage.classList.remove("hidden");
    newPage.style.opacity = 1;
    const menuButton = document.getElementById("menu-button");
    if (newPageId === "home") {
      menuButton.classList.add("hidden");
    } else {
      menuButton.classList.remove("hidden");
    }
  }, timeout)
  
  document.getElementById(newPageId).classList.remove("hidden");
  
  

  if (newPageId === "home") {
    menuButton.classList.add("hidden");
  } else {
    menuButton.classList.remove("hidden");
  }

}


// Squares
function generateSquares() {
  const numSquares = 25;
  const squares = document.getElementById("squares");

  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement("div");
    square.classList.add("square");

    const rand = Math.random();

    if (rand < 0.25) {
      square.classList.add("red");
    } else if (rand < 0.5) {
      square.classList.add("blue");
    } else if (rand < 0.75) {
      square.classList.add("purple");
    } else {
      square.classList.add("yellow");
    }

    // Random position between 5-65% vertically, 5-95% horizontally
    square.style.top = (Math.random() * 50 + 5) + "%";
    square.style.left = (Math.random() * 90 + 5) + "%";
    squares.appendChild(square);
  }
}

window.onhashchange = updatePage;

function parseCookies() {
  const cookiesList = document.cookie.split("; ");
  let cookies = {};

  for (let i = 0; i < cookiesList.length; i++) {
    const cookieParts = cookiesList[i].split("=");
    cookies[cookieParts[0]] = cookieParts[1];
  }

  return cookies;
}


// Beginning video 
function setAnimationCookie() {
  const currentTime = new Date().getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const expireDate = new Date(currentTime + oneWeek);

  document.cookie = "animation=" + new Date() + "; expires=" + expireDate + "; path=/";
}

function shouldAnimate() {
  const cookies = parseCookies();

  if ("animation" in cookies) {
    const lastAnimationTime = new Date(cookies["animation"]).getTime();
    const timeSinceLastAnimation = new Date().getTime() - lastAnimationTime;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;

    return timeSinceLastAnimation >= oneWeek;
  }

  return true;
}

if (shouldAnimate() && !isMobile) {
  const video = document.createElement("video");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");
  video.setAttribute("id", "loading");
  video.setAttribute("src", "assets/video/animation2.mp4");
  document.body.insertBefore(video, document.body.childNodes[0]);
}

document.onkeydown = shouldAnimate() ? function(e) {
  const video = document.getElementById("loading");
  // Spacebar
  if (e.keyCode === 32) {
    video.style.opacity = 0;

    //add button pressing
    document.addEventListener('keydown', handleMenu);

    setTimeout(function() {
      video.classList.add("hidden");
    }, 500);
  }
} : null;




var containers = document.getElementsByClassName("container")
for(let i=0; i < containers.length; i++){
    containers[i].style.opacity = 0;
}

var currentPageHash = window.location.hash.substring(1)
if (currentPageHash.length === 0){
  currentPageHash = 'home'
}
document.getElementById(currentPageHash).style.opacity = 1;


if (window.location.hash.length !== 0) {
  updatePage();
} else {
  document.getElementById("menu-button").classList.add("hidden");
}


window.onload = function() {
  generateSquares();

  // Animation
  if (!shouldAnimate()) {
    return;
  }

  setAnimationCookie();
};

// FAQ
let coll = document.getElementsByClassName("question");
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function(event) {
    if (this.classList.contains("active")) {
      this.classList.remove("active");
    } else {
      this.classList.add("active");
    }

    // let span = this.childNodes[1];
    // console.log(span)
    // if (span.style.transform.length === 0) {
    //   span.style.transform = "rotate(90deg)";
    // } else {
    //   span.style.transform = "";
    // }

    let content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}


//Replay Button
for (let elem of document.getElementsByClassName('replay-btn')){
  elem.onclick = function(){
    window.location.hash = 'play'
  }
}

