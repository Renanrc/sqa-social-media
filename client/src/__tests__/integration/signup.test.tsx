// Ferramentas usadas para renderizar a tela, preencher campos
// e aguardar operações assíncronas terminarem.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import PaginaCadastro from '@/app/signup/page';
import { AxiosError } from 'axios';

// Mock da navegação para podermos verificar redirecionamentos.
const navegarPara = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: navegarPara }),
}));

// Mock do contexto de autenticação.
// Não precisamos testar o contexto aqui, apenas a tela.
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

// Simula o Header para evitar dependências externas nos testes.
jest.mock('@/components/Header', () => () => <header data-testid="cabecalho-simulado" />);

// Mock do serviço de cadastro.
jest.mock('@/service/auth/auth', () => ({
  authService: {
    signUp: jest.fn(),
  },
}));

import { authService } from '@/service/auth/auth';

// Helper para preencher o formulário rapidamente.
// Evita repetir o mesmo código em vários testes.
function preencherFormulario(
  email = 'renan@cadastro.com',
  senha = 'Renan@2024'
) {
  fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
    target: { value: email },
  });

  const campos = screen.getAllByPlaceholderText('••••••••');

  fireEvent.change(campos[0], {
    target: { value: senha },
  });

  fireEvent.change(campos[1], {
    target: { value: senha },
  });
}

describe('Tela de Cadastro — fluxo de integração', () => {
  beforeEach(() => {
    // Garante que nenhum mock de um teste interfira no próximo.
    jest.clearAllMocks();
  });

  it('exige que o campo de e-mail seja preenchido antes de enviar', async () => {
    render(<PaginaCadastro />);

    // Tenta cadastrar sem preencher nada.
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      // O formulário deve impedir o envio e mostrar a validação.
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    });
  });

  it('redireciona para a raiz após cadastro concluído com sucesso', async () => {
    // Simula resposta positiva da API.
    (authService.signUp as jest.Mock).mockResolvedValue({
      id: 10,
      email: 'renan@cadastro.com',
    });

    render(<PaginaCadastro />);

    preencherFormulario();

    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      // Após criar a conta, o usuário deve ser enviado para a home.
      expect(navegarPara).toHaveBeenCalledWith('/');
    });
  });

  /*
   * BUG identificado durante os testes
   *
   * Regra esperada:
   * Quando o e-mail já existir, deve aparecer:
   * "E-mail já cadastrado"
   *
   * O que acontece atualmente:
   * A API retorna "E-mail já cadastrado"
   * e a tela exibe exatamente essa mensagem.
   *
   * Este teste foi criado para documentar o problema.
   */
  it('[BUG] exibe "E-mail já cadastrado" para e-mail já existente na base', async () => {
    const erroConflito = new AxiosError(
      'Conflict',
      '409',
      undefined,
      undefined,
      {
        data: {
          message: 'E-mail já cadastrado',
        },
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config: { headers: {} } as never,
      } as never
    );

    // Simula a API retornando conflito de cadastro.
    (authService.signUp as jest.Mock).mockRejectedValue(erroConflito);

    render(<PaginaCadastro />);

    preencherFormulario();

    fireEvent.click(screen.getByRole('button', {
      name: /criar conta/i,
    }));

    await waitFor(() => {
      // O teste falha de propósito para registrar a divergência.
      expect(screen.getByText('E-mail já cadastrado')).toBeInTheDocument();
    });
  });
});