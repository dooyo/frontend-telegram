import { AUTH_API_URL, API_URL } from './config';

export const getAuthToken = async () => {
  return localStorage.getItem('authToken');
};

export const getMe = async (authToken: string) => {
  const response = await fetch(`${API_URL}/profiles/me`, {
    method: 'GET',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json'
    }
  });
  if (response.status !== 200) {
    throw new Error((await response.json()).message ?? 'Failed to fetch me');
  }
  return response.json();
};

export const login = async (data: { email: string }) => {
  const response = await fetch(`${AUTH_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: data.email })
  });

  if (response.status !== 201) {
    throw new Error((await response.json()).message ?? 'Failed to login');
  }
};

export const verifyOtp = async (data: { email: string; otp: string }) => {
  const response = await fetch(`${AUTH_API_URL}/auth/verifyOtp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: data.email, otp: data.otp })
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error((await response.json()).message ?? 'Failed to verify OTP');
  }

  const authToken = (await response.json())?.authToken;
  console.log('authToken', authToken);

  if (!authToken) {
    throw new Error('Failed to verify OTP');
  }

  localStorage.setItem('authToken', authToken);
  return { authToken };
};

export const register = async (data: {
  email: string;
  username: string;
  avatar: File;
}) => {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('username', data.username);
  formData.append(
    'avatar',
    new Blob([data.avatar], { type: data.avatar.type }),
    data.avatar.name
  );

  const response = await fetch(`${AUTH_API_URL}/auth/users`, {
    method: 'POST',
    body: formData
  });

  if (response.status !== 201) {
    throw new Error((await response.json()).message ?? 'Failed to register');
  }
};