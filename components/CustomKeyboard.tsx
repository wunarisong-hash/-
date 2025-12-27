
import React from 'react';
import { Delete, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
}

const CustomKeyboard: React.FC<KeyboardProps> = ({ onKeyPress }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white pt-2 pb-6 px-2 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-30 select-none">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <Key value="1" onClick={() => onKeyPress('1')} />
        <Key value="2" onClick={() => onKeyPress('2')} />
        <Key value="3" onClick={() => onKeyPress('3')} />
        <Key value="backspace" onClick={() => onKeyPress('backspace')} color="bg-slate-800" icon={<Delete size={22}/>} />

        {/* Row 2 */}
        <Key value="4" onClick={() => onKeyPress('4')} />
        <Key value="5" onClick={() => onKeyPress('5')} />
        <Key value="6" onClick={() => onKeyPress('6')} />
        <Key value="clear" onClick={() => onKeyPress('clear')} color="bg-slate-800" icon={<XCircle size={22}/>} />

        {/* Row 3 */}
        <Key value="7" onClick={() => onKeyPress('7')} />
        <Key value="8" onClick={() => onKeyPress('8')} />
        <Key value="9" onClick={() => onKeyPress('9')} />
        <Key value="." onClick={() => onKeyPress('.')} color="bg-slate-700" />

        {/* Row 4 */}
        <div className="col-span-1" />
        <Key value="0" onClick={() => onKeyPress('0')} />
        <div className="col-span-2" />
      </div>
    </div>
  );
};

const Key: React.FC<{ 
  value: string; 
  onClick: () => void; 
  color?: string;
  icon?: React.ReactNode;
}> = ({ value, onClick, color = 'bg-slate-700', icon }) => (
  <button 
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`h-14 rounded-xl flex items-center justify-center text-xl font-bold active:bg-blue-600 active:scale-95 transition-all ${color}`}
  >
    {icon || value}
  </button>
);

export default CustomKeyboard;
