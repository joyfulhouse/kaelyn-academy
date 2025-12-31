/**
 * 3D World Map Visualization
 * Interactive 3D map with region highlights and markers
 *
 * Accessibility: Displays world regions with labels and
 * interactive markers for geography/history lessons
 */

"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Sphere, Billboard, Line, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/lib/colors";

type ContinentType = "north-america" | "south-america" | "europe" | "africa" | "asia" | "oceania" | "antarctica";

interface MapMarker {
  id: string;
  name: string;
  position: [number, number]; // [longitude, latitude] normalized to -1 to 1
  type?: "city" | "landmark" | "event" | "region";
  description?: string;
}

interface WorldMap3DProps {
  markers?: MapMarker[];
  highlightedRegions?: ContinentType[];
  animate?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  selectedMarkerId?: string;
  title?: string;
}

// Default markers for example
const DEFAULT_MARKERS: MapMarker[] = [
  { id: "nyc", name: "New York", position: [-0.2, 0.3], type: "city" },
  { id: "london", name: "London", position: [0.0, 0.4], type: "city" },
  { id: "rome", name: "Rome", position: [0.1, 0.35], type: "city", description: "Ancient capital of the Roman Empire" },
  { id: "cairo", name: "Cairo", position: [0.15, 0.2], type: "city", description: "Home to the Great Pyramids" },
  { id: "beijing", name: "Beijing", position: [0.6, 0.35], type: "city" },
  { id: "tokyo", name: "Tokyo", position: [0.75, 0.3], type: "city" },
  { id: "sydney", name: "Sydney", position: [0.8, -0.25], type: "city" },
];

// Continent approximate positions and sizes
const CONTINENTS: Record<ContinentType, { center: [number, number]; size: [number, number]; color: string }> = {
  "north-america": { center: [-0.35, 0.35], size: [0.35, 0.3], color: colors.success.DEFAULT },
  "south-america": { center: [-0.2, -0.15], size: [0.18, 0.35], color: colors.success.light },
  europe: { center: [0.05, 0.4], size: [0.15, 0.15], color: colors.primary.DEFAULT },
  africa: { center: [0.1, 0.0], size: [0.2, 0.35], color: colors.warning.DEFAULT },
  asia: { center: [0.5, 0.3], size: [0.4, 0.35], color: colors.accent.purple },
  oceania: { center: [0.75, -0.2], size: [0.2, 0.2], color: colors.accent.teal },
  antarctica: { center: [0.0, -0.45], size: [0.8, 0.1], color: colors.neutral[200] },
};

// Marker type colors
const MARKER_COLORS: Record<string, string> = {
  city: colors.primary.DEFAULT,
  landmark: colors.warning.DEFAULT,
  event: colors.destructive.DEFAULT,
  region: colors.success.DEFAULT,
};

interface ContinentShapeProps {
  continent: ContinentType;
  isHighlighted: boolean;
  animate: boolean;
}

function ContinentShape({ continent, isHighlighted, animate }: ContinentShapeProps) {
  const config = CONTINENTS[continent];
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current || !animate) return;
    if (isHighlighted || hovered) {
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        0.05,
        0.1
      );
    } else {
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        0,
        0.1
      );
    }
  });

  const displayColor = isHighlighted || hovered
    ? colors.warning.light
    : config.color;

  return (
    <RoundedBox
      ref={meshRef}
      args={[config.size[0], config.size[1], 0.02]}
      position={[config.center[0] * 2, config.center[1] * 2, 0]}
      radius={0.01}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        color={displayColor}
        transparent
        opacity={0.8}
      />
    </RoundedBox>
  );
}

interface MapMarkerPinProps {
  marker: MapMarker;
  isSelected: boolean;
  showLabel: boolean;
  animate: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
}

