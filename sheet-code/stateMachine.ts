interface FsmState {
    getStateName: () => State
}

class NewState implements FsmState {
    getStateName: () => "NEW"
}

class PartnerSignupState implements FsmState {
    getStateName: () => "PARTNER_SIGNUP"
}

class WaitingListState implements FsmState {
    getStateName: () => "WAITING_LIST"
}

class AwaitingPaymentState implements FsmState {
    getStateName: () => "AWAITING_PAYMENT"
}

class CancelledState implements FsmState {
    getStateName: () => "CANCELLED"
}

class ConfirmedState implements FsmState {
    getStateName: () => "CONFIRMED"
}