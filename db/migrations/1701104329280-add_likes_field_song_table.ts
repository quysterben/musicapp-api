import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLikesFieldSongTable1701104329280 implements MigrationInterface {
    name = 'AddLikesFieldSongTable1701104329280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "song" ADD "likes" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "song" DROP COLUMN "likes"`);
    }

}
