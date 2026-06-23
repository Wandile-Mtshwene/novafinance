import { db } from "@/lib/db";
import { cashflowForecasts, transactions } from "@/lib/db/schema";
import { eq, and, desc, sum, gte, lte } from "drizzle-orm";

export async function getCashflowForecasts(organizationId: string, year?: number) {
  const conditions = [eq(cashflowForecasts.organization_id, organizationId)];
  if (year) conditions.push(eq(cashflowForecasts.forecast_year, year));
  return db
    .select()
    .from(cashflowForecasts)
    .where(and(...conditions))
    .orderBy(cashflowForecasts.forecast_year, cashflowForecasts.forecast_month);
}

export async function upsertCashflowForecast(data: typeof cashflowForecasts.$inferInsert) {
  const [forecast] = await db
    .insert(cashflowForecasts)
    .values(data)
    .onConflictDoUpdate({
      target: [cashflowForecasts.organization_id, cashflowForecasts.forecast_year, cashflowForecasts.forecast_month],
      set: {
        projected_inflows: data.projected_inflows,
        projected_outflows: data.projected_outflows,
        projected_closing: data.projected_closing,
        notes: data.notes,
        updated_at: new Date(),
      },
    })
    .returning();
  return forecast;
}

export async function getCashflowSummary(organizationId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [current] = await db
    .select()
    .from(cashflowForecasts)
    .where(
      and(
        eq(cashflowForecasts.organization_id, organizationId),
        eq(cashflowForecasts.forecast_year, year),
        eq(cashflowForecasts.forecast_month, month)
      )
    )
    .limit(1);

  return {
    current_month: current ?? null,
    month,
    year,
  };
}
