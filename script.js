import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e3f66); // Ocean blue
scene.fog = new THREE.Fog(0x1e3f66, 5, 20); // color, near, far

// Camera
const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
);
camera.position.set(0, 2, 5); // Position the camera

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("aquarium"),
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Resize Handling
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Ocean floor
const floorGeometry = new THREE.PlaneGeometry(20, 20, 32, 32); // width, height, segments
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x224466,
    side: THREE.DoubleSide,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to lay flat
floor.position.y = -1; //Lower it a bit
scene.add(floor);

const textureLoader = new THREE.TextureLoader();
const causticsTexture = textureLoader.load("./assets/textures/caustics.png");
causticsTexture.wrapS = causticsTexture.wrapT = THREE.RepeatWrapping;
causticsTexture.repeat.set(4, 4);

// Create a new mesh slightly above the floor to project the caustics
const causticsMaterial = new THREE.MeshBasicMaterial({
    map: causticsTexture,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
});

const causticsPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    causticsMaterial
);
causticsPlane.rotation.x = -Math.PI / 2;
causticsPlane.position.y = -0.69; // slightly above the floor
scene.add(causticsPlane);

function addCoral(x, z) {
    const coralGeometry = new THREE.IcosahedronGeometry(
        0.3 + Math.random() * 0.3,
        1
    );
    const coralMaterial = new THREE.MeshStandardMaterial({
        color: 0xff69b4,
        flatShading: true,
    });

    const coral = new THREE.Mesh(coralGeometry, coralMaterial);
    coral.position.set(x, -0.7, z);
    coral.rotation.y = Math.random() * Math.PI * 2;
    scene.add(coral);
}

// Add several corals at random positions
for (let i = 0; i < 20; i++) {
    const x = (Math.random() - 0.5) * 16;
    const z = (Math.random() - 0.5) * 16;
    addCoral(x, z);
}

function createFish(color = 0xffcc00) {
    const fish = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    fish.add(body);

    // Tail
    const tailGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xff8800 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.rotation.z = -Math.PI / 2;
    tail.position.set(-0.4, 0, 0);
    fish.add(tail);

    return fish;
}

const fishes = [];
const fishData = []; // store direction and speed

for (let i = 0; i < 5; i++) {
    const fish = createFish();
    fish.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 2,
        (Math.random() - 0.5) * 10
    );

    // Each fish gets a direction (normalized vector) and speed
    const direction = new THREE.Vector3(
        Math.random() - 0.5,
        0,
        Math.random() - 0.5
    ).normalize();
    const speed = 0.01 + Math.random() * 0.01;

    fishData.push({ direction, speed });
    fishes.push(fish);
    scene.add(fish);
}

const waterGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x3399ff,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
});
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.position.y = 3;
scene.add(water);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movements

window.addEventListener("click", (event) => {
    // Convert screen to 3D coordinates
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(floor);
    if (intersects.length > 0) {
        const point = intersects[0].point;
        foodPosition = point;

        // Remove previous food
        if (foodMesh) scene.remove(foodMesh);

        // Add new food marker
        const foodGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const foodMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
        });
        foodMesh = new THREE.Mesh(foodGeometry, foodMaterial);
        foodMesh.position.set(point.x, point.y + 0.05, point.z);
        scene.add(foodMesh);
    }
});

const bubbles = [];

function createBubble() {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({
        color: 0x99ccff,
        transparent: true,
        opacity: 0.6,
    });
    const bubble = new THREE.Mesh(geometry, material);

    // Start near coral or fish
    bubble.position.set(
        (Math.random() - 0.5) * 10,
        -0.5,
        (Math.random() - 0.5) * 10
    );

    scene.add(bubble);
    bubbles.push(bubble);
}

let foodPosition = null;
let foodMesh = null;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    fishes.forEach((fish, i) => {
        const data = fishData[i];

        // Move in direction
        fish.position.addScaledVector(data.direction, data.speed);

        // Occasionally change direction
        if (Math.random() < 0.005) {
            data.direction = new THREE.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
        }

        if (foodPosition) {
            const toFood = new THREE.Vector3().subVectors(
                foodPosition,
                fish.position
            );
            toFood.y = 0;
            toFood.normalize();

            // Blend current direction toward food
            data.direction.lerp(toFood, 0.02);
        }

        // Turn the fish to face direction
        fish.rotation.y = Math.atan2(-data.direction.z, data.direction.x);
    });

    causticsTexture.offset.x += 0.0005;
    causticsTexture.offset.y += 0.0003;

    water.position.y = 3 + 0.05 * Math.sin(Date.now() * 0.001);

    directionalLight.position.x = 5 * Math.sin(Date.now() * 0.001);
    directionalLight.position.z = 5 * Math.cos(Date.now() * 0.001);

    // Add bubbles occasionally
    if (Math.random() < 0.05) {
        createBubble();
    }

    // Update bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        bubble.position.y += 0.02;
        bubble.material.opacity -= 0.002;

        if (bubble.material.opacity <= 0) {
            scene.remove(bubble);
            bubbles.splice(i, 1);
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();
