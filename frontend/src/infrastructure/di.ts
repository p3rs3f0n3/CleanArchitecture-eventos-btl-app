import { ApiAuthRepository } from "./repositories/ApiAuthRepository";
import { ApiClienteRepository } from "./repositories/ApiClienteRepository";
import { ApiEventoRepository } from "./repositories/ApiEventoRepository";
import { ApiPersonalRepository } from "./repositories/ApiPersonalRepository";
import { ApiUsuarioRepository } from "./repositories/ApiUsuarioRepository";
import { ApiCategoriaRepository } from "./repositories/ApiCategoriaRepository";
import { ApiSedeRepository } from "./repositories/ApiSedeRepository";
import { ApiCiudadRepository } from "./repositories/ApiCiudadRepository";
import { ApiInformeRepository } from "./repositories/ApiInformeRepository";

import { LoginUseCase } from "../application/auth/LoginUseCase";
import { RegisterUseCase } from "../application/auth/RegisterUseCase";
import { CambiarPasswordUseCase } from "../application/auth/CambiarPasswordUseCase";
import { CrearClienteUseCase } from "../application/cliente/CrearClienteUseCase";
import { ListarClientesUseCase } from "../application/cliente/ListarClientesUseCase";
import { ObtenerClientePropioUseCase } from "../application/cliente/ObtenerClientePropioUseCase";
import { CrearAccesoClienteUseCase } from "../application/cliente/CrearAccesoClienteUseCase";
import { ActualizarClienteUseCase } from "../application/cliente/ActualizarClienteUseCase";
import { CambiarEstadoActivoClienteUseCase } from "../application/cliente/CambiarEstadoActivoClienteUseCase";
import { ListarUsuariosUseCase } from "../application/usuario/ListarUsuariosUseCase";
import { CambiarEstadoActivoUsuarioUseCase } from "../application/usuario/CambiarEstadoActivoUsuarioUseCase";
import { ResetearPasswordUsuarioUseCase } from "../application/usuario/ResetearPasswordUsuarioUseCase";
import { CrearEventoUseCase } from "../application/evento/CrearEventoUseCase";
import { ListarEventosPorClienteUseCase } from "../application/evento/ListarEventosPorClienteUseCase";
import { ListarEventosAsignadosUseCase } from "../application/evento/ListarEventosAsignadosUseCase";
import { CambiarEstadoEventoUseCase } from "../application/evento/CambiarEstadoEventoUseCase";
import { CrearSedeUseCase } from "../application/evento/CrearSedeUseCase";
import { ListarSedesPorEventoUseCase } from "../application/evento/ListarSedesPorEventoUseCase";
import { ListarAsignacionesPorEventoUseCase } from "../application/evento/ListarAsignacionesPorEventoUseCase";
import { SubirImagenEventoUseCase } from "../application/evento/SubirImagenEventoUseCase";
import { CrearPersonalUseCase } from "../application/personal/CrearPersonalUseCase";
import { AsignarPersonalAEventoUseCase } from "../application/personal/AsignarPersonalAEventoUseCase";
import { ListarPersonalDisponibleUseCase } from "../application/personal/ListarPersonalDisponibleUseCase";
import { CrearAccesoPersonalUseCase } from "../application/personal/CrearAccesoPersonalUseCase";
import { ListarPersonalUseCase } from "../application/personal/ListarPersonalUseCase";
import { ActualizarPersonalUseCase } from "../application/personal/ActualizarPersonalUseCase";
import { CambiarEstadoActivoPersonalUseCase } from "../application/personal/CambiarEstadoActivoPersonalUseCase";
import { SubirFotoPersonalUseCase } from "../application/personal/SubirFotoPersonalUseCase";
import { ListarCategoriasUseCase } from "../application/categoria/ListarCategoriasUseCase";
import { CrearCategoriaUseCase } from "../application/categoria/CrearCategoriaUseCase";
import { ListarCiudadesUseCase } from "../application/ciudad/ListarCiudadesUseCase";
import { CrearCiudadUseCase } from "../application/ciudad/CrearCiudadUseCase";
import { EliminarCiudadUseCase } from "../application/ciudad/EliminarCiudadUseCase";
import { ObtenerInformePorEventoUseCase } from "../application/informe/ObtenerInformePorEventoUseCase";
import { AgregarEntradaInformeUseCase } from "../application/informe/AgregarEntradaInformeUseCase";
import { EnviarInformeUseCase } from "../application/informe/EnviarInformeUseCase";
import { AgregarFotoInformeUseCase } from "../application/informe/AgregarFotoInformeUseCase";
import { EliminarFotoInformeUseCase } from "../application/informe/EliminarFotoInformeUseCase";
import { MarcarInformeAjustadoUseCase } from "../application/informe/MarcarInformeAjustadoUseCase";
import { PublicarInformeUseCase } from "../application/informe/PublicarInformeUseCase";

