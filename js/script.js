class GameObject {
    constructor (object, boxHelper=null)
    {
        this.object = object;
        this.boxHelper = boxHelper;
    }
}
function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
      result = xmlhttp.responseText;
    }
    return result;
  }

console.log(loadFile("file.txt"))

var colorRed = 0xff0000
var colorYellow = 0xf6ff00

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);
var renderer = new THREE.WebGL1Renderer({antialias: true});
var container = document.getElementById("main");
container.appendChild(renderer.domElement);
var controls = new THREE.PointerLockControls(camera, renderer.domElement);

var loader;
var stop, frameCount, fps, fpsInterval, startTime, now, then, elapsed;
var wHeld, sHeld, aHeld, dHeld, upHeld, downHeld, leftHeld, rightHeld;
var moveIncrement;
var isPaused;

var pLight, plightHelper, pLight2, aLight;

var player = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 0.5));
var playerBoxHelper = new THREE.BoxHelper(player, 0xff0000);
var playerColliderOffset;

var gameObjects = [];
var collidables = [];
var isBoxHelperVisible = false;

var selectedObjectIndex = 0;

init();

function init() {

    camera.position.x = 5
    camera.position.y = 0.5
    camera.position.z = 10

    renderer.setSize(0.8 * window.innerWidth, 0.8 * window.innerHeight);
    renderer.setClearColor(0x8AAFF3, 1);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keypress', onKeyPress);

    
    player.material = new THREE.MeshBasicMaterial({color : new THREE.Color(0.1, 0, 0)});
    player.name = "player";
    var playerGameObject = new GameObject(player, playerBoxHelper);
    collidables.push(playerGameObject);
    gameObjects.push(playerGameObject);
    scene.add(player);
    scene.add(playerBoxHelper);


    playerColliderOffset = new THREE.Vector3(0, 0, 0);
    player.position.x = camera.position.x;
    player.position.y = camera.position.y;
    player.position.z = camera.position.z;
    

    renderer.domElement.addEventListener(
        'click',
        function () {
            controls.lock()
        },
        false
    )

    wHeld = false;
    sHeld = false;
    aHeld = false;
    dHeld = false;

    upHeld = false;
    downHeld = false;
    leftHeld = false;
    rightHeld = false;

    iHeld = false;
    kHeld = false;

    pHeld = false;
    moveIncrement = 0.1;

    isPaused = false;



    plight = new THREE.PointLight( 0xfffde6, 1, 100);
    plight.position.set(1.3, 1.5, 1);
    plight.castShadow = true;

    plight.shadow.mapSize.width = 1024; // default
    plight.shadow.mapSize.height = 1024; // default

    plight.shadow.bias = -0.001;
    plight.name = "pLight";
    scene.add(plight);

    plight2 = new THREE.PointLight( 0xfffde6, 1, 100);
    plight2.position.set(10, 1.5, 7);
    plight2.castShadow = true;

    plight2.shadow.mapSize.width = 1024; // default
    plight2.shadow.mapSize.height = 1024; // default

    plight2.shadow.bias = -0.001;
    plight2.name = "pLight2";
    scene.add(plight2);

    alight = new THREE.AmbientLight(0xe6ffff, 1)
    scene.add(alight)

    plightHelper = new THREE.PointLightHelper(plight, 0.1);
    plightHelper.name = "pLightHelper";
    scene.add(plightHelper);

    loader = new THREE.GLTFLoader();
    var dloader = new THREE.DRACOLoader();
    dloader.setDecoderPath( 'js/libs/draco/' );
    loader.setDRACOLoader(dloader);
    addGameObject("room", "room.gltf", new THREE.Vector3(0, -2.3, 0), false);
    addGameObject("cube", "batcube.gltf", new THREE.Vector3(10, -0, 0), true);
    addGameObject("floor", "floor.gltf", new THREE.Vector3(0, -2, 0), true);

    

    window.addEventListener( 'resize', onWindowResize);

    startAnimating(60);
}

