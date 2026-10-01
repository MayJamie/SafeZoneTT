"use client";

import React from "react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <div className="relative flex items-center justify-center">
        {/* Animated Rotating Shield Ring */}
        <div className="animate-spin text-rose-500 w-16 h-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0 0 12 2.714Z"
            />
          </svg>
        </div>
      </div>

      <h1 className="mt-4 text-2xl font-extrabold tracking-wider text-white uppercase">
        SafeZone <span className="text-rose-500">TT</span>
      </h1>
      <p className="text-slate-400 text-xs mt-1 animate-pulse">Loading incident map...</p>
    </div>
  );
}