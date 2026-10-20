import { useState, useEffect, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { usePersonal } from '../../hooks/usePersonal';
import { useAuth } from '../../context/AuthContext';
import { useCases } from '../../../infrastructure/di';
import { Categoria } from '../../../domain/entities/Categoria';
import { Personal, Sexo } from '../../../domain/entities/Personal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { ErrorAlert } from '../common/ErrorAlert';
import { ApiError } from '../../../domain/errors/ApiError';

const FORM_VACIO = {
  nombreCompleto: '',
  documento: '',
  telefono: '',
  sexo: 'OTRO' as Sexo,
  direccion: '',
  categoriaId: '',
  medidas: '',
  peso: '',
  estatura: '',
  tallaRopa: '',
};

/**
 * Staff de EVENTO (Bartender, DJ, Modelo, Payaso, Impulsador/a...). Nunca
 * recibe Usuario/acceso al sistema — reporta al Productor el día del evento.
 * Coordinadores y Productores se gestionan aparte, en la pestaña
 * "Coordinadores/Productores" (ver GestionPanel.tsx).
 */
export function PersonalPanel() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'ADMIN';
  // Decisión de Nelly: crear staff y categorías queda exclusivo de ADMIN. El
  // Coordinador solo elige de la lista al armar el equipo de un evento.
  const puedeCrear = esAdmin;
  const { personal, crear, actualizar, cambiarEstadoActivo, subirFoto } = usePersonal();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', requiereMedidasFisicas: false });
  const [errorCategoria, setErrorCategoria] = useState<string | null>(null);

  const [modo, setModo] = useState<'crear' | 'detalle'>(puedeCrear ? 'crear' : 'detalle');
  const [seleccionado, setSeleccionado] = useState<Personal | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [editForm, setEditForm] = useState(FORM_VACIO);
  const [errorEdit, setErrorEdit] = useState<string | null>(null);
  const [guardandoEdit, setGuardandoEdit] = useState(false);
  const [exitoEdit, setExitoEdit] = useState<string | null>(null);

  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  const cargarCategorias = useCallback(async () => {
    const lista = (await useCases.listarCategorias.execute()).filter((c) => !c.esGestion);
    setCategorias(lista);
    setForm((f) => (f.categoriaId ? f : { ...f, categoriaId: lista[0]?.id ?? '' }));
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

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
        medidas: seleccionado.medidas ?? '',
        peso: seleccionado.peso?.toString() ?? '',
        estatura: seleccionado.estatura?.toString() ?? '',
        tallaRopa: seleccionado.tallaRopa ?? '',
      });
      setErrorEdit(null);
      setExitoEdit(null);
      setErrorFoto(null);
    }
  }, [seleccionado]);

  // "categorias" acá ya viene filtrada a solo NO-gestión, así que si el
  // categoriaId de una persona está en este mapa, es staff de evento.
  const categoriasPorId = new Map(categorias.map((c) => [c.id, c]));
  const staff = personal.filter((p) => categoriasPorId.has(p.categoriaId));

  const categoriaSeleccionada = categorias.find((c) => c.id === form.categoriaId);
  const requiereMedidas = categoriaSeleccionada?.requiereMedidasFisicas ?? false;
  const categoriaEditSeleccionada = categorias.find((c) => c.id === editForm.categoriaId);
  const requiereMedidasEdit = categoriaEditSeleccionada?.requiereMedidasFisicas ?? false;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crear({
        nombreCompleto: form.nombreCompleto,
        documento: form.documento,
        telefono: form.telefono,
        sexo: form.sexo,
        direccion: form.direccion,
        categoriaId: form.categoriaId,
        medidas: requiereMedidas ? form.medidas : undefined,
        peso: requiereMedidas && form.peso ? Number(form.peso) : undefined,
        estatura: requiereMedidas && form.estatura ? Number(form.estatura) : undefined,
        tallaRopa: requiereMedidas ? form.tallaRopa : undefined,
      });
      setForm({ ...FORM_VACIO, categoriaId: form.categoriaId });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el personal.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleCrearCategoria(e: FormEvent) {
    e.preventDefault();
    setErrorCategoria(null);
    try {
      const creada = await useCases.crearCategoria.execute({ ...nuevaCategoria, esGestion: false });
      setCategorias((prev) => [...prev, creada].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setForm((f) => ({ ...f, categoriaId: creada.id }));
      setNuevaCategoria({ nombre: '', requiereMedidasFisicas: false });
      setMostrarNuevaCategoria(false);
    } catch (err) {
      setErrorCategoria(err instanceof ApiError ? err.message : 'No se pudo crear la categoría.');
    }
  }

  async function handleGuardarEdit(e: FormEvent) {
    e.preventDefault();
    if (!seleccionado) return;
    setErrorEdit(null);
    setExitoEdit(null);
    setGuardandoEdit(true);
    try {
      const actualizado = await actualizar(seleccionado.id, {
        nombreCompleto: editForm.nombreCompleto,
        documento: editForm.documento,
        telefono: editForm.telefono,
        sexo: editForm.sexo,
        direccion: editForm.direccion,
        categoriaId: editForm.categoriaId,
        medidas: requiereMedidasEdit ? editForm.medidas : undefined,
        peso: requiereMedidasEdit && editForm.peso ? Number(editForm.peso) : undefined,
        estatura: requiereMedidasEdit && editForm.estatura ? Number(editForm.estatura) : undefined,
        tallaRopa: requiereMedidasEdit ? editForm.tallaRopa : undefined,
      });
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

  async function handleSubirFoto(e: ChangeEvent<HTMLInputElement>) {
    if (!seleccionado || !e.target.files?.[0]) return;
    setErrorFoto(null);
    setSubiendoFoto(true);
    try {
      const actualizado = await subirFoto(seleccionado.id, e.target.files[0]);
      setSeleccionado(actualizado);
    } catch (err) {
      setErrorFoto(err instanceof ApiError ? err.message : 'No se pudo subir la foto.');
    } finally {
      setSubiendoFoto(false);
      e.target.value = '';
    }
  }

  const mostrarPanelIzquierdo = puedeCrear || seleccionado;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {mostrarPanelIzquierdo && (
      <Card className="flex flex-col gap-3 text-left h-fit">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">{modo === 'crear' ? 'Nuevo staff' : 'Detalle del staff'}</h2>
          {modo === 'detalle' && puedeCrear && (
            <button className="text-xs text-indigo-600 font-medium" onClick={() => setModo('crear')}>
              + Nuevo staff
            </button>
          )}
        </div>

        {modo === 'crear' && puedeCrear && (
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
              <div className="flex justify-between items-center">
                <span className="font-medium">Categoría <span className="text-red-500">*</span></span>
                <button type="button" className="text-xs text-indigo-600 font-medium" onClick={() => setMostrarNuevaCategoria((v) => !v)}>
                  {mostrarNuevaCategoria ? 'Cancelar' : '+ nueva categoría'}
                </button>
              </div>
              <select
                className="px-3 py-2 rounded-lg border border-gray-300"
                value={form.categoriaId}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                required
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>

            {mostrarNuevaCategoria && (
              <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
                <Input
                  label="Nombre de la categoría"
                  value={nuevaCategoria.nombre}
                  onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })}
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={nuevaCategoria.requiereMedidasFisicas}
                    onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, requiereMedidasFisicas: e.target.checked })}
                  />
                  Requiere medidas físicas (ej: Modelo)
                </label>
                <ErrorAlert message={errorCategoria} />
                <Button type="button" onClick={handleCrearCategoria}>
                  Guardar categoría
                </Button>
              </div>
            )}

            {requiereMedidas && (
              <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
                <p className="text-xs text-gray-500">
                  La categoría "{categoriaSeleccionada?.nombre}" requiere estos datos adicionales:
                </p>
                <Input label="Medidas" value={form.medidas} onChange={(e) => setForm({ ...form, medidas: e.target.value })} placeholder='ej: 90-60-90' />
                <Input label="Peso (kg)" type="number" min={20} max={300} value={form.peso} onChange={(e) => setForm({ ...form, peso: e.target.value })} />
                <Input label="Estatura (cm)" type="number" min={50} max={250} value={form.estatura} onChange={(e) => setForm({ ...form, estatura: e.target.value })} />
                <Input label="Talla de ropa" value={form.tallaRopa} onChange={(e) => setForm({ ...form, tallaRopa: e.target.value })} />
              </div>
            )}

            <ErrorAlert message={error} />
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Crear staff'}
            </Button>
          </form>
        )}

        {modo === 'detalle' && seleccionado && (
          <div className="flex flex-col gap-3">
            <span
              className={`inline-block w-fit text-xs font-semibold px-2 py-0.5 rounded-full ${
                seleccionado.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {seleccionado.activo ? 'ACTIVO' : 'INACTIVO'}
            </span>

            {seleccionado.fotoUrl && (
              <img src={seleccionado.fotoUrl} alt={seleccionado.nombreCompleto} className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
            )}
            {esAdmin && (
              <>
                <label className="flex flex-col gap-1 text-sm text-gray-700 text-left">
                  <span className="font-medium">{seleccionado.fotoUrl ? 'Cambiar foto' : 'Subir foto'}</span>
                  <input type="file" accept="image/*" onChange={handleSubirFoto} disabled={subiendoFoto} className="text-sm" />
                </label>
                <ErrorAlert message={errorFoto} />
              </>
            )}

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
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                {requiereMedidasEdit && (
                  <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
                    <Input label="Medidas" value={editForm.medidas} onChange={(e) => setEditForm({ ...editForm, medidas: e.target.value })} />
                    <Input
                      label="Peso (kg)"
                      type="number"
                      min={20}
                      max={300}
                      value={editForm.peso}
                      onChange={(e) => setEditForm({ ...editForm, peso: e.target.value })}
                    />
                    <Input
                      label="Estatura (cm)"
                      type="number"
                      min={50}
                      max={250}
                      value={editForm.estatura}
                      onChange={(e) => setEditForm({ ...editForm, estatura: e.target.value })}
                    />
                    <Input
                      label="Talla de ropa"
                      value={editForm.tallaRopa}
                      onChange={(e) => setEditForm({ ...editForm, tallaRopa: e.target.value })}
                    />
                  </div>
                )}
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
                <p className="text-xs text-gray-400 mt-1">Solo un ADMIN puede editar o desactivar personal.</p>
              </div>
            )}
          </div>
        )}
      </Card>
      )}

      <Card className="text-left">
        <h2 className="font-semibold text-gray-900 mb-3">Staff de evento ({staff.length})</h2>
        <p className="text-xs text-gray-500 mb-2">
          Bartenders, DJs, modelos, etc. Nunca reciben acceso al sistema — trabajan bajo el mando del Productor.
        </p>
        <ul className="flex flex-col gap-2">
          {staff.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setSeleccionado(p)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition flex gap-3 items-center ${
                  seleccionado?.id === p.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                } ${!p.activo ? 'opacity-60' : ''}`}
              >
                {p.fotoUrl ? (
                  <img src={p.fotoUrl} alt={p.nombreCompleto} className="w-10 h-10 object-cover rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{p.nombreCompleto}</p>
                    {!p.activo && <span className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">INACTIVO</span>}
                  </div>
                  <p className="text-xs text-gray-500">
                    {p.documento} · {categoriasPorId.get(p.categoriaId)?.nombre ?? '—'}
                  </p>
                </div>
              </button>
            </li>
          ))}
          {staff.length === 0 && <p className="text-sm text-gray-500">Todavía no hay staff cargado.</p>}
        </ul>
      </Card>
    </div>
  );
}
