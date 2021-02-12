// Selects canvas element to draw on from page 
var canvas = document.getElementById("writer");

var resetButton = document.getElementById("resetButton");
var rewriteButton = document.getElementById("rewriteButton");
var speedSlider = document.getElementById("speedSlider");
var writeSpeedText = document.getElementById("writeSpeedText");
var loopCheckbox = document.getElementById("loopCheckbox");

var ctx = canvas.getContext('2d');


function mod(n, m) 
{
    return ((n % m) + m) % m;
}

// Colours


let defaultColour = 'rgb(240, 240, 240)';

let selectedPageColour = defaultColour;


ctx.fillStyle = selectedPageColour;
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = 'rgb(0, 0, 0)';

// Load images
let greyLineImage = new Image();
greyLineImage.src = "grey-lines.png";
let blueLineImage = new Image();
blueLineImage.src = "blue-dotted-lines.png";
let redBlueLineImage = new Image();
redBlueLineImage.src = "red-blue-lines.png";

let selectedBackground;

selectedBackground = redBlueLineImage;


selectedBackground.onload = () => { ctx.drawImage(selectedBackground, 0, 0); };


let smallPenWidth = "5";
let mediumPenWidth = "10";
let largePenWidth = "20";

let selectedPenWidth = mediumPenWidth;

ctx.lineWidth = selectedPenWidth;
ctx.lineCap = "round";

let mouseX = 0;
let mouseY = 0;
let mouseHeld = false;

let isRewriting = false;

let isLooping = false;

let originX = 0;
let originY = 0; 

let storedLines = [];


let rewriteSpeed = speedSlider.value;

let speedMultiplier = 0.1 * rewriteSpeed;

writeSpeedText.textContent = "Write Speed: " + speedMultiplier;

function getMousePos(e)
{
    let bound = canvas.getBoundingClientRect();

    let x = e.clientX - bound.left - canvas.clientLeft;
    let y = e.clientY - bound.top - canvas.clientTop;

    return [x, y];
}

function resetCanvas(ctx)
{
    ctx.fillStyle = selectedPageColour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.drawImage(selectedBackground, 0, 0);
    isRewriting = false;
    storedLines = [];
}

// Pen options buttons
smallPenButton.onclick = function()
{
    selectedPenWidth = smallPenWidth;
}
mediumPenButton.onclick = function()
{
    selectedPenWidth = mediumPenWidth;
}
largePenButton.onclick = function()
{
    selectedPenWidth = largePenWidth;
}

// Page background buttons
backgroundButton1.onclick = function()
{
    selectedBackground = redBlueLineImage;
    resetCanvas(ctx);
}
backgroundButton2.onclick = function()
{
    selectedBackground = blueLineImage;
    resetCanvas(ctx);
}
backgroundButton3.onclick = function()
{
    selectedBackground = greyLineImage;
    resetCanvas(ctx);
}

// Bottom controls
resetButton.onclick = function()
{
    resetCanvas(ctx);
}

rewriteButton.onclick = async function()
{
    
    if (!isRewriting)
    {
        isRewriting = true;
        
        do 
        {
            ctx.fillStyle = selectedPageColour;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(selectedBackground, 0, 0);
            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.lineWidth = selectedPenWidth;
   
            for (i = 0; i < storedLines.length; i++)
            {
                ctx.beginPath();        
                ctx.moveTo(storedLines[i][0], storedLines[i][1]);
                ctx.lineTo(storedLines[i][2], storedLines[i][3]);
                ctx.stroke();
            
                await new Promise(r => setTimeout(r, 50 / speedMultiplier));
            } 

            if (isLooping)
            {
                await new Promise(r => setTimeout(r, 1000));
            }
        } while (isLooping & isRewriting);

        isRewriting = false;
    }
}


speedSlider.onchange = function()
{
    rewriteSpeed = speedSlider.value;
    speedMultiplier = 0.1 * rewriteSpeed;
    speedMultiplier = speedMultiplier.toFixed(1);

    writeSpeedText.textContent = "Write Speed: " + speedMultiplier;
}

loopCheckbox.onchange = function()
{
    if (loopCheckbox.checked)
    {
        isLooping = true;
    }
    else
    {
        isLooping = false;
    }
}


// When mouse clicked, draws line on click and sets mouseHeld to true for 'mousemove' events. 
writer.ontouchstart = function(event) 
{
    console.log("TOUCH\n");
    if (!isRewriting)
    {

        ctx.beginPath();        
        ctx.lineWidth = selectedPenWidth;


        let bound = canvas.getBoundingClientRect();

        mouseX = event.clientX - bound.left - canvas.clientLeft;
        mouseY = event.clientY - bound.top - canvas.clientTop;

        //console.log("(", originX, ", ", originY, ") to (", mouseX, ", ", mouseY, ")");
        
        ctx.moveTo(mouseX, mouseY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();

        storedLines.push([mouseX, mouseY, mouseX, mouseY]);

        originX = mouseX;
        originY = mouseY;

        mouseHeld = true;
    }
};

document.addEventListener('mousedown', event => 
{
    if (!isRewriting)
    {

        ctx.beginPath();        
        ctx.lineWidth = selectedPenWidth;


        let bound = canvas.getBoundingClientRect();

        mouseX = event.clientX - bound.left - canvas.clientLeft;
        mouseY = event.clientY - bound.top - canvas.clientTop;

        //console.log("(", originX, ", ", originY, ") to (", mouseX, ", ", mouseY, ")");
        
        ctx.moveTo(mouseX, mouseY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();

        storedLines.push([mouseX, mouseY, mouseX, mouseY]);

        originX = mouseX;
        originY = mouseY;

        mouseHeld = true;
    }
});

document.ontouchend = function(event) 
{
    mouseHeld = false;
};

document.addEventListener('mouseup', event => 
{
    mouseHeld = false;
});

document.ontouchmove = function(event) 
{
    if (mouseHeld)
    {
        ctx.beginPath();        
        ctx.lineWidth = selectedPenWidth;

        ctx.moveTo(originX, originY);
        let bound = canvas.getBoundingClientRect();

        mouseX = event.clientX - bound.left - canvas.clientLeft;
        mouseY = event.clientY - bound.top - canvas.clientTop;

        //console.log("(", originX, ", ", originY, ") to (", mouseX, ", ", mouseY, ")");

        storedLines.push([originX, originY, mouseX, mouseY]);

        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();

        originX = mouseX;
        originY = mouseY;
        
    }
};

document.addEventListener('mousemove', event => 
{
    if (mouseHeld)
    {
        ctx.beginPath();        
        ctx.lineWidth = selectedPenWidth;

        ctx.moveTo(originX, originY);
        let bound = canvas.getBoundingClientRect();

        mouseX = event.clientX - bound.left - canvas.clientLeft;
        mouseY = event.clientY - bound.top - canvas.clientTop;

        //console.log("(", originX, ", ", originY, ") to (", mouseX, ", ", mouseY, ")");

        storedLines.push([originX, originY, mouseX, mouseY]);

        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();

        originX = mouseX;
        originY = mouseY;
        
    }
});
