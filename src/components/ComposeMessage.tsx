import { useState } from 'react';
import { Send, BookMarked } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';

interface ComposeMessageProps {
  onSubmit: () => void;
}

export function ComposeMessage({ onSubmit }: ComposeMessageProps) {
  const [category, setCategory] = useState<'seeking' | 'missed' | 'inquiry'>('seeking');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createPost } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      await createPost(content.trim(), category);
      setContent('');
      onSubmit();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[var(--color-aged-paper)] border-2 border-[var(--color-ink)] p-8 shadow-[6px_6px_0px_0px_rgba(44,36,22,0.2)] relative overflow-hidden">
        {/* Decorative library image in background */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 opacity-5 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1650513973625-2abc0854814c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBsaWJyYXJ5JTIwYm9va3N8ZW58MXx8fHwxNzY1Mjg4NTg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header */}
        <div className="mb-6 pb-6 border-b-2 border-[var(--color-ink)] relative">
          <div className="flex items-center gap-3 mb-2">
            <BookMarked className="w-8 h-8 text-[var(--color-burgundy)]" />
            <h2 className="text-[var(--color-ink)]">Compose New Entry</h2>
          </div>
          <p className="text-[var(--color-faded-ink)] italic">
            Your submission will be catalogued anonymously and added to the archives
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div className="mb-6">
            <label className="block mb-3 text-[var(--color-ink)]">
              <span className="text-sm tracking-wide uppercase">Classification</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCategory('seeking')}
                className={`p-4 border-2 text-left transition-all ${
                  category === 'seeking'
                    ? 'border-[var(--color-burgundy)] bg-[var(--color-burgundy)] text-[var(--color-parchment)]'
                    : 'border-[var(--color-faded-ink)] bg-transparent hover:border-[var(--color-ink)]'
                }`}
              >
                <div className="mb-1">Seeking</div>
                <small className={category === 'seeking' ? 'opacity-80' : 'text-[var(--color-faded-ink)]'}>
                  Looking for someone
                </small>
              </button>
              
              <button
                type="button"
                onClick={() => setCategory('missed')}
                className={`p-4 border-2 text-left transition-all ${
                  category === 'missed'
                    ? 'border-[var(--color-burgundy)] bg-[var(--color-burgundy)] text-[var(--color-parchment)]'
                    : 'border-[var(--color-faded-ink)] bg-transparent hover:border-[var(--color-ink)]'
                }`}
              >
                <div className="mb-1">Missed Connexion</div>
                <small className={category === 'missed' ? 'opacity-80' : 'text-[var(--color-faded-ink)]'}>
                  We crossed paths
                </small>
              </button>
              
              <button
                type="button"
                onClick={() => setCategory('inquiry')}
                className={`p-4 border-2 text-left transition-all ${
                  category === 'inquiry'
                    ? 'border-[var(--color-burgundy)] bg-[var(--color-burgundy)] text-[var(--color-parchment)]'
                    : 'border-[var(--color-faded-ink)] bg-transparent hover:border-[var(--color-ink)]'
                }`}
              >
                <div className="mb-1">General Inquiry</div>
                <small className={category === 'inquiry' ? 'opacity-80' : 'text-[var(--color-faded-ink)]'}>
                  Open to possibilities
                </small>
              </button>
            </div>
          </div>

          {/* Message Content */}
          <div className="mb-6">
            <label className="block mb-3 text-[var(--color-ink)]">
              <span className="text-sm tracking-wide uppercase">Your Message</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compose your entry here... Be thoughtful, be cryptic, be bold. The archives await your contribution."
              className="w-full min-h-[240px] p-4 bg-[var(--color-parchment)] border-2 border-[var(--color-faded-ink)] focus:border-[var(--color-ink)] focus:outline-none resize-none"
              required
            />
            <div className="flex justify-between mt-2 text-sm text-[var(--color-faded-ink)]">
              <span className="italic">Anonymous submission</span>
              <span>{content.length} characters</span>
            </div>
          </div>

          {/* Guidelines */}
          <div className="mb-6 p-4 border border-[var(--color-faded-ink)] bg-[var(--color-overlay)]">
            <h4 className="text-[var(--color-ink)] mb-2 text-sm tracking-wide uppercase">
              Guidelines for Submission
            </h4>
            <ul className="text-sm text-[var(--color-faded-ink)] space-y-1 list-disc list-inside">
              <li>All entries are anonymous and unattributable</li>
              <li>Be respectful of others and their boundaries</li>
              <li>No identifying information (phone numbers, addresses, etc.)</li>
              <li>Exercise discretion and good judgement</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 border border-[var(--color-burgundy)] bg-[var(--color-parchment)]">
              <p className="text-sm text-[var(--color-burgundy)]">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onSubmit}
              className="px-6 py-3 border border-[var(--color-faded-ink)] text-[var(--color-faded-ink)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="px-6 py-3 border-2 border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-parchment)] hover:bg-[var(--color-burgundy)] hover:border-[var(--color-burgundy)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Submit to Archives'}
            </button>
          </div>
        </form>

        {/* Decorative elements */}
        <div className="mt-8 pt-6 border-t border-[var(--color-faded-ink)] text-center">
          <p className="text-sm text-[var(--color-faded-ink)] italic">
            "In the library's endless halls, every whisper finds its echo"
          </p>
        </div>
      </div>
    </div>
  );
}

