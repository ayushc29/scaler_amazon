import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = "https://scaler-amazon-one.vercel.app";

export async function sendOrderConfirmationEmail({
  email,
  name,
  orderId,
  items,
  total,
}) {
  try {
    const orderLink = `${BASE_URL}/orders/${orderId}`;

    const itemsHtml = items
      .map(
        (item) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">
              ${item.productName}
            </td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">
              ${item.quantity}
            </td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
              ₹${item.price}
            </td>
          </tr>
        `
      )
      .join("");

    await resend.emails.send({
      from: `Scaler Amazon <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Your Order #${orderId} is Confirmed`,
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f6f6;padding:20px;">
        
        <div style="max-width:600px;margin:auto;background:white;border-radius:8px;padding:24px;border:1px solid #eee;">
          
          <h2 style="margin-top:0;color:#111;">Thank you for your order, ${name}!</h2>

          <p style="color:#444;">
            Your order <strong>#${orderId}</strong> has been placed successfully.
          </p>

          <p style="color:#444;">
            You can view your order details and track updates using the button below.
          </p>

          <div style="text-align:center;margin:20px 0;">
            <a 
              href="${orderLink}" 
              style="
                background:#FFD814;
                color:#111;
                padding:12px 20px;
                text-decoration:none;
                border-radius:6px;
                font-weight:bold;
                display:inline-block;
              "
            >
              View Your Order
            </a>
          </div>

          <h3 style="margin-top:30px;">Order Summary</h3>

          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">
                  Product
                </th>
                <th style="text-align:center;padding:8px;border-bottom:2px solid #ddd;">
                  Qty
                </th>
                <th style="text-align:right;padding:8px;border-bottom:2px solid #ddd;">
                  Price
                </th>
              </tr>
            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top:20px;text-align:right;font-size:16px;">
            <strong>Total: ₹${total}</strong>
          </div>

          <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />

          <p style="font-size:13px;color:#666;">
            If you have any questions about your order, simply reply to this email.
          </p>

          <p style="font-size:13px;color:#666;">
            Thanks for shopping with us.
          </p>

          <p style="font-size:13px;color:#999;">
            © ${new Date().getFullYear()} Scaler Amazon Clone
          </p>

        </div>
      </div>
      `,
    });
  } catch (err) {
    console.error("Email sending failed:", err);
  }
}