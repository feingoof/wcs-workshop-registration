interface SignupRow {
  // Tidsmerke	E-postadresse	Full name	Membership	Classes	Role	Partner's name (optional)
  timestamp: string,
  email: string,
  name: string,
  membership: string,
  classes: string,
  role: string,
  partner?: string,
}

interface StateRow {
  // Tidsmerke	E-postadresse	Full name	Membership	Classes	Role 
  // Partner	State	Payment received	Payment reference
  timestamp: string,
  email: string,
  name: string,
  membership: boolean,
  classes: WsClass[],
  role: Role,
  partner?: string,
  state: State,
  partnerConfirmed: boolean,
  paymentConfirmed: boolean,
  paymentReference?: string
}

type Role = "Leader" | "Follower"

type State = "NEW"
  | "PARTNER_SIGNUP"
  | "WAITING_LIST"
  | "AWAITING_PAYMENT"
  | "CANCELLED"
  | "CONFIRMED"

type WsClass = "CLASS_1" | "CLASS_2"

enum Foos {
    bar = "BAR"
}