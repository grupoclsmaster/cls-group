import fs from 'fs';
import path from 'path';

const pagePath = path.resolve('src/app/(app)/admin/painel/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Text Replacements (Curso -> Masterclass)
const replacements = [
  ["Criar Novo Curso", "Criar Nova Masterclass"],
  ["NOME DO CURSO", "NOME DA MASTERCLASS"],
  ["Criar Curso", "Criar Masterclass"],
  ["CRIAR CURSO", "CRIAR MASTERCLASS"],
  ["Nenhum curso cadastrado", "Nenhuma masterclass cadastrada"],
  ["adicionando um curso", "adicionando uma masterclass"],
  ["Módulos do Curso", "Módulos da Masterclass"],
  ["Conteúdos (Cursos)", "Conteúdos (Masterclasses)"],
  ["Selecione um curso primeiro", "Selecione uma masterclass primeiro"],
  ["Curso atualizado com sucesso", "Masterclass atualizada com sucesso"],
  ["Erro ao salvar curso", "Erro ao salvar masterclass"],
  ["Curso \\\"${newCourseName}\\\" criado", "Masterclass \\\"${newCourseName}\\\" criada"],
  ["Erro ao criar curso", "Erro ao criar masterclass"]
];

for (const [find, replace] of replacements) {
  content = content.replaceAll(find, replace);
}

// 2. Inject States
if (!content.includes('selectedModules')) {
  const stateInjection = `
  // Bulk selection states
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  `;
  content = content.replace('// Drag and Drop ordering state', stateInjection + '\n  // Drag and Drop ordering state');
}

// 3. Inject Handlers
if (!content.includes('handleBulkAction')) {
  const handlersInjection = `
  const handleBulkAction = async (type: 'delete' | 'publish' | 'draft') => {
    if (selectedModules.length === 0 && selectedLessons.length === 0) return;
    if (type === 'delete' && !confirm("Deseja realmente excluir os itens selecionados? Essa ação não pode ser desfeita.")) return;
    
    setBulkActionLoading(true);
    try {
      if (selectedModules.length > 0) {
        if (type === 'delete') {
          await supabase.from("modules").delete().in("id", selectedModules);
        } else {
          await supabase.from("modules").update({ status: type === 'publish' ? 'publicado' : 'rascunho' }).in("id", selectedModules);
        }
      }
      if (selectedLessons.length > 0) {
        if (type === 'delete') {
          await supabase.from("lessons").delete().in("id", selectedLessons);
        } else {
          await supabase.from("lessons").update({ status: type === 'publish' ? 'publicado' : 'rascunho' }).in("id", selectedLessons);
        }
      }
      
      showStatus("success", \`Ação em massa concluída com sucesso!\`);
      setSelectedModules([]);
      setSelectedLessons([]);
      await refreshData();
    } catch (err) {
      console.error(err);
      showStatus("error", "Erro ao executar ação em massa.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDragStartModule = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("moduleId", id);
    setDraggedModuleId(id);
  };
  
  const handleDragOverModule = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDropModule = async (e: React.DragEvent, targetModuleId: string, courseId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("moduleId");
    if (!draggedId || draggedId === targetModuleId) {
      setDraggedModuleId(null);
      return;
    }
    
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return;
    
    const courseModulesList = courses[courseIndex].modules || [];
    const draggedIndex = courseModulesList.findIndex(m => m.id === draggedId);
    const targetIndex = courseModulesList.findIndex(m => m.id === targetModuleId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newList = [...courseModulesList];
    const [removed] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, removed);
    
    const updatedCourses = [...courses];
    updatedCourses[courseIndex] = {
      ...updatedCourses[courseIndex],
      modules: newList.map((m, index) => ({ ...m, sequence_order: index }))
    };
    setCourses(updatedCourses);
    
    try {
      const updates = newList.map((m, index) => {
        return supabase.from("modules").update({ sequence_order: index }).eq("id", m.id);
      });
      await Promise.all(updates);
      showStatus("success", "Ordem dos módulos atualizada!");
    } catch (err) {
      showStatus("error", "Erro ao salvar ordenação dos módulos.");
      await refreshData();
    } finally {
      setDraggedModuleId(null);
    }
  };
  `;
  content = content.replace('const handleDragStart = (e: React.DragEvent, id: string) => {', handlersInjection + '\n  const handleDragStart = (e: React.DragEvent, id: string) => {');
}

// 4. Inject editingCourse modal
if (!content.includes('Edição de Masterclass')) {
  const modalInjection = `
            {/* Modal de Edição de Masterclass */}
            {editingCourse && (
              <div 
                style={{
                  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.8)", backdropFilter: "blur(5px)",
                  zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
                }}
                onClick={() => setEditingCourse(null)}
              >
                <div 
                  style={{
                    backgroundColor: "rgba(20, 20, 25, 0.98)", border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px", width: "100%", maxWidth: "500px", padding: "28px", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", margin: 0 }}>Editar Masterclass</h3>
                    <button onClick={() => setEditingCourse(null)} style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DA MASTERCLASS</label>
                      <input
                        type="text" className="input-dark" value={editingCourse.title}
                        onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO</label>
                      <textarea
                        className="input-dark" rows={4} value={editingCourse.description}
                        onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>STATUS</label>
                      <select
                        className="input-dark" value={editingCourse.status}
                        onChange={(e) => setEditingCourse({...editingCourse, status: e.target.value as any})}
                      >
                        <option value="publicado">Publicado</option>
                        <option value="rascunho">Rascunho</option>
                        <option value="agendado">Agendado</option>
                      </select>
                    </div>
                    <button className="btn-primary" style={{ marginTop: "8px" }} onClick={handleUpdateCourse}>
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            )}
  `;
  content = content.replace('{/* Modal/Overlay to Add Module */}', modalInjection + '\n            {/* Modal/Overlay to Add Module */}');
}

// 5. Update Module rendering with Drag & Drop and Checkbox
// Find the Module Header Row div
let moduleHeaderRegex = /<div\\s+key=\\{m\\.id\\}\\s+style=\\{\\{\\s+backgroundColor: "rgba\\(7, 7, 50, 0\\.25\\)",\\s+border: "1px solid rgba\\(255, 255, 255, 0\\.08\\)",\\s+borderRadius: "4px",\\s+overflow: "hidden"\\s+\\}\\}/;
if (content.match(moduleHeaderRegex)) {
  // It's easier to string replace the specific lines for modules
  content = content.replace(
    'key={m.id} \n                      style={{',
    \`key={m.id}
                      draggable
                      onDragStart={(e) => handleDragStartModule(e, m.id)}
                      onDragOver={handleDragOverModule}
                      onDrop={(e) => handleDropModule(e, m.id, selectedCourseId!)}
                      style={{
                        opacity: draggedModuleId === m.id ? 0.5 : 1,\`
  );
  
  // Replace the module span checkbox with a real interactive element
  const moduleCheckboxEmpty = \`border: "1.5px solid var(--color-primary)", 
                            borderRadius: "2px",
                            display: "inline-block"\`;
                            
  content = content.replace(
    \`<span style={{ 
                            width: "16px", 
                            height: "16px", 
                            border: "1.5px solid var(--color-primary)", 
                            borderRadius: "2px",
                            display: "inline-block"
                          }} />\`,
    \`<span 
                            style={{ 
                              width: "18px", 
                              height: "18px", 
                              border: selectedModules.includes(m.id) ? "none" : "1.5px solid var(--color-primary)", 
                              backgroundColor: selectedModules.includes(m.id) ? "var(--color-primary)" : "transparent",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer"
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedModules.includes(m.id)) {
                                setSelectedModules(selectedModules.filter(id => id !== m.id));
                              } else {
                                setSelectedModules([...selectedModules, m.id]);
                              }
                            }}
                          >
                            {selectedModules.includes(m.id) && <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#0c0c0e", fontWeight: "bold" }}>check</span>}
                          </span>\`
  );
}

// 6. Update Lesson Checkbox
const lessonCheckboxEmpty = \`<span style={{ 
                                      width: "14px", 
                                      height: "14px", 
                                      border: "1.5px solid rgba(194, 194, 245, 0.4)", 
                                      borderRadius: "2px",
                                      display: "inline-block"
                                    }} />\`;
if (content.includes(lessonCheckboxEmpty)) {
  content = content.replace(
    lessonCheckboxEmpty,
    \`<span 
                                      style={{ 
                                        width: "16px", 
                                        height: "16px", 
                                        border: selectedLessons.includes(l.id) ? "none" : "1.5px solid rgba(194, 194, 245, 0.4)", 
                                        backgroundColor: selectedLessons.includes(l.id) ? "var(--color-primary)" : "transparent",
                                        borderRadius: "3px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer"
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedLessons.includes(l.id)) {
                                          setSelectedLessons(selectedLessons.filter(id => id !== l.id));
                                        } else {
                                          setSelectedLessons([...selectedLessons, l.id]);
                                        }
                                      }}
                                    >
                                      {selectedLessons.includes(l.id) && <span className="material-symbols-outlined" style={{ fontSize: "12px", color: "#0c0c0e", fontWeight: "bold" }}>check</span>}
                                    </span>\`
  );
}

// 7. Inject Bulk Action Bar at the end of the return statement
if (!content.includes('AÇÕES EM MASSA')) {
  const bulkBar = \`
      {/* Bulk Actions Bar */}
      {(selectedModules.length > 0 || selectedLessons.length > 0) && (
        <div style={{
          position: "fixed",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(20, 20, 25, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(237, 192, 102, 0.3)",
          borderRadius: "50px",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
          zIndex: 9999
        }}>
          <span style={{ color: "var(--color-on-surface)", fontWeight: 600, fontSize: "14px" }}>
            {selectedModules.length + selectedLessons.length} selecionado(s)
          </span>
          <div style={{ width: "1px", height: "24px", backgroundColor: "rgba(255, 255, 255, 0.1)" }}></div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="btn-secondary" 
              style={{ padding: "8px 16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => handleBulkAction('draft')}
              disabled={bulkActionLoading}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility_off</span>
              Rascunho
            </button>
            <button 
              className="btn-secondary" 
              style={{ padding: "8px 16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              onClick={() => handleBulkAction('publish')}
              disabled={bulkActionLoading}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>public</span>
              Publicar
            </button>
            <button 
              className="btn-secondary" 
              style={{ padding: "8px 16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(244, 67, 54, 0.1)", color: "#F44336", borderColor: "rgba(244, 67, 54, 0.2)" }}
              onClick={() => handleBulkAction('delete')}
              disabled={bulkActionLoading}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
              Excluir
            </button>
          </div>
          <button 
            style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer", display: "flex", alignItems: "center", marginLeft: "8px" }}
            onClick={() => {
              setSelectedModules([]);
              setSelectedLessons([]);
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
\`;
  content = content.replace(/    <\/div>\s*<\/div>\s*\);\s*}\s*$/s, bulkBar);
}

fs.writeFileSync(pagePath, content);
console.log("Refactor completed!");
