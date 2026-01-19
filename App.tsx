import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, Type as TypeIcon, Settings, Download, Search, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { extractLeadsFromContent } from './geminiService';
import { Lead, UserProfile } from './types';
import LeadCard from './LeadCard';
import SettingsModal from './SettingsModal';

const App: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ civility: '', name: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('autoLeads_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      // Prompt user to set profile on first visit
      setIsSettingsOpen(true);
    }

    const savedLeads = localStorage.getItem('autoLeads_data');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    }
  }, []);

  // Save leads to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('autoLeads_data', JSON.stringify(leads));
  }, [leads]);

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('autoLeads_profile', JSON.stringify(profile));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if ((activeTab === 'text' && !inputText.trim()) || (activeTab === 'image' && !selectedImage)) {
      alert("Veuillez entrer du texte ou une image.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await extractLeadsFromContent(
        activeTab === 'text' ? inputText : '',
        activeTab === 'image' && selectedImage ? selectedImage : undefined
      );

      let addedCount = 0;
      const newLeads: Lead[] = [];

      result.leads.forEach(extractedLead => {
        // Clean phone for deduplication check (remove spaces/dashes)
        const cleanExtracted = extractedLead.phone.replace(/[^0-9]/g, '');
        
        const exists = leads.some(existing => 
          existing.phone.replace(/[^0-9]/g, '') === cleanExtracted
        ) || newLeads.some(nl => nl.phone.replace(/[^0-9]/g, '') === cleanExtracted);

        if (!exists && cleanExtracted.length >= 8) {
          newLeads.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...extractedLead,
            timestamp: Date.now()
          });
          addedCount++;
        }
      });

      if (addedCount > 0) {
        setLeads(prev => [...newLeads, ...prev]); // Add new ones to top
        setInputText('');
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert("Aucun nouveau numéro trouvé ou numéros déjà existants.");
      }

    } catch (error) {
      alert("Erreur lors de l'analyse. Veuillez réessayer.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm("Supprimer ce prospect ?")) {
      setLeads(prev => prev.filter(l => l.id !== id));
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Entreprise", "Produit", "Téléphone", "Date"];
    const rows = leads.map(l => [
      l.id,
      `"${l.companyName}"`, // Quote to handle commas
      `"${l.productName}"`,
      `"${l.phone}"`,
      new Date(l.timestamp).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "prospects_autoleads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 max-w-2xl mx-auto bg-white shadow-xl min-h-screen flex flex-col">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 py-3 flex justify-between items-center bg-opacity-90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Search size={20} />
            </div>
            <div>
                <h1 className="font-bold text-gray-800 text-lg leading-tight">AutoLeads</h1>
                <p className="text-xs text-gray-500">Capture & Automatisation</p>
            </div>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative"
        >
          <Settings size={24} />
          {(!userProfile.name) && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col gap-6">
        
        {/* User Civility Warning */}
        {(!userProfile.name) && (
           <div onClick={() => setIsSettingsOpen(true)} className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg text-sm flex items-center gap-2 cursor-pointer">
             <span>⚠️ Configurez votre nom et civilité pour activer les messages WhatsApp.</span>
           </div>
        )}

        {/* Input Section */}
        <div className="bg-gray-50 rounded-2xl p-1 border border-gray-200">
            <div className="flex gap-1 mb-2">
                <button 
                    onClick={() => setActiveTab('image')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'image' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <ImageIcon size={18} />
                    Capture / Image
                </button>
                <button 
                    onClick={() => setActiveTab('text')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <TypeIcon size={18} />
                    Texte Copié
                </button>
            </div>

            <div className="p-2">
                {activeTab === 'image' ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-colors ${selectedImage ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-100'}`}
                    >
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                        {selectedImage ? (
                            <img src={selectedImage} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                        ) : (
                            <div className="text-center p-4">
                                <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                                <p className="text-gray-500 text-sm font-medium">Appuyez pour prendre une photo ou choisir une capture</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <textarea 
                        className="w-full h-40 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                        placeholder="Collez ici le texte de la publicité Facebook ou de la page web..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                )}

                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (activeTab === 'image' && !selectedImage) || (activeTab === 'text' && !inputText)}
                    className="w-full mt-3 bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="animate-spin" /> Analyse en cours...
                        </>
                    ) : (
                        <>
                            <Search size={20} /> Extraire les Contacts
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Results List */}
        <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    Prospects <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{leads.length}</span>
                </h2>
                {leads.length > 0 && (
                    <button onClick={exportToCSV} className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
                        <Download size={16} /> Export CSV
                    </button>
                )}
            </div>

            {leads.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Plus size={32} className="text-gray-300" />
                    </div>
                    <p>Aucun prospect pour le moment.</p>
                    <p className="text-sm">Capturez une pub pour commencer.</p>
                </div>
            ) : (
                <div className="space-y-3 pb-8">
                    {leads.map((lead, index) => (
                        <LeadCard 
                            key={lead.id} 
                            lead={lead} 
                            index={index} 
                            userProfile={userProfile}
                            onDelete={handleDeleteLead}
                        />
                    ))}
                </div>
            )}
        </div>
      </main>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentProfile={userProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default App;