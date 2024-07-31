import { IconContext } from 'react-icons';
import {
  MdComment,
  MdAccessTime,
  MdFavorite,
  MdShare,
  MdHeartBroken
} from 'react-icons/md';
import './IconButton.css';

const icons: { [key: string]: any } = {
  'comment-outline': MdComment,
  'clock-outline': MdAccessTime,
  'heart-outline': MdFavorite,
  'heart-off-outline': MdHeartBroken,
  'share-outline': MdShare
};

type IconButtonProps = {
  icon: string;
  number?: number | string;
  onClick?: () => void;
  backgroundColor?: string;
  color?: string;
  isPressed?: boolean;
};

const IconButton = ({
  icon,
  number,
  onClick,
  backgroundColor,
  color = 'gray',
  isPressed = false
}: IconButtonProps) => {
  const pressedStyle = isPressed ? { opacity: 0.5 } : {};
  const IconComponent = icons[icon];

  return (
    <button
      onClick={onClick}
      className="icon-button"
      style={{ backgroundColor, ...pressedStyle }}
    >
      <IconContext.Provider value={{ size: '12px', color }}>
        {IconComponent ? <IconComponent style={{ marginRight: 5 }} /> : null}
      </IconContext.Provider>
      <span className="icon-button-text">{number}</span>
    </button>
  );
};

export default IconButton;
