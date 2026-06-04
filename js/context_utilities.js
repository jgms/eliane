const context = new AudioContext();//global audio context

//meter stuff for UI
const analyserLeft = context.createAnalyser();//this creates an analyser node, we will extract the total amplitude from it
analyserLeft.fftSize = 512; // Size of FFT (Fast Fourier Transform), this represent the size of the "window" we are using to take the snapshot 
const analyserRight = context.createAnalyser();
analyserRight.fftSize = 512; // Size of FFT (Fast Fourier Transform)


//helper function to calculate RMS amplitude for the meters
function calculateRMS(data) {//it will receive the time-domain data from the AnalyserNode
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i] * data[i];//we accumulate the squares of each sample
    }
    return Math.sqrt(sum / data.length);//and return the RMS
}

//helper function to calculate REAL PEAKS, will use it to draw a white line at the peaks and watch out for possible clippings
function calculatePeak(data) {
      let peak = 0;
      for (let i = 0; i < data.length; i++) {
          const abs = Math.abs(data[i]);
          if (abs > peak) peak = abs;
      }
      return peak;
  }

//helper function to get SECONDS out of multiples of the CURRENT(at the moment of playing the sound) BPM
function pulseToSeconds(value,bpm){
    return value * bpm / 1000;
}


function createOSC(frequency,type){//this functions returns a simple oscillator node
    return new OscillatorNode(context,{type,frequency});
}

function createEnvelope(amplitude, attack, sustain, release,bpm){//this function returns an envelope. Attack, sustain and release times are in multiples of the CURENT BPM, we'll use the helper pulseToSeconds to handle them 
    const envelope = new GainNode(context);

    envelope.gain.cancelScheduledValues(context.currentTime);
    envelope.gain.setValueAtTime(0,context.currentTime);
    envelope.gain.linearRampToValueAtTime(amplitude, context.currentTime + pulseToSeconds(attack,bpm));
    envelope.gain.linearRampToValueAtTime(amplitude, context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm));
    
    //linear or exponential..can't decide =(
    //envelope.gain.linearRampToValueAtTime(0, context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release));
    
    envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    envelope.gain.linearRampToValueAtTime(0, context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm) + 0.01);
    
    return envelope;
}
/*
    this will generate white noise, how to use it:

    const whiteNoiseBuffer = generateWhiteNoise(duration);
    const whiteNoiseSource = context.createBufferSource();
    whiteNoiseSource.buffer = whiteNoiseBuffer;

    ..from there it's just another sound node
*/
function generateWhiteNoise(duration) {
    // Create an AudioBuffer with 1 channel and sample rate of context's sample rate
    const bufferSize = context.sampleRate * duration;//the size according to the duration we want
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);//we extract the data array

    // and fill it with random values to create white noise
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // Random values between -1 and 1
    }

    return buffer;
}
/*
    ring modulation
    wave --> 0,1,2,3 --> sine,triangle,square,sawtooth
    duration --> seconds to stop the modulator oscillator
*/
function ringMod(wave,frequency,duration){
    const ringModulator = new GainNode(context);//gain to multiply the signals

    const waves = ["sine","triangle","square","sawtooth"];//waveforms

    const modulator = createOSC(frequency,waves[wave]);//modulator

    modulator.connect(ringModulator.gain);//we are modulating the gain value

    //start/stop modulator
    modulator.start(context.currentTime);
    modulator.stop(context.currentTime + duration);

    return ringModulator;
}

function setPan(pan){ //-1(left) 0 1(right)
    return new StereoPannerNode(context,{pan});// a stereo panner node =)
}

/* this code will handle the UI meters, each one a canvas simulating (for performance/accuracy reasons) my original CSS solution */
// colors for the segments
const segmentsColors = ["#0f0","#0f0","#0f0","#0f0","#0f0","#0f0","#ff0","#ff0","#f00","#f00"];

// this will hold the peak state for each meter
const peakState = {
    L: { level: 0, holdUntil: 0 },
    R: { level: 0, holdUntil: 0 }
};
//this will keep clipping info
const clipState = { L: false, R: false }; 

//reset the clipping indicators
function resetClipIndicators() {
    clipState.L = false;
    clipState.R = false;
}

const peakHoldTime = 500;   // how long the peak bar freezes

function initMeterCanvas(canvas) {//function to initialize the meters and calculate correct resolution to draw
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return ctx;
}

