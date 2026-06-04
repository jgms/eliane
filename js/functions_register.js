/* FUNCTIONS REGISTER */

/*
*All functions MUST receive a next event argument(could be NULL) and implement what's explained below
*The second argument MUST be a destructured object with defauls values, all arguments MUST be numbers
*the third argument represents the CURRENT bpm, as is given to you by the interpreter and needed by the pulseToSeconds and createEnvelope utility functions, it's up to you to decide if it is of use to you or not...

//function names MUST have at least two words in camel case
function myFunction(nextEvent, {a = 12, b = 23, c = 23 },bpm){
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
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function sillyTestSynth(nextEvent, {frequency = 100 ,attack = 0, sustain = 0, release = 1, amplitude = 1, pan = 0, delaytime = 0, feedback = 0.5},bpm){
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

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //we connect the oscillators to the envelope
    osc1.connect(env);
    osc2.connect(env);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'silly_test_synth' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

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
    osc1.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    osc2.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    osc2.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            osc1.disconnect();
            osc2.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });
    
    //mechanism to invoke the next event in the sequence, if there's any
    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 simple_wave
    wave: a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function simpleWave(nextEvent, {wave = 0, frequency = 100, attack = 0, sustain = 0, release = 1, amplitude = 1, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(wave < 0 || wave > 3 || wave - parseInt(wave) > 0){
        throw new Error("invalid 'wave' value for 'simple_wave', allowed values -> 0 (sine), 1 (triangle), 2 (square) or 3 (sawtooth)");
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

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right


    //oscillator --> envelope --> panner --> destination (stereo output)
    oscillator.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'simple_wave' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    oscillator.start(context.currentTime);

    oscillator.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    oscillator.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            oscillator.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });
    
    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 simple_wave_gliss
    wave: a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth
    start: a number greater than 0 representing the initial frequency in hertz
    end: a number greater than 0 representing the final frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function simpleWaveGliss(nextEvent, {wave = 0, start = 800, end = 100, attack = 0, sustain = 4, release = 1, amplitude = 1, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(wave < 0 || wave > 3 || wave - parseInt(wave) > 0){
        throw new Error("invalid 'wave' value for 'simple_wave_gliss', allowed values -> 0 (sine), 1 (triangle), 2 (square) or 3 (sawtooth)");
    }
    if(start <= 0){
        throw new Error("'start' value for 'simple_wave_gliss' MUST be greater than 0");
    }
    if(end <= 0){
        throw new Error("'end' value for 'simple_wave_gliss' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'simple_wave_gliss' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'simple_wave_gliss' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'simple_wave_gliss' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'simple_wave_gliss' MUST be between 0 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'simple_wave_gliss' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'simple_wave_gliss' MUST be greater or equal to 0");
    }

    const waves = ["sine","triangle","square","sawtooth"];//waveforms

    const oscillator = createOSC(start,waves[wave]);//oscillator

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right


    //oscillator --> envelope --> panner --> destination (stereo output)
    oscillator.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'simple_wave_gliss' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    oscillator.start(context.currentTime);
    oscillator.frequency.cancelScheduledValues(context.currentTime);
    oscillator.frequency.setValueAtTime(start,context.currentTime);
    oscillator.frequency.linearRampToValueAtTime(end,context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    oscillator.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    oscillator.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            oscillator.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 simple_wave_ring
    wave: a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    modfreq: a number greater than 0 representing the frequency of the modulator in hertz
    modwave: a number representing the waveform of the modulator --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function simpleWaveRing(nextEvent, {wave = 0, frequency = 500, attack = 0, sustain = 0, release = 8, amplitude = 1, modfreq = 150, modwave = 2, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(wave < 0 || wave > 3 || wave - parseInt(wave) > 0){
        throw new Error("invalid 'wave' value for 'simple_wave_ring', allowed values -> 0 (sine), 1 (triangle), 2 (square) or 3 (sawtooth)");
    }
    if(frequency <= 0){
        throw new Error("'frequency' value for 'simple_wave_ring' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'simple_wave_ring' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'simple_wave_ring' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'simple_wave_ring' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'simple_wave_ring' MUST be between 0 and 1");
    }
    if(modfreq <= 0){
        throw new Error("'modfreq' value for 'simple_wave_ring' MUST be greater than 0");
    }
    if(modwave < 0 || modwave > 3 || modwave - parseInt(modwave) > 0){
        throw new Error("invalid 'modwave' value for 'simple_wave_ring', allowed values -> 0 (sine), 1 (triangle), 2 (square) or 3 (sawtooth)");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'simple_wave_ring' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'simple_wave_ring' MUST be greater or equal to 0");
    }

    const waves = ["sine","triangle","square","sawtooth"];//waveforms

    const oscillator = createOSC(frequency,waves[wave]);//oscillator

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //ring modulation

    const ringModulator = ringMod(modwave,modfreq,pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    // oscillator --> ringModulator --> envelope  --> panner --> destination
    oscillator.connect(ringModulator).connect(env).connect(panner).connect(context.destination);


    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'simple_wave_ring' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    oscillator.start(context.currentTime);

    oscillator.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    oscillator.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            oscillator.disconnect();
            ringModulator.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });
    
    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 simple_wave_lfo
    wave: a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth
    bottom: a number greater than 0 representing the bottom frequency in hertz
    top: a number greater than 'bottom' representing the top frequency in hertz
    lfo: a number greater than 0 representing the frequency of the LFO in hertz 
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function simpleWaveLfo(nextEvent, {wave = 0, top = 600, bottom = 400, lfo = 10, attack = 0, sustain = 0, release = 8, amplitude = 1, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(wave < 0 || wave > 3 || wave - parseInt(wave) > 0){
        throw new Error("invalid 'wave' value for 'simple_wave_lfo', allowed values -> 0 (sine), 1 (triangle), 2 (square) or 3 (sawtooth)");
    }
    if(bottom <= 0){
        throw new Error("'bottom' value for 'simple_wave_lfo' MUST be greater than 0");
    }
    if(top <= bottom){
        throw new Error("'top' value for 'simple_wave_lfo' MUST be greater than 'bottom'");
    }
    if(lfo <= 0){
        throw new Error("'lfo' value for 'simple_wave_lfo' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'simple_wave_lfo' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'simple_wave_lfo' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'simple_wave_lfo' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'simple_wave_lfo' MUST be between 0 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'simple_wave_lfo' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'simple_wave_lfo' MUST be greater or equal to 0");
    }

    const waves = ["sine","triangle","square","sawtooth"];//waveforms

    const rangeLFO = (top - bottom) / 2;
    const frequency = bottom + rangeLFO; 

    const oscillator = createOSC(frequency,waves[wave]);//oscillator

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope

    const LFO = createOSC(lfo,"sine");//LFO
    const LFOdepth = new GainNode(context,{gain :  rangeLFO});//depth of the modulator


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //LFO --> LFOdepth ---> oscillator
    LFO.connect(LFOdepth).connect(oscillator.frequency);

    //oscillator --> envelope --> panner --> destination (stereo output)
    oscillator.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'simple_wave_lfo' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    oscillator.start(context.currentTime);
    LFO.start(context.currentTime);

    oscillator.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFO.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    
    oscillator.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            oscillator.disconnect();
            LFO.disconnect();
            LFOdepth.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 simple_wave_lfo_ring
    wave: a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth
    bottom: a number greater than 0 representing the bottom frequency in hertz
    top: a number greater than 'bottom' representing the top frequency in hertz
    lfo: a number greater than 0 representing the frequency of the LFO in hertz 
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    modfreq: a number greater than 0 representing the frequency of the modulator in hertz
    modwave: a number representing the waveform of the modulator --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function simpleWaveLfoRing(nextEvent, {wave = 0, top = 600, bottom = 400, lfo = 10, attack = 0, sustain = 0, release = 8, amplitude = 1, modfreq = 500, modwave = 1, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(wave < 0 || wave > 3 || wave - parseInt(wave) > 0){
        throw new Error("invalid 'wave' value for 'simple_wave_lfo_ring', allowed values -> 0 (sine), 1 (triangle), 2 (square) or 3 (sawtooth)");
    }
    if(bottom <= 0){
        throw new Error("'bottom' value for 'simple_wave_lfo_ring' MUST be greater than 0");
    }
    if(top <= bottom){
        throw new Error("'top' value for 'simple_wave_lfo_ring' MUST be greater than 'bottom'");
    }
    if(lfo <= 0){
        throw new Error("'lfo' value for 'simple_wave_lfo_ring' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'simple_wave_lfo_ring' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'simple_wave_lfo_ring' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'simple_wave_lfo_ring' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'simple_wave_lfo_ring' MUST be between 0 and 1");
    }
    if(modfreq <= 0){
        throw new Error("'modfreq' value for 'imple_wave_lfo_ring' MUST be greater than 0");
    }
    if(modwave < 0 || modwave > 3 || modwave - parseInt(modwave) > 0){
        throw new Error("invalid 'modwave' value for 'imple_wave_lfo_ring', allowed values -> 0 (sine), 1 (triangle), 2 (square) or 3 (sawtooth)");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'simple_wave_lfo_ring' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'simple_wave_lfo_ring' MUST be greater or equal to 0");
    }

    const waves = ["sine","triangle","square","sawtooth"];//waveforms

    const rangeLFO = (top - bottom) / 2;
    const frequency = bottom + rangeLFO; 

    const oscillator = createOSC(frequency,waves[wave]);//oscillator

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope

    const LFO = createOSC(lfo,"sine");//LFO
    const LFOdepth = new GainNode(context,{gain :  rangeLFO});//depth of the modulator


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //LFO --> LFOdepth ---> oscillator
    LFO.connect(LFOdepth).connect(oscillator.frequency);

    //ring modulation

    const ringModulator = ringMod(modwave,modfreq,pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    //oscillator --> ringModulator --> envelope --> panner --> destination (stereo output)
    oscillator.connect(ringModulator).connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'simple_wave_lfo_ring' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    oscillator.start(context.currentTime);
    LFO.start(context.currentTime);

    oscillator.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFO.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    
    oscillator.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            oscillator.disconnect();
            LFO.disconnect();
            LFOdepth.disconnect();
            ringModulator.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 white_noise
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function whiteNoise(nextEvent, {attack = 0, sustain = 0, release = 1, amplitude = 1, pan = 0, delaytime = 0, feedback = 0.5},bpm){
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
    const whiteNoiseBuffer = generateWhiteNoise(pulseToSeconds(attack + sustain + release,bpm));
    const whiteNoiseSource = context.createBufferSource();
    whiteNoiseSource.buffer = whiteNoiseBuffer;

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //white noise --> envelope --> panner --> destination (stereo output)
    whiteNoiseSource.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'white_noise' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    whiteNoiseSource.start(context.currentTime);

    whiteNoiseSource.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    
    whiteNoiseSource.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            whiteNoiseSource.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 tuned_noise
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 2 representing the amplitude
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function tunedNoise(nextEvent, {frequency = 100, attack = 0, sustain = 0, release = 1, amplitude = 2, pan = 0, delaytime = 0, feedback = 0.5},bpm){
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
    const whiteNoiseBuffer = generateWhiteNoise(pulseToSeconds(attack + sustain + release,bpm));
    const whiteNoiseSource = context.createBufferSource();
    whiteNoiseSource.buffer = whiteNoiseBuffer;

    const env = createEnvelope(amplitude * 8,attack,sustain,release,bpm);//envelope

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

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'tuned_noise' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    whiteNoiseSource.start(context.currentTime);

    whiteNoiseSource.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    
    whiteNoiseSource.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            whiteNoiseSource.disconnect();
            BPF.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 basic_synth
    frequency: a number greater than 0 representing the frequency in hertz
    detune: a number representing the amount (in hertz) of detuning of the second oscillator
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    cutoff: a number greater than 0 representing the cutoff frequency for the low pass filter
    q: a number between 1 and 25 representing the resonance of the filter
    contour: a number between 0.1 and 1 representing the time (as multiple of the duration) for the filter to go from full open to the cutoff value
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function basicSynth(nextEvent, {frequency = 100 , detune = 1, attack = 0, sustain = 0, release = 1, amplitude = 1, cutoff = 20000, q = 1, contour = 0.8, pan = 0, delaytime = 0, feedback = 0.5},bpm){
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

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope

    const LPF = new BiquadFilterNode(context, {//low pass filter node
        type: 'lowpass',
        Q : q 
    });

    //envelope for the cutoff of the filter
    LPF.frequency.cancelScheduledValues(context.currentTime);
    LPF.frequency.setValueAtTime(20000, context.currentTime);
    LPF.frequency.linearRampToValueAtTime(20000, context.currentTime + pulseToSeconds(attack,bpm));
    LPF.frequency.exponentialRampToValueAtTime(cutoff, context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds((sustain + release) * contour,bpm));//CONTOUR


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

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'basic_synth' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    osc1.start(context.currentTime);
    osc2.start(context.currentTime);

    osc1.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    osc2.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    
    osc1.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            osc1.disconnect();
            osc2.disconnect();
            LPF.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 bass_line
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    cutoff: a number greater than 0 representing the cutoff frequency for the low pass filter
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function bassLine(nextEvent, {frequency = 100 , attack = 0, sustain = 0, release = 1, amplitude = 1, cutoff = 10000, pan = 0, delaytime = 0, feedback = 0.5},bpm){
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

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope

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

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'bass_line' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    osc1.start(context.currentTime);
    osc2.start(context.currentTime);

    osc1.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    osc2.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    
    osc1.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            osc1.disconnect();
            osc2.disconnect();
            LPF.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 basic_fm
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    mod: a number greater than 0 representing the frequency of the modulator as a multiple of the carrier
    depth: a number greater or equal to 0 representing the depth of the modulation
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function basicFm(nextEvent,{frequency = 100, attack = 0, sustain = 0, release = 1, amplitude = 1, mod = 2, depth = 1000, pan = 0, delaytime = 0, feedback = 0.5},bpm){
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

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//main envelope
    const modEnv = createEnvelope(depth,attack,sustain,release,bpm);//envelope for modulator --> depth

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

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'basic_fm' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    modulator.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulator.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    carrier.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            carrier.disconnect();
            modulator.disconnect();
            env.disconnect();
            modEnv.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 basic_fm_env
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    mod: a number greater than 0 representing the frequency of the modulator as a multiple of the carrier
    depth: a number greater or equal to 0 representing the depth of the modulation
    modattack: a number greater or equal to 0 representing the attack time of the modulator as a multiple of the BPM
    modsustain: a number greater or equal to 0 representing the sustain time of the modulator as a multiple of the BPM
    modrelease: a number greater or equal to 0 representing the release time of the modulator as a multiple of the BPM
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function basicFmEnv(nextEvent,{frequency = 100, attack = 0, sustain = 0, release = 1, amplitude = 1, mod = 2, depth = 1000, modattack = 0, modsustain = 0, modrelease = 1, pan = 0, delaytime = 0, feedback = 0.5},bpm){
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
    const env = createEnvelope(amplitude,attack,sustain,release,bpm);
    const modEnv = createEnvelope(depth,modattack,modsustain,modrelease,bpm);

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

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'basic_fm_env' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    modulator.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulator.stop(context.currentTime + pulseToSeconds(modattack,bpm) + pulseToSeconds(modsustain,bpm) + pulseToSeconds(modrelease,bpm));

    carrier.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            carrier.disconnect();
            modulator.disconnect();
            env.disconnect();
            modEnv.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }

}

/*
 basic_fm_lfo
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    mod: a number greater than 0 representing the frequency of the modulator as a multiple of the carrier
    depth: a number greater or equal to 0 representing the depth of the modulation
    lfo: a number greater than 0 representing the frequency of the LFO in hertz 
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function basicFmLfo(nextEvent,{frequency = 400, attack = 0, sustain = 0, release = 8, amplitude = 1, mod = 0.25, depth = 1000, lfo = 0.5, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(frequency <= 0){
        throw new Error("'frequency' value for 'basic_fm_lfo' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'basic_fm_lfo' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'basic_fm_lfo' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'basic_fm_lfo' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'basic_fm_lfo' MUST be between 0 and 1");
    }
    if(mod <= 0){
        throw new Error("'mod' value for 'basic_fm_lfo' MUST be greater than 0");
    }
    if(depth < 0){
        throw new Error("'depth' value for 'basic_fm_lfo' MUST be greater or equal to 0");
    }
    if(lfo <= 0){
        throw new Error("'lfo' value for 'basic_fm_lfo' MUST be greater than 0");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'basic_fm_lfo' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'basic_fm_lfo' MUST be greater or equal to 0");
    }

    const carrier = createOSC(frequency,"sine");//carrier oscillator
    const modulator = createOSC(frequency * mod,"sine");//modulator oscillator
    

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//main envelope
    const LFO = createOSC(lfo,"sine");//LFO
    const LFOdepth = new GainNode(context,{gain : depth});//depth of the modulator
    const LFOgain = new GainNode(context,{gain : 0.5});//gain to multiply the depth, to be controlled by the LFO

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //modulator --> LFOdepth ---> LFOgain(LFO ---> LFOgain) --> carrier frequency
    modulator.connect(LFOdepth);
    LFOdepth.connect(LFOgain);
    LFO.connect(LFOgain.gain);
    LFOgain.connect(carrier.frequency);

    //carrier --> envelope --> panner --> destination (stereo output)
    carrier.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'basic_fm_lfo' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    modulator.start(context.currentTime);
    LFO.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulator.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFO.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    carrier.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            carrier.disconnect();
            modulator.disconnect();
            LFO.disconnect();
            LFOdepth.disconnect();
            LFOgain.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 seven_fm
    frequency: a number greater than 0 representing the frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    modone: a number greater than 0 representing the frequency of the first modulator as a multiple of the carrier
    depthone: a number greater or equal to 0 representing the depth of the modulation of the first modulator
    lfoone: a number greater than 0 representing the frequency of the first LFO in hertz 
    modtwo: a number greater than 0 representing the frequency of the second modulator as a multiple of the carrier
    depthtwo: a number greater or equal to 0 representing the depth of the modulation of the second modulator
    lfotwo: a number greater than 0 representing the frequency of the second LFO in hertz
    modthree: a number greater than 0 representing the frequency of the third modulator as a multiple of the carrier
    depththree: a number greater or equal to 0 representing the depth of the modulation of the third modulator
    lfothree: a number greater than 0 representing the frequency of the third LFO in hertz
    modfour: a number greater than 0 representing the frequency of the fourth modulator as a multiple of the carrier
    depthfour: a number greater or equal to 0 representing the depth of the modulation of the fourth modulator
    lfofour: a number greater than 0 representing the frequency of the fourth LFO in hertz
    modfive: a number greater than 0 representing the frequency of the fifth modulator as a multiple of the carrier
    depthfive: a number greater or equal to 0 representing the depth of the modulation of the fifth modulator
    lfofive: a number greater than 0 representing the frequency of the fifth LFO in hertz
    modsix: a number greater than 0 representing the frequency of the sixth modulator as a multiple of the carrier
    depthsix: a number greater or equal to 0 representing the depth of the modulation of the sixth modulator
    lfosix: a number greater than 0 representing the frequency of the sixth LFO in hertz
    modseven: a number greater than 0 representing the frequency of the seventh modulator as a multiple of the carrier
    depthseven: a number greater or equal to 0 representing the depth of the modulation of the seventh modulator
    lfoseven: a number greater than 0 representing the frequency of the seventh LFO in hertz
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function sevenFm(nextEvent,{frequency = 600, attack = 0, sustain = 2, release = 2, amplitude = 1, modone = 0.125, depthone = 900, lfoone = 0.15, modtwo = 3, depthtwo = 1700, lfotwo = 0.45, modthree = 1, depththree = 0, lfothree = 1, modfour = 1, depthfour = 0, lfofour = 1, modfive = 1, depthfive = 0, lfofive = 1, modsix = 1, depthsix = 0, lfosix = 1, modseven = 1, depthseven = 0, lfoseven = 1, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(frequency <= 0){
        throw new Error("'frequency' value for 'seven_fm' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'seven_fm' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'seven_fm' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'seven_fm' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'seven_fm' MUST be between 0 and 1");
    }
    if(modone <= 0){
        throw new Error("'modone' value for 'seven_fm' MUST be greater than 0");
    }
    if(depthone < 0){
        throw new Error("'depthone' value for 'seven_fm' MUST be greater or equal to 0");
    }
    if(lfoone <= 0){
        throw new Error("'lfoone' value for 'seven_fm' MUST be greater than 0");
    }
    if(modtwo <= 0){
        throw new Error("'modtwo' value for 'seven_fm' MUST be greater than 0");
    }
    if(depthtwo < 0){
        throw new Error("'depthtwo' value for 'seven_fm' MUST be greater or equal to 0");
    }
    if(lfotwo <= 0){
        throw new Error("'lfotwo' value for 'seven_fm' MUST be greater than 0");
    }
    if(modthree <= 0){
        throw new Error("'modthree' value for 'seven_fm' MUST be greater than 0");
    }
    if(depththree < 0){
        throw new Error("'depththree' value for 'seven_fm' MUST be greater or equal to 0");
    }
    if(lfothree <= 0){
        throw new Error("'lfothree' value for 'seven_fm' MUST be greater than 0");
    }
    if(modfour <= 0){
        throw new Error("'modfour' value for 'seven_fm' MUST be greater than 0");
    }
    if(depthfour < 0){
        throw new Error("'depthfour' value for 'seven_fm' MUST be greater or equal to 0");
    }
    if(lfofour <= 0){
        throw new Error("'lfofour' value for 'seven_fm' MUST be greater than 0");
    }
    if(modfive <= 0){
        throw new Error("'modfive' value for 'seven_fm' MUST be greater than 0");
    }
    if(depthfive < 0){
        throw new Error("'depthfive' value for 'seven_fm' MUST be greater or equal to 0");
    }
    if(lfofive <= 0){
        throw new Error("'lfofive' value for 'seven_fm' MUST be greater than 0");
    }
    if(modsix <= 0){
        throw new Error("'modsix' value for 'seven_fm' MUST be greater than 0");
    }
    if(depthsix < 0){
        throw new Error("'depthsix' value for 'seven_fm' MUST be greater or equal to 0");
    }
    if(lfosix <= 0){
        throw new Error("'lfosix' value for 'seven_fm' MUST be greater than 0");
    }
    if(modseven <= 0){
        throw new Error("'modseven' value for 'seven_fm' MUST be greater than 0");
    }
    if(depthseven < 0){
        throw new Error("'depthseven' value for 'seven_fm' MUST be greater or equal to 0");
    }
    if(lfoseven <= 0){
        throw new Error("'lfoseven' value for 'seven_fm' MUST be greater than 0");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'seven_fm' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'seven_fm' MUST be greater or equal to 0");
    }

    const carrier = createOSC(frequency,"sine");//carrier oscillator
    const modulatorOne = createOSC(frequency * modone,"sine");//modulator oscillator
    const modulatorTwo = createOSC(frequency * modtwo,"sine");//modulator oscillator
    const modulatorThree = createOSC(frequency * modthree,"sine");//modulator oscillator
    const modulatorFour = createOSC(frequency * modfour,"sine");//modulator oscillator
    const modulatorFive = createOSC(frequency * modfive,"sine");//modulator oscillator
    const modulatorSix = createOSC(frequency * modsix,"sine");//modulator oscillator
    const modulatorSeven = createOSC(frequency * modseven,"sine");//modulator oscillator
    

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//main envelope
    
    //LFOS
    const LFOOne = createOSC(lfoone,"sine");//LFO
    const LFOOneDepth = new GainNode(context,{gain : depthone});//depth of the modulator
    const LFOOneGain = new GainNode(context,{gain : 0.5});//gain to multiply the depth, to be controlled by the LFO
    const LFOTwo = createOSC(lfotwo,"sine");//LFO
    const LFOTwoDepth = new GainNode(context,{gain : depthtwo});//depth of the modulator
    const LFOTwoGain = new GainNode(context,{gain : 0.5});//gain to multiply the depth, to be controlled by the LFO
    const LFOThree = createOSC(lfothree,"sine");//LFO
    const LFOThreeDepth = new GainNode(context,{gain : depththree});//depth of the modulator
    const LFOThreeGain = new GainNode(context,{gain : 0.5});//gain to multiply the depth, to be controlled by the LFO
    const LFOFour = createOSC(lfofour,"sine");//LFO
    const LFOFourDepth = new GainNode(context,{gain : depthfour});//depth of the modulator
    const LFOFourGain = new GainNode(context,{gain : 0.5});//gain to multiply the depth, to be controlled by the LFO
    const LFOFive = createOSC(lfofive,"sine");//LFO
    const LFOFiveDepth = new GainNode(context,{gain : depthfive});//depth of the modulator
    const LFOFiveGain = new GainNode(context,{gain : 0.5});//gain to multiply the depth, to be controlled by the LFO
    const LFOSix = createOSC(lfosix,"sine");//LFO
    const LFOSixDepth = new GainNode(context,{gain : depthsix});//depth of the modulator
    const LFOSixGain = new GainNode(context,{gain : 0.5});//gain to multiply the depth, to be controlled by the LFO
    const LFOSeven = createOSC(lfoseven,"sine");//LFO
    const LFOSevenDepth = new GainNode(context,{gain : depthseven});//depth of the modulator
    const LFOSevenGain = new GainNode(context,{gain : 0.5});//gain to multiply the depth, to be controlled by the LFO


    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //modulator --> LFOdepth ---> LFOgain(LFO ---> LFOgain) --> carrier frequency
    modulatorOne.connect(LFOOneDepth);
    LFOOneDepth.connect(LFOOneGain);
    LFOOne.connect(LFOOneGain.gain);
    LFOOneGain.connect(carrier.frequency);

    modulatorTwo.connect(LFOTwoDepth);
    LFOTwoDepth.connect(LFOTwoGain);
    LFOTwo.connect(LFOTwoGain.gain);
    LFOTwoGain.connect(carrier.frequency);

    modulatorThree.connect(LFOThreeDepth);
    LFOThreeDepth.connect(LFOThreeGain);
    LFOThree.connect(LFOThreeGain.gain);
    LFOThreeGain.connect(carrier.frequency);

    modulatorFour.connect(LFOFourDepth);
    LFOFourDepth.connect(LFOFourGain);
    LFOFour.connect(LFOFourGain.gain);
    LFOFourGain.connect(carrier.frequency);

    modulatorFive.connect(LFOFiveDepth);
    LFOFiveDepth.connect(LFOFiveGain);
    LFOFive.connect(LFOFiveGain.gain);
    LFOFiveGain.connect(carrier.frequency);

    modulatorSix.connect(LFOSixDepth);
    LFOSixDepth.connect(LFOSixGain);
    LFOSix.connect(LFOSixGain.gain);
    LFOSixGain.connect(carrier.frequency);

    modulatorSeven.connect(LFOSevenDepth);
    LFOSevenDepth.connect(LFOSevenGain);
    LFOSeven.connect(LFOSevenGain.gain);
    LFOSevenGain.connect(carrier.frequency);

    //carrier --> envelope --> panner --> destination (stereo output)
    carrier.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'seven_fm' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    modulatorOne.start(context.currentTime);
    LFOOne.start(context.currentTime);
    modulatorTwo.start(context.currentTime);
    LFOTwo.start(context.currentTime);
    modulatorThree.start(context.currentTime);
    LFOThree.start(context.currentTime);
    modulatorFour.start(context.currentTime);
    LFOFour.start(context.currentTime);
    modulatorFive.start(context.currentTime);
    LFOFive.start(context.currentTime);
    modulatorSix.start(context.currentTime);
    LFOSix.start(context.currentTime);
    modulatorSeven.start(context.currentTime);
    LFOSeven.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulatorOne.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFOOne.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulatorTwo.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFOTwo.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulatorThree.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFOThree.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulatorFour.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFOFour.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulatorFive.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFOFive.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulatorSix.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFOSix.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulatorSeven.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFOSeven.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    carrier.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            carrier.disconnect();
            modulatorOne.disconnect();
            modulatorTwo.disconnect();
            modulatorThree.disconnect();
            modulatorFour.disconnect();
            modulatorFive.disconnect();
            modulatorSix.disconnect();
            modulatorSeven.disconnect();
            LFOOne.disconnect();
            LFOOneDepth.disconnect();
            LFOOneGain.disconnect();
            LFOTwo.disconnect();
            LFOTwoDepth.disconnect();
            LFOTwoGain.disconnect();
            LFOThree.disconnect();
            LFOThreeDepth.disconnect();
            LFOThreeGain.disconnect();
            LFOFour.disconnect();
            LFOFourDepth.disconnect();
            LFOFourGain.disconnect();
            LFOFive.disconnect();
            LFOFiveDepth.disconnect();
            LFOFiveGain.disconnect();
            LFOSix.disconnect();
            LFOSixDepth.disconnect();
            LFOSixGain.disconnect();
            LFOSeven.disconnect();
            LFOSevenDepth.disconnect();
            LFOSevenGain.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 basic_fm_lfo_gliss
    start: a number greater than 0 representing the initial frequency in hertz
    end: a number greater than 0 representing the final frequency in hertz
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM
    amplitude: a number between 0 and 1 representing the amplitude
    mod: a number greater than 0 representing the frequency of the modulator as a multiple of the carrier
    depth: a number greater or equal to 0 representing the depth of the modulation
    lfo: a number greater than 0 representing the frequency of the LFO in hertz 
    modgliss: a number that defines if the modulator slides along with the carrier, allowed values --> 0 -> fixed, 1 -> sliding
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay
    feedback: a number between 0 and 0.9 to control the delay's feedback
 */
