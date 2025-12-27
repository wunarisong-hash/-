
import React, { useState, useEffect, useRef } from 'react';
import { PatientData, StepKey, DeliveryMode, BabyGender, Status } from '../types';
import { ChevronLeft, ChevronRight, Check, X, Baby, Activity, Info } from 'lucide-react';

interface DataEntryProps {
  patient: PatientData;
  onSave: (p: PatientData) => void;
  onBack: () => void;
  onComplete: () => void;
  onNextRecord: () => void;
  setActiveInput: (input: { field: string; index?: number } | null) => void;
  activeInput: { field: string; index?: number } | null;
}

const STEPS: { key: StepKey; title: string }[] = [
  { key: 'motherAge', title: '母亲年龄 (岁)' },
  { key: 'isGDM', title: 'GDM 状态' },
  { key: 'deliveryMode', title: '分娩方式' },
  { key: 'gravidityParity', title: '孕产次' },
  { key: 'gestationalAge', title: '孕周 (GA)' },
  { key: 'preBMI', title: '孕前 BMI (kg/m²)' },
  { key: 'weightGain', title: '孕期增重 (kg)' },
  { key: 'ogtt', title: 'OGTT 指标 (mmol/L)' },
  { key: 'babyGender', title: '宝宝性别' },
  { key: 'birthInfo', title: '出生指标' },
];

