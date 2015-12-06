/******************\
|     Blueprint    |
|     Draw Board   |
| @author Anthony  |
| @version 0.1     |
| @date 2015/12/06 |
| @edit 2015/12/06 |
\******************/

var BlueprintDrawBoard = (function() {
    /**********
     * config */
    var CANV_ID = 'blueprint-canv';
    var DIMS = [500, 400];

    /****************
     * working vars */
    var canvas, ctx;

    /******************
     * work functions */
    function initBlueprintDrawboard() {
      canvas = document.getElementById(canvId);
      canvas.width = DIMS[0];
      canvas.height = DIMS[1];
      ctx = canvas.getContext('2d');
      registerDynamicCanvas(canvas, function(dims) {
        console.log(JSON.stringify(dims));
        render();
      });

      render();
    }

    function render() {
      ctx.fillStyle = '#3560A0';
      ctx.fillRect(0, 0, );
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

    return { 
      init: initBlueprintDrawBoard
    };
})();

window.addEventListener('load', BlueprintDrawBoard.init);
