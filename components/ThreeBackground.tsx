// components/ThreeBackground.tsx
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Edges, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function CyberpunkObject() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.1;
      meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.2;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.3;
      innerRef.current.rotation.z = t * 0.2;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group>
        {/* Outer wireframe octahedron */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.6, 0]} />
          <meshStandardMaterial
            color="#00f0ff"
            wireframe
            transparent
            opacity={0.3}
          />
          <Edges color="#00f0ff" threshold={1} />
        </mesh>

        {/* Inner solid core */}
        <mesh ref={innerRef} scale={0.5}>
          <octahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#110022"
            emissive="#ff003c"
            emissiveIntensity={1.5}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* Orbital rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.01, 16, 100]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={2}
          />
        </mesh>

        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[2.5, 0.005, 16, 100]} />
          <meshStandardMaterial
            color="#ff003c"
            emissive="#ff003c"
            emissiveIntensity={1}
          />
        </mesh>
      </group>
    </Float>
  );
}

function GridFloor() {
  return (
    <gridHelper
      args={[100, 50, "#220044", "#110022"]}
      position={[0, -5, 0]}
    />
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10" style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} color="#ff003c" intensity={2} distance={10} />
        <pointLight position={[5, 5, 5]} color="#00f0ff" intensity={1} />
        <pointLight position={[-5, -5, -5]} color="#bc13fe" intensity={0.5} />

        <CyberpunkObject />
        <GridFloor />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
        />

        {/* Fog for depth */}
        <fog attach="fog" args={["#000000", 8, 25]} />
      </Canvas>
    </div>
  );
}
