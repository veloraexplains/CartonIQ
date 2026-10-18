import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BarChart3,
  Box,
  Boxes,
  Calculator,
  Check,
  ChevronRight,
  FileText,
  Factory,
  Layers3,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type Module = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: 'Industrial box calculator',
    description:
      'Calculate corrugated board dimensions, paper usage, GSM, box cost, and margin in seconds with precise manufacturing logic.',
    icon: Calculator,
  },
  {
    title: '3D box designer',
    description:
      'Visualize carton structures before production, test dimensions, and validate fit before quotation or dispatch.',
    icon: Layers3,
  },
  {
    title: 'CRM + customer insight',
    description:
      'Store customer data, track order history, and manage buyer-specific requirements in one organized production workflow.',
    icon: Users,
  },
  {
    title: 'Smart quotations',
    description:
      'Generate polished PDFs, pricing sheets, and professional quotes with your branding and product logic built in.',
    icon: FileText,
  },
  {
    title: 'Order tracking',
    description:
      'Monitor live production flow, customer orders, deadlines, and progress across the full packaging cycle.',
    icon: PackageCheck,
  },
  {
    title: 'Inventory + reporting',
    description:
      'Track raw materials, production performance, and profitability with operational dashboards for everyday decisions.',
    icon: BarChart3,
  },
];

const modules: Module[] = [
  {
    title: 'Calculator',
    description: 'FEFCO-friendly box logic, material estimate, cutting calculations, and margin insights.',
    icon: Calculator,
  },
  {
    title: '3D Designer',
    description: 'Preview carton structure in 3D to validate form, dimensions, and production fit.',
    icon: Box,
  },
  {
    title: 'Quotes & Orders',
    description: 'Build itemized quotations and convert them into production orders without leaving the system.',
    icon: FileText,
  },
  {
    title: 'CRM',
    description: 'Track customers, approval history, pricing preferences, and contact communication.',
    icon: Users,
  },
  {
    title: 'Inventory',
    description: 'Manage stock, board supply, and packaging material usage for a smooth industrial workflow.',
    icon: Warehouse,
  },
  {
    title: 'Security',
    description: 'App lock, privacy-first local storage, and secure access for field and plant usage.',
    icon: ShieldCheck,
  },
];

const workflowSteps = [
  {
    title: '1. Define the box',
    text: 'Choose box style, dimensions, ply, flute, and material parameters to model the exact carton requirement.',
  },
  {
    title: '2. Design and validate',
    text: 'Use the 3D designer to inspect structure, balance dimensions, and prepare the right manufacturing specification.',
  },
  {
    title: '3. Price and produce',
    text: 'Generate quotes, lock orders, track inventory, and move production from estimate to dispatch with confidence.',
  },
];

const trustPoints = [
  'Built for corrugated packaging businesses',
  'Works as a mobile-first production suite',
  'Offline-first data flow for real-world factory use',
  'Professional quoting and production visibility',
  'Designed to reduce manual costing mistakes',
  'Fits core packaging operations end to end',
];

const industries = ['Flexible packaging', 'Corrugated boxes', 'Print & packaging plants', 'E-commerce fulfillment', 'Export packing'];

const stats = [
  { value: '100%', label: 'On-device workflow' },
  { value: '6+', label: 'core business modules' },
  { value: '24/7', label: 'plant-ready access' },
  { value: '1 app', label: 'for estimating + operations' },
];

const testimonials = [
  {
    quote:
      'CartonIQ gave our sales and production teams one consistent way to estimate, design, and quote packaging jobs without friction.',
    person: 'Operations Manager',
    company: 'Packaging Unit',
  },
  {
    quote:
      'The instant cost feedback and 3D box validation made our planning process faster and far more accurate.',
    person: 'Production Lead',
    company: 'Box Manufacturing',
  },
];

const pricing = [
  {
    name: 'One-time',
    price: '₹499 only',
    description: 'Buy the app and start using the packaging workflow immediately.',
    included: ['Full CartonIQ access', 'Box calculator', 'Simple quoting', 'Local storage'],
    highlight: true,
  },
];

function generateOrderId() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CIQ-${date}-${time}-${rand}`;
}

export default function App() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const openPurchaseMail = () => {
    const orderId = generateOrderId();
    const subject = `CartonIQ Purchase — ${orderId}`;
    const lines = [
      `Order ID: ${orderId}`,
      'Product: CartonIQ — One-time',
      'Price: ₹499',
      '',
      `Name: ${name || '[not provided]'}`,
      `Company: ${company || '[not provided]'}`,
      `Email: ${buyerEmail || '[not provided]'}`,
      `Phone: ${phone || '[not provided]'}`,
      '',
      'Message:',
      message || '[no message]',
      '',
      '-- Sent via CartonIQ website',
    ];
    const body = lines.join('\n');
    const mailto = `mailto:velora.explains@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500 text-lg font-black text-slate-950 shadow-lg shadow-amber-500/30">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight">CartonIQ</span>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                  Suite
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Smart packaging business</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#platform" className="transition hover:text-white">Platform</a>
            <a href="#workflow" className="transition hover:text-white">How it works</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a href="#contact" className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-400/40 hover:text-white">
              Book demo
            </a>
            <button
              type="button"
              onClick={() => openPurchaseMail()}
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
            >
              Buy App — ₹499
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.15),transparent_28%)]" />
          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Built for packaging teams
                </div>

                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Smarter carton design, quotes, and production workflow.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                  CartonIQ helps packaging businesses calculate costs, design carton structures, generate quotations, and manage orders from one streamlined system built for real-world production[...]
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-300"
                  >
                    Schedule a demo
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#platform"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 h[...]
