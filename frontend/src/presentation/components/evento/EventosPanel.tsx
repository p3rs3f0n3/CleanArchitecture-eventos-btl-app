import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useEventos } from '../../hooks/useEventos';
import { usePersonal } from '../../hooks/usePersonal';
import { useAuth } from '../../context/AuthContext';
import { useCases } from '../../../infrastructure/di';
import { Cliente } from '../../../domain/entities/Cliente';
import { Evento, EstadoEvento } from '../../../domain/entities/Evento';
import { Sede } from '../../../domain/entities/Sede';
import { Personal } from '../../../domain/entities/Personal';
import { Categoria } from '../../../domain/entities/Categoria';
import { Ciudad } from '../../../domain/entities/Ciudad';
import { AsignacionEvento } from '../../../domain/entities/AsignacionEvento';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { ErrorAlert } from '../common/ErrorAlert';
import { ApiError } from '../../../domain/errors/ApiError';
import { InformeSeccion } from './InformeSeccion';

const ESTADOS: EstadoEvento[] = ['PLANIFICADO', 'INICIADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO', 'DETENIDO'];
// Estos dos exigen evidencia (foto y/o observación) — la regla vive en el
// backend (CambiarEstadoEventoUseCase), acá solo mostramos el campo cuando aplica.
const ESTADOS_CON_EVIDENCIA: EstadoEvento[] = ['INICIADO', 'FINALIZADO'];

const FORM_VACIO = { nombre: '', descripcion: '', fechaInicio: '', fechaFin: '' };

