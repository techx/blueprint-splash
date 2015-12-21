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
    var CANV_SELS = ['#bpdb-bg-canv', '#bpdb-stroke-canv'];
    var DIMS = [500, 400]; //default canvas size
    var GRID_SIZE = 20; //in px
    var LINE_SIZE = 3; //width of the lines
    var COLORS = {
      background: '#0E95D4',
      grid: '#4EB5E6',
      foreground: '#AAE1FA'
    }; //all of the colors to be used
    var DISP_UNSMOOTHED = false;
    var SAVE_EVERY = 60*1000;

    /****************
     * working vars */
    var canvases, ctxes;
    var clickList, smoothedClicks, isDrawing;
    var hasDrawnAlready;
    var ctrlDown, startIdxs;
    var users, drawings;
    var oldDrawingId;
    var changedSinceLastSave;

    /******************
     * work functions */
    function initBlueprintDrawboard() {
      var ref = new Firebase('https://amber-inferno-6340.firebaseio.com/');
      users = ref.child('users');
      drawings = ref.child('drawings');

      //init variables
      clickList = [], smoothedClicks = [];
      hasDrawnAlready =  false, ctrlDown = false;
      startIdxs = [];
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
          canvas.height = height;
          //only want this to trigger when the canvases are ready 
          if (canvases.length === 2) render();
        });
        canvases.push(canvas);
        ctxes.push(canvas.getContext('2d'));
      });
      render();

      //autosaving
      setInterval(function() {
        saveDrawing(oldDrawingId); 
      }, SAVE_EVERY);

      //event listeners
      canvases[1].addEventListener('mousedown', function(e) {
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
      }); //init drawing on mouse down

      canvases[1].addEventListener('mousemove', function(e) {
        if (isDrawing) {
          appendClickToClicklist(e.pageX, e.pageY, true);
          render();
        }
      }); //continue drawing on mouse move

      canvases[1].addEventListener('mouseup', function(e) {
        if (isDrawing === false) return;
        isDrawing = false;
        smoothedClicks.push([e.pageX, e.pageY, true]);
        render();
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

      $('#clear-bpdb-btn').click(function(e) {
        saveDrawing(oldDrawingId);
        clearStrokes(); 
      }); //clear the drawing

      $('#save-bpdb-btn').click(function(e) {
        saveDrawing(oldDrawingId);
        //mousedown is fired on the header, adding a stroke 
        clearStrokes(startIdxs.pop()); //remove it
      }); //save the drawing
      
      window.addEventListener('beforeunload', function() {
        saveDrawing(oldDrawingId);  
      }); //save on unload

      //initial rendering
      render();
    }

    function saveDrawing(drawingId) {
      if (!changedSinceLastSave) return;

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
      return drawingId;
    }

    function drawStrokes(points, color) {
      //draw the user's strokes
      ctxes[1].strokeStyle = color;
      ctxes[1].lineJoin = 'round';
      ctxes[1].lineCap = 'round';
      ctxes[1].lineWidth = LINE_SIZE;

      //plot them
      for (var i = 0; i < points.length; i++) {
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
    }

    function clearStrokes(startIdx, stopIdx) {
      if (arguments.length === 0) oldDrawingId = false;

      startIdx = startIdx || 0;
      stopIdx = stopIdx || smoothedClicks.length;

      //delete them all
      clickList.splice(startIdx, stopIdx);
      smoothedClicks.splice(startIdx, stopIdx);
      render();
    }

    function render() {
      //paint the background
      ctxes[0].fillStyle = COLORS.background;
      ctxes[0].fillRect(0, 0, canvases[0].width, canvases[0].height);

      //clear the strokes
      ctxes[1].clearRect(0, 0, canvases[1].width, canvases[1].height);

      //draw the grid lines
      ctxes[0].fillStyle = COLORS.grid;
      for (var xi = 0; xi < canvases[0].width; xi+=GRID_SIZE) {
        ctxes[0].fillRect(xi, 0, 1, canvases[0].height);
      }
      for (var yi = 0; yi < canvases[0].height; yi+=GRID_SIZE) {
        ctxes[0].fillRect(0, yi, canvases[0].width, 1);
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
