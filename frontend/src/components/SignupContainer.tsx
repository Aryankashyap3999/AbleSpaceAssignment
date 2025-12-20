import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignUp } from '@/hooks/apis/useSignUp';
import { SignUpCard } from './SignUpCard';

export const SignupContainer = () => {
  const navigate = useNavigate();

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
  });

  const [validationError, setValidationError] = useState<{ message: string } | null>(null);
  const { isSuccess, isPending, error, mutateAsync: signUpMutation } = useSignUp();

  async function onSignupFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!signupForm.email || !signupForm.password || !signupForm.name || !signupForm.username) {
      setValidationError({ message: 'All fields are required' });
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setValidationError({ message: 'Passwords do not match' });
      return;
    }

    if (signupForm.username.length < 3) {
      setValidationError({ message: 'Username must be at least 3 characters' });
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(signupForm.username)) {
      setValidationError({ message: 'Username can only contain letters and numbers' });
      return;
    }

    setValidationError(null);

    await signUpMutation({
      email: signupForm.email,
      password: signupForm.password,
      name: signupForm.name,
      username: signupForm.username,
    });
  }

  useEffect(() => {
    if (isSuccess) {
      navigate('/');
    }
  }, [navigate, isSuccess]);

  return (
    <SignUpCard
      signupForm={signupForm}
      setSignupForm={setSignupForm}
      onSignupFormSubmit={onSignupFormSubmit}
      validationError={validationError}
      error={error}
      isPending={isPending}
      isSuccess={isSuccess}
    />
  );
};

