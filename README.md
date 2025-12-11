As with any other sound producing software, remember to **be careful with your ears**.

You can find an online working version of *éliane* [here](https://jgms.github.io/eliane/). But the real fun starts once you download it and start making your own sounds. For the time being, *éliane* is not available for mobile devices.

If you want to see some code examples you can go [here](https://github.com/jgms/construye-un-castillo), and if you just want to listen to said examples, you can go [here](https://soundcloud.com/construye-un-castillo).

## what

*éliane* is an environment for programming electronic music, whose main concern is to **separate the sound design from the sequencing**, allowing the creation of, for a lack of a better name, "scripted scores". At its very core it's just a **code based function sequencer** I developed with the aim of making my workflow a little more playful and inspiring.

The instruments/functions included so far are just examples and they are based on my [own practice](https://soundcloud.com/maravillosa-realidad), but you can create your own functions (it is the very point of *éliane*) and add them to (or completely replace) the original ones, in fact, you can extract the interpreter/sequencer and sequence whatever function(s) you want, not necessarily sound producing functions.

*éliane* is named after the great French composer [Éliane Radigue](https://en.wikipedia.org/wiki/%C3%89liane_Radigue).

## why

After so many years of making music using [Pure Data](https://puredata.info/), which I still consider the greatest sound design tool there is, my patches were becoming messier and messier everytime I needed to make (sometimes not so) complex arrangements, I needed something with the simplicity yet the power of the syntax of, say, [Sonic Pi](https://sonic-pi.net/), which heavily influenced *éliane*'s syntax. I just wanted to **separate the sound design from the sequencing**, but in a way that they were easy to integrate.

After exploring a little (tons to learn still, though) the Web Audio API, and seeing that I could implement all (at least at first glance) my usual sound design techniques, I said: why not leave the sound design entirely in the hands of JavaScript and build a simple language on top of it to sequence everything? so, here we are.

**Late 2024 update:** the "at least at first glance" from the paragraph above turned out for the worst as I delved deeper into the Web Audio API, I started developing really simple things that for some reasons behave differently on different browsers, some stuff even not working at all, at first I thought that I was doing something in the wrong way, but they were really **very simple things**, so after a lot of research and tests, I found out that it was a thing related to browser performance (in the case of sound synthesis issues) and the resources consumed by the sequencer (in the case of timing issues, this being **completely my fault**). I must confess I lost the drive, and after thinking about possible solutions (I even thought about using [SuperCollider](https://supercollider.github.io/) as the sound engine, an idea that still rings in my ears from time to time), and some real life stuff getting in the way, I kind of abandoned the project.

**Summer 2025 update:** after receiving a lot of requests for code examples, I began writing silly scripts using the example instruments and suddendly, I was hooked, I was writing music in *éliane* all the time and using its limitations as creative opportunities, so I decided to make said scripts [available for anyone](https://github.com/jgms/construye-un-castillo) that wishes to start experimenting with *éliane*, and added two of the most requested features: sampling and random numbers. 

Although I made *éliane* to address **my very own creative needs**, I decided to make it available online and open source the code in order to use it to teach the basics of programming to my youngest students, and in case it can be of use to anyone. So feel free to download and modify/expand/make it your own. If you find any error (you know how this goes), feel free to get in touch at *joaquinmendozasebastian (at) gmail.com*. 

## the syntax

*éliane*'s syntax is as simple as it gets, it only has **variables**, **function calls** and 5 keywords: **pulse**, **wait**, **repeat**, **if** and **else**. As I said above, it is heavily inspired by [Sonic Pi](https://sonic-pi.net/)'s, but simpler. There are a several things missing: complex/compound conditions/operations and my very much beloved ternary orperator, but I plan to implement them in the not so distant future. I'd also love to add syntax highlighting at some point.

Before we continue, it's important to clarify what *éliane* is not: it **is not a fully fledged programming language** (I don't really know if that's even within my reach), it is just a way to sequence the calling of functions, changing their parameters and declaring global variables along the way, using a very simple syntax. With that out of the way, let's us explain *éliane*'s features one by one.

### variables

Declaring variables is very easy, all you need is a name, all lowercase with no special characters, an equal sign, and a value, which can only be a number, a boolean, an array, a reference to another variable, or an operation (arithmetic/comparison) that yields a number/boolean. Every variable declaration/assignment must end with a semicolon. Arrays can only contain numbers.

Examples:

```
# this is a comment
myvariable = -23.8;
othervariable = myvariable; # whatever
yetanother = true;
andanother = [1,23,-2,0.023,-0.16]; # just to remind you that arrays can only contain numbers
thelastone = myvariable + andanother[2];
```

Something important is that for the time being, it's impossible to make an array reference as the index of other array: one[other[3]], yes, what a drag.

### function calls

Functions are the actual intruments, they all come with default parameters so calling them is as easy as writing its name and end the line with a semicolon, all functions use underscores to separate words:

```
basic_synth;
```

Parameters go after the function name, they all end with a colon before the value, and they are separated with commas:

```
basic_synth frequency: 150;
note = 300;
basic_synth frequency: note, pan: -1;
note = note * 1.5;
basic_synth frequency: note, pan: 1;
```

It's important to notice that the colon is part of the parameter name, as in "frequency:", if it is written "frequency :" it will throw an error.

### random numbers

There's a special variable available called **random**, you can use it as any other variable, but it's meant to be used with a special function called **a_z_rotate**, named after the wonderful sound explorer (and friend) Uge Ortiz AKA [AZ-Rotator](http://www.az-rotator.com/).

This is how it works:

```
# the default value of 'random' is 0 (zero)
random = 200; # you can use it as any other variable
basic_synth frequency: random;

# but it's meant to be used this way
a_z_rotate min: 200, max: 300, integer: 0; # this will assing a random float number between 200 and 300 (inclusive) to the variable 'random'
basic_synth frequency: random;
a_z_rotate min: 200, max: 300; # everytime you use it, the next time you use 'random' it will have a different value
# in the case above, 'random' will be an integer, the 'integer' parameter is 1 (yes) by default, if you want a float, just pass it a 0 (no)
basic_synth frequency: random;
```

### pulse

The **pulse** keyword defines the BPM (beats per minute) of the sequence, the default value is 60.

```
pulse 145;
```

### wait

The **wait** keyword defines the time the sequence have to wait before dispatching the next function, its values are always computed as multiples of the BPM, for example: 1 -> quarter notes, 0.5 -> 8th notes, 0.25 -> 16th notes and so on and so forth.

```
basic_synth frequency: 200;
wait 1;
basic_synth frequency: 300;
wait 0.5;
basic_synth frequency: 400;
wait 0.25;
basic_synth frequency: 500;
```

### repeat

The **repeat** keyword, as its name suggest, defines a block to be repeated, it takes a number as argument.

```
note = 200;
time = 1;

repeat 3{
    basic_synth frequency: note;
    wait time;
    note = note + 100;
    time = time / 2;
}

basic_synth frequency: 500;

# here's a little example using random values

waits = [0.5,1,0.25];

a_z_rotate min: 2, max: 8; # a value for 'random' in order to define the number of repeats

repeat random{
   a_z_rotate min: 500, max: 1000, integer: 0; # a value for 'random' in order to define the frequency
   simple_wave frequency: random;
   a_z_rotate min: 0, max: 2; # a value for 'random' in order to define the index to read from the 'wait' array declared above
   time = waits[random]; # to define the time to wait before the next note
   wait time;
}
```

### if/else

The **if** and **else** keywords work as they do in your favorite programming language, the only difference is that they only support simple conditions, for example: *a != b*, *a > b*; will work, but: *a != b && a + c > b*; won't. I know, I know.

```
something = false;

if something{
    basic_synth frequency: 500;
}

a = 5;
b = 10;

if a > b{
    basic_synth frequency: 600;
}else{
    basic_synth frequency: 300;
}
```

Needless to say, there can't be an **else** without an **if**.

## the included functions

Functions in *éliane* are designed to take only numbers as arguments, that makes very easy expanding its options, because all the "heavy programming" will rest on JavaScript's shoulders, inside the functions we can make whatever we want of those numbers, we can fill an array with samples and use a number as the index to determine which one to play, we can use a number to define its speed, etc. etc. The possibilities are almost endless, as I said above, sound design is separate from sequencing.

Let's go one by one, as you will see, I'll only tell you about its parameters, feel free to play and experiment with them to see what they are about, anyway, they are only examples.

### silly_test_synth

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### simple_wave

Parameters:

- **wave:** a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth. Default: 0.
- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0. 
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### simple_wave_gliss

Parameters:

- **wave:** a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth. Default: 0.
- **start:** a number greater than 0 representing the initial frequency in hertz. Default: 800.
- **end:** a number greater than 0 representing the final frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0. 
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 4.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### simple_wave_ring

Parameters:

- **wave:** a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth. Default: 0.
- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 500.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0. 
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 8.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **modfreq:** a number greater than 0 representing the frequency of the modulator in hertz. Default: 150.
- **modwave:** a number representing the waveform of the modulator --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth. Default: 2.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### simple_wave_lfo

Parameters:

- **wave:** a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth. Default: 0.
- **bottom:** a number greater than 0 representing the bottom frequency in hertz. Default: 400.
- **top:** a number greater than 'bottom' representing the top frequency in hertz. Default: 600.
- **lfo:** a number greater than 0 representing the frequency of the LFO in hertz. Default: 10.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0. 
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 8.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### simple_wave_lfo_ring

Parameters:

- **wave:** a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth. Default: 0.
- **bottom:** a number greater than 0 representing the bottom frequency in hertz. Default: 400.
- **top:** a number greater than 'bottom' representing the top frequency in hertz. Default: 600.
- **lfo:** a number greater than 0 representing the frequency of the LFO in hertz. Default: 10.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0. 
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 8.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **modfreq:** a number greater than 0 representing the frequency of the modulator in hertz. Default: 500.
- **modwave:** a number representing the waveform of the modulator --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### white_noise

Parameters:

- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### tuned_noise

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 2 representing the amplitude. Default: 2.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### basic_synth

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **detune:** a number representing the amount (in hertz) of detuning of the second oscillator. Default: 1.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **cutoff:** a number greater than 0 representing the cutoff frequency for the low pass filter. Default: 20000.
- **q:** a number between 1 and 25 representing the resonance of the filter. Default: 1.
- **contour:** a number between 0.1 and 1 representing the time (as multiple of the duration) for the filter to go from full open to the cutoff value. Default: 0.8.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### bass_line

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **cutoff:** a number greater than 0 representing the cutoff frequency for the low pass filter. Default: 10000.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### basic_fm

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **mod:** a number greater than 0 representing the frequency of the modulator as a multiple of the carrier. Default: 2.
- **depth:** a number greater or equal to 0 representing the depth of the modulation. Default: 1000.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### basic_fm_env

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **mod:** a number greater than 0 representing the frequency of the modulator as a multiple of the carrier. Default: 2.
- **depth:** a number greater or equal to 0 representing the depth of the modulation. Default: 1000.
- **modattack:** a number greater or equal to 0 representing the attack time of the modulator as a multiple of the BPM. Default: 0.
- **modsustain:** a number greater or equal to 0 representing the sustain time of the modulator as a multiple of the BPM. Default: 0.
- **modrelease:** a number greater or equal to 0 representing the release time of the modulator as a multiple of the BPM. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### basic_fm_lfo

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 400.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 8.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **mod:** a number greater than 0 representing the frequency of the modulator as a multiple of the carrier. Default: 0.25.
- **depth:** a number greater or equal to 0 representing the depth of the modulation. Default: 1000.
- **lfo:** a number greater than 0 representing the frequency of the LFO in hertz. Default: 0.5. 
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### basic_fm_lfo_gliss

Parameters:

- **start:** a number greater than 0 representing the initial frequency in hertz. Default: 2000.
- **end:** a number greater than 0 representing the final frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 8.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **mod:** a number greater than 0 representing the frequency of the modulator as a multiple of the carrier. Default: 0.125.
- **depth:** a number greater or equal to 0 representing the depth of the modulation. Default: 1000.
- **lfo:** a number greater than 0 representing the frequency of the LFO in hertz. Default: 0.3. 
- **modgliss:** a number that defines if the modulator slides along with the carrier, allowed values --> 0 -> fixed, 1 -> sliding. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### fm_in_series

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 200.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 8.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 8.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **modone:** a number greater than 0 representing the frequency of the first modulator as a multiple of the carrier. Default: 0.0625.
- **depthone:** a number greater or equal to 0 representing the depth of the modulation of the first modulator. Default: 3000.
- **oneattack:** a number greater or equal to 0 representing the attack time of the first modulator as a multiple of the BPM. Default: 0.
- **onesustain:** a number greater or equal to 0 representing the sustain time of the first modulator as a multiple of the BPM. Default: 0.
- **onerelease:** a number greater or equal to 0 representing the release time of the first modulator as a multiple of the BPM. Default: 16.
- **modtwo:** a number greater than 0 representing the frequency of the second modulator as a multiple of the first modulator. Default: 3.
- **depthtwo:** a number greater or equal to 0 representing the depth of the modulation of the second modulator. Default: 1000.
- **twoattack:** a number greater or equal to 0 representing the attack time of the second modulator as a multiple of the BPM. Default: 12.
- **twosustain:** a number greater or equal to 0 representing the sustain time of the second modulator as a multiple of the BPM. Default: 0.
- **tworelease:** a number greater or equal to 0 representing the release time of the second modulator as a multiple of the BPM. Default: 3.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### fm_in_parallel

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 200.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 8.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 8.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **modone:** a number greater than 0 representing the frequency of the first modulator as a multiple of the carrier. Default: 0.0625.
- **depthone:** a number greater or equal to 0 representing the depth of the modulation of the first modulator. Default: 3000.
- **oneattack:** a number greater or equal to 0 representing the attack time of the first modulator as a multiple of the BPM. Default: 0.
- **onesustain:** a number greater or equal to 0 representing the sustain time of the first modulator as a multiple of the BPM. Default: 0.
- **onerelease:** a number greater or equal to 0 representing the release time of the first modulator as a multiple of the BPM. Default: 16.
- **modtwo:** a number greater than 0 representing the frequency of the second modulator as a multiple of the first modulator. Default: 3.
- **depthtwo:** a number greater or equal to 0 representing the depth of the modulation of the second modulator. Default: 1000.
- **twoattack:** a number greater or equal to 0 representing the attack time of the second modulator as a multiple of the BPM. Default: 12.
- **twosustain:** a number greater or equal to 0 representing the sustain time of the second modulator as a multiple of the BPM. Default: 0.
- **tworelease:** a number greater or equal to 0 representing the release time of the second modulator as a multiple of the BPM. Default: 3.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### play_sample

Parameters:

- **bank:** a number greater or equal to 0 representing the sample bank where to look for the sample. Default: 0.
- **sample:** a number greater or equal to 0 representing the sample in the selected bank. Default: 0.
- **rate:** a number different from 0 (can be positive or negative) representing the sample's playing speed, where 1 is the normal speed, greater to 1 means faster, and less than 1 means slower, a negative value plays the sample backwards. Default: 1.
- **envelope:** a number that defines if the sample will be played with an envelope, allowed values --> 0 -> no, 1 -> yes. Default: 0.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 0.5.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### loop_sample

Parameters:

- **bank:** a number greater or equal to 0 representing the sample bank where to look for the sample. Default: 0.
- **sample:** a number greater or equal to 0 representing the sample in the selected bank. Default: 0.
- **rate:** a number different from 0 (can be positive or negative) representing the sample's playing speed, where 1 is the normal speed, greater to 1 means faster, and less than 1 means slower, a negative value plays the sample backwards. Default: 1.
- **duration:** a number greater than 0 representing the amount of time as a multiple of the BPM that the sample will be playing in a loop. Default: 4.
- **envelope:** a number that defines if the sample will be played with an envelope, allowed values --> 0 -> no, 1 -> yes. Default: 0.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 3.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 0.5.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### loop_sample_lfo

The same as **loop_sample** but the rate is controlled by an LFO.

Parameters:

- **bank:** a number greater or equal to 0 representing the sample bank where to look for the sample. Default: 0.
- **sample:** a number greater or equal to 0 representing the sample in the selected bank. Default: 0.
- **reverse:** a number that defines if the sample will be played normal or backwards, allowed values --> 0 -> no, 1 -> yes. Default: 0.
- **bottom:** a number greater than 0 representing the bottom playing rate (1 is the normal speed, greater to 1 means faster, and less than 1 means slower). Default: 0.2.
- **top:** a number greater than 'bottom' representing the top playing rate (1 is the normal speed, greater to 1 means faster, and less than 1 means slower). Default: 1.4.
- **lfo:** a number greater than 0 representing the frequency of the LFO in hertz. Default: 0.2. 
- **duration:** a number greater than 0 representing the amount of time as a multiple of the BPM that the sample will be playing in a loop. Default: 4.
- **envelope:** a number that defines if the sample will be played with an envelope, allowed values --> 0 -> no, 1 -> yes. Default: 0.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 3.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 0.5.
pan: a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### slide_sample

This one plays a sample (forwards or backwards) making a slide from one playing rate to another in the specified time. It works better with long samples.

Parameters:

- **bank:** a number greater or equal to 0 representing the sample bank where to look for the sample. Default: 2.
- **sample:** a number greater or equal to 0 representing the sample in the selected bank. Default: 6.
- **startrate:** a number greater than 0 representing the playing rate at the start of the slide (1 is the normal speed, greater to 1 means faster, and less than 1 means slower). Default: 1.
- **endrate:** a number greater than 0 representing the playing rate at the end of the slide (1 is the normal speed, greater to 1 means faster, and less than 1 means slower). Default: 0.1.
- **slidetime:** a number greater than 0 representing the amount of time as a multiple of the BPM that will take the sample to go from the 'startrate' to the 'endrate', if there is not enough sample to do the slide, the sample will stop playing once it reaches its end, otherwise it will continue playing at the 'endrate' for the remaining duration of the sample. Default: 4.
- **reverse:** a number that defines if the sample will be played normal or backwards, allowed values --> 0 -> no, 1 -> yes. Default: 0.
- **envelope:** a number that defines if the sample will be played with an envelope, allowed values --> 0 -> no, 1 -> yes. Default: 0.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Has no effect if 'envelope' value is 0. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 0.5.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### simple_sequence

Not really an instrument, but a utility to play a sequence starting on a base frequency and going up or down at a fixed interval

Parameters:

- **instrument:** a number representing the instrument --> 0 --> simple_wave(sine), 1 --> simple_wave(triangle), 2 --> simple_wave(square), 3 --> simple_wave(sawtooth), 4 --> basic_synth, 5 --> basic_fm. Default: 0.
- **amount:** amount of notes to be played, must be an integer greater that 0. Default: 4.
- **base:** a number greater than 0 representing the base frequency in hertz. Default: 100.
- **interval:** a number greater or equal to 0 representing the interval in hertz. Default: 100.
- **direction:** a number representig the direction --> 0 --> down, 1 --> up. Default: 1.
- **wait:** a number greater or equal to 0 representing the wait time between notes as a multiple of the BPM. Default: 1.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

Extra arguments in case of instrument being **basic_synth** or **basic_fm**

#### basic_synth

- **cutoff:** a number greater than 0 representing the cutoff frequency for the low pass filter. Default: 20000.
- **q:** a number between 1 and 25 representing the resonance of the filter. Default: 1.
- **contour:** a number between 0.1 and 1 representing the time (as multiple of the duration) for the filter to go from full open to the cutoff value. Default: 0.8.

#### basic_fm

- **mod:** a number greater than 0 representing the frequency of the modulator as a multiple of the carrier. Default: 2.
- **depth:** a number greater or equal to 0 representing the depth of the modulation. Default: 1000.

## the included samples and how to add your own

In order to keep the online demo functional, I've added some samples:

- **Bank 0:** a (very) little selection of percussion sounds taken from the [tidal-drum-machines](https://github.com/geikha/tidal-drum-machines) library. 
    - 0 - 5: bass drums.
    - 6 - 9: closed hi-hats.
    - 10 - 15: misc.
    - 16: a lonely open hi-hat.
    - 17 - 22: snare drums.
- **Bank 1:** some (very) lo-fi recordings of myself doing silly voices.
- **Bank 2:** a bunch of (very) silly samples from old educational movies.
- **Bank 3:** synth stuff created in Pure Data.

In order to add your own samples:

- Download *éliane* and serve it locally, there is a gazillion ways of doing that, live server will do the trick...
- Locate the 'samples' folder and copy there folders with samples inside, every folder will become a 'bank' and every sample will become, you guessed it, a sample.
- How *éliane* will recognize the folders/samples? you have to modify the 'samples.json' file that lives inside the samples folder, they will be loaded in order, so the first folder will become bank 0, the first sample in the folder will become sample 0 and so on...

```JSON
{
    "urls" : [
        [
            "/folder/sample_name.wav",
            "/folder/sample_name.wav",
            "/folder/sample_name.wav"
        ],
        [
            "/another_folder/sample_name.wav",
            "/another_folder/you_get_the_picture.wav"
        ]
    ]
}
```

## adding your own functions

In order to add your own functions to *éliane*, you have to go inside the 'js' folder and find the file 'functions_register.js', there, you can write your function(s), there are just a couple of rules for it to work:

- Be **careful** with your ears as you design your sounds.
- All functions MUST receive a **nextEvent** argument, in order to implement the mechanism that will keep the sequence going.
- The second argument must be a destructured object with defaults values, all arguments must be numbers.
- The third argument represents the CURRENT bpm, as is given to you by the interpreter and needed by the pulseToSeconds and createEnvelope utility functions, it's up to you to decide if it is of use to you or not.
- Function names must have at least two words in camel case.
- Did I say be **careful** with your ears?

```JS
function myFunction(nextEvent, {a = 12, b = 23, c = 23 },bpm){//BPM is optional

    //the stuff the function does

    //at the end of your function, add this, this is the mechanism that keeps the sequence going
    if(nextEvent){//if there's a next event
        nextFunction(nextEvent);//invoke the nextFunction (declared in the globals.js file) to keep the sequence going
    }
}
```
After doing that, you have to add it to the functions object at the very bottom of the file, then, you'll be able to call it as any other function:

```
my_function;
my_function a: 123, c: -23;
```

You will have in scope a 'context' constant that you can use to create your nodes and at the end you can just connect everything to the 'context.destination'.

Also, you'll have several other utilities that you can check out at the 'context_utilities.js' file in the same folder.

Just remember, **be careful** with your ears.