const DataEntry: React.FC<DataEntryProps> = ({ 
  patient, onSave, onBack, onComplete, onNextRecord, setActiveInput, activeInput 
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus logic for Gestational Age
  useEffect(() => {
    if (STEPS[stepIndex].key === 'gestationalAge' && patient.gestationalAge.weeks.length === 2 && activeInput?.field === 'weeks') {
        setActiveInput({ field: 'days' });
    }
    if (STEPS[stepIndex].key === 'gestationalAge' && patient.gestationalAge.days.length === 1 && activeInput?.field === 'days') {
       // Optional: Auto move to next step if needed, but let's keep manual next to ensure user sees it
    }
  }, [patient.gestationalAge, stepIndex, activeInput, setActiveInput]);

  // Determine Status automatically
  const updateStatus = (p: PatientData): Status => {
    const isComplete = !!(
      p.motherAge && 
      p.isGDM !== null && 
      p.deliveryMode && 
      p.gravidity && 
      p.parity && 
      p.gestationalAge.weeks && 
      p.gestationalAge.days && 
      p.preBMI && 
      p.weightGain && 
      p.ogtt0 && p.ogtt1 && p.ogtt2 &&
      p.babyGender && 
      p.birthLength && 
      p.birthWeight
    );
    if (!isComplete) return Status.INCOMPLETE;
    return p.isGDM ? Status.COMPLETED_GDM : Status.COMPLETED_NORMAL;
  };

  const currentStep = STEPS[stepIndex];

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      const finalPatient = { ...patient, status: updateStatus(patient) };
      onSave(finalPatient);
      onComplete();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    } else {
      onBack();
    }
  };

  const updateField = (update: Partial<PatientData>) => {
    const nextPatient = { ...patient, ...update };
    nextPatient.status = updateStatus(nextPatient);
    onSave(nextPatient);
  };

  const handleChoice = (update: Partial<PatientData>) => {
    updateField(update);
    setTimeout(handleNext, 150);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-lg text-slate-800">编号 #{patient.id}</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
            Progress: {stepIndex + 1} / {STEPS.length}
          </p>
        </div>
        <div className="w-8" /> {/* Placeholder for balance */}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-100 w-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Card Content (Horizontal Scroll Area) */}
      <div className="flex-1 relative flex items-center justify-center px-6 overflow-hidden">
         {/* Simple transition container */}
         <div className="w-full max-w-sm transition-all duration-300 transform">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">{currentStep.title}</h3>
            
            <div className="space-y-6">
              {currentStep.key === 'motherAge' && (
                <CustomInput 
                  value={patient.motherAge} 
                  onFocus={() => setActiveInput({ field: 'motherAge' })}
                  isActive={activeInput?.field === 'motherAge'}
                  placeholder="请输入年龄"
                />
              )}

              {currentStep.key === 'isGDM' && (
                <div className="grid grid-cols-2 gap-4">
                  <ChoiceButton 
                    label="是" 
                    selected={patient.isGDM === true} 
                    onClick={() => handleChoice({ isGDM: true })} 
                    color="rose"
                  />
                  <ChoiceButton 
                    label="否" 
                    selected={patient.isGDM === false} 
                    onClick={() => handleChoice({ isGDM: false })} 
                    color="emerald"
                  />
                </div>
              )}

              {currentStep.key === 'deliveryMode' && (
                <div className="grid grid-cols-1 gap-3">
                  <ChoiceButton 
                    label="顺产" 
                    selected={patient.deliveryMode === DeliveryMode.NATURAL} 
                    onClick={() => handleChoice({ deliveryMode: DeliveryMode.NATURAL })} 
                    color="blue"
                  />
                  <ChoiceButton 
                    label="剖宫产" 
                    selected={patient.deliveryMode === DeliveryMode.C_SECTION} 
                    onClick={() => handleChoice({ deliveryMode: DeliveryMode.C_SECTION })} 
                    color="blue"
                  />
                </div>
              )}

              {currentStep.key === 'gravidityParity' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">孕次 (Gravidity)</p>
                    <CustomInput 
                      value={patient.gravidity} 
                      onFocus={() => setActiveInput({ field: 'gravidity' })}
                      isActive={activeInput?.field === 'gravidity'}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">产次 (Parity)</p>
                    <CustomInput 
                      value={patient.parity} 
                      onFocus={() => setActiveInput({ field: 'parity' })}
                      isActive={activeInput?.field === 'parity'}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {currentStep.key === 'gestationalAge' && (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-24 text-center">
                    <CustomInput 
                      value={patient.gestationalAge.weeks} 
                      onFocus={() => setActiveInput({ field: 'weeks' })}
                      isActive={activeInput?.field === 'weeks'}
                      placeholder="00"
                    />
                    <p className="mt-2 text-sm text-slate-400">周</p>
                  </div>
                  <span className="text-2xl font-bold text-slate-300 self-start mt-2">+</span>
                  <div className="w-24 text-center">
                    <CustomInput 
                      value={patient.gestationalAge.days} 
                      onFocus={() => setActiveInput({ field: 'days' })}
                      isActive={activeInput?.field === 'days'}
                      placeholder="0"
                    />
                    <p className="mt-2 text-sm text-slate-400">天</p>
                  </div>
                </div>
              )}

              {currentStep.key === 'preBMI' && (
                <CustomInput 
                  value={patient.preBMI} 
                  onFocus={() => setActiveInput({ field: 'preBMI' })}
                  isActive={activeInput?.field === 'preBMI'}
                  placeholder="0.00"
                />
              )}

              {currentStep.key === 'weightGain' && (
                <CustomInput 
                  value={patient.weightGain} 
                  onFocus={() => setActiveInput({ field: 'weightGain' })}
                  isActive={activeInput?.field === 'weightGain'}
                  placeholder="0.0"
                />
              )}

              {currentStep.key === 'ogtt' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500 font-medium">空腹</span>
                    <div className="w-32">
                      <CustomInput 
                        value={patient.ogtt0} 
                        onFocus={() => setActiveInput({ field: 'ogtt0' })}
                        isActive={activeInput?.field === 'ogtt0'}
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500 font-medium">1 小时</span>
                    <div className="w-32">
                      <CustomInput 
                        value={patient.ogtt1} 
                        onFocus={() => setActiveInput({ field: 'ogtt1' })}
                        isActive={activeInput?.field === 'ogtt1'}
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500 font-medium">2 小时</span>
                    <div className="w-32">
                      <CustomInput 
                        value={patient.ogtt2} 
                        onFocus={() => setActiveInput({ field: 'ogtt2' })}
                        isActive={activeInput?.field === 'ogtt2'}
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep.key === 'babyGender' && (
                <div className="grid grid-cols-2 gap-4">
                  <ChoiceButton 
                    label="男" 
                    icon={<div className="w-3 h-3 rounded-full bg-blue-500 mr-2"/>}
                    selected={patient.babyGender === BabyGender.MALE} 
                    onClick={() => handleChoice({ babyGender: BabyGender.MALE })} 
                    color="blue"
                  />
                  <ChoiceButton 
                    label="女" 
                    icon={<div className="w-3 h-3 rounded-full bg-rose-400 mr-2"/>}
                    selected={patient.babyGender === BabyGender.FEMALE} 
                    onClick={() => handleChoice({ babyGender: BabyGender.FEMALE })} 
                    color="rose"
                  />
                </div>
              )}

              {currentStep.key === 'birthInfo' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">出生身长 (cm)</p>
                    <CustomInput 
                      value={patient.birthLength} 
                      onFocus={() => setActiveInput({ field: 'birthLength' })}
                      isActive={activeInput?.field === 'birthLength'}
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">出生体重 (g)</p>
                    <CustomInput 
                      value={patient.birthWeight} 
                      onFocus={() => setActiveInput({ field: 'birthWeight' })}
                      isActive={activeInput?.field === 'birthWeight'}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons for the card */}
            <div className="mt-12 flex items-center justify-between">
              <button 
                onClick={handlePrev}
                className="px-6 py-3 text-slate-400 font-medium hover:text-slate-600 active:scale-95 transition-all"
              >
                {stepIndex === 0 ? '返回首页' : '上一步'}
              </button>
              
              <button 
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                {stepIndex === STEPS.length - 1 ? '完成保存' : '下一步'}
                {stepIndex === STEPS.length - 1 ? <Check size={20}/> : <ChevronRight size={20}/>}
              </button>
            </div>
         </div>
      </div>
      
      {/* Visual Keyboard Spacing */}
      <div className="h-64" />
    </div>
  );
};

