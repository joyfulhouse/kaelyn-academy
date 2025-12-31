/**
 * 3D Historical Monument Visualization
 * Interactive 3D monuments representing historical landmarks
 *
 * Accessibility: Famous monuments and structures with
 * labels for history and geography lessons
 */

"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Cylinder, Billboard, Cone } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/lib/colors";

type MonumentType = "pyramid" | "colosseum" | "lighthouse" | "temple" | "castle" | "tower" | "wall";

interface HistoricalMonumentProps {
  type?: MonumentType;
  name?: string;
  year?: number;
  location?: string;
  description?: string;
  animate?: boolean;
  showInfo?: boolean;
  onMonumentClick?: () => void;
}

// Pyramid structure (Egyptian style)
function Pyramid({
  scale = 1,
  color,
  isHighlighted,
}: {
  scale?: number;
  color: string;
  isHighlighted: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main pyramid */}
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[1.2, 1.5, 4]} />
        <meshStandardMaterial
          color={isHighlighted ? colors.warning.light : color}
          roughness={0.8}
        />
      </mesh>
      {/* Base blocks */}
      {[-0.8, 0, 0.8].map((x, i) =>
        [-0.8, 0, 0.8].map((z, j) => (
          <RoundedBox
            key={`${i}-${j}`}
            args={[0.3, 0.1, 0.3]}
            position={[x, -0.1, z]}
            radius={0.01}
          >
            <meshStandardMaterial color={colors.warning.dark} />
          </RoundedBox>
        ))
      )}
    </group>
  );
}

// Colosseum structure
function Colosseum({
  scale = 1,
  color,
  isHighlighted,
}: {
  scale?: number;
  color: string;
  isHighlighted: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const columnCount = 16;

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  // Generate column positions in a circle
  const columns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < columnCount; i++) {
      const angle = (i / columnCount) * Math.PI * 2;
      const x = Math.cos(angle) * 1;
      const z = Math.sin(angle) * 1;
      cols.push({ x, z, angle });
    }
    return cols;
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {/* Base ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 1.2, 32]} />
        <meshStandardMaterial
          color={isHighlighted ? colors.warning.light : color}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer columns */}
      {columns.map(({ x, z }, i) => (
        <group key={i}>
          {/* Column */}
          <Cylinder args={[0.05, 0.06, 0.6]} position={[x, 0.4, z]}>
            <meshStandardMaterial color={color} />
          </Cylinder>
          {/* Column top */}
          <RoundedBox args={[0.12, 0.05, 0.12]} position={[x, 0.72, z]} radius={0.01}>
            <meshStandardMaterial color={color} />
          </RoundedBox>
        </group>
      ))}

      {/* Inner wall */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.7, 0.75, 0.5, 32, 1, true]} />
        <meshStandardMaterial
          color={isHighlighted ? colors.warning.light : colors.warning.muted}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Upper ring/roof */}
      <mesh position={[0, 0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.15, 32]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Greek/Roman Temple
function Temple({
  scale = 1,
  color,
  isHighlighted,
}: {
  scale?: number;
  color: string;
  isHighlighted: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} scale={scale}>
      {/* Base platform */}
      <RoundedBox args={[1.8, 0.15, 1.2]} position={[0, 0.075, 0]} radius={0.02}>
        <meshStandardMaterial color={colors.neutral[300]} />
      </RoundedBox>
      <RoundedBox args={[1.6, 0.1, 1]} position={[0, 0.2, 0]} radius={0.02}>
        <meshStandardMaterial color={colors.neutral[200]} />
      </RoundedBox>

      {/* Columns - front row */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <group key={`front-${i}`}>
          <Cylinder args={[0.06, 0.07, 0.7]} position={[x, 0.6, 0.35]}>
            <meshStandardMaterial color={isHighlighted ? colors.warning.light : color} />
          </Cylinder>
          <RoundedBox args={[0.12, 0.06, 0.12]} position={[x, 0.97, 0.35]} radius={0.01}>
            <meshStandardMaterial color={color} />
          </RoundedBox>
        </group>
      ))}

      {/* Columns - back row */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <group key={`back-${i}`}>
          <Cylinder args={[0.06, 0.07, 0.7]} position={[x, 0.6, -0.35]}>
            <meshStandardMaterial color={color} />
          </Cylinder>
        </group>
      ))}

      {/* Inner chamber */}
      <RoundedBox args={[0.8, 0.6, 0.5]} position={[0, 0.55, 0]} radius={0.02}>
        <meshStandardMaterial color={colors.neutral[400]} />
      </RoundedBox>

      {/* Roof - triangular pediment */}
      <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 1.8, 3, 1, false, Math.PI / 6]} />
        <meshStandardMaterial color={isHighlighted ? colors.warning.light : color} />
      </mesh>
    </group>
  );
}

