import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

/**
 * Fábrica de uploaders: guarda archivos en disco bajo `uploads/<carpeta>/`.
 * server.ts sirve toda `uploads/` como estática en `/uploads`, así el
 * fotoUrl/imagenUrl guardado en la base es directamente una URL usable por
 * el frontend.
 *
 * Nota de alcance (ver ARQUITECTURA.md): en Docker, esta carpeta necesita un
 * volumen persistente o las fotos se pierden al recrear el contenedor — es
 * el mismo criterio que cualquier storage local en un contenedor efímero.
 */
function crearUploaderDeImagenes(carpeta: string) {
  const destino = `uploads/${carpeta}`;
  // multer NO crea la carpeta destino sola — sin esto, cualquier carpeta
  // nueva (o un despliegue de cero, ej. Docker) tira un 500 crudo al subir
  // el primer archivo en vez de un error claro.
  fs.mkdirSync(destino, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destino),
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname);
      cb(null, `${randomUUID()}${extension}`);
    },
  });

  function filtroDeImagen(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("El archivo debe ser una imagen."));
      return;
    }
    cb(null, true);
  }

  return multer({ storage, fileFilter: filtroDeImagen, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
}

export const uploadFotoPersonal = crearUploaderDeImagenes("personal");
export const uploadImagenEvento = crearUploaderDeImagenes("eventos");
export const uploadFotoInforme = crearUploaderDeImagenes("informes");
