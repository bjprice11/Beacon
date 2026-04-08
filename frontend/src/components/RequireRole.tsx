import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import RequireAuth from './RequireAuth';

export default function RequireRole({
  anyOf,
  children,
}: {
  anyOf: string[];
  children: ReactNode;
}) {
  const { authSession } = useAuth();
  const roles = authSession?.roles ?? [];
  const isAllowed = anyOf.some((role) => roles.includes(role));

  return (
    <RequireAuth>
      {isAllowed ? (
        <>{children}</>
      ) : (
        <div className="container py-4">
          <div className="alert alert-danger" role="alert">
            You do not have permission to view this page.
          </div>
        </div>
      )}
    </RequireAuth>
  );
}

