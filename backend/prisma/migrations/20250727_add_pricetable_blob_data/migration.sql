-- Alterações na tabela PriceTable para armazenar arquivos PDF no banco (BYTEA)
-- Compatível com ambientes Serverless (Vercel) onde não há escrita em disco persistente

-- 1. Adiciona a coluna `data` para armazenar o conteúdo binário do PDF
ALTER TABLE "PriceTable" ADD COLUMN IF NOT EXISTS "data" BYTEA;

-- 2. Torna a coluna `path` opcional (mantida apenas para ambientes locais/disk storage)
--    (PostgreSQL: se já tiver NOT NULL, precisamos do ALTER)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'PriceTable' AND column_name = 'path' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "PriceTable" ALTER COLUMN "path" DROP NOT NULL;
  END IF;
END $$;
