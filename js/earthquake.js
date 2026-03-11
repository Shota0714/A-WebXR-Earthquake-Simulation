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

    /* Lighting
    ---------------------------------------------------------------------------------------- */
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    /* Floor
    ---------------------------------------------------------------------------------------- */
    const floor = BABYLON.MeshBuilder.CreateGround("floor", {
        width: 10,
        height: 10
    }, scene);
    const floorMat = new BABYLON.StandardMaterial("floorMat");
    floorMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    floor.material = floorMat;

    /* Table
    ---------------------------------------------------------------------------------------- */
    const table = BABYLON.MeshBuilder.CreateBox("table", {
        width: 1.5,
        height: 0.1,
        depth: 1
    }, scene);
    table.position.y = 1.5;
    const tableMat = new BABYLON.StandardMaterial("tableMat");
    tableMat.diffuseColor = new BABYLON.Color3(1, 0.6, 0);
    table.material = tableMat;

    const leg = BABYLON.MeshBuilder.CreateBox("leg", {
        width: 0.1,
        height: 1.5,
        depth: 0.1
    }, scene);
    const legMat = new BABYLON.StandardMaterial("legMat");
    legMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    leg.material = legMat;
    leg.isVisible = false;

    const corners = [
        new BABYLON.Vector3(0.6, -0.75, 0.4),
        new BABYLON.Vector3(-0.6, -0.75, 0.4),
        new BABYLON.Vector3(0.6, -0.75, -0.4),
        new BABYLON.Vector3(-0.6, -0.75, -0.4)
    ];

    for (let i = 0; i < 4; i++) {
        let legInstance = leg.createInstance("legInstance" + i);
        legInstance.parent = table;
        legInstance.position = corners[i];
    };

    /* Enable XR
    ---------------------------------------------------------------------------------------- */
    try {
        const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: "immersive-vr",
                referenceSpaceType: "local-floor"
            },
            optionalFeatures: true
        });
    }
    catch (error) {
        console.warn("XR Error", error)
    }

    return scene;
};

// continuous render loop
createScene().then((sceneToRender) => {
    engine.runRenderLoop(() => sceneToRender.render());
});

// Adapt to screen resizing
window.addEventListener("resize", function() {
    engine.resize();
});