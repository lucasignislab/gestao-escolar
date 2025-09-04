// lib/schemas.ts
import { z } from 'zod';

/**
 * Esquema de validação para a entidade Professor
 * Utiliza Zod para validação de tipos e regras de negócio
 */
// Schema para o Profile (dados comuns a todos os tipos de usuário)
export const profileSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  role: z.enum(['ADMIN', 'PROFESSOR', 'ALUNO', 'RESPONSAVEL']),
  avatarUrl: z.string().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const professorSchema = z.object({
  id: z.string().optional(), // Opcional, usado apenas para edição
  name: z.string().min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),
  surname: z.string().min(3, { message: 'O sobrenome deve ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  phone: z.string().optional(), // Campo opcional para telefone
  avatarUrl: z.string().optional(), // URL da imagem do avatar
});

/**
 * Tipo TypeScript inferido do esquema de validação do Professor
 * Usado para tipagem em formulários e componentes
 */
export type ProfessorFormData = z.infer<typeof professorSchema>;

/**
 * Esquema específico para criação de professor (sem ID)
 * Remove o campo ID que é gerado automaticamente pelo banco
 */
export const createProfessorSchema = professorSchema.omit({ id: true });

/**
 * Esquema específico para atualização de professor (ID obrigatório)
 * Torna o campo ID obrigatório para operações de edição
 */
export const updateProfessorSchema = professorSchema.extend({
  id: z.string().min(1, { message: 'ID é obrigatório para atualização.' }),
});

/**
 * Tipos TypeScript para operações específicas
 */
export type CreateProfessorData = z.infer<typeof createProfessorSchema>;
export type UpdateProfessorData = z.infer<typeof updateProfessorSchema>;

/**
 * Esquema para validação de parâmetros de busca
 * Usado em APIs de listagem e filtros
 */
export const professorSearchSchema = z.object({
  page: z.string().optional().default('1'),
  search: z.string().optional().default(''),
  limit: z.string().optional().default('10'),
});

export type ProfessorSearchParams = z.infer<typeof professorSearchSchema>;

/**
 * Esquema para resposta da API de listagem de professores
 * Define a estrutura de retorno das APIs
 */
export const professorListResponseSchema = z.object({
  professores: z.array(professorSchema),
  total: z.number(),
  pagina: z.number(),
  totalPaginas: z.number(),
});

export type ProfessorListResponse = z.infer<typeof professorListResponseSchema>;

/**
 * Esquema de validação para a entidade Aluno
 * Utiliza Zod para validação de tipos e regras de negócio
 */
export const alunoSchema = z.object({
  id: z.string().optional(), // Opcional, usado apenas para edição
  name: z.string().min(2, { message: 'O nome deve ter no mínimo 2 caracteres.' }),
  surname: z.string().min(2, { message: 'O sobrenome deve ter no mínimo 2 caracteres.' }),
  parentId: z.string().min(1, { message: 'Responsável é obrigatório.' }),
  classId: z.string().min(1, { message: 'Turma é obrigatória.' }),
  gradeId: z.string().min(1, { message: 'Ano escolar é obrigatório.' }),
});

/**
 * Tipo TypeScript inferido do esquema de validação do Aluno
 * Usado para tipagem em formulários e componentes
 */
export type AlunoFormData = z.infer<typeof alunoSchema>;

/**
 * Esquema específico para criação de aluno (sem ID)
 * Remove o campo ID que é gerado automaticamente pelo banco
 */
export const createAlunoSchema = alunoSchema.omit({ id: true });

/**
 * Esquema específico para atualização de aluno (ID obrigatório)
 * Torna o campo ID obrigatório para operações de edição
 */
export const updateAlunoSchema = alunoSchema.extend({
  id: z.string().min(1, { message: 'ID é obrigatório para atualização.' }),
});

/**
 * Tipos TypeScript para operações específicas
 */
export type CreateAlunoData = z.infer<typeof createAlunoSchema>;
export type UpdateAlunoData = z.infer<typeof updateAlunoSchema>;

/**
 * Esquema para validação de parâmetros de busca de alunos
 * Usado em APIs de listagem e filtros
 */
export const alunoSearchSchema = z.object({
  page: z.string().optional().default('1'),
  search: z.string().optional().default(''),
  limit: z.string().optional().default('10'),
});

/**
 * Tipo para parâmetros de busca de alunos
 */
export type AlunoSearchParams = z.infer<typeof alunoSearchSchema>;

/**
 * Esquema para resposta da listagem de alunos
 * Define a estrutura de retorno das APIs de listagem
 */
export const alunoListResponseSchema = z.object({
  alunos: z.array(alunoSchema),
  total: z.number(),
  pagina: z.number(),
  totalPaginas: z.number(),
});

export type AlunoListResponse = z.infer<typeof alunoListResponseSchema>;

/**
 * Esquema de validação para a entidade Turma
 * Utiliza Zod para validação de tipos e regras de negócio
 */
export const turmaSchema = z.object({
  id: z.string().optional(), // Opcional, usado apenas para edição
  name: z.string().min(2, { message: "O nome da turma deve ter no mínimo 2 caracteres." }),
  capacity: z.coerce.number().min(1, { message: "A capacidade deve ser de no mínimo 1." }),
  gradeId: z.string().min(1, { message: "Selecione um ano escolar." }),
  supervisorId: z.string().min(1, { message: "Selecione um professor supervisor." }),
});

/**
 * Tipo TypeScript inferido do esquema de validação da Turma
 * Usado para tipagem em formulários e componentes
 */
export type TurmaFormData = z.infer<typeof turmaSchema>;

/**
 * Esquema específico para criação de turma (sem ID)
 * Remove o campo ID que é gerado automaticamente pelo banco
 */
export const createTurmaSchema = turmaSchema.omit({ id: true });

/**
 * Esquema específico para atualização de turma (ID obrigatório)
 * Torna o campo ID obrigatório para operações de edição
 */
export const updateTurmaSchema = turmaSchema.extend({
  id: z.string().min(1, { message: 'ID é obrigatório para atualização.' }),
});

/**
 * Tipos TypeScript para operações específicas
 */
export type CreateTurmaData = z.infer<typeof createTurmaSchema>;
export type UpdateTurmaData = z.infer<typeof updateTurmaSchema>;

/**
 * Esquema para validação de parâmetros de busca
 * Usado em APIs de listagem e filtros
 */
export const turmaSearchSchema = z.object({
  page: z.string().optional().default('1'),
  search: z.string().optional().default(''),
  limit: z.string().optional().default('10'),
  gradeId: z.string().optional(), // Filtro por ano escolar
});

/**
 * Tipo TypeScript para parâmetros de busca
 */
export type TurmaSearchParams = z.infer<typeof turmaSearchSchema>;

/**
 * Esquema para resposta de listagem de turmas
 * Define a estrutura de retorno das APIs de listagem
 */
export const turmaListResponseSchema = z.object({
  turmas: z.array(turmaSchema),
  total: z.number(),
  pagina: z.number(),
  totalPaginas: z.number(),
});

export type TurmaListResponse = z.infer<typeof turmaListResponseSchema>;

/**
 * Esquema de validação para a entidade Matéria
 * Utiliza Zod para validação de tipos e regras de negócio
 */
export const materiaSchema = z.object({
  id: z.string().optional(), // Opcional, usado apenas para edição
  name: z.string().min(2, { message: 'O nome da matéria deve ter no mínimo 2 caracteres.' }),
  teacherIds: z.array(z.string()).min(1, { message: 'Pelo menos um professor deve ser selecionado.' }),
});

/**
 * Tipo TypeScript inferido do esquema de validação da Matéria
 * Usado para tipagem em formulários e componentes
 */
export type MateriaFormData = z.infer<typeof materiaSchema>;

/**
 * Esquema específico para criação de matéria (sem ID)
 * Remove o campo ID que é gerado automaticamente pelo banco
 */
export const createMateriaSchema = materiaSchema.omit({ id: true });

/**
 * Esquema específico para atualização de matéria (ID obrigatório)
 * Torna o campo ID obrigatório para operações de edição
 */
export const updateMateriaSchema = materiaSchema.extend({
  id: z.string().min(1, { message: 'ID é obrigatório para atualização.' }),
});

/**
 * Tipos TypeScript para operações específicas
 */
export type CreateMateriaData = z.infer<typeof createMateriaSchema>;
export type UpdateMateriaData = z.infer<typeof updateMateriaSchema>;

/**
 * Esquema para validação de parâmetros de busca de matérias
 * Usado em APIs de listagem e filtros
 */
export const materiaSearchSchema = z.object({
  page: z.string().optional().default('1'),
  search: z.string().optional().default(''),
  limit: z.string().optional().default('10'),
});

/**
 * Tipo TypeScript para parâmetros de busca de matérias
 */
export type MateriaSearchParams = z.infer<typeof materiaSearchSchema>;

/**
 * Esquema para resposta de listagem de matérias
 * Define a estrutura de retorno das APIs de listagem
 */
export const materiaListResponseSchema = z.object({
  materias: z.array(materiaSchema),
  total: z.number(),
  pagina: z.number(),
  totalPaginas: z.number(),
});

export type MateriaListResponse = z.infer<typeof materiaListResponseSchema>;

/**
 * Esquema de validação para a entidade Responsável
 * Utiliza Zod para validação de tipos e regras de negócio
 */
export const responsavelSchema = z.object({
  id: z.string().optional(), // Opcional, usado apenas para edição
  name: z.string().min(2, { message: 'O nome deve ter no mínimo 2 caracteres.' }),
  surname: z.string().min(2, { message: 'O sobrenome deve ter no mínimo 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
});

/**
 * Tipo TypeScript inferido do esquema de validação do Responsável
 * Usado para tipagem em formulários e componentes
 */
export type ResponsavelFormData = z.infer<typeof responsavelSchema>;

/**
 * Esquema específico para criação de responsável (sem ID)
 * Remove o campo ID que é gerado automaticamente pelo banco
 */
export const createResponsavelSchema = responsavelSchema.omit({ id: true });

/**
 * Esquema específico para atualização de responsável (ID obrigatório)
 * Torna o campo ID obrigatório para operações de edição
 */
export const updateResponsavelSchema = responsavelSchema.extend({
  id: z.string().min(1, { message: 'ID é obrigatório para atualização.' }),
});

/**
 * Tipos TypeScript para operações específicas
 */
export type CreateResponsavelData = z.infer<typeof createResponsavelSchema>;
export type UpdateResponsavelData = z.infer<typeof updateResponsavelSchema>;

/**
 * Esquema para validação de parâmetros de busca
 * Usado em APIs de listagem e filtros
 */
export const responsavelSearchSchema = z.object({
  page: z.string().optional().default('1'),
  search: z.string().optional().default(''),
  limit: z.string().optional().default('10'),
});

export type ResponsavelSearchParams = z.infer<typeof responsavelSearchSchema>;

/**
 * Esquema para resposta da API de listagem de responsáveis
 * Define a estrutura de retorno das APIs
 */
export const responsavelListResponseSchema = z.object({
  responsaveis: z.array(responsavelSchema),
  total: z.number(),
  pagina: z.number(),
  totalPaginas: z.number(),
});

export type ResponsavelListResponse = z.infer<typeof responsavelListResponseSchema>;

/**
 * Esquema de validação para a entidade Administrador
 * Utiliza Zod para validação de tipos e regras de negócio
 * Administradores são gerenciados diretamente na tabela Profile
 */
export const administradorSchema = z.object({
  id: z.string().optional(), // Opcional, usado apenas para edição
  username: z.string().min(3, { message: 'O nome de usuário deve ter no mínimo 3 caracteres.' }),
});

/**
 * Tipo TypeScript inferido do esquema de validação do Administrador
 * Usado para tipagem em formulários e componentes
 */
export type AdministradorFormData = z.infer<typeof administradorSchema>;

/**
 * Esquema específico para criação de administrador (sem ID)
 * Remove o campo ID que é gerado automaticamente pelo banco
 */
export const createAdministradorSchema = administradorSchema.omit({ id: true });

/**
 * Esquema específico para atualização de administrador (ID obrigatório)
 * Torna o campo ID obrigatório para operações de edição
 */
export const updateAdministradorSchema = administradorSchema.extend({
  id: z.string().min(1, { message: 'ID é obrigatório para atualização.' }),
});

/**
 * Tipos TypeScript para operações específicas
 */
export type CreateAdministradorData = z.infer<typeof createAdministradorSchema>;
export type UpdateAdministradorData = z.infer<typeof updateAdministradorSchema>;

/**
 * Esquema para validação de parâmetros de busca
 * Usado em APIs de listagem e filtros
 */
export const administradorSearchSchema = z.object({
  page: z.string().optional().default('1'),
  search: z.string().optional().default(''),
  limit: z.string().optional().default('10'),
});

export type AdministradorSearchParams = z.infer<typeof administradorSearchSchema>;

/**
 * Esquema para resposta da API de listagem de administradores
 * Define a estrutura de retorno das APIs
 */
export const administradorListResponseSchema = z.object({
  administradores: z.array(administradorSchema),
  total: z.number(),
  pagina: z.number(),
  totalPaginas: z.number(),
});

export type AdministradorListResponse = z.infer<typeof administradorListResponseSchema>;