function basicFmLfoGliss(nextEvent,{start = 2000, end = 100, attack = 0, sustain = 8, release = 1, amplitude = 1, mod = 0.125, depth = 1000, lfo = 0.3, modgliss = 1, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(start <= 0){
        throw new Error("'start' value for 'basic_fm_lfo_gliss' MUST be greater than 0");
    }
    if(end <= 0){
        throw new Error("'end' value for 'basic_fm_lfo_gliss' MUST be greater than 0");
    }
    if(attack < 0){
        throw new Error("'attack' value for 'basic_fm_lfo_gliss' MUST be greater or equal to 0");
    }
    if(sustain < 0){
        throw new Error("'sustain' value for 'basic_fm_lfo_gliss' MUST be greater or equal to 0");
    }
    if(release < 0){
        throw new Error("'release' value for 'basic_fm_lfo_gliss' MUST be greater or equal to 0");
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'basic_fm_lfo_gliss' MUST be between 0 and 1");
    }
    if(mod <= 0){
        throw new Error("'mod' value for 'basic_fm_lfo_gliss' MUST be greater than 0");
    }
    if(depth < 0){
        throw new Error("'depth' value for 'basic_fm_lfo_gliss' MUST be greater or equal to 0");
    }
    if(lfo <= 0){
        throw new Error("'lfo' value for 'basic_fm_lfo_gliss' MUST be greater than 0");
    }
    if(modgliss != 0 && modgliss != 1){
        throw new Error("invalid 'modgliss' value for 'basic_fm_lfo_gliss', allowed values --> 0 --> fixed or 1 --> sliding");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'basic_fm_lfo_gliss' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'basic_fm_lfo_gliss' MUST be greater or equal to 0");
    }

    const carrier = createOSC(start,"sine");//carrier oscillator
    const modulator = createOSC(start * mod,"sine");//modulator oscillator
    

    const env = createEnvelope(amplitude,attack,sustain,release,bpm);//main envelope
    const LFO = createOSC(lfo,"sine");//LFO
    const LFOdepth = new GainNode(context,{gain : depth});//depth of the modulator
    const LFOgain = new GainNode(context,{gain : 0.5});//gain to multiply the depth, to be controlled by the LFO

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right

    //modulator --> LFOdepth ---> LFOgain(LFO ---> LFOgain) --> carrier frequency
    modulator.connect(LFOdepth);
    LFOdepth.connect(LFOgain);
    LFO.connect(LFOgain.gain);
    LFOgain.connect(carrier.frequency);

    //carrier --> envelope --> panner --> destination (stereo output)
    carrier.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'basic_fm_lfo_gliss' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    carrier.frequency.cancelScheduledValues(context.currentTime);
    carrier.frequency.setValueAtTime(start,context.currentTime);
    carrier.frequency.linearRampToValueAtTime(end,context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulator.start(context.currentTime);
    if(modgliss){
        modulator.frequency.cancelScheduledValues(context.currentTime);
        modulator.frequency.setValueAtTime(start * mod,context.currentTime);
        modulator.frequency.linearRampToValueAtTime(end * mod,context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    }
    LFO.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulator.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    LFO.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));

    carrier.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            carrier.disconnect();
            modulator.disconnect();
            LFO.disconnect();
            LFOdepth.disconnect();
            LFOgain.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
 fm_in_series
    frequency: a number greater than 0 representing the frequency in hertz. Default: 200.
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 8.
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 8.
    amplitude: a number between 0 and 1 representing the amplitude. Default: 1.
    modone: a number greater than 0 representing the frequency of the first modulator as a multiple of the carrier. Default: 0.0625.
    depthone: a number greater or equal to 0 representing the depth of the modulation of the first modulator. Default: 3000.
    oneattack: a number greater or equal to 0 representing the attack time of the first modulator as a multiple of the BPM. Default: 0.
    onesustain: a number greater or equal to 0 representing the sustain time of the first modulator as a multiple of the BPM. Default: 0.
    onerelease: a number greater or equal to 0 representing the release time of the first modulator as a multiple of the BPM. Default: 16.
    modtwo: a number greater than 0 representing the frequency of the second modulator as a multiple of the first modulator. Default: 3.
    depthtwo: a number greater or equal to 0 representing the depth of the modulation of the second modulator. Default: 1000.
    twoattack: a number greater or equal to 0 representing the attack time of the second modulator as a multiple of the BPM. Default: 12.
    twosustain: a number greater or equal to 0 representing the sustain time of the second modulator as a multiple of the BPM. Default: 0.
    tworelease: a number greater or equal to 0 representing the release time of the second modulator as a multiple of the BPM. Default: 3.
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
    feedback: a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.
 */
function fmInSeries(nextEvent,{frequency = 200, attack = 0, sustain = 8, release = 8, amplitude = 1, modone = 0.0625, depthone = 3000, oneattack = 0, onesustain = 0, onerelease = 16, modtwo = 3, depthtwo = 1000, twoattack = 12, twosustain = 0, tworelease = 3, pan = 0, delaytime = 0, feedback = 0.5},bpm){
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
    const env = createEnvelope(amplitude,attack,sustain,release,bpm);
    const modOneEnv = createEnvelope(depthone,oneattack,onesustain,onerelease,bpm);
    const modTwoEnv = createEnvelope(depthtwo,twoattack,twosustain,tworelease,bpm);

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

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'fm_in_series' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    modulatorOne.start(context.currentTime);
    modulatorTwo.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulatorOne.stop(context.currentTime + pulseToSeconds(oneattack,bpm) + pulseToSeconds(onesustain,bpm) + pulseToSeconds(onerelease,bpm));
    modulatorTwo.stop(context.currentTime + pulseToSeconds(twoattack,bpm) + pulseToSeconds(twosustain,bpm) + pulseToSeconds(tworelease,bpm));

    carrier.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            carrier.disconnect();
            modulatorOne.disconnect();
            modulatorTwo.disconnect();
            modOneEnv.disconnect();
            modTwoEnv.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }

}

/*
 fm_in_parallel
    frequency: a number greater than 0 representing the frequency in hertz. Default: 200.
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 8.
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 8.
    amplitude: a number between 0 and 1 representing the amplitude. Default: 1.
    modone: a number greater than 0 representing the frequency of the first modulator as a multiple of the carrier. Default: 0.0625.
    depthone: a number greater or equal to 0 representing the depth of the modulation of the first modulator. Default: 3000.
    oneattack: a number greater or equal to 0 representing the attack time of the first modulator as a multiple of the BPM. Default: 0.
    onesustain: a number greater or equal to 0 representing the sustain time of the first modulator as a multiple of the BPM. Default: 0.
    onerelease: a number greater or equal to 0 representing the release time of the first modulator as a multiple of the BPM. Default: 16.
    modtwo: a number greater than 0 representing the frequency of the second modulator as a multiple of the first modulator. Default: 3.
    depthtwo: a number greater or equal to 0 representing the depth of the modulation of the second modulator. Default: 1000.
    twoattack: a number greater or equal to 0 representing the attack time of the second modulator as a multiple of the BPM. Default: 12.
    twosustain: a number greater or equal to 0 representing the sustain time of the second modulator as a multiple of the BPM. Default: 0.
    tworelease: a number greater or equal to 0 representing the release time of the second modulator as a multiple of the BPM. Default: 3.
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
    feedback: a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.
 */
function fmInParallel(nextEvent,{frequency = 200, attack = 0, sustain = 8, release = 8, amplitude = 1, modone = 0.0625, depthone = 3000, oneattack = 0, onesustain = 0, onerelease = 16, modtwo = 3, depthtwo = 1000, twoattack = 12, twosustain = 0, tworelease = 3, pan = 0, delaytime = 0, feedback = 0.5},bpm){
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
    const env = createEnvelope(amplitude,attack,sustain,release,bpm);
    const modOneEnv = createEnvelope(depthone,oneattack,onesustain,onerelease,bpm);
    const modTwoEnv = createEnvelope(depthtwo,twoattack,twosustain,tworelease,bpm);

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

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'fm_in_parallel' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    carrier.start(context.currentTime);
    modulatorOne.start(context.currentTime);
    modulatorTwo.start(context.currentTime);

    carrier.stop(context.currentTime + pulseToSeconds(attack,bpm) + pulseToSeconds(sustain,bpm) + pulseToSeconds(release,bpm));
    modulatorOne.stop(context.currentTime + pulseToSeconds(oneattack,bpm) + pulseToSeconds(onesustain,bpm) + pulseToSeconds(onerelease,bpm));
    modulatorTwo.stop(context.currentTime + pulseToSeconds(twoattack,bpm) + pulseToSeconds(twosustain,bpm) + pulseToSeconds(tworelease,bpm));

    carrier.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            carrier.disconnect();
            modulatorOne.disconnect();
            modulatorTwo.disconnect();
            modOneEnv.disconnect();
            modTwoEnv.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }

}

