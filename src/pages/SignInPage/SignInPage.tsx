import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getMe } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import './SignInPage.css';
import Input from '@/components/Input/Input';
import { Link as RouterLink } from 'react-router-dom';
import Button from '@/components/Button/Button';

export const SignInPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <h1 className="title">Welcome</h1>
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

      <Button disabled={!isSignInEnabled()} onClick={onSignIn}>
        Log in
      </Button>

      <div className="signup-prompt">
        <div className="line" />
        <p>Don&rsquo;t have an account?</p>
        <span onClick={() => navigate('/signUp')}>Create an account</span>
        <div className="line" />
      </div>
    </div>
  );
};
