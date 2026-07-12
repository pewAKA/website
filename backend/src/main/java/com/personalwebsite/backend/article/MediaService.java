package com.personalwebsite.backend.article;

import com.personalwebsite.backend.common.BusinessException;
import com.personalwebsite.backend.config.ContentProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
class MediaService {
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );
    private final ContentProperties contentProperties;

    MediaService(ContentProperties contentProperties) {
        this.contentProperties = contentProperties;
    }

    MediaUploadResponse store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw badRequest("请选择需要上传的图片");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw badRequest("图片大小不能超过 5 MB");
        }
        String contentType = file.getContentType();
        String extension = EXTENSIONS.get(contentType);
        if (extension == null) {
            throw badRequest("仅支持 JPEG、PNG 和 WebP 图片");
        }

        String fileName = UUID.randomUUID() + "." + extension;
        Path root = Path.of(contentProperties.mediaRoot()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
            // UUID 文件名不可由上传者控制，避免通过文件名覆盖站点内任意文件。
            Files.copy(file.getInputStream(), root.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new BusinessException("MEDIA_STORAGE_ERROR", "图片保存失败，请检查服务器媒体目录权限", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String publicPath = contentProperties.mediaPublicPath().replaceAll("/+$", "");
        return new MediaUploadResponse(publicPath + "/" + fileName, fileName);
    }

    private BusinessException badRequest(String message) {
        return new BusinessException("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST);
    }
}
