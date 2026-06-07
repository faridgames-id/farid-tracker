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
            className={`fixed inset-0 z-[100000] flex flex-col items-center justify-center overflow-hidden transition-all duration-800 ease-in-out ${hide ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'}`}
            style={{
                background: 'radial-gradient(circle at center, #0b1535 0%, #030818 100%)',
                fontFamily: "'Inter', sans-serif"
            }}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00d2ff] opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center max-w-[90%] w-[400px] p-8 rounded-3xl bg-[#0a1229]/60 backdrop-blur-xl border border-white/5 shadow-2xl">
                
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-[#00d2ff]/20 blur-xl rounded-full"></div>
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00d2ff]/10 to-transparent border border-white/10 flex items-center justify-center p-2">
                        <img 
                            src="/icon.png" 
                            alt="Logo" 
                            className="w-full h-full object-contain rounded-xl drop-shadow-[0_0_10px_rgba(0,210,255,0.5)]"
                            onError={(e) => {
                                // Fallback if icon.png doesn't exist
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                </div>

                <h1 className="text-2xl font-black text-white tracking-wider mb-2 text-center">FARID ENTREPRENEUR</h1>
                <p className="text-[#88A0C0] text-sm text-center mb-1">
                    Sistem Manajemen & Tracking
                </p>
                <p className="text-[#00d2ff] font-extrabold uppercase tracking-widest text-[11px] mb-8 animate-pulse text-center">
                    Track. Grow. Build.
                </p>
                
                <div className="w-full mb-8">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00d2ff] to-[#fffb00] rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(0,210,255,0.8)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-[#88A0C0] text-center mt-3 font-medium tracking-wide">
                        {statusText}
                    </p>
                </div>
                
                <button 
                    className="px-6 py-2 text-xs font-bold text-[#00d2ff] border border-[#00d2ff]/30 rounded-full hover:bg-[#00d2ff]/10 transition-colors uppercase tracking-widest"
                    onClick={handleSkip}
                >
                    Lewati
                </button>
            </div>
        </div>
    );
}