function drawMeter(ctx,canvasEl,rmsLevel,peakLevel,peakKey) {
    const canvasWidth = canvasEl.getBoundingClientRect().width;//CSS width
    const canvasHeight = canvasEl.getBoundingClientRect().height;//CSS height
    const numberOfSegments = 10; //how many segments
    const verticalGap = 5; //vertical space between segments
    const segmentHeight = (canvasHeight - verticalGap * (numberOfSegments - 1)) / numberOfSegments;//height of each segment

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);//clearing the canvas

    const activeSeg = Math.floor(rmsLevel * numberOfSegments); // 0–10, how many segments lit

    // Update peak hold
    const peakSeg = Math.ceil(peakLevel * numberOfSegments);
    const now = performance.now();//high resolution timestamp in milliseconds, all I can do...
    const individualPeakState = peakState[peakKey];
    if (peakSeg >= individualPeakState.level) {
        individualPeakState.level =  peakSeg;
        individualPeakState.holdUntil = now + peakHoldTime;
    } else if (now >= individualPeakState.holdUntil) {
        individualPeakState.level = Math.max(0, individualPeakState.level - 1); // gravity: decay 1 segment per frame
        individualPeakState.holdUntil = now + 30;// decay rate ~30ms / segment
    }

    if (peakLevel >= 1.0){//we check if something is clipping
        clipState[peakKey] = true;
    } 

    //we draw the segments
    for (let i = 0; i < numberOfSegments; i++) {
        // i = 0 is the BOTTOM segment (quietest), they are drawn from the bottom up, as was originally done on CSS
        const segIndex = i;//color index
        const y = canvasHeight - (i + 1) * segmentHeight - i * verticalGap;// top-left y of segment

        if (i == numberOfSegments - 1 && clipState[peakKey]) {//if something clipped
            ctx.fillStyle  = "#f00"; //this will stay until reset (on play or stop)
        }else if (i < activeSeg) {
            ctx.fillStyle = segmentsColors[segIndex];
        } else {
            ctx.fillStyle = "#111";
        }
        ctx.fillRect(0, y, canvasWidth, segmentHeight);
    }

    // Peak hold bar
    ctx.globalAlpha = 1;
    if (individualPeakState.level > 0 && individualPeakState.level <= numberOfSegments) {
        const peakY = canvasHeight - individualPeakState.level * segmentHeight - (individualPeakState.level - 1) * verticalGap - 2;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, peakY, canvasWidth, 2);
    }
}

// Initialise canvases after DOM is ready
let metersReady = false;
let ctxL, ctxR;//contexts to be initialized

//init outside to prevent creating new ones from scratch everytime updateAmplitudeDisplay fires...
const bufLen = analyserLeft.fftSize;
const ldData = new Float32Array(bufLen);
const rdData = new Float32Array(bufLen);

//the actual function that handles the meters
function updateAmplitudeDisplay(){
    if(!metersReady){
        ctxL = initMeterCanvas(meterLeft);//we get the left context
        ctxR = initMeterCanvas(meterRight);//we get the right context
        metersReady = true;//go! go! go!
    }

    analyserLeft.getFloatTimeDomainData(ldData);
    analyserRight.getFloatTimeDomainData(rdData);

    const lRMS = calculateRMS(ldData); 
    const rRMS = calculateRMS(rdData);
    const lPeak = calculatePeak(ldData);
    const rPeak = calculatePeak(rdData);

    drawMeter(ctxL,meterLeft,lRMS,lPeak,"L");
    drawMeter(ctxR,meterRight,rRMS,rPeak,"R");

    requestAnimationFrame(updateAmplitudeDisplay);
}
updateAmplitudeDisplay();//go! go!! go!!!

