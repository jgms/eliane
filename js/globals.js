/* GLOBAL STUFF */

/* UI STUFF */
const textArea = document.querySelector("textarea");
const playButton = document.querySelector(".play");
const stopButton = document.querySelector(".stop");
const metersLeft = document.querySelectorAll(".meter:first-child div");
const metersRight = document.querySelectorAll(".meter:last-child div");
const errorLog = document.querySelector(".info p");
const zoomButtons = document.querySelectorAll(".font-size button");


/* SYSTEM STUFF */

const sequence = [];//this will hold all the event objects
//event object --> { functionName : "nameAsString", wait : 1000, args : { a : 1, b : 2 } }
//wait time is in milliseconds

//GLOBALS for the sequence, will be reset by the interpreter each time the sequence is populated

let bpm = 1000; //our default value for PULSE: 60 bpm

let wait = 0; //this will track the current wait time, and will be reset everytime we push an event into the sequence array

let variables = {};//we'll store here all the declared variables for the sequence


let sequenceIndex = 0;//where we are in the sequence

let functions = null;//will be an object we'll populate in the functions_register.js file

/*
nextFunction
This function receives the next event in the sequence and executes it. All registered functions MUST HAVE this mechanism implemented

This event is an object with a function name, a wait time and an object of arguments
{ functionName : "exampleFunction", wait : 1000, args : { a : 1, b : 2 } }

*/
function nextFunction(next){
    let {functionName,wait,args} = next;
    setTimeout(() => {
        sequenceIndex++;//update the global index
        try{
            //if there's another event, we pass it as the first argument, if not, we pass NULL
            functions[functionName](sequenceIndex < sequence.length ? sequence[sequenceIndex] : null, args);
        }catch(error){
            errorLog.classList.add("error");
            let errorMsg = error.toString().split(":");

            if(errorMsg[0] == "TypeError"){
                errorLog.innerText = `'${functionName}' is not a function.`;
            }else{
                errorLog.innerText = errorMsg[1].trim();
            }
        }
    }, wait);//we wait the specified time
}

//sequenceStart --> this function kickstarts the sequence
function sequenceStart(){
    sequenceIndex = 0;//reset our timeline
    if(sequence.length > 0){//if there is at least one event in the sequence, PLAY!!!
        let {functionName,wait,args} = sequence[0];
        setTimeout(() => {
            sequenceIndex++;//update the global index
            try{
                //if there's another event, we pass it as the first argument, if not, we pass NULL
                functions[functionName](sequenceIndex < sequence.length ? sequence[sequenceIndex] : null, args);
            }catch(error){
                errorLog.classList.add("error");
                let errorMsg = error.toString().split(":");

                if(errorMsg[0] == "TypeError"){
                    errorLog.innerText = `'${functionName}' is not a function.`;
                }else{
                    errorLog.innerText = errorMsg[1].trim();
                }
            }
        }, wait);//we wait the specified time
    }else{
        errorLog.classList.add("error");
        errorLog.innerText = "there's nothing to play =(";
    }
}




