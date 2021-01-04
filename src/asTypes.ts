declare module ASModule {
  type i8 = number;
  type i16 = number;
  type i32 = number;
  type i64 = bigint;
  type isize = number;
  type u8 = number;
  type u16 = number;
  type u32 = number;
  type u64 = bigint;
  type usize = number;
  type f32 = number;
  type f64 = number;
  type bool = boolean | number;
  export function __new(size: usize, id: u32): usize;
  export function __renew(oldPtr: usize, size: usize): usize;
  export function __retain(ptr: usize): usize;
  export function __release(ptr: usize): void;
  export var __rtti_base: usize;
  export var Float32AudioBuffer_ID: u32;
  export function YIN(float32AudioBuffer: usize, threshold: f32, sampleRate: i32, probabilityThreshold: f32): f32;
}
export default ASModule;
