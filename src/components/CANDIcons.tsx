import React from 'react';

export function CANDEmblem({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <img
      src="/assets/aistudio/Logo_CAND_3e473a7b.png"
      alt="Huy hiệu Công an Nhân dân"
      className={`${className} object-contain select-none`}
      loading="eager"
      decoding="sync"
    />
  );
}

export function SecurityShieldIcon({ className = "w-5 h-5 text-amber-500" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function VNeIDCardIcon({ className = "w-5 h-5 text-blue-500" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
      <circle cx="7" cy="15" r="1.5" />
      <path d="M12 15h6" />
    </svg>
  );
}
