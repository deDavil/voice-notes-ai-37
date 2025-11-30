import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useConnections } from '@/hooks/useConnections';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  autoFocus?: boolean;
  onClose?: () => void;
}

export function GlobalSearch({ autoFocus, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data: connections } = useConnections();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredConnections = query.trim()
    ? connections?.filter(c =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.company?.toLowerCase().includes(query.toLowerCase()) ||
        c.profession_or_role?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelect = (id: string) => {
    navigate(`/connection/${id}`);
    setQuery('');
    setIsOpen(false);
    onClose?.();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search people, companies..."
          className="pl-9 pr-8 h-9 bg-secondary/50 border-transparent focus:bg-card focus:border-input"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && filteredConnections && filteredConnections.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card rounded-xl shadow-lg border border-border py-1.5 z-50 animate-scale-in">
          {filteredConnections.map((connection) => (
            <button
              key={connection.id}
              onClick={() => handleSelect(connection.id)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                {connection.photo_url ? (
                  <img 
                    src={connection.photo_url} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {connection.name || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {connection.profession_or_role}
                  {connection.company && ` · ${connection.company}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && filteredConnections?.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card rounded-xl shadow-lg border border-border p-4 z-50 animate-scale-in">
          <p className="text-sm text-muted-foreground text-center">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
