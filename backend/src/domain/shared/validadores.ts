import { InvalidPropValueError } from "../exceptions/DomainError";

/**
 * Validadores reutilizables para invariantes de dominio. Viven acá (no en
 * cada entidad por separado) para no repetir la misma regex/lógica en
 * Cliente, Personal, etc. — el día que cambie el criterio de "qué es un
 * teléfono válido", se cambia en un solo lugar.
 */

export function validarSoloDigitos(valor: string, nombreCampo: string, minLength = 7, maxLength = 15): void {
  const regex = new RegExp(`^\\d{${minLength},${maxLength}}$`);
  if (!regex.test(valor.trim())) {
    throw new InvalidPropValueError(
      `El campo "${nombreCampo}" debe contener solo números (entre ${minLength} y ${maxLength} dígitos).`,
    );
  }
}

export function validarSoloLetras(valor: string, nombreCampo: string): void {
  const regex = /^[a-zA-ZÀ-ÿ\s'.-]+$/;
  if (!regex.test(valor.trim())) {
    throw new InvalidPropValueError(`El campo "${nombreCampo}" solo puede contener letras y espacios.`);
  }
}

export function validarEmail(valor: string, nombreCampo: string): void {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(valor)) {
    throw new InvalidPropValueError(`El campo "${nombreCampo}" ("${valor}") no tiene un formato de correo válido.`);
  }
}

export function validarNumeroPositivo(valor: number, nombreCampo: string, min?: number, max?: number): void {
  if (typeof valor !== "number" || Number.isNaN(valor) || valor <= 0) {
    throw new InvalidPropValueError(`El campo "${nombreCampo}" debe ser un número positivo.`);
  }
  if (min !== undefined && valor < min) {
    throw new InvalidPropValueError(`El campo "${nombreCampo}" no puede ser menor a ${min}.`);
  }
  if (max !== undefined && valor > max) {
    throw new InvalidPropValueError(`El campo "${nombreCampo}" no puede ser mayor a ${max}.`);
  }
}

export function validarNoVacio(valor: string, nombreCampo: string): void {
  if (valor.trim().length === 0) {
    throw new InvalidPropValueError(`El campo "${nombreCampo}" no puede estar vacío.`);
  }
}
