import Link from 'next/link';
import { GraduationCap, Github, Twitter, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export function LandingFooter() {
    return (
        <footer className="bg-slate-950 border-t border-white/5 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div>
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <GraduationCap size={24} className="text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-white">Edu<span className="text-indigo-400">LMS</span></span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Platform pembelajaran digital modern yang memberdayakan sekolah, guru, dan siswa untuk mencapai potensi terbaik mereka melalui teknologi.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Instagram, Github].map((Icon, i) => (
                                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-indigo-500 hover:text-white transition-all">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Menu Utama</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Beranda', href: '/' },
                                { name: 'Fitur Unggulan', href: '/features' },
                                { name: 'Harga & Paket', href: '/pricing' },
                                { name: 'Tentang Kami', href: '/about' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Bantuan</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Pusat Bantuan', href: '/help' },
                                { name: 'Panduan Guru', href: '/help' },
                                { name: 'Panduan Siswa', href: '/help' },
                                { name: 'Status Sistem', href: '/help' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Hubungi Kami</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-400 text-sm">
                                <MapPin size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                                <span>Jl. Pendidikan No. 123, Jakarta Selatan, Indonesia 12000</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm">
                                <Mail size={18} className="text-indigo-500 shrink-0" />
                                <a href="mailto:hello@edulms.com" className="hover:text-white transition-colors">hello@edulms.com</a>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm">
                                <Phone size={18} className="text-indigo-500 shrink-0" />
                                <a href="tel:+62215551234" className="hover:text-white transition-colors">+62 21 555 1234</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm font-medium">
                        © 2026 EduLMS. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-sm font-medium text-slate-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
