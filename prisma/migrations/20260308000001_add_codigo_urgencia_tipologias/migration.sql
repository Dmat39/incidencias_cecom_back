-- Add codigo field to tipo_casos
ALTER TABLE "tipo_casos" ADD COLUMN "codigo" VARCHAR(10);

-- Add codigo and urgencia fields to sub_tipo_casos
ALTER TABLE "sub_tipo_casos" ADD COLUMN "codigo" VARCHAR(10);
ALTER TABLE "sub_tipo_casos" ADD COLUMN "urgencia" VARCHAR(20);
