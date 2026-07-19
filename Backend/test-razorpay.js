const API_URL = 'http://localhost:8000/api/v1';

async function runTest() {
  console.log("Starting Razorpay Payouts Test...");
  const user = { username: 'testuser' + Date.now(), email: `test${Date.now()}@example.com`, password: 'password123' };

  try {
    console.log("1. Registering test user...");
    await fetch(`${API_URL}/user/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) });

    console.log("2. Logging in...");
    const loginRes = await fetch(`${API_URL}/user/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, password: user.password }) });
    const loginData = await loginRes.json();
    const token = loginRes.headers.get('set-cookie')?.split(';')[0];
    const userId = loginData.user._id;

    console.log("3. Giving user ₹150 wallet balance via API...");
    const topupRes = await fetch(`${API_URL}/payment/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: token }
    });
    const topupData = await topupRes.json();
    console.log("Wallet balance updated:", topupData);

    console.log("4. Requesting Withdrawal via RazorpayX Payouts...");
    const withdrawRes = await fetch(`${API_URL}/payment/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: token },
      body: JSON.stringify({
        amount: 100,
        accountName: 'Test Account',
        accountNumber: '2323230058869894', // Using Razorpay dummy account
        ifscCode: 'HDFC0001234'
      })
    });
    const withdrawData = await withdrawRes.json();
    console.log("Withdrawal Response:", withdrawData);

    if (withdrawData.success) {
      console.log("✅ SUCCESS: Razorpay successfully processed the payout!");
    } else {
      console.log("❌ FAILED: Razorpay payout failed.");
    }

  } catch (error) {
    console.error("Test Error:", error);
  }
}
runTest();
