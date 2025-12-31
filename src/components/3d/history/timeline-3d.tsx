/**
 * 3D Timeline Visualization
 * Interactive 3D timeline for historical events
 *
 * Accessibility: Events are displayed along a 3D timeline with
 * labels and descriptions for history lessons
 */

"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Billboard, Line, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/lib/colors";

interface TimelineEvent {
  year: number;
  title: string;
  description?: string;
  category?: "political" | "cultural" | "scientific" | "military" | "economic";
}

interface Timeline3DProps {
  events?: TimelineEvent[];
  startYear?: number;
  endYear?: number;
  animate?: boolean;
  showDescriptions?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  selectedYear?: number;
  title?: string;
}

// Default historical events
const DEFAULT_EVENTS: TimelineEvent[] = [
  { year: 1776, title: "Declaration of Independence", category: "political", description: "United States declared independence" },
  { year: 1789, title: "French Revolution", category: "political", description: "Revolution begins in France" },
  { year: 1804, title: "Napoleon Becomes Emperor", category: "political", description: "Napoleon crowned Emperor of France" },
  { year: 1815, title: "Battle of Waterloo", category: "military", description: "Napoleon's final defeat" },
  { year: 1865, title: "End of Civil War", category: "military", description: "American Civil War ends" },
  { year: 1876, title: "Telephone Invented", category: "scientific", description: "Alexander Graham Bell invents the telephone" },
  { year: 1903, title: "First Flight", category: "scientific", description: "Wright Brothers achieve powered flight" },
  { year: 1969, title: "Moon Landing", category: "scientific", description: "First humans walk on the Moon" },
];

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  political: colors.primary.DEFAULT,
  cultural: colors.accent.purple,
  scientific: colors.success.DEFAULT,
  military: colors.destructive.DEFAULT,
  economic: colors.warning.DEFAULT,
  default: colors.neutral[500],
};

interface EventMarkerProps {
  event: TimelineEvent;
  position: [number, number, number];
  isSelected: boolean;
  showDescription: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  animate: boolean;
}

