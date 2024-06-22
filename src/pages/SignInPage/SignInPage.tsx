import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getMe } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import './SignInPage.css';

export const SignInPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { updateAuthToken, updateMe } = useAuth() as any;
  const navigate = useNavigate();

  const onSignIn = async () => {
    try {
      const res = await login({ email, password });
      await updateAuthToken(res.authToken);
      const me = await getMe(res.authToken);
      await updateMe(me);
      navigate('/');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const isSignInEnabled = () => {
    return password !== '' && email !== '';
  };

  return (
    <div className="container">
      <button className="redirectButton" onClick={() => navigate('/signUp')}>
        Sign Up
      </button>
      <h1 className="label">Sign into your account</h1>
      <input
        className="input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="off"
      />
      <div className="passwordContainer">
        <input
          className="passwordInput"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
        />
        {password && (
          <button
            className="eyeIcon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '🔒'}
          </button>
        )}
      </div>
      <button
        className={`button ${!isSignInEnabled() ? 'disabledButton' : ''}`}
        onClick={onSignIn}
        disabled={!isSignInEnabled()}
      >
        Sign in
      </button>
    </div>
  );
};
