// FAQ: selecting question
let coll = document.getElementsByClassName("question");

for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function(event) {
    
    let content = this.nextElementSibling;
    if (content.style.maxHeight) {
      this.firstChild.nextElementSibling.style.transform = ""
      content.style.maxHeight = null;
    } else {
      this.firstChild.nextElementSibling.style.transform = "rotate(360deg)"
      content.style.maxHeight = content.scrollHeight + "px";
    }
    for (let j = 0; j < coll.length; j++) {
      const element = coll[j]
      let content = element.nextElementSibling;
      if (j !== i && content.style.maxHeight) {
        element.firstChild.nextElementSibling.style.transform = ""
        content.style.maxHeight = null;
      }
    }
  });
}

// resize function FAQ answers
window.onresize = function(event) {
  let coll = document.getElementsByClassName("question");
  for (let i = 0; i < coll.length; i++) {
    if (coll[i].classList.contains("active")){
      let content = coll[i].nextElementSibling;
      content.style.maxHeight = content.scrollHeight + "px";
    }
  }
} 