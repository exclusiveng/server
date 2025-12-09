import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductTable1733800000000 implements MigrationInterface {
    name = 'CreateProductTable1733800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "image_url" character varying(500) NOT NULL, "rating" numeric(3,2) NOT NULL DEFAULT '0', "review_count" integer NOT NULL DEFAULT '0', "is_favorite" boolean NOT NULL DEFAULT false, "category" character varying(100), "stock_quantity" integer NOT NULL DEFAULT '0', "is_available" boolean NOT NULL DEFAULT true, "tags" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "products"`);
    }

}

