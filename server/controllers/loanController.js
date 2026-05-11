const prisma = require('../config/prisma');

/**
 * ZAMBIA Z - MPESA STK CALLBACK HANDLER
 * Handles Safaricom's POST request after a user enters their PIN.
 */
const mpesaCallback = async (req, res, next) => {
  try {
    const { Body } = req.body;

    // 1. Basic validation of Safaricom's response structure
    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ message: "Invalid callback payload" });
    }

    const { 
      MerchantRequestID, 
      CheckoutRequestID, 
      ResultCode, 
      ResultDesc, 
      CallbackMetadata 
    } = Body.stkCallback;

    console.log(`Processing M-PESA Callback for CheckoutID: ${CheckoutRequestID} | Result: ${ResultCode}`);

    // 2. Handle Failed Payments (ResultCode !== 0)
    if (ResultCode !== 0) {
      await prisma.transaction.updateMany({
        where: { mpesaResponse: { contains: CheckoutRequestID } },
        data: { 
          status: 'failed',
          rejectionReason: ResultDesc 
        }
      });
      return res.status(200).json({ success: true }); // Always tell Safaricom "200 OK"
    }

    // 3. Handle Successful Payments (ResultCode === 0)
    // Extract metadata values (Amount, Receipt, Phone)
    const metadata = CallbackMetadata.Item.reduce((acc, item) => {
      acc[item.Name] = item.Value;
      return acc;
    }, {});

    const amount = metadata.Amount;
    const mpesaReceipt = metadata.MpesaReceiptNumber;
    const phoneNumber = metadata.PhoneNumber;

    // 4. Atomic Database Update (Transaction)
    // We update the transaction record AND the loan record together
    await prisma.$transaction(async (tx) => {
      // Find the specific transaction waiting for this callback
      const transaction = await tx.transaction.findFirst({
        where: { 
          mpesaResponse: { contains: CheckoutRequestID },
          status: 'pending' 
        }
      });

      if (!transaction) {
        console.warn(`No pending transaction found for CheckoutID: ${CheckoutRequestID}`);
        return;
      }

      // Update Transaction status
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          mpesaTransactionId: mpesaReceipt,
          amount: amount,
          phoneNumber: phoneNumber.toString()
        }
      });

      // Update the associated Loan record
      await tx.loan.update({
        where: { id: transaction.loanId },
        data: {
          feePaid: true,
          mpesaTransactionId: mpesaReceipt,
          // If this was an auto-approval flow, we might move status to 'approved' here
        }
      });

      console.log(`Successfully settled Loan ID: ${transaction.loanId} with Receipt: ${mpesaReceipt}`);
    });

    // 5. Respond to Safaricom
    // Safaricom expects a 200 OK response to stop resending the callback.
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Success"
    });

  } catch (error) {
    console.error("M-PESA Callback Error:", error);
    // Even if our code fails, we send 200 to Safaricom to prevent infinite retries,
    // but we log the error for our own debugging.
    res.status(200).json({ ResultCode: 1, ResultDesc: "Internal Error" });
  }
};

module.exports = { mpesaCallback };
