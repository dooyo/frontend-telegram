import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@/lib/api/auth';
import './SignUpPage.css';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import { Avatar } from '@files-ui/react';
import { Link } from '@/components/Link/Link';
import avatarPlaceholder from '@/assets/avatarPlaceholder.svg';

export const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<File>(null as unknown as any);
  const navigate = useNavigate();

  const handleImagePicker = (selectedFile: File) => {
    setAvatar(selectedFile);
  };

  const onSignUp = async () => {
    try {
      await register({ email, password, username, avatar });
      navigate('/signIn');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const isSignUpEnabled = () => {
    return (
      email !== '' &&
      password !== '' &&
      confirmPassword !== '' &&
      password === confirmPassword &&
      username !== '' &&
      avatar !== null
    );
  };

  const confirmPasswordError =
    password !== confirmPassword && confirmPassword !== '';

  return (
    <div className="container">
      <h1>Create new account</h1>

      <Avatar
        alt="Avatar"
        style={{
          width: '160px',
          height: '160px',
          backgroundColor: '#DFDAD6',
          border: '1px',
          borderStyle: 'solid',
          borderColor: '#CBC3BE'
        }}
        changeLabel=""
        accept="image/*"
        readOnly={avatar !== null}
        onChange={handleImagePicker}
        src={avatar ? URL.createObjectURL(avatar) : avatarPlaceholder}
        variant="circle"
      />

      <Input
        title="Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        type="email"
        title="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type="password"
        title="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Input
        type="password"
        title="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        hasError={confirmPasswordError}
      />

      <Button disabled={!isSignUpEnabled()} onClick={onSignUp}>
        Sign up
      </Button>

      <div className="signin-prompt">
        <div className="line" />
        <p>Already have an account?</p>
        <Link to="/signIn" className="link-style">
          Log in
        </Link>
        <div className="line" />
      </div>
    </div>
  );
};
