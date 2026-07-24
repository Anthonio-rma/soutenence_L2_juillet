import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, ShieldCheckIcon, KeyIcon, CameraIcon, UserCircleIcon, MapPinIcon, EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';

const Field = ({ label, value, onChange, type = "text", isEditing, options = null }) => {
  const labels = {
    firstName: "Prénom",
    lastName: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    country: "Pays",
    city: "Ville",
    postalCode: "Code Postal",
    taxId: "Identifiant Fiscal"
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
        {labels[label] || label}
      </label>
      {isEditing ? (
        options ? (
          <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input 
            type={type} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
          />
        )
      ) : (
        <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-medium">
          {value || "-"}
        </div>
      )}
    </div>
  );
};

export default function AccountSettings() {
  const fileInputRef = useRef(null);
  
  const [header, setHeader] = useState({ fullName: '', role: '', avatar: '' });
  const [personal, setPersonal] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [address, setAddress] = useState({ country: '', city: '', postalCode: '', taxId: '' });
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  
  const [isEditing, setIsEditing] = useState({ header: false, personal: false, address: false, password: false });
  const [is2FAActive, setIs2FAActive] = useState(true);

  const handleFile = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const userStored = JSON.parse(localStorage.getItem('user'));
  const formData = new FormData();
  formData.append('avatar', file); 

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userStored.id}/avatar`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (response.ok) {
        setHeader(prev => ({ ...prev, avatar: `${result.url}?t=${Date.now()}` }));
      }
    } catch (err) {
      console.error("Erreur lors de l'upload:", err);
      alert("Erreur lors de la sauvegarde de l'avatar.");
    }
  };

  useEffect(() => {
  const fetchUserData = async () => {
    const userStored = JSON.parse(localStorage.getItem('user'));
    if (!userStored || !userStored.id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userStored.id}`);
      if (!response.ok) throw new Error("Erreur serveur");
      
      const data = await response.json();
      
      // Reconstruction sécurisée de l'URL
      let avatarUrl = '';
      if (data.avatar_url) {
        const baseUrl = data.avatar_url.startsWith('http') ? '' : 'http://localhost:5000';
        avatarUrl = `${baseUrl}${data.avatar_url}?t=${Date.now()}`;
      }
      
      setHeader({ 
        fullName: data.nom_complet || '', 
        role: data.role || '', 
        avatar: avatarUrl 
      });
      
      const names = (data.nom_complet || '').split(' ');
      setPersonal({ 
        email: data.email || '', 
        firstName: names[0] || '', 
        lastName: names.slice(1).join(' ') || '',
        phone: data.telephone || '' 
      });

      setAddress({
        country: data.pays || '',
        city: data.ville || '',
        postalCode: data.code_postal || '',
        taxId: data.identifiant_fiscal || ''
      });

    } catch (err) {
      console.error("Erreur chargement:", err);
    }
  };
  
  fetchUserData();
}, []);

  const handleSave = async (sectionKey) => {
    const userStored = JSON.parse(localStorage.getItem('user'));
    
    if (!userStored?.id) {
        alert("Erreur: Utilisateur non connecté.");
        return;
    }
    // On s'assure d'envoyer l'objet complet avec les états actuels
    const payload = {
        nom_complet: `${personal.firstName} ${personal.lastName}`.trim(),
        prenom: personal.firstName,
        nom: personal.lastName,
        email: personal.email,
        telephone: personal.phone,
        pays: address.country,
        ville: address.city,
        code_postal: address.postalCode,
        identifiant_fiscal: address.taxId
    };

    try {
        const response = await fetch(`http://localhost:5000/api/users/${userStored.id}`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Lecture de la réponse pour débogage
        const result = await response.json();

        if (response.ok) {
            alert("Modifications enregistrées avec succès !");
            setIsEditing(prev => ({ ...prev, [sectionKey]: false }));
        } else {
            console.error("Erreur serveur :", result);
            alert("Erreur lors de la sauvegarde : " + (result.message || "Erreur inconnue"));
        }
          } catch (error) {
              console.error("Erreur réseau:", error);
              alert("Impossible de contacter le serveur.");
          }
        };
  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-900 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 text-slate-900">Paramètres du Compte</h1>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              {/* Conteneur unique pour l'avatar, le bouton et l'input */}
              <div className="relative group shrink-0">
                {header.avatar ? (
                  <img 
                    src={header.avatar} 
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200" 
                    alt="Avatar" 
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <UserCircleIcon className="w-12 h-12" />
                  </div>
                )}

                {/* Bouton pour déclencher l'upload */}
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CameraIcon className="w-6 h-6 text-white" />
                </button>

                {/* Input de fichier caché */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFile} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
              <div className="space-y-1">
                {isEditing.header ? (
                  <>
                    <input type="text" value={header.fullName} onChange={e => setHeader({...header, fullName: e.target.value})} className="font-bold text-lg border-b border-blue-500 focus:outline-none w-full" />
                    <select value={header.role} onChange={e => setHeader({...header, role: e.target.value})} className="text-xs border rounded-lg px-2 py-1 bg-slate-50">
                      <option value="Admin">Admin</option>
                      <option value="Opérateur">Opérateur</option>
                      <option value="Utilisateur">Utilisateur</option>
                    </select>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold">{header.fullName}</h3>
                    <p className="text-sm text-slate-500">{header.role}</p>
                  </>
                )}
              </div>
            </div>
            <button onClick={() => isEditing.header ? handleSave('header') : setIsEditing({...isEditing, header: !isEditing.header})} className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
              {isEditing.header ? <><CheckIcon className="w-4 h-4" /> Enregistrer</> : <><PencilIcon className="w-4 h-4" /> Modifier le profil</>}
            </button>
          </div>

          {[ 
            { title: 'Informations Personnelles', icon: UserCircleIcon, state: personal, setter: setPersonal, key: 'personal' }, 
            { title: 'Adresse de Facturation', icon: MapPinIcon, state: address, setter: setAddress, key: 'address' } 
          ].map((section) => (
            <div key={section.key} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <section.icon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold">{section.title}</h3>
                </div>
                <button onClick={() => setIsEditing({...isEditing, [section.key]: !isEditing[section.key]})} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  {isEditing[section.key] ? 'Annuler' : 'Modifier'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.entries(section.state).map(([k, v]) => (
                  <Field key={k} label={k} value={v} isEditing={isEditing[section.key]} onChange={(val) => section.setter({...section.state, [k]: val})} />
                ))}
              </div>
              {isEditing[section.key] && (
                  <button onClick={() => handleSave(section.key)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
                    Enregistrer les modifications
                  </button>
              )}
            </div>
          ))}

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold">Sécurité</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><KeyIcon className="w-5 h-5 text-blue-600" /> <span className="font-medium text-sm">Mot de passe</span></div>
                <button onClick={() => setIsEditing({...isEditing, password: !isEditing.password})} className="text-sm text-blue-600 font-semibold">Modifier</button>
              </div>
              <AnimatePresence>
                {isEditing.password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid gap-3 p-4 bg-slate-50 rounded-xl overflow-hidden">
                    <input type={showPass ? "text" : "password"} placeholder="Mot de passe actuel" className="w-full p-2.5 rounded-lg border text-sm" onChange={e => setPassForm({...passForm, current: e.target.value})} />
                    <input type={showPass ? "text" : "password"} placeholder="Nouveau mot de passe" className="w-full p-2.5 rounded-lg border text-sm" onChange={e => setPassForm({...passForm, next: e.target.value})} />
                    <div className="relative">
                        <input type={showPass ? "text" : "password"} placeholder="Confirmer nouveau" className="w-full p-2.5 rounded-lg border text-sm" onChange={e => setPassForm({...passForm, confirm: e.target.value})} />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-slate-400">
                            {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    <button onClick={() => passForm.next === passForm.confirm ? handleSave('password') : alert("Les mots de passe ne correspondent pas !")} className="bg-blue-600 text-white py-2 rounded-lg text-sm font-bold">
                        Confirmer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3"><ShieldCheckIcon className="w-5 h-5 text-green-600" /> <span className="font-medium text-sm">Authentification 2FA</span></div>
              <button onClick={() => setIs2FAActive(!is2FAActive)} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${is2FAActive ? 'bg-slate-100' : 'bg-green-100 text-green-700'}`}>
                {is2FAActive ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}