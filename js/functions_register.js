/* FUNCTIONS REGISTER */

/*
*All functions MUST receive a next event argument(could be NULL) and implement what's explained below
*The second argument MUST be a destructured object with defauls values, all arguments MUST be numbers

//function names MUST have at least two words in camel case
function myFunction(nextEvent, {a = 12, b = 23, c = 23 }){
    //the stuff the functions does
    if(nextEvent){//if there's a next event
        nextFunction(nextEvent);//invoke the nextFunction (declared in the globals.js file) to keep the sequence going
    }
}
*/

/* FUNCTIONS */

/*
 silly_test_synth
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the global BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the global BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the global BPM
    amplitude: a number between 0 and 1 representing the amplitude
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function sillyTestSynth(nextEvent, {frequency = 100 ,attack = 0, sustain = 0, release = 1, amplitude = 1, pan = 0, delaytime = 0, feedback = 0.5}){
    // initial validations
    if(frequency <= 0){
        throw new Error("'frequency' value for 'silly_test_synth' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'silly_test_synth' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'silly_test_synth' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'silly_test_synth' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'silly_test_synth' MUST be between 0 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'silly_test_synth' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'silly_test_synth' MUST be greater or equal to 0");
    }

    const osc1 = createOSC(frequency,"sawtooth");//first oscillator
    const osc2 = createOSC(frequency + 0.3,"square");//second detuned oscillator

    const env = createEnvelope(amplitude,attack,sustain,release);//envelope


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //we connect the oscillators to the envelope
    osc1.connect(env);
    osc2.connect(env);

    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'silly_test_synth' MUST be between 0 and 0.9");
        }
        const delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime);//we assign the value
        const feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    //the panner goes to the destination (stereo output)
    env.connect(panner).connect(context.destination);

    //start the oscillators
    osc1.start(context.currentTime);
    osc2.start(context.currentTime);

    //stop the oscillators
    osc1.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    osc2.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    
    //mechanism to invoke the next event in the sequence, if there's any
    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 simple_wave
    wave: a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the global BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the global BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the global BPM
    amplitude: a number between 0 and 1 representing the amplitude
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function simpleWave(nextEvent, {wave = 0, frequency = 100, attack = 0, sustain = 0, release = 1, amplitude = 1, pan = 0, delaytime = 0, feedback = 0.5}){
    // initial validations
    if(wave < 0 || wave > 3){
        throw new Error("invalid 'wave' value for 'simple_wave', allowed values: 0 (sine), 1 (triangle), 2 (square) or 3 (sawtooth)");
    }
    if(frequency <= 0){
        throw new Error("'frequency' value for 'simple_wave' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'simple_wave' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'simple_wave' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'simple_wave' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'simple_wave' MUST be between 0 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'simple_wave' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'simple_wave' MUST be greater or equal to 0");
    }

    const waves = ["sine","triangle","square","sawtooth"];//waveforms

    const oscillator = createOSC(frequency,waves[wave]);//oscillator

    const env = createEnvelope(amplitude,attack,sustain,release);//envelope


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right


    //oscillator --> envelope --> panner --> destination (stereo output)
    oscillator.connect(env).connect(panner).connect(context.destination);

    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'simple_wave' MUST be between 0 and 0.9");
        }
        const delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime);//we assign the value
        const feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    oscillator.start(context.currentTime);

    oscillator.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    
    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 white_noise
    attack: a number greater or equal to 0 representing the attack time as a multiple of the global BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the global BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the global BPM
    amplitude: a number between 0 and 1 representing the amplitude
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function whiteNoise(nextEvent, {attack = 0, sustain = 0, release = 1, amplitude = 1, pan = 0, delaytime = 0, feedback = 0.5}){
    // initial validations
    if(attack < 0){
        throw new Error("'attack' value for 'white_noise' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'white_noise' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'white_noise' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'white_noise' MUST be between 0 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'white_noise' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'white_noise' MUST be greater or equal to 0");
    }

    //we generate the white noise "node", see context_utilities.js for documentation on "generateWhiteNoise" function
    const whiteNoiseBuffer = generateWhiteNoise(pulseToSeconds(attack + sustain + release));
    const whiteNoiseSource = context.createBufferSource();
    whiteNoiseSource.buffer = whiteNoiseBuffer;

    const env = createEnvelope(amplitude,attack,sustain,release);//envelope


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //white noise --> envelope --> panner --> destination (stereo output)
    whiteNoiseSource.connect(env).connect(panner).connect(context.destination);

    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'white_noise' MUST be between 0 and 0.9");
        }
        const delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime);//we assign the value
        const feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    whiteNoiseSource.start(context.currentTime);

    whiteNoiseSource.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    
    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 tuned_noise
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the global BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the global BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the global BPM
    amplitude: a number between 0 and 2 representing the amplitude
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function tunedNoise(nextEvent, {frequency = 100, attack = 0, sustain = 0, release = 1, amplitude = 2, pan = 0, delaytime = 0, feedback = 0.5}){
    // initial validations
    if(frequency <= 0){
        throw new Error("'frequency' value for 'tuned_noise' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'tuned_noise' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'tuned_noise' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'tuned_noise' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 2){
        throw new Error("'amplitude' value for 'tuned_noise' MUST be between 0 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'tuned_noise' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'tuned_noise' MUST be greater or equal to 0");
    }

    //we generate the white noise "node", see context_utilities.js for documentation on "generateWhiteNoise" function
    const whiteNoiseBuffer = generateWhiteNoise(pulseToSeconds(attack + sustain + release));
    const whiteNoiseSource = context.createBufferSource();
    whiteNoiseSource.buffer = whiteNoiseBuffer;

    const env = createEnvelope(amplitude * 8,attack,sustain,release);//envelope

    const BPF = new BiquadFilterNode(context, {//band pass filter node
        type: 'bandpass',
        frequency,
        Q : 10 
    });


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //white noise --> filter --> envelope --> panner --> destination (stereo output)
    whiteNoiseSource.connect(BPF).connect(env).connect(panner).connect(context.destination);

    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'tuned_noise' MUST be between 0 and 0.9");
        }
        const delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime);//we assign the value
        const feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    whiteNoiseSource.start(context.currentTime);

    whiteNoiseSource.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    
    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 basic_synth
    frequency: a number greater than 0 representing the frequency in hertz
    detune: a number representing the amount (in hertz) of detuning of the second oscillator
    attack: a number greater or equal to 0 representing the attack time as a multiple of the global BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the global BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the global BPM
    amplitude: a number between 0 and 1 representing the amplitude
    cutoff: a number greater than 0 representing the cutoff frequency for the low pass filter
    q: a number between 1 and 25 representing the resonance of the filter
    contour: a number between 0.1 and 1 representing the time (as multiple of the duration) for the filter to go from full open to the cutoff value
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function basicSynth(nextEvent, {frequency = 100 , detune = 1, attack = 0, sustain = 0, release = 1, amplitude = 1, cutoff = 20000, q = 1, contour = 0.8, pan = 0, delaytime = 0, feedback = 0.5}){
    // initial validations
    if(frequency <= 0){
        throw new Error("'frequency' value for 'basic_synth' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'basic_synth' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'basic_synth' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'basic_synth' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'basic_synth' MUST be between 0 and 1");
    }
    if(cutoff <= 0){
        throw new Error("'cutoff' value for 'basic_synth' MUST be greater than 0");
    }
    if(q < 1 || q > 25){
        throw new Error("'q' value for 'basic_synth' MUST be between 1 and 25");
    }
    if(contour < 0.1 || contour > 1){
        throw new Error("'contour' value for 'basic_synth' MUST be between 0.1 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'basic_synth' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'basic_synth' MUST be greater or equal to 0");
    }

    const osc1 = createOSC(frequency,"sawtooth");//first oscillator
    const osc2 = createOSC(frequency + detune,"sawtooth");//second oscillator

    const env = createEnvelope(amplitude,attack,sustain,release);//envelope

    const LPF = new BiquadFilterNode(context, {//low pass filter node
        type: 'lowpass',
        Q : q 
    });

    //envelope for the cutoff of the filter
    LPF.frequency.cancelScheduledValues(context.currentTime);
    LPF.frequency.setValueAtTime(20000, context.currentTime);
    LPF.frequency.linearRampToValueAtTime(20000, context.currentTime + pulseToSeconds(attack));
    LPF.frequency.exponentialRampToValueAtTime(cutoff, context.currentTime + pulseToSeconds(attack) + pulseToSeconds(contour));//CONTOUR


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //oscillators --> low pass filter
    osc1.connect(LPF);
    osc2.connect(LPF);

    //low pass filter --> envelope
    LPF.connect(env)

    //envelope --> panner --> destination (stereo output)
    env.connect(panner).connect(context.destination);

    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'basic_synth' MUST be between 0 and 0.9");
        }
        const delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime);//we assign the value
        const feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    osc1.start(context.currentTime);
    osc2.start(context.currentTime);

    osc1.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    osc2.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    
    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 bass_line
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the global BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the global BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the global BPM
    amplitude: a number between 0 and 1 representing the amplitude
    cutoff: a number greater than 0 representing the cutoff frequency for the low pass filter
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function bassLine(nextEvent, {frequency = 100 , attack = 0, sustain = 0, release = 1, amplitude = 1, cutoff = 10000, pan = 0, delaytime = 0, feedback = 0.5}){
    // initial validations
    if(frequency <= 0){
        throw new Error("'frequency' value for 'bass_line' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'bass_line' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'bass_line' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'bass_line' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'bass_line' MUST be between 0 and 1");
    }
    if(cutoff <= 0){
        throw new Error("'cutoff' value for 'bass_line' MUST be greater than 0");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'bass_line' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'bass_line' MUST be greater or equal to 0");
    }

    const osc1 = createOSC(frequency,"sawtooth");//first oscillator
    const osc2 = createOSC(frequency / 2,"square");//second oscillator

    const env = createEnvelope(amplitude,attack,sustain,release);//envelope

    const LPF = new BiquadFilterNode(context, {//low pass filter node
        type: 'lowpass',
        frequency : cutoff,
        Q : 5 
    });

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //oscillators --> low pass filter
    osc1.connect(LPF);
    osc2.connect(LPF);

    //low pass filter --> envelope
    LPF.connect(env)

    //envelope --> panner --> destination (stereo output)
    env.connect(panner).connect(context.destination);

    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'bass_line' MUST be between 0 and 0.9");
        }
        const delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime);//we assign the value
        const feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    osc1.start(context.currentTime);
    osc2.start(context.currentTime);

    osc1.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    osc2.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    
    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 basic_fm
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the global BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the global BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the global BPM
    amplitude: a number between 0 and 1 representing the amplitude
    mod: a number greater than 0 representing the frequency of the modulator as a multiple of the carrier
    depth: a number greater or equal to 0 representing the depth of the modulation
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function basicFm(nextEvent,{frequency = 100, attack = 0, sustain = 0, release = 1, amplitude = 1, mod = 2, depth = 1000, pan = 0, delaytime = 0, feedback = 0.5}){
    // initial validations
    if(frequency <= 0){
        throw new Error("'frequency' value for 'basic_fm' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'basic_fm' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'basic_fm' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'basic_fm' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'basic_fm' MUST be between 0 and 1");
    }
    if(mod <= 0){
        throw new Error("'mod' value for 'basic_fm' MUST be greater than 0");
    }
    if(depth < 0){
        throw new Error("'depth' value for 'basic_fm' MUST be greater or equal to 0");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'basic_fm' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'basic_fm' MUST be greater or equal to 0");
    }

    const carrier = createOSC(frequency,"sine");//carrier oscillator
    const modulator = createOSC(frequency * mod,"sine");//modulator oscillator

    const env = createEnvelope(amplitude,attack,sustain,release);//main envelope
    const modEnv = createEnvelope(depth,attack,sustain,release);//envelope for modulator --> depth

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //modulator --> modulator envelope --> carrier frequency
    modulator.connect(modEnv);
    modEnv.connect(carrier.frequency);

    //carrier --> envelope --> panner --> destination (stereo output)
    carrier.connect(env).connect(panner).connect(context.destination);

    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'basic_fm' MUST be between 0 and 0.9");
        }
        const delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime);//we assign the value
        const feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    modulator.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    modulator.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 basic_fm_env
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the global BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the global BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the global BPM
    amplitude: a number between 0 and 1 representing the amplitude
    mod: a number greater than 0 representing the frequency of the modulator as a multiple of the carrier
    depth: a number greater or equal to 0 representing the depth of the modulation
    modattack: a number greater or equal to 0 representing the attack time of the modulator as a multiple of the global BPM
    modsustain: a number greater or equal to 0 representing the sustain time of the modulator as a multiple of the global BPM
    modrelease: a number greater or equal to 0 representing the release time of the modulator as a multiple of the global BPM
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function basicFmEnv(nextEvent,{frequency = 100, attack = 0, sustain = 0, release = 1, amplitude = 1, mod = 2, depth = 1000, modattack = 0, modsustain = 0, modrelease = 1, pan = 0, delaytime = 0, feedback = 0.5}){
    // initial validations
    if(frequency <= 0){
        throw new Error("'frequency' value for 'basic_fm_env' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'basic_fm_env' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'basic_fm_env' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'basic_fm_env' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'basic_fm_env' MUST be between 0 and 1");
    }
    if(mod <= 0){
        throw new Error("'mod' value for 'basic_fm_env' MUST be greater than 0");
    }
    if(depth < 0){
        throw new Error("'depth' value for 'basic_fm_env' MUST be greater or equal to 0");
    }
    if(modattack < 0){
        throw new Error("'modattack' value for 'basic_fm_env' MUST be greater or equal to 0");
    }
    if(modsustain < 0){
        throw new Error("'modsustain' value for 'basic_fm_env' MUST be greater or equal to 0");
    }
    if(modrelease < 0){
        throw new Error("'modrelease' value for 'basic_fm_env' MUST be greater or equal to 0");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'basic_fm_env' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'basic_fm_env' MUST be greater or equal to 0");
    }

    const carrier = createOSC(frequency,"sine");//carrier
    const modulator = createOSC(frequency * mod,"sine");//modulator

    //envelopes
    const env = createEnvelope(amplitude,attack,sustain,release);
    const modEnv = createEnvelope(depth,modattack,modsustain,modrelease);

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //modulator --> modulator envelope --> carrier frequency
    modulator.connect(modEnv);
    modEnv.connect(carrier.frequency);

    //carrier --> envelope --> panner --> destination (stereo output)
    carrier.connect(env).connect(panner).connect(context.destination);

    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'basic_fm_env' MUST be between 0 and 0.9");
        }
        const delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime);//we assign the value
        const feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    modulator.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    modulator.stop(context.currentTime + pulseToSeconds(modattack) + pulseToSeconds(modsustain) + pulseToSeconds(modrelease));

    if(nextEvent){
        nextFunction(nextEvent);
    }

}

/*
 fm_in_series
    frequency: a number greater than 0 representing the frequency in hertz. Default: 200.
    attack: a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 8.
    release: a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 8.
    amplitude: a number between 0 and 1 representing the amplitude. Default: 1.
    modone: a number greater than 0 representing the frequency of the first modulator as a multiple of the carrier. Default: 0.0625.
    depthone: a number greater or equal to 0 representing the depth of the modulation of the first modulator. Default: 3000.
    oneattack: a number greater or equal to 0 representing the attack time of the first modulator as a multiple of the global BPM. Default: 0.
    onesustain: a number greater or equal to 0 representing the sustain time of the first modulator as a multiple of the global BPM. Default: 0.
    onerelease: a number greater or equal to 0 representing the release time of the first modulator as a multiple of the global BPM. Default: 16.
    modtwo: a number greater than 0 representing the frequency of the second modulator as a multiple of the first modulator. Default: 3.
    depthtwo: a number greater or equal to 0 representing the depth of the modulation of the second modulator. Default: 1000.
    twoattack: a number greater or equal to 0 representing the attack time of the second modulator as a multiple of the global BPM. Default: 12.
    twosustain: a number greater or equal to 0 representing the sustain time of the second modulator as a multiple of the global BPM. Default: 0.
    tworelease: a number greater or equal to 0 representing the release time of the second modulator as a multiple of the global BPM. Default: 3.
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
    feedback: a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.
 */
