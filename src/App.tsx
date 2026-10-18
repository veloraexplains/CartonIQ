import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BarChart3,
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
    name: 'Starter',
    price: '₹0',
    description: 'For new packaging teams testing workflow improvements.',
    included: ['Basic calculator', 'Simple quoting', 'Local storage'],
    highlight: false,
  },
  {
    name: 'Business',
    price: 'Custom',
    description: 'For growing packaging businesses managing orders and quotations.',
    included: ['Full CartonIQ suite', 'CRM + reporting', 'Production workflow'],
    highlight: true,
  },
];

export default function App() {
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
            <a href="#pricing" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300">
              Get started
            </a>
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
                  CartonIQ helps packaging businesses calculate costs, design carton structures, generate quotations,
                  and manage orders from one streamlined system built for real-world production work.
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
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-slate-800"
                  >
                    Explore platform
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Offline-first workflow</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Mobile-ready industrial app</div>
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 p-3 shadow-2xl shadow-slate-950/60">
                  <div className="rounded-[22px] border border-white/10 bg-slate-950 p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-400" />
                        <div className="h-3 w-3 rounded-full bg-emerald-400" />
                        <div className="h-3 w-3 rounded-full bg-rose-400" />
                      </div>
                      <div className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                        live dashboard
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Box estimate</div>
                          <div className="mt-2 text-2xl font-black text-white">₹14,280</div>
                        </div>
                        <div className="rounded-xl bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300">
                          +12.4% margin
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                          <div className="mb-2 flex justify-between text-xs text-slate-400">
                            <span>Box style</span>
                            <span>RSC 0201</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium text-slate-200">
                            <span>500 x 350 x 220 mm</span>
                            <span>3 ply</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Material</div>
                            <div className="mt-2 text-lg font-bold text-white">GSM 180</div>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Output</div>
                            <div className="mt-2 text-lg font-bold text-white">1,250 pcs</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-14 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-sm">
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
              <Star className="h-3.5 w-3.5" />
              Why businesses choose CartonIQ
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Everything a packaging business needs in one platform.</h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="leading-7 text-slate-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="platform" className="border-y border-white/10 bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                  <Factory className="h-3.5 w-3.5" />
                  Platform overview
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">A complete design-to-production workflow for carton operations.</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-slate-300">
                <Smartphone className="h-4 w-4 text-amber-300" />
                Mobile-first + desktop-ready
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <div key={module.title} className="group rounded-3xl border border-white/10 bg-slate-950/80 p-6 transition hover:-translate-y-1 hover:border-amber-400/40">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-amber-300 transition group-hover:bg-amber-400 group-hover:text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{module.title}</h3>
                    <p className="mt-3 text-slate-300">{module.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
              <Truck className="h-3.5 w-3.5" />
              How it works
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">From product concept to production-ready packaging.</h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 font-black text-slate-950">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Trusted by packaging teams
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Built for the real operating realities of packaging businesses.</h2>
                <div className="mt-8 space-y-4">
                  {trustPoints.map((point) => (
                    <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="text-slate-200">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/40">
                <div className="grid gap-4 sm:grid-cols-2">
                  {industries.map((industry) => (
                    <div key={industry} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm font-semibold text-slate-200">
                      {industry}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              Customer feedback
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Teams trust CartonIQ to simplify packaging operations.</h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {testimonials.map((item) => (
              <div key={item.person} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
                <div className="mb-4 flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-lg leading-8 text-slate-200">“{item.quote}”</p>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="font-bold text-white">{item.person}</div>
                  <div className="text-sm text-slate-400">{item.company}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
              <Boxes className="h-3.5 w-3.5" />
              Flexible pricing
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Choose the packaging workflow that fits your business.</h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[28px] border p-6 ${
                  plan.highlight
                    ? 'border-amber-400/50 bg-gradient-to-br from-amber-400/15 to-slate-950 shadow-xl shadow-amber-500/10'
                    : 'border-white/10 bg-slate-900/70'
                }`}
              >
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{plan.name}</div>
                <div className="mt-4 text-4xl font-black text-white">{plan.price}</div>
                <p className="mt-3 text-slate-300">{plan.description}</p>

                <ul className="mt-6 space-y-3 text-slate-200">
                  {plan.included.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-bold transition ${
                    plan.highlight
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'border border-white/10 bg-slate-900 text-white hover:border-white/20'
                  }`}
                >
                  {plan.highlight ? 'Request a quote' : 'Get started'}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                  <FileText className="h-3.5 w-3.5" />
                  Ready to see it live?
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Let’s design a packaging workflow that fits your business.</h2>
                <p className="mt-5 max-w-lg leading-7 text-slate-300">
                  Whether you are a corrugated box factory, printing unit, or packaging operations team, CartonIQ is designed to help you estimate faster and produce smarter.
                </p>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50">
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none" placeholder="Your name" />
                    <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none" placeholder="Company" />
                  </div>

                  <input className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none" type="email" placeholder="Email address" />

                  <textarea
                    className="min-h-32 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                    placeholder="Tell us about your packaging workflow, volume, and requirements"
                  />

                  <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300">
                    Request a demo
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-sm font-black text-slate-950">
              C
            </div>
            <span className="font-semibold text-slate-200">CartonIQ</span>
          </div>
          <div>Smart packaging business suite for carton design, costing, quoting, and production planning.</div>
        </div>
      </footer>
    </div>
  );
}
