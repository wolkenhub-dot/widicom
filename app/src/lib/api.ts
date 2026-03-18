/**
 * api.ts
 * 
 * Serviço para consumir a API de Lost Media.
 * Configurável para diferentes endpoints de API.
 */

export interface SearchResult {
  titulo: string;
  plataforma: string;
  url_original: string;
  url_download_direto: string | null;
  status: 'Ativo' | 'Inativo' | 'Desconhecido';
}

export interface SearchResponse {
  query: string;
  total_resultados: number;
  resultados: SearchResult[];
}

/**
 * URL base da API de Lost Media.
 * Pode ser configurada via variável de ambiente VITE_API_URL
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Realiza uma busca na API de Lost Media.
 * 
 * @param query O termo de busca.
 * @returns Uma promessa que resolve para os resultados da busca.
 * @throws Erro se a requisição falhar.
 */
export async function searchLostMedia(query: string): Promise<SearchResponse> {
  if (!query.trim()) {
    throw new Error('O termo de busca não pode estar vazio.');
  }

  try {
    const url = new URL(`${API_BASE_URL}/search`);
    url.searchParams.append('query', query);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Erro na API: ${response.status} ${response.statusText}`
      );
    }

    const data: SearchResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao buscar Lost Media.');
  }
}

/**
 * Verifica a disponibilidade da API.
 * 
 * @returns Uma promessa que resolve para true se a API está disponível.
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
