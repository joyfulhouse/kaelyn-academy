/**
 * 3D Book Visualization
 * Interactive 3D book with page turning animation
 *
 * Accessibility: Provides visual representation of a book with
 * page content for reading comprehension lessons
 */

"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "@/lib/colors";

interface Book3DProps {
  title?: string;
  author?: string;
  pages?: number;
  currentPage?: number;
  color?: string;
  animate?: boolean;
  showPageContent?: boolean;
  onPageClick?: (page: number) => void;
}

interface PageProps {
  index: number;
  isOpen: boolean;
  currentPage: number;
  bookWidth: number;
  bookHeight: number;
  onPageClick?: (page: number) => void;
}

function BookPage({
  index,
  isOpen,
  currentPage,
  bookWidth,
  bookHeight,
  onPageClick,
}: PageProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate target rotation based on whether page is turned
  const isTurned = index < currentPage;
  const targetRotation = isTurned ? Math.PI * 0.95 : (isOpen ? Math.PI * 0.05 : 0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Smooth rotation animation
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation,
      delta * 3
    );
  });

  // Page stacking offset
  const stackOffset = isOpen ? (index - currentPage) * 0.003 : index * 0.002;

  return (
    <group position={[0, 0, stackOffset]}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onPageClick?.(index)}
        position={[bookWidth / 4, 0, 0]}
      >
        <planeGeometry args={[bookWidth / 2 - 0.02, bookHeight - 0.1]} />
        <meshStandardMaterial
          color={hovered ? colors.neutral[100] : colors.neutral[50]}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Page number on front */}
      <Text
        position={[bookWidth / 2 - 0.1, -bookHeight / 2 + 0.15, 0.001]}
        fontSize={0.06}
        color={colors.neutral[400]}
        anchorX="right"
      >
        {index + 1}
      </Text>
      {/* Simple text lines to represent content */}
      {isOpen && Math.abs(index - currentPage) <= 1 && (
        <group position={[bookWidth / 4, 0, 0.002]}>
          {[0.25, 0.15, 0.05, -0.05, -0.15, -0.25].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <planeGeometry args={[bookWidth / 2 - 0.15, 0.015]} />
              <meshStandardMaterial color={colors.neutral[300]} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function BookCover({
  width,
  height,
  depth,
  color,
  isBack,
  isOpen,
}: {
  width: number;
  height: number;
  depth: number;
  color: string;
  isBack?: boolean;
  isOpen: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = isOpen ? (isBack ? -Math.PI * 0.45 : Math.PI * 0.45) : 0;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation,
      delta * 3
    );
  });

  const pivotPosition = isBack ? width / 2 : -width / 2;

  return (
    <group position={[pivotPosition, 0, 0]}>
      <RoundedBox
        ref={meshRef}
        args={[width, height, depth]}
        radius={0.01}
        position={[-pivotPosition, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
        />
      </RoundedBox>
    </group>
  );
}

function BookSpine({
  width,
  height,
  depth,
  color,
}: {
  width: number;
  height: number;
  depth: number;
  color: string;
}) {
  return (
    <RoundedBox
      args={[width, height, depth]}
      radius={0.01}
      position={[0, 0, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.1}
      />
    </RoundedBox>
  );
}

export function Book3D({
  title = "My Story",
  author = "Author Name",
  pages = 12,
  currentPage = 0,
  color = colors.success.DEFAULT,
  animate = true,
  showPageContent = true,
  onPageClick,
}: Book3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [internalPage, setInternalPage] = useState(currentPage);
  const [hovered, setHovered] = useState(false);

  const bookWidth = 1.2;
  const bookHeight = 1.6;
  const coverThickness = 0.03;
  const spineWidth = 0.08;

  // Calculate darker shade for spine
  const spineColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(0.7);
    return `#${c.getHexString()}`;
  }, [color]);

  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    // Gentle floating animation when closed
    if (!isOpen) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.02;
    }
  });

  const handleClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handlePageClick = useCallback((page: number) => {
    if (page === internalPage) {
      setInternalPage((p) => Math.min(p + 1, pages - 1));
    } else {
      setInternalPage(page);
    }
    onPageClick?.(page);
  }, [internalPage, pages, onPageClick]);

  // Generate pages
  const pageElements = useMemo(() => {
    return Array.from({ length: Math.min(pages, 20) }).map((_, i) => (
      <BookPage
        key={i}
        index={i}
        isOpen={isOpen}
        currentPage={internalPage}
        bookWidth={bookWidth}
        bookHeight={bookHeight}
        onPageClick={showPageContent ? handlePageClick : undefined}
      />
    ));
  }, [pages, isOpen, internalPage, showPageContent, handlePageClick, bookWidth, bookHeight]);

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Front Cover */}
      <BookCover
        width={bookWidth / 2}
        height={bookHeight}
        depth={coverThickness}
        color={hovered && !isOpen ? colors.success.light : color}
        isBack={false}
        isOpen={isOpen}
      />

      {/* Title on front cover */}
      {!isOpen && (
        <group position={[0, 0, coverThickness / 2 + 0.001]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.12}
            color={colors.neutral[50]}
            anchorX="center"
            anchorY="middle"
            maxWidth={bookWidth - 0.2}
            textAlign="center"
            fontWeight="bold"
          >
            {title}
          </Text>
          <Text
            position={[0, -0.1, 0]}
            fontSize={0.07}
            color={colors.neutral[200]}
            anchorX="center"
            anchorY="middle"
          >
            {author}
          </Text>
        </group>
      )}

      {/* Spine */}
      <BookSpine
        width={spineWidth}
        height={bookHeight}
        depth={coverThickness}
        color={spineColor}
      />

      {/* Pages */}
      <group position={[spineWidth / 2, 0, 0]}>
        {pageElements}
      </group>

      {/* Back Cover */}
      <BookCover
        width={bookWidth / 2}
        height={bookHeight}
        depth={coverThickness}
        color={color}
        isBack={true}
        isOpen={isOpen}
      />

      {/* Labels */}
      <group position={[0, -bookHeight / 2 - 0.3, 0]}>
        <Text
          fontSize={0.12}
          color={colors.three.text}
          anchorX="center"
          fontWeight="bold"
        >
          {title}
        </Text>
        {isOpen && (
          <Text
            position={[0, -0.18, 0]}
            fontSize={0.08}
            color={colors.three.textMuted}
            anchorX="center"
          >
            {`Page ${internalPage + 1} of ${pages}`}
          </Text>
        )}
        {!isOpen && (
          <Text
            position={[0, -0.18, 0]}
            fontSize={0.08}
            color={colors.three.textMuted}
            anchorX="center"
          >
            Click to open
          </Text>
        )}
      </group>
    </group>
  );
}

export default Book3D;
