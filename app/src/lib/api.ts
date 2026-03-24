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
  pagina_atual: number;
  total_resultados_nesta_pagina: number;
  resultados: SearchResult[];
}

export interface SourceHealth {
  name: string;
  platform: string;
  timeMs: number;
  status: 'Online' | 'Offline' | 'Timeout' | 'Vazio/Bloqueado';
  count: number;
}

/**
 * URL base da API.
 * Recupera das variaveis de ambiente ou usa fallback.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Realiza uma busca na API.
 * 
 * @param query O texto a ser buscado.
 * @param page A pagina de resultados
 * @returns Uma promessa que resolve para os resultados da busca.
 * @throws Erro se a requisição falhar.
 */
export async function searchLostMedia(query: string, page: number = 1, mode: 'quick' | 'deep' = 'deep'): Promise<SearchResponse> {
  if (!query.trim()) {
    throw new Error('O termo de busca não pode estar vazio.');
  }

  try {
    const url = new URL(`${API_BASE_URL}/search`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('mode', mode);

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
    throw new Error('Erro desconhecido ao buscar arquivos.');
  }
}

/**
 * Realiza uma busca em stream usando Server-Sent Events (SSE).
 * Melhora a percepção de velocidade desenhando os resultados na tela
 * assim que o primeiro scraper os encontra.
 */
export function searchLostMediaStream(
  query: string, 
  page: number = 1, 
  mode: 'quick' | 'deep' = 'deep',
  onMessage: (data: any) => void,
  onComplete: () => void,
  onError: (err: Error) => void
): () => void {
  if (!query.trim()) {
    onError(new Error('O termo de busca não pode estar vazio.'));
    return () => {};
  }

  const url = new URL(`${API_BASE_URL}/search`);
  url.searchParams.append('query', query);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('mode', mode);

  // Fallback to Native EventSource
  const eventSource = new EventSource(url.toString());

  eventSource.addEventListener('results', (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('Falha ao dar parse no pedaço do stream', e);
    }
  });

  eventSource.addEventListener('end', () => {
    eventSource.close();
    onComplete();
  });

  eventSource.addEventListener('error', (event: any) => {
    // If it's a custom error from our backend (has data payload)
    if (event.data) {
      try {
        const data = JSON.parse(event.data);
        onError(new Error(data.error || 'Erro na conexão do Stream'));
      } catch (e) {
        onError(new Error('Erro na conexão do Stream'));
      }
    } else {
      // It's a generic connection error (e.g timeout/cors).
      // EventSource tries to seamlessly reconnect. We should close it if this fails heavily,
      // but let's just surface it and end.
      onError(new Error('Conexão perdida com o motor de busca.'));
    }
    eventSource.close();
  });

  // Return abort function for react unmounts or early cancellation
  return () => {
    eventSource.close();
  };
}

/**
 * Busca sugestões de autocompletar da API.
 * 
 * @param query O texto digitado.
 * @returns Uma promessa que resolve para um array de strings.
 */
export async function getAutocomplete(query: string): Promise<string[]> {
  if (!query.trim()) return [];
  
  try {
    const url = new URL(`${API_BASE_URL}/autocomplete`);
    url.searchParams.append('q', query.trim());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
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

/**
 * Dispara uma verificação real-time para as 11 fontes simultâneas e mensura a latência
 */
export async function checkSourcesHealth(): Promise<SourceHealth[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/health/sources`, {
      method: 'GET',
    });
    
    if (!response.ok) throw new Error('Falha ao auditar as Fontes.');
    
    const data = await response.json();
    return data.data || [];
} catch (error) {
    throw new Error('Erro de conexão no diagnóstico.');
  }
}

export interface SystemStats {
  totalSearches: number;
  totalSources: number;
  verificationStatus: boolean;
}

/**
 * Obtém estatísticas globais do sistema.
 */
export async function getSystemStats(): Promise<SystemStats | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Falha ao obter as estatísticas do sistema.', error);
    return null;
  }
}
