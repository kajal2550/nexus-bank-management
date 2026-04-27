package com.bank.backend.service;

import com.bank.backend.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void publishTransactionEvent(String message) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.TRANSACTION_QUEUE, message);
    }

    @RabbitListener(queues = RabbitMQConfig.TRANSACTION_QUEUE)
    public void consumeTransactionEvent(String message) {
        System.out.println("==================================================");
        System.out.println("NOTIFICATION SENT (Email/SMS simulation): ");
        System.out.println(message);
        System.out.println("==================================================");
    }
}
