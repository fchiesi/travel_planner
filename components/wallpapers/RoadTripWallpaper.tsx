import React from 'react';

const RoadTripWallpaper: React.FC = () => (
    <>
        <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 object-cover w-full h-full group-hover:scale-110 transition-transform duration-500">
            <defs>
                <linearGradient id="skyGradientRoad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fca5a5" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
                <filter id="blurFilter">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                </filter>
            </defs>

            {/* Sky */}
            <rect width="400" height="400" fill="url(#skyGradientRoad)" />
            
            {/* Sun */}
            <circle cx="200" cy="220" r="40" fill="#fffbeb" filter="url(#blurFilter)" />
            <circle cx="200" cy="220" r="30" fill="#fef08a" />
            
            {/* Mountains */}
            <path d="M-50,250 Q100,150 200,250 T450,250 L450,400 L-50,400 Z" fill="#312e81" />
            <path d="M-50,280 Q150,200 250,280 T450,280 L450,400 L-50,400 Z" fill="#4338ca" opacity="0.8" />

            {/* Road */}
            <path d="M160,400 L200,250 L240,400 Z" fill="#4b5563" />
            <path d="M195,400 L200,250 L205,400 Z" fill="#d1d5db" />

            {/* Dashed Lines */}
            <rect x="198.5" y="270" width="3" height="15" fill="white" />
            <rect x="198.5" y="300" width="3" height="15" fill="white" />
            <rect x="198.5" y="330" width="3" height="15" fill="white" />
            <rect x="198.5" y="360" width="3" height="15" fill="white" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <span className="relative z-10 p-4 text-left self-end">Road Trip</span>
    </>
);

export default RoadTripWallpaper;