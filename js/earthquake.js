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
    }

    /* Button
    ---------------------------------------------------------------------------------------- */
    const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {
        diameter: 0.6,
        height: 0.2
    }, scene);
    cylinder.position = new BABYLON.Vector3(0, 0, -4);
    const cylinderMat = new BABYLON.StandardMaterial("cylinderMat", scene);
    cylinderMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    cylinder.material = cylinderMat;

    const button = BABYLON.MeshBuilder.CreateSphere("button", {
        diameter: 0.4
    }, scene);
    button.parent = cylinder;
    button.position = new BABYLON.Vector3(0, 0.08, 0);

    /* Earthquakes
    ---------------------------------------------------------------------------------------- */
    const earthquakes = [
        {
            intensity: 0.05,
            speed: 2,
            duration: 2000,
            name: "Light"
        },
        {
            intensity: 0.2,
            speed: 5,
            duration: 3000,
            name: "Middle"
        },
        {
            intensity: 0.5,
            speed: 10,
            duration: 1500,
            name: "Heavy"
        }
    ];

    /* Trigger
    ---------------------------------------------------------------------------------------- */
    let isShaking = false;
    let active = null;
    const originalPosition = table.position.clone();

    // a random earthquake is triggered when the button is clicked
    button.actionManager = new BABYLON.ActionManager(scene);
    button.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
                // check an earthquake is currently happening to avoid starting next earthquake at the same time
                if (!isShaking) {
                    const randomE = Math.floor(Math.random() * earthquakes.length);
                    active = earthquakes[randomE];
                    isShaking = true;
                    console.log(active.name + " triggered");
                    setTimeout(() => {
                        isShaking = false;
                    }, active.duration);
                }
            }
        )
    );

    // get the position of the table constantly
    scene.onBeforeRenderObservable.add(() => {
        // update the position of the table
        if (isShaking && active) {
            const i = active.intensity;
            table.position.x = originalPosition.x + (Math.random() - 0.5) * i;
            table.position.z = originalPosition.z + (Math.random() - 0.5) * i;
        }
        // put the table back to original position
        else {
            table.position.x = originalPosition.x;
            table.position.z = originalPosition.z;
        }
    });

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