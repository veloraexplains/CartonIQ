import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BoxColor, BoxArtwork, BoxStyle } from '../../types';
import { Eye, RotateCcw, Box as BoxIcon, Sliders } from 'lucide-react';

interface Box3DViewerProps {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  displayDimensions?: string;
  color: BoxColor;
  artwork: BoxArtwork;
  boxStyle: BoxStyle;
  foldProgress: number; // 0 = open, 1 = closed
  onFoldChange?: (progress: number) => void;
  className?: string;
}

export const Box3DViewer: React.FC<Box3DViewerProps> = ({
  lengthMm,
  widthMm,
  heightMm,
  displayDimensions,
  color,
  artwork,
  boxStyle,
  foldProgress,
  onFoldChange,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [viewPreset, setViewPreset] = useState<'iso' | 'front' | 'top' | 'side'>('iso');

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const boxGroupRef = useRef<THREE.Group | null>(null);
  const flapsRef = useRef<{
    topLeftFlap: THREE.Group | null;
    topRightFlap: THREE.Group | null;
    topFrontFlap: THREE.Group | null;
    topBackFlap: THREE.Group | null;
  }>({
    topLeftFlap: null,
    topRightFlap: null,
    topFrontFlap: null,
    topBackFlap: null,
  });

  // Rotation and interaction control state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.35, y: -0.65 });
  const currentRotationRef = useRef({ x: 0.35, y: -0.65 });
  const targetZoomRef = useRef(1.0);
  const currentZoomRef = useRef(1.0);

  // Helper to generate procedural kraft cardboard texture with artwork
  const generateCardboardTexture = (
    boxColor: BoxColor,
    art: BoxArtwork,
    isFlap: boolean = false
  ): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return new THREE.CanvasTexture(canvas);
    }

    // Base cardboard color
    let baseHex = '#bfa172'; // Natural Kraft
    if (boxColor === 'kraft_golden') baseHex = '#cf9d56';
    if (boxColor === 'bleached_white') baseHex = '#e2e8f0';
    if (boxColor === 'duplex_white') baseHex = '#f8fafc';

    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 1024, 1024);

    // Procedural kraft paper fibers & noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 14;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Subtle corrugated rib lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1.5;
    for (let y = 0; y < 1024; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Crease and fold border indicator
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 1012, 1012);

    // Render artwork if not a plain flap
    if (!isFlap) {
      const printColor = boxColor.includes('white') ? '#1e293b' : (art.brandColor || '#1e293b');
      ctx.fillStyle = printColor;
      ctx.strokeStyle = printColor;

      // 1. Brand Text / Custom Stamp
      if (art.brandText) {
        ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(art.brandText.toUpperCase(), 512, 420);
      }

      // 2. Shipping / Handling Icons
      let iconX = 220;
      const iconY = 620;

      // "This Way Up" Arrows
      if (art.showThisWayUp) {
        ctx.lineWidth = 10;
        ctx.beginPath();
        // Arrow 1
        ctx.moveTo(iconX, iconY + 70);
        ctx.lineTo(iconX, iconY);
        ctx.moveTo(iconX - 25, iconY + 25);
        ctx.lineTo(iconX, iconY);
        ctx.lineTo(iconX + 25, iconY + 25);
        // Arrow 2
        ctx.moveTo(iconX + 60, iconY + 70);
        ctx.lineTo(iconX + 60, iconY);
        ctx.moveTo(iconX + 35, iconY + 25);
        ctx.lineTo(iconX + 60, iconY);
        ctx.lineTo(iconX + 85, iconY + 25);
        // Base bar
        ctx.moveTo(iconX - 35, iconY + 95);
        ctx.lineTo(iconX + 95, iconY + 95);
        ctx.stroke();

        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('THIS WAY UP', iconX + 30, iconY + 130);
        iconX += 190;
      }

      // "Fragile" Wineglass Icon
      if (art.showFragile) {
        ctx.lineWidth = 8;
        ctx.beginPath();
        // Cup
        ctx.arc(iconX + 40, iconY + 20, 36, 0, Math.PI, false);
        ctx.lineTo(iconX + 40, iconY + 70);
        ctx.moveTo(iconX + 15, iconY + 70);
        ctx.lineTo(iconX + 65, iconY + 70);
        ctx.stroke();

        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FRAGILE', iconX + 40, iconY + 130);
        iconX += 190;
      }

      // "Keep Dry" Umbrella Icon
      if (art.showKeepDry) {
        ctx.lineWidth = 8;
        ctx.beginPath();
        // Umbrella dome
        ctx.arc(iconX + 40, iconY + 30, 40, Math.PI, 0, false);
        ctx.closePath();
        ctx.stroke();
        // Stem
        ctx.beginPath();
        ctx.moveTo(iconX + 40, iconY + 30);
        ctx.lineTo(iconX + 40, iconY + 75);
        // Hook
        ctx.arc(iconX + 30, iconY + 75, 10, 0, Math.PI, false);
        ctx.stroke();

        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('KEEP DRY', iconX + 40, iconY + 130);
        iconX += 190;
      }

      // "Recycle" symbol
      if (art.showRecyclable) {
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(iconX + 40, iconY + 35, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RECYCLABLE', iconX + 40, iconY + 130);
        iconX += 190;
      }

      // Barcode / Carton Spec Box
      if (art.showBarcode) {
        const bx = 160;
        const by = 840;
        ctx.lineWidth = 4;
        ctx.strokeRect(bx, by, 704, 90);

        // Barcode lines
        ctx.fillStyle = printColor;
        for (let b = bx + 30; b < bx + 350; b += 8) {
          const w = (b % 16 === 0) ? 5 : 2;
          ctx.fillRect(b, by + 12, w, 50);
        }
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('BOX CODE: CTN-' + Math.round(lengthMm) + 'x' + Math.round(widthMm), bx + 390, by + 45);
        ctx.fillText('QC PASSED • FSC CERTIFIED', bx + 390, by + 70);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  // Re-build 3D Box geometry whenever dimensions or style changes
  const rebuildBoxModel = () => {
    if (!boxGroupRef.current || !sceneRef.current) return;

    // Clear previous children
    while (boxGroupRef.current.children.length > 0) {
      const obj = boxGroupRef.current.children[0];
      boxGroupRef.current.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    // Scale mm dimensions to 3D scene units (normalized so maximum dimension is ~2.2 units)
    const maxDim = Math.max(lengthMm, widthMm, heightMm, 100);
    const scaleFactor = 2.4 / maxDim;

    const L = lengthMm * scaleFactor;
    const W = widthMm * scaleFactor;
    const H = heightMm * scaleFactor;
    const T = 0.025; // Board thickness representation

    const bodyMat = new THREE.MeshStandardMaterial({
      map: generateCardboardTexture(color, artwork, false),
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const flapMat = new THREE.MeshStandardMaterial({
      map: generateCardboardTexture(color, artwork, true),
      roughness: 0.88,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    // 1. Main Tube: 4 vertical panels (Front, Back, Left, Right) & Bottom
    // Front panel (+Z)
    const frontGeom = new THREE.PlaneGeometry(L, H);
    const frontMesh = new THREE.Mesh(frontGeom, bodyMat);
    frontMesh.position.set(0, H / 2, W / 2);
    boxGroupRef.current.add(frontMesh);

    // Back panel (-Z)
    const backGeom = new THREE.PlaneGeometry(L, H);
    const backMesh = new THREE.Mesh(backGeom, bodyMat);
    backMesh.position.set(0, H / 2, -W / 2);
    backMesh.rotation.y = Math.PI;
    boxGroupRef.current.add(backMesh);

    // Right panel (+X)
    const rightGeom = new THREE.PlaneGeometry(W, H);
    const rightMesh = new THREE.Mesh(rightGeom, bodyMat);
    rightMesh.position.set(L / 2, H / 2, 0);
    rightMesh.rotation.y = Math.PI / 2;
    boxGroupRef.current.add(rightMesh);

    // Left panel (-X)
    const leftGeom = new THREE.PlaneGeometry(W, H);
    const leftMesh = new THREE.Mesh(leftGeom, bodyMat);
    leftMesh.position.set(-L / 2, H / 2, 0);
    leftMesh.rotation.y = -Math.PI / 2;
    boxGroupRef.current.add(leftMesh);

    // Base panel (Bottom)
    const bottomGeom = new THREE.PlaneGeometry(L, W);
    const bottomMesh = new THREE.Mesh(bottomGeom, flapMat);
    bottomMesh.position.set(0, 0, 0);
    bottomMesh.rotation.x = Math.PI / 2;
    boxGroupRef.current.add(bottomMesh);

    // 2. Hinged Top Flaps (for RSC FEFCO 0201)
    // Flap depth for RSC is W / 2 so outer flaps meet exactly in the center!
    const flapDepth = W / 2;

    // Top Front Flap (hinges at top edge of front panel: y = H, z = W / 2)
    const topFrontPivot = new THREE.Group();
    topFrontPivot.position.set(0, H, W / 2);
    const tfGeom = new THREE.PlaneGeometry(L, flapDepth);
    const tfMesh = new THREE.Mesh(tfGeom, flapMat);
    tfMesh.position.set(0, flapDepth / 2, 0);
    topFrontPivot.add(tfMesh);
    boxGroupRef.current.add(topFrontPivot);
    flapsRef.current.topFrontFlap = topFrontPivot;

    // Top Back Flap (hinges at y = H, z = -W / 2)
    const topBackPivot = new THREE.Group();
    topBackPivot.position.set(0, H, -W / 2);
    const tbGeom = new THREE.PlaneGeometry(L, flapDepth);
    const tbMesh = new THREE.Mesh(tbGeom, flapMat);
    tbMesh.position.set(0, flapDepth / 2, 0);
    topBackPivot.add(tbMesh);
    boxGroupRef.current.add(topBackPivot);
    flapsRef.current.topBackFlap = topBackPivot;

    // Top Left Flap (hinges at y = H, x = -L / 2)
    const topLeftPivot = new THREE.Group();
    topLeftPivot.position.set(-L / 2, H, 0);
    topLeftPivot.rotation.y = -Math.PI / 2;
    const tlGeom = new THREE.PlaneGeometry(W, flapDepth);
    const tlMesh = new THREE.Mesh(tlGeom, flapMat);
    tlMesh.position.set(0, flapDepth / 2, 0);
    topLeftPivot.add(tlMesh);
    boxGroupRef.current.add(topLeftPivot);
    flapsRef.current.topLeftFlap = topLeftPivot;

    // Top Right Flap (hinges at y = H, x = L / 2)
    const topRightPivot = new THREE.Group();
    topRightPivot.position.set(L / 2, H, 0);
    topRightPivot.rotation.y = Math.PI / 2;
    const trGeom = new THREE.PlaneGeometry(W, flapDepth);
    const trMesh = new THREE.Mesh(trGeom, flapMat);
    trMesh.position.set(0, flapDepth / 2, 0);
    topRightPivot.add(trMesh);
    boxGroupRef.current.add(topRightPivot);
    flapsRef.current.topRightFlap = topRightPivot;

    // 3. Packaging Seam Tape (visible when closed)
    const tapeGeom = new THREE.PlaneGeometry(L * 1.05, 0.08);
    const tapeMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b, // Brown packaging tape
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    const tapeMesh = new THREE.Mesh(tapeGeom, tapeMat);
    tapeMesh.position.set(0, H + 0.005, 0);
    tapeMesh.rotation.x = -Math.PI / 2;
    tapeMesh.name = 'seamTape';
    boxGroupRef.current.add(tapeMesh);

    // Center the whole box group vertically around ground
    boxGroupRef.current.position.y = -H / 2;

    // Apply current fold angles
    updateFlapAngles(foldProgress);
  };

  // Update flap rotations smoothly based on foldProgress (0 to 1)
  const updateFlapAngles = (progress: number) => {
    const { topLeftFlap, topRightFlap, topFrontFlap, topBackFlap } = flapsRef.current;
    if (!topLeftFlap || !topRightFlap || !topFrontFlap || !topBackFlap) return;

    // Folding order:
    // First 0 -> 0.4: Inner left/right flaps fold inward from 0 to 90 degrees
    // Then 0.4 -> 1.0: Outer front/back flaps fold inward over the inner flaps
    const innerAngle = Math.min(1, progress * 2.2) * (Math.PI / 2);
    const outerAngle = Math.max(0, (progress - 0.25) / 0.75) * (Math.PI / 2);

    topLeftFlap.rotation.x = innerAngle;
    topRightFlap.rotation.x = innerAngle;

    topFrontFlap.rotation.x = -outerAngle;
    topBackFlap.rotation.x = outerAngle;

    // Seam tape only visible when fully taped closed (> 0.95)
    if (boxGroupRef.current) {
      const tape = boxGroupRef.current.getObjectByName('seamTape');
      if (tape) {
        tape.visible = progress >= 0.95;
      }
    }
  };

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1120); // Deep premium navy background

    // Subtle horizon fog
    scene.fog = new THREE.FogExp2(0x0a1120, 0.12);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Cool fill light
    const fillLight = new THREE.DirectionalLight(0xcfd8dc, 0.9);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    // Hemisphere sky/ground ambient light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.6);
    scene.add(hemiLight);

    // Ground Contact Shadow plane
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x030712,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.2;
    scene.add(shadowPlane);

    // 5. Box Group
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    boxGroupRef.current = boxGroup;

    // Animation / Render loop with smooth damping
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth rotation damping
      currentRotationRef.current.x = THREE.MathUtils.damp(
        currentRotationRef.current.x,
        targetRotationRef.current.x,
        8,
        0.016
      );
      currentRotationRef.current.y = THREE.MathUtils.damp(
        currentRotationRef.current.y,
        targetRotationRef.current.y,
        8,
        0.016
      );

      // Smooth zoom damping
      currentZoomRef.current = THREE.MathUtils.damp(
        currentZoomRef.current,
        targetZoomRef.current,
        8,
        0.016
      );

      if (boxGroupRef.current) {
        boxGroupRef.current.rotation.x = currentRotationRef.current.x;
        boxGroupRef.current.rotation.y = currentRotationRef.current.y;
        boxGroupRef.current.scale.setScalar(currentZoomRef.current);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Box Geometry on property changes
  useEffect(() => {
    rebuildBoxModel();
  }, [lengthMm, widthMm, heightMm, color, artwork, boxStyle]);

  // Update Flap fold angles when slider moves
  useEffect(() => {
    updateFlapAngles(foldProgress);
  }, [foldProgress]);

  // Pointer / Touch drag controls for orbit rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsInteracting(true);
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    targetRotationRef.current.y += deltaX * 0.008;
    targetRotationRef.current.x = Math.max(
      -Math.PI / 2.2,
      Math.min(Math.PI / 2.2, targetRotationRef.current.x + deltaY * 0.008)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    setIsInteracting(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if pointer capture already lost
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.001;
    targetZoomRef.current = Math.min(2.0, Math.max(0.5, targetZoomRef.current + zoomDelta));
  };

  // View preset switchers
  const setCameraAngle = (preset: 'iso' | 'front' | 'top' | 'side') => {
    setViewPreset(preset);
    if (preset === 'iso') {
      targetRotationRef.current = { x: 0.35, y: -0.65 };
    } else if (preset === 'front') {
      targetRotationRef.current = { x: 0, y: 0 };
    } else if (preset === 'top') {
      targetRotationRef.current = { x: Math.PI / 2, y: 0 };
    } else if (preset === 'side') {
      targetRotationRef.current = { x: 0, y: Math.PI / 2 };
    }
  };

  return (
    <div className={`relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 ${className}`}>
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* Top Left Spec Tag */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-semibold text-amber-400 backdrop-blur-sm shadow-md flex items-center gap-1.5">
          <BoxIcon className="w-3.5 h-3.5" />
          <span>{displayDimensions ? `${boxStyle.replace('_', ' ')} • ${displayDimensions}` : `${boxStyle.replace('_', ' ')} • ${lengthMm} × ${widthMm} × ${heightMm} mm`}</span>
        </div>
      </div>

      {/* Top Right Camera Presets */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-lg backdrop-blur-sm shadow-md text-[10px]">
        {(['iso', 'front', 'top', 'side'] as const).map((preset) => (
          <button
            key={preset}
            onClick={() => setCameraAngle(preset)}
            className={`px-2 py-1 rounded capitalize font-medium transition-all ${
              viewPreset === preset
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {preset}
          </button>
        ))}
        <button
          onClick={() => {
            targetRotationRef.current = { x: 0.35, y: -0.65 };
            targetZoomRef.current = 1.0;
            setViewPreset('iso');
          }}
          className="p-1 text-slate-400 hover:text-white"
          title="Reset View"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Collapsible Bottom Control Dock for Flap Folding */}
      <div className="absolute bottom-3 inset-x-3 max-w-md mx-auto bg-slate-900/95 border border-slate-700/90 rounded-xl p-2.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>RSC Flap Fold Angle:</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-400">
            {foldProgress >= 0.95 ? 'Fully Closed & Taped' : foldProgress <= 0.05 ? 'Fully Open' : `${Math.round(foldProgress * 100)}% Folded`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onFoldChange && onFoldChange(0)}
            className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
          >
            Open
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={foldProgress}
            onChange={(e) => onFoldChange && onFoldChange(parseFloat(e.target.value))}
            className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <button
            onClick={() => onFoldChange && onFoldChange(1)}
            className="text-[10px] text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-medium"
          >
            Taped
          </button>
        </div>
      </div>
    </div>
  );
};
