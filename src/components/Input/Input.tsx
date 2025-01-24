import { ChangeEvent, useState, type FC } from 'react';
import { X } from 'lucide-react';

interface InputProps {
  title?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onReset?: () => void;
  disabled?: boolean;
  placeholder?: string;
  type?: 'email' | 'password' | 'text';
  hasError?: boolean;
}

export const Input: FC<InputProps> = ({
  title,
  value,
  onChange,
  onReset,
  type = 'text',
  placeholder = '',
  disabled = false,
  hasError = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState(type);

  const onClickShowPassword = () => {
    setShowPassword(!showPassword);
    setInputType(showPassword ? 'password' : 'text');
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="w-full">
      {title && (
        <label
          className={`block text-sm mb-1 ml-4 ${
            disabled ? 'text-muted-foreground opacity-50' : ''
          }`}
          htmlFor={title.toLowerCase().replace(' ', '-')}
        >
          {title}
        </label>
      )}
      <div
        className={`group relative flex items-center bg-[#dfdad6] border border-[#cbc3be] rounded-[10px] px-4 h-11
        ${disabled ? 'bg-[#efedeb] border-[#b4ada7]' : ''}
        ${hasError ? 'border-destructive' : ''}
        ${!disabled && 'hover:border-[#7a6d64]'}
        focus-within:border-[#7a6d64] focus-within:outline focus-within:outline-1 focus-within:outline-[#7a6d64]`}
      >
        <input
          id={title?.toLowerCase().replace(' ', '-')}
          className="peer w-full bg-transparent outline-hidden text-base disabled:opacity-50"
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
          disabled={disabled}
        />
        {type !== 'password' && value.length > 0 && !disabled && (
          <button
            type="button"
            className="absolute right-4 bg-transparent border-none cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={handleReset}
            aria-label="Clear input"
          >
            <X size={18} />
          </button>
        )}
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-4 bg-transparent border-none cursor-pointer"
            onClick={onClickShowPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🔒' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );
};

export default function Component() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [text, setText] = useState('');

  const resetEmail = () => setEmail('');
  const resetText = () => setText('');

  return (
    <div className="space-y-4 w-full max-w-sm">
      <Input
        title="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onReset={resetEmail}
        placeholder="Enter your email"
      />
      <Input
        title="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
      />
      <Input
        title="Text Input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onReset={resetText}
        placeholder="Enter some text"
      />
      <Input
        title="Disabled Input"
        type="text"
        value="Disabled"
        onChange={() => {}}
        disabled={true}
      />
    </div>
  );
}
