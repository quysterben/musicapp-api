import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabaseStructure1700912010167 implements MigrationInterface {
    name = 'InitDatabaseStructure1700912010167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "password" character varying NOT NULL, "email" character varying NOT NULL, "refresh_token" character varying, "avatar" character varying, "role" character varying NOT NULL DEFAULT 'user', "account_type" character varying NOT NULL DEFAULT 'local', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "song" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "artwork" character varying NOT NULL, "artist" character varying NOT NULL, "duration" integer, "url" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_baaa977f861cce6ff954ccee285" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "playlist" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "thumbnail" character varying, "is_public" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_538c2893e2024fabc7ae65ad142" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_favorite_songs_song" ("userId" integer NOT NULL, "songId" integer NOT NULL, CONSTRAINT "PK_ce08551af9f51db74d43b3a4132" PRIMARY KEY ("userId", "songId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c717cf594798f1e77d891e549b" ON "user_favorite_songs_song" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e782a10b07ed354029b0738ea5" ON "user_favorite_songs_song" ("songId") `);
        await queryRunner.query(`CREATE TABLE "playlist_songs_song" ("playlistId" integer NOT NULL, "songId" integer NOT NULL, CONSTRAINT "PK_9a24b586572c2896bfb75e57fb4" PRIMARY KEY ("playlistId", "songId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3e66846398a681262e56574fc9" ON "playlist_songs_song" ("playlistId") `);
        await queryRunner.query(`CREATE INDEX "IDX_efc8204ff6cdd9f17e83f8d001" ON "playlist_songs_song" ("songId") `);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "song" ADD CONSTRAINT "FK_1cf2820b0e3f5962ee67ec19159" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playlist" ADD CONSTRAINT "FK_92ca9b9b5394093adb6e5f55c4b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_favorite_songs_song" ADD CONSTRAINT "FK_c717cf594798f1e77d891e549b5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_favorite_songs_song" ADD CONSTRAINT "FK_e782a10b07ed354029b0738ea5c" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playlist_songs_song" ADD CONSTRAINT "FK_3e66846398a681262e56574fc99" FOREIGN KEY ("playlistId") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "playlist_songs_song" ADD CONSTRAINT "FK_efc8204ff6cdd9f17e83f8d001e" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playlist_songs_song" DROP CONSTRAINT "FK_efc8204ff6cdd9f17e83f8d001e"`);
        await queryRunner.query(`ALTER TABLE "playlist_songs_song" DROP CONSTRAINT "FK_3e66846398a681262e56574fc99"`);
        await queryRunner.query(`ALTER TABLE "user_favorite_songs_song" DROP CONSTRAINT "FK_e782a10b07ed354029b0738ea5c"`);
        await queryRunner.query(`ALTER TABLE "user_favorite_songs_song" DROP CONSTRAINT "FK_c717cf594798f1e77d891e549b5"`);
        await queryRunner.query(`ALTER TABLE "playlist" DROP CONSTRAINT "FK_92ca9b9b5394093adb6e5f55c4b"`);
        await queryRunner.query(`ALTER TABLE "song" DROP CONSTRAINT "FK_1cf2820b0e3f5962ee67ec19159"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_efc8204ff6cdd9f17e83f8d001"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3e66846398a681262e56574fc9"`);
        await queryRunner.query(`DROP TABLE "playlist_songs_song"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e782a10b07ed354029b0738ea5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c717cf594798f1e77d891e549b"`);
        await queryRunner.query(`DROP TABLE "user_favorite_songs_song"`);
        await queryRunner.query(`DROP TABLE "playlist"`);
        await queryRunner.query(`DROP TABLE "song"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "notification"`);
    }

}
