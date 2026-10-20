import { useState, useEffect, useCallback } from 'react';
import { Cliente } from '../../domain/entities/Cliente';
import { ClienteInput } from '../../domain/repositories/ClienteRepository';
import { useCases } from '../../infrastructure/di';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(false);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setClientes(await useCases.listarClientes.execute());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crear = useCallback(async (data: ClienteInput) => {
    const nuevo = await useCases.crearCliente.execute(data);
    setClientes((prev) => [...prev, nuevo]);
    return nuevo;
  }, []);

  const actualizar = useCallback(async (clienteId: string, data: ClienteInput) => {
    const actualizado = await useCases.actualizarCliente.execute(clienteId, data);
    setClientes((prev) => prev.map((c) => (c.id === clienteId ? actualizado : c)));
    return actualizado;
  }, []);

  const cambiarEstadoActivo = useCallback(async (clienteId: string, activo: boolean) => {
    const actualizado = await useCases.cambiarEstadoActivoCliente.execute(clienteId, activo);
    setClientes((prev) => prev.map((c) => (c.id === clienteId ? actualizado : c)));
    return actualizado;
  }, []);

  const crearAcceso = useCallback((clienteId: string, email: string, password: string) => {
    return useCases.crearAccesoCliente.execute(clienteId, email, password);
  }, []);

  return { clientes, cargando, crear, actualizar, cambiarEstadoActivo, crearAcceso, recargar };
}
