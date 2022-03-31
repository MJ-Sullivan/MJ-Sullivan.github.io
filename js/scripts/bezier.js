var canvas = document.getElementById("canvas");
var lerpSlider = document.getElementById("lerpSlider");
var interpLabel = document.getElementById("interp");

var ctx = canvas.getContext('2d');

let clearColour = 'rgb(0,0,0)';
let lineColour = 'rgb(0,0,200)';
let handleColour = 'rgb(100,0,100)';
let handleBorderColour = 'rgb(200,0,200)';
let lerpColour = 'rgb(200,200,200)';
let ghostColour = 'rgb(50,50,50)';

ctx.fillStyle = clearColour;
ctx.lineCap = "round";

let dt = 0.1;

let point1Held = false;
let point2Held = false;
let point3Held = false;
let point4Held = false;

let lines = [];

let handleRadius = 6;
let endPointRadius = 10;

let pos1Orig = [300, canvas.height - 100];
let pos2Orig = [300, canvas.height - 600];
let pos3Orig = [1200, canvas.height - 600];
let pos4Orig = [1200, canvas.height - 100];

let lerp12Orig = [pos1Orig, pos2Orig];
let lerp23Orig = [pos2Orig, pos3Orig];
let lerp34Orig = [pos3Orig, pos4Orig];

let posLerp12Orig = pos1Orig;
let posLerp23Orig = pos2Orig;
let posLerp34Orig = pos3Orig;

let lerpLerp12Orig = [posLerp12Orig, posLerp23Orig];
let lerpLerp23Orig = [posLerp23Orig, posLerp34Orig];

let posLerpLerp12Orig = lerpLerp12Orig[0];
let posLerpLerp23Orig = lerpLerp23Orig[0];

let lerpLerpLerp12Orig = [posLerpLerp12Orig, posLerpLerp23Orig];

let posLerpLerpLerp12Orig = lerpLerpLerp12Orig[0];

let pos1 = pos1Orig;
let pos2 = pos2Orig;
let pos3 = pos3Orig;
let pos4 = pos4Orig;

let lerp12 = [pos1, pos2];
let lerp23 = [pos2, pos3];
let lerp34 = [pos3, pos4];

let posLerp12 = pos1;
let posLerp23 = pos2;
let posLerp34 = pos3;

let lerpLerp12 = [posLerp12, posLerp23];
let lerpLerp23 = [posLerp23, posLerp34];

let posLerpLerp12 = lerpLerp12[0];
let posLerpLerp23 = lerpLerp23[0];

let lerpLerpLerp12 = [posLerpLerp12, posLerpLerp23];

let posLerpLerpLerp12 = lerpLerpLerp12[0];

let lerpInterval = lerpSlider.value / 1000;

function initialisePoints()
{
    lerp12Orig = [pos1Orig, pos2Orig];
    lerp23Orig = [pos2Orig, pos3Orig];
    lerp34Orig = [pos3Orig, pos4Orig];

    posLerp12Orig = pos1Orig;
    posLerp23Orig = pos2Orig;
    posLerp34Orig = pos3Orig;

    lerpLerp12Orig = [posLerp12Orig, posLerp23Orig];
    lerpLerp23Orig = [posLerp23Orig, posLerp34Orig];

    posLerpLerp12Orig = lerpLerp12Orig[0];
    posLerpLerp23Orig = lerpLerp23Orig[0];

    lerpLerpLerp12Orig = [posLerpLerp12Orig, posLerpLerp23Orig];

    posLerpLerpLerp12Orig = lerpLerpLerp12Orig[0];
}

function update()
{
    updateCurve();
    lerpInterval = lerpSlider.value / 1000;
    updatePath();
}

