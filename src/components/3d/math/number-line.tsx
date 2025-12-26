"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Cylinder, Sphere, Line } from "@react-three/drei";
import type { Group } from "three";

interface NumberLineProps {
  min?: number;
  max?: number;
  step?: number;
  highlightedNumbers?: number[];
  showZero?: boolean;
  interactive?: boolean;
  onNumberClick?: (num: number) => void;
}

export function NumberLine({
  min = -5,
  max = 5,
  step = 1,
  highlightedNumbers = [],
  interactive = true,
  onNumberClick,
}: NumberLineProps) {
  const groupRef = useRef<Group>(null);
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);

  useFrame(() => {
    // Gentle animation can be added here
  });

  const numbers: number[] = [];
  for (let n = min; n <= max; n += step) {
    numbers.push(n);
  }

  const unitScale = 0.5; // Scale factor for visual spacing

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main line */}
      <Line
        points={[
          [min * unitScale - 0.5, 0, 0],
          [max * unitScale + 0.5, 0, 0],
        ]}
        color="#374151"
        lineWidth={3}
      />

      {/* Arrows at ends */}
      <mesh position={[max * unitScale + 0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="#374151" />
      </mesh>
      <mesh position={[min * unitScale - 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshBasicMaterial color="#374151" />
      </mesh>

      {/* Number markers */}
      {numbers.map((num) => {
        const x = num * unitScale;
        const isHighlighted = highlightedNumbers.includes(num);
        const isHovered = hoveredNumber === num;
        const isZero = num === 0;

        return (
          <group key={num} position={[x, 0, 0]}>
            {/* Tick mark */}
            <Cylinder
              args={[0.02, 0.02, isZero ? 0.4 : 0.2, 8]}
              rotation={[0, 0, 0]}
              position={[0, isZero ? 0 : -0.1, 0]}
            >
              <meshBasicMaterial color={isZero ? "#ef4444" : "#6b7280"} />
            </Cylinder>

            {/* Number label */}
            <Text
              position={[0, -0.5, 0]}
              fontSize={isZero ? 0.25 : 0.2}
              color={isZero ? "#ef4444" : isHighlighted ? "#3b82f6" : "#374151"}
              anchorX="center"
              anchorY="top"
              fontWeight={isZero || isHighlighted ? "bold" : "normal"}
            >
              {num}
            </Text>

            {/* Interactive sphere */}
            {interactive && (
              <Sphere
                args={[isHovered ? 0.18 : 0.15, 16, 16]}
                position={[0, 0.3, 0]}
                onPointerOver={() => setHoveredNumber(num)}
                onPointerOut={() => setHoveredNumber(null)}
                onClick={() => onNumberClick?.(num)}
              >
                <meshStandardMaterial
                  color={
                    isHighlighted
                      ? "#3b82f6"
                      : isHovered
                      ? "#60a5fa"
                      : "#d1d5db"
                  }
                  emissive={isHighlighted ? "#3b82f6" : "#000000"}
                  emissiveIntensity={isHighlighted ? 0.3 : 0}
                />
              </Sphere>
            )}

            {/* Highlight ring */}
            {isHighlighted && (
              <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.25, 0.03, 8, 32]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
