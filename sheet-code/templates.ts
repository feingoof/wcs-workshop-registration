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

const firstGreeting = "Hi, and thanks for signing up for our workshop!"

/** Waiting list message */
const waitingListBody = () => `${firstGreeting}

To ensure balance between roles in the classes, we have had to put in place a waiting list. Unfortunately, you have been put on this waiting list.

We will send you a new email once enough people of the opposite role have signed up that you are taken off the waiting list. Alternatively, you can get someone of the opposite role to write your name in the partner field when signing up. You will then immediately move past the waiting list.`


/** Body text for payment info */
const paymentInfo = (price: number) => `${firstGreeting}

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

/** The subject wrote something in the partner field */
const SUBJECT_CLAIMS_PARTNER = firstGreeting
  + "\n\n"
  + "There is a waiting list, but since you signed up with a partner, you will skip "
  + "the waiting list as soon as we have confirmed your partner's registration. "
  + "Please note that it is necessary that your partner registers as well, "
  + "otherwise we cannot complete your registration."
