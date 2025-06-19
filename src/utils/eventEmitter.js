
import { EventEmitter } from "events";

const emitter = new EventEmitter();

// Optional: Set the maximum number of listeners to avoid potential memory leaks in large apps.
emitter.setMaxListeners(10);

export default emitter;
