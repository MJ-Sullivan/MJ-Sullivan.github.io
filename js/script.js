var container = document.getElementById("main");

var file = loadFile("data/levelData.json");

var colorRed = 0xff0000
var colorYellow = 0xf6ff00
var colorGreen = 0x00ff00

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);
var renderer = new THREE.WebGL1Renderer({ antialias: true, physicallyCorrectLights: true, })
//renderer.outputEncoding = THREE.sRGBEncoding;

document.getElementById("main-center").appendChild(renderer.domElement);
var controls = new THREE.PointerLockControls(camera, renderer.domElement);

var loader;
var stop, frameCount, fps, fpsInterval, startTime, now, then, elapsed;
var wHeld, sHeld, aHeld, dHeld, upHeld, downHeld, leftHeld, rightHeld, cHeld, playerCrouch;
var moveIncrement;
var isPaused;

var pLight, plightHelper, pLight2, aLight;

var gameObjects = [];
var collidables = [];
var isBoxHelperVisible = false;

var selectedObjectIndex = 0;
var selectedColliderIndex = -1;

var player = new GameObject();
var playerVel = 0;
var g = 0.005;

var debugMode = false;
var wireframeMode = false;

init();

function init() {

    renderer.setSize(0.8 * window.innerWidth, 0.8 * window.innerHeight);
    renderer.setClearColor(0x000f2e, 1);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;
    

    
    getLevelData(file, collidables, scene, camera, player);
    // window.addEventListener("keydown", function(e) {
    //     if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
    //         e.preventDefault();
    //     }
    // }, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keypress', onKeyPress);


    playerCrouch = 0;
    playerColliderOffset = new THREE.Vector3(0, -1, 0);
    player.object.position.set(camera.position.x, camera.position.y, camera.position.z);
    

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

    cHeld = false;

    upHeld = false;
    downHeld = false;
    leftHeld = false;
    rightHeld = false;

    iHeld = false;
    kHeld = false;

    pHeld = false;
    moveIncrement = 0.07;

    isPaused = false;



    plight = new THREE.PointLight(0xffffff, 0.5, 100);
    plight.position.set(1.3, 1.5, 1);
    plight.castShadow = true;

    plight.shadow.mapSize.width = 1024; // default
    plight.shadow.mapSize.height = 1024; // default

    plight.shadow.bias = -0.001;
    plight.name = "pLight";
    scene.add(plight);

    plight2 = new THREE.PointLight( 0xffffff, 2, 100);
    plight2.position.set(10, 1.5, 7);
    plight2.castShadow = true;

    plight2.shadow.mapSize.width = 1024; // default
    plight2.shadow.mapSize.height = 1024; // default

    plight2.shadow.bias = -0.001;
    plight2.name = "pLight2";
    scene.add(plight2);

    alight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(alight)

    plightHelper = new THREE.PointLightHelper(plight, 0.1);
    plightHelper.name = "pLightHelper";
    scene.add(plightHelper);

    plightHelper2 = new THREE.PointLightHelper(plight2, 0.1);
    plightHelper2.name = "pLightHelper2";
    scene.add(plightHelper2);

    var cubeLoader = new THREE.CubeTextureLoader();
    cubeLoader.setPath('textures/park2/');
    var textureCube = cubeLoader.load([
        'posx.jpg', 'negx.jpg',
        'posy.jpg', 'negy.jpg',
        'posz.jpg', 'negz.jpg'
    ])
    scene.environment = textureCube;

    geometry = new THREE.PlaneGeometry(0.7, 2.2);
				verticalMirror = new THREE.Reflector( geometry, {
					clipBias: 0.000,
					textureWidth: window.innerWidth * window.devicePixelRatio,
					textureHeight: window.innerHeight * window.devicePixelRatio,
					color: 0x808080
				} );
				verticalMirror.position.y = 0;
				verticalMirror.position.z = 1.15;
                verticalMirror.position.x = 3.802;
                verticalMirror.rotation.y -= Math.PI / 2
				scene.add( verticalMirror );

    //addGameObject(collidables, scene, "room", "room.gltf", new THREE.Vector3(0, -2.3, 0), true, false);
    //addGameObject(collidables, scene, "cube", "batcube.gltf", new THREE.Vector3(10, -0, 0), true);
    //addGameObject(collidables, scene, "floor", "floor.gltf", new THREE.Vector3(0, -2, 0), true);    
        
    window.addEventListener( 'resize', onWindowResize);

    startAnimating(60);
}

