import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className='relative w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-blue-100'>
        <svg viewBox='0 0 24 24' className='w-6 h-6 text-white' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
        </svg>
        <div className='absolute -top-1 -right-1 flex gap-0.5'>
          <div className='w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse' />
        </div>
      </div>
      <div className='flex flex-col -space-y-1'>
        <span className='text-xl font-[1000] tracking-tighter text-slate-900 leading-none italic uppercase'>
          VITA<span className='text-blue-600'>METRA</span>
        </span>
        <span className='text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none'>
          Precision IA
        </span>
      </div>
    </div>
  );
};

export default Logo;