/**
 * 3D Geometric Shapes Visualization
 * Interactive visualization of geometric shapes and their properties
 */

"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Edges } from "@react-three/drei";
import * as THREE from "three";

export type ShapeType = "cube" | "sphere" | "cylinder" | "cone" | "pyramid" | "torus";

interface GeometricShapesProps {
  shape?: ShapeType;
  size?: number;
  color?: string;
  wireframe?: boolean;
  showDimensions?: boolean;
  animate?: boolean;
  showEdges?: boolean;
}

interface ShapeInfo {
  volume: string;
  surfaceArea: string;
  vertices: number;
  edges: number;
  faces: number;
}

function getShapeInfo(shape: ShapeType, size: number): ShapeInfo {
  const r = size / 2;
  const pi = Math.PI;

  switch (shape) {
    case "cube":
      return {
        volume: `${size ** 3}`,
        surfaceArea: `${6 * size ** 2}`,
        vertices: 8,
        edges: 12,
        faces: 6,
      };
    case "sphere":
      return {
        volume: `${((4 / 3) * pi * r ** 3).toFixed(2)}`,
        surfaceArea: `${(4 * pi * r ** 2).toFixed(2)}`,
        vertices: 0,
        edges: 0,
        faces: 1,
      };
    case "cylinder":
      return {
        volume: `${(pi * r ** 2 * size).toFixed(2)}`,
        surfaceArea: `${(2 * pi * r * (r + size)).toFixed(2)}`,
        vertices: 0,
        edges: 2,
        faces: 3,
      };
    case "cone":
      const slant = Math.sqrt(r ** 2 + size ** 2);
      return {
        volume: `${((1 / 3) * pi * r ** 2 * size).toFixed(2)}`,
        surfaceArea: `${(pi * r * (r + slant)).toFixed(2)}`,
        vertices: 1,
        edges: 1,
        faces: 2,
      };
    case "pyramid":
      return {
        volume: `${((1 / 3) * size ** 2 * size).toFixed(2)}`,
        surfaceArea: `${(size ** 2 + 2 * size * Math.sqrt((size / 2) ** 2 + size ** 2)).toFixed(2)}`,
        vertices: 5,
        edges: 8,
        faces: 5,
      };
    case "torus":
      const R = size / 2; // major radius
      const rr = size / 4; // minor radius
      return {
        volume: `${(2 * pi ** 2 * R * rr ** 2).toFixed(2)}`,
        surfaceArea: `${(4 * pi ** 2 * R * rr).toFixed(2)}`,
        vertices: 0,
        edges: 0,
        faces: 1,
      };
    default:
      return { volume: "0", surfaceArea: "0", vertices: 0, edges: 0, faces: 0 };
  }
}

function ShapeMesh({
  shape,
  size,
  color,
  wireframe,
  showEdges,
  animate,
}: {
  shape: ShapeType;
  size: number;
  color: string;
  wireframe: boolean;
  showEdges: boolean;
  animate: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!animate || !meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.5;
    meshRef.current.rotation.x += delta * 0.2;
  });

  const getGeometry = () => {
    switch (shape) {
      case "cube":
        return <boxGeometry args={[size, size, size]} />;
      case "sphere":
        return <sphereGeometry args={[size / 2, 32, 32]} />;
      case "cylinder":
        return <cylinderGeometry args={[size / 2, size / 2, size, 32]} />;
      case "cone":
        return <coneGeometry args={[size / 2, size, 32]} />;
      case "pyramid":
        return <coneGeometry args={[size / 2, size, 4]} />;
      case "torus":
        return <torusGeometry args={[size / 2, size / 4, 16, 32]} />;
      default:
        return <boxGeometry args={[size, size, size]} />;
    }
  };

  return (
    <mesh ref={meshRef}>
      {getGeometry()}
      <meshStandardMaterial
        color={color}
        wireframe={wireframe}
        transparent
        opacity={wireframe ? 1 : 0.8}
        side={THREE.DoubleSide}
      />
      {showEdges && !wireframe && <Edges color="#000000" threshold={15} />}
    </mesh>
  );
}

export function GeometricShapes({
  shape = "cube",
  size = 2,
  color = "#3b82f6",
  wireframe = false,
  showDimensions = true,
  animate = false,
  showEdges = true,
}: GeometricShapesProps) {
  const [hovered, setHovered] = useState(false);
  const info = getShapeInfo(shape, size);

  return (
    <group>
      <group
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <ShapeMesh
          shape={shape}
          size={size}
          color={hovered ? "#ef4444" : color}
          wireframe={wireframe}
          showEdges={showEdges}
          animate={animate}
        />
      </group>

      {showDimensions && (
        <>
          {/* Info panel */}
          <Text
            position={[0, -size - 0.5, 0]}
            fontSize={0.25}
            color="#666666"
            anchorX="center"
            anchorY="top"
          >
            {`Volume: ${info.volume} | Surface: ${info.surfaceArea}`}
          </Text>
          <Text
            position={[0, -size - 0.9, 0]}
            fontSize={0.2}
            color="#888888"
            anchorX="center"
            anchorY="top"
          >
            {`V: ${info.vertices} | E: ${info.edges} | F: ${info.faces}`}
          </Text>
        </>
      )}
    </group>
  );
}

export default GeometricShapes;
