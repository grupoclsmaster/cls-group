"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
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
  bio?: string | null;
  status: "Ativo" | "Inativo";
  added_at: string;
  linkedin_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  x_url?: string | null;
  website_url?: string | null;
  username?: string | null;
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
  liked_by_users?: string[];
  saved_by_users?: string[];
  comments: Comment[];
  created_at: string;
}

interface ConnectionRequest {
  id: string;
  requester: Member;
  created_at: string;
}

interface MemberConnection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function PerfilPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [memberInfo, setMemberInfo] = useState<Member | null>(null);
  
  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImg, setEditImg] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editX, setEditX] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Tab & Lists states
  const [activeTab, setActiveTab] = useState<"connections" | "posts" | "discover">("connections");
  const [connectedMembers, setConnectedMembers] = useState<Member[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allConnections, setAllConnections] = useState<MemberConnection[]>([]);
  const [searchOtherMember, setSearchOtherMember] = useState("");

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostText, setEditingPostText] = useState<string>("");

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Lightbox State
  const [lightboxPostId, setLightboxPostId] = useState<string | null>(null);
  const [lightboxTab, setLightboxTab] = useState<"content" | "comments" | "likes">("content");
  const lightboxPost = userPosts.find(p => p.id === lightboxPostId) || null;
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  const formatPostTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Há ${Math.max(1, diffMins)} min`;
    if (diffHours < 24) return `Há ${diffHours} h`;
    return `Há ${diffDays} dias`;
  };

  const handleAddComment = async (postId: string) => {
    const commentText = commentTexts[postId] || "";
    if (!commentText.trim()) return;

    const currentPost = userPosts.find(p => p.id === postId);
    if (!currentPost) return;

    const authorName = memberInfo?.name || "Membro Executivo";
    const authorAvatar = memberInfo?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200";
    const authorRole = memberInfo?.role || "Membro CLS";

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
    setUserPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    setCommentTexts(prev => ({ ...prev, [postId]: "" }));

    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ comments: updatedComments })
        .eq('id', postId);
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao salvar comentário:", err);
      showToast("Erro ao salvar comentário.", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast("Usuário não autenticado.", "error");
        setLoading(false);
        return;
      }
      setCurrentUser(user);

      // 1. Fetch current member details
      const { data: member, error: memberErr } = await supabase
        .from("members")
        .select("*")
        .eq("id", user.id)
        .single();

      if (memberErr || !member) {
        console.error("Erro ao buscar dados do membro:", memberErr);
        setLoading(false);
        return;
      }

      setMemberInfo(member);
      
      // Initialize edit fields
      setEditName(member.name || "");
      setEditUsername(member.username || "");
      setEditRole(member.role || "");
      setEditCompany(member.company || "");
      setEditIndustry(member.industry || "");
      setEditLocation(member.location || "");
      setEditBio(member.bio || "");
      setEditImg(member.img || "");
      setEditEmail(member.email || "");
      setEditLinkedin(member.linkedin_url || "");
      setEditInstagram(member.instagram_url || "");
      setEditFacebook(member.facebook_url || "");
      setEditX(member.x_url || "");
      setEditWebsite(member.website_url || "");

      // 2. Fetch connections (status = 'accepted')
      const { data: connData, error: connErr } = await supabase
        .from("member_connections")
        .select("*")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (!connErr && connData) {
        const connectedIds = connData.map((c: MemberConnection) => 
          c.requester_id === user.id ? c.receiver_id : c.requester_id
        );

        if (connectedIds.length > 0) {
          const { data: mData } = await supabase
            .from("members")
            .select("*")
            .in("id", connectedIds);
          if (mData) {
            setConnectedMembers(mData);
          }
        } else {
          setConnectedMembers([]);
        }
      }

      // 3. Fetch pending requests received
      const { data: pendingData, error: pendingErr } = await supabase
        .from("member_connections")
        .select("*")
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (!pendingErr && pendingData) {
        const requesterIds = pendingData.map((c: MemberConnection) => c.requester_id);
        if (requesterIds.length > 0) {
          const { data: reqMembers } = await supabase
            .from("members")
            .select("*")
            .in("id", requesterIds);
          
          if (reqMembers) {
            const mappedRequests: ConnectionRequest[] = pendingData.map((p: MemberConnection) => {
              const reqProfile = reqMembers.find((rm: Member) => rm.id === p.requester_id);
              return {
                id: p.id,
                requester: reqProfile || {
                  id: p.requester_id,
                  name: "Usuário Desconhecido",
                  email: "",
                  role: "",
                  company: "",
                  industry: "",
                  location: "",
                  initials: "U",
                  img: "",
                  status: "Inativo",
                  added_at: ""
                },
                created_at: p.created_at
              };
            });
            setPendingRequests(mappedRequests);
          }
        } else {
          setPendingRequests([]);
        }
      }

      // 4. Fetch community posts created by user
      const { data: postsData, error: postsErr } = await supabase
        .from("community_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!postsErr && postsData) {
        const standardUserPosts = postsData.filter((p: any) => !p.post_type || p.post_type === "standard");
        setUserPosts(standardUserPosts);
      }


      // 5. Fetch all connections for status checking in discovery
      const { data: allConnData } = await supabase
        .from("member_connections")
        .select("*")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
      if (allConnData) {
        setAllConnections(allConnData);
      }

      // 6. Fetch all members for discovery
      const { data: allMembersData } = await supabase
        .from("members")
        .select("*")
        .order("name");
      if (allMembersData) {
        setAllMembers(allMembersData);
      }

    } catch (err) {
      console.error("Erro geral ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getConnectionStatus = (memberId: string) => {
    if (!currentUser) return "none";
    if (currentUser.id === memberId) return "self";
    const conn = allConnections.find(c => 
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
      showToast("Você precisa estar logado para conectar.", "error");
      return;
    }
    const status = getConnectionStatus(memberId);
    if (status === "none") {
      const { error } = await supabase
        .from("member_connections")
        .insert({
          requester_id: currentUser.id,
          receiver_id: memberId,
          status: "pending"
        });
      if (error) {
        showToast("Erro ao enviar solicitação.", "error");
      } else {
        showToast(`Solicitação de conexão enviada para ${memberName}`, "success");
        void fetchProfileData();
      }
    } else if (status === "pending_received") {
      const conn = allConnections.find(c => c.requester_id === memberId && c.receiver_id === currentUser.id);
      if (conn) {
        const { error } = await supabase
          .from("member_connections")
          .update({ status: "accepted", updated_at: new Date().toISOString() })
          .eq("id", conn.id);
        if (error) {
          showToast("Erro ao aceitar conexão.", "error");
        } else {
          showToast(`Conexão com ${memberName} aceita!`, "success");
          void fetchProfileData();
        }
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast("O nome não pode estar em branco.", "error");
      return;
    }
    const cleanedUsername = editUsername.trim().toLowerCase();
    if (cleanedUsername && !/^[a-z0-9_.]+$/.test(cleanedUsername)) {
      showToast("O nome de usuário deve conter apenas letras minúsculas, números, sublinhas (_) ou pontos (.)", "error");
      return;
    }
    if (!currentUser) {
      showToast("Usuário não identificado.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const initials = editName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
      const updatedData = {
        name: editName,
        username: cleanedUsername || null,
        role: editRole,
        company: editCompany,
        industry: editIndustry,
        location: editLocation,
        bio: editBio,
        img: editImg,
        initials: initials,
        email: editEmail,
        linkedin_url: editLinkedin,
        instagram_url: editInstagram,
        facebook_url: editFacebook,
        x_url: editX,
        website_url: editWebsite
      };

      const { error } = await supabase
        .from("members")
        .update(updatedData)
        .eq("id", currentUser.id);

      if (error) {
        if (error.code === "23505") {
          showToast("Este nome de usuário já está em uso.", "error");
        } else {
          showToast("Erro ao salvar alterações no perfil.", "error");
        }
        console.error("Erro de atualização:", error);
      } else {
        showToast("Perfil atualizado com sucesso!", "success");
        setMemberInfo((prev: Member | null) => prev ? { ...prev, ...updatedData } : null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      showToast("Erro inesperado ao salvar perfil.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("A imagem deve ter no máximo 2MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAcceptConnection = async (reqId: string, requesterName: string) => {
    try {
      const { error } = await supabase
        .from("member_connections")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", reqId);

      if (error) {
        showToast("Erro ao aceitar solicitação.", "error");
        console.error(error);
      } else {
        showToast(`Conexão com ${requesterName} aceita!`, "success");
        void fetchProfileData(); // Reload connections list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineConnection = async (reqId: string, requesterName: string) => {
    try {
      const { error } = await supabase
        .from("member_connections")
        .delete()
        .eq("id", reqId);

      if (error) {
        showToast("Erro ao recusar solicitação.", "error");
        console.error(error);
      } else {
        showToast(`Solicitação de ${requesterName} recusada.`, "success");
        setPendingRequests(prev => prev.filter(r => r.id !== reqId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveConnection = async (connectedMemberId: string, connectedMemberName: string) => {
    if (!confirm(`Deseja realmente desfazer a conexão com ${connectedMemberName}?`)) return;
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from("member_connections")
        .delete()
        .or(`and(requester_id.eq.${currentUser.id},receiver_id.eq.${connectedMemberId}),and(requester_id.eq.${connectedMemberId},receiver_id.eq.${currentUser.id})`);

      if (error) {
        showToast("Erro ao remover conexão.", "error");
        console.error(error);
      } else {
        showToast(`Conexão com ${connectedMemberName} desfeita.`, "success");
        setConnectedMembers(prev => prev.filter(m => m.id !== connectedMemberId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Deseja realmente excluir esta publicação?")) return;

    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) {
        showToast("Erro ao excluir publicação.", "error");
        console.error(error);
      } else {
        showToast("Publicação excluída com sucesso.", "success");
        setUserPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePost = async (postId: string, newContent: string) => {
    if (!newContent.trim()) return;
    try {
      // Optimistic update
      setUserPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent.trim() } : p));
      setEditingPostId(null);

      const { error } = await supabase
        .from("community_posts")
        .update({ content: newContent.trim() })
        .eq("id", postId);

      if (error) {
        showToast("Erro ao atualizar publicação.", "error");
        console.error(error);
      } else {
        showToast("Publicação atualizada com sucesso.", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro ao atualizar publicação.", "error");
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Styles for Profile layout, input fields and Skeletons */}
      <style dangerouslySetInnerHTML={{ __html: `
        .profile-container {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .profile-container {
            grid-template-columns: 1fr;
          }
        }
        .profile-card {
          background-color: var(--color-surface-container-low);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .details-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          text-align: left;
          margin-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 20px;
        }
        .stat-badge {
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 12px;
          border-radius: 6px;
          text-align: center;
          flex: 1;
        }
        .profile-tab-btn {
          background: transparent;
          border: none;
          color: var(--color-on-surface-variant);
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }
        .profile-tab-btn.active {
          color: var(--color-secondary);
          border-bottom-color: var(--color-secondary);
        }
        .profile-tab-btn:hover {
          color: var(--color-secondary);
        }
        .grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .conn-card {
          background-color: var(--color-surface-container-low);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: border-color 0.2s ease;
        }
        .conn-card:hover {
          border-color: rgba(10, 82, 185, 0.25);
        }
        .req-card {
          background-color: var(--color-surface-container-low);
          border: 1px solid rgba(10, 82, 185, 0.25);
          border-radius: 6px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        @media (max-width: 600px) {
          .req-card {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
        .feed-post-card {
          background-color: var(--color-surface-container-low);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
          position: relative;
        }
        .delete-post-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: var(--color-outline);
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          transition: all 0.2s ease;
        }
        .delete-post-btn:hover {
          color: var(--color-error);
          background-color: rgba(255, 180, 171, 0.08);
        }
        /* Skeletons pulse animation */
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
        .skeleton {
          animation: pulse 1.5s infinite ease-in-out;
          background-color: rgba(255, 255, 255, 0.06);
          border-radius: 4px;
        }
        .social-btn-hover:hover {
          color: var(--color-secondary) !important;
          border-color: rgba(10, 82, 185, 0.3) !important;
          background-color: rgba(10, 82, 185, 0.08) !important;
          transform: translateY(-2px);
        }
      `}} />

      {/* Page Header */}
      <section style={{ marginBottom: "32px" }}>
        <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>
          Meu Perfil
        </h2>
        <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)" }}>
          Gerencie suas informações profissionais, conexões e publicações na comunidade.
        </p>
      </section>

      {loading ? (
        /* Skeleton Loading UI */
        <div className="profile-container">
          <div className="profile-card">
            <div className="skeleton" style={{ width: "96px", height: "96px", borderRadius: "50%", marginBottom: "16px" }} />
            <div className="skeleton" style={{ width: "160px", height: "20px", marginBottom: "8px" }} />
            <div className="skeleton" style={{ width: "120px", height: "14px", marginBottom: "20px" }} />
            <div className="skeleton" style={{ width: "100%", height: "40px", borderRadius: "4px", marginBottom: "24px" }} />
            <div className="details-grid">
              <div className="skeleton" style={{ width: "80px", height: "12px" }} />
              <div className="skeleton" style={{ width: "100%", height: "16px" }} />
              <div className="skeleton" style={{ width: "80px", height: "12px", marginTop: "8px" }} />
              <div className="skeleton" style={{ width: "100%", height: "16px" }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "24px" }}>
              <div className="skeleton" style={{ width: "120px", height: "36px", borderBottom: "2px solid transparent" }} />
              <div className="skeleton" style={{ width: "140px", height: "36px" }} />
            </div>
            <div className="grid-cards">
              {[1, 2, 3].map(i => (
                <div key={i} className="conn-card" style={{ height: "160px" }}>
                  <div className="skeleton" style={{ width: "50px", height: "50px", borderRadius: "50%", marginBottom: "12px" }} />
                  <div className="skeleton" style={{ width: "100px", height: "14px", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ width: "80px", height: "10px" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-container">
          
          {/* Left Column: Member Card / Edit form */}
          <div>
            {!isEditing ? (
              <div className="profile-card">
                {/* Avatar Image or Initials circle */}
                <div style={{ position: "relative", marginBottom: "16px" }}>
                  <MemberBadge
                    name={memberInfo?.name || ""}
                    img={memberInfo?.img}
                    initials={memberInfo?.initials}
                    memberType={memberInfo?.member_type}
                    size={96}
                  />
                </div>

                <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", marginBottom: "4px" }}>
                  {memberInfo?.name}
                </h3>
                {memberInfo?.username && (
                  <p className="font-body-sm" style={{ color: "var(--color-outline)", marginTop: "-4px", marginBottom: "8px", fontWeight: 500 }}>
                    @{memberInfo.username}
                  </p>
                )}
                <p className="font-body-md" style={{ color: "var(--color-secondary)", fontWeight: 600, margin: 0 }}>
                  {memberInfo?.role} {memberInfo?.company && `na ${memberInfo.company}`}
                </p>

                {/* Social Media Links Bar */}
                <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap", justifyContent: "center" }}>
                  {memberInfo?.linkedin_url && (
                    <a
                      href={memberInfo.linkedin_url.startsWith("http") ? memberInfo.linkedin_url : `https://${memberInfo.linkedin_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        color: "var(--color-outline)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        transition: "all 0.2s ease"
                      }}
                      title="LinkedIn"
                    >
                      <svg style={{ width: "16px", height: "16px", fill: "currentColor" }} viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                      </svg>
                    </a>
                  )}
                  {memberInfo?.instagram_url && (
                    <a
                      href={memberInfo.instagram_url.startsWith("http") ? memberInfo.instagram_url : `https://${memberInfo.instagram_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        color: "var(--color-outline)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        transition: "all 0.2s ease"
                      }}
                      title="Instagram"
                    >
                      <svg style={{ width: "16px", height: "16px", fill: "currentColor" }} viewBox="0 0 24 24">
                        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m8.9 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                      </svg>
                    </a>
                  )}
                  {memberInfo?.facebook_url && (
                    <a
                      href={memberInfo.facebook_url.startsWith("http") ? memberInfo.facebook_url : `https://${memberInfo.facebook_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        color: "var(--color-outline)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        transition: "all 0.2s ease"
                      }}
                      title="Facebook"
                    >
                      <svg style={{ width: "16px", height: "16px", fill: "currentColor" }} viewBox="0 0 24 24">
                        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
                      </svg>
                    </a>
                  )}
                  {memberInfo?.x_url && (
                    <a
                      href={memberInfo.x_url.startsWith("http") ? memberInfo.x_url : `https://${memberInfo.x_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        color: "var(--color-outline)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        transition: "all 0.2s ease"
                      }}
                      title="X"
                    >
                      <svg style={{ width: "16px", height: "16px", fill: "currentColor" }} viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                  {memberInfo?.website_url && (
                    <a
                      href={memberInfo.website_url.startsWith("http") ? memberInfo.website_url : `https://${memberInfo.website_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        color: "var(--color-outline)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        transition: "all 0.2s ease"
                      }}
                      title="Website"
                    >
                      <svg style={{ width: "16px", height: "16px", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </a>
                  )}
                  {memberInfo?.email && (
                    <a
                      href={`mailto:${memberInfo.email}`}
                      className="social-btn-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        color: "var(--color-outline)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        transition: "all 0.2s ease"
                      }}
                      title="E-mail"
                    >
                      <svg style={{ width: "16px", height: "16px", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </a>
                  )}
                </div>

                {/* Statistics panel */}
                <div style={{ display: "flex", width: "100%", gap: "10px", margin: "20px 0" }}>
                  <div className="stat-badge">
                    <span className="font-label-caps" style={{ display: "block", fontSize: "9px", color: "var(--color-outline)" }}>Conexões</span>
                    <strong style={{ fontSize: "16px", color: "var(--color-on-surface)" }}>{connectedMembers.length}</strong>
                  </div>
                  <div className="stat-badge">
                    <span className="font-label-caps" style={{ display: "block", fontSize: "9px", color: "var(--color-outline)" }}>Publicações</span>
                    <strong style={{ fontSize: "16px", color: "var(--color-on-surface)" }}>{userPosts.length}</strong>
                  </div>
                </div>

                {/* Bio text */}
                {memberInfo?.bio ? (
                  <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", lineHeight: "1.5", margin: "0 0 16px" }}>
                    &quot;{memberInfo.bio}&quot;
                  </p>
                ) : (
                  <p style={{ fontSize: "13px", color: "var(--color-outline)", fontStyle: "italic", margin: "0 0 16px" }}>
                    Nenhuma biografia cadastrada. Clique em editar para adicionar.
                  </p>
                )}

                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-outline"
                  style={{ width: "100%", padding: "10px", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                  EDITAR PERFIL
                </button>

                {/* Additional Details */}
                <div className="details-grid">
                  <div>
                    <span className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "9px", display: "block", marginBottom: "4px" }}>Setor / Indústria</span>
                    <span style={{ fontSize: "13px", color: "var(--color-on-surface)" }}>{memberInfo?.industry || "Não especificado"}</span>
                  </div>
                  <div>
                    <span className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "9px", display: "block", marginBottom: "4px" }}>Localização</span>
                    <span style={{ fontSize: "13px", color: "var(--color-on-surface)" }}>{memberInfo?.location || "Não especificado"}</span>
                  </div>
                  <div>
                    <span className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "9px", display: "block", marginBottom: "4px" }}>E-mail</span>
                    <a href={`mailto:${memberInfo?.email}`} style={{ fontSize: "13px", color: "var(--color-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }} className="hover-underline">
                      <svg style={{ width: "14px", height: "14px", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      {memberInfo?.email}
                    </a>
                  </div>
                  {memberInfo?.linkedin_url && (
                    <div>
                      <span className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "9px", display: "block", marginBottom: "4px" }}>LinkedIn</span>
                      <a href={memberInfo.linkedin_url.startsWith("http") ? memberInfo.linkedin_url : `https://${memberInfo.linkedin_url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--color-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }} className="hover-underline">
                        <svg style={{ width: "14px", height: "14px", fill: "currentColor" }} viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                        </svg>
                        {memberInfo.linkedin_url}
                      </a>
                    </div>
                  )}
                  {memberInfo?.instagram_url && (
                    <div>
                      <span className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "9px", display: "block", marginBottom: "4px" }}>Instagram</span>
                      <a href={memberInfo.instagram_url.startsWith("http") ? memberInfo.instagram_url : `https://${memberInfo.instagram_url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--color-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }} className="hover-underline">
                        <svg style={{ width: "14px", height: "14px", fill: "currentColor" }} viewBox="0 0 24 24">
                          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m8.9 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                        </svg>
                        {memberInfo.instagram_url}
                      </a>
                    </div>
                  )}
                  {memberInfo?.facebook_url && (
                    <div>
                      <span className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "9px", display: "block", marginBottom: "4px" }}>Facebook</span>
                      <a href={memberInfo.facebook_url.startsWith("http") ? memberInfo.facebook_url : `https://${memberInfo.facebook_url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--color-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }} className="hover-underline">
                        <svg style={{ width: "14px", height: "14px", fill: "currentColor" }} viewBox="0 0 24 24">
                          <path d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
                        </svg>
                        {memberInfo.facebook_url}
                      </a>
                    </div>
                  )}
                  {memberInfo?.x_url && (
                    <div>
                      <span className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "9px", display: "block", marginBottom: "4px" }}>X / Twitter</span>
                      <a href={memberInfo.x_url.startsWith("http") ? memberInfo.x_url : `https://${memberInfo.x_url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--color-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }} className="hover-underline">
                        <svg style={{ width: "14px", height: "14px", fill: "currentColor" }} viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        {memberInfo.x_url}
                      </a>
                    </div>
                  )}
                  {memberInfo?.website_url && (
                    <div>
                      <span className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "9px", display: "block", marginBottom: "4px" }}>Website</span>
                      <a href={memberInfo.website_url.startsWith("http") ? memberInfo.website_url : `https://${memberInfo.website_url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "var(--color-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }} className="hover-underline">
                        <svg style={{ width: "14px", height: "14px", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        {memberInfo.website_url}
                      </a>
                    </div>
                  )}
                  {memberInfo?.added_at && (
                    <div>
                      <span className="font-label-caps" style={{ color: "var(--color-outline)", fontSize: "9px", display: "block", marginBottom: "4px" }}>Membro desde</span>
                      <span style={{ fontSize: "12px", color: "var(--color-outline)" }}>
                        {new Date(memberInfo.added_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Edit Profile Form */
              <form onSubmit={handleUpdateProfile} className="profile-card" style={{ border: "1px solid rgba(10, 82, 185, 0.2)" }}>
                <h4 className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "11px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>manage_accounts</span>
                  Editar Informações
                </h4>

                {/* Avatar Edit Preview (Clickable) */}
                <div 
                  style={{ position: "relative", marginBottom: "16px", cursor: "pointer" }} 
                  onClick={() => document.getElementById("avatar-upload-input")?.click()}
                  title="Clique para alterar a foto"
                >
                  {editImg ? (
                    <div style={{ width: "96px", height: "96px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--color-secondary)", position: "relative" }}>
                      <img src={editImg} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff"
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>photo_camera</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(10, 82, 185, 0.05)",
                      border: "2px solid var(--color-secondary)",
                      color: "var(--color-outline)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "16px",
                      position: "relative"
                    }}>
                      <svg viewBox="0 0 24 24" style={{ width: "100%", height: "100%", fill: "currentColor", opacity: 0.5 }}>
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff"
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>photo_camera</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Hidden File Input */}
                  <input
                    id="avatar-upload-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarFileChange}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => document.getElementById("avatar-upload-input")?.click()}
                  className="btn-outline"
                  style={{ padding: "6px 14px", fontSize: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>upload</span>
                  Escolher Imagem
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", textAlign: "left" }}>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Nome Completo</label>
                    <input type="text" className="input-dark" value={editName} onChange={e => setEditName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Nome de Usuário (Username)</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "14px" }}>@</span>
                      <input 
                        type="text" 
                        className="input-dark" 
                        value={editUsername} 
                        onChange={e => setEditUsername(e.target.value)} 
                        placeholder="nome.usuario" 
                        style={{ paddingLeft: "26px" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Cargo / Profissão</label>
                    <input type="text" className="input-dark" value={editRole} onChange={e => setEditRole(e.target.value)} placeholder="Ex: Engenheiro de Private Equity" />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Empresa</label>
                    <input type="text" className="input-dark" value={editCompany} onChange={e => setEditCompany(e.target.value)} placeholder="Ex: CLS Construtora" />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Setor de Atuação</label>
                    <input type="text" className="input-dark" value={editIndustry} onChange={e => setEditIndustry(e.target.value)} placeholder="Ex: Engenharia Civil" />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Cidade / UF</label>
                    <input type="text" className="input-dark" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Ex: São Paulo, SP" />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Biografia / Resumo</label>
                    <textarea className="input-dark" rows={4} value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Fale um pouco sobre sua carreira, foco de investimentos..." style={{ resize: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }} className="font-label-caps">
                      <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#ffffff", flexShrink: 0 }}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn URL
                    </label>
                    <input type="text" className="input-dark" value={editLinkedin} onChange={e => setEditLinkedin(e.target.value)} placeholder="Ex: linkedin.com/in/nome-usuario" />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }} className="font-label-caps">
                      <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#ffffff", flexShrink: 0 }}>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                      </svg>
                      Instagram URL
                    </label>
                    <input type="text" className="input-dark" value={editInstagram} onChange={e => setEditInstagram(e.target.value)} placeholder="Ex: instagram.com/usuario" />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }} className="font-label-caps">
                      <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#ffffff", flexShrink: 0 }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook URL
                    </label>
                    <input type="text" className="input-dark" value={editFacebook} onChange={e => setEditFacebook(e.target.value)} placeholder="Ex: facebook.com/usuario" />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }} className="font-label-caps">
                      <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#ffffff", flexShrink: 0 }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      X / Twitter URL
                    </label>
                    <input type="text" className="input-dark" value={editX} onChange={e => setEditX(e.target.value)} placeholder="Ex: x.com/usuario" />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }} className="font-label-caps">
                      <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "var(--color-secondary)", flexShrink: 0 }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                      Website URL
                    </label>
                    <input type="text" className="input-dark" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} placeholder="Ex: seublog.com.br" />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--color-outline)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }} className="font-label-caps">
                      <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "var(--color-secondary)", flexShrink: 0 }}><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
                      E-mail de Contato
                    </label>
                    <input type="email" className="input-dark" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Ex: seuemail@dominio.com" />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-outline"
                    style={{ flex: 1, padding: "10px", fontSize: "10px" }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSaving}
                    style={{ flex: 1.5, padding: "10px", fontSize: "10px" }}
                  >
                    {isSaving ? "SALVANDO..." : "SALVAR"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Tabbed Lists (Connections / Feed Posts) */}
          <div>
            
            {/* Tab Headers */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "24px", gap: "8px" }}>
              <button
                onClick={() => setActiveTab("connections")}
                className={`profile-tab-btn ${activeTab === "connections" ? "active" : ""}`}
              >
                Conexões ({connectedMembers.length})
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`profile-tab-btn ${activeTab === "posts" ? "active" : ""}`}
              >
                Minhas Publicações ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab("discover")}
                className={`profile-tab-btn ${activeTab === "discover" ? "active" : ""}`}
              >
                Explorar Masters
              </button>
            </div>

            {/* TAB CONTENT: Connections */}
            {activeTab === "connections" && (
              <div>
                
                {/* Pending Requests Received */}
                {pendingRequests.length > 0 && (
                  <div style={{ marginBottom: "32px" }}>
                    <h4 className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "10px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>person_add</span>
                      Solicitações de Conexão Pendentes ({pendingRequests.length})
                    </h4>
                    
                    <div>
                      {pendingRequests.map((req) => (
                        <div key={req.id} className="req-card">
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <MemberBadge
                              name={req.requester.name}
                              img={req.requester.img}
                              initials={req.requester.initials}
                              memberType={req.requester.member_type}
                              size={36}
                            />
                            <div style={{ textAlign: "left" }}>
                              <h5 style={{ fontSize: "13px", color: "var(--color-on-surface)", margin: 0 }}>{req.requester.name}</h5>
                              <span style={{ fontSize: "11px", color: "var(--color-outline)" }}>{req.requester.role}</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleDeclineConnection(req.id, req.requester.name)}
                              className="btn-outline"
                              style={{ padding: "6px 12px", fontSize: "10px", border: "1px solid var(--color-outline)", color: "var(--color-outline)" }}
                            >
                              Recusar
                            </button>
                            <button
                              onClick={() => handleAcceptConnection(req.id, req.requester.name)}
                              className="btn-primary"
                              style={{ padding: "6px 12px", fontSize: "10px" }}
                            >
                              Aceitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Connected Members list */}
                <div>
                  <h4 className="font-label-caps" style={{ color: "var(--color-on-surface)", fontSize: "10px", marginBottom: "16px" }}>
                    Conectados com Você
                  </h4>

                  {connectedMembers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 24px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "6px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--color-outline)", marginBottom: "12px", opacity: 0.4 }}>
                        group_off
                      </span>
                      <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", margin: 0 }}>
                        Nenhum membro conectado ainda. Vá para a aba <span style={{ color: "var(--color-secondary)", cursor: "pointer", fontWeight: 600 }} onClick={() => setActiveTab("discover")}>Explorar Masters</span> para enviar solicitações!
                      </p>
                    </div>
                  ) : (
                    <div className="grid-cards">
                      {connectedMembers.map((conn) => (
                        <div key={conn.id} className="conn-card">
                          <MemberBadge
                            name={conn.name}
                            img={conn.img}
                            initials={conn.initials}
                            memberType={conn.member_type}
                            size={48}
                          />
                          <h5 style={{ fontSize: "13px", color: "var(--color-on-surface)", margin: "0 0 2px", fontWeight: 600 }}>{conn.name}</h5>
                          <span style={{ fontSize: "10px", color: "var(--color-secondary)", marginBottom: "2px", fontWeight: 500 }}>{conn.role}</span>
                          <span style={{ fontSize: "9px", color: "var(--color-outline)", marginBottom: "8px" }}>{conn.location}</span>

                          {/* Mini Social Icons for connected card */}
                          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                            {conn.linkedin_url && (
                              <a href={conn.linkedin_url.startsWith("http") ? conn.linkedin_url : `https://${conn.linkedin_url}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-outline)" }} className="hover-gold-text">
                                <svg style={{ width: "12px", height: "12px", fill: "currentColor" }} viewBox="0 0 24 24">
                                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                                </svg>
                              </a>
                            )}
                            {conn.instagram_url && (
                              <a href={conn.instagram_url.startsWith("http") ? conn.instagram_url : `https://${conn.instagram_url}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-outline)" }} className="hover-gold-text">
                                <svg style={{ width: "12px", height: "12px", fill: "currentColor" }} viewBox="0 0 24 24">
                                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m8.9 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                                </svg>
                              </a>
                            )}
                            {conn.website_url && (
                              <a href={conn.website_url.startsWith("http") ? conn.website_url : `https://${conn.website_url}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-outline)" }} className="hover-gold-text">
                                <svg style={{ width: "12px", height: "12px", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="2" y1="12" x2="22" y2="12"></line>
                                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                </svg>
                              </a>
                            )}
                            {conn.email && (
                              <a href={`mailto:${conn.email}`} style={{ color: "var(--color-outline)" }} className="hover-gold-text">
                                <svg style={{ width: "12px", height: "12px", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} viewBox="0 0 24 24">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                  <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                              </a>
                            )}
                          </div>

                          <button
                            onClick={() => handleRemoveConnection(conn.id, conn.name)}
                            className="btn-outline"
                            style={{ width: "100%", padding: "6px 0", fontSize: "9px", border: "1px solid rgba(255,180,171,0.3)", color: "#ffdad6" }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = "rgba(255, 180, 171, 0.08)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            DESCONECTAR
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT: Discover Masters */}
            {activeTab === "discover" && (
              <div>
                {/* Discover Other Masters Section */}
                {(() => {
                  const otherMembers = allMembers.filter(m => m.id !== currentUser?.id);
                  const unconnectedMembers = otherMembers.filter(m => {
                    const status = getConnectionStatus(m.id);
                    return status !== "accepted";
                  });
                  const filteredUnconnected = unconnectedMembers.filter(m => 
                    m.name.toLowerCase().includes(searchOtherMember.toLowerCase()) ||
                    (m.role && m.role.toLowerCase().includes(searchOtherMember.toLowerCase())) ||
                    (m.company && m.company.toLowerCase().includes(searchOtherMember.toLowerCase()))
                  );

                  return (
                    <div>
                      <h4 className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "10px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>groups</span>
                        Descobrir Outros Masters ({unconnectedMembers.length})
                      </h4>

                      {/* Search box for discovery */}
                      <div style={{ position: "relative", marginBottom: "20px" }}>
                        <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "16px" }}>
                          search
                        </span>
                        <input
                          type="text"
                          placeholder="Buscar por nome, cargo ou empresa..."
                          value={searchOtherMember}
                          onChange={(e) => setSearchOtherMember(e.target.value)}
                          className="input-dark"
                          style={{
                            width: "100%",
                            padding: "10px 12px 10px 38px",
                            backgroundColor: "var(--search-input-bg)",
                            border: "1px solid var(--search-input-border)",
                            borderRadius: "6px",
                            color: "var(--color-on-surface)",
                            fontSize: "13px",
                            outline: "none"
                          }}
                        />
                      </div>

                      {filteredUnconnected.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px 16px", border: "1px dashed var(--border-color)", borderRadius: "6px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "var(--color-outline)", marginBottom: "8px", opacity: 0.3 }}>
                            search_off
                          </span>
                          <p style={{ fontSize: "12.5px", color: "var(--color-on-surface-variant)", margin: 0 }}>
                            Nenhum master encontrado com os critérios de busca.
                          </p>
                        </div>
                      ) : (
                        <div className="grid-cards">
                          {filteredUnconnected.map((conn) => {
                            const status = getConnectionStatus(conn.id);
                            let label = "CONECTAR (SEGUIR)";
                            let isPending = false;
                            let isAcceptedStatus = false;

                            if (status === "pending_sent") {
                              label = "PENDENTE";
                              isPending = true;
                            } else if (status === "pending_received") {
                              label = "ACEITAR";
                            } else if (status === "accepted") {
                              label = "CONECTADO";
                              isAcceptedStatus = true;
                            }

                            return (
                              <div key={conn.id} className="conn-card">
                                <MemberBadge
                                   name={conn.name}
                                   img={conn.img}
                                   initials={conn.initials}
                                   memberType={conn.member_type}
                                   size={48}
                                 />
                                <h5 style={{ fontSize: "13px", color: "var(--color-on-surface)", margin: "0 0 2px", fontWeight: 600 }}>{conn.name}</h5>
                                <span style={{ fontSize: "10.5px", color: "var(--color-secondary)", marginBottom: "2px", fontWeight: 500 }}>{conn.role}</span>
                                <span style={{ fontSize: "9px", color: "var(--color-outline)", marginBottom: "8px" }}>
                                  {conn.company ? `@ ${conn.company}` : conn.location || "Membro"}
                                </span>

                                {/* Mini Social Icons for unconnected card */}
                                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                                  {conn.linkedin_url && (
                                    <a href={conn.linkedin_url.startsWith("http") ? conn.linkedin_url : `https://${conn.linkedin_url}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-outline)" }} className="hover-gold-text">
                                      <svg style={{ width: "12px", height: "12px", fill: "currentColor" }} viewBox="0 0 24 24">
                                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                                      </svg>
                                    </a>
                                  )}
                                  {conn.instagram_url && (
                                    <a href={conn.instagram_url.startsWith("http") ? conn.instagram_url : `https://${conn.instagram_url}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-outline)" }} className="hover-gold-text">
                                      <svg style={{ width: "12px", height: "12px", fill: "currentColor" }} viewBox="0 0 24 24">
                                        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m8.9 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                                      </svg>
                                    </a>
                                  )}
                                  {conn.website_url && (
                                    <a href={conn.website_url.startsWith("http") ? conn.website_url : `https://${conn.website_url}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-outline)" }} className="hover-gold-text">
                                      <svg style={{ width: "12px", height: "12px", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="2" y1="12" x2="22" y2="12"></line>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                      </svg>
                                    </a>
                                  )}
                                  {conn.email && (
                                    <a href={`mailto:${conn.email}`} style={{ color: "var(--color-outline)" }} className="hover-gold-text">
                                      <svg style={{ width: "12px", height: "12px", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} viewBox="0 0 24 24">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                      </svg>
                                    </a>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => !isPending && !isAcceptedStatus && handleConnectAction(conn.id, conn.name)}
                                  disabled={isPending || isAcceptedStatus}
                                  style={{
                                    width: "100%",
                                    backgroundColor: isAcceptedStatus 
                                      ? "rgba(16, 185, 129, 0.1)" 
                                      : isPending 
                                        ? "rgba(255, 255, 255, 0.04)" 
                                        : "rgba(10, 82, 185, 0.08)",
                                    border: isAcceptedStatus 
                                      ? "1px solid rgba(16, 185, 129, 0.3)" 
                                      : isPending 
                                        ? "1px solid rgba(255, 255, 255, 0.1)" 
                                        : "1px solid rgba(10, 82, 185, 0.25)",
                                    borderRadius: "4px",
                                    color: isAcceptedStatus 
                                      ? "#10b981" 
                                      : isPending 
                                        ? "var(--color-outline)" 
                                        : "var(--color-secondary)",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    padding: "6px 0",
                                    cursor: (isPending || isAcceptedStatus) ? "default" : "pointer",
                                    transition: "all 0.2s"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isPending && !isAcceptedStatus) {
                                      e.currentTarget.style.backgroundColor = "var(--color-secondary)";
                                      e.currentTarget.style.color = "var(--color-on-secondary)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isPending && !isAcceptedStatus) {
                                      e.currentTarget.style.backgroundColor = "rgba(10, 82, 185, 0.08)";
                                      e.currentTarget.style.color = "var(--color-secondary)";
                                    }
                                  }}
                                >
                                  {label}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB CONTENT: User Posts */}
            {activeTab === "posts" && (
              <div>
                {userPosts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 24px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "6px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--color-outline)", marginBottom: "12px", opacity: 0.4 }}>
                      feed
                    </span>
                    <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", margin: 0 }}>
                      Você ainda não fez nenhuma publicação no feed da comunidade.
                    </p>
                  </div>
                ) : (
                  <div>
                    {userPosts.map((post) => (
                      <article key={post.id} className="feed-post-card">
                        
                        {/* Post Header Buttons */}
                        <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => {
                              setEditingPostId(post.id);
                              setEditingPostText(post.content);
                            }}
                            className="delete-post-btn"
                            style={{ position: "static" }}
                            title="Editar publicação"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="delete-post-btn"
                            style={{ position: "static" }}
                            title="Excluir publicação"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                          </button>
                        </div>

                        {/* Post Header */}
                        <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
                          <MemberBadge
                            name={memberInfo?.name || post.author_name}
                            img={memberInfo?.img || post.author_avatar}
                            initials={memberInfo?.initials}
                            memberType={memberInfo?.member_type}
                            size={40}
                          />
                          <div>
                            <h4 style={{ fontSize: "13px", color: "var(--color-on-surface)", fontWeight: 600, margin: 0 }}>{memberInfo?.name || post.author_name}</h4>
                            <span style={{ fontSize: "10px", color: "var(--color-secondary)", fontWeight: 500, display: "block" }}>{memberInfo?.role || post.author_role}</span>
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
                                fontSize: "13px",
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
                                  padding: "4px 12px",
                                  fontSize: "12px",
                                  borderRadius: "4px",
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: "var(--color-outline)",
                                  cursor: "pointer"
                                }}
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleUpdatePost(post.id, editingPostText)}
                                style={{
                                  padding: "4px 12px",
                                  fontSize: "12px",
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
                          <p style={{ fontSize: "13px", color: "var(--color-on-surface)", lineHeight: "1.5", whiteSpace: "pre-wrap", marginBottom: "14px" }}>
                            {post.content}
                          </p>
                        )}

                        {/* Post Image */}
                        {post.image_url && (
                          <div 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("content"); }}
                            style={{ width: "100%", maxHeight: "250px", borderRadius: "4px", overflow: "hidden", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}
                          >
                            <img 
                              src={post.image_url} 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("content"); }}
                              style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} 
                              alt="Imagem da publicação" 
                            />
                          </div>
                        )}

                        {/* Post Video */}
                        {post.video_url && (
                          <div 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("content"); }}
                            style={{ width: "100%", maxHeight: "250px", borderRadius: "4px", overflow: "hidden", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "#000", cursor: "pointer" }}
                          >
                            <video src={post.video_url} controls playsInline style={{ width: "100%", height: "100%", objectFit: "contain", cursor: "pointer" }} />
                          </div>
                        )}

                        {/* Likes count info */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--color-on-surface-variant)" }}>
                          <div 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("likes"); }}
                            style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "13px", color: (post.liked_by_users || []).length > 0 ? "var(--color-secondary)" : "var(--color-outline)", fontVariationSettings: `'FILL' ${(post.liked_by_users || []).length > 0 ? 1 : 0}` }}>
                              thumb_up
                            </span>
                            {(post.liked_by_users || []).length} curtidas
                          </div>
                          <span style={{ margin: "0 4px" }}>•</span>
                          <div 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxPostId(post.id); setLightboxTab("comments"); }}
                            style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                            className="hover-gold-text"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "13px", color: "var(--color-primary)" }}>
                              forum
                            </span>
                            {post.comments?.length || 0} comentários
                          </div>
                        </div>

                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                  memberType={allMembers.find(m => m.id === lightboxPost.user_id)?.member_type}
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
                          memberType={allMembers.find(m => m.id === lightboxPost.user_id)?.member_type}
                          size={30}
                        />
                        <p style={{ fontSize: "13px", color: "var(--color-on-surface)", marginTop: "8px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                          {lightboxPost.content}
                        </p>
                      </div>
                    )}
                    {(lightboxPost.comments || []).length > 0 ? (
                      (lightboxPost.comments || []).map((comment: any) => {
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
                      (lightboxPost.liked_by_users || []).map((userId: string, idx: number) => {
                        const liker = allMembers.find(m => m.id === userId);
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
                  src={memberInfo?.img || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200"} 
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

      {/* Toast Notification popup */}
      {toast && (
        <div
          className="glass-panel"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "16px 24px",
            borderRadius: "4px",
            border: toast.type === "success" ? "1px solid #a3e635" : "1px solid var(--color-error)",
            backgroundColor: "rgba(19, 19, 22, 0.95)",
            color: toast.type === "success" ? "#a3e635" : "var(--color-error)",
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
    </div>
  );
}
