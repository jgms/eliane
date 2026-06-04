//UI user mechanics go here

function startPlaying(){
    resetClipIndicators();//reset clip indicators
    errorLog.classList.remove("error");
    errorLog.innerHTML = 'Welcome to éliane! just press play to execute the silly example on the left, or check the docs to make your own music. For more examples you can go <a href="https://github.com/jgms/construye-un-castillo" target="_blank">here</a>.';
    try{
        transformer(giveMeMyAST(lexer(textArea.value)));
        context.resume();//resume the context
        setTimeout(sequenceStart,250);//give the context a little time to properly wake up

    }catch(error){
        errorLog.classList.add("error");
        let errorSplit = error.toString().split(":");
        let errorMsg = errorSplit[1].trim() + ( errorSplit[2] ? `:${errorSplit[2]}` : "" );
        errorLog.innerText = errorMsg;
    }
}

function stopPlaying(){
    let test = setTimeout(() => {},1);//the cleanest hack in the history of the interwebz!!! ..blame audio context's resume/suspend antics

    for(let i = 0; i <= test; i++){
        clearTimeout(i);//oh yes =)
    }

    resetClipIndicators();//reset clip indicators
}

let example = examples[0];

textArea.value = example;

playButton.addEventListener("click", startPlaying);

stopButton.addEventListener("click", stopPlaying);


//recording UI stuff
let recording = false; //this should be in globals but....

recordButton.addEventListener("click", () => {
    if (!recording) {
        recording = true;
        recordButton.innerText = "stop recording";
        recordButton.style.backgroundColor = "#f00";
        context.resume();
        startRecording();
    } else {
        recording = false;
        recordButton.innerText = "start recording";
        recordButton.removeAttribute("style");
        stopRecording();   // encodes + downloads WAV
    }
});

// load/save code functionality

//save
function saveCode() {
    const blob = new Blob([textArea.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `eliane-script-${Date.now()}.txt`;
    downloadLink.click();
    URL.revokeObjectURL(url);
}

saveButton.addEventListener("click", saveCode);// well well well

//load
loadButton.addEventListener("click", () => {
    fileInput.click(); // open the file input
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {//once is read
        textArea.value = e.target.result;
    };
    fileInput.value = ""; // reset so the same file can be reloaded if needed
});


//editor zoom
let fontSize = 1.2;
zoomButtons.forEach((button,i) => {
    button.addEventListener("click", () => {
        if(i == 1){
            fontSize = fontSize > 0.8 ? fontSize - 0.1 : fontSize;
        }else{
            fontSize = fontSize < 1.5 ? fontSize + 0.1 : fontSize;
        }
        textArea.style.fontSize = fontSize + "em";
    });
});

//get samples
fetch("samples/samples.json")
.then(res => res.json())
.then(async ({urls}) => { 
    /*
        urls : [ an array where each index represents a folder in the samples folder in the order in which we want it to be loaded, each folder will become a "bank"
            [ 
                "urls for every sample in each folder",
                "in the order in which we want them to be loaded",
                "/folder_name/sample_name.wav"
            ]
        ]
    */
    try{
        for(let i = 0; i < urls.length; i++){
            samples.push(
                await Promise.all(urls[i].map(url => {
                    return fetch("samples" + url)
                    .then(res => res.arrayBuffer())
                    .then(data => context.decodeAudioData(data));
                }))
            );
        }
        errorLog.innerHTML = 'Welcome to éliane! just press play to execute the silly example on the left, or check the docs to make your own music. For more examples you can go <a href="https://github.com/jgms/construye-un-castillo" target="_blank">here</a>.';
    }catch(error){
        errorLog.classList.add("error");
        errorLog.innerText = "there was a problem loading the samples, check you samples.json file for any syntax/path errors.";
    }
});