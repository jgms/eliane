let examples = [
   `pulse 160;

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
notes = [390,780,840,335,960];
depthone = 50;
depthtwo = 100;

repeat 4{
   i = 0;
   delaytime = 0;
   repeat 5{

      if i == 0{
          amplitude = 0.7;
      }else{
         if i == 3{
             amplitude = 0.5;
         }else{
            amplitude = 0.3;
         }
      }
     
      if i == 1{
         delaytime = 1.5;
      }
     
      fm_in_parallel frequency: notes[i], sustain: 1, release: 0.1, modone: 0.25, depthone: depthone, oneattack: 0.66, onerelease: 0.34, modtwo: 3, depthtwo: depthtwo, twoattack: 0.5, tworelease: 0.5, delaytime: delaytime, amplitude: 0.4;
      wait 1;
      i = i + 1;
   }
   depthone = depthone + 100;
   depthtwo = depthtwo + 150;
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

      if i == 0{
          amplitude = 0.7;
      }else{
         if i == 3{
             amplitude = 0.5;
         }else{
            amplitude = 0.3;
         }
      }
      
      if i == 1{
         delaytime = 1.5;
      }
      
      fm_in_parallel frequency: notes[i], sustain: 1, release: 0.1, modone: 0.25, depthone: 500, oneattack: 0.66, onerelease: 0.34, modtwo: 3, depthtwo: 100, twoattack: 0.5, tworelease: 0.5, delaytime: delaytime, amplitude: amplitude;
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

      if i == 0{
          amplitude = 0.7;
      }else{
         if i == 4{
             amplitude = 0.5;
         }else{
            amplitude = 0.3;
         }
      }
     
      if i == 1{
         delaytime = 1.5;
      }
     
      fm_in_parallel frequency: notes[i], sustain: 1, release: 0.1, modone: 0.25, depthone: depthone, oneattack: 0.66, onerelease: 0.34, modtwo: 3, depthtwo: depthtwo, twoattack: 0.5, tworelease: 0.5, delaytime: delaytime, amplitude: amplitude;
      wait 1;
      i = i + 1;
   }
   depthone = depthone * 1.35;
   depthtwo = depthtwo * 1.35;
}`
]