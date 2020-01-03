/** VARIABLES **/


// CONSTANTS
let gameWidth = 0
let gameHeight = 0
const framesPerSecond = 50

const paddleDeltaH = 70 // distance paddle is above bottom of screen
const paddleAspect = 7.334 // aspect radtio of paddle asset
const paddleYR = 10 
paddleY = () => { return gameHeight - paddleDeltaH }
paddleXR = () => { // computed variable: "x radius" of the ball (i.e. width / 2)
	return paddleYR * paddleAspect
}

const ballR = 20
const ballStartDeltaH = 40 // start of ball in pixels above paddle

ballCollisionH = () => { // the y coordinate of the center of the ball that represents collision with the paddle
	return paddleY() - (paddleYR + ballR) 
}
paddleBottom = () => { return paddleY() + (paddleYR + ballR)}

const vertBlocks = 5
const horizBlocks = 21
boxSize = () => { return logoRect.height / vertBlocks } // the dimension of the boxes the logo is cut into

// SVG ASSETS
let ballSvg = new Image()
ballSvg.src = ('./assets/SVG/ball.svg')

let paddleSvg = new Image()
paddleSvg.src = ('./assets/SVG/bar.svg')

let logoSvg = new Image()
logoSvg.src = ('./assets/SVG/blueprintlogo.svg')

// GAME VARIABLES
let score = 0

let canvas, context, listener

let ballX, ballY

// get top corner of ball for drawing
ballDrawX = () => { return ballX - ballR }
ballDrawY = () => { return ballY - ballR }

let ballVx, ballVy

let paddleX

// get top corner of paddle for drawing
paddleDrawX = () => { return paddleX - paddleXR() }
paddleDrawY = () => { return paddleY() - paddleYR }


let logoRect //dom rect object giving bounds of logo
logoTopX = () => {
	return logoRect.x - ((boxSize() * horizBlocks) - (logoRect.width)) / 2 
}

let brokenBlocks = []
let totalBroken = []

let animationTick = 0
let animationRepeat = 3
let animationInterval = 17
let animationOn = 7

/** WINDOW FUNCTIONS **/
function startBrickGame() {
	for (var i = 0; i < vertBlocks; i++) {
		let row = []
		for (var j = 0; j < horizBlocks; j++) {  row.push(false) }
		brokenBlocks.push(row)
	}

	canvas = document.getElementById('brickerbreaker-canvas')
	context = canvas.getContext('2d')

	animationTick = 0
	totalBroken = 0

	fixCanvasDim()
	resetGame()

	stopGame()

  	listener = setInterval(gameTick, 1000/framesPerSecond)
  	canvas.addEventListener('mousemove', updateMousePos)
}

function resetBricks() {
	brokenBlocks = []
	const topIncluded = [0,1,3,14,15,19]
	const bottomIncluded = [10]
	for (let i = 0; i < vertBlocks; i++) {
		let row = []
		for (let j = 0; j < horizBlocks; j++) {  
			if ((i == 0 && !topIncluded.includes(j)) || (i == vertBlocks-1 && !bottomIncluded.includes(j))) {
				row.push(true) 
				totalBroken++

			} else {
				row.push(false)
			}
		}
		brokenBlocks.push(row)
	}
}

function resetGame() {
	resetBricks()

	ballX = gameWidth/2
	ballY = ballCollisionH() - ballStartDeltaH

	paddleX = gameWidth/2

	ballVx = 0
	ballVy = 10
}

window.onresize = function(event) {
    if (window.location.hash.substring(1) !== "play") {
        return
    }

    fixCanvasDim()
}

function fixCanvasDim() {
	gameWidth =  window.innerWidth
	canvas.width = gameWidth
	gameHeight = window.innerHeight
	canvas.height = gameHeight

	const homeElem = document.getElementById('home')
    homeElem.classList.remove("hidden");
	logoRect = document.getElementById('main-logo').getBoundingClientRect()
    homeElem.classList.add("hidden");
}

function gameTick() {
	animationTick++

	positionUpdate()
	drawScene()
	updateScore()
}

