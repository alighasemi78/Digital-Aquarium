import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e3f66); // Ocean blue

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

for (let i = 0; i < 5; i++) {
    const fish = createFish();
    fish.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 2,
        (Math.random() - 0.5) * 10
    );
    scene.add(fish);
    fishes.push(fish);
}

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movements

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    fishes.forEach((fish, index) => {
        fish.position.x += 0.01 * Math.sin(Date.now() * 0.001 + index);
        fish.position.z += 0.01 * Math.cos(Date.now() * 0.001 + index);
        fish.rotation.y = Math.atan2(
            -Math.cos(Date.now() * 0.001 + index),
            Math.sin(Date.now() * 0.001 + index)
        );
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();
