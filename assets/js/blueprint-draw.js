/******************\
|    Blueprint     |
|    Draw Board    |
| @author HackMIT  |
| @version 0.1     |
| @date 2015/12/06 |
| @edit 2015/12/19 |
\******************/

var BlueprintDrawboard = (function() {
    /**********
     * config */
    var CANV_SEL = '#blueprint-canv'; //the id of the canvas element
    var DIMS = [500, 400]; //default canvas size
    var GRID_SIZE = 20; //in px
    var LINE_SIZE = 3; //width of the lines
    var COLORS = {
      background: '#0E95D4',
      grid: '#4EB5E6',
      foreground: '#BFE8FB'
    }; //all of the colors to be used
    var DISP_UNSMOOTHED = false;

    /****************
     * working vars */
    var canvas, ctx;
    var clickList, smoothedClicks, isDrawing;
    var hasDrawnAlready;
    var ctrlDown, startIdxs;

    /******************
     * work functions */
    function initBlueprintDrawboard() {
      var ref = new Firebase('https://amber-inferno-6340.firebaseio.com/');
      var users = ref.child('users');
      var drawings = ref.child('drawings');

      //init variables
      clickList = [], smoothedClicks = [];
      hasDrawnAlready =  false, ctrlDown = false;
      startIdxs = [];

      //get them an id
      if (localStorage.getItem('userId') === null) {
        localStorage.setItem('userId', getNewUserId());
      }

      //set up the canvas
      canvas = $(CANV_SEL)[0];
      canvas.width = DIMS[0];
      canvas.height = DIMS[1];
      ctx = canvas.getContext('2d');
      registerDynamicCanvas(canvas, function(dims) {
        var height = $('#header-section').outerHeight();
        canvas.height = height;
        render();
      });

      //event listeneros
      var headerCont = document.getElementById('header-section');
      headerCont.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDrawing = true;
        if (!hasDrawnAlready) {
          hasDrawnAlready = true;
          $('#save-bpdb-btn')[0].style.display = 'inline';
          $('#clear-bpdb-btn')[0].style.display = 'inline';
        }
        startIdxs.push(smoothedClicks.length);
        appendClickToClicklist(e.pageX, e.pageY, false);
        render();
      });
      headerCont.addEventListener('mousemove', function(e) {
        if (isDrawing) {
          appendClickToClicklist(e.pageX, e.pageY, true);
          render();
        }
      });
      headerCont.addEventListener('mouseup', function(e) {
        isDrawing = false;
        smoothedClicks.push([e.pageX, e.pageY, true]);
        render();
      });
      document.addEventListener('keydown', function(e) {
        if (e.keyCode === 17) ctrlDown = true;
        else if (ctrlDown && e.keyCode === 90) {
          //selectively clear
          if (startIdxs.length > 0) clearStrokes(startIdxs.pop());
        }
      });
      document.addEventListener('keyup', function(e) {
        if (e.keyCode === 17) {
          setTimeout(function() { ctrlDown = false; }, 100);
        }
      });
      $('#clear-bpdb-btn').click(function(e) {
        clearStrokes(); 
      });
      $('#save-bpdb-btn').click(function(e) {
        //saves drawings
        var userId = localStorage.getItem('userId');
        var pic = getCompressedDrawing();
        pic.userId = userId; 
        var drawingId = drawings.push(pic).path.w[1];

        //update the user
        var user = users.child(userId);
        user.push(drawingId);
        
        //mousedown is fired on the header, adding a stroke 
        clearStrokes(startIdxs.pop()); //remove it
      });

      //initial rendering
      render();
    }

    function drawStrokes(points, color) {
      //draw the user's strokes
      ctx.strokeStyle = color;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = LINE_SIZE;

      //plot them
      for (var i = 0; i < points.length; i++) {
        ctx.beginPath();
        if (points[i][2] && i !== 0) {
          ctx.moveTo(points[i-1][0], points[i-1][1]);
        } else {
          ctx.moveTo(points[i][0], points[i][1]);
        }
        ctx.lineTo(points[i][0], points[i][1]);
        ctx.closePath();
        ctx.stroke();
      }
    }

    function clearStrokes(startIdx, stopIdx) {
      startIdx = startIdx || 0;
      stopIdx = stopIdx || smoothedClicks.length;

      //delete them all
      clickList.splice(startIdx, stopIdx);
      smoothedClicks.splice(startIdx, stopIdx);
      render();
    }

    function render() {
      //paint the background
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      //draw the grid lines
      ctx.fillStyle = COLORS.grid;
      for (var xi = 0; xi < canvas.width; xi+=GRID_SIZE) {
        ctx.fillRect(xi, 0, 1, canvas.height);
      }
      for (var yi = 0; yi < canvas.height; yi+=GRID_SIZE) {
        ctx.fillRect(0, yi, canvas.width, 1);
      }

      //plot the smoothed points
      if (DISP_UNSMOOTHED) {
        drawStrokes(clickList, 'red');
      }
      drawStrokes(smoothedClicks, COLORS.foreground);
    }

    /********************
     * helper functions */
    function getNewUserId() {
      return Math.random().toString(36).substring(2); 
    }

    function getCompressedDrawing() {
      var xs = smoothedClicks.map(function(click) {
        return Math.round(click[0]);  
      }); //x coords of all the clicks 
      var ys = smoothedClicks.map(function(click) {
        return Math.round(click[1]);  
      }); //y coords of all the clicks 
      var ds = smoothedClicks.map(function(click) {
        return click[2] ? '1' : '0';  
      }); //booleans communicating whether or not it's conn to prev 
      return {xs: xs, ys: ys, ds: ds}; 
    }

    function registerDynamicCanvas(canvas, every) {
      resizeCanvas(canvas, every); //initial call
      window.addEventListener('resize', function() {
        resizeCanvas(canvas, every);
      });
    }

    function resizeCanvas(canvas, every) {
      var width = canvas.parentNode.offsetWidth;
      var height = canvas.parentNode.offsetHeight;
      canvas.width = width;
      canvas.height = height;

      every([width, height]);
    }

    function appendClickToClicklist(x, y, dragging) {
      //the current click
      var currClick = [x, y, dragging];

      //calculate the smoothed click
      if (smoothedClicks.length === 0) {
        smoothedClicks.push(currClick);
      } else if (clickList.length >= 2) {
        if (clickList[clickList.length-1][2] && currClick[2]) {
          smoothedClicks.push([
            0.5*(smoothedClicks[smoothedClicks.length-1][0] + currClick[0]),
            0.5*(smoothedClicks[smoothedClicks.length-1][1] + currClick[1]),
            clickList[clickList.length-1][2]
          ]);
        } else {
          smoothedClicks.push(clickList[clickList.length-1]);
        }
      }

      //append the current click to the clicks array
      clickList.push(currClick);
    }

    return {
      init: initBlueprintDrawboard,
      clearStrokes: clearStrokes,
      getClickList: function() {return clickList;},
      getSmoothedClicks: function() {return smoothedClicks;},
      getCompressedDrawing: getCompressedDrawing
    };
})();

window.addEventListener('load', BlueprintDrawboard.init);