/** Composition root del frontend — mismo rol que infrastructure/di.ts en el backend. */

const authRepository = new ApiAuthRepository();
const clienteRepository = new ApiClienteRepository();
const eventoRepository = new ApiEventoRepository();
const personalRepository = new ApiPersonalRepository();
const usuarioRepository = new ApiUsuarioRepository();
const categoriaRepository = new ApiCategoriaRepository();
const sedeRepository = new ApiSedeRepository();
const ciudadRepository = new ApiCiudadRepository();
const informeRepository = new ApiInformeRepository();

export const useCases = {
  login: new LoginUseCase(authRepository),
  register: new RegisterUseCase(authRepository),
  cambiarPassword: new CambiarPasswordUseCase(authRepository),

  crearCliente: new CrearClienteUseCase(clienteRepository),
  listarClientes: new ListarClientesUseCase(clienteRepository),
  obtenerClientePropio: new ObtenerClientePropioUseCase(clienteRepository),
  crearAccesoCliente: new CrearAccesoClienteUseCase(clienteRepository),
  actualizarCliente: new ActualizarClienteUseCase(clienteRepository),
  cambiarEstadoActivoCliente: new CambiarEstadoActivoClienteUseCase(clienteRepository),

  listarUsuarios: new ListarUsuariosUseCase(usuarioRepository),
  cambiarEstadoActivoUsuario: new CambiarEstadoActivoUsuarioUseCase(usuarioRepository),
  resetearPasswordUsuario: new ResetearPasswordUsuarioUseCase(usuarioRepository),

  crearEvento: new CrearEventoUseCase(eventoRepository),
  listarEventosPorCliente: new ListarEventosPorClienteUseCase(eventoRepository),
  listarEventosAsignados: new ListarEventosAsignadosUseCase(eventoRepository),
  cambiarEstadoEvento: new CambiarEstadoEventoUseCase(eventoRepository),
  crearSede: new CrearSedeUseCase(sedeRepository),
  listarSedesPorEvento: new ListarSedesPorEventoUseCase(sedeRepository),
  listarAsignacionesPorEvento: new ListarAsignacionesPorEventoUseCase(personalRepository),
  subirImagenEvento: new SubirImagenEventoUseCase(eventoRepository),

  crearPersonal: new CrearPersonalUseCase(personalRepository),
  asignarPersonalAEvento: new AsignarPersonalAEventoUseCase(personalRepository),
  listarPersonalDisponible: new ListarPersonalDisponibleUseCase(personalRepository),
  crearAccesoPersonal: new CrearAccesoPersonalUseCase(personalRepository),
  listarPersonal: new ListarPersonalUseCase(personalRepository),
  actualizarPersonal: new ActualizarPersonalUseCase(personalRepository),
  cambiarEstadoActivoPersonal: new CambiarEstadoActivoPersonalUseCase(personalRepository),
  subirFotoPersonal: new SubirFotoPersonalUseCase(personalRepository),

  listarCategorias: new ListarCategoriasUseCase(categoriaRepository),
  crearCategoria: new CrearCategoriaUseCase(categoriaRepository),

  listarCiudades: new ListarCiudadesUseCase(ciudadRepository),
  crearCiudad: new CrearCiudadUseCase(ciudadRepository),
  eliminarCiudad: new EliminarCiudadUseCase(ciudadRepository),

  obtenerInforme: new ObtenerInformePorEventoUseCase(informeRepository),
  agregarEntradaInforme: new AgregarEntradaInformeUseCase(informeRepository),
  enviarInforme: new EnviarInformeUseCase(informeRepository),
  agregarFotoInforme: new AgregarFotoInformeUseCase(informeRepository),
  eliminarFotoInforme: new EliminarFotoInformeUseCase(informeRepository),
  marcarInformeAjustado: new MarcarInformeAjustadoUseCase(informeRepository),
  publicarInforme: new PublicarInformeUseCase(informeRepository),
};