/*
 simple_sequence ---> not really an instrument, but a utility to play a sequence starting on a base frequency and going up or down at a fixed interval
    instrument: a number representing the instrument --> 0 --> simple_wave(sine), 1 --> simple_wave(triangle), 2 --> simple_wave(square), 3 --> simple_wave(sawtooth), 4 --> basic_synth, 5 --> basic_fm. Default: 0.
    amount: amount of notes to be played, must be an integer greater that 0. Default: 4.
    base: a number greater than 0 representing the base frequency in hertz. Default: 100.
    interval: a number greater or equal to 0 representing the interval in hertz. Default: 100.
    direction: a number representig the direction --> 0 --> down, 1 --> up. Default: 1.
    wait: a number greater or equal to 0 representing the wait time between notes as a multiple of the BPM. Default: 1.
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
    amplitude: a number between 0 and 1 representing the amplitude. Default: 1.
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
    feedback: a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

    extra arguments in case of instrument being basic_synth or basic_fm

    basic_synth
    cutoff: a number greater than 0 representing the cutoff frequency for the low pass filter. Default: 20000.
    q: a number between 1 and 25 representing the resonance of the filter. Default: 1.
    contour: a number between 0.1 and 1 representing the time (as multiple of the duration) for the filter to go from full open to the cutoff value. Default: 0.8.

    basic_fm
    mod: a number greater than 0 representing the frequency of the modulator as a multiple of the carrier. Default: 2.
    depth: a number greater or equal to 0 representing the depth of the modulation. Default: 1000.
 */