// Medieval Castle
function Castle({
  scale = 1,
  color,
  isHighlighted,
}: {
  scale?: number;
  color: string;
  isHighlighted: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main keep */}
      <RoundedBox args={[0.8, 1, 0.8]} position={[0, 0.5, 0]} radius={0.02}>
        <meshStandardMaterial color={isHighlighted ? colors.warning.light : color} />
      </RoundedBox>

      {/* Corner towers */}
      {[
        [-0.5, -0.5],
        [0.5, -0.5],
        [-0.5, 0.5],
        [0.5, 0.5],
      ].map(([x, z], i) => (
        <group key={i}>
          <Cylinder args={[0.15, 0.18, 1.2]} position={[x, 0.6, z]}>
            <meshStandardMaterial color={color} />
          </Cylinder>
          <Cone args={[0.2, 0.3, 8]} position={[x, 1.35, z]}>
            <meshStandardMaterial color={colors.destructive.dark} />
          </Cone>
        </group>
      ))}

      {/* Battlements on main keep */}
      {[-0.3, -0.1, 0.1, 0.3].map((offset, i) => (
        <RoundedBox
          key={i}
          args={[0.1, 0.15, 0.1]}
          position={[offset, 1.07, 0.4]}
          radius={0.01}
        >
          <meshStandardMaterial color={color} />
        </RoundedBox>
      ))}

      {/* Gate */}
      <RoundedBox args={[0.25, 0.4, 0.05]} position={[0, 0.2, 0.42]} radius={0.02}>
        <meshStandardMaterial color={colors.warning.dark} />
      </RoundedBox>

      {/* Wall sections */}
      <RoundedBox args={[0.1, 0.5, 1.2]} position={[-0.65, 0.25, 0]} radius={0.01}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      <RoundedBox args={[0.1, 0.5, 1.2]} position={[0.65, 0.25, 0]} radius={0.01}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
    </group>
  );
}

