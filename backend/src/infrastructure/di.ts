import { PrismaEventoRepository } from "./repositories/PrismaEventoRepository";
import { PrismaClienteRepository } from "./repositories/PrismaClienteRepository";
import { PrismaPersonalRepository } from "./repositories/PrismaPersonalRepository";
import { PrismaAsignacionEventoRepository } from "./repositories/PrismaAsignacionEventoRepository";
import { PrismaUsuarioRepository } from "./repositories/PrismaUsuarioRepository";
import { PrismaReporteRepository } from "./repositories/PrismaReporteRepository";
import { PrismaCategoriaRepository } from "./repositories/PrismaCategoriaRepository";
import { PrismaSedeRepository } from "./repositories/PrismaSedeRepository";
import { PrismaCiudadRepository } from "./repositories/PrismaCiudadRepository";
import { PrismaInformeRepository } from "./repositories/PrismaInformeRepository";
import { PrismaFotoInformeRepository } from "./repositories/PrismaFotoInformeRepository";
import { PrismaEntradaInformeRepository } from "./repositories/PrismaEntradaInformeRepository";
import { BcryptPasswordHasher } from "./auth/BcryptPasswordHasher";
import { JwtTokenGenerator } from "./auth/JwtTokenGenerator";

import { CrearEventoUseCase } from "../application/evento/CrearEventoUseCase";
import { CambiarEstadoEventoUseCase } from "../application/evento/CambiarEstadoEventoUseCase";
import { ListarEventosPorClienteUseCase } from "../application/evento/ListarEventosPorClienteUseCase";
import { ListarEventosAsignadosUseCase } from "../application/evento/ListarEventosAsignadosUseCase";
import { CrearSedeUseCase } from "../application/evento/CrearSedeUseCase";
import { ListarSedesPorEventoUseCase } from "../application/evento/ListarSedesPorEventoUseCase";
import { ListarAsignacionesPorEventoUseCase } from "../application/evento/ListarAsignacionesPorEventoUseCase";
import { SubirImagenEventoUseCase } from "../application/evento/SubirImagenEventoUseCase";
import { CrearClienteUseCase } from "../application/cliente/CrearClienteUseCase";
import { ListarClientesUseCase } from "../application/cliente/ListarClientesUseCase";
import { CrearPersonalUseCase } from "../application/personal/CrearPersonalUseCase";
import { ListarPersonalUseCase } from "../application/personal/ListarPersonalUseCase";
import { AsignarPersonalAEventoUseCase } from "../application/personal/AsignarPersonalAEventoUseCase";
import { ListarPersonalDisponibleUseCase } from "../application/personal/ListarPersonalDisponibleUseCase";
import { ActualizarPersonalUseCase } from "../application/personal/ActualizarPersonalUseCase";
import { CambiarEstadoActivoPersonalUseCase } from "../application/personal/CambiarEstadoActivoPersonalUseCase";
import { SubirFotoPersonalUseCase } from "../application/personal/SubirFotoPersonalUseCase";
import { CrearReporteUseCase } from "../application/reporte/CrearReporteUseCase";
import { RegisterUseCase } from "../application/auth/RegisterUseCase";
import { LoginUseCase } from "../application/auth/LoginUseCase";
import { CambiarPasswordUseCase } from "../application/auth/CambiarPasswordUseCase";
import { ResetearPasswordUseCase } from "../application/auth/ResetearPasswordUseCase";
import { ActualizarClienteUseCase } from "../application/cliente/ActualizarClienteUseCase";
import { CambiarEstadoActivoClienteUseCase } from "../application/cliente/CambiarEstadoActivoClienteUseCase";
import { ListarUsuariosUseCase } from "../application/usuario/ListarUsuariosUseCase";
import { CambiarEstadoActivoUsuarioUseCase } from "../application/usuario/CambiarEstadoActivoUsuarioUseCase";
import { CrearCategoriaUseCase } from "../application/categoria/CrearCategoriaUseCase";
import { ListarCategoriasUseCase } from "../application/categoria/ListarCategoriasUseCase";
import { CrearCiudadUseCase } from "../application/ciudad/CrearCiudadUseCase";
import { ListarCiudadesUseCase } from "../application/ciudad/ListarCiudadesUseCase";
import { EliminarCiudadUseCase } from "../application/ciudad/EliminarCiudadUseCase";
import { ObtenerInformePorEventoUseCase } from "../application/informe/ObtenerInformePorEventoUseCase";
import { AgregarEntradaInformeUseCase } from "../application/informe/AgregarEntradaInformeUseCase";
import { EnviarInformeUseCase } from "../application/informe/EnviarInformeUseCase";
import { AgregarFotoInformeUseCase } from "../application/informe/AgregarFotoInformeUseCase";
import { EliminarFotoInformeUseCase } from "../application/informe/EliminarFotoInformeUseCase";
import { MarcarInformeAjustadoUseCase } from "../application/informe/MarcarInformeAjustadoUseCase";
import { PublicarInformeUseCase } from "../application/informe/PublicarInformeUseCase";

/**
 * COMPOSITION ROOT — el ÚNICO archivo del proyecto donde se conectan las
 * implementaciones concretas (Prisma, bcrypt, JWT) con los casos de uso.
 * Los controllers importan las instancias YA armadas desde acá: nunca
 * instancian un caso de uso a mano, y nunca importan Prisma directamente.
 */

