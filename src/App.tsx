import { useState } from 'react';
import { MessageBoard } from './components/MessageBoard';
import { ComposeMessage } from './components/ComposeMessage';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { ResetPassword } from './components/ResetPassword';
import { NewMessageNotification } from './components/NewMessageNotification';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

export default function App() {
  // Check for recovery mode IMMEDIATELY, before any hooks run
  // Supabase sends recovery tokens in URL hash, not query params
  // Check both hash and query params to be safe
  let isRecoveryMode = false;
  if (typeof window !== 'undefined') {
    // Check URL hash (Supabase uses this)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashType = hashParams.get('type');
    const hashToken = hashParams.get('access_token');
    
    // Also check query params (in case redirect uses query)
    const queryParams = new URLSearchParams(window.location.search);
    const queryType = queryParams.get('type');
    const queryToken = queryParams.get('access_token');
    
    isRecoveryMode = (hashType === 'recovery' && !!hashToken) || (queryType === 'recovery' && !!queryToken);
  }
  
  // If in recovery mode, show reset password page immediately (before auth state is processed)
  if (isRecoveryMode) {
    return (
      <ResetPassword 
        onComplete={() => {
          // Sign out after password reset and redirect to home
          supabase.auth.signOut().then(() => {
            window.location.href = '/';
          });
        }} 
      />
    );
  }

  const [activeView, setActiveView] = useState<'browse' | 'compose'>('browse');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newMessageNotification, setNewMessageNotification] = useState<{ senderName: string } | null>(null);
  const [messageBoardRef, setMessageBoardRef] = useState<{ switchToMessages: () => void } | null>(null);
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
                  onNewMessage={(senderName) => setNewMessageNotification({ senderName })}
                  onRefReady={setMessageBoardRef}
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

      {/* New Message Notification */}
      {newMessageNotification && (
        <NewMessageNotification
          senderName={newMessageNotification.senderName}
          onViewMessages={() => {
            setNewMessageNotification(null);
            if (messageBoardRef) {
              messageBoardRef.switchToMessages();
            }
          }}
          onDismiss={() => setNewMessageNotification(null)}
        />
      )}
    </div>
  );
}

