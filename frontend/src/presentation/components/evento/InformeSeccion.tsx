import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useCases } from '../../../infrastructure/di';
import { Informe, TipoEntradaInforme } from '../../../domain/entities/Informe';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ErrorAlert } from '../common/ErrorAlert';
import { ApiError } from '../../../domain/errors/ApiError';

interface Props {
  eventoId: string;
  /** Si el cliente dueño del evento está activo — igual que el resto de acciones del evento, todo se bloquea si no. */
  puedeOperar: boolean;
}

const ESTADO_LABEL: Record<Informe['estado'], string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado al Coordinador',
  AJUSTADO: 'Ajustado',
  PUBLICADO: 'Publicado',
};

const TIPO_LABEL: Record<TipoEntradaInforme, string> = {
  NOVEDAD: 'Novedad',
  OBSERVACION: 'Observación',
  PREMIO: 'Premio',
};

/**
 * UN informe por evento, compartido por los 3 roles que lo tocan:
 * Productor lo arma y lo envía, Coordinador lo ajusta y publica, Cliente lo ve
 * recién publicado. El contenido se SUMA en entradas: nunca se pisa lo anterior.
 * Componente único para no duplicar esta lógica entre EventosPanel.tsx
 * (Coordinador/Cliente) y MisEventosPanel.tsx (Productor).
 */
