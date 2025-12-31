/**
 * 3D Water Cycle Visualization
 * Interactive demonstration of the water cycle
 */

"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Plane, Line } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/lib/colors";

interface WaterCycleProps {
  animate?: boolean;
  showLabels?: boolean;
  activeStage?: "all" | "evaporation" | "condensation" | "precipitation" | "collection";
}

function Terrain() {
  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color={colors.accent.orange} />
      </mesh>

      {/* Mountain */}
      <mesh position={[3, 0, 0]}>
        <coneGeometry args={[2, 3, 8]} />
        <meshStandardMaterial color={colors.three.textMuted} />
      </mesh>
      <mesh position={[3, 1.5, 0]}>
        <coneGeometry args={[0.8, 1, 8]} />
        <meshStandardMaterial color={colors.neutral[50]} />
      </mesh>

      {/* Ocean */}
      <mesh position={[-2.5, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 6]} />
        <meshStandardMaterial color={colors.accent.cyan} transparent opacity={0.8} />
      </mesh>

      {/* Lake */}
      <mesh position={[2, -0.85, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial color={colors.info.light} transparent opacity={0.8} />
      </mesh>

      {/* River */}
      <mesh position={[1, -0.88, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 3]} />
        <meshStandardMaterial color={colors.info.light} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Cloud({
  position,
  size = 1,
}: {
  position: [number, number, number];
  size?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4 * size, 16, 16]} />
        <meshStandardMaterial color={colors.neutral[50]} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.3 * size, 0.1, 0]}>
        <sphereGeometry args={[0.3 * size, 16, 16]} />
        <meshStandardMaterial color={colors.neutral[50]} transparent opacity={0.9} />
      </mesh>
      <mesh position={[-0.3 * size, 0.05, 0]}>
        <sphereGeometry args={[0.35 * size, 16, 16]} />
        <meshStandardMaterial color={colors.neutral[50]} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -0.15, 0.2 * size]}>
        <sphereGeometry args={[0.25 * size, 16, 16]} />
        <meshStandardMaterial color={colors.neutral[50]} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function WaterDroplets({
  type,
  animate,
}: {
  type: "evaporation" | "precipitation";
  animate: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = type === "evaporation" ? 20 : 30;

  // Pre-compute geometry and material (reused for all instances)
  const geometry = useMemo(
    () => new THREE.SphereGeometry(type === "evaporation" ? 0.03 : 0.05, 8, 8),
    [type]
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: type === "evaporation" ? colors.primary.muted : colors.primary.DEFAULT,
        transparent: true,
        opacity: type === "evaporation" ? 0.6 : 0.8,
      }),
    [type]
  );

  const initialPositions = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: type === "evaporation"
        ? -2.5 + Math.random() * 3 - 1.5
        : -1 + Math.random() * 3,
      y: type === "evaporation" ? -0.5 : 3,
      z: Math.random() * 3 - 1.5,
      speed: 0.5 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
    }));
  }, [count, type]);

  // Temporary matrix for instance transforms
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame((state) => {
    if (!animate || !meshRef.current) return;

    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const data = initialPositions[i];
      let x = data.x;
      let y = data.y;
      const z = data.z;

      if (type === "evaporation") {
        // Rise up and fade
        y = -0.5 + ((time * data.speed + data.offset) % 4);
        x = data.x + Math.sin(time + data.offset) * 0.2;

        // Reset when too high
        if (y > 3) {
          y = -0.5;
        }
      } else {
        // Fall down
        y = 3 - ((time * data.speed * 2 + data.offset) % 4);
        x = data.x + Math.sin(data.offset) * 0.1;

        // Reset when too low
        if (y < -0.8) {
          y = 3;
        }
      }

      tempMatrix.setPosition(x, y, z);
      meshRef.current.setMatrixAt(i, tempMatrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />
  );
}

function ArrowPath({
  points,
  color,
  label,
  labelPosition,
}: {
  points: THREE.Vector3[];
  color: string;
  label: string;
  labelPosition: [number, number, number];
}) {
  return (
    <group>
      <Line points={points} color={color} lineWidth={2} dashed dashSize={0.1} gapSize={0.05} />
      <Text position={labelPosition} fontSize={0.2} color={color} anchorX="center">
        {label}
      </Text>
    </group>
  );
}

export function WaterCycle({
  animate = true,
  showLabels = true,
  activeStage = "all",
}: WaterCycleProps) {
  const isActive = (stage: string) => activeStage === "all" || activeStage === stage;

  // Arrow paths for each stage
  const evaporationPath = useMemo(
    () => [
      new THREE.Vector3(-2.5, -0.5, 0),
      new THREE.Vector3(-2, 1, 0),
      new THREE.Vector3(-1, 2.5, 0),
    ],
    []
  );

  const condensationPath = useMemo(
    () => [
      new THREE.Vector3(-1, 2.8, 0),
      new THREE.Vector3(0.5, 2.8, 0),
      new THREE.Vector3(1, 2.5, 0),
    ],
    []
  );

  const precipitationPath = useMemo(
    () => [
      new THREE.Vector3(1, 2.5, 0),
      new THREE.Vector3(1.5, 1, 0),
      new THREE.Vector3(2, -0.5, 0),
    ],
    []
  );

  const collectionPath = useMemo(
    () => [
      new THREE.Vector3(2, -0.8, 0),
      new THREE.Vector3(0, -0.8, 0),
      new THREE.Vector3(-2.5, -0.8, 0),
    ],
    []
  );

  return (
    <group>
      {/* Terrain and water bodies */}
      <Terrain />

      {/* Clouds */}
      <Cloud position={[-1, 2.5, 0]} size={1.2} />
      <Cloud position={[1, 2.3, 0.5]} size={1} />
      <Cloud position={[0, 2.8, -0.5]} size={0.8} />

      {/* Sun */}
      <mesh position={[-4, 3.5, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={colors.warning.light} emissive={colors.warning.DEFAULT} emissiveIntensity={0.5} />
        <pointLight intensity={1} distance={10} />
      </mesh>

      {/* Water droplets */}
      {isActive("evaporation") && <WaterDroplets type="evaporation" animate={animate} />}
      {isActive("precipitation") && <WaterDroplets type="precipitation" animate={animate} />}

      {/* Arrow paths with labels */}
      {showLabels && (
        <>
          {isActive("evaporation") && (
            <ArrowPath
              points={evaporationPath}
              color={colors.accent.cyan}
              label="Evaporation"
              labelPosition={[-2.5, 1.5, 0.5]}
            />
          )}
          {isActive("condensation") && (
            <ArrowPath
              points={condensationPath}
              color={colors.accent.purple}
              label="Condensation"
              labelPosition={[0, 3.3, 0]}
            />
          )}
          {isActive("precipitation") && (
            <ArrowPath
              points={precipitationPath}
              color={colors.primary.DEFAULT}
              label="Precipitation"
              labelPosition={[2.2, 1.5, 0.5]}
            />
          )}
          {isActive("collection") && (
            <ArrowPath
              points={collectionPath}
              color={colors.accent.cyan}
              label="Collection"
              labelPosition={[0, -1.3, 0]}
            />
          )}
        </>
      )}

      {/* Stage labels */}
      {showLabels && (
        <>
          <Text position={[-2.5, -1.5, 2]} fontSize={0.15} color={colors.accent.cyan} anchorX="center">
            Ocean
          </Text>
          <Text position={[3, 2, 0]} fontSize={0.15} color={colors.three.textMuted} anchorX="center">
            Mountain
          </Text>
          <Text position={[2, -1.3, 2]} fontSize={0.12} color={colors.info.light} anchorX="center">
            Lake
          </Text>
        </>
      )}
    </group>
  );
}

export default WaterCycle;
