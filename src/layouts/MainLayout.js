import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const contentPaddingLeft = isMobile ? 0 : (isCollapsed ? 78 : 260);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',        // ← fixe (pas min) pour que h-full marche dans les enfants
        overflow: 'hidden',     // ← empêche le scroll global
        background: '#f7f8fc',
      }}
    >
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
          paddingLeft: contentPaddingLeft,
          paddingBottom: isMobile ? '4rem' : 0,
          transition: 'padding-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/*
          Ce div est la seule zone scrollable de la page.
          - minHeight: 0 est essentiel dans un conteneur flex column pour que
            overflowY marche correctement (sinon l'enfant pousse la hauteur
            au lieu de scroller).
          - overflowY: 'auto' fait apparaître le scroll uniquement ici,
            pendant que la Sidebar reste fixe et visible en permanence.
        */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}