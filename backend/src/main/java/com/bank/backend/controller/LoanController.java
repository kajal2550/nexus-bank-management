package com.bank.backend.controller;

import com.bank.backend.entity.Loan;
import com.bank.backend.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "http://localhost:5173")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @PostMapping("/apply")
    public ResponseEntity<Loan> applyLoan(@RequestBody Map<String, Double> request) {
        return ResponseEntity.ok(loanService.applyForLoan(request.get("amount")));
    }

    @GetMapping("/status")
    public ResponseEntity<List<Loan>> getLoanStatus() {
        return ResponseEntity.ok(loanService.getMyLoans());
    }

    // Admin endpoint
    @PutMapping("/admin/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Loan> approveLoan(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.approveLoan(id));
    }
}
