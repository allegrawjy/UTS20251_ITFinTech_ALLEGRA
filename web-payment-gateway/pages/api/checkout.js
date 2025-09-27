// pages/api/checkout.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { items, customerName, email, phone, total } = req.body;

    // Setup Xendit
    const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY; // Taruh di .env.local
    
    if (!XENDIT_SECRET_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Xendit secret key not configured' 
      });
    }

    // Create invoice data
    const invoiceData = {
      external_id: `order-${Date.now()}`, // Unique ID
      payer_email: email,
      description: `Pesanan ${customerName}`,
      amount: total,
      currency: 'IDR',
      invoice_duration: 3600, // 1 hour
      success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/failed`,
      items: items.map(item => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        category: 'Food'
      })),
      customer: {
        given_names: customerName,
        email: email,
        mobile_number: phone
      },
      fees: [{
        type: 'Tax',
        value: Math.round(total * 0.1 / 1.1) // Tax sudah include di total
      }]
    };

    // Call Xendit API
    const xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    const invoiceResult = await xenditResponse.json();

    if (!xenditResponse.ok) {
      console.error('Xendit Error:', invoiceResult);
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to create invoice',
        error: invoiceResult
      });
    }

    // Return success dengan invoice URL
    res.status(200).json({
      success: true,
      invoiceUrl: invoiceResult.invoice_url,
      invoiceId: invoiceResult.id,
      externalId: invoiceResult.external_id
    });

  } catch (error) {
    console.error('Checkout API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}