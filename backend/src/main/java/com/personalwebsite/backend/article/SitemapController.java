package com.personalwebsite.backend.article;

import com.personalwebsite.backend.config.ContentProperties;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** 仅为已发布文章生成 sitemap，草稿永远不会出现在搜索引擎入口。 */
@RestController
class SitemapController {
    private static final DateTimeFormatter SITEMAP_DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;
    private final ArticleService articleService;
    private final ContentProperties contentProperties;

    SitemapController(ArticleService articleService, ContentProperties contentProperties) {
        this.articleService = articleService;
        this.contentProperties = contentProperties;
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    String sitemap() {
        String siteUrl = contentProperties.siteUrl().replaceAll("/+$", "");
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        xml.append("  <url><loc>").append(escapeXml(siteUrl)).append("/articles</loc></url>\n");
        for (Article article : articleService.sitemapEntries()) {
            xml.append("  <url><loc>").append(escapeXml(siteUrl)).append("/articles/")
                    .append(escapeXml(article.getSlug())).append("</loc>");
            LocalDateTime updatedAt = article.getUpdatedAt() == null ? article.getPublishedAt() : article.getUpdatedAt();
            if (updatedAt != null) {
                xml.append("<lastmod>").append(SITEMAP_DATE_FORMAT.format(updatedAt)).append("</lastmod>");
            }
            xml.append("</url>\n");
        }
        return xml.append("</urlset>\n").toString();
    }

    private String escapeXml(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&apos;");
    }
}
