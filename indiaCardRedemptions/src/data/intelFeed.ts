export interface IntelItem {
  id: string;
  date: string;
  tag: 'DEVALUATION' | 'SWEET SPOT' | 'NEWS' | 'RUMOR';
  title: string;
  content: string;
  impact: string;
}

export const intelFeed: IntelItem[] = [
  {
    id: 'intel_1',
    date: 'May 18, 2026',
    tag: 'DEVALUATION',
    title: 'Axis Atlas Excludes BharatNXT & Pice',
    content: 'Axis Bank has silently updated its terms to explicitly exclude commercial utility payment gateways like BharatNXT, Pice, and Paymatrix from earning Edge Miles. Previously, these were treated as general spends.',
    impact: 'High. Users can no longer double-dip business utility payments for 2% returns. Switch to Amex Gold via Gyftr for smaller utility bills.'
  },
  {
    id: 'intel_2',
    date: 'May 12, 2026',
    tag: 'SWEET SPOT',
    title: 'Singapore KrisFlyer Waitlist Clearing Early',
    content: 'We are noticing that Singapore Airlines is clearing saver-level waitlist tickets (Business Class) on the BOM-SIN route up to 14 days before departure, significantly earlier than their usual T-4 day window.',
    impact: 'Medium. If you have HSBC Premier points, speculative waitlisting on SQ is highly recommended right now.'
  },
  {
    id: 'intel_3',
    date: 'May 05, 2026',
    tag: 'NEWS',
    title: 'HDFC Infinia Marriott Bonvoy Promotion',
    content: 'HDFC SmartBuy has introduced a targeted promotion offering a 20% point rebate when purchasing Marriott e-gift vouchers using your Infinia card. This temporarily boosts the voucher ROI to an insane 41%.',
    impact: 'High. Maximize your ₹20,000 monthly cap on SmartBuy Marriott vouchers before this expires.'
  }
];
