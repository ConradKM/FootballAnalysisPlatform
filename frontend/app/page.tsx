"use client";
import Link from "next/link";
import BlurText from "./components/BlurText";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import PixelBlast from './components/PixelBlast';
import CardSwap, { Card } from './components/CardSwap';
import Image from "next/image";
import card1image from "@/app/components/images/Card1.png"
import card2image from "@/app/components/images/Card2.png"
import ShinyText from './components/ShinyText';

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
        {(
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
            className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md mx-auto"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 px-4 py-3 text-center ">
              <div className="text-5l sm:text-1xl md:text-2xl lg:text-3xl text-black leading-tight">
                
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

              </div>
              
            </div>
            
            <Link className="bg-black hover:bg-white hover:text-black text-white font-bold py-3 px-6 rounded-lg transition w-full sm:w-auto" href="/match">
              See Matches
            </Link>
            <button className="bg-transparent border-2 border-black hover:bg-green-50 hover:text-black text-black font-bold py-3 px-6 rounded-lg transition w-full sm:w-auto">
              Learn More
            </button>
          </motion.div>
        </div>
      </div>

      
<div className="w-full mt-12 pl-4 md:pl-8">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
    {/* Left: Text */}
    <div className="col-span-1 flex flex-col justify-start space-y-4">
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-black">Simple.</h1>
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-black">Clean.</h1>
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-black">Concise.</h1>
    </div>

    {/* Right: CardSwap */}
    <div className="col-span-3 justify-end relative h-[500px] ">
      
      <CardSwap
        cardDistance={60}
        verticalDistance={70}
        delay={5000}
        pauseOnHover={false}
        height={500}
        width="80%"
      >
        {/* Card 1 */}
        <Card>
          <div className="relative w-full h-full">
            <Image
              src={card1image}
              alt="Premier League Matches"
              fill
              className="object-cover rounded-lg"
              priority
            />
            <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent text-white">
              <h3 className="text-xl font-bold">Premier League Matches</h3>
            </div>
          </div>
        </Card>

        {/* Card 2 */}
        <Card>
          <div className="relative w-full h-full">
            <Image
              src={card2image}
              alt="In-depth Match Analysis"
              fill
              className="object-cover rounded-lg"
              priority
            />
            <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent text-white">
              <h3 className="text-xl font-bold">In-depth Match Analysis</h3>
            </div>
          </div>
        </Card>

        {/* Card 3 */}
        <Card>
          <div className="relative w-full h-full p-4 bg-gray-100 rounded-lg flex flex-col justify-center">
            <h3 className="text-xl font-bold">Card 3</h3>
            <p className="mt-2">Your content here</p>
          </div>
        </Card>
      </CardSwap>
    </div>
  </div>
</div>


  D
</div>
  );
}
