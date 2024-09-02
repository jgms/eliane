let examples = [
 `# étude 1

# this is éliane's first flight, just a little test

pulse 76;

# intro
fm_in_parallel frequency: 600, attack: 5, sustain: 10, release: 15;
wait 15;

# A section
notes = [670,630,510,350,300];
pan = [-1,-0.6,0,0.3,0.8];
repeat 2 {
   i = 0;
   repeat 5 {
      simple_wave wave: 2, frequency: notes[i], pan: pan[i], delaytime: 0.375, feedback: 0.75;
      wait 0.25;
      i = i + 1;
   }
}

# B section
time = 1;
i = 0;
repeat 5 {
   note = notes[i] * 2;
   fm_in_series frequency: note, attack: 0, sustain: 0, modone: 0.0625, modtwo: 8, release: 8, delaytime: 1.25, feedback: 0.55;
   
   if i == 3 {
       # final crescendo
       note = notes[4] * 0.25;
       silly_test_synth frequency: note, attack: 15, release: 5, amplitude: 0.1, delaytime: 0.25, feedback: 0.2;

       # little A reprise
       j = 0;
       repeat 5 {
         simple_wave wave: 2, frequency: notes[j], pan: pan[j], delaytime: 0.375, feedback: 0.75;
         wait 0.25;
         j = j + 1;
      }  
   }

   wait time;
   time = time + 0.75;
   i = i + 1;
}`,
 `# étude 2 - behold the loop!!!

# this one seems to push the browser to its very limits =S 

pulse 90;

# voices
anotes = [780,840,1100];
bnotes = [930,630,1050,900];
cnotes = [700,600,960,1130,870];
dnotes = [670,1100,750,1170,1020];
enotes = [600,630,670,700,750,780,840,870,900,930,960,1020];

# indexes for voices
a = 0;
b = 0;
c = 0;
d = 0;
e = 0;

basic_fm frequency: 1200, attack: 0.6, release: 24, mod: 0.125, depth: 3000, amplitude: 0.6, delaytime: 1.5, feedback: 0.8;
wait 8;

repeat 24{
   
   # amplitude & release for voice a
   if a == 0{
      ampa = 0.2;
      rela = 4;     
   }else{
      ampa = 0.1;
      rela = 2;
   }

   # amplitude & release for voice b
   if b == 0{
      ampb = 0.2;
      relb = 4;     
   }else{
      ampb = 0.1;
      relb = 2;
   }

   # amplitude & attack & release for voice c
   if c == 0{
      ampc = 0.6;
      attc = 0;
      relc = 12;     
   }else{
      ampc = 0.35;
      attc = 2;
      relc = 4;
   }

   # amplitude & attack & release for voice d
   if d == 4{
      ampd = 0.7;
      attd = 0;
      reld = 12;     
   }else{
      ampd = 0.4;
      attd = 2;
      reld = 4;
   }

   # amplitude & attack & release for voice e
   if e == 0{
      ampe = 0.6;
      atte = 0.5;
      rele = 24;     
   }else{
      ampe = 0.3;
      atte = 4;
      rele = 1;
   }
   
   # voice a
   bass_line frequency: anotes[a], attack: 4, release: rela, amplitude: ampa, cutoff: 1100, pan: -1, delaytime: 2.5, feedback: 0.3;
   # voice b
   bass_line frequency: bnotes[b], attack: 4, release: relb, amplitude: ampb, cutoff: 1050, pan: 1, delaytime: 2.5, feedback: 0.3;
   # voice c
   simple_wave frequency: cnotes[c], attack: attc, release: relc, amplitude: ampc, pan: 0.5, delaytime: 1.5, feedback: 0.8;
   # voice d
   simple_wave frequency: dnotes[d], attack: attd, release: reld, amplitude: ampd, pan: -0.5, delaytime: 1, feedback: 0.8;
   # voice e
   basic_fm frequency: enotes[e], attack: atte, release: rele, mod: 0.125, depth: 3000, amplitude: ampe, delaytime: 1.5, feedback: 0.8;
   wait 4;
   
   nexta = a + 1; # next possible value for a
   
   # if it is not in range, back to zero
   if nexta < 3{
      a = nexta;
   }else{
      a = 0;
   }

   nextb = b + 1; # next possible value for b
   
   # if it is not in range, back to zero
   if nextb < 4{
      b = nextb;
   }else{
      b = 0;
   }

   nextc = c + 1; # next possible value for c & d
   
   # if it is not in range, back to zero
   if nextc < 5{
      c = nextc;
      d = nextc;
   }else{
      c = 0;
      d = 0;
   }

   nexte = e + 1; # next possible value for e
   
   # if it is not in range, back to zero
   if nexte < 12{
      e = nexte;
   }else{
      e = 0;
   }
   
}
wait 2;
basic_fm frequency: 300, attack: 0.6, release: 24, mod: 0.125, depth: 3000, delaytime: 1.5, feedback: 0.8;`,
 `# étude 4 - Paradjanov

pulse 80;

# notes for the distributed microtonal "chords"
voicetwo = [420,390,375,315];
voicethree = [510,465,390,435];
voicefour = [585,480,510,525];

# A
repeat 4{
   basic_synth amplitude: 0.6, frequency: 600, delaytime: 0.0625;
   wait 0.25;
   basic_synth amplitude: 0.9,frequency: 960, delaytime: 0.0625;
   wait 0.5;
}
basic_synth amplitude: 0.9,frequency: 840, delaytime: 0.0625;
wait 0.5;
basic_synth amplitude: 0.6,frequency: 1020, delaytime: 0.0625;
wait 0.5;
basic_synth amplitude: 0.9,frequency: 870, delaytime: 0.0625;
wait 0.5;

# B
basic_synth frequency: 600, delaytime: 0.0625;
wait 1;
round = 0;
panleft = true; # pan left?
delaytime = 0.5;
feedback = 0.1;
repeat 4{
   i = 0;
   repeat 4{
      repeat 4{
         basic_synth amplitude: 0.6,frequency: 600, delaytime: 0.0625;
         wait 0.25;

         if round < 3{
             basic_synth amplitude: 0.9,frequency: 960, delaytime: 0.0625;
             wait 0.5;
         }
         
         simple_wave wave: 2,frequency: voicetwo[i], attack: 0.5, amplitude: 0.2, pan: -0.6, delaytime: delaytime, feedback: feedback;
         wait 0.25;
         basic_synth frequency: 840, delaytime: 0.0625;
         wait 0.5;

         if round < 2{
             basic_synth amplitude: 0.9,frequency: 1020, delaytime: 0.0625;
             wait 0.5;
         }

         simple_wave wave: 2,frequency: voicethree[i], attack: 0.75, amplitude: 0.4, pan: 0.6, delaytime: delaytime, feedback: feedback;
         wait 0.25;
         
         if panleft { # pan left?
            pan = -0.4;
         }else{
            pan = 0.4;
         }

         simple_wave wave: 2,frequency: voicefour[i], attack: 1, amplitude: 0.2, pan: pan, delaytime: delaytime, feedback: feedback;
         wait 0.25;
         
         panleft = !panleft; # toggle left<->right    

         if round < 1{
            basic_synth amplitude: 0.9,frequency: 870, delaytime: 0.0625;
            wait 0.5;
         }
      }
      i = i + 1;
   }
   round = round + 1;
   delaytime = delaytime + 0.25;
   feedback = feedback + 0.2;
}

# A
repeat 4{
   basic_synth amplitude: 0.6, frequency: 600, delaytime: 0.0625;
   wait 0.25;
   basic_synth amplitude: 0.9,frequency: 960, delaytime: 0.0625;
   wait 0.5;
}
basic_synth amplitude: 0.9,frequency: 840, delaytime: 0.0625;
wait 0.5;
basic_synth amplitude: 0.6,frequency: 1020, delaytime: 0.0625;
wait 0.5;
basic_synth amplitude: 0.9,frequency: 870, delaytime: 0.0625;

wait 2;
basic_synth frequency: 600, delaytime: 0.0625; # bang!`,
`# étude 5 - ritorno al nulla

fm_in_series frequency: 900, amplitude: 0.65, delaytime: 3, feedback: 0.9, pan: -1;
wait 0.5;
fm_in_series frequency: 750, amplitude: 0.65, delaytime: 2, feedback: 0.9, pan: 1;

wait 11.5;

# main variables
amp = 1 / 10;
note = 900;
interval = 110;
attack = 2;

i = 0;
repeat 10{
   base = note; # base for the cluster
   
   if i == 9{
      attack = 6;
   }

   repeat 20{ # this will generate a sine wave cluster whose root is "base"
      simple_wave frequency: base, attack: attack, release: 2, delaytime: 1.5, feedback: 0.6, amplitude: amp;
      base = base + interval;
   }
   wait 3;
   note = note - interval; # the note
   interval = interval - 10; # and the interval for the cluster change in every iteration of the loop
   i = i + 1;
}`,
`# étude 6 - fripp&levin&fripp

pulse 160;

# voices
a = [390,420,390,435];
b = [780,960,870,1020];
c = [840,600];
d = [335,300,275,232.5,187.5];

# indexes
ia = 0;
ib = 0;
ic = 0;
id = 0;

# A
notes = [390,780,840,335,960]; # 960,390,840,335,780
depthone = 50;
depthtwo = 100;

repeat 4{
   i = 0;
   delaytime = 0;
   repeat 5{
	  
      if i == 1{
	 delaytime = 1.5;
      }
	  
      fm_in_parallel frequency: notes[i], sustain: 1, release: 0.1, modone: 0.25, depthone: depthone, oneattack: 0.66, onerelease: 0.34, modtwo: 3, depthtwo: depthtwo, twoattack: 0.5, tworelease: 0.5, delaytime: delaytime;
      wait 1;
      i = i + 1;
   }
   depthone = depthone + 50;
   depthtwo = depthtwo + 100;
}

wait 4;

# B

repeatb = true;

repeat 20{
   notes = [];
   
   notes[0] = a[ia];
   notes[1] = b[ib];
   notes[2] = c[ic];
   notes[3] = d[id];

   i = 0;
   delaytime = 0;
   repeat 4{
      
      if i == 1{
         delaytime = 1.5;
      }
      
      fm_in_parallel frequency: notes[i], sustain: 1, release: 0.1, modone: 0.25, depthone: 100, oneattack: 0.66, onerelease: 0.34, modtwo: 3, depthtwo: 100, twoattack: 0.5, tworelease: 0.5, delaytime: delaytime;
      wait 1;
      i = i + 1;
   }
   
   nexta = ia + 1;
   if nexta <= 3{
      ia = nexta;
   }else{
      ia = 0;
   }

   if !repeatb{ # if we don't want to repeat
      nextb = ib + 1;
      if nextb <= 3{
         ib = nextb;
      }else{
         ib = 0;
      }
   }
   repeatb = !repeatb; # toggle repeat

   nextc = ic + 1;
   if nextc <= 1{
      ic = nextc;
   }else{
      ic = 0;
   }

   nextd = id + 1;
   if nextd <= 4{
      id = nextd;
   }else{
      id = 0;
   }

}

wait 8;

# C
notes = [960,390,840,335,780];
depthone = 50;
depthtwo = 100;

repeat 8{
   i = 0;
   delaytime = 0;
   repeat 5{
	  
      if i == 1{
	 delaytime = 1.5;
      }
	  
      fm_in_parallel frequency: notes[i], sustain: 1, release: 0.1, modone: 0.25, depthone: depthone, oneattack: 0.66, onerelease: 0.34, modtwo: 3, depthtwo: depthtwo, twoattack: 0.5, tworelease: 0.5, delaytime: delaytime;
      wait 1;
      i = i + 1;
   }
   depthone = depthone * 1.15;
   depthtwo = depthtwo * 1.15;
}`
];