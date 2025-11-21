// backend/tests/balances.test.ts
import { Decimal } from "@prisma/client/runtime/library";
import {
  buildBalanceSummary,
  makeAccountWithSummary
} from "../src/helpers/accounts";

type Tx = {
  amount: Decimal
  date: Date;
};

describe("buildBalanceSummary", () => {
  it("returns zero balances and empty series when no transactions", () => {
    const summary = buildBalanceSummary(0, [], {
      today: new Date("2025-01-10T00:00:00Z")
    });

    expect(summary.currentBalance).toBe(0);
    expect(summary.forecastBalance).toBe(0);
    expect(summary.dailySeries).toEqual([]);
  });

  it("handles only past transactions (all before 'today')", () => {
    const today = new Date("2025-01-10T00:00:00Z");

    const txs: Tx[] = [
      { amount: new Decimal(50), date: new Date("2025-01-08T10:00:00Z") },
      { amount: new Decimal(-20), date: new Date("2025-01-09T15:00:00Z") }
    ];

    const summary = buildBalanceSummary(100, txs, { today });

    // current: starting + all past tx
    // 100 + 50 - 20 = 130
    expect(summary.currentBalance).toBe(130);

    // forecast: same as current, since no future tx
    expect(summary.forecastBalance).toBe(130);

    // daily series: end-of-day balances
    expect(summary.dailySeries).toEqual([
      { date: "2025-01-08", balance: 150 }, // 100 + 50
      { date: "2025-01-09", balance: 130 } // 150 - 20
    ]);
  });

  it("separates currentBalance and forecastBalance with future transactions", () => {
    const today = new Date("2025-01-10T00:00:00Z");

    const txs: Tx[] = [
      // past
      { amount: new Decimal(100), date: new Date("2025-01-08T10:00:00Z") },
      // future
      { amount: new Decimal(-50), date: new Date("2025-01-12T10:00:00Z") }
    ];

    const summary = buildBalanceSummary(200, txs, { today });

    // currentBalance: only tx < tomorrowStart(today)
    // tomorrowStart(2025-01-10) = 2025-01-11 00:00
    // so include 2025-01-08 tx, exclude 2025-01-12 tx
    // 200 + 100 = 300
    expect(summary.currentBalance).toBe(300);

    // forecastBalance: all tx
    // 200 + 100 - 50 = 250
    expect(summary.forecastBalance).toBe(250);

    // daily series includes both days with cumulative balance
    expect(summary.dailySeries).toEqual([
      { date: "2025-01-08", balance: 300 }, // 200 + 100
      { date: "2025-01-12", balance: 250 } // 300 - 50
    ]);
  });

  it("uses last transaction of the day for daily balance", () => {
    const today = new Date("2025-01-10T00:00:00Z");

    const txs: Tx[] = [
      { amount: new Decimal(10), date: new Date("2025-01-05T09:00:00Z") },
      { amount: new Decimal(5), date: new Date("2025-01-05T18:00:00Z") }, // same day
      { amount: new Decimal(-3), date: new Date("2025-01-06T12:00:00Z") }
    ];

    const summary = buildBalanceSummary(0, txs, { today });

    // running:
    // day 5: 0 + 10 = 10, then +5 = 15 → end-of-day 15
    // day 6: 15 - 3 = 12
    expect(summary.currentBalance).toBe(12);
    expect(summary.forecastBalance).toBe(12);

    expect(summary.dailySeries).toEqual([
      { date: "2025-01-05", balance: 15 },
      { date: "2025-01-06", balance: 12 }
    ]);
  });

  it("respects ignoreTx option (no dailySeries, but balances still computed)", () => {
    const today = new Date("2025-01-10T00:00:00Z");

    const txs: Tx[] = [
      { amount: new Decimal(50), date: new Date("2025-01-08T10:00:00Z") },
      { amount: new Decimal(25), date: new Date("2025-01-09T10:00:00Z") }
    ];

    const summary = buildBalanceSummary(100, txs, {
      today,
      ignoreTx: true
    });

    // balances still computed as normal
    // current: 100 + 50 + 25 = 175
    expect(summary.currentBalance).toBe(175);
    expect(summary.forecastBalance).toBe(175);

    // but series is intentionally empty
    expect(summary.dailySeries).toEqual([]);
  });

  it("accepts startingBalance as string", () => {
    const today = new Date("2025-01-10T00:00:00Z");
    const txs: Tx[] = [{ amount: new Decimal(25), date: new Date("2025-01-09T10:00:00Z") }];

    const summary = buildBalanceSummary("200.50", txs, { today });

    // 200.50 + 25 = 225.5
    expect(summary.currentBalance).toBeCloseTo(225.5);
    expect(summary.forecastBalance).toBeCloseTo(225.5);
  });
});

describe("makeAccountWithSummary", () => {
  it("merges account and summary correctly", () => {
    const account = {
      id: 1,
      name: "Test",
      currency: "USD",
      startingBalance: "100.00",
      description: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    const summary = {
      currentBalance: 150,
      forecastBalance: 170,
      dailySeries: [
        { date: "2025-01-01", balance: 120 },
        { date: "2025-01-02", balance: 150 }
      ]
    };

    const merged = makeAccountWithSummary(account, summary);

    expect(merged.id).toBe(1);
    expect(merged.name).toBe("Test");
    expect(merged.currentBalance).toBe(150);
    expect(merged.forecastBalance).toBe(170);
    expect(merged.dailySeries).toEqual(summary.dailySeries);
  });
});
