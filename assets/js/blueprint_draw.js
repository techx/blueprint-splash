/******************\
|     Blueprint    |
|     Draw Board   |
| @author Anthony  |
| @version 0.1     |
| @date 2015/12/06 |
| @edit 2015/12/06 |
\******************/

var BlueprintDrawboard = (function() {
    /**********
     * config */
    var CANV_ID = 'blueprint-canv'; //the id of the canvas element
    var DIMS = [500, 400]; //default canvas size
    var GRID_SIZE = 20; //in px
    var COLORS = {
      background: '#0E95D4',
      grid: '#4EB5E6',
      foreground: '#FEFEFE'
    }; //all of the colors to be used

    /****************
     * working vars */
    var canvas, ctx;
    var clickX=new Array();
    var clickY=new Array();
    var clickDrag = new Array();
    var paint;


    /******************
     * work functions */
    function initBlueprintDrawboard() {
      canvas = document.getElementById(CANV_ID);
      canvas.width = DIMS[0];
      canvas.height = DIMS[1];
      ctx = canvas.getContext('2d');
      registerDynamicCanvas(canvas, function(dims) {
        console.log(JSON.stringify(dims));
        render();
      });
      render();
      document.addEventListener("mousedown", function(e)
      {
        e.preventDefault();
        var mouseX=e.pageX;
        var mouseY=e.pageY;
        paint=true;
        addClick(mouseX, mouseY, false);
        redraw();
      });
      document.addEventListener("mousemove", function(e){
        if (paint){
          addClick(e.pageX, e.pageY, true);
          redraw();
        }
      });
      document.addEventListener("mouseup", function(e){
        paint=false;
        redraw();
      });
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
      // var height = canvas.parentNode.offsetHeight;
      var height = $('#header-section').outerHeight();
      canvas.width = width;
      canvas.height = height;

      every([width, height]);
    }

    function addClick(x,y, dragging)
    {
      clickX.push(x);
      clickY.push(y);
      clickDrag.push(dragging);
    }
    function redraw()
    {
      ctx.strokeStyle="#bce3f6";
      ctx.lineJoin="round";
      ctx.lineCap="round";
      ctx.lineWidth= 3;
      for(var i=0;i<clickX.length;i++)
      {
        ctx.beginPath();
        if(clickDrag[i]&&i){
          ctx.moveTo(clickX[i-1], clickY[i-1]);
        }else{
          ctx.moveTo(clickX[i]-1, clickY[i]);
        }
        ctx.lineTo(clickX[i], clickY[i]);
        ctx.closePath();
        ctx.stroke();
      }
    }

    return {
      init: initBlueprintDrawboard
    };
})();

window.addEventListener('load', BlueprintDrawboard.init);