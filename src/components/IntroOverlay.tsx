'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function IntroOverlay() {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Menghubungkan Sistem...');
    const [hide, setHide] = useState(false);
    const [isFullyHidden, setIsFullyHidden] = useState(false);

    useEffect(() => {
        // Cek sessionStorage agar intro tidak muncul terus menerus jika sudah dilihat
        if (typeof window !== 'undefined') {
            const hasSeenIntro = sessionStorage.getItem('farid_tracker_intro');
            if (hasSeenIntro) {
                setHide(true);
                setIsFullyHidden(true);
                return;
            }
        }

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 8;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                setStatusText('Sistem Siap!');
                setTimeout(() => {
                    setHide(true);
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('farid_tracker_intro', 'true');
                    }
                    setTimeout(() => {
                        setIsFullyHidden(true);
                    }, 800); // match CSS fade-out duration
                }, 500);
            } else {
                if (currentProgress > 80) setStatusText('Menyiapkan Dashboard...');
                else if (currentProgress > 50) setStatusText('Sinkronisasi Database...');
                else if (currentProgress > 20) setStatusText('Memuat Konfigurasi...');
                setProgress(currentProgress);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleSkip = () => {
        setHide(true);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('farid_tracker_intro', 'true');
        }
        setTimeout(() => {
            setIsFullyHidden(true);
        }, 800);
    };

    if (isFullyHidden) return null;

    return (
        <div 
            className={`fixed inset-0 z-[100000] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out ${hide ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            style={{
                backgroundColor: '#020611',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            {/* Extremely subtle background mesh/gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f1d3a]/20 via-[#020611] to-[#020611]"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-sm px-6 h-full">
                
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                    {/* Logo Premium Reveal */}
                    <div className="relative mb-10 group animate-[fade-in-up_1s_ease-out]">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-white/[0.05] to-white/[0.01] border border-white/[0.05] p-4 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite_linear]"></div>
                            <img 
                                src="/icon.png" 
                                alt="Logo" 
                                className="w-full h-full object-contain drop-shadow-lg"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    </div>

                    {/* Premium Minimalist Typography */}
                    <div className="flex flex-col items-center animate-[fade-in-up_1.2s_ease-out_both]">
                        <h1 className="text-2xl tracking-[0.2em] mb-1 flex items-center gap-2">
                            <span className="font-light text-white/70">FARID</span>
                            <span className="font-bold text-white">TRACKER</span>
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-[#00d2ff]/70 font-medium mt-3">
                            Track &bull; Grow &bull; Build
                        </p>
                    </div>
                </div>

                {/* Elegant Bottom Section */}
                <div className="w-full pb-16 flex flex-col items-center animate-[fade-in_1.5s_ease-out_both]">
                    <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mb-6 relative">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00d2ff] to-[#3b82f6] rounded-full transition-all duration-200 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-white/40 tracking-widest font-light mb-8 h-4">
                        {statusText}
                    </p>
                    
                    <button 
                        className="text-[10px] text-white/30 hover:text-white/80 transition-colors uppercase tracking-[0.2em] pb-1 border-b border-transparent hover:border-white/30"
                        onClick={handleSkip}
                    >
                        Lewati Intro
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
}
