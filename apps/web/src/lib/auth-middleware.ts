import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

/**
 * Middleware para requerir autenticación en rutas API
 * Retorna el session si está autenticado, o un error 401 si no
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      ),
      session: null,
    };
  }
  
  return { session, error: null };
}

/**
 * Middleware para requerir un rol específico
 */
export async function requireRole(requiredRole: string = 'user') {
  const { session, error } = await requireAuth();
  
  if (error) return { error, session: null };
  
  // Verificar role si existe en el session
  if (session.user.role && session.user.role !== requiredRole && session.user.role !== 'admin') {
    return {
      error: NextResponse.json(
        { error: 'No tienes permisos para esta acción' },
        { status: 403 }
      ),
      session: null,
    };
  }
  
  return { session, error: null };
}
