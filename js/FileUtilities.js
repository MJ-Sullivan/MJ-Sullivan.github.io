
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

var textFile = null,
makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
};

var link = document.createElement('a');
link.setAttribute('download', '');
link.innerHTML = "<button type=\"button\">Download Level Data</button>";
document.getElementById('main-right').appendChild(link)



var fileSelector = document.createElement('input');
fileSelector.setAttribute('type', 'file');

var selectDialogueLink = document.createElement('a');
selectDialogueLink.setAttribute('href', '');
selectDialogueLink.innerHTML = "<button type=\"button\">Open Mesh</button>";
document.getElementById('main-right').appendChild(selectDialogueLink);

selectDialogueLink.onclick = function () {
     fileSelector.click();
     return false;
}
fileSelector.onchange = function(e) {
    console.log( fileSelector.files[0].name)
    addGameObjectFromInput(collidables, scene, "fileObject", fileSelector.files[0]);
    fileSelector.value = "";
};


setDownloadData({ testProperty : "testValue" });

function setDownloadData(data) {
    link.href = makeTextFile(JSON.stringify(data))
}

function setLevelDownloadData(collidables, playerObject, camera) {
    var playerSize = new THREE.Vector3(); 
    (new THREE.Box3().setFromObject(playerObject.object)).getSize(playerSize)
    var levelData = {
        player : {
            position : new THREE.Vector3(camera.position.x, camera.position.y + 2, camera.position.z),
            size : playerSize
        },
        objects : [],
    };
    collidables.map(x => {
        var objColliders = []
        x.colliders.map(y => {
            objColliders.push(
                {
                    position : y.mesh.position,
                    size : y.mesh.scale
                }
            );
        });
        levelData.objects.push(
            {
                name : x.object.name,
                model : x.model,
                position : x.object.position,
                colliders : objColliders
            }
        );
    });

    return levelData;
}


function getLevelData(dataFile, collidables, scene, camera, player) {
    var levelObject = JSON.parse(dataFile);

    addPlayer(levelObject, scene, camera, player);
    levelObject.objects.map(x => {
        addGameObject(collidables, scene, x.name, x.model, x.position, x.colliders)
    })
}

loader = new THREE.GLTFLoader();
var dloader = new THREE.DRACOLoader();
dloader.setDecoderPath( 'https://www.gstatic.com/draco/versioned/decoders/1.4.1/' );
loader.setDRACOLoader(dloader);

function addPlayer(level, scene, camera, player) {
    var playerMesh = new THREE.Mesh(new THREE.BoxGeometry(level.player.size.x, level.player.size.y, level.player.size.z));
    var playerBoxHelper = new THREE.BoxHelper(playerMesh, 0xff0000);
    playerMesh.material = new THREE.MeshBasicMaterial({color : new THREE.Color(0.1, 0, 0)});
    playerMesh.visible = false;
    player.object = playerMesh;
    player.colliders.push(new Collider(playerMesh, playerBoxHelper));
    scene.add(playerMesh);
    scene.add(playerBoxHelper);

    camera.position.x = level.player.position.x;
    camera.position.y = level.player.position.y;
    camera.position.z = level.player.position.z;
}

async function addGameObjectFromInput(collidables, scene, name, file, collidable=true)
{
    if (file != "") {
        const uploadedFile = file
        const url = URL.createObjectURL(uploadedFile);
        const geom = await new Promise(resolve => {
            loader.load(url, geometry => {
                resolve(geometry);
            })
        })
        
        geom.scene.traverse( function( node ) {
            if ( node.isMesh ) { 
                node.castShadow = true; 
                node.receiveShadow = true;
                node.material.envMapIntensity = 0.3
                node.material.env = scene.environment;
                             
            }
        });
            let model = geom.scene;
            model.scale.set(0.1, 0.1, 0.1);
            model.name = name;
            var gameObject = new GameObject(model, "models/" + file.name)
            if (collidable) {
                collidables.push(gameObject);
            }
            scene.add(model);
    }
}

async function addGameObject(collidables, scene, name, file, position, colliders, collidable=true, useMeshForCollider=true, fromInput=false)
{
    if (file != "") {
        const geom = await new Promise(resolve => {
            loader.load(file, geometry => {
                resolve(geometry);
            })})

        geom.scene.traverse( function( node ) {
            if ( node.isMesh ) { 
                node.castShadow = true; 
                node.receiveShadow = true;
            }
        });
            // ANIMATED TEXTURE
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
            var gameObject = new GameObject(model, file)
            if (collidable) {
                // if (useMeshForCollider) {
                //     boxHelper = new THREE.BoxHelper(model, 0xff0000);
                //     collider = new Collider(model, boxHelper);
                //     boxHelper.name = "name";
                //     scene.add(boxHelper);
                //     gameObject = new GameObject(model, collider)
                // }
                colliders.map(x => {
                    var colliderMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
                    colliderMesh.scale.set(x.size.x, x.size.y, x.size.z)
                    colliderMesh.position.set(x.position.x, x.position.y, x.position.z);
                    colliderMesh.visible = false;
                    var boxHelper = new THREE.BoxHelper(colliderMesh, 0xff0000);
                    var collider = new Collider(colliderMesh, boxHelper);
                    boxHelper.name = "name";
                    scene.add(boxHelper);
                    gameObject.colliders.push(collider);
                })
                collidables.push(gameObject);
            }
            scene.add(model);
    }
}

async function reloadGameObject(gameObject, scene)
{
    if (file != "") {
        const geom = await new Promise(resolve => {
            loader.load(gameObject.model, geometry => {
                resolve(geometry);
            })})
        geom.scene.traverse( function( node ) {
            if ( node.isMesh ) { 
                node.castShadow = true; 
                node.receiveShadow = true;
            }
        });
            // ANIMATED TEXTURE
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
            model.position.set(gameObject.object.position.x, gameObject.object.position.y, gameObject.object.position.z);
            model.name = gameObject.object.name;
            
            
            scene.remove(gameObject.object)
            gameObject.object = model;
            scene.add(model);
    }
}

async function reloadAsWireframe(gameObject, scene)
{
    if (file != "") {
        const geom = await new Promise(resolve => {
            loader.load(gameObject.model, geometry => {
                resolve(geometry);
            })})
        var material = new THREE.MeshBasicMaterial( {
            color: 0x008ae0,
            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away
            polygonOffsetUnits: 1,
            opacity: 0.4,
            transparent: true,
            depthWrite: false
        } );
        geom.scene.traverse( function( node ) {
            if ( node.isMesh ) { 
                node.material = material
                //node.material.wireframe = true;
            }
        });
            // ANIMATED TEXTURE
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

            let model = geom.scene.clone();
            var newMaterial = new THREE.MeshPhongMaterial( {
                color: 0x008ae0,
                wireframe: true,
                wireframeLinewidth: 100,
                opacity: 0.5,
                transparent: true
            } );
            geom.scene.traverse( function( node ) {
                if ( node.isMesh ) { 
                    node.material = newMaterial
                    //node.material.wireframe = true;
                }
            });
            let wireframe = geom.scene.clone();
            wireframe.name = "wireframe"
            model.position.set(gameObject.object.position.x, gameObject.object.position.y, gameObject.object.position.z);
            model.name = gameObject.object.name;
            model.add( wireframe );
            scene.remove(gameObject.object)
            gameObject.object = model;
            scene.add(model);
    }
}
  

