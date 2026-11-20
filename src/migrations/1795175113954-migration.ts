import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1795175113954 implements MigrationInterface {
    name = 'Migration1795175113954'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" ALTER COLUMN "joiningDate" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" ALTER COLUMN "joiningDate" SET DEFAULT CURRENT_TIMESTAMP`);
    }

}
