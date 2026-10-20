import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCases } from '../../infrastructure/di';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { Card } from '../components/common/Card';
import { ApiError } from '../../domain/errors/ApiError';

// Nota de alcance: el auto-registro público es SOLO para crear cuentas ADMIN
// (arranque del sistema). Cliente, Coordinador y Productor reciben sus
// credenciales de un ADMIN, desde "Clientes" o "Personal" en el dashboard —
// no se auto-registran, porque sus cuentas están atadas a un registro de
// negocio que ya tiene que existir (clienteId / personalId). Ver ARQUITECTURA.md.
export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await useCases.register.execute({ email, password, rol: 'ADMIN' });
      navigate('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-xl font-bold text-gray-900">Crear cuenta de Administrador</h1>
        <p className="text-xs text-gray-500">
          Las cuentas de Cliente, Coordinador y Productor las crea un Admin desde el dashboard, no acá.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <ErrorAlert message={error} />
          <Button type="submit" disabled={cargando}>
            {cargando ? 'Creando...' : 'Crear cuenta'}
          </Button>
        </form>
        <p className="text-sm text-gray-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-indigo-600 font-medium">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  );
}
