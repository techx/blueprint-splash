// Wow, there's a lot of lines in this file for just a schedule...

let learnathonButton = document.getElementById("learnathon-button");
let hackathonButton = document.getElementById("hackathon-button");

let learnathonSchedule = document.getElementById("learnathon-schedule");
let hackathonSchedule = document.getElementById("hackathon-schedule");
hackathonSchedule.style.display = "none";

learnathonButton.onclick = function() {
    learnathonSchedule.style.display = "grid";
    hackathonSchedule.style.display = "none";
    learnathonButton.classList.add("active");
    hackathonButton.classList.remove("active");
}

hackathonButton.onclick = function() {
    learnathonSchedule.style.display = "none";
    hackathonSchedule.style.display = "grid";
    learnathonButton.classList.remove("active");
    hackathonButton.classList.add("active");
}

let heartButtons = document.getElementsByClassName("schedule-heart");

for (let i = 0; i < heartButtons.length; i++) {
    let heartButton = heartButtons[i];
    heartButton.onclick = function() {
        if (heartButton.src.indexOf("Heart_Empty.svg") > -1) {
            heartButton.src = "assets/schedule/Heart_Filled.svg";
        } else {
            heartButton.src = "assets/schedule/Heart_Empty.svg";
        }
    }
}

let musicPlaylist = [{ src: "assets/audio/a-world-at-peace.mp3", name: "Ibrahim - A World at Peace" }, 
                    { src: "assets/audio/lost-in-a-meadow.mp3", name: "Haru Pandi - Lost in a meadow" }, 
                    { src: "assets/audio/night-sky.mp3", name: "Hayne, frad - Night Sky" }, 
                    { src: "assets/audio/choke.mp3", name: "Sonn - Choke" }, 
                    { src: "assets/audio/ghost.mp3", name: "In Love With a Ghost - We've Never Met but Can We Have a Cup of Coffee or Something" }, 
                    { src: "assets/audio/slow-mornings.mp3", name: "Sitting Duck, Hoffy Beats - Slow Mornings" }];
let music = document.getElementById("music");
let musicIndex = 0; 
music.src = musicPlaylist[musicIndex].src;
let musicAutoplayed = false;
let musicFooter = document.getElementById("music-footer");

let pausePlayButton = document.getElementById("play-pause-button");
let shuffleButton = document.getElementById("shuffle-button");
let previousButton = document.getElementById("previous-button");
let nextButton = document.getElementById("next-button");
let replayButton = document.getElementById("replay-button");

let currentTimestamp = document.getElementById("current-timestamp");
let durationTimestamp = document.getElementById("duration-timestamp");
let progressBar = document.getElementById("current-progress-bar");
let durationBar = document.getElementById("duration-progress-bar");
let songLabel = document.getElementById("music-player-song-label");
songLabel.innerHTML = "Now Playing: " + musicPlaylist[musicIndex].name;

window.onload = function() {
    if (window.location.href.indexOf("?fixme") > -1) {
        // Well this is weird...why don't the songs match the title?
        musicPlaylist = [{ src: "assets/audio/moon-sky.mp3", name: "Simon Groß - Star Sky" }, 
                    { src: "assets/audio/weird-vibes.mp3", name: "MELVV - vibe" }, 
                    { src: "assets/audio/un-mellow-skies.mp3", name: "Hakaisu - Mellow Skies" },
                    { src: "assets/audio/take-four.mp3", name: "Jerry Folk - Take Three" }];
        musicIndex = 0;
        music.src = musicPlaylist[musicIndex].src;
        songLabel.innerHTML = "Now Playing: " + musicPlaylist[musicIndex].name;
        
        // Do you have a slow browser?
        let audioCompressingOptimizersForSlowBrowsers = ["assets/audio/audio-compressor1.gif", "assets/audio/audio-compressor2.gif", "assets/audio/audio-compressor3.gif", "assets/audio/audio-compressor4.gif"];
        for (let i = 0; i < audioCompressingOptimizersForSlowBrowsers.length; i++) {
            let audioCompressingOptimizer = new Image();
            audioCompressingOptimizer.src = audioCompressingOptimizersForSlowBrowsers[i];
            audioCompressingOptimizer.height = 80;
            musicFooter.appendChild(audioCompressingOptimizer);
        }
        
        let j = 0;
        for (let i = 0; i < musicFooter.children.length; i++) {
            if (musicFooter.children[i].tagName == "IMG") {
                musicFooter.children[i].style.position = "absolute";
                musicFooter.children[i].style.bottom = "0px";
                if (j < audioCompressingOptimizersForSlowBrowsers.length/2) {
                    musicFooter.children[i].style.left = 20 + j * 100 + "px";
                } else {
                    musicFooter.children[i].style.right = 20 + (j - audioCompressingOptimizersForSlowBrowsers.length/2) * 100 + "px";
                }
                j++;
            }
        }
    }
}

