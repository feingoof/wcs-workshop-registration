function countTakenSpotsByRole(): TakenSpots {
    const claimedSpots = getAllStates().map(stateToFsm).filter(s => s.claimsSpot)
    const numLeaders = claimedSpots.filter(s => s.stateRow.role === "Leader").length
    const numFollowers = claimedSpots.filter(s => s.stateRow.role === "Follower").length
    const params = getParameters()

    return {
        leaders: numLeaders + params.leaderBias,
        followers: numFollowers + params.followerBias,
    }
}

/**
 * Check if admitting one person of the given role will cause an unacceptable
 * role imbalance.
 */
function wontBreakBalance(role: Role): boolean {
    const params = getParameters()
    const { leaders, followers } = countTakenSpotsByRole()
    if (role === "Leader") {
        return (leaders + 1) < (followers * params.maxImbalance)
    } else {
        return (followers + 1) < (leaders * params.maxImbalance)
    }
}

function canAdmit(role: Role): boolean {
    Logger.log("checking if we can admit one more " + role)
    const freeSpots = countFreeSpots()
    const spotLeft = freeSpots > 0
    Logger.log(`free spots: ${freeSpots}, wontBreakBalance: ${wontBreakBalance(role)}`)
    return (spotLeft && wontBreakBalance(role))
}

function evaluateNewState(fsm: NewState | WaitingListState): FsmState {
    Logger.log("Evaluating new/waiting list state", fsm, fsm.stateRow)

    const mentionedPartners = () => getAllFsms()
        .filter(s => s.stateName == "PARTNER_SIGNUP")
        .map(s => s.stateRow.partner)

    if (mentionedPartners().includes(fsm.stateRow.name)) {
        return new PartnerSignupState(fsm.stateRow)
    }
    else if (canAdmit(fsm.stateRow.role)) {
        return new AwaitingPaymentState(fsm.stateRow)
    }
    else if (fsm.stateRow.partner) {
        return new PartnerSignupState(fsm.stateRow)
    }
    else {
        return new WaitingListState(fsm.stateRow)
    }
}

interface FsmState {
    stateName: State
    claimsSpot: boolean
    stateRow: StateRow
    save: () => void
    cancel: () => void
}

abstract class BaseState implements FsmState {
    abstract stateName: State
    abstract claimsSpot: boolean
    stateRow: StateRow
    save = () => {
        Logger.log("Saving", this)
        writeStateRow({
            ...this.stateRow,
            state: this.stateName
        })
    }
    cancel = () => {
        Logger.log("Cancelled", this)
        new CancelledState({
            ...this.stateRow,
            cancelled: true
        }).save()
        sendEmail(
            this.stateRow.email,
            emailTitle("Cancellation"),
            emailBody("Your registration has been cancelled.")
        )
    }

    constructor(rawData: StateRow) {
        this.stateRow = rawData
    }
}

class NewState extends BaseState {
    stateName = "NEW" as State
    claimsSpot = false

    evaluate = () => {
        Logger.log("Initial evaluation", this, this.stateRow)
        const newState = evaluateNewState(this)
        Logger.log("New state", newState)
        if (newState.stateName == "PARTNER_SIGNUP") {
            const personClaimsPartner = !!newState.stateRow.partner
            if (personClaimsPartner) {
                sendEmail(
                    this.stateRow.email,
                    emailTitle("Partner confirmation"),
                    emailBody(SUBJECT_CLAIMS_PARTNER)
                )
            } else {
                // This person's name was listed as someone else's partner.
                // Hold it for manual processing.
            }
            sendEmail(
                adminEmailAddress,
                emailTitle("Manual intervention required"),
                JSON.stringify(newState)
            )
        }
        if (newState.stateName == "WAITING_LIST") {
            sendEmail(
                this.stateRow.email,
                emailTitle("Waiting list"),
                emailBody(waitingListBody())
            )
        }
        if (newState.stateName == "AWAITING_PAYMENT") {
            sendPaymentInfo(
                this.stateRow.email,
                this.stateRow.price
            )
        }
        newState.save()
        return newState
    }
}

function sendPaymentInfo(address: string, price: number) {
    sendEmail(
        address,
        emailTitle("Payment information"),
        emailBody(paymentInfo(price))
    )
}


const confirmPartner = (fsm: FsmState) => {
    Logger.log("Partner confirmed", fsm)
    const newState = new AwaitingPaymentState(fsm.stateRow)
    sendPaymentInfo(fsm.stateRow.email, fsm.stateRow.price)
    newState.save()
}

class PartnerSignupState extends BaseState {
    stateName = "PARTNER_SIGNUP" as State
    claimsSpot = true
    partnerConfirmed = () => confirmPartner(this)

}

class WaitingListState extends BaseState {
    stateName = "WAITING_LIST" as State
    claimsSpot = false

    partnerConfirmed = () => confirmPartner(this)

    reevaluate = () => {
        Logger.log("Reevaluating waiting list", this)
        const newState = evaluateNewState(this)
        if (newState.stateName == "AWAITING_PAYMENT") {
            sendPaymentInfo(this.stateRow.email, this.stateRow.price)
        }
        newState.save()
        return newState
    }
}

class AwaitingPaymentState extends BaseState {
    stateName = "AWAITING_PAYMENT" as State
    claimsSpot = true

    acknowledgePayment = () => {
        Logger.log("Payment confirmed", this)
        const newState = new ConfirmedState(this.stateRow)
        sendEmail(
            this.stateRow.email,
            emailTitle("Registration complete"),
            emailBody("We have received your payment, and your registration is now complete. We look forward to seeing you!")
        )
        newState.save()
    }
}

class CancelledState extends BaseState {
    stateName = "CANCELLED" as State
    claimsSpot = false
}

class ConfirmedState extends BaseState {
    stateName = "CONFIRMED" as State
    claimsSpot = true
}

function stateToFsm(state: StateRow): FsmState {
    switch (state.state) {
        case "NEW": return new NewState(state)
        case "PARTNER_SIGNUP": return new PartnerSignupState(state)
        case "WAITING_LIST": return new WaitingListState(state)
        case "AWAITING_PAYMENT": return new AwaitingPaymentState(state)
        case "CANCELLED": return new CancelledState(state)
        case "CONFIRMED": return new ConfirmedState(state)
    }
}
