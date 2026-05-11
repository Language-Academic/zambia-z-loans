export default function handler(req, res) {
  // Professional Fintech API Response
  const systemStatus = {
    app_name: "Zambia Z Loans",
    version: "1.0.0",
    status: "Operational",
    environment: process.env.NODE_ENV || "production",
    region: "Nairobi/KE",
    timestamp: new Date().toISOString(),
    services: {
      database: "Connected",
      payment_gateway: "Pesapal S3 Active",
      messaging: "Africa's Talking Ready"
    },
    message: "Zambia Z API Gateway is running securely."
  };

  // Return a 200 OK status with the professional JSON object
  res.status(200).json(systemStatus);
}
