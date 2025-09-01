import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Settings, Trophy, Users, Ticket, Trash2, Sparkles } from 'lucide-react';
import { Guide, Winner, RaffleSettings } from '../types';
import { useWinners } from '../hooks/useWinners';
import { RaffleModal } from './RaffleModal';
import { NameScrolling } from './NameScrolling';
import { WinnerAnimation } from './WinnerAnimation';
import confetti from 'canvas-confetti';
import guidesData from '../data/guides.json';

export const RaffleView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settings, setSettings] = useState<RaffleSettings>({
    maxWinners: 5,
    drawFrom: 'all',
    selectedDepartments: []
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
  const [animationWinners, setAnimationWinners] = useState<Guide[]>([]);
  const [lastDrawResults, setLastDrawResults] = useState<Guide[]>([]);

  const { winners, addWinners, purgeWinners } = useWinners();
  const guides = guidesData as Guide[];

  const availableGuides = useMemo(() => {
    const winnerIds = new Set(winners.map(w => w.guide_id));
    return guides.filter(guide => !winnerIds.has(guide.id));
  }, [guides, winners]);

  const filteredGuides = useMemo(() => {
    if (settings.drawFrom === 'all') {
      return availableGuides;
    }
    
    if (settings.selectedDepartments.length === 0) {
      return availableGuides;
    }
    
    return availableGuides.filter(guide => 
      settings.selectedDepartments.includes(guide.department)
    );
  }, [availableGuides, settings]);

  const departments = useMemo(() => {
    return Array.from(new Set(guides.map(guide => guide.department))).sort();
  }, [guides]);

  const handleRunRaffle = async () => {
    if (filteredGuides.length === 0) {
      alert('No guides available for the raffle with current settings.');
      return;
    }

    setIsDrawing(true);
    setIsScrolling(true);
  };

  const handleScrollingComplete = async (selectedWinners: Guide[]) => {
    setIsScrolling(false);
    setAnimationWinners(selectedWinners);
    setShowWinnerAnimation(true);
  };

  const handleAnimationComplete = async () => {
    setShowWinnerAnimation(false);
    
    // Save to database
    const winnersData: Winner[] = animationWinners.map(guide => ({
      id: crypto.randomUUID(),
      guide_id: guide.id,
      name: guide.name,
      supervisor: guide.supervisor,
      department: guide.department,
      nps: guide.nps,
      nrpc: guide.nrpc,
      refund_percent: guide.refundPercent,
      total_tickets: guide.totalTickets,
      won_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }));

    try {
      await addWinners(winnersData);
      setLastDrawResults(animationWinners);
      
      // Final celebration confetti
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
      });
    } catch (error) {
      console.error('Failed to save winners:', error);
      alert('Failed to save winners. Please try again.');
    }
    
    setIsDrawing(false);
    setIsModalOpen(false);
  };

  const handlePurgeWinners = async () => {
    if (winners.length === 0) {
      alert('No winners to purge!');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${winners.length} winners? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await purgeWinners();
        setLastDrawResults([]);
        alert('All winners have been successfully purged!');
      } catch (error) {
        console.error('Failed to purge winners:', error);
        alert('Failed to purge winners. Please try again.');
      }
    }
  };

  const stats = useMemo(() => {
    const totalTickets = filteredGuides.reduce((sum, guide) => sum + guide.totalTickets, 0);
    const avgNPS = filteredGuides.length > 0 ? 
      filteredGuides.reduce((sum, guide) => sum + guide.nps, 0) / filteredGuides.length : 0;
    
    return { totalTickets, avgNPS };
  }, [filteredGuides]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 space-y-6 p-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-white border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              🎪 Contest Raffle System 🎪
            </h2>
            <p className="text-blue-100 text-lg">Run magical lottery draws with spectacular animations!</p>
          </div>
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Sparkles className="w-16 h-16 text-yellow-300" />
          </motion.div>
        </div>
      </div>

      {/* Current Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Available Guides</p>
              <p className="text-3xl font-bold text-white">{filteredGuides.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-300" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm font-medium">Pool Tickets</p>
              <p className="text-3xl font-bold text-white">{stats.totalTickets.toLocaleString()}</p>
            </div>
            <Ticket className="w-10 h-10 text-yellow-300" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium">Pool Avg NPS</p>
              <p className="text-3xl font-bold text-white">{stats.avgNPS.toFixed(1)}</p>
            </div>
            <Trophy className="w-10 h-10 text-green-300" />
          </div>
        </div>
      </div>

      {/* Raffle Controls */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-300" />
              Current Settings
            </h3>
            <div className="space-y-2 text-sm text-blue-100">
              <p>Max Winners: <span className="font-medium">{settings.maxWinners}</span></p>
              <p>Draw From: <span className="font-medium capitalize">{settings.drawFrom}</span></p>
              {settings.drawFrom === 'departments' && settings.selectedDepartments.length > 0 && (
                <p>Departments: <span className="font-medium">{settings.selectedDepartments.join(', ')}</span></p>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            {winners.length > 0 && (
              <button
                onClick={handlePurgeWinners}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full font-semibold hover:from-red-600 hover:to-pink-700 focus:ring-4 focus:ring-red-500/50 transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Purge All Winners
              </button>
            )}
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 focus:ring-4 focus:ring-white/50 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              <Settings className="w-5 h-5 mr-2" />
              Configure
            </button>
            
            <button
              onClick={handleRunRaffle}
              disabled={isDrawing || filteredGuides.length === 0}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-bold text-lg hover:from-green-600 hover:to-blue-600 focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <Shuffle className="w-6 h-6 mr-2" />
              {isDrawing ? '🎰 Drawing Magic...' : '🎲 Start the Magic!'}
            </button>
          </div>
        </div>
      </div>

      {/* Last Draw Results */}
      {lastDrawResults.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
            Latest Draw Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lastDrawResults.map((winner, index) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-yellow-900 bg-gradient-to-r from-yellow-300 to-orange-400 px-3 py-1 rounded-full shadow-sm">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-blue-200 font-medium">{winner.totalTickets} tickets</span>
                </div>
                <h4 className="font-bold text-white text-lg">{winner.name}</h4>
                <p className="text-sm text-blue-200 font-medium">{winner.department}</p>
                <p className="text-xs text-blue-300 mt-1">Supervisor: {winner.supervisor}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <RaffleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        departments={departments}
        availableGuides={availableGuides}
        onRunRaffle={handleRunRaffle}
        isDrawing={isDrawing}
      />
      
      <NameScrolling
        guides={filteredGuides}
        isScrolling={isScrolling}
        onComplete={handleScrollingComplete}
        winnerCount={Math.min(settings.maxWinners, filteredGuides.length)}
      />
      
      <WinnerAnimation
        isVisible={showWinnerAnimation}
        winners={animationWinners}
        onComplete={handleAnimationComplete}
      />
    </div>
  );
};