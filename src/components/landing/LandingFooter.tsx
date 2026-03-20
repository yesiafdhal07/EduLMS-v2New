import Link from 'next/link';
import { GraduationCap, Github, Twitter, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export function LandingFooter() {
    return (
        <footer className="bg-[#08080D] border-t border-white/[0.04] pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div>
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/10">
                                <GraduationCap size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-white">
                                Klola<span className="text-cyan-400">kelas</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Platform manajemen kelas dan pembelajaran digital yang dibuat khusus untuk guru dan sekolah di Indonesia.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { Icon: Twitter, label: 'Twitter' },
                                { Icon: Facebook, label: 'Facebook' },
                                { Icon: Instagram, label: 'Instagram' },
                                { Icon: Github, label: 'Github' },
                            ].map(({ Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:bg-cyan-500/10 hover:border-cyan-500/20 hover:text-cyan-400 transition-all duration-300"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Menu Utama</h4>
                        <ul className="space-y-3">
                            {[
                                { name: 'Beranda', href: '/' },
                                { name: 'Fitur Unggulan', href: '/features' },
                                { name: 'Harga & Paket', href: '/pricing' },
                                { name: 'Tentang Kami', href: '/about' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-500 hover:text-cyan-400 text-sm font-medium transition-colors duration-300">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Bantuan</h4>
                        <ul className="space-y-3">
                            {[
                                { name: 'Pusat Bantuan', href: '/help' },
                                { name: 'Panduan Guru', href: '/help' },
                                { name: 'Panduan Siswa', href: '/help' },
                                { name: 'Status Sistem', href: '/help' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-gray-500 hover:text-cyan-400 text-sm font-medium transition-colors duration-300">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Hubungi Kami</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-500 text-sm">
                                <MapPin size={16} className="text-cyan-500/60 shrink-0 mt-0.5" />
                                <span>Jl. Pendidikan No. 123, Jakarta Selatan, Indonesia 12000</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 text-sm">
                                <Mail size={16} className="text-cyan-500/60 shrink-0" />
                                <a href="mailto:hello@klolakelas.com" className="hover:text-cyan-400 transition-colors">hello@klolakelas.com</a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 text-sm">
                                <Phone size={16} className="text-cyan-500/60 shrink-0" />
                                <a href="tel:+62215551234" className="hover:text-cyan-400 transition-colors">+62 21 555 1234</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-600 text-sm font-medium">
                        © 2026 Klolakelas. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-sm font-medium text-gray-600">
                        <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
