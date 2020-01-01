function moveRegisterIn() {
	var red = document.getElementById("redBar")
	var yellowB = document.getElementById("thinYellowB")
	var blueB = document.getElementById("boldLightBlueB")

	var posRed = -825
	var posYellowB = -725
	var posBlueB = -770

	var idRed = setInterval(frame, 10);
	var idYellowB = setInterval(frame, 10);
	var idBlueB = setInterval(frame, 10);

	function frame() {
		if (posRed == -645) {
	      clearInterval(idRed);
	    } else {
	      posRed+=3; 
	      red.style.left = posRed + 'px'; 
	    }

	    if (posYellowB == -55) {
	      clearInterval(idYellowB);
	    } else {
	      posYellowB+=10; 
	      yellowB.style.left = posYellowB + 'px'; 
	    }

	    if (posBlueB == -526) {
	      clearInterval(idBlueB);
	    } else {
	      posBlueB+=4; 
	      blueB.style.left = posBlueB + 'px'; 
	    }
	}
}

function moveRegisterOut() {
	var red = document.getElementById("redBar")
	var yellowB = document.getElementById("thinYellowB")
	var blueB = document.getElementById("boldLightBlueB")

	var posRed = -825
	var posYellowB = -725
	var posBlueB = -770

	var idRed = setInterval(frame, 10);
	var idYellowB = setInterval(frame, 10);
	var idBlueB = setInterval(frame, 10);

	function frame() {
		if (posRed == -645) {
	      clearInterval(idRed);
	    } else {
	      posRed+=3; 
	      red.style.left = posRed + 'px'; 
	    }

	    if (posYellowB == -55) {
	      clearInterval(idYellowB);
	    } else {
	      posYellowB+=10; 
	      yellowB.style.left = posYellowB + 'px'; 
	    }

	    if (posBlueB == -526) {
	      clearInterval(idBlueB);
	    } else {
	      posBlueB+=4; 
	      blueB.style.left = posBlueB + 'px'; 
	    }
	}
}