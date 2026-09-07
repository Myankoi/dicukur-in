package com.dicukur.app.admin.service;

import com.dicukur.app.admin.dto.AdminAuditLogResponse;
import com.dicukur.app.admin.entity.AdminAuditLog;
import com.dicukur.app.admin.repository.AdminAuditLogRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminAuditService {
    private final AdminAuditLogRepository repository;
    private final CurrentUserService currentUserService;

    public AdminAuditService(AdminAuditLogRepository repository, CurrentUserService currentUserService) {
        this.repository = repository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public void record(String action, String targetType, Long targetId, String details) {
        User admin = currentUserService.requireRole("Admin");
        AdminAuditLog log = new AdminAuditLog();
        log.setAdmin(admin);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);
        log.setCreatedAt(LocalDateTime.now());
        repository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> getRecent() {
        currentUserService.requireRole("Admin");
        return repository.findTop100ByOrderByCreatedAtDesc().stream().map(log ->
                new AdminAuditLogResponse(
                        log.getId(),
                        log.getAdmin() != null ? log.getAdmin().getId() : null,
                        log.getAdmin() != null ? log.getAdmin().getName() : "Admin dihapus",
                        log.getAction(),
                        log.getTargetType(),
                        log.getTargetId(),
                        log.getDetails(),
                        log.getCreatedAt() != null ? log.getCreatedAt().toString() : null
                )
        ).toList();
    }
}
