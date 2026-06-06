'use client';

import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#061021]">
      {/* Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#385B94]/25 blur-[100px] animate-blob mix-blend-screen" />
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#5889DB]/20 blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
      <div className="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#2B4776]/30 blur-[120px] animate-blob animation-delay-4000 mix-blend-screen" />
      <div className="absolute bottom-[10%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-[#4871B6]/20 blur-[100px] animate-blob mix-blend-screen" />

      {/* Floating Rocket Background Element */}
      <motion.div 
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] right-[5%] lg:right-[15%] opacity-[0.15] rotate-[25deg]"
      >
        <Rocket size={400} strokeWidth={0.5} color="#5889DB" fill="#2B4776" />
      </motion.div>
      
      {/* Smaller Distant Rocket */}
      <motion.div 
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[40%] left-[10%] opacity-[0.08] rotate-[65deg]"
      >
        <Rocket size={150} strokeWidth={1} color="#385B94" fill="transparent" />
      </motion.div>

      {/* Abstract Waves at the Bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-[35vh] opacity-30 mix-blend-screen">
          <path fill="#2B4776" fillOpacity="0.8" d="M0,256L48,229.3C96,203,192,149,288,149.3C384,149,480,203,576,213.3C672,224,768,192,864,165.3C960,139,1056,117,1152,133.3C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#5889DB" fillOpacity="0.4" d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,149.3C672,149,768,171,864,197.3C960,224,1056,256,1152,261.3C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#4871B6" fillOpacity="0.2" d="M0,192L48,176C96,160,192,128,288,144C384,160,480,224,576,240C672,256,768,224,864,197.3C960,171,1056,149,1152,149.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      {/* Dim Overlay to ensure the dashboard content remains readable */}
      <div className="absolute inset-0 bg-[#061021]/50 backdrop-blur-[2px]" />
    </div>
  );
}