function simpleSequence(nextEvent, {instrument = 0, amount = 4, base = 100, interval = 100, direction = 1, wait = 1, attack = 0, sustain = 0, release = 1, amplitude = 1, pan = 0, delaytime = 0, feedback = 0.5, cutoff = 20000, q = 1, contour = 0.8, mod = 2, depth = 1000},bpm){
    // initial validations
    if(instrument < 0 || instrument > 5 || instrument - parseInt(instrument) > 0){
        throw new Error("invalid 'instrument' value for 'simple_sequence', allowed values -> 0 (sine), 1 (triangle), 2 (square), 3 (sawtooth), 4 (basic_synth) or 5 (basic_fm)");
    }
    if(amount < 1 || amount - parseInt(amount) > 0){
        throw new Error("'amount' value for 'simple_sequence' MUST be an integer greater or equal to 1");
    }
    if(base <= 0){
        throw new Error("'base' value for 'simple_sequence' MUST be greater than 0");
    }
    if(interval < 0){
        throw new Error("'interval' value for 'simple_sequence' MUST be greater or equal to 0");
    }
    if(direction < 0 || direction > 1 || direction - parseInt(direction) > 0){
        throw new Error("invalid 'direction' value for 'simple_sequence', allowed values -> 0 (down) or 1 (up)");
    }
    if(wait < 0){
        throw new Error("'wait' value for 'simple_sequence' MUST be greater or equal to 0");
    }
    // there's no more validations for this function, because it's just a utility to make sub-sequences, any other error will be thrown by the corresponding "instrument"

    for(let i = 0; i < amount; i++){//sequence
        let frequency = base;//update frequency
        setTimeout(() => {
            //dispatch the corresponding function
            try{
                if(instrument < 4){
                    simpleWave(null,{wave: instrument,frequency,attack,sustain,release,amplitude,pan,delaytime,feedback},bpm);
                }
                if(instrument == 4){
                    basicSynth(null,{wave: instrument,frequency,attack,sustain,release,amplitude,pan,cutoff,q,contour,delaytime,feedback},bpm);
                }
                if(instrument == 5){
                    basicFm(null,{wave: instrument,frequency,attack,sustain,release,mod,depth,amplitude,pan,delaytime,feedback},bpm);
                }
            }catch(error){
                errorLog.classList.add("error");
                let errorSplit = error.toString().split(":");
                let errorMsg = errorSplit[1].trim() + ( errorSplit[2] ? `:${errorSplit[2]}` : "" );
                errorLog.innerText = errorMsg;
            }
        }, i * wait * bpm);//wait...
        base = direction ? base + interval : base - interval;//modify base
    }

     
    if(nextEvent){
        nextFunction(nextEvent);
    }
}

