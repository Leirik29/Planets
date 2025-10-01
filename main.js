import "./style.css";
import * as THREE from "three";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import gsap from "gsap";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const loader = new HDRLoader();
loader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",
  function (texture) {
    (texture.mapping = THREE.EquirectangularReflectionMapping),
      // scene.background = texture ,
      (scene.environment = texture);
  }
);

const radius = 1.3;
const segments = 64;
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
const textures = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",
];
const spheres = new THREE.Group();

// const ambientLight = new THREE.AmbientLight(0xffffff , 0.5)
// scene.add(ambientLight)

// const keyLight = new THREE.DirectionalLight(0xffffff, 1)
// keyLight.position.set(5,5,5)
// scene.add(keyLight)

// const fillLight = new THREE.DirectionalLight(0xffffff , 0.7)
// fillLight.position.set(-5,3,-5)
// scene.add(fillLight)

// const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
// backLight.position.set(0,-5,-5)
// scene.add(backLight)

const starTexture = new THREE.TextureLoader().load("./stars.jpg");
starTexture.colorSpace = THREE.SRGBColorSpace;
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  side: THREE.BackSide,
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);
let spheresMesh = [];

for (let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
  spheresMesh.push(sphere);

  const orbitRadius = 4.5;
  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);

  spheres.add(sphere);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);
camera.position.z = 9;

let lastWheelTime = 0;
let throttleDelay = 2000;
let scrollcount = 0;

function throttledWheelHandler(event) {
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttleDelay) {
    lastWheelTime = currentTime;
    const direction = event.deltaY > 0 ? "down" : "up";

    scrollcount = (scrollcount + 1) % 4;

    const headings = document.querySelectorAll(".heading");
    gsap.to(headings, {
      duration: 1,
      y: `-=${100}%`,
      ease: "power2.inOut",
    });

    gsap.to(spheres.rotation, {
      duration: 1,
      y: `-=${Math.PI / 2}`,
      ease: "power2.inOut",
    });

    if (scrollcount === 0) {
      gsap.to(headings, {
        duration: 1,
        y: 0,
        ease: "power2.inOut",
      });
    }
  }
}

window.addEventListener("wheel", throttledWheelHandler);

const clock = new THREE.Clock();
function animate() {
  window.requestAnimationFrame(animate);
  for (let i = 0; i < spheresMesh.length; i++) {
    let sphere = spheresMesh[i];
    sphere.rotation.y = clock.getElapsedTime() * 0.02;
  }
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
