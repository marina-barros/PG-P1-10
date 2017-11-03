var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var points = [];
var pointsCurve = [];
var deltaB = []; //armazena as primeiras derivadas dos pontos inseridos
var scdDeltaB = []; //armazena  as segundas derivadas dos pontos inseridos
var normalVectors = [];
var index = -1;
var prevPointCurve = {x:0, y:0, v:{x:0, y:0}};
var iteracoes = 15; //input do user
var grau;
var incremento = 0;

function resizeCanvas() {
  canvas.width = parseFloat(window.getComputedStyle(canvas).width);
  canvas.height = parseFloat(window.getComputedStyle(canvas).height);
}

function drawCircles() {
  ctx.fillStyle = 'rgb(255, 255, 255';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (var i in points) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 4.5, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgb(' + points[i].x % 255 + ', ' + 128 + ', ' + points[i].y % 255 + ')';
    ctx.fill();
  }
}

function dist(p1, p2) {
  var v = {x: p1.x - p2.x, y: p1.y - p2.y};
  return Math.sqrt(v.x * v.x + v.y * v.y);
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

function getIndex(click) {
  for (var i in points) {
    if (dist(points[i], click) <= 10) {
      return i;
    }
  }
  return -1;
}

resizeCanvas();

canvas.addEventListener('mousedown', e => {
  var click = {x: e.offsetX, y: e.offsetY, v:{x: 0, y:0}};
  index = getIndex(click);
  if (index === -1) {
    points.push(click);
    updateGrau();
    drawCircles();
    drawLines();
    updateDeltas();
    updateIncremento(iteracoes);
    createCurve();
  }
});

canvas.addEventListener('dblclick', e => {
  var click = {x: e.offsetX, y: e.offsetY, v:{x: 0, y:0}};
  index = getIndex(click);
  if (index === -1) {
    points.push(click);
    updateGrau();
    drawCircles();
    drawLines();
    updateDeltas();
    updateIncremento(iteracoes);
    createCurve();
  }
});

canvas.addEventListener('mouseup', e => {

});

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

function normal(t) {
  if (grau >= 2) {
    var w = {x:0, y:0};
    var u = {x:0, y:0};
    var v = {x:0, y:0};
    u = decasteljau(deltaB, t);    
    //u.x = grau * (decasteljau(points, t, 1, grau-1).x - decasteljau(points, t, 0, grau-1).x);
    //u.y = grau * (decasteljau(points, t, 1, grau-1).y - decasteljau(points, t, 0, grau-1).y);
    // u = grau * decasteljau(t, grau-1, deltaB);
    v = decasteljau(scdDeltaB, t);
    // v = grau * grau-1 * decasteljau(t, grau-2, scdDeltaB);
    w.x = v.x - (dotProduct(u,v)/dotProduct(u,u))*u.x;
    w.y = v.y - (dotProduct(u,v)/dotProduct(u,u))*u.y;
    // console.log(u);
    // console.log(v);
    // console.log(w);
    normalVectors.push(w);
  }
}

function dotProduct(a,b) {
  return a.x*b.x + a.y*b.y;
}

function updateDeltas() {
  var indexDer = grau-1;
  if(grau >= 2) {
    deltaB[indexDer] = firstD(indexDer);
    scdDeltaB[indexDer-1] = secondD(indexDer-1);
  } else if(grau == 1) {
    deltaB[indexDer] = firstD(indexDer);
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

function drawCurve() {
  for(var i = 1; i < pointsCurve.length;i++) {
    ctx.beginPath();
    ctx.moveTo(pointsCurve[i-1].x, pointsCurve[i-1].y);
    ctx.lineTo(pointsCurve[i].x, pointsCurve[i].y);
    ctx.stroke();
  }
}

function updateIncremento(iteracoes) {
  incremento = 1/iteracoes;
}

function createCurve() {
  pointsCurve = [];
  normalVectors = [];
  var iter;
  if(points.length > 2) {
    for (var j = 0; j <=iteracoes; j++) {
      iter = j*(1/iteracoes);
      var result = decasteljau(points, iter);
      pointsCurve.push(result);
      normal(iter);
    }
    drawCurve();
    drawNormalVectors();
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


/*

function decasteljau(t, max, array) {
  var coef = 0;
  var finalPoint = {x:0, y:0, v:{x:0, y:0}};
  for(var i = 0; i <= max; i++) {
    coef = bernstein(t, max, i);
    finalPoint.x = finalPoint.x + array[i].x * coef;
    finalPoint.y = finalPoint.y + array[i].y * coef;
  }
  return finalPoint;
}*/

function bernstein(t, max, i) {
  return comb(max,i)*Math.pow(1-t, max-i)*Math.pow(t, i);
}

function comb(a, b) {
  return fact(a)/(fact(b)*fact(a-b));
}

function fact(a) {
  var result = 1;
  for(var i = 1; i<=a; i++) {
    result = result * i;
  }
  return result;
}

function updateGrau() {
  grau = points.length-1;
  if(grau == 1) {
    prevPointCurve = points[0];
  }
}


// setInterval(() => {
//   for (var i in points) {
//     var p = points[i];
//     var pos = {x: p.x + p.v.x, y: p.y + p.v.y};
//     if (pos.x < 0 || pos.x > canvas.width) {
//       points[i].v.x *= -1;
//     }
//     if (pos.y < 0 || pos.y > canvas.height) {
//       points[i].v.y *= -1;
//     }
//     points[i].x += points[i].v.x;
//     points[i].y += points[i].v.y;
//   }
//   drawCircles();
//   drawLines();
//   createCurve();
// }, 1000 / 30);
