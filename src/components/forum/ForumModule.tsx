'use client';

import { useState, useEffect } from 'react';
import { 
    MessageSquare, Send, Flag, Shield, 
    MoreVertical, Trash2, Pin, AlertCircle,
    User as UserIcon, CheckCircle
} from 'lucide-react';
import { forumRepository } from '@/lib/repositories/forum.repository';
import type { User } from '@/types';

interface ForumModuleProps {
    user: User;
    classId?: string;
    isModerator?: boolean;
}

export function ForumModule({ user, classId, isModerator }: ForumModuleProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        loadPosts();
    }, [classId]);

    const loadPosts = async () => {
        try {
            const data = await forumRepository.getPosts(user.school_id!, classId);
            setPosts(data || []);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostTitle || !newPostContent) return;

        setIsPosting(true);
        try {
            await forumRepository.createPost({
                author_id: user.id,
                school_id: user.school_id!,
                class_id: classId,
                title: newPostTitle,
                content: newPostContent,
                is_announcement: isModerator
            });
            setNewPostTitle('');
            setNewPostContent('');
            loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsPosting(false);
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-500">Memuat forum...</div>;

    return (
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-8 p-6">
            {/* Feed Section */}
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6">
                {/* Create Post Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                            <UserIcon size={20} />
                        </div>
                        <h3 className="font-bold text-white">Mulai Diskusi Baru</h3>
                    </div>
                    <form onSubmit={handleCreatePost} className="space-y-3">
                        <input 
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                            placeholder="Apa topik yang ingin Anda bahas?"
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white font-bold placeholder:text-slate-600 outline-none focus:border-violet-500/50 transition-all"
                        />
                        <textarea 
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Detail diskusi..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:border-violet-500/50 transition-all min-h-[100px] resize-none"
                        />
                        <div className="flex justify-end">
                            <button 
                                type="submit"
                                disabled={isPosting || !newPostTitle}
                                className="px-6 py-2.5 bg-violet-600 text-white font-black rounded-xl text-xs flex items-center gap-2 hover:bg-violet-700 transition-all disabled:opacity-50"
                            >
                                <Send size={14} />
                                KIRIM DISKUSI
                            </button>
                        </div>
                    </form>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            isModerator={isModerator}
                            onUpdate={loadPosts}
                        />
                    ))}
                    {posts.length === 0 && (
                        <div className="py-20 text-center space-y-4">
                            <MessageSquare size={48} className="mx-auto text-slate-800" />
                            <p className="text-slate-600 font-bold">Belum ada diskusi di sini.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Info */}
            <div className="w-full md:w-80 shrink-0 space-y-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Informasi Forum</h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Shield size={16} className="text-emerald-400 mt-1" />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Forum ini diawasi oleh moderator sekolah. Mohon gunakan bahasa yang sopan dan santun.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <AlertCircle size={16} className="text-amber-400 mt-1" />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Fitur lapor tersedia jika Anda menemukan konten yang tidak pantas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PostCard({ post, isModerator, onUpdate }: any) {
    const [showComments, setShowComments] = useState(false);

    return (
        <div className={`
            bg-white/[0.03] border rounded-[2rem] p-6 space-y-4 transition-all hover:bg-white/[0.05]
            ${post.is_announcement ? 'border-amber-500/30' : 'border-white/5'}
        `}>
            {/* Post Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-slate-400">
                        {post.author.full_name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{post.author.full_name}</span>
                            {post.author.role === 'guru' && (
                                <CheckCircle size={12} className="text-violet-400" />
                            )}
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">
                            {new Date(post.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {post.is_announcement && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[9px] font-black text-amber-400 uppercase tracking-widest border border-amber-500/20">
                            PENGUMUMAN
                        </span>
                    )}
                    <button className="p-2 text-slate-600 hover:text-white transition-colors">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Post Body */}
            <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">{post.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                    {post.content}
                </p>
            </div>

            {/* Post Footer */}
            <div className="flex items-center gap-6 pt-2">
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-[11px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest"
                >
                    <MessageSquare size={14} />
                    Diskusi
                </button>
                <button className="flex items-center gap-2 text-[11px] font-black text-slate-500 hover:text-rose-400 transition-all uppercase tracking-widest">
                    <Flag size={14} />
                    Lapor
                </button>
                
                {isModerator && (
                    <div className="ml-auto flex items-center gap-2">
                        <button className="p-2 text-slate-600 hover:text-rose-400 transition-colors">
                            <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-amber-400 transition-colors">
                            <Pin size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
