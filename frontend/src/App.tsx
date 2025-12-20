import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import { SocketContextProvider } from './context/SocketContext';
import { Auth } from './pages/Auth'; 
import { Home } from './pages/Home';
import { CreateTask } from './pages/CreateTask';
import { SigninContainer } from './components/SigninContainer';
import { SignupContainer } from './components/SignupContainer'; 
import { ProtectedRoute } from './components/ProtectedRoute';
import { NotificationCenter } from './components/NotificationCenter';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <SocketContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Auth><SigninContainer /></Auth>} />
              <Route path="/auth/signup" element={<Auth><SignupContainer /></Auth>} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks/new"
                element={
                  <ProtectedRoute>
                    <CreateTask />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <NotificationCenter />
            <Toaster />
          </BrowserRouter>
        </SocketContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}

export default App;