function updatePath()
{
    posLerp12 = updateLerp(lerp12, lerpInterval);
    posLerp23 = updateLerp(lerp23, lerpInterval);
    posLerp34 = updateLerp(lerp34, lerpInterval);

    lerpLerp12 = [posLerp12, posLerp23];
    lerpLerp23 = [posLerp23, posLerp34];

    posLerpLerp12 = updateLerp(lerpLerp12, lerpInterval);
    posLerpLerp23 = updateLerp(lerpLerp23, lerpInterval);

    lerpLerpLerp12 = [posLerpLerp12, posLerpLerp23]

    posLerpLerpLerp12 = updateLerp(lerpLerpLerp12, lerpInterval);
}

function updateOrigPath()
{
    posLerp12Orig = updateLerp(lerp12Orig, lerpInterval);
    posLerp23Orig = updateLerp(lerp23Orig, lerpInterval);
    posLerp34Orig = updateLerp(lerp34Orig, lerpInterval);

    lerpLerp12Orig = [posLerp12Orig, posLerp23Orig];
    lerpLerp23Orig = [posLerp23Orig, posLerp34Orig];

    posLerpLerp12Orig = updateLerp(lerpLerp12Orig, lerpInterval);
    posLerpLerp23Orig = updateLerp(lerpLerp23Orig, lerpInterval);

    lerpLerpLerp12Orig = [posLerpLerp12Orig, posLerpLerp23Orig]

    posLerpLerpLerp12Orig = updateLerp(lerpLerpLerp12Orig, lerpInterval);
}

function updateCurve()
{
    lines = [];
    initialisePoints();
    for (let i = 0; i < 1000; i++) {
        lerpInterval = i / 1000;
        let startPos = posLerpLerpLerp12Orig;
        updateOrigPath();
        lines.push([startPos, posLerpLerpLerp12Orig]);
    }
}

function updateLerp(lerp, interval)
{
    return [lerp[0][0] + (lerp[1][0] - lerp[0][0]) * interval, lerp[0][1] + (lerp[1][1] - lerp[0][1]) * interval]
}

function draw()
{
    // Clear canvas
    ctx.beginPath();
    ctx.fillStyle = clearColour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    // Draw ghost curve
    drawCurve();

    // Draw handle lines
    drawLine(pos1, pos2);
    drawLine(pos2, pos3);
    drawLine(pos3, pos4);

    // Draw lerp line
    drawLine(lerpLerp12[0], lerpLerp12[1]);
    drawLine(lerpLerp23[0], lerpLerp23[1]);

    // Draw lerp lerp line
    drawLine(posLerpLerp12, posLerpLerp23);

    // Draw lerps
    drawLerp(posLerp12);
    drawLerp(posLerp23);
    drawLerp(posLerp34);

    // Draw lerp lerps
    drawLerp(posLerpLerp12);
    drawLerp(posLerpLerp23);
    
    // Draw lerp lerp lerp
    drawFinalLerp(posLerpLerpLerp12);

    // Draw handles
    drawEndPoint(pos1);
    drawHandle(pos2);
    drawHandle(pos3);
    drawEndPoint(pos4);
}

function ConstructCurve()
{
    while (true)
    {

    }
}

function drawCurve()
{
    lines.forEach(function(line) {
        drawGhostLine(line[0], line[1]);
    });
}

function drawLine(posStart, posEnd)
{
    ctx.lineWidth = 2;
    ctx.strokeStyle = lineColour;
    ctx.beginPath();        
    ctx.moveTo(posStart[0], posStart[1]);
    ctx.lineTo(posEnd[0], posEnd[1]);
    ctx.stroke();
}

function drawGhostLine(posStart, posEnd)
{
    ctx.lineWidth = 10;
    ctx.strokeStyle = ghostColour;
    ctx.beginPath();        
    ctx.moveTo(posStart[0], posStart[1]);
    ctx.lineTo(posEnd[0],posEnd[1]);
    ctx.stroke();
}

function drawEndPoint(pos)
{
    ctx.fillStyle = 'rgb(300, 0, 0)';
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], endPointRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'rgb(200,200,0)';
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 8, 0, 2 * Math.PI);
    ctx.fill();
}