function updateMousePos(event){
	var rect = canvas.getBoundingClientRect();
  	var root = document.documentElement;

 	mouseX = event.clientX - rect.left - root.scrollLeft;
  	mouseY = event.clientY - rect.top - root.scrollTop;

  	//check that in bounds
  	mouseX = Math.min(Math.max(paddleXR(), mouseX), gameWidth - paddleXR())
  	paddleX = mouseX
}

/** WIN/LOSS STATE **/
function lostGame() {
	playSound('lose-sound')
	window.location.hash = 'lose'
	document.getElementById('blocks-left').innerHTML = String((vertBlocks * horizBlocks) - totalBroken).padStart(2, '0')
	stopGame()
}

function wonGame() {
	playSound('win-sound')
	window.location.hash = 'win'
	document.getElementById('score').innerHTML = Math.round(((animationTick) / 30) * 10) / 10
	stopGame()
}

function stopGame() {

	if (listener) {
		clearInterval(listener)
	}
}


/** GAME UPDATES **/
function positionUpdate() {
	updateBall()
	true === true
}

function updateBall() {
	// update position based on velocity
	ballX += ballVx
	ballY += ballVy

	// check for collision
	updateBounds()
	updatePaddleCollision()
	updateBoxes() //checkLogoCollision()
}

function updateBounds() {
	if (ballY >= gameHeight) {
		//lost game
		lostGame()
	} else if (ballY <= 0) {
		ballVy = -ballVy
	} else if (ballX <= 0 || ballX >= gameWidth) {
		ballVx = -ballVx
	}
}

function updatePaddleCollision() {
	ballYCollides = ballY >= ballCollisionH() && ballY <= paddleBottom()

	ballXCollides = (ballX + ballR >= paddleX - paddleXR()) && (ballX - ballR <= paddleX + paddleXR())
	if (ballXCollides && ballYCollides) {
		playSound("paddle")
		// update y
		ballY = ballCollisionH()
		ballVy = -ballVy

		// update x
		distFromMiddle = ballX - paddleX
		ballVx = 0.1 * distFromMiddle
	}
}

function updateBoxes() {
	const boxHeight = boxSize() * vertBlocks
	const boxWidth = boxSize() * horizBlocks
	const yInBox = ballY + ballR > logoRect.y && ballY - ballR < logoRect.y + boxHeight
	const xInBox = ballX + ballR > logoTopX() && ballY - ballR < logoTopX() + boxWidth

	if (yInBox && xInBox) {
		let flips = [0, 0]
		brokenBlocks.forEach((row, r_index) => {
			row.forEach((broken, c_index) => {
				//check whether block is there
				if (!broken) {
					let blockTopX = logoTopX() + boxSize() * c_index
					let blockTopY = logoRect.y + boxSize() * r_index
					let rect = rectInCircle(ballX, ballY, ballR, blockTopX, blockTopY, boxSize())
					if (rect !== null) {
						playSound("break")
						brokenBlocks[r_index][c_index] = true
						score++
						totalBroken++

						//update which ones to flip
						if (flips[0] == flips[1]) {
							flips = rect
						}

					}
				}
			})
		})

		if (flips[0] == 1) {
			ballVx = - ballVx
		}
		if (flips[1] == 1) {
			ballVy = - ballVy
		}
	}

	if (totalBroken >= vertBlocks * horizBlocks) {
		wonGame()
	}
}

/** GEOMETRY **/
function rectInCircle(cx, cy, rad, x, y, width) {
	let res = [vertLineIntCircle(cx, cy, width, x, y, rad), vertLineIntCircle(cx, cy, width, x + width, y, rad), horizLineIntCircle(cx, cy, width, x, y, rad), horizLineIntCircle(cx, cy, width, x, y + width, rad)]
	for (let i = 0; i < res.length; i++) {
		if (res[i] !== null) {
			return res[i]
		}
	}

	const corners = [[0, 0], [0, 1], [1, 0], [1, 1]]
	for (let i = 0; i < corners.length; i++) {
		corner = corners[i]

		const xCoord = x + corner[0] * width
		const yCoord = y + corner[1] * width

		let inCircle = pointInCircle(xCoord, yCoord, cx, cy, rad)
		if (inCircle !== null) {
			return inCircle
		}
	}

	return pointInGridCell(cx, cy, x, y, width)
}