function update() {

    collidables.map(x => {
        x.boxHelper.visible = isBoxHelperVisible;
        x.boxHelper.update();
    })

    player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
    // player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
        
    //         collidables.some(x => {                
    //             if (x != player) {
    //                 var bboxOther = new THREE.Box3().setFromObject(x)
    //                 if (bbox.intersectsBox(bboxOther)) {
    //                     console.log("COLLIDE : ", x.name);
    //                     isPaused = true;
    //                     controls.moveForward(-moveIncrement*1.1);
    //                     player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
    //                     return true;
    //                 }
    //             }
    //         })
    if (!isPaused)
    {
        if (wHeld)
        {
            controls.moveForward(moveIncrement);
            player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            var bbox = new THREE.Box3().setFromObject(player)

            collidables.some(x => {                
                if (x.object != player) {
                    var bboxOther = new THREE.Box3().setFromObject(x.object)
                    if (bbox.intersectsBox(bboxOther)) {
                        console.log("COLLIDE : ", x.object.name);
                        controls.moveForward(-moveIncrement);
                        player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
                        return true;
                    }
                }
            })
        }
        if (sHeld)
        {
            controls.moveForward(-moveIncrement);
            player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            var bbox = new THREE.Box3().setFromObject(player)
            
            collidables.some(x => {                
                if (x.object != player) {
                    var bboxOther = new THREE.Box3().setFromObject(x.object)
                    if (bbox.intersectsBox(bboxOther)) {
                        console.log("COLLIDE : ", x.name);
                        controls.moveForward(moveIncrement);
                        player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
                        return true;
                    }
                }
            })
        }
        if (aHeld)
        {
            controls.moveRight(-moveIncrement);
            player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            var bbox = new THREE.Box3().setFromObject(player)
            
            collidables.some(x => {                
                if (x.object != player) {
                    var bboxOther = new THREE.Box3().setFromObject(x.object)
                    if (bbox.intersectsBox(bboxOther)) {
                        console.log("COLLIDE : ", x.name);
                        controls.moveRight(moveIncrement);
                        player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
                        return true;
                    }
                }
            })
        }
        if (dHeld)
        {
            controls.moveRight(moveIncrement);
            player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            var bbox = new THREE.Box3().setFromObject(player)
            
            collidables.some(x => {                
                if (x.object != player) {
                    var bboxOther = new THREE.Box3().setFromObject(x.object)
                    if (bbox.intersectsBox(bboxOther)) {
                        console.log("COLLIDE : ", x.name);
                        controls.moveRight(-moveIncrement);
                        player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
                        return true;
                    }
                }
            })
        }
    }


    if (upHeld)
    {
        collidables[selectedObjectIndex].object.position.y += moveIncrement;
    }
    if (downHeld)
    {
        collidables[selectedObjectIndex].object.position.y -= moveIncrement;
    }
    if (leftHeld)
    {
        collidables[selectedObjectIndex].object.position.z += moveIncrement;
    }
    if (rightHeld)
    {
        collidables[selectedObjectIndex].object.position.z -= moveIncrement;
    }
    if (iHeld)
    {
        collidables[selectedObjectIndex].object.position.x += moveIncrement;
    }
    if (kHeld)
    {
        collidables[selectedObjectIndex].object.position.x -= moveIncrement;
    }
}

async function addGameObject(name, file, position, collidable)
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

            let model = geom.scene;
            model.position.set(position.x, position.y, position.z);
            model.name = name;
            var boxHelper = null; 
            if (collidable) {
                boxHelper = new THREE.BoxHelper(model, 0xff0000);
                boxHelper.name = "name";
                scene.add(boxHelper);
                var gameObject = new GameObject(model, boxHelper)
                collidables.push(gameObject);
                scene.add(boxHelper);
            }
            gameObjects.push(gameObject);
            scene.add(model);

}


function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}

function animate() {
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
        
         update();

         // Put your drawing code here
         renderer.render(scene, camera);
     }

    
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( 0.8 * window.innerWidth, 0.8 * window.innerHeight );

}

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

function onKeyPress(e) {
    switch (e.code) {
        case "KeyV":
            isBoxHelperVisible = !isBoxHelperVisible;
            break;
        case "Period":
            collidables[selectedObjectIndex].boxHelper.material.color.set(colorRed)
            selectedObjectIndex = (selectedObjectIndex + 1) % collidables.length;
            collidables[selectedObjectIndex].boxHelper.material.color.set(colorYellow)
            console.log("SELECTED : " + collidables[selectedObjectIndex].object.name)
            break;
        case "Comma":
            collidables[selectedObjectIndex].boxHelper.material.color.set(colorRed)
            selectedObjectIndex = selectedObjectIndex - 1 > -1 ? selectedObjectIndex - 1 : collidables.length - 1;
            collidables[selectedObjectIndex].boxHelper.material.color.set(colorYellow)
            console.log("SELECTED : " + collidables[selectedObjectIndex].object.name)
            break;
        case "Space":
            var mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
            mesh.name = "Collider"
            mesh.visible = false;
            mesh.position.set(player.position.x, player.position.y, player.position.z);
            var meshBoxHelper = new THREE.BoxHelper(mesh, colorYellow);
            mesh.name = "Collider"
            var colliderGameObject = new GameObject(mesh, meshBoxHelper);
            scene.add(mesh)
            scene.add(meshBoxHelper)
            collidables.push(colliderGameObject);
            collidables[selectedObjectIndex].boxHelper.material.color.set(colorRed)
            selectedObjectIndex = collidables.length - 1;
            break;
        case "Equal":
            if (collidables[selectedObjectIndex].object.name == "Collider") {
                collidables[selectedObjectIndex].object.scale.x += 0.1;
            }
            break;
        case "Minus":
            if (collidables[selectedObjectIndex].object.name == "Collider") {
                collidables[selectedObjectIndex].object.scale.x -= 0.1;
            }
            break;
        case "BracketRight":
            if (collidables[selectedObjectIndex].object.name == "Collider") {
                collidables[selectedObjectIndex].object.scale.y += 0.1;
            }
            break;
        case "BracketLeft":
            if (collidables[selectedObjectIndex].object.name == "Collider") {
                collidables[selectedObjectIndex].object.scale.y -= 0.1;
            }
            break;
        case "Backslash":
            if (collidables[selectedObjectIndex].object.name == "Collider") {
                collidables[selectedObjectIndex].object.scale.z += 0.1;
            }
            break;
        case "Quote":
            if (collidables[selectedObjectIndex].object.name == "Collider") {
                collidables[selectedObjectIndex].object.scale.z -= 0.1;
            }
            break;
    }
}