/*
play_sample
    bank: a number greater or equal to 0 representing the sample bank where to look for the sample. Default: 0.
    sample: a number greater or equal to 0 representing the sample in the selected bank. Default: 0.
    rate: a number different from 0 (can be positive or negative) representing the sample's playing speed, where 1 is the normal speed, greater to 1 means faster, and less than 1 means slower, a negative value plays the sample backwards. Default: 1.
    envelope: a number that defines if the sample will be played with an envelope, allowed values --> 0 -> no, 1 -> yes. Default: 0.
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 1.
    amplitude: a number between 0 and 1 representing the amplitude. Default: 0.5.
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
    feedback: a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.
*/
function playSample(nextEvent, {bank = 0, sample = 0, rate = 1, envelope = 0, attack = 0, sustain = 0, release = 1, amplitude = 0.5, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(samples.length == 0){
        throw new Error("there are no samples to play");
    }
    if(bank >= samples.length){
        throw new Error(`the sample bank '${bank}' doesn't exist`);
    }
    if(sample >= samples[bank].length){
        throw new Error(`the sample bank '${bank}' doesn't have a '${sample}' sample`);
    }
    if(rate == 0){
        throw new Error("'rate' value for 'play_sample' cannot be 0, MUST be either greater or lower");
    }
    if(envelope < 0 || envelope > 1 || envelope - parseInt(envelope) > 0){
        throw new Error("invalid 'envelope' value for 'play_sample', allowed values -> 0 (no) or 1 (yes)");
    }
    if(envelope){
        if(attack < 0){
            throw new Error("'attack' value for 'play_sample' MUST be greater or equal to 0");
        }
        if(sustain < 0){
            throw new Error("'sustain' value for 'play_sample' MUST be greater or equal to 0");
        }
        if(release < 0){
            throw new Error("'release' value for 'play_sample' MUST be greater or equal to 0");
        }
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'play_sample' MUST be between 0 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'play_sample' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'play_sample' MUST be greater or equal to 0");
    }

    //buffer source to play the sample
    const source = context.createBufferSource();
    
    //which sample? depending on the rate, we'll use the buffer as it is or we'll reverse it
    if(rate < 0){//if rate is negative, we reverse the buffer to play it backwards
        //we create a temporal buffer to store the reversed data
        let reversedBuffer = context.createBuffer(
            samples[bank][sample].numberOfChannels,
            samples[bank][sample].length,
            samples[bank][sample].sampleRate
        );

        // then we reverse the data
        for (let channel = 0; channel < samples[bank][sample].numberOfChannels; channel++) {
            const channelData = samples[bank][sample].getChannelData(channel);
            const reversedData = reversedBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                reversedData[i] = channelData[channelData.length - 1 - i];
            }
        }

        source.buffer = reversedBuffer; //we select the reversed buffer
        rate*=-1; //we turn the rate to positive to be able to define the playing speed and move on
    }else{
        //otherwise we use it as it is
        source.buffer = samples[bank][sample];
    }

    source.playbackRate.value = rate; //playing speed of the sample
    

    let env = null;

    if(envelope){
        env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope
    }else{
        env = new GainNode(context, { gain : amplitude });
    }

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right


    //oscillator --> envelope --> panner --> destination (stereo output)
    source.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'play_sample' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    source.start(context.currentTime);
    source.stop(context.currentTime + source.buffer.duration / rate); //self explanatory
    
    source.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            source.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}
