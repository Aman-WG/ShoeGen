declare module 'zzfx' {
  export function zzfx(...params: (number | undefined)[]): AudioBufferSourceNode | void;

  export const ZZFX: {
    buildSamples: (...params: (number | undefined)[]) => Float32Array;
    playSamples: (
      channels: Float32Array[],
      volume?: number,
      rate?: number,
      delay?: number,
      loop?: boolean,
    ) => AudioBufferSourceNode;
  };
}
