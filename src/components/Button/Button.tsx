import { type FC } from 'react';
import './Button.css';

const Button: FC<{
  disabled: boolean;
  onClick: () => void;
  text: string;
}> = ({ disabled, onClick, text }) => {
  return (
    <button className={`button`} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};

export default Button;
