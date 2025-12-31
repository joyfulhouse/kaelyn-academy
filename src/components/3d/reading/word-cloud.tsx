/**
 * 3D Word Cloud Visualization
 * Interactive floating words in 3D space for vocabulary lessons
 *
 * Accessibility: Each word is displayed as 3D text with
 * varying sizes based on importance/frequency
 */

"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/lib/colors";

interface Word {
  text: string;
  weight?: number; // 1-10, affects size
  category?: string;
}

interface WordCloud3DProps {
  words?: Word[];
  animate?: boolean;
  showCategories?: boolean;
  interactive?: boolean;
  onWordClick?: (word: string) => void;
  selectedWord?: string;
}

// Default words for vocabulary practice
const DEFAULT_WORDS: Word[] = [
  { text: "Adventure", weight: 8, category: "noun" },
  { text: "Explore", weight: 7, category: "verb" },
  { text: "Discover", weight: 9, category: "verb" },
  { text: "Journey", weight: 6, category: "noun" },
  { text: "Dream", weight: 8, category: "noun" },
  { text: "Create", weight: 7, category: "verb" },
  { text: "Imagine", weight: 9, category: "verb" },
  { text: "Wonder", weight: 6, category: "noun" },
  { text: "Learn", weight: 10, category: "verb" },
  { text: "Grow", weight: 7, category: "verb" },
  { text: "Friend", weight: 8, category: "noun" },
  { text: "Happy", weight: 6, category: "adjective" },
  { text: "Brave", weight: 7, category: "adjective" },
  { text: "Kind", weight: 8, category: "adjective" },
  { text: "Story", weight: 9, category: "noun" },
];

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  noun: colors.primary.DEFAULT,
  verb: colors.success.DEFAULT,
  adjective: colors.accent.purple,
  adverb: colors.warning.DEFAULT,
  default: colors.neutral[500],
};

interface FloatingWordProps {
  word: Word;
  position: [number, number, number];
  animate: boolean;
  interactive: boolean;
  isSelected: boolean;
  onWordClick?: (word: string) => void;
  showCategory: boolean;
}

function FloatingWord({
  word,
  position,
  animate,
  interactive,
  isSelected,
  onWordClick,
  showCategory,
}: FloatingWordProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate size based on weight
  const fontSize = 0.1 + (word.weight ?? 5) * 0.02;

  // Get color based on category
  const baseColor = CATEGORY_COLORS[word.category ?? "default"] ?? CATEGORY_COLORS.default;
  const color = isSelected
    ? colors.warning.DEFAULT
    : hovered
      ? colors.success.light
      : baseColor;

  // Animation parameters unique to each word
  const animParams = useMemo(() => ({
    speedX: 0.2 + Math.random() * 0.3,
    speedY: 0.3 + Math.random() * 0.2,
    speedZ: 0.15 + Math.random() * 0.25,
    offsetX: Math.random() * Math.PI * 2,
    offsetY: Math.random() * Math.PI * 2,
    offsetZ: Math.random() * Math.PI * 2,
    amplitudeX: 0.1 + Math.random() * 0.1,
    amplitudeY: 0.15 + Math.random() * 0.1,
    amplitudeZ: 0.1 + Math.random() * 0.1,
  }), []);

  useFrame((state) => {
    if (!groupRef.current || !animate) return;

    const time = state.clock.elapsedTime;

    // Floating movement
    groupRef.current.position.x =
      position[0] + Math.sin(time * animParams.speedX + animParams.offsetX) * animParams.amplitudeX;
    groupRef.current.position.y =
      position[1] + Math.sin(time * animParams.speedY + animParams.offsetY) * animParams.amplitudeY;
    groupRef.current.position.z =
      position[2] + Math.sin(time * animParams.speedZ + animParams.offsetZ) * animParams.amplitudeZ;

    // Hover effect
    if (hovered) {
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(
        groupRef.current.scale.x,
        1.2,
        0.1
      ));
    } else {
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(
        groupRef.current.scale.x,
        1,
        0.1
      ));
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          fontSize={fontSize}
          color={color}
          anchorX="center"
          anchorY="middle"
          fontWeight={isSelected || hovered ? "bold" : "normal"}
          onPointerOver={() => interactive && setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => interactive && onWordClick?.(word.text)}
        >
          {word.text}
        </Text>
        {showCategory && word.category && (
          <Text
            position={[0, -fontSize * 1.2, 0]}
            fontSize={fontSize * 0.4}
            color={colors.neutral[400]}
            anchorX="center"
            anchorY="middle"
          >
            ({word.category})
          </Text>
        )}
      </Billboard>
    </group>
  );
}

// Fibonacci sphere distribution for even spacing
function fibonacciSphere(samples: number, radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  const phi = Math.PI * (Math.sqrt(5) - 1); // Golden angle

  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    points.push([
      Math.cos(theta) * radiusAtY * radius,
      y * radius,
      Math.sin(theta) * radiusAtY * radius,
    ]);
  }

  return points;
}

export function WordCloud3D({
  words = DEFAULT_WORDS,
  animate = true,
  showCategories = false,
  interactive = true,
  onWordClick,
  selectedWord,
}: WordCloud3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Generate positions for words
  const wordPositions = useMemo(() => {
    return fibonacciSphere(words.length, 2);
  }, [words.length]);

  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    // Slow rotation of the entire cloud
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group ref={groupRef}>
      {words.map((word, index) => (
        <FloatingWord
          key={`${word.text}-${index}`}
          word={word}
          position={wordPositions[index] ?? [0, 0, 0]}
          animate={animate}
          interactive={interactive}
          isSelected={selectedWord === word.text}
          onWordClick={onWordClick}
          showCategory={showCategories}
        />
      ))}

      {/* Center indicator */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color={colors.neutral[300]}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Legend when showing categories */}
      {showCategories && (
        <group position={[0, -2.5, 0]}>
          <Billboard>
            <Text
              fontSize={0.1}
              color={colors.three.text}
              anchorX="center"
              fontWeight="bold"
            >
              Word Types
            </Text>
          </Billboard>
          {Object.entries(CATEGORY_COLORS).slice(0, 4).map(([category, clr], i) => (
            <group key={category} position={[(i - 1.5) * 1, -0.3, 0]}>
              <Billboard>
                <Text
                  fontSize={0.08}
                  color={clr}
                  anchorX="center"
                >
                  {category}
                </Text>
              </Billboard>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}

export default WordCloud3D;
