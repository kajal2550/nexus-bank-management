package com.bank.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long txnId;

    private String fromAccount;
    private String toAccount;
    private double amount;
    
    private String txnType; // DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT

    private String status; // SUCCESS, FAILED, SUSPICIOUS
    
    private String referenceNo;

    private LocalDateTime createdAt;

    // Optional relation back to account if needed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Account account;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
