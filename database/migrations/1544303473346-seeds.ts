import { MigrationInterface, QueryRunner } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { join } from 'path';

export class Seeds1544303473346 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await runSeeders(queryRunner.connection, {
      seeds: [join(process.cwd(), 'database/seeds/seeder/*{.ts,.js}')],
    });
  }

  public async down(): Promise<any> {}
}
