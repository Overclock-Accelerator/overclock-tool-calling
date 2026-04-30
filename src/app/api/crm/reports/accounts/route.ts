import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateCrmApiKey } from '@/lib/crm-auth';

export async function GET(request: NextRequest) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');

    // Build accounts query
    let accountsQuery = supabaseAdmin.from('accounts').select('*');
    if (accountId) {
      accountsQuery = accountsQuery.eq('id', accountId);
    }

    const { data: accounts, error: accountsError } = await accountsQuery;

    if (accountsError) {
      return Response.json({ error: accountsError.message }, { status: 500 });
    }

    const allAccounts = accounts ?? [];

    // For each account, count open opportunities and get last activity
    const enrichedAccounts = await Promise.all(
      allAccounts.map(async (account) => {
        // Count open opportunities (stages that are not 'closed-won' or 'closed-lost')
        const { count } = await supabaseAdmin
          .from('opportunities')
          .select('*', { count: 'exact', head: true })
          .eq('account_id', account.id)
          .not('stage', 'in', '("closed-won","closed-lost")');

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
