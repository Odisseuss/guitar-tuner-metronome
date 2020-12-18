import { instantiateStreaming } from "@assemblyscript/loader";

export default instantiateStreaming(fetch("optimized.wasm"));
