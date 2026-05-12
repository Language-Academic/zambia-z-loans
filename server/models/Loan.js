// schema.prisma

enum LoanStatus {
  PENDING
  VERIFICATION
  APPROVED
  REJECTED
  ACTIVE
  CLOSED
  DEFAULTED
}

enum DisbursementStatus {
  IDLE
  PROCESSING
  COMPLETED
  FAILED
}

enum RepaymentStatus {
  UNPAID
  PARTIAL
  FULL
  OVERDUE
}

model Loan {
  id                   String             @id @default(uuid())
  userId               String
  user                 User               @relation(fields: [userId], references: [id])
  
  // Financial Core (Using Decimal for precision in money)
  principalAmount      Float              // Original amount borrowed
  interestRate         Float              @default(15.0) // Percentage
  serviceFee           Float              @default(0.0)
  penaltyAmount        Float              @default(0.0)
  totalRepaid          Float              @default(0.0)
  
  // Status Management
  status               LoanStatus         @default(PENDING)
  repaymentStatus      RepaymentStatus    @default(UNPAID)
  
  // Application Fee (Zambia Z Specific)
  feePaid              Boolean            @default(false)
  feeMpesaRef          String?            @unique
  
  // Approval / Audit Trail
  isAutoApproved       Boolean            @default(false)
  approvedByAdminId    String?
  approvedByAdmin      User?              @relation("AdminApprovals", fields: [approvedByAdminId], references: [id])
  rejectionReason      String?
  
  // Disbursement (B2C)
  disbursementStatus   DisbursementStatus @default(IDLE)
  disbursementRef      String?            @unique // M-Pesa B2C TransID
  
  // Timestamps
  dueDate              DateTime?
  disbursedAt         DateTime?
  fullyPaidAt          DateTime?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  @@index([userId, status])
  @@index([repaymentStatus, dueDate])
}
