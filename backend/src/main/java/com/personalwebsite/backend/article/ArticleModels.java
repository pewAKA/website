package com.personalwebsite.backend.article;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** 文章领域对象与接口 DTO 集中在同一包中，避免暴露数据库实体。 */
class Article {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String coverImageUrl;
    private String status;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ArticleTag> tags = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getCategorySlug() { return categorySlug; }
    public void setCategorySlug(String categorySlug) { this.categorySlug = categorySlug; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<ArticleTag> getTags() { return tags; }
    public void setTags(List<ArticleTag> tags) { this.tags = tags; }
}

class ArticleCategory {
    private Long id;
    private String name;
    private String slug;
    private Integer sortOrder;
    private Boolean enabled;
    private Long articleCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public Long getArticleCount() { return articleCount; }
    public void setArticleCount(Long articleCount) { this.articleCount = articleCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

class ArticleTag {
    private Long id;
    private String name;
    private String slug;
    private Long articleCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public Long getArticleCount() { return articleCount; }
    public void setArticleCount(Long articleCount) { this.articleCount = articleCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

record PageResponse<T>(List<T> items, long total, int page, int pageSize) { }

record ArticleResponse(
        Long id, String title, String slug, String summary, String content, String coverImageUrl,
        String status, LocalDateTime publishedAt, LocalDateTime createdAt, LocalDateTime updatedAt,
        ArticleCategoryResponse category, List<ArticleTagResponse> tags
) { }

record ArticleCategoryResponse(Long id, String name, String slug, Integer sortOrder, Boolean enabled, Long articleCount) { }

record ArticleTagResponse(Long id, String name, String slug, Long articleCount) { }

record TaxonomyResponse(List<ArticleCategoryResponse> categories, List<ArticleTagResponse> tags) { }

record ArticleUpsertRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*", message = "slug 只能包含小写字母、数字和连字符") @Size(max = 180) String slug,
        @NotBlank @Size(max = 360) String summary,
        @NotBlank String content,
        @Size(max = 500) String coverImageUrl,
        @NotNull Long categoryId,
        List<Long> tagIds
) { }

record TaxonomyUpsertRequest(
        @NotBlank @Size(max = 64) String name,
        @NotBlank @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*", message = "slug 只能包含小写字母、数字和连字符") @Size(max = 80) String slug,
        Integer sortOrder,
        Boolean enabled
) { }

record MediaUploadResponse(String url, String fileName) { }
