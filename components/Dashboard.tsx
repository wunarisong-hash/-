
import React, { useMemo } from 'react';
import { PatientData, Status } from '../types';
import { Plus, Download, Trash2, PieChart } from 'lucide-react';

interface DashboardProps {
  data: PatientData[];
  onNew: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onNew, onEdit, onDelete }) => {
  const stats = useMemo(() => {
    const total = data.length;
    const gdmCount = data.filter(d => d.status === Status.COMPLETED_GDM).length;
    const normalCount = data.filter(d => d.status === Status.COMPLETED_NORMAL).length;
    return { total, gdmCount, normalCount };
  }, [data]);

  const handleExport = () => {
    if (data.length === 0) return alert("暂无数据可导出");
    
    // Simple CSV Export
    const headers = [
      'ID', 'Mother_Age', 'Is_GDM', 'Delivery_Mode', 'Gravidity', 'Parity', 
      'GA_Weeks', 'GA_Days', 'Pre_BMI', 'Weight_Gain', 'OGTT_0', 'OGTT_1', 
      'OGTT_2', 'Baby_Gender', 'Birth_Length', 'Birth_Weight', 'Status'
    ];

    const rows = data.map(d => [
      d.id,
      d.motherAge,
      d.isGDM === null ? '' : (d.isGDM ? 'Yes' : 'No'),
      d.deliveryMode || '',
      d.gravidity,
      d.parity,
      d.gestationalAge.weeks,
      d.gestationalAge.days,
      d.preBMI,
      d.weightGain,
      d.ogtt0,
      d.ogtt1,
      d.ogtt2,
      d.babyGender || '',
      d.birthLength,
      d.birthWeight,
      d.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `GDM_Research_Data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Bar Stats */}
      <div className="bg-white p-4 shadow-sm border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex gap-4 overflow-x-auto">
          <StatItem label="Total" value={stats.total} color="text-slate-600" />
          <StatItem label="GDM" value={stats.gdmCount} color="text-rose-500" />
          <StatItem label="Normal" value={stats.normalCount} color="text-emerald-500" />
        </div>
        <button 
          onClick={handleExport}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1"
        >
          <Download size={20} />
          <span className="text-sm font-medium hidden sm:inline">导出 Excel</span>
        </button>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <PieChart size={64} strokeWidth={1} />
            <p className="mt-4 text-lg">暂无录入数据</p>
            <p className="text-sm">点击下方按钮开始采集</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {data.sort((a, b) => b.id - a.id).map(patient => (
              <GridSquare 
                key={patient.id} 
                patient={patient} 
                onClick={() => onEdit(patient.id)}
                onLongPress={() => onDelete(patient.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={onNew}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all z-20"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex flex-col min-w-[60px]">
    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</span>
    <span className={`text-xl font-bold ${color}`}>{value}</span>
  </div>
);

const GridSquare: React.FC<{ patient: PatientData; onClick: () => void; onLongPress: () => void }> = ({ patient, onClick, onLongPress }) => {
  let bgColor = 'bg-white border-slate-200';
  let textColor = 'text-slate-500';

  if (patient.status === Status.COMPLETED_GDM) {
    bgColor = 'bg-rose-100 border-rose-300';
    textColor = 'text-rose-700';
  } else if (patient.status === Status.COMPLETED_NORMAL) {
    bgColor = 'bg-emerald-100 border-emerald-300';
    textColor = 'text-emerald-700';
  }

  // Handle Long Press
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      onLongPress();
      timerRef.current = null;
    }, 800);
  };
  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      onClick();
    }
  };

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`${bgColor} ${textColor} border-2 rounded-xl h-16 flex items-center justify-center font-bold text-lg cursor-pointer hover:shadow-md transition-all active:scale-90 select-none`}
    >
      #{patient.id}
    </div>
  );
};

export default Dashboard;