const eventoRepository = new PrismaEventoRepository();
const clienteRepository = new PrismaClienteRepository();
const personalRepository = new PrismaPersonalRepository();
const asignacionEventoRepository = new PrismaAsignacionEventoRepository();
const usuarioRepository = new PrismaUsuarioRepository();
const reporteRepository = new PrismaReporteRepository();
const categoriaRepository = new PrismaCategoriaRepository();
const sedeRepository = new PrismaSedeRepository();
const ciudadRepository = new PrismaCiudadRepository();
const informeRepository = new PrismaInformeRepository();
const fotoInformeRepository = new PrismaFotoInformeRepository();
const entradaInformeRepository = new PrismaEntradaInformeRepository();
const passwordHasher = new BcryptPasswordHasher();

// Se exporta aparte: el middleware de auth también necesita verificar tokens.
export const tokenGenerator = new JwtTokenGenerator();

export const useCases = {
  crearEvento: new CrearEventoUseCase(eventoRepository, clienteRepository),
  cambiarEstadoEvento: new CambiarEstadoEventoUseCase(eventoRepository, reporteRepository, clienteRepository),
  listarEventosPorCliente: new ListarEventosPorClienteUseCase(eventoRepository, usuarioRepository, asignacionEventoRepository),
  listarEventosAsignados: new ListarEventosAsignadosUseCase(eventoRepository, usuarioRepository, asignacionEventoRepository),
  crearSede: new CrearSedeUseCase(sedeRepository, eventoRepository, ciudadRepository, clienteRepository),
  listarSedesPorEvento: new ListarSedesPorEventoUseCase(sedeRepository),
  listarAsignacionesPorEvento: new ListarAsignacionesPorEventoUseCase(asignacionEventoRepository),
  subirImagenEvento: new SubirImagenEventoUseCase(eventoRepository, clienteRepository),

  crearCliente: new CrearClienteUseCase(clienteRepository),
  listarClientes: new ListarClientesUseCase(clienteRepository),
  actualizarCliente: new ActualizarClienteUseCase(clienteRepository),
  cambiarEstadoActivoCliente: new CambiarEstadoActivoClienteUseCase(clienteRepository, usuarioRepository),

  crearPersonal: new CrearPersonalUseCase(personalRepository, categoriaRepository),
  listarPersonal: new ListarPersonalUseCase(personalRepository),
  asignarPersonalAEvento: new AsignarPersonalAEventoUseCase(eventoRepository, personalRepository, asignacionEventoRepository, clienteRepository),
  listarPersonalDisponible: new ListarPersonalDisponibleUseCase(personalRepository, asignacionEventoRepository),
  actualizarPersonal: new ActualizarPersonalUseCase(personalRepository),
  cambiarEstadoActivoPersonal: new CambiarEstadoActivoPersonalUseCase(personalRepository, usuarioRepository),
  subirFotoPersonal: new SubirFotoPersonalUseCase(personalRepository),

  crearCategoria: new CrearCategoriaUseCase(categoriaRepository),
  listarCategorias: new ListarCategoriasUseCase(categoriaRepository),

  crearCiudad: new CrearCiudadUseCase(ciudadRepository),
  listarCiudades: new ListarCiudadesUseCase(ciudadRepository),
  eliminarCiudad: new EliminarCiudadUseCase(ciudadRepository, sedeRepository),

  crearReporte: new CrearReporteUseCase(reporteRepository, eventoRepository),

  obtenerInformePorEvento: new ObtenerInformePorEventoUseCase(informeRepository, fotoInformeRepository, entradaInformeRepository, eventoRepository, usuarioRepository, asignacionEventoRepository),
  agregarEntradaInforme: new AgregarEntradaInformeUseCase(informeRepository, fotoInformeRepository, entradaInformeRepository, eventoRepository, usuarioRepository, asignacionEventoRepository),
  enviarInforme: new EnviarInformeUseCase(informeRepository, fotoInformeRepository, entradaInformeRepository, eventoRepository, usuarioRepository, asignacionEventoRepository),
  agregarFotoInforme: new AgregarFotoInformeUseCase(informeRepository, fotoInformeRepository, eventoRepository, usuarioRepository, asignacionEventoRepository),
  eliminarFotoInforme: new EliminarFotoInformeUseCase(informeRepository, fotoInformeRepository, eventoRepository, usuarioRepository, asignacionEventoRepository),
  marcarInformeAjustado: new MarcarInformeAjustadoUseCase(informeRepository, fotoInformeRepository, entradaInformeRepository, eventoRepository, usuarioRepository, asignacionEventoRepository),
  publicarInforme: new PublicarInformeUseCase(informeRepository, fotoInformeRepository, entradaInformeRepository, eventoRepository, usuarioRepository, asignacionEventoRepository),

  register: new RegisterUseCase(usuarioRepository, passwordHasher),
  login: new LoginUseCase(usuarioRepository, passwordHasher, tokenGenerator),
  cambiarPassword: new CambiarPasswordUseCase(usuarioRepository, passwordHasher),
  resetearPassword: new ResetearPasswordUseCase(usuarioRepository, passwordHasher),

  listarUsuarios: new ListarUsuariosUseCase(usuarioRepository),
  cambiarEstadoActivoUsuario: new CambiarEstadoActivoUsuarioUseCase(usuarioRepository),
};
