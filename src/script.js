
// The coordinate plane will span at least this many units.  Make it an even int
let coordinateRange = 16;

// Draws grid lines for coordinate plane
function drawGrid(plane, ctx, gridSpacing) {
  ctx.strokeStyle = 'rgb(0, 0, 0)';
  ctx.lineWidth = 1;
  ctx.beginPath();

  // Draw vertical lines
  for (let x = 0; x <= plane.width; x += gridSpacing) {
    // 0.5 adjustments fix Canvas boundary mismatches, sharpening the lines
    ctx.moveTo(x+0.5, 0);
    ctx.lineTo(x+0.5, plane.height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y <= plane.height; y += gridSpacing) {
    // 0.5 adjustments fix Canvas boundary mismatches, sharpening the lines
    ctx.moveTo(0, y+0.5);
    ctx.lineTo(plane.width, y+0.5);
    ctx.stroke();
  }
}

// Draws x and y axes
function drawAxes(plane, ctx) {
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Draw axes in the middle
  ctx.moveTo(0, plane.height/2);
  ctx.lineTo(plane.width, plane.height/2);
  ctx.stroke();
  ctx.moveTo(plane.width/2, 0);
  ctx.lineTo(plane.width/2, plane.height);
  ctx.stroke();
}

// Draws the coordinate plane in the canvas element
function initPlane() {
  let plane = document.getElementById('coordinatePlane');
  // checking browser for Canvas support
  if (plane.getContext) {

    // Determine the size of the canvas and draw grid based
    // off the smaller of its dimensions
    let smallerCanvasDimension = (plane.width > plane.height) ? plane.height : plane.width;

    // Determine space between coordinates for plane at current size
    let gridSpacing = Math.round((smallerCanvasDimension / coordinateRange));

    // Resize Canvas so that lines fall on integer pixel values, preventing
    // antialiasing (the +1 handles the 0.5 adjustments in drawLines method)
    plane.height = (Math.floor(plane.height / gridSpacing) * gridSpacing) + 1;
    plane.width = (Math.floor(plane.width / gridSpacing) * gridSpacing) + 1;

    // Set line style and draw grid lines
    let ctx = plane.getContext('2d');
    drawGrid(plane, ctx, gridSpacing);
    drawAxes(plane, ctx);
  }
}

initPlane();
