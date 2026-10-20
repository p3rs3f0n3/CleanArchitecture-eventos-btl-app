import { useState, useEffect, useCallback } from 'react';
import { Evento, EstadoEvento } from '../../domain/entities/Evento';
import { useCases } from '../../infrastructure/di';

export function useEventos(clienteId: string | null) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(false);

  const recargar = useCallback(async () => {
    if (!clienteId) {
      setEventos([]);
      return;
    }
    setCargando(true);
    try {
      setEventos(await useCases.listarEventosPorCliente.execute(clienteId));
    } finally {
      setCargando(false);
    }
  }, [clienteId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crear = useCallback(
    async (data: { nombre: string; descripcion: string; fechaInicio: string; fechaFin: string }) => {
      if (!clienteId) throw new Error('Seleccioná un cliente primero.');
      const nuevo = await useCases.crearEvento.execute({ ...data, clienteId });
      setEventos((prev) => [...prev, nuevo]);
      return nuevo;
    },
    [clienteId],
  );

  const cambiarEstado = useCallback(
    async (eventoId: string, nuevoEstado: EstadoEvento, evidencia: { fotoUrl?: string; observacion?: string }) => {
      const actualizado = await useCases.cambiarEstadoEvento.execute(eventoId, nuevoEstado, evidencia);
      setEventos((prev) => prev.map((e) => (e.id === eventoId ? actualizado : e)));
      return actualizado;
    },
    [],
  );

  const subirImagen = useCallback(async (eventoId: string, archivo: File) => {
    const actualizado = await useCases.subirImagenEvento.execute(eventoId, archivo);
    setEventos((prev) => prev.map((e) => (e.id === eventoId ? actualizado : e)));
    return actualizado;
  }, []);

  return { eventos, cargando, crear, cambiarEstado, subirImagen, recargar };
}
