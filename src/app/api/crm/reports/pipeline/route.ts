import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateCrmApiKey } from '@/lib/crm-auth';

export async function GET(request: NextRequest) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all opportunities with account name
    const { data: opportunities, error } = await supabaseAdmin
      .from('opportunities')
      .select('*, accounts(name)');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const allDeals = opportunities ?? [];

    // Calculate total pipeline value
    const totalPipelineValue = allDeals.reduce(
      (sum, d) => sum + (d.value ?? 0),
      0,
    );
    const totalDeals = allDeals.length;
    const averageDealSize = totalDeals > 0 ? totalPipelineValue / totalDeals : 0;

    // Group by stage
    const dealsByStage: Record<string, { count: number; value: number }> = {};
    for (const deal of allDeals) {
      const stage = deal.stage ?? 'unknown';
      if (!dealsByStage[stage]) {
        dealsByStage[stage] = { count: 0, value: 0 };
      }
      dealsByStage[stage].count += 1;
      dealsByStage[stage].value += deal.value ?? 0;
    }

    // Group by owner
    const dealsByOwner: Record<string, { count: number; value: number }> = {};
    for (const deal of allDeals) {
      const owner = deal.owner ?? 'Unassigned';
      if (!dealsByOwner[owner]) {
        dealsByOwner[owner] = { count: 0, value: 0 };
      }
      dealsByOwner[owner].count += 1;
      dealsByOwner[owner].value += deal.value ?? 0;
    }

    // Top 5 opportunities by value
    const topOpportunities = [...allDeals]
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
      .slice(0, 5)
      .map((d) => ({
        id: d.id,
        name: d.name,
        value: d.value,
        stage: d.stage,
        account_name: (d.accounts as { name: string } | null)?.name ?? null,
      }));

    return Response.json({
      total_pipeline_value: totalPipelineValue,
      deals_by_stage: dealsByStage,
      total_deals: totalDeals,
      average_deal_size: averageDealSize,
      top_opportunities: topOpportunities,
      deals_by_owner: dealsByOwner,
    });
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
