var canvas = document.getElementById("canvas");

var ctx = canvas.getContext('2d', { alpha: false });

ctx.fillStyle = 'rgb(0,0,0)';


// Initialise puck values
let puckSpawnPos = [canvas.width / 2, canvas.height / 2 ];
let puckPos = puckSpawnPos.slice();
let puckPosOld = puckPos.slice();

let puckVel = [0, 0];

let puckRadius = 15;
let puckSpeedLimit = 300;
let isPuckScoring = false;

// Initialise player values
let playerPos = [80, canvas.height / 2];
let playerPosNew = playerPos.slice();
let playerVel = [0, 0];
let playerRadius = 30;


let playerTargetPos = playerPos.slice();
let playerSpeedLimit = 10;

// Initialise AI values
let aiSpawnPos = [canvas.width - 80, canvas.height / 2];
let aiPos = aiSpawnPos.slice();
let aiVel = [0, 0];
let aiRadius = 30;


let aiTargetPos = aiPos.slice();
let aiSpeedLimit = 10;

// Rink properties
let pitchCircleRadius = 70;
let pitchLineWidth = 2;
let goalWidth = 120;

// Objective properties
let playerScoreText = "Score: ";
let playerScore = 0;

let aiScoreText = "Score: ";
let aiScore = 0;



let dt = 0.1;

let mouseHeld = false;

canvas.addEventListener('mousedown', function(event) {
    mouseHeld = true;
    playerTargetPos[0] = event.clientX - canvas.offsetLeft - canvas.clientLeft;
    playerTargetPos[1] = event.clientY - canvas.offsetTop - canvas.clientTop;
}, false);

canvas.addEventListener('mouseup', function(event) {
    mouseHeld = false;
}, false);

canvas.addEventListener('mousemove', function(event) {
    if (mouseHeld)
    {
        playerTargetPos[0] = event.clientX - canvas.offsetLeft - canvas.clientLeft;
        playerTargetPos[1] = event.clientY - canvas.offsetTop - canvas.clientTop;
    }
}, false);