function MapMarkerPin({
  marker,
  isSelected,
  showLabel,
  animate,
  onMarkerClick,
}: MapMarkerPinProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const pinRef = useRef<THREE.Mesh>(null);

  const markerColor = MARKER_COLORS[marker.type ?? "city"];

  // Convert normalized position to 3D coordinates
  const x = marker.position[0] * 2;
  const y = marker.position[1] * 2;

  useFrame((state) => {
    if (!groupRef.current || !animate) return;

    // Bouncing animation when selected
    if (isSelected && pinRef.current) {
      pinRef.current.position.z = 0.15 + Math.sin(state.clock.elapsedTime * 4) * 0.03;
    }
  });

  const displayColor = isSelected
    ? colors.warning.DEFAULT
    : hovered
      ? colors.success.light
      : markerColor;

  return (
    <group
      ref={groupRef}
      position={[x, y, 0.03]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onMarkerClick?.(marker)}
    >
      {/* Pin base */}
      <Cylinder args={[0.02, 0.025, 0.08]} position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={displayColor} />
      </Cylinder>

      {/* Pin head */}
      <Sphere
        ref={pinRef}
        args={[0.04, 16, 16]}
        position={[0, 0, 0.12]}
      >
        <meshStandardMaterial
          color={displayColor}
          emissive={isSelected ? colors.warning.light : undefined}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </Sphere>

      {/* Label */}
      {(showLabel || hovered || isSelected) && (
        <Billboard position={[0, 0, 0.25]}>
          <Text
            fontSize={0.06}
            color={colors.three.text}
            anchorX="center"
            fontWeight={isSelected ? "bold" : "normal"}
          >
            {marker.name}
          </Text>
        </Billboard>
      )}

      {/* Description tooltip */}
      {(hovered || isSelected) && marker.description && (
        <Billboard position={[0, 0, 0.4]}>
          <RoundedBox args={[0.8, 0.15, 0.01]} radius={0.01}>
            <meshStandardMaterial color={colors.neutral[800]} transparent opacity={0.9} />
          </RoundedBox>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.04}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.75}
            textAlign="center"
          >
            {marker.description}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function MapGrid() {
  // Generate latitude and longitude lines
  const lines = useMemo(() => {
    const result: [THREE.Vector3, THREE.Vector3][] = [];

    // Latitude lines
    for (let lat = -0.8; lat <= 0.8; lat += 0.4) {
      result.push([
        new THREE.Vector3(-1.8, lat * 2, -0.01),
        new THREE.Vector3(1.8, lat * 2, -0.01),
      ]);
    }

    // Longitude lines
    for (let lon = -0.8; lon <= 0.8; lon += 0.4) {
      result.push([
        new THREE.Vector3(lon * 2, -1.8, -0.01),
        new THREE.Vector3(lon * 2, 1.0, -0.01),
      ]);
    }

    return result;
  }, []);

  return (
    <group>
      {lines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={colors.neutral[300]}
          lineWidth={0.5}
          opacity={0.3}
          transparent
        />
      ))}
    </group>
  );
}

function Compass({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Compass circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.12, 32]} />
        <meshStandardMaterial color={colors.neutral[400]} side={THREE.DoubleSide} />
      </mesh>

      {/* North arrow */}
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.03, 0.08, 3]} />
        <meshStandardMaterial color={colors.destructive.DEFAULT} />
      </mesh>

      {/* South arrow */}
      <mesh position={[0, -0.08, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.03, 0.08, 3]} />
        <meshStandardMaterial color={colors.neutral[400]} />
      </mesh>

      {/* N label */}
      <Text
        position={[0, 0.18, 0]}
        fontSize={0.05}
        color={colors.destructive.DEFAULT}
        anchorX="center"
        fontWeight="bold"
      >
        N
      </Text>
    </group>
  );
}

export function WorldMap3D({
  markers = DEFAULT_MARKERS,
  highlightedRegions = [],
  animate = true,
  showLabels = true,
  interactive = true,
  onMarkerClick,
  selectedMarkerId,
  title = "World Map",
}: WorldMap3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    // Subtle floating animation
    groupRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
  });

  return (
    <group ref={groupRef}>
      {/* Map background (ocean) */}
      <RoundedBox args={[4, 2.5, 0.02]} position={[0, 0, -0.02]} radius={0.02}>
        <meshStandardMaterial color={colors.primary.muted} />
      </RoundedBox>

      {/* Grid lines */}
      <MapGrid />

      {/* Continents */}
      {(Object.keys(CONTINENTS) as ContinentType[]).map((continent) => (
        <ContinentShape
          key={continent}
          continent={continent}
          isHighlighted={highlightedRegions.includes(continent)}
          animate={animate}
        />
      ))}

      {/* Markers */}
      {markers.map((marker) => (
        <MapMarkerPin
          key={marker.id}
          marker={marker}
          isSelected={selectedMarkerId === marker.id}
          showLabel={showLabels}
          animate={animate}
          onMarkerClick={interactive ? onMarkerClick : undefined}
        />
      ))}

      {/* Compass */}
      <Compass position={[1.6, -0.9, 0.05]} />

      {/* Title */}
      <Billboard position={[0, 1.4, 0.1]}>
        <Text
          fontSize={0.12}
          color={colors.three.text}
          anchorX="center"
          fontWeight="bold"
        >
          {title}
        </Text>
      </Billboard>

      {/* Legend */}
      <group position={[-1.6, -1.1, 0.05]}>
        <Billboard>
          <Text
            fontSize={0.06}
            color={colors.three.textMuted}
            anchorX="left"
            fontWeight="bold"
          >
            Marker Types
          </Text>
        </Billboard>
        {Object.entries(MARKER_COLORS).map(([type, color], i) => (
          <group key={type} position={[i * 0.5, -0.12, 0]}>
            <Sphere args={[0.03, 8, 8]} position={[0, 0, 0]}>
              <meshStandardMaterial color={color} />
            </Sphere>
            <Billboard position={[0, -0.08, 0]}>
              <Text
                fontSize={0.04}
                color={colors.neutral[500]}
                anchorX="center"
              >
                {type}
              </Text>
            </Billboard>
          </group>
        ))}
      </group>

      {/* Equator line */}
      <Line
        points={[
          new THREE.Vector3(-2, 0, 0.01),
          new THREE.Vector3(2, 0, 0.01),
        ]}
        color={colors.destructive.muted}
        lineWidth={1}
        dashed
        dashSize={0.05}
        gapSize={0.03}
      />
      <Text
        position={[2.1, 0, 0.01]}
        fontSize={0.04}
        color={colors.destructive.muted}
        anchorX="left"
      >
        Equator
      </Text>
    </group>
  );
}

export default WorldMap3D;
