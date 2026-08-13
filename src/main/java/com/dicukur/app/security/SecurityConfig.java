package com.dicukur.app.security;

import com.vaadin.flow.spring.security.VaadinWebSecurity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableMethodSecurity
public class SecurityConfig extends VaadinWebSecurity {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf
                .ignoringRequestMatchers(
                        new AntPathRequestMatcher("/api/upload"),
                        new AntPathRequestMatcher("/api/uploads/**"),
                        new AntPathRequestMatcher("/api/payments/midtrans/notification")
                )
        );

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        new AntPathRequestMatcher("/"),
                        new AntPathRequestMatcher("/login"),
                        new AntPathRequestMatcher("/register"),
                        new AntPathRequestMatcher("/register/**"),
                        new AntPathRequestMatcher("/images/**"),
                        new AntPathRequestMatcher("/icons/**"),
                        new AntPathRequestMatcher("/api/upload"),
                        new AntPathRequestMatcher("/api/uploads/**"),
                        new AntPathRequestMatcher("/api/payments/midtrans/notification")
                ).permitAll());

        super.configure(http);

        setLoginView(http, "/login");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
