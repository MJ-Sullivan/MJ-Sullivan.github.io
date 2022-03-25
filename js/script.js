var container = document.getElementById("main");

var file = loadFile("levelData.json");
file = JSON.parse(file)
console.log(file)

var colorRed = 0xff0000
var colorYellow = 0xf6ff00
var colorGreen = 0x00ff00

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);
var renderer = new THREE.WebGL1Renderer({antialias: true});
document.getElementById("main-center").appendChild(renderer.domElement);
var controls = new THREE.PointerLockControls(camera, renderer.domElement);

var loader;
var stop, frameCount, fps, fpsInterval, startTime, now, then, elapsed;
var wHeld, sHeld, aHeld, dHeld, upHeld, downHeld, leftHeld, rightHeld;
var moveIncrement;
var isPaused;

var pLight, plightHelper, pLight2, aLight;

var gameObjects = [];
var collidables = [];
var isBoxHelperVisible = false;

var selectedObjectIndex = 0;
var selectedColliderIndex = -1;

var player = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 0.5));
var playerBoxHelper = new THREE.BoxHelper(player, 0xff0000);
player.material = new THREE.MeshBasicMaterial({color : new THREE.Color(0.1, 0, 0)});
player.name = "player";
var playerGameObject = new GameObject(player, new Collider(player, playerBoxHelper));
collidables.push(playerGameObject);
gameObjects.push(playerGameObject);
scene.add(player);
scene.add(playerBoxHelper);
var playerColliderOffset;

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

    plightHelper2 = new THREE.PointLightHelper(plight2, 0.1);
    plightHelper2.name = "pLightHelper2";
    scene.add(plightHelper2);

    loader = new THREE.GLTFLoader();
    var dloader = new THREE.DRACOLoader();
    dloader.setDecoderPath( 'js/libs/draco/' );
    loader.setDRACOLoader(dloader);
    addGameObject("room", "room.gltf", new THREE.Vector3(0, -2.3, 0), true, false);
    addGameObject("cube", "batcube.gltf", new THREE.Vector3(10, -0, 0), true);
    addGameObject("floor", "floor.gltf", new THREE.Vector3(0, -2, 0), true);

    

    window.addEventListener( 'resize', onWindowResize);

    startAnimating(60);
}

function isColliding() {
    player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
    var bbox = new THREE.Box3().setFromObject(player)
    var collided = false; 
    collidables.some(x => {                
        if (x.object != player) {
            x.colliders.some(y => {
                var bboxOther = new THREE.Box3().setFromObject(y.mesh)
                if (bbox.intersectsBox(bboxOther)) {
                    console.log("COLLIDE : ", x.object.name);
                    player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
                    collided = true;
                    return true;
                }
            })
        }
    })
    return collided;
}

function update() {
    // Update boxhelper positions and visibility
    collidables.map(x => {
        if (x.colliders.length > 0) {
            x.colliders.map(y => { 
                y.boxHelper.visible = isBoxHelperVisible; 
                y.boxHelper.update();
            })
        }
    })

    player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
  
    if (!isPaused)
    {
        if (wHeld)
        {
            controls.moveForward(moveIncrement);
            if (isColliding()) {
                controls.moveForward(-moveIncrement);
                player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }
        }
        if (sHeld)
        {
            controls.moveForward(-moveIncrement);
            if (isColliding()) {
                controls.moveForward(moveIncrement);
                player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }
        }
        if (aHeld)
        {
            controls.moveRight(-moveIncrement);
            if (isColliding()) {
                controls.moveRight(moveIncrement);
                player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }
        }
        if (dHeld)
        {
            controls.moveRight(moveIncrement);
            if (isColliding()) {
                controls.moveRight(-moveIncrement);
                player.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }
        }
    }


    if (upHeld && selectedColliderIndex == -1)
    {
        collidables[selectedObjectIndex].object.position.y += moveIncrement;
        collidables[selectedObjectIndex].colliders.map(x => {
            if (x.mesh != collidables[selectedObjectIndex].object)
                x.mesh.position.y += moveIncrement;
        });
    }
    else if (upHeld)
    {
        collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.position.y += moveIncrement;
    }
    if (downHeld && selectedColliderIndex == -1)
    {
        collidables[selectedObjectIndex].object.position.y -= moveIncrement;
        collidables[selectedObjectIndex].colliders.map(x => {
            if (x.mesh != collidables[selectedObjectIndex].object)
                x.mesh.position.y -= moveIncrement;
        });
    }
    else if (downHeld)
    {
        collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.position.y -= moveIncrement;
    }
    if (leftHeld && selectedColliderIndex == -1)
    {
        collidables[selectedObjectIndex].object.position.z += moveIncrement;
        collidables[selectedObjectIndex].colliders.map(x => {
            if (x.mesh != collidables[selectedObjectIndex].object)
                x.mesh.position.z += moveIncrement;
        });
    }
    else if (leftHeld)
    {
        collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.position.z += moveIncrement;

    }
    if (rightHeld && selectedColliderIndex == -1)
    {
        collidables[selectedObjectIndex].object.position.z -= moveIncrement;
        collidables[selectedObjectIndex].colliders.map(x => {
            if (x.mesh != collidables[selectedObjectIndex].object)
                x.mesh.position.z -= moveIncrement;
        });
    }
    else if (rightHeld)
    {
        collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.position.z -= moveIncrement;

    }
    if (iHeld && selectedColliderIndex == -1)
    {
        collidables[selectedObjectIndex].object.position.x += moveIncrement;
        collidables[selectedObjectIndex].colliders.map(x => {
            if (x.mesh != collidables[selectedObjectIndex].object)
                x.mesh.position.x += moveIncrement;
        });
    }
    else if (iHeld)
    {
        collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.position.x += moveIncrement;

    }
    if (kHeld && selectedColliderIndex == -1)
    {
        collidables[selectedObjectIndex].object.position.x -= moveIncrement;
        collidables[selectedObjectIndex].colliders.map(x => {
            if (x.mesh != collidables[selectedObjectIndex].object)
                x.mesh.position.x -= moveIncrement;
        });
    }
    else if (kHeld)
    {
        collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.position.x -= moveIncrement;

    }
}

