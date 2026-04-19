// get the canvas element
const canvas = document.getElementById("renderCanvas");
// create the BABYLON 3D engine
const engine = new BABYLON.Engine(canvas, true);

// create the scene
const createScene = async function() {
    const scene = new BABYLON.Scene(engine);
    
    // enable physics
    const havokInstance = await HavokPhysics();
    const hk = new BABYLON.HavokPlugin(true, havokInstance);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), hk);

    /* Camera
    ---------------------------------------------------------------------------------------- */
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    /* Lighting
    ---------------------------------------------------------------------------------------- */
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    /* Ground
    ---------------------------------------------------------------------------------------- */
    const groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/grass.png");
    groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("ground", "https://assets.babylonjs.com/environments/villageheightmap.png", {
        width: 150,
        height: 150,
        subdivisions: 100,
        minHeight: 0,
        maxHeight: 10
    });
    ground.material = groundMat;
    ground.receiveShadows = true;

    let groundAggregate;
    await new Promise((resolve) => {
        ground.onReady = () => {
            groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.MESH, { mass: 0}, scene);
            groundAggregate.body.setMotionType(BABYLON.PhysicsMotionType.ANIMATED);
            groundAggregate.body.disablePreStep = false;
            resolve();
        };
    });

    /* Sky
    ---------------------------------------------------------------------------------------- */
    const sky = BABYLON.MeshBuilder.CreateBox("sky", {
        size: 150
    }, scene);
    const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
    skyMat.backFaceCulling = false;
    skyMat.reflectionTexture = new BABYLON.CubeTexture("./textures/skybox", scene);
    skyMat.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyMat.specularColor = new BABYLON.Color3(0, 0, 0);
    sky.material = skyMat;

    /* Floor
    ---------------------------------------------------------------------------------------- */
    // const floor = BABYLON.MeshBuilder.CreateGround("floor", {
    //     width: 10,
    //     height: 10
    // }, scene);
    // const floorMat = new BABYLON.StandardMaterial("floorMat");
    // floorMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    // floor.material = floorMat;

    /* Table
    ---------------------------------------------------------------------------------------- */
    // const table = BABYLON.MeshBuilder.CreateBox("table", {
    //     width: 1.5,
    //     height: 0.1,
    //     depth: 1
    // }, scene);
    // table.position.y = 1.5;
    // const tableMat = new BABYLON.StandardMaterial("tableMat");
    // tableMat.diffuseColor = new BABYLON.Color3(1, 0.6, 0);
    // table.material = tableMat;

    // const legRoot = new BABYLON.TransformNode("legRoot", scene);
    // legRoot.parent = table;

    // const leg = BABYLON.MeshBuilder.CreateBox("leg", {
    //     width: 0.1,
    //     height: 1.5,
    //     depth: 0.1
    // }, scene);
    // const legMat = new BABYLON.StandardMaterial("legMat");
    // legMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    // leg.material = legMat;
    // leg.isVisible = false;

    // const corners = [
    //     new BABYLON.Vector3(0.6, -0.75, 0.4),
    //     new BABYLON.Vector3(-0.6, -0.75, 0.4),
    //     new BABYLON.Vector3(0.6, -0.75, -0.4),
    //     new BABYLON.Vector3(-0.6, -0.75, -0.4)
    // ];

    // for (let i = 0; i < 4; i++) {
    //     let legInstance = leg.createInstance("legInstance" + i);
    //     legInstance.parent = legRoot;
    //     legInstance.position = corners[i];
    // }

    // const tableAggregate = new BABYLON.PhysicsAggregate(table, BABYLON.PhysicsShapeType.BOX, { mass: 5, restitution: 0.6, friction: 0.5 }, scene);

    /* House
    ---------------------------------------------------------------------------------------- */
    const faceUV = [];
    faceUV[0] = new BABYLON.Vector4(0.4, 0.0, 0.6, 1.0);
    faceUV[1] = new BABYLON.Vector4(0.3, 0.0, 0.5, 1.0);
    faceUV[2] = new BABYLON.Vector4(0.6, 0.0, 1.0, 1.0);
    faceUV[3] = new BABYLON.Vector4(0.0, 0.0, 0.4, 1.0);
    
    const boxMat = new BABYLON.StandardMaterial("boxMat", scene);
    boxMat.diffuseTexture = new BABYLON.Texture("./textures/stoneso.png", scene);
    const roofMat = new BABYLON.StandardMaterial("roofMat", scene);
    roofMat.diffuseTexture = new BABYLON.Texture("./textures/wood.jpg", scene);

    function buildHouse(position, rotationY) {
        const box = BABYLON.MeshBuilder.CreateBox("box_" + position.x, { faceUV: faceUV, wrap: true }, scene);
        box.scaling = new BABYLON.Vector3(2, 1.5, 3);
        box.position = position.clone();
        box.position.y = 0.75;
        box.rotation.y = BABYLON.Tools.ToRadians(rotationY);
        box.material = boxMat;
        const boxAggregate = new BABYLON.PhysicsAggregate(box, BABYLON.PhysicsShapeType.BOX, { mass: 0, friction: 0.5, restitution: 0.1 }, scene);

        const roof = BABYLON.MeshBuilder.CreateCylinder("roof_" + position.x, { diameter: 2.8, height: 3.5, tessellation: 3 }, scene);
        roof.scaling.x = 0.75;
        roof.rotation.z = BABYLON.Tools.ToRadians(90);
        roof.rotation.y = BABYLON.Tools.ToRadians(rotationY - 90);
        roof.position = position.clone();
        roof.position.y = 2;
        roof.material = roofMat;
        const roofAggregate = new BABYLON.PhysicsAggregate(roof, BABYLON.PhysicsShapeType.CYLINDER, { mass: 0, friction: 0.8, restitution: 0.1 }, scene);

        return [
            { mesh: box, aggregate: boxAggregate },
            { mesh: roof, aggregate: roofAggregate }
        ];
    }

    const houseParts = [
        ...buildHouse(new BABYLON.Vector3(1, 0, 10), 45),
        ...buildHouse(new BABYLON.Vector3(0, 3, -4), 45),
        ...buildHouse(new BABYLON.Vector3(-3, 0, 1), -45),
    ]

    let houseCollapsed = false;

    function collapseHouse() {
        if (houseCollapsed) return;
        houseCollapsed = true;

        houseParts.forEach(({ mesh, aggregate }) => {
            aggregate.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
            aggregate.body.applyImpulse(new BABYLON.Vector3((Math.random() - 0.5) * 20, Math.random() * 20, (Math.random() - 0.5) * 20), mesh.getAbsolutePosition());
            aggregate.body.applyAngularImpulse(new BABYLON.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10));
        });
    }

    /* Building
    ---------------------------------------------------------------------------------------- */
    const buildingMat = new BABYLON.StandardMaterial("buildingMat", scene);
    buildingMat.diffuseTexture = new BABYLON.Texture("./textures/checkerboard_metallicRoughness.png", scene);

    function buildBuilding(position, floors = 5) {
        const parts = [];
        const floorWidth = 2;
        const floorDepth = 2;
        const floorHeight = 1;

        for (let i = 0; i < floors; i++) {
            const floor = BABYLON.MeshBuilder.CreateBox("floor_" + i + "_" + position.x, { width: floorWidth, height: floorHeight, depth: floorDepth }, scene);
            floor.position = new BABYLON.Vector3(position.x, position.y + floorHeight * i + floorHeight / 2, position.z);

            const floorMat = new BABYLON.StandardMaterial("floorMat_" + i, scene);
            const shade = 0.4 + (i % 2) * 0.15;
            floorMat.diffuseColor = new BABYLON.Color3(shade, shade + 0.1, shade + 0.2);
            floor.material = floorMat;

            // create physics aggregate for each floor and set it to static initially
            const floorAggregate = new BABYLON.PhysicsAggregate(floor, BABYLON.PhysicsShapeType.BOX, { mass: 2.5, friction: 0.55, restitution: 0.12 }, scene);
            floorAggregate.body.setMotionType(BABYLON.PhysicsMotionType.STATIC);
            parts.push({ mesh: floor, aggregate: floorAggregate });
        }
        return parts;
    }

    // raycast to find the terrain height at the building position to place it on the ground
    const buildingXZ = new BABYLON.Vector3(6, 0, 6);
    const terrainRay = new BABYLON.Ray(new BABYLON.Vector3(buildingXZ.x, 80, buildingXZ.z), new BABYLON.Vector3(0, -1, 0), 200);
    const terrainHit = scene.pickWithRay(terrainRay, (m) => m === ground);
    const terrainY = terrainHit && terrainHit.hit && terrainHit.pickedPoint ? terrainHit.pickedPoint.y : 0;
    const buildingParts = buildBuilding(new BABYLON.Vector3(buildingXZ.x, terrainY, buildingXZ.z), 8);

    let buildingCollapsed = false;

    function collapseBuilding() {
        if (buildingCollapsed) return;
        buildingCollapsed = true;

        const n = buildingParts.length;
        buildingParts.forEach(({ mesh, aggregate }, index) => {
            setTimeout(() => {
                // set each floor to dynamic with a delay to create a collapse effect
                const body = aggregate.body;
                body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
                body.setGravityFactor(1);
                body.setMassProperties({ mass: 2.5 + index * 0.2 });
                body.setLinearDamping(0.08);
                body.setAngularDamping(0.12);

                // get the world position of the floor
                mesh.computeWorldMatrix(true);
                const worldPos = mesh.getAbsolutePosition();

                // apply an impulse to each floor
                const heightBias = (index + 1) / n;
                const lateral = 18 + heightBias * 22;
                const impulse = new BABYLON.Vector3(
                    (Math.random() - 0.5) * lateral,
                    -10 - Math.random() * 12,
                    (Math.random() - 0.5) * lateral
                );
                body.applyImpulse(impulse, worldPos);
                body.applyAngularImpulse(new BABYLON.Vector3(
                    (Math.random() - 0.5) * 24,
                    (Math.random() - 0.5) * 18,
                    (Math.random() - 0.5) * 24
                ));
            }, index * 28);
        });
    }

    /* Button
    ---------------------------------------------------------------------------------------- */
    const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {
        diameter: 0.6,
        height: 0.2
    }, scene);
    cylinder.position = new BABYLON.Vector3(0, 0, -9);
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
                    if (active.name === "Heavy") {
                        collapseHouse();
                        collapseBuilding();
                    }
                    if (active.name === "Middle") {
                        collapseBuilding();
                    }
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
            ground.position.x = (Math.random() - 0.5) * i;
            ground.position.z = (Math.random() - 0.5) * i;
        }
        // put the table back to original position
        else {
            ground.position.x = 0;
            ground.position.z = 0;
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