function vertLineIntCircle(cx, cy, width, x, y, rad) {
	if (Math.abs(cx - x) <= rad && (y < cy && y + width >= cy)) {
		// flip just x
		return [1, 0]
	}
	return null
}

function horizLineIntCircle(cx, cy, width, x, y, rad) {
	if (Math.abs(cy - y) <= rad && (x < cx && x + width >= cx)) {
		// flip just y
		return [0, 1]
	}
	return null
}

function pointInGridCell(xCoord, yCoord, x, y, width) {
	let xInside = xCoord >= x && xCoord <= x + width
	let yInside = yCoord >= y && yCoord <= y + width
	if (xInside && yInside) {
		// flip both x and y
		return [1, 1]
	}
	return null
}

function pointInCircle(x, y, cx, cy, radius) {
	let dist = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2))
	if (dist <= radius) {
		// flip both x and y
		return [1, 1]
	}
	return null
}

/** DRAWING **/
const borderTolerance = 0.5

function clearWithTolerance(context, top, bot, width, height) {
	context.clearRect(top + borderTolerance/2, bot + borderTolerance/2, width + borderTolerance, height + borderTolerance)
}

function drawScene() {
	context.clearRect(0, 0, canvas.width, canvas.height)
	drawLogo()
	clearSquares()

	context.clearRect(logoTopX(), logoRect.y + boxSize() * (vertBlocks), boxSize() * horizBlocks, 10)
	context.clearRect(logoTopX(), logoRect.y - 10, boxSize() * horizBlocks, 10)


	if (animationTick % animationInterval <= animationOn && animationTick < animationRepeat * animationInterval) {
		drawGrid()
	}

	drawPaddle()
	drawBall()
}

function clearSquares() {
	brokenBlocks.forEach((row, r_index) => {
		row.forEach((broken, c_index) => {
			if (broken) {
				clearSquare(r_index, c_index)
			}
		})
	})
}

function drawGrid() {
	brokenBlocks.forEach((row, r_index) => {
		row.forEach((broken, c_index) => {
			if (!broken) {
				context.lineWidth = 0.75
				context.strokeStyle = '#ffffff'
				strokeSquare(r_index, c_index)
			}
		})
	})
}

function drawSquare(row, col) {
	topX = logoTopX() + boxSize() * col
	topY = logoRect.y + boxSize() * row
	context.fillRect(topX, topY, boxSize(), boxSize())
}

function strokeSquare(row, col) {
	topX = logoTopX() + boxSize() * col
	topY = logoRect.y + boxSize() * row
	context.strokeRect(topX, topY, boxSize(), boxSize())
}

function clearSquare(row, col) {
	topX = logoTopX() + boxSize() * col
	topY = logoRect.y + boxSize() * row
	clearWithTolerance(context, topX, topY, boxSize(), boxSize())
}


function drawPaddle() {
	context.drawImage(ballSvg, ballDrawX(), ballDrawY(), ballR * 2, ballR * 2)
}

function drawBall() {
	context.drawImage(paddleSvg, paddleDrawX(), paddleDrawY(), paddleXR() * 2, paddleYR * 2)
}

function drawLogo() {
	context.drawImage(logoSvg, logoRect.x, logoRect.y, logoRect.width, logoRect.height)
}



// SCORE

function updateScore(){
	// Update time
	elems = document.getElementsByClassName("game-time")
	for (const e of elems){
		e.innerHTML = Math.round(((animationTick) / 30))
	}
	// Update blocks left
	elems = document.getElementsByClassName("blocks-left")
	for (const e of elems){
		e.innerHTML = String((vertBlocks * horizBlocks) - totalBroken).padStart(2, '0')
	}
}

