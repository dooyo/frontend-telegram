import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/lib/api/auth';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import { Link } from '@/components/Link/Link';

export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSignIn = async () => {
    if (isLoading) return; // Prevent multiple requests
    setIsLoading(true);
    try {
      await login({ email });
      navigate('/otp', { state: { email } });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isSignInEnabled = () => {
    return email !== '';
  };

  const resetEmail = () => setEmail('');

  return (
    <div className="flex flex-col justify-center items-center p-6 h-screen">
      <h1 className="text-[30px] font-normal leading-[40px] text-center text-[#202428] w-[290px] mb-9">
        Welcome
      </h1>
      <div className="w-full max-w-sm space-y-4">
        <Input
          type="email"
          title="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onReset={resetEmail}
        />

        <Button disabled={!isSignInEnabled() || isLoading} onClick={onSignIn}>
          {isLoading ? 'Signing In...' : 'Continue'}
        </Button>

        <div className="flex items-center justify-center mt-5 w-full gap-2">
          <div className="grow h-0.5 bg-[#cbc3be]" />
          <div>
            <p className="text-sm">Don&rsquo;t have an account?</p>
          </div>
          <div>
            <Link to="/signUp" className="text-sm">
              Create an account
            </Link>
          </div>
          <div className="grow h-0.5 bg-[#cbc3be]" />
        </div>
      </div>
    </div>
  );
};
