import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useCases } from '../../../infrastructure/di';
import { UsuarioCuenta } from '../../../domain/entities/Usuario';
import { Cliente } from '../../../domain/entities/Cliente';
import { Personal } from '../../../domain/entities/Personal';
import { Ciudad } from '../../../domain/entities/Ciudad';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ErrorAlert } from '../common/ErrorAlert';
import { ApiError } from '../../../domain/errors/ApiError';

/**
 * Panel EXCLUSIVO de ADMIN: soporte técnico de cuentas — bloquear/desbloquear
 * y resetear contraseñas de Clientes, Coordinadores y Productores. El Admin
 * NO gestiona eventos acá — ese poder es del Coordinador (ver EventosPanel).
 */
export function AdministracionPanel() {
  const [usuarios, setUsuarios] = useState<UsuarioCuenta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [cargando, setCargando] = useState(false);
  const [usuarioParaReset, setUsuarioParaReset] = useState<UsuarioCuenta | null>(null);
  const [passwordNueva, setPasswordNueva] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [nuevaCiudad, setNuevaCiudad] = useState('');
  const [errorCiudad, setErrorCiudad] = useState<string | null>(null);
  const [guardandoCiudad, setGuardandoCiudad] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [usuariosData, clientesData, personalData, ciudadesData] = await Promise.all([
        useCases.listarUsuarios.execute(),
        useCases.listarClientes.execute(),
        useCases.listarPersonal.execute(),
        useCases.listarCiudades.execute(),
      ]);
      setUsuarios(usuariosData);
      setClientes(clientesData);
      setPersonal(personalData);
      setCiudades(ciudadesData);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const clientesPorId = new Map(clientes.map((c) => [c.id, c]));
  const personalPorId = new Map(personal.map((p) => [p.id, p]));

  /** Punto 4 del pedido: relacionar la cuenta con la persona/empresa dueña, para saber a quién pertenece. */
  function vinculoDe(u: UsuarioCuenta): string {
    if (u.rol === 'CLIENTE' && u.clienteId) {
      return clientesPorId.get(u.clienteId)?.nombreEmpresa ?? 'Cliente no encontrado';
    }
    if ((u.rol === 'COORDINADOR' || u.rol === 'PRODUCTOR') && u.personalId) {
      return personalPorId.get(u.personalId)?.nombreCompleto ?? 'Personal no encontrado';
    }
    if (u.rol === 'ADMIN') {
      return 'Cuenta de administración (sin vínculo de negocio)';
    }
    return 'Sin vincular';
  }

  async function toggleActivo(usuarioObjetivo: UsuarioCuenta) {
    setError(null);
    try {
      await useCases.cambiarEstadoActivoUsuario.execute(usuarioObjetivo.id, !usuarioObjetivo.activo);
      setUsuarios((prev) => prev.map((u) => (u.id === usuarioObjetivo.id ? { ...u, activo: !u.activo } : u)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado de la cuenta.');
    }
  }

  async function handleCrearCiudad(e: FormEvent) {
    e.preventDefault();
    setErrorCiudad(null);
    setGuardandoCiudad(true);
    try {
      const creada = await useCases.crearCiudad.execute({ nombre: nuevaCiudad });
      setCiudades((prev) => [...prev, creada].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNuevaCiudad('');
    } catch (err) {
      setErrorCiudad(err instanceof ApiError ? err.message : 'No se pudo crear la ciudad.');
    } finally {
      setGuardandoCiudad(false);
    }
  }

  async function handleEliminarCiudad(ciudad: Ciudad) {
    if (!window.confirm(`¿Borrar la ciudad "${ciudad.nombre}"?`)) return;
    setErrorCiudad(null);
    try {
      await useCases.eliminarCiudad.execute(ciudad.id);
      setCiudades((prev) => prev.filter((c) => c.id !== ciudad.id));
    } catch (err) {
      // Acá es donde ves en vivo la regla de "no se puede borrar una ciudad en uso".
      setErrorCiudad(err instanceof ApiError ? err.message : 'No se pudo borrar la ciudad.');
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (!usuarioParaReset) return;
    setError(null);
    setExito(null);
    try {
      await useCases.resetearPasswordUsuario.execute(usuarioParaReset.id, passwordNueva);
      setExito(`Contraseña reseteada para ${usuarioParaReset.email}.`);
      setUsuarioParaReset(null);
      setPasswordNueva('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo resetear la contraseña.');
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
    <Card className="text-left">
      <h2 className="font-semibold text-gray-900 mb-1">Administración de cuentas</h2>
      <p className="text-xs text-gray-500 mb-3">
        Soporte técnico: bloquear/desbloquear cuentas y resetear contraseñas. La gestión de eventos es responsabilidad
        del Coordinador, no del Admin.
      </p>
      {cargando && <p className="text-sm text-gray-500">Cargando...</p>}
      <ul className="flex flex-col gap-2">
        {usuarios.map((u) => (
          <li key={u.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-center gap-2">
              <div>
                <p className="font-medium text-gray-900">{u.email}</p>
                <p className="text-xs text-gray-500">{u.rol}</p>
                <p className="text-xs text-indigo-600">→ {vinculoDe(u)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {u.activo ? 'ACTIVA' : 'BLOQUEADA'}
                </span>
                <div className="flex gap-3">
                  <button className="text-xs text-indigo-600 font-medium" onClick={() => toggleActivo(u)}>
                    {u.activo ? 'Bloquear' : 'Desbloquear'}
                  </button>
                  <button
                    className="text-xs text-indigo-600 font-medium"
                    onClick={() => {
                      setUsuarioParaReset(usuarioParaReset?.id === u.id ? null : u);
                      setPasswordNueva('');
                      setError(null);
                      setExito(null);
                    }}
                  >
                    Resetear contraseña
                  </button>
                </div>
              </div>
            </div>
            {usuarioParaReset?.id === u.id && (
              <form onSubmit={handleReset} className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                <Input
                  label="Contraseña nueva"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  required
                  minLength={8}
                />
                <div className="flex gap-2">
                  <Button type="submit">Confirmar reset</Button>
                  <button type="button" className="text-sm text-gray-500" onClick={() => setUsuarioParaReset(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </li>
        ))}
        {usuarios.length === 0 && !cargando && <p className="text-sm text-gray-500">No hay usuarios registrados.</p>}
      </ul>
      <ErrorAlert message={error} />
      {exito && <p className="mt-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{exito}</p>}
    </Card>

    <Card className="text-left">
      <h2 className="font-semibold text-gray-900 mb-1">Ciudades</h2>
      <p className="text-xs text-gray-500 mb-3">
        Catálogo de ciudades para los puntos/Sedes de un evento — el Coordinador elige de esta lista, solo el ADMIN la carga.
      </p>
      <form onSubmit={handleCrearCiudad} className="flex gap-2 items-end mb-3">
        <div className="flex-1">
          <Input label="Nombre de la ciudad" value={nuevaCiudad} onChange={(e) => setNuevaCiudad(e.target.value)} required />
        </div>
        <Button type="submit" disabled={guardandoCiudad}>
          {guardandoCiudad ? 'Guardando...' : 'Agregar'}
        </Button>
      </form>
      <ErrorAlert message={errorCiudad} />
      <ul className="flex flex-wrap gap-2 mt-2">
        {ciudades.map((c) => (
          <li key={c.id} className="flex items-center gap-1 text-sm text-gray-700 pl-3 pr-1 py-1 rounded-full bg-gray-100">
            {c.nombre}
            <button
              type="button"
              onClick={() => handleEliminarCiudad(c)}
              className="text-gray-400 hover:text-red-600 leading-none px-1"
              aria-label={`Borrar ${c.nombre}`}
              title="Borrar ciudad"
            >
              ×
            </button>
          </li>
        ))}
        {ciudades.length === 0 && !cargando && <p className="text-sm text-gray-500">Todavía no hay ciudades cargadas.</p>}
      </ul>
    </Card>
    </div>
  );
}
