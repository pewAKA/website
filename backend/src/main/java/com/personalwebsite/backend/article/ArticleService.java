package com.personalwebsite.backend.article;

import com.personalwebsite.backend.common.BusinessException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
class ArticleService {
    private static final String DRAFT = "DRAFT";
    private static final String PUBLISHED = "PUBLISHED";
    private final ArticleMapper articleMapper;

    ArticleService(ArticleMapper articleMapper) {
        this.articleMapper = articleMapper;
    }

    PageResponse<ArticleResponse> listPublished(String categorySlug, String tagSlug, int page, int pageSize) {
        validatePage(page, pageSize);
        List<Article> articles = articleMapper.findPublishedPage(categorySlug, tagSlug, pageSize, (page - 1) * pageSize);
        articles.forEach(this::attachTags);
        return new PageResponse<>(articles.stream().map(this::toResponse).toList(),
                articleMapper.countPublished(categorySlug, tagSlug), page, pageSize);
    }

    ArticleResponse getPublished(String slug) {
        Article article = articleMapper.findPublishedBySlug(slug);
        if (article == null) {
            throw notFound("文章不存在或尚未发布");
        }
        attachTags(article);
        return toResponse(article);
    }

    TaxonomyResponse getPublicTaxonomy() {
        return new TaxonomyResponse(
                articleMapper.findPublicCategories().stream().map(this::toCategoryResponse).toList(),
                articleMapper.findPublicTags().stream().map(this::toTagResponse).toList()
        );
    }

    PageResponse<ArticleResponse> listAdmin(String status, int page, int pageSize) {
        validatePage(page, pageSize);
        if (StringUtils.hasText(status) && !DRAFT.equals(status) && !PUBLISHED.equals(status)) {
            throw badRequest("文章状态只能为 DRAFT 或 PUBLISHED");
        }
        List<Article> articles = articleMapper.findAdminPage(status, pageSize, (page - 1) * pageSize);
        articles.forEach(this::attachTags);
        return new PageResponse<>(articles.stream().map(this::toResponse).toList(),
                articleMapper.countAdmin(status), page, pageSize);
    }

    ArticleResponse getAdmin(long id) {
        Article article = getArticle(id);
        attachTags(article);
        return toResponse(article);
    }

    @Transactional
    ArticleResponse create(ArticleUpsertRequest request) {
        validateTaxonomy(request.categoryId(), request.tagIds());
        Article article = applyRequest(new Article(), request);
        try {
            articleMapper.insertArticle(article);
        } catch (DuplicateKeyException exception) {
            throw conflict("文章 slug 已存在，请换一个地址标识");
        }
        replaceTags(article.getId(), request.tagIds());
        return getAdmin(article.getId());
    }

    @Transactional
    ArticleResponse update(long id, ArticleUpsertRequest request) {
        Article article = getArticle(id);
        validateTaxonomy(request.categoryId(), request.tagIds());
        applyRequest(article, request);
        try {
            articleMapper.updateArticle(article);
        } catch (DuplicateKeyException exception) {
            throw conflict("文章 slug 已存在，请换一个地址标识");
        }
        replaceTags(id, request.tagIds());
        return getAdmin(id);
    }

    @Transactional
    ArticleResponse publish(long id) {
        getArticle(id);
        articleMapper.publishArticle(id, LocalDateTime.now());
        return getAdmin(id);
    }

    @Transactional
    ArticleResponse unpublish(long id) {
        getArticle(id);
        articleMapper.unpublishArticle(id);
        return getAdmin(id);
    }

    @Transactional
    void deleteArticle(long id) {
        getArticle(id);
        articleMapper.deleteArticleTags(id);
        articleMapper.deleteArticle(id);
    }

    List<ArticleCategoryResponse> listAdminCategories() {
        return articleMapper.findAllCategories().stream().map(this::toCategoryResponse).toList();
    }

    List<ArticleTagResponse> listAdminTags() {
        return articleMapper.findAllTags().stream().map(this::toTagResponse).toList();
    }

    @Transactional
    ArticleCategoryResponse createCategory(TaxonomyUpsertRequest request) {
        ArticleCategory category = toCategory(request);
        try {
            articleMapper.insertCategory(category);
        } catch (DuplicateKeyException exception) {
            throw conflict("分类名称或 slug 已存在");
        }
        return toCategoryResponse(articleMapper.findCategoryById(category.getId()));
    }

    @Transactional
    ArticleCategoryResponse updateCategory(long id, TaxonomyUpsertRequest request) {
        ArticleCategory category = articleMapper.findCategoryById(id);
        if (category == null) {
            throw notFound("分类不存在");
        }
        applyCategoryRequest(category, request);
        try {
            articleMapper.updateCategory(category);
        } catch (DuplicateKeyException exception) {
            throw conflict("分类名称或 slug 已存在");
        }
        return toCategoryResponse(articleMapper.findCategoryById(id));
    }

    @Transactional
    void deleteCategory(long id) {
        if (articleMapper.deleteCategory(id) == 0) {
            throw badRequest("分类不存在，或仍有关联文章，无法删除");
        }
    }

