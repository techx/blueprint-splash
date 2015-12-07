/******************\
|     Blueprint    |
|     Draw Board   |
| @author HackMIT  |
| @version 0.1     |
| @date 2015/12/06 |
| @edit 2015/12/07 |
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
      foreground: '#FEFEFE'
    }; //all of the colors to be used
    var DISP_UNSMOOTHED = false;

    /****************
     * working vars */
    var canvas, ctx;
    var clickList, smoothedClicks, isDrawing;

    /******************
     * work functions */
    function initBlueprintDrawboard() {
      //init variables
      clickList = [], smoothedClicks = [];

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

      //event listeners
      document.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDrawing = true;
        appendClickToClicklist(e.pageX, e.pageY, false);
        render();
      });
      document.addEventListener('mousemove', function(e) {
        if (isDrawing) {
          appendClickToClicklist(e.pageX, e.pageY, true);
          render();
        }
      });
      document.addEventListener('mouseup', function(e) {
        isDrawing = false;
        render();
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
      init: initBlueprintDrawboard
    };
})();

window.addEventListener('load', BlueprintDrawboard.init);
