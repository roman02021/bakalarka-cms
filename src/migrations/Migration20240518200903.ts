import { Migration } from '@mikro-orm/migrations';

export class Migration20240518200903 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "cms_folders" drop constraint "cms_folders_parent_folder_id_foreign";');

    this.addSql('alter table "cms_folders" add constraint "cms_folders_parent_folder_id_foreign" foreign key ("parent_folder_id") references "cms_folders" ("id") on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "cms_folders" drop constraint "cms_folders_parent_folder_id_foreign";');

    this.addSql('alter table "cms_folders" add constraint "cms_folders_parent_folder_id_foreign" foreign key ("parent_folder_id") references "cms_folders" ("id") on delete cascade;');
  }

}