const CustomInput: React.FC<{ 
  value: string; 
  onFocus: () => void; 
  isActive: boolean;
  placeholder?: string;
}> = ({ value, onFocus, isActive, placeholder }) => (
  <div 
    onClick={onFocus}
    className={`w-full h-14 bg-slate-50 border-2 rounded-xl flex items-center px-4 transition-all ${
      isActive ? 'border-blue-500 bg-white ring-4 ring-blue-50' : 'border-slate-100'
    }`}
  >
    <div className="flex-1 text-xl font-bold text-slate-700">
      {value || <span className="text-slate-300 font-normal">{placeholder}</span>}
      {isActive && <span className="inline-block w-0.5 h-6 bg-blue-500 ml-1 animate-pulse align-middle" />}
    </div>
  </div>
);

const ChoiceButton: React.FC<{ 
  label: string; 
  selected: boolean; 
  onClick: () => void; 
  color: 'blue' | 'rose' | 'emerald';
  icon?: React.ReactNode;
}> = ({ label, selected, onClick, color, icon }) => {
  const themes = {
    blue: selected ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-blue-50 text-blue-600 border-blue-100',
    rose: selected ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-rose-50 text-rose-500 border-rose-100',
    emerald: selected ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-emerald-50 text-emerald-500 border-emerald-100',
  };

  return (
    <button 
      onClick={onClick}
      className={`h-16 rounded-xl text-lg font-bold border flex items-center justify-center transition-all active:scale-95 ${themes[color]} ${selected ? 'shadow-lg border-transparent scale-105' : ''}`}
    >
      {icon}{label}
    </button>
  );
};

export default DataEntry;
