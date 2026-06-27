// Ferramentas para renderizar componentes, buscar elementos na tela
// e simular ações do usuário.
import { render, screen, fireEvent } from '@testing-library/react';

import PostCard from '@/components/PostCard';
import { Post } from '@/service/types';

// Post padrão usado na maioria dos testes.
const postSemCurtida: Post = {
  id: 42,
  title: 'Título do Post de Exemplo',
  body: 'Este é o corpo de um post usado nos testes do PostCard.',
  liked: false,
};

// Mesmo post acima, mas marcado como curtido.
const postJaCurtido: Post = {
  ...postSemCurtida,
  liked: true,
};

describe('PostCard — exibição do conteúdo', () => {
  it('renderiza o título do post na tela', () => {
    render(<PostCard post={postSemCurtida} isAuthenticated={false} onLike={jest.fn()} />);

    // O usuário deve conseguir visualizar o título normalmente.
    expect(screen.getByText('Título do Post de Exemplo')).toBeInTheDocument();
  });

  it('renderiza o corpo do post na tela', () => {
    render(<PostCard post={postSemCurtida} isAuthenticated={false} onLike={jest.fn()} />);

    // Verifica se o conteúdo do post está aparecendo.
    expect(
      screen.getByText('Este é o corpo de um post usado nos testes do PostCard.')
    ).toBeInTheDocument();
  });

  it('mostra o texto "Curtir" quando o post ainda não foi curtido', () => {
    render(<PostCard post={postSemCurtida} isAuthenticated={true} onLike={jest.fn()} />);

    // Se o usuário ainda não curtiu, o botão deve convidar para curtir.
    expect(screen.getByText('Curtir')).toBeInTheDocument();
  });

  it('mostra o texto "Curtido" quando o post já foi curtido pelo usuário', () => {
    render(<PostCard post={postJaCurtido} isAuthenticated={true} onLike={jest.fn()} />);

    // Quando já existe curtida, o texto muda para indicar isso.
    expect(screen.getByText('Curtido')).toBeInTheDocument();
  });
});

describe('PostCard — comportamento do botão Curtir', () => {
  it('exibe alerta pedindo autenticação quando usuário não está logado', () => {
    // Espiona o alert para verificar se a mensagem foi exibida.
    const alertaSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    const fnCurtir = jest.fn();

    render(<PostCard post={postSemCurtida} isAuthenticated={false} onLike={fnCurtir} />);

    // Simula o clique no botão de curtir.
    fireEvent.click(screen.getByRole('button'));

    // Usuário deslogado deve receber aviso para fazer login.
    expect(alertaSpy).toHaveBeenCalledWith(
      'Você precisa estar autenticado para curtir posts!'
    );

    // A função de curtir não pode ser executada nesse caso.
    expect(fnCurtir).not.toHaveBeenCalled();

    alertaSpy.mockRestore();
  });

  it('dispara a função de curtir com o id correto quando o usuário está logado', () => {
    const fnCurtir = jest.fn().mockResolvedValue(undefined);

    render(<PostCard post={postSemCurtida} isAuthenticated={true} onLike={fnCurtir} />);

    // Simula o clique do usuário no botão Curtir.
    fireEvent.click(screen.getByRole('button'));

    // Confirma se o componente enviou o ID correto para a função.
    expect(fnCurtir).toHaveBeenCalledWith(42);
  });
});