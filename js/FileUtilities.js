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
link.setAttribute('download', 'levelData.JSON');
link.className = "button"
link.innerHTML = "<button type=\"button\">Download Level Data</button>"
document.getElementById('main-right').appendChild(link)

setDownloadData({ testProperty : "testValue" });

function setDownloadData(data) {
    link.href = makeTextFile(JSON.stringify(data))
}

function setLevelDownloadData(collidables, playerObject) {
    var playerSize = new THREE.Vector3(); 
    (new THREE.Box3().setFromObject(playerObject.object)).getSize(playerSize)
    var levelData = {
        player : {
            position : playerObject.object.position,
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
dloader.setDecoderPath( 'js/libs/draco/' );
loader.setDRACOLoader(dloader);

function addPlayer(level, scene, camera, player) {
    var playerMesh = new THREE.Mesh(new THREE.BoxGeometry(level.player.size.x, level.player.size.y, level.player.size.z));
    var playerBoxHelper = new THREE.BoxHelper(playerMesh, 0xff0000);
    playerMesh.material = new THREE.MeshBasicMaterial({color : new THREE.Color(0.1, 0, 0)});
    player.object = playerMesh;
    player.colliders.push(new Collider(playerMesh, playerBoxHelper));
    scene.add(playerMesh);
    scene.add(playerBoxHelper);

    camera.position.x = level.player.position.x;
    camera.position.y = level.player.position.y;
    camera.position.z = level.player.position.z;
}

async function addGameObject(collidables, scene, name, file, position, colliders, collidable=true, useMeshForCollider=true)
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
  

