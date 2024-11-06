import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMe, verifyOtp } from '@/lib/api/auth';
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup
} from '@/components/ui/input-otp';
import { Button } from '@/components/Button/Button';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Link } from '@/components/Link/Link';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useAuth } from '@/context/AuthContext';

export const OtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { email } = location.state || {};
  const { updateAuthToken, updateMe } = useAuth() as any;

  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/signIn');
    }
  }, [email, navigate]);

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
  };

  const onVerifyOtp = async () => {
    if (isLoading) return; // Prevent multiple requests
    setIsLoading(true);
    try {
      const res = await verifyOtp({ email, otp: otpValue });
      await updateAuthToken(res.authToken);
      const me = await getMe(res.authToken);
      await updateMe(me);
      navigate('/');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isVerifyEnabled = () => {
    return otpValue.length === 6;
  };

  return (
    <div className="flex flex-col justify-center items-center p-6 min-h-screen relative">
      <div className="absolute top-4 left-4">
        <Link to="/signIn">
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </Link>
      </div>

      <h1 className="text-[30px] font-normal leading-[40px] text-center text-[#202428] w-[290px] mb-0">
        OTP
      </h1>

      <p className="w-[295px] text-[14px] leading-[18px] text-center text-[#707070] tracking-[0.4px] mb-9">
        We will send a one-time password to restore access to your profile
      </p>

      <div className="mb-9">
        <InputOTP
          value={otpValue}
          onChange={handleOtpChange}
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
        >
          <InputOTPGroup className="flex gap-2 justify-center">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button disabled={!isVerifyEnabled() || isLoading} onClick={onVerifyOtp}>
        {isLoading ? 'Logging In...' : 'Log in'}
      </Button>
    </div>
  );
};
