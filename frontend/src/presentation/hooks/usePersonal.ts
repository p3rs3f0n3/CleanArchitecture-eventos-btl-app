import { useState, useEffect, useCallback } from 'react';
import { Personal } from '../../domain/entities/Personal';
import { PersonalInput } from '../../domain/repositories/PersonalRepository';
import { TipoParticipacion } from '../../domain/entities/AsignacionEvento';
import { useCases } from '../../infrastructure/di';

export function usePersonal() {
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [cargando, setCargando] = useState(false);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setPersonal(await useCases.listarPersonal.execute());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crear = useCallback(async (data: PersonalInput) => {
    const nuevo = await useCases.crearPersonal.execute(data);
    setPersonal((prev) => [...prev, nuevo]);
    return nuevo;
  }, []);

  const actualizar = useCallback(async (personalId: string, data: PersonalInput) => {
    const actualizado = await useCases.actualizarPersonal.execute(personalId, data);
    setPersonal((prev) => prev.map((p) => (p.id === personalId ? actualizado : p)));
    return actualizado;
  }, []);

  const cambiarEstadoActivo = useCallback(async (personalId: string, activo: boolean) => {
    const actualizado = await useCases.cambiarEstadoActivoPersonal.execute(personalId, activo);
    setPersonal((prev) => prev.map((p) => (p.id === personalId ? actualizado : p)));
    return actualizado;
  }, []);

  const subirFoto = useCallback(async (personalId: string, archivo: File) => {
    const actualizado = await useCases.subirFotoPersonal.execute(personalId, archivo);
    setPersonal((prev) => prev.map((p) => (p.id === personalId ? actualizado : p)));
    return actualizado;
  }, []);

  const buscarDisponibles = useCallback(async (fechaInicio: string, fechaFin: string) => {
    setCargando(true);
    try {
      const disponibles = await useCases.listarPersonalDisponible.execute(fechaInicio, fechaFin);
      setPersonal(disponibles);
      return disponibles;
    } finally {
      setCargando(false);
    }
  }, []);

  const asignarAEvento = useCallback((eventoId: string, personalId: string, tipoParticipacion: TipoParticipacion) => {
    return useCases.asignarPersonalAEvento.execute(eventoId, personalId, tipoParticipacion);
  }, []);

  const crearAcceso = useCallback((personalId: string, email: string, password: string, rol: 'COORDINADOR' | 'PRODUCTOR') => {
    return useCases.crearAccesoPersonal.execute(personalId, email, password, rol);
  }, []);

  return {
    personal,
    cargando,
    crear,
    actualizar,
    cambiarEstadoActivo,
    subirFoto,
    buscarDisponibles,
    asignarAEvento,
    crearAcceso,
    recargar,
  };
}
