interface SignupRow {
  // Tidsmerke	E-postadresse	Full name	Membership	Classes	Role	Partner's name (optional)
  timestamp: Date,
  email: string,
  name: string,
  membership: string,
  classes: string,
  role: string,
  partner?: string,
}

interface StateRow {
  timestamp: string
  email: string
  name: string
  membership: boolean
  classes: WsClass[]
  role: Role
  partner: string | undefined
  price: number
  state: State
  partnerConfirmed: boolean
  paymentConfirmed: boolean
  cancelled: boolean
  note: string
  reevaluate: boolean
}

type Role = "Leader" | "Follower"

type State = "NEW"
  | "PARTNER_SIGNUP"
  | "WAITING_LIST"
  | "AWAITING_PAYMENT"
  | "CANCELLED"
  | "CONFIRMED"

type WsClass = "CLASS_1" | "CLASS_2"

interface EventParameters {
  maxImbalance: number,
  maxParticipants: number,
  leaderBias: number,
  followerBias: number,
}

interface TakenSpots {
  leaders: number,
  followers: number,
}

type ChangeEvent = "PAYMENT_RECEIVED"
  | "PARTNER_CONFIRMED"
  | "CANCELLED"
  | "EVALUATE"