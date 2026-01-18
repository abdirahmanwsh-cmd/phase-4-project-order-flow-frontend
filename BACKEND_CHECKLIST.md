# Backend Payment Integration Checklist

## 🔍 Things to Check on Your Backend

### 1. Payment Status Endpoint
**URL:** `GET /api/payments/status/{checkout_request_id}`

The frontend is polling this endpoint every 3 seconds. Check what it returns:

```bash
# Test this in your backend terminal:
curl http://localhost:5555/api/payments/status/YOUR_CHECKOUT_REQUEST_ID
```

### 2. Expected Response Format

The frontend checks for these status values in this order:

```javascript
// From the response, it looks for:
response.status
response.ResultCode
response.result_code
response.payment_status
response.data.status
response.data.ResultCode
response.data.result_code
```

### 3. Success Status Values

Your backend should return ONE of these for successful payments:
- `status: "completed"`
- `status: "success"`
- `status: "SUCCESS"`
- `status: "paid"`
- `status: "PAID"`
- `ResultCode: "0"` (string zero)
- `ResultCode: 0` (number zero)

### 4. Failure Status Values

For failed payments, return ONE of these:
- `status: "failed"` or `"FAILED"`
- `status: "cancelled"` or `"CANCELED"`
- `status: "insufficient_funds"`
- `ResultCode: "1"` or `ResultCode: 1`

### 5. Backend Code to Check

Look for these in your backend:

#### a) M-Pesa Callback Handler
```python
# Check if your backend is receiving and storing M-Pesa callbacks
@app.route('/api/payments/mpesa/callback', methods=['POST'])
def mpesa_callback():
    # This should:
    # 1. Receive the callback from Safaricom
    # 2. Extract ResultCode and CheckoutRequestID
    # 3. Update your database with the payment status
    # 4. Return 200 OK to Safaricom
```

#### b) Status Check Endpoint
```python
@app.route('/api/payments/status/<checkout_request_id>')
def check_payment_status(checkout_request_id):
    # This should:
    # 1. Query your database for the payment record
    # 2. Return the current status
    # 3. Optionally query Safaricom's API if no callback received yet
```

### 6. Common Backend Issues

❌ **Issue:** Callback URL not registered with Safaricom
- **Solution:** Register your callback URL in Daraja Portal
- **URL Format:** `https://yourdomain.com/api/payments/mpesa/callback`

❌ **Issue:** Callback is received but not saved to database
- **Solution:** Add logging in your callback handler to verify it's being called

❌ **Issue:** Status endpoint returns pending forever
- **Solution:** Make sure callback handler updates the database correctly

❌ **Issue:** Using wrong CheckoutRequestID
- **Solution:** The ID returned from STK push initiation must match the one in status checks

### 7. Testing Steps

1. **Add logging to your backend:**
```python
# In your callback handler:
print("M-PESA CALLBACK RECEIVED:", request.json)

# In your status check endpoint:
print("STATUS CHECK FOR:", checkout_request_id)
print("RETURNING:", status_data)
```

2. **Test the flow:**
   - Place an order on frontend
   - Check your backend logs for "M-PESA CALLBACK RECEIVED"
   - If you see the callback, check what ResultCode it contains
   - If no callback appears, check your Safaricom callback URL registration

3. **Manual status check:**
```bash
# After placing an order, grab the CheckoutRequestID from browser console
# Then test your backend directly:
curl http://localhost:5555/api/payments/status/ws_CO_18012026123456789
```

### 8. Quick Fix Example

If your backend currently returns:
```json
{
  "payment": {
    "status": "completed"
  }
}
```

Change it to return the status at the top level:
```json
{
  "status": "completed",
  "payment": {
    "status": "completed"
  }
}
```

Or update your status endpoint to check M-Pesa's ResultCode:
```json
{
  "ResultCode": "0",
  "status": "success",
  "ResultDesc": "The service request is processed successfully."
}
```

### 9. Debugging Commands

Run these on your backend:

```bash
# Check if backend is running
curl http://localhost:5555/api/menu

# Check what your initiate endpoint returns
curl -X POST http://localhost:5555/api/payments/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{"phone": "254712345678", "amount": 100, "order_id": "test123"}'

# The response should contain CheckoutRequestID - use that in the next command

# Check status endpoint
curl http://localhost:5555/api/payments/status/CHECKOUT_REQUEST_ID_HERE
```

### 10. What to Share

If you need help, share:
1. ✅ What `/api/payments/status/{id}` returns (copy the full JSON)
2. ✅ Your backend logs when callback is received
3. ✅ Whether you see "M-PESA CALLBACK RECEIVED" in logs after paying
4. ✅ The CheckoutRequestID from browser console (look for "Polling payment status")
