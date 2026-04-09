import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const exemptPaths = new Set([
  '/complete-profile',
  '/login',
  '/register',
  '/logout',
]);

/**
 * Sends Supporter-only users (e.g. after Google) to /complete-profile until the backend marks profile complete.
 */
export default function ProfileCompletionRedirect() {
  const { authSession, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!authSession?.isAuthenticated || !authSession.needsProfileCompletion) {
      return;
    }
    if (exemptPaths.has(location.pathname)) {
      return;
    }
    navigate('/complete-profile', { replace: true });
  }, [
    authSession?.isAuthenticated,
    authSession?.needsProfileCompletion,
    isLoading,
    location.pathname,
    navigate,
  ]);

  return null;
}
