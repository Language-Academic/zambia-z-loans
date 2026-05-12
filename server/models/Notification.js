// Add this to your schema.prisma

enum NotificationType {
  LOAN_STATUS      // Approved, Rejected, Disbursed
  PAYMENT_REMINDER // Due date warnings
  REPAYMENT_CONFIRM // Payment received
  SECURITY_ALERT   // New login, password change
  PROMOTIONAL      // Limit increases, new offers
}

enum NotificationPriority {
  LOW      // Marketing/Promos
  MEDIUM   // General status updates
  HIGH     // Repayment confirmations
  CRITICAL // Overdue notices, security alerts
}

model Notification {
  id          String               @id @default(uuid())
  
  // Relations
  userId      String
  user        User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Optional: Link to a specific loan to allow "Click-to-View" in Flutter
  loanId      String?
  loan        Loan?                @relation(fields: [loanId], references: [id])

  type        NotificationType
  priority    NotificationPriority @default(MEDIUM)
  
  title       String
  body        String               @db.Text
  
  // Tracking
  isRead      Boolean              @default(false)
  readAt      DateTime?            // Precise audit trail for when they saw it
  
  // Pro-Level: Metadata for Flutter deep linking
  // Example: { "screen": "loan_details", "loanId": "..." }
  metadata    Json?                @default("{}")

  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  @@index([userId, isRead])
  @@index([createdAt(sort: Desc)])
}