export function EventosPanel({ cliente }: { cliente: Cliente }) {
  const { usuario } = useAuth();
  const esCoordinador = usuario?.rol === 'COORDINADOR';
  // Decisión de Nelly: cambiar el estado del evento es EXCLUSIVO del Productor
  // — es quien está en el lugar y certifica cada transición con evidencia.
  const esProductor = usuario?.rol === 'PRODUCTOR';
  const { eventos, cargando, crear, cambiarEstado, subirImagen } = useEventos(cliente.id);
  const { personal, buscarDisponibles, asignarAEvento } = usePersonal();

  // Catálogo completo de Personal, independiente del filtro "disponibles" que
  // usa el form de asignación — así el resumen de staff asignado siempre
  // puede mostrar el nombre de la persona, la haya buscado o no todavía.
  const [personalCatalogo, setPersonalCatalogo] = useState<Personal[]>([]);
  useEffect(() => {
    useCases.listarPersonal.execute().then(setPersonalCatalogo);
  }, []);
  const personalPorId = new Map(personalCatalogo.map((p) => [p.id, p]));

  // Categorías de STAFF (no gestión) para el buscador de "asignar personal" —
  // mismo filtro que ya usa PersonalPanel.tsx.
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  // Id de la categoría "Productor" — para filtrar quién puede ser asignado
  // como Productor a cargo (sección aparte de "Staff asignado").
  const [categoriaProductorId, setCategoriaProductorId] = useState<string | null>(null);
  useEffect(() => {
    useCases.listarCategorias.execute().then((lista) => {
      setCategorias(lista.filter((c) => !c.esGestion));
      setCategoriaProductorId(lista.find((c) => c.nombre.trim().toUpperCase() === 'PRODUCTOR')?.id ?? null);
    });
  }, []);
  const categoriasPorId = new Map(categorias.map((c) => [c.id, c]));

  // Catálogo de ciudades para el <select> de "Puntos" — SOLO ADMIN las crea
  // (ver AdministracionPanel.tsx), el Coordinador acá solo elige.
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  useEffect(() => {
    useCases.listarCiudades.execute().then(setCiudades);
  }, []);
  const ciudadesPorId = new Map(ciudades.map((c) => [c.id, c]));

  const [subiendoImagenId, setSubiendoImagenId] = useState<string | null>(null);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);

  // Resumen por evento (sedes y staff), precargado para toda la lista para
  // que se vea de un vistazo, sin tener que entrar a cada uno.
  const [sedesPorEvento, setSedesPorEvento] = useState<Record<string, Sede[]>>({});
  const [asignacionesPorEvento, setAsignacionesPorEvento] = useState<Record<string, AsignacionEvento[]>>({});
  useEffect(() => {
    eventos.forEach((ev) => {
      if (!(ev.id in sedesPorEvento)) {
        useCases.listarSedesPorEvento.execute(ev.id).then((sedes) => setSedesPorEvento((prev) => ({ ...prev, [ev.id]: sedes })));
      }
      if (!(ev.id in asignacionesPorEvento)) {
        useCases.listarAsignacionesPorEvento
          .execute(ev.id)
          .then((asignaciones) => setAsignacionesPorEvento((prev) => ({ ...prev, [ev.id]: asignaciones })));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventos]);

  // El modal de gestión guarda solo el ID; el evento se busca en vivo en
  // "eventos" para que cualquier cambio (imagen, estado) se refleje al toque.
  const [eventoGestionandoId, setEventoGestionandoId] = useState<string | null>(null);
  const eventoModal = eventos.find((e) => e.id === eventoGestionandoId) ?? null;

  const [mostrarFormEstado, setMostrarFormEstado] = useState(false);
  const [mostrarFormAsignar, setMostrarFormAsignar] = useState(false);
  const [mostrarFormSede, setMostrarFormSede] = useState(false);

  const [sedeForm, setSedeForm] = useState({ nombre: '', direccion: '', ciudadId: '' });
  const [errorSede, setErrorSede] = useState<string | null>(null);
  const [guardandoSede, setGuardandoSede] = useState(false);

  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [nuevoEstado, setNuevoEstado] = useState<EstadoEvento>('INICIADO');
  const [evidencia, setEvidencia] = useState({ fotoUrl: '', observacion: '' });
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  const [categoriaFiltroId, setCategoriaFiltroId] = useState('');
  const [personalSeleccionados, setPersonalSeleccionados] = useState<string[]>([]);
  const [errorAsignacion, setErrorAsignacion] = useState<string | null>(null);
  const [asignando, setAsignando] = useState(false);

  const [mostrarFormAsignarProductor, setMostrarFormAsignarProductor] = useState(false);
  const [productoresSeleccionados, setProductoresSeleccionados] = useState<string[]>([]);
  const [errorAsignarProductor, setErrorAsignarProductor] = useState<string | null>(null);
  const [asignandoProductor, setAsignandoProductor] = useState(false);

  function abrirGestion(evento: Evento) {
    setEventoGestionandoId(evento.id);
    setMostrarFormEstado(false);
    setMostrarFormAsignar(false);
    setMostrarFormSede(false);
    setMostrarFormAsignarProductor(false);
    setNuevoEstado('INICIADO');
    setErrorEstado(null);
    setErrorAsignacion(null);
    setErrorSede(null);
    setErrorAsignarProductor(null);
    setCategoriaFiltroId('');
    setPersonalSeleccionados([]);
    setProductoresSeleccionados([]);
  }

  function cerrarGestion() {
    setEventoGestionandoId(null);
  }

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const nuevo = await crear(form);
      setForm(FORM_VACIO);
      // Pedido de Nelly: al crear el evento, se abre directamente su gestión.
      abrirGestion(nuevo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el evento.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleCambiarEstado(e: FormEvent) {
    e.preventDefault();
    if (!eventoModal) return;
    setErrorEstado(null);
    try {
      await cambiarEstado(eventoModal.id, nuevoEstado, {
        fotoUrl: evidencia.fotoUrl || undefined,
        observacion: evidencia.observacion || undefined,
      });
      setMostrarFormEstado(false);
      setEvidencia({ fotoUrl: '', observacion: '' });
    } catch (err) {
      // Acá es donde ves en vivo la regla de "evidencia obligatoria" del backend.
      setErrorEstado(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado.');
    }
  }

  async function handleSubirImagen(evento: Evento, e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setErrorImagen(null);
    setSubiendoImagenId(evento.id);
    try {
      await subirImagen(evento.id, e.target.files[0]);
    } catch (err) {
      setErrorImagen(err instanceof ApiError ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setSubiendoImagenId(null);
      e.target.value = '';
    }
  }

  async function handleCrearSede(e: FormEvent) {
    e.preventDefault();
    if (!eventoModal) return;
    setErrorSede(null);
    setGuardandoSede(true);
    try {
      const nueva = await useCases.crearSede.execute(eventoModal.id, sedeForm);
      setSedesPorEvento((prev) => ({ ...prev, [eventoModal.id]: [...(prev[eventoModal.id] ?? []), nueva] }));
      setSedeForm({ nombre: '', direccion: '', ciudadId: '' });
    } catch (err) {
      setErrorSede(err instanceof ApiError ? err.message : 'No se pudo agregar el punto.');
    } finally {
      setGuardandoSede(false);
    }
  }

  async function abrirFormAsignar() {
    if (!eventoModal) return;
    setMostrarFormAsignar((v) => !v);
    setErrorAsignacion(null);
    setCategoriaFiltroId('');
    setPersonalSeleccionados([]);
    await buscarDisponibles(eventoModal.fechaInicio, eventoModal.fechaFin);
  }

  function toggleSeleccionado(personalId: string) {
    setPersonalSeleccionados((prev) => (prev.includes(personalId) ? prev.filter((id) => id !== personalId) : [...prev, personalId]));
  }

  async function handleAsignar(e: FormEvent) {
    e.preventDefault();
    if (!eventoModal || personalSeleccionados.length === 0) return;
    setErrorAsignacion(null);
    setAsignando(true);
    const nuevas: AsignacionEvento[] = [];
    const errores: string[] = [];
    // Asignación de a uno por uno: cada persona puede chocar (o no) con la
    // regla de "no cruce de horario" de forma independiente — si una falla,
    // las demás igual quedan asignadas.
    for (const personalId of personalSeleccionados) {
      try {
        const nueva = await asignarAEvento(eventoModal.id, personalId, 'STAFF');
        nuevas.push(nueva);
      } catch (err) {
        const nombre = personalPorId.get(personalId)?.nombreCompleto ?? personalId;
        errores.push(`${nombre}: ${err instanceof ApiError ? err.message : 'no se pudo asignar'}`);
      }
    }
    if (nuevas.length > 0) {
      setAsignacionesPorEvento((prev) => ({ ...prev, [eventoModal.id]: [...(prev[eventoModal.id] ?? []), ...nuevas] }));
    }
    setAsignando(false);
    if (errores.length > 0) {
      setErrorAsignacion(errores.join(' · '));
      setPersonalSeleccionados((prev) => prev.filter((id) => !nuevas.some((n) => n.personalId === id)));
    } else {
      setMostrarFormAsignar(false);
      setPersonalSeleccionados([]);
    }
  }

  async function abrirFormAsignarProductor() {
    if (!eventoModal) return;
    setMostrarFormAsignarProductor((v) => !v);
    setErrorAsignarProductor(null);
    setProductoresSeleccionados([]);
    await buscarDisponibles(eventoModal.fechaInicio, eventoModal.fechaFin);
  }

  function toggleProductorSeleccionado(personalId: string) {
    setProductoresSeleccionados((prev) => (prev.includes(personalId) ? prev.filter((id) => id !== personalId) : [...prev, personalId]));
  }

  async function handleAsignarProductor(e: FormEvent) {
    e.preventDefault();
    if (!eventoModal || productoresSeleccionados.length === 0) return;
    setErrorAsignarProductor(null);
    setAsignandoProductor(true);
    const nuevas: AsignacionEvento[] = [];
    const errores: string[] = [];
    for (const personalId of productoresSeleccionados) {
      try {
        const nueva = await asignarAEvento(eventoModal.id, personalId, 'PRODUCTOR');
        nuevas.push(nueva);
      } catch (err) {
        const nombre = personalPorId.get(personalId)?.nombreCompleto ?? personalId;
        errores.push(`${nombre}: ${err instanceof ApiError ? err.message : 'no se pudo asignar'}`);
      }
    }
    if (nuevas.length > 0) {
      setAsignacionesPorEvento((prev) => ({ ...prev, [eventoModal.id]: [...(prev[eventoModal.id] ?? []), ...nuevas] }));
    }
    setAsignandoProductor(false);
    if (errores.length > 0) {
      setErrorAsignarProductor(errores.join(' · '));
      setProductoresSeleccionados((prev) => prev.filter((id) => !nuevas.some((n) => n.personalId === id)));
    } else {
      setMostrarFormAsignarProductor(false);
      setProductoresSeleccionados([]);
    }
  }

  const sedesModal = eventoModal ? sedesPorEvento[eventoModal.id] ?? [] : [];
  const asignacionesModal = eventoModal ? asignacionesPorEvento[eventoModal.id] ?? [] : [];
  // "Staff asignado" y "Productor a cargo" son secciones separadas — cada
  // asignación tiene un solo tipoParticipacion, así que se muestran una vez.
  const staffAsignado = asignacionesModal.filter((a) => a.tipoParticipacion === 'STAFF');
  const productoresAsignados = asignacionesModal.filter((a) => a.tipoParticipacion === 'PRODUCTOR');
  // Solo STAFF (no gestión) — asignar acá siempre es tipoParticipacion=STAFF.
  const personalDisponibleFiltrado = personal.filter(
    (p) => categoriasPorId.has(p.categoriaId) && (!categoriaFiltroId || p.categoriaId === categoriaFiltroId),
  );
  const productoresDisponibles = categoriaProductorId ? personal.filter((p) => p.categoriaId === categoriaProductorId) : [];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {esCoordinador && (
        <Card className="flex flex-col gap-3 text-left h-fit">
          <h2 className="font-semibold text-gray-900">Nuevo evento para {cliente.nombreEmpresa}</h2>
          {cliente.activo ? (
            <form onSubmit={handleCrear} className="flex flex-col gap-3">
              <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              <Input label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
              <Input
                label="Fecha inicio"
                type="datetime-local"
                value={form.fechaInicio}
                onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                required
              />
              <Input
                label="Fecha fin"
                type="datetime-local"
                value={form.fechaFin}
                onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                required
              />
              <ErrorAlert message={error} />
              <Button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Crear evento'}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-gray-500">
              Este cliente está inactivo. Reactivalo desde la pestaña "Clientes" (solo ADMIN) para poder crearle eventos.
            </p>
          )}
        </Card>
      )}

      <Card className="text-left">
        <h2 className="font-semibold text-gray-900 mb-3">Eventos ({eventos.length})</h2>
        {cargando && <p className="text-sm text-gray-500">Cargando...</p>}
        <ul className="flex flex-col gap-3">
          {eventos.map((ev) => (
            <li key={ev.id}>
              <button
                onClick={() => abrirGestion(ev)}
                className="w-full text-left border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition flex gap-3 items-center"
              >
                {ev.imagenUrl ? (
                  <img src={ev.imagenUrl} alt={ev.nombre} className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{ev.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(ev.fechaInicio).toLocaleString()} → {new Date(ev.fechaFin).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{ev.estado}</span>
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Staff: {asignacionesPorEvento[ev.id]?.filter((a) => a.tipoParticipacion === 'STAFF').length ?? '…'}
                    </span>
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Puntos: {sedesPorEvento[ev.id]?.length ?? '…'}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
          {eventos.length === 0 && !cargando && <p className="text-sm text-gray-500">Este cliente no tiene eventos todavía.</p>}
        </ul>
      </Card>

      {eventoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={cerrarGestion}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">{eventoModal.nombre}</h2>
                <p className="text-xs text-gray-500">
                  {new Date(eventoModal.fechaInicio).toLocaleString()} → {new Date(eventoModal.fechaFin).toLocaleString()}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 text-2xl leading-none" onClick={cerrarGestion} aria-label="Cerrar">
                ×
              </button>
            </div>

            {!cliente.activo && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Este cliente está inactivo — no se pueden hacer cambios en sus eventos (agregar staff, puntos, cambiar estado ni
                imagen). Reactivalo desde la pestaña "Clientes" (solo ADMIN).
              </p>
            )}

            <div className="flex items-center gap-3">
              {eventoModal.imagenUrl ? (
                <img
                  src={eventoModal.imagenUrl}
                  alt={eventoModal.nombre}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0" />
              )}
              <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {eventoModal.estado}
              </span>
              {esCoordinador && cliente.activo && (
                <label className="text-xs text-indigo-600 font-medium cursor-pointer">
                  {subiendoImagenId === eventoModal.id ? 'Subiendo...' : eventoModal.imagenUrl ? 'Cambiar imagen' : 'Subir imagen'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={subiendoImagenId === eventoModal.id}
                    onChange={(e) => handleSubirImagen(eventoModal, e)}
                  />
                </label>
              )}
            </div>
            <ErrorAlert message={errorImagen} />

            {esProductor && cliente.activo && (
              <div className="pt-3 border-t border-gray-100">
                <button className="text-xs text-indigo-600 font-medium" onClick={() => setMostrarFormEstado((v) => !v)}>
                  {mostrarFormEstado ? 'Cerrar' : 'Cambiar estado'}
                </button>
                {mostrarFormEstado && (
                  <form onSubmit={handleCambiarEstado} className="mt-2 flex flex-col gap-2">
                    <label className="text-sm text-gray-700 flex flex-col gap-1">
                      <span className="font-medium">Nuevo estado <span className="text-red-500">*</span></span>
                      <select
                        className="px-3 py-2 rounded-lg border border-gray-300"
                        value={nuevoEstado}
                        onChange={(e) => setNuevoEstado(e.target.value as EstadoEvento)}
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </label>
                    {ESTADOS_CON_EVIDENCIA.includes(nuevoEstado) && (
                      <>
                        <Input
                          label="Foto (URL)"
                          value={evidencia.fotoUrl}
                          onChange={(e) => setEvidencia({ ...evidencia, fotoUrl: e.target.value })}
                          placeholder="https://..."
                        />
                        <Input
                          label="Observación"
                          value={evidencia.observacion}
                          onChange={(e) => setEvidencia({ ...evidencia, observacion: e.target.value })}
                        />
                        <p className="text-xs text-gray-500">Este estado exige foto y/o observación como evidencia.</p>
                      </>
                    )}
                    <ErrorAlert message={errorEstado} />
                    <Button type="submit">Confirmar</Button>
                  </form>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-semibold text-gray-900">Productor a cargo ({productoresAsignados.length})</h3>
                {esCoordinador && cliente.activo && (
                  <button className="text-xs text-indigo-600 font-medium" onClick={abrirFormAsignarProductor}>
                    {mostrarFormAsignarProductor ? 'Cerrar' : '+ Asignar'}
                  </button>
                )}
              </div>
              <ul className="flex flex-col gap-1">
                {productoresAsignados.map((a) => (
                  <li key={a.id} className="text-sm text-gray-700 px-2 py-1 rounded bg-gray-50">
                    {personalPorId.get(a.personalId)?.nombreCompleto ?? 'Persona no encontrada'}
                  </li>
                ))}
                {productoresAsignados.length === 0 && <p className="text-xs text-gray-500">Todavía no hay un Productor asignado.</p>}
              </ul>

              {esCoordinador && cliente.activo && mostrarFormAsignarProductor && (
                <form onSubmit={handleAsignarProductor} className="mt-2 flex flex-col gap-2 pt-2 border-t border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">
                      Productores disponibles en ese horario <span className="text-red-500">*</span>
                    </span>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                      {productoresDisponibles.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={productoresSeleccionados.includes(p.id)}
                            onChange={() => toggleProductorSeleccionado(p.id)}
                          />
                          <span>{p.nombreCompleto}</span>
                        </label>
                      ))}
                      {productoresDisponibles.length === 0 && (
                        <p className="text-xs text-gray-500 px-3 py-2">Nadie disponible para ese horario.</p>
                      )}
                    </div>
                  </div>
                  <ErrorAlert message={errorAsignarProductor} />
                  <Button type="submit" disabled={asignandoProductor || productoresSeleccionados.length === 0}>
                    {asignandoProductor ? 'Asignando...' : 'Asignar'}
                  </Button>
                </form>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-semibold text-gray-900">Staff asignado ({staffAsignado.length})</h3>
                {esCoordinador && cliente.activo && (
                  <button className="text-xs text-indigo-600 font-medium" onClick={abrirFormAsignar}>
                    {mostrarFormAsignar ? 'Cerrar' : '+ Asignar'}
                  </button>
                )}
              </div>
              <ul className="flex flex-col gap-1">
                {staffAsignado.map((a) => (
                  <li key={a.id} className="text-sm text-gray-700 px-2 py-1 rounded bg-gray-50 flex justify-between items-center">
                    <span>{personalPorId.get(a.personalId)?.nombreCompleto ?? 'Persona no encontrada'}</span>
                    <span className="text-xs text-gray-500">
                      {categoriasPorId.get(personalPorId.get(a.personalId)?.categoriaId ?? '')?.nombre ?? '—'}
                    </span>
                  </li>
                ))}
                {staffAsignado.length === 0 && <p className="text-xs text-gray-500">Todavía no se asignó personal.</p>}
              </ul>

              {esCoordinador && cliente.activo && mostrarFormAsignar && (
                <form onSubmit={handleAsignar} className="mt-2 flex flex-col gap-2 pt-2 border-t border-gray-100">
                  <label className="text-sm text-gray-700 flex flex-col gap-1">
                    <span className="font-medium">Buscar por categoría</span>
                    <select
                      className="px-3 py-2 rounded-lg border border-gray-300"
                      value={categoriaFiltroId}
                      onChange={(e) => setCategoriaFiltroId(e.target.value)}
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">
                      Disponibles en ese horario <span className="text-red-500">*</span>
                    </span>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                      {personalDisponibleFiltrado.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                          <input type="checkbox" checked={personalSeleccionados.includes(p.id)} onChange={() => toggleSeleccionado(p.id)} />
                          <span>{p.nombreCompleto}</span>
                          <span className="text-xs text-gray-400 ml-auto">{categoriasPorId.get(p.categoriaId)?.nombre ?? '—'}</span>
                        </label>
                      ))}
                      {personalDisponibleFiltrado.length === 0 && (
                        <p className="text-xs text-gray-500 px-3 py-2">Nadie disponible en esta categoría para ese horario.</p>
                      )}
                    </div>
                    {personalSeleccionados.length > 0 && (
                      <p className="text-xs text-gray-500">{personalSeleccionados.length} seleccionado(s).</p>
                    )}
                  </div>

                  <ErrorAlert message={errorAsignacion} />
                  <Button type="submit" disabled={asignando || personalSeleccionados.length === 0}>
                    {asignando ? 'Asignando...' : 'Asignar'}
                  </Button>
                </form>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-semibold text-gray-900">Puntos ({sedesModal.length})</h3>
                {esCoordinador && cliente.activo && (
                  <button className="text-xs text-indigo-600 font-medium" onClick={() => setMostrarFormSede((v) => !v)}>
                    {mostrarFormSede ? 'Cerrar' : '+ Agregar punto'}
                  </button>
                )}
              </div>
              <ul className="flex flex-col gap-1">
                {sedesModal.map((s) => (
                  <li key={s.id} className="text-sm text-gray-700 px-2 py-1 rounded bg-gray-50">
                    <span className="font-medium">{s.nombre}</span> — {s.direccion}, {ciudadesPorId.get(s.ciudadId)?.nombre ?? '—'}
                  </li>
                ))}
                {sedesModal.length === 0 && <p className="text-xs text-gray-500">Este evento todavía no tiene puntos cargados.</p>}
              </ul>

              {esCoordinador && cliente.activo && mostrarFormSede && (
                <form onSubmit={handleCrearSede} className="mt-2 flex flex-col gap-2 pt-2 border-t border-gray-100">
                  <Input
                    label="Nombre del punto"
                    value={sedeForm.nombre}
                    onChange={(e) => setSedeForm({ ...sedeForm, nombre: e.target.value })}
                    placeholder="ej: Centro Comercial Chipichape - Entrada Norte"
                    required
                  />
                  <Input
                    label="Dirección"
                    value={sedeForm.direccion}
                    onChange={(e) => setSedeForm({ ...sedeForm, direccion: e.target.value })}
                    required
                  />
                  <label className="text-sm text-gray-700 flex flex-col gap-1">
                    <span className="font-medium">Ciudad <span className="text-red-500">*</span></span>
                    <select
                      className="px-3 py-2 rounded-lg border border-gray-300"
                      value={sedeForm.ciudadId}
                      onChange={(e) => setSedeForm({ ...sedeForm, ciudadId: e.target.value })}
                      required
                    >
                      <option value="">Seleccioná una ciudad</option>
                      {ciudades.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                    {ciudades.length === 0 && (
                      <span className="text-xs text-gray-500">
                        Todavía no hay ciudades cargadas — pedile a un ADMIN que cargue al menos una desde "Administración".
                      </span>
                    )}
                  </label>
                  <ErrorAlert message={errorSede} />
                  <Button type="submit" disabled={guardandoSede}>
                    {guardandoSede ? 'Guardando...' : 'Agregar punto'}
                  </Button>
                </form>
              )}
            </div>

            <InformeSeccion eventoId={eventoModal.id} puedeOperar={cliente.activo} />
          </div>
        </div>
      )}
    </div>
  );
}
