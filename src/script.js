
// The coordinate plane will span at least this many units.  Make it an even int
let coordinateRange = 16;

// Canvas for coordinate plane
let plane = document.getElementById('coordinatePlane');

// Pixels between coordinates for plane at current size
let gridSpacing = 0;

// Keeps track of mouse position
let mouseX = 0;
let mouseY = 0;

// Offset to account for radius of pinned point element.  Ensures
// that the center of pinned points align with where the user clicked
let ptOffset = (document.querySelector(".point").offsetWidth / 2);

// Keeps track of point 1's data
let pt1 = {
  x: 0, // refers to plane coordinates
  y: 0,
  screenPosX: 0, // refers to screen pixel position in the canvas
  screenPosY: 0,
  // whether the user has clicked on plane to pinned point's position
  pinned: false
};

// Keeps track of point 2's data
let pt2 = {
  x: 0, // refers to plane coordinates
  y: 0,
  screenPosX: 0, // refers to screen pixel position in the canvas
  screenPosY: 0,
  // whether the user has clicked on plane to pinned point's position
  pinned: false
};

// Draws grid lines for coordinate plane
function drawGrid(ctx, gridSpacing) {
  ctx.strokeStyle = 'rgb(0, 0, 0)';
  ctx.lineWidth = 1;
  ctx.beginPath();

  // Draw vertical grid lines
  for (let x = 0; x <= plane.width; x += gridSpacing) {
    // 0.5 adjustments fix Canvas boundary mismatches, sharpening the lines
    ctx.moveTo(x+0.5, 0);
    ctx.lineTo(x+0.5, plane.height);
    ctx.stroke();
  }

  // Draw horizontal grid lines
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

  // hide pinned point elements
  document.getElementById("pt1").hidden = true;
  document.getElementById("pt2").hidden = true;

  // checking browser for Canvas support
  if (plane.getContext) {
    // Determine the size of the canvas and draw grid based
    // off the smaller of its dimensions
    let smallerCanvasDimension = (width > height) ? height : width;

    // Determine space between coordinates for plane at current size
    gridSpacing = Math.floor((smallerCanvasDimension / coordinateRange));

    // Resize Canvas so that grid lines fall on integer pixel values, preventing
    // antialiasing (the +1 handles the 0.5 adjustments in drawGrid method)
    plane.height = (Math.round(height / gridSpacing) * gridSpacing) + 1;
    // Don't ask me why I'm using floor now.. this ensures axes are centered
    plane.width = (Math.floor(width / gridSpacing) * gridSpacing) + 1;

    // Draws the coordinate plane
    drawPlane();
  }
}

// Draws the coordinate plane
function drawPlane() {
  if (plane.getContext) {
    // Set line style and draw grid lines
    let ctx = plane.getContext('2d');
    // erases previous point position
    ctx.clearRect(0, 0, plane.width, plane.height);
    drawGrid(ctx, gridSpacing);
    drawAxes(ctx);
  }
}

// Draws a point that follows mouse on coordinate plane
function drawHoverPoint(pt) {
  // checking browser for Canvas support
  if (plane.getContext) {
    // when integer snap is enabled, point will only
    // be drawn on discrete coordinates.  Otherwise translation does nothing
    let translation = integerSnapTranslate();  // returns coord pair object

    // draw point
    let ctx = plane.getContext('2d');
    ctx.beginPath();
    ctx.arc(translation.x, translation.y, 5, 0, 2 * Math.PI, true);
    ctx.fillStyle = "#FF6A6A";
    ctx.fill();

    // get coordinates for point using mouse screen position
    let planeCoord = screenToPlaneTranslate(translation.x, translation.y);
    // save absolute screen position of point
    // pt.screenPosX = plane.offsetLeft + translation.x - ptOffset;
    // pt.screenPosY = plane.offsetTop + translation.y - ptOffset;
    pt.screenPosX = translation.x;
    pt.screenPosY = translation.y;

    // save current coordinates in point
    pt.x = planeCoord.x;
    pt.y = planeCoord.y;
  }
}

