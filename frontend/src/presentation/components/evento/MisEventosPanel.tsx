import { useState, useEffect, type FormEvent } from 'react';
import { useEventosAsignados } from '../../hooks/useEventosAsignados';
import { useCases } from '../../../infrastructure/di';
import { Evento, EstadoEvento } from '../../../domain/entities/Evento';
import { Cliente } from '../../../domain/entities/Cliente';
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
const ESTADOS_CON_EVIDENCIA: EstadoEvento[] = ['INICIADO', 'FINALIZADO'];

/**
 * "Mis eventos" del PRODUCTOR: seguimiento puro, no gestión. Ya no elige un
 * cliente primero (puede tener eventos asignados de clientes distintos) y no
 * tiene ninguna acción de armado de evento — la única acción es "Cambiar
 * estado". Ver EventosPanel.tsx para el equivalente del Coordinador.
 */
export function MisEventosPanel() {
  const { eventos, cargando, cambiarEstado } = useEventosAsignados();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  useEffect(() => {
    useCases.listarClientes.execute().then(setClientes);
  }, []);
  const clientesPorId = new Map(clientes.map((c) => [c.id, c]));

  const [personalCatalogo, setPersonalCatalogo] = useState<Personal[]>([]);
  useEffect(() => {
    useCases.listarPersonal.execute().then(setPersonalCatalogo);
  }, []);
  const personalPorId = new Map(personalCatalogo.map((p) => [p.id, p]));

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  useEffect(() => {
    useCases.listarCategorias.execute().then((lista) => setCategorias(lista.filter((c) => !c.esGestion)));
  }, []);
  const categoriasPorId = new Map(categorias.map((c) => [c.id, c]));

  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  useEffect(() => {
    useCases.listarCiudades.execute().then(setCiudades);
  }, []);
  const ciudadesPorId = new Map(ciudades.map((c) => [c.id, c]));

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

  const [eventoGestionandoId, setEventoGestionandoId] = useState<string | null>(null);
  const eventoModal = eventos.find((e) => e.id === eventoGestionandoId) ?? null;
  const clienteModal = eventoModal ? clientesPorId.get(eventoModal.clienteId) : undefined;

  const [mostrarFormEstado, setMostrarFormEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoEvento>('INICIADO');
  const [evidencia, setEvidencia] = useState({ fotoUrl: '', observacion: '' });
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  function abrirGestion(evento: Evento) {
    setEventoGestionandoId(evento.id);
    setMostrarFormEstado(false);
    setNuevoEstado('INICIADO');
    setErrorEstado(null);
  }

  function cerrarGestion() {
    setEventoGestionandoId(null);
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
      setErrorEstado(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado.');
    }
  }

  const sedesModal = eventoModal ? sedesPorEvento[eventoModal.id] ?? [] : [];
  const asignacionesModal = eventoModal ? asignacionesPorEvento[eventoModal.id] ?? [] : [];
  const staffModal = asignacionesModal.filter((a) => a.tipoParticipacion === 'STAFF');

  return (
    <div>
      <Card className="text-left">
        <h2 className="font-semibold text-gray-900 mb-3">Mis eventos ({eventos.length})</h2>
        <p className="text-xs text-gray-500 mb-3">Eventos donde estás asignado como Productor responsable, de cualquier cliente.</p>
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
                  <p className="text-xs text-gray-500">{clientesPorId.get(ev.clienteId)?.nombreEmpresa ?? '—'}</p>
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
          {eventos.length === 0 && !cargando && <p className="text-sm text-gray-500">Todavía no te asignaron como Productor de ningún evento.</p>}
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
                <p className="text-xs text-gray-500">{clienteModal?.nombreEmpresa ?? '—'}</p>
                <p className="text-xs text-gray-500">
                  {new Date(eventoModal.fechaInicio).toLocaleString()} → {new Date(eventoModal.fechaFin).toLocaleString()}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 text-2xl leading-none" onClick={cerrarGestion} aria-label="Cerrar">
                ×
              </button>
            </div>

            {clienteModal && !clienteModal.activo && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Este cliente está inactivo — no se puede cambiar el estado de sus eventos.
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
            </div>

            {(clienteModal?.activo ?? true) && (
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
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Staff asignado ({staffModal.length})</h3>
              <ul className="flex flex-col gap-1">
                {staffModal.map((a) => (
                  <li key={a.id} className="text-sm text-gray-700 px-2 py-1 rounded bg-gray-50 flex justify-between items-center">
                    <span>{personalPorId.get(a.personalId)?.nombreCompleto ?? 'Persona no encontrada'}</span>
                    <span className="text-xs text-gray-500">
                      {categoriasPorId.get(personalPorId.get(a.personalId)?.categoriaId ?? '')?.nombre ?? '—'}
                    </span>
                  </li>
                ))}
                {staffModal.length === 0 && <p className="text-xs text-gray-500">Todavía no se asignó personal.</p>}
              </ul>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Puntos ({sedesModal.length})</h3>
              <ul className="flex flex-col gap-1">
                {sedesModal.map((s) => (
                  <li key={s.id} className="text-sm text-gray-700 px-2 py-1 rounded bg-gray-50">
                    <span className="font-medium">{s.nombre}</span> — {s.direccion}, {ciudadesPorId.get(s.ciudadId)?.nombre ?? '—'}
                  </li>
                ))}
                {sedesModal.length === 0 && <p className="text-xs text-gray-500">Este evento todavía no tiene puntos cargados.</p>}
              </ul>
            </div>

            <InformeSeccion eventoId={eventoModal.id} puedeOperar={clienteModal?.activo ?? true} />
          </div>
        </div>
      )}
    </div>
  );
}