/*
loop_sample
    bank: a number greater or equal to 0 representing the sample bank where to look for the sample. Default: 0.
    sample: a number greater or equal to 0 representing the sample in the selected bank. Default: 0.
    rate: a number different from 0 (can be positive or negative) representing the sample's playing speed, where 1 is the normal speed, greater to 1 means faster, and less than 1 means slower, a negative value plays the sample backwards. Default: 1.
    duration: a number greater than 0 representing the amount of time as a multiple of the BPM that the sample will be playing in a loop. Default: 4.
    envelope: a number that defines if the sample will be played with an envelope, allowed values --> 0 -> no, 1 -> yes. Default: 0.
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 3.
    amplitude: a number between 0 and 1 representing the amplitude. Default: 0.5.
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
    feedback: a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.
*/
function loopSample(nextEvent, {bank = 0, sample = 0, rate = 1, duration = 4, envelope = 0, attack = 0, sustain = 0, release = 3, amplitude = 0.5, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(samples.length == 0){
        throw new Error("there are no samples to play");
    }
    if(bank >= samples.length){
        throw new Error(`the sample bank '${bank}' doesn't exist`);
    }
    if(sample >= samples[bank].length){
        throw new Error(`the sample bank '${bank}' doesn't have a '${sample}' sample`);
    }
    if(rate == 0){
        throw new Error("'rate' value for 'loop_sample' cannot be 0, MUST be either greater or lower");
    }
    if(duration <= 0){
        throw new Error("'duration' value for 'loop_sample' MUST be greater than 0");
    }
    if(envelope < 0 || envelope > 1 || envelope - parseInt(envelope) > 0){
        throw new Error("invalid 'envelope' value for 'loop_sample', allowed values -> 0 (no) or 1 (yes)");
    }
    if(envelope){
        if(attack < 0){
            throw new Error("'attack' value for 'loop_sample' MUST be greater or equal to 0");
        }
        if(sustain < 0){
            throw new Error("'sustain' value for 'loop_sample' MUST be greater or equal to 0");
        }
        if(release < 0){
            throw new Error("'release' value for 'loop_sample' MUST be greater or equal to 0");
        }
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'loop_sample' MUST be between 0 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'loop_sample' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'loop_sample' MUST be greater or equal to 0");
    }

    //buffer source to play the sample
    const source = context.createBufferSource();
    
    //which sample? depending on the rate, we'll use the buffer as it is or we'll reverse it
    if(rate < 0){//if rate is negative, we reverse the buffer to play it backwards
        //we create a temporal buffer to store the reversed data
        let reversedBuffer = context.createBuffer(
            samples[bank][sample].numberOfChannels,
            samples[bank][sample].length,
            samples[bank][sample].sampleRate
        );

        // then we reverse the data
        for (let channel = 0; channel < samples[bank][sample].numberOfChannels; channel++) {
            const channelData = samples[bank][sample].getChannelData(channel);
            const reversedData = reversedBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                reversedData[i] = channelData[channelData.length - 1 - i];
            }
        }

        source.buffer = reversedBuffer; //we select the reversed buffer
        rate*=-1; //we turn the rate to positive to be able to define the playing speed and move on
    }else{
        //otherwise we use it as it is
        source.buffer = samples[bank][sample];
    }

    source.playbackRate.value = rate; //playing speed of the sample
    source.loop = true;//loopity loop
    

    let env = null;

    if(envelope){
        env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope
    }else{
        env = new GainNode(context, { gain : amplitude });
    }

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right


    //oscillator --> envelope --> panner --> destination (stereo output)
    source.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'loop_sample' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    source.start(context.currentTime);
    source.stop(context.currentTime + pulseToSeconds(duration,bpm)); //self explanatory
    
    source.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            source.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}
