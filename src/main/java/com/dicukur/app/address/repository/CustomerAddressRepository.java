package com.dicukur.app.address.repository;

import com.dicukur.app.address.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
    List<CustomerAddress> findByCustomer_IdOrderByIsDefaultDescUpdatedAtDesc(Long customerId);

    Optional<CustomerAddress> findByIdAndCustomer_Id(Long id, Long customerId);

    Optional<CustomerAddress> findByCustomer_IdAndIsDefaultTrue(Long customerId);
}
