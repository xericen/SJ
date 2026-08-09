import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer';

/** Register Meshopt before any runtime GLB parsing starts. */
export const createGltfLoader=()=>new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
