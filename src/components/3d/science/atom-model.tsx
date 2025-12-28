/**
 * 3D Atom Model Visualization
 * Interactive atomic structure with electrons, protons, and neutrons
 */

"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/lib/colors";

export interface AtomConfig {
  name: string;
  symbol: string;
  atomicNumber: number;
  protons: number;
  neutrons: number;
  electrons: number[];
}

export const COMMON_ATOMS: Record<string, AtomConfig> = {
  hydrogen: {
    name: "Hydrogen",
    symbol: "H",
    atomicNumber: 1,
    protons: 1,
    neutrons: 0,
    electrons: [1],
  },
  helium: {
    name: "Helium",
    symbol: "He",
    atomicNumber: 2,
    protons: 2,
    neutrons: 2,
    electrons: [2],
  },
  carbon: {
    name: "Carbon",
    symbol: "C",
    atomicNumber: 6,
    protons: 6,
    neutrons: 6,
    electrons: [2, 4],
  },
  nitrogen: {
    name: "Nitrogen",
    symbol: "N",
    atomicNumber: 7,
    protons: 7,
    neutrons: 7,
    electrons: [2, 5],
  },
  oxygen: {
    name: "Oxygen",
    symbol: "O",
    atomicNumber: 8,
    protons: 8,
    neutrons: 8,
    electrons: [2, 6],
  },
  sodium: {
    name: "Sodium",
    symbol: "Na",
    atomicNumber: 11,
    protons: 11,
    neutrons: 12,
    electrons: [2, 8, 1],
  },
};

interface AtomModelProps {
  atom?: AtomConfig | keyof typeof COMMON_ATOMS;
  size?: number;
  animate?: boolean;
  showLabels?: boolean;
  showOrbits?: boolean;
}

function Nucleus({
  protons,
  neutrons,
  size,
}: {
  protons: number;
  neutrons: number;
  size: number;
}) {
  const particles = useMemo(() => {
    const result: { position: [number, number, number]; isProton: boolean }[] = [];
    const total = protons + neutrons;
    const particleSize = size * 0.15;

    // Arrange particles in a cluster
    for (let i = 0; i < total; i++) {
      const isProton = i < protons;
      // Use golden ratio for even distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const radius = size * 0.3 * Math.cbrt(total / 8);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      result.push({ position: [x, y, z], isProton });
    }

    return { particles: result, particleSize };
  }, [protons, neutrons, size]);

  return (
    <group>
      {particles.particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particles.particleSize, 16, 16]} />
          <meshStandardMaterial
            color={particle.isProton ? colors.three.axisX : colors.three.axisZ}
            emissive={particle.isProton ? colors.three.axisX : colors.three.axisZ}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function ElectronShell({
  shellNumber,
  electronCount,
  size,
  animate,
  showOrbits,
}: {
  shellNumber: number;
  electronCount: number;
  size: number;
  animate: boolean;
  showOrbits: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const electronRefs = useRef<THREE.Mesh[]>([]);
  const radius = size * (0.5 + shellNumber * 0.4);

  useFrame((_, delta) => {
    if (!animate) return;

    // Rotate shell
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (0.5 / (shellNumber + 1));
      groupRef.current.rotation.x = Math.PI / 6;
    }

    // Make electrons pulse slightly
    electronRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const scale = 1 + Math.sin(Date.now() * 0.005 + i) * 0.1;
        mesh.scale.setScalar(scale);
      }
    });
  });

  // Create orbit path
  const orbitPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }
    return points;
  }, [radius]);

  return (
    <group ref={groupRef}>
      {/* Orbit path */}
      {showOrbits && (
        <Line
          points={orbitPoints}
          color={colors.three.textMuted}
          lineWidth={1}
          opacity={0.5}
          transparent
        />
      )}

      {/* Electrons */}
      {Array.from({ length: electronCount }).map((_, i) => {
        const angle = (i / electronCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={i}
            position={[x, 0, z]}
            ref={(ref) => {
              if (ref) electronRefs.current[i] = ref;
            }}
          >
            <sphereGeometry args={[size * 0.08, 16, 16]} />
            <meshStandardMaterial
              color={colors.three.axisY}
              emissive={colors.three.axisY}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function AtomModel({
  atom = "carbon",
  size = 2,
  animate = true,
  showLabels = true,
  showOrbits = true,
}: AtomModelProps) {
  const atomConfig = typeof atom === "string" ? COMMON_ATOMS[atom] : atom;

  if (!atomConfig) {
    return null;
  }

  return (
    <group>
      {/* Nucleus */}
      <Nucleus protons={atomConfig.protons} neutrons={atomConfig.neutrons} size={size} />

      {/* Electron shells */}
      {atomConfig.electrons.map((electronCount, shellIndex) => (
        <ElectronShell
          key={shellIndex}
          shellNumber={shellIndex}
          electronCount={electronCount}
          size={size}
          animate={animate}
          showOrbits={showOrbits}
        />
      ))}

      {/* Labels */}
      {showLabels && (
        <>
          <Text
            position={[0, -size * 1.5, 0]}
            fontSize={0.4}
            color={colors.three.text}
            anchorX="center"
          >
            {atomConfig.name} ({atomConfig.symbol})
          </Text>
          <Text
            position={[0, -size * 1.9, 0]}
            fontSize={0.25}
            color={colors.three.textMuted}
            anchorX="center"
          >
            {`Protons: ${atomConfig.protons} | Neutrons: ${atomConfig.neutrons}`}
          </Text>
          <Text
            position={[0, -size * 2.2, 0]}
            fontSize={0.25}
            color={colors.three.textMuted}
            anchorX="center"
          >
            {`Electrons: ${atomConfig.electrons.reduce((a, b) => a + b, 0)} (${atomConfig.electrons.join(", ")})`}
          </Text>
        </>
      )}
    </group>
  );
}

export default AtomModel;
