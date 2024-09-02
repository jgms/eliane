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

//helper function to get SECONDS out of multiples of our global BPM
function pulseToSeconds(value){
    return value * bpm / 1000;
}


function createOSC(frequency,type){//this functions returns a simple oscillator node
    return new OscillatorNode(context,{type,frequency});
}

function createEnvelope(amplitude, attack, sustain, release){//this function returns an envelope. Attack, sustain and release times are in multiples of the global BPM, we'll use the helper pulseToSeconds to handle them 
    const envelope = new GainNode(context);

    envelope.gain.cancelScheduledValues(context.currentTime);
    envelope.gain.setValueAtTime(0,context.currentTime);
    envelope.gain.linearRampToValueAtTime(amplitude, context.currentTime + pulseToSeconds(attack));
    envelope.gain.linearRampToValueAtTime(amplitude, context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain));
    
    //linear or exponential..can't decide =(
    //envelope.gain.linearRampToValueAtTime(0, context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    
    envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    envelope.gain.linearRampToValueAtTime(0, context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release) + 0.01);
    
    return envelope;
}

/* 
this will create a phase shifted sine wave oscillator, how to use it:

const lfoWaveform = createLFOWaveform(phase);
const lfoSource = context.createBufferSource();
lfoSource.buffer = lfoWaveform;
lfoSource.loop = true; // Loop the LFO waveform
lfoSource.playbackRate.value = LFOfreq; // Set the LFO frequency

*/
function createLFOWaveform(phase) {
    const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);//we create an audio buffer of one channel, the length is the same as the sample rate as we are going to loop it later
    const data = buffer.getChannelData(0);//we extract the data array

    for (let i = 0; i < data.length; i++) {//then we are going to fill the array with a periodic waveform (sine in this case)
        const t = i / context.sampleRate;//the exact moment(second) "in time"
        data[i] = Math.sin(2 * Math.PI * t + phase); // "sin" function expects radians, so we convert the time into radians (2 * Math.PI * t) and apply the phase shift (0 is the beggining at the bottom, Math.PI / 2 is at the top (90 degrees)
    }

    return buffer;
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

function setPan(pan){ //-1(left) 0 1(right)
    return new StereoPannerNode(context,{pan});// a stereo panner node =)
}

/* this function will handle the UI meters */
function updateAmplitudeDisplay() {
    const bufferLength = analyserLeft.fftSize;//it doesn't matter, both are the same size
    const leftChannelData = new Float32Array(bufferLength);//Used to store time-domain data from the AnalyserNode
    const rightChannelData = new Float32Array(bufferLength);
    // Get the time-domain data for each channel
    analyserLeft.getFloatTimeDomainData(leftChannelData);
    analyserRight.getFloatTimeDomainData(rightChannelData);

    // Calculate RMS amplitude for each channel
    const leftAmplitude = Math.floor(calculateRMS(leftChannelData) * 10);
    const rightAmplitude = Math.floor(calculateRMS(rightChannelData) * 10);


    metersLeft.forEach( (meter,i) => meter.className = i < leftAmplitude ? "visible" : "");
    metersRight.forEach( (meter,i) => meter.className = i < rightAmplitude ? "visible" : "");
    requestAnimationFrame(updateAmplitudeDisplay);
}
updateAmplitudeDisplay();//go! go!! go!!!