package com.dicukur.app.notification.service;

import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.notification.dto.NotificationResponse;
import com.dicukur.app.notification.entity.Notification;
import com.dicukur.app.notification.repository.NotificationRepository;
import com.dicukur.app.registration.repository.BarberRegistrationRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.User;
import com.dicukur.app.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BarberRegistrationRepository registrationRepository;
    private final CurrentUserService currentUserService;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               BookingRepository bookingRepository,
                               BarberRegistrationRepository registrationRepository,
                               CurrentUserService currentUserService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.registrationRepository = registrationRepository;
        this.currentUserService = currentUserService;
    }

    public void createNotification(Long userId, String title, String message, String type, Long bookingId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);

        if (bookingId != null) {
            bookingRepository.findById(bookingId).ifPresent(notification::setBooking);
        }

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        User user = currentUserService.requireUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User user = currentUserService.requireUser();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    public void markAsRead(Long id) {
        User user = currentUserService.requireUser();
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId())) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public void markAllAsRead() {
        User user = currentUserService.requireUser();
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    private NotificationResponse mapToResponse(Notification n) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
        return new NotificationResponse(
                n.getId(),
                n.getBooking() != null ? n.getBooking().getId() : null,
                n.getRegistration() != null ? n.getRegistration().getId() : null,
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getIsRead(),
                n.getCreatedAt() != null ? n.getCreatedAt().format(fmt) : null
        );
    }
}
