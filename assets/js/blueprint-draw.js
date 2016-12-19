/******************\
|    Blueprint     |
|    Draw Board    |
| @author HackMIT  |
| @version 0.1     |
| @date 2015/12/06 |
| @edit 2015/12/21 |
\******************/

var BlueprintDrawboard = (function() {
    /**********
     * config */
    var CANV_SELS = ['#bpdb-bg-canv', '#bpdb-stroke-canv'];
    var DIMS = [500, 400]; //default canvas size
    var GRID_SIZE = 40; //in px
    var LINE_SIZE = 3; //width of the lines
    var MIN_DIST = 8; //minimum separation between waypoints
    var COLORS = {
      background: '#217ACC',
      grid: '#6EA8DD',
      foreground: '#FFFFFF',
      yellow: '#FDE74C',
      green: '#6DCC36',
      blue: '#11AFFF'
    }; //all of the colors to be used
    var DISP_UNSMOOTHED = false;
    var FIREBASE_URL = 'https://luminous-heat-4368.firebaseio.com/';
    var BOTTOM_BORDER_HT = 8; //in px

    /****************
     * working vars */
    var canvases, ctxes;
    var clickList, smoothedClicks, isDrawing;
    var hasDrawnAlready;
    var ctrlDown, startIdxs;
    var lastIdxDrawn;
    var users, drawings;
    var oldDrawingId;
    var changedSinceLastSave;
    var currentColor = COLORS.yellow;

    /******************
     * work functions */
    function initBlueprintDrawboard() {
      var ref = new Firebase(FIREBASE_URL);
      users = ref.child('users');
      drawings = ref.child('drawings');

      //init variables
      clickList = [], smoothedClicks = [];
      hasDrawnAlready =  false, ctrlDown = false;
      isDrawing = false;
      startIdxs = [];
      lastIdxDrawn = 0;
      oldDrawingId = false;
      changedSinceLastSave = false;
      canvases = [], ctxes = [];

      //get them an id
      if (localStorage.getItem('userId') === null) {
        localStorage.setItem('userId', getNewUserId());
      }

      //set up the canvases
      CANV_SELS.forEach(function(CANV_SEL) {
        var canvas = $(CANV_SEL)[0];
        canvas.width = DIMS[0];
        canvas.height = DIMS[1];
        registerDynamicCanvas(canvas, function(dims) {
          var height = $('#header-section').outerHeight();
          var m = 1;
          if (CANV_SEL ==='#bpdb-bg-canv') {
            m = 2;
          }
          canvas.height = m*(height - BOTTOM_BORDER_HT);
          canvas.width = canvas.width*m/2;
          lastIdxDrawn = 0; //because it resized
          //only want this to trigger when the canvases are ready
          if (canvases.length === 2) render(lastIdxDrawn);
        });
        canvases.push(canvas);
        ctxes.push(canvas.getContext('2d'));
      });
      render(lastIdxDrawn);

      //event listeners
      canvases[1].addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDrawing = true;
        if (!hasDrawnAlready) {
          hasDrawnAlready = true;
          $('#bpdb-btn-cont')[0].style.display = 'inline';
        }
        startIdxs.push(smoothedClicks.length);
        appendClickToClicklist(e.pageX, e.pageY, false);
        render(lastIdxDrawn);
      }); //init drawing on mouse down

      canvases[1].addEventListener('mousemove', function(e) {
        if (isDrawing) {
          appendClickToClicklist(e.pageX, e.pageY, true);
          render(lastIdxDrawn);
        }
      }); //continue drawing on mouse move

      canvases[1].addEventListener('mouseup', function(e) {
        if (isDrawing === false) return;
        isDrawing = false;
        smoothedClicks.push([e.pageX, e.pageY, true]);
        render(lastIdxDrawn);
      }); //stop drawing on mouse up

      document.addEventListener('keydown', function(e) {
        if (e.keyCode === 17) ctrlDown = true;
        else if (ctrlDown && e.keyCode === 90) {
          //selectively clear
          if (startIdxs.length > 0) clearStrokes(startIdxs.pop());
        }
      }); //deal with ctrl stuff

      document.addEventListener('keyup', function(e) {
        if (e.keyCode === 17) {
          setTimeout(function() { ctrlDown = false; }, 100);
        }
      }); //ctrl z happens here

      $('.yellow-color-option').click(function(e) {
        $('.color-option').removeClass("selected-color");
        $('.yellow-color-option').addClass("selected-color");
        currentColor = COLORS.yellow;
      });

      $('.green-color-option').click(function(e) {
        $('.color-option').removeClass("selected-color");
        $('.green-color-option').addClass("selected-color");
        currentColor = COLORS.green;
      });

      $('.blue-color-option').click(function(e) {
        $('.color-option').removeClass("selected-color");
        $('.blue-color-option').addClass("selected-color");
        currentColor = COLORS.blue;
      });

      $('#clear-bpdb-btn').click(function(e) {
        clearStrokes();
      }); //clear the drawing

      $('#undo-bpdb-btn').click(function(e) {
        if (startIdxs.length > 0) clearStrokes(startIdxs.pop());
      }); //undo the last stroke

      $('#save-bpdb-btn').click(function(e) {
        saveDrawing(oldDrawingId, true);
      }); //save the drawing

      //initial rendering
      render(lastIdxDrawn);
    }

    function saveDrawing(drawingId, animated) {
      if (!changedSinceLastSave) {
        if (animated) {
          $('#save-bpdb-btn').addClass('animated tada');
          window.setTimeout(function() {
            $('#save-bpdb-btn').removeClass('animated tada');
          }, 1000);
        }
        return;
      }

      var userId = localStorage.getItem('userId');
      var pic = getCompressedDrawing();
      pic.userId = userId;
      pic.dateCreated = +new Date();
      if (!drawingId) {
        drawingId = drawings.push(pic).path.w[1];
        //update the user
        var user = users.child(userId);
        user.push(drawingId);
      } else {
        var drawing = drawings.child(drawingId);
        drawing.set(pic);
      }
      oldDrawingId = drawingId;
      changedSinceLastSave = false;
      if (animated) {
        $('#save-bpdb-btn').addClass('fly');
        window.setTimeout(function() {
          $('#save-bpdb-btn').removeClass('fly');
        }, 1500);
      }
      return drawingId;
    }

    function drawStrokes(points, color, startIdx) {
      //draw the user's strokes
      ctxes[1].strokeStyle = color;
      ctxes[1].lineJoin = 'round';
      ctxes[1].lineCap = 'round';
      ctxes[1].lineWidth = LINE_SIZE;

      //plot them
      for (var i = startIdx; i < points.length; i++) {
        ctxes[1].beginPath();
        if (points[i][2] && i !== 0) {
          ctxes[1].moveTo(points[i-1][0], points[i-1][1]);
        } else {
          ctxes[1].moveTo(points[i][0], points[i][1]);
        }
        ctxes[1].lineTo(points[i][0], points[i][1]);
        ctxes[1].closePath();
        ctxes[1].stroke();
      }
      lastIdxDrawn = points.length;
    }

    function clearStrokes(startIdx, stopIdx) {
      if (arguments.length === 0) oldDrawingId = false;

      startIdx = startIdx || 0;
      stopIdx = stopIdx || smoothedClicks.length;

      //clear the canvas
      ctxes[1].clearRect(0, 0, canvases[1].width, canvases[1].height);

      //delete them all
      clickList.splice(startIdx, stopIdx);
      smoothedClicks.splice(startIdx, stopIdx);
      lastIdxDrawn = 0; //redraw everything
      render(lastIdxDrawn);
    }

    function render(startIdx) {
      startIdx = startIdx || 0;

      //paint the background
      ctxes[0].fillStyle = COLORS.background;
      ctxes[0].fillRect(0, 0, canvases[0].width, canvases[0].height);

      //draw the grid lines
      ctxes[0].fillStyle = COLORS.grid;
      ctxes[0].strokeStyle = COLORS.grid;
      ctxes[0].lineWidth = 1;
      var sqrt = Math.sqrt(3);
      ctxes[0].beginPath();
      for (var xi = - canvases[0].height; xi< canvases[0].height + canvases[0].width; xi+=2*GRID_SIZE/sqrt) {
        ctxes[0].moveTo(xi, 0);
        ctxes[0].lineTo(xi+canvases[0].height/sqrt, canvases[0].height);
        ctxes[0].moveTo(xi,0);
        ctxes[0].lineTo(xi-canvases[0].height/sqrt, canvases[0].height);
      }
      ctxes[0].stroke();
      for (var yi = 0; yi < canvases[0].height; yi+=GRID_SIZE) {
        ctxes[0].fillRect(0, yi, canvases[0].width, 1);
      }

      //plot the smoothed points
      if (DISP_UNSMOOTHED) {
        drawStrokes(clickList, 'red', startIdx);
      }
      drawStrokes(smoothedClicks, currentColor, startIdx);
    }

    /********************
     * helper functions */
    function getNewUserId() {
      return Math.random().toString(36).substring(2);
    }

    function getCompressedDrawing() {
      //prune the list of excessively close clicks
      var prunedClicks = [];
      for (var ai = 0; ai < smoothedClicks.length; ai++) {
        //add the first click no matter what
        if (ai === 0) {
          prunedClicks.push(smoothedClicks[ai]);
          continue;
        }

        //otherwise add it if it's far enough way or if it starts a stroke
        var currClick = smoothedClicks[ai];
        var prev = prunedClicks[prunedClicks.length-1];
        var dist = Math.sqrt(
          Math.pow(currClick[0] - prev[0], 2) +
          Math.pow(currClick[1] - prev[1], 2) 
        );
        if (dist > MIN_DIST || !currClick[2]) {
          prunedClicks.push(currClick);
        }
      }

      //go through and gather all the values
      var xs = prunedClicks.map(function(click) {
        return Math.round(click[0]);
      }); //x coords of all the clicks
      var ys = prunedClicks.map(function(click) {
        return Math.round(click[1]);
      }); //y coords of all the clicks
      var ds = prunedClicks.map(function(click, idx) {
        return click.concat(idx); //append each click's index
      }).filter(function(click) {
        return !click[2]; //only get the non-continuous ones
      }).map(function(click) {
        return click[3]; //get the continuity boolean
      }); //result is the indices of clicks not connected to previous clicks 
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
      canvas.width = 2*width;
      canvas.height = 2*height;
      
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
          var modifiedClick = clickList[clickList.length-1].slice(0);
          modifiedClick[2] = false;
          smoothedClicks.push(modifiedClick);
        }
      }

      //append the current click to the clicks array
      clickList.push(currClick);
      changedSinceLastSave = true;
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
