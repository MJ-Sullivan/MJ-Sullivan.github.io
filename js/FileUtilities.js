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

function setLevelDownloadData(collidables) {
    var levelData = {
        objects : [{

        }],
    }
    collidables.map(x => {
        levelData.objects.push(
            {}
        )
    })
}
  

