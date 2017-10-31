var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

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

var points = [];
var pointsCurve = [];
var index = -1;
var iteracoes = 10; //input do user
//var t;

resizeCanvas();

canvas.addEventListener('mousedown', e => {
  var click = {x: e.offsetX, y: e.offsetY, v:{x: 0, y:0}};
  index = getIndex(click);
  if (index === -1) {
    points.push(click);
    drawCircles();
    drawLines();
    createCurve(iteracoes);
  }
});

canvas.addEventListener('mouseup', e => {

});

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
  var tam = points.length-1;
  var coef = 0;
  var finalPoint = {x:0, y:0, v:{x:0, y:0}};
  for (var j = 0; j <= tam; j++) {
      coef = comb(tam,j)*Math.pow(1-t, tam-j)*Math.pow(t, j);
      finalPoint.x = finalPoint.x + points[j].x * coef;
      finalPoint.y = finalPoint.y + points[j].y * coef;
  }
  return finalPoint;
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