function fmInSeries(nextEvent,{frequency = 200, attack = 0, sustain = 8, release = 8, amplitude = 1, modone = 0.0625, depthone = 3000, oneattack = 0, onesustain = 0, onerelease = 16, modtwo = 3, depthtwo = 1000, twoattack = 12, twosustain = 0, tworelease = 3, pan = 0, delaytime = 0, feedback = 0.5}){
    // initial validations
    if(frequency <= 0){
        throw new Error("'frequency' value for 'fm_in_series' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'fm_in_series' MUST be between 0 and 1");
    }
    if(modone <= 0){
        throw new Error("'modone' value for 'fm_in_series' MUST be greater than 0");
    }
    if(depthone < 0){
        throw new Error("'depthone' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(oneattack < 0){
        throw new Error("'oneattack' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(onesustain < 0){
        throw new Error("'onesustain' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(onerelease < 0){
        throw new Error("'onerelease' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(modtwo <= 0){
        throw new Error("'modtwo' value for 'fm_in_series' MUST be greater than 0");
    }
    if(depthtwo < 0){
        throw new Error("'depthtwo' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(twoattack < 0){
        throw new Error("'twoattack' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(twosustain < 0){
        throw new Error("'twosustain' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(tworelease < 0){
        throw new Error("'tworelease' value for 'fm_in_series' MUST be greater or equal to 0");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'fm_in_series' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'fm_in_series' MUST be greater or equal to 0");
    }

    const carrier = createOSC(frequency,"sine");//carrier
    const modulatorOne = createOSC(frequency * modone,"sine");//modulator
    const modulatorTwo = createOSC(frequency * modone * modtwo,"sine");//modulator

    //envelopes
    const env = createEnvelope(amplitude,attack,sustain,release);
    const modOneEnv = createEnvelope(depthone,oneattack,onesustain,onerelease);
    const modTwoEnv = createEnvelope(depthtwo,twoattack,twosustain,tworelease);

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //modulator --> modulator envelope --> carrier frequency
    modulatorTwo.connect(modTwoEnv);
    modTwoEnv.connect(modulatorOne.frequency);
    modulatorOne.connect(modOneEnv);
    modOneEnv.connect(carrier.frequency);

    //carrier --> envelope --> panner --> destination (stereo output)
    carrier.connect(env).connect(panner).connect(context.destination);

    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'fm_in_series' MUST be between 0 and 0.9");
        }
        const delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime);//we assign the value
        const feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    modulatorOne.start(context.currentTime);
    modulatorTwo.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    modulatorOne.stop(context.currentTime + pulseToSeconds(oneattack) + pulseToSeconds(onesustain) + pulseToSeconds(onerelease));
    modulatorTwo.stop(context.currentTime + pulseToSeconds(twoattack) + pulseToSeconds(twosustain) + pulseToSeconds(tworelease));

    if(nextEvent){
        nextFunction(nextEvent);
    }

}

/*
 fm_in_parallel
    frequency: a number greater than 0 representing the frequency in hertz. Default: 200.
    attack: a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 8.
    release: a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 8.
    amplitude: a number between 0 and 1 representing the amplitude. Default: 1.
    modone: a number greater than 0 representing the frequency of the first modulator as a multiple of the carrier. Default: 0.0625.
    depthone: a number greater or equal to 0 representing the depth of the modulation of the first modulator. Default: 3000.
    oneattack: a number greater or equal to 0 representing the attack time of the first modulator as a multiple of the global BPM. Default: 0.
    onesustain: a number greater or equal to 0 representing the sustain time of the first modulator as a multiple of the global BPM. Default: 0.
    onerelease: a number greater or equal to 0 representing the release time of the first modulator as a multiple of the global BPM. Default: 16.
    modtwo: a number greater than 0 representing the frequency of the second modulator as a multiple of the first modulator. Default: 3.
    depthtwo: a number greater or equal to 0 representing the depth of the modulation of the second modulator. Default: 1000.
    twoattack: a number greater or equal to 0 representing the attack time of the second modulator as a multiple of the global BPM. Default: 12.
    twosustain: a number greater or equal to 0 representing the sustain time of the second modulator as a multiple of the global BPM. Default: 0.
    tworelease: a number greater or equal to 0 representing the release time of the second modulator as a multiple of the global BPM. Default: 3.
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
    feedback: a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.
 */
function fmInParallel(nextEvent,{frequency = 200, attack = 0, sustain = 8, release = 8, amplitude = 1, modone = 0.0625, depthone = 3000, oneattack = 0, onesustain = 0, onerelease = 16, modtwo = 3, depthtwo = 1000, twoattack = 12, twosustain = 0, tworelease = 3, pan = 0, delaytime = 0, feedback = 0.5}){
    // initial validations
    if(frequency <= 0){
        throw new Error("'frequency' value for 'fm_in_parallel' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'fm_in_parallel' MUST be between 0 and 1");
    }
    if(modone <= 0){
        throw new Error("'modone' value for 'fm_in_parallel' MUST be greater than 0");
    }
    if(depthone < 0){
        throw new Error("'depthone' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(oneattack < 0){
        throw new Error("'oneattack' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(onesustain < 0){
        throw new Error("'onesustain' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(onerelease < 0){
        throw new Error("'onerelease' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(modtwo <= 0){
        throw new Error("'modtwo' value for 'fm_in_parallel' MUST be greater than 0");
    }
    if(depthtwo < 0){
        throw new Error("'depthtwo' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(twoattack < 0){
        throw new Error("'twoattack' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(twosustain < 0){
        throw new Error("'twosustain' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(tworelease < 0){
        throw new Error("'tworelease' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'fm_in_parallel' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'fm_in_parallel' MUST be greater or equal to 0");
    }

    const carrier = createOSC(frequency,"sine");//carrier
    const modulatorOne = createOSC(frequency * modone,"sine");//modulator
    const modulatorTwo = createOSC(frequency * modone * modtwo,"sine");//modulator

    //envelopes
    const env = createEnvelope(amplitude,attack,sustain,release);
    const modOneEnv = createEnvelope(depthone,oneattack,onesustain,onerelease);
    const modTwoEnv = createEnvelope(depthtwo,twoattack,twosustain,tworelease);

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //modulator --> modulator envelope --> carrier frequency
    modulatorOne.connect(modOneEnv);
    modOneEnv.connect(carrier.frequency);
    modulatorTwo.connect(modTwoEnv);
    modTwoEnv.connect(carrier.frequency);

    //carrier --> envelope --> panner --> destination (stereo output)
    carrier.connect(env).connect(panner).connect(context.destination);

    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'fm_in_parallel' MUST be between 0 and 0.9");
        }
        const delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime);//we assign the value
        const feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    modulatorOne.start(context.currentTime);
    modulatorTwo.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack) + pulseToSeconds(sustain) + pulseToSeconds(release));
    modulatorOne.stop(context.currentTime + pulseToSeconds(oneattack) + pulseToSeconds(onesustain) + pulseToSeconds(onerelease));
    modulatorTwo.stop(context.currentTime + pulseToSeconds(twoattack) + pulseToSeconds(twosustain) + pulseToSeconds(tworelease));

    if(nextEvent){
        nextFunction(nextEvent);
    }

}

functions = {
    sillyTestSynth,
    simpleWave,
    whiteNoise,
    tunedNoise,
    basicSynth,
    bassLine,
    basicFm,
    basicFmEnv,
    fmInSeries,
    fmInParallel
};//we add all the functions to the global register