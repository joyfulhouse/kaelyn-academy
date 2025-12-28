"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Sphere, Cylinder, Cone, Torus } from "@react-three/drei";
import type { Mesh } from "three";
import { colors } from "@/lib/colors";

type ShapeType = "cube" | "sphere" | "cylinder" | "cone" | "pyramid" | "torus";

interface ShapeExplorerProps {
  shape: ShapeType;
  color?: string;
  size?: number;
  showProperties?: boolean;
  wireframe?: boolean;
  animate?: boolean;
  onShapeClick?: (shape: ShapeType) => void;
}

const shapeInfo: Record<ShapeType, { name: string; faces: number; edges: number; vertices: number }> = {
  cube: { name: "Cube", faces: 6, edges: 12, vertices: 8 },
  sphere: { name: "Sphere", faces: 0, edges: 0, vertices: 0 }, // Infinite
  cylinder: { name: "Cylinder", faces: 3, edges: 2, vertices: 0 },
  cone: { name: "Cone", faces: 2, edges: 1, vertices: 1 },
  pyramid: { name: "Pyramid", faces: 5, edges: 8, vertices: 5 },
  torus: { name: "Torus", faces: 0, edges: 0, vertices: 0 }, // Surface
};

export function ShapeExplorer({
  shape,
  color = colors.three.default,
  size = 1,
  showProperties = true,
  wireframe = false,
  animate = true,
  onShapeClick,
}: ShapeExplorerProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current || !animate) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    if (hovered) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const info = shapeInfo[shape];

  const renderShape = () => {
    const props = {
      ref: meshRef,
      onPointerOver: () => setHovered(true),
      onPointerOut: () => setHovered(false),
      onClick: () => onShapeClick?.(shape),
      castShadow: true,
      receiveShadow: true,
    };

    const material = (
      <meshStandardMaterial
        color={hovered ? colors.three.hover : color}
        wireframe={wireframe}
        metalness={0.1}
        roughness={0.5}
      />
    );

    switch (shape) {
      case "cube":
        return (
          <RoundedBox {...props} args={[size, size, size]} radius={0.02}>
            {material}
          </RoundedBox>
        );
      case "sphere":
        return (
          <Sphere {...props} args={[size / 2, 32, 32]}>
            {material}
          </Sphere>
        );
      case "cylinder":
        return (
          <Cylinder {...props} args={[size / 2, size / 2, size, 32]}>
            {material}
          </Cylinder>
        );
      case "cone":
        return (
          <Cone {...props} args={[size / 2, size, 32]}>
            {material}
          </Cone>
        );
      case "pyramid":
        return (
          <Cone {...props} args={[size / 2, size, 4]}>
            {material}
          </Cone>
        );
      case "torus":
        return (
          <Torus {...props} args={[size / 2, size / 6, 16, 32]}>
            {material}
          </Torus>
        );
    }
  };

  return (
    <group>
      {renderShape()}

      {showProperties && (
        <group position={[0, -size - 0.5, 0]}>
          <Text
            fontSize={0.2}
            color={colors.three.text}
            anchorX="center"
            anchorY="top"
            fontWeight="bold"
          >
            {info.name}
          </Text>
          {info.faces > 0 && (
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.12}
              color={colors.three.textMuted}
              anchorX="center"
              anchorY="top"
            >
              {`Faces: ${info.faces} | Edges: ${info.edges} | Vertices: ${info.vertices}`}
            </Text>
          )}
        </group>
      )}
    </group>
  );
}

// Multi-shape gallery for comparison
interface ShapeGalleryProps {
  shapes?: ShapeType[];
  selectedShape?: ShapeType;
  onSelect?: (shape: ShapeType) => void;
}

export function ShapeGallery({
  shapes = ["cube", "sphere", "cylinder", "cone", "pyramid", "torus"],
  selectedShape,
  onSelect,
}: ShapeGalleryProps) {
  const spacing = 2;
  const cols = 3;

  return (
    <group>
      {shapes.map((shape, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = (col - (cols - 1) / 2) * spacing;
        const z = (row - (Math.ceil(shapes.length / cols) - 1) / 2) * spacing;

        return (
          <group key={shape} position={[x, 0, z]}>
            <ShapeExplorer
              shape={shape}
              size={0.8}
              color={selectedShape === shape ? colors.three.selected : colors.three.default}
              onShapeClick={onSelect}
              showProperties={true}
            />
          </group>
        );
      })}
    </group>
  );
}
