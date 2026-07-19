import { User } from "../models/user.model.js";

const rzpKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_T7vnV7hyvL2u1X";
const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET || "MISSING_SECRET";

const rzpHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Basic ' + Buffer.from(`${rzpKeyId}:${rzpKeySecret}`).toString('base64')
};

export const withdrawFunds = async (req, res) => {
  try {
    const userId = req.id;
    const { amount, accountName, accountNumber, ifscCode } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: "Minimum withdrawal amount is ₹100", success: false });
    }
    if (!accountName || !accountNumber || !ifscCode) {
      return res.status(400).json({ message: "Bank details are required", success: false });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found", success: false });
    if (user.walletBalance < amount) return res.status(400).json({ message: "Insufficient balance", success: false });

    // 1. Create a Contact in RazorpayX
    const contactRes = await fetch("https://api.razorpay.com/v1/contacts", {
      method: "POST", headers: rzpHeaders,
      body: JSON.stringify({ name: accountName, email: user.email, type: "vendor", reference_id: userId.toString() })
    });
    const contact = await contactRes.json();
    if (contact.error) throw new Error(contact.error.description || "Failed to create Contact");

    // 2. Create a Fund Account linked to the Contact
    const fundAccountRes = await fetch("https://api.razorpay.com/v1/fund_accounts", {
      method: "POST", headers: rzpHeaders,
      body: JSON.stringify({
        contact_id: contact.id,
        account_type: "bank_account",
        bank_account: { name: accountName, ifsc: ifscCode, account_number: accountNumber }
      })
    });
    const fundAccount = await fundAccountRes.json();
    if (fundAccount.error) throw new Error(fundAccount.error.description || "Failed to create Fund Account");

    // 3. Issue the Payout
    const payoutRes = await fetch("https://api.razorpay.com/v1/payouts", {
      method: "POST", headers: rzpHeaders,
      body: JSON.stringify({
        account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER || "2323230026601614",
        fund_account_id: fundAccount.id,
        amount: amount * 100, // paise
        currency: "INR",
        mode: "IMPS",
        purpose: "payout",
        queue_if_low_balance: true,
        reference_id: `wd_${Date.now()}_${userId}`
      })
    });
    const payout = await payoutRes.json();
    if (payout.error) throw new Error(payout.error.description || "Failed to create Payout");

    // 4. Deduct balance and save history
    user.walletBalance -= amount;
    user.withdrawalHistory.push({ amount, payoutId: payout.id, status: payout.status });
    await user.save();

    return res.status(200).json({ message: "Withdrawal processed successfully", success: true, newBalance: user.walletBalance, payout });

  } catch (error) {
    console.error("Razorpay Payout Error:", error.message);
    return res.status(500).json({ message: error.message || "Failed to process withdrawal", success: false });
  }
};
