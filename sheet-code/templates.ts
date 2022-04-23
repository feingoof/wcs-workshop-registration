function paymentInfo(price) {
  return `Hi, and thanks for signing up for our weekend course!

You have received a spot. To complete your registration, we just need your payment. Payment must be done within 24 hours after receiving this email, or your spot may be given to the next person on the waiting list.

We prefer payment by Vipps. If you can not pay by Vipps, contact us and we'll work something out.

Vipps number: 746109 (NTNUi Dans > NTNUI West Coast Swing Kurs)

Price: ${price} NOK

After paying, please reply to this email with a screenshot of the Vipps receipt.


Best regards,
NTNUI Dance WCS`
}

function sendEmails() {
  const title = "NTNUI Dance WCS Weekend Course Registration - Payment Information";

  [
    
  ].forEach(([address, price]) => {
    const body = paymentInfo(price);
    Logger.log(`address=${address}, price=${price}, body = ${body}`)
    GmailApp.sendEmail(address, title, body, {
      name: "NTNUI Dance WCS",
    })
  })
}
