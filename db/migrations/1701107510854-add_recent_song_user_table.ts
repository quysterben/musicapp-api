import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecentSongUserTable1701107510854 implements MigrationInterface {
    name = 'AddRecentSongUserTable1701107510854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_recent_songs_song" ("userId" integer NOT NULL, "songId" integer NOT NULL, CONSTRAINT "PK_4c5c44dab8fa7795f95766876bb" PRIMARY KEY ("userId", "songId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d477d5231273d0f4f79c63e7f1" ON "user_recent_songs_song" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d7d74bfe9d803c6238e7352470" ON "user_recent_songs_song" ("songId") `);
        await queryRunner.query(`ALTER TABLE "user_recent_songs_song" ADD CONSTRAINT "FK_d477d5231273d0f4f79c63e7f18" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_recent_songs_song" ADD CONSTRAINT "FK_d7d74bfe9d803c6238e7352470f" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_recent_songs_song" DROP CONSTRAINT "FK_d7d74bfe9d803c6238e7352470f"`);
        await queryRunner.query(`ALTER TABLE "user_recent_songs_song" DROP CONSTRAINT "FK_d477d5231273d0f4f79c63e7f18"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d7d74bfe9d803c6238e7352470"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d477d5231273d0f4f79c63e7f1"`);
        await queryRunner.query(`DROP TABLE "user_recent_songs_song"`);
    }

}
