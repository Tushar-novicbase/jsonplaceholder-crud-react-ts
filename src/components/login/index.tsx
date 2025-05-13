import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import * as yup from 'yup';
import { isAuthenticated, setLocalStorage } from '../../utils/auth';

// Define the form data type
interface LoginFormData {
  email: string;
  password: string;
}

// Define the validation schema
const schema = yup.object().shape({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to home
  const from = (location.state)?.from?.pathname || '/';
  
  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const { register, handleSubmit, formState: { errors, isSubmitting }} = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: 'test@mail.com',
      password: 'changeme',
    },
    
  });

  const onSubmit = async (data: LoginFormData) => {
    if(data.email === 'test@mail.com' && data.password === 'changeme') {
        const access_token = new Date().getTime();
        setLocalStorage('access_token', access_token.toString());
        navigate(from, { replace: true });
    }else{
        alert('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome back!</h2>
          <p className="login-subtitle">Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <div className="input-container">
              <input
                {...register('email')}
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (<p className="error-message">{errors.email.message}</p>)}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-container">
              <input
                {...register('password')}
                id="password"
                type='password'
                className="form-input"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (<p className="error-message">{errors.password.message}</p>)}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Loading ..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginContainer; 