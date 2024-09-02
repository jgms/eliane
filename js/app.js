//UI user mechanics go here

let example = examples[Math.floor(Math.random() * examples.length)];

textArea.value = example;

playButton.addEventListener("click", () => {
    errorLog.classList.remove("error");
    errorLog.innerText = "Welcome to éliane! just press play to execute the silly example on the left, or check the docs to make your own music.";
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
});

stopButton.addEventListener("click", () => {
    let test = setTimeout(() => {},1);//the cleanest hack in the history of the interwebz!!! ..blame audio context's resume/suspend antics

    for(let i = 0; i <= test; i++){
        clearTimeout(i);//oh yes =)
    }
});

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