function drawHandle(pos)
{
    ctx.fillStyle = handleBorderColour;
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], handleRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = handleColour;
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 4, 0, 2 * Math.PI);
    ctx.fill();
}

function drawLerp(pos)
{
    ctx.fillStyle = lerpColour;
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 5, 0, 2 * Math.PI);
    ctx.fill();
}

function drawFinalLerp(pos)
{
    ctx.fillStyle = 'rgb(255,0,0)';
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 5, 0, 2 * Math.PI);
    ctx.fill();
}

lerpSlider.addEventListener('input', function(event) {
    lerpInterval = lerpSlider.value / 1000;
    let interpString = "Interpolation : " + lerpInterval.toFixed(3);
    interpLabel.textContent = interpString.padEnd(21,'\xa0');
}, false);

canvas.addEventListener('mousedown', function(event) {
    let dx1 = pos1Orig[0] - (event.clientX - canvas.offsetLeft - canvas.clientLeft);
    let dy1 = pos1Orig[1] - (event.clientY - canvas.offsetTop - canvas.clientTop);
    let dx2 = pos2Orig[0] - (event.clientX - canvas.offsetLeft - canvas.clientLeft);
    let dy2 = pos2Orig[1] - (event.clientY - canvas.offsetTop - canvas.clientTop);
    let dx3 = pos3Orig[0] - (event.clientX - canvas.offsetLeft - canvas.clientLeft);
    let dy3 = pos3Orig[1] - (event.clientY - canvas.offsetTop - canvas.clientTop);
    let dx4 = pos4Orig[0] - (event.clientX - canvas.offsetLeft - canvas.clientLeft);
    let dy4 = pos4Orig[1] - (event.clientY - canvas.offsetTop - canvas.clientTop);
    if ((dx1 * dx1 + dy1 * dy1) <= (endPointRadius * endPointRadius) * 4)
    {
        point1Held = true;
        return;
    }
    else if ((dx2 * dx2 + dy2 * dy2) <= (handleRadius * handleRadius) * 4)
    {
        point2Held = true;
        return;
    }
    else if ((dx3 * dx3 + dy3 * dy3) <= (handleRadius * handleRadius) * 4)
    {
        point3Held = true;
        return;
    }
    else if ((dx4 * dx4 + dy4 * dy4) <= (endPointRadius * endPointRadius) * 4)
    {
        point4Held = true;
        return;
    }
}, false);

canvas.addEventListener('mouseup', function(event) {
    point1Held = false;
    point2Held = false;
    point3Held = false;
    point4Held = false;
}, false);

canvas.addEventListener('mousemove', function(event) {
    if (point1Held)
    {
        pos1Orig[0] = (event.clientX - canvas.offsetLeft - canvas.clientLeft);
        pos1Orig[1] = (event.clientY - canvas.offsetTop - canvas.clientTop);
    }
    else if (point2Held)
    {
        pos2Orig[0] = (event.clientX - canvas.offsetLeft - canvas.clientLeft);
        pos2Orig[1] = (event.clientY - canvas.offsetTop - canvas.clientTop);
    }
    else if (point3Held)
    {
        pos3Orig[0] = (event.clientX - canvas.offsetLeft - canvas.clientLeft);
        pos3Orig[1] = (event.clientY - canvas.offsetTop - canvas.clientTop);
    }
    else if (point4Held)
    {
        pos4Orig[0] = (event.clientX - canvas.offsetLeft - canvas.clientLeft);
        pos4Orig[1] = (event.clientY - canvas.offsetTop - canvas.clientTop);
    }
}, false);

startAnimating(60);

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}

function animate()
{
    // request another frame
    requestAnimationFrame(animate);

    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        //
        // Put dynamics code here
        //
        update();

        //
        // Put your drawing code here
        //
        draw()
    }    
}