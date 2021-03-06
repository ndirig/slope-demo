
// The coordinate plane will span at least this many units.  Must be even!
let coordinateRange = 16;

// Canvas for coordinate plane
let plane = document.getElementById('coordinatePlane');

// Pixels between coordinates for plane at current size
let gridSpacing = 0;

// Keeps track of mouse position
let mouseX = 0;
let mouseY = 0;

let riseRunDisplay = false;

// Slope
let m = 0;
// y intercept
let b = 0;

// Keeps track of point 1's data
let pt1 = {
  x: 0, // refers to plane coordinates
  y: 0,
  canvasPosX: 0, // refers to mouse's pixel position in the canvas
  canvasPosY: 0,
  // whether the user has clicked on plane to pinned point's position
  pinned: false
};

// Keeps track of point 2's data
let pt2 = {
  x: 0, // refers to plane coordinates
  y: 0,
  canvasPosX: 0, // refers to mouse's pixel position in the canvas
  canvasPosY: 0,
  // whether the user has clicked on plane to pinned point's position
  pinned: false
};

// Draws grid lines for coordinate plane
function drawGrid(ctx, gridSpacing) {
  ctx.strokeStyle = 'rgb(134, 173, 240)';
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
  ctx.strokeStyle = 'rgb(62, 66, 74)';
  ctx.beginPath();
  // Draw axes in the middle
  ctx.moveTo(0, plane.height/2);
  ctx.lineTo(plane.width, plane.height/2);
  ctx.stroke();
  ctx.moveTo(plane.width/2, 0);
  ctx.lineTo(plane.width/2, plane.height);
  ctx.stroke();
}

// Hides pinned point and label elements
function hideElements() {
  document.getElementById("pt1").hidden = true;
  document.getElementById("pt2").hidden = true;
  document.getElementById("intercept").hidden = true;
  document.getElementById("slopeLabel").hidden = true;
  document.getElementById("yIntLabel").hidden = true;
  document.getElementById("pt1Label").hidden = true;
  document.getElementById("pt2Label").hidden = true;
  document.getElementById("riseRun1").hidden = true;
  document.getElementById("riseRun2").hidden = true;
}

// Prepares coordinate plane for drawing
function initPlane(width, height) {
  // Set starting dimensions for canvas.  Will be tweaked later
  plane.width = width;
  plane.height = height;

  // hide pinned point and label elements
  hideElements();

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
    let planeCoord = mouseToPlaneTranslate(translation.x, translation.y);
    // save pixel position of point relative to origin of canvas
    pt.canvasPosX = translation.x;
    pt.canvasPosY = translation.y;

    // save current coordinates in point
    pt.x = planeCoord.x;
    pt.y = planeCoord.y;
  }
}

