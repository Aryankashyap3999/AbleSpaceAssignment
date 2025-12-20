import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useUserSearch } from '@/hooks/apis/useUserSearch';
import type { User } from '@/apis/users';

interface UserSearchInputProps {
  onUserSelect: (user: User) => void;
  selectedUser?: User | null;
  placeholder?: string;
  className?: string;
}

export const UserSearchInput = ({
  onUserSelect,
  selectedUser,
  placeholder = 'Search by username or name...',
  className = '',
}: UserSearchInputProps) => {
  const [inputValue, setInputValue] = useState(selectedUser?.username || '');
  const [isOpen, setIsOpen] = useState(false);
  const { searchResults, isLoading, error, handleSearch, clearSearch } =
    useUserSearch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    handleSearch(value);
    setIsOpen(true);
  };

  const handleSelectUser = (user: User) => {
    setInputValue(user.username);
    onUserSelect(user);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    clearSearch();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => inputValue && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
        {inputValue && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border-b border-red-200">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Searching users...
            </div>
          )}

          {!isLoading && searchResults.length === 0 && inputValue && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No users found
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {searchResults.map((user) => (
                <li key={user._id}>
                  <button
                    onClick={() => handleSelectUser(user)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        @{user.username}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedUser && (
            <div className="p-3 bg-blue-50 border-t border-blue-200">
              <div className="text-xs text-blue-600 font-medium mb-2">
                Currently selected:
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 bg-white border border-blue-200 rounded">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {selectedUser.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    @{selectedUser.username}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