// Lighthouse structure
function Lighthouse({
  scale = 1,
  color,
  isHighlighted,
  animate = true,
}: {
  scale?: number;
  color: string;
  isHighlighted: boolean;
  animate?: boolean;
}) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!lightRef.current || !animate) return;
    // Rotating light beam effect
    lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 4) * 1.5;
  });

  return (
    <group scale={scale}>
      {/* Base */}
      <Cylinder args={[0.4, 0.5, 0.3]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color={colors.neutral[400]} />
      </Cylinder>

      {/* Main tower */}
      <Cylinder args={[0.25, 0.35, 1.2]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color={isHighlighted ? colors.warning.light : color} />
      </Cylinder>

      {/* Red stripes */}
      <Cylinder args={[0.255, 0.32, 0.15]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={colors.destructive.DEFAULT} />
      </Cylinder>
      <Cylinder args={[0.255, 0.29, 0.15]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color={colors.destructive.DEFAULT} />
      </Cylinder>
      <Cylinder args={[0.26, 0.27, 0.15]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color={colors.destructive.DEFAULT} />
      </Cylinder>

      {/* Lantern room */}
      <Cylinder args={[0.2, 0.2, 0.25]} position={[0, 1.62, 0]}>
        <meshStandardMaterial
          color={colors.warning.light}
          transparent
          opacity={0.8}
        />
      </Cylinder>

      {/* Gallery/walkway */}
      <Cylinder args={[0.3, 0.3, 0.05]} position={[0, 1.48, 0]}>
        <meshStandardMaterial color={colors.neutral[600]} />
      </Cylinder>

      {/* Dome */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={colors.neutral[700]} />
      </mesh>

      {/* Light beam */}
      <pointLight
        ref={lightRef}
        position={[0, 1.65, 0]}
        color={colors.warning.light}
        intensity={2}
        distance={3}
      />
    </group>
  );
}

// Great Wall section
function GreatWall({
  scale = 1,
  color,
  isHighlighted,
}: {
  scale?: number;
  color: string;
  isHighlighted: boolean;
}) {
  return (
    <group scale={scale}>
      {/* Main wall section */}
      <RoundedBox args={[3, 0.6, 0.4]} position={[0, 0.3, 0]} radius={0.02}>
        <meshStandardMaterial color={isHighlighted ? colors.warning.light : color} />
      </RoundedBox>

      {/* Walkway on top */}
      <RoundedBox args={[3.2, 0.08, 0.5]} position={[0, 0.65, 0]} radius={0.01}>
        <meshStandardMaterial color={colors.neutral[400]} />
      </RoundedBox>

      {/* Battlements */}
      {[-1.3, -0.9, -0.5, -0.1, 0.3, 0.7, 1.1].map((x, i) => (
        <RoundedBox
          key={i}
          args={[0.15, 0.2, 0.1]}
          position={[x, 0.8, 0.2]}
          radius={0.01}
        >
          <meshStandardMaterial color={color} />
        </RoundedBox>
      ))}

      {/* Watch towers */}
      {[-1.3, 1.3].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <RoundedBox args={[0.5, 0.9, 0.5]} position={[0, 0.45, 0]} radius={0.02}>
            <meshStandardMaterial color={color} />
          </RoundedBox>
          <Cone args={[0.35, 0.4, 4]} position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]}>
            <meshStandardMaterial color={colors.destructive.dark} />
          </Cone>
        </group>
      ))}
    </group>
  );
}

// Eiffel Tower style
function Tower({
  scale = 1,
  color,
  isHighlighted,
}: {
  scale?: number;
  color: string;
  isHighlighted: boolean;
}) {
  return (
    <group scale={scale}>
      {/* Base legs */}
      {[
        [-0.4, -0.4],
        [0.4, -0.4],
        [-0.4, 0.4],
        [0.4, 0.4],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x * 0.6, 0.4, z * 0.6]} rotation={[x * 0.15, 0, z * 0.15]}>
          <cylinderGeometry args={[0.04, 0.08, 0.8]} />
          <meshStandardMaterial color={isHighlighted ? colors.warning.light : color} />
        </mesh>
      ))}

      {/* First platform */}
      <RoundedBox args={[0.7, 0.05, 0.7]} position={[0, 0.8, 0]} radius={0.01}>
        <meshStandardMaterial color={color} />
      </RoundedBox>

      {/* Middle section */}
      {[
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.15, z]} rotation={[x * 0.1, 0, z * 0.1]}>
          <cylinderGeometry args={[0.03, 0.05, 0.7]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}

      {/* Second platform */}
      <RoundedBox args={[0.4, 0.04, 0.4]} position={[0, 1.5, 0]} radius={0.01}>
        <meshStandardMaterial color={color} />
      </RoundedBox>

      {/* Top section */}
      <Cylinder args={[0.02, 0.08, 0.6]} position={[0, 1.85, 0]}>
        <meshStandardMaterial color={color} />
      </Cylinder>

      {/* Antenna */}
      <Cylinder args={[0.01, 0.02, 0.25]} position={[0, 2.27, 0]}>
        <meshStandardMaterial color={colors.neutral[600]} />
      </Cylinder>
    </group>
  );
}

// Monument configurations
const MONUMENT_INFO: Record<
  MonumentType,
  { defaultName: string; defaultYear: number; defaultLocation: string; defaultDescription: string; color: string }