// Take the mouse's canvas position and determine its coordinates on the plane
function mouseToPlaneTranslate(mousePosX, mousePosY) {
  let coordX = 0;
  let coordY = 0;

  // NOTE: screenPos values should already account for offset based off
  // plane's screen position

  // move origin to the center of the plane
  mousePosX -= (plane.width / 2);
  mousePosY -= (plane.height / 2);

  // perform translation
  coordX = mousePosX / gridSpacing;
  // -1 flips y direction so that positive y values are above origin
  coordY = -1 * (mousePosY / gridSpacing);

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

// Take a point coordinates from our graph representation and translate
// to an absolute pixel position on the screen
function planeCoordToAbsScreenPosition(coordX, coordY, offsetX, offsetY) {
  // account for plane's "origin" being different than the canvas origin.
  // also account for canvas not starting at 0,0 in document's body.
  // offset var allows for small adjustments
  let screenPosX = (coordX * gridSpacing) + (plane.width / 2) +
    plane.offsetLeft + offsetX;
  let screenPosY = (-1 * coordY * gridSpacing) + (plane.height / 2) +
    plane.offsetTop + offsetY;
  // -1 flips y direction to graphics coord system (pos y goes down)

  return {
    x: screenPosX,
    y: screenPosY
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
    ctx.strokeStyle = 'rgb(45, 166, 87)';
    // when pt2 is not pinned, line is dotted
    if (!pt2.pinned) {
      ctx.setLineDash([5, 5]);
      // moving dotted line animation
      ctx.lineDashOffset -= .25;
    }
    ctx.lineWidth = 3;
    // we want the line to extend past the points up to the edges of the plane
    // therefore we need the canvas boundary intercepts
    let boundInt = getPlaneBoundaryIntercepts();
    ctx.moveTo(boundInt.xBoundary1, boundInt.yBoundary1);
    ctx.lineTo(boundInt.xBoundary2, boundInt.yBoundary2);
    ctx.stroke();
    // reset line dash to be solid
    ctx.setLineDash([]);
  }
}

// Displays correct values of m and b in the equation header
function displayEquation() {
  // do not redraw eq if points pinned
  if (!(pt1.pinned && pt2.pinned)) {
    let eq = document.getElementById("eq");
    let html;
    // recalculates slope and y intercept
    m = calcSlope(pt1, pt2);
    b = calcYInt(pt1, m);
    // if there's no points, default to displaying "y=mx+b"
    if (!pt1.pinned) {
      html = 'y=<span id="slope">m</span>x+<span id="yint">b</span>';
    }
    // account for undefined slope
    else if (!isFinite(m) || isNaN(m)) { html = "Undefined slope"; }
    else if (m == 0) { html = 'y=<span id="yint">' + b.toFixed(2) + '</span>'; }
    else if (b == 0) { html = 'y=<span id="slope">' + m.toFixed(2) + '</span>x'; }
    else {  // change m and y values in equation header
      html = 'y=<span id="slope">' + m.toFixed(2) + '</span>x+<span id="yint">' +
      b.toFixed(2) + '</span>';
    }
    // do not redraw eq if nothing is changing -- no extra work
    if (eq.innerHTML !== html) {
      eq.innerHTML = html;
      // listeners for equation elements must be reapplied if eq changes
      reapplyListeners();
    }
  }
}

// Reapplies listeners to equation header elements
function reapplyListeners() {
  if (pt1.pinned && m != 0 && isFinite(m) && !isNaN(m)) {
    document.getElementById("slope").addEventListener("mouseenter",
      showSlopeCalc, false);
    document.getElementById("slope").addEventListener("mouseleave",
      removeSlopeCalc, false);
  }
}

// Finds coordinates where an infinite line intercepts the boundary edges
// of the canvas
function getPlaneBoundaryIntercepts() {
  // boundary case, handle separately
  if (!isFinite(m)) {
    return {
      xBoundary1: pt1.canvasPosX,
      yBoundary1: 0,
      xBoundary2: pt1.canvasPosX,
      yBoundary2: plane.height
    };
  }
  // Using y=mx+b to find bounds.  Negatives account for opposite y direction
  let bound1y = (-1 * m * (plane.width / 2)) - (b * gridSpacing);
  let bound2y = (m * (plane.width / 2)) - (b * gridSpacing);
  return {
    // we found boundary ints above with x = 0 and width (notice I accounted
    // for the origin offset in that calculation)
    xBoundary1: 0,
    // height / 2 is accounting for the origin being offset
    yBoundary1: bound2y +  (plane.height/2),
    xBoundary2: plane.width,
    yBoundary2: bound1y + (plane.height/2)
  };
}

// Calculates slope between two points
function calcSlope(a, b) {
  return ((b.y - a.y)/(b.x - a.x));
}

// Calculates the y intercept of a line
function calcYInt(pt, m) {
  return (pt.y - (m * pt.x));
}

// Calculates the midpoint of two points
function calcMidpoint(x1, y1, x2, y2) {
  return {
    x: (x1 + x2)/2,
    y: (y1 + y2)/2
  };
}

// Draw a label next to the line indicating slope
function drawSlopeLabel() {
  let label = document.getElementById("slopeLabel");
    // display when points are pinned.  do not redraw if nothing changed
  if (pt1.pinned && pt2.pinned && m != label.innerHTML.substring(2)
    && isFinite(m) && m != 0 && !riseRunDisplay) {
    // find midpoint of line, put the label there
    midpoint = calcMidpoint(pt1.x, pt1.y, pt2.x, pt2.y);
    screenPos = planeCoordToAbsScreenPosition(midpoint.x, midpoint.y, 0, 0);
    label.hidden = false;
    label.innerHTML = "m=" + m.toFixed(2);
    label.style.left = screenPos.x + "px";
    label.style.top = screenPos.y + "px";
  }
}

// Displays point coordinates in a label
function drawPtLabel(pt, id) {
  // determine whether to show label for pt1 or pt2
  let label = (id == "pt1") ? document.getElementById("pt1Label") :
    document.getElementById("pt2Label");
  screenPos = planeCoordToAbsScreenPosition(pt.x, pt.y, 10, 0);
  label.hidden = false;
  label.innerHTML = "(" + pt.x.toFixed(2) + ", " + pt.y.toFixed(2) + ")";
  label.style.left = screenPos.x + "px";
  label.style.top = screenPos.y + "px";
}

// Remove point label when not hovering over point
function removePtLabel(pt, id) {
  // determine whether to show label for pt1 or pt2
  let label = (id == "pt1") ? document.getElementById("pt1Label") :
    document.getElementById("pt2Label");
  label.hidden = true;
}

// Displays y intercept coordinates in a label
function drawYIntLabel() {
  let label = document.getElementById("yIntLabel");
  screenPos = planeCoordToAbsScreenPosition(0, b, 10, 0);
  label.hidden = false;
  label.innerHTML = "(0, " + b.toFixed(2) + ")";
  label.style.left = screenPos.x + "px";
  label.style.top = screenPos.y + "px";
  // highlight y int in equation
  if (b != 0) {  // make sure element exists
    document.getElementById("yint").style.backgroundColor =
      "rgba(235, 204, 204,.9)";
  }
}

// Remove y intercept label when not hovering over intercept
function removeYIntLabel() {
  if (b != 0) {  // make sure element exists
    document.getElementById("yint").style.backgroundColor="transparent";
  }
  document.getElementById("yIntLabel").hidden = true;
}

// Displays rise and run values
function drawRiseRunLabels() {
  let label1 = document.getElementById("riseRun1");
  let label2 = document.getElementById("riseRun2");
  let html1 = Math.abs((pt2.x - pt1.x)).toFixed(2);
  let html2 = Math.abs((pt2.y - pt1.y)).toFixed(2);
  drawRRLabel(label1,html1,pt2.x,pt1.y,pt1.x,pt1.y,true);
  drawRRLabel(label2,html2,pt2.x,pt1.y,pt2.x,pt2.y,false);
}

// Remove rise run labels when not hovering over slope label
function removeRiseRunLabels() {
  let label1 = document.getElementById("riseRun1");
  let label2 = document.getElementById("riseRun2");
  label1.hidden = true;
  label2.hidden = true;
}

// Draws a label at a given location
function drawRRLabel(label, html, aX, aY, bX, bY, onXAxis) {
  label.innerHTML = html;
  label.hidden = false;
  let offsetX = 0;
  let offsetY = 0;
  // To make it look nice and centered, specify different offsets based on axis
  if (onXAxis) {
    offsetX = label.offsetWidth / -2;
    offsetY = label.offsetWidth * -1;
  } else {
    offsetX = label.offsetWidth * .25;
    offsetY = label.offsetWidth / -2;
  }
  let midpoint = calcMidpoint(aX, aY, bX, bY);
  screenPos = planeCoordToAbsScreenPosition(midpoint.x, midpoint.y,
    offsetX, offsetY);
  label.style.left = screenPos.x + "px";
  label.style.top = screenPos.y + "px";
}

// Changes equation to demonstrate how slope is calculated
function showSlopeCalc() {
  // error checking
  if (m != 0 && pt1.pinned && pt2.pinned && isFinite(m) && !isNaN(m)) {
    let slopeSpan = document.getElementById("slope");
    let label = document.getElementById("slopeLabel");
    // span elements add style to coord values so colors correspond
    let eq = "<span class='calc'>((<span class='pt2'>" + pt2.y.toFixed(2) +
      "</span> - <span class='pt1'>" + pt1.y.toFixed(2) +
      "</span>) / (<span class='pt2'>" + pt2.x.toFixed(2) +
      "</span> - <span class='pt1'>" + pt1.x.toFixed(2) + "</span>))</span>";
    slopeSpan.innerHTML = eq;
    //slopeSpan.style.backgroundColor="rgba(206, 211, 237, .9)";
    // triggers showRiseOverRun method
    riseRunDisplay = true;
    drawPtLabel(pt1, "pt1");
    drawPtLabel(pt2, "pt2");
    drawRiseRunLabels();
  }
}

// Changes equation to no longer demonstrate how slope is calculated
function removeSlopeCalc() {
  if (b == 0) { html = 'y=<span id="slope">' + m.toFixed(2) + '</span>x'; }
  else {  // change m and y values in equation header
    html = 'y=<span id="slope">' + m.toFixed(2) + '</span>x+<span id="yint">' +
    b.toFixed(2) + '</span>';
  }
  eq.innerHTML = html;
  document.getElementById('slope').style.backgroundColor="transparent";
  riseRunDisplay = false;
  removePtLabel(pt1, "pt1")
  removePtLabel(pt2, "pt2")
  removeRiseRunLabels();
  reapplyListeners();
}

// Demonstrate graphically how rise over run can be used to calculate slope
function showRiseOverRun() {
  // draw rise and run lines
  if (riseRunDisplay && pt1.pinned && pt2.pinned && plane.getContext) {
    drawRiseRunLines();
    // change slope label to demonstrate rise/run slope calculation
    let rise = (pt2.y - pt1.y).toFixed(2);
    let run = (pt2.x - pt1.x).toFixed(2);
    let html = 'm=<span class="riseRun">'
      + rise + '</span>/<span class="riseRun">' + run + '</span>';
    if (document.getElementById("slopeLabel").innerHTML != html) {
      document.getElementById("slopeLabel").innerHTML = html;
    }
    // display labels for rise and run
  }
}

// Draws the rise and run lines in coordinate plane
function drawRiseRunLines() {
  let ctx = plane.getContext('2d');
  ctx.beginPath();
  ctx.strokeStyle = 'rgb(45, 166, 87)';
  ctx.setLineDash([5, 5]);
  // moving dotted line animation
  ctx.lineDashOffset -= .25;
  ctx.lineWidth = 2;
  // get coordinate where rise and run make right angle with points
  let riseRunCoord = planeCoordToAbsScreenPosition(pt2.x, pt1.y, 0, 0);
  // draw rise line
  ctx.moveTo(riseRunCoord.x - plane.offsetLeft, riseRunCoord.y - plane.offsetTop);
  ctx.lineTo(pt2.canvasPosX, pt2.canvasPosY);
  ctx.stroke();
  // draw run line
  ctx.moveTo(riseRunCoord.x - plane.offsetLeft, riseRunCoord.y - plane.offsetTop);
  ctx.lineTo(pt1.canvasPosX, pt1.canvasPosY);
  ctx.stroke();
  // reset line dash to be solid
  ctx.setLineDash([]);
}

// Redraws coordinate plane and equation
function update() {
  drawPlane();
  if (!pt1.pinned) drawHoverPoint(pt1);
  else if (!pt2.pinned) drawHoverPoint(pt2);

  // draws line between points
  drawLine();

  // draws numerical label next to line indicating slope
  drawSlopeLabel();

  // display labels next to points to help explain calculation
  showRiseOverRun();

  // updates equation to reflect current slope
  displayEquation();

  // Updates screen every frame
  requestAnimationFrame(update);
}

// Positions point element based on saved coordinates
function pinPoint(id, pt) {
  document.getElementById(id).hidden = false;
  // Offset to account for radius of pinned point element.  Ensures
  // that the center of pinned points align with where the user clicked
  let ptOffset = (document.querySelector(".point").offsetWidth / 2);
  // position pinned point element in plane
  document.getElementById(id).style.left = pt.canvasPosX +
  plane.offsetLeft - ptOffset + "px";
  // offset adjusts for position of coord plane in document body
  document.getElementById(id).style.top = pt.canvasPosY +
  plane.offsetTop - ptOffset + "px";
  pt.pinned = true;
}

// Draws dash mark on x axis where y intercept lies
function drawYIntDash() {
  if (isFinite(m) && Math.abs(b) < ((plane.height/gridSpacing)/2)) {
    document.getElementById("intercept").hidden = false;
    // Offset to account for dimensions of dash element.  Ensures
    // that the center of dash aligns with where the user clicked
    let dashOffsetY = document.getElementById("intercept").offsetHeight / -2;
    let dashOffsetX = document.getElementById("intercept").offsetWidth / -2;

    // take calculated y int and translate to find absolute screen position
    let absPos = planeCoordToAbsScreenPosition(0, b, dashOffsetX, dashOffsetY);

    document.getElementById("intercept").style.left = absPos.x + "px";
    document.getElementById("intercept").style.top = absPos.y + "px";
  }
}

// Draws point elements on plane when user clicks to pin point
function drawPinnedPoint() {
  // user is pinning first point to plane
  if (!pt1.pinned) {
    pinPoint("pt1", pt1);
  }
  else if (!pt2.pinned) {
    pinPoint("pt2", pt2);
    // place hash mark where the y intercept lies
    drawYIntDash();
  }
  // if both points are already pinned, do nothing
}

// Determines what action should be taken upon mouse click
function mouseClick(e) {
  // pin point on plane, if applicable
  drawPinnedPoint();
}

// Resets coordinate plane
function reset() {
  // reset variables
  m = 0;
  b = 0;
  pt1 = { x: 0, y: 0, canvasPosX: 0, canvasPosY: 0, pinned: false };
  pt2 = { x: 0, y: 0, canvasPosX: 0, canvasPosY: 0, pinned: false };

  initPlane(plane.width,plane.height);
  // reset equation header listeners
  if (m != 0) {
    document.getElementById("slope").removeEventListener("mouseenter",
      showSlopeCalc, true);
    document.getElementById("slope").removeEventListener("mouseleave",
      removeSlopeCalc, true);
  }
}

// takes width and height as args
initPlane(500,400);

// many listeners..
plane.addEventListener("mousemove", getMousePosition, false);
plane.addEventListener("click", mouseClick, false);
// listeners for hovering over y intercept
document.getElementById("intercept").addEventListener("mouseenter",
  drawYIntLabel, false);
document.getElementById("intercept").addEventListener("mouseleave",
  removeYIntLabel, false);
// listeners for hovering over slope label
document.getElementById("slopeLabel").addEventListener("mouseenter",
  showSlopeCalc, false);
document.getElementById("slopeLabel").addEventListener("mouseleave",
  removeSlopeCalc, false);
// listeners for hovering over pt1
document.getElementById("pt1").addEventListener("mouseenter",
  function() {drawPtLabel(pt1, "pt1")}, false);
document.getElementById("pt1").addEventListener("mouseleave",
  function() {removePtLabel(pt1, "pt1")}, false);
// listeners for hovering over pt2
document.getElementById("pt2").addEventListener("mouseenter",
  function() {drawPtLabel(pt2, "pt2")}, false);
document.getElementById("pt2").addEventListener("mouseleave",
  function() {removePtLabel(pt2, "pt2")}, false);
// listener for clear button -- reset coord plane
document.getElementById("clear").addEventListener("click", reset, false);

// the redraw function
update();
