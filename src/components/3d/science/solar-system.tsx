/**
 * 3D Solar System Visualization
 * Interactive solar system model with orbiting planets
 */

"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Line } from "@react-three/drei";
import * as THREE from "three";

interface PlanetConfig {
  name: string;
  size: number;
  distance: number;
  color: string;
  orbitSpeed: number;
  rotationSpeed: number;
  rings?: boolean;
  moons?: number;
}

const PLANETS: PlanetConfig[] = [
  { name: "Mercury", size: 0.08, distance: 1.5, color: "#b5b5b5", orbitSpeed: 4.15, rotationSpeed: 0.5 },
  { name: "Venus", size: 0.12, distance: 2.0, color: "#e6c229", orbitSpeed: 1.62, rotationSpeed: -0.1 },
  { name: "Earth", size: 0.13, distance: 2.6, color: "#3b82f6", orbitSpeed: 1.0, rotationSpeed: 1.0, moons: 1 },
  { name: "Mars", size: 0.1, distance: 3.2, color: "#ef4444", orbitSpeed: 0.53, rotationSpeed: 0.97, moons: 2 },
  { name: "Jupiter", size: 0.35, distance: 4.2, color: "#f59e0b", orbitSpeed: 0.084, rotationSpeed: 2.4, moons: 4 },
  { name: "Saturn", size: 0.3, distance: 5.4, color: "#eab308", orbitSpeed: 0.034, rotationSpeed: 2.2, rings: true, moons: 3 },
  { name: "Uranus", size: 0.2, distance: 6.4, color: "#06b6d4", orbitSpeed: 0.012, rotationSpeed: -1.4, rings: true },
  { name: "Neptune", size: 0.19, distance: 7.2, color: "#2563eb", orbitSpeed: 0.006, rotationSpeed: 1.5, moons: 1 },
];

interface SolarSystemProps {
  animate?: boolean;
  showLabels?: boolean;
  showOrbits?: boolean;
  speedMultiplier?: number;
  visiblePlanets?: string[];
}

function Sun({ size }: { size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#f59e0b"
        emissiveIntensity={0.8}
      />
      {/* Sun glow */}
      <pointLight intensity={2} distance={15} decay={2} />
    </mesh>
  );
}

function Planet({
  config,
  animate,
  showLabel,
  speedMultiplier,
}: {
  config: PlanetConfig;
  animate: boolean;
  showLabel: boolean;
  speedMultiplier: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!animate || !groupRef.current || !planetRef.current) return;

    const time = state.clock.getElapsedTime() * speedMultiplier;
    const angle = initialAngle + time * config.orbitSpeed * 0.2;

    // Orbit position
    groupRef.current.position.x = Math.cos(angle) * config.distance;
    groupRef.current.position.z = Math.sin(angle) * config.distance;

    // Planet rotation
    planetRef.current.rotation.y += config.rotationSpeed * 0.01;
  });

  return (
    <group ref={groupRef} position={[config.distance, 0, 0]}>
      {/* Planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[config.size, 24, 24]} />
        <meshStandardMaterial color={config.color} />
      </mesh>

      {/* Rings (for Saturn and Uranus) */}
      {config.rings && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[config.size * 1.3, config.size * 2, 32]} />
          <meshStandardMaterial
            color={config.color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Moons */}
      {config.moons && (
        <MoonSystem count={config.moons} planetSize={config.size} animate={animate} />
      )}

      {/* Label */}
      {showLabel && (
        <Text
          position={[0, config.size + 0.15, 0]}
          fontSize={0.1}
          color="#666666"
          anchorX="center"
        >
          {config.name}
        </Text>
      )}
    </group>
  );
}

function MoonSystem({
  count,
  planetSize,
  animate,
}: {
  count: number;
  planetSize: number;
  animate: boolean;
}) {
  const moonsRef = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    if (!animate) return;

    moonsRef.current.forEach((moon, i) => {
      if (moon) {
        const speed = 2 + i * 0.5;
        const time = state.clock.getElapsedTime();
        const angle = time * speed + (i * Math.PI * 2) / count;
        const distance = planetSize * (1.5 + i * 0.3);

        moon.position.x = Math.cos(angle) * distance;
        moon.position.z = Math.sin(angle) * distance;
      }
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <group
          key={i}
          ref={(ref) => {
            if (ref) moonsRef.current[i] = ref;
          }}
        >
          <mesh>
            <sphereGeometry args={[planetSize * 0.15, 16, 16]} />
            <meshStandardMaterial color="#9ca3af" />
          </mesh>
        </group>
      ))}
    </>
  );
}

function OrbitPath({ distance }: { distance: number }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      ));
    }
    return pts;
  }, [distance]);

  return (
    <Line
      points={points}
      color="#444444"
      lineWidth={0.5}
      opacity={0.3}
      transparent
    />
  );
}

export function SolarSystem({
  animate = true,
  showLabels = true,
  showOrbits = true,
  speedMultiplier = 1,
  visiblePlanets,
}: SolarSystemProps) {
  const filteredPlanets = visiblePlanets
    ? PLANETS.filter((p) => visiblePlanets.includes(p.name.toLowerCase()))
    : PLANETS;

  return (
    <group>
      {/* Sun */}
      <Sun size={0.5} />

      {/* Orbit paths */}
      {showOrbits &&
        filteredPlanets.map((planet) => (
          <OrbitPath key={`orbit-${planet.name}`} distance={planet.distance} />
        ))}

      {/* Planets */}
      {filteredPlanets.map((planet) => (
        <Planet
          key={planet.name}
          config={planet}
          animate={animate}
          showLabel={showLabels}
          speedMultiplier={speedMultiplier}
        />
      ))}

      {/* Sun label */}
      {showLabels && (
        <Text position={[0, 0.7, 0]} fontSize={0.15} color="#666666" anchorX="center">
          Sun
        </Text>
      )}
    </group>
  );
}

export default SolarSystem;