    @Transactional
    ArticleTagResponse createTag(TaxonomyUpsertRequest request) {
        ArticleTag tag = toTag(request);
        try {
            articleMapper.insertTag(tag);
        } catch (DuplicateKeyException exception) {
            throw conflict("标签名称或 slug 已存在");
        }
        return toTagResponse(articleMapper.findTagById(tag.getId()));
    }

    @Transactional
    ArticleTagResponse updateTag(long id, TaxonomyUpsertRequest request) {
        ArticleTag tag = articleMapper.findTagById(id);
        if (tag == null) {
            throw notFound("标签不存在");
        }
        tag.setName(request.name().trim());
        tag.setSlug(request.slug());
        try {
            articleMapper.updateTag(tag);
        } catch (DuplicateKeyException exception) {
            throw conflict("标签名称或 slug 已存在");
        }
        return toTagResponse(articleMapper.findTagById(id));
    }

    @Transactional
    void deleteTag(long id) {
        if (articleMapper.deleteTag(id) == 0) {
            throw badRequest("标签不存在，或仍有关联文章，无法删除");
        }
    }

    List<Article> sitemapEntries() {
        return articleMapper.findSitemapEntries();
    }

    private Article getArticle(long id) {
        Article article = articleMapper.findById(id);
        if (article == null) {
            throw notFound("文章不存在");
        }
        return article;
    }

    private void attachTags(Article article) {
        article.setTags(articleMapper.findTagsByArticleId(article.getId()));
    }

    private void validateTaxonomy(long categoryId, List<Long> tagIds) {
        ArticleCategory category = articleMapper.findCategoryById(categoryId);
        if (category == null || !Boolean.TRUE.equals(category.getEnabled())) {
            throw badRequest("请选择一个启用中的分类");
        }
        for (Long tagId : normalizedTagIds(tagIds)) {
            if (articleMapper.findTagById(tagId) == null) {
                throw badRequest("所选标签不存在");
            }
        }
    }

    private void replaceTags(long articleId, List<Long> tagIds) {
        articleMapper.deleteArticleTags(articleId);
        for (Long tagId : normalizedTagIds(tagIds)) {
            articleMapper.insertArticleTag(articleId, tagId);
        }
    }

    private List<Long> normalizedTagIds(List<Long> tagIds) {
        if (tagIds == null) {
            return List.of();
        }
        Set<Long> uniqueIds = new HashSet<>();
        for (Long tagId : tagIds) {
            if (tagId == null || !uniqueIds.add(tagId)) {
                throw badRequest("标签列表包含无效或重复项");
            }
        }
        return new ArrayList<>(uniqueIds);
    }

    private Article applyRequest(Article article, ArticleUpsertRequest request) {
        article.setCategoryId(request.categoryId());
        article.setTitle(request.title().trim());
        article.setSlug(request.slug());
        article.setSummary(request.summary().trim());
        article.setContent(request.content());
        article.setCoverImageUrl(request.coverImageUrl() == null ? null : request.coverImageUrl().trim());
        return article;
    }

    private ArticleCategory toCategory(TaxonomyUpsertRequest request) {
        ArticleCategory category = new ArticleCategory();
        applyCategoryRequest(category, request);
        return category;
    }

    private void applyCategoryRequest(ArticleCategory category, TaxonomyUpsertRequest request) {
        category.setName(request.name().trim());
        category.setSlug(request.slug());
        category.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        category.setEnabled(request.enabled() == null || request.enabled());
    }

    private ArticleTag toTag(TaxonomyUpsertRequest request) {
        ArticleTag tag = new ArticleTag();
        tag.setName(request.name().trim());
        tag.setSlug(request.slug());
        return tag;
    }

    private ArticleResponse toResponse(Article article) {
        return new ArticleResponse(
                article.getId(), article.getTitle(), article.getSlug(), article.getSummary(), article.getContent(),
                article.getCoverImageUrl(), article.getStatus(), article.getPublishedAt(), article.getCreatedAt(),
                article.getUpdatedAt(), toCategoryResponse(article),
                article.getTags().stream().map(this::toTagResponse).toList()
        );
    }

    private ArticleCategoryResponse toCategoryResponse(Article article) {
        return new ArticleCategoryResponse(article.getCategoryId(), article.getCategoryName(), article.getCategorySlug(), null, true, null);
    }

    private ArticleCategoryResponse toCategoryResponse(ArticleCategory category) {
        return new ArticleCategoryResponse(category.getId(), category.getName(), category.getSlug(), category.getSortOrder(),
                category.getEnabled(), category.getArticleCount());
    }

    private ArticleTagResponse toTagResponse(ArticleTag tag) {
        return new ArticleTagResponse(tag.getId(), tag.getName(), tag.getSlug(), tag.getArticleCount());
    }

    private void validatePage(int page, int pageSize) {
        if (page < 1 || pageSize < 1 || pageSize > 50) {
            throw badRequest("页码必须大于 0，且每页数量不能超过 50");
        }
    }

    private BusinessException notFound(String message) {
        return new BusinessException("NOT_FOUND", message, HttpStatus.NOT_FOUND);
    }

    private BusinessException badRequest(String message) {
        return new BusinessException("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST);
    }

    private BusinessException conflict(String message) {
        return new BusinessException("CONFLICT", message, HttpStatus.CONFLICT);
    }
}
