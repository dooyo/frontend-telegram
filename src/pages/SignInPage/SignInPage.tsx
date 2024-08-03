import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getMe } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import './SignInPage.css';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import { Link } from '@/components/Link/Link';

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
      <h1>Welcome</h1>
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

      <Button disabled={!isSignInEnabled()} onClick={onSignIn}>
        Log in
      </Button>

      <div className="signin-prompt">
        <div className="line" />
        <p>Don&rsquo;t have an account?</p>
        <Link to="/signUp" className="link-style">
          Create an account
        </Link>
        <div className="line" />
      </div>
    </div>
  );
};
