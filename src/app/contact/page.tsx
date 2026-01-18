'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white font-outfit">
            <LandingNavbar />

            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-black mb-6">Hubungi Kami</h1>
                        <p className="text-xl text-slate-400">
                            Tim kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="flex items-start gap-6 p-6 bg-white/5 rounded-3xl border border-white/10">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <MapPin className="text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Kantor Pusat</h3>
                                    <p className="text-slate-400">Jl. Pendidikan No. 123<br />Jakarta Selatan, 12000<br />Indonesia</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 p-6 bg-white/5 rounded-3xl border border-white/10">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Email</h3>
                                    <p className="text-slate-400">support@edulms.com<br />sales@edulms.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 p-6 bg-white/5 rounded-3xl border border-white/10">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <Phone className="text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Telepon</h3>
                                    <p className="text-slate-400">+62 21 555 1234<br />(Senin - Jumat, 09:00 - 17:00)</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Mockup */}
                        <form className="space-y-6 bg-white/5 p-8 rounded-[3rem] border border-white/10">
                            <h3 className="text-2xl font-bold mb-6">Kirim Pesan</h3>
                            <input type="text" placeholder="Nama Lengkap" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl focus:border-indigo-500 focus:outline-none" />
                            <input type="email" placeholder="Alamat Email" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl focus:border-indigo-500 focus:outline-none" />
                            <textarea rows={4} placeholder="Pesan Anda..." className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl focus:border-indigo-500 focus:outline-none resize-none"></textarea>
                            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-colors shadow-lg">
                                Kirim Pesan
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
