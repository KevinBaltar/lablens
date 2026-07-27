-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MASTER', 'FILIAL');

-- CreateEnum
CREATE TYPE "LensType" AS ENUM ('VISAO_SIMPLES_PRONTA', 'VISAO_SIMPLES_SURFACADA', 'PROGRESSIVA', 'BIFOCAL');

-- CreateEnum
CREATE TYPE "GradeCategory" AS ENUM ('POSITIVA', 'NEGATIVA');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDENTE', 'ACEITO', 'RECUSADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('GRADE', 'PAR_A_PAR', 'SURFACADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FILIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "filialId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filial" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lens" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LensType" NOT NULL,
    "addition" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LensGrade" (
    "id" TEXT NOT NULL,
    "category" "GradeCategory" NOT NULL,
    "esfericoMin" DOUBLE PRECISION NOT NULL,
    "esfericoMax" DOUBLE PRECISION NOT NULL,
    "cilindricoMin" DOUBLE PRECISION NOT NULL,
    "cilindricoMax" DOUBLE PRECISION NOT NULL,
    "step" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lensId" TEXT NOT NULL,

    CONSTRAINT "LensGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "os" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDENTE',
    "orderType" "OrderType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "patientName" TEXT,
    "notes" TEXT,
    "pedidoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "odEsf" DOUBLE PRECISION,
    "odCil" DOUBLE PRECISION,
    "odEixo" DOUBLE PRECISION,
    "odAdicao" DOUBLE PRECISION,
    "odCentroOptico" DOUBLE PRECISION,
    "odDnp" DOUBLE PRECISION,
    "oeEsf" DOUBLE PRECISION,
    "oeCil" DOUBLE PRECISION,
    "oeEixo" DOUBLE PRECISION,
    "oeAdicao" DOUBLE PRECISION,
    "oeCentroOptico" DOUBLE PRECISION,
    "oeDnp" DOUBLE PRECISION,
    "pa" DOUBLE PRECISION,
    "am" DOUBLE PRECISION,
    "vertical" DOUBLE PRECISION,
    "diametro" DOUBLE PRECISION,
    "frameFormat" TEXT,
    "selectedGrade" TEXT,
    "lensId" TEXT NOT NULL,
    "filialId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceTable" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Filial_cnpj_key" ON "Filial"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_orderId_key" ON "Chat"("orderId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LensGrade" ADD CONSTRAINT "LensGrade_lensId_fkey" FOREIGN KEY ("lensId") REFERENCES "Lens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_lensId_fkey" FOREIGN KEY ("lensId") REFERENCES "Lens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
