"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

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
}

interface Comment {
  id: string;
  author_name: string;
  author_avatar: string;
  author_role: string;
  content: string;
  created_at: string;
}

interface Post {
  id: string;
  user_id: string | null;
  author_name: string;
  author_avatar: string;
  author_role: string;
  content: string;
  image_url: string | null;
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
    author_name: "Arq. Mayara Santos",
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
  const supabase = createClient();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentMemberInfo, setCurrentMemberInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states for creating post
  const [newPostText, setNewPostText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for search and active comments
  const [searchMember, setSearchMember] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

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
        }

        // Load members list (CPROCLS)
        const res = await fetch("/api/members");
        if (res.ok) {
          const mData = await res.json();
          setMembers(mData.members || []);
        }

        // Load feed posts
        const { data: dbPosts, error: postsErr } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbPosts && dbPosts.length > 0) {
          setPosts(dbPosts);
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

  // Handle selecting local image file and encoding to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    const fileInput = document.getElementById("feed-image-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Submit new community post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !imagePreview) return;

    try {
      setIsSubmitting(true);
      
      const authorName = currentMemberInfo?.name || "Membro Executivo";
      const authorAvatar = currentMemberInfo?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200";
      const authorRole = currentMemberInfo?.role || "Membro CLS";

      const newPostObj: Omit<Post, 'id' | 'created_at'> = {
        user_id: currentUser?.id || null,
        author_name: authorName,
        author_avatar: authorAvatar,
        author_role: authorRole,
        content: newPostText.trim(),
        image_url: imagePreview, // Base64 encoded string saved directly to DB
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
        alert("Publicado localmente (Modo de Demonstração)");
      }

      setNewPostText("");
      setImagePreview(null);
      handleClearImage();
    } catch (err) {
      console.error("Erro ao publicar post:", err);
      alert("Erro ao publicar atualização.");
    } finally {
      setIsSubmitting(false);
    }
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
      author_name: authorName,
      author_avatar: authorAvatar,
      author_role: authorRole,
      content: commentText.trim(),
      created_at: new Date().toISOString()
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
      <div className="feed-container">
        
        {/* Left Column: Feed and Publishing */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          
          {/* Create Post Box */}
          <div className="feed-post-card" style={{ border: "1px solid rgba(237, 192, 102, 0.2)" }}>
            <form onSubmit={handleCreatePost}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                  <img 
                    src={currentMemberInfo?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200"} 
                    alt="Sua Foto" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
                
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

                  {/* Image Preview Container */}
                  {imagePreview && (
                    <div style={{ position: "relative", width: "100%", height: "220px", marginTop: "12px", borderRadius: "6px", overflow: "hidden" }}>
                      <img src={imagePreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Upload Preview" />
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
                          cursor: "pointer"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
                      </button>
                    </div>
                  )}

                  {/* Toolbar Actions and Publish */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", marginTop: "8px" }}>
                    
                    {/* Add Image Picker */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="feed-image-input"
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
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>image</span>
                        Adicionar Imagem
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || (!newPostText.trim() && !imagePreview)}
                      className="btn-primary"
                      style={{
                        padding: "8px 24px",
                        fontSize: "11px",
                        letterSpacing: "0.05em",
                        opacity: (!newPostText.trim() && !imagePreview) || isSubmitting ? 0.5 : 1,
                        cursor: (!newPostText.trim() && !imagePreview) || isSubmitting ? "not-allowed" : "pointer"
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
            {posts.map((post) => {
              const userId = currentUser?.id || "mock-user-id";
              const isLiked = (post.liked_by_users || []).includes(userId);
              const isSaved = (post.saved_by_users || []).includes(userId);
              const isCommentsOpen = activeCommentPostId === post.id;

              return (
                <article key={post.id} className="feed-post-card">
                  {/* Post Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                        <img src={post.author_avatar || "/magno.jpg"} alt={post.author_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>{post.author_name}</h4>
                        <span style={{ fontSize: "11px", color: "var(--color-secondary)", fontWeight: 600, display: "block" }}>{post.author_role}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--color-outline)" }}>
                      {formatPostTime(post.created_at)}
                    </span>
                  </div>

                  {/* Post Content */}
                  <p style={{ fontSize: "14px", color: "var(--color-on-surface)", lineHeight: "1.6", whiteSpace: "pre-wrap", marginBottom: "14px" }}>
                    {post.content}
                  </p>

                  {/* Post Image */}
                  {post.image_url && (
                    <div style={{ width: "100%", maxHeight: "380px", borderRadius: "6px", overflow: "hidden", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <img src={post.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Publicação Imagem" />
                    </div>
                  )}

                  {/* Likes/Comments Counter statistics */}
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px", marginBottom: "4px", fontSize: "11px", color: "var(--color-on-surface-variant)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "var(--color-secondary)", fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
                      {post.likes_count} curtidas
                    </div>
                    <div style={{ cursor: "pointer" }} onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post.id)} className="hover-gold-text">
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
                      onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post.id)}
                      className={`post-action-btn ${isCommentsOpen ? 'active' : ''}`}
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
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px", marginBottom: "16px" }} className="hide-scroll">
                        {(post.comments || []).map((comment) => (
                          <div key={comment.id} className="comment-item">
                            <div style={{ width: "30px", height: "30px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
                              <img src={comment.author_avatar} alt={comment.author_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>{comment.author_name}</span>
                                <span style={{ fontSize: "9px", color: "var(--color-outline)" }}>{formatPostTime(comment.created_at)}</span>
                              </div>
                              <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", lineHeight: "1.4" }}>{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add comment form */}
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
                          <img src={currentMemberInfo?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200"} alt="Você" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

        </div>

        {/* Right Column: CPROCLS Members Sidebar List */}
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
              placeholder="Buscar membro..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                backgroundColor: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "12px",
                outline: "none"
              }}
            />
          </div>

          {/* Scrollable list of members */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "550px", overflowY: "auto", paddingRight: "4px" }} className="hide-scroll">
            {filteredSidebarMembers.map((member) => (
              <div
                key={member.email}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)"
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(237,192,102,0.15)", flexShrink: 0 }}>
                    <img src={member.img} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: "12.5px", fontWeight: 600, color: "#ffffff", margin: 0 }}>{member.name}</h5>
                    <span style={{ fontSize: "10.5px", color: "var(--color-on-surface-variant)", display: "block" }}>
                      {member.role} @ {member.company}
                    </span>
                  </div>
                </div>

                {/* Quick connect button strictly NO shadows, turns gold on hover */}
                <button
                  onClick={() => alert(`Solicitação de conexão enviada para ${member.name}`)}
                  style={{
                    backgroundColor: "rgba(237, 192, 102, 0.08)",
                    border: "1px solid rgba(237, 192, 102, 0.25)",
                    borderRadius: "4px",
                    color: "var(--color-secondary)",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-secondary)";
                    e.currentTarget.style.color = "var(--color-on-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(237, 192, 102, 0.08)";
                    e.currentTarget.style.color = "var(--color-secondary)";
                  }}
                >
                  CONECTAR
                </button>
              </div>
            ))}
            {filteredSidebarMembers.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--color-on-surface-variant)", fontSize: "12px" }}>
                Nenhum membro encontrado.
              </div>
            )}
          </div>
        </div>

      </div>

      <div style={{ height: "48px" }} />
    </div>
  );
}
