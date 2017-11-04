var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var points = [];
var pointsCurve = [];
var deltaB = []; //armazena as primeiras derivadas dos pontos inseridos
var scdDeltaB = []; //armazena  as segundas derivadas dos pontos inseridos
var normalVectors = [];
var tangentVectors = [];

var index = -1;
var iteracoes; //input do user
var grau;
var movingPoint;
var incremento = 0;

var showControlPoints = true;
var showPoligonal = true;
var showCurve = true;
var showNormal = true;
var showTangent = true;

function resizeCanvas() {
  canvas.width = parseFloat(window.getComputedStyle(canvas).width);
  canvas.height = parseFloat(window.getComputedStyle(canvas).height);
}

resizeCanvas();

//Events
document.getElementById('iteracoes').addEventListener('input', e => {
  if(e.target.value > 0) {
    drawScene();
  }
});

document.getElementById('controlPoints').addEventListener('click', e => {
  showControlPoints = e.target.checked;
  drawScene();
});

document.getElementById('poligonal').addEventListener('click', e => {
  showPoligonal = e.target.checked;
  drawScene();
});

document.getElementById('curve').addEventListener('click', e => {
  showCurve = e.target.checked;
  drawScene();
});

document.getElementById('normal').addEventListener('click', e => {
  showNormal = e.target.checked;
  drawScene();
});

document.getElementById('tangent').addEventListener('click', e => {
  showTangent = e.target.checked;
  drawScene();
});

canvas.addEventListener('click', e => {
  var click = {x: e.offsetX, y: e.offsetY, v:{x: 0, y:0}};
  index = getIndex(click);
  if (index === -1) {
    points.push(click);
    drawScene();
  }
});

canvas.addEventListener('mousedown', e => {
  var click = {x: e.offsetX, y: e.offsetY, v:{x: 0, y:0}};
  index = getIndex(click);
  if (index !== -1) {
    movingPoint = true;
  }
});

canvas.addEventListener('mousemove', e => {
  if (movingPoint) {
    points[index] = {x: e.offsetX, y: e.offsetY, v:{x: 0, y:0}};
    drawScene();
  }
});

canvas.addEventListener('mouseup', e => {
  movingPoint = false;
});

canvas.addEventListener('dblclick', e => {
  if (index !== -1) {
    points.splice(index, 1);
    drawScene();
  }
});

//Click functions
function getIndex(click) {
  for (var i in points) {
    if (dist(points[i], click) <= 10) {
      return i;
    }
  }
  return -1;
}

function dist(p1, p2) {
  var v = {x: p1.x - p2.x, y: p1.y - p2.y};
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

//Draw functions
function drawScene() {
  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  normalVectors = [];
  tangentVectors = [];
  updateGrau();
  updateIterations();
  if (showControlPoints) {
    drawCircles();
  }
  if(showPoligonal) {
    drawLines();
  }
  updateDeltas();
  updateIncremento(iteracoes);
  createCurve();
}

function drawCircles() {
  for (var i in points) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 4.5, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgb(' + points[i].x % 255 + ', ' + 128 + ', ' + points[i].y % 255 + ')';
    ctx.fill();
  }
}

function drawLines() {
  var init = 1;
  var previous = {x: 0, y:0, v:{x:0, y:0}};
  for(var i in points) {
    if(init != 1) {
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    } else {
      init = 0;
    }
    previous = points[i];
  }
}

function drawCurve() {
  for(var i = 1; i < pointsCurve.length;i++) {
    ctx.beginPath();
    ctx.moveTo(pointsCurve[i-1].x, pointsCurve[i-1].y);
    ctx.lineTo(pointsCurve[i].x, pointsCurve[i].y);
    ctx.stroke();
  }
}

function drawTangentVectors() {
  if (grau >= 2) {
    for(var j = 0; j < normalVectors.length; j++) {
      ctx.beginPath();
      ctx.moveTo(pointsCurve[j].x, pointsCurve[j].y);
      ctx.lineTo(pointsCurve[j].x + tangentVectors[j].x, pointsCurve[j].y + tangentVectors[j].y);
      ctx.stroke();
    }
  }
}

function drawNormalVectors() {
  if (grau >= 2) {
    for(var j = 0; j < normalVectors.length; j++) {
      ctx.beginPath();
      ctx.moveTo(pointsCurve[j].x, pointsCurve[j].y);
      ctx.lineTo(pointsCurve[j].x + normalVectors[j].x, pointsCurve[j].y + normalVectors[j].y);
      ctx.stroke();
    }
  }
}

//Logical functions
function createCurve() {
  pointsCurve = [];
  normalVectors = [];
  tangentVectors = [];
  var iter;
  if(points.length > 2) {
    for (var j = 0; j <=iteracoes; j++) {
      iter = j*(1/iteracoes);
      var result = decasteljau(points, iter);
      pointsCurve.push(result);
      normal(iter);
    }
    if(showCurve) {
      drawCurve();
    }
    if(showNormal) {
      drawNormalVectors();
    }
    if(showTangent) {
      drawTangentVectors();
    }
  }
}

function decasteljau(array, t) {
  if(array.length == 1) {
    return array[0];
  } else {
    var newpoints = [];
    for(var i = 0; i < array.length-1; i++) {
      var point = {x:0, y:0, v:{x:0, y:0}};
      point.x = (1-t) * array[i].x + t * array[i+1].x;
      point.y = (1-t) * array[i].y + t * array[i+1].y;
      newpoints.push(point);
    }
    return decasteljau(newpoints, t);
  }
}

function normal(t) {
  if (grau >= 2) {
    var w = {x:0, y:0};
    var u = {x:0, y:0};
    var v = {x:0, y:0};
    u = decasteljau(deltaB, t);
    tangentVectors.push(u);    
    v = decasteljau(scdDeltaB, t);
    w.x = v.x - (dotProduct(u,v)/dotProduct(u,u))*u.x;
    w.y = v.y - (dotProduct(u,v)/dotProduct(u,u))*u.y;
    normalVectors.push(w);
  }
}

function dotProduct(a,b) {
  return a.x*b.x + a.y*b.y;
}

//Update functions
function updateGrau() {
  grau = points.length-1;
}

function updateIncremento(iteracoes) {
  incremento = 1/iteracoes;
}

function updateIterations() {
  iteracoes = document.getElementById("iteracoes").value;  
}

function updateDeltas() {
  deltaB = [];
  scdDeltaB = [];
  if(grau >= 2) {
    deltaB[0] = firstD(0);
    for (var k = 1; k <= grau-1; k++) {
      deltaB[k] = firstD(k);
      scdDeltaB[k-1] = secondD(k-1);    
    }
  } else if(grau == 1) {
    deltaB[0] = firstD(0);
  }
}

function firstD(z) {
  var p = {x: 0, y:0, v:{x: 0, y:0}};
  p.x = points[z+1].x - points[z].x;
  p.y = points[z+1].y - points[z].y;
  return p;
}

function secondD(z) {
  var q = {x: 0, y:0, v:{x: 0, y:0}};
  q.x = points[z+2].x -(2 * points[z+1].x) + points[z].x;
  q.y = points[z+2].y -(2 * points[z+1].y) + points[z].y;
  return q;
}