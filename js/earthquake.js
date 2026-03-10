// get the canvas element
const canvas = document.getElementById("renderCanvas");
// create the BABYLON 3D engine
const engine = new BABYLON.Engine(canvas, true);

// create the scene
const createScene = async function() {
    const scene = new BABYLON.Scene(engine);

    /* Camera
    ---------------------------------------------------------------------------------------- */
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
}