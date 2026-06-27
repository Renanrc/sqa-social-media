// Ferramentas que vamos usar para renderizar o componente,
// procurar elementos na tela e simular cliques.
import { render, screen, fireEvent } from '@testing-library/react';

// Componente que será testado.
import Header from '@/components/Header';

// Simula a navegação do Next.js.
// Em vez de trocar de página de verdade, vamos apenas verificar se foi chamado.
const irPara = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: irPara }),
}));

// Mock do contexto de autenticação.
// Assim conseguimos fingir que o usuário está logado ou não.
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';

// Função auxiliar para evitar repetir código.
// Basta informar se o usuário está logado ou não.
function configurarAuth(logado: boolean) {
  (useAuth as jest.Mock).mockReturnValue({
    isAuthenticated: logado,
    logout: jest.fn(),
  });
}

describe('Componente Header', () => {
  // Limpa os mocks após cada teste para um não atrapalhar o outro.
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sempre exibe o título da aplicação', () => {
    configurarAuth(false);

    render(<Header />);

    // O nome da aplicação deve aparecer independente do login.
    expect(screen.getByText('SQA Social Media')).toBeInTheDocument();
  });

  it('clicar no título leva o usuário para a página inicial', () => {
    configurarAuth(false);

    render(<Header />);

    // Simula o clique no título.
    fireEvent.click(screen.getByText('SQA Social Media'));

    // Deve redirecionar para a home.
    expect(irPara).toHaveBeenCalledWith('/');
  });

  describe('quando o usuário não está logado', () => {
    beforeEach(() => configurarAuth(false));

    it('mostra os botões de acesso: Entrar e Criar Conta', () => {
      render(<Header />);

      // Visitantes precisam ver as opções para acessar o sistema.
      expect(screen.getByText('Entrar')).toBeInTheDocument();
      expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    });

    it('esconde os botões exclusivos de usuário logado', () => {
      render(<Header />);

      // Quem não fez login não deve ver essas opções.
      expect(screen.queryByText('Posts Curtidos')).not.toBeInTheDocument();
      expect(screen.queryByText('Sair')).not.toBeInTheDocument();
    });
  });

  describe('quando o usuário está logado', () => {
    beforeEach(() => configurarAuth(true));

    it('mostra os botões Posts Curtidos e Sair', () => {
      render(<Header />);

      // Essas opções só fazem sentido para quem está autenticado.
      expect(screen.getByText('Posts Curtidos')).toBeInTheDocument();
      expect(screen.getByText('Sair')).toBeInTheDocument();
    });

    it('esconde os botões de login e cadastro', () => {
      render(<Header />);

      // Como o usuário já entrou no sistema, não precisa ver essas opções.
      expect(screen.queryByText('Entrar')).not.toBeInTheDocument();
      expect(screen.queryByText('Criar Conta')).not.toBeInTheDocument();
    });

    it('Posts Curtidos leva para a rota /auth/liked', () => {
      render(<Header />);

      // Clica no botão de curtidos.
      fireEvent.click(screen.getByText('Posts Curtidos'));

      // Confirma se a navegação ocorreu para a página correta.
      expect(irPara).toHaveBeenCalledWith('/auth/liked');
    });
  });
});