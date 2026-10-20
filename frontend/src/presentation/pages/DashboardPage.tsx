import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cliente } from '../../domain/entities/Cliente';
import { RolSistema } from '../../domain/entities/Usuario';
import { ClientesPanel } from '../components/cliente/ClientesPanel';
import { EventosPanel } from '../components/evento/EventosPanel';
import { MisEventosPanel } from '../components/evento/MisEventosPanel';
import { PersonalPanel } from '../components/personal/PersonalPanel';
import { GestionPanel } from '../components/gestion/GestionPanel';
import { AdministracionPanel } from '../components/administracion/AdministracionPanel';
import { MiCuentaPanel } from '../components/cuenta/MiCuentaPanel';

type Tab = 'clientes' | 'eventos' | 'personal' | 'coordinadores/productores' | 'administracion' | 'mi cuenta';

/**
 * Qué pestañas ve cada rol — refleja la separación de responsabilidades:
 * el COORDINADOR es el "amo y señor" del evento (crea eventos, asigna staff);
 * el ADMIN es soporte técnico de cuentas, NO gestiona eventos.
 * "personal" = staff de evento (nunca recibe acceso). "coordinadores/productores"
 * = personal de gestión (los únicos que sí pueden recibir acceso al sistema).
 */
const TABS_POR_ROL: Record<RolSistema, Tab[]> = {
  ADMIN: ['clientes', 'personal', 'coordinadores/productores', 'administracion', 'mi cuenta'],
  COORDINADOR: ['clientes', 'eventos', 'mi cuenta'],
  // El Productor no elige cliente: solo hace seguimiento de los eventos
  // donde ya quedó asignado como responsable (ver MisEventosPanel.tsx).
  PRODUCTOR: ['eventos', 'mi cuenta'],
  CLIENTE: ['clientes', 'eventos', 'mi cuenta'],
};

export function DashboardPage() {
  const { usuario, logout } = useAuth();
  const tabsDisponibles = usuario ? TABS_POR_ROL[usuario.rol] : [];
  const [tab, setTab] = useState<Tab>(tabsDisponibles[0] ?? 'mi cuenta');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  function cambiarTab(t: Tab) {
    setTab(t);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-gray-900">Gestión de Eventos BTL</h1>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>
            {usuario?.email} · <span className="font-medium">{usuario?.rol}</span>
          </span>
          <button onClick={logout} className="text-red-600 font-medium">
            Salir
          </button>
        </div>
      </header>

      <nav className="px-6 pt-4 flex gap-2">
        {tabsDisponibles.map((t) => (
          <button
            key={t}
            onClick={() => cambiarTab(t)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium capitalize ${
              tab === t ? 'bg-white border border-b-0 border-gray-200 text-indigo-600' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="p-6 bg-white border-t border-gray-200 min-h-[60vh]">
        {tab === 'clientes' && <ClientesPanel clienteSeleccionado={clienteSeleccionado} onSeleccionar={setClienteSeleccionado} />}
        {tab === 'eventos' && usuario?.rol === 'PRODUCTOR' && <MisEventosPanel />}
        {tab === 'eventos' && usuario?.rol !== 'PRODUCTOR' &&
          (clienteSeleccionado ? (
            <EventosPanel cliente={clienteSeleccionado} />
          ) : (
            <p className="text-gray-500">Seleccioná un cliente en la pestaña "Clientes" primero.</p>
          ))}
        {tab === 'personal' && <PersonalPanel />}
        {tab === 'coordinadores/productores' && <GestionPanel />}
        {tab === 'administracion' && <AdministracionPanel />}
        {tab === 'mi cuenta' && <MiCuentaPanel />}
      </main>
    </div>
  );
}
