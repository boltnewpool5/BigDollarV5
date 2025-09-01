import React from 'react';
import { X, Settings, Users, Shuffle } from 'lucide-react';
import { RaffleSettings, Guide } from '../types';

interface RaffleModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RaffleSettings;
  onSettingsChange: (settings: RaffleSettings) => void;
  departments: string[];
  availableGuides: Guide[];
  onRunRaffle: () => void;
  isDrawing: boolean;
}

export const RaffleModal: React.FC<RaffleModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  departments,
  availableGuides,
  onRunRaffle,
  isDrawing
}) => {
  if (!isOpen) return null;

  const filteredGuides = settings.drawFrom === 'all' 
    ? availableGuides 
    : availableGuides.filter(guide => 
        settings.selectedDepartments.length === 0 || 
        settings.selectedDepartments.includes(guide.department)
      );

  const handleDepartmentToggle = (department: string) => {
    const newDepartments = settings.selectedDepartments.includes(department)
      ? settings.selectedDepartments.filter(d => d !== department)
      : [...settings.selectedDepartments, department];
    
    onSettingsChange({
      ...settings,
      selectedDepartments: newDepartments
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">🎯 Raffle Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Winner Count */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Number of Winners (Max: 28)
            </label>
            <input
              type="number"
              min="1"
              max="28"
              value={settings.maxWinners}
              onChange={(e) => onSettingsChange({
                ...settings,
                maxWinners: Math.min(28, Math.max(1, parseInt(e.target.value) || 1))
              })}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Draw From */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Draw From
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={settings.drawFrom === 'all'}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    drawFrom: e.target.value as 'all' | 'departments',
                    selectedDepartments: []
                  })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-white font-medium">Entire Pool</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  value="departments"
                  checked={settings.drawFrom === 'departments'}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    drawFrom: e.target.value as 'all' | 'departments'
                  })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-white font-medium">Specific Departments</span>
              </label>
            </div>
          </div>

          {/* Department Selection */}
          {settings.drawFrom === 'departments' && (
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Select Departments
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {departments.map(department => {
                  const deptGuides = availableGuides.filter(g => g.department === department);
                  return (
                    <label key={department} className="flex items-center p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors duration-200 border border-white/20">
                      <input
                        type="checkbox"
                        checked={settings.selectedDepartments.includes(department)}
                        onChange={() => handleDepartmentToggle(department)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-sm font-medium text-white">{department}</span>
                        <p className="text-xs text-blue-200">{deptGuides.length} guides available</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pool Summary */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h4 className="font-medium text-white mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-300" />
              Current Pool Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-200">Available Guides:</span>
                <span className="font-bold text-white ml-1">{filteredGuides.length}</span>
              </div>
              <div>
                <span className="text-blue-200">Total Tickets:</span>
                <span className="font-bold text-white ml-1">
                  {filteredGuides.reduce((sum, guide) => sum + guide.totalTickets, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/30 rounded-full text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:ring-2 focus:ring-white/50 transition-all duration-300"
            >
              Cancel
            </button>
            
            <button
              onClick={onRunRaffle}
              disabled={isDrawing || filteredGuides.length === 0}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-bold hover:from-green-600 hover:to-blue-600 focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              {isDrawing ? '🎰 Drawing Winners...' : '🎲 Run Raffle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};