As with any other sound producing software, remember to **be careful with your ears**.

You can find an online working version of *éliane* [here](https://jgms.github.io/eliane/). But the real fun starts once you download it and start making your own sounds. For the time being, *éliane* is not available for mobile devices.

## what

*éliane* is an environment for programming electronic music, whose main concern is to **separate the sound design from the sequencing**, allowing the creation of, for a lack of a better name, "scripted scores". At its very core it's just a code based function sequencer I developed with the aim of making my workflow a little more playful and inspiring.

The instruments/functions included so far are based on my [own practice](https://joaquinmendoza.bandcamp.com/album/nueve-a-os), but you can create your own functions and add them to (or completely replace) the original ones, in fact, you can extract the interpreter/sequencer and sequence whatever function(s) you want, not necessarily sound producing functions.

*éliane* is named after the great French composer [Éliane Radigue](https://en.wikipedia.org/wiki/%C3%89liane_Radigue).

## why

After so many years of making music using [Pure Data](https://puredata.info/), which I consider still the greatest sound design tool there is, my patches were becoming messier and messier everytime I needed to make (sometimes not so) complex arrangements, I needed something with the simplicity yet the power of the syntax of, say, [Sonic Pi](https://sonic-pi.net/), which heavily influenced *éliane*'s syntax. I just wanted to **separate the sound design from the sequencing**, but in a way that they were easy to integrate.

After exploring a little (tons to learn still, though) the Web Audio API, and seeing that I could implement all (at least at first glance) my usual sound design techniques, I said: why not leave the sound design entirely in the hands of JavaScript and build a simple language on top of it to sequence everything? so, here we are.

Although I made *éliane* to address my very own creative needs, I decided to make it available online and open source the code in order to use it to teach the basics of programming to my youngest students, and in case it can be of use to anyone. So feel free to download and modify/expand/make it your own. If you find any error (you know how this goes), feel free to get in touch at *joaquinmendozasebastian (at) gmail.com*. 

## the syntax

*éliane*'s syntax is as simple as it gets, it only has **variables**, **function calls** and 5 keywords: **pulse**, **wait**, **repeat**, **if** and **else**. As I said above, it is heavily inspired by [Sonic Pi](https://sonic-pi.net/)'s, but simpler. There are a several things missing: complex/compound conditions/operations and my very much beloved ternary orperator, but I plan to implement them in the not so distant future. I'd also love to add syntax highlighting at some point.

Before we continue, it's important to clarify what *éliane* is not: it is not a fully fledged programming language (I don't really know if that's even within my reach), it is just a way to sequence the calling of functions, changing their parameters and declaring global variables along the way, using a very simple syntax. One of the reasons I'm open sourcing this, is because I know the technical wizards out there can take this humble effort waaaaay further. With that out of the way, let's us explain *éliane*'s features one by one.

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

### pulse

The **pulse** keyword defines the global BPM (beats per minute) of the sequence, the default value is 60.

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

As I'm still exploring the full sound design capabilities of the Web Audio API, I went for the basic building blocks of my music at the moment of writing this (august 2024), but functions in *éliane* are designed to take only numbers as arguments, that makes very easy expanding its options, because all the "heavy programming" will rest on JavaScript's shoulders, inside the functions we can make whatever we want of those numbers, we can fill an array with samples and use a number as the index to determine which one to play, we can use a number to define its speed, etc. etc. The possibilities are almost endless, as I said above, sound design is separate from sequencing.

Let's go one by one, as you will see, I'll only tell you about its parameters, feel free to play and experiment with them to see what they are about. This list will be growing (hopefully) as my knowledge of the Wed Audio API grows.

### silly_test_synth

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### simple_wave

Parameters:

- **wave:** a number representing the waveform --> 0 -> sine, 1 -> triangle, 2 -> square, 3 -> sawtooth. Default: 0.
- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0. 
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### white_noise

Parameters:

- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### tuned_noise

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 1.
- **amplitude:** a number between 0 and 2 representing the amplitude. Default: 2.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### basic_synth

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **detune:** a number representing the amount (in hertz) of detuning of the second oscillator. Default: 1.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **cutoff:** a number greater than 0 representing the cutoff frequency for the low pass filter. Default: 20000.
- **q:** a number between 1 and 25 representing the resonance of the filter. Default: 1.
- **contour:** a number between 0.1 and 1 representing the time (as multiple of the duration) for the filter to go from full open to the cutoff value. Default: 0.8.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### bass_line

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **cutoff:** a number greater than 0 representing the cutoff frequency for the low pass filter. Default: 10000.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### basic_fm

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **mod:** a number greater than 0 representing the frequency of the modulator as a multiple of the carrier. Default: 2.
- **depth:** a number greater or equal to 0 representing the depth of the modulation. Default: 1000.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### basic_fm_env

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 100.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 0.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 1.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **mod:** a number greater than 0 representing the frequency of the modulator as a multiple of the carrier. Default: 2.
- **depth:** a number greater or equal to 0 representing the depth of the modulation. Default: 1000.
- **modattack:** a number greater or equal to 0 representing the attack time of the modulator as a multiple of the global BPM. Default: 0.
- **modsustain:** a number greater or equal to 0 representing the sustain time of the modulator as a multiple of the global BPM. Default: 0.
- **modrelease:** a number greater or equal to 0 representing the release time of the modulator as a multiple of the global BPM. Default: 1.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### fm_in_series

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 200.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 8.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 8.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **modone:** a number greater than 0 representing the frequency of the first modulator as a multiple of the carrier. Default: 0.0625.
- **depthone:** a number greater or equal to 0 representing the depth of the modulation of the first modulator. Default: 3000.
- **oneattack:** a number greater or equal to 0 representing the attack time of the first modulator as a multiple of the global BPM. Default: 0.
- **onesustain:** a number greater or equal to 0 representing the sustain time of the first modulator as a multiple of the global BPM. Default: 0.
- **onerelease:** a number greater or equal to 0 representing the release time of the first modulator as a multiple of the global BPM. Default: 16.
- **modtwo:** a number greater than 0 representing the frequency of the second modulator as a multiple of the first modulator. Default: 3.
- **depthtwo:** a number greater or equal to 0 representing the depth of the modulation of the second modulator. Default: 1000.
- **twoattack:** a number greater or equal to 0 representing the attack time of the second modulator as a multiple of the global BPM. Default: 12.
- **twosustain:** a number greater or equal to 0 representing the sustain time of the second modulator as a multiple of the global BPM. Default: 0.
- **tworelease:** a number greater or equal to 0 representing the release time of the second modulator as a multiple of the global BPM. Default: 3.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

### fm_in_parallel

Parameters:

- **frequency:** a number greater than 0 representing the frequency in hertz. Default: 200.
- **attack:** a number greater or equal to 0 representing the attack time as a multiple of the global BPM. Default: 0.
- **sustain:** a number greater or equal to 0 representing the sustain time as a multiple of the global BPM. Default: 8.
- **release:** a number greater or equal to 0 representing the release time as a multiple of the global BPM. Default: 8.
- **amplitude:** a number between 0 and 1 representing the amplitude. Default: 1.
- **modone:** a number greater than 0 representing the frequency of the first modulator as a multiple of the carrier. Default: 0.0625.
- **depthone:** a number greater or equal to 0 representing the depth of the modulation of the first modulator. Default: 3000.
- **oneattack:** a number greater or equal to 0 representing the attack time of the first modulator as a multiple of the global BPM. Default: 0.
- **onesustain:** a number greater or equal to 0 representing the sustain time of the first modulator as a multiple of the global BPM. Default: 0.
- **onerelease:** a number greater or equal to 0 representing the release time of the first modulator as a multiple of the global BPM. Default: 16.
- **modtwo:** a number greater than 0 representing the frequency of the second modulator as a multiple of the first modulator. Default: 3.
- **depthtwo:** a number greater or equal to 0 representing the depth of the modulation of the second modulator. Default: 1000.
- **twoattack:** a number greater or equal to 0 representing the attack time of the second modulator as a multiple of the global BPM. Default: 12.
- **twosustain:** a number greater or equal to 0 representing the sustain time of the second modulator as a multiple of the global BPM. Default: 0.
- **tworelease:** a number greater or equal to 0 representing the release time of the second modulator as a multiple of the global BPM. Default: 3.
- **pan:** a number between -1 and 1 representing the position of the sound in the stereo spectrum. Default: 0.
- **delaytime:** a number greater or equal to 0 representing the delay time as a multiple of the global BPM, when 0, there's no delay. Default: 0.
- **feedback:** a number between 0 and 0.9 to control the delay's feedback. Default: 0.5.

## adding your own functions

In order to add your own functions to *éliane*, you have to go inside the 'js' folder and find the file 'functions_register.js', there, you can write your function(s), there are just a couple of rules for it to work:

- Be **careful** with your ears as you design your sounds.
- All functions MUST receive a **nextEvent** argument, in order to implement the mechanism that will keep the sequence going.
- The second argument must be a destructured object with defaults values, all arguments must be numbers.
- Function names must have at least two words in camel case.
- Did I say be **careful** with your ears?

```JS
function myFunction(nextEvent, {a = 12, b = 23, c = 23 }){

    //the stuff the functions does

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


