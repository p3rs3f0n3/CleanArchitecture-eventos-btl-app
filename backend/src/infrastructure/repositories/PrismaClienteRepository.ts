import { Cliente } from "../../domain/entities/Cliente";
import { ClienteRepository } from "../../domain/repositories/ClienteRepository";
import { prisma } from "../database/prisma";
import type { Cliente as ClientePrisma } from "@prisma/client";

function toDomain(row: ClientePrisma): Cliente {
  return Cliente.create({
    id: row.id,
    nombreEmpresa: row.nombreEmpresa,
    contactoNombre: row.contactoNombre,
    contactoEmail: row.contactoEmail,
    contactoTelefono: row.contactoTelefono,
    direccion: row.direccion,
    activo: row.activo,
    createdAt: row.createdAt,
  });
}

export class PrismaClienteRepository implements ClienteRepository {
  async findById(id: string): Promise<Cliente | null> {
    const row = await prisma.cliente.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findAll(): Promise<Cliente[]> {
    const rows = await prisma.cliente.findMany();
    return rows.map(toDomain);
  }

  async save(cliente: Cliente): Promise<void> {
    await prisma.cliente.create({
      data: {
        id: cliente.id,
        nombreEmpresa: cliente.nombreEmpresa,
        contactoNombre: cliente.contactoNombre,
        contactoEmail: cliente.contactoEmail,
        contactoTelefono: cliente.contactoTelefono,
        direccion: cliente.direccion,
        activo: cliente.activo,
        createdAt: cliente.createdAt,
      },
    });
  }

  async actualizar(cliente: Cliente): Promise<void> {
    await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        nombreEmpresa: cliente.nombreEmpresa,
        contactoNombre: cliente.contactoNombre,
        contactoEmail: cliente.contactoEmail,
        contactoTelefono: cliente.contactoTelefono,
        direccion: cliente.direccion,
        activo: cliente.activo,
      },
    });
  }
}
