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
  const [currentGuide, setCurrentGuide] = useState<Guide | null>(null);
  const [phase, setPhase] = useState<'delay' | 'scrolling' | 'selecting' | 'complete'>('delay');
  const [timeLeft, setTimeLeft] = useState(3);
  const [selectedWinners, setSelectedWinners] = useState<Guide[]>([]);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);

  useEffect(() => {
    if (!isScrolling || guides.length === 0) return;

    setPhase('delay');
    setTimeLeft(3);
    setSelectedWinners([]);
    setCurrentWinnerIndex(0);
    setCurrentGuide(null);

    // Countdown phase
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setPhase('scrolling');
          startScrolling();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const startScrolling = () => {
      let nameIndex = 0;
      let scrollDuration = 0;
      const scrollSpeed = 50; // Much faster scrolling - 50ms intervals
      const totalScrollTime = 5000; // 5 seconds of scrolling
      
      const scrollNames = () => {
        if (guides.length > 0) {
          setCurrentGuide(guides[nameIndex]);
          nameIndex = (nameIndex + 1) % guides.length;
        }
        scrollDuration += scrollSpeed;
        
        // After scrolling time, start selecting winners
        if (scrollDuration >= totalScrollTime) {
          clearInterval(scrollInterval);
          setPhase('selecting');
          selectWinnersWithDelay();
          return;
        }
      };

      // Start scrolling immediately
      scrollNames();
      const scrollInterval = setInterval(scrollNames, scrollSpeed);
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
      
      // Reveal winners one by one with delays
      const revealWinner = (index: number) => {
        if (index >= winners.length) {
          setPhase('complete');
          setTimeout(() => {
            onComplete(winners);
          }, 2000);
          return;
        }

        setCurrentWinnerIndex(index);
        setCurrentGuide(winners[index]);
        
        setTimeout(() => {
          revealWinner(index + 1);
        }, 3000); // 3-second delay between winners
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
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl min-h-[300px] flex items-center justify-center">
          <div className="w-full">
            {phase === 'delay' && (
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-4">
                  🎪 Get Ready for the Magic! 🎪
                </div>
                <div className="text-lg text-blue-200">
                  Preparing to draw from {guides.length} amazing guides...
                </div>
              </motion.div>
            )}

            {phase === 'scrolling' && currentGuide && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentGuide.id}
                  initial={{ 
                    y: 100,
                    opacity: 0,
                    scale: 0.8,
                    rotateX: 90
                  }}
                  animate={{ 
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotateX: 0
                  }}
                  exit={{ 
                    y: -100,
                    opacity: 0,
                    scale: 0.8,
                    rotateX: -90
                  }}
                  transition={{ 
                    duration: 0.15,
                    ease: "easeInOut"
                  }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {currentGuide.name}
                  </div>
                  <div className="text-lg text-blue-200 mb-1">
                    {currentGuide.department}
                  </div>
                  <div className="text-md text-blue-300">
                    Supervisor: {currentGuide.supervisor}
                  </div>
                  <div className="text-sm text-yellow-300 mt-2">
                    {currentGuide.totalTickets} tickets • NPS: {currentGuide.nps}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {phase === 'selecting' && selectedWinners[currentWinnerIndex] && (
              <motion.div
                initial={{ 
                  scale: 0,
                  opacity: 0,
                  rotateY: 180
                }}
                animate={{ 
                  scale: 1,
                  opacity: 1,
                  rotateY: 0
                }}
                transition={{ 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mb-4">
                  🏆 WINNER #{currentWinnerIndex + 1} 🏆
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {selectedWinners[currentWinnerIndex].name}
                </div>
                <div className="text-xl text-blue-200 mb-2">
                  {selectedWinners[currentWinnerIndex].department}
                </div>
                <div className="text-lg text-blue-300 mb-3">
                  Supervisor: {selectedWinners[currentWinnerIndex].supervisor}
                </div>
                <div className="flex justify-center space-x-6 text-sm">
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <span className="text-yellow-300 font-semibold">
                      {selectedWinners[currentWinnerIndex].totalTickets} tickets
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <span className="text-green-300 font-semibold">
                      NPS: {selectedWinners[currentWinnerIndex].nps}
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <span className="text-blue-300 font-semibold">
                      NRPC: {selectedWinners[currentWinnerIndex].nrpc}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent mb-4">
                  🎉 ALL WINNERS SELECTED! 🎉
                </div>
                <div className="text-lg text-white">
                  Congratulations to all {winnerCount} winners!
                </div>
              </motion.div>
            )}
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