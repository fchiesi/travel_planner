import React from 'react';

const BusTripWallpaper: React.FC = () => (
    <>
        <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 object-cover w-full h-full group-hover:scale-110 transition-transform duration-500">
            <defs>
                <linearGradient id="skyGradientBus" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a5b4fc" />
                    <stop offset="60%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
            </defs>

            {/* Sky */}
            <rect width="400" height="400" fill="url(#skyGradientBus)" />

            {/* Ground */}
            <rect y="300" width="400" height="100" fill="#44403c" />
            <rect y="300" width="400" height="10" fill="#292524" />
            
            {/* Dashed Lines */}
            <g>
                <rect x="0" y="303" width="50" height="4" fill="#f59e0b" />
                <rect x="80" y="303" width="50" height="4" fill="#f59e0b" />
                <rect x="160" y="303" width="50" height="4" fill="#f59e0b" />
                <rect x="240" y="303" width="50" height="4" fill="#f59e0b" />
                <rect x="320" y="303" width="50" height="4" fill="#f59e0b" />
                <rect x="400" y="303" width="50" height="4" fill="#f59e0b" />
            </g>

            {/* Bus Body */}
            <path d="M80,300 C100,210 280,210 320,300 Z" fill="#0369a1" />
            <rect x="85" y="270" width="230" height="30" fill="#0ea5e9" />
            <rect x="80" y="290" width="240" height="20" fill="#075985" />
            
            {/* Wheels */}
            <circle cx="140" cy="300" r="25" fill="#1e293b" />
            <circle cx="140" cy="300" r="10" fill="#64748b" />
            <circle cx="260" cy="300" r="25" fill="#1e293b" />
            <circle cx="260" cy="300" r="10" fill="#64748b" />
            
            {/* Headlight */}
            <path d="M70,280 L85,270 L85,290 Z" fill="#facc15" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <span className="relative z-10 p-4 text-left self-end">Bus Trip</span>
    </>
);

export default BusTripWallpaper;