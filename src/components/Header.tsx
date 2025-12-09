import { PenLine, LogOut, UserPlus } from 'lucide-react';

interface HeaderProps {
  activeView: 'browse' | 'compose';
  onComposeClick: () => void;
  isAuthenticated: boolean;
  userEmail: string;
  onLogout: () => void;
  onLoginClick: () => void;
}

export function Header({ activeView, onComposeClick, isAuthenticated, userEmail, onLogout, onLoginClick }: HeaderProps) {
  return (
    <header className="border-b-2 border-[var(--color-ink)] bg-[var(--color-aged-paper)] relative">
      {/* Phoenix decorative image */}
      <div className="absolute top-0 right-24 w-32 h-32 opacity-20 pointer-events-none hidden lg:block">
        {/* <img 
          src="https://images.unsplash.com/photo-1699005735820-1e9ac39c9128?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG9lbml4JTIwYmlyZCUyMGFydHdvcmt8ZW58MXx8fHwxNzY1MzA3MjU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Phoenix"
          className="w-full h-full object-contain"
        /> */}
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-[var(--color-ink)] mb-2">
              Ophilia
            </h1>
            <p className="text-[var(--color-faded-ink)] italic text-lg">
              Anonymous Connexions & Encounters
            </p>
          </div>
          
          <div className="flex gap-2 mt-2">
            {isAuthenticated ? (
              <button
                onClick={onComposeClick}
                className={`px-4 py-2 border-2 transition-all ${
                  activeView === 'compose'
                    ? 'border-[var(--color-burgundy)] bg-[var(--color-burgundy)] text-[var(--color-parchment)]'
                    : 'border-[var(--color-ink)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-overlay)]'
                }`}
              >
                <PenLine className="inline-block w-5 h-5 mr-2" />
                Compose
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 border-2 border-[var(--color-burgundy)] bg-[var(--color-burgundy)] text-[var(--color-parchment)] hover:bg-[var(--color-ink)] hover:border-[var(--color-ink)] transition-all"
              >
                <UserPlus className="inline-block w-5 h-5 mr-2" />
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
        
        <div className="border-t border-[var(--color-faded-ink)] pt-3 flex items-center justify-between">
          <p className="text-sm text-[var(--color-faded-ink)]">Est. 1890 — A catalogue of whispered desires and clandestine meetings</p>
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--color-burgundy)] italic">@{userEmail}</span>
              <button
                onClick={onLogout}
                className="text-sm text-[var(--color-faded-ink)] hover:text-[var(--color-burgundy)] transition-colors flex items-center gap-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[var(--color-gold)] opacity-40" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[var(--color-gold)] opacity-40" />
    </header>
  );
}