function update()
{
    // Update player striker velocity
    playerVel = [playerTargetPos[0] - playerPos[0], playerTargetPos[1] - playerPos[1]];


    // Update ai striker
    if (puckPos[0] > canvas.width / 2)
    { 
        aiTargetPos = [puckPos[0], puckPos[1]];
        aiVel = [(aiTargetPos[0] - aiPos[0]) * 0.3, (aiTargetPos[1] - aiPos[1]) * 0.8];
    }

    else if (puckPos[0] <= canvas.width / 2 || (puckVel[0] < 0 && puckPos[0] < canvas.width * 0.75))
    {
        aiTargetPos = aiSpawnPos.slice();
        aiVel = [(aiTargetPos[0] - aiPos[0]) * 0.5, (aiTargetPos[1] - aiPos[1]) * 0.5];
    }
    

    // Detects wall/goal collision
    if (!isPuckScoring)
    {
        if ((puckPos[0] + puckRadius > canvas.width || puckPos[0] - puckRadius < 0) && ((puckPos[1] - puckRadius) < (canvas.height / 2 - goalWidth / 2) || (puckPos[1] + puckRadius) > (canvas.height / 2 + goalWidth / 2)))
        {
            puckVel[0] *= -1;
            puckPos = puckPosOld.slice();
        }
    }
    if (puckPos[1] + puckRadius > canvas.height || puckPos[1] - puckRadius < 0)
    {
        puckVel[1] *= -1;
        puckPos = puckPosOld;
    }

    if (puckPos[0] <= 0)
    {
        aiScore++;
        isPuckScoring = true;
        resetPuck();
    }

    if (puckPos[0] >= canvas.width)
    {
        playerScore++;
        isPuckScoring = true;
        resetPuck();
    }

    // Detects player collision
    
    if (Math.pow(puckPos[0] - playerPos[0], 2) + Math.pow(puckPos[1] - playerPos[1], 2) <= Math.pow(playerRadius + puckRadius, 2))
    {
        console.log("COLLIDED");

        // Gives puck new velocity
        puckVel = playerCollision(puckPos, playerPos, puckVel, playerVel);
        playerVel = [-puckVel[0] / 2, -puckVel[1] / 2]

        // Puts puck outside of player striker.
        let centerDistance = Math.sqrt(Math.pow(puckPos[0] - playerPos[0], 2) + Math.pow(puckPos[1] - playerPos[1], 2));
        let collisionAngle = Math.atan2(puckPos[1] - playerPos[1], puckPos[0] - playerPos[0]);
        puckPos[0] += ((puckRadius + playerRadius) - centerDistance) * Math.cos(collisionAngle);
        puckPos[1] += ((puckRadius + playerRadius) - centerDistance) * Math.sin(collisionAngle);

        // Enforces speed limit
        if (Math.pow(puckVel[0], 2) + Math.pow(puckVel[1], 2) > Math.pow(puckSpeedLimit, 2))
        {
            let scaleFactor = Math.sqrt(Math.pow(puckVel[0], 2) + Math.pow(puckVel[1], 2)) / puckSpeedLimit;
            puckVel[0] /= scaleFactor;
            puckVel[1] /= scaleFactor;
        }
    }
    else {
        console.log("not collided");
    }
    // Detects ai collision
    if (Math.pow(puckPos[0] - aiPos[0], 2) + Math.pow(puckPos[1] - aiPos[1], 2) <= Math.pow(aiRadius + puckRadius, 2))
    {
        // Gives puck new velocity
        puckVel = playerCollision(puckPos, aiPos, puckVel, aiVel);
        aiVel = [-puckVel[0] / 2, -puckVel[1] / 2];

        // Puts puck outside of ai striker.
        let centerDistance = Math.sqrt(Math.pow(puckPos[0] - aiPos[0], 2) + Math.pow(puckPos[1] - aiPos[1], 2));
        let collisionAngle = Math.atan2(puckPos[1] - aiPos[1], puckPos[0] - aiPos[0]);
        puckPos[0] += ((puckRadius + aiRadius) - centerDistance) * Math.cos(collisionAngle);
        puckPos[1] += ((puckRadius + aiRadius) - centerDistance) * Math.sin(collisionAngle);

        
        // Enforces speed limit
        if (Math.pow(puckVel[0], 2) + Math.pow(puckVel[1], 2) > Math.pow(puckSpeedLimit, 2))
        {
            let scaleFactor = Math.sqrt(Math.pow(puckVel[0], 2) + Math.pow(puckVel[1], 2)) / puckSpeedLimit;
            puckVel[0] /= scaleFactor;
            puckVel[1] /= scaleFactor;
        }
    }

    // Update puck
    puckPosOld = puckPos.slice();

    puckPos[0] += puckVel[0] * dt ;
    puckPos[1] += puckVel[1] * dt;

    if (puckPos[1] > canvas.width)
    {
        aiPos = aiSpawnPos.slice();
        puckPos = puckSpawnPos.slice();
    }

    puckVel[0] *= 0.995;
    puckVel[1] *= 0.995;

    // Update player position
    playerPos[0] += playerVel[0] * dt;
    playerPos[1] += playerVel[1] * dt;

    if (playerPos[0] > canvas.width / 2)
    {
        playerPos[0] = canvas.width / 2;
    }

    // Update ai position
    aiPos[0] += aiVel[0] * dt;
    aiPos[1] += aiVel[1] * dt;
}

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

      
        // Draw rink
        ctx.beginPath();
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fill();

        // Goals
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.fillRect(0, canvas.height / 2 - goalWidth / 2, 50, goalWidth);
        ctx.fill();

        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.beginPath();
        ctx.fillRect(0 + pitchLineWidth, canvas.height / 2 - goalWidth / 2 + pitchLineWidth, 50 - pitchLineWidth * 2, goalWidth - pitchLineWidth * 2);
        ctx.fill();

        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.fillRect(canvas.width - 50, canvas.height / 2 - goalWidth / 2, 50, goalWidth);
        ctx.fill();

        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.beginPath();
        ctx.fillRect(canvas.width - 50 + pitchLineWidth, canvas.height / 2 - goalWidth / 2 + pitchLineWidth, 50 - pitchLineWidth * 2, goalWidth - pitchLineWidth * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(20, 0, canvas.width -  2 * 20, canvas.height);
        ctx.fill();

        // Left circle
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.arc(20 + pitchLineWidth / 2, canvas.height / 2, pitchCircleRadius, Math.PI * 1.5 , 0.5 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.beginPath();
        ctx.arc(20 + pitchLineWidth / 2, canvas.height / 2, pitchCircleRadius - pitchLineWidth, Math.PI * 1.5, 0.5 * Math.PI);
        ctx.fill();

        // Right circle
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.arc(canvas.width - 20 - pitchLineWidth / 2, canvas.height / 2, pitchCircleRadius, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.beginPath();
        ctx.arc(canvas.width - 20 - pitchLineWidth / 2, canvas.height / 2, pitchCircleRadius - pitchLineWidth, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.fill();

        // Middle circle
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pitchCircleRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pitchCircleRadius - pitchLineWidth, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pitchCircleRadius / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pitchCircleRadius / 2 - pitchLineWidth, 0, 2 * Math.PI);
        ctx.fill();

        // Middle line
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.fillRect(canvas.width / 2 - pitchLineWidth / 2, 0, pitchLineWidth, canvas.height);
        ctx.fill();

        // Parallel lines inner
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.fillRect(canvas.width / 2 - pitchLineWidth / 2 - canvas.width / 5, 0, pitchLineWidth, canvas.height);
        ctx.fill();
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.fillRect(canvas.width / 2 - pitchLineWidth / 2 + canvas.width / 5, 0, pitchLineWidth, canvas.height);
        ctx.fill();
        
        // Parallel lines outer
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.fillRect(20 - pitchLineWidth / 2, 0, pitchLineWidth, canvas.height);
        ctx.fill();
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.beginPath();
        ctx.fillRect(canvas.width - pitchLineWidth / 2 - 20, 0, pitchLineWidth, canvas.height);
        ctx.fill();
        
        // Draw score texts
        ctx.font = "20px Arial";
        ctx.fillStyle = 'rgb(100, 0, 0)';
        ctx.fillText(playerScoreText + playerScore, 80, 30);
        ctx.fillStyle = 'rgb(0, 0, 100)';
        ctx.fillText(aiScoreText + aiScore, canvas.width - ctx.measureText(playerScoreText + playerScore).width - 80, 30);

        // Draw player striker
        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.beginPath();
        ctx.arc(playerPos[0], playerPos[1], playerRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'rgb(150, 0, 0)';
        ctx.beginPath();
        ctx.arc(playerPos[0], playerPos[1], playerRadius * 0.8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.beginPath();
        ctx.arc(playerPos[0], playerPos[1], playerRadius / 2, 0, 2 * Math.PI);
        ctx.fill();


        // Draw ai striker
        ctx.fillStyle = 'rgb(0, 0, 200)';
        ctx.beginPath();
        ctx.arc(aiPos[0], aiPos[1], aiRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'rgb(0, 0, 150)';
        ctx.beginPath();
        ctx.arc(aiPos[0], aiPos[1], aiRadius * 0.8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'rgb(0, 0, 200)';
        ctx.beginPath();
        ctx.arc(aiPos[0], aiPos[1], aiRadius / 2, 0, 2 * Math.PI);
        ctx.fill();

        // Draw puck
        ctx.fillStyle = 'rgb(20,20,20)';
        ctx.beginPath();
        ctx.arc(puckPos[0], puckPos[1], puckRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgb(40,40, 40)';
        ctx.beginPath();
        ctx.arc(puckPos[0], puckPos[1], puckRadius * 0.8, 0, 2 * Math.PI);
        ctx.fill();
    }    
}

// Calculates velocity after puck collides with player !!FIX!!
function playerCollision(puckPos, playerPos, puckVel, playerVel)
{
    let relVel = [puckVel[0] - playerVel[0], puckVel[1] - playerVel[1]];

    let relSpeed = Math.sqrt(Math.pow(relVel[0], 2) + Math.pow(relVel[1], 2));

    let bisectVector = [puckPos[0] - playerPos[0], puckPos[1] - playerPos[1]];
    
    let tangentVector = [-bisectVector[1], bisectVector[0]];
    let tangentVectorMag = Math.sqrt(Math.pow(tangentVector[0], 2) + Math.pow(tangentVector[1], 2));

    let tangentVectorNormalised = [tangentVector[0] / tangentVectorMag, tangentVector[1] / tangentVectorMag];

    let dotProduct = tangentVectorNormalised[0] * relVel[0] + tangentVectorNormalised[1] * relVel[1];

    let projectionVec = [tangentVectorNormalised[0] * dotProduct, tangentVectorNormalised[1] * dotProduct];

    let perpVec = [relVel[0] - projectionVec[0], relVel[1] - projectionVec[1]];

    let returnVector = relVel.slice();

    returnVector[0] -= 2 * perpVec[0];
    returnVector[1] -= 2 * perpVec[1];

    let returnVectorMag = Math.sqrt(Math.pow(returnVector[0], 2) + Math.pow(returnVector[1], 2));

    returnVector[0] /= returnVectorMag;
    returnVector[1] /= returnVectorMag;
    
    returnVector[0] *= relSpeed;
    returnVector[1] *= relSpeed;
    
    return returnVector;
}

function resetPuck()
{
    puckPos = [canvas.width / 2, canvas.height / 2];
    puckVel = [0, 0];
    isPuckScoring = false;
}