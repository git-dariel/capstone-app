import { createAvatar } from '@dicebear/core';
import { 
  adventurer, 
  adventurerNeutral,
  avataaars, 
  avataaarsNeutral,
  bigEars,
  bigEarsNeutral,
  bigSmile,
  bottts,
  botttsNeutral,
  croodles, 
  croodlesNeutral,
  dylan,
  funEmoji, 
  identicon,
  initials,
  lorelei, 
  micah,
  miniavs, 
  notionists,
  notionistsNeutral,
  openPeeps, 
  personas,
  pixelArt,
  pixelArtNeutral,
  rings,
  shapes,
  thumbs
} from '@dicebear/collection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';

/**
 * DiceBearAvatarSelector Component
 * 
 * A component that allows users to generate and select avatars using the DiceBear library.
 * Features multiple avatar styles, randomization, and real-time preview.
 * 
 * @param onSelect - Callback function called when an avatar is selected
 * @param userName - User's name used as seed for avatar generation (optional)
 * @param className - Additional CSS classes (optional)
 */
interface DiceBearAvatarSelectorProps {
  onSelect: (avatarSvg: string) => void;
  userName?: string;
  className?: string;
}

const avatarStyles = [
  { name: 'Adventurer', style: adventurer, description: 'Adventure-themed avatars' },
  { name: 'Adventurer Neutral', style: adventurerNeutral, description: 'Neutral adventure avatars' },
  { name: 'Avataaars', style: avataaars, description: 'Sketch-style avatars' },
  { name: 'Avataaars Neutral', style: avataaarsNeutral, description: 'Neutral sketch avatars' },
  { name: 'Big Ears', style: bigEars, description: 'Cute big-eared avatars' },
  { name: 'Big Ears Neutral', style: bigEarsNeutral, description: 'Neutral big-eared avatars' },
  { name: 'Big Smile', style: bigSmile, description: 'Happy smiling avatars' },
  { name: 'Bottts', style: bottts, description: 'Robot avatars' },
  { name: 'Bottts Neutral', style: botttsNeutral, description: 'Neutral robot avatars' },
  { name: 'Croodles', style: croodles, description: 'Doodle-style avatars' },
  { name: 'Croodles Neutral', style: croodlesNeutral, description: 'Neutral doodle avatars' },
  { name: 'Dylan', style: dylan, description: 'Dylan-style avatars' },
  { name: 'Fun Emoji', style: funEmoji, description: 'Emoji-style avatars' },
  { name: 'Identicon', style: identicon, description: 'Geometric pattern avatars' },
  { name: 'Initials', style: initials, description: 'Letter-based avatars' },
  { name: 'Lorelei', style: lorelei, description: 'Pixel art avatars' },
  { name: 'Micah', style: micah, description: 'Micah-style avatars' },
  { name: 'Miniavs', style: miniavs, description: 'Minimalist avatars' },
  { name: 'Notionists', style: notionists, description: 'Notion-style avatars' },
  { name: 'Notionists Neutral', style: notionistsNeutral, description: 'Neutral notion avatars' },
  { name: 'Open Peeps', style: openPeeps, description: 'Hand-drawn avatars' },
  { name: 'Personas', style: personas, description: 'Professional avatars' },
  { name: 'Pixel Art', style: pixelArt, description: 'Retro pixel avatars' },
  { name: 'Pixel Art Neutral', style: pixelArtNeutral, description: 'Neutral pixel avatars' },
  { name: 'Rings', style: rings, description: 'Abstract ring patterns' },
  { name: 'Shapes', style: shapes, description: 'Geometric shape avatars' },
  { name: 'Thumbs', style: thumbs, description: 'Thumbs-up style avatars' },
];

export const DiceBearAvatarSelector: React.FC<DiceBearAvatarSelectorProps> = ({
  onSelect,
  userName = 'User',
  className = '',
}) => {
  const [selectedStyle, setSelectedStyle] = useState(avatarStyles[0]);
  const [currentSeed, setCurrentSeed] = useState(userName);
  const [generatedAvatars, setGeneratedAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate multiple avatar variations
  const generateAvatars = async (style: any, baseSeed: string) => {
    setIsGenerating(true);
    const avatars: string[] = [];
    
    try {
      // Generate 8 different variations
      for (let i = 0; i < 8; i++) {
        const seed = `${baseSeed}-${i}-${Date.now()}`;
        const avatar = createAvatar(style, {
          seed,
          size: 80,
          backgroundColor: ['transparent'],
        });
        avatars.push(avatar.toString());
      }
      
      setGeneratedAvatars(avatars);
      setSelectedAvatar(avatars[0]); // Select first avatar by default
    } catch (error) {
      console.error('Error generating avatars:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate avatars when style or seed changes
  useEffect(() => {
    generateAvatars(selectedStyle.style, currentSeed);
  }, [selectedStyle, currentSeed]);

  const handleStyleChange = (style: typeof avatarStyles[0]) => {
    setSelectedStyle(style);
  };

  const handleRandomize = () => {
    const randomSeed = `${userName}-${Math.random().toString(36).substring(7)}-${Date.now()}`;
    setCurrentSeed(randomSeed);
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    onSelect(avatar);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Style Selector */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Choose Avatar Style</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-40 sm:max-h-48 overflow-y-auto">
          {avatarStyles.map((style) => (
            <button
              key={style.name}
              onClick={() => handleStyleChange(style)}
              className={`p-2 text-xs rounded-lg border transition-all ${
                selectedStyle.name === style.name
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="font-medium text-xs sm:text-sm">{style.name}</div>
              <div className="text-xs opacity-75 mt-1 hidden sm:block">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Style Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <Badge variant="outline" className="text-xs">
            {selectedStyle.name}
          </Badge>
          <p className="text-xs text-gray-500 mt-1">{selectedStyle.description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRandomize}
          disabled={isGenerating}
          className="flex items-center justify-center space-x-1 w-full sm:w-auto"
        >
          <Shuffle className="h-3 w-3" />
          <span>Randomize</span>
        </Button>
      </div>

      {/* Avatar Grid */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Select Avatar</h4>
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-sm text-gray-600">Generating avatars...</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
            {generatedAvatars.map((avatar, index) => (
              <button
                key={index}
                onClick={() => handleAvatarSelect(avatar)}
                className={`relative p-1 sm:p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedAvatar === avatar
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
                  dangerouslySetInnerHTML={{ __html: avatar }}
                />
                {selectedAvatar === avatar && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      {selectedAvatar && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 flex items-center justify-center bg-white">
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: selectedAvatar }}
                style={{ transform: 'scale(1)' }}
              />
            </div>
            <div className="text-sm text-gray-600 text-center sm:text-left">
              <p>This will be your new profile picture</p>
              <p className="text-xs text-gray-500">Style: {selectedStyle.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