/*
loop_sample_lfo
    bank: a number greater or equal to 0 representing the sample bank where to look for the sample. Default: 0.
    sample: a number greater or equal to 0 representing the sample in the selected bank. Default: 0.
    reverse: a number that defines if the sample will be played normal or backwards, allowed values --> 0 -> no, 1 -> yes. Default: 0.
    bottom: a number greater than 0 representing the bottom playing rate (1 is the normal speed, greater to 1 means faster, and less than 1 means slower). Default: 0.2.
    top: a number greater than 'bottom' representing the top playing rate (1 is the normal speed, greater to 1 means faster, and less than 1 means slower). Default: 1.4.
    lfo: a number greater than 0 representing the frequency of the LFO in hertz. Default: 0.2. 
    duration: a number greater than 0 representing the amount of time as a multiple of the BPM that the sample will be playing in a loop. Default: 4.
    envelope: a number that defines if the sample will be played with an envelope, allowed values --> 0 -> no, 1 -> yes. Default: 0.
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 3.
    amplitude: a number between 0 and 1 representing the amplitude. Default: 0.5.
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
    feedback: a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.
*/
function loopSampleLfo(nextEvent, {bank = 0, sample = 0, reverse = 0, top = 1.4, bottom = 0.2, lfo = 0.2, duration = 4, envelope = 0, attack = 0, sustain = 0, release = 3, amplitude = 0.5, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(samples.length == 0){
        throw new Error("there are no samples to play");
    }
    if(bank >= samples.length){
        throw new Error(`the sample bank '${bank}' doesn't exist`);
    }
    if(sample >= samples[bank].length){
        throw new Error(`the sample bank '${bank}' doesn't have a '${sample}' sample`);
    }
    if(reverse < 0 || reverse > 1 || reverse - parseInt(reverse) > 0){
        throw new Error("invalid 'reverse' value for 'loop_sample_lfo', allowed values -> 0 (no) or 1 (yes)");
    }
    if(bottom <= 0){
        throw new Error("'bottom' value for 'loop_sample_lfo' MUST be greater than 0");
    }
    if(top <= bottom){
        throw new Error("'top' value for 'loop_sample_lfo' MUST be greater than 'bottom'");
    }
    if(lfo <= 0){
        throw new Error("'lfo' value for 'loop_sample_lfo' MUST be greater than 0");
    }
    if(duration <= 0){
        throw new Error("'duration' value for 'loop_sample_lfo' MUST be greater than 0");
    }
    if(envelope < 0 || envelope > 1 || envelope - parseInt(envelope) > 0){
        throw new Error("invalid 'envelope' value for 'loop_sample_lfo', allowed values -> 0 (no) or 1 (yes)");
    }
    if(envelope){
        if(attack < 0){
            throw new Error("'attack' value for 'loop_sample_lfo' MUST be greater or equal to 0");
        }
        if(sustain < 0){
            throw new Error("'sustain' value for 'loop_sample_lfo' MUST be greater or equal to 0");
        }
        if(release < 0){
            throw new Error("'release' value for 'loop_sample_lfo' MUST be greater or equal to 0");
        }
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'loop_sample_lfo' MUST be between 0 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'loop_sample_lfo' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'loop_sample_lfo' MUST be greater or equal to 0");
    }

    //buffer source to play the sample
    const source = context.createBufferSource();
    
    //which sample? depending on the 'reverse' value, we'll use the buffer as it is or we'll reverse it
    if(reverse){
        //we create a temporal buffer to store the reversed data
        let reversedBuffer = context.createBuffer(
            samples[bank][sample].numberOfChannels,
            samples[bank][sample].length,
            samples[bank][sample].sampleRate
        );
        // then we reverse the data
        for (let channel = 0; channel < samples[bank][sample].numberOfChannels; channel++) {
            const channelData = samples[bank][sample].getChannelData(channel);
            const reversedData = reversedBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                reversedData[i] = channelData[channelData.length - 1 - i];
            }
        }
        source.buffer = reversedBuffer; //we select the reversed buffer
    }else{
        //otherwise we use it as it is
        source.buffer = samples[bank][sample];
    }

    source.loop = true;//loopity loop

    //LFO stuff
    const rangeLFO = (top - bottom) / 2;
    const rate = bottom + rangeLFO; 
    source.playbackRate.value = rate;//initial rate

    const LFO = createOSC(lfo,"sine");//LFO
    const LFOdepth = new GainNode(context,{gain :  rangeLFO});//depth of the modulator

    //LFO --> LFOdepth ---> playback rate
    LFO.connect(LFOdepth).connect(source.playbackRate);
    

    let env = null;

    if(envelope){
        env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope
    }else{
        env = new GainNode(context, { gain : amplitude });
    }

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right


    //oscillator --> envelope --> panner --> destination (stereo output)
    source.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'loop_sample_lfo' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    source.start(context.currentTime);
    source.stop(context.currentTime + pulseToSeconds(duration,bpm)); //self explanatory

    LFO.start(context.currentTime);
    LFO.stop(context.currentTime + pulseToSeconds(duration,bpm));
    
    source.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            source.disconnect();
            LFO.disconnect();
            LFOdepth.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}
