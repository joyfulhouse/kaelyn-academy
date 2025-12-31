"use client";

import { useRef, useState, useMemo, useCallback } from "react";
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

  // Memoize grid layout calculations
  const { spacing, offsetX, offsetZ, gridCells } = useMemo(() => {
    const sp = cellSize * 1.2;
    const offX = ((factor1 - 1) * sp) / 2;
    const offZ = ((factor2 - 1) * sp) / 2;

    // Pre-compute cell positions
    const cells = Array.from({ length: factor1 }).flatMap((_, i) =>
      Array.from({ length: factor2 }).map((_, j) => ({
        i,
        j,
        index: i * factor2 + j,
        x: i * sp - offX,
        z: j * sp - offZ,
      }))
    );

    return { spacing: sp, offsetX: offX, offsetZ: offZ, gridCells: cells };
  }, [factor1, factor2, cellSize]);

  return (
    <group ref={groupRef}>
      {/* Grid of cubes (using memoized cell positions) */}
      {gridCells.map((cell) => {
        const isVisible = cell.index < animatedCount;

        return (
          <RoundedBox
            key={`${cell.i}-${cell.j}`}
            args={[cellSize, cellSize, cellSize]}
            position={[cell.x, isVisible ? 0 : -1, cell.z]}
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
      })}

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

  // Memoize hover handlers to prevent new function creation on each render
  const handlePointerOver = useCallback(
    (factor1: number, factor2: number) => setHoveredCell([factor1, factor2]),
    []
  );
  const handlePointerOut = useCallback(() => setHoveredCell(null), []);

  // Memoize grid cell data
  const { headers, columnHeaders, gridCells } = useMemo(() => {
    const h = Array.from({ length: maxFactor }, (_, i) => ({
      index: i + 1,
      x: (i + 1) * spacing - (maxFactor * spacing) / 2,
    }));
    const ch = Array.from({ length: maxFactor }, (_, i) => ({
      index: i + 1,
      z: i * spacing - ((maxFactor - 1) * spacing) / 2,
    }));
    const cells = Array.from({ length: maxFactor }).flatMap((_, i) =>
      Array.from({ length: maxFactor }, (__, j) => {
        const f1 = i + 1;
        const f2 = j + 1;
        return {
          factor1: f1,
          factor2: f2,
          product: f1 * f2,
          x: f2 * spacing - (maxFactor * spacing) / 2,
          z: i * spacing - ((maxFactor - 1) * spacing) / 2,
        };
      })
    );
    return { headers: h, columnHeaders: ch, gridCells: cells };
  }, [maxFactor, spacing]);

  return (
    <group position={[0, 0, 0]}>
      {/* Header row (1 to maxFactor) */}
      {headers.map((h) => (
        <Text
          key={`header-${h.index}`}
          position={[h.x, 0, -spacing]}
          fontSize={0.25}
          color={colors.three.textMuted}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {h.index}
        </Text>
      ))}

      {/* Header column */}
      {columnHeaders.map((ch) => (
        <Text
          key={`col-header-${ch.index}`}
          position={[-spacing, 0, ch.z]}
          fontSize={0.25}
          color={colors.three.textMuted}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {ch.index}
        </Text>
      ))}

      {/* Grid cells (using memoized data) */}
      {gridCells.map((cell) => {
        const isHighlighted = highlightedPair?.[0] === cell.factor1 && highlightedPair?.[1] === cell.factor2;
        const isHovered = hoveredCell?.[0] === cell.factor1 && hoveredCell?.[1] === cell.factor2;

        return (
          <group key={`${cell.factor1}-${cell.factor2}`} position={[cell.x, 0, cell.z]}>
            <RoundedBox
              args={[cellSize, 0.15, cellSize]}
              radius={0.02}
              onPointerOver={() => handlePointerOver(cell.factor1, cell.factor2)}
              onPointerOut={handlePointerOut}
              onClick={() => onCellClick?.(cell.factor1, cell.factor2)}
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
              {cell.product}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
