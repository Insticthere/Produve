import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastViewport() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2600,
        style: {
          background: 'rgba(19,19,19,0.92)',
          color: '#f0f0f0',
          border: '1px solid rgba(214,235,253,0.24)',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(8px)',
        },
      }}
    />
  );
}

