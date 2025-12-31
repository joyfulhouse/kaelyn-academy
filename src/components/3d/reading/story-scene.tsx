/**
 * 3D Story Scene Visualization
 * Interactive scene representing story elements and settings
 *
 * Accessibility: Visual representation of story settings with
 * labeled elements for comprehension lessons
 */

"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Sphere, Cylinder, Cone, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/lib/colors";

type SceneType = "forest" | "city" | "ocean" | "space" | "home" | "school";
type TimeOfDay = "day" | "night" | "sunset";

interface StorySceneProps {
  sceneType?: SceneType;
  timeOfDay?: TimeOfDay;
  characters?: string[];
  showLabels?: boolean;
  animate?: boolean;
  onElementClick?: (element: string) => void;
  highlightedElement?: string;
}

// Scene element configurations
interface SceneElement {
  name: string;
  position: [number, number, number];
  type: "tree" | "building" | "character" | "sun" | "moon" | "cloud" | "water" | "house" | "star" | "desk";
  scale?: number;
  color?: string;
}

// Tree component
function Tree({
  position,
  scale = 1,
  label,
  showLabel,
  isHighlighted,
  onClick,
}: {
  position: [number, number, number];
  scale?: number;
  label?: string;
  showLabel?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Gentle swaying animation
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.02;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Trunk */}
      <Cylinder args={[0.08, 0.12, 0.8]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color={colors.warning.dark} />
      </Cylinder>
      {/* Foliage */}
      <Cone args={[0.4, 0.8, 8]} position={[0, 1.2, 0]}>
        <meshStandardMaterial
          color={isHighlighted || hovered ? colors.success.light : colors.success.DEFAULT}
        />
      </Cone>
      <Cone args={[0.35, 0.7, 8]} position={[0, 1.6, 0]}>
        <meshStandardMaterial
          color={isHighlighted || hovered ? colors.success.light : colors.success.dark}
        />
      </Cone>
      {showLabel && label && (
        <Billboard position={[0, 2.3, 0]}>
          <Text fontSize={0.12} color={colors.three.text} anchorX="center">
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

// Building component
function Building({
  position,
  scale = 1,
  color = colors.neutral[400],
  label,
  showLabel,
  isHighlighted,
  onClick,
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  label?: string;
  showLabel?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Main building */}
      <RoundedBox args={[0.8, 1.5, 0.6]} position={[0, 0.75, 0]} radius={0.02}>
        <meshStandardMaterial
          color={isHighlighted || hovered ? colors.primary.light : color}
        />
      </RoundedBox>
      {/* Windows */}
      {[0.9, 0.5, 0.1].map((y, i) => (
        <group key={i} position={[0, y + 0.1, 0.31]}>
          <RoundedBox args={[0.15, 0.18, 0.02]} position={[-0.2, 0, 0]} radius={0.01}>
            <meshStandardMaterial color={colors.warning.muted} emissive={colors.warning.light} emissiveIntensity={0.3} />
          </RoundedBox>
          <RoundedBox args={[0.15, 0.18, 0.02]} position={[0.2, 0, 0]} radius={0.01}>
            <meshStandardMaterial color={colors.warning.muted} emissive={colors.warning.light} emissiveIntensity={0.3} />
          </RoundedBox>
        </group>
      ))}
      {showLabel && label && (
        <Billboard position={[0, 1.8, 0]}>
          <Text fontSize={0.12} color={colors.three.text} anchorX="center">
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

// House component
function House({
  position,
  scale = 1,
  label,
  showLabel,
  isHighlighted,
  onClick,
}: {
  position: [number, number, number];
  scale?: number;
  label?: string;
  showLabel?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Main body */}
      <RoundedBox args={[1, 0.7, 0.8]} position={[0, 0.35, 0]} radius={0.02}>
        <meshStandardMaterial
          color={isHighlighted || hovered ? colors.warning.light : colors.warning.muted}
        />
      </RoundedBox>
      {/* Roof */}
      <mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.9, 0.5, 4]} />
        <meshStandardMaterial color={colors.destructive.dark} />
      </mesh>
      {/* Door */}
      <RoundedBox args={[0.2, 0.35, 0.02]} position={[0, 0.2, 0.41]} radius={0.02}>
        <meshStandardMaterial color={colors.warning.dark} />
      </RoundedBox>
      {/* Windows */}
      <RoundedBox args={[0.15, 0.15, 0.02]} position={[-0.3, 0.4, 0.41]} radius={0.01}>
        <meshStandardMaterial color={colors.primary.muted} />
      </RoundedBox>
      <RoundedBox args={[0.15, 0.15, 0.02]} position={[0.3, 0.4, 0.41]} radius={0.01}>
        <meshStandardMaterial color={colors.primary.muted} />
      </RoundedBox>
      {showLabel && label && (
        <Billboard position={[0, 1.4, 0]}>
          <Text fontSize={0.12} color={colors.three.text} anchorX="center">
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

// Character component (simple stick figure representation)
function Character({
  position,
  name,
  color = colors.primary.DEFAULT,
  showLabel,
  isHighlighted,
  onClick,
  animate = true,
}: {
  position: [number, number, number];
  name: string;
  color?: string;
  showLabel?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
  animate?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    // Subtle bobbing animation
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.03;
  });

  const displayColor = isHighlighted || hovered ? colors.warning.DEFAULT : color;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Head */}
      <Sphere args={[0.12, 16, 16]} position={[0, 0.55, 0]}>
        <meshStandardMaterial color={displayColor} />
      </Sphere>
      {/* Body */}
      <Cylinder args={[0.08, 0.1, 0.35]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color={displayColor} />
      </Cylinder>
      {/* Arms */}
      <Cylinder args={[0.03, 0.03, 0.25]} position={[-0.15, 0.3, 0]} rotation={[0, 0, Math.PI / 3]}>
        <meshStandardMaterial color={displayColor} />
      </Cylinder>
      <Cylinder args={[0.03, 0.03, 0.25]} position={[0.15, 0.3, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <meshStandardMaterial color={displayColor} />
      </Cylinder>
      {/* Legs */}
      <Cylinder args={[0.04, 0.04, 0.25]} position={[-0.06, 0, 0]} rotation={[0.1, 0, 0]}>
        <meshStandardMaterial color={displayColor} />
      </Cylinder>
      <Cylinder args={[0.04, 0.04, 0.25]} position={[0.06, 0, 0]} rotation={[-0.1, 0, 0]}>
        <meshStandardMaterial color={displayColor} />
      </Cylinder>
      {showLabel && (
        <Billboard position={[0, 0.85, 0]}>
          <Text fontSize={0.1} color={colors.three.text} anchorX="center" fontWeight="bold">
            {name}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

// Cloud component
function Cloud({
  position,
  animate = true,
}: {
  position: [number, number, number];
  animate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    groupRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
  });

  return (
    <group ref={groupRef} position={position}>
      <Sphere args={[0.3, 16, 16]} position={[-0.25, 0, 0]}>
        <meshStandardMaterial color="white" transparent opacity={0.9} />
      </Sphere>
      <Sphere args={[0.4, 16, 16]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="white" transparent opacity={0.9} />
      </Sphere>
      <Sphere args={[0.3, 16, 16]} position={[0.25, 0, 0]}>
        <meshStandardMaterial color="white" transparent opacity={0.9} />
      </Sphere>
    </group>
  );
}

// Sun/Moon component
function CelestialBody({
  type,
  position,
  animate = true,
}: {
  type: "sun" | "moon";
  position: [number, number, number];
  animate?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !animate) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  const isSun = type === "sun";

  return (
    <Sphere ref={meshRef} args={[0.4, 32, 32]} position={position}>
      <meshStandardMaterial
        color={isSun ? colors.warning.light : colors.neutral[200]}
        emissive={isSun ? colors.warning.DEFAULT : colors.neutral[400]}
        emissiveIntensity={isSun ? 0.5 : 0.2}
      />
    </Sphere>
  );
}

// Ground component
function Ground({ sceneType }: { sceneType: SceneType }) {
  const groundColor = useMemo(() => {
    switch (sceneType) {
      case "ocean":
        return colors.primary.DEFAULT;
      case "space":
        return colors.neutral[900];
      case "city":
        return colors.neutral[500];
      default:
        return colors.success.DEFAULT;
    }
  }, [sceneType]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color={groundColor} />
    </mesh>
  );
}

// Scene presets
const SCENE_ELEMENTS: Record<SceneType, SceneElement[]> = {
  forest: [
    { name: "Oak Tree", position: [-2, 0, -1], type: "tree", scale: 1.2 },
    { name: "Pine Tree", position: [2, 0, -2], type: "tree", scale: 1 },
    { name: "Small Tree", position: [-1, 0, 1], type: "tree", scale: 0.7 },
    { name: "Tree", position: [1.5, 0, 0], type: "tree", scale: 0.9 },
  ],
  city: [
    { name: "Tall Building", position: [-1.5, 0, -1], type: "building", scale: 1.5 },
    { name: "Office", position: [1, 0, -1.5], type: "building", scale: 1.2 },
    { name: "Shop", position: [0, 0, 0.5], type: "building", scale: 0.8 },
  ],
  ocean: [
    { name: "Wave", position: [0, 0, 0], type: "water" },
  ],
  space: [
    { name: "Star", position: [-2, 2, -1], type: "star" },
    { name: "Star", position: [2, 1.5, -2], type: "star" },
    { name: "Star", position: [0, 2.5, -1], type: "star" },
  ],
  home: [
    { name: "Home", position: [0, 0, 0], type: "house", scale: 1 },
    { name: "Garden Tree", position: [-2, 0, 0.5], type: "tree", scale: 0.8 },
  ],
  school: [
    { name: "School", position: [0, 0, -1], type: "building", scale: 1.3, color: colors.destructive.muted },
    { name: "Tree", position: [-2.5, 0, 0], type: "tree", scale: 0.9 },
  ],
};

export function StoryScene({
  sceneType = "forest",
  timeOfDay = "day",
  characters = ["Hero"],
  showLabels = true,
  animate = true,
  onElementClick,
  highlightedElement,
}: StorySceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  const elements = SCENE_ELEMENTS[sceneType];
  const isNight = timeOfDay === "night";

  // Character colors
  const characterColors = [
    colors.primary.DEFAULT,
    colors.success.DEFAULT,
    colors.accent.purple,
    colors.warning.DEFAULT,
  ];

  return (
    <group ref={groupRef}>
      {/* Sky light adjustment based on time */}
      <ambientLight intensity={isNight ? 0.2 : 0.6} />
      <directionalLight
        position={isNight ? [5, 5, 5] : [10, 10, 5]}
        intensity={isNight ? 0.3 : 1}
        color={isNight ? colors.primary.muted : "white"}
      />

      {/* Ground */}
      <Ground sceneType={sceneType} />

      {/* Sky elements */}
      <CelestialBody
        type={isNight ? "moon" : "sun"}
        position={[3, 3, -5]}
        animate={animate}
      />
      {!isNight && (
        <>
          <Cloud position={[-2, 2.5, -3]} animate={animate} />
          <Cloud position={[2, 3, -4]} animate={animate} />
        </>
      )}

      {/* Scene elements */}
      {elements.map((element, index) => {
        const isHighlighted = highlightedElement === element.name;
        const handleClick = () => onElementClick?.(element.name);

        switch (element.type) {
          case "tree":
            return (
              <Tree
                key={`${element.name}-${index}`}
                position={element.position}
                scale={element.scale}
                label={element.name}
                showLabel={showLabels}
                isHighlighted={isHighlighted}
                onClick={handleClick}
              />
            );
          case "building":
            return (
              <Building
                key={`${element.name}-${index}`}
                position={element.position}
                scale={element.scale}
                color={element.color}
                label={element.name}
                showLabel={showLabels}
                isHighlighted={isHighlighted}
                onClick={handleClick}
              />
            );
          case "house":
            return (
              <House
                key={`${element.name}-${index}`}
                position={element.position}
                scale={element.scale}
                label={element.name}
                showLabel={showLabels}
                isHighlighted={isHighlighted}
                onClick={handleClick}
              />
            );
          default:
            return null;
        }
      })}

      {/* Characters */}
      {characters.map((name, index) => {
        const xOffset = (index - (characters.length - 1) / 2) * 0.8;
        return (
          <Character
            key={name}
            position={[xOffset, 0, 1.5]}
            name={name}
            color={characterColors[index % characterColors.length]}
            showLabel={showLabels}
            isHighlighted={highlightedElement === name}
            onClick={() => onElementClick?.(name)}
            animate={animate}
          />
        );
      })}

      {/* Scene title */}
      <group position={[0, -0.5, 3]}>
        <Billboard>
          <Text
            fontSize={0.15}
            color={colors.three.text}
            anchorX="center"
            fontWeight="bold"
          >
            {sceneType.charAt(0).toUpperCase() + sceneType.slice(1)} Scene
          </Text>
          <Text
            position={[0, -0.2, 0]}
            fontSize={0.1}
            color={colors.three.textMuted}
            anchorX="center"
          >
            {timeOfDay === "day" ? "Daytime" : timeOfDay === "night" ? "Nighttime" : "Sunset"}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

export default StoryScene;
