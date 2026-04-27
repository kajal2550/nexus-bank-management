package com.bank.backend.service;

import com.bank.backend.entity.Account;
import com.bank.backend.entity.User;
import com.bank.backend.repository.AccountRepository;
import com.bank.backend.repository.TransactionRepository;
import com.bank.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AccountService accountService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    private User mockUser;
    private Account mockFromAccount;
    private Account mockToAccount;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setUserId(1L);
        mockUser.setEmail("test@test.com");
        mockUser.setFullName("Test User");

        mockFromAccount = new Account();
        mockFromAccount.setAccountId(1L);
        mockFromAccount.setAccountNumber("AC123");
        mockFromAccount.setBalance(5000.0);
        mockFromAccount.setUser(mockUser);

        mockToAccount = new Account();
        mockToAccount.setAccountId(2L);
        mockToAccount.setAccountNumber("AC456");
        mockToAccount.setBalance(1000.0);
        mockToAccount.setUser(mockUser);
    }

    private void mockSecurityContext() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@test.com");
        SecurityContextHolder.setContext(securityContext);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
    }

    @Test
    void testFundTransferSuccess() {
        mockSecurityContext();
        when(accountRepository.findByAccountNumber("AC123")).thenReturn(Optional.of(mockFromAccount));
        when(accountRepository.findByAccountNumber("AC456")).thenReturn(Optional.of(mockToAccount));

        accountService.fundTransfer("AC123", "AC456", 2000.0);

        assertEquals(3000.0, mockFromAccount.getBalance());
        assertEquals(3000.0, mockToAccount.getBalance());
        
        verify(accountRepository, times(2)).save(any(Account.class));
        verify(transactionRepository, times(2)).save(any());
        verify(notificationService, times(1)).publishTransactionEvent(anyString());
    }

    @Test
    void testFundTransferInsufficientBalance() {
        mockSecurityContext();
        when(accountRepository.findByAccountNumber("AC123")).thenReturn(Optional.of(mockFromAccount));
        when(accountRepository.findByAccountNumber("AC456")).thenReturn(Optional.of(mockToAccount));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            accountService.fundTransfer("AC123", "AC456", 10000.0);
        });

        assertEquals("Insufficient balance", exception.getMessage());
        verify(accountRepository, never()).save(any(Account.class));
    }
}