async function addGameObject(name, file, position, collidable, useMeshForCollider=true)
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
            // if (name === "cube")
            // {
            //     const vidTex = new THREE.VideoTexture(document.getElementById('video'));
            //     vidTex.flipY = false;
            //     const videoMat = new THREE.MeshBasicMaterial( {map: vidTex, side: THREE.DoubleSide, toneMapped: false});
            //     geom.scene.traverse(child => {
            //         if (child.material) {
            //           child.material = videoMat;
            //         }
            //       });
            //       document.getElementById('video').play()
            // }

            let model = geom.scene;
            model.position.set(position.x, position.y, position.z);
            model.name = name;
            var boxHelper = null;
            var gameObject = new GameObject(model)
            if (collidable) {
                if (useMeshForCollider) {
                    boxHelper = new THREE.BoxHelper(model, 0xff0000);
                    collider = new Collider(model, boxHelper);
                    boxHelper.name = "name";
                    scene.add(boxHelper);
                    gameObject = new GameObject(model, collider)
                }
                collidables.push(gameObject);
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
            collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorRed));
            selectedObjectIndex = (selectedObjectIndex + 1) % collidables.length;
            collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorYellow));
            console.log("SELECTED : " + collidables[selectedObjectIndex].object.name)
            selectedColliderIndex = -1
            break;
        case "Comma":
            collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorRed));
            selectedObjectIndex = selectedObjectIndex - 1 > -1 ? selectedObjectIndex - 1 : collidables.length - 1;
            collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorYellow));
            console.log("SELECTED : " + collidables[selectedObjectIndex].object.name)
            selectedColliderIndex = -1
            break;
        case "Space":
            if (selectedObjectIndex != 0) {
                var mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
                mesh.name = "Collider"
                mesh.visible = false;
                mesh.position.set(collidables[selectedObjectIndex].object.position.x, collidables[selectedObjectIndex].object.position.y, collidables[selectedObjectIndex].object.position.z);
                var meshBoxHelper = new THREE.BoxHelper(mesh, colorGreen);
                mesh.name = "Collider"
                scene.add(mesh)
                scene.add(meshBoxHelper)
                collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorYellow));
                collidables[selectedObjectIndex].colliders.push(new Collider(mesh, meshBoxHelper))
                selectedColliderIndex = collidables[selectedObjectIndex].colliders.length - 1;
            }
            break;
        case "KeyX":
            if (selectedColliderIndex != -1) {
                var deletedCollider = collidables[selectedObjectIndex].colliders[selectedColliderIndex];
                console.log("selectedColliderIndex " + selectedColliderIndex)
                if (deletedCollider.mesh != collidables[selectedObjectIndex].object) {
                    var deletedIndex = collidables[selectedObjectIndex].colliders.indexOf(deletedCollider);
                    collidables[selectedObjectIndex].colliders.splice(deletedIndex, 1);
                    scene.remove(deletedCollider.boxHelper)
                    scene.remove(deletedCollider.mesh)
                    selectedColliderIndex = selectedColliderIndex - 1;
                    if (collidables[selectedObjectIndex].colliders[selectedColliderIndex] != null) {
                        collidables[selectedObjectIndex].colliders[selectedColliderIndex].boxHelper.material.color.set(colorGreen);
                    }
                }
            }
            break;
        case "IntlBackslash":
            selectedColliderIndex = selectedColliderIndex + 1 < collidables[selectedObjectIndex].colliders.length ? selectedColliderIndex + 1 : 0;
            if (collidables[selectedObjectIndex].colliders[selectedColliderIndex] != null){
                collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorYellow));
                collidables[selectedObjectIndex].colliders[selectedColliderIndex].boxHelper.material.color.set(colorGreen);
            }
            break;
        case "Equal":
            if (selectedColliderIndex != -1)
                collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.x += 0.1;
            break;
        case "Minus":
            if (selectedColliderIndex != -1)
                collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.x -= 0.1;
            break;
        case "BracketRight":
            if (selectedColliderIndex != -1)
                collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.y += 0.1;
            break;
        case "BracketLeft":
            if (selectedColliderIndex != -1)
                collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.y -= 0.1;
            break;
        case "Backslash":
            if (selectedColliderIndex != -1)
                collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.z += 0.1;
            break;
        case "Quote":
            if (selectedColliderIndex != -1)
                collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.z -= 0.1;
            break;
    }
}