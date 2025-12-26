"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white"
    >
      <div className="text-center max-w-md">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
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
              className="text-gray-400"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
              <path d="m2 2 20 20" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          It looks like you&apos;ve lost your internet connection. Don&apos;t worry
          - some of your lessons and progress are saved for offline access.
        </p>

        {/* Available Offline */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Offline
          </h2>
          <ul className="text-left space-y-3">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                ✓
              </span>
              <span className="text-gray-700">Previously loaded lessons</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                ✓
              </span>
              <span className="text-gray-700">Your saved progress</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                ✓
              </span>
              <span className="text-gray-700">Practice problems (cached)</span>
            </li>
          </ul>
        </div>

        {/* Unavailable Offline */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Requires Internet
          </h2>
          <ul className="text-left space-y-3 text-gray-600">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                ✗
              </span>
              <span>AI Tutor conversations</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                ✗
              </span>
              <span>New lesson content</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
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
        <p className="text-sm text-gray-500 mt-8">
          We&apos;ll automatically sync your progress when you&apos;re back online.
        </p>
      </div>
    </main>
  );
}
