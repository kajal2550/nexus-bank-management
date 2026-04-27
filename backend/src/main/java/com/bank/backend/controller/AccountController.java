package com.bank.backend.controller;

import com.bank.backend.entity.Account;
import com.bank.backend.entity.Transaction;
import com.bank.backend.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody Map<String, Double> request) {
        double initialDeposit = request.getOrDefault("initialDeposit", 0.0);
        return ResponseEntity.ok(accountService.createAccount(initialDeposit));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Account>> getMyAccounts() {
        return ResponseEntity.ok(accountService.getMyAccounts());
    }

    @PostMapping("/{accountNumber}/deposit")
    public ResponseEntity<Account> deposit(@PathVariable String accountNumber, @RequestBody Map<String, Double> request) {
        double amount = request.get("amount");
        return ResponseEntity.ok(accountService.deposit(accountNumber, amount));
    }

    @PostMapping("/{accountNumber}/withdraw")
    public ResponseEntity<Account> withdraw(@PathVariable String accountNumber, @RequestBody Map<String, Double> request) {
        double amount = request.get("amount");
        return ResponseEntity.ok(accountService.withdraw(accountNumber, amount));
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> fundTransfer(@RequestBody Map<String, Object> request) {
        String from = (String) request.get("fromAccount");
        String to = (String) request.get("toAccount");
        double amount = Double.parseDouble(request.get("amount").toString());
        accountService.fundTransfer(from, to, amount);
        return ResponseEntity.ok("Transfer successful");
    }

    @GetMapping("/{accountNumber}/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getTransactionHistory(accountNumber));
    }
}
