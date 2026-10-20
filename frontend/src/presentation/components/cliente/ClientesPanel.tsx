import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useClientes } from '../../hooks/useClientes';
import { useAuth } from '../../context/AuthContext';
import { useCases } from '../../../infrastructure/di';
import { Cliente } from '../../../domain/entities/Cliente';
import { UsuarioCuenta } from '../../../domain/entities/Usuario';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { ErrorAlert } from '../common/ErrorAlert';
import { ApiError } from '../../../domain/errors/ApiError';

interface Props {
  clienteSeleccionado: Cliente | null;
  onSeleccionar: (cliente: Cliente | null) => void;
}

const FORM_VACIO = { nombreEmpresa: '', contactoNombre: '', contactoEmail: '', contactoTelefono: '', direccion: '' };

export function ClientesPanel({ clienteSeleccionado, onSeleccionar }: Props) {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN';
  // Decisión de Nelly: crear clientes queda exclusivo de ADMIN. El Coordinador
  // solo elige de la lista al armar un evento.
  const puedeCrear = esAdmin;

  const { clientes, cargando, crear, actualizar, cambiarEstadoActivo, crearAcceso } = useClientes();

  const [modo, setModo] = useState<'crear' | 'detalle'>(puedeCrear ? 'crear' : 'detalle');
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [editForm, setEditForm] = useState(FORM_VACIO);
  const [errorEdit, setErrorEdit] = useState<string | null>(null);
  const [guardandoEdit, setGuardandoEdit] = useState(false);
  const [exitoEdit, setExitoEdit] = useState<string | null>(null);

  const [mostrarAcceso, setMostrarAcceso] = useState(false);
  const [accesoForm, setAccesoForm] = useState({ email: '', password: '' });
  const [errorAcceso, setErrorAcceso] = useState<string | null>(null);
  const [exitoAcceso, setExitoAcceso] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<UsuarioCuenta[]>([]);
  const cargarUsuarios = useCallback(async () => {
    if (!esAdmin) return;
    setUsuarios(await useCases.listarUsuarios.execute());
  }, [esAdmin]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  /** Para saber, sin adivinar, si un cliente ya tiene acceso creado. */
  const usuarioPorClienteId = new Map(usuarios.filter((u) => u.clienteId).map((u) => [u.clienteId as string, u]));
  const accesoDeSeleccionado = clienteSeleccionado ? usuarioPorClienteId.get(clienteSeleccionado.id) : undefined;

  // Al hacer click en un cliente de la lista, se carga acá para ver/editar.
  useEffect(() => {
    if (clienteSeleccionado) {
      setModo('detalle');
      setEditForm({
        nombreEmpresa: clienteSeleccionado.nombreEmpresa,
        contactoNombre: clienteSeleccionado.contactoNombre,
        contactoEmail: clienteSeleccionado.contactoEmail,
        contactoTelefono: clienteSeleccionado.contactoTelefono,
        direccion: clienteSeleccionado.direccion,
      });
      setMostrarAcceso(false);
      setErrorEdit(null);
      setExitoEdit(null);
    }
  }, [clienteSeleccionado]);

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const nuevo = await crear(form);
      setForm(FORM_VACIO);
      onSeleccionar(nuevo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el cliente.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleGuardarEdit(e: FormEvent) {
    e.preventDefault();
    if (!clienteSeleccionado) return;
    setErrorEdit(null);
    setExitoEdit(null);
    setGuardandoEdit(true);
    try {
      const actualizado = await actualizar(clienteSeleccionado.id, editForm);
      onSeleccionar(actualizado);
      setExitoEdit('Datos actualizados correctamente.');
    } catch (err) {
      setErrorEdit(err instanceof ApiError ? err.message : 'No se pudo actualizar el cliente.');
    } finally {
      setGuardandoEdit(false);
    }
  }

  async function handleToggleActivo() {
    if (!clienteSeleccionado) return;
    setErrorEdit(null);
    try {
      const actualizado = await cambiarEstadoActivo(clienteSeleccionado.id, !clienteSeleccionado.activo);
      onSeleccionar(actualizado);
    } catch (err) {
      setErrorEdit(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado.');
    }
  }

  async function handleCrearAcceso(e: FormEvent) {
    e.preventDefault();
    if (!clienteSeleccionado) return;
    setErrorAcceso(null);
    setExitoAcceso(null);
    try {
      await crearAcceso(clienteSeleccionado.id, accesoForm.email, accesoForm.password);
      setExitoAcceso(`Acceso creado. El cliente ya puede ingresar con ${accesoForm.email}.`);
      setAccesoForm({ email: '', password: '' });
      cargarUsuarios();
    } catch (err) {
      setErrorAcceso(err instanceof ApiError ? err.message : 'No se pudo crear el acceso.');
    }
  }

  const mostrarPanelIzquierdo = puedeCrear || clienteSeleccionado;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {mostrarPanelIzquierdo && (
        <Card className="flex flex-col gap-3 text-left h-fit">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">{modo === 'crear' ? 'Nuevo cliente' : 'Detalle del cliente'}</h2>
            {modo === 'detalle' && puedeCrear && (
              <button className="text-xs text-indigo-600 font-medium" onClick={() => setModo('crear')}>
                + Nuevo cliente
              </button>
            )}
          </div>

          {modo === 'crear' && puedeCrear && (
            <form onSubmit={handleCrear} className="flex flex-col gap-3">
              <Input label="Empresa" value={form.nombreEmpresa} onChange={(e) => setForm({ ...form, nombreEmpresa: e.target.value })} required />
              <Input
                label="Contacto"
                value={form.contactoNombre}
                onChange={(e) => setForm({ ...form, contactoNombre: e.target.value })}
                pattern="[a-zA-ZÀ-ÿ\s'.-]+"
                title="Solo letras y espacios"
                required
              />
              <Input
                label="Email de contacto"
                type="email"
                value={form.contactoEmail}
                onChange={(e) => setForm({ ...form, contactoEmail: e.target.value })}
                required
              />
              <Input
                label="Teléfono"
                value={form.contactoTelefono}
                onChange={(e) => setForm({ ...form, contactoTelefono: e.target.value })}
                inputMode="numeric"
                pattern="\d{7,15}"
                title="Solo números, entre 7 y 15 dígitos"
                required
              />
              <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required />
              <ErrorAlert message={error} />
              <Button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Crear cliente'}
              </Button>
            </form>
          )}

          {modo === 'detalle' && clienteSeleccionado && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-block w-fit text-xs font-semibold px-2 py-0.5 rounded-full ${
                    clienteSeleccionado.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {clienteSeleccionado.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
                {esAdmin &&
                  (accesoDeSeleccionado ? (
                    <span
                      className={`inline-block w-fit text-xs font-semibold px-2 py-0.5 rounded-full ${
                        accesoDeSeleccionado.activo ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {accesoDeSeleccionado.activo ? `ACCESO ACTIVO · ${accesoDeSeleccionado.email}` : `ACCESO BLOQUEADO · ${accesoDeSeleccionado.email}`}
                    </span>
                  ) : (
                    <span className="inline-block w-fit text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      SIN ACCESO CREADO
                    </span>
                  ))}
              </div>

              {esAdmin ? (
                <form onSubmit={handleGuardarEdit} className="flex flex-col gap-3">
                  <Input
                    label="Empresa"
                    value={editForm.nombreEmpresa}
                    onChange={(e) => setEditForm({ ...editForm, nombreEmpresa: e.target.value })}
                    required
                  />
                  <Input
                    label="Contacto"
                    value={editForm.contactoNombre}
                    onChange={(e) => setEditForm({ ...editForm, contactoNombre: e.target.value })}
                    pattern="[a-zA-ZÀ-ÿ\s'.-]+"
                    title="Solo letras y espacios"
                    required
                  />
                  <Input
                    label="Email de contacto"
                    type="email"
                    value={editForm.contactoEmail}
                    onChange={(e) => setEditForm({ ...editForm, contactoEmail: e.target.value })}
                    required
                  />
                  <Input
                    label="Teléfono"
                    value={editForm.contactoTelefono}
                    onChange={(e) => setEditForm({ ...editForm, contactoTelefono: e.target.value })}
                    inputMode="numeric"
                    pattern="\d{7,15}"
                    title="Solo números, entre 7 y 15 dígitos"
                    required
                  />
                  <Input
                    label="Dirección"
                    value={editForm.direccion}
                    onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                    required
                  />
                  <ErrorAlert message={errorEdit} />
                  {exitoEdit && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{exitoEdit}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={guardandoEdit}>
                      {guardandoEdit ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                    <button
                      type="button"
                      onClick={handleToggleActivo}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        clienteSeleccionado.activo ? 'border-red-300 text-red-600' : 'border-green-300 text-green-700'
                      }`}
                    >
                      {clienteSeleccionado.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-gray-700 flex flex-col gap-1">
                  <p>
                    <span className="font-medium">Empresa:</span> {clienteSeleccionado.nombreEmpresa}
                  </p>
                  <p>
                    <span className="font-medium">Contacto:</span> {clienteSeleccionado.contactoNombre}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {clienteSeleccionado.contactoEmail}
                  </p>
                  <p>
                    <span className="font-medium">Teléfono:</span> {clienteSeleccionado.contactoTelefono}
                  </p>
                  <p>
                    <span className="font-medium">Dirección:</span> {clienteSeleccionado.direccion}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Solo un ADMIN puede editar o desactivar clientes.</p>
                </div>
              )}

              {esAdmin && accesoDeSeleccionado && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Ya tiene acceso creado. Para bloquear la cuenta o resetear la contraseña, andá a la pestaña "Administración".
                  </p>
                </div>
              )}

              {esAdmin && !accesoDeSeleccionado && (
                <div className="pt-3 border-t border-gray-100">
                  <button className="text-xs text-indigo-600 font-medium" onClick={() => setMostrarAcceso((v) => !v)}>
                    {mostrarAcceso ? 'Cerrar' : 'Crear acceso (usuario/contraseña)'}
                  </button>
                  {mostrarAcceso && (
                    <form onSubmit={handleCrearAcceso} className="mt-2 flex flex-col gap-2">
                      <Input
                        label="Email de acceso"
                        type="email"
                        value={accesoForm.email}
                        onChange={(e) => setAccesoForm({ ...accesoForm, email: e.target.value })}
                        required
                      />
                      <Input
                        label="Contraseña temporal"
                        value={accesoForm.password}
                        onChange={(e) => setAccesoForm({ ...accesoForm, password: e.target.value })}
                        required
                        minLength={8}
                      />
                      <ErrorAlert message={errorAcceso} />
                      {exitoAcceso && (
                        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{exitoAcceso}</p>
                      )}
                      <Button type="submit">Crear acceso</Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <Card className="text-left">
        <h2 className="font-semibold text-gray-900 mb-3">Clientes ({clientes.length})</h2>
        {cargando && <p className="text-sm text-gray-500">Cargando...</p>}
        <ul className="flex flex-col gap-2">
          {clientes.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSeleccionar(c)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                  clienteSeleccionado?.id === c.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                } ${!c.activo ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-center gap-2">
                  <p className="font-medium text-gray-900">{c.nombreEmpresa}</p>
                  <div className="flex gap-1">
                    {!c.activo && (
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">INACTIVO</span>
                    )}
                    {esAdmin &&
                      (usuarioPorClienteId.has(c.id) ? (
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">CON ACCESO</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">SIN ACCESO</span>
                      ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {c.contactoNombre} · {c.contactoEmail}
                </p>
              </button>
            </li>
          ))}
          {clientes.length === 0 && !cargando && <p className="text-sm text-gray-500">Todavía no hay clientes.</p>}
        </ul>
      </Card>
    </div>
  );
}
