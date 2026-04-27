package bankmanagement;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Bank bank = new Bank();
        boolean running = true;

        System.out.println("=========================================");
        System.out.println("   WELCOME TO THE BANK MANAGEMENT SYSTEM   ");
        System.out.println("=========================================");

        while (running) {
            System.out.println("\nSelect an option:");
            System.out.println("1. Create New Account");
            System.out.println("2. Deposit Money");
            System.out.println("3. Withdraw Money");
            System.out.println("4. Check Balance");
            System.out.println("5. View Account Details");
            System.out.println("6. Exit");
            System.out.print("Enter your choice (1-6): ");

            int choice;
            try {
                choice = Integer.parseInt(scanner.nextLine());
            } catch (NumberFormatException e) {
                System.out.println("Invalid input. Please enter a number between 1 and 6.");
                continue;
            }

            switch (choice) {
                case 1:
                    System.out.print("Enter Account Holder Name: ");
                    String name = scanner.nextLine();
                    System.out.print("Enter Initial Deposit Amount: $");
                    double initialDeposit;
                    try {
                        initialDeposit = Double.parseDouble(scanner.nextLine());
                        bank.createAccount(name, initialDeposit);
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid amount. Account creation failed.");
                    }
                    break;

                case 2:
                    System.out.print("Enter Account Number: ");
                    String accNumDeposit = scanner.nextLine();
                    System.out.print("Enter Amount to Deposit: $");
                    try {
                        double depositAmount = Double.parseDouble(scanner.nextLine());
                        bank.deposit(accNumDeposit, depositAmount);
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid amount.");
                    }
                    break;

                case 3:
                    System.out.print("Enter Account Number: ");
                    String accNumWithdraw = scanner.nextLine();
                    System.out.print("Enter Amount to Withdraw: $");
                    try {
                        double withdrawAmount = Double.parseDouble(scanner.nextLine());
                        bank.withdraw(accNumWithdraw, withdrawAmount);
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid amount.");
                    }
                    break;

                case 4:
                    System.out.print("Enter Account Number: ");
                    String accNumBalance = scanner.nextLine();
                    bank.checkBalance(accNumBalance);
                    break;

                case 5:
                    System.out.print("Enter Account Number: ");
                    String accNumDetails = scanner.nextLine();
                    bank.displayAccountDetails(accNumDetails);
                    break;

                case 6:
                    System.out.println("Thank you for using the Bank Management System. Goodbye!");
                    running = false;
                    break;

                default:
                    System.out.println("Invalid choice. Please select an option from 1 to 6.");
            }
        }
        scanner.close();
    }
}
