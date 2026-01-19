import React from 'react';
import { Lead, UserProfile } from '../types';
import { MessageSquare, Trash2, ExternalLink } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  index: number;
  userProfile: UserProfile;
  onDelete: (id: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, index, userProfile, onDelete }) => {
  
  const generateWhatsAppLink = () => {
    // Clean phone number: remove spaces, +, -, (, )
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    
    const civilityStr = userProfile.civility ? userProfile.civility : 'Madame/Monsieur';
    const userNameStr = userProfile.name ? userProfile.name : '[Votre Nom]';

    const message = `Bonjour ${lead.companyName}, je viens de voir passer votre pub sur Facebook, vos ${lead.productName} ont l'air top ! 🔥
Par contre, je sais qu'avec ce type de produits, vos messages sont inondés de questions comme "c'est combien ?" et de "Je vous reviens" qui ne mènent à rien... C'est épuisant.
Et gérer les commandes manuellement c'est dommage, car ça ne reflète pas le standing de vos produits.
Je suis ${civilityStr} ${userNameStr}, j'aide les ecommercants à automatiser leurs ventes et commandes pour filtrer les curieux sur WhatsApp, mettre fin au fameux 'je vous reviens' et multiplier leurs ventes.
Aujourd'hui, nous offrons aux entreprises locales la même puissance de frappe et le même prestige que des grands groupes et des multinationales en leur créant des sites internet pour les aider à faire plus de ventes et dominer leur marché.
Mon métier, c'est simplement de vous créer une vitrine digitale d'exception qui : 1️⃣ Impose immédiatement le respect et la confiance (image de marque forte). 2️⃣ Filtre les "blagueurs" pour ne garder que les clients sérieux.
Regardez ce niveau de finition : orientalfrag.com (vous pouvez retrouver nos autres réalisations et nos tarifs sur biound.netlify.app)
Ça vous dirait qu'on en discute et qu'on mette tout cela en place ?
Cordialement, ${userNameStr}`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                #{index + 1}
            </span>
            <div>
                <h3 className="font-bold text-gray-800 text-lg">{lead.companyName}</h3>
                <p className="text-gray-500 text-sm">Produit: <span className="text-gray-700 font-medium">{lead.productName}</span></p>
            </div>
        </div>
        <button 
            onClick={() => onDelete(lead.id)}
            className="text-gray-400 hover:text-red-500 p-1"
        >
            <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <span className="font-mono text-gray-600 font-medium text-lg tracking-wide">
            {lead.phone}
        </span>
        <a 
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
            <MessageSquare size={18} />
            <span>Contacter</span>
        </a>
      </div>
    </div>
  );
};

export default LeadCard;