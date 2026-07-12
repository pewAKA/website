package com.personalwebsite.backend.article;

import com.personalwebsite.backend.common.BusinessException;
import com.personalwebsite.backend.config.ContentProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MediaServiceTest {
    @TempDir
    Path mediaRoot;

    @Test
    void storesAllowedImageUnderRandomMediaName() throws Exception {
        MediaService mediaService = new MediaService(new ContentProperties(mediaRoot.toString(), "/media", "https://example.com"));
        MockMultipartFile image = new MockMultipartFile("file", "cover.png", "image/png", new byte[]{1, 2, 3});

        MediaUploadResponse result = mediaService.store(image);

        assertThat(result.url()).startsWith("/media/").endsWith(".png");
        assertThat(Files.exists(mediaRoot.resolve(result.fileName()))).isTrue();
    }

    @Test
    void rejectsUnsupportedMediaType() {
        MediaService mediaService = new MediaService(new ContentProperties(mediaRoot.toString(), "/media", "https://example.com"));
        MockMultipartFile textFile = new MockMultipartFile("file", "note.txt", "text/plain", "text".getBytes());

        assertThatThrownBy(() -> mediaService.store(textFile))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getStatus().value()).isEqualTo(400));
    }
}
