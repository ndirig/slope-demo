
// The coordinate plane will span at least this many units.  Make it an even int
let coordinateRange = 16;

// Canvas for coordinate plane
let plane = document.getElementById('coordinatePlane');

// Pixels between coordinates for plane at current size
let gridSpacing = 0;

// Draws grid lines for coordinate plane
function drawGrid(ctx, gridSpacing) {
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
function drawAxes(ctx) {
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

// Prepares coordinate plane for drawing
function initPlane(width, height) {
  // Set starting dimensions for canvas.  Will be tweaked later
  plane.width = width;
  plane.height = height;
  // checking browser for Canvas support
  if (plane.getContext) {
    // Determine the size of the canvas and draw grid based
    // off the smaller of its dimensions
    let smallerCanvasDimension = (width > height) ? height : width;

    // Determine space between coordinates for plane at current size
    gridSpacing = Math.floor((smallerCanvasDimension / coordinateRange));

    // Resize Canvas so that lines fall on integer pixel values, preventing
    // antialiasing (the +1 handles the 0.5 adjustments in drawLines method)
    plane.height = (Math.round(height / gridSpacing) * gridSpacing) + 1;
    // Don't ask me why I'm using floor now.. this ensures axes are centered
    plane.width = (Math.floor(width / gridSpacing) * gridSpacing) + 1;

    // Draws the coordinate plane
    redraw();
  }
}

// Draws the coordinate plane
function redraw() {
  // Set line style and draw grid lines
  let ctx = plane.getContext('2d');
  // erases previous point position
  ctx.clearRect(0, 0, plane.width, plane.height);
  drawGrid(ctx, gridSpacing);
  drawAxes(ctx);
}

function update(mouseX, mouseY) {
  // checking browser for Canvas support
  if (plane.getContext) {
    let ctx = plane.getContext('2d');
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 2, 0, 2 * Math.PI, true);
    ctx.fillStyle = "#FF6A6A";
    ctx.fill();
    requestAnimationFrame(update);
  }
}

// Gets the screen position of mouse, adjusting for canvas position
function getMousePosition(e) {
  let mouseX = e.offsetX;
  let mouseY = e.offsetY;
  redraw();
  update(mouseX, mouseY);
}

// takes width and height as args
initPlane(832,855);
plane.addEventListener("mousemove", getMousePosition, false);
