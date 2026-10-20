import { useState, type FormEvent } from 'react';
import { useCases } from '../../../infrastructure/di';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { ErrorAlert } from '../common/ErrorAlert';
import { ApiError } from '../../../domain/errors/ApiError';

export function MiCuentaPanel() {
  const { usuario } = useAuth();
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setExito(null);
    setGuardando(true);
    try {
      await useCases.cambiarPassword.execute(passwordActual, passwordNueva);
      setExito('Contraseña actualizada correctamente.');
      setPasswordActual('');
      setPasswordNueva('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card className="max-w-sm flex flex-col gap-3 text-left">
      <h2 className="font-semibold text-gray-900">Cambiar contraseña</h2>
      <p className="text-sm text-gray-500">Sesión: {usuario?.email}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Contraseña actual"
          type="password"
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
          required
        />
        <Input
          label="Contraseña nueva"
          type="password"
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
          required
          minLength={8}
        />
        <ErrorAlert message={error} />
        {exito && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{exito}</p>}
        <Button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Actualizar contraseña'}
        </Button>
      </form>
    </Card>
  );
}
