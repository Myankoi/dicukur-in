package com.dicukur.app.service.repository;

import com.dicukur.app.service.entity.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {
    Optional<PricingRule> findFirstByStatusOrderByIdAsc(String status);
}
