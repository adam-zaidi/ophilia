import { Lock } from 'lucide-react';

interface Message {
  id: string;
  catalogNumber: string;
  author: string;
  timestamp: string;
  content: string;
  category: 'seeking' | 'missed' | 'inquiry';
  responses: number;
}

interface MessageCardProps {
      message: Message;
      isAuthenticated: boolean;
      onLoginRequired: () => void;
      onRespond?: (author: string, content: string, catalogNumber: string) => void;
    }

export function MessageCard({ message, isAuthenticated, onLoginRequired, onRespond }: MessageCardProps) {
  const categoryLabels = {
    seeking: 'Seeking',
    missed: 'Missed Connexion',
    inquiry: 'General Inquiry'
  };

  const handleRespondClick = () => {
    if (!isAuthenticated) {
      onLoginRequired();
    } else if (onRespond) {
      onRespond(message.author, message.content, message.catalogNumber);
    }
  };

  return (
    <article className="bg-[var(--color-aged-paper)] border border-[var(--color-ink)] p-1.5 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-1 border-b border-[var(--color-faded-ink)] pb-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-[var(--color-burgundy)] tracking-wider">
              {message.catalogNumber}
            </span>
            <span className="text-xs text-[var(--color-faded-ink)] italic">
              [{categoryLabels[message.category]}]
            </span>
          </div>
          <p className="text-xs text-[var(--color-faded-ink)]">
            {message.author} • <time>{message.timestamp}</time>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-1">
        <p className="text-[var(--color-ink)] leading-normal text-sm">
          {message.content}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--color-faded-ink)]">
        <button
          className="text-xs text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] transition-colors"
        >
          {message.responses} {message.responses === 1 ? 'response' : 'responses'}
        </button>

        <button 
          onClick={handleRespondClick}
          className="text-xs text-[var(--color-ink)] hover:underline transition-all"
        >
          {!isAuthenticated && <Lock className="w-2.5 h-2.5 inline mr-0.5" />}
          respond
        </button>
      </div>
    </article>
  );
}

