import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUsuario(datos: {
  nombre: string;
  email: string;
  rol: "admin" | "ejecutiva";
  pais?: "PE" | "EC";
}) {
  const passwordPlano = process.env.SEED_DEFAULT_PASSWORD ?? "CambiarEsta123!";
  const passwordHash = await bcrypt.hash(passwordPlano, 10);

  const usuario = await prisma.user.upsert({
    where: { email: datos.email },
    update: {},
    create: {
      nombre: datos.nombre,
      email: datos.email,
      passwordHash,
      rol: datos.rol,
      pais: datos.pais,
    },
  });

  console.log(`Usuario listo: ${usuario.email} (${usuario.rol})`);
}

async function main() {
  await upsertUsuario({
    nombre: "Denis",
    email: "gep.soporteit@gmail.com",
    rol: "admin",
  });

  await upsertUsuario({
    nombre: "Talia",
    email: "talia@ebim.com",
    rol: "ejecutiva",
    pais: "PE",
  });

  await upsertUsuario({
    nombre: "Nicolás",
    email: "nicolas@ebim.com",
    rol: "ejecutiva",
    pais: "PE",
  });

  await upsertUsuario({
    nombre: "Marisela",
    email: "marisela@ebim.com",
    rol: "ejecutiva",
    pais: "EC",
  });

  console.log("\nContraseña inicial para todos:", process.env.SEED_DEFAULT_PASSWORD ?? "CambiarEsta123!");
  console.log("Cámbiala luego desde el panel de usuarios.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
