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
            className={`fixed inset-0 z-[100000] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out ${hide ? 'opacity-0 pointer-events-none scale-110 blur-md' : 'opacity-100 scale-100 blur-0'}`}
            style={{
                background: 'radial-gradient(circle at center, #09132b 0%, #030814 100%)',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            {/* Background ambient glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00d2ff] opacity-[0.03] rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#fffb00] opacity-[0.02] rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            <div className="relative z-10 flex flex-col items-center max-w-[90%] w-[420px] p-10 rounded-[2rem] bg-gradient-to-b from-[#0a142c]/80 to-[#040916]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
                
                {/* Logo Section */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-[#00d2ff]/30 blur-2xl rounded-full scale-110 group-hover:bg-[#00d2ff]/40 transition-all duration-700"></div>
                    <div className="relative w-28 h-28 rounded-[1.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/20 flex items-center justify-center p-3 shadow-2xl">
                        <img 
                            src="/icon.png" 
                            alt="Logo" 
                            className="w-full h-full object-contain rounded-xl drop-shadow-[0_8px_16px_rgba(0,210,255,0.6)]"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                </div>

                {/* Typography */}
                <h1 className="text-3xl font-black tracking-tight mb-2 text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-sm">
                    FARID <br/>ENTREPRENEUR
                </h1>
                <p className="text-[#88A0C0] text-sm text-center mb-1 font-medium">
                    Sistem Manajemen & Tracking
                </p>
                <p className="text-[#00d2ff] font-extrabold uppercase tracking-[0.3em] text-[10px] mb-10 animate-pulse text-center">
                    Track. Grow. Build.
                </p>
                
                {/* Progress Bar */}
                <div className="w-full mb-10">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00d2ff] via-[#00a2ff] to-[#fffb00] rounded-full transition-all duration-150 ease-out shadow-[0_0_15px_rgba(0,210,255,0.8)]"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                    <p className="text-[11px] text-[#88A0C0] text-center mt-4 font-semibold tracking-wider uppercase">
                        {statusText}
                    </p>
                </div>
                
                {/* Button */}
                <button 
                    className="px-8 py-2.5 text-xs font-bold text-[#00d2ff] border border-[#00d2ff]/40 rounded-full hover:bg-[#00d2ff] hover:text-black hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all duration-300 uppercase tracking-widest active:scale-95"
                    onClick={handleSkip}
                >
                    Lewati
                </button>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
}
