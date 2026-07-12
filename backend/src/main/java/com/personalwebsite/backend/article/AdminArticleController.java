package com.personalwebsite.backend.article;

import com.personalwebsite.backend.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 仅供管理员使用的文章与分类标签维护接口。 */
@RestController
@RequestMapping("/admin")
class AdminArticleController {
    private final ArticleService articleService;

    AdminArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping("/articles")
    ApiResponse<PageResponse<ArticleResponse>> listArticles(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        return ApiResponse.success(articleService.listAdmin(status, page, pageSize));
    }

    @GetMapping("/articles/{id}")
    ApiResponse<ArticleResponse> getArticle(@PathVariable long id) {
        return ApiResponse.success(articleService.getAdmin(id));
    }

    @PostMapping("/articles")
    ApiResponse<ArticleResponse> createArticle(@Valid @RequestBody ArticleUpsertRequest request) {
        return ApiResponse.success(articleService.create(request));
    }

    @PutMapping("/articles/{id}")
    ApiResponse<ArticleResponse> updateArticle(@PathVariable long id, @Valid @RequestBody ArticleUpsertRequest request) {
        return ApiResponse.success(articleService.update(id, request));
    }

    @PostMapping("/articles/{id}/publish")
    ApiResponse<ArticleResponse> publishArticle(@PathVariable long id) {
        return ApiResponse.success(articleService.publish(id));
    }

    @PostMapping("/articles/{id}/unpublish")
    ApiResponse<ArticleResponse> unpublishArticle(@PathVariable long id) {
        return ApiResponse.success(articleService.unpublish(id));
    }

    @DeleteMapping("/articles/{id}")
    ApiResponse<Void> deleteArticle(@PathVariable long id) {
        articleService.deleteArticle(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/article-categories")
    ApiResponse<List<ArticleCategoryResponse>> listCategories() {
        return ApiResponse.success(articleService.listAdminCategories());
    }

    @PostMapping("/article-categories")
    ApiResponse<ArticleCategoryResponse> createCategory(@Valid @RequestBody TaxonomyUpsertRequest request) {
        return ApiResponse.success(articleService.createCategory(request));
    }

    @PutMapping("/article-categories/{id}")
    ApiResponse<ArticleCategoryResponse> updateCategory(@PathVariable long id, @Valid @RequestBody TaxonomyUpsertRequest request) {
        return ApiResponse.success(articleService.updateCategory(id, request));
    }

    @DeleteMapping("/article-categories/{id}")
    ApiResponse<Void> deleteCategory(@PathVariable long id) {
        articleService.deleteCategory(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/article-tags")
    ApiResponse<List<ArticleTagResponse>> listTags() {
        return ApiResponse.success(articleService.listAdminTags());
    }

    @PostMapping("/article-tags")
    ApiResponse<ArticleTagResponse> createTag(@Valid @RequestBody TaxonomyUpsertRequest request) {
        return ApiResponse.success(articleService.createTag(request));
    }

    @PutMapping("/article-tags/{id}")
    ApiResponse<ArticleTagResponse> updateTag(@PathVariable long id, @Valid @RequestBody TaxonomyUpsertRequest request) {
        return ApiResponse.success(articleService.updateTag(id, request));
    }

    @DeleteMapping("/article-tags/{id}")
    ApiResponse<Void> deleteTag(@PathVariable long id) {
        articleService.deleteTag(id);
        return ApiResponse.success(null);
    }
}