/*
slide_sample
    bank: a number greater or equal to 0 representing the sample bank where to look for the sample. Default: 2.
    sample: a number greater or equal to 0 representing the sample in the selected bank. Default: 6.
    startrate: a number greater than 0 representing the playing rate at the start of the slide (1 is the normal speed, greater to 1 means faster, and less than 1 means slower). Default: 1.
    endrate: a number greater than 0 representing the playing rate at the end of the slide (1 is the normal speed, greater to 1 means faster, and less than 1 means slower). Default: 0.1.
    slidetime: a number greater than 0 representing the amount of time as a multiple of the BPM that will take the sample to go from the 'startrate' to the 'endrate', if there is not enough sample to do the slide, the sample will stop playing once it reaches its end, otherwise it will continue playing at the 'endrate' for the remaining duration of the sample. Default: 4.
    reverse: a number that defines if the sample will be played normal or backwards, allowed values --> 0 -> no, 1 -> yes. Default: 0.
    envelope: a number that defines if the sample will be played with an envelope, allowed values --> 0 -> no, 1 -> yes. Default: 0.
    attack: a number greater or equal to 0 representing the attack time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
    sustain: a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
    release: a number greater or equal to 0 representing the release time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 1.
    amplitude: a number between 0 and 1 representing the amplitude. Default: 0.5.
    pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
    delaytime: a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
    feedback: a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.
*/
function slideSample(nextEvent, {bank = 2, sample = 6, startrate = 1, endrate = 0.1, slidetime = 4, reverse = 0, envelope = 0, attack = 0, sustain = 0, release = 1, amplitude = 0.5, pan = 0, delaytime = 0, feedback = 0.5},bpm){
    // initial validations
    if(samples.length == 0){
        throw new Error("there are no samples to play");
    }
    if(bank >= samples.length){
        throw new Error(`the sample bank '${bank}' doesn't exist`);
    }
    if(sample >= samples[bank].length){
        throw new Error(`the sample bank '${bank}' doesn't have a '${sample}' sample`);
    }
    if(startrate <= 0){
        throw new Error("'startrate' value for 'slide_sample' MUST be greater than 0");
    }
    if(endrate <= 0){
        throw new Error("'endrate' value for 'slide_sample' MUST be greater than 0");
    }
    if(slidetime <= 0){
        throw new Error("'slidetime' value for 'slide_sample' MUST be greater than 0");
    }
    if(reverse < 0 || reverse > 1 || reverse - parseInt(reverse) > 0){
        throw new Error("invalid 'reverse' value for 'slide_sample', allowed values -> 0 (no) or 1 (yes)");
    }
    if(envelope < 0 || envelope > 1 || envelope - parseInt(envelope) > 0){
        throw new Error("invalid 'envelope' value for 'slide_sample', allowed values -> 0 (no) or 1 (yes)");
    }
    if(envelope){
        if(attack < 0){
            throw new Error("'attack' value for 'slide_sample' MUST be greater or equal to 0");
        }
        if(sustain < 0){
            throw new Error("'sustain' value for 'slide_sample' MUST be greater or equal to 0");
        }
        if(release < 0){
            throw new Error("'release' value for 'slide_sample' MUST be greater or equal to 0");
        }
    }
    if(amplitude < 0 || amplitude > 1){
        throw new Error("'amplitude' value for 'slide_sample' MUST be between 0 and 1");
    }
    if(pan < -1 || pan > 1){
        throw new Error("'pan' value for 'slide_sample' MUST be between -1 and 1");
    }
    if(delaytime < 0){
        throw new Error("'delaytime' value for 'slide_sample' MUST be greater or equal to 0");
    }

    //buffer source to play the sample
    const source = context.createBufferSource();
    
    //which sample? depending on the 'reverse' value, we'll use the buffer as it is or we'll reverse it
    if(reverse){
        //we create a temporal buffer to store the reversed data
        let reversedBuffer = context.createBuffer(
            samples[bank][sample].numberOfChannels,
            samples[bank][sample].length,
            samples[bank][sample].sampleRate
        );
        // then we reverse the data
        for (let channel = 0; channel < samples[bank][sample].numberOfChannels; channel++) {
            const channelData = samples[bank][sample].getChannelData(channel);
            const reversedData = reversedBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                reversedData[i] = channelData[channelData.length - 1 - i];
            }
        }
        source.buffer = reversedBuffer; //we select the reversed buffer
    }else{
        //otherwise we use it as it is
        source.buffer = samples[bank][sample];
    }

    
    let env = null;

    if(envelope){
        env = createEnvelope(amplitude,attack,sustain,release,bpm);//envelope
    }else{
        env = new GainNode(context, { gain : amplitude });
    }

    const panner = setPan(pan);//panner
    const splitter = context.createChannelSplitter(2);//this will split the signal in two channels
    panner.connect(splitter);//then we connect the panner to the splitter
    //the split signal goes into the analyzers
    splitter.connect(analyserLeft,0);//left
    splitter.connect(analyserRight,1);//right


    //oscillator --> envelope --> panner --> destination (stereo output)
    source.connect(env).connect(panner).connect(context.destination);

    let delay = null;
    let feedBack = null;
    if(delaytime){//if delaytime is greater than 0
        if(feedback < 0 || feedback > 0.9){//we validate the feedback
            throw new Error("'feedback' value for 'slide_sample' MUST be between 0 and 0.9");
        }
        delay = new DelayNode(context, { maxDelayTime : pulseToSeconds(delaytime,bpm) });//delay node
        delay.delayTime.value = pulseToSeconds(delaytime,bpm);//we assign the value
        feedBack = new GainNode(context, { gain : amplitude * feedback });//and create a gain node for the effect

        //then we create the feedback loop
        env.connect(delay).connect(feedBack).connect(delay);

        //and connect the delay to the destination (stereo output)
        feedBack.connect(panner).connect(context.destination);
    }

    /*
    now we are going straight into the tricky part, we are going to calculate the resulting duration after the ramp (the one we are about to make), so if the time needed to make the ramp is longer (or equal) than the sample's original duration, we'll stop it once the ramp finishes, otherwise we'll let the sample play at the 'endrate' until it ends
    */

    //first we convert the slidetime to seconds
    slidetime = pulseToSeconds(slidetime,bpm);
    //time needed to make the ramp, this represents how much time (duration of the sample) in a perfect situation we need to make the ramp
    let timeNeeded = slidetime * (startrate + endrate) / 2;

    let duration = 0; //here we'll store the resulting duration

    if(source.buffer.duration <= timeNeeded){
        /*
        ok, Xenakis I'm summoning you!!!!
        if the duration of the sample is less or equal than the time needed, it means that we run out of sample to complete the ramp
        so... we are trying to find the exact point when we run out of "original duration", that will be our resulting duration:

        if we want to know how much of the sample we've consumed at a given time (t)

        startrate * t + ((endrate - startrate) / (2 * slidetime)) * t^2

        so, if we subtract from the above the original duration and the result is 0, we ran out of sample...,then we end up with something like the quadratic equation: a * t^2 + b * t + c = 0


        ((endrate - startrate) / (2 * slidetime)) * t^2 + startrate * t - duration = 0

        we'll solve it with the quadratic formula, taking the positive root, in this case we are talking about duration and it can't be negative
        (-b + Math.sqrt(b*b - 4*a*c)) / (2*a)
        */

        let a = (endrate - startrate) / (2 * slidetime);
        let b = startrate;
        let c = -source.buffer.duration; //we are subtracting this...

        duration = (-b + Math.sqrt(b*b - 4*a*c)) / (2*a);
    }else{
        //well, here we just add the slidetime and the time we need to consume the rest of the sample at the new rate, that's it!!!
        duration = slidetime + (source.buffer.duration - timeNeeded) / endrate;
    }

    source.playbackRate.setValueAtTime(startrate,context.currentTime);
    source.playbackRate.linearRampToValueAtTime(endrate,context.currentTime + slidetime);

    source.start(context.currentTime);
    source.stop(context.currentTime + duration);
    
    source.addEventListener("ended", () => {//cleanup after playing
        setTimeout(() => {
            source.disconnect();
            env.disconnect();
            panner.disconnect();

            if(delay){
                delay.disconnect();
                feedBack.disconnect();
            }
        }, pulseToSeconds(delaytime,bpm) * 1000 * 10);//give the delay (in case it exists) room to breath before dying
    });

    if(nextEvent){
        nextFunction(nextEvent);
    }
}

functions = {
    sillyTestSynth,
    simpleWave,
    simpleWaveGliss,
    simpleWaveRing,
    simpleWaveLfo,
    simpleWaveLfoRing,
    whiteNoise,
    tunedNoise,
    basicSynth,
    bassLine,
    basicFm,
    basicFmEnv,
    basicFmLfo,
    sevenFm,
    basicFmLfoGliss,
    fmInSeries,
    fmInParallel,
    simpleSequence,
    playSample,
    loopSample,
    loopSampleLfo,
    slideSample
};//we add all the functions to the global register