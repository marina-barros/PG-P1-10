var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = parseFloat(window.getComputedStyle(canvas).width);
  canvas.height = parseFloat(window.getComputedStyle(canvas).height);
}

function drawCircles() {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
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
var index = -1;

resizeCanvas();

canvas.addEventListener('mousedown', e => {
  var click = {x: e.offsetX, y: e.offsetY, v:{x: 0, y:0}};
  index = getIndex(click);
  if (index === -1) {
    points.push(click);
    drawCircles();
    drawLines();
  }
});

canvas.addEventListener('mouseup', e => {

});

// canvas.addEventListener('dblclick', e => {
//   if (index !== -1) {
//     points.splice(index, 1);
//     drawCircles();
//     if (previous !== {x:0, y:0, v:{x:0, y:0}}) {
//       drawLine();
//     }
//   }
// });

setInterval(() => {
  for (var i in points) {
    var p = points[i];
    var pos = {x: p.x + p.v.x, y: p.y + p.v.y};
    if (pos.x < 0 || pos.x > canvas.width) {
      points[i].v.x *= -1;
    }
    if (pos.y < 0 || pos.y > canvas.height) {
      points[i].v.y *= -1;
    }
    points[i].x += points[i].v.x;
    points[i].y += points[i].v.y;
  }
  drawCircles();
  drawLines();
}, 1000 / 30);
