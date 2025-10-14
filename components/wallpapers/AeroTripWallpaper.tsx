import React from 'react';

const AeroTripWallpaper: React.FC = () => (
    <>
        <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 object-cover w-full h-full group-hover:scale-110 transition-transform duration-500">
            <defs>
                <linearGradient id="skyGradientAero" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <filter id="cloudBlur">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
                </filter>
            </defs>

            {/* Sky */}
            <rect width="400" height="400" fill="url(#skyGradientAero)" />

            {/* Clouds */}
            <circle cx="50" cy="380" r="80" fill="white" opacity="0.5" filter="url(#cloudBlur)" />
            <circle cx="200" cy="400" r="100" fill="white" opacity="0.6" filter="url(#cloudBlur)" />
            <circle cx="350" cy="370" r="90" fill="white" opacity="0.5" filter="url(#cloudBlur)" />
            <circle cx="100" cy="100" r="50" fill="white" opacity="0.3" filter="url(#cloudBlur)" />
            <circle cx="300" cy="120" r="60" fill="white" opacity="0.4" filter="url(#cloudBlur)" />

            {/* Plane */}
            <g transform="translate(180, 150) rotate(-25)">
                {/* Body */}
                <path d="M 0 0 C -20 -5, -80 10, -100 15 L -90 25 C -70 20, -10 5, 0 5 Z" fill="#e2e8f0" />
                {/* Tail */}
                <path d="M -100 15 L -120 0 L -110 15 L -100 22 Z" fill="#94a3b8" />
                {/* Wing */}
                <path d="M -20 5 L -40 50 L -10 40 L -15 5 Z" fill="#cbd5e1" />
            </g>

        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <span className="relative z-10 p-4 text-left self-end">Aero Trip</span>
    </>
);

export default AeroTripWallpaper;