import React, { useState } from 'react';
import { ChromeProfile } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, BrowserProfileIcon } from '../constants';
import ProfileModal from './ProfileModal';

interface ProfileManagerViewProps {
  profiles: ChromeProfile[];
  onAdd: (profile: Omit<ChromeProfile, 'id'>) => void;
  onUpdate: (profile: ChromeProfile) => void;
  onDelete: (id: string) => void;
}

const ProfileManagerView: React.FC<ProfileManagerViewProps> = ({ profiles, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profileToEdit, setProfileToEdit] = useState<ChromeProfile | null>(null);

    const handleOpenAddModal = () => {
        setProfileToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (profile: ChromeProfile) => {
        setProfileToEdit(profile);
        setIsModalOpen(true);
    };

    const handleSave = (profileData: Omit<ChromeProfile, 'id'>) => {
        if (profileToEdit) {
            onUpdate({ ...profileToEdit, ...profileData });
        } else {
            onAdd(profileData);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-200 tracking-tight">Chrome Profiles</h2>
                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors cursor-pointer"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add New Profile
                </button>
            </div>
            
            <p className="mb-6 text-gray-400 max-w-3xl">
                Define your Chrome profiles here to quickly open links in a specific browser window. Due to browser security restrictions, this tool copies the link and reminds you to paste it into the correct profile.
            </p>

            <div className="bg-gray-800 rounded-lg border border-gray-700">
                {profiles.length > 0 ? (
                    <ul className="divide-y divide-gray-700">
                        {profiles.map(profile => (
                            <li key={profile.id} className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <BrowserProfileIcon className="w-6 h-6 text-sky-400" />
                                    <div>
                                        <p className="font-medium text-gray-200">{profile.name}</p>
                                        <p className="text-sm text-gray-500 font-mono">{profile.directoryName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleOpenEditModal(profile)} 
                                        className="p-2 text-gray-500 hover:text-sky-400 hover:bg-sky-500/20 rounded-full"
                                        aria-label={`Edit ${profile.name}`}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(profile.id)} 
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-full"
                                        aria-label={`Delete ${profile.name}`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-10 text-center text-gray-500">
                        <BrowserProfileIcon className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300">No Chrome Profiles Found</h3>
                        <p className="mt-1">Click "Add New Profile" to get started.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <ProfileModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                    profileToEdit={profileToEdit} 
                />
            )}
        </div>
    );
};

export default ProfileManagerView;
