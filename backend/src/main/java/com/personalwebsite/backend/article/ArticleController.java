package com.personalwebsite.backend.article;

import com.personalwebsite.backend.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 对访客开放的文章阅读与筛选接口。 */
@RestController
class ArticleController {
    private final ArticleService articleService;

    ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping("/articles")
    ApiResponse<PageResponse<ArticleResponse>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int pageSize
    ) {
        return ApiResponse.success(articleService.listPublished(category, tag, page, pageSize));
    }

    @GetMapping("/articles/{slug}")
    ApiResponse<ArticleResponse> detail(@org.springframework.web.bind.annotation.PathVariable String slug) {
        return ApiResponse.success(articleService.getPublished(slug));
    }

    @GetMapping("/article-taxonomy")
    ApiResponse<TaxonomyResponse> taxonomy() {
        return ApiResponse.success(articleService.getPublicTaxonomy());
    }
}
