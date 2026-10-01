import { NextRequest } from 'next/server';
import { sql, rows } from '@/lib/db';
import { validateCrmApiKey } from '@/lib/crm-auth';

export async function GET(request: NextRequest) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    // Build accounts query
    const { data: accounts, error: accountsError } = await rows(sql`
      SELECT row_to_json(a) AS row
      FROM accounts a
      WHERE (${accountId || null}::uuid IS NULL OR a.id = ${accountId || null}::uuid)
    `);

    if (accountsError) {
      return Response.json({ error: accountsError.message }, { status: 500 });
    }

    const allAccounts = (accounts ?? []) as {
      id: string;
      name: string;
      status: string | null;
      annual_contract_value: number | null;
      last_activity_date: string | null;
    }[];

    // For each account, count open opportunities and get last activity
    const enrichedAccounts = await Promise.all(
      allAccounts.map(async (account) => {
        // Count open opportunities (stages that are not 'closed-won' or 'closed-lost')
        const { data: countRows } = await rows(sql`
          SELECT count(*)::int AS row
          FROM opportunities
          WHERE account_id = ${account.id}::uuid
            AND NOT (stage IN ('closed-won', 'closed-lost'))
        `);
        const count = countRows?.[0] as number | undefined;

        // Calculate days since last activity
        const lastActivity = account.last_activity_date;
        let daysSinceActivity: number | null = null;
        if (lastActivity) {
          const lastDate = new Date(lastActivity);
          const now = new Date();
          daysSinceActivity = Math.floor(
            (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
          );
        }

        return {
          id: account.id,
          name: account.name,
          status: account.status,
          acv: account.annual_contract_value,
          open_opportunities: count ?? 0,
          last_activity: lastActivity,
          days_since_activity: daysSinceActivity,
        };
      }),
    );

    // Aggregate stats
    const totalAccounts = allAccounts.length;
    const byStatus: Record<string, number> = {};
    let totalAcv = 0;

    for (const account of allAccounts) {
      const status = account.status ?? 'unknown';
      byStatus[status] = (byStatus[status] ?? 0) + 1;
      totalAcv += account.annual_contract_value ?? 0;
    }

    return Response.json({
      total_accounts: totalAccounts,
      by_status: byStatus,
      total_acv: totalAcv,
      accounts: enrichedAccounts,
    });
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
