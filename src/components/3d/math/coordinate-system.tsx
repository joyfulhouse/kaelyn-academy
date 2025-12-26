/**
 * 3D Coordinate System Visualization
 * Interactive X, Y, Z axis with grid
 */

"use client";

import { useRef } from "react";
import { Line, Text, Grid } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CoordinateSystemProps {
  size?: number;
  showLabels?: boolean;
  showGrid?: boolean;
  animate?: boolean;
}

function AxisArrow({
  direction,
  color,
  label,
  size,
  showLabel,
}: {
  direction: [number, number, number];
  color: string;
  label: string;
  size: number;
  showLabel: boolean;
}) {
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(direction[0] * size, direction[1] * size, direction[2] * size),
  ];

  const labelPosition: [number, number, number] = [
    direction[0] * (size + 0.5),
    direction[1] * (size + 0.5),
    direction[2] * (size + 0.5),
  ];

  return (
    <group>
      <Line points={points} color={color} lineWidth={2} />
      {/* Arrow head */}
      <mesh
        position={[direction[0] * size, direction[1] * size, direction[2] * size]}
        rotation={[
          direction[1] === 1 ? 0 : direction[2] === 1 ? Math.PI / 2 : Math.PI / 2,
          0,
          direction[0] === 1 ? -Math.PI / 2 : 0,
        ]}
      >
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {showLabel && (
        <Text
          position={labelPosition}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function AnimatedPoint({
  animate,
}: {
  animate: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!animate || !meshRef.current) return;
    time.current += delta;
    meshRef.current.position.x = Math.sin(time.current) * 2;
    meshRef.current.position.y = Math.cos(time.current * 1.5) * 2;
    meshRef.current.position.z = Math.sin(time.current * 0.7) * 2;
  });

  return (
    <mesh ref={meshRef} position={[2, 1, 1]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.3} />
    </mesh>
  );
}

export function CoordinateSystem({
  size = 4,
  showLabels = true,
  showGrid = true,
  animate = false,
}: CoordinateSystemProps) {
  return (
    <group>
      {/* Grid */}
      {showGrid && (
        <Grid
          args={[size * 2, size * 2]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6e6e6e"
          sectionSize={size}
          sectionThickness={1}
          sectionColor="#9d9d9d"
          fadeDistance={size * 2}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}

      {/* Axes */}
      <AxisArrow direction={[1, 0, 0]} color="#ef4444" label="X" size={size} showLabel={showLabels} />
      <AxisArrow direction={[0, 1, 0]} color="#22c55e" label="Y" size={size} showLabel={showLabels} />
      <AxisArrow direction={[0, 0, 1]} color="#3b82f6" label="Z" size={size} showLabel={showLabels} />

      {/* Origin marker */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Animated point */}
      <AnimatedPoint animate={animate} />
    </group>
  );
}

export default CoordinateSystem;
