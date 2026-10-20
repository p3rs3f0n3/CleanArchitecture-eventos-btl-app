import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { usePersonal } from '../../hooks/usePersonal';
import { useAuth } from '../../context/AuthContext';
import { useCases } from '../../../infrastructure/di';
import { Categoria } from '../../../domain/entities/Categoria';
import { Personal, Sexo } from '../../../domain/entities/Personal';
import { UsuarioCuenta } from '../../../domain/entities/Usuario';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { ErrorAlert } from '../common/ErrorAlert';
import { ApiError } from '../../../domain/errors/ApiError';

const FORM_VACIO = { nombreCompleto: '', documento: '', telefono: '', sexo: 'OTRO' as Sexo, direccion: '', categoriaId: '' };

/**
 * Coordinadores y Productores: personal de GESTIÓN, distinto del staff de
 * evento (ver PersonalPanel.tsx) — son los ÚNICOS que pueden recibir un
 * Usuario (acceso al sistema).
 */
export function GestionPanel() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN';
  const { personal, crear, actualizar, cambiarEstadoActivo, crearAcceso } = usePersonal();

  const [categoriasGestion, setCategoriasGestion] = useState<Categoria[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioCuenta[]>([]);
  const [modo, setModo] = useState<'crear' | 'detalle'>('crear');
  const [seleccionado, setSeleccionado] = useState<Personal | null>(null);

  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [editForm, setEditForm] = useState(FORM_VACIO);
  const [errorEdit, setErrorEdit] = useState<string | null>(null);
  const [guardandoEdit, setGuardandoEdit] = useState(false);
  const [exitoEdit, setExitoEdit] = useState<string | null>(null);

  const [mostrarAcceso, setMostrarAcceso] = useState(false);
  const [accesoForm, setAccesoForm] = useState({ email: '', password: '', rol: 'COORDINADOR' as 'COORDINADOR' | 'PRODUCTOR' });
  const [errorAcceso, setErrorAcceso] = useState<string | null>(null);
  const [exitoAcceso, setExitoAcceso] = useState<string | null>(null);

  const cargarCategorias = useCallback(async () => {
    const lista = (await useCases.listarCategorias.execute()).filter((c) => c.esGestion);
    setCategoriasGestion(lista);
    setForm((f) => (f.categoriaId ? f : { ...f, categoriaId: lista[0]?.id ?? '' }));
  }, []);

  const cargarUsuarios = useCallback(async () => {
    setUsuarios(await useCases.listarUsuarios.execute());
  }, []);

  useEffect(() => {
    cargarCategorias();
    cargarUsuarios();
  }, [cargarCategorias, cargarUsuarios]);

  useEffect(() => {
    if (seleccionado) {
      setModo('detalle');
      setEditForm({
        nombreCompleto: seleccionado.nombreCompleto,
        documento: seleccionado.documento,
        telefono: seleccionado.telefono,
        sexo: seleccionado.sexo,
        direccion: seleccionado.direccion,
        categoriaId: seleccionado.categoriaId,
      });
      setMostrarAcceso(false);
      setErrorEdit(null);
      setExitoEdit(null);
    }
  }, [seleccionado]);

  const categoriasPorId = new Map(categoriasGestion.map((c) => [c.id, c]));
  const equipoGestion = personal.filter((p) => categoriasPorId.has(p.categoriaId));
  /** Para saber, sin adivinar, si un Coordinador/Productor ya tiene acceso creado. */
  const usuarioPorPersonalId = new Map(usuarios.filter((u) => u.personalId).map((u) => [u.personalId as string, u]));
  const accesoDeSeleccionado = seleccionado ? usuarioPorPersonalId.get(seleccionado.id) : undefined;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crear({ ...form });
      setForm({ ...FORM_VACIO, categoriaId: form.categoriaId });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el registro.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleGuardarEdit(e: FormEvent) {
    e.preventDefault();
    if (!seleccionado) return;
    setErrorEdit(null);
    setExitoEdit(null);
    setGuardandoEdit(true);
    try {
      const actualizado = await actualizar(seleccionado.id, { ...editForm });
      setSeleccionado(actualizado);
      setExitoEdit('Datos actualizados correctamente.');
    } catch (err) {
      setErrorEdit(err instanceof ApiError ? err.message : 'No se pudo actualizar.');
    } finally {
      setGuardandoEdit(false);
    }
  }

  async function handleToggleActivo() {
    if (!seleccionado) return;
    setErrorEdit(null);
    try {
      const actualizado = await cambiarEstadoActivo(seleccionado.id, !seleccionado.activo);
      setSeleccionado(actualizado);
    } catch (err) {
      setErrorEdit(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado.');
    }
  }

  function abrirAcceso() {
    setMostrarAcceso((v) => !v);
    setErrorAcceso(null);
    setExitoAcceso(null);
    if (seleccionado) {
      const nombreCategoria = categoriasPorId.get(seleccionado.categoriaId)?.nombre.toUpperCase();
      setAccesoForm((f) => ({ ...f, rol: nombreCategoria === 'PRODUCTOR' ? 'PRODUCTOR' : 'COORDINADOR' }));
    }
  }

  async function handleCrearAcceso(e: FormEvent) {
    e.preventDefault();
    if (!seleccionado) return;
    setErrorAcceso(null);
    setExitoAcceso(null);
    try {
      await crearAcceso(seleccionado.id, accesoForm.email, accesoForm.password, accesoForm.rol);
      setExitoAcceso(`Acceso creado. Ya puede ingresar como ${accesoForm.rol} con ${accesoForm.email}.`);
      setAccesoForm({ ...accesoForm, email: '', password: '' });
      cargarUsuarios();
    } catch (err) {
      setErrorAcceso(err instanceof ApiError ? err.message : 'No se pudo crear el acceso.');
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="flex flex-col gap-3 text-left h-fit">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">{modo === 'crear' ? 'Nuevo Coordinador/Productor' : 'Detalle'}</h2>
          {modo === 'detalle' && (
            <button className="text-xs text-indigo-600 font-medium" onClick={() => setModo('crear')}>
              + Nuevo
            </button>
          )}
        </div>

        {modo === 'crear' && !esAdmin && (
          <p className="text-sm text-gray-500">Solo un ADMIN puede crear Coordinadores o Productores.</p>
        )}

        {modo === 'crear' && esAdmin && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="Nombre completo"
              value={form.nombreCompleto}
              onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
              pattern="[a-zA-ZÀ-ÿ\s'.-]+"
              title="Solo letras y espacios"
              required
            />
            <Input
              label="Documento"
              value={form.documento}
              onChange={(e) => setForm({ ...form, documento: e.target.value })}
              inputMode="numeric"
              pattern="\d{5,15}"
              title="Solo números, entre 5 y 15 dígitos"
              required
            />
            <Input
              label="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              inputMode="numeric"
              pattern="\d{7,15}"
              title="Solo números, entre 7 y 15 dígitos"
              required
            />
            <label className="flex flex-col gap-1 text-sm text-gray-700 text-left">
              <span className="font-medium">Sexo <span className="text-red-500">*</span></span>
              <select
                className="px-3 py-2 rounded-lg border border-gray-300"
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value as Sexo })}
              >
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
              </select>
            </label>
            <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required />
            <label className="flex flex-col gap-1 text-sm text-gray-700 text-left">
              <span className="font-medium">Categoría <span className="text-red-500">*</span></span>
              <select
                className="px-3 py-2 rounded-lg border border-gray-300"
                value={form.categoriaId}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                required
              >
                {categoriasGestion.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <ErrorAlert message={error} />
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Crear'}
            </Button>
          </form>
        )}

        {modo === 'detalle' && seleccionado && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-block w-fit text-xs font-semibold px-2 py-0.5 rounded-full ${
                  seleccionado.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {seleccionado.activo ? 'ACTIVO' : 'INACTIVO'}
              </span>
              {accesoDeSeleccionado ? (
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
              )}
            </div>

            {esAdmin ? (
              <form onSubmit={handleGuardarEdit} className="flex flex-col gap-3">
                <Input
                  label="Nombre completo"
                  value={editForm.nombreCompleto}
                  onChange={(e) => setEditForm({ ...editForm, nombreCompleto: e.target.value })}
                  pattern="[a-zA-ZÀ-ÿ\s'.-]+"
                  title="Solo letras y espacios"
                  required
                />
                <Input
                  label="Teléfono"
                  value={editForm.telefono}
                  onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                  inputMode="numeric"
                  pattern="\d{7,15}"
                  title="Solo números, entre 7 y 15 dígitos"
                  required
                />
                <label className="flex flex-col gap-1 text-sm text-gray-700 text-left">
                  <span className="font-medium">Sexo <span className="text-red-500">*</span></span>
                  <select
                    className="px-3 py-2 rounded-lg border border-gray-300"
                    value={editForm.sexo}
                    onChange={(e) => setEditForm({ ...editForm, sexo: e.target.value as Sexo })}
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </label>
                <Input
                  label="Dirección"
                  value={editForm.direccion}
                  onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                  required
                />
                <label className="flex flex-col gap-1 text-sm text-gray-700 text-left">
                  <span className="font-medium">Categoría <span className="text-red-500">*</span></span>
                  <select
                    className="px-3 py-2 rounded-lg border border-gray-300"
                    value={editForm.categoriaId}
                    onChange={(e) => setEditForm({ ...editForm, categoriaId: e.target.value })}
                  >
                    {categoriasGestion.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </label>
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
                      seleccionado.activo ? 'border-red-300 text-red-600' : 'border-green-300 text-green-700'
                    }`}
                  >
                    {seleccionado.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-sm text-gray-700 flex flex-col gap-1">
                <p><span className="font-medium">Documento:</span> {seleccionado.documento}</p>
                <p><span className="font-medium">Teléfono:</span> {seleccionado.telefono}</p>
                <p><span className="font-medium">Dirección:</span> {seleccionado.direccion}</p>
                <p><span className="font-medium">Categoría:</span> {categoriasPorId.get(seleccionado.categoriaId)?.nombre ?? '—'}</p>
                <p className="text-xs text-gray-400 mt-1">Solo un ADMIN puede editar, desactivar o crear accesos.</p>
              </div>
            )}

            {esAdmin && accesoDeSeleccionado && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Ya tiene acceso creado como <span className="font-medium">{accesoDeSeleccionado.rol}</span>. Para bloquear la
                  cuenta o resetear la contraseña, andá a la pestaña "Administración".
                </p>
              </div>
            )}

            {esAdmin && !accesoDeSeleccionado && (
              <div className="pt-3 border-t border-gray-100">
                <button className="text-xs text-indigo-600 font-medium" onClick={abrirAcceso}>
                  {mostrarAcceso ? 'Cerrar' : 'Crear acceso al sistema'}
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
                    <label className="flex flex-col gap-1 text-sm text-gray-700 text-left">
                      <span className="font-medium">Rol de sistema <span className="text-red-500">*</span></span>
                      <select
                        className="px-3 py-2 rounded-lg border border-gray-300"
                        value={accesoForm.rol}
                        onChange={(e) => setAccesoForm({ ...accesoForm, rol: e.target.value as 'COORDINADOR' | 'PRODUCTOR' })}
                      >
                        <option value="COORDINADOR">Coordinador</option>
                        <option value="PRODUCTOR">Productor</option>
                      </select>
                    </label>
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

      <Card className="text-left">
        <h2 className="font-semibold text-gray-900 mb-3">Coordinadores y Productores ({equipoGestion.length})</h2>
        <p className="text-xs text-gray-500 mb-2">Personal de gestión — son los únicos que pueden recibir acceso al sistema.</p>
        <ul className="flex flex-col gap-2">
          {equipoGestion.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setSeleccionado(p)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                  seleccionado?.id === p.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                } ${!p.activo ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{p.nombreCompleto}</p>
                  {!p.activo && <span className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">INACTIVO</span>}
                  {usuarioPorPersonalId.has(p.id) ? (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">CON ACCESO</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">SIN ACCESO</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Doc: {p.documento} · Tel: {p.telefono} · {categoriasPorId.get(p.categoriaId)?.nombre ?? '—'}
                </p>
              </button>
            </li>
          ))}
          {equipoGestion.length === 0 && <p className="text-sm text-gray-500">Todavía no hay Coordinadores ni Productores cargados.</p>}
        </ul>
      </Card>
    </div>
  );
}
