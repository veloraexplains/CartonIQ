import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type Box3DProps = {
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  style?: 'solid' | 'corrugated' | 'wireframe';
};

export default function Box3D({
  width = 500,
  height = 350,
  depth = 220,
  color = '#f59e0b',
  style = 'corrugated',
}: Box3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20000);
    camera.position.set(380, 260, 460);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111827, 1.1);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(260, 420, 250);
    scene.add(dirLight);

    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const boxGeometry = new THREE.BoxGeometry(width * 0.01, height * 0.01, depth * 0.01);

    const material =
      style === 'wireframe'
        ? new THREE.MeshBasicMaterial({ color, wireframe: true })
        : new THREE.MeshStandardMaterial({
            color,
            roughness: style === 'corrugated' ? 0.9 : 0.48,
            metalness: 0.05,
          });

    const box = new THREE.Mesh(boxGeometry, material);
    boxGroup.add(box);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeometry),
      new THREE.LineBasicMaterial({ color: 0x111827, transparent: true, opacity: 0.9 })
    );
    boxGroup.add(edges);

    const planeGeometry = new THREE.PlaneGeometry(1200, 1200);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      transparent: true,
      opacity: 0.08,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -height * 0.012 - 40;
    scene.add(plane);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 250;
    controls.maxDistance = 1200;
    controls.target.set(0, 0, 0);

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const widthPx = Math.max(rect.width, 280);
      const heightPx = Math.max(rect.height, 320);
      renderer.setSize(widthPx, heightPx, false);
      camera.aspect = widthPx / heightPx;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    renderer.setAnimationLoop(() => {
      boxGroup.rotation.y += 0.006;
      boxGroup.rotation.x = 0.25;
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      controls.dispose();
      boxGeometry.dispose();
      material.dispose();
      planeGeometry.dispose();
      planeMaterial.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [width, height, depth, color, style]);

  return <div ref={mountRef} className="h-[420px] w-full overflow-hidden rounded-3xl bg-slate-950" />;
}
