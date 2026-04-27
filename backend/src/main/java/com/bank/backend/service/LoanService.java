package com.bank.backend.service;

import com.bank.backend.entity.Loan;
import com.bank.backend.entity.User;
import com.bank.backend.exception.CustomException;
import com.bank.backend.repository.LoanRepository;
import com.bank.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new CustomException("User not found"));
    }

    public Loan applyForLoan(double amount) {
        User user = getCurrentUser();
        
        Loan loan = new Loan();
        loan.setUserId(user.getUserId());
        loan.setLoanAmount(amount);
        loan.setInterestRate(10.5); // Fixed 10.5% for simulation
        
        // Simple EMI calculation for 12 months
        double r = (10.5 / 12) / 100;
        double emi = (amount * r * Math.pow(1 + r, 12)) / (Math.pow(1 + r, 12) - 1);
        loan.setEmi(emi);
        
        loan.setLoanStatus("PENDING");
        
        return loanRepository.save(loan);
    }

    public List<Loan> getMyLoans() {
        User user = getCurrentUser();
        return loanRepository.findByUserId(user.getUserId());
    }

    public Loan approveLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new CustomException("Loan not found"));
        loan.setLoanStatus("APPROVED");
        return loanRepository.save(loan);
    }
}
