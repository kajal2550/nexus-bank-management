package com.bank.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ledger_entries")
@Data
public class LedgerEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "journal_entry_id")
    private JournalEntry journalEntry;
    
    private String accountIdentifier; // E.g., 'CASH_RESERVE', 'AC123456'
    
    private double debitAmount;
    private double creditAmount;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
