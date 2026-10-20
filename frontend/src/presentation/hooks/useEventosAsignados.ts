import { useState, useEffect, useCallback } from 'react';
import { Evento, EstadoEvento } from '../../domain/entities/Evento';
import { useCases } from '../../infrastructure/di';

/** "Mis eventos" del PRODUCTOR — no depende de haber elegido un cliente primero. */
export function useEventosAsignados() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(false);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setEventos(await useCases.listarEventosAsignados.execute());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const cambiarEstado = useCallback(
    async (eventoId: string, nuevoEstado: EstadoEvento, evidencia: { fotoUrl?: string; observacion?: string }) => {
      const actualizado = await useCases.cambiarEstadoEvento.execute(eventoId, nuevoEstado, evidencia);
      setEventos((prev) => prev.map((e) => (e.id === eventoId ? actualizado : e)));
      return actualizado;
    },
    [],
  );

  return { eventos, cargando, cambiarEstado, recargar };
}
