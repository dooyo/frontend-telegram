import { type FC, ReactNode } from 'react';
import './Button.css';

type ButtonProps = {
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
};

const Button: FC<ButtonProps> = ({ disabled, onClick, children }) => {
  return (
    <button className="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
