export interface Member {
  readonly id: string
  readonly name: string
}

export interface Expense {
  readonly id: string
  readonly name: string
  readonly amountCents: number
  readonly paidById: string
  readonly participantIds: string[]
}

export interface Gathering {
  readonly id: string
  readonly name: string
  readonly members: Member[]
  readonly expenses: Expense[]
}

export interface Transfer {
  readonly fromMemberId: string
  readonly toMemberId: string
  readonly amountCents: number
}
