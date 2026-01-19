import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentProfile, onSave }) => {
  const [profile, setProfile] = useState<UserProfile>(currentProfile);

  // Reset local state when modal opens/currentProfile changes
  useEffect(() => {
    setProfile(currentProfile);
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Vos Informations</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
            Ces informations seront insérées automatiquement dans votre message de prospection WhatsApp.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Civilité</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  profile.civility === 'Madame' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setProfile({ ...profile, civility: 'Madame' })}
              >
                Madame
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  profile.civility === 'Monsieur' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setProfile({ ...profile, civility: 'Monsieur' })}
              >
                Monsieur
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Votre Nom & Prénom</label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ex: Sophie Martin"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-2"
          >
            <Save size={18} />
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;