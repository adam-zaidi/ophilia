import { useState } from 'react';
import { MessageBoard } from './components/MessageBoard';
import { ComposeMessage } from './components/ComposeMessage';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const [activeView, setActiveView] = useState<'browse' | 'compose'>('browse');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, loading, signOut, isAuthenticated } = useAuth();

  const handleAuth = () => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    await signOut();
    setActiveView('browse');
  };

  const handleComposeClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setActiveView('compose');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] relative overflow-hidden">
      {/* Vintage paper texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative">
        {!loading && (
          <>
            <Header 
              activeView={activeView} 
              onComposeClick={handleComposeClick}
              isAuthenticated={isAuthenticated}
              userEmail={profile?.username || user?.email || ''}
              onLogout={handleLogout}
              onLoginClick={() => setShowAuthModal(true)}
            />
            
            <main className="container mx-auto px-2 py-2 max-w-5xl">
              {activeView === 'browse' ? (
                <MessageBoard 
                  isAuthenticated={isAuthenticated}
                  onLoginRequired={() => setShowAuthModal(true)}
                />
              ) : (
                <ComposeMessage onSubmit={() => setActiveView('browse')} />
              )}
            </main>
          </>
        )}

        {/* Decorative elements */}
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-30" />
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onAuth={handleAuth} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

