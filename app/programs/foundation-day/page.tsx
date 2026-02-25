"use client";

import { Montserrat } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, PartyPopper, Calendar, Flag, Volleyball, CircleDot, Users, Heart, Bus } from 'lucide-react';

import Header from '../../../components/layout/Header';
import ScrollReveal from '../../../components/ui/ScrollReveal';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

type TimelineItem = {
  dateLabel: string;
  title: string;
  items: string[];
};

const timeline: TimelineItem[] = [
  {
    dateLabel: 'February 26, 2026',
    title: 'Day 1',
    items: ['Parade', 'Field Demonstration', 'Barrio Fiesta'],
  },
  {
    dateLabel: 'February 27, 2026',
    title: 'Day 2',
    items: ['Volleyball Parents', 'Fund Raising Activity'],
  },
  {
    dateLabel: 'February 28, 2026',
    title: 'Day 3',
    items: ['Basketball Parents', 'Bus Dedication'],
  },
];

export default function FoundationDayPage() {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${montserrat.className}`}>
      <Header />

      <main className="flex-grow">
        <section className="py-10 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-down">
              <Link
                href="/projects/apple-scholarships"
                className="inline-flex items-center text-sm font-semibold tracking-widest text-papaya-green hover:text-[#1B3E2A] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK TO PROGRAMS
              </Link>
            </ScrollReveal>

            <div className="mt-8 grid lg:grid-cols-2 gap-10 items-start">
              <ScrollReveal animation="slide-right">
                <div className="w-full max-w-[360px]">
                  <Image
                    src="/images/foundation/foundation-day.png"
                    alt="Foundation Day Banner"
                    width={1040}
                    height={585}
                    priority
                    className="w-full h-auto rounded-2xl shadow-xl border border-gray-100"
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal animation="slide-left">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#F2C94C]/15 border border-[#F2C94C]/30 px-4 py-2 text-xs font-bold tracking-widest text-[#1B3E2A]">
                    <PartyPopper className="w-4 h-4 text-[#F2C94C]" />
                    FOUNDATION DAY
                  </div>
                  <h1 className="mt-4 text-3xl md:text-5xl font-bold text-papaya-green">
                    Papaya Foundation Day
                  </h1>
                  <p className="mt-4 text-base md:text-lg text-gray-600 leading-relaxed">
                    Foundation Day is our annual celebration of <span className="font-semibold text-papaya-green">Kasiyahan at Bayanihan</span> — a joyful
                    gathering of students, parents, teachers, and the community. Across three days, we come together for parades,
                    demonstrations, friendly games, and meaningful activities that strengthen unity and support our mission.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#F2C94C]/40 bg-[#F2C94C]/10 px-4 py-2 text-sm font-semibold tracking-widest text-[#1B3E2A]">
                    <Calendar className="w-4 h-4 text-[#F2C94C]" />
                    FEB 26–28, 2026
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 bg-[#f3f4f6]">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="fade-down">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-papaya-green">Foundation Day Timeline</h2>
                <p className="mt-2 text-sm md:text-base text-gray-500 tracking-wide">WHAT A JOURNEY SO FAR</p>
              </div>
            </ScrollReveal>

            <div className="max-w-5xl mx-auto relative">
              {/* Main timeline line */}
              <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-papaya-green" />

              <div className="space-y-10 md:space-y-14">
                {timeline.map((entry, idx) => {
                  const isRight = idx % 2 === 0;
                  const [month, dayStr, year] = entry.dateLabel.replace(',', '').split(' ');
                  const day = dayStr;
                  const icon = idx === 0
                    ? <Flag className="w-5 h-5 text-papaya-green" />
                    : idx === 1
                      ? <Volleyball className="w-5 h-5 text-papaya-green" />
                      : <CircleDot className="w-5 h-5 text-papaya-green" />;

                  return (
                    <div key={entry.dateLabel} className="relative">
                      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-8 md:top-1/2 md:-translate-y-1/2 z-10">
                        <div className="w-5 h-5 bg-papaya-green rounded-full ring-4 ring-white shadow-lg border-2 border-white" />
                      </div>

                      <div className="grid md:grid-cols-2 gap-10 items-start">
                        {/* LEFT COLUMN (used when entry is on the LEFT) */}
                        <div className="hidden md:block">
                          <div className="md:hidden pl-10">
                            <ScrollReveal animation="fade-up">
                              <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                  <div>
                                    <div className="text-sm font-bold text-gray-900">{entry.items[0]}</div>
                                    <div className="mt-1 text-xs text-gray-500">{entry.items.slice(1).join(' • ')}</div>
                                  </div>
                                  <div className="flex gap-2 mt-3 flex-wrap">
                                    {idx === 0 && (
                                      <>
                                        <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Flag className="w-4 h-4 text-green-600" /></div>
                                        <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-4 h-4 text-green-600" /></div>
                                        <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><PartyPopper className="w-4 h-4 text-green-600" /></div>
                                      </>
                                    )}
                                    {idx === 1 && (
                                      <>
                                        <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Volleyball className="w-4 h-4 text-green-600" /></div>
                                        <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-4 h-4 text-green-600" /></div>
                                        <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Heart className="w-4 h-4 text-green-600" /></div>
                                      </>
                                    )}
                                    {idx === 2 && (
                                      <>
                                        <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><CircleDot className="w-4 h-4 text-green-600" /></div>
                                        <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-4 h-4 text-green-600" /></div>
                                        <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><div className="w-4 h-4 rounded-full border-2 border-green-600" /></div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="border-l border-gray-200 px-3 py-4 text-center w-[72px] flex flex-col items-center justify-center bg-gray-50 flex-shrink-0">
                                  <div className="text-[10px] font-bold text-gray-500">{month}</div>
                                  <div className="text-2xl font-bold text-gray-900 leading-none my-1">{day}</div>
                                  <div className="text-[10px] text-gray-400">{year}</div>
                                </div>
                              </div>
                            </ScrollReveal>
                          </div>

                          <div className={`${isRight ? 'hidden md:block' : 'md:justify-self-end md:pr-14'} ${isRight ? '' : 'md:flex md:justify-end'}`}>
                            {!isRight && (
                              <ScrollReveal animation="slide-right">
                                <div className="w-full max-w-[440px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
                                  <div className="flex-1 p-5 flex flex-col justify-between">
                                    <div>
                                      <div className="text-base font-bold text-gray-900">{entry.items[0]}</div>
                                      <div className="mt-1 text-sm text-gray-500">{entry.items.slice(1).join(' • ')}</div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                      {idx === 0 && (
                                        <>
                                          <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Flag className="w-5 h-5 text-green-600" /></div>
                                          <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
                                          <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><PartyPopper className="w-5 h-5 text-green-600" /></div>
                                        </>
                                      )}
                                      {idx === 1 && (
                                        <>
                                          <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Volleyball className="w-5 h-5 text-green-600" /></div>
                                          <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
                                          <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Heart className="w-5 h-5 text-green-600" /></div>
                                        </>
                                      )}
                                      {idx === 2 && (
                                        <>
                                          <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><CircleDot className="w-5 h-5 text-green-600" /></div>
                                          <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
                                          <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-green-600" /></div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="border-l border-gray-200 px-4 py-5 text-center w-[80px] flex flex-col items-center justify-center bg-gray-50 flex-shrink-0">
                                    <div className="text-xs font-bold text-gray-500">{month}</div>
                                    <div className="text-3xl font-bold text-gray-900 leading-none my-1">{day}</div>
                                    <div className="text-xs text-gray-400">{year}</div>
                                  </div>
                                </div>
                              </ScrollReveal>
                            )}
                          </div>
                        </div>

                        <div className="md:hidden pl-10">
                          <ScrollReveal animation="fade-up">
                            <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
                              <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{entry.items[0]}</div>
                                  <div className="mt-1 text-xs text-gray-500">{entry.items.slice(1).join(' • ')}</div>
                                </div>
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  {idx === 0 && (
                                    <>
                                      <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Flag className="w-4 h-4 text-green-600" /></div>
                                      <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-4 h-4 text-green-600" /></div>
                                      <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><PartyPopper className="w-4 h-4 text-green-600" /></div>
                                    </>
                                  )}
                                  {idx === 1 && (
                                    <>
                                      <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Volleyball className="w-4 h-4 text-green-600" /></div>
                                      <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-4 h-4 text-green-600" /></div>
                                      <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Heart className="w-4 h-4 text-green-600" /></div>
                                    </>
                                  )}
                                  {idx === 2 && (
                                    <>
                                      <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><CircleDot className="w-4 h-4 text-green-600" /></div>
                                      <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-4 h-4 text-green-600" /></div>
                                      <div className="w-9 h-9 rounded bg-green-50 border border-green-100 flex items-center justify-center"><div className="w-4 h-4 rounded-full border-2 border-green-600" /></div>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="border-l border-gray-200 px-3 py-4 text-center w-[72px] flex flex-col items-center justify-center bg-gray-50 flex-shrink-0">
                                <div className="text-[10px] font-bold text-gray-500">{month}</div>
                                <div className="text-2xl font-bold text-gray-900 leading-none my-1">{day}</div>
                                <div className="text-[10px] text-gray-400">{year}</div>
                              </div>
                            </div>
                          </ScrollReveal>
                        </div>

                        {/* RIGHT COLUMN (used when entry is on the RIGHT) */}
                        <div className={`${isRight ? 'hidden md:flex md:justify-self-start md:pl-14 md:justify-start' : 'hidden md:block'}`}>
                          {isRight && (
                            <ScrollReveal animation="slide-left">
                              <div className="w-full max-w-[440px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
                                <div className="flex-1 p-5 flex flex-col justify-between">
                                  <div>
                                    <div className="text-base font-bold text-gray-900">{entry.items[0]}</div>
                                    <div className="mt-1 text-sm text-gray-500">{entry.items.slice(1).join(' • ')}</div>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    {idx === 0 && (
                                      <>
                                        <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Flag className="w-5 h-5 text-green-600" /></div>
                                        <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
                                        <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><PartyPopper className="w-5 h-5 text-green-600" /></div>
                                      </>
                                    )}
                                    {idx === 1 && (
                                      <>
                                        <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Volleyball className="w-5 h-5 text-green-600" /></div>
                                        <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
                                        <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Heart className="w-5 h-5 text-green-600" /></div>
                                      </>
                                    )}
                                    {idx === 2 && (
                                      <>
                                        <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><CircleDot className="w-5 h-5 text-green-600" /></div>
                                        <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
                                        <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-green-600" /></div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="border-l border-gray-200 px-4 py-5 text-center w-[80px] flex flex-col items-center justify-center bg-gray-50 flex-shrink-0">
                                  <div className="text-xs font-bold text-gray-500">{month}</div>
                                  <div className="text-3xl font-bold text-gray-900 leading-none my-1">{day}</div>
                                  <div className="text-xs text-gray-400">{year}</div>
                                </div>
                              </div>
                            </ScrollReveal>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
