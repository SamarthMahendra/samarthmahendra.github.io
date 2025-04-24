// 3D Hero Section Animation using Three.js
import * as THREE from 'three';

export function initThreeHero() {
  const canvas = document.getElementById('hero-3d');
  if (!canvas) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 4;

  // Add a glowing, rotating torus knot as hero centerpiece
  const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x90CAF9,
    roughness: 0.2,
    metalness: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    emissive: 0x1976D2,
    emissiveIntensity: 0.3,
    transmission: 0.7,
    thickness: 0.5
  });
  const torusKnot = new THREE.Mesh(geometry, material);
  scene.add(torusKnot);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const point = new THREE.PointLight(0x90CAF9, 1, 100);
  point.position.set(2, 3, 5);
  scene.add(point);

  // Animate
  function animate() {
    requestAnimationFrame(animate);
    torusKnot.rotation.x += 0.008;
    torusKnot.rotation.y += 0.012;
    renderer.render(scene, camera);
  }
  animate();

  // Responsive resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
