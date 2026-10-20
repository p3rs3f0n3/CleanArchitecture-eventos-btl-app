import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { Card } from '../components/common/Card';
import { ApiError } from '../../domain/errors/ApiError';

export function LoginPage() {
  const { login, cargando } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-xl font-bold text-gray-900">Gestión de Eventos BTL</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <ErrorAlert message={error} />
          <Button type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
        <p className="text-sm text-gray-500">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-indigo-600 font-medium">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
