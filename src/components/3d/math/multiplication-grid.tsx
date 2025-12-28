"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import { colors } from "@/lib/colors";

interface MultiplicationGridProps {
  factor1: number;
  factor2: number;
  showProduct?: boolean;
  animated?: boolean;
  cellSize?: number;
  cellColor?: string;
  highlightColor?: string;
}

export function MultiplicationGrid({
  factor1,
  factor2,
  showProduct = true,
  animated = true,
  cellSize = 0.4,
  cellColor = colors.three.default,
  highlightColor = colors.three.selected,
}: MultiplicationGridProps) {
  const groupRef = useRef<Group>(null);
  const [animatedCount, setAnimatedCount] = useState(animated ? 0 : factor1 * factor2);

  useFrame((state) => {
    if (!animated || animatedCount >= factor1 * factor2) return;

    // Animate cells appearing one by one
    const targetCount = Math.floor(state.clock.elapsedTime * 3);
    if (targetCount > animatedCount && animatedCount < factor1 * factor2) {
      setAnimatedCount(Math.min(targetCount, factor1 * factor2));
    }
  });

  const product = factor1 * factor2;
  const spacing = cellSize * 1.2;
  const offsetX = ((factor1 - 1) * spacing) / 2;
  const offsetZ = ((factor2 - 1) * spacing) / 2;

  return (
    <group ref={groupRef}>
      {/* Grid of cubes */}
      {Array.from({ length: factor1 }).map((_, i) =>
        Array.from({ length: factor2 }).map((_, j) => {
          const index = i * factor2 + j;
          const isVisible = index < animatedCount;
          const x = i * spacing - offsetX;
          const z = j * spacing - offsetZ;

          return (
            <RoundedBox
              key={`${i}-${j}`}
              args={[cellSize, cellSize, cellSize]}
              position={[x, isVisible ? 0 : -1, z]}
              radius={0.02}
              castShadow
            >
              <meshStandardMaterial
                color={isVisible ? cellColor : colors.three.disabled}
                transparent={!isVisible}
                opacity={isVisible ? 1 : 0}
              />
            </RoundedBox>
          );
        })
      )}

      {/* Row label */}
      <Text
        position={[-offsetX - spacing, 0, 0]}
        fontSize={0.3}
        color={colors.three.text}
        anchorX="right"
        anchorY="middle"
      >
        {factor1}
      </Text>

      {/* Column label */}
      <Text
        position={[0, 0, offsetZ + spacing]}
        fontSize={0.3}
        color={colors.three.text}
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {factor2}
      </Text>

      {/* Multiplication sign */}
      <Text
        position={[-offsetX - spacing * 1.5, 0, offsetZ + spacing]}
        fontSize={0.25}
        color={colors.three.textMuted}
        anchorX="center"
        anchorY="middle"
      >
        ×
      </Text>

      {/* Product display */}
      {showProduct && (
        <group position={[0, cellSize + 0.5, 0]}>
          <Text
            fontSize={0.4}
            color={animatedCount >= product ? highlightColor : colors.neutral[400]}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {`${factor1} × ${factor2} = ${animatedCount >= product ? product : "?"}`}
          </Text>
        </group>
      )}
    </group>
  );
}

// Interactive multiplication table
interface MultiplicationTableProps {
  maxFactor?: number;
  highlightedPair?: [number, number];
  onCellClick?: (factor1: number, factor2: number) => void;
}

export function MultiplicationTable({
  maxFactor = 5,
  highlightedPair,
  onCellClick,
}: MultiplicationTableProps) {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  const cellSize = 0.5;
  const spacing = cellSize * 1.3;

  return (
    <group position={[0, 0, 0]}>
      {/* Header row (1 to maxFactor) */}
      {Array.from({ length: maxFactor }, (_, i) => (
        <Text
          key={`header-${i + 1}`}
          position={[(i + 1) * spacing - (maxFactor * spacing) / 2, 0, -spacing]}
          fontSize={0.25}
          color={colors.three.textMuted}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {i + 1}
        </Text>
      ))}

      {/* Header column */}
      {Array.from({ length: maxFactor }, (_, i) => (
        <Text
          key={`col-header-${i + 1}`}
          position={[-spacing, 0, i * spacing - ((maxFactor - 1) * spacing) / 2]}
          fontSize={0.25}
          color={colors.three.textMuted}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {i + 1}
        </Text>
      ))}

      {/* Grid cells */}
      {Array.from({ length: maxFactor }, (_, i) =>
        Array.from({ length: maxFactor }, (__, j) => {
          const factor1 = i + 1;
          const factor2 = j + 1;
          const product = factor1 * factor2;
          const isHighlighted = highlightedPair?.[0] === factor1 && highlightedPair?.[1] === factor2;
          const isHovered = hoveredCell?.[0] === factor1 && hoveredCell?.[1] === factor2;

          const x = factor2 * spacing - (maxFactor * spacing) / 2;
          const z = i * spacing - ((maxFactor - 1) * spacing) / 2;

          return (
            <group key={`${factor1}-${factor2}`} position={[x, 0, z]}>
              <RoundedBox
                args={[cellSize, 0.15, cellSize]}
                radius={0.02}
                onPointerOver={() => setHoveredCell([factor1, factor2])}
                onPointerOut={() => setHoveredCell(null)}
                onClick={() => onCellClick?.(factor1, factor2)}
              >
                <meshStandardMaterial
                  color={
                    isHighlighted
                      ? colors.three.selected
                      : isHovered
                      ? colors.three.hover
                      : colors.neutral[200]
                  }
                />
              </RoundedBox>
              <Text
                position={[0, 0.1, 0]}
                fontSize={0.18}
                color={isHighlighted || isHovered ? "#ffffff" : colors.neutral[700]}
                anchorX="center"
                anchorY="middle"
              >
                {product}
              </Text>
            </group>
          );
        })
      )}
    </group>
  );
}
