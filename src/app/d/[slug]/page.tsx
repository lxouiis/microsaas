import type { Metadata } from 'next';
import { DEMO_DESKTOP } from '@/lib/demoData';
import DesktopPageClient from './DesktopPageClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Desktop Dear — Someone made this for you 💌`,
    description: 'Open this tiny nostalgic desktop filled with memories, messages, and surprises made just for you.',
    robots: 'noindex', // Keep desktops private
  };
}

import { getDesktopBySlug } from '@/app/actions';

export default async function DesktopPage({ params }: Props) {
  const { slug } = await params;

  let config = await getDesktopBySlug(slug);

  if (!config) {
    // Fallback to demo data
    config = { ...DEMO_DESKTOP, slug };
    config.recipientName = slug === 'demo' ? 'You' : slug.replace(/-/g, ' ');
  }

  return <DesktopPageClient config={config} />;
}
