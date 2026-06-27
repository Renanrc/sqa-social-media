// Funções usadas para renderizar a página, interagir com os campos
// e esperar comportamentos assíncronos acontecerem.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import PaginaLogin from '@/app/signin/page';
import { AxiosError } from 'axios';

// Mock da navegação.
// Assim conseguimos verificar se houve redirecionamento sem trocar de página de verdade.
const navegarPara = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: navegarPara }),
}));

// Mock do contexto de autenticação.
// O foco destes testes é a tela de login, não o contexto em si.
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

// Simula o Header para evitar dependências desnecessárias nos testes.
jest.mock('@/components/Header', () => () => <header data-testid="cabecalho-simulado" />);

// Mock do serviço responsável por autenticar o usuário.
jest.mock('@/service/auth/auth', () => ({
  authService: {
    signIn: jest.fn(),
  },
}));

import { authService } from '@/service/auth/auth';

// Helper para criar erros parecidos com os retornados pela API.
// Facilita testar mensagens de erro sem precisar fazer requisições reais.
function criarErroApi(mensagem: string, status: number): AxiosError {
  return new AxiosError(
    mensagem,
    String(status),
    undefined,
    undefined,
    {
      data: { message: mensagem },
      status,
      statusText: String(status),
      headers: {},
      config: { headers: {} } as never,
    } as never
  );
}

describe('Tela de Login — fluxo de integração', () => {
  beforeEach(() => {
    // Garante que cada teste comece "limpo".
    jest.clearAllMocks();
  });

  it('bloqueia o envio e avisa quando o campo de e-mail está em branco', async () => {
    render(<PaginaLogin />);

    // Tenta entrar sem preencher nada.
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      // A validação deve informar que o e-mail é obrigatório.
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    });
  });

  it('bloqueia o envio e avisa quando o campo de senha está em branco', async () => {
    render(<PaginaLogin />);

    // Preenche apenas o e-mail.
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'renan@teste.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      // O sistema deve exigir a senha antes de continuar.
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });
  });

  it('apresenta a mensagem da API quando as credenciais estão erradas', async () => {
    // Simula resposta de erro do backend.
    (authService.signIn as jest.Mock).mockRejectedValue(
      criarErroApi('Credenciais inválidas', 401)
    );

    render(<PaginaLogin />);

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'renan@teste.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'senhaErrada' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      // A mensagem retornada pela API deve aparecer para o usuário.
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });

  it('redireciona para a página inicial após login realizado com sucesso', async () => {
    // Simula login bem sucedido.
    (authService.signIn as jest.Mock).mockResolvedValue({
      id: 5,
      email: 'renan@teste.com',
    });

    render(<PaginaLogin />);

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'renan@teste.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Renan@2024' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      // Após autenticar com sucesso, deve voltar para a página inicial.
      expect(navegarPara).toHaveBeenCalledWith('/');
    });
  });
});