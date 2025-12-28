/**
 * 3D Fraction Visualizer
 * Visual representation of fractions using 3D shapes
 */

"use client";

import { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/lib/colors";

interface FractionVisualizerProps {
  numerator: number;
  denominator: number;
  shape?: "circle" | "bar" | "cube";
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  showLabels?: boolean;
}

function CircleFraction({
  numerator,
  denominator,
  size,
  activeColor,
  inactiveColor,
}: {
  numerator: number;
  denominator: number;
  size: number;
  activeColor: string;
  inactiveColor: string;
}) {
  const segments = useMemo(() => {
    const result = [];
    const anglePerSegment = (Math.PI * 2) / denominator;

    for (let i = 0; i < denominator; i++) {
      const isActive = i < numerator;
      const startAngle = i * anglePerSegment - Math.PI / 2;
      const endAngle = (i + 1) * anglePerSegment - Math.PI / 2;

      // Create arc shape
      const arcShape = new THREE.Shape();
      arcShape.moveTo(0, 0);
      arcShape.absarc(0, 0, size, startAngle, endAngle, false);
      arcShape.lineTo(0, 0);

      result.push({
        shape: arcShape,
        isActive,
        key: i,
      });
    }

    return result;
  }, [numerator, denominator, size]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {segments.map((segment) => (
        <mesh key={segment.key} position={[0, 0, 0.1]}>
          <extrudeGeometry
            args={[
              segment.shape,
              {
                depth: 0.2,
                bevelEnabled: false,
              },
            ]}
          />
          <meshStandardMaterial
            color={segment.isActive ? activeColor : inactiveColor}
            transparent
            opacity={segment.isActive ? 1 : 0.3}
          />
        </mesh>
      ))}
      {/* Outline ring */}
      <mesh>
        <ringGeometry args={[size - 0.02, size + 0.02, 64]} />
        <meshBasicMaterial color={colors.three.text} side={THREE.DoubleSide} />
      </mesh>
      {/* Dividing lines */}
      {Array.from({ length: denominator }).map((_, i) => {
        const angle = (i * Math.PI * 2) / denominator - Math.PI / 2;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;
        return (
          <mesh key={i} position={[x / 2, y / 2, 0.15]}>
            <boxGeometry args={[0.02, size, 0.22]} />
            <meshBasicMaterial color={colors.three.text} />
            <group rotation={[0, 0, angle]} />
          </mesh>
        );
      })}
    </group>
  );
}

function BarFraction({
  numerator,
  denominator,
  size,
  activeColor,
  inactiveColor,
}: {
  numerator: number;
  denominator: number;
  size: number;
  activeColor: string;
  inactiveColor: string;
}) {
  const barWidth = size * 2;
  const barHeight = 0.5;
  const segmentWidth = barWidth / denominator;
  const gap = 0.02;

  return (
    <group>
      {Array.from({ length: denominator }).map((_, i) => {
        const isActive = i < numerator;
        const x = -barWidth / 2 + segmentWidth / 2 + i * segmentWidth;

        return (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[segmentWidth - gap, barHeight, 0.3]} />
            <meshStandardMaterial
              color={isActive ? activeColor : inactiveColor}
              transparent
              opacity={isActive ? 1 : 0.3}
            />
          </mesh>
        );
      })}
      {/* Outer frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[barWidth + 0.1, barHeight + 0.1, 0.25]} />
        <meshStandardMaterial color={colors.three.text} wireframe />
      </mesh>
    </group>
  );
}

function CubeFraction({
  numerator,
  denominator,
  size,
  activeColor,
  inactiveColor,
}: {
  numerator: number;
  denominator: number;
  size: number;
  activeColor: string;
  inactiveColor: string;
}) {
  // Arrange cubes in a grid
  const cols = Math.ceil(Math.sqrt(denominator));
  const rows = Math.ceil(denominator / cols);
  const cubeSize = size / Math.max(cols, rows);
  const gap = cubeSize * 0.1;

  return (
    <group>
      {Array.from({ length: denominator }).map((_, i) => {
        const isActive = i < numerator;
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = (col - (cols - 1) / 2) * (cubeSize + gap);
        const y = (row - (rows - 1) / 2) * (cubeSize + gap);

        return (
          <mesh key={i} position={[x, y, 0]}>
            <boxGeometry args={[cubeSize * 0.9, cubeSize * 0.9, cubeSize * 0.9]} />
            <meshStandardMaterial
              color={isActive ? activeColor : inactiveColor}
              transparent
              opacity={isActive ? 1 : 0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function FractionVisualizer({
  numerator,
  denominator,
  shape = "circle",
  size = 1.5,
  activeColor = colors.three.selected,
  inactiveColor = colors.neutral[200],
  showLabels = true,
}: FractionVisualizerProps) {
  // Clamp numerator to be within valid range
  const clampedNumerator = Math.max(0, Math.min(numerator, denominator));

  const FractionShape = () => {
    switch (shape) {
      case "circle":
        return (
          <CircleFraction
            numerator={clampedNumerator}
            denominator={denominator}
            size={size}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
          />
        );
      case "bar":
        return (
          <BarFraction
            numerator={clampedNumerator}
            denominator={denominator}
            size={size}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
          />
        );
      case "cube":
        return (
          <CubeFraction
            numerator={clampedNumerator}
            denominator={denominator}
            size={size * 2}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <group>
      <FractionShape />

      {showLabels && (
        <>
          <Text
            position={[0, -size - 0.8, 0]}
            fontSize={0.5}
            color={colors.three.text}
            anchorX="center"
            anchorY="middle"
          >
            {`${clampedNumerator}/${denominator}`}
          </Text>
          <Text
            position={[0, -size - 1.3, 0]}
            fontSize={0.25}
            color={colors.three.textMuted}
            anchorX="center"
            anchorY="middle"
          >
            {`= ${(clampedNumerator / denominator * 100).toFixed(0)}%`}
          </Text>
        </>
      )}
    </group>
  );
}

export default FractionVisualizer;
