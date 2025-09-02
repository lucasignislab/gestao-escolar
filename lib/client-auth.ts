// lib/client-auth.ts

/**
 * Função para obter o perfil do usuário atual no lado do cliente
 * Esta função faz uma chamada para a API route
 */
export async function getCurrentUserProfileClient() {
  try {
    const response = await fetch('/api/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // Usuário não autenticado
      }
      throw new Error('Erro ao buscar perfil');
    }

    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }
}