import { Migration } from '@mikro-orm/migrations';

export class Migration20240517184857 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "cms_collections" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by" int not null, "display_name" varchar(255) not null, "name" varchar(255) not null);');
    this.addSql('alter table "cms_collections" add constraint "cms_collections_name_unique" unique ("name");');

    this.addSql('create table "cms_attributes" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "display_name" varchar(255) not null, "name" varchar(255) not null, "type" varchar(255) not null, "collection_id" int null, "relation_type" varchar(255) null, "referenced_column" varchar(255) null, "referenced_table" varchar(255) null);');
    this.addSql('alter table "cms_attributes" add constraint "cms_attributes_collection_id_name_unique" unique ("collection_id", "name");');

    this.addSql('create table "cms_users" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null);');
    this.addSql('alter table "cms_users" add constraint "cms_users_email_unique" unique ("email");');

    this.addSql('create table "cms_folders" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "created_by_id" int not null, "relative_path" varchar(255) not null, "absolute_path" varchar(255) not null, "parent_folder_id" int null);');

    this.addSql('create table "cms_files" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "file_size" int not null, "relative_path" varchar(255) not null, "file_path" varchar(255) not null, "name" varchar(255) not null, "absolute_path" varchar(255) not null, "extension" varchar(255) not null, "created_by_id" int not null, "parent_folder_id" int null);');

    this.addSql('alter table "cms_attributes" add constraint "cms_attributes_collection_id_foreign" foreign key ("collection_id") references "cms_collections" ("id") on delete cascade;');

    this.addSql('alter table "cms_folders" add constraint "cms_folders_created_by_id_foreign" foreign key ("created_by_id") references "cms_users" ("id") on update cascade;');
    this.addSql('alter table "cms_folders" add constraint "cms_folders_parent_folder_id_foreign" foreign key ("parent_folder_id") references "cms_folders" ("id") on update cascade on delete set null;');

    this.addSql('alter table "cms_files" add constraint "cms_files_created_by_id_foreign" foreign key ("created_by_id") references "cms_users" ("id") on update cascade;');
    this.addSql('alter table "cms_files" add constraint "cms_files_parent_folder_id_foreign" foreign key ("parent_folder_id") references "cms_folders" ("id") on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "cms_attributes" drop constraint "cms_attributes_collection_id_foreign";');

    this.addSql('alter table "cms_folders" drop constraint "cms_folders_created_by_id_foreign";');

    this.addSql('alter table "cms_files" drop constraint "cms_files_created_by_id_foreign";');

    this.addSql('alter table "cms_folders" drop constraint "cms_folders_parent_folder_id_foreign";');

    this.addSql('alter table "cms_files" drop constraint "cms_files_parent_folder_id_foreign";');

    this.addSql('drop table if exists "cms_collections" cascade;');

    this.addSql('drop table if exists "cms_attributes" cascade;');

    this.addSql('drop table if exists "cms_users" cascade;');

    this.addSql('drop table if exists "cms_folders" cascade;');

    this.addSql('drop table if exists "cms_files" cascade;');
  }

}
