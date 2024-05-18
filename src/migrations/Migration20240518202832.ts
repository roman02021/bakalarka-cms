import { Migration } from '@mikro-orm/migrations';

export class Migration20240518202832 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "cms_folders" drop constraint "cms_folders_parent_folder_id_foreign";');

    this.addSql('alter table "cms_files" drop constraint "cms_files_parent_folder_id_foreign";');

    this.addSql('alter table "cms_folders" add constraint "cms_folders_parent_folder_id_foreign" foreign key ("parent_folder_id") references "cms_folders" ("id") on update cascade on delete set null;');

    this.addSql('alter table "cms_files" add constraint "cms_files_parent_folder_id_foreign" foreign key ("parent_folder_id") references "cms_folders" ("id") on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "cms_folders" drop constraint "cms_folders_parent_folder_id_foreign";');

    this.addSql('alter table "cms_files" drop constraint "cms_files_parent_folder_id_foreign";');

    this.addSql('alter table "cms_folders" add constraint "cms_folders_parent_folder_id_foreign" foreign key ("parent_folder_id") references "cms_folders" ("id") on delete cascade;');

    this.addSql('alter table "cms_files" add constraint "cms_files_parent_folder_id_foreign" foreign key ("parent_folder_id") references "cms_folders" ("id") on delete cascade;');
  }

}