function EventMarker({
  event,
  position,
  isSelected,
  showDescription,
  onEventClick,
  animate,
}: EventMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const markerRef = useRef<THREE.Mesh>(null);

  const categoryColor = CATEGORY_COLORS[event.category ?? "default"];

  useFrame((state) => {
    if (!groupRef.current || !animate) return;

    // Pulse animation for selected event
    if (isSelected && markerRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      markerRef.current.scale.setScalar(scale);
    }
  });

  const displayColor = isSelected
    ? colors.warning.DEFAULT
    : hovered
      ? colors.success.light
      : categoryColor;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onEventClick?.(event)}
    >
      {/* Vertical connector line */}
      <Line
        points={[[0, 0, 0], [0, 0.8, 0]]}
        color={displayColor}
        lineWidth={2}
      />

      {/* Event marker sphere */}
      <mesh ref={markerRef} position={[0, 1, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={displayColor}
          emissive={isSelected ? colors.warning.light : undefined}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Year label */}
      <Billboard position={[0, 0.4, 0.2]}>
        <Text
          fontSize={0.1}
          color={colors.three.textMuted}
          anchorX="center"
          fontWeight="bold"
        >
          {event.year}
        </Text>
      </Billboard>

      {/* Event title */}
      <Billboard position={[0, 1.35, 0]}>
        <Text
          fontSize={0.1}
          color={displayColor}
          anchorX="center"
          fontWeight={isSelected ? "bold" : "normal"}
          maxWidth={1.5}
          textAlign="center"
        >
          {event.title}
        </Text>
      </Billboard>

      {/* Description (shown on hover or selection) */}
      {showDescription && (hovered || isSelected) && event.description && (
        <Billboard position={[0, 1.7, 0]}>
          <RoundedBox args={[2, 0.4, 0.02]} radius={0.02}>
            <meshStandardMaterial color={colors.neutral[800]} transparent opacity={0.9} />
          </RoundedBox>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.08}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
            textAlign="center"
          >
            {event.description}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function TimelineBase({
  length,
  startYear,
  endYear,
}: {
  length: number;
  startYear: number;
  endYear: number;
}) {
  // Generate tick marks
  const tickYears = useMemo(() => {
    const ticks: number[] = [];
    const range = endYear - startYear;
    const interval = range <= 50 ? 10 : range <= 200 ? 25 : 50;

    for (let year = Math.ceil(startYear / interval) * interval; year <= endYear; year += interval) {
      ticks.push(year);
    }
    return ticks;
  }, [startYear, endYear]);

  return (
    <group>
      {/* Main timeline bar */}
      <Cylinder
        args={[0.03, 0.03, length, 16]}
        position={[0, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial color={colors.neutral[600]} />
      </Cylinder>

      {/* Start cap */}
      <mesh position={[-length / 2, 0, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={colors.neutral[500]} />
      </mesh>

      {/* End arrow */}
      <mesh position={[length / 2 + 0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color={colors.neutral[500]} />
      </mesh>

      {/* Tick marks and labels */}
      {tickYears.map((year) => {
        const x = ((year - startYear) / (endYear - startYear) - 0.5) * length;
        return (
          <group key={year} position={[x, 0, 0]}>
            <Cylinder
              args={[0.01, 0.01, 0.15, 8]}
              position={[0, -0.1, 0]}
            >
              <meshStandardMaterial color={colors.neutral[400]} />
            </Cylinder>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.08}
              color={colors.neutral[400]}
              anchorX="center"
            >
              {year}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export function Timeline3D({
  events = DEFAULT_EVENTS,
  startYear,
  endYear,
  animate = true,
  showDescriptions = true,
  onEventClick,
  selectedYear,
  title = "Historical Timeline",
}: Timeline3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate year range
  const yearRange = useMemo(() => {
    const years = events.map((e) => e.year);
    const minYear = startYear ?? Math.min(...years) - 10;
    const maxYear = endYear ?? Math.max(...years) + 10;
    return { min: minYear, max: maxYear };
  }, [events, startYear, endYear]);

  const timelineLength = 8;

  // Calculate positions for events
  const eventPositions = useMemo(() => {
    return events.map((event) => {
      const normalizedX =
        (event.year - yearRange.min) / (yearRange.max - yearRange.min);
      const x = (normalizedX - 0.5) * timelineLength;
      return { event, position: [x, 0, 0] as [number, number, number] };
    });
  }, [events, yearRange, timelineLength]);

  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    // Subtle floating animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
  });

  return (
    <group ref={groupRef}>
      {/* Title */}
      <Billboard position={[0, 2.2, 0]}>
        <Text
          fontSize={0.18}
          color={colors.three.text}
          anchorX="center"
          fontWeight="bold"
        >
          {title}
        </Text>
        <Text
          position={[0, -0.25, 0]}
          fontSize={0.1}
          color={colors.three.textMuted}
          anchorX="center"
        >
          {yearRange.min} - {yearRange.max}
        </Text>
      </Billboard>

      {/* Timeline base */}
      <TimelineBase
        length={timelineLength}
        startYear={yearRange.min}
        endYear={yearRange.max}
      />

      {/* Event markers */}
      {eventPositions.map(({ event, position }, index) => (
        <EventMarker
          key={`${event.year}-${index}`}
          event={event}
          position={position}
          isSelected={selectedYear === event.year}
          showDescription={showDescriptions}
          onEventClick={onEventClick}
          animate={animate}
        />
      ))}

      {/* Category legend */}
      <group position={[0, -1, 0]}>
        <Billboard>
          <Text
            position={[0, 0.15, 0]}
            fontSize={0.08}
            color={colors.three.textMuted}
            anchorX="center"
          >
            Event Categories
          </Text>
        </Billboard>
        {Object.entries(CATEGORY_COLORS).slice(0, 5).map(([category, color], i) => (
          <group key={category} position={[(i - 2) * 1.2, -0.15, 0]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <Billboard position={[0, -0.15, 0]}>
              <Text
                fontSize={0.06}
                color={colors.neutral[500]}
                anchorX="center"
              >
                {category}
              </Text>
            </Billboard>
          </group>
        ))}
      </group>
    </group>
  );
}

export default Timeline3D;
