import { Usuario, RolSistema } from "../../domain/entities/Usuario";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { prisma } from "../database/prisma";
import type { Usuario as UsuarioPrisma } from "@prisma/client";

function toDomain(row: UsuarioPrisma): Usuario {
  return Usuario.create({
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    rol: row.rol as RolSistema,
    clienteId: row.clienteId ?? undefined,
    personalId: row.personalId ?? undefined,
    activo: row.activo,
    createdAt: row.createdAt,
  });
}

export class PrismaUsuarioRepository implements UsuarioRepository {
  async findById(id: string): Promise<Usuario | null> {
    const row = await prisma.usuario.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const row = await prisma.usuario.findUnique({ where: { email } });
    return row ? toDomain(row) : null;
  }

  async findByClienteId(clienteId: string): Promise<Usuario | null> {
    const row = await prisma.usuario.findUnique({ where: { clienteId } });
    return row ? toDomain(row) : null;
  }

  async findByPersonalId(personalId: string): Promise<Usuario | null> {
    const row = await prisma.usuario.findUnique({ where: { personalId } });
    return row ? toDomain(row) : null;
  }

  async actualizarPassword(usuarioId: string, nuevoPasswordHash: string): Promise<void> {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { passwordHash: nuevoPasswordHash },
    });
  }

  async actualizarEstadoActivo(usuarioId: string, activo: boolean): Promise<void> {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { activo },
    });
  }

  async findAll(): Promise<Usuario[]> {
    const rows = await prisma.usuario.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toDomain);
  }

  async save(usuario: Usuario): Promise<void> {
    await prisma.usuario.create({
      data: {
        id: usuario.id,
        email: usuario.email,
        passwordHash: usuario.passwordHash,
        rol: usuario.rol,
        clienteId: usuario.clienteId ?? null,
        personalId: usuario.personalId ?? null,
        activo: usuario.activo,
        createdAt: usuario.createdAt,
      },
    });
  }
}
