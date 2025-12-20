import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignIn } from '@/hooks/apis/useSignIn';
import { SignInCard } from './SignInCard';

export const SigninContainer = () => {
  const [validationError, setValidationError] = useState<{ message: string } | null>(null);
  const navigate = useNavigate();

  const { isSuccess, isPending, error, mutateAsync: signInMutation } = useSignIn();

  const [signinForm, setSigninForm] = useState({
    email: '',
    password: '',
  });

  async function onSigninFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!signinForm.email || !signinForm.password) {
      setValidationError({ message: 'All fields are required' });
      return;
    }

    setValidationError(null);

    await signInMutation({
      email: signinForm.email,
      password: signinForm.password,
    });
  }

  useEffect(() => {
    console.log('isSuccess changed:', isSuccess);
    if (isSuccess) {
      console.log('Navigating to /home');
      navigate('/home');
    }
  }, [isSuccess, navigate]);

  return (
    <SignInCard
      signinForm={signinForm}
      setSigninForm={setSigninForm}
      validationError={validationError}
      onSigninFormSubmit={onSigninFormSubmit}
      isPending={isPending}
      isSuccess={isSuccess}
      error={error}
    />
  );
};
