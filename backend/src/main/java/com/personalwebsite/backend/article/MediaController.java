package com.personalwebsite.backend.article;

import com.personalwebsite.backend.common.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** 后台图片上传端点；公开读取由 /media/** 静态资源处理。 */
@RestController
@RequestMapping("/admin/media")
class MediaController {
    private final MediaService mediaService;

    MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<MediaUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        return ApiResponse.success(mediaService.store(file));
    }
}
