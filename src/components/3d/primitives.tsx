"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Sphere, Cylinder, Cone, Torus } from "@react-three/drei";
import type { Mesh, Group } from "three";

// Animated box that responds to hover/click
interface InteractiveBoxProps {
  position?: [number, number, number];
  size?: [number, number, number];
  color?: string;
  hoverColor?: string;
  onClick?: () => void;
  animate?: boolean;
  label?: string;
}

export function InteractiveBox({
  position = [0, 0, 0],
  size = [1, 1, 1],
  color = "#3b82f6",
  hoverColor = "#60a5fa",
  onClick,
  animate = true,
  label,
}: InteractiveBoxProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current || !animate) return;
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.05;
  });

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={size}
        radius={0.05}
        smoothness={4}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={hovered ? hoverColor : color} />
      </RoundedBox>
      {label && (
        <Text
          position={[0, size[1] / 2 + 0.3, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="bottom"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

// Animated sphere
interface InteractiveSphereProps {
  position?: [number, number, number];
  radius?: number;
  color?: string;
  hoverColor?: string;
  onClick?: () => void;
  animate?: boolean;
  segments?: number;
}

export function InteractiveSphere({
  position = [0, 0, 0],
  radius = 0.5,
  color = "#10b981",
  hoverColor = "#34d399",
  onClick,
  animate = true,
  segments = 32,
}: InteractiveSphereProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current || !animate) return;
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    meshRef.current.scale.setScalar(hovered ? scale * 1.1 : scale);
  });

  return (
    <Sphere
      ref={meshRef}
      args={[radius, segments, segments]}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
      castShadow
    >
      <meshStandardMaterial color={hovered ? hoverColor : color} />
    </Sphere>
  );
}

// Number display for counting
interface NumberDisplayProps {
  value: number;
  position?: [number, number, number];
  color?: string;
  size?: number;
}

export function NumberDisplay({
  value,
  position = [0, 0, 0],
  color = "#ffffff",
  size = 1,
}: NumberDisplayProps) {
  return (
    <Text
      position={position}
      fontSize={size}
      color={color}
      anchorX="center"
      anchorY="middle"
      font="/fonts/Inter-Bold.woff"
    >
      {value.toString()}
    </Text>
  );
}

// Counting objects (for early math)
interface CountingObjectsProps {
  count: number;
  type?: "sphere" | "cube" | "star";
  color?: string;
  spacing?: number;
  position?: [number, number, number];
}

export function CountingObjects({
  count,
  type = "sphere",
  color = "#f59e0b",
  spacing = 0.8,
  position = [0, 0, 0],
}: CountingObjectsProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
  });

  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: count }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = (col - (cols - 1) / 2) * spacing;
        const z = (row - (rows - 1) / 2) * spacing;

        if (type === "sphere") {
          return (
            <Sphere key={i} args={[0.25, 16, 16]} position={[x, 0, z]} castShadow>
              <meshStandardMaterial color={color} />
            </Sphere>
          );
        }

        if (type === "cube") {
          return (
            <RoundedBox key={i} args={[0.4, 0.4, 0.4]} position={[x, 0, z]} radius={0.05} castShadow>
              <meshStandardMaterial color={color} />
            </RoundedBox>
          );
        }

        // Star shape using cone
        return (
          <Cone key={i} args={[0.3, 0.5, 5]} position={[x, 0, z]} castShadow>
            <meshStandardMaterial color={color} />
          </Cone>
        );
      })}
    </group>
  );
}

// Fraction visualizer
interface FractionVisualizerProps {
  numerator: number;
  denominator: number;
  position?: [number, number, number];
  filledColor?: string;
  emptyColor?: string;
}

export function FractionVisualizer({
  numerator,
  denominator,
  position = [0, 0, 0],
  filledColor = "#3b82f6",
  emptyColor = "#e5e7eb",
}: FractionVisualizerProps) {
  const pieces = Array.from({ length: denominator }).map((_, i) => ({
    filled: i < numerator,
    angle: (i / denominator) * Math.PI * 2,
  }));

  return (
    <group position={position}>
      {pieces.map((piece, i) => {
        const innerRadius = 0.3;
        const outerRadius = 1;
        const startAngle = piece.angle;
        const endAngle = ((i + 1) / denominator) * Math.PI * 2;
        const midAngle = (startAngle + endAngle) / 2;
        const x = Math.cos(midAngle) * ((innerRadius + outerRadius) / 2);
        const z = Math.sin(midAngle) * ((innerRadius + outerRadius) / 2);

        return (
          <Cylinder
            key={i}
            args={[0.3, 0.3, 0.2, 32, 1, false, startAngle, (endAngle - startAngle) * 0.95]}
            position={[x, 0, z]}
            rotation={[Math.PI / 2, 0, midAngle]}
          >
            <meshStandardMaterial color={piece.filled ? filledColor : emptyColor} />
          </Cylinder>
        );
      })}
    </group>
  );
}

// Axis helper for coordinate system
interface AxisHelperProps {
  size?: number;
  showLabels?: boolean;
}

export function AxisHelper({ size = 3, showLabels = true }: AxisHelperProps) {
  return (
    <group>
      {/* X axis - Red */}
      <Cylinder args={[0.02, 0.02, size, 8]} position={[size / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshBasicMaterial color="#ef4444" />
      </Cylinder>
      <Cone args={[0.08, 0.2, 8]} position={[size, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <meshBasicMaterial color="#ef4444" />
      </Cone>
      {showLabels && (
        <Text position={[size + 0.3, 0, 0]} fontSize={0.2} color="#ef4444">X</Text>
      )}

      {/* Y axis - Green */}
      <Cylinder args={[0.02, 0.02, size, 8]} position={[0, size / 2, 0]}>
        <meshBasicMaterial color="#22c55e" />
      </Cylinder>
      <Cone args={[0.08, 0.2, 8]} position={[0, size, 0]}>
        <meshBasicMaterial color="#22c55e" />
      </Cone>
      {showLabels && (
        <Text position={[0, size + 0.3, 0]} fontSize={0.2} color="#22c55e">Y</Text>
      )}

      {/* Z axis - Blue */}
      <Cylinder args={[0.02, 0.02, size, 8]} position={[0, 0, size / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#3b82f6" />
      </Cylinder>
      <Cone args={[0.08, 0.2, 8]} position={[0, 0, size]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#3b82f6" />
      </Cone>
      {showLabels && (
        <Text position={[0, 0, size + 0.3]} fontSize={0.2} color="#3b82f6">Z</Text>
      )}
    </group>
  );
}

// Grid floor
interface GridFloorProps {
  size?: number;
  divisions?: number;
  color?: string;
}

export function GridFloor({ size = 10, divisions = 10, color = "#888888" }: GridFloorProps) {
  return (
    <gridHelper args={[size, divisions, color, color]} position={[0, -0.01, 0]} />
  );
}

// Animated ring/torus for highlighting
interface HighlightRingProps {
  position?: [number, number, number];
  color?: string;
  radius?: number;
}

export function HighlightRing({
  position = [0, 0, 0],
  color = "#fbbf24",
  radius = 1,
}: HighlightRingProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = Math.PI / 2;
    meshRef.current.rotation.z = state.clock.elapsedTime;
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <Torus ref={meshRef} args={[radius, 0.05, 16, 32]} position={position}>
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </Torus>
  );
}