export function InformeSeccion({ eventoId, puedeOperar }: Props) {
  const { usuario } = useAuth();
  const esCoordinador = usuario?.rol === 'COORDINADOR';
  const esProductor = usuario?.rol === 'PRODUCTOR';
  const esCliente = usuario?.rol === 'CLIENTE';

  const [informe, setInforme] = useState<Informe | null>(null);
  const [cargando, setCargando] = useState(true);
  const [tipo, setTipo] = useState<TipoEntradaInforme>('NOVEDAD');
  const [texto, setTexto] = useState('');
  const [agregando, setAgregando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  useEffect(() => {
    setCargando(true);
    useCases.obtenerInforme
      .execute(eventoId)
      .then((data) => setInforme(data))
      .finally(() => setCargando(false));
  }, [eventoId]);

  // Todavía no existe: solo el Productor asignado puede arrancarlo.
  const puedeCrear = esProductor && puedeOperar;

  // BORRADOR: lo suman los dos. ENVIADO/AJUSTADO: solo el Coordinador. PUBLICADO: nadie.
  const puedeEditar = informe
    ? puedeOperar &&
      (informe.estado === 'BORRADOR'
        ? esProductor || esCoordinador
        : informe.estado === 'ENVIADO' || informe.estado === 'AJUSTADO'
          ? esCoordinador
          : false)
    : puedeCrear;

  const puedeEnviar = !!informe && esProductor && puedeOperar && informe.estado === 'BORRADOR';

  async function handleAgregarEntrada(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setError(null);
    setAgregando(true);
    try {
      const actualizado = await useCases.agregarEntradaInforme.execute(eventoId, { tipo, texto });
      setInforme(actualizado);
      setTexto('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo agregar la entrada.');
    } finally {
      setAgregando(false);
    }
  }

  async function handleSubirFoto(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setErrorFoto(null);
    setSubiendoFoto(true);
    try {
      const foto = await useCases.agregarFotoInforme.execute(eventoId, e.target.files[0]);
      if (informe) {
        setInforme({ ...informe, fotos: [...informe.fotos, foto] });
      } else {
        // La primera foto puede crear el informe en el backend antes que la primera entrada — recargamos para tener el id/estado reales.
        setInforme(await useCases.obtenerInforme.execute(eventoId));
      }
    } catch (err) {
      setErrorFoto(err instanceof ApiError ? err.message : 'No se pudo subir la foto.');
    } finally {
      setSubiendoFoto(false);
      e.target.value = '';
    }
  }

  async function handleEliminarFoto(fotoId: string) {
    setErrorFoto(null);
    try {
      await useCases.eliminarFotoInforme.execute(fotoId);
      setInforme((prev) => (prev ? { ...prev, fotos: prev.fotos.filter((f) => f.id !== fotoId) } : prev));
    } catch (err) {
      setErrorFoto(err instanceof ApiError ? err.message : 'No se pudo borrar la foto.');
    }
  }

  async function handleEnviar() {
    // Irreversible para el Productor: después de enviar ya no puede sumar nada.
    if (!window.confirm('Al enviarlo al Coordinador ya no vas a poder agregar contenido. ¿Confirmás?')) return;
    setErrorAccion(null);
    setProcesandoAccion(true);
    try {
      setInforme(await useCases.enviarInforme.execute(eventoId));
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : 'No se pudo enviar el informe.');
    } finally {
      setProcesandoAccion(false);
    }
  }

  async function handleMarcarAjustado() {
    setErrorAccion(null);
    setProcesandoAccion(true);
    try {
      setInforme(await useCases.marcarInformeAjustado.execute(eventoId));
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : 'No se pudo marcar como ajustado.');
    } finally {
      setProcesandoAccion(false);
    }
  }

  async function handlePublicar() {
    setErrorAccion(null);
    setProcesandoAccion(true);
    try {
      setInforme(await useCases.publicarInforme.execute(eventoId));
    } catch (err) {
      setErrorAccion(err instanceof ApiError ? err.message : 'No se pudo publicar el informe.');
    } finally {
      setProcesandoAccion(false);
    }
  }

  if (cargando) {
    return (
      <div className="pt-3 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Informe</h3>
        <p className="text-xs text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!informe && !puedeCrear) {
    return (
      <div className="pt-3 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Informe</h3>
        <p className="text-xs text-gray-500">
          {esCliente ? 'Todavía no hay informe disponible para este evento.' : 'El Productor todavía no armó el informe de este evento.'}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-3 border-t border-gray-100">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-semibold text-gray-900">Informe</h3>
        {informe && (
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
            {ESTADO_LABEL[informe.estado]}
          </span>
        )}
      </div>

      {informe && informe.entradas.length > 0 && (
        <ul className="flex flex-col gap-1 mb-2 text-sm text-gray-700">
          {informe.entradas.map((entrada) => (
            <li key={entrada.id}>
              <span className="font-medium">{TIPO_LABEL[entrada.tipo]}:</span> {entrada.texto}
              <span className="text-xs text-gray-400 ml-1">
                ({new Date(entrada.createdAt).toLocaleDateString('es-AR')})
              </span>
            </li>
          ))}
        </ul>
      )}
      {informe && informe.entradas.length === 0 && <p className="text-xs text-gray-500 mb-2">Todavía no se cargó contenido.</p>}

      {puedeEditar && (
        <form onSubmit={handleAgregarEntrada} className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-700">
            Tipo
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoEntradaInforme)}
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="NOVEDAD">Novedad</option>
              <option value="OBSERVACION">Observación</option>
              <option value="PREMIO">Premio</option>
            </select>
          </label>
          <Input label="Texto" value={texto} onChange={(e) => setTexto(e.target.value)} />
          <ErrorAlert message={error} />
          <Button type="submit" disabled={agregando || !texto.trim()}>
            {agregando ? 'Agregando...' : 'Agregar al informe'}
          </Button>
        </form>
      )}

      {informe && esProductor && informe.estado !== 'BORRADOR' && (
        <p className="text-xs text-gray-500 mt-2">Ya lo enviaste al Coordinador: no podés modificarlo.</p>
      )}

      {informe && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-2">
            {informe.fotos.map((f) => (
              <div key={f.id} className="relative">
                <img src={f.url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                {puedeEditar && (
                  <button
                    type="button"
                    onClick={() => handleEliminarFoto(f.id)}
                    className="absolute -top-1 -right-1 bg-white rounded-full text-red-600 text-xs w-4 h-4 leading-none border border-gray-200"
                    aria-label="Borrar foto"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {informe.fotos.length === 0 && <p className="text-xs text-gray-500">Sin fotos todavía.</p>}
          </div>
          {puedeEditar && (
            <label className="mt-2 inline-block text-xs text-indigo-600 font-medium cursor-pointer">
              {subiendoFoto ? 'Subiendo...' : '+ Agregar foto'}
              <input type="file" accept="image/*" className="hidden" disabled={subiendoFoto} onChange={handleSubirFoto} />
            </label>
          )}
          <ErrorAlert message={errorFoto} />
        </div>
      )}

      {informe && puedeEnviar && (
        <div className="mt-2">
          <Button type="button" onClick={handleEnviar} disabled={procesandoAccion}>
            Enviar al Coordinador
          </Button>
        </div>
      )}

      {informe && esCoordinador && puedeOperar && (informe.estado === 'ENVIADO' || informe.estado === 'AJUSTADO') && (
        <div className="mt-2 flex gap-3 items-center">
          {informe.estado === 'ENVIADO' && (
            <button type="button" onClick={handleMarcarAjustado} disabled={procesandoAccion} className="text-xs text-indigo-600 font-medium">
              Marcar como ajustado
            </button>
          )}
          {informe.estado === 'AJUSTADO' && (
            <button type="button" onClick={handlePublicar} disabled={procesandoAccion} className="text-xs text-indigo-600 font-medium">
              Publicar (lo verá el Cliente)
            </button>
          )}
        </div>
      )}
      <ErrorAlert message={errorAccion} />
    </div>
  );
}
