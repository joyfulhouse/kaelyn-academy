"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-info/5 to-background"
    >
      <div className="text-center max-w-md">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
              <path d="m2 2 20 20" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8">
          It looks like you&apos;ve lost your internet connection. Don&apos;t worry
          - some of your lessons and progress are saved for offline access.
        </p>

        {/* Available Offline */}
        <div className="bg-card rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Available Offline
          </h2>
          <ul className="text-left space-y-3">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center text-success">
                ✓
              </span>
              <span className="text-foreground">Previously loaded lessons</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center text-success">
                ✓
              </span>
              <span className="text-foreground">Your saved progress</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center text-success">
                ✓
              </span>
              <span className="text-foreground">Practice problems (cached)</span>
            </li>
          </ul>
        </div>

        {/* Unavailable Offline */}
        <div className="bg-muted/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Requires Internet
          </h2>
          <ul className="text-left space-y-3 text-muted-foreground">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                ✗
              </span>
              <span>AI Tutor conversations</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                ✗
              </span>
              <span>New lesson content</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                ✗
              </span>
              <span>Syncing progress to cloud</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
          >
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              View Cached Content
            </Button>
          </Link>
        </div>

        {/* Status indicator */}
        <p className="text-sm text-muted-foreground mt-8">
          We&apos;ll automatically sync your progress when you&apos;re back online.
        </p>
      </div>
    </main>
  );
}
