import { Repository, EntityRepository, createQueryBuilder } from 'typeorm';


@EntityRepository(Article)
export class ArticleQueryRepository {

    findAll () {
        return createQueryBuilder()
            .select('article')
            .from(Article, 'article')
            .getMany();
    }

    findOneById(id: number) {
        return createQueryBuilder()
        .select('article')
        .from(Article, 'article')
        .where('article.id = :id', { id: id})
        .getOne();
    }

    findOneByTitle(title: string) {
        return createQueryBuilder()
            .select("article")
            .from(Article, "article")
            .where("article.title = :title", { title: title })
            .getOne();
    }

    dynamicQueryByDto(dto: ArticleSearchParam) {
        const queryBuilder = createQueryBuilder()
            .select('article')
            .from(Article, 'article')
            .orderBy('article.id', "DESC");
        
        if(dto.title) {
            queryBuilder.andWhere('article.title = : title', {title: dto.title})
        }

        if(dto.author) {
            queryBuilder.andWhere('article.author = :author', {})
        }

        return queryBuilder
            .disableEscaping()
            .getManyAndCount();
    }

    getTitleAndUserName(articleId: number) {
        return createQueryBuilder()
            .select('article.title', 'title')
            .addSelect('user.name', 'userName')
            .from(Article, 'article')
            .innerJoin('article.user', 'user', 'user.isActive = :isActive', {isActive: true})
            .where('article.id = :id', { id: articleId })
            .getRawOne();
    }

    paging(param: ArticleSearchRequest): Promise<[Article[], number]> {
        const queryBuilder = createQueryBuilder()
            .select([
                "article.id",
                "article.reservationDate",
                "article.title",
                "article.content"
            ]) // (1)
            .from(Article, "article")
            .limit(param.getLimit())
            .offset(param.getOffset()); // (2)
        
        if(param.hasReservationDate()) { // (3)
            queryBuilder.andWhere("article.title like :title", { title: `%${param.title}%`})
        }

        if(param.hasTitle()) {
            queryBuilder.andWhere('article.title like :title', {title: `%${ param.title }%`})
        }

        return queryBuilder
            .disableEscaping()
            .getManyAndCount();
    }

    pagingWithoutCount(param: ArticleSearchRequest): Promise<Article[]> {
        const queryBuilder = createQueryBuilder()
            .select([
                "article.id",
                "article.reservationDate",
                "article.title",
                "article.content"
            ])
            .from(Article, 'article')
            .limit(param.getLimitWithNext())
            .offset(param.getOffset());
        
        
            if(param.hasReservationDate()) {
                queryBuilder.andWhere("article.reservationDate >= :reservationDate", {reservationDate: param.reservationDate})
            }
    
            if(param.hasTitle()) {
                queryBuilder.andWhere("article.title ilike :title", {title: `%${param.title}%`});
            }
    
            return queryBuilder
                .disableEscaping()
                .getMany(); // count는 사용하지 않는다.
    }
}
