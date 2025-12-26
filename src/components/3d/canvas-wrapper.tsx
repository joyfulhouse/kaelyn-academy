"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import { cn } from "@/lib/utils";

interface Scene3DProps extends Omit<CanvasProps, "children"> {
  children: ReactNode;
  className?: string;
  controls?: boolean;
  shadows?: boolean;
  environment?: "apartment" | "city" | "dawn" | "forest" | "lobby" | "night" | "park" | "studio" | "sunset" | "warehouse";
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  loading?: ReactNode;
  ageGroup?: "early" | "elementary" | "middle" | "high";
}

function DefaultLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading 3D...</span>
      </div>
    </div>
  );
}

export function Scene3D({
  children,
  className,
  controls = true,
  shadows = true,
  environment = "studio",
  cameraPosition = [0, 2, 5],
  cameraFov = 50,
  loading,
  ageGroup = "elementary",
  ...canvasProps
}: Scene3DProps) {
  // Adjust controls based on age group
  const controlsConfig = {
    early: { enableZoom: false, enablePan: false, autoRotate: true, autoRotateSpeed: 1 },
    elementary: { enableZoom: true, enablePan: false, autoRotate: false },
    middle: { enableZoom: true, enablePan: true, autoRotate: false },
    high: { enableZoom: true, enablePan: true, autoRotate: false },
  };

  return (
    <div className={cn("relative h-[400px] w-full rounded-lg overflow-hidden", className)}>
      <Suspense fallback={loading ?? <DefaultLoading />}>
        <Canvas
          shadows={shadows}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          {...canvasProps}
        >
          <PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />

          {controls && (
            <OrbitControls
              {...controlsConfig[ageGroup]}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2}
              minDistance={2}
              maxDistance={20}
            />
          )}

          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow={shadows}
            shadow-mapSize={[2048, 2048]}
          />

          <Environment preset={environment} />

          {shadows && (
            <ContactShadows
              position={[0, -0.01, 0]}
              opacity={0.5}
              scale={10}
              blur={2}
              far={4}
            />
          )}

          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}

// Simplified canvas for performance-sensitive contexts
export function SimpleScene3D({
  children,
  className,
  cameraPosition = [0, 2, 5],
}: {
  children: ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
}) {
  return (
    <div className={cn("relative h-[300px] w-full rounded-lg overflow-hidden", className)}>
      <Suspense fallback={<DefaultLoading />}>
        <Canvas dpr={1} gl={{ antialias: false }}>
          <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}
