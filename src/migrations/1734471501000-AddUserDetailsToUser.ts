import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserDetailsToUser1734471501000 implements MigrationInterface {
    name = 'AddUserDetailsToUser1734471501000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('users', [
            new TableColumn({
                name: 'address',
                type: 'varchar',
                isNullable: true,
            }),
            new TableColumn({
                name: 'city',
                type: 'varchar',
                isNullable: true,
            }),
            new TableColumn({
                name: 'state',
                type: 'varchar',
                isNullable: true,
            }),
            new TableColumn({
                name: 'phoneNumber',
                type: 'varchar',
                isNullable: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'phoneNumber');
        await queryRunner.dropColumn('users', 'state');
        await queryRunner.dropColumn('users', 'city');
        await queryRunner.dropColumn('users', 'address');
    }
}