function isColliding() {
    player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
    var bbox = new THREE.Box3().setFromObject(player.object)
    var collided = false; 
    collidables.some(x => {                
        if (x.object != player.object) {
            x.colliders.some(y => {
                var bboxOther = new THREE.Box3().setFromObject(y.mesh)
                if (bbox.intersectsBox(bboxOther)) {
                    if (debugMode) {
                        console.log("COLLIDE : ", x.object.name);
                    }
                    player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
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
    player.colliders.map(x => {
        x.boxHelper.visible = isBoxHelperVisible;
        x.boxHelper.update();
    })

    if (!isPaused)
    {
        camera.position.y -= playerCrouch;
        playerCrouch = 0;
        if (cHeld) {
            var mat = new THREE.MeshBasicMaterial()
            mat.wireframe = true;
            ((ob = collidables.find(x => { return x.model.includes("vader") })) !== undefined ? ob.object.rotation.y += 0.01 : undefined)
            playerCrouch = -1.2;
        }

        var camVec = new THREE.Vector3();
        camera.getWorldDirection(camVec);
        var theta = Math.atan2(camVec.x, camVec.z);

        

        playerVel -= g;
        camera.position.y += playerVel;
        player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
        if (isColliding()) {
            camera.position.y -= playerVel;
            playerVel = 0;
            player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
        }
        
        if (wHeld)
        {
            camera.position.z += moveIncrement * Math.cos(theta);
            if (isColliding()) {
                camera.position.z -= moveIncrement * Math.cos(theta);
                player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }

            camera.position.x += moveIncrement * Math.sin(theta);
            if (isColliding()) {
                camera.position.x -= moveIncrement * Math.sin(theta);
                player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }
        }
        if (sHeld)
        {
            camera.position.z -= moveIncrement * Math.cos(theta);
            if (isColliding()) {
                camera.position.z += moveIncrement * Math.cos(theta);
                player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }

            camera.position.x -= moveIncrement * Math.sin(theta);
            if (isColliding()) {
                camera.position.x += moveIncrement * Math.sin(theta);
                player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }
        }
        if (aHeld)
        {
            camera.position.x += moveIncrement * Math.cos(theta);
            if (isColliding()) {
                camera.position.x -= moveIncrement * Math.cos(theta);
                player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }

            camera.position.z -= moveIncrement * Math.sin(theta);
            if (isColliding()) {
                camera.position.z += moveIncrement * Math.sin(theta);
                player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }
        }
        if (dHeld)
        {
            camera.position.x -= moveIncrement * Math.cos(theta);
            if (isColliding()) {
                camera.position.x += moveIncrement * Math.cos(theta);
                player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }

            camera.position.z += moveIncrement * Math.sin(theta);
            if (isColliding()) {
                camera.position.z -= moveIncrement * Math.sin(theta);
                player.object.position.set(camera.position.x + playerColliderOffset.x, camera.position.y + playerColliderOffset.y, camera.position.z + playerColliderOffset.z)
            }
        }

        camera.position.y += playerCrouch;
    }

    if (debugMode) {
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
                controls.unlock();
            }
            pHeld = true;
            setDownloadData(setLevelDownloadData(collidables, player, camera));
            console.log("Level data prepared to download");
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
        case "KeyC":
            cHeld = true;
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
        case "KeyC":
            cHeld = false;
            break;
    }
}

function onKeyPress(e) {
    console.log(e.code, " pressed")
    switch (e.code) {
        case "Space":
            if (Math.abs(playerVel) < 0.00001)
                playerVel += 0.1;
            break;
        case "Backquote":
            debugMode = !debugMode;
            if (debugMode) {
                document.getElementById("debug-text").innerText = "DEBUG ON | wireframe: off"
            }
            else {
                document.getElementById("debug-text").innerText = ""
                if (wireframeMode) {
                    wireframeMode = false;
                    collidables.map(x => {
                        reloadGameObject(x, scene);
                    });
                }
                isBoxHelperVisible = false;
            }
            break;
        case "Digit1":
            if (debugMode) {
                wireframeMode = !wireframeMode;
                if (wireframeMode) {
                    document.getElementById("debug-text").innerText = "DEBUG ON | wireframe: on"
                    collidables.map(x => {
                        reloadAsWireframe(x, scene);
                    });
                }
                else {
                    document.getElementById("debug-text").innerText = "DEBUG ON | wireframe: off"; 
                    collidables.map(x => {
                        reloadGameObject(x, scene);
                    });
                }
            }
            break;
        case "KeyV":
            if (debugMode)
            {
                isBoxHelperVisible = !isBoxHelperVisible;
            }
            break;
        case "Period":
            if (debugMode) {
                collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorRed));
                selectedObjectIndex = (selectedObjectIndex + 1) % collidables.length;
                collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorYellow));
                console.log("SELECTED : " + collidables[selectedObjectIndex].object.name)
                selectedColliderIndex = -1
            }
            break;
        case "Comma":
            if (debugMode) {
                collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorRed));
                selectedObjectIndex = selectedObjectIndex - 1 > -1 ? selectedObjectIndex - 1 : collidables.length - 1;
                collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorYellow));
                console.log("SELECTED : " + collidables[selectedObjectIndex].object.name)
                selectedColliderIndex = -1
            }
            break;
        case "Enter":
            if (debugMode) {
                console.log("New collider on ", collidables[selectedObjectIndex].object.name, " object")
                var mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
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
            if (debugMode) {
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
            }
            break;
        case "IntlBackslash":
            if (debugMode) {
                selectedColliderIndex = selectedColliderIndex + 1 < collidables[selectedObjectIndex].colliders.length ? selectedColliderIndex + 1 : 0;
                if (collidables[selectedObjectIndex].colliders[selectedColliderIndex] != null){
                    collidables[selectedObjectIndex].colliders.map(x => x.boxHelper.material.color.set(colorYellow));
                    collidables[selectedObjectIndex].colliders[selectedColliderIndex].boxHelper.material.color.set(colorGreen);
                }
            }
            break;
        case "Equal":
            if (debugMode) {
                if (selectedColliderIndex != -1)
                    collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.x += 0.1;
            }
            break;
        case "Minus":
            if (debugMode) {
                if (selectedColliderIndex != -1)
                    collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.x -= 0.1;
            }
            break;
        case "BracketRight":
            if (debugMode) {
                if (selectedColliderIndex != -1)
                    collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.y += 0.1;
            }
            break;
        case "BracketLeft":
            if (debugMode) {
                if (selectedColliderIndex != -1)
                    collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.y -= 0.1;
            }
            break;
        case "Backslash":
            if (debugMode) {
                if (selectedColliderIndex != -1)
                    collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.z += 0.1;
            }
            break;
        case "Quote":
            if (debugMode) {
                if (selectedColliderIndex != -1)
                    collidables[selectedObjectIndex].colliders[selectedColliderIndex].mesh.scale.z -= 0.1;
            }
            break;
    }
}