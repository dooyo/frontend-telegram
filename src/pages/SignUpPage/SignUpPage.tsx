import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@/lib/api/auth';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import { Avatar } from 'files-ui-react-19';
import { Link } from '@/components/Link/Link';
import avatarPlaceholder from '@/assets/avatarPlaceholder.svg';

export const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleImagePicker = (selectedFile: File) => {
    setAvatar(selectedFile);
  };

  const onSignUp = async () => {
    if (isLoading) return; // Prevent multiple requests
    if (!avatar) {
      alert('Please select an avatar image.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ email, username, avatar });
      navigate('/otp', { state: { email } });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isSignUpEnabled = () => {
    return email !== '' && username !== '' && avatar !== null;
  };

  const resetEmail = () => setEmail('');
  const resetUsername = () => setUsername('');

  return (
    <div className="flex flex-col justify-center items-center p-6 min-h-screen">
      <h1 className="text-[30px] font-normal leading-[40px] text-center text-[#202428] w-[290px] mb-9">
        Create new account
      </h1>

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

      <div className="w-full max-w-sm space-y-4">
        <Input
          title="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onReset={resetUsername}
        />

        <Input
          type="email"
          title="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onReset={resetEmail}
        />

        <Button disabled={!isSignUpEnabled() || isLoading} onClick={onSignUp}>
          {isLoading ? 'Signing Up...' : 'Sign up'}
        </Button>

        <div className="flex items-center justify-center mt-5 w-full gap-2">
          <div className="flex-grow h-0.5 bg-[#cbc3be]" />
          <div>
            <p className="text-sm">Already have an account?</p>
          </div>
          <div>
            <Link to="/signIn" className="text-sm">
              Log in
            </Link>
          </div>
          <div className="flex-grow h-0.5 bg-[#cbc3be]" />
        </div>
      </div>
    </div>
  );
};
