//this class will process the audio chunks as they flow
class RecorderProcessor extends AudioWorkletProcessor {                                                                                                       
    process(inputs, outputs) {        
        const input = inputs[0];
        if (input.length === 2) {
            this.port.postMessage({
                L: new Float32Array(input[0]),
                R: new Float32Array(input[1])
            });
        }
        return true;
    }
}
registerProcessor("recorder-processor", RecorderProcessor);