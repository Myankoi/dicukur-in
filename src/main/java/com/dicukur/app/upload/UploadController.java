package com.dicukur.app.upload;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.dicukur.app.security.CurrentUserService;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UploadController {

    private static final String UPLOAD_DIR = "uploads";
    private final CurrentUserService currentUserService;

    public UploadController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file,
                                         @RequestParam(value = "type", required = false) String type) {
        currentUserService.requireUser();
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File kosong"));
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ukuran file maksimal 5 MB"));
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!List.of("image/jpeg", "image/png", "application/pdf").contains(contentType)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Format file harus JPG, PNG, atau PDF"));
        }

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Path filepath = Paths.get(UPLOAD_DIR, newFilename);
            Files.write(filepath, file.getBytes());

            String fileUrl = "/api/uploads/" + newFilename;

            return ResponseEntity.ok(Map.of(
                    "path", fileUrl,
                    "url", fileUrl,
                    "filename", newFilename
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Gagal menyimpan file: " + e.getMessage()));
        }
    }

    @GetMapping("/uploads/{filename}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) {
        try {
            Path path = Paths.get(UPLOAD_DIR, filename);
            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }
            byte[] bytes = Files.readAllBytes(path);
            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .body(bytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
