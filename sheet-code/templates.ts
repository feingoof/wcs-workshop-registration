function sendEmail(
  recipient: string,
  title: string,
  body: string,
  options: GoogleAppsScript.Gmail.GmailAdvancedOptions = {}
) {
  const emailEnabled = true
  if (emailEnabled) {
    Logger.log(`Sending email
${recipient}
${title}
${body}`)
    GmailApp.sendEmail(recipient, title, body, {
      name: "NTNUI Dance WCS",
      ...options
    })
  } else {
    Logger.log(`Email disabled. Would have sent this:
${recipient}
${title}
${body}`)
  }
}

function emailTitle(type: string) {
  return `NTNUI Dance WCS Workshop Registration - ${type}`
}

function emailBody(body: string) {
  return `${body}


Best regards,
NTNUI Dance WCS`
}

/** Waiting list message */
const waitingListBody = () => `Hi, and thanks for signing up for our workshop!

To ensure balance between roles in the classes, we have had to put in place a waiting list. Unfortunately, you have been put on this waiting list.

We will send you a new email once enough people of the opposite role have signed up that you are taken off the waiting list. Alternatively, you can get someone of the opposite role to write your name in the partner field when signing up. You will then immediately move past the waiting list.`


/** Body text for payment info */
const paymentInfo = (price: number) => `Hi, and thanks for signing up for our workshop!

You have received a spot. To complete your registration, we just need your payment. Payment must be done within 24 hours after receiving this email, or your spot may be given to the next person on the waiting list.

We prefer payment by Vipps. If you can not pay by Vipps, contact us and we'll work something out.

Vipps number: 746109 (NTNUi Dans > NTNUI West Coast Swing Kurs)

Price: ${price} NOK

After paying, please reply to this email with a screenshot of the Vipps receipt.`


/** Body text for payment info */
const paymentInfoAfterWaiting = (price: number) => `A spot has opened up for you! To complete your registration, we just need your payment. Payment must be done within 24 hours after receiving this email, or your spot may be given to the next person on the waiting list.

We prefer payment by Vipps. If you can not pay by Vipps, contact us and we'll work something out.

Vipps number: 746109 (NTNUi Dans > NTNUI West Coast Swing Kurs)

Price: ${price} NOK

After paying, please reply to this email with a screenshot of the Vipps receipt.`
