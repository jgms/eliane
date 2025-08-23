//UI user mechanics go here

function startPlaying(){
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
}

let example = examples[0];

textArea.value = example;

playButton.addEventListener("click", startPlaying);

stopButton.addEventListener("click", stopPlaying);

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
fetch("/eliane/samples/samples.json") //if you're serving this locally, remove the '/eliane' segment from the URL
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
                    return fetch("/samples" + url)
                    .then(res => res.arrayBuffer())
                    .then(data => context.decodeAudioData(data));
                }))
            );
        }
        errorLog.innerHTML = 'Welcome to éliane! just press play to execute the silly example on the left, or check the docs to make your own music. For more examples you can go <a href="https://github.com/jgms/construye-un-castillo" target="_blank">here</a>.';
    }catch(error){
        errorLog.innerText = "there was a problem loading the samples, check you samples.json file for any syntax/path errors.";
    }
});