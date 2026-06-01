import fs from 'fs';
import path from 'path';

const pagePath = path.resolve('src/app/(app)/admin/painel/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Update Module Drag & Drop UI + Checkbox
let moduleHeaderRegex = /<div\\s*key=\\{m\\.id\\}\\s*style=\\{\\{[\\s\\S]*?overflow: "hidden"\\s*\\}\\}\\s*>/m;

// To be safe, we will just replace the exact known string
content = content.replace(
  \`<div 
                      key={m.id} 
                      style={{ 
                        backgroundColor: "rgba(7, 7, 50, 0.25)", 
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "4px",
                        overflow: "hidden"
                      }}
                    >\`,
  \`<div 
                      key={m.id} 
                      draggable
                      onDragStart={(e) => handleDragStartModule(e, m.id)}
                      onDragOver={handleDragOverModule}
                      onDrop={(e) => handleDropModule(e, m.id, selectedCourseId!)}
                      style={{ 
                        backgroundColor: "rgba(7, 7, 50, 0.25)", 
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "4px",
                        overflow: "hidden",
                        opacity: draggedModuleId === m.id ? 0.5 : 1
                      }}
                    >\`
);

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


// 2. Update Lesson Checkbox
content = content.replace(
  \`<span style={{ 
                                      width: "14px", 
                                      height: "14px", 
                                      border: "1.5px solid rgba(194, 194, 245, 0.4)", 
                                      borderRadius: "2px",
                                      display: "inline-block"
                                    }} />\`,
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

// 3. Inject Bulk Bar before the final return closing divs
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
content = content.replace(/    <\/div>\s*<\/div>\s*\);\s*}\s*$/ms, bulkBar);

fs.writeFileSync(pagePath, content);
console.log("Refactor 2 completed!");
