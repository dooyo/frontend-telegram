import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Avatar } from 'files-ui-react-19';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverAnchor
} from '@/components/ui/popover';
import { getProfilesSearch } from '@/lib/api/profiles';
import { getMyFollowings } from '@/lib/api/followers';
import { cn } from '@/lib/utils/cn';

export const MAX_CONTENT_LENGTH = 280;
interface UserType {
  _id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
}

interface Following {
  _id: string;
  user: UserType;
}

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange?: (mentionedUserIds: string[]) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
}

export const MentionsInput: React.FC<MentionsInputProps> = ({
  value,
  onChange,
  onMentionsChange,
  placeholder = 'Type your message here. Use @ to mention someone.',
  className,
  maxLength,
  rows,
  disabled = false
}) => {
  const [isMentioning, setIsMentioning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<(Following | UserType)[]>([]);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add ref for the hidden anchor element
  const anchorRef = useRef<HTMLDivElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const lineHeight = 24; // Approximate line height in pixels
      const initialHeight = rows ? rows * lineHeight : 40;

      if (!textarea.value) {
        textarea.style.height = `${initialHeight}px`;
      } else {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      }
    }
  }, [rows]);

  // Adjust height on value change
  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  const loadFollowings = useCallback(async () => {
    try {
      setIsLoading(true);
      const followingsResponse = await getMyFollowings({ limit: 50 }); // Load more followings at once for mentions
      setSuggestions(followingsResponse.data);
    } catch (error) {
      console.error('Failed to load followings:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProfiles = useCallback(async (query: string) => {
    if (!query) return;
    try {
      setIsLoading(true);
      const profiles = await getProfilesSearch(query);
      setSuggestions(profiles);
    } catch (error) {
      console.error('Failed to search profiles:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findWordAtCursor = useCallback(
    (text: string, cursorPosition: number) => {
      // Get the text before cursor
      const textBeforeCursor = text.slice(0, cursorPosition);

      // Find the start of the current word
      let wordStart = cursorPosition;
      for (let i = cursorPosition - 1; i >= 0; i--) {
        if (/[\s\n]/.test(textBeforeCursor[i])) {
          wordStart = i + 1;
          break;
        }
        if (i === 0) {
          wordStart = 0;
        }
      }

      // Find the end of the current word
      let wordEnd = cursorPosition;
      for (let i = cursorPosition; i < text.length; i++) {
        if (/[\s\n,.!?;:]/.test(text[i])) {
          wordEnd = i;
          break;
        }
        if (i === text.length - 1) {
          wordEnd = text.length;
        }
      }

      return {
        word: text.slice(wordStart, wordEnd),
        start: wordStart,
        end: wordEnd
      };
    },
    []
  );

  const updateMentionPosition = useCallback(() => {
    if (textareaRef.current && anchorRef.current) {
      const { selectionStart } = textareaRef.current;
      const subString = value.substring(0, selectionStart);
      const lines = subString.split('\n');
      const currentLineIndex = lines.length - 1;
      const currentLine = lines[currentLineIndex];

      const lineHeight = 24; // Approximate line height in pixels
      const charWidth = 8; // Approximate character width in pixels
      const top = currentLineIndex * lineHeight;
      const left = currentLine.length * charWidth;

      // Update anchor position
      anchorRef.current.style.position = 'absolute';
      anchorRef.current.style.top = `${top + 24}px`;
      anchorRef.current.style.left = `${left}px`;
      anchorRef.current.style.width = '1px';
      anchorRef.current.style.height = '1px';
    }
  }, [value]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      if (maxLength && newValue.length > maxLength) return;

      onChange(newValue);
      adjustTextareaHeight();

      const cursorPosition = event.target.selectionStart;
      const { word: currentWord } = findWordAtCursor(newValue, cursorPosition);

      // Check if the current word contains any punctuation marks
      if (currentWord.startsWith('@') && !/[,.!?;:]/.test(currentWord)) {
        const searchQuery = currentWord.slice(1);
        setIsMentioning(true);
        setSelectedIndex(0);
        updateMentionPosition();

        if (searchQuery.length === 0) {
          loadFollowings();
        } else {
          searchProfiles(searchQuery);
        }
      } else {
        setIsMentioning(false);
      }
    },
    [
      onChange,
      updateMentionPosition,
      loadFollowings,
      searchProfiles,
      adjustTextareaHeight,
      maxLength,
      findWordAtCursor
    ]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');

      if (maxLength) {
        const remainingChars = maxLength - value.length;
        if (remainingChars <= 0) return;

        const trimmedText = pastedText.slice(0, remainingChars);
        onChange(value + trimmedText);
      } else {
        onChange(value + pastedText);
      }

      setTimeout(adjustTextareaHeight, 0);
    },
    [value, onChange, adjustTextareaHeight, maxLength]
  );

  const handleMentionSelect = useCallback(
    (suggestion: Following | UserType) => {
      if (textareaRef.current) {
        const cursorPosition = textareaRef.current.selectionStart;
        const { start: wordStart, end: wordEnd } = findWordAtCursor(
          value,
          cursorPosition
        );

        const textBeforeMention = value.slice(0, wordStart);
        const textAfterMention = value.slice(wordEnd);
        const userData = getUserData(suggestion);
        const mentionText = `@${userData.username}`;
        const newValue = textBeforeMention + mentionText + textAfterMention;

        if (maxLength && newValue.length > maxLength) return;

        // Track mentioned user
        const newMentionedUserIds = [...mentionedUserIds];
        if (!newMentionedUserIds.some((id) => id === userData._id)) {
          newMentionedUserIds.push(userData._id);
          setMentionedUserIds(newMentionedUserIds);
          onMentionsChange?.(newMentionedUserIds);
        }

        onChange(newValue);
        setIsMentioning(false);

        // Set cursor position after the inserted mention
        const newCursorPosition = wordStart + mentionText.length;
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition
            );
            textareaRef.current.focus();
            adjustTextareaHeight();
          }
        }, 0);
      }
    },
    [
      value,
      onChange,
      adjustTextareaHeight,
      maxLength,
      findWordAtCursor,
      mentionedUserIds,
      onMentionsChange
    ]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (isMentioning) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setSelectedIndex((prevIndex) =>
              Math.min(prevIndex + 1, suggestions.length - 1)
            );
            break;
          case 'ArrowUp':
            event.preventDefault();
            setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
            break;
          case 'Enter':
            event.preventDefault();
            if (suggestions[selectedIndex]) {
              handleMentionSelect(suggestions[selectedIndex]);
            }
            break;
          case 'Escape':
            event.preventDefault();
            setIsMentioning(false);
            break;
          case 'Tab':
            event.preventDefault();
            if (suggestions[selectedIndex]) {
              handleMentionSelect(suggestions[selectedIndex]);
            }
            break;
        }
      }
    },
    [isMentioning, selectedIndex, suggestions, handleMentionSelect]
  );

  const getUserData = (suggestion: Following | UserType): UserType => {
    return 'user' in suggestion ? suggestion.user : suggestion;
  };

  // Clear mentioned users when value is empty
  useEffect(() => {
    if (!value && mentionedUserIds.length > 0) {
      setMentionedUserIds([]);
      onMentionsChange?.([]);
    }
  }, [value, mentionedUserIds, onMentionsChange]);

  return (
    <div className={cn('relative w-full', className)}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        rows={rows}
        className="min-h-[40px] max-h-[120px] resize-none overflow-hidden"
        style={{
          height: value ? 'auto' : '40px',
          minHeight: '40px'
        }}
        disabled={disabled}
      />
      <div ref={anchorRef} aria-hidden="true" />
      <Popover
        open={isMentioning}
        onOpenChange={(open) => {
          setIsMentioning(open);
          // Ensure textarea keeps focus
          if (!open && textareaRef.current) {
            textareaRef.current.focus();
          }
        }}
        modal={false}
      >
        <PopoverAnchor asChild>
          <div ref={anchorRef} />
        </PopoverAnchor>
        <PopoverContent
          className="w-[300px] p-0"
          sideOffset={4}
          align="start"
          side="bottom"
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking inside textarea
            if (textareaRef.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
          onFocusOutside={(e) => {
            // Prevent closing when focus is in textarea
            if (textareaRef.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
          onOpenAutoFocus={(e) => {
            // Prevent auto focus when opening
            e.preventDefault();
          }}
        >
          <Command className="border-none shadow-none">
            <CommandList>
              <CommandGroup>
                {isLoading ? (
                  <CommandItem onSelect={() => {}}>Loading...</CommandItem>
                ) : suggestions.length === 0 ? (
                  <CommandEmpty>No results found.</CommandEmpty>
                ) : (
                  suggestions.map((suggestion, index) => {
                    const userData = getUserData(suggestion);
                    return (
                      <CommandItem
                        key={userData._id}
                        onSelect={() => {
                          handleMentionSelect(suggestion);
                          // Ensure focus returns to textarea after selection
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                          }
                        }}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1.5',
                          index === selectedIndex &&
                            'bg-accent text-accent-foreground'
                        )}
                      >
                        <Avatar
                          src={userData.avatarUrl?.replace(
                            'localhost',
                            '10.100.102.18'
                          )}
                          alt={userData.username || 'User Avatar'}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#DFDAD6',
                            border: '1px',
                            borderStyle: 'solid',
                            borderColor: '#CBC3BE'
                          }}
                          variant="circle"
                          readOnly
                        />
                        <span className="flex-1">{userData.username}</span>
                        {userData.name && (
                          <span className="text-sm text-muted-foreground">
                            {userData.name}
                          </span>
                        )}
                      </CommandItem>
                    );
                  })
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