/*
    utilities: any function that doesn't produce a sound, like random numbers generator and stuff like that, in order to be recognized by éliane, every function must be added to the utilities array (declared in globals.js)

*/
//random number generator
function aZRotate({min = 0, max = 10, integer = 1}){
    if(min > max){
        throw new Error("invalid values for 'a_z_rotate', 'max' MUST be greater than 'min'");
    }
    if(integer < 0 || integer > 1 || integer - parseInt(integer) > 0){
        throw new Error("invalid 'integer' value for 'a_z_rotate', allowed values -> 0 (no) or 1 (yes)");
    }
    if(integer){
        return variables.random = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    let n = Math.random() * (max - min) + min;
    // not so proud of this way of including max but.... 
    variables.random = Math.random() > 0.9 ? max : n;
}
utilities.push({
    name : "a_z_rotate",
    function : aZRotate
});


/*
    WAV RECORDING, I swear I tried to make it offline but as I always say in my classes "soy un fraude..."
    there is a segment wrapped in an async function because I found too late that recordingProcessor was going to be deprecated and had to make the switch to an audioWorklet that has to be added in an async fashion...
*/

let isRecording = false;
const recordedLeft = [];// Float32Array chunks, left channel
const recordedRight = [];// Float32Array chunks, right channel

// Merge the two mono analyser outputs into a stereo Processor
const recMerger = context.createChannelMerger(2);
const recProcessor = null;

//the async part in question where after loading the processor, we connect everything...
(async () => {
    await context.audioWorklet.addModule("js/recorder-processor.js");

    const recProcessor = new AudioWorkletNode(context, "recorder-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 1,//this will be the "silent workaround" explained below
        channelCount: 2,
        channelCountMode: "explicit"
    });

    analyserLeft.connect(recMerger, 0, 0);// analyserLeft  → merger ch 0
    analyserRight.connect(recMerger,0, 1);// analyserRight → merger ch 1
    recMerger.connect(recProcessor);

    //a workaround to keep the processor "alive" before it receives the actual data, if this "fake signal" is not present, the context skips the processorNode and final WAV comes out empty
    const recSilence = context.createGain();
    recSilence.gain.value = 0;
    recProcessor.connect(recSilence); 
    recSilence.connect(context.destination);//as this connects to the destination, it tricks the context to not skip the processor

    
    recProcessor.port.addEventListener("message", e => {
        if (!isRecording) return;
        // if we are actually recording we push the audio chunks as they come
        recordedLeft.push(e.data.L);
        recordedRight.push(e.data.R);
    });
    recProcessor.port.start();//YES, you have to add the event listener, and also tell it to start...

})();

const keepAliveHack = context.createConstantSource();//hack for firefox, a silent stream source to keep the analysers alive
keepAliveHack.offset.value = 0;
keepAliveHack.connect(analyserLeft);
keepAliveHack.connect(analyserRight);
keepAliveHack.start();

function startRecording() {//here we go!!!
    recordedLeft.length = 0;
    recordedRight.length = 0;
    isRecording = true;  
}

function stopRecording() {//let's finish this business
    isRecording = false;
    const sampleRate = context.sampleRate;

    // accumulate chunk arrays into single Float32Arrays
    const totalSamples = recordedLeft.reduce((n, c) => n + c.length, 0);//both are of the same length so let's take the left...
    const L = new Float32Array(totalSamples);
    const R = new Float32Array(totalSamples);
    let offset = 0;//how long till next chunk
    for (let i = 0; i < recordedLeft.length; i++) {
        L.set(recordedLeft[i], offset);
        R.set(recordedRight[i], offset);
        offset += recordedLeft[i].length;
    }

    const wav = encodeWAV(L, R, sampleRate);//render...
    downloadWAV(wav);//and download...
}

//the actual paperwork... 
function encodeWAV(left,right,sampleRate) {
    const numChannels = 2;
    const bitDepth = 16;
    const numSamples = left.length;
    const dataSize = numSamples * numChannels * (bitDepth / 8);
    const buffer = new ArrayBuffer(44 + dataSize);
    const v = new DataView(buffer);

    //function to write the format stuff
    function writeStr(offset, str) {
        for (let i = 0; i < str.length; i++){ 
            v.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    //format stuff
    writeStr(0,"RIFF");
    v.setUint32(4,36 + dataSize, true);
    writeStr(8,"WAVE");
    writeStr(12,"fmt ");
    v.setUint32(16,16,true);// subchunk1 size
    v.setUint16(20,1, true);// PCM format
    v.setUint16(22,numChannels,true);
    v.setUint32(24,sampleRate,true);
    v.setUint32(28,sampleRate * numChannels * (bitDepth / 8),true); // byte rate
    v.setUint16(32,numChannels * (bitDepth / 8),true);// block align
    v.setUint16(34,bitDepth,true);
    writeStr(36,"data");
    v.setUint32(40,dataSize,true);

    //finally... the audio data
    let byteOffset = 44;
    for (let i = 0; i < numSamples; i++) {
        // clamp and convert float32 → int16
        v.setInt16(byteOffset, Math.max(-1, Math.min(1, left[i]))  * 0x7FFF, true); byteOffset += 2;
        v.setInt16(byteOffset, Math.max(-1, Math.min(1, right[i])) * 0x7FFF, true); byteOffset += 2;
    }

    return buffer;
}

function downloadWAV(arrayBuffer) {
    const blob = new Blob([arrayBuffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);
    const donwloadLink = document.createElement("a");
    donwloadLink.href = url;
    donwloadLink.download = `eliane-recording-${Date.now()}.wav`;
    donwloadLink.click();
    URL.revokeObjectURL(url);
}