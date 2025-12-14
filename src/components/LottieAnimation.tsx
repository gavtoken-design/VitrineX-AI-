
import React, { useEffect, useState, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

export interface LottieAnimationProps {
    animationUrl?: string;
    animationData?: any;
    loop?: boolean;
    autoplay?: boolean;
    speed?: number;
    width?: number | string;
    height?: number | string;
    className?: string;
    onComplete?: () => void;
    onLoopComplete?: () => void;
    controls?: boolean;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
    animationUrl,
    animationData,
    loop = true,
    autoplay = true,
    speed = 1,
    width = '100%',
    height = '100%',
    className = '',
    onComplete,
    onLoopComplete,
    controls = false,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<AnimationItem | null>(null);
    const [isPlaying, setIsPlaying] = useState(autoplay);
    const [loadedData, setLoadedData] = useState<any>(null);

    // Load animation data from URL
    useEffect(() => {
        if (animationUrl && !animationData) {
            fetch(animationUrl)
                .then(response => response.json())
                .then(data => setLoadedData(data))
                .catch(error => console.error('Erro ao carregar animação:', error));
        } else if (animationData) {
            setLoadedData(animationData);
        }
    }, [animationUrl, animationData]);

    // Initialize Lottie animation
    useEffect(() => {
        if (!containerRef.current || !loadedData) return;

        // Destroy previous animation
        if (animationRef.current) {
            animationRef.current.destroy();
        }

        // Create new animation
        animationRef.current = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay,
            animationData: loadedData,
        });

        // Set speed
        animationRef.current.setSpeed(speed);

        // Event listeners
        if (onComplete) {
            animationRef.current.addEventListener('complete', onComplete);
        }

        if (onLoopComplete) {
            animationRef.current.addEventListener('loopComplete', onLoopComplete);
        }

        // Cleanup
        return () => {
            if (animationRef.current) {
                animationRef.current.destroy();
            }
        };
    }, [loadedData, loop, autoplay, speed, onComplete, onLoopComplete]);

    // Control functions
    const play = () => {
        animationRef.current?.play();
        setIsPlaying(true);
    };

    const pause = () => {
        animationRef.current?.pause();
        setIsPlaying(false);
    };

    const stop = () => {
        animationRef.current?.stop();
        setIsPlaying(false);
    };

    const restart = () => {
        animationRef.current?.goToAndPlay(0);
        setIsPlaying(true);
    };

    return (
        <div className={`lottie-animation-wrapper ${className}`}>
            <div
                ref={containerRef}
                style={{ width, height }}
                className="lottie-animation-container"
            />

            {controls && (
                <div className="lottie-controls flex items-center justify-center gap-2 mt-2">
                    {isPlaying ? (
                        <button
                            onClick={pause}
                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                        >
                            ⏸ Pausar
                        </button>
                    ) : (
                        <button
                            onClick={play}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                            ▶ Play
                        </button>
                    )}
                    <button
                        onClick={stop}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                    >
                        ⏹ Stop
                    </button>
                    <button
                        onClick={restart}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                    >
                        🔄 Reiniciar
                    </button>
                </div>
            )}
        </div>
    );
};

export default LottieAnimation;