// Take a point's screen position and determine its coordinates on the plane
function screenToPlaneTranslate(screenPosX, screenPosY) {
  let coordX = 0;
  let coordY = 0;

  // NOTE: screenPos values should already account for offset based off
  // plane's screen position

  // move origin to the center of the plane
  screenPosX -= (plane.width / 2);
  screenPosY -= (plane.height / 2);

  // perform translation
  coordX = screenPosX / gridSpacing;
  // -1 flips y direction so that positive y values are above origin
  coordY = -1 * (screenPosY / gridSpacing);

  // coordinates must be integers if integer snap is on
  if (document.getElementById("intSnap").checked) {
    coordX = Math.round(coordX);
    coordY = Math.round(coordY);
  }

  return {
    x: coordX,
    y: coordY
  };
}

// Translate a hovering point position to be on a discrete coordinate,
// if Integer Snap is enabled - otherwise return continuous mouse position
function integerSnapTranslate() {
  let transX = mouseX;
  let transY = mouseY;

  if (document.getElementById("intSnap").checked) {
    // perform translation
    transX = Math.round(transX / gridSpacing) * gridSpacing;
    // -1 flips y direction so that positive y values are above origin
    transY = Math.round(transY / gridSpacing) * gridSpacing;
  }

  return {
    x: transX,
    y: transY
  };
}

// Gets the screen position of mouse, adjusting for canvas position
function getMousePosition(e) {
  mouseX = e.offsetX;
  mouseY = e.offsetY;
}

// Draws a line between two points
function drawLine() {
  // if one point isn't on the plane, do not draw a line
  if (pt1.pinned && plane.getContext) {
    let ctx = plane.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(28, 92, 28)';
    // when pt2 is not pinned, line is dotted
    if (!pt2.pinned) {
      ctx.setLineDash([5, 5]);
      // moving dotted line animation
      ctx.lineDashOffset -= .25;
    }
    ctx.lineWidth = 3;
    ctx.moveTo(pt1.screenPosX, pt1.screenPosY);
    ctx.lineTo(pt2.screenPosX, pt2.screenPosY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// Redraws coordinate plane
function updatePlane() {
  drawPlane();
  if (!pt1.pinned) drawHoverPoint(pt1);
  else if (!pt2.pinned) drawHoverPoint(pt2);

  // draws line between points
  drawLine();

  // Updates screen every frame
  requestAnimationFrame(updatePlane);
}

// Draw point element on plane when user clicks to pin point
function pinPoint() {
  // user is pinning first point to plane
  if (!pt1.pinned) {
    // position pinned point element in plane
    document.getElementById("pt1").style.left = pt1.screenPosX +
    plane.offsetLeft - ptOffset + "px";
    // offset adjusts for position of coord plane in document body
    document.getElementById("pt1").style.top = pt1.screenPosY +
    plane.offsetTop - ptOffset + "px";
    document.getElementById("pt1").hidden = false;
    pt1.pinned = true;
  }
  else if (!pt2.pinned) {
    // position pinned point element in plane
    document.getElementById("pt2").style.left = pt2.screenPosX +
    plane.offsetLeft - ptOffset + "px";
    // offset adjusts for position of coord plane in document body
    document.getElementById("pt2").style.top = pt2.screenPosY +
    plane.offsetTop - ptOffset + "px";
    document.getElementById("pt2").hidden = false;
    pt2.pinned = true;
  }
  // if both points are already pinned, do nothing
}

// Determines what action should be taken upon mouse click
function mouseClick(e) {
  // pin point on plane, if applicable
  pinPoint();
}

// takes width and height as args
initPlane(500,400);
plane.addEventListener("mousemove", getMousePosition, false);
plane.addEventListener("click", mouseClick, false);
updatePlane();
