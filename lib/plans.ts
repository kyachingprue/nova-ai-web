export const planIds = ["free", "pro", "team"] as const;
export type PlanId = (typeof planIds)[number];

export function parsePlan(value: string | null | undefined): PlanId | null {
  return planIds.find((plan) => plan === value) || null;
}

export function checkoutPath(plan: PlanId) {
  return `/checkout?plan=${plan}`;
}
