import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../lib/api/auth';
import './SignUpPage.css';
import Input from '@/components/Input/Input';

export const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<File>(null as unknown as any);
  const navigate = useNavigate();

  const handleImagePicker = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAvatar(event.target.files[0]);
    }
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
      <button className="redirectButton" onClick={() => navigate('/signIn')}>
        Sign In
      </button>
      <h1 className="label">Create new account</h1>
      <Input
        title="Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Name"
      />
      <Input
        type="email"
        title="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <Input
        type="password"
        title="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <Input
        type="password"
        title="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Password"
        hasError={confirmPasswordError}
      />

      <input type="file" onChange={handleImagePicker} />
      {avatar && (
        <img
          src={URL.createObjectURL(avatar)}
          alt="avatar"
          className="avatar"
        />
      )}
      <button
        className={`button ${!isSignUpEnabled() ? 'disabledButton' : ''}`}
        onClick={onSignUp}
        disabled={!isSignUpEnabled()}
      >
        Sign up
      </button>
    </div>
  );
};
