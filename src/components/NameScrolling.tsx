import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Guide } from '../types';

interface NameScrollingProps {
  guides: Guide[];
  isScrolling: boolean;
  onComplete: (winners: Guide[]) => void;
  winnerCount: number;
}

export const NameScrolling: React.FC<NameScrollingProps> = ({
  guides,
  isScrolling,
  onComplete,
  winnerCount
}) => {
  const [currentName, setCurrentName] = useState('');
  const [phase, setPhase] = useState<'delay' | 'scrolling' | 'selecting' | 'complete'>('delay');
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedWinners, setSelectedWinners] = useState<Guide[]>([]);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);

  useEffect(() => {
    if (!isScrolling || guides.length === 0) return;

    setPhase('delay');
    setTimeLeft(10);
    setSelectedWinners([]);
    setCurrentWinnerIndex(0);
    setCurrentName('🎪 Get ready for the magic... 🎪');

    // Countdown phase
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setPhase('scrolling');
          startScrolling();
          return 0;
        }
        setCurrentName(`🎲 Starting in ${prev - 1}... 🎲`);
        return prev - 1;
      });
    }, 1000);

    const startScrolling = () => {
      let nameIndex = 0;
      let speed = 50;
      let scrollDuration = 0;
      
      const scrollNames = () => {
        setCurrentName(guides[nameIndex].name);
        nameIndex = (nameIndex + 1) % guides.length;
        scrollDuration += speed;
        
        // Scroll for 5 seconds, then start selecting winners
        if (scrollDuration >= 5000) {
          setPhase('selecting');
          selectWinnersWithDelay();
          return;
        }
        
        // Gradually increase speed for dramatic effect
        if (speed < 100) {
          speed = Math.min(speed + 5, 100);
        }
        
        setTimeout(scrollNames, speed);
      };

      scrollNames();
    };

    const selectWinnersWithDelay = () => {
      // Pre-calculate all winners using weighted selection
      const winners: Guide[] = [];
      const availableGuides = [...guides];
      
      for (let i = 0; i < winnerCount && availableGuides.length > 0; i++) {
        const totalWeight = availableGuides.reduce((sum, guide) => sum + guide.totalTickets, 0);
        let random = Math.random() * totalWeight;
        
        let selectedIndex = 0;
        for (let j = 0; j < availableGuides.length; j++) {
          random -= availableGuides[j].totalTickets;
          if (random <= 0) {
            selectedIndex = j;
            break;
          }
        }
        
        const winner = availableGuides.splice(selectedIndex, 1)[0];
        winners.push(winner);
      }

      setSelectedWinners(winners);
      
      // Reveal winners one by one with 15-second delays
      const revealWinner = (index: number) => {
        if (index >= winners.length) {
          setPhase('complete');
          setTimeout(() => {
            onComplete(winners);
          }, 2000);
          return;
        }

        setCurrentWinnerIndex(index);
        setCurrentName(`🏆 WINNER #${index + 1}: ${winners[index].name} 🏆`);
        
        setTimeout(() => {
          revealWinner(index + 1);
        }, 15000); // 15-second delay between winners
      };

      revealWinner(0);
    };

    return () => {
      clearInterval(countdownInterval);
    };
  }, [isScrolling, guides, onComplete, winnerCount]);

  if (!isScrolling) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-blue-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="text-center w-full max-w-4xl">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-32 h-32 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center"
          >
            <span className="text-4xl">🎰</span>
          </motion.div>
        </motion.div>

        {phase === 'delay' && (
          <motion.h2
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 40px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)"
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-4xl md:text-5xl font-bold text-white mb-8"
          >
            🎲 STARTING IN {timeLeft} 🎲
          </motion.h2>
        )}

        {(phase === 'scrolling' || phase === 'selecting') && (
          <motion.h2
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 40px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)"
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-3xl md:text-4xl font-bold text-white mb-8"
          >
            {phase === 'scrolling' ? '🎰 DRAWING WINNERS 🎰' : '🏆 SELECTING WINNERS 🏆'}
          </motion.h2>
        )}

        {/* Main Display Box */}
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl min-h-[200px] flex items-center justify-center">
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentName + phase}
                initial={{ 
                  x: phase === 'scrolling' ? (Math.random() > 0.5 ? -100 : 100) : 0,
                  y: phase === 'scrolling' ? (Math.random() > 0.5 ? -20 : 20) : 50,
                  opacity: 0, 
                  scale: 0.8,
                  rotateX: phase === 'scrolling' ? 90 : 0
                }}
                animate={{ 
                  x: 0,
                  y: 0,
                  opacity: 1, 
                  scale: phase === 'selecting' ? 1.1 : 1,
                  rotateX: 0
                }}
                exit={{ 
                  x: phase === 'scrolling' ? (Math.random() > 0.5 ? 100 : -100) : 0,
                  y: phase === 'scrolling' ? (Math.random() > 0.5 ? 20 : -20) : -50,
                  opacity: 0, 
                  scale: 0.8,
                  rotateX: phase === 'scrolling' ? -90 : 0
                }}
                transition={{ 
                  duration: phase === 'scrolling' ? 0.2 : 0.6,
                  type: phase === 'selecting' ? "spring" : "tween",
                  stiffness: phase === 'selecting' ? 100 : undefined,
                  damping: phase === 'selecting' ? 15 : undefined
                }}
                className="text-center"
              >
                <div className={`font-bold text-white leading-tight px-4 ${
                  phase === 'selecting' 
                    ? 'text-2xl md:text-4xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent' 
                    : 'text-xl md:text-3xl'
                }`}>
                  {currentName || 'Preparing...'}
                </div>
                
                {phase === 'selecting' && selectedWinners[currentWinnerIndex] && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 text-lg text-blue-200"
                  >
                    {selectedWinners[currentWinnerIndex].department} • {selectedWinners[currentWinnerIndex].totalTickets} tickets
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/80 mt-6 text-lg"
        >
          {phase === 'delay' && '✨ Building suspense... ✨'}
          {phase === 'scrolling' && '✨ The magic is happening... ✨'}
          {phase === 'selecting' && `✨ Revealing winner ${currentWinnerIndex + 1} of ${winnerCount}... ✨`}
          {phase === 'complete' && '🎉 All winners selected! 🎉'}
        </motion.div>

        {phase === 'selecting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <div className="flex justify-center space-x-2">
              {Array.from({ length: winnerCount }).map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    index < currentWinnerIndex 
                      ? 'bg-green-400 shadow-lg' 
                      : index === currentWinnerIndex 
                        ? 'bg-yellow-400 shadow-lg animate-pulse' 
                        : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-white/60 text-sm mt-2">
              Winner {currentWinnerIndex + 1} of {winnerCount}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};