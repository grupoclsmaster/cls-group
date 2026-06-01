"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { SkeletonFeed } from "@/components/SkeletonLoading";
import MemberBadge from "@/components/MemberBadge";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  initials: string;
  img: string;
  status: "Ativo" | "Inativo";
  member_type?: 'admin' | 'master' | 'mentor' | null;
}

interface Comment {
  id: string;
  user_id?: string | null;
  author_name: string;
  author_avatar: string;
  author_role: string;
  content: string;
  created_at: string;
  replies?: Comment[];
  likes_count?: number;
  liked_by_users?: string[];
}

interface Post {
  id: string;
  user_id: string | null;
  author_name: string;
  author_avatar: string;
  author_role: string;
  content: string;
  image_url: string | null;
  video_url?: string | null;
  post_type?: string;
  likes_count: number;
  liked_by_users: string[];
  saved_by_users: string[];
  comments: Comment[];
  created_at: string;
}

// Fallback initial posts
const fallbackPosts: Post[] = [
  {
    id: "f-post-1",
    user_id: null,
    author_name: "Arq. Mayara Costa",
    author_role: "Mentor Sênior",
    author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    content: "Olá pessoal! Acabei de disponibilizar o novo modelo de Dossiê de Apresentação Executiva para captação de recursos com investidores na área de Recursos. Esse material tem sido fundamental para os roadshows de incorporação residencial de luxo. Deixem suas dúvidas aqui nos comentários!",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    likes_count: 8,
    liked_by_users: [],
    saved_by_users: [],
    comments: [
      {
        id: "c1",
        author_name: "Gustavo Rocha",
        author_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
        author_role: "Sócio Sênior",
        content: "Excelente Mayara! Já baixei e vamos aplicar no nosso próximo empreendimento em Curitiba. O layout ficou fantástico.",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "f-post-2",
    user_id: null,
    author_name: "Eng. Magno Santos",
    author_role: "Mentor Sênior",
    author_avatar: "/magno.jpg",
    content: "Finalizamos hoje a concretagem da laje de transição no Residencial Horizon. Utilizarmos um concreto autoadensável de 50 MPa para vencer os grandes vãos sem comprometer a estética arquitetônica do pilotis. Próxima semana faremos a visita técnica presencial com o grupo!",
    image_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800",
    likes_count: 12,
    liked_by_users: [],
    saved_by_users: [],
    comments: [
      {
        id: "c2",
        author_name: "Camila T.",
        author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
        author_role: "Sócia Plena",
        content: "Sensacional Magno! A logística para bombear esse volume de concreto em condomínio residencial sempre é um desafio. Parabéns pelo controle de qualidade.",
        created_at: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  }
];

export default function FeedComunidadePage() {
  // createClient() is SSR-safe: returns null on server, real client on browser
  const supabase = createClient();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentMemberInfo, setCurrentMemberInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<any[]>([]);

  // Form states for creating post
  const [newPostText, setNewPostText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [postType, setPostType] = useState<"standard" | "status" | "reels">("standard");
  const [activeTab, setActiveTab] = useState<"feed" | "reels">("feed");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stories / Status states
  const [activeStoryAuthor, setActiveStoryAuthor] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [storyDuration, setStoryDuration] = useState<number>(5000);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement | null>(null);
  const [storyViewers, setStoryViewers] = useState<any[]>([]);
  const [showViewersModal, setShowViewersModal] = useState<boolean>(false);

  // States for search and active comments
  const [searchMember, setSearchMember] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostText, setEditingPostText] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState<string>("");
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Lightbox State
  const [lightboxPostId, setLightboxPostId] = useState<string | null>(null);
  const [lightboxTab, setLightboxTab] = useState<"content" | "comments" | "likes">("content");
  const lightboxPost = posts.find(p => p.id === lightboxPostId) || null;

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Custom Dialog State (Alert/Confirm)
  const [customDialog, setCustomDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm";
    onConfirm?: () => void;
  } | null>(null);

  const showAlert = (message: string, title: string = "Aviso") => {
    setCustomDialog({
      isOpen: true,
      title,
      message,
      type: "alert"
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, title: string = "Confirmação") => {
    setCustomDialog({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm
    });
  };

  useEffect(() => {
    if (storyVideoRef.current) {
      if ((customDialog && customDialog.isOpen) || showViewersModal) {
        storyVideoRef.current.pause();
      } else {
        storyVideoRef.current.play().catch(err => console.log("Video play failed:", err));
      }
    }
  }, [customDialog, showViewersModal]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load session
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        if (user) {
          const { data: member } = await supabase
            .from('members')
            .select('*')
            .eq('id', user.id)
            .single();
          if (member) setCurrentMemberInfo(member);

          // Fetch user connections
          const { data: connData } = await supabase
            .from('member_connections')
            .select('*')
            .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
          if (connData) {
            setConnections(connData);
          }
        }

        // Load members list (CPROCLS) from Supabase first
        const { data: dbMembers, error: membersErr } = await supabase
          .from('members')
          .select('*')
          .order('name');

        if (dbMembers && !membersErr && dbMembers.length > 0) {
          setMembers(dbMembers);
        } else {
          // Fallback to static mock members list
          const res = await fetch("/api/members");
          if (res.ok) {
            const mData = await res.json();
            setMembers(mData.members || []);
          }
        }

        // Load feed posts
        const { data: dbPosts, error: postsErr } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbPosts && dbPosts.length > 0) {
          const now = Date.now();
          const validPosts = dbPosts.filter((p: any) => {
            if (p.post_type === "status") {
              const ageMs = now - new Date(p.created_at).getTime();
              return ageMs < 24 * 60 * 60 * 1000; // 24h limit
            }
            return true;
          });
          setPosts(validPosts);
        } else {
          setPosts(fallbackPosts);
        }

      } catch (err) {
        console.error("Erro ao carregar dados do feed:", err);
        setPosts(fallbackPosts);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getConnectionStatus = (memberId: string) => {
    if (!currentUser) return "none";
    if (currentUser.id === memberId) return "self";
    const conn = connections.find(c => 
      (c.requester_id === currentUser.id && c.receiver_id === memberId) ||
      (c.requester_id === memberId && c.receiver_id === currentUser.id)
    );
    if (!conn) return "none";
    if (conn.status === "accepted") return "accepted";
    if (conn.status === "pending") {
      return conn.requester_id === currentUser.id ? "pending_sent" : "pending_received";
    }
    return "none";
  };

  const handleConnectAction = async (memberId: string, memberName: string) => {
    if (!currentUser) {
      showAlert("Você precisa estar logado para conectar.");
      return;
    }
    const status = getConnectionStatus(memberId);
    if (status === "none") {
      const { error } = await supabase
        .from('member_connections')
        .insert({
          requester_id: currentUser.id,
          receiver_id: memberId,
          status: 'pending'
        });
      if (error) {
        showToast("Erro ao enviar solicitação.", "error");
      } else {
        showToast(`Solicitação de conexão enviada para ${memberName}`);
        const { data: connData } = await supabase
          .from('member_connections')
          .select('*')
          .or(`requester_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);
        if (connData) setConnections(connData);
      }
    } else if (status === "pending_received") {
      const conn = connections.find(c => c.requester_id === memberId && c.receiver_id === currentUser.id);
      if (conn) {
        const { error } = await supabase
          .from('member_connections')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', conn.id);
        if (error) {
          showToast("Erro ao aceitar conexão.", "error");
        } else {
          showToast(`Conexão com ${memberName} aceita!`);
          const { data: connData } = await supabase
            .from('member_connections')
            .select('*')
            .or(`requester_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);
          if (connData) setConnections(connData);
        }
      }
    }
  };

  // Handle selecting local image or video file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const isVideo = file.type.startsWith("video/");
      setMediaType(isVideo ? "video" : "image");
      
      const objectUrl = URL.createObjectURL(file);
      setMediaPreviewUrl(objectUrl);
      setImagePreview(null);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setMediaType(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
    }
    setImagePreview(null);
    const fileInput = document.getElementById("feed-image-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Submit new community post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !selectedFile) return;

    if (postType === "reels" && (!selectedFile || mediaType !== "video")) {
      showAlert("Por favor, selecione um vídeo para publicar no Reels.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const authorName = currentMemberInfo?.name || "Membro Executivo";
      const authorAvatar = currentMemberInfo?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200";
      const authorRole = currentMemberInfo?.role || "Membro CLS";

      let uploadedImageUrl: string | null = null;
      let uploadedVideoUrl: string | null = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("type", mediaType || "image");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Erro no upload");
        }

        const data = await res.json();
        if (mediaType === "video") {
          uploadedVideoUrl = data.url;
        } else {
          uploadedImageUrl = data.url;
        }
      }

      const newPostObj: Omit<Post, 'id' | 'created_at'> = {
        user_id: currentUser?.id || null,
        author_name: authorName,
        author_avatar: authorAvatar,
        author_role: authorRole,
        content: newPostText.trim(),
        image_url: uploadedImageUrl,
        video_url: uploadedVideoUrl,
        post_type: postType,
        likes_count: 0,
        liked_by_users: [],
        saved_by_users: [],
        comments: []
      };

      if (currentUser) {
        const { data: dbPost, error } = await supabase
          .from('community_posts')
          .insert(newPostObj)
          .select()
          .single();

        if (error) throw error;
        if (dbPost) setPosts(prev => [dbPost, ...prev]);
      } else {
        // Fallback local update
        const mockNewPost: Post = {
          ...newPostObj,
          id: `local-${Math.random()}`,
          created_at: new Date().toISOString()
        };
        setPosts(prev => [mockNewPost, ...prev]);
        showToast("Publicado localmente (Modo de Demonstração)");
      }

      setNewPostText("");
      handleClearImage();
      setPostType("standard");
    } catch (err: any) {
      console.error("Erro ao publicar post:", err);
      showAlert(`Erro ao publicar atualização: ${err.message || err}`, "Erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete post action
  const handleDeletePost = async (postId: string) => {
    showConfirm("Deseja realmente excluir esta publicação?", async () => {
      try {
        const { error } = await supabase
          .from('community_posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;

        setPosts(prev => prev.filter(p => p.id !== postId));
        showToast("Publicação excluída com sucesso!");
      } catch (err: any) {
        console.error("Erro ao excluir publicação:", err);
        showToast("Erro ao excluir publicação.", "error");
      }
    });
  };

  // Delete status/story action
  const handleDeleteStory = async (storyId: string) => {
    showConfirm("Deseja realmente excluir este status?", async () => {
      try {
        const { error } = await supabase
          .from('community_posts')
          .delete()
          .eq('id', storyId);

        if (error) throw error;

        // Update local state
        setPosts(prev => prev.filter(p => p.id !== storyId));
        showToast("Status excluído com sucesso!");
        
        // Close story viewer
        setActiveStoryAuthor(null);
        setActiveStoryIndex(0);
      } catch (err: any) {
        console.error("Erro ao excluir status:", err);
        showToast("Erro ao excluir status.", "error");
      }
    });
  };

  // Like / Unlike action
  const handleLikePost = async (postId: string) => {
    const userId = currentUser?.id || "mock-user-id";
    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    const likedBy = currentPost.liked_by_users || [];
    let newLikedBy = [...likedBy];
    let newLikesCount = currentPost.likes_count;

    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      newLikedBy = newLikedBy.filter(id => id !== userId);
      newLikesCount = Math.max(0, newLikesCount - 1);
    } else {
      newLikedBy.push(userId);
      newLikesCount += 1;
    }

    // Optimistic Update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: newLikesCount, liked_by_users: newLikedBy } : p));

    try {
      await supabase
        .from('community_posts')
        .update({ likes_count: newLikesCount, liked_by_users: newLikedBy })
        .eq('id', postId);
    } catch (err) {
      console.error("Erro ao atualizar curtida:", err);
    }
  };

  // Save / Bookmark action
  const handleSavePost = async (postId: string) => {
    const userId = currentUser?.id || "mock-user-id";
    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    const savedBy = currentPost.saved_by_users || [];
    let newSavedBy = [...savedBy];

    const isSaved = savedBy.includes(userId);

    if (isSaved) {
      newSavedBy = newSavedBy.filter(id => id !== userId);
    } else {
      newSavedBy.push(userId);
    }

    // Optimistic Update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved_by_users: newSavedBy } : p));

    try {
      await supabase
        .from('community_posts')
        .update({ saved_by_users: newSavedBy })
        .eq('id', postId);
    } catch (err) {
      console.error("Erro ao salvar publicação:", err);
    }
  };

  // Edit Post action
  const handleUpdatePost = async (postId: string, newContent: string) => {
    if (!newContent.trim()) return;
    try {
      // Optimistic update
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent.trim() } : p));
      setEditingPostId(null);
      
      const { error } = await supabase
        .from('community_posts')
        .update({ content: newContent.trim() })
        .eq('id', postId);

      if (error) throw error;
      showToast("Publicação atualizada com sucesso!");
    } catch (err: any) {
      console.error("Erro ao atualizar publicação:", err);
      showToast("Erro ao atualizar publicação.", "error");
    }
  };

  // Add Comment action
  const handleAddComment = async (postId: string) => {
    const commentText = commentTexts[postId] || "";
    if (!commentText.trim()) return;

    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    const authorName = currentMemberInfo?.name || "Membro Executivo";
    const authorAvatar = currentMemberInfo?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200";
    const authorRole = currentMemberInfo?.role || "Membro CLS";

    const newCommentObj: Comment = {
      id: `comment-${Math.random()}`,
      user_id: currentUser?.id || null,
      author_name: authorName,
      author_avatar: authorAvatar,
      author_role: authorRole,
      content: commentText.trim(),
      created_at: new Date().toISOString(),
      replies: []
    };

    const updatedComments = [...(currentPost.comments || []), newCommentObj];

    // Optimistic Update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    setCommentTexts(prev => ({ ...prev, [postId]: "" }));

    try {
      await supabase
        .from('community_posts')
        .update({ comments: updatedComments })
        .eq('id', postId);
    } catch (err) {
      console.error("Erro ao salvar comentário:", err);
    }
  };

  // Edit Comment action
  const handleSaveEditComment = async (postId: string, commentId: string) => {
    if (!editingCommentText.trim()) return;
    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    const updatedComments = (currentPost.comments || []).map(c => 
      c.id === commentId ? { ...c, content: editingCommentText.trim() } : c
    );

    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    setEditingCommentId(null);

    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ comments: updatedComments })
        .eq('id', postId);
      if (error) throw error;
      showToast("Comentário atualizado!");
    } catch (err) {
      console.error("Erro ao salvar comentário:", err);
      showToast("Erro ao salvar comentário.", "error");
    }
  };

  // Delete Comment action
  const handleDeleteComment = async (postId: string, commentId: string) => {
    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    showConfirm("Deseja realmente excluir este comentário?", async () => {
      const updatedComments = (currentPost.comments || []).filter(c => c.id !== commentId);

      // Optimistic update
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));

      try {
        const { error } = await supabase
          .from('community_posts')
          .update({ comments: updatedComments })
          .eq('id', postId);
        if (error) throw error;
        showToast("Comentário excluído!");
      } catch (err) {
        console.error("Erro ao excluir comentário:", err);
        showToast("Erro ao excluir comentário.", "error");
      }
    });
  };

  // Add Reply action
  const handleAddReply = async (postId: string, commentId: string) => {
    const replyText = replyTexts[commentId] || "";
    if (!replyText.trim()) return;

    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    const authorName = currentMemberInfo?.name || "Membro Executivo";
    const authorAvatar = currentMemberInfo?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200";
    const authorRole = currentMemberInfo?.role || "Membro CLS";

    const newReplyObj: Comment = {
      id: `reply-${Math.random()}`,
      user_id: currentUser?.id || null,
      author_name: authorName,
      author_avatar: authorAvatar,
      author_role: authorRole,
      content: replyText.trim(),
      created_at: new Date().toISOString(),
      replies: []
    };

    const updatedComments = (currentPost.comments || []).map(c => {
      if (c.id === commentId) {
        const existingReplies = c.replies || [];
        return { ...c, replies: [...existingReplies, newReplyObj] };
      }
      return c;
    });

    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
    setReplyingCommentId(null);

    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ comments: updatedComments })
        .eq('id', postId);
      if (error) throw error;
      showToast("Resposta adicionada!");
    } catch (err) {
      console.error("Erro ao adicionar resposta:", err);
      showToast("Erro ao salvar resposta.", "error");
    }
  };

  // Edit Reply action
  const handleSaveEditReply = async (postId: string, commentId: string, replyId: string) => {
    if (!editingCommentText.trim()) return;
    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    const updatedComments = (currentPost.comments || []).map(c => {
      if (c.id === commentId) {
        const updatedReplies = (c.replies || []).map((r: any) => 
          r.id === replyId ? { ...r, content: editingCommentText.trim() } : r
        );
        return { ...c, replies: updatedReplies };
      }
      return c;
    });

    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    setEditingCommentId(null);

    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ comments: updatedComments })
        .eq('id', postId);
      if (error) throw error;
      showToast("Resposta atualizada!");
    } catch (err) {
      console.error("Erro ao salvar resposta:", err);
      showToast("Erro ao salvar resposta.", "error");
    }
  };

  // Delete Reply action
  const handleDeleteReply = async (postId: string, commentId: string, replyId: string) => {
    const currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;

    showConfirm("Deseja realmente excluir esta resposta?", async () => {
      const updatedComments = (currentPost.comments || []).map(c => {
        if (c.id === commentId) {
          const updatedReplies = (c.replies || []).filter((r: any) => r.id !== replyId);
          return { ...c, replies: updatedReplies };
        }
        return c;
      });

      // Optimistic update
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));

      try {
        const { error } = await supabase
          .from('community_posts')
          .update({ comments: updatedComments })
          .eq('id', postId);
        if (error) throw error;
        showToast("Resposta excluída!");
      } catch (err) {
        console.error("Erro ao excluir resposta:", err);
        showToast("Erro ao excluir resposta.", "error");
      }
    });
  };

  // Filter members list in sidebar
  const filteredSidebarMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.company.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.role.toLowerCase().includes(searchMember.toLowerCase())
  );

  const formatPostTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Há ${Math.max(1, diffMins)} min`;
    if (diffHours < 24) return `Há ${diffHours} h`;
    return `Há ${diffDays} dias`;
  };
  // Group status posts by author
  const statusPosts = posts.filter(p => p.post_type === "status");
  const groupedStories: Record<string, Post[]> = {};
  statusPosts.forEach(post => {
    const author = post.author_name;
    if (!groupedStories[author]) {
      groupedStories[author] = [];
    }
    groupedStories[author].push(post);
  });

  const authorsList = Object.keys(groupedStories);

  // Track story views
  useEffect(() => {
    const authorStories = activeStoryAuthor ? groupedStories[activeStoryAuthor] : null;
    const currentStory = (authorStories && activeStoryIndex < authorStories.length) ? authorStories[activeStoryIndex] : null;

    if (currentUser && currentStory && currentStory.user_id !== currentUser.id) {
      supabase.from('story_views')
        .insert({
          story_id: currentStory.id,
          viewer_id: currentUser.id
        })
        .then((res: any) => {
          const error = res.error;
          if (error && error.code !== '23505') {
            console.error("Erro ao registrar visualização:", error);
          }
        });
    }
  }, [activeStoryAuthor, activeStoryIndex, currentUser?.id]);

  // Load story viewers
  useEffect(() => {
    const authorStories = activeStoryAuthor ? groupedStories[activeStoryAuthor] : null;
    const currentStory = (authorStories && activeStoryIndex < authorStories.length) ? authorStories[activeStoryIndex] : null;

    if (currentStory && currentUser && currentStory.user_id === currentUser.id) {
      supabase
        .from('story_views')
        .select(`
          created_at,
          members (
            id,
            name,
            role,
            img
          )
        `)
        .eq('story_id', currentStory.id)
        .then((res: any) => {
          const data = res.data;
          const error = res.error;
          if (error) {
            console.error("Erro ao buscar visualizadores do story:", error);
          } else {
            const viewersList = (data || []).map((v: any) => ({
              ...v.members,
              viewed_at: v.created_at
            }));
            setStoryViewers(viewersList);
          }
        });
    } else {
      setStoryViewers([]);
      setShowViewersModal(false);
    }
  }, [activeStoryAuthor, activeStoryIndex, currentUser?.id]);

  // Listen to Escape key to close Story Viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showViewersModal) {
          setShowViewersModal(false);
        } else if (activeStoryAuthor) {
          setActiveStoryAuthor(null);
          setActiveStoryIndex(0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeStoryAuthor, showViewersModal]);

  const handleNextStory = () => {
    if (!activeStoryAuthor) return;
    const authorStories = groupedStories[activeStoryAuthor];
    if (activeStoryIndex < authorStories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
    } else {
      const currentAuthorIndex = authorsList.indexOf(activeStoryAuthor);
      if (currentAuthorIndex < authorsList.length - 1) {
        setActiveStoryAuthor(authorsList[currentAuthorIndex + 1]);
        setActiveStoryIndex(0);
      } else {
        setActiveStoryAuthor(null);
        setActiveStoryIndex(0);
      }
    }
  };

  const handlePrevStory = () => {
    if (!activeStoryAuthor) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    } else {
      const currentAuthorIndex = authorsList.indexOf(activeStoryAuthor);
      if (currentAuthorIndex > 0) {
        const prevAuthor = authorsList[currentAuthorIndex - 1];
        setActiveStoryAuthor(prevAuthor);
        setActiveStoryIndex(groupedStories[prevAuthor].length - 1);
      } else {
        setActiveStoryIndex(0);
      }
    }
  };

  const handleQuickStatusClick = () => {
    setPostType("status");
    fileInputRef.current?.click();
  };

  if (loading) {
    return <SkeletonFeed />;
  }

  return (
    <div className="animate-fadeIn">
      {/* Dynamic CSS styles with softer layout and no card shadows */}
      <style dangerouslySetInnerHTML={{ __html: `
        .feed-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .feed-container {
            grid-template-columns: 1fr;
          }
        }
        .feed-post-card {
          background-color: var(--color-surface-container-low);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: none !important;
          transition: border-color 0.2s ease;
        }
        .feed-post-card:hover {
          border-color: rgba(237, 192, 102, 0.25);
        }
        .post-action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--color-on-surface-variant);
          padding: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s, color 0.2s;
        }
        .post-action-btn:hover {
          background-color: rgba(255, 255, 255, 0.04);
          color: var(--color-secondary);
        }
        .post-action-btn.active {
          color: var(--color-secondary);
        }
        .members-sidebar {
          background-color: var(--color-surface-container-low);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 20px;
          box-shadow: none !important;
          position: sticky;
          top: 100px;
        }
        .comment-item {
          display: flex;
          gap: 12px;
          padding: 10px;
          background-color: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
          margin-bottom: 8px;
          border: 1px solid rgba(255,255,255,0.03);
        }
        
        /* Stories UI Styles */
        .stories-container {
          display: flex;
          gap: 16px;
          padding: 16px 4px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          margin-bottom: 16px;
        }
        .stories-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .story-bubble-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .story-bubble {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          padding: 3px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .story-bubble-wrapper:hover .story-bubble {
          transform: scale(1.05);
        }
        .story-bubble.has-stories {
          background: linear-gradient(45deg, #d4af37, #f3e5ab, #aa7c11);
        }
        .story-bubble-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: var(--color-surface);
          border: 2px solid var(--color-surface);
        }
        .story-bubble-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .story-bubble-label {
          font-size: 11px;
          color: var(--color-on-surface-variant);
          max-width: 72px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
        }

        /* Story Modal Viewer */
        .story-viewer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(10, 10, 12, 0.95);
          backdrop-filter: blur(10px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .story-viewer-wrapper {
          position: relative;
          width: 100%;
          max-width: 440px;
          height: 100%;
          max-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .story-viewer-container {
          position: relative;
          width: 100%;
          height: 100%;
          background-color: #000;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }
        @media (max-width: 500px) {
          .story-viewer-wrapper {
            max-height: 100vh;
          }
          .story-viewer-container {
            border-radius: 0;
            border: none;
          }
        }
        .story-viewer-progress-bar-row {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          gap: 6px;
          z-index: 12;
        }
        .story-viewer-progress-bar-bg {
          flex: 1;
          height: 3px;
          background-color: rgba(255, 255, 255, 0.25);
          border-radius: 2px;
          overflow: hidden;
        }
        .story-viewer-progress-bar-fill {
          height: 100%;
          background-color: #ffffff;
          width: 0%;
        }
        .story-viewer-progress-bar-fill.completed {
          width: 100%;
        }
        .story-viewer-progress-bar-fill.active-fill {
          animation: playStoryProgress linear forwards;
        }
        @keyframes playStoryProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .story-viewer-header {
          position: absolute;
          top: 24px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 12;
          padding: 8px;
        }
        .story-viewer-author {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .story-viewer-author img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .story-viewer-author-info h4 {
          font-size: 13px;
          color: #ffffff;
          font-weight: 600;
          margin: 0;
        }
        .story-viewer-author-info span {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
        }
        .story-viewer-media {
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 10;
        }
        .story-viewer-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 15;
          transition: background-color 0.2s;
        }
        .story-viewer-nav-btn:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
        .story-viewer-nav-left { left: -60px; }
        .story-viewer-nav-right { right: -60px; }
        @media (max-width: 600px) {
          .story-viewer-nav-left { left: 10px; opacity: 0.3; }
          .story-viewer-nav-right { right: 10px; opacity: 0.3; }
        }
        .story-viewer-close {
          background: transparent;
          border: none;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .story-viewer-close:hover {
          opacity: 1;
        }
        .story-viewer-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 40px 20px 24px 20px;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          color: #ffffff;
          font-size: 13px;
          line-height: 1.5;
          text-align: center;
          z-index: 12;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        /* Reels UI Styles */
        .reels-tab-nav {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 4px;
        }
        .reels-nav-btn {
          background: transparent;
          border: none;
          color: var(--color-on-surface-variant);
          font-size: 14px;
          font-weight: 600;
          padding: 8px 16px;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }
        .reels-nav-btn.active {
          color: var(--color-secondary);
        }
        .reels-nav-btn.active::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--color-secondary);
        }
        .reels-feed-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }
        .reel-card-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          height: calc(400px * 16 / 9);
          max-height: 75vh;
          aspect-ratio: 9/16;
          background-color: #000;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          margin: 0 auto;
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .reel-video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .reel-right-actions {
          position: absolute;
          right: 12px;
          bottom: 80px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          align-items: center;
          z-index: 15;
        }
        .reel-action-btn-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: rgba(20, 20, 25, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff;
          display: flex;
          align-items: center;
          justifyContent: center;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s, color 0.2s;
        }
        .reel-action-btn-circle:hover {
          transform: scale(1.08);
          background-color: rgba(20, 20, 25, 0.85);
          color: var(--color-secondary);
        }
        .reel-action-btn-circle.liked {
          color: var(--color-secondary);
        }
        .reel-action-label {
          font-size: 11px;
          color: #ffffff;
          font-weight: 600;
          margin-top: 4px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.8);
        }
        .reel-bottom-details {
          position: absolute;
          left: 16px;
          right: 70px;
          bottom: 16px;
          color: #ffffff;
          z-index: 15;
          text-shadow: 0 1px 4px rgba(0,0,0,0.8);
        }
        .reel-author-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .reel-author-row img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          object-fit: cover;
        }
        .reel-author-name {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
        }
        .reel-author-role {
          font-size: 10px;
          color: var(--color-secondary);
          background-color: rgba(0, 0, 0, 0.4);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        .reel-description {
          font-size: 12px;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.95);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .reel-mute-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: rgba(0,0,0,0.5);
          color: #ffffff;
          display: flex;
          align-items: center;
          justifyContent: center;
          z-index: 20;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .reel-mute-indicator.visible {
          opacity: 1;
          animation: fadeMuteIcon 1s ease-in-out forwards;
        }
        @keyframes fadeMuteIcon {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
      `}} />

      {/* Page Header */}
      <section style={{ marginBottom: "32px" }}>
        <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>
          Feed da Comunidade
        </h2>
        <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)" }}>
          Acompanhe as novidades, interaja com postagens e conecte-se com os Masters da comunidade.
        </p>
      </section>

      {/* Content Columns layout */}
      <div className="feed-container" style={activeTab === "reels" ? { gridTemplateColumns: "1fr" } : undefined}>
        
        {/* Left Column: Feed and Publishing */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          
          {/* Tabs navigation: Feed vs Reels */}
          <div className="reels-tab-nav">
            <button 
              type="button"
              className={`reels-nav-btn ${activeTab === "feed" ? "active" : ""}`}
              onClick={() => setActiveTab("feed")}
            >
              Feed da Comunidade
            </button>
            <button 
              type="button"
              className={`reels-nav-btn ${activeTab === "reels" ? "active" : ""}`}
              onClick={() => setActiveTab("reels")}
            >
              Reels CLS
            </button>
          </div>

          {activeTab === "feed" ? (
            <>
              {/* Stories Row */}
              <div className="stories-container">
                {/* Quick status add */}
                <div className="story-bubble-wrapper" onClick={handleQuickStatusClick}>
                  <div className="story-bubble">
                    <div className="story-bubble-inner">
                      {currentMemberInfo?.img ? (
                        <img 
                          src={currentMemberInfo.img} 
                          alt="Você" 
                        />
                      ) : (
                        <div style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "rgba(237, 192, 102, 0.1)",
                          color: "var(--color-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "bold"
                        }}>
                          {currentMemberInfo?.initials || "VC"}
                        </div>
                      )}
                    </div>
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "var(--color-secondary)", border: "2px solid var(--color-surface)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "12px", color: "#000000", fontWeight: "bold" }}>add</span>
                    </div>
                  </div>
                  <span className="story-bubble-label">Novo Status</span>
                </div>

                {/* Grouped stories list */}
                {Object.entries(groupedStories).map(([authorName, authorStories]) => {
                  const avatar = authorStories[0]?.author_avatar || "/magno.jpg";
                  return (
                    <div key={authorName} className="story-bubble-wrapper" onClick={() => {
                      setActiveStoryAuthor(authorName);
                      setActiveStoryIndex(0);
                    }}>
                      <div className="story-bubble has-stories">
                        <div className="story-bubble-inner">
                          <img src={avatar} alt={authorName} />
                        </div>
                      </div>
                      <span className="story-bubble-label">{authorName}</span>
                    </div>
                  );
                })}
              </div>

              {/* Create Post Box */}
              <div className="feed-post-card" style={{ border: "1px solid rgba(237, 192, 102, 0.2)" }}>
            <form onSubmit={handleCreatePost}>
              <div style={{ display: "flex", gap: "16px" }}>
                <MemberBadge
                  name={currentMemberInfo?.name || "Você"}
                  img={currentMemberInfo?.img}
                  initials={currentMemberInfo?.initials}
                  memberType={currentMemberInfo?.member_type}
                  size={40}
                />
                
                <div style={{ flex: 1 }}>
                  <textarea
                    placeholder="Compartilhe um insight, atualização de obra ou dúvida com a comunidade..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "70px",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "var(--color-on-surface)",
                      fontSize: "14px",
                      resize: "none",
                      outline: "none",
                      paddingTop: "8px"
                    }}
                  />

                  {/* Post Type Selector */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "12px 0 6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setPostType("standard")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: postType === "standard" ? "rgba(237, 192, 102, 0.15)" : "transparent",
                        color: postType === "standard" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                        border: postType === "standard" ? "1px solid rgba(237, 192, 102, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>feed</span>
                      Feed Geral
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostType("status")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: postType === "status" ? "rgba(237, 192, 102, 0.15)" : "transparent",
                        color: postType === "status" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                        border: postType === "status" ? "1px solid rgba(237, 192, 102, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>motion_photos_on</span>
                      Status / Story
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostType("reels")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: postType === "reels" ? "rgba(237, 192, 102, 0.15)" : "transparent",
                        color: postType === "reels" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                        border: postType === "reels" ? "1px solid rgba(237, 192, 102, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>play_circle</span>
                      Reels Interno
                    </button>
                  </div>

                  {/* Media Preview Container */}
                  {mediaPreviewUrl && (
                    <div style={{ 
                      position: "relative", 
                      width: postType === "reels" ? "180px" : "100%", 
                      height: postType === "reels" ? "320px" : "220px", 
                      margin: postType === "reels" ? "12px auto" : "12px 0", 
                      borderRadius: "6px", 
                      overflow: "hidden", 
                      border: "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(0,0,0,0.3)"
                    }}>
                      {mediaType === "video" ? (
                        <video src={mediaPreviewUrl} controls muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <img src={mediaPreviewUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Upload Preview" />
                      )}
                      <button
                        type="button"
                        onClick={handleClearImage}
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(0,0,0,0.75)",
                          border: "none",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 10
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
                      </button>
                    </div>
                  )}

                  {/* Toolbar Actions and Publish */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", marginTop: "8px" }}>
                    
                    {/* Add Media Picker */}
                    <div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        id="feed-image-input"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                      <label
                        htmlFor="feed-image-input"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "var(--color-secondary)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(237, 192, 102, 0.08)",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(237, 192, 102, 0.15)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(237, 192, 102, 0.08)"}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>perm_media</span>
                        Adicionar Mídia
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || (!newPostText.trim() && !selectedFile) || (postType === "reels" && (!selectedFile || mediaType !== "video"))}
                      className="btn-primary"
                      style={{
                        padding: "8px 24px",
                        fontSize: "11px",
                        letterSpacing: "0.05em",
                        opacity: (isSubmitting || (!newPostText.trim() && !selectedFile) || (postType === "reels" && (!selectedFile || mediaType !== "video"))) ? 0.5 : 1,
                        cursor: (isSubmitting || (!newPostText.trim() && !selectedFile) || (postType === "reels" && (!selectedFile || mediaType !== "video"))) ? "not-allowed" : "pointer"
                      }}
                    >
                      {isSubmitting ? "Publicando..." : "Publicar"}
                    </button>
                  </div>

                </div>
              </div>
            </form>
          </div>

          {/* Posts List */}
          <div>
            {posts.filter(p => !p.post_type || p.post_type === "standard").map((post) => {
              const userId = currentUser?.id || "mock-user-id";
              const isLiked = (post.liked_by_users || []).includes(userId);
              const isSaved = (post.saved_by_users || []).includes(userId);
              const isCommentsOpen = activeCommentPostId === post.id;

              // Lookup post author dynamically to show their current profile info
              const postAuthor = members.find(m => m.id === post.user_id);
              const authorAvatar = postAuthor?.img || post.author_avatar || "/magno.jpg";
              const authorName = postAuthor?.name || post.author_name;
              const authorRole = postAuthor?.role || post.author_role;

              return (
                <article key={post.id} className="feed-post-card">
                  {/* Post Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <MemberBadge
                        name={authorName}
                        img={authorAvatar}
                        initials={postAuthor?.initials}
                        memberType={postAuthor?.member_type}
                        size={42}
                      />
                      <div>
                        <h4 style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>{authorName}</h4>
                        <span style={{ fontSize: "11px", color: "var(--color-secondary)", fontWeight: 600, display: "block" }}>{authorRole}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "11px", color: "var(--color-outline)" }}>
                        {formatPostTime(post.created_at)}
                      </span>
                      {currentUser && post.user_id === currentUser.id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingPostId(post.id);
                              setEditingPostText(post.content);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--color-on-surface-variant)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              padding: "2px",
                              opacity: 0.6,
                              transition: "opacity 0.2s, color 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "1";
                              e.currentTarget.style.color = "var(--color-secondary)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "0.6";
                              e.currentTarget.style.color = "var(--color-on-surface-variant)";
                            }}
                            title="Editar publicação"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                          </button>

                          <button
                            onClick={() => handleDeletePost(post.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--color-on-surface-variant)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              padding: "2px",
                              opacity: 0.6,
                              transition: "opacity 0.2s, color 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "1";
                              e.currentTarget.style.color = "rgba(239, 68, 68, 0.9)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "0.6";
                              e.currentTarget.style.color = "var(--color-on-surface-variant)";
                            }}
                            title="Excluir publicação"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  {editingPostId === post.id ? (
                    <div style={{ marginBottom: "14px" }}>
                      <textarea
                        value={editingPostText}
                        onChange={(e) => setEditingPostText(e.target.value)}
                        className="input-dark"
                        style={{
                          width: "100%",
                          minHeight: "80px",
                          padding: "10px",
                          fontSize: "14px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(0,0,0,0.2)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          resize: "vertical",
                          outline: "none"
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setEditingPostId(null)}
                          style={{
                            padding: "6px 16px",
                            fontSize: "11px",
                            borderRadius: "4px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "var(--color-outline)",
                            cursor: "pointer",
                            fontWeight: 600
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleUpdatePost(post.id, editingPostText)}
                          style={{
                            padding: "6px 16px",
                            fontSize: "11px",
                            borderRadius: "4px",
                            background: "var(--color-secondary)",
                            border: "none",
                            color: "#000",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: "14px", color: "var(--color-on-surface)", lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "14px" }}>
                        {post.content}
                      </p>

                      {/* Post Image */}
                      {post.image_url && (
                        <div 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("content"); }} 
                          style={{ width: "100%", maxHeight: "380px", borderRadius: "6px", overflow: "hidden", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}
                        >
                          <img 
                            src={post.image_url} 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("content"); }}
                            style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} 
                            alt="Publicação Imagem" 
                          />
                        </div>
                      )}

                      {/* Post Video */}
                      {post.video_url && (
                        <div 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("content"); }} 
                          style={{ width: "100%", maxHeight: "420px", borderRadius: "6px", overflow: "hidden", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "#000", cursor: "pointer" }}
                        >
                          <video src={post.video_url} controls playsInline style={{ width: "100%", maxHeight: "420px", objectFit: "contain", display: "block" }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Likes/Comments Counter statistics */}
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px", marginBottom: "4px", fontSize: "11px", color: "var(--color-on-surface-variant)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("likes"); }}>
                      {/* 3 mini avatars */}
                      <div style={{ display: "flex", marginLeft: "2px", marginRight: "4px" }}>
                        {(post.liked_by_users || []).slice(0, 3).map((userId, i) => {
                          const liker = members.find(m => m.id === userId);
                          return (
                            <img 
                              key={i} 
                              src={liker?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200"} 
                              style={{ width: "16px", height: "16px", borderRadius: "50%", objectFit: "cover", border: "1px solid #1c1b1e", marginLeft: i > 0 ? "-6px" : "0", zIndex: 3 - i }} 
                              alt="User" 
                            />
                          );
                        })}
                      </div>

                      <span className="material-symbols-outlined" style={{ fontSize: "14px", color: (post.liked_by_users || []).length > 0 ? "var(--color-secondary)" : "var(--color-outline)", fontVariationSettings: `'FILL' ${(post.liked_by_users || []).length > 0 ? 1 : 0}` }}>thumb_up</span>
                      {(post.liked_by_users || []).length} curtidas
                    </div>
                    <div style={{ cursor: "pointer" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("comments"); }} className="hover-gold-text">
                      {post.comments?.length || 0} comentários
                    </div>
                  </div>

                  {/* Actions buttons (Like, Comment, Save) strictly NO RED */}
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`post-action-btn ${isLiked ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: ` 'FILL' ${isLiked ? 1 : 0} ` }}>
                        thumb_up
                      </span>
                      Curtir
                    </button>
                    
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("comments"); }}
                      className={`post-action-btn`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                        forum
                      </span>
                      Comentar
                    </button>

                    <button
                      onClick={() => handleSavePost(post.id)}
                      className={`post-action-btn ${isSaved ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: ` 'FILL' ${isSaved ? 1 : 0} ` }}>
                        bookmark
                      </span>
                      Salvar
                    </button>
                  </div>

                  {/* Comments section (collapsible panel) */}
                  {isCommentsOpen && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "12px", paddingTop: "16px" }}>
                      {/* Comments list */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "350px", overflowY: "auto", paddingRight: "4px", marginBottom: "16px" }} className="hide-scroll">
                        {(post.comments || []).map((comment) => {
                          const isCommentOwner = currentUser && (comment.user_id === currentUser.id || (!comment.user_id && comment.author_name === currentMemberInfo?.name));
                          const isPostOwner = currentUser && post.user_id === currentUser.id;
                          const isEditingComment = editingCommentId === comment.id;
                          const isReplying = replyingCommentId === comment.id;
                          const commentAuthor = members.find(m => m.id === comment.user_id);

                          return (
                            <div key={comment.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {/* Main Comment Row */}
                              <div className="comment-item" style={{ marginBottom: 0 }}>
                                <MemberBadge
                                  name={comment.author_name}
                                  img={comment.author_avatar}
                                  initials={commentAuthor?.initials}
                                  memberType={commentAuthor?.member_type}
                                  size={30}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>{comment.author_name}</span>
                                    <span style={{ fontSize: "9px", color: "var(--color-outline)" }}>{formatPostTime(comment.created_at)}</span>
                                  </div>

                                  {isEditingComment ? (
                                    <div style={{ marginTop: "4px" }}>
                                      <input
                                        type="text"
                                        value={editingCommentText}
                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                        className="input-dark"
                                        style={{
                                          width: "100%",
                                          padding: "6px 10px",
                                          fontSize: "12px",
                                          borderRadius: "4px",
                                          backgroundColor: "rgba(0,0,0,0.2)",
                                          border: "1px solid rgba(255,255,255,0.1)",
                                          color: "#fff",
                                          outline: "none"
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveEditComment(post.id, comment.id);
                                        }}
                                      />
                                      <div style={{ display: "flex", gap: "6px", marginTop: "4px", justifyContent: "flex-end" }}>
                                        <button
                                          onClick={() => setEditingCommentId(null)}
                                          style={{ background: "transparent", border: "none", color: "var(--color-outline)", fontSize: "10px", cursor: "pointer" }}
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          onClick={() => handleSaveEditComment(post.id, comment.id)}
                                          style={{ background: "transparent", border: "none", color: "var(--color-secondary)", fontSize: "10px", fontWeight: "600", cursor: "pointer" }}
                                        >
                                          Salvar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", lineHeight: "1.4", margin: 0 }}>{comment.content}</p>
                                      
                                      {/* Comment Actions */}
                                      <div style={{ display: "flex", gap: "12px", marginTop: "6px", alignItems: "center" }}>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Mock the visual change locally until DB is connected
                                            setPosts(prev => prev.map(p => {
                                              if (p.id === post.id) {
                                                return {
                                                  ...p,
                                                  comments: p.comments.map(c => {
                                                    if (c.id === comment.id) {
                                                      const hasLiked = (c.liked_by_users || []).includes(currentUser?.id || "mock");
                                                      return {
                                                        ...c,
                                                        likes_count: (c.likes_count || 0) + (hasLiked ? -1 : 1),
                                                        liked_by_users: hasLiked 
                                                          ? (c.liked_by_users || []).filter(id => id !== (currentUser?.id || "mock"))
                                                          : [...(c.liked_by_users || []), currentUser?.id || "mock"]
                                                      }
                                                    }
                                                    return c;
                                                  })
                                                }
                                              }
                                              return p;
                                            }));
                                            showToast("Curtiu comentário", "success");
                                          }}
                                          style={{
                                            background: "transparent",
                                            border: "none",
                                            color: (comment.liked_by_users || []).includes(currentUser?.id || "mock") ? "var(--color-secondary)" : "var(--color-outline)",
                                            fontSize: "10px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            padding: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "2px"
                                          }}
                                          className="hover-opacity"
                                        >
                                          <span className="material-symbols-outlined" style={{ fontSize: "12px", fontVariationSettings: `'FILL' ${(comment.liked_by_users || []).includes(currentUser?.id || "mock") ? 1 : 0}` }}>thumb_up</span>
                                          {comment.likes_count || 0}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setReplyingCommentId(isReplying ? null : comment.id);
                                            setReplyTexts(prev => ({ ...prev, [comment.id]: "" }));
                                          }}
                                          style={{
                                            background: "transparent",
                                            border: "none",
                                            color: "var(--color-outline)",
                                            fontSize: "10px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            padding: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "2px"
                                          }}
                                          className="hover-opacity"
                                        >
                                          <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>reply</span>
                                          Responder
                                        </button>

                                        {isCommentOwner && (
                                          <button
                                            onClick={() => {
                                              setEditingCommentId(comment.id);
                                              setEditingCommentText(comment.content);
                                            }}
                                            style={{
                                              background: "transparent",
                                              border: "none",
                                              color: "var(--color-outline)",
                                              fontSize: "10px",
                                              fontWeight: "600",
                                              cursor: "pointer",
                                              padding: 0,
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "2px"
                                            }}
                                            className="hover-opacity"
                                          >
                                            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>edit</span>
                                            Editar
                                          </button>
                                        )}

                                        {(isCommentOwner || isPostOwner) && (
                                          <button
                                            onClick={() => handleDeleteComment(post.id, comment.id)}
                                            style={{
                                              background: "transparent",
                                              border: "none",
                                              color: "rgba(239, 68, 68, 0.8)",
                                              fontSize: "10px",
                                              fontWeight: "600",
                                              cursor: "pointer",
                                              padding: 0,
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "2px"
                                            }}
                                            className="hover-opacity"
                                          >
                                            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>delete</span>
                                            Excluir
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Nested Replies Rendering */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div style={{ paddingLeft: "36px", marginTop: "2px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                  {comment.replies.map((reply: any) => {
                                    const isReplyOwner = currentUser && (reply.user_id === currentUser.id || (!reply.user_id && reply.author_name === currentMemberInfo?.name));
                                    const isEditingReply = editingCommentId === reply.id;
                                    const replyAuthor = members.find(m => m.id === reply.user_id);

                                    return (
                                      <div key={reply.id} className="comment-item" style={{ margin: 0, padding: "8px", backgroundColor: "rgba(255, 255, 255, 0.01)" }}>
                                        <MemberBadge
                                          name={reply.author_name}
                                          img={reply.author_avatar}
                                          initials={replyAuthor?.initials}
                                          memberType={replyAuthor?.member_type}
                                          size={24}
                                        />
                                        <div style={{ flex: 1 }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>{reply.author_name}</span>
                                            <span style={{ fontSize: "8px", color: "var(--color-outline)" }}>{formatPostTime(reply.created_at)}</span>
                                          </div>
                                          
                                          {isEditingReply ? (
                                            <div style={{ marginTop: "4px" }}>
                                              <input
                                                type="text"
                                                value={editingCommentText}
                                                onChange={(e) => setEditingCommentText(e.target.value)}
                                                className="input-dark"
                                                style={{
                                                  width: "100%",
                                                  padding: "4px 8px",
                                                  fontSize: "11px",
                                                  borderRadius: "4px",
                                                  backgroundColor: "rgba(0,0,0,0.2)",
                                                  border: "1px solid rgba(255,255,255,0.1)",
                                                  color: "#fff",
                                                  outline: "none"
                                                }}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') handleSaveEditReply(post.id, comment.id, reply.id);
                                                }}
                                              />
                                              <div style={{ display: "flex", gap: "6px", marginTop: "4px", justifyContent: "flex-end" }}>
                                                <button
                                                  onClick={() => setEditingCommentId(null)}
                                                  style={{ background: "transparent", border: "none", color: "var(--color-outline)", fontSize: "9px", cursor: "pointer" }}
                                                >
                                                  Cancelar
                                                </button>
                                                <button
                                                  onClick={() => handleSaveEditReply(post.id, comment.id, reply.id)}
                                                  style={{ background: "transparent", border: "none", color: "var(--color-secondary)", fontSize: "9px", fontWeight: "600", cursor: "pointer" }}
                                                >
                                                  Salvar
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <>
                                              <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", lineHeight: "1.4", margin: 0 }}>{reply.content}</p>
                                              <div style={{ display: "flex", gap: "10px", marginTop: "4px", alignItems: "center" }}>
                                                {isReplyOwner && (
                                                  <button
                                                    onClick={() => {
                                                      setEditingCommentId(reply.id);
                                                      setEditingCommentText(reply.content);
                                                    }}
                                                    style={{
                                                      background: "transparent",
                                                      border: "none",
                                                      color: "var(--color-outline)",
                                                      fontSize: "9px",
                                                      fontWeight: "600",
                                                      cursor: "pointer",
                                                      padding: 0,
                                                      display: "flex",
                                                      alignItems: "center",
                                                      gap: "2px"
                                                    }}
                                                    className="hover-opacity"
                                                  >
                                                    Editar
                                                  </button>
                                                )}
                                                {(isReplyOwner || isCommentOwner || isPostOwner) && (
                                                  <button
                                                    onClick={() => handleDeleteReply(post.id, comment.id, reply.id)}
                                                    style={{
                                                      background: "transparent",
                                                      border: "none",
                                                      color: "rgba(239, 68, 68, 0.8)",
                                                      fontSize: "9px",
                                                      fontWeight: "600",
                                                      cursor: "pointer",
                                                      padding: 0,
                                                      display: "flex",
                                                      alignItems: "center",
                                                      gap: "2px"
                                                    }}
                                                    className="hover-opacity"
                                                  >
                                                    Excluir
                                                  </button>
                                                )}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Add nested reply form */}
                              {isReplying && (
                                <div style={{ paddingLeft: "36px", display: "flex", gap: "8px", alignItems: "center", marginTop: "4px", marginBottom: "8px" }}>
                                  <input
                                    type="text"
                                    placeholder="Escreva uma resposta..."
                                    value={replyTexts[comment.id] || ""}
                                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAddReply(post.id, comment.id);
                                    }}
                                    className="input-dark"
                                    style={{
                                      flex: 1,
                                      padding: "6px 10px",
                                      fontSize: "11px",
                                      borderRadius: "100px",
                                      backgroundColor: "rgba(0,0,0,0.2)",
                                      outline: "none"
                                    }}
                                  />
                                  <button
                                    onClick={() => handleAddReply(post.id, comment.id)}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      color: "var(--color-secondary)",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center"
                                    }}
                                    className="hover-opacity"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>send</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add comment form */}
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", overflow: "hidden", border: "1.5px solid var(--color-secondary)", backgroundColor: "rgba(237, 192, 102, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {currentMemberInfo?.img ? (
                            <img src={currentMemberInfo.img} alt="Você" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ color: "var(--color-secondary)", fontSize: "9px", fontWeight: "bold" }}>
                              {currentMemberInfo?.initials || "VC"}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Escreva um comentário..."
                          value={commentTexts[post.id] || ""}
                          onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          className="input-dark"
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            fontSize: "12px",
                            borderRadius: "100px",
                            backgroundColor: "rgba(0,0,0,0.2)"
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--color-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center"
                          }}
                          className="hover-opacity"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>send</span>
                        </button>
                      </div>

                    </div>
                  )}

                </article>
              );
            })}
          </div>
          </>
          ) : (
            /* Reels Feed */
            <div className="reels-feed-container">
              {posts.filter(p => p.post_type === "reels").length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--color-on-surface-variant)", padding: "40px 20px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--color-secondary)", marginBottom: "16px" }}>play_circle</span>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Nenhum Reel publicado ainda.</p>
                  <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>Seja o primeiro a publicar um Reel interno para os Masters!</p>
                </div>
              ) : (
                posts.filter(p => p.post_type === "reels").map((reel) => {
                  return (
                    <ReelCard 
                      key={reel.id} 
                      reel={reel}
                      currentUser={currentUser}
                      onLike={handleLikePost}
                      onSave={handleSavePost}
                      onDelete={handleDeletePost}
                      onCommentClick={(id) => {
                        setActiveCommentPostId(activeCommentPostId === id ? null : id);
                      }}
                      activeCommentPostId={activeCommentPostId}
                      commentTexts={commentTexts}
                      setCommentTexts={setCommentTexts}
                      onAddComment={handleAddComment}
                      formatPostTime={formatPostTime}
                      currentMemberInfo={currentMemberInfo}
                      members={members}
                      onEditComment={handleSaveEditComment}
                      onDeleteComment={handleDeleteComment}
                      onAddReply={handleAddReply}
                      onEditReply={handleSaveEditReply}
                      onDeleteReply={handleDeleteReply}
                      editingCommentId={editingCommentId}
                      setEditingCommentId={setEditingCommentId}
                      editingCommentText={editingCommentText}
                      setEditingCommentText={setEditingCommentText}
                      replyingCommentId={replyingCommentId}
                      setReplyingCommentId={setReplyingCommentId}
                      replyTexts={replyTexts}
                      setReplyTexts={setReplyTexts}
                    />
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Right Column: CPROCLS Members Sidebar List */}
        {activeTab === "feed" && (
          <div className="members-sidebar">
            <h3
              className="font-title-lg"
              style={{
                fontSize: "16px",
                color: "var(--color-on-surface)",
                marginBottom: "16px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "20px" }}>groups</span>
              Masters
            </h3>

            {/* Search member field in sidebar */}
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "16px" }}>
                search
              </span>
              <input
                type="text"
                placeholder="Buscar Master..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="input-dark font-body-sm"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: "rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}
              />
            </div>

            {/* Sidebar Members list scroll */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }} className="hide-scroll">
              {filteredSidebarMembers.map((member) => (
                <div key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <MemberBadge
                      name={member.name}
                      img={member.img}
                      initials={member.initials}
                      memberType={member.member_type}
                      size={32}
                    />
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff", display: "block" }}>{member.name}</span>
                      <span style={{ fontSize: "9px", color: "var(--color-outline)", display: "block" }}>{member.role} na {member.company}</span>
                    </div>
                  </div>

                  {/* Connect quick action trigger */}
                  {(() => {
                    const status = getConnectionStatus(member.id);
                    if (status === "self") return null;

                    let label = "CONECTAR";
                    let isPending = false;
                    let isAccepted = false;

                    if (status === "pending_sent") {
                      label = "PENDENTE";
                      isPending = true;
                    } else if (status === "pending_received") {
                      label = "ACEITAR";
                    } else if (status === "accepted") {
                      label = "CONECTADO";
                      isAccepted = true;
                    }
                    
                    return (
                      <button
                        onClick={() => !isAccepted && !isPending && handleConnectAction(member.id, member.name)}
                        disabled={isPending || isAccepted}
                        style={{
                          backgroundColor: isAccepted 
                            ? "rgba(16, 185, 129, 0.1)" 
                            : isPending 
                              ? "rgba(255, 255, 255, 0.04)" 
                              : "rgba(237, 192, 102, 0.08)",
                          border: isAccepted 
                            ? "1px solid rgba(16, 185, 129, 0.3)" 
                            : isPending 
                              ? "1px solid rgba(255, 255, 255, 0.1)" 
                              : "1px solid rgba(237, 192, 102, 0.25)",
                          borderRadius: "4px",
                          color: isAccepted 
                            ? "#10b981" 
                            : isPending 
                              ? "var(--color-outline)" 
                              : "var(--color-secondary)",
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          cursor: (isPending || isAccepted) ? "default" : "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          if (!isPending && !isAccepted) {
                            e.currentTarget.style.backgroundColor = "var(--color-secondary)";
                            e.currentTarget.style.color = "var(--color-on-secondary)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isPending && !isAccepted) {
                            e.currentTarget.style.backgroundColor = "rgba(237, 192, 102, 0.08)";
                            e.currentTarget.style.color = "var(--color-secondary)";
                          }
                        }}
                      >
                        {label}
                      </button>
                    );
                  })()}
                </div>
              ))}
              {filteredSidebarMembers.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--color-on-surface-variant)", fontSize: "12px" }}>
                  Nenhum membro encontrado.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <div style={{ height: "48px" }} />

      {/* Story Viewer Modal */}
      {activeStoryAuthor && groupedStories[activeStoryAuthor] && (() => {
        const authorStories = groupedStories[activeStoryAuthor];
        const currentStory = authorStories[activeStoryIndex];
        if (!currentStory) return null;

        const storyAuthor = members.find(m => m.id === currentStory.user_id);
        const storyAuthorAvatar = storyAuthor?.img || currentStory.author_avatar || "/magno.jpg";
        const storyAuthorName = storyAuthor?.name || currentStory.author_name;

        return (
          <div className="story-viewer-backdrop" onClick={() => {
            setActiveStoryAuthor(null);
            setActiveStoryIndex(0);
          }}>
            {/* Centered Relative Wrapper */}
            <div className="story-viewer-wrapper" onClick={(e) => e.stopPropagation()}>
              {/* Prev Button (Desktop) */}
              <button 
                type="button"
                className="story-viewer-nav-btn story-viewer-nav-left"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevStory();
                }}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>

              {/* Main Container */}
              <div className="story-viewer-container">
              {/* Progress Bars */}
              <div className="story-viewer-progress-bar-row">
                {authorStories.map((story, index) => {
                  const isStoryPaused = (customDialog && customDialog.isOpen) || showViewersModal;
                  let fillClass = "";
                  let animStyle: any = {};
                  if (index < activeStoryIndex) {
                    fillClass = "completed";
                  } else if (index === activeStoryIndex) {
                    fillClass = "active-fill";
                    animStyle = { 
                      animationDuration: `${storyDuration / 1000}s`,
                      animationPlayState: isStoryPaused ? "paused" : "running"
                    };
                  }
                  return (
                    <div key={story.id} className="story-viewer-progress-bar-bg">
                      <div 
                        key={`${story.id}-${storyDuration}`}
                        className={`story-viewer-progress-bar-fill ${fillClass}`} 
                        style={animStyle}
                        onAnimationEnd={() => {
                          if (index === activeStoryIndex) {
                            handleNextStory();
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Header */}
              <div className="story-viewer-header">
                <div className="story-viewer-author">
                  <img src={storyAuthorAvatar} alt={storyAuthorName} />
                  <div className="story-viewer-author-info">
                    <h4>{storyAuthorName}</h4>
                    <span>{formatPostTime(currentStory.created_at)}</span>
                  </div>
                </div>
                {currentUser && currentStory.user_id === currentUser.id && (
                  <button
                    type="button"
                    className="story-viewer-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStory(currentStory.id);
                    }}
                    title="Excluir status"
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.75)",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "8px",
                      transition: "color 0.2s"
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>delete</span>
                  </button>
                )}
                <button 
                  type="button"
                  className="story-viewer-close"
                  onClick={() => {
                    setActiveStoryAuthor(null);
                    setActiveStoryIndex(0);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>close</span>
                </button>
              </div>

              {/* Media content */}
              {currentStory.video_url ? (
                <video 
                  ref={storyVideoRef}
                  key={currentStory.id}
                  src={currentStory.video_url} 
                  autoPlay 
                  muted={false}
                  playsInline
                  className="story-viewer-media"
                  onLoadedMetadata={(e) => {
                    const dur = e.currentTarget.duration * 1000;
                    setStoryDuration(dur || 5000);
                  }}
                  onEnded={() => {
                    handleNextStory();
                  }}
                />
              ) : (
                <img 
                  key={currentStory.id}
                  src={currentStory.image_url || ""} 
                  className="story-viewer-media" 
                  alt="Status"
                  onLoad={() => {
                    setStoryDuration(5000);
                  }}
                />
              )}

              {/* Caption */}
              {currentStory.content && (
                <div className="story-viewer-caption" style={{ bottom: currentUser && currentStory.user_id === currentUser.id ? "48px" : "0" }}>
                  <p style={{ margin: 0 }}>{currentStory.content}</p>
                </div>
              )}

              {/* Views Bar (Instagram style) */}
              {currentUser && currentStory.user_id === currentUser.id && (
                <div 
                  className="story-viewer-views-bar"
                  onClick={() => setShowViewersModal(true)}
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    zIndex: 20,
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 600,
                    backdropFilter: "blur(4px)",
                    transition: "background-color 0.2s"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility</span>
                  <span>{storyViewers.length} {storyViewers.length === 1 ? "visualização" : "visualizações"}</span>
                </div>
              )}

              {/* Story Viewers slide-up drawer */}
              {showViewersModal && (
                <div 
                  className="story-viewers-drawer"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "60%",
                    backgroundColor: "rgba(20, 20, 25, 0.95)",
                    backdropFilter: "blur(12px)",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                    zIndex: 30,
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px",
                    animation: "slideUp 0.3s ease-out forwards"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--color-secondary)" }}>visibility</span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>Visto por ({storyViewers.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowViewersModal(false)}
                      style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
                    </button>
                  </div>

                  <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }} className="custom-scrollbar">
                    {storyViewers.length === 0 ? (
                      <div style={{ textAlign: "center", color: "var(--color-on-surface-variant)", padding: "30px 10px", fontSize: "12px" }}>
                        Nenhuma visualização ainda.
                      </div>
                    ) : (
                      storyViewers.map((viewer) => (
                        <div key={viewer.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                              <img src={viewer.img || "/magno.jpg"} alt={viewer.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ textAlign: "left" }}>
                              <h5 style={{ fontSize: "12px", color: "#ffffff", fontWeight: 600, margin: 0 }}>{viewer.name}</h5>
                              <span style={{ fontSize: "10px", color: "var(--color-on-surface-variant)", display: "block" }}>{viewer.role}</span>
                            </div>
                          </div>
                          <span style={{ fontSize: "10px", color: "var(--color-outline)" }}>
                            {formatPostTime(viewer.viewed_at)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Next Button (Desktop) */}
            <button 
              type="button"
              className="story-viewer-nav-btn story-viewer-nav-right"
              onClick={(e) => {
                e.stopPropagation();
                handleNextStory();
              }}
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          </div>
          );
      })()}

      {/* Toast Notification */}
      {toast && (
        <div
          className="glass-panel"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "16px 24px",
            borderRadius: "8px",
            border: toast.type === "success" ? "1px solid rgba(212, 175, 55, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
            backgroundColor: "rgba(20, 20, 25, 0.95)",
            color: toast.type === "success" ? "var(--color-secondary)" : "#ef4444",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Custom Dialog Modal (Alert/Confirm) */}
      {customDialog && customDialog.isOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(10, 10, 12, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10005,
            animation: "fadeIn 0.2s ease-out"
          }}
          onClick={() => {
            if (customDialog.type === "alert") {
              setCustomDialog(null);
            }
          }}
        >
          <div 
            style={{
              backgroundColor: "var(--color-surface-container-low)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              animation: "scaleUp 0.2s ease-out"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
              {customDialog.title}
            </h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: "var(--color-on-surface-variant)", lineHeight: "1.5" }}>
              {customDialog.message}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              {customDialog.type === "confirm" && (
                <button
                  type="button"
                  onClick={() => setCustomDialog(null)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "4px",
                    color: "var(--color-on-surface-variant)",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "8px 16px",
                    cursor: "pointer"
                  }}
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (customDialog.onConfirm) {
                    customDialog.onConfirm();
                  }
                  setCustomDialog(null);
                }}
                style={{
                  backgroundColor: "var(--color-secondary)",
                  border: "none",
                  borderRadius: "4px",
                  color: "#000000",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "8px 16px",
                  cursor: "pointer"
                }}
              >
                {customDialog.type === "confirm" ? "Confirmar" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

interface ReelCardProps {
  reel: Post;
  currentUser: any;
  onLike: (id: string) => Promise<void>;
  onSave: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  activeCommentPostId: string | null;
  onCommentClick: (id: string) => void;
  commentTexts: Record<string, string>;
  setCommentTexts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAddComment: (id: string) => Promise<void>;
  formatPostTime: (iso: string) => string;
  currentMemberInfo: any;
  members: any[];
  onEditComment: (postId: string, commentId: string) => Promise<void>;
  onDeleteComment: (postId: string, commentId: string) => Promise<void>;
  onAddReply: (postId: string, commentId: string) => Promise<void>;
  onEditReply: (postId: string, commentId: string, replyId: string) => Promise<void>;
  onDeleteReply: (postId: string, commentId: string, replyId: string) => Promise<void>;
  editingCommentId: string | null;
  setEditingCommentId: (id: string | null) => void;
  editingCommentText: string;
  setEditingCommentText: (text: string) => void;
  replyingCommentId: string | null;
  setReplyingCommentId: (id: string | null) => void;
  replyTexts: Record<string, string>;
  setReplyTexts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

function ReelCard({
  reel,
  currentUser,
  onLike,
  onSave,
  onDelete,
  activeCommentPostId,
  onCommentClick,
  commentTexts,
  setCommentTexts,
  onAddComment,
  formatPostTime,
  currentMemberInfo,
  members,
  onEditComment,
  onDeleteComment,
  onAddReply,
  onEditReply,
  onDeleteReply,
  editingCommentId,
  setEditingCommentId,
  editingCommentText,
  setEditingCommentText,
  replyingCommentId,
  setReplyingCommentId,
  replyTexts,
  setReplyTexts
}: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [showMuteIcon, setShowMuteIcon] = useState(false);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);

  const postAuthor = members?.find(m => m.id === reel.user_id);
  const authorAvatar = postAuthor?.img || reel.author_avatar || "/magno.jpg";
  const authorName = postAuthor?.name || reel.author_name;
  const authorRole = postAuthor?.role || reel.author_role;

  // Play/Pause on viewport intersection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch((err) => console.log("Autoplay blocked:", err));
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 } // Play when 60% in view
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    const newMuted = !muted;
    videoRef.current.muted = newMuted;
    setMuted(newMuted);
    setShowMuteIcon(true);
    setTimeout(() => {
      setShowMuteIcon(false);
    }, 1000);
  };

  const userId = currentUser?.id || "mock-user-id";
  const isLiked = (reel.liked_by_users || []).includes(userId);
  const isSaved = (reel.saved_by_users || []).includes(userId);

  return (
    <div className="reel-card-container">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.video_url || ""}
        loop
        muted={muted}
        playsInline
        className="reel-video-element"
        onClick={handleVideoClick}
      />

      {/* Mute Indicator overlay */}
      <div className={`reel-mute-indicator ${showMuteIcon ? "visible" : ""}`}>
        <span className="material-symbols-outlined" style={{ fontSize: "36px" }}>
          {muted ? "volume_off" : "volume_up"}
        </span>
      </div>

      {/* Side Overlay Actions */}
      <div className="reel-right-actions">
        {/* Like */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button
            className={`reel-action-btn-circle ${isLiked ? "liked" : ""}`}
            onClick={() => onLike(reel.id)}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isLiked ? 1 : 0}` }}>
              thumb_up
            </span>
          </button>
          <span className="reel-action-label">{reel.likes_count}</span>
        </div>

        {/* Comments Button */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button
            className={`reel-action-btn-circle`}
            onClick={() => setCommentsDrawerOpen(!commentsDrawerOpen)}
          >
            <span className="material-symbols-outlined">forum</span>
          </button>
          <span className="reel-action-label">{reel.comments?.length || 0}</span>
        </div>

        {/* Save */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button
            className={`reel-action-btn-circle ${isSaved ? "liked" : ""}`}
            onClick={() => onSave(reel.id)}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isSaved ? 1 : 0}` }}>
              bookmark
            </span>
          </button>
          <span className="reel-action-label">Salvar</span>
        </div>

        {/* Delete */}
        {currentUser && reel.user_id === currentUser.id && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              className="reel-action-btn-circle"
              onClick={() => onDelete(reel.id)}
              style={{ color: "rgba(255, 75, 75, 0.95)", border: "1px solid rgba(255, 75, 75, 0.3)" }}
              title="Excluir Reel"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
            <span className="reel-action-label" style={{ color: "rgba(255, 75, 75, 0.95)" }}>Excluir</span>
          </div>
        )}
      </div>

      {/* Bottom Info Overlay */}
      <div className="reel-bottom-details">
        <div className="reel-author-row">
          <MemberBadge
            name={authorName}
            img={authorAvatar}
            initials={postAuthor?.initials}
            memberType={postAuthor?.member_type}
            size={32}
          />
          <span className="reel-author-name">{authorName}</span>
          <span className="reel-author-role">{authorRole}</span>
        </div>
        <p className="reel-description" style={{ margin: 0 }}>
          {reel.content}
        </p>
      </div>

      {/* Comments Drawer Slide-Up overlay */}
      {commentsDrawerOpen && (
        <div 
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            backgroundColor: "rgba(19, 19, 22, 0.95)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            zIndex: 30,
            display: "flex",
            flexDirection: "column",
            animation: "slideUp 0.3s ease-out"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>
              Comentários ({reel.comments?.length || 0})
            </span>
            <button 
              style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer" }}
              onClick={() => setCommentsDrawerOpen(false)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
            </button>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }} className="hide-scroll">
            {(reel.comments || []).length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--color-on-surface-variant)", padding: "20px 0", fontSize: "11px" }}>
                Nenhum comentário. Seja o primeiro a comentar!
              </div>
            ) : (
              (reel.comments || []).map((comment) => {
                const isCommentOwner = currentUser && (comment.user_id === currentUser.id || (!comment.user_id && comment.author_name === currentMemberInfo?.name));
                const isPostOwner = currentUser && reel.user_id === currentUser.id;
                const isEditingComment = editingCommentId === comment.id;
                const isReplying = replyingCommentId === comment.id;

                return (
                  <div key={comment.id} style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {(() => {
                        const commentAuthor = members.find(m => m.id === comment.user_id);
                        return (
                          <MemberBadge
                            name={comment.author_name}
                            img={comment.author_avatar}
                            initials={commentAuthor?.initials}
                            memberType={commentAuthor?.member_type}
                            size={28}
                          />
                        );
                      })()}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>{comment.author_name}</span>
                          <span style={{ fontSize: "8px", color: "var(--color-outline)" }}>{formatPostTime(comment.created_at)}</span>
                        </div>
                        
                        {isEditingComment ? (
                          <div style={{ marginTop: "4px" }}>
                            <input
                              type="text"
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "4px 8px",
                                fontSize: "11px",
                                borderRadius: "4px",
                                backgroundColor: "rgba(255,255,255,0.08)",
                                border: "none",
                                color: "#ffffff",
                                outline: "none"
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') onEditComment(reel.id, comment.id);
                              }}
                            />
                            <div style={{ display: "flex", gap: "6px", marginTop: "4px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => setEditingCommentId(null)}
                                style={{ background: "transparent", border: "none", color: "var(--color-outline)", fontSize: "9px", cursor: "pointer" }}
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => onEditComment(reel.id, comment.id)}
                                style={{ background: "transparent", border: "none", color: "var(--color-secondary)", fontSize: "9px", fontWeight: "600", cursor: "pointer" }}
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", margin: "2px 0 0 0", lineHeight: "1.4" }}>
                              {comment.content}
                            </p>
                            
                            <div style={{ display: "flex", gap: "10px", marginTop: "4px", alignItems: "center" }}>
                              <button
                                onClick={() => {
                                  setReplyingCommentId(isReplying ? null : comment.id);
                                  setReplyTexts(prev => ({ ...prev, [comment.id]: "" }));
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--color-outline)",
                                  fontSize: "9px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  padding: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px"
                                }}
                              >
                                Responder
                              </button>

                              {isCommentOwner && (
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingCommentText(comment.content);
                                  }}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--color-outline)",
                                    fontSize: "9px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    padding: 0
                                  }}
                                >
                                  Editar
                                </button>
                              )}

                              {(isCommentOwner || isPostOwner) && (
                                <button
                                  onClick={() => onDeleteComment(reel.id, comment.id)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "rgba(255, 75, 75, 0.95)",
                                    fontSize: "9px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    padding: 0
                                  }}
                                >
                                  Excluir
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Nested replies inside Reels */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div style={{ paddingLeft: "38px", display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                        {comment.replies.map((reply: any) => {
                          const isReplyOwner = currentUser && (reply.user_id === currentUser.id || (!reply.user_id && reply.author_name === currentMemberInfo?.name));
                          const isEditingReply = editingCommentId === reply.id;

                          return (
                            <div key={reply.id} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              {(() => {
                                const replyAuthor = members.find(m => m.id === reply.user_id);
                                return (
                                  <MemberBadge
                                    name={reply.author_name}
                                    img={reply.author_avatar}
                                    initials={replyAuthor?.initials}
                                    memberType={replyAuthor?.member_type}
                                    size={22}
                                  />
                                );
                              })()}
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#ffffff" }}>{reply.author_name}</span>
                                  <span style={{ fontSize: "7px", color: "var(--color-outline)" }}>{formatPostTime(reply.created_at)}</span>
                                </div>
                                
                                {isEditingReply ? (
                                  <div style={{ marginTop: "4px" }}>
                                    <input
                                      type="text"
                                      value={editingCommentText}
                                      onChange={(e) => setEditingCommentText(e.target.value)}
                                      style={{
                                        width: "100%",
                                        padding: "4px 8px",
                                        fontSize: "10px",
                                        borderRadius: "4px",
                                        backgroundColor: "rgba(255,255,255,0.08)",
                                        border: "none",
                                        color: "#ffffff",
                                        outline: "none"
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') onEditReply(reel.id, comment.id, reply.id);
                                      }}
                                    />
                                    <div style={{ display: "flex", gap: "6px", marginTop: "4px", justifyContent: "flex-end" }}>
                                      <button
                                        onClick={() => setEditingCommentId(null)}
                                        style={{ background: "transparent", border: "none", color: "var(--color-outline)", fontSize: "8px", cursor: "pointer" }}
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        onClick={() => onEditReply(reel.id, comment.id, reply.id)}
                                        style={{ background: "transparent", border: "none", color: "var(--color-secondary)", fontSize: "8px", fontWeight: "600", cursor: "pointer" }}
                                      >
                                        Salvar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", margin: "2px 0 0 0", lineHeight: "1.4" }}>
                                      {reply.content}
                                    </p>
                                    
                                    <div style={{ display: "flex", gap: "8px", marginTop: "2px", alignItems: "center" }}>
                                      {isReplyOwner && (
                                        <button
                                          onClick={() => {
                                            setEditingCommentId(reply.id);
                                            setEditingCommentText(reply.content);
                                          }}
                                          style={{
                                            background: "transparent",
                                            border: "none",
                                            color: "var(--color-outline)",
                                            fontSize: "8px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            padding: 0
                                          }}
                                        >
                                          Editar
                                        </button>
                                      )}

                                      {(isReplyOwner || isCommentOwner || isPostOwner) && (
                                        <button
                                          onClick={() => onDeleteReply(reel.id, comment.id, reply.id)}
                                          style={{
                                            background: "transparent",
                                            border: "none",
                                            color: "rgba(255, 75, 75, 0.95)",
                                            fontSize: "8px",
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            padding: 0
                                          }}
                                        >
                                          Excluir
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add nested reply form inside Reels */}
                    {isReplying && (
                      <div style={{ paddingLeft: "38px", display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                        <input
                          type="text"
                          placeholder="Escreva uma resposta..."
                          value={replyTexts[comment.id] || ""}
                          onChange={(e) => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') onAddReply(reel.id, comment.id);
                          }}
                          style={{
                            flex: 1,
                            padding: "4px 8px",
                            fontSize: "10px",
                            borderRadius: "100px",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            border: "none",
                            color: "#ffffff",
                            outline: "none"
                          }}
                        />
                        <button
                          onClick={() => onAddReply(reel.id, comment.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--color-secondary)",
                            cursor: "pointer"
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>send</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              }))}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "10px", alignItems: "center" }}>
            <img 
              src={currentMemberInfo?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200"} 
              alt="Você" 
              style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} 
            />
            <input
              type="text"
              placeholder="Escreva um comentário..."
              value={commentTexts[reel.id] || ""}
              onChange={(e) => setCommentTexts(prev => ({ ...prev, [reel.id]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddComment(reel.id);
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "11px",
                borderRadius: "100px",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "none",
                color: "#ffffff",
                outline: "none"
              }}
            />
            <button
              onClick={() => onAddComment(reel.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-secondary)",
                cursor: "pointer"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>send</span>
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPost && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(10px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s ease-out"
          }}
          onClick={() => setLightboxPostId(null)}
        >
          <div 
            style={{
              width: "90%",
              maxWidth: "1000px",
              height: "90vh",
              backgroundColor: "var(--color-surface)",
              borderRadius: "12px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "row",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Left side: Media/Content */}
            <div style={{ flex: 1.5, backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <button
                onClick={() => setLightboxPostId(null)}
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "rgba(0,0,0,0.5)",
                  border: "none",
                  color: "#fff",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              {lightboxPost.image_url ? (
                <img src={lightboxPost.image_url} alt="Post" style={{ width: "100%", maxHeight: "100%", objectFit: "contain" }} />
              ) : lightboxPost.video_url ? (
                <video src={lightboxPost.video_url} controls autoPlay style={{ width: "100%", maxHeight: "100%" }} />
              ) : (
                <div style={{ padding: "40px", color: "#fff", fontSize: "18px", textAlign: "center", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {lightboxPost.content}
                </div>
              )}
            </div>

            {/* Right side: Comments & Likes */}
            <div style={{ flex: 1, backgroundColor: "var(--color-surface)", display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
              {/* Header */}
              <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <MemberBadge
                  name={lightboxPost.author_name}
                  img={lightboxPost.author_avatar}
                  memberType={members.find(m => m.id === lightboxPost.user_id)?.member_type}
                  size={40}
                />
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <button
                  onClick={() => setLightboxTab("comments")}
                  style={{ flex: 1, padding: "12px", background: "transparent", border: "none", borderBottom: lightboxTab === "comments" ? "2px solid var(--color-secondary)" : "2px solid transparent", color: lightboxTab === "comments" ? "var(--color-secondary)" : "var(--color-outline)", fontWeight: 600, cursor: "pointer", fontSize: "12px" }}
                >
                  Comentários ({lightboxPost.comments?.length || 0})
                </button>
                <button
                  onClick={() => setLightboxTab("likes")}
                  style={{ flex: 1, padding: "12px", background: "transparent", border: "none", borderBottom: lightboxTab === "likes" ? "2px solid var(--color-secondary)" : "2px solid transparent", color: lightboxTab === "likes" ? "var(--color-secondary)" : "var(--color-outline)", fontWeight: 600, cursor: "pointer", fontSize: "12px" }}
                >
                  Curtidas ({(lightboxPost.liked_by_users || []).length})
                </button>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px" }} className="hide-scroll">
                {lightboxTab === "comments" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {lightboxPost.content && (lightboxPost.image_url || lightboxPost.video_url) && (
                      <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <MemberBadge
                          name={lightboxPost.author_name}
                          img={lightboxPost.author_avatar}
                          memberType={members.find(m => m.id === lightboxPost.user_id)?.member_type}
                          size={30}
                        />
                        <p style={{ fontSize: "13px", color: "var(--color-on-surface)", marginTop: "8px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                          {lightboxPost.content}
                        </p>
                      </div>
                    )}
                    {(lightboxPost.comments || []).length > 0 ? (
                      (lightboxPost.comments || []).map(comment => {
                        return (
                          <div key={comment.id} style={{ display: "flex", gap: "10px" }}>
                            <img src={comment.author_avatar} alt={comment.author_name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                            <div>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{comment.author_name}</span>
                              <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", marginTop: "2px", lineHeight: "1.4" }}>
                                {comment.content}
                              </p>
                              <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "10px", color: "var(--color-outline)", fontWeight: 600 }}>
                                <span>{formatPostTime(comment.created_at)}</span>
                                <span style={{ color: (comment.liked_by_users || []).includes(currentUser?.id || "mock") ? "var(--color-secondary)" : "var(--color-outline)" }}>
                                  {comment.likes_count || 0} curtidas
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ textAlign: "center", color: "var(--color-outline)", fontSize: "12px", marginTop: "20px" }}>Nenhum comentário ainda.</p>
                    )}
                  </div>
                ) : lightboxTab === "likes" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {(lightboxPost.liked_by_users || []).length > 0 ? (
                      (lightboxPost.liked_by_users || []).map((userId, idx) => {
                        const liker = members.find(m => m.id === userId);
                        return (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img src={liker?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200"} alt="Avatar" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                            <div>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{liker?.name || "Usuário"}</span>
                              <p style={{ fontSize: "11px", color: "var(--color-outline)", margin: 0 }}>{liker?.role || "Membro"}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ textAlign: "center", color: "var(--color-outline)", fontSize: "12px", marginTop: "20px" }}>Nenhuma curtida ainda.</p>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Input for new comment */}
              <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "10px", alignItems: "center" }}>
                <img 
                  src={currentMemberInfo?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200"} 
                  alt="Você" 
                  style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} 
                />
                <input
                  type="text"
                  placeholder="Adicione um comentário..."
                  value={commentTexts[lightboxPost.id] || ""}
                  onChange={(e) => setCommentTexts(prev => ({ ...prev, [lightboxPost.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment(lightboxPost.id);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: "12px",
                    borderRadius: "100px",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "none",
                    color: "#ffffff",
                    outline: "none"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS injection for animations specifically within the card */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
