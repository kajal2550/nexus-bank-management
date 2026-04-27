package com.bank.backend.service;

import com.bank.backend.entity.Account;
import com.bank.backend.entity.Transaction;
import com.bank.backend.entity.User;
import com.bank.backend.exception.CustomException;
import com.bank.backend.repository.AccountRepository;
import com.bank.backend.repository.TransactionRepository;
import com.bank.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private NotificationService notificationService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new CustomException("User not found"));
    }

    @Transactional
    public Account createAccount(double initialDeposit) {
        User user = getCurrentUser();
        Account account = new Account();
        account.setUser(user);
        account.setAccountType("SAVINGS");
        account.setBalance(initialDeposit);
        account.setAccountNumber("AC" + (int)(Math.random() * 90000000 + 10000000));
        Account savedAccount = accountRepository.save(account);

        if (initialDeposit > 0) {
            recordTransaction(savedAccount, "DEPOSIT", initialDeposit, "Self");
        }
        return savedAccount;
    }

    public List<Account> getMyAccounts() {
        return getCurrentUser().getAccounts();
    }

    @Cacheable(value = "balanceCache", key = "#accountNumber")
    public double getBalance(String accountNumber) {
        return getAccountByNumberAndVerifyUser(accountNumber).getBalance();
    }

    @Transactional
    @CacheEvict(value = "balanceCache", key = "#accountNumber")
    public Account deposit(String accountNumber, double amount) {
        Account account = getAccountByNumberAndVerifyUser(accountNumber);
        account.setBalance(account.getBalance() + amount);
        Account updatedAccount = accountRepository.save(account);
        recordTransaction(updatedAccount, "DEPOSIT", amount, "Self");
        return updatedAccount;
    }

    @Transactional
    @CacheEvict(value = "balanceCache", key = "#accountNumber")
    public Account withdraw(String accountNumber, double amount) {
        Account account = getAccountByNumberAndVerifyUser(accountNumber);
        if (account.getBalance() < amount) {
            throw new CustomException("Insufficient balance");
        }
        account.setBalance(account.getBalance() - amount);
        Account updatedAccount = accountRepository.save(account);
        recordTransaction(updatedAccount, "WITHDRAW", amount, "Self");
        return updatedAccount;
    }

    @Transactional
    @CacheEvict(value = "balanceCache", allEntries = true)
    public void fundTransfer(String fromAccountNumber, String toAccountNumber, double amount) {
        if (fromAccountNumber.equals(toAccountNumber)) {
            throw new CustomException("Cannot transfer to the same account");
        }
        
        Account fromAccount = getAccountByNumberAndVerifyUser(fromAccountNumber);
        Account toAccount = accountRepository.findByAccountNumber(toAccountNumber)
                .orElseThrow(() -> new CustomException("Destination account not found"));

        if (fromAccount.getBalance() < amount) {
            throw new CustomException("Insufficient balance");
        }

        // Fraud detection limit check (simulated)
        if (amount >= 100000) {
            System.out.println("ALERT: Large transfer initiated. OTP verification skipped for simulation, but flagged as suspicious.");
        }

        fromAccount.setBalance(fromAccount.getBalance() - amount);
        toAccount.setBalance(toAccount.getBalance() + amount);

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        recordTransaction(fromAccount, "TRANSFER_OUT", amount, toAccountNumber);
        recordTransaction(toAccount, "TRANSFER_IN", amount, fromAccountNumber);
        
        notificationService.publishTransactionEvent(
            "Transfer of $" + amount + " successful from " + fromAccountNumber + " to " + toAccountNumber
        );
    }

    public List<Transaction> getTransactionHistory(String accountNumber) {
        Account account = getAccountByNumberAndVerifyUser(accountNumber);
        return transactionRepository.findByAccount_AccountIdOrderByCreatedAtDesc(account.getAccountId());
    }

    private Account getAccountByNumberAndVerifyUser(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new CustomException("Account not found"));
        User user = getCurrentUser();
        if (!account.getUser().getUserId().equals(user.getUserId())) {
            throw new CustomException("Unauthorized access to account");
        }
        return account;
    }

    private void recordTransaction(Account account, String type, double amount, String reference) {
        Transaction transaction = new Transaction();
        transaction.setReferenceNo(UUID.randomUUID().toString());
        transaction.setAccount(account);
        transaction.setTxnType(type);
        transaction.setAmount(amount);
        transaction.setToAccount(reference);
        transaction.setStatus(amount >= 100000 ? "SUSPICIOUS" : "SUCCESS");
        transactionRepository.save(transaction);
    }
}
