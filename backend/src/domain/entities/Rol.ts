// FUERA DE ALCANCE en el MVP de entrega (decisión consciente por tiempo — ver ARQUITECTURA.md).
//
// El Rol de sistema quedó simplificado como el enum RolSistema dentro de
// Usuario.ts, en vez de ser su propia entidad/tabla con permisos granulares.
// Si se retoma: Rol sería una entidad catálogo (id, nombre), relacionada
// muchos-a-muchos con Permiso, para poder agregar roles/permisos sin
// tocar código.
export {};
