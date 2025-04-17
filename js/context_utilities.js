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