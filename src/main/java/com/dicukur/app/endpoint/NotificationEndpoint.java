package com.dicukur.app.endpoint;

import com.dicukur.app.notification.dto.NotificationResponse;
import com.dicukur.app.notification.service.NotificationService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;

import java.util.List;

@BrowserCallable
@RolesAllowed({"CUSTOMER", "Customer", "BARBER", "Barber", "OWNER", "Owner", "ADMIN", "Admin"})
public class NotificationEndpoint {

    private final NotificationService notificationService;

    public NotificationEndpoint(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public List<NotificationResponse> getMyNotifications() {
        return notificationService.getMyNotifications();
    }

    public long getUnreadCount() {
        return notificationService.getUnreadCount();
    }

    public void markAsRead(Long id) {
        notificationService.markAsRead(id);
    }

    public void markAllAsRead() {
        notificationService.markAllAsRead();
    }
}