> = {
  pyramid: {
    defaultName: "Great Pyramid of Giza",
    defaultYear: -2560,
    defaultLocation: "Egypt",
    defaultDescription: "Ancient Egyptian pyramid built as a tomb for Pharaoh Khufu",
    color: colors.warning.DEFAULT,
  },
  colosseum: {
    defaultName: "Colosseum",
    defaultYear: 80,
    defaultLocation: "Rome, Italy",
    defaultDescription: "Ancient Roman amphitheater used for gladiatorial contests",
    color: colors.warning.muted,
  },
  lighthouse: {
    defaultName: "Lighthouse of Alexandria",
    defaultYear: -280,
    defaultLocation: "Alexandria, Egypt",
    defaultDescription: "Ancient wonder of the world, guiding ships into the harbor",
    color: colors.neutral[100],
  },
  temple: {
    defaultName: "Parthenon",
    defaultYear: -438,
    defaultLocation: "Athens, Greece",
    defaultDescription: "Ancient Greek temple dedicated to the goddess Athena",
    color: colors.neutral[200],
  },
  castle: {
    defaultName: "Medieval Castle",
    defaultYear: 1100,
    defaultLocation: "Europe",
    defaultDescription: "Fortified structure used for defense and as a noble residence",
    color: colors.neutral[500],
  },
  tower: {
    defaultName: "Eiffel Tower",
    defaultYear: 1889,
    defaultLocation: "Paris, France",
    defaultDescription: "Iron lattice tower built for the 1889 World's Fair",
    color: colors.neutral[600],
  },
  wall: {
    defaultName: "Great Wall of China",
    defaultYear: -700,
    defaultLocation: "China",
    defaultDescription: "Ancient fortification built to protect against invasions",
    color: colors.neutral[400],
  },
};

export function HistoricalMonument({
  type = "pyramid",
  name,
  year,
  location,
  description,
  animate = true,
  showInfo = true,
  onMonumentClick,
}: HistoricalMonumentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const info = MONUMENT_INFO[type];
  const displayName = name ?? info.defaultName;
  const displayYear = year ?? info.defaultYear;
  const displayLocation = location ?? info.defaultLocation;
  const displayDescription = description ?? info.defaultDescription;

  const yearDisplay = displayYear < 0 ? `${Math.abs(displayYear)} BCE` : `${displayYear} CE`;

  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
  });

  const renderMonument = () => {
    const props = { scale: 1, color: info.color, isHighlighted: hovered, animate };
    switch (type) {
      case "pyramid":
        return <Pyramid {...props} />;
      case "colosseum":
        return <Colosseum {...props} />;
      case "lighthouse":
        return <Lighthouse {...props} />;
      case "temple":
        return <Temple {...props} />;
      case "castle":
        return <Castle {...props} />;
      case "tower":
        return <Tower {...props} />;
      case "wall":
        return <GreatWall {...props} />;
      default:
        return <Pyramid {...props} />;
    }
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onMonumentClick}
    >
      {renderMonument()}

      {/* Information panel */}
      {showInfo && (
        <group position={[0, -0.8, 0]}>
          <Billboard>
            <Text
              fontSize={0.14}
              color={colors.three.text}
              anchorX="center"
              fontWeight="bold"
            >
              {displayName}
            </Text>
            <Text
              position={[0, -0.2, 0]}
              fontSize={0.09}
              color={colors.three.textMuted}
              anchorX="center"
            >
              {displayLocation} | {yearDisplay}
            </Text>
          </Billboard>

          {hovered && (
            <Billboard position={[0, -0.5, 0]}>
              <RoundedBox args={[3, 0.4, 0.02]} radius={0.02}>
                <meshStandardMaterial color={colors.neutral[800]} transparent opacity={0.9} />
              </RoundedBox>
              <Text
                position={[0, 0, 0.02]}
                fontSize={0.08}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={2.8}
                textAlign="center"
              >
                {displayDescription}
              </Text>
            </Billboard>
          )}
        </group>
      )}
    </group>
  );
}

export default HistoricalMonument;
