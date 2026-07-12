package com.personalwebsite.backend.article;

import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
interface ArticleMapper {
    // 以换行开头，确保注解中的 SELECT 与第一列在字符串拼接后始终有分隔符。
    String ARTICLE_COLUMNS = "\n" + """
            a.id, a.category_id, c.name AS category_name, c.slug AS category_slug,
            a.title, a.slug, a.summary, a.content, a.cover_image_url, a.status,
            a.published_at, a.created_at, a.updated_at
            """;

    @Select("""
            <script>
            SELECT """ + ARTICLE_COLUMNS + """
            FROM article a JOIN article_category c ON c.id = a.category_id
            WHERE a.status = 'PUBLISHED'
            <if test='categorySlug != null and !categorySlug.isBlank()'>AND c.slug = #{categorySlug}</if>
            <if test='tagSlug != null and !tagSlug.isBlank()'>
              AND EXISTS (SELECT 1 FROM article_tag_relation atr JOIN article_tag t ON t.id = atr.tag_id
                          WHERE atr.article_id = a.id AND t.slug = #{tagSlug})
            </if>
            ORDER BY a.published_at DESC, a.id DESC
            LIMIT #{limit} OFFSET #{offset}
            </script>
            """)
    List<Article> findPublishedPage(
            @Param("categorySlug") String categorySlug,
            @Param("tagSlug") String tagSlug,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Select("""
            <script>
            SELECT COUNT(*) FROM article a JOIN article_category c ON c.id = a.category_id
            WHERE a.status = 'PUBLISHED'
            <if test='categorySlug != null and !categorySlug.isBlank()'>AND c.slug = #{categorySlug}</if>
            <if test='tagSlug != null and !tagSlug.isBlank()'>
              AND EXISTS (SELECT 1 FROM article_tag_relation atr JOIN article_tag t ON t.id = atr.tag_id
                          WHERE atr.article_id = a.id AND t.slug = #{tagSlug})
            </if>
            </script>
            """)
    long countPublished(@Param("categorySlug") String categorySlug, @Param("tagSlug") String tagSlug);

    @Select("""
            SELECT """ + ARTICLE_COLUMNS + """
            FROM article a JOIN article_category c ON c.id = a.category_id
            WHERE a.slug = #{slug} AND a.status = 'PUBLISHED'
            LIMIT 1
            """)
    Article findPublishedBySlug(@Param("slug") String slug);

    @Select("""
            <script>
            SELECT """ + ARTICLE_COLUMNS + """
            FROM article a JOIN article_category c ON c.id = a.category_id
            <if test='status != null and !status.isBlank()'>WHERE a.status = #{status}</if>
            ORDER BY CASE WHEN a.published_at IS NULL THEN a.updated_at ELSE a.published_at END DESC, a.id DESC
            LIMIT #{limit} OFFSET #{offset}
            </script>
            """)
    List<Article> findAdminPage(@Param("status") String status, @Param("limit") int limit, @Param("offset") int offset);

    @Select("""
            <script>SELECT COUNT(*) FROM article
            <if test='status != null and !status.isBlank()'>WHERE status = #{status}</if>
            </script>
            """)
    long countAdmin(@Param("status") String status);

    @Select("""
            SELECT """ + ARTICLE_COLUMNS + """
            FROM article a JOIN article_category c ON c.id = a.category_id
            WHERE a.id = #{id} LIMIT 1
            """)
    Article findById(@Param("id") long id);

    @Select("SELECT id, name, slug, created_at, updated_at FROM article_tag t JOIN article_tag_relation atr ON atr.tag_id = t.id WHERE atr.article_id = #{articleId} ORDER BY t.name")
    List<ArticleTag> findTagsByArticleId(@Param("articleId") long articleId);

    @Insert("""
            INSERT INTO article (category_id, title, slug, summary, content, cover_image_url, status)
            VALUES (#{article.categoryId}, #{article.title}, #{article.slug}, #{article.summary}, #{article.content},
                    NULLIF(#{article.coverImageUrl}, ''), 'DRAFT')
            """)
    @Options(useGeneratedKeys = true, keyProperty = "article.id")
    int insertArticle(@Param("article") Article article);

    @Update("""
            UPDATE article SET category_id = #{article.categoryId}, title = #{article.title}, slug = #{article.slug},
            summary = #{article.summary}, content = #{article.content}, cover_image_url = NULLIF(#{article.coverImageUrl}, '')
            WHERE id = #{article.id}
            """)
    int updateArticle(@Param("article") Article article);

    @Update("UPDATE article SET status = 'PUBLISHED', published_at = #{publishedAt} WHERE id = #{id}")
    int publishArticle(@Param("id") long id, @Param("publishedAt") LocalDateTime publishedAt);

    @Update("UPDATE article SET status = 'DRAFT', published_at = NULL WHERE id = #{id}")
    int unpublishArticle(@Param("id") long id);

    @Delete("DELETE FROM article_tag_relation WHERE article_id = #{articleId}")
    int deleteArticleTags(@Param("articleId") long articleId);

    @Insert("INSERT INTO article_tag_relation (article_id, tag_id) VALUES (#{articleId}, #{tagId})")
    int insertArticleTag(@Param("articleId") long articleId, @Param("tagId") long tagId);

    @Delete("DELETE FROM article WHERE id = #{id}")
    int deleteArticle(@Param("id") long id);

    @Select("SELECT id, name, slug, sort_order, enabled, created_at, updated_at FROM article_category WHERE id = #{id}")
    ArticleCategory findCategoryById(@Param("id") long id);

    @Select("SELECT id, name, slug, created_at, updated_at FROM article_tag WHERE id = #{id}")
    ArticleTag findTagById(@Param("id") long id);

    @Select("""
            SELECT c.id, c.name, c.slug, c.sort_order, c.enabled, c.created_at, c.updated_at,
            COUNT(a.id) AS article_count
            FROM article_category c LEFT JOIN article a ON a.category_id = c.id AND a.status = 'PUBLISHED'
            WHERE c.enabled = 1 GROUP BY c.id ORDER BY c.sort_order, c.name
            """)
    List<ArticleCategory> findPublicCategories();

    @Select("""
            SELECT t.id, t.name, t.slug, t.created_at, t.updated_at, COUNT(a.id) AS article_count
            FROM article_tag t LEFT JOIN article_tag_relation atr ON atr.tag_id = t.id
            LEFT JOIN article a ON a.id = atr.article_id AND a.status = 'PUBLISHED'
            GROUP BY t.id HAVING COUNT(a.id) > 0 ORDER BY t.name
            """)
    List<ArticleTag> findPublicTags();

    @Select("""
            SELECT c.id, c.name, c.slug, c.sort_order, c.enabled, c.created_at, c.updated_at,
            COUNT(a.id) AS article_count FROM article_category c LEFT JOIN article a ON a.category_id = c.id
            GROUP BY c.id ORDER BY c.sort_order, c.name
            """)
    List<ArticleCategory> findAllCategories();

    @Select("""
            SELECT t.id, t.name, t.slug, t.created_at, t.updated_at, COUNT(atr.article_id) AS article_count
            FROM article_tag t LEFT JOIN article_tag_relation atr ON atr.tag_id = t.id
            GROUP BY t.id ORDER BY t.name
            """)
    List<ArticleTag> findAllTags();

    @Insert("INSERT INTO article_category (name, slug, sort_order, enabled) VALUES (#{category.name}, #{category.slug}, #{category.sortOrder}, #{category.enabled})")
    @Options(useGeneratedKeys = true, keyProperty = "category.id")
    int insertCategory(@Param("category") ArticleCategory category);

    @Update("UPDATE article_category SET name = #{category.name}, slug = #{category.slug}, sort_order = #{category.sortOrder}, enabled = #{category.enabled} WHERE id = #{category.id}")
    int updateCategory(@Param("category") ArticleCategory category);

    @Delete("DELETE FROM article_category WHERE id = #{id} AND (SELECT COUNT(*) FROM article WHERE category_id = #{id}) = 0")
    int deleteCategory(@Param("id") long id);

    @Insert("INSERT INTO article_tag (name, slug) VALUES (#{tag.name}, #{tag.slug})")
    @Options(useGeneratedKeys = true, keyProperty = "tag.id")
    int insertTag(@Param("tag") ArticleTag tag);

    @Update("UPDATE article_tag SET name = #{tag.name}, slug = #{tag.slug} WHERE id = #{tag.id}")
    int updateTag(@Param("tag") ArticleTag tag);

    @Delete("DELETE FROM article_tag WHERE id = #{id} AND (SELECT COUNT(*) FROM article_tag_relation WHERE tag_id = #{id}) = 0")
    int deleteTag(@Param("id") long id);

    @Select("SELECT id, slug, published_at, updated_at FROM article WHERE status = 'PUBLISHED' ORDER BY published_at DESC")
    List<Article> findSitemapEntries();
}
