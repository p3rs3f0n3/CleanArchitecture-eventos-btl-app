export type RolSistema = 'ADMIN' | 'CLIENTE' | 'COORDINADOR' | 'PRODUCTOR';

export interface Usuario {
  id: string;
  email: string;
  rol: RolSistema;
}

/** Vista extendida que solo usa el panel de Administración (ADMIN). */
export interface UsuarioCuenta extends Usuario {
  activo: boolean;
  clienteId?: string;
  personalId?: string;
  createdAt: string;
}
