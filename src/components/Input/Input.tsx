import { ChangeEvent, useState, type FC } from 'react';
import './Input.css';

export const Input: FC<{
  title: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: 'email' | 'password' | 'text';
  hasError?: boolean;
  // TODO: add style for error flow
}> = ({
  title,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState(type);

  const onClickShowPassword = () => {
    if (showPassword) {
      setShowPassword(false);
      setInputType('password');
    } else {
      setShowPassword(true);
      setInputType('text');
    }
  };

  return (
    <div className="input-wrapper">
      {Boolean(title) && (
        <p className={`input-title ${disabled ? 'input-title--disabled' : ''}`}>
          {title}
        </p>
      )}
      <div className="input-container">
        <input
          className="input"
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
          disabled={disabled}
        />

        {type === 'password' && (
          <button className="input-show-password" onClick={onClickShowPassword}>
            {showPassword ? '🔒' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );
};
