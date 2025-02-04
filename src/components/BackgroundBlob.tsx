import type { Mesh } from 'three';
import { useGSAP } from '@gsap/react';
import { Canvas, useFrame } from '@react-three/fiber';
import alea from 'alea';
import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import useEvent from 'react-use/lib/useEvent';
import useWindowSize from 'react-use/lib/useWindowSize';
import { createNoise3D } from 'simplex-noise';
import * as THREE from 'three';

type IcosahedronMeshPropType = {
  vectorMouse: {
    x: number;
    y: number;
  };
};

gsap.registerPlugin(useGSAP);

const IcosahedronMesh = (props: IcosahedronMeshPropType) => {
  const { vectorMouse } = props;
  const mesh = useRef<Mesh>(null!);
  const noise3D = useRef(createNoise3D(alea('seed'))).current;

  const setGeoAttribute = () => {
    const { geometry } = mesh.current;
    const { position } = geometry.attributes;
    if (!position) {
      return;
    }
    geometry.setAttribute('basePosition', new THREE.BufferAttribute((position as THREE.BufferAttribute).array, position.itemSize).copy(position as THREE.BufferAttribute));
  };

  const updateVertices = (a: number) => {
    const { geometry } = mesh.current;
    const { position } = geometry.attributes;
    const { basePosition } = geometry.attributes;
    const vertex = new THREE.Vector3();

    if (!position || !basePosition) {
      return;
    }
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(basePosition, i);
      const simplex = noise3D(
        (vertex.x * 0.006) + (a * 0.0002),
        (vertex.y * 0.006) + (a * 0.0003),
        (vertex.z * 0.006),
      );
      const ratio = ((simplex * 0.4 * (vectorMouse.y + 0.1)) + 0.8);
      vertex.multiplyScalar(ratio);
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    position.needsUpdate = true;
  };

  useLayoutEffect(() => setGeoAttribute(), []);
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    updateVertices(time * 400);
  });

  return (
    <mesh
      ref={mesh}
    >
      <icosahedronGeometry
        args={[120, 8]}
      />
      <meshPhongMaterial
        emissive={0x000000}
        emissiveIntensity={0.4}
        shininess={0}
      />
    </mesh>
  );
};

export default function BackgroundBlob() {
  const refCanvas = useRef(null!);
  const mouse = useRef(new THREE.Vector2(0.8, 0.5)).current;
  const xTo = useRef<gsap.QuickToFunc>(null!);
  const yTo = useRef<gsap.QuickToFunc>(null!);
  const { width, height } = useWindowSize();

  const { contextSafe } = useGSAP(() => {
    xTo.current = gsap.quickTo(mouse, 'x', { duration: 0.8, ease: 'power1.out' });
    yTo.current = gsap.quickTo(mouse, 'y', { duration: 0.8, ease: 'power1.out' });
  }, { scope: refCanvas });

  const onMouseMove = contextSafe((e: MouseEvent) => {
    xTo.current(e.clientX / width);
    yTo.current(e.clientY / height);
  });

  useEvent('mousemove', e => onMouseMove(e as MouseEvent), window);

  return (
    <div className="h-full">
      <Canvas
        ref={refCanvas}
        camera={{ fov: 100, near: 0.1, far: 1000, position: [120, 0, 300] }}
      >
        <hemisphereLight
          color={0xFFFFFF}
          groundColor={0x000000}
          intensity={0.6}
        />
        <directionalLight
          color={0xFFFFFF}
          intensity={0.5}
          position={[200, 3000, 400]}
        />
        <directionalLight
          color={0xFFFFFF}
          intensity={0.5}
          position={[-200, 3000, 400]}
        />
        <IcosahedronMesh
          vectorMouse={mouse}
        />
      </Canvas>
    </div>
  );
}