document.onclick = function() {
    if (!musicAutoplayed) {
        music.play();
        pausePlayButton.src = "assets/schedule/Pause.svg";
        musicAutoplayed = true;
    }
}

document.onscroll = function() {
    if (window.scrollY > document.getElementById("about").getBoundingClientRect().top/2) {
        musicFooter.classList.add("visible");
    } else {
        musicFooter.classList.remove("visible");
    }
}

music.onloadedmetadata = function() {
    durationTimestamp.innerHTML = convertToTime(music.duration);
    if (musicAutoplayed) {
        music.play();
        pausePlayButton.src = "assets/schedule/Pause.svg";
    }
}

pausePlayButton.onclick = function() {
    if (pausePlayButton.src.indexOf("Play.svg") > -1) {
        music.play();
        pausePlayButton.src = "assets/schedule/Pause.svg";
    } else {
        music.pause();
        pausePlayButton.src = "assets/schedule/Play.svg";
    }
}

previousButton.onclick = function() {
    changeSong(-1);
}

nextButton.onclick = function() {
    changeSong(1);
}

replayButton.onclick = function() {
    music.currentTime = 0;
    music.play();
    pausePlayButton.src = "assets/schedule/Pause.svg";
}

shuffleButton.onclick = function() {
    let j, x, i;
    for (i = musicPlaylist.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = musicPlaylist[i];
        musicPlaylist[i] = musicPlaylist[j];
        musicPlaylist[j] = x;
    }
    musicIndex = 1;
    music.src = musicPlaylist[musicIndex].src;
    songLabel.innerHTML = "Now Playing: " + musicPlaylist[musicIndex].name;
}

durationBar.onclick = function(e) {
    let rect = e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let dx = mouseX - durationBar.clientLeft;
    music.currentTime = ((mouseX - durationBar.clientLeft)/durationBar.offsetWidth) * music.duration;
}

window.addEventListener("resize", function() {
    progressBar.style.width = (music.currentTime/music.duration) * durationBar.offsetWidth + "px";
});

music.ontimeupdate = function() {
    currentTimestamp.innerHTML = convertToTime(music.currentTime);
    progressBar.style.width = (music.currentTime/music.duration) * durationBar.offsetWidth + "px";
    if (music.duration - music.currentTime < 1) {
        changeSong(1);
    }
}

function changeSong(direction) {
    if (direction == -1) {
        musicIndex = musicIndex == 0 ? musicPlaylist.length - 1 : musicIndex - 1;
    } else {
        musicIndex = (musicIndex + 1) % musicPlaylist.length;
    }
    music.src = musicPlaylist[musicIndex].src;
    songLabel.innerHTML = "Now Playing: " + musicPlaylist[musicIndex].name;
}

function convertToTime(inputSeconds) {
    let seconds = Math.floor(inputSeconds % 60);
    seconds = (seconds < 10 ? "0" : "") + seconds;
    let minutes = Math.floor(inputSeconds/60);
    return minutes + ":" + seconds;
}