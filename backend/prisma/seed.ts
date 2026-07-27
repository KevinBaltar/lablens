import { PrismaClient, OrderType, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

function randomFloat(min: number, max: number, step: number = 0.25): number {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

function randomPatientName(): string {
  const firstNames = [
    "Maria", "José", "João", "Ana", "Pedro", "Lucia", "Carlos", "Fernanda",
    "Marcos", "Juliana", "Paulo", "Mariana", "Lucas", "Camila", "Gabriel",
    "Beatriz", "Rafael", "Amanda", "Thiago", "Carolina", "Diego", "Patricia",
    "Bruno", "Vanessa", "Leonardo", "Renata", "Felipe", "Claudia", "Eduardo",
    "Cristina",
  ];
  const lastNames = [
    "Silva", "Santos", "Oliveira", "Souza", "Ferreira", "Pereira", "Costa",
    "Rodrigues", "Almeida", "Nascimento", "Lima", "Araujo", "Barbosa",
    "Ribeiro", "Carvalho", "Martins", "Rocha", "Correia", "Gomes", "Mendes",
  ];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "O seed de demonstração não pode ser executado em produção",
    );
  }
  console.log("Iniciando seed...");

  // Criar usuário Master
  const masterPassword = await bcrypt.hash(
    process.env.SEED_MASTER_PASSWORD || "dev-master-change-me",
    12,
  );

  const masterUser = await prisma.user.upsert({
    where: { email: "admin@lablens.com.br" },
    update: {
      password: masterPassword,
      name: "Administrador",
      role: "MASTER",
      filialId: null,
    },
    create: {
      email: "admin@lablens.com.br",
      name: "Administrador",
      password: masterPassword,
      role: "MASTER",
    },
  });

  console.log("Usuário Master criado:", masterUser.email);

  // Criar filial de exemplo
  const filial = await prisma.filial.upsert({
    where: { cnpj: "12.345.678/0001-90" },
    update: {},
    create: {
      cnpj: "12.345.678/0001-90",
      name: "Filial Centro",
      address: "Rua Principal, 100 - Centro",
      contact: "João Silva",
      email: "centro@lablens.com.br",
      phone: "(11) 3333-4444",
    },
  });

  console.log("Filial criada:", filial.name);

  // Criar segunda filial
  const filial2 = await prisma.filial.upsert({
    where: { cnpj: "98.765.432/0001-10" },
    update: {},
    create: {
      cnpj: "98.765.432/0001-10",
      name: "Filial Zona Sul",
      address: "Av. Paulista, 500 - Bela Vista",
      contact: "Maria Oliveira",
      email: "zonasul@lablens.com.br",
      phone: "(11) 5555-6666",
    },
  });

  console.log("Filial 2 criada:", filial2.name);

  // Criar usuário da filial
  const filialPassword = await bcrypt.hash(
    process.env.SEED_FILIAL_PASSWORD || "dev-filial-change-me",
    12,
  );

  const filialUser = await prisma.user.upsert({
    where: { email: "filial@lablens.com.br" },
    update: {
      password: filialPassword,
      name: "Usuário Filial",
      role: "FILIAL",
      filialId: filial.id,
    },
    create: {
      email: "filial@lablens.com.br",
      name: "Usuário Filial",
      password: filialPassword,
      role: "FILIAL",
      filialId: filial.id,
    },
  });

  console.log("Usuário Filial criado:", filialUser.email);

  // Criar usuário da filial 2
  const filial2User = await prisma.user.upsert({
    where: { email: "filial2@lablens.com.br" },
    update: {
      password: filialPassword,
      name: "Usuário Filial 2",
      role: "FILIAL",
      filialId: filial2.id,
    },
    create: {
      email: "filial2@lablens.com.br",
      name: "Usuário Filial 2",
      password: filialPassword,
      role: "FILIAL",
      filialId: filial2.id,
    },
  });

  console.log("Usuário Filial 2 criado:", filial2User.email);

  // Criar lentes de exemplo
  const lensData = [
    {
      name: "Visão Simples Pronta Positiva",
      type: "VISAO_SIMPLES_PRONTA" as const,
      grades: [
        {
          category: "POSITIVA" as const,
          esfericoMin: 0,
          esfericoMax: 4,
          cilindricoMin: 0,
          cilindricoMax: 4,
          step: 0.25,
        },
      ],
    },
    {
      name: "Visão Simples Pronta Negativa",
      type: "VISAO_SIMPLES_PRONTA" as const,
      grades: [
        {
          category: "NEGATIVA" as const,
          esfericoMin: 0,
          esfericoMax: -4,
          cilindricoMin: 0,
          cilindricoMax: -4,
          step: 0.25,
        },
      ],
    },
    {
      name: "Progressiva Básica",
      type: "PROGRESSIVA" as const,
      addition: 2,
      grades: [
        {
          category: "POSITIVA" as const,
          esfericoMin: 0,
          esfericoMax: 6,
          cilindricoMin: 0,
          cilindricoMax: 2,
          step: 0.25,
        },
        {
          category: "NEGATIVA" as const,
          esfericoMin: 0,
          esfericoMax: -6,
          cilindricoMin: 0,
          cilindricoMax: -2,
          step: 0.25,
        },
      ],
    },
  ];

  for (const lens of lensData) {
    const created = await prisma.lens.create({
      data: {
        name: lens.name,
        type: lens.type,
        addition: lens.addition,
        grades: {
          create: lens.grades,
        },
      },
    });
    console.log("Lente criada:", created.name);
  }

  // Criar contatos de exemplo
  const contacts = [
    {
      name: "Gerência",
      department: "Gerência",
      phone: "(11) 3333-1111",
      email: "gerencia@lablens.com.br",
    },
    {
      name: "Expedição",
      department: "Expedição",
      phone: "(11) 3333-2222",
      email: "expedicao@lablens.com.br",
    },
    {
      name: "Produção",
      department: "Produção",
      phone: "(11) 3333-3333",
      email: "producao@lablens.com.br",
    },
  ];

  for (const contact of contacts) {
    await prisma.contact.create({ data: contact });
  }

  console.log("Contatos criados");

  // Criar pedidos para cada filial
  const allLenses = await prisma.lens.findMany();
  const allFilials = [filial, filial2];
  const allUsers = [filialUser, filial2User];
  const orderTypes: OrderType[] = ["GRADE", "PAR_A_PAR", "SURFACADO"];
  const orderStatuses: OrderStatus[] = ["PENDENTE", "ACEITO", "RECUSADO", "CANCELADO"];

  for (let f = 0; f < allFilials.length; f++) {
    const currentFilial = allFilials[f];
    const currentUser = allUsers[f];

    console.log(`Criando 100 pedidos para ${currentFilial.name}...`);

    for (let i = 0; i < 100; i++) {
      const lens = allLenses[Math.floor(Math.random() * allLenses.length)];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;

      const orderData: any = {
        os: `OS-${currentFilial.name.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(4, "0")}`,
        clientOS: i % 3 === 0 ? `CLI-${String(Math.floor(Math.random() * 9999) + 1).padStart(5, "0")}` : undefined,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        orderType,
        quantity,
        patientName: randomPatientName(),
        notes: i % 5 === 0 ? "Pedido com urgência" : undefined,
        pedidoPor: currentUser.name,
        lensId: lens.id,
        filialId: currentFilial.id,
        createdById: currentUser.id,
        odEsf: randomFloat(-6, 6),
        odCil: randomFloat(-4, 4),
        odEixo: Math.floor(Math.random() * 180),
        oeEsf: randomFloat(-6, 6),
        oeCil: randomFloat(-4, 4),
        oeEixo: Math.floor(Math.random() * 180),
        odDnp: randomFloat(54, 74),
        oeDnp: randomFloat(54, 74),
        odCentroOptico: randomFloat(1, 3),
        oeCentroOptico: randomFloat(1, 3),
      };

      if (orderType === "SURFACADO") {
        orderData.pa = randomFloat(120, 140);
        orderData.am = randomFloat(40, 60);
        orderData.vertical = randomFloat(15, 25);
        orderData.diametro = randomFloat(50, 80);
        orderData.frameFormat = ["Redondo", "Quadrado", "Aviador", "Cat Eye"][Math.floor(Math.random() * 4)];
      }

      if (orderType === "GRADE") {
        orderData.gradeData = {
          OD: { esferico: randomFloat(-4, 4), cilindrico: randomFloat(-2, 2) },
          OE: { esferico: randomFloat(-4, 4), cilindrico: randomFloat(-2, 2) },
        };
      }

      if (lens.type === "PROGRESSIVA") {
        orderData.odAdicao = randomFloat(1, 3);
        orderData.oeAdicao = randomFloat(1, 3);
      }

      const order = await prisma.order.create({ data: orderData });

      // Criar histórico de status
      await prisma.statusHistory.create({
        data: {
          toStatus: "PENDENTE",
          orderId: order.id,
        },
      });

      if (i % 10 === 0) {
        console.log(`  Progresso: ${i + 1}/100 pedidos criados para ${currentFilial.name}`);
      }
    }

    console.log(`  100 pedidos criados para ${currentFilial.name}`);
  }

  console.log("Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
