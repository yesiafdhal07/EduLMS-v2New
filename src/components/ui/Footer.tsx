
export function Footer() {
    return (
        <footer className="py-8 text-center text-slate-500 text-xs font-medium mt-auto w-full">
            <p className="flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                &copy; {new Date().getFullYear()} EduLMS. Created by <span className="text-slate-400 font-bold">Ahza Musyaffa Arrisi</span>
            </p>
        </footer >
    );
}
