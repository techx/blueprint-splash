function getChild(arr, clss){
  for(let i=0; i < arr.length; i++){
    if (arr[i].className === clss){
      return arr[i]
    }
  }
}

// FAQ selectors
document.addEventListener('keydown', handleFaq)

const faqItems = document.getElementsByClassName("faq-q")
var currentFaq = 0

for(let i=0; i < faqItems.length; i++){
  faqItems[i].onmouseover = function(){
    // console.log(document.getElementById("faq").onscroll)
    playSound("menu_change")
    for (let j of faqItems){
      j.style.color = "#fff"
    }
    faqItems[i].style.color = '#4699d3'
    currentFaq = i
  }
  faqItems[i].onclick = function(){
    // console.log("bruh2")
    playSound("expand")
    if(faqItems[i].childNodes[1].style.transform === ""){
      faqItems[i].childNodes[1].style.transform = "rotate(90deg)"
    }
    else{
      faqItems[i].childNodes[1].style.transform = ""
    }
  }
}

function handleFaq(e){
  oldFaq = currentFaq;
  if(window.location.hash.substring(1) === 'faq'){
    if(e.key === "ArrowUp"){
      playSound("menu_change")
      currentFaq= (faqItems.length + currentFaq - 1) % faqItems.length
    }
    else if(e.key === "ArrowDown"){
      playSound("menu_change")
      currentFaq = (faqItems.length + currentFaq + 1) % faqItems.length
    }
    else if(e.key === "Enter") {
      faqItems[currentFaq].click()
      // console.log("FAQ CLICK")
    }
    // console.log(oldFaq, currentFaq)
    faqItems[oldFaq].style.color = '#fff'
    faqItems[currentFaq].style.color = '#4699d3'
    // console.log(faqItems[currentFaq], faqItems[currentFaq] === document.activeElement)
  }
}

//***** Menu selectors *****
const allItems = {'home':["menu-play","menu-register","menu-schedule","menu-faq","menu-about"],
                  'schedule':["schedule-learn", "schedule-hack"],
                  'about':["about-learn","about-hack"]}
var currentSelected = {"home": 0, "schedule": 0, "about": 0}

for (let [key, menuItems] of Object.entries(allItems)){
  for(let i=0; i < menuItems.length; i++){
    let item = document.getElementById(menuItems[i])
    item.onmouseover = function(){
      playSound("menu_change")
      for (let j=0; j < menuItems.length; j++){
        el = document.getElementById(menuItems[j])
        selector = getChild(el.childNodes, "selected")
        if(selector.parentNode == item){
          selector.style.opacity = 1;
          el.classList.add("hover")
          let newIdx = menuItems.indexOf(selector.parentNode.id)
          if(newIdx !== -1){ currentSelected[key] = newIdx }
        }
        else {
          selector.style.opacity = 0;
          el.classList.remove("hover")
        }
      }
    }
    if(key !== 'home'){
      item.onclick = function(){
        // console.log("bruh1")
        playSound("expand")
        if(item.childNodes[3].style.transform === "rotate(90deg)"){
          item.childNodes[3].style.transform = ""
        }
        else { 
          item.childNodes[3].style.transform = "rotate(90deg)"
        }
      }
    }
    else{ 
      item.onclick = function(){ playSound("select")}
    }
  }
}

document.addEventListener('keydown', handleMenu);

function handleMenu(e){
  // console.log(e.key)
  let url = window.location.hash.substring(1);
  if(url === ""){ url="home" }
  let oldSelected = currentSelected[url]
  if(Object.keys(allItems).includes(url) && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter")){
    menuItems = allItems[url]
    if(e.key === "ArrowUp"){
      currentSelected[url] = (menuItems.length + currentSelected[url] - 1) % menuItems.length
      playSound("menu_change")
    }
    else if(e.key === "ArrowDown"){
      currentSelected[url] = (menuItems.length + currentSelected[url] + 1) % menuItems.length
      playSound("menu_change")
    }
    else if(e.key === "Enter" && (url !== 'register' && url !== 'play')) {     
      bruh = document.getElementById(menuItems[currentSelected[url]])
      // console.log(bruh)
      bruh.click()
    }
    // console.log(oldSelected, document.getElementById(menuItems[currentSelected[url]]).childNodes)
    oldItem = document.getElementById(menuItems[oldSelected])
    oldItem.childNodes[3].style.opacity = 0;
    oldItem.classList.remove("hover")
    newItem = document.getElementById(menuItems[currentSelected[url]])
    newItem.childNodes[3].style.opacity = 1;
    newItem.classList.add("hover")
  }
  else if(e.key === "Escape"){
    const menuButton = document.getElementById("menu-button");
    if(!menuButton.classList.contains("hidden")){
      menuButton.click()
    }

  }
}




document.getElementById('win-button').onclick

document.addEventListener('keydown', handleReplay);
function handleReplay(e){
  url = window.location.hash.substring(1)
  if(e.key === "Enter" && (url === 'lose' || url === 'win')){
    document.getElementById('win-button').click()
  }
}
