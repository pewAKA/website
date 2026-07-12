package com.personalwebsite.backend.article;

import com.personalwebsite.backend.common.BusinessException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.dao.DuplicateKeyException;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {
    @Mock
    private ArticleMapper articleMapper;

    @InjectMocks
    private ArticleService articleService;

    @Test
    void listsOnlyPublishedResultsProvidedByPublicMapper() {
        Article article = article(1L, "公开文章", "public-article");
        ArticleTag tag = new ArticleTag();
        tag.setId(9L);
        tag.setName("React");
        tag.setSlug("react");
        when(articleMapper.findPublishedPage("frontend", null, 12, 0)).thenReturn(List.of(article));
        when(articleMapper.countPublished("frontend", null)).thenReturn(1L);
        when(articleMapper.findTagsByArticleId(1L)).thenReturn(List.of(tag));

        PageResponse<ArticleResponse> result = articleService.listPublished("frontend", null, 1, 12);

        assertThat(result.total()).isEqualTo(1);
        assertThat(result.items()).singleElement().satisfies(item -> {
            assertThat(item.title()).isEqualTo("公开文章");
            assertThat(item.tags()).extracting(ArticleTagResponse::slug).containsExactly("react");
        });
    }

    @Test
    void doesNotExposeMissingOrDraftArticlesThroughPublicDetail() {
        when(articleMapper.findPublishedBySlug("draft-article")).thenReturn(null);

        assertThatThrownBy(() -> articleService.getPublished("draft-article"))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getStatus().value()).isEqualTo(404));
    }

    @Test
    void returnsConflictWhenArticleSlugAlreadyExists() {
        ArticleCategory category = new ArticleCategory();
        category.setId(1L);
        category.setEnabled(true);
        when(articleMapper.findCategoryById(1L)).thenReturn(category);
        when(articleMapper.insertArticle(any())).thenThrow(new DuplicateKeyException("duplicate slug"));
        ArticleUpsertRequest request = new ArticleUpsertRequest(
                "文章", "duplicate-slug", "摘要", "正文", null, 1L, List.of()
        );

        assertThatThrownBy(() -> articleService.create(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getStatus().value()).isEqualTo(409));
    }

    private Article article(long id, String title, String slug) {
        Article article = new Article();
        article.setId(id);
        article.setTitle(title);
        article.setSlug(slug);
        article.setSummary("摘要");
        article.setContent("正文");
        article.setCategoryId(1L);
        article.setCategoryName("前端");
        article.setCategorySlug("frontend");
        article.setStatus("PUBLISHED");
        return article;
    }
}
