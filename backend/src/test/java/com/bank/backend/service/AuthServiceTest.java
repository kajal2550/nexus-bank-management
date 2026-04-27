package com.bank.backend.service;

import com.bank.backend.config.JwtUtil;
import com.bank.backend.dto.AuthRequest;
import com.bank.backend.entity.User;
import com.bank.backend.exception.CustomException;
import com.bank.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @InjectMocks
    private AuthService authService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setEmail("test@test.com");
        mockUser.setFailedLoginAttempts(2);
        mockUser.setLocked(false);
    }

    @Test
    void testLoginLocksAccountAfter3FailedAttempts() {
        AuthRequest request = new AuthRequest("test@test.com", "wrongpassword");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad Credentials"));

        Exception exception = assertThrows(CustomException.class, () -> {
            authService.login(request);
        });

        assertTrue(exception.getMessage().contains("Attempt 3 of 3"));
        assertTrue(mockUser.isLocked());
        verify(userRepository, times(1)).save(mockUser);
    }
}
