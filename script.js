var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var points = [];
var pointsCurve = [];
var firstDerivVectors = []; //armazena as primeiras derivadas dos pontos inseridos
var scdDerivVectors = []; //armazena  as segundas derivadas dos pontos inseridos
var normalVectors;
var index = -1;
var iteracoes = 100; //input do user
var grau;
//var t;

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
    createCurve(iteracoes);
    updateDerivatives();
    normal();
  }
});

canvas.addEventListener('mouseup', e => {

});

function drawNormalVectors() {
  for(var j = 0; j < pointsCurve.length; j++) {
    ctx.beginPath();
    ctx.moveTo(pointsCurve[j].x, pointsCurve[j].y);
    ctx.lineTo(normalVectors[j].x, normalVectors[j].y);
    ctx.stroke();
  }  
}

function normal() {
  if(grau > 1) {
    var w = {x:0, y:0};
    for(var i = 0; i < grau-2; i++) {
      u = firstDerivVectors[i];
      v = scdDerivVectors[i];
      w.x = v.x - (dotProduct(u,v)/dotProduct(u,u))*u.x;
      w.y = v.y - (dotProduct(u,v)/dotProduct(u,u))*u.y;
      normalVectors.push(w);
      drawNormalVectors();
    }
  }
}

function dotProduct(a,b) {
  return a.x*b.x + a.y*b.y;
}

function updateDerivatives() {
  var indexDer = grau-1;
  if(grau >= 2) {
    firstDerivVectors[indexDer] = firstD(indexDer);
    scdDerivVectors[indexDer-1] = secondD(indexDer-1);
  } else if(grau == 1) {
    firstDerivVectors[indexDer] = firstD(indexDer);
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

function incremento(iteracoes) {
  return 1 / iteracoes;
}

function drawCurve() {
  for(var j = 1; j < pointsCurve.length; j++) {
    ctx.beginPath();
    ctx.moveTo(pointsCurve[j-1].x, pointsCurve[j-1].y);
    ctx.lineTo(pointsCurve[j].x, pointsCurve[j].y);
    ctx.stroke();
  }  
}

function createCurve(iteracoes) {
  if(points.length > 2) {
    pointsCurve = [];
    var incremento = 1/iteracoes;
    for(var i = 0; i <= 1; i = i + incremento) {
      pointsCurve.push(pointCurve(i));
    }
    drawCurve();
  }
}

function pointCurve(t) {
  var coef = 0;
  var finalPoint = {x:0, y:0, v:{x:0, y:0}};
  for (var j = 0; j <= grau; j++) {
      coef = bernstein(t,j);
      finalPoint.x = finalPoint.x + points[j].x * coef;
      finalPoint.y = finalPoint.y + points[j].y * coef;
  }
  return finalPoint;
}

function bernstein(t,i) {
  return comb(grau,i)*Math.pow(1-t, grau-i)*Math.pow(t, i);
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
}
// canvas.addEventListener('dblclick', e => {
//   if (index !== -1) {
//     points.splice(index, 1);
//     drawCircles();
//     if (previous !== {x:0, y:0, v:{x:0, y:0}}) {
//       drawLine();
//     }
//   }
// });

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
