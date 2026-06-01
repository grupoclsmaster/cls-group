import fs from 'fs';
import path from 'path';

const pagePath = path.resolve('src/app/(app)/admin/painel/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

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

fs.writeFileSync(pagePath, content);
console.log("Renaming done!");
