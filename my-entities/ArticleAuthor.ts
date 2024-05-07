import { Entity, ManyToOne } from '@mikro-orm/core';
import { Article } from './Article';
import { Author } from './Author';

@Entity()
export class ArticleAuthor {

  @ManyToOne({ entity: () => Article, nullable: true })
  article?: Article;

  @ManyToOne({ entity: () => Author, nullable: true })
  author?: Author;

}
