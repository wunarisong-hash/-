
import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import DataEntry from './components/DataEntry';
import CustomKeyboard from './components/CustomKeyboard';
import { PatientData, Status, DeliveryMode, BabyGender } from './types';

const STORAGE_KEY = 'gdm_research_data_v1';

const INITIAL_PATIENT_DATA = (id: number): PatientData => ({
  id,
  motherAge: '',
  isGDM: null,
  deliveryMode: null,
  gravidity: '',
  parity: '',
  gestationalAge: { weeks: '', days: '' },
  preBMI: '',
  weightGain: '',
  ogtt0: '',
  ogtt1: '',
  ogtt2: '',
  babyGender: null,
  birthLength: '',
  birthWeight: '',
  status: Status.INCOMPLETE,
  updatedAt: Date.now()
});

const App: React.FC = () => {
  const [data, setData] = useState<PatientData[]>([]);
  const [view, setView] = useState<'dashboard' | 'entry'>('dashboard');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeInput, setActiveInput] = useState<{ field: string; index?: number } | null>(null);

  // Load data from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleStartNew = useCallback(() => {
    const nextId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
    const newData = INITIAL_PATIENT_DATA(nextId);
    setData(prev => [...prev, newData]);
    setEditingId(nextId);
    setView('entry');
  }, [data]);

  const handleEdit = useCallback((id: number) => {
    setEditingId(id);
    setView('entry');
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm(`是否删除编号 #${id} 的所有数据？`)) {
      setData(prev => prev.filter(d => d.id !== id));
    }
  }, []);

  const handleSavePatient = useCallback((patient: PatientData) => {
    setData(prev => {
      const exists = prev.find(d => d.id === patient.id);
      if (exists) {
        return prev.map(d => d.id === patient.id ? { ...patient, updatedAt: Date.now() } : d);
      }
      return [...prev, { ...patient, updatedAt: Date.now() }];
    });
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (!editingId || !activeInput) return;

    setData(prev => {
      const updated = prev.map(p => {
        if (p.id !== editingId) return p;
        
        const newPatient = { ...p };
        const { field } = activeInput;

        if (key === 'clear') {
          if (field === 'weeks' || field === 'days') {
            newPatient.gestationalAge = { ...newPatient.gestationalAge, [field]: '' };
          } else {
            (newPatient as any)[field] = '';
          }
        } else if (key === 'backspace') {
          if (field === 'weeks' || field === 'days') {
            const current = (newPatient.gestationalAge as any)[field];
            newPatient.gestationalAge = { ...newPatient.gestationalAge, [field]: current.slice(0, -1) };
          } else {
            const current = (newPatient as any)[field];
            (newPatient as any)[field] = current.slice(0, -1);
          }
        } else if (key === '.') {
          if (field === 'weeks' || field === 'days') return p; // Integers only
          const current = (newPatient as any)[field];
          if (!current.includes('.')) {
            (newPatient as any)[field] = current + '.';
          }
        } else {
          // Numeric input
          if (field === 'weeks') {
             if (newPatient.gestationalAge.weeks.length < 2) {
               newPatient.gestationalAge.weeks += key;
             }
          } else if (field === 'days') {
             if (newPatient.gestationalAge.days.length < 1) {
               newPatient.gestationalAge.days += key;
             }
          } else {
            (newPatient as any)[field] += key;
          }
        }

        return newPatient;
      });
      return updated;
    });
  }, [editingId, activeInput]);

  const currentPatient = data.find(p => p.id === editingId) || null;

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 relative overflow-hidden">
      {view === 'dashboard' ? (
        <Dashboard 
          data={data} 
          onNew={handleStartNew} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
      ) : (
        <DataEntry 
          patient={currentPatient!} 
          onSave={handleSavePatient}
          onBack={() => setView('dashboard')}
          onComplete={() => {
            setView('dashboard');
            setEditingId(null);
          }}
          onNextRecord={() => {
            const nextId = Math.max(...data.map(d => d.id)) + 1;
            const newData = INITIAL_PATIENT_DATA(nextId);
            setData(prev => [...prev, newData]);
            setEditingId(nextId);
          }}
          setActiveInput={setActiveInput}
          activeInput={activeInput}
        />
      )}

      {/* Persistent Custom Keyboard */}
      {view === 'entry' && (
        <CustomKeyboard onKeyPress={handleKeyPress} />
      )}
    </div>
  );
};

export default App;
