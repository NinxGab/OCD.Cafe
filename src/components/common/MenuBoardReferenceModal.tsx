import React, { useState } from 'react';
import { X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface MenuBoardReferenceModalProps {
  onClose: () => void;
}

export const MenuBoardReferenceModal: React.FC<MenuBoardReferenceModalProps> = ({ onClose }) => {
  const images = [
    {
      src: '/assets/aistudio/ad848d9b-8617-4245-acac-a0ca32b62f79_af7946d8.jpe',
      title: 'Store Signboard & Rice Meals / Burgers / Snacks Menu',
      description: 'The O.C.D.\'s Cafe +639451678855 | +639088855266 — Rice Meals (₱70-₱85), Sliders & Barkada (₱80-₱175), Seasoned Fries, Nachos & Pancit Canton (₱30-₱90).'
    },
    {
      src: '/assets/aistudio/1a259a41-38ec-4281-8bac-70cc2c86173c_e8f049ce.jpe',
      title: 'Sandwiches & Gourmet Pizza Board',
      description: 'Chicken Salad, 3 Cheese Grilled Cheese, Egg Salad (₱45-₱50) & 4 Cheese, Hawaiian, Pepperoni, Loaded Pizza (₱150-₱180).'
    },
    {
      src: '/assets/aistudio/1ff274b1-c137-4f18-9447-1dd1c4bd7673_09bdb285.jpe',
      title: 'Espresso, Iced Coffee, Shakes, Frappes & Milk Tea Board',
      description: 'Espresso (8oz/12oz), Iced Drinks (12oz/16oz/22oz), Milo Dinosaur, Frappes, Brown Sugar Boba, and Milk Teas (₱45-₱135).'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#281b15] text-[#fffaf5] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#4c352a] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#1f140f] flex items-center justify-between border-b border-[#3b2a22]">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#e05326]" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Original OCD Cafe Signage &amp; Menu Board</h3>
              <p className="text-xs text-[#dac7b5]">
                Board {currentIndex + 1} of {images.length}: {images[currentIndex].title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#dac7b5] hover:text-white hover:bg-[#38261e] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-black/40">
          <div className="relative max-h-[60vh] flex items-center justify-center w-full">
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].title}
              referrerPolicy="no-referrer"
              className="max-h-[58vh] max-w-full object-contain rounded-xl border border-[#3b2a22] shadow-lg"
            />
          </div>

          <div className="mt-3 text-center max-w-xl">
            <p className="text-xs text-[#dac7b5] leading-relaxed">
              {images[currentIndex].description}
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-3 bg-[#1f140f] flex items-center justify-between border-t border-[#3b2a22]">
          <button
            onClick={() => setCurrentIndex((currentIndex - 1 + images.length) % images.length)}
            className="px-3 py-1.5 bg-[#38261e] hover:bg-[#4c352a] rounded-xl text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Board</span>
          </button>

          <div className="flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer ${
                  currentIndex === idx ? 'bg-[#e05326]' : 'bg-[#4c352a]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((currentIndex + 1) % images.length)}
            className="px-3 py-1.5 bg-[#38261e] hover:bg-[#4c352a] rounded-xl text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
          >
            <span>Next Board</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
