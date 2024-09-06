import { FC, ReactNode, MouseEvent } from 'react';
import './Button.css';

type ButtonProps = {
  disabled: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
};

export const Button: FC<ButtonProps> = ({ disabled, onClick, children }) => {
  return (
    <button className="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
