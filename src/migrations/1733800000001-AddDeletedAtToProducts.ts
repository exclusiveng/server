import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToProducts1733800000001 implements MigrationInterface {
    name = 'AddDeletedAtToProducts1733800000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deletedAt"`);
    }

}