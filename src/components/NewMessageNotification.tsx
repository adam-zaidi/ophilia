import { X, MessageSquare } from 'lucide-react';

interface NewMessageNotificationProps {
  onViewMessages: () => void;
  onDismiss: () => void;
  senderName?: string;
}

export function NewMessageNotification({ onViewMessages, onDismiss, senderName }: NewMessageNotificationProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-[var(--color-aged-paper)] border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_0px_rgba(44,36,22,0.3)] p-3 max-w-sm">
        <div className="flex items-start gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--color-burgundy)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-[var(--color-ink)] font-medium mb-1">
              New message{senderName ? ` from ${senderName}` : ''}
            </p>
            <p className="text-xs text-[var(--color-faded-ink)] mb-2">
              You have received a new direct message.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onViewMessages}
                className="px-3 py-1.5 text-xs border border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)] hover:bg-[var(--color-burgundy)] hover:border-[var(--color-burgundy)] transition-colors"
              >
                View Messages
              </button>
              <button
                onClick={onDismiss}
                className="px-3 py-1.5 text-xs border border-[var(--color-faded-ink)] text-[var(--color-faded-ink)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-[var(--color-faded-ink)] hover:text-[var(--color-ink)] transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

