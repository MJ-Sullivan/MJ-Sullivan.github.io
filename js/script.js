var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);
camera.position.x = 5
camera.position.z = 10
camera.position.y = 0.5
var renderer = new THREE.WebGL1Renderer({antialias: true});

renderer.setSize(0.8 * window.innerWidth, 0.8 * window.innerHeight);
renderer.setClearColor(0x8AAFF3, 1);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;

var container = document.getElementById("main");
container.appendChild(renderer.domElement);

var controls = new THREE.PointerLockControls(camera, renderer.domElement);


window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

renderer.domElement.addEventListener(
    'click',
    function () {
        controls.lock()
    },
    false
)

var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

let wHeld = false;
let sHeld = false;
let aHeld = false;
let dHeld = false;

let upHeld = false;
let downHeld = false;
let leftHeld = false;
let rightHeld = false;

let iHeld = false;
let kHeld = false;

let pHeld = false;
 
let moveIncrement = 0.1;

let isPaused = false;

function onKeyDown(e)
{
    console.log(e.code);
    switch (e.code) {
        case "KeyP":
            if (!pHeld)
            {
                isPaused = !isPaused;
                console.log(plight.position.x, ", ", plight.position.y, ", ", plight.position.z)
                controls.unlock();
            }
            pHeld = true;
            break;
        case "KeyW":
            wHeld = true;
            break;
        case "KeyS":
            sHeld = true;
            break;
        case "KeyA":
            aHeld = true;
            break;
        case "KeyD":
            dHeld = true;
            break;
        case "ArrowUp":
            upHeld = true;
            break;
        case "ArrowDown":
            downHeld = true;
            break;
        case "ArrowLeft":
            leftHeld = true;
            break;
        case "ArrowRight":
            rightHeld = true;
            break;
        case "KeyI":
            iHeld = true;
            break;
        case "KeyK":
            kHeld = true;
            break;
    }
}

function onKeyUp(e)
{
    switch (e.code) {
        case "KeyP":
            pHeld = false;
            break;
        case "KeyW":
            wHeld = false;
            break;
        case "KeyS":
            sHeld = false;
            break;
        case "KeyA":
            aHeld = false;
            break;
        case "KeyD":
            dHeld = false;
            break;
        case "ArrowUp":
            upHeld = false;
            break;
        case "ArrowDown":
            downHeld = false;
            break;
        case "ArrowLeft":
            leftHeld = false;
            break;
        case "ArrowRight":
            rightHeld = false;
            break;
        case "KeyI":
            iHeld = false;
            break;
        case "KeyK":
            kHeld = false;
            break;
    }
}

var plight = new THREE.PointLight( 0xfffde6, 1, 100);
plight.position.set(1.3, 1.5, 1);
plight.castShadow = true;

plight.shadow.mapSize.width = 1024; // default
plight.shadow.mapSize.height = 1024; // default

plight.shadow.bias = -0.001;
scene.add(plight);

var plight2 = new THREE.PointLight( 0xfffde6, 1, 100);
plight2.position.set(10, 1.5, 7);
plight2.castShadow = true;

plight2.shadow.mapSize.width = 1024; // default
plight2.shadow.mapSize.height = 1024; // default

plight2.shadow.bias = -0.001;
scene.add(plight2);

var alight = new THREE.AmbientLight(0xe6ffff, 1)
scene.add(alight)

const plightHelper = new THREE.PointLightHelper(plight, 0.1);
scene.add(plightHelper);

// var alight = new THREE.AmbientLight(0xffffff, 3);
// scene.add(alight);

let objects = {};
var material = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
var loader = new THREE.GLTFLoader();
var dloader = new THREE.DRACOLoader();
dloader.setDecoderPath( 'js/libs/draco/' );
loader.setDRACOLoader(dloader);
addObject("room", "room.gltf", new THREE.Vector3(0, -2.3, 0));
addObject("cube", "batcube.gltf", new THREE.Vector3(10, -0, 0));
addObject("floor", "floor.gltf", new THREE.Vector3(0, -2, 0));


async function addObject(name, file, position)
{
        const geom = await new Promise(resolve => {
            loader.load(file, geometry => {
                resolve(geometry);
            })})
            geom.scene.traverse( function( node ) {

                if ( node.isMesh ) { 
                    node.castShadow = true; 
                    node.receiveShadow = true;
                }
        
            } );
            if (name === "cube")
            {
                const vidTex = new THREE.VideoTexture(document.getElementById('video'));
                vidTex.flipY = false;
                const videoMat = new THREE.MeshBasicMaterial( {map: vidTex, side: THREE.DoubleSide, toneMapped: false});
                geom.scene.traverse(child => {
                    if (child.material) {
                      child.material = videoMat;
                    }
                  });
                  document.getElementById('video').play()
            }
            
            scene.add(geom.scene);
            geom.scene.position.set(position.x, position.y, position.z);
}


function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}

var animate = function() {
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
        

         if (wHeld)
         {
             controls.moveForward(moveIncrement);
         }
         if (sHeld)
         {
             controls.moveForward(-moveIncrement);
         }
         if (aHeld)
         {
             controls.moveRight(-moveIncrement);
         }
         if (dHeld)
         {
             controls.moveRight(moveIncrement);
         }
     
         if (upHeld)
         {
             plight.position.y += moveIncrement;
         }
         if (downHeld)
         {
             plight.position.y -= moveIncrement;
         }
         if (leftHeld)
         {
             plight.position.z += moveIncrement;
         }
         if (rightHeld)
         {
             plight.position.z -= moveIncrement;
         }
         if (iHeld)
         {
            plight.position.x += moveIncrement;
         }
         if (kHeld)
         {
            plight.position.x -= moveIncrement;
         }

         // Put your drawing code here
         renderer.render(scene, camera);
     }

    
}

window.addEventListener( 'resize', onWindowResize);


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( 0.8 * window.innerWidth, 0.8 * window.innerHeight );

}

startAnimating(60);