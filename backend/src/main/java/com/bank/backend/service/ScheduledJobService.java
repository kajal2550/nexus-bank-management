package com.bank.backend.service;

import com.bank.backend.entity.Account;
import com.bank.backend.entity.Transaction;
import com.bank.backend.repository.AccountRepository;
import com.bank.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@EnableScheduling
public class ScheduledJobService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private NotificationService notificationService;

    // Cron expression: At 00:00:00 on the 1st day of every month
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void calculateAndCreditMonthlyInterest() {
        System.out.println("Running Scheduled Monthly Interest Job...");
        List<Account> accounts = accountRepository.findAll();
        
        for (Account account : accounts) {
            if ("SAVINGS".equalsIgnoreCase(account.getAccountType()) && "ACTIVE".equalsIgnoreCase(account.getStatus())) {
                double interest = account.getBalance() * 0.03; // 3% monthly interest for simulation
                if (interest > 0) {
                    account.setBalance(account.getBalance() + interest);
                    accountRepository.save(account);

                    Transaction txn = new Transaction();
                    txn.setAmount(interest);
                    txn.setFromAccount("BANK_SYSTEM");
                    txn.setToAccount(account.getAccountNumber());
                    txn.setTxnType("INTEREST_CREDIT");
                    txn.setStatus("SUCCESS");
                    txn.setReferenceNo(UUID.randomUUID().toString());
                    transactionRepository.save(txn);

                    notificationService.publishTransactionEvent(
                        "Interest of $" + String.format("%.2f", interest) + " credited to account " + account.getAccountNumber()
                    );
                }
            }
        }
    }
}
