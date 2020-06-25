var canvas = document.getElementById("forestfire");

var ctx = canvas.getContext('2d');

function mod(n, m) 
{
    return ((n % m) + m) % m;
}


ctx.fillStyle = 'rgb(200,0,0)';

let counter = 0;

cellSize = 2;
borderWidth = 4;

let forestWidth = 300;
let forestHeight = 300;

let cWidth = canvas.width;
let cHeight = canvas.height;

canvas.width = cellSize*forestWidth + 2*borderWidth;
canvas.height = cellSize*forestHeight + 2*borderWidth;

let growthProb = 0.01;
let fireProb = 0.0001;

let forestArray = [];

for(let i = 0; i < forestHeight; i++)
{
    let arrayRow = [];
    for(let j = 0; j < forestWidth; j++)
    {
        arrayRow.push(0);
    }
    forestArray.push(arrayRow);
}
console.log(forestArray);

startAnimating(30);

ctx.fillStyle = 'rgb(100,100,100)';
ctx.fillRect(0, 0, forestWidth*cellSize + 2*borderWidth, forestHeight*cellSize + 2*borderWidth);
        

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

        // Put your drawing code here
        let newForestArray = [];

        for(let i = 0; i < forestHeight; i++)
        {
            let newForestRow = [];
            for(let j = 0; j < forestWidth; j++)
            {
                if(forestArray[i][j] == 0)
                {
                    let growthCheck = Math.random();
                    if(growthCheck < growthProb)
                    {
                        newForestRow.push(1);
                    }
                    else
                    {
                        newForestRow.push(0);
                    }
                }
                else if(forestArray[i][j] == 1)
                {
                    let fireCheck = Math.random();
                    if(fireCheck < fireProb)
                    {
                        newForestRow.push(2);
                    }
                    else if((forestArray[mod((i+1),forestWidth)][mod(j,forestHeight)] == 2) || (forestArray[mod((i-1),forestWidth)][mod(j,forestHeight)] == 2) || (forestArray[mod(i,forestWidth)][mod((j+1),forestHeight)] == 2) || (forestArray[mod(i,forestWidth)][mod((j-1),forestHeight)] == 2))
                    {
                        newForestRow.push(2);
                    }
                    else
                    {
                        newForestRow.push(1);
                    }
                }
                else if (forestArray[i][j] == 2)
                {
                    newForestRow.push(0);
                }
            }
            newForestArray.push(newForestRow);
        }

        for(let slice=0; slice < forestHeight; slice++)
        {
            forestArray[slice] = newForestArray[slice].slice();
        }
        console.log(forestArray);
        console.log(counter);

        ctx.fillStyle = 'rgb(107,107,107)';
        ctx.fillRect(0, 0, forestWidth*cellSize + 2*borderWidth, forestHeight*cellSize + 2*borderWidth);
        for(let i = 0; i < forestHeight; i++)
        {
            for(let j = 0; j < forestWidth; j++)
            {
                if(forestArray[i][j] == 0)
                {
                    ctx.fillStyle = 'rgb(0,0,0)';
                    ctx.fillRect(i*cellSize + borderWidth, j*cellSize + borderWidth, cellSize, cellSize);
                }
                if(forestArray[i][j] == 1)
                {
                    ctx.fillStyle = 'rgb(0,255,0)';
                    ctx.fillRect(i*cellSize + borderWidth, j*cellSize + borderWidth, cellSize, cellSize);
                }
                if(forestArray[i][j] == 2)
                {
                    ctx.fillStyle = 'rgb(255,149,0)';
                    ctx.fillRect(i*cellSize + borderWidth, j*cellSize + borderWidth, cellSize, cellSize);
                }
            }
        }
        counter++;
    }    
}
