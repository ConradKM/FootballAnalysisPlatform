"use client";
import Threads from './components/Threads';
import Link from "next/link";
import BlurText from "./components/BlurText";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import PixelBlast from './components/PixelBlast';

export default function Home() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768); // Desktop breakpoint
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] sm:h-[60vh] xs:h-[60vh] bg-gray-50">
        {isDesktop && (
          <div style={{ width: '100%', height : '100%', position: 'relative' }}>
            <PixelBlast
              variant="diamond"
              pixelSize={6}
              color="#7CFC00"
              patternScale={4}
              patternDensity={1.5}
              pixelSizeJitter={0}
              enableRipples
              speed={0.6}
              edgeFade={0}
            />
          </div>
          
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white pointer-events-none" />

        {/* Text & Buttons overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 px-4 text-center">
          <BlurText
            text="Football Data Visualised"
            delay={150}
            animateBy="words"
            direction="top"
            className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md mx-auto"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 px-4 py-3 text-center ">
              <div className="text-5l sm:text-1xl md:text-2xl lg:text-3xl text-black leading-tight">
                Intro
              </div>
              
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md mx-auto"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 px-4 py-3 text-center ">
              <div className="text-5l sm:text-1xl md:text-2xl lg:text-3xl text-black leading-tight">
                Intro
              </div>
              
            </div>
            
            <Link className="bg-black hover:bg-white hover:text-black text-white font-bold py-3 px-6 rounded-lg transition w-full sm:w-auto" href="/match">
              See Matches
            </Link>
            <button className="bg-transparent border-2 border-white hover:bg-green-50 hover:text-black text-black font-bold py-3 px-6 rounded-lg transition w-full sm:w-auto">
              Learn More
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
