'use client';

import { useAppSelector } from '@/hooks/useRedux';
import { AudioToggle } from '@/components/common/AudioToggle';

export function Header() {
  const totalStars = useAppSelector((state) => state.session.totalStars);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-coral to-coral/90 shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo Area */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="28" fill="#FF7F6B" />
              <path d="M20 25L30 15L40 25L30 35L20 25Z" fill="#FFF8F0" />
              <circle cx="30" cy="38" r="8" fill="#FFD93D" />
              <circle cx="30" cy="38" r="4" fill="#4A3728" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold text-cream sm:text-2xl">
            Kaelyn&apos;s Academy
          </h1>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Audio Toggle */}
          <AudioToggle />

          {/* Star Badge */}
          <div className="flex items-center gap-2 rounded-full bg-cream/20 px-4 py-2 backdrop-blur-sm">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#FFD93D"
                stroke="#E5B800"
                strokeWidth="1"
              />
            </svg>
            <span className="font-display text-lg font-bold text-cream">
              {totalStars}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
