-- CreateEnum
CREATE TYPE "WorkflowPhase" AS ENUM ('TODO', 'DOING', 'DONE');

-- AlterTable
ALTER TABLE "workflow_states" ADD COLUMN "phase" "WorkflowPhase" NOT NULL DEFAULT 'TODO';

-- Terminal columns become the done bucket, non-entry columns move to doing
UPDATE "workflow_states" SET "phase" = 'DONE' WHERE "isTerminal" = true;
UPDATE "workflow_states" SET "phase" = 'DOING' WHERE "isTerminal" = false AND "isDefault" = false;

-- AlterTable
ALTER TABLE "workflow_states" DROP COLUMN "isTerminal";
